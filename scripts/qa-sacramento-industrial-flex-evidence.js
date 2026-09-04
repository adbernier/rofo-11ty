const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const foundation = require("../_data/sacramentoIndustrialFlexEvidenceFoundation");
const buildingRegistry = require("../data-sources/reference/company-buildings.json");

assert.equal(foundation.scope, "EVIDENCE_ONLY_NO_RESOLVER_OR_ACTIVATION");
assert.equal(foundation.evidenceDecision, "EVIDENCE_READY_IMPLEMENT_SMALLER_UNIVERSE");
assert.equal(foundation.recommendationBoundary, "CITY_OF_SACRAMENTO_TWO_PEER_ONLY");
assert.deepEqual(foundation.evidenceCandidateIds, ["power-inn-industrial", "northgate-north-market-industrial"]);
assert.equal(Object.keys(foundation.candidates).length, 2);
assert.equal(foundation.representativeCount, 4);

for (const candidate of Object.values(foundation.candidates)) {
  assert.equal(candidate.municipality, "Sacramento");
  assert.equal(candidate.state, "CA");
  assert.equal(candidate.parentMarketId, "sacramento");
  assert.equal(candidate.publicOwnerId, "sacramento");
  assert.equal(candidate.confidence, "REVIEWED");
  assert.equal(candidate.reviewStatus, "CERTIFIED_RECOMMENDATION_EVIDENCE");
  assert(candidate.provenance.length >= 4);
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
    assert.equal(building.city, "Sacramento");
    assert.equal(building.primary_space_type, "industrial");
  }
}
for (const item of Object.values(foundation.candidates).flatMap((candidate) => candidate.representatives).filter((entry) => entry.kind === "COMMERCIAL_ENVIRONMENT")) assert.equal(item.path, null);

assert.deepEqual(foundation.geographyReconciliation.surviving, foundation.evidenceCandidateIds);
assert(foundation.geographyReconciliation.componentOnly.some((item) => item.id === "sci-ramona" && item.parent === "power-inn-industrial"));
assert(!foundation.evidenceCandidateIds.some((id) => /sci|ramona|natomas|metro/.test(id)));
for (const excluded of ["West Sacramento", "Rancho Cordova"]) assert(foundation.ownershipReconciliation.rejectedFromCityUniverse.some((item) => item.municipality === excluded));
for (const excluded of ["west-sacramento", "rancho-cordova", "elk-grove", "roseville", "rocklin", "folsom", "citrus-heights"]) assert(foundation.futureEntryContext.rejectedMarketIds.includes(excluded));

for (const model of ["industrial", "flex", "mixed"]) {
  assert.deepEqual(Object.keys(foundation.evidence[model]), foundation.evidenceCandidateIds);
  for (const candidateId of foundation.evidenceCandidateIds) assert(foundation.evidence[model][candidateId].traits.length);
}
assert.notDeepEqual(foundation.evidence.industrial["power-inn-industrial"].traits, foundation.evidence.industrial["northgate-north-market-industrial"].traits);
assert.notDeepEqual(foundation.evidence.flex["power-inn-industrial"].traits, foundation.evidence.flex["northgate-north-market-industrial"].traits);
assert(foundation.requirementSignalCompatibility.powerInnLeading.includes("manufacturing_assembly"));
assert(foundation.requirementSignalCompatibility.northgateNorthMarketLeading.includes("contractor_service"));
assert(foundation.requirementSignalCompatibility.overlapping.includes("warehouse_storage"));

assert.equal(foundation.accessIntelligence.status, "INSUFFICIENT_FOR_RECOMMENDATION");
assert(foundation.futureEntryContext.accepted.every((item) => item.treatment === "COMPARISON_CONTEXT_ONLY"));
assert(!foundation.recommendationBoundary.includes("METRO"));
assert.equal(foundation.historicalPropertyAudit.sacramentoSemanticPropertyRecords, 1635);
assert.equal(foundation.historicalPropertyAudit.sacramentoUniqueNormalizedAddresses, 1346);
assert.equal(foundation.historicalPropertyAudit.powerInnDiscoveryRecords, 62);
assert.equal(foundation.historicalPropertyAudit.northgateNorthMarketDiscoveryRecords, 44);
assert.equal(foundation.historicalPropertyAudit.ramonaDiscoveryRecords, 5);
assert.match(foundation.historicalPropertyAudit.limitation, /discovery-only/);

const serialized = JSON.stringify(foundation);
for (const forbidden of ["HIGH_LOADING", "CLEAR_HEIGHT", "POWER", "YARD", "TRAILER_PARKING", "FREEWAY_ACCESS", "AIRPORT_ACCESS", "CURRENT_AVAILABILITY"]) assert(!serialized.includes(`\"${forbidden}\"`), `${forbidden} must not become a reviewed trait`);
for (const excludedRepresentative of ["3100-ramco-st", "2928-ramco-st", "3380-industrial-blvd", "11201-sun-center-dr", "11353-pyrites-way"]) {
  assert(!Object.values(foundation.candidates).flatMap((candidate) => candidate.representatives).some((item) => item.id === excludedRepresentative));
}

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
assert.equal(packageJson.scripts["qa:sacramento-industrial-flex-evidence"], "node scripts/qa-sacramento-industrial-flex-evidence.js");

console.log("Sacramento Industrial/Flex evidence QA passed: smaller two-peer City universe, four reviewed representatives, SCI/Ramona component boundary, municipal exclusions, and separate Industrial/Flex evidence verified.");
