"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const samples = require("../_data/sfPublicSampleBriefs");
const { projectUniversalIntelligence } = require("../lib/intelligence/universal-space-type-intelligence");

const ROOT = path.join(__dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-lb7-qa-"));
execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, "functions/operator/location-brief-v2/[publicId].js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, "renderer.cjs")}`], { stdio: "pipe" });
execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, "shared.cjs")}`], { stdio: "pipe" });
const renderer = require(path.join(temp, "renderer.cjs"));
const shared = require(path.join(temp, "shared.cjs"));

const criterion = (dimension, value) => ({ dimension, value: { text: Array.isArray(value) ? "" : value, list: Array.isArray(value) ? value : [] } });
function requirement(marketId, displayName, propertyType, activities, criteria = []) {
  return { schemaVersion: "requirement:v1", propertyTypes: [propertyType], activities, businessContext: { summary: "QA business" }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, displayName }, specificPreference: { candidateDistrictIds: [], candidateDistrictNames: [] } }, criteria };
}
function bundle(item) {
  return { brief: { publicId: "LB2-00112233445566778899AABB", lifecycleStage: "LOCATION_INVESTIGATE" }, entryContext: { marketId: item.marketId, propertyType: item.propertyType, sourceType: "operator_requirement_interview" }, currentRevision: { id: "revision-1", revisionNumber: 1, requirement: item.requirement }, currentSnapshot: { id: "snapshot-1", schemaVersion: "recommendation-snapshot:v1", readiness: "FULL", shortlist: [{ districtId: "financial-district", districtName: "Financial District", strengths: ["Fabricated local result"], tradeoffs: [] }], candidateAssessments: [], comparisonAlternatives: [], intelligenceGaps: [] }, candidates: [], revisions: [], snapshots: [] };
}

const cases = [
  { id: "novi-industrial", marketId: "novi", market: "Novi", propertyType: "industrial_flex", activities: ["store", "receive", "ship_distribute", "operate_vehicles"], criteria: [criterion("industrial.access.truck_circulation", "Box trucks")], expected: ["Building functionality", "Operational access"] },
  { id: "boise-office", marketId: "boise", market: "Boise", propertyType: "office", activities: ["work", "meet_collaborate"], criteria: [criterion("office.access.client_visits", "Clients visit occasionally")], expected: ["Client and visitor access", "Space configuration"] },
  { id: "nashville-retail", marketId: "nashville", market: "Nashville", propertyType: "retail_service", activities: ["host_visitors", "sell_serve"], criteria: [criterion("retail.customer.destination_visibility", "Visibility matters")], expected: ["Customer environment", "Visibility and storefront"] },
  { id: "boise-flex", marketId: "boise", market: "Boise", propertyType: "industrial_flex", activities: ["work", "display_present", "make_assemble"], criteria: [], expected: ["Use mix", "Customer-facing environment"] },
];

for (const item of cases) {
  item.requirement = requirement(item.marketId, item.market, item.propertyType, item.activities, item.criteria);
  const projection = projectUniversalIntelligence(item.requirement);
  const html = renderer.renderLocationBriefV2Page(bundle(item), true, false, { publicExperience: true });
  assert(html.includes("What matters for this search"), `${item.id} lacks useful universal guidance`);
  assert(html.includes("What we'll investigate next"), `${item.id} lacks investigation guidance`);
  for (const label of item.expected) assert(html.includes(label), `${item.id} lacks ${label}`);
  assert(html.includes(`Rofo has not yet calibrated ${item.market} for automatic location comparison.`));
  assert(!html.includes("Locations worth investigating"), `${item.id} must not render a false shortlist`);
  assert(!html.includes("Fabricated local result") && !html.includes("Financial District"), `${item.id} leaked local resolver output`);
  assert(!/asking rent|vacancy rate|zoning is|available now/i.test(html));
  assert.deepEqual(projection, projectUniversalIntelligence(JSON.parse(JSON.stringify(item.requirement))), `${item.id} projection drifted`);
}

const noviContext = shared.commercialContextForBundle(bundle(cases[0]));
assert.deepEqual(noviContext.universalIntelligence.foundations, ["industrial"]);
assert(noviContext.universalIntelligence.investigationTopics.includes("loading configuration"));
assert.equal(noviContext.universalIntelligence.locationIntelligenceBoundary, "LOCAL_EVIDENCE_REQUIRED");

assert.equal(samples.briefs.length, 9);
for (const sample of samples.briefs) {
  assert(sample.universal.whatMatters.length, `${sample.id} lacks polished universal framing`);
  assert(sample.universal.investigationTopics.length, `${sample.id} lacks investigation topics`);
}
const detail = fs.readFileSync(path.join(ROOT, "pages/example-location-brief-detail.njk"), "utf8");
assert(detail.includes("What matters for this search") && detail.includes("What we'll investigate next"));
assert(detail.includes("sample.universal.whatMatters") && detail.includes("sample.universal.investigationTopics"));
assert(!detail.includes("Level 1") && !detail.includes("Recommendation Intelligence"));
const rendererSource = fs.readFileSync(path.join(ROOT, "functions/operator/location-brief-v2/[publicId].js"), "utf8");
assert(rendererSource.includes("@media(max-width:600px)"));
assert(rendererSource.includes(".lb2-matter-grid,.lb2-investigate-list{grid-template-columns:1fr}"));
assert(!rendererSource.includes("overflow-x"), "Sprint 7 should not mask horizontal overflow");

fs.rmSync(temp, { recursive: true, force: true });
console.log("Location Brief v2 Universal Projection QA passed: certified framing plus four non-certified market cases.");
