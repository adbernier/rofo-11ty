const locationKnowledgeGraph = require("../../_data/locationKnowledgeGraph");
const commercialMarketEvidence = require("../../_data/commercialMarketEvidence");
const publisherRules = require("../../data/publisher-rules");

const AUTOMATION_LEVELS = {
  autonomous: {
    id: "autonomous",
    label: "Autonomous",
    description: "EOS can eventually prepare this work without new field input, with deterministic QA before publishing.",
  },
  review_required: {
    id: "review_required",
    label: "Review Required",
    description: "EOS can prepare or structure the work, but a human editor must approve judgments or evidence.",
  },
  human_only: {
    id: "human_only",
    label: "Human Only",
    description: "The work requires human capture, review, relationship judgment, or external evidence not yet available to automation.",
  },
};

const MODULES = {
  publisher: "Publisher",
  fieldMode: "Field Mode",
  compass: "Compass",
  handbook: "Handbook",
  knowledgeGraph: "Knowledge Graph",
  qa: "QA",
};

const TASK_STATES = {
  open: { id: "open", label: "Open" },
  ready: { id: "ready", label: "Ready" },
  in_progress: { id: "in_progress", label: "In Progress" },
  blocked: { id: "blocked", label: "Blocked" },
  ready_for_review: { id: "ready_for_review", label: "Ready for Review" },
  approved: { id: "approved", label: "Approved" },
  completed: { id: "completed", label: "Completed" },
  deferred: { id: "deferred", label: "Deferred" },
  dismissed: { id: "dismissed", label: "Dismissed" },
};

const EXECUTION_PROVIDERS = {
  manual: {
    id: "manual",
    label: "Manual",
    description: "A human uses the execution packet as a checklist and updates EOS externally.",
  },
  codex: {
    id: "codex",
    label: "Codex",
    description: "A future execution provider can consume the packet and return work for review.",
  },
};

const QUEUES = {
  editorial: {
    id: "editorial",
    label: "Editorial Queue",
    purpose: "Improve existing metros through Publisher, Compass, Handbook, and Knowledge Graph work.",
  },
  expansion: {
    id: "expansion",
    label: "Expansion Queue",
    purpose: "Manage future metros as multi-stage projects instead of single tasks.",
  },
  fieldMode: {
    id: "field_mode",
    label: "Field Mode Queue",
    purpose: "Summarize photography coverage and route work into Field Mode.",
  },
  review: {
    id: "review",
    label: "Review Queue",
    purpose: "Show work returned by future autonomous execution providers.",
  },
};

const OPERATING_LANES = {
  engineering: {
    id: "engineering",
    label: "Engineering",
    description: "Schema, graph, routing, generated data, validation, and integration work.",
  },
  execution: {
    id: "execution_field_mode",
    label: "Execution / Field Mode",
    description: "Operational execution, field photography, and provider handoff.",
  },
  editorial: {
    id: "editorial",
    label: "Editorial",
    description: "Commercial judgment, building profiles, handbook guidance, and public editorial depth.",
  },
  qa: {
    id: "qa",
    label: "QA",
    description: "Deterministic checks, recommendation validation, review approval, and publishing readiness.",
  },
};

const EXECUTION_HANDOFF = [
  { id: "engineering", label: "Engineering", description: "Prepare source files, schema, generated data, or implementation scope." },
  { id: "execution", label: "Execution / Field Mode", description: "Execute the work manually, through Field Mode, or through a future provider." },
  { id: "qa", label: "QA", description: "Run deterministic validation and return exceptions to review." },
  { id: "publish", label: "Publish", description: "Regenerate snapshots/build and publish through the existing deployment workflow." },
];

const EXPECTED_IMPACT = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const ESTIMATED_EFFORT = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

const CONFIDENCE_LEVELS = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const MISSION_CLASSES = {
  foundation: "Foundation",
  readinessBlocker: "Readiness Blocker",
  meaningfulDepth: "Meaningful Depth Improvement",
  refinement: "Refinement",
  maintenance: "Maintenance",
};

const MARKET_PROJECTION_SCHEMA_VERSION = "mission-control-v2-market-projection-v1";

const MARKET_PROGRAMS = {
  publisher: {
    id: "publisher",
    label: "Publisher",
    ownerSystem: "Publisher",
    purpose: "Measures market readiness, ecosystem constraints, and publishing-planning evidence.",
    sourceSystems: ["Publisher"],
  },
  commercialMarketEvidence: {
    id: "commercial_market_evidence",
    label: "Commercial Market Evidence",
    ownerSystem: "Commercial Market Evidence",
    purpose: "Tracks curated evidence collections that explain commercial environments.",
    sourceSystems: ["Commercial Market Evidence", "Commercial Location Knowledge Graph"],
  },
  buildingProfiles: {
    id: "building_profiles",
    label: "Building Profiles",
    ownerSystem: "Building Profiles",
    purpose: "Tracks representative building and Building Brief depth for market explanation.",
    sourceSystems: ["Publisher", "Building Briefs", "Representative Building Intelligence"],
  },
  photography: {
    id: "photography",
    label: "Photography",
    ownerSystem: "Field Mode",
    purpose: "Tracks Rofo-owned visual coverage as experience readiness.",
    sourceSystems: ["Field Mode", "EOS"],
  },
  recommendationQa: {
    id: "recommendation_qa",
    label: "Recommendation QA",
    ownerSystem: "Compass",
    purpose: "Tracks recommendation status, explainability, and QA coverage.",
    sourceSystems: ["Compass", "Recommendation QA"],
  },
  knowledgeGraph: {
    id: "knowledge_graph",
    label: "Knowledge Graph",
    ownerSystem: "Commercial Knowledge Graph",
    purpose: "Tracks durable commercial geography, district relationships, ecosystem metadata, and linking.",
    sourceSystems: ["Commercial Location Knowledge Graph", "Publisher"],
  },
};

const MARKET_PROGRAM_BY_CATEGORY = {
  metroFoundation: "publisher",
  commercialEcosystem: "publisher",
  districtCoverage: "knowledge_graph",
  comparisonGraph: "knowledge_graph",
  representativeBuildings: "building_profiles",
  buildingBriefs: "building_profiles",
  recommendationReadiness: "recommendation_qa",
  editorialQuality: "publisher",
  internalLinking: "knowledge_graph",
  photography: "photography",
  handbook: "publisher",
};

const HEALTH_WEIGHTS = {
  districtCoverage: 16,
  representativeBuildings: 14,
  commercialEcosystem: 18,
  photography: 10,
  recommendationConfidence: 16,
  editorialDepth: 12,
  internalLinks: 8,
  handbookIntegration: 6,
};

const READINESS_SCORES = {
  developed: 100,
  strong: 84,
  partial: 62,
  thin: 34,
  missing: 0,
  not_applicable: 100,
  review_required: 45,
};

