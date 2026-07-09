const fs = require("fs");
const path = require("path");
const graph = require("../_data/locationKnowledgeGraph");
const profiles = require("../_data/recommendationProfiles");
const { resolveMarketPath } = require("../js/recommendation-resolver");

const root = path.join(__dirname, "..");
const scenarioPath = path.join(root, "data/recommendation-qa/sacramento-scenarios.json");
const reportPath = path.join(root, "docs/recommendation-qa/sacramento-pilot.md");
const scenarios = JSON.parse(fs.readFileSync(scenarioPath, "utf8"));

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function list(items) {
  if (!items || !items.length) return "- None";
  return items.map((item) => `- ${item}`).join("\n");
}

function scenarioResult(scenario) {
  const state = resolveMarketPath(scenario.profile, graph, profiles);
  const pathItems = state.recommendedPath || [];
  const primary = state.primaryRecommendation || pathItems[0] || null;
  const secondary = pathItems[1] || (state.compareWith && state.compareWith[0]) || null;
  const recommendationSlugs = pathItems.map((item) => item.slug);
  const expectedHits = (scenario.expectedSlugs || []).filter((slug) => recommendationSlugs.includes(slug));
  const tradeoffs = unique(pathItems.flatMap((item) => item.tradeoffs || []));
  const questions = unique(state.questionsToValidate || (primary && primary.questionsToValidate) || []);
  const strengths = unique(pathItems.flatMap((item) => item.strengths || []));
  const explanationPass = Boolean(
    primary &&
    primary.selectionRationale &&
    primary.tradeoffSummary &&
    Array.isArray(primary.validationFocus) &&
    primary.validationFocus.length &&
    secondary &&
    secondary.alternativeRationale
  );

  return {
    scenario,
    state,
    primary,
    secondary,
    recommendationSlugs,
    expectedHits,
    strengths,
    tradeoffs,
    questions,
    explanationPass,
    pass: Boolean(primary) && expectedHits.length > 0 && tradeoffs.length > 0 && questions.length > 0 && explanationPass,
  };
}

