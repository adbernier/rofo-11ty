const sfOfficeRecommendationModel = require("../../_data/sfOfficeRecommendationModel");

const SCORE_THRESHOLD = {
  rise: 3,
  strongRise: 5,
  fall: -2,
  anchor: 7,
  adjacent: 3,
  entry: 2,
};

const MEANINGFUL_DIFFERENCE = 4;
const NEAR_TIE_DISTANCE = 1;
const DEFENSIBLE_DISTANCE = 6;

function slugKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function districtKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function list(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeImportance(value) {
  const key = slugKey(value);
  if (["high", "very_important", "must_have", "important", "often", "yes", "significant"].includes(key)) return "high";
  if (["medium", "moderate", "some", "somewhat", "helpful", "sometimes"].includes(key)) return "medium";
  if (["low", "not_important", "rarely", "no", "none"].includes(key)) return "low";
  return key || "";
}

function normalizeOfficeEnvironment(value) {
  const key = slugKey(value);
  const aliases = {
    modern_and_polished: "modern_polished",
    modern_polished: "modern_polished",
    modern: "modern_polished",
    polished: "modern_polished",
    historic_and_distinctive: "historic_distinctive",
    historic_distinctive: "historic_distinctive",
    historic: "historic_distinctive",
    distinctive: "historic_distinctive",
    creative_and_informal: "creative_informal",
    creative_informal: "creative_informal",
    creative: "creative_informal",
    cool: "creative_informal",
    traditional_and_professional: "traditional_professional",
    traditional_professional: "traditional_professional",
    traditional: "traditional_professional",
    professional: "traditional_professional",
    lower_rise_and_neighborhood_oriented: "lower_rise_neighborhood",
    lower_rise_neighborhood: "lower_rise_neighborhood",
    lower_rise: "lower_rise_neighborhood",
    neighborhood: "lower_rise_neighborhood",
    not_sure_yet: "not_sure",
    not_sure: "not_sure",
  };
  return aliases[key] || key || "not_sure";
}

function normalizeProfile(rawProfile = {}) {
  const facts = rawProfile.facts || {};
  const constraints = rawProfile.constraints || {};
  const priorities = rawProfile.priorities || {};
  const profile = {
    city: rawProfile.city || rawProfile.market || facts.city || facts.market || "",
    spaceType: rawProfile.spaceType || facts.spaceType || "",
    headcount: rawProfile.headcount || facts.headcount || "",
    regularOccupancy: rawProfile.regularOccupancy || facts.regularOccupancy || "",
    hybridWorkPattern: rawProfile.hybridWorkPattern || facts.hybridWorkPattern || "",
    expectedGrowth: rawProfile.expectedGrowth || facts.expectedGrowth || priorities.growth || "",
    clientVisitFrequency: rawProfile.clientVisitFrequency || facts.clientVisitFrequency || priorities.clientAccess || "",
    recruitingImportance: rawProfile.recruitingImportance || facts.recruitingImportance || priorities.recruiting || "",
    businessType: rawProfile.businessType || facts.businessType || "",
    operationalUse: unique([
      ...list(rawProfile.operationalUse),
      ...list(facts.operationalUse),
    ]).map(slugKey),
    approximateSquareFootage: rawProfile.approximateSquareFootage || facts.approximateSquareFootage || rawProfile.size || "",
    districtAnchor: districtKey(rawProfile.districtAnchor || constraints.districtAnchor || constraints.anchorDistrict || ""),
    openToNearbyAlternatives: Boolean(
      rawProfile.openToNearbyAlternatives ||
      constraints.openToNearbyAlternatives ||
      constraints.nearbyAlternatives ||
      rawProfile.locationIntent === "compare" ||
      rawProfile.locationIntent === "discover"
    ),
    hardDistrictOnly: Boolean(rawProfile.hardDistrictOnly || constraints.hardDistrictOnly || rawProfile.locationIntent === "focus"),
    commuteOrientation: slugKey(rawProfile.commuteOrientation || constraints.commuteOrientation || ""),
    transitImportance: normalizeImportance(rawProfile.transitImportance || priorities.regionalTransit || priorities.transit || ""),
    parkingImportance: normalizeImportance(rawProfile.parkingImportance || priorities.parking || ""),
    walkabilityAmenitiesImportance: normalizeImportance(rawProfile.walkabilityAmenitiesImportance || priorities.walkabilityAmenities || priorities.amenities || ""),
    officeEnvironment: normalizeOfficeEnvironment(rawProfile.officeEnvironment || rawProfile.environmentPreference || priorities.officeEnvironment || priorities.environmentPreference || ""),
    institutionProximity: slugKey(rawProfile.institutionProximity || constraints.institutionProximity || ""),
    budgetContext: unique([
      ...list(rawProfile.budget),
      ...list(rawProfile.cost),
      ...list(rawProfile.costSensitivity),
      ...list(rawProfile.valuePreference),
      ...list(facts.budget),
      ...list(priorities.budget),
      ...list(priorities.cost),
      ...list(priorities.costSensitivity),
      ...list(priorities.value),
    ]),
    raw: rawProfile,
  };
  profile.businessType = slugKey(profile.businessType);
  profile.expectedGrowth = normalizeImportance(profile.expectedGrowth);
  profile.clientVisitFrequency = normalizeImportance(profile.clientVisitFrequency);
  profile.recruitingImportance = normalizeImportance(profile.recruitingImportance);
  if (!profile.officeEnvironment) profile.officeEnvironment = "not_sure";
  return profile;
}

function modelDistricts(model) {
  return model.districtOrder.map((districtId) => ({
    districtId,
    ...model.districts[districtId],
  }));
}

function stateForDistrict(district) {
  return {
    districtId: district.districtId,
    districtName: district.districtName,
    launchRole: district.launchRole,
    strategyRole: district.strategyRole,
    score: 0,
    included: district.launchRole === "default_initial",
    entered: false,
    excluded: false,
    exclusionReason: "",
    movement: "starting",
    reasons: [],
    signals: [],
  };
}

function addReason(states, districtId, action, signalId, signalLabel, attributeLabel, points, practicalImplication) {
  const state = states.get(districtId);
  if (!state || state.excluded) return;
  state.score += points;
  state.signals.push(signalId);
  state.reasons.push({
    action,
    signalId,
    signalLabel,
    attributeLabel,
    points,
    practicalImplication,
  });
  if (action === "enter") {
    state.included = true;
    state.entered = true;
  }
}

function applyListEffect(states, ids, action, signalId, signalLabel, attributeLabel, points, implication) {
  ids.forEach((districtId) => addReason(states, districtId, action, signalId, signalLabel, attributeLabel, points, implication));
}

function signalFamilyId(type, id) {
  return `${type}:${id}`;
}

function recordSemanticContribution(signalAudit, familyId, signalId, signalLabel, treatment) {
  if (!signalAudit || !familyId) return;
  signalAudit.contributions.push({
    familyId,
    signalId,
    signalLabel,
    treatment,
  });
}

function applyPriority(model, states, priorityId, signalValue, options = {}) {
  const priority = model.priorities[priorityId];
  if (!priority || signalValue !== "high") return false;
  const familyId = options.familyId || signalFamilyId("priority", priorityId);
  if (options.appliedFamilies && options.appliedFamilies.has(familyId)) {
    recordSemanticContribution(options.signalAudit, familyId, options.sourceSignalId || priorityId, options.sourceSignalLabel || priority.label, "deduplicated");
    return false;
  }
  if (options.appliedFamilies) options.appliedFamilies.add(familyId);
  recordSemanticContribution(options.signalAudit, familyId, options.sourceSignalId || priorityId, options.sourceSignalLabel || priority.label, "applied");
  applyListEffect(states, priority.riseHigh || [], "rise", priorityId, priority.label, priority.attributes.join(", "), SCORE_THRESHOLD.rise, `${priority.label} is a stated priority.`);
  applyListEffect(states, priority.fallLow || [], "fall", priorityId, priority.label, priority.attributes.join(", "), SCORE_THRESHOLD.fall, `${priority.label} makes this district less aligned than stronger candidates.`);
  applyListEffect(states, priority.enter || [], "enter", priorityId, priority.label, priority.attributes.join(", "), SCORE_THRESHOLD.entry, `${priority.label} introduces a signal-specific district.`);
  return true;
}

function applyOfficeEnvironment(model, states, environmentId) {
  const environment = model.officeEnvironmentTaxonomy[environmentId] || model.officeEnvironmentTaxonomy.not_sure;
  if (!environment || environmentId === "not_sure") return false;
  const signalLabel = `Office environment: ${environment.label}`;
  applyListEffect(states, environment.rise || [], "rise", "officeEnvironment", signalLabel, environment.attributes.join(", "), SCORE_THRESHOLD.rise, `The user prefers a ${environment.label.toLowerCase()} environment.`);
  applyListEffect(states, environment.fall || [], "fall", "officeEnvironment", signalLabel, environment.attributes.join(", "), SCORE_THRESHOLD.fall, `The environment preference makes this district less aligned.`);
  applyListEffect(states, environment.enter || [], "enter", "officeEnvironment", signalLabel, environment.attributes.join(", "), SCORE_THRESHOLD.entry, `The environment preference introduces this signal-specific district.`);
  return true;
}

function applyBusinessType(model, states, businessType) {
  const effect = model.businessTypeEffects[businessType];
  if (!effect) return false;
  const label = `Business type: ${businessType.replace(/_/g, " ")}`;
  applyListEffect(states, effect.rise || [], "rise", "businessType", label, effect.attributes.join(", "), SCORE_THRESHOLD.rise, "The business type aligns with the district ecosystem.");
  applyListEffect(states, effect.fall || [], "fall", "businessType", label, effect.attributes.join(", "), SCORE_THRESHOLD.fall, "The business type is less aligned with this district's primary office role.");
  applyListEffect(states, effect.enter || [], "enter", "businessType", label, effect.attributes.join(", "), SCORE_THRESHOLD.entry, "The business type introduces a signal-specific district.");
  return true;
}

function applyOperationalUse(model, states, uses, appliedFamilies, signalAudit) {
  let used = false;
  uses.forEach((use) => {
    const effect = model.operationalUseEffects[use];
    if (!effect) return;
    const label = `Office use: ${use.replace(/_/g, " ")}`;
    if (effect.priorityAlias) {
      used = applyPriority(model, states, effect.priorityAlias, "high", {
        appliedFamilies,
        signalAudit,
        familyId: signalFamilyId("priority", effect.priorityAlias),
        sourceSignalId: `operationalUse:${use}`,
        sourceSignalLabel: label,
      }) || used;
      return;
    }
    if (effect.constraintAlias === "institutionProximity") {
      const constraint = model.constraints.institutionProximity.values[effect.value];
      applyConstraintValue(states, constraint, "institutionProximity", "Institution proximity: UCSF");
      used = true;
      return;
    }
    applyListEffect(states, effect.rise || [], "rise", "operationalUse", label, effect.attributes.join(", "), SCORE_THRESHOLD.rise, "The office use aligns with this district's role.");
    applyListEffect(states, effect.fall || [], "fall", "operationalUse", label, effect.attributes.join(", "), SCORE_THRESHOLD.fall, "The office use is less aligned with this district.");
    applyListEffect(states, effect.enter || [], "enter", "operationalUse", label, effect.attributes.join(", "), SCORE_THRESHOLD.entry, "The office use introduces a signal-specific district.");
    used = true;
  });
  return used;
}

function valuesMatch(actual, expected) {
  if (!expected) return true;
  const expectedValues = Array.isArray(expected) ? expected : [expected];
  return expectedValues.includes(actual);
}

function includesAll(values, expected) {
  if (!expected) return true;
  const current = new Set(list(values));
  return expected.every((value) => current.has(value));
}

function crossSignalMatches(profile, match = {}) {
  if (!valuesMatch(profile.businessType, match.businessType)) return false;
  if (!valuesMatch(profile.officeEnvironment, match.officeEnvironment)) return false;
  if (!valuesMatch(profile.expectedGrowth, match.expectedGrowth)) return false;
  if (!valuesMatch(profile.clientVisitFrequency, match.clientVisitFrequency)) return false;
  if (!includesAll(profile.operationalUse, match.operationalUseIncludes)) return false;
  return true;
}

function applyCrossSignalEffects(model, states, profile) {
  const used = [];
  (model.crossSignalEffects || []).forEach((effect) => {
    if (!crossSignalMatches(profile, effect.match)) return;
    const points = Number(effect.points || SCORE_THRESHOLD.rise);
    applyListEffect(
      states,
      effect.rise || [],
      "rise",
      effect.signalId || effect.id || "crossSignal",
      effect.label,
      (effect.attributes || []).join(", "),
      points,
      effect.practicalImplication || "The combined business signals align with this district."
    );
    applyListEffect(
      states,
      effect.fall || [],
      "fall",
      effect.signalId || effect.id || "crossSignal",
      effect.label,
      (effect.attributes || []).join(", "),
      -Math.abs(Number(effect.fallPoints || SCORE_THRESHOLD.fall)),
      effect.fallImplication || "The combined business signals make this district less aligned than stronger candidates."
    );
    applyListEffect(
      states,
      effect.enter || [],
      "enter",
      effect.signalId || effect.id || "crossSignal",
      effect.label,
      (effect.attributes || []).join(", "),
      SCORE_THRESHOLD.entry,
      effect.entryImplication || "The combined business signals introduce this district."
    );
    used.push(effect.id || effect.signalId || "crossSignal");
  });
  return used;
}

function applyConstraintValue(states, constraint, signalId, signalLabel) {
  if (!constraint) return false;
  applyListEffect(states, constraint.rise || [], "rise", signalId, signalLabel, (constraint.attributes || []).join(", "), SCORE_THRESHOLD.rise, "The location constraint aligns with this district.");
  applyListEffect(states, constraint.fall || [], "fall", signalId, signalLabel, (constraint.attributes || []).join(", "), SCORE_THRESHOLD.fall, "The location constraint makes this district less aligned than stronger candidates.");
  applyListEffect(states, constraint.enter || [], "enter", signalId, signalLabel, (constraint.attributes || []).join(", "), SCORE_THRESHOLD.entry, "The location constraint introduces this district.");
  return true;
}

function applyAnchor(model, states, profile) {
  const anchorId = profile.districtAnchor;
  if (!anchorId || !model.districts[anchorId]) return false;
  for (const state of states.values()) {
    if (profile.hardDistrictOnly && state.districtId !== anchorId) {
      state.excluded = true;
      state.included = false;
      state.exclusionReason = `User asked to focus only on ${model.districts[anchorId].districtName}.`;
    }
  }
  addReason(states, anchorId, "rise", "districtAnchor", `District anchor: ${model.districts[anchorId].districtName}`, "user-selected geography", SCORE_THRESHOLD.anchor, "The user named this district.");
  const anchorState = states.get(anchorId);
  if (anchorState) anchorState.included = true;
  if (profile.openToNearbyAlternatives && !profile.hardDistrictOnly) {
    const anchor = model.districts[anchorId];
    applyListEffect(states, anchor.nearbyAlternatives || [], "enter", "nearbyAlternatives", `Nearby alternatives to ${anchor.districtName}`, "nearbyAlternatives", SCORE_THRESHOLD.adjacent, "The user is open to known nearby alternatives.");
  }
  return true;
}

function signalCount(profile, usedSignals, ignoredSignals) {
  const factSignals = [
    profile.headcount,
    profile.regularOccupancy,
    profile.hybridWorkPattern,
    profile.expectedGrowth && profile.expectedGrowth !== "low" ? profile.expectedGrowth : "",
    profile.clientVisitFrequency && profile.clientVisitFrequency !== "low" ? profile.clientVisitFrequency : "",
    profile.recruitingImportance && profile.recruitingImportance !== "low" ? profile.recruitingImportance : "",
    profile.businessType,
    profile.districtAnchor,
    profile.commuteOrientation,
    profile.transitImportance && profile.transitImportance !== "low" ? profile.transitImportance : "",
    profile.parkingImportance && profile.parkingImportance !== "low" ? profile.parkingImportance : "",
    profile.walkabilityAmenitiesImportance && profile.walkabilityAmenitiesImportance !== "low" ? profile.walkabilityAmenitiesImportance : "",
    profile.officeEnvironment !== "not_sure" ? profile.officeEnvironment : "",
    profile.institutionProximity,
    ...profile.operationalUse,
  ].filter(Boolean).length;
  return Math.max(factSignals, usedSignals.length) + ignoredSignals.length;
}

function candidateItems(model, states, candidateIds) {
  return candidateIds.map((districtId) => {
    const district = model.districts[districtId];
    const state = states.get(districtId);
    return {
      districtId,
      districtName: district.districtName,
      launchRole: district.launchRole,
      strategyRole: district.strategyRole,
      score: state.score,
      movement: state.movement,
      reasons: state.reasons,
    };
  });
}

function chooseState(profile, candidates, signalsUsed) {
  if (!signalsUsed.length) return "starting_set";
  const scores = candidates.map((candidate) => candidate.score);
  const spread = Math.max(...scores) - Math.min(...scores);
  if (spread >= MEANINGFUL_DIFFERENCE + 2 && signalsUsed.length >= 3) return "refined_shortlist";
  return "emerging_ranking";
}

function markMovement(states, model) {
  for (const state of states.values()) {
    if (state.excluded) {
      state.movement = "excluded";
    } else if (state.entered) {
      state.movement = "entered";
    } else if (state.score >= SCORE_THRESHOLD.rise) {
      state.movement = "rose";
    } else if (state.score <= SCORE_THRESHOLD.fall) {
      state.movement = "fell";
    } else if (model.initialConsiderationSet.includes(state.districtId)) {
      state.movement = "held";
    } else {
      state.movement = "secondary";
    }
  }
}

function shortlistForState(stateId, candidates) {
  if (stateId === "starting_set") return candidates;
  const maxScore = Math.max(...candidates.map((candidate) => candidate.score));
  const defensible = candidates.filter((candidate) => candidate.score >= maxScore - DEFENSIBLE_DISTANCE);
  if (stateId === "emerging_ranking") {
    return candidates.filter((candidate) => candidate.score >= Math.max(0, maxScore - DEFENSIBLE_DISTANCE));
  }
  return defensible.length ? defensible : candidates.slice(0, 1);
}

function groupNearTies(candidates) {
  const groups = [];
  const sorted = [...candidates].sort((a, b) => b.score - a.score || a.districtName.localeCompare(b.districtName));
  sorted.forEach((candidate) => {
    const group = groups.find((items) => Math.abs(items[0].score - candidate.score) <= NEAR_TIE_DISTANCE);
    if (group) group.push(candidate);
    else groups.push([candidate]);
  });
  return groups.filter((group) => group.length > 1).map((group) => group.map((candidate) => ({
    districtId: candidate.districtId,
    districtName: candidate.districtName,
    score: candidate.score,
  })));
}

function attributeValues(model, candidates, attribute) {
  return unique(candidates.map((candidate) => {
    const district = model.districts[candidate.districtId];
    if (!district) return "";
    if (attribute === "ecosystems") return (district.ecosystems || []).join("|");
    return district.stableAttributes && district.stableAttributes[attribute];
  }));
}

function highestValueNextQuestion(model, profile, candidates) {
  const questions = model.nextQuestions;
  const candidatesForQuestion = candidates.length ? candidates : model.initialConsiderationSet.map((districtId) => ({ districtId }));
  const answered = {
    commuteOrientation: Boolean(profile.commuteOrientation),
    officeEnvironment: Boolean(profile.officeEnvironment && profile.officeEnvironment !== "not_sure"),
    clientVisitFrequency: Boolean(profile.clientVisitFrequency),
    expectedGrowth: Boolean(profile.expectedGrowth),
    businessType: Boolean(profile.businessType),
  };
  const scores = Object.entries(questions).map(([questionId, question]) => {
    if (answered[questionId]) return { questionId, question, score: -1 };
    const variance = question.targets.reduce((sum, attribute) => {
      const values = attributeValues(model, candidatesForQuestion, attribute);
      return sum + (values.length > 1 ? values.length : 0);
    }, 0);
    return { questionId, question, score: variance };
  }).sort((a, b) => b.score - a.score);
  const selected = scores.find((item) => item.score > 0) || scores.find((item) => item.score === 0);
  if (!selected) return null;
  return {
    questionId: selected.question.questionId,
    prompt: selected.question.prompt,
    rationale: `This question targets unresolved differences in ${selected.question.targets.join(", ")} among the current candidates.`,
    targets: selected.question.targets,
  };
}

function shortlistRationale(stateId, shortlist, candidates) {
  if (stateId === "starting_set") {
    return "Five default San Francisco office districts remain visible because only city and space type are known.";
  }
  if (shortlist.length === candidates.length) {
    return `${shortlist.length} districts remain defensible because the supplied signals do not yet create enough separation to remove them.`;
  }
  return `${shortlist.length} districts remain in the shortlist because their scores stay within the defensible editorial band for the supplied signals.`;
}

function unresolvedTradeoffs(profile, nextQuestion) {
  const tradeoffs = [];
  if (!profile.commuteOrientation) tradeoffs.push("employee commute orientation");
  if (!profile.officeEnvironment || profile.officeEnvironment === "not_sure") tradeoffs.push("preferred office environment");
  if (!profile.clientVisitFrequency) tradeoffs.push("client visit frequency");
  if (!profile.expectedGrowth) tradeoffs.push("expected growth");
  if (!profile.businessType) tradeoffs.push("business type or industry context");
  if (nextQuestion && !tradeoffs.includes(nextQuestion.prompt)) return tradeoffs;
  return tradeoffs;
}

function resolveSfOfficeRecommendation(rawProfile = {}, model = sfOfficeRecommendationModel) {
  const profile = normalizeProfile(rawProfile);
  const states = new Map(modelDistricts(model).map((district) => [district.districtId, stateForDistrict(district)]));
  const usedSignals = [];
  const ignoredSignals = [];
  const appliedFamilies = new Set();
  const signalAudit = {
    policy: model.signalDeduplication && model.signalDeduplication.policy || "",
    contributions: [],
  };

  if (profile.spaceType && slugKey(profile.spaceType) !== "office") {
    return {
      modelKey: model.modelKey,
      applicable: false,
      reason: "The San Francisco Office model only evaluates office searches.",
    };
  }

  applyAnchor(model, states, profile) && usedSignals.push("districtAnchor");

  const commuteEffect = model.constraints.commuteOrientation.values[profile.commuteOrientation];
  if (applyConstraintValue(states, commuteEffect, "commuteOrientation", `Commute orientation: ${profile.commuteOrientation.replace(/_/g, " ")}`)) {
    usedSignals.push("commuteOrientation");
  }

  const institutionEffect = model.constraints.institutionProximity.values[profile.institutionProximity];
  if (applyConstraintValue(states, institutionEffect, "institutionProximity", `Institution proximity: ${profile.institutionProximity.toUpperCase()}`)) {
    usedSignals.push("institutionProximity");
  }

  if (applyPriority(model, states, "regional_transit", profile.transitImportance, { appliedFamilies, signalAudit })) usedSignals.push("regional_transit");
  if (applyPriority(model, states, "parking", profile.parkingImportance, { appliedFamilies, signalAudit })) usedSignals.push("parking");
  if (applyPriority(model, states, "walkability_amenities", profile.walkabilityAmenitiesImportance, { appliedFamilies, signalAudit })) usedSignals.push("walkability_amenities");
  if (applyPriority(model, states, "client_access", profile.clientVisitFrequency, { appliedFamilies, signalAudit })) usedSignals.push("client_access");
  if (applyPriority(model, states, "recruiting", profile.recruitingImportance, { appliedFamilies, signalAudit })) usedSignals.push("recruiting");
  if (applyPriority(model, states, "growth_flexibility", profile.expectedGrowth, { appliedFamilies, signalAudit })) usedSignals.push("growth_flexibility");
  if (applyOfficeEnvironment(model, states, profile.officeEnvironment)) usedSignals.push("officeEnvironment");
  if (applyBusinessType(model, states, profile.businessType)) usedSignals.push("businessType");
  if (applyOperationalUse(model, states, profile.operationalUse, appliedFamilies, signalAudit)) usedSignals.push("operationalUse");
  usedSignals.push(...applyCrossSignalEffects(model, states, profile));

  if (profile.budgetContext.length) {
    ignoredSignals.push({
      signalId: "costBudgetContext",
      values: profile.budgetContext,
      treatment: "preserved_for_broker_handoff",
      rankingEffect: "none",
      explanation: model.explanationTemplates.costIgnored,
    });
  }

  markMovement(states, model);

  let currentIds = model.districtOrder.filter((districtId) => {
    const state = states.get(districtId);
    return state && state.included && !state.excluded && state.score >= SCORE_THRESHOLD.fall;
  });
  if (!usedSignals.length) currentIds = model.initialConsiderationSet.slice();

  const currentCandidates = candidateItems(model, states, currentIds);
  const stateId = chooseState(profile, currentCandidates, usedSignals);
  const ordered = model.confidenceStates[stateId].ordered;
  const orderedCandidates = ordered
    ? [...currentCandidates].sort((a, b) => b.score - a.score || model.districtOrder.indexOf(a.districtId) - model.districtOrder.indexOf(b.districtId))
    : [];
  const displayCandidates = ordered ? orderedCandidates : currentCandidates;
  const shortlist = shortlistForState(stateId, displayCandidates);
  const shortlistIds = new Set(shortlist.map((candidate) => candidate.districtId));
  const secondaryAlternatives = model.districtOrder
    .filter((districtId) => !shortlistIds.has(districtId))
    .map((districtId) => states.get(districtId))
    .filter((state) => state && !state.excluded)
    .map((state) => ({
      districtId: state.districtId,
      districtName: state.districtName,
      launchRole: state.launchRole,
      movement: state.movement,
      score: state.score,
      reasons: state.reasons,
    }));
  const excludedCandidates = Array.from(states.values()).filter((state) => state.excluded).map((state) => ({
    districtId: state.districtId,
    districtName: state.districtName,
    reason: state.exclusionReason,
  }));
  const nextQuestion = highestValueNextQuestion(model, profile, shortlist);

  return {
    modelKey: model.modelKey,
    schemaVersion: model.schemaVersion,
    applicable: true,
    state: {
      id: stateId,
      label: model.confidenceStates[stateId].label,
      description: model.confidenceStates[stateId].description,
      ordered,
    },
    initialConsiderationSet: model.initialConsiderationSet.map((districtId) => ({
      districtId,
      districtName: model.districts[districtId].districtName,
    })),
    currentCandidates: displayCandidates,
    orderedCandidates,
    shortlist,
    tiedCandidates: groupNearTies(shortlist),
    secondaryAlternatives,
    excludedCandidates,
    explanations: displayCandidates.flatMap((candidate) => candidate.reasons.map((reason) => ({
      districtId: candidate.districtId,
      districtName: candidate.districtName,
      movement: candidate.movement,
      ...reason,
    }))),
    profileSignalsUsed: unique(usedSignals),
    signalAudit: {
      ...signalAudit,
      duplicateSemanticContributions: signalAudit.contributions.filter((item) => item.treatment === "deduplicated"),
    },
    ignoredSignals,
    unresolvedTradeoffs: unresolvedTradeoffs(profile, nextQuestion),
    recommendedNextQuestion: nextQuestion,
    confidence: {
      state: stateId,
      description: model.confidenceStates[stateId].description,
    },
    shortlistSizeRationale: shortlistRationale(stateId, shortlist, displayCandidates),
    normalizedProfile: profile,
    economicsPolicy: {
      budgetRankingAllowed: false,
      costPositionUsed: false,
      dynamicMarketEconomicsUsed: false,
      explanation: "Budget, current rents, concessions, availability, and costPosition do not influence San Francisco Office district recommendations.",
    },
    signalCount: signalCount(profile, usedSignals, ignoredSignals),
  };
}

module.exports = {
  resolveSfOfficeRecommendation,
  normalizeProfile,
  sfOfficeRecommendationModel,
};
