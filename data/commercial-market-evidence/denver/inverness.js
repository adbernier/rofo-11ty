const district = {
  metroId: "denver",
  metroName: "Denver",
  cityId: "englewood",
  cityName: "Englewood",
  districtId: "inverness",
  districtName: "Inverness",
  districtPath: "/commercial-real-estate/CO/englewood/inverness/",
  primaryEcosystem: "office",
  secondaryEcosystems: ["flex", "r_and_d", "medical"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "denver-tech-center",
    districtName: "Denver Tech Center",
    relationship:
      "Denver Tech Center is the stronger comparison when recognized southeast office identity and deeper corporate-office market signal matter more than Inverness business-park quiet.",
  },
  {
    districtId: "centennial",
    districtName: "Centennial",
    relationship:
      "Centennial is the stronger comparison when south metro medical, service, or local customer geography matters more than Inverness corporate-office format.",
  },
  {
    districtId: "lone-tree",
    districtName: "Lone Tree",
    relationship:
      "Lone Tree is the stronger comparison when farther south I-25 customer geography and south metro office context matter more than Inverness business-park format.",
  },
];

function evidenceRecord(fields) {
  return {
    subjectType: "building",
    district,
    neighboringDistrictRelationships,
    reviewStatus: "approved_reference",
    ...fields,
  };
}

