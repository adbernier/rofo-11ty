const fs = require("fs");
const path = require("path");

const recommendationRepresentativeBuildings = require("../_data/recommendationRepresentativeBuildings");
const { resolveForDistrict } = require("../js/recommendation-representative-buildings");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function scenario(label, district) {
  const result = resolveForDistrict(district, recommendationRepresentativeBuildings);
  return {
    label,
    district: district.label,
    city: district.city,
    shown: result.shown,
    reason: result.reason,
    buildings: result.buildings || [],
  };
}

const scenarios = [
  scenario("Mature San Francisco district", {
    label: "Mission Bay",
    slug: "mission-bay",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/mission-bay/",
  }),
  scenario("Jackson Square representative district", {
    label: "Jackson Square",
    slug: "jackson-square",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/jackson-square/",
  }),
  scenario("Dogpatch representative district", {
    label: "Dogpatch",
    slug: "dogpatch",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/dogpatch/",
  }),
  scenario("Non-San-Francisco market", {
    label: "Downtown Sacramento",
    slug: "downtown-sacramento",
    city: "Sacramento",
    state: "CA",
    path: "/commercial-real-estate/CA/sacramento/downtown-sacramento/",
  }),
];

const errors = [];
const warnings = [];

function requireIncludes(source, token, label) {
  if (!source.includes(token)) errors.push(`Missing ${label}: ${token}`);
}

function rejectIncludes(source, token, label) {
  if (source.includes(token)) errors.push(`Unexpected ${label}: ${token}`);
}

const recommendationPage = read("pages/recommendations.njk");
const generatedRecommendationPath = path.join(root, "_site/recommendations/index.html");
const generatedRecommendationPage = fs.existsSync(generatedRecommendationPath)
  ? read("_site/recommendations/index.html")
  : "";
const generatedRecommendationIsStale = generatedRecommendationPage
  ? fs.statSync(path.join(root, "pages/recommendations.njk")).mtimeMs > fs.statSync(generatedRecommendationPath).mtimeMs
  : false;
const recommendationContext = read("js/recommendation-context.js");
const analyticsSearchProfile = read("functions/api/analytics/search-profile.js");
const locationBriefShared = read("functions/api/location-brief/_shared.js");
const locationBriefSubmit = read("functions/api/location-brief/submit.js");
const adminLeads = read("functions/admin/leads.js");
const publicBrief = read("functions/location-brief/[publicId].js");

[
  ["data-live-market-investigation-intake", "intake panel"],
  ["data-live-market-timing", "timing control"],
  ["data-live-market-headcount", "execution headcount field"],
  ["data-live-market-size", "execution approximate-size field"],
  ["data-live-market-notes", "execution additional-notes field"],
].forEach(([token, label]) => requireIncludes(recommendationPage, token, label));

[
  ["data-live-market-building-options", "removed building selection options"],
  ["data-investigation-competitive-buildings", "removed competitive buildings option"],
  ["data-live-market-scope-options", "removed scope controls"],
  ["data-live-market-budget", "removed execution budget context field"],
  ["data-live-market-broker-preference", "removed broker preference controls"],
].forEach(([token, label]) => rejectIncludes(recommendationPage, token, label));

[
  ["live_market_investigation_started", "started analytics"],
  ["live_market_investigation_building_toggled", "building toggle analytics"],
  ["live_market_investigation_scope_selected", "scope analytics"],
  ["live_market_investigation_submitted", "submitted analytics"],
  ["live_market_investigation_submission_failed", "failed analytics"],
  ["live_market_investigation_duplicate_resolved", "duplicate-resolved analytics"],
  ["live_market_investigation_confirmation_sent", "confirmation-sent analytics"],
  ["live_market_investigation_confirmation_failed", "confirmation-failed analytics"],
  ["collectInvestigationFormState", "submission state collection"],
  ["investigationSubmissionToken", "stable investigation submission token"],
  ["submissionToken", "investigation submission token persistence"],
  ["liveMarketInvestigation", "investigation state"],
  ["Request Current Availability", "availability request submit state"],
].forEach(([token, label]) => requireIncludes(recommendationContext, token, label));

[
  ["normalizeLiveMarketInvestigation", "server-side investigation normalizer"],
  ["normalizeInvestigationBuilding", "server-side building sanitizer"],
  ["sendLiveMarketInvestigationConfirmationEmail", "user confirmation email sender"],
  ["confirmationEmail", "canonical confirmation-email status"],
  ["Headcount", "customer email headcount context"],
  ["Approximate size", "customer email size context"],
].forEach(([token, label]) => requireIncludes(locationBriefShared, token, label));

