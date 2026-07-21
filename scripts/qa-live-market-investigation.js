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
  scenario("Two-building district", {
    label: "Jackson Square",
    slug: "jackson-square",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/jackson-square/",
  }),
  scenario("Thin district", {
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
const locationBriefShared = read("functions/api/location-brief/_shared.js");
const locationBriefSubmit = read("functions/api/location-brief/submit.js");
const adminLeads = read("functions/admin/leads.js");
const publicBrief = read("functions/location-brief/[publicId].js");

[
  ["data-live-market-investigation-intake", "intake panel"],
  ["data-live-market-building-options", "building selection options"],
  ["data-investigation-competitive-buildings", "competitive buildings option"],
  ["data-live-market-scope-options", "scope controls"],
  ["data-live-market-timing", "timing control"],
  ["data-live-market-broker-preference", "broker preference controls"],
].forEach(([token, label]) => requireIncludes(recommendationPage, token, label));

[
  ["live_market_investigation_started", "started analytics"],
  ["live_market_investigation_building_toggled", "building toggle analytics"],
  ["live_market_investigation_scope_selected", "scope analytics"],
  ["live_market_investigation_submitted", "submitted analytics"],
  ["live_market_investigation_submission_failed", "failed analytics"],
  ["collectInvestigationFormState", "submission state collection"],
  ["liveMarketInvestigation", "investigation state"],
  ["Start Market Investigation", "investigation submit state"],
].forEach(([token, label]) => requireIncludes(recommendationContext, token, label));

[
  ["normalizeLiveMarketInvestigation", "server-side investigation normalizer"],
  ["normalizeInvestigationBuilding", "server-side building sanitizer"],
  ["investigationHtmlBlock", "internal email investigation block"],
].forEach(([token, label]) => requireIncludes(locationBriefShared, token, label));

[
  ["live_market_investigation", "lead type"],
  ["market_investigation_requested", "lead status"],
  ["investigation_buildings", "lead building summary"],
  ["investigation_scope", "lead scope summary"],
].forEach(([token, label]) => requireIncludes(locationBriefSubmit, token, label));

[
  ["isInvestigationLead", "admin investigation detector"],
  ["Live Market Investigation", "admin investigation section"],
  ["market_investigation_requested", "admin investigation status"],
].forEach(([token, label]) => requireIncludes(adminLeads, token, label));

requireIncludes(publicBrief, "renderInvestigation", "public Location Brief investigation renderer");

if (generatedRecommendationPage && !generatedRecommendationIsStale) {
  [
    "data-live-market-investigation-intake",
    "data-live-market-scope-options",
    "data-investigation-competitive-buildings",
    "data-location-brief-submit-button",
  ].forEach((token) => requireIncludes(generatedRecommendationPage, token, `generated recommendation markup ${token}`));
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
  if (item.label === "Two-building district" && (!item.shown || item.buildings.length !== 2)) {
    errors.push("Two-building district did not resolve exactly two investigation buildings.");
  }
  if (item.label === "Thin district" && item.shown) {
    errors.push("Thin district rendered representative buildings when it should remain district-level.");
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

console.log("Live Market Investigation QA");
scenarios.forEach((item) => {
  console.log(`\n${item.label}`);
  console.log(`District: ${item.district}`);
  console.log(`Module shown: ${item.shown ? "yes" : `no (${item.reason})`}`);
  console.log(`Buildings carried: ${item.buildings.length ? item.buildings.map((building) => building.name).join(", ") : "district-level only"}`);
});
console.log(`\nErrors: ${errors.length ? errors.join("; ") : "none"}`);
console.log(`Warnings: ${warnings.length ? warnings.join("; ") : "none"}`);

if (errors.length) process.exit(1);
