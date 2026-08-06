const MODEL_KEY = "san-francisco:office";

const SUPPORTED_TOP_LEVEL_FIELDS = new Set([
  "locations",
  "spaceType",
  "size",
  "timing",
  "locationIntent",
  "city",
  "market",
  "districtAnchor",
  "openToNearbyAlternatives",
  "hardDistrictOnly",
  "headcount",
  "regularOccupancy",
  "hybridWorkPattern",
  "expectedGrowth",
  "clientVisitFrequency",
  "recruitingImportance",
  "businessType",
  "operationalUse",
  "approximateSquareFootage",
  "features",
  "officeEnvironment",
  "environmentPreference",
  "commuteOrientation",
  "commuteOrientations",
  "transitImportance",
  "parkingImportance",
  "walkabilityAmenitiesImportance",
  "institutionProximity",
  "budget",
  "cost",
  "costSensitivity",
  "valuePreference",
  "notes",
  "priorities",
  "constraints",
  "facts",
]);

const SF_DISTRICT_ALIASES = {
  "financial-district": "financial-district",
  "financial district": "financial-district",
  soma: "soma",
  "south of market": "soma",
  "mission-bay": "mission-bay",
  "mission bay": "mission-bay",
  "jackson-square": "jackson-square",
  "jackson square": "jackson-square",
  "south-beach": "south-beach",
  "south beach": "south-beach",
  "showplace-square": "showplace-square",
  "showplace square": "showplace-square",
  dogpatch: "dogpatch",
  "design-district": "design-district",
  "design district": "design-district",
  "potrero-hill": "potrero-hill",
  "potrero hill": "potrero-hill",
  "mission-district": "mission-district",
  "mission district": "mission-district",
};

const ECONOMIC_PATTERN = /\b(budget|cost|costs|rent|rents|rate|rates|cheap|cheaper|expensive|overspend|value|concession|concessions|availability|available|landlord|lease economics)\b/i;

function slugKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function labelKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 -]/g, "")
    .trim();
}

function list(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== undefined && item !== null && item !== "");
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function normalizeLocationIntent(value) {
  const key = slugKey(value);
  if (["focus", "compare", "discover"].includes(key)) return key;
  return "";
}

function normalizeSpaceType(value) {
  const key = slugKey(value);
  if (key.includes("office")) return "Office";
  return String(value || "").trim();
}

function isSanFranciscoLocation(location) {
  if (!location || typeof location !== "object") return false;
  const values = [location.label, location.city, location.path, location.slug].map((value) => String(value || "").toLowerCase());
  return values.some((value) => value.includes("san-francisco") || value.includes("san francisco"));
}

function findLocation(raw) {
  const locations = list(raw.locations);
  if (locations.length) return locations[0];
  if (raw.location && typeof raw.location === "object") return raw.location;
  if (raw.city || raw.market) return { label: raw.city || raw.market, city: raw.city || raw.market, type: "city" };
  return null;
}

function districtFromLocation(location) {
  if (!location || typeof location !== "object") return "";
  const direct = labelKey(location.slug || location.district || location.label);
  return SF_DISTRICT_ALIASES[direct] || SF_DISTRICT_ALIASES[direct.replace(/-/g, " ")] || "";
}

function normalizeEnvironment(value) {
  const key = slugKey(value);
  const aliases = {
    modern_and_polished: "modern_polished",
    modern_polished: "modern_polished",
    historic_and_distinctive: "historic_distinctive",
    historic_distinctive: "historic_distinctive",
    creative_and_informal: "creative_informal",
    creative_informal: "creative_informal",
    traditional_and_professional: "traditional_professional",
    traditional_professional: "traditional_professional",
    lower_rise_and_neighborhood_oriented: "lower_rise_neighborhood",
    lower_rise_neighborhood: "lower_rise_neighborhood",
    not_sure_yet: "not_sure",
    not_sure: "not_sure",
  };
  return aliases[key] || "";
}

function addMapping(mappings, targetField, sourceField, sourceValue, normalizedValue, note = "") {
  mappings.push({
    targetField,
    sourceField,
    sourceValue,
    normalizedValue,
    note,
  });
}

function addIfPresent(output, field, sourceField, value, mappings, transform = (item) => item) {
  if (value === undefined || value === null || value === "") return;
  const normalized = transform(value);
  if (normalized === undefined || normalized === null || normalized === "") return;
  output[field] = normalized;
  addMapping(mappings, field, sourceField, value, normalized);
}

function collectEconomicSignals(raw) {
  const values = [
    ...list(raw.budget),
    ...list(raw.cost),
    ...list(raw.costSensitivity),
    ...list(raw.valuePreference),
    ...list(raw.notes),
    ...list(raw.priorities && raw.priorities.budget),
    ...list(raw.priorities && raw.priorities.cost),
    ...list(raw.priorities && raw.priorities.costSensitivity),
    ...list(raw.priorities && raw.priorities.value),
  ];
  return values.map((value) => String(value || "").trim()).filter((value) => value && ECONOMIC_PATTERN.test(value));
}

