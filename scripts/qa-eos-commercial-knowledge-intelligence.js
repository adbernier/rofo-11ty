const fs = require("fs");
const path = require("path");
const {
  classifyQuery,
  classifyOccupierRelevance,
  normalizeSearchConsoleRecords,
  buildCommercialKnowledgeIntelligence,
} = require("../lib/eos/commercial-knowledge-intelligence");
const searchConsoleSnapshot = require("../_data/searchConsoleOpportunitySnapshot");
const strategicPriorities = require("../_data/commercialKnowledgeStrategicPriorities");
const marketSnapshots = require("../_data/commercialKnowledgeMarketSnapshots");

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function includesAll(values, expected) {
  return expected.every((value) => values.includes(value));
}

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function run() {
  const retailLease = classifyQuery("gainesville retail space for lease");
  assert(includesAll(retailLease, ["retail", "lease-availability"]), "Retail lease query should classify as retail and lease / availability.");
  assert(classifyOccupierRelevance(retailLease) === "high", "Retail lease query should have high occupier relevance.");

  const warehouseLease = classifyQuery("fort wayne warehouses for lease");
  assert(includesAll(warehouseLease, ["warehouse", "lease-availability"]), "Warehouse lease query should classify as warehouse and lease / availability.");

  const investor = classifyQuery("indianapolis cap rates and investment analysis");
  assert(includesAll(investor, ["investor"]), "Investor query should classify as investor.");
  assert(classifyOccupierRelevance(investor) === "low_future", "Investor query should be separated as low / future relevance.");

  const address = classifyQuery("1200 17th st denver office");
  assert(address.includes("building-address"), "Address query should classify as building / address.");

  const normalized = normalizeSearchConsoleRecords(searchConsoleSnapshot);
  assert(normalized.length >= 8, "Manual Search Console snapshot should normalize observed markets.");
  assert(normalized.every((record) => Array.isArray(record.queries)), "Normalized records should include classified queries.");

  const intelligence = buildCommercialKnowledgeIntelligence({ generatedAt: "2026-08-07T00:00:00.000Z" });
  const strategicMarkets = new Set((intelligence.strategicRoadmap || []).map((market) => market.marketId));
  ["san-francisco", "denver", "orange-county", "los-angeles", "seattle"].forEach((marketId) => {
    assert(strategicMarkets.has(marketId), `Strategic roadmap should include ${marketId}.`);
  });

  const opportunityMarkets = new Set(((intelligence.googleOpportunity || {}).markets || []).map((market) => market.marketId));
  ["salinas", "fort-wayne", "gainesville", "san-rafael", "houston"].forEach((marketId) => {
    assert(opportunityMarkets.has(marketId), `Google opportunity output should include ${marketId}.`);
  });

  const salinas = ((intelligence.googleOpportunity || {}).markets || []).find((market) => market.marketId === "salinas");
  assert(salinas && salinas.googleOpportunity === "high", "Salinas should surface as a high Google opportunity from the manual metric example.");
  assert(salinas && salinas.knowledgeGaps.includes("retail-depth"), "Salinas should show retail-depth as a knowledge gap.");
  assert(salinas && salinas.provenance && salinas.provenance.source, "Search-led market opportunities should include provenance.");

  const sourceSnapshot = (intelligence.googleOpportunity || {}).sourceSnapshot || {};
  assert(sourceSnapshot.schemaVersion === "normalized-search-console-opportunity-v2", "EOS intelligence should consume the Phase 2A normalized Search Intelligence artifact.");
  assert(sourceSnapshot.grain === "date-page-query", "EOS intelligence should preserve the page/query/date Search Intelligence grain.");
  assert(sourceSnapshot.status && sourceSnapshot.status.mode, "EOS intelligence should expose Search Intelligence source status.");
  assert(sourceSnapshot.thresholdPolicy && sourceSnapshot.thresholdPolicy.rawRowsRetained === true, "EOS intelligence should expose Search Intelligence threshold policy.");
  assert(Array.isArray((intelligence.googleOpportunity || {}).propertyTypeOpportunities), "EOS intelligence should expose property-type Search Intelligence opportunities.");

  const publisherOppMarkets = new Set((intelligence.publisherOpportunities || []).map((item) => item.marketId));
  assert(publisherOppMarkets.has("salinas"), "Publisher opportunity preparation should include Salinas.");
  const salinasPublisherOpportunity = (intelligence.publisherOpportunities || []).find((item) => item.marketId === "salinas");
  assert(salinasPublisherOpportunity && salinasPublisherOpportunity.evidence && salinasPublisherOpportunity.targetEntity, "Publisher opportunities should include evidence and target entity metadata.");
  assert(salinasPublisherOpportunity && salinasPublisherOpportunity.source === "search_intelligence", "Search-led Publisher opportunities should identify Search Intelligence as the source.");
  assert(!publisherOppMarkets.has("indianapolis") || normalized.find((record) => record.marketId === "indianapolis").queries.some((query) => query.occupierRelevance !== "low_future"), "Investor demand should not alone create occupier Publisher work.");

  const metricPendingIntelligence = buildCommercialKnowledgeIntelligence({
    generatedAt: "2026-08-07T00:00:00.000Z",
    searchConsoleSnapshot: {
      schemaVersion: "normalized-search-console-opportunity-v2",
      records: [
        {
          marketId: "metric-pending",
          marketName: "Metric Pending",
          state: "CA",
          impressions: 0,
          averagePosition: null,
          queries: [{ query: "metric pending retail space", impressions: 0, position: null }],
        },
      ],
    },
  });
  const metricPendingMarket = ((metricPendingIntelligence.googleOpportunity || {}).markets || [])[0];
  assert(metricPendingMarket && metricPendingMarket.positionBand === "metric_pending", "Markets without average position should not be treated as near-term opportunities.");

  const orangeCounty = (intelligence.strategicRoadmap || []).find((market) => market.marketId === "orange-county");
  assert(orangeCounty && Array.isArray(orangeCounty.supportingSearchMarkets), "Strategic markets should expose supporting child-market search signals.");
  assert(orangeCounty.supportingSearchMarkets.some((market) => market.marketId === "aliso-viejo"), "Orange County should show Aliso Viejo as a supporting search market.");

  assert((intelligence.emergingThemes || []).some((theme) => theme.id === "retail"), "Emerging themes should include retail.");
  assert((intelligence.emergingThemes || []).some((theme) => theme.id === "warehouse"), "Emerging themes should include warehouse.");

  const investorOnlyIntelligence = buildCommercialKnowledgeIntelligence({
    generatedAt: "2026-08-07T00:00:00.000Z",
    searchConsoleSnapshot: {
      schemaVersion: "search-console-opportunity-snapshot-v1",
      records: [
        {
          marketId: "investor-test",
          marketName: "Investor Test",
          state: "CA",
          topQueries: [
            { query: "investor test cap rates", impressions: 20, clicks: 0, position: 18 },
            { query: "investor test investment analysis", impressions: 10, clicks: 0, position: 22 },
          ],
        },
      ],
    },
  });
  assert((investorOnlyIntelligence.investorFutureSignals || []).some((market) => market.marketId === "investor-test"), "Investor signals should remain visible separately.");
  assert(!(investorOnlyIntelligence.publisherOpportunities || []).some((market) => market.marketId === "investor-test"), "Investor-only demand should not create occupier Publisher opportunities.");

  const missionFixture = {
    schemaVersion: "normalized-search-console-opportunity-v2",
    source: "Google Search Console Search Analytics API",
    sourceDateRange: "2026-07-10:2026-08-06",
    generatedAt: "2026-08-07T00:00:00.000Z",
    status: { mode: "live", ok: true },
    grain: "date-page-query",
    thresholdPolicy: { rawRowsRetained: true },
    records: [
      {
        marketId: "salinas",
        marketName: "Salinas",
        state: "CA",
        impressions: 272,
        clicks: 6,
        averagePosition: 13.8,
        source: "search_intelligence",
        momentum: { twentyEightDay: { impressionMomentum: "up" } },
        queries: [
          { query: "salinas retail space for lease", impressions: 160, clicks: 4, position: 12.2 },
          { query: "commercial salinas ca", impressions: 80, clicks: 1, position: 14.5 },
          { query: "salinas industrial space", impressions: 32, clicks: 1, position: 19.8 },
        ],
      },
      {
        marketId: "gainesville",
        marketName: "Gainesville",
        state: "FL",
        impressions: 130,
        clicks: 2,
        averagePosition: 24.1,
        source: "search_intelligence",
        momentum: { twentyEightDay: { impressionMomentum: "up" } },
        queries: [
          { query: "gainesville retail storefront for rent", impressions: 70, clicks: 1, position: 21.5 },
          { query: "gainesville warehouse for lease", impressions: 60, clicks: 1, position: 27.3 },
        ],
      },
      {
        marketId: "fort-wayne",
        marketName: "Fort Wayne",
        state: "IN",
        impressions: 120,
        clicks: 1,
        averagePosition: 32,
        source: "search_intelligence",
        momentum: { twentyEightDay: { impressionMomentum: "stable" } },
        queries: [
          { query: "fort wayne warehouses for lease", impressions: 75, clicks: 1, position: 30 },
          { query: "fort wayne retail space", impressions: 45, clicks: 0, position: 35 },
        ],
      },
      {
        marketId: "aliso-viejo",
        marketName: "Aliso Viejo",
        state: "CA",
        impressions: 210,
        clicks: 9,
        averagePosition: 8.5,
        source: "search_intelligence",
        strategicParent: { marketId: "orange-county", marketName: "Orange County" },
        momentum: { twentyEightDay: { impressionMomentum: "up" } },
        queries: [
          { query: "aliso viejo commercial real estate cap rates", impressions: 130, clicks: 6, position: 7.8 },
          { query: "aliso viejo market analysis", impressions: 80, clicks: 3, position: 9.7 },
        ],
      },
      {
        marketId: "houston",
        marketName: "Houston",
        state: "TX",
        impressions: 300,
        clicks: 1,
        averagePosition: 51,
        source: "search_intelligence",
        momentum: { twentyEightDay: { impressionMomentum: "stable" } },
        queries: [
          { query: "commercial real estate houston", impressions: 300, clicks: 1, position: 51 },
        ],
      },
    ],
  };
  const missionIntelligence = buildCommercialKnowledgeIntelligence({
    generatedAt: "2026-08-07T00:00:00.000Z",
    searchConsoleSnapshot: missionFixture,
  });
  const retailTopic = (missionIntelligence.topicIntelligence || []).find((topic) => topic.id === "retail");
  assert(retailTopic && retailTopic.marketCount >= 3, "Topic-first intelligence should aggregate retail demand across markets.");
  assert(retailTopic && retailTopic.occupierRelevance === "high", "Retail topic should be high occupier relevance.");

  const retailMission = (missionIntelligence.searchMissions || []).find((mission) => mission.id === "expand-retail-knowledge");
  assert(retailMission, "Search Missions should include Expand Retail Knowledge.");
  assert(retailMission && ["high", "medium"].includes(retailMission.confidence), "Retail mission should include transparent confidence.");
  assert(retailMission && retailMission.supportingMarkets.some((market) => market.marketId === "salinas"), "Retail mission should include supporting market evidence.");
  assert(retailMission && retailMission.knowledgeGaps.includes("retail-depth"), "Retail mission should map demand to retail knowledge gaps.");

  const warehouseMission = (missionIntelligence.searchMissions || []).find((mission) => mission.id === "expand-warehouse-industrial-knowledge");
  assert(warehouseMission, "Search Missions should include Warehouse / Industrial knowledge when supported.");

  const orangeCountyMission = (missionIntelligence.searchMissions || []).find((mission) => mission.id === "accelerate-orange-county");
  assert(orangeCountyMission && orangeCountyMission.supportingMarkets.some((market) => market.marketId === "aliso-viejo"), "Strategic parent support should preserve Aliso Viejo evidence for Orange County.");

  const houstonMissionIndex = (missionIntelligence.searchMissions || []).findIndex((mission) =>
    (mission.supportingMarkets || []).some((market) => market.marketId === "houston")
  );
  const salinasMissionIndex = (missionIntelligence.searchMissions || []).findIndex((mission) =>
    (mission.supportingMarkets || []).some((market) => market.marketId === "salinas")
  );
  assert(houstonMissionIndex === -1 || salinasMissionIndex === -1 || salinasMissionIndex < houstonMissionIndex, "Houston-like discovery demand should not outrank stronger near-page-one occupier evidence without strategic reason.");

  assert((missionIntelligence.investorFutureSignals || []).some((market) => market.marketId === "aliso-viejo"), "Investor-heavy Aliso Viejo demand should remain visible as future intelligence.");
  assert(!(missionIntelligence.publisherOpportunities || []).some((item) => item.marketId === "aliso-viejo"), "Investor-heavy Aliso Viejo should not automatically create an occupier market Publisher opportunity.");
  assert((missionIntelligence.publisherOpportunities || []).some((item) => item.type === "search_mission" && item.source === "search_intelligence"), "Search Missions should create advisory Publisher mission payloads.");

  Object.entries(marketSnapshots).forEach(([key, snapshot]) => {
    assert(snapshot.commercialCharacter, `${key} should include commercial character.`);
    assert(snapshot.propertyTypeContext && snapshot.propertyTypeContext.office, `${key} should include office context.`);
    assert(Array.isArray(snapshot.sourceTrace) && snapshot.sourceTrace.length, `${key} should include source trace.`);
  });

  ["CA/san-francisco", "CO/denver"].forEach((key) => {
    assert(Boolean(marketSnapshots[key]), `${key} should have an occupier Market Snapshot.`);
  });

  const forbiddenPublicTerms = [/cap rate/i, /investment return/i, /\bIRR\b/i];
  const publicSnapshotText = JSON.stringify(marketSnapshots);
  forbiddenPublicTerms.forEach((pattern) => {
    assert(!pattern.test(publicSnapshotText), `Market Snapshot public data should not include investor metric term ${pattern}.`);
  });

  const cityTemplate = readIfExists(path.join(process.cwd(), "city.njk"));
  assert(cityTemplate.includes("commercialKnowledgeSnapshot"), "City template should render the Commercial Knowledge Market Snapshot.");
  assert(cityTemplate.includes("city-knowledge-snapshot"), "City template should include the Market Snapshot presentation shell.");

  const generatedEosPath = path.join(process.cwd(), "data", "generated", "eos-analysis.json");
  if (fs.existsSync(generatedEosPath)) {
    const generatedEos = JSON.parse(fs.readFileSync(generatedEosPath, "utf8"));
    const generatedIntelligence = generatedEos.commercialKnowledgeIntelligence;
    assert(Boolean(generatedIntelligence), "Generated EOS should include Commercial Knowledge Intelligence.");
    if (generatedIntelligence) {
      assert(Array.isArray(generatedIntelligence.strategicRoadmap), "Generated EOS intelligence should include strategic roadmap.");
      assert(Array.isArray(generatedIntelligence.publisherOpportunities), "Generated EOS intelligence should include Publisher opportunity preparation.");
    }
  }

  const priorityIds = new Set(strategicPriorities.priorities.map((priority) => priority.marketId));
  assert(priorityIds.size === strategicPriorities.priorities.length, "Strategic priority market IDs should be unique.");
  assert(strategicPriorities.priorities.every((priority) => Number.isFinite(Number(priority.score))), "Strategic priorities should include explicit editor-controlled scores.");

  if (errors.length) {
    console.error("EOS Commercial Knowledge Intelligence QA failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log("EOS Commercial Knowledge Intelligence QA passed.");
  console.log(`Validated ${normalized.length} Search Console market records.`);
  console.log(`Strategic markets: ${strategicPriorities.priorities.map((priority) => priority.marketName).join(", ")}`);
  console.log(`Top Google opportunities: ${((intelligence.googleOpportunity || {}).markets || []).slice(0, 5).map((market) => market.marketName).join(", ")}`);
}

if (require.main === module) {
  run();
}

module.exports = { run };
