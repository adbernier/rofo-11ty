const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const rofoCities = require("../_data/cities.js");

const INPUT_PATH = path.join(__dirname, "../temp_data/officefinder_markets.xlsx");
const OUTPUT_JSON = path.join(__dirname, "../temp_data/officefinder_markets_classified.json");
const OUTPUT_REVIEW = path.join(__dirname, "../temp_data/officefinder_markets_review.csv");
const OUTPUT_DISCARDED = path.join(__dirname, "../temp_data/officefinder_markets_discarded.csv");
const OUTPUT_NEW_CITIES_ALL = path.join(__dirname, "../temp_data/new_city_candidates_all_states.csv");
const OUTPUT_NEW_CITIES_CA = path.join(__dirname, "../temp_data/new_city_candidates_ca.csv");
const OUTPUT_NEW_CITIES_FINAL = path.join(__dirname, "../temp_data/new_city_candidates_final.csv");
const OUTPUT_UNMATCHED_SUBMARKETS = path.join(__dirname, "../temp_data/unmatched_submarkets_all_states.csv");

const REGIONAL_BUCKET_TERMS = [
  "east bay",
  "peninsula",
  "south bay",
  "north bay",
  "westside",
  "greater",
  "metro",
  "region",
  "tri-valley",
  "inland empire",
  "silicon valley"
];

const KNOWN_SUBMARKETS = {
  CA: {
    "San Francisco": [
      "Civic Center",
      "SoMa",
      "Mission Bay",
      "Financial District",
      "Union Square"
    ],
    "Los Angeles": [
      "Hollywood",
      "Downtown",
      "Westwood",
      "Century City",
      "Mid-Wilshire",
      "West LA",
      "San Fernando Valley"
    ],
    "San Diego": [
      "La Jolla",
      "Mission Valley",
      "Downtown",
      "Kearny Mesa"
    ],
    Oakland: [
      "Downtown",
      "Airport/Coliseum",
      "Grand Ave/Lake Merritt",
      "Rockridge/Temescal/North"
    ],
    Sacramento: [
      "Midtown",
      "Hwy 50 Corridor",
      "Suburban"
    ]
  },
  NY: {
    "New York": [
      "SoHo",
      "Midtown",
      "Financial District",
      "Chelsea"
    ]
  }
};

const EXCLUDED_CITY_CANDIDATES = new Set([
  "hollywood",
  "granada hills",
  "anaheim hills",
  "gold river",
  "contra costa centre",
  "arden arcade"
]);

const GENERIC_NON_CITY_TERMS = [
  "northern",
  "southern",
  "eastern",
  "western",
  "central",
  "metro",
  "region",
  "area"
];

function slugify(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toCsv(rows, headers) {
  const escape = (value) => {
    const s = String(value ?? "");
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))
  ].join("\n");
}

function parseMarketField(rawMarket) {
  const cleaned = String(rawMarket || "").trim();
  const match = cleaned.match(/^([A-Z]{2})\s*-\s*(.+)$/);

  if (!match) {
    return {
      raw_market: cleaned,
      state_abbr: "",
      market_name: cleaned,
      parse_ok: false
    };
  }

  return {
    raw_market: cleaned,
    state_abbr: match[1].trim(),
    market_name: match[2].trim(),
    parse_ok: true
  };
}

function classifyRow(state_abbr, market_name) {
  const lower = String(market_name || "").toLowerCase();

  if (!market_name) {
    return {
      classification: "needs_review",
      confidence: "low",
      reason: "empty_market_name"
    };
  }

  if (lower.includes("county")) {
    return {
      classification: "county",
      confidence: "high",
      reason: "contains_county"
    };
  }

  if (REGIONAL_BUCKET_TERMS.some((term) => lower.includes(term))) {
    return {
      classification: "regional_bucket",
      confidence: "medium",
      reason: "matched_regional_bucket_term"
    };
  }

  for (const [parentCity, submarkets] of Object.entries(KNOWN_SUBMARKETS[state_abbr] || {})) {
    for (const submarket of submarkets) {
      const combined = `${parentCity}-${submarket}`.toLowerCase();
      if (lower === combined) {
        return {
          classification: "submarket",
          confidence: "high",
          reason: "matched_known_submarket",
          parent_city: parentCity,
          child_submarket: submarket
        };
      }
    }
  }

  if (market_name.includes("-")) {
    const parts = market_name.split("-");
    const parent = parts[0].trim();
    const child = parts.slice(1).join("-").trim();

    return {
      classification: "submarket",
      confidence: "high",
      reason: "city_submarket_pattern",
      parent_city: parent,
      child_submarket: child
    };
  }

  return {
    classification: "city",
    confidence: "medium",
    reason: "default_city"
  };
}

