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
    url: "/commercial-leasing-guide/choosing-the-right-commercial-location/",
    summary: "Use location fit, access, customers, employees, and operations before narrowing the building list.",
  },
  {
    title: "How to Compare Commercial Spaces",
    url: "/commercial-leasing-guide/how-to-compare-commercial-spaces/",
    summary: "Compare buildings by business fit, total occupancy cost, operations, buildout, and future flexibility.",
  },
  {
    title: "Tenant Improvements",
    url: "/commercial-leasing-guide/tenant-improvements/",
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
  comparisonAddresses = [],
  nearbyAddresses = [],
}) {
  const canonicalDistrict = getDistrict(districtKey);
  const defaults = getDefaults(districtKey);
  const secondaryDistricts = secondaryDistrictKeys.map(getDistrict);
  const path = buildingPath(address);

  const intelligence = {
    id: `${CITY_SLUG}-${slugify(address)}`,
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

  return intelligence;
}

const canonicalBuildings = [
  canonicalBuilding({ name: "555 California", address: "555 California St", districtKey: "financialDistrict", role: "Corporate Benchmark", themes: ["Corporate Headquarters", "Financial Services", "Tower", "Executive Presence", "Modern Class A"], reason: "Represents the traditional high-rise corporate and financial-services center of San Francisco.", comparisonAddresses: ["101 California St", "345 California St", "1 Bush St", "1 Sansome St"] }),
  canonicalBuilding({ name: "101 California", address: "101 California St", districtKey: "financialDistrict", role: "Corporate Benchmark", themes: ["Transit Oriented", "Modern Class A", "Professional Services", "Tower", "High Amenity"], reason: "Shows the appeal of a central, transit-oriented downtown tower with broad professional-service utility.", comparisonAddresses: ["555 California St", "50 California St", "100 Pine St"] }),
  canonicalBuilding({ name: "345 California Center", address: "345 California St", districtKey: "financialDistrict", role: "Executive Benchmark", themes: ["Modern Class A", "Tower", "Executive Presence", "Professional Services"], reason: "Useful for understanding premium Financial District space with a more boutique feel than the largest towers.", comparisonAddresses: ["555 California St", "101 California St", "600 Montgomery St"] }),
  canonicalBuilding({ name: "One Bush Plaza / Crown Zellerbach Building", address: "1 Bush St", districtKey: "financialDistrict", role: "Historic Benchmark", themes: ["Historic", "Modernist", "Professional Services", "Architectural Identity"], reason: "Essential architectural and market reference for San Francisco's older modernist downtown office stock.", comparisonAddresses: ["555 California St", "1 Sansome St", "44 Montgomery St"] }),
  canonicalBuilding({ name: "Transamerica Pyramid Center", address: "600 Montgomery St", districtKey: "financialDistrict", role: "District Icon", themes: ["Iconic", "Historic", "Tower", "High Amenity", "Executive Presence"], reason: "The clearest skyline reference for older downtown San Francisco and repositioned trophy office space.", comparisonAddresses: ["555 California St", "300 Clay St", "1105 Battery St"], secondaryDistrictKeys: ["jacksonSquare"] }),
  canonicalBuilding({ name: "One Sansome", address: "1 Sansome St", districtKey: "financialDistrict", role: "Adaptive Reuse Benchmark", themes: ["Transit Oriented", "Adaptive Reuse", "High Amenity", "Professional Services"], reason: "Shows how a Financial District tower can be repositioned around transit, amenities, and lobby-level activity.", comparisonAddresses: ["1 Bush St", "44 Montgomery St", "101 California St"] }),
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
  canonicalBuilding({ name: "600 Townsend", address: "600 Townsend St", districtKey: "soma", role: "Creative Benchmark", themes: ["Creative Office", "Technology", "Adaptive Reuse", "Caltrain Access"], reason: "Helps explain the Townsend corridor for teams prioritizing Caltrain, creative space, and larger layouts.", comparisonAddresses: ["650 Townsend St", "460 Townsend St", "410 Townsend St"], secondaryDistrictKeys: ["showplaceSquare"] }),
  canonicalBuilding({ name: "414 Brannan", address: "414 Brannan St", districtKey: "soma", role: "Creative Benchmark", themes: ["Creative Office", "Startup", "Adaptive Reuse", "Neighborhood Anchor"], reason: "A lower-scale building that explains SoMa's older brick-and-timber creative-office environment.", comparisonAddresses: ["600 Townsend St", "909 Harrison St", "699 2nd St"] }),
  canonicalBuilding({ name: "909 Harrison", address: "909 Harrison St", districtKey: "soma", role: "Value Benchmark", themes: ["Creative Office", "Startup", "Mid-Market", "Adaptive Reuse"], reason: "Shows the more flexible, less corporate SoMa inventory that can appeal to earlier-stage companies.", comparisonAddresses: ["414 Brannan St", "144 2nd St", "999 Brannan St"] }),

  canonicalBuilding({ name: "Uber Mission Bay", address: "1455 3rd St", districtKey: "missionBay", role: "Innovation Benchmark", themes: ["Corporate Headquarters", "Technology", "Campus Style", "Modern Class A"], reason: "Defines Mission Bay's modern headquarters identity and campus-like office environment.", comparisonAddresses: ["1800 Owens St", "500 Terry Francois Blvd", "415 Mission St"] }),
  canonicalBuilding({ name: "Alexandria Center at Mission Bay - 1700 Owens", address: "1700 Owens St", districtKey: "missionBay", role: "Life Science Benchmark", themes: ["Life Science", "Innovation", "Campus Style", "Research"], reason: "A core life-science reference for the private lab and R&D cluster around UCSF.", comparisonAddresses: ["1500 Owens St", "455 Mission Bay Blvd S", "1800 Owens St"] }),
  canonicalBuilding({ name: "Alexandria Center at Mission Bay - 1500 Owens", address: "1500 Owens St", districtKey: "missionBay", role: "Life Science Benchmark", themes: ["Life Science", "Research", "Innovation", "Campus Style"], reason: "Complements 1700 Owens and helps show Mission Bay as an ecosystem rather than a one-building choice.", comparisonAddresses: ["1700 Owens St", "455 Mission Bay Blvd S", "550 Terry A Francois Blvd"] }),
  canonicalBuilding({ name: "455 Mission Bay Boulevard South", address: "455 Mission Bay Blvd S", districtKey: "missionBay", role: "Life Science Benchmark", themes: ["Life Science", "Research", "Innovation", "Campus Style"], reason: "Important life-science building for understanding UCSF adjacency and research-tenant demand.", comparisonAddresses: ["1700 Owens St", "1500 Owens St", "550 Terry A Francois Blvd"] }),
  canonicalBuilding({ name: "The Exchange", address: "1800 Owens St", districtKey: "missionBay", role: "Innovation Benchmark", themes: ["Modern Class A", "Technology", "Life Science Adjacent", "Large Floorplates"], reason: "A major modern office building that shows Mission Bay's appeal beyond wet lab use.", comparisonAddresses: ["1455 3rd St", "500 Terry Francois Blvd", "550 Terry A Francois Blvd"] }),
  canonicalBuilding({ name: "500 Terry Francois", address: "500 Terry Francois Blvd", districtKey: "missionBay", role: "Waterfront Benchmark", themes: ["Waterfront", "Modern Office", "Technology", "Innovation"], reason: "Explains the bayfront office character of Mission Bay and the appeal of newer buildings outside downtown.", comparisonAddresses: ["550 Terry A Francois Blvd", "1800 Owens St", "185 Berry St"] }),
  canonicalBuilding({ name: "550 Terry Francois", address: "550 Terry A Francois Blvd", districtKey: "missionBay", role: "Life Science Benchmark", themes: ["Life Science", "Office/Lab", "Waterfront", "Modern Class A"], reason: "Represents newer office/lab supply deepening Mission Bay's innovation identity.", comparisonAddresses: ["500 Terry Francois Blvd", "1700 Owens St", "409 Illinois St"] }),
  canonicalBuilding({ name: "UCSF Mission Bay / Genentech Hall", address: "600 16th St", districtKey: "missionBay", role: "District Anchor", themes: ["Research", "Life Science", "Institutional Anchor", "Innovation"], reason: "Essential to understanding why Mission Bay became a life-science district.", assetClass: "District Anchor", buildingType: "District Anchor", comparisonAddresses: ["1700 Owens St", "455 Mission Bay Blvd S", "654 Minnesota St"] }),
  canonicalBuilding({ name: "UCSF Medical Center at Mission Bay", address: "1825 4th St", districtKey: "missionBay", role: "District Anchor", themes: ["Medical", "Institutional Anchor", "Life Science", "Campus Style"], reason: "Explains the health-care and clinical side of Mission Bay's commercial ecosystem.", assetClass: "District Anchor", buildingType: "District Anchor", comparisonAddresses: ["600 16th St", "1700 Owens St"] }),
  canonicalBuilding({ name: "Chase Center", address: "1 Warriors Way", districtKey: "missionBay", role: "Neighborhood Anchor", themes: ["Mixed Use", "Neighborhood Anchor", "Amenity", "Entertainment"], reason: "A major amenity and demand anchor that shapes how companies experience Mission Bay.", assetClass: "District Anchor", buildingType: "District Anchor", comparisonAddresses: ["555 Mission Rock St", "500 Terry Francois Blvd"] }),
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
];

function buildingBrief(fields) {
  return {
    status: "published",
    ...fields,
  };
}

const buildingBriefsByPath = {
  [buildingPath("555 California St")]: buildingBrief({
    status: "canonical-reference",
    summary:
      "A traditional Financial District tower for companies that value downtown client access, executive presence, and the scale of San Francisco's corporate office core.",
    rofoTake:
      "555 California is one of San Francisco's clearest examples of a traditional corporate office tower. It belongs on the shortlist for finance, law, consulting, and executive teams that need client access, institutional scale, and a recognizable downtown setting. The tradeoff is that this type of address usually asks more from the budget and provides less flexibility than SoMa, Jackson Square, or smaller mid-market buildings.",
    snapshot: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Downtown high-rise tower" },
      { label: "Commercial role", value: "Corporate office tower" },
      { label: "District", value: "Financial District" },
      { label: "Floorplate character", value: "Large corporate floorplates; suite fit should be validated by floor" },
      { label: "Transit context", value: "Strong downtown BART, Muni, ferry, and regional transit access depending on commute pattern" },
      { label: "Parking context", value: "Structured downtown parking; cost and visitor convenience should be validated early" },
    ],
    bestFit: [
      "Finance, law, consulting, and professional-service firms that need a client-facing downtown address",
      "Executive teams that value a traditional corporate setting more than creative-office character",
      "Companies comparing large Financial District towers against South Financial District or SoMa alternatives",
    ],
    mayNotFit: [
      "Early-stage teams looking primarily for lower-cost flexible space",
      "Creative, production, lab, or showroom users that need a less conventional building format",
      "Businesses where easy parking, loading, or regional drive access matters more than downtown transit",
    ],
    buildingExperience:
      "The experience is closer to a formal downtown business environment than a neighborhood creative office. Companies should expect a tower setting, professional arrival sequence, and a daily rhythm shaped by the Financial District's concentration of finance, law, consulting, hospitality, and business services.",
    locationContext:
      "555 California sits in the traditional Financial District, where companies choose the area for client access, transit, hotels, restaurants, and proximity to San Francisco's professional-service ecosystem. It should be compared with other downtown towers for image and access, and with Jackson Square or SoMa when a business wants more neighborhood character or a less formal workplace identity.",
    advantages: [
      "Strong fit for client-facing professional-service and financial firms",
      "Recognizable Financial District setting with traditional executive presence",
      "Central downtown access to transit, hotels, restaurants, and business services",
      "Useful reference point when comparing the cost and image of major San Francisco towers",
    ],
    tradeoffs: [
      "Likely less flexible for teams that want creative-office character or lower-cost expansion space",
      "Parking and visitor access can be more difficult than in edge or suburban markets",
      "The surrounding district is more formal and weekday-oriented than SoMa, Mission Bay, or Jackson Square",
      "Specific suite configuration, buildout condition, and expansion options need validation before shortlisting",
    ],
    validationNotes: [
      "Does the available floor or suite support the team's client-facing image without overbuilding the space?",
      "Are employee commute patterns better served by Financial District transit than by Caltrain-oriented SoMa or Mission Bay?",
      "Does the budget support the full occupancy cost of a major downtown tower?",
      "Would a nearby alternative such as 101 California, One Sansome, or Jackson Square solve the same need with a different tradeoff profile?",
    ],
    nearbyDistricts: [
      { label: "Jackson Square", url: "/commercial-real-estate/CA/san-francisco/jackson-square/", reason: "Compare when character, walkability, and boutique executive image matter more than tower scale." },
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/", reason: "Compare when technology identity, larger modern floorplates, or a less traditional office environment may matter more." },
      { label: "South Beach", url: "/commercial-real-estate/CA/san-francisco/south-beach/", reason: "Compare when Embarcadero access, South Financial District buildings, or a mixed-use edge may fit the search." },
    ],
  }),
  [buildingPath("101 California St")]: buildingBrief({
    summary:
      "A central Financial District tower for firms that want a polished client-facing address, strong transit access, and a traditional downtown business environment.",
    rofoTake:
      "101 California is a central Financial District office tower for established firms that need downtown access without choosing the most formal corporate address. It belongs in the same decision set as 555 California, but its strongest role is broad professional-service utility: client meetings, regional recruiting, transit access, and nearby business services. The tradeoff is that it still carries the cost and formality of a central downtown tower.",
    snapshot: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Downtown high-rise tower" },
      { label: "Commercial role", value: "Client-facing downtown office tower" },
      { label: "District", value: "Financial District" },
      { label: "Floorplate character", value: "Traditional tower floorplates; suite layout and division should be validated by floor" },
      { label: "Transit context", value: "Strong central Financial District access to BART, Muni, ferry, and downtown bus routes" },
      { label: "Parking context", value: "Structured downtown parking; employee and visitor cost should be part of diligence" },
    ],
    bestFit: [
      "Professional-service, finance, consulting, and legal teams that regularly host clients downtown",
      "Established firms that want transit access and downtown business services without moving into a newer SoMa headquarters environment",
      "Companies comparing traditional Financial District towers by image, access, and day-to-day convenience",
    ],
    mayNotFit: [
      "Teams seeking a casual, creative, or neighborhood-oriented workplace identity",
      "Companies that need lower-cost growth flexibility or production-adjacent space",
      "Businesses where parking, loading, or regional drive access matters more than central transit",
    ],
    buildingExperience:
      "The experience is polished and downtown-oriented. The building belongs in a professional-service workday: client meetings, transit commutes, nearby restaurants and hotels, and a formal office setting that supports firms whose address still communicates something to clients and recruits.",
    locationContext:
      "101 California sits in the Financial District's central office core. Businesses should compare it with 555 California for corporate scale, 345 California for a more boutique tower feel, and SoMa or South Beach when the search calls for a newer or less traditional workplace identity.",
    advantages: [
      "Strong client-facing downtown setting for professional-service firms",
      "Excellent central Financial District transit access relative to many northern downtown alternatives",
      "Broad business-service environment around the building",
      "Useful comparison point between larger corporate towers and smaller Financial District options",
    ],
    tradeoffs: [
      "Still carries the formality and cost profile of a central downtown tower",
      "May feel less distinctive for companies trying to signal technology, creative, or neighborhood identity",
      "Parking and visitor logistics should be validated early",
      "Suite condition, layout efficiency, and expansion path matter more than the building's general market role",
    ],
    validationNotes: [
      "Does the available suite create the client-facing impression the business needs without overspending on image?",
      "How do employee commute patterns compare with SoMa, South Beach, or Caltrain-oriented alternatives?",
      "Are parking, visitor arrival, and after-hours access workable for the team's actual operating pattern?",
      "Would 555 California, 345 California, or One Sansome solve the same need with a better balance of image, cost, and convenience?",
    ],
    nearbyDistricts: [
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/", reason: "Compare when a technology-oriented or newer office identity may matter more than traditional downtown formality." },
      { label: "South Beach", url: "/commercial-real-estate/CA/san-francisco/south-beach/", reason: "Compare when Embarcadero access, South Financial District buildings, or mixed-use surroundings may fit the search." },
      { label: "Jackson Square", url: "/commercial-real-estate/CA/san-francisco/jackson-square/", reason: "Compare when a smaller, more character-driven executive environment may be stronger." },
    ],
  }),
  [buildingPath("415 Mission St")]: buildingBrief({
    summary:
      "A modern SoMa flagship tower for companies that want a high-visibility headquarters identity, strong regional transit access, and a workplace connected to the Transbay business environment.",
    rofoTake:
      "Salesforce Tower is San Francisco's clearest modern headquarters tower. It is not simply a taller version of a Financial District building; it reflects the post-Transbay shift toward large technology users, brand visibility, and employee-experience decisions. It can be powerful for companies that need scale and public identity, but excessive for teams whose business does not benefit from that level of formality, cost, or visibility.",
    snapshot: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Modern high-rise tower" },
      { label: "Commercial role", value: "Modern headquarters tower" },
      { label: "District", value: "SoMa" },
      { label: "Floorplate character", value: "Large modern tower environment; actual fit depends on available floor and suite configuration" },
      { label: "Transit context", value: "Strong Transbay and downtown transit context with regional access depending on commute pattern" },
      { label: "Parking context", value: "Downtown parking and congestion should be validated for employees, visitors, and events" },
    ],
    bestFit: [
      "Large technology, corporate, and brand-conscious companies that benefit from a flagship San Francisco address",
      "Teams that value modern tower identity and regional transit access more than neighborhood character",
      "Companies comparing Transbay, SoMa, and downtown towers for recruiting, client perception, and headquarters signaling",
    ],
    mayNotFit: [
      "Smaller teams that do not need a flagship environment or the cost structure that may come with it",
      "Companies seeking a quieter, lower-rise, or less formal workplace",
      "Operations that depend on easy parking, loading, or a less congested arrival experience",
    ],
    buildingExperience:
      "The experience is large-scale, modern, and highly visible. Companies should think of it as a headquarters signal as much as a workplace decision. The surrounding Transbay and East Cut environment is more contemporary and vertical than older Financial District blocks or lower-rise creative districts.",
    locationContext:
      "Salesforce Tower sits at the Transbay edge of SoMa, where downtown transit, modern towers, and large-company technology identity overlap. It should be compared with 181 Fremont and 303 Second for modern SoMa scale, with 101 California or 555 California for traditional downtown identity, and with Mission Bay when a company wants newer buildings but a less central tower setting.",
    advantages: [
      "Clear flagship identity for companies that want a visible San Francisco headquarters signal",
      "Strong regional transit orientation around the Transbay and downtown core",
      "Modern SoMa positioning that differs from traditional Financial District office towers",
      "Useful reference point for large-company workplace image and recruiting perception",
    ],
    tradeoffs: [
      "May be excessive for smaller or less image-driven companies",
      "Cost, congestion, and parking should be evaluated carefully",
      "The scale and formality may not fit teams seeking creative-office texture or neighborhood intimacy",
      "Available floors must be validated against team size, department structure, and expansion needs",
    ],
    validationNotes: [
      "Does the company actually benefit from a flagship address, or would a quieter building support the business just as well?",
      "How does the door-to-desk commute work during peak hours for employees from different parts of the region?",
      "Does the available floor support the team's department structure, growth plan, and client-facing needs?",
      "Would 181 Fremont, 680 Folsom, 101 California, or Mission Bay provide a better balance of image, cost, and daily usability?",
    ],
    nearbyDistricts: [
      { label: "Financial District", url: "/commercial-real-estate/CA/san-francisco/financial-district/", reason: "Compare when traditional corporate address and professional-service proximity matter more than modern SoMa identity." },
      { label: "South Beach", url: "/commercial-real-estate/CA/san-francisco/south-beach/", reason: "Compare when Embarcadero, South Financial District, and mixed-use edge conditions may be a better fit." },
      { label: "Mission Bay", url: "/commercial-real-estate/CA/san-francisco/mission-bay/", reason: "Compare when a newer district with a more campus-like feel may work better." },
    ],
  }),
  [buildingPath("650 Townsend St")]: buildingBrief({
    summary:
      "A large-format West SoMa creative office building for teams that value adaptable workspace, Caltrain-oriented access, and a less formal setting than the Financial District.",
    rofoTake:
      "650 Townsend is a large-format SoMa creative office building for teams that care more about adaptable workspace than a formal downtown address. It explains a different version of San Francisco office demand: larger floorplates, technology history, and a workday shaped by the Townsend and Caltrain corridor. The tradeoff is that the surrounding environment is more utilitarian and less polished than the Financial District, Transbay, or Mission Bay.",
    snapshot: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Large-format creative office" },
      { label: "Commercial role", value: "Large-format creative office building" },
      { label: "District", value: "SoMa" },
      { label: "Floorplate character", value: "Larger creative floorplate environment; team layout and expansion path should be validated" },
      { label: "Transit context", value: "Useful for Caltrain-oriented and SoMa commute patterns, with exact access depending on employee origins" },
      { label: "Parking context", value: "Parking and curb access should be validated because the area is more operational than traditional downtown" },
    ],
    bestFit: [
      "Technology, creative, and product teams that want larger adaptable floorplates rather than a formal tower environment",
      "Growth companies comparing West SoMa, Showplace Square, and Design District creative-office options",
      "Teams that value Caltrain access, freeway proximity, and a more production-adjacent workday",
    ],
    mayNotFit: [
      "Client-facing firms that need a traditional Financial District address",
      "Companies that want a polished tower arrival sequence or dense downtown service environment",
      "Teams that prioritize highly walkable retail blocks over workspace scale and flexibility",
    ],
    buildingExperience:
      "The experience is more working office than executive tower. Businesses should expect a SoMa setting where floorplate usability, team collaboration, and regional access matter more than lobby formality. The surrounding blocks can feel practical and uneven, which may be a strength or a drawback depending on company culture.",
    locationContext:
      "650 Townsend sits where SoMa and Showplace Square overlap, with technology, creative office, Caltrain access, and production-adjacent buildings nearby. It should be compared with 888 Brannan and 600 Townsend for similar creative-office logic, and with Financial District or Transbay towers when client-facing image matters more.",
    advantages: [
      "Strong example of larger SoMa creative-office demand",
      "Less formal workplace identity than traditional downtown towers",
      "Useful access pattern for teams oriented toward Caltrain, SoMa, and the Peninsula",
      "Useful reference point for companies comparing workspace adaptability against executive image",
    ],
    tradeoffs: [
      "Weaker traditional downtown prestige than the Financial District or Transbay towers",
      "Pedestrian experience and nearby amenities can be more uneven by block",
      "Transit convenience depends heavily on where employees commute from",
      "Specific floorplate, building systems, and parking conditions should be validated before shortlisting",
    ],
    validationNotes: [
      "Does the available floorplate support the team's collaboration pattern without wasting space?",
      "Is Caltrain, freeway, or neighborhood access more important than BART-oriented downtown access?",
      "Will the surrounding street environment support recruiting, visitors, and daily employee needs?",
      "Would 888 Brannan, 600 Townsend, 680 Folsom, or a Design District alternative provide a better tradeoff?",
    ],
    nearbyDistricts: [
      { label: "Showplace Square", url: "/commercial-real-estate/CA/san-francisco/showplace-square/", reason: "Compare when creative-office, AI, robotics, or production-adjacent environments are central to the search." },
      { label: "Design District", url: "/commercial-real-estate/CA/san-francisco/design-district/", reason: "Compare when showroom, design, creative production, or a less conventional office setting may fit." },
      { label: "Financial District", url: "/commercial-real-estate/CA/san-francisco/financial-district/", reason: "Compare when client-facing image and traditional downtown services matter more than workspace flexibility." },
    ],
  }),
  [buildingPath("1800 Owens St")]: buildingBrief({
    summary:
      "A modern Mission Bay office building for organizations that want newer workspace near life-science, health, technology, and waterfront anchors without choosing a traditional downtown tower.",
    rofoTake:
      "The Exchange is a modern Mission Bay office building for organizations that want newer workspace near health, life-science, technology, and waterfront anchors. It shows why Mission Bay is not just an overflow option for SoMa. The tradeoff is that the district has a more specialized identity and a different daily rhythm than the Financial District, Jackson Square, or central SoMa.",
    snapshot: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Modern office building" },
      { label: "Commercial role", value: "Modern Mission Bay office building" },
      { label: "District", value: "Mission Bay" },
      { label: "Floorplate character", value: "Large modern office environment; exact suite fit should be validated by floor" },
      { label: "Transit context", value: "Mission Bay transit and Caltrain-adjacent access depend on each team's commute pattern" },
      { label: "Parking context", value: "Structured and district parking options may be more practical than in some core districts, but should still be verified" },
    ],
    bestFit: [
      "Technology, health, and life-science-adjacent teams that value a newer Mission Bay setting",
      "Growth companies comparing modern office environments outside the traditional downtown tower core",
      "Organizations that want proximity to Mission Bay anchors without implying a laboratory requirement",
    ],
    mayNotFit: [
      "Firms that need a traditional Financial District client-facing address",
      "Companies that rely on older downtown business services, hotels, and dense weekday street activity",
      "Businesses seeking historic character, boutique executive space, or a low-rise neighborhood feel",
    ],
    buildingExperience:
      "The experience is modern, planned, and tied to Mission Bay's health, research, and technology anchors. Mission Bay feels different from older San Francisco business districts: more campus-like and less dependent on traditional downtown office routines. Businesses should evaluate whether that setting helps the team or narrows the brand too much.",
    locationContext:
      "The Exchange sits in Mission Bay, near the commercial environment shaped by UCSF, healthcare, life science, technology, waterfront buildings, and newer mixed-use development. It should be compared with 500 and 550 Terry Francois for waterfront and office/lab adjacency, with Salesforce Tower for modern headquarters identity, and with Dogpatch when a company wants a more industrial or emerging district edge.",
    advantages: [
      "Strong Mission Bay reference for modern office users beyond pure laboratory demand",
      "Mission Bay context near health, research, technology, and waterfront anchors",
      "Newer commercial environment than many traditional downtown buildings",
      "Useful alternative for companies that want scale without a Financial District identity",
    ],
    tradeoffs: [
      "More specialized location identity than the Financial District or central SoMa",
      "District amenities and street activity may feel less mature or less organic than older neighborhoods",
      "Event activity and district circulation should be considered depending on operating hours",
      "Do not assume lab capability or specialized infrastructure without validating the specific space",
    ],
    validationNotes: [
      "Does Mission Bay's health, research, and technology identity strengthen the company's recruiting, customer, or partner story?",
      "Is the commute pattern better served by Mission Bay than by SoMa, South Beach, or the Financial District?",
      "Does the available space support office needs without relying on unsupported lab or specialized-use assumptions?",
      "Would 500 Terry Francois, 550 Terry Francois, Salesforce Tower, or Dogpatch provide a clearer location fit?",
    ],
    nearbyDistricts: [
      { label: "Dogpatch", url: "/commercial-real-estate/CA/san-francisco/dogpatch/", reason: "Compare when industrial reuse, emerging waterfront development, or production-adjacent character may fit better." },
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/", reason: "Compare when central technology access or a broader startup office environment matters more." },
      { label: "South Beach", url: "/commercial-real-estate/CA/san-francisco/south-beach/", reason: "Compare when the business wants a bridge between downtown, waterfront, and ballpark/Mission Bay access." },
    ],
  }),
  [buildingPath("1105 Battery St")]: buildingBrief({
    summary:
      "A lower-rise Jackson Square office campus for companies that want character, a calmer northern downtown setting, and a less formal alternative to Financial District towers.",
    rofoTake:
      "Levi's Plaza is a lower-rise campus-style office environment at the Jackson Square and north waterfront edge. It shows that not every executive or creative office decision in San Francisco points to a tower. It can work well for established creative, consumer, design, media, and boutique professional teams that want a more human-scale setting. The tradeoff is less direct rapid-transit access and less traditional headquarters signaling than the Financial District or Transbay.",
    snapshot: [
      { label: "Primary use", value: "Office" },
      { label: "Building type", value: "Lower-rise campus-style office" },
      { label: "Commercial role", value: "Lower-rise office campus" },
      { label: "District", value: "Jackson Square" },
      { label: "Floorplate character", value: "Campus-style office environment; specific suite scale and layout should be validated" },
      { label: "Transit context", value: "Reasonable downtown access but generally less direct than core Financial District transit" },
      { label: "Parking context", value: "Parking and visitor arrival should be validated because the location is outside the core tower grid" },
    ],
    bestFit: [
      "Creative, consumer, design, media, and established teams that value a distinctive lower-rise environment",
      "Boutique professional firms that want downtown adjacency without a conventional tower setting",
      "Companies comparing Jackson Square, north waterfront, and Financial District edge alternatives",
    ],
    mayNotFit: [
      "Businesses that need the clearest Financial District address signal or direct BART-oriented commute",
      "Large users that require deep tower services, very large floorplate consistency, or multiple expansion paths",
      "Teams that want the energy and density of central SoMa or Transbay",
    ],
    buildingExperience:
      "The experience is calmer, lower-rise, and more campus-like than most downtown San Francisco office options. It is better understood as a place-based workplace decision than a pure address decision. That can support culture and identity, but it should be tested against commute patterns, client access, and future growth needs.",
    locationContext:
      "Levi's Plaza sits at the Jackson Square and north waterfront edge, close enough to downtown to remain in the professional-service orbit but distinct from the Market Street tower core. It should be compared with One Maritime Plaza and Transamerica Pyramid for executive alternatives, and with core Jackson Square buildings when neighborhood character matters most.",
    advantages: [
      "Distinct lower-rise campus environment near the northern downtown edge",
      "Less formal and more human-scale than traditional Financial District towers",
      "Strong fit for teams using workplace character as part of culture and recruiting",
      "Useful reference point for Jackson Square and north waterfront office decisions",
    ],
    tradeoffs: [
      "Less direct rapid-transit access than core Financial District or Transbay buildings",
      "May not carry the same traditional headquarters signal as major downtown towers",
      "Large-user expansion, building services, and floorplate consistency should be validated",
      "The quieter setting may not suit teams seeking dense street activity or central SoMa energy",
    ],
    validationNotes: [
      "Does the lower-rise campus feel strengthen the company's culture, recruiting, and client impression?",
      "Are commute patterns acceptable compared with Financial District or Transbay alternatives?",
      "Can the available suite support current needs and plausible growth without losing the benefit of the setting?",
      "Would One Maritime Plaza, Transamerica Pyramid, 1000 Sansome, or a Financial District tower provide a stronger tradeoff?",
    ],
    nearbyDistricts: [
      { label: "Financial District", url: "/commercial-real-estate/CA/san-francisco/financial-district/", reason: "Compare when transit, tower services, and traditional client-facing image matter more." },
      { label: "Jackson Square", url: "/commercial-real-estate/CA/san-francisco/jackson-square/", reason: "Review the broader district when character, walkability, and boutique office identity are central to the search." },
      { label: "South Beach", url: "/commercial-real-estate/CA/san-francisco/south-beach/", reason: "Compare when waterfront adjacency and mixed-use commercial context may matter more than north downtown character." },
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
  const description = `${identity.name} is a ${editorial.editorialRole.toLowerCase()} in ${canonicalDistrict.name}. ${editorial.editorialReason}`;
  const buildingBrief = buildingBriefsByPath[item.building_path] || null;

  return {
    name: identity.name,
    display_name: identity.name,
    address: identity.address,
    city: CITY,
    state_abbr: STATE,
    city_slug: CITY_SLUG,
    building_slug: slugify(identity.address),
    building_path: item.building_path,
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
    meta_title: `${identity.name} | Representative Commercial Building in ${CITY}`,
    meta_description:
      `Learn why businesses compare ${identity.name} in ${canonicalDistrict.name}, what it helps explain, and what to validate before adding similar buildings to a shortlist.`,
    teaser: description,
    building_description: description,
    about_context:
      `${identity.name} is included in Rofo's San Francisco Commercial Building Intelligence because it helps explain ${canonicalDistrict.name}. It is a representative example, not an availability claim.`,
    location_context:
      `${identity.name} sits in ${canonicalDistrict.name}, one of the San Francisco commercial areas businesses compare when deciding where to begin a search.`,
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