[
  ["location_brief_idempotency", "idempotency table"],
  ["reserveInvestigationIdempotency", "idempotency reservation"],
  ["completeInvestigationIdempotency", "idempotency completion"],
  ["releaseInvestigationIdempotency", "idempotency release on failed persistence"],
  ["normalizedInvestigationFingerprint", "revised-request fingerprint"],
  ["duplicateResolved", "duplicate retry response"],
  ["live_market_investigation", "lead type"],
  ["market_investigation_requested", "lead status"],
  ["investigation_request_id", "lead investigation request id"],
  ["investigation_idempotency_hash", "lead idempotency state"],
  ["investigation_confirmation_email_status", "lead confirmation status"],
  ["investigation_buildings", "lead building summary"],
  ["investigation_scope", "lead scope summary"],
].forEach(([token, label]) => requireIncludes(locationBriefSubmit, token, label));

[
  ["isInvestigationLead", "admin investigation detector"],
  ["Live Market Investigation metadata", "admin advanced investigation metadata"],
  ["market_investigation_requested", "admin investigation status"],
  ["Confirmation email", "admin confirmation email status"],
  ["Idempotency", "admin idempotency state"],
  ["<summary>More Details</summary>", "collapsed more details section"],
].forEach(([token, label]) => requireIncludes(adminLeads, token, label));

[
  ["live_market_investigation_duplicate_resolved", "allowed duplicate analytics"],
  ["live_market_investigation_confirmation_sent", "allowed confirmation analytics"],
  ["live_market_investigation_confirmation_failed", "allowed confirmation-failed analytics"],
].forEach(([token, label]) => requireIncludes(analyticsSearchProfile, token, label));

requireIncludes(publicBrief, "renderInvestigation", "public Location Brief investigation renderer");

if (generatedRecommendationPage && !generatedRecommendationIsStale) {
  [
    "data-live-market-investigation-intake",
    "data-live-market-headcount",
    "data-live-market-size",
    "data-live-market-notes",
    "data-location-brief-submit-button",
  ].forEach((token) => requireIncludes(generatedRecommendationPage, token, `generated recommendation markup ${token}`));
  [
    "data-live-market-scope-options",
    "data-investigation-competitive-buildings",
    "data-live-market-budget",
    "data-live-market-broker-preference",
  ].forEach((token) => rejectIncludes(generatedRecommendationPage, token, `generated recommendation markup ${token}`));
  ["undefined", "N/A", "[object Object]"].forEach((token) => rejectIncludes(generatedRecommendationPage, token, "generated placeholder output"));
} else {
  warnings.push(generatedRecommendationPage
    ? "Generated recommendations page is stale; run npm run build for markup checks."
    : "Generated recommendations page not found; run npm run build for markup checks.");
}

scenarios.forEach((item) => {
  if (item.label === "Mature San Francisco district" && (!item.shown || item.buildings.length !== 3)) {
    errors.push("Mature district did not resolve exactly three investigation buildings.");
  }
  if (item.label === "Jackson Square representative district" && (!item.shown || item.buildings.length !== 3)) {
    errors.push("Jackson Square did not resolve exactly three investigation buildings.");
  }
  if (item.label === "Dogpatch representative district" && (!item.shown || item.buildings.length !== 3)) {
    errors.push("Dogpatch did not resolve exactly three investigation buildings.");
  }
  if (item.label === "Non-San-Francisco market" && item.shown) {
    errors.push("Non-San-Francisco unsupported market rendered San Francisco building assumptions.");
  }
  const seen = new Set();
  item.buildings.forEach((building) => {
    if (!building.name || !building.canonicalUrl) errors.push(`${item.label}: malformed building card data`);
    if (seen.has(building.buildingId)) errors.push(`${item.label}: duplicate building ${building.name}`);
    seen.add(building.buildingId);
  });
});

