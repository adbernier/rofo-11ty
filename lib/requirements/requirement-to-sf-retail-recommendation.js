(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.RofoRequirementSfRetailAdapter = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const ADAPTER_VERSION = "requirement-to-sf-retail-recommendation:v1";
  const MODEL_KEY = "san-francisco:retail_service";
  function criterion(requirement, dimension) { return (requirement.criteria || []).find((item) => item.dimension === dimension); }
  function text(item) { return item?.value?.list?.join(" ") || item?.value?.text || ""; }
  function identity(value) {
    const input = String(value || "").toLowerCase();
    if (/luxury|premium/.test(input)) return "premium_luxury";
    if (/boutique|apparel|consumer brand/.test(input)) return "boutique_brand";
    if (/restaurant|food|cafe/.test(input)) return "food_beverage";
    if (/fitness|wellness|studio/.test(input)) return "fitness_wellness";
    if (/showroom|furnish|home design/.test(input)) return "showroom_design";
    if (/service|salon|repair/.test(input)) return "neighborhood_service";
    if (/convenience|daily needs/.test(input)) return "convenience";
    if (/experiential|destination|specialty/.test(input)) return "destination_experiential";
    return "";
  }
  function projectRequirementToSfRetailRecommendation(requirement = {}) {
    const market = requirement.locationLogic?.marketAnchor || {};
    const marketSupported = market.marketId === "san-francisco" || market.geographyId === "san-francisco" || /^San Francisco(?:, CA)?$/i.test(market.displayName || "");
    const retailSupported = (requirement.propertyTypes || []).length === 1 && requirement.propertyTypes[0] === "retail_service";
    const identityItem = criterion(requirement, "universal.business.type");
    const destinationItem = criterion(requirement, "retail.customer.destination_visibility");
    const businessIdentity = identity(text(identityItem) || requirement.businessContext?.summary);
    const activities = (requirement.activities || []).slice();
    const consumedSignals = [
      { sourceDimension: "locationLogic.marketAnchor", projectedValue: marketSupported ? "san-francisco" : "", rankingEffect: "eligibility" },
      { sourceDimension: "propertyTypes", projectedValue: retailSupported ? "retail_service" : "", rankingEffect: "eligibility" },
    ];
    if (businessIdentity) consumedSignals.push({ sourceDimension: identityItem?.dimension || "businessContext.summary", projectedValue: businessIdentity, rankingEffect: "possible" });
    if (destinationItem) consumedSignals.push({ sourceDimension: destinationItem.dimension, projectedValue: text(destinationItem), rankingEffect: "possible" });
    if (activities.length) consumedSignals.push({ sourceDimension: "activities", projectedValue: activities, rankingEffect: "possible" });
    const preference = requirement.locationLogic?.specificPreference || {};
    return {
      adapterVersion: ADAPTER_VERSION, modelKey: marketSupported && retailSupported ? MODEL_KEY : "", supported: marketSupported && retailSupported,
      unsupportedReason: marketSupported && retailSupported ? "" : "No reviewed SF Retail recommendation foundation supports this Requirement.",
      resolverInput: { businessIdentity, destinationVisibility: text(destinationItem), activities },
      consumedSignals,
      unconsumedSignals: businessIdentity ? [] : [{ sourceDimension: identityItem?.dimension || "businessContext.summary", reason: "No supported bounded Retail identity was established; the resolver remains open-ended." }],
      conflicts: [],
      comparisonContext: { candidateDistrictIds: (preference.candidateDistrictIds || []).slice(), candidateDistrictNames: (preference.candidateDistrictNames || []).slice(), treatment: "COMPARISON_CONTEXT_ONLY" },
    };
  }
  return { ADAPTER_VERSION, MODEL_KEY, projectRequirementToSfRetailRecommendation };
});
