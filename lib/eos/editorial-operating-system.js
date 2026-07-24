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
      : `Advance to ${EXPANSION_STAGES[currentStageIndex + 1].label}.`,
    suggestedModule: { id: "publisher", label: MODULES.publisher },
  };
}

function projectFromDevelopmentMetro(metro) {
  return projectFromSeed({
    metroId: metro.metroId,
    metroName: metro.metroName,
    state: "",
    status: metro.districtCount ? "knowledge_graph" : "research",
    rationale: `${metro.metroName} is configured as an in-development Publisher metro and should be tracked as an expansion project.`,
    searchOpportunity: 60,
    editorialLeverage: 100 - (metro.score || 0),
    buildEffort: metro.districtCount ? 54 : 72,
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
  const todaysRecommendedWork = editorialQueue
    .filter((item) => item.lifecycleState.id !== TASK_STATES.blocked.id)
    .slice(0, 8);
  return {
    todaysRecommendedWork,
    editorialQueue,
    expansionQueue,
    fieldModeQueue,
    reviewQueue,
    opportunityInventory: {
      total: editorialQueue.length,
      byQueue: {
        editorial: editorialQueue.length,
        expansion: expansionQueue.length,
        fieldMode: fieldModeQueue.length,
        review: reviewQueue.length,
      },
      hiddenFromHomepage: Math.max(editorialQueue.length - todaysRecommendedWork.length, 0),
    },
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
    topWorkItem: portfolioQueues.todaysRecommendedWork[0] ? portfolioQueues.todaysRecommendedWork[0].title : "No work queued",
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
  const portfolioQueues = buildPortfolioQueues(workQueue, metros, expansionProjects);

  return {
    schemaVersion: 1,
    generatedAt: options.generatedAt || publisherAnalysis.generatedAt || new Date().toISOString(),
    eosVersion: "editorial-operating-system-v2.2",
    sourceSystems: ["Publisher", "Compass", "Commercial Knowledge Graph", "Field Mode", "QA", "Editorial Planning"],
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
      note: "EOS work items are generated from measurable gaps. Autonomous generation is intentionally not implemented in v2.2.",
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
