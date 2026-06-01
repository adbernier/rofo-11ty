const integrationsByPath = {
  "/commercial-real-estate/CA/san-francisco/mission-bay/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare nearby commercial districts",
    intro:
      "Use these relationships to read Mission Bay as a newer institutional and life-science-oriented commercial district, and to compare it with adaptive, boutique, and downtown office alternatives nearby.",
    districts: [
      {
        name: "SoMa",
        url: "/commercial-real-estate/CA/san-francisco/soma/",
        relationship_type: "Adaptive contrast",
        note:
          "Broader and more adaptive-commercial, with older warehouse-office texture, larger mixed-use blocks, and stronger central San Francisco overlap.",
      },
      {
        name: "Dogpatch",
        relationship_type: "Southern edge",
        note:
          "More neighborhood-scaled and production-adjacent south of Mission Bay, useful for understanding the shift toward Central Waterfront commercial geography.",
      },
      {
        name: "Design District / Showplace Square",
        relationship_type: "Showroom and flex contrast",
        note:
          "More showroom, flex, and adaptive-industrial than Mission Bay's newer institutional and life-science-oriented setting.",
      },
      {
        name: "Financial District SF",
        url: "/commercial-real-estate/CA/san-francisco/financial-district/",
        relationship_type: "Downtown core contrast",
        note:
          "More formal, vertical, and client-facing, with traditional office-core geography rather than newer institutional waterfront development.",
      },
    ],
  },
  "/commercial-real-estate/CA/san-francisco/jackson-square/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare nearby downtown-edge districts",
    intro:
      "Use these relationships to read Jackson Square as a historic boutique office edge near the Financial District, not as a generic historic or visitor district.",
    districts: [
      {
        name: "Financial District SF",
        url: "/commercial-real-estate/CA/san-francisco/financial-district/",
        relationship_type: "Office-core contrast",
        note:
          "More formal, vertical, and transit-centered immediately south of Jackson Square, with stronger large-office and client-facing downtown identity.",
      },
      {
        name: "Embarcadero",
        relationship_type: "Waterfront edge",
        note:
          "Adds ferry, waterfront, and downtown edge context to Jackson Square's smaller historic commercial fabric.",
      },
      {
        name: "North Beach",
        relationship_type: "Neighborhood edge",
        note:
          "More neighborhood-commercial and visitor-facing to the north, with less direct office-core identity.",
      },
      {
        name: "Chinatown",
        relationship_type: "Historic urban context",
        note:
          "A dense historic district nearby that helps explain the northern downtown edge, but differs from Jackson Square's boutique office role.",
      },
      {
        name: "SoMa",
        url: "/commercial-real-estate/CA/san-francisco/soma/",
        relationship_type: "Scale and form contrast",
        note:
          "Broader and more mixed-use south of Market Street, with larger adaptive and creative-office environments.",
      },
    ],
  },
  "/commercial-real-estate/CA/san-francisco/financial-district/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare nearby downtown districts",
    intro:
      "Use these relationships to read the Financial District as San Francisco's formal downtown office core, and to compare it with nearby districts that shift toward mixed-use, boutique, visitor-facing, waterfront, or cross-bay business settings.",
    districts: [
      {
        name: "SoMa",
        url: "/commercial-real-estate/CA/san-francisco/soma/",
        relationship_type: "Commercial contrast",
        note:
          "Broader, more mixed-use, and more adaptive-commercial south of Market Street; useful as the clearest contrast to the Financial District's tighter office-core form.",
      },
      {
        name: "Jackson Square",
        url: "/commercial-real-estate/CA/san-francisco/jackson-square/",
        relationship_type: "Adjacent edge",
        note:
          "Immediately north and smaller-scale, with historic commercial buildings and a more boutique office texture near the formal downtown core.",
      },
      {
        name: "Embarcadero",
        relationship_type: "Urban context",
        note:
          "The waterfront and ferry edge of the district, important for transit access, client meetings, and the Financial District's eastern downtown identity.",
      },
      {
        name: "Union Square",
        url: "/commercial-real-estate/CA/san-francisco/union-square/",
        relationship_type: "Visitor-facing contrast",
        note:
          "A nearby retail, hotel, and visitor-serving district that contrasts with the Financial District's office and professional-service concentration.",
      },
      {
        name: "Mission Bay",
        url: "/commercial-real-estate/CA/san-francisco/mission-bay/",
        relationship_type: "Search alternative",
        note:
          "A newer southern waterfront district to compare when teams want modern office, institutional, or life-science-adjacent context rather than a traditional downtown core.",
      },
      {
        name: "Downtown Oakland",
        url: "/commercial-real-estate/CA/oakland/downtown-oakland/",
        relationship_type: "Cross-bay comparison",
        note:
          "An East Bay business district with civic adjacency, BART access, and a practical cross-bay comparison for formal office and professional-service users.",
      },
    ],
  },
  "/commercial-real-estate/CA/oakland/downtown-oakland/": {
    eyebrow: "Nearby commercial districts",
    heading: "Explore nearby commercial districts",
    intro:
      "Use these nearby districts to compare Downtown Oakland's civic, transit-oriented office core with other East Bay and cross-bay business settings.",
    districts: [
      {
        name: "Uptown Oakland",
        url: "/commercial-real-estate/CA/oakland/uptown-oakland/",
        relationship_type: "Mixed-use contrast",
        note:
          "More mixed-use and smaller-company oriented, with stronger arts, food, and Lake Merritt-adjacent context.",
      },
      {
        name: "Jack London Square",
        url: "/commercial-real-estate/CA/oakland/jack-london-square/",
        relationship_type: "Waterfront contrast",
        note:
          "More waterfront and warehouse-adjacent, with service-commercial and adaptive commercial texture.",
      },
      {
        name: "Financial District SF",
        url: "/commercial-real-estate/CA/san-francisco/financial-district/",
        relationship_type: "Cross-bay comparison",
        note:
          "A more traditional regional business district across the bay, with stronger downtown client-facing office presence.",
      },
      {
        name: "Emeryville Commercial Core",
        url: "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/",
        relationship_type: "Office/life-science alternative",
        note:
          "A compact mixed office and life-science-oriented node between Oakland and Berkeley.",
      },
      {
        name: "Downtown Walnut Creek",
        url: "/commercial-real-estate/CA/walnut-creek/downtown-walnut-creek/",
        relationship_type: "Suburban downtown contrast",
        note:
          "A more polished suburban downtown office and retail core for Contra Costa and client-facing users.",
      },
    ],
  },
  "/commercial-real-estate/CA/oakland/uptown-oakland/": {
    eyebrow: "Nearby commercial districts",
    heading: "Explore nearby commercial districts",
    intro:
      "Compare Uptown Oakland with nearby districts that offer different mixes of office formality, waterfront context, and East Bay street-level activity.",
    districts: [
      {
        name: "Downtown Oakland",
        url: "/commercial-real-estate/CA/oakland/downtown-oakland/",
        relationship_type: "Formal core contrast",
        note:
          "More formal, civic, and traditional office-core oriented, with stronger Broadway and City Center context.",
      },
      {
        name: "Jack London Square",
        url: "/commercial-real-estate/CA/oakland/jack-london-square/",
        relationship_type: "Waterfront contrast",
        note:
          "More waterfront and service-commercial, with warehouse-adjacent texture south of the downtown core.",
      },
      {
        name: "Temescal",
        relationship_type: "Neighborhood-commercial contrast",
        note:
          "More neighborhood retail and small-business oriented north of Uptown, with less formal office concentration.",
      },
    ],
  },
  "/commercial-real-estate/CA/oakland/jack-london-square/": {
    eyebrow: "Nearby commercial districts",
    heading: "Explore nearby commercial districts",
    intro:
      "Compare Jack London Square with nearby Oakland districts that offer different balances of waterfront context, civic office concentration, and mixed-use street life.",
    districts: [
      {
        name: "Downtown Oakland",
        url: "/commercial-real-estate/CA/oakland/downtown-oakland/",
        relationship_type: "Civic core contrast",
        note:
          "More civic, institutional, and transit-focused, with stronger Broadway and City Center office context.",
      },
      {
        name: "Uptown Oakland",
        url: "/commercial-real-estate/CA/oakland/uptown-oakland/",
        relationship_type: "Mixed-use contrast",
        note:
          "More mixed-use and arts-adjacent, with BART access, food, apartments, and Lake Merritt-adjacent office blocks.",
      },
      {
        name: "Old Oakland",
        url: "/commercial-real-estate/CA/oakland/old-oakland/",
        relationship_type: "Historic edge",
        note:
          "Smaller-scale and historic, with downtown-adjacent commercial blocks just north of the waterfront district.",
      },
    ],
  },
  "/commercial-real-estate/CA/oakland/old-oakland/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare nearby Oakland districts",
    intro:
      "Use these relationships to read Old Oakland as historic downtown connective tissue between Oakland's civic office core and waterfront commercial districts.",
    districts: [
      {
        name: "Downtown Oakland",
        url: "/commercial-real-estate/CA/oakland/downtown-oakland/",
        relationship_type: "Civic core contrast",
        note:
          "More formal, institutional, and BART-centered, with stronger Broadway and City Center office concentration.",
      },
      {
        name: "Jack London Square",
        url: "/commercial-real-estate/CA/oakland/jack-london-square/",
        relationship_type: "Waterfront transition",
        note:
          "More waterfront and adaptive-commercial to the south, making Old Oakland a useful transition district between downtown and the estuary edge.",
      },
      {
        name: "Uptown Oakland",
        url: "/commercial-real-estate/CA/oakland/uptown-oakland/",
        relationship_type: "Mixed-use contrast",
        note:
          "More arts-adjacent and Lake Merritt oriented, with a different office, food, housing, and street-level mix north of the core.",
      },
      {
        name: "Lake Merritt",
        relationship_type: "Urban context",
        note:
          "A nearby mixed-use and civic-residential edge that contrasts with Old Oakland's historic commercial transition role.",
      },
    ],
  },
  "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/": {
    eyebrow: "Nearby commercial districts",
    heading: "Explore nearby commercial districts",
    intro:
      "Compare Downtown Palo Alto with Peninsula districts and corridors that offer different balances of walkability, client presence, and R&D-oriented commercial context.",
    districts: [
      {
        name: "Downtown Mountain View",
        url: "/commercial-real-estate/CA/mountain-view/downtown-mountain-view/",
        relationship_type: "Corridor alternative",
        note:
          "Another Caltrain-oriented Peninsula downtown with broader Mountain View startup and office context.",
      },
      {
        name: "Downtown Redwood City",
        url: "/commercial-real-estate/CA/redwood-city/downtown-redwood-city/",
        relationship_type: "Mid-Peninsula comparison",
        note:
          "A larger mid-Peninsula downtown with stronger civic, entertainment, and Caltrain-adjacent commercial context.",
      },
      {
        name: "Stanford Research Park",
        url: "/commercial-real-estate/CA/palo-alto/stanford-research-park/",
        relationship_type: "Local format contrast",
        note:
          "More R&D, research-park, and campus-oriented than Downtown Palo Alto's walkable professional office core.",
      },
    ],
  },
  "/commercial-real-estate/GA/atlanta/buckhead/": {
    eyebrow: "Nearby commercial districts",
    heading: "Explore nearby commercial districts",
    intro:
      "Compare Buckhead with nearby Atlanta business districts that offer different balances of executive access, transit, freeway orientation, and urban core proximity.",
    districts: [
      {
        name: "Midtown Atlanta",
        url: "/commercial-real-estate/GA/atlanta/midtown/",
        note:
          "Denser and more transit-oriented, with stronger university, apartment, arts, and mixed-use overlap.",
      },
      {
        name: "Perimeter Center",
        url: "/commercial-real-estate/GA/atlanta/perimeter-center/",
        note:
          "More suburban and parking-driven, with stronger freeway commute logic around I-285 and GA 400.",
      },
      {
        name: "Cumberland / Galleria",
        url: "/commercial-real-estate/GA/atlanta/cumberland-galleria/",
        note:
          "A northwest office-retail node often considered by companies prioritizing freeway access and event-adjacent activity.",
      },
    ],
  },
  "/commercial-real-estate/GA/atlanta/midtown/": {
    eyebrow: "Nearby commercial districts",
    heading: "Explore nearby commercial districts",
    intro:
      "Use these districts to compare Midtown Atlanta's central, transit-oriented mixed-use setting with other Atlanta business locations.",
    districts: [
      {
        name: "Buckhead",
        url: "/commercial-real-estate/GA/atlanta/buckhead/",
        note:
          "More executive-facing and northside-oriented, with stronger client-facing retail and hospitality support.",
      },
      {
        name: "Downtown Atlanta",
        url: "/commercial-real-estate/GA/atlanta/downtown-atlanta/",
        note:
          "More civic, legal, government, convention, and traditional central business district oriented.",
      },
      {
        name: "West Midtown",
        url: "/commercial-real-estate/GA/atlanta/west-midtown/",
        note:
          "More adaptive-reuse, showroom, and creative-commercial, with a more westside and car-oriented pattern.",
      },
    ],
  },
};

