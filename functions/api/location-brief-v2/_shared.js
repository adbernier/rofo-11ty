import readinessEngine from "../../../lib/recommendations/private-recommendation-readiness.js";
import accessFoundation from "../../../_data/sfAccessFoundationV0.js";
import compositionFoundation from "../../../_data/sfOfficeCompositionFoundation.js";
import sfOfficeModel from "../../../_data/sfOfficeRecommendationModel.js";
import districtGeography from "../../../_data/requirementPrototypeDistrictGeography.js";
import districtPresentations from "../../../data/generated/location-brief-district-presentation.json";

export const V2_SCHEMA_VERSION = "location-brief:v2";
export const ENTRY_CONTEXT_VERSION = "entry-context:v1";
export const REQUIREMENT_REVISION_VERSION = "requirement-revision:v1";
export const SNAPSHOT_VERSION = "location-recommendation-snapshot:v1";
export const OWNER_COOKIE = "rofo_lb_v2_owner";
export const ENGINE_VERSION = readinessEngine.VERSION;
export const PUBLIC_SF_OFFICE_FLAG = "LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_ENABLED";
export const PUBLIC_SOURCE_ALLOWLIST = "LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES";

const dependencies = { accessFoundation, compositionFoundation, sfOfficeModel, districtGeography };
const encoder = new TextEncoder();

function clean(value, max = 1000) { return String(value == null ? "" : value).trim().slice(0, max); }
function cleanArray(value, max = 20) { return Array.isArray(value) ? [...new Set(value.map((item) => clean(item, 180)).filter(Boolean))].slice(0, max) : []; }
function criterionText(requirement, dimension) {
  const value = (requirement.criteria || []).find((item) => item.dimension === dimension)?.value || {};
  return (value.list || []).join(" + ") || value.text || "";
}
function randomToken(bytes = 24) {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return [...values].map((value) => value.toString(16).padStart(2, "0")).join("");
}
export async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(String(value)));
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, "0")).join("");
}

export function v2Enabled(env) { return String(env && env.LOCATION_BRIEF_V2_OPERATOR_ENABLED || "false").toLowerCase() === "true"; }
export function publicV2Enabled(env) { return String(env && env[PUBLIC_SF_OFFICE_FLAG] || "false").toLowerCase() === "true"; }
export function publicSourceAllowed(env, sourceType) {
  const configured = clean(env && env[PUBLIC_SOURCE_ALLOWLIST] || "space_type,district", 500).split(",").map((item) => item.trim()).filter(Boolean);
  return configured.includes(clean(sourceType, 80));
}
export function operatorAllowed(request, env) {
  if (!v2Enabled(env)) return false;
  const expected = clean(env && env.LOCATION_BRIEF_V2_OPERATOR_KEY, 500);
  if (!expected) return ["localhost", "127.0.0.1"].includes(new URL(request.url).hostname);
  return request.headers.get("x-rofo-operator-key") === expected;
}
export function isSfOfficeRequirement(requirement = {}) {
  const market = clean(requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId, 120).toLowerCase();
  const propertyTypes = cleanArray(requirement.propertyTypes, 6).map((item) => item.toLowerCase());
  return market === "san-francisco" && propertyTypes.length === 1 && propertyTypes[0] === "office";
}
export function isSfOfficeEntryContext(input = {}) {
  const context = normalizeEntryContext(input);
  return context.marketId === "san-francisco" && (!context.propertyType || context.propertyType === "office");
}
export function sameOriginMutation(request) {
  const origin = clean(request.headers.get("origin"), 500);
  if (!origin) return ["localhost", "127.0.0.1"].includes(new URL(request.url).hostname);
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}
export function privateJson(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store, private", "x-robots-tag": "noindex, nofollow", "x-content-type-options": "nosniff", ...headers } });
}
export function privateHtml(body, status = 200, headers = {}) {
  return new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store, private", "x-robots-tag": "noindex, nofollow", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", ...headers } });
}

