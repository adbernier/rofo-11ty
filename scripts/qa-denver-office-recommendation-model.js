#!/usr/bin/env node

const { resolveDenverOfficeRecommendation, denverOfficeRecommendationModel } = require("../lib/recommendations/denver-office-recommendation-resolver");

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`Denver Office Recommendation QA error: ${message}`);
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
  assert(!result.explanations.some((item) => String(item.attributeLabel || "").includes("costPosition")), `${label}: explanations must not cite costPosition.`);
}

const cases = [
  {
    label: "Case 1: minimal Denver Office profile",
    profile: { city: "Denver", spaceType: "Office" },
    check(result) {
      assert(result.applicable === true, "Case 1: model should apply.");
      assert(result.state.id === "starting_set", "Case 1: should return starting_set.");
      assert(result.state.ordered === false, "Case 1: should not order the starting set.");
      assert(ids(result.currentCandidates).join("|") === denverOfficeRecommendationModel.initialConsiderationSet.join("|"), "Case 1: candidates must match Denver initial set.");
      assert(result.shortlist.length === 5, "Case 1: should retain five starting districts.");
      assert(result.orderedCandidates.length === 0, "Case 1: ordered candidates should be empty.");
      assert(result.recommendedNextQuestion && result.recommendedNextQuestion.questionId, "Case 1: should return a next question.");
    },
  },
  {
    label: "Case 2: growing technology company",
    profile: {
      city: "Denver",
      spaceType: "Office",
      businessType: "technology",
      recruitingImportance: "high",
      expectedGrowth: "significant",
      officeEnvironment: "modern and polished",
    },
    check(result) {
      assert(["emerging_ranking", "refined_shortlist"].includes(result.state.id), "Case 2: should differentiate.");
      assert(hasId(result.shortlist, "denver-tech-center"), "Case 2: DTC should remain strong.");
      assert(hasId(result.shortlist, "downtown-denver") || hasId(result.shortlist, "rino"), "Case 2: central or creative tech option should remain.");
      assert(hasExplanation(result, "denver-tech-center", "growth_flexibility"), "Case 2: DTC needs growth explanation.");
      assertNoEconomicsRanking(result, "Case 2");
    },
  },
  {
    label: "Case 3: client-facing professional-services firm",
    profile: {
      city: "Denver",
      spaceType: "Office",
      businessType: "professional services",
      clientVisitFrequency: "often",
      officeEnvironment: "traditional and professional",
      commuteOrientation: "central city",
    },
    check(result) {
      assert(hasId(result.shortlist, "downtown-denver"), "Case 3: Downtown Denver should be represented.");
      assert(hasId(result.shortlist, "cherry-creek"), "Case 3: Cherry Creek should be represented.");
      assert(hasId(result.shortlist, "lodo"), "Case 3: LoDo should be represented.");
      assert(hasExplanation(result, "downtown-denver", "client_access"), "Case 3: Downtown Denver needs client access explanation.");
      assertNoEconomicsRanking(result, "Case 3");
    },
  },
  {
    label: "Case 4: law firm",
    profile: {
      city: "Denver",
      spaceType: "Office",
      businessType: "law firm",
      clientVisitFrequency: "often",
      officeEnvironment: "traditional and professional",
    },
    check(result) {
      assert(hasId(result.shortlist, "downtown-denver"), "Case 4: Downtown Denver should remain strong.");
      assert(hasId(result.shortlist, "cherry-creek"), "Case 4: Cherry Creek should remain strong.");
      assert(hasExplanation(result, "downtown-denver", "businessType"), "Case 4: Downtown Denver needs law-firm explanation.");
      assertNoEconomicsRanking(result, "Case 4");
    },
  },
  {
    label: "Case 5: healthcare administration",
    profile: {
      city: "Denver",
      spaceType: "Office",
      businessType: "healthcare",
      operationalUse: ["administrative office", "healthcare services"],
      parkingImportance: "high",
    },
    check(result) {
      assert(hasId(result.currentCandidates, "central-park"), "Case 5: Central Park should enter.");
      assert(hasId(result.shortlist, "central-park"), "Case 5: Central Park should be in shortlist.");
      assert(hasExplanation(result, "central-park", "businessType") || hasExplanation(result, "central-park", "institutionProximity"), "Case 5: Central Park needs healthcare explanation.");
      assertNoEconomicsRanking(result, "Case 5");
    },
  },
  {
    label: "Case 6: nonprofit or mission-driven organization",
    profile: {
      city: "Denver",
      spaceType: "Office",
      businessType: "nonprofit",
      transitImportance: "high",
      officeEnvironment: "creative and informal",
    },
    check(result) {
      assert(hasId(result.shortlist, "downtown-denver"), "Case 6: Downtown Denver should remain.");
      assert(hasId(result.shortlist, "lodo"), "Case 6: LoDo should remain.");
      assert(hasId(result.shortlist, "rino"), "Case 6: RiNo should remain.");
      assert(result.ignoredSignals.length === 0, "Case 6: should not create ignored economics.");
    },
  },
  {
    label: "Case 7: central-city preference",
    profile: {
      city: "Denver",
      spaceType: "Office",
      commuteOrientation: "central city",
      walkabilityAmenitiesImportance: "high",
    },
    check(result) {
      assert(hasId(result.shortlist, "downtown-denver"), "Case 7: Downtown should remain.");
      assert(hasId(result.shortlist, "lodo"), "Case 7: LoDo should remain.");
      assert(hasId(result.shortlist, "rino"), "Case 7: RiNo should remain.");
      assert(hasExplanation(result, "downtown-denver", "commuteOrientation"), "Case 7: central-city explanation missing.");
    },
  },
  {
    label: "Case 8: southeast metro orientation",
    profile: {
      city: "Denver",
      spaceType: "Office",
      commuteOrientation: "southeast metro",
      parkingImportance: "high",
      freewayAccessImportance: "high",
    },
    check(result) {
      assert(hasId(result.shortlist, "denver-tech-center"), "Case 8: DTC should be in shortlist.");
      assert(hasExplanation(result, "denver-tech-center", "commuteOrientation"), "Case 8: DTC needs southeast commute explanation.");
      assertNoEconomicsRanking(result, "Case 8");
    },
  },
  {
    label: "Case 9: parking-sensitive user",
    profile: {
      city: "Denver",
      spaceType: "Office",
      parkingImportance: "high",
      officeEnvironment: "lower-rise and neighborhood-oriented",
    },
    check(result) {
      assert(hasId(result.currentCandidates, "central-park"), "Case 9: Central Park should enter as parking-sensitive alternative.");
      assert(hasId(result.shortlist, "denver-tech-center") || hasId(result.shortlist, "central-park"), "Case 9: parking-oriented district should be shortlisted.");
      assert(hasExplanation(result, "central-park", "parking") || hasExplanation(result, "denver-tech-center", "parking"), "Case 9: parking explanation missing.");
    },
  },
  {
    label: "Case 10: transit-oriented user",
    profile: {
      city: "Denver",
      spaceType: "Office",
      commuteOrientation: "transit oriented",
      transitImportance: "high",
    },
    check(result) {
      assert(hasId(result.shortlist, "downtown-denver"), "Case 10: Downtown should remain.");
      assert(hasId(result.shortlist, "lodo"), "Case 10: LoDo should remain.");
      assert(hasExplanation(result, "lodo", "regional_transit"), "Case 10: LoDo needs transit explanation.");
    },
  },
  {
    label: "Case 11: conflicting priorities",
    profile: {
      city: "Denver",
      spaceType: "Office",
      businessType: "professional services",
      clientVisitFrequency: "often",
      officeEnvironment: "creative and informal",
      parkingImportance: "high",
    },
    check(result) {
      assert(result.shortlist.length >= 4, "Case 11: conflicting priorities should preserve a broader defensible set.");
      assert(result.unresolvedTradeoffs.length >= 1, "Case 11: unresolved tradeoffs should be visible.");
      assert(hasId(result.currentCandidates, "santa-fe-arts-district"), "Case 11: creative signal should introduce Santa Fe Arts District.");
    },
  },
  {
    label: "Case 12: budget or rent language",
    profile: {
      city: "Denver",
      spaceType: "Office",
      budget: "We want good value and do not want high rent.",
      priorities: {
        cost: "Cost matters",
        rent: "Keep rent practical",
      },
    },
    check(result) {
      assert(result.state.id === "starting_set", "Case 12: economics alone should not move beyond starting set.");
      assert(result.shortlist.length === 5, "Case 12: economics alone should preserve initial set.");
      assert(result.ignoredSignals.length >= 1, "Case 12: economic language should be preserved as ignored signal.");
      assertNoEconomicsRanking(result, "Case 12");
    },
  },
  {
    label: "Case 13: insufficient evidence remains unordered",
    profile: {
      city: "Denver",
      spaceType: "Office",
      headcount: "12",
    },
    check(result) {
      assert(result.state.id === "starting_set", "Case 13: non-ranking fact alone should remain starting set.");
      assert(result.state.ordered === false, "Case 13: insufficient evidence should not order candidates.");
      assert(result.orderedCandidates.length === 0, "Case 13: ordered candidates should remain empty.");
    },
  },
  {
    label: "Case 14: creative/showroom district outside current brief set",
    profile: {
      city: "Denver",
      spaceType: "Office",
      businessType: "design creative",
      operationalUse: "showroom presentation",
      officeEnvironment: "creative and informal",
    },
    check(result) {
      assert(hasId(result.currentCandidates, "santa-fe-arts-district"), "Case 14: Santa Fe Arts District should enter when creative/showroom signals justify it.");
      assert(hasExplanation(result, "santa-fe-arts-district", "businessType") || hasExplanation(result, "santa-fe-arts-district", "operationalUse"), "Case 14: Santa Fe Arts District needs signal explanation.");
    },
  },
];

for (const testCase of cases) {
  const result = resolveDenverOfficeRecommendation(testCase.profile);
  testCase.check(result);
  console.log(`${testCase.label}: ${result.state.id}; candidates [${ids(result.currentCandidates).join(", ")}]; shortlist [${ids(result.shortlist).join(", ")}]; next ${result.recommendedNextQuestion ? result.recommendedNextQuestion.questionId : "none"}; ignored economics ${result.ignoredSignals.length}`);
}

if (failures) {
  process.exitCode = 1;
} else {
  console.log("Denver Office Recommendation QA passed.");
}
