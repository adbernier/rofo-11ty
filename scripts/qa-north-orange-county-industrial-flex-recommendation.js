"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const foundation = require("../_data/northOrangeCountyIndustrialFlexEvidenceFoundation");
const adapter = require("../lib/requirements/requirement-to-north-orange-county-industrial-flex-recommendation");
const composer = require("../lib/recommendations/north-orange-county-industrial-flex-location-composition");
const readiness = require("../lib/recommendations/private-recommendation-readiness");
const activationRegistry = require("../_data/recommendationActivationRegistry");
const qaStatus = require("../_data/recommendationQaStatus");
const { buildMarketReadiness } = require("../lib/eos/market-readiness");

const dependencies = {
  accessFoundation: require("../_data/sfAccessFoundationV0"), compositionFoundation: require("../_data/sfOfficeCompositionFoundation"), sfOfficeModel: require("../_data/sfOfficeRecommendationModel"), sfRetailFoundation: require("../_data/sfRetailCompositionFoundation"), sfIndustrialFlexFoundation: require("../_data/sfIndustrialFlexCompositionFoundation"), sanDiegoIndustrialFlexFoundation: require("../_data/sanDiegoIndustrialFlexCompositionFoundation"), northOrangeCountyIndustrialFlexFoundation: foundation, districtGeography: require("../_data/requirementPrototypeDistrictGeography"), northOrangeCountyIndustrialFlexEnabled: true,
};
function requirement(id, activities, summary, marketId = "anaheim", candidates = [], criteria = []) { return { id, schemaVersion: "requirement:v1", propertyTypes: ["industrial_flex"], activities, businessContext: { summary }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, displayName: marketId === "anaheim" ? "Anaheim" : "Fullerton" }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates } }, criteria }; }
const ids = (result) => result.shortlist.map((item) => item.districtId);
const evaluate = (item) => readiness.evaluateRecommendationReadiness(item, dependencies);
const scenarios = [
  ["warehouse-distribution", requirement("warehouse-distribution", ["store", "receive", "ship_distribute"], "Conventional warehouse and distribution operation"), "industrial", ["anaheim-canyon"]],
  ["light-manufacturing", requirement("light-manufacturing", ["make_assemble", "store"], "Light manufacturing with supporting storage"), "industrial", ["anaheim-canyon"]],
  ["larger-operational", requirement("larger-operational", ["store", "receive", "ship_distribute", "operate_vehicles"], "Larger conventional Industrial operation"), "industrial", ["anaheim-canyon"]],
  ["fullerton-contractor", requirement("fullerton-contractor", ["dispatch", "repair_service"], "Smaller-format contractor service Industrial under 2,500 SF", "fullerton"), "industrial", ["fullerton-industrial-service-area", "anaheim-canyon"]],
  ["fullerton-office-warehouse", requirement("fullerton-office-warehouse", ["work", "store"], "Small office plus warehouse under 2,500 SF", "fullerton"), "mixed", ["fullerton-industrial-service-area", "anaheim-canyon"]],
  ["showroom-service", requirement("showroom-service", ["display_present", "host_visitors", "repair_service"], "Flex-led showroom and service hybrid"), "flex", ["anaheim-canyon"]],
  ["mixed-office-warehouse", requirement("mixed-office-warehouse", ["work", "store"], "Office plus warehouse operating mix"), "mixed", ["anaheim-canyon", "fullerton-industrial-service-area"]],
  ["mixed-contractor-storage", requirement("mixed-contractor-storage", ["work", "dispatch", "store"], "Smaller office/warehouse contractor service and storage mix under 2,500 SF", "fullerton"), "mixed", ["fullerton-industrial-service-area", "anaheim-canyon"]],
];
for (const [name, input, mode, expected] of scenarios) {
  const projection = adapter.projectRequirementToNorthOrangeCountyIndustrialFlexRecommendation(input);
  assert.equal(projection.resolverInput.mode, mode, `${name} intent`);
  assert.equal(projection.comparisonContext.treatment, "COMPARISON_CONTEXT_ONLY");
  const result = evaluate(input);
  assert.notEqual(result.readiness, "INVESTIGATE", `${name} should resolve`);
  assert.deepEqual(ids(result), expected, `${name} ordering`);
  assert(result.shortlist.length >= 1 && result.shortlist.length <= 2);
  assert(result.shortlist.every((item) => foundation.evidenceCandidateIds.includes(item.districtId)));
  assert(result.shortlist.every((item) => item.environment.matchedTraits.length));
}
assert.equal(evaluate(scenarios[0][1]).readiness, "BOUNDED");
assert.equal(evaluate(scenarios[0][1]).productResponse.heading, "Starting point worth investigating");
assert.equal(evaluate(scenarios[3][1]).productResponse.heading, "Peer locations worth investigating");

