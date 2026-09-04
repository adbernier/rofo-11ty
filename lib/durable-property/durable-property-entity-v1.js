"use strict";

const ENTITY_KINDS = Object.freeze(["BUILDING_PROPERTY", "SUITE_OBSERVATION", "CAMPUS_COMPLEX", "COMMERCIAL_ENVIRONMENT", "UNKNOWN"]);
const IDENTITY_CONFIDENCE = Object.freeze(["REVIEWED_DURABLE_ENTITY", "HIGH_CONFIDENCE_DURABLE_ENTITY", "IDENTITY_CANDIDATE", "CONFLICTED", "INSUFFICIENT_IDENTITY"]);
const PUBLIC_READINESS = Object.freeze(["INTERNAL_ONLY", "PUBLIC_PROPERTY_CANDIDATE", "NEEDS_PUBLIC_EVIDENCE", "REJECT_PUBLIC"]);
const REDIRECT_CLASSIFICATIONS = Object.freeze(["GOOD_DIRECT_REDIRECT", "GOOD_CONTEXT_REDIRECT", "REDIRECT_CHAIN", "WRONG_DESTINATION", "LOOP_OR_FAILURE", "DURABLE_PROPERTY_MATCH_NO_CANONICAL_DESTINATION", "UNRESOLVED_LEGACY_PROPERTY"]);
const FORBIDDEN_DURABLE_FIELDS = Object.freeze(["availability", "availableSf", "vacancy", "rent", "leaseTerms", "brokerContact", "suiteAvailability", "tenantOccupancy", "loading", "power", "clearHeight", "yard", "permittedUse"]);

function unique(values) { return [...new Set((values || []).filter(Boolean))]; }
function assertAllowed(value, allowed, label) { if (!allowed.includes(value)) throw new Error(`Invalid ${label}: ${value}`); }
function assertAvailabilityFirewall(entity) {
  const leaked = FORBIDDEN_DURABLE_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(entity, field));
  if (leaked.length) throw new Error(`Time-sensitive fields cannot enter durable property entities: ${leaked.join(", ")}`);
}

function createDurableProperty(input) {
  assertAllowed(input.entityKind, ENTITY_KINDS, "entity kind");
  assertAllowed(input.identityConfidence, IDENTITY_CONFIDENCE, "identity confidence");
  assertAllowed(input.publicReadiness, PUBLIC_READINESS, "public readiness");
  if (!input.durablePropertyId || !input.canonicalAddress || !input.municipality || !input.state) throw new Error("Durable property identity, address, municipality, and state are required.");
  if (input.entityKind === "SUITE_OBSERVATION" && input.identityConfidence === "REVIEWED_DURABLE_ENTITY") throw new Error("Suite observations cannot be reviewed durable buildings.");
  if (input.entityKind === "CAMPUS_COMPLEX" && input.parentEntityId) throw new Error("A campus cannot be collapsed beneath a building entity.");
  const geographyRelationships = (input.geographyRelationships || []).map((item) => Object.freeze({ ...item }));
  const entity = {
    schemaVersion: "durable-property-entity:v1",
    durablePropertyId: input.durablePropertyId,
    entityKind: input.entityKind,
    canonicalAddress: input.canonicalAddress,
    originalAddresses: Object.freeze(unique(input.originalAddresses || [input.canonicalAddress])),
    normalizedAddress: input.normalizedAddress,
    municipality: input.municipality,
    state: input.state,
    postalCode: input.postalCode || null,
    buildingName: input.buildingName || null,
    parentEntityId: input.parentEntityId || null,
    geographyRelationships: Object.freeze(geographyRelationships),
    reviewedPropertyTypes: Object.freeze(unique(input.reviewedPropertyTypes)),
    historicalTypeObservations: Object.freeze(unique(input.historicalTypeObservations)),
    legacyBuildingIds: Object.freeze(unique(input.legacyBuildingIds).sort()),
    semanticSourceIds: Object.freeze(unique(input.semanticSourceIds).sort()),
    legacyPublicUrls: Object.freeze(unique(input.legacyPublicUrls).sort()),
    currentCanonicalUrl: input.currentCanonicalUrl || null,
    provenance: Object.freeze(unique(input.provenance)),
    identityConfidence: input.identityConfidence,
    reviewStatus: input.reviewStatus,
    conflicts: Object.freeze(unique(input.conflicts)),
    representativeRelationships: Object.freeze(input.representativeRelationships || []),
    mediaRights: input.mediaRights || "RIGHTS_UNKNOWN",
    publicReadiness: input.publicReadiness,
    availabilityBoundary: "HISTORICAL_OBSERVATIONS_ONLY_NEVER_CURRENT_AVAILABILITY",
  };
  assertAvailabilityFirewall(entity);
  return Object.freeze(entity);
}

function classifyRedirect(input) {
  if (input.loopOrFailure) return "LOOP_OR_FAILURE";
  if (input.hops > 1) return "REDIRECT_CHAIN";
  if (input.wrongDestination) return "WRONG_DESTINATION";
  if (input.directCanonicalMatch) return "GOOD_DIRECT_REDIRECT";
  if (input.relevantContextMatch) return "GOOD_CONTEXT_REDIRECT";
  if (input.durablePropertyMatch && !input.canonicalDestination) return "DURABLE_PROPERTY_MATCH_NO_CANONICAL_DESTINATION";
  return "UNRESOLVED_LEGACY_PROPERTY";
}

module.exports = Object.freeze({
  schemaVersion: "durable-property-entity:v1", ENTITY_KINDS, IDENTITY_CONFIDENCE,
  PUBLIC_READINESS, REDIRECT_CLASSIFICATIONS, FORBIDDEN_DURABLE_FIELDS,
  createDurableProperty, classifyRedirect, assertAvailabilityFirewall,
});
