const assert = require("node:assert/strict");
const coverage = require("../_data/sfOfficeMarketCoverage");
const accessFoundation = require("../_data/sfAccessFoundationV0");
const compositionFoundation = require("../_data/sfOfficeCompositionFoundation");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel");
const districtGeography = require("../_data/requirementPrototypeDistrictGeography");
const gate = require("../lib/recommendations/private-recommendation-readiness");

const dependencies = { accessFoundation, compositionFoundation, sfOfficeModel, districtGeography };
const criterion = (dimension, raw, status = "PREFERRED") => ({ id: dimension, dimension, status, value: { text: Array.isArray(raw) ? "" : String(raw), number: null, boolean: null, list: Array.isArray(raw) ? raw : [] } });
function requirement(id, { business = "Ordinary Office", origins = ["San Francisco"], clients = "Clients rarely or never visit", transit = "Public transit is helpful", parking = "Convenient parking is helpful", environment = "", candidates = [] } = {}) {
  const criteria = [
    criterion("universal.location.employee_origins", origins),
    criterion("office.access.client_visits", clients),
    criterion("universal.access.transit_importance", transit),
    criterion("universal.access.parking_importance", parking),
  ];
  if (environment) criteria.push(criterion("office.environment.image", environment));
  return { id, propertyTypes: ["office"], locationLogic: { marketAnchor: { marketId: "san-francisco", geographyId: "san-francisco", displayName: "San Francisco" }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates, informalText: "" } }, businessContext: { summary: business }, criteria };
}

const ids = coverage.decisionGeographies.map((item) => item.districtId);
assert.equal(new Set(ids).size, ids.length, "Coverage audit must not duplicate canonical decision identities.");
assert.equal(coverage.presentationGroups.length, 3);
assert.deepEqual(coverage.presentationGroups[0].memberDistrictIds, ["showplace-square", "design-district"]);
assert.deepEqual(coverage.presentationGroups[1].memberDistrictIds, ["mission-district", "mission"]);
assert.deepEqual(coverage.presentationGroups[2].memberDistrictIds, ["soma", "south-park"]);
assert.equal(coverage.decisionGeographies.find((item) => item.districtId === "showplace-square").knowledgeOwnerDistrictId, "showplace-square");
for (const item of coverage.decisionGeographies) {
  assert(Object.values(coverage.classification).includes(item.classification));
  Object.values(item.coverage).forEach((status) => assert(Object.values(coverage.status).includes(status)));
}
for (const id of ["financial-district", "soma", "mission-bay", "jackson-square", "south-beach"]) assert.equal(coverage.decisionGeographies.find((item) => item.districtId === id).classification, "CORE_OFFICE");
for (const id of ["showplace-square", "dogpatch", "potrero-hill", "mission-district", "presidio", "union-square", "civic-center", "hayes-valley", "marina-district"]) assert.equal(coverage.decisionGeographies.find((item) => item.districtId === id).classification, "SITUATIONAL_OFFICE");
for (const id of ["bayview-industrial", "central-waterfront", "richmond", "sunset", "bayview"]) assert.equal(coverage.decisionGeographies.find((item) => item.districtId === id).classification, "GENERALLY_NOT_OFFICE");
assert.equal(coverage.blockingGaps.length, 0);
for (const alias of coverage.compatibilityIdentities) assert(!coverage.decisionGeographies.some((item) => item.districtId === alias.districtId));

const dogpatch = accessFoundation.districtProfiles.find((item) => item.districtId === "dogpatch");
assert(dogpatch && dogpatch.reviewStatus === "APPROVED");
assert(dogpatch.gatewayRelationships.some((item) => item.gatewayId === "sf-gateway:caltrain" && item.rating === "GOOD"));
assert(dogpatch.gatewayRelationships.some((item) => item.gatewayId === "sf-gateway:i-280" && item.rating === "GOOD"));
assert(dogpatch.evidenceIds.every((id) => accessFoundation.evidence.some((item) => item.evidenceId === id && item.reviewStatus === "APPROVED")));
assert(!/requirement.*district|marin.*presidio|east bay.*financial district/i.test(accessFoundation.sourcePolicy));