export function normalizeEntryContext(input = {}) {
  const sourceType = clean(input.sourceType || "operator_blank", 80);
  const marketId = clean(input.marketId, 120);
  const propertyType = clean(input.propertyType, 80);
  return {
    schemaVersion: ENTRY_CONTEXT_VERSION,
    entryContextId: clean(input.entryContextId, 100) || crypto.randomUUID(),
    sourceType,
    sourcePath: clean(input.sourcePath, 500),
    sourceEntityId: clean(input.sourceEntityId, 180),
    marketId: marketId === "san-francisco" ? marketId : marketId,
    propertyType,
    candidateDistrictIds: cleanArray(input.candidateDistrictIds),
    businessArchetypeId: clean(input.businessArchetypeId, 160),
    businessIdentityId: clean(input.businessIdentityId, 160),
    propertyId: clean(input.propertyId, 180),
    campaign: clean(input.campaign, 180), queryFamily: clean(input.queryFamily, 180),
    referrer: clean(input.referrer, 500), landingPage: clean(input.landingPage, 500),
    capturedAt: clean(input.capturedAt, 80) || new Date().toISOString(),
  };
}

function stripUiState(value) {
  if (Array.isArray(value)) return value.map(stripUiState);
  if (!value || typeof value !== "object") return value;
  const ignored = new Set(["conversation", "askedDimensions", "questionHistory", "currentQuestion", "ui", "mode", "draftAnswer", "interviewState"]);
  return Object.fromEntries(Object.entries(value).filter(([key]) => !ignored.has(key)).map(([key, item]) => [key, stripUiState(item)]));
}
export function canonicalRequirement(input = {}, entryContext = {}) {
  const value = stripUiState(structuredClone(input || {}));
  value.schemaVersion = clean(value.schemaVersion, 120) || "requirement:v1";
  value.propertyTypes = cleanArray(value.propertyTypes, 6);
  value.locationLogic = value.locationLogic && typeof value.locationLogic === "object" ? value.locationLogic : {};
  value.locationLogic.marketAnchor = value.locationLogic.marketAnchor && typeof value.locationLogic.marketAnchor === "object" ? value.locationLogic.marketAnchor : {};
  if (!value.locationLogic.marketAnchor.marketId && entryContext.marketId) value.locationLogic.marketAnchor.marketId = entryContext.marketId;
  if (!value.locationLogic.marketAnchor.geographyId && entryContext.marketId) value.locationLogic.marketAnchor.geographyId = entryContext.marketId;
  if (!value.propertyTypes.length && entryContext.propertyType) value.propertyTypes = [entryContext.propertyType];
  value.locationLogic.specificPreference = value.locationLogic.specificPreference && typeof value.locationLogic.specificPreference === "object" ? value.locationLogic.specificPreference : {};
  const requirementCandidates = cleanArray(value.locationLogic.specificPreference.candidateDistrictIds);
  value.locationLogic.specificPreference.candidateDistrictIds = cleanArray([...requirementCandidates, ...cleanArray(entryContext.candidateDistrictIds)]);
  value.updatedAt = new Date().toISOString();
  return value;
}

function presentationFor(item = {}) {
  const slug = item.canonicalDistrictId || item.districtId || "";
  return districtPresentations.districts[slug] || { districtId: slug, districtName: item.districtName || slug, districtPath: "", image: null, representativeBuildings: [] };
}

