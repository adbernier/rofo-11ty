const cities = require("./cities.generated.json");

module.exports = Object.fromEntries(
  cities.map((city) => [
    city.slug,
    {
      label: `${city.city}, ${city.state_abbr}`,
      path: `/commercial-real-estate/${city.state_abbr}/${city.slug}/`,
    },
  ])
);
