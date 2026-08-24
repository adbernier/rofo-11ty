const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const foundation = require("../_data/sfIndustrialFlexCompositionFoundation");
const coverage = require("../_data/sfIndustrialFlexMarketCoverage");
const geography = require("../_data/sfIndustrialFlexDecisionGeographies");
const backlog = require("../_data/sfIndustrialFlexPublicExperienceBacklog");
const accessFoundation = require("../_data/sfAccessFoundationV0");
const composer = require("../lib/recommendations/sf-industrial-flex-location-composition");
const readiness = require("../lib/recommendations/private-recommendation-readiness");
const officeFoundation = require("../_data/sfOfficeCompositionFoundation");
const officeModel = require("../_data/sfOfficeRecommendationModel");
const retailFoundation = require("../_data/sfRetailCompositionFoundation");
const districtGeography = require("../_data/requirementPrototypeDistrictGeography");

function requirement(id, activities, summary = "", candidates = []) { return { id, schemaVersion: "requirement:v1", propertyTypes: ["industrial_flex"], activities, businessContext: { summary }, locationLogic: { marketAnchor: { marketId: "san-francisco", displayName: "San Francisco" }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates } }, criteria: [] }; }
function ids(result) { return result.shortlist.map((item) => item.districtId); }
function assertUnique(result) { assert.equal(new Set(ids(result)).size, ids(result).length); assert(!ids(result).includes("design-district")); }

assert.equal(coverage.industrial.blockingGaps.length, 0);
assert.equal(coverage.flex.blockingGaps.length, 0);
assert.equal(coverage.industrial.universeReview.status, "READY");
assert.equal(coverage.flex.universeReview.status, "READY");
assert.equal(backlog.status, "BUILDING");
assert(geography.contextual.some((item) => item.geographyId === "southern-waterfront-piers-80-96" && item.role === "SPECIALIZED_INVESTIGATION"));
assert(geography.contextual.some((item) => item.geographyId === "northeast-mission-pdr" && item.role === "PRESENTATION_CONTEXT"));

const profiles = {
  warehouse: requirement("warehouse", ["store", "receive", "ship_distribute"], "Warehouse and distribution operation"),
  lastMile: requirement("last-mile", ["dispatch", "operate_vehicles", "ship_distribute"], "Last-mile logistics fleet"),
  contractor: requirement("contractor", ["dispatch", "operate_vehicles", "repair_service", "store"], "Contractor service operation"),
  food: requirement("food", ["make_assemble", "receive", "ship_distribute"], "Food production and distribution"),
  fabrication: requirement("fabrication", ["make_assemble", "receive"], "Fabrication and light manufacturing"),
  showroom: requirement("showroom", ["display_present", "host_visitors", "work"], "Design showroom and office"),
  officeProduction: requirement("office-production", ["work", "make_assemble", "display_present"], "Office and light production hybrid"),
  technical: requirement("technical", ["work", "product_development", "prototype", "research"], "Technical prototyping and R&D support"),
  creative: requirement("creative", ["work", "display_present"], "Creative production studio"),
};

for (const key of ["warehouse", "lastMile", "contractor", "food", "fabrication"]) {
  const result = composer.composeForModel(profiles[key], accessFoundation, foundation, "industrial"); assert.equal(result.resolvedModel, "industrial"); assert(result.shortlist.length); assertUnique(result);
}
for (const key of ["showroom", "officeProduction", "technical", "creative"]) {
  const result = composer.composeForModel(profiles[key], accessFoundation, foundation, "flex"); assert.equal(result.resolvedModel, "flex"); assert(result.shortlist.length); assertUnique(result);
}

const warehouse = composer.composeLocationRecommendations(profiles.warehouse, accessFoundation, foundation);
const showroom = composer.composeLocationRecommendations(profiles.showroom, accessFoundation, foundation);
assert.equal(warehouse.resolvedModel, "industrial"); assert.equal(showroom.resolvedModel, "flex");
assert.notDeepEqual(ids(warehouse), ids(showroom), "Industrial and Flex must not collapse into one ordering.");
assert(ids(warehouse).includes("bayview-industrial"));
assert(ids(showroom).includes("showplace-square"));
assert(!ids(warehouse).includes("soma"), "SoMa cannot enter ordinary Industrial.");

const candidateBase = composer.composeLocationRecommendations(profiles.showroom, accessFoundation, foundation);
const candidate = composer.composeLocationRecommendations(requirement("candidate", profiles.showroom.activities, profiles.showroom.businessContext.summary, ["dogpatch"]), accessFoundation, foundation);
assert.deepEqual(ids(candidate), ids(candidateBase), "Candidate geography must have zero ranking effect.");
const compat = composer.composeLocationRecommendations(requirement("compat", profiles.showroom.activities, profiles.showroom.businessContext.summary, ["design-district"]), accessFoundation, foundation);
assert.equal(compat.candidateContext[0].districtId, "showplace-square");

const dependencies = { accessFoundation, sfIndustrialFlexFoundation: foundation, compositionFoundation: officeFoundation, sfOfficeModel: officeModel, sfRetailFoundation: retailFoundation, districtGeography };
const resolved = readiness.evaluateRecommendationReadiness(profiles.warehouse, dependencies);
assert.equal(resolved.readiness, "FULL"); assert(resolved.shortlist.length);
const unresolved = readiness.evaluateRecommendationReadiness(requirement("ambiguous", [], "Business needs a commercial operating space"), dependencies);
assert.equal(unresolved.readiness, "INVESTIGATE"); assert.equal(unresolved.shortlist.length, 0);

const officeIds = new Set(officeFoundation.districts.map((item) => item.districtId));
assert(!officeIds.has("northeast-mission-pdr"));
assert.equal(retailFoundation.districts.some((item) => item.districtId === "bayview-industrial" && item.classification !== retailFoundation.classification.NOT_RETAIL), false);

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-sf-industrial-flex-qa-"));
const bundlePath = path.join(temp, "shared.cjs");
execFileSync(path.join(__dirname, "..", "node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "..", "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${bundlePath}`], { stdio: "pipe" });
const shared = require(bundlePath);
assert.equal(shared.publicV2Enabled({}, "industrial_flex"), false);
assert.equal(shared.publicV2Enabled({ LOCATION_BRIEF_V2_PUBLIC_SF_INDUSTRIAL_FLEX_ENABLED: "true" }, "industrial_flex"), true);
assert.equal(shared.isSfIndustrialFlexRequirement(profiles.warehouse), true);
assert.equal(shared.isSfIndustrialFlexEntryContext({ marketId: "san-francisco", propertyType: "industrial_flex" }), true);
const snapshot = shared.calculateSnapshot(profiles.showroom);
assert.equal(snapshot.foundationVersions.resolvedModel, "flex"); assert(snapshot.shortlist.length);
fs.rmSync(temp, { recursive: true, force: true });

console.log(`SF Industrial/Flex QA passed: Industrial ${coverage.industrial.universeReview.approvedDecisionGeographyIds.length} geographies; Flex ${coverage.flex.universeReview.approvedDecisionGeographyIds.length}; separate resolution, neutrality, deduplication, and abstention verified.`);