const reliabilityScenarios = [
  {
    scenario: "Normal submission",
    idempotencyKeyReused: "no",
    expectedLocationBriefCount: 1,
    expectedLeadCount: 1,
    expectedInternalEmailCount: 1,
    expectedUserEmailCount: "0 or 1, depending on email availability and provider configuration",
    expectedResponse: "ok, received",
    expectedEmailStatus: "sent, not_configured, not_sent, or failed",
    duplicateHandled: "no",
  },
  {
    scenario: "Double click / network retry",
    idempotencyKeyReused: "yes",
    expectedLocationBriefCount: 1,
    expectedLeadCount: 1,
    expectedInternalEmailCount: 1,
    expectedUserEmailCount: "not resent",
    expectedResponse: "ok, duplicate_resolved or processing",
    expectedEmailStatus: "original status returned",
    duplicateHandled: "yes",
  },
  {
    scenario: "Revised request",
    idempotencyKeyReused: "same token, changed fingerprint",
    expectedLocationBriefCount: "new request allowed",
    expectedLeadCount: "new request allowed",
    expectedInternalEmailCount: "sent for new request",
    expectedUserEmailCount: "eligible for new confirmation",
    expectedResponse: "ok, received",
    expectedEmailStatus: "new request status",
    duplicateHandled: "no",
  },
  {
    scenario: "Missing email",
    idempotencyKeyReused: "no",
    expectedLocationBriefCount: 1,
    expectedLeadCount: 1,
    expectedInternalEmailCount: 1,
    expectedUserEmailCount: 0,
    expectedResponse: "ok, received",
    expectedEmailStatus: "not_sent",
    duplicateHandled: "no",
  },
  {
    scenario: "Confirmation email failure",
    idempotencyKeyReused: "retry uses same key",
    expectedLocationBriefCount: 1,
    expectedLeadCount: 1,
    expectedInternalEmailCount: 1,
    expectedUserEmailCount: "failed once; not duplicated on retry",
    expectedResponse: "ok, received",
    expectedEmailStatus: "failed",
    duplicateHandled: "retry resolves to original success",
  },
  {
    scenario: "Legacy Location Brief submission",
    idempotencyKeyReused: "not required",
    expectedLocationBriefCount: "unchanged legacy behavior",
    expectedLeadCount: "unchanged legacy behavior",
    expectedInternalEmailCount: "unchanged legacy behavior",
    expectedUserEmailCount: "not applicable",
    expectedResponse: "ok, submitted",
    expectedEmailStatus: "not_applicable",
    duplicateHandled: "not applicable",
  },
];

if (!locationBriefSubmit.includes("live-market-investigation:v1:")) {
  errors.push("Idempotency key namespace is missing.");
}
if (locationBriefSubmit.includes("Math.random") || locationBriefSubmit.includes("Date.now()")) {
  errors.push("Server-side idempotency must not rely on random or timestamp-only values.");
}
if (!locationBriefSubmit.includes("sendLocationBriefEmail") || !locationBriefSubmit.includes("sendLiveMarketInvestigationConfirmationEmail")) {
  errors.push("Internal and user confirmation emails are not both represented in the submission handler.");
}
if (!locationBriefSubmit.includes("createLocationBriefLead(env, request, brief, url)")) {
  errors.push("Investigation lead creation path was not found.");
}
if (!locationBriefSubmit.includes("confirmationEmail.sent ? \"\" : confirmationEmail.reason")) {
  warnings.push("Could not verify confirmation-email failure reason is stored in canonical investigation data.");
}

console.log("Live Market Investigation QA");
scenarios.forEach((item) => {
  console.log(`\n${item.label}`);
  console.log(`District: ${item.district}`);
  console.log(`Module shown: ${item.shown ? "yes" : `no (${item.reason})`}`);
  console.log(`Buildings carried: ${item.buildings.length ? item.buildings.map((building) => building.name).join(", ") : "district-level only"}`);
});

console.log("\nReliability scenarios");
reliabilityScenarios.forEach((item) => {
  console.log(`\n${item.scenario}`);
  console.log(`Idempotency key reused: ${item.idempotencyKeyReused}`);
  console.log(`Location Brief count: ${item.expectedLocationBriefCount}`);
  console.log(`Lead count: ${item.expectedLeadCount}`);
  console.log(`Internal email count: ${item.expectedInternalEmailCount}`);
  console.log(`User email count: ${item.expectedUserEmailCount}`);
  console.log(`API response: ${item.expectedResponse}`);
  console.log(`Email status: ${item.expectedEmailStatus}`);
  console.log(`Duplicate handled: ${item.duplicateHandled}`);
});
console.log(`\nErrors: ${errors.length ? errors.join("; ") : "none"}`);
console.log(`Warnings: ${warnings.length ? warnings.join("; ") : "none"}`);

if (errors.length) process.exit(1);
