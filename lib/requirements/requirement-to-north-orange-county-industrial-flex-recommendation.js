(function (root, factory) { if (typeof module === "object" && module.exports) module.exports = factory(); else root.RofoRequirementNorthOrangeCountyIndustrialFlexAdapter = factory(); })(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const VERSION = "requirement-to-north-orange-county-industrial-flex-recommendation:v1";
  const INDUSTRIAL = new Set(["dispatch", "operate_vehicles", "store", "receive", "ship_distribute", "outdoor_operations", "repair_service", "make_assemble"]);
  const FLEX = new Set(["display_present", "product_development", "prototype", "research", "work", "meet_collaborate", "host_visitors"]);
  const MARKETS = new Set(["anaheim", "fullerton"]);
  const CANDIDATES = new Set(["anaheim-canyon", "fullerton-industrial-service-area"]);
  const OUTSIDE_SCOPE = /orange county|countywide|central oc|south oc|irvine|costa mesa|santa ana|lake forest|brea|buena park/i;
  const SPECIALIZED = /hazard|hazmat|laboratory|\blab\b|medical|food production|commercial kitchen|vehicle sales|auto dealership|automotive service|specialized ventilation/i;
  const CAPABILITY = /(?:exact|required|must|minimum|decisive|dominated by)[^.;]{0,45}(?:loading|clear height|power|yard|outdoor storage|trailer parking|ventilation|zoning|permitted use)|(?:loading configuration|clear-height-dominant|power-dominant|yard-dominant|property capability dominates)/i;
  const ACCESS = /(?:employee|customer|supplier|service territory|commute|freeway|airport)[^.;]{0,45}(?:decisive|required|must|only|dominates)|(?:decisive|required|must|only)[^.;]{0,45}(?:employee|customer|supplier|service territory|commute|freeway|airport)/i;

  function allText(requirement) {
    return [requirement.businessContext?.summary, ...(requirement.criteria || []).flatMap((item) => [item.dimension, item.value?.text, ...(item.value?.list || [])])].filter(Boolean).join(" ").toLowerCase();
  }
  function resolveIntent(requirement = {}) {
    const text = allText(requirement);
    const activities = requirement.activities || [];
    let industrialSignals = activities.filter((id) => INDUSTRIAL.has(id)).length;
    let flexSignals = activities.filter((id) => FLEX.has(id)).length;
    if (/warehouse|distribution|logistics|fleet|contractor|dispatch|storage|manufactur|assembly|receiving|shipping/.test(text)) industrialSignals += 2;
    if (/showroom|prototype|r&d|research|technical|office.{0,12}production|office.{0,12}warehouse|team workspace|lighter flex/.test(text)) flexSignals += 2;
    const mode = industrialSignals && flexSignals
      ? industrialSignals >= flexSignals * 2 ? "industrial" : flexSignals >= industrialSignals * 2 ? "flex" : "mixed"
      : industrialSignals > flexSignals ? "industrial" : flexSignals > industrialSignals ? "flex" : "unresolved";
    return { mode, industrialSignals, flexSignals, activities, text };
  }
  function project(requirement = {}) {
    const anchor = requirement.locationLogic?.marketAnchor || {};
    const marketId = String(anchor.marketId || anchor.geographyId || "").toLowerCase();
    const propertyTypes = requirement.propertyTypes || [];
    const preference = requirement.locationLogic?.specificPreference || {};
    const candidateDistrictIds = (preference.candidateDistrictIds || []).map((item) => String(item).toLowerCase());
    const resolved = resolveIntent(requirement);
    const marketSupported = MARKETS.has(marketId);
    const propertySupported = propertyTypes.length === 1 && propertyTypes[0] === "industrial_flex";
    const outsideCandidate = candidateDistrictIds.find((id) => !CANDIDATES.has(id));
    const heavyCustomerConflict = resolved.activities.some((id) => ["operate_vehicles", "ship_distribute", "outdoor_operations"].includes(id)) && resolved.activities.some((id) => ["display_present", "host_visitors"].includes(id)) && !/showroom|customer-facing operational|office.?warehouse/.test(resolved.text);
    let abstention = null;
    if (!marketSupported) abstention = { code: "OUTSIDE_BOUNDED_MARKET", reason: "Only the bounded Anaheim Canyon and Fullerton Industrial / Service Area comparison is implemented." };
    else if (!propertySupported) abstention = { code: "UNSUPPORTED_PROPERTY_TYPE", reason: "Only North Orange County Industrial/Flex is implemented." };
    else if (outsideCandidate || OUTSIDE_SCOPE.test(resolved.text)) abstention = { code: "REGIONAL_SCOPE_UNSUPPORTED", reason: "Countywide, Central OC, South OC, and other municipal comparisons are outside this bounded universe." };
    else if (SPECIALIZED.test(resolved.text)) abstention = { code: "SPECIALIZED_USE", reason: "This specialized use requires property and authority investigation before comparing locations." };
    else if (CAPABILITY.test(resolved.text)) abstention = { code: "PROPERTY_CAPABILITY_DOMINATES", reason: "The Requirement depends on an exact property capability that geography evidence cannot establish." };
    else if (ACCESS.test(resolved.text)) abstention = { code: "ACCESS_EVIDENCE_GAP", reason: "A decisive access or service-geography need lacks certified comparative North Orange County access intelligence." };
    else if (heavyCustomerConflict) abstention = { code: "CONFLICTING_OPERATING_CONTEXT", reason: "Heavy operating and customer-facing needs conflict without enough detail to compare the two environments fairly." };
    else if (resolved.mode === "unresolved") abstention = { code: "UNRESOLVED_INTENT", reason: "The Requirement does not establish whether Industrial, Flex, or a supported hybrid need leads." };
    return {
      adapterVersion: VERSION,
      supported: marketSupported && propertySupported,
      modelKey: abstention ? "" : `north-orange-county:${resolved.mode}`,
      resolverInput: resolved,
      abstention,
      consumedSignals: [
        { sourceDimension: "propertyTypes", projectedValue: "industrial_flex", rankingEffect: "eligibility" },
        { sourceDimension: "activities/businessContext/criteria", projectedValue: resolved.mode, rankingEffect: "model_resolution" },
      ],
      comparisonContext: { candidateDistrictIds: candidateDistrictIds.slice(), candidateDistrictNames: (preference.candidateDistrictNames || []).slice(), treatment: "COMPARISON_CONTEXT_ONLY" },
    };
  }
  return { VERSION, resolveIntent, projectRequirementToNorthOrangeCountyIndustrialFlexRecommendation: project };
});