const scenarios = {
  professionalEastBay: requirement("coverage-a", { business: "Accounting / professional services", origins: ["San Francisco", "East Bay"], clients: "Clients visit frequently", transit: "Public transit is very important", parking: "Parking is not important" }),
  professionalSfClients: requirement("coverage-b", { business: "Accounting / professional services", origins: ["San Francisco"], clients: "Clients visit frequently", transit: "Public transit is helpful", parking: "Convenient parking is helpful" }),
  architectureCreative: requirement("coverage-c", { business: "Architecture, Design & Creative Services", origins: ["San Francisco"], environment: "Modern and energetic" }),
  technologyPeninsula: requirement("coverage-d", { business: "Technology / product company", origins: ["Peninsula", "South Bay"], transit: "Public transit is very important", parking: "Convenient parking is helpful" }),
  marinParking: requirement("coverage-e", { origins: ["San Francisco", "Marin / North Bay"], transit: "Public transit is helpful", parking: "Convenient parking is very important" }),
  sfParkingLow: requirement("coverage-f", { origins: ["San Francisco"], transit: "Public transit is important", parking: "Parking is not important" }),
  mixedBayArea: requirement("coverage-g", { origins: ["Across the Bay Area / mixed"], transit: "Public transit is helpful", parking: "Convenient parking is helpful" }),
  candidateMissionBay: requirement("coverage-h", { business: "Architecture, Design & Creative Services", origins: ["Across the Bay Area / mixed"], environment: "Modern and energetic", candidates: ["mission-bay"] }),
  candidateFinancialDistrict: requirement("coverage-i", { business: "Accounting / professional services", origins: ["San Francisco", "East Bay"], clients: "Clients visit frequently", transit: "Public transit is very important", parking: "Parking is not important", candidates: ["financial-district"] }),
  smallConventional: requirement("coverage-j", { business: "Small conventional Office", origins: ["San Francisco"], transit: "Public transit is helpful", parking: "Convenient parking is helpful" }),
  unionSquareContext: requirement("coverage-k", { business: "Accounting / professional services", origins: ["San Francisco", "East Bay"], clients: "Clients visit frequently", transit: "Public transit is very important", parking: "Parking is not important", candidates: ["union-square"] }),
  hayesValleyContext: requirement("coverage-l", { business: "Architecture, Design & Creative Services", origins: ["San Francisco"], environment: "Modern and energetic", candidates: ["hayes-valley"] }),
  marinaContext: requirement("coverage-m", { business: "Small conventional Office", origins: ["San Francisco", "Marin / North Bay"], transit: "Public transit is helpful", parking: "Convenient parking is very important", candidates: ["marina-district"] }),
  civicCenterContext: requirement("coverage-n", { business: "Nonprofit / mission-driven", origins: ["San Francisco", "East Bay"], transit: "Public transit is very important", parking: "Parking is not important", candidates: ["civic-center"] }),
};
const results = Object.fromEntries(Object.entries(scenarios).map(([id, item]) => [id, gate.evaluateRecommendationReadiness(item, dependencies)]));
const missionBayBaseline = gate.evaluateRecommendationReadiness(requirement("coverage-h-baseline", { business: "Architecture, Design & Creative Services", origins: ["Across the Bay Area / mixed"], environment: "Modern and energetic" }), dependencies);
const signature = (result) => result.candidateComposition.rawConsidered.map((item) => [item.districtId, item.compositionBand, item.eligibilitySource, item.tieKey]);

assert(["FULL", "BOUNDED"].includes(results.professionalEastBay.readiness));
assert(["FULL", "BOUNDED"].includes(results.architectureCreative.readiness));
assert(results.architectureCreative.plausibleCandidateUniverse.some((item) => item.districtId === "showplace-square"));
assert(results.technologyPeninsula.plausibleCandidateUniverse.some((item) => item.districtId === "dogpatch"));
assert(["FULL", "BOUNDED"].includes(results.marinParking.readiness));
assert(results.marinParking.plausibleCandidateUniverse.some((item) => item.districtId === "presidio"));
assert(["FULL", "BOUNDED", "INVESTIGATE"].includes(results.mixedBayArea.readiness));
assert(["FULL", "BOUNDED", "INVESTIGATE"].includes(results.candidateMissionBay.readiness));
assert(results.candidateMissionBay.plausibleCandidateUniverse.some((item) => item.districtId === "mission-bay"));
assert.deepEqual(signature(results.candidateMissionBay), signature(missionBayBaseline), "Mission Bay candidate context must not alter scores, ordering, or eligibility.");
assert.equal(results.candidateFinancialDistrict.readiness, results.professionalEastBay.readiness);
assert.deepEqual(signature(results.candidateFinancialDistrict), signature(results.professionalEastBay), "Candidate selection must remain ranking-neutral.");
assert(results.mixedBayArea.candidateComposition.requirementAccessProfile.cohorts.filter((item) => item.actorType === "EMPLOYEE").length === 5, "Mixed Bay Area must preserve all canonical origin implications.");
const mixedTreatments = results.mixedBayArea.candidateComposition.considered.map((item) => item.accessComponent.treatment);
assert(mixedTreatments.some((item) => ["NO_DOMINANT_ACCESS_SOLUTION", "MIXED_REGIONAL_SCOPE_REVIEWED"].includes(item)), "Reviewed mixed-origin coverage must distinguish genuine tradeoffs from missing intelligence.");
for (const [id, expected] of [["unionSquareContext", "union-square"], ["hayesValleyContext", "hayes-valley"], ["marinaContext", "marina-district"], ["civicCenterContext", "civic-center"]]) {
  assert(results[id].plausibleCandidateUniverse.some((item) => item.districtId === expected), `${expected} must receive a fair evidence-backed evaluation.`);
}
const candidateNeutral = gate.evaluateRecommendationReadiness(requirement("coverage-k-neutral", { business: "Accounting / professional services", origins: ["San Francisco", "East Bay"], clients: "Clients visit frequently", transit: "Public transit is very important", parking: "Parking is not important" }), dependencies);
assert.deepEqual(signature(results.unionSquareContext), signature(candidateNeutral), "Situational candidate context must remain ranking-neutral.");

const medical = requirement("coverage-medical");
medical.propertyTypes = ["medical"];
const medicalResult = gate.evaluateRecommendationReadiness(medical, dependencies);
assert.equal(medicalResult.readiness, "INVESTIGATE");
assert.equal(medicalResult.shortlist.length, 0);

console.log("SF Office Market Coverage QA passed.");
for (const [id, result] of Object.entries(results)) {
  console.log(`${id}: ${result.readiness}; universe=${result.plausibleCandidateUniverse.map((item) => item.districtId).join(",")}; shortlist=${result.shortlist.map((item) => item.districtId).join(",")}; blocked=${result.blockedByIntelligenceGap.map((item) => item.districtId).join(",")}`);
}

module.exports = { scenarios, results };
