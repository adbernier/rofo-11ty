const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-lb2-qa-"));
const bundlePath = path.join(temp, "shared.cjs");
execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${bundlePath}`], { stdio: "pipe" });
const foundation = require(bundlePath);

class MemoryKv {
  constructor() { this.values = new Map(); }
  async put(key, value) { this.values.set(key, value); }
  async get(key, type) { const value = this.values.get(key); return type === "json" && value ? JSON.parse(value) : value || null; }
}
const criterion = (dimension, raw) => ({ dimension, status: "PREFERRED", value: { text: Array.isArray(raw) ? "" : String(raw), number: null, boolean: null, list: Array.isArray(raw) ? raw : [] } });
function requirement(market = "san-francisco", business = "Accounting / professional services", origins = ["San Francisco", "East Bay"], parking = "Convenient parking is helpful") {
  return { schemaVersion: "requirement:v1", propertyTypes: ["office"], locationLogic: { marketAnchor: { marketId: market, geographyId: market, displayName: market }, specificPreference: { candidateDistrictIds: [], candidateDistrictNames: [] } }, businessContext: { summary: business }, criteria: [criterion("universal.location.employee_origins", origins), criterion("office.access.client_visits", "Clients visit frequently"), criterion("universal.access.transit_importance", "Public transit is very important"), criterion("universal.access.parking_importance", parking)], ui: { currentQuestion: "must-not-persist" }, conversation: [{ role: "user", content: "must-not-persist" }] };
}

(async () => {
  const env = { LOCATION_BRIEFS_KV: new MemoryKv(), LOCATION_BRIEF_V2_OPERATOR_ENABLED: "true" };
  assert.equal(foundation.V2_SCHEMA_VERSION, "location-brief:v2");
  assert.equal(foundation.v2Enabled({}), false, "Flag must default off.");
  assert.equal(foundation.operatorAllowed(new Request("http://localhost/api"), env), true);
  assert.equal(foundation.operatorAllowed(new Request("https://rofo.com/api"), env), false, "Production host needs an operator key even when enabled.");

  const contexts = [
    { sourceType: "operator_blank" },
    { sourceType: "city_page", marketId: "san-francisco" },
    { sourceType: "property_type_page", marketId: "san-francisco", propertyType: "office" },
    { sourceType: "district_page", marketId: "san-francisco", candidateDistrictIds: ["jackson-square"] },
    { sourceType: "business_brief", marketId: "san-francisco", propertyType: "office", businessArchetypeId: "architecture-design", businessIdentityId: "architecture-design" },
  ].map(foundation.normalizeEntryContext);
  assert.deepEqual(contexts.map((item) => item.sourceType), ["operator_blank", "city_page", "property_type_page", "district_page", "business_brief"]);

  const created = await foundation.createBrief(env, requirement(), contexts[2]);
  assert.match(created.brief.publicId, /^LB2-[A-F0-9]{24}$/);
  assert.equal(created.brief.schemaVersion, "location-brief:v2");
  assert.equal(created.revision.revisionNumber, 1);
  assert.equal(created.snapshot.readiness, "FULL");
  assert.equal(created.snapshot.requirementRevisionId, created.revision.id);
  assert.equal(created.revision.requirement.ui, undefined);
  assert.equal(created.revision.requirement.conversation, undefined);
  assert.equal(JSON.stringify(created).includes("email"), false);

  let bundle = await foundation.getBriefBundle(env, created.brief.publicId, true);
  assert.equal(bundle.revisions.length, 1); assert.equal(bundle.snapshots.length, 1);
  const cookie = created.setCookie.split(";")[0];
  assert.equal(await foundation.ownsBrief(new Request("http://localhost/", { headers: { cookie } }), bundle.brief), true);
  assert.equal(await foundation.ownsBrief(new Request("http://localhost/"), bundle.brief), false);

  const edited = requirement("san-francisco", "Accounting / professional services", ["San Francisco", "East Bay"], "Convenient parking is very important");
  const revised = await foundation.reviseBrief(env, bundle, edited, 1);
  assert.equal(revised.revision.revisionNumber, 2); assert.equal(revised.snapshot.requirementRevisionId, revised.revision.id);
  bundle = await foundation.getBriefBundle(env, created.brief.publicId, true);
  assert.equal(bundle.revisions.length, 2); assert.equal(bundle.snapshots.length, 2); assert.equal(bundle.currentRevision.revisionNumber, 2);
  await assert.rejects(() => foundation.reviseBrief(env, bundle, edited, 1), (error) => error.status === 409);

  const marin = await foundation.createBrief(env, requirement("san-francisco", "Ordinary Office", ["San Francisco", "Marin / North Bay"], "Convenient parking is very important"), contexts[2]);
  assert.equal(marin.snapshot.readiness, "FULL"); assert(marin.snapshot.shortlist.length > 0);
  const unsupported = await foundation.createBrief(env, requirement("fort-wayne"), { sourceType: "operator_blank" });
  assert.equal(unsupported.snapshot.readiness, "INVESTIGATE"); assert.equal(unsupported.snapshot.shortlist.length, 0);

  const grouped = await foundation.createBrief(env, requirement(), { sourceType: "district_page", marketId: "san-francisco", propertyType: "office", candidateDistrictIds: ["showplace-square", "design-district"] });
  assert.equal(grouped.candidates.length, 1, "Presentation-group members must persist as one candidate geography.");
  assert.equal(grouped.candidates[0].canonicalDistrictId, "showplace-square");
  assert.deepEqual(grouped.candidates[0].provenance.map((item) => item.sourceIdentity).sort(), ["design-district", "showplace-square"]);

  const protectedFiles = ["functions/api/location-brief/_shared.js", "functions/api/location-brief/submit.js", "pages/recommendations.njk"];
  protectedFiles.forEach((file) => assert(!fs.readFileSync(path.join(ROOT, file), "utf8").includes("location-brief-v2"), `${file} must not depend on v2.`));
  assert(fs.readFileSync(path.join(ROOT, "functions/location-brief/[publicId].js"), "utf8").includes("getLocationBriefV2Bundle"), "The stable Brief route must discriminate v2 records without rewriting v1.");
  const submit = fs.readFileSync(path.join(ROOT, "functions/api/location-brief-v2/create.js"), "utf8");
  ["saveLead", "OfficeFinder", "sendApprovalEmail", "sendLocationBriefEmail", "resolveLeadRoute"].forEach((term) => assert(!submit.includes(term), `v2 create must not invoke ${term}.`));
  const renderer = fs.readFileSync(path.join(ROOT, "functions/operator/location-brief-v2/[publicId].js"), "utf8");
  assert(renderer.includes("noindex,nofollow")); assert(!renderer.includes("ownerCapabilityHash"));
  assert(fs.readFileSync(path.join(ROOT, "migrations/0004_location_brief_v2_operator_foundation.sql"), "utf8").includes("location_briefs_v2"));

  fs.rmSync(temp, { recursive: true, force: true });
  console.log("Location Brief v2 operator foundation QA passed.");
})().catch((error) => { console.error(error); process.exit(1); });
