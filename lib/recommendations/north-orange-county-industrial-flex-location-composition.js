(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("../requirements/requirement-to-north-orange-county-industrial-flex-recommendation"));
  else root.RofoNorthOrangeCountyIndustrialFlexLocationComposition = factory(root.RofoRequirementNorthOrangeCountyIndustrialFlexAdapter);
})(typeof self !== "undefined" ? self : this, function (adapter) {
  "use strict";
  const VERSION = "north-orange-county-industrial-flex-location-composition:v1";
  const FIT = Object.freeze({
    industrial: Object.freeze({ "anaheim-canyon": "STRONG", "fullerton-industrial-service-area": "GOOD" }),
    flex: Object.freeze({ "anaheim-canyon": "GOOD", "fullerton-industrial-service-area": "STRONG" }),
  });
  const FIT_ORDER = Object.freeze({ STRONG: 2, GOOD: 1 });
  const LABELS = Object.freeze({ CONVENTIONAL_INDUSTRIAL: "conventional Industrial", WAREHOUSE_DISTRIBUTION: "warehouse/distribution", LIGHT_MANUFACTURING: "light manufacturing", CONTRACTOR_SERVICE: "contractor/service", OFFICE_WAREHOUSE: "office/warehouse", SMALLER_FORMAT_WAREHOUSE: "smaller-format warehouse", SMALLER_FORMAT_FLEX: "smaller-format Flex", LIGHTER_OPERATIONS: "lighter operations", LIGHT_PRODUCTION: "light production", SHOWROOM_SERVICE_HYBRID: "showroom/service hybrid" });

  function desired(input, model) {
    const activities = input.activities || [];
    const text = input.text || "";
    const traits = [];
    const add = (...values) => traits.push(...values);
    const smaller = /under 2,500|2,500|small(?:er)?[- ]format|compact|lighter/.test(text);
    const larger = /larger|large[- ]format|10,000|25,000|50,000/.test(text);
    if (activities.some((id) => ["store", "receive", "ship_distribute"].includes(id))) add(smaller ? "SMALLER_FORMAT_WAREHOUSE" : "WAREHOUSE_DISTRIBUTION");
    if (activities.includes("make_assemble")) add(model === "industrial" ? "LIGHT_MANUFACTURING" : "LIGHT_PRODUCTION");
    if (activities.some((id) => ["dispatch", "operate_vehicles", "repair_service"].includes(id))) add("CONTRACTOR_SERVICE");
    if (model === "industrial" && smaller && activities.some((id) => ["dispatch", "repair_service", "store"].includes(id))) add("SMALLER_FORMAT_WAREHOUSE");
    if (activities.some((id) => ["work", "meet_collaborate"].includes(id)) && activities.some((id) => ["store", "receive", "make_assemble", "repair_service"].includes(id))) add("OFFICE_WAREHOUSE");
    if (activities.some((id) => ["display_present", "host_visitors"].includes(id))) add("SHOWROOM_SERVICE_HYBRID");
    if (activities.some((id) => ["product_development", "prototype", "research"].includes(id))) add("LIGHT_PRODUCTION");
    if (model === "flex" && (smaller || /lighter operating/.test(text))) add("SMALLER_FORMAT_FLEX", "LIGHTER_OPERATIONS");
    if (model === "industrial" && (larger || /conventional industrial|distribution|logistics/.test(text))) add("CONVENTIONAL_INDUSTRIAL");
    return [...new Set(traits)];
  }
  function labelTraits(matches) { return matches.slice(0, 4).map((trait) => LABELS[trait] || trait.toLowerCase().replaceAll("_", " ")); }
  function decisiveTraits(input, model) {
    const activities = input.activities || [];
    const text = input.text || "";
    if (model === "industrial" && (activities.includes("ship_distribute") || /distribution|logistics|larger|large[- ]format/.test(text))) return ["WAREHOUSE_DISTRIBUTION", "CONVENTIONAL_INDUSTRIAL"];
    if (model === "industrial" && activities.includes("make_assemble")) return ["LIGHT_MANUFACTURING"];
    if (model === "flex" && activities.some((id) => ["display_present", "host_visitors"].includes(id))) return ["SHOWROOM_SERVICE_HYBRID"];
    return [];
  }
  function sourceIds(candidate) { return candidate.provenance.map((item) => item.id); }
  function composeForModel(requirement, foundation, model, options = {}) {
    const projection = adapter.projectRequirementToNorthOrangeCountyIndustrialFlexRecommendation(requirement);
    if (!projection.supported || projection.abstention) return { version: VERSION, supported: projection.supported, projection, resolvedModel: projection.resolverInput.mode, considered: [], shortlist: [], candidateContext: [] };
    const wanted = desired(projection.resolverInput, model);
    const decisive = decisiveTraits(projection.resolverInput, model);
    const requested = new Set(projection.comparisonContext.candidateDistrictIds);
    const considered = foundation.evidenceCandidateIds.map((districtId) => {
      const candidate = foundation.candidates[districtId];
      const record = foundation.evidence[model][districtId];
      const matches = wanted.filter((trait) => record.traits.includes(trait));
      const eligible = matches.length > 0 && (!decisive.length || decisive.some((trait) => record.traits.includes(trait)));
      const applicability = model === "industrial" ? "Industrial-led" : "Flex-led";
      const labels = labelTraits(matches);
      return {
        districtId,
        districtName: candidate.label,
        canonicalDistrictId: districtId,
        memberDistrictIds: [districtId],
        municipality: candidate.municipality,
        path: candidate.path,
        model,
        applicability,
        propertyTypeFit: { band: FIT[model][districtId], summary: `${applicability} applicability: ${record.strengths[0]}`, evidenceSources: sourceIds(candidate) },
        environment: { band: matches.length >= 2 ? "STRONG" : matches.length ? "GOOD" : "UNKNOWN", matchedTraits: matches, reasons: labels.length ? [`This Requirement matches the reviewed ${labels.join(", ")} character of this operating environment.`] : [], evidenceSources: sourceIds(candidate) },
        compositionBand: eligible ? (matches.length >= 2 ? "STRONG_FIT" : "GOOD_FIT") : "INELIGIBLE",
        role: record.strengths[0],
        strengths: [...(labels.length ? [`This Requirement aligns with reviewed ${labels.join(", ")} evidence.`] : []), ...record.strengths],
        tradeoffs: record.tradeoffs,
        unknowns: [foundation.propertyVerification, foundation.accessIntelligence.limitation],
        representatives: candidate.representatives,
        evidenceIds: sourceIds(candidate),
        candidatePreference: requested.has(districtId),
        internalOrdering: { matchedReviewedTraitCount: matches.length, reviewedFitBand: FIT[model][districtId], candidateExcluded: true },
      };
    });
    const eligible = considered.filter((item) => item.compositionBand !== "INELIGIBLE").sort((a, b) => b.internalOrdering.matchedReviewedTraitCount - a.internalOrdering.matchedReviewedTraitCount || FIT_ORDER[b.internalOrdering.reviewedFitBand] - FIT_ORDER[a.internalOrdering.reviewedFitBand] || a.districtId.localeCompare(b.districtId));
    const shortlist = options.deferShortlist ? [] : eligible.slice(0, 2);
    return {
      version: VERSION, supported: true, projection, resolvedModel: model, considered, shortlist,
      candidateContext: projection.comparisonContext.candidateDistrictIds.map((districtId, index) => { const item = considered.find((entry) => entry.districtId === districtId); return { districtId, districtName: projection.comparisonContext.candidateDistrictNames[index] || item?.districtName || districtId, sourceIdentityIds: [districtId], treatment: "COMPARISON_CONTEXT_ONLY", inShortlist: shortlist.some((entry) => entry.districtId === districtId), compositionBand: item?.compositionBand || "NOT_EVALUATED" }; }),
      orderingPolicy: "Matched reviewed traits, then reviewed fit band, then canonical geography ID. Candidate identity and access descriptions never participate.",
    };
  }
  function compose(requirement, foundation, options = {}) {
    const projection = adapter.projectRequirementToNorthOrangeCountyIndustrialFlexRecommendation(requirement);
    if (!projection.supported || projection.abstention) return { version: VERSION, supported: projection.supported, projection, resolvedModel: projection.resolverInput.mode, considered: [], shortlist: [], candidateContext: [] };
    if (projection.resolverInput.mode !== "mixed") return composeForModel(requirement, foundation, projection.resolverInput.mode, options);
    const industrial = composeForModel(requirement, foundation, "industrial", { deferShortlist: true });
    const flex = composeForModel(requirement, foundation, "flex", { deferShortlist: true });
    const flexById = new Map(flex.considered.map((item) => [item.districtId, item]));
    const common = industrial.considered.filter((item) => item.compositionBand !== "INELIGIBLE" && flexById.get(item.districtId)?.compositionBand !== "INELIGIBLE").map((item) => {
      const flexItem = flexById.get(item.districtId);
      const combinedMatches = [...new Set([...item.environment.matchedTraits, ...flexItem.environment.matchedTraits])];
      return { ...item, model: "mixed", applicability: "Mixed Industrial/Flex", propertyTypeFit: { ...item.propertyTypeFit, summary: `Mixed Industrial/Flex applicability: ${item.role}` }, environment: { ...item.environment, matchedTraits: combinedMatches, band: combinedMatches.length >= 2 ? "STRONG" : "GOOD" }, role: "Supports independently reviewed Industrial and Flex aspects of this Requirement.", strengths: [...new Set([...item.strengths, ...flexItem.strengths])], internalOrdering: { ...item.internalOrdering, matchedReviewedTraitCount: combinedMatches.length } };
    }).sort((a, b) => b.internalOrdering.matchedReviewedTraitCount - a.internalOrdering.matchedReviewedTraitCount || a.districtId.localeCompare(b.districtId));
    return { ...industrial, resolvedModel: "mixed", considered: common, shortlist: options.deferShortlist ? [] : common.slice(0, 2), modelResults: { industrial, flex }, orderingPolicy: "Mixed intent includes only candidates independently supported by Industrial and Flex evidence; unknowns are not averaged." };
  }
  return { VERSION, desiredTraits: desired, decisiveTraits, composeLocationRecommendations: compose, composeForModel };
});
