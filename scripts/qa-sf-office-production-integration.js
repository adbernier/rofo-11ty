const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { normalizeSfOfficeProfile } = require("../lib/recommendations/normalize-sf-office-profile");
const { resolveSfOfficeRecommendation } = require("../lib/recommendations/sf-office-recommendation-resolver");
const sfOfficeRecommendationModel = require("../_data/sfOfficeRecommendationModel");
const recommendationProfiles = require("../_data/recommendationProfiles");

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
assert(recommendationContext.includes("shouldWaitForSfOfficeStructuredResolver(context)"), "SF Office production rendering should wait for structured resolver assets instead of prematurely falling back to the legacy graph.");
assert(recommendationContext.includes("recommendationSource: \"structured_sf_office\""), "structured SF Office Best Fit items should retain their structured source marker.");
assert(recommendationContext.includes("? item.summary || enriched.summary"), "structured Best Fit summaries should not be overwritten by legacy district profile copy.");

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

function pageMappingHarness() {
  const context = {
    window: {
      __ROFO_RECOMMENDATION_CONTEXT_TEST__: true,
      RofoSfOfficeRecommendationModel: sfOfficeRecommendationModel,
      RofoSfOfficeProfileNormalizer: { normalizeSfOfficeProfile },
      RofoSfOfficeRecommendationResolver: { resolveSfOfficeRecommendation },
      sessionStorage: { getItem: () => null, setItem: () => {} },
      localStorage: { getItem: () => null, setItem: () => {} },
      setTimeout: () => {},
    },
    console,
    setTimeout: () => {},
  };
  context.window.window = context.window;
  vm.createContext(context);
  vm.runInContext(recommendationContext, context, { filename: "js/recommendation-context.js" });
  return context.window.RofoRecommendationContextTest;
}

const pageMapper = pageMappingHarness();
assert(pageMapper, "production recommendation context test harness should be available.");

const pageContext = pageMapper.normalizeContext(defectSourceAnswers);
const pageState = pageMapper.structuredSfOfficeState(pageContext, recommendationProfiles);
const renderedFits = pageMapper.bestFitItems(pageState, pageContext, recommendationProfiles);
const renderedFitLabels = renderedFits.map((item) => item.label);
const renderedSummary = renderedFitLabels.length > 1
  ? `Based on your Business Profile, ${renderedFitLabels.join(", ")} are the strongest places to begin your office search.`
  : "";
const renderedBrief = pageMapper.buildBriefState(pageState, pageContext);

assert(pageState && pageState.mode === "structured_sf_office", "defect profile should resolve to the structured SF Office production state.");
assert(renderedFitLabels[0] === "Jackson Square", `rendered Best Fits should lead with Jackson Square, got ${renderedFitLabels[0] || "none"}.`);
assert(renderedFitLabels[1] === "SoMa", `rendered Best Fits should include SoMa second, got ${renderedFitLabels[1] || "none"}.`);
assert(!renderedFitLabels.includes("Mission Bay"), "Mission Bay should be absent from visible Best Fits for the defect profile.");
assert(renderedSummary.includes("Jackson Square") && renderedSummary.includes("SoMa"), "Executive Summary source should name Jackson Square and SoMa.");
assert(renderedBrief.marketPath.recommendedPath[0].label === "Jackson Square", "stored Brief state should persist Jackson Square as the first Best Fit.");
assert(renderedBrief.marketPath.recommendedPath.length === 2, "stored Brief state should not force a third Best Fit for the defect profile.");

const missionBayControl = {
  city: "San Francisco",
  market: "San Francisco",
  locations: [{ label: "San Francisco", type: "city", city: "San Francisco", state: "CA" }],
  spaceType: "Office",
  modelKey: "san-francisco:office",
  businessType: "technology",
  operationalUse: ["team_collaboration", "recruiting"],
  officeEnvironment: "Modern and polished",
  commuteOrientation: "Peninsula South Bay",
  expectedGrowth: "significant",
};
const controlContext = pageMapper.normalizeContext(missionBayControl);
const controlState = pageMapper.structuredSfOfficeState(controlContext, recommendationProfiles);
const controlFits = pageMapper.bestFitItems(controlState, controlContext, recommendationProfiles).map((item) => item.label);
assert(controlFits.includes("Mission Bay"), `Mission Bay control should keep Mission Bay visible, got ${controlFits.join(", ") || "none"}.`);
assert(controlFits.indexOf("Mission Bay") >= 0 && controlFits.indexOf("Mission Bay") <= 1, `Mission Bay control should keep Mission Bay highly competitive, got ${controlFits.join(", ") || "none"}.`);

console.log(`Rendered production Best Fits for defect profile: ${renderedFitLabels.join(", ")}`);
console.log(`Mission Bay control rendered Best Fits: ${controlFits.join(", ")}`);

if (failures) {
  process.exitCode = 1;
} else {
  console.log("SF Office production integration QA passed.");
}
