const sfOfficeCoverage = require("./sfOfficeMarketCoverage");
const sfRetailCoverage = require("./sfRetailMarketCoverage");
const sfIndustrialFlexCoverage = require("./sfIndustrialFlexMarketCoverage");
const sanDiegoIndustrialFlexFoundation = require("./sanDiegoIndustrialFlexCompositionFoundation");
const northOrangeCountyIndustrialFlexFoundation = require("./northOrangeCountyIndustrialFlexEvidenceFoundation");

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
    {
      marketId: "san-francisco", propertyType: "industrial", coverage: sfIndustrialFlexCoverage.industrial,
      calibration: { status: "Ready", evidence: ["_data/sfIndustrialFlexDecisionGeographies.js", "_data/sfIndustrialFlexCompositionFoundation.js", "lib/requirements/requirement-to-sf-industrial-flex-recommendation.js", "lib/recommendations/sf-industrial-flex-location-composition.js", "scripts/qa-sf-industrial-flex-recommendation.js"] },
      certificationRelease: { status: "Ready", lastQa: "2026-08-23", evidence: ["_data/sfIndustrialFlexMarketCoverage.js", "_data/sfIndustrialFlexPublicExperienceBacklog.js", "scripts/qa-sf-industrial-flex-recommendation.js", "functions/api/location-brief-v2/create.js"], productionStatus: "Explicit shared Industrial/Flex feature flag; defaults off" },
      submodels: {
        industrial: { label: "Industrial Fit", status: "Ready", coverage: sfIndustrialFlexCoverage.industrial.schemaVersion },
        flex: { label: "Flex Fit", status: "Ready", coverage: sfIndustrialFlexCoverage.flex.schemaVersion },
      },
    },
    {
      marketId: "san-diego", propertyType: "industrial",
      coverage: { schemaVersion: sanDiegoIndustrialFlexFoundation.schemaVersion, marketId: "san-diego", approvedDecisionGeographyIds: sanDiegoIndustrialFlexFoundation.certifiedDistrictIds, scope: "City of San Diego only" },
      calibration: { status: "Ready", evidence: ["_data/sanDiegoIndustrialFlexCompositionFoundation.js", "lib/requirements/requirement-to-san-diego-industrial-flex-recommendation.js", "lib/recommendations/san-diego-industrial-flex-location-composition.js", "scripts/qa-san-diego-industrial-flex-recommendation.js"] },
      certificationRelease: { status: "ReadyDefaultOff", lastQa: "2026-08-31", evidence: ["scripts/qa-san-diego-industrial-flex-recommendation.js", "functions/api/location-brief-v2/_shared.js"], productionStatus: "Explicit San Diego Industrial/Flex feature flag; defaults off" },
      submodels: { industrial: { label: "Industrial-led", status: "Ready" }, flex: { label: "Flex-led", status: "Ready" }, mixed: { label: "Mixed/hybrid", status: "Ready" } },
    },
    {
      marketId: "orange-county", propertyType: "industrial",
      coverage: {
        schemaVersion: northOrangeCountyIndustrialFlexFoundation.schemaVersion,
        marketId: "north-orange-county",
        scope: "Bounded Anaheim Canyon + Fullerton Industrial / Service Area only; not Orange County-wide",
        blockingGaps: [],
        decisionGeographies: northOrangeCountyIndustrialFlexFoundation.evidenceCandidateIds.map((districtId) => ({
          districtId,
          knowledgeOwnerDistrictId: districtId,
          classification: "CORE_BOUNDED_INDUSTRIAL_FLEX",
          coverage: { industrialFit: "REVIEWED", flexFit: "REVIEWED", businessEnvironment: "REVIEWED", representativeBuildings: "REVIEWED", presentation: "REVIEWED", access: "NOT_REVIEWED", transit: "NOT_REVIEWED", parking: "NOT_REVIEWED" },
        })),
      },
      calibration: { status: "Ready", evidence: ["_data/northOrangeCountyIndustrialFlexEvidenceFoundation.js", "lib/requirements/requirement-to-north-orange-county-industrial-flex-recommendation.js", "lib/recommendations/north-orange-county-industrial-flex-location-composition.js", "scripts/qa-north-orange-county-industrial-flex-recommendation.js"] },
      certificationRelease: { status: "Building", lastQa: "2026-09-02", evidence: ["scripts/qa-north-orange-county-industrial-flex-recommendation.js"], productionStatus: "Implementation complete; end-to-end certification pending; runtime activation denied" },
      submodels: { industrial: { label: "Industrial-led", status: "Ready" }, flex: { label: "Flex-led", status: "Ready" }, mixed: { label: "Mixed/hybrid", status: "Ready" } },
    },
  ],
};
