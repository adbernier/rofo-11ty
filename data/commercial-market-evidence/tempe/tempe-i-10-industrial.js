const district = {
  metroId: "phoenix-metro",
  metroName: "Phoenix Metro",
  cityId: "tempe",
  cityName: "Tempe",
  districtId: "tempe-i-10-industrial",
  districtName: "Tempe I-10 Industrial",
  districtPath: "/commercial-real-estate/AZ/tempe/tempe-i-10-industrial/",
  primaryEcosystem: "industrial_flex",
  secondaryEcosystems: ["office"],
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
    id: "tempe-i10-industrial-6840-harl",
    title: "6840 S Harl Ave",
    subjectType: "building",
    subjectId: "6840-s-harl-ave",
    subjectName: "6840 S Harl Ave",
    buildingProfileReference: "/commercial-real-estate/building/AZ/tempe/6840-s-harl-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "tempe_industrial_building",
    evidenceTypeLabel: "Tempe Industrial Building",
    evidenceRole: "initial_industrial_building_anchor",
    evidenceRoleLabel: "Initial Industrial Building Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "6840 S Harl Ave is the only current Rofo Tempe industrial Building Profile, so it anchors a cautious foundation rather than a complete industrial guide.",
    districtFit:
      "It supports Tempe I-10 Industrial as a starting geography for warehouse, industrial, and office/warehouse validation while making the thin evidence state visible.",
    typicalCompanies: ["warehouse users", "office/warehouse users", "service-industrial businesses", "local operations teams"],
    typicalUsers: [
      "occupiers evaluating whether Tempe can support industrial or office/warehouse needs before comparing broader Phoenix-area alternatives",
    ],
    leasingSituations: [
      "users validating Tempe-specific warehouse or industrial fit before expanding the search to Phoenix, Mesa, or Chandler",
      "businesses testing loading, truck access, parking, and office/warehouse mix before treating Tempe as the right industrial geography",
    ],
    strengths: [
      "initial Tempe industrial Building Profile",
      "central Phoenix metro comparison value",
      "supports I-10-oriented foundation work",
      "keeps broader Phoenix industrial alternatives visible",
    ],
    tradeoffs: [
      "A single Building Profile is not enough to publish broad Tempe warehouse guidance or imply current availability, technical fit, loading, or yard suitability.",
    ],
    nearbyAlternatives: [
      "Phoenix industrial alternatives",
      "Mesa industrial alternatives",
      "Chandler industrial alternatives",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/AZ/tempe/6840-s-harl-ave/",
        sourceType: "repository",
      },
      {
        label: "City of Tempe Smith Innovation Hub",
        url: "https://www.tempe.gov/government/economic-development/locate-in-tempe/innovation-hubs/smith-industrial-innovation-hub",
        sourceType: "official_government",
      },
    ],
  }),
  evidenceRecord({
    id: "tempe-i10-industrial-foundation-context",
    title: "Tempe I-10 industrial foundation context",
    subjectType: "industrial_area",
    subjectId: "tempe-i-10-industrial",
    subjectName: "Tempe I-10 Industrial",
    buildingProfileStatus: "not_applicable_area_evidence",
    evidenceType: "central_phoenix_metro_industrial_foundation",
    evidenceTypeLabel: "Central Phoenix Metro Industrial Foundation",
    evidenceRole: "industrial_foundation_context",
    evidenceRoleLabel: "Industrial Foundation Context",
    confidence: "source_supported",
    whyItBelongs:
      "Tempe has industrial search evidence and at least one industrial Building Profile, but the right editorial framing is still central-metro foundation work rather than a full market guide.",
    districtFit:
      "The I-10 industrial framing helps future research compare Tempe-specific industrial needs against broader Phoenix, Mesa, and Chandler alternatives.",
    typicalCompanies: ["warehouse users", "service-industrial businesses", "office/warehouse users", "local distributors"],
    typicalUsers: [
      "businesses that need central Phoenix metro access and must validate whether Tempe itself is the right industrial geography",
    ],
    leasingSituations: [
      "operators deciding whether Tempe access outweighs broader Phoenix-area logistics alternatives",
      "office/warehouse users validating loading, parking, service territory, and customer or employee geography",
    ],
    strengths: [
      "creates a bounded Tempe industrial foundation",
      "connects search demand to existing Building Profile evidence",
      "keeps broader Phoenix alternatives in the decision",
      "supports future representative-property research",
    ],
    tradeoffs: [
      "Tempe industrial evidence remains thin, so public business guides and deeper recommendations require additional representative properties.",
    ],
    nearbyAlternatives: [
      "Phoenix industrial alternatives",
      "Mesa industrial alternatives",
      "Chandler industrial alternatives",
    ],
    publicSources: [
      {
        label: "City of Tempe Maker District / Broadway Innovation Hub",
        url: "https://www.tempe.gov/government/economic-development/locate-in-tempe/innovation-hubs/tempe-maker-district-broadway-innovation-hub",
        sourceType: "official_government",
      },
      {
        label: "Rofo Search Intelligence normalized data",
        url: "data/generated/search-console-opportunity.json",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "tempe-smith-innovation-hub-industrial-context",
    title: "Smith Innovation Hub industrial context",
    subjectType: "industrial_area",
    subjectId: "smith-innovation-hub",
    subjectName: "Smith Innovation Hub",
    buildingProfileStatus: "not_applicable_area_evidence",
    evidenceType: "tempe_innovation_industrial_area",
    evidenceTypeLabel: "Tempe Innovation / Industrial Area",
    evidenceRole: "industrial_geography_context",
    evidenceRoleLabel: "Industrial Geography Context",
    confidence: "source_supported",
    whyItBelongs:
      "Smith Innovation Hub is a source-supported Tempe geography that helps frame where industrial, production, distribution, and office/warehouse work should be evaluated inside the city.",
    districtFit:
      "It strengthens the Tempe I-10 Industrial foundation by showing that Tempe industrial work should not be treated as generic citywide office demand.",
    typicalCompanies: ["warehouse users", "production-adjacent businesses", "service-industrial businesses", "office/warehouse users"],
    typicalUsers: [
      "occupiers comparing Tempe for operational space while still needing to validate whether Phoenix, Mesa, or Chandler alternatives are stronger",
    ],
    leasingSituations: [
      "businesses validating whether Tempe offers enough industrial utility for storage, service dispatch, production-adjacent work, or office/warehouse use",
      "operators that need central Phoenix metro access but should confirm truck, loading, parking, and permitted-use details building by building",
    ],
    strengths: [
      "adds source-supported Tempe commercial geography",
      "supports industrial and office/warehouse foundation work",
      "keeps the mission bounded to Tempe industrial context",
      "helps future research target exact-property validation",
    ],
    tradeoffs: [
      "Area-level evidence does not establish a complete representative property set or public business-guide readiness.",
    ],
    nearbyAlternatives: [
      "Tempe I-10 Industrial",
      "Phoenix industrial alternatives",
      "Mesa industrial alternatives",
      "Chandler industrial alternatives",
    ],
    publicSources: [
      {
        label: "City of Tempe Economic Development",
        url: "https://www.tempe.gov/government/economic-development",
        sourceType: "official_government",
      },
    ],
  }),
  evidenceRecord({
    id: "tempe-maker-district-industrial-context",
    title: "Tempe Maker District industrial context",
    subjectType: "industrial_area",
    subjectId: "tempe-maker-district",
    subjectName: "Tempe Maker District",
    buildingProfileStatus: "not_applicable_area_evidence",
    evidenceType: "tempe_maker_industrial_area",
    evidenceTypeLabel: "Tempe Maker / Industrial Area",
    evidenceRole: "industrial_geography_context",
    evidenceRoleLabel: "Industrial Geography Context",
    confidence: "source_supported",
    whyItBelongs:
      "Tempe's maker-oriented industrial geography gives Rofo a more precise foundation for production-adjacent, service, and office/warehouse users than a generic Tempe market snapshot.",
    districtFit:
      "The Maker District context supports the same bounded industrial foundation as 6840 S Harl Ave while preserving the need for exact representative-property validation.",
    typicalCompanies: ["maker businesses", "light production users", "service-industrial companies", "office/warehouse users"],
    typicalUsers: [
      "businesses that want central Tempe access with practical industrial or maker-oriented operating context",
    ],
    leasingSituations: [
      "users deciding whether Tempe's industrial/maker setting fits customer, employee, service-territory, and operational requirements",
      "teams comparing Tempe's smaller operational formats with broader Phoenix metro warehouse corridors",
    ],
    strengths: [
      "adds non-generic Tempe industrial geography",
      "supports light production and office/warehouse context",
      "improves future district-intelligence inputs",
      "keeps live availability and technical building claims out of the foundation",
    ],
    tradeoffs: [
      "The evidence supports a foundation geography, not a claim about current spaces, rents, tenants, or building-specific industrial infrastructure.",
    ],
    nearbyAlternatives: [
      "Smith Innovation Hub",
      "Tempe I-10 Industrial",
      "Phoenix industrial alternatives",
      "Mesa industrial alternatives",
    ],
    publicSources: [
      {
        label: "City of Tempe Economic Development",
        url: "https://www.tempe.gov/government/economic-development",
        sourceType: "official_government",
      },
    ],
  }),
];

module.exports = {
  collectionId: "tempe-i-10-industrial-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "tempe-industrial-building-profiles",
      label: "Additional Tempe warehouse / industrial Building Profiles",
      status: "researchable_later",
      reason:
        "Tempe has one industrial Building Profile plus source-supported industrial geography; a stronger representative set requires additional exact-property evidence.",
      prerequisite:
        "Validate additional Tempe industrial properties with source-supported identity, physical format, access/loading context, and public-page readiness.",
    },
    {
      id: "tempe-industrial-business-guides",
      label: "Tempe warehouse / industrial business guides",
      status: "blocked_for_now",
      reason:
        "A single industrial Building Profile and one foundation geography are not enough to publish defensible occupier guides.",
      prerequisite:
        "Complete broader Tempe/Phoenix industrial comparison evidence before publishing business-type guidance.",
    },
  ],
};
