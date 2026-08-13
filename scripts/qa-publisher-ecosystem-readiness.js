const publisherSnapshot = require("../data/generated/publisher-analysis.json");
const publisherPlans = require("../data/generated/publisher-expansion-plans.json");
const { buildPublisherExpansionPlans } = require("../lib/publisher/expansion-planner.js");
const rules = require("../data/publisher-rules.js");

const VALID_STATES = new Set(["developed", "strong", "partial", "thin", "missing", "not_applicable", "review_required"]);
const VALID_RELEVANCE = new Set(["core", "important", "secondary", "specialized", "not_applicable", "review_required"]);
const EXPECTED_SCORES = {
  "san-francisco": { overall: 96, status: "Distribution Ready" },
  sacramento: { overall: 98, status: "Distribution Ready" },
  "san-diego": { overall: 84, status: "Expansion Ready" },
  "orange-county": { overall: 84, status: "Expansion Ready" },
  denver: { overallMin: 96, status: "Distribution Ready" },
  seattle: { overall: 94, status: "Distribution Ready" },
};

const errors = [];
const warnings = [];

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function requireField(condition, message) {
  if (!condition) errors.push(message);
}

function metroById(id) {
  return (publisherSnapshot.analysis.metros || []).find((metro) => metro.metroId === id);
}

function planById(id) {
  return (publisherPlans.metros || []).find((metro) => metro.metroId === id);
}

function evaluationFor(metro, ecosystemId) {
  return (((metro.ecosystemReadiness || {}).evaluations) || []).find((item) => item.ecosystemId === ecosystemId);
}

function validateMetro(metro) {
  requireField(metro.geographicReadiness, `${metro.metroName}: missing geographic readiness`);
  requireField(metro.ecosystemReadiness, `${metro.metroName}: missing ecosystem readiness`);
  requireField(metro.ecosystemBalance, `${metro.metroName}: missing ecosystem balance`);
  if (metro.geographicReadiness) requireField(VALID_STATES.has(metro.geographicReadiness.state), `${metro.metroName}: invalid geographic readiness state ${metro.geographicReadiness.state}`);
  if (metro.ecosystemReadiness) requireField(VALID_STATES.has(metro.ecosystemReadiness.state), `${metro.metroName}: invalid ecosystem readiness state ${metro.ecosystemReadiness.state}`);

  const expected = EXPECTED_SCORES[metro.metroId];
  if (expected) {
    const minimumScore = Number.isFinite(expected.overallMin) ? expected.overallMin : expected.overall;
    requireField(metro.overallScore >= minimumScore, `${metro.metroName}: Publisher overall score changed below expected floor ${minimumScore} to ${metro.overallScore}`);
    requireField(metro.readinessStatus === expected.status, `${metro.metroName}: Publisher status changed from expected ${expected.status} to ${metro.readinessStatus}`);
  }

  const relevanceConfig = (((rules.ecosystemReadiness || {}).metroRelevance || {})[metro.metroId]) || {};
  const evaluations = (metro.ecosystemReadiness || {}).evaluations || [];
  requireField(evaluations.length >= 7, `${metro.metroName}: missing ecosystem evaluations`);
  for (const evaluation of evaluations) {
    requireField(VALID_STATES.has(evaluation.readinessState), `${metro.metroName}: ${evaluation.ecosystemId} invalid readiness state ${evaluation.readinessState}`);
    requireField(VALID_RELEVANCE.has(evaluation.relevance), `${metro.metroName}: ${evaluation.ecosystemId} invalid relevance ${evaluation.relevance}`);
    requireField(evaluation.relevance === relevanceConfig[evaluation.ecosystemId] || Boolean(relevanceConfig[evaluation.ecosystemId]), `${metro.metroName}: ${evaluation.ecosystemId} relevance is not explicitly declared`);
    if (evaluation.relevance === "core") {
      requireField(evaluation.layers && Object.keys(evaluation.layers).length >= 6, `${metro.metroName}: core ecosystem ${evaluation.ecosystemId} missing layer analysis`);
      if (evaluation.readinessState === "missing" || evaluation.readinessState === "thin") {
        requireField(evaluation.blocking, `${metro.metroName}: core ${evaluation.ecosystemId} should block ecosystem readiness when ${evaluation.readinessState}`);
      }
    }
    if (evaluation.relevance === "not_applicable") {
      requireField(relevanceConfig[evaluation.ecosystemId] === "not_applicable", `${metro.metroName}: ${evaluation.ecosystemId} not_applicable was inferred instead of declared`);
    }
  }

  const office = evaluationFor(metro, "office");
  const industrial = evaluationFor(metro, "industrial_flex");
  if (office && industrial && office.readinessState === "developed" && industrial.relevance === "core" && ["missing", "thin"].includes(industrial.readinessState)) {
    requireField(!metro.ecosystemReadiness.passed, `${metro.metroName}: developed office coverage masked missing/thin industrial/flex coverage`);
  }

  const serialized = JSON.stringify({
    geographicReadiness: metro.geographicReadiness,
    ecosystemReadiness: metro.ecosystemReadiness,
    ecosystemBalance: metro.ecosystemBalance,
    ecosystemGaps: metro.ecosystemGaps,
  });
  ["undefined", "N/A", "[object Object]"].forEach((token) => {
    if (serialized.includes(token)) errors.push(`${metro.metroName}: ecosystem readiness output contains ${token}`);
  });
}

