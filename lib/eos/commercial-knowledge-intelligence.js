const fs = require("fs");
const path = require("path");
const strategicPriorities = require("../../_data/commercialKnowledgeStrategicPriorities");
const searchConsoleSnapshot = require("../../_data/searchConsoleOpportunitySnapshot");
const marketSnapshots = require("../../_data/commercialKnowledgeMarketSnapshots");
const businessBriefs = require("../../_data/businessBriefs");
const buildingPages = require("../../_data/buildingPages");
const locationKnowledgeGraph = require("../../_data/locationKnowledgeGraph");

const BUSINESS_BRIEF_RECORDS = Array.isArray(businessBriefs) ? businessBriefs : businessBriefs.briefs || [];
const BUILDING_RECORDS = Array.isArray(buildingPages) ? buildingPages : buildingPages.buildings || [];

const INTENT_RULES = [
  { id: "retail", label: "Retail", terms: ["retail", "storefront", "shop", "store", "restaurant", "bar", "convenience store"] },
  { id: "office", label: "Office", terms: ["office", "offices", "office space", "office building", "professional building"] },
  { id: "warehouse", label: "Warehouse", terms: ["warehouse", "warehouses", "distribution", "cold storage"] },
  { id: "industrial", label: "Industrial", terms: ["industrial", "manufacturing", "logistics"] },
  { id: "flex", label: "Flex", terms: ["flex", "live work", "live/work"] },
  { id: "medical", label: "Medical", terms: ["medical", "clinic", "healthcare"] },
  { id: "coworking", label: "Coworking", terms: ["coworking", "co-working", "shared office"] },
  { id: "lease-availability", label: "Lease / Availability", terms: ["lease", "leasing", "for lease", "rent", "rental", "for rent", "availability", "available"] },
  { id: "sale", label: "Sale", terms: ["for sale", "sale", "buy"] },
  { id: "business-type", label: "Business Type", terms: ["law firm", "nonprofit", "technology company", "restaurant", "medical practice"] },
  { id: "market-intelligence", label: "Market Intelligence", terms: ["trends", "market analysis", "market data", "lease rates", "pricing"] },
  { id: "investor", label: "Investor", terms: ["cap rate", "cap rates", "investment", "yield", "returns", "sale price per square foot", "price per square foot", "irr"] },
  { id: "brokerage", label: "Broker / Brokerage", terms: ["broker", "brokerage", "commercial real estate agent", "realtor", "agent"] },
  { id: "general-commercial", label: "General Commercial Real Estate", terms: ["commercial real estate", "commercial property", "commercial space", "commercial building", "commercial buildings", "commercial rental", "commercial rent", "business space", "business property", "commercial"] },
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

  const buildings = Array.isArray(options.buildings) ? options.buildings : [];
  buildings.forEach((building) => {
    const buildingName = normalizeText(building);
    if (buildingName && buildingName.length >= 6 && normalized.includes(buildingName)) {
      intents.add("building-address");
    }
  });

  if (!intents.size) {
    intents.add("unknown");
  }

  return Array.from(intents);
}

function classifyOccupierRelevance(intents) {
  const labels = new Set(Array.isArray(intents) ? intents : []);
  const concreteOccupierSignals = [
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
  ];
  const highSignals = [
    ...concreteOccupierSignals,
  ];

  if ((labels.has("investor") || labels.has("brokerage")) && !concreteOccupierSignals.some((signal) => labels.has(signal))) {
    return "low_future";
  }

  if (highSignals.some((signal) => labels.has(signal))) {
    return "high";
  }

  if (labels.has("investor") || labels.has("brokerage")) {
    return "low_future";
  }

  if (labels.has("general-commercial") || labels.has("market-intelligence") || labels.has("sale")) {
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
  const numbers = values.filter((value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value))).map(Number);
  if (!numbers.length) return null;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function sum(values) {
  const numbers = values.filter((value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value))).map(Number);
  if (!numbers.length) return null;
  return numbers.reduce((total, value) => total + value, 0);
}

