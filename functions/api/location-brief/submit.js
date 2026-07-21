import {
  canonicalizeBrief,
  generatePublicId,
  jsonResponse,
  locationIntentLabel,
  locationIntentSummary,
  locationSummary,
  publicBriefUrl,
  saveLocationBrief,
  scheduleLocationBriefIndexes,
  sendLocationBriefEmail,
  sizeSummary,
  spaceSummary,
  trackLocationBriefEvent,
} from "./_shared.js";
import {
  randomHex,
  saveLead,
  sha256,
} from "../leads/_shared.js";

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

function firstLocation(brief) {
  const locations = brief.searchProfile && Array.isArray(brief.searchProfile.locations)
    ? brief.searchProfile.locations
    : [];
  return locations[0] || {};
}

function recommendedMarketPathSummary(brief) {
  const path = brief.marketPath && Array.isArray(brief.marketPath.recommendedPath)
    ? brief.marketPath.recommendedPath
    : [];
  const compareWith = brief.marketPath && Array.isArray(brief.marketPath.compareWith)
    ? brief.marketPath.compareWith
    : [];
  const labels = [];
  for (const item of [...path, ...compareWith]) {
    if (item && item.label && !labels.includes(item.label)) labels.push(item.label);
  }
  return labels.join(" / ");
}

function investigationScopeSummary(investigation) {
  const scope = investigation && investigation.investigationScope || {};
  const labels = {
    currentAvailability: "Current availability",
    futureAvailability: "Future or upcoming availability",
    comparableBuildings: "Comparable buildings",
    leasingActivity: "Recent leasing activity or comps",
    marketInsight: "Market conditions and tenant considerations",
    brokerGuidance: "Broker guidance when available",
  };
  return Object.keys(labels).filter((key) => scope[key]).map((key) => labels[key]).join(", ");
}

function selectedInvestigationBuildings(investigation) {
  return investigation && Array.isArray(investigation.representativeBuildings)
    ? investigation.representativeBuildings.filter((building) => building && building.selected !== false)
    : [];
}

function investigationRequirementsSummary(investigation) {
  if (!investigation || !investigation.investigationIntent) return "";
  const selectedBuildings = selectedInvestigationBuildings(investigation);
  const requirements = investigation.confirmedRequirements || {};
  return [
    "Live Market Investigation requested",
    investigation.districtName ? `District: ${investigation.districtName}` : "",
    investigation.city ? `City: ${[investigation.city, investigation.state].filter(Boolean).join(", ")}` : "",
    selectedBuildings.length ? `Selected representative buildings: ${selectedBuildings.map((building) => building.name).join(", ")}` : "Selected representative buildings: district-level only",
    `Include competitive buildings: ${investigation.includeCompetitiveBuildings !== false ? "Yes" : "No"}`,
    investigationScopeSummary(investigation) ? `Investigation scope: ${investigationScopeSummary(investigation)}` : "",
    investigation.timing || requirements.timing ? `Timing: ${investigation.timing || requirements.timing}` : "",
    investigation.brokerPreference ? `Broker preference: ${investigation.brokerPreference}` : "",
    requirements.locationPriorities && requirements.locationPriorities.length ? `Profile priorities: ${requirements.locationPriorities.join(", ")}` : "",
    investigation.additionalNotes ? `Investigation notes: ${investigation.additionalNotes}` : "",
  ].filter(Boolean).join("\n");
}

