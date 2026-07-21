const rules = require("../../data/publisher-rules.js");

const MODE_WEIGHTS = {
  balanced: {
    label: "Balanced Expansion",
    userValue: 1.15,
    recommendationImpact: 1,
    coverageUnlock: 1,
    seoValue: 1,
    effort: 1,
    dependencyRisk: 1,
  },
  recommendation: {
    label: "Recommendation Readiness",
    userValue: 1,
    recommendationImpact: 1.55,
    coverageUnlock: 1,
    seoValue: 0.75,
    effort: 1,
    dependencyRisk: 1.1,
  },
  editorial: {
    label: "Editorial Depth",
    userValue: 1.2,
    recommendationImpact: 0.85,
    coverageUnlock: 0.95,
    seoValue: 1.35,
    effort: 1,
    dependencyRisk: 1,
  },
  building: {
    label: "Building Depth",
    userValue: 1.15,
    recommendationImpact: 0.9,
    coverageUnlock: 1.45,
    seoValue: 1.15,
    effort: 1,
    dependencyRisk: 1,
  },
};

const GAP_TAXONOMY = {
  metroFoundation: "technicalPublishing",
  districtCoverage: "geography",
  comparisonGraph: "comparison",
  representativeBuildings: "representativeBuilding",
  buildingBriefs: "representativeBuilding",
  recommendationReadiness: "recommendation",
  editorialQuality: "editorial",
  internalLinking: "technicalPublishing",
};

const GAP_LABELS = {
  geography: "Geography Gap",
  recommendation: "Recommendation Gap",
  comparison: "Comparison Gap",
  representativeBuilding: "Representative-Building Gap",
  editorial: "Editorial Gap",
  technicalPublishing: "Technical / Publishing Gap",
};

const CATEGORY_BASE_FACTORS = {
  metroFoundation: { userValue: 4, recommendationImpact: 4, coverageUnlock: 5, seoValue: 4, effort: 2, dependencyRisk: 2 },
  districtCoverage: { userValue: 5, recommendationImpact: 4, coverageUnlock: 4, seoValue: 5, effort: 3, dependencyRisk: 2 },
  comparisonGraph: { userValue: 4, recommendationImpact: 5, coverageUnlock: 3, seoValue: 3, effort: 2, dependencyRisk: 2 },
  representativeBuildings: { userValue: 5, recommendationImpact: 3, coverageUnlock: 5, seoValue: 4, effort: 4, dependencyRisk: 3 },
  buildingBriefs: { userValue: 5, recommendationImpact: 3, coverageUnlock: 4, seoValue: 5, effort: 4, dependencyRisk: 2 },
  recommendationReadiness: { userValue: 5, recommendationImpact: 5, coverageUnlock: 4, seoValue: 2, effort: 3, dependencyRisk: 3 },
  editorialQuality: { userValue: 3, recommendationImpact: 2, coverageUnlock: 2, seoValue: 3, effort: 2, dependencyRisk: 1 },
  internalLinking: { userValue: 4, recommendationImpact: 3, coverageUnlock: 4, seoValue: 4, effort: 2, dependencyRisk: 2 },
};

