(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./private-location-composition"), require("./sf-retail-location-composition"), require("./sf-industrial-flex-location-composition"), require("./san-diego-industrial-flex-location-composition"), require("./north-orange-county-industrial-flex-location-composition"), require("./phoenix-industrial-flex-location-composition"), require("./indianapolis-industrial-flex-location-composition"));
  else root.RofoPrivateRecommendationReadiness = factory(root.RofoPrivateLocationComposition, root.RofoSfRetailLocationComposition, root.RofoSfIndustrialFlexLocationComposition, root.RofoSanDiegoIndustrialFlexLocationComposition, root.RofoNorthOrangeCountyIndustrialFlexLocationComposition, root.RofoPhoenixIndustrialFlexLocationComposition, root.RofoIndianapolisIndustrialFlexLocationComposition);
})(typeof self !== "undefined" ? self : this, function (composer, retailComposer, industrialFlexComposer, sanDiegoIndustrialFlexComposer, northOrangeCountyIndustrialFlexComposer, phoenixIndustrialFlexComposer, indianapolisIndustrialFlexComposer) {
  "use strict";

  const VERSION = "private-recommendation-readiness:v1";
  const READINESS = Object.freeze({ FULL: "FULL", BOUNDED: "BOUNDED", INVESTIGATE: "INVESTIGATE" });
  const COVERAGE = Object.freeze({ EVALUATED: "EVALUATED", PARTIAL: "PARTIALLY_EVALUATED", BLOCKED: "BLOCKED_BY_INTELLIGENCE_GAP", INELIGIBLE: "INELIGIBLE" });

  function criterion(requirement, dimension) { return (requirement.criteria || []).find((item) => item.dimension === dimension); }
  function criterionText(requirement, dimension) { const value = criterion(requirement, dimension)?.value || {}; return value.list?.join(" ") || value.text || ""; }
  function marketId(requirement) { return requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId || ""; }
  function propertyType(requirement) { return (requirement.propertyTypes || [])[0] || "unknown"; }
  function groupFor(id, foundation) { return (foundation.presentationGroups || []).find((group) => group.reviewStatus === "APPROVED" && group.memberDistrictIds.includes(id)); }
  function canonicalId(id, foundation) { return groupFor(id, foundation)?.canonicalDistrictId || id; }
  function displayName(id, name, foundation) { return groupFor(id, foundation)?.displayName || name || id; }
  function materialUnknownAccess(item) {
    return (item.access?.employeeCohortResults || []).some((cohort) => ["CORE", "MATERIAL"].includes(cohort.importance) && cohort.rating === "UNKNOWN") ||
      (item.access?.clientCohortResults || []).some((cohort) => ["CORE", "MATERIAL"].includes(cohort.importance) && cohort.rating === "UNKNOWN");
  }
  function businessActivated(item, composition, model) {
    const effect = model?.businessTypeEffects?.[composition.businessIdentity?.typeId];
    const ids = item.memberDistrictIds || [item.districtId];
    return Boolean(effect && ids.some((id) => (effect.rise || []).includes(id)));
  }
  function gapRecord(requirement, district, dimension, signal, materiality, status, reason) {
    return {
      schemaVersion: "recommendation-intelligence-gap:v1",
      market: marketId(requirement), propertyType: propertyType(requirement), district: district.districtId,
      intelligenceDimension: dimension, requirementSignal: signal, materiality, blockStatus: status, reason,
      observedAt: requirement.updatedAt || requirement.createdAt || "DETERMINISTIC_FIXTURE",
    };
  }

  function officeUniverse(requirement, dependencies) {
    const composition = composer.composeLocationRecommendations(requirement, dependencies.accessFoundation, dependencies.compositionFoundation, dependencies.sfOfficeModel, { deferShortlist: true });
    if (!composition.supported) return { composition, districts: [], gaps: [] };
    const requested = new Set(requirement.locationLogic?.specificPreference?.candidateDistrictIds || []);
    const gaps = [];
    const districts = composition.considered.map((item) => {
      const sourceIds = item.memberDistrictIds || [item.districtId];
      const activation = [];
      if (item.eligibilitySource === "PRODUCTION_STARTING_SET") activation.push({ signal: "reviewed office starting universe", materiality: "MATERIAL" });
      if (item.eligibilitySource === "SHADOW_RECOMMENDATION_CANDIDATE") activation.push({ signal: "existing recommendation candidate logic", materiality: "MATERIAL" });
      if (item.eligibilitySource === "SHADOW_ACCESS_ACTIVATION") activation.push({ signal: "Requirement-specific Access activation", materiality: "CORE" });
      if (businessActivated(item, composition, dependencies.sfOfficeModel)) activation.push({ signal: "Business Environment activation", materiality: "MATERIAL" });
      if (sourceIds.some((id) => requested.has(id))) activation.push({ signal: "user-requested comparison", materiality: "MATERIAL", comparisonOnly: true });
      if (!activation.length) return null;
      const dimensions = {
        canonicalGeography: { status: item.canonicalDistrictId || item.districtId ? "REVIEWED" : "UNKNOWN", evidence: item.presentationProvenance || [] },
        propertyTypeFit: { status: ["GOOD", "STRONG"].includes(item.office.band) ? "REVIEWED" : item.office.band === "UNKNOWN" ? "UNKNOWN" : "REVIEWED", band: item.office.band, evidence: item.office.evidenceSources },
        accessIntelligence: { status: item.access.confidence === "UNKNOWN" ? "UNKNOWN" : materialUnknownAccess(item) ? "PARTIAL" : "REVIEWED", band: item.accessComponent.band, confidence: item.access.confidence, evidence: item.evidenceIds || [] },
        businessEnvironment: { status: item.environment.evidenceSources.length ? "REVIEWED" : "UNKNOWN", band: item.environment.band, evidence: item.environment.evidenceSources },
        operatingUse: { status: "NOT_APPLICABLE", reason: "Ordinary Office use adds no separate district operating component in the current private composition." },
        evidenceConfidence: { status: item.access.confidence === "UNKNOWN" ? "MISSING" : "REVIEWED", confidence: item.access.confidence },
      };
      let evaluationStatus = COVERAGE.EVALUATED;
      const reasons = [];
      if (!["GOOD", "STRONG"].includes(item.office.band)) { evaluationStatus = COVERAGE.INELIGIBLE; reasons.push(`Reviewed Office Fit is ${item.office.band}.`); }
      else if (dimensions.businessEnvironment.status === "UNKNOWN" && activation.some((entry) => /Business Environment/.test(entry.signal))) { evaluationStatus = COVERAGE.BLOCKED; reasons.push("Business Environment evidence is missing for an environment-activated candidate."); }
      else if (dimensions.accessIntelligence.status === "UNKNOWN" || materialUnknownAccess(item)) { evaluationStatus = COVERAGE.BLOCKED; reasons.push("A material employee or client origin lacks reviewed Access Intelligence."); }
      else if ((item.unknowns || []).length) { evaluationStatus = COVERAGE.PARTIAL; reasons.push(...item.unknowns); }
      if (evaluationStatus === COVERAGE.BLOCKED) {
        gaps.push(gapRecord(requirement, item, dimensions.accessIntelligence.status === "UNKNOWN" || materialUnknownAccess(item) ? "ACCESS" : "BUSINESS_ENVIRONMENT", activation[0].signal, activation[0].materiality, "BLOCKS_FAIR_EVALUATION", reasons[0]));
      } else if (evaluationStatus === COVERAGE.PARTIAL) {
        gaps.push(gapRecord(requirement, item, "OPERATING_PROPERTY_CONTEXT", activation[0].signal, "SUPPORTING", "PARTIAL_EVALUATION", reasons[0]));
      }
      return { districtId: item.districtId, districtName: item.districtName, canonicalDistrictId: item.canonicalDistrictId || item.districtId, memberDistrictIds: sourceIds, activation, dimensions, evaluationStatus, reasons, compositionBand: item.compositionBand };
    }).filter(Boolean);
    return { composition, districts, gaps };
  }

  function medicalUniverse(requirement, dependencies) {
    const marketDistricts = dependencies.districtGeography?.markets?.[marketId(requirement)] || [];
    const seen = new Set();
    const gaps = [];
    const districts = marketDistricts.map((district) => {
      const id = canonicalId(district.districtId, dependencies.compositionFoundation);
      if (seen.has(id)) return null;
      seen.add(id);
      const name = displayName(district.districtId, district.name, dependencies.compositionFoundation);
      const access = dependencies.accessFoundation?.districtProfiles?.find((item) => item.districtId === id || item.districtId === district.districtId);
      const item = { districtId: id, districtName: name };
      const reason = "Reviewed district-level Medical fit, Medical operating context, and property-condition evidence are missing.";
      gaps.push(gapRecord(requirement, item, "MEDICAL_PROPERTY_TYPE_FIT", "Medical property context", "CORE", "BLOCKS_FAIR_EVALUATION", reason));
      return {
        districtId: id, districtName: name, canonicalDistrictId: id, memberDistrictIds: groupFor(district.districtId, dependencies.compositionFoundation)?.memberDistrictIds || [district.districtId],
        activation: [{ signal: "canonical market geography requiring Medical evaluation", materiality: "CORE" }],
        dimensions: {
          canonicalGeography: { status: "REVIEWED", evidence: ["_data/requirementPrototypeDistrictGeography.js"] },
          propertyTypeFit: { status: "UNKNOWN", band: "UNKNOWN", evidence: [] },
          accessIntelligence: { status: access ? "PARTIAL" : "UNKNOWN", confidence: access?.confidence || "UNKNOWN", evidence: access?.evidenceIds || [] },
          businessEnvironment: { status: "NOT_APPLICABLE", reason: "No reviewed Medical Business Environment model is active." },
          operatingUse: { status: "UNKNOWN", reason: "Medical-compatible use and buildout are property-specific and not reviewed at district level." },
          evidenceConfidence: { status: "MISSING", confidence: "UNKNOWN" },
        },
        evaluationStatus: COVERAGE.BLOCKED, reasons: [reason], compositionBand: "NOT_SCORED",
      };
    }).filter(Boolean);
    return { composition: null, districts, gaps };
  }

  function retailUniverse(requirement, dependencies) {
    const composition = retailComposer.composeLocationRecommendations(requirement, dependencies.accessFoundation, dependencies.sfRetailFoundation, { deferShortlist: true });
    if (!composition.supported) return { composition, districts: [], gaps: [], composer: retailComposer };
    const requested = new Set(requirement.locationLogic?.specificPreference?.candidateDistrictIds || []);
    const gaps = [];
    const hasBusinessIdentity = (requirement.criteria || []).some((item) => item.dimension === "universal.business.type" && (item.value?.text || item.value?.list?.length));
    const unresolvedBusinessIdentity = hasBusinessIdentity && !composition.projection.resolverInput.businessIdentity;
    const unsupportedOperatingContext = (requirement.activities || []).some((id) => ["make_assemble", "repair_service", "ship_distribute"].includes(id));
    const districts = composition.considered.map((item) => {
      const meaningful = item.classification !== dependencies.sfRetailFoundation.classification.NOT_RETAIL;
      const materialAccessUnknown = composition.requirementAccessProfile.cohorts.length > 0 && item.accessComponent.band === "UNKNOWN";
      const dimensions = {
        canonicalGeography: { status: item.canonicalDistrictId ? "REVIEWED" : "UNKNOWN", evidence: item.evidenceIds },
        propertyTypeFit: { status: meaningful ? "REVIEWED" : "NOT_APPLICABLE", band: item.retail.band, evidence: item.retail.evidenceSources },
        accessIntelligence: { status: materialAccessUnknown ? "UNKNOWN" : "REVIEWED", band: item.accessComponent.band, confidence: item.accessComponent.confidence, evidence: item.access.evidenceIds || [] },
        businessEnvironment: { status: item.environment.evidenceSources.length ? "REVIEWED" : "UNKNOWN", band: item.environment.band, evidence: item.environment.evidenceSources },
        operatingUse: { status: "REVIEWED", reason: "Bounded Retail identity, destination/visibility, and operational activities are preserved by the Retail adapter." },
        evidenceConfidence: { status: materialAccessUnknown ? "MISSING" : "REVIEWED", confidence: item.accessComponent.confidence },
      };
      let evaluationStatus = meaningful && ["GOOD", "STRONG"].includes(item.retail.band) ? COVERAGE.EVALUATED : COVERAGE.INELIGIBLE;
      const reasons = [];
      if (unresolvedBusinessIdentity && evaluationStatus === COVERAGE.EVALUATED) { evaluationStatus = COVERAGE.BLOCKED; reasons.push("The stated Retail business identity is not supported by the bounded SF Retail adapter."); }
      else if (unsupportedOperatingContext && evaluationStatus === COVERAGE.EVALUATED) { evaluationStatus = COVERAGE.BLOCKED; reasons.push("This operating pattern requires property/use intelligence beyond the reviewed ordinary Retail foundation."); }
      else if (materialAccessUnknown && evaluationStatus === COVERAGE.EVALUATED) { evaluationStatus = COVERAGE.BLOCKED; reasons.push("A material customer-origin relationship lacks reviewed Access Intelligence."); }
      if (evaluationStatus === COVERAGE.BLOCKED) {
        const gapDimension = unresolvedBusinessIdentity ? "BUSINESS_ENVIRONMENT" : unsupportedOperatingContext ? "OPERATING_PROPERTY_CONTEXT" : "ACCESS";
        const signal = unresolvedBusinessIdentity ? "Retail business identity" : unsupportedOperatingContext ? "Retail operating pattern" : "customer geography";
        gaps.push(gapRecord(requirement, item, gapDimension, signal, "CORE", "BLOCKS_FAIR_EVALUATION", reasons[0]));
      }
      return {
        districtId: item.districtId, districtName: item.districtName, canonicalDistrictId: item.canonicalDistrictId, memberDistrictIds: item.memberDistrictIds,
        activation: [{ signal: requested.has(item.districtId) ? "user-requested comparison" : "reviewed Retail decision universe", materiality: requested.has(item.districtId) ? "MATERIAL" : "CORE", comparisonOnly: requested.has(item.districtId) }],
        dimensions, evaluationStatus, reasons, compositionBand: item.compositionBand,
      };
    });
    return { composition, districts, gaps, composer: retailComposer };
  }

  function unsupportedUniverse(requirement) {
    return { composition: null, districts: [], gaps: [gapRecord(requirement, { districtId: "MARKET_FOUNDATION" }, "MARKET_FOUNDATION", "market and property type", "CORE", "BLOCKS_FAIR_EVALUATION", "No reviewed private Location Intelligence foundation supports this market and property type.")] };
  }

  function industrialFlexUniverse(requirement, dependencies) {
    const composition = industrialFlexComposer.composeLocationRecommendations(requirement, dependencies.accessFoundation, dependencies.sfIndustrialFlexFoundation, { deferShortlist: true });
    if (!composition.supported || composition.resolvedModel === "unresolved") {
      const reason = composition.supported ? "The Requirement does not establish whether Industrial or Flex fit should lead." : "No reviewed SF Industrial/Flex foundation supports this Requirement.";
      return { composition, districts: [], gaps: [gapRecord(requirement, { districtId: "MARKET_FOUNDATION" }, "INDUSTRIAL_FLEX_INTENT", "operating use", "CORE", "BLOCKS_FAIR_EVALUATION", reason)] };
    }
    const requested = new Set(requirement.locationLogic?.specificPreference?.candidateDistrictIds || []);
    const districts = composition.considered.map((item) => {
      const meaningful = item.compositionBand !== "INELIGIBLE";
      const accessUnknown = composition.requirementAccessProfile?.cohorts?.length > 0 && item.accessComponent.band === "UNKNOWN";
      return { districtId: item.districtId, districtName: item.districtName, canonicalDistrictId: item.canonicalDistrictId, memberDistrictIds: item.memberDistrictIds,
        activation: [{ signal: requested.has(item.districtId) ? "user-requested comparison" : `reviewed ${composition.resolvedModel} decision universe`, materiality: requested.has(item.districtId) ? "MATERIAL" : "CORE", comparisonOnly: requested.has(item.districtId) }],
        dimensions: { canonicalGeography: { status: "REVIEWED", evidence: item.evidenceIds }, propertyTypeFit: { status: meaningful ? "REVIEWED" : "NOT_APPLICABLE", band: item.propertyTypeFit.band, evidence: item.propertyTypeFit.evidenceSources }, accessIntelligence: { status: accessUnknown ? "UNKNOWN" : "REVIEWED", band: item.accessComponent.band, confidence: item.accessComponent.confidence, evidence: item.access.evidenceIds || [] }, businessEnvironment: { status: item.environment.evidenceSources.length ? "REVIEWED" : "UNKNOWN", band: item.environment.band, evidence: item.environment.evidenceSources }, operatingUse: { status: "REVIEWED", reason: `Canonical Requirement signals resolve to ${composition.resolvedModel} without changing the customer-facing property type.` }, evidenceConfidence: { status: accessUnknown ? "MISSING" : "REVIEWED", confidence: item.accessComponent.confidence } },
        evaluationStatus: !meaningful ? COVERAGE.INELIGIBLE : accessUnknown ? COVERAGE.BLOCKED : COVERAGE.EVALUATED,
        reasons: accessUnknown ? ["A material origin relationship lacks reviewed Access Intelligence."] : [], compositionBand: item.compositionBand };
    });
    const gaps = districts.filter((item) => item.evaluationStatus === COVERAGE.BLOCKED).map((item) => gapRecord(requirement, item, "ACCESS", "employee/customer geography", "CORE", "BLOCKS_FAIR_EVALUATION", item.reasons[0]));
    return { composition, districts, gaps };
  }

  function sanDiegoIndustrialFlexUniverse(requirement, dependencies) {
    const composition = sanDiegoIndustrialFlexComposer.composeLocationRecommendations(requirement, dependencies.sanDiegoIndustrialFlexFoundation, { deferShortlist: true });
    if (!composition.supported || composition.projection?.abstention) {
      const gap = composition.projection?.abstention;
      return { composition, districts: [], gaps: gap ? [gapRecord(requirement, { districtId: "san-diego" }, gap.code, "Requirement scope", "CORE", "BLOCKS_FAIR_EVALUATION", gap.reason)] : [] };
    }
    return { composition, gaps: [], districts: composition.considered.map((item) => ({ districtId: item.districtId, districtName: item.districtName, canonicalDistrictId: item.districtId, memberDistrictIds: [item.districtId], activation: [{ signal: `reviewed San Diego ${composition.resolvedModel} decision universe`, materiality: "CORE" }], dimensions: { canonicalGeography: { status: "REVIEWED", evidence: item.evidenceIds }, propertyTypeFit: { status: item.compositionBand === "INELIGIBLE" ? "REVIEWED_INELIGIBLE" : "REVIEWED", band: item.propertyTypeFit.band, evidence: item.evidenceIds }, businessEnvironment: { status: "REVIEWED", band: item.environment.band, evidence: item.evidenceIds }, accessIntelligence: { status: "NOT_APPLICABLE", reason: "Access does not rank the initial San Diego universe; decisive access needs abstain." }, operatingUse: { status: "REVIEWED", band: item.environment.band, evidence: item.evidenceIds }, representativeContext: { status: item.representatives?.length ? "REVIEWED" : "UNKNOWN" }, propertyCapability: { status: "INVESTIGATE", reason: item.unknowns?.[0] } }, evaluationStatus: item.compositionBand === "INELIGIBLE" ? COVERAGE.INELIGIBLE : COVERAGE.EVALUATED, reasons: [], compositionBand: item.compositionBand })), };
  }

  function northOrangeCountyIndustrialFlexUniverse(requirement, dependencies) {
    const composition = northOrangeCountyIndustrialFlexComposer.composeLocationRecommendations(requirement, dependencies.northOrangeCountyIndustrialFlexFoundation, { deferShortlist: true });
    if (!composition.supported || composition.projection?.abstention) {
      const gap = composition.projection?.abstention;
      return { composition, districts: [], gaps: gap ? [gapRecord(requirement, { districtId: "north-orange-county" }, gap.code, "Requirement scope", "CORE", "BLOCKS_FAIR_EVALUATION", gap.reason)] : [] };
    }
    return { composition, gaps: [], districts: composition.considered.map((item) => ({
      districtId: item.districtId, districtName: item.districtName, canonicalDistrictId: item.districtId, memberDistrictIds: [item.districtId],
      activation: [{ signal: `reviewed bounded North Orange County ${composition.resolvedModel} decision universe`, materiality: "CORE" }],
      dimensions: {
        canonicalGeography: { status: "REVIEWED", evidence: item.evidenceIds },
        propertyTypeFit: { status: item.compositionBand === "INELIGIBLE" ? "REVIEWED_INELIGIBLE" : "REVIEWED", band: item.propertyTypeFit.band, evidence: item.evidenceIds },
        businessEnvironment: { status: item.compositionBand === "INELIGIBLE" ? "NOT_APPLICABLE" : "REVIEWED", band: item.environment.band, evidence: item.evidenceIds },
        accessIntelligence: { status: "NOT_APPLICABLE", reason: "Access does not rank this bounded universe; decisive access needs abstain." },
        operatingUse: { status: item.compositionBand === "INELIGIBLE" ? "NOT_APPLICABLE" : "REVIEWED", band: item.environment.band, evidence: item.evidenceIds },
        representativeContext: { status: item.representatives?.length ? "REVIEWED" : "UNKNOWN" },
        propertyCapability: { status: "INVESTIGATE", reason: item.unknowns?.[0] },
      },
      evaluationStatus: item.compositionBand === "INELIGIBLE" ? COVERAGE.INELIGIBLE : COVERAGE.EVALUATED,
      reasons: [], compositionBand: item.compositionBand,
    })) };
  }

  function phoenixIndustrialFlexUniverse(requirement, dependencies) {
    const composition = phoenixIndustrialFlexComposer.composeLocationRecommendations(requirement, dependencies.phoenixIndustrialFlexFoundation, { deferShortlist: true });
    if (!composition.supported || composition.projection?.abstention) {
      const gap = composition.projection?.abstention;
      return { composition, districts: [], gaps: gap ? [gapRecord(requirement, { districtId: "phoenix" }, gap.code, "Requirement scope", "CORE", "BLOCKS_FAIR_EVALUATION", gap.reason)] : [] };
    }
    return { composition, gaps: [], districts: composition.considered.map((item) => ({
      districtId: item.districtId, districtName: item.districtName, canonicalDistrictId: item.districtId, memberDistrictIds: item.memberDistrictIds,
      activation: [{ signal: `reviewed bounded City of Phoenix ${composition.resolvedModel} decision universe`, materiality: "CORE" }],
      dimensions: {
        canonicalGeography: { status: "REVIEWED", evidence: item.evidenceIds },
        propertyTypeFit: { status: item.compositionBand === "INELIGIBLE" ? "REVIEWED_INELIGIBLE" : "REVIEWED", band: item.propertyTypeFit.band, evidence: item.evidenceIds },
        businessEnvironment: { status: item.compositionBand === "INELIGIBLE" ? "NOT_APPLICABLE" : "REVIEWED", band: item.environment.band, evidence: item.evidenceIds },
        accessIntelligence: { status: "NOT_APPLICABLE", reason: "Access does not rank this bounded City of Phoenix universe; decisive access needs abstain." },
        operatingUse: { status: item.compositionBand === "INELIGIBLE" ? "NOT_APPLICABLE" : "REVIEWED", band: item.environment.band, evidence: item.evidenceIds },
        representativeContext: { status: item.representatives?.length ? "REVIEWED" : "UNKNOWN" },
        propertyCapability: { status: "INVESTIGATE", reason: item.unknowns?.[0] },
      },
      evaluationStatus: item.compositionBand === "INELIGIBLE" ? COVERAGE.INELIGIBLE : COVERAGE.EVALUATED,
      reasons: [], compositionBand: item.compositionBand,
    })) };
  }

  function indianapolisIndustrialFlexUniverse(requirement, dependencies) {
    const composition = indianapolisIndustrialFlexComposer.composeLocationRecommendations(requirement, dependencies.indianapolisIndustrialFlexFoundation, { deferShortlist: true });
    if (!composition.supported || composition.projection?.abstention) {
      const gap = composition.projection?.abstention;
      return { composition, districts: [], gaps: gap ? [gapRecord(requirement, { districtId: "indianapolis" }, gap.code, "Requirement scope", "CORE", "BLOCKS_FAIR_EVALUATION", gap.reason)] : [] };
    }
    return { composition, gaps: [], districts: composition.considered.map((item) => ({
      districtId: item.districtId, districtName: item.districtName, canonicalDistrictId: item.districtId, memberDistrictIds: item.memberDistrictIds,
      activation: [{ signal: `reviewed bounded City of Indianapolis ${composition.resolvedModel} decision universe`, materiality: "CORE" }],
      dimensions: {
        canonicalGeography: { status: "REVIEWED", evidence: item.evidenceIds },
        propertyTypeFit: { status: item.compositionBand === "INELIGIBLE" ? "REVIEWED_INELIGIBLE" : "REVIEWED", band: item.propertyTypeFit.band, evidence: item.evidenceIds },
        businessEnvironment: { status: item.compositionBand === "INELIGIBLE" ? "NOT_APPLICABLE" : "REVIEWED", band: item.environment.band, evidence: item.evidenceIds },
        accessIntelligence: { status: "NOT_APPLICABLE", reason: "Access does not rank this bounded City of Indianapolis universe; decisive access needs abstain." },
        operatingUse: { status: item.compositionBand === "INELIGIBLE" ? "NOT_APPLICABLE" : "REVIEWED", band: item.environment.band, evidence: item.evidenceIds },
        representativeContext: { status: item.representatives?.length ? "REVIEWED" : "UNKNOWN" },
        propertyCapability: { status: "INVESTIGATE", reason: item.unknowns?.[0] },
      },
      evaluationStatus: item.compositionBand === "INELIGIBLE" ? COVERAGE.INELIGIBLE : COVERAGE.EVALUATED,
      reasons: [], compositionBand: item.compositionBand,
    })) };
  }

  function productResponse(level, property) {
    if (level === READINESS.FULL) return { heading: "Recommended locations", note: "There usually isn't one perfect location. Compare the strengths and tradeoffs of these well-supported alternatives.", showShortlist: true, cta: "" };
    if (level === READINESS.BOUNDED) return { heading: "Strong starting points", note: "These areas fit the priorities Rofo can evaluate today. Other potentially relevant areas may still need investigation.", showShortlist: true, cta: "" };
    const medical = property === "medical";
    return { heading: "What matters for your search", note: medical ? "Medical space is highly property-specific. Rofo should investigate available Medical-compatible properties and nearby areas using the requirements you provided." : "Rofo needs more market intelligence before presenting district recommendations with confidence.", showShortlist: false, nextStepHeading: "Recommended next step", cta: medical ? "Investigate available medical space" : "Investigate this market" };
  }

  function evaluateRecommendationReadiness(requirement, dependencies) {
    const market = marketId(requirement);
    const property = propertyType(requirement);
    let result;
    if (market === "san-francisco" && property === "office") result = officeUniverse(requirement, dependencies);
    else if (market === "san-francisco" && property === "retail_service") result = retailUniverse(requirement, dependencies);
    else if (market === "san-francisco" && property === "industrial_flex") result = industrialFlexUniverse(requirement, dependencies);
    else if (market === "san-francisco" && property === "medical") result = medicalUniverse(requirement, dependencies);
    else if (market === "san-diego" && property === "industrial_flex" && dependencies.sanDiegoIndustrialFlexEnabled) result = sanDiegoIndustrialFlexUniverse(requirement, dependencies);
    else if (northOrangeCountyIndustrialFlexComposer.resolveMembership(requirement).eligible && dependencies.northOrangeCountyIndustrialFlexEnabled) result = northOrangeCountyIndustrialFlexUniverse(requirement, dependencies);
    else if (phoenixIndustrialFlexComposer.resolveMembership(requirement).eligible && dependencies.phoenixIndustrialFlexEnabled) result = phoenixIndustrialFlexUniverse(requirement, dependencies);
    else if (indianapolisIndustrialFlexComposer.resolveMembership(requirement).eligible && dependencies.indianapolisIndustrialFlexEnabled) result = indianapolisIndustrialFlexUniverse(requirement, dependencies);
    else result = unsupportedUniverse(requirement);
    const evaluated = result.districts.filter((item) => item.evaluationStatus === COVERAGE.EVALUATED);
    const partial = result.districts.filter((item) => item.evaluationStatus === COVERAGE.PARTIAL);
    const blocked = result.districts.filter((item) => item.evaluationStatus === COVERAGE.BLOCKED);
    const ineligible = result.districts.filter((item) => item.evaluationStatus === COVERAGE.INELIGIBLE);
    const coreBlocked = blocked.some((item) => item.activation.some((entry) => entry.materiality === "CORE"));
    let readiness = READINESS.FULL;
    let rationale = "All materially activated candidates can be evaluated with the relevant reviewed component intelligence.";
    const northOrangeCountySupported = northOrangeCountyIndustrialFlexComposer.resolveMembership(requirement).eligible && dependencies.northOrangeCountyIndustrialFlexEnabled;
    const phoenixSupported = phoenixIndustrialFlexComposer.resolveMembership(requirement).eligible && dependencies.phoenixIndustrialFlexEnabled;
    const indianapolisSupported = indianapolisIndustrialFlexComposer.resolveMembership(requirement).eligible && dependencies.indianapolisIndustrialFlexEnabled;
    const supportedFoundation = (market === "san-francisco" && ["office", "retail_service", "industrial_flex"].includes(property)) || (market === "san-diego" && property === "industrial_flex" && dependencies.sanDiegoIndustrialFlexEnabled) || northOrangeCountySupported || phoenixSupported || indianapolisSupported;
    if (!supportedFoundation || (!evaluated.length && (blocked.length || result.gaps.length))) {
      readiness = READINESS.INVESTIGATE;
      rationale = property === "medical" ? "Medical property conditions dominate and no reviewed SF Medical district foundation can fairly include or exclude plausible areas." : "No supported market/property foundation can produce a defensible district shortlist.";
    } else if (blocked.length || (partial.length && coreBlocked)) {
      readiness = READINESS.BOUNDED;
      rationale = "Useful evaluated starting points exist, but a materially activated candidate remains blocked or incomplete.";
    }
    if (northOrangeCountySupported && readiness !== READINESS.INVESTIGATE && evaluated.length === 1) {
      readiness = READINESS.BOUNDED;
      rationale = "One bounded North Orange County operating environment is supported as a starting point; broader alternatives require investigation.";
    }
    if (phoenixSupported && readiness !== READINESS.INVESTIGATE && evaluated.length === 1) {
      readiness = READINESS.BOUNDED;
      rationale = "One bounded City of Phoenix operating environment is supported as a starting point; broader alternatives require investigation.";
    }
    if (indianapolisSupported && readiness !== READINESS.INVESTIGATE && evaluated.length === 1) {
      readiness = READINESS.BOUNDED;
      rationale = "One bounded City of Indianapolis operating environment is supported as a starting point; broader alternatives require investigation.";
    }
    const composed = readiness === READINESS.INVESTIGATE || !result.composition ? null : market === "san-diego" && property === "industrial_flex"
      ? sanDiegoIndustrialFlexComposer.composeLocationRecommendations(requirement, dependencies.sanDiegoIndustrialFlexFoundation)
      : northOrangeCountySupported
      ? northOrangeCountyIndustrialFlexComposer.composeLocationRecommendations(requirement, dependencies.northOrangeCountyIndustrialFlexFoundation)
      : phoenixSupported
      ? phoenixIndustrialFlexComposer.composeLocationRecommendations(requirement, dependencies.phoenixIndustrialFlexFoundation)
      : indianapolisSupported
      ? indianapolisIndustrialFlexComposer.composeLocationRecommendations(requirement, dependencies.indianapolisIndustrialFlexFoundation)
      : property === "retail_service"
      ? retailComposer.composeLocationRecommendations(requirement, dependencies.accessFoundation, dependencies.sfRetailFoundation)
      : property === "industrial_flex"
        ? industrialFlexComposer.composeLocationRecommendations(requirement, dependencies.accessFoundation, dependencies.sfIndustrialFlexFoundation)
        : composer.composeLocationRecommendations(requirement, dependencies.accessFoundation, dependencies.compositionFoundation, dependencies.sfOfficeModel);
    const presentableIds = new Set([...evaluated, ...partial].map((item) => item.districtId));
    const guardedShortlist = (composed?.shortlist || []).filter((item) => presentableIds.has(item.districtId));
    const finalComposition = composed ? {
      ...composed,
      shortlist: guardedShortlist,
      candidateContext: (composed.candidateContext || []).map((item) => ({ ...item, inShortlist: guardedShortlist.some((candidate) => candidate.districtId === item.districtId) })),
      readinessGuard: "Blocked candidates are excluded from presentation rather than treated as low-fit alternatives.",
    } : null;
    return {
      version: VERSION, market, propertyType: property, readiness, rationale,
      plausibleCandidateUniverse: result.districts,
      evaluated, partiallyEvaluated: partial, blockedByIntelligenceGap: blocked, ineligible,
      intelligenceGaps: result.gaps,
      candidateComposition: result.composition,
      composition: finalComposition,
      shortlist: finalComposition?.shortlist || [],
      productResponse: (market === "san-diego" && property === "industrial_flex" || northOrangeCountySupported || phoenixSupported || indianapolisSupported) && readiness !== READINESS.INVESTIGATE
        ? { heading: guardedShortlist.length === 1 ? "Starting point worth investigating" : "Peer locations worth investigating", note: northOrangeCountySupported ? "This is a bounded North Orange County comparison, not a countywide ranking. Verify property-specific capabilities before choosing a space." : phoenixSupported ? "This is a bounded City of Phoenix comparison, not a Phoenix Metro or Valley-wide ranking. Verify property-specific capabilities before choosing a space." : indianapolisSupported ? "This is a bounded City of Indianapolis comparison, not an Indianapolis Metro ranking. Verify property-specific capabilities before choosing a space." : "Compare the supported operating environments and verify property-specific capabilities before choosing a space.", showShortlist: true, cta: "" }
        : productResponse(readiness, property),
      diagnostics: { rule: "Material activation and missing relevant intelligence, not a completeness percentage.", coreBlocked, counts: { plausible: result.districts.length, evaluated: evaluated.length, partial: partial.length, blocked: blocked.length, ineligible: ineligible.length } },
    };
  }

  return { VERSION, READINESS, COVERAGE, evaluateRecommendationReadiness };
});
