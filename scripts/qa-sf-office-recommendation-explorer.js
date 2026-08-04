const { normalizeSfOfficeProfile, MODEL_KEY } = require("../lib/recommendations/normalize-sf-office-profile");
const { resolveSfOfficeRecommendation } = require("../lib/recommendations/sf-office-recommendation-resolver");
const prototypeData = require("../_data/sfOfficeRecommendationExplorerPrototype");

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`SF Office Explorer QA error: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function ids(items) {
  return (items || []).map((item) => item.districtId);
}

function has(items, districtId) {
  return ids(items).includes(districtId);
}

function evaluate(sourceAnswers) {
  const normalized = normalizeSfOfficeProfile(sourceAnswers);
  const result = normalized.supported ? resolveSfOfficeRecommendation(normalized.resolverProfile) : null;
  return { normalized, result };
}

function assertEconomicsIgnored(normalized, result, label) {
  assert(normalized.ignoredEconomicSignals.length >= 1, `${label}: economic language should be preserved.`);
  assert(result.ignoredSignals.length >= 1, `${label}: resolver should report ignored economics.`);
  assert(result.economicsPolicy.costPositionUsed === false, `${label}: costPosition must not be used.`);
  assert(result.economicsPolicy.dynamicMarketEconomicsUsed === false, `${label}: dynamic economics must not be used.`);
}

const cases = [
  {
    label: "minimal current profile",
    sourceAnswers: {
      locations: [{ label: "San Francisco", type: "city", city: "San Francisco", state: "CA" }],
      spaceType: "Office",
      size: "I'm not sure",
      locationIntent: "discover",
    },
    check(normalized, result) {
      assert(normalized.modelKey === MODEL_KEY, "minimal: model key should be selected.");
      assert(normalized.resolverProfile.city === "San Francisco", "minimal: city should normalize.");
      assert(normalized.resolverProfile.spaceType === "Office", "minimal: space type should normalize.");
      assert(result.state.id === "starting_set", "minimal: should show starting set.");
      assert(result.shortlist.length === 5, "minimal: should show five initial districts.");
      assert(result.state.ordered === false, "minimal: should not order.");
    },
  },
  {
    label: "client-facing recruiting-sensitive business",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "18",
      expectedGrowth: "some",
      clientVisitFrequency: "often",
      recruitingImportance: "high",
    },
    check(normalized, result) {
      assert(normalized.sourceMappings.some((item) => item.targetField === "clientVisitFrequency"), "client/recruiting: client field should map.");
      assert(normalized.sourceMappings.some((item) => item.targetField === "recruitingImportance"), "client/recruiting: recruiting field should map.");
      assert(result.state.id === "emerging_ranking", "client/recruiting: should produce emerging ranking.");
      assert(has(result.shortlist, "financial-district"), "client/recruiting: Financial District should be present.");
      assert(has(result.shortlist, "south-beach"), "client/recruiting: South Beach should be present.");
    },
  },
  {
    label: "technology growth company seeking modern space",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      businessType: "technology",
      expectedGrowth: "significant",
      recruitingImportance: "high",
      transitImportance: "high",
      officeEnvironment: "Modern and polished",
    },
    check(normalized, result) {
      assert(normalized.resolverProfile.officeEnvironment === "modern_polished", "tech/growth: environment should normalize.");
      assert(result.state.id === "refined_shortlist", "tech/growth: should be refined.");
      assert(has(result.shortlist, "mission-bay"), "tech/growth: Mission Bay should be present.");
      assert(has(result.currentCandidates, "showplace-square"), "tech/growth: Showplace Square should enter through tech signal.");
    },
  },
  {
    label: "Marin lower-rise parking-balanced user",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      commuteOrientation: "Marin",
      parkingImportance: "high",
      officeEnvironment: "Lower-rise and neighborhood-oriented",
      clientVisitFrequency: "sometimes",
    },
    check(normalized, result) {
      assert(normalized.resolverProfile.commuteOrientation === "marin", "Marin: commute should normalize.");
      assert(normalized.resolverProfile.officeEnvironment === "lower_rise_neighborhood", "Marin: environment should normalize.");
      assert(result.state.id === "refined_shortlist", "Marin: should be refined.");
      assert(has(result.shortlist, "jackson-square"), "Marin: Jackson Square should remain represented.");
      assert(has(result.currentCandidates, "dogpatch") || has(result.secondaryAlternatives, "dogpatch"), "Marin: Dogpatch should be visible.");
    },
  },
  {
    label: "budget or rent language",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      notes: "Budget matters. We want good value and do not want to overspend on rent.",
      priorities: {
        cost: "lower rent",
      },
    },
    check(normalized, result) {
      assertEconomicsIgnored(normalized, result, "budget");
      assert(result.state.id === "starting_set", "budget: economics alone should not move state.");
      assert(result.shortlist.length === 5, "budget: initial set should remain.");
    },
  },
  {
    label: "missing and malformed optional answers",
    sourceAnswers: {
      locations: [{ label: "San Francisco", type: "city", city: "San Francisco", state: "CA" }],
      spaceType: "Office",
      features: [null, "", "Transit access"],
      expectedGrowth: "",
      officeEnvironment: "Not sure yet",
    },
    check(normalized, result) {
      assert(normalized.resolverProfile.transitImportance === "high", "malformed: Transit access feature should map.");
      assert(normalized.resolverProfile.officeEnvironment === "not_sure", "malformed: not sure environment should normalize.");
      assert(result.applicable === true, "malformed: resolver should remain applicable.");
    },
  },
  {
    label: "unsupported profile answers",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      favoriteLobbyColor: "blue",
      facts: {
        employeePets: "many",
      },
    },
    check(normalized) {
      assert(normalized.unsupportedAnswers.some((item) => item.sourceField === "favoriteLobbyColor"), "unsupported: top-level unsupported answer should be preserved.");
      assert(normalized.unsupportedAnswers.some((item) => item.sourceField === "facts.employeePets"), "unsupported: nested unsupported answer should be preserved.");
    },
  },
  {
    label: "conflicting priorities",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      clientVisitFrequency: "often",
      officeEnvironment: "Creative and informal",
      parkingImportance: "high",
    },
    check(normalized, result) {
      assert(normalized.resolverProfile.clientVisitFrequency === "often", "conflict: client visits should map.");
      assert(normalized.resolverProfile.officeEnvironment === "creative_informal", "conflict: environment should map.");
      assert(result.shortlist.length >= 4, "conflict: should preserve several defensible candidates.");
      assert(result.unresolvedTradeoffs.length >= 1, "conflict: should expose unresolved tradeoffs.");
    },
  },
];

for (const testCase of cases) {
  const { normalized, result } = evaluate(testCase.sourceAnswers);
  testCase.check(normalized, result);
  console.log(`${testCase.label}: model ${normalized.modelKey || "unsupported"}; state ${result ? result.state.id : "none"}; shortlist [${result ? ids(result.shortlist).join(", ") : ""}]`);
}

assert(prototypeData.route === "/prototype/recommendation-explorer/sf-office/", "prototype: route metadata should match the internal path.");
assert(prototypeData.samples.length >= 4, "prototype: should expose review samples.");
assert(prototypeData.samples.every((sample) => sample.normalized && sample.result), "prototype: every sample should include normalized profile and resolver output.");

if (failures) {
  process.exitCode = 1;
} else {
  console.log("SF Office Recommendation Explorer QA passed.");
}
