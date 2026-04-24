const cities = require("./cities.generated.json");
const spaceTypes = require("./spaceTypes");
const buildings = require("./buildings.js");

// -----------------------------
// Normalize building type set
// -----------------------------
function getBuildingTypeSet(building) {
  const typeSet = new Set();

  const buildingType = String(building.type || "").toLowerCase();
  const buildingPrimaryType = String(building.primary_space_type || "").toLowerCase();
  const buildingSpaceTypes = Array.isArray(building.space_types)
    ? building.space_types.map((t) => String(t).toLowerCase())
    : [];

  if (buildingType) typeSet.add(buildingType);
  if (buildingPrimaryType) typeSet.add(buildingPrimaryType);
  buildingSpaceTypes.forEach((t) => typeSet.add(t));

  const provider = String(building.provider || building.source || "").toLowerCase();
  const name = String(building.name || building.address || "").toLowerCase();

  const looksLikeCoworking =
    provider.includes("regus") ||
    name.includes("regus") ||
    typeSet.has("coworking") ||
    typeSet.has("coworking-space") ||
    typeSet.has("flex") ||
    typeSet.has("flex-space");

  if (looksLikeCoworking) {
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
// Generate pages (all cities x all space types)
// -----------------------------
module.exports = cities.flatMap((city) => {
  const normalizedCitySlug = String(city.slug || "").toLowerCase();
  const normalizedStateAbbr = String(city.state_abbr || "").toLowerCase();
  const stateAbbr = String(city.state_abbr || "").toUpperCase();

  return Object.values(spaceTypes).map((spaceType) => {
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
  });
});