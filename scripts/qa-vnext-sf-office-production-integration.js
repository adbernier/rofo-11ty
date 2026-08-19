const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-vnext-public-qa-"));
const bundlePath = path.join(temp, "shared.cjs");
execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${bundlePath}`], { stdio: "pipe" });
const foundation = require(bundlePath);

assert.equal(foundation.publicV2Enabled({}), false, "The public rollout flag must default OFF.");
assert.equal(foundation.publicV2Enabled({ LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_ENABLED: "true" }), true);
assert.equal(foundation.publicSourceAllowed({}, "space_type"), true);
assert.equal(foundation.publicSourceAllowed({}, "district"), true);
assert.equal(foundation.publicSourceAllowed({}, "city"), false, "The initial rollout must not implicitly take all SF city traffic.");
assert.equal(foundation.publicSourceAllowed({ LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES: "business_brief" }, "business_brief"), true);
assert.equal(foundation.isSfOfficeEntryContext({ marketId: "san-francisco", propertyType: "office" }), true);
assert.equal(foundation.isSfOfficeEntryContext({ marketId: "san-francisco", propertyType: "medical" }), false);
assert.equal(foundation.isSfOfficeEntryContext({ marketId: "oakland", propertyType: "office" }), false);
assert.equal(foundation.isSfOfficeRequirement({ propertyTypes: ["office"], locationLogic: { marketAnchor: { marketId: "san-francisco" } } }), true);
assert.equal(foundation.isSfOfficeRequirement({ propertyTypes: ["medical"], locationLogic: { marketAnchor: { marketId: "san-francisco" } } }), false);
assert.equal(foundation.sameOriginMutation(new Request("https://rofo.com/api", { headers: { origin: "https://rofo.com" } })), true);
assert.equal(foundation.sameOriginMutation(new Request("https://rofo.com/api", { headers: { origin: "https://attacker.example" } })), false);

const entryRoute = read("functions/location-requirement/index.js");
assert(entryRoute.includes("publicV2Enabled"));
assert(entryRoute.includes("isSfOfficeEntryContext"));
assert(entryRoute.includes('new URL("/find-locations/"'));
const requirementPage = read("pages/location-requirement.njk");
assert(requirementPage.includes("data-requirement-experience=\"public\""));
assert(requirementPage.includes("Show recommended locations"));
assert(!requirementPage.includes("Operator-only"));
assert(!requirementPage.includes("Save Location Brief v2"));

const requirementClient = read("js/requirement-prototype.js");
assert(requirementClient.includes("vnext_requirement_started"));
assert(requirementClient.includes("vnext_requirement_completed"));
assert(requirementClient.includes("fallback.searchParams.set"), "Unsupported property selections must fall back to the existing journey.");
const createApi = read("functions/api/location-brief-v2/create.js");
assert(createApi.includes("isSfOfficeRequirement"));
assert(createApi.includes("sameOriginMutation"));
assert(createApi.includes("/location-brief/"));
["saveLead", "OfficeFinder", "resolveLeadRoute", "sendApprovalEmail", "sendTenantConfirmationEmail"].forEach((term) => assert(!createApi.includes(term), `Brief creation must not invoke ${term}.`));

const stableRoute = read("functions/location-brief/[publicId].js");
assert(stableRoute.includes("/^LB2-[A-F0-9]{24}$/"));
assert(stableRoute.includes("getLocationBrief(env, publicId)"), "The unchanged v1 read path must remain present.");
assert(stableRoute.includes("renderLocationBriefV2Page"));
const renderer = read("functions/operator/location-brief-v2/[publicId].js");
assert(renderer.includes("publicExperience"));
assert(renderer.includes("vnext_brief_viewed"));
assert(renderer.includes("vnext_district_explored"));
assert(renderer.includes("vnext_find_spaces_clicked"));
assert(renderer.includes("locationBrief"));
assert(renderer.includes("noindex,nofollow"));
assert(!renderer.includes("editToken"));

const district = read("pages/commercial-real-estate/neighborhood.njk");
assert(district.includes("(?:operator\\/location-brief-v2|location-brief)"));
const analytics = read("functions/api/analytics/search-profile.js");
["vnext_requirement_started", "vnext_requirement_completed", "vnext_brief_viewed", "vnext_district_explored", "vnext_requirement_edited", "vnext_find_spaces_clicked", "vnext_commercial_request_submitted"].forEach((event) => assert(analytics.includes(`\"${event}\"`)));
const searchProfile = read("js/search-profile.js");
assert(searchProfile.includes("location_brief_v2_public_id"));
assert(searchProfile.includes("vnext_commercial_request_submitted"));
const leadShared = read("functions/api/leads/_shared.js");
assert(leadShared.includes("location_brief_v2_url"));

const migration = read("migrations/0005_location_brief_v2_public_sf_office.sql");
assert(migration.includes("location_brief_v2_intelligence_gaps"));
assert(!migration.includes("drop table"));
assert(!migration.includes("location_briefs "), "The public migration must not mutate the v1 table.");
assert(read("functions/api/location-brief-v2/_shared.js").includes("gapStatements"));

fs.rmSync(temp, { recursive: true, force: true });
console.log("Rofo vNext SF Office production integration QA passed.");
