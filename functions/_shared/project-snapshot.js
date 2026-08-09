function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
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
  const market = clean(firstLocation.city || firstLocation.label || searchProfile.market || searchProfile.city, 140);
  const propertyType = clean(searchProfile.spaceType || searchProfile.space_type || "Commercial space", 120);
  const businessType = clean(requirements.businessType || searchProfile.businessType || searchProfile.business_type, 140);
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
    businessType,
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
  if (parsed && typeof parsed === "object") {
    return {
      market: clean(parsed.market, 140),
      propertyType: clean(parsed.propertyType, 120),
      businessType: clean(parsed.businessType, 140),
      selectedDistrict: clean(parsed.selectedDistrict, 140),
      headcount: clean(parsed.headcount, 120),
      approximateSize: executionSizeLabel(parsed.approximateSize),
      timing: executionTimingLabel(parsed.timing),
      additionalNotes: clean(parsed.additionalNotes, 240),
      growth: clean(parsed.growth, 120),
      topDistricts: cleanArray(parsed.topDistricts, 3),
    };
  }

  return {
    market: clean(lead && (lead.market || lead.city), 140),
    propertyType: clean(lead && (lead.effective_space_type || lead.requested_space_type || lead.space_type), 120),
    businessType: clean(lead && (lead.location_profile_business_type || lead.business_type), 140),
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
    value.businessType ? `Business Type: ${value.businessType}` : "",
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
