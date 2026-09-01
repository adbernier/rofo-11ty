const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-sd-public-eligibility-"));
function bundle(source, output) {
  execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, output)}`], { stdio: "pipe" });
  return require(path.join(temp, output));
}
const shared = bundle("functions/api/location-brief-v2/_shared.js", "shared.cjs");
const createApi = bundle("functions/api/location-brief-v2/create.js", "create.cjs");
const router = bundle("functions/best-fit-locations.js", "router.cjs");

class MemoryKv {
  constructor() { this.values = new Map(); }
  async put(key, value) { this.values.set(key, value); }
  async get(key, type) { const value = this.values.get(key); return type === "json" && value ? JSON.parse(value) : value || null; }
  async delete(key) { this.values.delete(key); }
}
const ENTRY = "LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED";
const SD = "LOCATION_BRIEF_V2_PUBLIC_SAN_DIEGO_INDUSTRIAL_FLEX_ENABLED";
const UNIVERSAL = "LOCATION_BRIEF_V2_PUBLIC_UNIVERSAL_ENABLED";
const SOURCES = "LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES";
const cohort = { LOCATION_BRIEFS_KV: new MemoryKv(), [ENTRY]: "true", [SD]: "true", [SOURCES]: "space_type,district" };
function requirement(marketId = "san-diego", propertyType = "industrial_flex", activities = ["store", "dispatch", "repair_service"], summary = "Contractor warehouse and service operation", candidates = []) {
  return { schemaVersion: "requirement:v1", propertyTypes: [propertyType], activities, businessContext: { summary }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, displayName: marketId === "san-diego" ? "San Diego" : marketId }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates } }, criteria: [] };
}
function entry(marketId = "san-diego", propertyType = "industrial_flex", candidates = []) { return { sourceType: candidates.length ? "district" : "space_type", sourcePath: "/commercial-real-estate/CA/san-diego/industrial-space/", marketId, propertyType, candidateDistrictIds: candidates }; }
async function publicCreate(env, req, context, id) {
  const request = new Request("https://www.rofo.com/api/location-brief-v2/create", { method: "POST", headers: { origin: "https://www.rofo.com", "content-type": "application/json" }, body: JSON.stringify({ creationRequestId: id, requirement: req, entryContext: context }) });
  return createApi.onRequestPost({ request, env });
}

(async () => {
  const sd = requirement();
  assert.equal(shared.publicEntryContextEligible(cohort, entry()), true);
  assert.equal(shared.publicRequirementEligible(cohort, sd), true);
  assert.equal(cohort[UNIVERSAL], undefined, "The bounded San Diego path must not require Universal access.");
  const routed = await router.controlledEntryDecision(cohort, new URL("https://www.rofo.com/best-fit-locations/?marketId=san-diego&spaceType=Industrial%20%2F%20Warehouse%20%2F%20Flex&source=space_type"));
  assert.equal(routed.eligible, true); assert.equal(routed.reasonCode, "SAN_DIEGO_INDUSTRIAL_FLEX_COHORT");
  assert.equal((await router.controlledEntryDecision(cohort, new URL("https://www.rofo.com/best-fit-locations/?marketId=san-diego&spaceType=Industrial&source=homepage"))).eligible, false, "Existing source allowlist remains part of the cohort boundary.");

  const flagOff = { ...cohort, [SD]: "false" };
  assert.equal(shared.publicEntryContextEligible(flagOff, entry()), false);
  assert.equal(shared.publicRequirementEligible(flagOff, sd), false);
  assert.equal(shared.publicRequirementEligible({ ...cohort, [ENTRY]: "false" }, sd), false, "The San Diego flag alone must not open public creation.");

  assert.equal(shared.publicRequirementEligible(cohort, requirement("san-diego", "office", ["work"])), false);
  assert.equal(shared.publicRequirementEligible(cohort, requirement("san-diego", "retail_service", ["sell_serve"])), false);
  for (const marketId of ["chula-vista", "vista", "oceanside", "carlsbad", "poway", "phoenix"]) {
    assert.equal(shared.publicEntryContextEligible(cohort, entry(marketId)), false, `${marketId} entry must remain ineligible`);
    assert.equal(shared.publicRequirementEligible(cohort, requirement(marketId)), false, `${marketId} Requirement must remain ineligible`);
  }
  for (const districtId of ["miramar", "otay-mesa", "kearny-mesa", "sorrento-mesa", "sorrento-valley"]) assert.equal(shared.publicEntryContextEligible(cohort, entry("san-diego", "industrial_flex", [districtId])), true, `${districtId} is reviewed San Diego entry context`);
  for (const outsideId of ["chula-vista", "vista-business-park", "oceanside", "carlsbad", "poway"]) assert.equal(shared.publicEntryContextEligible(cohort, entry("san-diego", "industrial_flex", [outsideId])), false, `${outsideId} cannot enter through a San Diego anchor`);

  const universalOn = { ...cohort, [SD]: "false", [UNIVERSAL]: "true" };
  assert.equal(shared.publicRequirementEligible(universalOn, requirement("phoenix")), true, "Existing Universal behavior remains available only under its own flag.");
  assert.equal(shared.publicRequirementEligible(cohort, requirement("phoenix")), false, "The San Diego flag must not alter unrelated non-SF eligibility.");
  const sf = { ...cohort, LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_ENABLED: "true" };
  assert.equal(shared.publicEntryContextEligible(sf, entry("san-francisco", "office")), true);
  assert.equal(shared.publicRequirementEligible(sf, requirement("san-francisco", "office", ["work"])), true, "SF cohort behavior remains unchanged.");

  const createdResponse = await publicCreate(cohort, sd, entry(), "sd-public-eligibility-resolved");
  assert.equal(createdResponse.status, 201);
  const createdBody = await createdResponse.json();
  assert.notEqual(createdBody.readiness, "INVESTIGATE");
  const createdBundle = await shared.getBriefBundle(cohort, createdBody.publicId, false);
  assert.equal(createdBundle.currentSnapshot.shortlist[0].districtId, "miramar");

  const neutralOrders = [];
  for (const districtId of ["miramar", "otay-mesa", "kearny-mesa", "sorrento-mesa", "sorrento-valley"]) {
    const response = await publicCreate(cohort, requirement("san-diego", "industrial_flex", ["display_present", "host_visitors", "repair_service"], "Customer-facing showroom and service Flex", [districtId]), entry("san-diego", "industrial_flex", [districtId]), `sd-public-neutral-${districtId}`);
    assert.equal(response.status, 201);
    const body = await response.json(); const bundle = await shared.getBriefBundle(cohort, body.publicId, false);
    neutralOrders.push(bundle.currentSnapshot.shortlist.map((item) => item.districtId));
  }
  neutralOrders.slice(1).forEach((order) => assert.deepEqual(order, neutralOrders[0]));

  for (const [id, req] of [
    ["unresolved", requirement("san-diego", "industrial_flex", [], "Industrial or Flex space")],
    ["specialized", requirement("san-diego", "industrial_flex", ["research"], "Specialized laboratory with hazardous-material ventilation")],
  ]) {
    assert.equal(shared.publicRequirementEligible(cohort, req), true, `${id} remains eligible to reach safe abstention`);
    const response = await publicCreate(cohort, req, entry(), `sd-public-${id}`);
    assert.equal(response.status, 201); assert.equal((await response.json()).readiness, "INVESTIGATE");
  }

  fs.rmSync(temp, { recursive: true, force: true });
  console.log("San Diego Industrial/Flex Public Eligibility QA passed: isolated entry/create gate, bounded sources, reviewed contexts, SF stability, neutrality, and abstention verified without Universal access.");
})().catch((error) => { fs.rmSync(temp, { recursive: true, force: true }); console.error(error); process.exit(1); });
