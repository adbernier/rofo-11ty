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
  if (/blocked/i.test(item.readinessState || item.confidence || "")) return "Blocked";
  if (/research/i.test(item.readinessState || item.confidence || "")) return "Research";
  return "Open";
}

function normalizePublisherTask(item, planByMetro) {
  const module = moduleForCategory(item.category);
  const automation = automationForPublisherItem(item);
  const priority = clamp((item.priority || 0) + (item.severity === "critical" ? 10 : 0));
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
    status: workStatus(item),
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
    status: "Open",
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
    status: "Open",
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
    status: "Open",
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
    .sort((a, b) =>
      (b.priorityScore - a.priorityScore) ||
      a.metroName.localeCompare(b.metroName) ||
      a.title.localeCompare(b.title)
    );
}

function overview(metros, workQueue) {
  const averageHealth = metros.length ? clamp(metros.reduce((total, metro) => total + metro.overallEditorialHealth.score, 0) / metros.length) : 0;
  const needsAttention = metros.filter((metro) => ["needs_attention", "planning", "research"].includes(metro.status.id)).length;
  const humanOnly = workQueue.filter((item) => item.automationLevel.id === "human_only").length;
  const autonomousReady = workQueue.filter((item) => item.automationLevel.id === "autonomous").length;
  return {
    metroCount: metros.length,
    averageHealth,
    needsAttention,
    openWorkItems: workQueue.length,
    humanOnlyWorkItems: humanOnly,
    autonomousCandidates: autonomousReady,
    topWorkItem: workQueue[0] ? workQueue[0].title : "No work queued",
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

  return {
    schemaVersion: 1,
    generatedAt: options.generatedAt || publisherAnalysis.generatedAt || new Date().toISOString(),
    eosVersion: "editorial-operating-system-v1",
    sourceSystems: ["Publisher", "Compass", "Commercial Knowledge Graph", "Field Mode", "QA", "Editorial Planning"],
    automationLevels: Object.values(AUTOMATION_LEVELS),
    healthModel: {
      weights: HEALTH_WEIGHTS,
      signals: Object.keys(HEALTH_WEIGHTS),
      note: "Overall Editorial Health is additive and separate from Publisher score. Future signals can be added by appending a scored signal and weight.",
    },
    planningModel: {
      statuses: ["Open", "Research", "Blocked", "Done"],
      modules: MODULES,
      note: "EOS work items are generated from measurable gaps. Autonomous generation is intentionally not implemented in v1.",
    },
    overview: overview(metros, workQueue),
    metros,
    workQueue,
  };
}

module.exports = {
  buildEditorialOperatingSystem,
  AUTOMATION_LEVELS,
  HEALTH_WEIGHTS,
};
