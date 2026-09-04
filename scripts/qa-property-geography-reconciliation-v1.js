"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const contract = require("../lib/property-reconciliation/property-reconciliation-v1.js");
const artifact = require("../data/internal/property-geography-reconciliation-v1/pilot-reconciliation.json");
const activationRegistry = require("../_data/recommendationActivationRegistry.js");

assert.equal(artifact.schemaVersion, "property-geography-reconciliation:v1");
assert.deepEqual(artifact.scope.pilotMarkets, ["san-francisco", "sacramento", "indianapolis", "denver-aurora", "orlando"]);
assert.equal(artifact.scope.publicBehavior, "NONE");
assert.equal(artifact.scope.availabilitySemantics, "HISTORICAL_OBSERVATION_ONLY_NOT_CURRENT_AVAILABILITY");
assert.deepEqual(artifact.taxonomies.conflictCodes, contract.CONFLICT_CODES);

const entities = artifact.entities;
assert(entities.length > 1000, "Pilot must process a meaningful corpus");
assert(entities.every((item) => contract.RECONCILIATION_STATUSES.includes(item.reconciliationStatus)));
assert(entities.every((item) => contract.PROCESSING_TIERS.includes(item.processingTier)));
assert(entities.every((item) => contract.RELATIONSHIP_CONFIDENCE.includes(item.relationshipConfidence)));
assert(entities.every((item) => item.provenance.length && item.sourceIds.length));
assert(entities.every((item) => !Object.prototype.hasOwnProperty.call(item, "availability") && !Object.prototype.hasOwnProperty.call(item, "askingRent") && !Object.prototype.hasOwnProperty.call(item, "brokerContact")));
assert(entities.every((item) => item.historicalObservationSummary.excludedFieldClasses.includes("TIME_SENSITIVE")));

const syntheticSuite = contract.reconcileGroup({ observations: [{ observationId: "suite-1", legacyBuildingId: "1", sourceAddress: "100 Main St Suite 200", sourceMunicipality: "Sacramento", sourceState: "CA", sourcePropertyTypes: ["office"], historicalListingCount: 1, hasHistoricalAvailability: true }], municipality: "Sacramento", state: "CA", municipalityVerified: true, identityEvidenceCount: 4 });
assert.equal(syntheticSuite.processingTier, "HUMAN_REVIEW");
assert(syntheticSuite.conflictCodes.includes("SUITE_BUILDING_AMBIGUITY"));
assert.equal(syntheticSuite.historicalObservationSummary.containsTimeSensitiveFields, true);
assert(!JSON.stringify(syntheticSuite).includes("available now"));

const multiId = contract.reconcileGroup({ observations: [
  { observationId: "a", legacyBuildingId: "1", sourceAddress: "100 Main St", sourceMunicipality: "Denver", sourceState: "CO", sourcePropertyTypes: ["industrial"] },
  { observationId: "b", legacyBuildingId: "2", sourceAddress: "100 Main Street", sourceMunicipality: "Denver", sourceState: "CO", sourcePropertyTypes: ["industrial"] },
], municipality: "Denver", state: "CO", municipalityVerified: true, identityEvidenceCount: 4 });
assert.equal(multiId.sourceIds.length, 2);
assert(multiId.conflictCodes.includes("MULTIPLE_LEGACY_IDS"));

const municipalConflict = contract.reconcileGroup({ observations: [{ observationId: "x", legacyBuildingId: "3", sourceAddress: "558 Airtech Parkway", sourceMunicipality: "Indianapolis", sourceState: "IN", sourcePropertyTypes: ["industrial"] }], municipality: "Plainfield", state: "IN", municipalityVerified: false, identityEvidenceCount: 4, geography: { geographyId: "invalid", label: "Invalid", municipality: "Indianapolis", confidence: "REVIEWED" } });
assert.equal(municipalConflict.processingTier, "HUMAN_REVIEW");
assert.equal(municipalConflict.relationshipConfidence, "CONFLICTED");

const typeConflict = contract.reconcilePropertyTypes(["industrial"], ["retail"]);
assert.deepEqual(typeConflict.reviewedTypes, ["retail"]);
assert(typeConflict.conflicts.includes("PROPERTY_TYPE_CONFLICT"));