const IMPACT_BY_SEVERITY = {
  critical: "Very High",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const EFFORT_BY_CATEGORY = {
  metroFoundation: "30-60 min",
  districtCoverage: "45-90 min",
  comparisonGraph: "20-45 min",
  representativeBuildings: "60-120 min",
  buildingBriefs: "90-180 min",
  recommendationReadiness: "30-75 min",
  editorialQuality: "20-45 min",
  internalLinking: "15-30 min",
  photography: "20 min",
  handbook: "45-90 min",
};

const CATEGORY_MODULES = {
  metroFoundation: "publisher",
  districtCoverage: "knowledgeGraph",
  comparisonGraph: "knowledgeGraph",
  representativeBuildings: "publisher",
  buildingBriefs: "publisher",
  recommendationReadiness: "compass",
  editorialQuality: "publisher",
  internalLinking: "knowledgeGraph",
  photography: "fieldMode",
  handbook: "handbook",
};

const EXPANSION_STAGES = [
  { id: "candidate", label: "Candidate" },
  { id: "research", label: "Research" },
  { id: "knowledge_graph", label: "Knowledge Graph" },
  { id: "representative_buildings", label: "Representative Buildings" },
  { id: "editorial_draft", label: "Editorial Draft" },
  { id: "recommendations", label: "Recommendations" },
  { id: "compass", label: "Compass" },
  { id: "qa", label: "QA" },
  { id: "publishing_ready", label: "Publishing Ready" },
  { id: "live", label: "Live" },
];

const EXPANSION_PROJECT_SEEDS = [
  {
    metroId: "los-angeles",
    metroName: "Los Angeles",
    state: "CA",
    status: "knowledge_graph",
    rationale: "Los Angeles has existing Knowledge Graph seed data but is not yet in the active Publisher metro portfolio.",
    searchOpportunity: 88,
    editorialLeverage: 82,
    buildEffort: 72,
    existingFoundation: 48,
    automationPotential: 58,
    brokerCoverage: 52,
  },
  {
    metroId: "atlanta",
    metroName: "Atlanta",
    state: "GA",
    status: "candidate",
    rationale: "Atlanta appears in Rofo expansion roadmap material and should be managed as a future metro project.",
    searchOpportunity: 78,
    editorialLeverage: 74,
    buildEffort: 54,
    existingFoundation: 12,
    automationPotential: 64,
    brokerCoverage: 42,
  },
  {
    metroId: "phoenix",
    metroName: "Phoenix",
    state: "AZ",
    status: "candidate",
    rationale: "Phoenix appears in recommendation expansion planning as a future office, industrial, healthcare, retail, and logistics metro.",
    searchOpportunity: 74,
    editorialLeverage: 70,
    buildEffort: 56,
    existingFoundation: 10,
    automationPotential: 62,
    brokerCoverage: 38,
  },
];

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function stateScore(state) {
  return READINESS_SCORES[String(state || "").toLowerCase()] ?? 50;
}

function healthState(score) {
  const value = clamp(score);
  if (value >= 85) return { id: "ready", label: "Ready" };
  if (value >= 68) return { id: "improving", label: "Improving" };
  if (value >= 45) return { id: "needs_attention", label: "Needs Attention" };
  if (value >= 25) return { id: "planning", label: "Planning" };
  return { id: "research", label: "Research" };
}

function confidenceFromScore(score, fallback = "Review Required") {
  const value = clamp(score);
  if (value >= 80) return "High";
  if (value >= 55) return "Medium";
  if (value > 0) return "Low";
  return fallback;
}

function readinessLabelFromScore(score) {
  const value = clamp(score);
  if (value >= 84) return "Strong";
  if (value >= 68) return "Developed";
  if (value >= 45) return "Partial";
  if (value > 0) return "Thin";
  return "Missing";
}

function priorityStars(score) {
  const value = clamp(score);
  if (value >= 86) return 5;
  if (value >= 68) return 4;
  if (value >= 46) return 3;
  if (value >= 24) return 2;
  return 1;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function weightedHealth(signals) {
  const totalWeight = Object.values(HEALTH_WEIGHTS).reduce((total, weight) => total + weight, 0);
  const weighted = Object.entries(HEALTH_WEIGHTS).reduce((total, [key, weight]) => {
    const signal = signals[key] || {};
    return total + clamp(signal.score) * weight;
  }, 0);
  return clamp(weighted / totalWeight);
}

function signal(id, label, score, note, source = "publisher") {
  return {
    id,
    label,
    score: clamp(score),
    state: healthState(score),
    note,
    source,
  };
}

function ecosystemScore(metro) {
  const readiness = metro.ecosystemReadiness || {};
  if (Array.isArray(readiness.evaluations) && readiness.evaluations.length) {
    const relevant = readiness.evaluations.filter((item) => item.relevance !== "not_applicable");
    const set = relevant.length ? relevant : readiness.evaluations;
    return clamp(set.reduce((total, item) => total + stateScore(item.readinessState), 0) / set.length);
  }
  return stateScore(readiness.state);
}

function photographySignal(metro) {
  return signal(
    "photography",
    "Photography Coverage",
    0,
    "Runtime Field Mode photo counts are not connected to EOS yet; v1 treats photo coverage as a human planning signal.",
    "fieldMode"
  );
}

function handbookScore(metro) {
  if (metro.buildingBriefCount >= 8) return 82;
  if (metro.buildingBriefCount >= 3) return 60;
  if (metro.cityPath) return 35;
  return 10;
}

function buildHealthSignals(metro) {
  const categories = metro.categories || {};
  const dimensions = metro.dimensions || {};
  const ecosystemReadiness = metro.ecosystemReadiness || {};
  const recommendation = dimensions.compassReadiness || {};
  const editorial = dimensions.editorialCoverage || {};
  const internalLinks = categories.internalLinking || {};
  const district = categories.districtCoverage || {};
  const representative = categories.representativeBuildings || {};
  const handbook = handbookScore(metro);

  return {
    districtCoverage: signal("districtCoverage", "District Coverage", district.score, district.explanation || "Publisher district coverage score."),
    representativeBuildings: signal("representativeBuildings", "Representative Building Coverage", representative.score, representative.explanation || "Representative building relationship depth."),
    commercialEcosystem: signal("commercialEcosystem", "Commercial Ecosystem Coverage", ecosystemScore(metro), (ecosystemReadiness.rationale || []).join(" "), "publisher"),
    photography: photographySignal(metro),
    recommendationConfidence: signal("recommendationConfidence", "Recommendation Coverage", recommendation.score, recommendation.explanation || "Compass recommendation confidence."),
    editorialDepth: signal("editorialDepth", "Editorial Coverage", editorial.score, editorial.explanation || "Public editorial depth."),
    internalLinks: signal("internalLinks", "Internal Linking", internalLinks.score, internalLinks.explanation || "Comparison and internal link integrity."),
    handbookIntegration: signal("handbookIntegration", "Handbook Coverage", handbook, "Initial proxy based on Building Brief depth and public city foundation.", "handbook"),
  };
}

function buildReadinessInterpretations(healthSignals) {
  const knowledgeSignals = [
    healthSignals.districtCoverage,
    healthSignals.representativeBuildings,
    healthSignals.commercialEcosystem,
    healthSignals.recommendationConfidence,
    healthSignals.editorialDepth,
    healthSignals.internalLinks,
  ].filter(Boolean);
  const experienceSignals = [
    healthSignals.photography,
    healthSignals.handbookIntegration,
    healthSignals.editorialDepth,
  ].filter(Boolean);
  const average = (signals) => signals.length
    ? clamp(signals.reduce((total, item) => total + clamp(item.score), 0) / signals.length)
    : 0;
  const knowledgeScore = average(knowledgeSignals);
  const experienceScore = average(experienceSignals);
  return {
    knowledgeReadiness: {
      label: readinessLabelFromScore(knowledgeScore),
      score: knowledgeScore,
      interpretation: "EOS interpretation from Publisher, Compass, Knowledge Graph, Building Profile, and QA signals.",
      sourceSignals: knowledgeSignals.map((item) => item.id),
    },
    experienceReadiness: {
      label: readinessLabelFromScore(experienceScore),
      score: experienceScore,
      interpretation: "EOS interpretation from photography, handbook, public-page richness, and editorial-depth signals.",
      sourceSignals: experienceSignals.map((item) => item.id),
    },
  };
}

function moduleForCategory(category) {
  const key = CATEGORY_MODULES[category] || "publisher";
  return {
    id: key,
    label: MODULES[key] || MODULES.publisher,
  };
}

function operatingLaneForCategory(category) {
  if (category === "photography") return OPERATING_LANES.execution;
  if (category === "recommendationReadiness") return OPERATING_LANES.qa;
  if (category === "buildingBriefs" || category === "representativeBuildings" || category === "handbook" || category === "editorialQuality") {
    return OPERATING_LANES.editorial;
  }
  return OPERATING_LANES.engineering;
}

function automationForPublisherItem(item) {
  if (item.category === "representativeBuildings" && /missing representative buildings/i.test(item.taskType || "")) return AUTOMATION_LEVELS.human_only;
  if (item.category === "buildingBriefs" && /missing Building Brief|initial Building Brief/i.test(item.taskType || "")) return AUTOMATION_LEVELS.review_required;
  if (item.category === "recommendationReadiness" && /QA/i.test(item.taskType || item.reason || "")) return AUTOMATION_LEVELS.review_required;
  if (item.severity === "critical") return AUTOMATION_LEVELS.review_required;
  if (item.automationCandidate) return AUTOMATION_LEVELS.autonomous;
  if (item.category === "comparisonGraph" || item.category === "internalLinking" || item.category === "editorialQuality") return AUTOMATION_LEVELS.autonomous;
  return AUTOMATION_LEVELS.review_required;
}

function workStatus(item) {
  if (/blocked/i.test(item.readinessState || item.confidence || "")) return TASK_STATES.blocked;
  if (/ready/i.test(item.readinessState || item.confidence || "") || item.automationCandidate) return TASK_STATES.ready;
  return TASK_STATES.open;
}

function executionProvidersFor(automationLevel) {
  if (automationLevel.id === "human_only") return [EXECUTION_PROVIDERS.manual];
  return [EXECUTION_PROVIDERS.manual, EXECUTION_PROVIDERS.codex];
}

function filesForTask(item) {
  const files = new Set();
  if (item.source && item.source.publicUrl) files.add(item.source.publicUrl);
  if (item.category === "districtCoverage" || item.category === "comparisonGraph" || item.category === "internalLinking") {
    files.add("_data/locationKnowledgeGraph.js");
    files.add("_data/locationKnowledgeSchema.js");
  }
  if (item.category === "representativeBuildings") {
    files.add("_data/recommendationRepresentativeBuildings.js");
    files.add("_data/representativeBuildingIntelligence.js");
  }
  if (item.category === "buildingBriefs") {
    files.add("_data/buildingPages.js");
    files.add("_data/commercialBuildingIntelligence.js");
  }
  if (item.category === "recommendationReadiness") {
    files.add("_data/recommendationQaStatus.js");
    files.add("scripts/run-recommendation-qa.js");
  }
  if (item.category === "handbook") {
    files.add("_data/commercialLeasingHandbook.js");
    files.add("docs/commercial-leasing-handbook.md");
  }
  if (item.category === "commercialEcosystem") {
    files.add("_data/commercialEcosystemTaxonomy.js");
    files.add("_data/locationKnowledgeGraph.js");
    files.add("docs/commercial-ecosystem-data-model.md");
  }
  if (item.category === "photography") {
    files.add("functions/admin/field-photos.js");
    files.add("docs/field-mode.md");
  }
  files.add("data/generated/publisher-analysis.json");
  files.add("data/generated/eos-analysis.json");
  return Array.from(files);
}

function qaCommandsForTask(item) {
  const commands = new Set([
    "npm run build",
    "node scripts/qa-eos.js",
    "node scripts/qa-publisher-expansion-planner.js",
  ]);
  if (item.category === "recommendationReadiness") commands.add("node scripts/run-recommendation-qa.js");
  if (item.category === "commercialEcosystem") commands.add("node scripts/qa-publisher-ecosystem-readiness.js");
  if (item.category === "representativeBuildings") commands.add("node scripts/qa-representative-building-intelligence.js");
  if (item.category === "buildingBriefs") commands.add("node scripts/qa-building-brief-depth.js");
  if (item.category === "photography") commands.add("node scripts/qa-field-mode.js");
  commands.add("git diff --check");
  return Array.from(commands);
}

function acceptanceCriteriaForTask(item) {
  const criteria = [
    "The cited measurable gap is closed or explicitly reclassified.",
    "Existing Publisher, EOS, and relevant QA checks pass.",
    "No production recommendation rankings change unless a separate approved sprint requires it.",
  ];
  if (item.category === "photography") {
    return [
      "Field Mode remains the operational workspace.",
      "Published photos appear through existing Field Mode runtime rendering.",
      "No new photography task is added to the Editorial Queue.",
    ];
  }
  if (item.category === "buildingBriefs") criteria.push("Building Brief gating and URLs remain stable.");
  if (item.category === "comparisonGraph") criteria.push("Comparison relationships remain valid and non-duplicative.");
  if (item.category === "commercialEcosystem") criteria.push("Ecosystem readiness evidence changes according to deterministic Publisher rules.");
  return criteria;
}

function deliverablesForTask(item) {
  if (item.category === "photography") return ["Field Mode photo capture or replacement", "Updated public visual coverage"];
  if (item.category === "buildingBriefs") return ["Building Brief data updates", "Migration notes or review summary"];
  if (item.category === "representativeBuildings") return ["Representative Building records", "Canonical building relationships", "QA summary"];
  if (item.category === "recommendationReadiness") return ["QA status update", "Scenario result summary"];
  if (item.category === "commercialEcosystem") return ["Ecosystem metadata updates", "Publisher regeneration", "Remaining gap summary"];
  return ["Source data change", "Verification results", "Brief implementation summary"];
}

function executionPacketForTask(item, metroRecord) {
  const health = metroRecord && metroRecord.overallEditorialHealth ? `${metroRecord.overallEditorialHealth.score}% ${metroRecord.status.label}` : "Not available";
  return {
    objective: item.title,
    reason: item.why || [],
    currentHealth: health,
    files: filesForTask(item),
    dependencies: item.dependencies || [],
    acceptanceCriteria: acceptanceCriteriaForTask(item),
    expectedDeliverables: deliverablesForTask(item),
    qaCommands: qaCommandsForTask(item),
    requiredReview: item.automationLevel.id !== "autonomous" || item.category === "buildingBriefs",
    automationLevel: item.automationLevel,
    providers: executionProvidersFor(item.automationLevel),
    handoff: EXECUTION_HANDOFF,
  };
}

function attachExecutionPacket(item, metroRecords) {
  const metroRecord = metroRecords.find((metro) => metro.metroId === item.metroId);
  return {
    ...item,
    executionPacket: executionPacketForTask(item, metroRecord),
  };
}

function investmentScore(inputs) {
  const searchOpportunity = clamp(inputs.searchOpportunity);
  const editorialLeverage = clamp(inputs.editorialLeverage);
  const existingFoundation = clamp(inputs.existingFoundation);
  const automationPotential = clamp(inputs.automationPotential);
  const brokerCoverage = clamp(inputs.brokerCoverage);
  const buildEffort = clamp(inputs.buildEffort);
  return clamp(
    (searchOpportunity * 0.28) +
    (editorialLeverage * 0.24) +
    (existingFoundation * 0.16) +
    (automationPotential * 0.16) +
    (brokerCoverage * 0.08) +
    ((100 - buildEffort) * 0.08)
  );
}

function stageIndex(stageId) {
  return Math.max(0, EXPANSION_STAGES.findIndex((stage) => stage.id === stageId));
}

function expansionProgress(stageId) {
  const index = stageIndex(stageId);
  return clamp((index / (EXPANSION_STAGES.length - 1)) * 100);
}

function expansionStageStatus(projectStage, stage) {
  const current = stageIndex(projectStage);
  const index = stageIndex(stage.id);
  if (index < current) return "completed";
  if (index === current) return "active";
  return "open";
}

function expansionWorkstreamStatus(progress) {
  const value = clamp(progress);
  if (value >= 100) return "completed";
  if (value > 0) return "active";
  return "open";
}

function expansionWorkstreamProgress(projectStage, stageIds) {
  const current = stageIndex(projectStage);
  const indexes = stageIds.map(stageIndex).filter((index) => index >= 0).sort((a, b) => a - b);
  if (!indexes.length) return 0;
  const completed = indexes.filter((index) => current > index).length;
  if (completed >= indexes.length) return 100;
  if (indexes.includes(current)) return clamp(((completed + 0.5) / indexes.length) * 100);
  return clamp((completed / indexes.length) * 100);
}

function expansionWorkstreams(projectStage) {
  return [
    {
      id: "engineering",
      label: "Engineering Work",
      description: "Graph architecture, data structure, routes, generated output, and validation surfaces.",
      progress: expansionWorkstreamProgress(projectStage, ["research", "knowledge_graph", "recommendations", "compass"]),
    },
    {
      id: "field_mode",
      label: "Field Work",
      description: "Rofo-owned photography and visual coverage planning through Field Mode.",
      progress: expansionWorkstreamProgress(projectStage, ["representative_buildings"]),
    },
    {
      id: "editorial",
      label: "Editorial Work",
      description: "Representative environments, public editorial draft, handbook context, and market explanation.",
      progress: expansionWorkstreamProgress(projectStage, ["representative_buildings", "editorial_draft"]),
    },
    {
      id: "publishing_readiness",
      label: "Publishing Readiness",
      description: "QA, Publisher readiness, final publishing gate, and live status.",
      progress: expansionWorkstreamProgress(projectStage, ["qa", "publishing_ready", "live"]),
    },
  ].map((stream) => ({
    ...stream,
    status: expansionWorkstreamStatus(stream.progress),
  }));
}

function normalizePublisherTask(item, planByMetro) {
  const module = moduleForCategory(item.category);
  const automation = automationForPublisherItem(item);
  const priority = clamp((item.priority || 0) + (item.severity === "critical" ? 10 : 0));
  const lifecycleState = workStatus(item);
  return {
    id: `publisher:${item.id}`,
    metroId: item.metroId,
    metroName: item.metroName,
    title: item.suggestedNextAction || item.reason || item.taskType,
    itemName: item.itemName || "",
    priorityScore: priority,
    priorityStars: priorityStars(priority),
    automationLevel: automation,
    estimatedEffort: EFFORT_BY_CATEGORY[item.category] || "30-60 min",
    expectedEditorialImpact: IMPACT_BY_SEVERITY[item.severity] || "Medium",
    dependencies: item.severity === "critical" ? ["Resolve blocking Publisher validation first"] : [],
    confidence: item.readinessState || (item.automationCandidate ? "Ready" : "Review Required"),
    lifecycleState,
    status: lifecycleState.label,
    queueType: QUEUES.editorial.id,
    operatingLane: operatingLaneForCategory(item.category),
    category: item.category,
    categoryLabel: item.categoryLabel || item.category,
    suggestedModule: module,
    why: [
      item.reason,
      item.taskType ? `Task type: ${item.taskType}` : "",
      item.severity ? `Publisher severity: ${item.severity}` : "",
    ].filter(Boolean),
    source: {
      system: "Publisher",
      publicUrl: item.publicUrl || "",
      adminUrl: item.adminUrl || "",
      expansionPlan: planByMetro[item.metroId] ? planByMetro[item.metroId].recommendedSprint && planByMetro[item.metroId].recommendedSprint.title : "",
    },
  };
}

function photographyTask(metro) {
  const priority = metro.score >= 70 ? 86 : metro.score >= 45 ? 72 : 58;
  return {
    id: `field-mode:${metro.metroId}:primary-photography`,
    metroId: metro.metroId,
    metroName: metro.metroName,
    title: `Photograph ${metro.metroName} priority pages`,
    itemName: metro.metroName,
    priorityScore: priority,
    priorityStars: priorityStars(priority),
    automationLevel: AUTOMATION_LEVELS.human_only,
    estimatedEffort: "20 min",
    expectedEditorialImpact: metro.score >= 70 ? "Very High" : "High",
    dependencies: ["Field Mode upload workflow", "Canonical city, district, or building subject"],
    confidence: "Ready",
    lifecycleState: TASK_STATES.ready,
    status: TASK_STATES.ready.label,
    queueType: QUEUES.fieldMode.id,
    operatingLane: OPERATING_LANES.execution,
    category: "photography",
    categoryLabel: "Photography",
    suggestedModule: { id: "fieldMode", label: MODULES.fieldMode },
    why: [
      "Photography coverage is tracked as an EOS planning signal.",
      "Field Mode requires a human to capture Rofo-owned photos.",
      "A real city, district, or building photo improves public editorial trust without changing recommendations.",
    ],
    source: {
      system: "Field Mode",
      publicUrl: metro.cityPath || "",
      adminUrl: "",
    },
  };
}

function handbookTask(metro, signals) {
  if ((signals.handbookIntegration || {}).score >= 70) return null;
  const priority = metro.score >= 70 ? 62 : 44;
  return {
    id: `handbook:${metro.metroId}:integration`,
    metroId: metro.metroId,
    metroName: metro.metroName,
    title: `Connect ${metro.metroName} pages to leasing handbook guidance`,
    itemName: metro.metroName,
    priorityScore: priority,
    priorityStars: priorityStars(priority),
    automationLevel: AUTOMATION_LEVELS.review_required,
    estimatedEffort: EFFORT_BY_CATEGORY.handbook,
    expectedEditorialImpact: "Medium",
    dependencies: ["Relevant handbook guide exists", "Public city or district page exists"],
    confidence: "Review Required",
    lifecycleState: TASK_STATES.open,
    status: TASK_STATES.open.label,
    queueType: QUEUES.editorial.id,
    operatingLane: OPERATING_LANES.editorial,
    category: "handbook",
    categoryLabel: "Handbook",
    suggestedModule: { id: "handbook", label: MODULES.handbook },
    why: [
      "Handbook coverage is below the EOS target.",
      "Market pages should connect durable commercial guidance to the user decision journey.",
    ],
    source: {
      system: "EOS",
      publicUrl: metro.cityPath || "",
      adminUrl: "",
    },
  };
}

function ecosystemSprintTask(metro, plan) {
  const sprint = metro.recommendedEcosystemSprint || (plan && plan.recommendedEcosystemSprint);
  if (!sprint) return null;
  const priority = metro.ecosystemReadiness && metro.ecosystemReadiness.passed ? 48 : 78;
  return {
    id: `ecosystem:${metro.metroId}:${sprint.ecosystemId || "coverage"}`,
    metroId: metro.metroId,
    metroName: metro.metroName,
    title: sprint.title,
    itemName: sprint.ecosystemLabel || metro.metroName,
    priorityScore: priority,
    priorityStars: priorityStars(priority),
    automationLevel: AUTOMATION_LEVELS.review_required,
    estimatedEffort: "60-120 min",
    expectedEditorialImpact: metro.ecosystemReadiness && metro.ecosystemReadiness.passed ? "Medium" : "High",
    dependencies: Array.isArray(sprint.dependencies) ? sprint.dependencies : ["Canonical ecosystem metadata", "Publisher ecosystem readiness analysis"],
    confidence: "Review Required",
    lifecycleState: TASK_STATES.open,
    status: TASK_STATES.open.label,
    queueType: QUEUES.editorial.id,
    operatingLane: OPERATING_LANES.editorial,
    category: "commercialEcosystem",
    categoryLabel: "Commercial Ecosystem",
    ecosystemId: sprint.ecosystemId || "",
    ecosystemLabel: sprint.ecosystemLabel || "",
    sprintFamily: sprint.sprintFamily || "",
    gapCode: sprint.gapCode || "",
    suggestedModule: { id: "publisher", label: MODULES.publisher },
    why: [
      sprint.rationale,
      metro.ecosystemReadiness && metro.ecosystemReadiness.label ? `Ecosystem readiness: ${metro.ecosystemReadiness.label}` : "",
      metro.ecosystemBalance && metro.ecosystemBalance.label ? `Commercial balance: ${metro.ecosystemBalance.label}` : "",
    ].filter(Boolean),
    source: {
      system: "Publisher",
      publicUrl: "",
      adminUrl: "",
    },
  };
}

function planLookup(expansionPlans) {
  const plans = {};
  ((expansionPlans && expansionPlans.metros) || []).forEach((plan) => {
    plans[plan.metroId] = plan;
  });
  return plans;
}

function buildMetroEos(metro, plan) {
  const healthSignals = buildHealthSignals(metro);
  const readinessInterpretations = buildReadinessInterpretations(healthSignals);
  const overallEditorialHealth = weightedHealth(healthSignals);
  const status = healthState(overallEditorialHealth);
  const ecosystemReadiness = metro.ecosystemReadiness || {};
  const publisherConfidence = signal(
    "publisherConfidence",
    "Publisher Confidence",
    metro.score,
    metro.readinessStatus || "Publisher score",
    "publisher"
  );
  const metroInvestmentScore = investmentScore({
    searchOpportunity: 55,
    editorialLeverage: 100 - overallEditorialHealth,
    buildEffort: metro.queue && metro.queue.length > 80 ? 76 : metro.queue && metro.queue.length > 30 ? 58 : 38,
    existingFoundation: metro.score,
    automationPotential: 55 + ((metro.queue || []).filter((item) => item.automationCandidate).length > 10 ? 20 : 0),
    brokerCoverage: 45,
  });

  return {
    metroId: metro.metroId,
    metroName: metro.metroName,
    status,
    overallEditorialHealth: {
      score: overallEditorialHealth,
      state: status,
      label: status.label,
      rationale: Object.values(healthSignals)
        .filter((item) => item.score < 70)
        .slice(0, 4)
        .map((item) => `${item.label}: ${item.note}`),
    },
    investmentScore: {
      score: metroInvestmentScore,
      label: `${metroInvestmentScore}/100`,
      rationale: [
        "Existing foundation from Publisher score.",
        "Editorial leverage based on remaining health gap.",
        "Automation potential based on current queue composition.",
      ],
    },
    publisherConfidence,
    commercialEcosystemCoverage: {
      score: healthSignals.commercialEcosystem.score,
      state: ecosystemReadiness.state || "",
      label: ecosystemReadiness.label || healthSignals.commercialEcosystem.state.label,
      relevantEcosystems: ecosystemReadiness.relevantEcosystems || [],
      blockingEcosystems: ecosystemReadiness.blockingEcosystems || metro.blockingEcosystems || [],
      balance: metro.ecosystemBalance || null,
    },
    knowledgeReadiness: readinessInterpretations.knowledgeReadiness,
    experienceReadiness: readinessInterpretations.experienceReadiness,
    recommendationCoverage: healthSignals.recommendationConfidence,
    representativeBuildingCoverage: healthSignals.representativeBuildings,
    photographyCoverage: healthSignals.photography,
    editorialCoverage: healthSignals.editorialDepth,
    internalLinking: healthSignals.internalLinks,
    handbookCoverage: healthSignals.handbookIntegration,
    healthSignals,
    counts: {
      districts: metro.districtCount || 0,
      representativeBuildings: metro.representativeBuildingCount || 0,
      buildingBriefs: metro.buildingBriefCount || 0,
      queueItems: Array.isArray(metro.queue) ? metro.queue.length : 0,
    },
    examples: [
      metro.recommendedNextAction && metro.recommendedNextAction.itemName,
      plan && plan.recommendedSprint && plan.recommendedSprint.title,
      metro.recommendedEcosystemSprint && metro.recommendedEcosystemSprint.title,
    ].filter(Boolean).slice(0, 3),
    source: {
      publisherStatus: metro.readinessStatus,
      publisherScore: metro.score,
      cityPath: metro.cityPath || "",
    },
  };
}

function buildWorkQueue(publisherAnalysis, expansionPlans, metroRecords) {
  const planByMetro = planLookup(expansionPlans);
  const publisherTasks = (publisherAnalysis.queue || []).map((item) => normalizePublisherTask(item, planByMetro));
  const syntheticTasks = [];

  for (const metro of publisherAnalysis.metros || []) {
    const record = metroRecords.find((item) => item.metroId === metro.metroId);
    syntheticTasks.push(photographyTask(metro));
    const ecosystemTask = ecosystemSprintTask(metro, planByMetro[metro.metroId]);
    if (ecosystemTask) syntheticTasks.push(ecosystemTask);
    const handbook = handbookTask(metro, record && record.healthSignals);
    if (handbook) syntheticTasks.push(handbook);
  }

  return publisherTasks.concat(syntheticTasks)
    .map((item) => attachExecutionPacket(item, metroRecords))
    .sort((a, b) =>
      (b.priorityScore - a.priorityScore) ||
      a.metroName.localeCompare(b.metroName) ||
      a.title.localeCompare(b.title)
    );
}

function parseEcosystemFromTitle(title) {
  const text = String(title || "");
  const match = text.match(/^(.*?) Ecosystem /);
  if (!match) return "";
  return match[1].trim();
}

function categoryMatchesSprint(task, sprintTask) {
  const family = String(sprintTask.sprintFamily || sprintTask.title || "").toLowerCase();
  if (family.includes("building brief")) return task.category === "buildingBriefs";
  if (family.includes("representative building")) return task.category === "representativeBuildings";
  if (family.includes("recommendation")) return task.category === "recommendationReadiness";
  if (family.includes("district") || family.includes("subtype") || family.includes("classification") || family.includes("balance")) {
    return ["districtCoverage", "comparisonGraph", "commercialEcosystem", "representativeBuildings", "buildingBriefs"].includes(task.category);
  }
  return task.category === sprintTask.category;
}

function relatedTasksForSprint(sprintTask, editorialQueue, usedIds) {
  const tasks = [];
  const ecosystemText = parseEcosystemFromTitle(sprintTask.title);
  for (const task of editorialQueue) {
    if (task.id === sprintTask.id || usedIds.has(task.id)) continue;
    if (task.metroId !== sprintTask.metroId) continue;
    if (task.category === "photography" || task.suggestedModule.id === "fieldMode") continue;
    if (!categoryMatchesSprint(task, sprintTask)) continue;
    const text = `${task.title} ${task.itemName} ${(task.why || []).join(" ")}`.toLowerCase();
    const ecosystemToken = ecosystemText.toLowerCase();
    if (ecosystemToken && sprintTask.category === "commercialEcosystem") {
      const broadBuildingBrief = task.category === "buildingBriefs" && /initial building brief collection|representative building/i.test(`${task.title} ${task.itemName}`);
      if (!text.includes(ecosystemToken) && !broadBuildingBrief) continue;
    }
    tasks.push(task);
    if (tasks.length >= 6) break;
  }
  return tasks;
}

function deferredTasksForMission(seedTask, editorialQueue, fieldModeQueue, includedIds) {
  const deferred = [];
  const ecosystemText = parseEcosystemFromTitle(seedTask.title);
  const sameMetroFieldMode = fieldModeQueue.find((item) => item.metroId === seedTask.metroId);
  if (sameMetroFieldMode) {
    deferred.push({
      id: sameMetroFieldMode.id,
      title: sameMetroFieldMode.title,
      reason: "Photography remains Experience Readiness work owned by Field Mode.",
      suggestedModule: sameMetroFieldMode.suggestedModule,
    });
  }
  for (const task of editorialQueue) {
    if (deferred.length >= 5) break;
    if (task.metroId !== seedTask.metroId || includedIds.has(task.id) || task.id === seedTask.id) continue;
    if (task.category === "photography") continue;
    const unrelatedCategory = seedTask.category === "commercialEcosystem" && !categoryMatchesSprint(task, seedTask);
    const otherEcosystem = ecosystemText && task.category === "commercialEcosystem" && !String(task.title || "").includes(ecosystemText);
    if (unrelatedCategory || otherEcosystem || task.category === "handbook" || task.category === "editorialQuality") {
      deferred.push({
        id: task.id,
        title: task.title,
        reason: "Outside this mission's bounded product layer or ecosystem scope.",
        suggestedModule: task.suggestedModule,
      });
    }
  }
  return deferred;
}

function missionClassForTasks(tasks, metroRecord) {
  const combined = tasks.map((task) => `${task.title} ${(task.why || []).join(" ")} ${task.gapCode || ""}`).join(" ").toLowerCase();
  const hasBlocker = /blocking|missing|readiness|foundation|no meaningful district coverage/.test(combined) || (metroRecord && metroRecord.overallEditorialHealth.score < 45);
  if (hasBlocker && /missing|blocker|no meaningful|district foundation/.test(combined)) return MISSION_CLASSES.readinessBlocker;
  if (/foundation|migration|subtype expansion|representative building|building brief/.test(combined)) return MISSION_CLASSES.foundation;
  if (tasks.length > 1 || /depth|coverage|balance/.test(combined)) return MISSION_CLASSES.meaningfulDepth;
  if (/qa|internal link|broken|validation/.test(combined)) return MISSION_CLASSES.maintenance;
  return MISSION_CLASSES.refinement;
}

function expectedImpactForMission(tasks, missionClass, metroRecord) {
  const maxPriority = Math.max(...tasks.map((task) => clamp(task.priorityScore)));
  const combined = tasks.map((task) => `${task.expectedEditorialImpact} ${task.why || ""}`).join(" ").toLowerCase();
  if (missionClass === MISSION_CLASSES.readinessBlocker) return EXPECTED_IMPACT.high;
  if ((metroRecord && metroRecord.overallEditorialHealth.score < 68) && maxPriority >= 60) return EXPECTED_IMPACT.high;
  if (tasks.length >= 2 && maxPriority >= 60) return EXPECTED_IMPACT.high;
  if (/high|very high|ecosystem readiness: missing|ecosystem readiness: partial/.test(combined)) return EXPECTED_IMPACT.high;
  if (missionClass === MISSION_CLASSES.refinement || missionClass === MISSION_CLASSES.maintenance) return EXPECTED_IMPACT.low;
  return EXPECTED_IMPACT.medium;
}

function estimatedEffortForMission(tasks) {
  const categories = new Set(tasks.map((task) => task.category));
  const systems = new Set(tasks.map((task) => task.suggestedModule && task.suggestedModule.id).filter(Boolean));
  if (tasks.length >= 6 || categories.size >= 4 || systems.size >= 3) return ESTIMATED_EFFORT.large;
  if (tasks.length >= 2 || categories.size >= 2) return ESTIMATED_EFFORT.medium;
  return ESTIMATED_EFFORT.small;
}

function confidenceForMission(tasks) {
  if (tasks.some((task) => /blocked|research required/i.test(task.confidence || task.status || ""))) return CONFIDENCE_LEVELS.low;
  if (tasks.every((task) => /ready|high/i.test(task.confidence || task.status || ""))) return CONFIDENCE_LEVELS.high;
  return CONFIDENCE_LEVELS.medium;
}

function missionPriority(tasks, missionClass, expectedImpact, estimatedEffort, metroRecord) {
  const maxPriority = Math.max(...tasks.map((task) => clamp(task.priorityScore)));
  const weakMetroBoost = metroRecord && metroRecord.overallEditorialHealth.score < 68 ? 8 : 0;
  const healthyRefinementPenalty = metroRecord && metroRecord.overallEditorialHealth.score >= 80 && (missionClass === MISSION_CLASSES.refinement || missionClass === MISSION_CLASSES.maintenance) ? 18 : 0;
  const classBoost = missionClass === MISSION_CLASSES.readinessBlocker ? 12
    : missionClass === MISSION_CLASSES.foundation ? 8
      : missionClass === MISSION_CLASSES.meaningfulDepth ? 4
        : 0;
  const impactBoost = expectedImpact === EXPECTED_IMPACT.high ? 8 : expectedImpact === EXPECTED_IMPACT.medium ? 3 : 0;
  const effortPenalty = estimatedEffort === ESTIMATED_EFFORT.large ? 6 : estimatedEffort === ESTIMATED_EFFORT.medium ? 2 : 0;
  return clamp(maxPriority + weakMetroBoost + classBoost + impactBoost - effortPenalty - healthyRefinementPenalty);
}

function missionTitle(seedTask, includedTasks) {
  if (seedTask.category === "commercialEcosystem") {
    const ecosystem = seedTask.ecosystemLabel || parseEcosystemFromTitle(seedTask.title);
    const completion = includedTasks.length > 1 ? "Completion" : seedTask.title.replace(`${seedTask.metroName} `, "");
    if (includedTasks.length > 1) return `${seedTask.metroName} ${ecosystem} Ecosystem Completion`;
    return seedTask.title;
  }
  if (includedTasks.length > 1) return `${seedTask.metroName} ${seedTask.categoryLabel} Mission`;
  return seedTask.title;
}

function marketProgramForTask(task) {
  const programKey = MARKET_PROGRAM_BY_CATEGORY[task.category] || "publisher";
  return MARKET_PROGRAMS[programKey] || MARKET_PROGRAMS.publisher;
}

function initiativeForTask(task, program) {
  const ecosystem = task.ecosystemLabel || parseEcosystemFromTitle(task.title);
  const metroId = task.metroId || "unknown-market";
  const programId = program.id;
  if (programId === MARKET_PROGRAMS.buildingProfiles.id && ecosystem) {
    return {
      id: `${metroId}:${programId}:${slugify(ecosystem)}`,
      title: `${task.metroName} ${ecosystem} Building Profiles`,
      scope: ecosystem,
      ecosystem,
      ecosystemId: task.ecosystemId || "",
    };
  }
  if (programId === MARKET_PROGRAMS.publisher.id && ecosystem) {
    return {
      id: `${metroId}:${programId}:${slugify(ecosystem)}-readiness`,
      title: `${task.metroName} ${ecosystem} Readiness`,
      scope: ecosystem,
      ecosystem,
      ecosystemId: task.ecosystemId || "",
    };
  }
  if (programId === MARKET_PROGRAMS.recommendationQa.id) {
    return {
      id: `${metroId}:${programId}:recommendation-readiness`,
      title: `${task.metroName} Recommendation Readiness`,
      scope: "Recommendations",
      ecosystem: "",
      ecosystemId: "",
    };
  }
  if (programId === MARKET_PROGRAMS.knowledgeGraph.id && ecosystem) {
    return {
      id: `${metroId}:${programId}:${slugify(ecosystem)}-graph`,
      title: `${task.metroName} ${ecosystem} Knowledge Graph`,
      scope: ecosystem,
      ecosystem,
      ecosystemId: task.ecosystemId || "",
    };
  }
  return {
    id: `${metroId}:${programId}:${slugify(task.categoryLabel || task.category || "initiative")}`,
    title: `${task.metroName} ${task.categoryLabel || program.label}`,
    scope: task.categoryLabel || program.label,
    ecosystem: "",
    ecosystemId: "",
  };
}

function mergeUnique(values) {
  return Array.from(new Set((values || []).flat().filter(Boolean)));
}

function filesForMission(tasks) {
  return mergeUnique(tasks.map((task) => (task.executionPacket && task.executionPacket.files) || filesForTask(task)));
}

function qaCommandsForMission(tasks) {
  const commands = new Set();
  commands.add("node scripts/qa-eos.js");
  for (const task of tasks) {
    for (const command of ((task.executionPacket && task.executionPacket.qaCommands) || qaCommandsForTask(task))) {
      if (command === "npm run build" || command === "git diff --check") continue;
      commands.add(command);
    }
  }
  commands.add("npm run publisher:snapshot");
  commands.add("npm run build");
  commands.add("git diff --check");
  return Array.from(commands);
}

function executionPacketForMission(mission, metroRecord) {
  return {
    objective: mission.objective,
    reason: mission.reason,
    currentHealth: metroRecord && metroRecord.overallEditorialHealth ? `${metroRecord.overallEditorialHealth.score}% ${metroRecord.status.label}` : "Not available",
    currentConstraint: mission.currentConstraint,
    includedTasks: mission.includedTasks,
    deferredTasks: mission.deferredTasks,
    reasonForBundling: mission.rationale,
    expectedImpact: mission.expectedImpact,
    estimatedEffort: mission.estimatedEffort,
    missionClass: mission.missionClass,
    files: mission.relevantFiles,
    dependencies: mission.dependencies,
    acceptanceCriteria: mission.completionCriteria,
    expectedDeliverables: [
      "Completed included opportunities or explicit reclassification for each included gap",
      "Publisher and EOS snapshots regenerated",
      "Before/after evidence for each included task when available",
      "Remaining gap summary with deferred work preserved",
    ],
    qaCommands: mission.qaCommands,
    requiredReview: mission.requiredReview,
    automationLevel: mission.automationLevel,
    providers: executionProvidersFor(mission.automationLevel),
    handoff: EXECUTION_HANDOFF,
  };
}

function missionFromTasks(seedTask, tasks, deferredTasks, metroRecords) {
  const metroRecord = metroRecords.find((metro) => metro.metroId === seedTask.metroId);
  const marketProgram = marketProgramForTask(seedTask);
  const initiative = initiativeForTask(seedTask, marketProgram);
  const includedTasks = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    category: task.category,
    categoryLabel: task.categoryLabel,
    reason: (task.why || [])[0] || "",
    suggestedModule: task.suggestedModule,
  }));
  const missionClass = missionClassForTasks(tasks, metroRecord);
  const expectedImpact = expectedImpactForMission(tasks, missionClass, metroRecord);
  const estimatedEffort = estimatedEffortForMission(tasks);
  const confidence = confidenceForMission(tasks);
  const priorityScore = missionPriority(tasks, missionClass, expectedImpact, estimatedEffort, metroRecord);
  const mission = {
    id: `mission:${seedTask.metroId}:${slugify(seedTask.title)}`,
    title: missionTitle(seedTask, tasks),
    marketId: seedTask.metroId,
    marketName: seedTask.metroName,
    programId: marketProgram.id,
    programLabel: marketProgram.label,
    initiativeId: initiative.id,
    initiativeTitle: initiative.title,
    metroId: seedTask.metroId,
    metroName: seedTask.metroName,
    ecosystem: seedTask.ecosystemLabel || parseEcosystemFromTitle(seedTask.title) || "",
    ecosystemId: seedTask.ecosystemId || "",
    workstream: seedTask.categoryLabel || seedTask.category,
    includedOpportunityIds: tasks.map((task) => task.id),
    includedTasks,
    deferredTasks,
    objective: includedTasks.length > 1
      ? `Complete the related ${seedTask.metroName} ${seedTask.ecosystemLabel || seedTask.categoryLabel} opportunities as one bounded mission.`
      : seedTask.title,
    reason: [
      `${includedTasks.length} related ${includedTasks.length === 1 ? "opportunity" : "opportunities"} share metro, source, and validation paths.`,
      ...(seedTask.why || []).slice(0, 3),
    ],
    expectedImpact,
    estimatedEffort,
    impactEffortClass: `${expectedImpact} Impact / ${estimatedEffort} Effort`,
    missionClass,
    currentConstraint: (seedTask.why || [])[0] || seedTask.title,
    completionCriteria: mergeUnique(tasks.map((task) => (task.executionPacket && task.executionPacket.acceptanceCriteria) || acceptanceCriteriaForTask(task))),
    relevantFiles: filesForMission(tasks),
    dependencies: mergeUnique(tasks.map((task) => task.dependencies || [])),
    qaCommands: qaCommandsForMission(tasks),
    requiredReview: tasks.some((task) => !task.executionPacket || task.executionPacket.requiredReview),
    confidence,
    priorityScore,
    priorityStars: priorityStars(priorityScore),
    automationLevel: tasks.some((task) => task.automationLevel.id === "human_only")
      ? AUTOMATION_LEVELS.human_only
      : tasks.every((task) => task.automationLevel.id === "autonomous")
        ? AUTOMATION_LEVELS.autonomous
        : AUTOMATION_LEVELS.review_required,
    lifecycleState: tasks.some((task) => task.lifecycleState.id === TASK_STATES.blocked.id) ? TASK_STATES.blocked : TASK_STATES.ready,
    status: tasks.some((task) => task.lifecycleState.id === TASK_STATES.blocked.id) ? TASK_STATES.blocked.label : TASK_STATES.ready.label,
    queueType: QUEUES.editorial.id,
    operatingLane: tasks.some((task) => task.operatingLane.id === OPERATING_LANES.editorial.id) ? OPERATING_LANES.editorial : seedTask.operatingLane,
    category: "mission",
    categoryLabel: "Mission",
    suggestedModule: seedTask.suggestedModule,
    rationale: [
      "Bundled because the included work affects the same metro and overlapping Publisher/EOS validation path.",
      includedTasks.length > 1 ? "This avoids separate snapshot, QA, build, SER, and review cycles for tightly related gaps." : "Kept as a single mission because no safe related work should be bundled.",
      deferredTasks.length ? "Deferred work is explicit so unrelated scope does not leak into the mission." : "",
    ].filter(Boolean),
    why: [
      `Current constraint: ${(seedTask.why || [])[0] || seedTask.title}`,
      expectedImpact === EXPECTED_IMPACT.high ? "Expected impact is high based on readiness, foundation, or multi-gap evidence." : "Expected impact is bounded by current readiness evidence.",
      estimatedEffort !== ESTIMATED_EFFORT.large ? "Effort remains bounded by shared source files and validation paths." : "Effort is large because the mission includes several related tasks or systems.",
    ],
    source: {
      system: "EOS",
      includedSystems: mergeUnique(tasks.map((task) => task.source && task.source.system)),
    },
  };
  mission.executionPacket = executionPacketForMission(mission, metroRecord);
  return mission;
}