function unsupportedAnswers(raw, consumedFields) {
  const unsupported = Object.keys(raw)
    .filter((field) => !SUPPORTED_TOP_LEVEL_FIELDS.has(field) || !consumedFields.has(field))
    .filter((field) => raw[field] !== undefined && raw[field] !== null && raw[field] !== "")
    .map((field) => ({
      sourceField: field,
      sourceValue: raw[field],
      reason: SUPPORTED_TOP_LEVEL_FIELDS.has(field)
        ? "Supported source field was present but did not map to a San Francisco Office resolver signal."
        : "Source field is not part of the San Francisco Office launch mapping.",
    }));

  const nestedAllowlist = {
    facts: new Set(["city", "market", "spaceType", "headcount", "regularOccupancy", "hybridWorkPattern", "expectedGrowth", "clientVisitFrequency", "recruitingImportance", "businessType", "operationalUse", "approximateSquareFootage", "budget"]),
    constraints: new Set(["districtAnchor", "anchorDistrict", "commuteOrientation", "institutionProximity"]),
    priorities: new Set(["growth", "clientAccess", "recruiting", "regionalTransit", "transit", "parking", "walkabilityAmenities", "amenities", "officeEnvironment", "environmentPreference", "budget", "cost", "costSensitivity", "value"]),
  };

  Object.entries(nestedAllowlist).forEach(([field, allowlist]) => {
    const value = raw[field];
    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    Object.keys(value).forEach((nestedField) => {
      if (allowlist.has(nestedField)) return;
      unsupported.push({
        sourceField: `${field}.${nestedField}`,
        sourceValue: value[nestedField],
        reason: "Nested source answer is not part of the San Francisco Office launch mapping.",
      });
    });
  });

  return unsupported;
}