const TASK_OVERRIDES = [
  {
    match: "missing district page",
    code: "district-unpublished",
    description: "District exists in the graph but does not resolve to a public district page.",
    confidence: "Ready",
  },
  {
    match: "missing district description",
    code: "district-lacks-commercial-identity",
    description: "District lacks substantive decision-oriented commercial identity.",
    confidence: "Ready",
  },
  {
    match: "missing district qualities",
    code: "district-lacks-structured-qualities",
    description: "District lacks structured strengths, tradeoffs, fit, or validation guidance.",
    confidence: "Ready",
  },
  {
    match: "orphan district comparison",
    code: "district-relationships-incomplete",
    description: "District has no meaningful comparison relationships.",
    confidence: "Review recommended",
  },
  {
    match: "one-way comparison",
    code: "one-way-comparison",
    description: "Comparison relationship may need reciprocal treatment.",
    confidence: "Review recommended",
  },
  {
    match: "unresolved comparison",
    code: "invalid-comparison-target",
    description: "Comparison target does not resolve to a known location node.",
    confidence: "Blocked",
  },
  {
    match: "district missing representative buildings",
    code: "district-missing-representative-buildings",
    description: "District lacks representative building examples.",
    confidence: "Research required",
  },
  {
    match: "representative building missing Building Brief",
    code: "building-missing-building-brief",
    description: "Representative building has not migrated to the Building Brief journey.",
    confidence: "Ready",
  },
  {
    match: "initial Building Brief collection",
    code: "initial-building-brief-collection",
    description: "Metro has representative buildings but no initial Building Brief collection.",
    confidence: "Ready",
  },
  {
    match: "missing explainability fields",
    code: "recommendation-explainability-gap",
    description: "Recommendation node lacks strengths, tradeoffs, or validation questions.",
    confidence: "Ready",
  },
  {
    match: "missing recommendation QA status",
    code: "recommendation-qa-missing",
    description: "Authoritative recommendation QA status is missing.",
    confidence: "Blocked",
  },
  {
    match: "editorial phrase violation",
    code: "editorial-style-warning",
    description: "Deterministic editorial scan flagged wording or placeholder values.",
    confidence: "Review recommended",
  },
];

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function factorScore(gap, mode = "balanced") {
  const weights = MODE_WEIGHTS[mode] || MODE_WEIGHTS.balanced;
  const factors = gap.priorityFactors;
  const positive =
    (factors.userValue * weights.userValue) +
    (factors.recommendationImpact * weights.recommendationImpact) +
    (factors.coverageUnlock * weights.coverageUnlock) +
    (factors.seoValue * weights.seoValue);
  const negative =
    (factors.estimatedEffort * weights.effort) +
    (factors.dependencyRisk * weights.dependencyRisk);
  const severityBonus = { critical: 18, high: 12, medium: 6, low: 0 }[gap.severity] || 0;
  return clampScore((positive * 5) - (negative * 3) + severityBonus);
}

function taskOverride(item) {
  return TASK_OVERRIDES.find((override) => String(item.taskType || "").includes(override.match));
}

function gapCode(item) {
  const override = taskOverride(item);
  if (override) return override.code;
  return item.code || slugify(item.taskType || item.category || "gap");
}

function confidenceFor(item) {
  if (item.readinessState === "research-required") return "Research required";
  if (item.readinessState === "review-recommended") return "Review recommended";
  if (item.readinessState === "blocked") return "Blocked";
  if (item.readinessState === "ready") return "Ready";

  const override = taskOverride(item);
  if (override) return override.confidence;
  if (item.severity === "critical") return "Blocked";
  if (item.automationCandidate) return "Ready";
  return "Review recommended";
}

function gapDescription(item) {
  const override = taskOverride(item);
  return override ? override.description : item.reason;
}

function affectedType(item) {
  if (item.category === "buildingBriefs" || item.category === "representativeBuildings") return "building-or-district";
  if (item.category === "comparisonGraph") return "relationship";
  if (item.category === "districtCoverage" || item.category === "recommendationReadiness") return "district";
  if (item.category === "metroFoundation") return "metro";
  return "record";
}

function baseFactors(item, metro) {
  const base = CATEGORY_BASE_FACTORS[item.category] || { userValue: 3, recommendationImpact: 3, coverageUnlock: 3, seoValue: 3, effort: 3, dependencyRisk: 2 };
  const factors = { ...base };
  if (item.severity === "critical") {
    factors.userValue = Math.min(5, factors.userValue + 1);
    factors.recommendationImpact = Math.min(5, factors.recommendationImpact + 1);
    factors.dependencyRisk = Math.min(5, factors.dependencyRisk + 1);
  }
  if (metro.readinessStatus === "In Development") {
    factors.coverageUnlock = Math.min(5, factors.coverageUnlock + 1);
    factors.seoValue = Math.max(1, factors.seoValue - 1);
  }
  if (item.category === "buildingBriefs" && metro.buildingBriefCount > 0) {
    factors.dependencyRisk = Math.max(1, factors.dependencyRisk - 1);
  }
  return {
    userValue: factors.userValue,
    recommendationImpact: factors.recommendationImpact,
    coverageUnlock: factors.coverageUnlock,
    seoValue: factors.seoValue,
    estimatedEffort: factors.effort,
    dependencyRisk: factors.dependencyRisk,
  };
}

