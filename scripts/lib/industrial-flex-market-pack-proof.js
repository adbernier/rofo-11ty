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
  const cityMembership = pack.membership.marketAliases.includes(marketId) && (!city || city === clean(pack.market.municipality)) && (!state || pack.market.stateAliases.includes(state));
  const codes = pack.membership.reasonCodes;
  let reason = "ELIGIBLE";
  if (!cityMembership) reason = pack.membership.rejectedMarketAliases.includes(marketId) ? codes.rejectedMarket : codes.outsideMunicipality;
  else if (propertyType !== pack.market.propertyType) reason = codes.unsupportedPropertyType;
  else if (unsupportedCandidateId) reason = codes.unsupportedCandidate;
  return { eligible: reason === "ELIGIBLE", reason, marketId, city, state, propertyType, candidateDistrictIds, canonicalCandidateIds, unsupportedCandidateId, cityMembership };
}

function resolveIntent(pack, requirement = {}) {
  const text = allText(requirement), activities = requirement.activities || [], config = pack.intent;
  let industrialSignals = activities.filter(id => config.industrialActivities.includes(id)).length;
  let flexSignals = activities.filter(id => config.flexActivities.includes(id)).length;
  if (pattern(config.industrialTextBoost).test(text)) industrialSignals += config.boostWeight;
  if (pattern(config.flexTextBoost).test(text)) flexSignals += config.boostWeight;
  const ratio = config.dominanceRatio;
  const mode = industrialSignals && flexSignals ? industrialSignals >= flexSignals * ratio ? "industrial" : flexSignals >= industrialSignals * ratio ? "flex" : "mixed" : industrialSignals > flexSignals ? "industrial" : flexSignals > industrialSignals ? "flex" : "unresolved";
  return { mode, industrialSignals, flexSignals, activities, text };
}

function projectRequirement(pack, requirement = {}) {
  const membership = resolveMembership(pack, requirement), preference = requirement.locationLogic?.specificPreference || {}, resolved = resolveIntent(pack, requirement), rules = pack.abstention, codes = pack.membership.reasonCodes, messages = rules.messages;
  const conflictingUse = anyActivity(resolved.activities, rules.heavyActivities) && anyActivity(resolved.activities, rules.customerActivities);
  let abstention = null;
  if ([codes.outsideMunicipality, codes.rejectedMarket].includes(membership.reason)) abstention = { code: membership.reason, reason: messages.outsideBoundary };
  else if (membership.reason === codes.unsupportedPropertyType) abstention = { code: codes.unsupportedPropertyType, reason: messages.unsupportedPropertyType };
  else if (membership.reason === codes.unsupportedCandidate || pattern(rules.outsideScopePattern).test(resolved.text)) abstention = { code: "REGIONAL_SCOPE_UNSUPPORTED", reason: messages.regionalScope };
  else if (pattern(rules.specializedPattern).test(resolved.text)) abstention = { code: "SPECIALIZED_USE", reason: messages.specializedUse };
  else if (pattern(rules.capabilityPattern).test(resolved.text)) abstention = { code: "PROPERTY_CAPABILITY_DOMINATES", reason: messages.propertyCapability };
  else if (pattern(rules.accessPattern).test(resolved.text)) abstention = { code: "ACCESS_EVIDENCE_GAP", reason: messages.accessGap };
  else if (conflictingUse) abstention = { code: "CONFLICTING_OPERATING_CUSTOMER_USE", reason: messages.conflictingUse };
  else if (resolved.mode === "unresolved") abstention = { code: "UNRESOLVED_INTENT", reason: messages.unresolvedIntent };
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
  const checks = [activity, text, derivedMatch].filter(value => value !== null);
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
  return rule?.traits || [];
}
function labels(pack, matches) { return matches.slice(0, 4).map(trait => pack.composition.traitLabels[trait] || trait.toLowerCase().replaceAll("_", " ")); }
function sourceIds(candidate) { return candidate.provenance.map(item => item.id); }

