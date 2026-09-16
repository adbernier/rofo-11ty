"use strict";

const FIT_LABEL = { industrial: "Industrial-led", flex: "Flex-led" };

function clean(value) { return String(value == null ? "" : value).trim().toLowerCase(); }
function pattern(source) { return new RegExp(source, "i"); }
function allText(requirement) {
  return [requirement.businessContext?.summary, ...(requirement.criteria || []).flatMap(item => [item.dimension, item.value?.text, ...(item.value?.list || [])])].filter(Boolean).join(" ").toLowerCase();
}
function anyActivity(activities, expected = []) { return expected.some(id => activities.includes(id)); }

function resolveMembership(pack, input = {}) {
  const requirementShape = Boolean(input.locationLogic || input.propertyTypes);
  const anchor = requirementShape ? input.locationLogic?.marketAnchor || {} : input;
  const marketId = clean(anchor.marketId || anchor.geographyId);
  const city = clean(anchor.city || anchor.marketCity);
  const state = clean(anchor.state || anchor.marketState);
  const propertyTypes = requirementShape ? input.propertyTypes || [] : [input.propertyType].filter(Boolean);
  const propertyType = propertyTypes.length === 1 ? clean(propertyTypes[0]) : "";
  const preference = requirementShape ? input.locationLogic?.specificPreference || {} : input;
  const candidateDistrictIds = (preference.candidateDistrictIds || []).map(clean).filter(Boolean);
  const owners = pack.membership.candidateOwners;
  const canonicalCandidateIds = [...new Set(candidateDistrictIds.map(id => owners[id]).filter(Boolean))];
  const unsupportedCandidateId = candidateDistrictIds.find(id => !owners[id]) || "";
  const membershipRules = pack.membership.acceptedRules || [];
  const matchedRule = membershipRules.find(rule => rule.marketAliases.includes(marketId) && (rule.city === "REQUIRED" ? city === clean(pack.market.municipality) : rule.city === "OPTIONAL" ? (!city || city === clean(pack.market.municipality)) : true) && (!rule.checkState || !state || pack.market.stateAliases.includes(state)));
  const cityMembership = membershipRules.length ? Boolean(matchedRule) : pack.membership.marketAliases.includes(marketId) && (!city || city === clean(pack.market.municipality)) && (!state || pack.market.stateAliases.includes(state));
  const rejectedMembership = (pack.membership.rejectedRules || []).some(rule => rule.marketAliases.includes(marketId) && (rule.city === "EMPTY" ? !city : true));
  const codes = pack.membership.reasonCodes;
  let reason = "ELIGIBLE";
  if (!cityMembership) reason = rejectedMembership || (!pack.membership.rejectedRules && pack.membership.rejectedMarketAliases.includes(marketId)) ? codes.rejectedMarket : codes.outsideMunicipality;
  else if (propertyType !== pack.market.propertyType) reason = codes.unsupportedPropertyType;
  else if (unsupportedCandidateId) reason = codes.unsupportedCandidate;
  const result = { eligible: reason === "ELIGIBLE", reason, marketId, city };
  if (pack.membership.includeState !== false) result.state = state;
  Object.assign(result, { propertyType, candidateDistrictIds, canonicalCandidateIds, unsupportedCandidateId });
  if (membershipRules.length) for (const rule of membershipRules) result[rule.flag] = matchedRule?.id === rule.id;
  else result.cityMembership = cityMembership;
  return result;
}

function resolveIntent(pack, requirement = {}) {
  const text = allText(requirement), activities = requirement.activities || [], config = pack.intent;
  let industrialSignals = activities.filter(id => config.industrialActivities.includes(id)).length;
  let flexSignals = activities.filter(id => config.flexActivities.includes(id)).length;
  if (pattern(config.industrialTextBoost).test(text)) industrialSignals += config.boostWeight;
  if (pattern(config.flexTextBoost).test(text)) flexSignals += config.boostWeight;
  for (const boost of config.conditionalBoosts || []) {
    if ((!boost.activitiesAny || anyActivity(activities, boost.activitiesAny)) && (!boost.textPattern || pattern(boost.textPattern).test(text))) {
      industrialSignals += boost.industrial || 0;
      flexSignals += boost.flex || 0;
    }
  }
  const ratio = config.dominanceRatio;
  const mode = industrialSignals && flexSignals ? industrialSignals >= flexSignals * ratio ? "industrial" : flexSignals >= industrialSignals * ratio ? "flex" : "mixed" : industrialSignals > flexSignals ? "industrial" : flexSignals > industrialSignals ? "flex" : "unresolved";
  return { mode, industrialSignals, flexSignals, activities, text };
}

