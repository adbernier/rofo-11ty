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
const requirement = (marketId, candidates = []) => ({ propertyTypes: ["industrial_flex"], activities: ["store"], businessContext: { summary: "Warehouse" }, locationLogic: { marketAnchor: { marketId }, specificPreference: { candidateDistrictIds: candidates } }, criteria: [] });
class Db { prepare() { return { bind: () => ({ first: async () => ({ activation_key: "north-orange-county:industrial_flex:bounded", market_id: "north-orange-county", property_type: "industrial_flex", cohort: "bounded", enabled: 1, certification_id: "north-orange-county-industrial-flex-v1" }) }) }; } }
const env = { LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED: "true", LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES: "space_type,district", RECOMMENDATION_ACTIVATIONS_DB: new Db() };

(async () => {
  for (const [marketId, candidate] of [["anaheim", ""], ["anaheim", "anaheim-canyon"], ["fullerton", ""], ["fullerton", "fullerton-industrial-service-area"]]) {
    const candidates = candidate ? [candidate] : [];
    assert.equal(shared.isNorthOrangeCountyIndustrialFlexEntryContext(entry(marketId, candidates)), true);
    assert.equal(shared.isNorthOrangeCountyIndustrialFlexRequirement(requirement(marketId, candidates)), true);
    assert.equal(await shared.publicEntryContextEligibleAtRuntime(env, entry(marketId, candidates)), false, "Pending certification remains runtime denied");
    assert.equal(await shared.publicRequirementEligibleAtRuntime(env, requirement(marketId, candidates)), false, "A D1 row cannot bypass certification");
  }
  for (const marketId of ["orange-county", "irvine", "costa-mesa", "santa-ana", "lake-forest", "brea", "buena-park"]) {
    assert.equal(shared.isNorthOrangeCountyIndustrialFlexEntryContext(entry(marketId)), false);
    assert.equal(shared.isNorthOrangeCountyIndustrialFlexRequirement(requirement(marketId)), false);
  }
  assert.equal(shared.isNorthOrangeCountyIndustrialFlexEntryContext(entry("anaheim", ["brea"])), false);
  assert.equal(shared.isNorthOrangeCountyIndustrialFlexRequirement(requirement("fullerton", ["buena-park"])), false);
  assert.equal(shared.isNorthOrangeCountyIndustrialFlexEntryContext({ ...entry("anaheim"), propertyType: "office" }), false);
  assert.equal(shared.isNorthOrangeCountyIndustrialFlexRequirement({ ...requirement("anaheim"), propertyTypes: ["office"] }), false);
  assert.equal(shared.isNorthOrangeCountyIndustrialFlexEntryContext({ ...entry("fullerton"), propertyType: "retail" }), false);
  assert.equal(shared.isNorthOrangeCountyIndustrialFlexRequirement({ ...requirement("fullerton"), propertyTypes: ["retail"] }), false);
  assert.equal((await shared.recommendationRuntimeActivationState(env, "north-orange-county", "industrial_flex")).reason, "FLOW_NOT_CERTIFIED_FOR_ACTIVATION");
  assert.equal(env.LOCATION_BRIEF_V2_PUBLIC_UNIVERSAL_ENABLED, undefined);
  fs.rmSync(temp, { recursive: true, force: true });
  console.log("North Orange County Industrial/Flex Public Eligibility QA passed: reviewed entry identities recognized, all other OC identities excluded, and runtime remains default-deny pending certification.");
})().catch((error) => { fs.rmSync(temp, { recursive: true, force: true }); console.error(error); process.exit(1); });