const records = [
  evidenceRecord({
    id: "den-inverness-109-inverness-dr-e",
    title: "109 Inverness Dr E",
    subjectId: "109-inverness-dr-e",
    subjectName: "109 Inverness Dr E",
    buildingProfileReference: "/commercial-real-estate/building/CO/englewood/109-inverness-dr-e/",
    buildingProfileStatus: "migrated",
    evidenceType: "suburban_office_campus",
    evidenceTypeLabel: "Suburban Office Campus",
    evidenceRole: "campus_style_office_benchmark",
    evidenceRoleLabel: "Campus-Style Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "109 Inverness Dr E gives Inverness a practical campus-style office benchmark for southeast metro users weighing parking, business-park format, and DTC adjacency.",
    districtFit:
      "It explains the core Inverness use case: office users that want quieter suburban business-park utility rather than downtown visibility or the more recognized DTC identity.",
    typicalCompanies: ["professional-service firms", "technology offices", "regional offices", "administrative teams"],
    typicalUsers: [
      "office users comparing Inverness parking and campus format against Denver Tech Center, Greenwood Village, Centennial, or Lone Tree",
    ],
    leasingSituations: [
      "teams validating whether southeast employee geography and parking convenience support an Inverness search",
      "professional-service or administrative groups comparing business-park utility against stronger district identity elsewhere",
    ],
    strengths: [
      "campus-style office evidence",
      "parking-oriented southeast access context",
      "clear Inverness business-park format",
      "useful contrast against DTC and Downtown Denver",
    ],
    tradeoffs: [
      "Campus-style evidence does not establish current availability, suite condition, parking allocation, or tenant suitability.",
    ],
    nearbyAlternatives: ["365 Inverness Pkwy", "Cascades", "Denver Tech Center office alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/englewood/109-inverness-dr-e/",
        sourceType: "repository",
      },
      {
        label: "Rofo Inverness representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "den-inverness-365-inverness-pkwy",
    title: "365 Inverness Pkwy",
    subjectId: "365-inverness-pkwy",
    subjectName: "365 Inverness Pkwy",
    buildingProfileReference: "/commercial-real-estate/building/CO/englewood/365-inverness-pkwy/",
    buildingProfileStatus: "migrated",
    evidenceType: "professional_office_environment",
    evidenceTypeLabel: "Professional Office Environment",
    evidenceRole: "practical_professional_office_benchmark",
    evidenceRoleLabel: "Practical Professional Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "365 Inverness Pkwy represents the practical professional-office side of Inverness for southeast metro service, administrative, consulting, and technology users.",
    districtFit:
      "It keeps the collection from over-indexing on campus scale by showing the everyday professional-office format businesses may compare against DTC or Greenwood Village.",
    typicalCompanies: ["professional-service firms", "consulting teams", "technology offices", "administrative offices"],
    typicalUsers: [
      "smaller and mid-sized office users that want southeast access and parking without requiring a larger headquarters-style campus",
    ],
    leasingSituations: [
      "professional teams comparing functional office fit across Inverness, DTC, and Greenwood Village",
      "businesses validating whether office layout, visitor arrival, and employee commute geography make Inverness practical",
    ],
    strengths: [
      "professional-office evidence",
      "practical southeast business-park comparison value",
      "parking and access context",
      "useful contrast against larger campus buildings",
    ],
    tradeoffs: [
      "Functional office evidence should still be validated against current suite layout, arrival experience, parking, and occupancy requirements.",
    ],
    nearbyAlternatives: ["109 Inverness Dr E", "The Point at Inverness", "Greenwood Village office alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/englewood/365-inverness-pkwy/",
        sourceType: "repository",
      },
      {
        label: "Rofo Inverness representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "den-inverness-cascades",
    title: "Cascades",
    subjectId: "6300-s-syracuse-way",
    subjectName: "Cascades",
    buildingProfileReference: "/commercial-real-estate/building/CO/englewood/6300-s-syracuse-way/",
    buildingProfileStatus: "migrated",
    evidenceType: "large_scale_office_campus",
    evidenceTypeLabel: "Large-Scale Office Campus",
    evidenceRole: "large_campus_office_benchmark",
    evidenceRoleLabel: "Large Campus Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Cascades shows the larger multi-building campus side of Inverness for regional offices, headquarters-style teams, and users evaluating expansion flexibility.",
    districtFit:
      "It explains why Inverness belongs in southeast office comparisons when business-park scale and parking matter more than downtown walkability or urban customer visibility.",
    typicalCompanies: ["regional offices", "corporate support teams", "technology offices", "headquarters-style users"],
    typicalUsers: [
      "larger office users comparing campus format, parking, and expansion practicality against DTC, Lone Tree, or Meridian alternatives",
    ],
    leasingSituations: [
      "regional office searches where parking, floorplate fit, and employee commute geography carry the decision",
      "companies deciding whether Inverness business-park scale is more useful than central Denver or Cherry Creek identity",
    ],
    strengths: [
      "large campus-office evidence",
      "expansion and scale comparison value",
      "southeast metro business-park context",
      "clear contrast against smaller professional-office options",
    ],
    tradeoffs: [
      "Business-park scale does not confirm current suite condition, expansion availability, parking allocation, or operational fit.",
    ],
    nearbyAlternatives: ["109 Inverness Dr E", "The Point at Inverness", "Meridian / Lincoln Station office alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/englewood/6300-s-syracuse-way/",
        sourceType: "repository",
      },
      {
        label: "Rofo Inverness representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "den-inverness-the-point",
    title: "The Point at Inverness",
    subjectId: "8310-s-valley-hwy",
    subjectName: "The Point at Inverness",
    buildingProfileReference: "/commercial-real-estate/building/CO/englewood/8310-s-valley-hwy/",
    buildingProfileStatus: "migrated",
    evidenceType: "executive_office_environment",
    evidenceTypeLabel: "Executive Office Environment",
    evidenceRole: "southeast_executive_office_benchmark",
    evidenceRoleLabel: "Southeast Executive Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "The Point at Inverness gives the district an executive-office benchmark for users comparing polished southeast suburban image with DTC, Greenwood Village, and Lone Tree.",
    districtFit:
      "It shows that Inverness can support more image-sensitive office decisions while preserving the district's business-park, parking-oriented, and southeast-access tradeoffs.",
    typicalCompanies: ["executive offices", "professional-service firms", "consulting teams", "regional business offices"],
    typicalUsers: [
      "client-facing or leadership-heavy office users that want a suburban executive environment instead of downtown civic access",
    ],
    leasingSituations: [
      "executive-office searches comparing Inverness against DTC, Greenwood Village, Lone Tree, or Cherry Creek",
      "professional users validating whether visitor arrival and building image support client meetings in a suburban setting",
    ],
    strengths: [
      "executive-office evidence",
      "polished southeast suburban comparison value",
      "visitor-arrival and image context",
      "clear contrast against campus-scale and practical professional-office examples",
    ],
    tradeoffs: [
      "Executive image should not be treated as proof of current availability, suite quality, parking allocation, or client fit.",
    ],
    nearbyAlternatives: ["365 Inverness Pkwy", "Cascades", "Denver Tech Center executive office alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/englewood/8310-s-valley-hwy/",
        sourceType: "repository",
      },
      {
        label: "Rofo Inverness representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
];

module.exports = {
  collectionId: "inverness-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "inverness-business-guides",
      label: "Inverness office and business-park guides",
      status: "blocked_for_now",
      reason:
        "Inverness now has source-supported office evidence, but public business guides should wait for guide-specific editorial scope and broader southeast office comparison coverage.",
      prerequisite:
        "Complete additional southeast office comparison evidence across Greenwood Village, Centennial, Lone Tree, and Meridian / Lincoln Station or approve a focused Inverness business-guide packet.",
    },
  ],
};
