const fs = require("fs");
const path = require("path");

// Adjust this if your _data/cities.js exports differently
const citiesModule = require("../_data/cities");

// Handle either:
// module.exports = [ ... ]
// or module.exports = { cities: [ ... ] }
const cities = Array.isArray(citiesModule) ? citiesModule : (citiesModule.cities || []);

if (!Array.isArray(cities) || cities.length === 0) {
  console.error("Could not load cities array from _data/cities.js");
  process.exit(1);
}

function titleCaseFromSlug(slug) {
  return slug
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

function csvEscape(value) {
  const s = String(value);
  if (s.includes(",") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const rows = [];
const seen = new Set();

for (const city of cities) {
  const state = city.state_abbr || city.state || city.stateAbbr;
  const slug = city.city_slug || city.slug || city.citySlug;

  if (!state || !slug) continue;

  const title = titleCaseFromSlug(slug);
  const target = `https://www.rofo.com/commercial-real-estate/${state}/${slug}/`;

  // Legacy desktop /STATE/City
  const source1 = `https://www.rofo.com/${state}/${title}`;
  // Legacy root domain variant
  const source2 = `https://rofo.com/${state}/${title}`;
  // Mixed-case new structure
  const source3 = `https://www.rofo.com/commercial-real-estate/${state}/${title}`;
  // Root domain mixed-case new structure
  const source4 = `https://rofo.com/commercial-real-estate/${state}/${title}`;

  for (const source of [source1, source2, source3, source4]) {
    const key = `${source} -> ${target}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // SOURCE_URL,TARGET_URL,STATUS_CODE,PRESERVE_QUERY_STRING,INCLUDE_SUBDOMAINS,SUBPATH_MATCHING,PRESERVE_PATH_SUFFIX
    rows.push([source, target, 301, true, false, false, false]);
  }
}

const outPath = path.join(process.cwd(), "cloudflare-city-redirects.csv");
const header = [
  "SOURCE_URL",
  "TARGET_URL",
  "STATUS_CODE",
  "PRESERVE_QUERY_STRING",
  "INCLUDE_SUBDOMAINS",
  "SUBPATH_MATCHING",
  "PRESERVE_PATH_SUFFIX"
];

const csv = [
  header.join(","),
  ...rows.map(row => row.map(csvEscape).join(","))
].join("\n");

fs.writeFileSync(outPath, csv, "utf8");

console.log(`Wrote ${rows.length} redirects to ${outPath}`);