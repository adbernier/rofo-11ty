(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("../requirements/requirement-to-sf-industrial-flex-recommendation"), require("../access/requirement-access-profile"), require("../access/access-fit-evaluator"));
  else root.RofoSfIndustrialFlexLocationComposition = factory(root.RofoRequirementSfIndustrialFlexAdapter, root.RofoRequirementAccessProfile, root.RofoAccessFitEvaluator);
})(typeof self !== "undefined" ? self : this, function (adapter, accessAdapter, accessEvaluator) {
  "use strict";
  const VERSION = "sf-industrial-flex-location-composition:v1";
  const ORDER = { UNKNOWN: -1, WEAK: 0, LIMITED: 1, MODERATE: 1, GOOD: 2, STRONG: 3 };
  const TRAITS = Object.freeze({
    warehouse: ["WAREHOUSE", "LOADING", "VEHICLE_ACCESS"], distribution: ["DISTRIBUTION", "LAST_MILE", "LOADING"], logistics: ["DISTRIBUTION", "LAST_MILE", "VEHICLE_ACCESS"], contractor: ["CONTRACTOR", "FLEET", "SERVICE", "VEHICLE_ACCESS"], fleet: ["FLEET", "VEHICLE_ACCESS"], food_production: ["FOOD_PRODUCTION", "PRODUCTION", "LOADING"], manufacturing: ["LIGHT_MANUFACTURING", "PRODUCTION", "FABRICATION"], maker: ["MAKER", "PROTOTYPING", "CREATIVE_PRODUCTION"], showroom: ["SHOWROOM", "DESIGN_TRADE", "CUSTOMER_FACING"], office_production: ["OFFICE_PRODUCTION", "CREATIVE_PRODUCTION"], technical: ["PROTOTYPING", "R_AND_D_SUPPORT", "TECHNICAL"], adaptive: ["ADAPTIVE_REUSE", "EMPLOYEE_ENVIRONMENT"],
  });
  function label(value) { return String(value || "UNKNOWN").toLowerCase().replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase()); }
  function desired(input, model) {
    const activities = input.activities || []; const wanted = [];
    const add = (id) => wanted.push(...(TRAITS[id] || []));
    if (activities.some((id) => ["ship_distribute", "receive", "store"].includes(id))) add(model === "industrial" ? "distribution" : "office_production");
    if (activities.some((id) => ["dispatch", "operate_vehicles", "outdoor_operations", "repair_service"].includes(id))) add("contractor");
    if (activities.includes("make_assemble")) add(model === "industrial" ? "manufacturing" : "maker");
    if (activities.includes("display_present") || activities.includes("host_visitors")) add("showroom");
    if (activities.some((id) => ["product_development", "prototype", "research"].includes(id))) add("technical");
    if (!wanted.length) add(model === "industrial" ? "warehouse" : "adaptive");
    return [...new Set(wanted)];
  }
  function groupFor(id, foundation) { return (foundation.presentationGroups || []).find((group) => group.reviewStatus === "APPROVED" && group.memberDistrictIds.includes(id)); }
  function composeForModel(requirement, accessFoundation, foundation, model, options = {}) {
    const projection = adapter.projectRequirementToSfIndustrialFlexRecommendation(requirement);
    if (!projection.supported) return { version: VERSION, supported: false, projection, considered: [], shortlist: [] };
    const modelFoundation = foundation[model];
    if (!modelFoundation) return { version: VERSION, supported: false, projection, considered: [], shortlist: [] };
    const accessProfile = accessAdapter.createRequirementAccessProfile(requirement, accessFoundation);
    const access = accessEvaluator.evaluateAccessFit(accessProfile, accessFoundation);
    const wanted = desired(projection.resolverInput, model); const requested = new Set(projection.comparisonContext.candidateDistrictIds);
    const raw = modelFoundation.districts.map((district) => {
      const sourceAccess = access.districtResults.find((item) => item.districtId === district.accessProfileId) || null;
      const matches = wanted.filter((trait) => district.traits.includes(trait));
      const environmentBand = matches.length >= Math.min(2, wanted.length) ? "STRONG" : matches.length ? "GOOD" : "MODERATE";
      const accessBand = sourceAccess?.confidence === "UNKNOWN" ? "UNKNOWN" : sourceAccess?.overall || "UNKNOWN";
      const eligible = !/^GENERALLY_NOT/.test(district.classification) && ["GOOD", "STRONG"].includes(district.fit);
      const strengths = [...district.strengths];
      if (matches.length) strengths.unshift(`Reviewed ${model} evidence supports ${matches.slice(0, 3).map(label).join(", ").toLowerCase()}.`);
      return { districtId: district.districtId, districtName: district.districtName, canonicalDistrictId: district.districtId, memberDistrictIds: [district.districtId], model,
        industrialFlex: { band: district.fit, model, summary: district.summary, tradeoffs: district.tradeoffs, evidenceSources: district.evidenceSources },
        propertyTypeFit: { band: district.fit, summary: district.summary, tradeoffs: district.tradeoffs, evidenceSources: district.evidenceSources },
        environment: { band: environmentBand, reasons: matches.length ? [`Reviewed fit for ${matches.map(label).join(", ").toLowerCase()}.`] : [district.summary], tradeoffs: [], evidenceSources: district.evidenceSources },
        access: sourceAccess || { confidence: "UNKNOWN", overall: "UNKNOWN", employeeCohortResults: [], clientCohortResults: [], unknowns: [] }, accessComponent: { band: accessBand, confidence: sourceAccess?.confidence || "UNKNOWN" },
        classification: district.classification, compositionBand: eligible ? (district.fit === "STRONG" && environmentBand === "STRONG" ? "STRONG_FIT" : "GOOD_FIT") : "INELIGIBLE",
        role: district.summary, strengths: [...new Set(strengths)].slice(0, 4), tradeoffs: district.tradeoffs.slice(0, 2), unknowns: sourceAccess?.unknowns || [], candidatePreference: requested.has(district.districtId), matchedTraits: matches, evidenceIds: district.evidenceSources,
        internalOrdering: { fit: district.fit, environment: environmentBand, matchedReviewedTraitCount: matches.length, access: accessBand, candidateExcluded: true } };
    });
    const seen = new Set(); const considered = [];
    for (const item of raw) { const group = groupFor(item.districtId, foundation); if (!group) { considered.push(item); continue; } if (seen.has(group.presentationGroupId)) continue; seen.add(group.presentationGroupId); const owner = raw.find((entry) => entry.districtId === group.canonicalDistrictId); if (owner) considered.push({ ...owner, districtName: group.displayName, memberDistrictIds: group.memberDistrictIds.slice(), presentationGroupId: group.presentationGroupId, candidatePreference: group.memberDistrictIds.some((id) => requested.has(id)) }); }
    const eligible = considered.filter((item) => item.compositionBand !== "INELIGIBLE").sort((a, b) => (ORDER[b.propertyTypeFit.band] - ORDER[a.propertyTypeFit.band]) || (ORDER[b.environment.band] - ORDER[a.environment.band]) || (b.internalOrdering.matchedReviewedTraitCount - a.internalOrdering.matchedReviewedTraitCount) || (ORDER[b.accessComponent.band] - ORDER[a.accessComponent.band]) || a.districtId.localeCompare(b.districtId));
    const shortlist = options.deferShortlist ? [] : eligible.slice(0, 3);
    return { version: VERSION, supported: true, resolvedModel: model, projection, requirementAccessProfile: accessProfile, access, considered, shortlist,
      candidateContext: projection.comparisonContext.candidateDistrictIds.map((id, index) => { const group = groupFor(id, foundation); const districtId = group?.canonicalDistrictId || id; const item = considered.find((entry) => entry.districtId === districtId); return { districtId, districtName: group?.displayName || projection.comparisonContext.candidateDistrictNames[index] || item?.districtName || id, sourceIdentityIds: [id], inShortlist: shortlist.some((entry) => entry.districtId === districtId), compositionBand: item?.compositionBand || "NOT_EVALUATED", role: item?.role || `This area is not supported by the reviewed SF ${label(model)} foundation.`, tradeoff: item?.tradeoffs?.[0] || "Fit has not been established." }; }),
      comparison: { dimensions: [{ id: "fit", label: `${label(model)} fit` }, { id: "environment", label: "Operating environment" }], rows: [] },
      orderingPolicy: `${label(model)} Fit → supported operating-context band → matched reviewed traits → reviewed Access → canonical district ID. Candidate identity never participates.` };
  }
  function compose(requirement, accessFoundation, foundation, options = {}) {
    const projection = adapter.projectRequirementToSfIndustrialFlexRecommendation(requirement);
    if (!projection.supported || projection.resolverInput.mode === "unresolved") return { version: VERSION, supported: projection.supported, resolvedModel: "unresolved", projection, considered: [], shortlist: [], candidateContext: [] };
    if (projection.resolverInput.mode !== "mixed") return composeForModel(requirement, accessFoundation, foundation, projection.resolverInput.mode, options);
    const industrial = composeForModel(requirement, accessFoundation, foundation, "industrial", { ...options, deferShortlist: true });
    const flex = composeForModel(requirement, accessFoundation, foundation, "flex", { ...options, deferShortlist: true });
    const common = industrial.considered.filter((item) => item.compositionBand !== "INELIGIBLE" && flex.considered.some((other) => other.districtId === item.districtId && other.compositionBand !== "INELIGIBLE")).map((item) => ({ ...item, model: "mixed", role: `Supports both reviewed Industrial and Flex aspects of this hybrid Requirement.` }));
    const shortlist = options.deferShortlist ? [] : common.slice(0, 3);
    return { ...industrial, resolvedModel: "mixed", shortlist, considered: common, candidateContext: industrial.candidateContext, modelResults: { industrial, flex }, orderingPolicy: "Mixed intent uses only geographies independently eligible in both certified models; it does not average scores or unknowns." };
  }
  return { VERSION, composeLocationRecommendations: compose, composeForModel };
});
