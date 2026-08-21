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
const leadTools = bundle("functions/api/leads/_shared.js", "lead-shared.cjs");

class MemoryKv {
  constructor() { this.values = new Map(); }
  async put(key, value) { this.values.set(key, value); }
  async get(key, type) { const value = this.values.get(key); return type === "json" && value ? JSON.parse(value) : value || null; }
  async delete(key) { this.values.delete(key); }
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
  assert.equal(leadTools.normalizePhoneForOfficeFinder("+1 (415) 555-0198"), "415-555-0198", "A leading US country code must normalize without a false length failure.");
  const env = { LOCATION_BRIEFS_KV: new MemoryKv() }; env.LEADS_KV = env.LOCATION_BRIEFS_KV;
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
  assert.equal(getResponse.headers.get("referrer-policy"), "same-origin", "The property form must retain a trustworthy same-origin navigation source instead of generating Origin: null.");
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
  const submit = async (fields, options = {}) => propertyStage.onRequestPost({
    request: new Request(options.url || `https://rofo.com/property-requirement/${created.brief.publicId}`, {
      method: "POST", headers: { cookie, origin: options.origin || "https://rofo.com", "content-type": "application/x-www-form-urlencoded", ...(options.headers || {}) }, body: new URLSearchParams(fields),
    }), env, params: { publicId: created.brief.publicId },
  });
  const renderCurrent = async () => {
    const response = await propertyStage.onRequestGet({ request: getRequest, env, params: { publicId: created.brief.publicId } });
    return response.text();
  };
  const postResponse = await submit({ draftRevision: "0", questionId: "1", officePurposes: "team_collaboration" });
  assert.equal(postResponse.status, 303); assert(postResponse.headers.get("location").includes(`?saved=1`));
  let currentHtml = await renderCurrent(); assert(currentHtml.includes("Step 2 of 4")); assert(currentHtml.includes("About how much space do you need")); assert(currentHtml.includes('name="approximateSquareFeet"')); assert(currentHtml.includes('name="approximatePeople"'));
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

