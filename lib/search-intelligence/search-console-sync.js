const fs = require("fs");
const path = require("path");
const fallbackSnapshot = require("../../_data/searchConsoleOpportunitySnapshot");
const strategicPriorities = require("../../_data/commercialKnowledgeStrategicPriorities");
const { classifyQuery, classifyOccupierRelevance, normalizeSearchConsoleRecords } = require("../eos/commercial-knowledge-intelligence");
const { clientFromEnv } = require("./google-search-console-client");
const { mapRofoUrlToEntity } = require("./url-entity-mapper");
const { searchMarketIdentity } = require("./market-identity");

const DEFAULT_ROW_LIMIT = 25000;
const MIN_DISPLAY_IMPRESSIONS = 10;
const MIN_STRONG_SAMPLE_IMPRESSIONS = 25;
const MAX_MARKET_QUERY_ROWS = 25;
const MAX_RAW_ROWS = 500;

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function completeDayWindows(now = new Date()) {
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const lastCompleteDay = addDays(todayUtc, -1);
  const current7Start = addDays(lastCompleteDay, -6);
  const previous7End = addDays(current7Start, -1);
  const previous7Start = addDays(previous7End, -6);
  const current28Start = addDays(lastCompleteDay, -27);
  const previous28End = addDays(current28Start, -1);
  const previous28Start = addDays(previous28End, -27);
  const current90Start = addDays(lastCompleteDay, -89);

  return [
    { id: "last_7_complete_days", label: "Last 7 complete days", startDate: formatDate(current7Start), endDate: formatDate(lastCompleteDay), comparisonTo: "previous_7_complete_days", primary: false },
    { id: "previous_7_complete_days", label: "Previous 7 complete days", startDate: formatDate(previous7Start), endDate: formatDate(previous7End), primary: false },
    { id: "last_28_complete_days", label: "Last 28 complete days", startDate: formatDate(current28Start), endDate: formatDate(lastCompleteDay), comparisonTo: "previous_28_complete_days", primary: true },
    { id: "previous_28_complete_days", label: "Previous 28 complete days", startDate: formatDate(previous28Start), endDate: formatDate(previous28End), primary: false },
    { id: "last_90_complete_days", label: "Last 90 complete days", startDate: formatDate(current90Start), endDate: formatDate(lastCompleteDay), primary: false, optional: true },
  ];
}

function numberOrZero(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function numberOrNull(value) {
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)) ? Number(value) : null;
}

function weightedAveragePosition(rows) {
  const weightedRows = rows.filter((row) => row.position !== null && row.position !== undefined && row.position !== "" && Number.isFinite(Number(row.position)) && Number(row.impressions) > 0);
  const totalImpressions = weightedRows.reduce((total, row) => total + Number(row.impressions), 0);
  if (!totalImpressions) return null;
  return weightedRows.reduce((total, row) => total + (Number(row.position) * Number(row.impressions)), 0) / totalImpressions;
}

function percentChange(current, previous) {
  const currentValue = numberOrZero(current);
  const previousValue = numberOrZero(previous);
  if (!previousValue && !currentValue) return null;
  if (!previousValue) return currentValue >= MIN_STRONG_SAMPLE_IMPRESSIONS ? 1 : null;
  return (currentValue - previousValue) / previousValue;
}

function momentumLabel(change, current, previous) {
  if (numberOrZero(current) < MIN_STRONG_SAMPLE_IMPRESSIONS && numberOrZero(previous) < MIN_STRONG_SAMPLE_IMPRESSIONS) {
    return "weak_sample";
  }
  if (!Number.isFinite(Number(change))) return "not_comparable";
  if (change >= 0.25) return "up";
  if (change <= -0.25) return "down";
  return "stable";
}

function normalizeGscRow(row, window) {
  const keys = row.keys || [];
  const date = keys[0] || null;
  const page = keys[1] || "";
  const query = keys[2] || "";
  const entity = mapRofoUrlToEntity(page);
  const intents = classifyQuery(query);
  return {
    windowId: window.id,
    dateRange: `${window.startDate}:${window.endDate}`,
    date,
    page: entity.page || page,
    sourcePage: page,
    query,
    clicks: numberOrZero(row.clicks),
    impressions: numberOrZero(row.impressions),
    ctr: numberOrNull(row.ctr),
    position: numberOrNull(row.position),
    entity,
    marketId: entity.marketId || null,
    marketKey: entity.marketKey || null,
    legacyMarketId: entity.legacyMarketId || entity.marketId || null,
    marketName: entity.marketName || null,
    state: entity.state || null,
    propertyType: entity.propertyType || null,
    districtId: entity.districtId || null,
    buildingId: entity.buildingId || null,
    archetypeId: entity.archetypeId || null,
    intents,
    occupierRelevance: classifyOccupierRelevance(intents),
  };
}