function validatePlans() {
  const recomputed = buildPublisherExpansionPlans(publisherSnapshot.analysis, { generatedAt: publisherPlans.generatedAt || publisherSnapshot.analysis.generatedAt });
  if (stableJson(recomputed) !== stableJson(publisherPlans)) {
    errors.push("Publisher expansion plans are not deterministic after ecosystem readiness changes.");
  }
  for (const plan of publisherPlans.metros || []) {
    requireField(plan.geographicReadiness, `${plan.metroName}: plan missing geographic readiness`);
    requireField(plan.ecosystemReadiness, `${plan.metroName}: plan missing ecosystem readiness`);
    requireField(plan.recommendedEcosystemSprint, `${plan.metroName}: plan missing recommended ecosystem sprint`);
    const sprint = plan.recommendedEcosystemSprint;
    if (sprint) {
      requireField(sprint.title && sprint.objective && sprint.rationale, `${plan.metroName}: ecosystem sprint missing title/objective/rationale`);
      requireField((sprint.completionCriteria || []).length > 0, `${plan.metroName}: ecosystem sprint missing completion criteria`);
      requireField((sprint.codexPrompt || "").includes("Commercial Ecosystem Framework"), `${plan.metroName}: ecosystem prompt missing framework context`);
      requireField(!(sprint.ecosystemId !== "office" && /Target ecosystem: Office/i.test(sprint.codexPrompt || "")), `${plan.metroName}: ecosystem prompt targets office for non-office sprint`);
    }
    const serialized = JSON.stringify(plan);
    ["undefined", "N/A", "[object Object]"].forEach((token) => {
      if (serialized.includes(token)) errors.push(`${plan.metroName}: generated plan contains ${token}`);
    });
  }
}

for (const metro of publisherSnapshot.analysis.metros || []) {
  validateMetro(metro);
}
validatePlans();

const sacramento = metroById("sacramento");
const sacramentoPlan = planById("sacramento");
if (sacramento) {
  const office = evaluationFor(sacramento, "office");
  const industrial = evaluationFor(sacramento, "industrial_flex");
  requireField(office && industrial, "Sacramento: missing office or industrial/flex evaluation");
  requireField(industrial && industrial.relevance === "core", "Sacramento: industrial/flex should be core");
  requireField(industrial && ["partial", "strong"].includes(industrial.readinessState), `Sacramento: industrial/flex should remain visible as partial or strong after Brief migration, got ${industrial && industrial.readinessState}`);
  requireField(sacramento.ecosystemReadiness.state === "partial", `Sacramento: expected ecosystem readiness partial, got ${sacramento.ecosystemReadiness.state}`);
  if (industrial && industrial.readinessState === "thin") {
    requireField(sacramento.blockingEcosystems.includes("industrial_flex"), "Sacramento: thin industrial/flex should block ecosystem readiness");
  } else if (industrial && industrial.readinessState === "partial") {
    requireField(!sacramento.blockingEcosystems.includes("industrial_flex"), "Sacramento: partial industrial/flex should not remain a blocking ecosystem after representative-building foundation");
    requireField(industrial.layers && industrial.layers.buildingBriefs === "missing", "Sacramento: partial industrial/flex should expose missing Building Brief depth");
  } else if (industrial && industrial.readinessState === "strong") {
    requireField(!sacramento.blockingEcosystems.includes("industrial_flex"), "Sacramento: strong industrial/flex should not remain a blocking ecosystem after Building Brief migration");
    requireField(industrial.layers && ["strong", "developed"].includes(industrial.layers.buildingBriefs), `Sacramento: industrial/flex should expose added Building Brief depth, got ${industrial.layers && industrial.layers.buildingBriefs}`);
  }
}
if (sacramentoPlan && sacramentoPlan.recommendedEcosystemSprint) {
  requireField(sacramentoPlan.recommendedEcosystemSprint.ecosystemId === "industrial_flex", `Sacramento: expected industrial/flex ecosystem sprint, got ${sacramentoPlan.recommendedEcosystemSprint.ecosystemId}`);
  if (sacramentoPlan.recommendedEcosystemSprint.title === "Sacramento Industrial & Flex Ecosystem Representative Building Foundation") {
    errors.push("Sacramento: completed industrial/flex Representative Building Foundation is still recommended");
  }
  requireField(!/Office Building Brief Migration$/.test(sacramentoPlan.recommendedEcosystemSprint.title), "Sacramento: office Building Brief migration outranked industrial/flex ecosystem work");
}

