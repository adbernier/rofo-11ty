"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const contract = require("../lib/property-reconciliation/property-reconciliation-v1.js");
const activationRegistry = require("../_data/recommendationActivationRegistry.js");

const directory = path.join(__dirname, "../data/internal/property-geography-reconciliation-v1");
const index = require(path.join(directory, "index.json"));
assert.deepEqual(index.scope.pilotMarkets, ["san-francisco", "sacramento", "indianapolis", "denver-aurora", "orlando"]);
assert.equal(index.scope.publicBehavior, "NONE");
assert.equal(index.deepReview.architectureDecision, "B. READY TO SCALE TO NEXT 10 MARKETS WITH QA");
assert.equal(index.marketFiles.length, 5);
const entities = [];
for (const entry of index.marketFiles) {
  const file = path.join(directory, entry.file);
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.length, entry.bytes);
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), entry.sha256);
  assert(bytes.length < 50 * 1024 * 1024, `${entry.file} must remain below 50 MB`);
  const artifact = JSON.parse(bytes);
  assert.equal(artifact.scope.pilotMarket, entry.marketId);
  assert.equal(artifact.entities.length, entry.entityCount);
  entities.push(...artifact.entities);
}
assert.equal(entities.length, 39944);
assert.equal(entities.reduce((sum, item) => sum + item.historicalObservationSummary.count, 0), 51914);
assert(!fs.existsSync(path.join(directory, "pilot-reconciliation.json")), "Monolithic artifact must be replaced by partitions");
assert(entities.every((item) => contract.RECONCILIATION_STATUSES.includes(item.reconciliationStatus)));
assert(entities.every((item) => contract.PROCESSING_TIERS.includes(item.processingTier)));
assert(entities.every((item) => item.provenance.length && item.sourceIds.length));
assert(entities.every((item) => !Object.prototype.hasOwnProperty.call(item, "availability") && !Object.prototype.hasOwnProperty.call(item, "askingRent") && !Object.prototype.hasOwnProperty.call(item, "brokerContact")));
assert(entities.every((item) => item.historicalObservationSummary.excludedFieldClasses.includes("TIME_SENSITIVE")));

const baselineQa = entities.filter((item) => item.deepReview?.baselineTier === "AUTO_RECONCILE_QA");
assert.equal(baselineQa.length, 644);
assert.equal(baselineQa.filter((item) => item.deepReview.decision === "RECONCILED_PROPERTY").length, 155);
assert.equal(baselineQa.filter((item) => item.deepReview.decision !== "RECONCILED_PROPERTY").length, 489);
assert(baselineQa.filter((item) => item.deepReview.decision === "RECONCILED_PROPERTY").every((item) => !item.conflictCodes.includes("MULTIPLE_LEGACY_IDS")));

const municipalConflicts = entities.filter((item) => item.conflictCodes.includes("MUNICIPALITY_CONFLICT"));
assert.equal(municipalConflicts.length, 2442);
assert(municipalConflicts.every((item) => contract.MUNICIPALITY_REVIEW_CLASSIFICATIONS.includes(item.municipalityReview.classification) && item.municipalityReview.blocksGeographyPromotion && item.commercialGeography === null));
const geographyLinks = entities.filter((item) => item.geographyLinkReview);
assert.equal(geographyLinks.length, 64);
assert.equal(geographyLinks.filter((item) => item.geographyLinkReview.classification === "REVIEWED_CONFIRMED").length, 5);
assert.equal(geographyLinks.filter((item) => item.geographyLinkReview.classification === "DOWNGRADE_TO_CANDIDATE").length, 59);
assert(geographyLinks.filter((item) => item.geographyLinkReview.classification === "DOWNGRADE_TO_CANDIDATE").every((item) => item.relationshipConfidence === "CANDIDATE"));

const typeConflicts = entities.filter((item) => item.conflictCodes.includes("PROPERTY_TYPE_CONFLICT"));
assert.equal(typeConflicts.length, 3);
assert.deepEqual(typeConflicts.map((item) => item.normalizedAddress), ["555 mission rock st", "700 indiana st", "900 minnesota st"]);
for (const item of typeConflicts) {
  assert.equal(item.propertyType.source, "CURRENT_CANONICAL_RECORD");
  assert.equal(item.propertyType.review.decision, "CANONICAL_TYPE_PREVAILS");
  assert.equal(item.propertyType.review.historicalObservationsPreserved, true);
  assert.equal(item.propertyType.review.multiTypeDefensible, false);
}