function assessmentForDistrict(requirement, district, item) {
    const canonicalSupported = district.dimensions.canonicalGeography.status === "REVIEWED";
    const propertySupported = district.dimensions.propertyTypeFit.status === "REVIEWED" && ["GOOD", "STRONG"].includes(district.dimensions.propertyTypeFit.band);
    const supportedDimensions = [district.dimensions.accessIntelligence, district.dimensions.businessEnvironment]
      .filter((dimension) => dimension.status === "REVIEWED" && ["GOOD", "STRONG"].includes(dimension.band));
    const hasReviewedExplanation = Boolean(item) && (item.strengths || []).length > 0 && (item.office?.evidenceSources || []).length > 0;
    const useful = canonicalSupported && propertySupported && supportedDimensions.length > 0 && hasReviewedExplanation;
    const unresolved = Object.entries(district.dimensions).filter(([, dimension]) => ["UNKNOWN", "PARTIAL", "MISSING"].includes(dimension.status));
    const wellSupported = useful && !unresolved.length && district.evaluationStatus === "EVALUATED";
    const assessmentStatus = wellSupported ? "WELL_SUPPORTED" : useful ? "PARTIALLY_SUPPORTED" : "INSUFFICIENT";
    const employeeOrigins = criterionText(requirement, "universal.location.employee_origins");
    const accessUnknown = unresolved.some(([dimension]) => dimension === "accessIntelligence" || dimension === "evidenceConfidence");
    const explicitUnknowns = accessUnknown && employeeOrigins
      ? [`Rofo has not yet established how well ${district.districtName} serves employees coming from ${employeeOrigins}.`]
      : district.reasons;
    return {
      districtId: district.districtId, districtName: district.districtName,
      sourceDistrictIds: district.memberDistrictIds,
      assessmentStatus,
      reasons: useful ? (item.strengths || []).slice(0, 3) : [],
      tradeoffs: useful ? (item.tradeoffs || []).slice(0, 2) : [],
      unknowns: useful ? [...new Set([...(item.unknowns || []), ...explicitUnknowns])] : district.reasons,
      componentResult: useful ? item : null,
      presentation: presentationFor(item || district),
    };
}

function candidateAssessments(requirement, result) {
  const requested = new Set(requirement.locationLogic?.specificPreference?.candidateDistrictIds || []);
  if (!requested.size) return [];
  const considered = result.candidateComposition?.considered || [];
  return result.plausibleCandidateUniverse.filter((district) =>
    district.memberDistrictIds.some((id) => requested.has(id)) || requested.has(district.districtId)
  ).map((district) => {
    const item = considered.find((candidate) => candidate.districtId === district.districtId);
    return assessmentForDistrict(requirement, district, item);
  });
}

function supportedDifferences(candidate, alternative) {
  const differences = [];
  const candidateItem = candidate.componentResult;
  const alternativeItem = alternative.componentResult;
  if (!candidateItem || !alternativeItem) return differences;
  if (candidateItem.environment.band !== alternativeItem.environment.band) differences.push({ id: "business_environment", label: "Business environment", candidateValue: candidateItem.environment.band, alternativeValue: alternativeItem.environment.band });
  const contextualEnvironmentReason = (value) => !/^This district matches|^Business type:/i.test(value) && !/is supported by this district's reviewed business-environment pattern/i.test(value);
  const candidateEnvironment = candidateItem.environment.reasons.find(contextualEnvironmentReason) || "";
  const alternativeEnvironment = alternativeItem.environment.reasons.find(contextualEnvironmentReason) || "";
  if (candidateEnvironment && alternativeEnvironment && candidateEnvironment !== alternativeEnvironment) differences.push({ id: "district_character", label: "District character", candidateValue: candidateEnvironment, alternativeValue: alternativeEnvironment });
  if (candidateItem.office.band !== alternativeItem.office.band) differences.push({ id: "office_fit", label: "Office fit", candidateValue: candidateItem.office.band, alternativeValue: alternativeItem.office.band });
  if (candidateItem.office.summary && alternativeItem.office.summary && candidateItem.office.summary !== alternativeItem.office.summary) differences.push({ id: "office_character", label: "Office character", candidateValue: candidateItem.office.summary, alternativeValue: alternativeItem.office.summary });
  if (candidateItem.parkingEnvironment !== alternativeItem.parkingEnvironment && ![candidateItem.parkingEnvironment, alternativeItem.parkingEnvironment].includes("UNKNOWN")) differences.push({ id: "parking", label: "Parking", candidateValue: candidateItem.parkingEnvironment, alternativeValue: alternativeItem.parkingEnvironment });
  if (candidateItem.accessComponent.band === "UNKNOWN" && alternativeItem.accessComponent.band === "UNKNOWN") differences.push({ id: "employee_access_shared_unknown", label: "Employee access", candidateValue: "UNKNOWN", alternativeValue: "UNKNOWN", sharedUnknown: true });
  return differences;
}

