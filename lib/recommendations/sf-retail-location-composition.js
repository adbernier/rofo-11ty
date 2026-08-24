(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("../requirements/requirement-to-sf-retail-recommendation"), require("../access/requirement-access-profile"), require("../access/access-fit-evaluator"));
  else root.RofoSfRetailLocationComposition = factory(root.RofoRequirementSfRetailAdapter, root.RofoRequirementAccessProfile, root.RofoAccessFitEvaluator);
})(typeof self !== "undefined" ? self : this, function (adapter, accessAdapter, accessEvaluator) {
  "use strict";
  const VERSION = "sf-retail-location-composition:v1";
  const ORDER = { UNKNOWN: -1, WEAK: 0, MODERATE: 1, LIMITED: 1, GOOD: 2, STRONG: 3 };
  const IDENTITY_TRAITS = Object.freeze({
    premium_luxury: ["PREMIUM", "VISITOR", "SHOPPING_ADJACENCY"], boutique_brand: ["PREMIUM", "VISIBILITY", "SHOPPING_ADJACENCY"],
    food_beverage: ["FOOD", "DAYTIME", "EVENING_WEEKEND"], fitness_wellness: ["WELLNESS", "NEIGHBORHOOD", "RESIDENTIAL"],
    showroom_design: ["SHOWROOM", "DESIGN", "DESTINATION"], neighborhood_service: ["SERVICE", "NEIGHBORHOOD", "RESIDENTIAL"],
    convenience: ["SERVICE", "NEIGHBORHOOD", "RESIDENTIAL", "VISIBILITY"], destination_experiential: ["DESTINATION", "EXPERIENTIAL", "VISITOR"],
  });
  function label(value) { return String(value || "UNKNOWN").toLowerCase().replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase()); }
  function groupFor(id, foundation) { return (foundation.presentationGroups || []).find((group) => group.reviewStatus === "APPROVED" && group.memberDistrictIds.includes(id)); }
  function desiredTraits(input) {
    const traits = [...(IDENTITY_TRAITS[input.businessIdentity] || [])];
    const destination = String(input.destinationVisibility || "").toLowerCase();
    if (/visibility|noticed|street/.test(destination)) traits.push("VISIBILITY");
    if (/destination|planned/.test(destination)) traits.push("DESTINATION");
    if (/mix/.test(destination)) traits.push("VISIBILITY", "DESTINATION");
    if ((input.activities || []).includes("display_present")) traits.push("SHOWROOM", "DESIGN");
    if ((input.activities || []).includes("prepare_produce_food")) traits.push("FOOD");
    if ((input.activities || []).some((id) => ["receive", "ship_distribute", "store"].includes(id))) traits.push("PARKING");
    return [...new Set(traits)];
  }
  function accessBand(result) { return result?.confidence === "UNKNOWN" ? "UNKNOWN" : result?.overall || "UNKNOWN"; }
  function compose(requirement, accessFoundation, retailFoundation, options = {}) {
    const projection = adapter.projectRequirementToSfRetailRecommendation(requirement);
    if (!projection.supported) return { version: VERSION, supported: false, message: projection.unsupportedReason, projection, considered: [], shortlist: [] };
    const accessProfile = accessAdapter.createRequirementAccessProfile(requirement, accessFoundation);
    const access = accessEvaluator.evaluateAccessFit(accessProfile, accessFoundation);
    const wanted = desiredTraits(projection.resolverInput);
    const requested = new Set(projection.comparisonContext.candidateDistrictIds);
    const raw = retailFoundation.districts.map((district) => {
      const sourceAccessResult = access.districtResults.find((item) => item.districtId === (district.accessProfileId || district.districtId)) || null;
      const accessResult = sourceAccessResult ? { ...sourceAccessResult, districtId: district.districtId, districtName: district.districtName, knowledgeOwnerDistrictId: district.accessProfileId || district.districtId, knowledgeTreatment: district.accessKnowledgeTreatment || "DIRECT_DISTRICT_PROFILE", limitations: [...new Set([...(sourceAccessResult.limitations || []), ...(district.accessLimitations || [])])] } : null;
      const matches = wanted.filter((trait) => district.traits.includes(trait));
      const retailBand = district.fit;
      const environmentBand = wanted.length ? (matches.length >= Math.min(2, wanted.length) ? "STRONG" : matches.length ? "GOOD" : "MODERATE") : "GOOD";
      const aBand = accessBand(accessResult);
      const eligible = ![retailFoundation.classification.NOT_RETAIL, retailFoundation.classification.PARENT].includes(district.classification) && ["GOOD", "STRONG"].includes(retailBand);
      const strengths = [...district.strengths];
      if (matches.length) strengths.unshift(`Its reviewed retail environment supports ${matches.slice(0, 3).map(label).join(", ").toLowerCase()}.`);
      if (ORDER[aBand] >= ORDER.GOOD) strengths.push("Reviewed customer access supports the geography you described.");
      const tradeoffs = [...district.tradeoffs];
      const unknowns = accessResult?.unknowns || [];
      return {
        districtId: district.districtId, districtName: district.districtName, canonicalDistrictId: district.districtId, memberDistrictIds: [district.districtId],
        retail: { band: retailBand, summary: district.summary, tradeoffs: district.tradeoffs, evidenceSources: district.evidenceSources },
        propertyTypeFit: { band: retailBand, summary: district.summary, tradeoffs: district.tradeoffs, evidenceSources: district.evidenceSources },
        environment: { band: environmentBand, reasons: matches.length ? [`Reviewed fit for ${matches.map(label).join(", ").toLowerCase()}.`] : [district.customerDemand.toLowerCase().replaceAll("_", " ")], tradeoffs: [], evidenceSources: district.evidenceSources },
        access: accessResult || { confidence: "UNKNOWN", overall: "UNKNOWN", employeeCohortResults: [], clientCohortResults: [], modeResults: [], unknowns: [] },
        accessComponent: { band: aBand, confidence: accessResult?.confidence || "UNKNOWN", treatment: accessResult ? "AS_EVALUATED" : "UNKNOWN_EVIDENCE" },
        parkingEnvironment: accessFoundation.districtProfiles.find((item) => item.districtId === (district.accessProfileId || district.districtId))?.parkingEnvironment || "UNKNOWN",
        classification: district.classification, geographyRole: district.geographyRole, parentDistrictId: district.parentDistrictId || "", compositionBand: eligible ? (retailBand === "STRONG" && environmentBand === "STRONG" ? "STRONG_FIT" : "GOOD_FIT") : "INELIGIBLE",
        role: matches.length ? `A useful contrast for ${matches[0].toLowerCase().replaceAll("_", " ")}.` : district.summary,
        strengths: [...new Set(strengths)].slice(0, 4), tradeoffs: [...new Set(tradeoffs)].slice(0, 2), unknowns: [...new Set(unknowns)].slice(0, 2),
        candidatePreference: requested.has(district.districtId), matchedTraits: matches, evidenceIds: district.evidenceSources,
        internalOrdering: { componentBands: { retail: retailBand, businessEnvironment: environmentBand, access: aBand }, matchedReviewedTraitCount: matches.length, candidateExcluded: true },
      };
    });
    const groupedIds = new Set();
    const considered = [];
    raw.forEach((item) => {
      if (item.geographyRole === "PARENT_PRESENTATION") return;
      const group = groupFor(item.districtId, retailFoundation);
      if (!group) return considered.push(item);
      if (groupedIds.has(group.presentationGroupId)) return;
      groupedIds.add(group.presentationGroupId);
      const owner = raw.find((entry) => entry.districtId === group.canonicalDistrictId);
      if (!owner) return;
      considered.push({ ...owner, districtName: group.displayName, memberDistrictIds: group.memberDistrictIds.slice(), presentationGroupId: group.presentationGroupId, candidatePreference: group.memberDistrictIds.some((id) => requested.has(id)) });
    });
    const eligible = considered.filter((item) => item.compositionBand !== "INELIGIBLE").sort((a, b) =>
      (ORDER[b.retail.band] - ORDER[a.retail.band]) || (ORDER[b.environment.band] - ORDER[a.environment.band]) || ((b.internalOrdering.matchedReviewedTraitCount || 0) - (a.internalOrdering.matchedReviewedTraitCount || 0)) || (ORDER[b.accessComponent.band] - ORDER[a.accessComponent.band]) || a.districtId.localeCompare(b.districtId)
    );
    const shortlist = options.deferShortlist ? [] : eligible.slice(0, 3);
    const dimensions = [{ id: "retail", label: "Retail fit" }, { id: "environment", label: "Customer environment" }];
    if (accessProfile.cohorts.length) dimensions.push({ id: "access", label: "Customer access" });
    return {
      version: VERSION, supported: true, projection, requirementAccessProfile: accessProfile, access, considered, shortlist,
      candidateContext: projection.comparisonContext.candidateDistrictIds.map((id, index) => { const group = groupFor(id, retailFoundation); const districtId = group?.canonicalDistrictId || id; const item = considered.find((entry) => entry.districtId === districtId); return { districtId, districtName: group?.displayName || projection.comparisonContext.candidateDistrictNames[index] || item?.districtName || id, sourceIdentityIds: [id], inShortlist: shortlist.some((entry) => entry.districtId === districtId), compositionBand: item?.compositionBand || "NOT_EVALUATED", role: item?.role || "This area is not supported by the reviewed SF Retail foundation.", tradeoff: item?.tradeoffs?.[0] || item?.unknowns?.[0] || "Retail fit has not been established." }; }),
      comparison: { dimensions, rows: dimensions.map((dimension) => ({ ...dimension, values: Object.fromEntries(shortlist.map((item) => [item.districtId, dimension.id === "retail" ? label(item.retail.band) : dimension.id === "environment" ? label(item.environment.band) : label(item.accessComponent.band)])) })) },
      competitionFamilies: (retailFoundation.competitionFamilies || []).map((family) => ({ ...family })),
      orderingPolicy: "Retail Fit → supported Requirement-environment band → count of matched reviewed traits → reviewed Access → canonical district ID. Parent presentation identities, aliases, compatibility identities, and candidate identity never participate.",
    };
  }
  return { VERSION, IDENTITY_TRAITS, composeLocationRecommendations: compose };
});
