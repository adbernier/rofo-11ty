const commercialGeography = require("../../_data/commercialGeography");
const knowledgeGraph = require("../../_data/locationKnowledgeGraph");
const commercialMarketEvidence = require("../../_data/commercialMarketEvidence");
const districtPresentation = require("../../data/generated/location-brief-district-presentation.json");
const recommendationQaStatus = require("../../_data/recommendationQaStatus");
const foundationRegistry = require("../../_data/marketReadinessFoundations");
const currentPriority = require("../../_data/marketReadinessCurrentPriority");
const sfPublicDecisionSurfaces = require("../../_data/sfPublicDecisionSurfaces");
const sfRepresentativeContent = require("../../_data/sfRepresentativeContent");
const sfPublicSampleBriefs = require("../../_data/sfPublicSampleBriefs");

const STATUS = Object.freeze({
  NOT_STARTED: "Not Started",
  BUILDING: "Building",
  READY: "Ready",
  BLOCKED: "Blocked",
});

const WORKLOADS = Object.freeze([
  { id: "market_graph", label: "Market Graph", scope: "market" },
  { id: "district_intelligence", label: "District Intelligence", scope: "market" },
  { id: "regional_access", label: "Regional Access", scope: "market" },
  { id: "public_experience", label: "Public Experience", scope: "market" },
  { id: "space_type_fit", label: "Space-Type Fit", scope: "market_property_type" },
  { id: "calibration", label: "Calibration", scope: "market_property_type" },
  { id: "certification_release", label: "Certification + Release", scope: "market_property_type" },
]);

const PROPERTY_TYPES = Object.freeze([
  { id: "office", label: "Office", fitKeys: ["office"] },
  { id: "retail", label: "Retail", fitKeys: ["retail"] },
  { id: "industrial", label: "Industrial", fitKeys: ["industrial", "industrial_flex", "warehouse", "distribution", "manufacturing", "flex"] },
]);

function marketNodes(market) {
  return knowledgeGraph.filter((node) => node && node.type === "district" && (
    node.marketId === market.marketId ||
    node.operationalMarketId === market.marketId ||
    (market.cities || []).includes(node.city)
  ));
}

function foundationFor(marketId, propertyType) {
  return foundationRegistry.foundations.find((item) => item.marketId === marketId && item.propertyType === propertyType) || null;
}

function meaningfulCoverage(foundation) {
  return (foundation?.coverage?.decisionGeographies || []).filter((item) =>
    /^CORE_|^SITUATIONAL_/.test(item.classification || "")
  );
}

function allCoverageIs(foundation, dimensions, expected = "REVIEWED") {
  const records = meaningfulCoverage(foundation);
  return Boolean(records.length) && records.every((record) => dimensions.every((dimension) => record.coverage?.[dimension] === expected));
}

function fitStatus(nodes, propertyType, foundation) {
  const fitDimension = propertyType === "retail" ? "retailFit" : propertyType === "industrial" ? "industrialFit" : "officeFit";
  if (foundation && !foundation.coverage?.blockingGaps?.length && allCoverageIs(foundation, [fitDimension])) return STATUS.READY;
  const keys = PROPERTY_TYPES.find((item) => item.id === propertyType)?.fitKeys || [propertyType];
  return nodes.some((node) => keys.some((key) => node.spaceTypeFit?.[key])) ? STATUS.BUILDING : STATUS.NOT_STARTED;
}

