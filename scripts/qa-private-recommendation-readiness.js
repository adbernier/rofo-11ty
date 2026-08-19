const assert = require("node:assert/strict");
const gate = require("../lib/recommendations/private-recommendation-readiness");
const accessFoundation = require("../_data/sfAccessFoundationV0");
const compositionFoundation = require("../_data/sfOfficeCompositionFoundation");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel");
const districtGeography = require("../_data/requirementPrototypeDistrictGeography");

const dependencies = { accessFoundation, compositionFoundation, sfOfficeModel, districtGeography };
const criterion = (dimension, raw, status = "PREFERRED") => ({ dimension, status, value: { text: Array.isArray(raw) ? "" : String(raw), number: null, boolean: null, list: Array.isArray(raw) ? raw : [] } });
function requirement(id, business, origins, clients, transit, parking, propertyType = "office", market = "san-francisco", candidateDistrictIds = []) {
  return { id, propertyTypes: [propertyType], locationLogic: { marketAnchor: { marketId: market, geographyId: market, displayName: market }, specificPreference: { candidateDistrictIds, candidateDistrictNames: candidateDistrictIds, informalText: "" } }, businessContext: { summary: business }, criteria: [criterion("universal.location.employee_origins", origins), criterion("office.access.client_visits", clients), criterion("universal.access.transit_importance", transit), criterion("universal.access.parking_importance", parking)] };
}

const fixtures = {
  conventional: requirement("readiness-conventional", "Accounting / professional services", ["San Francisco", "East Bay"], "Clients visit frequently", "Public transit is very important", "Convenient parking is helpful"),
  marin: requirement("readiness-marin", "Ordinary Office", ["San Francisco", "Marin / North Bay"], "Clients rarely or never visit", "Public transit is helpful", "Convenient parking is very important"),
  architecture: requirement("readiness-architecture", "Architecture / design firm", ["San Francisco"], "Clients rarely or never visit", "Public transit is helpful", "Convenient parking is helpful"),
  medical: requirement("readiness-medical", "medical private practice", ["Marin / North Bay"], "Patients visit regularly", "Public transit is not important", "Convenient parking is very important", "medical"),
  unsupported: requirement("readiness-unsupported", "Accounting firm", ["Local"], "Clients visit regularly", "Public transit is helpful", "Convenient parking is helpful", "office", "fort-wayne"),
};
const results = Object.fromEntries(Object.entries(fixtures).map(([id, value]) => [id, gate.evaluateRecommendationReadiness(value, dependencies)]));

assert.equal(results.conventional.readiness, gate.READINESS.FULL);
assert.equal(results.conventional.candidateComposition.shortlistDeferred, true, "Plausible-universe evaluation must precede shortlist materialization.");
assert.deepEqual(results.conventional.candidateComposition.shortlist, []);
assert(results.conventional.evaluated.length >= 3);
assert.equal(results.conventional.blockedByIntelligenceGap.length, 0);
assert.equal(results.marin.readiness, gate.READINESS.BOUNDED);
assert(results.marin.plausibleCandidateUniverse.some((item) => item.districtId === "presidio"));
assert(results.marin.blockedByIntelligenceGap.length > 0);
assert(results.marin.shortlist.length > 0);
assert(results.marin.shortlist.every((item) => !results.marin.blockedByIntelligenceGap.some((blocked) => blocked.districtId === item.districtId)), "A blocked district must not survive into a BOUNDED shortlist.");
assert.equal(results.architecture.readiness, gate.READINESS.FULL);
for (const id of ["showplace-square", "potrero-hill"]) assert(results.architecture.plausibleCandidateUniverse.some((item) => item.districtId === id));
assert.equal(results.medical.readiness, gate.READINESS.INVESTIGATE);
assert.equal(results.medical.shortlist.length, 0);
assert.equal(results.medical.productResponse.showShortlist, false);
assert(results.medical.blockedByIntelligenceGap.length > 0);
assert(results.medical.plausibleCandidateUniverse.every((item) => item.dimensions.propertyTypeFit.status === "UNKNOWN"));
assert(results.medical.plausibleCandidateUniverse.every((item) => item.dimensions.businessEnvironment.status === "NOT_APPLICABLE"));
assert.equal(results.unsupported.readiness, gate.READINESS.INVESTIGATE);
assert.equal(results.unsupported.shortlist.length, 0);

for (const result of Object.values(results)) {
  assert.equal(result.diagnostics.rule.includes("percentage"), true);
  assert.equal(result.plausibleCandidateUniverse.length, result.evaluated.length + result.partiallyEvaluated.length + result.blockedByIntelligenceGap.length + result.ineligible.length);
  result.intelligenceGaps.forEach((gap) => ["market", "propertyType", "district", "intelligenceDimension", "requirementSignal", "materiality", "blockStatus", "reason", "observedAt"].forEach((field) => assert(Object.hasOwn(gap, field), `Gap missing ${field}`)));
}

const requested = requirement("candidate-neutrality", "Accounting / professional services", ["San Francisco", "East Bay"], "Clients visit frequently", "Public transit is very important", "Convenient parking is helpful", "office", "san-francisco", ["potrero-hill"]);
const requestedResult = gate.evaluateRecommendationReadiness(requested, dependencies);
assert.equal(requestedResult.composition.considered.find((item) => item.districtId === "potrero-hill").candidatePreference, true);
assert.equal(requestedResult.composition.rawConsidered.find((item) => item.districtId === "potrero-hill").eligibilitySource, "NOT_ELIGIBLE", "Candidate preference must not create recommendation eligibility.");

console.log("Private Recommendation Readiness QA passed.");
for (const [id, result] of Object.entries(results)) console.log(`${id}: ${result.readiness}; plausible=${result.diagnostics.counts.plausible}; evaluated=${result.diagnostics.counts.evaluated}; partial=${result.diagnostics.counts.partial}; blocked=${result.diagnostics.counts.blocked}; ineligible=${result.diagnostics.counts.ineligible}`);

module.exports = { fixtures, results };