function buildCityLookup() {
  const map = {};

  for (const city of rofoCities) {
    const cityName = String(city.city || "").trim().toLowerCase();
    const stateAbbr = String(city.state_abbr || "").trim().toLowerCase();
    if (!cityName || !stateAbbr) continue;

    const key = `${cityName}_${stateAbbr}`;
    map[key] = city;
  }

  return map;
}

function matchCity(cityLookup, state_abbr, cityName) {
  const key = `${String(cityName || "").trim().toLowerCase()}_${String(state_abbr || "")
    .trim()
    .toLowerCase()}`;

  return cityLookup[key] || null;
}

function dedupeRows(rows, keyFn) {
  const seen = new Map();

  for (const row of rows) {
    const key = keyFn(row);
    if (!seen.has(key)) {
      seen.set(key, row);
    }
  }

  return Array.from(seen.values());
}

function isCandidateNewCity(row) {
  if (row.classification !== "city") return false;
  if (row.matched) return false;
  if (!row.parse_ok) return false;

  const name = String(row.market_name || "").trim().toLowerCase();
  if (!name) return false;

  if (EXCLUDED_CITY_CANDIDATES.has(name)) return false;
  if (GENERIC_NON_CITY_TERMS.includes(name)) return false;
  if (name.length < 3) return false;

  return true;
}

