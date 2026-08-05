const { normalizeSfOfficeProfile } = require("../lib/recommendations/normalize-sf-office-profile");
const { resolveSfOfficeRecommendation } = require("../lib/recommendations/sf-office-recommendation-resolver");
const policy = require("../lib/recommendations/sf-office-recommendation-interaction-policy");

const route = "/prototype/recommendation-explorer/sf-office-interactive/";

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function mergeAnswers(...items) {
  return items.reduce((merged, item) => ({
    ...merged,
    ...clone(item),
  }), {});
}

function ids(items) {
  return (items || []).map((item) => item.districtId);
}

function compactCandidate(candidate) {
  return {
    districtId: candidate.districtId,
    districtName: candidate.districtName,
    movement: candidate.movement,
    score: candidate.score,
    strategyRole: candidate.strategyRole,
    reason: candidate.reasons && candidate.reasons[0]
      ? {
          signalLabel: candidate.reasons[0].signalLabel,
          practicalImplication: candidate.reasons[0].practicalImplication,
        }
      : null,
  };
}

function compactResult(result) {
  if (!result || result.applicable !== true) return null;
  return {
    modelKey: result.modelKey,
    applicable: result.applicable,
    state: result.state,
    confidence: result.confidence,
    orderedCandidates: (result.orderedCandidates || []).map(compactCandidate),
    shortlist: (result.shortlist || []).map(compactCandidate),
    secondaryAlternatives: (result.secondaryAlternatives || []).map(compactCandidate),
    explanations: (result.explanations || []).slice(0, 5).map((explanation) => ({
      districtId: explanation.districtId,
      districtName: explanation.districtName,
      action: explanation.action,
      signalLabel: explanation.signalLabel,
      practicalImplication: explanation.practicalImplication,
    })),
    profileSignalsUsed: result.profileSignalsUsed || [],
    unresolvedTradeoffs: result.unresolvedTradeoffs || [],
    shortlistSizeRationale: result.shortlistSizeRationale,
    signalCount: result.signalCount,
    ids: {
      currentCandidates: ids(result.currentCandidates),
      shortlist: ids(result.shortlist),
      orderedCandidates: ids(result.orderedCandidates),
      secondaryAlternatives: ids(result.secondaryAlternatives),
    },
  };
}

function compactQuestion(question) {
  if (!question) return null;
  return {
    id: question.id,
    prompt: question.prompt,
    helper: question.helper,
    options: (question.options || []).map((option) => ({
      label: option.label,
      patch: option.patch || {},
    })),
  };
}

function compactInteraction(interaction) {
  if (!interaction) return null;
  return {
    modelKey: interaction.modelKey,
    answeredQuestionIds: interaction.answeredQuestionIds || [],
    usefulSignalCount: interaction.usefulSignalCount,
    revealRecommendation: interaction.revealRecommendation,
    phase: interaction.phase,
    nextQuestion: compactQuestion(interaction.nextQuestion),
    revealRule: interaction.revealRule,
  };
}

function evaluate(sourceAnswers) {
  const compactSource = policy.compactSourceAnswers(sourceAnswers);
  const normalized = normalizeSfOfficeProfile(compactSource);
  const resolverResult = normalized.supported
    ? resolveSfOfficeRecommendation(normalized.resolverProfile)
    : null;
  const interaction = policy.interactionSnapshot(compactSource, resolverResult);
  return {
    key: policy.answerKey(compactSource),
    normalized: {
      modelKey: normalized.modelKey,
      supported: normalized.supported,
      resolverProfile: normalized.resolverProfile,
      ignoredEconomicSignals: normalized.ignoredEconomicSignals,
      unsupportedAnswers: normalized.unsupportedAnswers,
    },
    result: compactResult(resolverResult),
    interaction: compactInteraction(interaction),
  };
}

function questionOptions(questionId) {
  return policy.QUESTIONS[questionId].options.map((option) => option.patch || {});
}