const sanFrancisco = metroById("san-francisco");
if (sanFrancisco) {
  requireField(["strong", "partial"].includes(sanFrancisco.ecosystemReadiness.state), `San Francisco: expected ecosystem readiness strong or partial, got ${sanFrancisco.ecosystemReadiness.state}`);
  requireField(evaluationFor(sanFrancisco, "office").readinessState === "developed", "San Francisco: office should be developed");
  requireField(["partial", "developed"].includes(evaluationFor(sanFrancisco, "industrial_flex").readinessState), "San Francisco: industrial/flex should be partial or developed");
}

const eastBay = metroById("east-bay");
if (eastBay) {
  const lifeScience = evaluationFor(eastBay, "life_science");
  const retail = evaluationFor(eastBay, "retail");
  const medical = evaluationFor(eastBay, "medical");
  const eastBayPlan = planById("east-bay");
  requireField(lifeScience && lifeScience.counts && lifeScience.counts.secondaryDistricts >= 2, "East Bay: life science should retain secondary district evidence.");
  requireField(lifeScience && lifeScience.layers && ["strong", "developed"].includes(lifeScience.layers.subtypes), `East Bay: life science secondary subtype breadth should be credited, got ${lifeScience && lifeScience.layers && lifeScience.layers.subtypes}`);
  requireField(lifeScience && lifeScience.layers && ["strong", "developed"].includes(lifeScience.layers.archetypes), `East Bay: life science secondary archetype breadth should be credited, got ${lifeScience && lifeScience.layers && lifeScience.layers.archetypes}`);
  requireField(lifeScience && lifeScience.layers && ["strong", "developed"].includes(lifeScience.layers.activities), `East Bay: life science secondary activity breadth should be credited, got ${lifeScience && lifeScience.layers && lifeScience.layers.activities}`);
  requireField(!((lifeScience && lifeScience.gaps) || []).includes("Subtype breadth is thin."), "East Bay: completed life-science subtype expansion should not remain open.");
  requireField(!((eastBayPlan && eastBayPlan.recommendedEcosystemSprint || {}).title || "").includes("Life Science Ecosystem Subtype Expansion"), "East Bay: completed Life Science subtype sprint should not remain recommended.");
  requireField(retail && retail.counts && retail.counts.representativeBuildings >= 2, `East Bay: retail Representative Building foundation should be credited, got ${retail && retail.counts && retail.counts.representativeBuildings}`);
  requireField(retail && retail.layers && ["strong", "developed"].includes(retail.layers.representativeBuildings), `East Bay: retail Representative Building layer should be strong or developed, got ${retail && retail.layers && retail.layers.representativeBuildings}`);
  requireField(!((retail && retail.gaps) || []).includes("Representative Building coverage is missing for this ecosystem."), "East Bay: completed retail Representative Building foundation should not remain open.");
  requireField(!((eastBayPlan && eastBayPlan.recommendedEcosystemSprint || {}).title || "").includes("Retail Ecosystem Representative Building Foundation"), "East Bay: completed Retail Representative Building Foundation should not remain recommended.");
  requireField(medical && medical.counts && medical.counts.districts >= 1, `East Bay: medical district foundation should be credited, got ${medical && medical.counts && medical.counts.districts}`);
  requireField(medical && medical.layers && ["strong", "developed"].includes(medical.layers.districts), `East Bay: medical district layer should be strong or developed, got ${medical && medical.layers && medical.layers.districts}`);
  requireField(medical && medical.counts && medical.counts.representativeBuildings >= 1, `East Bay: medical Representative Building foundation should be credited, got ${medical && medical.counts && medical.counts.representativeBuildings}`);
  requireField(medical && medical.layers && ["strong", "developed"].includes(medical.layers.representativeBuildings), `East Bay: medical Representative Building layer should be strong or developed, got ${medical && medical.layers && medical.layers.representativeBuildings}`);
  requireField(medical && medical.representativeBuildingIntelligence && ["strong", "developed"].includes(medical.representativeBuildingIntelligence.state), `East Bay: medical Representative Building intelligence should be strong or developed after target calibration, got ${medical && medical.representativeBuildingIntelligence && medical.representativeBuildingIntelligence.state}`);
  requireField(medical && medical.counts && medical.counts.buildingBriefs >= 1, `East Bay: medical Building Brief migration should be credited, got ${medical && medical.counts && medical.counts.buildingBriefs}`);
  requireField(medical && medical.layers && ["strong", "developed"].includes(medical.layers.buildingBriefs), `East Bay: medical Building Brief layer should be strong or developed, got ${medical && medical.layers && medical.layers.buildingBriefs}`);
  requireField(!((medical && medical.gaps) || []).includes("No district coverage for this relevant ecosystem."), "East Bay: completed medical District Foundation should not remain open.");
  requireField(!((eastBayPlan && eastBayPlan.recommendedEcosystemSprint || {}).title || "").includes("Medical Ecosystem District Foundation"), "East Bay: completed Medical District Foundation should not remain recommended.");
  requireField(!((medical && medical.gaps) || []).includes("Representative Building coverage is missing for this ecosystem."), "East Bay: completed medical Representative Building foundation should not remain open.");
  requireField(!((medical && medical.gaps) || []).includes("Representative Building operational coverage is thin."), "East Bay: completed medical Representative Building intelligence should not remain thin.");
  requireField(!((eastBayPlan && eastBayPlan.recommendedEcosystemSprint || {}).title || "").includes("Medical Ecosystem Representative Building Foundation"), "East Bay: completed Medical Representative Building Foundation should not remain recommended.");
  requireField(!((eastBayPlan && eastBayPlan.recommendedEcosystemSprint || {}).title || "").includes("Medical Ecosystem Building Brief Migration"), "East Bay: completed Medical Building Brief Migration should not remain recommended.");
}