function buildMissionQueue(editorialQueue, fieldModeQueue, metroRecords) {
  const usedIds = new Set();
  const missions = [];
  const seedTasks = editorialQueue
    .filter((task) => task.lifecycleState.id !== TASK_STATES.blocked.id)
    .filter((task) => task.category === "commercialEcosystem" || task.priorityScore >= 62);

  for (const seedTask of seedTasks) {
    if (usedIds.has(seedTask.id)) continue;
    const related = seedTask.category === "commercialEcosystem"
      ? relatedTasksForSprint(seedTask, editorialQueue, usedIds)
      : editorialQueue
        .filter((task) => !usedIds.has(task.id) && task.id !== seedTask.id && task.metroId === seedTask.metroId && task.category === seedTask.category && task.lifecycleState.id !== TASK_STATES.blocked.id)
        .slice(0, 4);
    const tasks = [seedTask, ...related].slice(0, seedTask.category === "commercialEcosystem" ? 7 : 5);
    tasks.forEach((task) => usedIds.add(task.id));
    const deferred = deferredTasksForMission(seedTask, editorialQueue, fieldModeQueue, new Set(tasks.map((task) => task.id)));
    missions.push(missionFromTasks(seedTask, tasks, deferred, metroRecords));
  }

  return missions.sort((a, b) =>
    (b.priorityScore - a.priorityScore) ||
    a.metroName.localeCompare(b.metroName) ||
    a.title.localeCompare(b.title)
  );
}

