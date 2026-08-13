const fs = require("fs");
const path = require("path");
const fallbackSnapshot = require("../_data/searchConsoleOpportunitySnapshot");
const { normalizeSearchConsoleRecords } = require("../lib/eos/commercial-knowledge-intelligence");
const { searchMarketIdentity } = require("../lib/search-intelligence/market-identity");

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function numberOrNull(value) {
  const parsed = Number(String(value || "").replace(/%$/, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readJson(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (Array.isArray(data)) {
    return {
      schemaVersion: "search-console-opportunity-snapshot-v1",
      source: "Imported JSON",
      dateRange: null,
      updatedAt: new Date().toISOString(),
      records: data,
    };
  }
  return data;
}

function readCsv(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift() || "").map((header) => header.toLowerCase());
  const records = new Map();

  lines.forEach((line) => {
    const columns = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = columns[index];
    });

    const marketName = row.market || row.city || "";
    const legacyMarketId = row.marketid || row.market_id || slugify(marketName);
    const identity = searchMarketIdentity({ state: row.state, marketId: legacyMarketId, marketName });
    if (!identity.marketId) return;

    if (!records.has(identity.marketId)) {
      records.set(identity.marketId, {
        marketId: identity.marketId,
        marketKey: identity.marketKey,
        legacyMarketId: identity.legacyMarketId,
        marketName: marketName || identity.legacyMarketId,
        state: row.state || "",
        impressions: 0,
        clicks: 0,
        averagePosition: null,
        topQueries: [],
      });
    }

    const record = records.get(identity.marketId);
    const impressions = numberOrNull(row.impressions);
    const clicks = numberOrNull(row.clicks);
    const position = numberOrNull(row.position || row.averageposition || row.average_position);

    if (Number.isFinite(impressions)) record.impressions += impressions;
    if (Number.isFinite(clicks)) record.clicks += clicks;
    record.topQueries.push({
      query: row.query || "",
      impressions,
      clicks,
      position,
    });
  });

  records.forEach((record) => {
    const weighted = record.topQueries
      .filter((query) => Number.isFinite(query.position) && Number.isFinite(query.impressions) && query.impressions > 0);
    const totalImpressions = weighted.reduce((total, query) => total + query.impressions, 0);
    record.averagePosition = totalImpressions
      ? weighted.reduce((total, query) => total + (query.position * query.impressions), 0) / totalImpressions
      : null;
    if (!record.impressions) record.impressions = null;
    if (!record.clicks) record.clicks = null;
  });

  return {
    schemaVersion: "search-console-opportunity-snapshot-v1",
    source: "Imported CSV",
    dateRange: null,
    updatedAt: new Date().toISOString(),
    records: Array.from(records.values()),
  };
}

function readInput(filePath) {
  if (!filePath) return fallbackSnapshot;
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".json") return readJson(filePath);
  if (extension === ".csv") return readCsv(filePath);
  throw new Error("Unsupported Search Console opportunity input. Use JSON or CSV.");
}

function main() {
  const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : "";
  const outputPath = process.argv[3]
    ? path.resolve(process.argv[3])
    : path.join(process.cwd(), "data", "generated", "search-console-opportunity.json");
  const snapshot = readInput(inputPath);
  const records = normalizeSearchConsoleRecords(snapshot);
  const output = {
    schemaVersion: "normalized-search-console-opportunity-v1",
    generatedAt: new Date().toISOString(),
    source: snapshot.source || "Search Console export",
    sourceDateRange: snapshot.dateRange || null,
    records,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Search Console opportunity data written to ${path.relative(process.cwd(), outputPath)}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  parseCsvLine,
  readInput,
};
