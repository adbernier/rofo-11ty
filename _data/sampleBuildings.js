const cities = require("./cities.json");

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

module.exports = cities.flatMap((city) => {
  return [
    {
      city: city.city,
      state_abbr: city.state_abbr,
      city_slug: city.slug,
      building_slug: `downtown-${slugify(city.city)}-office`,
      name: `Downtown ${city.city} Office Center`,
      address: `100 Main St, ${city.city}, ${city.state_abbr}`,
      type: "Office",
      size: "12,000 SF"
    },
    {
      city: city.city,
      state_abbr: city.state_abbr,
      city_slug: city.slug,
      building_slug: `${slugify(city.city)}-retail-plaza`,
      name: `${city.city} Retail Plaza`,
      address: `250 Market St, ${city.city}, ${city.state_abbr}`,
      type: "Retail",
      size: "8,500 SF"
    }
  ];
});