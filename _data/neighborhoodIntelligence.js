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
    headline: "Established Atlanta business district with office, retail, and professional service orientation.",
    modules: [
      {
        title: "Building character",
        text: "Representative buildings suggest a mix of larger office properties and retail-adjacent commercial settings.",
        confidence: "medium",
      },
      {
        title: "Common space types",
        text: "Office and retail are the clearest current signals for this area.",
        confidence: "high",
      },
      {
        title: "Business fit",
        text: "Useful for professional service, financial service, and client-facing office users comparing north Atlanta locations.",
        confidence: "high",
      },
      {
        title: "Access pattern",
        text: "Useful for businesses comparing northern Atlanta districts such as Midtown, Perimeter Center, and Cumberland.",
        confidence: "medium",
      },
    ],
    fit_chips: [
      "Professional services",
      "Financial services",
      "Client-facing offices",
      "Retail-adjacent businesses",
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
        note: "Compare for a more central Atlanta office and mixed-use setting.",
      },
      {
        label: "Perimeter Center",
        note: "Compare for suburban office and regional access patterns.",
      },
      {
        label: "Cumberland / Galleria",
        note: "Compare for another major northside office and retail district.",
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
