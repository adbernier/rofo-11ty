"use strict";

const REPRESENTATIVE_STATUSES = Object.freeze([
  "REVIEWED_REPRESENTATIVE",
  "STRONG_REPRESENTATIVE_CANDIDATE",
  "POSSIBLE_REPRESENTATIVE",
  "REPRESENTATIVE_ENVIRONMENT",
  "NOT_REPRESENTATIVE",
]);

const PUBLIC_USE_STATUSES = Object.freeze([
  "INTERNAL_REPRESENTATIVE_ONLY",
  "PUBLIC_REPRESENTATIVE_CANDIDATE",
  "NEEDS_PUBLIC_EVIDENCE",
  "REJECT_PUBLIC",
]);

const MEDIA_RIGHTS = Object.freeze([
  "ROFO_OWNED_OR_FIELD_CAPTURED",
  "LICENSED",
  "RIGHTS_UNKNOWN",
  "REJECT_MEDIA",
]);

const BLOCKING_CONFLICTS = Object.freeze([
  "MUNICIPALITY_CONFLICT",
  "CANONICAL_OWNERSHIP_CONFLICT",
  "ADDRESS_CONFLICT",
  "PROPERTY_TYPE_CONFLICT",
  "SUITE_BUILDING_AMBIGUITY",
  "CAMPUS_COMPLEX_AMBIGUITY",
  "SOURCE_IDENTITY_INSUFFICIENT",
]);

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function assertValue(value, allowed, label) {
  if (!allowed.includes(value)) throw new Error(`Invalid ${label}: ${value}`);
}

function reviewedGeography(entity, reviewedOverride) {
  if (reviewedOverride) return true;
  return entity.relationshipConfidence === "REVIEWED" ||
    ["REVIEWED_CONFIRMED", "HIGH_CONFIDENCE_CONFIRMED"].includes(entity.geographyLinkReview?.classification);
}

