const district = {
  metroId: "denver",
  metroName: "Denver",
  cityId: "denver",
  cityName: "Denver",
  districtId: "denver-tech-center",
  districtName: "Denver Tech Center",
  districtPath: "/commercial-real-estate/CO/denver/denver-tech-center/",
  primaryEcosystem: "office",
  secondaryEcosystems: ["coworking", "medical"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "downtown-denver",
    districtName: "Downtown Denver",
    relationship:
      "Downtown Denver is the stronger comparison when central civic access, transit, legal/finance context, and a formal downtown address matter more than southeast suburban convenience.",
  },
  {
    districtId: "cherry-creek",
    districtName: "Cherry Creek",
    relationship:
      "Cherry Creek is the stronger comparison when boutique customer-facing identity, retail adjacency, and polished visitor experience matter more than DTC office scale.",
  },
  {
    districtId: "inverness",
    districtName: "Inverness",
    relationship:
      "Inverness is the stronger comparison when a quieter southeast business-park setting or campus-style format matters more than the recognized DTC office core.",
  },
  {
    districtId: "centennial",
    districtName: "Centennial",
    relationship:
      "Centennial is the stronger comparison when south metro customer, medical, or local service geography matters more than DTC corporate office identity.",
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
    id: "den-dtc-4643-s-ulster-st",
    title: "4643 S Ulster St",
    subjectId: "4643-s-ulster-st",
    subjectName: "4643 S Ulster St",
    buildingProfileReference: "/commercial-real-estate/building/CO/denver/4643-s-ulster-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "professional_office_environment",
    evidenceTypeLabel: "Professional Office Environment",
    evidenceRole: "practical_professional_office_benchmark",
    evidenceRoleLabel: "Practical Professional Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "4643 S Ulster St gives Denver Tech Center a practical professional-office benchmark for regional service, administrative, consulting, and client-facing users.",
    districtFit:
      "It explains the DTC use case where parking, southeast commute geography, and functional office fit matter more than downtown identity or Cherry Creek polish.",
    typicalCompanies: ["professional-service firms", "consulting firms", "regional service offices", "administrative teams"],
    typicalUsers: [
      "office users comparing practical DTC access and parking against Downtown Denver, Cherry Creek, Inverness, or Centennial",
    ],
    leasingSituations: [
      "companies validating whether southeast metro access and parking convenience justify a DTC office search",
      "professional-service or administrative teams comparing practical office utility against stronger downtown or boutique district identity",
    ],
    strengths: [
      "practical professional-office evidence",
      "southeast metro access context",
      "parking-oriented office comparison value",
      "clear contrast against Downtown Denver and Cherry Creek",
    ],
    tradeoffs: [
      "Professional office evidence does not establish current availability, suite condition, parking allocation, or tenant suitability.",
    ],
    nearbyAlternatives: ["DTC Tech", "DTC Corporate Center III", "Downtown Denver office alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/denver/4643-s-ulster-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo Denver Tech Center representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "den-dtc-corporate-center-iii",
    title: "DTC Corporate Center III",
    subjectId: "7900-e-union-ave",
    subjectName: "DTC Corporate Center III",
    buildingProfileReference: "/commercial-real-estate/building/CO/denver/7900-e-union-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "suburban_corporate_office",
    evidenceTypeLabel: "Suburban Corporate Office",
    evidenceRole: "campus_style_office_benchmark",
    evidenceRoleLabel: "Campus-Style Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "DTC Corporate Center III represents the larger corporate and campus-style office side of Denver Tech Center.",
    districtFit:
      "It shows why DTC is relevant for regional headquarters, administrative teams, and parking-sensitive office users that need suburban scale rather than a downtown office pattern.",
    typicalCompanies: ["regional headquarters", "corporate offices", "professional-service firms", "back-office teams"],
    typicalUsers: [
      "larger office users comparing DTC floorplate, parking, and southeast access against central Denver or other suburban office nodes",
    ],
    leasingSituations: [
      "regional offices weighing corporate scale and parking against downtown address value",
      "administrative or headquarters users validating expansion, parking, and commute needs in the southeast metro",
    ],
    strengths: [
      "corporate office identity",
      "larger DTC office-scale evidence",
      "parking and southeast access context",
      "useful comparison against Downtown Denver, Cherry Creek, and Inverness",
    ],
    tradeoffs: [
      "Campus-style office evidence may be less useful for smaller, urban, transit-oriented, or boutique customer-facing users.",
    ],
    nearbyAlternatives: ["4643 S Ulster St", "DTC Tech", "Inverness office alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/denver/7900-e-union-ave/",
        sourceType: "repository",
      },
      {
        label: "Rofo Denver Tech Center representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "den-dtc-tech",
    title: "DTC Tech",
    subjectId: "4600-s-syracuse-st",
    subjectName: "DTC Tech",
    buildingProfileReference: "/commercial-real-estate/building/CO/denver/4600-s-syracuse-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "technology_business_park_office",
    evidenceTypeLabel: "Technology / Business-Park Office",
    evidenceRole: "technology_support_office_benchmark",
    evidenceRoleLabel: "Technology-Support Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "DTC Tech helps explain Denver Tech Center for technology, office-heavy flex, and professional users that want southeast business-park practicality.",
    districtFit:
      "It adds a technology-support office example while keeping the boundary clear between office-heavy technical use and true industrial, lab, or warehouse requirements.",
    typicalCompanies: ["technology companies", "technical support teams", "professional-service firms", "office-heavy flex users"],
    typicalUsers: [
      "businesses comparing DTC business-park office utility against RiNo creative identity, Downtown Denver access, or US-36 technology markets",
    ],
    leasingSituations: [
      "technology or office-heavy flex teams validating whether DTC access and parking matter more than creative district identity",
      "users deciding whether the requirement is ordinary office, office/flex, or specialized technical space",
    ],
    strengths: [
      "technology-support office evidence",
      "business-park comparison value",
      "southeast metro access context",
      "useful distinction between office-heavy flex and industrial requirements",
    ],
    tradeoffs: [
      "DTC Tech should not be read as evidence of lab, warehouse, loading, production, or specialized infrastructure without property-level validation.",
    ],
    nearbyAlternatives: ["4643 S Ulster St", "DTC Corporate Center III", "RiNo office alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/denver/4600-s-syracuse-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo Denver Tech Center representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
];

module.exports = {
  collectionId: "denver-tech-center-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "dtc-business-guides",
      label: "Denver Tech Center business guides",
      status: "blocked_for_now",
      reason:
        "DTC now has a source-supported office evidence collection, but public business guides should wait for broader south/southeast Denver comparison coverage and guide-specific editorial scope.",
      prerequisite:
        "Complete additional southeast office comparison evidence across Inverness, Centennial, and Lone Tree or approve a focused DTC business-guide packet.",
    },
  ],
};
