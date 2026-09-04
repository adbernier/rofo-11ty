"use strict";

const RECONCILIATION_STATUSES = Object.freeze([
  "CANONICAL_MATCH",
  "RECONCILED_PROPERTY",
  "GEOGRAPHY_LINK_CANDIDATE",
  "DISCOVERY_ONLY",
  "HUMAN_REVIEW_REQUIRED",
  "REJECTED",
]);

const RELATIONSHIP_CONFIDENCE = Object.freeze([
  "REVIEWED",
  "HIGH_CONFIDENCE",
  "CANDIDATE",
  "CONFLICTED",
  "UNASSIGNED",
]);

const CONFLICT_CODES = Object.freeze([
  "MUNICIPALITY_CONFLICT",
  "ADDRESS_CONFLICT",
  "DUPLICATE_ENTITY",
  "MULTIPLE_LEGACY_IDS",
  "SUITE_BUILDING_AMBIGUITY",
  "CAMPUS_COMPLEX_AMBIGUITY",
  "PROPERTY_TYPE_CONFLICT",
  "GEOGRAPHY_BOUNDARY_UNCERTAIN",
  "CANONICAL_OWNERSHIP_CONFLICT",
  "SOURCE_IDENTITY_INSUFFICIENT",
  "HISTORICAL_ONLY_LOW_CONFIDENCE",
]);

const ENTITY_KINDS = Object.freeze([
  "PROPERTY_BUILDING",
  "SUITE_OBSERVATION",
  "CAMPUS_COMPLEX",
  "BUSINESS_PARK_ENVIRONMENT",
  "UNKNOWN",
]);

const PROCESSING_TIERS = Object.freeze([
  "AUTO_PROMOTABLE_INTERNAL",
  "AUTO_RECONCILE_QA",
  "HUMAN_REVIEW",
  "DISCOVERY_ONLY",
  "REJECT",
]);

const TIME_SENSITIVE_FIELDS = Object.freeze([
  "availability",
  "asking_rent",
  "available_sf",
  "suite_availability",
  "lease_terms",
  "broker_contact",
  "tenant_occupancy",
  "parking_availability",
  "current_amenities",
]);

const DO_NOT_REUSE_FIELDS = Object.freeze([
  "historical_marketing_copy",
  "available_now_claim",
  "loading",
  "clear_height",
  "power",
  "yard",
  "trailer_capacity",
  "permitted_use",
  "hazardous_capability",
  "tenant_suitability",
]);

const STREET_SUFFIXES = Object.freeze({
  avenue: "ave", boulevard: "blvd", circle: "cir", court: "ct", drive: "dr",
  highway: "hwy", lane: "ln", parkway: "pkwy", place: "pl", road: "rd",
  street: "st", terrace: "ter", trail: "trl", way: "way",
});
const DIRECTIONALS = Object.freeze({ north: "n", south: "s", east: "e", west: "w", northeast: "ne", northwest: "nw", southeast: "se", southwest: "sw" });

