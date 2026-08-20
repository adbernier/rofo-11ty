const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-location-property-qa-"));
function bundle(source, output) {
  execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, output)}`], { stdio: "pipe" });
  return require(path.join(temp, output));
}
const foundation = bundle("functions/api/location-brief-v2/_shared.js", "shared.cjs");
const renderer = bundle("functions/operator/location-brief-v2/[publicId].js", "renderer.cjs");
const propertyStage = bundle("functions/property-requirement/[publicId].js", "property.cjs");

class MemoryKv {
  constructor() { this.values = new Map(); }
  async put(key, value) { this.values.set(key, value); }
  async get(key, type) { const value = this.values.get(key); return type === "json" && value ? JSON.parse(value) : value || null; }
}
const criterion = (dimension, raw) => ({ dimension, status: "PREFERRED", value: { text: Array.isArray(raw) ? "" : String(raw), number: null, boolean: null, list: Array.isArray(raw) ? raw : [] } });
const requirement = {
  schemaVersion: "requirement:v1",
  propertyTypes: ["office"],
  locationLogic: { marketAnchor: { marketId: "san-francisco", geographyId: "san-francisco", displayName: "San Francisco" }, specificPreference: { candidateDistrictIds: [], candidateDistrictNames: [] } },
  businessContext: { summary: "Architecture, Design & Creative Services" },
  criteria: [
    criterion("universal.business.type", "Architecture, Design & Creative Services"),
    criterion("office.environment.image", "Creative and distinctive"),
    criterion("universal.location.employee_origins", ["San Francisco", "Marin / North Bay"]),
    criterion("office.access.client_visits", "Clients visit occasionally"),
    criterion("universal.access.transit_importance", "Public transit is helpful"),
    criterion("universal.access.parking_importance", "Convenient parking is helpful"),
  ],
};

(async () => {
  const env = { LOCATION_BRIEFS_KV: new MemoryKv() };
  const created = await foundation.createBrief(env, requirement, { sourceType: "district", sourcePath: "/commercial-real-estate/CA/san-francisco/marina-district/", marketId: "san-francisco", propertyType: "office" });
  const cookie = created.setCookie.split(";")[0];
  const bundleState = await foundation.getBriefBundle(env, created.brief.publicId, true);
  const publicHtml = renderer.renderLocationBriefV2Page(bundleState, true, false, { publicExperience: true });
  assert(publicHtml.includes("LOCATION SEARCH") || publicHtml.includes("Location search"));
  assert(publicHtml.includes("Your Location Brief"));
  assert(publicHtml.includes("Architecture, Design &amp; Creative Services"));
  assert(publicHtml.includes("Locations worth investigating"));
  assert(publicHtml.includes("data-location-focus-root"));
  assert.equal((publicHtml.match(/data-focus-button=/g) || []).length, created.snapshot.shortlist.length);
  created.snapshot.shortlist.forEach((item, index) => {
    const start = publicHtml.indexOf(`data-focus-panel="${item.districtId}"`);
    const nextItem = created.snapshot.shortlist[index + 1];
    const end = nextItem ? publicHtml.indexOf(`data-focus-panel="${nextItem.districtId}"`, start + 1) : publicHtml.indexOf("</section>", start);
    const panel = publicHtml.slice(start, end > start ? end : undefined);
    assert(start >= 0, `${item.districtName} must have an interactive rich focus panel.`);
    if (item.presentation?.image?.src) assert(panel.includes(item.presentation.image.src), `${item.districtName} must use its own approved image projection.`);
    (item.presentation?.representativeBuildings || []).forEach((building) => assert(panel.includes(building.name), `${item.districtName} must use its own representative buildings when focused.`));
  });
  assert(!publicHtml.includes("Recommended by Rofo"));
  assert(!publicHtml.includes("Alternative worth comparing"));
  assert(!/>\s*#(?:1|2|3)\s*</.test(publicHtml));
  assert(!publicHtml.includes("Areas you're considering"));
  assert(publicHtml.includes("See available spaces in these locations"));
  assert(publicHtml.includes("Continue →"));
  assert(publicHtml.includes('class="requirement-search-summary"'));
  assert(publicHtml.includes('class="requirement-search-summary__item"'));
  assert(publicHtml.includes(`/property-requirement/${created.brief.publicId}`));
  assert(!publicHtml.includes("/find-locations/"), "Eligible v2 continuation must not enter the legacy Business Profile flow.");

  const getRequest = new Request(`https://rofo.com/property-requirement/${created.brief.publicId}`, { headers: { cookie } });
  const getResponse = await propertyStage.onRequestGet({ request: getRequest, env, params: { publicId: created.brief.publicId } });
  assert.equal(getResponse.status, 200);
  const propertyHtml = await getResponse.text();
  assert(propertyHtml.includes("Tell us what you need in a space"));
  assert(propertyHtml.includes("How will you use the space?"));
  assert(propertyHtml.includes('class="requirement-search-summary"'));
  assert(propertyHtml.includes("Architecture, Design &amp; Creative Services"));
  assert(!propertyHtml.includes("Professional services"), "Canonical business identity must not pass through the legacy taxonomy.");
  assert(propertyHtml.includes("San Francisco"));
  assert(propertyHtml.includes("Office"));
  for (const district of created.snapshot.shortlist.map((item) => item.districtName)) assert(propertyHtml.includes(district));
  assert(propertyHtml.includes(`/location-brief/${created.brief.publicId}`));
  assert(!propertyHtml.includes("What kind of business"));
  assert(!propertyHtml.includes("Where do employees"));
  assert(!propertyHtml.includes("First space question")); assert(!propertyHtml.includes("lead")); assert(!propertyHtml.includes("broker"));
  assert(!propertyHtml.includes("Save and continue")); assert(propertyHtml.includes(">Continue</button>"));

  const before = await env.LOCATION_BRIEFS_KV.get(`location-brief-v2:${created.brief.publicId}`, "json");
  const postRequest = new Request(`https://rofo.com/property-requirement/${created.brief.publicId}`, {
    method: "POST", headers: { cookie, origin: "https://rofo.com", "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ draftRevision: "0", officePurposes: "team_collaboration" }),
  });
  const postResponse = await propertyStage.onRequestPost({ request: postRequest, env, params: { publicId: created.brief.publicId } });
  assert.equal(postResponse.status, 303);
  assert(postResponse.headers.get("location").includes(`/property-requirement/${created.brief.publicId}?saved=1`));
  const after = await env.LOCATION_BRIEFS_KV.get(`location-brief-v2:${created.brief.publicId}`, "json");
  assert.equal(after.brief.publicId, before.brief.publicId);
  assert.deepEqual(after.entryContext, before.entryContext, "Source attribution and EntryContext must remain unchanged.");
  assert.equal(after.revisions.length, before.revisions.length, "Property-stage answers must not overwrite or revise the Location Requirement.");
  assert.equal(after.snapshots.length, before.snapshots.length, "Property-stage answers must not recalculate Location Intelligence.");
  assert.equal(after.propertyRequirementDraft.schemaVersion, "property-requirement-draft:v1");
  assert.equal(after.propertyRequirementDraft.locationRequirementRevisionId, created.revision.id);
  assert.equal(after.propertyRequirementDraft.recommendationSnapshotId, created.snapshot.id);
  assert.deepEqual(after.propertyRequirementDraft.answers.officePurposes, ["team_collaboration"]);
  assert.equal(after.propertyRequirementDraft.draftRevision, 1);
  assert.equal([...env.LOCATION_BRIEFS_KV.values.keys()].some((key) => /lead|officefinder|broker/i.test(key)), false);

  const staleRequest = new Request(`https://rofo.com/property-requirement/${created.brief.publicId}`, {
    method: "POST", headers: { cookie, origin: "https://rofo.com", "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ draftRevision: "0", officePurposes: "client_meetings" }),
  });
  const staleResponse = await propertyStage.onRequestPost({ request: staleRequest, env, params: { publicId: created.brief.publicId } });
  assert.equal(staleResponse.status, 409);
  const afterRetry = await env.LOCATION_BRIEFS_KV.get(`location-brief-v2:${created.brief.publicId}`, "json");
  assert.equal(afterRetry.propertyRequirementDraft.draftRevision, 1, "A repeated stale submission must not create a duplicate draft revision.");
  const productionAliasRequest = new Request(`https://rofo.com/property-requirement/${created.brief.publicId}`, {
    method: "POST", headers: { cookie, origin: "https://www.rofo.com", "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ draftRevision: "1", officePurposes: "quiet_focused_work" }),
  });
  const productionAliasResponse = await propertyStage.onRequestPost({ request: productionAliasRequest, env, params: { publicId: created.brief.publicId } });
  assert.equal(productionAliasResponse.status, 303, "A legitimate www.rofo.com form POST must survive the canonical-host request URL used by Pages.");
  assert(productionAliasResponse.headers.get("location").startsWith("https://www.rofo.com/"));
  const crossOriginRequest = new Request(`https://rofo.com/property-requirement/${created.brief.publicId}`, {
    method: "POST", headers: { cookie, origin: "https://attacker.example", "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ draftRevision: "2", officePurposes: "client_meetings" }),
  });
  const crossOriginResponse = await propertyStage.onRequestPost({ request: crossOriginRequest, env, params: { publicId: created.brief.publicId } });
  assert.equal(crossOriginResponse.status, 403);
  const nonOwnerResponse = await propertyStage.onRequestGet({ request: new Request(`https://rofo.com/property-requirement/${created.brief.publicId}`), env, params: { publicId: created.brief.publicId } });
  assert.equal(nonOwnerResponse.status, 403);

  const source = fs.readFileSync(path.join(ROOT, "functions/property-requirement/[publicId].js"), "utf8");
  for (const forbidden of ["saveLead", "OfficeFinder", "resolveLeadRoute", "sendApprovalEmail", "sendTenantConfirmationEmail"]) assert(!source.includes(forbidden));
  const migration = fs.readFileSync(path.join(ROOT, "migrations/0006_location_brief_v2_property_requirement_draft.sql"), "utf8");
  assert(migration.includes("location_brief_v2_property_requirement_drafts")); assert(!migration.includes("drop table"));
  fs.rmSync(temp, { recursive: true, force: true });
  console.log("Location Brief to Property Requirement handoff QA passed.");
})().catch((error) => { console.error(error); process.exit(1); });
