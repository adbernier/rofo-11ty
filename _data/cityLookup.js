const cities = require("./cities.js");

module.exports = Object.fromEntries(
  cities.map((city) => [
    city.slug,
    {
      label: `${city.city}, ${city.state_abbr}`,
      path: `/commercial-real-estate/${city.state_abbr}/${city.slug}/`,
    },
  ])
);
