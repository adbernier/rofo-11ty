"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const registry = require("../_data/recommendationActivationRegistry");

const ROOT = path.join(__dirname, "..");
const KEY = "north-orange-county:industrial_flex:bounded";
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-north-oc-certification-"));
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
class EmptyDb {
  prepare() { return { bind: () => ({ first: async () => null }) }; }
}
function requirement(id, activities, summary, marketId = "anaheim", candidates = [], criteria = []) {
  return {
    id, schemaVersion: "requirement:v1", propertyTypes: ["industrial_flex"], activities,
    businessContext: { summary },
    locationLogic: {
      marketAnchor: { marketId, geographyId: marketId, displayName: marketId === "anaheim" ? "Anaheim" : marketId === "fullerton" ? "Fullerton" : marketId },
      specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates },
    },
    criteria,
  };
}
function context(marketId = "anaheim", candidates = []) {
  return { sourceType: candidates.length ? "district_page" : "city_page", marketId, propertyType: "industrial_flex", candidateDistrictIds: candidates, landingPage: candidates.length ? `/commercial-real-estate/CA/${marketId}/${candidates[0]}/` : `/commercial-real-estate/CA/${marketId}/` };
}
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
  const defaultRuntime = await api.recommendationRuntimeActivationState({ RECOMMENDATION_ACTIVATIONS_DB: new EmptyDb() }, "north-orange-county", "industrial_flex");
  assert.deepEqual({ enabled: defaultRuntime.enabled, reason: defaultRuntime.reason }, { enabled: false, reason: "MISSING_RUNTIME_RECORD" });

  const env = { LOCATION_BRIEFS_KV: new MemoryKv(), __northOrangeCountyIndustrialFlexCertificationEnabled: true };
  const scenarios = [
    ["warehouse-distribution", ["store", "receive", "ship_distribute"], "Commercial parts distributor seeking conventional warehouse, receiving, storage, and outbound distribution space", "anaheim", ["anaheim-canyon"]],
    ["light-manufacturing", ["make_assemble", "store"], "Small manufacturer seeking light assembly and supporting materials storage", "anaheim", ["anaheim-canyon"]],
    ["larger-industrial", ["store", "receive", "ship_distribute", "operate_vehicles"], "Larger conventional Industrial operation with distribution and operating vehicles", "anaheim", ["anaheim-canyon"]],
    ["contractor-service", ["dispatch", "repair_service"], "Local contractor service operation seeking a smaller-format Industrial base under 2,500 SF", "fullerton", ["fullerton-industrial-service-area", "anaheim-canyon"]],
    ["small-office-warehouse", ["work", "store"], "Six-person business seeking a small office and warehouse combination under 2,500 SF", "fullerton", ["fullerton-industrial-service-area", "anaheim-canyon"]],
    ["lighter-flex-service", ["work", "repair_service"], "Smaller lighter Flex and service operation under 2,500 SF with team workspace", "fullerton", ["fullerton-industrial-service-area", "anaheim-canyon"]],
    ["mixed-office-warehouse", ["work", "store"], "Office plus warehouse operating mix", "anaheim", ["anaheim-canyon", "fullerton-industrial-service-area"]],
    ["mixed-contractor-storage", ["work", "dispatch", "store"], "Smaller contractor service office with equipment storage under 2,500 SF", "fullerton", ["fullerton-industrial-service-area", "anaheim-canyon"]],
    ["mixed-lighter-office", ["work", "store", "meet_collaborate"], "Smaller lighter operating use with office and storage under 2,500 SF", "fullerton", ["fullerton-industrial-service-area", "anaheim-canyon"]],
  ];
  const created = [];
  for (const [name, activities, summary, marketId, expected] of scenarios) {
    const result = await api.createBrief(env, requirement(name, activities, summary, marketId), context(marketId));
    const stored = await api.getBriefBundle(env, result.brief.publicId, true);
    const html = await render(env, result);
    assert.notEqual(result.snapshot.readiness, "INVESTIGATE", `${name} should produce controlled guidance`);
    assert.deepEqual(order(result.snapshot), expected, `${name} ordering`);
    assert.deepEqual(order(stored.currentSnapshot), expected, `${name} persisted ordering`);
    assert(html.includes(expected.length === 1 ? "Starting point worth investigating" : "Peer locations worth investigating"));
    assert(html.includes("bounded North Orange County comparison"));
    assert(html.includes("not a countywide ranking"));
    assert(html.includes("This Requirement aligns with reviewed"));
    assert(html.includes("representative examples, not current availability"));
    assert(html.includes("property-level investigation"));
    assert(!/best market|absolute winner|recommended winner/i.test(html));
    assert(!/strong supported access|good freeway access|airport access/i.test(html));
    assert(result.snapshot.shortlist.every((item) => item.presentation.representativeBuildings.every((representative) => representative.availabilitySemantics === "REPRESENTATIVE_ONLY_NOT_AVAILABILITY" && representative.provenance.length && representative.propertyVerification)));
    created.push({ name, result, html });
  }

  const allItems = created.flatMap((item) => item.result.snapshot.shortlist);
  const anaheim = allItems.find((item) => item.districtId === "anaheim-canyon");
  const fullerton = allItems.find((item) => item.districtId === "fullerton-industrial-service-area");
  assert(anaheim.presentation.representativeBuildings.some((item) => item.name === "3071 E Coronado Street"));
  assert(anaheim.presentation.representativeBuildings.some((item) => /La Palma Distribution Center/.test(item.name)));
  assert(fullerton.presentation.representativeBuildings.every((item) => item.representativeKind === "COMMERCIAL_ENVIRONMENT"));
  for (const label of ["Orangethorpe Industrial Corridor", "Walnut–Truslow–Raymond Manufacturing Area"]) {
    const html = created.find((item) => item.result.snapshot.shortlist.some((entry) => entry.districtId === "fullerton-industrial-service-area")).html;
    assert(html.includes(`<article><strong>${label}</strong>`), `${label} should render as an environment, not a building link`);
    assert(!html.includes(`href=\"/commercial-real-estate/CA/fullerton/fullerton/\"><strong>${label}</strong>`));
  }
  const combinedHtml = created.map((item) => item.html).join("\n");
  assert(!combinedHtml.includes("2671 La Palma"));
  assert(!/Raymer building|unresolved Fullerton/i.test(combinedHtml));
  assert(!/clear height is|power capacity is|yard available|loading docks|trailer parking available/i.test(combinedHtml));

  const neutralFacts = [["anaheim", []], ["anaheim", ["anaheim-canyon"]], ["fullerton", []], ["fullerton", ["fullerton-industrial-service-area"]]];
  const neutralOrders = [];
  for (const [marketId, candidates] of neutralFacts) {
    const result = await api.createBrief(env, requirement(`neutral-${marketId}-${candidates[0] || "city"}`, ["work", "store"], "Small office and warehouse mix under 2,500 SF", marketId, candidates), context(marketId, candidates));
    const html = await render(env, result);
    neutralOrders.push(order(result.snapshot));
    assert(html.includes("Peer locations worth investigating"));
  }
  neutralOrders.slice(1).forEach((item) => assert.deepEqual(item, neutralOrders[0]));

  const abstentions = [
    requirement("insufficient", [], "Industrial or Flex space"),
    requirement("capability", ["store"], "Warehouse where exact loading configuration, minimum clear height, and required power dominate"),
    requirement("access", ["dispatch"], "Contractor operation where customer service territory must determine location"),
    requirement("countywide", ["store"], "Compare all of Orange County countywide"),
    requirement("irvine", ["work", "store"], "Compare with Irvine and Central OC"),
    requirement("unsupported-market", ["store"], "Warehouse operation", "costa-mesa"),
    requirement("south-oc", ["store"], "Compare South OC and Lake Forest"),
    requirement("specialized", ["research"], "Specialized laboratory with hazardous-material ventilation"),
  ];
  for (const item of abstentions) {
    const marketId = item.locationLogic.marketAnchor.marketId;
    const result = await api.createBrief(env, item, context(["anaheim", "fullerton"].includes(marketId) ? marketId : "anaheim"));
    const html = await render(env, result);
    assert.equal(result.snapshot.readiness, "INVESTIGATE", item.id);
    assert.equal(result.snapshot.shortlist.length, 0);
    assert.equal(result.brief.lifecycleStage, "LOCATION_INVESTIGATE");
    assert(!html.includes("Peer locations worth investigating"));
    assert(!html.includes("Starting point worth investigating"));
    assert(!html.includes("Fullerton Industrial / Service Area"));
    assert(html.includes("Rofo has not produced a personalized local market ranking"));
    assert(html.includes("Find Spaces That Fit"));
  }

  const storedSuccess = created[0].result;
  const runtimeOff = { LOCATION_BRIEFS_KV: env.LOCATION_BRIEFS_KV };
  const offResult = await api.createBrief(runtimeOff, requirement("runtime-off", ["store", "receive", "ship_distribute"], "Warehouse distribution operation"), context());
  assert.equal(offResult.snapshot.readiness, "INVESTIGATE");
  const persisted = await api.getBriefBundle(runtimeOff, storedSuccess.brief.publicId, true);
  assert.deepEqual(order(persisted.currentSnapshot), order(storedSuccess.snapshot));
  const persistedHtml = await render(runtimeOff, storedSuccess);
  assert(persistedHtml.includes("Starting point worth investigating"));

  fs.rmSync(temp, { recursive: true, force: true });
  console.log(`North Orange County Industrial/Flex certification QA passed: ${scenarios.length} realistic recommendation Briefs, ${abstentions.length} abstentions, four neutral entry contexts, representative rendering, persistence, customer framing, and default-deny rollback.`);
})().catch((error) => { fs.rmSync(temp, { recursive: true, force: true }); console.error(error); process.exit(1); });
