"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const contract = require("../lib/representative-property/representative-property-foundation-v1.js");
const activationRegistry = require("../_data/recommendationActivationRegistry.js");

const root = path.join(__dirname, "..");
const directory = path.join(root, "data/internal/representative-property-foundation-v1");
const index = JSON.parse(fs.readFileSync(path.join(directory, "index.json")));
const expectedMarkets = [
  "san-francisco", "sacramento", "indianapolis", "denver-aurora", "orlando",
  "seattle-kent-eastside", "san-jose-south-bay", "detroit-novi", "atlanta", "nashville",
  "kansas-city-mo-ks", "miami-doral-medley", "las-vegas-clark-county", "east-bay",
  "los-angeles-independent-cities",
];

assert.equal(index.schemaVersion, "representative-property-foundation:v1");
assert.deepEqual(index.scope.markets, expectedMarkets);
assert.equal(index.scope.publicBehavior, "NONE");
assert.equal(index.scope.liveRepresentativeMutation, "NONE");
assert.equal(index.decision, "A. REPRESENTATIVE FOUNDATION READY — USE IN FUTURE EVIDENCE SPRINTS");
assert.equal(index.nextHorizontalRecommendation, "DURABLE PROPERTY ENTITY PILOT");

const records = [];
for (const marketFile of index.marketFiles) {
  const bytes = fs.readFileSync(path.join(directory, marketFile.file));
  assert.equal(bytes.length, marketFile.bytes);
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), marketFile.sha256);
  assert(bytes.length < 35 * 1024 * 1024);
  const artifact = JSON.parse(bytes);
  assert.equal(artifact.scope.marketId, marketFile.marketId);
  assert.equal(artifact.scope.publicBehavior, "NONE");
  records.push(...artifact.representatives, ...artifact.environments);
}
assert.equal(index.totals.markets, 15);
assert.equal(index.totals.reviewedRepresentatives, 14);
assert.equal(index.totals.strongCandidates, 0);
assert.equal(index.totals.possibleCandidates, 79);
assert.equal(index.totals.environmentRepresentatives, 3);
assert.equal(index.totals.notRepresentative, 1);

const reviewed = records.filter((item) => item.representativeStatus === "REVIEWED_REPRESENTATIVE");
const possible = records.filter((item) => item.representativeStatus === "POSSIBLE_REPRESENTATIVE");
assert(reviewed.every((item) => item.qualification.reviewedGeography));
assert(possible.filter((item) => item.qualification.candidateGeography).every((item) => !item.qualification.reviewedGeography));
assert(!records.some((item) => item.representativeStatus === "STRONG_REPRESENTATIVE_CANDIDATE" && item.qualification.candidateGeography));
assert(records.filter((item) => item.qualification?.blockingConflicts?.length).every((item) => item.representativeStatus === "NOT_REPRESENTATIVE"));
assert(records.every((item) => item.availabilityBoundary && !Object.prototype.hasOwnProperty.call(item, "availability") && !Object.prototype.hasOwnProperty.call(item, "askingRent")));
assert(records.every((item) => item.mediaRights === "RIGHTS_UNKNOWN"));
assert(records.every((item) => item.publicUseStatus !== "PUBLIC_REPRESENTATIVE_CANDIDATE" || item.representativeStatus === "REVIEWED_REPRESENTATIVE" || item.representativeStatus === "REPRESENTATIVE_ENVIRONMENT"));
assert(records.filter((item) => item.kind === "COMMERCIAL_ENVIRONMENT").every((item) => item.rendersAs === "ENVIRONMENT" && item.availabilityBoundary === "ENVIRONMENT_CONTEXT_NOT_PROPERTY_OR_AVAILABILITY"));