const abstentions = [
  requirement("insufficient", [], "Industrial or Flex space"),
  requirement("capability", ["store"], "Warehouse where exact loading configuration, clear height, and power are required"),
  requirement("countywide", ["store"], "Compare all of Orange County countywide"),
  requirement("south-oc", ["store"], "Compare South OC and Lake Forest"),
  requirement("access", ["dispatch"], "Customer service territory is decisive and must determine the location"),
  requirement("lab", ["research"], "Specialized laboratory with hazardous-material ventilation"),
  requirement("outside", ["store"], "Warehouse", "irvine"),
  requirement("outside-candidate", ["store"], "Warehouse", "anaheim", ["brea"]),
  requirement("conflict", ["ship_distribute", "operate_vehicles", "display_present", "host_visitors"], "Heavy operation with public visitors"),
];
for (const item of abstentions) { const result = evaluate(item); assert.equal(result.readiness, "INVESTIGATE", item.id); assert.equal(result.shortlist.length, 0); assert(result.intelligenceGaps.length); }

const neutral = requirement("neutral", ["work", "store"], "Small office plus warehouse under 2,500 SF");
const neutralOrder = ids(evaluate(neutral));
for (const [marketId, candidate] of [["anaheim", ""], ["anaheim", "anaheim-canyon"], ["fullerton", ""], ["fullerton", "fullerton-industrial-service-area"]]) {
  const result = evaluate(requirement(`neutral-${marketId}-${candidate || "city"}`, neutral.activities, neutral.businessContext.summary, marketId, candidate ? [candidate] : []));
  assert.deepEqual(ids(result), neutralOrder);
  assert(result.composition.candidateContext.every((item) => item.treatment === "COMPARISON_CONTEXT_ONLY"));
}

const activation = activationRegistry.flows["north-orange-county:industrial_flex:bounded"];
assert(activation);
assert.equal(activation.activationEligible, true);
assert.equal(activation.certificationStatus, "certified_for_bounded_real_user_cohort");
assert.match(qaStatus["orange-county"].validationStatus, /legacy_compass/);
assert.match(qaStatus["orange-county"].notes, /not current Level 3 certification/);
const orangeCountyReadiness = buildMarketReadiness().markets.find((item) => item.marketId === "orange-county");
const industrialReadiness = orangeCountyReadiness.propertyTypes.find((item) => item.propertyType === "industrial");
assert.equal(industrialReadiness.workloads.spaceTypeFit.status, "Ready");
assert.equal(industrialReadiness.workloads.calibration.status, "Ready");
assert.equal(industrialReadiness.workloads.certificationRelease.status, "Ready");
assert.equal(industrialReadiness.recommendation, "Building", "Orange County overall remains Building because access and countywide intelligence are not certified");
assert.notEqual(orangeCountyReadiness.propertyTypes.find((item) => item.propertyType === "office").recommendation, "Ready");
assert.notEqual(orangeCountyReadiness.propertyTypes.find((item) => item.propertyType === "retail").recommendation, "Ready");

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-north-oc-industrial-flex-"));
function bundle(source, output) { execFileSync(path.join(__dirname, "..", "node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "..", source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, output)}`], { stdio: "pipe" }); return require(path.join(temp, output)); }
const shared = bundle("functions/api/location-brief-v2/_shared.js", "shared.cjs");
const renderer = bundle("functions/operator/location-brief-v2/[publicId].js", "renderer.cjs");
const renderedRequirement = scenarios[3][1];
const snapshot = { id: "snapshot", createdAt: "2026-09-02T00:00:00.000Z", ...shared.calculateSnapshot(renderedRequirement, { __northOrangeCountyIndustrialFlexEnabled: true }) };
const bundleRecord = { brief: { publicId: "LB2-000000000000000000000000", lifecycleStage: "LOCATIONS_RECOMMENDED", currentRequirementRevisionId: "revision", currentRecommendationSnapshotId: "snapshot" }, entryContext: { marketId: "fullerton", propertyType: "industrial_flex", sourceType: "district" }, currentRevision: { id: "revision", revisionNumber: 1, requirement: renderedRequirement }, currentSnapshot: snapshot, candidates: [], revisions: [], snapshots: [] };
const html = renderer.renderLocationBriefV2Page(bundleRecord, true, false, { publicExperience: true });
assert(html.includes("Locations worth investigating"));
assert(html.includes("bounded North Orange County comparison"));
assert(html.includes("Fullerton Industrial / Service Area"));
assert(html.includes("Representative environments"));
assert(html.includes("Orangethorpe Industrial Corridor"));
assert(html.includes("Walnut–Truslow–Raymond Manufacturing Area"));
assert(html.includes("representative examples, not current availability"));
assert(!html.includes("2671 La Palma"));
assert(snapshot.shortlist.every((item) => item.presentation.representativeBuildings.every((entry) => entry.availabilitySemantics === "REPRESENTATIVE_ONLY_NOT_AVAILABILITY" && entry.provenance.length)));
fs.rmSync(temp, { recursive: true, force: true });

console.log(`North Orange County Industrial/Flex Recommendation QA passed: ${scenarios.length} calibrated scenarios, ${abstentions.length} abstentions, four neutral entries, two-peer/one-peer behavior, rendering, readiness, and default-deny activation verified.`);
