"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const registry = require("../_data/recommendationActivationRegistry");
const commercialGeography = require("../_data/commercialGeography");

const ROOT = path.join(__dirname, "..");
const KEY = "indianapolis:industrial_flex:bounded";
const PREFLIGHT = process.env.INDIANAPOLIS_CERTIFICATION_PREFLIGHT === "true";
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-indianapolis-certification-"));
function bundle(source, output) {
  execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, output)}`], { stdio: "pipe" });
  return require(path.join(temp, output));
}
const api = bundle("functions/api/location-brief-v2/_shared.js", "shared.cjs");
const publicRoute = bundle("functions/location-brief/[publicId].js", "public-route.cjs");

class MemoryKv {
  constructor() { this.values = new Map(); }
  async put(key, value) { this.values.set(key, value); }
  async get(key, type) { const value = this.values.get(key); return type === "json" && value ? JSON.parse(value) : value || null; }
}
class ActivationDb {
  constructor(row = null) { this.row = row; this.reads = 0; }
  prepare() { return { bind: () => ({ first: async () => { this.reads += 1; return this.row; } }) }; }
}
function requirement(id, activities, summary, candidates = [], marketId = "indianapolis", city = "", criteria = [], propertyType = "industrial_flex") {
  return { id, schemaVersion: "requirement:v1", propertyTypes: [propertyType], activities, businessContext: { summary }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, marketName: "Indianapolis", city, state: "IN", displayName: city ? `${city}, IN` : "Indianapolis Metro, IN", source: "canonical_commercial_geography" }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates } }, criteria };
}
function context(candidate = "", marketId = "indianapolis", propertyType = "industrial_flex") {
  return { sourceType: candidate ? "district" : "space_type", sourcePath: candidate ? `/commercial-real-estate/IN/indianapolis/${candidate}/` : "/commercial-real-estate/IN/indianapolis/industrial-space/", marketId, city: marketId === "indianapolis" ? "Indianapolis" : "", propertyType, candidateDistrictIds: candidate ? [candidate] : [], candidateDistrictNames: candidate ? [candidate] : [] };
}
async function render(env, created) {
  const request = new Request(`http://localhost/location-brief/${created.brief.publicId}`, { headers: { cookie: created.setCookie.split(";")[0] } });
  const response = await publicRoute.onRequestGet({ request, env, params: { publicId: created.brief.publicId } });
  assert.equal(response.status, 200);
  return response.text();
}
const order = (snapshot) => snapshot.shortlist.map((item) => item.districtId);

