const district = {
  metroId: "denver",
  metroName: "Denver",
  cityId: "broomfield",
  cityName: "Broomfield",
  districtId: "broomfield",
  districtName: "Broomfield",
  districtPath: "/commercial-real-estate/CO/broomfield/broomfield/",
  primaryEcosystem: "office",
  secondaryEcosystems: ["technology", "flex", "r_and_d"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "boulder",
    districtName: "Boulder",
    relationship:
      "Boulder is the stronger comparison when Boulder identity, university adjacency, research signal, and talent story matter more than practical US-36 corridor access.",
  },
  {
    districtId: "interlocken",
    districtName: "Interlocken",
    relationship:
      "Interlocken is the stronger comparison when the search should focus on a concentrated Broomfield business-park and campus-office node rather than the broader Broomfield market.",
  },
  {
    districtId: "westminster",
    districtName: "Westminster",
    relationship:
      "Westminster is the stronger comparison when northwest suburban local-service, customer, or medical geography matters more than US-36 technology and corporate-office context.",
  },
  {
    districtId: "louisville-superior",
    districtName: "Louisville / Superior",
    relationship:
      "Louisville / Superior is the stronger comparison when Boulder-adjacent office/flex and R&D-support geography matters more than Broomfield's broader regional office scale.",
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
    id: "den-broomfield-335-interlocken-pkwy",
    title: "335 Interlocken Pkwy",
    subjectId: "335-interlocken-pkwy",
    subjectName: "335 Interlocken Pkwy",
    buildingProfileReference: "/commercial-real-estate/building/CO/broomfield/335-interlocken-pkwy/",
    buildingProfileStatus: "migrated",
    evidenceType: "professional_office_environment",
    evidenceTypeLabel: "Professional Office Environment",
    evidenceRole: "us36_professional_office_benchmark",
    evidenceRoleLabel: "US-36 Professional Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "335 Interlocken Pkwy gives Broomfield a professional and technology-office benchmark for users comparing practical Denver-Boulder corridor access.",
    districtFit:
      "It explains the Broomfield office use case where parking, regional employee geography, and US-36 access can matter more than Boulder identity or central Denver visibility.",
    typicalCompanies: ["technology companies", "professional-service firms", "regional offices", "aerospace-adjacent users"],
    typicalUsers: [
      "office users comparing Broomfield, Interlocken, Boulder, Westminster, and Louisville / Superior for Denver-Boulder corridor fit",
    ],
    leasingSituations: [
      "companies validating whether US-36 corridor access and parking justify a Broomfield office search",
      "professional-service or technology teams comparing practical office utility against stronger Boulder or Denver district identity",
    ],
    strengths: [
      "professional-office evidence",
      "US-36 corridor access context",
      "parking-oriented suburban comparison value",
      "clear contrast against Boulder and Downtown Denver",
    ],
    tradeoffs: [
      "Professional office evidence does not establish current availability, suite condition, parking allocation, or tenant suitability.",
    ],
    nearbyAlternatives: ["Interlocken", "Spaces Arista", "Boulder office alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/broomfield/335-interlocken-pkwy/",
        sourceType: "repository",
      },
      {
        label: "Rofo Broomfield representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "den-broomfield-interlocken",
    title: "Interlocken",
    subjectId: "390-interlocken-crescent",
    subjectName: "Interlocken",
    buildingProfileReference: "/commercial-real-estate/building/CO/broomfield/390-interlocken-crescent/",
    buildingProfileStatus: "migrated",
    evidenceType: "suburban_office_campus",
    evidenceTypeLabel: "Suburban Office Campus",
    evidenceRole: "campus_style_office_benchmark",
    evidenceRoleLabel: "Campus-Style Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Interlocken represents the campus-oriented side of Broomfield for corporate, technology, and regional office users.",
    districtFit:
      "It shows why Broomfield is useful for companies that value campus scale, parking, US-36 access, and regional reach more than urban walkability.",
    typicalCompanies: ["corporate offices", "technology companies", "regional headquarters", "professional-service firms"],
    typicalUsers: [
      "larger or campus-oriented office users comparing Broomfield and Interlocken against Boulder, DTC, and Downtown Denver",
    ],
    leasingSituations: [
      "regional office searches where employee geography and parking matter more than central address identity",
      "technology or corporate users validating whether business-park scale supports workplace and expansion needs",
    ],
    strengths: [
      "campus-style office evidence",
      "business-park comparison value",
      "US-36 regional access context",
      "useful contrast against smaller office and flexible-suite examples",
    ],
    tradeoffs: [
      "Campus-style scale may be less useful for users that need urban walkability, small-suite simplicity, or stronger Boulder-specific identity.",
    ],
    nearbyAlternatives: ["335 Interlocken Pkwy", "Spaces Arista", "Interlocken district alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/broomfield/390-interlocken-crescent/",
        sourceType: "repository",
      },
      {
        label: "Rofo Broomfield representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "den-broomfield-spaces-arista",
    title: "Spaces Arista",
    subjectId: "8181-arista-place",
    subjectName: "Spaces Arista",
    buildingProfileReference: "/commercial-real-estate/building/CO/broomfield/8181-arista-place/",
    buildingProfileStatus: "migrated",
    evidenceType: "small_tenant_office_environment",
    evidenceTypeLabel: "Small-Tenant Office Environment",
    evidenceRole: "flexible_office_entry_benchmark",
    evidenceRoleLabel: "Flexible Office Entry Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Spaces Arista adds a smaller-team and flexible-office example to Broomfield's evidence so the market is not explained only through campus or corporate office scale.",
    districtFit:
      "It illustrates the Broomfield use case where regional access, parking, and easier entry may matter more than long-term control or a traditional CBD office identity.",
    typicalCompanies: ["small professional teams", "technology startups", "consulting teams", "regional project offices"],
    typicalUsers: [
      "small or flexible office users comparing Broomfield corridor access against Boulder identity, Westminster local-service geography, or central Denver visibility",
    ],
    leasingSituations: [
      "small-team searches where entry flexibility and access matter more than full control of a conventional suite",
      "project-office or early-stage searches validating whether Broomfield works before committing to a larger office plan",
    ],
    strengths: [
      "small-tenant office evidence",
      "flexible-entry comparison value",
      "Arista and US-36 access context",
      "useful balance against larger Broomfield campus examples",
    ],
    tradeoffs: [
      "Flexible small-team office evidence may trade long-term control, brand presence, expansion options, or dedicated suite configuration for easier entry.",
    ],
    nearbyAlternatives: ["335 Interlocken Pkwy", "Interlocken", "Westminster office alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/broomfield/8181-arista-place/",
        sourceType: "repository",
      },
      {
        label: "Rofo Broomfield representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
];

module.exports = {
  collectionId: "broomfield-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "broomfield-business-guides",
      label: "Broomfield business guides",
      status: "blocked_for_now",
      reason:
        "Broomfield now has initial office evidence, but public business guides should wait for broader northwest Denver-Boulder corridor comparison coverage and guide-specific editorial scope.",
      prerequisite:
        "Complete additional Broomfield, Interlocken, Boulder, Westminster, and Louisville / Superior comparison evidence or approve a focused Broomfield business-guide packet.",
    },
  ],
};
