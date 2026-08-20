const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const schema = require("../lib/access/access-intelligence-schema");
const foundation = require("../_data/sfAccessFoundationV0");
const graph = require("../_data/locationKnowledgeGraph");
const geography = require("../_data/commercialGeography");
const compositionFoundation = require("../_data/sfOfficeCompositionFoundation");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel");
const composer = require("../lib/recommendations/private-location-composition");

const TARGETS = ["design-district", "showplace-square", "potrero-hill"];

function criterion(dimension, raw, status = "PREFERRED") {
  return { id: dimension, dimension, status, value: { text: Array.isArray(raw) ? "" : String(raw), number: null, boolean: null, list: Array.isArray(raw) ? raw : [] } };
}
function requirement(id, business, environment = "", candidates = []) {
  const criteria = [
    criterion("universal.location.employee_origins", ["San Francisco"]),
    criterion("office.access.client_visits", "Clients rarely or never visit", "FLEXIBLE"),
    criterion("universal.access.transit_importance", "Public transit is helpful"),
    criterion("universal.access.parking_importance", "Convenient parking is helpful"),
    criterion("office.occupancy.peak_attendance", "35"),
  ];
  if (environment) criteria.push(criterion("office.environment.image", environment));
  return {
    id, propertyTypes: ["office"], businessContext: { summary: `${business}. Ordinary Office use.` }, criteria,
    locationLogic: { marketAnchor: { marketId: "san-francisco", geographyId: "san-francisco", displayName: "San Francisco, CA" }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates, informalText: "" } },
  };
}

// Canonical identity and overlap are explicit; no duplicate canonical IDs or gateways are created.
assert.deepEqual(schema.validateFoundation(foundation, { marketIds: new Set(geography.markets.map((item) => item.marketId)), districtIds: new Set(graph.filter((item) => item.type === "district").map((item) => item.slug)) }), []);
assert.equal(new Set(foundation.gateways.map((item) => item.gatewayId)).size, foundation.gateways.length);
for (const id of TARGETS) {
  const nodes = graph.filter((item) => item.slug === id);
  assert.equal(nodes.length, 1, `${id} must have one Knowledge Graph identity.`);
  assert.equal(nodes[0].operationalMarketId, "san-francisco");
  assert.equal(nodes[0].recommendationEligible, true);
  assert(["good", "strong"].includes(nodes[0].spaceTypeFit.office.fit));
  assert.equal(foundation.districtProfiles.filter((item) => item.districtId === id).length, 1);
}
assert.equal(graph.find((item) => item.slug === "design-district").industrialGeography.overlapRelationship.canonicalKnowledgeOwner, "showplace-square");
assert(graph.find((item) => item.slug === "showplace-square").industrialGeography.compatibilityPaths.includes("/commercial-real-estate/CA/san-francisco/design-district/"));

// Every approved relationship and runtime explanation retains approved provenance and limitations.
const evidence = new Map(foundation.evidence.map((item) => [item.evidenceId, item]));
for (const id of TARGETS) {
  const profile = foundation.districtProfiles.find((item) => item.districtId === id);
  assert.equal(profile.reviewStatus, "APPROVED");
  assert.equal(profile.parkingEnvironment, "MODERATE");
  assert.equal(profile.accessActivationEligible, false, "Access coverage must not activate the candidate by itself.");
  assert.equal(profile.completeness.transit, "SUFFICIENT");
  assert.equal(profile.completeness.driving, "SUFFICIENT");
  assert.equal(profile.completeness.ferry, "MISSING");
  assert(!profile.importantUnknowns.some((item) => /North Bay access/.test(item)));
  profile.gatewayRelationships.forEach((edge) => {
    assert(edge.evidenceIds.length);
    assert(edge.limitations.length);
    edge.evidenceIds.forEach((evidenceId) => assert.equal(evidence.get(evidenceId).reviewStatus, "APPROVED"));
  });
  assert.equal(profile.originAccess.find((item) => item.originRegionId === "sf-origin:north-bay").overallRating, "WEAK");
}

const architectureRequirement = requirement("creative-access-architecture", "Architecture / design firm");
const accountingRequirement = requirement("creative-access-accounting", "Accounting firm / traditional professional services");
const architecture = composer.composeLocationRecommendations(architectureRequirement, foundation, compositionFoundation, sfOfficeModel);
const accounting = composer.composeLocationRecommendations(accountingRequirement, foundation, compositionFoundation, sfOfficeModel);

