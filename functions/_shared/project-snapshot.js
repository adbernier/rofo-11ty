function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

export function humanizeTaxonomyLabel(value) {
  const normalized = clean(value, 140);
  if (!normalized) return "";
  return normalized.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
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
    businessCategory: humanizeTaxonomyLabel(canonicalType),
    canonicalBusinessType: canonicalType,
    classificationStatus,
  };
}

function cleanArray(value, max = 12) {
  return Array.isArray(value)
    ? value.map((item) => clean(item, 240)).filter(Boolean).slice(0, max)
    : [];
}

export function executionTimingLabel(value) {
  const normalized = clean(value, 80);
  const labels = {
    asap: "As soon as possible",
    immediately: "Immediately",
    as_soon_as_possible: "As soon as possible",
    within_3_months: "Within 3 months",
    "3_6_months": "3-6 months",
    "6_12_months": "6-12 months",
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
  const selectedDistrict = clean(investigation.districtName || investigation.district || "", 140);
  const headcount = clean(requirements.headcount, 120);
  const approximateSize = executionSizeLabel(requirements.approximateSize || searchProfile.size || searchProfile.size_or_people);
  const timing = executionTimingLabel(requirements.timing || investigation.timing || searchProfile.timing || searchProfile.moveTiming || searchProfile.move_timing);
  const additionalNotes = clean(investigation.additionalNotes, 240);
  const growth = clean(searchProfile.expectedGrowth || searchProfile.expected_growth, 120);
  const topDistricts = bestFitLabelsFromBrief(brief);

  return {
    market,
    propertyType,
    businessType: business.canonicalBusinessType,
    ...business,
    selectedDistrict,
    headcount,
    approximateSize,
    timing,
    additionalNotes,
    growth,
    topDistricts,
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
      selectedDistrict: clean(parsed.selectedDistrict, 140),
      headcount: clean(parsed.headcount, 120),
      approximateSize: executionSizeLabel(parsed.approximateSize),
      timing: executionTimingLabel(parsed.timing),
      additionalNotes: clean(parsed.additionalNotes, 240),
      growth: clean(parsed.growth, 120),
      topDistricts: cleanArray(parsed.topDistricts, 3),
    };
  }

  const propertyType = clean(lead && (lead.effective_space_type || lead.requested_space_type || lead.space_type || v2Location.propertyType), 120);
  const business = businessPresentation({ canonical: lead && (lead.location_profile_business_type || lead.business_type) || v2Location.businessCategory || v2Location.business, specific: lead && (lead.location_profile_business_use || lead.business_use) || v2Location.businessUse, propertyType });
  return {
    market: marketDisplayName({ market: lead && (lead.market || lead.location_display), city: lead && lead.city, state: lead && (lead.state || lead.location_state) }),
    propertyType,
    businessType: business.canonicalBusinessType,
    ...business,
    selectedDistrict: clean(lead && lead.investigation_district, 140),
    headcount: clean(lead && lead.investigation_headcount, 120),
    approximateSize: executionSizeLabel(lead && (lead.space_needed || lead.size)),
    timing: executionTimingLabel(lead && lead.move_timing),
    additionalNotes: clean(lead && lead.investigation_notes, 240),
    growth: clean(lead && (lead.location_profile_expected_growth || lead.expected_growth), 120),
    topDistricts: cleanArray(lead && (lead.top_three_districts || "").split(","), 3),
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
    value.additionalNotes ? `Additional Notes: ${value.additionalNotes}` : "",
    value.growth ? `Growth: ${value.growth}` : "",
    value.topDistricts && value.topDistricts.length ? `Best Fits: ${value.topDistricts.join(", ")}` : "",
  ].filter(Boolean);
}

export function locationBriefReferenceText({ url, topDistricts = [] }) {
  return [
    "Rofo Location Brief",
    "",
    url || "(Location Brief URL unavailable)",
    "",
    "Best Fits",
    ...(topDistricts.length ? topDistricts.map((district) => `- ${district}`) : ["- Review Location Brief"]),
    "",
    "Please review the Location Brief before contacting the client.",
  ].join("\n");
}
