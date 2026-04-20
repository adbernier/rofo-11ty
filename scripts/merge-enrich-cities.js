const fs = require("fs");
const path = require("path");

const EXISTING_CITIES_PATH = path.join(__dirname, "../_data/raw/cities.raw.json");
const NEW_CITIES_CSV_PATH = path.join(__dirname, "../temp_data/new_city_candidates_final.csv");
const US_CITIES_CSV_PATH = path.join(__dirname, "../temp_data/uscities.csv");

const OUTPUT_JSON_PATH = path.join(__dirname, "../temp_data/cities_merged_enriched.json");
const OUTPUT_CSV_PATH = path.join(__dirname, "../temp_data/cities_merged_enriched.csv");
const OUTPUT_UNMATCHED_PATH = path.join(__dirname, "../temp_data/city_candidates_unmatched.csv");

const CITY_ALIAS_MAP = {
  "CA_san bernadino": "San Bernardino",
  "CO_northglen": "Northglenn"
};

const EXCLUDED_NON_CITY_NAMES = new Set([
  "northridge",
  "otay mesa",
  "pacoima",
  "panorama city",
  "reseda",
  "san fernando valley",
  "studio city",
  "tarzana",
  "winnetka",
  "church ranch",
  "denver golden triangle",
  "interlocken",
  "tahoe basin"
]);

function slugify(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function parseCsv(filePath) {
  const text = fs.readFileSync(filePath, "utf-8").trim();
  const lines = text.split(/\r?\n/);
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || "").trim();
    });
    return row;
  });
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
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ].join("\n");
}

function normalizeNumber(value) {
  if (value === "" || value == null) return "";
  const n = Number(value);
  return Number.isFinite(n) ? n : "";
}

function normalizeBooleanString(value) {
  const lower = String(value || "").trim().toLowerCase();
  if (lower === "true") return "TRUE";
  if (lower === "false") return "FALSE";
  return "";
}

