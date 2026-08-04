const MODEL_KEY = "san-francisco:office";

const BASE_SOURCE_ANSWERS = {
  city: "San Francisco",
  spaceType: "Office",
};

const EARLY_QUESTION_IDS = [
  "businessType",
  "officeEnvironment",
  "primaryNeed",
  "commuteOrientation",
  "institutionProximity",
];

const REFINEMENT_QUESTION_IDS = [
  "clientVisitFrequency",
  "expectedGrowth",
  "parkingImportance",
  "walkabilityAmenitiesImportance",
  "officeEnvironment",
  "commuteOrientation",
  "businessType",
];

const HIGH_VALUE_SIGNAL_FIELDS = new Set([
  "businessType",
  "officeEnvironment",
  "commuteOrientation",
  "expectedGrowth",
  "recruitingImportance",
  "clientVisitFrequency",
  "parkingImportance",
  "walkabilityAmenitiesImportance",
  "institutionProximity",
]);

const WORKSPACE_SECTIONS = [
  {
    id: "market",
    label: "Market",
    helper: "The workspace is locked to this reference model.",
    field: "city",
    locked: true,
    options: [
      { label: "San Francisco", patch: { city: "San Francisco" } },
    ],
  },
  {
    id: "spaceType",
    label: "Space Type",
    helper: "This prototype evaluates office districts only.",
    field: "spaceType",
    locked: true,
    options: [
      { label: "Office", patch: { spaceType: "Office" } },
    ],
  },
  {
    id: "businessType",
    label: "Business Type",
    helper: "Use the closest commercial context.",
    field: "businessType",
    options: [
      { label: "Professional services", patch: { businessType: "professional_services" } },
      { label: "Technology / product", patch: { businessType: "technology" } },
      { label: "Design / creative", patch: { businessType: "design_creative" } },
      { label: "Healthcare / life science", patch: { businessType: "life_science" } },
      { label: "Nonprofit / mission-driven", patch: { businessType: "nonprofit" } },
    ],
  },
  {
    id: "officeEnvironment",
    label: "Office Environment",
    helper: "Pick the strongest preference. The current resolver supports one primary environment.",
    field: "officeEnvironment",
    options: [
      { label: "Modern", patch: { officeEnvironment: "Modern and polished" } },
      { label: "Creative", patch: { officeEnvironment: "Creative and informal" } },
      { label: "Historic", patch: { officeEnvironment: "Historic and distinctive" } },
      { label: "Executive", patch: { officeEnvironment: "Traditional and professional" } },
      { label: "Lower-rise", patch: { officeEnvironment: "Lower-rise and neighborhood-oriented" } },
    ],
  },
  {
    id: "operationalUse",
    label: "Primary Office Use",
    helper: "Select any that describe how the office earns its keep.",
    field: "operationalUse",
    multi: true,
    options: [
      { label: "Client meetings", value: "client_meetings" },
      { label: "Team collaboration", value: "team_collaboration" },
      { label: "Recruiting", value: "recruiting" },
      { label: "Quiet focused work", value: "quiet_focused_work" },
      { label: "Showroom / presentation", value: "showroom_presentation" },
      { label: "UCSF / R&D adjacency", value: "lab_rd_adjacency" },
    ],
  },
  {
    id: "commuteOrientation",
    label: "Employee Commute Orientation",
    helper: "Broad pattern only; this is not route-level transit guidance.",
    field: "commuteOrientation",
    options: [
      { label: "Mixed / local", patch: {} },
      { label: "Marin", patch: { commuteOrientation: "Marin" } },
      { label: "East Bay", patch: { commuteOrientation: "East Bay" } },
      { label: "Peninsula / South Bay", patch: { commuteOrientation: "Peninsula South Bay" } },
    ],
  },
  {
    id: "expectedGrowth",
    label: "Growth Expectations",
    helper: "Growth helps Rofo weigh flexibility.",
    field: "expectedGrowth",
    options: [
      { label: "Significant growth", patch: { expectedGrowth: "significant" } },
      { label: "Some growth", patch: { expectedGrowth: "some" } },
      { label: "Stable team", patch: { expectedGrowth: "low" } },
    ],
  },
  {
    id: "institutionProximity",
    label: "Institutional Proximity",
    helper: "Shown only when the profile is healthcare or life-sciences-adjacent.",
    field: "institutionProximity",
    condition: { field: "businessType", value: "life_science" },
    options: [
      { label: "UCSF matters", patch: { institutionProximity: "UCSF" } },
      { label: "Keep it broad", patch: {} },
    ],
  },
];