function comparisonAlternatives(requirement, result, assessments) {
  if (result.readiness !== "INVESTIGATE" || !assessments.some((item) => ["WELL_SUPPORTED", "PARTIALLY_SUPPORTED"].includes(item.assessmentStatus))) return [];
  if (result.propertyType !== "office") return [];
  const candidateIds = new Set(assessments.flatMap((item) => [item.districtId, ...item.sourceDistrictIds]));
  const universe = new Map(result.plausibleCandidateUniverse.map((item) => [item.districtId, item]));
  const candidate = assessments.find((item) => ["WELL_SUPPORTED", "PARTIALLY_SUPPORTED"].includes(item.assessmentStatus));
  const considered = result.candidateComposition?.considered || [];
  const alternatives = considered.map((item, existingOrder) => {
    const district = universe.get(item.districtId);
    if (!district || candidateIds.has(item.districtId)) return null;
    const assessment = assessmentForDistrict(requirement, district, item);
    if (!["WELL_SUPPORTED", "PARTIALLY_SUPPORTED"].includes(assessment.assessmentStatus)) return null;
    const differences = supportedDifferences(candidate, assessment);
    const meaningful = differences.filter((difference) => !difference.sharedUnknown);
    if (!meaningful.length) return null;
    const businessRelevant = district.activation.some((activation) => activation.signal === "Business Environment activation");
    return { assessment, differences, meaningful, businessRelevant, existingOrder };
  }).filter(Boolean);
  const relevant = alternatives.some((item) => item.businessRelevant) ? alternatives.filter((item) => item.businessRelevant) : alternatives;
  const selected = relevant.sort((a, b) => a.existingOrder - b.existingOrder)[0];
  if (!selected) return [];
  return [{
    ...selected.assessment,
    comparisonReason: selected.assessment.componentResult.office.summary,
    differences: selected.differences,
    selectionReason: "Independently assessable, activated by the active Business Environment signal, meaningfully different from the candidate, then selected in unchanged composition order.",
  }];
}

export function calculateSnapshot(requirement) {
  const result = readinessEngine.evaluateRecommendationReadiness(requirement, dependencies);
  const assessments = candidateAssessments(requirement, result);
  return {
    schemaVersion: SNAPSHOT_VERSION,
    readiness: result.readiness,
    rationale: result.rationale,
    plausibleUniverse: result.plausibleCandidateUniverse,
    shortlist: result.shortlist.map((item) => ({ ...item, presentation: presentationFor(item) })),
    candidateAssessments: assessments,
    comparisonAlternatives: comparisonAlternatives(requirement, result, assessments),
    comparison: result.composition && result.composition.candidateContext || [],
    explanations: result.shortlist.map((item) => ({ districtId: item.districtId, districtName: item.districtName, strengths: item.strengths || [], tradeoffs: item.tradeoffs || [], unknowns: item.unknowns || [], employeeAccessSummary: item.accessComponent && item.accessComponent.summary || "" })),
    intelligenceGaps: result.intelligenceGaps,
    productResponse: result.productResponse,
    engineVersion: ENGINE_VERSION,
    foundationVersions: { access: accessFoundation.version, composition: compositionFoundation.schemaVersion, office: sfOfficeModel.version || sfOfficeModel.schemaVersion || "sf-office-recommendation-model" },
  };
}

export function storageKind(env) { return env.LOCATION_BRIEFS_DB || env.LEADS_DB ? "d1" : env.LOCATION_BRIEFS_KV || env.LEADS_KV ? "kv" : ""; }
function db(env) { return env.LOCATION_BRIEFS_DB || env.LEADS_DB || null; }
function kv(env) { return env.LOCATION_BRIEFS_KV || env.LEADS_KV || null; }