function rowsToMarketRecords(rows, windowId = "last_28_complete_days") {
  const grouped = new Map();
  rows
    .filter((row) => row.windowId === windowId && row.marketId)
    .forEach((row) => {
      if (!grouped.has(row.marketId)) {
        grouped.set(row.marketId, {
          marketId: row.marketId,
          marketKey: row.marketKey,
          legacyMarketId: row.legacyMarketId || row.marketId,
          marketName: row.marketName || row.marketId,
          state: row.state || "",
          impressions: 0,
          clicks: 0,
          topQueries: [],
          rawRowCount: 0,
          entityBreakdown: {},
          propertyTypeDemand: {},
        });
      }
      const record = grouped.get(row.marketId);
      record.impressions += row.impressions;
      record.clicks += row.clicks;
      record.rawRowCount += 1;
      record.entityBreakdown[row.entity.entityType] = (record.entityBreakdown[row.entity.entityType] || 0) + row.impressions;
      if (row.propertyType) {
        record.propertyTypeDemand[row.propertyType] = (record.propertyTypeDemand[row.propertyType] || 0) + row.impressions;
      }
      record.topQueries.push({
        query: row.query,
        page: row.page,
        clicks: row.clicks,
        impressions: row.impressions,
        position: row.position,
        propertyType: row.propertyType,
        districtId: row.districtId,
        buildingId: row.buildingId,
        archetypeId: row.archetypeId,
      });
    });

  return Array.from(grouped.values()).map((record) => {
    record.averagePosition = weightedAveragePosition(record.topQueries);
    record.ctr = record.impressions > 0 ? record.clicks / record.impressions : null;
    record.topQueries = record.topQueries
      .sort((a, b) => b.impressions - a.impressions || a.query.localeCompare(b.query))
      .slice(0, MAX_MARKET_QUERY_ROWS);
    return record;
  });
}

function compareMarketWindows(allRows, currentWindowId, previousWindowId) {
  const current = new Map(rowsToMarketRecords(allRows, currentWindowId).map((record) => [record.marketId, record]));
  const previous = new Map(rowsToMarketRecords(allRows, previousWindowId).map((record) => [record.marketId, record]));
  const ids = new Set([...current.keys(), ...previous.keys()]);
  const comparisons = {};

  ids.forEach((marketId) => {
    const currentRecord = current.get(marketId) || { impressions: 0, clicks: 0, averagePosition: null };
    const previousRecord = previous.get(marketId) || { impressions: 0, clicks: 0, averagePosition: null };
    const impressionChange = percentChange(currentRecord.impressions, previousRecord.impressions);
    const clickChange = percentChange(currentRecord.clicks, previousRecord.clicks);
    comparisons[marketId] = {
      currentImpressions: currentRecord.impressions || 0,
      previousImpressions: previousRecord.impressions || 0,
      impressionChange,
      impressionMomentum: momentumLabel(impressionChange, currentRecord.impressions, previousRecord.impressions),
      currentClicks: currentRecord.clicks || 0,
      previousClicks: previousRecord.clicks || 0,
      clickChange,
      clickMomentum: momentumLabel(clickChange, currentRecord.clicks, previousRecord.clicks),
      currentAveragePosition: currentRecord.averagePosition,
      previousAveragePosition: previousRecord.averagePosition,
      averagePositionChange: currentRecord.averagePosition !== null && currentRecord.averagePosition !== undefined && previousRecord.averagePosition !== null && previousRecord.averagePosition !== undefined && Number.isFinite(Number(currentRecord.averagePosition)) && Number.isFinite(Number(previousRecord.averagePosition))
        ? Number(currentRecord.averagePosition) - Number(previousRecord.averagePosition)
        : null,
      sampleStrength: currentRecord.impressions >= MIN_STRONG_SAMPLE_IMPRESSIONS || previousRecord.impressions >= MIN_STRONG_SAMPLE_IMPRESSIONS ? "usable" : "weak",
    };
  });

  return comparisons;
}

function strategicParentForMarket(marketId) {
  const parent = (strategicPriorities.priorities || []).find((priority) =>
    Array.isArray(priority.supportingMarketIds) && priority.supportingMarketIds.includes(marketId)
  );
  return parent ? { marketId: parent.marketId, marketName: parent.marketName } : null;
}

