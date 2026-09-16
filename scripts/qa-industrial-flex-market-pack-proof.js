"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const pack = require("../data/internal/industrial-flex-market-pack-proof/sacramento-industrial-flex-market-pack.json");
const proof = require("./lib/industrial-flex-market-pack-proof");
const foundation = require("../_data/sacramentoIndustrialFlexEvidenceFoundation");
const adapter = require("../lib/requirements/requirement-to-sacramento-industrial-flex-recommendation");
const composer = require("../lib/recommendations/sacramento-industrial-flex-location-composition");
const readiness = require("../lib/recommendations/private-recommendation-readiness");

const dependencies = {
  accessFoundation: require("../_data/sfAccessFoundationV0"), compositionFoundation: require("../_data/sfOfficeCompositionFoundation"), sfOfficeModel: require("../_data/sfOfficeRecommendationModel"), sfRetailFoundation: require("../_data/sfRetailCompositionFoundation"), sfIndustrialFlexFoundation: require("../_data/sfIndustrialFlexCompositionFoundation"), sanDiegoIndustrialFlexFoundation: require("../_data/sanDiegoIndustrialFlexCompositionFoundation"), northOrangeCountyIndustrialFlexFoundation: require("../_data/northOrangeCountyIndustrialFlexEvidenceFoundation"), phoenixIndustrialFlexFoundation: require("../_data/phoenixIndustrialFlexEvidenceFoundation"), indianapolisIndustrialFlexFoundation: require("../_data/indianapolisIndustrialFlexEvidenceFoundation"), sacramentoIndustrialFlexFoundation: foundation, districtGeography: require("../_data/requirementPrototypeDistrictGeography"), sacramentoIndustrialFlexEnabled: true,
};
const criterion = (dimension, text, status = "PREFERRED") => ({ dimension, status, value: { text, number: null, boolean: null, list: [] } });
function requirement(id, activities, summary, candidates = [], options = {}) {
  const marketId = options.marketId || "sacramento", city = options.city === undefined ? "Sacramento" : options.city, propertyType = options.propertyType || "industrial_flex";
  return { id, schemaVersion: "requirement:v1", propertyTypes: [propertyType], activities, businessContext: { summary }, sizeCapacity: { summary: options.size || "" }, locationLogic: { summary: options.location || "", marketAnchor: { marketId, geographyId: marketId, marketName: "Sacramento", city, state: "CA", displayName: city ? `${city}, CA` : "Sacramento, CA", source: "canonical_commercial_geography" }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates } }, criteria: options.criteria || [] };
}
const cases = [
  requirement("warehouse-distribution", ["store", "receive", "ship_distribute"], "Conventional warehouse and distribution operation"),
  requirement("manufacturing", ["make_assemble", "store"], "Manufacturing and production operation"),
  requirement("broader-industrial", ["store", "operate_vehicles"], "Larger broader Industrial operating context"),
  requirement("heavier-contractor", ["dispatch", "repair_service", "operate_vehicles"], "Heavier contractor/service broader operating requirement"),
  requirement("lighter-warehouse", ["store", "receive"], "Lighter warehouse under 2,500 SF in a multi-tenant operating format"),
  requirement("contractor-service", ["dispatch", "repair_service"], "Lighter service-industrial contractor operation"),
  requirement("contractor-overlap", ["dispatch", "repair_service"], "Contractor/service operation", ["northgate", "florin-perkins-industrial"]),
  requirement("office-warehouse", ["work", "store"], "Office/warehouse operating requirement"),
  requirement("lighter-flex", ["work", "repair_service"], "Smaller-format lighter Flex under 2,500 SF"),
  requirement("mixed-both", ["work", "store", "dispatch"], "Contractor/service office/warehouse operating mix"),
  requirement("preferred-operation", ["store", "receive"], "Lighter warehouse under 2,500 SF in a multi-tenant operating format", [], { criteria: [criterion("industrial.loading.grade_level", "Grade-level loading would be helpful", "PREFERRED")] }),
  requirement("required-operation", ["dispatch", "repair_service"], "Lighter service-industrial contractor operation", [], { criteria: [criterion("industrial.site.service_vehicles", "Service vehicles", "REQUIRED")] }),
  requirement("unsupported-geography", ["store"], "Warehouse", ["west-sacramento-industrial"]),
  requirement("unresolved", [], "Industrial or Flex space"),
  requirement("property-capability", ["store"], "Exact loading configuration is required and decisive"),
  requirement("access-gap", ["ship_distribute"], "Freeway and airport access must determine the location"),
  requirement("specialized", ["make_assemble"], "Hazardous specialized manufacturing requiring permitted use"),
  requirement("conflicting-use", ["ship_distribute", "operate_vehicles", "display_present", "host_visitors"], "Heavy operations with customer-facing activity"),
];

