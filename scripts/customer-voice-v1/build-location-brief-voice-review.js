"use strict";
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, "visual-review/rofo-customer-voice-v1-production");
fs.mkdirSync(path.join(OUT, "html"), { recursive: true });
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-customer-voice-renderer-"));
const bundled = path.join(temp, "renderer.cjs");
execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, "functions/operator/location-brief-v2/[publicId].js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${bundled}`], { stdio: "pipe" });
const renderer = require(bundled);
const facts = require(path.join(ROOT, "lib/presentation/customer-voice-v1")).DISTRICT_FACTS;

const item = id => ({ districtId: id, districtName: facts[id]?.name || id.replaceAll("-", " ").replace(/\b\w/g, letter => letter.toUpperCase()), strengths: facts[id]?.why || [facts[id]?.distinction || "A useful area to compare for this search."], tradeoffs: ["Confirm loading, clear height, power, suite configuration and current availability at each building."], propertyTypeFit: { summary: facts[id]?.distinction || "A useful commercial setting." }, presentation: { representativeBuildings: [{ name: `${facts[id]?.name || "District"} commercial setting`, representativeKind: "COMMERCIAL_ENVIRONMENT", representativeReason: "Shows the range of commercial space found in the area.", availabilitySemantics: "REPRESENTATIVE_ONLY_NOT_AVAILABILITY", provenance: ["review-fixture"] }] } });
function page({ id, marketId, market, readiness, ids, composition }) {
  const requirement = { schemaVersion: "requirement:v1", propertyTypes: ["industrial_flex"], activities: ["store", "dispatch"], businessContext: { summary: "Warehouse, service and field operation" }, locationLogic: { marketAnchor: { marketId, geographyId: marketId, displayName: market }, specificPreference: { candidateDistrictIds: [], candidateDistrictNames: [] } }, criteria: [] };
  const snapshot = { id: `snapshot-${id}`, readiness, shortlist: ids.map(item), intelligenceGaps: readiness === "INVESTIGATE" ? ["CAPABILITY_DOMINANT"] : [], candidateAssessments: [], comparisonAlternatives: [], foundationVersions: { composition } };
  const bundle = { brief: { publicId: "LB2-000000000000000000000000", lifecycleStage: readiness === "INVESTIGATE" ? "LOCATION_INVESTIGATE" : "LOCATIONS_RECOMMENDED" }, entryContext: { marketId, propertyType: "industrial_flex", sourceType: "review" }, currentRevision: { id: "revision", revisionNumber: 1, requirement }, currentSnapshot: snapshot, candidates: [], revisions: [], snapshots: [] };
  fs.writeFileSync(path.join(OUT, `html/${id}.html`), renderer.renderLocationBriefV2Page(bundle, true, false, { publicExperience: true }));
}
const scenarios = [
  { id: "sacramento-full", marketId: "sacramento", market: "Sacramento", readiness: "FULL", ids: ["northgate-north-market-industrial", "power-inn-industrial"], composition: "sacramento-industrial-flex-evidence-foundation:v1" },
  { id: "sacramento-bounded", marketId: "sacramento", market: "Sacramento", readiness: "BOUNDED", ids: ["power-inn-industrial"], composition: "sacramento-industrial-flex-evidence-foundation:v1" },
  { id: "sacramento-investigate", marketId: "sacramento", market: "Sacramento", readiness: "INVESTIGATE", ids: [], composition: "sacramento-industrial-flex-evidence-foundation:v1" },
  { id: "indianapolis-full", marketId: "indianapolis", market: "Indianapolis", readiness: "FULL", ids: ["indianapolis-airport-logistics", "park-100-northwest-indianapolis"], composition: "indianapolis-industrial-flex-evidence-foundation:v1" },
  { id: "phoenix-multi", marketId: "phoenix", market: "Phoenix", readiness: "FULL", ids: ["airport-south-central-industrial", "southwest-phoenix-industrial", "north-phoenix-advanced-operations"], composition: "phoenix-industrial-flex-evidence-foundation:v1" },
  { id: "san-diego-structural", marketId: "san-diego", market: "San Diego", readiness: "FULL", ids: ["miramar", "otay-mesa"], composition: "san-diego-industrial-flex-composition-foundation:v1" },
  { id: "north-oc-structural", marketId: "orange-county", market: "North Orange County", readiness: "FULL", ids: ["fullerton-industrial-service-area", "anaheim-canyon"], composition: "north-orange-county-industrial-flex-evidence-foundation:v1" }
];
scenarios.forEach(page);
fs.writeFileSync(path.join(OUT, "manifest.json"), `${JSON.stringify({ schemaVersion: "customer-voice-visual-review:v1", scenarios: scenarios.map(({ id, market, readiness, ids }) => ({ id, market, readiness, ids, html: `html/${id}.html`, desktop: `desktop-${id}.png`, mobile: `mobile-${id}.png` })) }, null, 2)}\n`);
fs.rmSync(temp, { recursive: true, force: true });
console.log(`Built ${scenarios.length} production-shaped Customer Voice review pages in ${OUT}`);
