"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const foundation = require("../_data/indianapolisIndustrialFlexEvidenceFoundation");
const adapter = require("../lib/requirements/requirement-to-indianapolis-industrial-flex-recommendation");
const readiness = require("../lib/recommendations/private-recommendation-readiness");
const activationRegistry = require("../_data/recommendationActivationRegistry");
const qaStatus = require("../_data/recommendationQaStatus");
const { buildMarketReadiness } = require("../lib/eos/market-readiness");

const dependencies = {
  accessFoundation: require("../_data/sfAccessFoundationV0"), compositionFoundation: require("../_data/sfOfficeCompositionFoundation"), sfOfficeModel: require("../_data/sfOfficeRecommendationModel"), sfRetailFoundation: require("../_data/sfRetailCompositionFoundation"), sfIndustrialFlexFoundation: require("../_data/sfIndustrialFlexCompositionFoundation"), sanDiegoIndustrialFlexFoundation: require("../_data/sanDiegoIndustrialFlexCompositionFoundation"), northOrangeCountyIndustrialFlexFoundation: require("../_data/northOrangeCountyIndustrialFlexEvidenceFoundation"), phoenixIndustrialFlexFoundation: require("../_data/phoenixIndustrialFlexEvidenceFoundation"), indianapolisIndustrialFlexFoundation: foundation, districtGeography: require("../_data/requirementPrototypeDistrictGeography"), indianapolisIndustrialFlexEnabled: true,
};
function requirement(id, activities, summary, candidates = [], marketId = "indianapolis", city = "", propertyType = "industrial_flex") { return { id, schemaVersion: "requirement:v1", propertyTypes: [propertyType], activities, businessContext: { summary }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, city, state: "IN", displayName: city ? `${city}, IN` : "Indianapolis, IN" }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates } }, criteria: [] }; }
const ids = (result) => result.shortlist.map((item) => item.districtId);
const evaluate = (item) => readiness.evaluateRecommendationReadiness(item, dependencies);
const scenarios = [
  ["warehouse-distribution", requirement("warehouse-distribution", ["store", "receive", "ship_distribute"], "Conventional warehouse and distribution operation"), "industrial", ["indianapolis-airport-logistics", "park-100-northwest-indianapolis"]],
  ["regional-logistics", requirement("regional-logistics", ["store", "receive", "ship_distribute"], "Regional logistics-led distribution operation"), "industrial", ["indianapolis-airport-logistics"]],
  ["broader-industrial", requirement("broader-industrial", ["store", "operate_vehicles"], "Larger operational broader Industrial use"), "industrial", ["indianapolis-airport-logistics"]],
  ["contractor-service", requirement("contractor-service", ["dispatch", "repair_service"], "Contractor/service Industrial operation"), "industrial", ["park-100-northwest-indianapolis"]],
  ["office-warehouse", requirement("office-warehouse", ["work", "store"], "Office/warehouse operating requirement"), "mixed", ["park-100-northwest-indianapolis", "indianapolis-airport-logistics"]],
  ["lighter-flex", requirement("lighter-flex", ["work", "repair_service"], "Smaller-format lighter Flex under 2,500 SF"), "flex", ["park-100-northwest-indianapolis"]],
  ["mixed-office-operations", requirement("mixed-office-operations", ["work", "dispatch", "store"], "Multi-tenant Flex contractor/service office and operations mix"), "mixed", ["park-100-northwest-indianapolis"]],
];
for (const [name, input, mode, expected] of scenarios) {
  const projection = adapter.projectRequirementToIndianapolisIndustrialFlexRecommendation(input);
  assert.equal(projection.resolverInput.mode, mode, `${name} intent`);
  assert.equal(projection.comparisonContext.treatment, "COMPARISON_CONTEXT_ONLY");
  const result = evaluate(input);
  assert.notEqual(result.readiness, "INVESTIGATE", `${name} should resolve`);
  assert.deepEqual(ids(result), expected, `${name} ordering`);
  assert(result.shortlist.every((item) => foundation.evidenceCandidateIds.includes(item.districtId) && item.environment.matchedTraits.length));
}
assert.equal(evaluate(scenarios[1][1]).readiness, "BOUNDED");
assert.equal(evaluate(scenarios[1][1]).productResponse.heading, "Starting point worth investigating");
assert.equal(evaluate(scenarios[0][1]).productResponse.heading, "Peer locations worth investigating");

const realRequirement = requirement("real-sanitized", [], "Industrial/Flex requirement with loading");
realRequirement.criteria.push({ dimension: "industrial.loading.form", value: { text: "loading" } });
assert.equal(evaluate(realRequirement).readiness, "INVESTIGATE", "Known loading-only facts must not manufacture a recommendation");

