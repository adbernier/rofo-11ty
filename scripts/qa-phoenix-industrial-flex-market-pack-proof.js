"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const pack = require("../data/internal/industrial-flex-market-pack-proof/phoenix-industrial-flex-market-pack.json");
const proof = require("./lib/industrial-flex-market-pack-proof");
const foundation = require("../_data/phoenixIndustrialFlexEvidenceFoundation");
const adapter = require("../lib/requirements/requirement-to-phoenix-industrial-flex-recommendation");
const composer = require("../lib/recommendations/phoenix-industrial-flex-location-composition");
const readiness = require("../lib/recommendations/private-recommendation-readiness");

const dependencies = {
  accessFoundation: require("../_data/sfAccessFoundationV0"), compositionFoundation: require("../_data/sfOfficeCompositionFoundation"), sfOfficeModel: require("../_data/sfOfficeRecommendationModel"), sfRetailFoundation: require("../_data/sfRetailCompositionFoundation"), sfIndustrialFlexFoundation: require("../_data/sfIndustrialFlexCompositionFoundation"), sanDiegoIndustrialFlexFoundation: require("../_data/sanDiegoIndustrialFlexCompositionFoundation"), northOrangeCountyIndustrialFlexFoundation: require("../_data/northOrangeCountyIndustrialFlexEvidenceFoundation"), phoenixIndustrialFlexFoundation: foundation, indianapolisIndustrialFlexFoundation: require("../_data/indianapolisIndustrialFlexEvidenceFoundation"), sacramentoIndustrialFlexFoundation: require("../_data/sacramentoIndustrialFlexEvidenceFoundation"), districtGeography: require("../_data/requirementPrototypeDistrictGeography"), phoenixIndustrialFlexEnabled: true,
};
const criterion = (dimension, text, status = "PREFERRED") => ({ dimension, status, value: { text, number: null, boolean: null, list: [] } });
function requirement(id, activities, summary, candidates = [], options = {}) {
  const marketId = options.marketId || "phoenix-metro", city = options.city === undefined ? "Phoenix" : options.city, propertyType = options.propertyType || "industrial_flex";
  return { id, schemaVersion: "requirement:v1", propertyTypes: [propertyType], activities, businessContext: { summary }, sizeCapacity: { summary: options.size || "" }, locationLogic: { summary: options.location || "", marketAnchor: { marketId, geographyId: marketId, marketName: marketId === "phoenix-metro" ? "Phoenix Metro" : city, city, state: "AZ", displayName: city ? `${city}, AZ` : "Phoenix Metro, AZ", source: "canonical_commercial_geography" }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates } }, criteria: options.criteria || [] };
}

