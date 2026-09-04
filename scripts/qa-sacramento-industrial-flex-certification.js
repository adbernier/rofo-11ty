"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const registry = require("../_data/recommendationActivationRegistry");
const commercialGeography = require("../_data/commercialGeography");

const ROOT = path.join(__dirname, "..");
const KEY = "sacramento:industrial_flex:bounded";
const PREFLIGHT = process.env.SACRAMENTO_CERTIFICATION_PREFLIGHT === "true";
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-sacramento-certification-"));
function bundle(source, output) {
  execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, output)}`], { stdio: "pipe" });
  return require(path.join(temp, output));
}
const api = bundle("functions/api/location-brief-v2/_shared.js", "shared.cjs");
const publicRoute = bundle("functions/location-brief/[publicId].js", "public-route.cjs");
const createRoute = bundle("functions/api/location-brief-v2/create.js", "create-route.cjs");

class MemoryKv {
  constructor() { this.values = new Map(); }
  async put(key, value) { this.values.set(key, value); }
  async get(key, type) { const value = this.values.get(key); return type === "json" && value ? JSON.parse(value) : value || null; }
}
class ActivationDb {
  constructor(row = null) { this.row = row; this.reads = 0; }
  prepare() { return { bind: () => ({ first: async () => { this.reads += 1; return this.row; } }) }; }
}
function requirement(id, activities, summary, candidates = [], marketId = "sacramento", city = "", criteria = [], propertyType = "industrial_flex") {
  return { id, schemaVersion: "requirement:v1", propertyTypes: [propertyType], activities, businessContext: { summary }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, marketName: "Sacramento", city, state: "CA", displayName: city ? `${city}, CA` : "Sacramento, CA", source: "canonical_commercial_geography" }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates } }, criteria };
}
function context(candidate = "", marketId = "sacramento", city = "", propertyType = "industrial_flex", sourceType = candidate ? "district" : "space_type") {
  return { sourceType, sourcePath: candidate ? `/commercial-real-estate/CA/sacramento/${candidate}/` : "/commercial-real-estate/CA/sacramento/industrial-space/", marketId, city, propertyType, candidateDistrictIds: candidate ? [candidate] : [], candidateDistrictNames: candidate ? [candidate] : [] };
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
  const selection = canonicalMarketSuggestions(commercialGeography.markets, "Sacramento", 10).find((item) => item.marketId === "sacramento");
  assert.deepEqual({ marketId: selection.marketId, city: selection.city, state: selection.state }, { marketId: "sacramento", city: "", state: "CA" });
  const productionShape = requirement("production-shape", ["store", "receive"], "Warehouse operation");
  assert.equal(api.isSacramentoIndustrialFlexRequirement(productionShape), true);

  const env = { LOCATION_BRIEFS_KV: new MemoryKv(), __sacramentoIndustrialFlexCertificationEnabled: true };
  const scenarios = [
    ["warehouse-overlap", ["store", "receive", "ship_distribute"], "Conventional warehouse and distribution operation", "", ["northgate-north-market-industrial", "power-inn-industrial"]],
    ["manufacturing", ["make_assemble", "store"], "Manufacturing and production operation", "power-inn-industrial", ["power-inn-industrial"]],
    ["broader-industrial", ["store", "operate_vehicles"], "Larger broader Industrial operating context", "", ["power-inn-industrial"]],
    ["heavier-contractor", ["dispatch", "repair_service", "operate_vehicles"], "Heavier contractor/service broader operating requirement", "florin-perkins-industrial", ["power-inn-industrial"]],
    ["lighter-warehouse", ["store", "receive"], "Lighter warehouse under 2,500 SF in a multi-tenant operating format", "northgate", ["northgate-north-market-industrial"]],
    ["lighter-contractor", ["dispatch", "repair_service"], "Lighter service-industrial contractor operation", "north-market", ["northgate-north-market-industrial"]],
    ["contractor-overlap", ["dispatch", "repair_service"], "Contractor/service operation", "", ["northgate-north-market-industrial", "power-inn-industrial"]],
    ["office-warehouse", ["work", "store"], "Office/warehouse operating requirement", "northgate-north-market-industrial", ["northgate-north-market-industrial", "power-inn-industrial"]],
    ["lighter-flex", ["work", "repair_service"], "Smaller-format lighter Flex under 2,500 SF", "north-market-boulevard", ["northgate-north-market-industrial"]],
    ["mixed", ["work", "store", "dispatch"], "Contractor/service office/warehouse operating mix", "", ["northgate-north-market-industrial", "power-inn-industrial"]],
  ];
  const created = [];
  for (const [name, activities, summary, candidate, expected] of scenarios) {
    const result = await api.createBrief(env, requirement(name, activities, summary, candidate ? [candidate] : []), context(candidate));
    const stored = await api.getBriefBundle(env, result.brief.publicId, true);
    const html = await render(env, result);
    assert.deepEqual(order(result.snapshot), expected, `${name} ordering`);
    assert.deepEqual(order(stored.currentSnapshot), expected, `${name} persisted ordering`);
    assert.equal(stored.currentRevision.requirement.locationLogic.marketAnchor.marketId, "sacramento");
    assert.equal(result.snapshot.readiness, expected.length === 1 ? "BOUNDED" : "FULL", name);
    assert(html.includes(expected.length === 1 ? "Starting point worth investigating" : "Peer locations worth investigating"));
    assert(html.includes("bounded City of Sacramento Industrial/Flex comparison"));
    assert(html.includes("not a Sacramento Metro ranking"));
    assert(html.includes("representative examples, not current availability"));
    assert(/property investigation|property-level|property capabilities/i.test(html));
    assert.equal(html.match(/best Sacramento location|absolute winner|numerical score|lower rent|more available|better parking|better loading/i), null);
    assert(!/superior freeway|superior airport|best commute|known loading|known clear height|known power|yard available|permitted use confirmed/i.test(html));
    assert(result.snapshot.shortlist.every((item) => item.presentation.representativeBuildings.every((representative) => representative.availabilitySemantics === "REPRESENTATIVE_ONLY_NOT_AVAILABILITY" && representative.provenance.length && representative.propertyVerification)));
    created.push({ name, result, html });
  }

  assert.deepEqual(order(created.find((item) => item.name === "manufacturing").result.snapshot), ["power-inn-industrial"]);
  assert.deepEqual(order(created.find((item) => item.name === "lighter-flex").result.snapshot), ["northgate-north-market-industrial"]);
  assert.deepEqual(order(created.find((item) => item.name === "warehouse-overlap").result.snapshot), ["northgate-north-market-industrial", "power-inn-industrial"]);

  const representatives = created.flatMap((item) => item.result.snapshot.shortlist).flatMap((item) => item.presentation.representativeBuildings);
  const uniqueRepresentatives = [...new Map(representatives.map((item) => [item.name, item])).values()];
  assert.deepEqual(uniqueRepresentatives.map((item) => item.name).sort(), ["8583 Elder Creek Road", "5711 Florin Perkins Road", "1329 N Market Boulevard", "Northgate / North Market Industrial Environment"].sort());
  const environment = uniqueRepresentatives.find((item) => item.name === "Northgate / North Market Industrial Environment");
  assert.equal(environment.representativeKind, "COMMERCIAL_ENVIRONMENT");
  assert.equal(environment.canonicalUrl, null);
  const combinedHtml = created.map((item) => item.html).join("\n");
  for (const rejected of ["3100 Ramco", "2928 Ramco", "3380 Industrial Boulevard", "11201 Sun Center", "11353 Pyrites", "asking rent", "broker contact", "current suite size"]) assert(!combinedHtml.includes(rejected), rejected);
  assert(!combinedHtml.includes("SCI / Ramona</h3>"));

  const neutralFacts = [["work", "store"], "Office/warehouse operating requirement"];
  const contexts = ["", "power-inn-industrial", "florin-perkins-industrial", "sci", "ramona", "sci-ramona-component", "northgate-north-market-industrial", "northgate-industrial-park", "northgate", "north-market-boulevard", "north-market"];
  const neutralOrders = [];
  for (const candidate of contexts) {
    const result = await api.createBrief(env, requirement(`neutral-${candidate || "city"}`, ...neutralFacts, candidate ? [candidate] : []), context(candidate));
    const stored = await api.getBriefBundle(env, result.brief.publicId, true);
    const html = await render(env, result);
    neutralOrders.push(order(stored.currentSnapshot));
    assert(stored.currentSnapshot.comparison.every((item) => item.treatment === "COMPARISON_CONTEXT_ONLY"));
    assert(!html.includes("SCI / Ramona</h3>"));
    assert(!html.includes("Ramona</h3>"));
  }
  neutralOrders.slice(1).forEach((item) => assert.deepEqual(item, neutralOrders[0]));

  const abstentions = [
    requirement("insufficient", [], "Industrial or Flex space"),
    requirement("metro", ["store"], "Compare Sacramento Metro and the broader region", [], "sacramento-metro", ""),
    requirement("west", ["store"], "Compare West Sacramento", [], "west-sacramento", "West Sacramento"),
    requirement("rancho", ["store"], "Compare Rancho Cordova", [], "rancho-cordova", "Rancho Cordova"),
    requirement("unsupported", ["store"], "Warehouse operation", [], "elk-grove", "Elk Grove"),
    requirement("service-geography", ["dispatch"], "Employee, customer, supplier, and service territory geography is decisive"),
    requirement("access", ["ship_distribute"], "Freeway and airport access must determine the location"),
    requirement("loading", ["store"], "Exact loading configuration is required and dominates the search"),
    requirement("capabilities", ["store"], "Minimum clear height, required power, yard, and trailer parking dominate the search"),
    requirement("permitted", ["make_assemble"], "Permitted use is decisive for the operation"),
    requirement("hazard", ["make_assemble"], "Hazardous specialized manufacturing process"),
    requirement("building-format", ["store"], "Exact building format is required and decisive"),
    requirement("conflicting", ["ship_distribute", "operate_vehicles", "display_present", "host_visitors"], "Heavy operating and customer-facing requirement without a clear priority"),
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
    assert(!html.includes("Power Inn Industrial"));
    assert(!html.includes("Northgate / North Market Industrial"));
    assert(html.includes("Rofo has not produced a personalized local market ranking"));
    assert(html.includes("Find Spaces That Fit"));
  }

  const rejected = ["sacramento-metro", "west-sacramento", "rancho-cordova", "elk-grove", "roseville", "rocklin", "folsom", "citrus-heights", "stockton", "san-jose"];
  for (const marketId of rejected) assert.equal(api.isSacramentoIndustrialFlexEntryContext(context("", marketId)), false, marketId);
  assert.equal(api.isSacramentoIndustrialFlexEntryContext(context("", "sacramento", "", "office")), false);
  assert.equal(api.isSacramentoIndustrialFlexEntryContext(context("", "sacramento", "", "retail_service")), false);

  const negativeKv = new MemoryKv();
  const negativeEnv = { LOCATION_BRIEFS_KV: negativeKv, LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED: "true", LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES: "space_type" };
  const publicRequest = (req, entry) => new Request("https://www.rofo.com/api/location-brief-v2/create", { method: "POST", headers: { origin: "https://www.rofo.com", "content-type": "application/json" }, body: JSON.stringify({ creationRequestId: req.id, requirement: req, entryContext: entry }) });
  for (const [req, entry] of [[requirement("negative-west", ["store"], "Warehouse", [], "west-sacramento", "West Sacramento"), context("", "west-sacramento", "West Sacramento")], [requirement("negative-office", ["work"], "Office", [], "sacramento", "", [], "office"), context("", "sacramento", "", "office")], [requirement("negative-source", ["store"], "Warehouse"), context("", "sacramento", "", "industrial_flex", "unapproved")]]) {
    const response = await createRoute.onRequestPost({ request: publicRequest(req, entry), env: negativeEnv });
    assert.equal(response.status, 409);
  }
  assert.equal(negativeKv.values.size, 0, "Negative public eligibility must not persist a Brief");

  const flow = registry.flows[KEY];
  assert(flow);
  if (PREFLIGHT) {
    assert.equal(flow.certificationStatus, "implementation_complete_pending_certification");
    assert.equal(flow.activationEligible, false);
    const stray = new ActivationDb({ activation_key: KEY, market_id: "sacramento", property_type: "industrial_flex", cohort: "bounded", enabled: 1, certification_id: "sacramento-industrial-flex-v1" });
    const denied = await api.recommendationRuntimeActivationState({ RECOMMENDATION_ACTIVATIONS_DB: stray }, "sacramento", "industrial_flex");
    assert.deepEqual({ enabled: denied.enabled, reason: denied.reason, reads: stray.reads }, { enabled: false, reason: "FLOW_NOT_CERTIFIED_FOR_ACTIVATION", reads: 0 });
  } else {
    assert.equal(flow.certificationStatus, "certified_for_bounded_real_user_cohort");
    assert.equal(flow.activationEligible, true);
    const missing = new ActivationDb();
    const denied = await api.recommendationRuntimeActivationState({ RECOMMENDATION_ACTIVATIONS_DB: missing }, "sacramento", "industrial_flex");
    assert.deepEqual({ enabled: denied.enabled, reason: denied.reason, reads: missing.reads }, { enabled: false, reason: "MISSING_RUNTIME_RECORD", reads: 1 });
  }

  fs.rmSync(temp, { recursive: true, force: true });
  console.log(`Sacramento Industrial/Flex ${PREFLIGHT ? "certification preflight" : "certification"} QA passed: ${scenarios.length} realistic recommendation Briefs, ${abstentions.length} persisted abstentions, ${contexts.length} neutral EntryContexts, production geography, ownership-safe rendering, and runtime default-deny verified.`);
})().catch((error) => { fs.rmSync(temp, { recursive: true, force: true }); console.error(error); process.exit(1); });
