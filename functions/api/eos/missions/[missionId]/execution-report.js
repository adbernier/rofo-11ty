import { submitMissionExecutionResults } from "../../../../admin/eos-missions.js";

const MAX_BODY_BYTES = 32000;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function bearerToken(request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function isLocalRequest(url) {
  return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
}

export async function onRequestPost({ request, env, params }) {
  const url = new URL(request.url);
  if (url.protocol !== "https:" && !isLocalRequest(url)) {
    return jsonResponse({ ok: false, error: "HTTPS is required for mission execution reporting." }, 400);
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse({ ok: false, error: "Content-Type must be application/json." }, 415);
  }

  const missionId = String((params && params.missionId) || "").trim();
  const token = bearerToken(request);
  if (!missionId) return jsonResponse({ ok: false, error: "Mission ID is required." }, 400);
  if (!token) return jsonResponse({ ok: false, error: "Mission reporting token is required." }, 401);

  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch (error) {
    return jsonResponse({ ok: false, error: "Unable to read request body." }, 400);
  }
  if (!rawBody.trim()) return jsonResponse({ ok: false, error: "Execution report JSON is required." }, 400);
  if (rawBody.length > MAX_BODY_BYTES) return jsonResponse({ ok: false, error: "Execution report JSON is too large." }, 413);

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    return jsonResponse({ ok: false, error: `Invalid JSON: ${error.message}` }, 400);
  }

  try {
    const result = await submitMissionExecutionResults(env, missionId, token, payload);
    return jsonResponse(result, 200);
  } catch (error) {
    const message = error && error.message ? error.message : "Mission execution reporting failed.";
    const status = /token|required|forbidden|unauthorized/i.test(message) ? 401
      : /not found/i.test(message) ? 404
        : /completed|closed|revoked/i.test(message) ? 409
          : 400;
    return jsonResponse({ ok: false, error: message }, status);
  }
}

export async function onRequestGet() {
  return jsonResponse({ ok: false, error: "Method not allowed." }, 405);
}