function clean(value) { return String(value == null ? "" : value).trim(); }
function slugify(value) { return clean(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
function normalizeState(value) { return clean(value).toUpperCase(); }
function normalizePostal(value) { return (clean(value).match(/^\d{5}/) || [""])[0]; }
function normalizeMunicipality(value) { return clean(value).toLowerCase().replace(/\bst\.?\b/g, "saint").replace(/[^a-z0-9]+/g, " ").trim(); }
function splitSuite(value) {
  const original = clean(value);
  const match = original.match(/^(.*?)(?:\s*[,#]\s*|\s+)(?:suite|ste|unit|floor|fl)\s*[-#:]?\s*([a-z0-9-]+)\s*$/i);
  return match ? { baseAddress: clean(match[1]), suite: clean(match[2]) } : { baseAddress: original, suite: "" };
}
function normalizeAddress(value) {
  const { baseAddress, suite } = splitSuite(value);
  const tokens = baseAddress.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean).map((token) => STREET_SUFFIXES[token] || DIRECTIONALS[token] || token);
  return { original: clean(value), normalized: tokens.join(" "), suite };
}
function hasStreetIdentity(value) { return /^\d+[a-z-]*\s+\S+/.test(clean(value)); }
function coordinatesUsable(lat, lng) { const a = Number(lat), b = Number(lng); return Number.isFinite(a) && Number.isFinite(b) && a >= 20 && a <= 72 && b >= -180 && b <= -60; }

function normalizePropertyType(value) {
  const input = clean(value).toLowerCase();
  if (!input || input === "other/unknown" || input.startsWith("unknown")) return "unresolved";
  if (/medical|health|clinic/.test(input)) return "medical";
  if (/industrial|warehouse|distribution|manufactur|logistics/.test(input)) return "industrial";
  if (/flex|office\/warehouse|office warehouse|r&d/.test(input)) return "flex";
  if (/retail|storefront|restaurant/.test(input)) return "retail";
  if (/office|cowork|executive suite/.test(input)) return "office";
  if (/\bland\b/.test(input)) return "land";
  if (/mixed/.test(input)) return "mixed_commercial";
  return "special_purpose_unresolved";
}

function reconcilePropertyTypes(observations, canonicalTypes = []) {
  const historical = [...new Set(observations.map(normalizePropertyType).filter((value) => value !== "unresolved"))].sort();
  const canonical = [...new Set(canonicalTypes.map(normalizePropertyType).filter((value) => value !== "unresolved"))].sort();
  const conflicts = [];
  if (canonical.length && historical.length && !historical.some((value) => canonical.includes(value))) conflicts.push("PROPERTY_TYPE_CONFLICT");
  const reviewed = canonical.length ? canonical : historical.length === 1 ? historical : [];
  return { historicalObservations: historical, reviewedTypes: reviewed, conflicts, source: canonical.length ? "CURRENT_CANONICAL_RECORD" : reviewed.length ? "CONSISTENT_HISTORICAL_OBSERVATIONS" : "UNRESOLVED" };
}

function entityKindFor(observation) {
  const address = normalizeAddress(observation.sourceAddress || observation.address);
  const name = clean(observation.sourceName || observation.name).toLowerCase();
  if (address.suite || clean(observation.sourceSuite)) return "SUITE_OBSERVATION";
  if (/\b(campus|complex|center|centre)\b/.test(name) && !hasStreetIdentity(address.normalized)) return "CAMPUS_COMPLEX";
  if (/\b(business park|industrial park|employment environment)\b/.test(name) && !hasStreetIdentity(address.normalized)) return "BUSINESS_PARK_ENVIRONMENT";
  if (hasStreetIdentity(address.normalized)) return "PROPERTY_BUILDING";
  return "UNKNOWN";
}

function unique(values) { return [...new Set(values.filter(Boolean))]; }
function assertTaxonomy(value, values, label) { if (!values.includes(value)) throw new Error(`Invalid ${label}: ${value}`); }

function reconcileGroup(input) {
  const observations = input.observations || [];
  if (!observations.length) throw new Error("At least one historical observation is required.");
  const address = normalizeAddress(input.address || observations[0].sourceAddress);
  const municipality = clean(input.municipality || observations[0].sourceMunicipality);
  const state = normalizeState(input.state || observations[0].sourceState);
  const conflicts = unique([...(input.conflicts || [])]);
  const legacyIds = unique(observations.map((item) => clean(item.legacyBuildingId)));
  const kinds = unique(observations.map(entityKindFor));
  if (legacyIds.length > 1) conflicts.push("MULTIPLE_LEGACY_IDS");
  if (kinds.includes("SUITE_OBSERVATION")) conflicts.push("SUITE_BUILDING_AMBIGUITY");
  if (kinds.includes("CAMPUS_COMPLEX") || kinds.includes("BUSINESS_PARK_ENVIRONMENT")) conflicts.push("CAMPUS_COMPLEX_AMBIGUITY");
  if (!address.normalized || !municipality || !state || !hasStreetIdentity(address.normalized)) conflicts.push("SOURCE_IDENTITY_INSUFFICIENT");
  const type = reconcilePropertyTypes(observations.flatMap((item) => item.sourcePropertyTypes || []), input.canonicalPropertyTypes || []);
  conflicts.push(...type.conflicts);
  const geography = input.geography || null;
  if (input.municipalityVerified === false) conflicts.push("MUNICIPALITY_CONFLICT");
  if (geography && !["REVIEWED", "HIGH_CONFIDENCE", "CANDIDATE"].includes(geography.confidence)) conflicts.push("GEOGRAPHY_BOUNDARY_UNCERTAIN");
  const finalConflicts = unique(conflicts);

  let status = "DISCOVERY_ONLY";
  let tier = "DISCOVERY_ONLY";
  let confidence = geography?.confidence || "UNASSIGNED";
  if (finalConflicts.some((code) => ["MUNICIPALITY_CONFLICT", "ADDRESS_CONFLICT", "CANONICAL_OWNERSHIP_CONFLICT", "PROPERTY_TYPE_CONFLICT", "SUITE_BUILDING_AMBIGUITY", "CAMPUS_COMPLEX_AMBIGUITY"].includes(code))) {
    status = "HUMAN_REVIEW_REQUIRED"; tier = "HUMAN_REVIEW"; confidence = "CONFLICTED";
  } else if (input.forceDiscoveryOnly === true) {
    status = "DISCOVERY_ONLY"; tier = "DISCOVERY_ONLY";
  } else if (input.canonicalMatch && input.municipalityVerified === true) {
    status = "CANONICAL_MATCH"; tier = "AUTO_PROMOTABLE_INTERNAL"; confidence = geography?.confidence || "HIGH_CONFIDENCE";
  } else if (address.normalized && input.municipalityVerified === true && input.identityEvidenceCount >= 4 && type.reviewedTypes.length) {
    status = geography?.confidence === "CANDIDATE" ? "GEOGRAPHY_LINK_CANDIDATE" : "RECONCILED_PROPERTY";
    tier = "AUTO_RECONCILE_QA";
  } else if (!address.normalized || kinds.every((kind) => kind === "UNKNOWN")) {
    status = "REJECTED"; tier = "REJECT";
  }

  assertTaxonomy(status, RECONCILIATION_STATUSES, "reconciliation status");
  assertTaxonomy(tier, PROCESSING_TIERS, "processing tier");
  assertTaxonomy(confidence, RELATIONSHIP_CONFIDENCE, "relationship confidence");
  return {
    durablePropertyId: input.durablePropertyId || `property:${state.toLowerCase()}:${slugify(municipality)}:${slugify(address.normalized)}`,
    entityKind: kinds.length === 1 ? kinds[0] : "UNKNOWN",
    normalizedAddress: address.normalized,
    originalAddresses: unique(observations.map((item) => clean(item.sourceAddress))),
    municipality,
    municipalityId: slugify(municipality),
    state,
    postalCode: normalizePostal(input.postalCode || observations.find((item) => item.sourcePostalCode)?.sourcePostalCode),
    canonicalMatch: input.canonicalMatch || null,
    commercialGeography: geography,
    propertyType: type,
    relationshipConfidence: confidence,
    reconciliationStatus: status,
    processingTier: tier,
    conflictCodes: finalConflicts,
    aliases: unique(observations.flatMap((item) => [item.sourceName, item.sourceAddress])),
    sourceIds: legacyIds.map((id) => ({ sourceType: "LEGACY_BUILDING_ID", sourceId: id })),
    observationIds: observations.map((item) => item.observationId),
    provenance: unique([...(input.provenance || []), ...observations.map((item) => `historical_building:${item.legacyBuildingId}`)]),
    historicalObservationSummary: {
      count: observations.length,
      historicalListingObservationCount: observations.reduce((sum, item) => sum + Number(item.historicalListingCount || 0), 0),
      containsTimeSensitiveFields: observations.some((item) => item.hasHistoricalAvailability === true),
      durableFactsPromoted: ["normalized_address", "municipality", ...(type.reviewedTypes.length ? ["reviewed_property_type"] : [])],
      excludedFieldClasses: ["TIME_SENSITIVE", "DO_NOT_REUSE_WITHOUT_INDEPENDENT_VERIFICATION"],
    },
    representativePotential: input.representativePotential || "NOT_REPRESENTATIVE",
    publicReadiness: status === "CANONICAL_MATCH" && type.reviewedTypes.length && geography && ["REVIEWED", "HIGH_CONFIDENCE"].includes(confidence) ? "PUBLIC_CANDIDATE_LATER" : status === "REJECTED" ? "INSUFFICIENT" : "INTERNAL_ONLY",
    mediaRights: input.mediaRights || "RIGHTS_UNKNOWN",
    reviewStatus: input.reviewStatus || (tier === "AUTO_PROMOTABLE_INTERNAL" ? "DETERMINISTIC_INTERNAL_MATCH" : "UNREVIEWED_INTERNAL_V1"),
  };
}

module.exports = Object.freeze({
  schemaVersion: "property-geography-reconciliation:v1",
  RECONCILIATION_STATUSES, RELATIONSHIP_CONFIDENCE, CONFLICT_CODES, ENTITY_KINDS, PROCESSING_TIERS,
  TIME_SENSITIVE_FIELDS, DO_NOT_REUSE_FIELDS,
  normalizeAddress, normalizeMunicipality, normalizePostal, normalizeState, normalizePropertyType, coordinatesUsable,
  reconcilePropertyTypes, entityKindFor, reconcileGroup,
});
