const district = {
  metroId: "san-francisco",
  metroName: "San Francisco",
  cityId: "san-francisco",
  cityName: "San Francisco",
  districtId: "jackson-square",
  districtName: "Jackson Square",
  districtPath: "/commercial-real-estate/CA/san-francisco/jackson-square/",
  primaryEcosystem: "office",
  secondaryEcosystems: ["retail"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "financial-district",
    districtName: "Financial District",
    relationship:
      "The Financial District is the stronger comparison when formal CBD scale, central transit, larger towers, and traditional corporate services matter more than historic boutique character.",
  },
  {
    districtId: "soma",
    districtName: "SoMa",
    relationship:
      "SoMa is the stronger comparison when larger adaptive-reuse formats, technology identity, production-adjacent uses, or a more flexible creative-office market are more important than executive polish.",
  },
  {
    districtId: "mission-bay",
    districtName: "Mission Bay",
    relationship:
      "Mission Bay is the stronger comparison when newer buildings, institutional innovation anchors, health care, life science, or campus-style growth capacity drive the location decision.",
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
    id: "sf-jackson-square-levis-plaza",
    title: "Levi's Plaza",
    subjectId: "1105-battery-st",
    subjectName: "1105 Battery St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1105-battery-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "low_rise_office_campus",
    evidenceTypeLabel: "Low-Rise Office Campus",
    evidenceRole: "district_anchor_campus_benchmark",
    evidenceRoleLabel: "District Anchor / Campus Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Levi's Plaza is the clearest example of Jackson Square as a calmer, lower-rise office environment rather than a conventional downtown tower district.",
    districtFit:
      "It shows why companies choose the district for historic texture, waterfront proximity, and campus-like workplace character while remaining close to the Financial District.",
    typicalCompanies: [
      "brand companies",
      "creative firms",
      "executive teams",
      "professional-service groups",
      "companies seeking a distinctive north-downtown address",
    ],
    typicalUsers: [
      "teams that want downtown adjacency, client credibility, and a quieter campus-like setting instead of a high-rise tower identity",
    ],
    leasingSituations: [
      "companies comparing Financial District towers with lower-rise north-downtown alternatives",
      "brand or creative-office searches where arrival experience and neighborhood character matter",
    ],
    strengths: [
      "district-anchoring identity",
      "low-rise campus feel",
      "waterfront adjacency",
      "historic north-downtown character",
      "strong comparison value against tower options",
    ],
    tradeoffs: [
      "May not offer the same central-transit simplicity, tower visibility, or large contiguous expansion path as core Financial District alternatives.",
    ],
    nearbyAlternatives: [
      "1000 Sansome",
      "901 Battery",
      "One Maritime Plaza",
      "Transamerica Pyramid Center",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/1105-battery-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-jackson-square-1000-sansome",
    title: "1000 Sansome",
    subjectId: "1000-sansome-st",
    subjectName: "1000 Sansome St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1000-sansome-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "historic_creative_office",
    evidenceTypeLabel: "Historic Creative Office",
    evidenceRole: "brick_and_timber_character_benchmark",
    evidenceRoleLabel: "Brick-and-Timber Character Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "1000 Sansome explains the brick-and-timber office character that makes Jackson Square commercially different from the Financial District tower core.",
    districtFit:
      "It represents the district's smaller-scale historic workspace pattern, where character, walkability, and client-facing authenticity can matter more than large floorplate efficiency.",
    typicalCompanies: [
      "design studios",
      "creative agencies",
      "boutique professional-service firms",
      "investor teams",
      "founder-led companies",
    ],
    typicalUsers: [
      "teams that want historic commercial space with enough downtown proximity for clients, partners, and employee access",
    ],
    leasingSituations: [
      "boutique office searches that need more character than conventional Class A towers",
      "companies evaluating historic workspace against SoMa creative-office alternatives",
    ],
    strengths: [
      "historic commercial texture",
      "creative-office signal",
      "walkable north-downtown setting",
      "clear district teaching value",
    ],
    tradeoffs: [
      "Older historic stock can require closer validation of suite condition, accessibility, loading, expansion capacity, and modern workplace infrastructure.",
    ],
    nearbyAlternatives: [
      "901 Battery",
      "924 Sansome",
      "Levi's Plaza",
      "SoMa creative-office buildings",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/1000-sansome-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-jackson-square-901-battery",
    title: "901 Battery",
    subjectId: "901-battery-st",
    subjectName: "901 Battery St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/901-battery-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "creative_mid_rise_office",
    evidenceTypeLabel: "Creative Mid-Rise Office",
    evidenceRole: "creative_professional_services_benchmark",
    evidenceRoleLabel: "Creative / Professional Services Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "901 Battery helps explain the district's appeal to creative, design, brand, and boutique professional firms that want a polished but less formal downtown setting.",
    districtFit:
      "It sits in the character-driven office layer between Levi's Plaza scale and smaller historic Sansome or Montgomery buildings, making it useful for comparing tenant identity choices.",
    typicalCompanies: [
      "creative agencies",
      "brand teams",
      "design firms",
      "boutique finance",
      "professional-service firms",
    ],
    typicalUsers: [
      "companies that need a credible downtown-adjacent office but want the workplace to feel more distinctive than a conventional tower suite",
    ],
    leasingSituations: [
      "mid-sized boutique office searches",
      "creative and professional-service teams comparing Jackson Square with SoMa and the Financial District",
    ],
    strengths: [
      "creative-office relevance",
      "historic neighborhood context",
      "mid-rise scale",
      "balanced executive and creative signal",
    ],
    tradeoffs: [
      "The setting can be less efficient for companies that need heavy transit volume, large continuous floors, or a more institutional address signal.",
    ],
    nearbyAlternatives: [
      "1000 Sansome",
      "930 Montgomery",
      "75 Broadway",
      "Levi's Plaza",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/901-battery-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-jackson-square-930-montgomery",
    title: "930 Montgomery",
    subjectId: "930-montgomery-st",
    subjectName: "930 Montgomery St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/930-montgomery-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "boutique_executive_office",
    evidenceTypeLabel: "Boutique Executive Office",
    evidenceRole: "client_facing_professional_services_benchmark",
    evidenceRoleLabel: "Client-Facing Professional Services Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "930 Montgomery represents the client-facing executive side of Jackson Square, where smaller firms use historic character as part of the business signal.",
    districtFit:
      "It shows how the district can serve professional users that want a polished address near downtown without adopting the hierarchy or scale of a tower environment.",
    typicalCompanies: [
      "investment firms",
      "law boutiques",
      "advisory firms",
      "architecture and design practices",
      "client-facing professional services",
    ],
    typicalUsers: [
      "principals, partners, and leadership teams that host clients and want a more personal office environment than a CBD tower",
    ],
    leasingSituations: [
      "small and mid-sized executive-office searches",
      "firms weighing Jackson Square image against Financial District formality",
    ],
    strengths: [
      "boutique professional image",
      "historic street character",
      "close Financial District adjacency",
      "strong client-meeting context",
    ],
    tradeoffs: [
      "May be less suitable for teams that expect institutional tower amenities, deep parking options, or straightforward expansion into larger contiguous space.",
    ],
    nearbyAlternatives: [
      "901 Battery",
      "75 Broadway",
      "650 California",
      "Transamerica Pyramid Center",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/930-montgomery-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-jackson-square-75-broadway",
    title: "75 Broadway",
    subjectId: "75-broadway",
    subjectName: "75 Broadway",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/75-broadway/",
    buildingProfileStatus: "migrated",
    evidenceType: "small_format_historic_office",
    evidenceTypeLabel: "Small-Format Historic Office",
    evidenceRole: "broadway_north_beach_transition_benchmark",
    evidenceRoleLabel: "Broadway / North Beach Transition Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "75 Broadway explains the smaller-format office stock and northern transition that keep Jackson Square distinct from both the Financial District and North Beach.",
    districtFit:
      "It captures the district's intimate commercial scale, where proximity to restaurants, historic blocks, and downtown clients can outweigh the need for large modern office plates.",
    typicalCompanies: [
      "boutique professional services",
      "creative firms",
      "small investor teams",
      "design-led companies",
      "relationship-driven advisory practices",
    ],
    typicalUsers: [
      "smaller teams that want walkable downtown access, a memorable neighborhood setting, and office space that feels personal rather than corporate",
    ],
    leasingSituations: [
      "small office searches near North Beach and the downtown edge",
      "tenant comparisons between boutique Jackson Square space and more conventional Financial District suites",
    ],
    strengths: [
      "small-format office identity",
      "historic district character",
      "restaurant and client-meeting context",
      "clear northern edge comparison value",
    ],
    tradeoffs: [
      "The Broadway edge may feel less central for transit-heavy teams and may not provide the institutional infrastructure of larger CBD buildings.",
    ],
    nearbyAlternatives: [
      "930 Montgomery",
      "924 Sansome",
      "1000 Sansome",
      "North Beach-adjacent office options",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/75-broadway/",
        sourceType: "repository",
      },
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-jackson-square-924-sansome",
    title: "924 Sansome",
    subjectId: "924-sansome-st",
    subjectName: "924 Sansome St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/924-sansome-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "adaptive_reuse_boutique_office",
    evidenceTypeLabel: "Adaptive-Reuse Boutique Office",
    evidenceRole: "small_format_character_infill_benchmark",
    evidenceRoleLabel: "Small-Format Character Infill Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "924 Sansome is a compact example of the older commercial building pattern that gives Jackson Square its creative and boutique-office usefulness.",
    districtFit:
      "It demonstrates that some of the district's most important evidence is not landmark scale, but the recurring texture of smaller historic buildings that shape tenant fit.",
    typicalCompanies: [
      "creative studios",
      "small professional-service firms",
      "founder-led companies",
      "design and brand groups",
      "boutique advisory teams",
    ],
    typicalUsers: [
      "teams that value character, location, and a distinctive office experience more than institutional amenities or large expansion capacity",
    ],
    leasingSituations: [
      "small-suite searches",
      "companies comparing Jackson Square's older stock with SoMa adaptive reuse or Financial District tower suites",
    ],
    strengths: [
      "adaptive reuse signal",
      "older commercial texture",
      "boutique scale",
      "strong role diversity inside the collection",
    ],
    tradeoffs: [
      "Users should validate building systems, accessibility, elevator service, and suite configuration because smaller historic buildings vary meaningfully by asset.",
    ],
    nearbyAlternatives: [
      "1000 Sansome",
      "75 Broadway",
      "901 Battery",
      "SoMa adaptive-reuse inventory",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/924-sansome-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-jackson-square-650-california",
    title: "650 California",
    subjectId: "650-california-st",
    subjectName: "650 California St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/650-california-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "tower_edge_executive_office",
    evidenceTypeLabel: "Tower-Edge Executive Office",
    evidenceRole: "financial_district_edge_comparison_benchmark",
    evidenceRoleLabel: "Financial District Edge Comparison Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "650 California helps define the edge condition where Jackson Square's character-driven office market meets more formal Financial District and Nob Hill-oriented tower inventory.",
    districtFit:
      "It gives tenants a practical comparison for searches that like Jackson Square's north-downtown identity but still need more conventional office scale and executive presence.",
    typicalCompanies: [
      "professional-service firms",
      "investment teams",
      "corporate offices",
      "executive teams",
      "advisory groups",
    ],
    typicalUsers: [
      "companies deciding whether the search is really a Jackson Square character decision or a more conventional north Financial District office decision",
    ],
    leasingSituations: [
      "edge-of-district comparisons",
      "client-facing office searches that need more scale than the smallest Jackson Square buildings provide",
    ],
    strengths: [
      "executive presence",
      "north-downtown positioning",
      "comparison value against Transamerica and Financial District towers",
      "more conventional office scale",
    ],
    tradeoffs: [
      "It can dilute the pure Jackson Square character story and may feel closer to a Financial District tower decision than a boutique neighborhood choice.",
    ],
    nearbyAlternatives: [
      "930 Montgomery",
      "Transamerica Pyramid Center",
      "One Maritime Plaza",
      "555 California",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/650-california-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-jackson-square-the-ice-house",
    title: "The Ice House",
    subjectId: "151-union-st",
    subjectName: "151 Union St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/151-union-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "historic_adaptive_reuse_office",
    evidenceTypeLabel: "Historic Adaptive-Reuse Office",
    evidenceRole: "north_waterfront_design_character_benchmark",
    evidenceRoleLabel: "North Waterfront / Design Character Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "The Ice House explains the historic adaptive-reuse and design-oriented side of Jackson Square near the north waterfront edge.",
    districtFit:
      "It broadens the collection beyond conventional office buildings by showing how warehouse character, design culture, and waterfront proximity shape district identity.",
    typicalCompanies: [
      "design firms",
      "creative studios",
      "architecture practices",
      "brand companies",
      "specialized professional-service users",
    ],
    typicalUsers: [
      "teams that want historic adaptive-reuse character and a stronger design-market signal than a standard downtown office suite provides",
    ],
    leasingSituations: [
      "creative-office searches near the north waterfront",
      "comparisons between Jackson Square, Design District, and SoMa adaptive-reuse environments",
    ],
    strengths: [
      "historic adaptive-reuse character",
      "design-oriented identity",
      "north waterfront relationship",
      "differentiates the district from tower inventory",
    ],
    tradeoffs: [
      "The location and format may be less useful for conventional corporate users that prioritize central transit, standardized amenities, or broad expansion options.",
    ],
    nearbyAlternatives: [
      "Levi's Plaza",
      "1000 Sansome",
      "San Francisco Design Center",
      "SoMa creative-office buildings",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/151-union-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
    ],
  }),
];

module.exports = {
  schemaVersion: "commercial-market-evidence-v1",
  collectionId: "sf-jackson-square-commercial-market-evidence",
  collectionType: "district_commercial_market_evidence",
  status: "production_reference",
  district,
  districtNarrative: {
    whyItExists:
      "Jackson Square exists as San Francisco's historic north-downtown office alternative: close enough to the Financial District for clients and executive access, but defined by smaller buildings, brick-and-timber character, restaurants, waterfront proximity, and a more personal business setting.",
    strongestWhen: [
      "a company wants a polished client-facing address without a formal tower environment",
      "historic character and neighborhood identity help recruit or communicate brand taste",
      "leadership values walkability to downtown, North Beach, the waterfront, and client restaurants",
      "the search favors smaller office requirements over large contiguous expansion paths",
    ],
    weakerWhen: [
      "the company needs large modern floorplates or a campus expansion path",
      "central BART and Market Street transit access are the primary decision drivers",
      "institutional tower amenities and formal address signaling matter more than neighborhood character",
      "parking, loading, production, or specialized infrastructure needs are central to the requirement",
    ],
  },
  naturalBusinessFit: {
    fits: [
      "boutique professional-service firms",
      "venture and investor teams",
      "design and brand companies",
      "architecture and creative studios",
      "executive teams that host clients",
      "founder-led companies seeking north-downtown character",
      "selective restaurants and service retail supported by office users and destination foot traffic",
    ],
    lessNaturalFor: [
      "large headquarters requiring broad contiguous expansion",
      "warehouse, loading, yard, or production users",
      "life-science users that need lab infrastructure",
      "parking-sensitive customer operations",
      "consumer retail that depends primarily on regional parking or large-format visibility",
      "teams that need maximum cost efficiency more than address character",
    ],
  },
  qualityStandard:
    "A strong Jackson Square Commercial Market Evidence collection explains the district's character-driven office logic without treating every historic building as interchangeable. The collection must show role diversity, comparison value, tenant fit, and clear tradeoffs against Financial District, SoMa, and Mission Bay alternatives.",
  records,
  deferredCandidates: [
    {
      title: "Transamerica Pyramid Center",
      reason:
        "Important to the Jackson Square edge, but it is already covered in the Financial District reference collection and should remain a comparison anchor rather than a duplicate core Jackson Square record.",
    },
    {
      title: "One Maritime Plaza",
      reason:
        "Useful north Financial District and waterfront-edge comparison, but the Financial District collection already uses it to explain the boundary condition.",
    },
    {
      title: "Additional small historic Jackson Square buildings",
      reason:
        "Likely useful for future depth, but this bounded v1 collection already establishes the district's major office roles without over-indexing on similar small-format records.",
    },
    {
      title: "Restaurant and destination retail anchors",
      reason:
        "Important for experience readiness and tenant fit, but should become a later non-building evidence expansion rather than dilute this first source-data collection.",
    },
  ],
};
