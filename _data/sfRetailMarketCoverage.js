const foundation = require("./sfRetailCompositionFoundation");
const accessFoundation = require("./sfAccessFoundationV0");
const districtPresentation = require("../data/generated/location-brief-district-presentation.json");

const STATUS = Object.freeze({ REVIEWED: "REVIEWED", PARTIAL: "PARTIAL", MISSING: "MISSING", NOT_APPLICABLE: "NOT_APPLICABLE" });
function accessFor(id) { return accessFoundation.districtProfiles.find((item) => item.districtId === id); }
const decisionGeographies = foundation.districts.map((district) => {
  const access = accessFor(district.accessProfileId || district.districtId);
  const presentation = districtPresentation.districts?.[district.districtId];
  const meaningful = ![foundation.classification.NOT_RETAIL, foundation.classification.PARENT].includes(district.classification);
  return {
    districtId: district.districtId, districtName: district.districtName, classification: district.classification,
    reason: district.summary, canonicalPath: district.path, presentationGroupId: foundation.presentationGroups.find((group) => group.memberDistrictIds.includes(district.districtId))?.presentationGroupId || "",
    knowledgeOwnerDistrictId: foundation.presentationGroups.find((group) => group.memberDistrictIds.includes(district.districtId))?.canonicalDistrictId || district.districtId,
    coverage: {
      retailFit: meaningful ? STATUS.REVIEWED : district.fit === "UNKNOWN" ? STATUS.NOT_APPLICABLE : STATUS.REVIEWED,
      businessEnvironment: meaningful && district.traits.length && district.strengths.length ? STATUS.REVIEWED : meaningful ? STATUS.MISSING : STATUS.NOT_APPLICABLE,
      access: meaningful && access?.completeness?.originAccess === "SUFFICIENT" ? STATUS.REVIEWED : meaningful && access ? STATUS.PARTIAL : meaningful ? STATUS.MISSING : STATUS.NOT_APPLICABLE,
      transit: meaningful && access?.completeness?.transit === "SUFFICIENT" ? STATUS.REVIEWED : meaningful && access ? STATUS.PARTIAL : meaningful ? STATUS.MISSING : STATUS.NOT_APPLICABLE,
      parking: meaningful && access?.completeness?.parking === "SUFFICIENT" ? STATUS.REVIEWED : meaningful && access ? STATUS.PARTIAL : meaningful ? STATUS.MISSING : STATUS.NOT_APPLICABLE,
      presentation: presentation ? (presentation.image ? STATUS.REVIEWED : STATUS.PARTIAL) : STATUS.MISSING,
      representativeBuildings: presentation?.representativeBuildings?.length ? STATUS.REVIEWED : STATUS.MISSING,
    },
    provenance: district.evidenceSources,
    geographyRole: district.geographyRole,
    parentDistrictId: district.parentDistrictId || "",
    accessKnowledgeOwnerDistrictId: district.accessProfileId || district.districtId,
    accessKnowledgeTreatment: district.accessKnowledgeTreatment,
  };
});
const material = decisionGeographies.filter((item) => [foundation.classification.CORE, foundation.classification.SITUATIONAL].includes(item.classification));
const blockingDimensions = ["retailFit", "businessEnvironment", "access", "transit", "parking"];
const blockingGaps = material.flatMap((item) => {
  const missing = blockingDimensions.filter((dimension) => [STATUS.MISSING, STATUS.PARTIAL].includes(item.coverage[dimension]));
  return missing.length ? [{ districtId: item.districtId, dimensions: missing, reason: "A meaningful Retail geography lacks a hard-gate reviewed foundation dimension." }] : [];
});

module.exports = {
  schemaVersion: "sf-retail-market-coverage:v1", marketId: "san-francisco", propertyType: "retail_service", status: STATUS,
  classification: foundation.classification, decisionGeographies, presentationGroups: foundation.presentationGroups,
  competitionFamilies: foundation.competitionFamilies,
  parentPresentationIdentities: foundation.parentPresentationIdentities,
  deferredCandidates: foundation.deferredCandidates,
  universeReview: {
    status: blockingGaps.length ? "BUILDING" : "READY",
    approvedDecisionGeographyIds: material.map((item) => item.districtId),
    parentPresentationIds: foundation.parentPresentationIdentities.map((item) => item.districtId),
    deferredCandidateIds: foundation.deferredCandidates.map((item) => item.districtId),
    completenessRule: "No fixed count: every material reviewed candidate must be approved, assigned a non-competing presentation role, or explicitly deferred with a reason.",
  },
  compatibilityIdentities: [
    { districtId: "design-district", canonicalDistrictId: "showplace-square", preservePublicPath: true },
    { districtId: "mission", canonicalDistrictId: "mission-district", preservePublicPath: true },
    { districtId: "south-park", canonicalDistrictId: "soma", preservePublicPath: true },
  ],
  blockingGaps,
  methodology: {
    retailUniverse: "Only reviewed CORE_RETAIL and SITUATIONAL_RETAIL decision geographies enter ordinary composition; parent presentation identities, aliases, and compatibility identities cannot cast duplicate votes.",
    completeness: "Material candidates must be explicitly approved, assigned a non-competing presentation role, or deferred with a reason; approved decision geographies must clear every hard gate.",
    evidence: "Ordinal district facts describe customer environment, storefront context, Retail fit, and structural Access. No Requirement→district bonuses exist.",
    launchRule: "Every meaningful Retail geography requires reviewed Retail Fit, customer/business environment, and SF Regional Access; the resolver must remain deterministic, neutral to candidates, and able to abstain.",
    publicContentPrinciple: "Rofo should create indexable content because it helps users make location decisions. Search visibility is a consequence of useful, differentiated content—not the justification for thin pages.",
  },
  futureSampleBriefs: ["Boutique or consumer brand", "Premium retail", "Neighborhood service business", "Fitness or wellness studio", "Showroom or home-design retailer", "Destination specialty concept"],
};
