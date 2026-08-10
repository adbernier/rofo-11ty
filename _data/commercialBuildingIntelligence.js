const sacramentoIndustrialFlexBuildingBriefs = require("./sacramentoIndustrialFlexBuildingBriefs.js");
const denverIndustrialFlexBuildingBriefs = require("./denverIndustrialFlexBuildingBriefs.js");
const denverEcosystemBalanceBuildingBriefs = require("./denverEcosystemBalanceBuildingBriefs.js");
const auroraIndustrialFlexBuildingBriefs = require("./auroraIndustrialFlexBuildingBriefs.js");
const auroraMedicalBuildingBriefs = require("./auroraMedicalBuildingBriefs.js");
const invernessOfficeBuildingBriefs = require("./invernessOfficeBuildingBriefs.js");
const indianapolisTempeIndustrialFlexBuildingBriefs = require("./indianapolisTempeIndustrialFlexBuildingBriefs.js");
const seattleOfficeBuildingBriefs = require("./seattleOfficeBuildingBriefs.js");
const sanFranciscoIndustrialFlexBuildingBriefs = require("./sanFranciscoIndustrialFlexBuildingBriefs.js");

const CITY = "San Francisco";
const STATE = "CA";
const CITY_SLUG = "san-francisco";

function clean(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildingPath(address) {
  return `/commercial-real-estate/building/${STATE}/${CITY_SLUG}/${slugify(address)}/`;
}

function district(id, name, slug) {
  return {
    id,
    name,
    slug,
    city: CITY,
    state_abbr: STATE,
    area_type: "district",
    path: `/commercial-real-estate/${STATE}/${CITY_SLUG}/${slug}/`,
  };
}

const districts = {
  financialDistrict: district("sf-financial-district", "Financial District", "financial-district"),
  soma: district("sf-soma", "SoMa", "soma"),
  missionBay: district("sf-mission-bay", "Mission Bay", "mission-bay"),
  jacksonSquare: district("sf-jackson-square", "Jackson Square", "jackson-square"),
  dogpatch: district("sf-dogpatch", "Dogpatch", "dogpatch"),
  designDistrict: district("sf-design-district", "Design District", "design-district"),
  showplaceSquare: district("sf-showplace-square", "Showplace Square", "showplace-square"),
  southBeach: district("sf-south-beach", "South Beach", "south-beach"),
  potreroHill: district("sf-potrero-hill", "Potrero Hill", "potrero-hill"),
  missionDistrict: district("sf-mission-district", "Mission District", "mission-district"),
};

const handbookTopics = [
  {
    title: "Choosing the Right Commercial Location",
    url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/",
    summary: "Use location fit, access, customers, employees, and operations before narrowing the building list.",
  },
  {
    title: "How to Compare Commercial Spaces",
    url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/",
    summary: "Compare buildings by business fit, total occupancy cost, operations, buildout, and future flexibility.",
  },
  {
    title: "Tenant Improvements",
    url: "/commercial-real-estate/lease-guide/tenant-improvements/",
    summary: "Understand buildout scope, timing, landlord contributions, and what to validate before leasing.",
  },
];

const districtDefaults = {
  financialDistrict: {
    businessFit: ["professional services", "finance", "law", "corporate headquarters"],
    idealCompanyProfiles: [
      "Professional-service, finance, legal, consulting, and executive teams that value client access and downtown image",
      "Companies that need strong transit access and a recognizable central San Francisco address",
    ],
    companySizes: ["small executive teams", "mid-sized firms", "larger corporate users"],
    workplaceCharacter: "Downtown office environment with traditional towers, transit access, and client-facing business services.",
    neighborhoodCharacter: "Dense, transit-served business core with strong weekday professional-service activity.",
    executivePresence: "high",
    innovationScore: "moderate",
    transit: "Strong BART, Muni, ferry, and regional transit access depending on the exact address.",
    parking: "Parking is typically structured, costly, and less convenient than suburban or edge districts.",
    amenities: "Restaurants, hotels, professional services, conference space, and waterfront access are nearby in many locations.",
    foodEnvironment: "Strong weekday lunch and client-meeting environment, with variation by block.",
    lessSuitableFor: [
      "Teams that need low-cost expansion space or heavy parking",
      "Production, maker, lab, or industrial users with specialized operating requirements",
    ],
    relatedDistricts: ["/commercial-real-estate/CA/san-francisco/jackson-square/", "/commercial-real-estate/CA/san-francisco/soma/", "/commercial-real-estate/CA/san-francisco/south-beach/"],
  },
  soma: {
    businessFit: ["technology", "startup", "creative office", "professional services"],
    idealCompanyProfiles: [
      "Technology, creative, and professional teams comparing startup-friendly buildings with larger modern offices",
      "Companies that value Caltrain, Transbay, downtown proximity, and a less traditional office identity",
    ],
    companySizes: ["early-stage teams", "growth-stage companies", "large technology users"],
    workplaceCharacter: "Mix of converted industrial buildings, mid-rise creative offices, and modern Class A towers.",
    neighborhoodCharacter: "Urban, mixed-use, and varied by subarea; the building choice matters as much as the district label.",
    executivePresence: "medium",
    innovationScore: "high",
    transit: "Strong access around Transbay, Market Street, and Caltrain; weaker in some interior blocks.",
    parking: "Parking can be constrained and expensive, especially near core transit and event areas.",
    amenities: "Food, hotels, event venues, and downtown services vary significantly by micro-location.",
    foodEnvironment: "Good in central and Transbay-adjacent locations; more uneven around production-oriented edges.",
    lessSuitableFor: [
      "Businesses that need a traditional executive district or easy visitor parking",
      "Teams that need predictable neighborhood consistency across every block",
    ],
    relatedDistricts: ["/commercial-real-estate/CA/san-francisco/mission-bay/", "/commercial-real-estate/CA/san-francisco/financial-district/", "/commercial-real-estate/CA/san-francisco/showplace-square/"],
  },
  missionBay: {
    businessFit: ["life science", "technology", "healthcare", "innovation"],
    idealCompanyProfiles: [
      "Life-science, healthcare, technology, and innovation companies that benefit from newer buildings and institutional adjacency",
      "Growth-stage teams that want a campus-like district rather than a traditional downtown tower",
    ],
    companySizes: ["growth-stage companies", "larger users", "research-oriented teams"],
    workplaceCharacter: "Newer office, lab, institutional, and mixed-use buildings with larger-format planning.",
    neighborhoodCharacter: "Planned, modern, and campus-like, with UCSF, healthcare, arena, and waterfront anchors.",
    executivePresence: "medium",
    innovationScore: "high",
    transit: "Strong light-rail and regional access near Caltrain, with transit experience depending on exact location.",
    parking: "Better structured parking options than some core districts, though not suburban.",
    amenities: "Modern campus amenities, arena activity, waterfront access, UCSF, and newer residential support services.",
    foodEnvironment: "Improving but less organically dense than older downtown districts.",
    lessSuitableFor: [
      "Companies that need traditional Financial District image or older neighborhood character",
      "Businesses that rely on dense street retail or walk-in customer traffic",
    ],
    relatedDistricts: ["/commercial-real-estate/CA/san-francisco/dogpatch/", "/commercial-real-estate/CA/san-francisco/soma/", "/commercial-real-estate/CA/san-francisco/south-beach/"],
  },
  jacksonSquare: {
    businessFit: ["professional services", "executive office", "creative", "finance"],
    idealCompanyProfiles: [
      "Executive, investment, law, design, and boutique professional firms that want character without leaving the downtown orbit",
      "Client-facing teams comparing prestige, walkability, and neighborhood texture",
    ],
    companySizes: ["small executive teams", "boutique firms", "select mid-sized users"],
    workplaceCharacter: "Low-rise historic, campus, boutique, and north-downtown edge buildings.",
    neighborhoodCharacter: "Walkable, character-rich, and quieter than the Market Street tower core.",
    executivePresence: "high",
    innovationScore: "medium",
    transit: "Reasonable access to downtown transit, but often less direct than the core Financial District.",
    parking: "Parking is constrained and should be validated early for client-facing firms.",
    amenities: "Restaurants, waterfront access, North Beach, and executive-service amenities are nearby.",
    foodEnvironment: "Strong client-meeting and executive lunch environment.",
    lessSuitableFor: [
      "Large users that need broad contiguous floorplates",
      "Teams prioritizing direct BART access or very large modern towers",
    ],
    relatedDistricts: ["/commercial-real-estate/CA/san-francisco/financial-district/", "/commercial-real-estate/CA/san-francisco/soma/"],
  },
  dogpatch: {
    businessFit: ["creative office", "life science", "production", "flex", "maker"],
    idealCompanyProfiles: [
      "Creative, maker, office/R&D, and life-science-adjacent teams that value industrial character and Mission Bay adjacency",
      "Companies willing to trade traditional downtown image for more flexible buildings and neighborhood identity",
    ],
    companySizes: ["small production teams", "growth companies", "larger future campus users"],
    workplaceCharacter: "Industrial reuse, waterfront redevelopment, maker spaces, and emerging office/R&D buildings.",
    neighborhoodCharacter: "Lower-rise, industrial, creative, and changing quickly around Pier 70 and Power Station.",
    executivePresence: "low",
    innovationScore: "high",
    transit: "Light-rail and Mission Bay adjacency help, but block-by-block access should be validated.",
    parking: "Often easier than the downtown core, but specific building supply varies widely.",
    amenities: "Maker, food, waterfront, arena, and Mission Bay amenities shape the district experience.",
    foodEnvironment: "Local and improving, but less dense than older central districts.",
    lessSuitableFor: [
      "Firms that require a traditional corporate address",
      "Users that need immediate dense downtown transit or client-service amenities",
    ],
    relatedDistricts: ["/commercial-real-estate/CA/san-francisco/mission-bay/", "/commercial-real-estate/CA/san-francisco/potrero-hill/", "/commercial-real-estate/CA/san-francisco/showplace-square/"],
  },
  designDistrict: {
    businessFit: ["design", "showroom", "creative office", "production"],
    idealCompanyProfiles: [
      "Design, showroom, creative, and production-adjacent businesses that benefit from the district's trade identity",
      "Companies comparing warehouse character, client showrooms, and operational flexibility",
    ],
    companySizes: ["small firms", "showrooms", "mid-sized creative teams"],
    workplaceCharacter: "Showroom, adaptive reuse, creative office, and production-adjacent buildings.",
    neighborhoodCharacter: "Design-led commercial district with practical access to SoMa, Potrero, and Mission Bay.",
    executivePresence: "medium",
    innovationScore: "medium",
    transit: "Regional transit is less direct than SoMa, so commute patterns need validation.",
    parking: "Often more practical than the downtown core, but building-specific.",
    amenities: "Showrooms, design trade services, food, and production-adjacent services support the district.",
    foodEnvironment: "Adequate but more work-focused than destination dining.",
    lessSuitableFor: [
      "Companies that need immediate BART access or a conventional downtown image",
      "Very large corporate users that need tower-style buildings",
    ],
    relatedDistricts: ["/commercial-real-estate/CA/san-francisco/showplace-square/", "/commercial-real-estate/CA/san-francisco/soma/", "/commercial-real-estate/CA/san-francisco/potrero-hill/"],
  },
  showplaceSquare: {
    businessFit: ["creative office", "technology", "AI", "design", "production"],
    idealCompanyProfiles: [
      "Creative, AI, robotics, design, and technology teams comparing brick-and-timber character with practical access",
      "Companies that want a more flexible environment than downtown towers but more centrality than outer industrial areas",
    ],
    companySizes: ["growth-stage companies", "mid-sized creative teams", "larger technology users"],
    workplaceCharacter: "Brick-and-timber, adaptive reuse, creative office, and production-adjacent buildings.",
    neighborhoodCharacter: "Bridge between SoMa, Design District, and Potrero Hill with a strong creative-commercial identity.",
    executivePresence: "medium",
    innovationScore: "high",
    transit: "Caltrain and SoMa access are useful, but last-mile details vary by building.",
    parking: "Usually more workable than downtown but should be validated by building.",
    amenities: "Design, food, production, and creative-office amenities nearby.",
    foodEnvironment: "Useful workday food environment with stronger pockets near Townsend and Brannan.",
    lessSuitableFor: [
      "Firms needing trophy-tower image or dense client-service amenities",
      "Users that need highly specialized lab or heavy industrial infrastructure without validation",
    ],
    relatedDistricts: ["/commercial-real-estate/CA/san-francisco/design-district/", "/commercial-real-estate/CA/san-francisco/soma/", "/commercial-real-estate/CA/san-francisco/potrero-hill/"],
  },
  southBeach: {
    businessFit: ["technology", "professional services", "mixed-use office", "waterfront office"],
    idealCompanyProfiles: [
      "Teams comparing downtown access, waterfront character, ballpark-area amenities, and South Financial District proximity",
      "Companies that want access to SoMa and the Embarcadero without being deep in either district",
    ],
    companySizes: ["small teams", "mid-sized firms", "larger technology users"],
    workplaceCharacter: "Mid-rise office, waterfront-adjacent buildings, mixed-use anchors, and Transbay/Spear Street offices.",
    neighborhoodCharacter: "Mixed-use waterfront and ballpark district with strong links to SoMa and the Financial District.",
    executivePresence: "medium",
    innovationScore: "medium",
    transit: "Good access near Embarcadero, Transbay, and Caltrain edges; varies by exact block.",
    parking: "Can be constrained near event areas and waterfront locations.",
    amenities: "Waterfront, restaurants, ballpark, hotels, and downtown services are nearby.",
    foodEnvironment: "Good mixed workday and event-driven food environment.",
    lessSuitableFor: [
      "Users needing a purely traditional Financial District address",
      "Businesses that need predictable parking during events",
    ],
    relatedDistricts: ["/commercial-real-estate/CA/san-francisco/soma/", "/commercial-real-estate/CA/san-francisco/financial-district/", "/commercial-real-estate/CA/san-francisco/mission-bay/"],
  },
  potreroHill: {
    businessFit: ["creative office", "production", "flex", "neighborhood office"],
    idealCompanyProfiles: [
      "Creative, production, maker, and flexible-office users that value practical buildings and neighborhood scale",
      "Businesses comparing Potrero with Dogpatch, Showplace Square, and Mission Bay for access and flexibility",
    ],
    companySizes: ["small teams", "production users", "mid-sized creative teams"],
    workplaceCharacter: "Lower-rise creative, production, flex, mixed-use, and neighborhood office buildings.",
    neighborhoodCharacter: "Neighborhood-scaled, practical, and closely tied to production, design, and Mission Bay edges.",
    executivePresence: "low",
    innovationScore: "medium",
    transit: "Transit is more variable than downtown and should be tested against employee commute patterns.",
    parking: "Often more practical than core San Francisco, though building-specific.",
    amenities: "Neighborhood food, production services, and nearby Showplace/Mission Bay amenities.",
    foodEnvironment: "Local and less dense than central districts.",
    lessSuitableFor: [
      "Companies that need a high-image downtown address",
      "Teams that need immediate BART access or large modern towers",
    ],
    relatedDistricts: ["/commercial-real-estate/CA/san-francisco/dogpatch/", "/commercial-real-estate/CA/san-francisco/showplace-square/", "/commercial-real-estate/CA/san-francisco/mission-district/"],
  },
  missionDistrict: {
    businessFit: ["creative office", "maker", "retail", "production", "neighborhood-serving"],
    idealCompanyProfiles: [
      "Creative, maker, food, retail, production, and neighborhood-facing businesses that benefit from culture and customer visibility",
      "Teams that value character and transit but do not require a conventional office district",
    ],
    companySizes: ["small teams", "creative businesses", "neighborhood-serving operators"],
    workplaceCharacter: "Historic, adaptive reuse, production, retail, and neighborhood office environments.",
    neighborhoodCharacter: "Cultural, transit-oriented, and mixed-use, with stronger neighborhood identity than conventional office markets.",
    executivePresence: "low",
    innovationScore: "medium",
    transit: "BART access is a major advantage near the 16th and 24th Street corridors.",
    parking: "Parking is constrained and should be validated for employees, customers, and operations.",
    amenities: "Food, retail, maker, cultural, and neighborhood amenities are central to the district.",
    foodEnvironment: "Strong food and retail environment with significant local identity.",
    lessSuitableFor: [
      "Companies that need a traditional office-tower environment",
      "Users that need heavy parking, loading, or highly controlled corporate campus conditions",
    ],
    relatedDistricts: ["/commercial-real-estate/CA/san-francisco/potrero-hill/", "/commercial-real-estate/CA/san-francisco/showplace-square/", "/commercial-real-estate/CA/san-francisco/soma/"],
  },
};

function getDistrict(key) {
  const value = districts[key];
  if (!value) throw new Error(`Unknown San Francisco building intelligence district: ${key}`);
  return value;
}

function getDefaults(key) {
  const value = districtDefaults[key];
  if (!value) throw new Error(`Unknown San Francisco building intelligence defaults: ${key}`);
  return value;
}

function canonicalBuilding({
  name,
  address,
  districtKey,
  role,
  reason,
  themes,
  assetClass = "Commercial Asset",
  buildingType = "Office Space",
  primarySpaceType = "office",
  secondaryDistrictKeys = [],
  sourceConfidence = "medium",
  publicationStatus = "published",
  semanticSourceBuildingId = "",
  comparisonAddresses = [],
  nearbyAddresses = [],
  commercialIntelligence = null,
}) {
  const canonicalDistrict = getDistrict(districtKey);
  const defaults = getDefaults(districtKey);
  const secondaryDistricts = secondaryDistrictKeys.map(getDistrict);
  const path = buildingPath(address);

  const intelligence = {
    id: `${CITY_SLUG}-${slugify(address)}`,
    semanticSourceBuildingId,
    building_path: path,
    identity: {
      name,
      address,
      city: CITY,
      state_abbr: STATE,
      district: canonicalDistrict.name,
      canonicalDistrict,
      secondaryDistricts,
      buildingType,
      primarySpaceType,
      assetClass,
    },
    editorial: {
      editorialRole: role,
      editorialReason: reason,
      representativeThemes: themes,
    },
    business: {
      businessFit: defaults.businessFit,
      idealCompanyProfiles: defaults.idealCompanyProfiles,
      companySizes: defaults.companySizes,
    },
    experience: {
      workplaceCharacter: defaults.workplaceCharacter,
      neighborhoodCharacter: defaults.neighborhoodCharacter,
      executivePresence: defaults.executivePresence,
      innovationScore: defaults.innovationScore,
    },
    operations: {
      transit: defaults.transit,
      parking: defaults.parking,
      amenities: defaults.amenities,
      foodEnvironment: defaults.foodEnvironment,
    },
    tradeoffs: {
      strengths: [
        reason,
        defaults.transit,
        defaults.amenities,
      ],
      limitations: [
        defaults.parking,
        ...defaults.lessSuitableFor.slice(0, 1),
      ],
      businessesThatShouldCompare: defaults.lessSuitableFor,
      nearbyAlternatives: defaults.relatedDistricts,
    },
    validation: {
      questionsToValidate: [
        "Does the current floorplate support the team's layout, collaboration patterns, and growth plan?",
        "How do transit, parking, visitor access, and daily employee commute patterns work from this address?",
        "What buildout, infrastructure, signage, security, after-hours access, or operating constraints should be confirmed before shortlisting it?",
      ],
      tourObservations: [
        "Compare the building's lobby, arrival sequence, surrounding blocks, and employee amenities against the company's client and recruiting needs.",
        "Validate whether the specific available floor or suite matches the building's broader market role.",
      ],
    },
    relationships: {
      nearbyBuildings: nearbyAddresses.map(buildingPath),
      comparisonBuildings: comparisonAddresses.map(buildingPath),
      relatedDistricts: defaults.relatedDistricts,
    },
    quality: {
      sourceConfidence,
      publicationStatus,
      sourceBasis: "W0 editorial collection promoted to Commercial Building Intelligence v1",
    },
  };

  if (commercialIntelligence) {
    intelligence.commercialIntelligence = commercialIntelligence;
  }

  return intelligence;
}

const canonicalBuildings = [
  canonicalBuilding({ name: "555 California", address: "555 California St", districtKey: "financialDistrict", role: "Corporate Benchmark", themes: ["Corporate Headquarters", "Financial Services", "Tower", "Executive Presence", "Modern Class A"], reason: "Represents the traditional high-rise corporate and financial-services center of San Francisco.", comparisonAddresses: ["101 California St", "345 California St", "1 Bush St", "1 Sansome St"] }),
  canonicalBuilding({ name: "101 California", address: "101 California St", districtKey: "financialDistrict", role: "Corporate Benchmark", themes: ["Transit Oriented", "Modern Class A", "Professional Services", "Tower", "High Amenity"], reason: "Shows the appeal of a central, transit-oriented downtown tower with broad professional-service utility.", comparisonAddresses: ["555 California St", "50 California St", "100 Pine St"] }),
  canonicalBuilding({ name: "345 California Center", address: "345 California St", districtKey: "financialDistrict", role: "Executive Benchmark", themes: ["Modern Class A", "Tower", "Executive Presence", "Professional Services"], reason: "Useful for understanding premium Financial District space with a more boutique feel than the largest towers.", comparisonAddresses: ["555 California St", "101 California St", "600 Montgomery St"] }),
  canonicalBuilding({ name: "One Bush Plaza / Crown Zellerbach Building", address: "1 Bush St", districtKey: "financialDistrict", role: "Historic Benchmark", themes: ["Historic", "Modernist", "Professional Services", "Architectural Identity"], reason: "Essential architectural and market reference for San Francisco's older modernist downtown office stock.", comparisonAddresses: ["555 California St", "1 Sansome St", "44 Montgomery St"] }),
  canonicalBuilding({ name: "Transamerica Pyramid Center", address: "600 Montgomery St", districtKey: "financialDistrict", role: "District Icon", themes: ["Iconic", "Historic", "Tower", "High Amenity", "Executive Presence"], reason: "The clearest skyline reference for older downtown San Francisco and repositioned trophy office space.", comparisonAddresses: ["555 California St", "300 Clay St", "1105 Battery St"], secondaryDistrictKeys: ["jacksonSquare"] }),
  canonicalBuilding({ name: "One Sansome", address: "1 Sansome St", districtKey: "financialDistrict", role: "Adaptive Reuse Benchmark", themes: ["Transit Oriented", "Adaptive Reuse", "High Amenity", "Professional Services"], reason: "Shows how a Financial District tower can be repositioned around transit, amenities, and lobby-level activity.", comparisonAddresses: ["1 Bush St", "44 Montgomery St", "101 California St"] }),
  canonicalBuilding({ name: "315 Montgomery", address: "315 Montgomery St", districtKey: "financialDistrict", role: "Professional Services Benchmark", themes: ["Professional Services", "Montgomery Corridor", "Downtown Core", "Client Access"], reason: "Represents the practical Montgomery Street professional-office layer between trophy towers and smaller downtown-edge buildings.", comparisonAddresses: ["44 Montgomery St", "101 California St", "100 Pine St"], semanticSourceBuildingId: "ca-san-francisco-315-montgomery-st" }),
  canonicalBuilding({ name: "212 Sutter St", address: "212 Sutter St", districtKey: "financialDistrict", role: "Boutique Office Benchmark", themes: ["Boutique Office", "Professional Services", "Downtown Edge", "Client Access"], reason: "Adds smaller-format Financial District context for boutique professional-service teams comparing tower alternatives.", comparisonAddresses: ["315 Montgomery St", "325 Kearny St", "650 California St"], secondaryDistrictKeys: ["jacksonSquare"], semanticSourceBuildingId: "ca-san-francisco-212-sutter-st" }),
  canonicalBuilding({ name: "325 Kearny St", address: "325 Kearny St", districtKey: "financialDistrict", role: "Downtown Edge Benchmark", themes: ["Downtown Edge", "Professional Services", "Boutique Office", "District Comparison"], reason: "Helps explain the Kearny Street edge where Financial District, Jackson Square, and Union Square considerations overlap.", comparisonAddresses: ["333 Kearny St", "212 Sutter St", "930 Montgomery St"], secondaryDistrictKeys: ["jacksonSquare"], semanticSourceBuildingId: "ca-san-francisco-325-kearny-st" }),
  canonicalBuilding({ name: "333 Kearny St", address: "333 Kearny St", districtKey: "financialDistrict", role: "Downtown Edge Benchmark", themes: ["Downtown Edge", "Professional Services", "Boutique Office", "District Comparison"], reason: "Gives the portfolio a second Kearny corridor reference for small and mid-size teams testing downtown edge tradeoffs.", comparisonAddresses: ["325 Kearny St", "315 Montgomery St", "930 Montgomery St"], secondaryDistrictKeys: ["jacksonSquare"], semanticSourceBuildingId: "ca-san-francisco-333-kearny-st" }),
  canonicalBuilding({ name: "44 Montgomery", address: "44 Montgomery St", districtKey: "financialDistrict", role: "Value Benchmark", themes: ["Transit Oriented", "Mid-Century Tower", "Professional Services"], reason: "A practical mid-market downtown tower near BART and Market Street.", comparisonAddresses: ["1 Sansome St", "100 Pine St", "315 Montgomery St"] }),
  canonicalBuilding({ name: "50 California", address: "50 California St", districtKey: "financialDistrict", role: "Corporate Benchmark", themes: ["Institutional Office", "Tower", "Transit Oriented", "Professional Services"], reason: "Represents Embarcadero-facing Financial District office buildings serving law, finance, consulting, and corporate users.", comparisonAddresses: ["101 California St", "2 Embarcadero Ctr", "100 Pine St"] }),
  canonicalBuilding({ name: "425 Market", address: "425 Market St", districtKey: "financialDistrict", role: "Corporate Benchmark", themes: ["Corporate Headquarters", "Professional Services", "Modern Class A"], reason: "Helps explain the bridge between the traditional Financial District and South Financial District.", comparisonAddresses: ["555 California St", "303 2nd St", "415 Mission St"], secondaryDistrictKeys: ["southBeach"] }),
  canonicalBuilding({ name: "100 Pine", address: "100 Pine St", districtKey: "financialDistrict", role: "Professional Services Benchmark", themes: ["Professional Services", "Mid-Market Tower", "Financial Services"], reason: "A durable Financial District reference for traditional professional-service inventory without trophy positioning.", comparisonAddresses: ["44 Montgomery St", "50 California St", "101 California St"] }),
  canonicalBuilding({ name: "Two Embarcadero Center", address: "2 Embarcadero Ctr", districtKey: "financialDistrict", role: "District Anchor", themes: ["Mixed Use", "Executive Presence", "Waterfront", "Professional Services"], reason: "Explains the Embarcadero Center office and retail complex and the district's relationship to waterfront access.", comparisonAddresses: ["50 California St", "300 Clay St", "101 California St"] }),
  canonicalBuilding({ name: "One Maritime Plaza", address: "300 Clay St", districtKey: "financialDistrict", role: "Executive Benchmark", themes: ["Architectural Identity", "Waterfront", "Professional Services", "Tower"], reason: "Helps explain the north Financial District and Jackson Square edge with a different urban feel from Market Street towers.", comparisonAddresses: ["600 Montgomery St", "1105 Battery St", "650 California St"], secondaryDistrictKeys: ["jacksonSquare"] }),

  canonicalBuilding({ name: "Salesforce Tower", address: "415 Mission St", districtKey: "soma", role: "District Icon", themes: ["Corporate Headquarters", "Technology", "Tower", "Modern Class A", "Transit Oriented"], reason: "Defines the post-Transbay era of San Francisco office development and large-scale technology headquarters demand.", comparisonAddresses: ["181 Fremont St", "303 2nd St", "425 Market St"] }),
  canonicalBuilding({ name: "181 Fremont", address: "181 Fremont St", districtKey: "soma", role: "Innovation Benchmark", themes: ["Mixed Use", "Modern Class A", "Tower", "Transit Oriented"], reason: "Represents the premium Transbay mixed-use model at the high end of modern SoMa.", comparisonAddresses: ["415 Mission St", "303 2nd St", "680 Folsom St"] }),
  canonicalBuilding({ name: "303 Second", address: "303 2nd St", districtKey: "soma", role: "Corporate Benchmark", themes: ["Modern Class A", "Transit Oriented", "Technology", "Large Floorplates"], reason: "A core SoMa and South Financial District comparison building for large floorplate Class A space.", comparisonAddresses: ["415 Mission St", "181 Fremont St", "188 Spear St"], secondaryDistrictKeys: ["southBeach"] }),
  canonicalBuilding({ name: "680 Folsom", address: "680 Folsom St", districtKey: "soma", role: "Adaptive Reuse Benchmark", themes: ["Adaptive Reuse", "Technology", "Sustainability", "Modern Office"], reason: "Strong example of large-scale adaptive reuse turning older commercial stock into modern technology workspace.", comparisonAddresses: ["140 New Montgomery St", "888 Brannan St", "650 Townsend St"] }),
  canonicalBuilding({ name: "140 New Montgomery", address: "140 New Montgomery St", districtKey: "soma", role: "Historic Benchmark", themes: ["Historic", "Technology", "Adaptive Reuse", "Architectural Identity"], reason: "Essential for understanding SoMa's historic office character and technology-era reuse.", comparisonAddresses: ["680 Folsom St", "144 2nd St", "303 2nd St"] }),
  canonicalBuilding({ name: "650 Townsend", address: "650 Townsend St", districtKey: "soma", role: "Creative Benchmark", themes: ["Technology", "Creative Office", "Campus Style", "Large Floorplates"], reason: "Represents West SoMa creative floorplates and technology demand near Caltrain.", comparisonAddresses: ["888 Brannan St", "600 Townsend St", "808 Brannan St"], secondaryDistrictKeys: ["showplaceSquare"] }),
  canonicalBuilding({ name: "888 Brannan", address: "888 Brannan St", districtKey: "soma", role: "Adaptive Reuse Benchmark", themes: ["Technology", "Creative Office", "Adaptive Reuse", "Large Floorplates"], reason: "Explains SoMa's warehouse-to-headquarters pattern for large creative technology users.", comparisonAddresses: ["650 Townsend St", "680 Folsom St", "2 Henry Adams St"], secondaryDistrictKeys: ["designDistrict", "showplaceSquare"] }),
  canonicalBuilding({ name: "795 Folsom", address: "795 Folsom St", districtKey: "soma", role: "Creative Benchmark", themes: ["Technology", "Creative Office", "Mid-Rise", "Transit Oriented"], reason: "A useful mid-rise reference for central SoMa without jumping directly to trophy towers.", comparisonAddresses: ["144 2nd St", "140 New Montgomery St", "680 Folsom St"] }),
  canonicalBuilding({ name: "144 Second", address: "144 2nd St", districtKey: "soma", role: "Startup Benchmark", themes: ["Startup", "Creative Office", "Mid-Rise", "Transit Oriented"], reason: "A practical representative building for smaller and mid-sized technology, professional-service, and creative teams near the downtown boundary.", comparisonAddresses: ["156 2nd St", "140 New Montgomery St", "795 Folsom St"] }),
  canonicalBuilding({ name: "156 2nd St", address: "156 2nd St", districtKey: "soma", role: "2nd Street Creative Office Benchmark", themes: ["Creative Office", "Adaptive Reuse", "Mid-Rise", "Central SoMa"], reason: "Pairs with 144 2nd St to show SoMa's smaller-grain adaptive office pattern near the downtown boundary.", comparisonAddresses: ["144 2nd St", "303 2nd St", "680 Folsom St"], semanticSourceBuildingId: "ca-san-francisco-156-2nd-st" }),
  canonicalBuilding({ name: "600 Townsend", address: "600 Townsend St", districtKey: "soma", role: "Creative Benchmark", themes: ["Creative Office", "Technology", "Adaptive Reuse", "Caltrain Access"], reason: "Helps explain the Townsend corridor for teams prioritizing Caltrain, creative space, and larger layouts.", comparisonAddresses: ["650 Townsend St", "460 Townsend St", "410 Townsend St"], secondaryDistrictKeys: ["showplaceSquare"] }),
  canonicalBuilding({ name: "414 Brannan", address: "414 Brannan St", districtKey: "soma", role: "Creative Benchmark", themes: ["Creative Office", "Startup", "Adaptive Reuse", "Neighborhood Anchor"], reason: "A lower-scale building that explains SoMa's older brick-and-timber creative-office environment.", comparisonAddresses: ["600 Townsend St", "909 Harrison St", "699 2nd St"] }),
  canonicalBuilding({ name: "699 2nd St", address: "699 2nd St", districtKey: "soma", role: "China Basin Edge Benchmark", themes: ["China Basin", "Waterfront Edge", "Office", "Mission Bay Edge"], reason: "Shows the 2nd Street and China Basin transition where SoMa office searches begin to overlap with waterfront and Mission Bay-adjacent context.", comparisonAddresses: ["600 Townsend St", "500 Terry Francois Blvd", "1800 Owens St"], semanticSourceBuildingId: "ca-san-francisco-699-2nd-st" }),
  canonicalBuilding({ name: "909 Harrison", address: "909 Harrison St", districtKey: "soma", role: "Value Benchmark", themes: ["Creative Office", "Startup", "Mid-Market", "Adaptive Reuse"], reason: "Shows the more flexible, less corporate SoMa inventory that can appeal to earlier-stage companies.", comparisonAddresses: ["414 Brannan St", "144 2nd St", "999 Brannan St"] }),

  canonicalBuilding({ name: "Uber Mission Bay", address: "1455 3rd St", districtKey: "missionBay", role: "Innovation Benchmark", themes: ["Corporate Headquarters", "Technology", "Campus Style", "Modern Class A"], reason: "Defines Mission Bay's modern headquarters identity and campus-like office environment.", comparisonAddresses: ["1800 Owens St", "500 Terry Francois Blvd", "415 Mission St"] }),
  canonicalBuilding({ name: "Alexandria Center at Mission Bay - 1700 Owens", address: "1700 Owens St", districtKey: "missionBay", role: "Life Science Benchmark", themes: ["Life Science", "Innovation", "Campus Style", "Research"], reason: "A core life-science reference for the private lab and R&D cluster around UCSF.", comparisonAddresses: ["1500 Owens St", "455 Mission Bay Blvd S", "1800 Owens St"], commercialIntelligence: {
    primaryEcosystem: "life_science",
    ecosystemSubtypes: ["research_lab", "biotech_research", "innovation_campus"],
    representativeRole: "research_lab_environment",
    businessActivities: ["research", "product_development", "collaboration"],
    businessArchetypes: ["biotech_company", "research_company", "startup"],
    operationalCharacteristics: ["lab_infrastructure", "wet_lab_potential", "specialized_ventilation", "high_power", "campus_environment", "large_floorplates"],
    representativeReasons: [
      "Represents Mission Bay's private lab and R&D cluster around UCSF.",
      "Helps distinguish lab-oriented life-science environments from general Mission Bay office buildings.",
    ],
    tradeoffs: [
      "Lab, power, ventilation, security, and buildout assumptions must be validated for the specific suite.",
      "Mission Bay specialization may be less useful for general office users that do not benefit from research adjacency.",
    ],
    validationFocus: ["Lab infrastructure", "Wet-lab suitability", "Ventilation", "Power capacity", "Hazardous-material restrictions", "Permitted research use", "Current suite configuration"],
    confidence: "editorially_supported",
  } }),
  canonicalBuilding({ name: "Alexandria Center at Mission Bay - 1500 Owens", address: "1500 Owens St", districtKey: "missionBay", role: "Life Science Benchmark", themes: ["Life Science", "Research", "Innovation", "Campus Style"], reason: "Complements 1700 Owens and helps show Mission Bay as an ecosystem rather than a one-building choice.", comparisonAddresses: ["1700 Owens St", "455 Mission Bay Blvd S", "550 Terry A Francois Blvd"], commercialIntelligence: {
    primaryEcosystem: "life_science",
    ecosystemSubtypes: ["biotech_research", "research_lab", "innovation_campus"],
    representativeRole: "biotech_research_environment",
    businessActivities: ["research", "product_development", "collaboration"],
    businessArchetypes: ["biotech_company", "research_company", "startup"],
    operationalCharacteristics: ["lab_infrastructure", "wet_lab_potential", "backup_power", "specialized_ventilation", "campus_environment", "large_floorplates"],
    representativeReasons: [
      "Complements 1700 Owens by showing Mission Bay as a life-science ecosystem rather than a single-building choice.",
      "Represents biotech-oriented research adjacency within the Mission Bay cluster.",
    ],
    tradeoffs: [
      "Biotech suitability depends on suite-level infrastructure, code, landlord approval, and operating requirements.",
      "Companies should compare whether the Mission Bay research cluster matters more than broader office flexibility.",
    ],
    validationFocus: ["Biotech research use", "Lab infrastructure", "Wet-lab suitability", "Backup power", "Ventilation", "Power capacity", "Hazardous-material restrictions"],
    confidence: "editorially_supported",
  } }),
  canonicalBuilding({ name: "455 Mission Bay Boulevard South", address: "455 Mission Bay Blvd S", districtKey: "missionBay", role: "Life Science Benchmark", themes: ["Life Science", "Research", "Innovation", "Campus Style"], reason: "Important life-science building for understanding UCSF adjacency and research-tenant demand.", comparisonAddresses: ["1700 Owens St", "1500 Owens St", "550 Terry A Francois Blvd"], commercialIntelligence: {
    primaryEcosystem: "life_science",
    ecosystemSubtypes: ["research_lab", "life_science_office", "innovation_campus"],
    representativeRole: "research_lab_environment",
    businessActivities: ["research", "product_development", "collaboration", "knowledge_work"],
    businessArchetypes: ["research_company", "biotech_company", "startup"],
    operationalCharacteristics: ["lab_infrastructure", "wet_lab_potential", "specialized_ventilation", "campus_environment", "transit_access", "large_floorplates"],
    representativeReasons: [
      "Helps explain UCSF adjacency and research-tenant demand inside Mission Bay.",
      "Adds a research-lab reference distinct from general waterfront or technology office examples.",
    ],
    tradeoffs: [
      "Specific lab, ventilation, loading, waste, and safety requirements remain property- and suite-level validation topics.",
      "A research-oriented Mission Bay setting can be over-specialized for users that mainly need conventional office space.",
    ],
    validationFocus: ["Research use approval", "Lab infrastructure", "Wet-lab suitability", "Ventilation", "Power capacity", "Waste handling", "Current suite configuration"],
    confidence: "editorially_supported",
  } }),
  canonicalBuilding({ name: "The Exchange", address: "1800 Owens St", districtKey: "missionBay", role: "Innovation Benchmark", themes: ["Modern Class A", "Technology", "Life Science Adjacent", "Large Floorplates"], reason: "A major modern office building that shows Mission Bay's appeal beyond wet lab use.", comparisonAddresses: ["1455 3rd St", "500 Terry Francois Blvd", "550 Terry A Francois Blvd"] }),
  canonicalBuilding({ name: "500 Terry Francois", address: "500 Terry Francois Blvd", districtKey: "missionBay", role: "Waterfront Benchmark", themes: ["Waterfront", "Modern Office", "Technology", "Innovation"], reason: "Explains the bayfront office character of Mission Bay and the appeal of newer buildings outside downtown.", comparisonAddresses: ["550 Terry A Francois Blvd", "1800 Owens St", "185 Berry St"] }),
  canonicalBuilding({ name: "550 Terry Francois", address: "550 Terry A Francois Blvd", districtKey: "missionBay", role: "Life Science Benchmark", themes: ["Life Science", "Office/Lab", "Waterfront", "Modern Class A"], reason: "Represents newer office/lab supply deepening Mission Bay's innovation identity.", comparisonAddresses: ["500 Terry Francois Blvd", "1700 Owens St", "409 Illinois St"], commercialIntelligence: {
    primaryEcosystem: "life_science",
    ecosystemSubtypes: ["life_science_office", "research_lab", "innovation_campus"],
    representativeRole: "life_science_campus",
    businessActivities: ["research", "product_development", "collaboration", "knowledge_work"],
    businessArchetypes: ["biotech_company", "research_company", "startup"],
    operationalCharacteristics: ["campus_environment", "research_compatible", "transit_access", "enhanced_security", "large_floorplates", "lab_infrastructure"],
    representativeReasons: [
      "Represents newer office/lab supply deepening Mission Bay's innovation identity.",
      "Shows how waterfront access, office needs, and life-science adjacency can coexist in one Mission Bay environment.",
    ],
    tradeoffs: [
      "Office/lab orientation should not be treated as proof that any available suite supports specialized research use.",
      "Waterfront and event-area circulation can affect commute, visitor, and operating patterns.",
    ],
    validationFocus: ["Office/lab configuration", "Lab infrastructure", "Power capacity", "Ventilation", "Parking and visitor access", "Event-area circulation", "Current suite configuration"],
    confidence: "editorially_supported",
  } }),
  canonicalBuilding({ name: "UCSF Mission Bay / Genentech Hall", address: "600 16th St", districtKey: "missionBay", role: "District Anchor", themes: ["Research", "Life Science", "Institutional Anchor", "Innovation"], reason: "Essential to understanding why Mission Bay became a life-science district.", assetClass: "District Anchor", buildingType: "District Anchor", comparisonAddresses: ["1700 Owens St", "455 Mission Bay Blvd S", "654 Minnesota St"] }),
  canonicalBuilding({ name: "UCSF Medical Center at Mission Bay", address: "1825 4th St", districtKey: "missionBay", role: "District Anchor", themes: ["Medical", "Institutional Anchor", "Life Science", "Campus Style"], reason: "Explains the health-care and clinical side of Mission Bay's commercial ecosystem.", assetClass: "District Anchor", buildingType: "District Anchor", comparisonAddresses: ["600 16th St", "1700 Owens St"] }),
  canonicalBuilding({ name: "Chase Center", address: "1 Warriors Way", districtKey: "missionBay", role: "Neighborhood Anchor", themes: ["Mixed Use", "Neighborhood Anchor", "Amenity", "Entertainment"], reason: "A major amenity and demand anchor that shapes how companies experience Mission Bay.", assetClass: "District Anchor", buildingType: "District Anchor", comparisonAddresses: ["555 Mission Rock St", "500 Terry Francois Blvd"] }),
  canonicalBuilding({ name: "54 Jeff Adachi Way", address: "54 Jeff Adachi Way", districtKey: "missionBay", role: "Mixed-Use Edge Benchmark", themes: ["Mission Bay", "Mixed Use", "Newer Development", "Innovation"], reason: "Shows Mission Bay as a newer planned commercial environment where office, institutional, residential, event, and waterfront movement overlap.", comparisonAddresses: ["555 Mission Rock St", "1455 3rd St", "500 Terry Francois Blvd"], semanticSourceBuildingId: "ca-san-francisco-54-jeff-adachi-way" }),
  canonicalBuilding({ name: "555 Mission Rock St", address: "555 Mission Rock St", districtKey: "missionBay", role: "Mixed-Use Benchmark", themes: ["Mission Rock", "Mixed Use", "Waterfront", "Event District"], reason: "Explains Mission Bay's newer Mission Rock development pattern near Chase Center, waterfront circulation, office demand, retail, and residential growth.", comparisonAddresses: ["54 Jeff Adachi Way", "1 Warriors Way", "500 Terry Francois Blvd"], semanticSourceBuildingId: "ca-san-francisco-555-mission-rock-st" }),
  canonicalBuilding({ name: "409 Illinois", address: "409 Illinois St", districtKey: "missionBay", role: "Innovation Benchmark", themes: ["Modern Office", "Innovation", "Waterfront", "Mid-Rise"], reason: "Explains the Illinois and Terry Francois edge and smaller modern office formats.", comparisonAddresses: ["499 Illinois St", "550 Terry A Francois Blvd", "500 Terry Francois Blvd"] }),
  canonicalBuilding({ name: "499 Illinois", address: "499 Illinois St", districtKey: "missionBay", role: "Innovation Benchmark", themes: ["Modern Office", "Innovation", "Waterfront", "Mid-Rise"], reason: "Shows the middle ground between campus lab buildings and large headquarters.", comparisonAddresses: ["409 Illinois St", "550 Terry A Francois Blvd", "1800 Owens St"] }),

  canonicalBuilding({ name: "Levi's Plaza", address: "1105 Battery St", districtKey: "jacksonSquare", role: "Campus Benchmark", themes: ["Campus Style", "Creative Office", "Historic Character", "Neighborhood Anchor"], reason: "The best single example of Jackson Square's low-rise campus feel and waterfront relationship.", comparisonAddresses: ["300 Clay St", "1000 Sansome St", "901 Battery St"] }),
  canonicalBuilding({ name: "1000 Sansome", address: "1000 Sansome St", districtKey: "jacksonSquare", role: "Historic Benchmark", themes: ["Historic Character", "Creative Office", "Adaptive Reuse"], reason: "Represents the brick-and-timber office character that separates Jackson Square from the traditional Financial District.", comparisonAddresses: ["901 Battery St", "924 Sansome St", "1105 Battery St"] }),
  canonicalBuilding({ name: "901 Battery", address: "901 Battery St", districtKey: "jacksonSquare", role: "Creative Benchmark", themes: ["Creative Office", "Historic Character", "Mid-Rise"], reason: "Helps explain Jackson Square's appeal to design, brand, and boutique professional firms.", comparisonAddresses: ["1000 Sansome St", "930 Montgomery St", "75 Broadway"] }),
  canonicalBuilding({ name: "930 Montgomery", address: "930 Montgomery St", districtKey: "jacksonSquare", role: "Executive Benchmark", themes: ["Historic Character", "Professional Services", "Boutique Office"], reason: "Useful for executive and client-facing firms that value neighborhood character.", comparisonAddresses: ["901 Battery St", "75 Broadway", "650 California St"] }),
  canonicalBuilding({ name: "75 Broadway", address: "75 Broadway", districtKey: "jacksonSquare", role: "Historic Benchmark", themes: ["Historic Character", "Boutique Office", "Professional Services"], reason: "Represents smaller Jackson Square office stock and the transition toward Broadway and North Beach.", comparisonAddresses: ["930 Montgomery St", "924 Sansome St", "1000 Sansome St"] }),
  canonicalBuilding({ name: "924 Sansome", address: "924 Sansome St", districtKey: "jacksonSquare", role: "Historic Benchmark", themes: ["Historic Character", "Creative Office", "Adaptive Reuse"], reason: "A strong small-format example of Jackson Square's older commercial buildings.", comparisonAddresses: ["1000 Sansome St", "75 Broadway", "901 Battery St"] }),
  canonicalBuilding({ name: "650 California", address: "650 California St", districtKey: "jacksonSquare", role: "Executive Benchmark", themes: ["Executive Presence", "Professional Services", "Tower Edge"], reason: "Helps compare Jackson Square with nearby Nob Hill and Financial District edge buildings.", comparisonAddresses: ["930 Montgomery St", "600 Montgomery St", "300 Clay St"] }),
  canonicalBuilding({ name: "The Ice House", address: "151 Union St", districtKey: "jacksonSquare", role: "Historic Benchmark", themes: ["Historic Character", "Adaptive Reuse", "Design", "Creative Office"], reason: "An important historical reference for design and warehouse reuse patterns near the north waterfront.", comparisonAddresses: ["1000 Sansome St", "1105 Battery St", "2 Henry Adams St"] }),
  canonicalBuilding({ name: "1100 Grant Ave", address: "1100 Grant Ave", districtKey: "jacksonSquare", role: "Neighborhood Edge Benchmark", themes: ["Historic Character", "Boutique Office", "North Beach Edge", "Professional Services"], reason: "Shows how Jackson Square can blend downtown adjacency with North Beach edge character for smaller professional-service and creative users.", comparisonAddresses: ["75 Broadway", "930 Montgomery St", "1000 Sansome St"], semanticSourceBuildingId: "ca-san-francisco-1100-grant-ave" }),
  canonicalBuilding({ name: "27 Drumm St", address: "27 Drumm St", districtKey: "jacksonSquare", role: "Downtown Edge Benchmark", themes: ["Downtown Edge", "Boutique Office", "Waterfront", "Professional Services"], reason: "Represents the compact downtown-waterfront edge where Jackson Square, Embarcadero, and Financial District decisions overlap.", comparisonAddresses: ["33 Drumm St", "930 Montgomery St", "315 Montgomery St"], semanticSourceBuildingId: "ca-san-francisco-27-drumm-st" }),
  canonicalBuilding({ name: "33 Drumm St", address: "33 Drumm St", districtKey: "jacksonSquare", role: "Downtown Edge Benchmark", themes: ["Downtown Edge", "Boutique Office", "Waterfront", "Professional Services"], reason: "Helps tenants pressure-test whether their search is really Jackson Square, Embarcadero, or a more formal Financial District office need.", comparisonAddresses: ["27 Drumm St", "930 Montgomery St", "315 Montgomery St"], semanticSourceBuildingId: "ca-san-francisco-33-drumm-st" }),

  canonicalBuilding({ name: "Pier 70 Building 12", address: "70 Pier Bldg 102", districtKey: "dogpatch", role: "Adaptive Reuse Benchmark", themes: ["Adaptive Reuse", "Industrial Conversion", "Creative Office", "Waterfront"], reason: "The strongest current example of Dogpatch industrial reuse becoming a modern mixed commercial environment.", comparisonAddresses: ["Pier 70 Building 101", "1201 Illinois St", "2325 3rd St"] }),
  canonicalBuilding({ name: "Pier 70 Building 101", address: "Pier 70 Building 101", districtKey: "dogpatch", role: "Historic Benchmark", themes: ["Historic Industrial", "Adaptive Reuse", "Waterfront", "Creative Office"], reason: "Helps explain the historic shipyard character of Dogpatch and its long-term reuse potential.", comparisonAddresses: ["70 Pier Bldg 102", "1201 Illinois St", "2325 3rd St"] }),
  canonicalBuilding({ name: "Power Station - Station A", address: "1201 Illinois St", districtKey: "dogpatch", role: "District Anchor", themes: ["Historic Industrial", "Adaptive Reuse", "Waterfront", "Innovation"], reason: "A landmark commercial anchor showing Dogpatch's shift from industrial infrastructure to office/R&D and mixed-use development.", assetClass: "District Anchor", buildingType: "District Anchor", comparisonAddresses: ["300 23rd St", "200 23rd St", "70 Pier Bldg 102"] }),
  canonicalBuilding({ name: "Power Station - 300 23rd St", address: "300 23rd St", districtKey: "dogpatch", role: "Innovation Benchmark", themes: ["Office/R&D", "Life Science", "Modern Class A", "Waterfront"], reason: "Represents the next generation of technically capable Dogpatch workspace near Mission Bay.", comparisonAddresses: ["200 23rd St", "1201 Illinois St", "550 Terry A Francois Blvd"] }),
  canonicalBuilding({ name: "Power Station - 200 23rd St", address: "200 23rd St", districtKey: "dogpatch", role: "Innovation Benchmark", themes: ["Office/R&D", "Life Science", "Modern Class A", "Waterfront"], reason: "Complements 300 23rd and shows the scale of future Dogpatch commercial supply.", comparisonAddresses: ["300 23rd St", "1201 Illinois St", "409 Illinois St"] }),
  canonicalBuilding({ name: "UCSF Life Sciences Building", address: "654 Minnesota St", districtKey: "dogpatch", role: "District Anchor", themes: ["Medical", "Life Science", "Institutional Anchor", "Innovation"], reason: "Links Dogpatch directly to Mission Bay's clinical, research, and life-science ecosystem.", assetClass: "District Anchor", buildingType: "District Anchor", comparisonAddresses: ["600 16th St", "1700 Owens St", "1201 Illinois St"] }),
  canonicalBuilding({ name: "American Industrial Center", address: "2325 3rd St", districtKey: "dogpatch", role: "Production / Flex Benchmark", themes: ["Industrial Conversion", "Maker", "Creative Office", "Small Business"], reason: "Essential non-trophy example of Dogpatch's maker, studio, production, and small-business roots.", comparisonAddresses: ["700 Indiana St", "900 Minnesota St", "1501 Mariposa St"] }),
  canonicalBuilding({ name: "700 Indiana", address: "700 Indiana St", districtKey: "dogpatch", role: "Creative Benchmark", themes: ["Creative Office", "Industrial Conversion", "Neighborhood Scale"], reason: "Explains smaller Dogpatch commercial formats near the historic industrial core.", comparisonAddresses: ["2325 3rd St", "900 Minnesota St", "70 Pier Bldg 102"] }),
  canonicalBuilding({ name: "900 Minnesota", address: "900 Minnesota St", districtKey: "dogpatch", role: "Neighborhood Anchor", themes: ["Historic Character", "Creative Office", "Neighborhood Anchor"], reason: "Shows the lower-rise neighborhood office and creative-production environment that differs from Mission Bay.", comparisonAddresses: ["700 Indiana St", "2325 3rd St", "99 Rhode Island St"] }),
  canonicalBuilding({ name: "1501 Mariposa", address: "1501 Mariposa St", districtKey: "dogpatch", role: "Production / Flex Benchmark", themes: ["Industrial", "Flex", "Production", "Neighborhood Edge"], reason: "Represents the operational and PDR edge of Dogpatch and Potrero that office-only comparisons miss.", comparisonAddresses: ["2325 3rd St", "1700 17th St", "2400 16th St"], secondaryDistrictKeys: ["potreroHill"] }),

  canonicalBuilding({ name: "San Francisco Design Center - Showplace", address: "2 Henry Adams St", districtKey: "designDistrict", role: "District Icon", themes: ["Design", "Showroom", "Historic Character", "Adaptive Reuse"], reason: "The defining building for the district's showroom and design-market identity.", comparisonAddresses: ["101 Henry Adams St", "1 Henry Adams St", "2 Kansas St"], secondaryDistrictKeys: ["showplaceSquare"] }),
  canonicalBuilding({ name: "San Francisco Design Center - Galleria", address: "101 Henry Adams St", districtKey: "designDistrict", role: "District Anchor", themes: ["Design", "Showroom", "Event", "Adaptive Reuse"], reason: "Shows the event, showroom, and design-trade ecosystem around the Design Center.", comparisonAddresses: ["2 Henry Adams St", "1 Henry Adams St", "2 Kansas St"], assetClass: "District Anchor", buildingType: "District Anchor" }),
  canonicalBuilding({ name: "One Henry Adams", address: "1 Henry Adams St", districtKey: "designDistrict", role: "Neighborhood Anchor", themes: ["Design", "Showroom", "Creative Office", "Neighborhood Anchor"], reason: "Important part of the design-center cluster and the district's showroom-to-office identity.", comparisonAddresses: ["2 Henry Adams St", "101 Henry Adams St", "2 Kansas St"] }),
  canonicalBuilding({ name: "2 Kansas", address: "2 Kansas St", districtKey: "designDistrict", role: "Creative Benchmark", themes: ["Creative Office", "Showroom", "Adaptive Reuse"], reason: "Represents the warehouse and showroom pattern extending around the Henry Adams core.", comparisonAddresses: ["1 Henry Adams St", "500 De Haro St", "460 Townsend St"] }),
  canonicalBuilding({ name: "500 De Haro", address: "500 De Haro St", districtKey: "designDistrict", role: "Creative Benchmark", themes: ["Creative Office", "Production", "Adaptive Reuse"], reason: "Explains the transition toward creative, technology, and production-adjacent office users.", comparisonAddresses: ["300 De Haro St", "555 De Haro St", "2 Kansas St"] }),
  canonicalBuilding({ name: "1000 Brannan", address: "1000 Brannan St", districtKey: "designDistrict", role: "Creative Benchmark", themes: ["Creative Office", "Technology", "Adaptive Reuse"], reason: "Represents the Brannan corridor's larger creative-office inventory near Showplace Square.", comparisonAddresses: ["999 Brannan St", "888 Brannan St", "808 Brannan St"] }),
  canonicalBuilding({ name: "999 Brannan", address: "999 Brannan St", districtKey: "designDistrict", role: "Startup Benchmark", themes: ["Creative Office", "Startup", "Adaptive Reuse"], reason: "Helps explain smaller and mid-market creative-office demand around the Design District.", comparisonAddresses: ["1000 Brannan St", "909 Harrison St", "808 Brannan St"] }),
  canonicalBuilding({ name: "Adobe San Francisco", address: "601 Townsend St", districtKey: "designDistrict", role: "Corporate Benchmark", themes: ["Technology", "Creative Office", "Corporate Presence"], reason: "Shows the district's connection to larger technology occupiers while retaining a creative-production edge.", comparisonAddresses: ["600 Townsend St", "650 Townsend St", "460 Townsend St"], secondaryDistrictKeys: ["showplaceSquare"] }),
  canonicalBuilding({ name: "460 Townsend", address: "460 Townsend St", districtKey: "designDistrict", role: "Creative Benchmark", themes: ["Creative Office", "Design", "Adaptive Reuse"], reason: "An existing Rofo representative building that fits the district's creative-commercial story.", comparisonAddresses: ["600 Townsend St", "2 Kansas St", "601 Townsend St"], secondaryDistrictKeys: ["showplaceSquare", "soma"] }),

  canonicalBuilding({ name: "808 Brannan", address: "808 Brannan St", districtKey: "showplaceSquare", role: "Innovation Benchmark", themes: ["Technology", "Creative Office", "Adaptive Reuse", "AI"], reason: "Important comparison building for robotics, AI, and larger creative-office users near the old Airbnb cluster.", comparisonAddresses: ["888 Brannan St", "650 Townsend St", "1000 Brannan St"] }),
  canonicalBuilding({ name: "699 8th St", address: "699 8th St", districtKey: "showplaceSquare", role: "Creative Benchmark", themes: ["Creative Office", "Mid-Rise", "Production Adjacent"], reason: "Shows lower-rise, production-adjacent office inventory in Showplace Square.", comparisonAddresses: ["410 Townsend St", "300 De Haro St", "555 De Haro St"] }),
  canonicalBuilding({ name: "410 Townsend", address: "410 Townsend St", districtKey: "showplaceSquare", role: "Transit-Oriented Benchmark", themes: ["Technology", "Creative Office", "Transit Oriented"], reason: "Connects Showplace Square with the Caltrain-oriented SoMa office market.", comparisonAddresses: ["600 Townsend St", "460 Townsend St", "699 8th St"] }),
  canonicalBuilding({ name: "300 De Haro", address: "300 De Haro St", districtKey: "showplaceSquare", role: "Production / Flex Benchmark", themes: ["Creative Office", "Production", "Neighborhood Edge"], reason: "Represents the district's relationship to Potrero Hill and production/flex uses.", comparisonAddresses: ["500 De Haro St", "555 De Haro St", "99 Rhode Island St"], secondaryDistrictKeys: ["potreroHill"] }),
  canonicalBuilding({ name: "555 De Haro", address: "555 De Haro St", districtKey: "showplaceSquare", role: "Production / Flex Benchmark", themes: ["Creative Office", "Industrial Conversion", "Flex"], reason: "Useful building type for businesses comparing office/flex and creative-production needs.", comparisonAddresses: ["300 De Haro St", "500 De Haro St", "699 8th St"], secondaryDistrictKeys: ["potreroHill"] }),

  canonicalBuilding({ name: "188 Spear", address: "188 Spear St", districtKey: "southBeach", role: "Professional Services Benchmark", themes: ["South Financial District", "Modernized Office", "Transit Oriented", "Mid-Rise"], reason: "A strong representative building for the Spear Street and South Financial District office environment.", comparisonAddresses: ["88 Spear St", "201 Spear St", "303 2nd St"] }),
  canonicalBuilding({ name: "The Spear", address: "88 Spear St", districtKey: "southBeach", role: "Adaptive Reuse Benchmark", themes: ["Repositioned Office", "High Amenity", "Waterfront Adjacent"], reason: "Shows hospitality-style repositioning in the South Beach and South Financial District market.", comparisonAddresses: ["188 Spear St", "201 Spear St", "121 Spear St"] }),
  canonicalBuilding({ name: "201 Spear", address: "201 Spear St", districtKey: "southBeach", role: "Professional Services Benchmark", themes: ["Professional Services", "Transit Oriented", "Mid-Rise"], reason: "A durable comparison building for access to the Embarcadero, downtown, and South Beach without a trophy tower.", comparisonAddresses: ["188 Spear St", "88 Spear St", "345 Spear St"] }),
  canonicalBuilding({ name: "Rincon Center", address: "121 Spear St", districtKey: "southBeach", role: "Neighborhood Anchor", themes: ["Mixed Use", "Historic Conversion", "Neighborhood Anchor"], reason: "Essential for explaining the older mixed office, retail, and residential character of the Rincon edge.", comparisonAddresses: ["88 Spear St", "345 Spear St", "425 1st St"] }),
  canonicalBuilding({ name: "Hills Plaza", address: "345 Spear St", districtKey: "southBeach", role: "Historic Benchmark", themes: ["Historic Character", "Waterfront", "Adaptive Reuse", "Technology"], reason: "A strong example of waterfront-adjacent office in a historic warehouse setting.", comparisonAddresses: ["121 Spear St", "201 Spear St", "185 Berry St"] }),
  canonicalBuilding({ name: "301 Brannan", address: "301 Brannan St", districtKey: "southBeach", role: "Neighborhood Anchor", themes: ["Mixed Use", "Historic Character", "Neighborhood Anchor"], reason: "Explains South Beach's blend of housing, commercial space, and historic industrial character.", comparisonAddresses: ["345 Spear St", "185 Berry St", "303 2nd St"] }),
  canonicalBuilding({ name: "China Basin / 185 Berry", address: "185 Berry St", districtKey: "southBeach", role: "Waterfront Benchmark", themes: ["Waterfront", "Technology", "Campus Style", "Ballpark District"], reason: "Important for understanding the ballpark, South Beach, and Mission Bay transition near Caltrain.", comparisonAddresses: ["345 Spear St", "500 Terry Francois Blvd", "301 Brannan St"] }),
  canonicalBuilding({ name: "One Embarcadero South", address: "425 1st St", districtKey: "southBeach", role: "Neighborhood Anchor", themes: ["Mixed Use", "Residential/Commercial", "Neighborhood Anchor"], reason: "Helps explain South Beach as a mixed-use neighborhood rather than a pure office district.", comparisonAddresses: ["121 Spear St", "188 Spear St", "303 2nd St"] }),

  canonicalBuilding({ name: "99 Rhode Island", address: "99 Rhode Island St", districtKey: "potreroHill", role: "Creative Benchmark", themes: ["Creative Office", "Mid-Rise", "Neighborhood Edge"], reason: "Fits the Potrero and Showplace transition and illustrates smaller creative office options.", comparisonAddresses: ["300 De Haro St", "550 15th St", "1455 17th St"], secondaryDistrictKeys: ["showplaceSquare"] }),
  canonicalBuilding({ name: "1000 16th / Potrero 1010", address: "1000 16th St", districtKey: "potreroHill", role: "Neighborhood Anchor", themes: ["Mixed Use", "Neighborhood Anchor", "Transit Edge"], reason: "Explains how the 16th Street corridor is becoming a mixed-use gateway.", assetClass: "District Anchor", buildingType: "District Anchor", comparisonAddresses: ["150 Hooper St", "99 Rhode Island St", "600 16th St"] }),
  canonicalBuilding({ name: "150 Hooper", address: "150 Hooper St", districtKey: "potreroHill", role: "Neighborhood Anchor", themes: ["Institutional", "Design/Education", "Creative Production"], reason: "Helps explain Potrero's relationship to design, making, education, and production-oriented activity.", assetClass: "District Anchor", buildingType: "District Anchor", comparisonAddresses: ["1000 16th St", "300 De Haro St", "350 Rhode Island St"] }),
  canonicalBuilding({ name: "350 Rhode Island", address: "350 Rhode Island St", districtKey: "potreroHill", role: "Historic Benchmark", themes: ["Historic Character", "Production", "Neighborhood Anchor"], reason: "Useful for understanding older Potrero industrial and commercial character.", comparisonAddresses: ["99 Rhode Island St", "1700 17th St", "1455 17th St"] }),
  canonicalBuilding({ name: "1700 17th", address: "1700 17th St", districtKey: "potreroHill", role: "Production / Flex Benchmark", themes: ["Flex", "Production", "Creative Office"], reason: "Represents the lower-rise production and flex environment that distinguishes Potrero from Mission Bay.", comparisonAddresses: ["1840 17th St", "350 Rhode Island St", "1501 Mariposa St"] }),
  canonicalBuilding({ name: "1840 17th", address: "1840 17th St", districtKey: "potreroHill", role: "Production / Flex Benchmark", themes: ["Flex", "Industrial", "Production"], reason: "A useful operational counterpoint to office-heavy SoMa and Mission Bay buildings.", comparisonAddresses: ["1700 17th St", "2400 16th St", "1501 Mariposa St"] }),
  canonicalBuilding({ name: "550 15th", address: "550 15th St", districtKey: "potreroHill", role: "Creative Benchmark", themes: ["Creative Office", "Production Adjacent", "Neighborhood Edge"], reason: "Explains the Potrero and Showplace overlap for companies needing office plus practical access.", comparisonAddresses: ["99 Rhode Island St", "300 De Haro St", "500 De Haro St"] }),
  canonicalBuilding({ name: "1455 17th", address: "1455 17th St", districtKey: "potreroHill", role: "Value Benchmark", themes: ["Neighborhood Office", "Creative Office", "Mid-Rise"], reason: "A smaller-format example that keeps the Potrero collection from over-indexing on redevelopment sites.", comparisonAddresses: ["99 Rhode Island St", "350 Rhode Island St", "1700 17th St"] }),

  canonicalBuilding({ name: "San Francisco Armory", address: "1800 Mission St", districtKey: "missionDistrict", role: "District Icon", themes: ["Historic", "Adaptive Reuse", "Production", "Large Floorplates"], reason: "The Mission's clearest large-format commercial landmark and adaptive-reuse reference.", comparisonAddresses: ["1850 Bryant St", "2741 16th St", "3150 18th St"], assetClass: "District Anchor", buildingType: "District Anchor" }),
  canonicalBuilding({ name: "Heath Ceramics San Francisco", address: "2900 18th St", districtKey: "missionDistrict", role: "Neighborhood Anchor", themes: ["Maker", "Neighborhood Anchor", "Design", "Adaptive Reuse"], reason: "Shows how the Mission supports production, retail, food, design, and community-facing business under one roof.", comparisonAddresses: ["3150 18th St", "2400 16th St", "2 Henry Adams St"], assetClass: "District Anchor", buildingType: "District Anchor" }),
  canonicalBuilding({ name: "1850 Bryant", address: "1850 Bryant St", districtKey: "missionDistrict", role: "Innovation Benchmark", themes: ["Office/R&D", "Modern Class A", "Innovation", "Emerging"], reason: "Explains where the Mission may support innovation uses without becoming SoMa.", comparisonAddresses: ["1800 Mission St", "2400 16th St", "1700 17th St"] }),
  canonicalBuilding({ name: "Mission Creative / Daziel Building", address: "2741 16th St", districtKey: "missionDistrict", role: "Creative Benchmark", themes: ["Creative Office", "Adaptive Reuse", "Neighborhood Anchor"], reason: "Useful smaller-scale creative-office reference near the 16th Street corridor.", comparisonAddresses: ["1880 Mission St", "1800 Mission St", "3150 18th St"] }),
  canonicalBuilding({ name: "1880 Mission", address: "1880 Mission St", districtKey: "missionDistrict", role: "Transit-Oriented Benchmark", themes: ["Neighborhood Office", "Transit Oriented", "Mid-Rise"], reason: "Represents practical transit-oriented office near 16th Street BART and Mission Street activity.", comparisonAddresses: ["2741 16th St", "1800 Mission St", "1850 Bryant St"] }),
  canonicalBuilding({ name: "3150 18th", address: "3150 18th St", districtKey: "missionDistrict", role: "Creative Benchmark", themes: ["Creative Office", "Maker", "Adaptive Reuse"], reason: "Helps explain the Alabama and 18th Street creative-production cluster.", comparisonAddresses: ["2900 18th St", "2741 16th St", "2400 16th St"] }),
  canonicalBuilding({ name: "2400 16th", address: "2400 16th St", districtKey: "missionDistrict", role: "Production / Flex Benchmark", themes: ["Flex", "Production", "Neighborhood Edge"], reason: "Represents the Mission's production/flex edge near Potrero and Showplace Square.", comparisonAddresses: ["1850 Bryant St", "1700 17th St", "3150 18th St"] }),
  canonicalBuilding({ name: "2601 Mission / New Mission Theater", address: "2601 Mission St", districtKey: "missionDistrict", role: "Neighborhood Anchor", themes: ["Historic", "Mixed Use", "Neighborhood Anchor"], reason: "A key commercial landmark for understanding Mission Street's neighborhood-serving and entertainment identity.", assetClass: "District Anchor", buildingType: "District Anchor", comparisonAddresses: ["1800 Mission St", "1880 Mission St", "2741 16th St"] }),
]
  .concat(sacramentoIndustrialFlexBuildingBriefs.canonicalBuildings || [])
  .concat(denverIndustrialFlexBuildingBriefs.canonicalBuildings || [])
  .concat(denverEcosystemBalanceBuildingBriefs.canonicalBuildings || [])
  .concat(auroraIndustrialFlexBuildingBriefs.canonicalBuildings || [])
  .concat(auroraMedicalBuildingBriefs.canonicalBuildings || [])
  .concat(invernessOfficeBuildingBriefs.canonicalBuildings || [])
  .concat(indianapolisTempeIndustrialFlexBuildingBriefs.canonicalBuildings || [])
  .concat(seattleOfficeBuildingBriefs.canonicalBuildings || [])
  .concat(sanFranciscoIndustrialFlexBuildingBriefs.canonicalBuildings || []);

function buildingBrief(fields) {
  const snapshot = Array.isArray(fields.snapshot) ? fields.snapshot : [];
  const nearbyDistricts = Array.isArray(fields.nearbyDistricts) ? fields.nearbyDistricts : [];
  const nearbyAlternatives = Array.isArray(fields.nearbyAlternatives) ? fields.nearbyAlternatives : nearbyDistricts;
  const quickFacts = Array.isArray(fields.quickFacts) ? fields.quickFacts : snapshot;
  const idealFor = Array.isArray(fields.idealFor) ? fields.idealFor : fields.bestFit || [];
  const districtContext = fields.districtContext || fields.locationContext || "";

  return {
    status: "published",
    ...fields,
    summary: fields.summary || fields.buildingSummary || "",
    rofoTake: fields.rofoTake || fields.buildingImportance || "",
    buildingSummary: fields.buildingSummary || fields.summary || "",
    buildingImportance: fields.buildingImportance || fields.rofoTake || "",
    snapshot: Array.isArray(fields.snapshot) ? fields.snapshot : quickFacts,
    quickFacts,
    bestFit: Array.isArray(fields.bestFit) ? fields.bestFit : idealFor,
    idealFor,
    locationContext: fields.locationContext || districtContext,
    districtContext,
    validationNotes: Array.isArray(fields.validationNotes) ? fields.validationNotes : fields.validationChecklist || [],
    nearbyDistricts: Array.isArray(fields.nearbyDistricts) ? fields.nearbyDistricts : nearbyAlternatives,
    nearbyAlternatives,
    relatedInsights: Array.isArray(fields.relatedInsights) ? fields.relatedInsights : [],
    representativeCompanies: Array.isArray(fields.representativeCompanies) ? fields.representativeCompanies : [],
  };
}

const buildingBriefsByPath = {
  [buildingPath("70 Pier Bldg 102")]: buildingBrief({
    buildingSummary:
      "Pier 70 Building 12 is a Dogpatch adaptive reuse Building Profile for teams comparing waterfront industrial character, creative office identity, and Mission Bay adjacency. It is useful when a company wants modern commercial function without losing the district's shipyard and production history.",
    buildingImportance:
      "Pier 70 Building 12 matters because it is one of the clearest examples of Dogpatch's commercial transition. It helps explain why the district is not just a cheaper Mission Bay alternative: the value comes from adapted industrial fabric, waterfront redevelopment, and a more character-driven workplace story.",
    quickFacts: [
      { label: "Primary use", value: "Creative office and adaptive reuse commercial environment" },
      { label: "Building type", value: "Waterfront industrial adaptive reuse" },
      { label: "Commercial role", value: "Pier 70 mixed commercial anchor" },
      { label: "District", value: "Dogpatch" },
      { label: "Evidence role", value: "District-defining adaptive reuse benchmark" },
      { label: "Transit context", value: "Dogpatch and Mission Bay edge access; commute fit should be validated by employee origins" },
      { label: "Parking context", value: "Parking, loading, visitor access, and event-area circulation should be validated building by building" },
    ],
    idealFor: [
      "Creative, product, maker-oriented, and innovation teams that want an office environment with visible industrial character.",
      "Companies comparing Dogpatch's waterfront reuse story with Mission Bay's more planned innovation district.",
      "Teams that want a memorable workplace setting without choosing a traditional downtown tower.",
      "Organizations that can benefit from Pier 70 identity while still validating daily access and suite fit.",
    ],
    mayNotFit: [
      "Firms that need the formal client-facing image of the Financial District.",
      "Companies that require validated lab, medical, or heavy production infrastructure without property-specific diligence.",
      "Teams whose commute pattern depends on immediate BART access or dense downtown services.",
      "Users that prefer predictable new-construction office standards over adaptive reuse character.",
    ],
    buildingExperience:
      "The experience is shaped by waterfront redevelopment, industrial reuse, and a less conventional office rhythm. That can strengthen culture and recruiting for teams that value character, but it also means the available suite, access pattern, and support services should be checked more carefully than in a standardized tower.",
    districtContext:
      "Pier 70 Building 12 anchors the waterfront side of Dogpatch and should be compared with Pier 70 Building 101 for historic reuse, Power Station buildings for future office/R&D scale, and American Industrial Center when practical maker and small-business roots matter more than redevelopment polish.",
    advantages: [
      "Strongest Dogpatch example of modern commercial use inside adapted industrial waterfront fabric.",
      "Clear contrast against Mission Bay's newer and more institutional identity.",
      "Useful for teams that want workplace character to carry part of the company story.",
      "Helps explain Pier 70 as a district anchor rather than a generic building cluster.",
    ],
    tradeoffs: [
      "Adaptive reuse character only matters if the specific suite supports the team's layout, systems, and access needs.",
      "The setting may require more commute, visitor, parking, and delivery diligence than a central downtown building.",
      "Companies needing formal executive image may find the industrial waterfront story too informal.",
      "Specialized operations should not be inferred from district history without direct validation.",
    ],
    validationNotes: [
      "Does the available space support the team's actual office, production-adjacent, or collaboration needs?",
      "How do employees and visitors reach the building by transit, bike, rideshare, car, and on event days?",
      "Are loading, after-hours access, power, ventilation, and buildout constraints relevant to the use case?",
      "Would Mission Bay provide a clearer innovation identity, or does Pier 70's industrial character strengthen the decision?",
      "Does the surrounding waterfront redevelopment support daily work routines, clients, and recruiting?",
    ],
    nearbyAlternatives: [
      { label: "Pier 70 Building 101", url: "/commercial-real-estate/building/CA/san-francisco/pier-70-building-101/", reason: "A direct comparison for historic shipyard reuse and waterfront character." },
      { label: "Power Station - Station A", url: "/commercial-real-estate/building/CA/san-francisco/1201-illinois-st/", reason: "Compare when the tenant wants a larger redevelopment anchor and office/R&D growth story." },
      { label: "American Industrial Center", url: "/commercial-real-estate/building/CA/san-francisco/2325-3rd-st/", reason: "Useful when maker, studio, and practical production roots matter more than waterfront redevelopment identity." },
      { label: "500 Terry Francois", url: "/commercial-real-estate/building/CA/san-francisco/500-terry-francois-blvd/", reason: "A stronger comparison when Mission Bay waterfront office context is more important than industrial reuse." },
      { label: "Dogpatch", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", reason: "Use the district page to compare Pier 70, Power Station, maker, industrial, and Mission Bay-edge patterns." },
    ],
    representativeCompanies: [
      "Creative office, product, maker, design, innovation, and production-adjacent teams are the most relevant company categories.",
      "Current tenant names, availability, delivery condition, and technical specifications should be verified from current source materials.",
    ],
    relatedInsights: [
      { title: "Dogpatch commercial real estate", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", summary: "Understand Dogpatch's industrial reuse, waterfront, and Mission Bay-adjacent commercial identity." },
      { title: "Mission Bay commercial real estate", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", summary: "Compare the more planned innovation district when institutional adjacency matters more than industrial character." },
      { title: "Tenant Improvements", url: "/commercial-real-estate/lease-guide/tenant-improvements/", summary: "Validate buildout, systems, delivery condition, and cost before leasing adaptive reuse space." },
    ],
  }),
  [buildingPath("Pier 70 Building 101")]: buildingBrief({
    buildingSummary:
      "Pier 70 Building 101 is a historic Dogpatch shipyard reuse profile for businesses evaluating character-rich waterfront commercial environments. It helps teams compare older industrial identity with newer Dogpatch and Mission Bay innovation buildings.",
    buildingImportance:
      "Pier 70 Building 101 matters because it keeps Dogpatch's waterfront story grounded in historic industrial reuse rather than only future development. It helps Rofo explain the district's long-term commercial identity, where shipyard fabric, creative use, and redevelopment potential overlap.",
    quickFacts: [
      { label: "Primary use", value: "Adaptive reuse commercial environment" },
      { label: "Building type", value: "Historic shipyard adaptive reuse" },
      { label: "Commercial role", value: "Historic waterfront reuse benchmark" },
      { label: "District", value: "Dogpatch" },
      { label: "Evidence role", value: "Historic industrial character reference" },
      { label: "Transit context", value: "Dogpatch waterfront access; last-mile commute and visitor movement should be validated" },
      { label: "Parking context", value: "Parking, loading, and visitor arrival are building-specific and should be confirmed early" },
    ],
    idealFor: [
      "Creative, design, production-adjacent, and innovation teams that want a visible connection to San Francisco industrial history.",
      "Companies comparing historic adaptive reuse against newer Power Station or Mission Bay workspace.",
      "Teams that value waterfront district character more than a conventional office address.",
      "Organizations that can tolerate more building-specific diligence in exchange for a differentiated workplace story.",
    ],
    mayNotFit: [
      "Client-facing professional-service firms that need a formal Financial District address.",
      "Teams requiring predictable modern office systems without adaptive reuse diligence.",
      "Users that need validated lab, medical, or heavy industrial capabilities before shortlisting.",
      "Companies whose employees need the broadest central transit access.",
    ],
    buildingExperience:
      "The experience is historic, waterfront-oriented, and more distinctive than conventional office inventory. It can work well for teams that want the building itself to explain the company culture, but users should validate systems, circulation, access, and buildout needs before relying on the character alone.",
    districtContext:
      "Pier 70 Building 101 reinforces Dogpatch's shipyard identity and pairs naturally with Pier 70 Building 12. It should be compared with Station A and the 200/300 23rd Street Power Station buildings when the tenant wants a more future-facing redevelopment setting.",
    advantages: [
      "Strong evidence of Dogpatch's historic industrial and waterfront identity.",
      "Useful contrast to Mission Bay's newer institutional and innovation-campus environment.",
      "Helps creative and production-adjacent users evaluate character as a real business fit factor.",
      "Supports district storytelling without relying on trophy-building logic.",
    ],
    tradeoffs: [
      "Historic character can come with more uncertainty around systems, layout, accessibility, and buildout.",
      "The location may be less straightforward for some clients or employees than downtown or Mission Bay options.",
      "Not every creative team benefits enough from character to offset operational diligence.",
      "Specialized infrastructure should be confirmed from current property materials.",
    ],
    validationNotes: [
      "Does the suite condition support the intended workplace without excessive tenant improvements?",
      "How do access, loading, security, and after-hours use work for the team's operating pattern?",
      "Would Pier 70 Building 12 or Station A provide a clearer balance of character and functionality?",
      "Does the waterfront location help recruiting and culture, or does it complicate daily routines?",
      "What current building systems and permitted uses must be confirmed before touring?",
    ],
    nearbyAlternatives: [
      { label: "Pier 70 Building 12", url: "/commercial-real-estate/building/CA/san-francisco/70-pier-bldg-102/", reason: "The closest comparison for modern commercial reuse at Pier 70." },
      { label: "Power Station - Station A", url: "/commercial-real-estate/building/CA/san-francisco/1201-illinois-st/", reason: "Compare when a landmark redevelopment anchor is more useful than historic shipyard reuse." },
      { label: "American Industrial Center", url: "/commercial-real-estate/building/CA/san-francisco/2325-3rd-st/", reason: "A practical counterpoint for maker, studio, and small-business production environments." },
      { label: "900 Minnesota", url: "/commercial-real-estate/building/CA/san-francisco/900-minnesota-st/", reason: "Useful when lower-rise neighborhood creative character matters more than the Pier 70 waterfront story." },
      { label: "Mission Bay", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", reason: "Compare when the business needs a newer, more institutional innovation district." },
    ],
    representativeCompanies: [
      "Creative office, design, maker, production-adjacent, and innovation teams are the most relevant categories.",
      "Tenant names, suite condition, and building-system claims should be validated from current sources.",
    ],
    relatedInsights: [
      { title: "Dogpatch commercial real estate", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", summary: "Compare Dogpatch's waterfront reuse, maker, and office/R&D patterns." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Compare layout, access, systems, buildout, and business fit before selecting adaptive reuse space." },
      { title: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", summary: "Use district fit and operating needs to decide whether character should lead the search." },
    ],
  }),
  [buildingPath("1201 Illinois St")]: buildingBrief({
    buildingSummary:
      "Power Station - Station A is a Dogpatch Building Profile for companies evaluating large-scale waterfront redevelopment, office/R&D potential, and industrial heritage near Mission Bay. It helps distinguish Dogpatch's future growth story from both older maker buildings and established Mission Bay campuses.",
    buildingImportance:
      "Station A matters because it is a landmark example of Dogpatch moving from industrial infrastructure toward innovation-oriented commercial use. It explains why the district can support more ambitious office and R&D conversations while still requiring careful validation around delivery, building systems, and district maturity.",
    quickFacts: [
      { label: "Primary use", value: "Office/R&D-oriented commercial redevelopment context" },
      { label: "Building type", value: "Industrial innovation district anchor" },
      { label: "Commercial role", value: "Power Station transition anchor" },
      { label: "District", value: "Dogpatch" },
      { label: "Evidence role", value: "Future-facing waterfront redevelopment benchmark" },
      { label: "Transit context", value: "Dogpatch and Mission Bay access; commute fit should be tested by team origin" },
      { label: "Parking context", value: "Parking, visitor access, and event-area circulation should be validated directly" },
    ],
    idealFor: [
      "Innovation, office/R&D, technology, and life-science-adjacent teams that want a Dogpatch growth story.",
      "Companies comparing future-oriented Dogpatch redevelopment against Mission Bay's established institutional setting.",
      "Teams that value larger-scale identity but do not want a traditional Financial District or Transbay tower.",
      "Organizations that can validate technical and timing requirements before assuming specialized fit.",
    ],
    mayNotFit: [
      "Companies that need immediately proven lab or clinical infrastructure without uncertainty.",
      "Firms that want a mature downtown client-services environment.",
      "Teams that prefer established street amenities and transit density over future redevelopment upside.",
      "Users that cannot tolerate delivery, buildout, or infrastructure validation risk.",
    ],
    buildingExperience:
      "The experience is about transformation and scale. Station A can make a workplace feel connected to Dogpatch's future rather than its older small-bay roots, but tenants should treat that future orientation as a diligence item, not as proof that every space will fit advanced operations.",
    districtContext:
      "Station A anchors the Power Station side of Dogpatch and should be read with 300 23rd St and 200 23rd St. Together they explain the district's modern office/R&D potential, while Pier 70 and American Industrial Center explain the industrial reuse and maker roots around it.",
    advantages: [
      "Strong landmark signal for Dogpatch's waterfront redevelopment future.",
      "Relevant to office/R&D and innovation users comparing Dogpatch with Mission Bay.",
      "Helps explain district scale beyond small creative and maker buildings.",
      "Useful anchor for companies that want a differentiated San Francisco location story.",
    ],
    tradeoffs: [
      "Future-facing redevelopment may create more timing and delivery questions than established buildings.",
      "Technical capability should be validated for the specific space, not assumed from positioning.",
      "The district may feel less mature than Mission Bay for some institutional or life-science users.",
      "Client-facing firms may prefer a more conventional downtown address.",
    ],
    validationNotes: [
      "What is the current delivery status, suite condition, and buildout path for the specific requirement?",
      "Does the building support office, R&D, or specialized use needs without unsupported assumptions?",
      "How do commute, event-area movement, parking, and visitor access work in practice?",
      "Would 300 23rd St, 200 23rd St, or Mission Bay provide a clearer fit?",
      "Does Dogpatch's redevelopment story strengthen the company narrative enough to justify the tradeoffs?",
    ],
    nearbyAlternatives: [
      { label: "Power Station - 300 23rd St", url: "/commercial-real-estate/building/CA/san-francisco/300-23rd-st/", reason: "A direct comparison for next-generation Dogpatch office/R&D workspace." },
      { label: "Power Station - 200 23rd St", url: "/commercial-real-estate/building/CA/san-francisco/200-23rd-st/", reason: "Useful for understanding Power Station supply depth and scale." },
      { label: "Pier 70 Building 12", url: "/commercial-real-estate/building/CA/san-francisco/70-pier-bldg-102/", reason: "Compare when adaptive reuse character matters more than future redevelopment scale." },
      { label: "550 Terry A Francois", url: "/commercial-real-estate/building/CA/san-francisco/550-terry-a-francois-blvd/", reason: "A stronger Mission Bay comparison when office/lab adjacency and innovation identity are central." },
      { label: "600 16th St", url: "/commercial-real-estate/building/CA/san-francisco/600-16th-st/", reason: "Compare when institutional research adjacency matters more than Dogpatch flexibility." },
    ],
    representativeCompanies: [
      "Innovation, technology, office/R&D, life-science-adjacent, and product teams are the most relevant categories.",
      "Delivery status, infrastructure, tenant names, and availability should be verified from current building materials.",
    ],
    relatedInsights: [
      { title: "Dogpatch commercial real estate", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", summary: "Understand how Power Station, Pier 70, maker, and Mission Bay-edge patterns fit together." },
      { title: "Mission Bay commercial real estate", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", summary: "Compare a more established innovation and institutional district before choosing Dogpatch." },
      { title: "Commercial Leasing Timeline", url: "/commercial-real-estate/lease-guide/commercial-leasing-timeline/", summary: "Plan timing carefully when redevelopment, buildout, or delivery status affects the decision." },
    ],
  }),
  [buildingPath("300 23rd St")]: buildingBrief({
    buildingSummary:
      "Power Station - 300 23rd St is a Dogpatch office/R&D Building Profile for teams that need more scale and capability than legacy creative buildings usually provide. It is most useful for comparing Dogpatch's next-generation workspace with Mission Bay innovation buildings.",
    buildingImportance:
      "300 23rd St matters because it shows that Dogpatch can support a more modern office/R&D conversation without becoming Mission Bay. It gives Rofo a concrete example of the district's future supply: larger, flexible, waterfront-adjacent, and still tied to an industrial redevelopment story.",
    quickFacts: [
      { label: "Primary use", value: "Office/R&D-oriented workspace context" },
      { label: "Building type", value: "Modern waterfront office/R&D building" },
      { label: "Commercial role", value: "Next-generation workspace benchmark" },
      { label: "District", value: "Dogpatch" },
      { label: "Evidence role", value: "Modern Power Station workspace example" },
      { label: "Transit context", value: "Dogpatch and Mission Bay access; last-mile employee routes should be validated" },
      { label: "Parking context", value: "Parking, loading, deliveries, and visitor arrival should be confirmed for the specific use" },
    ],
    idealFor: [
      "Office/R&D, innovation, technology, and product teams comparing Dogpatch with Mission Bay.",
      "Companies that need a more capable modern environment than smaller converted industrial buildings.",
      "Teams that value waterfront redevelopment identity and potential future scale.",
      "Organizations that can validate technical requirements rather than assuming lab or specialized-use readiness.",
    ],
    mayNotFit: [
      "Users that need fully proven laboratory infrastructure before shortlisting.",
      "Companies that prefer the formal business-service ecosystem of the Financial District.",
      "Small creative teams that would overpay for scale or technical positioning they do not need.",
      "Tenants seeking the most mature neighborhood amenities and transit predictability.",
    ],
    buildingExperience:
      "The experience is more modern and growth-oriented than Dogpatch's smaller maker buildings. It should be evaluated as a practical innovation workplace: useful when flexibility, scale, and Mission Bay adjacency matter, but dependent on suite-level validation for infrastructure, timing, and operations.",
    districtContext:
      "300 23rd St is part of the Power Station pattern with Station A and 200 23rd St. It helps explain Dogpatch's ability to support modern office/R&D users while nearby Pier 70 and American Industrial Center preserve the district's adaptive reuse and production roots.",
    advantages: [
      "Clear evidence of Dogpatch's modern office/R&D direction.",
      "Stronger scale and capability signal than smaller neighborhood creative buildings.",
      "Useful Mission Bay comparison for teams that want adjacency without a fully institutional setting.",
      "Helps explain the Power Station cluster as a repeatable district pattern.",
    ],
    tradeoffs: [
      "Technical suitability must be verified for the actual space and use case.",
      "Future supply and redevelopment context can introduce timing and maturity questions.",
      "May be too specialized or large-scale for smaller creative or maker users.",
      "Daily access and visitor experience may be less obvious than in downtown districts.",
    ],
    validationNotes: [
      "What uses, systems, ceiling heights, power, ventilation, and loading conditions are actually supported?",
      "Does the available space fit office/R&D needs without assuming laboratory capability?",
      "How does the commute compare with Mission Bay, SoMa, and South Beach alternatives?",
      "Would 200 23rd St, Station A, 550 Terry A Francois, or 409 Illinois be a better comparison?",
      "Does the team benefit from Dogpatch identity, or is Mission Bay's established ecosystem more important?",
    ],
    nearbyAlternatives: [
      { label: "Power Station - 200 23rd St", url: "/commercial-real-estate/building/CA/san-francisco/200-23rd-st/", reason: "A direct comparison for similar Power Station supply and scale." },
      { label: "Power Station - Station A", url: "/commercial-real-estate/building/CA/san-francisco/1201-illinois-st/", reason: "Compare when a larger landmark redevelopment anchor is central to the story." },
      { label: "550 Terry A Francois", url: "/commercial-real-estate/building/CA/san-francisco/550-terry-a-francois-blvd/", reason: "Useful when Mission Bay office/lab adjacency is a stronger fit." },
      { label: "409 Illinois", url: "/commercial-real-estate/building/CA/san-francisco/409-illinois-st/", reason: "A smaller Mission Bay waterfront-edge alternative for innovation users." },
      { label: "Pier 70 Building 12", url: "/commercial-real-estate/building/CA/san-francisco/70-pier-bldg-102/", reason: "Compare when adaptive reuse character matters more than modern workspace scale." },
    ],
    representativeCompanies: [
      "Office/R&D, innovation, technology, product, and life-science-adjacent users are the most relevant categories.",
      "Infrastructure, tenant names, suite condition, and availability should be verified from current sources.",
    ],
    relatedInsights: [
      { title: "Dogpatch commercial real estate", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", summary: "Compare Dogpatch's modern redevelopment with its industrial and maker roots." },
      { title: "Mission Bay commercial real estate", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", summary: "Use Mission Bay as the comparison when health, research, and institutional adjacency lead the decision." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Validate space, access, systems, cost, and operating fit before choosing a building." },
    ],
  }),
  [buildingPath("200 23rd St")]: buildingBrief({
    buildingSummary:
      "Power Station - 200 23rd St is a Dogpatch Building Profile for tenants evaluating the depth of future office/R&D supply around Power Station. It helps companies decide whether Dogpatch offers a real multi-building option set or only a few isolated redevelopment examples.",
    buildingImportance:
      "200 23rd St matters because it complements Station A and 300 23rd St. It shows that the Power Station story is not a single-building signal; it is a district-scale pattern that may matter to companies needing growth options, innovation identity, and Mission Bay proximity with a different character.",
    quickFacts: [
      { label: "Primary use", value: "Office/R&D-oriented commercial environment" },
      { label: "Building type", value: "Power Station office/R&D supply depth" },
      { label: "Commercial role", value: "Power Station scale complement" },
      { label: "District", value: "Dogpatch" },
      { label: "Evidence role", value: "Multi-building redevelopment depth benchmark" },
      { label: "Transit context", value: "Dogpatch and Mission Bay edge access; employee routes should be validated" },
      { label: "Parking context", value: "Parking, loading, service access, and visitor movement should be confirmed by requirement" },
    ],
    idealFor: [
      "R&D-oriented, technology, innovation, and growth companies that want multiple Dogpatch options in one district context.",
      "Teams comparing Power Station supply depth against Mission Bay's more specialized building inventory.",
      "Organizations that value flexible future growth more than a conventional downtown address.",
      "Companies that need to understand Dogpatch as a portfolio of options rather than a one-off building.",
    ],
    mayNotFit: [
      "Businesses that need established office tower image or immediate Financial District client access.",
      "Users requiring proven wet-lab or specialized infrastructure without current building validation.",
      "Small teams that would be better served by lower-rise creative or maker buildings.",
      "Companies that cannot accept redevelopment timing or district-maturity uncertainty.",
    ],
    buildingExperience:
      "The experience should be assessed as part of the Power Station cluster. It may support teams that want modern workplace options near Mission Bay, but the value depends on whether the specific building, suite, timing, and operating conditions match the business need.",
    districtContext:
      "200 23rd St gives Dogpatch's Power Station area more than one reference point. It should be compared with 300 23rd St for similar modern scale, Station A for landmark identity, and 409 Illinois or 550 Terry A Francois when Mission Bay's innovation context is more important.",
    advantages: [
      "Shows Dogpatch has more than one modern Power Station option.",
      "Useful for growth companies evaluating district depth and future flexibility.",
      "Connects Dogpatch's industrial redevelopment story to office/R&D demand.",
      "Helps compare Dogpatch with Mission Bay without collapsing the two districts together.",
    ],
    tradeoffs: [
      "Future supply depth does not guarantee the right suite, timing, or infrastructure.",
      "The building may be less useful for tenants that need immediate neighborhood amenity density.",
      "Specialized operations need direct validation rather than assumptions from evidence role.",
      "The location story may be less familiar to clients than downtown or Mission Bay.",
    ],
    validationNotes: [
      "Does the current building status align with the tenant's timeline?",
      "What infrastructure, loading, power, ventilation, security, and operating limits apply?",
      "Would 300 23rd St or Station A provide clearer scale, identity, or timing?",
      "Is Dogpatch's flexibility more valuable than Mission Bay's established institutional cluster?",
      "How do employee commute, parking, and visitor patterns compare with SoMa and Mission Bay alternatives?",
    ],
    nearbyAlternatives: [
      { label: "Power Station - 300 23rd St", url: "/commercial-real-estate/building/CA/san-francisco/300-23rd-st/", reason: "The closest comparison for modern Power Station office/R&D context." },
      { label: "Power Station - Station A", url: "/commercial-real-estate/building/CA/san-francisco/1201-illinois-st/", reason: "Compare when landmark redevelopment identity matters more than portfolio depth." },
      { label: "409 Illinois", url: "/commercial-real-estate/building/CA/san-francisco/409-illinois-st/", reason: "A Mission Bay-edge comparison when smaller waterfront innovation space may be clearer." },
      { label: "550 Terry A Francois", url: "/commercial-real-estate/building/CA/san-francisco/550-terry-a-francois-blvd/", reason: "Useful when office/lab adjacency and Mission Bay identity are stronger priorities." },
      { label: "Pier 70 Building 12", url: "/commercial-real-estate/building/CA/san-francisco/70-pier-bldg-102/", reason: "Compare when adapted industrial character is more important than modern supply depth." },
    ],
    representativeCompanies: [
      "R&D-oriented, technology, innovation, product, and life-science-adjacent users are the most relevant categories.",
      "Current delivery, tenant, availability, and infrastructure details should be verified before reliance.",
    ],
    relatedInsights: [
      { title: "Dogpatch commercial real estate", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", summary: "Use the district guide to compare Power Station, Pier 70, maker, and Mission Bay-edge options." },
      { title: "Mission Bay commercial real estate", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", summary: "Compare when institutional adjacency or stronger innovation-campus context matters." },
      { title: "Commercial Leasing Timeline", url: "/commercial-real-estate/lease-guide/commercial-leasing-timeline/", summary: "Plan around delivery, buildout, infrastructure, and approval timing." },
    ],
  }),
  [buildingPath("654 Minnesota St")]: buildingBrief({
    buildingSummary:
      "UCSF Life Sciences Building is a Dogpatch Building Profile for organizations comparing life-science adjacency, Mission Bay institutional gravity, and Dogpatch flexibility. It helps users understand that proximity to research anchors can matter without assuming every nearby building is lab-ready.",
    buildingImportance:
      "654 Minnesota matters because it links Dogpatch to the Mission Bay health, research, and life-science ecosystem. It gives Rofo a bridge example: relevant to research-adjacent users, but also a reminder that district adjacency is not the same as verified laboratory infrastructure.",
    quickFacts: [
      { label: "Primary use", value: "Institutional life-science and research-adjacent context" },
      { label: "Building type", value: "Institutional life-science anchor" },
      { label: "Commercial role", value: "Mission Bay ecosystem bridge" },
      { label: "District", value: "Dogpatch" },
      { label: "Evidence role", value: "Life-science adjacency benchmark" },
      { label: "Transit context", value: "Dogpatch and Mission Bay access; institutional commute patterns should be checked" },
      { label: "Parking context", value: "Parking, patient or visitor movement, and operational access should be validated for the specific use" },
    ],
    idealFor: [
      "Research-adjacent, life-science support, health innovation, and institutional partner teams comparing Dogpatch with Mission Bay.",
      "Organizations that value UCSF proximity but may not need the most specialized Mission Bay lab setting.",
      "Companies trying to understand whether Dogpatch can support a flexible innovation-adjacent workplace.",
      "Teams that need proximity evidence while still validating technical requirements building by building.",
    ],
    mayNotFit: [
      "Users requiring confirmed wet lab, clinical, or regulated infrastructure before shortlisting.",
      "Companies that need a conventional office district or client-service setting.",
      "Teams that would be better served by Mission Bay's core institutional campus.",
      "Businesses that do not benefit from health, research, or life-science adjacency.",
    ],
    buildingExperience:
      "The experience is defined by institutional and Mission Bay adjacency rather than ordinary office identity. It can help a research-adjacent user stay near the ecosystem, but it requires careful validation of access, security, infrastructure, and whether Dogpatch's mixed industrial setting supports the actual work.",
    districtContext:
      "654 Minnesota sits at the point where Dogpatch starts to overlap with Mission Bay's life-science and research story. It should be compared with UCSF Mission Bay / Genentech Hall, 1700 Owens, and 550 Terry A Francois when institutional or technical fit is more important than Dogpatch character.",
    advantages: [
      "Strong bridge between Dogpatch and Mission Bay's health and research ecosystem.",
      "Useful evidence for life-science-adjacent teams evaluating Dogpatch.",
      "Helps distinguish proximity from true technical fit.",
      "Adds institutional context to a district otherwise known for industrial reuse and maker space.",
    ],
    tradeoffs: [
      "Adjacency to research anchors should not be treated as proof of suitable lab infrastructure.",
      "Dogpatch may be less mature than Mission Bay for specialized life-science users.",
      "Operational access, security, and visitor patterns may matter more than in ordinary office decisions.",
      "Teams without research adjacency needs may find the context less relevant.",
    ],
    validationNotes: [
      "What specific infrastructure, compliance, security, ventilation, or access needs must be verified?",
      "Does the team need Mission Bay's core institutional campus, or is Dogpatch adjacency enough?",
      "How do employees, collaborators, visitors, and deliveries move between Dogpatch and Mission Bay?",
      "Would 600 16th St, 1700 Owens, 550 Terry A Francois, or Station A be a better comparison?",
      "Is the use case office, research-adjacent, clinical-adjacent, or truly specialized laboratory work?",
    ],
    nearbyAlternatives: [
      { label: "UCSF Mission Bay / Genentech Hall", url: "/commercial-real-estate/building/CA/san-francisco/600-16th-st/", reason: "A stronger comparison when core institutional research adjacency should lead the decision." },
      { label: "The Exchange", url: "/commercial-real-estate/building/CA/san-francisco/1800-owens-st/", reason: "Useful when modern Mission Bay office context matters more than Dogpatch flexibility." },
      { label: "550 Terry A Francois", url: "/commercial-real-estate/building/CA/san-francisco/550-terry-a-francois-blvd/", reason: "Compare when office/lab adjacency and waterfront innovation identity are central." },
      { label: "Power Station - Station A", url: "/commercial-real-estate/building/CA/san-francisco/1201-illinois-st/", reason: "A Dogpatch alternative when redevelopment flexibility matters more than institutional proximity." },
      { label: "Mission Bay", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", reason: "Use the district guide to understand the stronger life-science and healthcare cluster." },
    ],
    representativeCompanies: [
      "Research-adjacent, life-science support, health innovation, institutional partner, and specialized office users are the most relevant categories.",
      "Tenant names, laboratory capabilities, clinical use, and infrastructure should be verified from current sources.",
    ],
    relatedInsights: [
      { title: "Mission Bay commercial real estate", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", summary: "Compare the core health, research, and innovation district before choosing a Dogpatch-edge location." },
      { title: "Dogpatch commercial real estate", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", summary: "Understand how Dogpatch blends industrial reuse, waterfront redevelopment, and Mission Bay adjacency." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Validate infrastructure, access, buildout, and operating fit before relying on proximity." },
    ],
  }),
  [buildingPath("2325 3rd St")]: buildingBrief({
    buildingSummary:
      "American Industrial Center is a Dogpatch Building Profile for maker, studio, production-adjacent, and small-business users evaluating converted industrial space. It is the practical counterweight to Pier 70 and Power Station redevelopment in the district evidence set.",
    buildingImportance:
      "American Industrial Center matters because it preserves the operating roots of Dogpatch. It shows that the district is not only about waterfront redevelopment or innovation branding; it also supports a durable mix of maker, studio, light production, and small-business environments.",
    quickFacts: [
      { label: "Primary use", value: "Maker, studio, creative, and production-adjacent commercial environment" },
      { label: "Building type", value: "Maker and industrial conversion" },
      { label: "Commercial role", value: "Small-business production roots" },
      { label: "District", value: "Dogpatch" },
      { label: "Evidence role", value: "Operational industrial conversion benchmark" },
      { label: "Transit context", value: "Dogpatch local access; transit, bike, vehicle, and delivery patterns should be validated" },
      { label: "Parking context", value: "Parking, loading, freight, and visitor access should be checked for each operation" },
    ],
    idealFor: [
      "Maker, studio, design, production-adjacent, and small-business operators that need practical creative-commercial space.",
      "Teams comparing Dogpatch with Potrero Hill, Showplace Square, and Mission District production edges.",
      "Businesses that value flexible, work-oriented space more than polished office image.",
      "Companies that need to understand operational fit before choosing a more expensive redevelopment asset.",
    ],
    mayNotFit: [
      "Corporate office users that need a polished lobby, formal address, or conventional client arrival.",
      "Tenants that require verified heavy industrial, lab, food production, or regulated infrastructure without direct diligence.",
      "Teams that prioritize dense downtown transit and amenities over operating flexibility.",
      "Large users that need standardized Class A floorplates or expansion predictability.",
    ],
    buildingExperience:
      "The experience is practical, local, and production-oriented. It can be highly useful for teams that need a working creative or maker environment, but the right answer depends on details such as loading, power, access, noise, permitted use, suite condition, and customer presentation.",
    districtContext:
      "American Industrial Center grounds Dogpatch in its maker and production roots. It should be compared with 700 Indiana and 900 Minnesota for smaller neighborhood-scale character, 1501 Mariposa for the Potrero edge, and Pier 70 when adaptive reuse image matters more than everyday operational utility.",
    advantages: [
      "Strong non-trophy evidence of Dogpatch's maker and production identity.",
      "Useful for small businesses and creative operators that need practical space.",
      "Provides a counterpoint to Power Station and Pier 70 redevelopment examples.",
      "Helps tenants compare Dogpatch with Potrero Hill and Showplace Square operating environments.",
    ],
    tradeoffs: [
      "Operational fit is highly specific and cannot be assumed from district identity.",
      "May not provide the image, amenities, or predictability expected by conventional office users.",
      "Visitor experience and customer presentation should be tested for client-facing businesses.",
      "Loading, power, ventilation, noise, access, and permitted use need explicit validation.",
    ],
    validationNotes: [
      "Does the space support the required production, studio, maker, or office-adjacent workflow?",
      "What loading, freight, power, ventilation, floor loading, access, and permitted-use details matter?",
      "Will the building experience work for employees, customers, vendors, and deliveries?",
      "Would 700 Indiana, 900 Minnesota, 1501 Mariposa, or Potrero Hill provide better operational fit?",
      "Does the business need creative character, practical utility, or both?",
    ],
    nearbyAlternatives: [
      { label: "700 Indiana", url: "/commercial-real-estate/building/CA/san-francisco/700-indiana-st/", reason: "A nearby smaller-format comparison for industrial conversion and creative use." },
      { label: "900 Minnesota", url: "/commercial-real-estate/building/CA/san-francisco/900-minnesota-st/", reason: "Useful when lower-rise neighborhood creative character matters more than operational scale." },
      { label: "1501 Mariposa", url: "/commercial-real-estate/building/CA/san-francisco/1501-mariposa-st/", reason: "Compare when production and flex needs point toward the Dogpatch and Potrero edge." },
      { label: "1700 17th", url: "/commercial-real-estate/building/CA/san-francisco/1700-17th-st/", reason: "A Potrero Hill comparison for lower-rise production and flex context." },
      { label: "2 Henry Adams St", url: "/commercial-real-estate/building/CA/san-francisco/2-henry-adams-st/", reason: "Compare when design, showroom, and production-adjacent demand needs more centrality." },
    ],
    representativeCompanies: [
      "Maker, studio, creative production, design, service-commercial, and small-business operators are the most relevant categories.",
      "Current tenants, availability, permitted use, and infrastructure should be verified from current property sources.",
    ],
    relatedInsights: [
      { title: "Dogpatch commercial real estate", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", summary: "Understand Dogpatch's maker, production, waterfront, and redevelopment patterns." },
      { title: "San Francisco commercial real estate", url: "/commercial-real-estate/CA/san-francisco/", summary: "Compare nearby production, flex, creative, and waterfront environments across the city." },
      { title: "Tenant Improvements", url: "/commercial-real-estate/lease-guide/tenant-improvements/", summary: "Validate buildout, infrastructure, use, timing, and cost before committing to converted industrial space." },
    ],
  }),
  [buildingPath("700 Indiana St")]: buildingBrief({
    buildingSummary:
      "700 Indiana is a Dogpatch Building Profile for smaller creative office, studio, and production-adjacent users that want industrial conversion character without the scale of Pier 70 or Power Station. It helps explain the district's neighborhood-scale commercial fabric.",
    buildingImportance:
      "700 Indiana matters because it shows that Dogpatch is not only a set of large waterfront redevelopment projects. Smaller converted buildings help define the everyday commercial market for creative, maker, service, and local production users.",
    quickFacts: [
      { label: "Primary use", value: "Creative office and production-adjacent commercial environment" },
      { label: "Building type", value: "Neighborhood-scale industrial conversion" },
      { label: "Commercial role", value: "Smaller Dogpatch format benchmark" },
      { label: "District", value: "Dogpatch" },
      { label: "Evidence role", value: "Small-format adaptive building example" },
      { label: "Transit context", value: "Local Dogpatch access; commute and visitor patterns should be tested by team origin" },
      { label: "Parking context", value: "Parking, curb access, loading, and delivery conditions should be validated for the specific use" },
    ],
    idealFor: [
      "Small creative, studio, design, production-adjacent, and service-commercial teams seeking Dogpatch character.",
      "Companies that want converted industrial space without choosing a large redevelopment anchor.",
      "Teams comparing Dogpatch's smaller buildings with Potrero Hill and Showplace Square alternatives.",
      "Businesses that value flexibility, character, and practical scale more than formal office presentation.",
    ],
    mayNotFit: [
      "Large users that need broad contiguous expansion or standardized Class A systems.",
      "Client-facing firms that need a polished downtown or executive address.",
      "Users that require heavy industrial, lab, or specialized infrastructure without detailed verification.",
      "Companies that need dense transit, hotel, and client-service amenities immediately outside the building.",
    ],
    buildingExperience:
      "The experience is smaller, more local, and more work-oriented than the district's largest redevelopment projects. It can be attractive for teams that want Dogpatch texture, but tenants should validate whether the building condition, access, and operational details fit the specific business.",
    districtContext:
      "700 Indiana sits in the everyday Dogpatch fabric between maker, creative, and industrial conversion patterns. It should be read with American Industrial Center and 900 Minnesota, then compared with Pier 70 Building 12 when a larger waterfront adaptive reuse setting is more appropriate.",
    advantages: [
      "Explains Dogpatch's smaller converted-building layer.",
      "Useful for creative and production-adjacent teams that do not need campus scale.",
      "Provides a practical comparison against American Industrial Center and 900 Minnesota.",
      "Helps prevent the district narrative from over-indexing on major redevelopment projects.",
    ],
    tradeoffs: [
      "Smaller converted buildings may offer less expansion flexibility and fewer amenities.",
      "Suite-level systems, layout, loading, and access must be validated.",
      "The visitor experience may be less polished than newer waterfront or downtown options.",
      "The building may not fit users with specialized infrastructure or formal image needs.",
    ],
    validationNotes: [
      "Does the available suite fit the team size, workflow, storage, collaboration, and production-adjacent needs?",
      "What building systems, loading, access, parking, and permitted-use details require confirmation?",
      "Would American Industrial Center or 900 Minnesota provide better operational fit or character?",
      "Would Pier 70 Building 12 provide a stronger client or recruiting story?",
      "Does the smaller building format support future growth, or only the current requirement?",
    ],
    nearbyAlternatives: [
      { label: "American Industrial Center", url: "/commercial-real-estate/building/CA/san-francisco/2325-3rd-st/", reason: "A stronger fit when maker, studio, or production utility is more important." },
      { label: "900 Minnesota", url: "/commercial-real-estate/building/CA/san-francisco/900-minnesota-st/", reason: "Useful when lower-rise neighborhood creative character is central." },
      { label: "Pier 70 Building 12", url: "/commercial-real-estate/building/CA/san-francisco/70-pier-bldg-102/", reason: "Compare when waterfront adaptive reuse and larger redevelopment identity matter more." },
      { label: "99 Rhode Island", url: "/commercial-real-estate/building/CA/san-francisco/99-rhode-island-st/", reason: "A Potrero Hill comparison for smaller creative office and neighborhood edge context." },
      { label: "Dogpatch", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", reason: "Use the district guide to compare smaller converted buildings with Pier 70 and Power Station." },
    ],
    representativeCompanies: [
      "Small creative, design, studio, production-adjacent, maker, and service-commercial teams are the most relevant categories.",
      "Current tenants, suite condition, permitted uses, and operating infrastructure should be verified directly.",
    ],
    relatedInsights: [
      { title: "Dogpatch commercial real estate", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", summary: "Compare Dogpatch's small-format, maker, waterfront, and redevelopment environments." },
      { title: "San Francisco commercial real estate", url: "/commercial-real-estate/CA/san-francisco/", summary: "Compare nearby lower-rise creative, production, and waterfront environments across the city." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Evaluate layout, access, operations, cost, and flexibility before shortlisting." },
    ],
  }),
  [buildingPath("900 Minnesota St")]: buildingBrief({
    buildingSummary:
      "900 Minnesota is a Dogpatch Building Profile for tenants evaluating lower-rise neighborhood creative office and production-adjacent character. It helps explain the human-scale side of Dogpatch between large waterfront redevelopment and practical maker buildings.",
    buildingImportance:
      "900 Minnesota matters because it shows Dogpatch as a lived-in commercial neighborhood, not only an emerging innovation district. It is useful for companies that want character, lower-rise identity, and production-adjacent surroundings while still comparing Mission Bay, Potrero Hill, and Showplace Square.",
    quickFacts: [
      { label: "Primary use", value: "Creative office and neighborhood commercial environment" },
      { label: "Building type", value: "Historic neighborhood creative office" },
      { label: "Commercial role", value: "Lower-rise neighborhood anchor" },
      { label: "District", value: "Dogpatch" },
      { label: "Evidence role", value: "Human-scale creative-production benchmark" },
      { label: "Transit context", value: "Dogpatch local and Mission Bay-adjacent access; route fit varies by commute pattern" },
      { label: "Parking context", value: "Parking, loading, and visitor access should be validated by building and operating schedule" },
    ],
    idealFor: [
      "Creative office, studio, neighborhood service, and production-adjacent teams that value lower-rise character.",
      "Companies comparing Dogpatch's human-scale commercial fabric with Mission Bay's planned environment.",
      "Teams that want a quieter, more local setting than central SoMa or downtown towers.",
      "Businesses that can benefit from district character without needing highly specialized infrastructure.",
    ],
    mayNotFit: [
      "Users that need large modern floorplates, formal tower amenities, or a flagship headquarters signal.",
      "Life-science, medical, or industrial users requiring specialized infrastructure without validation.",
      "Companies that need the densest transit and client-service access of the Financial District.",
      "Teams expecting the same amenity depth as Mission Bay or central SoMa.",
    ],
    buildingExperience:
      "The experience is lower-rise, neighborhood-oriented, and character-driven. It may fit teams that want Dogpatch's creative-production rhythm, but the building should be evaluated carefully for suite quality, employee routines, access, and whether the surrounding blocks support the company brand.",
    districtContext:
      "900 Minnesota helps explain the middle of Dogpatch's identity: less formal than Mission Bay, less large-scale than Power Station, and less operationally focused than American Industrial Center. It is a useful comparison for 700 Indiana and Potrero Hill creative buildings.",
    advantages: [
      "Shows Dogpatch's lower-rise neighborhood creative-office layer.",
      "Useful contrast against larger Pier 70 and Power Station assets.",
      "Helps creative teams evaluate district character and employee experience.",
      "Supports comparisons with Potrero Hill and Showplace Square without leaving the local context.",
    ],
    tradeoffs: [
      "May not offer the amenity depth or expansion path of larger modern buildings.",
      "Specialized infrastructure, loading, and building systems should not be assumed.",
      "The neighborhood setting may be less polished for client-facing users.",
      "Transit and parking convenience need block-by-block validation.",
    ],
    validationNotes: [
      "Does the suite fit the team's current size, collaboration style, and near-term growth?",
      "Are building systems, access, security, and after-hours use compatible with the operation?",
      "Would 700 Indiana, American Industrial Center, or 99 Rhode Island provide a clearer fit?",
      "Does the lower-rise neighborhood identity help recruiting and client perception?",
      "How do employees and visitors experience the surrounding blocks during normal work hours?",
    ],
    nearbyAlternatives: [
      { label: "700 Indiana", url: "/commercial-real-estate/building/CA/san-francisco/700-indiana-st/", reason: "A direct comparison for smaller Dogpatch industrial conversion character." },
      { label: "American Industrial Center", url: "/commercial-real-estate/building/CA/san-francisco/2325-3rd-st/", reason: "Useful when maker, studio, and operational utility matter more." },
      { label: "99 Rhode Island", url: "/commercial-real-estate/building/CA/san-francisco/99-rhode-island-st/", reason: "A Potrero Hill alternative for smaller creative office and neighborhood edge context." },
      { label: "Pier 70 Building 12", url: "/commercial-real-estate/building/CA/san-francisco/70-pier-bldg-102/", reason: "Compare when waterfront adaptive reuse and redevelopment identity should be stronger." },
      { label: "2 Henry Adams St", url: "/commercial-real-estate/building/CA/san-francisco/2-henry-adams-st/", reason: "Compare when creative office, design, robotics, or AI context needs more centrality." },
    ],
    representativeCompanies: [
      "Creative office, studio, design, production-adjacent, and neighborhood service teams are the most relevant categories.",
      "Current tenants, availability, suite condition, and infrastructure should be verified from current source materials.",
    ],
    relatedInsights: [
      { title: "Dogpatch commercial real estate", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", summary: "Understand the district's lower-rise, maker, waterfront, and redevelopment options." },
      { title: "San Francisco commercial real estate", url: "/commercial-real-estate/CA/san-francisco/", summary: "Compare nearby creative-office and production-adjacent demand patterns across the city." },
      { title: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", summary: "Use employee access, clients, operations, and district identity to choose the right location." },
    ],
  }),
  [buildingPath("1501 Mariposa St")]: buildingBrief({
    buildingSummary:
      "1501 Mariposa is a Dogpatch and Potrero-edge Building Profile for production, flex, service-commercial, and creative operations that need practical operating context. It helps Rofo explain the district's PDR edge rather than presenting Dogpatch as only waterfront office redevelopment.",
    buildingImportance:
      "1501 Mariposa matters because it protects the operational side of the Dogpatch story. The building is evidence that some companies evaluate this area for production, flex, deliveries, and practical use patterns, not just creative-office character or Mission Bay adjacency.",
    quickFacts: [
      { label: "Primary use", value: "Production, flex, and service-commercial context" },
      { label: "Building type", value: "Production/flex neighborhood edge building" },
      { label: "Commercial role", value: "Dogpatch and Potrero operational edge" },
      { label: "District", value: "Dogpatch" },
      { label: "Secondary context", value: "Potrero Hill production and flex edge" },
      { label: "Transit context", value: "Local access varies; vehicle, delivery, and employee movement should be validated" },
      { label: "Parking context", value: "Parking, loading, yard, curb, and service access should be confirmed for the use case" },
    ],
    idealFor: [
      "Production, flex, maker, service-commercial, and creative operations that need practical building characteristics.",
      "Businesses comparing Dogpatch with Potrero Hill, Showplace Square, and Mission District production edges.",
      "Teams whose workflow includes equipment, deliveries, storage, or operational access that ordinary office buildings may not support.",
      "Companies that want central San Francisco proximity without a traditional downtown office setting.",
    ],
    mayNotFit: [
      "Conventional office users that want polished amenities, dense walkable services, or a formal client address.",
      "Tenants that need heavy industrial or regulated uses without verifying permitted use and infrastructure.",
      "Teams whose employees rely primarily on downtown transit and client-service amenities.",
      "Companies that would be better served by a cleaner Mission Bay innovation or SoMa office identity.",
    ],
    buildingExperience:
      "The experience is operational and edge-oriented. That can be valuable for businesses that need practical flexibility, but it means the leasing decision should start with use, access, loading, power, permitted activity, and employee experience rather than generic office appeal.",
    districtContext:
      "1501 Mariposa sits where Dogpatch, Potrero Hill, and production-oriented San Francisco overlap. It should be compared with American Industrial Center for maker roots, 1700 17th for Potrero flex context, and Mission District production examples when cultural or retail adjacency matters more.",
    advantages: [
      "Strong evidence for Dogpatch's production and flex relevance.",
      "Useful counterpoint to office-heavy Mission Bay and waterfront redevelopment examples.",
      "Helps operators evaluate real access, loading, and practical space needs.",
      "Clarifies the Dogpatch and Potrero Hill overlap for production-adjacent businesses.",
    ],
    tradeoffs: [
      "The operational edge may be less polished for clients, recruiting, or everyday amenities.",
      "Permitted use, loading, power, access, noise, and ventilation require direct validation.",
      "May not provide the workplace image expected by conventional office teams.",
      "Transit and pedestrian experience can be more variable than central districts.",
    ],
    validationNotes: [
      "What use, loading, power, ventilation, storage, access, and permitted-activity constraints apply?",
      "Can employees, vendors, clients, and deliveries use the location efficiently?",
      "Would American Industrial Center, 1700 17th, 1840 17th, or 2400 16th provide a better operating fit?",
      "Does the business need Dogpatch identity, Potrero practicality, or a Mission District production edge?",
      "Will the surrounding block context support brand, safety, hours, and customer expectations?",
    ],
    nearbyAlternatives: [
      { label: "American Industrial Center", url: "/commercial-real-estate/building/CA/san-francisco/2325-3rd-st/", reason: "A stronger Dogpatch comparison for maker, studio, and production roots." },
      { label: "1700 17th", url: "/commercial-real-estate/building/CA/san-francisco/1700-17th-st/", reason: "A Potrero Hill alternative for lower-rise production and flex context." },
      { label: "1840 17th", url: "/commercial-real-estate/building/CA/san-francisco/1840-17th-st/", reason: "Useful when industrial and production needs should lead the comparison." },
      { label: "2400 16th", url: "/commercial-real-estate/building/CA/san-francisco/2400-16th-st/", reason: "Compare when the Mission District production edge is more relevant." },
      { label: "Mission", url: "/commercial-real-estate/CA/san-francisco/mission/", reason: "Compare when cultural adjacency and Mission District production edges matter more." },
    ],
    representativeCompanies: [
      "Production, flex, maker, service-commercial, creative operations, and light industrial users are the most relevant categories.",
      "Current tenancy, availability, permitted use, and infrastructure should be verified before relying on the profile.",
    ],
    relatedInsights: [
      { title: "Dogpatch commercial real estate", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", summary: "Understand Dogpatch's industrial, flex, maker, waterfront, and Mission Bay-edge patterns." },
      { title: "San Francisco commercial real estate", url: "/commercial-real-estate/CA/san-francisco/", summary: "Compare nearby production and flex building environments across the city." },
      { title: "Tenant Improvements", url: "/commercial-real-estate/lease-guide/tenant-improvements/", summary: "Validate buildout, utility, access, and permitted-use work before signing." },
    ],
  }),
  [buildingPath("555 California St")]: buildingBrief({
    status: "canonical-reference",
    buildingSummary:
      "555 California is a traditional Financial District office tower for companies that want downtown client access, institutional scale, and a recognizable San Francisco business address. It is most useful for teams comparing formal corporate towers against more flexible SoMa, Jackson Square, or waterfront alternatives.",
    buildingImportance:
      "555 California matters because it defines the classic San Francisco corporate-office decision. A company considering it is usually not just choosing square footage; it is choosing a client-facing downtown setting, a mature professional-service ecosystem, and the cost and formality that come with that environment.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Downtown high-rise tower" },
      { label: "Commercial role", value: "Traditional corporate office tower" },
      { label: "District", value: "Financial District" },
      { label: "Floorplate character", value: "Large corporate tower floorplates; exact suite fit should be validated by floor" },
      { label: "Transit context", value: "Strong downtown BART, Muni, ferry, and regional transit access depending on commute pattern" },
      { label: "Parking context", value: "Structured downtown parking; cost and visitor convenience should be validated early" },
    ],
    idealFor: [
      "Finance, law, consulting, and professional-service firms that host clients and benefit from a central downtown address.",
      "Executive teams that value a formal tower environment more than a creative or neighborhood-oriented workplace.",
      "Larger companies comparing institutional Financial District scale against newer South Financial District or SoMa alternatives.",
      "Businesses that need proximity to downtown hotels, restaurants, professional services, and regional transit.",
    ],
    mayNotFit: [
      "Early-stage teams whose main priority is lower-cost growth flexibility.",
      "Creative, production, lab, showroom, or operational users that need a less conventional building format.",
      "Businesses where easy parking, loading, or regional drive access matters more than downtown transit.",
      "Companies trying to project a casual, experimental, or neighborhood-based workplace identity.",
    ],
    buildingExperience:
      "The building experience is formal and businesslike. The decision is strongest when the office needs to support clients, partners, executives, and employees who expect a polished downtown environment. Teams should test whether that formality strengthens the company or adds cost without changing the business outcome.",
    districtContext:
      "555 California sits in the traditional Financial District, where transit, hotels, restaurants, banks, law firms, consulting firms, and executive services are concentrated. It represents the more formal northern downtown office choice. Compare nearby Jackson Square when character matters more, SoMa when technology identity matters more, and South Beach when waterfront or Transbay adjacency changes the commute story.",
    advantages: [
      "Strong fit for client-facing professional-service and financial firms.",
      "Recognizable Financial District setting with a traditional executive-office signal.",
      "Central downtown access to regional transit, hotels, restaurants, and business services.",
      "Useful benchmark for comparing the cost and image of major San Francisco towers.",
    ],
    tradeoffs: [
      "Less flexible for teams that want creative-office character or lower-cost expansion space.",
      "Parking and visitor logistics can be more difficult than in edge or suburban markets.",
      "The surrounding district is more formal and weekday-oriented than SoMa, Mission Bay, or Jackson Square.",
      "A major-tower address can add cost without adding value for companies that rarely host clients.",
    ],
    validationNotes: [
      "Does the available floor or suite support the team's client-facing image without overbuilding the space?",
      "Are employee commute patterns better served by Financial District transit than by Caltrain-oriented SoMa or Mission Bay?",
      "Does the budget support the full occupancy cost of a major downtown tower?",
      "How do visitor arrival, security, elevator access, and after-hours needs work for clients and executives?",
      "Could 101 California, One Sansome, or Jackson Square solve the same business need with a different cost or culture profile?",
    ],
    nearbyAlternatives: [
      { label: "101 California", url: "/commercial-real-estate/building/CA/san-francisco/101-california-st/", reason: "A better fit when the business wants Financial District polish with a slightly broader professional-service feel." },
      { label: "345 California Center", url: "/commercial-real-estate/building/CA/san-francisco/345-california-st/", reason: "Compare when a smaller, more boutique tower presence may support the same executive-office need." },
      { label: "One Sansome", url: "/commercial-real-estate/building/CA/san-francisco/1-sansome-st/", reason: "Useful when transit, amenity repositioning, and lobby-level activity matter more than classic tower formality." },
      { label: "Transamerica Pyramid Center", url: "/commercial-real-estate/building/CA/san-francisco/600-montgomery-st/", reason: "Compare when the company wants an equally recognizable downtown address with a stronger north-downtown identity." },
      { label: "Levi's Plaza", url: "/commercial-real-estate/building/CA/san-francisco/1105-battery-st/", reason: "A meaningful alternative for teams that want downtown adjacency but a calmer lower-rise campus environment." },
    ],
    representativeCompanies: [
      "Financial-services, legal, consulting, and executive-office users are the most relevant company categories to evaluate here.",
      "Named tenant rosters should be verified separately because occupancy changes over time.",
    ],
    relatedInsights: [
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Understand why companies choose the Financial District and what tradeoffs come with the traditional downtown core." },
      { title: "San Francisco commercial real estate", url: "/commercial-real-estate/CA/san-francisco/", summary: "Compare San Francisco districts before deciding whether a formal downtown tower is the right starting point." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Pressure-test layout, access, cost, buildout, and flexibility before adding a tower to the shortlist." },
    ],
  }),
  [buildingPath("101 California St")]: buildingBrief({
    buildingSummary:
      "101 California is a central Financial District office tower for firms that want a polished client-facing address, strong transit access, and a traditional downtown business environment. It is a practical comparison point for companies that want Financial District credibility without defaulting to the most formal or image-heavy tower option.",
    buildingImportance:
      "101 California matters because it represents the broad middle of high-quality Financial District demand: established firms, client meetings, transit-oriented commuting, and reliable downtown business services. It is less about making the strongest statement in the skyline and more about whether a central professional-services tower makes the company easier to reach, hire for, and trust.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Downtown high-rise tower" },
      { label: "Commercial role", value: "Client-facing downtown office tower" },
      { label: "District", value: "Financial District" },
      { label: "Floorplate character", value: "Traditional tower floorplates; suite layout and division should be validated by floor" },
      { label: "Transit context", value: "Strong central Financial District access to BART, Muni, ferry, and downtown bus routes" },
      { label: "Parking context", value: "Structured downtown parking; employee and visitor cost should be part of diligence" },
    ],
    idealFor: [
      "Professional-service, finance, consulting, and legal teams that regularly host clients downtown.",
      "Established firms that want transit access and business services without moving into a newer SoMa headquarters environment.",
      "Companies comparing traditional Financial District towers by image, access, and day-to-day convenience.",
      "Teams whose employees and clients benefit from a central downtown meeting point more than a neighborhood-oriented workplace.",
    ],
    mayNotFit: [
      "Teams seeking a casual, creative, or neighborhood-oriented workplace identity.",
      "Companies that need lower-cost growth flexibility or production-adjacent space.",
      "Businesses where parking, loading, or regional drive access matters more than central transit.",
      "Organizations that want a modern brand-signaling headquarters tower rather than a traditional downtown office setting.",
    ],
    buildingExperience:
      "The experience is polished and downtown-oriented without needing to be the most ceremonial address in the market. It supports a professional-service workday built around meetings, transit commutes, nearby restaurants and hotels, and a formal office setting that still communicates stability to clients and recruits.",
    districtContext:
      "101 California sits in the Financial District's central office core, close to the transit and business-service patterns that define downtown San Francisco. It is most useful to compare against 555 California for corporate scale, 345 California for a more boutique tower feel, One Market for a South Financial District edge, and Salesforce Tower when the company wants a newer Transbay identity.",
    advantages: [
      "Strong client-facing downtown setting for professional-service firms.",
      "Central Financial District transit access relative to many northern downtown alternatives.",
      "Broad business-service environment around the building for meetings, meals, hotels, and daily support.",
      "Useful comparison point between larger corporate towers and smaller Financial District options.",
    ],
    tradeoffs: [
      "Still carries the formality and cost profile of a central downtown tower.",
      "May feel less distinctive for companies trying to signal technology, creative, or neighborhood identity.",
      "Parking and visitor logistics should be validated early.",
      "A traditional tower setting may be more office-like than culture-driven teams want.",
      "Suite condition, layout efficiency, and expansion path matter more than the building's general market role.",
    ],
    validationNotes: [
      "Does the available suite create the client-facing impression the business needs without overspending on image?",
      "How do employee commute patterns compare with SoMa, South Beach, or Caltrain-oriented alternatives?",
      "Are parking, visitor arrival, and after-hours access workable for the team's actual operating pattern?",
      "Does the building's level of formality fit the company's culture and recruiting strategy?",
      "Would 555 California, 345 California, One Market, or Salesforce Tower solve the same need with a clearer tradeoff?",
    ],
    nearbyAlternatives: [
      { label: "555 California", url: "/commercial-real-estate/building/CA/san-francisco/555-california-st/", reason: "A stronger comparison when the company wants a more formal corporate-tower signal." },
      { label: "345 California Center", url: "/commercial-real-estate/building/CA/san-francisco/345-california-st/", reason: "Useful when a more boutique Financial District tower may better match the firm's scale and client style." },
      { label: "One Sansome", url: "/commercial-real-estate/building/CA/san-francisco/1-sansome-st/", reason: "Compare when transit, amenities, and a repositioned downtown experience matter more than a conventional tower identity." },
      { label: "One Market", url: "/commercial-real-estate/building/CA/san-francisco/one-market-st/", reason: "A relevant alternative when the search leans toward the South Financial District and Embarcadero edge." },
      { label: "Salesforce Tower", url: "/commercial-real-estate/building/CA/san-francisco/415-mission-st/", reason: "Compare when the company wants a newer, higher-visibility headquarters setting rather than traditional downtown utility." },
    ],
    representativeCompanies: [
      "Professional-services, financial, legal, consulting, and client-facing corporate teams are the clearest fit categories.",
      "Current named tenant details should be verified during diligence rather than assumed from older market references.",
    ],
    relatedInsights: [
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Use the district guide to compare central downtown towers against nearby San Francisco business areas." },
      { title: "San Francisco commercial real estate", url: "/commercial-real-estate/CA/san-francisco/", summary: "Start with the city-level decision before narrowing to a single downtown tower." },
      { title: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", summary: "Clarify whether the address, commute, clients, and operating needs justify a central Financial District choice." },
    ],
  }),
  [buildingPath("315 Montgomery St")]: buildingBrief({
    buildingSummary:
      "315 Montgomery is a practical Montgomery Street office building for professional-service teams that need Financial District centrality, client access, and business-service proximity without choosing the most symbolic tower in the market. It is useful for comparing the everyday middle of downtown office demand.",
    buildingImportance:
      "315 Montgomery matters because it keeps the Financial District portfolio from reading as only trophy towers and landmarks. It explains the durable professional-office layer that many advisory, finance, legal, and consulting users evaluate when address, commute, suite fit, and client convenience matter together.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Downtown professional office building" },
      { label: "Commercial role", value: "Montgomery Street professional-services reference" },
      { label: "District", value: "Financial District" },
      { label: "Floorplate character", value: "Conventional downtown office suites; layout and division should be validated by floor" },
      { label: "Transit context", value: "Strong central downtown access near BART, Muni, and the Montgomery corridor" },
      { label: "Parking context", value: "Downtown parking cost and visitor arrival should be reviewed early" },
    ],
    idealFor: [
      "Professional-service, finance, legal, advisory, and consulting teams that need a central client-facing downtown office.",
      "Small and mid-size firms comparing practical Financial District options before considering larger tower settings.",
      "Businesses that value Montgomery Street access, nearby business services, and a recognizable downtown context.",
      "Teams that want a traditional office decision driven by commute, client visits, and suite fit.",
    ],
    mayNotFit: [
      "Companies seeking a high-image tower identity or a strongly branded headquarters setting.",
      "Creative, lab, showroom, production, or operational users that need a different building format.",
      "Teams whose main requirement is parking convenience, loading, or regional drive access.",
      "Users that need a neighborhood-oriented workplace identity rather than a conventional downtown setting.",
    ],
    buildingExperience:
      "The experience is practical and businesslike. Tenants should evaluate whether the available suite supports meetings, privacy, client arrival, and employee access before treating the building as interchangeable with larger towers or more character-driven nearby districts.",
    districtContext:
      "315 Montgomery sits on the Financial District's Montgomery Street office spine, close to the transit, client-service, banking, legal, and advisory patterns that define the traditional downtown core. Compare it with 101 California for a larger tower feel, 44 Montgomery for Market Street proximity, and Jackson Square when character matters more than conventional office utility.",
    advantages: [
      "Strong fit for client-facing professional-service users that want central downtown access.",
      "Adds a practical mid-market reference to a portfolio otherwise led by larger towers.",
      "Useful for comparing suite efficiency, client arrival, and business-service proximity.",
      "Keeps the Financial District decision grounded in everyday office use rather than only image.",
    ],
    tradeoffs: [
      "Less distinctive than landmark or high-amenity tower alternatives.",
      "Downtown parking, visitor arrival, and after-hours access require diligence.",
      "May not support teams that want a creative, neighborhood, or production-adjacent environment.",
      "Suite quality and improvement needs can matter more than the building's general district role.",
    ],
    validationNotes: [
      "Does the available suite support the team's meeting, privacy, and client-service pattern?",
      "How do employee and visitor arrivals compare with 101 California, 44 Montgomery, and One Sansome?",
      "Does the business gain enough value from a Montgomery Street address to justify downtown costs?",
      "What buildout, building-system, security, and after-hours conditions apply to the specific space?",
      "Would Jackson Square or SoMa provide a better balance of image, cost, and workplace character?",
    ],
    nearbyAlternatives: [
      { label: "101 California", url: "/commercial-real-estate/building/CA/san-francisco/101-california-st/", reason: "A stronger comparison when the firm wants a larger and more polished downtown tower setting." },
      { label: "44 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/44-montgomery-st/", reason: "Useful when Market Street access and practical tower economics matter more than building identity." },
      { label: "100 Pine", url: "/commercial-real-estate/building/CA/san-francisco/100-pine-st/", reason: "Compare when the user wants another durable professional-service building without trophy positioning." },
      { label: "212 Sutter St", url: "/commercial-real-estate/building/CA/san-francisco/212-sutter-st/", reason: "A better contrast when smaller-format downtown office space may fit the team better." },
      { label: "One Sansome", url: "/commercial-real-estate/building/CA/san-francisco/1-sansome-st/", reason: "Compare when transit orientation and a more active repositioned building experience carry more weight." },
    ],
    representativeCompanies: [
      "Professional-services, finance, legal, advisory, consulting, and client-facing office users are the clearest fit categories.",
      "Current named tenant details should be verified from current leasing materials before use.",
    ],
    relatedInsights: [
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Compare practical Montgomery Street office choices with landmark towers and nearby character-driven districts." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Use layout, access, cost, condition, and flexibility to separate similar downtown options." },
      { title: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", summary: "Clarify whether client access, commute, image, or operations should lead the district decision." },
    ],
  }),
  [buildingPath("212 Sutter St")]: buildingBrief({
    buildingSummary:
      "212 Sutter St is a smaller-format downtown office option for boutique professional-service teams that want Financial District access without a full tower experience. It helps compare core downtown credibility against nearby Jackson Square, Union Square, and smaller client-facing office environments.",
    buildingImportance:
      "212 Sutter St matters because it represents the smaller office layer that can otherwise disappear behind the district's tower examples. For Rofo, it helps tenants ask whether the business needs a large downtown building or simply needs centrality, client access, and a credible professional setting.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Smaller-format downtown office building" },
      { label: "Commercial role", value: "Boutique Financial District edge office reference" },
      { label: "District", value: "Financial District" },
      { label: "Secondary context", value: "Jackson Square and Union Square edge" },
      { label: "Floorplate character", value: "Smaller suites; layout, elevator access, and building systems should be validated" },
      { label: "Transit context", value: "Central downtown access, with commute fit depending on exact employee and visitor patterns" },
    ],
    idealFor: [
      "Boutique finance, legal, advisory, consulting, and professional-service firms that want a central downtown address.",
      "Small teams comparing Financial District credibility with a less formal building experience.",
      "Client-facing users that need meeting access but do not need a large corporate tower.",
      "Companies deciding between core downtown, Jackson Square, and Union Square edge locations.",
    ],
    mayNotFit: [
      "Larger companies that need broad floorplates, extensive amenities, or a stronger tower signal.",
      "Teams seeking a highly modern headquarters environment or strong technology identity.",
      "Operational, lab, production, showroom, or heavy visitor-volume users.",
      "Businesses where parking, loading, or easy regional drive access is the highest priority.",
    ],
    buildingExperience:
      "The experience should be evaluated as a smaller downtown office decision rather than a trophy-building decision. The key question is whether the building gives enough client-facing credibility, access, and suite functionality without adding unnecessary scale.",
    districtContext:
      "212 Sutter St sits near the Financial District's smaller downtown edge, where businesses may compare the core office market with Jackson Square and Union Square. It is most useful when a tenant wants downtown business access but may not need the formality, cost, or scale of a larger Montgomery Street tower.",
    advantages: [
      "Gives smaller professional-service users a concrete Financial District reference.",
      "Useful for testing whether downtown access matters more than tower scale.",
      "Supports comparison with Jackson Square character and Union Square edge conditions.",
      "May fit client-facing teams that need centrality without a large-building identity.",
    ],
    tradeoffs: [
      "Less address signal than the district's best-known towers.",
      "Building systems, elevator access, and suite condition need careful validation.",
      "May not have the amenities or expansion path larger teams expect.",
      "The edge context may be less clearly Financial District than Montgomery Street buildings.",
    ],
    validationNotes: [
      "Does the available suite size and layout match the team's client-facing work pattern?",
      "Are elevator access, after-hours use, building systems, and visitor arrival practical?",
      "Would a Jackson Square building provide more character with similar downtown access?",
      "Does the team need a recognized tower address, or is smaller downtown centrality enough?",
      "How do total occupancy cost and commute fit compare with 315 Montgomery and 325 Kearny?",
    ],
    nearbyAlternatives: [
      { label: "315 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/315-montgomery-st/", reason: "A stronger comparison when the user wants a more conventional Montgomery Street office setting." },
      { label: "325 Kearny St", url: "/commercial-real-estate/building/CA/san-francisco/325-kearny-st/", reason: "Useful when the search is testing a similar downtown edge with a Kearny corridor feel." },
      { label: "650 California", url: "/commercial-real-estate/building/CA/san-francisco/650-california-st/", reason: "Compare when north-downtown executive identity may matter more than small-building scale." },
      { label: "930 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/930-montgomery-st/", reason: "A better fit when Jackson Square character is more important than Financial District positioning." },
      { label: "One Bush Plaza", url: "/commercial-real-estate/building/CA/san-francisco/1-bush-st/", reason: "Compare when architectural character and stronger Market Street adjacency matter more." },
    ],
    representativeCompanies: [
      "Boutique professional-service, advisory, financial, legal, consulting, and relationship-driven office users are most relevant.",
      "Specific tenant and availability claims should be verified independently before reliance.",
    ],
    relatedInsights: [
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Understand how smaller downtown offices compare with the district's larger tower choices." },
      { title: "Jackson Square commercial real estate", url: "/commercial-real-estate/CA/san-francisco/jackson-square/", summary: "Compare nearby character-driven office options for boutique and client-facing teams." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Pressure-test layout, access, systems, cost, and flexibility before shortlisting smaller downtown buildings." },
    ],
  }),
  [buildingPath("325 Kearny St")]: buildingBrief({
    buildingSummary:
      "325 Kearny St is a downtown-edge office building for teams comparing Financial District access with nearby Jackson Square and Union Square conditions. It is most useful when a company wants central client access but needs to test whether the Kearny corridor feels right.",
    buildingImportance:
      "325 Kearny St matters because it makes the Financial District edge more legible. It gives Rofo a concrete way to explain how a tenant's decision can shift when the building is close to the core business district but not fully defined by Montgomery Street tower identity.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Downtown edge office building" },
      { label: "Commercial role", value: "Kearny corridor Financial District edge reference" },
      { label: "District", value: "Financial District" },
      { label: "Secondary context", value: "Jackson Square and Union Square adjacency" },
      { label: "Floorplate character", value: "Smaller downtown office context; exact suite condition should be validated" },
      { label: "Transit context", value: "Central downtown access with block-by-block visitor and commute differences" },
    ],
    idealFor: [
      "Small and mid-size professional-service teams that need downtown access but not a major tower presence.",
      "Client-facing firms comparing Financial District credibility with more flexible edge locations.",
      "Teams that want to evaluate Kearny Street before choosing Jackson Square or the Montgomery corridor.",
      "Businesses whose suite fit and arrival experience matter more than landmark identity.",
    ],
    mayNotFit: [
      "Large companies that need extensive amenities, major contiguous space, or formal tower image.",
      "Users requiring specialized lab, showroom, production, or operational building formats.",
      "Teams that want a clearly defined Jackson Square character story instead of a downtown-edge tradeoff.",
      "Businesses where parking, loading, or suburban-style access is more important than centrality.",
    ],
    buildingExperience:
      "The experience should be validated around edge-condition details: arrival, street context, suite size, building systems, and how clients perceive the address. It may solve practical downtown needs without feeling like a conventional tower-core choice.",
    districtContext:
      "325 Kearny St sits where Financial District, Jackson Square, and Union Square considerations begin to overlap. It should be compared with 333 Kearny for a similar edge pattern, 212 Sutter for smaller downtown office scale, and 315 Montgomery when a more central Financial District spine is preferred.",
    advantages: [
      "Shows how the Financial District changes near Kearny Street and nearby districts.",
      "Useful for smaller professional-service teams that still need downtown access.",
      "Supports clear comparison between core office identity and boutique-district character.",
      "Can help tenants avoid overbuying tower image when edge centrality is enough.",
    ],
    tradeoffs: [
      "District identity may be less clear than a Montgomery Street or Jackson Square alternative.",
      "Visitor arrival and block-level perception should be validated in person.",
      "May not offer the amenities, systems, or expansion options larger teams expect.",
      "The building's value depends heavily on the specific suite condition and layout.",
    ],
    validationNotes: [
      "Does the address feel sufficiently Financial District for clients, recruits, and partners?",
      "How does the immediate block compare with Jackson Square, Union Square, and Montgomery Street alternatives?",
      "Does the available suite support the team's meeting, privacy, and growth needs?",
      "Are after-hours access, building services, and visitor protocols adequate for daily operations?",
      "Would 315 Montgomery or 930 Montgomery provide a clearer district story for the same requirement?",
    ],
    nearbyAlternatives: [
      { label: "333 Kearny St", url: "/commercial-real-estate/building/CA/san-francisco/333-kearny-st/", reason: "A direct comparison for another Kearny corridor office edge with similar district questions." },
      { label: "212 Sutter St", url: "/commercial-real-estate/building/CA/san-francisco/212-sutter-st/", reason: "Useful when smaller downtown office scale may matter more than Kearny corridor positioning." },
      { label: "315 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/315-montgomery-st/", reason: "A stronger choice when the tenant wants a clearer Montgomery Street business-spine setting." },
      { label: "930 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/930-montgomery-st/", reason: "Compare when Jackson Square character and boutique identity matter more than Financial District access." },
      { label: "One Sansome", url: "/commercial-real-estate/building/CA/san-francisco/1-sansome-st/", reason: "A better fit when transit, amenities, and stronger downtown positioning are the priority." },
    ],
    representativeCompanies: [
      "Small and mid-size professional-service, advisory, financial, consulting, and legal users are most relevant.",
      "Current tenant details should be verified from current leasing materials before use.",
    ],
    relatedInsights: [
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Compare core downtown office choices with edge buildings near Jackson Square and Union Square." },
      { title: "Jackson Square commercial real estate", url: "/commercial-real-estate/CA/san-francisco/jackson-square/", summary: "Understand when a nearby character-driven district may fit better than a downtown-edge office." },
      { title: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", summary: "Use client perception, commute, access, and building context to choose the right district." },
    ],
  }),
  [buildingPath("333 Kearny St")]: buildingBrief({
    buildingSummary:
      "333 Kearny St is a downtown-edge office building for small and mid-size teams that want Financial District access while comparing nearby boutique and visitor-facing districts. It helps pressure-test whether a Kearny corridor address provides enough downtown value for the business.",
    buildingImportance:
      "333 Kearny St matters because it adds a second edge-condition reference to the Financial District portfolio. It helps Rofo explain that not every downtown office decision is a tower decision; some users are choosing between district identity, client arrival, cost, and smaller-suite practicality.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Downtown edge office building" },
      { label: "Commercial role", value: "Small and mid-size Kearny corridor office reference" },
      { label: "District", value: "Financial District" },
      { label: "Secondary context", value: "Jackson Square and Union Square adjacency" },
      { label: "Floorplate character", value: "Smaller downtown office suites; layout and building condition require validation" },
      { label: "Transit context", value: "Downtown transit access with block-level differences in arrival and perception" },
    ],
    idealFor: [
      "Small and mid-size professional-service teams that want downtown access but do not need a major tower.",
      "Boutique finance, legal, advisory, and consulting users comparing Financial District and Jackson Square tradeoffs.",
      "Companies that care about client access, suite practicality, and address perception more than amenities.",
      "Teams evaluating whether Kearny Street creates enough centrality without overcommitting to tower-core costs.",
    ],
    mayNotFit: [
      "Large users seeking a formal headquarters signal, broad amenities, or large contiguous floorplates.",
      "Technology, lab, production, showroom, or operational teams that need a different workplace format.",
      "Companies that need the clearest possible Financial District address story.",
      "Businesses where parking, loading, or regional drive access is more important than downtown centrality.",
    ],
    buildingExperience:
      "The experience is best understood as practical downtown access with an edge-condition tradeoff. The building may serve relationship-driven teams well, but tenants should validate street context, suite condition, access, and whether the address supports the firm's client-facing work.",
    districtContext:
      "333 Kearny St sits near the transition between the Financial District office core and adjacent districts with more boutique, retail, and visitor-facing character. Compare it with 325 Kearny for the same corridor, 212 Sutter for smaller downtown scale, and 930 Montgomery when Jackson Square character should lead.",
    advantages: [
      "Adds a practical small and mid-size office reference to the Financial District portfolio.",
      "Useful for firms comparing downtown centrality with adjacent boutique district character.",
      "Supports diligence around client arrival, block context, and suite fit.",
      "Can be a sensible option when tower image is less important than access and cost.",
    ],
    tradeoffs: [
      "Less formal and less definitive than core Financial District tower options.",
      "Immediate block context and visitor perception need careful review.",
      "May not support larger teams or specialized workplace requirements.",
      "Suite condition and building systems can drive the decision more than address alone.",
    ],
    validationNotes: [
      "Does the specific suite support the team's client meetings, privacy, and day-to-day workflow?",
      "Is Kearny Street the right district signal compared with Montgomery Street or Jackson Square?",
      "How do employees and visitors experience the block at different times of day?",
      "Are building systems, after-hours access, elevators, and security appropriate for the use?",
      "Would 325 Kearny, 212 Sutter, or 315 Montgomery provide a better tradeoff?",
    ],
    nearbyAlternatives: [
      { label: "325 Kearny St", url: "/commercial-real-estate/building/CA/san-francisco/325-kearny-st/", reason: "A direct comparison for another Kearny corridor option with similar edge-condition questions." },
      { label: "212 Sutter St", url: "/commercial-real-estate/building/CA/san-francisco/212-sutter-st/", reason: "Compare when smaller downtown scale and Sutter Street context may fit better." },
      { label: "930 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/930-montgomery-st/", reason: "A better fit when Jackson Square character is more important than Financial District positioning." },
      { label: "315 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/315-montgomery-st/", reason: "Useful when the tenant wants a clearer conventional downtown office-spine address." },
      { label: "One Bush Plaza", url: "/commercial-real-estate/building/CA/san-francisco/1-bush-st/", reason: "Compare when architectural identity and Market Street adjacency matter more than small-building flexibility." },
    ],
    representativeCompanies: [
      "Boutique professional-service, advisory, legal, financial, consulting, and relationship-driven office users are most relevant.",
      "Named tenant or availability claims should be confirmed from current sources before publication.",
    ],
    relatedInsights: [
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Use the district guide to compare edge offices with the central downtown tower core." },
      { title: "Jackson Square commercial real estate", url: "/commercial-real-estate/CA/san-francisco/jackson-square/", summary: "Compare nearby boutique office character against the Financial District's business-service environment." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Validate layout, cost, condition, access, and flexibility before treating similar buildings as equal." },
    ],
  }),
  [buildingPath("345 California St")]: buildingBrief({
    buildingSummary:
      "345 California Center is a Financial District office tower for companies that want a polished downtown setting with a more focused presence than the largest corporate towers. It is useful for firms comparing executive image, client access, and tower convenience without necessarily needing the scale or symbolism of 555 California.",
    buildingImportance:
      "345 California Center matters because it shows the Financial District is not a single tower type. It gives tenants a way to compare traditional downtown credibility against a somewhat more boutique high-rise experience, making it a useful bridge between large corporate towers, professional-service buildings, and north-downtown alternatives.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Downtown high-rise tower" },
      { label: "Commercial role", value: "Boutique-leaning Financial District tower" },
      { label: "District", value: "Financial District" },
      { label: "Floorplate character", value: "Tower floorplates; exact suite scale and division should be validated by floor" },
      { label: "Transit context", value: "Strong downtown access; employee commute fit should be compared with Market Street and Transbay alternatives" },
      { label: "Parking context", value: "Downtown parking and visitor arrival should be validated early" },
    ],
    idealFor: [
      "Executive, financial, legal, consulting, and professional-service firms that want a recognized downtown address without the largest-tower feel.",
      "Client-facing teams that value a polished arrival experience but do not need a flagship headquarters signal.",
      "Companies comparing Financial District towers by formality, suite scale, and daily convenience.",
      "Established firms that want downtown credibility while preserving some flexibility around image and size.",
    ],
    mayNotFit: [
      "Teams that need a casual creative-office environment or production-adjacent workspace.",
      "Large headquarters users seeking the deepest floorplate consistency and most visible tower identity.",
      "Businesses whose staff or customers depend heavily on easy parking or drive-up convenience.",
      "Technology companies that want a newer Transbay or SoMa identity rather than traditional downtown polish.",
    ],
    buildingExperience:
      "The experience is downtown, professional, and more focused than the most institutionally scaled towers. It can support a client-facing firm that wants polish without making the building itself the whole brand statement. Tenants should evaluate how the specific suite, floor, and arrival sequence compare with larger Financial District alternatives.",
    districtContext:
      "345 California Center sits in the Financial District's traditional office core, close to the business-service, transit, and client-meeting patterns that define downtown San Francisco. It should be compared with 555 California when corporate scale matters, 101 California when broad downtown utility matters, and Transamerica Pyramid Center or Jackson Square when a north-downtown identity may be more distinctive.",
    advantages: [
      "Strong downtown address for professional-service and executive-office users.",
      "More focused tower identity than the largest Financial District benchmarks.",
      "Useful proximity to downtown transit, hotels, restaurants, and business services.",
      "Good comparison point for companies balancing polish, scale, and cost discipline.",
    ],
    tradeoffs: [
      "May not deliver the same flagship signal as 555 California or Salesforce Tower.",
      "Still carries the cost, parking, and formality considerations of a downtown tower.",
      "Less natural fit for creative, production, showroom, or lab users.",
      "Specific floorplate efficiency and expansion path need validation because tower floors vary by stack and suite.",
    ],
    validationNotes: [
      "Does the available suite provide the right level of client-facing polish without paying for unnecessary tower scale?",
      "How does the floorplate divide for private offices, conference rooms, and team work areas?",
      "Would 555 California or 101 California provide a stronger address signal for a similar occupancy cost?",
      "Are visitor arrival, elevator access, parking, and after-hours security workable for client meetings?",
      "Does the building's level of formality match the firm's recruiting and culture goals?",
    ],
    nearbyAlternatives: [
      { label: "555 California", url: "/commercial-real-estate/building/CA/san-francisco/555-california-st/", reason: "A stronger fit when the business wants a larger, more formal corporate-tower signal." },
      { label: "101 California", url: "/commercial-real-estate/building/CA/san-francisco/101-california-st/", reason: "Compare when central transit utility and broader professional-service convenience matter more than boutique tower feel." },
      { label: "Transamerica Pyramid Center", url: "/commercial-real-estate/building/CA/san-francisco/600-montgomery-st/", reason: "Useful when the company wants a more recognizable north-downtown identity and skyline presence." },
      { label: "One Sansome", url: "/commercial-real-estate/building/CA/san-francisco/1-sansome-st/", reason: "Compare when transit, amenities, and repositioned lobby activity matter more than traditional tower polish." },
      { label: "One Bush Plaza", url: "/commercial-real-estate/building/CA/san-francisco/1-bush-st/", reason: "A better comparison when architectural character and modernist history matter to the workplace story." },
    ],
    representativeCompanies: [
      "Executive-office, financial-services, legal, consulting, and boutique professional-service teams are the most relevant company categories.",
      "Current named tenant details should be verified separately before being used in a leasing decision.",
    ],
    relatedInsights: [
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Compare the district's tower types before deciding which downtown address best fits the business." },
      { title: "San Francisco commercial real estate", url: "/commercial-real-estate/CA/san-francisco/", summary: "Review how the Financial District compares with SoMa, Mission Bay, Jackson Square, and South Beach." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Evaluate suite layout, access, cost, and flexibility before shortlisting a downtown tower." },
    ],
  }),
  [buildingPath("1 Sansome St")]: buildingBrief({
    buildingSummary:
      "One Sansome is a Financial District office building for companies that want downtown transit access, professional-service proximity, and a more active repositioned setting than a conventional tower. It is useful for tenants comparing classic Financial District utility with a stronger amenity and arrival experience.",
    buildingImportance:
      "One Sansome matters because it shows how older Financial District inventory can be repositioned around transit, shared amenities, and building-level activity. It helps tenants compare the stability of the downtown core with a workplace experience that may feel less static than a traditional office tower.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Repositioned downtown office building" },
      { label: "Commercial role", value: "Adaptive reuse and transit-oriented Financial District benchmark" },
      { label: "District", value: "Financial District" },
      { label: "Floorplate character", value: "Downtown tower floorplates; suite fit and amenity access should be validated" },
      { label: "Transit context", value: "Strong Market Street and Financial District transit access" },
      { label: "Parking context", value: "Downtown parking constraints should be evaluated against transit advantages" },
    ],
    idealFor: [
      "Professional-service, finance, consulting, and technology-adjacent teams that want downtown transit access with more building activity.",
      "Companies comparing traditional tower formality against a more amenity-oriented downtown office experience.",
      "Firms that host clients but want a setting that feels more current than older static office inventory.",
      "Teams whose commute patterns are well served by Market Street, BART, Muni, and downtown bus access.",
    ],
    mayNotFit: [
      "Companies seeking the strongest traditional executive-tower signal.",
      "Teams that need low-cost expansion space or a less formal SoMa creative environment.",
      "Businesses where parking, loading, or operational access matters more than downtown transit.",
      "Users that need specialized lab, showroom, or production functionality.",
    ],
    buildingExperience:
      "The experience is downtown and transit-oriented, with more emphasis on arrival, shared activity, and amenity context than a purely conventional tower decision. Tenants should test whether those building-level advantages matter to employees and visitors or whether a simpler tower can deliver the same business result.",
    districtContext:
      "One Sansome sits in the Financial District near Market Street, where downtown transit, professional services, and client-meeting patterns are strongest. Its location makes it a practical comparison for 101 California and One Bush, while its repositioned character makes it different from more formal towers like 555 California or 345 California Center.",
    advantages: [
      "Strong downtown transit orientation for employees and visitors.",
      "More active building experience than many older Financial District towers.",
      "Useful fit for professional-service firms that want downtown credibility without maximum formality.",
      "Good comparison point for tenants weighing amenity value against traditional tower image.",
    ],
    tradeoffs: [
      "May not provide the same executive signal as the most recognized Financial District towers.",
      "Downtown parking and visitor logistics still require diligence.",
      "Building-level amenities only matter if the team will actually use them.",
      "Creative or production-oriented teams may still find the Financial District too formal.",
    ],
    validationNotes: [
      "Which building amenities are included, which are shared, and which require additional cost or booking?",
      "Does the available suite layout work for the team's meeting, privacy, and collaboration needs?",
      "How do employees and clients experience arrival from BART, Muni, ferry, rideshare, and parking?",
      "Would 101 California, One Bush, or 555 California provide a clearer balance of image, access, and cost?",
      "Do after-hours access, security, and visitor protocols fit the company's operating schedule?",
    ],
    nearbyAlternatives: [
      { label: "101 California", url: "/commercial-real-estate/building/CA/san-francisco/101-california-st/", reason: "A stronger fit when the business wants straightforward Financial District tower utility and client access." },
      { label: "One Bush Plaza", url: "/commercial-real-estate/building/CA/san-francisco/1-bush-st/", reason: "Compare when modernist architectural character matters more than amenity-oriented repositioning." },
      { label: "44 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/44-montgomery-st/", reason: "Useful when the search prioritizes practical Market Street access over higher-image tower positioning." },
      { label: "345 California Center", url: "/commercial-real-estate/building/CA/san-francisco/345-california-st/", reason: "Compare when a more boutique executive tower feel may better support client-facing work." },
      { label: "555 California", url: "/commercial-real-estate/building/CA/san-francisco/555-california-st/", reason: "A better comparison when the company wants a more formal corporate-office signal." },
    ],
    representativeCompanies: [
      "Professional-services, financial, consulting, and transit-oriented office users are the most relevant company categories.",
      "Named tenant claims should be verified from current leasing materials before publication or reliance.",
    ],
    relatedInsights: [
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Understand how the district's tower, transit, and client-service patterns affect the building decision." },
      { title: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", summary: "Use commute, clients, operations, and culture to decide whether a downtown transit-oriented building is right." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Compare building amenities, layout, access, cost, and flexibility before narrowing the shortlist." },
    ],
  }),
  [buildingPath("600 Montgomery St")]: buildingBrief({
    buildingSummary:
      "Transamerica Pyramid Center is a north Financial District office tower for companies that want a highly recognizable San Francisco address and a stronger connection to Jackson Square than Market Street. It is useful for tenants comparing skyline identity, executive presence, and north-downtown character against more conventional Financial District towers.",
    buildingImportance:
      "Transamerica Pyramid Center matters because it is one of the clearest reference points for San Francisco's older downtown identity. For Rofo, it helps explain the difference between a building chosen for recognizability and north-downtown character versus a building chosen primarily for transit utility, floorplate practicality, or newer headquarters image.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Downtown high-rise tower" },
      { label: "Commercial role", value: "North Financial District skyline and executive-office benchmark" },
      { label: "District", value: "Financial District" },
      { label: "Secondary context", value: "Jackson Square edge" },
      { label: "Floorplate character", value: "Distinctive tower environment; suite layout should be validated by floor" },
      { label: "Transit context", value: "Downtown transit access is workable but generally less direct than Market Street-adjacent towers" },
      { label: "Parking context", value: "North-downtown parking, visitor access, and arrival should be checked early" },
    ],
    idealFor: [
      "Executive, investment, legal, finance, and professional-service firms that value a recognizable north-downtown address.",
      "Companies that want traditional downtown credibility with more architectural identity than a standard office tower.",
      "Client-facing teams comparing the Financial District with Jackson Square and north waterfront alternatives.",
      "Firms whose brand benefits from a distinctive San Francisco building without moving into a modern Transbay tower.",
    ],
    mayNotFit: [
      "Teams whose highest priority is direct Market Street or Transbay transit access.",
      "Large users requiring the most conventional and repeatable floorplate layouts.",
      "Companies seeking casual creative-office texture, lab capability, or production-adjacent space.",
      "Businesses that need easy parking, loading, or a less congested visitor arrival pattern.",
    ],
    buildingExperience:
      "The experience is more distinctive and north-downtown oriented than a generic Financial District tower. The building can strengthen client perception and company identity, but tenants should test whether the recognition translates into daily value for employees, visitors, and recruitment.",
    districtContext:
      "Transamerica Pyramid Center sits near the Financial District and Jackson Square boundary, where traditional corporate office, historic blocks, restaurants, and north waterfront access begin to overlap. That makes it a useful alternative to 555 California when recognizability matters, to Levi's Plaza when a lower-rise campus feels too informal, and to One Maritime Plaza when the north Financial District edge is the real search area.",
    advantages: [
      "Highly recognizable San Francisco office identity for client-facing and executive users.",
      "Stronger north-downtown and Jackson Square relationship than Market Street towers.",
      "Useful comparison point for companies weighing address signal against daily access.",
      "Can support firms that want traditional downtown credibility with more architectural identity.",
    ],
    tradeoffs: [
      "Transit access may be less direct than Market Street, Transbay, or central Financial District alternatives.",
      "Distinctive tower geometry and suite configuration should be validated carefully.",
      "The address signal may add less value for companies that rarely host clients or partners.",
      "Parking and visitor arrival can be more complex than in less central or campus-like settings.",
    ],
    validationNotes: [
      "Does the available suite configuration work for the team's real layout, meeting, and privacy needs?",
      "Does the recognizable address materially improve client perception, recruiting, or executive presence?",
      "How do commute patterns compare with 101 California, One Sansome, Salesforce Tower, and Mission Bay options?",
      "Are visitor arrival, parking, elevator access, and security protocols practical for the company's client volume?",
      "Would Levi's Plaza or One Maritime Plaza provide the same north-downtown benefit with a different workplace feel?",
    ],
    nearbyAlternatives: [
      { label: "555 California", url: "/commercial-real-estate/building/CA/san-francisco/555-california-st/", reason: "A stronger comparison when the company wants classic corporate tower scale and Financial District formality." },
      { label: "Levi's Plaza", url: "/commercial-real-estate/building/CA/san-francisco/1105-battery-st/", reason: "A better fit when north-downtown character matters but a lower-rise campus setting is more useful than tower identity." },
      { label: "300 Clay", url: "/commercial-real-estate/building/CA/san-francisco/300-clay-st/", reason: "Compare when the search favors north Financial District access and waterfront-edge character." },
      { label: "345 California Center", url: "/commercial-real-estate/building/CA/san-francisco/345-california-st/", reason: "Useful when the tenant wants a more conventional executive tower with less emphasis on landmark identity." },
      { label: "One Bush Plaza", url: "/commercial-real-estate/building/CA/san-francisco/1-bush-st/", reason: "Compare when architectural character matters but the company wants a more Market Street-adjacent downtown location." },
    ],
    representativeCompanies: [
      "Executive-office, financial-services, legal, investment, and boutique professional-service users are the most relevant company categories.",
      "Named tenant and ownership details should be verified from current building materials before publication.",
    ],
    relatedInsights: [
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Compare north-downtown tower identity with central Financial District transit and client-service patterns." },
      { title: "Jackson Square commercial real estate", url: "/commercial-real-estate/CA/san-francisco/jackson-square/", summary: "Understand the nearby character-driven alternative to the traditional tower core." },
      { title: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", summary: "Clarify whether address recognition, commute access, client perception, or culture should lead the decision." },
    ],
  }),
  [buildingPath("1 Bush St")]: buildingBrief({
    buildingSummary:
      "One Bush Plaza, also known as the Crown Zellerbach Building, is a Financial District office building for companies that value modernist character, downtown access, and a more architecturally distinct setting than a standard tower. It is useful for firms comparing professional-service utility with building identity.",
    buildingImportance:
      "One Bush Plaza matters because it helps explain the older modernist side of San Francisco's office market. It is not simply another downtown address; it gives tenants a way to compare architectural character, Market Street adjacency, and professional-service convenience against more conventional corporate towers.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Modernist downtown office building" },
      { label: "Commercial role", value: "Historic and architectural Financial District benchmark" },
      { label: "District", value: "Financial District" },
      { label: "Floorplate character", value: "Older downtown office floorplates; layout, systems, and buildout condition should be validated" },
      { label: "Transit context", value: "Strong downtown transit context near Market Street and the Financial District core" },
      { label: "Parking context", value: "Downtown parking limitations should be weighed against transit convenience" },
    ],
    idealFor: [
      "Professional-service, design-conscious, consulting, finance, and legal teams that want downtown access with architectural character.",
      "Companies that value a building with identity but do not need the highest-profile tower address.",
      "Teams comparing older downtown office stock against repositioned buildings like One Sansome.",
      "Client-facing firms that want a central setting without defaulting to 555 California or Salesforce Tower.",
    ],
    mayNotFit: [
      "Companies that need a newer tower, flagship headquarters signal, or highly contemporary employee experience.",
      "Users requiring large contiguous modern floorplates or specialized infrastructure.",
      "Teams seeking a casual SoMa creative-office environment or production-adjacent space.",
      "Businesses whose operations depend on easy parking, loading, or suburban-style access.",
    ],
    buildingExperience:
      "The experience is more architectural and historically rooted than many downtown towers. It can work well for firms that want their office to feel thoughtful and established, but tenants should validate whether older-building layout, systems, and buildout condition support modern workplace needs.",
    districtContext:
      "One Bush Plaza sits near the Financial District and Market Street edge, giving it access to transit, professional services, and downtown client patterns. It is a meaningful comparison for One Sansome when transit and repositioning matter, 555 California when corporate tower identity matters, and 140 New Montgomery when historic building character becomes part of the workplace decision.",
    advantages: [
      "Distinctive modernist building identity within the Financial District.",
      "Strong downtown and Market Street-adjacent access for employees and visitors.",
      "Useful fit for firms that want professional credibility without maximum tower formality.",
      "Good comparison point for tenants weighing architectural character against newer building systems.",
    ],
    tradeoffs: [
      "Older-building systems, suite condition, and buildout needs require careful diligence.",
      "May not provide the same flagship signal as 555 California, Salesforce Tower, or Transamerica Pyramid Center.",
      "Parking and visitor logistics remain downtown constraints.",
      "May be less suitable for large users seeking highly standardized modern floorplates.",
    ],
    validationNotes: [
      "What building systems, HVAC hours, and after-hours access apply to the specific suite?",
      "Does the floorplate support the team's layout without forcing inefficient compromises?",
      "How much tenant improvement work would be needed to meet current workplace expectations?",
      "Does the building's architectural character strengthen the company story or distract from practical needs?",
      "Would One Sansome, 555 California, or 140 New Montgomery provide a better balance of character, access, and systems?",
    ],
    nearbyAlternatives: [
      { label: "One Sansome", url: "/commercial-real-estate/building/CA/san-francisco/1-sansome-st/", reason: "A stronger fit when transit, shared amenities, and repositioned downtown activity matter more than modernist character." },
      { label: "555 California", url: "/commercial-real-estate/building/CA/san-francisco/555-california-st/", reason: "Compare when the company needs a more formal corporate tower signal." },
      { label: "44 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/44-montgomery-st/", reason: "Useful when practical Market Street access and mid-market tower economics are more important than architectural identity." },
      { label: "140 New Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/140-new-montgomery-st/", reason: "Compare when historic character and technology-era reuse matter more than Financial District formality." },
      { label: "345 California Center", url: "/commercial-real-estate/building/CA/san-francisco/345-california-st/", reason: "A better comparison when the tenant wants a more conventional executive tower feel." },
    ],
    representativeCompanies: [
      "Professional-services, finance, consulting, legal, and design-conscious office users are the most relevant company categories.",
      "Named tenant details should be verified from current building sources before being used in publication or diligence.",
    ],
    relatedInsights: [
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Use the district guide to compare traditional towers, repositioned buildings, and older office stock." },
      { title: "Tenant Improvements", url: "/commercial-real-estate/lease-guide/tenant-improvements/", summary: "Validate buildout, infrastructure, and delivery condition when evaluating older office buildings." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Compare character, systems, layout, access, and total occupancy cost before shortlisting." },
    ],
  }),
  [buildingPath("415 Mission St")]: buildingBrief({
    buildingSummary:
      "Salesforce Tower is a modern SoMa headquarters tower for companies that want high visibility, strong regional transit access, and a workplace tied to the Transbay business environment. It is most relevant for larger or brand-conscious teams that need a building to communicate scale, stability, and recruiting ambition.",
    buildingImportance:
      "Salesforce Tower matters because it marks San Francisco's shift from older downtown office towers toward a newer Transbay and East Cut headquarters pattern. It helps a tenant test whether the company needs a highly visible modern tower or whether a less formal building can deliver the same operating value with less cost and complexity.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Modern high-rise tower" },
      { label: "Commercial role", value: "Modern headquarters tower" },
      { label: "District", value: "SoMa" },
      { label: "Floorplate character", value: "Large modern tower environment; actual fit depends on available floor and suite configuration" },
      { label: "Transit context", value: "Strong Transbay and downtown transit context with regional access depending on commute pattern" },
      { label: "Parking context", value: "Downtown parking and congestion should be validated for employees, visitors, and events" },
    ],
    idealFor: [
      "Large technology, corporate, and brand-conscious companies that benefit from a visible San Francisco headquarters address.",
      "Teams that value modern tower identity and regional transit access more than neighborhood character.",
      "Companies comparing Transbay, SoMa, and downtown towers for recruiting, client perception, and headquarters signaling.",
      "Organizations that need the building itself to reinforce credibility with employees, customers, partners, or investors.",
    ],
    mayNotFit: [
      "Smaller teams that do not need a flagship environment or the cost structure that may come with it.",
      "Companies seeking a quieter, lower-rise, or less formal workplace.",
      "Operations that depend on easy parking, loading, or a less congested arrival experience.",
      "Firms whose clients and employees would value Financial District familiarity more than Transbay visibility.",
    ],
    buildingExperience:
      "The experience is large-scale, modern, and highly visible. The building can make an office feel like a headquarters decision before anyone reaches the suite. That is valuable when image and employee experience matter, but it can feel oversized for teams that need practical workspace more than public presence.",
    districtContext:
      "Salesforce Tower sits at the Transbay edge of SoMa, where downtown transit, newer towers, and large-company technology identity overlap. The location differs from the Financial District by feeling more contemporary and less tied to older professional-service routines. It also differs from Mission Bay, which offers a newer district identity with a more campus-like and health-science-adjacent rhythm.",
    advantages: [
      "Clear headquarters signal for companies that want a visible San Francisco presence.",
      "Strong regional transit orientation around the Transbay and downtown core.",
      "Modern SoMa positioning that differs from traditional Financial District office towers.",
      "Useful reference point for large-company workplace image, recruiting perception, and client arrival.",
    ],
    tradeoffs: [
      "May be excessive for smaller or less image-driven companies.",
      "Cost, congestion, and parking should be evaluated carefully.",
      "The scale and formality may not fit teams seeking creative-office texture or neighborhood intimacy.",
      "Transbay activity can improve access while also adding arrival complexity at peak times.",
      "Available floors must be validated against team size, department structure, and expansion needs.",
    ],
    validationNotes: [
      "Does the company actually benefit from a flagship address, or would a quieter building support the business just as well?",
      "How does the door-to-desk commute work during peak hours for employees from different parts of the region?",
      "Does the available floor support the team's department structure, growth plan, and client-facing needs?",
      "How do security, visitor arrival, elevator access, and event-day congestion affect daily operations?",
      "Would 181 Fremont, 680 Folsom, 101 California, or The Exchange provide a better balance of image, cost, and daily usability?",
    ],
    nearbyAlternatives: [
      { label: "181 Fremont", url: "/commercial-real-estate/building/CA/san-francisco/181-fremont-st/", reason: "A close comparison for modern tower identity with a slightly different scale and arrival profile." },
      { label: "680 Folsom", url: "/commercial-real-estate/building/CA/san-francisco/680-folsom-st/", reason: "Compare when adaptive reuse and technology-office character matter more than a flagship tower signal." },
      { label: "101 California", url: "/commercial-real-estate/building/CA/san-francisco/101-california-st/", reason: "A stronger fit when traditional Financial District client access matters more than modern Transbay visibility." },
      { label: "The Exchange", url: "/commercial-real-estate/building/CA/san-francisco/1800-owens-st/", reason: "Useful when a newer building in a more campus-like Mission Bay environment may suit the company better." },
      { label: "303 2nd St", url: "/commercial-real-estate/building/CA/san-francisco/303-2nd-st/", reason: "Compare when the search needs modern SoMa access without the same level of headquarters symbolism." },
    ],
    representativeCompanies: [
      "Large technology, corporate headquarters, and brand-conscious office users are the clearest company categories to evaluate here.",
      "Named tenant assumptions should be validated from current building materials or active leasing sources.",
    ],
    relatedInsights: [
      { title: "SoMa commercial real estate", url: "/commercial-real-estate/CA/san-francisco/soma/", summary: "Compare the Transbay tower environment with SoMa's creative, adaptive reuse, and Caltrain-oriented office options." },
      { title: "San Francisco commercial real estate", url: "/commercial-real-estate/CA/san-francisco/", summary: "Use the city page to compare SoMa, the Financial District, Mission Bay, and nearby alternatives." },
      { title: "Commercial Leasing Timeline", url: "/commercial-real-estate/lease-guide/commercial-leasing-timeline/", summary: "Large headquarters decisions usually require earlier planning, stronger diligence, and more coordination before lease execution." },
    ],
  }),
  [buildingPath("181 Fremont St")]: buildingBrief({
    buildingSummary:
      "181 Fremont is a modern SoMa and Transbay office tower for companies that want premium downtown access, contemporary building identity, and a strong alternative to Salesforce Tower. It is most relevant for teams comparing high-end tower presence with transit, client perception, and daily employee usability.",
    buildingImportance:
      "181 Fremont matters because it helps explain the premium Transbay office choice without making Salesforce Tower the only reference point. It gives tenants a way to compare modern tower identity, mixed-use surroundings, and downtown access against both traditional Financial District buildings and adaptive SoMa alternatives.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Modern high-rise tower" },
      { label: "Commercial role", value: "Premium Transbay mixed-use office benchmark" },
      { label: "District", value: "SoMa" },
      { label: "Floorplate character", value: "Modern tower environment; exact suite configuration should be validated by floor" },
      { label: "Transit context", value: "Strong Transbay and downtown transit context depending on employee commute pattern" },
      { label: "Parking context", value: "Downtown congestion and parking should be evaluated against transit access" },
    ],
    idealFor: [
      "Technology, corporate, finance, and professional-service teams that want modern tower identity near Transbay.",
      "Companies that want a premium address signal without choosing the most publicly associated tower in the market.",
      "Teams comparing modern SoMa towers with traditional Financial District options.",
      "Organizations whose recruiting, clients, or leadership benefit from a contemporary high-rise setting.",
    ],
    mayNotFit: [
      "Smaller teams that do not need premium tower identity or the cost profile that can come with it.",
      "Companies seeking creative-office character, adaptive reuse, or lower-rise neighborhood texture.",
      "Operations that depend on easy parking, loading, or a less congested arrival pattern.",
      "Users whose employees are better served by Caltrain-oriented West SoMa or Mission Bay locations.",
    ],
    buildingExperience:
      "The experience is modern, vertical, and polished. It can support companies that want to project scale and stability, but it should be evaluated as a practical workplace rather than only an image decision. The best fit depends on whether the specific suite, arrival sequence, and commute pattern support the company day to day.",
    districtContext:
      "181 Fremont sits in the Transbay side of SoMa, close to the downtown tower core and the South Financial District edge. It should be compared with Salesforce Tower for flagship visibility, 303 Second for large SoMa utility, 680 Folsom for adaptive reuse character, and 101 California when traditional downtown client access matters more than contemporary tower identity.",
    advantages: [
      "Modern Transbay tower identity for companies that want a contemporary San Francisco presence.",
      "Strong downtown and regional transit context for many commute patterns.",
      "Useful alternative to Salesforce Tower for teams that want premium tower quality with a different profile.",
      "Good comparison point between SoMa's modern tower market and the Financial District's traditional tower core.",
    ],
    tradeoffs: [
      "May be too image-driven or expensive for teams that mainly need practical workspace.",
      "Parking, rideshare, visitor access, and congestion should be validated carefully.",
      "Less appropriate for companies seeking creative-office texture or low-rise character.",
      "Available floor configuration and expansion path can matter more than the building's general premium positioning.",
    ],
    validationNotes: [
      "Does the company need modern tower identity, or would a less expensive SoMa building support the same work?",
      "How does the door-to-desk commute compare with Salesforce Tower, 101 California, and Mission Bay alternatives?",
      "Does the available floor support the team's department structure, privacy needs, and growth plan?",
      "How do security, visitor protocols, parking, and after-hours access work for clients and employees?",
      "Would 680 Folsom or 303 Second provide a better balance of access, space usability, and cost?",
    ],
    nearbyAlternatives: [
      { label: "Salesforce Tower", url: "/commercial-real-estate/building/CA/san-francisco/415-mission-st/", reason: "A stronger fit when the company wants the clearest flagship headquarters signal in the Transbay area." },
      { label: "303 2nd St", url: "/commercial-real-estate/building/CA/san-francisco/303-2nd-st/", reason: "Compare when large SoMa office utility matters more than premium tower symbolism." },
      { label: "680 Folsom", url: "/commercial-real-estate/building/CA/san-francisco/680-folsom-st/", reason: "Useful when adaptive reuse and technology-office character may fit better than a modern tower." },
      { label: "101 California", url: "/commercial-real-estate/building/CA/san-francisco/101-california-st/", reason: "A better comparison when traditional Financial District client access matters more than Transbay image." },
      { label: "One Market", url: "/commercial-real-estate/building/CA/san-francisco/one-market-st/", reason: "Compare when Embarcadero and South Financial District edge access are central to the search." },
    ],
    representativeCompanies: [
      "Technology, corporate headquarters, finance, and professional-service office users are the most relevant company categories.",
      "Named tenant details should be validated from current building materials before being used in a leasing decision.",
    ],
    relatedInsights: [
      { title: "SoMa commercial real estate", url: "/commercial-real-estate/CA/san-francisco/soma/", summary: "Compare Transbay towers with SoMa's adaptive reuse, creative, and Caltrain-oriented buildings." },
      { title: "San Francisco commercial real estate", url: "/commercial-real-estate/CA/san-francisco/", summary: "Review citywide district tradeoffs before choosing a premium tower." },
      { title: "Commercial Leasing Timeline", url: "/commercial-real-estate/lease-guide/commercial-leasing-timeline/", summary: "Plan earlier when evaluating a premium tower, larger relocation, or headquarters decision." },
    ],
  }),
  [buildingPath("680 Folsom St")]: buildingBrief({
    buildingSummary:
      "680 Folsom is a central SoMa adaptive reuse office building for technology and creative teams that want modernized workspace without a conventional tower setting. It is useful for companies comparing the character and flexibility of older commercial stock against newer Transbay towers or West SoMa creative buildings.",
    buildingImportance:
      "680 Folsom matters because it represents a major SoMa pattern: older commercial buildings repositioned for modern office users. It helps tenants understand how adaptive reuse can deliver character, central access, and technology-office identity while still requiring careful diligence around systems, layout, and buildout assumptions.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Adaptive reuse office building" },
      { label: "Commercial role", value: "Central SoMa adaptive reuse benchmark" },
      { label: "District", value: "SoMa" },
      { label: "Floorplate character", value: "Large adapted office environment; layout and building systems should be validated by suite" },
      { label: "Transit context", value: "Central SoMa access with downtown, Market Street, and regional transit context depending on commute origins" },
      { label: "Parking context", value: "Urban parking and loading conditions should be checked for the team's operating pattern" },
    ],
    idealFor: [
      "Technology, product, creative, and design-led teams that want modern office function with adaptive reuse character.",
      "Companies comparing central SoMa access against Transbay tower formality.",
      "Teams that value floorplate usability and neighborhood identity more than traditional executive address signal.",
      "Organizations that need a more current workplace than older downtown towers but do not require a flagship high-rise.",
    ],
    mayNotFit: [
      "Client-facing firms that need a traditional Financial District address or formal tower arrival.",
      "Companies requiring the most predictable modern tower systems or standardized floorplates.",
      "Users that depend heavily on easy parking, loading, or specialized operational infrastructure.",
      "Teams whose employees are primarily Caltrain-oriented and may prefer Townsend corridor buildings.",
    ],
    buildingExperience:
      "The experience is more urban and character-driven than a modern tower, but more central and polished than many production-adjacent SoMa buildings. It can work well for teams that want the office to feel like San Francisco technology space rather than a conventional corporate address.",
    districtContext:
      "680 Folsom sits in central SoMa, where adaptive reuse, technology office, downtown access, and mixed-use street patterns overlap. It should be compared with Salesforce Tower and 181 Fremont when tower image matters, 888 Brannan when warehouse-to-headquarters character matters, and 650 Townsend when Caltrain and large-format southern SoMa workspace are stronger priorities.",
    advantages: [
      "Strong example of modernized SoMa adaptive reuse office space.",
      "More character and technology-office identity than many traditional downtown towers.",
      "Central SoMa location for companies comparing downtown access with creative-office feel.",
      "Useful alternative when a modern tower feels too formal or image-driven.",
      "Good reference point for evaluating buildout and systems in repositioned buildings.",
    ],
    tradeoffs: [
      "Older-building systems and buildout condition should be verified rather than assumed.",
      "May not provide the same client-facing address signal as Financial District towers.",
      "Parking, loading, and visitor arrival can be more complex than in less central districts.",
      "Creative character only matters if the available suite supports the team's actual layout and workstyle.",
    ],
    validationNotes: [
      "What work has already been done to the suite, and what tenant improvements would still be required?",
      "Do HVAC hours, power, security, access, and building systems support the team's operating pattern?",
      "Does the available floorplate divide efficiently for focused work, collaboration, meetings, and future growth?",
      "Would a tower like 181 Fremont or Salesforce Tower create more client value, or would that add unnecessary cost?",
      "How does the central SoMa commute compare with West SoMa, Mission Bay, and Financial District alternatives?",
    ],
    nearbyAlternatives: [
      { label: "Salesforce Tower", url: "/commercial-real-estate/building/CA/san-francisco/415-mission-st/", reason: "A stronger fit when the business needs modern tower visibility and headquarters signaling." },
      { label: "181 Fremont", url: "/commercial-real-estate/building/CA/san-francisco/181-fremont-st/", reason: "Compare when premium Transbay tower quality matters more than adaptive reuse character." },
      { label: "888 Brannan", url: "/commercial-real-estate/building/CA/san-francisco/888-brannan-st/", reason: "Useful when the tenant wants a larger warehouse-to-headquarters environment farther west in SoMa." },
      { label: "650 Townsend", url: "/commercial-real-estate/building/CA/san-francisco/650-townsend-st/", reason: "Compare when Caltrain orientation and large-format team space matter more than central SoMa access." },
      { label: "140 New Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/140-new-montgomery-st/", reason: "A relevant alternative when historic character and downtown edge location are central to the workplace story." },
    ],
    representativeCompanies: [
      "Technology, product, creative, design, and professional-service teams are the most relevant company categories.",
      "Named tenant details and specific building-system claims should be verified from current source materials.",
    ],
    relatedInsights: [
      { title: "SoMa commercial real estate", url: "/commercial-real-estate/CA/san-francisco/soma/", summary: "Understand how central SoMa differs from Transbay, West SoMa, and Mission Bay." },
      { title: "Tenant Improvements", url: "/commercial-real-estate/lease-guide/tenant-improvements/", summary: "Evaluate buildout, systems, delivery condition, and landlord contributions before leasing adaptive reuse space." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Compare buildings by layout, access, cost, operations, and future flexibility." },
    ],
  }),
  [buildingPath("650 Townsend St")]: buildingBrief({
    buildingSummary:
      "650 Townsend is a large-format West SoMa creative office building for teams that value adaptable workspace, Caltrain-oriented access, and a less formal setting than the Financial District. It is most useful for companies comparing practical team space against the image and polish of downtown towers.",
    buildingImportance:
      "650 Townsend matters because it explains the Townsend corridor's role in San Francisco office decisions. It represents the version of SoMa where floorplate usability, technology history, production-adjacent surroundings, and regional access often matter more than a formal lobby sequence or traditional executive address.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Large-format creative office" },
      { label: "Commercial role", value: "Large-format creative office building" },
      { label: "District", value: "SoMa" },
      { label: "Floorplate character", value: "Larger creative floorplate environment; team layout and expansion path should be validated" },
      { label: "Transit context", value: "Useful for Caltrain-oriented and SoMa commute patterns, with exact access depending on employee origins" },
      { label: "Parking context", value: "Parking and curb access should be validated because the area is more operational than traditional downtown" },
    ],
    idealFor: [
      "Technology, creative, and product teams that need adaptable team space rather than a formal tower environment.",
      "Growth companies comparing West SoMa, Showplace Square, and Design District creative-office options.",
      "Teams that value Caltrain access, freeway proximity, and a more production-adjacent workday.",
      "Organizations whose workplace culture is better served by usable space and collaboration than traditional downtown image.",
    ],
    mayNotFit: [
      "Client-facing firms that need a traditional Financial District address.",
      "Companies that want a polished tower arrival sequence or dense downtown service environment.",
      "Teams that prioritize highly walkable retail blocks over workspace scale and flexibility.",
      "Businesses whose employees depend primarily on BART-oriented downtown commute patterns.",
    ],
    buildingExperience:
      "The experience is more working office than executive tower. Businesses should expect a SoMa setting where floorplate usability, team collaboration, and regional access matter more than lobby formality. The surrounding blocks can feel practical and uneven, which may be a strength for operators and a drawback for teams selling a polished client experience.",
    districtContext:
      "650 Townsend sits where SoMa, Showplace Square, and the Design District begin to overlap. That position gives it access to technology, creative office, Caltrain, freeway, and production-adjacent patterns, but it also means the immediate surroundings feel different from the Financial District, Transbay, or Mission Bay. The building should be evaluated as part of a southern SoMa workday, not as a generic downtown office.",
    advantages: [
      "Strong example of larger SoMa creative-office demand.",
      "Less formal workplace identity than traditional downtown towers.",
      "Useful access pattern for teams oriented toward Caltrain, SoMa, and the Peninsula.",
      "Better fit for adaptable team layouts than many smaller boutique office buildings.",
      "Useful reference point for comparing workspace utility against executive image.",
    ],
    tradeoffs: [
      "Weaker traditional downtown prestige than the Financial District or Transbay towers.",
      "Pedestrian experience and nearby amenities can be more uneven by block.",
      "Transit convenience depends heavily on where employees commute from.",
      "The utilitarian surroundings may not support every client-facing brand.",
      "Specific floorplate, building systems, and parking conditions should be validated before shortlisting.",
    ],
    validationNotes: [
      "Does the available floorplate support the team's collaboration pattern without wasting space?",
      "Is Caltrain, freeway, or neighborhood access more important than BART-oriented downtown access?",
      "Will the surrounding street environment support recruiting, visitors, and daily employee needs?",
      "Can the building support the company's after-hours access, deliveries, production-adjacent needs, or event schedule?",
      "Would 888 Brannan, 600 Townsend, 680 Folsom, or a Design District alternative provide a better tradeoff?",
    ],
    nearbyAlternatives: [
      { label: "888 Brannan", url: "/commercial-real-estate/building/CA/san-francisco/888-brannan-st/", reason: "A stronger comparison when adaptive reuse and warehouse-to-headquarters character are central to the decision." },
      { label: "600 Townsend", url: "/commercial-real-estate/building/CA/san-francisco/600-townsend-st/", reason: "Useful when the company wants similar Townsend corridor logic with a different building scale and location feel." },
      { label: "680 Folsom", url: "/commercial-real-estate/building/CA/san-francisco/680-folsom-st/", reason: "Compare when the search needs a more central SoMa technology setting with adaptive reuse character." },
      { label: "2 Henry Adams", url: "/commercial-real-estate/building/CA/san-francisco/2-henry-adams-st/", reason: "A relevant alternative for teams leaning toward Design District character and showroom-adjacent creative space." },
      { label: "808 Brannan", url: "/commercial-real-estate/building/CA/san-francisco/808-brannan-st/", reason: "Compare when robotics, AI, or larger creative-office users want a Showplace Square edge." },
    ],
    representativeCompanies: [
      "Technology, product, creative, design, and production-adjacent teams are the most useful company categories to consider.",
      "Specific tenant names should be verified from current building materials before being used in a leasing decision.",
    ],
    relatedInsights: [
      { title: "SoMa commercial real estate", url: "/commercial-real-estate/CA/san-francisco/soma/", summary: "Compare the different SoMa subareas before assuming one building explains the whole district." },
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Compare traditional downtown towers when client-facing image matters more than creative-office flexibility." },
      { title: "Tenant Improvements", url: "/commercial-real-estate/lease-guide/tenant-improvements/", summary: "Use this guide to evaluate buildout, infrastructure, timing, and cost before choosing a creative-office floorplate." },
    ],
  }),
  [buildingPath("156 2nd St")]: buildingBrief({
    buildingSummary:
      "156 2nd St is a smaller-grain SoMa office building for teams comparing Central SoMa's 2nd Street corridor with more formal Financial District towers and larger SoMa creative-office buildings. It is useful when a search depends on downtown proximity, creative-office identity, and manageable scale rather than a flagship headquarters signal.",
    buildingImportance:
      "156 2nd St matters because it reinforces the part of SoMa that works for smaller professional, product, and creative teams near the downtown boundary. Read with 144 2nd St, it shows why not every SoMa decision is about trophy towers, warehouse headquarters, or Mission Bay-scale buildings.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Smaller Central SoMa office building" },
      { label: "Commercial role", value: "2nd Street creative office benchmark" },
      { label: "District", value: "SoMa" },
      { label: "Submarket context", value: "2nd Street and Central SoMa transition" },
      { label: "Floorplate character", value: "Smaller office environment; suite layout, systems, and expansion options should be validated" },
      { label: "Transit context", value: "Central SoMa and downtown-edge access; commute fit depends on employee origins" },
      { label: "Parking context", value: "Urban parking, loading, and visitor arrival should be checked before shortlisting" },
    ],
    idealFor: [
      "Small and mid-sized technology, product, creative, and professional-service teams that want a SoMa address without a large headquarters footprint.",
      "Companies comparing 2nd Street office texture against Financial District formality and Transbay tower scale.",
      "Teams that value central access, practical floorplates, and neighborhood identity more than landmark visibility.",
      "Organizations that want to understand whether Central SoMa fits before moving farther west or south in the district.",
    ],
    mayNotFit: [
      "Companies that need a flagship tower image, large contiguous expansion path, or formal executive arrival.",
      "Teams that want the broadest Financial District client-services environment.",
      "Users requiring specialized lab, medical, production, or heavy operational infrastructure without specific validation.",
      "Businesses whose employee commute pattern points more strongly to Caltrain-oriented Townsend corridor buildings.",
    ],
    buildingExperience:
      "The experience is central, urban, and smaller in grain than SoMa's large creative-office buildings. It can work well for teams that want a practical workplace close to downtown while keeping a distinctly SoMa identity. Tenants should validate suite condition and daily arrival carefully because the value is in fit and context, not generic prestige.",
    districtContext:
      "156 2nd St sits in the 2nd Street transition area, where central SoMa, downtown access, older commercial blocks, and technology-office demand overlap. It should be compared with 144 2nd St for similar smaller-team logic, 680 Folsom for larger adaptive reuse, and 303 2nd St when a more corporate Class A profile is needed.",
    advantages: [
      "Good reference point for smaller Central SoMa office demand.",
      "Supports a less formal workplace identity than Financial District towers.",
      "Useful downtown-edge geography for teams comparing SoMa, Transbay, and Financial District options.",
      "Pairs with 144 2nd St to show SoMa's smaller creative-office layer.",
      "Can help teams test whether they need central access or larger creative-office scale.",
    ],
    tradeoffs: [
      "Does not carry the same symbolic signal as Salesforce Tower, 181 Fremont, or Financial District landmarks.",
      "May offer less expansion flexibility than larger SoMa creative-office buildings.",
      "Block-by-block pedestrian experience and amenity fit should be validated.",
      "Building systems, suite condition, and operating hours should not be assumed from district context alone.",
    ],
    validationNotes: [
      "Does the available suite fit the team's size, meeting pattern, and near-term growth without overbuilding?",
      "Would 144 2nd St, 303 2nd St, or 680 Folsom provide a clearer balance of image, scale, and access?",
      "Is Central SoMa more useful for the employee base than Townsend corridor or Financial District access?",
      "Do building systems, security, elevator access, delivery needs, and after-hours use match the company workflow?",
      "Will the surrounding blocks support recruiting, visitors, lunch, and daily routines for this specific team?",
    ],
    nearbyAlternatives: [
      { label: "144 2nd St", url: "/commercial-real-estate/building/CA/san-francisco/144-2nd-st/", reason: "The closest conceptual comparison for smaller and mid-sized teams evaluating 2nd Street office context." },
      { label: "303 2nd St", url: "/commercial-real-estate/building/CA/san-francisco/303-2nd-st/", reason: "A better comparison when the company wants a more corporate Class A building on the same corridor." },
      { label: "680 Folsom", url: "/commercial-real-estate/building/CA/san-francisco/680-folsom-st/", reason: "Useful when central SoMa access matters but the team needs stronger adaptive reuse identity and larger scale." },
      { label: "140 New Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/140-new-montgomery-st/", reason: "Compare when historic character and Market Street adjacency are more important than 2nd Street texture." },
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/", reason: "Use the district page to compare central SoMa, Transbay, South Park, Townsend, and Mission Bay-edge options." },
    ],
    representativeCompanies: [
      "Small and mid-sized technology, product, creative, and professional-service teams are the most relevant company categories.",
      "Named tenants, availability, suite condition, and building systems should be verified from current source materials before relying on them.",
    ],
    relatedInsights: [
      { title: "SoMa commercial real estate", url: "/commercial-real-estate/CA/san-francisco/soma/", summary: "Compare the subareas inside SoMa before deciding whether 2nd Street is the right context." },
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Compare traditional downtown office settings when client-facing formality matters more than creative-office character." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Use a structured comparison of layout, commute, operating fit, and buildout before shortlisting." },
    ],
  }),
  [buildingPath("888 Brannan St")]: buildingBrief({
    buildingSummary:
      "888 Brannan is a large SoMa adaptive reuse office building for companies that want warehouse-to-headquarters character, larger creative floorplates, and a less formal setting than downtown towers. It is useful for tenants comparing West SoMa scale, creative identity, and production-adjacent surroundings.",
    buildingImportance:
      "888 Brannan matters because it explains SoMa's warehouse-to-headquarters pattern. It shows how older large-format buildings can become meaningful office options for technology, creative, and product teams that care about workspace identity, team layout, and cultural fit more than traditional Financial District prestige.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Large-format adaptive reuse office" },
      { label: "Commercial role", value: "Warehouse-to-headquarters creative office benchmark" },
      { label: "District", value: "SoMa" },
      { label: "Secondary context", value: "Design District and Showplace Square edge" },
      { label: "Floorplate character", value: "Large creative floorplate environment; suite division and expansion path should be validated" },
      { label: "Transit context", value: "West SoMa access with Caltrain, freeway, and neighborhood commute tradeoffs" },
      { label: "Parking context", value: "Parking, loading, and curb access should be evaluated against the team's operating needs" },
    ],
    idealFor: [
      "Technology, creative, product, design, and brand teams that want larger adapted floorplates with workplace character.",
      "Companies comparing West SoMa, Showplace Square, and Design District office environments.",
      "Teams that value collaboration space, visual identity, and less formal surroundings more than executive tower polish.",
      "Organizations whose culture benefits from a warehouse-to-headquarters setting near production and design-oriented blocks.",
    ],
    mayNotFit: [
      "Client-facing firms that require a traditional Financial District address or formal tower arrival.",
      "Companies whose employees need the most direct BART-oriented commute pattern.",
      "Teams that want a highly polished downtown pedestrian environment on every surrounding block.",
      "Users requiring specialized lab, medical, or heavy industrial infrastructure without careful validation.",
    ],
    buildingExperience:
      "The experience is large-format, creative, and less formal than downtown tower space. It can help a company express culture through the workplace, but the surrounding area is more utilitarian and block-by-block than the Financial District or Transbay. Tenants should evaluate daily employee experience as carefully as floorplate appeal.",
    districtContext:
      "888 Brannan sits near the overlap of SoMa, Showplace Square, and the Design District. That gives it a strong creative and production-adjacent context, but also a different street rhythm from central SoMa and Transbay. It should be compared with 650 Townsend for similar scale, 680 Folsom for a more central adaptive reuse choice, and 2 Henry Adams when the search leans more toward Design District character.",
    advantages: [
      "Strong warehouse-to-headquarters identity for creative and technology teams.",
      "Large-format workspace character that differs from traditional tower inventory.",
      "Useful proximity to West SoMa, Showplace Square, and Design District commercial patterns.",
      "Good fit for teams that value culture, collaboration, and space adaptability.",
      "Meaningful comparison point for companies deciding between creative-office scale and downtown formality.",
    ],
    tradeoffs: [
      "Surrounding pedestrian experience and amenities can be uneven by block.",
      "Less traditional client-facing prestige than Financial District or Transbay towers.",
      "Transit convenience depends heavily on employee origins and Caltrain relevance.",
      "Large adapted floorplates can create buildout, acoustics, HVAC, and layout questions that need validation.",
    ],
    validationNotes: [
      "Does the available floorplate support the team's department structure without creating inefficient open space?",
      "What tenant improvements, systems, acoustics, HVAC, and infrastructure work would be required?",
      "How do employees and visitors experience arrival from Caltrain, rideshare, parking, bikes, and transit?",
      "Does the surrounding area support recruiting, clients, and daily amenities for this specific company?",
      "Would 650 Townsend, 680 Folsom, or 2 Henry Adams provide a clearer balance of scale, character, and access?",
    ],
    nearbyAlternatives: [
      { label: "650 Townsend", url: "/commercial-real-estate/building/CA/san-francisco/650-townsend-st/", reason: "A strong comparison for larger SoMa creative-office demand with a Townsend corridor access pattern." },
      { label: "680 Folsom", url: "/commercial-real-estate/building/CA/san-francisco/680-folsom-st/", reason: "Useful when central SoMa access and adaptive reuse character matter more than West SoMa scale." },
      { label: "600 Townsend", url: "/commercial-real-estate/building/CA/san-francisco/600-townsend-st/", reason: "Compare when Caltrain orientation and a different Townsend corridor profile may better fit employees." },
      { label: "2 Henry Adams", url: "/commercial-real-estate/building/CA/san-francisco/2-henry-adams-st/", reason: "A better fit when the search leans toward Design District character and showroom-adjacent creative space." },
      { label: "808 Brannan", url: "/commercial-real-estate/building/CA/san-francisco/808-brannan-st/", reason: "Compare when AI, robotics, or larger creative-office users want a Showplace Square edge." },
    ],
    representativeCompanies: [
      "Technology, creative, product, design, brand, and production-adjacent office users are the most relevant company categories.",
      "Named tenant details should be verified from current building materials before being used in diligence.",
    ],
    relatedInsights: [
      { title: "SoMa commercial real estate", url: "/commercial-real-estate/CA/san-francisco/soma/", summary: "Compare West SoMa, central SoMa, Transbay, and Townsend corridor office patterns." },
      { title: "San Francisco commercial real estate", url: "/commercial-real-estate/CA/san-francisco/", summary: "Use the city page to compare SoMa against Mission Bay, the Financial District, and Jackson Square." },
      { title: "Tenant Improvements", url: "/commercial-real-estate/lease-guide/tenant-improvements/", summary: "Validate buildout scope, infrastructure, timing, and delivery condition in adapted creative-office buildings." },
    ],
  }),
  [buildingPath("600 Townsend St")]: buildingBrief({
    buildingSummary:
      "600 Townsend is a Townsend corridor office building for teams that want creative-office character, Caltrain-oriented access, and a practical southern SoMa setting. It is useful for companies comparing large-format SoMa options without defaulting to the more prominent 650 Townsend or 888 Brannan references.",
    buildingImportance:
      "600 Townsend matters because it helps explain the working-office side of the Townsend corridor. It is a representative comparison point for companies that care about Caltrain, team layout, creative-office identity, and SoMa access, but want to understand alternatives beyond the most visible large-format buildings.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Creative office building" },
      { label: "Commercial role", value: "Townsend corridor office benchmark" },
      { label: "District", value: "SoMa" },
      { label: "Secondary context", value: "Showplace Square edge" },
      { label: "Floorplate character", value: "Creative-office environment; floorplate, buildout, and suite scale should be validated" },
      { label: "Transit context", value: "Useful for Caltrain-oriented and southern SoMa commute patterns" },
      { label: "Parking context", value: "Parking, curb access, and visitor arrival should be checked by commute pattern" },
    ],
    idealFor: [
      "Technology, creative, product, and operational teams that want a practical SoMa workplace near the Townsend corridor.",
      "Companies that value Caltrain access and southern SoMa geography more than traditional downtown address signal.",
      "Teams comparing creative-office floorplates against central SoMa adaptive reuse and Transbay towers.",
      "Growth companies that need usable team space but do not require the strongest building identity in the district.",
    ],
    mayNotFit: [
      "Client-facing firms that need a polished Financial District or Transbay tower arrival.",
      "Teams whose employees rely mainly on BART or northern downtown transit.",
      "Companies that want a high-amenity tower or formal headquarters signal.",
      "Users requiring heavy operational infrastructure without validating loading, access, and building systems.",
    ],
    buildingExperience:
      "The experience is practical, creative, and corridor-oriented. It is less about making a public headquarters statement and more about whether the building supports the team's workday. The right tenant will value SoMa access and usable workspace; the wrong tenant may see the surroundings as too utilitarian.",
    districtContext:
      "600 Townsend sits on the Townsend corridor, close to the SoMa, Showplace Square, and Mission Bay transition. The location is most relevant for companies with Caltrain or southern SoMa priorities. It should be compared with 650 Townsend for larger-format visibility, 888 Brannan for warehouse-to-headquarters character, and 410 Townsend or 460 Townsend for other corridor options.",
    advantages: [
      "Strong fit for teams oriented around the Townsend corridor and Caltrain access.",
      "Creative-office identity without the formality of Financial District or Transbay towers.",
      "Useful comparison point for companies that need practical team space in SoMa.",
      "Can support a less formal technology, product, or creative workplace.",
    ],
    tradeoffs: [
      "Less traditional prestige and client-facing polish than downtown towers.",
      "Pedestrian activity and amenities can vary block by block.",
      "Transit fit depends heavily on whether Caltrain and southern SoMa access matter to employees.",
      "Specific buildout, systems, parking, and expansion options should be validated before shortlisting.",
    ],
    validationNotes: [
      "Does the suite support the team's layout, collaboration, meeting, and focus needs without major rework?",
      "Is the Caltrain and southern SoMa commute pattern actually useful for the employee base?",
      "How do parking, bike access, rideshare, deliveries, and visitor arrival work at peak times?",
      "Does the surrounding corridor support recruiting, lunch, client visits, and after-hours use?",
      "Would 650 Townsend, 888 Brannan, or 680 Folsom provide a better balance of scale, image, and access?",
    ],
    nearbyAlternatives: [
      { label: "650 Townsend", url: "/commercial-real-estate/building/CA/san-francisco/650-townsend-st/", reason: "A stronger comparison when the company wants larger-format SoMa identity and more prominent creative-office scale." },
      { label: "888 Brannan", url: "/commercial-real-estate/building/CA/san-francisco/888-brannan-st/", reason: "Useful when warehouse-to-headquarters character is more important than Townsend corridor practicality." },
      { label: "680 Folsom", url: "/commercial-real-estate/building/CA/san-francisco/680-folsom-st/", reason: "Compare when central SoMa access and adaptive reuse character matter more than Caltrain orientation." },
      { label: "460 Townsend", url: "/commercial-real-estate/building/CA/san-francisco/460-townsend-st/", reason: "A relevant corridor alternative when the tenant wants similar geography with a different building profile." },
      { label: "410 Townsend", url: "/commercial-real-estate/building/CA/san-francisco/410-townsend-st/", reason: "Compare when a nearby Townsend corridor building may offer a better suite scale or access pattern." },
    ],
    representativeCompanies: [
      "Technology, creative, product, and operational office teams are the most relevant company categories.",
      "Specific tenant names, building systems, and availability details should be validated from current source materials.",
    ],
    relatedInsights: [
      { title: "SoMa commercial real estate", url: "/commercial-real-estate/CA/san-francisco/soma/", summary: "Understand how the Townsend corridor fits within SoMa's broader commercial geography." },
      { title: "San Francisco commercial real estate", url: "/commercial-real-estate/CA/san-francisco/", summary: "Compare SoMa against Mission Bay, the Financial District, Jackson Square, and nearby districts." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Compare layout, access, buildout, cost, and flexibility before adding a building to the shortlist." },
    ],
  }),
  [buildingPath("699 2nd St")]: buildingBrief({
    buildingSummary:
      "699 2nd St is a SoMa edge office building for teams comparing the district's China Basin and 2nd Street transition with Mission Bay, South Park, and the Townsend corridor. It is useful when the question is not simply central SoMa versus Financial District, but whether a southern waterfront-adjacent edge better fits the workday.",
    buildingImportance:
      "699 2nd St matters because it explains SoMa's southern edge. It shows how office searches can begin to overlap with larger blocks, service-commercial context, waterfront movement, and Mission Bay adjacency without becoming a pure Mission Bay or life-science decision.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "SoMa edge office building" },
      { label: "Commercial role", value: "China Basin edge office benchmark" },
      { label: "District", value: "SoMa" },
      { label: "Secondary context", value: "China Basin, waterfront edge, and Mission Bay adjacency" },
      { label: "Floorplate character", value: "Office-edge environment; suite scale, systems, and buildout should be validated directly" },
      { label: "Transit context", value: "Southern SoMa access with Caltrain, Mission Bay, and waterfront circulation considerations" },
      { label: "Parking context", value: "Parking, event-area movement, loading, and visitor access should be validated by operating pattern" },
    ],
    idealFor: [
      "Technology, product, service-commercial, and professional teams comparing SoMa with Mission Bay and waterfront-adjacent options.",
      "Companies that value SoMa access but want to understand the southern 2nd Street and China Basin edge.",
      "Teams whose employee or visitor pattern may benefit from Caltrain, Mission Bay proximity, or a less central SoMa location.",
      "Organizations evaluating whether a transitional district context supports their workday better than a formal downtown tower.",
    ],
    mayNotFit: [
      "Firms that need a clear Financial District or Transbay tower identity.",
      "Teams that want the densest central SoMa street life or the strongest downtown business-service environment.",
      "Companies that need specialized laboratory, medical, or production infrastructure without direct property-level validation.",
      "Businesses that would be confused by a location that feels more like a district edge than a single obvious neighborhood center.",
    ],
    buildingExperience:
      "The experience is transitional and practical. Tenants should expect a SoMa office setting shaped by nearby waterfront, China Basin, Mission Bay, and service-commercial patterns rather than the more polished central downtown rhythm. That can be valuable for access and district flexibility, but it requires clearer diligence on commute, visitors, and daily employee routines.",
    districtContext:
      "699 2nd St sits near the southern 2nd Street and China Basin edge, where SoMa begins to connect with Mission Bay and the waterfront. It should be compared with 600 Townsend for Townsend corridor office logic, 500 Terry Francois for a clearer Mission Bay waterfront setting, and 1800 Owens when a newer Mission Bay office environment is more appropriate.",
    advantages: [
      "Strong reference for SoMa's southern China Basin edge.",
      "Useful comparison for teams deciding between SoMa and Mission Bay adjacency.",
      "Can support a practical office search where district access and edge conditions matter.",
      "Helps explain that SoMa includes transitional commercial environments, not only central technology blocks.",
      "Relevant for companies that want to test waterfront and Caltrain-adjacent context without defaulting to Mission Bay.",
    ],
    tradeoffs: [
      "Location identity can feel less singular than core SoMa, Financial District, or Mission Bay choices.",
      "Amenity, transit, and pedestrian experience should be tested block by block.",
      "Event-area circulation and waterfront movement may affect employee and visitor patterns.",
      "Specialized-use capability should not be inferred from proximity to Mission Bay or district context.",
    ],
    validationNotes: [
      "Is the team intentionally choosing a SoMa edge, or would core SoMa, South Beach, or Mission Bay be clearer?",
      "How do employees and visitors arrive by Caltrain, transit, rideshare, bike, car, and on event days?",
      "Does the available suite support ordinary office needs without relying on unsupported specialized-use assumptions?",
      "Would 600 Townsend, 500 Terry Francois, or 1800 Owens better match the company's district story?",
      "Does the surrounding edge context support recruiting, clients, daily services, and after-hours operating needs?",
    ],
    nearbyAlternatives: [
      { label: "600 Townsend", url: "/commercial-real-estate/building/CA/san-francisco/600-townsend-st/", reason: "A stronger comparison when Townsend corridor office access and southern SoMa practicality are central to the decision." },
      { label: "500 Terry Francois", url: "/commercial-real-estate/building/CA/san-francisco/500-terry-francois-blvd/", reason: "Useful when the company wants a clearer Mission Bay waterfront office context." },
      { label: "1800 Owens", url: "/commercial-real-estate/building/CA/san-francisco/1800-owens-st/", reason: "Compare when a newer Mission Bay office environment and institutional adjacency matter more than SoMa identity." },
      { label: "414 Brannan", url: "/commercial-real-estate/building/CA/san-francisco/414-brannan-st/", reason: "A better comparison when South Park and central creative-office context are more important than the China Basin edge." },
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/", reason: "Use the district page to compare central SoMa, South Park, Townsend, and Mission Bay-edge environments." },
    ],
    representativeCompanies: [
      "Technology, product, professional-service, service-commercial, and operations-aware office users are the most relevant company categories.",
      "Current tenant names, availability, suite condition, and specialized infrastructure should be verified from current source materials.",
    ],
    relatedInsights: [
      { title: "SoMa commercial real estate", url: "/commercial-real-estate/CA/san-francisco/soma/", summary: "Compare SoMa's internal subareas before choosing a southern edge location." },
      { title: "Mission Bay commercial real estate", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", summary: "Compare Mission Bay when the company wants a clearer health, research, waterfront, or planned-district identity." },
      { title: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", summary: "Clarify whether commute, district identity, clients, operations, or future flexibility should lead the decision." },
    ],
  }),
  [buildingPath("1800 Owens St")]: buildingBrief({
    buildingSummary:
      "The Exchange is a modern Mission Bay office building for organizations that want newer workspace near health, life-science, technology, and waterfront anchors without choosing a traditional downtown tower. It helps companies evaluate whether Mission Bay's campus-like district identity is a better fit than central SoMa or the Financial District.",
    buildingImportance:
      "The Exchange matters because it shows Mission Bay's office identity apart from both downtown towers and older SoMa buildings. A company considering it is usually weighing newer construction, institutional adjacency, waterfront access, and a more planned district rhythm against the broader client access and street life of older business areas.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Modern office building" },
      { label: "Commercial role", value: "Modern Mission Bay office building" },
      { label: "District", value: "Mission Bay" },
      { label: "Floorplate character", value: "Large modern office environment; exact suite fit should be validated by floor" },
      { label: "Transit context", value: "Mission Bay transit and Caltrain-adjacent access depend on each team's commute pattern" },
      { label: "Parking context", value: "Structured and district parking options may be more practical than in some core districts, but should still be verified" },
    ],
    idealFor: [
      "Technology, health, and life-science-adjacent teams that value a newer Mission Bay setting.",
      "Growth companies comparing modern office environments outside the traditional downtown tower core.",
      "Organizations that want proximity to Mission Bay anchors without assuming laboratory capability in the specific space.",
      "Teams that prefer a planned, campus-like district rhythm over older downtown street patterns.",
    ],
    mayNotFit: [
      "Firms that need a traditional Financial District client-facing address.",
      "Companies that rely on older downtown business services, hotels, and dense weekday street activity.",
      "Businesses seeking historic character, boutique executive space, or a low-rise neighborhood feel.",
      "Teams whose employees need the broadest BART-oriented downtown commute access.",
    ],
    buildingExperience:
      "The experience is modern, planned, and tied to Mission Bay's health, research, and technology anchors. It is less about old downtown prestige and more about whether the team benefits from being near a newer innovation district. That can strengthen recruiting and partnerships, but it can also narrow the building's appeal for companies that need broad downtown familiarity.",
    districtContext:
      "The Exchange sits in Mission Bay, near UCSF, healthcare, life-science, technology, waterfront buildings, and newer mixed-use development. Its location is strongest for organizations whose business story benefits from that ecosystem. Compare South Beach for a closer downtown-waterfront bridge, Dogpatch for a more industrial edge, and SoMa when central technology access matters more than Mission Bay's specialized identity.",
    advantages: [
      "Strong Mission Bay reference for modern office users beyond pure laboratory demand.",
      "District context near health, research, technology, and waterfront anchors.",
      "Newer commercial environment than many traditional downtown buildings.",
      "Useful alternative for companies that want scale without a Financial District identity.",
      "More campus-like setting than most central SoMa or Financial District options.",
    ],
    tradeoffs: [
      "More specialized location identity than the Financial District or central SoMa.",
      "District amenities and street activity may feel less mature or less organic than older neighborhoods.",
      "Event activity and district circulation should be considered depending on operating hours.",
      "Do not assume lab capability or specialized infrastructure without validating the specific space.",
      "Some clients or employees may perceive it as less central than downtown even when regional access is workable.",
    ],
    validationNotes: [
      "Does Mission Bay's health, research, and technology identity strengthen the company's recruiting, customer, or partner story?",
      "Is the commute pattern better served by Mission Bay than by SoMa, South Beach, or the Financial District?",
      "Does the available space support office needs without relying on unsupported lab or specialized-use assumptions?",
      "How do event days, visitor parking, light-rail access, and Caltrain connections affect the real workday?",
      "Would 500 Terry Francois, 550 Terry Francois, Salesforce Tower, or Dogpatch provide a clearer location fit?",
    ],
    nearbyAlternatives: [
      { label: "500 Terry Francois", url: "/commercial-real-estate/building/CA/san-francisco/500-terry-francois-blvd/", reason: "A useful comparison when waterfront adjacency and Mission Bay's planned office environment are central to the search." },
      { label: "550 Terry A Francois", url: "/commercial-real-estate/building/CA/san-francisco/550-terry-a-francois-blvd/", reason: "Compare when office and life-science adjacency matter, but the team needs to validate exact infrastructure and space use." },
      { label: "1700 Owens", url: "/commercial-real-estate/building/CA/san-francisco/1700-owens-st/", reason: "Relevant for organizations weighing Mission Bay's health and research cluster against general office usability." },
      { label: "Salesforce Tower", url: "/commercial-real-estate/building/CA/san-francisco/415-mission-st/", reason: "Compare when the company wants a modern tower identity with stronger downtown and Transbay visibility." },
      { label: "1455 3rd St", url: "/commercial-real-estate/building/CA/san-francisco/1455-3rd-st/", reason: "Useful when Mission Bay access, event-area circulation, and waterfront-edge context are part of the decision." },
    ],
    representativeCompanies: [
      "Technology, healthcare, life-science-adjacent, research-oriented, and modern office users are the most relevant company categories.",
      "Laboratory use, specialized infrastructure, and named tenant details should be verified for the specific space before relying on them.",
    ],
    relatedInsights: [
      { title: "Mission Bay commercial real estate", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", summary: "Understand Mission Bay's newer, more campus-like commercial geography before focusing on a specific building." },
      { title: "Dogpatch commercial real estate", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", summary: "Compare nearby industrial and waterfront character when Mission Bay feels too specialized or planned." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Use a structured comparison before deciding whether a newer Mission Bay building fits the business." },
    ],
  }),
  [buildingPath("500 Terry Francois Blvd")]: buildingBrief({
    buildingSummary:
      "500 Terry Francois is a Mission Bay waterfront-adjacent office building for companies that want newer district context, bayfront access, and a less traditional downtown identity. It is useful for teams comparing Mission Bay's planned office environment with South Beach, SoMa, and the Financial District.",
    buildingImportance:
      "500 Terry Francois matters because it explains Mission Bay's waterfront office character. It helps tenants understand that Mission Bay is not only a life-science cluster; it also offers modern office settings shaped by larger blocks, water access, institutional anchors, and a daily rhythm that differs from older downtown districts.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Modern waterfront-adjacent office building" },
      { label: "Commercial role", value: "Mission Bay waterfront office benchmark" },
      { label: "District", value: "Mission Bay" },
      { label: "Floorplate character", value: "Modern office environment; suite layout and infrastructure should be validated by floor" },
      { label: "Transit context", value: "Mission Bay light rail, Caltrain-adjacent, and waterfront access patterns vary by employee origin" },
      { label: "Parking context", value: "District parking and event-area circulation should be validated for employees and visitors" },
    ],
    idealFor: [
      "Technology, health, professional-service, and modern office teams that value Mission Bay's waterfront and institutional context.",
      "Companies that want newer office geography without choosing a Financial District or Transbay tower.",
      "Teams comparing Mission Bay and South Beach because waterfront access and district experience matter.",
      "Organizations that benefit from proximity to Mission Bay anchors but do not need to imply laboratory capability.",
    ],
    mayNotFit: [
      "Firms that need a traditional downtown client-facing address or dense Financial District service environment.",
      "Companies whose employees depend primarily on BART-oriented downtown commute patterns.",
      "Teams seeking historic character, boutique office texture, or a lower-rise north downtown setting.",
      "Users requiring lab, medical, or technical infrastructure without verifying the exact space and building capabilities.",
    ],
    buildingExperience:
      "The experience is modern, waterfront-adjacent, and more planned than older San Francisco office districts. It can support companies that want an open Mission Bay identity, but tenants should test whether the district's quieter, newer rhythm supports employee routines, client visits, and recruiting.",
    districtContext:
      "500 Terry Francois sits along Mission Bay's waterfront edge, near the district's office, health, research, residential, and event anchors. It is most useful for companies comparing waterfront-adjacent Mission Bay with South Beach and central SoMa. The building should be evaluated with district circulation, event activity, light rail, Caltrain proximity, and parking realities in mind.",
    advantages: [
      "Strong waterfront-adjacent Mission Bay office context.",
      "Newer district identity than traditional Financial District and older SoMa buildings.",
      "Useful fit for companies that want modern office space near health, technology, and institutional anchors.",
      "Good comparison point for tenants weighing Mission Bay against South Beach and SoMa.",
      "Can provide a less formal alternative to downtown tower environments.",
    ],
    tradeoffs: [
      "Less traditional client-facing downtown identity than Financial District towers.",
      "District amenities and street activity may feel less organic than older neighborhoods.",
      "Event activity, traffic, and waterfront circulation should be considered by operating schedule.",
      "Specialized use, lab capability, and infrastructure should not be assumed from district context alone.",
    ],
    validationNotes: [
      "Does the waterfront and Mission Bay setting improve employee experience, recruiting, or client perception?",
      "How do commute patterns work across light rail, Caltrain, driving, cycling, and rideshare?",
      "Does the available suite support office use without relying on unsupported specialized infrastructure assumptions?",
      "How do event days, parking, visitor arrival, and after-hours access affect operations?",
      "Would The Exchange, 550 Terry Francois, South Beach, or Salesforce Tower provide a clearer fit?",
    ],
    nearbyAlternatives: [
      { label: "The Exchange", url: "/commercial-real-estate/building/CA/san-francisco/1800-owens-st/", reason: "A stronger comparison when the company wants a major modern Mission Bay office building closer to the district's institutional core." },
      { label: "550 Terry A Francois", url: "/commercial-real-estate/building/CA/san-francisco/550-terry-a-francois-blvd/", reason: "Useful when office/lab adjacency and innovation identity matter more than general waterfront office character." },
      { label: "1455 3rd St", url: "/commercial-real-estate/building/CA/san-francisco/1455-3rd-st/", reason: "Compare when headquarters scale and Mission Bay campus identity are more important." },
      { label: "185 Berry", url: "/commercial-real-estate/building/CA/san-francisco/185-berry-st/", reason: "A relevant South Beach edge alternative when ballpark, waterfront, and downtown adjacency matter." },
      { label: "409 Illinois", url: "/commercial-real-estate/building/CA/san-francisco/409-illinois-st/", reason: "Compare when a smaller modern Mission Bay or waterfront-edge office format may fit better." },
    ],
    representativeCompanies: [
      "Technology, health-adjacent, professional-service, innovation, and modern office users are the most relevant company categories.",
      "Named tenant, lab capability, and specialized infrastructure details should be verified from current source materials.",
    ],
    relatedInsights: [
      { title: "Mission Bay commercial real estate", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", summary: "Understand Mission Bay's planned, waterfront, health, and technology context before choosing a building." },
      { title: "San Francisco commercial real estate", url: "/commercial-real-estate/CA/san-francisco/", summary: "Compare Mission Bay with SoMa, South Beach, Dogpatch, and the Financial District." },
      { title: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", summary: "Clarify whether district identity, commute access, clients, or operations should lead the location decision." },
    ],
  }),
  [buildingPath("550 Terry A Francois Blvd")]: buildingBrief({
    buildingSummary:
      "550 Terry A Francois is a Mission Bay office/lab-oriented representative building for organizations comparing waterfront access, innovation identity, and proximity to life-science and health anchors. It is most useful for teams that need to evaluate Mission Bay's specialized context while validating the exact space requirements before assuming technical fit.",
    buildingImportance:
      "550 Terry A Francois matters because it helps explain Mission Bay's office/lab and innovation identity. It belongs in Rofo's representative collection as a building that forces a practical question: does the company benefit from Mission Bay's life-science-adjacent ecosystem, or would a general office building in SoMa, South Beach, or downtown be more useful?",
    quickFacts: [
      { label: "Primary use", value: "Office / lab-adjacent context" },
      { label: "Building type", value: "Modern Mission Bay office/lab-oriented building" },
      { label: "Commercial role", value: "Mission Bay office/lab and waterfront benchmark" },
      { label: "District", value: "Mission Bay" },
      { label: "Floorplate character", value: "Modern larger-format environment; technical use and suite configuration must be validated" },
      { label: "Transit context", value: "Mission Bay light rail, Caltrain-adjacent, and waterfront access patterns should be tested against commute needs" },
      { label: "Parking context", value: "Parking, loading, visitor access, and event-area circulation should be reviewed early" },
    ],
    idealFor: [
      "Life-science-adjacent, health, technology, innovation, and modern office users that benefit from Mission Bay's institutional context.",
      "Organizations comparing Mission Bay buildings where technical requirements, office needs, and district identity all matter.",
      "Companies that want waterfront-adjacent modern space but need a more specialized context than general SoMa office buildings.",
      "Teams that are prepared to validate infrastructure, buildout, loading, and technical-use requirements before shortlisting.",
    ],
    mayNotFit: [
      "General office users that do not benefit from Mission Bay's specialized innovation and health ecosystem.",
      "Client-facing professional firms that need a traditional Financial District address.",
      "Teams whose workforce is better served by BART-oriented downtown access.",
      "Companies seeking historic character, boutique office scale, or a less planned neighborhood setting.",
    ],
    buildingExperience:
      "The experience is modern, waterfront-adjacent, and tied to Mission Bay's innovation corridor. It may work well for organizations that need the district's ecosystem, but the building should not be evaluated on district reputation alone. The actual suite, infrastructure, building rules, and operating constraints matter.",
    districtContext:
      "550 Terry A Francois sits in Mission Bay's waterfront and innovation context, near other Terry Francois, Illinois, and Owens Street buildings. It is a natural comparison with 500 Terry Francois for general waterfront office character, The Exchange for modern office scale, and 1700 Owens for stronger life-science cluster positioning. Dogpatch and South Beach should also be considered when the district identity feels too specialized.",
    advantages: [
      "Strong fit for organizations that benefit from Mission Bay's life-science, health, and innovation adjacency.",
      "Waterfront-adjacent district context with newer building patterns than older downtown inventory.",
      "Useful comparison point for office users deciding whether Mission Bay specialization matters.",
      "Can support teams that want a modern setting without a traditional tower identity.",
      "Relevant for evaluating technical-use assumptions before committing to a district.",
    ],
    tradeoffs: [
      "Do not assume lab capability, loading, power, ventilation, or technical infrastructure without direct validation.",
      "More specialized district identity than general downtown or central SoMa office locations.",
      "Event activity, traffic, and waterfront circulation can affect commute and visitor experience.",
      "May be less compelling for companies that do not need institutional or innovation adjacency.",
    ],
    validationNotes: [
      "What office, lab, technical, loading, power, ventilation, or infrastructure requirements can the specific space actually support?",
      "Does Mission Bay's innovation ecosystem materially improve recruiting, partnerships, customers, or operations?",
      "How do employee commute patterns work across light rail, Caltrain, driving, cycling, and rideshare?",
      "How do event days, visitor management, parking allocation, and after-hours access affect daily operations?",
      "Would 500 Terry Francois, The Exchange, 1700 Owens, or central SoMa better match the company's real use case?",
    ],
    nearbyAlternatives: [
      { label: "500 Terry Francois", url: "/commercial-real-estate/building/CA/san-francisco/500-terry-francois-blvd/", reason: "A better comparison for tenants prioritizing waterfront-adjacent office character over specialized innovation identity." },
      { label: "The Exchange", url: "/commercial-real-estate/building/CA/san-francisco/1800-owens-st/", reason: "Useful when the company wants a major modern Mission Bay office building without assuming technical use." },
      { label: "1700 Owens", url: "/commercial-real-estate/building/CA/san-francisco/1700-owens-st/", reason: "Compare when life-science cluster adjacency and research-oriented context are more central to the decision." },
      { label: "409 Illinois", url: "/commercial-real-estate/building/CA/san-francisco/409-illinois-st/", reason: "A relevant Mission Bay waterfront-edge alternative with a different building scale and location feel." },
      { label: "Salesforce Tower", url: "/commercial-real-estate/building/CA/san-francisco/415-mission-st/", reason: "Compare when the company wants modern tower identity and broader downtown access instead of Mission Bay specialization." },
    ],
    representativeCompanies: [
      "Life-science-adjacent, healthcare, research-oriented, technology, innovation, and modern office users are the most relevant company categories.",
      "Named tenants and technical capabilities should be verified from current and building-specific sources.",
    ],
    relatedInsights: [
      { title: "Mission Bay commercial real estate", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", summary: "Understand how Mission Bay's health, science, technology, and waterfront context affects location fit." },
      { title: "Tenant Improvements", url: "/commercial-real-estate/lease-guide/tenant-improvements/", summary: "Validate buildout, infrastructure, timing, and delivery condition for specialized or technical-use space." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Compare geography, use fit, infrastructure, cost, access, and flexibility before touring." },
    ],
  }),
  [buildingPath("54 Jeff Adachi Way")]: buildingBrief({
    buildingSummary:
      "54 Jeff Adachi Way is a newer Mission Bay mixed-use edge example for teams evaluating the district's planned commercial pattern near office, residential, waterfront, and event-area activity. It is useful when the question is whether Mission Bay's newer environment fits the company better than older SoMa or downtown office blocks.",
    buildingImportance:
      "54 Jeff Adachi Way matters because it explains Mission Bay as a district experience, not just a lab or office inventory story. It helps tenants evaluate newer development, institutional adjacency, arena-area circulation, and mixed-use neighborhood growth while keeping building-level claims separate from suite-specific facts.",
    quickFacts: [
      { label: "Primary use", value: "Office / mixed-use commercial context" },
      { label: "Building type", value: "Newer Mission Bay commercial block" },
      { label: "Commercial role", value: "Mission Bay mixed-use edge benchmark" },
      { label: "District", value: "Mission Bay" },
      { label: "Secondary context", value: "Mission Rock, Chase Center, waterfront, and planned district edge" },
      { label: "Floorplate character", value: "Newer commercial context; suite layout, systems, and use permissions should be validated" },
      { label: "Transit context", value: "Mission Bay light rail, Caltrain-adjacent access, driving, cycling, and event-day circulation all require commute testing" },
    ],
    idealFor: [
      "Modern office, health-adjacent, technology, innovation, and professional teams that want a newer Mission Bay setting.",
      "Companies comparing Mission Bay's planned environment with SoMa, South Beach, Dogpatch, and downtown alternatives.",
      "Teams that benefit from being near institutional, event, residential, waterfront, and mixed-use activity without needing a traditional CBD address.",
      "Users that want to pressure-test whether Mission Bay's district rhythm supports employees, visitors, partners, and recruiting.",
    ],
    mayNotFit: [
      "Companies that need verified lab, medical, or technical infrastructure without building- and suite-level diligence.",
      "Firms that need a formal Financial District address, dense downtown business services, or BART-first commute pattern.",
      "Teams seeking historic character, adaptive reuse, or boutique neighborhood office texture.",
      "Businesses whose daily operations would be disrupted by event-area traffic, parking demand, or district circulation swings.",
    ],
    buildingExperience:
      "The experience should be evaluated as a newer Mission Bay mixed-use decision. It can support companies that want innovation-district context and a more planned daily setting, but tenants should validate the immediate block, suite condition, visitor access, event activity, and whether the location feels central enough for their actual users.",
    districtContext:
      "54 Jeff Adachi Way sits within Mission Bay's newer commercial geography where office, institutional, residential, waterfront, and event-area patterns overlap. It is best compared with Mission Rock, Chase Center, Terry Francois, and core Mission Bay office/life-science references before assuming that the building represents the district's strongest lab or headquarters identity.",
    advantages: [
      "Clarifies Mission Bay's newer planned and mixed-use commercial environment.",
      "Useful for companies evaluating the district beyond pure lab or downtown office categories.",
      "Strong comparison point for teams weighing Mission Bay against SoMa, South Beach, and Dogpatch.",
      "Can support an innovation, health-adjacent, or modern-office location story when district context matters.",
    ],
    tradeoffs: [
      "Specialized lab, medical, loading, power, ventilation, or technical capability should not be assumed.",
      "Event-area circulation, parking demand, and visitor arrival patterns need practical validation.",
      "Less traditional and less broadly familiar than the Financial District or central SoMa.",
      "May not offer the historic character or adaptive-office feel some San Francisco teams prefer.",
    ],
    validationNotes: [
      "Does the Mission Bay mixed-use setting improve recruiting, partner access, client perception, or employee routines?",
      "How do light rail, Caltrain, driving, biking, rideshare, and event-day circulation work for the team?",
      "Does the available suite support office, meeting, privacy, growth, and any technical requirements without unsupported assumptions?",
      "Would 555 Mission Rock, 1455 3rd, 500 Terry Francois, or 1800 Owens provide a clearer Mission Bay fit?",
      "Would South Beach, SoMa, or Dogpatch solve the same access need with fewer district-specialization tradeoffs?",
    ],
    nearbyAlternatives: [
      { label: "555 Mission Rock St", url: "/commercial-real-estate/building/CA/san-francisco/555-mission-rock-st/", reason: "A direct comparison for Mission Rock mixed-use context and event-area commercial patterns." },
      { label: "Uber Mission Bay", url: "/commercial-real-estate/building/CA/san-francisco/1455-3rd-st/", reason: "Compare when headquarters scale and stronger modern Mission Bay office identity matter more." },
      { label: "500 Terry Francois", url: "/commercial-real-estate/building/CA/san-francisco/500-terry-francois-blvd/", reason: "Useful when waterfront-adjacent office context is more central than Mission Rock mixed-use context." },
      { label: "The Exchange", url: "/commercial-real-estate/building/CA/san-francisco/1800-owens-st/", reason: "A stronger comparison when the company wants a major modern Mission Bay office building closer to the institutional core." },
      { label: "Chase Center", url: "/commercial-real-estate/building/CA/san-francisco/1-warriors-way/", reason: "Relevant when event-area demand, visitor patterns, and amenity context shape the location decision." },
    ],
    representativeCompanies: [
      "Technology, health-adjacent, innovation, professional-service, and modern office users are the most relevant company categories.",
      "Named tenants, availability, specialized-use capability, and current building condition should be verified from current sources.",
    ],
    relatedInsights: [
      { title: "Mission Bay commercial real estate", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", summary: "Understand Mission Bay's planned, institutional, waterfront, medical, event, and innovation context before choosing a building." },
      { title: "San Francisco commercial real estate", url: "/commercial-real-estate/CA/san-francisco/", summary: "Compare Mission Bay with nearby waterfront, downtown, SoMa, and industrial-edge alternatives." },
      { title: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", summary: "Clarify whether district identity, access, customers, employees, or operations should lead the location decision." },
    ],
  }),
  [buildingPath("555 Mission Rock St")]: buildingBrief({
    buildingSummary:
      "555 Mission Rock St is a Mission Rock mixed-use commercial example for teams evaluating Mission Bay's newest waterfront and event-adjacent development pattern. It helps tenants compare the district's newer office, retail, residential, institutional, and arena-area context with more conventional San Francisco office districts.",
    buildingImportance:
      "555 Mission Rock St matters because it shows Mission Bay's growth pattern beyond the core life-science cluster. It should be used as a mixed-use and neighborhood-context reference: helpful for understanding Mission Rock, waterfront circulation, Chase Center adjacency, and new-development tradeoffs, but not a substitute for verifying specific building or suite capabilities.",
    quickFacts: [
      { label: "Primary use", value: "Office / mixed-use commercial context" },
      { label: "Building type", value: "Mission Rock mixed-use commercial building" },
      { label: "Commercial role", value: "Mission Bay mixed-use and event-area benchmark" },
      { label: "District", value: "Mission Bay" },
      { label: "Secondary context", value: "Mission Rock, waterfront, ballpark edge, and Chase Center area" },
      { label: "Floorplate character", value: "New-development context; exact office layout, delivery condition, and infrastructure should be validated" },
      { label: "Transit context", value: "Mission Bay access should be tested across light rail, Caltrain, driving, biking, rideshare, and event-day conditions" },
    ],
    idealFor: [
      "Modern office, technology, health-adjacent, innovation, and growth-stage teams that value newer Mission Bay context.",
      "Companies comparing Mission Rock with core Mission Bay, South Beach, SoMa, Dogpatch, and the Financial District.",
      "Users whose location story benefits from waterfront, event-area, residential, retail, and institutional adjacency.",
      "Teams prepared to validate new-development timing, suite delivery, buildout scope, access, and operating fit before shortlisting.",
    ],
    mayNotFit: [
      "Companies that need a traditional CBD address, dense professional-service environment, or broad downtown familiarity.",
      "Users seeking a verified lab, medical, production, or technical-use environment without direct property diligence.",
      "Teams that prefer historic buildings, adaptive reuse, or established street texture over newer mixed-use development.",
      "Businesses sensitive to arena, ballpark, event, traffic, parking, or visitor-arrival variability.",
    ],
    buildingExperience:
      "The experience is newer, waterfront-oriented, and tied to Mission Rock's mixed-use growth. It can help companies signal innovation and Mission Bay adjacency, but the business case depends on the specific suite, delivery condition, access pattern, event-area circulation, and whether a new-development district supports the team's day-to-day needs.",
    districtContext:
      "555 Mission Rock St sits in the Mission Bay and Mission Rock context near Chase Center, the waterfront, ballpark-edge movement, residential growth, and newer commercial development. It is a strong comparison for Mission Bay's mixed-use future, while 1800 Owens, 1700 Owens, 500 Terry Francois, and 54 Jeff Adachi clarify different office, life-science, waterfront, and block-scale choices inside the district.",
    advantages: [
      "Explains Mission Bay's Mission Rock and mixed-use development pattern.",
      "Useful for teams that want a newer waterfront and innovation-district identity.",
      "Adds event-area and neighborhood-amenity context to the Building Profile portfolio.",
      "Helps compare Mission Bay with South Beach, SoMa, Dogpatch, and downtown options.",
    ],
    tradeoffs: [
      "New-development identity may be less familiar to clients and employees than established downtown districts.",
      "Event and ballpark-area circulation can affect commute, visitor, and parking patterns.",
      "Specific office condition, tenant-improvement needs, infrastructure, and timing must be validated.",
      "Mixed-use context should not be treated as proof of life-science or technical suitability.",
    ],
    validationNotes: [
      "Does the Mission Rock setting improve recruiting, partner access, client perception, or daily employee experience?",
      "How do Chase Center, ballpark, waterfront, and event-area circulation patterns affect the workday?",
      "Is the available suite delivered and configured for the team's timing, layout, buildout, and infrastructure needs?",
      "Would 54 Jeff Adachi, 500 Terry Francois, 1800 Owens, or 1455 3rd provide a clearer Mission Bay comparison?",
      "Would South Beach, SoMa, or the Financial District better match the company's visitor, commute, or client-facing needs?",
    ],
    nearbyAlternatives: [
      { label: "54 Jeff Adachi Way", url: "/commercial-real-estate/building/CA/san-francisco/54-jeff-adachi-way/", reason: "A direct comparison for Mission Bay mixed-use edge context with a different block-scale feel." },
      { label: "Chase Center", url: "/commercial-real-estate/building/CA/san-francisco/1-warriors-way/", reason: "Relevant when event-area activity, visitor demand, and amenity context shape the location choice." },
      { label: "500 Terry Francois", url: "/commercial-real-estate/building/CA/san-francisco/500-terry-francois-blvd/", reason: "Compare when waterfront-adjacent office context matters more than Mission Rock mixed-use identity." },
      { label: "The Exchange", url: "/commercial-real-estate/building/CA/san-francisco/1800-owens-st/", reason: "A stronger Mission Bay office benchmark near the district's institutional and innovation core." },
      { label: "Uber Mission Bay", url: "/commercial-real-estate/building/CA/san-francisco/1455-3rd-st/", reason: "Compare when headquarters scale and campus-style office identity matter more than mixed-use edge context." },
    ],
    representativeCompanies: [
      "Modern office, technology, health-adjacent, innovation, consumer, professional-service, and growth-stage teams are the most relevant categories.",
      "Named tenants, delivery timing, availability, and specialized infrastructure should be verified from current sources.",
    ],
    relatedInsights: [
      { title: "Mission Bay commercial real estate", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", summary: "Understand Mission Bay's planned, innovation, life-science, medical, waterfront, and event-area roles before narrowing the building list." },
      { title: "SoMa commercial real estate", url: "/commercial-real-estate/CA/san-francisco/soma/", summary: "Compare Mission Rock and Mission Bay with older SoMa office geography when the search may need more central access." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Compare location fit, buildout, access, infrastructure, and flexibility before treating newer buildings as interchangeable." },
    ],
  }),
  [buildingPath("1105 Battery St")]: buildingBrief({
    buildingSummary:
      "Levi's Plaza is a lower-rise Jackson Square office campus for companies that want character, a calmer northern downtown setting, and a less formal alternative to Financial District towers. It helps teams evaluate whether a human-scale workplace can support culture and client perception better than a conventional high-rise address.",
    buildingImportance:
      "Levi's Plaza matters because it gives San Francisco a different downtown office reference point. It belongs in the representative collection as a campus-style alternative for companies that want north waterfront character, Jackson Square adjacency, and a quieter workday without fully leaving the professional-service orbit of downtown.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Lower-rise campus-style office" },
      { label: "Commercial role", value: "Lower-rise office campus" },
      { label: "District", value: "Jackson Square" },
      { label: "Floorplate character", value: "Campus-style office environment; specific suite scale and layout should be validated" },
      { label: "Transit context", value: "Reasonable downtown access but generally less direct than core Financial District transit" },
      { label: "Parking context", value: "Parking and visitor arrival should be validated because the location is outside the core tower grid" },
    ],
    idealFor: [
      "Creative, consumer, design, media, and established teams that value a distinctive lower-rise environment.",
      "Boutique professional firms that want downtown adjacency without a conventional tower setting.",
      "Companies comparing Jackson Square, the north waterfront, and Financial District edge alternatives.",
      "Teams whose culture benefits from a calmer campus-style setting more than a vertical tower workplace.",
    ],
    mayNotFit: [
      "Businesses that need the clearest Financial District address signal or direct BART-oriented commute.",
      "Large users that require deep tower services, very large floorplate consistency, or multiple expansion paths.",
      "Teams that want the energy and density of central SoMa or Transbay.",
      "Companies that depend on heavy visitor throughput, formal meeting infrastructure, or the easiest regional transit story.",
    ],
    buildingExperience:
      "The experience is calmer, lower-rise, and more campus-like than most downtown San Francisco office options. It is better understood as a place-based workplace decision than a pure address decision. That can support culture, focus, and identity, but it should be tested against commute patterns, client access, and future growth needs.",
    districtContext:
      "Levi's Plaza sits at the Jackson Square and north waterfront edge, close enough to downtown to remain connected to professional services but distinct from the Market Street tower core. It relates naturally to Jackson Square, the Embarcadero, and the northern edge of the Financial District. Compare Financial District towers when transit and client address matter more, and South Beach when a waterfront-adjacent but more central mixed-use setting is useful.",
    advantages: [
      "Distinct lower-rise campus environment near the northern downtown edge.",
      "Less formal and more human-scale than traditional Financial District towers.",
      "Strong fit for teams using workplace character as part of culture and recruiting.",
      "Useful reference point for Jackson Square and north waterfront office decisions.",
      "Can offer a calmer daily rhythm than central SoMa, Transbay, or the tower core.",
    ],
    tradeoffs: [
      "Less direct rapid-transit access than core Financial District or Transbay buildings.",
      "May not carry the same traditional headquarters signal as major downtown towers.",
      "Large-user expansion, building services, and floorplate consistency should be validated.",
      "The quieter setting may not suit teams seeking dense street activity or central SoMa energy.",
      "Visitor parking, client arrival, and after-hours access deserve early diligence.",
    ],
    validationNotes: [
      "Does the lower-rise campus feel strengthen the company's culture, recruiting, and client impression?",
      "Are commute patterns acceptable compared with Financial District or Transbay alternatives?",
      "Can the available suite support current needs and plausible growth without losing the benefit of the setting?",
      "Are visitor arrival, parking, bike access, and after-hours security practical for the team's actual schedule?",
      "Would One Maritime Plaza, Transamerica Pyramid, 1000 Sansome, or a Financial District tower provide a stronger tradeoff?",
    ],
    nearbyAlternatives: [
      { label: "Transamerica Pyramid Center", url: "/commercial-real-estate/building/CA/san-francisco/600-montgomery-st/", reason: "A stronger fit when the company wants a recognizable north-downtown tower instead of a campus-style environment." },
      { label: "300 Clay", url: "/commercial-real-estate/building/CA/san-francisco/300-clay-st/", reason: "Useful when a Jackson Square or north Financial District edge location matters but the tenant wants a different building format." },
      { label: "1000 Sansome", url: "/commercial-real-estate/building/CA/san-francisco/1000-sansome-st/", reason: "Compare when the search favors historic north waterfront character over a more defined campus setting." },
      { label: "901 Battery", url: "/commercial-real-estate/building/CA/san-francisco/901-battery-st/", reason: "A relevant nearby option when Jackson Square adjacency and lower-rise character are important." },
      { label: "555 California", url: "/commercial-real-estate/building/CA/san-francisco/555-california-st/", reason: "Compare when the business may need a more formal Financial District tower signal." },
    ],
    representativeCompanies: [
      "Creative, consumer, design, media, boutique professional-service, and executive-office teams are the most relevant company categories.",
      "Named tenant details should be verified from current building materials because tenant rosters change.",
    ],
    relatedInsights: [
      { title: "Jackson Square commercial real estate", url: "/commercial-real-estate/CA/san-francisco/jackson-square/", summary: "Use the district guide to understand the appeal and limits of San Francisco's character-driven north downtown office market." },
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Compare the north waterfront and Jackson Square edge with traditional downtown tower options." },
      { title: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", summary: "Clarify whether workplace character, commute access, client perception, or expansion flexibility should drive the choice." },
    ],
  }),
  [buildingPath("1100 Grant Ave")]: buildingBrief({
    buildingSummary:
      "1100 Grant Ave is a Jackson Square and North Beach edge office example for smaller teams that want downtown adjacency with more neighborhood character than a conventional tower. It helps tenants test whether client access and a boutique setting can coexist in the same search.",
    buildingImportance:
      "1100 Grant Ave matters because it shows Jackson Square as edge geography rather than a single building format. The building is most useful as a decision reference for teams comparing historic character, client arrival, and neighborhood feel against the stronger transit concentration of the Financial District.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Historic downtown-edge office building" },
      { label: "Commercial role", value: "Jackson Square / North Beach edge reference" },
      { label: "District", value: "Jackson Square" },
      { label: "Secondary context", value: "North Beach edge" },
      { label: "Floorplate character", value: "Smaller-format office context; suite layout and systems should be validated" },
      { label: "Transit context", value: "Downtown-adjacent access, but less direct than the Market Street and Montgomery corridor tower core" },
    ],
    idealFor: [
      "Boutique professional-service, creative, advisory, design, and relationship-driven teams that value neighborhood character.",
      "Small firms comparing Jackson Square, North Beach edge, and Financial District access before touring.",
      "Client-facing users that want a quieter historic setting without leaving downtown entirely.",
      "Teams whose office decision depends on character, arrival experience, and fit more than tower image.",
    ],
    mayNotFit: [
      "Companies that need a formal Financial District address signal or the strongest BART-oriented commute.",
      "Larger users seeking broad modern floorplates, extensive amenities, or deep expansion options.",
      "Teams that require specialized lab, production, showroom, or heavy operational functionality.",
      "Businesses where easy parking, loading, or visitor volume matters more than district character.",
    ],
    buildingExperience:
      "The experience should be evaluated as a boutique edge-location decision. It can support firms that want a more personal and character-driven office, but tenants should validate whether the block, suite condition, access, and building systems match the practical needs of the business.",
    districtContext:
      "1100 Grant Ave sits near the Jackson Square and North Beach transition. That makes it useful for comparing edge geography: more character and neighborhood texture than the Financial District core, but less direct transit concentration and less formal office identity than Montgomery Street or Market Street towers.",
    advantages: [
      "Shows the smaller, character-oriented edge of Jackson Square office demand.",
      "Useful for boutique teams that still need downtown client access.",
      "Helps compare North Beach edge character with core Jackson Square and Financial District options.",
      "Can support firms that value identity and daily setting more than tower services.",
    ],
    tradeoffs: [
      "Less direct transit access than central Financial District or Transbay alternatives.",
      "May not feel as clearly Jackson Square as Sansome or Battery Street examples.",
      "Building systems, suite condition, and after-hours access need validation.",
      "May not work for larger teams or users needing more conventional office infrastructure.",
    ],
    validationNotes: [
      "Does the edge location feel connected enough to the business core for clients and employees?",
      "Does the available suite support the team's meetings, privacy, and growth needs?",
      "Are building systems, elevator access, security, and after-hours use practical for the intended workday?",
      "Would 75 Broadway, 930 Montgomery, or 1000 Sansome provide a clearer Jackson Square identity?",
      "Would a Financial District tower solve the same client-access need with fewer commute tradeoffs?",
    ],
    nearbyAlternatives: [
      { label: "75 Broadway", url: "/commercial-real-estate/building/CA/san-francisco/75-broadway/", reason: "A stronger comparison when the tenant wants smaller Jackson Square office stock closer to Broadway." },
      { label: "930 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/930-montgomery-st/", reason: "Useful when boutique professional-service character should stay closer to the district's core office fabric." },
      { label: "1000 Sansome", url: "/commercial-real-estate/building/CA/san-francisco/1000-sansome-st/", reason: "Compare when historic north waterfront office character matters more than North Beach edge context." },
      { label: "Levi's Plaza", url: "/commercial-real-estate/building/CA/san-francisco/1105-battery-st/", reason: "A better fit when a lower-rise campus environment is more important than small-building character." },
      { label: "Transamerica Pyramid Center", url: "/commercial-real-estate/building/CA/san-francisco/600-montgomery-st/", reason: "Compare when north-downtown identity should come with a more recognizable tower setting." },
    ],
    representativeCompanies: [
      "Boutique professional-service, advisory, design, creative, executive-office, and relationship-driven teams are the clearest fit categories.",
      "Named tenant and availability claims should be verified separately before publication or reliance.",
    ],
    relatedInsights: [
      { title: "Jackson Square commercial real estate", url: "/commercial-real-estate/CA/san-francisco/jackson-square/", summary: "Understand how Jackson Square blends historic office character, downtown adjacency, and north waterfront tradeoffs." },
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Compare Jackson Square edge buildings with the stronger transit and tower identity of the downtown core." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Validate layout, access, cost, building condition, and flexibility before shortlisting smaller downtown buildings." },
    ],
  }),
  [buildingPath("27 Drumm St")]: buildingBrief({
    buildingSummary:
      "27 Drumm St is a compact downtown-edge office example for teams comparing Jackson Square, the Embarcadero, and the Financial District. It helps clarify whether the business needs formal CBD positioning or can use a smaller edge setting with nearby waterfront and downtown access.",
    buildingImportance:
      "27 Drumm St matters because it makes a common tenant dilemma concrete: some searches begin as Jackson Square searches but are really about the downtown-waterfront edge. The building should be used to test district identity, client arrival, transit access, and whether smaller-format space can meet the same need as a more formal downtown office.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Small-format downtown-edge office building" },
      { label: "Commercial role", value: "Jackson Square / Embarcadero edge reference" },
      { label: "District", value: "Jackson Square" },
      { label: "Secondary context", value: "Embarcadero and Financial District edge" },
      { label: "Floorplate character", value: "Smaller office context; exact suite layout and building systems should be validated" },
      { label: "Transit context", value: "Downtown-adjacent access with different commute and visitor patterns than the Market Street core" },
    ],
    idealFor: [
      "Small professional-service, advisory, consulting, finance, and client-facing teams comparing downtown edge options.",
      "Businesses that want access to Jackson Square and the Embarcadero without committing to a major tower.",
      "Teams whose location choice depends on client arrival, address perception, and suite practicality.",
      "Users testing whether a smaller downtown-edge building can substitute for a formal CBD option.",
    ],
    mayNotFit: [
      "Companies that need the clearest Financial District or Jackson Square identity.",
      "Larger users requiring broad modern floorplates, extensive services, or expansion capacity.",
      "Creative teams that want stronger historic texture than the downtown-waterfront edge provides.",
      "Businesses that need easy parking, loading, or highly controlled visitor logistics.",
    ],
    buildingExperience:
      "The experience is practical and edge-oriented. It should be validated around the specific suite, the block-level arrival experience, and how clients and employees read the location. The value is not broad trophy identity; it is whether this compact downtown edge solves the team's access and setting needs.",
    districtContext:
      "27 Drumm St sits in the transition between Jackson Square, the Embarcadero, and the Financial District. That makes it useful for comparing district boundaries, not for defining core Jackson Square. It should be pressure-tested against 33 Drumm, 930 Montgomery, and Montgomery Street office alternatives.",
    advantages: [
      "Adds a compact downtown-edge reference to the Jackson Square Building Profile set.",
      "Useful for teams comparing client access across Jackson Square, Embarcadero, and Financial District options.",
      "Can help avoid overcommitting to tower scale when smaller downtown access is enough.",
      "Supports practical evaluation of district identity before touring spaces.",
    ],
    tradeoffs: [
      "The address may feel less distinct than core Jackson Square or core Financial District alternatives.",
      "May not provide the same historic texture as Sansome, Battery, or Broadway examples.",
      "Suite condition, access, and building systems require careful diligence.",
      "Large users or teams needing high-amenity infrastructure may outgrow the format quickly.",
    ],
    validationNotes: [
      "Does the address read as Jackson Square, Embarcadero, or Financial District to clients and employees?",
      "Does the available suite support the team's meeting, privacy, and growth requirements?",
      "How do arrival, parking, transit, and after-hours access compare with Montgomery Street alternatives?",
      "Would 33 Drumm, 930 Montgomery, or 315 Montgomery provide a clearer district tradeoff?",
      "Is smaller-format downtown-edge space enough, or does the business need a stronger building signal?",
    ],
    nearbyAlternatives: [
      { label: "33 Drumm St", url: "/commercial-real-estate/building/CA/san-francisco/33-drumm-st/", reason: "A direct comparison for another compact Drumm Street option with similar edge-condition questions." },
      { label: "930 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/930-montgomery-st/", reason: "Useful when the tenant wants boutique professional-service character closer to Jackson Square's core." },
      { label: "315 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/315-montgomery-st/", reason: "A better comparison when the search needs a clearer Financial District office-spine setting." },
      { label: "Levi's Plaza", url: "/commercial-real-estate/building/CA/san-francisco/1105-battery-st/", reason: "Compare when north waterfront character and a calmer campus environment matter more than compact edge access." },
      { label: "1000 Sansome", url: "/commercial-real-estate/building/CA/san-francisco/1000-sansome-st/", reason: "A stronger fit when historic Jackson Square character should lead the decision." },
    ],
    representativeCompanies: [
      "Small professional-service, advisory, finance, consulting, and relationship-driven office users are most relevant.",
      "Specific tenant and availability details should be verified from current building sources.",
    ],
    relatedInsights: [
      { title: "Jackson Square commercial real estate", url: "/commercial-real-estate/CA/san-francisco/jackson-square/", summary: "Compare district character, downtown access, and north waterfront tradeoffs before choosing an edge building." },
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Use the downtown core guide to test whether the search needs stronger formal office positioning." },
      { title: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", summary: "Use client access, commute, culture, and operating needs to choose between adjacent districts." },
    ],
  }),
  [buildingPath("33 Drumm St")]: buildingBrief({
    buildingSummary:
      "33 Drumm St is a downtown-waterfront edge office example for teams pressure-testing whether their search belongs in Jackson Square, the Embarcadero, or the Financial District. It is most useful as a comparison point for smaller client-facing users evaluating address perception and practical access.",
    buildingImportance:
      "33 Drumm St matters because it exposes the tradeoff between district character and office-core certainty. The building helps Rofo explain that some Jackson Square-adjacent decisions are really about whether a tenant values smaller edge geography more than a clearly defined historic district or formal downtown tower address.",
    quickFacts: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Small-format downtown-edge office building" },
      { label: "Commercial role", value: "Downtown-waterfront edge reference" },
      { label: "District", value: "Jackson Square" },
      { label: "Secondary context", value: "Embarcadero and Financial District edge" },
      { label: "Floorplate character", value: "Smaller office context; suite condition and layout should be validated" },
      { label: "Transit context", value: "Downtown-adjacent access with block-level differences from central Financial District transit" },
    ],
    idealFor: [
      "Small and mid-size professional-service, advisory, finance, and consulting teams comparing downtown edge alternatives.",
      "Client-facing users that need downtown access but do not require a major tower identity.",
      "Companies testing whether an Embarcadero-edge setting can satisfy a Jackson Square or Financial District search.",
      "Teams that care about suite practicality, arrival experience, and district perception more than amenities.",
    ],
    mayNotFit: [
      "Companies that need a definitive Jackson Square historic-office story.",
      "Users requiring formal Financial District positioning, large modern floorplates, or extensive amenities.",
      "Businesses with specialized operational, lab, showroom, or heavy visitor-volume requirements.",
      "Teams where parking, loading, or highly predictable visitor access outweighs downtown-edge convenience.",
    ],
    buildingExperience:
      "The experience should be judged through the lens of edge-condition fit. It may work well when the company benefits from downtown proximity and smaller-suite practicality, but the team should validate whether the immediate setting feels clear enough for clients, employees, and recruiting.",
    districtContext:
      "33 Drumm St sits near the same transition zone as 27 Drumm, where Jackson Square, Embarcadero, and Financial District considerations overlap. It is useful for comparing adjacent district identities, not for replacing stronger core examples such as Levi's Plaza, 1000 Sansome, or 930 Montgomery.",
    advantages: [
      "Clarifies the downtown-waterfront edge of the Jackson Square decision.",
      "Useful for client-facing teams that want smaller-format office access near downtown.",
      "Supports comparison between address perception, commute access, and district character.",
      "Can help tenants decide whether they need a tower, a historic district building, or an edge alternative.",
    ],
    tradeoffs: [
      "May not provide the same clear district signal as core Jackson Square examples.",
      "May not provide the same office-core certainty as Montgomery Street or Market Street buildings.",
      "Suite condition, building services, and after-hours access should be validated early.",
      "The compact format may not support larger growth plans or more complex workplace programs.",
    ],
    validationNotes: [
      "Does the location feel like the right district to clients, employees, and candidates?",
      "Does the building format support the team's layout, meeting, privacy, and growth needs?",
      "Would 27 Drumm, 930 Montgomery, or 315 Montgomery provide a sharper comparison point?",
      "Are transit, rideshare, visitor arrival, parking, and after-hours patterns practical?",
      "Is the edge setting a real advantage, or would a core Jackson Square or Financial District building be clearer?",
    ],
    nearbyAlternatives: [
      { label: "27 Drumm St", url: "/commercial-real-estate/building/CA/san-francisco/27-drumm-st/", reason: "A direct comparison for another compact downtown-waterfront edge option." },
      { label: "930 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/930-montgomery-st/", reason: "Useful when the tenant wants stronger boutique professional-service character near core Jackson Square." },
      { label: "315 Montgomery", url: "/commercial-real-estate/building/CA/san-francisco/315-montgomery-st/", reason: "Compare when the search may actually need a conventional Financial District office spine." },
      { label: "1000 Sansome", url: "/commercial-real-estate/building/CA/san-francisco/1000-sansome-st/", reason: "A stronger fit when historic north waterfront character should lead the choice." },
      { label: "Levi's Plaza", url: "/commercial-real-estate/building/CA/san-francisco/1105-battery-st/", reason: "Compare when the user wants a more defined north waterfront workplace setting." },
    ],
    representativeCompanies: [
      "Small and mid-size professional-service, advisory, finance, consulting, and relationship-driven office users are most relevant.",
      "Tenant, availability, and suite-specific claims should be verified from current sources before reliance.",
    ],
    relatedInsights: [
      { title: "Jackson Square commercial real estate", url: "/commercial-real-estate/CA/san-francisco/jackson-square/", summary: "Understand the district's historic-office and north waterfront context before choosing an edge building." },
      { title: "Financial District commercial real estate", url: "/commercial-real-estate/CA/san-francisco/financial-district/", summary: "Compare edge-office ambiguity with the clearer client-service environment of the downtown core." },
      { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Evaluate layout, condition, access, cost, and flexibility before treating similar downtown spaces as equal." },
    ],
  }),
};