function dependenciesFor(item, metro) {
  const blockedBy = [];
  const unlocks = [];
  const prerequisite = [];
  const followUp = [];

  if (item.category === "buildingBriefs") {
    if (!item.publicUrl) blockedBy.push("canonical-building-url");
    if (metro.representativeBuildingCount === 0) blockedBy.push("representative-building-collection");
    prerequisite.push("canonical representative building record");
    prerequisite.push("district association");
    unlocks.push("Building Brief page depth");
    unlocks.push("recommendation representative-building card eligibility");
    followUp.push("QA Building Brief depth");
  }
  if (item.category === "representativeBuildings") {
    prerequisite.push("district commercial identity");
    unlocks.push("Building Brief migration");
    unlocks.push("recommendation representative-building module");
    followUp.push("author initial Building Briefs after canonical records exist");
  }
  if (item.category === "comparisonGraph") {
    prerequisite.push("district identity");
    unlocks.push("stronger recommendation alternatives");
    followUp.push("recommendation QA scenario coverage");
  }
  if (item.category === "districtCoverage") {
    unlocks.push("district comparison content");
    unlocks.push("representative-building selection");
    followUp.push("add comparisons and representative buildings");
  }
  if (item.category === "recommendationReadiness") {
    unlocks.push("Compass readiness confidence");
    unlocks.push("Distribution Ready gate clearance");
    followUp.push("rerun recommendation QA");
  }

  return { blockedBy, unlocks, prerequisite, followUp };
}

function buildGap(item, metro) {
  const taxonomy = GAP_TAXONOMY[item.category] || "editorial";
  const dependency = dependenciesFor(item, metro);
  const gap = {
    id: `gap:${item.id}`,
    metroId: metro.metroId,
    metroName: metro.metroName,
    category: item.category,
    categoryLabel: item.categoryLabel,
    gapType: taxonomy,
    gapLabel: GAP_LABELS[taxonomy],
    code: gapCode(item),
    taskType: item.taskType,
    affectedType: affectedType(item),
    itemName: item.itemName,
    sourceId: item.sourceId || "",
    publicUrl: item.publicUrl || "",
    adminUrl: item.adminUrl || "",
    severity: item.severity,
    description: gapDescription(item),
    reason: item.reason,
    suggestedNextAction: item.suggestedNextAction,
    confidence: dependency.blockedBy.length ? "Blocked" : confidenceFor(item),
    automationCandidate: Boolean(item.automationCandidate),
    priorityFactors: baseFactors(item, metro),
    blockedBy: dependency.blockedBy,
    unlocks: dependency.unlocks,
    prerequisite: dependency.prerequisite,
    followUp: dependency.followUp,
  };
  gap.priorityScore = factorScore(gap, "balanced");
  return gap;
}

function byPriority(mode) {
  return (a, b) =>
    (b.modeScores[mode] - a.modeScores[mode]) ||
    a.categoryLabel.localeCompare(b.categoryLabel) ||
    a.itemName.localeCompare(b.itemName);
}

function scoreGaps(gaps) {
  return gaps.map((gap) => {
    const modeScores = Object.keys(MODE_WEIGHTS).reduce((result, mode) => {
      result[mode] = factorScore(gap, mode);
      return result;
    }, {});
    return {
      ...gap,
      modeScores,
      priorityScore: modeScores.balanced,
    };
  });
}

function firstN(gaps, predicate, count) {
  return gaps.filter(predicate).slice(0, count);
}

