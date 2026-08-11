const district = {
  metroId: "east-bay",
  metroName: "East Bay",
  cityId: "oakland",
  cityName: "Oakland",
  districtId: "jack-london-square",
  districtName: "Jack London Square",
  districtPath: "/commercial-real-estate/CA/oakland/jack-london-square/",
  primaryEcosystem: "office",
  secondaryEcosystems: ["retail"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "emeryville-commercial-core",
    districtName: "Emeryville Commercial Core",
    relationship:
      "Emeryville Commercial Core is the stronger comparison when business-park structure, parking, and campus-oriented East Bay office context matter more than Oakland waterfront identity.",
  },
  {
    districtId: "downtown-berkeley",
    districtName: "Downtown Berkeley",
    relationship:
      "Downtown Berkeley is the stronger comparison when BART-first access, UC Berkeley adjacency, and a university downtown setting matter more than Oakland waterfront character.",
  },
  {
    districtId: "west-berkeley",
    districtName: "West Berkeley",
    relationship:
      "West Berkeley is the stronger comparison when industrial/flex utility, maker activity, or production-adjacent Berkeley buildings matter more than waterfront office and service-commercial context.",
  },
];

function evidenceRecord(fields) {
  return {
    subjectType: "building",
    district,
    neighboringDistrictRelationships,
    reviewStatus: "approved_reference",
    confidence: "editorially_supported",
    ...fields,
  };
}

const records = [
  evidenceRecord({
    id: "east-bay-jack-london-square-119-filbert-st",
    title: "119 Filbert St",
    subjectId: "119-filbert-st",
    subjectName: "119 Filbert St",
    buildingProfileReference: "/commercial-real-estate/building/CA/oakland/119-filbert-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "waterfront_service_commercial_edge",
    evidenceTypeLabel: "Waterfront Service-Commercial Edge",
    evidenceRole: "lower_scale_service_commercial_reference",
    evidenceRoleLabel: "Lower-Scale Service-Commercial Reference",
    whyItBelongs:
      "119 Filbert St gives Jack London Square a lower-scale service-commercial example tied to the district's waterfront edge and adaptive commercial blocks.",
    districtFit:
      "It supports the district story for users comparing Oakland waterfront character, small office or service-commercial fit, and less formal building context than Broadway office towers.",
    typicalCompanies: ["service-commercial users", "small office teams", "creative office users", "destination service businesses"],
    typicalUsers: ["occupiers comparing Oakland waterfront commercial blocks with Emeryville, Downtown Berkeley, and West Berkeley alternatives"],
    leasingSituations: [
      "small office or service-commercial searches where waterfront identity and Oakland access matter",
      "users validating whether lower-scale Jack London Square buildings fit client arrival, staff access, and daily operations",
    ],
    strengths: ["waterfront-edge context", "service-commercial relevance", "small office and creative-office comparison value"],
    tradeoffs: ["Users must validate current suite condition, parking, signage, access, permitted use, and any customer-facing requirements directly."],
    nearbyAlternatives: ["160 Franklin St", "424 3rd St", "Emeryville Commercial Core"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/oakland/119-filbert-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-jack-london-square-160-franklin-st",
    title: "160 Franklin St",
    subjectId: "160-franklin-st",
    subjectName: "160 Franklin St",
    buildingProfileReference: "/commercial-real-estate/building/CA/oakland/160-franklin-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "waterfront_adjacent_commercial_building",
    evidenceTypeLabel: "Waterfront-Adjacent Commercial Building",
    evidenceRole: "waterfront_adjacent_commercial_reference",
    evidenceRoleLabel: "Waterfront-Adjacent Commercial Reference",
    whyItBelongs:
      "160 Franklin St anchors the Jack London Square collection with a waterfront-adjacent commercial example for office, service, and visitor-facing users.",
    districtFit:
      "It explains how ferry, rail, waterfront, restaurant, and lower-scale commercial context can shape Jack London Square decisions differently from inland office districts.",
    typicalCompanies: ["waterfront-oriented office users", "professional-service teams", "service businesses", "visitor-facing commercial users"],
    typicalUsers: ["businesses that want Oakland waterfront identity while still comparing practical access, parking, and building-specific fit"],
    leasingSituations: [
      "office or service searches where waterfront adjacency and visitor context influence the shortlist",
      "teams comparing Jack London Square with Downtown Berkeley, Emeryville, and West Berkeley for different access and identity tradeoffs",
    ],
    strengths: ["waterfront-adjacent identity", "office and service-commercial relevance", "district anchor value"],
    tradeoffs: ["Waterfront identity does not establish availability, pricing, suite quality, parking terms, signage, or customer access for a specific requirement."],
    nearbyAlternatives: ["119 Filbert St", "424 3rd St", "Downtown Berkeley"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/oakland/160-franklin-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-jack-london-square-424-3rd-st",
    title: "424 3rd St",
    subjectId: "424-3rd-st",
    subjectName: "424 3rd St",
    buildingProfileReference: "/commercial-real-estate/building/CA/oakland/424-3rd-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "adaptive_commercial_building",
    evidenceTypeLabel: "Adaptive Commercial Building",
    evidenceRole: "warehouse_adjacent_adaptive_commercial_reference",
    evidenceRoleLabel: "Warehouse-Adjacent Adaptive Commercial Reference",
    whyItBelongs:
      "424 3rd St gives Jack London Square an adaptive commercial example that reflects the district's warehouse-adjacent and lower-scale urban texture.",
    districtFit:
      "It helps distinguish Jack London Square from Downtown Oakland by showing a service-commercial and adaptive office setting near rail and waterfront context.",
    typicalCompanies: ["adaptive commercial users", "creative office teams", "service-commercial businesses", "small professional teams"],
    typicalUsers: ["occupiers deciding whether Jack London Square's lower-scale Oakland environment fits better than downtown towers or business parks"],
    leasingSituations: [
      "creative office or service-commercial searches comparing adaptive building character with conventional office settings",
      "users validating whether warehouse-adjacent context supports operations without requiring industrial utility",
    ],
    strengths: ["adaptive commercial texture", "warehouse-adjacent district explanation", "Oakland waterfront comparison value"],
    tradeoffs: ["Adaptive character requires property-level validation for layout, accessibility, building systems, parking, signage, and permitted-use fit."],
    nearbyAlternatives: ["160 Franklin St", "119 Filbert St", "West Berkeley"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/oakland/424-3rd-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
];

module.exports = {
  collectionId: "jack-london-square-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "jack-london-square-business-guides",
      label: "Jack London Square business guides",
      status: "blocked_for_now",
      reason:
        "The district evidence and selected Building Profiles support market explanation, but public business-type guides still need recommendation-readiness and business-specific validation.",
      prerequisite:
        "Add business-type-specific recommendation QA and deeper fit evidence before publishing customer-facing guide expansion.",
    },
    {
      id: "jack-london-square-commercial-market-evidence-quality-scoring",
      label: "Publisher quality scoring for Commercial Market Evidence",
      status: "researchable_later",
      reason:
        "Publisher currently reports Commercial Market Evidence and Building Profiles as separate readiness systems; quality scoring for CME is intentionally deferred.",
      prerequisite:
        "Define deterministic quality-scoring criteria for CME without mixing it into Building Brief depth metrics.",
    },
  ],
};
