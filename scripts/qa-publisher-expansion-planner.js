const publisherSnapshot = require("../data/generated/publisher-analysis.json");
const publisherPlans = require("../data/generated/publisher-expansion-plans.json");
const { buildPublisherExpansionPlans } = require("../lib/publisher/expansion-planner.js");
const buildingPages = require("../_data/buildingPages.js");

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function normalizePath(value) {
  const path = String(value || "").trim();
  if (!path) return "";
  return path.endsWith("/") ? path : `${path}/`;
}

function buildingPath(record) {
  return normalizePath(record && (record.building_path || record.canonical_path || record.path || record.url));
}

function textValue(value) {
  if (Array.isArray(value)) return value.map(textValue).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(textValue).join(" ");
  return String(value || "");
}

const analysis = publisherSnapshot.analysis;
const errors = [];
const warnings = [];

if (!analysis || !Array.isArray(analysis.metros)) {
  errors.push("Publisher analysis snapshot is missing metro data.");
}
if (!publisherPlans || !Array.isArray(publisherPlans.metros)) {
  errors.push("Publisher expansion plans snapshot is missing metro data.");
}

const queueIds = new Set((analysis.metros || []).flatMap((metro) => (metro.queue || []).map((item) => `gap:${item.id}`)));
const buildingByPath = new Map((Array.isArray(buildingPages) ? buildingPages : []).map((record) => [buildingPath(record), record]).filter(([path]) => path));
const buildingBriefPaths = new Set([...buildingByPath.values()].filter((record) => record.building_brief).map(buildingPath));
const recomputed = buildPublisherExpansionPlans(analysis, { generatedAt: publisherPlans.generatedAt || analysis.generatedAt });

if (stableJson(recomputed) !== stableJson(publisherPlans)) {
  errors.push("Generated expansion plans are not deterministic against the current Publisher analysis snapshot.");
}

function validatePlan(plan) {
  const metro = (analysis.metros || []).find((item) => item.metroId === plan.metroId);
  if (!metro) {
    errors.push(`${plan.metroId}: invented metro plan`);
    return;
  }
  const sourceIds = new Set((metro.queue || []).map((item) => `gap:${item.id}`));
  const sprint = plan.recommendedSprint || {};
  const taskIds = new Set();
  const referencedDistricts = new Set();
  const referencedBuildings = new Set();
  const missingDependencies = [];

  if (!sprint.objective || !textValue(sprint.objective).trim()) {
    errors.push(`${plan.metroName}: empty sprint objective`);
  }
  if (!Array.isArray(sprint.qaTasks) || !sprint.qaTasks.length) {
    errors.push(`${plan.metroName}: missing QA tasks`);
  }
  if ((sprint.tasks || []).length > 15) {
    warnings.push(`${plan.metroName}: sprint has more than 15 tasks`);
  }
  const categoryCounts = {};
  for (const task of sprint.tasks || []) {
    if (taskIds.has(task.id)) errors.push(`${plan.metroName}: duplicate sprint task ${task.id}`);
    taskIds.add(task.id);
    if (!sourceIds.has(task.id)) errors.push(`${plan.metroName}: sprint task does not map to metro queue ${task.id}`);
    if ((task.blockedBy || []).length && task.confidence !== "Blocked") {
      errors.push(`${plan.metroName}: task ${task.id} has unmet prerequisite without blocked state`);
    }
    if (task.category === "buildingBriefs" && buildingBriefPaths.has(normalizePath(task.publicUrl))) {
      errors.push(`${plan.metroName}: completed Building Brief recommended again ${task.publicUrl}`);
    }
    if (task.publicUrl && task.publicUrl.startsWith("/commercial-real-estate/building/") && !buildingByPath.has(normalizePath(task.publicUrl)) && task.confidence !== "Blocked") {
      errors.push(`${plan.metroName}: broken canonical building reference ${task.publicUrl}`);
    }
    if (task.category === "buildingBriefs" && task.publicUrl) referencedBuildings.add(task.itemName);
    if (task.category === "districtCoverage" || task.category === "representativeBuildings" || task.category === "recommendationReadiness") referencedDistricts.add(task.itemName);
    categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
  }
  if (Object.values(categoryCounts).some((count) => count > 12)) {
    warnings.push(`${plan.metroName}: sprint is heavily weighted to one category`);
  }

  for (const gap of plan.gaps || []) {
    if (!queueIds.has(gap.id)) errors.push(`${plan.metroName}: gap does not map to Publisher queue ${gap.id}`);
    if ((gap.blockedBy || []).length && gap.confidence !== "Blocked") {
      errors.push(`${plan.metroName}: gap ${gap.id} has unmet prerequisite without blocked state`);
    }
    if (gap.publicUrl && gap.publicUrl.startsWith("/commercial-real-estate/building/") && !buildingByPath.has(normalizePath(gap.publicUrl)) && gap.confidence !== "Blocked") {
      errors.push(`${plan.metroName}: broken building gap reference ${gap.publicUrl}`);
    }
  }

  if ((metro.representativeBuildingCount || 0) === 0 && !(plan.warnings || []).some((warning) => /Representative-building coverage is absent/.test(warning))) {
    warnings.push(`${plan.metroName}: metro lacks representative buildings but warning is missing`);
  }
  if (!sprint.expectedImpact || !sprint.expectedImpact.length) {
    warnings.push(`${plan.metroName}: expected impact cannot be estimated`);
  }
  if ((plan.gaps || []).length < 3 && metro.readinessStatus !== "Distribution Ready") {
    warnings.push(`${plan.metroName}: metro lacks enough data for a detailed sprint`);
  }
  missingDependencies.push(...(sprint.dependencies || []).filter((item) => !item));

  console.log(`\n${plan.metroName}`);
  console.log(`Current readiness: ${plan.currentState.readinessStatus}`);
  console.log(`Gap count: ${(plan.gaps || []).length}`);
  console.log(`Priority count: ${(plan.priorities || []).length}`);
  console.log(`Recommended sprint: ${sprint.title || "none"}`);
  console.log(`Referenced districts: ${referencedDistricts.size ? [...referencedDistricts].join(", ") : "none"}`);
  console.log(`Referenced buildings: ${referencedBuildings.size ? [...referencedBuildings].join(", ") : "none"}`);
  console.log(`Missing dependencies: ${missingDependencies.length ? missingDependencies.join(", ") : "none"}`);
  console.log(`Sprint tasks: ${(sprint.tasks || []).length}`);
  console.log(`Confidence states: ${[...new Set((plan.gaps || []).map((gap) => gap.confidence))].join(", ") || "none"}`);
}

console.log("Publisher Expansion Planner QA");
for (const plan of publisherPlans.metros || []) {
  validatePlan(plan);
}

const serialized = JSON.stringify(publisherPlans);
["undefined", "N/A", "[object Object]"].forEach((token) => {
  if (serialized.includes(token)) errors.push(`Generated planner output contains ${token}`);
});

console.log(`\nErrors: ${errors.length ? errors.join("; ") : "none"}`);
console.log(`Warnings: ${warnings.length ? warnings.join("; ") : "none"}`);

if (errors.length) process.exit(1);
