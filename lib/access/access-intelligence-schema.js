(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.RofoAccessIntelligenceSchema = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const SCHEMA_VERSION = "rofo-access-intelligence:v0";
  const ACCESS_STATES = ["STRONG", "GOOD", "MODERATE", "WEAK", "UNKNOWN"];
  const REVIEW_STATES = ["APPROVED", "CANDIDATE", "STALE"];
  const FOUNDATION_LEVELS = ["UNMAPPED", "GEOGRAPHIC", "REVIEWED", "ADVANCED"];
  const COMPLETENESS_STATES = ["SUFFICIENT", "PARTIAL", "MISSING"];
  const CONFIDENCE_STATES = ["HIGH", "MEDIUM", "LOW", "UNKNOWN"];
  const ORIGIN_TYPES = ["CANONICAL_MARKET", "CITY_CLUSTER", "METRO_SECTOR", "SUBMARKET_CLUSTER", "CORRIDOR_CATCHMENT", "EXTERNAL_MARKET", "LOCAL_CORE"];
  const GATEWAY_TYPES = ["BRIDGE", "FREEWAY", "INTERSTATE", "MAJOR_ARTERIAL", "REGIONAL_RAIL", "COMMUTER_RAIL", "FERRY", "LIGHT_RAIL", "BUS_NETWORK", "AIRPORT", "TRANSFER_HUB", "ACCESS_CORRIDOR"];
  const ACTOR_TYPES = ["EMPLOYEE", "CLIENT_CUSTOMER", "SERVICE_TERRITORY"];
  const IMPORTANCE_STATES = ["CORE", "MATERIAL", "CONSIDER", "LOW", "UNKNOWN"];
  const FREQUENCY_STATES = ["RECURRING", "FREQUENT", "OCCASIONAL", "RARE", "UNKNOWN"];
  const MODES = ["REGIONAL_TRANSIT", "LOCAL_TRANSIT", "DRIVING", "FERRY"];
  const ID_PATTERN = /^[a-z0-9][a-z0-9:._-]*$/;

  function issue(errors, condition, message) { if (!condition) errors.push(message); }
  function validId(value) { return typeof value === "string" && ID_PATTERN.test(value); }
  function uniqueIds(items, key, errors, label) {
    const ids = (items || []).map((item) => item && item[key]);
    issue(errors, ids.every(validId), `${label} contains an invalid stable ID.`);
    issue(errors, new Set(ids).size === ids.length, `${label} IDs must be unique.`);
  }
  function validCompleteness(value, errors, label) {
    const keys = ["originRegions", "gateways", "districtGeometry", "originAccess", "transit", "driving", "parking", "ferry", "explanations"];
    issue(errors, value && typeof value === "object", `${label} completeness is required.`);
    keys.forEach((key) => issue(errors, value && COMPLETENESS_STATES.includes(value[key]), `${label} completeness.${key} is invalid.`));
  }

  function validateAccessMarketFoundation(value, context = {}) {
    const errors = [];
    issue(errors, value && validId(value.foundationId), "AccessMarketFoundation.foundationId is invalid.");
    issue(errors, value && validId(value.marketId), "AccessMarketFoundation.marketId is invalid.");
    if (context.marketIds) issue(errors, context.marketIds.has(value.marketId), `Unknown canonical market ${value.marketId}.`);
    issue(errors, FOUNDATION_LEVELS.includes(value.foundationLevel), "AccessMarketFoundation.foundationLevel is invalid.");
    issue(errors, REVIEW_STATES.includes(value.reviewStatus), "AccessMarketFoundation.reviewStatus is invalid.");
    issue(errors, CONFIDENCE_STATES.includes(value.confidence), "AccessMarketFoundation.confidence is invalid.");
    uniqueIds(value.originRegions, "originRegionId", errors, "OriginRegion");
    uniqueIds(value.gateways, "gatewayId", errors, "AccessGateway");
    uniqueIds(value.evidence, "evidenceId", errors, "AccessEvidence");
    uniqueIds(value.districtProfiles, "districtId", errors, "DistrictAccessProfile");
    validCompleteness(value.completeness, errors, "Market foundation");
    return errors;
  }

  function validateOriginRegion(value, context = {}) {
    const errors = [];
    issue(errors, value && validId(value.originRegionId), "OriginRegion.originRegionId is invalid.");
    issue(errors, value && validId(value.marketId), "OriginRegion.marketId is invalid.");
    issue(errors, ORIGIN_TYPES.includes(value.regionType), `OriginRegion ${value.originRegionId} has invalid regionType.`);
    issue(errors, REVIEW_STATES.includes(value.reviewStatus), `OriginRegion ${value.originRegionId} has invalid reviewStatus.`);
    issue(errors, CONFIDENCE_STATES.includes(value.confidence), `OriginRegion ${value.originRegionId} has invalid confidence.`);
    if (context.gatewayIds) (value.gatewayRelationshipIds || []).forEach((id) => issue(errors, context.gatewayIds.has(id), `OriginRegion ${value.originRegionId} references unknown gateway ${id}.`));
    return errors;
  }

  function validateGateway(value, context = {}) {
    const errors = [];
    issue(errors, value && validId(value.gatewayId), "AccessGateway.gatewayId is invalid.");
    issue(errors, GATEWAY_TYPES.includes(value.gatewayType), `Gateway ${value.gatewayId} has invalid gatewayType.`);
    issue(errors, REVIEW_STATES.includes(value.reviewStatus), `Gateway ${value.gatewayId} has invalid reviewStatus.`);
    issue(errors, (value.modes || []).every((mode) => MODES.includes(mode)), `Gateway ${value.gatewayId} has invalid modes.`);
    [...(value.originRelationships || []), ...(value.districtRelationships || [])].forEach((relationship) => {
      issue(errors, ACCESS_STATES.includes(relationship.rating), `Gateway ${value.gatewayId} relationship has invalid rating.`);
      issue(errors, REVIEW_STATES.includes(relationship.reviewStatus), `Gateway ${value.gatewayId} relationship has invalid reviewStatus.`);
      issue(errors, (relationship.evidenceIds || []).length > 0, `Gateway ${value.gatewayId} relationship lacks evidence provenance.`);
      if (context.evidenceIds) (relationship.evidenceIds || []).forEach((id) => issue(errors, context.evidenceIds.has(id), `Gateway ${value.gatewayId} references unknown evidence ${id}.`));
    });
    return errors;
  }

  function validateEvidence(value) {
    const errors = [];
    issue(errors, value && validId(value.evidenceId), "AccessEvidence.evidenceId is invalid.");
    issue(errors, REVIEW_STATES.includes(value.reviewStatus), `Evidence ${value.evidenceId} has invalid reviewStatus.`);
    issue(errors, CONFIDENCE_STATES.includes(value.confidence), `Evidence ${value.evidenceId} has invalid confidence.`);
    issue(errors, value && value.source && value.source.reference, `Evidence ${value.evidenceId} lacks source provenance.`);
    return errors;
  }

  function validateDistrictAccessProfile(value, context = {}) {
    const errors = [];
    issue(errors, value && validId(value.districtId), "DistrictAccessProfile.districtId is invalid.");
    if (context.districtIds) issue(errors, context.districtIds.has(value.districtId), `Unknown canonical district ${value.districtId}.`);
    issue(errors, REVIEW_STATES.includes(value.reviewStatus), `District ${value.districtId} has invalid reviewStatus.`);
    issue(errors, CONFIDENCE_STATES.includes(value.confidence), `District ${value.districtId} has invalid confidence.`);
    issue(errors, ACCESS_STATES.includes(value.parkingEnvironment), `District ${value.districtId} has invalid parkingEnvironment.`);
    validCompleteness(value.completeness, errors, `District ${value.districtId}`);
    (value.gatewayRelationships || []).forEach((relationship) => {
      issue(errors, ACCESS_STATES.includes(relationship.rating), `District ${value.districtId} gateway relationship has invalid rating.`);
      issue(errors, REVIEW_STATES.includes(relationship.reviewStatus), `District ${value.districtId} gateway relationship has invalid reviewStatus.`);
      if (context.gatewayIds) issue(errors, context.gatewayIds.has(relationship.gatewayId), `District ${value.districtId} references unknown gateway ${relationship.gatewayId}.`);
    });
    return errors;
  }

  function validateRequirementAccessProfile(value) {
    const errors = [];
    issue(errors, value && validId(value.marketId), "RequirementAccessProfile.marketId is invalid.");
    uniqueIds(value.cohorts, "cohortId", errors, "Requirement cohort");
    (value.cohorts || []).forEach((cohort) => {
      issue(errors, ACTOR_TYPES.includes(cohort.actorType), `Cohort ${cohort.cohortId} has invalid actorType.`);
      issue(errors, IMPORTANCE_STATES.includes(cohort.importance), `Cohort ${cohort.cohortId} has invalid importance.`);
      issue(errors, FREQUENCY_STATES.includes(cohort.frequency), `Cohort ${cohort.cohortId} has invalid frequency.`);
      issue(errors, (cohort.modePreferences || []).every((item) => MODES.includes(item.mode) && IMPORTANCE_STATES.includes(item.importance)), `Cohort ${cohort.cohortId} has invalid mode preferences.`);
    });
    return errors;
  }

  function validateAccessFitResult(value) {
    const errors = [];
    issue(errors, value && validId(value.districtId), "AccessFitResult.districtId is invalid.");
    issue(errors, ACCESS_STATES.includes(value.overall), `AccessFitResult ${value.districtId} has invalid overall rating.`);
    issue(errors, CONFIDENCE_STATES.includes(value.confidence), `AccessFitResult ${value.districtId} has invalid confidence.`);
    (value.explanationTrace || []).forEach((trace) => issue(errors, (trace.evidenceIds || []).length > 0, `AccessFitResult ${value.districtId} contains an explanation without evidence.`));
    return errors;
  }

  function validateFoundation(value, context = {}) {
    const errors = validateAccessMarketFoundation(value, context);
    const evidenceIds = new Set((value.evidence || []).map((item) => item.evidenceId));
    const gatewayIds = new Set((value.gateways || []).map((item) => item.gatewayId));
    (value.evidence || []).forEach((item) => errors.push(...validateEvidence(item)));
    (value.originRegions || []).forEach((item) => errors.push(...validateOriginRegion(item, { gatewayIds })));
    (value.gateways || []).forEach((item) => errors.push(...validateGateway(item, { evidenceIds })));
    (value.districtProfiles || []).forEach((item) => errors.push(...validateDistrictAccessProfile(item, { ...context, gatewayIds })));
    return errors;
  }

  return {
    SCHEMA_VERSION, ACCESS_STATES, REVIEW_STATES, FOUNDATION_LEVELS, COMPLETENESS_STATES, CONFIDENCE_STATES,
    ORIGIN_TYPES, GATEWAY_TYPES, ACTOR_TYPES, IMPORTANCE_STATES, FREQUENCY_STATES, MODES,
    validateAccessMarketFoundation, validateOriginRegion, validateGateway, validateEvidence,
    validateDistrictAccessProfile, validateRequirementAccessProfile, validateAccessFitResult, validateFoundation,
  };
});