function buildLocationBriefLead(brief, request, briefUrl) {
  const contact = brief.contact || {};
  const location = firstLocation(brief);
  const market = locationSummary(brief);
  const spaceType = spaceSummary(brief);
  const size = sizeSummary(brief);
  const recommendedMarketPath = recommendedMarketPathSummary(brief);
  const locationIntent = brief.searchProfile && brief.searchProfile.locationIntent || "compare";
  const priorities = Array.isArray(brief.priorities) ? brief.priorities.filter(Boolean) : [];
  const investigation = brief.liveMarketInvestigation;
  const investigationSummary = investigationRequirementsSummary(investigation);
  const requirements = [
    investigationSummary,
    brief.feedback ? `Feedback: ${brief.feedback}` : "",
    priorities.length ? `Business priorities: ${priorities.join(", ")}` : "",
    brief.notes ? `Notes: ${brief.notes}` : "",
  ].filter(Boolean).join("\n\n");
  const selectedBuildings = selectedInvestigationBuildings(investigation);

  return {
    lead_type: investigation && investigation.investigationIntent ? "live_market_investigation" : "location_brief",
    profile_version: "location_brief_v1",
    name: contact.name || "",
    email: contact.email || "",
    phone: contact.phone || "",
    company: contact.company || "",
    city: location.city || (location.type === "city" ? location.label : ""),
    state: location.state || "",
    market,
    space_type: spaceType,
    requested_space_type: spaceType,
    space_needed: size,
    move_timing: brief.searchProfile && brief.searchProfile.timing || investigation && investigation.timing || "",
    requirements,
    page_type: "location_brief",
    page_url: briefUrl,
    rofo_source: "location_brief",
    source: "location_brief",
    location_display: market,
    location_city: location.city || "",
    location_district: location.type === "district" ? location.label : "",
    location_state: location.state || "",
    status: investigation && investigation.investigationIntent ? "market_investigation_requested" : "expert_review_requested",
    officefinder_status: "officefinder_not_attempted",
    location_intent: locationIntent,
    location_intent_label: locationIntentLabel(locationIntent),
    location_intent_summary: locationIntentSummary(locationIntent),
    location_brief_id: brief.id,
    location_brief_public_id: brief.publicId,
    location_brief_url: briefUrl,
    location_brief_status: brief.status,
    recommended_market_path: recommendedMarketPath,
    business_priorities: priorities.join(", "),
    investigation_requested: investigation && investigation.investigationIntent ? "yes" : "",
    investigation_status: investigation && investigation.investigationIntent ? investigation.investigationStatus || "requested" : "",
    investigation_source: investigation && investigation.investigationIntent ? investigation.investigationSource || investigation.source || "" : "",
    investigation_city: investigation && investigation.investigationIntent ? investigation.city || "" : "",
    investigation_district: investigation && investigation.investigationIntent ? investigation.districtName || "" : "",
    investigation_district_id: investigation && investigation.investigationIntent ? investigation.districtId || "" : "",
    investigation_buildings: selectedBuildings.map((building) => building.name).join(", "),
    investigation_building_urls: selectedBuildings.map((building) => building.url).join(", "),
    investigation_include_competitive_buildings: investigation && investigation.investigationIntent ? String(investigation.includeCompetitiveBuildings !== false) : "",
    investigation_scope: investigationScopeSummary(investigation),
    investigation_timing: investigation && investigation.investigationIntent ? investigation.timing || "" : "",
    investigation_broker_preference: investigation && investigation.investigationIntent ? investigation.brokerPreference || "" : "",
    investigation_notes: investigation && investigation.investigationIntent ? investigation.additionalNotes || "" : "",
    location_brief_payload: JSON.stringify(brief),
    timestamp: brief.createdAt || new Date().toISOString(),
    user_agent: request.headers.get("user-agent") || "",
    ip_country: request.cf && request.cf.country || "",
    effective_space_type: spaceType,
  };
}

async function createLocationBriefLead(env, request, brief, briefUrl) {
  if (!env.LEADS_DB && !env.LEADS_KV) {
    return { stored: false, reason: "Lead dashboard storage is not configured." };
  }

  const id = crypto.randomUUID ? crypto.randomUUID() : randomHex(16);
  const token = randomHex(32);
  const lead = buildLocationBriefLead(brief, request, briefUrl);
  const record = {
    id,
    token_hash: await sha256(token),
    status: brief.liveMarketInvestigation && brief.liveMarketInvestigation.investigationIntent ? "market_investigation_requested" : "expert_review_requested",
    lead,
    officefinder_payload: {},
  };

  const storage = await saveLead(env, record);
  return {
    stored: true,
    id,
    status: record.status,
    storage,
  };
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
    timing: brief.searchProfile.timing || "",
    locationIntent: brief.searchProfile.locationIntent || "compare",
    investigationIntent: Boolean(brief.liveMarketInvestigation && brief.liveMarketInvestigation.investigationIntent),
    investigationDistrict: brief.liveMarketInvestigation && brief.liveMarketInvestigation.districtName || "",
  };

  try {
    await trackLocationBriefEvent(env, "location_brief_created", brief, eventPayload);
    await trackLocationBriefEvent(env, "expert_review_requested", brief, eventPayload);
    await trackLocationBriefEvent(env, "location_brief_submitted", brief, eventPayload);
    if (brief.liveMarketInvestigation && brief.liveMarketInvestigation.investigationIntent) {
      await trackLocationBriefEvent(env, "live_market_investigation_requested", brief, eventPayload);
    }
  } catch (error) {
    console.warn("Unable to store Location Brief analytics events", error);
  }

  let lead = { stored: false, reason: "Not attempted" };
  try {
    lead = await createLocationBriefLead(env, request, brief, url);
  } catch (error) {
    lead = { stored: false, reason: error.message };
    console.warn("Unable to create Location Brief lead dashboard record", error);
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
    lead,
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
