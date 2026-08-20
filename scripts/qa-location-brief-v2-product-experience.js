const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-lb2-product-qa-"));
function bundle(source, output) {
  execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, output)}`], { stdio: "pipe" });
  return require(path.join(temp, output));
}
const foundation = bundle("functions/api/location-brief-v2/_shared.js", "shared.cjs");
const renderer = bundle("functions/operator/location-brief-v2/[publicId].js", "renderer.cjs");

class MemoryKv {
  constructor() { this.values = new Map(); }
  async put(key, value) { this.values.set(key, value); }
  async get(key, type) { const value = this.values.get(key); return type === "json" && value ? JSON.parse(value) : value || null; }
}
const criterion = (dimension, raw) => ({ dimension, status: "PREFERRED", value: { text: Array.isArray(raw) ? "" : String(raw), number: null, boolean: null, list: Array.isArray(raw) ? raw : [] } });
function requirement({ business = "Accounting / professional services", origins = ["San Francisco", "East Bay"], clients = "Clients visit frequently", transit = "Public transit is very important", parking = "Convenient parking is helpful", property = "office", candidates = [], customerOrigins = [], environment = "" } = {}) {
  return { schemaVersion: "requirement:v1", propertyTypes: [property], locationLogic: { marketAnchor: { marketId: "san-francisco", geographyId: "san-francisco", displayName: "San Francisco" }, specificPreference: { candidateDistrictIds: candidates, candidateDistrictNames: candidates.map((item) => item === "showplace-square" ? "Showplace Square" : item.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ")) } }, businessContext: { summary: business }, criteria: [criterion("universal.business.type", business), criterion("office.environment.image", environment), criterion("universal.location.employee_origins", origins), criterion("office.access.client_visits", clients), criterion("universal.location.customer_origins", customerOrigins), criterion("universal.access.transit_importance", transit), criterion("universal.access.parking_importance", parking)] };
}
async function render(env, created, debug = false) {
  const cookie = created.setCookie.split(";")[0];
  const request = new Request(`http://localhost/operator/location-brief-v2/${created.brief.publicId}${debug ? "?debug=1" : ""}`, { headers: { cookie } });
  const response = await renderer.onRequestGet({ request, env, params: { publicId: created.brief.publicId } });
  assert.equal(response.status, 200); return response.text();
}

