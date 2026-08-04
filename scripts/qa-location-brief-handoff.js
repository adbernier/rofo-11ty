const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    console.error(`Location Brief handoff QA failed: ${message}`);
    process.exit(1);
  }
}

const projectSnapshot = read("functions/_shared/project-snapshot.js");
const locationBriefShared = read("functions/api/location-brief/_shared.js");
const locationBriefSubmit = read("functions/api/location-brief/submit.js");
const leadShared = read("functions/api/leads/_shared.js");
const recommendationsPage = read("pages/recommendations.njk");

[
  "buildProjectSnapshotFromBrief",
  "buildProjectSnapshotFromLead",
  "projectSnapshotTextLines",
  "locationBriefReferenceText",
].forEach((exportName) => {
  assert(projectSnapshot.includes(`export function ${exportName}`), `Project Snapshot module should export ${exportName}.`);
});

[
  "businessType",
  "operationalUse",
  "officeEnvironment",
  "commuteOrientation",
  "expectedGrowth",
  "institutionProximity",
].forEach((field) => {
  assert(locationBriefShared.includes(field), `Location Brief canonicalizer should preserve ${field}.`);
});

assert(locationBriefShared.includes("projectSnapshot: buildProjectSnapshotFromBrief(brief)"), "Canonical Location Brief should store a Project Snapshot.");
assert(locationBriefSubmit.includes("resolveLeadRoute(lead)"), "Location Brief submit should resolve broker/OfficeFinder routing.");
assert(locationBriefSubmit.includes("buildOfficeFinderPayload(lead, env)"), "Location Brief submit should build an OfficeFinder payload for approval.");
assert(locationBriefSubmit.includes("sendApprovalEmail(env, request, lead.record, lead.token)"), "Location Brief submit should send the internal approval notification.");
assert(locationBriefSubmit.includes("officefinder_pending_approval"), "Location Brief lead should record OfficeFinder pending approval status.");
assert(locationBriefSubmit.includes("logPipelineStep(\"lead_created\""), "Location Brief submit should log lead creation.");
assert(locationBriefSubmit.includes("logPipelineStep(\"internal_notification\""), "Location Brief submit should log notification delivery.");

assert(leadShared.includes("locationBriefReferenceText({"), "OfficeFinder comments should reference the Location Brief.");
assert(projectSnapshot.includes("Please review the Location Brief before contacting the client."), "OfficeFinder handoff should ask downstream recipients to review the Brief.");
assert(leadShared.includes("Please review the Brief before contacting the client."), "Broker handoff should ask recipients to review the Brief.");
assert(leadShared.includes("New Rofo ${propertyType} Requirement - ${market}"), "Broker email subject should use property type and market.");
assert(leadShared.includes("Your Location Brief has been created."), "Customer confirmation should reinforce Location Brief creation.");
assert(leadShared.includes("buildProjectSnapshotFromLead(lead)"), "Lead utilities should reuse Project Snapshot from the lead.");
assert(leadShared.includes("appendOfficeFinderAttempt"), "OfficeFinder failures should remain logged on the lead.");
assert(leadShared.includes("approved_send_failed"), "Failed OfficeFinder or broker sends should update lead status instead of dropping the lead.");
assert(leadShared.includes("const usesPlaceholderPhone = !normalizedPhone && (isLocationProfileLead(lead) || isLocationBriefLead(lead));"), "OfficeFinder placeholder phone should apply to Location Brief leads only inside the adapter.");
assert(leadShared.includes("placeholder_phone_used"), "OfficeFinder placeholder phone usage should be logged.");
assert(!leadShared.includes("lead.phone = OFFICEFINDER_LOCATION_PROFILE_PLACEHOLDER_PHONE"), "Stored lead phone should not be overwritten with the OfficeFinder placeholder.");
assert(leadShared.includes("`Phone: ${lead.phone || \"\"}`"), "Broker email should use the stored customer phone, not the OfficeFinder placeholder.");

[
  "office space",
  "flex space",
  "retail space",
  "medical office space",
].forEach((spaceType) => {
  assert(leadShared.includes(spaceType), `Lead/OfficeFinder compatibility should retain ${spaceType} handling.`);
});

assert(recommendationsPage.includes("Discuss This Recommendation With a Broker"), "Production Location Brief broker CTA should remain intact.");
assert(recommendationsPage.includes("/api/location-brief/submit"), "Production Location Brief form should submit to the Location Brief endpoint.");

console.log("Location Brief handoff QA passed.");