function buildFieldModeQueue(metros) {
  return metros.map((metro) => {
    const districtTargets = Math.min(metro.counts.districts || 0, 12);
    const buildingTargets = Math.min(metro.counts.representativeBuildings || 0, 24);
    const remainingTargets = Math.max(1, 1 + districtTargets + buildingTargets);
    const score = metro.photographyCoverage ? metro.photographyCoverage.score : 0;
    return {
      id: `field-mode-summary:${metro.metroId}`,
      metroId: metro.metroId,
      metroName: metro.metroName,
      title: `${metro.metroName} Photography Coverage`,
      coverageScore: score,
      coverageLabel: pctSafe(score),
      remainingTargets,
      status: score >= 70 ? "Improving" : "Open",
      suggestedModule: { id: "fieldMode", label: MODULES.fieldMode },
      actionLabel: "Open Field Mode",
      why: [
        "Photography is managed in Field Mode rather than the Editorial Queue.",
        "EOS summarizes visual coverage so field work can be planned without flooding the main queue.",
      ],
    };
  }).sort((a, b) => (a.coverageScore - b.coverageScore) || b.remainingTargets - a.remainingTargets);
}

function pctSafe(value) {
  return `${clamp(value)}%`;
}

function projectFromSeed(seed) {
  const score = investmentScore(seed);
  const currentStageIndex = stageIndex(seed.status);
  return {
    id: `expansion:${seed.metroId}`,
    metroId: seed.metroId,
    metroName: seed.metroName,
    state: seed.state || "",
    status: seed.status,
    statusLabel: (EXPANSION_STAGES[currentStageIndex] || EXPANSION_STAGES[0]).label,
    overallProgress: expansionProgress(seed.status),
    investmentScore: {
      score,
      label: `${score}/100`,
      inputs: {
        searchOpportunity: clamp(seed.searchOpportunity),
        editorialLeverage: clamp(seed.editorialLeverage),
        buildEffort: clamp(seed.buildEffort),
        existingFoundation: clamp(seed.existingFoundation),
        automationPotential: clamp(seed.automationPotential),
        brokerCoverage: clamp(seed.brokerCoverage),
      },
      rationale: [
        seed.rationale,
        "Investment Score is a planning model; no external Search Console, analytics, or broker-performance data is connected yet.",
      ],
    },
    stages: EXPANSION_STAGES.map((stage) => ({
      ...stage,
      status: expansionStageStatus(seed.status, stage),
    })),
    workstreams: expansionWorkstreams(seed.status),
    nextAction: currentStageIndex >= EXPANSION_STAGES.length - 1
      ? "Monitor live market coverage."
      : seed.status === "publishing_ready"
        ? "Complete final publishing review before Live."
        : `Advance to ${EXPANSION_STAGES[currentStageIndex + 1].label}.`,
    suggestedModule: { id: "publisher", label: MODULES.publisher },
  };
}

