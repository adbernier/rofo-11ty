const neighborhoodPages = require("./neighborhoodPages");
const knowledgeGraph = require("./locationKnowledgeGraph");
const accessFoundation = require("./sfAccessFoundationV0");
const compositionFoundation = require("./sfOfficeCompositionFoundation");
const presentationGroups = require("./sfOfficeRecommendationPresentationGroups");
const districtPresentation = require("../data/generated/location-brief-district-presentation.json");

const STATUS = Object.freeze({ REVIEWED: "REVIEWED", PARTIAL: "PARTIAL", MISSING: "MISSING", NOT_APPLICABLE: "NOT_APPLICABLE" });
const CLASSIFICATION = Object.freeze({ CORE: "CORE_OFFICE", SITUATIONAL: "SITUATIONAL_OFFICE", NOT_OFFICE: "GENERALLY_NOT_OFFICE", NEEDS_REVIEW: "NEEDS_REVIEW" });

const classifications = {
  "financial-district": [CLASSIFICATION.CORE, "San Francisco's reviewed traditional downtown and client-facing Office core."],
  soma: [CLASSIFICATION.CORE, "Reviewed central adaptive, technology, and creative Office district."],
  "mission-bay": [CLASSIFICATION.CORE, "Reviewed modern, innovation, and institutional-adjacent Office district."],
  "jackson-square": [CLASSIFICATION.CORE, "Reviewed boutique, lower-rise, professional and design-oriented Office district."],
  "south-beach": [CLASSIFICATION.CORE, "Reviewed central waterfront and regional-access Office alternative."],
  "showplace-square": [CLASSIFICATION.SITUATIONAL, "Reviewed creative, design, product, and adaptive Office geography; presented with Design District."],
  dogpatch: [CLASSIFICATION.SITUATIONAL, "Reviewed industrial-heritage, technology, product, and Office/R&D-adjacent district."],
  "potrero-hill": [CLASSIFICATION.SITUATIONAL, "Reviewed neighborhood-scale creative Office geography with southeast access relationships."],
  "mission-district": [CLASSIFICATION.SITUATIONAL, "Reviewed selective creative, nonprofit, and neighborhood-oriented Office geography."],
  presidio: [CLASSIFICATION.SITUATIONAL, "Reviewed campus-like Office setting with distinctive northern access and constrained inventory."],
  "union-square": [CLASSIFICATION.SITUATIONAL, "Reviewed visitor-facing, central-transit, smaller professional and service Office geography."],
  "civic-center": [CLASSIFICATION.SITUATIONAL, "Reviewed narrow civic, nonprofit, institutional, and government-adjacent Office geography."],
  "hayes-valley": [CLASSIFICATION.SITUATIONAL, "Reviewed neighborhood-scale creative, technology, nonprofit, and professional Office geography."],
  "marina-district": [CLASSIFICATION.SITUATIONAL, "Reviewed neighborhood-scale professional Office geography with a distinctive northern access orientation."],
  "bayview-industrial": [CLASSIFICATION.NOT_OFFICE, "Reviewed identity is industrial/flex rather than a normal Office alternative."],
  "central-waterfront": [CLASSIFICATION.NOT_OFFICE, "Reviewed identity is primarily industrial/flex; selective Office does not make it a normal Office decision geography."],
  richmond: [CLASSIFICATION.NOT_OFFICE, "Office uses are chiefly local-serving and do not establish a normal citywide Office alternative."],
  sunset: [CLASSIFICATION.NOT_OFFICE, "Office uses are chiefly local-serving and do not establish a normal citywide Office alternative."],
  bayview: [CLASSIFICATION.NOT_OFFICE, "Current canonical public identity is retail/local-commercial rather than Office."],
};

const sfPages = neighborhoodPages.filter((item) => item.city === "San Francisco");
const pageFor = (id) => sfPages.find((item) => item.slug === id);
const nodeFor = (id) => knowledgeGraph.find((item) => item.slug === id && String(item.path || "").includes("/san-francisco/"));
const accessFor = (id) => accessFoundation.districtProfiles.find((item) => item.districtId === id);
const compositionFor = (id) => compositionFoundation.districts.find((item) => item.districtId === id);
const presentationFor = (id) => districtPresentation.districts?.[id];

