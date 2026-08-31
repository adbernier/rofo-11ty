const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const FLAG = "LOCATION_BRIEF_V2_PUBLIC_SAN_DIEGO_INDUSTRIAL_FLEX_ENABLED";
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-sd-industrial-flex-certification-"));
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
function requirement(id, activities, summary, candidates = [], marketId = "san-diego") {
  return {
    id, schemaVersion: "requirement:v1", propertyTypes: ["industrial_flex"], activities,
    businessContext: { summary },
    locationLogic: {
      marketAnchor: { marketId, geographyId: marketId, displayName: marketId === "san-diego" ? "San Diego" : marketId },
      specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates },
    },
    criteria: [],
  };
}
function context(candidates = []) { return { sourceType: candidates.length ? "district_page" : "city_page", marketId: "san-diego", propertyType: "industrial_flex", candidateDistrictIds: candidates, landingPage: candidates.length ? `/commercial-real-estate/CA/san-diego/${candidates[0]}/` : "/commercial-real-estate/CA/san-diego/" }; }
async function render(env, created) {
  const request = new Request(`http://localhost/location-brief/${created.brief.publicId}`, { headers: { cookie: created.setCookie.split(";")[0] } });
  const response = await publicRoute.onRequestGet({ request, env, params: { publicId: created.brief.publicId } });
  assert.equal(response.status, 200);
  return response.text();
}
const ids = (snapshot) => snapshot.shortlist.map((item) => item.districtId);

