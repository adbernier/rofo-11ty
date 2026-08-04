function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function cleanArray(value, max = 12) {
  return Array.isArray(value)
    ? value.map((item) => clean(item, 240)).filter(Boolean).slice(0, max)
    : [];
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
  const locations = Array.isArray(searchProfile.locations) ? searchProfile.locations : [];
  const firstLocation = locations[0] || {};
  const market = clean(firstLocation.city || firstLocation.label || searchProfile.market || searchProfile.city, 140);
  const propertyType = clean(searchProfile.spaceType || searchProfile.space_type || "Commercial space", 120);
  const businessType = clean(searchProfile.businessType || searchProfile.business_type, 140);
  const approximateSize = clean(searchProfile.size || searchProfile.size_or_people, 120);
  const timing = clean(searchProfile.timing || searchProfile.moveTiming || searchProfile.move_timing, 120);
  const growth = clean(searchProfile.expectedGrowth || searchProfile.expected_growth, 120);
  const topDistricts = bestFitLabelsFromBrief(brief);

  return {
    market,
    propertyType,
    businessType,
    approximateSize,
    timing,
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
      approximateSize: clean(parsed.approximateSize, 120),
      timing: clean(parsed.timing, 120),
      growth: clean(parsed.growth, 120),
      topDistricts: cleanArray(parsed.topDistricts, 3),
    };
  }

  return {
    market: clean(lead && (lead.market || lead.city), 140),
    propertyType: clean(lead && (lead.effective_space_type || lead.requested_space_type || lead.space_type), 120),
    businessType: clean(lead && (lead.location_profile_business_type || lead.business_type), 140),
    approximateSize: clean(lead && (lead.space_needed || lead.size), 120),
    timing: clean(lead && lead.move_timing, 120),
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
    value.approximateSize ? `Approximate Size: ${value.approximateSize}` : "",
    value.timing ? `Timing: ${value.timing}` : "",
    value.growth ? `Growth: ${value.growth}` : "",
    value.topDistricts && value.topDistricts.length ? `Top Three Districts: ${value.topDistricts.join(", ")}` : "",
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
