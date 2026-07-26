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

function buildingPath(state, city, address) {
  return `/commercial-real-estate/building/${state}/${slugify(city)}/${slugify(address)}/`;
}

function labelFromBuildingPath(path) {
  const slug = clean(path).split("/").filter(Boolean).pop() || "";
  return slug
    .split("-")
    .map((part) => {
      const upper = part.toUpperCase();
      if (["NE", "NW", "SE", "SW", "N", "S", "E", "W"].includes(upper)) return upper;
      return part ? part.charAt(0).toUpperCase() + part.slice(1) : part;
    })
    .join(" ");
}

function alternativesFromPaths(paths) {
  return (paths || []).slice(0, 4).map((url) => ({
    label: labelFromBuildingPath(url),
    url,
    reason: `Compare ${labelFromBuildingPath(url)} when testing a different Seattle-area operating model.`,
  }));
}

function district(id, name, city, slug, primarySpaceType = "office") {
  return {
    id,
    name,
    slug,
    city,
    state_abbr: "WA",
    area_type: primarySpaceType === "industrial" ? "industrial_area" : "district",
    path: `/commercial-real-estate/WA/${slugify(city)}/${slug}/`,
    primarySpaceType,
  };
}

const districts = {
  downtownSeattle: district("sea-downtown-seattle-office", "Downtown Seattle Office Core", "Seattle", "downtown-seattle-office"),
  pioneerSquare: district("sea-pioneer-square-office", "Pioneer Square / Waterfront Office", "Seattle", "pioneer-square-waterfront-office"),
  belltown: district("sea-belltown-waterfront-office", "Belltown / Waterfront Creative Office", "Seattle", "belltown-waterfront-office"),
  bellevue: district("sea-bellevue-cbd-office", "Bellevue CBD Office", "Bellevue", "bellevue-cbd-office"),
  eastsideTech: district("sea-eastside-tech-office", "Eastside Tech Office Corridor", "Redmond", "eastside-tech-office-corridor"),
  sodo: district("sea-sodo-industrial", "SODO Industrial", "Seattle", "sodo-industrial", "industrial"),
  ballardInterbay: district("sea-ballard-interbay-industrial", "Ballard / Interbay Industrial", "Seattle", "ballard-interbay-industrial", "industrial"),
  kentValley: district("sea-kent-valley", "Kent Valley", "Kent", "kent-valley", "industrial"),
};

const handbookTopics = [
  {
    title: "Choosing the Right Commercial Location",
    url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/",
    summary: "Use location fit, access, customers, employees, operations, and validation needs before narrowing the building list.",
  },
  {
    title: "How to Compare Commercial Spaces",
    url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/",
    summary: "Compare buildings by business fit, total occupancy cost, access, buildout, and future flexibility.",
  },
];

const districtContext = {
  downtownSeattle: {
    workplaceCharacter: "Central Seattle office environment shaped by towers, transit, professional services, civic access, and regional business identity.",
    neighborhoodCharacter: "Dense downtown business core where client access, employee transit, and institutional address matter more than parking convenience.",
    transit: "Downtown Seattle offers strong regional transit and walkable business access, while exact commute patterns should be tested by block and team location.",
    parking: "Structured parking and visitor logistics should be validated early for client-facing and employee-heavy teams.",
    amenities: "Hotels, restaurants, transit, cultural institutions, civic services, and professional services support office use.",
  },
  pioneerSquare: {
    workplaceCharacter: "Historic and waterfront-adjacent office environment where character, client access, creative identity, and downtown proximity overlap.",
    neighborhoodCharacter: "Older urban commercial district connected to the financial core, waterfront, stadium area, and SODO edge.",
    transit: "Transit and central-city access are useful, but arrival, parking, and block-by-block customer comfort should be validated.",
    parking: "Visitor parking and event-period access need early validation for client-facing users.",
    amenities: "Waterfront, stadium-area, restaurant, and downtown amenities create a different office experience from tower-only downtown blocks.",
  },
  belltown: {
    workplaceCharacter: "Creative waterfront office environment where character, employee experience, and central Seattle access can matter more than formal corporate image.",
    neighborhoodCharacter: "Mixed downtown-edge district linking waterfront, creative office, residential, hospitality, and South Lake Union adjacency.",
    transit: "Walkability and central access are useful, while daily commute patterns depend on employee origin and exact building location.",
    parking: "Parking and visitor arrival should be validated because Belltown is denser and less parking-forward than suburban office settings.",
    amenities: "Restaurants, waterfront access, hotels, and creative neighborhood character shape the employee and client experience.",
  },
  bellevue: {
    workplaceCharacter: "Eastside central business district office environment with stronger corporate image, regional access, and parking orientation than many Seattle urban districts.",
    neighborhoodCharacter: "Polished Eastside business core where client-facing office users compare address, employee geography, and access to Seattle and Eastside suburbs.",
    transit: "Regional access is useful, but employee commute patterns should be tested across Seattle, Bellevue, Redmond, and Kirkland.",
    parking: "Garage or structured parking is common in this environment, but allocation, cost, and visitor access remain building-specific.",
    amenities: "Retail, restaurants, hotels, executive services, and Eastside business amenities support client-facing office work.",
  },
  eastsideTech: {
    workplaceCharacter: "Eastside technology and suburban office corridor shaped by campus-style workplaces, technical teams, parking, and access to Bellevue, Redmond, and Kirkland.",
    neighborhoodCharacter: "Suburban and tech-oriented compared with Downtown Seattle, with stronger auto access and campus/workforce fit.",
    transit: "Employee geography, shuttle patterns, regional transit, and drive access should be evaluated together.",
    parking: "Parking and campus access are stronger decision factors than street-level downtown walkability.",
    amenities: "Nearby suburban services and technology corridor context matter more than dense downtown amenities.",
  },
  sodo: {
    workplaceCharacter: "Urban industrial setting where central Seattle access, service territory, and operational utility matter more than conventional office polish.",
    neighborhoodCharacter: "SODO sits between downtown, stadium, port, and south Seattle industrial geographies.",
    transit: "Central access can be useful, but loading, parking, delivery, and operational compatibility should drive validation.",
    parking: "Parking, loading, vehicle movement, and storage needs are property-specific and must be validated.",
    amenities: "Amenities are secondary to operating access, district identity, and practical movement through the city.",
  },
  ballardInterbay: {
    workplaceCharacter: "North Seattle flex and creative-operational environment shaped by waterfront identity, maker adjacency, and service-business geography.",
    neighborhoodCharacter: "Ballard and Interbay mix office, industrial, marine, maker, and neighborhood-serving commercial patterns.",
    transit: "Customer and employee geography should be compared against central Seattle and Eastside alternatives.",
    parking: "Parking, loading, and operational access vary materially by building and suite.",
    amenities: "Waterfront, neighborhood, creative, and service-industrial amenities shape the setting.",
  },
  kentValley: {
    workplaceCharacter: "South King County industrial environment where warehouse, distribution, and regional access drive the location decision.",
    neighborhoodCharacter: "Kent Valley provides Seattle-area industrial scale and south metro reach rather than central-city office identity.",
    transit: "Regional freeway, airport, port, and customer geography matter more than walkable urban access.",
    parking: "Truck movement, loading, parking, trailer access, and clear height must be validated at the property level.",
    amenities: "Operational access matters more than employee-facing amenities in this environment.",
  },
};