const abstentions = [
  requirement("insufficient", [], "Industrial or Flex space"),
  requirement("loading", ["store"], "Warehouse where exact loading configuration is decisive and required"),
  requirement("capability", ["store"], "Clear height, power, and yard are required and must determine the search"),
  requirement("access", ["ship_distribute"], "Airport and interstate access must determine the location"),
  requirement("metro", ["store"], "Compare Indianapolis Metro and Greater Indianapolis", [], "indianapolis-metro", ""),
  requirement("plainfield", ["store"], "Compare Plainfield with Indianapolis", [], "plainfield", "Plainfield"),
  requirement("carmel", ["store"], "Warehouse", [], "carmel", "Carmel"),
  requirement("outside-candidate", ["store"], "Warehouse", ["plainfield-logistics"]),
  requirement("specialized", ["make_assemble"], "Hazardous specialized manufacturing requiring permitted use"),
];
for (const item of abstentions) { const result = evaluate(item); assert.equal(result.readiness, "INVESTIGATE", item.id); assert.equal(result.shortlist.length, 0); assert(result.intelligenceGaps.length); }

const neutralFacts = [["work", "store"], "Office/warehouse operating requirement"];
const contexts = ["", "indianapolis-airport-logistics", "park-fletcher", "stout-field", "park-100-northwest-indianapolis", "park-100"];
const neutralOrder = ids(evaluate(requirement("neutral-city", ...neutralFacts)));
for (const candidate of contexts) {
  const result = evaluate(requirement(`neutral-${candidate || "city"}`, ...neutralFacts, candidate ? [candidate] : []));
  assert.deepEqual(ids(result), neutralOrder, `${candidate || "Indianapolis city"} must be neutral`);
  assert(result.composition.candidateContext.every((item) => item.treatment === "COMPARISON_CONTEXT_ONLY"));
}

const activation = activationRegistry.flows["indianapolis:industrial_flex:bounded"];
assert(activation);
assert.equal(activation.activationEligible, true);
assert.equal(activation.certificationStatus, "certified_for_bounded_real_user_cohort");
assert.match(qaStatus.indianapolis.validationStatus, /legacy_compass_calibration_only/);
assert.match(qaStatus.indianapolis.notes, /not certified/);
const market = buildMarketReadiness().markets.find((item) => item.marketId === "indianapolis");
const industrial = market.propertyTypes.find((item) => item.propertyType === "industrial");
assert.equal(industrial.workloads.spaceTypeFit.status, "Ready");
assert.equal(industrial.workloads.calibration.status, "Ready");
assert.equal(industrial.workloads.certificationRelease.status, "Ready");
assert.equal(industrial.recommendation, "Building", "Market-wide readiness remains bounded by uncertified access; the controlled flow is certified separately");

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-indianapolis-industrial-flex-"));
function bundle(source, output) { execFileSync(path.join(__dirname, "..", "node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "..", source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, output)}`], { stdio: "pipe" }); return require(path.join(temp, output)); }
const shared = bundle("functions/api/location-brief-v2/_shared.js", "shared.cjs");
const renderer = bundle("functions/operator/location-brief-v2/[publicId].js", "renderer.cjs");
const renderedRequirement = scenarios[4][1];
const snapshot = { id: "snapshot", createdAt: "2026-09-03T00:00:00.000Z", ...shared.calculateSnapshot(renderedRequirement, { __indianapolisIndustrialFlexEnabled: true }) };
const record = { brief: { publicId: "LB2-000000000000000000000000", lifecycleStage: "LOCATIONS_RECOMMENDED", currentRequirementRevisionId: "revision", currentRecommendationSnapshotId: "snapshot" }, entryContext: { marketId: "indianapolis", city: "Indianapolis", propertyType: "industrial_flex", sourceType: "space_type" }, currentRevision: { id: "revision", revisionNumber: 1, requirement: renderedRequirement }, currentSnapshot: snapshot, candidates: [], revisions: [], snapshots: [] };
const html = renderer.renderLocationBriefV2Page(record, true, false, { publicExperience: true });
assert(html.includes("bounded City of Indianapolis Industrial/Flex comparison"));
assert(html.includes("Indianapolis Airport Logistics"));
assert(html.includes("Park 100 / Northwest Indianapolis"));
assert(html.includes("Park 100 Multi-Tenant Industrial/Flex Environment"));
assert(html.includes("Park Fletcher / Stout Field Industrial Environment"));
assert(html.includes("representative examples, not current availability"));
assert(!html.includes("558 Airtech"));
assert(snapshot.shortlist.every((item) => item.presentation.representativeBuildings.every((entry) => entry.availabilitySemantics === "REPRESENTATIVE_ONLY_NOT_AVAILABILITY" && entry.provenance.length)));
fs.rmSync(temp, { recursive: true, force: true });
console.log(`Indianapolis Industrial/Flex Recommendation QA passed: ${scenarios.length} calibrated cases, ${abstentions.length} abstentions, ${contexts.length} neutral entry contexts, real loading-only abstention, rendering, readiness, and default-deny registration verified.`);
