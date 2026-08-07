const fs = require("fs");
const path = require("path");
const { normalizeSfOfficeProfile } = require("../lib/recommendations/normalize-sf-office-profile");
const { resolveSfOfficeRecommendation } = require("../lib/recommendations/sf-office-recommendation-resolver");

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`SF Office production integration QA failed: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
}

function ids(items) {
  return (items || []).map((item) => item.districtId || item.slug || item.label);
}

const recommendationsPage = read("pages/recommendations.njk");
const recommendationContext = read("js/recommendation-context.js");
const eleventyConfig = read(".eleventy.js");
const projectSnapshot = read("functions/_shared/project-snapshot.js");
const locationBriefSubmit = read("functions/api/location-brief/submit.js");

assert(recommendationsPage.includes("sf-office-recommendation-model-data"), "recommendations page should embed the SF Office model data.");
assert(recommendationsPage.includes("/js/recommendations/normalize-sf-office-profile.js"), "recommendations page should load the shared SF Office normalizer.");
assert(recommendationsPage.includes("/js/recommendations/sf-office-recommendation-resolver.js"), "recommendations page should load the shared SF Office resolver.");
assert(eleventyConfig.includes("lib/recommendations/normalize-sf-office-profile.js"), "Eleventy should copy the shared normalizer to the public JS path.");
assert(eleventyConfig.includes("lib/recommendations/sf-office-recommendation-resolver.js"), "Eleventy should copy the shared resolver to the public JS path.");
assert(recommendationContext.includes("structuredSfOfficeState(context, profiles) || resolveMarketPath"), "SF Office structured state should be tried before the legacy graph fallback.");
assert(recommendationContext.includes("context.modelKey !== \"san-francisco:office\""), "structured resolver should be scoped to san-francisco:office.");
assert(recommendationContext.includes("resolveMarketPath(context, graph, profiles)"), "legacy recommendation fallback should remain available.");

assert(!recommendationsPage.includes("Questions to Validate"), "customer-facing validation section should be removed.");
assert(!recommendationsPage.includes("What a broker can validate"), "broker-first validation heading should be removed.");
assert(recommendationsPage.includes("What we'll research"), "execution section should use customer-centered research language.");
assert(recommendationsPage.includes("data-live-market-headcount"), "availability request should capture headcount.");
assert(recommendationsPage.includes("data-live-market-size"), "availability request should capture approximate size.");
assert(recommendationsPage.includes("data-live-market-timing"), "availability request should capture timing.");
assert(recommendationsPage.includes("data-live-market-notes"), "availability request should capture additional notes.");
assert(!recommendationsPage.includes("data-live-market-budget"), "availability request should not ask for budget/rent context.");
assert(!recommendationsPage.includes("data-live-market-broker-preference"), "availability request should not expose broker-routing preference.");
assert(projectSnapshot.includes("selectedDistrict"), "Project Snapshot should include selected district.");
assert(projectSnapshot.includes("headcount"), "Project Snapshot should include headcount.");
assert(projectSnapshot.includes("additionalNotes"), "Project Snapshot should include additional notes.");
assert(locationBriefSubmit.includes("investigation_headcount"), "Location Brief lead should persist execution headcount.");
assert(locationBriefSubmit.includes("investigation_approximate_size"), "Location Brief lead should persist execution approximate size.");

const defectSourceAnswers = {
  city: "San Francisco",
  market: "San Francisco",
  locations: [{ label: "San Francisco", type: "city", city: "San Francisco", state: "CA" }],
  spaceType: "Office",
  modelKey: "san-francisco:office",
  businessType: "design_creative",
  operationalUse: ["client_meetings", "team_collaboration"],
  officeEnvironment: "Historic and Distinctive",
  expectedGrowth: "low",
};

const normalized = normalizeSfOfficeProfile(defectSourceAnswers);
const result = resolveSfOfficeRecommendation(normalized.resolverProfile);
const shortlistIds = ids(result.shortlist);
const currentIds = ids(result.currentCandidates);
const missionBay = result.currentCandidates.find((item) => item.districtId === "mission-bay");
const jacksonSquare = result.currentCandidates.find((item) => item.districtId === "jackson-square");

assert(normalized.supported === true, "defect profile should normalize to supported san-francisco:office.");
assert(shortlistIds[0] === "jackson-square", `defect profile should lead with Jackson Square, got ${shortlistIds[0] || "none"}.`);
assert(shortlistIds.includes("soma"), "defect profile should keep SoMa in the calibrated shortlist.");
assert(currentIds.includes("financial-district"), "defect profile should preserve Financial District as a secondary/current candidate.");
assert(currentIds.includes("south-beach"), "defect profile should preserve South Beach as a secondary/current candidate.");
assert(jacksonSquare && missionBay && jacksonSquare.score > missionBay.score, "Mission Bay must not outrank Jackson Square in the defect profile.");
assert(result.profileSignalsUsed.includes("design_creative_historic_client_facing"), "defect profile should trigger the calibrated cross-signal fit.");

console.log(`Defect profile structured shortlist: ${shortlistIds.join(", ")}`);
console.log(`Defect profile scores: Jackson Square ${jacksonSquare && jacksonSquare.score}; Mission Bay ${missionBay && missionBay.score}`);

if (failures) {
  process.exitCode = 1;
} else {
  console.log("SF Office production integration QA passed.");
}
