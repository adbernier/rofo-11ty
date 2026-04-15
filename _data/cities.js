const fs = require("fs");
const path = require("path");

const rawCities = require("./raw/cities.raw.json");

const supplementalCsvPath = path.join(
  __dirname,
  "raw",
  "rofo_top_1200_cities_2026-04-14_103326.csv"
);

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseCsvLine(line) {
  const values = [];
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
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values.map((v) => String(v || "").trim());
}

function readCsvRows(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Supplemental CSV not found: ${filePath}`);
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, i) => {
      row[header] = values[i] || "";
    });

    return row;
  });
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function mergeSupplementalCities(baseCities, supplementalRows) {
  const merged = baseCities.map((city) => ({ ...city }));
  const byKey = new Map();

  merged.forEach((city, index) => {
    const key =
      city.city_state_slug ||
      `${slugify(city.city)}-${String(city.state_abbr || "").toLowerCase()}`;
    byKey.set(key, index);
  });

  supplementalRows.forEach((row) => {
    const cityName = String(row.city || "").trim();
    const stateAbbr = String(row.state_abbr || "").trim().toUpperCase();

    if (!cityName || !stateAbbr) return;

    const slug = slugify(cityName);
    const key = `${slug}-${stateAbbr.toLowerCase()}`;

    const county = String(row.county || "").trim();
    const state = String(row.state || "").trim();
    const metro = String(row.metro || "").trim();
    const updatedAt = String(row.updated_at || "").trim();
    const cityDescription = String(row.city_description || "").trim();
    const lat = toNumber(row.lat);
    const lng = toNumber(row.lng);
    const buildingCount = toNumber(row.building_count);

    if (byKey.has(key)) {
      const idx = byKey.get(key);
      const existing = merged[idx];

      const hadCounty = !!String(existing.county || "").trim();

      merged[idx] = {
        ...existing,
        state: existing.state || state,
        county: hadCounty ? existing.county : county || existing.county || "",
        lat:
          typeof existing.lat === "number" && !Number.isNaN(existing.lat)
            ? existing.lat
            : lat,
        lng:
          typeof existing.lng === "number" && !Number.isNaN(existing.lng)
            ? existing.lng
            : lng,
        metro: existing.metro || metro,
        updated_at: existing.updated_at || updatedAt,
        building_count:
          existing.building_count ||
          buildingCount ||
          existing.building_count ||
          null,
        city_description_raw:
          existing.city_description_raw ||
          cityDescription ||
          existing.city_description_raw ||
          "",
      };

      return;
    }

    const newCity = {
      city: cityName,
      slug,
      state_abbr: stateAbbr,
      state,
      county: county || "",
      lat,
      lng,
      metro: metro || "",
      updated_at: updatedAt || "",
      building_count: buildingCount,
      city_description_raw: cityDescription || "",
      city_state_slug: key,
    };

    merged.push(newCity);
    byKey.set(key, merged.length - 1);
  });

  return merged;
}

const supplementalRows = readCsvRows(supplementalCsvPath);
const mergedRawCities = mergeSupplementalCities(rawCities, supplementalRows);

// ---- DEDUPE ----
const seenCityKeys = new Set();

const dedupedCities = mergedRawCities.filter((city) => {
  const key =
    city.city_state_slug ||
    `${slugify(city.city)}-${String(city.state_abbr || "").toLowerCase()}`;

  if (!key || seenCityKeys.has(key)) return false;

  seenCityKeys.add(key);
  return true;
});

// ---- LIMIT (CONFIGURABLE) ----
const CITY_LIMIT = null; // set to number (e.g. 500) to re-enable cap

const sortedCities = [...dedupedCities].sort(
  (a, b) => (b.building_count || 0) - (a.building_count || 0)
);

const limitedCities = CITY_LIMIT
  ? sortedCities.slice(0, CITY_LIMIT)
  : sortedCities;

console.warn(
  CITY_LIMIT
    ? `🚧 Limiting build to ${limitedCities.length} cities`
    : `✅ Building full dataset: ${limitedCities.length} cities`
);

// ---- HELPERS ----
function toRadians(deg) {
  return deg * (Math.PI / 180);
}

function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function validCoord(v) {
  return typeof v === "number" && !Number.isNaN(v);
}

function formatNearbyList(candidates) {
  const labels = candidates.map((c) => c.city);
  if (!labels.length) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels[0]}, ${labels[1]}, and ${labels[2]}`;
}

// ---- FINAL EXPORT ----
module.exports = limitedCities.map((city) => {
  const candidates = limitedCities
    .filter(
      (other) =>
        !(other.city === city.city && other.state_abbr === city.state_abbr) &&
        other.state_abbr === city.state_abbr &&
        validCoord(city.lat) &&
        validCoord(city.lng) &&
        validCoord(other.lat) &&
        validCoord(other.lng)
    )
    .map((other) => ({
      ...other,
      distance_miles: haversineMiles(
        city.lat,
        city.lng,
        other.lat,
        other.lng
      ),
    }))
    .sort((a, b) => a.distance_miles - b.distance_miles)
    .slice(0, 4);

  return {
    ...city,
    path: `/commercial-real-estate/${city.state_abbr}/${city.slug}/`,
    label: `${city.city}, ${city.state_abbr}`,
    nearby_cities: candidates.map((c) => c.slug),
    nearby_city_details: candidates.map((c) => ({
      slug: c.slug,
      city: c.city,
      state_abbr: c.state_abbr,
      distance_miles: Math.round(c.distance_miles),
    })),
  };
});