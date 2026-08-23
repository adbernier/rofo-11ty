const sfOfficeCoverage = require("./sfOfficeMarketCoverage");

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
  ],
};
