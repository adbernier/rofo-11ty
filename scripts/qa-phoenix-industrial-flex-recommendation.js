"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const foundation = require("../_data/phoenixIndustrialFlexEvidenceFoundation");
const adapter = require("../lib/requirements/requirement-to-phoenix-industrial-flex-recommendation");
const readiness = require("../lib/recommendations/private-recommendation-readiness");
const activationRegistry = require("../_data/recommendationActivationRegistry");
const qaStatus = require("../_data/recommendationQaStatus");
const { buildMarketReadiness } = require("../lib/eos/market-readiness");

const dependencies = {
  accessFoundation: require("../_data/sfAccessFoundationV0"), compositionFoundation: require("../_data/sfOfficeCompositionFoundation"), sfOfficeModel: require("../_data/sfOfficeRecommendationModel"), sfRetailFoundation: require("../_data/sfRetailCompositionFoundation"), sfIndustrialFlexFoundation: require("../_data/sfIndustrialFlexCompositionFoundation"), sanDiegoIndustrialFlexFoundation: require("../_data/sanDiegoIndustrialFlexCompositionFoundation"), northOrangeCountyIndustrialFlexFoundation: require("../_data/northOrangeCountyIndustrialFlexEvidenceFoundation"), phoenixIndustrialFlexFoundation: foundation, districtGeography: require("../_data/requirementPrototypeDistrictGeography"), phoenixIndustrialFlexEnabled: true,
};
function requirement(id, activities, summary, candidates = [], marketId = "phoenix-metro", propertyType = "industrial_flex", criteria = []) {
  const city = ["phoenix", "phoenix-metro"].includes(marketId) ? "Phoenix" : marketId[0].toUpperCase() + marketId.slice(1);
  return { id, schemaVersion: "requirement:v1", propertyTypes: [propertyType], activities, businessContext: { summary }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, city, displayName: `${city}, AZ` }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates } }, criteria };
}
const ids = (result) => result.shortlist.map((item) => item.districtId);
const evaluate = (item) => readiness.evaluateRecommendationReadiness(item, dependencies);
const cases = [
  ["conventional-warehouse", requirement("conventional-warehouse", ["store", "receive"], "Conventional Industrial warehouse and storage operation"), "industrial", "southwest-phoenix-industrial"],
  ["distribution", requirement("distribution", ["receive", "ship_distribute"], "Distribution and logistics operation"), "industrial", "southwest-phoenix-industrial"],
  ["broader-industrial", requirement("broader-industrial", ["store", "operate_vehicles"], "Larger broader conventional Industrial operation"), "industrial", "southwest-phoenix-industrial"],
  ["contractor-service", requirement("contractor-service", ["dispatch", "repair_service"], "Central contractor/service Industrial operation"), "industrial", "airport-south-central-industrial"],
  ["lighter-warehouse", requirement("lighter-warehouse", ["store"], "Smaller-format lighter warehouse under 2,500 SF"), "industrial", "airport-south-central-industrial"],
  ["office-production", requirement("office-production", ["work", "make_assemble"], "Office-production and light assembly operation"), "mixed", "airport-south-central-industrial"],
  ["lighter-flex", requirement("lighter-flex", ["work", "repair_service"], "Smaller-format lighter Flex service operation"), "flex", "airport-south-central-industrial"],
  ["technical", requirement("technical", ["research", "prototype"], "Technical operations and engineering workspace"), "flex", "north-phoenix-advanced-operations"],
  ["engineering-production", requirement("engineering-production", ["research", "prototype", "make_assemble"], "Engineering R&D-production hybrid"), "mixed", "north-phoenix-advanced-operations"],
  ["office-warehouse", requirement("office-warehouse", ["work", "store"], "Office + warehouse operating mix"), "mixed", "southwest-phoenix-industrial"],
  ["contractor-production", requirement("contractor-production", ["work", "dispatch", "repair_service", "make_assemble"], "Central contractor/service office-production mix"), "mixed", "airport-south-central-industrial"],
];
for (const [name, input, mode, expectedLeader] of cases) {
  const projection = adapter.projectRequirementToPhoenixIndustrialFlexRecommendation(input);
  assert.equal(projection.resolverInput.mode, mode, `${name} intent`);
  assert.equal(projection.comparisonContext.treatment, "COMPARISON_CONTEXT_ONLY");
  const result = evaluate(input);
  assert.notEqual(result.readiness, "INVESTIGATE", `${name} should resolve`);
  assert.equal(ids(result)[0], expectedLeader, `${name} leader`);
  assert(result.shortlist.length >= 1 && result.shortlist.length <= 3);
  assert(result.shortlist.every((item) => foundation.evidenceCandidateIds.includes(item.districtId) && item.environment.matchedTraits.length));
  if (!/technical|engineering/.test(name)) assert(!ids(result).includes("north-phoenix-advanced-operations"), `${name} must not pull North Phoenix without technical evidence`);
}
const oneSouthwest = evaluate(cases[0][1]);
assert.equal(oneSouthwest.readiness, "BOUNDED");
assert.equal(oneSouthwest.productResponse.heading, "Starting point worth investigating");
const multi = evaluate(requirement("multi-peer", ["work", "dispatch", "store"], "Contractor/service office and storage operation"));
assert(multi.shortlist.length >= 2, "A supported hybrid can present multiple peers");
assert.equal(multi.productResponse.heading, "Peer locations worth investigating");