function isCompletedQaStatus(qaStatus) {
  if (!qaStatus) return false;
  const status = String(qaStatus.qaStatus || qaStatus.status || "").toLowerCase();
  return status === "completed" || status === "complete";
}

function developmentMetroExpansionStage(metro) {
  const districtCount = Number(metro.districtCount || 0);
  const representativeBuildingCount = Number(metro.representativeBuildingCount || 0);
  const buildingBriefCount = Number(metro.buildingBriefCount || 0);
  const readinessStatus = String(metro.readinessStatus || "").toLowerCase();
  const compassStatus = String(metro.compassStatus || "").toLowerCase();
  const hasCompletedQa = isCompletedQaStatus(metro.qaStatus);

  if (readinessStatus.includes("distribution ready") && compassStatus === "ready" && hasCompletedQa) return "publishing_ready";
  if (hasCompletedQa) return "qa";
  if (compassStatus === "ready") return "compass";
  if (districtCount && representativeBuildingCount && buildingBriefCount) return "recommendations";
  if (buildingBriefCount) return "editorial_draft";
  if (representativeBuildingCount) return "representative_buildings";
  if (districtCount) return "knowledge_graph";
  return "research";
}

function developmentMetroBuildEffort(stage) {
  const index = stageIndex(stage);
  if (index >= stageIndex("qa")) return 38;
  if (index >= stageIndex("recommendations")) return 46;
  if (index >= stageIndex("representative_buildings")) return 54;
  if (index >= stageIndex("knowledge_graph")) return 60;
  return 72;
}

function projectFromDevelopmentMetro(metro) {
  const status = developmentMetroExpansionStage(metro);
  return projectFromSeed({
    metroId: metro.metroId,
    metroName: metro.metroName,
    state: "",
    status,
    rationale: `${metro.metroName} is configured as an in-development Publisher metro and should be tracked as an expansion project.`,
    searchOpportunity: 60,
    editorialLeverage: 100 - (metro.score || 0),
    buildEffort: developmentMetroBuildEffort(status),
    existingFoundation: metro.score || 0,
    automationPotential: 50,
    brokerCoverage: 35,
  });
}

function buildExpansionProjects(publisherAnalysis) {
  const projects = [];
  const seen = new Set();
  for (const metro of publisherAnalysis.inDevelopmentMetros || []) {
    const project = projectFromDevelopmentMetro(metro);
    projects.push(project);
    seen.add(project.metroId);
  }
  for (const seed of EXPANSION_PROJECT_SEEDS) {
    if (seen.has(seed.metroId)) continue;
    projects.push(projectFromSeed(seed));
    seen.add(seed.metroId);
  }
  return projects.sort((a, b) => b.investmentScore.score - a.investmentScore.score || a.metroName.localeCompare(b.metroName));
}

function buildExpansionQueue(expansionProjects) {
  return expansionProjects.map((project) => ({
    id: `expansion-queue:${project.metroId}`,
    projectId: project.id,
    metroId: project.metroId,
    metroName: project.metroName,
    title: `Build ${project.metroName}`,
    priorityScore: project.investmentScore.score,
    priorityStars: priorityStars(project.investmentScore.score),
    status: project.statusLabel,
    lifecycleState: TASK_STATES.open,
    automationLevel: AUTOMATION_LEVELS.review_required,
    estimatedEffort: "Multi-stage",
    expectedEditorialImpact: project.investmentScore.score >= 70 ? "Very High" : "High",
    dependencies: ["Expansion project stage gates", "Publisher and Compass readiness prerequisites"],
    confidence: project.status === "candidate" ? "Review Required" : "Ready",
    category: "expansion",
    categoryLabel: "Expansion",
    queueType: QUEUES.expansion.id,
    operatingLane: OPERATING_LANES.engineering,
    suggestedModule: project.suggestedModule,
    why: project.investmentScore.rationale,
    executionPacket: {
      objective: `Advance ${project.metroName} expansion from ${project.statusLabel}`,
      reason: project.investmentScore.rationale,
      currentHealth: `${project.overallProgress}% expansion progress`,
      files: ["docs/recommendation-expansion-roadmap.md", "_data/locationKnowledgeGraph.js", "data/publisher-rules.js"],
      dependencies: ["Expansion research", "Knowledge Graph scope", "Representative Building foundation", "Compass QA"],
      acceptanceCriteria: [
        "The next expansion stage has clear evidence and owner-ready deliverables.",
        "Publisher and Compass responsibilities remain separated.",
        "No live metro status is promoted without QA.",
      ],
      expectedDeliverables: ["Updated expansion project stage", "Implementation summary", "Remaining blockers"],
      qaCommands: ["npm run build", "node scripts/qa-eos.js", "node scripts/qa-publisher-expansion-planner.js", "git diff --check"],
      requiredReview: true,
      automationLevel: AUTOMATION_LEVELS.review_required,
      providers: [EXECUTION_PROVIDERS.manual, EXECUTION_PROVIDERS.codex],
      handoff: EXECUTION_HANDOFF,
    },
  }));
}

function buildPortfolioQueues(workQueue, metros, expansionProjects) {
  const editorialQueue = workQueue.filter((item) => item.queueType === QUEUES.editorial.id);
  const fieldModeQueue = buildFieldModeQueue(metros);
  const expansionQueue = buildExpansionQueue(expansionProjects);
  const reviewQueue = workQueue.filter((item) => item.lifecycleState && item.lifecycleState.id === TASK_STATES.ready_for_review.id);
  const missionQueue = buildMissionQueue(editorialQueue, fieldModeQueue, metros);
  const todaysRecommendedWork = missionQueue
    .filter((item) => item.lifecycleState.id !== TASK_STATES.blocked.id)
    .slice(0, 8);
  return {
    todaysRecommendedWork,
    missionQueue,
    editorialQueue,
    expansionQueue,
    fieldModeQueue,
    reviewQueue,
    opportunityInventory: {
      total: editorialQueue.length,
      missions: missionQueue.length,
      byQueue: {
        editorial: editorialQueue.length,
        missions: missionQueue.length,
        expansion: expansionQueue.length,
        fieldMode: fieldModeQueue.length,
        review: reviewQueue.length,
      },
      hiddenFromHomepage: Math.max(editorialQueue.length - todaysRecommendedWork.reduce((total, mission) => total + (mission.includedOpportunityIds || []).length, 0), 0),
    },
  };
}

