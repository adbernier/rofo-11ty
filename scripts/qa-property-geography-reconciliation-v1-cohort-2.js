"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const contract = require("../lib/property-reconciliation/property-reconciliation-v1.js");
const activationRegistry = require("../_data/recommendationActivationRegistry.js");

const directory = path.join(__dirname, "../data/internal/property-geography-reconciliation-v1-cohort-2");
const index = require(path.join(directory, "index.json"));
const expectedMarkets = ["seattle-kent-eastside", "san-jose-south-bay", "detroit-novi", "atlanta", "nashville", "kansas-city-mo-ks", "miami-doral-medley", "las-vegas-clark-county", "east-bay", "los-angeles-independent-cities"];
assert.equal(index.schemaVersion, "property-geography-reconciliation:v1:cohort-2");
assert.deepEqual(index.scope.pilotMarkets, expectedMarkets);
assert.equal(index.scope.publicBehavior, "NONE");
assert.equal(index.deepReview.architectureDecision, "B. READY FOR ANOTHER 10-MARKET COHORT");
assert.equal(index.deepReview.architectureDrift, "CONTRACT_HANDLES_CLEANLY");

const entities = [];
for (const market of index.marketFiles) {
  const parts = market.sharded ? market.parts : [market];
  if (market.sharded) assert(fs.existsSync(path.join(directory, market.indexFile)));
  for (const part of parts) {
    const bytes = fs.readFileSync(path.join(directory, part.file));
    assert.equal(bytes.length, part.bytes);
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), part.sha256);
    assert(bytes.length < 35 * 1024 * 1024, `${part.file} exceeds conservative shard size`);
    const artifact = JSON.parse(bytes);
    assert.equal(artifact.scope.pilotMarket, market.marketId);
    assert(artifact.entities.every((item) => item.pilotMarketId === market.marketId));
    entities.push(...artifact.entities);
  }
}
assert.equal(entities.length, 58033);
assert.equal(entities.reduce((sum, item) => sum + item.historicalObservationSummary.count, 0), 92333);
assert.equal(index.deepReview.totals.canonicalMatches, 758);
assert.equal(index.deepReview.totals.reconciledEntities, 1223);
assert.equal(index.deepReview.totals.reviewedGeographyLinks, 0);
assert.equal(index.deepReview.totals.downgradedGeographyLinks, 22);
assert.equal(index.deepReview.totals.municipalityConflicts, 197);
assert.equal(index.deepReview.totals.humanReview, 1917);
assert.equal(index.deepReview.totals.discoveryOnly, 54238);
assert.equal(index.deepReview.totals.rejected, 655);

assert(entities.every((item) => item.marketScopeOwnership?.scopeType === "REGIONAL_DISCOVERY_SCOPE" && item.marketScopeOwnership.municipalityIsIndependent));
assert(entities.every((item) => item.provenance.length && item.sourceIds.length));
assert(entities.every((item) => !Object.prototype.hasOwnProperty.call(item, "availability") && !Object.prototype.hasOwnProperty.call(item, "askingRent") && !Object.prototype.hasOwnProperty.call(item, "brokerContact")));
assert(entities.every((item) => item.mediaRights === "RIGHTS_UNKNOWN"));
assert(entities.filter((item) => item.processingTier === "AUTO_RECONCILE_QA").every((item) => item.sourceIds.length === 1 && !item.conflictCodes.some((code) => ["MULTIPLE_LEGACY_IDS", "SUITE_BUILDING_AMBIGUITY", "CAMPUS_COMPLEX_AMBIGUITY", "PROPERTY_TYPE_CONFLICT", "MUNICIPALITY_CONFLICT", "ADDRESS_CONFLICT"].includes(code))));
assert(entities.filter((item) => item.sourceIds.length > 1).every((item) => !["AUTO_RECONCILE_QA", "AUTO_PROMOTABLE_INTERNAL"].includes(item.processingTier) || item.reconciliationStatus === "CANONICAL_MATCH"));