const QUESTIONS = {
  businessType: {
    id: "businessType",
    phase: "early",
    prompt: "Which description is closest to your business?",
    helper: "This helps Rofo compare districts by commercial ecosystem and office role.",
    sourceFields: ["businessType"],
    options: [
      { label: "Professional services", patch: { businessType: "professional_services" } },
      { label: "Technology or product company", patch: { businessType: "technology" } },
      { label: "Design, architecture, or creative firm", patch: { businessType: "design_creative" } },
      { label: "Healthcare or life-sciences adjacent", patch: { businessType: "life_science" } },
      { label: "Nonprofit or mission-driven organization", patch: { businessType: "nonprofit" } },
      { label: "Not sure yet", patch: {} },
    ],
  },
  officeEnvironment: {
    id: "officeEnvironment",
    phase: "early",
    prompt: "What kind of office environment would fit the business?",
    helper: "This is usually one of the strongest signals for whether downtown, modern-growth, or neighborhood districts should rise.",
    sourceFields: ["officeEnvironment"],
    options: [
      { label: "Modern and polished", patch: { officeEnvironment: "Modern and polished" } },
      { label: "Historic and distinctive", patch: { officeEnvironment: "Historic and distinctive" } },
      { label: "Creative and informal", patch: { officeEnvironment: "Creative and informal" } },
      { label: "Traditional and professional", patch: { officeEnvironment: "Traditional and professional" } },
      { label: "Lower-rise and neighborhood-oriented", patch: { officeEnvironment: "Lower-rise and neighborhood-oriented" } },
      { label: "Not sure yet", patch: {} },
    ],
  },
  primaryNeed: {
    id: "primaryNeed",
    phase: "early",
    prompt: "What should the office help you do best?",
    helper: "This avoids asking several separate priority questions before Rofo can form an initial view.",
    sourceFields: ["expectedGrowth", "recruitingImportance", "clientVisitFrequency", "parkingImportance"],
    options: [
      { label: "Support growth", patch: { expectedGrowth: "significant" } },
      { label: "Attract and retain employees", patch: { recruitingImportance: "high" } },
      { label: "Host clients or partners", patch: { clientVisitFrequency: "often" } },
      { label: "Make daily access practical", patch: { parkingImportance: "high" } },
      { label: "Mostly team collaboration", patch: { operationalUse: ["team_collaboration"] } },
    ],
  },
  commuteOrientation: {
    id: "commuteOrientation",
    phase: "early",
    prompt: "Is there a broad commute pattern Rofo should respect?",
    helper: "Rofo treats this as directional context, not precise transit guidance.",
    sourceFields: ["commuteOrientation"],
    options: [
      { label: "Mostly within San Francisco or mixed", patch: {} },
      { label: "Marin-oriented", patch: { commuteOrientation: "Marin" } },
      { label: "East Bay-oriented", patch: { commuteOrientation: "East Bay" } },
      { label: "Peninsula or South Bay-oriented", patch: { commuteOrientation: "Peninsula South Bay" } },
    ],
  },
  institutionProximity: {
    id: "institutionProximity",
    phase: "early",
    prompt: "Should proximity to UCSF-related activity matter?",
    helper: "This only appears for healthcare or life-sciences-adjacent profiles.",
    sourceFields: ["institutionProximity"],
    condition: { field: "businessType", value: "life_science" },
    options: [
      { label: "Yes, UCSF proximity matters", patch: { institutionProximity: "UCSF" } },
      { label: "No, keep the search broader", patch: {} },
    ],
  },
  clientVisitFrequency: {
    id: "clientVisitFrequency",
    phase: "refinement",
    prompt: "How often will clients or partners visit the office?",
    helper: "This can clarify whether polished client-access districts should lead or remain alternatives.",
    sourceFields: ["clientVisitFrequency"],
    options: [
      { label: "Often", patch: { clientVisitFrequency: "often" } },
      { label: "Sometimes", patch: { clientVisitFrequency: "sometimes" } },
      { label: "Rarely", patch: { clientVisitFrequency: "rarely" } },
    ],
  },
  expectedGrowth: {
    id: "expectedGrowth",
    phase: "refinement",
    prompt: "Do you expect the team to grow meaningfully?",
    helper: "This can strengthen districts with more growth flexibility.",
    sourceFields: ["expectedGrowth"],
    options: [
      { label: "Yes, significant growth", patch: { expectedGrowth: "significant" } },
      { label: "Some growth", patch: { expectedGrowth: "some" } },
      { label: "Not much growth", patch: { expectedGrowth: "low" } },
    ],
  },
  parkingImportance: {
    id: "parkingImportance",
    phase: "refinement",
    prompt: "How important is driving and parking practicality?",
    helper: "This may introduce districts with a more practical driving pattern, but it does not use current availability.",
    sourceFields: ["parkingImportance"],
    options: [
      { label: "Important", patch: { parkingImportance: "high" } },
      { label: "Helpful but not decisive", patch: { parkingImportance: "medium" } },
      { label: "Not important", patch: { parkingImportance: "low" } },
    ],
  },
  walkabilityAmenitiesImportance: {
    id: "walkabilityAmenitiesImportance",
    phase: "refinement",
    prompt: "How much do restaurants, walkability, and amenities matter?",
    helper: "This is usually an explanation-strengthening signal and only sometimes changes the shortlist.",
    sourceFields: ["walkabilityAmenitiesImportance"],
    options: [
      { label: "Very important", patch: { walkabilityAmenitiesImportance: "high" } },
      { label: "Useful but not central", patch: { walkabilityAmenitiesImportance: "medium" } },
      { label: "Not a priority", patch: { walkabilityAmenitiesImportance: "low" } },
    ],
  },
};

