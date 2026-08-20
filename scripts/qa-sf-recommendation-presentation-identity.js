const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const groupsData = require("../_data/sfOfficeRecommendationPresentationGroups");
const graph = require("../_data/locationKnowledgeGraph");
const locationModel = require("../_data/commercialLocationModel");
const neighborhoodPages = require("../_data/neighborhoodPages");
const accessFoundation = require("../_data/sfAccessFoundationV0");
const compositionFoundation = require("../_data/sfOfficeCompositionFoundation");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel");
const composer = require("../lib/recommendations/private-location-composition");

function criterion(dimension, raw, status = "PREFERRED") {
  return { id: dimension, dimension, status, value: { text: Array.isArray(raw) ? "" : String(raw), number: null, boolean: null, list: Array.isArray(raw) ? raw : [] } };
}

function requirement(id, business, candidates = [], route = null) {
  return {
    id,
    propertyTypes: ["office"],
    businessContext: { summary: `${business}. Ordinary Office use.` },
    criteria: [
      criterion("universal.location.employee_origins", ["San Francisco"]),
      criterion("office.access.client_visits", "Clients rarely or never visit", "FLEXIBLE"),
      criterion("universal.access.transit_importance", "Public transit is helpful"),
      criterion("universal.access.parking_importance", "Convenient parking is helpful"),
      criterion("office.occupancy.peak_attendance", "35"),
    ],
    locationLogic: {
      marketAnchor: { marketId: "san-francisco", geographyId: "san-francisco", displayName: "San Francisco, CA" },
      specificPreference: {
        candidateDistrictIds: candidates,
        candidateDistrictNames: candidates.map((districtId) => districtId === "showplace-square" ? "Showplace Square" : "Design District"),
        informalText: "",
        sourceRouteIdentity: route,
      },
    },
  };
}

const group = groupsData.groups.find((item) => item.presentationGroupId === "sf-office:showplace-square-design-district");
assert(group);
assert.equal(group.canonicalDistrictId, "showplace-square");
assert.deepEqual(group.memberDistrictIds, ["showplace-square", "design-district"]);
assert.equal(group.displayName, "Showplace Square / Design District");
assert.equal(group.componentPolicy, "CANONICAL_KNOWLEDGE_OWNER");

const graphIds = new Set(graph.filter((item) => item.type === "district").map((item) => item.slug));
const allMembers = groupsData.groups.flatMap((item) => item.memberDistrictIds);
assert.equal(new Set(allMembers).size, allMembers.length, "A district cannot belong to two presentation groups.");
for (const presentationGroup of groupsData.groups) {
  assert(presentationGroup.memberDistrictIds.includes(presentationGroup.canonicalDistrictId));
  assert(presentationGroup.memberDistrictIds.every((districtId) => graphIds.has(districtId)), "Presentation groups cannot reference unknown districts.");
  assert(!presentationGroup.memberDistrictIds.includes(presentationGroup.presentationGroupId), "Presentation groups cannot be circular.");
}

const showplace = graph.find((item) => item.slug === "showplace-square");
const design = graph.find((item) => item.slug === "design-district");
assert.equal(design.industrialGeography.overlapRelationship.canonicalKnowledgeOwner, "showplace-square");
assert.equal(design.industrialGeography.overlapRelationship.relationship, "compatibility_alias");
assert.equal(design.industrialGeography.overlapRelationship.preservePublicPath, true);
assert(showplace.industrialGeography.compatibilityPaths.includes(design.path));
assert(locationModel.byPath[showplace.path], "The canonical knowledge owner must own the CLM record.");
assert(!locationModel.byPath[design.path], "Design District must not acquire an invented independent CLM record.");
assert(neighborhoodPages.some((item) => item.slug === "showplace-square" && item.city === "San Francisco"));
assert(!neighborhoodPages.some((item) => item.slug === "design-district" && item.city === "San Francisco"), "No independent SF Design District centroid may be invented.");
const designAccess = accessFoundation.districtProfiles.find((item) => item.districtId === "design-district");
assert.equal(designAccess.accessKnowledgeOwnerDistrictId, "showplace-square");
assert.equal(designAccess.accessKnowledgeTreatment, "PRESENTATION_COMPATIBILITY_REFERENCE");

const architecture = composer.composeLocationRecommendations(requirement("identity-architecture", "Architecture / design firm"), accessFoundation, compositionFoundation, sfOfficeModel);
const accounting = composer.composeLocationRecommendations(requirement("identity-accounting", "Accounting firm / traditional professional services"), accessFoundation, compositionFoundation, sfOfficeModel);
for (const result of [architecture, accounting]) {
  assert.equal(result.considered.filter((item) => group.memberDistrictIds.includes(item.districtId)).length, 1, "Members must render once.");
  assert(!result.considered.some((item) => item.districtId === "design-district"));
  assert(result.considered.some((item) => item.presentationGroupId === group.presentationGroupId));
}
assert.equal(new Set(groupsData.groups.flatMap((item) => item.memberDistrictIds)).size, groupsData.groups.flatMap((item) => item.memberDistrictIds).length, "A district identity cannot belong to multiple presentation groups.");

