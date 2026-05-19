const fs = require("fs");
const path = require("path");

const extractedSignalsPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "research",
  "neighborhood_intelligence_signals_v1.json"
);

const intelligence = {
  "/commercial-real-estate/CA/san-francisco/financial-district/": {
    status: "prototype",
    confidence: "high",
    source_note: "Based on reviewed commercial area data, representative buildings, nearby district links, and durable historical signals.",
    headline: "Downtown office core with strong client access and professional service context.",
    modules: [
      {
        title: "Building character",
        text: "Primarily office towers and established downtown buildings, with smaller professional buildings toward nearby Jackson Square.",
        confidence: "high",
      },
      {
        title: "Common space types",
        text: "Office, retail, and coworking are the clearest signals in Rofo's current data.",
        confidence: "high",
      },
      {
        title: "Business fit",
        text: "Useful for teams that need downtown credibility, client access, and a professional office setting.",
        confidence: "high",
      },
      {
        title: "Access pattern",
        text: "Strong transit orientation and easy access to the broader downtown San Francisco market.",
        confidence: "high",
      },
    ],
    fit_chips: [
      "Professional services",
      "Client-facing teams",
      "Finance and legal",
      "Downtown office users",
      "Transit-focused teams",
    ],
    building_scale_patterns: [
      "Larger office buildings",
      "Downtown towers",
      "Street-level retail context",
      "Nearby boutique office pockets",
    ],
    nearby_alternatives: [
      {
        label: "Jackson Square",
        note: "Compare for a smaller boutique office feel near the downtown core.",
      },
      {
        label: "Union Square",
        note: "Compare for stronger retail and visitor-facing activity.",
      },
      {
        label: "SoMa",
        note: "Compare for a broader mix of office, creative, and larger floorplate options.",
      },
    ],
  },
  "/commercial-real-estate/GA/atlanta/buckhead/": {
    status: "prototype",
    confidence: "high",
    source_note: "Based on reviewed commercial area data, representative buildings, nearby district links, and durable office and retail signals.",
    headline: "North Atlanta office district for executive access, client meetings, professional services, and high-service retail support.",
    modules: [
      {
        title: "Building character",
        text: "Buckhead is built around larger office properties, hotels, restaurants, and client-facing commercial settings near affluent northside residential areas.",
        confidence: "medium",
      },
      {
        title: "Common space types",
        text: "Office and retail anchor the pattern, with hospitality and service uses supporting meetings, workday errands, and executive routines.",
        confidence: "high",
      },
      {
        title: "Business fit",
        text: "Companies choose Buckhead when they want a northside Atlanta address, executive accessibility, and a business environment that reads established rather than experimental.",
        confidence: "high",
      },
      {
        title: "Access pattern",
        text: "Compared with Midtown, Buckhead is less transit-led and more executive-facing; compared with Perimeter Center, it offers a more established urban business address.",
        confidence: "medium",
      },
    ],
    fit_chips: [
      "Professional services",
      "Financial services",
      "Client-facing offices",
      "Executive access",
      "North Atlanta market users",
    ],
    building_scale_patterns: [
      "Larger office buildings",
      "Retail and mixed-use context",
      "Established business district setting",
      "Regional comparison value",
    ],
    nearby_alternatives: [
      {
        label: "Midtown",
        note: "Compare for denser, more transit-oriented office and institutional surroundings.",
      },
      {
        label: "Perimeter Center",
        note: "Compare for larger suburban office settings and stronger freeway orientation.",
      },
      {
        label: "Cumberland / Galleria",
        note: "Compare for northwest access, office parks, retail, and event-adjacent activity.",
      },
    ],
  },
  "/commercial-real-estate/GA/atlanta/midtown/": {
    status: "prototype",
    confidence: "high",
    source_note: "Based on reviewed commercial area data, representative buildings, nearby district links, and durable office, institutional, retail, and mixed-use signals.",
    headline: "Central Atlanta office and mixed-use district where transit, universities, arts, hotels, apartments, and street-level activity overlap.",
    modules: [
      {
        title: "Building character",
        text: "Midtown has a denser, more vertical pattern than Buckhead, with office towers, mixed-use blocks, institutional anchors, hotels, and walkable retail clustered around Peachtree and MARTA.",
        confidence: "high",
      },
      {
        title: "Common space types",
        text: "Office, retail, hospitality, and mixed-use commercial settings sit close together, so the district can support work, visitors, employees, and after-hours activity.",
        confidence: "high",
      },
      {
        title: "Business fit",
        text: "Companies choose Midtown for central visibility, transit access, talent proximity, and a setting that feels more urban and mixed-use than Buckhead or Perimeter Center.",
        confidence: "high",
      },
      {
        title: "Access pattern",
        text: "Compared with Buckhead, Midtown is denser and more transit-oriented; compared with Downtown, it is less civic and more mixed-use.",
        confidence: "high",
      },
    ],
    fit_chips: [
      "Transit-oriented teams",
      "Client-facing offices",
      "Talent-access users",
      "Institution-adjacent businesses",
      "Mixed-use district users",
    ],
    building_scale_patterns: [
      "Office towers",
      "Mixed-use blocks",
      "Institutional adjacency",
      "Street-level retail activity",
    ],
    nearby_alternatives: [
      {
        label: "Buckhead",
        note: "Compare for a more executive northside office address with stronger client-facing retail context.",
      },
      {
        label: "Downtown Atlanta",
        note: "Compare for civic, government, convention, and traditional CBD context.",
      },
      {
        label: "West Midtown",
        note: "Compare for adaptive-reuse, showroom, and creative office character.",
      },
    ],
  },
  "/commercial-real-estate/GA/atlanta/downtown-atlanta/": {
    status: "prototype",
    confidence: "high",
    source_note: "Based on reviewed commercial area data, representative buildings, nearby district links, and durable office, civic, institutional, and hospitality signals.",
    headline: "Atlanta's institutional downtown core, shaped by office, government, legal, university, hotel, transit, and event-driven demand.",
    modules: [
      {
        title: "Building character",
        text: "Downtown Atlanta reads as a classic central business district: office buildings, civic institutions, hotels, convention activity, and transit access in a formal urban grid.",
        confidence: "high",
      },
      {
        title: "Common space types",
        text: "Office, civic-adjacent services, hospitality, universities, and street-level retail shape a commercial mix that is more institutional than lifestyle-oriented.",
        confidence: "high",
      },
      {
        title: "Business fit",
        text: "Companies choose Downtown when courts, government, universities, hotels, MARTA, or convention activity matter more than a polished northside office setting.",
        confidence: "high",
      },
      {
        title: "Access pattern",
        text: "Compared with Midtown, Downtown is more civic and institutional; compared with West Midtown, it is more transit-connected and less adaptive-reuse oriented.",
        confidence: "high",
      },
    ],
    fit_chips: [
      "Civic-adjacent users",
      "Legal and professional services",
      "Transit-oriented teams",
      "Hospitality-adjacent businesses",
      "Institutional users",
    ],
    building_scale_patterns: [
      "CBD office buildings",
      "Civic and institutional anchors",
      "Hotel and convention context",
      "Transit-connected blocks",
    ],
    nearby_alternatives: [
      {
        label: "Midtown",
        note: "Compare for a denser mixed-use office district with stronger residential and university overlap.",
      },
      {
        label: "South Downtown",
        note: "Compare for smaller-scale historic blocks and downtown-adjacent repositioning.",
      },
      {
        label: "West Midtown",
        note: "Compare for creative, showroom, and adaptive-reuse commercial settings.",
      },
    ],
  },
  "/commercial-real-estate/GA/atlanta/perimeter-center/": {
    status: "prototype",
    confidence: "high",
    source_note: "Based on reviewed commercial area data, representative buildings, nearby district links, and durable suburban office, retail, and freeway access signals.",
    headline: "Regional suburban office node for larger floorplates, parking, freeway access, and north metro commute patterns.",
    modules: [
      {
        title: "Building character",
        text: "Perimeter Center is organized around larger office properties, retail concentration, hotels, and auto-accessible campuses near I-285 and GA 400 rather than a downtown street grid.",
        confidence: "high",
      },
      {
        title: "Common space types",
        text: "Office and retail dominate, with parking, direct freeway access, and campus-style buildings playing a larger role than street-level walkability.",
        confidence: "high",
      },
      {
        title: "Business fit",
        text: "Companies choose Perimeter Center for regional reach, larger office requirements, and access to north metro employees without moving into Midtown or Downtown.",
        confidence: "high",
      },
      {
        title: "Access pattern",
        text: "Compared with Buckhead, Perimeter Center is more freeway- and campus-oriented; compared with Midtown, it is less urban but often easier for regional car commutes.",
        confidence: "high",
      },
    ],
    fit_chips: [
      "Regional office users",
      "Larger teams",
      "Parking-sensitive tenants",
      "North metro access",
      "Suburban office users",
    ],
    building_scale_patterns: [
      "Larger office properties",
      "Auto-accessible campuses",
      "Retail and hotel support",
      "Freeway-oriented submarket",
    ],
    nearby_alternatives: [
      {
        label: "Buckhead",
        note: "Compare for a more established urban business address and client-facing retail setting.",
      },
      {
        label: "Cumberland / Galleria",
        note: "Compare for northwest metro access and another major suburban office-retail node.",
      },
      {
        label: "Midtown",
        note: "Compare for transit, central visibility, and a denser mixed-use environment.",
      },
    ],
  },
  "/commercial-real-estate/GA/atlanta/west-midtown/": {
    status: "prototype",
    confidence: "high",
    source_note: "Based on reviewed commercial area data, representative buildings, nearby district links, and durable industrial, flex, showroom, retail, and office signals.",
    headline: "Westside creative-commercial district with adaptive reuse, showroom, restaurant, office, flex, and light industrial character.",
    modules: [
      {
        title: "Building character",
        text: "West Midtown is less formal than Midtown or Buckhead, with converted industrial buildings, showroom-oriented spaces, creative offices, restaurants, and service uses mixed into a westside street grid.",
        confidence: "high",
      },
      {
        title: "Common space types",
        text: "Flex, showroom, office, retail, restaurant, and production-adjacent uses define the commercial texture.",
        confidence: "high",
      },
      {
        title: "Business fit",
        text: "Companies choose West Midtown when brand, design, food and beverage proximity, production-adjacent space, or a less conventional office environment matters.",
        confidence: "high",
      },
      {
        title: "Access pattern",
        text: "Compared with Midtown, West Midtown is more adaptive-reuse and car-oriented; compared with Downtown, it is less civic and more creative-commercial.",
        confidence: "high",
      },
    ],
    fit_chips: [
      "Creative office users",
      "Showroom businesses",
      "Design and production teams",
      "Food-adjacent brands",
      "Flex-space users",
    ],
    building_scale_patterns: [
      "Converted industrial buildings",
      "Showroom and flex context",
      "Creative office character",
      "Restaurant and retail adjacency",
    ],
    nearby_alternatives: [
      {
        label: "Midtown",
        note: "Compare for a more vertical, transit-oriented office and mixed-use district.",
      },
      {
        label: "Downtown Atlanta",
        note: "Compare for civic, institutional, and traditional CBD context.",
      },
      {
        label: "Old Fourth Ward",
        note: "Compare for eastside retail, food, and neighborhood mixed-use activity.",
      },
    ],
  },
  "/commercial-real-estate/CA/los-angeles/arts-district/": {
    status: "prototype",
    confidence: "high",
    source_note: "Based on reviewed commercial area data, representative buildings, nearby district links, and durable creative office, industrial, retail, and warehouse signals.",
    headline: "Creative commercial district with warehouse, office, retail, and mixed-use signals.",
    modules: [
      {
        title: "Building character",
        text: "Converted warehouse, industrial, retail, and creative office signals are stronger here than in many nearby districts.",
        confidence: "high",
      },
      {
        title: "Common space types",
        text: "Office, industrial, and retail are the clearest current signals.",
        confidence: "high",
      },
      {
        title: "Business fit",
        text: "Useful for creative office, design, showroom, production, and retail-adjacent users.",
        confidence: "high",
      },
      {
        title: "Access pattern",
        text: "Often compared with Downtown Los Angeles, Little Tokyo, and the Fashion District.",
        confidence: "high",
      },
    ],
    fit_chips: [
      "Creative office users",
      "Showroom-oriented businesses",
      "Design and production teams",
      "Retail-adjacent brands",
      "Mixed-use commercial users",
    ],
    building_scale_patterns: [
      "Converted warehouse context",
      "Creative office character",
      "Industrial-adjacent buildings",
      "Street-level retail activity",
    ],
    nearby_alternatives: [
      {
        label: "Downtown Los Angeles",
        note: "Compare for a larger office and civic business district.",
      },
      {
        label: "Little Tokyo",
        note: "Compare for a nearby mixed commercial district with a finer-grain setting.",
      },
      {
        label: "Fashion District",
        note: "Compare for retail, showroom, and product-oriented commercial context.",
      },
    ],
  },
  "/commercial-real-estate/TX/dallas/uptown/": {
    status: "prototype",
    confidence: "high",
    source_note: "Based on reviewed commercial area data, representative buildings, nearby district links, and durable office, retail, mixed-use, and transit-oriented signals.",
    headline: "Mixed office and retail district close to Downtown Dallas and the Arts District.",
    modules: [
      {
        title: "Building character",
        text: "Representative buildings suggest a mix of office buildings, retail context, and walkable district activity.",
        confidence: "medium",
      },
      {
        title: "Common space types",
        text: "Office and retail are the clearest current signals.",
        confidence: "high",
      },
      {
        title: "Business fit",
        text: "Useful for office users, retail-adjacent businesses, and teams comparing downtown-adjacent Dallas districts.",
        confidence: "high",
      },
      {
        title: "Access pattern",
        text: "Useful for comparing Uptown with Downtown Dallas, Victory Park, Turtle Creek, and the Arts District.",
        confidence: "high",
      },
    ],
    fit_chips: [
      "Office users",
      "Retail-adjacent businesses",
      "Client-facing teams",
      "Mixed-use district users",
      "Downtown-adjacent teams",
    ],
    building_scale_patterns: [
      "Office buildings",
      "Retail context",
      "Mixed-use surroundings",
      "Nearby downtown alternatives",
    ],
    nearby_alternatives: [
      {
        label: "Arts District",
        note: "Compare for cultural and downtown-adjacent office context.",
      },
      {
        label: "Victory Park",
        note: "Compare for a nearby mixed-use district setting.",
      },
      {
        label: "Downtown Dallas",
        note: "Compare for a broader central business district environment.",
      },
    ],
  },
  "/commercial-real-estate/CA/san-diego/kearny-mesa/": {
    status: "prototype",
    confidence: "high",
    source_note: "Based on reviewed commercial area data, representative buildings, nearby district links, and durable office, industrial, retail, and freeway access signals.",
    headline: "Central San Diego business district with office, industrial, retail, and freeway access signals.",
    modules: [
      {
        title: "Building character",
        text: "Representative buildings suggest suburban office, flex, and industrial-adjacent commercial patterns.",
        confidence: "high",
      },
      {
        title: "Common space types",
        text: "Office, industrial, and retail are the clearest current signals.",
        confidence: "high",
      },
      {
        title: "Business fit",
        text: "Useful for office, flex, service, and light industrial users that prioritize central San Diego access.",
        confidence: "high",
      },
      {
        title: "Access pattern",
        text: "Freeway access and central-market positioning are important comparison factors for this area.",
        confidence: "high",
      },
    ],
    fit_chips: [
      "Office users",
      "Flex and light industrial users",
      "Service businesses",
      "Teams prioritizing freeway access",
      "Central San Diego searchers",
    ],
    building_scale_patterns: [
      "Suburban office buildings",
      "Flex and industrial-adjacent buildings",
      "Retail and service context",
      "Auto-accessible business district",
    ],
    nearby_alternatives: [
      {
        label: "Mission Valley",
        note: "Compare for a broader office and retail corridor.",
      },
      {
        label: "Sorrento Valley",
        note: "Compare for a stronger technology and life science office context.",
      },
      {
        label: "University City",
        note: "Compare for a higher-profile office and campus-oriented market.",
      },
    ],
  },
  "/commercial-real-estate/CA/oakland/downtown-oakland/": {
    status: "editorial",
    confidence: "reviewed",
    headline: "East Bay institutional business core with BART access, civic adjacency, and professional office depth.",
    modules: [
      {
        title: "Building character",
        text: "Downtown Oakland is the East Bay's formal business core: civic institutions, BART access, professional office buildings, and older downtown blocks clustered around Broadway and City Center.",
      },
      {
        title: "Common space types",
        text: "The public story should emphasize office and professional-service context, with street-level retail as support rather than the main identity.",
      },
      {
        title: "Business fit",
        text: "It fits organizations that want regional transit access, public-sector or nonprofit adjacency, and a practical East Bay alternative to San Francisco's Financial District.",
      },
      {
        title: "Access pattern",
        text: "Compared with Uptown, Downtown Oakland reads more institutional and office-oriented. Compared with Jack London Square, it is less waterfront and more civic and transit focused.",
      },
    ],
    fit_chips: [
      "Legal and professional services",
      "Nonprofits and civic-adjacent teams",
      "Transit-oriented office users",
      "East Bay regional headquarters",
    ],
    building_scale_patterns: [
      "Downtown office buildings",
      "Civic and institutional blocks",
      "Broadway office corridor",
      "Street-level retail support",
    ],
    nearby_alternatives: [
      {
        label: "Uptown Oakland",
        note: "More mixed-use and smaller-company oriented, with stronger Uptown arts and retail context.",
      },
      {
        label: "Jack London Square",
        note: "More waterfront and warehouse-adjacent, with service-commercial and adaptive texture.",
      },
      {
        label: "San Francisco Financial District",
        note: "More traditional regional CBD setting across the bay, usually with stronger client-facing downtown presence.",
      },
    ],
  },
  "/commercial-real-estate/CA/oakland/uptown-oakland/": {
    status: "editorial",
    confidence: "reviewed",
    headline: "Mixed-use Oakland office district for smaller-company, arts-adjacent, and transit-oriented teams.",
    modules: [
      {
        title: "Building character",
        text: "Uptown Oakland is the more mixed-use counterpart to Downtown Oakland, with office buildings, arts venues, food, apartments, BART access, and Lake Merritt-adjacent commercial blocks sharing a tighter urban setting.",
      },
      {
        title: "Common space types",
        text: "Office remains the clearest commercial pattern, but the district should read through its mixed-use setting rather than as another formal downtown core.",
      },
      {
        title: "Business fit",
        text: "It works for teams that want East Bay access and professional office options without the formality of the civic downtown core.",
      },
      {
        title: "Access pattern",
        text: "Compared with Downtown Oakland, Uptown feels less institutional and more mixed-use. Compared with Jack London Square, it is less waterfront and more Broadway, Franklin, Webster, and Lake Merritt oriented.",
      },
    ],
    fit_chips: [
      "Small and mid-sized office users",
      "Creative and professional service teams",
      "Nonprofit organizations",
      "East Bay access with street-level context",
    ],
    building_scale_patterns: [
      "Mid-rise office buildings",
      "Broadway and Franklin office fabric",
      "Lake Merritt-adjacent commercial blocks",
      "Food, arts, and retail support",
    ],
    nearby_alternatives: [
      {
        label: "Downtown Oakland",
        note: "More formal, civic, and traditional office-core oriented.",
      },
      {
        label: "Jack London Square",
        note: "More waterfront and service-commercial, with warehouse-adjacent texture.",
      },
      {
        label: "Temescal",
        note: "More neighborhood retail and small-business oriented north of Uptown.",
      },
    ],
  },
  "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/": {
    status: "editorial",
    confidence: "reviewed",
    headline: "Walkable Peninsula downtown for startup, professional service, and client-facing office users.",
    modules: [
      {
        title: "Building character",
        text: "Downtown Palo Alto is a compact Peninsula business district where low-rise office buildings, restaurants, retail, Caltrain access, and startup/professional-service demand sit close together.",
      },
      {
        title: "Common space types",
        text: "Office and retail-supported commercial blocks shape the core pattern, with smaller professional buildings around Hamilton, Lytton, and University Avenue.",
      },
      {
        title: "Business fit",
        text: "It fits teams that want a walkable client-facing address rather than a campus or highway-corridor office setting.",
      },
      {
        title: "Access pattern",
        text: "Compared with Mountain View, Downtown Palo Alto is more downtown-oriented and client-facing. Compared with Redwood City, it is smaller and more tightly tied to startup, venture, and professional-service routines.",
      },
    ],
    fit_chips: [
      "Startup and venture-adjacent teams",
      "Professional service firms",
      "Client-facing Peninsula offices",
      "Walkability-focused office users",
    ],
    building_scale_patterns: [
      "Low-rise downtown office buildings",
      "Retail-supported commercial streets",
      "Hamilton and Lytton office blocks",
      "Caltrain-adjacent downtown fabric",
    ],
    nearby_alternatives: [
      {
        label: "Mountain View / Castro-Whisman",
        note: "More R&D and startup-corridor oriented, with broader Castro and Whisman context.",
      },
      {
        label: "Redwood City Downtown",
        note: "More civic and mid-Peninsula downtown oriented, with a larger entertainment and Caltrain-adjacent core.",
      },
      {
        label: "California Avenue",
        note: "More local and secondary commercial corridor compared with the University Avenue downtown core.",
      },
    ],
  },
};

if (fs.existsSync(extractedSignalsPath)) {
  const extracted = JSON.parse(fs.readFileSync(extractedSignalsPath, "utf8"));

  for (const target of extracted.targets || []) {
    if (!intelligence[target.canonical_path]) continue;

    intelligence[target.canonical_path].derived_signal_chips =
      (target.public_signal_chips || []).map((signal) => ({
        key: signal.key,
        label: signal.label,
        confidence: signal.confidence,
      }));
    intelligence[target.canonical_path].derived_signal_source =
      "Representative building and listing-derived commercial signal extraction";
  }
}

module.exports = intelligence;
