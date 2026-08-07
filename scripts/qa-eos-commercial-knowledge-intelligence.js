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

  const publisherOppMarkets = new Set((intelligence.publisherOpportunities || []).map((item) => item.marketId));
  assert(publisherOppMarkets.has("salinas"), "Publisher opportunity preparation should include Salinas.");
  assert(!publisherOppMarkets.has("indianapolis") || normalized.find((record) => record.marketId === "indianapolis").queries.some((query) => query.occupierRelevance !== "low_future"), "Investor demand should not alone create occupier Publisher work.");

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