function qualifyProperty(input) {
  const entity = input.entity;
  if (!entity) throw new Error("Representative qualification requires a reconciled entity.");
  const conflicts = unique(entity.conflictCodes);
  const blockers = conflicts.filter((code) => BLOCKING_CONFLICTS.includes(code));
  const hasReviewedGeography = reviewedGeography(entity, input.reviewedGeographyOverride === true);
  const candidateGeography = entity.relationshipConfidence === "CANDIDATE" ||
    entity.geographyLinkReview?.classification === "DOWNGRADE_TO_CANDIDATE";
  const durableIdentity = ["CANONICAL_MATCH", "RECONCILED_PROPERTY", "GEOGRAPHY_LINK_CANDIDATE"].includes(entity.reconciliationStatus);
  const typeSupported = (entity.propertyType?.reviewedTypes || []).length > 0;
  const hierarchyClean = !conflicts.some((code) => ["MULTIPLE_LEGACY_IDS", "SUITE_BUILDING_AMBIGUITY", "CAMPUS_COMPLEX_AMBIGUITY", "DUPLICATE_ENTITY"].includes(code));
  const provenance = unique([...(entity.provenance || []), ...(input.evidenceSources || [])]);
  const isExistingReviewed = input.existingReviewedRepresentative === true;

  let status = "NOT_REPRESENTATIVE";
  let reasons = [];
  if (isExistingReviewed && input.reviewedGeographyOverride && !blockers.length) {
    status = "REVIEWED_REPRESENTATIVE";
    reasons = ["Existing controlled representative evidence", "Reviewed geography ownership", "Availability-independent explanatory role"];
  } else if (durableIdentity && hasReviewedGeography && typeSupported && hierarchyClean && !blockers.length && provenance.length && input.explanatoryRole) {
    status = "STRONG_REPRESENTATIVE_CANDIDATE";
    reasons = ["Durable identity", "Reviewed geography relationship", "Supported property type", "Clean hierarchy", "Explicit explanatory role"];
  } else if (durableIdentity && (candidateGeography || hasReviewedGeography) && typeSupported && !blockers.length && provenance.length) {
    status = "POSSIBLE_REPRESENTATIVE";
    reasons = [candidateGeography ? "Candidate-only geography relationship" : "Additional representative review required"];
  } else {
    reasons = unique([
      !durableIdentity ? "Identity is not durable-entity quality" : "",
      blockers.length ? `Blocking conflicts: ${blockers.join(", ")}` : "",
      !entity.commercialGeography && !input.reviewedGeographyOverride ? "No usable geography relationship" : "",
      !typeSupported ? "Property type is unresolved" : "",
      !input.explanatoryRole ? "No reviewed explanatory role" : "",
    ]);
  }

  const mediaRights = input.mediaRights || entity.mediaRights || "RIGHTS_UNKNOWN";
  assertValue(status, REPRESENTATIVE_STATUSES, "representative status");
  assertValue(mediaRights, MEDIA_RIGHTS, "media-rights status");
  const publicUseStatus = status === "REVIEWED_REPRESENTATIVE" && input.publicEvidenceReviewed === true
    ? "PUBLIC_REPRESENTATIVE_CANDIDATE"
    : ["REVIEWED_REPRESENTATIVE", "STRONG_REPRESENTATIVE_CANDIDATE", "POSSIBLE_REPRESENTATIVE"].includes(status)
      ? "NEEDS_PUBLIC_EVIDENCE"
      : "REJECT_PUBLIC";
  assertValue(publicUseStatus, PUBLIC_USE_STATUSES, "public-use status");

  return Object.freeze({
    representativeStatus: status,
    qualification: Object.freeze({
      durableIdentity,
      municipalityVerified: !blockers.some((code) => ["MUNICIPALITY_CONFLICT", "CANONICAL_OWNERSHIP_CONFLICT"].includes(code)),
      reviewedGeography: hasReviewedGeography,
      candidateGeography,
      typeSupported,
      hierarchyClean,
      provenancePresent: provenance.length > 0,
      availabilityIndependent: true,
      reasons: Object.freeze(reasons),
      blockingConflicts: Object.freeze(blockers),
    }),
    provenance: Object.freeze(provenance),
    mediaRights,
    publicUseStatus,
    availabilityBoundary: "REPRESENTATIVE_ONLY_NOT_CURRENT_AVAILABILITY",
  });
}

function createEnvironment(input) {
  if (!input.geographyId || !input.municipality || !input.role || !(input.evidenceSources || []).length) {
    throw new Error("Environment representatives require geography, municipality, role, and evidence.");
  }
  return Object.freeze({
    representativeId: input.id,
    kind: "COMMERCIAL_ENVIRONMENT",
    label: input.label,
    municipality: input.municipality,
    state: input.state,
    geographyId: input.geographyId,
    representativeRole: input.role,
    representativeStatus: "REPRESENTATIVE_ENVIRONMENT",
    provenance: Object.freeze(unique(input.evidenceSources)),
    reviewStatus: input.reviewStatus || "REVIEWED_ENVIRONMENT_EVIDENCE",
    mediaRights: input.mediaRights || "RIGHTS_UNKNOWN",
    publicUseStatus: input.publicEvidenceReviewed ? "PUBLIC_REPRESENTATIVE_CANDIDATE" : "NEEDS_PUBLIC_EVIDENCE",
    availabilityBoundary: "ENVIRONMENT_CONTEXT_NOT_PROPERTY_OR_AVAILABILITY",
    rendersAs: "ENVIRONMENT",
  });
}

module.exports = Object.freeze({
  schemaVersion: "representative-property-foundation:v1",
  REPRESENTATIVE_STATUSES,
  PUBLIC_USE_STATUSES,
  MEDIA_RIGHTS,
  BLOCKING_CONFLICTS,
  qualifyProperty,
  createEnvironment,
});
