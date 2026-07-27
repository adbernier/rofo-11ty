const district = {
  metroId: "san-francisco",
  metroName: "San Francisco",
  cityId: "san-francisco",
  cityName: "San Francisco",
  districtId: "financial-district",
  districtName: "Financial District",
  districtPath: "/commercial-real-estate/CA/san-francisco/financial-district/",
  primaryEcosystem: "office",
  secondaryEcosystems: ["retail"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "jackson-square",
    districtName: "Jackson Square",
    relationship:
      "Jackson Square is a stronger comparison when boutique character, smaller floorplates, historic texture, and a less tower-oriented executive environment matter more than formal CBD scale.",
  },
  {
    districtId: "soma",
    districtName: "SoMa",
    relationship:
      "SoMa is a stronger comparison when adaptive reuse, technology identity, creative-office flexibility, or larger mixed-use blocks matter more than conventional downtown formality.",
  },
  {
    districtId: "mission-bay",
    districtName: "Mission Bay",
    relationship:
      "Mission Bay is a stronger comparison when institutional gravity, newer development parcels, health care, life science, or innovation-campus context matter more than mature CBD office identity.",
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
    id: "sf-financial-district-555-california",
    title: "555 California",
    subjectId: "555-california-st",
    subjectName: "555 California St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/555-california-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "trophy_office_tower",
    evidenceTypeLabel: "Trophy Office Tower",
    evidenceRole: "district_anchor_corporate_benchmark",
    evidenceRoleLabel: "District Anchor / Corporate Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "555 California explains the formal corporate end of the Financial District. It is the reference point for companies that want a recognized downtown tower, institutional scale, and a client-facing address.",
    districtFit:
      "It shows why the Financial District is different from SoMa or Jackson Square: larger tower identity, stronger corporate formality, and a traditional professional-services ecosystem.",
    typicalCompanies: [
      "financial-services firms",
      "law firms",
      "consulting firms",
      "regional headquarters",
      "corporate advisory firms",
    ],
    typicalUsers: [
      "leadership-heavy teams",
      "client-facing professional-service groups",
      "companies that want an address to communicate stability and institutional presence",
    ],
    leasingSituations: [
      "headquarters or regional office searches",
      "executive-floor decisions",
      "renewals where image and client access matter",
      "comparisons between trophy cost and practical downtown utility",
    ],
    strengths: [
      "recognizable business address",
      "tower scale",
      "downtown client access",
      "corporate image",
      "strong comparison value for other CBD options",
    ],
    tradeoffs: [
      "May be too formal or costly for teams that need flexibility, creative character, or a less hierarchical workplace signal.",
    ],
    nearbyAlternatives: [
      "101 California",
      "345 California Center",
      "One Sansome",
      "Jackson Square",
    ],
    publicSources: [
      {
        label: "Rofo canonical representative-building documentation",
        url: "docs/sf-canonical-representative-buildings.md",
        sourceType: "repository",
      },
      {
        label: "CTBUH 555 California Street profile",
        url: "https://www.skyscrapercenter.com/building/wd/1027",
        sourceType: "public",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-financial-district-101-california",
    title: "101 California",
    subjectId: "101-california-st",
    subjectName: "101 California St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/101-california-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "class_a_office_tower",
    evidenceTypeLabel: "Class A Office Tower",
    evidenceRole: "transit_oriented_professional_services_benchmark",
    evidenceRoleLabel: "Transit-Oriented Professional Services Benchmark",
    confidence: "source_supported",
    whyItBelongs:
      "101 California shows the practical high-quality middle of Financial District demand. It is polished and recognizable, but its strongest teaching value is transit access, broad professional-service usefulness, and daily workplace function.",
    districtFit:
      "It demonstrates that the Financial District is not only trophy symbolism. It also works because many firms need reliable downtown access, client convenience, and a building that can support professional teams at multiple sizes.",
    typicalCompanies: [
      "law firms",
      "consulting firms",
      "financial-service groups",
      "advisory firms",
      "established technology or business-service teams",
    ],
    typicalUsers: [
      "teams that value transit, client access, efficient floorplates, and a conventional Class A environment without making the strongest possible skyline statement",
    ],
    leasingSituations: [
      "firms comparing polished downtown towers",
      "tenants balancing image against cost",
      "companies weighing central Financial District access against Transbay or SoMa identity",
    ],
    strengths: [
      "central downtown access",
      "transit adjacency",
      "plaza and amenity context",
      "broad professional-service fit",
    ],
    tradeoffs: [
      "May not provide the same flagship signal as 555 California or Salesforce Tower.",
      "May feel too conventional for teams seeking creative-office identity.",
    ],
    nearbyAlternatives: [
      "555 California",
      "345 California Center",
      "One Market",
      "425 Market",
      "Salesforce Tower",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/101-california-st/",
        sourceType: "repository",
      },
      {
        label: "101 California official building site",
        url: "https://101california.com/",
        sourceType: "public",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-financial-district-345-california-center",
    title: "345 California Center",
    subjectId: "345-california-st",
    subjectName: "345 California St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/345-california-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "boutique_leaning_class_a_tower",
    evidenceTypeLabel: "Boutique-Leaning Class A Tower",
    evidenceRole: "executive_benchmark_scale_comparison",
    evidenceRoleLabel: "Executive Benchmark / Scale Comparison",
    confidence: "source_supported",
    whyItBelongs:
      "345 California Center explains the executive-tower choice that sits between large corporate symbolism and more everyday professional-service utility.",
    districtFit:
      "It shows that Financial District users do not all choose the largest or most famous tower. Some need a polished downtown setting with a more focused, boutique-leaning presence.",
    typicalCompanies: [
      "law firms",
      "investment firms",
      "consulting firms",
      "executive-service groups",
      "professional-service teams",
    ],
    typicalUsers: [
      "companies that want high-quality downtown image and client access without defaulting to the largest trophy tower",
    ],
    leasingSituations: [
      "executive-suite comparisons",
      "firms upgrading within the CBD",
      "companies choosing between premium image and efficient central access",
    ],
    strengths: [
      "polished office identity",
      "central Financial District location",
      "executive image",
      "useful comparison against both trophy and mid-market towers",
    ],
    tradeoffs: [
      "May not deliver the same institutional scale as 555 California or the same broad transit utility as 101 California.",
    ],
    nearbyAlternatives: [
      "555 California",
      "101 California",
      "Transamerica Pyramid Center",
      "One Bush Plaza",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/345-california-st/",
        sourceType: "repository",
      },
      {
        label: "345 California Center official site",
        url: "https://www.345cal.com/",
        sourceType: "public",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-financial-district-one-bush-plaza",
    title: "One Bush Plaza / Crown Zellerbach Building",
    subjectId: "1-bush-st",
    subjectName: "1 Bush St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1-bush-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "historic_modernist_office",
    evidenceTypeLabel: "Historic Modernist Office",
    evidenceRole: "architectural_identity_legacy_office_benchmark",
    evidenceRoleLabel: "Architectural Identity / Legacy Office Benchmark",
    confidence: "source_supported",
    whyItBelongs:
      "One Bush Plaza shows the older modernist office layer that helped define San Francisco's downtown before the later trophy-tower era.",
    districtFit:
      "It explains that the Financial District has architectural and market history, not only newer or taller office inventory. It is a useful benchmark for companies that want downtown access with a more distinct building identity.",
    typicalCompanies: [
      "professional-service firms",
      "design-aware business services",
      "financial or advisory teams",
      "client-facing firms that want a central but less generic setting",
    ],
    typicalUsers: [
      "teams that value character, Market Street adjacency, client access, and modernist identity more than maximum tower prestige",
    ],
    leasingSituations: [
      "downtown relocations where building character matters",
      "comparisons between traditional towers and architecturally distinctive office environments",
    ],
    strengths: [
      "architectural recognition",
      "plaza setting",
      "downtown access",
      "character within the CBD",
    ],
    tradeoffs: [
      "May not match the flagship image or amenity package of newer repositioned towers.",
    ],
    nearbyAlternatives: [
      "One Sansome",
      "555 California",
      "345 California Center",
      "140 New Montgomery",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/1-bush-st/",
        sourceType: "repository",
      },
      {
        label: "SOM Crown Zellerbach Headquarters project page",
        url: "https://www.som.com/projects/crown-zellerbach-headquarters/",
        sourceType: "public",
      },
      {
        label: "The Cultural Landscape Foundation One Bush Plaza profile",
        url: "https://www.tclf.org/landscapes/one-bush-plaza",
        sourceType: "public",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-financial-district-transamerica-pyramid-center",
    title: "Transamerica Pyramid Center",
    subjectId: "600-montgomery-st",
    subjectName: "600 Montgomery St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/600-montgomery-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "landmark_tower",
    evidenceTypeLabel: "Landmark Tower",
    evidenceRole: "district_icon_north_downtown_edge",
    evidenceRoleLabel: "District Icon / North Downtown Edge",
    confidence: "source_supported",
    whyItBelongs:
      "Transamerica Pyramid Center explains the role of skyline identity and north-downtown character in a Financial District decision.",
    districtFit:
      "It is one of the clearest visual references for San Francisco's older downtown office core and shows how landmark assets can be repositioned with hospitality, amenities, public space, and cultural programming.",
    typicalCompanies: [
      "executive-service firms",
      "financial firms",
      "creative leadership teams",
      "professional-service companies",
      "firms that benefit from a recognizable San Francisco address",
    ],
    typicalUsers: [
      "teams that want address recognition, client-facing identity, and a north Financial District setting near Jackson Square",
    ],
    leasingSituations: [
      "flagship image searches",
      "comparisons between older landmark prestige and practical transit utility",
      "north-downtown searches where Jackson Square and the Financial District overlap",
    ],
    strengths: [
      "recognizable skyline identity",
      "north-downtown positioning",
      "public-space and amenity relevance",
      "strong comparison value",
    ],
    tradeoffs: [
      "May not be as central to BART-heavy commutes as Market Street towers.",
      "Landmark identity may add cost or formality without improving operations for every company.",
    ],
    nearbyAlternatives: [
      "555 California",
      "One Maritime Plaza",
      "Levi's Plaza",
      "Jackson Square",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/600-montgomery-st/",
        sourceType: "repository",
      },
      {
        label: "Transamerica Pyramid Center official site",
        url: "https://transamericapyramid.com/transamerica-pyramid",
        sourceType: "public",
      },
      {
        label: "Downtown SF Partnership listing",
        url: "https://downtownsf.org/go/transamerica-pyramid",
        sourceType: "public",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-financial-district-one-sansome",
    title: "One Sansome",
    subjectId: "1-sansome-st",
    subjectName: "1 Sansome St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1-sansome-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "repositioned_downtown_tower",
    evidenceTypeLabel: "Repositioned Downtown Tower",
    evidenceRole: "adaptive_reuse_amenity_repositioning_benchmark",
    evidenceRoleLabel: "Adaptive Reuse / Amenity Repositioning Benchmark",
    confidence: "source_supported",
    whyItBelongs:
      "One Sansome explains how older Financial District assets can be repositioned around transit, hospitality, amenities, and lobby-level activity.",
    districtFit:
      "It shows the Financial District adapting to changed office expectations without ceasing to be a CBD environment.",
    typicalCompanies: [
      "professional-service firms",
      "financial services",
      "consulting teams",
      "business-service companies",
      "firms that want transit and amenities in a traditional downtown setting",
    ],
    typicalUsers: [
      "teams that need central access but want a building experience that feels more current than a standard legacy tower",
    ],
    leasingSituations: [
      "relocations from older CBD stock",
      "comparisons between traditional tower utility and amenity repositioning",
      "searches where BART/Muni adjacency matters",
    ],
    strengths: [
      "transit adjacency",
      "amenity investment",
      "active ground-floor and hospitality context",
      "strong bridge between older downtown and modern workplace expectations",
    ],
    tradeoffs: [
      "Repositioning does not change the basic CBD tradeoffs around parking, cost, and formal downtown identity.",
    ],
    nearbyAlternatives: [
      "101 California",
      "One Bush Plaza",
      "345 California Center",
      "SoMa",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/1-sansome-st/",
        sourceType: "repository",
      },
      {
        label: "One Sansome official building site",
        url: "https://www.onesansome.com/",
        sourceType: "public",
      },
      {
        label: "Conservatory at One Sansome site",
        url: "https://www.onesansome.com/conservatory/",
        sourceType: "public",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-financial-district-50-california",
    title: "50 California",
    subjectId: "50-california-st",
    subjectName: "50 California St",
    buildingProfileReference: null,
    buildingProfileStatus: "candidate",
    evidenceType: "institutional_office_tower",
    evidenceTypeLabel: "Institutional Office Tower",
    evidenceRole: "embarcadero_facing_professional_services_benchmark",
    evidenceRoleLabel: "Embarcadero-Facing Professional Services Benchmark",
    confidence: "source_supported",
    whyItBelongs:
      "50 California explains the Embarcadero-facing office decision: a traditional CBD tower with strong access to the waterfront side of downtown.",
    districtFit:
      "It shows how the Financial District connects Market Street office demand with the Embarcadero, Ferry Building, and regional transit patterns.",
    typicalCompanies: [
      "law firms",
      "finance",
      "consulting",
      "corporate services",
      "insurance",
      "accounting",
      "regional business-service firms",
    ],
    typicalUsers: [
      "companies that want a conventional professional-services tower with waterfront-side access and a less purely symbolic role than the landmark towers",
    ],
    leasingSituations: [
      "CBD renewals",
      "professional-service relocations",
      "comparisons between Embarcadero access and central Montgomery/Market positioning",
    ],
    strengths: [
      "institutional office identity",
      "Embarcadero adjacency",
      "tower floorplates",
      "transit and waterfront context",
    ],
    tradeoffs: [
      "May not have the same distinct brand signal as 555 California, Transamerica Pyramid Center, or Salesforce Tower.",
    ],
    nearbyAlternatives: [
      "101 California",
      "Two Embarcadero Center",
      "100 Pine",
      "South Financial District options",
    ],
    publicSources: [
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
      {
        label: "50 California official site",
        url: "https://www.50cal.com/",
        sourceType: "public",
      },
      {
        label: "50 California tenant handbook",
        url: "https://tenants.50cal.com/tenant-handbook-new/building-operations/building-management-office",
        sourceType: "public",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-financial-district-100-pine",
    title: "100 Pine",
    subjectId: "100-pine-st",
    subjectName: "100 Pine St",
    buildingProfileReference: null,
    buildingProfileStatus: "candidate",
    evidenceType: "professional_services_tower",
    evidenceTypeLabel: "Professional Services Tower",
    evidenceRole: "practical_mid_market_cbd_benchmark",
    evidenceRoleLabel: "Practical Mid-Market CBD Benchmark",
    confidence: "source_supported",
    whyItBelongs:
      "100 Pine prevents the evidence set from becoming only trophy or landmark assets. It represents the durable professional-service office inventory many tenants actually compare.",
    districtFit:
      "It shows the Financial District as a practical office market for established firms that need downtown access and credible space without necessarily paying for the strongest address signal.",
    typicalCompanies: [
      "professional services",
      "finance",
      "consulting",
      "accounting",
      "legal services",
      "regional offices",
      "business services",
    ],
    typicalUsers: [
      "companies that care about client access, transit, and functional downtown office space more than skyline identity",
    ],
    leasingSituations: [
      "cost-sensitive CBD searches",
      "renewals from nearby towers",
      "firms comparing polished but non-trophy inventory",
    ],
    strengths: [
      "professional-service fit",
      "central district relevance",
      "practical comparison value",
      "amenity and transit context",
    ],
    tradeoffs: [
      "Less symbolic than the district's landmark towers and less culturally distinct than Jackson Square or SoMa alternatives.",
    ],
    nearbyAlternatives: [
      "44 Montgomery",
      "50 California",
      "101 California",
    ],
    publicSources: [
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
      {
        label: "100 Pine official building site",
        url: "https://100pine.com/",
        sourceType: "public",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-financial-district-two-embarcadero-center",
    title: "Two Embarcadero Center",
    subjectId: "2-embarcadero-ctr",
    subjectName: "2 Embarcadero Ctr",
    buildingProfileReference: null,
    buildingProfileStatus: "candidate",
    evidenceType: "mixed_use_commercial_center",
    evidenceTypeLabel: "Mixed-Use Commercial Center",
    evidenceRole: "district_anchor_waterfront_edge",
    evidenceRoleLabel: "District Anchor / Waterfront Edge",
    confidence: "source_supported",
    whyItBelongs:
      "Two Embarcadero Center explains that the Financial District is also a mixed-use office and retail environment connected to the waterfront.",
    districtFit:
      "It helps show the district's office population, retail services, hotel adjacency, and waterfront access operating as a business environment rather than as a single tower.",
    typicalCompanies: [
      "professional-service firms",
      "finance",
      "corporate teams",
      "firms hosting clients or executives near the waterfront side of downtown",
    ],
    typicalUsers: [
      "teams that want downtown office presence plus easier access to restaurants, hotels, transit, ferry, and waterfront amenities",
    ],
    leasingSituations: [
      "office searches where employee and visitor experience matter",
      "companies comparing tower-only buildings with mixed-use commercial centers",
    ],
    strengths: [
      "mixed-use setting",
      "waterfront adjacency",
      "restaurants and services",
      "district-anchoring value",
      "useful retail-office interaction",
    ],
    tradeoffs: [
      "May feel less focused than a standalone tower.",
      "Users should validate exact building, floorplate, access, and parking needs within the larger complex.",
    ],
    nearbyAlternatives: [
      "50 California",
      "One Maritime Plaza",
      "Ferry Building and Embarcadero-adjacent environments",
    ],
    publicSources: [
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
      {
        label: "Embarcadero Center official site",
        url: "https://embarcaderocenter.com/visit/",
        sourceType: "public",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-financial-district-one-maritime-plaza",
    title: "One Maritime Plaza",
    subjectId: "300-clay-st",
    subjectName: "300 Clay St",
    buildingProfileReference: null,
    buildingProfileStatus: "candidate",
    evidenceType: "landmark_waterfront_edge_office",
    evidenceTypeLabel: "Landmark / Waterfront-Edge Office",
    evidenceRole: "north_financial_district_edge_comparison_example",
    evidenceRoleLabel: "North Financial District Edge / Comparison Example",
    confidence: "source_supported",
    whyItBelongs:
      "One Maritime Plaza explains the northern Financial District edge where office tower identity, waterfront proximity, and Jackson Square adjacency overlap.",
    districtFit:
      "It gives users a way to understand that the Financial District changes as it approaches Jackson Square and the waterfront. Not every Financial District decision is a Market Street tower decision.",
    typicalCompanies: [
      "professional services",
      "finance",
      "executive-service firms",
      "advisory teams",
      "companies that value distinctive architecture and north-downtown access",
    ],
    typicalUsers: [
      "teams comparing formal Financial District utility with a more architectural, waterfront-adjacent, north-edge setting",
    ],
    leasingSituations: [
      "north Financial District searches",
      "companies comparing Transamerica Pyramid Center, Jackson Square, Levi's Plaza, and traditional CBD towers",
    ],
    strengths: [
      "distinctive architecture",
      "north-downtown identity",
      "waterfront proximity",
      "efficient comparison value",
    ],
    tradeoffs: [
      "May not provide the same central-transit simplicity as Market Street towers or the same intimate boutique feel as Jackson Square.",
    ],
    nearbyAlternatives: [
      "Transamerica Pyramid Center",
      "Levi's Plaza",
      "50 California",
      "Jackson Square",
    ],
    publicSources: [
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
      {
        label: "One Maritime Plaza official building site",
        url: "https://www.onemaritimeplaza.com/building",
        sourceType: "public",
      },
      {
        label: "SOM One Maritime Plaza project page",
        url: "https://www.som.com/projects/one-maritime-plaza/",
        sourceType: "public",
      },
    ],
  }),
];

module.exports = {
  schemaVersion: "commercial-market-evidence-v1",
  collectionId: "sf-financial-district-commercial-market-evidence",
  collectionType: "district_commercial_market_evidence",
  status: "production_pilot",
  district,
  districtNarrative: {
    whyItExists:
      "The Financial District exists because San Francisco developed a dense downtown office core where regional transit, client-facing business services, finance, law, consulting, executive meetings, hotels, restaurants, and civic infrastructure cluster within walking distance.",
    strongestWhen: [
      "a company benefits from being easy to reach by BART, Muni, ferry, and downtown walking routes",
      "clients or partners visit the office",
      "the business needs a formal address signal",
      "leadership wants access to the deepest concentration of traditional San Francisco office infrastructure",
    ],
    weakerWhen: [
      "a company needs creative warehouse character",
      "a company needs campus-style expansion",
      "a company needs life-science adjacency",
      "heavy parking or industrial utility is central to the requirement",
      "a neighborhood identity that feels less formal than the downtown core is more important than CBD credibility",
    ],
  },
  naturalBusinessFit: {
    fits: [
      "financial-services firms",
      "law firms",
      "consulting firms",
      "corporate headquarters and regional offices",
      "investor, advisory, and executive-service teams",
      "professional-service firms with visiting clients",
      "companies that need downtown transit access and formal business credibility",
      "service retail and food uses supported by weekday office population",
    ],
    lessNaturalFor: [
      "companies that need warehouse, loading, yard, or production space",
      "life-science users that need lab infrastructure",
      "creative teams that prioritize warehouse character over client image",
      "parking-sensitive businesses",
      "consumer retail that depends primarily on evening or weekend neighborhood traffic",
      "early-stage teams that need maximum flexibility more than address signal",
    ],
  },
  qualityStandard:
    "A strong Commercial Market Evidence collection explains distinct commercial decisions through source-supported examples. Quality, role diversity, and comparison value matter more than count.",
  records,
  deferredCandidates: [
    {
      title: "44 Montgomery",
      reason:
        "Useful practical tower, but 100 Pine and 50 California already cover the non-trophy professional-services layer in this bounded set.",
    },
    {
      title: "425 Market",
      reason:
        "Useful South Financial District bridge, but it belongs in a later South Financial District / Transbay comparison collection.",
    },
    {
      title: "One Market",
      reason:
        "Important Embarcadero and South Financial District edge record, but it should be handled with the South Financial District rather than treated as core Financial District evidence here.",
    },
    {
      title: "580 California",
      reason:
        "Potentially useful for broader tower variety, but this reference collection already has enough central and north-downtown tower evidence.",
    },
    {
      title: "Additional Embarcadero Center buildings",
      reason:
        "Useful for complex-level follow-up, not needed for the first district standard.",
    },
  ],
};