function projectRequirement(pack, requirement = {}) {
  const membership = resolveMembership(pack, requirement), preference = requirement.locationLogic?.specificPreference || {}, resolved = resolveIntent(pack, requirement), rules = pack.abstention, codes = pack.membership.reasonCodes, messages = rules.messages;
  const conflictingUse = anyActivity(resolved.activities, rules.heavyActivities) && anyActivity(resolved.activities, rules.customerActivities) && !(rules.conflictExemptionPattern && pattern(rules.conflictExemptionPattern).test(resolved.text));
  const abstentionCodes = { regionalScope: "REGIONAL_SCOPE_UNSUPPORTED", specializedUse: "SPECIALIZED_USE", propertyCapability: "PROPERTY_CAPABILITY_DOMINATES", accessGap: "ACCESS_EVIDENCE_GAP", conflictingUse: "CONFLICTING_OPERATING_CUSTOMER_USE", unresolvedIntent: "UNRESOLVED_INTENT", ...(rules.codes || {}) };
  let abstention = null;
  if ([codes.outsideMunicipality, codes.rejectedMarket].includes(membership.reason)) abstention = { code: membership.reason, reason: messages.outsideBoundary };
  else if (membership.reason === codes.unsupportedPropertyType) abstention = { code: codes.unsupportedPropertyType, reason: messages.unsupportedPropertyType };
  else if (membership.reason === codes.unsupportedCandidate || pattern(rules.outsideScopePattern).test(resolved.text)) abstention = { code: abstentionCodes.regionalScope, reason: messages.regionalScope };
  else if (pattern(rules.specializedPattern).test(resolved.text)) abstention = { code: abstentionCodes.specializedUse, reason: messages.specializedUse };
  else if (pattern(rules.capabilityPattern).test(resolved.text)) abstention = { code: abstentionCodes.propertyCapability, reason: messages.propertyCapability };
  else if (pattern(rules.accessPattern).test(resolved.text)) abstention = { code: abstentionCodes.accessGap, reason: messages.accessGap };
  else if (conflictingUse) abstention = { code: abstentionCodes.conflictingUse, reason: messages.conflictingUse };
  else if (resolved.mode === "unresolved") abstention = { code: abstentionCodes.unresolvedIntent, reason: messages.unresolvedIntent };
  return { supported: membership.eligible, membership, modelKey: abstention ? "" : `${pack.market.id}:${resolved.mode}`, resolverInput: resolved, abstention,
    consumedSignals: [{ sourceDimension: "propertyTypes", projectedValue: pack.market.propertyType, rankingEffect: "eligibility" }, { sourceDimension: "activities/businessContext/criteria", projectedValue: resolved.mode, rankingEffect: "model_resolution" }],
    comparisonContext: { candidateDistrictIds: membership.canonicalCandidateIds.slice(), sourceCandidateDistrictIds: membership.candidateDistrictIds.slice(), candidateDistrictNames: (preference.candidateDistrictNames || []).slice(), treatment: "COMPARISON_CONTEXT_ONLY" } };
}

