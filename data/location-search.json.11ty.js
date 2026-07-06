module.exports = class {
  data() {
    return {
      permalink: "/data/location-search.json",
      eleventyExcludeFromCollections: true
    };
  }

  render() {
    const cities = require("../_data/cities.generated.json");
    const neighborhoodPages = require("../_data/neighborhoodPages.js");
    const seen = new Set();

    function clean(value) {
      return String(value || "").replace(/\s+/g, " ").trim();
    }

    function add(items, item) {
      const label = clean(item.label);
      const city = clean(item.city);
      const state = clean(item.state);
      const type = clean(item.type);
      const path = clean(item.path);
      if (!label) return;
      const key = [type, label.toLowerCase(), city.toLowerCase(), state.toLowerCase()].join("|");
      if (seen.has(key)) return;
      seen.add(key);
      items.push({
        label,
        city,
        state,
        type,
        path,
        search: clean([label, city, state, type].filter(Boolean).join(" "))
      });
    }

    const items = [];

    cities.forEach((city) => {
      const label = clean(city.city || (city.label || "").split(",")[0]);
      add(items, {
        label,
        city: label,
        state: city.state_abbr || "",
        type: "city",
        path: city.path || `/commercial-real-estate/${city.state_abbr}/${city.slug}/`
      });
    });

    neighborhoodPages.forEach((page) => {
      if (!page || page.noindex) return;
      add(items, {
        label: page.name || page.neighborhood_name || page.title || "",
        city: page.city || "",
        state: page.state_abbr || page.state || "",
        type: "district",
        path: page.canonical_neighborhood_path || page.path || ""
      });
    });

    return JSON.stringify(items);
  }
};