function diversitySummary(results) {
  const primaryCounts = results.reduce((counts, result) => {
    const key = result.primary ? result.primary.slug : "none";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const uniquePrimaryCount = Object.keys(primaryCounts).length;
  const repeated = Object.entries(primaryCounts)
    .filter(([, count]) => count > 1)
    .map(([slug, count]) => `${slug} (${count})`);
  return { uniquePrimaryCount, repeated };
}

const results = scenarios.map(scenarioResult);
const diversity = diversitySummary(results);
const generatedAt = new Date().toISOString();
const failures = results.filter((result) => !result.pass);

const lines = [
  "# Sacramento Recommendation QA Pilot",
  "",
  `Generated: ${generatedAt}`,
  "",
  "This internal QA report validates whether Sacramento Location Brief recommendations feel differentiated, explainable, defensible, and actionable using the current Commercial Location Knowledge Graph. It is not customer-facing content.",
  "",
  "## Summary",
  "",
  `- Scenarios reviewed: ${results.length}`,
  `- Scenarios passing baseline advisor-readiness checks: ${results.length - failures.length}`,
  `- Scenarios needing review: ${failures.length}`,
  `- Unique primary recommendations: ${diversity.uniquePrimaryCount}`,
  `- Repeated primary recommendations: ${diversity.repeated.length ? diversity.repeated.join(", ") : "None"}`,
  "",
  "Baseline checks require a primary recommendation, at least one expected directional match, meaningful tradeoffs, validation questions, and complete explainability fields. A pass does not mean the recommendation is final; it means the brief is credible enough for advisor review.",
  "",
  "## Recommendation Diversity Check",
  "",
  diversity.uniquePrimaryCount >= 4
    ? "The Sacramento pilot produces meaningfully different primary recommendations across the QA scenarios."
    : "The Sacramento pilot may still over-converge on too few primary recommendations and should be reviewed before marking final readiness.",
  "",
  "## Scenario Reviews",
  "",
];

results.forEach((result) => {
  const { scenario, state, primary, secondary } = result;
  lines.push(`### ${scenario.name}`);
  lines.push("");
  lines.push(`- Profile: ${scenario.profile.size} ${scenario.profile.spaceType} in ${scenario.profile.locations[0].label}`);
  lines.push(`- Priorities: ${scenario.profile.priorities.join(", ")}`);
  lines.push(`- Expected direction: ${scenario.expectedDirection}`);
  lines.push(`- Top recommendation: ${primary ? `${primary.label} (${primary.fitLabel})` : "None"}`);
  lines.push(`- Secondary recommendation: ${secondary ? secondary.label : "None"}`);
  lines.push(`- Confidence: ${state.confidenceLabel || "Unknown"}`);
  lines.push(`- Baseline QA result: ${result.pass ? "Pass" : "Needs review"}`);
  lines.push(`- Explanation quality: ${result.explanationPass ? "Pass" : "Needs review"}`);
  lines.push("");
  lines.push("Recommended market path:");
  lines.push(list((state.recommendedPath || []).map((item, index) => `${index + 1}. ${item.label} - ${item.fitLabel}: ${item.summary}`)));
  lines.push("");
  lines.push("Why this differs:");
  lines.push(result.expectedHits.length
    ? `- Matches expected directional nodes: ${result.expectedHits.join(", ")}`
    : "- Does not include an expected directional node; review graph fit, priority rules, or market path candidates.");
  lines.push("");
  lines.push("Selection rationale:");
  lines.push(list(primary && primary.selectionRationale ? [primary.selectionRationale] : []));
  lines.push("");
  lines.push("Matched priorities:");
  lines.push(list(primary && primary.matchedPriorities ? primary.matchedPriorities : []));
  lines.push("");
  lines.push("Tradeoff summary:");
  lines.push(list(primary && primary.tradeoffSummary ? [primary.tradeoffSummary] : []));
  lines.push("");
  lines.push("Alternative rationale:");
  lines.push(list(secondary && secondary.alternativeRationale ? [secondary.alternativeRationale] : []));
  lines.push("");
  lines.push("Validation focus:");
  lines.push(list(primary && primary.validationFocus ? primary.validationFocus : []));
  lines.push("");
  lines.push("Strengths surfaced:");
  lines.push(list(result.strengths.slice(0, 6)));
  lines.push("");
  lines.push("Tradeoffs surfaced:");
  lines.push(list(result.tradeoffs.slice(0, 6)));
  lines.push("");
  lines.push("Questions to validate:");
  lines.push(list(result.questions.slice(0, 5)));
  lines.push("");
  lines.push("Graph weaknesses exposed:");
  if (result.pass) {
    lines.push("- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.");
  } else {
    lines.push("- Recommendation direction needs manual review before Sacramento is treated as fully QA-complete.");
  }
  lines.push("");
});

lines.push("## Rofo Compass Coverage Preparation");
lines.push("");
lines.push("Future Rofo Compass Coverage dashboards can track metro QA with these fields:");
lines.push("");
lines.push("- qaStatus: pending | in_review | completed | needs_review");
lines.push("- lastQaDate");
lines.push("- scenarioCount");
lines.push("- scenariosPassing");
lines.push("- validationStatus");
lines.push("- reportPath");
lines.push("");
lines.push("Sacramento pilot metadata is stored in `_data/recommendationQaStatus.js`.");
lines.push("");

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${lines.join("\n")}\n`);

console.log(`Recommendation QA scenarios: ${results.length}`);
console.log(`Passing baseline checks: ${results.length - failures.length}`);
console.log(`Needs review: ${failures.length}`);
console.log(`Unique primary recommendations: ${diversity.uniquePrimaryCount}`);
console.log(`Report written: ${path.relative(root, reportPath)}`);
if (failures.length) {
  failures.forEach((result) => console.log(`- Needs review: ${result.scenario.id}`));
}