function derivedSignals(config, input) {
  const output = {};
  for (const [name, rule] of Object.entries(config.derivedSignals)) output[name] = (rule.activitiesAny ? anyActivity(input.activities, rule.activitiesAny) : false) || (rule.textPattern ? pattern(rule.textPattern).test(input.text) : false);
  return output;
}
function ruleMatches(rule, input, mode, derived) {
  if (rule.mode && rule.mode !== mode) return false;
  const activity = rule.activitiesAny ? anyActivity(input.activities, rule.activitiesAny) : null;
  const text = rule.textPattern ? pattern(rule.textPattern).test(input.text) : null;
  const derivedMatch = rule.derivedAll ? rule.derivedAll.every(name => derived[name]) : null;
  const derivedNone = rule.derivedNone ? rule.derivedNone.every(name => !derived[name]) : null;
  const checks = [activity, text, derivedMatch, derivedNone].filter(value => value !== null);
  return rule.match === "ANY" ? checks.some(Boolean) : checks.every(Boolean);
}
function desiredTraits(pack, input, mode) {
  const config = pack.composition, derived = derivedSignals(config, input), traits = [];
  for (const rule of config.traitRules) if (ruleMatches(rule, input, mode, derived)) traits.push(...(rule.add || []), ...(rule.addByMode?.[mode] || []));
  return [...new Set(traits)];
}
function decisiveTraits(pack, input, mode) {
  const derived = derivedSignals(pack.composition, input);
  const rule = pack.composition.decisiveRules.find(item => ruleMatches(item, input, mode, derived));
  return rule?.traitsByMode?.[mode] || rule?.traits || [];
}
function labels(pack, matches) { return matches.slice(0, 4).map(trait => pack.composition.traitLabels[trait] || trait.toLowerCase().replaceAll("_", " ")); }
function sourceIds(candidate) { return candidate.provenance.map(item => item.id); }
function compareItems(config, fields, a, b) {
  for (const field of fields) {
    if (field === "districtId") { const result = a.districtId.localeCompare(b.districtId); if (result) return result; continue; }
    if (field === "reviewedFitBand") { const result = config.fitOrder[b.internalOrdering.reviewedFitBand] - config.fitOrder[a.internalOrdering.reviewedFitBand]; if (result) return result; continue; }
    const result = Number(b.internalOrdering[field] || 0) - Number(a.internalOrdering[field] || 0);
    if (result) return result;
  }
  return 0;
}

function composeForModel(pack, requirement, foundation, model, options = {}) {
  const projection = projectRequirement(pack, requirement);
  if (!projection.supported || projection.abstention) return { supported: projection.supported, projection, resolvedModel: projection.resolverInput.mode, considered: [], shortlist: [], candidateContext: [] };
  const wanted = desiredTraits(pack, projection.resolverInput, model), decisive = decisiveTraits(pack, projection.resolverInput, model), requested = new Set(projection.comparisonContext.candidateDistrictIds), config = pack.composition;
  const considered = config.candidateOrder.map(districtId => {
    const candidate = foundation.candidates[districtId], record = foundation.evidence[model][districtId], matches = wanted.filter(trait => record.traits.includes(trait));
    const gate = (config.candidateGates || []).find(item => item.candidateId === districtId);
    const gateOpen = !gate || !gate.anyTraits || gate.anyTraits.some(trait => wanted.includes(trait));
    const eligible = matches.length > 0 && (!decisive.length || decisive.some(trait => record.traits.includes(trait))) && gateOpen;
    const applicability = FIT_LABEL[model], matchedLabels = labels(pack, matches), fitBand = config.fit[model][districtId];
    return { districtId, districtName: candidate.label, canonicalDistrictId: districtId, memberDistrictIds: candidate.componentGeographyIds, municipality: candidate.municipality, path: candidate.path || candidate.publicContextPaths?.[0] || "", model, applicability,
      propertyTypeFit: { band: fitBand, summary: `${applicability} applicability: ${record.strengths[0]}`, evidenceSources: sourceIds(candidate) },
      environment: { band: matches.length >= 2 ? "STRONG" : matches.length ? "GOOD" : "UNKNOWN", matchedTraits: matches, reasons: matchedLabels.length ? [`This Requirement matches the reviewed ${matchedLabels.join(", ")} character of this operating environment.`] : [], evidenceSources: sourceIds(candidate) },
      compositionBand: eligible ? (matches.length >= 2 ? "STRONG_FIT" : "GOOD_FIT") : "INELIGIBLE", role: record.strengths[0], strengths: [...(matchedLabels.length ? [`This Requirement aligns with reviewed ${matchedLabels.join(", ")} evidence.`] : []), ...record.strengths], tradeoffs: record.tradeoffs,
      unknowns: [foundation.propertyVerification, foundation.accessIntelligence.limitation], representatives: candidate.representatives, evidenceIds: sourceIds(candidate), candidatePreference: requested.has(districtId), internalOrdering: { matchedReviewedTraitCount: matches.length, reviewedFitBand: fitBand, candidateExcluded: true } };
  });
  const ordering = config.ordering || ["reviewedFitBand", "matchedReviewedTraitCount", "districtId"];
  const eligible = considered.filter(item => item.compositionBand !== "INELIGIBLE").sort((a, b) => compareItems(config, ordering, a, b));
  const shortlist = options.deferShortlist ? [] : eligible.slice(0, config.shortlistLimit || 2);
  return { supported: true, projection, resolvedModel: model, considered, shortlist,
    candidateContext: projection.comparisonContext.candidateDistrictIds.map(districtId => { const item = considered.find(entry => entry.districtId === districtId); return { districtId, districtName: item?.districtName || districtId, sourceIdentityIds: projection.comparisonContext.sourceCandidateDistrictIds.filter(sourceId => pack.membership.candidateOwners[sourceId] === districtId), treatment: "COMPARISON_CONTEXT_ONLY", inShortlist: shortlist.some(entry => entry.districtId === districtId), compositionBand: item?.compositionBand || "NOT_EVALUATED" }; }) };
}

