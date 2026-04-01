module.exports = function() {
  const cities = require("./cities.json");

  const lookup = {};

  cities.forEach(city => {
    const key = city.city_state_slug || `${city.slug.toLowerCase()}-${city.state_abbr.toLowerCase()}`;

    lookup[key] = {
      label: city.label || `${city.city}, ${city.state_abbr}`,
      path: city.path || `/commercial-real-estate/${city.state_abbr}/${city.slug}/`
    };
  });

  return lookup;
};
