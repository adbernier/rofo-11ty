const commercialLocationModel = require("./commercialLocationModel.js");

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
        name: "Emeryville",
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
  "/commercial-real-estate/CA/san-diego/downtown-san-diego/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare central San Diego office alternatives",
    intro:
      "Use these relationships to compare Downtown San Diego's civic office role with nearby suburban and North City office districts.",
    districts: [
      {
        name: "Mission Valley",
        url: "/commercial-real-estate/CA/san-diego/mission-valley/",
        relationship_type: "Central suburban office contrast",
        note: "More parking-oriented and freeway-practical than downtown.",
      },
      {
        name: "UTC / University City",
        url: "/commercial-real-estate/CA/san-diego/utc-university-city/",
        relationship_type: "North City office alternative",
        note: "More suburban, medical, and life-science-adjacent.",
      },
    ],
  },
  "/commercial-real-estate/CA/san-diego/mission-valley/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare central San Diego office districts",
    intro:
      "Compare Mission Valley with downtown, North City, and central office/flex districts when access and parking matter.",
    districts: [
      {
        name: "Downtown San Diego",
        url: "/commercial-real-estate/CA/san-diego/downtown-san-diego/",
        relationship_type: "Urban office-core contrast",
        note: "More civic, walkable, and client-facing.",
      },
      {
        name: "UTC / University City",
        url: "/commercial-real-estate/CA/san-diego/utc-university-city/",
        relationship_type: "North City office contrast",
        note: "More life-science-adjacent and high-identity suburban office.",
      },
      {
        name: "Kearny Mesa",
        url: "/commercial-real-estate/CA/san-diego/kearny-mesa/",
        relationship_type: "Office/flex alternative",
        note: "More service-commercial, showroom, and light flex oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/san-diego/utc-university-city/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare North City office and life-science settings",
    intro:
      "Use these relationships to compare UTC / University City with R&D/flex, institutional, and central office alternatives.",
    districts: [
      {
        name: "Sorrento Mesa",
        url: "/commercial-real-estate/CA/san-diego/sorrento-mesa/",
        relationship_type: "R&D/flex contrast",
        note: "More technology, life-science support, and functional business-park oriented.",
      },
      {
        name: "Mission Valley",
        url: "/commercial-real-estate/CA/san-diego/mission-valley/",
        relationship_type: "Central office alternative",
        note: "More central and freeway-practical.",
      },
      {
        name: "Torrey Pines / La Jolla",
        url: "/commercial-real-estate/CA/la-jolla/torrey-pines-la-jolla/",
        relationship_type: "Institutional life-science comparison",
        note: "More coastal, research, and UCSD/Torrey Pines oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/san-diego/sorrento-mesa/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare San Diego R&D and life-science alternatives",
    intro:
      "Compare Sorrento Mesa with adjacent office, institutional, industrial/flex, and North County innovation districts.",
    districts: [
      {
        name: "UTC / University City",
        url: "/commercial-real-estate/CA/san-diego/utc-university-city/",
        relationship_type: "Office/medical contrast",
        note: "More polished, retail-supported, and office-oriented.",
      },
      {
        name: "Torrey Pines / La Jolla",
        url: "/commercial-real-estate/CA/la-jolla/torrey-pines-la-jolla/",
        relationship_type: "Institutional life-science contrast",
        note: "More coastal and research-institution oriented.",
      },
      {
        name: "Miramar",
        url: "/commercial-real-estate/CA/san-diego/miramar/",
        relationship_type: "Industrial/flex alternative",
        note: "More warehouse/flex and service-industrial oriented.",
      },
      {
        name: "Carlsbad",
        url: "/commercial-real-estate/CA/carlsbad/carlsbad/",
        relationship_type: "North County alternative",
        note: "More North County office/R&D and manufacturing oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/la-jolla/torrey-pines-la-jolla/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare life-science and research districts",
    intro:
      "Compare Torrey Pines / La Jolla with nearby R&D/flex and North City office districts when institutional research context matters.",
    districts: [
      {
        name: "Sorrento Mesa",
        url: "/commercial-real-estate/CA/san-diego/sorrento-mesa/",
        relationship_type: "R&D/flex contrast",
        note: "More functional and business-park oriented.",
      },
      {
        name: "UTC / University City",
        url: "/commercial-real-estate/CA/san-diego/utc-university-city/",
        relationship_type: "Office/medical alternative",
        note: "Broader North City office, medical, and retail-supported context.",
      },
    ],
  },
  "/commercial-real-estate/CA/san-diego/kearny-mesa/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare central office/flex and industrial districts",
    intro:
      "Use these relationships to compare Kearny Mesa with central office, industrial/flex, and R&D/flex alternatives.",
    districts: [
      {
        name: "Miramar",
        url: "/commercial-real-estate/CA/san-diego/miramar/",
        relationship_type: "Industrial/flex contrast",
        note: "More warehouse/flex and operational.",
      },
      {
        name: "Mission Valley",
        url: "/commercial-real-estate/CA/san-diego/mission-valley/",
        relationship_type: "Office corridor comparison",
        note: "More conventional office and medical office oriented.",
      },
      {
        name: "Sorrento Mesa",
        url: "/commercial-real-estate/CA/san-diego/sorrento-mesa/",
        relationship_type: "R&D/flex alternative",
        note: "More technology and life-science oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/san-diego/miramar/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare San Diego industrial/flex alternatives",
    intro:
      "Compare Miramar with nearby service-commercial, R&D/flex, and border-logistics districts.",
    districts: [
      {
        name: "Kearny Mesa",
        url: "/commercial-real-estate/CA/san-diego/kearny-mesa/",
        relationship_type: "Central office/flex comparison",
        note: "More central and mixed office/showroom/service-commercial oriented.",
      },
      {
        name: "Sorrento Mesa",
        url: "/commercial-real-estate/CA/san-diego/sorrento-mesa/",
        relationship_type: "R&D/flex comparison",
        note: "More life-science and technology oriented.",
      },
      {
        name: "Otay Mesa",
        url: "/commercial-real-estate/CA/san-diego/otay-mesa/",
        relationship_type: "Border logistics contrast",
        note: "More cross-border logistics and large industrial oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/san-diego/otay-mesa/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare South Bay industrial and service markets",
    intro:
      "Use these relationships to compare Otay Mesa's border logistics role with South Bay service and central industrial alternatives.",
    districts: [
      {
        name: "Chula Vista",
        url: "/commercial-real-estate/CA/chula-vista/chula-vista/",
        relationship_type: "South Bay service contrast",
        note: "More local office, medical, and customer-facing.",
      },
      {
        name: "Miramar",
        url: "/commercial-real-estate/CA/san-diego/miramar/",
        relationship_type: "Central industrial alternative",
        note: "More central/north industrial and flex oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/chula-vista/chula-vista/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare South Bay commercial alternatives",
    intro:
      "Compare Chula Vista with nearby South Bay logistics and central San Diego office alternatives.",
    districts: [
      {
        name: "Otay Mesa",
        url: "/commercial-real-estate/CA/san-diego/otay-mesa/",
        relationship_type: "Border industrial contrast",
        note: "More logistics, distribution, and warehouse oriented.",
      },
      {
        name: "Downtown San Diego",
        url: "/commercial-real-estate/CA/san-diego/downtown-san-diego/",
        relationship_type: "Urban office-core contrast",
        note: "More central, civic, and client-facing.",
      },
    ],
  },
  "/commercial-real-estate/CA/carlsbad/carlsbad/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare North County and San Diego innovation markets",
    intro:
      "Compare Carlsbad with coastal North County, inland North County, and central San Diego R&D/flex alternatives.",
    districts: [
      {
        name: "Oceanside",
        url: "/commercial-real-estate/CA/oceanside/oceanside/",
        relationship_type: "Coastal local-service contrast",
        note: "More local-service and lighter industrial than Carlsbad's office/R&D business-park setting.",
      },
      {
        name: "Sorrento Mesa",
        url: "/commercial-real-estate/CA/san-diego/sorrento-mesa/",
        relationship_type: "Core R&D/flex comparison",
        note: "More central to San Diego's life-science and technology geography.",
      },
      {
        name: "Vista",
        url: "/commercial-real-estate/CA/vista/vista/",
        relationship_type: "Industrial/flex alternative",
        note: "More inland and operational.",
      },
    ],
  },
  "/commercial-real-estate/CA/oceanside/oceanside/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare coastal North County commercial markets",
    intro:
      "Use these relationships to compare Oceanside with nearby North County office/R&D and industrial/flex markets.",
    districts: [
      {
        name: "Carlsbad",
        url: "/commercial-real-estate/CA/carlsbad/carlsbad/",
        relationship_type: "Office/R&D contrast",
        note: "More established as an office/R&D and manufacturing business-park market.",
      },
      {
        name: "Vista",
        url: "/commercial-real-estate/CA/vista/vista/",
        relationship_type: "Industrial/flex alternative",
        note: "More inland and operational.",
      },
    ],
  },
  "/commercial-real-estate/CA/vista/vista/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare inland North County industrial/flex markets",
    intro:
      "Compare Vista with nearby North County service-office, coastal, and business-park alternatives.",
    districts: [
      {
        name: "San Marcos",
        url: "/commercial-real-estate/CA/san-marcos/san-marcos/",
        relationship_type: "Service-office comparison",
        note: "More medical, education-adjacent, and local-service oriented.",
      },
      {
        name: "Carlsbad",
        url: "/commercial-real-estate/CA/carlsbad/carlsbad/",
        relationship_type: "Office/R&D contrast",
        note: "More coastal, office/R&D, and business-park oriented.",
      },
      {
        name: "Oceanside",
        url: "/commercial-real-estate/CA/oceanside/oceanside/",
        relationship_type: "Coastal local-service alternative",
        note: "More coastal and customer-facing.",
      },
    ],
  },
  "/commercial-real-estate/CA/san-marcos/san-marcos/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare inland North County service markets",
    intro:
      "Compare San Marcos with nearby North County industrial/flex and inland service-office alternatives.",
    districts: [
      {
        name: "Vista",
        url: "/commercial-real-estate/CA/vista/vista/",
        relationship_type: "Industrial/flex contrast",
        note: "More operational and industrial/flex oriented.",
      },
      {
        name: "Escondido",
        url: "/commercial-real-estate/CA/escondido/escondido/",
        relationship_type: "Inland service-market comparison",
        note: "More inland, civic, and local-service oriented.",
      },
      {
        name: "Carlsbad",
        url: "/commercial-real-estate/CA/carlsbad/carlsbad/",
        relationship_type: "Office/R&D alternative",
        note: "More coastal and business-park oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/escondido/escondido/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare inland North County commercial markets",
    intro:
      "Use these relationships to compare Escondido's inland service-office role with nearby North County alternatives.",
    districts: [
      {
        name: "San Marcos",
        url: "/commercial-real-estate/CA/san-marcos/san-marcos/",
        relationship_type: "Service-office comparison",
        note: "More Highway 78, medical, education-adjacent, and balanced light flex oriented.",
      },
      {
        name: "Vista",
        url: "/commercial-real-estate/CA/vista/vista/",
        relationship_type: "Industrial/flex alternative",
        note: "More operational and industrial/flex oriented.",
      },
    ],
  },
});

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
        name: "Emeryville",
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
        name: "Emeryville",
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

Object.assign(integrationsByPath, {
  "/commercial-real-estate/CA/san-rafael/downtown-san-rafael/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare central Marin commercial alternatives",
    intro:
      "Use these relationships to read Downtown San Rafael as a central Marin professional and civic commercial core, not just a generic downtown.",
    districts: [
      {
        name: "Novato",
        url: "/commercial-real-estate/CA/novato/novato-commercial-core/",
        relationship_type: "Northern Marin office/flex contrast",
        note: "More corridor-oriented, parking-practical, and service-commercial than downtown San Rafael.",
      },
      {
        name: "Larkspur / Corte Madera Corridor",
        url: "/commercial-real-estate/CA/larkspur/larkspur-corte-madera-corridor/",
        relationship_type: "Southern Marin corridor comparison",
        note: "More retail-adjacent and Highway 101 corridor-oriented than San Rafael's civic downtown.",
      },
      {
        name: "North San Rafael / Terra Linda",
        url: "/commercial-real-estate/CA/san-rafael/north-san-rafael-terra-linda/",
        relationship_type: "Medical/civic corridor edge",
        note: "More corridor-oriented, with Civic Center and medical/professional office context.",
      },
    ],
  },
  "/commercial-real-estate/CA/san-rafael/north-san-rafael-terra-linda/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Marin medical and service corridors",
    intro:
      "Compare North San Rafael / Terra Linda with nearby Marin districts when medical office, professional services, and Highway 101 access matter.",
    districts: [
      {
        name: "Downtown San Rafael",
        url: "/commercial-real-estate/CA/san-rafael/downtown-san-rafael/",
        relationship_type: "Downtown professional contrast",
        note: "More walkable, civic, and client-facing than the Terra Linda corridor.",
      },
      {
        name: "Novato",
        url: "/commercial-real-estate/CA/novato/novato-commercial-core/",
        relationship_type: "Northern Marin corridor alternative",
        note: "More northern Marin office/flex and service-commercial oriented.",
      },
      {
        name: "Larkspur / Corte Madera Corridor",
        url: "/commercial-real-estate/CA/larkspur/larkspur-corte-madera-corridor/",
        relationship_type: "Southern Marin corridor comparison",
        note: "More retail-adjacent and southern Marin client-access oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/larkspur/larkspur-corte-madera-corridor/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare southern and central Marin corridors",
    intro:
      "Use these relationships to compare the Larkspur / Corte Madera corridor with nearby Marin professional, medical, and local-service commercial settings.",
    districts: [
      {
        name: "Downtown San Rafael",
        url: "/commercial-real-estate/CA/san-rafael/downtown-san-rafael/",
        relationship_type: "Central Marin downtown contrast",
        note: "More civic, professional-downtown, and county-adjacent than Larkspur / Corte Madera.",
      },
      {
        name: "North San Rafael / Terra Linda",
        url: "/commercial-real-estate/CA/san-rafael/north-san-rafael-terra-linda/",
        relationship_type: "Medical/civic corridor alternative",
        note: "More medical office and Civic Center corridor oriented.",
      },
      {
        name: "Novato",
        url: "/commercial-real-estate/CA/novato/novato-commercial-core/",
        relationship_type: "Northern Marin office/flex contrast",
        note: "More operational and office/flex oriented than southern Marin's retail-adjacent corridor.",
      },
    ],
  },
  "/commercial-real-estate/CA/novato/novato-commercial-core/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Marin and Sonoma corridor markets",
    intro:
      "Use these relationships to compare Novato's northern Marin office/flex and service-commercial role with nearby Marin and Sonoma County alternatives.",
    districts: [
      {
        name: "Downtown San Rafael",
        url: "/commercial-real-estate/CA/san-rafael/downtown-san-rafael/",
        relationship_type: "Central Marin downtown contrast",
        note: "More civic, downtown, and client-facing than Novato's corridor-oriented market.",
      },
      {
        name: "Petaluma",
        url: "/commercial-real-estate/CA/petaluma/petaluma-commercial-core/",
        relationship_type: "Sonoma office/flex alternative",
        note: "More Sonoma County and light industrial/flex oriented.",
      },
      {
        name: "North San Rafael / Terra Linda",
        url: "/commercial-real-estate/CA/san-rafael/north-san-rafael-terra-linda/",
        relationship_type: "Medical corridor comparison",
        note: "More central Marin and Civic Center-adjacent.",
      },
    ],
  },
  "/commercial-real-estate/CA/petaluma/petaluma-commercial-core/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Sonoma and northern Marin markets",
    intro:
      "Compare Petaluma with nearby North Bay alternatives when light industrial/flex, office, local service, and Highway 101 access are part of the location decision.",
    districts: [
      {
        name: "Novato",
        url: "/commercial-real-estate/CA/novato/novato-commercial-core/",
        relationship_type: "Northern Marin contrast",
        note: "More Marin-oriented and medical/professional-service focused than Petaluma.",
      },
      {
        name: "Downtown Santa Rosa",
        url: "/commercial-real-estate/CA/santa-rosa/downtown-santa-rosa/",
        relationship_type: "Regional Sonoma hub comparison",
        note: "Larger, more regional, and more office/civic/service oriented than Petaluma.",
      },
    ],
  },
  "/commercial-real-estate/CA/santa-rosa/downtown-santa-rosa/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Sonoma County commercial settings",
    intro:
      "Use these relationships to compare Downtown Santa Rosa's regional office and service-hub role with nearby North Bay alternatives.",
    districts: [
      {
        name: "Petaluma",
        url: "/commercial-real-estate/CA/petaluma/petaluma-commercial-core/",
        relationship_type: "Smaller operational market contrast",
        note: "More light industrial/flex and local service-commercial oriented than Santa Rosa's regional downtown role.",
      },
      {
        name: "Novato",
        url: "/commercial-real-estate/CA/novato/novato-commercial-core/",
        relationship_type: "Northern Marin alternative",
        note: "More Marin-oriented and corridor-practical than Santa Rosa's Sonoma County hub setting.",
      },
    ],
  },
});

Object.assign(integrationsByPath, {
  "/commercial-real-estate/CA/sacramento/downtown-sacramento/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Sacramento office and regional alternatives",
    intro:
      "Use these relationships to place Downtown Sacramento within the region's civic office, suburban office, and industrial/flex geography.",
    districts: [
      {
        name: "Midtown Sacramento",
        url: "/commercial-real-estate/CA/sacramento/midtown-sacramento/",
        relationship_type: "Central-city office contrast",
        note: "More mixed-use, smaller-format, and neighborhood-commercial than downtown's civic office core.",
      },
      {
        name: "Natomas",
        url: "/commercial-real-estate/CA/sacramento/natomas/",
        relationship_type: "Suburban office alternative",
        note: "More airport-adjacent, parking-oriented, and freeway-accessible.",
      },
      {
        name: "West Sacramento Industrial",
        url: "/commercial-real-estate/CA/west-sacramento/west-sacramento-industrial/",
        relationship_type: "Industrial/flex contrast",
        note: "Operational and warehouse/flex oriented across the river from downtown.",
      },
      {
        name: "Roseville",
        url: "/commercial-real-estate/CA/roseville/roseville-commercial-core/",
        relationship_type: "Regional suburban office alternative",
        note: "More Placer County, medical/professional, and suburban client-service oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/sacramento/midtown-sacramento/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare central Sacramento office settings",
    intro:
      "Compare Midtown with nearby Sacramento districts when mixed-use professional context, medical office, and central-city access matter.",
    districts: [
      {
        name: "Downtown Sacramento",
        url: "/commercial-real-estate/CA/sacramento/downtown-sacramento/",
        relationship_type: "Formal office-core contrast",
        note: "More civic, government-adjacent, and traditional-office oriented.",
      },
      {
        name: "East Sacramento / Alhambra Corridor",
        url: "/commercial-real-estate/CA/sacramento/east-sacramento-alhambra-corridor/",
        relationship_type: "Medical/professional corridor",
        note: "More corridor-oriented and medical/professional than Midtown's mixed-use texture.",
      },
      {
        name: "Arden / Point West",
        url: "/commercial-real-estate/CA/sacramento/arden-point-west/",
        relationship_type: "Suburban office corridor",
        note: "More parking-oriented, medical/professional, and Business 80 accessible.",
      },
    ],
  },
  "/commercial-real-estate/CA/sacramento/east-sacramento-alhambra-corridor/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare central medical and professional corridors",
    intro:
      "Use these relationships to compare East Sacramento / Alhambra with central and suburban Sacramento professional-service settings.",
    districts: [
      {
        name: "Midtown Sacramento",
        url: "/commercial-real-estate/CA/sacramento/midtown-sacramento/",
        relationship_type: "Mixed-use contrast",
        note: "More neighborhood-commercial and mixed-use than the Alhambra corridor.",
      },
      {
        name: "Arden / Point West",
        url: "/commercial-real-estate/CA/sacramento/arden-point-west/",
        relationship_type: "Larger corridor alternative",
        note: "More suburban office and medical corridor oriented.",
      },
      {
        name: "Downtown Sacramento",
        url: "/commercial-real-estate/CA/sacramento/downtown-sacramento/",
        relationship_type: "Civic office contrast",
        note: "More government-adjacent and traditional-office oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/sacramento/natomas/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare airport-adjacent and suburban office alternatives",
    intro:
      "Compare Natomas with nearby Sacramento districts when airport access, parking, medical office, and freeway reach are part of the location decision.",
    districts: [
      {
        name: "Downtown Sacramento",
        url: "/commercial-real-estate/CA/sacramento/downtown-sacramento/",
        relationship_type: "Civic office-core contrast",
        note: "More central, transit-connected, and government-adjacent.",
      },
      {
        name: "Arden / Point West",
        url: "/commercial-real-estate/CA/sacramento/arden-point-west/",
        relationship_type: "Suburban office corridor comparison",
        note: "More established as a medical/professional office corridor.",
      },
      {
        name: "Power Inn Industrial",
        url: "/commercial-real-estate/CA/sacramento/power-inn-industrial/",
        relationship_type: "Industrial/flex contrast",
        note: "More functional for warehouse/flex and service-industrial users.",
      },
    ],
  },
  "/commercial-real-estate/CA/sacramento/arden-point-west/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Sacramento suburban office corridors",
    intro:
      "Use these relationships to compare Arden / Point West with airport-adjacent, central, and medical/professional Sacramento alternatives.",
    districts: [
      {
        name: "Natomas",
        url: "/commercial-real-estate/CA/sacramento/natomas/",
        relationship_type: "Airport-access alternative",
        note: "More airport- and I-5/I-80-oriented than Arden / Point West.",
      },
      {
        name: "East Sacramento / Alhambra Corridor",
        url: "/commercial-real-estate/CA/sacramento/east-sacramento-alhambra-corridor/",
        relationship_type: "Central medical/professional corridor",
        note: "Smaller-scale and more central than Arden / Point West.",
      },
      {
        name: "Downtown Sacramento",
        url: "/commercial-real-estate/CA/sacramento/downtown-sacramento/",
        relationship_type: "Civic office-core contrast",
        note: "More formal, central, and government-adjacent.",
      },
    ],
  },
  "/commercial-real-estate/CA/sacramento/power-inn-industrial/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Sacramento industrial/flex corridors",
    intro:
      "Compare Power Inn with nearby operational markets when warehouse/flex, contractor, distribution, and service-commercial requirements matter.",
    districts: [
      {
        name: "West Sacramento Industrial",
        url: "/commercial-real-estate/CA/west-sacramento/west-sacramento-industrial/",
        relationship_type: "Industrial/flex comparison",
        note: "More river/port and downtown-edge oriented.",
      },
      {
        name: "Rancho Cordova",
        url: "/commercial-real-estate/CA/rancho-cordova/rancho-cordova-commercial-core/",
        relationship_type: "Office/flex alternative",
        note: "More Highway 50 office/flex and suburban office oriented.",
      },
      {
        name: "Elk Grove",
        url: "/commercial-real-estate/CA/elk-grove/elk-grove-commercial-core/",
        relationship_type: "South Sacramento service market",
        note: "More local-service and suburban medical/professional oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/west-sacramento/west-sacramento-industrial/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Sacramento operational and office alternatives",
    intro:
      "Use these relationships to compare West Sacramento's industrial/flex role with nearby office-core and industrial corridors.",
    districts: [
      {
        name: "Power Inn Industrial",
        url: "/commercial-real-estate/CA/sacramento/power-inn-industrial/",
        relationship_type: "Industrial/flex alternative",
        note: "More Highway 50 and South Sacramento oriented.",
      },
      {
        name: "Downtown Sacramento",
        url: "/commercial-real-estate/CA/sacramento/downtown-sacramento/",
        relationship_type: "Office-core contrast",
        note: "More civic, professional, and traditional-office oriented.",
      },
      {
        name: "Natomas",
        url: "/commercial-real-estate/CA/sacramento/natomas/",
        relationship_type: "Airport-access office alternative",
        note: "More suburban office and airport-adjacent than West Sacramento's industrial setting.",
      },
    ],
  },
  "/commercial-real-estate/CA/rancho-cordova/rancho-cordova-commercial-core/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare Highway 50 office and flex alternatives",
    intro:
      "Compare Rancho Cordova with nearby eastern Sacramento and industrial/flex settings when office, back-office, and operational requirements overlap.",
    districts: [
      {
        name: "Folsom",
        url: "/commercial-real-estate/CA/folsom/folsom-commercial-core/",
        relationship_type: "Eastern Sacramento professional contrast",
        note: "More polished, client-facing, and professional-service oriented.",
      },
      {
        name: "Power Inn Industrial",
        url: "/commercial-real-estate/CA/sacramento/power-inn-industrial/",
        relationship_type: "Industrial/flex contrast",
        note: "More operational and warehouse/flex oriented.",
      },
      {
        name: "Downtown Sacramento",
        url: "/commercial-real-estate/CA/sacramento/downtown-sacramento/",
        relationship_type: "Civic office contrast",
        note: "More central and government-adjacent.",
      },
    ],
  },
  "/commercial-real-estate/CA/folsom/folsom-commercial-core/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare eastern Sacramento office alternatives",
    intro:
      "Use these relationships to compare Folsom with nearby suburban and regional Sacramento office markets.",
    districts: [
      {
        name: "Rancho Cordova",
        url: "/commercial-real-estate/CA/rancho-cordova/rancho-cordova-commercial-core/",
        relationship_type: "Highway 50 office/flex comparison",
        note: "More practical, back-office, and office/flex oriented.",
      },
      {
        name: "Roseville",
        url: "/commercial-real-estate/CA/roseville/roseville-commercial-core/",
        relationship_type: "Regional suburban office comparison",
        note: "More Placer County and northeast Sacramento oriented.",
      },
      {
        name: "Downtown Sacramento",
        url: "/commercial-real-estate/CA/sacramento/downtown-sacramento/",
        relationship_type: "Civic office-core contrast",
        note: "More central, transit-connected, and government-adjacent.",
      },
    ],
  },
  "/commercial-real-estate/CA/roseville/roseville-commercial-core/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare regional Sacramento office alternatives",
    intro:
      "Compare Roseville with Sacramento and eastern suburban alternatives when Placer County, office, medical office, and client access matter.",
    districts: [
      {
        name: "Folsom",
        url: "/commercial-real-estate/CA/folsom/folsom-commercial-core/",
        relationship_type: "Suburban office comparison",
        note: "More Highway 50 and eastern Sacramento oriented.",
      },
      {
        name: "Downtown Sacramento",
        url: "/commercial-real-estate/CA/sacramento/downtown-sacramento/",
        relationship_type: "Civic office-core contrast",
        note: "More central, government-adjacent, and traditional-office oriented.",
      },
      {
        name: "Rancho Cordova",
        url: "/commercial-real-estate/CA/rancho-cordova/rancho-cordova-commercial-core/",
        relationship_type: "Office/flex alternative",
        note: "More Highway 50 and office/flex oriented.",
      },
    ],
  },
  "/commercial-real-estate/CA/elk-grove/elk-grove-commercial-core/": {
    eyebrow: "Nearby commercial districts",
    heading: "Compare south Sacramento commercial alternatives",
    intro:
      "Use these relationships to compare Elk Grove's local service and suburban office role with nearby Sacramento office and industrial/flex markets.",
    districts: [
      {
        name: "Power Inn Industrial",
        url: "/commercial-real-estate/CA/sacramento/power-inn-industrial/",
        relationship_type: "Industrial/flex contrast",
        note: "More operational and warehouse/flex oriented.",
      },
      {
        name: "Downtown Sacramento",
        url: "/commercial-real-estate/CA/sacramento/downtown-sacramento/",
        relationship_type: "Regional office-core contrast",
        note: "More civic, central, and professional-office oriented.",
      },
      {
        name: "Rancho Cordova",
        url: "/commercial-real-estate/CA/rancho-cordova/rancho-cordova-commercial-core/",
        relationship_type: "Office/flex alternative",
        note: "More Highway 50 and back-office/office-flex oriented.",
      },
    ],
  },
});

const orangeCountyIntegrationPages = [
  ["Irvine Spectrum", "/commercial-real-estate/CA/irvine/irvine-spectrum/"],
  ["Irvine Business Complex", "/commercial-real-estate/CA/irvine/irvine-business-complex/"],
  ["Newport Center / Fashion Island", "/commercial-real-estate/CA/newport-beach/newport-center-fashion-island/"],
  ["Costa Mesa", "/commercial-real-estate/CA/costa-mesa/costa-mesa/"],
  ["South Coast Metro", "/commercial-real-estate/CA/costa-mesa/south-coast-metro/"],
  ["Anaheim Platinum Triangle", "/commercial-real-estate/CA/anaheim/anaheim-platinum-triangle/"],
  ["Anaheim", "/commercial-real-estate/CA/anaheim/anaheim/"],
  ["Downtown Santa Ana", "/commercial-real-estate/CA/santa-ana/downtown-santa-ana/"],
  ["Santa Ana", "/commercial-real-estate/CA/santa-ana/santa-ana/"],
  ["Huntington Beach", "/commercial-real-estate/CA/huntington-beach/huntington-beach/"],
  ["Tustin", "/commercial-real-estate/CA/tustin/tustin/"],
  ["Orange", "/commercial-real-estate/CA/orange/orange/"],
  ["Fullerton", "/commercial-real-estate/CA/fullerton/fullerton/"],
  ["Buena Park", "/commercial-real-estate/CA/buena-park/buena-park/"],
  ["Garden Grove", "/commercial-real-estate/CA/garden-grove/garden-grove/"],
  ["Lake Forest", "/commercial-real-estate/CA/lake-forest/lake-forest/"],
  ["Foothill Ranch", "/commercial-real-estate/CA/foothill-ranch/foothill-ranch/"],
  ["Brea", "/commercial-real-estate/CA/brea/brea/"],
  ["Laguna Hills", "/commercial-real-estate/CA/laguna-hills/laguna-hills/"],
  ["Mission Viejo", "/commercial-real-estate/CA/mission-viejo/mission-viejo/"],
  ["San Clemente", "/commercial-real-estate/CA/san-clemente/san-clemente/"],
];

Object.assign(
  integrationsByPath,
  Object.fromEntries(
    orangeCountyIntegrationPages.map(([name, path]) => {
      const model = commercialLocationModel.byPath[path];

      return [
        path,
        {
          eyebrow: "Nearby commercial districts",
          heading: "Compare Orange County commercial alternatives",
          intro:
            `Use these relationships to place ${name} within Orange County's office, industrial/flex, service-commercial, and regional business geography.`,
          districts: (model?.compare_with || []).map((district) => ({
            name: district.district_name,
            url: district.district_path,
            relationship_type: district.comparison_path ? "Comparison path" : "Commercial alternative",
            note: district.reason,
          })),
        },
      ];
    })
  )
);

const inlandEmpireIntegrationPages = [
  ["Ontario", "/commercial-real-estate/CA/ontario/ontario/"],
  ["Ontario Airport Area", "/commercial-real-estate/CA/ontario/ontario-airport-area/"],
  ["Rancho Cucamonga", "/commercial-real-estate/CA/rancho-cucamonga/rancho-cucamonga/"],
  ["Fontana", "/commercial-real-estate/CA/fontana/fontana/"],
  ["Rialto", "/commercial-real-estate/CA/rialto/rialto/"],
  ["Bloomington / Colton", "/commercial-real-estate/CA/colton/bloomington-colton/"],
  ["San Bernardino", "/commercial-real-estate/CA/san-bernardino/san-bernardino/"],
  ["Redlands", "/commercial-real-estate/CA/redlands/redlands/"],
  ["Moreno Valley", "/commercial-real-estate/CA/moreno-valley/moreno-valley/"],
  ["Riverside", "/commercial-real-estate/CA/riverside/riverside/"],
  ["Downtown Riverside", "/commercial-real-estate/CA/riverside/downtown-riverside/"],
  ["Corona", "/commercial-real-estate/CA/corona/corona/"],
  ["Chino", "/commercial-real-estate/CA/chino/chino/"],
  ["Pomona", "/commercial-real-estate/CA/pomona/pomona/"],
  ["Jurupa Valley", "/commercial-real-estate/CA/jurupa-valley/jurupa-valley/"],
  ["Eastvale", "/commercial-real-estate/CA/eastvale/eastvale/"],
  ["Perris", "/commercial-real-estate/CA/perris/perris/"],
];

Object.assign(
  integrationsByPath,
  Object.fromEntries(
    inlandEmpireIntegrationPages.map(([name, path]) => {
      const model = commercialLocationModel.byPath[path];

      return [
        path,
        {
          eyebrow: "Nearby commercial districts",
          heading: "Compare Inland Empire logistics markets",
          intro:
            `Use these relationships to place ${name} within Inland Empire warehouse, logistics, industrial/flex, truck-access, and freeway-corridor geography.`,
          districts: (model?.compare_with || []).map((district) => ({
            name: district.district_name,
            url: district.district_path,
            relationship_type: district.comparison_path ? "Comparison path" : "Commercial alternative",
            note: district.reason,
          })),
        },
      ];
    })
  )
);

const losAngelesIntegrationPages = [
  ["Downtown Los Angeles", "/commercial-real-estate/CA/los-angeles/downtown-los-angeles/"],
  ["Financial District / Bunker Hill", "/commercial-real-estate/CA/los-angeles/financial-district-bunker-hill/"],
  ["Arts District", "/commercial-real-estate/CA/los-angeles/arts-district/"],
  ["Hollywood", "/commercial-real-estate/CA/los-angeles/hollywood/"],
  ["Miracle Mile", "/commercial-real-estate/CA/los-angeles/miracle-mile/"],
  ["Koreatown", "/commercial-real-estate/CA/los-angeles/koreatown/"],
  ["Mid-Wilshire", "/commercial-real-estate/CA/los-angeles/mid-wilshire/"],
  ["Culver City", "/commercial-real-estate/CA/culver-city/culver-city/"],
  ["Westwood", "/commercial-real-estate/CA/los-angeles/westwood/"],
  ["Century City", "/commercial-real-estate/CA/los-angeles/century-city/"],
  ["Beverly Hills", "/commercial-real-estate/CA/beverly-hills/beverly-hills/"],
  ["Santa Monica", "/commercial-real-estate/CA/santa-monica/santa-monica/"],
  ["West LA", "/commercial-real-estate/CA/los-angeles/west-la/"],
  ["Playa Vista", "/commercial-real-estate/CA/los-angeles/playa-vista/"],
  ["El Segundo", "/commercial-real-estate/CA/el-segundo/el-segundo/"],
  ["Burbank", "/commercial-real-estate/CA/burbank/burbank/"],
  ["Burbank Media District", "/commercial-real-estate/CA/burbank/burbank-media-district/"],
  ["Glendale", "/commercial-real-estate/CA/glendale/glendale/"],
  ["Pasadena", "/commercial-real-estate/CA/pasadena/pasadena/"],
  ["Vernon", "/commercial-real-estate/CA/vernon/vernon/"],
  ["Commerce", "/commercial-real-estate/CA/commerce/commerce/"],
  ["City of Industry", "/commercial-real-estate/CA/city-of-industry/city-of-industry/"],
  ["Santa Fe Springs", "/commercial-real-estate/CA/santa-fe-springs/santa-fe-springs/"],
  ["Downey", "/commercial-real-estate/CA/downey/downey/"],
  ["Compton", "/commercial-real-estate/CA/compton/compton/"],
  ["Carson", "/commercial-real-estate/CA/carson/carson/"],
  ["Torrance", "/commercial-real-estate/CA/torrance/torrance/"],
  ["Long Beach", "/commercial-real-estate/CA/long-beach/long-beach/"],
  ["South Bay / LAX Industrial", "/commercial-real-estate/CA/los-angeles/south-bay-lax-industrial/"],
  ["Warner Center", "/commercial-real-estate/CA/los-angeles/warner-center/"],
  ["North Hollywood", "/commercial-real-estate/CA/north-hollywood/north-hollywood/"],
  ["Studio City", "/commercial-real-estate/CA/studio-city/studio-city/"],
  ["Van Nuys", "/commercial-real-estate/CA/van-nuys/van-nuys/"],
  ["Sherman Oaks", "/commercial-real-estate/CA/sherman-oaks/sherman-oaks/"],
];

Object.assign(
  integrationsByPath,
  Object.fromEntries(
    losAngelesIntegrationPages.map(([name, path]) => {
      const model = commercialLocationModel.byPath[path];

      return [
        path,
        {
          eyebrow: "Nearby commercial districts",
          heading: "Compare Los Angeles commercial alternatives",
          intro:
            `Use these relationships to place ${name} within Los Angeles office, media/creative, industrial/flex, logistics, aerospace, and regional business geography.`,
          districts: (model?.compare_with || []).map((district) => ({
            name: district.district_name,
            url: district.district_path,
            relationship_type: district.comparison_path ? "Comparison path" : "Commercial alternative",
            note: district.reason,
          })),
        },
      ];
    })
  )
);

const seattleMetroIntegrationPages = [
  ["Downtown Seattle", "/commercial-real-estate/WA/seattle/downtown-seattle/"],
  ["South Lake Union", "/commercial-real-estate/WA/seattle/south-lake-union/"],
  ["Belltown", "/commercial-real-estate/WA/seattle/belltown/"],
  ["Pioneer Square", "/commercial-real-estate/WA/seattle/pioneer-square/"],
  ["Fremont", "/commercial-real-estate/WA/seattle/fremont/"],
  ["Ballard", "/commercial-real-estate/WA/seattle/ballard/"],
  ["University District", "/commercial-real-estate/WA/seattle/university-district/"],
  ["SoDo", "/commercial-real-estate/WA/seattle/sodo/"],
  ["Bellevue", "/commercial-real-estate/WA/bellevue/bellevue/"],
  ["Downtown Bellevue", "/commercial-real-estate/WA/bellevue/downtown-bellevue/"],
  ["Redmond", "/commercial-real-estate/WA/redmond/redmond/"],
  ["Kirkland", "/commercial-real-estate/WA/kirkland/kirkland/"],
  ["Issaquah", "/commercial-real-estate/WA/issaquah/issaquah/"],
  ["Bothell", "/commercial-real-estate/WA/bothell/bothell/"],
  ["Kent Valley", "/commercial-real-estate/WA/kent/kent-valley/"],
  ["Tukwila", "/commercial-real-estate/WA/tukwila/tukwila/"],
  ["Auburn", "/commercial-real-estate/WA/auburn/auburn/"],
  ["Renton", "/commercial-real-estate/WA/renton/renton/"],
  ["Everett", "/commercial-real-estate/WA/everett/everett/"],
  ["Everett Industrial", "/commercial-real-estate/WA/everett/everett-industrial/"],
  ["Tacoma", "/commercial-real-estate/WA/tacoma/tacoma/"],
  ["Tacoma Port / Industrial", "/commercial-real-estate/WA/tacoma/tacoma-port-industrial/"],
  ["Fife", "/commercial-real-estate/WA/fife/fife/"],
  ["Lynnwood", "/commercial-real-estate/WA/lynnwood/lynnwood/"],
];

Object.assign(
  integrationsByPath,
  Object.fromEntries(
    seattleMetroIntegrationPages.map(([name, path]) => {
      const model = commercialLocationModel.byPath[path];

      return [
        path,
        {
          eyebrow: "Nearby commercial districts",
          heading: "Compare Seattle Metro commercial alternatives",
          intro:
            `Use these relationships to place ${name} within Seattle Metro office, tech, life science, industrial/flex, logistics, and regional business geography.`,
          districts: (model?.compare_with || []).map((district) => ({
            name: district.district_name,
            url: district.district_path,
            relationship_type: district.comparison_path ? "Comparison path" : "Commercial alternative",
            note: district.reason,
          })),
        },
      ];
    })
  )
);

const phoenixMetroIntegrationPages = [
  ["Downtown Phoenix", "/commercial-real-estate/AZ/phoenix/downtown-phoenix/"],
  ["Midtown Phoenix", "/commercial-real-estate/AZ/phoenix/midtown-phoenix/"],
  ["Camelback Corridor", "/commercial-real-estate/AZ/phoenix/camelback-corridor/"],
  ["Biltmore / Arcadia", "/commercial-real-estate/AZ/phoenix/biltmore-arcadia/"],
  ["Scottsdale", "/commercial-real-estate/AZ/scottsdale/scottsdale/"],
  ["Old Town Scottsdale", "/commercial-real-estate/AZ/scottsdale/old-town-scottsdale/"],
  ["North Scottsdale", "/commercial-real-estate/AZ/scottsdale/north-scottsdale/"],
  ["Tempe", "/commercial-real-estate/AZ/tempe/tempe/"],
  ["Mill Avenue / Downtown Tempe", "/commercial-real-estate/AZ/tempe/mill-avenue-downtown-tempe/"],
  ["Mesa", "/commercial-real-estate/AZ/mesa/mesa/"],
  ["Chandler", "/commercial-real-estate/AZ/chandler/chandler/"],
  ["Gilbert", "/commercial-real-estate/AZ/gilbert/gilbert/"],
  ["Glendale", "/commercial-real-estate/AZ/glendale/glendale/"],
  ["Peoria", "/commercial-real-estate/AZ/peoria/peoria/"],
  ["Phoenix Airport / Sky Harbor Area", "/commercial-real-estate/AZ/phoenix/phoenix-airport-sky-harbor-area/"],
  ["Deer Valley", "/commercial-real-estate/AZ/phoenix/deer-valley/"],
  ["West Phoenix Industrial", "/commercial-real-estate/AZ/phoenix/west-phoenix-industrial/"],
  ["Southwest Phoenix Industrial", "/commercial-real-estate/AZ/phoenix/southwest-phoenix-industrial/"],
  ["Tolleson", "/commercial-real-estate/AZ/tolleson/tolleson/"],
  ["Goodyear", "/commercial-real-estate/AZ/goodyear/goodyear/"],
  ["Avondale", "/commercial-real-estate/AZ/avondale/avondale/"],
  ["Mesa Gateway / East Mesa", "/commercial-real-estate/AZ/mesa/mesa-gateway-east-mesa/"],
  ["Chandler Airpark", "/commercial-real-estate/AZ/chandler/chandler-airpark/"],
  ["Mesa / Falcon Field", "/commercial-real-estate/AZ/mesa/mesa-falcon-field/"],
  ["North Phoenix / TSMC Corridor", "/commercial-real-estate/AZ/phoenix/north-phoenix-tsmc-corridor/"],
];

Object.assign(
  integrationsByPath,
  Object.fromEntries(
    phoenixMetroIntegrationPages.map(([name, path]) => {
      const model = commercialLocationModel.byPath[path];

      return [
        path,
        {
          eyebrow: "Nearby commercial districts",
          heading: "Compare Phoenix Metro commercial alternatives",
          intro:
            `Use these relationships to place ${name} within Phoenix Metro office, industrial/flex, logistics, semiconductor, healthcare, and regional business geography.`,
          districts: (model?.compare_with || []).map((district) => ({
            name: district.district_name,
            url: district.district_path,
            relationship_type: district.comparison_path ? "Comparison path" : "Commercial alternative",
            note: district.reason,
          })),
        },
      ];
    })
  )
);

const denverMetroIntegrationPages = [
  ["Downtown Denver", "/commercial-real-estate/CO/denver/downtown-denver/"],
  ["LoDo", "/commercial-real-estate/CO/denver/lodo/"],
  ["RiNo", "/commercial-real-estate/CO/denver/rino/"],
  ["Cherry Creek", "/commercial-real-estate/CO/denver/cherry-creek/"],
  ["Capitol Hill / Civic Center", "/commercial-real-estate/CO/denver/capitol-hill-civic-center/"],
  ["Five Points", "/commercial-real-estate/CO/denver/five-points/"],
  ["Lower Highlands", "/commercial-real-estate/CO/denver/lower-highlands/"],
  ["Denver Tech Center", "/commercial-real-estate/CO/denver/denver-tech-center/"],
  ["Greenwood Village", "/commercial-real-estate/CO/greenwood-village/greenwood-village/"],
  ["Inverness", "/commercial-real-estate/CO/englewood/inverness/"],
  ["Centennial", "/commercial-real-estate/CO/centennial/centennial/"],
  ["Lone Tree", "/commercial-real-estate/CO/lone-tree/lone-tree/"],
  ["Meridian / Lincoln Station", "/commercial-real-estate/CO/englewood/meridian-lincoln-station/"],
  ["Boulder", "/commercial-real-estate/CO/boulder/boulder/"],
  ["Downtown Boulder", "/commercial-real-estate/CO/boulder/downtown-boulder/"],
  ["Broomfield", "/commercial-real-estate/CO/broomfield/broomfield/"],
  ["Interlocken", "/commercial-real-estate/CO/broomfield/interlocken/"],
  ["Flatiron / US-36 Corridor", "/commercial-real-estate/CO/broomfield/flatiron-us-36-corridor/"],
  ["Louisville / Superior", "/commercial-real-estate/CO/louisville/louisville-superior/"],
  ["Denver Airport / Pena Boulevard Corridor", "/commercial-real-estate/CO/denver/denver-airport-pena-boulevard-corridor/"],
  ["Aurora", "/commercial-real-estate/CO/aurora/aurora/"],
  ["Northeast Denver Industrial", "/commercial-real-estate/CO/denver/northeast-denver-industrial/"],
  ["Commerce City", "/commercial-real-estate/CO/commerce-city/commerce-city/"],
  ["North Washington / I-25 Industrial", "/commercial-real-estate/CO/denver/north-washington-i-25-industrial/"],
  ["Thornton", "/commercial-real-estate/CO/thornton/thornton/"],
  ["Westminster", "/commercial-real-estate/CO/westminster/westminster/"],
  ["Arvada", "/commercial-real-estate/CO/arvada/arvada/"],
  ["Lakewood", "/commercial-real-estate/CO/lakewood/lakewood/"],
  ["Golden", "/commercial-real-estate/CO/golden/golden/"],
  ["Littleton", "/commercial-real-estate/CO/littleton/littleton/"],
];

Object.assign(
  integrationsByPath,
  Object.fromEntries(
    denverMetroIntegrationPages.map(([name, path]) => {
      const model = commercialLocationModel.byPath[path];

      return [
        path,
        {
          eyebrow: "Nearby commercial districts",
          heading: "Compare Denver Metro commercial alternatives",
          intro:
            `Use these relationships to place ${name} within Denver Metro office, tech, industrial/flex, logistics, life science, aerospace, and regional business geography.`,
          districts: (model?.compare_with || []).map((district) => ({
            name: district.district_name,
            url: district.district_path,
            relationship_type: district.comparison_path ? "Comparison path" : "Commercial alternative",
            note: district.reason,
          })),
        },
      ];
    })
  )
);

module.exports = {
  byPath: integrationsByPath,
};