function statusFor(id, dimension) {
  const page = pageFor(id);
  const node = nodeFor(id);
  const access = accessFor(id);
  const composition = compositionFor(id);
  const presentation = presentationFor(id);
  if (dimension === "officeFit") return node?.spaceTypeFit?.office?.fit && composition ? STATUS.REVIEWED : page?.commercial_location_model ? STATUS.PARTIAL : STATUS.MISSING;
  if (dimension === "businessEnvironment") return composition?.evidenceSources?.length ? STATUS.REVIEWED : page?.commercial_location_model ? STATUS.PARTIAL : STATUS.MISSING;
  if (dimension === "access") return access?.completeness?.originAccess === "SUFFICIENT" ? STATUS.REVIEWED : access ? STATUS.PARTIAL : STATUS.MISSING;
  if (dimension === "transit") return access?.completeness?.transit === "SUFFICIENT" ? STATUS.REVIEWED : access ? STATUS.PARTIAL : STATUS.MISSING;
  if (dimension === "parking") return access?.completeness?.parking === "SUFFICIENT" ? STATUS.REVIEWED : access ? STATUS.PARTIAL : STATUS.MISSING;
  if (dimension === "presentation") return page?.canonical_neighborhood_path && page?.district_identity ? (presentation?.image ? STATUS.REVIEWED : STATUS.PARTIAL) : STATUS.MISSING;
  if (dimension === "representativeBuildings") return presentation?.representativeBuildings?.length ? STATUS.REVIEWED : page?.representative_buildings?.length ? STATUS.PARTIAL : STATUS.MISSING;
  return STATUS.MISSING;
}

const decisionGeographies = Object.entries(classifications).map(([districtId, [classification, reason]]) => {
  const page = pageFor(districtId);
  const node = nodeFor(districtId);
  const group = presentationGroups.groups.find((item) => item.memberDistrictIds.includes(districtId));
  return {
    districtId,
    districtName: group?.displayName || node?.label || page?.name || districtId,
    classification,
    reason,
    canonicalPath: page?.canonical_neighborhood_path || node?.path || "",
    presentationGroupId: group?.presentationGroupId || "",
    knowledgeOwnerDistrictId: group?.canonicalDistrictId || districtId,
    coverage: {
      officeFit: statusFor(districtId, "officeFit"),
      businessEnvironment: statusFor(districtId, "businessEnvironment"),
      access: statusFor(districtId, "access"),
      transit: statusFor(districtId, "transit"),
      parking: statusFor(districtId, "parking"),
      presentation: statusFor(districtId, "presentation"),
      representativeBuildings: statusFor(districtId, "representativeBuildings"),
    },
    provenance: [
      node ? "_data/locationKnowledgeGraph.js" : "",
      compositionFor(districtId) ? "_data/sfOfficeCompositionFoundation.js" : "",
      accessFor(districtId) ? "_data/sfAccessFoundationV0.js" : "",
      page ? "_data/neighborhoodPages.js" : "",
    ].filter(Boolean),
  };
});

module.exports = {
  schemaVersion: "sf-office-market-coverage:v1",
  marketId: "san-francisco",
  propertyType: "office",
  status: STATUS,
  classification: CLASSIFICATION,
  decisionGeographies,
  presentationGroups: presentationGroups.groups,
  compatibilityIdentities: [
    { districtId: "design-district", canonicalDistrictId: "showplace-square", preservePublicPath: true },
    { districtId: "mission", canonicalDistrictId: "mission-district", preservePublicPath: true },
    { districtId: "south-park", canonicalDistrictId: "soma", preservePublicPath: true },
  ],
  blockingGaps: decisionGeographies.filter((item) => item.classification === CLASSIFICATION.NEEDS_REVIEW).map((item) => ({
    districtId: item.districtId,
    dimensions: Object.entries(item.coverage).filter(([, value]) => [STATUS.MISSING, STATUS.PARTIAL].includes(value)).map(([key]) => key),
    reason: item.reason,
  })),
  methodology: {
    officeUniverse: "Canonical public geography is audited, but only reviewed Knowledge Graph decision identities with Office, Business Environment, and Access foundations may enter composition.",
    access: "Origin access is derived from approved origin→gateway→district relationships. No Requirement→district hand-ranking table is used.",
    launchRule: "FULL market coverage does not require every SF neighborhood; it does require reviewed treatment of every meaningful CORE_OFFICE and SITUATIONAL_OFFICE decision geography.",
  },
};
