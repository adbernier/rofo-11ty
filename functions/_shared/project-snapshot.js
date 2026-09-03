function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

export function humanizeTaxonomyLabel(value) {
  const normalized = clean(value, 140);
  if (!normalized) return "";
  return normalized.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function requirementDisplayLabel(kind, value) {
  const normalizedKind = clean(kind, 80).toLowerCase();
  const normalizedValue = clean(value, 180);
  if (!normalizedValue) return "";
  const key = normalizedValue.toLowerCase();
  const labels = {
    business_category: {
      design_creative: "Design / creative",
    },
    growth: {
      significant: "Significant growth",
      high: "Significant growth",
      some: "Some growth",
      medium: "Some growth",
      low: "Stable team",
    },
    operational_use: {
      client_meetings: "Client meetings",
      team_collaboration: "Team collaboration",
      recruiting: "Recruiting",
      quiet_focused_work: "Quiet focused work",
      showroom_presentation: "Showroom / presentation",
      lab_rd_adjacency: "UCSF / R&D adjacency",
    },
    research_preference: {
      research_first: "Research first; contact me with findings",
      include_local_broker: "Include local broker guidance when available",
      already_working_with_broker: "I am already working with a broker",
      not_sure: "Not sure yet",
    },
  };
  const display = labels[normalizedKind]?.[key];
  if (display) return display;
  return /[_-]/.test(normalizedValue) ? humanizeTaxonomyLabel(normalizedValue) : normalizedValue;
}

export function marketDisplayName({ market = "", city = "", state = "", locations = [] } = {}) {
  const normalizedState = clean(state, 40);
  const locationRows = Array.isArray(locations) ? locations.filter(Boolean) : [];
  if (locationRows.length) {
    const cities = uniqueLabels(locationRows.map((item) => item.city || item.label || item.name || item), 12);
    const states = [...new Set(locationRows.map((item) => clean(item && item.state, 40)).filter(Boolean))];
    if (cities.length && states.length === 1) return `${cities.join(" / ")}, ${states[0]}`;
    if (cities.length && states.length > 1) {
      return locationRows.map((item) => [clean(item.city || item.label || item.name, 140), clean(item.state, 40)].filter(Boolean).join(", ")).filter(Boolean).join(" / ");
    }
  }
  const base = clean(market || city, 240);
  if (!base) return normalizedState;
  if (!normalizedState || new RegExp(`(?:,|\\b)\\s*${normalizedState.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i").test(base)) return base;
  return `${base}, ${normalizedState}`;
}

export function businessPresentation({ canonical = "", specific = "", propertyType = "" } = {}) {
  const suppliedUse = clean(specific, 140);
  let canonicalType = clean(canonical, 140);
  let classificationStatus = "classified";
  if (/\bbarber(?:shop)?\b/i.test(suppliedUse) && /retail|service/i.test(propertyType)) canonicalType = "neighborhood_service";
  if (/\bdealership\b/i.test(suppliedUse) && canonicalType === "professional_services") classificationStatus = "investigate";
  return {
    businessUse: suppliedUse || humanizeTaxonomyLabel(canonicalType),
    businessCategory: requirementDisplayLabel("business_category", canonicalType),
    canonicalBusinessType: canonicalType,
    classificationStatus,
  };
}

function cleanArray(value, max = 12) {
  return Array.isArray(value)
    ? value.map((item) => clean(item, 240)).filter(Boolean).slice(0, max)
    : [];
}

function cleanList(value, max = 12) {
  if (Array.isArray(value)) return cleanArray(value, max);
  return clean(value, 1200)
    .split(/[,\n]/)
    .map((item) => clean(item, 240))
    .filter(Boolean)
    .slice(0, max);
}

function locationIntentDisplay(value) {
  const normalized = clean(value, 40).toLowerCase();
  if (normalized === "focus") return "Focus this search here";
  if (normalized === "discover") return "Recommend relevant markets";
  if (normalized === "compare") return "Compare with nearby markets";
  return clean(value, 120);
}

export function executionTimingLabel(value) {
  const normalized = clean(value, 80);
  const labels = {
    asap: "As soon as possible",
    immediately: "Immediately",
    as_soon_as_possible: "As soon as possible",
    within_3_months: "Within 3 months",
    "3_6_months": "3–6 months",
    "6_12_months": "6–12 months",
    more_than_12_months: "More than 12 months",
    exploring: "Just exploring",
    just_exploring: "Just exploring",
    not_sure: "Not sure yet",
  };
  return labels[normalized] || normalized.replace(/_/g, " ");
}

export function executionSizeLabel(value) {
  const raw = clean(value, 120);
  if (!raw) return "";
  if (/^not[_\s-]*sure$/i.test(raw) || /^i'?m not sure$/i.test(raw)) return "I'm not sure";
  return raw.replace(/\bsqft\b/gi, "SF");
}

function parseJson(value, fallback = null) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function uniqueLabels(items, max = 3) {
  const seen = new Set();
  const labels = [];
  (Array.isArray(items) ? items : []).forEach((item) => {
    const label = clean(item && (item.label || item.name || item.districtName || item), 140);
    const key = label.toLowerCase();
    if (!label || seen.has(key)) return;
    seen.add(key);
    labels.push(label);
  });
  return labels.slice(0, max);
}

function bestFitLabelsFromBrief(brief) {
  const marketPath = brief && brief.marketPath || {};
  const recommendedPath = Array.isArray(marketPath.recommendedPath) ? marketPath.recommendedPath : [];
  const compareWith = Array.isArray(marketPath.compareWith) ? marketPath.compareWith : [];
  const labels = uniqueLabels(recommendedPath, 3);
  if (labels.length >= 3) return labels;
  return uniqueLabels([...recommendedPath, ...compareWith], 3);
}

export function buildProjectSnapshotFromBrief(brief) {
  const searchProfile = brief && brief.searchProfile || {};
  const investigation = brief && brief.liveMarketInvestigation || {};
  const requirements = investigation && investigation.confirmedRequirements || {};
  const locations = Array.isArray(searchProfile.locations) ? searchProfile.locations : [];
  const firstLocation = locations[0] || {};
  const market = marketDisplayName({ market: searchProfile.market, city: searchProfile.city, state: firstLocation.state || searchProfile.state, locations });
  const propertyType = clean(searchProfile.spaceType || searchProfile.space_type || "Commercial space", 120);
  const business = businessPresentation({ canonical: requirements.businessType || searchProfile.businessType || searchProfile.business_type, specific: requirements.businessTypeOther || searchProfile.businessUse || searchProfile.business_use, propertyType });
  const specificBusinessUse = clean(requirements.businessTypeOther || searchProfile.businessUse || searchProfile.business_use, 140);
  const selectedDistrict = clean(investigation.districtName || investigation.district || "", 140);
  const headcount = clean(requirements.headcount, 120);
  const approximateSize = executionSizeLabel(requirements.approximateSize || searchProfile.size || searchProfile.size_or_people);
  const timing = executionTimingLabel(requirements.timing || investigation.timing || searchProfile.timing || searchProfile.moveTiming || searchProfile.move_timing);
  const additionalNotes = clean(investigation.additionalNotes, 1000);
  const growth = requirementDisplayLabel("growth", searchProfile.expectedGrowth || searchProfile.expected_growth);
  const topDistricts = bestFitLabelsFromBrief(brief);
  const operationalFeatures = cleanList(searchProfile.features, 12)
    .map((item) => requirementDisplayLabel("operational_feature", item));
  const operationalUse = cleanList(searchProfile.operationalUse || searchProfile.operational_use, 12)
    .map((item) => requirementDisplayLabel("operational_use", item));
  const requirementPriorities = cleanList(requirements.locationPriorities, 12);
  const businessPriorities = requirementPriorities.length ? requirementPriorities : cleanList(brief && brief.priorities, 12);

  return {
    market,
    propertyType,
    businessType: business.canonicalBusinessType,
    ...business,
    specificBusinessUse,
    selectedDistrict,
    headcount,
    approximateSize,
    timing,
    additionalNotes,
    growth,
    topDistricts,
    operationalFeatures,
    featureOther: clean(searchProfile.featureOther || searchProfile.feature_other, 240),
    operationalUse,
    locationIntent: locationIntentDisplay(searchProfile.locationIntent || searchProfile.location_intent),
    researchPreference: requirementDisplayLabel("research_preference", investigation.brokerPreference),
    businessPriorities,
    knownConstraints: clean(requirements.knownConstraints, 1000),
  };
}

export function buildProjectSnapshotFromLead(lead) {
  const parsed = parseJson(lead && lead.project_snapshot_json, null);
  const v2 = parseJson(lead && lead.location_brief_v2_context, null) || {};
  const v2Location = v2.locationRequirement || v2;
  if (parsed && typeof parsed === "object") {
    const business = businessPresentation({
      canonical: parsed.canonicalBusinessType || parsed.businessType || lead && (lead.business_type || lead.location_profile_business_type),
      specific: parsed.businessUse || lead && (lead.business_use || lead.location_profile_business_use) || v2Location.businessUse,
      propertyType: parsed.propertyType || lead && (lead.effective_space_type || lead.requested_space_type || lead.space_type),
    });
    return {
      market: marketDisplayName({ market: parsed.market || lead && lead.market, city: lead && lead.city, state: parsed.state || lead && (lead.state || lead.location_state), locations: parsed.locations }),
      propertyType: clean(parsed.propertyType, 120),
      businessType: business.canonicalBusinessType,
      ...business,
      specificBusinessUse: clean(parsed.specificBusinessUse || lead && (lead.business_use || lead.location_profile_business_use) || v2Location.businessUse, 140),
      selectedDistrict: clean(parsed.selectedDistrict, 140),
      headcount: clean(parsed.headcount, 120),
      approximateSize: executionSizeLabel(parsed.approximateSize),
      timing: executionTimingLabel(parsed.timing),
      additionalNotes: clean(parsed.additionalNotes, 1000),
      growth: requirementDisplayLabel("growth", parsed.growth),
      topDistricts: cleanArray(parsed.topDistricts, 3),
      operationalFeatures: cleanList(parsed.operationalFeatures || lead && (lead.location_profile_features || lead.property_requirement_must_haves), 12)
        .map((item) => requirementDisplayLabel("operational_feature", item)),
      featureOther: clean(parsed.featureOther || lead && lead.location_profile_feature_other, 240),
      operationalUse: cleanList(parsed.operationalUse || lead && lead.location_profile_operational_use, 12)
        .map((item) => requirementDisplayLabel("operational_use", item)),
      locationIntent: locationIntentDisplay(parsed.locationIntent || lead && (lead.location_intent || lead.location_intent_label)),
      researchPreference: requirementDisplayLabel("research_preference", parsed.researchPreference || lead && lead.investigation_broker_preference),
      businessPriorities: cleanList(parsed.businessPriorities || lead && lead.business_priorities, 12),
      knownConstraints: clean(parsed.knownConstraints || lead && lead.requirement_known_constraints, 1000),
    };
  }

  const propertyType = clean(lead && (lead.effective_space_type || lead.requested_space_type || lead.space_type || v2Location.propertyType), 120);
  const business = businessPresentation({ canonical: lead && (lead.location_profile_business_type || lead.business_type) || v2Location.businessCategory || v2Location.business, specific: lead && (lead.location_profile_business_use || lead.business_use) || v2Location.businessUse, propertyType });
  return {
    market: marketDisplayName({ market: lead && (lead.market || lead.location_display), city: lead && lead.city, state: lead && (lead.state || lead.location_state) }),
    propertyType,
    businessType: business.canonicalBusinessType,
    ...business,
    specificBusinessUse: clean(lead && (lead.business_use || lead.location_profile_business_use) || v2Location.businessUse, 140),
    selectedDistrict: clean(lead && lead.investigation_district, 140),
    headcount: clean(lead && lead.investigation_headcount, 120),
    approximateSize: executionSizeLabel(lead && (lead.space_needed || lead.size)),
    timing: executionTimingLabel(lead && lead.move_timing),
    additionalNotes: clean(lead && lead.investigation_notes, 1000),
    growth: requirementDisplayLabel("growth", lead && (lead.location_profile_expected_growth || lead.expected_growth)),
    topDistricts: cleanArray(lead && (lead.top_three_districts || "").split(","), 3),
    operationalFeatures: cleanList(lead && (lead.location_profile_features || lead.property_requirement_must_haves), 12)
      .map((item) => requirementDisplayLabel("operational_feature", item)),
    featureOther: clean(lead && lead.location_profile_feature_other, 240),
    operationalUse: cleanList(lead && lead.location_profile_operational_use, 12)
      .map((item) => requirementDisplayLabel("operational_use", item)),
    locationIntent: locationIntentDisplay(lead && (lead.location_intent || lead.location_intent_label)),
    researchPreference: requirementDisplayLabel("research_preference", lead && lead.investigation_broker_preference),
    businessPriorities: cleanList(lead && lead.business_priorities, 12),
    knownConstraints: clean(lead && lead.requirement_known_constraints, 1000),
  };
}

export function projectSnapshotTextLines(snapshot) {
  const value = snapshot || {};
  return [
    value.market ? `Market: ${value.market}` : "",
    value.propertyType ? `Property Type: ${value.propertyType}` : "",
    value.businessUse ? `Business / Use: ${value.businessUse}` : "",
    value.businessCategory ? `Category: ${value.businessCategory}` : "",
    value.classificationStatus === "investigate" ? "Use Classification: Verify intended use" : "",
    value.selectedDistrict ? `Selected District: ${value.selectedDistrict}` : "",
    value.headcount ? `Headcount: ${value.headcount}` : "",
    value.approximateSize ? `Approximate Size: ${value.approximateSize}` : "",
    value.timing ? `Timing: ${value.timing}` : "",
    value.growth ? `Growth: ${value.growth}` : "",
    value.operationalFeatures && value.operationalFeatures.length ? `Operational Features: ${value.operationalFeatures.join(", ")}` : "",
    value.featureOther ? `Other Feature Detail: ${value.featureOther}` : "",
    value.operationalUse && value.operationalUse.length ? `Operating / Work Pattern: ${value.operationalUse.join(", ")}` : "",
    value.locationIntent ? `Location Approach: ${value.locationIntent}` : "",
    value.researchPreference ? `Research Approach: ${value.researchPreference}` : "",
    value.businessPriorities && value.businessPriorities.length ? `Business Priorities: ${value.businessPriorities.join(", ")}` : "",
    value.knownConstraints ? `Known Constraints: ${value.knownConstraints}` : "",
    value.additionalNotes ? `Additional Notes: ${value.additionalNotes}` : "",
    value.topDistricts && value.topDistricts.length ? `Best Fits: ${value.topDistricts.join(", ")}` : "",
  ].filter(Boolean);
}

export const BROKER_READINESS = Object.freeze({
  READY: "BROKER_READY",
  NEEDS_QUALIFICATION: "NEEDS_QUALIFICATION",
  INSUFFICIENT: "INSUFFICIENT_REQUIREMENT",
});

const GENERIC_BUSINESS_USES = new Set([
  "", "other", "office", "retail", "storefront", "industrial", "warehouse", "flex",
  "commercial", "commercial space", "professional services", "professional_services",
]);

function normalizedBusinessUse(value) {
  return clean(value, 180).toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function isSpecificBusinessUse(snapshot) {
  const specific = normalizedBusinessUse(snapshot.specificBusinessUse);
  if (specific && !GENERIC_BUSINESS_USES.has(specific)) return true;
  const canonical = normalizedBusinessUse(snapshot.canonicalBusinessType || snapshot.businessType);
  return Boolean(canonical && !GENERIC_BUSINESS_USES.has(canonical) && canonical !== "professional services");
}

function isSpecializedUse(snapshot) {
  const text = [
    snapshot.specificBusinessUse,
    snapshot.businessUse,
    snapshot.knownConstraints,
    ...(snapshot.operationalFeatures || []),
    ...(snapshot.operationalUse || []),
  ].join(" ").toLowerCase();
  return snapshot.classificationStatus === "investigate"
    || /\b(dealership|vehicle sales|auto repair|laborator|medical|clinic|food production|hazard|chemical|cannabis)\b/.test(text);
}

function readinessGap(code, label) {
  return { code, label };
}

export function assessBrokerReadiness(lead) {
  const snapshot = buildProjectSnapshotFromLead(lead || {});
  const type = clean(snapshot.propertyType, 120).toLowerCase();
  const isRetail = type.includes("retail");
  const isIndustrialFlex = /industrial|warehouse|flex/.test(type);
  const isOffice = /office|cowork/.test(type) && !isIndustrialFlex;
  const coreGaps = [];
  if (!snapshot.market) coreGaps.push(readinessGap("geography", "Add a usable market or geography."));
  if (!snapshot.propertyType) coreGaps.push(readinessGap("property_type", "Confirm the property type."));
  if (!snapshot.approximateSize) coreGaps.push(readinessGap("size", "Add a usable size or headcount context."));
  if (!snapshot.timing) coreGaps.push(readinessGap("timing", "Confirm the search timing."));
  if (!snapshot.businessUse && !snapshot.businessCategory) coreGaps.push(readinessGap("specific_business_use", "Clarify what the business does."));
  if (coreGaps.length) {
    return {
      status: BROKER_READINESS.INSUFFICIENT,
      label: "Insufficient requirement",
      summary: coreGaps.map((gap) => gap.label).join(" "),
      gaps: coreGaps,
      snapshot,
    };
  }

  const gaps = [];
  const specificUse = isSpecificBusinessUse(snapshot);
  const operatingSignals = [
    ...(snapshot.operationalFeatures || []),
    ...(snapshot.operationalUse || []),
    ...(snapshot.businessPriorities || []),
    snapshot.knownConstraints || "",
  ].filter(Boolean);

  if (isRetail && !specificUse) {
    gaps.push(readinessGap("specific_business_use", "Clarify the actual customer-facing business or use."));
  } else if (isIndustrialFlex) {
    if (!specificUse) gaps.push(readinessGap("specific_business_use", "Clarify what the business does in the Industrial/Flex space."));
    if (!operatingSignals.length) gaps.push(readinessGap("operating_need", "Clarify the warehouse, loading, production, service, showroom, or office/warehouse need."));
  } else if (isOffice && !specificUse && !operatingSignals.length) {
    gaps.push(readinessGap("specific_business_use", "Clarify the business or the work patterns the Office must support."));
  } else if (!specificUse && !operatingSignals.length) {
    gaps.push(readinessGap("specific_business_use", "Clarify what the business does and how the space will be used."));
  }

  if (isSpecializedUse(snapshot)) {
    gaps.push(readinessGap("specialized_requirement_clarification", "Clarify the specialized use and material property requirements before routing."));
  }

  if (!gaps.length) {
    return {
      status: BROKER_READINESS.READY,
      label: "Broker ready",
      summary: "The Requirement contains enough context for a broker to begin without repeating basic qualification.",
      gaps: [],
      snapshot,
    };
  }

  const featureContext = isIndustrialFlex && snapshot.operationalFeatures && snapshot.operationalFeatures.length
    ? ` Existing context: ${snapshot.operationalFeatures.join(", ")}.`
    : "";
  return {
    status: BROKER_READINESS.NEEDS_QUALIFICATION,
    label: "Needs qualification",
    summary: `${gaps.map((gap) => gap.label).join(" ")}${featureContext}`,
    gaps,
    snapshot,
  };
}

export function locationBriefReferenceText({ url, topDistricts = [] }) {
  return [
    "Rofo Location Brief",
    "",
    url || "(Location Brief URL unavailable)",
    "",
    topDistricts.length ? "Locations worth investigating" : "Recommendation context",
    ...(topDistricts.length ? topDistricts.map((district) => `- ${district}`) : ["- Investigation required; no shortlist was generated."]),
    "",
    "Please review the Location Brief before contacting the client.",
  ].join("\n");
}
