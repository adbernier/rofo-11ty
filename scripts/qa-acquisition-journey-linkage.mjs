import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const attributionSource = read("functions/_shared/acquisition-attribution.js");
const attributionModule = await import(`data:text/javascript;base64,${Buffer.from(attributionSource).toString("base64")}`);
const { acquisitionPresentation, normalizeAcquisition } = attributionModule;

const cases = [
  {
    name: "Norfolk Bing fallback",
    acquisition: { journeyId: "journey-norfolk", sourceType: "city", sourcePath: "/commercial-real-estate/VA/norfolk/", referrer: "https://www.bing.com/", landingPage: "https://www.rofo.com/commercial-real-estate/VA/norfolk/" },
    line: "Source: Bing → Norfolk city page",
  },
  {
    name: "Google certified property type",
    acquisition: { journeyId: "journey-sacramento", sourceType: "space_type", sourcePath: "/commercial-real-estate/CA/sacramento/industrial-space/", referrer: "https://www.google.com/", landingPage: "https://www.rofo.com/commercial-real-estate/CA/sacramento/industrial-space/" },
    line: "Source: Google → Sacramento Industrial page",
  },
  {
    name: "Direct homepage",
    acquisition: { journeyId: "journey-home", sourceType: "homepage", sourcePath: "/", referrer: "", landingPage: "https://www.rofo.com/" },
    line: "Source: Direct → Homepage",
  },
  {
    name: "Unsupported market investigation",
    acquisition: { journeyId: "journey-unsupported", sourceType: "city", sourcePath: "/commercial-real-estate/VA/norfolk/", referrer: "https://www.bing.com/", landingPage: "https://www.rofo.com/commercial-real-estate/VA/norfolk/" },
    line: "Source: Bing → Norfolk city page",
  },
  {
    name: "Missing referrer with known source path",
    acquisition: { journeyId: "journey-known-path", sourceType: "city", sourcePath: "/commercial-real-estate/VA/norfolk/", referrer: "" },
    line: "Source: Unknown → Norfolk city page",
  },
  { name: "Missing acquisition", acquisition: null, line: "Source: Unknown" },
  { name: "Historical lead without linkage", acquisition: undefined, line: "Source: Unknown" },
];

for (const fixture of cases) {
  assert.equal(acquisitionPresentation(fixture.acquisition).line, fixture.line, fixture.name);
}

const norfolk = normalizeAcquisition(cases[0].acquisition);
assert.equal(normalizeAcquisition({ sourcePath: "/commercial-real-estate/VA/norfolk/?email=private%40example.com" }).sourcePath, "/commercial-real-estate/VA/norfolk/", "Dashboard-safe source paths must omit query strings");
const downstreamLead = { source: "location_brief", rofo_source: "location_brief", acquisition: norfolk };
assert.equal(acquisitionPresentation(downstreamLead.acquisition).line, cases[0].line, "Downstream source must not overwrite original acquisition");
assert.equal(downstreamLead.source, "location_brief", "Fulfillment provenance must remain available separately");

const requirementClient = read("js/requirement-prototype.js");
const searchProfile = read("js/search-profile.js");
const recommendations = read("js/recommendation-context.js");
const legacyBrief = read("functions/api/location-brief/_shared.js");
const legacyLead = read("functions/api/location-brief/submit.js");
const v2Brief = read("functions/api/location-brief-v2/_shared.js");
const v2Lead = read("functions/api/leads/submit.js");
const propertyLead = read("functions/property-requirement/[publicId].js");
const admin = read("functions/admin/leads.js");

assert(requirementClient.includes("journeyId: vnextJourneyId") && requirementClient.includes("storedAcquisition"), "New Requirement entry must send the originating journey and acquisition snapshot");
assert(searchProfile.includes("rofoOriginalAcquisitionV1") && searchProfile.includes("acquisition:"), "Fallback search profile must preserve original acquisition into recommendation context");
assert(recommendations.includes("acquisition: context.acquisition || existing.acquisition || null"), "Recommendation handoff must retain acquisition on the legacy Brief payload");
assert(legacyBrief.includes("acquisition: normalizeAcquisition(input.acquisition)"), "Legacy canonical Brief must snapshot acquisition");
assert(legacyLead.includes("acquisition: brief.acquisition || null") && legacyLead.includes("originating_journey_id"), "Legacy continuation lead must carry Brief acquisition linkage");
assert(v2Brief.includes("journeyId: acquisition?.journeyId") && v2Brief.includes("acquisition: normalizeAcquisition(bundle?.entryContext)"), "v2 Brief entry context and commercial projection must retain acquisition");
assert(v2Lead.includes("lead.acquisition = context.acquisition") && v2Lead.includes("originating_requirement_revision_id"), "v2 form continuation must carry acquisition and revision linkage");
assert(propertyLead.includes("acquisition: context.acquisition || null") && propertyLead.includes("originating_brief_id"), "v2 property continuation must carry acquisition and Brief linkage");
assert(admin.includes("lead-card__acquisition") && admin.includes("Source: Unknown") === false, "Dashboard must render canonical acquisition through the shared formatter");

console.log(`Acquisition journey linkage QA passed (${cases.length} attribution cases).`);
