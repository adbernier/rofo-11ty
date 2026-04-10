const cities = require("./cities");
const spaceTypes = require("./spaceTypes");
const sampleBuildings = require("./sampleBuildings");

module.exports = cities.flatMap((city) =>
  Object.values(spaceTypes).map((spaceType) => {
    const normalizedCitySlug = String(city.slug || "").toLowerCase();
    const normalizedStateAbbr = String(city.state_abbr || "").toLowerCase();
    const normalizedType = String(spaceType.label || "").toLowerCase();

    const representativeBuildings = sampleBuildings.filter((building) => {
      const buildingCitySlug = String(building.city_slug || "").toLowerCase();
      const buildingStateAbbr = String(building.state_abbr || "").toLowerCase();
      const buildingType = String(building.type || "").toLowerCase();

      return (
        buildingCitySlug === normalizedCitySlug &&
        buildingStateAbbr === normalizedStateAbbr &&
        buildingType === normalizedType
      );
    });

    return {
      city,
      spaceType,
      state: normalizedStateAbbr,
      city_slug: normalizedCitySlug,
      page_slug: String(spaceType.slug || "").toLowerCase(),
      representativeBuildings,
    };
  })
);