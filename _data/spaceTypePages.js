const cities = require("./cities");
const spaceTypes = require("./spaceTypes");
const buildings = require("./buildings.json");

module.exports = cities.flatMap((city) =>
  Object.values(spaceTypes).map((spaceType) => {
    const normalizedCitySlug = String(city.slug || "").toLowerCase();
    const normalizedStateAbbr = String(city.state_abbr || "").toLowerCase();
    const normalizedTypeLabel = String(spaceType.label || "").toLowerCase();
    const normalizedTypeSlug = String(spaceType.slug || "").toLowerCase();

    const representativeBuildings = buildings.filter((building) => {
      const buildingCitySlug = String(building.city_slug || "").toLowerCase();
      const buildingStateAbbr = String(building.state_abbr || "").toLowerCase();
      const buildingType = String(building.type || "").toLowerCase();
      const buildingPrimaryType = String(building.primary_space_type || "").toLowerCase();
      const buildingSpaceTypes = Array.isArray(building.space_types)
        ? building.space_types.map((type) => String(type).toLowerCase())
        : [];

      return (
        buildingCitySlug === normalizedCitySlug &&
        buildingStateAbbr === normalizedStateAbbr &&
        (
          buildingType === normalizedTypeLabel ||
          buildingPrimaryType === normalizedTypeSlug ||
          buildingSpaceTypes.includes(normalizedTypeSlug)
        )
      );
    });

    return {
      city,
      spaceType,
      state: normalizedStateAbbr,
      city_slug: normalizedCitySlug,
      page_slug: normalizedTypeSlug,
      representativeBuildings,
    };
  })
);