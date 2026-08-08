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

  const markets = asArray(mission.supportingMarkets).slice(0, 6).map((sourceMarket) => {
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
  const supportingMarkets = asArray(mission.supportingMarkets).slice(0, 6);
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
    ],
  };
}

export function codexPacketMarkdown(record) {
  const packet = record.workPacket || {};
  const targetMarkets = asArray(packet.targets && packet.targets.markets);
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
    ...(asArray(packet.workToComplete).length ? asArray(packet.workToComplete).map((item, index) => `${index + 1}. ${item.title}\n   Owner: ${item.owner}\n   ${item.details}`) : ["1. Review current evidence and define the smallest supported source change."]),
    "",
    "BOUNDARIES",
    ...asArray(packet.boundaries).map((item) => `- ${item}`),
    "",
    "VALIDATION",
    ...asArray(packet.validation).map((item) => `- ${item}`),
    "",
    "COMPLETION REPORT",
    ...asArray(packet.completionReport).map((item) => `- ${item}`),
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

  const mission = asArray(((eos.commercialKnowledgeIntelligence || {}).searchMissions)).find((item) => item.id === sourceMissionId);
  if (!mission) throw new Error(`Search Mission not found: ${sourceMissionId}`);

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
          created_at, updated_at
        ) values (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        now,
        now
      ).run();
      return { mission: await getMission(env, id), created: true };
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
  taskStatus[taskId] = complete ? "complete" : "pending";
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
  const now = new Date().toISOString();
  await db.prepare("update eos_missions set status = 'completed', completed_at = ?, updated_at = ? where id = ?")
    .bind(now, now, id)
    .run();
  return getMission(env, id);
}