function normalizeCountyName(county) {
  const value = String(county || "").trim();
  if (!value) return "";

  const lower = value.toLowerCase();

  if (lower.endsWith(" county")) {
    return value
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  return value
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ") + " County";
}

function cityKey(city, stateAbbr) {
  return `${String(city || "").trim().toLowerCase()}_${String(stateAbbr || "")
    .trim()
    .toLowerCase()}`;
}

function buildUsCitiesLookup(usCities) {
  const lookup = new Map();

  for (const row of usCities) {
    const city = String(row.city || "").trim();
    const state = String(row.state_id || "").trim();
    if (!city || !state) continue;

    const key = cityKey(city, state);
    const existing = lookup.get(key);

    const currentIsIncorporated =
      String(row.incorporated || "").toLowerCase() === "true";
    const existingIsIncorporated =
      existing && String(existing.incorporated || "").toLowerCase() === "true";

    if (!existing) {
      lookup.set(key, row);
    } else if (currentIsIncorporated && !existingIsIncorporated) {
      lookup.set(key, row);
    }
  }

  return lookup;
}

function applyCityAlias(cityName, stateAbbr) {
  const key = `${stateAbbr}_${String(cityName || "").trim().toLowerCase()}`;
  return CITY_ALIAS_MAP[key] || cityName;
}

function buildDerivedFields(cityName, stateAbbr, slug) {
  return {
    slug: slug || slugify(cityName),
    label: `${cityName}, ${stateAbbr}`,
    city_state_slug: `${slug || slugify(cityName)}-${String(stateAbbr || "").toLowerCase()}`,
    path: `/commercial-real-estate/${stateAbbr}/${slug || slugify(cityName)}/`
  };
}

function enrichExistingCity(city, usMatch) {
  const cleanCity = String(city.city || "").trim();
  const stateAbbr = String(city.state_abbr || "").trim();
  const derived = buildDerivedFields(cleanCity, stateAbbr, city.slug);

  return {
    ...city,
    city: cleanCity,
    state_abbr: stateAbbr,
    county: normalizeCountyName(city.county || (usMatch ? usMatch.county_name : "")),
    lat:
      city.lat !== undefined && city.lat !== null && city.lat !== ""
        ? city.lat
        : usMatch
        ? normalizeNumber(usMatch.lat)
        : "",
    lng:
      city.lng !== undefined && city.lng !== null && city.lng !== ""
        ? city.lng
        : usMatch
        ? normalizeNumber(usMatch.lng)
        : "",
    population: city.population || (usMatch ? normalizeNumber(usMatch.population) : ""),
    zips: city.zips || (usMatch ? usMatch.zips : ""),
    slug: city.slug || derived.slug,
    label: city.label || derived.label,
    city_state_slug: city.city_state_slug || derived.city_state_slug,
    path: city.path || derived.path,
    short_description:
      city.short_description || `Explore commercial real estate in ${cleanCity}, ${stateAbbr}.`,
    meta_description:
      city.meta_description || `Browse commercial real estate in ${cleanCity}, ${stateAbbr}.`,
    hero_image: city.hero_image || "/images/cities/city.jpg",
    source: city.source || "rofo",
    simplemaps_matched: !!usMatch
  };
}

function defaultTierFromPopulation(population) {
  const pop = Number(population || 0);
  if (pop >= 500000) return 1;
  if (pop >= 100000) return 2;
  return 3;
}

function buildNewCity(candidate, usMatch) {
  const cityName = candidate.market_name;
  const stateAbbr = candidate.state_abbr;
  const slug = candidate.slug || slugify(cityName);
  const derived = buildDerivedFields(cityName, stateAbbr, slug);
  const population = normalizeNumber(usMatch.population);

  return {
    city: cityName,
    state_abbr: stateAbbr,
    county: normalizeCountyName(usMatch.county_name || ""),
    lat: normalizeNumber(usMatch.lat),
    lng: normalizeNumber(usMatch.lng),
    population,
    zips: usMatch.zips || "",
    building_count: 0,
    tier: defaultTierFromPopulation(population),
    slug: derived.slug,
    label: derived.label,
    city_state_slug: derived.city_state_slug,
    path: derived.path,
    short_description: `Explore commercial real estate in ${cityName}, ${stateAbbr}.`,
    meta_description: `Browse commercial real estate in ${cityName}, ${stateAbbr}.`,
    hero_image: "/images/cities/city.jpg",
    is_featured: false,
    source: "officefinder+simplemaps",
    officefinder_code: candidate.code || "",
    incorporated: normalizeBooleanString(usMatch.incorporated),
    cdp: normalizeBooleanString(usMatch.cdp),
    ranking: usMatch.ranking || "",
    simplemaps_matched: true,
    is_new_candidate: true
  };
}

function main() {
  console.log("📥 Loading existing Rofo cities...");
  const existingCities = JSON.parse(fs.readFileSync(EXISTING_CITIES_PATH, "utf-8"));

  console.log("📥 Loading new city candidates...");
  const newCandidates = parseCsv(NEW_CITIES_CSV_PATH);

  console.log("📥 Loading SimpleMaps US cities...");
  const usCities = parseCsv(US_CITIES_CSV_PATH);

  console.log(`✅ Existing cities: ${existingCities.length}`);
  console.log(`✅ New candidates: ${newCandidates.length}`);
  console.log(`✅ SimpleMaps cities: ${usCities.length}`);

  const usLookup = buildUsCitiesLookup(usCities);

  const merged = [];
  const unmatchedCandidates = [];
  const existingKeys = new Set();

  for (const city of existingCities) {
    const key = cityKey(city.city, city.state_abbr);
    existingKeys.add(key);

    const usMatch = usLookup.get(key) || null;
    merged.push(enrichExistingCity(city, usMatch));
  }

  for (const candidate of newCandidates) {
    const rawName = String(candidate.market_name || "").trim();
    const stateAbbr = String(candidate.state_abbr || "").trim();
    const aliasedName = applyCityAlias(rawName, stateAbbr);
    const lowerAliased = aliasedName.toLowerCase();

    if (EXCLUDED_NON_CITY_NAMES.has(lowerAliased)) {
      unmatchedCandidates.push({
        state_abbr: stateAbbr,
        market_name: rawName,
        slug: candidate.slug,
        code: candidate.code,
        reason: "excluded_non_city"
      });
      continue;
    }

    const key = cityKey(aliasedName, stateAbbr);

    if (existingKeys.has(key)) {
      continue;
    }

    const usMatch = usLookup.get(key) || null;

    if (!usMatch) {
      unmatchedCandidates.push({
        state_abbr: stateAbbr,
        market_name: rawName,
        slug: candidate.slug,
        code: candidate.code,
        reason: "no_simplemaps_match"
      });
      continue;
    }

    const incorporated = String(usMatch.incorporated || "").toLowerCase() === "true";
    const cdp = String(usMatch.cdp || "").toLowerCase() === "true";

    if (!incorporated && cdp) {
      unmatchedCandidates.push({
        state_abbr: stateAbbr,
        market_name: rawName,
        slug: candidate.slug,
        code: candidate.code,
        reason: "cdp_excluded"
      });
      continue;
    }

    merged.push(
      buildNewCity(
        {
          ...candidate,
          market_name: aliasedName,
          slug: slugify(aliasedName)
        },
        usMatch
      )
    );
    existingKeys.add(key);
  }

  merged.sort((a, b) => {
    if (a.state_abbr !== b.state_abbr) {
      return a.state_abbr.localeCompare(b.state_abbr);
    }
    return a.city.localeCompare(b.city);
  });

  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(merged, null, 2));

  fs.writeFileSync(
    OUTPUT_CSV_PATH,
    toCsv(merged, [
      "city",
      "state_abbr",
      "county",
      "lat",
      "lng",
      "population",
      "zips",
      "building_count",
      "tier",
      "slug",
      "label",
      "city_state_slug",
      "path",
      "source",
      "officefinder_code",
      "incorporated",
      "cdp",
      "ranking",
      "simplemaps_matched",
      "is_new_candidate",
    ])
  );

  fs.writeFileSync(
    OUTPUT_UNMATCHED_PATH,
    toCsv(unmatchedCandidates, [
      "state_abbr",
      "market_name",
      "slug",
      "code",
      "reason",
    ])
  );

  const newAdded = merged.filter((c) => c.is_new_candidate).length;
  const existingEnriched = merged.length - newAdded;

  console.log("\n📊 Merge summary:");
  console.log({
    existing_enriched: existingEnriched,
    new_added: newAdded,
    total_output: merged.length,
    unmatched_candidates: unmatchedCandidates.length,
  });

  console.log(`\n💾 Wrote JSON: ${OUTPUT_JSON_PATH}`);
  console.log(`📄 Wrote CSV: ${OUTPUT_CSV_PATH}`);
  console.log(`📝 Wrote unmatched candidates CSV: ${OUTPUT_UNMATCHED_PATH}`);
}

main();