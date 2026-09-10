"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const voice = require("../lib/presentation/customer-voice-v1");

const requirement = { propertyTypes: ["industrial_flex"], businessContext: { summary: "Distribution and service operation" } };
const fixtures = [
  ["sacramento-full", "FULL", ["northgate-north-market-industrial", "power-inn-industrial"]],
  ["sacramento-bounded", "BOUNDED", ["power-inn-industrial"]],
  ["indianapolis-full", "FULL", ["indianapolis-airport-logistics", "park-100-northwest-indianapolis"]],
  ["indianapolis-bounded", "BOUNDED", ["park-100-northwest-indianapolis"]],
  ["phoenix-full", "FULL", ["southwest-phoenix-industrial", "airport-south-central-industrial", "north-phoenix-advanced-operations"]],
  ["phoenix-bounded", "BOUNDED", ["airport-south-central-industrial"]],
  ["san-diego", "FULL", ["miramar", "otay-mesa"]],
  ["north-orange-county", "FULL", ["fullerton-industrial-service-area", "anaheim-canyon"]]
];
const item = id => ({ districtId: id, districtName: id.replaceAll("-", " "), strengths: ["Reviewed evidence supports a useful operating environment."], tradeoffs: ["Confirm loading, power and current availability at each building."] });
for (const [id, readiness, ids] of fixtures) {
  const snapshot = { readiness, shortlist: ids.map(item) };
  const before = JSON.stringify(snapshot);
  const result = voice.projectLocationBrief({ snapshot, requirement, market: id.split("-")[0] });
  assert.equal(JSON.stringify(snapshot), before, `${id}: projection mutated canonical snapshot`);
  assert.deepEqual(result.locations.map(location => location.id), ids, `${id}: shortlist/order changed`);
  assert.equal(result.heading, ids.length === 1 ? "One area to start with" : ids.length === 2 ? "Two areas worth comparing" : `${ids.length} areas worth comparing`);
  assert.equal(result.locations.every(location => !location.worthKnowing.length), true, `${id}: property checks leaked into Worth knowing`);
  assert(result.confirm.some(value => /loading|availability|building/i.test(value)), `${id}: property checks not consolidated`);
  const customerCopy = JSON.stringify({ heading: result.heading, intro: result.intro, locations: result.locations, comparison: result.comparison, confirmHeading: result.confirmHeading, confirm: result.confirm, next: result.next });
  assert.equal(voice.lintCustomerText(customerCopy).filter(finding => finding.severity === "ERROR").length, 0, `${id}: internal jargon leaked`);
}

const investigateSnapshot = { readiness: "INVESTIGATE", shortlist: [], intelligenceGaps: ["CAPABILITY_DOMINANT"] };
const investigate = voice.projectLocationBrief({ snapshot: investigateSnapshot, requirement, market: "Sacramento" });
assert.equal(investigate.heading, "A little more detail will help narrow the location");
assert.equal(investigate.confirmHeading, "What we'll ask next");
assert(!`${investigate.heading} ${investigate.intro} ${investigate.confirmHeading}`.includes("INVESTIGATE"), "Customer outcome must not expose INVESTIGATE");

const futureSnapshot = { readiness: "FULL", shortlist: [{ districtId: "future-market-river-corridor", districtName: "River Corridor", propertyTypeFit: { summary: "Reviewed warehouse and production district." }, strengths: ["Reviewed evidence supports warehouse and production businesses."], tradeoffs: [] }] };
const future = voice.projectLocationBrief({ snapshot: futureSnapshot, requirement, market: "Future Market" });
assert.equal(future.locations[0].id, "future-market-river-corridor");
assert(!JSON.stringify(future).match(/reviewed evidence|applicability|bounded/i), "Future market should inherit Customer Voice without registration");
assert.equal(future.heading, "One area to start with");

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-customer-voice-qa-"));
const output = path.join(temp, "renderer.cjs");
execFileSync(path.join(__dirname, "../node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "../functions/operator/location-brief-v2/[publicId].js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${output}`], { stdio: "pipe" });
const renderer = require(output);
for (const [id, readiness, ids] of [...fixtures, ["future-market", "FULL", ["future-market-river-corridor"]], ["investigate", "INVESTIGATE", []]]) {
  const marketId = id.startsWith("san-diego") ? "san-diego" : id.startsWith("north-orange") ? "orange-county" : id.split("-")[0];
  const composition = marketId === "sacramento" ? "sacramento-industrial-flex-evidence-foundation:v1" : marketId === "indianapolis" ? "indianapolis-industrial-flex-evidence-foundation:v1" : marketId === "phoenix" ? "phoenix-industrial-flex-evidence-foundation:v1" : marketId === "san-diego" ? "san-diego-industrial-flex-composition-foundation:v1" : marketId === "orange-county" ? "north-orange-county-industrial-flex-evidence-foundation:v1" : "future-market-standard:v1";
  const displayName = marketId.replaceAll("-", " ").replace(/\b\w/g, letter => letter.toUpperCase());
  const req = { ...requirement, locationLogic: { marketAnchor: { marketId, geographyId: marketId, displayName }, specificPreference: { candidateDistrictIds: [], candidateDistrictNames: [] } }, criteria: [] };
  const snapshot = { readiness, shortlist: ids.map(item), foundationVersions: { composition }, intelligenceGaps: readiness === "INVESTIGATE" ? ["NEEDS_DETAIL"] : [], candidateAssessments: [], comparisonAlternatives: [] };
  const bundle = { brief: { publicId: "LB2-000000000000000000000000" }, entryContext: { marketId, propertyType: "industrial_flex" }, currentRevision: { requirement: req }, currentSnapshot: snapshot, candidates: [] };
  const html = renderer.renderLocationBriefV2Page(bundle, true, false, { publicExperience: true });
  const visible = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&#39;/g, "'");
  const renderedErrors = voice.lintCustomerText(visible).filter(finding => finding.severity === "ERROR");
  assert.equal(renderedErrors.length, 0, `${id}: rendered customer copy leaked internal language: ${JSON.stringify(renderedErrors)}`);
  assert(!/Not a stated priority|Things to weigh|Representative environments|What Rofo will investigate/i.test(visible), `${id}: retired customer language rendered`);
}
fs.rmSync(temp, { recursive: true, force: true });

console.log(`Universal Location Brief Customer Voice v1 QA passed: ${fixtures.length} current-market states, rendered lint, INVESTIGATE translation, immutable semantics, and unregistered future-market default.`);
