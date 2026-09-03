(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("../requirements/requirement-to-phoenix-industrial-flex-recommendation"));
  else root.RofoPhoenixIndustrialFlexLocationComposition = factory(root.RofoRequirementPhoenixIndustrialFlexAdapter);
})(typeof self !== "undefined" ? self : this, function (adapter) {
  "use strict";
  const VERSION = "phoenix-industrial-flex-location-composition:v1";
  const FIT = Object.freeze({
    industrial: Object.freeze({ "southwest-phoenix-industrial": "STRONG", "airport-south-central-industrial": "GOOD", "north-phoenix-advanced-operations": "GOOD" }),
    flex: Object.freeze({ "southwest-phoenix-industrial": "GOOD", "airport-south-central-industrial": "STRONG", "north-phoenix-advanced-operations": "STRONG" }),
  });
  const FIT_ORDER = Object.freeze({ STRONG: 2, GOOD: 1 });
  const LABELS = Object.freeze({
    CONVENTIONAL_INDUSTRIAL: "conventional Industrial", WAREHOUSE_STORAGE: "warehouse/storage", DISTRIBUTION: "distribution", CONTRACTOR_SERVICE: "contractor/service", BROADER_OPERATIONAL_USE: "broader operational use", OFFICE_WAREHOUSE: "office/warehouse", INDUSTRIAL_LED_FLEX: "Industrial-led Flex",
    CENTRAL_INFILL_INDUSTRIAL: "central infill Industrial", LIGHTER_WAREHOUSE: "lighter warehouse", SERVICE_DISTRIBUTION: "service distribution", LIGHT_PRODUCTION: "light production", OFFICE_PRODUCTION: "office-production", LIGHTER_FLEX: "lighter Flex", SERVICE_DISTRIBUTION_HYBRID: "service/distribution hybrid",
    ADVANCED_MANUFACTURING_CONTEXT: "advanced-manufacturing context", TECHNICAL_OPERATIONS: "technical operations", AEROSPACE_SUPPORT_CONTEXT: "aerospace-support context", PRODUCTION_ECOSYSTEM: "production ecosystem", TECHNICAL_WORKSPACE: "technical workspace", R_AND_D_PRODUCTION_HYBRID: "R&D/production hybrid", ENGINEERING_OPERATIONS: "engineering operations",
  });

  function desired(input, model) {
    const activities = input.activities || [];
    const text = input.text || "";
    const traits = [];
    const add = (...values) => traits.push(...values);
    const lighter = /under 2,500|2,500|small(?:er)?[- ]format|compact|lighter/.test(text);
    const broader = /broader|larger|large[- ]format|10,000|25,000|50,000|conventional industrial/.test(text);
    const technical = /technical|engineering|r&d|research|prototype|advanced[- ]manufacturing (?:context|ecosystem)|aerospace[- ]support/.test(text) || activities.some((id) => ["product_development", "prototype", "research"].includes(id));
    const office = activities.some((id) => ["work", "meet_collaborate"].includes(id));
    const operational = activities.some((id) => ["store", "receive", "ship_distribute", "make_assemble", "repair_service", "dispatch"].includes(id));
    if (activities.includes("store")) add(lighter ? "LIGHTER_WAREHOUSE" : "WAREHOUSE_STORAGE");
    if (activities.some((id) => ["receive", "ship_distribute"].includes(id))) add(/service distribution|local distribution/.test(text) ? "SERVICE_DISTRIBUTION" : "DISTRIBUTION");
    if (activities.some((id) => ["dispatch", "operate_vehicles", "repair_service"].includes(id))) add("CONTRACTOR_SERVICE");
    if (/central|infill/.test(text)) add("CENTRAL_INFILL_INDUSTRIAL");
    if (activities.includes("make_assemble")) add(technical ? "ADVANCED_MANUFACTURING_CONTEXT" : "LIGHT_PRODUCTION");
    if (office && operational) {
      add(model === "industrial" ? "OFFICE_WAREHOUSE" : "OFFICE_PRODUCTION");
      if (model === "flex" && activities.includes("store")) add("OFFICE_WAREHOUSE");
    }
    if (model === "industrial" && (broader || (!lighter && /warehouse|distribution|logistics/.test(text)))) add("CONVENTIONAL_INDUSTRIAL", "BROADER_OPERATIONAL_USE");
    if (model === "flex" && lighter) add("LIGHTER_FLEX");
    if (model === "flex" && activities.some((id) => ["dispatch", "repair_service", "store"].includes(id))) add("INDUSTRIAL_LED_FLEX");
    if (/service.{0,20}distribution|distribution.{0,20}service/.test(text)) add("SERVICE_DISTRIBUTION_HYBRID");
    if (technical) add(model === "industrial" ? "TECHNICAL_OPERATIONS" : "TECHNICAL_WORKSPACE", "ENGINEERING_OPERATIONS");
    if (technical && model === "flex" && operational) add("R_AND_D_PRODUCTION_HYBRID");
    if (/aerospace[- ]support/.test(text)) add("AEROSPACE_SUPPORT_CONTEXT");
    if (/production ecosystem/.test(text)) add("PRODUCTION_ECOSYSTEM");
    return [...new Set(traits)];
  }
  function labelTraits(matches) { return matches.slice(0, 4).map((trait) => LABELS[trait] || trait.toLowerCase().replaceAll("_", " ")); }
  function decisiveTraits(input, model) {
    const activities = input.activities || [];
    const text = input.text || "";
    if (/technical|engineering|r&d|research|prototype|advanced[- ]manufacturing (?:context|ecosystem)|aerospace[- ]support/.test(text)) return model === "industrial" ? ["TECHNICAL_OPERATIONS", "ADVANCED_MANUFACTURING_CONTEXT", "AEROSPACE_SUPPORT_CONTEXT"] : ["TECHNICAL_WORKSPACE", "ENGINEERING_OPERATIONS", "R_AND_D_PRODUCTION_HYBRID"];
    if (model === "industrial" && (activities.includes("ship_distribute") || /distribution|logistics|broader|larger/.test(text))) return ["DISTRIBUTION", "CONVENTIONAL_INDUSTRIAL"];
    if (model === "flex" && /office.?production|lighter flex/.test(text)) return ["OFFICE_PRODUCTION", "LIGHTER_FLEX"];
    return [];
  }
  function sourceIds(candidate) { return candidate.provenance.map((item) => item.id); }
  function composeForModel(requirement, foundation, model, options = {}) {
    const projection = adapter.projectRequirementToPhoenixIndustrialFlexRecommendation(requirement);
    if (!projection.supported || projection.abstention) return { version: VERSION, supported: projection.supported, projection, resolvedModel: projection.resolverInput.mode, considered: [], shortlist: [], candidateContext: [] };
    const wanted = desired(projection.resolverInput, model);
    const decisive = decisiveTraits(projection.resolverInput, model);
    const northPhoenixActivated = wanted.some((trait) => ["ADVANCED_MANUFACTURING_CONTEXT", "TECHNICAL_OPERATIONS", "AEROSPACE_SUPPORT_CONTEXT", "PRODUCTION_ECOSYSTEM", "TECHNICAL_WORKSPACE", "R_AND_D_PRODUCTION_HYBRID", "ENGINEERING_OPERATIONS"].includes(trait));
    const requested = new Set(projection.comparisonContext.candidateDistrictIds);
    const considered = foundation.evidenceCandidateIds.map((districtId) => {
      const candidate = foundation.candidates[districtId];
      const record = foundation.evidence[model][districtId];
      const matches = wanted.filter((trait) => record.traits.includes(trait));
      const eligible = matches.length > 0
        && (!decisive.length || decisive.some((trait) => record.traits.includes(trait)))
        && (districtId !== "north-phoenix-advanced-operations" || northPhoenixActivated);
      const applicability = model === "industrial" ? "Industrial-led" : "Flex-led";
      const labels = labelTraits(matches);
      return {
        districtId, districtName: candidate.label, canonicalDistrictId: districtId, memberDistrictIds: candidate.componentGeographyIds,
        municipality: candidate.municipality, path: candidate.path || candidate.publicContextPaths?.[0] || "", model, applicability,
        propertyTypeFit: { band: FIT[model][districtId], summary: `${applicability} applicability: ${record.strengths[0]}`, evidenceSources: sourceIds(candidate) },
        environment: { band: matches.length >= 2 ? "STRONG" : matches.length ? "GOOD" : "UNKNOWN", matchedTraits: matches, reasons: labels.length ? [`This Requirement matches the reviewed ${labels.join(", ")} character of this operating environment.`] : [], evidenceSources: sourceIds(candidate) },
        compositionBand: eligible ? (matches.length >= 2 ? "STRONG_FIT" : "GOOD_FIT") : "INELIGIBLE",
        role: record.strengths[0], strengths: [...(labels.length ? [`This Requirement aligns with reviewed ${labels.join(", ")} evidence.`] : []), ...record.strengths], tradeoffs: record.tradeoffs,
        unknowns: [foundation.propertyVerification, foundation.accessIntelligence.limitation], representatives: candidate.representatives, evidenceIds: sourceIds(candidate), candidatePreference: requested.has(districtId),
        internalOrdering: { matchedReviewedTraitCount: matches.length, reviewedFitBand: FIT[model][districtId], candidateExcluded: true },
      };
    });
    const eligible = considered.filter((item) => item.compositionBand !== "INELIGIBLE").sort((a, b) => b.internalOrdering.matchedReviewedTraitCount - a.internalOrdering.matchedReviewedTraitCount || FIT_ORDER[b.internalOrdering.reviewedFitBand] - FIT_ORDER[a.internalOrdering.reviewedFitBand] || a.districtId.localeCompare(b.districtId));
    const shortlist = options.deferShortlist ? [] : eligible.slice(0, 3);
    return { version: VERSION, supported: true, projection, resolvedModel: model, considered, shortlist,
      candidateContext: projection.comparisonContext.candidateDistrictIds.map((districtId) => { const item = considered.find((entry) => entry.districtId === districtId); return { districtId, districtName: item?.districtName || districtId, sourceIdentityIds: projection.comparisonContext.sourceCandidateDistrictIds.filter((sourceId) => adapter.CANDIDATE_OWNERS[sourceId] === districtId), treatment: "COMPARISON_CONTEXT_ONLY", inShortlist: shortlist.some((entry) => entry.districtId === districtId), compositionBand: item?.compositionBand || "NOT_EVALUATED" }; }),
      orderingPolicy: "Matched reviewed traits, then reviewed fit band, then canonical geography ID. Candidate identity and access descriptions never participate." };
  }
  function compose(requirement, foundation, options = {}) {
    const projection = adapter.projectRequirementToPhoenixIndustrialFlexRecommendation(requirement);
    if (!projection.supported || projection.abstention) return { version: VERSION, supported: projection.supported, projection, resolvedModel: projection.resolverInput.mode, considered: [], shortlist: [], candidateContext: [] };
    if (projection.resolverInput.mode !== "mixed") return composeForModel(requirement, foundation, projection.resolverInput.mode, options);
    const industrial = composeForModel(requirement, foundation, "industrial", { deferShortlist: true });
    const flex = composeForModel(requirement, foundation, "flex", { deferShortlist: true });
    const flexById = new Map(flex.considered.map((item) => [item.districtId, item]));
    const common = industrial.considered.filter((item) => item.compositionBand !== "INELIGIBLE" && flexById.get(item.districtId)?.compositionBand !== "INELIGIBLE").map((item) => {
      const flexItem = flexById.get(item.districtId); const combinedMatches = [...new Set([...item.environment.matchedTraits, ...flexItem.environment.matchedTraits])];
      return { ...item, model: "mixed", applicability: "Mixed Industrial/Flex", propertyTypeFit: { ...item.propertyTypeFit, summary: `Mixed Industrial/Flex applicability: ${foundation.evidence.mixed[item.districtId].evidenceBoundary}` }, environment: { ...item.environment, matchedTraits: combinedMatches, band: combinedMatches.length >= 2 ? "STRONG" : "GOOD" }, role: "Supports independently reviewed Industrial and Flex aspects of this Requirement.", strengths: [...new Set([...item.strengths, ...flexItem.strengths])], internalOrdering: { ...item.internalOrdering, matchedReviewedTraitCount: combinedMatches.length } };
    }).sort((a, b) => b.internalOrdering.matchedReviewedTraitCount - a.internalOrdering.matchedReviewedTraitCount || FIT_ORDER[b.internalOrdering.reviewedFitBand] - FIT_ORDER[a.internalOrdering.reviewedFitBand] || a.districtId.localeCompare(b.districtId));
    return { ...industrial, resolvedModel: "mixed", considered: common, shortlist: options.deferShortlist ? [] : common.slice(0, 3), modelResults: { industrial, flex }, orderingPolicy: "Mixed intent includes only candidates independently supported by Industrial and Flex evidence; unknowns are not averaged." };
  }
  return { VERSION, desiredTraits: desired, decisiveTraits, resolveMembership: adapter.resolvePhoenixIndustrialFlexMembership, composeLocationRecommendations: compose, composeForModel };
});