function compactEvidence(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function publicExperience(market, nodes, foundations) {
  const sfPublicSurfaceIds = market.marketId === "san-francisco"
    ? new Set([
        ...sfPublicDecisionSurfaces.surfaces.map((item) => item.id),
        ...nodes.filter((node) => node.path).map((node) => node.slug),
      ])
    : null;
  const sfRepresentativeIds = market.marketId === "san-francisco"
    ? Object.keys(sfRepresentativeContent.byDistrictId)
    : [];
  const publicDistricts = sfPublicSurfaceIds
    ? sfRepresentativeIds.length
    : nodes.filter((node) => node.path).length;
  const presentationIds = sfPublicSurfaceIds
    ? sfRepresentativeIds
    : nodes.map((node) => node.slug);
  const presentations = presentationIds.map((districtId) => districtPresentation.districts?.[districtId]).filter(Boolean);
  const imageDistricts = presentations.filter((item) => item.image).length;
  const buildingDistricts = presentations.filter((item) => item.representativeBuildings?.length).length;
  const coverageRecords = foundations.flatMap(meaningfulCoverage);
  const incompletePresentation = coverageRecords.some((item) =>
    item.coverage?.presentation !== "REVIEWED" || item.coverage?.representativeBuildings !== "REVIEWED"
  );
  const status = !publicDistricts && !market.publicRoute
    ? STATUS.NOT_STARTED
    : incompletePresentation || !coverageRecords.length
      ? STATUS.BUILDING
      : STATUS.READY;
  const gaps = [];
  if (publicDistricts < nodes.length) gaps.push(`${nodes.length - publicDistricts} graph districts lack public routes`);
  if (presentations.length && imageDistricts < presentations.length) gaps.push(`${presentations.length - imageDistricts} projected districts lack imagery`);
  if (presentations.length && buildingDistricts < presentations.length) gaps.push(`${presentations.length - buildingDistricts} projected districts lack representative buildings`);
  if (!presentations.length && publicDistricts) gaps.push("District presentation projection is not established");
  return {
    status,
    evidence: compactEvidence([market.publicRoute ? "_data/commercialGeography.js" : "", publicDistricts ? "_data/locationKnowledgeGraph.js" : "", sfPublicSurfaceIds ? "_data/sfPublicDecisionSurfaces.js" : "", sfRepresentativeIds.length ? "_data/sfRepresentativeContent.js" : "", market.marketId === "san-francisco" ? "_data/sfPublicSampleBriefs.js" : "", presentations.length ? "data/generated/location-brief-district-presentation.json" : ""]),
    details: { publicDistricts, projectedDistricts: presentations.length, imageDistricts, representativeBuildingDistricts: buildingDistricts, ...(market.marketId === "san-francisco" ? { certifiedSampleBriefs: sfPublicSampleBriefs.briefs.length } : {}) },
    gaps,
  };
}

function buildPropertyType(market, nodes, propertyType, marketDependenciesReady) {
  const foundation = foundationFor(market.marketId, propertyType.id);
  const fit = fitStatus(nodes, propertyType.id, foundation);
  const legacyQa = recommendationQaStatus[market.marketId] || null;
  const calibration = foundation?.calibration?.status === STATUS.READY
    ? STATUS.READY
    : fit !== STATUS.NOT_STARTED && (legacyQa || (market.marketId === "denver" && propertyType.id === "office"))
      ? STATUS.BUILDING
      : STATUS.NOT_STARTED;
  const certification = foundation?.certificationRelease?.status === STATUS.READY
    ? STATUS.READY
    : fit !== STATUS.NOT_STARTED && legacyQa
      ? STATUS.BUILDING
      : STATUS.NOT_STARTED;
  const recommendation = marketDependenciesReady && [fit, calibration, certification].every((status) => status === STATUS.READY)
    ? STATUS.READY
    : [fit, calibration, certification].some((status) => status !== STATUS.NOT_STARTED)
      ? STATUS.BUILDING
      : STATUS.NOT_STARTED;
  return {
    propertyType: propertyType.id,
    label: propertyType.label,
    recommendation,
    submodels: foundation?.submodels || null,
    workloads: {
      spaceTypeFit: {
        status: fit,
        evidence: foundation ? [foundation.coverage?.schemaVersion?.includes("retail") ? "_data/sfRetailMarketCoverage.js" : foundation.coverage?.schemaVersion?.includes("industrial") || foundation.coverage?.schemaVersion?.includes("flex") ? "_data/sfIndustrialFlexMarketCoverage.js" : "_data/sfOfficeMarketCoverage.js"] : nodes.some((node) => propertyType.fitKeys.some((key) => node.spaceTypeFit?.[key])) ? ["_data/locationKnowledgeGraph.js"] : [],
        gaps: fit === STATUS.READY ? [] : ["Current hard-gate decision-universe certification is incomplete"],
      },
      calibration: {
        status: calibration,
        evidence: foundation?.calibration?.evidence || (legacyQa ? [legacyQa.reportPath] : []),
        gaps: calibration === STATUS.READY ? [] : [legacyQa ? "Legacy Compass QA is evidence, but not current vNext calibration certification" : "No current calibrated Requirement-to-resolver contract is registered"],
      },
      certificationRelease: {
        status: certification,
        evidence: foundation?.certificationRelease?.evidence || (legacyQa ? [legacyQa.reportPath] : []),
        lastQa: foundation?.certificationRelease?.lastQa || legacyQa?.lastQaDate || "",
        productionStatus: foundation?.certificationRelease?.productionStatus || "Not enabled",
        gaps: certification === STATUS.READY ? [] : [legacyQa ? "Current hard gates and controlled vNext release are not certified" : "No certification and release contract is registered"],
      },
    },
  };
}

function buildMarket(market) {
  const nodes = marketNodes(market);
  const foundations = foundationRegistry.foundations.filter((item) => item.marketId === market.marketId);
  const audited = foundations.find((item) => !item.coverage?.blockingGaps?.length);
  const graphReady = Boolean(audited && meaningfulCoverage(audited).length && new Set(meaningfulCoverage(audited).map((item) => item.knowledgeOwnerDistrictId)).size === meaningfulCoverage(audited).length);
  const intelligenceReady = Boolean(audited && meaningfulCoverage(audited).every((item) => item.coverage?.businessEnvironment === "REVIEWED"));
  const accessReady = Boolean(audited && allCoverageIs(audited, ["access", "transit", "parking"]));
  const graphStatus = graphReady ? STATUS.READY : nodes.length ? STATUS.BUILDING : STATUS.NOT_STARTED;
  const intelligenceStatus = intelligenceReady ? STATUS.READY : nodes.some((node) => node.strengths?.length || node.tradeoffs?.length || node.bestFor?.length) ? STATUS.BUILDING : STATUS.NOT_STARTED;
  const accessStatus = accessReady ? STATUS.READY : nodes.some((node) => {
    const attributes = node.attributes || {};
    return [attributes.transit, attributes.freewayAccess, attributes.parking].some((value) => value && value !== "unknown");
  }) ? STATUS.BUILDING : STATUS.NOT_STARTED;
  const experience = publicExperience(market, nodes, foundations);
  const marketDependenciesReady = [graphStatus, intelligenceStatus, accessStatus].every((status) => status === STATUS.READY);
  const propertyTypes = PROPERTY_TYPES.map((propertyType) => buildPropertyType(market, nodes, propertyType, marketDependenciesReady));
  return {
    marketId: market.marketId,
    marketName: market.marketName,
    regionId: market.regionId,
    registryStatus: market.status,
    currentPriority: currentPriority.selection?.marketId === market.marketId ? currentPriority.selection : null,
    workloads: {
      marketGraph: { status: graphStatus, evidence: compactEvidence(["_data/commercialGeography.js", nodes.length ? "_data/locationKnowledgeGraph.js" : "", audited ? "_data/sfOfficeMarketCoverage.js" : ""]), details: { canonicalDistricts: nodes.length }, gaps: graphStatus === STATUS.READY ? [] : [nodes.length ? "Canonical decision-universe and identity audit is not certified" : "No canonical district graph is assigned"] },
      districtIntelligence: { status: intelligenceStatus, evidence: compactEvidence([nodes.length ? "_data/locationKnowledgeGraph.js" : "", commercialMarketEvidence.collections?.some((collection) => collection.district?.marketId === market.marketId) ? "_data/commercialMarketEvidence.js" : "", audited ? "_data/sfOfficeMarketCoverage.js" : ""]), gaps: intelligenceStatus === STATUS.READY ? [] : [nodes.length ? "Market-wide reviewed intelligence coverage is not certified" : "No district intelligence foundation is present"] },
      regionalAccess: { status: accessStatus, evidence: accessReady ? ["_data/sfAccessFoundationV0.js", "_data/sfOfficeMarketCoverage.js"] : nodes.length ? ["_data/locationKnowledgeGraph.js"] : [], gaps: accessStatus === STATUS.READY ? [] : [nodes.length ? "Regional origin/gateway/district coverage is not certified" : "No regional Access foundation is present"] },
      publicExperience: experience,
    },
    propertyTypes,
  };
}

function buildMarketReadiness() {
  const markets = commercialGeography.markets.map(buildMarket);
  return {
    schemaVersion: "mission-control-market-readiness:v1",
    statusModel: Object.values(STATUS),
    workloads: WORKLOADS,
    propertyTypes: PROPERTY_TYPES.map(({ id, label }) => ({ id, label })),
    currentPriority,
    markets,
    note: "Read-only repository projection. Legacy Compass QA is supporting evidence and never promotes a market/property type to Ready by itself.",
  };
}

module.exports = { STATUS, WORKLOADS, PROPERTY_TYPES, buildMarketReadiness };
