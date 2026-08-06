const { normalizeSfOfficeProfile } = require("../lib/recommendations/normalize-sf-office-profile");
const { resolveSfOfficeRecommendation } = require("../lib/recommendations/sf-office-recommendation-resolver");

const REVIEW_ROUTE = "/prototype/recommendation-explorer/sf-office-review/";
const MODEL_KEY = "san-francisco:office";

const reviewerPrompts = [
  "Is the starting candidate set correct?",
  "Is the shortlist directionally correct?",
  "Is any important district missing?",
  "Is any included district difficult to defend?",
  "Is the ordering justified?",
  "Are the explanations specific enough?",
  "Does confidence match the available evidence?",
  "Is the unresolved tradeoff the right one?",
  "Is the next question the highest-value question?",
  "Would answering the next question plausibly change the shortlist?",
  "Which missing input would be most useful?",
  "Which collected input appears to have little value?",
  "Overall result: approve, revise, or reject.",
];

const profiles = [
  {
    id: "professional-services-client-meetings",
    label: "Professional Services Firm With Frequent Client Meetings",
    businessDescription: "A 28-person advisory and accounting firm wants a credible San Francisco office where partners can host clients several times each week.",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "28",
      regularOccupancy: "most weekdays",
      hybridWorkPattern: "3-4 days in office",
      expectedGrowth: "some",
      clientVisitFrequency: "often",
      recruitingImportance: "medium",
      businessType: "professional_services",
      operationalUse: ["client_meetings", "quiet_focused_work"],
      officeEnvironment: "Traditional and professional",
      transitImportance: "high",
      walkabilityAmenitiesImportance: "high",
    },
    importantFacts: ["28 employees", "frequent client meetings", "professional-services use", "most-weekday occupancy"],
    importantConstraints: ["San Francisco office search", "needs credible client access"],
    priorities: ["client access", "professional image", "regional transit", "walkable amenities"],
    intentionallyMissing: ["employee home geography", "district anchor", "exact square footage"],
    expectedEditorialConsiderations: [
      "Financial District, Jackson Square, and South Beach should be easy to defend.",
      "Creative-neighborhood districts should not disappear if evidence remains broad, but should not lead.",
    ],
    reviewerQuestions: reviewerPrompts,
  },
  {
    id: "early-stage-technology-growth",
    label: "Early-Stage Technology Company Prioritizing Recruiting and Growth",
    businessDescription: "A 16-person AI infrastructure startup expects to grow quickly and wants a modern, talent-friendly office that can support recruiting.",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "16",
      regularOccupancy: "3 days per week",
      hybridWorkPattern: "hybrid",
      expectedGrowth: "significant",
      clientVisitFrequency: "rarely",
      recruitingImportance: "high",
      businessType: "technology",
      operationalUse: ["team_collaboration", "recruiting"],
      officeEnvironment: "Modern and polished",
      transitImportance: "high",
      approximateSquareFootage: "2,500-5,000 sqft",
    },
    importantFacts: ["16 employees", "significant growth", "technology company", "rare client visits"],
    importantConstraints: ["San Francisco office search"],
    priorities: ["recruiting", "growth flexibility", "modern environment", "regional transit"],
    intentionallyMissing: ["commute orientation", "district anchor", "parking preference"],
    expectedEditorialConsiderations: [
      "SoMa and Mission Bay should be strong.",
      "Showplace Square or Dogpatch may enter through technology signals, but should remain defensible rather than forced.",
    ],
    reviewerQuestions: reviewerPrompts,
  },
  {
    id: "established-tech-hybrid",
    label: "Established Technology Company With Hybrid Attendance",
    businessDescription: "A 90-person software company needs a San Francisco hub for hybrid collaboration without assuming everyone is in the office daily.",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "90",
      regularOccupancy: "about half the team on peak days",
      hybridWorkPattern: "2-3 days in office",
      expectedGrowth: "medium",
      clientVisitFrequency: "sometimes",
      recruitingImportance: "high",
      businessType: "technology",
      operationalUse: ["team_collaboration"],
      officeEnvironment: "Modern and polished",
      transitImportance: "high",
      walkabilityAmenitiesImportance: "high",
    },
    importantFacts: ["90 employees", "hybrid attendance", "technology company", "moderate growth"],
    importantConstraints: ["San Francisco office search"],
    priorities: ["recruiting", "transit", "amenities", "modern environment"],
    intentionallyMissing: ["employee commute orientation", "parking priority", "district anchor"],
    expectedEditorialConsiderations: [
      "The model should avoid pretending exact attendance creates precise district ranking.",
      "Strong central and modern-growth districts should remain visible.",
    ],
    reviewerQuestions: reviewerPrompts,
  },
  {
    id: "investment-firm-credibility",
    label: "Investment Firm Seeking Credibility and Convenience",
    businessDescription: "A 14-person investment office wants convenience for visiting partners and a polished, credible address.",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "14",
      expectedGrowth: "low",
      clientVisitFrequency: "often",
      recruitingImportance: "medium",
      businessType: "professional_services",
      operationalUse: ["client_meetings"],
      officeEnvironment: "Traditional and professional",
      transitImportance: "high",
      walkabilityAmenitiesImportance: "high",
    },
    importantFacts: ["14 employees", "investment/professional-services context", "frequent partner visits"],
    importantConstraints: ["San Francisco office search"],
    priorities: ["credibility", "client access", "convenience", "amenities"],
    intentionallyMissing: ["commute orientation", "parking importance"],
    expectedEditorialConsiderations: [
      "Financial District should likely lead or remain tied near the top.",
      "Jackson Square and South Beach should be credible alternatives.",
    ],
    reviewerQuestions: reviewerPrompts,
  },
  {
    id: "creative-architecture-lower-rise",
    label: "Architecture Studio Preferring Distinctive Lower-Rise Space",
    businessDescription: "A 22-person architecture studio wants a distinctive, design-forward office that feels less corporate and supports occasional client presentations.",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "22",
      expectedGrowth: "some",
      clientVisitFrequency: "sometimes",
      recruitingImportance: "high",
      businessType: "design_creative",
      operationalUse: ["showroom_presentation", "team_collaboration"],
      officeEnvironment: "Creative and informal",
      parkingImportance: "high",
      walkabilityAmenitiesImportance: "medium",
    },
    importantFacts: ["22 employees", "design/architecture context", "occasional client presentations"],
    importantConstraints: ["San Francisco office search"],
    priorities: ["distinctive character", "creative environment", "parking practicality", "recruiting"],
    intentionallyMissing: ["commute orientation", "hard district anchor"],
    expectedEditorialConsiderations: [
      "Design District and Showplace Square should have a credible path into consideration.",
      "Financial District should not rank highly solely because clients visit sometimes.",
    ],
    reviewerQuestions: reviewerPrompts,
  },
  {
    id: "healthcare-ucsf-proximity",
    label: "Healthcare Company With Institutional Proximity Needs",
    businessDescription: "A healthcare analytics company collaborates with clinical and research partners and wants a San Francisco office near UCSF-related activity.",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "35",
      expectedGrowth: "some",
      clientVisitFrequency: "sometimes",
      recruitingImportance: "high",
      businessType: "life_science",
      operationalUse: ["lab_rd_adjacency", "team_collaboration"],
      institutionProximity: "UCSF",
      officeEnvironment: "Modern and polished",
      transitImportance: "high",
    },
    importantFacts: ["35 employees", "life-sciences-adjacent context", "institutional proximity need"],
    importantConstraints: ["UCSF proximity signal", "San Francisco office search"],
    priorities: ["institutional access", "modern environment", "recruiting"],
    intentionallyMissing: ["employee commute orientation", "parking importance"],
    expectedEditorialConsiderations: [
      "Mission Bay should be strongly represented.",
      "Dogpatch and Potrero Hill may enter as nearby or supporting alternatives through the institutional signal.",
    ],
    reviewerQuestions: reviewerPrompts,
  },
  {
    id: "marin-oriented-parking",
    label: "Marin-Oriented Company Balancing Commute and Parking",
    businessDescription: "A 20-person consulting company has leadership and several employees commuting from Marin and wants a professional but lower-rise office environment.",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "20",
      expectedGrowth: "low",
      clientVisitFrequency: "sometimes",
      recruitingImportance: "medium",
      commuteOrientation: "Marin",
      officeEnvironment: "Lower-rise and neighborhood-oriented",
      parkingImportance: "high",
      walkabilityAmenitiesImportance: "high",
    },
    importantFacts: ["20 employees", "Marin-oriented commute", "professional-services context in description only"],
    importantConstraints: ["Marin commute orientation"],
    priorities: ["parking practicality", "lower-rise character", "amenities", "professional environment"],
    intentionallyMissing: ["business type answer", "district anchor", "exact square footage"],
    expectedEditorialConsiderations: [
      "Jackson Square should remain easy to defend.",
      "Parking/lower-rise signals may introduce southern creative-neighborhood districts, but commute tradeoffs should remain visible.",
    ],
    reviewerQuestions: reviewerPrompts,
  },
  {
    id: "east-bay-bart-access",
    label: "East Bay-Oriented Company Prioritizing BART Access",
    businessDescription: "A 32-person nonprofit-adjacent office has many employees coming from Oakland and Berkeley and wants a transit-accessible San Francisco location.",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "32",
      clientVisitFrequency: "sometimes",
      recruitingImportance: "medium",
      businessType: "nonprofit",
      commuteOrientation: "East Bay",
      officeEnvironment: "Creative and informal",
      transitImportance: "high",
      walkabilityAmenitiesImportance: "high",
    },
    importantFacts: ["32 employees", "East Bay commute orientation", "nonprofit-adjacent culture"],
    importantConstraints: ["East Bay commute orientation", "San Francisco-only search"],
    priorities: ["regional transit", "walkability", "creative culture"],
    intentionallyMissing: ["expected growth", "parking preference", "hard district anchor"],
    expectedEditorialConsiderations: [
      "Financial District and SoMa should remain credible due to broad transit orientation.",
      "Mission District may enter through nonprofit, walkability, and creative signals if the model supports it.",
    ],
    reviewerQuestions: reviewerPrompts,
  },
  {
    id: "peninsula-caltrain-consideration",
    label: "Peninsula-Oriented Company With Caltrain Considerations",
    businessDescription: "A 45-person robotics software company has employees split between San Francisco and the Peninsula and wants a practical office for collaboration days.",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "45",
      regularOccupancy: "peak collaboration days",
      hybridWorkPattern: "2 days in office",
      expectedGrowth: "some",
      recruitingImportance: "high",
      businessType: "technology",
      commuteOrientation: "Peninsula South Bay",
      operationalUse: ["team_collaboration"],
      officeEnvironment: "Modern and polished",
      transitImportance: "high",
    },
    importantFacts: ["45 employees", "hybrid collaboration days", "technology company"],
    importantConstraints: ["Peninsula/South Bay commute orientation"],
    priorities: ["regional transit", "modern environment", "recruiting"],
    intentionallyMissing: ["client visit frequency", "parking priority"],
    expectedEditorialConsiderations: [
      "SoMa, Mission Bay, and South Beach should be easier to defend than north-of-Market boutique districts.",
      "The model should not make precise Caltrain claims beyond its broad Peninsula/South Bay orientation support.",
    ],
    reviewerQuestions: reviewerPrompts,
  },
  {
    id: "small-founder-limited-information",
    label: "Small Founder-Led Company With Limited Information",
    businessDescription: "A founder knows the company needs a small San Francisco office but has not yet clarified commute, office style, client visits, or growth.",
    sourceAnswers: {
      locations: [{ label: "San Francisco", type: "city", city: "San Francisco", state: "CA" }],
      spaceType: "Office",
      size: "I'm not sure",
      locationIntent: "discover",
      headcount: "6",
    },
    importantFacts: ["6 employees", "San Francisco office search"],
    importantConstraints: ["none beyond market and space type"],
    priorities: ["not yet known"],
    intentionallyMissing: ["commute orientation", "office environment", "client visit frequency", "growth expectations", "business type"],
    expectedEditorialConsiderations: [
      "The model should avoid false precision.",
      "The next question should target a genuinely differentiating unknown.",
    ],
    reviewerQuestions: reviewerPrompts,
  },
  {
    id: "client-access-creative-conflict",
    label: "Company With Client Access and Creative Environment Tension",
    businessDescription: "A brand strategy firm hosts clients often but also wants a creative, informal office that does not feel like a conventional corporate tower.",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "18",
      expectedGrowth: "some",
      clientVisitFrequency: "often",
      recruitingImportance: "high",
      businessType: "design_creative",
      operationalUse: ["client_meetings", "showroom_presentation"],
      officeEnvironment: "Creative and informal",
      transitImportance: "high",
      parkingImportance: "high",
      notes: "We want something impressive but still cool.",
    },
    importantFacts: ["18 employees", "frequent client meetings", "brand/creative business"],
    importantConstraints: ["San Francisco office search"],
    priorities: ["client access", "creative environment", "recruiting", "parking"],
    intentionallyMissing: ["commute orientation", "preferred tradeoff between client polish and creative character"],
    expectedEditorialConsiderations: [
      "This should preserve multiple defensible candidates rather than forcing one style.",
      "Reviewer should assess whether explanations clearly express the client-access versus creative-character tension.",
    ],
    reviewerQuestions: reviewerPrompts,
  },
  {
    id: "budget-language-no-ranking",
    label: "Company Using Strong Budget and Value Language",
    businessDescription: "A 12-person operations consultancy says cost matters and asks for good value, but provides little else that should affect district ranking.",
    sourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "12",
      expectedGrowth: "low",
      notes: "Budget is tight. We want good value and lower rent. We do not want to overspend.",
      priorities: {
        cost: "lower rent",
        value: "good value",
      },
      valuePreference: "avoid expensive options",
    },
    importantFacts: ["12 employees", "strong budget/value language"],
    importantConstraints: ["San Francisco office search"],
    priorities: ["cost/value language preserved for broker context only"],
    intentionallyMissing: ["commute orientation", "business type", "office environment", "client visit frequency"],
    expectedEditorialConsiderations: [
      "Budget and rent language must not move districts.",
      "The output should remain low-confidence or starting-set-like unless non-economic signals differentiate it.",
    ],
    reviewerQuestions: reviewerPrompts,
  },
];