(async () => {
  const env = { LOCATION_BRIEFS_KV: new MemoryKv(), [FLAG]: "true" };
  const scenarios = [
    ["contractor-fleet", ["store", "dispatch", "operate_vehicles", "repair_service"], "Contractor service business with warehouse, dispatch, and fleet operations", "miramar"],
    ["warehouse-distribution", ["store", "receive", "ship_distribute"], "Conventional warehouse and distribution operation", "otay-mesa"],
    ["logistics-manufacturing", ["ship_distribute", "receive", "operate_vehicles", "make_assemble"], "Logistics, distribution, and manufacturing operation", "otay-mesa"],
    ["light-manufacturing", ["make_assemble", "store"], "Light manufacturing with supporting storage", "miramar"],
    ["technical-rd", ["research", "prototype", "product_development"], "Technical R&D and prototyping operation", "sorrento-mesa"],
    ["engineering-office-production", ["work", "product_development", "prototype"], "Engineering workspace with office-production needs", "sorrento-mesa"],
    ["showroom-flex", ["display_present", "host_visitors", "repair_service"], "Customer-facing Flex showroom and service use", "kearny-mesa"],
    ["office-production", ["work", "make_assemble"], "Office and production operation", "miramar"],
    ["warehouse-showroom", ["store", "display_present", "host_visitors"], "Warehouse with customer-facing showroom", "miramar"],
    ["technical-light-operations", ["research", "prototype", "make_assemble"], "Technical workspace with light operations", "sorrento-mesa"],
  ];
  const created = [];
  for (const [name, activities, summary, expectedFirst] of scenarios) {
    const result = await api.createBrief(env, requirement(name, activities, summary), context());
    const html = await render(env, result);
    assert.notEqual(result.snapshot.readiness, "INVESTIGATE", `${name} should produce controlled guidance`);
    assert.equal(ids(result.snapshot)[0], expectedFirst, `${name} primary ordering`);
    assert(html.includes("Peer locations") || html.includes("Locations worth investigating"));
    assert(html.includes("These are representative examples, not current availability."));
    assert(html.includes("property-level investigation"));
    assert(html.includes("Industrial-led fit:") || html.includes("Flex-led fit:") || html.includes("Mixed Industrial/Flex applicability:"));
    assert(html.includes("This Requirement aligns with the reviewed"), `${name} should connect fit to Requirement signals`);
    assert(!html.includes("Retail environment"));
    assert(!html.includes("Customer access</strong>"));
    assert(!html.includes("Best market"));
    assert(!html.includes("Recommended winner"));
    assert(result.snapshot.shortlist.every((item) => item.presentation.representativeBuildings.every((building) => building.canonicalUrl && building.representativeReason && building.propertyVerification)));
    created.push({ name, result, html });
  }

  const expectedRepresentatives = { miramar: "6906 Miramar Road", "otay-mesa": "7310 Otay Crossings Court", "kearny-mesa": "4000 Ruffin Road", "sorrento-mesa": "10130 Sorrento Valley Road" };
  const allItems = created.flatMap((entry) => entry.result.snapshot.shortlist);
  for (const [districtId, label] of Object.entries(expectedRepresentatives)) {
    const item = allItems.find((entry) => entry.districtId === districtId);
    assert(item, `${districtId} must appear in a successful comparison`);
    assert(item.presentation.representativeBuildings.some((building) => building.name === label));
  }
  const sorrento = allItems.find((item) => item.districtId === "sorrento-mesa");
  assert(sorrento.memberDistrictIds.includes("sorrento-valley"));
  assert(sorrento.presentation.representativeBuildings.some((building) => /Sorrento Valley/.test(building.name)));

  const neutralRequirement = requirement("neutral", ["display_present", "host_visitors", "repair_service"], "Customer-facing Flex showroom and service use");
  const neutralOrders = [];
  for (const candidate of ["", "miramar", "otay-mesa", "kearny-mesa", "sorrento-mesa", "sorrento-valley"]) {
    const candidates = candidate ? [candidate] : [];
    const result = await api.createBrief(env, { ...neutralRequirement, id: `neutral-${candidate || "city"}` }, context(candidates));
    const html = await render(env, result);
    neutralOrders.push(ids(result.snapshot));
    assert(html.includes("Kearny Mesa"));
    if (candidate === "sorrento-valley") {
      assert.equal(result.candidates[0].canonicalDistrictId, "sorrento-mesa");
      assert.equal(result.candidates[0].sourceIdentity, "sorrento-valley");
    }
  }
  neutralOrders.slice(1).forEach((order) => assert.deepEqual(order, neutralOrders[0]));

  const abstentions = [
    requirement("insufficient", [], "Industrial or Flex space"),
    requirement("specialized", ["research"], "Specialized laboratory with hazardous-material ventilation"),
    requirement("capability", ["store"], "Warehouse where exact loading configuration, clear height, and power capacity dominate"),
    requirement("countywide", ["store"], "Compare San Diego County and nearby markets"),
    requirement("outside-candidate", ["store"], "Warehouse operation", ["chula-vista"]),
    requirement("outside-market", ["store"], "Warehouse operation", [], "chula-vista"),
  ];
  for (const item of abstentions) {
    const result = await api.createBrief(env, item, context(item.locationLogic.specificPreference.candidateDistrictIds));
    const html = await render(env, result);
    assert.equal(result.snapshot.readiness, "INVESTIGATE");
    assert.equal(result.snapshot.shortlist.length, 0);
    assert.equal(result.brief.lifecycleStage, "LOCATION_INVESTIGATE");
    assert(!html.includes("Locations worth investigating"));
    assert(html.includes("Rofo has not produced a personalized local market ranking"));
    assert(html.includes("Find Spaces That Fit"));
  }

  const enabledBrief = created[0].result;
  delete env[FLAG];
  const disabled = await api.createBrief(env, requirement("rollback-new", ["store", "dispatch"], "Contractor warehouse and dispatch operation"), context());
  assert.equal(disabled.snapshot.readiness, "INVESTIGATE");
  assert.equal(disabled.snapshot.shortlist.length, 0);
  const storedEnabled = await api.getBriefBundle(env, enabledBrief.brief.publicId, true);
  assert.notEqual(storedEnabled.currentSnapshot.readiness, "INVESTIGATE");
  assert.deepEqual(ids(storedEnabled.currentSnapshot), ids(enabledBrief.snapshot));
  const storedHtml = await render(env, enabledBrief);
  assert(storedHtml.includes("Locations worth investigating"));
  assert.equal(api.sanDiegoIndustrialFlexEnabled({}), false);

  fs.rmSync(temp, { recursive: true, force: true });
  console.log(`San Diego Industrial/Flex certification QA passed: ${scenarios.length} realistic recommendation Briefs, ${abstentions.length} abstentions, six neutral entry contexts, representative rendering, persistence, and rollback.`);
})().catch((error) => { fs.rmSync(temp, { recursive: true, force: true }); console.error(error); process.exit(1); });
