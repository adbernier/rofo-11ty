"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const registry = require("../_data/recommendationActivationRegistry");
const commercialGeography = require("../_data/commercialGeography");

const ROOT = path.join(__dirname, "..");
const KEY = "phoenix:industrial_flex:bounded";
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-phoenix-certification-"));
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
function requirement(id, activities, summary, candidates = [], marketId = "phoenix-metro", city = "Phoenix", criteria = []) {
  return { id, schemaVersion: "requirement:v1", propertyTypes: ["industrial_flex"], activities, businessContext: { summary }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, marketName: marketId === "phoenix-metro" ? "Phoenix Metro" : city, city, state: "AZ", displayName: city ? `${city}, AZ` : "Phoenix Metro, AZ", source: "canonical_commercial_geography" }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates } }, criteria };
}
function context(candidate = "") { return { sourceType: candidate ? "district" : "space_type", sourcePath: candidate ? `/commercial-real-estate/AZ/phoenix/${candidate}/` : "/commercial-real-estate/AZ/phoenix/industrial-space/", marketId: "phoenix", propertyType: "industrial_flex", candidateDistrictIds: candidate ? [candidate] : [], candidateDistrictNames: candidate ? [candidate] : [] }; }
async function render(env, created) {
  const request = new Request(`http://localhost/location-brief/${created.brief.publicId}`, { headers: { cookie: created.setCookie.split(";")[0] } });
  const response = await publicRoute.onRequestGet({ request, env, params: { publicId: created.brief.publicId } });
  assert.equal(response.status, 200);
  return response.text();
}
const order = (snapshot) => snapshot.shortlist.map((item) => item.districtId);

