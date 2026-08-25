"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-journey-activation-"));
function bundle(source, output) {
  execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, output)}`], { stdio: "pipe" });
  return require(path.join(temp, output));
}
const shared = bundle("functions/api/location-brief-v2/_shared.js", "shared.cjs");
const router = bundle("functions/best-fit-locations.js", "router.cjs");
const renderer = bundle("functions/operator/location-brief-v2/[publicId].js", "renderer.cjs");
const allFlags = {
  LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED: "true",
  LOCATION_BRIEF_V2_PUBLIC_UNIVERSAL_ENABLED: "true",
  LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_ENABLED: "true",
  LOCATION_BRIEF_V2_PUBLIC_SF_RETAIL_ENABLED: "true",
  LOCATION_BRIEF_V2_PUBLIC_SF_INDUSTRIAL_FLEX_ENABLED: "true",
};
const requirement = (marketId, displayName, propertyType) => ({ schemaVersion: "requirement:v1", propertyTypes: [propertyType], activities: propertyType === "office" ? ["work"] : propertyType === "retail_service" ? ["sell_serve", "host_visitors"] : ["store", "receive", "ship_distribute"], businessContext: { summary: "Controlled cohort QA business" }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, displayName }, specificPreference: { candidateDistrictIds: [], candidateDistrictNames: [] } }, criteria: [] });

for (const source of shared.CANONICAL_PUBLIC_SOURCES) assert(shared.publicSourceAllowed({}, source), `${source} must be accepted by default`);
assert(!shared.publicSourceAllowed({}, "arbitrary_campaign_source"));
assert.equal(shared.publicGlobalCohortEnabled(allFlags), true);
assert.equal(shared.publicGlobalCohortEnabled({ ...allFlags, LOCATION_BRIEF_V2_PUBLIC_SF_RETAIL_ENABLED: "false" }), false, "Global entry cannot activate while a selectable branch would reject late");

const searches = [
  ["san-francisco", "San Francisco", "office"], ["san-francisco", "San Francisco", "retail_service"], ["san-francisco", "San Francisco", "industrial_flex"],
  ["novi", "Novi", "industrial_flex"], ["nashville", "Nashville", "retail_service"], ["boise", "Boise", "office"], ["boise", "Boise", "industrial_flex"],
];
for (const [marketId, name, propertyType] of searches) {
  assert(shared.publicEntryContextEligible(allFlags, { marketId, propertyType }), `${marketId}:${propertyType} entry must be eligible`);
  assert(shared.publicRequirementEligible(allFlags, requirement(marketId, name, propertyType)), `${marketId}:${propertyType} creation must agree with entry eligibility`);
}
assert(!shared.publicRequirementEligible(allFlags, requirement("boise", "Boise", "medical")), "Medical remains outside the public cohort");

const routed = router.controlledEntryDecision(allFlags, new URL("https://rofo.com/best-fit-locations/?marketId=novi&spaceType=Industrial&source=city"));
assert.equal(routed.eligible, true);
assert.equal(router.controlledEntryDecision({ ...allFlags, LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED: "false" }, new URL("https://rofo.com/best-fit-locations/?marketId=novi&spaceType=Industrial&source=city")).eligible, false);
assert.equal(router.controlledEntryDecision(allFlags, new URL("https://rofo.com/best-fit-locations/?marketId=novi&spaceType=Industrial&source=unknown")).eligible, false);

const nonCertifiedRequirement = requirement("novi", "Novi", "industrial_flex");
const nonCertifiedSnapshot = shared.calculateSnapshot(nonCertifiedRequirement);
assert.equal(nonCertifiedSnapshot.readiness, "INVESTIGATE");
assert.equal(nonCertifiedSnapshot.shortlist.length, 0, "Universal creation cannot leak a local shortlist");
const nonCertifiedBundle = { brief: { publicId: "LB2-00112233445566778899AABB" }, entryContext: { marketId: "novi", propertyType: "industrial_flex", sourceType: "city" }, currentRevision: { requirement: nonCertifiedRequirement }, currentSnapshot: { readiness: "INVESTIGATE", shortlist: [], candidateAssessments: [], comparisonAlternatives: [], intelligenceGaps: [] }, candidates: [] };
const universalHtml = renderer.renderLocationBriefV2Page(nonCertifiedBundle, true, false, { publicExperience: true });
assert(universalHtml.includes("Rofo has not yet calibrated Novi for automatic location comparison."));
assert(!universalHtml.includes("Locations worth investigating"));
assert(universalHtml.includes("Research Spaces for My Business →") && universalHtml.includes("/research-search/LB2-00112233445566778899AABB"));
assert(!universalHtml.includes("<button class=\"lb2-button\" type=\"button\" disabled"));

const sfOfficeRequirement = requirement("san-francisco", "San Francisco", "office");
const sfOfficeBundle = { ...nonCertifiedBundle, entryContext: { marketId: "san-francisco", propertyType: "office", sourceType: "space_type" }, currentRevision: { requirement: sfOfficeRequirement }, currentSnapshot: { ...nonCertifiedBundle.currentSnapshot, readiness: "FULL", shortlist: [{ districtId: "financial-district", districtName: "Financial District", strengths: ["Strong Office fit"], tradeoffs: [], office: { summary: "Professional Office context", band: "STRONG" }, environment: { reasons: [], band: "STRONG" }, propertyTypeFit: { summary: "Strong Office fit", band: "STRONG" }, accessComponent: { band: "GOOD" }, presentation: {} }] } };
const officeHtml = renderer.renderLocationBriefV2Page(sfOfficeBundle, true, false, { publicExperience: true });
assert(officeHtml.includes("/property-requirement/LB2-00112233445566778899AABB") && officeHtml.includes("data-vnext-find-spaces"));

for (const file of ["index.njk", "_includes/header.njk", "_includes/partials/shared/recommendation-prompt-card.njk", "pages/example-location-brief.njk"]) assert(read(file).includes("/best-fit-locations/"), `${file} must use controlled routing`);
const sampleRegistry = read("_data/sfPublicSampleBriefs.js"); assert(sampleRegistry.includes("/best-fit-locations/") && sampleRegistry.includes("source=example"));
const client = read("js/requirement-prototype.js");
for (const token of ["vnextJourneyId", "industrial_flex", "vnext_brief_created", "vnext_creation_rejected", "reason_code"]) assert(client.includes(token));
const research = read("functions/research-search/[publicId].js");
for (const token of ["Share My Search with Rofo", "location_brief_v2_public_id", "investigationTopics", "vnext_research_submitted", "This is a research request—not an instant inventory search."]) assert(research.includes(token));
assert(research.includes("@media(max-width:700px)") && research.includes("grid-template-columns:1fr"));
const analytics = read("functions/api/analytics/search-profile.js");
for (const event of ["vnext_brief_created", "vnext_creation_rejected", "vnext_entry_fallback", "vnext_research_clicked", "vnext_research_submitted"]) assert(analytics.includes(`\"${event}\"`));
assert(analytics.includes("persistenceConfigured"));
const homepage = read("index.njk"); assert(homepage.includes("Locations worth investigating") && !homepage.includes("Recommended starting path"));

fs.rmSync(temp, { recursive: true, force: true });
console.log("Journey Activation QA passed: controlled routing, seven creation states, active continuation, analytics, and rollback contracts verified.");