function normalizeSfOfficeProfile(sourceAnswers = {}) {
  const raw = sourceAnswers && typeof sourceAnswers === "object" ? sourceAnswers : {};
  const mappings = [];
  const consumedFields = new Set();
  const resolverProfile = {};
  const location = findLocation(raw);
  const locations = list(raw.locations);
  const firstLocationIsSf = isSanFranciscoLocation(location);
  const city = firstValue(raw.city, raw.market, location && location.city, firstLocationIsSf ? "San Francisco" : "");
  const spaceType = normalizeSpaceType(firstValue(raw.spaceType, raw.facts && raw.facts.spaceType));
  const districtAnchor = firstValue(raw.districtAnchor, raw.constraints && raw.constraints.districtAnchor, districtFromLocation(location));

  addIfPresent(resolverProfile, "city", locations.length ? "locations[0]" : "city", city, mappings, (value) => String(value || "").trim());
  addIfPresent(resolverProfile, "spaceType", "spaceType", spaceType, mappings, normalizeSpaceType);
  addIfPresent(resolverProfile, "districtAnchor", districtAnchor === raw.districtAnchor ? "districtAnchor" : "locations[0]", districtAnchor, mappings, (value) => String(value || "").trim());

  consumedFields.add("locations");
  consumedFields.add("location");
  consumedFields.add("city");
  consumedFields.add("market");
  consumedFields.add("spaceType");
  consumedFields.add("districtAnchor");

  const locationIntent = normalizeLocationIntent(raw.locationIntent);
  if (locationIntent) {
    resolverProfile.locationIntent = locationIntent;
    resolverProfile.openToNearbyAlternatives = locationIntent === "compare" || locationIntent === "discover";
    resolverProfile.hardDistrictOnly = locationIntent === "focus" && Boolean(districtAnchor);
    addMapping(mappings, "locationIntent", "locationIntent", raw.locationIntent, locationIntent);
    addMapping(mappings, "openToNearbyAlternatives", "locationIntent", raw.locationIntent, resolverProfile.openToNearbyAlternatives);
    if (resolverProfile.hardDistrictOnly) addMapping(mappings, "hardDistrictOnly", "locationIntent", raw.locationIntent, true);
    consumedFields.add("locationIntent");
  }

  addIfPresent(resolverProfile, "headcount", "headcount", firstValue(raw.headcount, raw.facts && raw.facts.headcount), mappings);
  addIfPresent(resolverProfile, "regularOccupancy", "regularOccupancy", firstValue(raw.regularOccupancy, raw.facts && raw.facts.regularOccupancy), mappings);
  addIfPresent(resolverProfile, "hybridWorkPattern", "hybridWorkPattern", firstValue(raw.hybridWorkPattern, raw.facts && raw.facts.hybridWorkPattern), mappings);
  addIfPresent(resolverProfile, "expectedGrowth", "expectedGrowth", firstValue(raw.expectedGrowth, raw.facts && raw.facts.expectedGrowth, raw.priorities && raw.priorities.growth), mappings);
  addIfPresent(resolverProfile, "clientVisitFrequency", "clientVisitFrequency", firstValue(raw.clientVisitFrequency, raw.facts && raw.facts.clientVisitFrequency, raw.priorities && raw.priorities.clientAccess), mappings);
  addIfPresent(resolverProfile, "recruitingImportance", "recruitingImportance", firstValue(raw.recruitingImportance, raw.facts && raw.facts.recruitingImportance, raw.priorities && raw.priorities.recruiting), mappings);
  addIfPresent(resolverProfile, "businessType", "businessType", firstValue(raw.businessType, raw.facts && raw.facts.businessType), mappings);
  const commuteValue = firstValue(
    Array.isArray(raw.commuteOrientations) ? raw.commuteOrientations[0] : "",
    Array.isArray(raw.commuteOrientation) ? raw.commuteOrientation[0] : raw.commuteOrientation,
    raw.constraints && Array.isArray(raw.constraints.commuteOrientations) ? raw.constraints.commuteOrientations[0] : "",
    raw.constraints && Array.isArray(raw.constraints.commuteOrientation) ? raw.constraints.commuteOrientation[0] : raw.constraints && raw.constraints.commuteOrientation,
  );
  addIfPresent(resolverProfile, "commuteOrientation", "commuteOrientation", commuteValue, mappings, slugKey);
  addIfPresent(resolverProfile, "transitImportance", "transitImportance", firstValue(raw.transitImportance, raw.priorities && raw.priorities.regionalTransit, raw.priorities && raw.priorities.transit), mappings);
  addIfPresent(resolverProfile, "parkingImportance", "parkingImportance", firstValue(raw.parkingImportance, raw.priorities && raw.priorities.parking), mappings);
  addIfPresent(resolverProfile, "walkabilityAmenitiesImportance", "walkabilityAmenitiesImportance", firstValue(raw.walkabilityAmenitiesImportance, raw.priorities && raw.priorities.walkabilityAmenities, raw.priorities && raw.priorities.amenities), mappings);
  addIfPresent(resolverProfile, "officeEnvironment", "officeEnvironment", firstValue(raw.officeEnvironment, raw.environmentPreference, raw.priorities && raw.priorities.officeEnvironment, raw.priorities && raw.priorities.environmentPreference), mappings, normalizeEnvironment);
  addIfPresent(resolverProfile, "institutionProximity", "institutionProximity", firstValue(raw.institutionProximity, raw.constraints && raw.constraints.institutionProximity), mappings);
  addIfPresent(resolverProfile, "approximateSquareFootage", "size", firstValue(raw.approximateSquareFootage, raw.size, raw.facts && raw.facts.approximateSquareFootage), mappings);

  if (Array.isArray(raw.operationalUse) && raw.operationalUse.length) {
    resolverProfile.operationalUse = raw.operationalUse;
    addMapping(mappings, "operationalUse", "operationalUse", raw.operationalUse, raw.operationalUse);
  } else if (raw.facts && Array.isArray(raw.facts.operationalUse) && raw.facts.operationalUse.length) {
    resolverProfile.operationalUse = raw.facts.operationalUse;
    addMapping(mappings, "operationalUse", "facts.operationalUse", raw.facts.operationalUse, raw.facts.operationalUse);
  }

  const features = list(raw.features).map((item) => String(item || "").trim()).filter(Boolean);
  if (features.includes("Transit access")) {
    resolverProfile.transitImportance = resolverProfile.transitImportance || "high";
    addMapping(mappings, "transitImportance", "features", "Transit access", resolverProfile.transitImportance, "Mapped from current Business Profile feature choice.");
  }
  if (features.includes("Parking")) {
    resolverProfile.parkingImportance = resolverProfile.parkingImportance || "high";
    addMapping(mappings, "parkingImportance", "features", "Parking", resolverProfile.parkingImportance, "Mapped from current Business Profile feature choice.");
  }
  if (features.length) consumedFields.add("features");

  [
    "headcount",
    "regularOccupancy",
    "hybridWorkPattern",
    "expectedGrowth",
    "clientVisitFrequency",
    "recruitingImportance",
    "businessType",
    "commuteOrientation",
    "transitImportance",
    "parkingImportance",
    "walkabilityAmenitiesImportance",
    "officeEnvironment",
    "environmentPreference",
    "institutionProximity",
    "operationalUse",
    "approximateSquareFootage",
    "size",
    "facts",
    "constraints",
    "priorities",
  ].forEach((field) => consumedFields.add(field));

  const economicSignals = collectEconomicSignals(raw);
  if (economicSignals.length) {
    resolverProfile.costSensitivity = economicSignals;
    addMapping(mappings, "costSensitivity", "economicLanguage", economicSignals, economicSignals, "Broker context only; no district ranking effect.");
    ["budget", "cost", "costSensitivity", "valuePreference", "notes"].forEach((field) => consumedFields.add(field));
  }

  const modelKey = resolverProfile.city === "San Francisco" && resolverProfile.spaceType === "Office"
    ? MODEL_KEY
    : "";

  return {
    modelKey,
    supported: modelKey === MODEL_KEY,
    resolverProfile,
    sourceMappings: mappings,
    ignoredEconomicSignals: economicSignals.map((value) => ({
      sourceValue: value,
      treatment: "preserved_for_broker_handoff",
      rankingEffect: "none",
    })),
    unsupportedAnswers: unsupportedAnswers(raw, consumedFields),
  };
}

module.exports = {
  MODEL_KEY,
  normalizeSfOfficeProfile,
};
