const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const schema = require("../lib/access/access-intelligence-schema");
const foundation = require("../_data/sfAccessFoundationV0");
const geography = require("../_data/commercialGeography");
const graph = require("../_data/locationKnowledgeGraph");
const { createAccessShadowComparison } = require("../lib/access/access-shadow-evaluator");

function criterion(dimension, raw, status = "PREFERRED") {
  return { id: dimension, dimension, status, value: { text: Array.isArray(raw) ? "" : String(raw), number: null, boolean: null, list: Array.isArray(raw) ? raw : [] } };
}
function requirement(criteria, preference = {}) {
  return {
    id: "access-calibration",
    propertyTypes: ["office"],
    locationLogic: {
      marketAnchor: { marketId: "san-francisco", geographyId: "san-francisco", displayName: "San Francisco, CA" },
      specificPreference: { candidateDistrictIds: [], candidateDistrictNames: [], informalText: "", ...preference },
    },
    businessContext: { summary: "SF Office Access calibration" },
    criteria,
  };
}

const scenarios = {
  A: requirement([
    criterion("universal.location.employee_origins", ["San Francisco", "East Bay"]),
    criterion("universal.access.transit_importance", "Public transit is very important", "REQUIRED"),
    criterion("universal.access.parking_importance", "Parking is not important", "FLEXIBLE"),
    criterion("universal.location.customer_origins", ["San Francisco"]),
    criterion("office.access.client_visits", "Clients visit occasionally"),
  ]),
  B: requirement([
    criterion("universal.location.employee_origins", ["Marin / North Bay", "San Francisco"]),
    criterion("universal.access.transit_importance", "Public transit is not important", "FLEXIBLE"),
    criterion("universal.access.parking_importance", "Convenient parking is very important", "REQUIRED"),
    criterion("universal.location.customer_origins", ["San Francisco"]),
    criterion("office.access.client_visits", "Clients rarely or never visit", "FLEXIBLE"),
  ]),
  C: requirement([
    criterion("universal.location.employee_origins", ["San Francisco", "East Bay", "Marin / North Bay"]),
    criterion("universal.location.customer_origins", ["San Francisco", "Peninsula"]),
    criterion("office.access.client_visits", "Clients visit frequently", "REQUIRED"),
    criterion("universal.access.transit_importance", "Public transit is very important", "REQUIRED"),
    criterion("universal.access.parking_importance", "Convenient parking is helpful"),
  ]),
  D: requirement([
    criterion("universal.location.employee_origins", ["San Francisco", "Peninsula", "South Bay"]),
    criterion("universal.location.customer_origins", ["Peninsula", "South Bay"]),
    criterion("office.access.client_visits", "Clients visit frequently", "REQUIRED"),
    criterion("universal.access.transit_importance", "Public transit is very important", "REQUIRED"),
    criterion("universal.access.parking_importance", "Parking is not important", "FLEXIBLE"),
  ]),
};
scenarios.E = requirement(scenarios.A.criteria, { candidateDistrictIds: ["soma", "south-beach"], candidateDistrictNames: ["SoMa", "South Beach"] });
scenarios.F = requirement([
  criterion("universal.location.employee_origins", ["Marin / North Bay"]),
  criterion("universal.access.transit_importance", "Public transit is not important", "FLEXIBLE"),
  criterion("universal.access.parking_importance", "Convenient parking is very important", "REQUIRED"),
  criterion("office.access.client_visits", "Clients rarely or never visit", "FLEXIBLE"),
]);
scenarios.G = requirement([
  criterion("universal.location.employee_origins", ["East Bay"]),
  criterion("universal.access.transit_importance", "Public transit is not important", "FLEXIBLE"),
  criterion("universal.access.parking_importance", "Convenient parking is very important", "REQUIRED"),
]);
scenarios.H = requirement([
  criterion("universal.location.employee_origins", ["South Bay"]),
  criterion("universal.access.transit_importance", "Public transit is not important", "FLEXIBLE"),
  criterion("universal.access.parking_importance", "Convenient parking is very important", "REQUIRED"),
]);

const results = Object.fromEntries(Object.entries(scenarios).map(([id, item]) => [id, createAccessShadowComparison(item, foundation)]));

// Schema and canonical identity.
const foundationErrors = schema.validateFoundation(foundation, { marketIds: new Set(geography.markets.map((item) => item.marketId)), districtIds: new Set(graph.filter((item) => item.type === "district").map((item) => item.slug)) });
assert.deepEqual(foundationErrors, [], foundationErrors.join("\n"));
assert.equal(new Set(foundation.originRegions.map((item) => item.originRegionId)).size, foundation.originRegions.length);
assert.equal(new Set(foundation.gateways.map((item) => item.gatewayId)).size, foundation.gateways.length);
assert(Object.values(foundation.completeness).every((item) => schema.COMPLETENESS_STATES.includes(item)));

