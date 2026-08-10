const MISSION_TABLE_SQL = `
create table if not exists eos_missions (
  id text primary key,
  sequence_number integer not null unique,
  display_id text not null unique,
  source_mission_id text not null,
  source text not null,
  type text not null,
  title text not null,
  objective text not null,
  status text not null check (status in ('active', 'completed')),
  started_at text not null,
  completed_at text,
  confidence text,
  estimated_effort text,
  expected_impact text,
  supporting_markets_json text not null default '[]',
  property_types_json text not null default '[]',
  themes_json text not null default '[]',
  evidence_snapshot_json text not null default '{}',
  knowledge_gap_snapshot_json text not null default '[]',
  work_packet_json text not null default '{}',
  baseline_search_snapshot_json text not null default '{}',
  task_status_json text not null default '{}',
  reporting_token_hash text,
  reporting_token_issued_at text,
  reporting_token_last_used_at text,
  reporting_token_revoked_at text,
  created_at text not null,
  updated_at text not null
);
`;

const MISSION_INDEX_SQL = [
  `create unique index if not exists idx_eos_missions_active_source on eos_missions(source, source_mission_id) where status = 'active'`,
  `create index if not exists idx_eos_missions_status_sequence on eos_missions(status, sequence_number desc)`,
  `create index if not exists idx_eos_missions_source on eos_missions(source, source_mission_id)`,
];

const SEARCH_MISSION_SOURCE = "search_intelligence";
const MARKET_MISSION_PREFIX = "market-foundation";
const SEARCH_MISSION_TRANCHE_SIZE = 4;
export const MISSION_TASK_RESULTS_SCHEMA_VERSION = "mission-task-results-v1";
const MISSION_TASK_RESULTS_START = "MISSION_TASK_RESULTS_V1";
const MISSION_TASK_RESULTS_END = "END_MISSION_TASK_RESULTS_V1";
const TASK_RESULT_STATUSES = new Set(["pending", "complete", "complete_scoped"]);
const TASK_RESULT_OUTCOMES = new Set(["delivered", "researchable_later", "blocked", "no_action_needed"]);
const MAX_EXECUTION_REPORT_LENGTH = 64000;
const MAX_DIRECT_REPORT_JSON_LENGTH = 32000;
const REPORTING_TOKEN_BYTES = 32;

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clean(value) {
  return String(value || "").trim();
}