["san-diego", "orange-county", "denver"].forEach((id) => {
  const metro = metroById(id);
  if (!metro) return;
  requireField(["partial", "strong"].includes(metro.ecosystemReadiness.state), `${metro.metroName}: expected partial or strong ecosystem readiness`);
  ["office", "industrial_flex", "medical", "retail"].forEach((ecosystemId) => {
    requireField(Boolean(evaluationFor(metro, ecosystemId)), `${metro.metroName}: missing ${ecosystemId} ecosystem visibility`);
  });
});

const denver = metroById("denver");
if (denver) {
  const industrial = evaluationFor(denver, "industrial_flex");
  const office = evaluationFor(denver, "office");
  const retail = evaluationFor(denver, "retail");
  const medical = evaluationFor(denver, "medical");
  requireField(industrial && ["developed", "strong"].includes(industrial.readinessState), `Denver: expected industrial/flex readiness developed or strong after Building Brief migration, got ${industrial && industrial.readinessState}`);
  requireField(industrial && industrial.layers && industrial.layers.buildingBriefs === "developed", `Denver: expected developed industrial/flex Building Brief depth, got ${industrial && industrial.layers && industrial.layers.buildingBriefs}`);
  requireField(denver.ecosystemBalance && denver.ecosystemBalance.state === "balanced", `Denver: expected balanced ecosystem state after balance sprint, got ${denver.ecosystemBalance && denver.ecosystemBalance.state}`);
  requireField(!((denver.ecosystemBalance || {}).warnings || []).some((warning) => /Industrial & Flex Building Brief depth may mask gaps/i.test(warning)), "Denver: industrial/flex brief concentration warning should be closed after balance sprint");
  requireField(office && office.counts && office.counts.buildingBriefs >= 1, "Denver: office Building Brief depth should be visible after balance sprint");
  requireField(retail && retail.counts && retail.counts.buildingBriefs >= 1, "Denver: retail Building Brief depth should be visible after balance sprint");
  requireField(medical && medical.counts && medical.counts.buildingBriefs >= 1, "Denver: medical Building Brief depth should be visible after balance sprint");
}