const SCENARIOS = [
  {
    id: "blank",
    label: "Blank profile",
    description: "Start with only San Francisco and office known.",
    sourceAnswers: {},
  },
  {
    id: "client-professional-services",
    label: "Client-facing professional services",
    description: "A professional-services firm that meets clients often and wants a credible office environment.",
    sourceAnswers: {
      businessType: "professional_services",
      clientVisitFrequency: "often",
      officeEnvironment: "Traditional and professional",
    },
  },
  {
    id: "technology-growth",
    label: "Technology growth company",
    description: "A growing technology company prioritizing recruiting, growth, and a modern office environment.",
    sourceAnswers: {
      businessType: "technology",
      expectedGrowth: "significant",
      recruitingImportance: "high",
      officeEnvironment: "Modern and polished",
    },
  },
  {
    id: "marin-oriented",
    label: "Marin-oriented company",
    description: "A company balancing Marin commute orientation, parking, and lower-rise character.",
    sourceAnswers: {
      commuteOrientation: "Marin",
      parkingImportance: "high",
      officeEnvironment: "Lower-rise and neighborhood-oriented",
    },
  },
  {
    id: "east-bay-oriented",
    label: "East Bay-oriented company",
    description: "A company with East Bay commute orientation and broad transit needs.",
    sourceAnswers: {
      commuteOrientation: "East Bay",
      transitImportance: "high",
      officeEnvironment: "Creative and informal",
    },
  },
  {
    id: "peninsula-oriented",
    label: "Peninsula-oriented company",
    description: "A technology company with Peninsula or South Bay commute considerations.",
    sourceAnswers: {
      businessType: "technology",
      commuteOrientation: "Peninsula South Bay",
      officeEnvironment: "Modern and polished",
      recruitingImportance: "high",
    },
  },
  {
    id: "budget-context-only",
    label: "Budget context only",
    description: "A profile that uses budget and rent language without enough recommendation signal.",
    sourceAnswers: {
      notes: "Budget matters and we want lower rent.",
      valuePreference: "good value",
    },
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function sourceAnswersWithBase(sourceAnswers = {}) {
  return {
    ...BASE_SOURCE_ANSWERS,
    ...clone(sourceAnswers),
  };
}

function compactSourceAnswers(sourceAnswers = {}) {
  const withBase = sourceAnswersWithBase(sourceAnswers);
  const ordered = {};
  Object.keys(withBase)
    .sort()
    .forEach((field) => {
      const value = withBase[field];
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) return;
      ordered[field] = value;
    });
  return ordered;
}

function answerKey(sourceAnswers = {}) {
  return JSON.stringify(compactSourceAnswers(sourceAnswers));
}

function answeredQuestionIds(sourceAnswers = {}) {
  return Object.values(QUESTIONS)
    .filter((question) => question.sourceFields.some((field) => {
      const value = sourceAnswers[field];
      return value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0);
    }))
    .map((question) => question.id);
}

