const fs = require("fs");

// load existing cities
const existing = JSON.parse(
  fs.readFileSync("./_data/raw/cities.raw.json", "utf-8")
);

// load derived cities (from pipeline)
const derived = JSON.parse(
  fs.readFileSync("./_data/derived-cities.json", "utf-8")
);

// helper
function cityKey(city) {
  return `${city.city.toLowerCase()}|${city.state_abbr.toLowerCase()}`;
}

// index existing
const map = new Map();

existing.forEach((c) => {
  map.set(cityKey(c), c);
});

// merge derived
derived.forEach((d) => {
  const key = cityKey(d);

  if (map.has(key)) {
    // update existing
    const existingCity = map.get(key);

    existingCity.building_count =
      (existingCity.building_count || 0) + d.building_count;

  } else {
    // create new city
    const slug = d.city.replace(/\s+/g, "-");

    map.set(key, {
      city: d.city,
      state_abbr: d.state_abbr,
      slug,
      city_state_slug: `${slug.toLowerCase()}-${d.state_abbr.toLowerCase()}`,
      label: `${d.city}, ${d.state_abbr}`,

      lat: null,
      lng: null,

      building_count: d.building_count,
      tier: 3
    });
  }
});

// output
const merged = Array.from(map.values());

fs.writeFileSync(
  "./_data/raw/cities.raw.json",
  JSON.stringify(merged, null, 2)
);

console.log(`✅ Merged ${merged.length} cities`);