(async () => {
  const flow = registry.flows[KEY];
  assert(flow);
  assert.equal(flow.certificationStatus, "certified_for_bounded_real_user_cohort");
  assert.equal(flow.activationEligible, true);
  const missing = new ActivationDb();
  const denied = await api.recommendationRuntimeActivationState({ RECOMMENDATION_ACTIVATIONS_DB: missing }, "phoenix", "industrial_flex");
  assert.deepEqual({ enabled: denied.enabled, reason: denied.reason, reads: missing.reads }, { enabled: false, reason: "MISSING_RUNTIME_RECORD", reads: 1 });

  const { canonicalMarketSuggestions } = await import(path.resolve(ROOT, "lib/requirements/requirement-input-controls-v1.mjs"));
  const phoenixSelection = canonicalMarketSuggestions(commercialGeography.markets, "Phoenix", 10).find((item) => item.city === "Phoenix");
  assert.deepEqual({ marketId: phoenixSelection.marketId, city: phoenixSelection.city, state: phoenixSelection.state }, { marketId: "phoenix-metro", city: "Phoenix", state: "AZ" });
  assert.equal(api.isPhoenixIndustrialFlexRequirement(requirement("production-shape", ["store"], "Warehouse")), true);
  assert.equal(api.isPhoenixIndustrialFlexRequirement(requirement("generic-metro", ["store"], "Warehouse", [], "phoenix-metro", "")), false);

  const env = { LOCATION_BRIEFS_KV: new MemoryKv(), __phoenixIndustrialFlexCertificationEnabled: true };
  const scenarios = [
    ["warehouse-distribution", ["store", "receive", "ship_distribute"], "Regional parts distributor seeking conventional warehouse storage, receiving, and outbound distribution space", "", "southwest-phoenix-industrial"],
    ["broader-industrial", ["store", "receive", "operate_vehicles"], "Larger conventional Industrial operation needing a broader operating environment", "southwest-phoenix-industrial", "southwest-phoenix-industrial"],
    ["industrial-office-warehouse", ["work", "store"], "Office + warehouse operating mix for an Industrial-led parts business", "", "southwest-phoenix-industrial"],
    ["contractor-service", ["dispatch", "repair_service"], "Central contractor/service Industrial base for technicians and equipment", "airport-south-central-industrial", "airport-south-central-industrial"],
    ["lighter-warehouse", ["store"], "Smaller-format lighter warehouse under 2,500 SF", "phoenix-airport-sky-harbor-area", "airport-south-central-industrial"],
    ["office-production", ["work", "make_assemble"], "Office-production operation with light assembly", "", "airport-south-central-industrial"],
    ["lighter-flex", ["work", "repair_service"], "Smaller-format lighter Flex service operation", "", "airport-south-central-industrial"],
    ["technical-operations", ["research", "prototype"], "Engineering and technical operations workspace", "deer-valley", "north-phoenix-advanced-operations"],
    ["engineering-production", ["research", "prototype", "make_assemble"], "Engineering R&D-production hybrid", "north-phoenix-tsmc-corridor", "north-phoenix-advanced-operations"],
    ["advanced-context", ["research", "work"], "Technical workspace seeking an advanced-manufacturing ecosystem context without specialized property requirements", "north-phoenix-advanced-operations", "north-phoenix-advanced-operations"],
    ["mixed-contractor-production", ["work", "dispatch", "repair_service", "make_assemble"], "Central contractor/service office-production mix", "", "airport-south-central-industrial"],
  ];
  const created = [];
  for (const [name, activities, summary, candidate, expectedLeader] of scenarios) {
    const result = await api.createBrief(env, requirement(name, activities, summary, candidate ? [candidate] : []), context(candidate));
    const stored = await api.getBriefBundle(env, result.brief.publicId, true);
    const html = await render(env, result);
    assert.notEqual(result.snapshot.readiness, "INVESTIGATE", `${name} should produce controlled guidance`);
    assert.equal(order(result.snapshot)[0], expectedLeader, `${name} ordering`);
    assert.deepEqual(order(stored.currentSnapshot), order(result.snapshot), `${name} persistence`);
    assert(html.includes(result.snapshot.shortlist.length === 1 ? "Starting point worth investigating" : "Peer locations worth investigating"));
    assert(html.includes("bounded City of Phoenix Industrial/Flex comparison"));
    assert(html.includes("not a Phoenix Metro or Valley-wide ranking"));
    assert(result.snapshot.shortlist.every((item) => item.strengths.some((value) => /^This Requirement aligns with reviewed/.test(value)) && item.environment.reasons.some((value) => /^This Requirement matches the reviewed/.test(value))));
    assert(html.includes("Why consider this location") || html.includes("Why it may fit your search"));
    assert(html.includes("representative examples, not current availability"));
    assert(/property investigation|property-level|property capabilities/i.test(html));
    assert(!/best market|absolute winner|recommended winner|numerical score/i.test(html));
    assert(!/superior airport|better freeway|best commute|strong employee access/i.test(html));
    assert(!/known loading|known clear height|known power|yard available|semiconductor-ready|clean-room ready/i.test(html));
    assert(result.snapshot.shortlist.every((item) => item.presentation.representativeBuildings.every((representative) => representative.availabilitySemantics === "REPRESENTATIVE_ONLY_NOT_AVAILABILITY" && representative.provenance.length && representative.propertyVerification)));
    if (!/technical|engineering|advanced/.test(name)) assert(!order(result.snapshot).includes("north-phoenix-advanced-operations"), `${name} must not include narrow North Phoenix context`);
    created.push({ name, result, html });
  }

  const one = created.find((item) => item.name === "warehouse-distribution");
  assert.equal(one.result.snapshot.readiness, "BOUNDED");
  assert.equal(one.result.snapshot.shortlist.length, 1);
  assert(one.html.includes("Starting point worth investigating"));
  const multiple = await api.createBrief(env, requirement("multiple", ["work", "dispatch", "store"], "Contractor/service office and storage operation"), context());
  const multipleHtml = await render(env, multiple);
  assert(multiple.snapshot.shortlist.length >= 2);
  assert(multipleHtml.includes("Peer locations worth investigating"));

  const allItems = [...created.flatMap((item) => item.result.snapshot.shortlist), ...multiple.snapshot.shortlist];
  const byId = (id) => allItems.find((item) => item.districtId === id);
  assert.deepEqual(byId("southwest-phoenix-industrial").presentation.representativeBuildings.map((item) => item.name), ["1002 S 56th Avenue"]);
  assert.deepEqual(byId("airport-south-central-industrial").presentation.representativeBuildings.map((item) => item.name), ["3241 E Washington Street", "Cotton Flex Center — 4625 E Cotton Center Boulevard"]);
  const northRepresentatives = byId("north-phoenix-advanced-operations").presentation.representativeBuildings;
  assert(northRepresentatives.every((item) => item.representativeKind === "COMMERCIAL_ENVIRONMENT"));
  for (const label of ["Deer Valley Industrial/Flex Employment Environment", "North Phoenix Semiconductor Manufacturing Ecosystem"]) {
    const html = created.find((item) => item.name === "technical-operations").html;
    assert(html.includes(`<article><strong>${label}</strong>`), `${label} must render as a non-linked environment`);
    assert(!html.includes(`<a href=` + `"${northRepresentatives.find((item) => item.name === label).canonicalUrl}"><strong>${label}</strong>`));
  }
  const combinedHtml = created.map((item) => item.html).join("\n");
  assert(!combinedHtml.includes("Tempe I-10"));
  assert(!/6840 S Harl|2130 S 7th|2325 S 7th/i.test(combinedHtml));

  const neutralFacts = [["work", "make_assemble"], "Office-production operation with light assembly"];
  const contexts = ["", "southwest-phoenix-industrial", "airport-south-central-industrial", "phoenix-airport-sky-harbor-area", "north-phoenix-advanced-operations", "deer-valley", "north-phoenix-tsmc-corridor"];
  const neutralOrders = [];
  for (const candidate of contexts) {
    const result = await api.createBrief(env, requirement(`neutral-${candidate || "city"}`, ...neutralFacts, candidate ? [candidate] : []), context(candidate));
    neutralOrders.push(order(result.snapshot));
    assert(result.snapshot.comparison.every((item) => item.treatment === "COMPARISON_CONTEXT_ONLY"));
  }
  neutralOrders.slice(1).forEach((item) => assert.deepEqual(item, neutralOrders[0]));

  const abstentions = [
    requirement("insufficient", [], "Industrial or Flex space"),
    requirement("metro", ["store"], "Compare Phoenix Metro and the Valley-wide market", [], "phoenix-metro", "Phoenix"),
    requirement("tempe", ["store"], "Compare Tempe I-10 with Phoenix"),
    requirement("mesa", ["store"], "Warehouse operation", [], "phoenix-metro", "Mesa"),
    requirement("access", ["dispatch"], "Employee origins, supplier geography, and service territory must determine the location"),
    requirement("loading", ["store"], "Exact loading configuration is required and dominates the search"),
    requirement("capabilities", ["store"], "Minimum clear height, required power, and required yard dominate the search"),
    requirement("permitted", ["make_assemble"], "Permitted use is decisive for the operation"),
    requirement("hazard", ["make_assemble"], "Hazardous process with specialized ventilation"),
    requirement("lab", ["research"], "Laboratory and clean-room dependency"),
    requirement("semiconductor", ["research", "make_assemble"], "Semiconductor fabrication requiring specialized manufacturing infrastructure"),
    requirement("conflict", ["ship_distribute", "operate_vehicles", "display_present", "host_visitors"], "Heavy operation with public visitors"),
  ];
  for (const input of abstentions) {
    const result = await api.createBrief(env, input, context());
    const stored = await api.getBriefBundle(env, result.brief.publicId, true);
    const html = await render(env, result);
    assert.equal(result.snapshot.readiness, "INVESTIGATE", input.id);
    assert.equal(result.snapshot.shortlist.length, 0);
    assert.equal(stored.brief.lifecycleStage, "LOCATION_INVESTIGATE");
    assert(!html.includes("Peer locations worth investigating"));
    assert(!html.includes("Starting point worth investigating"));
    assert(!html.includes("Southwest Phoenix Industrial"));
    assert(!html.includes("Airport / South Central Industrial"));
    assert(!html.includes("North Phoenix Advanced Operations"));
    assert(html.includes("Rofo has not produced a personalized local market ranking"));
    assert(html.includes("Find Spaces That Fit"));
  }

  const rejectedEntries = ["phoenix-metro", "greater-phoenix", "tempe", "mesa", "chandler", "scottsdale", "glendale", "goodyear", "avondale", "arizona"];
  for (const marketId of rejectedEntries) assert.equal(api.isPhoenixIndustrialFlexEntryContext({ marketId, propertyType: "industrial_flex" }), false, marketId);

  fs.rmSync(temp, { recursive: true, force: true });
  console.log(`Phoenix Industrial/Flex certification QA passed: ${scenarios.length} realistic recommendation Briefs, one multi-peer case, ${abstentions.length} persisted abstentions, ${contexts.length} neutral EntryContexts, canonical production geography, representative rendering, and certified default-OFF runtime state.`);
})().catch((error) => { fs.rmSync(temp, { recursive: true, force: true }); console.error(error); process.exit(1); });