const presented = architecture.considered.find((item) => item.presentationGroupId === group.presentationGroupId);
const rawOwner = architecture.rawConsidered.find((item) => item.districtId === "showplace-square");
const rawCompatibility = architecture.rawConsidered.find((item) => item.districtId === "design-district");
assert.strictEqual(presented.access, rawOwner.access, "Access must come from the canonical owner.");
assert.strictEqual(presented.environment, rawOwner.environment, "Business Environment must come from the canonical owner.");
assert.strictEqual(presented.office, rawOwner.office, "Office Fit must come from the canonical owner.");
assert.notStrictEqual(presented.access, rawCompatibility.access, "Compatibility Access must not vote separately.");
assert.equal(new Set(presented.evidenceIds).size, presented.evidenceIds.length, "Evidence may be reconciled, never double-counted.");
assert.deepEqual(architecture.shortlist.map((item) => item.districtId), ["soma", "jackson-square", "showplace-square"]);
assert.equal(presented.districtName, "Showplace Square / Design District");
assert.equal(presented.compositionBand, rawOwner.compositionBand);
assert.deepEqual(presented.strengths, rawOwner.strengths);
assert.deepEqual(presented.tradeoffs, rawOwner.tradeoffs);

const accountingPresented = accounting.considered.find((item) => item.presentationGroupId === group.presentationGroupId);
assert.equal(accountingPresented.compositionBand, "INELIGIBLE", "Grouping cannot create Accounting eligibility.");
assert(!accounting.shortlist.some((item) => item.districtId === "showplace-square"));
assert.deepEqual(accounting.shortlist.map((item) => item.districtId), ["financial-district", "jackson-square", "south-beach"]);

const selectedShowplace = composer.composeLocationRecommendations(requirement("candidate-showplace", "Architecture / design firm", ["showplace-square"]), accessFoundation, compositionFoundation, sfOfficeModel);
const selectedDesign = composer.composeLocationRecommendations(requirement("candidate-design", "Architecture / design firm", ["design-district"]), accessFoundation, compositionFoundation, sfOfficeModel);
const selectedBoth = composer.composeLocationRecommendations(requirement("candidate-both", "Architecture / design firm", ["showplace-square", "design-district"]), accessFoundation, compositionFoundation, sfOfficeModel);
const resultSignature = (result) => result.considered.map((item) => [item.districtId, item.compositionBand, item.tieKey, item.eligibilitySource]);
assert.deepEqual(resultSignature(selectedShowplace), resultSignature(architecture));
assert.deepEqual(resultSignature(selectedDesign), resultSignature(architecture));
assert.deepEqual(resultSignature(selectedBoth), resultSignature(architecture));
assert.deepEqual(selectedShowplace.candidateContext.map((item) => item.districtId), ["showplace-square"]);
assert.deepEqual(selectedDesign.candidateContext.map((item) => item.districtId), ["showplace-square"]);
assert.deepEqual(selectedBoth.candidateContext.map((item) => item.districtId), ["showplace-square"]);
assert.deepEqual(selectedShowplace.candidateContext[0].sourceIdentityIds, ["showplace-square"]);
assert.deepEqual(selectedDesign.candidateContext[0].sourceIdentityIds, ["design-district"]);
assert.deepEqual(selectedBoth.candidateContext[0].sourceIdentityIds, ["showplace-square", "design-district"]);
assert.equal(selectedDesign.considered.find((item) => item.districtId === "showplace-square").candidatePreference, true);

const designRoute = { districtId: "design-district", path: "/commercial-real-estate/CA/san-francisco/design-district/" };
const routeSeeded = composer.composeLocationRecommendations(requirement("route-design", "Architecture / design firm", ["design-district"], designRoute), accessFoundation, compositionFoundation, sfOfficeModel);
assert.deepEqual(routeSeeded.candidateContext[0].sourceRouteIdentity, designRoute, "Route seed identity must survive presentation dedupe.");

const compositionSource = fs.readFileSync("lib/recommendations/private-location-composition.js", "utf8");
assert(!compositionSource.includes('district == "design-district"'));
assert(!compositionSource.includes('districtId === "design-district"'));

const unchangedHashes = {
  "_data/sfOfficeRecommendationModel.js": "e76839ebf3e5be19bcffc412cc1bdd3f8dbd32977b07d1bf2a14dcaa354a1e81",
  "lib/recommendations/sf-office-recommendation-resolver.js": "6f0f4e968915a78beeba5d473bf315723ea073beff8208ac9e7925ea235b4dde",
  "lib/recommendations/normalize-sf-office-profile.js": "6116531e6296d573f3a2dd728cf677b9f9a54ac9fd64753ef3a6609549cc3f95",
  "_data/neighborhoodPages.js": "824e1fa667e3171263f221b0d6f5d3114b9f07fe447842f5fa777d6164fc7577",
  "pages/sitemap.njk": "1fdc4e164ac4fa478afc850f6a577bec9c7ca696f45023b0e7ec5333153964d4",
  "_data/districtCompatibilityRedirects.js": "3470b78dcafb306e13c686d8d913e9d1b39ff1c5d52d562d9b162f027d4f6665",
  "_data/businessBriefs.js": "37697db84d50f3a174f59ba5308bef4bd34c2813a3afe6c5eb057a898dceea89",
};
for (const [file, expected] of Object.entries(unchangedHashes)) {
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"), expected, `${file} changed outside the sprint boundary.`);
}

console.log("SF recommendation presentation identity QA passed.");
console.log(`architecture: ${architecture.shortlist.map((item) => `${item.districtName}:${item.compositionBand}`).join(", ")}`);
console.log(`accounting: ${accounting.shortlist.map((item) => `${item.districtName}:${item.compositionBand}`).join(", ")}`);

module.exports = { group, architecture, accounting, selectedShowplace, selectedDesign, selectedBoth, routeSeeded };
