(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./requirement-to-sf-office-recommendation"), require("../recommendations/normalize-sf-office-profile"), require("../recommendations/sf-office-recommendation-resolver"));
  else root.RofoRequirementLocationPreview = factory(root.RofoRequirementRecommendationAdapter, root.RofoSfOfficeProfileNormalizer, root.RofoSfOfficeRecommendationResolver);
})(typeof self !== "undefined" ? self : this, function (adapter, normalizer, resolver) {
  "use strict";

  const PREVIEW_VERSION = "requirement-location-intelligence-preview:v1";

  function clauseFor(signal, candidate) {
    const value = Array.isArray(signal.sourceValue) ? signal.sourceValue.join(" and ") : signal.sourceValue;
    const reason = (candidate.reasons || []).find((item) => signal.resolverSignalIds.includes(item.signalId));
    if (!reason) return null;
    if (signal.recommendationSignal === "commuteOrientation") return { text: `employees commute from ${value}`, reason };
    if (signal.recommendationSignal === "transitImportance") return { text: String(value).toLowerCase(), reason };
    if (signal.recommendationSignal === "parkingImportance") return { text: String(value).toLowerCase(), reason };
    if (signal.recommendationSignal === "clientVisitFrequency") return { text: String(value).toLowerCase(), reason };
    return null;
  }

  function explanationFor(candidate, projection, position) {
    const clauses = projection.consumedSignals.map((signal) => clauseFor(signal, candidate)).filter(Boolean);
    if (!clauses.length) return {
      text: `${candidate.districtName} remains in the current model's ${position === 0 ? "starting position" : "shortlist"}, but none of the projected Requirement signals created a district-specific explanation.`,
      signals: [],
    };
    const text = clauses.map((item) => item.text);
    const joined = text.length > 1 ? `${text.slice(0, -1).join(", ")}, and ${text[text.length - 1]}` : text[0];
    return { text: `${candidate.districtName} ${position === 0 ? "is the strongest starting point" : "is a strong fit"} because ${joined}.`, signals: [...new Set(clauses.map((item) => item.reason.signalId))] };
  }

  function allCandidates(result) {
    const items = [...(result.orderedCandidates || []), ...(result.currentCandidates || []), ...(result.shortlist || []), ...(result.secondaryAlternatives || [])];
    return [...new Map(items.map((item) => [item.districtId, item])).values()];
  }

  function createLocationIntelligencePreview(requirement, model) {
    const projection = adapter.projectRequirementToSfOfficeRecommendation(requirement);
    if (!projection.supported) return { previewVersion: PREVIEW_VERSION, supported: false, projection, message: "Your Location Requirement is ready. Rofo does not yet have a recommendation model connected for this market in the private prototype." };
    const normalized = normalizer.normalizeSfOfficeProfile(projection.resolverInput);
    if (!normalized.supported) return { previewVersion: PREVIEW_VERSION, supported: false, projection, normalized, message: "The Requirement could not be routed safely to the San Francisco Office model." };
    const result = resolver.resolveSfOfficeRecommendation(normalized.resolverProfile, model);
    if (!result.applicable) return { previewVersion: PREVIEW_VERSION, supported: false, projection, normalized, result, message: result.reason || "The current model is not applicable." };
    const ranked = (result.orderedCandidates && result.orderedCandidates.length ? result.orderedCandidates : result.currentCandidates || []).slice(0, 3);
    const recommendations = ranked.map((candidate, index) => ({ ...candidate, rank: index + 1, explanation: explanationFor(candidate, projection, index) }));
    const all = allCandidates(result);
    const candidateComparisons = projection.comparisonContext.candidateDistrictIds.map((districtId, index) => {
      const found = all.find((item) => item.districtId === districtId);
      const rank = (result.orderedCandidates || []).findIndex((item) => item.districtId === districtId) + 1;
      const shortlistRank = recommendations.findIndex((item) => item.districtId === districtId) + 1;
      return { districtId, districtName: projection.comparisonContext.candidateDistrictNames[index] || found && found.districtName || districtId, inTopThree: shortlistRank > 0, rank: rank || null, explanation: shortlistRank ? `Appears #${shortlistRank} in the current top three.` : rank ? `Ranks #${rank} in the current ordered result, outside the top three.` : "Does not appear in the current ordered shortlist." };
    });
    const used = new Set(result.profileSignalsUsed || []);
    const coverage = projection.consumedSignals.map((item) => ({ ...item, usedInRanking: item.resolverSignalIds.some((id) => used.has(id)) }));
    return { previewVersion: PREVIEW_VERSION, supported: true, projection, normalized, result, recommendations, candidateComparisons, coverage };
  }

  return { PREVIEW_VERSION, createLocationIntelligencePreview };
});