  const staleResponse = await submit({ draftRevision: "0", questionId: "2", approximatePeople: "18" });
  assert.equal(staleResponse.status, 409);
  const afterRetry = await env.LOCATION_BRIEFS_KV.get(`location-brief-v2:${created.brief.publicId}`, "json");
  assert.equal(afterRetry.propertyRequirementDraft.draftRevision, 1, "A repeated stale submission must not create a duplicate draft revision.");
  const productionAliasResponse = await submit({ draftRevision: "1", questionId: "2", approximatePeople: "18" }, { origin: "https://www.rofo.com" });
  assert.equal(productionAliasResponse.status, 303, "A legitimate www.rofo.com form POST must survive the canonical-host request URL used by Pages.");
  assert(productionAliasResponse.headers.get("location").startsWith("https://www.rofo.com/"));
  currentHtml = await renderCurrent(); assert(currentHtml.includes("Step 3 of 4")); assert(currentHtml.includes("When do you need the space?"));
  const originOmittedRequest = new Request(`https://www.rofo.com/property-requirement/${created.brief.publicId}`, { method: "POST", headers: { cookie, "sec-fetch-site": "same-origin", "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ draftRevision: "2", questionId: "3", timing: "3_to_6_months" }) });
  const originOmittedResponse = await propertyStage.onRequestPost({ request: originOmittedRequest, env, params: { publicId: created.brief.publicId } });
  assert.equal(originOmittedResponse.status, 303, "The observed same-origin production form contract must not require an Origin header when Sec-Fetch-Site is browser-confirmed same-origin.");
  const originOmittedRecord = await env.LOCATION_BRIEFS_KV.get(`location-brief-v2:${created.brief.publicId}`, "json");
  assert.equal(originOmittedRecord.propertyRequirementDraft.draftRevision, 3);
  currentHtml = await renderCurrent(); assert(currentHtml.includes("Step 4 of 4")); assert(currentHtml.includes("must-have space needs")); assert(currentHtml.includes("None / no special requirements"));
  const finishResponse = await submit({ draftRevision: "3", questionId: "4", mustHaves: "dedicated_storage" }); assert.equal(finishResponse.status, 303);
  currentHtml = await renderCurrent(); assert(currentHtml.includes("Your space requirements are ready")); assert(currentHtml.includes("18 people")); assert(currentHtml.includes("3–6 months")); assert(currentHtml.includes("Dedicated storage")); assert(!currentHtml.includes(">Continue</button>"));
  assert(currentHtml.includes("Ready to see what's available?")); assert(currentHtml.includes("Share my search with Rofo")); assert(currentHtml.includes('name="phone"')); assert(!currentHtml.includes('name="phone" autocomplete="tel" required'));
  const completedRecord = await env.LOCATION_BRIEFS_KV.get(`location-brief-v2:${created.brief.publicId}`, "json"); assert.equal(completedRecord.propertyRequirementDraft.draftRevision, 4); assert.equal(completedRecord.propertyRequirementDraft.answers.mustHavesReviewed, true);
  assert.equal([...env.LEADS_KV.values.keys()].filter((key) => key.startsWith("lead:")).length, 0, "Completing the Location and Property Requirements must not create a lead.");
  const shareResponse = await submit({ draftRevision: "4", questionId: "5", action: "share", human_check: "1", name: "Avery Morgan", email: "avery@rofo.com", phone: "" });
  assert.equal(shareResponse.status, 303); assert(shareResponse.headers.get("location").includes("?shared=1"));
  const leadKeys = [...env.LEADS_KV.values.keys()].filter((key) => key.startsWith("lead:")); assert.equal(leadKeys.length, 1, "Explicit Share must create exactly one existing-system lead.");
  const leadRecord = await env.LEADS_KV.get(leadKeys[0], "json"); const lead = leadRecord.lead;
  assert.equal(lead.lead_type, "vnext_market_investigation"); assert.equal(lead.business_type, "Architecture, Design & Creative Services"); assert.equal(lead.location_brief_public_id, created.brief.publicId);
  assert.equal(lead.location_requirement_revision_id, created.revision.id); assert.equal(lead.recommendation_snapshot_id, created.snapshot.id); assert.equal(lead.property_requirement_revision, 4);
  assert.equal(lead.phone, "", "Phone remains optional for the vNext handoff."); assert.equal(lead.qualification_status, "qualified_requirement");
  assert.deepEqual(lead.location_brief_v2_context.recommendation.locationsWorthInvestigating, created.snapshot.shortlist.map((item) => item.districtName));
  assert(lead.location_brief_v2_context.geographySemantics.includes("not hard constraints")); assert(lead.requirements.includes("Team collaboration")); assert(lead.requirements.includes("Dedicated storage"));
  assert.equal(lead.officefinder_status, "officefinder_pending_approval"); assert(leadRecord.officefinder_payload.Comments.includes(`/location-brief/${created.brief.publicId}`));
  const retryResponse = await submit({ draftRevision: "4", questionId: "5", action: "share", human_check: "1", name: "Avery Morgan", email: "avery@rofo.com", phone: "" });
  assert.equal(retryResponse.status, 303); assert.equal([...env.LEADS_KV.values.keys()].filter((key) => key.startsWith("lead:")).length, 1, "A retry of the same completed draft must not create a duplicate lead.");
  const sharedGet = await propertyStage.onRequestGet({ request: new Request(`https://rofo.com/property-requirement/${created.brief.publicId}?shared=1`, { headers: { cookie } }), env, params: { publicId: created.brief.publicId } });
  const sharedHtml = await sharedGet.text(); assert(sharedHtml.includes("Your search has been shared with Rofo")); assert(sharedHtml.includes("can review")); assert(!/will contact|within \d+ (?:hours|days)/i.test(sharedHtml));
  const crossOriginRequest = new Request(`https://rofo.com/property-requirement/${created.brief.publicId}`, { method: "POST", headers: { cookie, origin: "https://attacker.example", "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ draftRevision: "4", questionId: "4" }) });
  const crossOriginResponse = await propertyStage.onRequestPost({ request: crossOriginRequest, env, params: { publicId: created.brief.publicId } });
  assert.equal(crossOriginResponse.status, 403);
  const opaqueOriginRequest = new Request(`https://www.rofo.com/property-requirement/${created.brief.publicId}`, {
    method: "POST", headers: { cookie, origin: "null", "sec-fetch-site": "same-origin", "sec-fetch-mode": "navigate", "sec-fetch-dest": "document", "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ draftRevision: "4", questionId: "4" }),
  });
  const opaqueOriginResponse = await propertyStage.onRequestPost({ request: opaqueOriginRequest, env, params: { publicId: created.brief.publicId } });
  assert.equal(opaqueOriginResponse.status, 403, "An opaque Origin must remain rejected even when Sec-Fetch-Site claims same-origin.");
  const opaqueOriginHtml = await opaqueOriginResponse.text();
  assert(opaqueOriginHtml.includes("We couldn&#39;t save that answer. Please try again."));
  assert(!opaqueOriginHtml.includes("Invalid request origin."), "Security details must not replace the recoverable property shell.");
  const nonOwnerResponse = await propertyStage.onRequestGet({ request: new Request(`https://rofo.com/property-requirement/${created.brief.publicId}`), env, params: { publicId: created.brief.publicId } });
  assert.equal(nonOwnerResponse.status, 403);

  const source = fs.readFileSync(path.join(ROOT, "functions/property-requirement/[publicId].js"), "utf8");
  assert(source.indexOf('form.get("action") === "share"') < source.indexOf("await createCommercialRequest"), "Lead creation must be gated behind the explicit Share action.");
  assert(source.includes("reserveCommercialRequest")); assert(source.includes("sendApprovalEmail")); assert(source.includes("sendTenantConfirmationEmail"));
  const migration = fs.readFileSync(path.join(ROOT, "migrations/0006_location_brief_v2_property_requirement_draft.sql"), "utf8");
  assert(migration.includes("location_brief_v2_property_requirement_drafts")); assert(!migration.includes("drop table"));
  const commercialMigration = fs.readFileSync(path.join(ROOT, "migrations/0007_location_brief_v2_commercial_handoff.sql"), "utf8"); assert(commercialMigration.includes("location_brief_v2_commercial_requests")); assert(!commercialMigration.includes("drop table"));
  const leadSharedSource = fs.readFileSync(path.join(ROOT, "functions/api/leads/_shared.js"), "utf8"); assert(leadSharedSource.includes('leadType === "vnext_market_investigation"')); assert(leadSharedSource.includes('["location_profile", "vnext_market_investigation"]'));
  const adminSource = fs.readFileSync(path.join(ROOT, "functions/admin/leads.js"), "utf8"); assert(adminSource.includes("Locations worth investigating")); assert(adminSource.includes("property_requirement_use")); assert(adminSource.includes("property_requirement_must_haves"));
  const analyticsSource = fs.readFileSync(path.join(ROOT, "functions/api/analytics/search-profile.js"), "utf8"); for (const event of ["property_requirement_completed", "share_search_viewed", "share_search_submitted", "commercial_request_created"]) assert(analyticsSource.includes(`"${event}"`));
  fs.rmSync(temp, { recursive: true, force: true });
  console.log("Location Brief to Property Requirement handoff QA passed.");
})().catch((error) => { console.error(error); process.exit(1); });
