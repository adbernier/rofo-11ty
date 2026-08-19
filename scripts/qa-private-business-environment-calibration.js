const assert = require("node:assert/strict");
const fs = require("node:fs");
const composer = require("../lib/recommendations/private-location-composition");
const accessFoundation = require("../_data/sfAccessFoundationV0");
const compositionFoundation = require("../_data/sfOfficeCompositionFoundation");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel");

function criterion(dimension, raw, status = "PREFERRED") {
  return { id: dimension, dimension, status, value: { text: Array.isArray(raw) ? "" : String(raw), number: null, boolean: null, list: Array.isArray(raw) ? raw : [] } };
}

function controlledRequirement(id, businessType, environment = "") {
  const criteria = [
    criterion("universal.location.employee_origins", ["San Francisco"]),
    criterion("office.access.client_visits", "Clients rarely or never visit", "FLEXIBLE"),
    criterion("universal.access.transit_importance", "Public transit is helpful"),
    criterion("universal.access.parking_importance", "Convenient parking is helpful"),
    criterion("office.occupancy.peak_attendance", "35"),
  ];
  if (environment) criteria.push(criterion("office.environment.image", environment));
  return {
    id,
    propertyTypes: ["office"],
    locationLogic: {
      marketAnchor: { marketId: "san-francisco", geographyId: "san-francisco", displayName: "San Francisco, CA" },
      specificPreference: { candidateDistrictIds: [], candidateDistrictNames: [], informalText: "" },
    },
    businessContext: { summary: `${businessType}. Ordinary Office use.` },
    criteria,
  };
}

const architectureRequirement = controlledRequirement("business-environment-architecture", "Architecture / design firm");
const accountingRequirement = controlledRequirement("business-environment-accounting", "Accounting firm / traditional professional services");
const architecture = composer.composeLocationRecommendations(architectureRequirement, accessFoundation, compositionFoundation, sfOfficeModel);
const accounting = composer.composeLocationRecommendations(accountingRequirement, accessFoundation, compositionFoundation, sfOfficeModel);

assert.equal(architecture.businessIdentity.typeId, "design_creative");
assert.deepEqual(architecture.businessIdentity.characteristics, ["CREATIVE_DESIGN_ORIENTED"]);
assert.equal(accounting.businessIdentity.typeId, "professional_services");
assert.deepEqual(accounting.businessIdentity.characteristics, ["ESTABLISHED_PROFESSIONAL"]);

// The controlled pair changes one Requirement fact only.
assert.deepEqual(architectureRequirement.criteria, accountingRequirement.criteria);
assert.notEqual(architectureRequirement.businessContext.summary, accountingRequirement.businessContext.summary);
const accessSignature = (result) => result.considered.map((item) => [item.districtId, item.access.overall, item.access.confidence, item.accessComponent.band]);
const officeSignature = (result) => result.considered.map((item) => [item.districtId, item.office.band, item.office.summary]);
assert.deepEqual(accessSignature(architecture), accessSignature(accounting), "Business identity must not leak into Access Fit.");
assert.deepEqual(officeSignature(architecture), officeSignature(accounting), "Business identity must not alter Office Fit.");

// Existing reviewed business-type effects, not scenario code, create the only component difference.
assert.equal(architecture.considered.find((item) => item.districtId === "soma").environment.band, "STRONG");
assert.equal(accounting.considered.find((item) => item.districtId === "soma").environment.band, "GOOD");
assert.equal(architecture.considered.find((item) => item.districtId === "financial-district").environment.band, "GOOD");
assert.equal(accounting.considered.find((item) => item.districtId === "financial-district").environment.band, "STRONG");
assert.notDeepEqual(architecture.shortlist.map((item) => item.districtId), accounting.shortlist.map((item) => item.districtId));
[architecture, accounting].forEach((result) => result.considered.forEach((item) => {
  assert(item.environment.evidenceSources.every((source) => ["_data/sfOfficeRecommendationModel.js", "_data/locationKnowledgeGraph.js", "_data/commercialLocationModel.js"].includes(source)));
}));

const source = fs.readFileSync("lib/recommendations/private-location-composition.js", "utf8");
const identityBlock = source.slice(source.indexOf("const BUSINESS_IDENTITIES"), source.indexOf("function accessComponent"));
["financial-district", "soma", "jackson-square", "south-beach", "design-district"].forEach((districtId) => assert(!identityBlock.includes(districtId), `Business identity schema hard-codes district ${districtId}.`));

// Confirmation is adaptive, uses ordinary language, and preserves a neutral choice.
assert.equal(architecture.businessIdentity.confirmation.applicable, true);
assert.equal(accounting.businessIdentity.confirmation.applicable, true);
assert.match(architecture.businessIdentity.confirmation.question, /kind of setting/i);
assert(architecture.businessIdentity.confirmation.options.includes("No strong preference"));
const neutralArchitecture = composer.composeLocationRecommendations(controlledRequirement("architecture-neutral", "Architecture / design firm", "No strong preference"), accessFoundation, compositionFoundation, sfOfficeModel);
assert.equal(neutralArchitecture.businessIdentity.environmentPreference, "NO_STRONG_PREFERENCE");
assert.equal(neutralArchitecture.businessIdentity.confirmation.applicable, false);
assert.deepEqual(neutralArchitecture.considered.map((item) => [item.districtId, item.environment.band]), architecture.considered.map((item) => [item.districtId, item.environment.band]), "No strong preference must add no environment-preference effect.");

// The expanded Access Foundation defines a bounded evaluable universe; business identity may admit reviewed candidates but cannot invent access evidence.
assert.deepEqual(architecture.considered.map((item) => item.districtId), accounting.considered.map((item) => item.districtId));
assert(architecture.rawConsidered.some((item) => item.districtId === "design-district"));
assert.equal(architecture.rawConsidered.find((item) => item.districtId === "design-district").eligibilitySource, "SHADOW_RECOMMENDATION_CANDIDATE");
assert.equal(accounting.rawConsidered.find((item) => item.districtId === "design-district").eligibilitySource, "NOT_ELIGIBLE", "Access coverage alone must not admit a business-irrelevant candidate.");
assert(!architecture.considered.some((item) => item.districtId === "design-district"), "Compatibility identities must not render as a second decision geography.");
assert(architecture.shadow.production.result.orderedCandidates.some((item) => item.districtId === "design-district"), "Existing SF Office intelligence should still expose Design District in the resolver trace.");

console.log("Private Business Environment calibration QA passed.");
console.log(`architecture: ${architecture.shortlist.map((item) => `${item.districtId}:${item.environment.band}`).join(",")}`);
console.log(`accounting: ${accounting.shortlist.map((item) => `${item.districtId}:${item.environment.band}`).join(",")}`);

module.exports = { architectureRequirement, accountingRequirement, architecture, accounting };
