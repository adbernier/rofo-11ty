const sfOfficeCoverage = require("./sfOfficeMarketCoverage");
const sfRetailCoverage = require("./sfRetailMarketCoverage");

module.exports = {
  schemaVersion: "market-readiness-foundation-registry:v1",
  foundations: [
    {
      marketId: "san-francisco",
      propertyType: "office",
      coverage: sfOfficeCoverage,
      calibration: {
        status: "Ready",
        evidence: [
          "_data/sfOfficeRecommendationModel.js",
          "lib/requirements/requirement-to-sf-office-recommendation.js",
          "scripts/qa-sf-office-recommendation-calibration.js",
          "scripts/qa-sf-office-market-coverage.js",
        ],
      },
      certificationRelease: {
        status: "Ready",
        lastQa: "2026-08-19",
        evidence: [
          "scripts/qa-sf-office-market-coverage.js",
          "scripts/qa-vnext-sf-office-production-integration.js",
          "docs/product/rofo-vnext-sf-office-production-integration.md",
        ],
        productionStatus: "Controlled cohort",
      },
    },
    {
      marketId: "san-francisco",
      propertyType: "retail",
      coverage: sfRetailCoverage,
      calibration: {
        status: "Ready",
        evidence: [
          "_data/sfRetailDecisionGeographies.js",
          "_data/sfRetailCompositionFoundation.js",
          "lib/requirements/requirement-to-sf-retail-recommendation.js",
          "lib/recommendations/sf-retail-location-composition.js",
          "scripts/qa-sf-retail-recommendation.js",
        ],
      },
      certificationRelease: {
        status: "Ready",
        lastQa: "2026-08-23",
        evidence: [
          "_data/sfRetailMarketCoverage.js",
          "_data/sfRetailPublicExperienceBacklog.js",
          "scripts/qa-sf-retail-recommendation.js",
          "functions/location-requirement/index.js",
          "functions/api/location-brief-v2/create.js",
        ],
        productionStatus: "Explicit SF Retail feature flag; defaults off",
      },
    },
  ],
};
