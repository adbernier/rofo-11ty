const buildings = require("./buildings.json");

module.exports = buildings.filter((building, index, arr) => {
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