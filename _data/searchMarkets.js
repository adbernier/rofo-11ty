module.exports = function() {
  const cities = require("./cities.json");

  return cities.map(city => ({
    city: city.city,
    state: city.state_abbr,
    label: city.label || `${city.city}, ${city.state_abbr}`,
    path: city.path || `/commercial-real-estate/${city.state_abbr}/${city.slug}/`
  }));
};
