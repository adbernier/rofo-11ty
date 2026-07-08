import {
  canonicalizeBrief,
  generatePublicId,
  jsonResponse,
  publicBriefUrl,
  saveLocationBrief,
  scheduleLocationBriefIndexes,
  sendLocationBriefEmail,
  trackLocationBriefEvent,
} from "./_shared.js";

async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return null;
  }
}

function hasRequiredContact(brief) {
  return Boolean(brief.contact && brief.contact.name && brief.contact.email);
}

async function createCanonicalBrief(env, request, input) {
  let lastError = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const brief = canonicalizeBrief({
      ...input,
      publicId: attempt === 0 ? input.publicId : generatePublicId(),
    }, request);

    if (!hasRequiredContact(brief)) {
      return { brief, storage: "" };
    }

    try {
      const storage = await saveLocationBrief(env, brief);
      return { brief, storage };
    } catch (error) {
      lastError = error;
      if (!/unique|constraint|public_id/i.test(String(error && error.message || ""))) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Unable to generate a unique Location Brief ID");
}

export async function onRequestPost({ request, env, waitUntil }) {
  const input = await readJson(request);
  if (!input || typeof input !== "object") {
    return jsonResponse({ ok: false, error: "Invalid Location Brief payload" }, 400);
  }

  let result;
  try {
    result = await createCanonicalBrief(env, request, input);
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: "Location Brief could not be stored",
      message: error.message,
    }, 500);
  }

  const { brief, storage } = result;
  if (!hasRequiredContact(brief)) {
    return jsonResponse({
      ok: false,
      error: "Missing required contact fields",
      missing: [
        brief.contact && brief.contact.name ? "" : "name",
        brief.contact && brief.contact.email ? "" : "email",
      ].filter(Boolean),
    }, 400);
  }

  const url = publicBriefUrl(request, brief.publicId);
  scheduleLocationBriefIndexes(waitUntil, env.LOCATION_BRIEFS_DB || env.LEADS_DB);

  const eventPayload = {
    source: "recommendations",
    profile_version: "location_brief_v1",
    location: (brief.searchProfile.locations || []).map((item) => item.label).join(" / "),
    spaceType: brief.searchProfile.spaceType,
    size: brief.searchProfile.size,
  };

  try {
    await trackLocationBriefEvent(env, "location_brief_created", brief, eventPayload);
    await trackLocationBriefEvent(env, "expert_review_requested", brief, eventPayload);
    await trackLocationBriefEvent(env, "location_brief_submitted", brief, eventPayload);
  } catch (error) {
    console.warn("Unable to store Location Brief analytics events", error);
  }

  let email = { sent: false, reason: "Not attempted" };
  try {
    email = await sendLocationBriefEmail(env, request, brief);
  } catch (error) {
    email = { sent: false, reason: error.message };
  }

  return jsonResponse({
    ok: true,
    id: brief.id,
    publicId: brief.publicId,
    status: brief.status,
    url,
    storage,
    email,
  });
}

export async function onRequestGet() {
  return jsonResponse({
    ok: true,
    endpoint: "/api/location-brief/submit",
    method: "POST",
  });
}