function profileBrief(fields) {
  const snapshot = fields.snapshot || [];
  const bestFit = fields.bestFit || [];
  const validationNotes = fields.validationNotes || [];

  return {
    status: "published",
    ecosystemContext: {
      primaryEcosystem: fields.primaryEcosystem,
      ecosystemSubtypes: fields.ecosystemSubtypes,
      representativeRole: fields.representativeRole,
    },
    businessFit: {
      archetypes: fields.businessArchetypes,
      activities: fields.businessActivities,
      fitSummary: fields.fitSummary,
    },
    operationalProfile: fields.operationalProfile || [],
    environmentExplanation: fields.environmentExplanation,
    comparisonContext: {
      relatedDistricts: fields.relatedDistricts || [],
    },
    evidence: {
      confidence: fields.confidence || "editorially_supported",
      provenance: {
        ecosystem: "representative-building",
        operationalCharacteristics: "district-and-building-profile",
        editorialInterpretation: "building-brief",
      },
      sourceNotes: fields.sourceNotes || [],
    },
    summary: fields.summary,
    rofoTake: fields.rofoTake,
    buildingSummary: fields.summary,
    buildingImportance: fields.rofoTake,
    snapshot,
    quickFacts: snapshot,
    bestFit,
    idealFor: bestFit,
    mayNotFit: fields.mayNotFit || [],
    buildingExperience: fields.buildingExperience,
    locationContext: fields.locationContext,
    districtContext: fields.locationContext,
    advantages: fields.advantages || [],
    tradeoffs: fields.tradeoffs || [],
    validationNotes,
    validationChecklist: validationNotes,
    nearbyDistricts: fields.nearbyDistricts || [],
    nearbyAlternatives: fields.nearbyAlternatives || [],
    relatedInsights: handbookTopics,
    representativeCompanies: [],
    ecosystemSubtypes: fields.ecosystemSubtypes,
    representativeRole: fields.representativeRole,
    businessActivities: fields.businessActivities,
    businessArchetypes: fields.businessArchetypes,
    operationalCharacteristics: fields.operationalCharacteristics || [],
    fitSummary: fields.fitSummary,
    confidence: fields.confidence || "editorially_supported",
    sourceNotes: fields.sourceNotes || [],
  };
}

function record(fields) {
  const canonicalDistrict = districts[fields.districtKey];
  const defaults = districtContext[fields.districtKey];
  const path = buildingPath("WA", fields.city || canonicalDistrict.city, fields.address);
  const brief = profileBrief({
    ...fields.brief,
    nearbyAlternatives: fields.brief.nearbyAlternatives || alternativesFromPaths(fields.comparisonBuildingPaths),
  });

  return {
    id: `wa-${slugify(fields.city || canonicalDistrict.city)}-${slugify(fields.address)}`,
    building_path: path,
    identity: {
      name: fields.name,
      address: fields.address,
      city: fields.city || canonicalDistrict.city,
      state_abbr: "WA",
      district: canonicalDistrict.name,
      canonicalDistrict,
      secondaryDistricts: fields.secondaryDistricts || [],
      buildingType: fields.buildingType,
      primarySpaceType: fields.primarySpaceType || canonicalDistrict.primarySpaceType,
      assetClass: fields.assetClass || "Representative Commercial Building",
    },
    editorial: {
      editorialRole: fields.editorialRole,
      editorialReason: fields.editorialReason,
      representativeThemes: fields.representativeThemes,
    },
    business: {
      businessFit: fields.businessFit,
      idealCompanyProfiles: brief.idealFor,
      companySizes: fields.companySizes || ["small and mid-sized businesses", "professional teams", "growth-oriented companies"],
    },
    experience: {
      workplaceCharacter: defaults.workplaceCharacter,
      neighborhoodCharacter: defaults.neighborhoodCharacter,
      executivePresence: fields.executivePresence || "medium",
      innovationScore: fields.innovationScore || "moderate",
    },
    operations: {
      transit: defaults.transit,
      parking: defaults.parking,
      amenities: defaults.amenities,
      foodEnvironment: fields.foodEnvironment || "Food and service access should be evaluated by employee, client, and visitor patterns.",
    },
    tradeoffs: {
      strengths: brief.advantages,
      limitations: brief.tradeoffs,
      businessesThatShouldCompare: brief.mayNotFit,
      nearbyAlternatives: fields.relatedDistrictPaths || [],
    },
    validation: {
      questionsToValidate: brief.validationNotes,
      tourObservations: brief.validationNotes.slice(0, 3),
    },
    relationships: {
      nearbyBuildings: (fields.nearbyBuildingPaths || []).slice(0, 5),
      comparisonBuildings: (fields.comparisonBuildingPaths || []).slice(0, 5),
      relatedDistricts: fields.relatedDistrictPaths || [],
    },
    quality: {
      sourceConfidence: fields.sourceConfidence || "medium",
      publicationStatus: "published",
      sourceBasis: "Seattle Office Ecosystem Completion",
    },
    buildingBrief: brief,
  };
}