// Evidence boundaries.
const evidenceById = new Map(foundation.evidence.map((item) => [item.evidenceId, item]));
foundation.gateways.flatMap((item) => [...item.originRelationships, ...item.districtRelationships]).filter((item) => item.reviewStatus === "APPROVED").forEach((item) => item.evidenceIds.forEach((id) => assert.equal(evidenceById.get(id).reviewStatus, "APPROVED", `Approved relationship must cite approved evidence: ${id}`)));
results.A.access.districtResults.forEach((item) => item.explanationTrace.forEach((trace) => trace.evidenceIds.forEach((id) => assert.equal(evidenceById.get(id).reviewStatus, "APPROVED", `Runtime trace cited non-approved evidence: ${id}`))));
assert(!Object.values(results).flatMap((result) => result.access.districtResults).some((item) => item.evidenceIds.includes("sf-access-evidence:bridge-ferry-hypothesis") || item.evidenceIds.includes("sf-access-evidence:peninsula-road-hypothesis")), "Candidate evidence must remain inert after reviewed enrichment.");

// Requirement projection.
assert.deepEqual(results.C.requirementAccessProfile.cohorts.filter((item) => item.actorType === "EMPLOYEE").map((item) => item.originRegionId), ["sf-origin:san-francisco", "sf-origin:east-bay", "sf-origin:north-bay"]);
assert(results.C.requirementAccessProfile.cohorts.filter((item) => item.actorType === "EMPLOYEE").every((item) => item.importance === "MATERIAL"), "Multiple employee origins must default equally to MATERIAL.");
assert(results.B.requirementAccessProfile.cohorts.filter((item) => item.actorType === "CLIENT_CUSTOMER").every((item) => item.frequency === "RARE" && item.importance === "LOW"), "Rare clients must become context only.");
assert(results.C.requirementAccessProfile.cohorts.some((item) => item.actorType === "CLIENT_CUSTOMER") && !results.C.requirementAccessProfile.cohorts.some((item) => item.actorType === "SERVICE_TERRITORY"), "Actor families must remain separate.");

// Fit behavior.
const aFinancial = results.A.access.districtResults.find((item) => item.districtId === "financial-district");
assert(aFinancial.employeeCohortResults.find((item) => item.originRegionId === "sf-origin:east-bay").selectedGatewayId === "sf-gateway:bart", "East Bay transit must require and select an approved BART path.");
const bPresidio = results.B.access.districtResults.find((item) => item.districtId === "presidio");
assert.equal(bPresidio.employeeCohortResults.find((item) => item.originRegionId === "sf-origin:north-bay").selectedGatewayId, "sf-gateway:golden-gate-bridge", "Marin driving must resolve through the reviewed northern gateway.");
assert.equal(bPresidio.employeeCohortResults.find((item) => item.originRegionId === "sf-origin:north-bay").rating, "STRONG");
results.B.access.districtResults.flatMap((item) => item.modeResults).forEach((mode) => assert(Math.abs(mode.parkingAdjustment || 0) <= 1, "Parking adjustment exceeded one ordinal band."));
const bFinancial = results.B.access.districtResults.find((item) => item.districtId === "financial-district");
assert.equal(bFinancial.employeeCohortResults.find((cohort) => cohort.originRegionId === "sf-origin:north-bay").rating, "UNKNOWN", "Parking must not create North Bay driving access where no reviewed gateway path exists.");
assert(results.B.access.districtResults.some((item) => item.confidence === "MEDIUM" || item.confidence === "LOW" || item.confidence === "UNKNOWN"), "Unknown material evidence must lower confidence.");
assert(results.A.access.districtResults.every((item) => item.validationErrors.length === 0));

// Candidate districts remain comparison context only.
const accessSignature = (result) => result.access.districtResults.map((item) => [item.districtId, item.overall, item.confidence, item.accessEligibility.accessActivated]);
assert.deepEqual(accessSignature(results.E), accessSignature(results.A));
assert.equal(results.E.requirementAccessProfile.candidateDistricts.treatment, "COMPARISON_CONTEXT_ONLY");
assert.deepEqual(results.E.productionTopThree, results.A.productionTopThree, "Candidate preferences must not change current production ranking.");

