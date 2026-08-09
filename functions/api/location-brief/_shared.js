import {
  escapeHtml,
  htmlResponse,
  jsonResponse,
  randomHex,
} from "../leads/_shared.js";
import {
  buildProjectSnapshotFromBrief,
  executionTimingLabel,
  projectSnapshotTextLines,
} from "../../_shared/project-snapshot.js";

export { escapeHtml, htmlResponse, jsonResponse };

export const LOCATION_BRIEF_STATUSES = [
  "draft",
  "submitted",
  "received",
  "broker_assigned",
  "under_review",
  "tour_planning",
  "locations_shortlisted",
  "completed",
];

export const LOCATION_BRIEF_SCHEMA_VERSION = "location-brief:v1";
export const KNOWLEDGE_GRAPH_VERSION = "locationKnowledgeGraph:v1";
export const RECOMMENDATION_ENGINE_VERSION = "recommendation-context:v1";

function clean(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function cleanArray(value, max = 20) {
  return Array.isArray(value)
    ? value.map((item) => clean(item, 240)).filter(Boolean).slice(0, max)
    : [];
}

function normalizeLocation(location) {
  if (!location || typeof location !== "object") return null;
  const label = clean(location.label, 180);
  if (!label) return null;
  return {
    label,
    type: clean(location.type || "location", 60),
    city: clean(location.city, 140),
    state: clean(location.state, 20),
    slug: clean(location.slug, 180),
    path: clean(location.path, 500),
  };
}

function normalizeSearchProfile(profile) {
  const value = profile && typeof profile === "object" ? profile : {};
  const commuteOrientations = cleanArray(value.commuteOrientations || value.commute_orientations || value.commuteOrientation || value.commute_orientation, 6);
  return {
    locations: Array.isArray(value.locations)
      ? value.locations.map(normalizeLocation).filter(Boolean)
      : [],
    spaceType: clean(value.spaceType || value.space_type, 120),
    size: clean(value.size || value.size_or_people, 120),
    timing: clean(value.timing || value.moveTiming || value.move_timing, 120),
    locationIntent: normalizeLocationIntent(value.locationIntent || value.location_intent),
    modelKey: clean(value.modelKey || value.model_key, 120),
    businessType: clean(value.businessType || value.business_type, 120),
    operationalUse: cleanArray(value.operationalUse || value.operational_use, 12),
    officeEnvironment: clean(value.officeEnvironment || value.office_environment, 140),
    commuteOrientation: commuteOrientations[0] || clean(value.commuteOrientation || value.commute_orientation, 140),
    commuteOrientations,
    expectedGrowth: clean(value.expectedGrowth || value.expected_growth, 120),
    institutionProximity: clean(value.institutionProximity || value.institution_proximity, 140),
    facts: value.facts && typeof value.facts === "object" ? value.facts : {},
    constraints: value.constraints && typeof value.constraints === "object" ? value.constraints : {},
    priorities: value.priorities && typeof value.priorities === "object" ? value.priorities : {},
    timestamp: clean(value.timestamp, 80),
  };
}

export function normalizeLocationIntent(value, fallback = "compare") {
  const normalized = clean(value, 40).toLowerCase();
  return ["focus", "compare", "discover"].includes(normalized) ? normalized : fallback;
}

export function locationIntentLabel(value) {
  const intent = normalizeLocationIntent(value);
  if (intent === "focus") return "Focus my search here";
  if (intent === "discover") return "Recommend the best markets";
  return "Compare with nearby markets";
}

export function locationIntentSummary(value) {
  const intent = normalizeLocationIntent(value);
  if (intent === "focus") return "Preferred geography is already defined; expert review should focus on buildings and submarkets within that area.";
  if (intent === "discover") return "User is open to different locations; Compass should recommend strongest supported markets.";
  return "Use selected location as an anchor and compare nearby or relevant alternatives.";
}

function normalizeMarketItem(item) {
  if (!item || typeof item !== "object") return null;
  const label = clean(item.label, 180);
  if (!label) return null;
  return {
    label,
    slug: clean(item.slug, 180),
    type: clean(item.type, 80),
    city: clean(item.city, 140),
    state: clean(item.state, 20),
    path: clean(item.path, 500),
    fitLabel: clean(item.fitLabel, 140),
    summary: clean(item.summary, 1000),
    strengths: cleanArray(item.strengths, 6),
    tradeoffs: cleanArray(item.tradeoffs, 6),
    bestFor: cleanArray(item.bestFor, 6),
    confidence: clean(item.confidence, 80),
  };
}

function normalizeComparison(item) {
  if (!item || typeof item !== "object") return null;
  const label = clean(item.label, 180);
  if (!label) return null;
  return {
    label,
    slug: clean(item.slug, 180),
    path: clean(item.path, 500),
    reason: clean(item.reason, 1000),
    relationshipType: clean(item.relationshipType, 120),
  };
}

function normalizeMarketPath(path) {
  const value = path && typeof path === "object" ? path : {};
  return {
    mode: clean(value.mode, 80),
    title: clean(value.title, 180),
    confidenceLabel: clean(value.confidenceLabel, 120),
    primaryLocationLabel: clean(value.primaryLocationLabel, 180),
    recommendedPath: Array.isArray(value.recommendedPath)
      ? value.recommendedPath.map(normalizeMarketItem).filter(Boolean).slice(0, 8)
      : [],
    compareWith: Array.isArray(value.compareWith)
      ? value.compareWith.map(normalizeComparison).filter(Boolean).slice(0, 8)
      : [],
    questionsToValidate: cleanArray(value.questionsToValidate, 8),
  };
}

function normalizeContact(contact) {
  const value = contact && typeof contact === "object" ? contact : {};
  return {
    name: clean(value.name, 140),
    email: clean(value.email, 240),
    company: clean(value.company, 180),
    phone: clean(value.phone, 80),
  };
}

function normalizeBooleanMap(value, allowedKeys) {
  const source = value && typeof value === "object" ? value : {};
  return allowedKeys.reduce((result, key) => {
    result[key] = source[key] === true;
    return result;
  }, {});
}

function normalizeInvestigationBuilding(building) {
  if (!building || typeof building !== "object") return null;
  const name = clean(building.name, 180);
  const url = clean(building.url || building.canonicalUrl, 500);
  if (!name || !url || !url.startsWith("/commercial-real-estate/building/")) return null;
  return {
    buildingId: clean(building.buildingId || building.id, 180),
    name,
    url,
    selected: building.selected !== false,
  };
}

function normalizeLiveMarketInvestigation(value) {
  if (!value || typeof value !== "object" || value.investigationIntent !== true) return null;
  const scope = normalizeBooleanMap(value.investigationScope, [
    "currentAvailability",
    "futureAvailability",
    "comparableBuildings",
    "leasingActivity",
    "marketInsight",
    "brokerGuidance",
  ]);
  const hasScope = Object.values(scope).some(Boolean);
  if (!hasScope) {
    scope.currentAvailability = true;
    scope.comparableBuildings = true;
  }
  const requirements = value.confirmedRequirements && typeof value.confirmedRequirements === "object"
    ? value.confirmedRequirements
    : {};
  return {
    investigationIntent: true,
    intent: "live_market_investigation",
    investigationStatus: "requested",
    source: clean(value.source || "recommendation_representative_buildings", 120),
    investigationSource: clean(value.investigationSource || value.source || "recommendation_representative_buildings", 120),
    city: clean(value.city, 140),
    state: clean(value.state, 20),
    districtId: clean(value.districtId || value.districtSlug, 180),
    districtName: clean(value.districtName || value.district, 180),
    districtPath: clean(value.districtPath, 500),
    representativeBuildings: Array.isArray(value.representativeBuildings)
      ? value.representativeBuildings.map(normalizeInvestigationBuilding).filter(Boolean).slice(0, 6)
      : [],
    includeCompetitiveBuildings: value.includeCompetitiveBuildings !== false,
    investigationScope: scope,
    timing: clean(value.timing, 80),
    confirmedRequirements: {
      location: clean(requirements.location, 240),
      spaceType: clean(requirements.spaceType, 120),
      targetSize: clean(requirements.targetSize, 120),
      businessType: clean(requirements.businessType, 140),
      businessTypeOther: clean(requirements.businessTypeOther, 140),
      headcount: clean(requirements.headcount, 120),
      approximateSize: clean(requirements.approximateSize, 120),
      budgetContext: clean(requirements.budgetContext, 240),
      timing: clean(requirements.timing || value.timing, 80),
      locationIntent: clean(requirements.locationIntent, 120),
      locationPriorities: cleanArray(requirements.locationPriorities || requirements.priorities, 12),
      knownConstraints: clean(requirements.knownConstraints, 1000),
    },
    additionalNotes: clean(value.additionalNotes, 2000),
    brokerPreference: clean(value.brokerPreference || "research_first", 80),
    ctaSource: clean(value.ctaSource || "recommendation_district_detail", 120),
    requestedAt: clean(value.requestedAt, 80) || new Date().toISOString(),
    submissionToken: clean(value.submissionToken, 160),
    idempotencyKeyHash: clean(value.idempotencyKeyHash, 160),
    requestFingerprint: clean(value.requestFingerprint, 160),
    duplicateRetryCount: Number(value.duplicateRetryCount) > 0 ? Math.floor(Number(value.duplicateRetryCount)) : 0,
    latestRetryAt: clean(value.latestRetryAt, 80),
    confirmationEmail: value.confirmationEmail && typeof value.confirmationEmail === "object" ? {
      status: clean(value.confirmationEmail.status, 80),
      sent: value.confirmationEmail.sent === true,
      sentAt: clean(value.confirmationEmail.sentAt, 80),
      error: clean(value.confirmationEmail.error, 500),
    } : null,
  };
}

function getBriefStorage(env) {
  if (env.LOCATION_BRIEFS_DB || env.LEADS_DB) return "d1";
  if (env.LOCATION_BRIEFS_KV || env.LEADS_KV) return "kv";
  return "";
}

function getBriefDb(env) {
  return env.LOCATION_BRIEFS_DB || env.LEADS_DB || null;
}

function getBriefKv(env) {
  return env.LOCATION_BRIEFS_KV || env.LEADS_KV || null;
}

function getBaseUrl(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function locationSummary(brief) {
  const locations = brief.searchProfile && Array.isArray(brief.searchProfile.locations)
    ? brief.searchProfile.locations
    : [];
  if (locations.length) return locations.map((location) => location.label).filter(Boolean).join(" / ");
  return brief.marketPath && brief.marketPath.primaryLocationLabel || "Location to review";
}

export function spaceSummary(brief) {
  return brief.searchProfile && brief.searchProfile.spaceType || "Commercial space";
}

export function sizeSummary(brief) {
  return brief.searchProfile && brief.searchProfile.size || "Size to confirm";
}

export function publicBriefUrl(request, publicId) {
  return `${getBaseUrl(request)}/location-brief/${encodeURIComponent(publicId)}`;
}

export function generatePublicId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `LB-${[...bytes].map((byte) => alphabet[byte % alphabet.length]).join("")}`;
}

export function canonicalizeBrief(input, request, existing = {}) {
  const now = new Date().toISOString();
  const publicId = existing.publicId || input.publicId || generatePublicId();
  const id = existing.id || (crypto.randomUUID ? crypto.randomUUID() : randomHex(16));
  const searchProfile = normalizeSearchProfile(input.searchProfile);
  const marketPath = normalizeMarketPath(input.marketPath);
  const recommendation = input.recommendation && typeof input.recommendation === "object"
    ? input.recommendation
    : {
      mode: marketPath.mode,
      title: marketPath.title,
      confidenceLabel: marketPath.confidenceLabel,
      primaryLocationLabel: marketPath.primaryLocationLabel,
    };

  const brief = {
    id,
    publicId,
    createdAt: existing.createdAt || now,
    updatedAt: now,
    status: "submitted",
    searchProfile,
    recommendation,
    marketPath,
    priorities: cleanArray(input.priorities, 20),
    feedback: clean(input.feedback, 120),
    notes: clean(input.notes, 3000),
    liveMarketInvestigation: normalizeLiveMarketInvestigation(input.liveMarketInvestigation),
    contact: normalizeContact(input.contact),
    graphVersion: KNOWLEDGE_GRAPH_VERSION,
    recommendationEngineVersion: RECOMMENDATION_ENGINE_VERSION,
    assignedBroker: null,
    officeFinderSubmission: {
      status: "not_submitted",
      note: "Existing Business Profile and OfficeFinder referral workflow remains unchanged. This Location Brief is stored as an additional Rofo asset.",
    },
    brokerNotes: [],
    metadata: {
      schemaVersion: LOCATION_BRIEF_SCHEMA_VERSION,
      knowledgeGraphVersion: KNOWLEDGE_GRAPH_VERSION,
      recommendationEngineVersion: RECOMMENDATION_ENGINE_VERSION,
      createdFrom: clean(input.createdFrom || "recommendations", 120),
      userAgent: clean(request.headers.get("user-agent"), 500),
    },
  };

  return {
    ...brief,
    projectSnapshot: buildProjectSnapshotFromBrief(brief),
  };
}

export async function ensureLocationBriefTables(db) {
  await db.prepare(`
    create table if not exists location_briefs (
      id text primary key,
      public_id text not null unique,
      status text not null,
      brief_json text not null,
      contact_json text,
      created_at text not null,
      updated_at text not null,
      submitted_at text
    )
  `).run();

  await db.prepare(`
    create table if not exists location_brief_events (
      id text primary key,
      public_id text,
      event_name text not null,
      event_json text,
      created_at text not null
    )
  `).run();
}

export async function ensureLocationBriefIndexes(db) {
  const indexes = [
    "create index if not exists idx_location_briefs_public_id on location_briefs(public_id)",
    "create index if not exists idx_location_briefs_status_created on location_briefs(status, created_at)",
    "create index if not exists idx_location_brief_events_created on location_brief_events(created_at)",
    "create index if not exists idx_location_brief_events_public_event on location_brief_events(public_id, event_name)",
  ];
  for (const sql of indexes) {
    await db.prepare(sql).run();
  }
}

export function scheduleLocationBriefIndexes(waitUntil, db) {
  if (!db || typeof waitUntil !== "function") return;
  waitUntil((async () => {
    try {
      await ensureLocationBriefTables(db);
      await ensureLocationBriefIndexes(db);
    } catch (error) {
      console.warn("Unable to ensure Location Brief indexes", error);
    }
  })());
}

export async function saveLocationBrief(env, brief) {
  const storage = getBriefStorage(env);
  const now = brief.updatedAt || new Date().toISOString();

  if (storage === "d1") {
    const db = getBriefDb(env);
    await ensureLocationBriefTables(db);
    await db.prepare(`
      insert into location_briefs (
        id, public_id, status, brief_json, contact_json, created_at, updated_at, submitted_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      brief.id,
      brief.publicId,
      brief.status,
      JSON.stringify(brief),
      JSON.stringify(brief.contact || {}),
      brief.createdAt,
      now,
      now,
    ).run();
    return "d1";
  }

  if (storage === "kv") {
    const kv = getBriefKv(env);
    await kv.put(`location-brief:${brief.publicId}`, JSON.stringify(brief));
    return "kv";
  }

  throw new Error("Missing Location Brief storage binding. Configure LOCATION_BRIEFS_DB, LEADS_DB, LOCATION_BRIEFS_KV, or LEADS_KV.");
}

export async function getLocationBrief(env, publicId) {
  const storage = getBriefStorage(env);
  const normalized = clean(publicId, 40).toUpperCase();

  if (storage === "d1") {
    const db = getBriefDb(env);
    await ensureLocationBriefTables(db);
    const row = await db.prepare("select * from location_briefs where public_id = ?").bind(normalized).first();
    if (!row) return null;
    const brief = JSON.parse(row.brief_json || "{}");
    return {
      ...brief,
      id: brief.id || row.id,
      publicId: brief.publicId || row.public_id,
      status: brief.status || row.status,
      createdAt: brief.createdAt || row.created_at,
      updatedAt: brief.updatedAt || row.updated_at,
    };
  }

  if (storage === "kv") {
    return await getBriefKv(env).get(`location-brief:${normalized}`, "json");
  }

  throw new Error("Missing Location Brief storage binding. Configure LOCATION_BRIEFS_DB, LEADS_DB, LOCATION_BRIEFS_KV, or LEADS_KV.");
}

export async function trackLocationBriefEvent(env, eventName, brief, payload = {}) {
  const storage = getBriefStorage(env);
  const now = new Date().toISOString();
  const id = crypto.randomUUID ? crypto.randomUUID() : randomHex(16);
  const event = {
    eventName,
    publicId: brief && brief.publicId || "",
    payload,
    createdAt: now,
  };

  if (storage === "d1") {
    const db = getBriefDb(env);
    await ensureLocationBriefTables(db);
    await db.prepare(`
      insert into location_brief_events (
        id, public_id, event_name, event_json, created_at
      ) values (?, ?, ?, ?, ?)
    `).bind(
      id,
      event.publicId,
      eventName,
      JSON.stringify(event),
      now,
    ).run();
    return { stored: true, storage: "d1" };
  }

  if (storage === "kv") {
    const kv = getBriefKv(env);
    await kv.put(`location-brief-event:${now}:${id}`, JSON.stringify(event));
    return { stored: true, storage: "kv" };
  }

  return { stored: false, reason: "No Location Brief storage binding configured" };
}

function emailField(label, value) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:8px 0;color:#64748b;font-size:13px;line-height:18px;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#0f172a;font-size:14px;line-height:20px;font-weight:600;vertical-align:top;">${value}</td>
    </tr>
  `;
}

function formatList(values) {
  const items = Array.isArray(values) ? values.filter(Boolean) : [];
  if (!items.length) return "";
  return `<ul style="margin:0;padding-left:18px;">${items.map((item) => `<li style="margin:0 0 4px;">${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function marketPathLabels(brief) {
  const path = brief.marketPath && Array.isArray(brief.marketPath.recommendedPath)
    ? brief.marketPath.recommendedPath
    : [];
  if (!path.length && brief.marketPath && brief.marketPath.primaryLocationLabel) return brief.marketPath.primaryLocationLabel;
  return path.map((item) => item.label).filter(Boolean).join(" → ");
}

function investigationScopeLabels(investigation) {
  const scope = investigation && investigation.investigationScope || {};
  const labels = {
    currentAvailability: "Current availability",
    futureAvailability: "Future or upcoming availability",
    comparableBuildings: "Comparable buildings",
    leasingActivity: "Recent leasing activity or comps",
    marketInsight: "Market conditions and tenant considerations",
    brokerGuidance: "Broker guidance when available",
  };
  return Object.keys(labels).filter((key) => scope[key]).map((key) => labels[key]);
}

function brokerPreferenceLabel(value) {
  const labels = {
    research_first: "Research first; contact me with findings",
    include_local_broker: "Include local broker guidance when available",
    already_working_with_broker: "I am already working with a broker",
    not_sure: "Not sure yet",
  };
  return labels[value] || value || "";
}

function selectedInvestigationBuildings(investigation) {
  return investigation && Array.isArray(investigation.representativeBuildings)
    ? investigation.representativeBuildings.filter((building) => building && building.selected !== false)
    : [];
}

function investigationTextBlock(investigation) {
  if (!investigation || !investigation.investigationIntent) return [];
  const buildings = selectedInvestigationBuildings(investigation);
  const scope = investigationScopeLabels(investigation);
  return [
    "LIVE MARKET INVESTIGATION",
    `District: ${investigation.districtName || ""}`,
    `City: ${[investigation.city, investigation.state].filter(Boolean).join(", ")}`,
    `Selected buildings: ${buildings.length ? buildings.map((building) => building.name).join(", ") : "(district-level only)"}`,
    `Include competitive buildings: ${investigation.includeCompetitiveBuildings !== false ? "Yes" : "No"}`,
    `Scope: ${scope.length ? scope.join(", ") : "(not selected)"}`,
    `Timing: ${investigation.timing || investigation.confirmedRequirements && investigation.confirmedRequirements.timing || ""}`,
    `Broker preference: ${brokerPreferenceLabel(investigation.brokerPreference)}`,
    `Notes: ${investigation.additionalNotes || "(none provided)"}`,
  ];
}

function investigationHtmlBlock(investigation) {
  if (!investigation || !investigation.investigationIntent) return "";
  const buildings = selectedInvestigationBuildings(investigation);
  const scope = investigationScopeLabels(investigation);
  const requirements = investigation.confirmedRequirements || {};
  return `
    <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#eff6ff;border:1px solid #bfdbfe;">
      <div style="margin:0 0 8px;color:#1d4ed8;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Live Market Investigation</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${emailField("District", escapeHtml(investigation.districtName || ""))}
        ${emailField("City", escapeHtml([investigation.city, investigation.state].filter(Boolean).join(", ")))}
        ${emailField("Selected buildings", buildings.length ? formatList(buildings.map((building) => building.name)) : escapeHtml("District-level review only"))}
        ${emailField("Competitive buildings", escapeHtml(investigation.includeCompetitiveBuildings !== false ? "Include other competitive buildings" : "Do not include by default"))}
        ${emailField("Scope", scope.length ? formatList(scope) : escapeHtml("Not selected"))}
        ${emailField("Timing", escapeHtml(investigation.timing || requirements.timing || ""))}
        ${emailField("Broker preference", escapeHtml(brokerPreferenceLabel(investigation.brokerPreference)))}
        ${emailField("Confirmed requirements", formatList([
          requirements.businessType ? `Business type: ${requirements.businessType}${requirements.businessTypeOther ? ` (${requirements.businessTypeOther})` : ""}` : "",
          requirements.spaceType ? `Space type: ${requirements.spaceType}` : "",
          requirements.targetSize ? `Target size: ${requirements.targetSize}` : "",
          requirements.headcount ? `Headcount: ${requirements.headcount}` : "",
          requirements.approximateSize ? `Approximate size: ${requirements.approximateSize}` : "",
          requirements.budgetContext ? `Budget/rent context: ${requirements.budgetContext}` : "",
          requirements.locationIntent ? `Location intent: ${requirements.locationIntent}` : "",
          requirements.locationPriorities && requirements.locationPriorities.length ? `Priorities: ${requirements.locationPriorities.join(", ")}` : "",
        ].filter(Boolean)))}
        ${investigation.additionalNotes ? emailField("Investigation notes", `<span style="white-space:pre-wrap;">${escapeHtml(investigation.additionalNotes)}</span>`) : ""}
      </table>
    </div>
  `;
}

export async function sendLocationBriefEmail(env, request, brief) {
  if (!env.RESEND_API_KEY) {
    return { sent: false, status: "not_configured", reason: "RESEND_API_KEY is not configured" };
  }
  if (!env.LEAD_NOTIFY_EMAIL) {
    return { sent: false, status: "not_configured", reason: "LEAD_NOTIFY_EMAIL is not configured" };
  }

  const url = publicBriefUrl(request, brief.publicId);
  const location = locationSummary(brief);
  const spaceType = spaceSummary(brief);
  const size = sizeSummary(brief);
  const intentLabel = locationIntentLabel(brief.searchProfile && brief.searchProfile.locationIntent);
  const investigation = brief.liveMarketInvestigation;
  const projectSnapshot = brief.projectSnapshot || buildProjectSnapshotFromBrief(brief);
  const snapshotLines = projectSnapshotTextLines(projectSnapshot);
  const subject = investigation && investigation.investigationIntent
    ? `New Rofo Live Market Investigation - ${investigation.districtName || location}`
    : `New Rofo ${projectSnapshot.propertyType || spaceType || "Space"} Requirement - ${projectSnapshot.market || location}`;
  const marketPath = marketPathLabels(brief);
  const text = [
    investigation && investigation.investigationIntent ? "NEW ROFO LIVE MARKET INVESTIGATION" : "NEW ROFO LOCATION BRIEF",
    "",
    "A new Rofo requirement has been submitted.",
    "",
    `Location Brief ID: ${brief.publicId}`,
    `Location Brief URL: ${url}`,
    `Status: ${brief.status}`,
    "",
    "PROJECT SNAPSHOT",
    ...snapshotLines,
    "",
    "CONTACT",
    `Name: ${brief.contact.name}`,
    `Company: ${brief.contact.company || ""}`,
    `Email: ${brief.contact.email}`,
    `Phone: ${brief.contact.phone || ""}`,
    "",
    "BEST FITS",
    ...(projectSnapshot.topDistricts && projectSnapshot.topDistricts.length ? projectSnapshot.topDistricts.map((district) => `- ${district}`) : [marketPath || "Expert review needed"]),
    "",
    "ROUTING NOTE",
    "Please review the Location Brief before contacting the client.",
    "",
    "FEEDBACK",
    brief.feedback || "(none selected)",
    "",
    "ADDITIONAL NOTES",
    brief.notes || "(none provided)",
    "",
    ...investigationTextBlock(investigation),
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f4f7fb;margin:0;padding:22px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:680px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px;background:#0f172a;color:#ffffff;">
                <div style="font-size:12px;line-height:16px;text-transform:uppercase;letter-spacing:.08em;color:#93c5fd;font-weight:700;">Rofo Location Brief</div>
                <h1 style="margin:8px 0 8px;font-size:24px;line-height:30px;">New Location Brief ready for review</h1>
                <div style="font-size:15px;line-height:22px;color:#dbeafe;">${escapeHtml(location)} &bull; ${escapeHtml(spaceType)} &bull; ${escapeHtml(size)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 18px 22px;">
                <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#f8fafc;border:1px solid #dbe5f2;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    ${emailField("Brief ID", escapeHtml(brief.publicId))}
                    ${emailField("Permanent URL", `<a href="${escapeHtml(url)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(url)}</a>`)}
                    ${emailField("Name", escapeHtml(brief.contact.name))}
                    ${brief.contact.company ? emailField("Company", escapeHtml(brief.contact.company)) : ""}
                    ${emailField("Email", `<a href="mailto:${escapeHtml(brief.contact.email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(brief.contact.email)}</a>`)}
                    ${brief.contact.phone ? emailField("Phone", `<a href="tel:${escapeHtml(brief.contact.phone)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(brief.contact.phone)}</a>`) : ""}
                  </table>
                </div>

                <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#ffffff;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Business requirements</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    ${emailField("Location", escapeHtml(location))}
                    ${emailField("Space type", escapeHtml(spaceType))}
                    ${emailField("Size", escapeHtml(size))}
                    ${emailField("Location intent", escapeHtml(intentLabel))}
                  </table>
                </div>

                <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#ffffff;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Recommended Market Path</div>
                  <div style="font-size:15px;line-height:22px;font-weight:700;">${escapeHtml(marketPath || "Expert review needed")}</div>
                </div>

                ${investigationHtmlBlock(investigation)}

                <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#ffffff;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Business priorities</div>
                  ${brief.priorities && brief.priorities.length ? formatList(brief.priorities) : `<div style="color:#64748b;font-size:14px;">None selected.</div>`}
                </div>

                <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#ffffff;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Additional notes</div>
                  <div style="white-space:pre-wrap;word-break:break-word;font-size:14px;line-height:21px;">${escapeHtml(brief.notes || "None provided.")}</div>
                </div>

                <a href="${escapeHtml(url)}" style="display:block;width:100%;box-sizing:border-box;padding:15px 18px;border-radius:8px;background:#14532d;color:#ffffff;font-size:16px;line-height:21px;font-weight:800;text-align:center;text-decoration:none;">Open Location Brief</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL || "Rofo Leads <onboarding@resend.dev>",
      to: [env.LEAD_NOTIFY_EMAIL],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    return {
      sent: false,
      status: "failed",
      reason: await response.text(),
      recipient: env.LEAD_NOTIFY_EMAIL,
      sender: env.RESEND_FROM_EMAIL || "Rofo Leads <onboarding@resend.dev>",
    };
  }

  return {
    sent: true,
    status: "sent",
    sentAt: new Date().toISOString(),
    recipient: env.LEAD_NOTIFY_EMAIL,
    sender: env.RESEND_FROM_EMAIL || "Rofo Leads <onboarding@resend.dev>",
  };
}

export async function sendLiveMarketInvestigationConfirmationEmail(env, request, brief) {
  const investigation = brief.liveMarketInvestigation;
  const contact = brief.contact || {};
  if (!investigation || !investigation.investigationIntent) {
    return { sent: false, status: "not_applicable", reason: "No Live Market Investigation request." };
  }
  if (!contact.email) {
    return { sent: false, status: "not_sent", reason: "No user email available." };
  }
  if (!env.RESEND_API_KEY) {
    return { sent: false, status: "not_sent", reason: "RESEND_API_KEY is not configured." };
  }

  const url = publicBriefUrl(request, brief.publicId);
  const requirements = investigation.confirmedRequirements || {};
  const district = investigation.districtName || locationSummary(brief);
  const city = [investigation.city, investigation.state].filter(Boolean).join(", ");
  const timing = executionTimingLabel(requirements.timing || investigation.timing || "");
  const buildings = selectedInvestigationBuildings(investigation);
  const researchItems = investigationScopeLabels(investigation);
  const researchList = researchItems.length ? researchItems : [
    "Current availability",
    "Asking rents and concessions",
    "Comparable opportunities",
    "Buildings worth touring",
    "Relevant market conditions",
  ];
  const subject = "Your Rofo Location Brief";
  const text = [
    `Hi ${contact.name || "there"},`,
    "",
    `Thanks for requesting current availability${district ? ` in ${district}` : ""}.`,
    "",
    "We'll review your Location Brief and determine the best next step.",
    "Depending on your request, we'll either continue the research directly or involve a local market expert when appropriate.",
    "",
    `Location Brief: ${url}`,
    "",
    "REQUEST SUMMARY",
    `Selected district: ${district}`,
    city ? `Market: ${city}` : "",
    requirements.businessType ? `Business type: ${requirements.businessType}${requirements.businessTypeOther ? ` (${requirements.businessTypeOther})` : ""}` : "",
    requirements.headcount ? `Headcount: ${requirements.headcount}` : "",
    requirements.approximateSize ? `Approximate size: ${requirements.approximateSize}` : "",
    timing ? `Timing: ${timing}` : "",
    buildings.length ? `Representative buildings: ${buildings.map((building) => building.name).join(", ")}` : "",
    "",
    "WHAT WE'LL RESEARCH",
    ...researchList.map((item) => `- ${item}`),
    "",
    "Rofo",
  ].filter(Boolean).join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f4f7fb;margin:0;padding:22px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px;background:#123f8c;color:#ffffff;">
                <div style="font-size:12px;line-height:16px;text-transform:uppercase;letter-spacing:.08em;color:#bfdbfe;font-weight:700;">Rofo Location Brief</div>
                <h1 style="margin:8px 0 8px;font-size:24px;line-height:30px;">We've received your request.</h1>
                ${city ? `<div style="font-size:15px;line-height:22px;color:#eff6ff;">${escapeHtml(city)}</div>` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:22px;font-size:15px;line-height:23px;">
                <p style="margin:0 0 14px;">${contact.name ? `Hi ${escapeHtml(contact.name)},` : "Hi,"}</p>
                <p style="margin:0 0 14px;">Thanks for requesting current availability${district ? ` in ${escapeHtml(district)}` : ""}.</p>
                <p style="margin:0 0 18px;">We'll review your Location Brief and determine the best next step. Depending on your request, we'll either continue the research directly or involve a local market expert when appropriate.</p>

                <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#f8fafc;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Request summary</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    ${emailField("District", escapeHtml(district))}
                    ${city ? emailField("City", escapeHtml(city)) : ""}
                    ${requirements.businessType ? emailField("Business type", escapeHtml(`${requirements.businessType}${requirements.businessTypeOther ? ` (${requirements.businessTypeOther})` : ""}`)) : ""}
                    ${requirements.headcount ? emailField("Headcount", escapeHtml(requirements.headcount)) : ""}
                    ${requirements.approximateSize ? emailField("Approximate size", escapeHtml(requirements.approximateSize)) : ""}
                    ${timing ? emailField("Timing", escapeHtml(timing)) : ""}
                    ${buildings.length ? emailField("Representative buildings", formatList(buildings.map((building) => building.name))) : ""}
                  </table>
                </div>

                <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#ffffff;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">What we'll research</div>
                  ${formatList(researchList)}
                </div>

                <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#ffffff;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">What happens next</div>
                  <p style="margin:0;color:#334155;">We'll review your Location Brief together with the district you selected and current market activity. If additional research or local expertise would be helpful, we'll determine the best way to assist you.</p>
                </div>

                <a href="${escapeHtml(url)}" style="display:block;width:100%;box-sizing:border-box;padding:15px 18px;border-radius:8px;background:#14532d;color:#ffffff;font-size:16px;line-height:21px;font-weight:800;text-align:center;text-decoration:none;">View Location Brief</a>
                <p style="margin:18px 0 0;color:#64748b;font-size:13px;line-height:20px;">Representative buildings illustrate the type of environment Rofo is evaluating. Current availability will be reviewed separately.</p>
                <p style="margin:10px 0 0;color:#64748b;font-size:13px;line-height:20px;">Need to make a change? You can update your Business Profile and create a new Location Brief at any time.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL || "Rofo <onboarding@resend.dev>",
      to: [contact.email],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    return { sent: false, status: "failed", reason: await response.text() };
  }

  return { sent: true, status: "sent", sentAt: new Date().toISOString() };
}