function find(market, address) { return entities.find((item) => item.pilotMarketId === market && item.normalizedAddress === contract.normalizeAddress(address).normalized); }
for (const [market, address, geography] of [["sacramento", "8583 Elder Creek Road", "power-inn-industrial"], ["sacramento", "5711 Florin Perkins Road", "power-inn-industrial"], ["sacramento", "1329 N Market Boulevard", "northgate-north-market-industrial"], ["indianapolis", "7601 Winton Drive", "park-100-northwest-indianapolis"], ["indianapolis", "4557 W Bradbury Avenue", "indianapolis-airport-logistics"]]) {
  const item = find(market, address); assert(item, address); assert.equal(item.commercialGeography.geographyId, geography); assert.equal(item.geographyLinkReview.classification, "REVIEWED_CONFIRMED");
}
const airtech = find("indianapolis", "558 Airtech Parkway");
assert.equal(airtech.municipality, "Plainfield"); assert.equal(airtech.municipalityReview.classification, "LEGACY_SOURCE_WRONG"); assert.equal(airtech.commercialGeography, null); assert.equal(airtech.representativeReview, "NOT_REPRESENTATIVE");
for (const item of entities.filter((row) => row.pilotMarketId === "sacramento" && ["West Sacramento", "Rancho Cordova"].includes(row.municipality))) assert(["MARKET_LABEL_TOO_BROAD", "COORDINATE_CONFLICT", "ADDRESS_AMBIGUOUS"].includes(item.municipalityReview.classification));
for (const item of entities.filter((row) => row.pilotMarketId === "denver-aurora" && row.municipality === "Commerce City")) assert(["MARKET_LABEL_TOO_BROAD", "COORDINATE_CONFLICT", "ADDRESS_AMBIGUOUS"].includes(item.municipalityReview.classification));
const orlandoCandidates = entities.filter((item) => item.pilotMarketId === "orlando" && item.commercialGeography?.relationshipStatus === "atlas_discovery_candidate");
assert(orlandoCandidates.length); assert(orlandoCandidates.every((item) => ["DISCOVERY_ONLY", "HUMAN_REVIEW"].includes(item.processingTier) && !item.geographyLinkReview && item.publicCandidateReview !== "PUBLIC_CANDIDATE_REVIEWED"));

assert.equal(entities.filter((item) => item.representativeReview === "STRONG_REPRESENTATIVE_CANDIDATE").length, 5);
assert.equal(entities.filter((item) => item.representativeReview === "POSSIBLE_REPRESENTATIVE").length, 60);
assert.equal(entities.filter((item) => item.publicCandidateReview === "PUBLIC_CANDIDATE_REVIEWED").length, 5);
assert.equal(entities.filter((item) => item.publicCandidateReview === "NEEDS_MORE_EVIDENCE").length, 59);
assert(entities.every((item) => item.mediaRights === "RIGHTS_UNKNOWN"));

const syntheticSuite = contract.reconcileGroup({ observations: [{ observationId: "suite-1", legacyBuildingId: "1", sourceAddress: "100 Main St Suite 200", sourceMunicipality: "Sacramento", sourceState: "CA", sourcePropertyTypes: ["office"], historicalListingCount: 1, hasHistoricalAvailability: true }], municipality: "Sacramento", state: "CA", municipalityVerified: true, identityEvidenceCount: 4 });
assert.equal(syntheticSuite.processingTier, "HUMAN_REVIEW"); assert(syntheticSuite.conflictCodes.includes("SUITE_BUILDING_AMBIGUITY")); assert.equal(syntheticSuite.historicalObservationSummary.containsTimeSensitiveFields, true);
const multiId = contract.reconcileGroup({ observations: [{ observationId: "a", legacyBuildingId: "1", sourceAddress: "100 Main St", sourceMunicipality: "Denver", sourceState: "CO", sourcePropertyTypes: ["industrial"] }, { observationId: "b", legacyBuildingId: "2", sourceAddress: "100 Main Street", sourceMunicipality: "Denver", sourceState: "CO", sourcePropertyTypes: ["industrial"] }], municipality: "Denver", state: "CO", municipalityVerified: true, identityEvidenceCount: 4 });
assert.equal(multiId.sourceIds.length, 2); assert(multiId.conflictCodes.includes("MULTIPLE_LEGACY_IDS"));

for (const key of ["sacramento:industrial_flex:bounded", "indianapolis:industrial_flex:bounded", "phoenix:industrial_flex:bounded", "san-diego:industrial_flex:bounded", "north-orange-county:industrial_flex:bounded"]) assert.equal(activationRegistry.flows[key].activationEligible, true);
const source = fs.readFileSync(path.join(__dirname, "property-reconciliation/build-property-geography-reconciliation-v1.js"), "utf8");
assert(!/functions\/|pages\/|building\.njk|city\.njk/.test(source)); assert(source.includes("const REPORT_DIR = OUTPUT_DIR"));
for (const name of ["README", "municipality-conflicts", "geography-link-review", "type-conflicts", "representative-candidates", "public-candidates-later", "unresolved-high-value", "atlas-integration"]) assert(fs.existsSync(path.join(directory, `${name}.txt`)), `${name} report missing`);
console.log(`Property/geography reconciliation deep-review QA passed: ${entities.length} identities, 644 QA entities reassessed, 2,442 municipality conflicts classified, 64 geography links adjudicated, and five deterministic partitions verified.`);
