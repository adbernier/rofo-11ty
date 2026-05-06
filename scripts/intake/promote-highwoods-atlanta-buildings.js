const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const INPUT_PATH = path.join(ROOT, "raw/availability-intake/highwoods-atlanta.csv");
const OUTPUT_PATH = path.join(ROOT, "raw/availability-intake/highwoods-atlanta-buildings.approved.csv");

const COLUMNS = [
  "building_name",
  "address",
  "city",
  "state",
  "primary_space_type",
  "company",
  "source_url",
  "image_url",
  "has_availability",
  "availability_count",
  "min_size_sf",
  "max_size_sf",
  "size_summary",
  "description_snippet",
  "virtual_tour_url",
  "contact_name",
  "contact_email",
  "contact_phone",
  "confidence",
  "reviewed",
];

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

function csvEscape(value) {
  const string = String(value ?? "");
  if (/[",\n\r]/.test(string)) {
    return `"${string.replace(/"/g, '""')}"`;
  }
  return string;
}

function writeCsv(rows) {
  const lines = [
    COLUMNS.join(","),
    ...rows.map((row) => COLUMNS.map((column) => csvEscape(row[column])).join(",")),
  ];
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${lines.join("\n")}\n`, "utf8");
}

function isApproved(row) {
  return clean(row.needs_review).toLowerCase() === "false";
}

function usefulName(row) {
  const name = clean(row.building_name);
  if (!name) return "";
  if (/^(property|building|unknown|n\/a)$/i.test(name)) return "";
  if (name.toLowerCase() === clean(row.address).toLowerCase()) return "";
  return name;
}

function groupKey(row) {
  return [
    clean(row.state).toUpperCase(),
    slugify(row.city),
    normalizeAddress(row.address),
    slugify(usefulName(row)),
  ].filter(Boolean).join("|");
}

function numberValue(value) {
  return Number(String(value || "").replace(/[^0-9]/g, ""));
}

function firstValue(rows, field) {
  const row = rows.find((candidate) => clean(candidate[field]));
  return row ? clean(row[field]) : "";
}

function mostCommonValue(rows, field) {
  const counts = new Map();
  for (const value of rows.map((row) => clean(row[field])).filter(Boolean)) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function cleanDescription(notes) {
  const descriptionMatch = clean(notes).match(/Detail page description:\s*(.*?)(?:\s+Market source:|$)/i);
  if (!descriptionMatch) return "";

  const source = descriptionMatch[1];
  const snippet = source
    .replace(/https?:\/\/\S+/g, "")
    .replace(/Virtual tour visible:\s*/gi, "")
    .replace(/Available now\.?\s*/gi, "")
    .replace(/Lease with Highwoods today\.?\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const firstSentence = snippet.match(/^(.+?[.!?])(?:\s|$)/);
  const value = firstSentence ? firstSentence[1] : snippet;

  return value.length > 220 ? `${value.slice(0, 217).trim()}...` : value;
}

function extractVirtualTourUrl(notes) {
  const match = clean(notes).match(/Virtual tour visible:\s*(https?:\/\/[^\s]+)/i);
  return match ? match[1].replace(/[),.]+$/g, "") : "";
}

function sizeSummary(min, max) {
  if (!min && !max) return "";
  if (min && max && min !== max) return `${min.toLocaleString()} to ${max.toLocaleString()} SF observed range`;
  const size = min || max;
  return `${size.toLocaleString()} SF observed size signal`;
}

function buildPromotedRow(rows) {
  const sizes = rows.map((row) => numberValue(row.size_sf)).filter(Boolean);
  const minSize = sizes.length ? Math.min(...sizes) : "";
  const maxSize = sizes.length ? Math.max(...sizes) : "";
  const confidenceValues = rows.map((row) => Number(row.confidence || 0)).filter(Boolean);
  const averageConfidence = confidenceValues.length
    ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
    : 0;
  const notes = firstValue(rows, "availability_notes");

  return {
    building_name: usefulName(rows[0]) || firstValue(rows, "building_name"),
    address: firstValue(rows, "address"),
    city: firstValue(rows, "city"),
    state: firstValue(rows, "state"),
    primary_space_type: mostCommonValue(rows, "property_type") || "Office",
    company: firstValue(rows, "company"),
    source_url: firstValue(rows, "source_url"),
    image_url: firstValue(rows, "image_url"),
    has_availability: "true",
    availability_count: rows.length,
    min_size_sf: minSize || "",
    max_size_sf: maxSize || "",
    size_summary: sizeSummary(minSize, maxSize),
    description_snippet: cleanDescription(notes),
    virtual_tour_url: rows.map((row) => extractVirtualTourUrl(row.availability_notes)).find(Boolean) || "",
    contact_name: firstValue(rows, "contact_name"),
    contact_email: firstValue(rows, "contact_email"),
    contact_phone: firstValue(rows, "contact_phone"),
    confidence: averageConfidence ? averageConfidence.toFixed(2) : "",
    reviewed: "true",
  };
}

function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error(`Missing input file: ${path.relative(ROOT, INPUT_PATH)}`);
  }

  const approvedRows = parseCsv(fs.readFileSync(INPUT_PATH, "utf8")).filter(isApproved);
  const groups = new Map();

  for (const row of approvedRows) {
    const key = groupKey(row);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  const promotedRows = [...groups.values()]
    .map(buildPromotedRow)
    .sort((a, b) => `${a.city} ${a.building_name} ${a.address}`.localeCompare(`${b.city} ${b.building_name} ${b.address}`));

  writeCsv(promotedRows);

  console.log(`Read ${approvedRows.length} approved suite-level rows.`);
  console.log(`Wrote ${promotedRows.length} approved building rows to ${path.relative(ROOT, OUTPUT_PATH)}.`);
}

main();