function topicForBuilding(item) {
  const themes = item.editorial.representativeThemes.join(" ").toLowerCase();
  if (themes.includes("adaptive") || themes.includes("historic") || themes.includes("production")) {
    return handbookTopics;
  }

  return handbookTopics.slice(0, 2);
}

function districtAlternativeLinks(item) {
  return item.relationships.relatedDistricts.map((url) => {
    const district = Object.values(districts).find((candidate) => candidate.path === url);
    return {
      label: district ? district.name : "Nearby district",
      url,
    };
  });
}

function comparisonCards(item) {
  return item.relationships.comparisonBuildings.map((path) => {
    const related = canonicalBuildings.find((candidate) => candidate.building_path === path);

    return {
      building_path: path,
      path,
      display_name: related?.identity?.name || "",
      address: related?.identity?.address || "",
    };
  });
}

function toRuntimeBuilding(item) {
  const { identity, editorial, business, experience, operations, tradeoffs, validation, quality } = item;
  const canonicalDistrict = identity.canonicalDistrict;
  const isDistrictAnchor = identity.assetClass === "District Anchor";
  const city = identity.city || CITY;
  const state = identity.state_abbr || STATE;
  const citySlug = slugify(city);
  const description = `${identity.name} is a ${editorial.editorialRole.toLowerCase()} in ${canonicalDistrict.name}. ${editorial.editorialReason}`;
  const buildingBrief = item.buildingBrief || buildingBriefsByPath[item.building_path] || null;
  const ecosystemContext = buildingBrief && buildingBrief.ecosystemContext;

  return {
    name: identity.name,
    display_name: identity.name,
    address: identity.address,
    city,
    state_abbr: state,
    city_slug: citySlug,
    building_slug: slugify(identity.address),
    building_path: item.building_path,
    semantic_source_building_id: item.semanticSourceBuildingId || "",
    type: identity.buildingType,
    primary_space_type: identity.primarySpaceType,
    space_type: identity.buildingType,
    raw_space_types: [identity.primarySpaceType],
    editorial_representative: true,
    has_availability: false,
    source: "commercial-building-intelligence-v1",
    commercial_asset_class: identity.assetClass,
    editorial_role: editorial.editorialRole,
    editorial_reason: editorial.editorialReason,
    representative_themes: editorial.representativeThemes,
    commercial_building_intelligence: item,
    source_confidence: quality.sourceConfidence,
    publication_status: quality.publicationStatus,
    meta_title: `${identity.name} | Building Profile in ${city}`,
    meta_description:
      `Learn why businesses compare ${identity.name} in ${canonicalDistrict.name}, what it helps explain, and what to validate before adding similar buildings to a shortlist.`,
    teaser: description,
    building_description: description,
    about_context:
      `${identity.name} is included in Rofo's Commercial Building Intelligence because it helps explain ${canonicalDistrict.name}. It is a representative example, not an availability claim.`,
    location_context:
      `${identity.name} sits in ${canonicalDistrict.name}, one of the ${city} commercial areas businesses compare when deciding where to begin a search.`,
    common_fit: business.businessFit.join(", "),
    detail_summary: `${editorial.editorialRole} in ${canonicalDistrict.name}`,
    best_for: business.idealCompanyProfiles,
    less_suitable_for: districtDefaults[Object.keys(districts).find((key) => districts[key].path === canonicalDistrict.path)]?.lessSuitableFor || [],
    shortlist_reason: editorial.editorialReason,
    typical_tenant_profile: business.businessFit.join(", "),
    building_character: experience.workplaceCharacter,
    strengths: tradeoffs.strengths,
    tradeoffs: tradeoffs.limitations,
    nearby_amenities: operations.amenities,
    access_context: `${operations.transit} ${operations.parking}`,
    district_relationship:
      `${identity.name} helps explain ${canonicalDistrict.name} because ${editorial.editorialReason} ${isDistrictAnchor ? "It is treated as a district anchor rather than conventional available office inventory." : "Use it as a reference point for the types of buildings businesses may compare in this district."}`,
    shortlist_reasons: [
      editorial.editorialReason,
      experience.workplaceCharacter,
      operations.transit,
    ],
    validation_questions: validation.questionsToValidate,
    tour_observations: validation.tourObservations,
    related_handbook_topics: topicForBuilding(item),
    nearby_alternatives: districtAlternativeLinks(item),
    comparison_buildings: item.relationships.comparisonBuildings,
    nearby_buildings: item.relationships.nearbyBuildings,
    related_buildings: comparisonCards(item),
    related_districts: item.relationships.relatedDistricts,
    building_brief: buildingBrief,
    commercialEcosystem: ecosystemContext && ecosystemContext.primaryEcosystem ? {
      primary: ecosystemContext.primaryEcosystem,
      subtypes: ecosystemContext.ecosystemSubtypes || [],
    } : null,
    commercial_area: {
      ...canonicalDistrict,
      confidence: "commercial-building-intelligence",
    },
  };
}