function main() {
  console.log(`✅ Building full dataset: ${rofoCities.length} cities`);
  console.log("📥 Reading Excel file...");

  const cityLookup = buildCityLookup();

  const workbook = XLSX.readFile(INPUT_PATH);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(firstSheet);

  console.log(`✅ Parsed ${rows.length} rows`);

  const enriched = rows.map((row) => {
    const parsed = parseMarketField(row.Market);
    const classification = classifyRow(parsed.state_abbr, parsed.market_name);

    let parentCityName = parsed.market_name;
    if (classification.classification === "submarket") {
      parentCityName = classification.parent_city;
    }

    const match = matchCity(cityLookup, parsed.state_abbr, parentCityName);

    return {
      code: row.Code ?? "",
      raw_market: parsed.raw_market,
      state_abbr: parsed.state_abbr,
      market_name: parsed.market_name,
      slug: slugify(parsed.market_name),
      parse_ok: parsed.parse_ok,

      classification: classification.classification,
      confidence: classification.confidence,
      reason: classification.reason,
      parent_city: classification.parent_city || "",
      child_submarket: classification.child_submarket || "",

      matched: !!match,
      rofo_city: match ? match.city : "",
      rofo_slug: match ? match.slug : "",
      rofo_lat: match ? match.lat : "",
      rofo_lng: match ? match.lng : "",
      rofo_path: match
        ? `/commercial-real-estate/${match.state_abbr}/${match.slug}/`
        : ""
    };
  });

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(enriched, null, 2));

  const reviewRows = enriched.filter(
    (row) =>
      row.classification === "needs_review" ||
      !row.parse_ok ||
      ((row.classification === "city" || row.classification === "submarket") && !row.matched)
  );

  const discardedRows = enriched.filter(
    (row) => row.classification === "regional_bucket"
  );

  const newCityCandidatesAllStates = dedupeRows(
    enriched.filter(isCandidateNewCity),
    (row) => `${row.state_abbr}_${row.slug}`
  ).sort((a, b) => {
    if (a.state_abbr !== b.state_abbr) {
      return a.state_abbr.localeCompare(b.state_abbr);
    }
    return a.market_name.localeCompare(b.market_name);
  });

  const newCityCandidatesCA = newCityCandidatesAllStates.filter(
    (row) => row.state_abbr === "CA"
  );

  const finalCities = newCityCandidatesAllStates;

  const unmatchedSubmarketsAllStates = dedupeRows(
    enriched.filter(
      (row) =>
        row.classification === "submarket" &&
        !row.matched &&
        row.parent_city
    ),
    (row) => `${row.state_abbr}_${slugify(row.parent_city)}_${slugify(row.child_submarket)}`
  ).sort((a, b) => {
    if (a.state_abbr !== b.state_abbr) {
      return a.state_abbr.localeCompare(b.state_abbr);
    }
    if (a.parent_city !== b.parent_city) {
      return a.parent_city.localeCompare(b.parent_city);
    }
    return a.child_submarket.localeCompare(b.child_submarket);
  });

  fs.writeFileSync(
    OUTPUT_REVIEW,
    toCsv(reviewRows, [
      "code",
      "raw_market",
      "state_abbr",
      "market_name",
      "classification",
      "confidence",
      "reason",
      "parent_city",
      "child_submarket",
      "slug",
      "matched",
      "rofo_city",
      "rofo_slug",
      "rofo_lat",
      "rofo_lng",
      "rofo_path"
    ])
  );

  fs.writeFileSync(
    OUTPUT_DISCARDED,
    toCsv(discardedRows, [
      "code",
      "raw_market",
      "state_abbr",
      "market_name",
      "classification",
      "confidence",
      "reason",
      "slug"
    ])
  );

  fs.writeFileSync(
    OUTPUT_NEW_CITIES_ALL,
    toCsv(newCityCandidatesAllStates, [
      "state_abbr",
      "market_name",
      "slug",
      "code"
    ])
  );

  fs.writeFileSync(
    OUTPUT_NEW_CITIES_CA,
    toCsv(newCityCandidatesCA, [
      "state_abbr",
      "market_name",
      "slug",
      "code"
    ])
  );

  fs.writeFileSync(
    OUTPUT_NEW_CITIES_FINAL,
    toCsv(finalCities, [
      "state_abbr",
      "market_name",
      "slug",
      "code"
    ])
  );

  fs.writeFileSync(
    OUTPUT_UNMATCHED_SUBMARKETS,
    toCsv(unmatchedSubmarketsAllStates, [
      "state_abbr",
      "parent_city",
      "child_submarket",
      "market_name",
      "slug",
      "code"
    ])
  );

  const counts = enriched.reduce((acc, row) => {
    acc[row.classification] = (acc[row.classification] || 0) + 1;
    return acc;
  }, {});

  const matchedCount = enriched.filter((row) => row.matched).length;
  const unmatchedCount = enriched.length - matchedCount;

  console.log("\n📊 Classification counts:");
  console.log(counts);

  console.log("\n🔗 Match counts:");
  console.log({
    matched: matchedCount,
    unmatched: unmatchedCount
  });

  console.log("\n🌱 New city candidate counts:");
  console.log({
    all_states: newCityCandidatesAllStates.length,
    california: newCityCandidatesCA.length,
    final: finalCities.length,
    unmatched_submarkets: unmatchedSubmarketsAllStates.length
  });

  console.log(`\n💾 Wrote JSON: ${OUTPUT_JSON}`);
  console.log(`📝 Wrote review CSV: ${OUTPUT_REVIEW}`);
  console.log(`🗑️ Wrote discarded CSV: ${OUTPUT_DISCARDED}`);
  console.log(`🌎 Wrote all-state city candidates CSV: ${OUTPUT_NEW_CITIES_ALL}`);
  console.log(`🌴 Wrote California city candidates CSV: ${OUTPUT_NEW_CITIES_CA}`);
  console.log(`🏁 Wrote FINAL city candidates CSV: ${OUTPUT_NEW_CITIES_FINAL}`);
  console.log(`🏙️ Wrote unmatched submarkets CSV: ${OUTPUT_UNMATCHED_SUBMARKETS}`);
}

main();