function usefulSignalCount(sourceAnswers = {}) {
  return Object.keys(sourceAnswers).filter((field) => {
    const value = sourceAnswers[field];
    return HIGH_VALUE_SIGNAL_FIELDS.has(field) &&
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0);
  }).length;
}

function conditionMet(question, sourceAnswers = {}) {
  if (!question.condition) return true;
  return sourceAnswers[question.condition.field] === question.condition.value;
}

function answered(question, sourceAnswers = {}) {
  return question.sourceFields.some((field) => {
    const value = sourceAnswers[field];
    return value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0);
  });
}

function nextEarlyQuestion(sourceAnswers = {}) {
  return EARLY_QUESTION_IDS
    .map((id) => QUESTIONS[id])
    .find((question) => conditionMet(question, sourceAnswers) && !answered(question, sourceAnswers));
}

function nextRefinementQuestion(sourceAnswers = {}, resolverNextQuestion) {
  if (resolverNextQuestion && QUESTIONS[resolverNextQuestion.questionId] && !answered(QUESTIONS[resolverNextQuestion.questionId], sourceAnswers)) {
    return QUESTIONS[resolverNextQuestion.questionId];
  }
  return REFINEMENT_QUESTION_IDS
    .map((id) => QUESTIONS[id])
    .find((question) => conditionMet(question, sourceAnswers) && !answered(question, sourceAnswers));
}

function shouldRevealRecommendation(sourceAnswers = {}, resolverResult = null) {
  const answeredCount = answeredQuestionIds(sourceAnswers).length;
  const usefulCount = usefulSignalCount(sourceAnswers);
  const stateId = resolverResult && resolverResult.state && resolverResult.state.id;
  const movedBeyondStartingSet = stateId && stateId !== "starting_set";
  return Boolean(
    sourceAnswersWithBase(sourceAnswers).city === "San Francisco" &&
    sourceAnswersWithBase(sourceAnswers).spaceType === "Office" &&
    answeredCount >= 3 &&
    usefulCount >= 2 &&
    movedBeyondStartingSet
  );
}

function interactionSnapshot(sourceAnswers = {}, resolverResult = null) {
  const withBase = sourceAnswersWithBase(sourceAnswers);
  const revealRecommendation = shouldRevealRecommendation(withBase, resolverResult);
  const earlyQuestion = nextEarlyQuestion(withBase);
  const refinementQuestion = resolverResult
    ? nextRefinementQuestion(withBase, resolverResult.recommendedNextQuestion)
    : null;
  return {
    modelKey: MODEL_KEY,
    sourceAnswers: withBase,
    answeredQuestionIds: answeredQuestionIds(withBase),
    usefulSignalCount: usefulSignalCount(withBase),
    revealRecommendation,
    phase: revealRecommendation ? "present_and_refine" : "understand_the_business",
    nextQuestion: revealRecommendation ? refinementQuestion : earlyQuestion,
    revealRule: {
      requiresSanFranciscoOffice: true,
      minimumAnsweredQuestions: 3,
      minimumUsefulSignals: 2,
      requiresResolverBeyondStartingSet: true,
      budgetAndTimingIgnored: true,
    },
  };
}

module.exports = {
  MODEL_KEY,
  BASE_SOURCE_ANSWERS,
  QUESTIONS,
  EARLY_QUESTION_IDS,
  REFINEMENT_QUESTION_IDS,
  SCENARIOS,
  WORKSPACE_SECTIONS,
  sourceAnswersWithBase,
  compactSourceAnswers,
  answerKey,
  answeredQuestionIds,
  usefulSignalCount,
  nextEarlyQuestion,
  nextRefinementQuestion,
  shouldRevealRecommendation,
  interactionSnapshot,
};
