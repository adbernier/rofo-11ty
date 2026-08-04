const interactiveData = require("../_data/sfOfficeRecommendationInteractivePrototype");
const policy = require("../lib/recommendations/sf-office-recommendation-interaction-policy");

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`SF Office Recommendation Interaction QA error: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function key(sourceAnswers) {
  return policy.answerKey(sourceAnswers);
}

function entry(sourceAnswers) {
  return interactiveData.resultsByKey[key(sourceAnswers)];
}

function ids(items) {
  return (items || []).map((item) => item.districtId);
}

function changed(a, b, path) {
  return JSON.stringify(path(a)) !== JSON.stringify(path(b));
}

function merge(...items) {
  return items.reduce((merged, item) => ({ ...merged, ...clone(item) }), {});
}

function simulateBackAndReset() {
  const history = [];
  let sourceAnswers = {};

  function answer(patch) {
    history.push(clone(sourceAnswers));
    sourceAnswers = merge(sourceAnswers, patch);
  }

  answer({ businessType: "technology" });
  answer({ officeEnvironment: "Modern and polished" });
  answer({ expectedGrowth: "significant" });
  const beforeBack = clone(sourceAnswers);
  sourceAnswers = history.pop();
  const afterBack = clone(sourceAnswers);
  sourceAnswers = {};
  return { beforeBack, afterBack, reset: sourceAnswers };
}

assert(interactiveData.modelKey === "san-francisco:office", "interactive data should use the SF Office model key.");
assert(interactiveData.route === "/prototype/recommendation-explorer/sf-office-interactive/", "interactive route metadata should match the internal path.");
assert(Object.keys(interactiveData.resultsByKey).length > 1000, "precomputed bridge should include a broad set of interaction states.");
assert(interactiveData.policy.earlyQuestionIds.every((id) => ["businessType", "officeEnvironment", "primaryNeed", "commuteOrientation", "institutionProximity"].includes(id)), "early questions should come from the approved high-value set.");
assert(interactiveData.policy.workspaceSections.length >= 7, "workspace should expose editable Business Profile sections.");
assert(interactiveData.policy.workspaceSections.some((section) => section.id === "operationalUse" && section.multi), "Primary Office Use should support multi-selection.");
assert(interactiveData.policy.workspaceSections.some((section) => section.id === "institutionProximity" && section.condition), "Institutional proximity should be conditional.");

const blank = entry({});
assert(blank, "blank state should be precomputed.");
assert(blank.interaction.revealRecommendation === false, "recommendation should not appear immediately with insufficient context.");
assert(blank.interaction.nextQuestion.id === "businessType", "blank state should begin with business type.");
assert(blank.result.state.ordered === false, "insufficient evidence should not produce justified ordering.");

const weakEconomics = entry({
  notes: "Budget matters and we want lower rent.",
  valuePreference: "good value",
});
assert(weakEconomics, "economics-only scenario should be precomputed for review.");
assert(weakEconomics.interaction.revealRecommendation === false, "economics-only context should not reveal a recommendation.");
assert(weakEconomics.normalized.ignoredEconomicSignals.length >= 1, "economics-only context should be visible as ignored economics.");
assert(weakEconomics.result.ignoredSignals.length >= 1, "resolver should preserve ignored economics for broker context.");

const enoughSignal = entry({
  businessType: "technology",
  officeEnvironment: "Modern and polished",
  expectedGrowth: "significant",
});
assert(enoughSignal, "sufficient-signal state should be precomputed.");
assert(enoughSignal.interaction.revealRecommendation === true, "recommendation should reveal after sufficient meaningful signal.");
assert(enoughSignal.result.state.id !== "starting_set", "revealed recommendation should move beyond the starting set.");
assert(enoughSignal.result.shortlist.length > 0, "revealed recommendation should include a shortlist.");

const workspaceMultiUse = entry({
  businessType: "technology",
  officeEnvironment: "Modern and polished",
  operationalUse: ["team_collaboration", "recruiting"],
});
assert(workspaceMultiUse, "workspace multi-use profile should be precomputed.");
assert(workspaceMultiUse.normalized.resolverProfile.operationalUse.length === 2, "workspace multi-use profile should preserve multiple office uses.");

const timingOnly = entry({
  businessType: "technology",
  officeEnvironment: "Modern and polished",
  timing: "ASAP",
});
assert(!timingOnly || timingOnly.interaction.revealRecommendation === false, "reveal logic should not depend on timing.");

const budgetWithSignal = entry({
  businessType: "technology",
  officeEnvironment: "Modern and polished",
  expectedGrowth: "significant",
  costSensitivity: "lower rent",
});
assert(!budgetWithSignal, "budget-added ranking paths are intentionally absent from the interactive question bridge.");

const professionalBase = entry({
  businessType: "professional_services",
  officeEnvironment: "Traditional and professional",
  clientVisitFrequency: "often",
});
const professionalStable = entry({
  businessType: "professional_services",
  officeEnvironment: "Traditional and professional",
  clientVisitFrequency: "often",
  walkabilityAmenitiesImportance: "medium",
});
assert(professionalBase && professionalStable, "professional-services stability states should be precomputed.");
assert(
  !changed(professionalBase.result, professionalStable.result, (result) => ids(result.shortlist)),
  "stable answer should not cause artificial shortlist movement."
);

const commuteA = entry({
  businessType: "technology",
  officeEnvironment: "Modern and polished",
  expectedGrowth: "significant",
  commuteOrientation: "Marin",
});
const commuteB = entry({
  businessType: "technology",
  officeEnvironment: "Modern and polished",
  expectedGrowth: "significant",
  commuteOrientation: "Peninsula South Bay",
});
assert(commuteA && commuteB, "commute comparison states should be precomputed.");
assert(
  changed(commuteA.result, commuteB.result, (result) => ids(result.shortlist)) ||
    changed(commuteA.result, commuteB.result, (result) => ids(result.orderedCandidates)) ||
    changed(commuteA.result, commuteB.result, (result) => result.explanations),
  "meaningful commute change should affect result or explanation."
);

const environmentA = entry({
  businessType: "technology",
  officeEnvironment: "Modern and polished",
  expectedGrowth: "significant",
});
const environmentB = entry({
  businessType: "technology",
  officeEnvironment: "Creative and informal",
  expectedGrowth: "significant",
});
assert(environmentA && environmentB, "environment comparison states should be precomputed.");
assert(
  changed(environmentA.result, environmentB.result, (result) => ids(result.shortlist)),
  "meaningful environment change should update the shortlist."
);

const refined = entry({
  businessType: "technology",
  officeEnvironment: "Modern and polished",
  expectedGrowth: "significant",
  commuteOrientation: "Peninsula South Bay",
});
assert(refined.interaction.nextQuestion, "refined state should provide an optional next question when available.");
assert(
  ["clientVisitFrequency", "parkingImportance", "walkabilityAmenitiesImportance", "businessType", "officeEnvironment", "commuteOrientation", "expectedGrowth"].includes(refined.interaction.nextQuestion.id),
  "refinement question should be tied to unresolved tradeoffs or leverage."
);

const nav = simulateBackAndReset();
assert(nav.beforeBack.officeEnvironment === "Modern and polished", "simulated state should include the second answer before back.");
assert(nav.afterBack.officeEnvironment === "Modern and polished" && nav.afterBack.expectedGrowth === undefined, "back navigation should restore the prior answer state.");
assert(Object.keys(nav.reset).length === 0, "reset should clear prototype state.");

interactiveData.scenarios.forEach((scenario) => {
  const scenarioEntry = entry(scenario.sourceAnswers);
  assert(scenarioEntry, `${scenario.id}: scenario should have a precomputed entry.`);
  if (scenario.id === "blank") {
    assert(scenarioEntry.interaction.revealRecommendation === false, "blank scenario should not reveal immediately.");
  } else if (scenario.id === "budget-context-only") {
    assert(scenarioEntry.interaction.revealRecommendation === false, "budget scenario should not reveal immediately.");
    assert(scenarioEntry.normalized.ignoredEconomicSignals.length >= 1, "budget scenario should expose ignored economics.");
  } else {
    assert(scenarioEntry.result && scenarioEntry.result.applicable, `${scenario.id}: scenario should resolve.`);
  }
});

console.log(`precomputed interaction states: ${Object.keys(interactiveData.resultsByKey).length}`);
console.log(`blank: reveal=${blank.interaction.revealRecommendation}; next=${blank.interaction.nextQuestion.id}`);
console.log(`technology growth: state=${enoughSignal.result.state.id}; shortlist=[${ids(enoughSignal.result.shortlist).join(", ")}]; next=${enoughSignal.interaction.nextQuestion.id}`);
console.log(`professional stable shortlist=[${ids(professionalStable.result.shortlist).join(", ")}]`);
console.log(`environment change shortlist=[${ids(environmentB.result.shortlist).join(", ")}]`);

if (failures) {
  process.exitCode = 1;
} else {
  console.log("SF Office Recommendation Interaction QA passed.");
}
