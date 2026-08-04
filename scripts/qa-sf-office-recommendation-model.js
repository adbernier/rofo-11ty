const { resolveSfOfficeRecommendation, sfOfficeRecommendationModel } = require("../lib/recommendations/sf-office-recommendation-resolver");

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`SF Office Recommendation QA error: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function ids(items) {
  return (items || []).map((item) => item.districtId);
}

function hasId(items, districtId) {
  return ids(items).includes(districtId);
}

function hasExplanation(result, districtId, signalId) {
  return (result.explanations || []).some((item) => item.districtId === districtId && item.signalId === signalId);
}

function assertNoEconomicsRanking(result, label) {
  assert(result.economicsPolicy && result.economicsPolicy.budgetRankingAllowed === false, `${label}: budget ranking must be disabled.`);
  assert(result.economicsPolicy && result.economicsPolicy.costPositionUsed === false, `${label}: costPosition must not be used.`);
  assert(result.economicsPolicy && result.economicsPolicy.dynamicMarketEconomicsUsed === false, `${label}: dynamic economics must not be used.`);
}

const cases = [
  {
    label: "Case A: San Francisco + Office only",
    profile: {
      city: "San Francisco",
      spaceType: "Office",
    },
    check(result) {
      assert(result.applicable === true, "Case A: model should apply.");
      assert(result.state.id === "starting_set", "Case A: should return starting_set.");
      assert(result.state.ordered === false, "Case A: should not order the starting set.");
      assert(ids(result.currentCandidates).join("|") === sfOfficeRecommendationModel.initialConsiderationSet.join("|"), "Case A: current candidates must match the five-district initial set.");
      assert(result.shortlist.length === 5, "Case A: shortlist should contain five initial candidates.");
      assert(result.orderedCandidates.length === 0, "Case A: ordered candidates should be empty.");
      assert(result.recommendedNextQuestion && result.recommendedNextQuestion.questionId, "Case A: should return a next question.");
      assert(!hasId(result.currentCandidates, "san-francisco"), "Case A: must not recommend San Francisco back to the user.");
    },
  },
  {
    label: "Case B: growing client-facing recruiting-sensitive user",
    profile: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "18",
      expectedGrowth: "some",
      clientVisitFrequency: "often",
      recruitingImportance: "high",
      budget: "We do not want to overspend",
    },
    check(result) {
      assert(["emerging_ranking", "refined_shortlist"].includes(result.state.id), "Case B: should create meaningful differentiation.");
      assert(hasId(result.shortlist, "financial-district"), "Case B: Financial District should remain strong.");
      assert(hasId(result.shortlist, "south-beach"), "Case B: South Beach should remain strong.");
      assert(hasExplanation(result, "financial-district", "client_access"), "Case B: Financial District needs client-access explanation.");
      assert(hasExplanation(result, "soma", "recruiting"), "Case B: SoMa needs recruiting explanation.");
      assert(result.ignoredSignals.length === 1, "Case B: budget language should be preserved as ignored ranking signal.");
      assertNoEconomicsRanking(result, "Case B");
    },
  },
  {
    label: "Case C: Marin commute with lower-rise parking-balanced professional environment",
    profile: {
      city: "San Francisco",
      spaceType: "Office",
      commuteOrientation: "Marin",
      parkingImportance: "high",
      officeEnvironment: "lower-rise and neighborhood-oriented",
      clientVisitFrequency: "sometimes",
    },
    check(result) {
      assert(hasId(result.shortlist, "jackson-square"), "Case C: Jackson Square should be represented.");
      assert(hasId(result.currentCandidates, "potrero-hill") || hasId(result.secondaryAlternatives, "potrero-hill"), "Case C: Potrero Hill should enter or remain as a signal-specific alternative.");
      assert(hasId(result.currentCandidates, "dogpatch") || hasId(result.secondaryAlternatives, "dogpatch"), "Case C: Dogpatch should enter or remain as a signal-specific alternative.");
      assert(hasExplanation(result, "jackson-square", "commuteOrientation"), "Case C: Jackson Square needs commute explanation.");
      assert(hasExplanation(result, "potrero-hill", "officeEnvironment") || hasExplanation(result, "dogpatch", "officeEnvironment"), "Case C: signal-specific alternatives need environment explanation.");
    },
  },
  {
    label: "Case D: growing technology company",
    profile: {
      city: "San Francisco",
      spaceType: "Office",
      businessType: "technology",
      transitImportance: "high",
      recruitingImportance: "high",
      officeEnvironment: "modern and polished",
      expectedGrowth: "significant",
    },
    check(result) {
      assert(result.state.id === "refined_shortlist", "Case D: should return a refined shortlist.");
      assert(hasId(result.shortlist, "mission-bay"), "Case D: Mission Bay should be in the refined shortlist.");
      assert(hasId(result.shortlist, "soma"), "Case D: SoMa should be in the refined shortlist.");
      assert(result.shortlist.length !== 3 || result.shortlistSizeRationale.includes("defensible"), "Case D: any three-district result must be explained by defensible shortlist behavior.");
      assert(result.currentCandidates.length >= result.shortlist.length, "Case D: should not slice candidates to top three before current candidate evaluation.");
      assert(hasExplanation(result, "mission-bay", "growth_flexibility"), "Case D: Mission Bay needs growth explanation.");
      assert(hasExplanation(result, "showplace-square", "businessType"), "Case D: Showplace Square should enter through technology/product signal.");
    },
  },
  {
    label: "Case E: Jackson Square anchor with nearby alternatives",
    profile: {
      city: "San Francisco",
      spaceType: "Office",
      districtAnchor: "Jackson Square",
      openToNearbyAlternatives: true,
    },
    check(result) {
      assert(hasId(result.shortlist, "jackson-square"), "Case E: Jackson Square should be strongly represented.");
      assert(hasId(result.currentCandidates, "financial-district"), "Case E: Financial District should enter as a known nearby alternative.");
      assert(hasId(result.currentCandidates, "soma"), "Case E: SoMa should enter as a known nearby alternative.");
      assert(hasId(result.currentCandidates, "south-beach"), "Case E: South Beach should enter as a known nearby alternative.");
      assert(!hasId(result.currentCandidates, "design-district"), "Case E: should not expand to unsupported geographies.");
      assert(hasExplanation(result, "jackson-square", "districtAnchor"), "Case E: anchor explanation missing.");
    },
  },
  {
    label: "Case F: limited inputs leave five or more candidates",
    profile: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "20-50",
      transitImportance: "high",
      walkabilityAmenitiesImportance: "high",
    },
    check(result) {
      assert(result.shortlist.length >= 5, "Case F: five or more defensible candidates should remain.");
      assert(result.unresolvedTradeoffs.includes("preferred office environment"), "Case F: unresolved office environment should be returned.");
      assert(result.unresolvedTradeoffs.includes("employee commute orientation"), "Case F: unresolved commute orientation should be returned.");
      assert(result.recommendedNextQuestion && result.recommendedNextQuestion.questionId, "Case F: next question should be supplied.");
      assert(result.shortlistSizeRationale.includes("remain") || result.shortlistSizeRationale.includes("defensible"), "Case F: shortlist size rationale should explain why candidates remain.");
    },
  },
  {
    label: "Case G: budget or cost language",
    profile: {
      city: "San Francisco",
      spaceType: "Office",
      costSensitivity: "Cost matters",
      priorities: {
        budget: "Good value",
        cost: "Do not overspend",
      },
    },
    check(result) {
      assert(result.state.id === "starting_set", "Case G: cost language alone should not move beyond starting set.");
      assert(result.shortlist.length === 5, "Case G: cost language alone should preserve initial set.");
      assert(result.ignoredSignals.length >= 1, "Case G: cost language should be preserved as ignored signal.");
      assertNoEconomicsRanking(result, "Case G");
      assert(!result.explanations.some((item) => String(item.attributeLabel || "").includes("costPosition")), "Case G: explanations must not cite costPosition.");
    },
  },
];

for (const testCase of cases) {
  const result = resolveSfOfficeRecommendation(testCase.profile);
  testCase.check(result);
  const shortlist = ids(result.shortlist).join(", ");
  console.log(`${testCase.label}: ${result.state.id}; shortlist [${shortlist}]; next ${result.recommendedNextQuestion ? result.recommendedNextQuestion.questionId : "none"}`);
}

if (failures) {
  process.exitCode = 1;
} else {
  console.log("SF Office Recommendation QA passed.");
}
