module.exports = {
  "CA/san-francisco": {
    schemaVersion: "occupier-market-snapshot-v1",
    marketId: "san-francisco",
    title: "San Francisco Market Snapshot",
    commercialCharacter:
      "San Francisco is a dense, district-driven commercial market where office character, transit orientation, client access, neighborhood identity, and operating requirements can change materially within a few blocks.",
    businessDrivers: [
      "Technology, professional services, finance, design, healthcare-adjacent organizations, nonprofits, and neighborhood-serving businesses all create distinct location needs.",
      "The strongest business-location decisions usually start with district fit before moving into buildings, economics, and current availability.",
    ],
    propertyTypeContext: {
      office: "Office decisions often turn on the tradeoff between transit-oriented credibility, modern growth environments, creative/adaptive space, and boutique historic character.",
      retail: "Retail opportunities are highly neighborhood-specific, with customer patterns and street context mattering more than broad citywide averages.",
      industrial: "Industrial searches should separate Bayview's warehouse, distribution, food, contractor, fleet, and city-serving operations from Central Waterfront production, fabrication, maker, and practical-flex requirements.",
      flex: "Flex searches should distinguish operational flex in Bayview, production-led flex in Central Waterfront, and more adaptive office/R&D or creative environments in Dogpatch and selective SoMa buildings.",
    },
    keyDistricts: [
      { label: "Financial District", path: "/commercial-real-estate/CA/san-francisco/financial-district/" },
      { label: "SoMa", path: "/commercial-real-estate/CA/san-francisco/soma/" },
      { label: "Mission Bay", path: "/commercial-real-estate/CA/san-francisco/mission-bay/" },
      { label: "Jackson Square", path: "/commercial-real-estate/CA/san-francisco/jackson-square/" },
      { label: "South Beach", path: "/commercial-real-estate/CA/san-francisco/south-beach/" },
      { label: "Bayview Industrial", path: "/commercial-real-estate/CA/san-francisco/bayview-industrial/" },
      { label: "Central Waterfront", path: "/commercial-real-estate/CA/san-francisco/central-waterfront/" },
      { label: "Showplace Square", path: "/commercial-real-estate/CA/san-francisco/showplace-square/" },
      { label: "Potrero Hill", path: "/commercial-real-estate/CA/san-francisco/potrero-hill/" },
    ],
    businessLocationContext: [
      "Client-facing and professional users often need credible access and a meeting environment that matches the brand.",
      "Growth-oriented companies may value modern office environments, recruiting context, and room to evolve.",
      "Creative or design-led companies may place more weight on building character and neighborhood feel.",
      "Industrial and flex users should choose geography from the operating requirement: logistics and service access point toward Bayview, while urban production and prototyping point toward Central Waterfront.",
    ],
    nearbyMarkets: [
      { label: "Oakland", path: "/commercial-real-estate/CA/oakland/" },
      { label: "San Mateo", path: "/commercial-real-estate/CA/san-mateo/" },
      { label: "San Rafael", path: "/commercial-real-estate/CA/san-rafael/" },
    ],
    cta: {
      label: "See My Best-Fit Locations",
      href: "/find-locations/?city=San%20Francisco&state=CA&propertyType=office&source=market_snapshot",
    },
    sourceTrace: [
      "SF Office structured recommendation model",
      "SF Industrial/Flex public decision model",
      "Business Brief publishing system",
      "Location Knowledge Graph district records",
      "Representative building readiness work",
    ],
    lastReviewed: "2026-08-13",
  },
  "CO/denver": {
    schemaVersion: "occupier-market-snapshot-v1",
    marketId: "denver",
    title: "Denver Market Snapshot",
    commercialCharacter:
      "Denver office decisions often compare central-city access and client convenience with suburban or southeast-metro environments that support parking, regional access, and larger-team operating patterns.",
    businessDrivers: [
      "Professional services, technology, law, nonprofits, healthcare-adjacent organizations, and regional headquarters needs can point to different office districts.",
      "The most useful starting point is usually the business's access pattern: downtown credibility, creative central districts, Cherry Creek presence, or Denver Tech Center orientation.",
    ],
    propertyTypeContext: {
      office: "Office searches should compare Downtown Denver, LoDo, RiNo, Cherry Creek, Denver Tech Center, and Central Park by client access, talent access, environment, parking, and regional movement.",
      retail: "Retail decisions remain neighborhood- and corridor-specific and should be evaluated with customer geography and street context.",
      industrial: "Industrial and warehouse needs usually require a separate access, loading, and distribution analysis rather than office-district logic.",
      flex: "Flex needs should be evaluated by operational requirements, parking, and highway access before broader commercial image.",
    },
    keyDistricts: [
      { label: "Downtown Denver", path: "/commercial-real-estate/CO/denver/downtown-denver/" },
      { label: "LoDo", path: "/commercial-real-estate/CO/denver/lodo/" },
      { label: "RiNo", path: "/commercial-real-estate/CO/denver/rino/" },
      { label: "Cherry Creek", path: "/commercial-real-estate/CO/denver/cherry-creek/" },
      { label: "Denver Tech Center", path: "/commercial-real-estate/CO/denver/denver-tech-center/" },
    ],
    businessLocationContext: [
      "Central-city users often prioritize client convenience, transit, and access to Denver's professional ecosystem.",
      "Southeast-metro and regional users may place more weight on parking, highway access, and larger office footprints.",
      "Creative, nonprofit, and growth-company needs can make district character and talent access more important than a single central location.",
    ],
    nearbyMarkets: [
      { label: "Aurora", path: "/commercial-real-estate/CO/aurora/" },
      { label: "Lakewood", path: "/commercial-real-estate/CO/lakewood/" },
      { label: "Centennial", path: "/commercial-real-estate/CO/centennial/" },
    ],
    cta: {
      label: "See My Best-Fit Locations",
      href: "/find-locations/?city=Denver&state=CO&propertyType=office&source=market_snapshot",
    },
    sourceTrace: [
      "Denver Office editorial recommendation model",
      "Business Brief publishing readiness",
      "Location Knowledge Graph district records",
      "Representative building readiness work",
    ],
    lastReviewed: "2026-08-07",
  },
  "CA/antioch": {
    schemaVersion: "occupier-market-snapshot-v1",
    marketId: "antioch",
    title: "Antioch Market Snapshot",
    commercialCharacter:
      "Antioch is an East Contra Costa commercial market where warehouse, service, retail, and local business-space searches are shaped by suburban access, customer geography, and practical operating needs.",
    businessDrivers: [
      "Search demand is currently strongest around industrial, lease, and general commercial-space questions, while reviewed East 18th evidence provides a bounded local operating context.",
      "The useful distinction is practical warehouse or service-space requirements versus office, retail, and general commercial inquiries—not a citywide Industrial ranking.",
    ],
    propertyTypeContext: {
      office: "Office decisions should be treated as local-serving and access-driven until stronger district or representative-building evidence is available.",
      retail: "Retail searches should focus on customer access, visibility, parking, and corridor fit rather than broad marketwide assumptions.",
      industrial: "Warehouse and industrial searches should validate loading, storage, vehicle access, permitted use, and whether the business needs local service coverage or broader East Bay movement.",
      flex: "Flex requirements need property-level validation because office, storage, service, and light operational needs can be mixed in different proportions.",
    },
    businessLocationContext: [
      "For Industrial and warehouse users, East 18th provides reviewed local context while representative Industrial building evidence remains unresolved.",
      "Rofo can explain what to investigate without creating local recommendations, implying availability, or substituting Retail buildings as Industrial examples.",
    ],
    keyDistricts: [
      { label: "Antioch East 18th Industrial", path: "/commercial-real-estate/CA/antioch/antioch-east-18th-industrial/" },
    ],
    nearbyMarkets: [
      { label: "Concord", path: "/commercial-real-estate/CA/concord/" },
      { label: "Pittsburg", path: "/commercial-real-estate/CA/pittsburg/" },
      { label: "Brentwood", path: "/commercial-real-estate/CA/brentwood/" },
    ],
    cta: {
      label: "See My Best-Fit Locations",
      href: "/best-fit-locations/?city=Antioch&state=CA&spaceType=Industrial%20%2F%20Warehouse%20%2F%20Flex&source=city&sourcePath=%2Fcommercial-real-estate%2FCA%2Fantioch%2F&journey=new",
    },
    sourceTrace: [
      "EOS Search Mission #001",
      "Search Intelligence warehouse / industrial demand signal",
      "Existing generated city snapshot and Rofo city/building inventory coverage",
    ],
    lastReviewed: "2026-08-07",
  },
  "CO/aurora": {
    schemaVersion: "occupier-market-snapshot-v1",
    marketId: "aurora",
    title: "Aurora Market Snapshot",
    commercialCharacter:
      "Aurora is an east Denver metro commercial market where medical, service-commercial, office/flex, aerospace-adjacent, and industrial searches often depend on parking, highway access, customer geography, and airport-oriented movement.",
    businessDrivers: [
      "Aurora demand is showing district, industrial, and lease-oriented search signals, while Rofo already has Denver-area graph context that treats Aurora as an east-metro comparison point.",
      "The strongest near-term knowledge work is to separate Aurora's mixed office/medical/service identity from heavier warehouse and truck-oriented alternatives such as Northeast Denver Industrial, Commerce City, and the airport corridor.",
    ],
    propertyTypeContext: {
      office: "Office searches in Aurora often need local customer or employee geography, parking, and practical east-metro access rather than downtown executive image.",
      retail: "Retail and service uses should be evaluated by visibility, parking, neighborhood access, and customer geography.",
      industrial: "Industrial and warehouse needs can fit selectively in Aurora, but truck-heavy or yard-heavy users should compare Northeast Denver Industrial, Commerce City, and airport-corridor alternatives.",
      flex: "Office/flex and service-commercial users should validate office/warehouse mix, parking, loading, and whether the location serves Aurora or broader east-metro operations.",
    },
    keyDistricts: [
      { label: "Aurora", path: "/commercial-real-estate/CO/aurora/aurora/" },
      { label: "Northeast Denver Industrial", path: "/commercial-real-estate/CO/denver/northeast-denver-industrial/" },
      { label: "Denver Airport / Pena Boulevard Corridor", path: "/commercial-real-estate/CO/denver/denver-airport-pena-boulevard-corridor/" },
      { label: "Commerce City", path: "/commercial-real-estate/CO/commerce-city/commerce-city/" },
    ],
    businessLocationContext: [
      "Aurora is useful when the search is east-metro oriented and parking, local customer access, medical/service context, or airport adjacency matters.",
      "For heavier industrial searches, Aurora should be compared against more operational industrial corridors before a user assumes it is the strongest warehouse fit.",
    ],
    nearbyMarkets: [
      { label: "Denver", path: "/commercial-real-estate/CO/denver/" },
      { label: "Commerce City", path: "/commercial-real-estate/CO/commerce-city/" },
      { label: "Centennial", path: "/commercial-real-estate/CO/centennial/" },
    ],
    cta: {
      label: "See My Best-Fit Locations",
      href: "/find-locations/?city=Aurora&state=CO&propertyType=industrial&source=market_snapshot",
    },
    sourceTrace: [
      "EOS Search Mission #001",
      "Search Intelligence warehouse / industrial demand signal",
      "Denver Location Knowledge Graph Aurora and industrial corridor records",
      "Denver Industrial Space Guide source data",
    ],
    lastReviewed: "2026-08-07",
  },
  "IN/indianapolis": {
    schemaVersion: "occupier-market-snapshot-v1",
    marketId: "indianapolis",
    title: "Indianapolis Market Snapshot",
    commercialCharacter:
      "Indianapolis is a regional Midwest commercial market where broad commercial-space, industrial, and warehouse questions should be separated from office-only search behavior before Rofo publishes deeper guidance.",
    businessDrivers: [
      "Search Intelligence shows industrial and general-commercial demand, while reviewed Airport Logistics and representative-building evidence now provide a bounded starting context.",
      "That evidence supports occupier framing—what warehouse, distribution, service, and local business-space users need to validate—not district-level public recommendations.",
    ],
    propertyTypeContext: {
      office: "Current Rofo office context is stronger than curated industrial context, so office searches should remain general until district and building evidence improves.",
      retail: "Retail searches should be evaluated around customer geography, corridor visibility, parking, and local demand rather than citywide generalizations.",
      industrial: "Warehouse and industrial users should validate highway access, loading, storage, delivery patterns, employee geography, and whether the requirement is distribution, service, manufacturing, or flex.",
      flex: "Flex needs should be evaluated by the actual office/warehouse mix, loading, parking, and operational permissions.",
    },
    businessLocationContext: [
      "Indianapolis Airport Logistics is a reviewed operating context rather than a complete citywide Industrial decision universe.",
      "Representative buildings make the environment tangible, but loading, clear height, circulation, use, economics, and availability remain property-level questions.",
    ],
    keyDistricts: [
      { label: "Indianapolis Airport Logistics", path: "/commercial-real-estate/IN/indianapolis/indianapolis-airport-logistics/" },
    ],
    nearbyMarkets: [
      { label: "Carmel", path: "/commercial-real-estate/IN/carmel/" },
      { label: "Fishers", path: "/commercial-real-estate/IN/fishers/" },
      { label: "Plainfield", path: "/commercial-real-estate/IN/plainfield/" },
    ],
    cta: {
      label: "See My Best-Fit Locations",
      href: "/best-fit-locations/?city=Indianapolis&state=IN&spaceType=Industrial%20%2F%20Warehouse%20%2F%20Flex&source=city&sourcePath=%2Fcommercial-real-estate%2FIN%2Findianapolis%2F&journey=new",
    },
    sourceTrace: [
      "EOS Search Mission #001",
      "Search Intelligence warehouse / industrial demand signal",
      "Existing generated city snapshot and Rofo city/building inventory coverage",
    ],
    lastReviewed: "2026-08-07",
  },
  "IN/fort-wayne": {
    schemaVersion: "occupier-market-snapshot-v1",
    marketId: "fort-wayne",
    title: "Fort Wayne Market Snapshot",
    commercialCharacter:
      "Fort Wayne is a Northeast Indiana commercial market where general commercial-space demand now needs a clearer warehouse and industrial foundation before Rofo can publish deeper occupier guidance.",
    businessDrivers: [
      "Search Intelligence shows Fort Wayne demand around general commercial real estate, lease and availability language, building/address queries, and direct warehouse or industrial searches.",
      "The most defensible first warehouse / industrial geography is the airport and Airport Expressway area, where official airport and economic-development sources support an industrial, logistics, and business-park context.",
    ],
    propertyTypeContext: {
      office: "Office questions should remain general until Rofo has stronger Fort Wayne office district and representative-building evidence.",
      retail: "Retail demand is visible in search, but retail-depth work is outside this warehouse / industrial foundation mission and should be assessed separately.",
      industrial: "Warehouse and industrial searches should begin by validating airport-area access, loading, truck movement, yard or trailer needs, and whether the use is storage, distribution, service-industrial, or light operations.",
      flex: "Flex requirements should be treated as property-specific office/warehouse or service-commercial searches until more Fort Wayne flex evidence is acquired.",
    },
    businessLocationContext: [
      "Fort Wayne is now foundation-stage rather than unmapped for warehouse / industrial work.",
      "The airport and Airport Expressway area is the first source-supported warehouse / industrial geography for future Fort Wayne evidence work.",
      "Representative industrial examples should be used to frame what to validate, not as live availability claims.",
      "Public business-type guides should remain deferred until Rofo has broader district, building, and property-type evidence.",
    ],
    nearbyMarkets: [
      { label: "Indianapolis", path: "/commercial-real-estate/IN/indianapolis/" },
      { label: "South Bend", path: "/commercial-real-estate/IN/south-bend/" },
      { label: "Toledo", path: "/commercial-real-estate/OH/toledo/" },
    ],
    cta: {
      label: "See My Best-Fit Locations",
      href: "/find-locations/?city=Fort%20Wayne&state=IN&propertyType=industrial&source=market_snapshot",
    },
    sourceTrace: [
      "EOS Mission #002",
      "Search Intelligence Fort Wayne warehouse / industrial demand signal",
      "Fort Wayne International Airport Air Trade Centre source material",
      "Greater Fort Wayne / Allen County economic-development source material",
      "Fort Wayne Airport Industrial Commercial Market Evidence collection",
    ],
    lastReviewed: "2026-08-07",
  },
  "AZ/tempe": {
    schemaVersion: "occupier-market-snapshot-v1",
    marketId: "tempe",
    title: "Tempe Market Snapshot",
    commercialCharacter:
      "Tempe is a Phoenix-area commercial market where office, flex, service, and industrial-adjacent searches often need to be compared against broader metro alternatives before a business chooses a specific location.",
    businessDrivers: [
      "Search Mission evidence shows Tempe contributing to warehouse and industrial demand, and reviewed I-10 evidence now provides a cautious Tempe-specific operating context.",
      "Industrial and Flex still require different property questions, and broader Phoenix-area links provide orientation rather than a calibrated market comparison.",
    ],
    propertyTypeContext: {
      office: "Tempe office searches should compare access, workplace character, parking, and proximity to nearby Phoenix-area business nodes.",
      retail: "Retail and service decisions should focus on corridor visibility, customer access, parking, and the role of nearby activity centers.",
      industrial: "Industrial and warehouse searches should validate whether Tempe itself fits the operating need or whether a broader Phoenix-area industrial corridor is more appropriate.",
      flex: "Flex users should test office/warehouse mix, service access, loading, parking, and employee/customer geography before relying on office-oriented buildings.",
    },
    businessLocationContext: [
      "Tempe I-10 Industrial and its representative office/warehouse example make the operating context tangible without completing the market.",
      "Additional properties and local comparison evidence are still required before Rofo can rank Tempe against broader Phoenix-area alternatives.",
    ],
    keyDistricts: [
      { label: "Tempe I-10 Industrial", path: "/commercial-real-estate/AZ/tempe/tempe-i-10-industrial/" },
    ],
    nearbyMarkets: [
      { label: "Phoenix", path: "/commercial-real-estate/AZ/phoenix/" },
      { label: "Scottsdale", path: "/commercial-real-estate/AZ/scottsdale/" },
      { label: "Mesa", path: "/commercial-real-estate/AZ/mesa/" },
    ],
    cta: {
      label: "See My Best-Fit Locations",
      href: "/best-fit-locations/?city=Tempe&state=AZ&spaceType=Industrial%20%2F%20Warehouse%20%2F%20Flex&source=city&sourcePath=%2Fcommercial-real-estate%2FAZ%2Ftempe%2F&journey=new",
    },
    sourceTrace: [
      "EOS Search Mission #001",
      "Search Intelligence warehouse / industrial demand signal",
      "Existing generated city snapshot and Rofo city/building inventory coverage",
    ],
    lastReviewed: "2026-08-07",
  },
};
