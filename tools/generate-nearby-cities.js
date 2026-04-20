#!/usr/bin/env node

/**
 * Generate nearby cities for Rofo city pages.
 *
 * Reads:
 *   temp_data/cities_merged_enriched.json
 *
 * Writes:
 *   temp_data/cities_with_nearby.json
 *
 * Behavior:
 * - computes nearest nearby cities using haversine distance
 * - strongly prefers same-state cities
 * - avoids self-matches
 * - avoids duplicate nearby entries
 * - can cap same-county duplicates if desired
 *
 * Run manually:
 *   node tools/generate-nearby-cities.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const INPUT_PATH = path.join(ROOT, "temp_data", "cities_merged_enriched.json");
const OUTPUT_PATH = path.join(ROOT, "temp_data", "cities_with_nearby.json");

const TARGET_COUNT = 8;
const MIN_SAME_STATE = 8; // strongly prefer same-state when possible
const MAX_SAME_COUNTY = 8; // helps avoid over-clustering in dense counties
const MAX_RADIUS_MILES = 250; // soft sanity limit for primary pass

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}

function normalizeString(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function parseNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function cityKey(city) {
  return city.city_state_slug || `${city.slug}-${city.state_abbr}`.toLowerCase();
}

function hasValidCoords(city) {
  return parseNumber(city.lat) !== null && parseNumber(city.lng) !== null;
}

function cleanCity(city) {
  return {
    ...city,
    lat: parseNumber(city.lat),
    lng: parseNumber(city.lng),
    population: parseNumber(city.population) || 0,
    county: city.county || "",
    city: city.city || "",
    state_abbr: city.state_abbr || "",
    slug: city.slug || "",
    label: city.label || "",
    city_state_slug: city.city_state_slug || "",
    path: city.path || "",
  };
}

function rankCandidate(baseCity, candidate) {
  const distance = haversineMiles(
    baseCity.lat,
    baseCity.lng,
    candidate.lat,
    candidate.lng
  );

  const sameState = baseCity.state_abbr === candidate.state_abbr;
  const sameCounty =
    normalizeString(baseCity.county) &&
    normalizeString(baseCity.county) === normalizeString(candidate.county);

  /**
   * Sorting logic:
   * 1. same-state first
   * 2. then actual distance
   * 3. then larger population as mild tie-breaker
   */
    return {
    ...candidate,
    distance_miles: Math.round(distance * 10) / 10,
    same_state: sameState,
    same_county: sameCounty,
    sort_county_rank: sameCounty ? 0 : 1,
    sort_state_rank: sameState ? 0 : 1,
    sort_distance: distance,
    sort_population_rank: -(candidate.population || 0),
  };
}

function dedupeByKey(items) {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    const key = cityKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }

  return output;
}

function buildNearbyList(baseCity, allCities) {
  const candidates = allCities
    .filter((candidate) => cityKey(candidate) !== cityKey(baseCity))
    .filter(hasValidCoords)
    .map((candidate) => rankCandidate(baseCity, candidate))
        .sort((a, b) => {
      if (a.sort_county_rank !== b.sort_county_rank) {
        return a.sort_county_rank - b.sort_county_rank;
      }
      if (a.sort_state_rank !== b.sort_state_rank) {
        return a.sort_state_rank - b.sort_state_rank;
      }
      if (a.sort_distance !== b.sort_distance) {
        return a.sort_distance - b.sort_distance;
      }
      return a.sort_population_rank - b.sort_population_rank;
    });

  const sameState = candidates.filter((c) => c.same_state);
  const outOfState = candidates.filter((c) => !c.same_state);

  const selected = [];
  const selectedKeys = new Set();
  const countyCounts = new Map();

  function canAdd(candidate) {
    const key = cityKey(candidate);
    if (selectedKeys.has(key)) return false;

    const countyKey = normalizeString(candidate.county);
    if (countyKey) {
      const count = countyCounts.get(countyKey) || 0;
      if (count >= MAX_SAME_COUNTY) return false;
    }

    return true;
  }

  function addCandidate(candidate) {
    const key = cityKey(candidate);
    selected.push(candidate);
    selectedKeys.add(key);

    const countyKey = normalizeString(candidate.county);
    if (countyKey) {
      countyCounts.set(countyKey, (countyCounts.get(countyKey) || 0) + 1);
    }
  }

  // Pass 1: prioritize same-state cities within reasonable radius
  for (const candidate of sameState) {
    if (selected.length >= MIN_SAME_STATE) break;
    if (candidate.distance_miles > MAX_RADIUS_MILES) continue;
    if (!canAdd(candidate)) continue;
    addCandidate(candidate);
  }

  // Pass 2: fill additional same-state even if farther away
  for (const candidate of sameState) {
    if (selected.length >= TARGET_COUNT) break;
    if (!canAdd(candidate)) continue;
    addCandidate(candidate);
  }

  // Pass 3: fill with cross-state only if needed
  for (const candidate of outOfState) {
    if (selected.length >= TARGET_COUNT) break;
    if (!canAdd(candidate)) continue;
    addCandidate(candidate);
  }

    return dedupeByKey(selected).slice(0, TARGET_COUNT).map((candidate) => ({
    city: candidate.city,
    state_abbr: candidate.state_abbr,
    label: candidate.label,
    slug: candidate.slug,
    city_state_slug: candidate.city_state_slug,
    path: candidate.path,
  }));
}

function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`Input file not found: ${INPUT_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(INPUT_PATH, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    console.error("Expected input JSON to be an array of cities.");
    process.exit(1);
  }

  const cities = parsed
    .map(cleanCity)
    .filter((city) => city.city && city.state_abbr && city.slug && city.path)
    .filter(hasValidCoords);

  console.log(`Loaded ${cities.length} cities with valid coordinates.`);

  const output = cities.map((city, index) => {
    if ((index + 1) % 250 === 0) {
      console.log(`Processed ${index + 1}/${cities.length} cities...`);
    }

    const nearbyCities = buildNearbyList(city, cities);

    return {
      ...city,
      nearby_cities: nearbyCities,
    };
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf8");

  console.log(`Wrote ${output.length} cities to: ${OUTPUT_PATH}`);
  console.log("Done.");
}

main();