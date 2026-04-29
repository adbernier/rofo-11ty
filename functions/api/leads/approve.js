import {
  escapeHtml,
  getLead,
  getMissingOfficeFinderFields,
  htmlResponse,
  submitToOfficeFinder,
  updateLeadStatus,
  verifyLeadToken,
} from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const token = url.searchParams.get("token");

  if (!id || !token) {
    return htmlResponse("<h1>Missing approval link fields</h1>", 400);
  }

  try {
    const record = await getLead(env, id);
    if (!record || !(await verifyLeadToken(record, token))) {
      return htmlResponse("<h1>Invalid or expired approval link</h1>", 403);
    }

    if (record.status === "approved_sent") {
      return htmlResponse("<h1>Lead already approved and sent</h1><p>No duplicate submission was made.</p>");
    }

    if (record.status === "rejected") {
      return htmlResponse("<h1>Lead already rejected</h1><p>No submission was made.</p>", 409);
    }

    const missing = getMissingOfficeFinderFields(record.officefinder_payload);
    if (missing.length) {
      await updateLeadStatus(env, id, {
        status: "approval_failed",
        approval_error: `Missing OfficeFinder fields: ${missing.join(", ")}`,
      });
      return htmlResponse(
        `<h1>Lead not sent</h1><p>Missing OfficeFinder fields: ${escapeHtml(missing.join(", "))}</p>`,
        422
      );
    }

    const result = await submitToOfficeFinder(env, record.officefinder_payload);
    if (!result.ok) {
      await updateLeadStatus(env, id, {
        status: "approval_failed",
        officefinder_response: result.body,
        approval_error: `OfficeFinder returned HTTP ${result.status}`,
      });
      return htmlResponse(
        `<h1>OfficeFinder test submission failed</h1><p>Status: ${result.status}</p><pre>${escapeHtml(result.body)}</pre>`,
        502
      );
    }

    await updateLeadStatus(env, id, {
      status: "approved_sent",
      officefinder_response: result.body,
      sent_at: new Date().toISOString(),
    });

    return htmlResponse(
      `<h1>Lead approved and sent</h1><p>Submitted to OfficeFinder ${escapeHtml(result.endpoint)}.</p><pre>${escapeHtml(result.body)}</pre>`
    );
  } catch (error) {
    return htmlResponse(`<h1>Approval failed</h1><p>${escapeHtml(error.message)}</p>`, 500);
  }
}