const decisionCases = [
  requirement("conventional-warehouse", ["store", "receive"], "Conventional Industrial warehouse and storage operation"),
  requirement("distribution", ["receive", "ship_distribute"], "Distribution and logistics operation"),
  requirement("broader-industrial", ["store", "operate_vehicles"], "Larger broader conventional Industrial operation"),
  requirement("contractor-service", ["dispatch", "repair_service"], "Central contractor/service Industrial operation"),
  requirement("lighter-warehouse", ["store"], "Smaller-format lighter warehouse under 2,500 SF"),
  requirement("office-production", ["work", "make_assemble"], "Office-production and light assembly operation"),
  requirement("lighter-flex", ["work", "repair_service"], "Smaller-format lighter Flex service operation"),
  requirement("technical", ["research", "prototype"], "Technical operations and engineering workspace"),
  requirement("engineering-production", ["research", "prototype", "make_assemble"], "Engineering R&D-production hybrid"),
  requirement("office-warehouse", ["work", "store"], "Office + warehouse operating mix"),
  requirement("contractor-production", ["work", "dispatch", "repair_service", "make_assemble"], "Central contractor/service office-production mix"),
  requirement("multi-peer", ["work", "dispatch", "store"], "Contractor/service office and storage operation"),
  requirement("service-distribution", ["receive", "dispatch", "repair_service"], "Local service distribution and repair operation"),
  requirement("aerospace", ["research", "work"], "Aerospace-support technical workspace"),
  requirement("production-ecosystem", ["research", "make_assemble"], "Engineering operation seeking an advanced-manufacturing production ecosystem"),
  requirement("conflict-exempt-showroom", ["ship_distribute", "operate_vehicles", "display_present", "host_visitors"], "Customer-facing operational showroom and distribution use"),
  requirement("preferred-feature", ["store", "receive"], "Conventional warehouse operation", [], { criteria: [criterion("industrial.loading.grade_level", "Grade-level loading would be helpful", "PREFERRED")] }),
  requirement("required-feature", ["dispatch", "repair_service"], "Central contractor/service Industrial operation", [], { criteria: [criterion("industrial.site.service_vehicles", "Service vehicles", "REQUIRED")] }),
  requirement("compatibility-entry", ["store", "receive"], "Conventional warehouse operation", [], { marketId: "phoenix", city: "" }),
  requirement("alias-airport", ["work", "make_assemble"], "Office-production and light assembly operation", ["phoenix-airport-sky-harbor-area"]),
  requirement("alias-deer-valley", ["research", "prototype"], "Technical operations and engineering workspace", ["deer-valley"]),
  requirement("alias-tsmc", ["research", "prototype", "make_assemble"], "Engineering R&D-production hybrid", ["north-phoenix-tsmc-corridor"]),
  requirement("insufficient", [], "Industrial or Flex space"),
  requirement("capability", ["store"], "Warehouse where exact loading configuration, clear height, and power are required"),
  requirement("specialized", ["research", "make_assemble"], "Semiconductor fabrication clean-room with specialized ventilation"),
  requirement("access", ["dispatch"], "Employee commute and customer service territory must determine the location"),
  requirement("generic-metro", ["store"], "Warehouse", [], { marketId: "phoenix-metro", city: "" }),
  requirement("wrong-metro-city", ["store"], "Warehouse", [], { marketId: "phoenix-metro", city: "Mesa" }),
  requirement("tempe-text", ["store"], "Compare Tempe I-10 with Phoenix"),
  requirement("mesa-market", ["store"], "Warehouse", [], { marketId: "mesa", city: "Mesa" }),
  requirement("outside-candidate", ["store"], "Warehouse", ["tempe-i-10-industrial"]),
  requirement("conflict", ["ship_distribute", "operate_vehicles", "display_present", "host_visitors"], "Heavy operation with public visitors"),
  requirement("unsupported-property", ["work"], "Office", [], { propertyType: "office" }),
];
for (const candidate of ["", "southwest-phoenix-industrial", "airport-south-central-industrial", "phoenix-airport-sky-harbor-area", "north-phoenix-advanced-operations", "deer-valley", "north-phoenix-tsmc-corridor"]) decisionCases.push(requirement(`neutral-${candidate || "city"}`, ["work", "make_assemble"], "Office-production and light assembly operation", candidate ? [candidate] : []));

function normalize(value) { return JSON.parse(JSON.stringify(value, (key, item) => ["version", "adapterVersion", "orderingPolicy"].includes(key) ? undefined : item)); }
function decisionSlice(composition) { return normalize({ supported: composition.supported, projection: composition.projection, resolvedModel: composition.resolvedModel, considered: composition.considered, shortlist: composition.shortlist, candidateContext: composition.candidateContext, modelResults: composition.modelResults }); }
function readinessExpected(composition) { if (!composition.supported || composition.projection?.abstention) return "INVESTIGATE"; return composition.shortlist.length === 1 ? "BOUNDED" : "FULL"; }

const fingerprints = [];
for (const input of decisionCases) {
  const currentProjection = adapter.projectRequirementToPhoenixIndustrialFlexRecommendation(input);
  const packProjection = proof.projectRequirement(pack, input);
  assert.deepEqual(normalize(packProjection), normalize(currentProjection), `${input.id}: Requirement projection differs`);
  const currentComposition = composer.composeLocationRecommendations(input, foundation);
  const packComposition = proof.composeLocationRecommendations(pack, input, foundation);
  assert.deepEqual(decisionSlice(packComposition), decisionSlice(currentComposition), `${input.id}: composition differs`);
  const currentReadiness = readiness.evaluateRecommendationReadiness(input, dependencies);
  assert.equal(readinessExpected(packComposition), currentReadiness.readiness, `${input.id}: readiness differs`);
  assert.deepEqual(packComposition.shortlist.map(item => item.districtId), currentReadiness.shortlist.map(item => item.districtId), `${input.id}: shortlist/order differs`);
  assert.deepEqual(packComposition.shortlist.map(item => item.evidenceIds), currentReadiness.shortlist.map(item => item.evidenceIds), `${input.id}: provenance differs`);
  assert.deepEqual(packComposition.shortlist.map(item => item.representatives), currentReadiness.shortlist.map(item => item.representatives), `${input.id}: representative projection differs`);
  fingerprints.push({ id: input.id, readiness: currentReadiness.readiness, abstention: currentProjection.abstention?.code || null, shortlist: currentReadiness.shortlist.map(item => item.districtId), decision: decisionSlice(packComposition) });
}

