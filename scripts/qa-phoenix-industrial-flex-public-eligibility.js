"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-phoenix-eligibility-"));
const output = path.join(temp, "shared.cjs");
execFileSync(path.join(__dirname, "..", "node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "..", "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${output}`], { stdio: "pipe" });
const shared = require(output);
const entry = (candidate = "", marketId = "phoenix", propertyType = "industrial_flex") => ({ sourceType: candidate ? "district" : "space_type", marketId, city: marketId === "phoenix" ? "Phoenix" : marketId, propertyType, candidateDistrictIds: candidate ? [candidate] : [] });
const requirement = (candidate = "", marketId = "phoenix-metro", propertyType = "industrial_flex", city = marketId === "phoenix-metro" ? "Phoenix" : marketId) => ({ propertyTypes: [propertyType], activities: ["store", "receive"], businessContext: { summary: "Conventional warehouse operation" }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, city, displayName: city || marketId }, specificPreference: { candidateDistrictIds: candidate ? [candidate] : [] } }, criteria: [] });
class CountingDb { constructor() { this.reads = 0; } prepare() { return { bind: () => ({ first: async () => { this.reads += 1; return { activation_key: "phoenix:industrial_flex:bounded", market_id: "phoenix", property_type: "industrial_flex", cohort: "bounded", enabled: 1, certification_id: "phoenix-industrial-flex-v1" }; } }) }; } }
class EmptyDb { constructor() { this.reads = 0; } prepare() { return { bind: () => ({ first: async () => { this.reads += 1; return null; } }) }; } }
const database = new CountingDb();
const env = { LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED: "true", LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES: "space_type,district", RECOMMENDATION_ACTIVATIONS_DB: database };

(async () => {
  const accepted = ["", "southwest-phoenix-industrial", "airport-south-central-industrial", "phoenix-airport-sky-harbor-area", "north-phoenix-advanced-operations", "deer-valley", "north-phoenix-tsmc-corridor"];
  for (const candidate of accepted) {
    assert.equal(shared.isPhoenixIndustrialFlexEntryContext(entry(candidate)), true);
    assert.equal(shared.isPhoenixIndustrialFlexRequirement(requirement(candidate)), true);
    assert.equal(await shared.publicEntryContextEligibleAtRuntime(env, entry(candidate)), true, "Certified flow may be enabled by an explicit D1 row");
    assert.equal(await shared.publicRequirementEligibleAtRuntime(env, requirement(candidate)), true, "Certified flow may be enabled by an explicit D1 row");
  }
  assert(database.reads > 0, "Certified runtime path must read D1");
  const offEnv = { ...env, RECOMMENDATION_ACTIVATIONS_DB: new EmptyDb() };
  assert.equal((await shared.recommendationRuntimeActivationState(offEnv, "phoenix", "industrial_flex")).reason, "MISSING_RUNTIME_RECORD");
  assert.equal(await shared.publicRequirementEligibleAtRuntime(offEnv, requirement()), false, "Missing D1 record remains default-deny");
  assert.equal(shared.isPhoenixIndustrialFlexRequirement(requirement("", "phoenix-metro", "industrial_flex", "")), false, "Generic Phoenix Metro must remain excluded");
  for (const marketId of ["greater-phoenix", "tempe", "mesa", "chandler", "scottsdale", "glendale", "goodyear", "avondale", "arizona"]) {
    assert.equal(shared.isPhoenixIndustrialFlexRequirement(requirement("", marketId)), false, marketId);
  }
  assert.equal(shared.isPhoenixIndustrialFlexEntryContext(entry("tempe-i-10-industrial")), false);
  assert.equal(shared.isPhoenixIndustrialFlexRequirement(requirement("tempe-i-10-industrial")), false);
  assert.equal(shared.isPhoenixIndustrialFlexEntryContext(entry("", "phoenix", "office")), false);
  assert.equal(shared.isPhoenixIndustrialFlexRequirement(requirement("", "phoenix", "retail_service")), false);
  assert.equal(shared.publicSourceAllowed(env, "space_type"), true);
  assert.equal(shared.publicSourceAllowed(env, "homepage"), false);
  assert.equal(env.LOCATION_BRIEF_V2_PUBLIC_UNIVERSAL_ENABLED, undefined);
  assert.equal(shared.publicEntryContextEligible(env, entry()), false, "Static eligibility remains denied");
  assert.equal(shared.publicRequirementEligible(env, requirement()), false, "Static eligibility remains denied");
  fs.rmSync(temp, { recursive: true, force: true });
  console.log("Phoenix Industrial/Flex Public Eligibility QA passed: production-shaped identities are bounded, certified D1 ON/OFF behavior works, missing state denies, Tempe/Valley/property types remain excluded, source controls remain independent, and Universal is unnecessary.");
})().catch((error) => { fs.rmSync(temp, { recursive: true, force: true }); console.error(error); process.exit(1); });