function randomToken(bytes = REPORTING_TOKEN_BYTES) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return [...array].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value) {
  const data = new TextEncoder().encode(String(value || ""));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a, b) {
  const left = clean(a);
  const right = clean(b);
  if (!left || !right || left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

function unique(values) {
  return Array.from(new Set(values.map(clean).filter(Boolean)));
}

function displayId(sequenceNumber) {
  return `Mission #${String(sequenceNumber).padStart(3, "0")}`;
}

function labelize(value) {
  return clean(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function missionPropertyTypes(mission) {
  const text = `${mission.title || ""} ${mission.type || ""}`.toLowerCase();
  const types = [];
  if (/warehouse|industrial/.test(text)) types.push("Warehouse / Industrial");
  if (/retail/.test(text)) types.push("Retail");
  if (/office/.test(text)) types.push("Office");
  if (/flex/.test(text)) types.push("Flex");
  if (/medical|healthcare/.test(text)) types.push("Medical Office");
  return unique(types);
}

function missionThemes(mission) {
  const themes = [];
  if (mission.type) themes.push(labelize(mission.type));
  if (mission.sourceContext && mission.sourceContext.parentMissionTitle) themes.push(mission.sourceContext.parentMissionTitle);
  for (const gap of asArray(mission.knowledgeGaps)) themes.push(labelize(gap));
  return unique(themes).slice(0, 8);
}

function estimatedEffort(mission) {
  if (mission.estimatedEffort) return mission.estimatedEffort;
  if (mission.type === "market_specific") return "Small";
  if ((mission.supportingMarkets || []).length >= 4) return "Medium";
  return "Small";
}

function expectedImpact(mission) {
  if (mission.expectedImpact) return mission.expectedImpact;
  return mission.confidence === "high" ? "High" : "Medium";
}

function formatMetric(value) {
  return Number.isFinite(Number(value)) ? String(Number(value).toFixed(Number(value) % 1 ? 1 : 0)) : "pending";
}

function parentSearchMissionForMarket(eos, marketId) {
  const missions = asArray((eos.commercialKnowledgeIntelligence || {}).searchMissions);
  return missions.find((mission) =>
    asArray(mission.supportingMarkets).some((market) => market.marketId === marketId)
  ) || null;
}

function marketKey(market) {
  return clean(market && market.marketId);
}

function mergeMarketEvidence(existing, next) {
  const merged = { ...(existing || {}), ...(next || {}) };
  const existingImpressions = Number(existing && existing.impressions);
  const nextImpressions = Number(next && next.impressions);
  if (Number.isFinite(existingImpressions) && Number.isFinite(nextImpressions)) {
    merged.impressions = Math.max(existingImpressions, nextImpressions);
  }
  const existingPosition = Number(existing && existing.averagePosition);
  const nextPosition = Number(next && next.averagePosition);
  if (Number.isFinite(existingPosition) && Number.isFinite(nextPosition)) {
    merged.averagePosition = Math.min(existingPosition, nextPosition);
  }
  merged.knowledgeGaps = unique(asArray(existing && existing.knowledgeGaps).concat(asArray(next && next.knowledgeGaps)));
  return merged;
}

function searchMissionTopicIds(mission) {
  const text = `${mission.title || ""} ${mission.type || ""} ${asArray(mission.knowledgeGaps).join(" ")}`.toLowerCase();
  const ids = [];
  if (/warehouse|industrial/.test(text)) ids.push("industrial", "warehouse");
  if (/retail/.test(text)) ids.push("retail");
  if (/office/.test(text)) ids.push("office");
  if (/flex/.test(text)) ids.push("flex");
  if (/medical|healthcare/.test(text)) ids.push("medical");
  if (/district/.test(text)) ids.push("district-neighborhood");
  if (/building|representative/.test(text)) ids.push("building-address");
  return unique(ids);
}

function expandedSearchMissionSupportingMarkets(mission, eos = {}) {
  const intelligence = eos.commercialKnowledgeIntelligence || {};
  const topics = asArray(intelligence.topicIntelligence || intelligence.emergingThemes);
  const googleMarkets = asArray((intelligence.googleOpportunity || {}).markets);
  const googleMarketById = new Map(googleMarkets.map((market) => [marketKey(market), market]).filter(([id]) => id));
  const topicIds = searchMissionTopicIds(mission);
  const byId = new Map();

  function addMarket(market, sourceRank = 0) {
    const id = marketKey(market);
    if (!id) return;
    const enriched = {
      ...(googleMarketById.get(id) || {}),
      ...market,
      marketId: id,
      _sourceRank: Math.min(sourceRank, Number(market && market._sourceRank) || sourceRank),
    };
    byId.set(id, byId.has(id) ? mergeMarketEvidence(byId.get(id), enriched) : enriched);
  }

  asArray(mission.supportingMarkets).forEach((market, index) => addMarket(market, index));
  topics
    .filter((topic) => topicIds.includes(topic.id))
    .forEach((topic, topicIndex) => {
      asArray(topic.strongestMarkets).forEach((market, marketIndex) => {
        addMarket(market, 100 + (topicIndex * 100) + marketIndex);
      });
    });

  return Array.from(byId.values())
    .filter((market) => {
      const gaps = asArray(market.knowledgeGaps);
      const missionGaps = asArray(mission.knowledgeGaps);
      if (!missionGaps.length || !gaps.length) return true;
      return missionGaps.some((gap) => gaps.includes(gap));
    })
    .sort((a, b) => {
      const impressions = Number(b.impressions || 0) - Number(a.impressions || 0);
      if (impressions) return impressions;
      const aPosition = Number.isFinite(Number(a.averagePosition)) ? Number(a.averagePosition) : 999;
      const bPosition = Number.isFinite(Number(b.averagePosition)) ? Number(b.averagePosition) : 999;
      if (aPosition !== bPosition) return aPosition - bPosition;
      return Number(a._sourceRank || 0) - Number(b._sourceRank || 0);
    })
    .map(({ _sourceRank, ...market }) => market);
}

function primaryMarketPropertyType(market, parentMission = null) {
  const themeIds = new Set(asArray(market.dominantThemes).map((theme) => theme.id));
  const text = `${parentMission ? parentMission.title : ""} ${asArray(market.knowledgeGaps).join(" ")}`.toLowerCase();
  if (/warehouse|industrial/.test(text) || themeIds.has("warehouse") || themeIds.has("industrial")) return "Warehouse / Industrial";
  if (/retail/.test(text) || themeIds.has("retail")) return "Retail";
  if (/office/.test(text) || themeIds.has("office")) return "Office";
  if (/flex/.test(text) || themeIds.has("flex")) return "Flex";
  if (/medical|healthcare/.test(text) || themeIds.has("medical")) return "Medical Office";
  return "Commercial Knowledge";
}

export function marketFoundationMissionId(parentMissionId, marketId) {
  return `${MARKET_MISSION_PREFIX}:${parentMissionId || "market-opportunity"}:${marketId}`;
}

export function parseMarketFoundationMissionId(sourceMissionId) {
  const parts = String(sourceMissionId || "").split(":");
  if (parts[0] !== MARKET_MISSION_PREFIX || parts.length < 3) return null;
  return {
    parentMissionId: parts.slice(1, -1).join(":") || "market-opportunity",
    marketId: parts[parts.length - 1],
  };
}

export function createMarketFoundationMission(eos, sourceMissionId) {
  const parsed = parseMarketFoundationMissionId(sourceMissionId);
  if (!parsed) return null;
  const intelligence = eos.commercialKnowledgeIntelligence || {};
  const market = asArray((intelligence.googleOpportunity || {}).markets).find((item) => item.marketId === parsed.marketId);
  if (!market) return null;
  const explicitParent = asArray(intelligence.searchMissions).find((mission) => mission.id === parsed.parentMissionId);
  const parentMission = explicitParent || parentSearchMissionForMarket(eos, market.marketId);
  const propertyType = primaryMarketPropertyType(market, parentMission);
  const parentLabel = parentMission ? parentMission.title : "Google Opportunity";
  const title = propertyType === "Commercial Knowledge"
    ? `Establish ${market.marketName} Foundation`
    : `Establish ${market.marketName} ${propertyType} Foundation`;
  const evidence = [
    `${market.marketName} has ${formatMetric(market.impressions)} observed impressions at average position ${formatMetric(market.averagePosition)}.`,
    `Dominant themes include ${asArray(market.dominantThemes).slice(0, 3).map((theme) => theme.label).join(", ") || "general commercial demand"}.`,
    `Parent opportunity: ${parentLabel}.`,
  ];
  if (market.strategicParent && market.strategicParent.marketName) {
    evidence.push(`Strategic parent support: ${market.strategicParent.marketName}.`);
  }
  return {
    id: sourceMissionId,
    parentMissionId: parentMission ? parentMission.id : "",
    type: "market_foundation",
    title,
    confidence: market.googleOpportunity === "high" ? "medium" : "low",
    impressions: market.impressions,
    clicks: market.clicks || 0,
    averagePosition: market.averagePosition,
    momentum: market.momentum && market.momentum.twentyEightDay ? market.momentum.twentyEightDay.impressionMomentum : market.momentum || null,
    occupierRelevance: market.occupierDemandShare >= 0.6 ? "high" : "medium",
    supportingMarkets: [{
      marketId: market.marketId,
      marketName: market.marketName,
      state: market.state,
      impressions: market.impressions,
      averagePosition: market.averagePosition,
      googleOpportunity: market.googleOpportunity,
      momentum: market.momentum,
      strategicParent: market.strategicParent || null,
    }],
    evidence,
    knowledgeGaps: asArray(market.knowledgeGaps),
    recommendedActions: asArray(market.recommendedActions),
    whyNow: `${market.marketName} has visible search demand, but foundation work is needed before deeper ${propertyType.toLowerCase()} knowledge can be built responsibly.`,
    source: SEARCH_MISSION_SOURCE,
    sourceContext: {
      parentMissionId: parentMission ? parentMission.id : "",
      parentMissionTitle: parentMission ? parentMission.title : "",
      marketId: market.marketId,
      actionType: "market_foundation",
    },
  };
}

function missionTargetMarketIds(record) {
  const packetMarkets = (((record.workPacket || {}).targets || {}).markets) || record.supportingMarkets || [];
  return asArray(packetMarkets).map((market) => marketKey(market)).filter(Boolean);
}

function recordParentMissionId(record) {
  if (!record) return "";
  const parsed = parseMarketFoundationMissionId(record.sourceMissionId);
  return parsed ? parsed.parentMissionId : clean(record.sourceMissionId);
}

function scopedMarketIdsForParent(parentMissionId, missionRecords, statuses) {
  const allowedStatuses = new Set(statuses);
  const ids = new Set();
  asArray(missionRecords)
    .filter((record) => allowedStatuses.has(record.status))
    .filter((record) => recordParentMissionId(record) === parentMissionId)
    .forEach((record) => missionTargetMarketIds(record).forEach((marketId) => ids.add(marketId)));
  return ids;
}

export function nextSearchMissionExecutionTranche(mission, eos = {}, missionRecords = [], options = {}) {
  const maxMarkets = Number(options.maxMarkets || SEARCH_MISSION_TRANCHE_SIZE);
  const allMarkets = expandedSearchMissionSupportingMarkets(mission, eos);
  const completedMarketIds = scopedMarketIdsForParent(mission.id, missionRecords, ["completed"]);
  const unavailableMarketIds = scopedMarketIdsForParent(mission.id, missionRecords, ["active", "completed"]);
  const remainingMarkets = allMarkets.filter((market) => !completedMarketIds.has(marketKey(market)));
  const executionMarkets = allMarkets
    .filter((market) => !unavailableMarketIds.has(marketKey(market)))
    .slice(0, Math.max(1, maxMarkets));

  return {
    totalSupportingMarkets: allMarkets.length,
    addressedMarketIds: Array.from(completedMarketIds),
    unavailableMarketIds: Array.from(unavailableMarketIds),
    remainingMarkets,
    executionMarkets,
  };
}

export function prepareSearchMissionForExecution(mission, eos = {}, missionRecords = [], options = {}) {
  const tranche = nextSearchMissionExecutionTranche(mission, eos, missionRecords, options);
  if (!tranche.executionMarkets.length) {
    return null;
  }
  return {
    ...mission,
    supportingMarkets: tranche.executionMarkets,
    sourceContext: {
      ...(mission.sourceContext || {}),
      parentMissionId: mission.id,
      parentMissionTitle: mission.title,
      executionTrancheSize: tranche.executionMarkets.length,
      totalSupportingMarkets: tranche.totalSupportingMarkets,
      addressedMarketIds: tranche.addressedMarketIds,
      remainingMarketIds: tranche.remainingMarkets.map((market) => marketKey(market)).filter(Boolean),
    },
  };
}

function gapLabel(gap) {
  const labels = {
    "industrial-warehouse-depth": "Industrial / warehouse depth",
    "retail-depth": "Retail depth",
    "office-depth": "Office depth",
    "market-overview": "Market overview",
    "market-snapshot": "Market Snapshot",
    "district-coverage": "District coverage",
    "business-guides": "Business guides",
    "office-business-guides": "Office business guides",
    "representative-buildings": "Representative buildings",
    "building-intelligence": "Building intelligence",
    "strategic-market-depth": "Strategic market depth",
  };
  return labels[gap] || labelize(gap);
}

function workItem(id, owner, title, details) {
  return { id, owner, status: "pending", title, details };
}

function taskStatusEntry(value) {
  if (!value) return { status: "pending", outcome: "", executionSummary: "", completedAt: "" };
  if (typeof value === "string") return { status: value, outcome: "", executionSummary: "", completedAt: "" };
  if (typeof value === "object") {
    return {
      status: clean(value.status) || "pending",
      outcome: clean(value.outcome),
      executionSummary: clean(value.executionSummary || value.summary),
      completedAt: clean(value.completedAt),
    };
  }
  return { status: "pending", outcome: "", executionSummary: "", completedAt: "" };
}

export function isMissionTaskComplete(value) {
  const entry = taskStatusEntry(value);
  return entry.status === "complete" || entry.status === "complete_scoped";
}

function sanitizeExecutionSummary(value) {
  return clean(value).slice(0, 500);
}

function missionTaskIds(record) {
  return new Set(asArray((record.workPacket || {}).workToComplete).map((task) => task.id).filter(Boolean));
}

function parseMissionTaskResultsBlock(rawReport) {
  const report = String(rawReport || "");
  if (!report.trim()) throw new Error("Paste a Codex execution report before reviewing results.");
  if (report.length > MAX_EXECUTION_REPORT_LENGTH) throw new Error("Execution report is too large to process.");
  const pattern = new RegExp(`${MISSION_TASK_RESULTS_START}\\s*([\\s\\S]*?)\\s*${MISSION_TASK_RESULTS_END}`);
  const match = report.match(pattern);
  if (!match) throw new Error(`Execution report is missing a ${MISSION_TASK_RESULTS_START} block.`);
  let parsed;
  try {
    parsed = JSON.parse(match[1].trim());
  } catch (error) {
    throw new Error(`Invalid ${MISSION_TASK_RESULTS_START} JSON: ${error.message}`);
  }
  if (!parsed || parsed.schemaVersion !== MISSION_TASK_RESULTS_SCHEMA_VERSION) {
    throw new Error(`Unsupported execution report schema. Expected ${MISSION_TASK_RESULTS_SCHEMA_VERSION}.`);
  }
  if (!Array.isArray(parsed.tasks)) throw new Error("Execution report task results must be an array.");
  if (parsed.tasks.length > 50) throw new Error("Execution report contains too many task results.");
  return parsed;
}

export function validateMissionTaskResultsPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Execution report body must be a JSON object.");
  }
  if (JSON.stringify(payload).length > MAX_DIRECT_REPORT_JSON_LENGTH) {
    throw new Error("Execution report JSON is too large to process.");
  }
  if (payload.schemaVersion !== MISSION_TASK_RESULTS_SCHEMA_VERSION) {
    throw new Error(`Unsupported execution report schema. Expected ${MISSION_TASK_RESULTS_SCHEMA_VERSION}.`);
  }
  if (!Array.isArray(payload.tasks)) throw new Error("Execution report task results must be an array.");
  if (payload.tasks.length > 50) throw new Error("Execution report contains too many task results.");
  return payload;
}

export function reviewMissionTaskResults(record, payload, rawReport = "") {
  if (!record) throw new Error("Mission not found.");
  const parsed = validateMissionTaskResultsPayload(payload);
  const providedMissionId = clean(parsed.missionId);
  const providedDisplayId = clean(parsed.missionDisplayId);
  if (!providedMissionId && !providedDisplayId) {
    throw new Error("Execution report must include missionId or missionDisplayId.");
  }
  if (providedMissionId && providedMissionId !== record.id) {
    throw new Error("Execution report missionId does not match this mission.");
  }
  if (providedDisplayId && providedDisplayId !== record.displayId) {
    throw new Error("Execution report missionDisplayId does not match this mission.");
  }

  const taskIds = missionTaskIds(record);
  const seen = new Set();
  const matched = [];
  const unmatched = [];
  for (const item of parsed.tasks) {
    const taskId = clean(item && item.taskId);
    const status = clean(item && item.status);
    const outcome = clean(item && item.outcome);
    const result = {
      taskId,
      status,
      outcome,
      summary: sanitizeExecutionSummary(item && item.summary),
      applied: false,
      reason: "",
    };
    if (!taskId || !taskIds.has(taskId)) {
      result.reason = "Unknown task ID.";
      unmatched.push(result);
      continue;
    }
    if (seen.has(taskId)) {
      result.reason = "Duplicate task result.";
      unmatched.push(result);
      continue;
    }
    seen.add(taskId);
    if (!TASK_RESULT_STATUSES.has(status)) {
      result.reason = "Unsupported task status.";
      unmatched.push(result);
      continue;
    }
    if (outcome && !TASK_RESULT_OUTCOMES.has(outcome)) {
      result.reason = "Unsupported task outcome.";
      unmatched.push(result);
      continue;
    }
    result.applied = true;
    matched.push(result);
  }

  const taskMap = new Map(asArray((record.workPacket || {}).workToComplete).map((task) => [task.id, task]));
  const missing = Array.from(taskIds)
    .filter((taskId) => !seen.has(taskId))
    .map((taskId) => ({
      taskId,
      title: taskMap.get(taskId)?.title || taskId,
      status: taskStatusEntry((record.taskStatus || {})[taskId]).status,
    }));
  const completedStatuses = matched.filter((item) => item.status === "complete" || item.status === "complete_scoped");
  return {
    schemaVersion: MISSION_TASK_RESULTS_SCHEMA_VERSION,
    missionId: record.id,
    missionDisplayId: record.displayId,
    rawReport: String(rawReport || ""),
    matched,
    unmatched,
    missing,
    summary: {
      matched: matched.length,
      unmatched: unmatched.length,
      missing: missing.length,
      complete: matched.filter((item) => item.status === "complete").length,
      completeScoped: matched.filter((item) => item.status === "complete_scoped").length,
      researchableLater: matched.filter((item) => item.outcome === "researchable_later").length,
      blocked: matched.filter((item) => item.outcome === "blocked").length,
      completeLike: completedStatuses.length,
    },
  };
}

export function reviewMissionExecutionReport(record, rawReport) {
  return reviewMissionTaskResults(record, parseMissionTaskResultsBlock(rawReport), rawReport);
}

async function applyMissionTaskResults(env, id, payload, rawReport = "", options = {}) {
  const db = env.LEADS_DB;
  if (!db) throw new Error("LEADS_DB D1 binding is required for EOS mission persistence.");
  const mission = await getMission(env, id);
  if (!mission) throw new Error("Mission not found.");
  if (mission.status === "completed") throw new Error("Mission is completed; execution reporting is closed.");
  const review = reviewMissionTaskResults(mission, payload, rawReport);
  if (options.rejectUnmatched && review.unmatched.length) {
    throw new Error("Execution report contains unknown or invalid task results; direct reporting was not applied.");
  }
  const taskStatus = { ...(mission.taskStatus || {}) };
  const now = new Date().toISOString();

  for (const result of review.matched) {
    const existing = taskStatusEntry(taskStatus[result.taskId]);
    if (isMissionTaskComplete(existing) && result.status === "pending") continue;
    const completedAt = (result.status === "complete" || result.status === "complete_scoped")
      ? existing.completedAt || now
      : "";
    taskStatus[result.taskId] = {
      status: result.status,
      outcome: result.outcome || existing.outcome || "delivered",
      executionSummary: result.summary || existing.executionSummary,
      completedAt,
    };
  }
  taskStatus.__executionReport = {
    schemaVersion: review.schemaVersion,
    appliedAt: now,
    transport: options.transport || "manual",
    matched: review.summary.matched,
    unmatched: review.summary.unmatched,
    missing: review.summary.missing,
  };

  await db.prepare(`
    update eos_missions
    set task_status_json = ?,
        reporting_token_last_used_at = coalesce(?, reporting_token_last_used_at),
        updated_at = ?
    where id = ?
  `).bind(JSON.stringify(taskStatus), options.reportingTokenUsedAt || null, now, id).run();
  return { mission: await getMission(env, id), review };
}

export async function applyMissionExecutionReport(env, id, rawReport) {
  const parsed = parseMissionTaskResultsBlock(rawReport);
  const result = await applyMissionTaskResults(env, id, parsed, rawReport, { transport: "manual" });
  return result.mission;
}

const EVIDENCE_READINESS = {
  ready: "ready",
  researchable: "researchable",
  blocked: "blocked",
};

const FOUNDATION_STATES = {
  unmapped: "unmapped",
  foundation: "foundation",
  developed: "developed",
};

function runtimeMarket(eos, marketId) {
  return asArray((((eos.commercialKnowledgeIntelligence || {}).googleOpportunity || {}).markets))
    .find((market) => market.marketId === marketId) || null;
}

function runtimeMarketSnapshot(eos, marketId) {
  return asArray((eos.commercialKnowledgeIntelligence || {}).marketSnapshots)
    .find((snapshot) => snapshot.marketId === marketId) || null;
}

function readinessLabel(value) {
  return labelize(value);
}

function targetPropertyTypeId(propertyTypes, mission) {
  const text = `${propertyTypes.join(" ")} ${mission.title || ""}`.toLowerCase();
  if (/warehouse|industrial/.test(text)) return "industrial";
  if (/retail/.test(text)) return "retail";
  if (/office/.test(text)) return "office";
  if (/flex/.test(text)) return "flex";
  if (/medical|healthcare/.test(text)) return "medical";
  return "commercial";
}

function foundationStateForCoverage(coverage, snapshot, propertyTypeId) {
  const hasOverview = Boolean(coverage && coverage.hasMarketOverview);
  const hasSnapshot = Boolean(coverage && coverage.hasMarketSnapshot) || Boolean(snapshot);
  const districtCount = Number((coverage && coverage.districtCount) || 0);
  const buildingCount = Number((coverage && coverage.representativeBuildingCount) || 0);
  const hasPropertyContext = Boolean(snapshot && snapshot.propertyTypeContext && snapshot.propertyTypeContext[propertyTypeId]);

  if (hasOverview && hasSnapshot && districtCount >= 3 && buildingCount >= 5 && hasPropertyContext) {
    return FOUNDATION_STATES.developed;
  }
  if ((hasSnapshot && hasPropertyContext) || districtCount > 0 || buildingCount >= 3) {
    return FOUNDATION_STATES.foundation;
  }
  return FOUNDATION_STATES.unmapped;
}

function classifyGapReadiness(gap, { state, coverage, snapshot, propertyTypeId }) {
  const districtCount = Number((coverage && coverage.districtCount) || 0);
  const buildingCount = Number((coverage && coverage.representativeBuildingCount) || 0);
  const hasSnapshot = Boolean((coverage && coverage.hasMarketSnapshot) || snapshot);
  const hasPropertyContext = Boolean(snapshot && snapshot.propertyTypeContext && snapshot.propertyTypeContext[propertyTypeId]);

  if (gap === "market-snapshot") {
    return hasSnapshot && hasPropertyContext
      ? { status: EVIDENCE_READINESS.ready, reason: "A source-controlled Market Snapshot already includes target property-type context." }
      : { status: EVIDENCE_READINESS.researchable, reason: "A bounded occupier Market Snapshot can be created from trustworthy market and property-type evidence." };
  }

  if (gap === "market-overview") {
    return state === FOUNDATION_STATES.unmapped
      ? { status: EVIDENCE_READINESS.researchable, reason: "Canonical market identity and broad commercial character can usually be established from official or institutional sources." }
      : { status: EVIDENCE_READINESS.ready, reason: "Enough market foundation exists to strengthen overview-level knowledge." };
  }

  if (gap === "district-coverage") {
    return districtCount >= 3
      ? { status: EVIDENCE_READINESS.ready, reason: "Canonical commercial geography already exists for this market." }
      : { status: EVIDENCE_READINESS.researchable, reason: "Commercial geography should be researched as districts, corridors, industrial areas, business parks, or submarkets before creating dependent evidence." };
  }

  if (gap === "representative-buildings" || gap === "building-intelligence") {
    return buildingCount >= 5
      ? { status: EVIDENCE_READINESS.ready, reason: "A small representative property set already exists." }
      : { status: EVIDENCE_READINESS.researchable, reason: "Representative properties can be identified only after source-supported geography and property identity are validated." };
  }

  if (/industrial|warehouse|retail|office|medical|flex/.test(gap)) {
    if (hasPropertyContext && (districtCount > 0 || buildingCount >= 3)) {
      return { status: EVIDENCE_READINESS.ready, reason: "Property-type context and at least one supporting geography or property-evidence signal exist." };
    }
    return { status: EVIDENCE_READINESS.researchable, reason: "Property-type depth requires narrow evidence acquisition before canonical knowledge is expanded." };
  }

  if (/business-guides/.test(gap)) {
    if (state === FOUNDATION_STATES.developed) {
      return { status: EVIDENCE_READINESS.ready, reason: "Market foundation is developed enough to evaluate guide readiness." };
    }
    return { status: EVIDENCE_READINESS.blocked, reason: "Business guides should wait until market foundation, property-type context, geography, and representative evidence are stronger." };
  }

  return { status: EVIDENCE_READINESS.researchable, reason: "The gap needs bounded evidence review before it can be promoted into canonical knowledge." };
}

export function assessMarketFoundation(mission, eos = {}) {
  const propertyTypes = missionPropertyTypes(mission);
  const propertyTypeId = targetPropertyTypeId(propertyTypes, mission);
  const gaps = asArray(mission.knowledgeGaps);

  const markets = asArray(mission.supportingMarkets).slice(0, SEARCH_MISSION_TRANCHE_SIZE).map((sourceMarket) => {
    const market = runtimeMarket(eos, sourceMarket.marketId) || sourceMarket;
    const snapshot = runtimeMarketSnapshot(eos, sourceMarket.marketId);
    const coverage = (market && market.knowledgeCoverage) || {};
    const state = foundationStateForCoverage(coverage, snapshot, propertyTypeId);
    const gapReadiness = gaps.map((gap) => ({
      id: gap,
      label: gapLabel(gap),
      ...classifyGapReadiness(gap, { state, coverage, snapshot, propertyTypeId }),
    }));
    const gapStatuses = new Set(gapReadiness.map((gap) => gap.status));
    const readiness = gapStatuses.has(EVIDENCE_READINESS.ready)
      ? EVIDENCE_READINESS.ready
      : gapStatuses.has(EVIDENCE_READINESS.researchable)
        ? EVIDENCE_READINESS.researchable
        : EVIDENCE_READINESS.blocked;

    return {
      marketId: sourceMarket.marketId,
      marketName: sourceMarket.marketName,
      state: sourceMarket.state,
      foundationState: state,
      evidenceReadiness: readiness,
      knowledgeCoverage: {
        hasMarketOverview: Boolean(coverage.hasMarketOverview),
        hasMarketSnapshot: Boolean(coverage.hasMarketSnapshot) || Boolean(snapshot),
        districtCount: Number(coverage.districtCount || 0),
        representativeBuildingCount: Number(coverage.representativeBuildingCount || 0),
        publishedBusinessBriefCount: Number(coverage.publishedBusinessBriefCount || 0),
      },
      propertyTypeContextReady: Boolean(snapshot && snapshot.propertyTypeContext && snapshot.propertyTypeContext[propertyTypeId]),
      gapReadiness,
    };
  });

  return {
    schemaVersion: "market-foundation-assessment-v1",
    propertyTypeId,
    propertyTypes,
    foundationDefinition: [
      "Canonical market identity and state.",
      "Occupier-focused commercial character.",
      "Target property-type context.",
      "Defensible commercial geography such as districts, corridors, industrial areas, business parks, submarkets, municipalities, or commercial centers.",
      "A bounded set of representative properties where source evidence supports them.",
      "Source trace sufficient for editorial review.",
    ],
    sourceStandard: [
      "Tier 1: official government, property owner, transit or planning agency, and official development material.",
      "Tier 2: established brokerage research, institutional CRE reports, and reputable property or development sources.",
      "Tier 3: discovery sources may identify candidates but should not be the sole basis for canonical claims.",
    ],
    markets,
  };
}

function hasResearchablePrerequisites(assessment) {
  return asArray(assessment.markets).some((market) =>
    market.foundationState === FOUNDATION_STATES.unmapped ||
    asArray(market.gapReadiness).some((gap) => gap.status === EVIDENCE_READINESS.researchable)
  );
}

function hasBlockedGaps(assessment) {
  return asArray(assessment.markets).some((market) =>
    asArray(market.gapReadiness).some((gap) => gap.status === EVIDENCE_READINESS.blocked)
  );
}

function marketFoundationSummary(assessment) {
  return asArray(assessment.markets).map((market) => {
    const blocked = asArray(market.gapReadiness).filter((gap) => gap.status === EVIDENCE_READINESS.blocked).map((gap) => gap.label);
    return {
      marketId: market.marketId,
      marketName: market.marketName,
      state: market.state,
      foundationState: market.foundationState,
      evidenceReadiness: market.evidenceReadiness,
      propertyTypeContextReady: market.propertyTypeContextReady,
      coverage: market.knowledgeCoverage,
      blockedGaps: blocked,
    };
  });
}

export function generateSearchMissionWorkPacket(mission, eos = {}) {
  const supportingMarkets = asArray(mission.supportingMarkets).slice(0, SEARCH_MISSION_TRANCHE_SIZE);
  const gaps = asArray(mission.knowledgeGaps);
  const propertyTypes = missionPropertyTypes(mission);
  const themes = missionThemes(mission);
  const foundationAssessment = assessMarketFoundation(mission, eos);
  const items = [];
  const marketList = supportingMarkets.map((market) => `${market.marketName}${market.state ? `, ${market.state}` : ""}`);
  const subject = propertyTypes[0] || (mission.type === "building_intelligence" ? "Building Intelligence" : "Commercial Knowledge");

  if (hasResearchablePrerequisites(foundationAssessment)) {
    items.push(workItem(
      "evidence-acquisition",
      "Codex",
      `Acquire bounded ${subject.toLowerCase()} market-foundation evidence`,
      `For ${marketList.join("; ") || "the supporting markets"}, classify each missing gap as Ready, Researchable, or Blocked. Research only the target property type. Establish source-supported commercial geography, representative property candidates, and source trace before promoting canonical knowledge. Do not fabricate districts or properties to satisfy a quota.`
    ));
  }

  if (gaps.some((gap) => /representative|building|industrial|warehouse|retail|office|medical|flex/.test(gap)) || mission.type === "building_intelligence") {
    items.push(workItem(
      "representative-evidence",
      "Codex",
      `Assess representative ${subject.toLowerCase()} evidence`,
      `Review canonical market, district, and building data for ${marketList.join("; ") || "the supporting markets"}. If the foundation assessment is Ready, add only source-supported representative building or district evidence that closes an actual Publisher gap. If it is Researchable, complete the evidence-acquisition prerequisite first. If it is Blocked, defer and explain why.`
    ));
  }

  if (gaps.some((gap) => /market-overview|market-snapshot|strategic-market-depth/.test(gap))) {
    items.push(workItem(
      "market-knowledge",
      "Codex",
      "Strengthen market knowledge where evidence supports it",
      "Use existing Commercial Knowledge System sources to improve market or Market Snapshot coverage. Omit unsupported rent, investor, live availability, and speculative claims."
    ));
  }

  if (gaps.some((gap) => /district/.test(gap)) || mission.type === "district") {
    items.push(workItem(
      "district-intelligence",
      "Codex",
      "Close district intelligence gaps",
      "Improve district relationships, representative-building references, and concise commercial rationale only where the current source graph supports the work."
    ));
  }

  if (gaps.some((gap) => /business-guides/.test(gap))) {
    items.push(workItem(
      "business-guides",
      "Codex",
      "Evaluate business-guide readiness",
      "Identify whether public Business Brief or business-type guide work is actually supported by the completed foundation. Do not create thin pages or new archetypes; classify unsupported guide work as deferred or blocked."
    ));
  }

  if (hasBlockedGaps(foundationAssessment)) {
    items.push(workItem(
      "blocked-gap-reporting",
      "Review",
      "Record blocked gaps explicitly",
      "For each blocked gap, record whether it is researchable later or genuinely blocked, and explain the evidence constraint. Completing scoped work with deferred gaps is acceptable when the approved packet is delivered."
    ));
  }

  if (gaps.some((gap) => /photo|image|media/.test(gap))) {
    items.push(workItem(
      "field-photos",
      "Field / Human",
      "Capture missing field photography",
      "Record missing photo needs for Field Mode. Do not block Codex-executable source work on human photo capture."
    ));
  }

  items.push(workItem(
    "qa",
    "Codex",
    "Run Publisher, EOS, and build validation",
    "Run the relevant deterministic QA, regenerate Publisher/EOS snapshots when source coverage changes, and report measurable before/after mission impact."
  ));

  const validation = unique([
    "node scripts/qa-search-intelligence.js",
    "node scripts/qa-eos-commercial-knowledge-intelligence.js",
    "node scripts/qa-eos-today.js",
    "node scripts/qa-eos.js",
    "npm run publisher:snapshot",
    "npm run build",
    "git diff --check",
  ]);

  return {
    schemaVersion: "eos-search-mission-work-packet-v1",
    objective: `Complete the bounded ${mission.title} mission without changing Search Mission scoring, GSC ingestion, recommendations, or public URL architecture.`,
    sourceContext: mission.sourceContext || null,
    whyThisWork: asArray(mission.evidence).concat(mission.whyNow ? [mission.whyNow] : []),
    targets: {
      markets: supportingMarkets,
      propertyTypes,
      themes,
    },
    marketFoundation: foundationAssessment,
    currentGaps: gaps.map((gap) => ({ id: gap, label: gapLabel(gap) })),
    workToComplete: items,
    boundaries: [
      "Do not change Search Mission scoring or Google Search Console ingestion.",
      "Do not publish unsupported investor, rent, cap-rate, tenant, or live availability claims.",
      "Do not add new cities, property types, or business archetypes unless explicitly included in the mission evidence.",
      "Do not auto-publish content; Publisher readiness remains advisory and review-driven.",
      "Keep generated snapshots deterministic and avoid adding raw Search Intelligence data to Pages Functions.",
    ],
    validation,
    completionReport: [
      "implementation summary",
      "files changed",
      "mission evidence used",
      "evidence acquired",
      "canonical knowledge added",
      "gaps completed",
      "gaps deferred with researchable or blocked classification",
      "Publisher/EOS before-after",
      "QA results",
      "validation results",
      "recommended next opportunity (advisory only; do not continue without a new approved packet)",
      `${MISSION_TASK_RESULTS_START} structured block with every supplied task ID`,
    ],
  };
}

export function codexPacketMarkdown(record, options = {}) {
  const packet = record.workPacket || {};
  const targetMarkets = asArray(packet.targets && packet.targets.markets);
  const reportingToken = clean(options.reportingToken);
  const reportingBaseUrl = clean(options.reportingBaseUrl || "https://www.rofo.com").replace(/\/+$/, "");
  const reportingCommand = `node scripts/report-mission-execution.js --mission-id "${record.id || ""}" --token "${reportingToken || "<MISSION_REPORTING_TOKEN>"}" --results-file "/tmp/mission-results.json"`;
  const lines = [
    `${record.displayId}`,
    record.title,
    "",
    "OBJECTIVE",
    packet.objective || record.objective,
    "",
    "WHY THIS WORK",
    ...asArray(packet.whyThisWork).map((item) => `- ${item}`),
    "",
    "TARGETS",
    "Markets:",
    ...(targetMarkets.length ? targetMarkets.map((market) => `- ${market.marketName}${market.state ? `, ${market.state}` : ""}`) : ["- No specific markets supplied"]),
    "",
    "Property type:",
    ...(asArray(packet.targets && packet.targets.propertyTypes).length ? asArray(packet.targets.propertyTypes).map((item) => `- ${item}`) : ["- Not property-type specific"]),
    "",
    "CURRENT GAPS",
    ...(asArray(packet.currentGaps).length ? asArray(packet.currentGaps).map((gap) => `- ${gap.label || gap.id}`) : ["- None specified"]),
    "",
    "MARKET FOUNDATION",
    ...asArray((packet.marketFoundation || {}).markets).map((market) => {
      const coverage = market.knowledgeCoverage || market.coverage || {};
      return `- ${market.marketName}${market.state ? `, ${market.state}` : ""}: ${readinessLabel(market.foundationState)} foundation; ${readinessLabel(market.evidenceReadiness)} evidence readiness; snapshot ${coverage.hasMarketSnapshot ? "ready" : "missing"}; districts ${coverage.districtCount || 0}; representative buildings ${coverage.representativeBuildingCount || 0}.`;
    }),
    ...(asArray((packet.marketFoundation || {}).markets).length ? [] : ["- Foundation assessment unavailable."]),
    "",
    "EVIDENCE STANDARD",
    ...asArray((packet.marketFoundation || {}).sourceStandard).map((item) => `- ${item}`),
    "",
    "WORK TO COMPLETE",
    ...(asArray(packet.workToComplete).length ? asArray(packet.workToComplete).map((item, index) => `${index + 1}. ${item.title}\n   Task ID: ${item.id}\n   Owner: ${item.owner}\n   ${item.details}`) : ["1. Review current evidence and define the smallest supported source change."]),
    "",
    "BOUNDARIES",
    ...asArray(packet.boundaries).map((item) => `- ${item}`),
    "",
    "VALIDATION",
    ...asArray(packet.validation).map((item) => `- ${item}`),
    "",
    "MISSION EXECUTION PROTOCOL",
    reportingToken ? "direct-reporting-v1" : "manual-reporting-fallback",
    "",
    "DIRECT EXECUTION REPORTING",
    reportingToken
      ? `When all approved work and validation are complete, write the MISSION_TASK_RESULTS_V1 JSON to a temporary local file and run:\n${reportingCommand}\nUse EOS_REPORTING_BASE_URL=${reportingBaseUrl} only if you need to override the endpoint for local or staging validation. Confirm the script reports: Mission execution results accepted. Do not mark the mission complete. Do not continue to another mission.`
      : "Direct reporting token is not available in this packet view. Use the Manual Execution Report fallback in Mission Control by pasting the MISSION_TASK_RESULTS_V1 block.",
    "",
    "COMPLETION REPORT",
    ...asArray(packet.completionReport).map((item) => `- ${item}`),
    "",
    "IMPORTANT COMPLETION REQUIREMENT",
    `At the end of your Standardized Execution Report, return a valid ${MISSION_TASK_RESULTS_START} block containing exactly the mission task IDs supplied in this packet and the result of each task.`,
    "Do not rename task IDs.",
    "Do not omit a task because the outcome is blocked or deferred.",
    "A task can be complete even when its outcome is blocked or researchable later.",
    "Recommended Next Opportunity is advisory input back to EOS. It is not authorization for Codex to continue working.",
    "",
    MISSION_TASK_RESULTS_START,
    JSON.stringify({
      schemaVersion: MISSION_TASK_RESULTS_SCHEMA_VERSION,
      missionDisplayId: record.displayId,
      missionId: record.id || "",
      tasks: asArray(packet.workToComplete).map((item) => ({
        taskId: item.id,
        status: "complete",
        outcome: "delivered",
        summary: `Replace with the concise result for ${item.id}.`,
      })),
    }, null, 2),
    MISSION_TASK_RESULTS_END,
  ];
  return lines.join("\n").trim();
}

function baselineSearchSnapshot(mission, eos) {
  const sourceSnapshot = (((eos.commercialKnowledgeIntelligence || {}).googleOpportunity || {}).sourceSnapshot) || {};
  return {
    source: "search_intelligence",
    sourceDateRange: sourceSnapshot.dateRange || null,
    updatedAt: sourceSnapshot.updatedAt || null,
    impressions28d: mission.impressions || 0,
    clicks28d: mission.clicks || 0,
    averagePosition: mission.averagePosition || null,
    momentum: mission.momentum || null,
    supportingMarkets: asArray(mission.supportingMarkets),
    themes: missionThemes(mission),
    propertyTypes: missionPropertyTypes(mission),
  };
}

function evidenceSnapshot(mission) {
  return {
    confidence: mission.confidence || "",
    impressions: mission.impressions || 0,
    clicks: mission.clicks || 0,
    averagePosition: mission.averagePosition || null,
    momentum: mission.momentum || null,
    occupierRelevance: mission.occupierRelevance || "",
    supportingMarkets: asArray(mission.supportingMarkets),
    evidence: asArray(mission.evidence),
    whyNow: mission.whyNow || "",
    recommendedActions: asArray(mission.recommendedActions),
    strategicAlignment: mission.strategicAlignment || null,
  };
}

export async function ensureMissionTables(db) {
  if (!db) throw new Error("LEADS_DB D1 binding is required for EOS mission persistence.");
  await db.prepare(MISSION_TABLE_SQL).run();
  for (const sql of MISSION_INDEX_SQL) await db.prepare(sql).run();
}

function rowToMission(row) {
  if (!row) return null;
  const mission = {
    id: row.id,
    sequenceNumber: Number(row.sequence_number),
    displayId: row.display_id,
    sourceMissionId: row.source_mission_id,
    source: row.source,
    type: row.type,
    title: row.title,
    objective: row.objective,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    confidence: row.confidence,
    estimatedEffort: row.estimated_effort,
    expectedImpact: row.expected_impact,
    supportingMarkets: safeJsonParse(row.supporting_markets_json, []),
    propertyTypes: safeJsonParse(row.property_types_json, []),
    themes: safeJsonParse(row.themes_json, []),
    evidenceSnapshot: safeJsonParse(row.evidence_snapshot_json, {}),
    knowledgeGapSnapshot: safeJsonParse(row.knowledge_gap_snapshot_json, []),
    workPacket: safeJsonParse(row.work_packet_json, {}),
    baselineSearchSnapshot: safeJsonParse(row.baseline_search_snapshot_json, {}),
    taskStatus: safeJsonParse(row.task_status_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  mission.codexPacket = codexPacketMarkdown(mission);
  return mission;
}

export async function listMissions(env, { limit = 50 } = {}) {
  const db = env.LEADS_DB;
  if (!db) return { configured: false, missions: [] };
  await ensureMissionTables(db);
  const result = await db.prepare(`
    select * from eos_missions
    order by case status when 'active' then 0 else 1 end, sequence_number desc
    limit ?
  `).bind(limit).all();
  return { configured: true, missions: asArray(result.results).map(rowToMission).filter(Boolean) };
}

export async function getMission(env, id) {
  const db = env.LEADS_DB;
  if (!db) return null;
  await ensureMissionTables(db);
  const row = await db.prepare("select * from eos_missions where id = ?").bind(id).first();
  return rowToMission(row);
}

export async function getActiveMissionForSource(env, sourceMissionId, source = SEARCH_MISSION_SOURCE) {
  const db = env.LEADS_DB;
  if (!db) return null;
  await ensureMissionTables(db);
  const row = await db.prepare(`
    select * from eos_missions
    where source = ? and source_mission_id = ? and status = 'active'
    order by sequence_number desc
    limit 1
  `).bind(source, sourceMissionId).first();
  return rowToMission(row);
}

export async function commenceSearchMission(env, eos, sourceMissionId) {
  const db = env.LEADS_DB;
  if (!db) throw new Error("LEADS_DB D1 binding is required for EOS mission persistence.");
  await ensureMissionTables(db);

  const existing = await getActiveMissionForSource(env, sourceMissionId);
  if (existing) return { mission: existing, created: false };

  const generatedMission = asArray(((eos.commercialKnowledgeIntelligence || {}).searchMissions)).find((item) => item.id === sourceMissionId);
  const missionRecords = (await listMissions(env, { limit: 500 })).missions || [];
  const mission = generatedMission
    ? prepareSearchMissionForExecution(generatedMission, eos, missionRecords)
    : createMarketFoundationMission(eos, sourceMissionId);
  if (!mission) throw new Error(`Search Mission has no executable remaining market tranche: ${sourceMissionId}`);

  const packet = generateSearchMissionWorkPacket(mission, eos);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const effort = estimatedEffort(mission);
  const impact = expectedImpact(mission);
  const properties = missionPropertyTypes(mission);
  const themes = missionThemes(mission);
  const evidence = evidenceSnapshot(mission);
  const baseline = baselineSearchSnapshot(mission, eos);
  const gaps = asArray(mission.knowledgeGaps);
  const reportingToken = randomToken();
  const reportingTokenHash = await sha256(reportingToken);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const maxRow = await db.prepare("select max(sequence_number) as max_sequence from eos_missions").first();
    const sequenceNumber = Number(maxRow && maxRow.max_sequence || 0) + 1;
    try {
      await db.prepare(`
        insert into eos_missions (
          id, sequence_number, display_id, source_mission_id, source, type, title, objective,
          status, started_at, completed_at, confidence, estimated_effort, expected_impact,
          supporting_markets_json, property_types_json, themes_json, evidence_snapshot_json,
          knowledge_gap_snapshot_json, work_packet_json, baseline_search_snapshot_json, task_status_json,
          reporting_token_hash, reporting_token_issued_at, reporting_token_last_used_at, reporting_token_revoked_at,
          created_at, updated_at
        ) values (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null, null, ?, ?)
      `).bind(
        id,
        sequenceNumber,
        displayId(sequenceNumber),
        mission.id,
        SEARCH_MISSION_SOURCE,
        mission.type || "search_mission",
        mission.title,
        packet.objective,
        now,
        mission.confidence || "",
        effort,
        impact,
        JSON.stringify(asArray(mission.supportingMarkets)),
        JSON.stringify(properties),
        JSON.stringify(themes),
        JSON.stringify(evidence),
        JSON.stringify(gaps),
        JSON.stringify(packet),
        JSON.stringify(baseline),
        JSON.stringify({}),
        reportingTokenHash,
        now,
        now,
        now
      ).run();
      return { mission: await getMission(env, id), created: true, reportingToken };
    } catch (error) {
      const message = String(error && error.message || error);
      const duplicateActive = await getActiveMissionForSource(env, sourceMissionId);
      if (duplicateActive) return { mission: duplicateActive, created: false };
      if (!/unique|constraint/i.test(message) || attempt === 4) throw error;
    }
  }

  throw new Error("Unable to allocate a durable EOS mission sequence number.");
}

export async function updateMissionTask(env, id, taskId, complete) {
  const db = env.LEADS_DB;
  if (!db) throw new Error("LEADS_DB D1 binding is required for EOS mission persistence.");
  const mission = await getMission(env, id);
  if (!mission) throw new Error("Mission not found.");
  const taskStatus = { ...(mission.taskStatus || {}) };
  const existing = taskStatusEntry(taskStatus[taskId]);
  taskStatus[taskId] = complete
    ? {
      status: "complete",
      outcome: existing.outcome || "delivered",
      executionSummary: existing.executionSummary,
      completedAt: existing.completedAt || new Date().toISOString(),
    }
    : {
      status: "pending",
      outcome: existing.outcome,
      executionSummary: existing.executionSummary,
      completedAt: "",
    };
  const now = new Date().toISOString();
  await db.prepare("update eos_missions set task_status_json = ?, updated_at = ? where id = ?")
    .bind(JSON.stringify(taskStatus), now, id)
    .run();
  return getMission(env, id);
}

export async function markMissionComplete(env, id) {
  const db = env.LEADS_DB;
  if (!db) throw new Error("LEADS_DB D1 binding is required for EOS mission persistence.");
  const mission = await getMission(env, id);
  if (!mission) throw new Error("Mission not found.");
  const tasks = asArray((mission.workPacket || {}).workToComplete);
  const incomplete = tasks.filter((task) => !isMissionTaskComplete((mission.taskStatus || {})[task.id]));
  if (incomplete.length) {
    throw new Error("Mission scoped work is not ready to close. Complete or reconcile every assigned task first.");
  }
  const now = new Date().toISOString();
  await db.prepare("update eos_missions set status = 'completed', completed_at = ?, reporting_token_revoked_at = ?, updated_at = ? where id = ?")
    .bind(now, now, now, id)
    .run();
  return getMission(env, id);
}

export async function authorizeMissionReporting(env, missionId, token) {
  const db = env.LEADS_DB;
  if (!db) throw new Error("LEADS_DB D1 binding is required for EOS mission persistence.");
  await ensureMissionTables(db);
  const row = await db.prepare(`
    select id, display_id, status, reporting_token_hash, reporting_token_revoked_at
    from eos_missions
    where id = ?
  `).bind(missionId).first();
  if (!row) throw new Error("Mission not found.");
  if (row.status === "completed") throw new Error("Mission is completed; execution reporting is closed.");
  if (row.reporting_token_revoked_at) throw new Error("Mission execution reporting token is revoked.");
  if (!row.reporting_token_hash) throw new Error("Mission does not have a direct reporting token; use manual report fallback.");
  if (!clean(token)) throw new Error("Mission reporting token is required.");
  const submittedHash = await sha256(token);
  if (!constantTimeEqual(submittedHash, row.reporting_token_hash)) throw new Error("Invalid mission reporting token.");
  return { missionId: row.id, displayId: row.display_id };
}

export async function submitMissionExecutionResults(env, missionId, token, payload) {
  await authorizeMissionReporting(env, missionId, token);
  const now = new Date().toISOString();
  const result = await applyMissionTaskResults(env, missionId, validateMissionTaskResultsPayload(payload), "", {
    transport: "direct-reporting-v1",
    reportingTokenUsedAt: now,
    rejectUnmatched: true,
  });
  const tasks = asArray((result.mission.workPacket || {}).workToComplete);
  const completed = tasks.filter((task) => isMissionTaskComplete((result.mission.taskStatus || {})[task.id])).length;
  return {
    ok: true,
    missionId: result.mission.id,
    displayId: result.mission.displayId,
    matchedTasks: result.review.summary.matched,
    remainingTasks: tasks.length - completed,
    readyToClose: tasks.length > 0 && completed === tasks.length,
  };
}
