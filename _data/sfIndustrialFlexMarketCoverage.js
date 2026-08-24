const foundation = require("./sfIndustrialFlexCompositionFoundation");
const accessFoundation = require("./sfAccessFoundationV0");
const presentation = require("../data/generated/location-brief-district-presentation.json");
const STATUS = Object.freeze({ REVIEWED: "REVIEWED", PARTIAL: "PARTIAL", MISSING: "MISSING", NOT_APPLICABLE: "NOT_APPLICABLE" });

function coverageFor(model) {
  const fitDimension = model === "industrial" ? "industrialFit" : "flexFit";
  const decisionGeographies = foundation[model].districts.map((district) => {
    const meaningful = !/^GENERALLY_NOT/.test(district.classification);
    const access = accessFoundation.districtProfiles.find((item) => item.districtId === district.accessProfileId);
    const projected = presentation.districts?.[district.districtId];
    return { districtId: district.districtId, districtName: district.districtName, classification: district.classification, reason: district.summary,
      coverage: { [fitDimension]: meaningful ? STATUS.REVIEWED : STATUS.NOT_APPLICABLE, businessEnvironment: meaningful && district.traits.length ? STATUS.REVIEWED : STATUS.NOT_APPLICABLE, access: meaningful && access?.completeness?.originAccess === "SUFFICIENT" ? STATUS.REVIEWED : meaningful && access ? STATUS.PARTIAL : meaningful ? STATUS.MISSING : STATUS.NOT_APPLICABLE, transit: meaningful && access?.completeness?.transit === "SUFFICIENT" ? STATUS.REVIEWED : meaningful && access ? STATUS.PARTIAL : meaningful ? STATUS.MISSING : STATUS.NOT_APPLICABLE, parking: meaningful && access?.completeness?.parking === "SUFFICIENT" ? STATUS.REVIEWED : meaningful && access ? STATUS.PARTIAL : meaningful ? STATUS.MISSING : STATUS.NOT_APPLICABLE, presentation: projected ? STATUS.REVIEWED : STATUS.MISSING, representativeBuildings: projected?.representativeBuildings?.length ? STATUS.REVIEWED : STATUS.MISSING },
      provenance: district.evidenceSources, evidenceOwnerDistrictId: district.evidenceOwner, scopeLimitation: district.scopeLimitation || "" };
  });
  const meaningful = decisionGeographies.filter((item) => /^CORE_|^SITUATIONAL_/.test(item.classification));
  const hardDimensions = [fitDimension, "businessEnvironment", "access", "transit", "parking"];
  const blockingGaps = meaningful.flatMap((item) => { const missing = hardDimensions.filter((key) => [STATUS.MISSING, STATUS.PARTIAL].includes(item.coverage[key])); return missing.length ? [{ districtId: item.districtId, dimensions: missing, reason: `A meaningful ${model} geography lacks reviewed hard-gate evidence.` }] : []; });
  return { schemaVersion: `sf-${model}-market-coverage:v1`, marketId: "san-francisco", propertyType: model, status: STATUS, decisionGeographies, blockingGaps,
    universeReview: { status: blockingGaps.length ? "BUILDING" : "READY", approvedDecisionGeographyIds: meaningful.map((item) => item.districtId), completenessRule: "No fixed count: every material candidate must be independently classified for this model or assigned a documented non-scoring role." },
    presentationGroups: foundation.presentationGroups, contextualGeographies: foundation.contextualGeographies,
    methodology: { sharedEntry: "The canonical customer property type remains industrial_flex; reviewed operational signals resolve Industrial, Flex, mixed, or unresolved intent.", distinction: "Industrial and Flex use shared geography and Access but separate fit facts, eligibility, calibration, and certification.", abstention: "Unresolved intent and unsupported operating patterns remain INVESTIGATE; unknown evidence is never averaged into neutral fit.", launchRule: "Reviewed universe, fit, operating environment, Access, deterministic resolution, neutrality, abstention, calibration, and controlled release must all pass." } };
}

module.exports = { schemaVersion: "sf-industrial-flex-market-coverage:v1", marketId: "san-francisco", industrial: coverageFor("industrial"), flex: coverageFor("flex") };
