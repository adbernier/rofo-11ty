module.exports = {
  "CA/san-francisco": {
    schemaVersion: "occupier-market-snapshot-v1",
    marketId: "san-francisco",
    title: "San Francisco Market Snapshot",
    commercialCharacter:
      "San Francisco is a dense, district-driven commercial market where office character, transit orientation, client access, and neighborhood identity can change materially within a few blocks.",
    businessDrivers: [
      "Technology, professional services, finance, design, healthcare-adjacent organizations, nonprofits, and neighborhood-serving businesses all create distinct location needs.",
      "The strongest business-location decisions usually start with district fit before moving into buildings, economics, and current availability.",
    ],
    propertyTypeContext: {
      office: "Office decisions often turn on the tradeoff between transit-oriented credibility, modern growth environments, creative/adaptive space, and boutique historic character.",
      retail: "Retail opportunities are highly neighborhood-specific, with customer patterns and street context mattering more than broad citywide averages.",
      industrial: "Warehouse and light industrial needs are more selective within San Francisco and often require careful review of access, loading, and operational fit.",
      flex: "Flex and mixed-use needs tend to depend on the balance between workspace, production, access, and neighborhood compatibility.",
    },
    keyDistricts: [
      { label: "Financial District", path: "/commercial-real-estate/CA/san-francisco/financial-district/" },
      { label: "SoMa", path: "/commercial-real-estate/CA/san-francisco/soma/" },
      { label: "Mission Bay", path: "/commercial-real-estate/CA/san-francisco/mission-bay/" },
      { label: "Jackson Square", path: "/commercial-real-estate/CA/san-francisco/jackson-square/" },
      { label: "South Beach", path: "/commercial-real-estate/CA/san-francisco/south-beach/" },
    ],
    businessLocationContext: [
      "Client-facing and professional users often need credible access and a meeting environment that matches the brand.",
      "Growth-oriented companies may value modern office environments, recruiting context, and room to evolve.",
      "Creative or design-led companies may place more weight on building character and neighborhood feel.",
    ],
    nearbyMarkets: [
      { label: "Oakland", path: "/commercial-real-estate/CA/oakland/" },
      { label: "San Mateo", path: "/commercial-real-estate/CA/san-mateo/" },
      { label: "San Rafael", path: "/commercial-real-estate/CA/san-rafael/" },
    ],
    cta: {
      label: "Create My Location Brief",
      href: "/find-locations/?city=San%20Francisco&state=CA&propertyType=office&source=market_snapshot",
    },
    sourceTrace: [
      "SF Office structured recommendation model",
      "Business Brief publishing system",
      "Location Knowledge Graph district records",
      "Representative building readiness work",
    ],
    lastReviewed: "2026-08-07",
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
      label: "Create My Location Brief",
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
};