function buildPropertyTypeOpportunities(rows, windowId = "last_28_complete_days") {
  const grouped = new Map();
  rows
    .filter((row) => row.windowId === windowId && row.marketId && row.propertyType)
    .forEach((row) => {
      const id = `${row.marketId}:${row.propertyType}`;
      if (!grouped.has(id)) {
        grouped.set(id, {
          id,
          marketId: row.marketId,
          marketKey: row.marketKey,
          legacyMarketId: row.legacyMarketId || row.marketId,
          marketName: row.marketName,
          state: row.state,
          propertyType: row.propertyType,
          impressions: 0,
          clicks: 0,
          rows: [],
        });
      }
      const record = grouped.get(id);
      record.impressions += row.impressions;
      record.clicks += row.clicks;
      record.rows.push(row);
    });

  return Array.from(grouped.values()).map((record) => ({
    ...record,
    averagePosition: weightedAveragePosition(record.rows),
    queryCount: record.rows.length,
    topQueries: record.rows
      .slice()
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10)
      .map((row) => ({
        query: row.query,
        page: row.page,
        impressions: row.impressions,
        clicks: row.clicks,
        position: row.position,
        intents: row.intents,
      })),
  })).sort((a, b) => b.impressions - a.impressions || a.id.localeCompare(b.id));
}

function buildNormalizedSnapshot({ rows, windows, source, siteUrl, status }) {
  const primaryWindow = windows.find((window) => window.primary) || windows[0];
  const sevenDayByMarket = compareMarketWindows(rows, "last_7_complete_days", "previous_7_complete_days");
  const twentyEightDayByMarket = compareMarketWindows(rows, "last_28_complete_days", "previous_28_complete_days");
  const records = rowsToMarketRecords(rows, primaryWindow.id).map((record) => ({
    ...record,
    momentum: {
      sevenDay: sevenDayByMarket[record.marketId] || null,
      twentyEightDay: twentyEightDayByMarket[record.marketId] || null,
    },
    strategicParent: strategicParentForMarket(record.legacyMarketId || record.marketId),
    source: "search_intelligence",
  }));
  const current7 = windows.find((window) => window.id === "last_7_complete_days");
  const previous7 = windows.find((window) => window.id === "previous_7_complete_days");
  const current28 = windows.find((window) => window.id === "last_28_complete_days");
  const previous28 = windows.find((window) => window.id === "previous_28_complete_days");

  return {
    schemaVersion: "normalized-search-console-opportunity-v2",
    generatedAt: new Date().toISOString(),
    source,
    siteUrl,
    status,
    grain: "date-page-query",
    identityPolicy: {
      version: "state-safe-market-identity-v1",
      primaryEvidence: "canonical_rofo_ranking_url",
      marketKeyFormat: "STATE:normalized-city-slug",
      compatibility: "Non-colliding markets preserve legacy marketId; colliding markets use the state-qualified marketKey as marketId.",
    },
    thresholdPolicy: {
      rawRowsRetained: true,
      maxMarketQueryRows: MAX_MARKET_QUERY_ROWS,
      maxRawRows: MAX_RAW_ROWS,
      displayMinimumImpressions: MIN_DISPLAY_IMPRESSIONS,
      strongSampleMinimumImpressions: MIN_STRONG_SAMPLE_IMPRESSIONS,
      note: "Low-impression rows are retained in raw observations. Display and momentum labels use aggregate impressions to avoid overreacting to tiny samples.",
    },
    sourceDateRange: `${primaryWindow.startDate}:${primaryWindow.endDate}`,
    windows,
    records,
    comparisons: {
      sevenDayByMarket: current7 && previous7 ? sevenDayByMarket : {},
      twentyEightDayByMarket: current28 && previous28 ? twentyEightDayByMarket : {},
    },
    propertyTypeOpportunities: buildPropertyTypeOpportunities(rows, primaryWindow.id),
    rawObservationSummary: {
      rowCount: rows.length,
      retainedRawRows: Math.min(rows.length, MAX_RAW_ROWS),
    },
    rawRows: rows
      .slice()
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, MAX_RAW_ROWS),
  };
}

