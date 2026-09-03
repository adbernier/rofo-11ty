"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-recommendation-runtime-activation-"));
function bundle(source, output) {
  execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, output)}`], { stdio: "pipe" });
  return require(path.join(temp, output));
}
const shared = bundle("functions/api/location-brief-v2/_shared.js", "shared.cjs");
const createApi = bundle("functions/api/location-brief-v2/create.js", "create.cjs");
const router = bundle("functions/best-fit-locations.js", "router.cjs");

const certified = () => ({ activation_key: "san-diego:industrial_flex:bounded", market_id: "san-diego", property_type: "industrial_flex", cohort: "bounded", enabled: 1, certification_id: "san-diego-industrial-flex-v1", updated_at: "2026-09-01T00:00:00.000Z", updated_by: "qa" });
class ActivationDb {
  constructor(row = certified(), failure = false) { this.row = row; this.failure = failure; this.reads = 0; }
  prepare() { return { bind: () => ({ first: async () => { this.reads += 1; if (this.failure) throw new Error("unavailable"); return this.row; } }) }; }
}
class MemoryKv {
  constructor() { this.values = new Map(); }
  async put(key, value) { this.values.set(key, value); }
  async get(key, type) { const value = this.values.get(key); return type === "json" && value ? JSON.parse(value) : value || null; }
  async delete(key) { this.values.delete(key); }
}
const requirement = (marketId = "san-diego", propertyType = "industrial_flex", activities = ["store", "dispatch", "repair_service"], summary = "Contractor warehouse and service operation") => ({ schemaVersion: "requirement:v1", propertyTypes: [propertyType], activities, businessContext: { summary }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, displayName: marketId }, specificPreference: { candidateDistrictIds: [], candidateDistrictNames: [] } }, criteria: [] });
const entry = (marketId = "san-diego", propertyType = "industrial_flex") => ({ sourceType: "space_type", sourcePath: "/commercial-real-estate/CA/san-diego/industrial-space/", marketId, propertyType, candidateDistrictIds: [] });
const env = (database) => ({ RECOMMENDATION_ACTIVATIONS_DB: database, LOCATION_BRIEFS_KV: new MemoryKv(), LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED: "true", LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES: "space_type,district" });
async function create(environment, req, id) {
  const request = new Request("https://www.rofo.com/api/location-brief-v2/create", { method: "POST", headers: { origin: "https://www.rofo.com", "content-type": "application/json" }, body: JSON.stringify({ creationRequestId: id, requirement: req, entryContext: entry(req.locationLogic.marketAnchor.marketId, req.propertyTypes[0]) }) });
  return createApi.onRequestPost({ request, env: environment });
}

(async () => {
  const db = new ActivationDb(); const runtime = env(db); const sd = requirement();
  assert.equal(await shared.publicRequirementEligibleAtRuntime(runtime, sd), true);
  assert.equal(await shared.publicEntryContextEligibleAtRuntime(runtime, entry()), true);
  assert.equal((await router.controlledEntryDecision(runtime, new URL("https://www.rofo.com/best-fit-locations/?marketId=san-diego&spaceType=Industrial&source=space_type"))).eligible, true);
  assert.equal((await router.controlledEntryDecision(runtime, new URL("https://www.rofo.com/best-fit-locations/?marketId=san-diego&spaceType=Industrial&source=homepage"))).eligible, false, "Source allowlist remains independent.");

  db.row.enabled = 0;
  assert.equal(await shared.publicRequirementEligibleAtRuntime(runtime, sd), false, "Runtime OFF denies immediately.");
  db.row = null;
  assert.equal((await shared.recommendationRuntimeActivationState(runtime, "san-diego", "industrial_flex")).reason, "MISSING_RUNTIME_RECORD");
  db.row = { ...certified(), enabled: "1" };
  assert.equal((await shared.recommendationRuntimeActivationState(runtime, "san-diego", "industrial_flex")).reason, "MALFORMED_RUNTIME_RECORD");
  assert.equal((await shared.recommendationRuntimeActivationState(env(new ActivationDb(certified(), true)), "san-diego", "industrial_flex")).reason, "RUNTIME_READ_FAILED");
  assert.equal((await shared.recommendationRuntimeActivationState(runtime, "denver", "industrial_flex")).reason, "UNRECOGNIZED_CERTIFIED_FLOW");

  db.row = certified();
  assert.equal(await shared.publicRequirementEligibleAtRuntime(runtime, requirement("san-diego", "office", ["work"])), false);
  assert.equal(await shared.publicRequirementEligibleAtRuntime(runtime, requirement("san-diego", "retail_service", ["sell_serve"])), false);
  assert.equal(await shared.publicRequirementEligibleAtRuntime(runtime, requirement("chula-vista")), false);
  assert.equal(await shared.publicRequirementEligibleAtRuntime(runtime, requirement("phoenix")), false);
  assert.equal(runtime.LOCATION_BRIEF_V2_PUBLIC_UNIVERSAL_ENABLED, undefined);

  const sf = { ...runtime, LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_ENABLED: "true" };
  assert.equal(await shared.publicRequirementEligibleAtRuntime(sf, requirement("san-francisco", "office", ["work"])), true, "SF remains environment-controlled.");

  const created = await create(runtime, sd, "runtime-activation-on"); assert.equal(created.status, 201);
  const body = await created.json(); assert(body.publicId, "Runtime ON permits persisted Brief creation; recommendation calibration is covered by the San Diego suites.");
  db.row.enabled = 0;
  assert.equal((await create(runtime, sd, "runtime-activation-off")).status, 409);
  assert(await shared.getBriefBundle(runtime, body.publicId, false), "Persisted Brief remains readable while activation is OFF.");
  db.row.enabled = 1;
  assert.equal((await create(runtime, sd, "runtime-activation-on-again")).status, 201, "ON → OFF → ON requires only runtime state mutation.");

  const unresolved = requirement("san-diego", "industrial_flex", [], "Industrial or Flex space");
  const abstained = await create(runtime, unresolved, "runtime-activation-abstain"); assert.equal(abstained.status, 201); assert.equal((await abstained.json()).readiness, "INVESTIGATE");

  const migration = fs.readFileSync(path.join(ROOT, "migrations/0008_recommendation_runtime_activations.sql"), "utf8");
  assert(migration.includes("on conflict (activation_key) do nothing") && migration.includes("san-diego-industrial-flex-v1"));
  const operator = fs.readFileSync(path.join(ROOT, "scripts/recommendation-activation.js"), "utf8");
  assert(operator.includes("--confirm-production") && operator.includes("not in the certified runtime registry"));
  let uncertifiedFailure = null;
  try { execFileSync(process.execPath, [path.join(ROOT, "scripts/recommendation-activation.js"), "set", "denver", "industrial-flex", "on", "--environment", "production", "--confirm-production"], { stdio: "pipe" }); }
  catch (error) { uncertifiedFailure = String(error.stderr || error.message); }
  assert(uncertifiedFailure?.includes("not in the certified runtime registry"), "Operator workflow must reject uncertified activation before touching infrastructure.");

  fs.rmSync(temp, { recursive: true, force: true });
  console.log("Recommendation Runtime Activation QA passed: certified D1 gating, default deny, source isolation, SF stability, persistence, abstention, and deployment-free ON/OFF transitions verified.");
})().catch((error) => { fs.rmSync(temp, { recursive: true, force: true }); console.error(error); process.exit(1); });