Object.assign(integrationsByPath, {
  "/commercial-real-estate/CA/san-jose/north-san-jose/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare South Bay alternatives",
    intro:
      "Use these relationships to read North San Jose as a broad office, R&D, and flex corridor rather than a downtown or neighborhood district.",
    districts: [
      {
        name: "Santa Clara Tech Core",
        url: "/commercial-real-estate/CA/santa-clara/santa-clara-office-tech-core/",
        relationship_type: "Office/tech alternative",
        note: "A more established Santa Clara technology-office and campus context west of North San Jose.",
      },
      {
        name: "Moffett Park",
        url: "/commercial-real-estate/CA/sunnyvale/moffett-park/",
        relationship_type: "Innovation-campus comparison",
        note: "A more concentrated Sunnyvale innovation district for large office and technology-campus users.",
      },
      {
        name: "Milpitas Industrial",
        url: "/commercial-real-estate/CA/milpitas/milpitas-industrial/",
        relationship_type: "Industrial/flex contrast",
        note: "More directly warehouse/flex and service-commercial along I-880 and 237.",
      },
      {
        name: "Downtown San Jose",
        url: "/commercial-real-estate/CA/san-jose/downtown-san-jose/",
        relationship_type: "Urban core contrast",
        note: "More walkable, transit-oriented, civic, and downtown-office oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/san-jose/downtown-san-jose/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare San Jose business settings",
    intro:
      "Compare Downtown San Jose's urban office and civic context with nearby South Bay technology and flex corridors.",
    districts: [
      {
        name: "North San Jose",
        url: "/commercial-real-estate/CA/san-jose/north-san-jose/",
        relationship_type: "Technology corridor contrast",
        note: "Broader, more campus- and R&D/flex-oriented than the downtown core.",
      },
      {
        name: "Santa Clara Tech Core",
        url: "/commercial-real-estate/CA/santa-clara/santa-clara-office-tech-core/",
        relationship_type: "Office/tech alternative",
        note: "More campus-oriented and central South Bay technology-office focused.",
      },
    ],
  },
  "/commercial-real-estate/CA/santa-clara/santa-clara-office-tech-core/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare nearby technology districts",
    intro:
      "Use these districts to compare Santa Clara's technology-office core with adjacent South Bay office, R&D, and campus environments.",
    districts: [
      {
        name: "North San Jose",
        url: "/commercial-real-estate/CA/san-jose/north-san-jose/",
        relationship_type: "R&D/flex corridor contrast",
        note: "Broader and more corridor-like, with stronger airport and mixed office/flex geography.",
      },
      {
        name: "Moffett Park",
        url: "/commercial-real-estate/CA/sunnyvale/moffett-park/",
        relationship_type: "Innovation-campus comparison",
        note: "More concentrated as a Sunnyvale innovation and technology-campus district.",
      },
      {
        name: "Great America / Tasman",
        url: "/commercial-real-estate/CA/santa-clara/great-america-tasman/",
        relationship_type: "Local node",
        note: "A Santa Clara subdistrict around light rail, Great America Parkway, and large campus buildings.",
      },
    ],
  },
  "/commercial-real-estate/CA/santa-clara/great-america-tasman/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Santa Clara nodes",
    intro:
      "Great America / Tasman works best as a focused relationship node within Santa Clara's broader office and technology geography.",
    districts: [
      {
        name: "Santa Clara Tech Core",
        url: "/commercial-real-estate/CA/santa-clara/santa-clara-office-tech-core/",
        relationship_type: "Broader market context",
        note: "The larger Santa Clara office/tech market beyond the Great America and Tasman node.",
      },
      {
        name: "North San Jose",
        url: "/commercial-real-estate/CA/san-jose/north-san-jose/",
        relationship_type: "Adjacent corridor",
        note: "A nearby office, R&D, and flex corridor with stronger airport and San Jose access.",
      },
    ],
  },
  "/commercial-real-estate/CA/sunnyvale/moffett-park/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare innovation-campus districts",
    intro:
      "Compare Moffett Park with nearby South Bay districts that offer different office, campus, and R&D/flex tradeoffs.",
    districts: [
      {
        name: "North Bayshore",
        url: "/commercial-real-estate/CA/mountain-view/north-bayshore/",
        relationship_type: "Adjacent campus comparison",
        note: "A Mountain View technology-campus district with stronger major-employer identity.",
      },
      {
        name: "Santa Clara Tech Core",
        url: "/commercial-real-estate/CA/santa-clara/santa-clara-office-tech-core/",
        relationship_type: "Central South Bay alternative",
        note: "A broader Santa Clara office/tech core with more central South Bay access.",
      },
      {
        name: "North San Jose",
        url: "/commercial-real-estate/CA/san-jose/north-san-jose/",
        relationship_type: "Corridor alternative",
        note: "Larger and more mixed across office, R&D, flex, airport, and freeway access.",
      },
    ],
  },
  "/commercial-real-estate/CA/mountain-view/north-bayshore/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Mountain View and Sunnyvale campus settings",
    intro:
      "Use these relationships to place North Bayshore within the South Bay technology-campus graph.",
    districts: [
      {
        name: "Moffett Park",
        url: "/commercial-real-estate/CA/sunnyvale/moffett-park/",
        relationship_type: "Adjacent innovation district",
        note: "A nearby Sunnyvale campus district with broader innovation-district comparison value.",
      },
      {
        name: "Downtown Mountain View",
        url: "/commercial-real-estate/CA/mountain-view/downtown-mountain-view/",
        relationship_type: "Downtown contrast",
        note: "More walkable, Caltrain-oriented, and smaller-company friendly than North Bayshore.",
      },
    ],
  },
  "/commercial-real-estate/CA/mountain-view/downtown-mountain-view/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Peninsula downtowns",
    intro:
      "Compare Downtown Mountain View with nearby Caltrain downtowns and campus-oriented alternatives.",
    districts: [
      {
        name: "Downtown Palo Alto",
        url: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/",
        relationship_type: "Peninsula downtown comparison",
        note: "More Stanford- and venture-adjacent, with stronger client-facing professional identity.",
      },
      {
        name: "Downtown Redwood City",
        url: "/commercial-real-estate/CA/redwood-city/downtown-redwood-city/",
        relationship_type: "Mid-Peninsula alternative",
        note: "A larger mid-Peninsula downtown with civic, Broadway, and Caltrain context.",
      },
      {
        name: "North Bayshore",
        url: "/commercial-real-estate/CA/mountain-view/north-bayshore/",
        relationship_type: "Campus contrast",
        note: "More large-campus and technology-employer oriented than the downtown core.",
      },
    ],
  },
  "/commercial-real-estate/CA/palo-alto/stanford-research-park/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Palo Alto business settings",
    intro:
      "Use these relationships to compare research-park, downtown, and nearby technology-campus environments.",
    districts: [
      {
        name: "Downtown Palo Alto",
        url: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/",
        relationship_type: "Local format contrast",
        note: "More walkable, Caltrain-oriented, and client-facing than Stanford Research Park.",
      },
      {
        name: "North Bayshore",
        url: "/commercial-real-estate/CA/mountain-view/north-bayshore/",
        relationship_type: "Campus comparison",
        note: "A larger technology-campus ecosystem in Mountain View.",
      },
    ],
  },
  "/commercial-real-estate/CA/redwood-city/downtown-redwood-city/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Peninsula downtowns",
    intro:
      "Compare Downtown Redwood City with nearby Peninsula downtowns that offer different office identity, commute, and client-facing tradeoffs.",
    districts: [
      {
        name: "Downtown Palo Alto",
        url: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/",
        relationship_type: "Prestige/client-facing contrast",
        note: "More Stanford- and venture-adjacent, with stronger Palo Alto professional identity.",
      },
      {
        name: "Downtown Mountain View",
        url: "/commercial-real-estate/CA/mountain-view/downtown-mountain-view/",
        relationship_type: "Startup downtown comparison",
        note: "More Mountain View technology-adjacent and startup-oriented around Castro Street.",
      },
    ],
  },
  "/commercial-real-estate/CA/milpitas/milpitas-industrial/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare industrial and flex alternatives",
    intro:
      "Compare Milpitas Industrial with nearby South Bay and Fremont districts when warehouse/flex, service-commercial, and R&D/manufacturing requirements matter.",
    districts: [
      {
        name: "Warm Springs Innovation District",
        url: "/commercial-real-estate/CA/fremont/warm-springs-innovation-district/",
        relationship_type: "Manufacturing/R&D comparison",
        note: "More advanced-manufacturing and BART-adjacent than Milpitas' functional industrial/flex setting.",
      },
      {
        name: "North San Jose",
        url: "/commercial-real-estate/CA/san-jose/north-san-jose/",
        relationship_type: "Office/R&D contrast",
        note: "More office and technology-corridor oriented, with stronger airport and San Jose access.",
      },
    ],
  },
  "/commercial-real-estate/CA/fremont/warm-springs-innovation-district/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Fremont and South Bay industrial districts",
    intro:
      "Use these relationships to read Warm Springs as advanced manufacturing and R&D/flex geography, not just generic industrial space.",
    districts: [
      {
        name: "Milpitas Industrial",
        url: "/commercial-real-estate/CA/milpitas/milpitas-industrial/",
        relationship_type: "Industrial/flex contrast",
        note: "More functional I-880/237 warehouse and service-commercial context.",
      },
      {
        name: "Ardenwood Technology Park",
        url: "/commercial-real-estate/CA/fremont/ardenwood-technology-park/",
        relationship_type: "Fremont R&D/flex comparison",
        note: "More Dumbarton Bridge and Peninsula-access oriented within Fremont.",
      },
      {
        name: "North San Jose",
        url: "/commercial-real-estate/CA/san-jose/north-san-jose/",
        relationship_type: "South Bay office/R&D alternative",
        note: "More office/R&D corridor and airport-access oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/fremont/ardenwood-technology-park/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Fremont R&D/flex alternatives",
    intro:
      "Compare Ardenwood with nearby districts when Dumbarton access, R&D/flex buildings, and Fremont technology-park context matter.",
    districts: [
      {
        name: "Warm Springs Innovation District",
        url: "/commercial-real-estate/CA/fremont/warm-springs-innovation-district/",
        relationship_type: "Manufacturing/R&D comparison",
        note: "More advanced-manufacturing and BART-adjacent within Fremont.",
      },
      {
        name: "Milpitas Industrial",
        url: "/commercial-real-estate/CA/milpitas/milpitas-industrial/",
        relationship_type: "South Bay industrial alternative",
        note: "More I-880/237 industrial/flex utility and South Bay access.",
      },
    ],
  },
});

