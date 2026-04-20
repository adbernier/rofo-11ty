const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

// Current working city dataset.
// Prefer the pre-nearby enriched source if it exists.
// Fallback to the current generated file.
const CURRENT_INPUT_CANDIDATES = [
  path.join(ROOT, "temp_data", "cities_merged_enriched.json"),
  path.join(ROOT, "_data", "cities.generated.json"),
];

const ROFO_CSV_PATH = path.join(
  ROOT,
  "_data",
  "raw",
  "rofo_top_1200_cities_2026-04-14_103326.csv"
);

const OUTPUT_PATH = path.join(ROOT, "temp_data", "cities_restored_union.json");

function pickInputFile() {
  for (const filePath of CURRENT_INPUT_CANDIDATES) {
    if (fs.existsSync(filePath)) return filePath;
  }
  throw new Error(
    `Could not find any current input file. Checked:\n${CURRENT_INPUT_CANDIDATES.join("\n")}`
  );
}

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

function nonEmpty(...values) {
  for (const v of values) {
    if (v === 0) return v;
    if (v === false) return v;
    if (v !== null && v !== undefined && String(v).trim() !== "") return v;
  }
  return "";
}

function cityKey(city) {
  if (city.city_state_slug) return String(city.city_state_slug).toLowerCase();
  return `${slugify(city.city)}-${String(city.state_abbr || "").toLowerCase()}`;
}

function normalizeCurrentCity(city) {
  const stateAbbr = String(city.state_abbr || "").toUpperCase();
  const slug = slugify(city.slug || city.city || "");
  const key = city.city_state_slug || `${slug}-${stateAbbr.toLowerCase()}`;

  return {
    ...city,
    city: String(city.city || "").trim(),
    state_abbr: stateAbbr,
    slug,
    city_state_slug: key,
    label: city.label || `${city.city}, ${stateAbbr}`,
    path: city.path || `/commercial-real-estate/${stateAbbr}/${slug}/`,
  };
}

function rofoRowToCity(row) {
  const city = String(row.city || "").trim();
  const stateAbbr = String(row.state_abbr || "").trim().toUpperCase();
  const slug = slugify(city);
  const key = `${slug}-${stateAbbr.toLowerCase()}`;

  return {
    city,
    state_abbr: stateAbbr,
    slug,
    city_state_slug: key,
    label: `${city}, ${stateAbbr}`,
    path: `/commercial-real-estate/${stateAbbr}/${slug}/`,
    county: nonEmpty(row.county),
    lat: toNumber(row.lat),
    lng: toNumber(row.lng),
    building_count: toNumber(row.building_count),
    tier: toNumber(row.tier) || 3,
    short_description: nonEmpty(
      row.short_description,
      `Explore commercial real estate in ${city}, ${stateAbbr}.`
    ),
    meta_description: nonEmpty(
      row.meta_description,
      `Browse commercial real estate in ${city}, ${stateAbbr}.`
    ),
    hero_image: nonEmpty(row.hero_image, "/images/cities/city.jpg"),
    source: "rofo",
    is_featured:
      String(row.is_featured || "").toLowerCase() === "true" ||
      String(row.is_featured || "") === "1",
    population: toNumber(row.population),
    zips: nonEmpty(row.zips),
  };
}

function mergeCity(existing, incoming) {
  // Keep current richer/current data as primary, but backfill any gaps from old Rofo.
  return {
    ...incoming,
    ...existing,

    city: nonEmpty(existing.city, incoming.city),
    state_abbr: nonEmpty(existing.state_abbr, incoming.state_abbr),
    slug: nonEmpty(existing.slug, incoming.slug),
    city_state_slug: nonEmpty(existing.city_state_slug, incoming.city_state_slug),
    label: nonEmpty(existing.label, incoming.label),
    path: nonEmpty(existing.path, incoming.path),

    county: nonEmpty(existing.county, incoming.county),
    lat: existing.lat ?? incoming.lat ?? null,
    lng: existing.lng ?? incoming.lng ?? null,
    population: existing.population ?? incoming.population ?? null,
    zips: nonEmpty(existing.zips, incoming.zips),

    building_count:
      existing.building_count ??
      incoming.building_count ??
      null,

    tier: existing.tier ?? incoming.tier ?? 3,

    short_description: nonEmpty(
      existing.short_description,
      incoming.short_description
    ),
    meta_description: nonEmpty(
      existing.meta_description,
      incoming.meta_description
    ),
    hero_image: nonEmpty(existing.hero_image, incoming.hero_image),
    source: nonEmpty(existing.source, incoming.source, "rofo"),
  };
}

function main() {
  const currentInput = pickInputFile();

  if (!fs.existsSync(ROFO_CSV_PATH)) {
    throw new Error(`Rofo CSV not found: ${ROFO_CSV_PATH}`);
  }

  const currentCities = JSON.parse(fs.readFileSync(currentInput, "utf8"))
    .map(normalizeCurrentCity);

  const rofoRows = readCsvRows(ROFO_CSV_PATH);
  const rofoCities = rofoRows
    .map(rofoRowToCity)
    .filter((city) => city.city && city.state_abbr);

  const byKey = new Map();

  // Seed with current dataset first.
  currentCities.forEach((city) => {
    byKey.set(cityKey(city), city);
  });

  let restoredCount = 0;
  let mergedCount = 0;

  // Add back every Rofo city. Merge if already present.
  rofoCities.forEach((rofoCity) => {
    const key = cityKey(rofoCity);

    if (byKey.has(key)) {
      byKey.set(key, mergeCity(byKey.get(key), rofoCity));
      mergedCount += 1;
    } else {
      byKey.set(key, rofoCity);
      restoredCount += 1;
    }
  });

  const output = [...byKey.values()].sort((a, b) => {
    const stateCmp = String(a.state_abbr).localeCompare(String(b.state_abbr));
    if (stateCmp !== 0) return stateCmp;
    return String(a.city).localeCompare(String(b.city));
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf8");

  console.log(`Current input file: ${currentInput}`);
  console.log(`Current input cities: ${currentCities.length}`);
  console.log(`Rofo CSV cities: ${rofoCities.length}`);
  console.log(`Merged existing keys: ${mergedCount}`);
  console.log(`Restored missing Rofo cities: ${restoredCount}`);
  console.log(`Final union city count: ${output.length}`);
  console.log(`Wrote: ${OUTPUT_PATH}`);
}

main();