const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const foundation = require("../_data/sanDiegoIndustrialFlexCompositionFoundation");
const adapter = require("../lib/requirements/requirement-to-san-diego-industrial-flex-recommendation");
const composer = require("../lib/recommendations/san-diego-industrial-flex-location-composition");
const readiness = require("../lib/recommendations/private-recommendation-readiness");
const accessFoundation = require("../_data/sfAccessFoundationV0");
const officeFoundation = require("../_data/sfOfficeCompositionFoundation");
const officeModel = require("../_data/sfOfficeRecommendationModel");
const retailFoundation = require("../_data/sfRetailCompositionFoundation");
const sfIndustrialFlexFoundation = require("../_data/sfIndustrialFlexCompositionFoundation");
const districtGeography = require("../_data/requirementPrototypeDistrictGeography");
const qaStatus = require("../_data/recommendationQaStatus");

function requirement(id, activities, summary, candidates = [], marketId = "san-diego", criteria = []) { return { id, schemaVersion: "requirement:v1", propertyTypes: ["industrial_flex"], activities, businessContext: { summary }, locationLogic: { marketAnchor: { marketId, displayName: marketId === "san-diego" ? "San Diego" : marketId }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates } }, criteria }; }
const dependencies = { accessFoundation, compositionFoundation: officeFoundation, sfOfficeModel: officeModel, sfRetailFoundation: retailFoundation, sfIndustrialFlexFoundation, sanDiegoIndustrialFlexFoundation: foundation, districtGeography, sanDiegoIndustrialFlexEnabled: true };
const ids = (result) => result.shortlist.map((item) => item.districtId);
const scenarios = {
  miramar: requirement("sd-miramar", ["store", "repair_service", "dispatch"], "Contractor warehouse and service operation"),
  otay: requirement("sd-otay", ["ship_distribute", "receive", "make_assemble", "operate_vehicles"], "Border-oriented logistics distribution and manufacturing"),
  kearny: requirement("sd-kearny", ["display_present", "host_visitors", "repair_service"], "Customer-facing showroom and service Flex"),
  sorrento: requirement("sd-sorrento", ["research", "prototype", "product_development", "work"], "Technical R&D and engineering Flex"),
  mixed: requirement("sd-mixed", ["work", "make_assemble", "display_present"], "Office-production hybrid with customer presentation"),
};
const results = Object.fromEntries(Object.entries(scenarios).map(([key, value]) => [key, readiness.evaluateRecommendationReadiness(value, dependencies)]));
for (const result of Object.values(results)) { assert.notEqual(result.readiness, "INVESTIGATE"); assert(result.shortlist.length >= 2 && result.shortlist.length <= 4); assert(result.shortlist.every((item) => foundation.certifiedDistrictIds.includes(item.districtId))); }
assert.equal(ids(results.miramar)[0], "miramar");
assert.equal(ids(results.otay)[0], "otay-mesa");
assert.equal(ids(results.kearny)[0], "kearny-mesa");
assert.equal(ids(results.sorrento)[0], "sorrento-mesa");
assert(!ids(results.sorrento).includes("otay-mesa"));
assert.equal(results.mixed.composition.resolvedModel, "mixed");

const neutralBase = ids(readiness.evaluateRecommendationReadiness(scenarios.kearny, dependencies));
for (const candidate of ["miramar", "otay-mesa", "kearny-mesa", "sorrento-mesa", "sorrento-valley"]) {
  const candidateResult = readiness.evaluateRecommendationReadiness(requirement(`neutral-${candidate}`, scenarios.kearny.activities, scenarios.kearny.businessContext.summary, [candidate]), dependencies);
  assert.deepEqual(ids(candidateResult), neutralBase, `${candidate} entry must have zero ordering effect`);
  assert(candidateResult.composition.candidateContext.every((item) => item.treatment === "COMPARISON_CONTEXT_ONLY"));
}

const abstentions = [
  requirement("unresolved", [], "Commercial operating space"),
  requirement("specialized", ["research"], "Specialized laboratory with hazardous-material ventilation"),
  requirement("property", ["store"], "Warehouse where exact power capacity and clear height dominate"),
  requirement("regional", ["store"], "Compare San Diego County and nearby markets"),
  requirement("outside-candidate", ["store"], "Warehouse", ["vista-business-park"]),
  requirement("outside-market", ["store"], "Warehouse", [], "vista"),
];
for (const item of abstentions) { const result = readiness.evaluateRecommendationReadiness(item, dependencies); assert.equal(result.readiness, "INVESTIGATE"); assert.equal(result.shortlist.length, 0); assert(result.intelligenceGaps.length); }
assert.equal(adapter.projectRequirementToSanDiegoIndustrialFlexRecommendation(scenarios.sorrento).resolverInput.mode, "flex");
assert.equal(foundation.contextualGeographies[0].ownerDistrictId, "sorrento-mesa");
assert.deepEqual(foundation.certifiedDistrictIds, ["miramar", "otay-mesa", "kearny-mesa", "sorrento-mesa"]);
assert.match(qaStatus["san-diego"].validationStatus, /legacy_compass/);

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-sd-industrial-flex-")); const bundle = path.join(temp, "shared.cjs");
execFileSync(path.join(__dirname, "..", "node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "..", "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${bundle}`]);
const shared = require(bundle); const flag = "LOCATION_BRIEF_V2_PUBLIC_SAN_DIEGO_INDUSTRIAL_FLEX_ENABLED";
assert.equal(shared.sanDiegoIndustrialFlexEnabled({}), false);
assert.equal(shared.calculateSnapshot(scenarios.miramar).readiness, "INVESTIGATE");
const enabled = shared.calculateSnapshot(scenarios.miramar, { [flag]: "true" });
assert.notEqual(enabled.readiness, "INVESTIGATE"); assert.equal(enabled.foundationVersions.composition, foundation.schemaVersion); assert.equal(enabled.productResponse.heading, "Peer locations worth investigating"); assert(enabled.shortlist.every((item) => item.presentation.representativeBuildings.length));
const contextualRow = shared.__test.candidateRows("brief", { marketId: "san-diego", sourceType: "district", candidateDistrictIds: ["sorrento-valley"] }, "2026-08-31T00:00:00.000Z")[0];
assert.equal(contextualRow.canonicalDistrictId, "sorrento-mesa"); assert.equal(contextualRow.sourceIdentity, "sorrento-valley");
fs.rmSync(temp, { recursive: true, force: true });
console.log("San Diego Industrial/Flex Recommendation QA passed: four-city-context universe, separate intent models, abstention, neutrality, provenance, and default-off activation verified.");
