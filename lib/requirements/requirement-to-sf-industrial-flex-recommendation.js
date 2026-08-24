(function (root, factory) { if (typeof module === "object" && module.exports) module.exports = factory(); else root.RofoRequirementSfIndustrialFlexAdapter = factory(); })(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const VERSION = "requirement-to-sf-industrial-flex-recommendation:v1";
  const INDUSTRIAL = new Set(["dispatch", "operate_vehicles", "store", "receive", "ship_distribute", "outdoor_operations", "repair_service", "make_assemble"]);
  const FLEX = new Set(["display_present", "product_development", "prototype", "research", "work", "host_visitors"]);
  function criterionText(requirement) { return (requirement.criteria || []).flatMap((item) => [item.dimension, item.value?.text, ...(item.value?.list || [])]).filter(Boolean).join(" "); }
  function resolveIntent(requirement) {
    const activities = requirement.activities || [];
    const text = `${requirement.businessContext?.summary || ""} ${criterionText(requirement)}`.toLowerCase();
    let industrial = activities.filter((id) => INDUSTRIAL.has(id)).length;
    let flex = activities.filter((id) => FLEX.has(id)).length;
    if (/warehouse|distribution|logistics|fleet|contractor|dispatch|storage|manufactur|food produc/.test(text)) industrial += 2;
    if (/showroom|prototype|r&d|research|technical|creative production|office.?production|design trade/.test(text)) flex += 2;
    const operationalOnly = activities.some((id) => ["operate_vehicles", "outdoor_operations", "ship_distribute"].includes(id));
    const hybrid = industrial > 0 && flex > 0 && !operationalOnly;
    const mode = hybrid ? "mixed" : industrial > flex ? "industrial" : flex > industrial ? "flex" : "unresolved";
    return { mode, industrialSignals: industrial, flexSignals: flex, activities };
  }
  function project(requirement = {}) {
    const market = requirement.locationLogic?.marketAnchor || {};
    const marketSupported = [market.marketId, market.geographyId].includes("san-francisco") || /^San Francisco(?:, CA)?$/i.test(market.displayName || "");
    const propertySupported = requirement.propertyTypes?.length === 1 && requirement.propertyTypes[0] === "industrial_flex";
    const intent = resolveIntent(requirement);
    const supported = marketSupported && propertySupported;
    const preference = requirement.locationLogic?.specificPreference || {};
    return { adapterVersion: VERSION, supported, modelKey: supported && intent.mode !== "unresolved" ? `san-francisco:${intent.mode}` : "", unsupportedReason: supported ? "" : "No reviewed SF Industrial/Flex foundation supports this Requirement.", resolverInput: intent, consumedSignals: [{ sourceDimension: "propertyTypes", projectedValue: "industrial_flex", rankingEffect: "eligibility" }, { sourceDimension: "activities/businessContext/criteria", projectedValue: intent.mode, rankingEffect: "model_resolution" }], unconsumedSignals: intent.mode === "unresolved" ? [{ sourceDimension: "industrial_flex.intent", reason: "The Requirement does not establish whether operational Industrial or adaptive Flex leads." }] : [], conflicts: [], comparisonContext: { candidateDistrictIds: (preference.candidateDistrictIds || []).slice(), candidateDistrictNames: (preference.candidateDistrictNames || []).slice(), treatment: "COMPARISON_CONTEXT_ONLY" } };
  }
  return { VERSION, resolveIntent, projectRequirementToSfIndustrialFlexRecommendation: project };
});
