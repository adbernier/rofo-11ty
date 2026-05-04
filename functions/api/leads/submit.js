import {
  buildLeadPayload,
  buildOfficeFinderPayload,
  detectLeadSpam,
  getMissingSubmitFields,
  jsonResponse,
  logLeadToGoogleSheets,
  randomHex,
  readSubmittedFields,
  redirectResponse,
  resolveLeadRoute,
  saveLead,
  sendApprovalEmail,
  sha256,
} from "./_shared.js";

export async function onRequestPost({ request, env }) {
  let fields;

  try {
    fields = await readSubmittedFields(request);
  } catch (error) {
    return jsonResponse({ error: "Unable to parse submitted lead" }, 400);
  }

  const lead = buildLeadPayload(fields, request);
  const spam = detectLeadSpam(lead, fields);

  if (spam.isSpam) {
    const id = crypto.randomUUID ? crypto.randomUUID() : randomHex(16);
    const token = randomHex(32);
    lead.status = "spam_quarantined";
    lead.spam_score = spam.score;
    lead.spam_reasons = spam.reasons;
    lead.officefinder_status = "officefinder_not_attempted";

    const record = {
      id,
      token_hash: await sha256(token),
      status: "spam_quarantined",
      lead,
      officefinder_payload: {},
    };

    try {
      await saveLead(env, record);
    } catch (error) {
      console.warn("Unable to quarantine spam lead", error);
    }

    if ((request.headers.get("accept") || "").includes("application/json")) {
      return jsonResponse({ ok: true, status: "received" });
    }

    return redirectResponse("/thank-you/");
  }

  if (spam.isSuspicious) {
    lead.spam_score = spam.score;
    lead.spam_reasons = spam.reasons;
  }

  const missing = getMissingSubmitFields(lead);

  if (missing.length) {
    return jsonResponse({
      error: "Missing required lead fields",
      missing,
    }, 400);
  }

  const id = crypto.randomUUID ? crypto.randomUUID() : randomHex(16);
  const token = randomHex(32);
  const routeRecommendation = resolveLeadRoute(lead);
  lead.route_recommendation = routeRecommendation;
  const officefinderPayload = buildOfficeFinderPayload(lead, env);
  const record = {
    id,
    token_hash: await sha256(token),
    status: "pending",
    lead,
    officefinder_payload: officefinderPayload,
  };

  try {
    const storage = await saveLead(env, record);
    const sheets = await logLeadToGoogleSheets(env, record);
    const email = await sendApprovalEmail(env, request, record, token);

    if ((request.headers.get("accept") || "").includes("application/json")) {
      return jsonResponse({
        ok: true,
        id,
        status: "pending",
        storage,
        route_recommendation: routeRecommendation,
        sheets,
        notification: email,
      });
    }

    return redirectResponse("/thank-you/");
  } catch (error) {
    return jsonResponse({
      error: "Lead submission could not be stored",
      message: error.message,
    }, 500);
  }
}

export async function onRequestGet() {
  return jsonResponse({
    ok: true,
    endpoint: "/api/leads/submit",
    method: "POST",
  });
}