const candidateFixture = { reconciliationStatus: "GEOGRAPHY_LINK_CANDIDATE", relationshipConfidence: "CANDIDATE", geographyLinkReview: { classification: "DOWNGRADE_TO_CANDIDATE" }, propertyType: { reviewedTypes: ["industrial"] }, conflictCodes: [], provenance: ["fixture"], mediaRights: "RIGHTS_UNKNOWN" };
assert.equal(contract.qualifyProperty({ entity: candidateFixture, explanatoryRole: "warehouse example" }).representativeStatus, "POSSIBLE_REPRESENTATIVE");
assert.equal(contract.qualifyProperty({ entity: { ...candidateFixture, conflictCodes: ["MUNICIPALITY_CONFLICT"] }, explanatoryRole: "warehouse example" }).representativeStatus, "NOT_REPRESENTATIVE");
assert.equal(contract.qualifyProperty({ entity: { ...candidateFixture, conflictCodes: ["SUITE_BUILDING_AMBIGUITY"] }, explanatoryRole: "warehouse example" }).representativeStatus, "NOT_REPRESENTATIVE");
assert.equal(contract.qualifyProperty({ entity: { ...candidateFixture, conflictCodes: ["PROPERTY_TYPE_CONFLICT"] }, explanatoryRole: "warehouse example" }).representativeStatus, "NOT_REPRESENTATIVE");
const mediaIndependent = contract.qualifyProperty({ entity: { ...candidateFixture, relationshipConfidence: "REVIEWED", geographyLinkReview: { classification: "REVIEWED_CONFIRMED" } }, explanatoryRole: "warehouse example", mediaRights: "RIGHTS_UNKNOWN" });
assert.equal(mediaIndependent.representativeStatus, "STRONG_REPRESENTATIVE_CANDIDATE");
assert.equal(mediaIndependent.mediaRights, "RIGHTS_UNKNOWN");

assert.equal(index.calibration["san-francisco"].matchRate, 0.75);
assert.deepEqual(index.calibration["san-francisco"].missed, ["680 Folsom St", "Pier 70 Building 101", "1201 Illinois St"]);
for (const market of ["sacramento", "indianapolis"]) assert.equal(index.calibration[market].matchRate, 1);
for (const market of ["san-diego", "north-orange-county", "phoenix"]) assert.equal(index.calibration[market].liveSetMutation, "NONE");
const sacramento = JSON.parse(fs.readFileSync(path.join(directory, "sacramento.json")));
assert.deepEqual(sacramento.representatives.filter((item) => item.representativeStatus === "REVIEWED_REPRESENTATIVE").map((item) => item.label).sort(), ["1329 N Market Boulevard", "5711 Florin Perkins Road", "8583 Elder Creek Road"]);
assert.deepEqual(sacramento.environments.map((item) => item.label), ["Northgate / North Market Industrial Environment"]);
const indianapolis = JSON.parse(fs.readFileSync(path.join(directory, "indianapolis.json")));
assert.deepEqual(indianapolis.representatives.filter((item) => item.representativeStatus === "REVIEWED_REPRESENTATIVE").map((item) => item.label).sort(), ["4557 W Bradbury Avenue", "7601 Winton Drive"]);
assert.deepEqual(indianapolis.environments.map((item) => item.label).sort(), ["Park 100 Multi-Tenant Industrial/Flex Environment", "Park Fletcher / Stout Field Industrial Environment"]);

const cohort2Markets = new Set(expectedMarkets.slice(5));
assert.equal(possible.filter((item) => cohort2Markets.has(item.sourceArtifactMarket)).length, 22);
assert.equal(records.filter((item) => cohort2Markets.has(item.sourceArtifactMarket) && item.representativeStatus === "STRONG_REPRESENTATIVE_CANDIDATE").length, 0);
for (const report of ["reviewed-representatives", "strong-representative-candidates", "possible-representatives", "environment-candidates", "representative-conflicts", "public-representative-candidates", "media-rights-review", "geography-coverage", "live-set-calibration"]) assert(fs.existsSync(path.join(directory, "reports", `${report}.txt`)));

for (const key of ["sacramento:industrial_flex:bounded", "indianapolis:industrial_flex:bounded", "phoenix:industrial_flex:bounded", "san-diego:industrial_flex:bounded", "north-orange-county:industrial_flex:bounded"]) assert.equal(activationRegistry.flows[key].activationEligible, true);
const generator = fs.readFileSync(path.join(root, "scripts/representative-property/build-representative-property-foundation-v1.js"), "utf8");
assert(!/functions\/|pages\/|building\.njk|city\.njk|d1 execute|recommendation-activation\.js set/.test(generator));
console.log("Representative Property Foundation v1 QA passed: 15 internal markets, reviewed geography gating, live-set calibration, candidate-only containment, deterministic hashes, and zero public/runtime behavior verified.");
