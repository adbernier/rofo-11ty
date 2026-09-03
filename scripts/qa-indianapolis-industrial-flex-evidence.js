const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const foundation = require("../_data/indianapolisIndustrialFlexEvidenceFoundation");
const buildingRegistry = require("../data-sources/reference/company-buildings.json");

assert.equal(foundation.scope, "EVIDENCE_ONLY_NO_RESOLVER_OR_ACTIVATION");
assert.equal(foundation.recommendationBoundary, "CITY_OF_INDIANAPOLIS_TWO_PEER_ONLY");
assert.deepEqual(foundation.evidenceCandidateIds, ["indianapolis-airport-logistics", "park-100-northwest-indianapolis"]);
assert.equal(Object.keys(foundation.candidates).length, 2);
assert.equal(foundation.representativeCount, 4);

for (const candidate of Object.values(foundation.candidates)) {
  assert.equal(candidate.municipality, "Indianapolis");
  assert.equal(candidate.state, "IN");
  assert.equal(candidate.publicOwnerId, "indianapolis");
  assert.equal(candidate.confidence, "REVIEWED");
  assert.equal(candidate.reviewStatus, "CERTIFIED_RECOMMENDATION_EVIDENCE");
  assert(candidate.provenance.length >= 3);
  for (const item of candidate.representatives) {
    assert.equal(item.ownerGeographyId, candidate.geographyId);
    assert.equal(item.reviewStatus, "APPROVED_FOR_EVIDENCE_FOUNDATION");
    assert.equal(item.availabilitySemantics, "REPRESENTATIVE_ONLY_NOT_AVAILABILITY");
    assert(item.sources.length >= 3);
    assert.match(item.propertyVerification, /require current property investigation/);
  }
}

const buildingByPath = new Map(buildingRegistry.map((item) => [item.building_path, item]));
for (const candidate of Object.values(foundation.candidates)) {
  for (const item of candidate.representatives.filter((entry) => entry.kind === "BUILDING")) {
    const building = buildingByPath.get(item.path);
    assert(building, `missing canonical building ${item.path}`);
    assert.equal(building.city, "Indianapolis");
    assert.equal(building.primary_space_type, "industrial");
  }
}

assert.deepEqual(foundation.ownershipReconciliation.retainedAirportRepresentativeIds, ["4557-w-bradbury-ave", "park-fletcher-stout-field-industrial-environment"]);
assert.deepEqual(foundation.ownershipReconciliation.reassignedToPark100, ["7601-winton-dr"]);
assert(foundation.ownershipReconciliation.rejectedFromCityUniverse.some((item) => item.id === "558-airtech-parkway" && /Plainfield/.test(item.reason)));
assert(!foundation.candidates["indianapolis-airport-logistics"].representatives.some((item) => item.id === "558-airtech-parkway" || item.id === "7601-winton-dr"));
assert(foundation.candidates["park-100-northwest-indianapolis"].representatives.some((item) => item.id === "7601-winton-dr"));

for (const model of ["industrial", "flex", "mixed"]) {
  assert.deepEqual(Object.keys(foundation.evidence[model]), foundation.evidenceCandidateIds);
  for (const candidateId of foundation.evidenceCandidateIds) assert(foundation.evidence[model][candidateId].traits.length);
}
assert.notDeepEqual(foundation.evidence.flex["indianapolis-airport-logistics"].traits, foundation.evidence.flex["park-100-northwest-indianapolis"].traits);
assert(foundation.requirementSignalCompatibility.airportLogisticsLeading.includes("receiving_distribution"));
assert(foundation.requirementSignalCompatibility.park100Leading.includes("contractor_service"));
assert(foundation.requirementSignalCompatibility.park100Leading.includes("smaller_format_flex"));

assert.equal(foundation.historicalBuildingAudit.explicitPark100EntityRecords, 10);
assert.equal(foundation.historicalBuildingAudit.explicitPark100UniqueAddresses, 7);
assert.equal(foundation.historicalBuildingAudit.explicitPark100HistoricalListingEvidenceCount, 29);
assert.match(foundation.historicalBuildingAudit.limitation, /discovery-only/);

const serialized = JSON.stringify(foundation);
for (const forbidden of ["HIGH_LOADING", "CLEAR_HEIGHT", "POWER", "YARD", "TRAILER_PARKING", "AIRPORT_ACCESS", "FREEWAY_ACCESS", "CURRENT_AVAILABILITY"]) {
  assert(!serialized.includes(`\"${forbidden}\"`), `${forbidden} must not become a reviewed trait`);
}
assert.equal(foundation.accessIntelligence.status, "INSUFFICIENT_FOR_RECOMMENDATION");
assert(foundation.futureEntryContext.accepted.every((item) => item.treatment === "COMPARISON_CONTEXT_ONLY"));
for (const excluded of ["plainfield", "whitestown", "lebanon", "brownsburg", "greenwood", "carmel", "fishers"]) assert(foundation.futureEntryContext.rejectedMarketIds.includes(excluded));
assert(!foundation.evidenceCandidateIds.includes("plainfield"));
assert(!foundation.recommendationBoundary.includes("METRO"));

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
assert.equal(packageJson.scripts["qa:indianapolis-industrial-flex-evidence"], "node scripts/qa-indianapolis-industrial-flex-evidence.js");

console.log("Indianapolis Industrial/Flex evidence QA passed: two City-owned candidates, four reviewed representatives, historical ownership reconciliation, separate Industrial/Flex evidence, and access/property boundaries verified.");
