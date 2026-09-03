const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const foundation = require("../_data/phoenixIndustrialFlexEvidenceFoundation");
const neighborhoodPages = require("../_data/neighborhoodPages");
const buildingRegistry = require("../data-sources/reference/company-buildings.json");

assert.equal(foundation.scope, "EVIDENCE_ONLY_NO_RESOLVER_OR_ACTIVATION");
assert.equal(foundation.recommendationBoundary, "CITY_OF_PHOENIX_ONLY");
assert.deepEqual(foundation.evidenceCandidateIds, [
  "southwest-phoenix-industrial",
  "airport-south-central-industrial",
  "north-phoenix-advanced-operations",
]);
assert.equal(Object.keys(foundation.candidates).length, 3);
assert.equal(foundation.representativeCount, 5);

for (const candidate of Object.values(foundation.candidates)) {
  assert.equal(candidate.municipality, "Phoenix");
  assert.equal(candidate.state, "AZ");
  assert.equal(candidate.confidence, "REVIEWED");
  assert.equal(candidate.reviewStatus, "CERTIFIED_RECOMMENDATION_EVIDENCE");
  assert(candidate.provenance.length >= 4);
  assert.match(candidate.geographicThesis, /Phoenix|City-of-Phoenix/);
  for (const item of candidate.representatives) {
    assert.equal(item.ownerGeographyId, candidate.geographyId);
    assert.equal(item.reviewStatus, "APPROVED_FOR_EVIDENCE_FOUNDATION");
    assert.equal(item.availabilitySemantics, "REPRESENTATIVE_ONLY_NOT_AVAILABILITY");
    assert(item.sources.length >= 3);
    assert.match(item.propertyVerification, /require current property investigation/);
  }
}

const pagesBySlug = new Map(neighborhoodPages.map((item) => [item.slug, item]));
const southwestOwner = pagesBySlug.get("southwest-phoenix-industrial");
assert(southwestOwner);
assert.equal(southwestOwner.city, "Phoenix");
assert.equal(southwestOwner.canonical_neighborhood_path, foundation.candidates["southwest-phoenix-industrial"].path);

for (const slug of ["phoenix-airport-sky-harbor-area", "deer-valley", "north-phoenix-tsmc-corridor"]) {
  const page = pagesBySlug.get(slug);
  assert(page, `missing Phoenix context ${slug}`);
  assert.equal(page.city, "Phoenix");
}
const tempe = pagesBySlug.get("tempe-i-10-industrial");
assert(tempe);
assert.equal(tempe.city, "Tempe");
assert.equal(foundation.tempeBoundary.relationship, "INDEPENDENT_CONTEXT_NOT_A_PHOENIX_CANDIDATE");
assert(!foundation.evidenceCandidateIds.includes("tempe-i-10-industrial"));

const buildingsByPath = new Map(buildingRegistry.map((item) => [item.building_path, item]));
const buildingRepresentatives = Object.values(foundation.candidates)
  .flatMap((candidate) => candidate.representatives)
  .filter((item) => item.kind === "BUILDING");
assert.equal(buildingRepresentatives.length, 3);
for (const item of buildingRepresentatives) {
  const building = buildingsByPath.get(item.path);
  assert(building, `missing canonical building ${item.path}`);
  assert.equal(building.city, "Phoenix");
  assert.equal(building.primary_space_type, "industrial");
}
assert(foundation.candidates["north-phoenix-advanced-operations"].representatives.every((item) => item.kind === "COMMERCIAL_ENVIRONMENT"));

for (const model of ["industrial", "flex", "mixed"]) {
  assert.deepEqual(Object.keys(foundation.evidence[model]), foundation.evidenceCandidateIds);
  for (const candidateId of foundation.evidenceCandidateIds) {
    assert(foundation.evidence[model][candidateId].traits.length);
  }
}
for (const candidateId of foundation.evidenceCandidateIds) {
  assert.notDeepEqual(foundation.evidence.industrial[candidateId].traits, foundation.evidence.flex[candidateId].traits);
}

const serialized = JSON.stringify(foundation);
for (const unsupportedCandidate of ["tempe-i-10-industrial", "mesa", "chandler", "scottsdale", "glendale", "goodyear", "avondale"]) {
  assert(!foundation.evidenceCandidateIds.includes(unsupportedCandidate));
}
for (const unsupportedTrait of ["HIGH_LOADING", "HIGH_TRUCK_ACCESS", "CLEAR_HEIGHT", "POWER", "YARD", "TRAILER_ACCESS", "AIRPORT_ACCESS", "FREEWAY_ACCESS", "LAB_CAPABLE", "SEMICONDUCTOR_CAPABLE", "CLEAN_ROOM_CAPABLE"]) {
  assert(!serialized.includes(`\"${unsupportedTrait}\"`), `${unsupportedTrait} must not be promoted as a reviewed trait`);
}
assert.equal(foundation.accessIntelligence.status, "INSUFFICIENT_FOR_RECOMMENDATION");
assert.equal(foundation.requirementSignalCompatibility.status, "SUFFICIENT_WITH_ABSTENTION");
assert(foundation.futureEntryContext.accepted.every((item) => item.treatment === "COMPARISON_CONTEXT_ONLY"));
assert.equal(foundation.futureEntryContext.canonicalRequirementAnchor.marketId, "phoenix-metro");
assert.equal(foundation.futureEntryContext.canonicalRequirementAnchor.city, "Phoenix");
assert(foundation.futureEntryContext.rejectedMarketIds.includes("generic-phoenix-metro-without-phoenix-city"));
assert(foundation.futureEntryContext.rejectedMarketIds.includes("tempe"));

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
assert.equal(packageJson.scripts["qa:phoenix-industrial-flex-evidence"], "node scripts/qa-phoenix-industrial-flex-evidence.js");

console.log("Phoenix Industrial/Flex evidence QA passed: three bounded City of Phoenix candidates, five reviewed representatives, separate Industrial/Flex evidence, Tempe exclusion, provenance, and property/access boundaries verified.");