function composeForModel(pack, requirement, foundation, model, options = {}) {
  const projection = projectRequirement(pack, requirement);
  if (!projection.supported || projection.abstention) return { supported: projection.supported, projection, resolvedModel: projection.resolverInput.mode, considered: [], shortlist: [], candidateContext: [] };
  const wanted = desiredTraits(pack, projection.resolverInput, model), decisive = decisiveTraits(pack, projection.resolverInput, model), requested = new Set(projection.comparisonContext.candidateDistrictIds), config = pack.composition;
  const considered = config.candidateOrder.map(districtId => {
    const candidate = foundation.candidates[districtId], record = foundation.evidence[model][districtId], matches = wanted.filter(trait => record.traits.includes(trait));
    const eligible = matches.length > 0 && (!decisive.length || decisive.some(trait => record.traits.includes(trait)));
    const applicability = FIT_LABEL[model], matchedLabels = labels(pack, matches), fitBand = config.fit[model][districtId];
    return { districtId, districtName: candidate.label, canonicalDistrictId: districtId, memberDistrictIds: candidate.componentGeographyIds, municipality: candidate.municipality, path: candidate.path || "", model, applicability,
      propertyTypeFit: { band: fitBand, summary: `${applicability} applicability: ${record.strengths[0]}`, evidenceSources: sourceIds(candidate) },
      environment: { band: matches.length >= 2 ? "STRONG" : matches.length ? "GOOD" : "UNKNOWN", matchedTraits: matches, reasons: matchedLabels.length ? [`This Requirement matches the reviewed ${matchedLabels.join(", ")} character of this operating environment.`] : [], evidenceSources: sourceIds(candidate) },
      compositionBand: eligible ? (matches.length >= 2 ? "STRONG_FIT" : "GOOD_FIT") : "INELIGIBLE", role: record.strengths[0], strengths: [...(matchedLabels.length ? [`This Requirement aligns with reviewed ${matchedLabels.join(", ")} evidence.`] : []), ...record.strengths], tradeoffs: record.tradeoffs,
      unknowns: [foundation.propertyVerification, foundation.accessIntelligence.limitation], representatives: candidate.representatives, evidenceIds: sourceIds(candidate), candidatePreference: requested.has(districtId), internalOrdering: { matchedReviewedTraitCount: matches.length, reviewedFitBand: fitBand, candidateExcluded: true } };
  });
  const eligible = considered.filter(item => item.compositionBand !== "INELIGIBLE").sort((a, b) => config.fitOrder[b.internalOrdering.reviewedFitBand] - config.fitOrder[a.internalOrdering.reviewedFitBand] || b.internalOrdering.matchedReviewedTraitCount - a.internalOrdering.matchedReviewedTraitCount || a.districtId.localeCompare(b.districtId));
  const shortlist = options.deferShortlist ? [] : eligible.slice(0, 2);
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
    return { ...item, model: "mixed", applicability: "Mixed Industrial/Flex", propertyTypeFit: { ...item.propertyTypeFit, summary: `Mixed Industrial/Flex applicability: ${foundation.evidence.mixed[item.districtId].evidenceBoundary}` }, environment: { ...item.environment, matchedTraits: combined, band: combined.length >= 2 ? "STRONG" : "GOOD" }, role: "Supports independently reviewed Industrial and Flex aspects of this Requirement.", strengths: [...new Set([...item.strengths, ...flexItem.strengths])], internalOrdering: { ...item.internalOrdering, matchedReviewedTraitCount: combined.length, combinedReviewedFit: pack.composition.fitOrder[item.internalOrdering.reviewedFitBand] + pack.composition.fitOrder[flexItem.internalOrdering.reviewedFitBand] } };
  }).sort((a, b) => b.internalOrdering.combinedReviewedFit - a.internalOrdering.combinedReviewedFit || b.internalOrdering.matchedReviewedTraitCount - a.internalOrdering.matchedReviewedTraitCount || a.districtId.localeCompare(b.districtId));
  return { ...industrial, resolvedModel: "mixed", considered: common, shortlist: options.deferShortlist ? [] : common.slice(0, 2), modelResults: { industrial, flex } };
}

module.exports = { resolveMembership, resolveIntent, projectRequirement, desiredTraits, decisiveTraits, composeForModel, composeLocationRecommendations };
