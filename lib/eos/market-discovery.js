const commercialMarketDiscovery = require("../../_data/commercialMarketDiscovery");

const DISCOVERY_SCHEMA_VERSION = "commercial-market-discovery-v1";
const DISCOVERY_SERVICE_SCHEMA_VERSION = "commercial-market-discovery-service-v1";
const VALID_EVIDENCE_STRENGTHS = new Set(["STRONG", "SUPPORTED", "EMERGING", "DISCOVERY_ONLY"]);
const VALID_COMPARISON_STATES = new Set(["COVERED", "PARTIAL", "MISSING", "CONFLICT", "RESEARCH_MORE"]);
const COMPARISON_ORDER = ["COVERED", "PARTIAL", "MISSING", "CONFLICT", "RESEARCH_MORE"];

function normalizeCount(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function countByComparison(findings = []) {
  const counts = {
    covered: 0,
    partial: 0,
    missing: 0,
    conflict: 0,
    researchMore: 0,
  };
  for (const finding of findings) {
    const state = finding && finding.canonicalComparison ? finding.canonicalComparison.state : "";
    if (state === "COVERED") counts.covered += 1;
    if (state === "PARTIAL") counts.partial += 1;
    if (state === "MISSING") counts.missing += 1;
    if (state === "CONFLICT") counts.conflict += 1;
    if (state === "RESEARCH_MORE") counts.researchMore += 1;
  }
  counts.totalFindings = findings.length;
  return counts;
}

function compareCounts(expected = {}, actual = {}) {
  return [
    ["totalFindings", "totalFindings"],
    ["covered", "covered"],
    ["partial", "partial"],
    ["missing", "missing"],
    ["conflict", "conflict"],
    ["researchMore", "researchMore"],
  ].filter(([left, right]) => normalizeCount(expected[left]) !== normalizeCount(actual[right]))
    .map(([left, right]) => `${left}:${expected[left]}!=${actual[right]}`);
}

function compactFinding(finding = {}) {
  return {
    id: finding.id,
    ecosystemId: finding.ecosystemId,
    ecosystemLabel: finding.ecosystemLabel,
    geographyName: finding.geographyName,
    geographyType: finding.geographyType,
    evidenceStrength: finding.evidenceStrength,
    comparisonState: finding.canonicalComparison ? finding.canonicalComparison.state : "",
    summary: finding.summary,
    gapCount: (finding.candidateImplementationGaps || []).length,
  };
}

function summarizeRecord(record = {}) {
  const findings = Array.isArray(record.findings) ? record.findings : [];
  const counts = countByComparison(findings);
  const sourceTierCounts = (record.sources || []).reduce((acc, source) => {
    const tier = source.tier || "unknown";
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});
  const strongestFindings = findings
    .filter((finding) => finding.evidenceStrength === "STRONG" && finding.canonicalComparison && finding.canonicalComparison.state !== "COVERED")
    .slice(0, 6)
    .map(compactFinding);
  const materialGaps = (((record.gapAnalysis || {}).prioritizedCandidateGaps) || []).slice(0, 8).map((gap) => ({
    id: gap.id,
    label: gap.label,
    comparisonState: gap.comparisonState,
    implementationType: gap.implementationType,
    priority: gap.priority,
  }));
  return {
    marketId: record.marketId,
    marketName: record.marketName,
    schemaVersion: record.schemaVersion,
    discoveryVersion: record.discoveryVersion,
    researchedAt: record.researchedAt,
    researchStatus: record.researchStatus,
    sourceCount: (record.sources || []).length,
    sourceTierCounts,
    counts,
    strongestFindings,
    materialGaps,
    nonPromotionNotice: record.nonPromotionNotice,
  };
}

function validateRecord(record = {}) {
  const errors = [];
  if (record.schemaVersion !== DISCOVERY_SCHEMA_VERSION) errors.push(`${record.marketId || "unknown"} uses invalid schemaVersion.`);
  if (!record.discoveryVersion || !record.marketId || !record.marketName || !record.researchedAt) {
    errors.push(`${record.marketId || "unknown"} is missing discovery identity fields.`);
  }
  if (!record.sourceStandard || !record.evidenceStrengthModel || !record.canonicalComparisonModel) {
    errors.push(`${record.marketId || "unknown"} is missing source/evidence/comparison models.`);
  }
  if (!Array.isArray(record.sources) || !record.sources.length) errors.push(`${record.marketId || "unknown"} has no source provenance.`);
  if (!Array.isArray(record.findings) || !record.findings.length) errors.push(`${record.marketId || "unknown"} has no discovery findings.`);
  const sourceIds = new Set((record.sources || []).map((source) => source.id));
  for (const source of record.sources || []) {
    if (!source.id || !source.tier || !source.title || !source.publisher || !source.url || !source.accessedAt) {
      errors.push(`${record.marketId}: source provenance is incomplete.`);
    }
    if (!["tier1", "tier2", "tier3"].includes(source.tier)) errors.push(`${record.marketId}: invalid source tier ${source.tier}.`);
  }
  for (const finding of record.findings || []) {
    if (!finding.id || !finding.ecosystemId || !finding.findingType || !finding.geographyName || !finding.summary) {
      errors.push(`${record.marketId}: finding is missing required identity fields.`);
    }
    if (!VALID_EVIDENCE_STRENGTHS.has(finding.evidenceStrength)) {
      errors.push(`${record.marketId}: ${finding.id} has invalid evidence strength ${finding.evidenceStrength}.`);
    }
    const comparison = finding.canonicalComparison || {};
    if (!VALID_COMPARISON_STATES.has(comparison.state)) {
      errors.push(`${record.marketId}: ${finding.id} has invalid canonical comparison ${comparison.state}.`);
    }
    if (!comparison.rationale) errors.push(`${record.marketId}: ${finding.id} must explain canonical comparison.`);
    if (!Array.isArray(finding.sourceIds) || !finding.sourceIds.length) errors.push(`${record.marketId}: ${finding.id} has no source references.`);
    for (const sourceId of finding.sourceIds || []) {
      if (!sourceIds.has(sourceId)) errors.push(`${record.marketId}: ${finding.id} references unknown source ${sourceId}.`);
    }
  }
  const expectedCounts = ((record.gapAnalysis || {}).counts) || {};
  const actualCounts = countByComparison(record.findings || []);
  const countMismatches = compareCounts(expectedCounts, actualCounts);
  if (countMismatches.length) errors.push(`${record.marketId}: gap-analysis counts do not match findings (${countMismatches.join(", ")}).`);
  return errors;
}

function validateDiscoveryRegistry(registry = commercialMarketDiscovery) {
  const errors = [];
  if (registry.schemaVersion !== "commercial-market-discovery-registry-v1") {
    errors.push("Commercial Market Discovery registry has an invalid schema version.");
  }
  if (!Array.isArray(registry.records) || !registry.records.length) {
    errors.push("Commercial Market Discovery registry must include records.");
  }
  const marketIds = new Set();
  for (const record of registry.records || []) {
    if (marketIds.has(record.marketId)) errors.push(`Duplicate Market Discovery record for ${record.marketId}.`);
    marketIds.add(record.marketId);
    errors.push(...validateRecord(record));
  }
  return errors;
}

function buildMarketDiscoveryService(options = {}) {
  const records = commercialMarketDiscovery.records || [];
  const validationErrors = validateDiscoveryRegistry(commercialMarketDiscovery);
  const markets = records.map(summarizeRecord);
  const byMarket = Object.fromEntries(markets.map((market) => [market.marketId, market]));
  return {
    schemaVersion: DISCOVERY_SERVICE_SCHEMA_VERSION,
    service: "Commercial Market Discovery",
    owner: "EOS",
    displayedBy: "Mission Control",
    status: validationErrors.length ? "Needs Attention" : "Validated",
    validationStatus: validationErrors.length ? "FAIL" : "PASS",
    latestValidation: options.generatedAt || "",
    markets,
    byMarket,
    summary: {
      researchedMarkets: markets.length,
      supportedFindings: markets.reduce((total, market) => total + normalizeCount(market.counts.totalFindings), 0),
      covered: markets.reduce((total, market) => total + normalizeCount(market.counts.covered), 0),
      partial: markets.reduce((total, market) => total + normalizeCount(market.counts.partial), 0),
      missing: markets.reduce((total, market) => total + normalizeCount(market.counts.missing), 0),
      conflict: markets.reduce((total, market) => total + normalizeCount(market.counts.conflict), 0),
      researchMore: markets.reduce((total, market) => total + normalizeCount(market.counts.researchMore), 0),
    },
    comparisonStates: COMPARISON_ORDER,
    scoringImpact: "None. Discovery is research and gap analysis only; canonical knowledge and Publisher scoring are unchanged.",
    planningImpact: "Market Projection surfaces compact discovery status and candidate gaps for later approved implementation missions.",
    errors: validationErrors,
  };
}

function marketDiscoveryProgress(marketDiscoveryService, marketId) {
  const discovery = marketDiscoveryService && marketDiscoveryService.byMarket
    ? marketDiscoveryService.byMarket[marketId]
    : null;
  if (!discovery) {
    return {
      unit: "Research",
      completed: 0,
      target: 1,
      label: "Not researched",
      statusLabel: "Not Researched",
      currentConstraint: "External commercial-market discovery has not been run for this market.",
      sourceEvidence: ["Commercial Market Discovery registry."],
    };
  }
  const current = discovery.researchStatus === "current";
  const counts = discovery.counts || {};
  return {
    unit: "Findings",
    completed: normalizeCount(counts.covered) + normalizeCount(counts.partial) + normalizeCount(counts.missing),
    target: normalizeCount(counts.totalFindings),
    label: `${normalizeCount(counts.totalFindings)} findings; ${normalizeCount(counts.missing)} missing, ${normalizeCount(counts.partial)} partial`,
    statusLabel: current ? "Research Current" : "Research Incomplete",
    currentConstraint: `${normalizeCount(counts.missing)} missing and ${normalizeCount(counts.partial)} partial discovery findings require later canonical review before implementation.`,
    sourceEvidence: ["Commercial Market Discovery artifact.", "Discovery vs canonical gap analysis."],
    researchedAt: discovery.researchedAt,
    discoveryVersion: discovery.discoveryVersion,
    summary: {
      sourceCount: discovery.sourceCount,
      covered: normalizeCount(counts.covered),
      partial: normalizeCount(counts.partial),
      missing: normalizeCount(counts.missing),
      conflict: normalizeCount(counts.conflict),
      researchMore: normalizeCount(counts.researchMore),
      strongestFindings: discovery.strongestFindings,
      materialGaps: discovery.materialGaps,
    },
  };
}

module.exports = {
  VALID_EVIDENCE_STRENGTHS,
  VALID_COMPARISON_STATES,
  validateDiscoveryRegistry,
  buildMarketDiscoveryService,
  marketDiscoveryProgress,
};