// Generic activation: Mission District qualifies through canonical evidence, not scenario-specific code.
assert(results.A.accessActivatedDistricts.includes("mission-district"), "Mission District should access-activate through its approved East Bay→BART→district path.");
const engineSource = fs.readFileSync("lib/access/access-fit-evaluator.js", "utf8");
["financial-district", "mission-district", "soma", "south-beach", "east-bay", "north-bay"].forEach((token) => assert(!engineSource.includes(token), `Access engine contains forbidden market-specific routing token: ${token}`));
const presidioNodes = graph.filter((item) => item.slug === "presidio");
assert.equal(presidioNodes.length, 1, "Presidio must reconcile to one canonical Knowledge Graph identity.");
assert.equal(presidioNodes[0].operationalMarketId, "san-francisco");
assert.equal(presidioNodes[0].recommendationEligible, false, "Presidio must remain outside production recommendation eligibility.");
assert.equal(presidioNodes[0].shadowRecommendationEligible, true);
assert.equal(presidioNodes[0].path, "/commercial-real-estate/CA/san-francisco/presidio/", "Presidio must reuse the existing public route.");
assert.equal(bPresidio.accessEligibility.accessActivated, true, "Presidio should activate generically from material reviewed North Bay access.");
assert(bPresidio.explanationTrace.some((trace) => trace.evidenceIds.includes("sf-access-evidence:golden-gate-structural") && trace.evidenceIds.includes("sf-access-evidence:presidio-access")), "Presidio activation must trace to reviewed gateway and district evidence.");
assert(!results.A.access.districtResults.find((item) => item.districtId === "presidio").accessEligibility.accessActivated, "Presidio must not activate without a differentiating external access relationship.");

// Reviewed driving gateways remain distinct and deterministic.
const approvedGateway = (id) => foundation.gateways.find((item) => item.gatewayId === id);
["sf-gateway:golden-gate-bridge", "sf-gateway:ferry", "sf-gateway:bay-bridge", "sf-gateway:us-101", "sf-gateway:i-280"].forEach((id) => assert.equal(approvedGateway(id).reviewStatus, "APPROVED", `${id} must be reviewed after enrichment.`));
assert.equal(results.G.access.districtResults.find((item) => item.districtId === "soma").employeeCohortResults[0].selectedGatewayId, "sf-gateway:bay-bridge");
assert(["sf-gateway:us-101", "sf-gateway:i-280"].includes(results.H.access.districtResults.find((item) => item.districtId === "mission-bay").employeeCohortResults[0].selectedGatewayId));
assert.equal(results.F.access.districtResults.find((item) => item.districtId === "financial-district").overall, "UNKNOWN", "Ferry evidence must not be substituted for a transit-light driving cohort.");

// Duplicate gateways cannot double-count because evaluation selects a bounded best path.
const duplicateFoundation = JSON.parse(JSON.stringify(foundation));
const bartCopy = JSON.parse(JSON.stringify(duplicateFoundation.gateways.find((item) => item.gatewayId === "sf-gateway:bart")));
bartCopy.gatewayId = "sf-gateway:bart-duplicate-test";
duplicateFoundation.gateways.push(bartCopy);
duplicateFoundation.districtProfiles.forEach((district) => {
  const source = district.gatewayRelationships.find((item) => item.gatewayId === "sf-gateway:bart");
  if (source) district.gatewayRelationships.push({ ...source, gatewayId: bartCopy.gatewayId });
  const origin = district.originAccess.find((item) => item.originRegionId === "sf-origin:east-bay");
  const path = origin && origin.paths.find((item) => item.gatewayId === "sf-gateway:bart");
  if (path) origin.paths.push({ ...path, gatewayId: bartCopy.gatewayId });
});
const duplicateResult = createAccessShadowComparison(scenarios.A, duplicateFoundation);
assert.deepEqual(accessSignature(duplicateResult), accessSignature(results.A), "Duplicate gateway must not add another vote.");

