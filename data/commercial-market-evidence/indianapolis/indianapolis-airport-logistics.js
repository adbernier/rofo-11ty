const district = {
  metroId: "indianapolis",
  metroName: "Indianapolis",
  cityId: "indianapolis",
  cityName: "Indianapolis",
  districtId: "indianapolis-airport-logistics",
  districtName: "Indianapolis Airport Logistics",
  districtPath: "/commercial-real-estate/IN/indianapolis/indianapolis-airport-logistics/",
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
    id: "indy-airport-logistics-558-airtech",
    title: "558 Airtech Parkway",
    subjectType: "building",
    subjectId: "558-airtech-parkway",
    subjectName: "558 Airtech Parkway",
    buildingProfileReference: "/commercial-real-estate/building/IN/indianapolis/558-airtech-parkway/",
    buildingProfileStatus: "migrated",
    evidenceType: "airport_logistics_industrial_building",
    evidenceTypeLabel: "Airport Logistics Industrial Building",
    evidenceRole: "airport_logistics_benchmark",
    evidenceRoleLabel: "Airport Logistics Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "558 Airtech Parkway anchors the Indianapolis airport-logistics foundation with an existing industrial Building Profile tied to airport-oriented industrial geography.",
    districtFit:
      "It explains why Indianapolis warehouse research should begin with airport and highway logistics context before publishing broader industrial recommendations.",
    typicalCompanies: ["warehouse users", "distribution businesses", "logistics users", "service-industrial operations"],
    typicalUsers: [
      "occupiers evaluating airport-adjacent warehouse, distribution, storage, receiving, or shipping needs in Indianapolis",
    ],
    leasingSituations: [
      "companies comparing airport logistics access with other Indianapolis industrial alternatives",
      "warehouse users validating loading, truck circulation, parking, clear height, and yard needs before touring",
    ],
    strengths: [
      "airport-logistics industrial identity",
      "existing industrial Building Profile",
      "distribution and warehouse comparison value",
      "clear foundation for Indianapolis industrial knowledge work",
    ],
    tradeoffs: [
      "Representative evidence does not imply current availability, clear height, loading, trailer parking, or operational suitability for a specific user.",
    ],
    nearbyAlternatives: ["4557 W Bradbury Ave", "5501 W 74th St", "7601 Winton Dr", "7998 Georgetown Rd"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/IN/indianapolis/558-airtech-parkway/",
        sourceType: "repository",
      },
      {
        label: "Develop Indy economic-development source material",
        url: "https://www.developindy.com/",
        sourceType: "economic_development",
      },
    ],
  }),
  evidenceRecord({
    id: "indy-airport-logistics-4557-bradbury",
    title: "4557 W Bradbury Ave",
    subjectType: "building",
    subjectId: "4557-w-bradbury-ave",
    subjectName: "4557 W Bradbury Ave",
    buildingProfileReference: "/commercial-real-estate/building/IN/indianapolis/4557-w-bradbury-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "indianapolis_industrial_building",
    evidenceTypeLabel: "Indianapolis Industrial Building",
    evidenceRole: "warehouse_industrial_depth",
    evidenceRoleLabel: "Warehouse / Industrial Depth",
    confidence: "editorially_supported",
    whyItBelongs:
      "4557 W Bradbury Ave adds Indianapolis industrial depth beyond the airport-named Airtech example and supports warehouse / operational comparison work.",
    districtFit:
      "It broadens the airport-logistics foundation with another industrial reference for businesses validating west-side Indianapolis warehouse and service needs.",
    typicalCompanies: ["warehouse users", "service-industrial businesses", "distributors", "operations teams"],
    typicalUsers: [
      "businesses that need Indianapolis industrial utility and want concrete examples before narrowing building requirements",
    ],
    leasingSituations: [
      "operators comparing local warehouse or service-industrial buildings against larger airport logistics properties",
      "users validating whether west-side Indianapolis supports the required access, loading, parking, and service territory",
    ],
    strengths: [
      "industrial Building Profile depth",
      "warehouse and service-industrial comparison value",
      "west-side Indianapolis operating context",
      "supports a broader industrial foundation without publishing a guide",
    ],
    tradeoffs: [
      "A representative industrial record still requires property-level validation of layout, loading, condition, use permissions, and current availability.",
    ],
    nearbyAlternatives: ["558 Airtech Parkway", "5501 W 74th St", "7601 Winton Dr", "7998 Georgetown Rd"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/IN/indianapolis/4557-w-bradbury-ave/",
        sourceType: "repository",
      },
      {
        label: "Indy Chamber economic-development source material",
        url: "https://indychamber.com/economic-development/",
        sourceType: "economic_development",
      },
    ],
  }),
  evidenceRecord({
    id: "indy-airport-logistics-7601-winton",
    title: "7601 Winton Dr",
    subjectType: "building",
    subjectId: "7601-winton-dr",
    subjectName: "7601 Winton Dr",
    buildingProfileReference: "/commercial-real-estate/building/IN/indianapolis/7601-winton-dr/",
    buildingProfileStatus: "migrated",
    evidenceType: "indianapolis_industrial_building",
    evidenceTypeLabel: "Indianapolis Industrial Building",
    evidenceRole: "large_format_warehouse_depth",
    evidenceRoleLabel: "Large-Format Warehouse Depth",
    confidence: "editorially_supported",
    whyItBelongs:
      "7601 Winton Dr contributes a larger industrial Building Profile reference for Indianapolis users evaluating warehouse or distribution-oriented requirements.",
    districtFit:
      "It helps the foundation distinguish larger warehouse considerations from smaller service-industrial or office/warehouse searches.",
    typicalCompanies: ["warehouse users", "distributors", "storage users", "e-commerce fulfillment businesses"],
    typicalUsers: [
      "occupiers that need to test whether Indianapolis can support larger-format warehouse, storage, or distribution needs",
    ],
    leasingSituations: [
      "large warehouse users comparing Indianapolis industrial examples before requesting current opportunities",
      "distribution users validating loading, clear height, trailer movement, and regional access requirements",
    ],
    strengths: [
      "large-format industrial evidence",
      "warehouse and distribution relevance",
      "complements smaller industrial examples",
      "supports source-grounded Indianapolis industrial depth",
    ],
    tradeoffs: [
      "Larger building evidence may exceed the needs of smaller service users and still requires direct validation of technical and operational requirements.",
    ],
    nearbyAlternatives: ["558 Airtech Parkway", "4557 W Bradbury Ave", "5501 W 74th St", "7998 Georgetown Rd"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/IN/indianapolis/7601-winton-dr/",
        sourceType: "repository",
      },
      {
        label: "Rofo Location Knowledge Graph",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
];

module.exports = {
  collectionId: "indianapolis-airport-logistics-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "indianapolis-industrial-district-depth",
      label: "Additional Indianapolis industrial districts",
      status: "researchable_later",
      reason:
        "Airport/logistics evidence is sufficient for foundation, but broader Indianapolis industrial submarkets require separate source-supported geography work.",
      prerequisite:
        "Validate additional industrial corridors, representative buildings, and market relationships before expanding public guidance.",
    },
    {
      id: "indianapolis-business-guides",
      label: "Indianapolis warehouse / industrial business guides",
      status: "blocked_for_now",
      reason:
        "Representative industrial evidence exists, but recommendation-grade business guides require broader district comparison and editorial review.",
      prerequisite:
        "Complete additional district coverage and property-type guidance before public business-guide publication.",
    },
  ],
};
