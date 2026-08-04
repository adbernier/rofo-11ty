const reviewData = require("../_data/sfOfficeRecommendationReviewProfiles");

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`SF Office Recommendation Review QA error: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function ids(items) {
  return (items || []).map((item) => item.districtId);
}

function hasAny(items, expectedIds) {
  const itemIds = new Set(ids(items));
  return expectedIds.some((id) => itemIds.has(id));
}

function objectDiffKeys(a = {}, b = {}) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return Array.from(keys).filter((key) => JSON.stringify(a[key]) !== JSON.stringify(b[key]));
}

const requiredProfileFields = [
  "id",
  "label",
  "businessDescription",
  "sourceAnswers",
  "importantFacts",
  "importantConstraints",
  "priorities",
  "intentionallyMissing",
  "expectedEditorialConsiderations",
  "reviewerQuestions",
  "normalized",
  "result",
  "reviewJudgment",
];

assert(reviewData.modelKey === "san-francisco:office", "review data should use the SF office model key.");
assert(reviewData.route === "/prototype/recommendation-explorer/sf-office-review/", "review route metadata should match the internal page.");
assert(reviewData.profiles.length >= 10 && reviewData.profiles.length <= 12, "review set should contain 10-12 profiles.");
assert(reviewData.sensitivityChecks.length >= 5, "review set should include at least five sensitivity checks.");

const seenProfileIds = new Set();
const districtExposure = new Set();

for (const profile of reviewData.profiles) {
  assert(!seenProfileIds.has(profile.id), `${profile.id}: profile ID should be unique.`);
  seenProfileIds.add(profile.id);

  for (const field of requiredProfileFields) {
    assert(profile[field] !== undefined, `${profile.id}: missing required field ${field}.`);
  }

  assert(profile.normalized.supported === true, `${profile.id}: should normalize to a supported SF office profile.`);
  assert(profile.normalized.modelKey === reviewData.modelKey, `${profile.id}: model key should normalize.`);
  assert(profile.result && profile.result.applicable === true, `${profile.id}: should resolve successfully.`);
  assert(profile.result.modelKey === reviewData.modelKey, `${profile.id}: resolver model key should match.`);
  assert(Array.isArray(profile.result.currentCandidates), `${profile.id}: current candidates should be present.`);
  assert(Array.isArray(profile.result.shortlist), `${profile.id}: shortlist should be present.`);
  assert(profile.result.shortlist.length > 0, `${profile.id}: shortlist should not be empty.`);
  assert(profile.result.confidence && profile.result.confidence.description, `${profile.id}: confidence description should be present.`);
  assert(profile.result.recommendedNextQuestion && profile.result.recommendedNextQuestion.prompt, `${profile.id}: next question should be present.`);
  assert(profile.reviewerQuestions.length >= 10, `${profile.id}: reviewer prompts should be present.`);

  ids(profile.result.currentCandidates).forEach((id) => districtExposure.add(id));
  ids(profile.result.shortlist).forEach((id) => districtExposure.add(id));
  ids(profile.result.secondaryAlternatives).forEach((id) => districtExposure.add(id));

  if (profile.id === "budget-language-no-ranking") {
    assert(profile.normalized.ignoredEconomicSignals.length >= 1, "budget profile: economic language should be captured by the normalizer.");
    assert(profile.result.ignoredSignals.length >= 1, "budget profile: resolver should report ignored economic signals.");
    assert(profile.result.economicsPolicy.budgetRankingAllowed === false, "budget profile: budget ranking must remain disabled.");
    assert(profile.result.economicsPolicy.dynamicMarketEconomicsUsed === false, "budget profile: dynamic market economics must remain disabled.");
    assert(profile.result.state.id === "starting_set", "budget profile: economics alone should not create ranking movement.");
  }

  if (profile.id === "small-founder-limited-information") {
    assert(profile.result.state.id === "starting_set", "limited-information profile should not receive unjustified ordering.");
    assert(profile.result.state.ordered === false, "limited-information profile should remain unordered.");
  }
}

[
  "financial-district",
  "soma",
  "mission-bay",
  "jackson-square",
  "south-beach",
].forEach((districtId) => {
  assert(districtExposure.has(districtId), `default district should appear in review exposure: ${districtId}.`);
});

[
  "showplace-square",
  "mission-district",
  "dogpatch",
  "design-district",
  "potrero-hill",
].forEach((districtId) => {
  assert(districtExposure.has(districtId), `signal-specific district should have credible review exposure: ${districtId}.`);
});

for (const check of reviewData.sensitivityChecks) {
  assert(check.id, "sensitivity check should have an ID.");
  assert(check.label, `${check.id}: sensitivity check should have a label.`);
  assert(check.base && check.base.result && check.base.result.applicable, `${check.id}: base should resolve.`);
  assert(check.variation && check.variation.result && check.variation.result.applicable, `${check.id}: variation should resolve.`);

  const changedKeys = objectDiffKeys(check.baseSourceAnswers, check.variationSourceAnswers);
  assert(changedKeys.length === 1, `${check.id}: variation should change exactly one top-level answer, changed ${changedKeys.join(", ")}.`);
  assert(changedKeys[0] === check.changedAnswer, `${check.id}: changed answer should be ${check.changedAnswer}.`);

  const comparison = check.comparison;
  assert(
    comparison.candidateSetChanged ||
      comparison.orderedCandidatesChanged ||
      comparison.shortlistChanged ||
      comparison.unresolvedTradeoffsChanged ||
      comparison.nextQuestionChanged ||
      comparison.explanationCountChanged ||
      comparison.confidenceChanged,
    `${check.id}: one-answer variation should produce at least one observable review difference.`
  );
}

assert(hasAny(
  reviewData.profiles.find((profile) => profile.id === "healthcare-ucsf-proximity").result.shortlist,
  ["mission-bay"]
), "healthcare/UCSF profile should keep Mission Bay in the shortlist.");

assert(hasAny(
  reviewData.profiles.find((profile) => profile.id === "creative-architecture-lower-rise").result.currentCandidates,
  ["design-district", "showplace-square"]
), "creative architecture profile should expose Design District or Showplace Square.");

assert(hasAny(
  reviewData.profiles.find((profile) => profile.id === "east-bay-bart-access").result.currentCandidates,
  ["financial-district", "soma", "south-beach"]
), "East Bay commute profile should expose broad central transit candidates.");

assert(reviewData.questionValueAnalysis.likelyHighValue.length >= 3, "question-value analysis should include likely high-value questions.");
assert(reviewData.questionValueAnalysis.possiblyUseful.length >= 2, "question-value analysis should include possibly useful questions.");
assert(reviewData.questionValueAnalysis.lowOrUnprovenValue.length >= 2, "question-value analysis should include low or unproven questions.");

for (const profile of reviewData.profiles) {
  console.log(`${profile.id}: state ${profile.result.state.id}; shortlist [${ids(profile.result.shortlist).join(", ")}]; next ${profile.result.recommendedNextQuestion.questionId}`);
}

for (const check of reviewData.sensitivityChecks) {
  console.log(`${check.id}: changed ${check.changedAnswer}; shortlistChanged=${check.comparison.shortlistChanged}; nextQuestionChanged=${check.comparison.nextQuestionChanged}`);
}

if (failures) {
  process.exitCode = 1;
} else {
  console.log("SF Office Recommendation Review QA passed.");
}