// General schema, different market topologies, no schema changes.
function generalizationFixture({ marketId, topology, originRegionId, regionType, gatewayId, gatewayType, districtId }) {
  const complete = { originRegions: "SUFFICIENT", gateways: "SUFFICIENT", districtGeometry: "PARTIAL", originAccess: "PARTIAL", transit: "PARTIAL", driving: "SUFFICIENT", parking: "PARTIAL", ferry: "MISSING", explanations: "PARTIAL" };
  const evidenceId = `${marketId}-access-evidence:fixture`;
  return {
    schemaVersion: "access-market-foundation:v0", foundationId: `access-foundation:${marketId}:fixture`, marketId, topology, foundationLevel: "GEOGRAPHIC", reviewStatus: "CANDIDATE", confidence: "LOW", completeness: complete,
    originRegions: [{ originRegionId, marketId, label: originRegionId, regionType, canonicalGeographyRefs: [], gatewayRelationshipIds: [gatewayId], confidence: "LOW", reviewStatus: "CANDIDATE", limitations: [] }],
    gateways: [{ gatewayId, marketId, label: gatewayId, gatewayType, modes: ["DRIVING"], confidence: "LOW", reviewStatus: "CANDIDATE", originRelationships: [{ originRegionId, rating: "GOOD", confidence: "LOW", reviewStatus: "CANDIDATE", evidenceIds: [evidenceId] }], districtRelationships: [{ districtId, rating: "GOOD", confidence: "LOW", reviewStatus: "CANDIDATE", evidenceIds: [evidenceId] }] }],
    evidence: [{ evidenceId, claimType: "SCHEMA_FIXTURE", claim: "Schema-only generalization fixture.", source: { sourceType: "REPOSITORY", reference: "scripts/qa-sf-access-foundation-v0.js" }, confidence: "LOW", reviewStatus: "CANDIDATE", limitations: ["Not market foundation data."] }],
    districtProfiles: [{ profileId: `${marketId}-profile:${districtId}`, marketId, districtId, districtName: districtId, propertyTypeFit: "strong", recommendationEligible: true, startingDistrict: true, accessActivationEligible: false, parkingEnvironment: "UNKNOWN", gatewayRelationships: [{ gatewayId, rating: "GOOD", reviewStatus: "CANDIDATE", confidence: "LOW", evidenceIds: [evidenceId] }], originAccess: [], completeness: complete, confidence: "LOW", reviewStatus: "CANDIDATE", evidenceIds: [evidenceId], importantUnknowns: [], limitations: [] }],
  };
}
const denver = generalizationFixture({ marketId: "denver", topology: "RADIAL_METRO", originRegionId: "denver-origin:southeast-metro", regionType: "METRO_SECTOR", gatewayId: "denver-gateway:i-25", gatewayType: "INTERSTATE", districtId: "denver-tech-center" });
const orangeCounty = generalizationFixture({ marketId: "orange-county", topology: "POLYCENTRIC", originRegionId: "oc-origin:irvine-airport-cluster", regionType: "CITY_CLUSTER", gatewayId: "oc-gateway:i-405", gatewayType: "FREEWAY", districtId: "irvine-business-complex" });
assert.deepEqual(schema.validateFoundation(denver, { marketIds: new Set(geography.markets.map((item) => item.marketId)), districtIds: new Set(graph.filter((item) => item.type === "district").map((item) => item.slug)) }), []);
assert.deepEqual(schema.validateFoundation(orangeCounty, { marketIds: new Set(geography.markets.map((item) => item.marketId)), districtIds: new Set(graph.filter((item) => item.type === "district").map((item) => item.slug)) }), []);

// Production files and outputs remain unchanged.
const hashes = {
  "_data/sfOfficeRecommendationModel.js": "e76839ebf3e5be19bcffc412cc1bdd3f8dbd32977b07d1bf2a14dcaa354a1e81",
  "lib/recommendations/sf-office-recommendation-resolver.js": "6f0f4e968915a78beeba5d473bf315723ea073beff8208ac9e7925ea235b4dde",
  "lib/recommendations/normalize-sf-office-profile.js": "6116531e6296d573f3a2dd728cf677b9f9a54ac9fd64753ef3a6609549cc3f95",
};
Object.entries(hashes).forEach(([file, expected]) => assert.equal(crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"), expected, `${file} changed during shadow sprint.`));
assert(!fs.readFileSync("_data/sfOfficeRecommendationModel.js", "utf8").includes("presidio"), "Presidio must not enter the production SF Office model.");
const page = fs.readFileSync("pages/prototype/requirement-v1.njk", "utf8");
assert.match(page, /robots: noindex,nofollow/);
assert(!/fetch\s*\(/.test(fs.readFileSync("lib/access/access-shadow-evaluator.js", "utf8")), "Shadow evaluator must not write or call production APIs.");

console.log("SF Access Foundation v0 QA passed.");
for (const [id, result] of Object.entries(results)) {
  console.log(`${id}: production=${result.productionTopThree.join(",")} input=${JSON.stringify(result.productionInputs)}`);
  console.log(`   shadow=${result.access.districtResults.map((item) => `${item.districtId}:${item.overall}/${item.confidence}${item.accessEligibility.accessActivated ? "*" : ""}`).join(",")}`);
  if (result.access.foundationGaps.length) console.log(`   gaps=${result.access.foundationGaps.map((item) => item.id).join(",")}`);
}

module.exports = { scenarios, results };