const records = [
  record({
    name: "Columbia Center",
    address: "701 Fifth Avenue",
    city: "Seattle",
    districtKey: "downtownSeattle",
    buildingType: "Downtown office tower",
    primarySpaceType: "office",
    editorialRole: "Downtown Class A Office Environment",
    editorialReason: "Represents the formal Downtown Seattle high-rise office decision for businesses that value central identity, transit, client access, and regional visibility.",
    representativeThemes: ["Downtown office", "High-rise tower", "Client-facing image", "Transit access"],
    businessFit: ["law firms", "financial services", "consulting firms", "regional professional offices"],
    relatedDistrictPaths: [districts.bellevue.path, districts.pioneerSquare.path],
    nearbyBuildingPaths: [
      buildingPath("WA", "Seattle", "1420 Fifth Avenue"),
      buildingPath("WA", "Seattle", "1201 3rd Ave"),
      buildingPath("WA", "Seattle", "506 Second Avenue"),
    ],
    comparisonBuildingPaths: [
      buildingPath("WA", "Bellevue", "601 108th Ave NE"),
      buildingPath("WA", "Seattle", "2815 Elliott Ave"),
      buildingPath("WA", "Seattle", "1455 NW Leary Way"),
    ],
    brief: {
      primaryEcosystem: "office",
      ecosystemSubtypes: ["downtown_office", "executive_office"],
      representativeRole: "downtown_class_a_office",
      businessActivities: ["knowledge_work", "client_meetings", "administrative_operations"],
      businessArchetypes: ["law_firm", "financial_services_firm", "consulting_firm", "professional_office"],
      operationalCharacteristics: ["professional_image", "transit_access", "large_floorplates", "structured_parking", "urban_core_access"],
      fitSummary: "Useful for professional and executive office users comparing Seattle's central tower environment against Bellevue, creative office, or flex alternatives.",
      summary: "Columbia Center helps explain Downtown Seattle as a formal office environment. It is most useful for firms that need a central business address, client access, transit reach, and a recognizable office setting rather than a neighborhood or operations-led building.",
      rofoTake: "This profile gives Seattle office coverage a central high-rise benchmark so the market is no longer interpreted only through industrial/flex examples.",
      snapshot: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Business use", value: "Downtown office tower" },
        { label: "District", value: "Downtown Seattle Office Core" },
        { label: "Access context", value: "Central Seattle transit and client access" },
      ],
      bestFit: [
        "Law, finance, consulting, and professional-service firms that benefit from a central Seattle address.",
        "Teams that host clients, partners, or executives and need a formal office setting.",
        "Companies comparing Downtown Seattle against Bellevue or neighborhood creative-office alternatives.",
      ],
      mayNotFit: [
        "Teams whose main priority is lower-cost expansion or a less formal workplace identity.",
        "Businesses that need loading, storage, production, or industrial utility.",
      ],
      buildingExperience: "A tour should test arrival experience, visitor access, floorplate fit, transit patterns, parking logistics, and whether downtown formality supports the company's business model.",
      locationContext: "Downtown Seattle is the clearest central office environment in the metro. Compare Bellevue when Eastside client or employee geography matters more, and Belltown or Ballard when creative identity is more important.",
      advantages: [
        "Defines the central Seattle high-rise office choice.",
        "Supports client-facing professional-service and executive office needs.",
        "Creates a useful benchmark against Bellevue and creative-office districts.",
      ],
      tradeoffs: [
        "Downtown image can add cost and complexity for teams that do not need it.",
        "Parking and visitor logistics require validation.",
        "The environment is less operationally flexible than industrial/flex districts.",
      ],
      operationalProfile: [
        { label: "Access and image", summary: "Central transit, address, client access, and professional image are the durable characteristics to evaluate." },
        { label: "Space planning", summary: "Floorplate, suite size, meeting rooms, confidentiality, and visitor flow should be checked against the team's work pattern." },
      ],
      environmentExplanation: {
        whyItExists: "Downtown office towers exist for companies that benefit from central identity, client access, transit, business services, and larger formal workplace settings.",
        whyChooseThisEnvironment: "Choose this environment over Bellevue or Belltown when central Seattle client access and formal business identity matter more than parking convenience or neighborhood character.",
        representativeValue: "Columbia Center anchors Seattle's office ecosystem with a downtown high-rise reference point.",
      },
      relatedDistricts: [{ districtId: "bellevue-cbd-office", reason: "Eastside corporate-office alternative with different employee and client geography." }],
      validationNotes: ["Confirm suite layout and floorplate fit.", "Validate visitor and employee parking.", "Test transit and commute patterns.", "Review building access and after-hours procedures."],
      sourceNotes: ["Existing Rofo canonical record identifies Columbia Center / 701 Fifth Avenue as Seattle office space in the financial district."],
    },
  }),
  record({
    name: "Smith Tower",
    address: "506 Second Avenue",
    city: "Seattle",
    districtKey: "pioneerSquare",
    buildingType: "Historic office tower",
    primarySpaceType: "office",
    editorialRole: "Executive Office Environment",
    editorialReason: "Represents Seattle's historic client-facing office option for firms that want character and central access without a purely modern tower identity.",
    representativeThemes: ["Historic office", "Client meetings", "Downtown edge", "Professional services"],
    businessFit: ["law firms", "professional offices", "financial services", "boutique consulting firms"],
    relatedDistrictPaths: [districts.downtownSeattle.path, districts.belltown.path],
    nearbyBuildingPaths: [
      buildingPath("WA", "Seattle", "107 Spring St"),
      buildingPath("WA", "Seattle", "255 S King St"),
      buildingPath("WA", "Seattle", "450 Alaskan Way S"),
    ],
    comparisonBuildingPaths: [
      buildingPath("WA", "Seattle", "701 Fifth Avenue"),
      buildingPath("WA", "Seattle", "2815 Elliott Ave"),
      buildingPath("WA", "Bellevue", "601 108th Ave NE"),
    ],
    brief: {
      primaryEcosystem: "office",
      ecosystemSubtypes: ["executive_office", "professional_office", "downtown_office"],
      representativeRole: "executive_office_environment",
      businessActivities: ["client_meetings", "knowledge_work", "administrative_operations"],
      businessArchetypes: ["law_firm", "financial_services_firm", "consulting_firm", "professional_office"],
      operationalCharacteristics: ["professional_image", "private_office_layout", "urban_core_access", "transit_access"],
      fitSummary: "Useful for professional firms comparing historic character, client meetings, and central Seattle access.",
      summary: "Smith Tower helps explain a different Seattle office model from conventional modern towers. The environment is useful for client-facing firms that value character, credibility, and downtown access but do not want every decision driven by the newest tower format.",
      rofoTake: "This profile adds an executive and historic-office counterpoint to Seattle's central office foundation.",
      snapshot: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Business use", value: "Historic executive office" },
        { label: "District", value: "Pioneer Square / Waterfront Office" },
        { label: "Comparison role", value: "Historic downtown alternative to modern high-rise office" },
      ],
      bestFit: [
        "Boutique law, finance, consulting, and advisory firms that host clients.",
        "Professional teams that want downtown access with a more distinctive office identity.",
        "Businesses comparing formal image against creative or neighborhood office options.",
      ],
      mayNotFit: [
        "Large teams that need broad modern floorplates or campus-style expansion.",
        "Companies where employee parking or suburban commute patterns dominate the decision.",
      ],
      buildingExperience: "A tour should focus on client arrival, elevator and access logistics, office privacy, suite layout, and whether historic character supports or distracts from the firm's positioning.",
      locationContext: "Pioneer Square and the waterfront edge offer a different office identity from the downtown tower core. Compare Downtown Seattle for more conventional tower scale, Belltown for creative character, and SODO for operational adjacency.",
      advantages: [
        "Adds historic and executive-office depth to Seattle's office ecosystem.",
        "Useful for client-facing professional firms that value character.",
        "Keeps the office foundation from being defined only by large modern towers.",
      ],
      tradeoffs: [
        "Historic character may not fit teams needing modern large-floorplate efficiency.",
        "Visitor parking and event-area circulation require validation.",
        "The district edge may feel less uniform than the core financial district.",
      ],
      operationalProfile: [
        { label: "Client access", summary: "Client-facing users should validate arrival experience, conference needs, privacy, and visitor logistics." },
        { label: "Building character", summary: "Historic character can support brand and credibility, but layout and building systems still need direct validation." },
      ],
      environmentExplanation: {
        whyItExists: "Historic executive office environments exist because some professional firms value character, credibility, and central access more than generic modern floorplate efficiency.",
        whyChooseThisEnvironment: "Choose this environment over a larger downtown tower when office identity and client-facing character matter more than scale. Compare Bellevue when Eastside access or parking is a stronger driver.",
        representativeValue: "Smith Tower helps Seattle explain office choice by character, not just size or tower height.",
      },
      relatedDistricts: [{ districtId: "downtown-seattle-office", reason: "More conventional central tower-office alternative." }],
      validationNotes: ["Validate suite layout and private-office needs.", "Confirm visitor access and parking.", "Review after-hours access.", "Confirm technology and meeting-room requirements."],
      sourceNotes: ["Existing Rofo canonical record identifies Smith Tower / 506 Second Avenue as a Seattle office landmark in the financial district."],
    },
  }),
  record({
    name: "Spaces Belltown",
    address: "2815 Elliott Ave",
    city: "Seattle",
    districtKey: "belltown",
    buildingType: "Creative waterfront office",
    primarySpaceType: "office",
    editorialRole: "Creative Office Environment",
    editorialReason: "Represents Belltown's creative waterfront office setting for teams comparing employee experience, character, and central access against formal downtown towers.",
    representativeThemes: ["Creative office", "Waterfront", "Flexible workplace", "Downtown edge"],
    businessFit: ["creative studios", "marketing agencies", "startups", "small professional teams"],
    relatedDistrictPaths: [districts.downtownSeattle.path, districts.ballardInterbay.path],
    nearbyBuildingPaths: [
      buildingPath("WA", "Seattle", "600 Stewart St"),
      buildingPath("WA", "Seattle", "1601 2nd Ave"),
      buildingPath("WA", "Seattle", "450 Alaskan Way S"),
    ],
    comparisonBuildingPaths: [
      buildingPath("WA", "Seattle", "1455 NW Leary Way"),
      buildingPath("WA", "Seattle", "701 Fifth Avenue"),
      buildingPath("WA", "Bellevue", "601 108th Ave NE"),
    ],
    brief: {
      primaryEcosystem: "office",
      ecosystemSubtypes: ["creative_office", "coworking", "professional_office"],
      representativeRole: "creative_office_environment",
      businessActivities: ["knowledge_work", "collaboration", "product_development", "client_meetings"],
      businessArchetypes: ["creative_studio", "marketing_agency", "startup", "consulting_firm"],
      operationalCharacteristics: ["creative_environment", "open_workspace", "flexible_suite_sizes", "walkability", "urban_core_access"],
      fitSummary: "Useful for creative, startup, and flexible-office users comparing central Seattle character against tower or Eastside office settings.",
      summary: "2815 Elliott Ave helps explain Seattle's creative waterfront office environment. It is useful for teams that want central access and workplace character without choosing a formal financial-district tower.",
      rofoTake: "This profile gives Seattle office coverage a creative-office example that is distinct from both downtown towers and industrial/flex environments.",
      snapshot: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Business use", value: "Creative office environment" },
        { label: "District", value: "Belltown / Waterfront Creative Office" },
        { label: "Comparison role", value: "Creative office counterpoint to downtown towers" },
      ],
      bestFit: [
        "Creative, marketing, startup, and consulting teams that value workplace character.",
        "Small or flexible teams comparing central access with less formal office identity.",
        "Businesses that want employee experience and neighborhood energy to matter in the location decision.",
      ],
      mayNotFit: [
        "Formal client-facing firms that need a traditional tower signal.",
        "Operational users that require loading, storage, or warehouse capability.",
      ],
      buildingExperience: "A tour should focus on workspace flexibility, meeting-room fit, visitor arrival, employee commute pattern, and whether the creative setting strengthens recruiting or client experience.",
      locationContext: "Belltown offers a different office story from Downtown Seattle and Bellevue. Compare Downtown Seattle for formal office image, Bellevue for Eastside corporate access, and Ballard/Interbay when creative identity overlaps with more operational adjacency.",
      advantages: [
        "Adds creative-office depth to Seattle's office ecosystem.",
        "Supports employee-experience and flexible-workplace comparisons.",
        "Provides a central Seattle alternative to formal downtown tower identity.",
      ],
      tradeoffs: [
        "Creative character may not support every client-facing professional-service brand.",
        "Parking and visitor access can be less predictable than suburban office settings.",
        "Flexible workspace may not meet larger long-term control requirements.",
      ],
      operationalProfile: [
        { label: "Workplace character", summary: "Creative-office users should evaluate collaboration areas, meeting rooms, daylight, neighborhood identity, and employee experience." },
        { label: "Access pattern", summary: "Central location helps some teams, but parking, visitor access, and commute geography still need validation." },
      ],
      environmentExplanation: {
        whyItExists: "Creative office environments exist because some teams need collaboration, identity, flexibility, and employee experience more than formal corporate office signals.",
        whyChooseThisEnvironment: "Choose this environment over a downtown tower when creative workplace identity matters more than executive formality. Compare Ballard when north Seattle identity and operational adjacency matter more.",
        representativeValue: "2815 Elliott Ave gives Seattle a clear creative-office benchmark.",
      },
      relatedDistricts: [{ districtId: "downtown-seattle-office", reason: "More formal central office alternative." }],
      validationNotes: ["Confirm workspace configuration.", "Validate meeting-room and collaboration needs.", "Review visitor access and parking.", "Confirm lease flexibility and suite control."],
      sourceNotes: ["Existing Rofo canonical record describes 2815 Elliott Ave as a creative waterfront office setting in Belltown."],
    },
  }),
  record({
    name: "Key Center",
    address: "601 108th Ave NE",
    city: "Bellevue",
    districtKey: "bellevue",
    buildingType: "Bellevue CBD office",
    primarySpaceType: "office",
    editorialRole: "Professional Office Environment",
    editorialReason: "Represents Bellevue's central business district office option for companies comparing Eastside corporate identity, client access, and parking orientation against Downtown Seattle.",
    representativeThemes: ["Bellevue CBD", "Professional office", "Eastside access", "Corporate image"],
    businessFit: ["professional offices", "consulting firms", "financial services", "regional offices"],
    relatedDistrictPaths: [districts.downtownSeattle.path, districts.eastsideTech.path],
    nearbyBuildingPaths: [
      buildingPath("WA", "Bellevue", "Skyline Tower, 10900 N.E. 4th Street"),
      buildingPath("WA", "Bellevue", "11900 NE 1st St"),
      buildingPath("WA", "Bellevue", "3120 139th Ave SE"),
    ],
    comparisonBuildingPaths: [
      buildingPath("WA", "Seattle", "701 Fifth Avenue"),
      buildingPath("WA", "Redmond", "2525 152nd Ave NE"),
      buildingPath("WA", "Kirkland", "11335 NE 122nd Way"),
    ],
    brief: {
      primaryEcosystem: "office",
      ecosystemSubtypes: ["professional_office", "executive_office", "suburban_office"],
      representativeRole: "professional_office_environment",
      businessActivities: ["knowledge_work", "client_meetings", "administrative_operations"],
      businessArchetypes: ["professional_office", "financial_services_firm", "consulting_firm", "accounting_firm"],
      operationalCharacteristics: ["professional_image", "customer_parking", "structured_parking", "suburban_access", "private_office_layout"],
      fitSummary: "Useful for professional and regional office users comparing Bellevue's Eastside business core against Seattle's downtown tower market.",
      summary: "Key Center helps explain Bellevue CBD as an Eastside office environment. It is useful for firms that want a polished business setting, client access, and Eastside employee geography without relying on Downtown Seattle identity.",
      rofoTake: "This profile gives Seattle metro office coverage a Bellevue CBD benchmark, which is necessary because many office users compare Seattle and Eastside locations together.",
      snapshot: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Business use", value: "Professional office environment" },
        { label: "District", value: "Bellevue CBD Office" },
        { label: "Access context", value: "Eastside client and employee geography" },
      ],
      bestFit: [
        "Professional-service, consulting, finance, accounting, and regional office users serving Eastside customers or employees.",
        "Teams that value polished office image and practical access more than central Seattle identity.",
        "Companies comparing Bellevue with Downtown Seattle and Redmond/Kirkland technology corridors.",
      ],
      mayNotFit: [
        "Teams whose clients, employees, or partners are concentrated in central Seattle.",
        "Creative or startup users that prefer less formal neighborhood office character.",
      ],
      buildingExperience: "A tour should focus on arrival experience, parking allocation, suite layout, meeting-room needs, commute geography, and whether Bellevue identity supports the client base.",
      locationContext: "Bellevue CBD is a separate office decision from Downtown Seattle. Compare Downtown Seattle when central-city transit and civic access matter more, and Redmond/Kirkland when technology corridor proximity is the stronger driver.",
      advantages: [
        "Adds Eastside office depth to Seattle's metro view.",
        "Supports professional and client-facing office comparisons outside Downtown Seattle.",
        "Helps users compare Bellevue, Downtown Seattle, and Eastside technology corridors.",
      ],
      tradeoffs: [
        "Bellevue may be less convenient for employees or clients concentrated west of Lake Washington.",
        "Polished Eastside office image can add cost without improving fit for every user.",
        "Parking and visitor access still need property-specific validation.",
      ],
      operationalProfile: [
        { label: "Client and employee geography", summary: "Bellevue works best when Eastside access materially improves client visits, employee commutes, or regional business coverage." },
        { label: "Office planning", summary: "Private office needs, meeting rooms, parking allocation, and visitor arrival should be validated against the team's workflow." },
      ],
      environmentExplanation: {
        whyItExists: "Bellevue CBD office environments exist because Eastside businesses often need a polished business address, client access, and workforce geography distinct from Downtown Seattle.",
        whyChooseThisEnvironment: "Choose Bellevue over Downtown Seattle when Eastside client and employee access matter more than central Seattle transit identity.",
        representativeValue: "Key Center gives Seattle office coverage a durable Eastside professional-office example.",
      },
      relatedDistricts: [{ districtId: "downtown-seattle-office", reason: "Central Seattle office alternative with different transit and client geography." }],
      validationNotes: ["Validate parking allocation and cost.", "Confirm visitor access.", "Test Eastside versus Seattle commute patterns.", "Confirm suite layout and meeting-room needs."],
      sourceNotes: ["Existing Rofo canonical record identifies 601 108th Ave NE as modern office space in Bellevue's central business district."],
    },
  }),
  record({
    name: "Redmond Center",
    address: "2525 152nd Ave NE",
    city: "Redmond",
    districtKey: "eastsideTech",
    buildingType: "Eastside technology corridor office",
    primarySpaceType: "office",
    editorialRole: "Suburban Office Campus",
    editorialReason: "Represents the Bellevue-Redmond technology corridor office decision for teams that value suburban access, technical workforce geography, and campus-adjacent office patterns.",
    representativeThemes: ["Eastside tech", "Suburban office", "Campus adjacency", "Employee access"],
    businessFit: ["startups", "technology teams", "professional offices", "administrative offices"],
    relatedDistrictPaths: [districts.bellevue.path, districts.downtownSeattle.path],
    nearbyBuildingPaths: [
      buildingPath("WA", "Bellevue", "2018 156th Avenue, NE, Building F"),
      buildingPath("WA", "Kirkland", "11335 NE 122nd Way"),
      buildingPath("WA", "Bellevue", "3120 139th Ave SE"),
    ],
    comparisonBuildingPaths: [
      buildingPath("WA", "Bellevue", "601 108th Ave NE"),
      buildingPath("WA", "Seattle", "2815 Elliott Ave"),
      buildingPath("WA", "Seattle", "701 Fifth Avenue"),
    ],
    brief: {
      primaryEcosystem: "office",
      ecosystemSubtypes: ["suburban_office", "office_campus", "professional_office"],
      representativeRole: "suburban_office_campus",
      businessActivities: ["knowledge_work", "collaboration", "administrative_operations", "product_development"],
      businessArchetypes: ["startup", "consulting_firm", "professional_office", "marketing_agency"],
      operationalCharacteristics: ["campus_environment", "surface_parking", "suburban_access", "fiber_connectivity"],
      fitSummary: "Useful for technology, professional, and administrative teams comparing Eastside suburban office access against Bellevue CBD or Downtown Seattle.",
      summary: "Redmond Center helps explain the Eastside technology corridor office environment. It is useful for teams whose workforce, customers, or partners are concentrated around Bellevue, Redmond, Kirkland, and nearby corporate campuses.",
      rofoTake: "This profile gives Seattle office coverage a suburban technology-corridor benchmark, rather than treating all office demand as downtown or Bellevue CBD demand.",
      snapshot: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Business use", value: "Suburban technology-corridor office" },
        { label: "District", value: "Eastside Tech Office Corridor" },
        { label: "Comparison role", value: "Campus-adjacent alternative to Downtown Seattle and Bellevue CBD" },
      ],
      bestFit: [
        "Technology, startup, consulting, and administrative teams serving Eastside employee and customer geography.",
        "Companies that value parking, suburban access, and proximity to the Bellevue-Redmond business corridor.",
        "Teams comparing campus-style office patterns against urban tower or creative-office settings.",
      ],
      mayNotFit: [
        "Companies whose clients or employees are concentrated in central Seattle.",
        "Teams that need walkable downtown amenities or a formal Seattle business address.",
      ],
      buildingExperience: "A tour should test commute origins, parking needs, collaboration space, suite flexibility, and whether the location supports recruiting and customer geography.",
      locationContext: "The Eastside Tech Office Corridor is different from Bellevue CBD and Downtown Seattle. It is more suburban and workforce/campus-oriented, with different tradeoffs around walkability, image, and commute geography.",
      advantages: [
        "Adds technology-corridor office depth to Seattle's office ecosystem.",
        "Supports comparison between Bellevue, Redmond/Kirkland, and Downtown Seattle.",
        "Represents an office model where workforce geography and campus adjacency matter.",
      ],
      tradeoffs: [
        "Suburban access may be weaker for clients or employees centered in Seattle.",
        "The setting may provide less downtown image and walkable amenity density.",
        "Transit, parking, and suite control should be confirmed by building.",
      ],
      operationalProfile: [
        { label: "Workforce access", summary: "Eastside technology users should validate employee commute patterns, parking, and proximity to customers or partner campuses." },
        { label: "Growth and collaboration", summary: "Suite flexibility, collaboration space, connectivity, and expansion options should be tested before assuming fit." },
      ],
      environmentExplanation: {
        whyItExists: "Suburban office campus environments exist because some teams need workforce access, parking, larger-format planning, and proximity to technology corridors more than dense downtown identity.",
        whyChooseThisEnvironment: "Choose this environment over Downtown Seattle when Eastside workforce and technology corridor access matter more than central-city image or transit.",
        representativeValue: "Redmond Center anchors Seattle's Eastside technology-corridor office story.",
      },
      relatedDistricts: [{ districtId: "bellevue-cbd-office", reason: "More polished Eastside CBD alternative." }],
      validationNotes: ["Validate employee commute geography.", "Confirm parking and visitor access.", "Review suite flexibility and expansion options.", "Confirm connectivity and collaboration-space needs."],
      sourceNotes: ["Existing Rofo canonical record identifies 2525 152nd Ave NE as office space in a business development corridor between Bellevue and Redmond."],
    },
  }),
  record({
    name: "255 S King St",
    address: "255 S King St",
    city: "Seattle",
    districtKey: "sodo",
    buildingType: "Urban industrial-edge office",
    primarySpaceType: "office",
    assetClass: "Representative Industrial & Flex Building",
    editorialRole: "Urban Industrial Environment",
    editorialReason: "Represents the SODO-adjacent urban edge where central access and nearby industrial geography shape operational validation questions.",
    representativeThemes: ["Urban industrial edge", "SODO adjacency", "Office-to-industrial comparison"],
    businessFit: ["building services", "equipment service", "urban service operations"],
    relatedDistrictPaths: [districts.kentValley.path, districts.downtownSeattle.path],
    nearbyBuildingPaths: [buildingPath("WA", "Seattle", "450 Alaskan Way S"), buildingPath("WA", "Kent", "7818 S 212th St")],
    comparisonBuildingPaths: [buildingPath("WA", "Kent", "7818 S 212th St"), buildingPath("WA", "Seattle", "1455 NW Leary Way"), buildingPath("WA", "Seattle", "701 Fifth Avenue")],
    brief: {
      primaryEcosystem: "industrial_flex",
      ecosystemSubtypes: ["small_bay_industrial", "flex"],
      representativeRole: "urban_industrial_environment",
      businessActivities: ["knowledge_work", "storage", "service_dispatch"],
      businessArchetypes: ["building_services_company", "equipment_service_company"],
      operationalCharacteristics: ["urban_core_access", "industrial_identity", "loading_constrained", "transit_access"],
      fitSummary: "Useful as a validation-oriented example for businesses comparing urban access with operational industrial requirements.",
      summary: "255 S King St helps explain the SODO-adjacent edge between central office use and Seattle industrial geography. It is not a substitute for validating loading, storage, parking, or permitted operational use.",
      rofoTake: "This profile keeps Seattle's industrial/flex coverage honest by showing a central urban-edge example without treating district compatibility as verified property capability.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial / flex" },
        { label: "Business use", value: "Urban industrial-edge environment" },
        { label: "District", value: "SODO Industrial" },
        { label: "Validation role", value: "Central access versus operational utility" },
      ],
      bestFit: [
        "Businesses comparing central access against more operations-forward SODO, Georgetown, or Kent industrial settings.",
        "Service or support teams that need to understand whether office-oriented space can realistically support operational needs.",
      ],
      mayNotFit: ["Users that require verified loading, yard, clear height, or production infrastructure without property-level confirmation."],
      buildingExperience: "A tour should focus on whether the available suite can support the actual operating pattern, not just whether the district feels compatible.",
      locationContext: "SODO is useful for urban industrial access, but this building should be compared against Kent Valley for larger warehouse/distribution needs and Downtown Seattle for pure office needs.",
      advantages: ["Explains central Seattle industrial-edge tradeoffs.", "Adds a Building Profile for a previously uncovered Seattle representative building."],
      tradeoffs: ["The canonical source is office-oriented, so operational use must be validated directly.", "Urban access may come with loading, parking, and storage constraints."],
      operationalProfile: [{ label: "Validation-led fit", summary: "Permitted use, loading, storage, parking, and operational access should be confirmed before treating similar space as industrial/flex fit." }],
      environmentExplanation: {
        whyItExists: "Urban industrial-edge environments exist where office, service, warehouse, stadium-area, port, and downtown access overlap.",
        whyChooseThisEnvironment: "Choose this environment only when central access matters and the exact operational requirements can be validated. Compare Kent Valley when warehouse utility matters more.",
        representativeValue: "255 S King St gives Seattle a cautious SODO-edge Building Profile.",
      },
      validationNotes: ["Confirm permitted use.", "Validate loading access.", "Confirm parking allocation.", "Validate storage and operational compatibility."],
      sourceNotes: ["Existing Rofo canonical record identifies 255 S King St as office space; industrial/flex value is contextual and validation-led."],
    },
  }),
  record({
    name: "1455 NW Leary Way",
    address: "1455 NW Leary Way",
    city: "Seattle",
    districtKey: "ballardInterbay",
    buildingType: "Creative flex-edge office",
    primarySpaceType: "office",
    assetClass: "Representative Industrial & Flex Building",
    editorialRole: "Flex Business Park",
    editorialReason: "Represents Ballard's office/flex edge where creative workspace and industrial-neighborhood context overlap.",
    representativeThemes: ["Ballard", "Creative workspace", "Industrial neighborhood", "Flex comparison"],
    businessFit: ["creative studios", "equipment service", "building services"],
    relatedDistrictPaths: [districts.sodo.path, districts.belltown.path],
    nearbyBuildingPaths: [buildingPath("WA", "Seattle", "1448 NW Market St"), buildingPath("WA", "Seattle", "2815 Elliott Ave")],
    comparisonBuildingPaths: [buildingPath("WA", "Seattle", "255 S King St"), buildingPath("WA", "Kent", "7818 S 212th St"), buildingPath("WA", "Seattle", "2815 Elliott Ave")],
    brief: {
      primaryEcosystem: "industrial_flex",
      ecosystemSubtypes: ["flex", "small_bay_industrial"],
      representativeRole: "flex_business_park",
      businessActivities: ["knowledge_work", "service_dispatch", "storage", "customer_showroom"],
      businessArchetypes: ["creative_studio", "equipment_service_company", "building_services_company"],
      operationalCharacteristics: ["flexible_suite_sizes", "creative_environment", "industrial_identity", "urban_core_access"],
      fitSummary: "Useful for businesses comparing creative office/flex identity with practical operational validation needs.",
      summary: "1455 NW Leary Way helps explain Ballard's office/flex edge. It is useful for teams that value creative waterfront identity and industrial-neighborhood context, while still needing to validate whether the suite can support real operational requirements.",
      rofoTake: "This profile gives Seattle's industrial/flex coverage a north Seattle flex example without overstating loading, storage, or production capability.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial / flex" },
        { label: "Business use", value: "Creative flex-edge environment" },
        { label: "District", value: "Ballard / Interbay Industrial" },
        { label: "Comparison role", value: "Creative office/flex versus deeper industrial utility" },
      ],
      bestFit: [
        "Creative, service, or equipment-support teams comparing office-heavy flex with more utilitarian industrial environments.",
        "Businesses that need north Seattle access and want to test whether a creative workspace can support light operational needs.",
      ],
      mayNotFit: ["Users that need verified loading, yard, production infrastructure, or high storage efficiency."],
      buildingExperience: "A tour should test whether the creative environment supports the business while leaving enough practical utility for equipment, storage, dispatch, or customer access needs.",
      locationContext: "Ballard/Interbay differs from SODO and Kent Valley by offering north Seattle identity and creative-industrial adjacency rather than larger-scale distribution utility.",
      advantages: ["Adds a north Seattle flex Building Profile.", "Explains creative-industrial adjacency without treating it as verified production fit."],
      tradeoffs: ["Office-heavy flex may offer better image than storage efficiency.", "Operational requirements must be validated suite by suite."],
      operationalProfile: [{ label: "Office/flex balance", summary: "Businesses should validate storage, loading, parking, customer access, and office-to-operational ratio before shortlisting similar space." }],
      environmentExplanation: {
        whyItExists: "Flex-edge environments exist because some businesses need office, brand, collaboration, storage, service, or light operational functions to coexist.",
        whyChooseThisEnvironment: "Choose this environment over Kent Valley when north Seattle identity and creative workspace matter more than warehouse scale.",
        representativeValue: "1455 NW Leary Way gives Seattle a Ballard/Interbay flex benchmark.",
      },
      validationNotes: ["Confirm permitted use.", "Validate loading and delivery access.", "Confirm parking allocation.", "Review office versus storage ratio."],
      sourceNotes: ["Existing Rofo canonical record describes 1455 NW Leary Way as creative workspace in Ballard and places it in an industrial neighborhood."],
    },
  }),
  record({
    name: "Kent - 212 Business Park",
    address: "7818 S 212th St",
    city: "Kent",
    districtKey: "kentValley",
    buildingType: "Industrial",
    primarySpaceType: "industrial",
    assetClass: "Representative Industrial & Flex Building",
    editorialRole: "Warehouse / Distribution Environment",
    editorialReason: "Represents the Seattle-area warehouse and distribution alternative businesses compare when central Seattle industrial districts are too constrained.",
    representativeThemes: ["Warehouse", "Distribution", "Kent Valley", "Regional access"],
    businessFit: ["distributors", "wholesalers", "importers", "e-commerce fulfillment"],
    relatedDistrictPaths: [districts.sodo.path, districts.ballardInterbay.path],
    nearbyBuildingPaths: [buildingPath("WA", "Seattle", "255 S King St")],
    comparisonBuildingPaths: [buildingPath("WA", "Seattle", "255 S King St"), buildingPath("WA", "Seattle", "1455 NW Leary Way")],
    brief: {
      primaryEcosystem: "industrial_flex",
      ecosystemSubtypes: ["warehouse", "distribution"],
      representativeRole: "warehouse_distribution_environment",
      businessActivities: ["receiving", "shipping", "distribution", "storage", "inventory_management"],
      businessArchetypes: ["distributor", "wholesaler", "importer", "ecommerce_fulfillment_business"],
      operationalCharacteristics: ["delivery_access", "regional_distribution_access", "industrial_identity"],
      fitSummary: "Useful for businesses comparing regional warehouse/distribution utility against central Seattle industrial or flex environments.",
      summary: "Kent - 212 Business Park helps explain Kent Valley as a Seattle-area industrial and distribution environment. It is useful for goods-based companies that need regional reach and industrial utility, while still requiring property-level validation of loading, parking, truck circulation, and clear height.",
      rofoTake: "This profile gives Seattle's industrial/flex coverage a true industrial Building Profile and distinguishes regional warehouse decisions from central-city flex examples.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial / flex" },
        { label: "Business use", value: "Warehouse and distribution environment" },
        { label: "District", value: "Kent Valley" },
        { label: "Comparison role", value: "Regional industrial alternative to central Seattle" },
      ],
      bestFit: [
        "Distributors, wholesalers, importers, fulfillment users, and warehouse operators comparing Seattle-area industrial geography.",
        "Service or goods-based companies that need more industrial utility than central Seattle office/flex examples can provide.",
      ],
      mayNotFit: ["Businesses whose customer or employee geography requires a central Seattle address.", "Users that need confirmed dock, clear-height, trailer, or yard specifications without direct validation."],
      buildingExperience: "A tour should prioritize loading, truck circulation, parking, clear height, suite configuration, permitted uses, and whether Kent Valley improves regional service geography.",
      locationContext: "Kent Valley is the regional industrial counterpoint to SODO, Ballard/Interbay, and office-heavy Seattle districts. It should be compared when operations matter more than central-city presence.",
      advantages: ["Adds a true industrial Building Profile to Seattle.", "Explains regional warehouse/distribution fit.", "Supports comparison with central Seattle industrial-edge examples."],
      tradeoffs: ["Regional industrial utility may be less convenient for central Seattle customers or employees.", "Operational details must be confirmed before treating the property as a distribution match."],
      operationalProfile: [{ label: "Distribution validation", summary: "Loading, truck circulation, clear height, parking allocation, and permitted use should be verified before relying on similar space." }],
      environmentExplanation: {
        whyItExists: "Warehouse and distribution environments exist because goods-based businesses need receiving, storage, shipping, and regional access in building formats that central office districts cannot provide.",
        whyChooseThisEnvironment: "Choose Kent Valley over SODO or Ballard/Interbay when warehouse utility and regional access matter more than central Seattle proximity.",
        representativeValue: "Kent - 212 Business Park gives Seattle's industrial/flex ecosystem a regional warehouse/distribution benchmark.",
      },
      validationNotes: ["Confirm loading configuration.", "Validate truck circulation.", "Confirm clear height.", "Confirm parking allocation.", "Review permitted uses."],
      sourceNotes: ["Existing Rofo canonical record identifies 7818 S 212th St as industrial space in Kent."],
    },
  }),
];

module.exports = {
  canonicalBuildings: records,
};