function find(market, address) { return entities.find((item) => item.pilotMarketId === market && item.normalizedAddress === contract.normalizeAddress(address).normalized); }
for (const [address, geography] of [["8583 Elder Creek Road", "power-inn-industrial"], ["5711 Florin Perkins Road", "power-inn-industrial"], ["1329 N Market Boulevard", "northgate-north-market-industrial"]]) {
  const item = find("sacramento", address); assert(item, address); assert.equal(item.commercialGeography.geographyId, geography); assert.equal(item.relationshipConfidence, "REVIEWED");
}
for (const [address, geography] of [["7601 Winton Drive", "park-100-northwest-indianapolis"], ["4557 W Bradbury Avenue", "indianapolis-airport-logistics"]]) {
  const item = find("indianapolis", address); assert(item, address); assert.equal(item.commercialGeography.geographyId, geography); assert.equal(item.relationshipConfidence, "REVIEWED");
}
const airtech = find("indianapolis", "558 Airtech Parkway");
assert(airtech); assert.equal(airtech.municipality, "Plainfield"); assert.equal(airtech.processingTier, "HUMAN_REVIEW"); assert(airtech.conflictCodes.includes("CANONICAL_OWNERSHIP_CONFLICT")); assert.equal(airtech.commercialGeography, null); assert.equal(airtech.representativePotential, "NOT_REPRESENTATIVE");

const sacramentoLeakage = entities.filter((item) => item.pilotMarketId === "sacramento" && ["West Sacramento", "Rancho Cordova"].includes(item.municipality));
assert(sacramentoLeakage.length); assert(sacramentoLeakage.every((item) => item.processingTier === "HUMAN_REVIEW" && item.commercialGeography === null));
const denverConflicts = entities.filter((item) => item.pilotMarketId === "denver-aurora" && item.municipality === "Commerce City");
assert(denverConflicts.length); assert(denverConflicts.every((item) => item.conflictCodes.includes("MUNICIPALITY_CONFLICT") && item.commercialGeography === null));
const orlandoCandidates = entities.filter((item) => item.pilotMarketId === "orlando" && item.commercialGeography?.relationshipStatus === "atlas_discovery_candidate");
assert(orlandoCandidates.length); assert(orlandoCandidates.every((item) => item.processingTier !== "AUTO_PROMOTABLE_INTERNAL" && item.publicReadiness !== "PUBLIC_CANDIDATE_LATER"));

const autoPromotableShare = entities.filter((item) => item.processingTier === "AUTO_PROMOTABLE_INTERNAL").length / entities.length;
const autoQaShare = entities.filter((item) => item.processingTier === "AUTO_RECONCILE_QA").length / entities.length;
assert(autoPromotableShare < 0.03, "Automatic promotion must remain conservative");
assert(autoQaShare < 0.15, "Automated reconciliation must remain conservative");
assert(entities.filter((item) => item.processingTier === "DISCOVERY_ONLY").length > entities.length / 2);

for (const key of ["sacramento:industrial_flex:bounded", "indianapolis:industrial_flex:bounded", "phoenix:industrial_flex:bounded", "san-diego:industrial_flex:bounded", "north-orange-county:industrial_flex:bounded"]) assert.equal(activationRegistry.flows[key].activationEligible, true);
const source = fs.readFileSync(path.join(__dirname, "property-reconciliation/build-property-geography-reconciliation-v1.js"), "utf8");
assert(!/functions\/|pages\/|building\.njk|city\.njk/.test(source), "Generator must not write public routes or templates");
assert(source.includes('const REPORT_DIR = OUTPUT_DIR'), "Operator reports must remain in the internal data directory");
const publicReportDirectory = path.join(__dirname, "../docs/product/property-geography-reconciliation-v1");
assert(!fs.existsSync(publicReportDirectory) || !fs.readdirSync(publicReportDirectory).some((name) => name.endsWith(".md")), "Internal reports must not become Eleventy-rendered docs");
for (const name of ["README", "ownership-and-identity-conflicts", "property-type-conflicts", "duplicate-suite-campus-review", "representative-and-public-candidates", "atlas-integration"]) assert(fs.existsSync(path.join(__dirname, `../data/internal/property-geography-reconciliation-v1/${name}.txt`)), `${name} internal report missing`);

console.log(`Property/geography reconciliation v1 QA passed: ${entities.length} normalized identities across five pilots; observation/entity separation, ownership gates, type conflicts, discovery-only geography, conservative automation, and no runtime/public integration verified.`);
