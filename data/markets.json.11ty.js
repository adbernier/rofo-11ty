module.exports = class {
  data() {
    return {
      permalink: "/data/markets.json",
      eleventyExcludeFromCollections: true
    };
  }

  render() {
    const cities = require("../_data/cities.generated.json");

    const markets = cities.map(city => ({
      l: city.label || `${city.city}, ${city.state_abbr}`,
      p: city.path || `/commercial-real-estate/${city.state_abbr}/${city.slug}/`
    }));

    return JSON.stringify(markets);
  }
};