"use strict";

const SPACE_TYPES = Object.freeze(["office", "retail", "industrial", "flex"]);
const PUBLIC_EVIDENCE_TIERS = Object.freeze(["PUBLIC_REVIEWED", "PUBLIC_CONTEXTUAL", "INTERNAL_RESEARCH", "DO_NOT_PUBLISH"]);
const APPLICABILITY = Object.freeze(["PRIMARY", "SECONDARY", "CONTEXTUAL", "NOT_APPLICABLE"]);
const ROUTE_STATES = Object.freeze(["ROUTE_READY", "ROUTE_EXISTS_NEEDS_CONTENT", "ROUTE_NEEDED_LATER", "DO_NOT_CREATE"]);
const INDEXATION = Object.freeze(["INDEX_READY", "COMPONENT_READY", "BUILD_THEN_INDEX", "INTERNAL_ONLY", "DO_NOT_CREATE"]);
const ACCESS_READINESS = Object.freeze(["OBJECTIVE_ACCESS_READY", "SOURCE_AVAILABLE_NEEDS_REVIEW", "SOURCE_NEEDED", "NOT_MATERIAL"]);
const BOUNDARY_TYPES = Object.freeze(["REVIEWED_POLYGON", "CORRIDOR", "CONTEXTUAL_SHAPE", "POINT_CONTEXT", "DESCRIPTIVE_ONLY"]);
const GEOGRAPHY_TYPES = Object.freeze(["OFFICE_DISTRICT", "INDUSTRIAL_DISTRICT", "INDUSTRIAL_CORRIDOR", "RETAIL_CORRIDOR", "MAIN_STREET", "BUSINESS_PARK", "FLEX_BUSINESS_PARK_ENVIRONMENT", "R_AND_D_TECHNICAL_CLUSTER", "LOGISTICS_ENVIRONMENT", "MIXED_COMMERCIAL_DISTRICT", "SPECIALIZED_OPERATING_ENVIRONMENT"]);

const assertEnum = (value, values, field) => {
  if (!values.includes(value)) throw new Error(`${field}: unsupported value ${value}`);
};

function validateGeography(geography) {
  for (const field of ["id", "label", "municipality", "parentCityId", "geographyType", "publicEvidenceTier", "boundaryType", "boundaryConfidence"]) {
    if (!geography[field]) throw new Error(`geography missing ${field}`);
  }
  assertEnum(geography.geographyType, GEOGRAPHY_TYPES, "geographyType");
  assertEnum(geography.publicEvidenceTier, PUBLIC_EVIDENCE_TIERS, "publicEvidenceTier");
  assertEnum(geography.boundaryType, BOUNDARY_TYPES, "boundaryType");
  if (!Array.isArray(geography.provenance) || !geography.provenance.length) throw new Error(`${geography.id}: provenance required`);
  if (!geography.grid || !Number.isInteger(geography.grid.order) || !geography.grid.group) throw new Error(`${geography.id}: non-geographic grid grouping required`);
  const seen = new Set();
  for (const relationship of geography.spaceTypes || []) {
    assertEnum(relationship.spaceType, SPACE_TYPES, "spaceType");
    assertEnum(relationship.applicability, APPLICABILITY, "applicability");
    assertEnum(relationship.routeState, ROUTE_STATES, "routeState");
    assertEnum(relationship.indexation, INDEXATION, "indexation");
    if (seen.has(relationship.spaceType)) throw new Error(`${geography.id}: duplicate space type`);
    seen.add(relationship.spaceType);
    if ((geography.publicEvidenceTier === "INTERNAL_RESEARCH" || geography.publicEvidenceTier === "DO_NOT_PUBLISH") && !["INTERNAL_ONLY", "DO_NOT_CREATE"].includes(relationship.indexation)) throw new Error(`${geography.id}: internal evidence cannot be indexable`);
    for (const pattern of relationship.areaPatterns || []) if (pattern.scope !== "AREA_PATTERN") throw new Error(`${geography.id}: property-use leakage`);
  }
  return geography;
}

function validateFoundation(markets) {
  const routes = new Map();
  for (const market of markets) {
    for (const geography of market.geographies || []) {
      validateGeography(geography);
      for (const relationship of geography.spaceTypes) {
        if (!relationship.route) continue;
        const key = `${relationship.spaceType}:${relationship.route}`;
        if (routes.has(key) && routes.get(key) !== geography.id) throw new Error(`duplicate route ${key}`);
        routes.set(key, geography.id);
      }
    }
  }
  return true;
}

module.exports = Object.freeze({
  schemaVersion: "public-commercial-geography:v1",
  SPACE_TYPES, PUBLIC_EVIDENCE_TIERS, APPLICABILITY, ROUTE_STATES, INDEXATION,
  ACCESS_READINESS, BOUNDARY_TYPES, GEOGRAPHY_TYPES, validateGeography, validateFoundation,
  availabilityFirewall: "Historical availability, rent, suites, brokers, tenants, loading, power, clear height, parking and permitted use are never public geography or durable-property facts.",
});
