const buildings = require("./buildings.js");

const uniqueBuildings = buildings.filter((building, index, arr) => {
  const key = [
    String(building.state_abbr || "").toLowerCase(),
    String(building.city_slug || "").toLowerCase(),
    String(building.building_slug || "").toLowerCase(),
  ].join("|");

  return (
    arr.findIndex((other) => {
      const otherKey = [
        String(other.state_abbr || "").toLowerCase(),
        String(other.city_slug || "").toLowerCase(),
        String(other.building_slug || "").toLowerCase(),
      ].join("|");

      return otherKey === key;
    }) === index
  );
});

function cityKey(building) {
  return [
    String(building.state_abbr || "").toUpperCase(),
    String(building.city_slug || "").toLowerCase(),
  ].join("/");
}

function buildingIdentity(building) {
  return [
    String(building.state_abbr || "").toLowerCase(),
    String(building.city_slug || "").toLowerCase(),
    String(building.building_slug || "").toLowerCase(),
  ].join("|");
}

function relatedBuildingSummary(building) {
  const displayName = String(building.display_name || building.name || "").trim();
  const hasNoisyName = /[!?]{1,}|^[A-Z0-9\s/,-]{12,}$/.test(displayName);

  return {
    address: building.address,
    display_name: hasNoisyName ? building.address : displayName || building.address,
    type: building.primary_type_label || building.type || "Commercial Space",
    size_label: building.size_label || "",
    building_path: building.building_path,
    space_type_slug: building.space_type_slug || "",
  };
}

const buildingsByCity = uniqueBuildings.reduce((lookup, building) => {
  const key = cityKey(building);
  if (!lookup.has(key)) lookup.set(key, []);
  lookup.get(key).push(building);
  return lookup;
}, new Map());

function getRelatedBuildings(building) {
  const currentIdentity = buildingIdentity(building);
  const cityBuildings = (buildingsByCity.get(cityKey(building)) || [])
    .filter((candidate) => buildingIdentity(candidate) !== currentIdentity);

  const sameType = cityBuildings.filter((candidate) =>
    candidate.space_type_slug &&
    building.space_type_slug &&
    candidate.space_type_slug === building.space_type_slug
  );
  const fallback = cityBuildings.filter((candidate) => !sameType.includes(candidate));

  return [...sameType, ...fallback].slice(0, 5).map(relatedBuildingSummary);
}

module.exports = uniqueBuildings.map((building) => ({
  ...building,
  related_buildings: getRelatedBuildings(building),
}));