function loadGeneratedSearchConsoleSnapshot() {
  const generatedPath = path.join(process.cwd(), "data", "generated", "search-console-opportunity.json");
  if (!fs.existsSync(generatedPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(generatedPath, "utf8"));
  } catch (error) {
    return null;
  }
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

function weightedAverage(items, valueKey = "position", weightKey = "impressions") {
  const weighted = (items || []).filter((item) =>
    item && item[valueKey] !== null && item[valueKey] !== undefined && item[valueKey] !== "" &&
    Number.isFinite(Number(item[valueKey])) && Number(item[weightKey]) > 0
  );
  const totalWeight = weighted.reduce((total, item) => total + Number(item[weightKey]), 0);
  if (!totalWeight) return null;
  return weighted.reduce((total, item) => total + (Number(item[valueKey]) * Number(item[weightKey])), 0) / totalWeight;
}

function positionBand(position) {
  if (position === null || position === undefined || position === "") return "metric_pending";
  const value = Number(position);
  if (!Number.isFinite(value)) return "metric_pending";
  if (value <= 20) return "near_term";
  if (value <= 40) return "emerging";
  return "discovery";
}

function isSearchIntelligenceSource(source) {
  return source === "search_intelligence" || source === "Google Search Console Search Analytics API";
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

function knowledgeGapsForTheme(themeId, supportingMarkets) {
  const gaps = new Set();
  const marketGaps = supportingMarkets.flatMap((market) => market.knowledgeGaps || []);

  if (themeId === "retail") gaps.add("retail-depth");
  if (themeId === "warehouse" || themeId === "industrial") gaps.add("industrial-warehouse-depth");
  if (themeId === "office") gaps.add("office-business-guides");
  if (themeId === "building-address") gaps.add("representative-buildings");
  if (themeId === "district-neighborhood") gaps.add("district-coverage");
  if (themeId === "business-type") gaps.add("business-guides");

  marketGaps.forEach((gap) => gaps.add(gap));
  return Array.from(gaps).slice(0, 6);
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
  const buildings = BUILDING_RECORDS
    .map((building) => building.name)
    .filter(Boolean);

  return (snapshot.records || []).map((record) => {
    const sourceQueries = record.queries || record.topQueries || [];
    const queries = sourceQueries.map((query) => {
      const intents = Array.isArray(query.intents) && query.intents.length
        ? query.intents
        : classifyQuery(query.query, { districts, buildings });
      return {
        ...query,
        intents,
        occupierRelevance: query.occupierRelevance || classifyOccupierRelevance(intents),
      };
    });
    const aggregateImpressions = record.impressions !== null && record.impressions !== undefined && record.impressions !== "" && Number.isFinite(Number(record.impressions))
      ? Number(record.impressions)
      : sum(queries.map((query) => query.impressions));
    const aggregateClicks = record.clicks !== null && record.clicks !== undefined && record.clicks !== "" && Number.isFinite(Number(record.clicks))
      ? Number(record.clicks)
      : sum(queries.map((query) => query.clicks));
    const aggregatePosition = record.averagePosition !== null && record.averagePosition !== undefined && record.averagePosition !== "" && Number.isFinite(Number(record.averagePosition))
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
      source: record.source || snapshot.source || null,
      strategicParent: record.strategicParent || null,
      momentum: record.momentum || null,
      entityBreakdown: record.entityBreakdown || null,
      propertyTypeDemand: record.propertyTypeDemand || null,
      queries,
      queryThemes: record.queryThemes || intentCounts(queries),
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
    highOccupierQueryCount: occupierQueries.filter((query) => query.occupierRelevance === "high").length,
    dominantThemes,
    investorFutureQueryCount: investorQueries.length,
    momentum: record.momentum || null,
    strategicParent: record.strategicParent || null,
    propertyTypeDemand: record.propertyTypeDemand || null,
    entityBreakdown: record.entityBreakdown || null,
    knowledgeCoverage: coverage,
    knowledgeGaps: gaps,
    recommendedActions: recommendedActions(record, gaps, dominantThemes),
    rationale,
    provenance: {
      source: record.source || "manual Search Console opportunity snapshot",
      dateRange: record.dateRange || null,
      grain: record.page ? "page-query" : "market-query",
    },
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

function buildTopicIntelligence(records, marketOpportunities) {
  const marketById = new Map(marketOpportunities.map((market) => [market.marketId, market]));
  const topicMap = new Map();

  records.forEach((record) => {
    const market = marketById.get(record.marketId);
    (record.queries || []).forEach((query) => {
      const intents = (query.intents || []).filter((intent) => intent !== "unknown");
      intents.forEach((intent) => {
        if (!topicMap.has(intent)) {
          topicMap.set(intent, {
            id: intent,
            label: labelForIntent(intent),
            impressions: 0,
            clicks: 0,
            queryCount: 0,
            rows: [],
            marketMap: new Map(),
            relevanceCounts: { high: 0, medium: 0, low_future: 0, unknown: 0 },
          });
        }
        const topic = topicMap.get(intent);
        const impressions = Number(query.impressions) || 0;
        const clicks = Number(query.clicks) || 0;
        topic.impressions += impressions;
        topic.clicks += clicks;
        topic.queryCount += 1;
        topic.rows.push(query);
        topic.relevanceCounts[query.occupierRelevance || "unknown"] = (topic.relevanceCounts[query.occupierRelevance || "unknown"] || 0) + 1;

        if (record.marketId) {
          if (!topic.marketMap.has(record.marketId)) {
            topic.marketMap.set(record.marketId, {
              marketId: record.marketId,
              marketName: record.marketName,
              state: record.state,
              impressions: 0,
              clicks: 0,
              averagePosition: null,
              rows: [],
              googleOpportunity: market ? market.googleOpportunity : null,
              momentum: market ? market.momentum : null,
              strategicParent: market ? market.strategicParent : null,
              knowledgeGaps: market ? market.knowledgeGaps : [],
              occupierDemandShare: market ? market.occupierDemandShare : null,
            });
          }
          const topicMarket = topic.marketMap.get(record.marketId);
          topicMarket.impressions += impressions;
          topicMarket.clicks += clicks;
          topicMarket.rows.push(query);
        }
      });
    });
  });

  return Array.from(topicMap.values()).map((topic) => {
    const strongestMarkets = Array.from(topic.marketMap.values()).map((market) => ({
      ...market,
      averagePosition: weightedAverage(market.rows),
      rows: undefined,
    })).sort((a, b) =>
      (Number(b.impressions) || 0) - (Number(a.impressions) || 0) ||
      (Number(a.averagePosition) || 999) - (Number(b.averagePosition) || 999) ||
      a.marketName.localeCompare(b.marketName)
    );
    const occupierRelevantCount = (topic.relevanceCounts.high || 0) + (topic.relevanceCounts.medium || 0);
    const occupierRelevance = topic.relevanceCounts.high >= topic.relevanceCounts.medium && topic.relevanceCounts.high > 0
      ? "high"
      : topic.relevanceCounts.medium > 0
        ? "medium"
        : topic.relevanceCounts.low_future > 0
          ? "low_future"
          : "unknown";

    return {
      id: topic.id,
      label: topic.label,
      impressions: topic.impressions,
      clicks: topic.clicks,
      averagePosition: weightedAverage(topic.rows),
      queryCount: topic.queryCount,
      marketCount: strongestMarkets.length,
      strongestMarkets: strongestMarkets.slice(0, 8),
      occupierRelevance,
      occupierDemandShare: topic.queryCount ? occupierRelevantCount / topic.queryCount : 0,
      knowledgeGaps: knowledgeGapsForTheme(topic.id, strongestMarkets),
      opportunityGap: topic.impressions >= 100 && strongestMarkets.some((market) => (market.knowledgeGaps || []).length)
        ? "meaningful-demand-with-coverage-gaps"
        : strongestMarkets.some((market) => (market.knowledgeGaps || []).length)
          ? "coverage-gap-visible"
          : "coverage-developed-or-demand-thin",
      momentum: summarizeTopicMomentum(strongestMarkets),
    };
  }).sort((a, b) =>
    relevanceOrder(b.occupierRelevance) - relevanceOrder(a.occupierRelevance) ||
    (Number(b.impressions) || 0) - (Number(a.impressions) || 0) ||
    b.marketCount - a.marketCount ||
    a.label.localeCompare(b.label)
  );
}

function relevanceOrder(value) {
  return { high: 3, medium: 2, low_future: 1, unknown: 0 }[value] || 0;
}

function summarizeTopicMomentum(markets) {
  const usable = (markets || [])
    .map((market) => market.momentum && market.momentum.twentyEightDay ? market.momentum.twentyEightDay.impressionMomentum : null)
    .filter((value) => value && value !== "weak_sample" && value !== "not_comparable");
  if (!usable.length) return "not_comparable";
  const up = usable.filter((value) => value === "up").length;
  const down = usable.filter((value) => value === "down").length;
  if (up > down) return "up";
  if (down > up) return "down";
  return "stable";
}

function missionConfidence({ impressions, averagePosition, supportingMarkets, occupierRelevance, knowledgeGaps }) {
  let points = 0;
  if ((Number(impressions) || 0) >= 250) points += 2;
  else if ((Number(impressions) || 0) >= 75) points += 1;
  if (Number.isFinite(Number(averagePosition)) && Number(averagePosition) <= 20) points += 2;
  else if (Number.isFinite(Number(averagePosition)) && Number(averagePosition) <= 40) points += 1;
  if ((supportingMarkets || []).length >= 3) points += 2;
  else if ((supportingMarkets || []).length >= 2) points += 1;
  if (occupierRelevance === "high") points += 2;
  else if (occupierRelevance === "medium") points += 1;
  if ((knowledgeGaps || []).length) points += 1;
  if (points >= 7) return "high";
  if (points >= 4) return "medium";
  return "low";
}

function missionScore(mission) {
  const confidenceScore = { high: 300, medium: 180, low: 80 }[mission.confidence] || 0;
  const positionScore = Number.isFinite(Number(mission.averagePosition)) ? Math.max(0, 80 - Number(mission.averagePosition)) : 0;
  const strategicScore = mission.strategicAlignment ? 60 : 0;
  const momentumScore = mission.momentum === "up" ? 30 : mission.momentum === "down" ? -20 : 0;
  return confidenceScore + strategicScore + momentumScore + Math.min(120, Number(mission.impressions) || 0) + positionScore;
}

function topMarketEvidence(markets, count = 4) {
  return (markets || []).slice(0, count).map((market) => ({
    marketId: market.marketId,
    marketName: market.marketName,
    state: market.state,
    impressions: market.impressions,
    averagePosition: market.averagePosition,
    googleOpportunity: market.googleOpportunity,
    momentum: market.momentum && market.momentum.twentyEightDay ? market.momentum.twentyEightDay.impressionMomentum : null,
    strategicParent: market.strategicParent || null,
  }));
}

function missionFromTopic(topic, config) {
  const supportingMarkets = (topic.strongestMarkets || [])
    .filter((market) => topic.occupierRelevance !== "low_future" || market.googleOpportunity !== "future_signal")
    .slice(0, 5);
  const knowledgeGaps = knowledgeGapsForTheme(topic.id, supportingMarkets);
  const confidence = missionConfidence({
    impressions: topic.impressions,
    averagePosition: topic.averagePosition,
    supportingMarkets,
    occupierRelevance: topic.occupierRelevance,
    knowledgeGaps,
  });
  const title = config.title || `Deepen ${topic.label} Knowledge`;
  const mission = {
    id: config.id,
    type: config.type,
    title,
    confidence,
    impressions: topic.impressions,
    clicks: topic.clicks,
    averagePosition: topic.averagePosition,
    momentum: topic.momentum,
    occupierRelevance: topic.occupierRelevance,
    supportingMarkets: topMarketEvidence(supportingMarkets),
    evidence: [
      `${topic.label} appears across ${topic.marketCount} market${topic.marketCount === 1 ? "" : "s"} with ${Math.round(Number(topic.impressions) || 0)} impressions.`,
      Number.isFinite(Number(topic.averagePosition)) ? `Average position is ${Number(topic.averagePosition).toFixed(1)}.` : "Average position is pending for this topic.",
      `Occupier relevance is ${topic.occupierRelevance}.`,
    ],
    knowledgeGaps,
    recommendedActions: config.recommendedActions || [`Review ${topic.label.toLowerCase()} coverage across the supporting markets.`],
    whyNow: config.whyNow || `${topic.label} demand is visible across markets while coverage gaps remain.`,
    source: "search_intelligence",
  };
  mission.score = missionScore(mission);
  return mission;
}

function buildSearchMissions({ topics, marketOpportunities, strategic }) {
  const topicById = new Map((topics || []).map((topic) => [topic.id, topic]));
  const missions = [];

  const propertyTypeConfigs = [
    { id: "expand-retail-knowledge", theme: "retail", title: "Expand Retail Knowledge", type: "property_type", recommendedActions: ["Prioritize Retail Space hub evidence where demand is strongest.", "Identify representative retail districts and buildings before publishing new retail pages."] },
    { id: "expand-warehouse-industrial-knowledge", theme: "warehouse", alternateTheme: "industrial", title: "Expand Warehouse / Industrial Knowledge", type: "property_type", recommendedActions: ["Review warehouse and industrial coverage in supporting markets.", "Close representative building and district evidence gaps before publishing."] },
    { id: "deepen-office-knowledge", theme: "office", title: "Deepen Office Knowledge", type: "property_type", recommendedActions: ["Compare office demand with current Office Space and Business Brief readiness.", "Deepen representative office-building evidence where search demand is strongest."] },
    { id: "expand-flex-knowledge", theme: "flex", title: "Expand Flex Knowledge", type: "property_type", recommendedActions: ["Review whether flex demand is strong enough to justify a dedicated knowledge sprint."] },
    { id: "expand-medical-knowledge", theme: "medical", title: "Expand Medical Office Knowledge", type: "property_type", recommendedActions: ["Separate office-oriented healthcare demand from clinical or lab claims before publishing."] },
  ];

  propertyTypeConfigs.forEach((config) => {
    const topic = topicById.get(config.theme);
    const alternate = config.alternateTheme ? topicById.get(config.alternateTheme) : null;
    if (!topic && !alternate) return;
    const combined = alternate && topic
      ? {
        ...topic,
        id: config.theme,
        label: "Warehouse / Industrial",
        impressions: (Number(topic.impressions) || 0) + (Number(alternate.impressions) || 0),
        clicks: (Number(topic.clicks) || 0) + (Number(alternate.clicks) || 0),
        averagePosition: weightedAverage([topic, alternate], "averagePosition"),
        marketCount: new Set([...(topic.strongestMarkets || []), ...(alternate.strongestMarkets || [])].map((market) => market.marketId)).size,
        strongestMarkets: [...(topic.strongestMarkets || []), ...(alternate.strongestMarkets || [])]
          .sort((a, b) => (Number(b.impressions) || 0) - (Number(a.impressions) || 0))
          .filter((market, index, array) => array.findIndex((candidate) => candidate.marketId === market.marketId) === index),
        momentum: summarizeTopicMomentum([...(topic.strongestMarkets || []), ...(alternate.strongestMarkets || [])]),
        knowledgeGaps: Array.from(new Set([...(topic.knowledgeGaps || []), ...(alternate.knowledgeGaps || [])])),
      }
      : (topic || alternate);
    if ((Number(combined.impressions) || 0) < 25 && combined.marketCount < 2) return;
    missions.push(missionFromTopic(combined, config));
  });

  [
    { id: "deepen-building-intelligence", theme: "building-address", title: "Deepen Building Intelligence", type: "building_intelligence", recommendedActions: ["Review canonical building page coverage in markets with building/address demand.", "Prioritize representative building depth and image/content quality where building queries appear."] },
    { id: "deepen-district-intelligence", theme: "district-neighborhood", title: "Deepen District Intelligence", type: "district", recommendedActions: ["Review district coverage and nearby relationships in markets with neighborhood-level demand.", "Close representative-building gaps on district pages before adding new pages."] },
    { id: "expand-business-type-guides", theme: "business-type", title: "Expand Business Type Guides", type: "property_type", recommendedActions: ["Review whether observed business-type demand aligns with reusable archetypes.", "Create only evidence-backed guides; do not auto-publish."] },
  ].forEach((config) => {
    const topic = topicById.get(config.theme);
    if (!topic || ((Number(topic.impressions) || 0) < 15 && topic.marketCount < 2)) return;
    missions.push(missionFromTopic(topic, config));
  });

  (strategic || []).forEach((priority) => {
    const support = (priority.supportingSearchMarkets || []).filter((market) =>
      (Number(market.impressions) || 0) >= 25 || (market.queryThemes || []).length
    );
    if (!support.length) return;
    const mission = {
      id: `accelerate-${priority.marketId}`,
      type: "strategic_alignment",
      title: `Accelerate ${priority.marketName}`,
      confidence: support.length >= 2 || support.some((market) => Number(market.averagePosition) <= 20) ? "medium" : "low",
      impressions: support.reduce((total, market) => total + (Number(market.impressions) || 0), 0),
      clicks: null,
      averagePosition: weightedAverage(support, "averagePosition"),
      momentum: "not_comparable",
      occupierRelevance: "mixed",
      strategicAlignment: {
        marketId: priority.marketId,
        marketName: priority.marketName,
        priority: priority.priority,
        score: priority.score,
      },
      supportingMarkets: support.slice(0, 5),
      evidence: [
        `${priority.marketName} remains an editor-controlled strategic priority.`,
        `Search traction is visible in ${support.map((market) => market.marketName).join(", ")}.`,
      ],
      knowledgeGaps: ["strategic-market-depth"],
      recommendedActions: [`Use supporting search signals to focus the next ${priority.marketName} knowledge sprint.`],
      whyNow: "Strategic priority and observed search demand are reinforcing each other.",
      source: "search_intelligence",
    };
    mission.score = missionScore(mission);
    missions.push(mission);
  });

  const concretePropertyThemes = new Set(["office", "retail", "warehouse", "industrial", "flex", "medical"]);
  const strongestMarket = (marketOpportunities || []).find((market) =>
    market.googleOpportunity === "high" &&
    market.highOccupierQueryCount > 0 &&
    market.occupierDemandShare >= 0.45 &&
    (market.dominantThemes || []).some((theme) => concretePropertyThemes.has(theme.id))
  );
  if (strongestMarket) {
    const themes = (strongestMarket.dominantThemes || [])
      .filter((theme) => !["unknown", "investor", "brokerage"].includes(theme.id))
      .slice(0, 2);
    const mission = {
      id: `expand-${strongestMarket.marketId}-knowledge`,
      type: "market_specific",
      title: `Expand ${strongestMarket.marketName}${themes.length ? ` ${themes.map((theme) => theme.label).join(" / ")}` : ""}`,
      confidence: missionConfidence({
        impressions: strongestMarket.impressions,
        averagePosition: strongestMarket.averagePosition,
        supportingMarkets: [strongestMarket],
        occupierRelevance: strongestMarket.occupierDemandShare >= 0.6 ? "high" : "medium",
        knowledgeGaps: strongestMarket.knowledgeGaps,
      }),
      impressions: strongestMarket.impressions,
      clicks: strongestMarket.clicks,
      averagePosition: strongestMarket.averagePosition,
      momentum: strongestMarket.momentum && strongestMarket.momentum.twentyEightDay ? strongestMarket.momentum.twentyEightDay.impressionMomentum : null,
      occupierRelevance: strongestMarket.occupierDemandShare >= 0.6 ? "high" : "medium",
      supportingMarkets: topMarketEvidence([strongestMarket], 1),
      evidence: strongestMarket.rationale || [],
      knowledgeGaps: strongestMarket.knowledgeGaps,
      recommendedActions: strongestMarket.recommendedActions,
      whyNow: `${strongestMarket.marketName} is a near-term search-led opportunity with visible demand and incomplete knowledge coverage.`,
      source: "search_intelligence",
    };
    mission.score = missionScore(mission);
    missions.push(mission);
  }

  return missions
    .filter((mission) => mission.type !== "property_type" || mission.occupierRelevance !== "low_future")
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 8);
}

function buildCommercialKnowledgeIntelligence(options = {}) {
  const publisherAnalysis = options.publisherAnalysis || (options.publisherSnapshot && options.publisherSnapshot.analysis) || {};
  const sourceSnapshot = options.searchConsoleSnapshot || loadGeneratedSearchConsoleSnapshot() || searchConsoleSnapshot;
  const normalizedRecords = normalizeSearchConsoleRecords(sourceSnapshot);
  const strategic = strategicPriorities.priorities.map((priority) => {
    const coverage = marketCoverage(priority.marketId, publisherAnalysis);
    const supportingSearchMarkets = normalizedRecords
      .filter((record) => Array.isArray(priority.supportingMarketIds) && priority.supportingMarketIds.includes(record.marketId))
      .map((record) => ({
        marketId: record.marketId,
        marketName: record.marketName,
        impressions: record.impressions,
        averagePosition: record.averagePosition,
        queryThemes: (record.queryThemes || []).slice(0, 3),
      }));
    return {
      ...priority,
      knowledgeCoverage: coverage,
      supportingSearchMarkets,
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
  const topicIntelligence = buildTopicIntelligence(normalizedRecords, marketOpportunities);
  const searchMissions = buildSearchMissions({
    topics: topicIntelligence,
    marketOpportunities,
    strategic,
  });

  const investorFutureSignals = marketOpportunities
    .filter((market) => market.investorFutureQueryCount > 0 || market.dominantThemes.some((theme) => theme.id === "investor" || theme.id === "brokerage"))
    .map((market) => ({
      marketId: market.marketId,
      marketName: market.marketName,
      themes: market.dominantThemes.filter((theme) => theme.id === "investor" || theme.id === "brokerage" || theme.id === "market-intelligence"),
      note: "Visible for future intelligence products; not used to create occupier-focused Publisher work.",
    }));

  const marketPublisherOpportunities = marketOpportunities
    .filter((market) => market.highOccupierQueryCount > 0 && market.occupierDemandShare >= 0.45 && market.googleOpportunity !== "future_signal")
    .map((market) => ({
      id: `${market.marketId}:commercial-knowledge`,
      marketId: market.marketId,
      marketName: market.marketName,
      opportunityType: strategic.some((item) => item.marketId === market.marketId)
        ? "strategic-plus-search"
        : market.strategicParent
          ? "strategic-supporting-search"
        : "search-led",
      targetEntity: {
        marketId: market.marketId,
        marketName: market.marketName,
        propertyTypes: Object.keys(market.propertyTypeDemand || {}),
        strategicParent: market.strategicParent || null,
      },
      evidence: {
        impressions: market.impressions,
        clicks: market.clicks,
        averagePosition: market.averagePosition,
        momentum: market.momentum || null,
        dominantThemes: market.dominantThemes,
        provenance: market.provenance,
      },
      knowledgeGaps: market.knowledgeGaps,
      recommendedActions: market.recommendedActions,
      rationale: market.rationale,
      source: isSearchIntelligenceSource(market.provenance.source) ? "search_intelligence" : "Commercial Knowledge Intelligence",
    }));
  const searchMissionPublisherOpportunities = searchMissions.map((mission) => ({
    type: "search_mission",
    missionId: mission.id,
    title: mission.title,
    confidence: mission.confidence,
    supportingMarkets: mission.supportingMarkets,
    evidence: mission.evidence,
    knowledgeGaps: mission.knowledgeGaps,
    recommendedActions: mission.recommendedActions,
    whyNow: mission.whyNow,
    source: "search_intelligence",
  }));
  const publisherOpportunities = [
    ...searchMissionPublisherOpportunities,
    ...marketPublisherOpportunities,
  ];

  return {
    schemaVersion: "eos-commercial-knowledge-intelligence-v1",
    generatedAt: options.generatedAt || new Date().toISOString(),
    sourceSystems: [
      "Editor-controlled strategic priorities",
      sourceSnapshot.source === "Google Search Console Search Analytics API" ? "Google Search Console Search Analytics API" : "Manual/importable Search Console opportunity snapshot",
      "Publisher analysis",
      "Commercial Knowledge System",
    ],
    strategicRoadmap: strategic,
    googleOpportunity: {
      markets: marketOpportunities,
      sourceSnapshot: {
        schemaVersion: sourceSnapshot.schemaVersion,
        dateRange: sourceSnapshot.sourceDateRange || sourceSnapshot.dateRange,
        updatedAt: sourceSnapshot.generatedAt || sourceSnapshot.updatedAt,
        status: sourceSnapshot.status || null,
        grain: sourceSnapshot.grain || "market-query",
        thresholdPolicy: sourceSnapshot.thresholdPolicy || null,
      },
      propertyTypeOpportunities: sourceSnapshot.propertyTypeOpportunities || [],
      comparisons: sourceSnapshot.comparisons || {},
    },
    topicIntelligence,
    searchMissions,
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