function normalize(value) {
  return JSON.parse(JSON.stringify(value, (key, item) => ["version", "adapterVersion", "orderingPolicy"].includes(key) ? undefined : item));
}
function decisionSlice(composition) {
  return normalize({ supported: composition.supported, projection: composition.projection, resolvedModel: composition.resolvedModel, considered: composition.considered, shortlist: composition.shortlist, candidateContext: composition.candidateContext, modelResults: composition.modelResults });
}
function readinessExpected(composition) {
  if (!composition.supported || composition.projection?.abstention) return "INVESTIGATE";
  return composition.shortlist.length === 1 ? "BOUNDED" : "FULL";
}

const fingerprints = [];
for (const input of cases) {
  const currentProjection = adapter.projectRequirementToSacramentoIndustrialFlexRecommendation(input);
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

assert.equal(pack.status, "TEST_ONLY_DEFAULT_OFF");
assert.equal(pack.certification.proofMode, "TEST_ONLY_NO_RUNTIME_INTEGRATION");
assert.equal(pack.certification.activationKey, "sacramento:industrial_flex:bounded");
assert.equal(foundation.schemaVersion, pack.market.evidenceFoundation);
assert.deepEqual(pack.composition.candidateOrder, foundation.evidenceCandidateIds);

const briefCases = [
  requirement("sac-light-warehouse", ["store", "receive", "dispatch"], "Local parts distributor using a smaller warehouse for storage, receiving and daily dispatch.", [], { size: "Approximately 2,200 SF.", location: "A smaller multi-tenant warehouse and service setting within the City of Sacramento.", criteria: [criterion("industrial.site.service_vehicles", "Service vehicles", "REQUIRED"), criterion("industrial.loading.grade_level", "Grade-level loading would be helpful"), criterion("universal.access.parking_importance", "Parking would be helpful")] }),
  requirement("sac-production", ["make_assemble", "store"], "Light manufacturer combining production, assembly and materials storage.", [], { size: "Approximately 30,000 SF.", location: "A conventional production and industrial district within the City of Sacramento.", criteria: [criterion("industrial.operations.repair_production", "Production and assembly", "REQUIRED"), criterion("industrial.power.three_phase", "Three-phase power would be helpful"), criterion("industrial.access.truck_circulation", "Truck circulation")] }),
];
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-market-pack-proof-"));
const bundlePath = path.join(temp, "shared.cjs");
execFileSync(path.join(__dirname, "..", "node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "..", "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${bundlePath}`], { stdio: "pipe" });
const shared = require(bundlePath);
for (const input of briefCases) {
  const snapshot = shared.calculateSnapshot(input, { __sacramentoIndustrialFlexEnabled: true });
  const packComposition = proof.composeLocationRecommendations(pack, input, foundation);
  assert.deepEqual(snapshot.shortlist.map(item => item.districtId), packComposition.shortlist.map(item => item.districtId), `${input.id}: Location Brief shortlist differs`);
  assert.deepEqual(snapshot.explanations, packComposition.shortlist.map(item => ({ districtId: item.districtId, districtName: item.districtName, strengths: item.strengths || [], tradeoffs: item.tradeoffs || [], unknowns: item.unknowns || [], employeeAccessSummary: item.accessComponent?.summary || "" })), `${input.id}: Location Brief explanation differs`);
  assert.deepEqual(snapshot.comparison, packComposition.candidateContext, `${input.id}: Location Brief comparison context differs`);
  assert.equal(snapshot.foundationVersions.composition, pack.market.evidenceFoundation);
}
fs.rmSync(temp, { recursive: true, force: true });

const hash = crypto.createHash("sha256").update(JSON.stringify(fingerprints)).digest("hex");
console.log(`Industrial/Flex Market Pack proof QA passed: ${cases.length} decision cases, ${briefCases.length} certified Brief snapshots, exact decision equivalence; sha256 ${hash}.`);