// Controlled pair: Access and Office are identical; only Business Environment changes.
assert.deepEqual(architectureRequirement.criteria, accountingRequirement.criteria);
const component = (result, id) => {
  const item = result.rawConsidered.find((candidate) => candidate.districtId === id);
  return { access: [item.access.overall, item.access.confidence, item.accessComponent.band], office: item.office.band, environment: item.environment.band, composition: item.compositionBand, eligibility: item.eligibilitySource };
};
for (const id of foundation.districtProfiles.map((item) => item.districtId)) {
  assert.deepEqual(component(architecture, id).access, component(accounting, id).access, `${id} Access changed with business identity.`);
  assert.equal(component(architecture, id).office, component(accounting, id).office, `${id} Office changed with business identity.`);
}
for (const id of TARGETS) {
  assert.equal(component(architecture, id).eligibility, "SHADOW_RECOMMENDATION_CANDIDATE");
  assert.equal(component(accounting, id).eligibility, "NOT_ELIGIBLE", `${id} was admitted by Access coverage alone.`);
  assert.equal(component(architecture, id).access[2], "GOOD");
}
assert.deepEqual(architecture.shortlist.map((item) => item.districtId), ["soma", "jackson-square", "showplace-square"]);
assert.deepEqual(accounting.shortlist.map((item) => item.districtId), ["financial-district", "jackson-square", "south-beach"]);
assert(architecture.tieGroups.length);

// Parking remains a one-band modifier and never creates an unsupported path.
architecture.considered.flatMap((item) => item.access.modeResults).forEach((mode) => assert(Math.abs(mode.parkingAdjustment || 0) <= 1));
for (const id of TARGETS) assert.equal(architecture.rawConsidered.find((item) => item.districtId === id).access.employeeCohortResults[0].selectedMode, "LOCAL_TRANSIT");

// Candidate districts remain comparison-only.
const candidateArchitecture = composer.composeLocationRecommendations(requirement("creative-access-candidates", "Architecture / design firm", "", ["financial-district", "design-district"]), foundation, compositionFoundation, sfOfficeModel);
const signature = (result) => result.considered.map((item) => [item.districtId, item.eligibilitySource, item.accessComponent.band, item.environment.band, item.office.band, item.compositionBand, item.tieKey]);
assert.deepEqual(signature(candidateArchitecture), signature(architecture));
assert.deepEqual(candidateArchitecture.shortlist.map((item) => item.districtId), architecture.shortlist.map((item) => item.districtId));

// Explicit preference clarifies or overrides the prior without touching Access/Office.
const neutral = composer.composeLocationRecommendations(requirement("creative-access-neutral", "Architecture / design firm", "No strong preference"), foundation, compositionFoundation, sfOfficeModel);
const creative = composer.composeLocationRecommendations(requirement("creative-access-explicit-creative", "Architecture / design firm", "Creative and design-oriented"), foundation, compositionFoundation, sfOfficeModel);
const established = composer.composeLocationRecommendations(requirement("creative-access-explicit-established", "Architecture / design firm", "Established and professional"), foundation, compositionFoundation, sfOfficeModel);
assert.deepEqual(neutral.shortlist.map((item) => item.districtId), architecture.shortlist.map((item) => item.districtId));
assert.equal(creative.considered.find((item) => item.districtId === "financial-district").environment.band, "MODERATE");
assert.equal(established.considered.find((item) => item.districtId === "financial-district").environment.band, "STRONG");
assert.equal(established.considered.find((item) => item.districtId === "showplace-square").environment.band, "MODERATE");
assert.deepEqual(established.shortlist.map((item) => item.districtId), ["jackson-square", "financial-district", "south-beach"]);
for (const id of foundation.districtProfiles.map((item) => item.districtId)) {
  assert.deepEqual(component(neutral, id).access, component(creative, id).access);
  assert.equal(component(neutral, id).office, component(established, id).office);
}

// Business identity and preference logic contain no target-specific district rules.
const compositionSource = fs.readFileSync("lib/recommendations/private-location-composition.js", "utf8");
const identityBlock = compositionSource.slice(compositionSource.indexOf("const BUSINESS_IDENTITIES"), compositionSource.indexOf("function accessComponent"));
TARGETS.forEach((id) => assert(!identityBlock.includes(id)));

// Production boundary hashes remain unchanged.
const hashes = {
  "_data/sfOfficeRecommendationModel.js": "e76839ebf3e5be19bcffc412cc1bdd3f8dbd32977b07d1bf2a14dcaa354a1e81",
  "lib/recommendations/sf-office-recommendation-resolver.js": "6f0f4e968915a78beeba5d473bf315723ea073beff8208ac9e7925ea235b4dde",
  "lib/recommendations/normalize-sf-office-profile.js": "6116531e6296d573f3a2dd728cf677b9f9a54ac9fd64753ef3a6609549cc3f95",
};
Object.entries(hashes).forEach(([file, expected]) => assert.equal(crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"), expected, `${file} changed.`));

console.log("SF Creative / Design Access Foundation QA passed.");
for (const [label, result] of [["architecture", architecture], ["accounting", accounting], ["creative preference", creative], ["established preference", established]]) {
  console.log(`${label}: ${result.shortlist.map((item) => `${item.districtId}:${item.compositionBand}`).join(",")}`);
}

module.exports = { architectureRequirement, accountingRequirement, architecture, accounting, neutral, creative, established };
