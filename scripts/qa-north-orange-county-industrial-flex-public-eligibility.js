"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-north-oc-eligibility-"));
const output = path.join(temp, "shared.cjs");
execFileSync(path.join(__dirname, "..", "node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "..", "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${output}`], { stdio: "pipe" });
const shared = require(output);
const entry = (marketId, candidates = []) => ({ sourceType: candidates.length ? "district" : "space_type", marketId, propertyType: "industrial_flex", candidateDistrictIds: candidates });
const requirement = (city = "", candidates = [], propertyType = "industrial_flex") => ({ propertyTypes: [propertyType], activities: ["store"], businessContext: { summary: "Warehouse" }, locationLogic: { marketAnchor: { marketId: "orange-county", geographyId: "orange-county", city, displayName: city ? `${city}, CA` : "Orange County, CA" }, specificPreference: { candidateDistrictIds: candidates } }, criteria: [] });
class Db { constructor(enabled = 1) { this.enabled = enabled; this.boundKeys = []; } prepare() { return { bind: (key) => ({ first: async () => { this.boundKeys.push(key); return { activation_key: "north-orange-county:industrial_flex:bounded", market_id: "north-orange-county", property_type: "industrial_flex", cohort: "bounded", enabled: this.enabled, certification_id: "north-orange-county-industrial-flex-v1" }; } }) }; } }
class EmptyDb { prepare() { return { bind: () => ({ first: async () => null }) }; } }
const activationDb = new Db();
const env = { LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED: "true", LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES: "space_type,district", RECOMMENDATION_ACTIVATIONS_DB: activationDb };
const offEnv = { ...env, RECOMMENDATION_ACTIVATIONS_DB: new EmptyDb() };

(async () => {
  for (const [marketId, city, candidate] of [["anaheim", "Anaheim", ""], ["anaheim", "Anaheim", "anaheim-canyon"], ["fullerton", "Fullerton", ""], ["fullerton", "Fullerton", "fullerton-industrial-service-area"]]) {
    const candidates = candidate ? [candidate] : [];
    assert.equal(shared.isNorthOrangeCountyIndustrialFlexEntryContext(entry(marketId, candidates)), true);
    assert.equal(shared.isNorthOrangeCountyIndustrialFlexRequirement(requirement(city, candidates)), true);
    assert.equal(await shared.publicEntryContextEligibleAtRuntime(env, entry(marketId, candidates)), true, "Certified flow is structurally activatable");
    assert.equal(await shared.publicRequirementEligibleAtRuntime(env, requirement(city, candidates)), true, "Production-shaped certified flow accepts an explicit enabled D1 state");
    assert.equal(await shared.publicEntryContextEligibleAtRuntime(offEnv, entry(marketId, candidates)), false, "Missing D1 activation remains denied");
    assert.equal(await shared.publicRequirementEligibleAtRuntime(offEnv, requirement(city, candidates)), false, "Missing D1 activation remains denied");
  }
  assert.equal(shared.isNorthOrangeCountyIndustrialFlexRequirement(requirement("")), false);
  for (const city of ["Irvine", "Costa Mesa", "Santa Ana", "Lake Forest", "Brea", "Buena Park", "Orange"]) {
    assert.equal(shared.isNorthOrangeCountyIndustrialFlexRequirement(requirement(city)), false);
  }
  assert.equal(shared.isNorthOrangeCountyIndustrialFlexEntryContext(entry("anaheim", ["brea"])), false);
  assert.equal(shared.isNorthOrangeCountyIndustrialFlexRequirement(requirement("Fullerton", ["buena-park"])), false);
  assert.equal(shared.isNorthOrangeCountyIndustrialFlexEntryContext({ ...entry("anaheim"), propertyType: "office" }), false);
  assert.equal(shared.isNorthOrangeCountyIndustrialFlexRequirement(requirement("Anaheim", [], "office")), false);
  assert.equal(shared.isNorthOrangeCountyIndustrialFlexEntryContext({ ...entry("fullerton"), propertyType: "retail" }), false);
  assert.equal(shared.isNorthOrangeCountyIndustrialFlexRequirement({ ...requirement("fullerton"), propertyTypes: ["retail"] }), false);
  assert.equal((await shared.recommendationRuntimeActivationState(offEnv, "north-orange-county", "industrial_flex")).reason, "MISSING_RUNTIME_RECORD");
  assert(activationDb.boundKeys.every((key) => key === "north-orange-county:industrial_flex:bounded"), "Eligible paths must request the exact certified runtime key");
  assert.equal(shared.publicSourceAllowed(env, "homepage"), false);
  assert.equal(shared.publicSourceAllowed(env, "space_type"), true);
  assert.equal(env.LOCATION_BRIEF_V2_PUBLIC_UNIVERSAL_ENABLED, undefined);
  fs.rmSync(temp, { recursive: true, force: true });
  console.log("North Orange County Industrial/Flex Public Eligibility QA passed: certified bounded identities are structurally activatable, excluded OC identities remain denied, and a missing D1 record defaults OFF.");
})().catch((error) => { fs.rmSync(temp, { recursive: true, force: true }); console.error(error); process.exit(1); });