const abstentions = [
  requirement("insufficient", [], "Industrial or Flex space"),
  requirement("capability", ["store"], "Warehouse where exact loading configuration, clear height, and power are required"),
  requirement("specialized", ["research", "make_assemble"], "Semiconductor fabrication clean-room with specialized ventilation"),
  requirement("access", ["dispatch"], "Employee commute and customer service territory must determine the location"),
  requirement("metro", ["store"], "Compare Phoenix Metro and the Valley-wide market"),
  requirement("tempe", ["store"], "Compare Tempe I-10 with Phoenix"),
  requirement("mesa", ["store"], "Warehouse", [], "mesa"),
  requirement("outside-candidate", ["store"], "Warehouse", ["tempe-i-10-industrial"]),
  requirement("conflict", ["ship_distribute", "operate_vehicles", "display_present", "host_visitors"], "Heavy operation with public visitors"),
];
for (const item of abstentions) { const result = evaluate(item); assert.equal(result.readiness, "INVESTIGATE", item.id); assert.equal(result.shortlist.length, 0); assert(result.intelligenceGaps.length); }

const neutralFacts = [["work", "make_assemble"], "Office-production and light assembly operation"];
const contexts = ["", "southwest-phoenix-industrial", "airport-south-central-industrial", "phoenix-airport-sky-harbor-area", "north-phoenix-advanced-operations", "deer-valley", "north-phoenix-tsmc-corridor"];
const neutralOrder = ids(evaluate(requirement("neutral-city", ...neutralFacts)));
for (const candidate of contexts) {
  const result = evaluate(requirement(`neutral-${candidate || "city"}`, ...neutralFacts, candidate ? [candidate] : []));
  assert.deepEqual(ids(result), neutralOrder, `${candidate || "Phoenix city"} must be neutral`);
  assert(result.composition.candidateContext.every((item) => item.treatment === "COMPARISON_CONTEXT_ONLY"));
}

const activation = activationRegistry.flows["phoenix:industrial_flex:bounded"];
assert(activation);
assert.equal(activation.activationEligible, true);
assert.equal(activation.certificationStatus, "certified_for_bounded_real_user_cohort");
assert.match(qaStatus["phoenix-metro"].validationStatus, /legacy_compass/);
assert.match(qaStatus["phoenix-metro"].notes, /Phoenix Metro.*not certified/);
const phoenixReadiness = buildMarketReadiness().markets.find((item) => item.marketId === "phoenix-metro");
const industrialReadiness = phoenixReadiness.propertyTypes.find((item) => item.propertyType === "industrial");
assert.equal(industrialReadiness.workloads.spaceTypeFit.status, "Ready");
assert.equal(industrialReadiness.workloads.calibration.status, "Ready");
assert.equal(industrialReadiness.workloads.certificationRelease.status, "Ready");
assert.notEqual(industrialReadiness.recommendation, "Ready", "City certification must not mark Phoenix Metro generally recommendation-ready");

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-phoenix-industrial-flex-"));
function bundle(source, output) { execFileSync(path.join(__dirname, "..", "node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "..", source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, output)}`], { stdio: "pipe" }); return require(path.join(temp, output)); }
const shared = bundle("functions/api/location-brief-v2/_shared.js", "shared.cjs");
const renderer = bundle("functions/operator/location-brief-v2/[publicId].js", "renderer.cjs");
const renderedRequirement = cases[7][1];
const snapshot = { id: "snapshot", createdAt: "2026-09-03T00:00:00.000Z", ...shared.calculateSnapshot(renderedRequirement, { __phoenixIndustrialFlexEnabled: true }) };
const record = { brief: { publicId: "LB2-000000000000000000000000", lifecycleStage: "LOCATIONS_RECOMMENDED", currentRequirementRevisionId: "revision", currentRecommendationSnapshotId: "snapshot" }, entryContext: { marketId: "phoenix", propertyType: "industrial_flex", sourceType: "district" }, currentRevision: { id: "revision", revisionNumber: 1, requirement: renderedRequirement }, currentSnapshot: snapshot, candidates: [], revisions: [], snapshots: [] };
const html = renderer.renderLocationBriefV2Page(record, true, false, { publicExperience: true });
assert(html.includes("bounded City of Phoenix Industrial/Flex comparison"));
assert(html.includes("North Phoenix Advanced Operations"));
assert(html.includes("Representative environments"));
assert(html.includes("Deer Valley Industrial/Flex Employment Environment"));
assert(html.includes("North Phoenix Semiconductor Manufacturing Ecosystem"));
assert(html.includes("representative examples, not current availability"));
assert(!html.includes("Tempe I-10"));
assert(snapshot.shortlist.every((item) => item.presentation.representativeBuildings.every((entry) => entry.availabilitySemantics === "REPRESENTATIVE_ONLY_NOT_AVAILABILITY" && entry.provenance.length)));
fs.rmSync(temp, { recursive: true, force: true });

console.log(`Phoenix Industrial/Flex Recommendation QA passed: ${cases.length} calibrated cases, ${abstentions.length} abstentions, ${contexts.length} neutral entry contexts, asymmetric participation, rendering, certified readiness, and default-deny registration verified.`);
