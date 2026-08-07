const fs = require("fs");
const path = require("path");
const os = require("os");
const {
  createJwtAssertion,
  querySearchAnalytics,
} = require("../lib/search-intelligence/google-search-console-client");
const {
  completeDayWindows,
  normalizeGscRow,
  rowsToMarketRecords,
  compareMarketWindows,
  buildNormalizedSnapshot,
  syncSearchConsole,
} = require("../lib/search-intelligence/search-console-sync");
const { mapRofoUrlToEntity } = require("../lib/search-intelligence/url-entity-mapper");
const {
  classifyQuery,
  classifyOccupierRelevance,
} = require("../lib/eos/commercial-knowledge-intelligence");

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "rofo-search-intelligence-"));
}

async function run() {
  const windows = completeDayWindows(new Date("2026-08-07T12:00:00.000Z"));
  assert(windows.find((window) => window.id === "last_7_complete_days").endDate === "2026-08-06", "Windows should end on the last complete day.");
  assert(windows.find((window) => window.id === "last_28_complete_days").startDate === "2026-07-10", "Last 28 complete days should be calculated deterministically.");

  const broadCommercial = classifyQuery("commercial tampa fl");
  assert(broadCommercial.includes("general-commercial"), "Broad commercial queries should classify as general-commercial.");
  assert(classifyOccupierRelevance(broadCommercial) === "medium", "Broad commercial queries should have medium occupier relevance.");

  const commercialLease = classifyQuery("commercial rental space in tampa");
  assert(commercialLease.includes("general-commercial") && commercialLease.includes("lease-availability"), "Commercial rental queries should classify as general-commercial and lease / availability.");
  assert(classifyOccupierRelevance(commercialLease) === "high", "Commercial rental queries should be high relevance because they include availability intent.");

  const brokerQuery = classifyQuery("commercial real estate agent tampa");
  assert(brokerQuery.includes("brokerage"), "Brokerage query should classify as brokerage.");
  assert(classifyOccupierRelevance(brokerQuery) === "low_future", "Brokerage searches should remain low/future when no concrete occupier signal exists.");

  const cityEntity = mapRofoUrlToEntity("https://www.rofo.com/commercial-real-estate/CA/san-francisco/");
  assert(cityEntity.entityType === "market" && cityEntity.marketId === "san-francisco", "City URL should map to market entity.");

  const officeEntity = mapRofoUrlToEntity("https://www.rofo.com/commercial-real-estate/CA/san-francisco/office-space/");
  assert(officeEntity.entityType === "property_type" && officeEntity.propertyType === "office", "Office Space URL should map to property-type entity.");

  const briefEntity = mapRofoUrlToEntity("https://www.rofo.com/commercial-real-estate/CA/san-francisco/office-space/technology-companies/");
  assert(briefEntity.entityType === "business_brief" && briefEntity.archetypeSlug === "technology-companies", "Business Brief URL should map to archetype entity.");

  const districtEntity = mapRofoUrlToEntity("https://www.rofo.com/commercial-real-estate/CA/san-francisco/mission-bay/");
  assert(districtEntity.entityType === "district" && districtEntity.districtId === "mission-bay", "District URL should map to district entity.");

  const buildingEntity = mapRofoUrlToEntity("https://www.rofo.com/commercial-real-estate/building/CO/denver/100-fillmore-place/");
  assert(buildingEntity.entityType === "building" && buildingEntity.marketId === "denver", "Building URL should map to building entity.");

  const row = normalizeGscRow({
    keys: ["2026-08-01", "https://www.rofo.com/commercial-real-estate/CA/salinas/", "salinas retail space for lease"],
    clicks: 3,
    impressions: 42,
    ctr: 0.0714,
    position: 15.3,
  }, { id: "last_28_complete_days", startDate: "2026-07-10", endDate: "2026-08-06" });
  assert(row.date === "2026-08-01", "GSC row should preserve date.");
  assert(row.page === "/commercial-real-estate/CA/salinas/", "GSC row should preserve normalized page.");
  assert(row.query === "salinas retail space for lease", "GSC row should preserve query.");
  assert(row.intents.includes("retail") && row.intents.includes("lease-availability"), "GSC row should classify query intent.");
  assert(row.occupierRelevance === "high", "Retail lease row should be high occupier relevance.");

  const investorRow = normalizeGscRow({
    keys: ["2026-08-01", "https://www.rofo.com/commercial-real-estate/CA/aliso-viejo/", "aliso viejo commercial real estate cap rates"],
    clicks: 1,
    impressions: 30,
    ctr: 0.033,
    position: 22,
  }, { id: "last_28_complete_days", startDate: "2026-07-10", endDate: "2026-08-06" });
  assert(investorRow.intents.includes("investor"), "Investor query should classify as investor.");
  assert(investorRow.occupierRelevance === "low_future", "Investor query should be quarantined as future/low relevance.");

  const currentRows = [
    row,
    { ...row, query: "salinas industrial space", intents: ["industrial"], occupierRelevance: "high", impressions: 58, clicks: 2, position: 17 },
    { ...row, windowId: "previous_28_complete_days", impressions: 40, clicks: 1, position: 20 },
  ];
  const records = rowsToMarketRecords(currentRows, "last_28_complete_days");
  const salinas = records.find((record) => record.marketId === "salinas");
  assert(salinas && salinas.impressions === 100, "Market aggregation should sum impressions.");
  assert(salinas && salinas.topQueries.length === 2, "Market aggregation should preserve page/query grain in top queries.");

  const comparison = compareMarketWindows(currentRows, "last_28_complete_days", "previous_28_complete_days").salinas;
  assert(comparison.impressionMomentum === "up", "Momentum should identify meaningful growth.");
  assert(comparison.sampleStrength === "usable", "Momentum should mark sufficiently large samples as usable.");

  const weakComparison = compareMarketWindows([
    { ...row, impressions: 4, windowId: "last_28_complete_days" },
    { ...row, impressions: 2, windowId: "previous_28_complete_days" },
  ], "last_28_complete_days", "previous_28_complete_days").salinas;
  assert(weakComparison.impressionMomentum === "weak_sample", "Tiny samples should not be overstated as trends.");

  const snapshot = buildNormalizedSnapshot({
    rows: currentRows,
    windows,
    source: "Google Search Console Search Analytics API",
    siteUrl: "https://www.rofo.com/",
    status: { mode: "live", ok: true, lastSuccessAt: "2026-08-07T00:00:00.000Z" },
  });
  assert(snapshot.schemaVersion === "normalized-search-console-opportunity-v2", "Search Intelligence output should use v2 normalized schema.");
  assert(snapshot.grain === "date-page-query", "Search Intelligence output should declare page/query/date grain.");
  assert(snapshot.records[0].momentum.twentyEightDay.impressionMomentum === "up", "Records should include 28-day momentum.");
  assert(snapshot.rawRows.length <= 500, "Generated raw rows should be bounded.");

  const privateKey = [
    "-----BEGIN PRIVATE KEY-----",
    "MIIEvQIBADANBgkqhkiG9w0BAQEFAASC",
    "-----END PRIVATE KEY-----",
  ].join("\n");
  try {
    createJwtAssertion({ clientEmail: "test@example.iam.gserviceaccount.com", privateKey });
  } catch (error) {
    assert(error.message.includes("DECODER") || error.message.includes("unsupported") || error.message.includes("bad"), "Invalid private key should fail inside signing without exposing key contents.");
    assert(!error.message.includes("MIIEvQIB"), "Errors must not emit credential material.");
  }

  let requestedBody = null;
  await querySearchAnalytics({
    siteUrl: "https://www.rofo.com/",
    accessToken: "token",
    startDate: "2026-07-10",
    endDate: "2026-08-06",
  }, async (url, options) => {
    requestedBody = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({ rows: [] }),
    };
  });
  assert(requestedBody.dimensions.join(",") === "date,page,query", "GSC query should request only date, page, query dimensions by default.");

  const dir = tempDir();
  const outputPath = path.join(dir, "search-console-opportunity.json");
  const historyPath = path.join(dir, "search-intelligence-history.json");
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));
  const staleResult = await syncSearchConsole({
    live: true,
    outputPath,
    historyPath,
    client: {
      async queryWindow() {
        throw new Error("mock GSC unavailable");
      },
    },
    windows,
  });
  assert(staleResult.staleFallback === true, "Live sync failure should preserve stale data when available.");
  const staleOutput = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  assert(staleOutput.status.stale === true, "Stale fallback should mark generated data stale.");
  assert(staleOutput.status.failure === "mock GSC unavailable", "Stale fallback should record failure reason.");

  if (errors.length) {
    console.error("Search Intelligence QA failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log("Search Intelligence QA passed.");
  console.log("Validated GSC normalization, URL mapping, momentum, stale fallback, and credential isolation.");
}

run().catch((error) => {
  console.error(`Search Intelligence QA failed: ${error.stack || error.message}`);
  process.exit(1);
});