const sensitivityChecks = [
  {
    id: "client-meetings-frequency",
    label: "Client meetings: often versus rarely without duplicate use signal",
    baseSourceAnswers: {
      city: "San Francisco",
      spaceType: "Office",
      headcount: "28",
      expectedGrowth: "some",
      clientVisitFrequency: "often",
      recruitingImportance: "medium",
      businessType: "professional_services",
      operationalUse: ["quiet_focused_work"],
      officeEnvironment: "Traditional and professional",
      transitImportance: "high",
      walkabilityAmenitiesImportance: "high",
    },
    changedAnswer: "clientVisitFrequency",
    variationSourceAnswers: { clientVisitFrequency: "rarely" },
    expectedReviewFocus: "Whether client-access priority materially changes ordering, explanation, and next question when it is not duplicated by an operational-use answer.",
  },
  {
    id: "commute-marin-to-east-bay",
    label: "Commute orientation: Marin versus East Bay",
    baseProfileId: "marin-oriented-parking",
    changedAnswer: "commuteOrientation",
    variationSourceAnswers: { commuteOrientation: "East Bay" },
    expectedReviewFocus: "Whether broad commute orientation moves central transit districts without unsupported precision.",
  },
  {
    id: "environment-modern-to-creative",
    label: "Environment: modern polished versus creative informal",
    baseProfileId: "early-stage-technology-growth",
    changedAnswer: "officeEnvironment",
    variationSourceAnswers: { officeEnvironment: "Creative and informal" },
    expectedReviewFocus: "Whether environment preference introduces or elevates creative/product districts.",
  },
  {
    id: "parking-added",
    label: "Parking priority added",
    baseProfileId: "peninsula-caltrain-consideration",
    changedAnswer: "parkingImportance",
    variationSourceAnswers: { parkingImportance: "high" },
    expectedReviewFocus: "Whether parking adds signal-specific alternatives without erasing transit-fit districts.",
  },
  {
    id: "hard-anchor-versus-nearby",
    label: "Jackson Square: hard focus versus nearby alternatives",
    baseSourceAnswers: {
      locations: [{ label: "Jackson Square", type: "district", city: "San Francisco", state: "CA" }],
      spaceType: "Office",
      locationIntent: "compare",
    },
    changedAnswer: "locationIntent",
    variationSourceAnswers: { locationIntent: "focus" },
    expectedReviewFocus: "Whether a hard anchor excludes other districts while a soft anchor introduces known nearby alternatives.",
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function serialize(value) {
  return JSON.stringify(value, null, 2);
}

function districtIds(items) {
  return (items || []).map((item) => item.districtId);
}

function mergeAnswers(base, patch) {
  return {
    ...clone(base),
    ...clone(patch),
  };
}

function evaluateSourceAnswers(sourceAnswers) {
  const normalized = normalizeSfOfficeProfile(sourceAnswers);
  const result = normalized.supported
    ? resolveSfOfficeRecommendation(normalized.resolverProfile)
    : null;
  return {
    normalized,
    result,
    sourceAnswersJson: serialize(sourceAnswers),
    normalizedJson: serialize(normalized),
    resultJson: serialize(result),
  };
}

function normalizedFieldValue(normalized, field) {
  return normalized && normalized.resolverProfile
    ? normalized.resolverProfile[field]
    : undefined;
}

function compareResults(base, variation, changedAnswer) {
  const baseResult = base.result || {};
  const variationResult = variation.result || {};
  return {
    changedAnswer,
    normalizedBefore: normalizedFieldValue(base.normalized, changedAnswer),
    normalizedAfter: normalizedFieldValue(variation.normalized, changedAnswer),
    stateChanged: (baseResult.state && baseResult.state.id) !== (variationResult.state && variationResult.state.id),
    confidenceChanged: (baseResult.confidence && baseResult.confidence.state) !== (variationResult.confidence && variationResult.confidence.state),
    candidateSetChanged: districtIds(baseResult.currentCandidates).join("|") !== districtIds(variationResult.currentCandidates).join("|"),
    orderedCandidatesChanged: districtIds(baseResult.orderedCandidates).join("|") !== districtIds(variationResult.orderedCandidates).join("|"),
    shortlistChanged: districtIds(baseResult.shortlist).join("|") !== districtIds(variationResult.shortlist).join("|"),
    unresolvedTradeoffsChanged: (baseResult.unresolvedTradeoffs || []).join("|") !== (variationResult.unresolvedTradeoffs || []).join("|"),
    nextQuestionChanged: (baseResult.recommendedNextQuestion && baseResult.recommendedNextQuestion.questionId) !== (variationResult.recommendedNextQuestion && variationResult.recommendedNextQuestion.questionId),
    explanationCountChanged: (baseResult.explanations || []).length !== (variationResult.explanations || []).length,
  };
}

function buildReviewProfile(profile) {
  const evaluated = evaluateSourceAnswers(profile.sourceAnswers);
  return {
    ...profile,
    ...evaluated,
    reviewJudgment: {
      startingCandidateSet: "",
      shortlistDirection: "",
      missingDistricts: "",
      difficultToDefendDistricts: "",
      orderingJustification: "",
      explanationSpecificity: "",
      confidenceMatch: "",
      unresolvedTradeoffQuality: "",
      nextQuestionQuality: "",
      nextQuestionLeverage: "",
      mostUsefulMissingInput: "",
      lowValueCollectedInput: "",
      overallResult: "",
    },
  };
}

const evaluatedProfiles = profiles.map(buildReviewProfile);

const evaluatedSensitivityChecks = sensitivityChecks.map((check) => {
  const baseSourceAnswers = check.baseSourceAnswers
    ? clone(check.baseSourceAnswers)
    : clone(profiles.find((profile) => profile.id === check.baseProfileId).sourceAnswers);
  const variationSourceAnswers = mergeAnswers(baseSourceAnswers, check.variationSourceAnswers);
  const base = evaluateSourceAnswers(baseSourceAnswers);
  const variation = evaluateSourceAnswers(variationSourceAnswers);
  return {
    ...check,
    baseSourceAnswers,
    variationSourceAnswers,
    base,
    variation,
    comparison: compareResults(base, variation, check.changedAnswer),
    baseSourceAnswersJson: serialize(baseSourceAnswers),
    variationSourceAnswersJson: serialize(variationSourceAnswers),
    comparisonJson: serialize(compareResults(base, variation, check.changedAnswer)),
  };
});

const questionValueAnalysis = {
  likelyHighValue: [
    {
      question: "What kind of office environment would fit the business?",
      reason: "Repeatedly changes candidate entry and movement for Showplace Square, Dogpatch, Design District, Potrero Hill, Mission District, Jackson Square, and Mission Bay.",
    },
    {
      question: "Where are most employees commuting from?",
      reason: "Creates clear movement among central, north-of-Market, and southern/Caltrain-oriented districts while preserving broad commute uncertainty.",
    },
    {
      question: "How often will clients or partners visit the office?",
      reason: "Changes the defensibility of Financial District, Jackson Square, South Beach, and SoMa versus more creative or neighborhood-oriented alternatives.",
    },
    {
      question: "Which description is closest to your business?",
      reason: "Introduces signal-specific ecosystem districts for technology, design/creative, nonprofit, mission-driven, and life-science-adjacent profiles.",
    },
    {
      question: "Do you expect the team to grow meaningfully in the next 12 to 24 months?",
      reason: "Helps distinguish Mission Bay, SoMa, South Beach, and Financial District from smaller boutique or neighborhood-oriented districts.",
    },
  ],
  possiblyUseful: [
    {
      question: "How many people are on the team and how often are they in the office?",
      reason: "Useful business context and broker handoff detail, but the current resolver mostly treats it as confidence context rather than district movement.",
    },
    {
      question: "Is parking important?",
      reason: "Useful when paired with commute or lower-rise preferences; alone it can introduce alternatives but may need stronger editorial guardrails.",
    },
    {
      question: "How important are restaurants, walkability, and amenities?",
      reason: "Improves explanations and can introduce Mission District, but many launch districts already score well on this signal.",
    },
    {
      question: "Do you need proximity to UCSF or another institution?",
      reason: "Very strong when relevant, but applies to fewer office users.",
    },
  ],
  lowOrUnprovenValue: [
    {
      question: "What is your exact square footage requirement?",
      reason: "Currently compatibility context only and not a better top-of-funnel district signal than headcount, occupancy, and growth.",
    },
    {
      question: "What is your budget or target rent?",
      reason: "Preserved for broker review but intentionally excluded from district ranking because the model does not use dynamic market economics.",
    },
    {
      question: "What is your desired timing?",
      reason: "Useful for broker execution, but the current district resolver does not use it for shortlist behavior.",
    },
  ],
};

module.exports = {
  schemaVersion: "sf-office-recommendation-review-harness-v1",
  modelKey: MODEL_KEY,
  route: REVIEW_ROUTE,
  sourceFiles: [
    "_data/sfOfficeRecommendationModel.js",
    "lib/recommendations/normalize-sf-office-profile.js",
    "lib/recommendations/sf-office-recommendation-resolver.js",
    "docs/product/sf-office-editorial-recommendation-model.md",
  ],
  reviewerPrompts,
  profiles: evaluatedProfiles,
  sensitivityChecks: evaluatedSensitivityChecks,
  questionValueAnalysis,
};