const typeConflicts = entities.filter((item) => item.conflictCodes.includes("PROPERTY_TYPE_CONFLICT"));
assert.equal(typeConflicts.length, 71);
assert(typeConflicts.every((item) => item.propertyType.source === "CURRENT_CANONICAL_RECORD" && item.propertyType.review.decision === "CANONICAL_TYPE_PREVAILS" && item.propertyType.review.historicalObservationsPreserved));
const links = entities.filter((item) => item.geographyLinkReview);
assert.equal(links.length, 22);
assert(links.every((item) => item.geographyLinkReview.classification === "DOWNGRADE_TO_CANDIDATE" && item.relationshipConfidence === "CANDIDATE"));
assert.equal(entities.filter((item) => item.representativeReview === "STRONG_REPRESENTATIVE_CANDIDATE").length, 0);
assert.equal(entities.filter((item) => item.representativeReview === "POSSIBLE_REPRESENTATIVE").length, 22);
assert.equal(entities.filter((item) => item.publicCandidateReview === "PUBLIC_CANDIDATE_REVIEWED").length, 0);
assert.equal(entities.filter((item) => item.publicCandidateReview === "NEEDS_MORE_EVIDENCE").length, 22);

const kansasCity = entities.filter((item) => item.pilotMarketId === "kansas-city-mo-ks" && item.municipality === "Kansas City");
assert(kansasCity.some((item) => item.state === "MO") && kansasCity.some((item) => item.state === "KS"));
assert(kansasCity.every((item) => item.marketScopeOwnership.stateLineKey === `${item.state}:kansas-city`));
const eastBay = entities.filter((item) => item.pilotMarketId === "east-bay");
assert(!eastBay.some((item) => item.municipality === "East Bay"));
assert(new Set(eastBay.map((item) => item.municipality)).size >= 10);
const losAngeles = entities.filter((item) => item.pilotMarketId === "los-angeles-independent-cities");
assert(new Set(losAngeles.map((item) => item.municipality)).size >= 15);
const clarkConflicts = entities.filter((item) => item.pilotMarketId === "las-vegas-clark-county" && item.conflictCodes.includes("MUNICIPALITY_CONFLICT"));
assert.equal(clarkConflicts.length, 197);
assert(clarkConflicts.every((item) => item.municipalityReview.classification === "REQUIRES_HUMAN_REVIEW" && item.municipalityReview.blocksGeographyPromotion && item.commercialGeography === null));

assert.equal(contract.normalizeAddress("1 Alhambra Plaza").normalized, contract.normalizeAddress("1 Alhambra Plz").normalized);
const sampledMarkets = new Set(entities.filter((item) => item.sampleReviews?.some((review) => review.category === "AUTO_PROMOTABLE_INTERNAL")).map((item) => item.pilotMarketId));
assert.deepEqual([...sampledMarkets].sort(), [...expectedMarkets].sort());
assert(entities.filter((item) => item.sampleReviews).every((item) => item.sampleReviews.every((review) => review.reviewBoundary === "INTERNAL_ONLY")));

const shares = Object.fromEntries(Object.entries(index.deepReview.automation).map(([key, value]) => [key, value / entities.length]));
assert(shares.autoPromotableInternal < 0.03);
assert(shares.autoReconcileQa < 0.02);
assert(shares.discoveryOnly > 0.9);
assert(index.deepReview.discoveryClusters.length > 50);
assert(index.deepReview.discoveryClusters.every((item) => item.status === "GEOGRAPHY_LINK_CANDIDATE"));
assert.equal(index.deepReview.marketFindings["las-vegas-clark-county"].architectureDrift, "BOUNDED_RULE_EXTENSION_NEEDED");

for (const key of ["sacramento:industrial_flex:bounded", "indianapolis:industrial_flex:bounded", "phoenix:industrial_flex:bounded", "san-diego:industrial_flex:bounded", "north-orange-county:industrial_flex:bounded"]) assert.equal(activationRegistry.flows[key].activationEligible, true);
for (const report of ["municipality-conflicts", "type-conflicts", "duplicate-hierarchy-review", "geography-link-candidates", "representative-candidates", "public-candidates-later", "missing-geography-candidates", "unresolved-high-value", "sample-review"]) assert(fs.existsSync(path.join(directory, `${report}.txt`)), `${report} missing`);
const generatorSource = fs.readFileSync(path.join(__dirname, "property-reconciliation/build-property-geography-reconciliation-v1.js"), "utf8");
assert(!/functions\/|pages\/|building\.njk|city\.njk/.test(generatorSource));
console.log("Property/geography reconciliation Cohort 2 QA passed: 10 municipality-first scopes, 92,333 observations, deterministic shards, conservative automation, sampled QA, and zero reviewed/public promotion verified.");