(async () => {
  const { canonicalMarketSuggestions } = await import(path.resolve(ROOT, "lib/requirements/requirement-input-controls-v1.mjs"));
  const selection = canonicalMarketSuggestions(commercialGeography.markets, "Indianapolis", 10).find((item) => item.marketId === "indianapolis");
  assert.deepEqual({ marketId: selection.marketId, city: selection.city, state: selection.state }, { marketId: "indianapolis", city: "", state: "IN" });
  const productionShape = requirement("production-shape", ["store", "receive"], "Warehouse operation");
  assert.equal(api.isIndianapolisIndustrialFlexRequirement(productionShape), true);

  const env = { LOCATION_BRIEFS_KV: new MemoryKv(), __indianapolisIndustrialFlexCertificationEnabled: true };
  const scenarios = [
    ["warehouse-distribution", ["store", "receive", "ship_distribute"], "Conventional warehouse and distribution operation", "", ["indianapolis-airport-logistics", "park-100-northwest-indianapolis"]],
    ["receiving-distribution", ["receive", "ship_distribute"], "Regional logistics-led receiving and distribution operation", "indianapolis-airport-logistics", ["indianapolis-airport-logistics"]],
    ["broader-industrial", ["store", "operate_vehicles"], "Larger operational broader Industrial use", "", ["indianapolis-airport-logistics"]],
    ["contractor-service", ["dispatch", "repair_service"], "Contractor/service Industrial operation", "park-100", ["park-100-northwest-indianapolis"]],
    ["office-warehouse", ["work", "store"], "Office/warehouse operating requirement", "", ["park-100-northwest-indianapolis", "indianapolis-airport-logistics"]],
    ["lighter-flex", ["work", "repair_service"], "Smaller-format lighter Flex under 2,500 SF", "park-100-northwest-indianapolis", ["park-100-northwest-indianapolis"]],
    ["mixed-office-operations", ["work", "dispatch", "store"], "Multi-tenant Flex contractor/service office and operations mix", "", ["park-100-northwest-indianapolis"]],
  ];
  const created = [];
  for (const [name, activities, summary, candidate, expected] of scenarios) {
    const result = await api.createBrief(env, requirement(name, activities, summary, candidate ? [candidate] : []), context(candidate));
    const stored = await api.getBriefBundle(env, result.brief.publicId, true);
    const html = await render(env, result);
    assert.deepEqual(order(result.snapshot), expected, `${name} ordering`);
    assert.deepEqual(order(stored.currentSnapshot), expected, `${name} persisted order`);
    assert.equal(stored.currentRevision.requirement.locationLogic.marketAnchor.marketId, "indianapolis");
    assert(html.includes(expected.length === 1 ? "Starting point worth investigating" : "Peer locations worth investigating"));
    assert(html.includes("bounded City of Indianapolis Industrial/Flex comparison"));
    assert(html.includes("not an Indianapolis Metro ranking"));
    assert(html.includes("representative examples, not current availability"));
    assert(/property investigation|property-level|property capabilities/i.test(html));
    const unsupportedPresentation = html.match(/best Indianapolis location|absolute winner|numerical score|lower rent|more available|better parking|better loading/i);
    assert.equal(unsupportedPresentation, null, `${name} leaked unsupported presentation: ${unsupportedPresentation?.[0] || ""}`);
    const airport = result.snapshot.shortlist.find((item) => item.districtId === "indianapolis-airport-logistics");
    if (airport) assert(airport.tradeoffs.some((item) => /context, not evidence.*superior airport/i.test(item)));
    assert(!/known loading|known clear height|known power|yard available|permitted use confirmed/i.test(html));
    assert(result.snapshot.shortlist.every((item) => item.presentation.representativeBuildings.every((representative) => representative.availabilitySemantics === "REPRESENTATIVE_ONLY_NOT_AVAILABILITY" && representative.provenance.length && representative.propertyVerification)));
    created.push({ name, result, html });
  }

  for (const name of ["receiving-distribution", "broader-industrial", "contractor-service", "lighter-flex", "mixed-office-operations"]) {
    const item = created.find((entry) => entry.name === name);
    assert.equal(item.result.snapshot.readiness, "BOUNDED", name);
    assert.equal(item.result.snapshot.shortlist.length, 1, name);
  }
  const overlap = created.find((item) => item.name === "warehouse-distribution");
  assert.equal(overlap.result.snapshot.readiness, "FULL");
  assert.equal(overlap.result.snapshot.shortlist.length, 2);

  const representatives = created.flatMap((item) => item.result.snapshot.shortlist).flatMap((item) => item.presentation.representativeBuildings);
  const uniqueRepresentatives = [...new Map(representatives.map((item) => [item.name, item])).values()];
  assert.deepEqual(uniqueRepresentatives.map((item) => item.name).sort(), ["4557 W Bradbury Avenue", "7601 Winton Drive", "Park 100 Multi-Tenant Industrial/Flex Environment", "Park Fletcher / Stout Field Industrial Environment"].sort());
  assert(uniqueRepresentatives.filter((item) => item.representativeKind === "COMMERCIAL_ENVIRONMENT").every((item) => !item.canonicalUrl));
  const combinedHtml = created.map((item) => item.html).join("\n");
  for (const rejected of ["558 Airtech Parkway", "Plainfield", "asking rent", "broker contact", "current suite size"]) assert(!combinedHtml.includes(rejected), rejected);

  const neutralFacts = [["work", "store"], "Office/warehouse operating requirement"];
  const contexts = ["", "indianapolis-airport-logistics", "park-fletcher", "stout-field", "park-100", "park-100-northwest-indianapolis"];
  const neutralOrders = [];
  for (const candidate of contexts) {
    const result = await api.createBrief(env, requirement(`neutral-${candidate || "city"}`, ...neutralFacts, candidate ? [candidate] : []), context(candidate));
    const stored = await api.getBriefBundle(env, result.brief.publicId, true);
    neutralOrders.push(order(stored.currentSnapshot));
    assert(stored.currentSnapshot.comparison.every((item) => item.treatment === "COMPARISON_CONTEXT_ONLY"));
  }
  neutralOrders.slice(1).forEach((item) => assert.deepEqual(item, neutralOrders[0]));

  const loadingCriterion = { dimension: "industrial.loading.form", value: { text: "Exact loading configuration is required and decisive", list: [] } };
  const abstentions = [
    requirement("real-loading-only", [], "Industrial/Flex Requirement with meaningful loading-related operational feature", [], "indianapolis", "", [loadingCriterion]),
    requirement("insufficient", [], "Industrial or Flex space"),
    requirement("metro", ["store"], "Compare Indianapolis Metro and the broader region", [], "indianapolis-metro", ""),
    requirement("plainfield", ["store"], "Compare Plainfield with Indianapolis", [], "plainfield", "Plainfield"),
    requirement("unsupported-city", ["store"], "Warehouse operation", [], "carmel", "Carmel"),
    requirement("access", ["ship_distribute"], "Airport and interstate access must determine the location"),
    requirement("service-geography", ["dispatch"], "Employee, customer, supplier, and service territory geography is decisive"),
    requirement("loading", ["store"], "Exact loading configuration is required and dominates the search"),
    requirement("capabilities", ["store"], "Minimum clear height, required power, yard, and trailer parking dominate the search"),
    requirement("permitted", ["make_assemble"], "Permitted use is decisive for the operation"),
    requirement("hazard", ["make_assemble"], "Hazardous specialized manufacturing process"),
    requirement("building-format", ["store"], "Exact building format is required and decisive"),
  ];
  for (const input of abstentions) {
    const result = await api.createBrief(env, input, context());
    const stored = await api.getBriefBundle(env, result.brief.publicId, true);
    const html = await render(env, result);
    assert.equal(result.snapshot.readiness, "INVESTIGATE", input.id);
    assert.equal(result.snapshot.shortlist.length, 0, input.id);
    assert.equal(stored.brief.lifecycleStage, "LOCATION_INVESTIGATE", input.id);
    assert(!html.includes("Peer locations worth investigating"));
    assert(!html.includes("Starting point worth investigating"));
    assert(!html.includes("Indianapolis Airport Logistics"));
    assert(!html.includes("Park 100 / Northwest Indianapolis"));
    assert(html.includes("Rofo has not produced a personalized local market ranking"));
    assert(html.includes("Find Spaces That Fit"));
  }

  const rejected = ["indianapolis-metro", "plainfield", "whitestown", "lebanon", "brownsburg", "greenwood", "carmel", "fishers", "fort-wayne", "chicago"];
  for (const marketId of rejected) assert.equal(api.isIndianapolisIndustrialFlexEntryContext(context("", marketId)), false, marketId);
  assert.equal(api.isIndianapolisIndustrialFlexEntryContext(context("", "indianapolis", "office")), false);
  assert.equal(api.isIndianapolisIndustrialFlexEntryContext(context("", "indianapolis", "retail_service")), false);

  const flow = registry.flows[KEY];
  assert(flow);
  if (PREFLIGHT) {
    assert.equal(flow.certificationStatus, "implementation_complete_pending_certification");
    assert.equal(flow.activationEligible, false);
    const stray = new ActivationDb({ activation_key: KEY, market_id: "indianapolis", property_type: "industrial_flex", cohort: "bounded", enabled: 1, certification_id: "indianapolis-industrial-flex-v1" });
    const denied = await api.recommendationRuntimeActivationState({ RECOMMENDATION_ACTIVATIONS_DB: stray }, "indianapolis", "industrial_flex");
    assert.equal(denied.enabled, false);
    assert.equal(denied.reason, "FLOW_NOT_CERTIFIED_FOR_ACTIVATION");
    assert.equal(stray.reads, 0);
  } else {
    assert.equal(flow.certificationStatus, "certified_for_bounded_real_user_cohort");
    assert.equal(flow.activationEligible, true);
    const missing = new ActivationDb();
    const denied = await api.recommendationRuntimeActivationState({ RECOMMENDATION_ACTIVATIONS_DB: missing }, "indianapolis", "industrial_flex");
    assert.deepEqual({ enabled: denied.enabled, reason: denied.reason, reads: missing.reads }, { enabled: false, reason: "MISSING_RUNTIME_RECORD", reads: 1 });
  }

  fs.rmSync(temp, { recursive: true, force: true });
  console.log(`Indianapolis Industrial/Flex ${PREFLIGHT ? "certification preflight" : "certification"} QA passed: ${scenarios.length} realistic recommendation Briefs, ${abstentions.length} persisted abstentions, ${contexts.length} neutral EntryContexts, production geography, representative rendering, and runtime default-deny verified.`);
})().catch((error) => { fs.rmSync(temp, { recursive: true, force: true }); console.error(error); process.exit(1); });
