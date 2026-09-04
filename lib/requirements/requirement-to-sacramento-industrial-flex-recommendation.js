(function (root, factory) { if (typeof module === "object" && module.exports) module.exports = factory(); else root.RofoRequirementSacramentoIndustrialFlexAdapter = factory(); })(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const VERSION = "requirement-to-sacramento-industrial-flex-recommendation:v1";
  const INDUSTRIAL = new Set(["dispatch", "operate_vehicles", "store", "receive", "ship_distribute", "outdoor_operations", "repair_service", "make_assemble"]);
  const FLEX = new Set(["display_present", "product_development", "prototype", "research", "work", "meet_collaborate", "host_visitors"]);
  const CANDIDATE_OWNERS = Object.freeze({
    "power-inn-industrial": "power-inn-industrial",
    "florin-perkins-industrial": "power-inn-industrial",
    "sci-ramona-component": "power-inn-industrial",
    "sci": "power-inn-industrial",
    "ramona": "power-inn-industrial",
    "northgate-north-market-industrial": "northgate-north-market-industrial",
    "northgate-industrial-park": "northgate-north-market-industrial",
    "northgate": "northgate-north-market-industrial",
    "north-market-boulevard": "northgate-north-market-industrial",
    "north-market": "northgate-north-market-industrial",
  });
  const OUTSIDE_SCOPE = /sacramento metro|greater sacramento|west sacramento|rancho cordova|elk grove|roseville|rocklin|folsom|citrus heights|northern california/i;
  const SPECIALIZED = /hazard|hazmat|laboratory|\blab\b|clean.?room|medical|food production|commercial kitchen|specialized ventilation|specialized manufacturing/i;
  const CAPABILITY = /(?:exact|required|must|minimum|decisive|dominated by)[^.;]{0,60}(?:loading|clear height|power|yard|outdoor storage|trailer parking|truck circulation|ventilation|building format|zoning|permitted use)|(?:loading|clear height|power|yard|outdoor storage|trailer parking|truck circulation|ventilation|building format|zoning|permitted use)[^.;]{0,60}(?:exact|required|must|minimum|decisive|dominates)|(?:loading configuration|clear-height-dominant|power-dominant|yard-dominant|property capability dominates)/i;
  const ACCESS = /(?:employee|customer|supplier|service territory|labor|commute|freeway|interstate|airport|transit|regional distribution reach)[^.;]{0,55}(?:decisive|required|must|only|dominates)|(?:decisive|required|must|only)[^.;]{0,55}(?:employee|customer|supplier|service territory|labor|commute|freeway|interstate|airport|transit|regional distribution reach)/i;

  function clean(value) { return String(value == null ? "" : value).trim().toLowerCase(); }
  function allText(requirement) { return [requirement.businessContext?.summary, ...(requirement.criteria || []).flatMap((item) => [item.dimension, item.value?.text, ...(item.value?.list || [])])].filter(Boolean).join(" ").toLowerCase(); }
  function resolveSacramentoIndustrialFlexMembership(input = {}) {
    const requirementShape = Boolean(input.locationLogic || input.propertyTypes);
    const anchor = requirementShape ? input.locationLogic?.marketAnchor || {} : input;
    const marketId = clean(anchor.marketId || anchor.geographyId);
    const city = clean(anchor.city || anchor.marketCity);
    const state = clean(anchor.state || anchor.marketState);
    const propertyTypes = requirementShape ? input.propertyTypes || [] : [input.propertyType].filter(Boolean);
    const propertyType = propertyTypes.length === 1 ? clean(propertyTypes[0]) : "";
    const preference = requirementShape ? input.locationLogic?.specificPreference || {} : input;
    const candidateDistrictIds = (preference.candidateDistrictIds || []).map(clean).filter(Boolean);
    const canonicalCandidateIds = [...new Set(candidateDistrictIds.map((id) => CANDIDATE_OWNERS[id]).filter(Boolean))];
    const unsupportedCandidateId = candidateDistrictIds.find((id) => !CANDIDATE_OWNERS[id]) || "";
    const cityMembership = marketId === "sacramento" && (!city || city === "sacramento") && (!state || state === "ca" || state === "california");
    let reason = "ELIGIBLE";
    if (!cityMembership) reason = marketId === "sacramento-metro" || marketId === "greater-sacramento" ? "GENERIC_SACRAMENTO_METRO" : "OUTSIDE_CITY_OF_SACRAMENTO";
    else if (propertyType !== "industrial_flex") reason = "UNSUPPORTED_PROPERTY_TYPE";
    else if (unsupportedCandidateId) reason = "OUT_OF_UNIVERSE_CANDIDATE";
    return Object.freeze({ eligible: reason === "ELIGIBLE", reason, marketId, city, state, propertyType, candidateDistrictIds: Object.freeze(candidateDistrictIds), canonicalCandidateIds: Object.freeze(canonicalCandidateIds), unsupportedCandidateId, cityMembership });
  }
  function resolveIntent(requirement = {}) {
    const text = allText(requirement), activities = requirement.activities || [];
    let industrialSignals = activities.filter((id) => INDUSTRIAL.has(id)).length;
    let flexSignals = activities.filter((id) => FLEX.has(id)).length;
    if (/warehouse|distribution|fleet|contractor|dispatch|storage|manufactur|assembly|production|receiving|shipping|service.?industrial/.test(text)) industrialSignals += 2;
    if (/office.?warehouse|office.?production|prototype|r&d|research|technical|team workspace|lighter flex|multi.?tenant flex|showroom/.test(text)) flexSignals += 2;
    const mode = industrialSignals && flexSignals ? industrialSignals >= flexSignals * 2 ? "industrial" : flexSignals >= industrialSignals * 2 ? "flex" : "mixed" : industrialSignals > flexSignals ? "industrial" : flexSignals > industrialSignals ? "flex" : "unresolved";
    return { mode, industrialSignals, flexSignals, activities, text };
  }
  function project(requirement = {}) {
    const membership = resolveSacramentoIndustrialFlexMembership(requirement), preference = requirement.locationLogic?.specificPreference || {}, resolved = resolveIntent(requirement);
    const conflictingUse = resolved.activities.some((id) => ["ship_distribute", "operate_vehicles", "make_assemble", "outdoor_operations"].includes(id)) && resolved.activities.some((id) => ["display_present", "host_visitors", "sell_serve"].includes(id));
    let abstention = null;
    if (["OUTSIDE_CITY_OF_SACRAMENTO", "GENERIC_SACRAMENTO_METRO"].includes(membership.reason)) abstention = { code: membership.reason, reason: "Only the bounded City of Sacramento Industrial/Flex comparison is implemented; metro and independent municipalities remain outside it." };
    else if (membership.reason === "UNSUPPORTED_PROPERTY_TYPE") abstention = { code: "UNSUPPORTED_PROPERTY_TYPE", reason: "Only City of Sacramento Industrial/Flex is implemented." };
    else if (membership.reason === "OUT_OF_UNIVERSE_CANDIDATE" || OUTSIDE_SCOPE.test(resolved.text)) abstention = { code: "REGIONAL_SCOPE_UNSUPPORTED", reason: "Sacramento Metro, West Sacramento, Rancho Cordova, and other independent municipalities are outside this bounded universe." };
    else if (SPECIALIZED.test(resolved.text)) abstention = { code: "SPECIALIZED_USE", reason: "This specialized use requires property and authority investigation before comparing Sacramento operating environments." };
    else if (CAPABILITY.test(resolved.text)) abstention = { code: "PROPERTY_CAPABILITY_DOMINATES", reason: "The Requirement depends on an exact property capability that geography evidence cannot establish." };
    else if (ACCESS.test(resolved.text)) abstention = { code: "ACCESS_EVIDENCE_GAP", reason: "A decisive access or service-geography need lacks reviewed comparative Sacramento access intelligence." };
    else if (conflictingUse) abstention = { code: "CONFLICTING_OPERATING_CUSTOMER_USE", reason: "The Requirement combines heavy operational and customer-facing needs without enough reviewed evidence to compare these Sacramento environments fairly." };
    else if (resolved.mode === "unresolved") abstention = { code: "UNRESOLVED_INTENT", reason: "The Requirement does not establish whether Industrial, Flex, or a supported hybrid need leads." };
    return { adapterVersion: VERSION, supported: membership.eligible, membership, modelKey: abstention ? "" : `sacramento:${resolved.mode}`, resolverInput: resolved, abstention,
      consumedSignals: [{ sourceDimension: "propertyTypes", projectedValue: "industrial_flex", rankingEffect: "eligibility" }, { sourceDimension: "activities/businessContext/criteria", projectedValue: resolved.mode, rankingEffect: "model_resolution" }],
      comparisonContext: { candidateDistrictIds: membership.canonicalCandidateIds.slice(), sourceCandidateDistrictIds: membership.candidateDistrictIds.slice(), candidateDistrictNames: (preference.candidateDistrictNames || []).slice(), treatment: "COMPARISON_CONTEXT_ONLY" } };
  }
  return { VERSION, CANDIDATE_OWNERS, resolveIntent, resolveSacramentoIndustrialFlexMembership, projectRequirementToSacramentoIndustrialFlexRecommendation: project };
});