function commercialMarketEvidenceMissionForDistrict(district, metro, rank) {
  const districtId = district.districtId || "";
  const districtName = district.districtName || "District";
  const marketId = district.metroId || metro.metroId;
  const marketName = district.metroName || metro.metroName;
  const initiativeId = `${marketId}:${MARKET_PROGRAMS.commercialMarketEvidence.id}:${districtId}`;
  const missionId = `mission:${marketId}:commercial-market-evidence:${districtId}`;
  const sourcePath = `data/commercial-market-evidence/${marketId}/${districtId}.js`;
  const mission = {
    id: missionId,
    title: `Build the ${districtName} Commercial Market Evidence collection`,
    marketId,
    marketName,
    programId: MARKET_PROGRAMS.commercialMarketEvidence.id,
    programLabel: MARKET_PROGRAMS.commercialMarketEvidence.label,
    initiativeId,
    initiativeTitle: `${districtName} Collection`,
    metroId: marketId,
    metroName: marketName,
    ecosystem: district.signals && district.signals.recommendationSignals ? district.signals.recommendationSignals.join(", ") : "",
    ecosystemId: "",
    workstream: "Commercial Market Evidence",
    includedOpportunityIds: [`commercial-market-evidence:${districtId}`],
    includedTasks: [
      {
        id: `commercial-market-evidence:${districtId}:collection`,
        title: `${districtName} Commercial Market Evidence collection`,
        category: "commercialMarketEvidence",
        categoryLabel: "Commercial Market Evidence",
        reason: "District is missing a Commercial Market Evidence collection.",
        suggestedModule: { id: "commercialMarketEvidence", label: MARKET_PROGRAMS.commercialMarketEvidence.label },
      },
    ],
    deferredTasks: [
      {
        id: `commercial-market-evidence:${districtId}:quality-scoring`,
        title: "Publisher quality scoring for Commercial Market Evidence",
        reason: "Quality measurement remains deferred; this mission creates the source collection and passes the validator.",
        suggestedModule: { id: "publisher", label: MODULES.publisher },
      },
    ],
    objective: `Create the ${districtName} Commercial Market Evidence source-data collection for ${marketName}.`,
    reason: [
      `${districtName} is missing a Commercial Market Evidence collection.`,
      district.signals && district.signals.publisherReadiness ? `Publisher readiness: ${district.signals.publisherReadiness}.` : "",
      district.signals && district.signals.publicPage === "Yes" ? "Public district page exists." : "",
      district.signals && district.signals.districtConfidence ? `Knowledge Graph confidence: ${district.signals.districtConfidence}.` : "",
      district.signals && district.signals.representativeBuildings ? `${district.signals.representativeBuildings} representative building relationships exist.` : "",
      district.signals && district.signals.comparisonRelationships ? `${district.signals.comparisonRelationships} comparison relationships exist.` : "",
    ].filter(Boolean),
    expectedImpact: EXPECTED_IMPACT.medium,
    estimatedEffort: ESTIMATED_EFFORT.medium,
    impactEffortClass: `${EXPECTED_IMPACT.medium} Impact / ${ESTIMATED_EFFORT.medium} Effort`,
    missionClass: MISSION_CLASSES.foundation,
    currentConstraint: `${districtName} lacks a Commercial Market Evidence collection.`,
    completionCriteria: [
      "A new district Commercial Market Evidence source collection exists in the canonical data path.",
      "The collection follows the Financial District reference implementation and Commercial Market Evidence architecture.",
      "Evidence records remain source-supported, confidence-scoped, and editorially bounded.",
      "The Commercial Market Evidence validator passes.",
      "Publisher scoring, recommendation rankings, public URLs, and Mission Control planning logic remain unchanged.",
    ],
    relevantFiles: [
      "docs/product/rofo-master-plan.md",
      "docs/commercial-market-evidence.md",
      "docs/commercial-market-evidence-financial-district.md",
      "docs/rofo-publisher.md",
      "_data/locationKnowledgeGraph.js",
      "_data/commercialMarketEvidence.js",
      "data/commercial-market-evidence/san-francisco/financial-district.js",
      sourcePath,
      "scripts/qa-commercial-market-evidence.js",
    ],
    dependencies: [
      "Commercial Market Evidence architecture",
      "Financial District canonical collection",
      "Knowledge Graph district identity",
      "Representative building and public-source evidence",
    ],
    qaCommands: [
      "node scripts/qa-commercial-market-evidence.js",
      "node scripts/qa-eos.js",
      "npm run publisher:snapshot",
      "npm run build",
      "git diff --check",
    ],
    requiredReview: true,
    confidence: CONFIDENCE_LEVELS.medium,
    priorityScore: clamp(82 - Math.max(0, rank - 1)),
    priorityStars: priorityStars(82 - Math.max(0, rank - 1)),
    automationLevel: AUTOMATION_LEVELS.review_required,
    lifecycleState: TASK_STATES.ready,
    status: TASK_STATES.ready.label,
    queueType: QUEUES.editorial.id,
    operatingLane: OPERATING_LANES.editorial,
    category: "mission",
    categoryLabel: "Mission",
    suggestedModule: { id: "commercialMarketEvidence", label: MARKET_PROGRAMS.commercialMarketEvidence.label },
    rationale: [
      "Commercial Market Evidence collections are executed as one district-level Mission.",
      "Individual evidence records, district narrative, source research, and validator fixes remain hidden Work Items inside the packet.",
      "Ordering is inherited from deterministic Commercial Market Evidence expansion signals.",
    ],
    why: [
      `Current constraint: ${districtName} lacks a Commercial Market Evidence collection.`,
      "The district is present in the Knowledge Graph and missing from the Market Evidence registry.",
      "One collection mission avoids separate top-level tasks for each evidence record.",
    ],
    source: {
      system: "EOS",
      includedSystems: ["Commercial Market Evidence", "Commercial Location Knowledge Graph", "Publisher"],
    },
    orderingRank: rank,
    orderingRationale: district.rationale || [],
    workItems: {
      hiddenByDefault: true,
      count: 6,
      labels: [
        "Inspect Commercial Market Evidence architecture.",
        "Inspect Financial District canonical collection.",
        "Inspect district Knowledge Graph and representative-building sources.",
        "Research and select bounded representative evidence.",
        "Create source-data collection with provenance and confidence.",
        "Run Commercial Market Evidence validator.",
      ],
    },
  };
  mission.executionPacket = {
    objective: mission.objective,
    reason: mission.reason,
    currentHealth: metro && metro.overallEditorialHealth ? `${metro.overallEditorialHealth.score}% ${metro.status.label}` : "Not available",
    currentConstraint: mission.currentConstraint,
    includedTasks: mission.includedTasks,
    deferredTasks: mission.deferredTasks,
    reasonForBundling: mission.rationale,
    expectedImpact: mission.expectedImpact,
    estimatedEffort: mission.estimatedEffort,
    missionClass: mission.missionClass,
    files: mission.relevantFiles,
    dependencies: mission.dependencies,
    acceptanceCriteria: mission.completionCriteria,
    expectedDeliverables: [
      "Commercial Market Evidence source-data collection",
      "Validator pass result",
      "Documentation updates only where needed",
      "SER v1 implementation report",
    ],
    qaCommands: mission.qaCommands,
    requiredReview: mission.requiredReview,
    automationLevel: mission.automationLevel,
    providers: executionProvidersFor(mission.automationLevel),
    handoff: EXECUTION_HANDOFF,
  };
  return mission;
}

function buildCommercialMarketEvidenceMissions(metros, platformServices) {
  const expansion = platformServices && platformServices.commercialMarketEvidence
    ? platformServices.commercialMarketEvidence.expansion
    : null;
  const suggested = (expansion && expansion.suggestedExpansionOrder) || [];
  const missions = [];
  for (const metro of metros || []) {
    const nextDistrict = suggested.find((district) => district.metroId === metro.metroId);
    if (!nextDistrict) continue;
    missions.push(commercialMarketEvidenceMissionForDistrict(nextDistrict, metro, nextDistrict.rank || missions.length + 1));
  }
  return missions;
}

function attachProgramMissions(portfolioQueues, programMissions) {
  if (!programMissions.length) return portfolioQueues;
  const missionQueue = (portfolioQueues.missionQueue || [])
    .concat(programMissions)
    .sort((a, b) =>
      (b.priorityScore - a.priorityScore) ||
      a.marketName.localeCompare(b.marketName) ||
      a.title.localeCompare(b.title)
    );
  const todaysRecommendedWork = missionQueue
    .filter((item) => item.lifecycleState.id !== TASK_STATES.blocked.id)
    .slice(0, 8);
  return {
    ...portfolioQueues,
    missionQueue,
    todaysRecommendedWork,
    opportunityInventory: {
      ...portfolioQueues.opportunityInventory,
      missions: missionQueue.length,
      programMissions: programMissions.length,
      hiddenFromHomepage: Math.max((portfolioQueues.opportunityInventory && portfolioQueues.opportunityInventory.total) || 0, 0),
      byQueue: {
        ...((portfolioQueues.opportunityInventory && portfolioQueues.opportunityInventory.byQueue) || {}),
        missions: missionQueue.length,
        programMissions: programMissions.length,
      },
    },
  };
}

function progressLabel(completed, target, unit, fallback) {
  if (Number.isFinite(completed) && Number.isFinite(target) && target > 0) {
    return `${completed} / ${target} ${unit}`;
  }
  return fallback || "Measured by source system";
}

function programStatusFromScore(score) {
  return readinessLabelFromScore(score);
}

function commercialMarketEvidenceProgress(metro, marketEvidenceExpansion) {
  const existing = ((marketEvidenceExpansion && marketEvidenceExpansion.existingCollections) || [])
    .filter((collection) => collection.metroId === metro.metroId).length;
  const missing = ((marketEvidenceExpansion && marketEvidenceExpansion.missingCollections) || [])
    .filter((collection) => collection.metroId === metro.metroId).length;
  const target = existing + missing;
  return {
    unit: "Collections",
    completed: existing,
    target,
    label: progressLabel(existing, target, "Collections", existing ? `${existing} Collections` : "No Market Evidence collections"),
    statusLabel: target && existing === target ? "Complete" : existing ? "Partial" : "Missing",
    currentConstraint: missing ? `${missing} district collections remain unbuilt.` : "Commercial Market Evidence collections exist for all tracked Knowledge Graph districts.",
    sourceEvidence: [
      "Commercial Market Evidence collection registry.",
      "Commercial Location Knowledge Graph district nodes.",
    ],
  };
}

function buildingProfileProgress(metro) {
  const completed = metro.counts ? Number(metro.counts.buildingBriefs || 0) : 0;
  const target = metro.counts ? Number(metro.counts.representativeBuildings || 0) : 0;
  return {
    unit: "Profiles",
    completed,
    target,
    label: progressLabel(completed, target, "Profiles", `${completed} Building Profiles`),
    statusLabel: programStatusFromScore(metro.editorialCoverage ? metro.editorialCoverage.score : completed ? 55 : 0),
    currentConstraint: target && completed < target
      ? `${Math.max(target - completed, 0)} representative buildings do not yet have Building Profiles.`
      : "Representative Building Profile coverage is currently aligned with Publisher evidence.",
    sourceEvidence: ["Publisher representative building and Building Brief counts."],
  };
}

function photographyProgress(metro, fieldModeItem) {
  const score = fieldModeItem ? fieldModeItem.coverageScore : metro.photographyCoverage ? metro.photographyCoverage.score : 0;
  return {
    unit: "Locations",
    completed: null,
    target: fieldModeItem ? fieldModeItem.remainingTargets : null,
    label: fieldModeItem ? `${fieldModeItem.coverageLabel}; ${fieldModeItem.remainingTargets} Remaining Targets` : pctSafe(score),
    statusLabel: programStatusFromScore(score),
    currentConstraint: fieldModeItem ? `${fieldModeItem.remainingTargets} Field Mode targets remain.` : "Runtime Field Mode photo counts are not connected to EOS yet.",
    sourceEvidence: ["EOS Field Mode coverage summary."],
  };
}

function recommendationQaProgress(metro) {
  const score = metro.recommendationCoverage ? metro.recommendationCoverage.score : 0;
  return {
    unit: "Readiness",
    completed: null,
    target: null,
    label: metro.recommendationCoverage ? `${metro.recommendationCoverage.score}% Recommendation Coverage` : "Recommendation coverage unavailable",
    statusLabel: programStatusFromScore(score),
    currentConstraint: metro.recommendationCoverage && metro.recommendationCoverage.note
      ? metro.recommendationCoverage.note
      : "Recommendation QA evidence is measured by Compass and Publisher.",
    sourceEvidence: ["Compass readiness and recommendation QA status."],
  };
}

function knowledgeGraphProgress(metro) {
  const districtScore = metro.healthSignals && metro.healthSignals.districtCoverage ? metro.healthSignals.districtCoverage.score : 0;
  const linkScore = metro.internalLinking ? metro.internalLinking.score : 0;
  const score = clamp((districtScore + linkScore) / 2);
  return {
    unit: "Coverage",
    completed: null,
    target: null,
    label: `${score}% Knowledge Graph Coverage`,
    statusLabel: programStatusFromScore(score),
    currentConstraint: metro.healthSignals && metro.healthSignals.districtCoverage
      ? metro.healthSignals.districtCoverage.note
      : "Knowledge Graph coverage is measured through Publisher district and linking evidence.",
    sourceEvidence: ["District coverage score.", "Internal linking score."],
  };
}

function publisherProgress(metro) {
  const score = metro.publisherConfidence ? metro.publisherConfidence.score : 0;
  return {
    unit: "Readiness",
    completed: null,
    target: null,
    label: `${score}% Publisher Confidence`,
    statusLabel: metro.source && metro.source.publisherStatus ? metro.source.publisherStatus : programStatusFromScore(score),
    currentConstraint: metro.overallEditorialHealth && Array.isArray(metro.overallEditorialHealth.rationale) && metro.overallEditorialHealth.rationale.length
      ? metro.overallEditorialHealth.rationale[0]
      : "Publisher does not expose a stronger current constraint.",
    sourceEvidence: ["Publisher score.", "Publisher readiness status.", "EOS health signals."],
  };
}