function enumerateEarlyStates() {
  const states = [];
  for (const businessType of questionOptions("businessType")) {
    for (const officeEnvironment of questionOptions("officeEnvironment")) {
      for (const primaryNeed of questionOptions("primaryNeed")) {
        for (const commuteOrientation of questionOptions("commuteOrientation")) {
          const base = mergeAnswers(businessType, officeEnvironment, primaryNeed, commuteOrientation);
          const institutionOptions = base.businessType === "life_science"
            ? questionOptions("institutionProximity")
            : [{}];
          institutionOptions.forEach((institutionProximity) => {
            states.push(mergeAnswers(base, institutionProximity));
          });
        }
      }
    }
  }
  return states;
}

function enumerateEarlyPrefixes() {
  const states = [{}];
  const walk = (index, sourceAnswers) => {
    if (index >= policy.EARLY_QUESTION_IDS.length) return;
    const question = policy.QUESTIONS[policy.EARLY_QUESTION_IDS[index]];
    if (!question) return;
    if (question.condition && sourceAnswers[question.condition.field] !== question.condition.value) {
      walk(index + 1, sourceAnswers);
      return;
    }
    question.options.forEach((option) => {
      const next = mergeAnswers(sourceAnswers, option.patch);
      states.push(next);
      walk(index + 1, next);
    });
  };
  walk(0, {});
  return states;
}

function enumerateWorkspaceReviewStates() {
  const states = [];
  const businessTypes = questionOptions("businessType").filter((option) => option.businessType);
  const environments = questionOptions("officeEnvironment").filter((option) => option.officeEnvironment);
  const commutes = questionOptions("commuteOrientation").filter((option) => option.commuteOrientation);
  const growth = [{ expectedGrowth: "significant" }, { expectedGrowth: "some" }, { expectedGrowth: "low" }];
  const useSets = [
    { operationalUse: ["client_meetings"] },
    { operationalUse: ["team_collaboration"] },
    { operationalUse: ["recruiting"] },
    { operationalUse: ["quiet_focused_work"] },
    { operationalUse: ["showroom_presentation"] },
    { operationalUse: ["lab_rd_adjacency"] },
    { operationalUse: ["client_meetings", "showroom_presentation"] },
    { operationalUse: ["team_collaboration", "recruiting"] },
    { operationalUse: ["team_collaboration", "lab_rd_adjacency"] },
    { operationalUse: ["client_meetings", "quiet_focused_work"] },
  ];

  [
    ...businessTypes,
    ...environments,
    ...commutes,
    ...growth,
    ...useSets,
    { institutionProximity: "UCSF", businessType: "life_science" },
  ].forEach((item) => states.push(item));

  businessTypes.forEach((businessType) => environments.forEach((officeEnvironment) => {
    states.push(mergeAnswers(businessType, officeEnvironment));
    growth.forEach((expectedGrowth) => states.push(mergeAnswers(businessType, officeEnvironment, expectedGrowth)));
    commutes.forEach((commuteOrientation) => states.push(mergeAnswers(businessType, officeEnvironment, commuteOrientation)));
  }));

  environments.forEach((officeEnvironment) => {
    commutes.forEach((commuteOrientation) => states.push(mergeAnswers(officeEnvironment, commuteOrientation)));
    useSets.forEach((operationalUse) => states.push(mergeAnswers(officeEnvironment, operationalUse)));
  });

  businessTypes.forEach((businessType) => {
    useSets.forEach((operationalUse) => states.push(mergeAnswers(businessType, operationalUse)));
  });

  [
    { businessType: "technology", officeEnvironment: "Modern and polished", expectedGrowth: "significant", operationalUse: ["team_collaboration", "recruiting"] },
    { businessType: "professional_services", officeEnvironment: "Traditional and professional", operationalUse: ["client_meetings", "quiet_focused_work"] },
    { businessType: "design_creative", officeEnvironment: "Creative and informal", operationalUse: ["showroom_presentation", "client_meetings"] },
    { businessType: "life_science", officeEnvironment: "Modern and polished", institutionProximity: "UCSF", operationalUse: ["team_collaboration", "lab_rd_adjacency"] },
    { commuteOrientation: "Marin", officeEnvironment: "Lower-rise and neighborhood-oriented", operationalUse: ["client_meetings", "quiet_focused_work"] },
    { commuteOrientation: "East Bay", officeEnvironment: "Creative and informal", operationalUse: ["team_collaboration"] },
    { commuteOrientation: "Peninsula South Bay", businessType: "technology", officeEnvironment: "Modern and polished", operationalUse: ["team_collaboration", "recruiting"] },
  ].forEach((item) => states.push(item));

  return states;
}

