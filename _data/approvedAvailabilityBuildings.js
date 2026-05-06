const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INPUT_PATH = path.join(ROOT, "raw/availability-intake/highwoods-atlanta-buildings.approved.csv");

function clean(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeAddress(value) {
  return clean(value)
    .toLowerCase()
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bstreet\b/g, "st")
    .replace(/\broad\b/g, "rd")
    .replace(/\bdrive\b/g, "dr")
    .replace(/\bparkway\b/g, "pkwy")
    .replace(/\bboulevard\b/g, "blvd")
    .replace(/\bnortheast\b/g, "ne")
    .replace(/\bnorthwest\b/g, "nw")
    .replace(/\bsoutheast\b/g, "se")
    .replace(/\bsouthwest\b/g, "sw")
    .replace(/,\s*[^,]+$/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length) {
    row.push(value);
    if (row.some((cell) => cell !== "")) rows.push(row);
  }

  const headers = rows.shift() || [];
  return rows.map((cells) =>
    headers.reduce((record, header, index) => {
      record[header] = cells[index] || "";
      return record;
    }, {})
  );
}

function displayName(row) {
  return clean(row.building_name) || clean(row.address);
}

function buildRecord(row) {
  const state = clean(row.state).toUpperCase();
  const city = clean(row.city);
  const citySlug = slugify(city);
  const name = displayName(row);
  const address = clean(row.address);
  const buildingSlug = slugify(name || address);
  const addressKey = normalizeAddress(address);

  return {
    name,
    address,
    city,
    state_abbr: state,
    city_slug: citySlug,
    building_slug: buildingSlug,
    merge_key: `${state.toLowerCase()}|${citySlug}|${addressKey}|${buildingSlug}`,
    type: clean(row.primary_space_type) || "Office",
    space_type: clean(row.primary_space_type) || "Office",
    primary_space_type: clean(row.primary_space_type) || "Office",
    size_label: clean(row.size_summary),
    hero_image: clean(row.image_url),
    building_description: clean(row.description_snippet),
    about_context: clean(row.description_snippet),
    has_availability: clean(row.has_availability).toLowerCase() === "true",
    availability_count: Number(row.availability_count || 0),
    enrichment_description: clean(row.description_snippet),
    enrichment_image: clean(row.image_url),
    virtual_tour_url: clean(row.virtual_tour_url),
    primary_source: clean(row.company),
    featured_company_name: clean(row.company),
    source_url: clean(row.source_url),
    source_confidence: clean(row.confidence),
  };
}

if (!fs.existsSync(INPUT_PATH)) {
  module.exports = [];
} else {
  module.exports = parseCsv(fs.readFileSync(INPUT_PATH, "utf8"))
    .filter((row) => clean(row.reviewed).toLowerCase() === "true")
    .map(buildRecord);
}
