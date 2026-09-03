"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-indianapolis-eligibility-"));
const output = path.join(temp, "shared.cjs");
execFileSync(path.join(__dirname, "..", "node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "..", "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${output}`], { stdio: "pipe" });
const shared = require(output);
const entry = (candidate = "", marketId = "indianapolis", city = "Indianapolis", propertyType = "industrial_flex") => ({ sourceType: candidate ? "district" : "space_type", marketId, city, propertyType, candidateDistrictIds: candidate ? [candidate] : [] });
const requirement = (candidate = "", marketId = "indianapolis", city = "", propertyType = "industrial_flex") => ({ propertyTypes: [propertyType], activities: ["store", "receive"], businessContext: { summary: "Conventional warehouse operation" }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, city, state: "IN", displayName: city ? `${city}, IN` : "Indianapolis, IN" }, specificPreference: { candidateDistrictIds: candidate ? [candidate] : [] } }, criteria: [] });
class ActivationDb { constructor(row = null) { this.row = row; this.reads = 0; } prepare() { return { bind: () => ({ first: async () => { this.reads += 1; return this.row; } }) }; } }
const database = new ActivationDb();
const env = { LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED: "true", LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES: "space_type,district", RECOMMENDATION_ACTIVATIONS_DB: database };
(async () => {
  for (const candidate of ["", "indianapolis-airport-logistics", "park-fletcher", "stout-field", "park-100-northwest-indianapolis", "park-100"]) {
    assert.equal(shared.isIndianapolisIndustrialFlexEntryContext(entry(candidate)), true);
    assert.equal(shared.isIndianapolisIndustrialFlexRequirement(requirement(candidate)), true);
    assert.equal(await shared.publicEntryContextEligibleAtRuntime(env, entry(candidate)), false, "Missing D1 activation must default deny");
    assert.equal(await shared.publicRequirementEligibleAtRuntime(env, requirement(candidate)), false, "Missing D1 activation must default deny");
  }
  assert(database.reads > 0, "Certified flow must reach its D1 lookup");
  assert.equal((await shared.recommendationRuntimeActivationState(env, "indianapolis", "industrial_flex")).reason, "MISSING_RUNTIME_RECORD");
  const enabledDb = new ActivationDb({ activation_key: "indianapolis:industrial_flex:bounded", market_id: "indianapolis", property_type: "industrial_flex", cohort: "bounded", enabled: 1, certification_id: "indianapolis-industrial-flex-v1" });
  const enabledEnv = { ...env, RECOMMENDATION_ACTIVATIONS_DB: enabledDb };
  assert.equal(await shared.publicRequirementEligibleAtRuntime(enabledEnv, requirement()), true);
  assert.equal(await shared.publicEntryContextEligibleAtRuntime(enabledEnv, entry()), true);
  for (const [marketId, city] of [["indianapolis-metro", ""], ["plainfield", "Plainfield"], ["whitestown", "Whitestown"], ["lebanon", "Lebanon"], ["brownsburg", "Brownsburg"], ["greenwood", "Greenwood"], ["carmel", "Carmel"], ["fishers", "Fishers"]]) {
    assert.equal(shared.isIndianapolisIndustrialFlexRequirement(requirement("", marketId, city)), false, marketId);
  }
  assert.equal(shared.isIndianapolisIndustrialFlexRequirement(requirement("plainfield-logistics")), false);
  assert.equal(shared.isIndianapolisIndustrialFlexEntryContext(entry("", "indianapolis", "Indianapolis", "office")), false);
  assert.equal(shared.publicRequirementEligible(env, requirement()), false);
  assert.equal(shared.publicEntryContextEligible(env, entry()), false);
  assert.equal(shared.publicSourceAllowed(env, "space_type"), true);
  assert.equal(shared.publicSourceAllowed(env, "homepage"), false);
  assert.equal(env.LOCATION_BRIEF_V2_PUBLIC_UNIVERSAL_ENABLED, undefined);
  fs.rmSync(temp, { recursive: true, force: true });
  console.log("Indianapolis Industrial/Flex Public Eligibility QA passed: production-shaped City identities resolve, independent municipalities stay excluded, certified runtime remains missing-row default-deny, controlled ON simulation works, source controls remain independent, and Universal is unnecessary.");
})().catch((error) => { fs.rmSync(temp, { recursive: true, force: true }); console.error(error); process.exit(1); });
