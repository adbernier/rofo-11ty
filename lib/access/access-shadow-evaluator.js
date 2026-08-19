(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./requirement-access-profile"), require("./access-fit-evaluator"), require("../requirements/requirement-location-intelligence-preview"));
  else root.RofoAccessShadowEvaluator = factory(root.RofoRequirementAccessProfile, root.RofoAccessFitEvaluator, root.RofoRequirementLocationPreview);
})(typeof self !== "undefined" ? self : this, function (profileAdapter, fitEvaluator, locationPreview) {
  "use strict";

  const SHADOW_VERSION = "sf-access-shadow-comparison:v0";
  const ACCESS_SIGNAL_IDS = new Set(["commuteOrientation", "regional_transit", "parking", "client_access"]);

  function allProductionCandidates(result) {
    const lists = [result && result.orderedCandidates, result && result.currentCandidates, result && result.shortlist, result && result.secondaryAlternatives].filter(Array.isArray);
    return [...new Map(lists.flat().map((item) => [item.districtId, item])).values()];
  }

  function createAccessShadowComparison(requirement, accessFoundation, sfOfficeModel) {
    const production = locationPreview.createLocationIntelligencePreview(requirement, sfOfficeModel);
    const requirementAccessProfile = profileAdapter.createRequirementAccessProfile(requirement, accessFoundation);
    const access = fitEvaluator.evaluateAccessFit(requirementAccessProfile, accessFoundation);
    const productionCandidates = allProductionCandidates(production.result);
    const comparisons = access.districtResults.map((shadow) => {
      const current = productionCandidates.find((item) => item.districtId === shadow.districtId);
      const accessReasons = (current && current.reasons || []).filter((reason) => ACCESS_SIGNAL_IDS.has(reason.signalId));
      const productionRank = production.result && production.result.orderedCandidates ? production.result.orderedCandidates.findIndex((item) => item.districtId === shadow.districtId) + 1 : 0;
      return {
        districtId: shadow.districtId,
        districtName: shadow.districtName,
        existingProductionAccess: {
          inCurrentCandidateSet: Boolean(current),
          rank: productionRank || null,
          movement: current && current.movement || "not evaluated",
          accessReasons: accessReasons.map((reason) => ({ signalId: reason.signalId, signalLabel: reason.signalLabel, action: reason.action })),
          note: accessReasons.length ? "Existing resolver access-family contribution." : "No district-specific production access contribution was recorded.",
        },
        proposedAccessFit: shadow,
      };
    });
    return {
      schemaVersion: SHADOW_VERSION,
      production,
      requirementAccessProfile,
      access,
      comparisons,
      productionTopThree: production.supported ? production.recommendations.map((item) => item.districtId) : [],
      productionInputs: production.projection && production.projection.resolverInput || {},
      accessActivatedDistricts: access.districtResults.filter((item) => item.accessEligibility.accessActivated).map((item) => item.districtId),
    };
  }

  return { SHADOW_VERSION, createAccessShadowComparison };
});
