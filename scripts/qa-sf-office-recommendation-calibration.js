const { normalizeSfOfficeProfile } = require("../lib/recommendations/normalize-sf-office-profile");
const { resolveSfOfficeRecommendation } = require("../lib/recommendations/sf-office-recommendation-resolver");

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`SF Office Recommendation Calibration QA error: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function ids(items) {
  return (items || []).map((item) => item.districtId);
}

function resolveSource(sourceAnswers) {
  const normalized = normalizeSfOfficeProfile(sourceAnswers);
  const result = resolveSfOfficeRecommendation(normalized.resolverProfile);
  return { sourceAnswers, normalized, result };
}

function score(result, districtId) {
  const item = (result.currentCandidates || []).find((candidate) => candidate.districtId === districtId) ||
    (result.secondaryAlternatives || []).find((candidate) => candidate.districtId === districtId);
  return item ? item.score : null;
}

function hasReason(result, districtId, signalId) {
  return (result.explanations || []).some((reason) => reason.districtId === districtId && reason.signalId === signalId);
}

function reasonCount(result, districtId, signalId) {
  const candidate = [...(result.currentCandidates || []), ...(result.secondaryAlternatives || [])]
    .find((item) => item.districtId === districtId);
  return candidate ? (candidate.reasons || []).filter((reason) => reason.signalId === signalId).length : 0;
}

function sameOrder(a, b) {
  return ids(a).join("|") === ids(b).join("|");
}

const defect = resolveSource({
  city: "San Francisco",
  spaceType: "Office",
  businessType: "design_creative",
  operationalUse: ["team_collaboration", "client_meetings"],
  officeEnvironment: "Historic and Distinctive",
  expectedGrowth: "low",
});

assert(defect.normalized.supported === true, "defect case should normalize to the SF Office model.");
assert(defect.normalized.resolverProfile.officeEnvironment === "historic_distinctive", "defect case should preserve historic/distinctive environment.");
assert(defect.normalized.resolverProfile.businessType === "design_creative", "defect case should preserve design/creative business type.");
assert(defect.normalized.resolverProfile.operationalUse.includes("team_collaboration"), "defect case should preserve team collaboration use.");
assert(defect.normalized.resolverProfile.operationalUse.includes("client_meetings"), "defect case should preserve client-facing use.");
assert(ids(defect.result.shortlist).includes("jackson-square"), "defect case should include Jackson Square in the top recommendation set.");
assert(score(defect.result, "jackson-square") >= score(defect.result, "soma"), "defect case should allow Jackson Square to lead or tie SoMa.");
assert(score(defect.result, "jackson-square") > score(defect.result, "mission-bay"), "defect case should keep Jackson Square ahead of Mission Bay.");
assert(!ids(defect.result.shortlist).includes("mission-bay"), "defect case should not keep Mission Bay in the shortlist without a stronger modern/growth/commute signal.");
assert(hasReason(defect.result, "jackson-square", "officeEnvironment"), "defect case should explain Jackson Square with environment fit.");
assert(hasReason(defect.result, "jackson-square", "businessType"), "defect case should explain Jackson Square with design/creative fit.");
assert(hasReason(defect.result, "jackson-square", "client_access"), "defect case should explain Jackson Square with client-facing fit.");
assert(hasReason(defect.result, "jackson-square", "environmentUseFit"), "defect case should explain Jackson Square with the calibrated cross-signal fit.");

const duplicated = resolveSource({
  city: "San Francisco",
  spaceType: "Office",
  businessType: "technology",
  recruitingImportance: "high",
  operationalUse: ["team_collaboration", "recruiting"],
  officeEnvironment: "Modern and polished",
  expectedGrowth: "significant",
});

assert((duplicated.result.signalAudit.duplicateSemanticContributions || []).length === 2, "duplicate recruiting aliases should be reported as deduplicated.");
assert(reasonCount(duplicated.result, "soma", "recruiting") === 1, "SoMa should receive recruiting credit only once.");
assert(reasonCount(duplicated.result, "mission-bay", "recruiting") === 1, "Mission Bay should receive recruiting credit only once.");
assert(ids(duplicated.result.shortlist).includes("mission-bay"), "technology/growth/modern case should keep Mission Bay strong.");
assert(ids(duplicated.result.shortlist).includes("soma"), "technology/growth/modern case should keep SoMa strong.");
assert(score(duplicated.result, "mission-bay") > score(duplicated.result, "jackson-square"), "technology/growth/modern case should not overpromote Jackson Square.");

const professionalTraditional = resolveSource({
  city: "San Francisco",
  spaceType: "Office",
  businessType: "professional_services",
  clientVisitFrequency: "often",
  officeEnvironment: "Traditional and professional",
});
assert(ids(professionalTraditional.result.shortlist).includes("financial-district"), "professional/traditional case should keep Financial District strong.");
assert(ids(professionalTraditional.result.shortlist).includes("jackson-square"), "professional/traditional case should keep Jackson Square strong.");

const creativeInformal = resolveSource({
  city: "San Francisco",
  spaceType: "Office",
  businessType: "design_creative",
  officeEnvironment: "Creative and informal",
  operationalUse: ["team_collaboration"],
});
assert(
  ["soma", "showplace-square", "design-district", "mission-district", "dogpatch", "jackson-square"].some((districtId) => ids(creativeInformal.result.currentCandidates).includes(districtId)),
  "creative/informal case should expose creative or signal-specific districts."
);

const historicWithoutClient = resolveSource({
  city: "San Francisco",
  spaceType: "Office",
  businessType: "technology",
  officeEnvironment: "Historic and Distinctive",
  expectedGrowth: "low",
});
assert(hasReason(historicWithoutClient.result, "jackson-square", "officeEnvironment"), "historic-only case should give Jackson Square environment credit.");
assert(!hasReason(historicWithoutClient.result, "jackson-square", "environmentUseFit"), "historic-only case should not trigger the client-facing design calibration.");

const clientWithoutHistoric = resolveSource({
  city: "San Francisco",
  spaceType: "Office",
  businessType: "professional_services",
  clientVisitFrequency: "often",
  officeEnvironment: "Modern and polished",
});
assert(score(clientWithoutHistoric.result, "financial-district") >= score(clientWithoutHistoric.result, "jackson-square"), "client-facing without historic preference should allow Financial District to remain stronger.");

const peninsulaModernGrowth = resolveSource({
  city: "San Francisco",
  spaceType: "Office",
  businessType: "technology",
  commuteOrientation: "Peninsula South Bay",
  officeEnvironment: "Modern and polished",
  expectedGrowth: "significant",
  recruitingImportance: "high",
});
assert(ids(peninsulaModernGrowth.result.shortlist).includes("mission-bay"), "Peninsula + modern + growth case should keep Mission Bay highly competitive.");
assert(score(peninsulaModernGrowth.result, "mission-bay") > score(peninsulaModernGrowth.result, "jackson-square"), "Peninsula + modern + growth should keep Mission Bay ahead of Jackson Square.");

const marinDistinctive = resolveSource({
  city: "San Francisco",
  spaceType: "Office",
  commuteOrientation: "Marin",
  officeEnvironment: "Lower-rise and neighborhood-oriented",
  clientVisitFrequency: "often",
  expectedGrowth: "low",
});
assert(ids(marinDistinctive.result.shortlist).includes("jackson-square"), "Marin + lower-rise/client-facing case should keep Jackson Square represented.");
assert(score(marinDistinctive.result, "jackson-square") > score(marinDistinctive.result, "mission-bay"), "Marin + lower-rise/client-facing should keep Jackson Square ahead of Mission Bay.");

const environmentProfiles = [
  resolveSource({ city: "San Francisco", spaceType: "Office", businessType: "technology", officeEnvironment: "Modern and polished", expectedGrowth: "significant" }).result,
  resolveSource({ city: "San Francisco", spaceType: "Office", businessType: "technology", officeEnvironment: "Historic and Distinctive", expectedGrowth: "low" }).result,
  resolveSource({ city: "San Francisco", spaceType: "Office", businessType: "technology", officeEnvironment: "Creative and informal", expectedGrowth: "low" }).result,
  resolveSource({ city: "San Francisco", spaceType: "Office", businessType: "professional_services", officeEnvironment: "Traditional and professional", clientVisitFrequency: "often" }).result,
  resolveSource({ city: "San Francisco", spaceType: "Office", officeEnvironment: "Lower-rise and neighborhood-oriented", commuteOrientation: "Marin" }).result,
];
const uniqueShortlists = new Set(environmentProfiles.map((result) => ids(result.shortlist).join("|")));
assert(uniqueShortlists.size >= 4, "office-environment preferences should materially change shortlist behavior across launch categories.");

const withoutEconomics = resolveSource({
  city: "San Francisco",
  spaceType: "Office",
  businessType: "technology",
  officeEnvironment: "Modern and polished",
  expectedGrowth: "significant",
});
const withEconomics = resolveSource({
  city: "San Francisco",
  spaceType: "Office",
  businessType: "technology",
  officeEnvironment: "Modern and polished",
  expectedGrowth: "significant",
  costSensitivity: "We do not want to overspend and rent matters.",
});
assert(sameOrder(withoutEconomics.result.currentCandidates, withEconomics.result.currentCandidates), "economic language should not change candidate ordering.");
assert(sameOrder(withoutEconomics.result.shortlist, withEconomics.result.shortlist), "economic language should not change shortlist membership.");
assert(withEconomics.result.ignoredSignals.length >= 1, "economic language should remain preserved as ignored context.");
assert(withEconomics.result.economicsPolicy.budgetRankingAllowed === false, "budget ranking must remain disabled.");

console.log("Production defect case trace:");
console.log(JSON.stringify({
  rawSourceAnswers: defect.sourceAnswers,
  normalizedProfile: defect.normalized.resolverProfile,
  state: defect.result.state,
  confidence: defect.result.confidence,
  shortlist: defect.result.shortlist.map((candidate) => ({
    districtId: candidate.districtId,
    score: candidate.score,
    movement: candidate.movement,
    reasons: candidate.reasons.map((reason) => ({
      signalId: reason.signalId,
      signalLabel: reason.signalLabel,
      points: reason.points,
      action: reason.action,
    })),
  })),
  currentCandidates: defect.result.currentCandidates.map((candidate) => ({
    districtId: candidate.districtId,
    score: candidate.score,
    movement: candidate.movement,
  })),
  secondaryAlternatives: defect.result.secondaryAlternatives.map((candidate) => ({
    districtId: candidate.districtId,
    score: candidate.score,
    movement: candidate.movement,
  })),
  signalAudit: defect.result.signalAudit,
  unresolvedTradeoffs: defect.result.unresolvedTradeoffs,
}, null, 2));

console.log(`Duplicate contribution audit: ${(duplicated.result.signalAudit.duplicateSemanticContributions || []).map((item) => `${item.signalId}->${item.familyId}`).join(", ")}`);

if (failures) {
  process.exitCode = 1;
} else {
  console.log("SF Office Recommendation Calibration QA passed.");
}
