"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-sacramento-eligibility-"));
const output = path.join(temp, "shared.cjs");
execFileSync(path.join(__dirname, "..", "node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "..", "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${output}`], { stdio: "pipe" });
const shared = require(output);
const entry = (candidate = "", marketId = "sacramento", city = "Sacramento", propertyType = "industrial_flex") => ({ sourceType: candidate ? "district" : "space_type", marketId, city, propertyType, candidateDistrictIds: candidate ? [candidate] : [] });
const requirement = (candidate = "", marketId = "sacramento", city = "Sacramento", propertyType = "industrial_flex") => ({ propertyTypes: [propertyType], activities: ["store", "receive"], businessContext: { summary: "Conventional warehouse operation" }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, city, state: "CA", displayName: city ? `${city}, CA` : marketId, source: "canonical_commercial_geography" }, specificPreference: { candidateDistrictIds: candidate ? [candidate] : [] } }, criteria: [] });
class CountingDb { constructor(row) { this.row = row; this.reads = 0; } prepare() { return { bind: () => ({ first: async () => { this.reads += 1; return this.row; } }) }; } }
const enabledRow = { activation_key: "sacramento:industrial_flex:bounded", market_id: "sacramento", property_type: "industrial_flex", cohort: "bounded", enabled: 1, certification_id: "sacramento-industrial-flex-v1" };
const database = new CountingDb(enabledRow);
const env = { LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED: "true", LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES: "space_type,district", RECOMMENDATION_ACTIVATIONS_DB: database };
(async () => {
  const accepted = ["", "power-inn-industrial", "florin-perkins-industrial", "sci", "ramona", "sci-ramona-component", "northgate-north-market-industrial", "northgate-industrial-park", "northgate", "north-market-boulevard", "north-market"];
  for (const candidate of accepted) {
    assert.equal(shared.isSacramentoIndustrialFlexEntryContext(entry(candidate)), true);
    assert.equal(shared.isSacramentoIndustrialFlexRequirement(requirement(candidate)), true);
    assert.equal(await shared.publicEntryContextEligibleAtRuntime(env, entry(candidate)), true, "Certified flow may be enabled only by an explicit valid D1 row");
    assert.equal(await shared.publicRequirementEligibleAtRuntime(env, requirement(candidate)), true, "Certified flow may be enabled only by an explicit valid D1 row");
  }
  assert(database.reads > 0, "Certified flow must reach the runtime D1 decision point");
  const offEnv = { ...env, RECOMMENDATION_ACTIVATIONS_DB: new CountingDb(null) };
  const state = await shared.recommendationRuntimeActivationState(offEnv, "sacramento", "industrial_flex");
  assert.equal(state.reason, "MISSING_RUNTIME_RECORD");
  assert.equal(state.enabled, false);
  assert.equal(await shared.publicRequirementEligibleAtRuntime(offEnv, requirement()), false, "Missing D1 record remains default-deny");
  for (const [marketId, city] of [["sacramento-metro", ""], ["west-sacramento", "West Sacramento"], ["rancho-cordova", "Rancho Cordova"], ["elk-grove", "Elk Grove"], ["roseville", "Roseville"], ["rocklin", "Rocklin"], ["folsom", "Folsom"], ["citrus-heights", "Citrus Heights"], ["northern-california", ""]]) assert.equal(shared.isSacramentoIndustrialFlexRequirement(requirement("", marketId, city)), false, marketId);
  for (const candidate of ["west-sacramento-industrial", "rancho-cordova-commercial-core", "natomas"]) assert.equal(shared.isSacramentoIndustrialFlexRequirement(requirement(candidate)), false, candidate);
  assert.equal(shared.isSacramentoIndustrialFlexEntryContext(entry("", "sacramento", "Sacramento", "office")), false);
  assert.equal(shared.isSacramentoIndustrialFlexRequirement(requirement("", "sacramento", "Sacramento", "retail_service")), false);
  assert.equal(shared.publicRequirementEligible(env, requirement()), false);
  assert.equal(shared.publicEntryContextEligible(env, entry()), false);
  assert.equal(shared.publicSourceAllowed(env, "space_type"), true);
  assert.equal(shared.publicSourceAllowed(env, "homepage"), false);
  assert.equal(env.LOCATION_BRIEF_V2_PUBLIC_UNIVERSAL_ENABLED, undefined);
  fs.rmSync(temp, { recursive: true, force: true });
  console.log("Sacramento Industrial/Flex Public Eligibility QA passed: production-shaped City/component membership resolves, municipality/property exclusions hold, certified runtime reaches D1 and missing state denies, source controls remain independent, and Universal is unnecessary.");
})().catch((error) => { fs.rmSync(temp, { recursive: true, force: true }); console.error(error); process.exit(1); });