function enumerateStates() {
  const states = new Map();
  const add = (sourceAnswers) => {
    const compact = policy.compactSourceAnswers(sourceAnswers);
    states.set(policy.answerKey(compact), compact);
  };
  const addNextQuestionOptions = (base) => {
    const evaluated = evaluate(base);
    const question = evaluated.interaction && evaluated.interaction.nextQuestion;
    if (!question || !policy.QUESTIONS[question.id]) return;
    policy.QUESTIONS[question.id].options.forEach((option) => add(mergeAnswers(base, option.patch)));
  };
  const seedStates = [
    {},
    ...policy.SCENARIOS.map((scenario) => scenario.sourceAnswers),
    {
      businessType: "professional_services",
      officeEnvironment: "Traditional and professional",
      clientVisitFrequency: "often",
    },
    {
      businessType: "professional_services",
      officeEnvironment: "Traditional and professional",
      clientVisitFrequency: "often",
      walkabilityAmenitiesImportance: "medium",
    },
    {
      notes: "Budget matters and we want lower rent.",
      valuePreference: "good value",
    },
    {
      businessType: "technology",
      officeEnvironment: "Modern and polished",
      expectedGrowth: "significant",
      commuteOrientation: "Marin",
    },
    {
      businessType: "technology",
      officeEnvironment: "Modern and polished",
      expectedGrowth: "significant",
      commuteOrientation: "Peninsula South Bay",
    },
    ...enumerateWorkspaceReviewStates(),
  ];

  seedStates.forEach((sourceAnswers) => {
    const compact = policy.compactSourceAnswers(sourceAnswers);
    add(compact);
    addNextQuestionOptions(compact);
  });

  return Array.from(states.values());
}

const entries = new Map();
enumerateStates().forEach((sourceAnswers) => {
  const evaluated = evaluate(sourceAnswers);
  entries.set(evaluated.key, evaluated);
});

const questionOrder = [
  ...policy.EARLY_QUESTION_IDS,
  ...policy.REFINEMENT_QUESTION_IDS.filter((id) => !policy.EARLY_QUESTION_IDS.includes(id)),
];

const data = {
  schemaVersion: "sf-office-recommendation-interactive-prototype-v1",
  modelKey: policy.MODEL_KEY,
  route,
  sourceFiles: [
    "_data/sfOfficeRecommendationModel.js",
    "lib/recommendations/normalize-sf-office-profile.js",
    "lib/recommendations/sf-office-recommendation-resolver.js",
    "lib/recommendations/sf-office-recommendation-interaction-policy.js",
  ],
  policy: {
    baseSourceAnswers: policy.BASE_SOURCE_ANSWERS,
    earlyQuestionIds: policy.EARLY_QUESTION_IDS,
    refinementQuestionIds: policy.REFINEMENT_QUESTION_IDS,
    questions: policy.QUESTIONS,
    workspaceSections: policy.WORKSPACE_SECTIONS,
    revealRule: {
      requiresSanFranciscoOffice: true,
      minimumAnsweredQuestions: 3,
      minimumUsefulSignals: 2,
      requiresResolverBeyondStartingSet: true,
      budgetAndTimingIgnored: true,
    },
  },
  scenarios: policy.SCENARIOS,
  questionOrder,
  initialState: evaluate({}),
  resultsByKey: Object.fromEntries(entries),
};

module.exports = {
  ...data,
  json: JSON.stringify(data),
};
