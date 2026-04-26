const cities = require("./cities.generated.json");
const spaceTypes = require("./spaceTypes");
const buildings = require("./buildings.js");

// -----------------------------
// Normalize building type set
// -----------------------------
function getBuildingTypeSet(building) {
  const typeSet = new Set();

  const classificationFields = [
    building.type,
    building.primary_space_type,
    building.category,
    building.use,
    building.property_type,
    building.listing_type,
    building.lease_category,
    ...(Array.isArray(building.space_types) ? building.space_types : []),
    ...(Array.isArray(building.raw_space_types) ? building.raw_space_types : []),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  const sourceFields = [
    building.primary_source,
    building.source,
    ...(Array.isArray(building.source_companies) ? building.source_companies : []),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  const hasClassificationMatch = (matches) =>
    classificationFields.some((value) =>
      matches.some((match) => value.includes(match))
    );

  const hasSourceMatch = (matches) =>
    sourceFields.some((value) =>
      matches.some((match) => value.includes(match))
    );

  const hasOffice =
    hasClassificationMatch([
      "office",
      "private office",
      "executive suite",
      "business center",
      "live/work",
      "live work",
    ]);

  const hasRetail =
    hasClassificationMatch(["retail", "storefront", "restaurant"]);

  const hasIndustrial =
    hasClassificationMatch([
      "industrial",
      "warehouse",
      "distribution",
      "manufacturing",
      "logistics",
      "light industrial",
    ]);

  const hasFlex =
    hasClassificationMatch([
      "flex",
      "flex-space",
      "office/warehouse",
      "office warehouse",
      "light industrial",
      "live/work",
      "live work",
    ]) ||
    (hasOffice && hasIndustrial);

  const hasCoworking =
    hasClassificationMatch([
      "coworking",
      "co-working",
      "shared office",
      "executive suite",
    ]) ||
    hasSourceMatch(["regus", "wework"]) ||
    Boolean(building.is_exec_suite_present);

  if (hasOffice) {
    typeSet.add("office-space");
  }

  if (hasRetail) {
    typeSet.add("retail-space");
  }

  if (hasIndustrial) {
    typeSet.add("industrial-space");
  }

  if (hasFlex) {
    typeSet.add("flex-space");
  }

  if (hasCoworking) {
    typeSet.add("coworking-space");
  }

  return typeSet;
}

// -----------------------------
// Build index ONCE
// -----------------------------
const buildingIndex = new Map();

buildings.forEach((building) => {
  const city = String(building.city_slug || "").toLowerCase();
  const state = String(building.state_abbr || "").toLowerCase();

  if (!city || !state) return;

  const keyBase = `${city}::${state}`;
  const typeSet = getBuildingTypeSet(building);

  typeSet.forEach((type) => {
    const key = `${keyBase}::${type}`;

    if (!buildingIndex.has(key)) {
      buildingIndex.set(key, []);
    }

    buildingIndex.get(key).push(building);
  });
});

// -----------------------------
// Generate pages only where matching inventory exists.
// -----------------------------
module.exports = cities.flatMap((city) => {
  const normalizedCitySlug = String(city.slug || "").toLowerCase();
  const normalizedStateAbbr = String(city.state_abbr || "").toLowerCase();
  const stateAbbr = String(city.state_abbr || "").toUpperCase();

  return Object.values(spaceTypes)
    .map((spaceType) => {
      const normalizedTypeSlug = String(spaceType.slug || "").toLowerCase();

      const key = `${normalizedCitySlug}::${normalizedStateAbbr}::${normalizedTypeSlug}`;
      const representativeBuildings = buildingIndex.get(key) || [];

      return {
        city,
        spaceType,
        state: stateAbbr,
        state_abbr: stateAbbr,
        city_slug: normalizedCitySlug,
        page_slug: normalizedTypeSlug,
        representativeBuildings: representativeBuildings.slice(0, 12),
        hasInventory: representativeBuildings.length > 0,
      };
    })
    .filter((entry) => entry.representativeBuildings.length > 0);
});