function manualRowsFromFallback() {
  const records = normalizeSearchConsoleRecords(fallbackSnapshot);
  return records.flatMap((record) => {
    const identity = searchMarketIdentity({ state: record.state, marketId: record.marketId, marketName: record.marketName });
    return (record.queries || []).map((query, index) => ({
    windowId: "last_28_complete_days",
    dateRange: fallbackSnapshot.dateRange || "manual",
    date: null,
    page: query.page || "",
    sourcePage: query.page || "",
    query: query.query,
    clicks: numberOrZero(query.clicks || (index === 0 ? record.clicks : 0)),
    impressions: numberOrZero(query.impressions || (index === 0 ? record.impressions : 0)),
    ctr: null,
    position: numberOrNull(query.position) !== null ? numberOrNull(query.position) : (index === 0 ? numberOrNull(record.averagePosition) : null),
    entity: { entityType: "manual_observation" },
    marketId: identity.marketId,
    marketKey: identity.marketKey,
    legacyMarketId: identity.legacyMarketId,
    marketName: record.marketName,
    state: record.state,
    propertyType: query.propertyType || null,
    districtId: null,
    buildingId: null,
    archetypeId: null,
    intents: query.intents || classifyQuery(query.query),
    occupierRelevance: query.occupierRelevance || classifyOccupierRelevance(query.intents || classifyQuery(query.query)),
    }));
  });
}

async function fetchLiveRows({ client, windows, rowLimit = DEFAULT_ROW_LIMIT }) {
  const rows = [];
  for (const window of windows.filter((item) => !item.optional)) {
    const responseRows = await client.queryWindow({
      startDate: window.startDate,
      endDate: window.endDate,
      dimensions: ["date", "page", "query"],
      rowLimit,
    });
    responseRows.forEach((row) => {
      rows.push(normalizeGscRow(row, window));
    });
  }
  return rows;
}

function readPreviousSnapshot(outputPath) {
  if (!fs.existsSync(outputPath)) return null;
  return JSON.parse(fs.readFileSync(outputPath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

async function syncSearchConsole(options = {}) {
  const outputPath = options.outputPath || path.join(process.cwd(), "data", "generated", "search-console-opportunity.json");
  const historyPath = options.historyPath || path.join(process.cwd(), "data", "generated", "search-intelligence-history.json");
  const windows = options.windows || completeDayWindows(options.now || new Date());
  const liveEnabled = options.live === true || process.env.GSC_ENABLE_LIVE === "true";
  const siteUrl = options.siteUrl || process.env.GSC_SITE_URL || "https://www.rofo.com/";
  const previous = readPreviousSnapshot(outputPath);

  let rows = [];
  let source = "manual Search Console opportunity snapshot";
  let status = {
    mode: "manual",
    ok: true,
    lastSuccessAt: previous && previous.status ? previous.status.lastSuccessAt || null : null,
    failure: null,
  };

  if (liveEnabled) {
    try {
      const client = options.client || clientFromEnv(process.env, options.fetchImpl);
      rows = await fetchLiveRows({ client, windows, rowLimit: options.rowLimit || DEFAULT_ROW_LIMIT });
      source = "Google Search Console Search Analytics API";
      status = {
        mode: "live",
        ok: true,
        lastSuccessAt: new Date().toISOString(),
        failure: null,
      };
    } catch (error) {
      if (previous) {
        const stale = {
          ...previous,
          status: {
            ...(previous.status || {}),
            ok: false,
            stale: true,
            failure: error.message,
            failedAt: new Date().toISOString(),
          },
        };
        writeJson(outputPath, stale);
        return { output: stale, staleFallback: true, error };
      }
      throw error;
    }
  } else {
    rows = manualRowsFromFallback();
  }

  const output = buildNormalizedSnapshot({ rows, windows, source, siteUrl, status });
  const history = {
    schemaVersion: "search-intelligence-history-v1",
    updatedAt: output.generatedAt,
    latestSnapshot: {
      generatedAt: output.generatedAt,
      source,
      siteUrl,
      status,
      windows,
      marketCount: output.records.length,
      rawRowCount: rows.length,
    },
    recentSnapshots: [
      {
        generatedAt: output.generatedAt,
        source,
        siteUrl,
        status,
        windows,
        marketCount: output.records.length,
        rawRowCount: rows.length,
      },
      ...((readPreviousSnapshot(historyPath) || {}).recentSnapshots || []).slice(0, 11),
    ],
  };

  writeJson(outputPath, output);
  writeJson(historyPath, history);
  return { output, staleFallback: false, error: null };
}

module.exports = {
  DEFAULT_ROW_LIMIT,
  MIN_DISPLAY_IMPRESSIONS,
  MIN_STRONG_SAMPLE_IMPRESSIONS,
  MAX_MARKET_QUERY_ROWS,
  MAX_RAW_ROWS,
  completeDayWindows,
  normalizeGscRow,
  rowsToMarketRecords,
  compareMarketWindows,
  buildPropertyTypeOpportunities,
  buildNormalizedSnapshot,
  syncSearchConsole,
};
