(function (root, factory) { if (typeof module === "object" && module.exports) module.exports = factory(); else root.RofoRequirementSanDiegoIndustrialFlexAdapter = factory(); })(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const VERSION = "requirement-to-san-diego-industrial-flex-recommendation:v1";
  const INDUSTRIAL = new Set(["dispatch", "operate_vehicles", "store", "receive", "ship_distribute", "outdoor_operations", "repair_service", "make_assemble"]);
  const FLEX = new Set(["display_present", "product_development", "prototype", "research", "work", "host_visitors"]);
  const CERTIFIED = new Set(["miramar", "otay-mesa", "kearny-mesa", "sorrento-mesa", "sorrento-valley"]);
  const OUTSIDE = /countywide|san diego county|nearby market|chula vista|poway|vista|oceanside|carlsbad/i;
  const SPECIALIZED = /hazard|hazmat|laboratory|\blab\b|medical|food production|commercial kitchen|vehicle sales|auto dealership|automotive service|specialized ventilation/i;
  const PROPERTY_DOMINATED = /clear height|exact power|power capacity|yard required|outdoor storage required|specialized ventilation|zoning|permitted use|loading configuration/i;
  function allText(requirement) { return [requirement.businessContext?.summary, ...(requirement.criteria || []).flatMap((item) => [item.dimension, item.value?.text, ...(item.value?.list || [])])].filter(Boolean).join(" ").toLowerCase(); }
  function intent(requirement) { const text = allText(requirement); const activities = requirement.activities || []; let industrial = activities.filter((id) => INDUSTRIAL.has(id)).length; let flex = activities.filter((id) => FLEX.has(id)).length; if (/warehouse|distribution|logistics|fleet|contractor|dispatch|storage|manufactur/.test(text)) industrial += 2; if (/showroom|prototype|r&d|research|technical|engineering|office.?production/.test(text)) flex += 2; const operationalOnly = activities.some((id) => ["operate_vehicles", "outdoor_operations", "ship_distribute"].includes(id)); return { mode: industrial && flex && !operationalOnly ? "mixed" : industrial > flex ? "industrial" : flex > industrial ? "flex" : "unresolved", industrialSignals: industrial, flexSignals: flex, activities }; }
  function project(requirement = {}) {
    const anchor = requirement.locationLogic?.marketAnchor || {}; const market = anchor.marketId || anchor.geographyId || ""; const property = requirement.propertyTypes || []; const text = allText(requirement); const resolved = intent(requirement); const preference = requirement.locationLogic?.specificPreference || {}; const candidates = preference.candidateDistrictIds || [];
    const outsideCandidate = candidates.find((id) => !CERTIFIED.has(id));
    let abstention = null;
    if (market !== "san-diego") abstention = { code: "OUTSIDE_CERTIFIED_MARKET", reason: "The Requirement is outside the certified City of San Diego universe." };
    else if (property.length !== 1 || property[0] !== "industrial_flex") abstention = { code: "UNSUPPORTED_PROPERTY_TYPE", reason: "Only San Diego Industrial/Flex is certified." };
    else if (outsideCandidate || OUTSIDE.test(text)) abstention = { code: "REGIONAL_SCOPE_UNSUPPORTED", reason: "Nearby municipalities and countywide comparison are outside the certified universe." };
    else if (SPECIALIZED.test(text)) abstention = { code: "SPECIALIZED_USE", reason: "A specialized use requires property and authority investigation before location ranking." };
    else if (PROPERTY_DOMINATED.test(text)) abstention = { code: "PROPERTY_CAPABILITY_DOMINATES", reason: "The stated requirement depends primarily on property-level capability that district evidence cannot establish." };
    else if (/employee|service territory|customer geography/.test(text) && /decisive|must|required|only/.test(text)) abstention = { code: "ACCESS_EVIDENCE_GAP", reason: "A decisive employee or service geography lacks certified San Diego access evidence." };
    else if (resolved.mode === "unresolved") abstention = { code: "UNRESOLVED_INTENT", reason: "The Requirement does not establish whether Industrial or Flex needs lead." };
    return { adapterVersion: VERSION, supported: market === "san-diego" && property.length === 1 && property[0] === "industrial_flex", modelKey: abstention ? "" : `san-diego:${resolved.mode}`, resolverInput: resolved, abstention, consumedSignals: [{ sourceDimension: "propertyTypes", projectedValue: "industrial_flex", rankingEffect: "eligibility" }, { sourceDimension: "activities/businessContext/criteria", projectedValue: resolved.mode, rankingEffect: "model_resolution" }], comparisonContext: { candidateDistrictIds: candidates.slice(), candidateDistrictNames: (preference.candidateDistrictNames || []).slice(), treatment: "COMPARISON_CONTEXT_ONLY" } };
  }
  return { VERSION, resolveIntent: intent, projectRequirementToSanDiegoIndustrialFlexRecommendation: project };
});
