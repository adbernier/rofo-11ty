const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const STAGING_FILES = [
  path.join(ROOT, "raw/availability-intake/highwoods-atlanta.csv"),
];

// Review gate: staging rows are ignored unless marked needs_review=false
// or approved here while the intake workflow is still review-only.
const MANUALLY_APPROVED_BUILDING_KEYS = new Set([
  "ga|atlanta|3500-lenox-rd-ne",
]);

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

function csvRows(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return parseCsv(fs.readFileSync(filePath, "utf8"));
}

function buildingKey(row) {
  const state = clean(row.state).toLowerCase();
  const city = slugify(row.city);
  const addressKey = normalizeAddress(row.address);
  const nameKey = slugify(row.building_name);
  const primaryKey = addressKey || nameKey;

  if (!state || !city || !primaryKey) return "";
  return `${state}|${city}|${primaryKey}`;
}

function rowIsApproved(row) {
  const needsReview = clean(row.needs_review).toLowerCase();
  const approved = clean(row.enrichment_approved || row.approved || row.manually_approved).toLowerCase();
  const key = buildingKey(row);

  return (
    needsReview === "false" ||
    approved === "true" ||
    approved === "yes" ||
    MANUALLY_APPROVED_BUILDING_KEYS.has(key)
  );
}

function rowIsUsable(row) {
  const confidence = Number(row.confidence || 0);
  return confidence >= 0.7 && rowIsApproved(row);
}

function sizeSignal(sizeSf) {
  const size = Number(String(sizeSf || "").replace(/[^0-9]/g, ""));
  if (!size) return "";
  if (size < 2500) return "small";
  if (size <= 10000) return "mid";
  return "large";
}

function inferTenantTypes(notes) {
  const text = clean(notes).toLowerCase();
  const tags = [];

  [
    ["creative", "creative teams"],
    ["flexible", "flexible users"],
    ["professional", "professional services"],
    ["medical", "medical users"],
    ["warehouse", "warehouse users"],
    ["logistics", "logistics users"],
    ["service", "service businesses"],
    ["growing", "growing teams"],
  ].forEach(([match, tag]) => {
    if (text.includes(match) && !tags.includes(tag)) tags.push(tag);
  });

  return tags;
}

function extractVirtualTourUrl(notes) {
  const match = clean(notes).match(/Virtual tour visible:\s*(https?:\/\/[^\s]+)/i);
  return match ? match[1].replace(/[),.]+$/g, "") : "";
}

function cleanDescription(notes) {
  const descriptionMatch = clean(notes).match(/Detail page description:\s*(.*?)(?:\s+Market source:|$)/i);
  const source = descriptionMatch ? descriptionMatch[1] : clean(notes);
  const withoutUrls = source
    .replace(/https?:\/\/\S+/g, "")
    .replace(/Virtual tour visible:\s*/gi, "")
    .replace(/Available now\.?\s*/gi, "")
    .replace(/Lease with Highwoods today\.?\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const firstSentence = withoutUrls.match(/^(.+?[.!?])(?:\s|$)/);
  const snippet = firstSentence ? firstSentence[1] : withoutUrls;

  return snippet.length > 220 ? `${snippet.slice(0, 217).trim()}...` : snippet;
}

function firstValue(rows, field) {
  const row = rows.find((candidate) => clean(candidate[field]));
  return row ? clean(row[field]) : "";
}

function buildEntry(key, rows) {
  const sizeSignals = [...new Set(rows.map((row) => sizeSignal(row.size_sf)).filter(Boolean))];
  const tenantTypes = [...new Set(rows.flatMap((row) => inferTenantTypes(row.availability_notes)))];
  const description = cleanDescription(firstValue(rows, "availability_notes"));
  const imageUrl = firstValue(rows, "image_url");
  const virtualTourUrl = rows.map((row) => extractVirtualTourUrl(row.availability_notes)).find(Boolean) || "";
  const sourceUrl = firstValue(rows, "source_url");
  const sourceName = firstValue(rows, "source_name") || firstValue(rows, "company");

  return {
    building_key: key,
    has_availability: rows.length >= 1,
    availability_count: rows.length,
    size_signals: sizeSignals,
    inferred_tenant_types: tenantTypes,
    description_snippet: description,
    image_url: imageUrl,
    virtual_tour_url: virtualTourUrl,
    source: sourceName || sourceUrl,
    source_url: sourceUrl,
  };
}

function buildEnrichment() {
  const groups = new Map();

  for (const row of STAGING_FILES.flatMap(csvRows).filter(rowIsUsable)) {
    const key = buildingKey(row);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  const entries = {};
  for (const [key, rows] of groups.entries()) {
    entries[key] = buildEntry(key, rows);
  }

  return entries;
}

const enrichment = buildEnrichment();

Object.defineProperty(enrichment, "normalizeAddress", {
  value: normalizeAddress,
  enumerable: false,
});

Object.defineProperty(enrichment, "slugify", {
  value: slugify,
  enumerable: false,
});

module.exports = enrichment;