function programProgressForMarket(program, metro, fieldModeItem, marketEvidenceExpansion) {
  if (program.id === MARKET_PROGRAMS.commercialMarketEvidence.id) return commercialMarketEvidenceProgress(metro, marketEvidenceExpansion);
  if (program.id === MARKET_PROGRAMS.buildingProfiles.id) return buildingProfileProgress(metro);
  if (program.id === MARKET_PROGRAMS.photography.id) return photographyProgress(metro, fieldModeItem);
  if (program.id === MARKET_PROGRAMS.recommendationQa.id) return recommendationQaProgress(metro);
  if (program.id === MARKET_PROGRAMS.knowledgeGraph.id) return knowledgeGraphProgress(metro);
  return publisherProgress(metro);
}

function missionProjection(mission) {
  return {
    id: mission.id,
    title: mission.title,
    marketId: mission.marketId,
    marketName: mission.marketName,
    programId: mission.programId,
    programLabel: mission.programLabel,
    initiativeId: mission.initiativeId,
    initiativeTitle: mission.initiativeTitle,
    objective: mission.objective,
    currentConstraint: mission.currentConstraint,
    expectedImpact: mission.expectedImpact,
    estimatedEffort: mission.estimatedEffort,
    missionClass: mission.missionClass,
    confidence: mission.confidence,
    priorityScore: mission.priorityScore,
    executionPacketRef: `portfolioQueues.missionQueue:${mission.id}`,
    executionPacketAvailable: Boolean(mission.executionPacket),
    workItems: {
      hiddenByDefault: true,
      count: (mission.includedOpportunityIds || []).length,
      includedOpportunityIds: mission.includedOpportunityIds || [],
      deferredWorkItemIds: (mission.deferredTasks || []).map((task) => task.id),
    },
  };
}

function statusInitiativeForProgram(metro, program, progress) {
  const initiativeId = `${metro.metroId}:${program.id}:status`;
  return {
    id: initiativeId,
    marketId: metro.metroId,
    marketName: metro.metroName,
    programId: program.id,
    programLabel: program.label,
    title: `${metro.metroName} ${program.label}`,
    scope: metro.metroName,
    objective: `Track ${program.label} progress for ${metro.metroName}.`,
    currentStage: progress.statusLabel,
    progress,
    currentConstraint: progress.currentConstraint,
    nextMissionId: "",
    remainingMilestones: progress.currentConstraint ? [progress.currentConstraint] : [],
    confidence: progress.statusLabel === "Missing" ? CONFIDENCE_LEVELS.low : CONFIDENCE_LEVELS.medium,
    sourceEvidence: progress.sourceEvidence || [],
    readOnly: true,
    missions: [],
  };
}

function commercialMarketEvidenceInitiativesForMarket(metro, progress, marketEvidenceExpansion, missions) {
  const existing = ((marketEvidenceExpansion && marketEvidenceExpansion.existingCollections) || [])
    .filter((collection) => collection.metroId === metro.metroId)
    .map((collection) => ({
      id: `${metro.metroId}:${MARKET_PROGRAMS.commercialMarketEvidence.id}:${collection.districtId}`,
      marketId: metro.metroId,
      marketName: metro.metroName,
      programId: MARKET_PROGRAMS.commercialMarketEvidence.id,
      programLabel: MARKET_PROGRAMS.commercialMarketEvidence.label,
      title: `${collection.districtName} Collection`,
      scope: collection.districtName,
      objective: `Maintain the completed ${collection.districtName} Commercial Market Evidence collection.`,
      status: "Complete",
      currentStage: "Complete",
      progress: {
        unit: "Collection",
        completed: 1,
        target: 1,
        label: "Complete",
        statusLabel: "Complete",
        sourceEvidence: ["Commercial Market Evidence collection registry."],
      },
      currentConstraint: "Collection exists.",
      nextMissionId: "",
      remainingMilestones: [],
      confidence: CONFIDENCE_LEVELS.high,
      sourceEvidence: ["Commercial Market Evidence collection registry."],
      readOnly: true,
      completionEvidence: collection.collectionId,
      orderingRank: null,
      orderingRationale: ["Existing Commercial Market Evidence collection."],
      workItems: { hiddenByDefault: true, count: 0 },
      missions: [],
    }));

  const missing = ((marketEvidenceExpansion && marketEvidenceExpansion.suggestedExpansionOrder) || [])
    .filter((district) => district.metroId === metro.metroId)
    .map((district, index) => {
      const mission = missions.find((item) => item.initiativeId === `${metro.metroId}:${MARKET_PROGRAMS.commercialMarketEvidence.id}:${district.districtId}`);
      const status = index === 0 ? "Next" : index <= 3 ? "Queued" : "Not currently prioritized";
      return {
        id: `${metro.metroId}:${MARKET_PROGRAMS.commercialMarketEvidence.id}:${district.districtId}`,
        marketId: metro.metroId,
        marketName: metro.metroName,
        programId: MARKET_PROGRAMS.commercialMarketEvidence.id,
        programLabel: MARKET_PROGRAMS.commercialMarketEvidence.label,
        title: `${district.districtName} Collection`,
        scope: district.districtName,
        objective: `Create the ${district.districtName} Commercial Market Evidence source-data collection.`,
        status,
        currentStage: status,
        progress: {
          unit: "Collection",
          completed: 0,
          target: 1,
          label: status,
          statusLabel: status,
          sourceEvidence: ["Commercial Market Evidence expansion ordering."],
        },
        currentConstraint: `${district.districtName} lacks a Commercial Market Evidence collection.`,
        nextMissionId: mission ? mission.id : "",
        missionRef: mission ? `portfolioQueues.missionQueue:${mission.id}` : "",
        executionPacketRef: mission ? `portfolioQueues.missionQueue:${mission.id}` : "",
        workItemCount: mission && mission.workItems ? mission.workItems.count : 0,
        remainingMilestones: ["Source-supported evidence selection", "District narrative", "Validator pass"],
        confidence: CONFIDENCE_LEVELS.medium,
        sourceEvidence: ["Commercial Location Knowledge Graph district node.", "Commercial Market Evidence expansion ordering."],
        readOnly: !mission,
        orderingRank: district.rank || index + 1,
        orderingRationale: district.rationale || [],
        workItems: {
          hiddenByDefault: true,
          count: mission && mission.workItems ? mission.workItems.count : 0,
        },
        missions: mission ? [missionProjection(mission)] : [],
      };
    });

  const initiatives = existing.concat(missing);
  if (!initiatives.length) return [statusInitiativeForProgram(metro, MARKET_PROGRAMS.commercialMarketEvidence, progress)];
  return initiatives.sort((a, b) => {
    const order = { Next: 0, Queued: 1, Complete: 2, "Not currently prioritized": 3 };
    return (order[a.status] - order[b.status]) ||
      (Number(a.orderingRank || 9999) - Number(b.orderingRank || 9999)) ||
      a.title.localeCompare(b.title);
  });
}

function buildInitiativesForProgram(metro, program, missions, progress) {
  const initiativesById = new Map();
  for (const mission of missions) {
    if (!initiativesById.has(mission.initiativeId)) {
      initiativesById.set(mission.initiativeId, {
        id: mission.initiativeId,
        marketId: metro.metroId,
        marketName: metro.metroName,
        programId: program.id,
        programLabel: program.label,
        title: mission.initiativeTitle,
        scope: mission.ecosystem || mission.workstream || program.label,
        objective: mission.objective,
        currentStage: "Next Mission Ready",
        progress: {
          unit: "Missions",
          completed: 0,
          target: missions.filter((item) => item.initiativeId === mission.initiativeId).length,
          label: `${missions.filter((item) => item.initiativeId === mission.initiativeId).length} Active Mission${missions.filter((item) => item.initiativeId === mission.initiativeId).length === 1 ? "" : "s"}`,
          statusLabel: "Active",
          sourceEvidence: ["EOS mission queue."],
        },
        currentConstraint: mission.currentConstraint,
        nextMissionId: mission.id,
        remainingMilestones: [mission.currentConstraint],
        confidence: mission.confidence,
        sourceEvidence: ["EOS mission bundling.", "Publisher queue evidence."],
        readOnly: false,
        missions: [],
      });
    }
    initiativesById.get(mission.initiativeId).missions.push(missionProjection(mission));
  }

  const initiatives = Array.from(initiativesById.values());
  if (!initiatives.length || program.id === MARKET_PROGRAMS.commercialMarketEvidence.id || program.id === MARKET_PROGRAMS.photography.id) {
    initiatives.push(statusInitiativeForProgram(metro, program, progress));
  }
  return initiatives;
}

function buildMarketProjection(metros, portfolioQueues, platformServices) {
  const missionQueue = portfolioQueues.missionQueue || [];
  const fieldModeByMetro = new Map((portfolioQueues.fieldModeQueue || []).map((item) => [item.metroId, item]));
  const marketEvidenceExpansion = platformServices && platformServices.commercialMarketEvidence
    ? platformServices.commercialMarketEvidence.expansion
    : null;
  const flatInitiatives = [];
  const flatMissions = [];

  const markets = (metros || []).map((metro) => {
    const programs = Object.values(MARKET_PROGRAMS).map((program) => {
      const missions = missionQueue.filter((mission) => mission.marketId === metro.metroId && mission.programId === program.id);
      const progress = programProgressForMarket(program, metro, fieldModeByMetro.get(metro.metroId), marketEvidenceExpansion);
      const initiatives = program.id === MARKET_PROGRAMS.commercialMarketEvidence.id
        ? commercialMarketEvidenceInitiativesForMarket(metro, progress, marketEvidenceExpansion, missions)
        : buildInitiativesForProgram(metro, program, missions, progress);
      initiatives.forEach((initiative) => flatInitiatives.push({
        ...initiative,
        missions: initiative.missions.map((mission) => mission.id),
      }));
      missions.forEach((mission) => flatMissions.push(missionProjection(mission)));
      const nextMission = missions[0] || null;
      return {
        ...program,
        marketId: metro.metroId,
        marketName: metro.metroName,
        status: progress.statusLabel,
        progress,
        currentConstraint: nextMission ? nextMission.currentConstraint : progress.currentConstraint,
        nextInitiativeId: nextMission ? nextMission.initiativeId : initiatives[0] ? initiatives[0].id : "",
        nextMissionId: nextMission ? nextMission.id : "",
        initiatives,
      };
    });
    const nextMissions = missionQueue
      .filter((mission) => mission.marketId === metro.metroId)
      .slice(0, 3)
      .map((mission) => missionProjection(mission));
    return {
      id: metro.metroId,
      label: metro.metroName,
      status: metro.status,
      overallEditorialHealth: metro.overallEditorialHealth,
      knowledgeReadiness: metro.knowledgeReadiness,
      experienceReadiness: metro.experienceReadiness,
      programs,
      nextMissions,
    };
  });

  return {
    schemaVersion: MARKET_PROJECTION_SCHEMA_VERSION,
    hierarchy: ["Markets", "Programs", "Initiatives", "Missions", "Execution Packets", "Work Items"],
    sourceSystems: ["Publisher", "Commercial Market Evidence", "Commercial Knowledge Graph", "Field Mode", "Compass", "EOS"],
    ownership: {
      publisher: "Determines readiness and constraints.",
      commercialMarketEvidence: "Owns evidence collections and validation.",
      buildingProfiles: "Own public Building Profile content and Building Brief architecture.",
      eos: "Projects work into markets, programs, initiatives, and missions.",
      missionControl: "Will render this projection in a future UI sprint.",
    },
    programs: Object.values(MARKET_PROGRAMS),
    markets,
    initiatives: flatInitiatives,
    missions: flatMissions,
    workItems: {
      hiddenByDefault: true,
      count: (portfolioQueues.editorialQueue || []).length,
      note: "Work items remain evidence used to form missions and are not the primary Mission Control v2 planning object.",
    },
    summary: {
      markets: markets.length,
      programsPerMarket: Object.values(MARKET_PROGRAMS).length,
      initiatives: flatInitiatives.length,
      missions: flatMissions.length,
    },
    note: "Additive projection for Mission Control v2. It does not change Publisher scoring, mission generation, execution packets, or the current Mission Control UI.",
  };
}