export async function ensureV2Tables(database) {
  const statements = [
    `create table if not exists location_briefs_v2 (id text primary key, public_id text not null unique, schema_version text not null, lifecycle_stage text not null, current_requirement_revision_id text, current_recommendation_snapshot_id text, entry_context_id text not null, owner_capability_hash text not null, created_at text not null, updated_at text not null, archived_at text)`,
    `create table if not exists location_brief_v2_entry_contexts (id text primary key, brief_id text not null, context_json text not null, created_at text not null)`,
    `create table if not exists location_brief_v2_requirement_revisions (id text primary key, brief_id text not null, revision_number integer not null, requirement_json text not null, changed_by text not null, created_at text not null, unique(brief_id, revision_number))`,
    `create table if not exists location_brief_v2_recommendation_snapshots (id text primary key, brief_id text not null, requirement_revision_id text not null, readiness text not null, snapshot_json text not null, engine_version text not null, created_at text not null)`,
    `create table if not exists location_brief_v2_candidates (id text primary key, brief_id text not null, canonical_district_id text not null, presentation_group_id text, source_identity text, provenance_json text not null, disposition text not null, created_at text not null, updated_at text not null, unique(brief_id, canonical_district_id))`,
    `create table if not exists location_brief_v2_intelligence_gaps (id text primary key, brief_id text not null, requirement_revision_id text not null, recommendation_snapshot_id text not null, market_id text not null, property_type text not null, district_id text not null, intelligence_dimension text not null, requirement_signal text, materiality text, blocking_status text, reason text, observed_at text not null)`,
    `create table if not exists location_brief_v2_creation_requests (request_id text primary key, public_id text not null, created_at text not null)`,
  ];
  for (const sql of statements) await database.prepare(sql).run();
}
export async function findCreationRequest(env, requestId) {
  const normalized = clean(requestId, 120);
  if (!normalized) return null;
  if (storageKind(env) === "d1") {
    const database = db(env); await ensureV2Tables(database);
    const row = await database.prepare(`select public_id from location_brief_v2_creation_requests where request_id = ?`).bind(normalized).first();
    return row?.public_id || null;
  }
  if (storageKind(env) === "kv") return await kv(env).get(`location-brief-v2-create:${normalized}`) || null;
  return null;
}
export async function recordCreationRequest(env, requestId, publicId) {
  const normalized = clean(requestId, 120); if (!normalized) return;
  if (storageKind(env) === "d1") {
    const database = db(env); await ensureV2Tables(database);
    await database.prepare(`insert or ignore into location_brief_v2_creation_requests values (?, ?, ?)`).bind(normalized, publicId, new Date().toISOString()).run(); return;
  }
  if (storageKind(env) === "kv") await kv(env).put(`location-brief-v2-create:${normalized}`, publicId, { expirationTtl: 86400 });
}

