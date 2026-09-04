(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("../requirements/requirement-to-sacramento-industrial-flex-recommendation"));
  else root.RofoSacramentoIndustrialFlexLocationComposition = factory(root.RofoRequirementSacramentoIndustrialFlexAdapter);
})(typeof self !== "undefined" ? self : this, function (adapter) {
  "use strict";
  const VERSION = "sacramento-industrial-flex-location-composition:v1";
  const FIT = Object.freeze({ industrial: Object.freeze({ "power-inn-industrial": "STRONG", "northgate-north-market-industrial": "STRONG" }), flex: Object.freeze({ "power-inn-industrial": "GOOD", "northgate-north-market-industrial": "STRONG" }) });
  const FIT_ORDER = Object.freeze({ STRONG: 2, GOOD: 1 });
  const LABELS = Object.freeze({ CONVENTIONAL_INDUSTRIAL: "conventional Industrial", WAREHOUSE_DISTRIBUTION: "warehouse/distribution", MANUFACTURING_PRODUCTION_CONTEXT: "manufacturing/production", CONTRACTOR_SERVICE: "contractor/service", BROADER_OPERATIONAL_USE: "broader operational use", OFFICE_WAREHOUSE: "office/warehouse", INDUSTRIAL_LED_FLEX: "Industrial-led Flex", PRODUCTION_FLEX: "production Flex", WAREHOUSE_LIGHT_INDUSTRIAL: "lighter warehouse", SERVICE_INDUSTRIAL: "service-industrial", DISTRIBUTION_CONTEXT: "distribution", MULTI_TENANT_OPERATING_FORMATS: "multi-tenant operating formats", LIGHTER_FLEX: "lighter Flex", MULTI_TENANT_FLEX: "multi-tenant Flex", LIGHTER_OPERATIONS: "lighter operations" });
  function desired(input, model) {
    const activities = input.activities || [], text = input.text || "", traits = [], add = (...items) => traits.push(...items);
    const lighter = /under 2,500|2,500|small(?:er)?[- ]format|compact|lighter/.test(text);
    const broader = /broader|larger|large[- ]format|10,000|25,000|50,000|conventional industrial|heavier/.test(text);
    const production = activities.includes("make_assemble") || /manufactur|assembly|production/.test(text);
    const office = activities.some((id) => ["work", "meet_collaborate"].includes(id));
    const operational = activities.some((id) => ["store", "receive", "ship_distribute", "make_assemble", "repair_service", "dispatch", "operate_vehicles"].includes(id));
    if (activities.some((id) => ["store", "receive", "ship_distribute"].includes(id))) add("WAREHOUSE_DISTRIBUTION", "DISTRIBUTION_CONTEXT");
    if (production) add("MANUFACTURING_PRODUCTION_CONTEXT", model === "flex" ? "PRODUCTION_FLEX" : "BROADER_OPERATIONAL_USE");
    if (activities.some((id) => ["dispatch", "repair_service", "operate_vehicles"].includes(id))) add("SERVICE_INDUSTRIAL", "CONTRACTOR_SERVICE");
    if (office && operational) add("OFFICE_WAREHOUSE");
    if (model === "industrial" && broader) add("CONVENTIONAL_INDUSTRIAL", "BROADER_OPERATIONAL_USE");
    if (model === "industrial" && lighter) add("WAREHOUSE_LIGHT_INDUSTRIAL", "MULTI_TENANT_OPERATING_FORMATS");
    if (model === "flex" && lighter) add("LIGHTER_FLEX", "LIGHTER_OPERATIONS", "MULTI_TENANT_FLEX");
    if (model === "flex" && operational) add("INDUSTRIAL_LED_FLEX");
    if (/multi.?tenant/.test(text)) add(model === "flex" ? "MULTI_TENANT_FLEX" : "MULTI_TENANT_OPERATING_FORMATS");
    return [...new Set(traits)];
  }
  function decisive(input, model) {
    const activities = input.activities || [], text = input.text || "";
    if (model === "industrial" && (activities.includes("make_assemble") || /manufactur|production|broader industrial|broader operating|heavier operating/.test(text))) return ["MANUFACTURING_PRODUCTION_CONTEXT", "BROADER_OPERATIONAL_USE"];
    if (model === "industrial" && /lighter warehouse|multi.?tenant operating|smaller-format warehouse/.test(text)) return ["WAREHOUSE_LIGHT_INDUSTRIAL", "MULTI_TENANT_OPERATING_FORMATS"];
    if (model === "flex" && /lighter flex|multi.?tenant flex|smaller-format flex/.test(text)) return ["LIGHTER_FLEX", "MULTI_TENANT_FLEX"];
    if (activities.includes("dispatch") && /lighter|multi.?tenant|service.?industrial/.test(text)) return ["SERVICE_INDUSTRIAL", "MULTI_TENANT_OPERATING_FORMATS"];
    return [];
  }
  const labels = (matches) => matches.slice(0, 4).map((trait) => LABELS[trait] || trait.toLowerCase().replaceAll("_", " "));
  const sourceIds = (candidate) => candidate.provenance.map((item) => item.id);
  function composeForModel(requirement, foundation, model, options = {}) {
    const projection = adapter.projectRequirementToSacramentoIndustrialFlexRecommendation(requirement);
    if (!projection.supported || projection.abstention) return { version: VERSION, supported: projection.supported, projection, resolvedModel: projection.resolverInput.mode, considered: [], shortlist: [], candidateContext: [] };
    const wanted = desired(projection.resolverInput, model), decisiveTraits = decisive(projection.resolverInput, model), requested = new Set(projection.comparisonContext.candidateDistrictIds);
    const considered = foundation.evidenceCandidateIds.map((districtId) => {
      const candidate = foundation.candidates[districtId], record = foundation.evidence[model][districtId], matches = wanted.filter((trait) => record.traits.includes(trait));
      const eligible = matches.length > 0 && (!decisiveTraits.length || decisiveTraits.some((trait) => record.traits.includes(trait)));
      const applicability = model === "industrial" ? "Industrial-led" : "Flex-led", matchedLabels = labels(matches);
      return { districtId, districtName: candidate.label, canonicalDistrictId: districtId, memberDistrictIds: candidate.componentGeographyIds, municipality: candidate.municipality, path: candidate.path || "", model, applicability,
        propertyTypeFit: { band: FIT[model][districtId], summary: `${applicability} applicability: ${record.strengths[0]}`, evidenceSources: sourceIds(candidate) },
        environment: { band: matches.length >= 2 ? "STRONG" : matches.length ? "GOOD" : "UNKNOWN", matchedTraits: matches, reasons: matchedLabels.length ? [`This Requirement matches the reviewed ${matchedLabels.join(", ")} character of this operating environment.`] : [], evidenceSources: sourceIds(candidate) },
        compositionBand: eligible ? (matches.length >= 2 ? "STRONG_FIT" : "GOOD_FIT") : "INELIGIBLE", role: record.strengths[0], strengths: [...(matchedLabels.length ? [`This Requirement aligns with reviewed ${matchedLabels.join(", ")} evidence.`] : []), ...record.strengths], tradeoffs: record.tradeoffs,
        unknowns: [foundation.propertyVerification, foundation.accessIntelligence.limitation], representatives: candidate.representatives, evidenceIds: sourceIds(candidate), candidatePreference: requested.has(districtId), internalOrdering: { matchedReviewedTraitCount: matches.length, reviewedFitBand: FIT[model][districtId], candidateExcluded: true } };
    });
    const eligible = considered.filter((item) => item.compositionBand !== "INELIGIBLE").sort((a, b) => FIT_ORDER[b.internalOrdering.reviewedFitBand] - FIT_ORDER[a.internalOrdering.reviewedFitBand] || b.internalOrdering.matchedReviewedTraitCount - a.internalOrdering.matchedReviewedTraitCount || a.districtId.localeCompare(b.districtId));
    const shortlist = options.deferShortlist ? [] : eligible.slice(0, 2);
    return { version: VERSION, supported: true, projection, resolvedModel: model, considered, shortlist,
      candidateContext: projection.comparisonContext.candidateDistrictIds.map((districtId) => { const item = considered.find((entry) => entry.districtId === districtId); return { districtId, districtName: item?.districtName || districtId, sourceIdentityIds: projection.comparisonContext.sourceCandidateDistrictIds.filter((sourceId) => adapter.CANDIDATE_OWNERS[sourceId] === districtId), treatment: "COMPARISON_CONTEXT_ONLY", inShortlist: shortlist.some((entry) => entry.districtId === districtId), compositionBand: item?.compositionBand || "NOT_EVALUATED" }; }),
      orderingPolicy: "Reviewed applicability/fit, then matched reviewed traits, then canonical geography ID. Entry identity and access descriptions never participate." };
  }
  function compose(requirement, foundation, options = {}) {
    const projection = adapter.projectRequirementToSacramentoIndustrialFlexRecommendation(requirement);
    if (!projection.supported || projection.abstention) return { version: VERSION, supported: projection.supported, projection, resolvedModel: projection.resolverInput.mode, considered: [], shortlist: [], candidateContext: [] };
    if (projection.resolverInput.mode !== "mixed") return composeForModel(requirement, foundation, projection.resolverInput.mode, options);
    const industrial = composeForModel(requirement, foundation, "industrial", { deferShortlist: true }), flex = composeForModel(requirement, foundation, "flex", { deferShortlist: true }), flexById = new Map(flex.considered.map((item) => [item.districtId, item]));
    const common = industrial.considered.filter((item) => item.compositionBand !== "INELIGIBLE" && flexById.get(item.districtId)?.compositionBand !== "INELIGIBLE").map((item) => { const flexItem = flexById.get(item.districtId), combined = [...new Set([...item.environment.matchedTraits, ...flexItem.environment.matchedTraits])]; return { ...item, model: "mixed", applicability: "Mixed Industrial/Flex", propertyTypeFit: { ...item.propertyTypeFit, summary: `Mixed Industrial/Flex applicability: ${foundation.evidence.mixed[item.districtId].evidenceBoundary}` }, environment: { ...item.environment, matchedTraits: combined, band: combined.length >= 2 ? "STRONG" : "GOOD" }, role: "Supports independently reviewed Industrial and Flex aspects of this Requirement.", strengths: [...new Set([...item.strengths, ...flexItem.strengths])], internalOrdering: { ...item.internalOrdering, matchedReviewedTraitCount: combined.length, combinedReviewedFit: FIT_ORDER[item.internalOrdering.reviewedFitBand] + FIT_ORDER[flexItem.internalOrdering.reviewedFitBand] } }; }).sort((a, b) => b.internalOrdering.combinedReviewedFit - a.internalOrdering.combinedReviewedFit || b.internalOrdering.matchedReviewedTraitCount - a.internalOrdering.matchedReviewedTraitCount || a.districtId.localeCompare(b.districtId));
    return { ...industrial, resolvedModel: "mixed", considered: common, shortlist: options.deferShortlist ? [] : common.slice(0, 2), modelResults: { industrial, flex }, orderingPolicy: "Mixed intent includes only candidates independently supported by Industrial and Flex evidence; unknowns are not averaged." };
  }
  return { VERSION, desiredTraits: desired, decisiveTraits: decisive, resolveMembership: adapter.resolveSacramentoIndustrialFlexMembership, composeLocationRecommendations: compose, composeForModel };
});
