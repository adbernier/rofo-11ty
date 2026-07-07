module.exports = [
  {
    slug: "san-francisco",
    label: "San Francisco",
    type: "city",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/",
    confidence: "high",
    recommendedFor: ["office", "technology", "professional_services", "growth_company"],
    strengths: ["multiple distinct office districts", "regional transit access", "technology and professional-service ecosystem", "broad comparison set"],
    locationAttributes: { transit: "high", parking: "low", walkability: "high", freewayAccess: "medium", executiveImage: "high", customerAccess: "high", expansionFlexibility: "medium", costSensitivity: "medium" },
    startHere: true,
    marketPath: ["mission-bay", "soma", "financial-district"],
    businessFit: {
      office: {
        fit: "strong",
        summary: "Strong fit for office users that need access to talent, transit, clients, and several different district characters.",
        bestFor: ["technology companies", "professional-service firms", "growth-stage companies"],
        tradeoffs: ["cost and parking vary sharply by district", "the right starting point depends heavily on commute and client-access priorities"]
      }
    },
    compareWith: [
      { slug: "palo-alto", label: "Palo Alto", reason: "More Silicon Valley executive and venture ecosystem context." },
      { slug: "downtown-oakland", label: "Downtown Oakland", reason: "East Bay alternative with strong transit and different cost dynamics." }
    ]
  },
  {
    slug: "mission-bay",
    label: "Mission Bay",
    type: "district",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/mission-bay/",
    confidence: "high",
    recommendedFor: ["office", "life_science", "technology", "growth_company"],
    strengths: ["modern office inventory", "newer buildings", "Caltrain and waterfront access", "proximity to UCSF and life science ecosystem"],
    locationAttributes: { transit: "high", parking: "medium", walkability: "medium", freewayAccess: "medium", executiveImage: "high", customerAccess: "medium", expansionFlexibility: "high", costSensitivity: "low" },
    startHere: true,
    businessFit: {
      office: {
        fit: "strong",
        summary: "Good fit for growing office users that value newer buildings, transit access, and proximity to technology and life-science talent.",
        bestFor: ["growth-stage companies", "technology companies", "life science-adjacent office users"],
        tradeoffs: ["often more expensive than older office districts", "less traditional financial/core-office feel than the Financial District"]
      },
      retail: {
        fit: "limited",
        summary: "Retail can work selectively, but Mission Bay is not primarily a traditional retail district.",
        bestFor: [],
        tradeoffs: ["customer patterns are more district-specific than citywide retail corridors"]
      }
    },
    compareWith: [
      { slug: "soma", label: "SoMa", reason: "More varied building types and central-city creative office context." },
      { slug: "financial-district", label: "Financial District", reason: "More traditional CBD office environment and stronger client-facing address." },
      { slug: "jackson-square", label: "Jackson Square", reason: "Smaller-scale, character-oriented office environment." }
    ]
  },
  {
    slug: "soma",
    label: "SoMa",
    type: "district",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/soma/",
    confidence: "high",
    recommendedFor: ["office", "technology", "creative", "growth_company"],
    strengths: ["creative office inventory", "central San Francisco access", "adaptive buildings", "proximity to Mission Bay and downtown"],
    locationAttributes: { transit: "high", parking: "low", walkability: "high", freewayAccess: "medium", executiveImage: "medium", customerAccess: "high", expansionFlexibility: "medium", costSensitivity: "medium" },
    businessFit: {
      office: {
        fit: "strong",
        summary: "Strong fit for office users that want a central location with creative office character and access to both downtown and Mission Bay.",
        bestFor: ["software teams", "creative agencies", "growth companies"],
        tradeoffs: ["building quality and street context vary by block", "less polished than newer Mission Bay buildings"]
      }
    },
    compareWith: [
      { slug: "mission-bay", label: "Mission Bay", reason: "Newer buildings and stronger life-science/technology campus context." },
      { slug: "financial-district", label: "Financial District", reason: "More traditional CBD tower inventory and client access." }
    ]
  },
  {
    slug: "financial-district",
    label: "Financial District",
    type: "district",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/financial-district/",
    confidence: "high",
    recommendedFor: ["office", "financial_services", "professional_services", "headquarters"],
    strengths: ["traditional office core", "BART and ferry access", "client-facing business environment", "established Class A inventory"],
    locationAttributes: { transit: "high", parking: "low", walkability: "high", freewayAccess: "medium", executiveImage: "high", customerAccess: "high", expansionFlexibility: "medium", costSensitivity: "medium" },
    businessFit: {
      office: {
        fit: "strong",
        summary: "Strong fit for office users that value transit, client access, and a traditional San Francisco business address.",
        bestFor: ["finance firms", "legal firms", "consulting and professional-service teams"],
        tradeoffs: ["less creative/adaptive character than SoMa", "less life-science adjacency than Mission Bay"]
      }
    },
    compareWith: [
      { slug: "soma", label: "SoMa", reason: "More creative office variety and flexible building formats." },
      { slug: "jackson-square", label: "Jackson Square", reason: "More intimate, boutique office setting near the CBD." }
    ]
  },
  {
    slug: "jackson-square",
    label: "Jackson Square",
    type: "district",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/jackson-square/",
    confidence: "high",
    recommendedFor: ["office", "creative", "venture_capital", "professional_services"],
    strengths: ["boutique office buildings", "walkable downtown adjacency", "creative and investor ecosystem", "smaller-scale character"],
    locationAttributes: { transit: "high", parking: "low", walkability: "high", freewayAccess: "medium", executiveImage: "high", customerAccess: "high", expansionFlexibility: "low", costSensitivity: "low" },
    businessFit: {
      office: {
        fit: "good",
        summary: "Good fit for smaller office users that want a distinctive downtown-adjacent setting with strong walkability.",
        bestFor: ["venture firms", "creative teams", "boutique professional-service firms"],
        tradeoffs: ["less suited to large expansion needs", "smaller building formats can limit options"]
      }
    },
    compareWith: [
      { slug: "financial-district", label: "Financial District", reason: "More traditional office-core inventory and larger floor plates." },
      { slug: "mission-bay", label: "Mission Bay", reason: "Newer buildings and stronger modern campus context." }
    ]
  },
  {
    slug: "palo-alto",
    label: "Palo Alto",
    type: "city",
    city: "Palo Alto",
    state: "CA",
    path: "/commercial-real-estate/CA/palo-alto/",
    confidence: "high",
    recommendedFor: ["office", "technology", "venture_capital", "executive_access"],
    strengths: ["Silicon Valley executive access", "venture ecosystem", "walkable downtown and campus-adjacent options", "strong talent signal"],
    locationAttributes: { transit: "medium", parking: "medium", walkability: "high", freewayAccess: "medium", executiveImage: "high", customerAccess: "high", expansionFlexibility: "medium", costSensitivity: "low" },
    marketPath: ["downtown-palo-alto", "stanford-research-park"],
    businessFit: {
      office: {
        fit: "strong",
        summary: "Strong fit for companies that value executive access, recruiting signal, and proximity to Stanford and venture-backed ecosystems.",
        bestFor: ["venture-backed companies", "professional services", "technology executives"],
        tradeoffs: ["often cost-sensitive for larger teams", "limited industrial/flex relevance compared with North San Jose"]
      }
    },
    compareWith: [
      { slug: "mountain-view", label: "Mountain View", reason: "More large technology-campus context." },
      { slug: "redwood-city", label: "Redwood City", reason: "Peninsula downtown alternative with regional access." }
    ]
  },
  {
    slug: "downtown-palo-alto",
    label: "Downtown Palo Alto",
    type: "district",
    city: "Palo Alto",
    state: "CA",
    path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/",
    confidence: "high",
    recommendedFor: ["office", "venture_capital", "professional_services", "startup"],
    strengths: ["walkable downtown", "Caltrain access", "executive meeting environment", "Stanford and venture adjacency"],
    locationAttributes: { transit: "high", parking: "medium", walkability: "high", freewayAccess: "medium", executiveImage: "high", customerAccess: "high", expansionFlexibility: "low", costSensitivity: "low" },
    businessFit: {
      office: {
        fit: "strong",
        summary: "Strong fit for office users that want walkability, executive access, and Silicon Valley credibility in a downtown setting.",
        bestFor: ["startup teams", "investors", "professional-service firms"],
        tradeoffs: ["larger contiguous spaces can be harder to find", "cost can be higher than nearby suburban alternatives"]
      }
    },
    compareWith: [
      { slug: "stanford-research-park", label: "Stanford Research Park", reason: "More campus-oriented office and R&D environment." },
      { slug: "downtown-redwood-city", label: "Downtown Redwood City", reason: "Another walkable Peninsula downtown with different cost and access dynamics." }
    ]
  },
  {
    slug: "stanford-research-park",
    label: "Stanford Research Park",
    type: "district",
    city: "Palo Alto",
    state: "CA",
    path: "/commercial-real-estate/CA/palo-alto/stanford-research-park/",
    confidence: "high",
    recommendedFor: ["office", "technology", "r_and_d", "life_science"],
    strengths: ["mature campus environment", "Stanford adjacency", "technology and research identity", "larger office/R&D settings"],
    locationAttributes: { transit: "medium", parking: "high", walkability: "medium", freewayAccess: "medium", executiveImage: "high", customerAccess: "medium", expansionFlexibility: "medium", costSensitivity: "low" },
    businessFit: {
      office: {
        fit: "strong",
        summary: "Strong fit for companies that want a mature technology campus environment with Stanford adjacency.",
        bestFor: ["technology companies", "research-oriented teams", "executive office users"],
        tradeoffs: ["less walkable downtown energy than Downtown Palo Alto", "less urban transit orientation than downtown districts"]
      }
    },
    compareWith: [
      { slug: "downtown-palo-alto", label: "Downtown Palo Alto", reason: "More walkable downtown and executive meeting context." },
      { slug: "north-bayshore", label: "North Bayshore", reason: "Larger technology campus environment in Mountain View." }
    ]
  },
  {
    slug: "downtown-redwood-city",
    label: "Downtown Redwood City",
    type: "district",
    city: "Redwood City",
    state: "CA",
    path: "/commercial-real-estate/CA/redwood-city/downtown-redwood-city/",
    confidence: "high",
    recommendedFor: ["office", "professional_services", "technology", "peninsula_access"],
    strengths: ["walkable downtown", "Caltrain access", "Peninsula midpoint", "professional-service and technology context"],
    locationAttributes: { transit: "high", parking: "medium", walkability: "high", freewayAccess: "medium", executiveImage: "medium", customerAccess: "high", expansionFlexibility: "medium", costSensitivity: "medium" },
    businessFit: {
      office: {
        fit: "good",
        summary: "Good fit for office users that want a walkable Peninsula downtown with transit access and a balanced regional position.",
        bestFor: ["professional-service firms", "technology teams", "Peninsula-serving businesses"],
        tradeoffs: ["less venture-centered than Palo Alto", "less large-campus identity than North Bayshore or Stanford Research Park"]
      }
    },
    compareWith: [
      { slug: "downtown-palo-alto", label: "Downtown Palo Alto", reason: "Stronger executive and venture ecosystem." },
      { slug: "north-bayshore", label: "North Bayshore", reason: "More technology campus and large floor plate context." }
    ]
  },
  {
    slug: "north-san-jose",
    label: "North San Jose",
    type: "district",
    city: "San Jose",
    state: "CA",
    path: "/commercial-real-estate/CA/san-jose/north-san-jose/",
    confidence: "high",
    recommendedFor: ["office", "r_and_d", "hardware", "manufacturing", "technology"],
    strengths: ["large business parks", "R&D and semiconductor ecosystem", "freeway access", "large floor plate options"],
    locationAttributes: { transit: "medium", parking: "high", walkability: "low", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "high", costSensitivity: "medium" },
    businessFit: {
      office: {
        fit: "good",
        summary: "Good fit for office and R&D users that prioritize expansion flexibility, parking, and Silicon Valley operating access.",
        bestFor: ["engineering teams", "hardware companies", "office/R&D users"],
        tradeoffs: ["less walkable than downtown districts", "less executive-meeting identity than Palo Alto"]
      }
    },
    compareWith: [
      { slug: "moffett-park", label: "Moffett Park", reason: "Another engineering and R&D-oriented business park environment." },
      { slug: "north-bayshore", label: "North Bayshore", reason: "Stronger major technology campus identity." }
    ]
  },
  {
    slug: "moffett-park",
    label: "Moffett Park",
    type: "district",
    city: "Sunnyvale",
    state: "CA",
    path: "/commercial-real-estate/CA/sunnyvale/moffett-park/",
    confidence: "high",
    recommendedFor: ["office", "r_and_d", "engineering", "technology"],
    strengths: ["business park environment", "engineering and R&D context", "Highway 101 access", "larger campus-style buildings"],
    locationAttributes: { transit: "medium", parking: "high", walkability: "low", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "high", costSensitivity: "medium" },
    businessFit: {
      office: {
        fit: "good",
        summary: "Good fit for engineering and R&D-oriented office users that want campus-style buildings and practical access.",
        bestFor: ["engineering teams", "R&D users", "technology operations groups"],
        tradeoffs: ["less walkable and mixed-use than downtown settings", "less executive-facing than Palo Alto"]
      }
    },
    compareWith: [
      { slug: "north-bayshore", label: "North Bayshore", reason: "More prominent large technology campus ecosystem." },
      { slug: "north-san-jose", label: "North San Jose", reason: "Larger South Bay office/R&D corridor with more freeway-oriented options." }
    ]
  },
  {
    slug: "north-bayshore",
    label: "North Bayshore",
    type: "district",
    city: "Mountain View",
    state: "CA",
    path: "/commercial-real-estate/CA/mountain-view/north-bayshore/",
    confidence: "high",
    recommendedFor: ["office", "technology", "ai", "research", "large_campus"],
    strengths: ["major technology campus ecosystem", "large floor plates", "Highway 101 access", "Mountain View innovation context"],
    locationAttributes: { transit: "medium", parking: "high", walkability: "low", freewayAccess: "high", executiveImage: "high", customerAccess: "medium", expansionFlexibility: "high", costSensitivity: "low" },
    businessFit: {
      office: {
        fit: "strong",
        summary: "Strong fit for technology and research-oriented office users that value campus scale and Mountain View talent access.",
        bestFor: ["technology companies", "AI and research teams", "larger engineering groups"],
        tradeoffs: ["less walkable urban environment", "may be less natural for small client-facing professional firms"]
      }
    },
    compareWith: [
      { slug: "moffett-park", label: "Moffett Park", reason: "Similar engineering/R&D business park context with a different Sunnyvale access pattern." },
      { slug: "stanford-research-park", label: "Stanford Research Park", reason: "More Stanford-adjacent mature technology campus identity." }
    ]
  },
  {
    slug: "financial-district-bunker-hill",
    label: "Financial District / Bunker Hill",
    type: "district",
    city: "Los Angeles",
    state: "CA",
    path: "/commercial-real-estate/CA/los-angeles/financial-district-bunker-hill/",
    confidence: "high",
    recommendedFor: ["office", "financial_services", "legal", "professional_services", "executive_access"],
    strengths: ["Downtown LA office core", "executive and client-facing environment", "civic and transit access", "tower inventory"],
    locationAttributes: { transit: "high", parking: "medium", walkability: "high", freewayAccess: "high", executiveImage: "high", customerAccess: "high", expansionFlexibility: "medium", costSensitivity: "medium" },
    businessFit: {
      office: {
        fit: "strong",
        summary: "Strong fit for office users that want a Downtown LA address, client access, and traditional professional-service context.",
        bestFor: ["law firms", "finance and consulting teams", "Downtown LA professional services"],
        tradeoffs: ["less creative/adaptive character than Arts District", "less residential/entertainment edge than South Park"]
      }
    },
    compareWith: [
      { slug: "arts-district", label: "Arts District", reason: "More adaptive, creative, and showroom-oriented environment." },
      { slug: "south-park", label: "South Park", reason: "More mixed-use Downtown LA edge with entertainment and residential adjacency." }
    ]
  },
  {
    slug: "arts-district",
    label: "Arts District",
    type: "district",
    city: "Los Angeles",
    state: "CA",
    path: "/commercial-real-estate/CA/los-angeles/arts-district/",
    confidence: "medium",
    recommendedFor: ["office", "creative", "showroom", "production_adjacent"],
    strengths: ["adaptive buildings", "creative office character", "showroom and production-adjacent context", "Downtown LA edge"],
    locationAttributes: { transit: "medium", parking: "medium", walkability: "medium", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "medium", costSensitivity: "medium" },
    businessFit: {
      office: {
        fit: "good",
        summary: "Good fit for creative office and showroom users that want adaptive character near Downtown LA.",
        bestFor: ["creative firms", "design/showroom users", "production-adjacent businesses"],
        tradeoffs: ["less traditional office-core identity than Bunker Hill", "fit depends heavily on building condition and block context"]
      }
    },
    compareWith: [
      { slug: "financial-district-bunker-hill", label: "Financial District / Bunker Hill", reason: "More traditional office tower and professional-service setting." },
      { slug: "south-park", label: "South Park", reason: "More mixed-use Downtown LA environment." }
    ]
  },
  {
    slug: "south-park",
    label: "South Park",
    type: "district",
    city: "Los Angeles",
    state: "CA",
    path: "/commercial-real-estate/CA/los-angeles/south-park/",
    confidence: "medium",
    recommendedFor: ["office", "creative", "professional_services", "mixed_use"],
    strengths: ["Downtown LA mixed-use context", "entertainment and residential adjacency", "office and retail edge conditions", "central access"],
    locationAttributes: { transit: "medium", parking: "medium", walkability: "high", freewayAccess: "high", executiveImage: "medium", customerAccess: "high", expansionFlexibility: "medium", costSensitivity: "medium" },
    businessFit: {
      office: {
        fit: "good",
        summary: "Good fit for office users that want Downtown LA access with a more mixed-use environment than the traditional financial core.",
        bestFor: ["creative teams", "professional-service users", "companies valuing entertainment and residential adjacency"],
        tradeoffs: ["less formal business identity than Bunker Hill", "not as adaptive/industrial in character as Arts District"]
      }
    },
    compareWith: [
      { slug: "financial-district-bunker-hill", label: "Financial District / Bunker Hill", reason: "More traditional professional office environment." },
      { slug: "arts-district", label: "Arts District", reason: "More adaptive creative office and showroom context." }
    ]
  },
  {
    slug: "san-bruno",
    label: "San Bruno",
    type: "city",
    city: "San Bruno",
    state: "CA",
    path: "/commercial-real-estate/CA/san-bruno/",
    confidence: "expert_guided",
    recommendedFor: ["office", "local_service", "airport_access"],
    strengths: ["Peninsula location", "SFO and regional access", "local-serving commercial context"],
    locationAttributes: { transit: "medium", parking: "medium", walkability: "medium", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "medium", costSensitivity: "medium" },
    businessFit: {
      office: {
        fit: "good",
        summary: "Relevant starting point for local-serving office users and Peninsula teams that value SFO and regional access.",
        bestFor: ["local professional services", "airport-adjacent users", "Peninsula-serving businesses"],
        tradeoffs: ["Rofo has lighter recommendation depth here than in major district clusters", "nearby alternatives should be reviewed with a local expert"]
      }
    },
    compareWith: []
  }
];
