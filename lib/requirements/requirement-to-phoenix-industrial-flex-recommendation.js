(function (root, factory) { if (typeof module === "object" && module.exports) module.exports = factory(); else root.RofoRequirementPhoenixIndustrialFlexAdapter = factory(); })(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const VERSION = "requirement-to-phoenix-industrial-flex-recommendation:v1";
  const INDUSTRIAL = new Set(["dispatch", "operate_vehicles", "store", "receive", "ship_distribute", "outdoor_operations", "repair_service", "make_assemble"]);
  const FLEX = new Set(["display_present", "product_development", "prototype", "research", "work", "meet_collaborate", "host_visitors"]);
  const CANONICAL_REGIONAL_MARKET = "phoenix-metro";
  const COMPATIBILITY_ENTRY_MARKET = "phoenix";
  const CANDIDATE_OWNERS = Object.freeze({
    "southwest-phoenix-industrial": "southwest-phoenix-industrial",
    "airport-south-central-industrial": "airport-south-central-industrial",
    "phoenix-airport-sky-harbor-area": "airport-south-central-industrial",
    "north-phoenix-advanced-operations": "north-phoenix-advanced-operations",
    "deer-valley": "north-phoenix-advanced-operations",
    "north-phoenix-tsmc-corridor": "north-phoenix-advanced-operations",
  });
  const OUTSIDE_SCOPE = /phoenix metro|greater phoenix|valley[- ]wide|tempe|mesa|chandler|scottsdale|glendale|goodyear|avondale/i;
  const SPECIALIZED = /hazard|hazmat|laboratory|\blab\b|clean.?room|semiconductor fabrication|medical|food production|commercial kitchen|specialized ventilation|specialized manufacturing (?:capability|infrastructure)/i;
  const CAPABILITY = /(?:exact|required|must|minimum|decisive|dominated by)[^.;]{0,55}(?:loading|clear height|power|yard|outdoor storage|trailer parking|ventilation|zoning|permitted use)|(?:loading configuration|clear-height-dominant|power-dominant|yard-dominant|property capability dominates)|permitted use[^.;]{0,35}(?:decisive|required|must|dependency)/i;
  const ACCESS = /(?:employee|customer|supplier|service territory|commute|freeway|airport)[^.;]{0,55}(?:decisive|required|must|only|dominates)|(?:decisive|required|must|only)[^.;]{0,55}(?:employee|customer|supplier|service territory|commute|freeway|airport)/i;

  function clean(value) { return String(value == null ? "" : value).trim().toLowerCase(); }
  function allText(requirement) {
    return [requirement.businessContext?.summary, ...(requirement.criteria || []).flatMap((item) => [item.dimension, item.value?.text, ...(item.value?.list || [])])].filter(Boolean).join(" ").toLowerCase();
  }
  function resolvePhoenixIndustrialFlexMembership(input = {}) {
    const requirementShape = Boolean(input.locationLogic || input.propertyTypes);
    const anchor = requirementShape ? input.locationLogic?.marketAnchor || {} : input;
    const marketId = clean(anchor.marketId || anchor.geographyId);
    const city = clean(anchor.city || anchor.marketCity);
    const propertyTypes = requirementShape ? input.propertyTypes || [] : [input.propertyType].filter(Boolean);
    const propertyType = propertyTypes.length === 1 ? clean(propertyTypes[0]) : "";
    const preference = requirementShape ? input.locationLogic?.specificPreference || {} : input;
    const candidateDistrictIds = (preference.candidateDistrictIds || []).map(clean).filter(Boolean);
    const canonicalCandidateIds = [...new Set(candidateDistrictIds.map((id) => CANDIDATE_OWNERS[id]).filter(Boolean))];
    const unsupportedCandidateId = candidateDistrictIds.find((id) => !CANDIDATE_OWNERS[id]) || "";
    const canonicalMembership = marketId === CANONICAL_REGIONAL_MARKET && city === "phoenix";
    const compatibilityMembership = marketId === COMPATIBILITY_ENTRY_MARKET && (!city || city === "phoenix");
    let reason = "ELIGIBLE";
    if (!canonicalMembership && !compatibilityMembership) reason = marketId === CANONICAL_REGIONAL_MARKET && !city ? "GENERIC_PHOENIX_METRO" : "OUTSIDE_CITY_OF_PHOENIX";
    else if (propertyType !== "industrial_flex") reason = "UNSUPPORTED_PROPERTY_TYPE";
    else if (unsupportedCandidateId) reason = "OUT_OF_UNIVERSE_CANDIDATE";
    return Object.freeze({ eligible: reason === "ELIGIBLE", reason, marketId, city, propertyType, candidateDistrictIds: Object.freeze(candidateDistrictIds), canonicalCandidateIds: Object.freeze(canonicalCandidateIds), unsupportedCandidateId, canonicalRegionalMembership: canonicalMembership, compatibilityMembership });
  }
  function resolveIntent(requirement = {}) {
    const text = allText(requirement);
    const activities = requirement.activities || [];
    let industrialSignals = activities.filter((id) => INDUSTRIAL.has(id)).length;
    let flexSignals = activities.filter((id) => FLEX.has(id)).length;
    if (/warehouse|distribution|logistics|fleet|contractor|dispatch|storage|manufactur|assembly|receiving|shipping/.test(text)) industrialSignals += 2;
    if (/showroom|prototype|r&d|research|technical|engineering|office.{0,12}production|office.{0,12}warehouse|team workspace|lighter flex/.test(text)) flexSignals += 2;
    if (activities.includes("make_assemble") && /r&d|research|technical|engineering|prototype/.test(text)) industrialSignals += 2;
    const mode = industrialSignals && flexSignals
      ? industrialSignals >= flexSignals * 2 ? "industrial" : flexSignals >= industrialSignals * 2 ? "flex" : "mixed"
      : industrialSignals > flexSignals ? "industrial" : flexSignals > industrialSignals ? "flex" : "unresolved";
    return { mode, industrialSignals, flexSignals, activities, text };
  }
  function project(requirement = {}) {
    const membership = resolvePhoenixIndustrialFlexMembership(requirement);
    const preference = requirement.locationLogic?.specificPreference || {};
    const resolved = resolveIntent(requirement);
    const heavyCustomerConflict = resolved.activities.some((id) => ["operate_vehicles", "ship_distribute", "outdoor_operations"].includes(id)) && resolved.activities.some((id) => ["display_present", "host_visitors"].includes(id)) && !/showroom|customer-facing operational|office.?warehouse/.test(resolved.text);
    let abstention = null;
    if (["OUTSIDE_CITY_OF_PHOENIX", "GENERIC_PHOENIX_METRO"].includes(membership.reason)) abstention = { code: membership.reason, reason: "Only the city-qualified bounded City of Phoenix Industrial/Flex comparison is implemented; generic Phoenix Metro and Valley municipalities remain outside it." };
    else if (membership.reason === "UNSUPPORTED_PROPERTY_TYPE") abstention = { code: "UNSUPPORTED_PROPERTY_TYPE", reason: "Only City of Phoenix Industrial/Flex is implemented." };
    else if (membership.reason === "OUT_OF_UNIVERSE_CANDIDATE" || OUTSIDE_SCOPE.test(resolved.text)) abstention = { code: "REGIONAL_SCOPE_UNSUPPORTED", reason: "Phoenix Metro, Valley-wide, Tempe, and other municipal comparisons are outside this bounded universe." };
    else if (SPECIALIZED.test(resolved.text)) abstention = { code: "SPECIALIZED_USE", reason: "This specialized use requires property and authority investigation before comparing Phoenix operating environments." };
    else if (CAPABILITY.test(resolved.text)) abstention = { code: "PROPERTY_CAPABILITY_DOMINATES", reason: "The Requirement depends on an exact property capability that geography evidence cannot establish." };
    else if (ACCESS.test(resolved.text)) abstention = { code: "ACCESS_EVIDENCE_GAP", reason: "A decisive access or service-geography need lacks certified comparative Phoenix access intelligence." };
    else if (heavyCustomerConflict) abstention = { code: "CONFLICTING_OPERATING_CONTEXT", reason: "Heavy operating and customer-facing needs conflict without enough detail to compare Phoenix environments fairly." };
    else if (resolved.mode === "unresolved") abstention = { code: "UNRESOLVED_INTENT", reason: "The Requirement does not establish whether Industrial, Flex, or a supported hybrid need leads." };
    return {
      adapterVersion: VERSION,
      supported: membership.eligible,
      membership,
      modelKey: abstention ? "" : `phoenix:${resolved.mode}`,
      resolverInput: resolved,
      abstention,
      consumedSignals: [
        { sourceDimension: "propertyTypes", projectedValue: "industrial_flex", rankingEffect: "eligibility" },
        { sourceDimension: "activities/businessContext/criteria", projectedValue: resolved.mode, rankingEffect: "model_resolution" },
      ],
      comparisonContext: { candidateDistrictIds: membership.canonicalCandidateIds.slice(), sourceCandidateDistrictIds: membership.candidateDistrictIds.slice(), candidateDistrictNames: (preference.candidateDistrictNames || []).slice(), treatment: "COMPARISON_CONTEXT_ONLY" },
    };
  }
  return { VERSION, CANDIDATE_OWNERS, resolveIntent, resolvePhoenixIndustrialFlexMembership, projectRequirementToPhoenixIndustrialFlexRecommendation: project };
});
