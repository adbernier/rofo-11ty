(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./access-intelligence-schema"));
  else root.RofoAccessFitEvaluator = factory(root.RofoAccessIntelligenceSchema);
})(typeof self !== "undefined" ? self : this, function (schema) {
  "use strict";

  const ENGINE_VERSION = "access-fit-shadow-engine:v0";
  const ORDER = { UNKNOWN: -1, WEAK: 0, MODERATE: 1, GOOD: 2, STRONG: 3 };
  const BY_ORDER = ["WEAK", "MODERATE", "GOOD", "STRONG"];
  const activeImportance = new Set(["CORE", "MATERIAL", "CONSIDER"]);

  function bounded(rating, delta) {
    if (rating === "UNKNOWN") return rating;
    return BY_ORDER[Math.max(0, Math.min(3, ORDER[rating] + delta))];
  }
  function best(items) { return items.length ? items.slice().sort((a, b) => ORDER[b.rating] - ORDER[a.rating] || a.gatewayId.localeCompare(b.gatewayId))[0] : null; }
  function parkingAdjusted(path, profile, modePreference) {
    if (!path || path.mode !== "DRIVING" || !modePreference || !modePreference.parkingModifier) return { rating: path && path.rating || "UNKNOWN", adjustment: 0, evidenceIds: [] };
    if (profile.parkingEnvironment === "STRONG") return { rating: bounded(path.rating, 1), adjustment: 1, evidenceIds: profile.parkingEvidenceIds || [] };
    if (profile.parkingEnvironment === "WEAK") return { rating: bounded(path.rating, -1), adjustment: -1, evidenceIds: profile.parkingEvidenceIds || [] };
    return { rating: path.rating, adjustment: 0, evidenceIds: profile.parkingEvidenceIds || [] };
  }
  function cohortResult(cohort, district, foundation) {
    if (cohort.importance === "LOW" || cohort.frequency === "RARE") return { cohortId: cohort.cohortId, actorType: cohort.actorType, originRegionId: cohort.originRegionId, importance: cohort.importance, frequency: cohort.frequency, rating: "UNKNOWN", treatment: "CONTEXT_ONLY", modeResults: [], evidenceIds: [] };
    const originAccess = (district.originAccess || []).find((item) => item.originRegionId === cohort.originRegionId);
    const modeResults = [];
    (cohort.modePreferences || []).filter((item) => activeImportance.has(item.importance)).forEach((preference) => {
      const paths = (originAccess && originAccess.paths || []).filter((path) => path.reviewStatus === "APPROVED" && (path.modes || []).includes(preference.mode)).map((path) => ({ ...path, mode: preference.mode }));
      const selected = best(paths);
      if (!selected) return modeResults.push({ mode: preference.mode, importance: preference.importance, rating: "UNKNOWN", gatewayId: "", evidenceIds: [], reason: "No approved origin→gateway→district path is available." });
      const adjusted = parkingAdjusted(selected, district, preference);
      modeResults.push({ mode: preference.mode, importance: preference.importance, rating: adjusted.rating, gatewayId: selected.gatewayId, baseRating: selected.rating, parkingAdjustment: adjusted.adjustment, evidenceIds: [...new Set([...(selected.evidenceIds || []), ...adjusted.evidenceIds])], reason: adjusted.adjustment ? `Approved gateway path, with parking modifying the driving result by one bounded ordinal band.` : "Approved origin→gateway→district path." });
    });
    const selected = best(modeResults.filter((item) => item.rating !== "UNKNOWN"));
    return {
      cohortId: cohort.cohortId, actorType: cohort.actorType, originRegionId: cohort.originRegionId, importance: cohort.importance, frequency: cohort.frequency,
      rating: selected && selected.rating || "UNKNOWN", treatment: selected ? "EVALUATED" : "UNKNOWN_EVIDENCE", selectedMode: selected && selected.mode || "", selectedGatewayId: selected && selected.gatewayId || "", modeResults,
      evidenceIds: selected ? selected.evidenceIds : [],
    };
  }
  function confidenceFor(cohorts, district) {
    const active = cohorts.filter((item) => item.importance === "CORE" || item.importance === "MATERIAL");
    if (!active.length || active.every((item) => item.rating === "UNKNOWN")) return "UNKNOWN";
    const unknowns = active.filter((item) => item.rating === "UNKNOWN").length;
    if (!unknowns && district.confidence === "HIGH") return "HIGH";
    if (unknowns <= Math.floor(active.length / 2)) return "MEDIUM";
    return "LOW";
  }
  function overallFor(cohorts) {
    const core = cohorts.filter((item) => item.importance === "CORE" && item.rating !== "UNKNOWN");
    const material = cohorts.filter((item) => item.importance === "MATERIAL" && item.rating !== "UNKNOWN");
    const considered = cohorts.filter((item) => item.importance === "CONSIDER" && item.rating !== "UNKNOWN");
    const controlling = core.length ? core : material.length ? material : considered;
    return controlling.length ? controlling.slice().sort((a, b) => ORDER[a.rating] - ORDER[b.rating])[0].rating : "UNKNOWN";
  }
  function originLabel(id, foundation) { return (foundation.originRegions || []).find((item) => item.originRegionId === id)?.label || id; }
  function evaluateDistrict(requirementProfile, district, foundation) {
    const cohortResults = (requirementProfile.cohorts || []).map((cohort) => cohortResult(cohort, district, foundation));
    const overall = overallFor(cohortResults);
    const confidence = confidenceFor(cohortResults, district);
    const strengths = cohortResults.filter((item) => ORDER[item.rating] >= ORDER.GOOD).map((item) => `${item.rating} ${item.actorType.toLowerCase().replace("_", "/")} access from ${originLabel(item.originRegionId, foundation)} via ${item.selectedGatewayId}.`);
    const tradeoffs = cohortResults.filter((item) => item.rating === "WEAK").map((item) => `Weak access for the ${originLabel(item.originRegionId, foundation)} ${item.actorType.toLowerCase().replace("_", "/")} cohort.`);
    const unknowns = cohortResults.filter((item) => item.rating === "UNKNOWN" && item.importance !== "LOW").map((item) => `No approved path for ${originLabel(item.originRegionId, foundation)} ${item.actorType.toLowerCase().replace("_", "/")} access.`);
    const explanationTrace = cohortResults.filter((item) => item.rating !== "UNKNOWN").map((item) => ({
      cohortId: item.cohortId,
      requirementFact: `${item.actorType} origin: ${originLabel(item.originRegionId, foundation)} (${item.frequency.toLowerCase()}).`,
      accessRelationship: `${item.selectedGatewayId} supports ${item.selectedMode.toLowerCase().replace("_", " ")} access rated ${item.rating}.`,
      districtImplication: `${district.districtName} has ${item.rating.toLowerCase()} supported access for this cohort.`,
      evidenceIds: item.evidenceIds,
    }));
    const externalMaterial = cohortResults.some((item) => {
      const origin = (foundation.originRegions || []).find((candidate) => candidate.originRegionId === item.originRegionId);
      return item.importance === "MATERIAL" && origin && !origin.localToMarket && ORDER[item.rating] >= ORDER.GOOD;
    });
    const accessActivated = Boolean(!district.startingDistrict && district.accessActivationEligible && district.recommendationEligible && ["strong", "good", "excellent"].includes(district.propertyTypeFit) && district.reviewStatus === "APPROVED" && externalMaterial);
    const result = {
      schemaVersion: "access-fit-result:v0", engineVersion: ENGINE_VERSION, foundationVersion: foundation.version, districtId: district.districtId, districtName: district.districtName,
      overall, confidence, employeeCohortResults: cohortResults.filter((item) => item.actorType === "EMPLOYEE"), clientCohortResults: cohortResults.filter((item) => item.actorType === "CLIENT_CUSTOMER"), serviceTerritoryResults: cohortResults.filter((item) => item.actorType === "SERVICE_TERRITORY"),
      modeResults: cohortResults.flatMap((item) => item.modeResults.map((mode) => ({ cohortId: item.cohortId, ...mode }))), strengths, tradeoffs, unknowns,
      accessEligibility: { accessActivated, startingDistrict: district.startingDistrict, reason: accessActivated ? "A material external-origin cohort has GOOD or STRONG evidence-backed access; canonical identity, Office fit, review, and completeness prerequisites are satisfied." : "No generic access activation condition was satisfied." },
      explanationTrace, evidenceIds: [...new Set(explanationTrace.flatMap((item) => item.evidenceIds))], completeness: district.completeness,
    };
    result.validationErrors = schema.validateAccessFitResult(result);
    return result;
  }
  function evaluateAccessFit(requirementProfile, foundation) {
    return {
      schemaVersion: "access-fit-evaluation:v0", engineVersion: ENGINE_VERSION, foundationVersion: foundation.version,
      requirementAccessProfile: requirementProfile,
      districtResults: (foundation.districtProfiles || []).map((district) => evaluateDistrict(requirementProfile, district, foundation)),
      candidateDistricts: requirementProfile.candidateDistricts,
      foundationGaps: (foundation.foundationGaps || []).filter((gap) => (gap.relevantOriginRegionIds || []).some((id) => requirementProfile.cohorts.some((cohort) => cohort.originRegionId === id))),
    };
  }

  return { ENGINE_VERSION, ORDER, evaluateDistrict, evaluateAccessFit };
});
