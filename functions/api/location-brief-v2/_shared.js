import readinessEngine from "../../../lib/recommendations/private-recommendation-readiness.js";
import accessFoundation from "../../../_data/sfAccessFoundationV0.js";
import compositionFoundation from "../../../_data/sfOfficeCompositionFoundation.js";
import sfOfficeModel from "../../../_data/sfOfficeRecommendationModel.js";
import sfRetailFoundation from "../../../_data/sfRetailCompositionFoundation.js";
import sfIndustrialFlexFoundation from "../../../_data/sfIndustrialFlexCompositionFoundation.js";
import sanDiegoIndustrialFlexFoundation from "../../../_data/sanDiegoIndustrialFlexCompositionFoundation.js";
import northOrangeCountyIndustrialFlexFoundation from "../../../_data/northOrangeCountyIndustrialFlexEvidenceFoundation.js";
import districtGeography from "../../../_data/requirementPrototypeDistrictGeography.js";
import districtPresentations from "../../../data/generated/location-brief-district-presentation.json";
import universalIntelligence from "../../../lib/intelligence/universal-space-type-intelligence.js";
import recommendationActivationRegistry from "../../../_data/recommendationActivationRegistry.js";

const { projectUniversalIntelligence } = universalIntelligence;

export const V2_SCHEMA_VERSION = "location-brief:v2";
export const ENTRY_CONTEXT_VERSION = "entry-context:v1";
export const REQUIREMENT_REVISION_VERSION = "requirement-revision:v1";
export const SNAPSHOT_VERSION = "location-recommendation-snapshot:v1";
export const PROPERTY_REQUIREMENT_DRAFT_VERSION = "property-requirement-draft:v1";
export const OWNER_COOKIE = "rofo_lb_v2_owner";
export const ENGINE_VERSION = readinessEngine.VERSION;
export const PUBLIC_SF_OFFICE_FLAG = "LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_ENABLED";
export const PUBLIC_SF_RETAIL_FLAG = "LOCATION_BRIEF_V2_PUBLIC_SF_RETAIL_ENABLED";
export const PUBLIC_SF_INDUSTRIAL_FLEX_FLAG = "LOCATION_BRIEF_V2_PUBLIC_SF_INDUSTRIAL_FLEX_ENABLED";
export const PUBLIC_SAN_DIEGO_INDUSTRIAL_FLEX_FLAG = "LOCATION_BRIEF_V2_PUBLIC_SAN_DIEGO_INDUSTRIAL_FLEX_ENABLED";
export const PUBLIC_UNIVERSAL_FLAG = "LOCATION_BRIEF_V2_PUBLIC_UNIVERSAL_ENABLED";
export const PUBLIC_ENTRY_FLAG = "LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED";
export const PUBLIC_SOURCE_ALLOWLIST = "LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES";
export const CANONICAL_PUBLIC_SOURCES = Object.freeze(["homepage", "header", "city", "space_type", "district", "example", "market_guide", "comparison", "business_brief", "product_education", "insight", "building"]);
const SAN_DIEGO_INDUSTRIAL_FLEX_ENTRY_IDS = Object.freeze(["miramar", "otay-mesa", "kearny-mesa", "sorrento-mesa", "sorrento-valley"]);
const SAN_DIEGO_ACTIVATION = recommendationActivationRegistry.flows["san-diego:industrial_flex:bounded"];
const NORTH_ORANGE_COUNTY_ACTIVATION = recommendationActivationRegistry.flows["north-orange-county:industrial_flex:bounded"];
const NORTH_ORANGE_COUNTY_MARKET_IDS = Object.freeze(["anaheim", "fullerton"]);
const NORTH_ORANGE_COUNTY_ENTRY_IDS = Object.freeze(["anaheim-canyon", "fullerton-industrial-service-area"]);

const dependencies = { accessFoundation, compositionFoundation, sfOfficeModel, sfRetailFoundation, sfIndustrialFlexFoundation, sanDiegoIndustrialFlexFoundation, northOrangeCountyIndustrialFlexFoundation, districtGeography };
const encoder = new TextEncoder();