function gapRows(brief, revision, snapshot, requirement) {
  const marketId = clean(requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId, 120);
  const propertyType = clean(requirement.propertyTypes?.[0], 80);
  return (snapshot.intelligenceGaps || []).map((gap) => ({
    id: crypto.randomUUID(), briefId: brief.id, requirementRevisionId: revision.id, recommendationSnapshotId: snapshot.id,
    marketId, propertyType, districtId: clean(gap.districtId, 180), intelligenceDimension: clean(gap.intelligenceDimension || gap.dimension, 120),
    requirementSignal: clean(gap.requirementSignal, 240), materiality: clean(gap.materiality, 80),
    blockingStatus: clean(gap.blockStatus || gap.blockingStatus, 80), reason: clean(gap.reason, 500), observedAt: snapshot.createdAt,
  })).filter((gap) => gap.districtId && gap.intelligenceDimension);
}
function gapStatements(database, brief, revision, snapshot, requirement) {
  return gapRows(brief, revision, snapshot, requirement).map((gap) => database.prepare(`insert into location_brief_v2_intelligence_gaps values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
    gap.id, gap.briefId, gap.requirementRevisionId, gap.recommendationSnapshotId, gap.marketId, gap.propertyType, gap.districtId,
    gap.intelligenceDimension, gap.requirementSignal, gap.materiality, gap.blockingStatus, gap.reason, gap.observedAt,
  ));
}

function ownerCookie(publicId, token) { return `${OWNER_COOKIE}=${encodeURIComponent(`${publicId}.${token}`)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`; }
function parseCookies(request) { return Object.fromEntries(String(request.headers.get("cookie") || "").split(";").map((part) => part.trim().split(/=(.*)/s)).filter(([key]) => key).map(([key, value]) => [key, decodeURIComponent(value || "")])); }
export async function ownsBrief(request, brief) {
  const [publicId, token] = String(parseCookies(request)[OWNER_COOKIE] || "").split(".");
  return Boolean(publicId === brief.publicId && token && await sha256(token) === brief.ownerCapabilityHash);
}
export function commercialContextForBundle(bundle) {
  const requirement = bundle?.currentRevision?.requirement || {};
  const snapshot = bundle?.currentSnapshot || {};
  const criterion = (dimension) => criterionText(requirement, dimension);
  return {
    briefPublicId: bundle?.brief?.publicId || "",
    marketId: requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId || "",
    propertyType: requirement.propertyTypes?.[0] || "",
    business: criterion("universal.business.type") || requirement.businessContext?.summary || "",
    employeeOrigins: criterion("universal.location.employee_origins"),
    customerOrigins: criterion("universal.location.customer_origins"),
    transitImportance: criterion("universal.access.transit_importance"),
    parkingImportance: criterion("universal.access.parking_importance"),
    candidateDistrictIds: requirement.locationLogic?.specificPreference?.candidateDistrictIds || [],
    guidanceDistricts: (snapshot.shortlist || []).map((item) => item.districtName).filter(Boolean),
    readiness: snapshot.readiness || "",
    sourceType: bundle?.entryContext?.sourceType || "",
    sourcePath: bundle?.entryContext?.sourcePath || "",
  };
}

function ids() { return { briefId: crypto.randomUUID(), publicId: `LB2-${randomToken(12).toUpperCase()}`, ownerToken: randomToken(32), entryId: crypto.randomUUID(), revisionId: crypto.randomUUID(), snapshotId: crypto.randomUUID() }; }
function candidateRows(briefId, entryContext, now) {
  const seen = new Set();
  return cleanArray(entryContext.candidateDistrictIds).map((sourceId) => {
    const group = (compositionFoundation.presentationGroups || []).find((item) => item.memberDistrictIds.includes(sourceId));
    const canonicalDistrictId = group?.canonicalDistrictId || sourceId;
    if (seen.has(canonicalDistrictId)) return null;
    seen.add(canonicalDistrictId);
    const memberSources = cleanArray(entryContext.candidateDistrictIds).filter((candidateId) => candidateId === canonicalDistrictId || group?.memberDistrictIds.includes(candidateId));
    return { id: crypto.randomUUID(), briefId, canonicalDistrictId, presentationGroupId: group?.presentationGroupId || "", sourceIdentity: sourceId, provenance: memberSources.map((identity) => ({ sourceType: entryContext.sourceType, sourceIdentity: identity })), disposition: "considering", createdAt: now, updatedAt: now };
  }).filter(Boolean);
}

export async function createBrief(env, rawRequirement, rawEntryContext = {}, changedBy = "anonymous_operator") {
  const now = new Date().toISOString(); const generated = ids();
  const entryContext = { ...normalizeEntryContext(rawEntryContext), entryContextId: generated.entryId };
  const requirement = canonicalRequirement(rawRequirement, entryContext);
  const snapshotBody = calculateSnapshot(requirement);
  const ownerCapabilityHash = await sha256(generated.ownerToken);
  const revision = { id: generated.revisionId, briefId: generated.briefId, schemaVersion: REQUIREMENT_REVISION_VERSION, revisionNumber: 1, requirement, changedBy, createdAt: now };
  const snapshot = { id: generated.snapshotId, briefId: generated.briefId, requirementRevisionId: revision.id, ...snapshotBody, createdAt: now };
  const brief = { id: generated.briefId, publicId: generated.publicId, schemaVersion: V2_SCHEMA_VERSION, lifecycleStage: snapshot.readiness === "INVESTIGATE" ? "LOCATION_INVESTIGATE" : "LOCATIONS_RECOMMENDED", currentRequirementRevisionId: revision.id, currentRecommendationSnapshotId: snapshot.id, entryContextId: entryContext.entryContextId, ownerCapabilityHash, createdAt: now, updatedAt: now, archivedAt: null };
  const candidates = candidateRows(brief.id, entryContext, now);
  const kind = storageKind(env);
  if (kind === "d1") {
    const database = db(env); await ensureV2Tables(database);
    await database.batch([
      database.prepare(`insert into location_briefs_v2 values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(brief.id, brief.publicId, brief.schemaVersion, brief.lifecycleStage, revision.id, snapshot.id, brief.entryContextId, brief.ownerCapabilityHash, now, now, null),
      database.prepare(`insert into location_brief_v2_entry_contexts values (?, ?, ?, ?)`).bind(entryContext.entryContextId, brief.id, JSON.stringify(entryContext), now),
      database.prepare(`insert into location_brief_v2_requirement_revisions values (?, ?, ?, ?, ?, ?)`).bind(revision.id, brief.id, 1, JSON.stringify(requirement), revision.changedBy, now),
      database.prepare(`insert into location_brief_v2_recommendation_snapshots values (?, ?, ?, ?, ?, ?, ?)`).bind(snapshot.id, brief.id, revision.id, snapshot.readiness, JSON.stringify(snapshot), snapshot.engineVersion, now),
      ...candidates.map((item) => database.prepare(`insert into location_brief_v2_candidates values (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(item.id, item.briefId, item.canonicalDistrictId, item.presentationGroupId, item.sourceIdentity, JSON.stringify(item.provenance), item.disposition, now, now)),
      ...gapStatements(database, brief, revision, snapshot, requirement),
    ]);
  } else if (kind === "kv") {
    const store = kv(env); await store.put(`location-brief-v2:${brief.publicId}`, JSON.stringify({ brief, entryContext, revisions: [revision], snapshots: [snapshot], candidates }));
  } else throw new Error("Missing Location Brief storage binding.");
  return { brief, entryContext, revision, snapshot, candidates, ownerToken: generated.ownerToken, setCookie: ownerCookie(brief.publicId, generated.ownerToken) };
}

function rowBrief(row) { return row && { id: row.id, publicId: row.public_id, schemaVersion: row.schema_version, lifecycleStage: row.lifecycle_stage, currentRequirementRevisionId: row.current_requirement_revision_id, currentRecommendationSnapshotId: row.current_recommendation_snapshot_id, entryContextId: row.entry_context_id, ownerCapabilityHash: row.owner_capability_hash, createdAt: row.created_at, updatedAt: row.updated_at, archivedAt: row.archived_at }; }
export async function getBriefBundle(env, publicId, includeHistory = false) {
  const normalized = clean(publicId, 80).toUpperCase(); const kind = storageKind(env);
  if (kind === "d1") {
    const database = db(env); await ensureV2Tables(database);
    const row = await database.prepare(`select * from location_briefs_v2 where public_id = ?`).bind(normalized).first(); if (!row) return null;
    const brief = rowBrief(row);
    const entryRow = await database.prepare(`select context_json from location_brief_v2_entry_contexts where id = ?`).bind(brief.entryContextId).first();
    const revisionRows = await database.prepare(`select * from location_brief_v2_requirement_revisions where brief_id = ? order by revision_number`).bind(brief.id).all();
    const snapshotRows = await database.prepare(`select snapshot_json from location_brief_v2_recommendation_snapshots where brief_id = ? order by created_at`).bind(brief.id).all();
    const candidateResult = await database.prepare(`select * from location_brief_v2_candidates where brief_id = ? order by created_at`).bind(brief.id).all();
    const revisions = (revisionRows.results || []).map((item) => ({ id: item.id, briefId: item.brief_id, revisionNumber: item.revision_number, requirement: JSON.parse(item.requirement_json), changedBy: item.changed_by, createdAt: item.created_at }));
    const snapshots = (snapshotRows.results || []).map((item) => JSON.parse(item.snapshot_json));
    const candidates = (candidateResult.results || []).map((item) => ({ canonicalDistrictId: item.canonical_district_id, presentationGroupId: item.presentation_group_id, sourceIdentity: item.source_identity, provenance: JSON.parse(item.provenance_json), disposition: item.disposition }));
    const currentRevision = revisions.find((item) => item.id === brief.currentRequirementRevisionId); const currentSnapshot = snapshots.find((item) => item.id === brief.currentRecommendationSnapshotId);
    return { brief, entryContext: JSON.parse(entryRow.context_json), currentRevision, currentSnapshot, candidates, ...(includeHistory ? { revisions, snapshots } : {}) };
  }
  if (kind === "kv") {
    const bundle = await kv(env).get(`location-brief-v2:${normalized}`, "json"); if (!bundle) return null;
    const currentRevision = bundle.revisions.find((item) => item.id === bundle.brief.currentRequirementRevisionId); const currentSnapshot = bundle.snapshots.find((item) => item.id === bundle.brief.currentRecommendationSnapshotId);
    return { brief: bundle.brief, entryContext: bundle.entryContext, currentRevision, currentSnapshot, candidates: bundle.candidates || [], ...(includeHistory ? { revisions: bundle.revisions, snapshots: bundle.snapshots } : {}) };
  }
  throw new Error("Missing Location Brief storage binding.");
}

export async function reviseBrief(env, bundle, rawRequirement, expectedRevision, changedBy = "anonymous_operator") {
  if (Number(expectedRevision) !== Number(bundle.currentRevision.revisionNumber)) { const error = new Error("The Brief changed in another session. Refresh before saving."); error.status = 409; throw error; }
  const now = new Date().toISOString(); const requirement = canonicalRequirement(rawRequirement, bundle.entryContext); const revision = { id: crypto.randomUUID(), briefId: bundle.brief.id, schemaVersion: REQUIREMENT_REVISION_VERSION, revisionNumber: bundle.currentRevision.revisionNumber + 1, requirement, changedBy, createdAt: now };
  const snapshot = { id: crypto.randomUUID(), briefId: bundle.brief.id, requirementRevisionId: revision.id, ...calculateSnapshot(requirement), createdAt: now };
  const lifecycleStage = snapshot.readiness === "INVESTIGATE" ? "LOCATION_INVESTIGATE" : "LOCATIONS_RECOMMENDED";
  if (storageKind(env) === "d1") {
    const database = db(env); await database.batch([
      database.prepare(`insert into location_brief_v2_requirement_revisions values (?, ?, ?, ?, ?, ?)`).bind(revision.id, revision.briefId, revision.revisionNumber, JSON.stringify(requirement), revision.changedBy, now),
      database.prepare(`insert into location_brief_v2_recommendation_snapshots values (?, ?, ?, ?, ?, ?, ?)`).bind(snapshot.id, snapshot.briefId, revision.id, snapshot.readiness, JSON.stringify(snapshot), snapshot.engineVersion, now),
      database.prepare(`update location_briefs_v2 set lifecycle_stage = ?, current_requirement_revision_id = ?, current_recommendation_snapshot_id = ?, updated_at = ? where id = ? and current_requirement_revision_id = ?`).bind(lifecycleStage, revision.id, snapshot.id, now, bundle.brief.id, bundle.currentRevision.id),
      ...gapStatements(database, bundle.brief, revision, snapshot, requirement),
    ]);
  } else {
    const store = kv(env); const key = `location-brief-v2:${bundle.brief.publicId}`; const record = await store.get(key, "json");
    if (record.brief.currentRequirementRevisionId !== bundle.currentRevision.id) { const error = new Error("The Brief changed in another session. Refresh before saving."); error.status = 409; throw error; }
    record.revisions.push(revision); record.snapshots.push(snapshot); Object.assign(record.brief, { lifecycleStage, currentRequirementRevisionId: revision.id, currentRecommendationSnapshotId: snapshot.id, updatedAt: now }); await store.put(key, JSON.stringify(record));
  }
  return { revision, snapshot };
}

export const __test = { cleanArray, stripUiState, candidateRows, ownerCookie };