function groupByDistrict(items) {
  return items.reduce((acc, item) => {
    const path = item.identity.canonicalDistrict.path;
    if (!acc[path]) acc[path] = [];
    acc[path].push(item);
    return acc;
  }, {});
}

function buildRoleDescriptors(items) {
  return items.reduce((acc, item) => {
    const path = item.identity.canonicalDistrict.path;
    if (!acc[path]) acc[path] = {};
    acc[path][item.building_path] = item.editorial.editorialRole;
    return acc;
  }, {});
}

function buildRelationshipGraph(items) {
  return items.reduce((acc, item) => {
    acc[item.building_path] = {
      nearbyBuildings: item.relationships.nearbyBuildings,
      comparisonBuildings: item.relationships.comparisonBuildings,
      nearbyAlternatives: item.tradeoffs.nearbyAlternatives,
      relatedDistricts: item.relationships.relatedDistricts,
      editorialRole: item.editorial.editorialRole,
      representativeThemes: item.editorial.representativeThemes,
    };
    return acc;
  }, {});
}

function assertUniqueIds(items) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) {
      throw new Error(`Duplicate Commercial Building Intelligence id: ${item.id}`);
    }
    seen.add(item.id);
  }
}

assertUniqueIds(canonicalBuildings);

const runtimeBuildings = canonicalBuildings
  .filter((item) => item.quality.publicationStatus === "published")
  .map(toRuntimeBuilding);