function uniqueTasks(gaps) {
  const seen = new Set();
  return gaps.filter((gap) => {
    const key = `${gap.category}:${gap.code}:${gap.sourceId || gap.itemName}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sprintTitle(metro, mode, gaps) {
  const label = MODE_WEIGHTS[mode].label;
  const top = gaps[0];
  if (!top) return `${metro.metroName} Publisher Maintenance Sprint`;
  if (top.category === "representativeBuildings") return `${metro.metroName} Representative Building Foundation Sprint`;
  if (top.category === "buildingBriefs") return `${metro.metroName} Building Brief Migration Sprint`;
  if (top.category === "comparisonGraph") return `${metro.metroName} District Comparison Sprint`;
  if (top.category === "recommendationReadiness") return `${metro.metroName} Recommendation Readiness Sprint`;
  if (top.category === "districtCoverage") return `${metro.metroName} District Editorial Foundation Sprint`;
  return `${metro.metroName} ${label} Sprint`;
}

function sprintObjective(metro, mode, gaps) {
  if (!gaps.length) return `Maintain ${metro.metroName} Publisher coverage and rerun QA after future content changes.`;
  const categories = [...new Set(gaps.map((gap) => gap.categoryLabel))].slice(0, 3).join(", ");
  return `Improve ${metro.metroName} expansion readiness by completing the highest-value ${categories} work without creating unsupported content.`;
}

function expectedImpact(metro, gaps) {
  const impact = [];
  if (gaps.some((gap) => gap.category === "districtCoverage")) impact.push("stronger public district guidance");
  if (gaps.some((gap) => gap.category === "comparisonGraph")) impact.push("clearer recommendation alternatives");
  if (gaps.some((gap) => gap.category === "representativeBuildings")) impact.push("representative-building modules can unlock after curation");
  if (gaps.some((gap) => gap.category === "buildingBriefs")) impact.push("deeper public building intelligence and stronger internal links");
  if (gaps.some((gap) => gap.category === "recommendationReadiness")) impact.push("more defensible Compass and Location Brief output");
  if (!impact.length) impact.push("reduced Publisher queue risk");
  return impact;
}

function sprintGapSelection(metro, gaps, mode) {
  const sorted = [...gaps].sort(byPriority(mode));
  const hardBlockers = firstN(sorted, (gap) => gap.severity === "critical" || gap.confidence === "Blocked", 4);
  const districtTasks = firstN(sorted, (gap) => gap.category === "districtCoverage", 5);
  const comparisonTasks = firstN(sorted, (gap) => gap.category === "comparisonGraph", 6);
  const repTasks = firstN(sorted, (gap) => gap.category === "representativeBuildings", 8);
  const briefTasks = firstN(sorted, (gap) =>
    gap.category === "buildingBriefs" &&
    (gap.code === "building-missing-building-brief" || gap.code === "initial-building-brief-collection"),
  metro.buildingBriefCount > 0 ? 10 : 8);
  const recommendationTasks = firstN(sorted, (gap) => gap.category === "recommendationReadiness", 6);

  if (mode === "building") {
    return uniqueTasks([...hardBlockers, ...repTasks, ...briefTasks, ...districtTasks]).slice(0, 15);
  }
  if (mode === "recommendation") {
    return uniqueTasks([...hardBlockers, ...recommendationTasks, ...comparisonTasks, ...districtTasks, ...repTasks]).slice(0, 15);
  }
  if (mode === "editorial") {
    return uniqueTasks([...hardBlockers, ...districtTasks, ...briefTasks, ...repTasks, ...comparisonTasks]).slice(0, 15);
  }
  return uniqueTasks([...hardBlockers, ...districtTasks.slice(0, 4), ...comparisonTasks.slice(0, 4), ...repTasks.slice(0, 6), ...briefTasks.slice(0, 8), ...recommendationTasks.slice(0, 4)])
    .sort(byPriority(mode))
    .slice(0, 15);
}

function planPrompt(metro, sprint, mode) {
  const districts = sprint.tasks.filter((task) => task.affectedType === "district").map((task) => task.itemName);
  const buildings = sprint.tasks.filter((task) => task.category === "buildingBriefs" && task.publicUrl).map((task) => task.itemName);
  const comparisons = sprint.tasks.filter((task) => task.category === "comparisonGraph").map((task) => task.itemName);
  const lines = [];
  lines.push(`Implement Publisher recommended sprint for ${metro.metroName}: ${sprint.title}`);
  lines.push("");
  lines.push(`Mode: ${MODE_WEIGHTS[mode].label}`);
  lines.push(`Objective: ${sprint.objective}`);
  lines.push("");
  lines.push("Scope:");
  lines.push(`- Districts: ${districts.length ? districts.join(", ") : "none named"}`);
  lines.push(`- Buildings: ${buildings.length ? buildings.join(", ") : "none named"}`);
  lines.push(`- Comparisons: ${comparisons.length ? comparisons.join("; ") : "none named"}`);
  lines.push("");
  lines.push("Tasks:");
  sprint.tasks.forEach((task) => {
    lines.push(`- [${task.confidence}] ${task.categoryLabel}: ${task.itemName} - ${task.suggestedNextAction}`);
  });
  lines.push("");
  lines.push("Requirements:");
  lines.push("- Use existing repository data and canonical records only.");
  lines.push("- Do not invent district names, building names, canonical URLs, or availability claims.");
  lines.push("- Preserve existing Publisher scoring and run Publisher QA after changes.");
  lines.push("");
  lines.push("Verification:");
  sprint.qaTasks.forEach((task) => lines.push(`- ${task}`));
  lines.push("- git diff --check");
  lines.push("- npm run build");
  lines.push("");
  lines.push("Deliverables:");
  lines.push("- files changed");
  lines.push("- coverage gaps addressed");
  lines.push("- QA results");
  lines.push("- remaining blockers");
  return lines.join("\n");
}

function buildSprint(metro, gaps, mode = "balanced") {
  const selected = sprintGapSelection(metro, gaps, mode);
  const qaTasks = [
    "node scripts/qa-publisher-expansion-planner.js",
    "node scripts/run-recommendation-qa.js",
  ];
  if (selected.some((gap) => gap.category === "buildingBriefs")) qaTasks.push("node scripts/qa-building-brief-depth.js");
  if (selected.some((gap) => gap.category === "representativeBuildings" || gap.category === "buildingBriefs")) {
    qaTasks.push("node scripts/qa-recommendation-representative-buildings.js");
  }
  const sprint = {
    mode,
    modeLabel: MODE_WEIGHTS[mode].label,
    title: sprintTitle(metro, mode, selected),
    objective: sprintObjective(metro, mode, selected),
    rationale: selected.length
      ? `Selected from ${gaps.length} deterministic Publisher gaps using ${MODE_WEIGHTS[mode].label.toLowerCase()} weighting.`
      : "No high-priority gaps are currently available from Publisher analysis.",
    tasks: selected.map((gap) => ({
      id: gap.id,
      category: gap.category,
      categoryLabel: gap.categoryLabel,
      gapType: gap.gapType,
      itemName: gap.itemName,
      sourceId: gap.sourceId,
      publicUrl: gap.publicUrl,
      priorityScore: gap.modeScores[mode],
      confidence: gap.confidence,
      suggestedNextAction: gap.suggestedNextAction,
      blockedBy: gap.blockedBy,
      unlocks: gap.unlocks,
    })),
    dataTasks: selected.filter((gap) => ["districtCoverage", "comparisonGraph", "representativeBuildings", "buildingBriefs"].includes(gap.category)).map((gap) => gap.suggestedNextAction),
    contentTasks: selected.filter((gap) => ["districtCoverage", "buildingBriefs", "editorialQuality"].includes(gap.category)).map((gap) => gap.suggestedNextAction),
    qaTasks,
    dependencies: [...new Set(selected.flatMap((gap) => gap.prerequisite.concat(gap.blockedBy)))],
    expectedImpact: expectedImpact(metro, selected),
    expectedCoverageImprovements: {
      districtTasks: selected.filter((gap) => gap.category === "districtCoverage").length,
      comparisonTasks: selected.filter((gap) => gap.category === "comparisonGraph").length,
      representativeBuildingTasks: selected.filter((gap) => gap.category === "representativeBuildings").length,
      buildingBriefTasks: selected.filter((gap) => gap.category === "buildingBriefs").length,
      recommendationTasks: selected.filter((gap) => gap.category === "recommendationReadiness").length,
    },
    exclusions: [
      "No automatic content commits.",
      "No external AI calls.",
      "No live availability claims.",
      "No creation of placeholder pages.",
    ],
  };
  sprint.codexPrompt = planPrompt(metro, sprint, mode);
  return sprint;
}

function coverageFor(metro) {
  const categories = metro.categories || {};
  const ecosystemCoverage = metro.ecosystemCoverage || {};
  return {
    cities: {
      primaryCityPath: metro.cityPath || "",
      status: categories.metroFoundation ? categories.metroFoundation.score : 0,
    },
    districts: {
      count: metro.districtCount || 0,
      score: categories.districtCoverage ? categories.districtCoverage.score : 0,
    },
    recommendationNodes: {
      count: metro.districtCount || 0,
      score: categories.recommendationReadiness ? categories.recommendationReadiness.score : 0,
    },
    comparisons: {
      score: categories.comparisonGraph ? categories.comparisonGraph.score : 0,
    },
    representativeBuildings: {
      count: metro.representativeBuildingCount || 0,
      score: categories.representativeBuildings ? categories.representativeBuildings.score : 0,
    },
    buildingBriefs: {
      count: metro.buildingBriefCount || 0,
      score: categories.buildingBriefs ? categories.buildingBriefs.score : 0,
    },
    insights: {
      score: categories.editorialQuality ? categories.editorialQuality.score : 0,
      note: "Publisher v1 uses editorial-quality and related-link signals as a proxy until a dedicated insight inventory is available.",
    },
    handbookLinks: {
      score: categories.internalLinking ? categories.internalLinking.score : 0,
      note: "Publisher v1 measures resolvable internal links; handbook-link relevance is a future explicit category.",
    },
    ecosystems: {
      count: ecosystemCoverage.summary ? ecosystemCoverage.summary.ecosystemCount : 0,
      developed: ecosystemCoverage.summary ? ecosystemCoverage.summary.developedCount : 0,
      partial: ecosystemCoverage.summary ? ecosystemCoverage.summary.partialCount : 0,
      thin: ecosystemCoverage.summary ? ecosystemCoverage.summary.thinCount : 0,
      missing: ecosystemCoverage.summary ? ecosystemCoverage.summary.missingCount : 0,
      reviewRequired: ecosystemCoverage.summary ? ecosystemCoverage.summary.reviewRequiredDistrictCount : 0,
      note: "Ecosystem coverage is reported for planning context and does not change Publisher readiness scoring in v1.",
    },
  };
}

function ecosystemWarningsFor(metro) {
  const coverage = metro.ecosystemCoverage || {};
  const ecosystems = coverage.ecosystems || {};
  const warnings = [];
  const industrial = ecosystems.industrial_flex;
  if (!industrial || industrial.status === "Missing") {
    warnings.push("Industrial/flex ecosystem coverage is absent or not classified.");
  } else if (industrial.status === "Thin") {
    warnings.push("Industrial/flex ecosystem coverage exists but lacks representative-building depth.");
  }
  const totalPrimaryDistricts = Object.values(ecosystems).reduce((total, item) => total + (item.districtCount || 0), 0);
  const officeDistricts = ecosystems.office ? ecosystems.office.districtCount || 0 : 0;
  if (totalPrimaryDistricts >= 4 && officeDistricts / totalPrimaryDistricts >= 0.75) {
    warnings.push("Metro ecosystem coverage is heavily concentrated in office districts.");
  }
  if ((coverage.reviewRequiredDistricts || []).length) {
    warnings.push(`${coverage.reviewRequiredDistricts.length} district ecosystem classifications require editorial review.`);
  }
  return warnings;
}

function currentStateFor(metro) {
  return {
    readinessStatus: metro.readinessStatus,
    overallScore: metro.overallScore,
    recommendationScore: metro.dimensions && metro.dimensions.compassReadiness ? metro.dimensions.compassReadiness.score : 0,
    editorialScore: metro.dimensions && metro.dimensions.editorialCoverage ? metro.dimensions.editorialCoverage.score : 0,
    publishingScore: metro.dimensions && metro.dimensions.publishingReadiness ? metro.dimensions.publishingReadiness.score : 0,
    buildingScore: metro.categories && metro.categories.buildingBriefs ? metro.categories.buildingBriefs.score : 0,
    comparisonScore: metro.categories && metro.categories.comparisonGraph ? metro.categories.comparisonGraph.score : 0,
    insightScore: metro.categories && metro.categories.editorialQuality ? metro.categories.editorialQuality.score : 0,
  };
}

function buildMetroPlan(metro, options = {}) {
  const gaps = scoreGaps((metro.queue || []).map((item) => buildGap(item, metro)));
  const priorities = [...gaps].sort(byPriority(options.mode || "balanced"));
  const plansByMode = Object.keys(MODE_WEIGHTS).reduce((result, mode) => {
    result[mode] = buildSprint(metro, priorities, mode);
    return result;
  }, {});
  const blockers = [
    ...(metro.gateBlockers || []).map((blocker) => ({
      code: blocker.code,
      severity: blocker.severity,
      message: blocker.message,
      gate: blocker.gate,
    })),
    ...gaps.filter((gap) => gap.confidence === "Blocked").slice(0, 10).map((gap) => ({
      code: gap.code,
      severity: gap.severity,
      message: gap.description,
      sourceId: gap.sourceId,
    })),
  ];
  const warnings = [];
  if (!gaps.length) warnings.push("No deterministic Publisher gaps found.");
  if ((metro.representativeBuildingCount || 0) === 0) warnings.push("Representative-building coverage is absent.");
  if ((metro.buildingBriefCount || 0) === 0 && (metro.representativeBuildingCount || 0) > 0) warnings.push("Representative buildings exist, but no Building Briefs are migrated.");
  warnings.push(...ecosystemWarningsFor(metro));
  return {
    metroId: metro.metroId,
    metroName: metro.metroName,
    generatedAt: options.generatedAt || "",
    currentState: currentStateFor(metro),
    coverage: coverageFor(metro),
    ecosystemCoverage: metro.ecosystemCoverage || null,
    gaps,
    priorities,
    recommendedSprint: plansByMode[options.mode || "balanced"],
    plansByMode,
    blockers,
    warnings,
  };
}

function buildPublisherExpansionPlans(analysis, options = {}) {
  const generatedAt = options.generatedAt || analysis.generatedAt || "";
  const mode = options.mode || "balanced";
  const metros = (analysis.metros || []).map((metro) => buildMetroPlan(metro, { generatedAt, mode }));
  const primaryPlans = metros.filter((plan) => (analysis.primaryMetros || []).some((metro) => metro.metroId === plan.metroId));
  const topSprint = [...primaryPlans].sort((a, b) =>
    ((b.recommendedSprint.tasks[0] && b.recommendedSprint.tasks[0].priorityScore) || 0) -
    ((a.recommendedSprint.tasks[0] && a.recommendedSprint.tasks[0].priorityScore) || 0)
  )[0] || null;
  return {
    schemaVersion: 1,
    generatedAt,
    rulesVersion: rules.version,
    plannerVersion: "publisher-expansion-planner-v1",
    defaultMode: mode,
    modes: MODE_WEIGHTS,
    gapTaxonomy: GAP_LABELS,
    scoringFormula: "Priority Score = weighted(User Value + Recommendation Impact + Coverage Unlock + SEO Value) - weighted(Estimated Effort + Dependency Risk) + Severity Bonus",
    metros,
    primaryPlans,
    overview: {
      metroCount: metros.length,
      primaryMetroCount: primaryPlans.length,
      totalGaps: primaryPlans.reduce((total, plan) => total + plan.gaps.length, 0),
      totalPriorities: primaryPlans.reduce((total, plan) => total + plan.priorities.length, 0),
      topRecommendedSprint: topSprint ? {
        metroId: topSprint.metroId,
        metroName: topSprint.metroName,
        title: topSprint.recommendedSprint.title,
        taskCount: topSprint.recommendedSprint.tasks.length,
      } : null,
    },
  };
}

module.exports = {
  buildPublisherExpansionPlans,
  MODE_WEIGHTS,
  GAP_LABELS,
};
