const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DRAFT_PATH = path.join(ROOT, "_data/raw/market-snapshots.draft.csv");
const PRODUCTION_PATH = path.join(ROOT, "_data/raw/market-snapshots.csv");

const PRODUCTION_COLUMNS = [
  "state",
  "city_slug",
  "snapshot_title",
  "average_rent",
  "average_rent_direction",
  "average_rent_label",
  "availability_rate",
  "availability_direction",
  "availability_label",
  "market_trend",
  "market_trend_direction",
  "market_trend_label",
  "notable_areas",
  "notable_areas_label",
  "summary",
  "rent_note",
  "availability_note",
  "tenant_takeaway",
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inQuotes && char === '"' && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
  }

  return rows;
}

function rowToObject(headers, row) {
  return headers.reduce((object, header, index) => {
    object[header] = String(row[index] || "").trim();
    return object;
  }, {});
}

function csvEscape(value) {
  const text = String(value || "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeState(value) {
  return String(value || "").trim().toUpperCase();
}

function readCsvObjects(filePath, requiredColumns = []) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing CSV: ${path.relative(ROOT, filePath)}`);
  }

  const rows = parseCsv(fs.readFileSync(filePath, "utf8"));
  const headers = rows.shift() || [];
  const missing = requiredColumns.filter((column) => !headers.includes(column));
  if (missing.length) {
    throw new Error(`${path.relative(ROOT, filePath)} is missing columns: ${missing.join(", ")}`);
  }

  return {
    headers,
    rows: rows.map((row) => rowToObject(headers, row)),
  };
}

function keyFor(row) {
  return `${normalizeState(row.state)}/${slugify(row.city_slug)}`;
}

function writeCsv(filePath, headers, rows) {
  const output = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
  fs.writeFileSync(filePath, `${output}\n`);
}

function main() {
  const production = readCsvObjects(PRODUCTION_PATH, PRODUCTION_COLUMNS);
  const draft = readCsvObjects(DRAFT_PATH, ["state", "city_slug", "approved"]);
  const existingKeys = new Set(production.rows.map(keyFor));

  const promoted = [];
  const remaining = [];
  const warnings = [];

  draft.rows.forEach((row, index) => {
    const lineNumber = index + 2;
    const key = keyFor(row);
    const approved = String(row.approved || "").trim().toLowerCase() === "true";

    if (!approved) {
      remaining.push(row);
      return;
    }

    if (existingKeys.has(key)) {
      warnings.push(`Line ${lineNumber} (${key}): already exists in production; not promoted.`);
      remaining.push(row);
      return;
    }

    promoted.push(row);
    existingKeys.add(key);
  });

  if (promoted.length) {
    const appendRows = promoted
      .map((row) => PRODUCTION_COLUMNS.map((column) => csvEscape(row[column])).join(","))
      .join("\n");
    const existingText = fs.readFileSync(PRODUCTION_PATH, "utf8");
    const prefix = existingText.endsWith("\n") ? "" : "\n";
    fs.appendFileSync(PRODUCTION_PATH, `${prefix}${appendRows}\n`);
  }

  writeCsv(DRAFT_PATH, draft.headers, remaining);

  console.log(`Promoted ${promoted.length} market snapshot rows to ${path.relative(ROOT, PRODUCTION_PATH)}.`);
  console.log(`Left ${remaining.length} unapproved or skipped rows in ${path.relative(ROOT, DRAFT_PATH)}.`);
  console.log("Run npm run build:market-snapshots after promotion to refresh generated data.");

  if (warnings.length) {
    console.warn(`Warnings (${warnings.length}):`);
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }
}

main();