Object.assign(integrationsByPath, {
  "/commercial-real-estate/CA/oakland/west-oakland/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Oakland industrial-edge districts",
    intro:
      "Use these relationships to read West Oakland as urban industrial-transition geography near Downtown Oakland, Jack London Square, and Emeryville.",
    districts: [
      {
        name: "Downtown Oakland",
        url: "/commercial-real-estate/CA/oakland/downtown-oakland/",
        relationship_type: "Office-core contrast",
        note: "More formal, BART-centered, civic, and downtown-office oriented.",
      },
      {
        name: "Jack London Square",
        url: "/commercial-real-estate/CA/oakland/jack-london-square/",
        relationship_type: "Waterfront adaptive contrast",
        note: "More waterfront and visitor-facing, with adaptive commercial texture south of the downtown core.",
      },
      {
        name: "Emeryville Commercial Core",
        url: "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/",
        relationship_type: "Office/life-science alternative",
        note: "More mixed office, life-science, and retail-oriented between Oakland and Berkeley.",
      },
    ],
  },
  "/commercial-real-estate/CA/berkeley/downtown-berkeley/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Berkeley and nearby East Bay districts",
    intro:
      "Compare Downtown Berkeley's BART- and university-adjacent office context with nearby East Bay commercial alternatives.",
    districts: [
      {
        name: "Emeryville Commercial Core",
        url: "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/",
        relationship_type: "Office/life-science contrast",
        note: "More mixed office and life-science oriented, with less university-downtown character.",
      },
      {
        name: "Downtown Oakland",
        url: "/commercial-real-estate/CA/oakland/downtown-oakland/",
        relationship_type: "Larger business core",
        note: "More formal, civic, and office-core oriented, with stronger regional downtown identity.",
      },
    ],
  },
  "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare nearby East Bay commercial districts",
    intro:
      "Use these districts to compare Emeryville's compact mixed office and life-science node with nearby Oakland and Berkeley settings.",
    districts: [
      {
        name: "Downtown Oakland",
        url: "/commercial-real-estate/CA/oakland/downtown-oakland/",
        relationship_type: "Civic office-core contrast",
        note: "More formal, BART-centered, and public-sector adjacent than Emeryville.",
      },
      {
        name: "Downtown Berkeley",
        url: "/commercial-real-estate/CA/berkeley/downtown-berkeley/",
        relationship_type: "University downtown contrast",
        note: "More university-adjacent and BART/walkability oriented around Shattuck and University.",
      },
      {
        name: "West Oakland",
        url: "/commercial-real-estate/CA/oakland/west-oakland/",
        relationship_type: "Industrial edge",
        note: "More service-commercial and industrial-transition oriented near the Oakland edge.",
      },
    ],
  },
  "/commercial-real-estate/CA/walnut-creek/downtown-walnut-creek/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare East Bay office alternatives",
    intro:
      "Compare Downtown Walnut Creek with urban and suburban East Bay office settings that solve different commute, client, and building-format needs.",
    districts: [
      {
        name: "Downtown Oakland",
        url: "/commercial-real-estate/CA/oakland/downtown-oakland/",
        relationship_type: "Urban core contrast",
        note: "More civic, BART-centered, and urban-office oriented than Walnut Creek's suburban downtown.",
      },
      {
        name: "Hacienda Business Park",
        url: "/commercial-real-estate/CA/pleasanton/hacienda-business-park/",
        relationship_type: "Business-park contrast",
        note: "More freeway, parking, and campus/floorplate oriented than downtown Walnut Creek.",
      },
    ],
  },
  "/commercial-real-estate/CA/pleasanton/hacienda-business-park/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Tri-Valley and East Bay office settings",
    intro:
      "Use these relationships to read Hacienda Business Park as a suburban office and corporate-campus setting rather than a downtown district.",
    districts: [
      {
        name: "Downtown Walnut Creek",
        url: "/commercial-real-estate/CA/walnut-creek/downtown-walnut-creek/",
        relationship_type: "Suburban downtown contrast",
        note: "More client-facing, walkable, and retail-supported than Hacienda's business-park format.",
      },
      {
        name: "Downtown Oakland",
        url: "/commercial-real-estate/CA/oakland/downtown-oakland/",
        relationship_type: "Urban core contrast",
        note: "More BART-centered, civic, and urban-office oriented.",
      },
    ],
  },
});

module.exports = {
  byPath: integrationsByPath,
};
