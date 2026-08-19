(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("../access/access-shadow-evaluator"));
  else root.RofoPrivateLocationComposition = factory(root.RofoAccessShadowEvaluator);
})(typeof self !== "undefined" ? self : this, function (shadowEvaluator) {
  "use strict";

  const VERSION = "private-location-composition:v1";
  const BAND_ORDER = { UNKNOWN: -1, WEAK: 0, MODERATE: 1, GOOD: 2, STRONG: 3 };
  const RESULT_ORDER = { WORTH_CONSIDERING: 1, GOOD_FIT: 2, STRONG_FIT: 3 };
  const ACCESS_SIGNALS = new Set(["commuteOrientation", "regional_transit", "parking", "client_access"]);
  const BUSINESS_IDENTITIES = Object.freeze({
    design_creative: { label: "Architecture / design", characteristics: ["CREATIVE_DESIGN_ORIENTED"] },
    professional_services: { label: "Accounting / professional services", characteristics: ["ESTABLISHED_PROFESSIONAL"] },
    technology: { label: "Technology / product", characteristics: ["TECHNOLOGY_INNOVATION"] },
    life_science: { label: "Life science / healthcare", characteristics: ["INSTITUTIONAL_HEALTHCARE"] },
    nonprofit: { label: "Nonprofit / mission-driven", characteristics: ["MISSION_COMMUNITY_ORIENTED"] },
  });

  function label(value) { return String(value || "UNKNOWN").toLowerCase().replaceAll("_", " ").replace(/^./, (character) => character.toUpperCase()); }
  function districtFoundation(id, foundation) { return (foundation.districts || []).find((item) => item.districtId === id) || {}; }
  function productionCandidate(id, production) {
    const lists = [production.result?.orderedCandidates, production.result?.currentCandidates, production.result?.shortlist, production.result?.secondaryAlternatives].filter(Array.isArray);
    return [...new Map(lists.flat().map((item) => [item.districtId, item])).values()].find((item) => item.districtId === id);
  }
  function productionRank(id, production) { const index = (production.result?.orderedCandidates || []).findIndex((item) => item.districtId === id); return index < 0 ? 999 : index + 1; }
  function clientImportance(profile) { return profile.cohorts.some((item) => item.actorType === "CLIENT_CUSTOMER" && ["FREQUENT", "RECURRING"].includes(item.frequency) && ["CORE", "MATERIAL"].includes(item.importance)); }
  function criterion(requirement, dimension) { return (requirement.criteria || []).find((item) => item.dimension === dimension); }
  function criterionText(item) { return item?.value?.list?.length ? item.value.list.join(" ") : item?.value?.text || ""; }
  function businessTypeId(value) {
    const text = String(value || "").toLowerCase();
    if (/architect|design|creative/.test(text)) return "design_creative";
    if (/account|audit|bookkeep|professional service|advisory/.test(text)) return "professional_services";
    if (/technology|software|startup|product/.test(text)) return "technology";
    if (/life science|biotech|healthcare/.test(text)) return "life_science";
    if (/nonprofit|mission.driven/.test(text)) return "nonprofit";
    return "";
  }
  function environmentPreference(value) {
    const text = String(value || "").toLowerCase();
    if (/no strong preference|open to either|no preference/.test(text)) return "NO_STRONG_PREFERENCE";
    if (/creative|design|distinctive|historic/.test(text)) return "creative_informal";
    if (/professional|established|traditional/.test(text)) return "traditional_professional";
    if (/modern|energetic|polished/.test(text)) return "modern_polished";
    return "";
  }
  function businessIdentityProfile(requirement, model) {
    const identityCriterion = criterion(requirement, "universal.business.type");
    const identityText = identityCriterion ? criterionText(identityCriterion) : requirement.businessContext?.summary || "";
    const typeId = businessTypeId(identityText);
    const identity = BUSINESS_IDENTITIES[typeId] || null;
    const preferenceCriterion = criterion(requirement, "office.environment.image");
    const preference = environmentPreference(criterionText(preferenceCriterion));
    const effect = typeId && model?.businessTypeEffects?.[typeId];
    const meaningfulAmbiguity = Boolean(identity && effect && (effect.rise || []).length > 1 && !preference);
    return {
      schemaVersion: "private-business-identity:v1", typeId, label: identity?.label || "", characteristics: identity?.characteristics || [],
      basis: typeId ? (identityCriterion ? "USER_STATED_BUSINESS_IDENTITY" : "USER_STATED_COMPANY_CONTEXT") : "UNKNOWN", environmentPreference: preference,
      confirmation: meaningfulAmbiguity ? {
        applicable: true,
        dimension: "office.environment.image",
        question: "Which kind of setting sounds more like your company?",
        options: ["Established and professional", "Creative and design-oriented", "Modern and energetic", "No strong preference"],
        reason: "Business type supplies a useful prior, but does not establish a consequential environment preference.",
      } : { applicable: false, reason: preference ? "Environment preference is already explicit." : "No supported business-identity ambiguity is active." },
    };
  }
  function accessComponent(access) {
    const materialEmployeeCohorts = (access.employeeCohortResults || []).filter((cohort) => ["CORE", "MATERIAL"].includes(cohort.importance));
    const hasKnownMaterialEmployee = materialEmployeeCohorts.some((cohort) => cohort.rating !== "UNKNOWN");
    const hasUnknownMaterialEmployee = materialEmployeeCohorts.some((cohort) => cohort.rating === "UNKNOWN");
    if (hasKnownMaterialEmployee && hasUnknownMaterialEmployee && BAND_ORDER[access.overall] > BAND_ORDER.MODERATE) {
      return { band: "MODERATE", rawBand: access.overall, confidence: access.confidence, treatment: "MATERIAL_COHORT_GAP_CAP" };
    }
    if (access.confidence === "UNKNOWN") return { band: "UNKNOWN", rawBand: access.overall, confidence: access.confidence, treatment: "UNKNOWN_EVIDENCE" };
    if (access.confidence === "LOW" && BAND_ORDER[access.overall] > BAND_ORDER.MODERATE) return { band: "MODERATE", rawBand: access.overall, confidence: access.confidence, treatment: "LOW_CONFIDENCE_CAP" };
    return { band: access.overall, rawBand: access.overall, confidence: access.confidence, treatment: "AS_EVALUATED" };
  }

  function cohortAccessSummary(cohorts, profile) {
    const material = (cohorts || []).filter((cohort) => ["CORE", "MATERIAL"].includes(cohort.importance));
    const known = material.filter((cohort) => cohort.rating !== "UNKNOWN");
    const unknown = material.filter((cohort) => cohort.rating === "UNKNOWN");
    const origin = (cohort) => profile.cohorts.find((candidate) => candidate.cohortId === cohort.cohortId)?.rawOrigin || cohort.originRegionId;
    if (known.length && unknown.length) {
      const knownText = known.map((cohort) => `${label(cohort.rating)} for ${origin(cohort)}`).join("; ");
      const unknownText = unknown.map((cohort) => `${origin(cohort)} access not established`).join("; ");
      return { band: "MIXED", label: `Mixed — ${knownText}; ${unknownText}`, treatment: "MATERIAL_COHORT_GAP_VISIBLE" };
    }
    if (!known.length) return { band: "UNKNOWN", label: "Not established", treatment: "NO_SUPPORTED_MATERIAL_COHORT" };
    const worst = known.slice().sort((a, b) => BAND_ORDER[a.rating] - BAND_ORDER[b.rating])[0];
    return { band: worst.rating, label: known.length === 1 ? label(worst.rating) : `${label(worst.rating)} across material origins`, treatment: "WORST_SUPPORTED_MATERIAL_COHORT" };
  }

  function businessEnvironment(accessProfile, district, candidate, businessIdentity, model) {
    const specific = (candidate?.reasons || []).filter((reason) => !ACCESS_SIGNALS.has(reason.signalId) && reason.action !== "fall");
    const clientRelevant = clientImportance(accessProfile);
    const clientAccess = district.stableAttributes?.clientAccessibility || "unknown";
    let band = "GOOD";
    const reasons = [];
    const tradeoffs = [];
    if (specific.length >= 2) band = "STRONG";
    if (specific.length) reasons.push(...specific.slice(0, 2).map((item) => item.signalLabel));
    if (clientRelevant && clientAccess === "high") { band = "STRONG"; reasons.push("Reviewed client-access environment aligns with frequent visits."); }
    else if (clientRelevant && clientAccess === "medium") { band = band === "STRONG" ? band : "GOOD"; reasons.push("Client-facing environment is workable, though not a primary district strength."); }
    else if (clientRelevant && ["low", "unknown"].includes(clientAccess)) { band = "MODERATE"; tradeoffs.push("Frequent client visits are less supported by the reviewed district environment."); }
    if (!specific.length && !clientRelevant && district.strategyRole) reasons.push(district.strategyRole);
    const identityEffect = businessIdentity.typeId && model?.businessTypeEffects?.[businessIdentity.typeId];
    let identityChangedBand = false;
    if (identityEffect && (identityEffect.rise || []).includes(district.districtId)) {
      band = "STRONG";
      identityChangedBand = true;
      reasons.unshift(`${businessIdentity.label} is supported by this district's reviewed business-environment pattern.`);
    } else if (identityEffect && (identityEffect.fall || []).includes(district.districtId)) {
      band = "MODERATE";
      identityChangedBand = true;
      tradeoffs.unshift(`${businessIdentity.label} is less supported by this district's reviewed business-environment pattern.`);
    }
    const preferenceEffect = businessIdentity.environmentPreference && businessIdentity.environmentPreference !== "NO_STRONG_PREFERENCE" && model?.officeEnvironmentTaxonomy?.[businessIdentity.environmentPreference];
    const preferenceAlignsWithIdentity = (businessIdentity.characteristics || []).some((characteristic) => (
      (characteristic === "CREATIVE_DESIGN_ORIENTED" && businessIdentity.environmentPreference === "creative_informal") ||
      (characteristic === "ESTABLISHED_PROFESSIONAL" && businessIdentity.environmentPreference === "traditional_professional") ||
      (characteristic === "TECHNOLOGY_INNOVATION" && businessIdentity.environmentPreference === "modern_polished")
    ));
    if (preferenceEffect && (preferenceEffect.rise || []).includes(district.districtId)) {
      band = "STRONG";
      reasons.unshift(`This district matches the ${preferenceEffect.label.toLowerCase()} setting selected.`);
    } else if (preferenceEffect && (preferenceEffect.fall || []).includes(district.districtId)) {
      band = "MODERATE";
      tradeoffs.unshift(`This district is less aligned with the ${preferenceEffect.label.toLowerCase()} setting selected.`);
    } else if (preferenceEffect && identityChangedBand && !preferenceAlignsWithIdentity) {
      band = "GOOD";
      reasons.unshift(`Your explicit ${preferenceEffect.label.toLowerCase()} preference takes precedence over the general ${businessIdentity.label.toLowerCase()} prior here.`);
    }
    return { band, reasons: [...new Set(reasons)], tradeoffs: [...new Set(tradeoffs)], evidenceSources: district.evidenceSources || [], businessIdentityBasis: businessIdentity.basis, characteristics: businessIdentity.characteristics, environmentPreference: businessIdentity.environmentPreference || "UNCONFIRMED" };
  }

  function compositionBand(officeBand, environmentBand, accessBand) {
    if (!["GOOD", "STRONG"].includes(officeBand)) return "INELIGIBLE";
    if (BAND_ORDER[environmentBand] >= BAND_ORDER.GOOD && BAND_ORDER[accessBand] >= BAND_ORDER.GOOD) return "STRONG_FIT";
    if (officeBand === "STRONG" && BAND_ORDER[environmentBand] >= BAND_ORDER.GOOD) return "GOOD_FIT";
    if (BAND_ORDER[accessBand] >= BAND_ORDER.GOOD || BAND_ORDER[environmentBand] >= BAND_ORDER.GOOD) return "GOOD_FIT";
    return "WORTH_CONSIDERING";
  }

  function roleFor(item, profile) {
    const employeeStrength = item.access.employeeCohortResults.some((cohort) => BAND_ORDER[cohort.rating] >= BAND_ORDER.GOOD);
    if (item.eligibilitySource === "SHADOW_ACCESS_ACTIVATION" && employeeStrength) return "A distinct option for your employee access priorities";
    if (item.environment.band === "STRONG" && clientImportance(profile)) return "A strong client-facing business environment";
    if (employeeStrength && BAND_ORDER[item.accessComponent.band] > BAND_ORDER[item.environment.band]) return "A stronger match for the workforce geography you described";
    if (item.office.band === "STRONG") return "A proven conventional Office starting point";
    return "A useful alternative with a different balance of priorities";
  }

  function userStrengths(item, profile) {
    const strengths = [];
    item.access.employeeCohortResults.filter((cohort) => BAND_ORDER[cohort.rating] >= BAND_ORDER.GOOD).slice(0, 2).forEach((cohort) => {
      const origin = profile.cohorts.find((candidate) => candidate.cohortId === cohort.cohortId)?.rawOrigin || cohort.originRegionId;
      strengths.push(`${label(cohort.rating)} supported access for employees coming from ${origin}.`);
    });
    item.access.clientCohortResults.filter((cohort) => BAND_ORDER[cohort.rating] >= BAND_ORDER.GOOD).slice(0, 1).forEach((cohort) => {
      const origin = profile.cohorts.find((candidate) => candidate.cohortId === cohort.cohortId)?.rawOrigin || cohort.originRegionId;
      strengths.push(`${label(cohort.rating)} supported access for visiting clients from ${origin}.`);
    });
    if (item.environment.band === "STRONG" && clientImportance(profile)) strengths.push("Its reviewed business environment supports frequent client visits.");
    if (profile.modePreferences.parking === "CORE" && ["GOOD", "STRONG"].includes(item.parkingEnvironment)) strengths.push("Its reviewed district parking environment supports your very important parking priority.");
    else if (profile.modePreferences.parking === "MATERIAL" && ["GOOD", "STRONG"].includes(item.parkingEnvironment)) strengths.push("Its reviewed district parking environment supports your preference for convenient parking.");
    if (item.environment.band === "STRONG" && item.environment.characteristics.length && item.environment.reasons.length) strengths.push(item.environment.reasons[0]);
    if (item.office.band === "STRONG") strengths.push("It has strong reviewed Office fit.");
    else if (item.office.band === "GOOD") strengths.push("It has good reviewed Office fit for selective users.");
    return [...new Set(strengths)].slice(0, 4);
  }

  function userTradeoffs(item, profile) {
    const tradeoffs = [];
    item.access.employeeCohortResults.filter((cohort) => cohort.rating === "WEAK").slice(0, 2).forEach((cohort) => {
      const origin = profile.cohorts.find((candidate) => candidate.cohortId === cohort.cohortId)?.rawOrigin || cohort.originRegionId;
      tradeoffs.push(`Weaker reviewed access for employees coming from ${origin}.`);
    });
    tradeoffs.push(...item.environment.tradeoffs);
    if (item.parkingRelevant && item.parkingEnvironment === "WEAK") tradeoffs.push(profile.modePreferences.parking === "CORE" ? "District-level parking is constrained despite being very important to you." : "District-level parking remains a tradeoff for your stated preference.");
    if (item.office.tradeoffs.length) tradeoffs.push(item.office.tradeoffs[0]);
    return [...new Set(tradeoffs)].slice(0, 2);
  }

  function meaningfulUnknowns(item) {
    const unknowns = [...item.access.unknowns];
    if (item.districtId === "presidio") unknowns.push("Current suitable Office inventory and building-level availability remain unverified.");
    return [...new Set(unknowns)].slice(0, 2);
  }

  function tieKey(item) {
    const bands = [item.office.band, item.environment.band, item.accessComponent.band].map((band) => BAND_ORDER[band] ?? -1);
    const known = bands.filter((value) => value >= 0);
    return `${RESULT_ORDER[item.compositionBand] || 0}:${bands.filter((value) => value === 3).length}:${bands.filter((value) => value >= 2).length}:${known.length ? Math.min(...known) : -1}`;
  }

  function compareItems(a, b) {
    const result = (RESULT_ORDER[b.compositionBand] || 0) - (RESULT_ORDER[a.compositionBand] || 0);
    if (result) return result;
    const aBands = [a.office.band, a.environment.band, a.accessComponent.band].map((band) => BAND_ORDER[band] ?? -1);
    const bBands = [b.office.band, b.environment.band, b.accessComponent.band].map((band) => BAND_ORDER[band] ?? -1);
    const strong = bBands.filter((value) => value === 3).length - aBands.filter((value) => value === 3).length;
    if (strong) return strong;
    const good = bBands.filter((value) => value >= 2).length - aBands.filter((value) => value >= 2).length;
    if (good) return good;
    return a.productionRank - b.productionRank || a.districtId.localeCompare(b.districtId);
  }

  function comparisonDimensions(profile) {
    const dimensions = [{ id: "office", label: "Office fit" }, { id: "employee", label: "Employee access" }];
    if (clientImportance(profile)) dimensions.push({ id: "client", label: "Client access" }, { id: "environment", label: "Client-facing environment" });
    if (profile.modePreferences.regionalTransit !== "LOW") dimensions.push({ id: "transit", label: "Regional transit" });
    if (profile.modePreferences.parking !== "LOW") dimensions.push({ id: "parking", label: "Parking environment" });
    return dimensions.slice(0, 6);
  }

  function dimensionValue(item, dimension) {
    if (dimension === "office") return label(item.office.band);
    if (dimension === "environment") return label(item.environment.band);
    if (dimension === "employee") return item.employeeAccessSummary.label;
    if (dimension === "client") return label(item.access.clientCohortResults.filter((cohort) => cohort.rating !== "UNKNOWN").sort((a, b) => BAND_ORDER[a.rating] - BAND_ORDER[b.rating])[0]?.rating || "UNKNOWN");
    if (dimension === "parking") return label(item.parkingEnvironment);
    if (dimension === "transit") return label(item.access.modeResults.filter((mode) => ["REGIONAL_TRANSIT", "FERRY"].includes(mode.mode) && mode.rating !== "UNKNOWN").sort((a, b) => BAND_ORDER[b.rating] - BAND_ORDER[a.rating])[0]?.rating || "UNKNOWN");
    return "Unknown";
  }

  function approvedPresentationGroups(compositionFoundation) {
    return (compositionFoundation.presentationGroups || []).filter((group) => group.reviewStatus === "APPROVED");
  }

  function presentationGroupForDistrict(districtId, compositionFoundation) {
    return approvedPresentationGroups(compositionFoundation).find((group) => group.memberDistrictIds.includes(districtId)) || null;
  }

  function collapsePresentationGroups(rawConsidered, compositionFoundation, profile) {
    const groups = approvedPresentationGroups(compositionFoundation);
    const memberIds = new Set(groups.flatMap((group) => group.memberDistrictIds));
    const grouped = groups.map((group) => {
      const members = group.memberDistrictIds.map((districtId) => rawConsidered.find((item) => item.districtId === districtId)).filter(Boolean);
      const canonical = members.find((item) => item.districtId === group.canonicalDistrictId);
      if (!canonical) return null;
      const qualifying = members.filter((item) => item.compositionBand !== "INELIGIBLE");
      const selectedSourceIds = group.memberDistrictIds.filter((districtId) => profile.candidateDistricts.ids.includes(districtId));
      const item = {
        ...canonical,
        districtName: group.displayName,
        presentationGroupId: group.presentationGroupId,
        canonicalDistrictId: group.canonicalDistrictId,
        memberDistrictIds: group.memberDistrictIds.slice(),
        presentationGroupingReason: group.groupingReason,
        presentationComponentPolicy: group.componentPolicy,
        presentationProvenance: group.provenance.slice(),
        qualifyingMemberDistrictIds: qualifying.map((member) => member.districtId),
        candidatePreference: selectedSourceIds.length > 0,
        candidatePreferenceSourceIds: selectedSourceIds,
        eligibilitySource: qualifying.length ? canonical.eligibilitySource !== "NOT_ELIGIBLE" ? canonical.eligibilitySource : qualifying[0].eligibilitySource : "NOT_ELIGIBLE",
        evidenceIds: [...new Set(members.flatMap((member) => member.evidenceIds || []))],
      };
      item.compositionBand = item.eligibilitySource === "NOT_ELIGIBLE" ? "INELIGIBLE" : compositionBand(item.office.band, item.environment.band, item.accessComponent.band);
      item.role = roleFor(item, profile);
      item.tieKey = tieKey(item);
      item.internalOrdering = { ...item.internalOrdering, presentationEligibilityMembers: item.qualifyingMemberDistrictIds.slice(), canonicalComponentDistrictId: group.canonicalDistrictId };
      return item;
    }).filter(Boolean);
    return rawConsidered.filter((item) => !memberIds.has(item.districtId)).concat(grouped);
  }

  function composeLocationRecommendations(requirement, accessFoundation, compositionFoundation, sfOfficeModel, options = {}) {
    const shadow = shadowEvaluator.createAccessShadowComparison(requirement, accessFoundation, sfOfficeModel);
    if (!shadow.production.supported) return { version: VERSION, supported: false, message: shadow.production.message, shadow };
    const profile = shadow.requirementAccessProfile;
    const businessIdentity = businessIdentityProfile(requirement, sfOfficeModel);
    const parkingRelevant = profile.modePreferences.parking !== "LOW";
    const rawConsidered = shadow.access.districtResults.map((access) => {
      const district = districtFoundation(access.districtId, compositionFoundation);
      const candidate = productionCandidate(access.districtId, shadow.production);
      const foundationProfile = accessFoundation.districtProfiles.find((entry) => entry.districtId === access.districtId) || {};
      const officeBand = String(district.officeFit || "unknown").toUpperCase();
      const environment = businessEnvironment(profile, district, candidate, businessIdentity, sfOfficeModel);
      const accessBand = accessComponent(access);
      const reviewedRecommendationCandidate = productionRank(access.districtId, shadow.production) < 999 && foundationProfile.recommendationEligible && foundationProfile.reviewStatus === "APPROVED" && access.confidence !== "UNKNOWN" && ["GOOD", "STRONG"].includes(officeBand);
      const eligibilitySource = access.accessEligibility.startingDistrict ? "PRODUCTION_STARTING_SET" : access.accessEligibility.accessActivated ? "SHADOW_ACCESS_ACTIVATION" : reviewedRecommendationCandidate ? "SHADOW_RECOMMENDATION_CANDIDATE" : "NOT_ELIGIBLE";
      const item = {
        districtId: access.districtId, districtName: access.districtName, access, accessComponent: accessBand,
        office: { band: officeBand, summary: district.officeFitSummary || "", tradeoffs: district.officeTradeoffs || [], evidenceSources: district.evidenceSources || [] },
        environment, parkingEnvironment: foundationProfile.parkingEnvironment || "UNKNOWN",
        parkingRelevant, eligibilitySource, productionRank: productionRank(access.districtId, shadow.production), candidatePreference: profile.candidateDistricts.ids.includes(access.districtId),
      };
      item.employeeAccessSummary = cohortAccessSummary(access.employeeCohortResults, profile);
      item.compositionBand = eligibilitySource === "NOT_ELIGIBLE" ? "INELIGIBLE" : compositionBand(item.office.band, item.environment.band, item.accessComponent.band);
      item.role = roleFor(item, profile);
      item.strengths = userStrengths(item, profile);
      item.tradeoffs = userTradeoffs(item, profile);
      item.unknowns = meaningfulUnknowns(item);
      item.tieKey = tieKey(item);
      item.internalOrdering = { resultBand: RESULT_ORDER[item.compositionBand] || 0, componentBands: { office: item.office.band, businessEnvironment: item.environment.band, access: item.accessComponent.band }, rawAccessBand: item.access.overall, accessConfidenceTreatment: item.accessComponent.treatment, productionTieBreak: item.productionRank };
      item.evidenceIds = [...new Set([...(access.evidenceIds || [])])];
      return item;
    });
    const considered = collapsePresentationGroups(rawConsidered, compositionFoundation, profile);
    const eligible = considered.filter((item) => item.compositionBand !== "INELIGIBLE").sort(compareItems);
    const shortlist = options.deferShortlist ? [] : eligible.slice(0, Math.min(3, eligible.length));
    const dimensions = comparisonDimensions(profile);
    const comparison = { dimensions, rows: dimensions.map((dimension) => ({ ...dimension, values: Object.fromEntries(shortlist.map((item) => [item.districtId, dimensionValue(item, dimension.id)])) })) };
    const candidateContext = [];
    profile.candidateDistricts.ids.forEach((districtId, index) => {
      const group = presentationGroupForDistrict(districtId, compositionFoundation);
      const presentationDistrictId = group?.canonicalDistrictId || districtId;
      let context = candidateContext.find((entry) => entry.districtId === presentationDistrictId);
      const item = considered.find((candidate) => candidate.districtId === presentationDistrictId);
      if (!context) {
        context = {
          districtId: presentationDistrictId,
          districtName: group?.displayName || profile.candidateDistricts.names[index] || item?.districtName || districtId,
          presentationGroupId: group?.presentationGroupId || null,
          sourceIdentityIds: [],
          sourceIdentityNames: [],
          sourceRouteIdentity: profile.candidateDistricts.sourceRouteIdentity && group?.memberDistrictIds.includes(profile.candidateDistricts.sourceRouteIdentity.districtId) ? { ...profile.candidateDistricts.sourceRouteIdentity } : profile.candidateDistricts.sourceRouteIdentity?.districtId === districtId ? { ...profile.candidateDistricts.sourceRouteIdentity } : null,
          inShortlist: shortlist.some((candidate) => candidate.districtId === presentationDistrictId),
          compositionBand: item?.compositionBand || "NOT_EVALUATED",
          role: item?.role || "This area is not currently supported by the private SF Office composition foundation.",
          tradeoff: item?.tradeoffs?.[0] || item?.unknowns?.[0] || "Rofo has not established a supported comparative tradeoff.",
        };
        candidateContext.push(context);
      }
      if (!context.sourceIdentityIds.includes(districtId)) context.sourceIdentityIds.push(districtId);
      const sourceName = profile.candidateDistricts.names[index] || districtId;
      if (!context.sourceIdentityNames.includes(sourceName)) context.sourceIdentityNames.push(sourceName);
    });
    return {
      version: VERSION, supported: true,
      philosophy: "There usually isn't one perfect location. These are the areas that best fit the priorities you gave us, with different strengths and tradeoffs.",
      shortlistDeferred: Boolean(options.deferShortlist),
      shadow, requirementAccessProfile: profile, businessIdentity, rawConsidered, considered, shortlist, comparison, candidateContext,
      tieGroups: Object.values(Object.groupBy ? Object.groupBy(eligible, (item) => item.tieKey) : eligible.reduce((groups, item) => ((groups[item.tieKey] ||= []).push(item), groups), {})).filter((group) => group.length > 1).map((group) => group.map((item) => item.districtId)),
      presentationPolicy: "Approved overlapping identities render once. The canonical knowledge owner's component results are used; member scores are never selected, averaged, or added. Any otherwise-eligible member may activate the presentation group without creating new eligibility.",
      orderingPolicy: "Composition band → count of STRONG components → count of GOOD-or-better components → unchanged production order as stable tie-break. Candidate preferences never participate.",
    };
  }

  return { VERSION, BAND_ORDER, BUSINESS_IDENTITIES, businessIdentityProfile, approvedPresentationGroups, presentationGroupForDistrict, collapsePresentationGroups, composeLocationRecommendations };
});
