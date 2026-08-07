const strategicPriorities = require("../../_data/commercialKnowledgeStrategicPriorities");
const searchConsoleSnapshot = require("../../_data/searchConsoleOpportunitySnapshot");
const marketSnapshots = require("../../_data/commercialKnowledgeMarketSnapshots");
const businessBriefs = require("../../_data/businessBriefs");
const buildingPages = require("../../_data/buildingPages");
const locationKnowledgeGraph = require("../../_data/locationKnowledgeGraph");

const BUSINESS_BRIEF_RECORDS = Array.isArray(businessBriefs) ? businessBriefs : businessBriefs.briefs || [];
const BUILDING_RECORDS = Array.isArray(buildingPages) ? buildingPages : buildingPages.buildings || [];

const INTENT_RULES = [
  { id: "retail", label: "Retail", terms: ["retail", "storefront", "shop", "store", "restaurant", "convenience store"] },
  { id: "office", label: "Office", terms: ["office", "offices", "office space"] },
  { id: "warehouse", label: "Warehouse", terms: ["warehouse", "warehouses", "distribution", "cold storage"] },
  { id: "industrial", label: "Industrial", terms: ["industrial", "manufacturing", "logistics"] },
  { id: "flex", label: "Flex", terms: ["flex", "live work", "live/work"] },
  { id: "medical", label: "Medical", terms: ["medical", "clinic", "healthcare"] },
  { id: "coworking", label: "Coworking", terms: ["coworking", "co-working", "shared office"] },
  { id: "lease-availability", label: "Lease / Availability", terms: ["lease", "leasing", "for lease", "availability", "available"] },
  { id: "sale", label: "Sale", terms: ["for sale", "sale", "buy"] },
  { id: "business-type", label: "Business Type", terms: ["law firm", "nonprofit", "technology company", "restaurant", "medical practice"] },
  { id: "market-intelligence", label: "Market Intelligence", terms: ["trends", "market analysis", "market data", "lease rates", "pricing"] },
  { id: "investor", label: "Investor", terms: ["cap rate", "cap rates", "investment", "returns", "sale price per square foot", "price per square foot", "irr"] },
  { id: "brokerage", label: "Broker / Brokerage", terms: ["broker", "brokerage", "realtor", "agent"] },
  { id: "general-commercial", label: "General Commercial Real Estate", terms: ["commercial real estate", "commercial property", "commercial space"] },
];

const ADDRESS_PATTERN = /\b\d{2,5}\s+[a-z0-9][a-z0-9\s.-]*(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|way|plaza|pkwy|parkway)\b/i;

