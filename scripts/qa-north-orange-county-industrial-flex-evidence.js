const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const foundation = require("../_data/northOrangeCountyIndustrialFlexEvidenceFoundation");
const neighborhoodPages = require("../_data/neighborhoodPages");
const buildingRegistry = require("../data-sources/reference/company-buildings.json");

assert.equal(foundation.scope, "EVIDENCE_ONLY_NO_RESOLVER_OR_ACTIVATION");
assert.deepEqual(foundation.evidenceCandidateIds, ["anaheim-canyon", "fullerton-industrial-service-area"]);
assert.equal(Object.keys(foundation.candidates).length, 2);
assert.equal(foundation.representativeCount, 4);
assert.equal(foundation.candidates["anaheim-canyon"].municipality, "Anaheim");
assert.equal(foundation.candidates["fullerton-industrial-service-area"].municipality, "Fullerton");
assert.match(foundation.candidates["fullerton-industrial-service-area"].geographicThesis, /not the entire City of Fullerton/);

const publicOwners = new Map(neighborhoodPages.map((item) => [item.slug, item]));
for (const candidate of Object.values(foundation.candidates)) {
  const ownerSlug = candidate.publicOwnerId.replace(/^oc-/, "");
  const owner = publicOwners.get(ownerSlug);
  assert(owner, `missing public owner ${candidate.publicOwnerId}`);
  assert.equal(owner.city, candidate.municipality);
  assert.equal(owner.canonical_neighborhood_path, candidate.path);
  assert.equal(candidate.confidence, "REVIEWED");
  assert.equal(candidate.reviewStatus, "CERTIFIED_RECOMMENDATION_EVIDENCE");
  assert(candidate.provenance.length >= 2);
  for (const item of candidate.representatives) {
    assert.equal(item.ownerGeographyId, candidate.geographyId);
    assert.equal(item.reviewStatus, "APPROVED_FOR_EVIDENCE_FOUNDATION");
    assert.equal(item.availabilitySemantics, "REPRESENTATIVE_ONLY_NOT_AVAILABILITY");
    assert(item.sources.length >= 2);
    assert.match(item.propertyVerification, /require current property investigation/);
  }
}

const buildingByPath = new Map(buildingRegistry.map((item) => [item.building_path, item]));
for (const item of foundation.candidates["anaheim-canyon"].representatives) {
  const building = buildingByPath.get(item.path);
  assert(building, `missing canonical building ${item.path}`);
  assert.equal(building.city, "Anaheim");
  assert.equal(building.primary_space_type, "industrial");
}
assert(!foundation.candidates["anaheim-canyon"].representatives.some((item) => item.id === "2671-la-palma-ave"));
assert(foundation.candidates["fullerton-industrial-service-area"].representatives.every((item) => item.kind === "COMMERCIAL_ENVIRONMENT"));

for (const model of ["industrial", "flex", "mixed"]) {
  assert.deepEqual(Object.keys(foundation.evidence[model]), foundation.evidenceCandidateIds);
  for (const candidateId of foundation.evidenceCandidateIds) {
    assert(foundation.evidence[model][candidateId].traits.length);
  }
}
assert.notDeepEqual(foundation.evidence.industrial["anaheim-canyon"].traits, foundation.evidence.flex["anaheim-canyon"].traits);
assert.notDeepEqual(foundation.evidence.industrial["fullerton-industrial-service-area"].traits, foundation.evidence.flex["fullerton-industrial-service-area"].traits);

const serialized = JSON.stringify(foundation);
for (const forbiddenCandidate of ["orange-county", "irvine-spectrum", "lake-forest-business-park", "brea", "buena-park"]) {
  assert(!foundation.evidenceCandidateIds.includes(forbiddenCandidate));
}
for (const unsupportedTrait of ["HIGH_LOADING", "HIGH_TRUCK_ACCESS", "CLEAR_HEIGHT", "POWER", "YARD", "TRAILER_ACCESS", "AIRPORT_ACCESS", "FREEWAY_ACCESS"]) {
  assert(!serialized.includes(`\"${unsupportedTrait}\"`), `${unsupportedTrait} must not be promoted as a reviewed trait`);
}
assert.equal(foundation.accessIntelligence.status, "INSUFFICIENT_FOR_RECOMMENDATION");
assert(foundation.futureEntryContext.accepted.every((item) => item.treatment === "COMPARISON_CONTEXT_ONLY"));
assert(foundation.futureEntryContext.rejectedMarketIds.includes("orange-county"));

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
assert.equal(packageJson.scripts["qa:north-orange-county-industrial-flex-evidence"], "node scripts/qa-north-orange-county-industrial-flex-evidence.js");

console.log("North Orange County Industrial/Flex evidence QA passed: two bounded candidates, four reviewed representatives, separate Industrial/Flex evidence, provenance, exclusions, and property/access boundaries verified.");
