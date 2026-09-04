"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const foundation = require("../_data/sacramentoIndustrialFlexEvidenceFoundation");
const adapter = require("../lib/requirements/requirement-to-sacramento-industrial-flex-recommendation");
const readiness = require("../lib/recommendations/private-recommendation-readiness");
const activationRegistry = require("../_data/recommendationActivationRegistry");
const qaStatus = require("../_data/recommendationQaStatus");
const { buildMarketReadiness } = require("../lib/eos/market-readiness");

const dependencies = {
  accessFoundation: require("../_data/sfAccessFoundationV0"), compositionFoundation: require("../_data/sfOfficeCompositionFoundation"), sfOfficeModel: require("../_data/sfOfficeRecommendationModel"), sfRetailFoundation: require("../_data/sfRetailCompositionFoundation"), sfIndustrialFlexFoundation: require("../_data/sfIndustrialFlexCompositionFoundation"), sanDiegoIndustrialFlexFoundation: require("../_data/sanDiegoIndustrialFlexCompositionFoundation"), northOrangeCountyIndustrialFlexFoundation: require("../_data/northOrangeCountyIndustrialFlexEvidenceFoundation"), phoenixIndustrialFlexFoundation: require("../_data/phoenixIndustrialFlexEvidenceFoundation"), indianapolisIndustrialFlexFoundation: require("../_data/indianapolisIndustrialFlexEvidenceFoundation"), sacramentoIndustrialFlexFoundation: foundation, districtGeography: require("../_data/requirementPrototypeDistrictGeography"), sacramentoIndustrialFlexEnabled: true,
};
function requirement(id, activities, summary, candidates = [], marketId = "sacramento", city = "Sacramento", propertyType = "industrial_flex", criteria = []) { return { id, schemaVersion: "requirement:v1", propertyTypes: [propertyType], activities, businessContext: { summary }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, marketName: "Sacramento", city, state: "CA", displayName: city ? `${city}, CA` : "Sacramento, CA", source: "canonical_commercial_geography" }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates } }, criteria }; }
const ids = (result) => result.shortlist.map((item) => item.districtId);
const evaluate = (item) => readiness.evaluateRecommendationReadiness(item, dependencies);
const scenarios = [
  ["warehouse-distribution", requirement("warehouse-distribution", ["store", "receive", "ship_distribute"], "Conventional warehouse and distribution operation"), "industrial", ["northgate-north-market-industrial", "power-inn-industrial"]],
  ["manufacturing", requirement("manufacturing", ["make_assemble", "store"], "Manufacturing and production operation"), "industrial", ["power-inn-industrial"]],
  ["broader-industrial", requirement("broader-industrial", ["store", "operate_vehicles"], "Larger broader Industrial operating context"), "industrial", ["power-inn-industrial"]],
  ["heavier-contractor", requirement("heavier-contractor", ["dispatch", "repair_service", "operate_vehicles"], "Heavier contractor/service broader operating requirement"), "industrial", ["power-inn-industrial"]],
  ["lighter-warehouse", requirement("lighter-warehouse", ["store", "receive"], "Lighter warehouse under 2,500 SF in a multi-tenant operating format"), "industrial", ["northgate-north-market-industrial"]],
  ["contractor-service", requirement("contractor-service", ["dispatch", "repair_service"], "Lighter service-industrial contractor operation"), "industrial", ["northgate-north-market-industrial"]],
  ["contractor-overlap", requirement("contractor-overlap", ["dispatch", "repair_service"], "Contractor/service operation"), "industrial", ["northgate-north-market-industrial", "power-inn-industrial"]],
  ["office-warehouse", requirement("office-warehouse", ["work", "store"], "Office/warehouse operating requirement"), "mixed", ["northgate-north-market-industrial", "power-inn-industrial"]],
  ["lighter-flex", requirement("lighter-flex", ["work", "repair_service"], "Smaller-format lighter Flex under 2,500 SF"), "flex", ["northgate-north-market-industrial"]],
  ["mixed-both", requirement("mixed-both", ["work", "store", "dispatch"], "Contractor/service office/warehouse operating mix"), "mixed", ["northgate-north-market-industrial", "power-inn-industrial"]],
];
for (const [name, input, mode, expected] of scenarios) {
  const projection = adapter.projectRequirementToSacramentoIndustrialFlexRecommendation(input);
  assert.equal(projection.resolverInput.mode, mode, `${name} intent`);
  assert.equal(projection.comparisonContext.treatment, "COMPARISON_CONTEXT_ONLY");
  const result = evaluate(input);
  assert.notEqual(result.readiness, "INVESTIGATE", `${name} should resolve`);
  assert.deepEqual(ids(result), expected, `${name} ordering`);
  assert(result.shortlist.every((item) => foundation.evidenceCandidateIds.includes(item.districtId) && item.environment.matchedTraits.length));
}
assert.equal(evaluate(scenarios[1][1]).readiness, "BOUNDED");
assert.equal(evaluate(scenarios[1][1]).productResponse.heading, "Starting point worth investigating");
assert.equal(evaluate(scenarios[0][1]).readiness, "FULL");
assert.equal(evaluate(scenarios[0][1]).productResponse.heading, "Peer locations worth investigating");

