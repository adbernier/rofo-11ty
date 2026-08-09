const district = {
  metroId: "east-bay",
  metroName: "East Bay",
  cityId: "antioch",
  cityName: "Antioch",
  districtId: "antioch-east-18th-industrial",
  districtName: "Antioch East 18th Industrial",
  districtPath: "/commercial-real-estate/CA/antioch/antioch-east-18th-industrial/",
  primaryEcosystem: "industrial_flex",
  secondaryEcosystems: [],
  referenceDocument: "docs/commercial-market-evidence.md",
};

const neighboringDistrictRelationships = [];

function evidenceRecord(fields) {
  return {
    district,
    neighboringDistrictRelationships,
    reviewStatus: "approved_reference",
    ...fields,
  };
}

const records = [
  evidenceRecord({
    id: "antioch-east-18th-industrial-foundation",
    title: "Antioch East 18th industrial foundation",
    subjectType: "industrial_area",
    subjectId: "antioch-east-18th-industrial",
    subjectName: "Antioch East 18th Industrial",
    buildingProfileStatus: "not_applicable_area_evidence",
    evidenceType: "east_contra_costa_industrial_foundation",
    evidenceTypeLabel: "East Contra Costa Industrial Foundation",
    evidenceRole: "industrial_foundation_anchor",
    evidenceRoleLabel: "Industrial Foundation Anchor",
    confidence: "source_supported",
    whyItBelongs:
      "Antioch needs a local industrial foundation because Search Intelligence shows industrial and lease-oriented demand while the existing Rofo building set is retail-weighted.",
    districtFit:
      "The East 18th industrial framing gives future Antioch warehouse work a bounded operating geography without treating every Antioch commercial corridor as industrial-ready.",
    typicalCompanies: ["warehouse users", "service-industrial businesses", "contractor operations", "local distribution users"],
    typicalUsers: [
      "occupiers that need storage, service dispatch, receiving, shipping, or local East Contra Costa operating reach",
    ],
    leasingSituations: [
      "businesses comparing Antioch for warehouse, service-industrial, or contractor operations",
      "companies that need to validate loading, yard, truck access, and permitted use before touring individual properties",
    ],
    strengths: [
      "creates a bounded Antioch industrial foundation",
      "responds to observed warehouse and industrial search demand",
      "keeps unsupported building recommendations out of public guidance",
      "helps separate industrial needs from Antioch retail-space evidence",
    ],
    tradeoffs: [
      "The current Rofo Antioch Building Profile set is retail-only, so representative industrial Building Profiles require additional exact-property research.",
    ],
    nearbyAlternatives: [
      "Concord industrial alternatives",
      "Pittsburg industrial alternatives",
      "broader East Bay warehouse corridors",
    ],
    publicSources: [
      {
        label: "City of Antioch Economic Development",
        url: "https://www.antiochca.gov/economic-development/",
        sourceType: "official_government",
      },
      {
        label: "Rofo Search Intelligence Fort Wayne / Warehouse Mission evidence",
        url: "data/generated/search-console-opportunity.json",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "antioch-industrial-building-profile-prerequisite",
    title: "Antioch industrial Building Profile prerequisite",
    subjectType: "representative_property_pattern",
    subjectId: "antioch-industrial-building-profile-prerequisite",
    subjectName: "Antioch industrial Building Profile prerequisite",
    buildingProfileStatus: "candidate_building_profiles_deferred",
    evidenceType: "representative_industrial_property_prerequisite",
    evidenceTypeLabel: "Representative Industrial Property Prerequisite",
    evidenceRole: "building_profile_prerequisite",
    evidenceRoleLabel: "Building Profile Prerequisite",
    confidence: "review_required",
    whyItBelongs:
      "Antioch has enough search demand to justify industrial property research, but the current source graph does not yet contain durable industrial Building Profiles.",
    districtFit:
      "This prerequisite keeps Antioch's industrial work scoped to evidence acquisition before any public representative-building or business-guide publication.",
    typicalCompanies: ["warehouse users", "contractor operations", "service-industrial businesses", "small distributors"],
    typicalUsers: [
      "businesses that need property-level examples before comparing Antioch against nearby East Bay industrial alternatives",
    ],
    leasingSituations: [
      "future research that validates exact industrial addresses, ownership or property source material, building format, access, loading, and use constraints",
      "operators deciding whether Antioch provides local service reach or whether a more mature East Bay industrial corridor is the better starting point",
    ],
    strengths: [
      "documents why additional research is required",
      "prevents retail evidence from being reused as industrial evidence",
      "creates a clear follow-up path for Building Profile work",
      "keeps the mission bounded to warehouse / industrial foundation",
    ],
    tradeoffs: [
      "No public Antioch industrial Building Profile should be promoted until exact-address evidence and building-format validation are complete.",
    ],
    nearbyAlternatives: [
      "Concord industrial properties",
      "Pittsburg industrial properties",
      "Hayward Industrial",
    ],
    publicSources: [
      {
        label: "Rofo Building Page Standard",
        url: "docs/building-page-standard.md",
        sourceType: "repository",
      },
      {
        label: "Rofo Commercial Market Evidence standard",
        url: "docs/commercial-market-evidence.md",
        sourceType: "repository",
      },
    ],
  }),
];

module.exports = {
  collectionId: "antioch-east-18th-industrial-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "antioch-industrial-building-profiles",
      label: "Antioch warehouse / industrial Building Profiles",
      status: "researchable_later",
      reason:
        "Existing Rofo Antioch Building Profiles are retail-oriented; industrial properties need exact-address and source validation before migration.",
      prerequisite:
        "Validate durable industrial properties, owner or institutional property source material, physical format, access/loading context, and public-page readiness.",
    },
    {
      id: "antioch-business-guides",
      label: "Antioch industrial business guides",
      status: "blocked_for_now",
      reason:
        "One foundation geography and no source-supported industrial Building Profiles are not enough to publish defensible business-type guidance.",
      prerequisite:
        "Complete representative industrial Building Profiles and broader industrial district evidence first.",
    },
  ],
};
