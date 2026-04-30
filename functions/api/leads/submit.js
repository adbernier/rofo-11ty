import {
  buildLeadPayload,
  buildOfficeFinderPayload,
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

  if (fields._gotcha) {
    return redirectResponse("/thank-you/");
  }

  const honeypot = fields.company_website;
  if (honeypot) {
    return new Response("Spam detected", { status: 400 });
  }

  const start = Number(fields.form_start_time);
  const now = Date.now();

  if (start && now - start < 3000) {
    return new Response("Form submitted too quickly", { status: 400 });
  }

  if (!fields.human_check) {
    return new Response("Please confirm you are human", { status: 400 });
  }

  const requirements = fields.requirements || fields.message || fields.notes || "";

  if (requirements.includes("http://") || requirements.includes("https://")) {
    return new Response("Links are not allowed", { status: 400 });
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
