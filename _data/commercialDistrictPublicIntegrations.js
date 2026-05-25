const integrationsByPath = {
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
  "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/": {
    eyebrow: "Nearby commercial districts",
    heading: "Explore nearby commercial districts",
    intro:
      "Compare Downtown Palo Alto with Peninsula districts and corridors that offer different balances of walkability, client presence, and R&D-oriented commercial context.",
    districts: [
      {
        name: "Mountain View / Castro-Whisman",
        relationship_type: "Corridor alternative",
        note:
          "More corridor- and R&D-oriented than Downtown Palo Alto, with broader Mountain View startup and office context.",
      },
      {
        name: "Redwood City Downtown",
        relationship_type: "Mid-Peninsula comparison",
        note:
          "A larger mid-Peninsula downtown with stronger civic, entertainment, and Caltrain-adjacent commercial context.",
      },
      {
        name: "California Avenue",
        relationship_type: "Local Palo Alto contrast",
        note:
          "A more local Palo Alto commercial district compared with the tighter University Avenue downtown core.",
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

module.exports = {
  byPath: integrationsByPath,
};