const byPath = Object.fromEntries(canonicalBuildings.map((item) => [item.building_path, item]));
const byDistrictPath = groupByDistrict(canonicalBuildings);
const roleDescriptorsByDistrictPath = buildRoleDescriptors(canonicalBuildings);
const relationshipGraph = buildRelationshipGraph(canonicalBuildings);

module.exports = {
  schema: {
    version: "commercial-building-intelligence-v1",
    identity: ["name", "address", "district", "canonicalDistrict", "secondaryDistricts", "buildingType", "assetClass"],
    editorial: ["editorialRole", "editorialReason", "representativeThemes"],
    business: ["businessFit", "idealCompanyProfiles", "companySizes"],
    experience: ["workplaceCharacter", "neighborhoodCharacter", "executivePresence", "innovationScore"],
    operations: ["transit", "parking", "amenities", "foodEnvironment"],
    tradeoffs: ["strengths", "limitations", "businessesThatShouldCompare", "nearbyAlternatives"],
    validation: ["questionsToValidate", "tourObservations"],
    relationships: ["nearbyBuildings", "comparisonBuildings", "relatedDistricts"],
    quality: ["sourceConfidence", "publicationStatus", "sourceBasis"],
  },
  districts,
  canonicalBuildings,
  runtimeBuildings,
  byPath,
  byDistrictPath,
  roleDescriptorsByDistrictPath,
  relationshipGraph,
  stats: {
    canonicalBuildingCount: canonicalBuildings.length,
    runtimeBuildingCount: runtimeBuildings.length,
    districtCount: Object.keys(byDistrictPath).length,
    districtAnchorCount: canonicalBuildings.filter((item) => item.identity.assetClass === "District Anchor").length,
  },
};