function normalizeText(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function classifyQuery(query, options = {}) {
  const normalized = normalizeText(query);
  const intents = new Set();

  INTENT_RULES.forEach((rule) => {
    if (rule.terms.some((term) => normalized.includes(term))) {
      intents.add(rule.id);
    }
  });

  if (ADDRESS_PATTERN.test(normalized)) {
    intents.add("building-address");
  }

  const districts = Array.isArray(options.districts) ? options.districts : [];
  districts.forEach((district) => {
    if (district && normalized.includes(normalizeText(district))) {
      intents.add("district-neighborhood");
    }
  });

  if (!intents.size) {
    intents.add("unknown");
  }

  return Array.from(intents);
}

function classifyOccupierRelevance(intents) {
  const labels = new Set(Array.isArray(intents) ? intents : []);
  const highSignals = [
    "office",
    "retail",
    "warehouse",
    "industrial",
    "flex",
    "medical",
    "coworking",
    "district-neighborhood",
    "building-address",
    "lease-availability",
    "general-commercial",
  ];

  if (highSignals.some((signal) => labels.has(signal))) {
    return "high";
  }

  if (labels.has("investor") || labels.has("brokerage")) {
    return "low_future";
  }

  if (labels.has("market-intelligence") || labels.has("sale")) {
    return "medium";
  }

  return "unknown";
}

function labelForIntent(intent) {
  if (intent === "building-address") return "Building / Address";
  if (intent === "district-neighborhood") return "District / Neighborhood";
  if (intent === "unknown") return "Unknown";
  const rule = INTENT_RULES.find((candidate) => candidate.id === intent);
  return rule ? rule.label : intent;
}

function average(values) {
  const numbers = values.filter((value) => Number.isFinite(Number(value))).map(Number);
  if (!numbers.length) return null;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function sum(values) {
  const numbers = values.filter((value) => Number.isFinite(Number(value))).map(Number);
  if (!numbers.length) return null;
  return numbers.reduce((total, value) => total + value, 0);
}

function intentCounts(queries) {
  const counts = new Map();
  queries.forEach((query) => {
    (query.intents || []).forEach((intent) => {
      counts.set(intent, (counts.get(intent) || 0) + 1);
    });
  });
  return Array.from(counts.entries())
    .map(([id, count]) => ({ id, label: labelForIntent(id), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function positionBand(position) {
  const value = Number(position);
  if (!Number.isFinite(value)) return "metric_pending";
  if (value <= 20) return "near_term";
  if (value <= 40) return "emerging";
  return "discovery";
}

function googleOpportunity(record, occupierDemandShare) {
  const impressions = Number(record.impressions);
  const position = Number(record.averagePosition);

  if (Number.isFinite(impressions) && Number.isFinite(position)) {
    if (impressions >= 200 && position <= 20 && occupierDemandShare >= 0.6) return "high";
    if (impressions >= 75 && position <= 40 && occupierDemandShare >= 0.45) return "medium";
    if (position > 40) return "discovery";
  }

  if (occupierDemandShare >= 0.75) return "theme_signal";
  if (occupierDemandShare >= 0.4) return "mixed_signal";
  return "future_signal";
}

function marketCoverage(marketId, publisherAnalysis) {
  const metros = (publisherAnalysis && publisherAnalysis.metros) || [];
  const metro = metros.find((candidate) => candidate.metroId === marketId || candidate.slug === marketId);
  const marketNode = locationKnowledgeGraph.find((node) => node.type === "city" && node.id === marketId);
  const districtCount = locationKnowledgeGraph.filter((node) => node.type === "district" && node.city === marketId).length;
  const buildingCount = BUILDING_RECORDS.filter((building) => String(building.city_slug || "").toLowerCase() === marketId).length;
  const briefCount = BUSINESS_BRIEF_RECORDS.filter((brief) => {
    const briefMarket = brief.market || {};
    const readiness = brief.publicationState || brief.readiness || brief.publicationStatus || "";
    return (briefMarket.slug === marketId || briefMarket.marketId === marketId) && readiness === "published";
  }).length;
  const hasSnapshot = Object.values(marketSnapshots).some((snapshot) => snapshot.marketId === marketId);

  return {
    publisherScore: metro && Number.isFinite(Number(metro.score)) ? Number(metro.score) : null,
    hasMarketOverview: Boolean(marketNode),
    hasMarketSnapshot: hasSnapshot,
    districtCount,
    representativeBuildingCount: buildingCount,
    publishedBusinessBriefCount: briefCount,
  };
}

function knowledgeGaps(record, coverage, dominantThemes) {
  const gaps = [];
  const themeIds = new Set(dominantThemes.map((theme) => theme.id));

  if (!coverage.hasMarketOverview) gaps.push("market-overview");
  if (!coverage.hasMarketSnapshot) gaps.push("market-snapshot");
  if (coverage.districtCount < 3) gaps.push("district-coverage");
  if (coverage.representativeBuildingCount < 3) gaps.push("representative-buildings");
  if (coverage.publishedBusinessBriefCount < 2) gaps.push("business-guides");
  if (themeIds.has("retail")) gaps.push("retail-depth");
  if (themeIds.has("warehouse") || themeIds.has("industrial")) gaps.push("industrial-warehouse-depth");
  if (themeIds.has("office") && coverage.publishedBusinessBriefCount < 3) gaps.push("office-business-guides");

  return Array.from(new Set(gaps));
}

function recommendedActions(record, gaps, dominantThemes) {
  const actions = [];
  const themeIds = new Set(dominantThemes.map((theme) => theme.id));

  if (gaps.includes("market-snapshot")) actions.push(`Create occupier-focused Market Snapshot for ${record.marketName}.`);
  if (gaps.includes("district-coverage")) actions.push(`Deepen canonical commercial district coverage for ${record.marketName}.`);
  if (gaps.includes("representative-buildings")) actions.push(`Add representative building evidence for ${record.marketName}.`);
  if (themeIds.has("retail")) actions.push("Review whether a Retail Space hub has enough local evidence.");
  if (themeIds.has("warehouse") || themeIds.has("industrial")) actions.push("Review warehouse and industrial knowledge depth before publishing occupier pages.");
  if (themeIds.has("office")) actions.push("Compare office demand with current Office Space and Business Brief readiness.");

  return Array.from(new Set(actions)).slice(0, 4);
}

function normalizeSearchConsoleRecords(snapshot = searchConsoleSnapshot, options = {}) {
  const districts = locationKnowledgeGraph
    .filter((node) => node.type === "district")
    .map((node) => node.name || node.label)
    .filter(Boolean);

  return (snapshot.records || []).map((record) => {
    const queries = (record.topQueries || []).map((query) => {
      const intents = classifyQuery(query.query, { districts });
      return {
        ...query,
        intents,
        occupierRelevance: classifyOccupierRelevance(intents),
      };
    });
    const aggregateImpressions = Number.isFinite(Number(record.impressions))
      ? Number(record.impressions)
      : sum(queries.map((query) => query.impressions));
    const aggregateClicks = Number.isFinite(Number(record.clicks))
      ? Number(record.clicks)
      : sum(queries.map((query) => query.clicks));
    const aggregatePosition = Number.isFinite(Number(record.averagePosition))
      ? Number(record.averagePosition)
      : average(queries.map((query) => query.position));

    return {
      ...record,
      clicks: aggregateClicks,
      impressions: aggregateImpressions,
      averagePosition: aggregatePosition,
      ctr: Number.isFinite(aggregateClicks) && Number.isFinite(aggregateImpressions) && aggregateImpressions > 0
        ? aggregateClicks / aggregateImpressions
        : null,
      dateRange: record.dateRange || snapshot.dateRange || null,
      queries,
      queryThemes: intentCounts(queries),
    };
  });
}

function buildMarketOpportunity(record, publisherAnalysis) {
  const occupierQueries = record.queries.filter((query) => query.occupierRelevance === "high" || query.occupierRelevance === "medium");
  const investorQueries = record.queries.filter((query) => query.occupierRelevance === "low_future");
  const occupierDemandShare = record.queries.length ? occupierQueries.length / record.queries.length : 0;
  const dominantThemes = (record.queryThemes || []).filter((theme) => theme.id !== "unknown").slice(0, 5);
  const coverage = marketCoverage(record.marketId, publisherAnalysis);
  const gaps = knowledgeGaps(record, coverage, dominantThemes);
  const opportunity = googleOpportunity(record, occupierDemandShare);

  const rationale = [
    Number.isFinite(Number(record.impressions)) && Number.isFinite(Number(record.averagePosition))
      ? `${record.marketName} has ${record.impressions} observed impressions at average position ${Number(record.averagePosition).toFixed(1)}.`
      : `${record.marketName} has a manual Search Console theme signal; complete metrics are pending import.`,
    `${Math.round(occupierDemandShare * 100)}% of observed query examples are occupier-relevant or market-context queries.`,
    gaps.length
      ? `Knowledge gaps include ${gaps.slice(0, 3).join(", ")}.`
      : "Existing knowledge coverage appears relatively developed for the observed demand.",
  ];

  return {
    marketId: record.marketId,
    marketName: record.marketName,
    state: record.state,
    impressions: record.impressions,
    clicks: record.clicks,
    averagePosition: record.averagePosition,
    positionBand: positionBand(record.averagePosition),
    googleOpportunity: opportunity,
    occupierDemandShare,
    dominantThemes,
    investorFutureQueryCount: investorQueries.length,
    knowledgeCoverage: coverage,
    knowledgeGaps: gaps,
    recommendedActions: recommendedActions(record, gaps, dominantThemes),
    rationale,
    topQueries: record.queries.slice(0, 6),
  };
}

function buildEmergingThemes(records) {
  const themeMap = new Map();

  records.forEach((record) => {
    (record.queryThemes || []).forEach((theme) => {
      if (theme.id === "unknown") return;
      if (!themeMap.has(theme.id)) {
        themeMap.set(theme.id, {
          id: theme.id,
          label: theme.label,
          marketCount: 0,
          queryCount: 0,
          markets: [],
        });
      }
      const entry = themeMap.get(theme.id);
      entry.marketCount += 1;
      entry.queryCount += theme.count;
      entry.markets.push(record.marketName);
    });
  });

  return Array.from(themeMap.values())
    .sort((a, b) => b.marketCount - a.marketCount || b.queryCount - a.queryCount || a.label.localeCompare(b.label))
    .slice(0, 10);
}

function buildCommercialKnowledgeIntelligence(options = {}) {
  const publisherAnalysis = options.publisherAnalysis || (options.publisherSnapshot && options.publisherSnapshot.analysis) || {};
  const normalizedRecords = normalizeSearchConsoleRecords(options.searchConsoleSnapshot || searchConsoleSnapshot);
  const strategic = strategicPriorities.priorities.map((priority) => {
    const coverage = marketCoverage(priority.marketId, publisherAnalysis);
    return {
      ...priority,
      knowledgeCoverage: coverage,
      nextKnowledgeNeed: coverage.hasMarketSnapshot && coverage.districtCount >= 3
        ? "Deepen high-value property-type and business-archetype coverage."
        : "Complete foundational market snapshot, district, and representative-building coverage.",
    };
  });

  const marketOpportunities = normalizedRecords
    .map((record) => buildMarketOpportunity(record, publisherAnalysis))
    .sort((a, b) => {
      const opportunityOrder = { high: 5, medium: 4, theme_signal: 3, mixed_signal: 2, discovery: 1, future_signal: 0 };
      return (opportunityOrder[b.googleOpportunity] || 0) - (opportunityOrder[a.googleOpportunity] || 0)
        || (Number(b.impressions) || 0) - (Number(a.impressions) || 0)
        || a.marketName.localeCompare(b.marketName);
    });

  const investorFutureSignals = marketOpportunities
    .filter((market) => market.investorFutureQueryCount > 0 || market.dominantThemes.some((theme) => theme.id === "investor" || theme.id === "brokerage"))
    .map((market) => ({
      marketId: market.marketId,
      marketName: market.marketName,
      themes: market.dominantThemes.filter((theme) => theme.id === "investor" || theme.id === "brokerage" || theme.id === "market-intelligence"),
      note: "Visible for future intelligence products; not used to create occupier-focused Publisher work.",
    }));

  const publisherOpportunities = marketOpportunities
    .filter((market) => market.occupierDemandShare >= 0.45 && market.googleOpportunity !== "future_signal")
    .map((market) => ({
      id: `${market.marketId}:commercial-knowledge`,
      marketId: market.marketId,
      marketName: market.marketName,
      opportunityType: strategic.some((item) => item.marketId === market.marketId)
        ? "strategic-plus-search"
        : "search-led",
      recommendedActions: market.recommendedActions,
      rationale: market.rationale,
      source: "Commercial Knowledge Intelligence",
    }));

  return {
    schemaVersion: "eos-commercial-knowledge-intelligence-v1",
    generatedAt: options.generatedAt || new Date().toISOString(),
    sourceSystems: [
      "Editor-controlled strategic priorities",
      "Manual Search Console opportunity snapshot",
      "Publisher analysis",
      "Commercial Knowledge System",
    ],
    strategicRoadmap: strategic,
    googleOpportunity: {
      markets: marketOpportunities,
      sourceSnapshot: {
        schemaVersion: searchConsoleSnapshot.schemaVersion,
        dateRange: searchConsoleSnapshot.dateRange,
        updatedAt: searchConsoleSnapshot.updatedAt,
      },
    },
    emergingThemes: buildEmergingThemes(normalizedRecords),
    investorFutureSignals,
    publisherOpportunities,
    marketSnapshots: Object.values(marketSnapshots),
    principles: [
      "Strategic priority remains explicit and editor-controlled.",
      "Google Search Console is evidence, not strategy.",
      "Investor demand is visible but separated from current occupier publishing work.",
      "Opportunity recommendations must show demand, coverage gaps, and rationale.",
    ],
  };
}

module.exports = {
  INTENT_RULES,
  classifyQuery,
  classifyOccupierRelevance,
  normalizeSearchConsoleRecords,
  buildCommercialKnowledgeIntelligence,
};