const seattle = metroById("seattle");
if (seattle) {
  const office = evaluationFor(seattle, "office");
  const industrial = evaluationFor(seattle, "industrial_flex");
  requireField(seattle.compassStatus === "ready", `Seattle: expected Compass ready after recommendation QA documentation, got ${seattle.compassStatus}`);
  requireField(seattle.qaStatus && seattle.qaStatus.qaStatus === "completed", "Seattle: expected completed recommendation QA status");
  requireField(!((seattle.gateBlockers || []).some((blocker) => blocker.code === "recommendation-qa-missing")), "Seattle: recommendation QA missing blocker should be closed");
  requireField(seattle.geographicReadiness.state === "developed", `Seattle: expected developed geographic readiness after QA documentation, got ${seattle.geographicReadiness.state}`);
  requireField(seattle.ecosystemReadiness.state === "partial", `Seattle: expected partial ecosystem readiness after office completion, got ${seattle.ecosystemReadiness.state}`);
  requireField(office && office.counts && office.counts.districts >= 5, `Seattle: expected office district foundation coverage, got ${office && office.counts && office.counts.districts}`);
  requireField(office && office.counts && office.counts.representativeBuildings >= 5, `Seattle: expected office representative-building foundation coverage, got ${office && office.counts && office.counts.representativeBuildings}`);
  requireField(office && office.counts && office.counts.buildingBriefs >= 5, `Seattle: expected initial office Building Brief collection, got ${office && office.counts && office.counts.buildingBriefs}`);
  requireField(office && office.layers && office.layers.districts === "developed", `Seattle: expected developed office district layer, got ${office && office.layers && office.layers.districts}`);
  requireField(office && office.layers && office.layers.representativeBuildings === "strong", `Seattle: expected strong office representative-building layer, got ${office && office.layers && office.layers.representativeBuildings}`);
  requireField(office && office.layers && office.layers.buildingBriefs === "developed", `Seattle: expected developed office Building Brief layer, got ${office && office.layers && office.layers.buildingBriefs}`);
  requireField(office && office.readinessState === "strong", `Seattle: expected strong office readiness after completion, got ${office && office.readinessState}`);
  requireField(industrial && industrial.counts && industrial.counts.districts >= 4, `Seattle: expected industrial/flex district foundation coverage, got ${industrial && industrial.counts && industrial.counts.districts}`);
  requireField(industrial && industrial.counts && industrial.counts.representativeBuildings >= 3, `Seattle: expected industrial/flex representative-building foundation coverage, got ${industrial && industrial.counts && industrial.counts.representativeBuildings}`);
  requireField(industrial && industrial.layers && industrial.layers.districts === "developed", `Seattle: expected developed industrial/flex district layer, got ${industrial && industrial.layers && industrial.layers.districts}`);
  requireField(industrial && industrial.layers && industrial.layers.representativeBuildings === "strong", `Seattle: expected strong industrial/flex representative-building layer, got ${industrial && industrial.layers && industrial.layers.representativeBuildings}`);
  requireField(industrial && industrial.readinessState === "strong", `Seattle: expected industrial/flex to reclassify to strong after Building Brief coverage, got ${industrial && industrial.readinessState}`);
  requireField(!((planById("seattle") || {}).recommendedEcosystemSprint || {}).title.includes("Industrial & Flex Ecosystem District Foundation"), "Seattle: completed industrial/flex District Foundation is still recommended");
  requireField(!((planById("seattle") || {}).recommendedEcosystemSprint || {}).title.includes("Industrial & Flex Ecosystem Representative Building Foundation"), "Seattle: completed industrial/flex Representative Building Foundation is still recommended");
  requireField(!((planById("seattle") || {}).recommendedEcosystemSprint || {}).title.includes("Office Ecosystem District Foundation"), "Seattle: completed office District Foundation is still recommended");
  requireField(!((planById("seattle") || {}).recommendedEcosystemSprint || {}).title.includes("Office Ecosystem Representative Building Foundation"), "Seattle: completed office Representative Building Foundation is still recommended");
}

console.log("Publisher Ecosystem Readiness QA");
for (const id of ["san-francisco", "sacramento", "san-diego", "orange-county", "denver", "seattle"]) {
  const metro = metroById(id);
  const plan = planById(id);
  if (!metro) continue;
  console.log(`\n${metro.metroName}`);
  console.log(`Geographic readiness: ${metro.geographicReadiness.label}`);
  console.log(`Ecosystem readiness: ${metro.ecosystemReadiness.label}`);
  console.log(`Balance: ${metro.ecosystemBalance.label}`);
  console.log(`Blocking ecosystems: ${(metro.blockingEcosystems || []).join(", ") || "none"}`);
  console.log(`Recommended ecosystem sprint: ${plan && plan.recommendedEcosystemSprint ? plan.recommendedEcosystemSprint.title : "none"}`);
}

if (warnings.length) console.log(`\nWarnings: ${warnings.join("; ")}`);
console.log(`\nErrors: ${errors.length ? errors.join("; ") : "none"}`);
if (errors.length) process.exit(1);
