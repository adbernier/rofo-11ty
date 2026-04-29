import {
  buildLeadPayload,
  buildOfficeFinderPayload,
  getMissingSubmitFields,
  jsonResponse,
  randomHex,
  readSubmittedFields,
  redirectResponse,
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

  if (fields._gotcha) {
    return redirectResponse("/thank-you/");
  }

  const lead = buildLeadPayload(fields, request);
  const missing = getMissingSubmitFields(lead);

  if (missing.length) {
    return jsonResponse({
      error: "Missing required lead fields",
      missing,
    }, 400);
  }

  const id = crypto.randomUUID ? crypto.randomUUID() : randomHex(16);
  const token = randomHex(32);
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
    const email = await sendApprovalEmail(env, request, record, token);

    if ((request.headers.get("accept") || "").includes("application/json")) {
      return jsonResponse({
        ok: true,
        id,
        status: "pending",
        storage,
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