function overview(metros, workQueue, portfolioQueues, expansionProjects) {
  const averageHealth = metros.length ? clamp(metros.reduce((total, metro) => total + metro.overallEditorialHealth.score, 0) / metros.length) : 0;
  const needsAttention = metros.filter((metro) => ["needs_attention", "planning", "research"].includes(metro.status.id)).length;
  const humanOnly = portfolioQueues.fieldModeQueue.length;
  const autonomousReady = portfolioQueues.editorialQueue.filter((item) => item.automationLevel.id === "autonomous").length;
  return {
    metroCount: metros.length,
    averageHealth,
    needsAttention,
    activeWorkItems: portfolioQueues.todaysRecommendedWork.length,
    opportunityInventory: portfolioQueues.opportunityInventory.total,
    expansionProjects: expansionProjects.length,
    reviewItems: portfolioQueues.reviewQueue.length,
    fieldModeMetros: portfolioQueues.fieldModeQueue.length,
    openWorkItems: portfolioQueues.opportunityInventory.total,
    humanOnlyWorkItems: humanOnly,
    autonomousCandidates: autonomousReady,
    topWorkItem: portfolioQueues.todaysRecommendedWork[0] ? portfolioQueues.todaysRecommendedWork[0].title : "No mission queued",
  };
}

function collectionDistrictId(collection) {
  return collection && collection.district && collection.district.districtId
    ? collection.district.districtId
    : "";
}

function metroForDistrict(district, publisherAnalysis) {
  const districtPath = String(district.path || "");
  const districtCity = String(district.city || "").toLowerCase();
  const districtState = String(district.state || "");
  const configuredMetro = (publisherRules.metros || []).find((metro) =>
    String(metro.state || "") === districtState &&
    (metro.cities || []).some((city) => String(city).toLowerCase() === districtCity)
  );
  if (configuredMetro) {
    const publisherMetro = (publisherAnalysis.metros || []).find((metro) => metro.metroId === configuredMetro.id);
    if (publisherMetro) return publisherMetro;
  }
  return (publisherAnalysis.metros || []).find((metro) => {
    if (metro.cityPath && districtPath.startsWith(metro.cityPath)) return true;
    const metroName = String(metro.metroName || "").toLowerCase();
    return metroName === districtCity;
  }) || null;
}

function districtExpansionSignals(district, metro) {
  const representativeBuildings = Array.isArray(district.representativeBuildings) ? district.representativeBuildings.length : 0;
  const relationships = district.relationships && Array.isArray(district.relationships.compareWith)
    ? district.relationships.compareWith.length
    : 0;
  return {
    publisherReadiness: metro ? metro.readinessStatus || "" : "Unassigned metro",
    publisherScore: metro ? metro.score || 0 : 0,
    districtConfidence: district.confidence || "",
    publicPage: district.path ? "Yes" : "No",
    representativeBuildings,
    comparisonRelationships: relationships,
    recommendationSignals: [
      district.spaceTypeFit && Object.keys(district.spaceTypeFit).length ? "space type fit" : "",
      Array.isArray(district.bestFor) && district.bestFor.length ? "best fit" : "",
      Array.isArray(district.questionsToValidate) && district.questionsToValidate.length ? "validation questions" : "",
    ].filter(Boolean),
  };
}

function districtExpansionWeight(district, metro) {
  const signals = districtExpansionSignals(district, metro);
  return (
    (metro ? 1000 : 0) +
    (signals.publisherScore * 4) +
    (signals.districtConfidence === "high" ? 80 : signals.districtConfidence === "medium" ? 40 : 0) +
    (district.path ? 60 : 0) +
    (signals.representativeBuildings * 18) +
    (signals.comparisonRelationships * 10) +
    (signals.recommendationSignals.length * 14)
  );
}

function buildCommercialMarketEvidenceExpansion(publisherAnalysis) {
  const collections = commercialMarketEvidence.collections || [];
  const collectionByDistrictId = new Map();
  for (const collection of collections) {
    const districtId = collectionDistrictId(collection);
    if (districtId) collectionByDistrictId.set(districtId, collection);
  }

  const districtNodes = (locationKnowledgeGraph || [])
    .filter((node) => node && node.type === "district")
    .map((district) => {
      const metro = metroForDistrict(district, publisherAnalysis);
      const collection = collectionByDistrictId.get(district.slug);
      const signals = districtExpansionSignals(district, metro);
      return {
        districtId: district.slug,
        districtName: district.label,
        city: district.city || "",
        state: district.state || "",
        metroId: metro ? metro.metroId : "",
        metroName: metro ? metro.metroName : "",
        path: district.path || "",
        collectionStatus: collection ? "Collection Exists" : "Missing Collection",
        collectionId: collection ? collection.collectionId : "",
        signals,
        expansionWeight: districtExpansionWeight(district, metro),
      };
    })
    .sort((a, b) =>
      a.state.localeCompare(b.state) ||
      a.city.localeCompare(b.city) ||
      a.districtName.localeCompare(b.districtName)
    );

  const existingCollections = districtNodes
    .filter((district) => district.collectionStatus === "Collection Exists")
    .map((district) => ({
      districtId: district.districtId,
      districtName: district.districtName,
      city: district.city,
      state: district.state,
      metroId: district.metroId,
      metroName: district.metroName,
      path: district.path,
      collectionId: district.collectionId,
    }));

  const missingCollections = districtNodes
    .filter((district) => district.collectionStatus === "Missing Collection")
    .map((district) => ({
      districtId: district.districtId,
      districtName: district.districtName,
      city: district.city,
      state: district.state,
      metroId: district.metroId,
      metroName: district.metroName,
      path: district.path,
      signals: district.signals,
      expansionWeight: district.expansionWeight,
    }));

  const suggestedExpansionOrder = missingCollections
    .slice()
    .sort((a, b) =>
      (b.expansionWeight - a.expansionWeight) ||
      a.metroName.localeCompare(b.metroName) ||
      a.city.localeCompare(b.city) ||
      a.districtName.localeCompare(b.districtName)
    )
    .map((district, index) => ({
      rank: index + 1,
      districtId: district.districtId,
      districtName: district.districtName,
      city: district.city,
      state: district.state,
      metroId: district.metroId,
      metroName: district.metroName,
      path: district.path,
      rationale: [
        district.metroName ? `${district.metroName} is already tracked by Publisher.` : "District is not assigned to a current Publisher metro.",
        district.signals.publisherReadiness ? `Publisher readiness: ${district.signals.publisherReadiness}.` : "",
        district.signals.publicPage === "Yes" ? "Public district page exists." : "",
        district.signals.districtConfidence ? `Knowledge Graph confidence: ${district.signals.districtConfidence}.` : "",
        district.signals.representativeBuildings ? `${district.signals.representativeBuildings} representative building relationships exist.` : "",
        district.signals.comparisonRelationships ? `${district.signals.comparisonRelationships} comparison relationships exist.` : "",
      ].filter(Boolean),
    }));

  return {
    schemaVersion: "commercial-market-evidence-expansion-v1",
    sourceSystems: ["Commercial Location Knowledge Graph", "Commercial Market Evidence", "Publisher"],
    coverageSummary: {
      knowledgeGraphDistricts: districtNodes.length,
      existingCollections: existingCollections.length,
      missingCollections: missingCollections.length,
      collectionCoverageLabel: existingCollections.length ? "Partial" : "Missing",
    },
    existingCollections,
    missingCollections,
    suggestedExpansionOrder,
    orderingStrategy: [
      "Publisher-tracked metros rank before unassigned districts.",
      "Higher current Publisher readiness ranks earlier because existing editorial infrastructure can support evidence expansion.",
      "High-confidence Knowledge Graph districts rank earlier.",
      "Public district pages, representative-building relationships, comparison relationships, and recommendation-oriented fields increase priority.",
      "Ties are resolved by metro, city, and district name for deterministic output.",
    ],
    planningImpact: "Presence-based expansion planning remains deterministic. EOS marketProjection converts the next missing collection per eligible market into an executable Program Mission without changing Publisher scoring.",
    executionImpact: "EOS marketProjection can convert the next missing collection per market into an executable Commercial Market Evidence Program Mission.",
    qualityMeasurement: "Deferred. Presence or absence of a collection is the only v1 coverage signal.",
  };
}

function buildPlatformServices(publisherSnapshot, publisherAnalysis) {
  const commercialMarketEvidence =
    (publisherAnalysis && publisherAnalysis.commercialMarketEvidence) ||
    (publisherSnapshot && publisherSnapshot.commercialMarketEvidence) ||
    null;

  const expansion = buildCommercialMarketEvidenceExpansion(publisherAnalysis);
  return {
    commercialMarketEvidence: commercialMarketEvidence
      ? {
        ...commercialMarketEvidence,
        owner: "Commercial Market Evidence",
        displayedBy: "Mission Control",
        planningImpact: "Platform health remains reporting-only. EOS marketProjection resolves missing collections into executable Program Initiatives and Missions.",
        expansion,
      }
      : {
        schemaVersion: "commercial-market-evidence-platform-v1",
        service: "Commercial Market Evidence",
        status: "Unavailable",
        validationStatus: "UNKNOWN",
        collections: 0,
        districts: [],
        evidenceRecords: 0,
        evidenceTypes: [],
        evidenceRoles: [],
        confidenceSummary: {},
        deferredCandidates: 0,
        latestValidation: "",
        errors: [],
        warnings: ["Commercial Market Evidence validator summary was not present in Publisher analysis."],
        owner: "Commercial Market Evidence",
        displayedBy: "Mission Control",
        planningImpact: "Platform health remains reporting-only. EOS marketProjection resolves missing collections into executable Program Initiatives and Missions when expansion evidence exists.",
        expansion,
      },
  };
}

function buildEditorialOperatingSystem(publisherSnapshot, expansionPlans, options = {}) {
  const publisherAnalysis = publisherSnapshot && publisherSnapshot.analysis ? publisherSnapshot.analysis : publisherSnapshot;
  if (!publisherAnalysis || !Array.isArray(publisherAnalysis.metros)) {
    throw new Error("EOS requires Publisher analysis with metros.");
  }

  const planByMetro = planLookup(expansionPlans);
  const metros = publisherAnalysis.metros.map((metro) => buildMetroEos(metro, planByMetro[metro.metroId]));
  const workQueue = buildWorkQueue(publisherAnalysis, expansionPlans, metros);
  const expansionProjects = buildExpansionProjects(publisherAnalysis);
  const platformServices = buildPlatformServices(publisherSnapshot, publisherAnalysis);
  const programMissions = buildCommercialMarketEvidenceMissions(metros, platformServices);
  const portfolioQueues = attachProgramMissions(buildPortfolioQueues(workQueue, metros, expansionProjects), programMissions);
  const marketProjection = buildMarketProjection(metros, portfolioQueues, platformServices);

  return {
    schemaVersion: 1,
    generatedAt: options.generatedAt || publisherAnalysis.generatedAt || new Date().toISOString(),
    eosVersion: "editorial-operating-system-v2.2.4",
    sourceSystems: ["Publisher", "Compass", "Commercial Knowledge Graph", "Commercial Market Evidence", "Field Mode", "QA", "Editorial Planning"],
    platformServices,
    marketProjection,
    automationLevels: Object.values(AUTOMATION_LEVELS),
    executionProviders: Object.values(EXECUTION_PROVIDERS),
    taskLifecycle: Object.values(TASK_STATES),
    queues: Object.values(QUEUES),
    operatingLanes: Object.values(OPERATING_LANES),
    executionHandoff: EXECUTION_HANDOFF,
    healthModel: {
      weights: HEALTH_WEIGHTS,
      signals: Object.keys(HEALTH_WEIGHTS),
      note: "Overall Editorial Health is additive and separate from Publisher score. Future signals can be added by appending a scored signal and weight.",
    },
    investmentModel: {
      inputs: ["searchOpportunity", "editorialLeverage", "buildEffort", "existingFoundation", "automationPotential", "brokerCoverage"],
      weights: {
        searchOpportunity: 28,
        editorialLeverage: 24,
        existingFoundation: 16,
        automationPotential: 16,
        brokerCoverage: 8,
        buildEffortInverse: 8,
      },
      note: "Investment Score answers whether Rofo should invest next. External Search Console, analytics, and broker-performance signals are not connected in v2.2.",
    },
    expansionWorkflow: {
      stages: EXPANSION_STAGES,
      note: "Expansion metros are projects with stage progress, not single queue tasks.",
    },
    planningModel: {
      statuses: Object.values(TASK_STATES).map((state) => state.label),
      modules: MODULES,
      missionClasses: Object.values(MISSION_CLASSES),
      expectedImpact: Object.values(EXPECTED_IMPACT),
      estimatedEffort: Object.values(ESTIMATED_EFFORT),
      confidence: Object.values(CONFIDENCE_LEVELS),
      note: "EOS v2.2.4 recommends coherent missions generated from measurable opportunities. Raw opportunities remain available in inventory.",
    },
    overview: overview(metros, workQueue, portfolioQueues, expansionProjects),
    metros,
    expansionProjects,
    portfolioQueues,
    workQueue,
  };
}

module.exports = {
  buildEditorialOperatingSystem,
  AUTOMATION_LEVELS,
  HEALTH_WEIGHTS,
  TASK_STATES,
  EXECUTION_PROVIDERS,
};
