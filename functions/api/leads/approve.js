import {
  appendOfficeFinderAttempt,
  escapeHtml,
  getLead,
  getMissingOfficeFinderFields,
  htmlResponse,
  sendBrokerLeadEmail,
  submitToOfficeFinder,
  updateLeadStatus,
  verifyLeadToken,
} from "./_shared.js";

function getApprovalTargets(routeParam, routeRecommendation) {
  if (routeParam === "officefinder") return ["officefinder"];
  if (routeParam === "broker") return ["broker"];

  const recommended = routeRecommendation.route_to || "officefinder";
  if (recommended === "both") return ["officefinder", "broker"];
  if (recommended === "broker") return ["broker"];
  return ["officefinder"];
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const token = url.searchParams.get("token");
  const routeParam = url.searchParams.get("route") || "recommended";

  if (!id || !token) {
    return htmlResponse("<h1>Missing approval link fields</h1>", 400);
  }

  try {
    const record = await getLead(env, id);
    if (!record || !(await verifyLeadToken(record, token))) {
      return htmlResponse("<h1>Invalid or expired approval link</h1>", 403);
    }

    if (["approved_sent", "broker_sent", "both_sent", "partial_sent"].includes(record.status)) {
      return htmlResponse("<h1>Lead already approved and sent</h1><p>No duplicate submission was made.</p>");
    }

    if (record.status === "rejected") {
      return htmlResponse("<h1>Lead already rejected</h1><p>No submission was made.</p>", 409);
    }

    const routeRecommendation = record.lead.route_recommendation || { route_to: "officefinder" };
    const targets = getApprovalTargets(routeParam, routeRecommendation);
    const results = [];
    const failures = [];

    if (targets.includes("officefinder")) {
      const missing = getMissingOfficeFinderFields(record.officefinder_payload);
      if (missing.length) {
        const attempt = {
          lead_id: id,
          attempted_at: new Date().toISOString(),
          officefinder_mode: routeRecommendation.officefinder_mode || "",
          request_payload: record.officefinder_payload,
          response_status: 0,
          response_body: "",
          success: false,
          error: `Missing OfficeFinder fields: ${missing.join(", ")}`,
        };
        const lead = await appendOfficeFinderAttempt(env, record, attempt);
        record.lead = lead;
        failures.push(attempt.error);

        if (!targets.includes("broker")) {
          await updateLeadStatus(env, id, {
            status: "approved_send_failed",
            lead,
            approval_error: attempt.error,
          });
          return htmlResponse(
            `<h1>Lead not sent</h1><p>${escapeHtml(attempt.error)}</p>`,
            422
          );
        }
      }
    }

    if (targets.includes("officefinder") && !failures.length) {
      const result = await submitToOfficeFinder(env, record.officefinder_payload);
      const attempt = {
        lead_id: id,
        attempted_at: new Date().toISOString(),
        officefinder_mode: routeRecommendation.officefinder_mode || "",
        request_payload: record.officefinder_payload,
        response_status: result.status,
        response_body: result.body,
        success: result.ok,
        error: result.error || "",
      };
      const lead = await appendOfficeFinderAttempt(env, record, attempt);
      record.lead = lead;

      if (!result.ok) {
        failures.push(attempt.error || `OfficeFinder returned HTTP ${result.status}`);
      } else {
        results.push(`OfficeFinder: submitted to ${result.endpoint}`);
      }
    }

    if (targets.includes("broker") && !routeRecommendation.broker_email) {
      await updateLeadStatus(env, id, {
        status: results.length ? "partial_sent" : "approved_send_failed",
        approval_error: "Broker approval requested, but no broker email exists for the matched route.",
      });
      return htmlResponse("<h1>Lead not sent</h1><p>No broker email exists for this route.</p>", 422);
    }

    if (targets.includes("broker")) {
      const brokerResult = await sendBrokerLeadEmail(env, record);
      if (!brokerResult.sent) {
        failures.push(`Broker email failed: ${brokerResult.reason}`);
      } else {
        results.push(`Broker: sent to ${routeRecommendation.broker_name || routeRecommendation.broker_email}`);
      }
    }

    if (!results.length && failures.length) {
      await updateLeadStatus(env, id, {
        status: "approved_send_failed",
        approval_error: failures.join("\n"),
      });
      return htmlResponse(
        `<h1>Lead approval failed</h1><p>${escapeHtml(failures.join(" "))}</p>`,
        502
      );
    }

    const nextStatus = failures.length
      ? "partial_sent"
      : targets.includes("officefinder") && targets.includes("broker")
        ? "both_sent"
        : targets.includes("broker") ? "broker_sent" : "approved_sent";

    await updateLeadStatus(env, id, {
      status: nextStatus,
      lead: record.lead,
      officefinder_response: [...results, ...failures].join("\n"),
      approval_error: failures.join("\n"),
      sent_at: new Date().toISOString(),
    });

    return htmlResponse(
      `<h1>Lead approved and sent</h1><p>${escapeHtml(results.join(" "))}</p>${failures.length ? `<p>Some routing failed: ${escapeHtml(failures.join(" "))}</p>` : ""}`
    );
  } catch (error) {
    return htmlResponse(`<h1>Approval failed</h1><p>${escapeHtml(error.message)}</p>`, 500);
  }
}