function composeLocationRecommendations(pack, requirement, foundation, options = {}) {
  const projection = projectRequirement(pack, requirement);
  if (!projection.supported || projection.abstention) return { supported: projection.supported, projection, resolvedModel: projection.resolverInput.mode, considered: [], shortlist: [], candidateContext: [] };
  if (projection.resolverInput.mode !== "mixed") return composeForModel(pack, requirement, foundation, projection.resolverInput.mode, options);
  const industrial = composeForModel(pack, requirement, foundation, "industrial", { deferShortlist: true }), flex = composeForModel(pack, requirement, foundation, "flex", { deferShortlist: true }), flexById = new Map(flex.considered.map(item => [item.districtId, item]));
  const common = industrial.considered.filter(item => item.compositionBand !== "INELIGIBLE" && flexById.get(item.districtId)?.compositionBand !== "INELIGIBLE").map(item => {
    const flexItem = flexById.get(item.districtId), combined = [...new Set([...item.environment.matchedTraits, ...flexItem.environment.matchedTraits])];
    const internalOrdering = { ...item.internalOrdering, matchedReviewedTraitCount: combined.length };
    if (pack.composition.includeCombinedReviewedFit !== false) internalOrdering.combinedReviewedFit = pack.composition.fitOrder[item.internalOrdering.reviewedFitBand] + pack.composition.fitOrder[flexItem.internalOrdering.reviewedFitBand];
    return { ...item, model: "mixed", applicability: "Mixed Industrial/Flex", propertyTypeFit: { ...item.propertyTypeFit, summary: `Mixed Industrial/Flex applicability: ${foundation.evidence.mixed[item.districtId].evidenceBoundary}` }, environment: { ...item.environment, matchedTraits: combined, band: combined.length >= 2 ? "STRONG" : "GOOD" }, role: "Supports independently reviewed Industrial and Flex aspects of this Requirement.", strengths: [...new Set([...item.strengths, ...flexItem.strengths])], internalOrdering };
  }).sort((a, b) => compareItems(pack.composition, pack.composition.mixedOrdering || ["combinedReviewedFit", "matchedReviewedTraitCount", "districtId"], a, b));
  return { ...industrial, resolvedModel: "mixed", considered: common, shortlist: options.deferShortlist ? [] : common.slice(0, pack.composition.shortlistLimit || 2), modelResults: { industrial, flex } };
}

module.exports = { resolveMembership, resolveIntent, projectRequirement, desiredTraits, decisiveTraits, composeForModel, composeLocationRecommendations };