const briefCases = [
  requirement("warehouse-distribution", ["store", "receive", "ship_distribute"], "Regional parts distributor seeking conventional warehouse storage, receiving, and outbound distribution space"),
  requirement("broader-industrial", ["store", "receive", "operate_vehicles"], "Larger conventional Industrial operation needing a broader operating environment", ["southwest-phoenix-industrial"]),
  requirement("industrial-office-warehouse", ["work", "store"], "Office + warehouse operating mix for an Industrial-led parts business"),
  requirement("contractor-service", ["dispatch", "repair_service"], "Central contractor/service Industrial base for technicians and equipment", ["airport-south-central-industrial"]),
  requirement("lighter-warehouse", ["store"], "Smaller-format lighter warehouse under 2,500 SF", ["phoenix-airport-sky-harbor-area"]),
  requirement("office-production", ["work", "make_assemble"], "Office-production operation with light assembly"),
  requirement("lighter-flex", ["work", "repair_service"], "Smaller-format lighter Flex service operation"),
  requirement("technical-operations", ["research", "prototype"], "Engineering and technical operations workspace", ["deer-valley"]),
  requirement("engineering-production", ["research", "prototype", "make_assemble"], "Engineering R&D-production hybrid", ["north-phoenix-tsmc-corridor"]),
  requirement("advanced-context", ["research", "work"], "Technical workspace seeking an advanced-manufacturing ecosystem context without specialized property requirements", ["north-phoenix-advanced-operations"]),
  requirement("mixed-contractor-production", ["work", "dispatch", "repair_service", "make_assemble"], "Central contractor/service office-production mix"),
];
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-phoenix-market-pack-proof-"));
const bundlePath = path.join(temp, "shared.cjs");
execFileSync(path.join(__dirname, "..", "node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "..", "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${bundlePath}`], { stdio: "pipe" });
const shared = require(bundlePath);
for (const input of briefCases) {
  const snapshot = shared.calculateSnapshot(input, { __phoenixIndustrialFlexEnabled: true });
  const packComposition = proof.composeLocationRecommendations(pack, input, foundation);
  assert.deepEqual(snapshot.shortlist.map(item => item.districtId), packComposition.shortlist.map(item => item.districtId), `${input.id}: Location Brief shortlist differs`);
  assert.deepEqual(snapshot.explanations, packComposition.shortlist.map(item => ({ districtId: item.districtId, districtName: item.districtName, strengths: item.strengths || [], tradeoffs: item.tradeoffs || [], unknowns: item.unknowns || [], employeeAccessSummary: item.accessComponent?.summary || "" })), `${input.id}: Location Brief explanation differs`);
  assert.deepEqual(snapshot.comparison, packComposition.candidateContext.map(item => ({ ...item, inShortlist: packComposition.shortlist.some(candidate => candidate.districtId === item.districtId) })), `${input.id}: Location Brief comparison context differs`);
  assert.equal(snapshot.foundationVersions.composition, pack.market.evidenceFoundation);
}
fs.rmSync(temp, { recursive: true, force: true });

assert.equal(pack.status, "TEST_ONLY_DEFAULT_OFF");
assert.equal(pack.certification.proofMode, "TEST_ONLY_NO_RUNTIME_INTEGRATION");
assert.deepEqual(pack.composition.candidateOrder, foundation.evidenceCandidateIds);
const hash = crypto.createHash("sha256").update(JSON.stringify(fingerprints)).digest("hex");
console.log(`Phoenix Industrial/Flex Market Pack proof QA passed: ${decisionCases.length} decision cases, ${briefCases.length} certified Brief snapshots, exact decision equivalence; sha256 ${hash}.`);