function clean(value, max = 1000) { return String(value == null ? "" : value).trim().slice(0, max); }
function cleanArray(value, max = 20) { return Array.isArray(value) ? [...new Set(value.map((item) => clean(item, 180)).filter(Boolean))].slice(0, max) : []; }
function criterionText(requirement, dimension) {
  const value = (requirement.criteria || []).find((item) => item.dimension === dimension)?.value || {};
  return (value.list || []).join(" + ") || value.text || "";
}
function businessIdentity(requirement) {
  const value = (requirement.criteria || []).find((item) => item.dimension === "universal.business.type")?.value || {};
  const list = cleanArray(value.list, 4);
  if (list.length) return { canonical: list[0], specific: list[1] && list[1] !== list[0] ? list[1] : "" };
  return { canonical: "", specific: clean(value.text || requirement.businessContext?.summary, 140) };
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
export function publicV2Enabled(env, propertyType = "") {
  if (!propertyType) return [PUBLIC_SF_OFFICE_FLAG, PUBLIC_SF_RETAIL_FLAG, PUBLIC_SF_INDUSTRIAL_FLEX_FLAG, PUBLIC_UNIVERSAL_FLAG].some((flag) => String(env && env[flag] || "false").toLowerCase() === "true");
  const flag = propertyType === "retail_service" ? PUBLIC_SF_RETAIL_FLAG : propertyType === "industrial_flex" ? PUBLIC_SF_INDUSTRIAL_FLEX_FLAG : PUBLIC_SF_OFFICE_FLAG;
  return String(env && env[flag] || "false").toLowerCase() === "true";
}
export function publicSourceAllowed(env, sourceType) {
  const configured = clean(env && env[PUBLIC_SOURCE_ALLOWLIST] || CANONICAL_PUBLIC_SOURCES.join(","), 500).split(",").map((item) => item.trim()).filter(Boolean);
  return configured.includes(clean(sourceType, 80));
}
export function publicEntryEnabled(env) { return String(env && env[PUBLIC_ENTRY_FLAG] || "false").toLowerCase() === "true"; }
export function sanDiegoIndustrialFlexEnabled(env) { return String(env && env[PUBLIC_SAN_DIEGO_INDUSTRIAL_FLEX_FLAG] || "false").toLowerCase() === "true"; }
export function publicGlobalCohortEnabled(env) { return publicEntryEnabled(env) && [PUBLIC_UNIVERSAL_FLAG, PUBLIC_SF_OFFICE_FLAG, PUBLIC_SF_RETAIL_FLAG, PUBLIC_SF_INDUSTRIAL_FLEX_FLAG].every((flag) => String(env && env[flag] || "false").toLowerCase() === "true"); }
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
export function isSfRetailRequirement(requirement = {}) {
  const market = clean(requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId, 120).toLowerCase();
  const propertyTypes = cleanArray(requirement.propertyTypes, 6).map((item) => item.toLowerCase());
  return market === "san-francisco" && propertyTypes.length === 1 && propertyTypes[0] === "retail_service";
}
export function isSfRetailEntryContext(input = {}) {
  const context = normalizeEntryContext(input);
  return context.marketId === "san-francisco" && context.propertyType === "retail_service";
}
export function isSfIndustrialFlexRequirement(requirement = {}) {
  const market = clean(requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId, 120).toLowerCase();
  const propertyTypes = cleanArray(requirement.propertyTypes, 6).map((item) => item.toLowerCase());
  return market === "san-francisco" && propertyTypes.length === 1 && propertyTypes[0] === "industrial_flex";
}
export function isSfIndustrialFlexEntryContext(input = {}) { const context = normalizeEntryContext(input); return context.marketId === "san-francisco" && context.propertyType === "industrial_flex"; }
export function isSanDiegoIndustrialFlexRequirement(requirement = {}) {
  const market = clean(requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId, 120).toLowerCase();
  const propertyTypes = cleanArray(requirement.propertyTypes, 6).map((item) => item.toLowerCase());
  const candidates = cleanArray(requirement.locationLogic?.specificPreference?.candidateDistrictIds).map((item) => item.toLowerCase());
  return market === "san-diego" && propertyTypes.length === 1 && propertyTypes[0] === "industrial_flex" && candidates.every((item) => SAN_DIEGO_INDUSTRIAL_FLEX_ENTRY_IDS.includes(item));
}
export function isSanDiegoIndustrialFlexEntryContext(input = {}) {
  const context = normalizeEntryContext(input);
  const candidates = context.candidateDistrictIds.map((item) => item.toLowerCase());
  return context.marketId === "san-diego" && context.propertyType === "industrial_flex" && candidates.every((item) => SAN_DIEGO_INDUSTRIAL_FLEX_ENTRY_IDS.includes(item));
}
export function isNorthOrangeCountyIndustrialFlexRequirement(requirement = {}) {
  const market = clean(requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId, 120).toLowerCase();
  const propertyTypes = cleanArray(requirement.propertyTypes, 6).map((item) => item.toLowerCase());
  const candidates = cleanArray(requirement.locationLogic?.specificPreference?.candidateDistrictIds).map((item) => item.toLowerCase());
  return NORTH_ORANGE_COUNTY_MARKET_IDS.includes(market) && propertyTypes.length === 1 && propertyTypes[0] === "industrial_flex" && candidates.every((item) => NORTH_ORANGE_COUNTY_ENTRY_IDS.includes(item));
}
export function isNorthOrangeCountyIndustrialFlexEntryContext(input = {}) {
  const context = normalizeEntryContext(input);
  const candidates = context.candidateDistrictIds.map((item) => item.toLowerCase());
  return NORTH_ORANGE_COUNTY_MARKET_IDS.includes(context.marketId) && context.propertyType === "industrial_flex" && candidates.every((item) => NORTH_ORANGE_COUNTY_ENTRY_IDS.includes(item));
}
export function isSupportedPublicRequirement(requirement = {}) { return isSfOfficeRequirement(requirement) || isSfRetailRequirement(requirement) || isSfIndustrialFlexRequirement(requirement); }
export function isSupportedPublicEntryContext(input = {}) { return isSfOfficeEntryContext(input) || isSfRetailEntryContext(input) || isSfIndustrialFlexEntryContext(input); }
export function isUniversalPublicRequirement(requirement = {}) {
  const market = clean(requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId, 120).toLowerCase();
  const propertyTypes = cleanArray(requirement.propertyTypes, 6).map((item) => item.toLowerCase());
  return Boolean(market) && market !== "san-francisco" && propertyTypes.length === 1 && ["office", "retail_service", "industrial_flex"].includes(propertyTypes[0]);
}
export function publicRequirementEligible(env, requirement = {}) {
  if (isSfOfficeRequirement(requirement)) return publicV2Enabled(env, "office");
  if (isSfRetailRequirement(requirement)) return publicV2Enabled(env, "retail_service");
  if (isSfIndustrialFlexRequirement(requirement)) return publicV2Enabled(env, "industrial_flex");
  if (isSanDiegoIndustrialFlexRequirement(requirement)) return publicEntryEnabled(env) && sanDiegoIndustrialFlexEnabled(env);
  if (isNorthOrangeCountyIndustrialFlexRequirement(requirement)) return false;
  return isUniversalPublicRequirement(requirement) && String(env && env[PUBLIC_UNIVERSAL_FLAG] || "false").toLowerCase() === "true";
}
export function publicEntryContextEligible(env, input = {}) {
  if (!publicEntryEnabled(env)) return false;
  const context = normalizeEntryContext(input);
  if (!context.marketId || !context.propertyType) return publicGlobalCohortEnabled(env);
  if (isSanDiegoIndustrialFlexEntryContext(context)) return sanDiegoIndustrialFlexEnabled(env);
  if (isNorthOrangeCountyIndustrialFlexEntryContext(context)) return false;
  if (context.marketId !== "san-francisco") return ["office", "retail_service", "industrial_flex"].includes(context.propertyType) && String(env && env[PUBLIC_UNIVERSAL_FLAG] || "false").toLowerCase() === "true";
  if (context.propertyType === "retail_service") return publicV2Enabled(env, "retail_service");
  if (context.propertyType === "industrial_flex") return publicV2Enabled(env, "industrial_flex");
  return context.propertyType === "office" && publicV2Enabled(env, "office");
}
export async function recommendationRuntimeActivationState(env, marketId, propertyType, cohort = "bounded") {
  const flow = Object.values(recommendationActivationRegistry.flows).find((item) => item.marketId === clean(marketId, 120).toLowerCase() && item.propertyType === clean(propertyType, 80).toLowerCase() && item.cohort === clean(cohort, 80).toLowerCase());
  if (!flow) return { enabled: false, source: "uncertified", reason: "UNRECOGNIZED_CERTIFIED_FLOW" };
  if (flow.activationEligible !== true || flow.certificationStatus !== "certified_for_bounded_real_user_cohort") return { enabled: false, source: "uncertified", reason: "FLOW_NOT_CERTIFIED_FOR_ACTIVATION" };
  const database = env && (env.RECOMMENDATION_ACTIVATIONS_DB || env.LOCATION_BRIEFS_DB || env.LEADS_DB);
  if (!database) {
    const legacyEnabled = flow.activationKey === SAN_DIEGO_ACTIVATION.activationKey && sanDiegoIndustrialFlexEnabled(env);
    return { enabled: legacyEnabled, source: "legacy_environment", reason: legacyEnabled ? "LEGACY_FLAG_ON" : "RUNTIME_STORE_UNAVAILABLE" };
  }
  try {
    const row = await database.prepare(`select activation_key, market_id, property_type, cohort, enabled, certification_id, updated_at, updated_by from recommendation_runtime_activations where activation_key = ? limit 1`).bind(flow.activationKey).first();
    const valid = row
      && row.activation_key === flow.activationKey
      && row.market_id === flow.marketId
      && row.property_type === flow.propertyType
      && row.cohort === flow.cohort
      && row.certification_id === flow.certificationId
      && (row.enabled === 0 || row.enabled === 1);
    if (!valid) return { enabled: false, source: "runtime_d1", reason: row ? "MALFORMED_RUNTIME_RECORD" : "MISSING_RUNTIME_RECORD" };
    return { enabled: row.enabled === 1, source: "runtime_d1", reason: row.enabled === 1 ? "RUNTIME_ON" : "RUNTIME_OFF", updatedAt: row.updated_at || null, updatedBy: row.updated_by || null };
  } catch {
    return { enabled: false, source: "runtime_d1", reason: "RUNTIME_READ_FAILED" };
  }
}
export async function publicRequirementEligibleAtRuntime(env, requirement = {}) {
  if (isNorthOrangeCountyIndustrialFlexRequirement(requirement)) {
    if (!publicEntryEnabled(env)) return false;
    return (await recommendationRuntimeActivationState(env, NORTH_ORANGE_COUNTY_ACTIVATION.marketId, NORTH_ORANGE_COUNTY_ACTIVATION.propertyType, NORTH_ORANGE_COUNTY_ACTIVATION.cohort)).enabled;
  }
  if (!isSanDiegoIndustrialFlexRequirement(requirement)) return publicRequirementEligible(env, requirement);
  if (!publicEntryEnabled(env)) return false;
  return (await recommendationRuntimeActivationState(env, SAN_DIEGO_ACTIVATION.marketId, SAN_DIEGO_ACTIVATION.propertyType, SAN_DIEGO_ACTIVATION.cohort)).enabled;
}
export async function publicEntryContextEligibleAtRuntime(env, input = {}) {
  const context = normalizeEntryContext(input);
  if (isNorthOrangeCountyIndustrialFlexEntryContext(context)) {
    if (!publicEntryEnabled(env)) return false;
    return (await recommendationRuntimeActivationState(env, NORTH_ORANGE_COUNTY_ACTIVATION.marketId, NORTH_ORANGE_COUNTY_ACTIVATION.propertyType, NORTH_ORANGE_COUNTY_ACTIVATION.cohort)).enabled;
  }
  if (!isSanDiegoIndustrialFlexEntryContext(context)) return publicEntryContextEligible(env, context);
  if (!publicEntryEnabled(env)) return false;
  return (await recommendationRuntimeActivationState(env, SAN_DIEGO_ACTIVATION.marketId, SAN_DIEGO_ACTIVATION.propertyType, SAN_DIEGO_ACTIVATION.cohort)).enabled;
}
export function sameOriginMutation(request) {
  const origin = clean(request.headers.get("origin"), 500);
  const requestUrl = new URL(request.url);
  const local = ["localhost", "127.0.0.1"].includes(requestUrl.hostname);
  const rofoHosts = new Set(["rofo.com", "www.rofo.com"]);
  const matches = (source) => {
    const submitted = new URL(source);
    if (submitted.origin === requestUrl.origin) return true;
    return submitted.protocol === "https:" && requestUrl.protocol === "https:" && !submitted.port && !requestUrl.port && rofoHosts.has(submitted.hostname.toLowerCase()) && rofoHosts.has(requestUrl.hostname.toLowerCase());
  };
  if (origin) { try { return matches(origin); } catch { return false; } }
  const referer = clean(request.headers.get("referer"), 1000);
  if (referer) { try { return matches(referer); } catch { return false; } }
  if (local) return true;
  return requestUrl.protocol === "https:" && !requestUrl.port && rofoHosts.has(requestUrl.hostname.toLowerCase()) && request.headers.get("sec-fetch-site") === "same-origin";
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
  const existing = districtPresentations.districts[slug] || { districtId: slug, districtName: item.districtName || slug, districtPath: item.path || "", image: null, representativeBuildings: [] };
  if (!(item.representatives || []).length) return existing;
  return { ...existing, districtName: item.districtName || existing.districtName, districtPath: item.path || existing.districtPath || "", representativeBuildings: item.representatives.map((entry) => ({ name: entry.label, path: entry.path, canonicalUrl: entry.path, representativeKind: entry.kind || "BUILDING", representativeRole: entry.role, representativeReason: entry.role, sourceConfidence: entry.confidence, reviewStatus: entry.reviewStatus, availabilitySemantics: entry.availabilitySemantics, provenance: entry.sources || entry.source || [], propertyVerification: entry.propertyVerification })) };
}

function assessmentForDistrict(requirement, district, item) {
    const canonicalSupported = district.dimensions.canonicalGeography.status === "REVIEWED";
    const propertySupported = district.dimensions.propertyTypeFit.status === "REVIEWED" && ["GOOD", "STRONG"].includes(district.dimensions.propertyTypeFit.band);
    const supportedDimensions = [district.dimensions.accessIntelligence, district.dimensions.businessEnvironment]
      .filter((dimension) => dimension.status === "REVIEWED" && ["GOOD", "STRONG"].includes(dimension.band));
    const propertyEvidence = item?.propertyTypeFit?.evidenceSources || item?.retail?.evidenceSources || item?.office?.evidenceSources || [];
    const hasReviewedExplanation = Boolean(item) && (item.strengths || []).length > 0 && propertyEvidence.length > 0;
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

export function calculateSnapshot(requirement, env = {}) {
  const result = readinessEngine.evaluateRecommendationReadiness(requirement, { ...dependencies, sanDiegoIndustrialFlexEnabled: sanDiegoIndustrialFlexEnabled(env), northOrangeCountyIndustrialFlexEnabled: env?.__northOrangeCountyIndustrialFlexEnabled === true });
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
    foundationVersions: result.propertyType === "retail_service"
      ? { access: accessFoundation.version, composition: sfRetailFoundation.schemaVersion, retail: sfRetailFoundation.schemaVersion }
      : result.propertyType === "industrial_flex"
        ? { access: accessFoundation.version, composition: result.market === "san-diego" ? sanDiegoIndustrialFlexFoundation.schemaVersion : ["anaheim", "fullerton"].includes(result.market) && env?.__northOrangeCountyIndustrialFlexEnabled === true ? northOrangeCountyIndustrialFlexFoundation.schemaVersion : sfIndustrialFlexFoundation.schemaVersion, resolvedModel: result.composition?.resolvedModel || result.candidateComposition?.resolvedModel || "unresolved" }
      : { access: accessFoundation.version, composition: compositionFoundation.schemaVersion, office: sfOfficeModel.version || sfOfficeModel.schemaVersion || "sf-office-recommendation-model" },
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
    `create table if not exists location_brief_v2_property_requirement_drafts (brief_id text primary key, schema_version text not null, location_requirement_revision_id text not null, recommendation_snapshot_id text not null, draft_revision integer not null, answers_json text not null, created_at text not null, updated_at text not null)`,
    `create table if not exists location_brief_v2_commercial_requests (brief_id text not null, property_draft_revision integer not null, request_hash text not null, lead_id text not null, status text not null, created_at text not null, updated_at text not null, primary key (brief_id, property_draft_revision))`,
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
  const universalProjection = projectUniversalIntelligence(requirement);
  const criterion = (dimension) => criterionText(requirement, dimension);
  const business = businessIdentity(requirement);
  const marketAnchor = requirement.locationLogic?.marketAnchor || {};
  return {
    briefPublicId: bundle?.brief?.publicId || "",
    marketId: marketAnchor.marketId || marketAnchor.geographyId || "",
    marketName: marketAnchor.marketName || marketAnchor.displayName || marketAnchor.city || "",
    marketCity: marketAnchor.city || "",
    marketState: marketAnchor.state || "",
    propertyType: requirement.propertyTypes?.[0] || "",
    business: business.specific || business.canonical,
    businessUse: business.specific || business.canonical,
    businessCategory: business.canonical,
    environment: criterion("office.environment.image"),
    employeeOrigins: criterion("universal.location.employee_origins"),
    clientVisitFrequency: criterion("office.access.client_visits"),
    customerOrigins: criterion("universal.location.customer_origins"),
    transitImportance: criterion("universal.access.transit_importance"),
    parkingImportance: criterion("universal.access.parking_importance"),
    candidateDistrictIds: requirement.locationLogic?.specificPreference?.candidateDistrictIds || [],
    candidateDistrictNames: (snapshot.candidateAssessments || []).map((item) => item.districtName).filter(Boolean),
    guidanceDistricts: (snapshot.shortlist || []).map((item) => item.districtName).filter(Boolean),
    readiness: snapshot.readiness || "",
    sourceType: bundle?.entryContext?.sourceType || "",
    sourcePath: bundle?.entryContext?.sourcePath || "",
    requirementRevisionId: bundle?.currentRevision?.id || "",
    requirementRevisionNumber: bundle?.currentRevision?.revisionNumber || 0,
    recommendationSnapshotId: snapshot.id || "",
    recommendationSnapshotVersion: snapshot.schemaVersion || "",
    universalIntelligence: {
      schemaVersion: universalProjection.schemaVersion,
      foundations: universalProjection.foundations.map((item) => item.id),
      importantDimensions: universalProjection.whatMatters.map((item) => item.label),
      investigationTopics: universalProjection.investigationTopics,
      missingRequirementSignals: universalProjection.missingRequirementSignals,
      locationIntelligenceBoundary: universalProjection.locationIntelligenceBoundary.code,
      requirementSignals: {
        officeWorkingPattern: criterion("office.workplace.meetings_collaboration"),
        growthHorizon: criterion("universal.growth.future_state"),
        storefrontPriority: criterion("retail.property.storefront_priority"),
        retailDeliveryService: criterion("retail.operations.delivery_receiving"),
        industrialUseMix: criterion("industrial.operations.use_mix"),
        customerFacingPriority: criterion("industrial.customer.visit_priority"),
        vehicleProfile: criterion("industrial.access.truck_circulation"),
        loadingForm: criterion("industrial.loading.form"),
      },
    },
    materialIntelligenceGaps: (snapshot.intelligenceGaps || []).filter((gap) => ["CORE", "MATERIAL"].includes(gap.materiality) || gap.blockingStatus === "BLOCKED").slice(0, 12).map((gap) => ({ districtId: gap.districtId, dimension: gap.intelligenceDimension, materiality: gap.materiality, blockingStatus: gap.blockingStatus, reason: gap.reason })),
  };
}

export async function reserveCommercialRequest(env, bundle, draft, requestHash, leadId) {
  const revision = Number(draft?.draftRevision || 0);
  if (!revision) throw new Error("A completed property requirement is required.");
  const now = new Date().toISOString();
  if (storageKind(env) === "d1") {
    const database = db(env); await ensureV2Tables(database);
    try {
      await database.prepare(`insert into location_brief_v2_commercial_requests values (?, ?, ?, ?, ?, ?, ?)`).bind(bundle.brief.id, revision, clean(requestHash, 128), clean(leadId, 128), "reserved", now, now).run();
      return { reserved: true, leadId };
    } catch (error) {
      if (!/unique|constraint/i.test(String(error?.message || ""))) throw error;
      const existing = await database.prepare(`select lead_id, status from location_brief_v2_commercial_requests where brief_id = ? and property_draft_revision = ?`).bind(bundle.brief.id, revision).first();
      return { reserved: false, leadId: existing?.lead_id || "", status: existing?.status || "" };
    }
  }
  const store = kv(env); const key = `location-brief-v2-commercial:${bundle.brief.publicId}:${revision}`;
  const existing = await store.get(key, "json");
  if (existing) return { reserved: false, leadId: existing.leadId || "", status: existing.status || "" };
  await store.put(key, JSON.stringify({ requestHash: clean(requestHash, 128), leadId, status: "reserved", createdAt: now, updatedAt: now }));
  return { reserved: true, leadId };
}

export async function getCommercialRequest(env, bundle, draft) {
  const revision = Number(draft?.draftRevision || 0); if (!revision) return null;
  if (storageKind(env) === "d1") {
    const database = db(env); await ensureV2Tables(database);
    const row = await database.prepare(`select lead_id, status, created_at, updated_at from location_brief_v2_commercial_requests where brief_id = ? and property_draft_revision = ?`).bind(bundle.brief.id, revision).first();
    return row ? { leadId: row.lead_id, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at } : null;
  }
  return await kv(env).get(`location-brief-v2-commercial:${bundle.brief.publicId}:${revision}`, "json");
}

export async function completeCommercialRequest(env, bundle, draft, leadId) {
  const revision = Number(draft?.draftRevision || 0); const now = new Date().toISOString();
  if (storageKind(env) === "d1") {
    const database = db(env); await ensureV2Tables(database);
    await database.prepare(`update location_brief_v2_commercial_requests set status = ?, lead_id = ?, updated_at = ? where brief_id = ? and property_draft_revision = ?`).bind("created", leadId, now, bundle.brief.id, revision).run();
    return;
  }
  const store = kv(env); const key = `location-brief-v2-commercial:${bundle.brief.publicId}:${revision}`;
  const existing = await store.get(key, "json") || {};
  await store.put(key, JSON.stringify({ ...existing, leadId, status: "created", updatedAt: now }));
}

export async function releaseCommercialRequest(env, bundle, draft, leadId) {
  const revision = Number(draft?.draftRevision || 0);
  if (storageKind(env) === "d1") {
    const database = db(env); await ensureV2Tables(database);
    await database.prepare(`delete from location_brief_v2_commercial_requests where brief_id = ? and property_draft_revision = ? and lead_id = ? and status = ?`).bind(bundle.brief.id, revision, leadId, "reserved").run();
    return;
  }
  const store = kv(env); const key = `location-brief-v2-commercial:${bundle.brief.publicId}:${revision}`;
  const existing = await store.get(key, "json");
  if (existing?.leadId === leadId && existing?.status === "reserved") await store.delete(key);
}

function ids() { return { briefId: crypto.randomUUID(), publicId: `LB2-${randomToken(12).toUpperCase()}`, ownerToken: randomToken(32), entryId: crypto.randomUUID(), revisionId: crypto.randomUUID(), snapshotId: crypto.randomUUID() }; }
function candidateRows(briefId, entryContext, now) {
  const seen = new Set();
  return cleanArray(entryContext.candidateDistrictIds).map((sourceId) => {
    const group = (compositionFoundation.presentationGroups || []).find((item) => item.memberDistrictIds.includes(sourceId));
    const sanDiegoContextOwner = entryContext.marketId === "san-diego" && sourceId === "sorrento-valley" ? "sorrento-mesa" : "";
    const canonicalDistrictId = sanDiegoContextOwner || group?.canonicalDistrictId || sourceId;
    if (seen.has(canonicalDistrictId)) return null;
    seen.add(canonicalDistrictId);
    const memberSources = cleanArray(entryContext.candidateDistrictIds).filter((candidateId) => candidateId === canonicalDistrictId || group?.memberDistrictIds.includes(candidateId));
    return { id: crypto.randomUUID(), briefId, canonicalDistrictId, presentationGroupId: group?.presentationGroupId || (sanDiegoContextOwner ? "san-diego-industrial-flex:sorrento" : ""), sourceIdentity: sourceId, provenance: memberSources.map((identity) => ({ sourceType: entryContext.sourceType, sourceIdentity: identity })), disposition: "considering", createdAt: now, updatedAt: now };
  }).filter(Boolean);
}

async function snapshotEnvironment(env, requirement) {
  if (!isNorthOrangeCountyIndustrialFlexRequirement(requirement)) return env;
  const activation = await recommendationRuntimeActivationState(env, NORTH_ORANGE_COUNTY_ACTIVATION.marketId, NORTH_ORANGE_COUNTY_ACTIVATION.propertyType, NORTH_ORANGE_COUNTY_ACTIVATION.cohort);
  return { ...env, __northOrangeCountyIndustrialFlexEnabled: activation.enabled === true };
}

export async function createBrief(env, rawRequirement, rawEntryContext = {}, changedBy = "anonymous_operator") {
  const now = new Date().toISOString(); const generated = ids();
  const entryContext = { ...normalizeEntryContext(rawEntryContext), entryContextId: generated.entryId };
  const requirement = canonicalRequirement(rawRequirement, entryContext);
  const snapshotBody = calculateSnapshot(requirement, await snapshotEnvironment(env, requirement));
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

export async function getPropertyRequirementDraft(env, brief) {
  if (storageKind(env) === "d1") {
    const database = db(env); await ensureV2Tables(database);
    const row = await database.prepare(`select * from location_brief_v2_property_requirement_drafts where brief_id = ?`).bind(brief.id).first();
    return row ? { briefId: row.brief_id, schemaVersion: row.schema_version, locationRequirementRevisionId: row.location_requirement_revision_id, recommendationSnapshotId: row.recommendation_snapshot_id, draftRevision: row.draft_revision, answers: JSON.parse(row.answers_json), createdAt: row.created_at, updatedAt: row.updated_at } : null;
  }
  const record = await kv(env).get(`location-brief-v2:${brief.publicId}`, "json");
  return record?.propertyRequirementDraft || null;
}

export async function savePropertyRequirementDraft(env, bundle, answers, expectedDraftRevision = 0) {
  const existing = await getPropertyRequirementDraft(env, bundle.brief);
  if (Number(existing?.draftRevision || 0) !== Number(expectedDraftRevision || 0)) { const error = new Error("The property search changed in another session. Refresh before saving."); error.status = 409; throw error; }
  const now = new Date().toISOString();
  const allowedPurposes = ["client_meetings", "team_collaboration", "quiet_focused_work", "showroom_presentation"];
  const officePurposes = cleanArray(answers?.officePurposes, 8).filter((item) => allowedPurposes.includes(item));
  const allowedTiming = ["asap", "within_3_months", "3_to_6_months", "6_to_12_months", "more_than_12_months"];
  const allowedMustHaves = ["dedicated_storage", "loading_receiving", "special_improvements", "parking_requirement"];
  const positiveInteger = (value) => { const number = Number(value); return Number.isFinite(number) && number > 0 ? Math.round(number) : null; };
  const draft = {
    briefId: bundle.brief.id, schemaVersion: PROPERTY_REQUIREMENT_DRAFT_VERSION,
    locationRequirementRevisionId: bundle.currentRevision.id, recommendationSnapshotId: bundle.currentSnapshot.id,
    draftRevision: Number(existing?.draftRevision || 0) + 1,
    answers: {
      officePurposes,
      approximateSquareFeet: positiveInteger(answers?.approximateSquareFeet),
      approximatePeople: positiveInteger(answers?.approximatePeople),
      timing: allowedTiming.includes(clean(answers?.timing, 80)) ? clean(answers.timing, 80) : "",
      mustHaves: cleanArray(answers?.mustHaves, 8).filter((item) => allowedMustHaves.includes(item)),
      mustHavesReviewed: answers?.mustHavesReviewed === true,
    },
    createdAt: existing?.createdAt || now, updatedAt: now,
  };
  if (storageKind(env) === "d1") {
    const database = db(env); await ensureV2Tables(database);
    const result = await database.prepare(`insert into location_brief_v2_property_requirement_drafts values (?, ?, ?, ?, ?, ?, ?, ?) on conflict(brief_id) do update set schema_version=excluded.schema_version, location_requirement_revision_id=excluded.location_requirement_revision_id, recommendation_snapshot_id=excluded.recommendation_snapshot_id, draft_revision=excluded.draft_revision, answers_json=excluded.answers_json, updated_at=excluded.updated_at where location_brief_v2_property_requirement_drafts.draft_revision = ?`).bind(draft.briefId, draft.schemaVersion, draft.locationRequirementRevisionId, draft.recommendationSnapshotId, draft.draftRevision, JSON.stringify(draft.answers), draft.createdAt, draft.updatedAt, Number(expectedDraftRevision || 0)).run();
    if (Number(result?.meta?.changes || 0) !== 1) { const error = new Error("The property search changed in another session. Refresh before saving."); error.status = 409; throw error; }
  } else {
    const store = kv(env); const key = `location-brief-v2:${bundle.brief.publicId}`; const record = await store.get(key, "json");
    if (Number(record?.propertyRequirementDraft?.draftRevision || 0) !== Number(expectedDraftRevision || 0)) { const error = new Error("The property search changed in another session. Refresh before saving."); error.status = 409; throw error; }
    record.propertyRequirementDraft = draft; await store.put(key, JSON.stringify(record));
  }
  return draft;
}

export async function reviseBrief(env, bundle, rawRequirement, expectedRevision, changedBy = "anonymous_operator") {
  if (Number(expectedRevision) !== Number(bundle.currentRevision.revisionNumber)) { const error = new Error("The Brief changed in another session. Refresh before saving."); error.status = 409; throw error; }
  const now = new Date().toISOString(); const requirement = canonicalRequirement(rawRequirement, bundle.entryContext); const revision = { id: crypto.randomUUID(), briefId: bundle.brief.id, schemaVersion: REQUIREMENT_REVISION_VERSION, revisionNumber: bundle.currentRevision.revisionNumber + 1, requirement, changedBy, createdAt: now };
  const snapshot = { id: crypto.randomUUID(), briefId: bundle.brief.id, requirementRevisionId: revision.id, ...calculateSnapshot(requirement, await snapshotEnvironment(env, requirement)), createdAt: now };
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
