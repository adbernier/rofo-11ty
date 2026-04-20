const fs = require("fs");
const path = require("path");
const rofoCities = require("../_data/cities.js");

const INPUT = path.join(__dirname, "../temp_data/new_city_candidates_final.csv");
const OUTPUT = path.join(__dirname, "../temp_data/new_city_candidates_enriched.csv");

// --- simple CSV parser ---
function parseCSV(file) {
  const text = fs.readFileSync(file, "utf-8");
  const [headerLine, ...lines] = text.trim().split("\n");
  const headers = headerLine.split(",");

  return lines.map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i];
    });
    return obj;
  });
}

function toCSV(rows, headers) {
  return [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => row[h] ?? "").join(",")
    )
  ].join("\n");
}

// --- build lookup ---
function buildLookup() {
  const map = {};

  for (const city of rofoCities) {
    const key = `${city.city.toLowerCase()}_${city.state_abbr.toLowerCase()}`;
    map[key] = city;
  }

  return map;
}

// --- matching ---
function matchCity(map, state, name) {
  const key = `${name.toLowerCase()}_${state.toLowerCase()}`;
  return map[key] || null;
}

// --- main ---
function main() {
  console.log("📥 Reading candidate cities...");
  const rows = parseCSV(INPUT);

  const lookup = buildLookup();

  const enriched = rows.map((row) => {
    const match = matchCity(lookup, row.state_abbr, row.market_name);

    return {
      state_abbr: row.state_abbr,
      market_name: row.market_name,
      slug: row.slug,
      code: row.code,

      matched_existing: !!match,

      lat: match ? match.lat : "",
      lng: match ? match.lng : "",
      county: match ? match.county : "",
      tier: match ? match.tier : "",

      needs_geocode: match ? false : true
    };
  });

  const matched = enriched.filter((r) => r.matched_existing).length;
  const unmatched = enriched.length - matched;

  fs.writeFileSync(
    OUTPUT,
    toCSV(enriched, [
      "state_abbr",
      "market_name",
      "slug",
      "code",
      "matched_existing",
      "lat",
      "lng",
      "county",
      "tier",
      "needs_geocode"
    ])
  );

  console.log("\n📊 Results:");
  console.log({ matched, unmatched });

  console.log(`\n💾 Wrote: ${OUTPUT}`);
}

main();