const abstentions = [
  requirement("insufficient", [], "Industrial or Flex space"),
  requirement("loading", ["store"], "Warehouse where exact loading configuration is decisive and required"),
  requirement("capability", ["store"], "Clear height, power, and yard are required and must determine the search"),
  requirement("access", ["ship_distribute"], "Freeway and airport access must determine the location"),
  requirement("metro", ["store"], "Compare Sacramento Metro and Greater Sacramento", [], "sacramento-metro", ""),
  requirement("west-sacramento", ["store"], "Compare West Sacramento", [], "west-sacramento", "West Sacramento"),
  requirement("rancho-cordova", ["store"], "Compare Rancho Cordova", [], "rancho-cordova", "Rancho Cordova"),
  requirement("outside-candidate", ["store"], "Warehouse", ["west-sacramento-industrial"]),
  requirement("specialized", ["make_assemble"], "Hazardous specialized manufacturing requiring permitted use"),
  requirement("format", ["store"], "Exact building format is required and decisive"),
  requirement("conflicting-use", ["ship_distribute", "operate_vehicles", "display_present", "host_visitors"], "Heavy operations with customer-facing activity"),
];
for (const item of abstentions) { const result = evaluate(item); assert.equal(result.readiness, "INVESTIGATE", item.id); assert.equal(result.shortlist.length, 0); assert(result.intelligenceGaps.length); }

const neutralFacts = [["work", "store"], "Office/warehouse operating requirement"];
const contexts = ["", "power-inn-industrial", "florin-perkins-industrial", "sci", "ramona", "sci-ramona-component", "northgate-north-market-industrial", "northgate-industrial-park", "northgate", "north-market-boulevard", "north-market"];
const neutralOrder = ids(evaluate(requirement("neutral-city", ...neutralFacts)));
for (const candidate of contexts) {
  const result = evaluate(requirement(`neutral-${candidate || "city"}`, ...neutralFacts, candidate ? [candidate] : []));
  assert.deepEqual(ids(result), neutralOrder, `${candidate || "Sacramento city"} must be neutral`);
  assert(result.composition.candidateContext.every((item) => item.treatment === "COMPARISON_CONTEXT_ONLY"));
}
assert.equal(adapter.CANDIDATE_OWNERS.sci, "power-inn-industrial");
assert.equal(adapter.CANDIDATE_OWNERS.ramona, "power-inn-industrial");
assert.equal(foundation.evidenceCandidateIds.length, 2);
assert(!foundation.evidenceCandidateIds.some((id) => /sci|ramona|natomas/.test(id)));

const activation = activationRegistry.flows["sacramento:industrial_flex:bounded"];
assert(activation);
assert.equal(activation.activationEligible, true);
assert.equal(activation.certificationStatus, "certified_for_bounded_real_user_cohort");
assert.match(qaStatus.sacramento.validationStatus, /level3_certified/);
assert.match(qaStatus.sacramento.notes, /not certified/);
const market = buildMarketReadiness().markets.find((item) => item.marketId === "sacramento");
const industrial = market.propertyTypes.find((item) => item.propertyType === "industrial");
assert.equal(industrial.workloads.spaceTypeFit.status, "Ready");
assert.equal(industrial.workloads.calibration.status, "Ready");
assert.equal(industrial.workloads.certificationRelease.status, "Ready");
assert.equal(require("../_data/marketReadinessFoundations").foundations.find((item) => item.marketId === "sacramento" && item.propertyType === "industrial").certificationRelease.status, "Ready");

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-sacramento-industrial-flex-"));
function bundle(source, output) { execFileSync(path.join(__dirname, "..", "node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "..", source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, output)}`], { stdio: "pipe" }); return require(path.join(temp, output)); }
const shared = bundle("functions/api/location-brief-v2/_shared.js", "shared.cjs");
const renderer = bundle("functions/operator/location-brief-v2/[publicId].js", "renderer.cjs");
const renderedRequirement = scenarios[6][1];
const snapshot = { id: "snapshot", createdAt: "2026-09-03T00:00:00.000Z", ...shared.calculateSnapshot(renderedRequirement, { __sacramentoIndustrialFlexEnabled: true }) };
const record = { brief: { publicId: "LB2-000000000000000000000000", lifecycleStage: "LOCATIONS_RECOMMENDED", currentRequirementRevisionId: "revision", currentRecommendationSnapshotId: "snapshot" }, entryContext: { marketId: "sacramento", city: "Sacramento", propertyType: "industrial_flex", sourceType: "space_type" }, currentRevision: { id: "revision", revisionNumber: 1, requirement: renderedRequirement }, currentSnapshot: snapshot, candidates: [], revisions: [], snapshots: [] };
const html = renderer.renderLocationBriefV2Page(record, true, false, { publicExperience: true });
assert(html.includes("bounded City of Sacramento Industrial/Flex comparison"));
assert(html.includes("Power Inn Industrial"));
assert(html.includes("Northgate / North Market Industrial"));
assert(html.includes("Northgate / North Market Industrial Environment"));
assert(html.includes("representative examples, not current availability"));
for (const excluded of ["3100 Ramco", "2928 Ramco", "3380 Industrial", "11201 Sun Center", "11353 Pyrites"]) assert(!html.includes(excluded));
assert(snapshot.shortlist.every((item) => item.presentation.representativeBuildings.every((entry) => entry.availabilitySemantics === "REPRESENTATIVE_ONLY_NOT_AVAILABILITY" && entry.provenance.length)));
fs.rmSync(temp, { recursive: true, force: true });
console.log(`Sacramento Industrial/Flex Recommendation QA passed: ${scenarios.length} calibrated cases, ${abstentions.length} abstentions, ${contexts.length} neutral City/component entry contexts, rendering, certified bounded readiness, and evidence containment verified.`);