(async () => {
  const env = { LOCATION_BRIEFS_KV: new MemoryKv(), LOCATION_BRIEF_V2_OPERATOR_ENABLED: "true" };
  const conventional = await foundation.createBrief(env, requirement(), { sourceType: "operator_requirement_interview", marketId: "san-francisco", propertyType: "office" });
  const full = await render(env, conventional);
  assert(full.includes("<h1>Your Location Brief</h1>"));
  assert(full.includes("Office · San Francisco"));
  assert(full.includes("<h2>Your search</h2>"));
  assert(full.includes("<h2>Locations worth investigating</h2>"));
  assert(full.includes("Why it fits")); assert(full.includes("Tradeoffs")); assert(full.includes("How they differ"));
  assert(full.includes("data-location-focus-root"));
  assert.equal((full.match(/data-focus-button=/g) || []).length, conventional.snapshot.shortlist.length, "Every supported location should be a peer focus option.");
  assert(full.includes("Representative buildings"), "Focused location should reuse canonical representative-building presentation.");
  assert(full.includes("These are representative examples, not current availability."));
  assert(!full.includes("Areas you're considering"), "An empty candidate section should be omitted.");
  assert(full.includes("Now let&#39;s find the right space")); assert(full.includes("Continue my search"));
  assert(!full.includes("Recommended by Rofo")); assert(!full.includes("Alternative worth comparing"));
  assert(full.includes("Edit my search")); assert(full.includes("data-brief-explore"));
  assert(!full.includes(">FULL<")); assert(!full.includes("STRONG_FIT")); assert(!full.includes("GOOD_FIT"));
  assert(!full.includes("Requirement revision")); assert(!full.includes("Operator diagnostics")); assert(!full.includes("Canonical current Requirement"));

  const architecture = await foundation.createBrief(env, requirement({ business: "Architecture / design firm", origins: ["San Francisco"], clients: "Clients rarely or never visit" }), { sourceType: "operator_requirement_interview", marketId: "san-francisco", propertyType: "office" });
  const architectureHtml = await render(env, architecture);
  assert.equal((architectureHtml.match(/Showplace Square \/ Design District/g) || []).length >= 1, true);
  assert(!architectureHtml.includes("Design District</h3>") || architectureHtml.includes("Showplace Square / Design District</h3>"));

  const marin = await foundation.createBrief(env, requirement({ business: "Ordinary Office", origins: ["San Francisco", "Marin / North Bay"], clients: "Clients rarely or never visit", transit: "Public transit is helpful", parking: "Convenient parking is very important" }), { sourceType: "operator_requirement_interview", marketId: "san-francisco", propertyType: "office" });
  const marinHtml = await render(env, marin);
  assert(marinHtml.includes("<h2>Locations worth investigating</h2>")); assert(marinHtml.includes("Presidio"));
  assert(!marinHtml.includes("BLOCKED_BY_INTELLIGENCE_GAP")); assert(!marinHtml.includes("coverage %"));

  const medical = await foundation.createBrief(env, requirement({ business: "Medical private practice", property: "medical", origins: ["Marin / North Bay"], clients: "Patients visit regularly", customerOrigins: ["San Francisco", "Marin / North Bay"], transit: "Public transit is not important", parking: "Convenient parking is very important" }), { sourceType: "operator_requirement_interview", marketId: "san-francisco", propertyType: "medical" });
  const investigate = await render(env, medical);
  assert(investigate.includes("<h2>What matters most</h2>")); assert(investigate.includes("Continue my search"));
  assert(investigate.includes("Medical-compatible use")); assert(!investigate.includes('<article class="lb2-rec'));
  assert(!investigate.includes(`/property-requirement/${medical.brief.publicId}`), "Medical must not enter the Office property-stage continuation.");
  assert(!investigate.includes("Technology"));

  const mission = await foundation.createBrief(env, requirement({ candidates: ["mission-bay"] }), { sourceType: "operator_requirement_interview", marketId: "san-francisco", propertyType: "office", candidateDistrictIds: ["mission-bay"] });
  assert.equal(mission.snapshot.candidateAssessments[0].assessmentStatus, "WELL_SUPPORTED");
  assert.equal(mission.snapshot.candidateAssessments[0].presentation.image.src, "/assets/images/districts/mission-bay/mission-bay-streetscape.webp");
  assert.equal(mission.snapshot.candidateAssessments[0].presentation.representativeBuildings.length, 3);
  const storedMission = await env.LOCATION_BRIEFS_KV.get(`location-brief-v2:${mission.brief.publicId}`, "json");
  storedMission.snapshots[0].readiness = "INVESTIGATE";
  storedMission.snapshots[0].shortlist = [];
  storedMission.snapshots[0].comparisonAlternatives = [];
  storedMission.brief.lifecycleStage = "LOCATION_INVESTIGATE";
  await env.LOCATION_BRIEFS_KV.put(`location-brief-v2:${mission.brief.publicId}`, JSON.stringify(storedMission));
  const missionInvestigate = await render(env, mission);
  assert(missionInvestigate.includes("<h2>Area you're considering</h2>"));
  assert(missionInvestigate.includes("Mission Bay"));
  assert(missionInvestigate.includes("Why it may fit your search"));
  assert(missionInvestigate.includes("Things to weigh"));
  assert(missionInvestigate.includes("mission-bay-streetscape.webp"));
  assert(missionInvestigate.includes("Representative buildings"));
  assert(!missionInvestigate.includes("Employee access from San Francisco."), "Non-additive Requirement recap should not be repeated as guidance.");

  const exactMissionRequirement = requirement({
    business: "Architecture, Design & Creative Services", environment: "Modern and energetic",
    candidates: ["mission-bay"], origins: ["Across the Bay Area / mixed"],
    clients: "Clients rarely or never visit", transit: "Public transit is helpful", parking: "Convenient parking is helpful",
  });
  const exactMission = await foundation.createBrief(env, exactMissionRequirement, { sourceType: "operator_requirement_interview", marketId: "san-francisco", propertyType: "office", candidateDistrictIds: ["mission-bay"] });
  assert.equal(exactMission.snapshot.readiness, "FULL");
  assert.equal(exactMission.snapshot.shortlist.length, 3);
  assert.equal(exactMission.snapshot.candidateAssessments[0].assessmentStatus, "WELL_SUPPORTED");
  assert.equal(exactMission.snapshot.candidateAssessments[0].componentResult.office.band, "STRONG");
  assert.equal(exactMission.snapshot.candidateAssessments[0].componentResult.environment.band, "STRONG");
  assert.equal(exactMission.snapshot.candidateAssessments[0].componentResult.accessComponent.treatment, "NO_DOMINANT_ACCESS_SOLUTION");
  assert(exactMission.snapshot.candidateAssessments[0].presentation.image);
  assert.equal(exactMission.snapshot.candidateAssessments[0].presentation.representativeBuildings.length, 3);
  assert.equal(exactMission.snapshot.comparisonAlternatives.length, 0, "FULL guidance uses the unchanged shortlist comparison rather than candidate-led INVESTIGATE alternatives.");
  const exactHtml = await render(env, exactMission);
  assert(exactHtml.includes("Why it may fit your search"));
  assert(exactHtml.includes("Things to weigh"));
  assert(exactHtml.includes("Strong fit for ordinary office use"));
  assert(exactHtml.includes("modern and polished setting selected"));
  assert(exactHtml.includes("mission-bay-streetscape.webp"));
  assert(exactHtml.includes("Representative buildings"));
  assert(exactHtml.includes('href="/commercial-real-estate/CA/san-francisco/mission-bay/"'));
  assert(!exactHtml.includes("Another area worth considering"));
  assert(exactHtml.includes("How they differ"));
  assert(!exactHtml.includes("Runner-up")); assert(!exactHtml.includes("Second best")); assert(!exactHtml.includes("Recommended alternative"));
  assert(!exactHtml.includes("A district shortlist would imply"));
  assert(!exactHtml.includes("Employee access from Across the Bay Area / mixed."));

  const noCandidateSnapshot = foundation.calculateSnapshot(requirement({
    business: "Architecture, Design & Creative Services", environment: "Modern and energetic",
    origins: ["Across the Bay Area / mixed"], clients: "Clients rarely or never visit",
    transit: "Public transit is helpful", parking: "Convenient parking is helpful",
  }));
  assert.equal(noCandidateSnapshot.readiness, exactMission.snapshot.readiness);
  const shortlistShape = (snapshot) => snapshot.shortlist.map((item) => ({ districtId: item.districtId, compositionBand: item.compositionBand, tieKey: item.tieKey }));
  assert.deepEqual(shortlistShape(noCandidateSnapshot), shortlistShape(exactMission.snapshot));
  const scoredShape = (snapshot) => snapshot.plausibleUniverse.map((item) => ({ districtId: item.districtId, compositionBand: item.compositionBand, office: item.dimensions.propertyTypeFit.band, access: item.dimensions.accessIntelligence.band, environment: item.dimensions.businessEnvironment.band }));
  assert.deepEqual(scoredShape(noCandidateSnapshot), scoredShape(exactMission.snapshot), "Candidate selection must not affect component results or ordering inputs.");
  const sharedSource = fs.readFileSync(path.join(ROOT, "functions/api/location-brief-v2/_shared.js"), "utf8");
  const comparisonSelectorSource = sharedSource.slice(sharedSource.indexOf("function comparisonAlternatives"), sharedSource.indexOf("export function calculateSnapshot"));
  assert(!comparisonSelectorSource.includes('"soma"')); assert(!comparisonSelectorSource.includes('"mission-bay"'), "Comparison selector must not hard-code districts.");
  const rendererSource = fs.readFileSync(path.join(ROOT, "functions/operator/location-brief-v2/[publicId].js"), "utf8");
  const focusScript = rendererSource.slice(rendererSource.indexOf("var root=document.querySelector('[data-comparison-focus-root]')"));
  assert(!focusScript.includes("fetch(")); assert(!focusScript.includes("locationBriefV2=edit"));

  const medicalCandidate = await foundation.createBrief(env, requirement({ business: "Medical private practice", property: "medical", candidates: ["mission-bay"], origins: ["Marin / North Bay"], customerOrigins: ["San Francisco", "Marin / North Bay"] }), { sourceType: "operator_requirement_interview", marketId: "san-francisco", propertyType: "medical", candidateDistrictIds: ["mission-bay"] });
  assert.equal(medicalCandidate.snapshot.candidateAssessments[0].assessmentStatus, "INSUFFICIENT");
  assert.equal(medicalCandidate.snapshot.comparisonAlternatives.length, 0);
  assert.equal(medicalCandidate.snapshot.candidateAssessments[0].reasons.length, 0);
  const medicalCandidateHtml = await render(env, medicalCandidate);
  assert(medicalCandidateHtml.includes("does not yet have enough reviewed intelligence"));
  assert(!medicalCandidateHtml.includes("Why it may fit your search"));

  const debug = await render(env, conventional, true);
  assert(debug.includes("Operator diagnostics")); assert(debug.includes("Requirement revision")); assert(debug.includes("Plausible universe and component fits")); assert(debug.includes("Candidate provenance")); assert(debug.includes("Canonical current Requirement"));
  const nonOwnerDebugResponse = await renderer.onRequestGet({ request: new Request(`http://localhost/operator/location-brief-v2/${conventional.brief.publicId}?debug=1`), env, params: { publicId: conventional.brief.publicId } });
  const nonOwnerDebug = await nonOwnerDebugResponse.text();
  assert(!nonOwnerDebug.includes("Operator diagnostics")); assert(!nonOwnerDebug.includes("Canonical current Requirement"));

  const districtTemplate = fs.readFileSync(path.join(ROOT, "pages/commercial-real-estate/neighborhood.njk"), "utf8");
  assert(districtTemplate.includes("rofoLocationBriefV2Return")); assert(districtTemplate.includes("Back to my Location Brief"));
  assert(districtTemplate.includes("(?:operator\\/location-brief-v2|location-brief)"), "Return target must be restricted to an operator or stable public v2 Brief route.");
  assert(!districtTemplate.includes("locationBriefV2Owner")); assert(!districtTemplate.includes("ownerCapability"));
  assert(districtTemplate.includes('canonical: "{{ metadata.siteUrl }}{{ neighborhood.canonical_neighborhood_path }}"'), "District canonical must remain unchanged.");
  assert(!full.includes("?brief="), "Explore URLs must remain canonical public district URLs.");

  const before = await foundation.getBriefBundle(env, conventional.brief.publicId, true);
  const revised = await foundation.reviseBrief(env, before, requirement({ transit: "Public transit is helpful" }), 1);
  assert.equal(revised.revision.revisionNumber, 2);
  const after = await foundation.getBriefBundle(env, conventional.brief.publicId, true);
  assert.equal(after.brief.publicId, conventional.brief.publicId); assert.equal(after.revisions.length, 2); assert.equal(after.snapshots.length, 2);
  const editedHtml = await render(env, conventional);
  assert(!editedHtml.includes("Revision 2")); assert(!editedHtml.includes("Snapshot"));

  fs.rmSync(temp, { recursive: true, force: true });
  console.log("Location Brief v2 product experience QA passed.");
})().catch((error) => { console.error(error); process.exit(1); });
