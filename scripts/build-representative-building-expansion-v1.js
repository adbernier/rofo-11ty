const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const RAW_LISTINGS_PATH = path.join(ROOT, "temp_data/raw-listings.json");
const BUILDING_PAGES_PATH = path.join(ROOT, "_data/buildingPages.js");
const REPRESENTATIVE_CARDS_PATH = path.join(ROOT, "_data/representativeBuildingCards.js");
const OUTPUT_DATA_PATH = path.join(ROOT, "_data/representativeBuildingCardExpansions.js");
const OUTPUT_JSON_PATH = path.join(ROOT, "data/reports/representative-building-expansion-v1.json");
const OUTPUT_MD_PATH = path.join(ROOT, "data/reports/representative-building-expansion-v1.md");

const MAX_GENERATED_CARDS = 15;
const MIN_LISTING_EVIDENCE_FOR_CARD = 1;

const KEYWORDS = {
  office: [
    ["Class A", /\bclass\s*a\b/i],
    ["office", /\boffice\b/i],
    ["professional", /\bprofessional\b/i],
    ["headquarters", /\bheadquarters?\b|\bhq\b/i],
    ["creative office", /\bcreative\s+office\b/i],
    ["coworking", /\bcowork(?:ing)?\b/i],
    ["tenant improvements", /\btenant\s+improvements?\b|\bTI\b/i],
    ["medical office", /\bmedical\s+office\b|\bmedical\b/i],
  ],
  industrial: [
    ["warehouse", /\bwarehouse\b/i],
    ["distribution", /\bdistribution\b/i],
    ["dock-high", /\bdock[-\s]?high\b|\bdock\b/i],
    ["loading", /\bloading\b|\bloading\s+dock\b/i],
    ["truck court", /\btruck\s+court\b|\btruck\b/i],
    ["clear height", /\bclear\s+height\b/i],
    ["yard", /\byard\b/i],
    ["rail", /\brail\b/i],
    ["freezer", /\bfreezer\b/i],
    ["cold storage", /\bcold\s+storage\b/i],
    ["manufacturing", /\bmanufactur(?:ing|er)\b/i],
    ["industrial park", /\bindustrial\s+park\b/i],
    ["logistics", /\blogistics\b/i],
    ["port", /\bport\b/i],
    ["freeway access", /\bfreeway\b|\binterstate\b|\bhighway\b|\bi-\d+\b/i],
  ],
  life_science: [
    ["lab", /\blab\b|\blaboratory\b/i],
    ["wet lab", /\bwet\s+lab\b/i],
    ["life science", /\blife\s+science\b/i],
    ["biotech", /\bbiotech\b|\bbiotechnology\b/i],
    ["R&D", /\br&d\b|\bresearch\s+and\s+development\b/i],
    ["research", /\bresearch\b/i],
    ["clean room", /\bclean\s+room\b|\bcleanroom\b/i],
    ["GMP", /\bgmp\b/i],
    ["engineering", /\bengineering\b/i],
    ["innovation", /\binnovation\b/i],
  ],
  retail: [
    ["showroom", /\bshowroom\b/i],
    ["storefront", /\bstorefront\b/i],
    ["retail", /\bretail\b/i],
    ["restaurant", /\brestaurant\b/i],
    ["service retail", /\bservice\s+retail\b/i],
    ["mixed-use", /\bmixed[-\s]?use\b/i],
  ],
};

const TARGETS = [
  {
    name: "Long Island City",
    path: "/commercial-real-estate/NY/long-island-city/long-island-city/",
    city: "Long Island City",
    state: "NY",
    archetype: "Queens office/flex and production market",
    focus: ["office", "industrial", "retail"],
  },
  {
    name: "Energy Corridor",
    path: "/commercial-real-estate/TX/houston/energy-corridor/",
    city: "Houston",
    state: "TX",
    archetype: "west Houston corporate and energy office corridor",
    focus: ["office"],
    includeTerms: ["energy corridor", "katy freeway", "park row", "broadfield", "park ten", "eldridge", "dairy ashford"],
    excludeTerms: ["westchase"],
  },
  {
    name: "Round Rock",
    path: "/commercial-real-estate/TX/round-rock/round-rock/",
    city: "Round Rock",
    state: "TX",
    archetype: "north Austin office, medical, flex, and manufacturing-support market",
    focus: ["office", "industrial"],
  },
  {
    name: "Downtown Oakland",
    path: "/commercial-real-estate/CA/oakland/downtown-oakland/",
    city: "Oakland",
    state: "CA",
    archetype: "BART-centered civic and East Bay office core",
    focus: ["office", "retail"],
    includeTerms: ["downtown oakland", "broadway", "harrison", "14th st", "kaiser", "city center", "franklin"],
    excludeTerms: ["jack london"],
  },
  {
    name: "The Domain",
    path: "/commercial-real-estate/TX/austin/the-domain/",
    city: "Austin",
    state: "TX",
    archetype: "north Austin tech office and mixed-use campus district",
    focus: ["office", "retail"],
    includeTerms: ["domain", "feathergrass", "stonelake", "boyer", "braker", "burnet"],
  },
  {
    name: "Chandler",
    path: "/commercial-real-estate/AZ/chandler/chandler/",
    city: "Chandler",
    state: "AZ",
    archetype: "East Valley office, semiconductor, flex, and professional market",
    focus: ["office", "industrial", "life_science"],
  },
  {
    name: "Denver Tech Center",
    path: "/commercial-real-estate/CO/denver/denver-tech-center/",
    city: "Denver",
    state: "CO",
    archetype: "southeast Denver corporate office core",
    focus: ["office"],
    includeTerms: ["denver tech center", "dtc", "syracuse", "ulster", "union", "belleview", "technology center"],
  },
  {
    name: "Downtown Palo Alto",
    path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/",
    city: "Palo Alto",
    state: "CA",
    archetype: "walkable Peninsula professional and startup office district",
    focus: ["office", "retail"],
    includeTerms: ["university ave", "hamilton", "lytton", "alma", "emerson", "ramona", "cowper", "waverley", "bryant", "high st"],
  },
  {
    name: "North San Jose",
    path: "/commercial-real-estate/CA/san-jose/north-san-jose/",
    city: "San Jose",
    state: "CA",
    archetype: "technology office, R&D, and flex business-park district",
    focus: ["office", "industrial", "life_science"],
    includeTerms: ["north san jose", "zanker", "gateway", "brokaw", "trimble", "component", "charcot", "junction", "orchard", "river oaks", "montague"],
  },
  {
    name: "Commerce City",
    path: "/commercial-real-estate/CO/commerce-city/commerce-city/",
    city: "Commerce City",
    state: "CO",
    archetype: "Denver industrial, logistics, manufacturing, and service-commercial market",
    focus: ["industrial"],
  },
  {
    name: "Elizabeth Industrial",
    path: "/commercial-real-estate/NJ/elizabeth/elizabeth-industrial/",
    city: "Elizabeth",
    state: "NJ",
    archetype: "port and airport-adjacent warehouse and logistics market",
    focus: ["industrial"],
    includeTerms: ["elizabeth", "warehouse", "port", "airport", "industrial"],
  },
  {
    name: "Industry City / Sunset Park",
    path: "/commercial-real-estate/NY/new-york/industry-city-sunset-park/",
    city: "New York",
    state: "NY",
    archetype: "Brooklyn industrial, production, creative flex, and waterfront district",
    focus: ["industrial", "office", "retail"],
    includeTerms: ["industry city", "sunset park"],
  },
  {
    name: "JFK Airport Area",
    path: "/commercial-real-estate/NY/new-york/jfk-airport-area/",
    city: "New York",
    state: "NY",
    archetype: "airport-adjacent logistics, freight, warehouse, and service-commercial market",
    focus: ["industrial"],
    includeTerms: ["jfk", "airport", "cargo", "freight", "jamaica", "rockaway", "conduit"],
    excludeTerms: ["john f kennedy pkwy", "john f. kennedy pkwy"],
  },
  {
    name: "Port Newark / Elizabeth",
    path: "/commercial-real-estate/NJ/newark/port-newark-elizabeth/",
    city: "Newark",
    state: "NJ",
    archetype: "port-core freight, drayage, warehouse, and container logistics market",
    focus: ["industrial"],
    includeTerms: ["port newark", "port", "warehouse", "industrial", "logistics", "freight"],
    excludeTerms: ["gateway center"],
  },
];

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function compactText(row) {
  return [
    row.name,
    row.address,
    row.city,
    row.property_description,
    row.space_description,
    row.raw_space_type,
    row.space_type,
    row.lease_category,
  ]
    .filter(Boolean)
    .join(" ");
}

function normalizeAddress(address) {
  return String(address || "")
    .toLowerCase()
    .replace(/\b(suite|ste|unit|floor|fl)\b.*$/i, "")
    .replace(/[.,#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function displayAddress(address) {
  return String(address || "").replace(/\s+/g, " ").trim();
}

function scoreFromCount(count, max = 10) {
  if (!count) return 0;
  return Math.max(1, Math.min(5, Math.ceil((count / max) * 5)));
}

function scoreSize(size) {
  const numeric = Number(size || 0);
  if (numeric >= 250000) return 5;
  if (numeric >= 100000) return 4;
  if (numeric >= 50000) return 3;
  if (numeric >= 10000) return 2;
  return 1;
}

function hasAny(text, terms = []) {
  const lower = normalizeText(text);
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function isExcluded(text, terms = []) {
  return hasAny(text, terms);
}

function matchListing(target, row) {
  if (row.state_abbr !== target.state) return false;
  const text = compactText(row);
  if (isExcluded(text, target.excludeTerms)) return false;

  const cityMatch = row.city === target.city;
  if (!target.includeTerms || !target.includeTerms.length) return cityMatch;

  const termMatch = hasAny(text, target.includeTerms);
  if (target.city === "New York" || target.city === "Newark") return cityMatch && termMatch;
  return cityMatch && (termMatch || !target.includeTerms.length);
}

function detectKeywords(rows, focus) {
  const joined = rows.map(compactText).join(" ");
  const matches = [];
  const categories = {};

  Object.entries(KEYWORDS).forEach(([category, patterns]) => {
    if (focus && focus.length && !focus.includes(category)) return;
    const categoryMatches = patterns
      .filter(([, regex]) => regex.test(joined))
      .map(([label]) => label);
    if (categoryMatches.length) {
      categories[category] = categoryMatches;
      matches.push(...categoryMatches);
    }
  });

  return {
    categories,
    keywords: [...new Set(matches)].slice(0, 6),
  };
}

function inferType(categories, rows) {
  const categoryKeys = Object.keys(categories);
  const spaceTypes = [...new Set(rows.map((row) => row.space_type || row.raw_space_type).filter(Boolean))];
  const has = (category) => categoryKeys.includes(category);

  if (has("life_science") && has("office")) return "Office / R&D";
  if (has("life_science")) return "Life science / R&D";
  if (has("industrial") && has("office")) return "Office / flex";
  if (has("industrial")) return categories.industrial.includes("distribution") || categories.industrial.includes("logistics")
    ? "Warehouse / logistics"
    : "Industrial / flex";
  if (has("retail") && has("office")) return "Office / street-level commercial";
  if (has("retail")) return "Retail / showroom";
  if (spaceTypes.some((type) => normalizeText(type).includes("cowork"))) return "Office / coworking";
  if (spaceTypes.some((type) => normalizeText(type).includes("office"))) return "Office";
  return "Commercial building";
}

function descriptorFor(type, count, keywords) {
  const keywordText = keywords.length ? keywords.slice(0, 3).join(", ") : "commercial-use";
  const plurality = count === 1 ? "listing" : "listings";
  return `Recurring historical ${plurality} at this address point to ${type.toLowerCase()} use, including ${keywordText}.`;
}

function reasonFor(target, type) {
  return `Represents a recurring ${type.toLowerCase()} property pattern within ${target.name}'s ${target.archetype}.`;
}

function confidenceFor(group, keywords) {
  if (group.rows.length >= 5 && keywords.length >= 4) return "high";
  if (group.rows.length >= 2 && keywords.length >= 3) return "medium";
  if (group.rows.length >= 1 && keywords.length >= 2) return "medium";
  return "low";
}

function buildGroups(target, rawListings) {
  const matched = rawListings.filter((row) => matchListing(target, row));
  const groups = new Map();

  matched.forEach((row) => {
    const key = normalizeAddress(row.address || row.name);
    if (!key) return;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        address: displayAddress(row.address || row.name),
        names: new Map(),
        rows: [],
      });
    }
    const group = groups.get(key);
    group.rows.push(row);
    const name = row.name && row.name !== row.address ? row.name : "";
    if (name) group.names.set(name, (group.names.get(name) || 0) + 1);
  });

  return [...groups.values()];
}

function publicNameFor(target, group) {
  const sortedNames = [...group.names.entries()].sort((a, b) => b[1] - a[1]);
  const best = sortedNames[0] && sortedNames[0][0];
  const lowerBest = normalizeText(best);
  const genericName =
    !best ||
    lowerBest.includes("spaces") ||
    lowerBest.includes("regus") ||
    lowerBest.includes("servcorp") ||
    lowerBest.includes("wework") ||
    lowerBest.includes("airport") ||
    lowerBest === normalizeText(target.name) ||
    lowerBest.startsWith(`${normalizeText(target.state)},`) ||
    lowerBest.startsWith(`${normalizeText(target.city)},`) ||
    lowerBest.startsWith("tx, ") ||
    lowerBest.startsWith("ny, ") ||
    lowerBest.startsWith("ca, ") ||
    lowerBest.startsWith("co, ") ||
    lowerBest.startsWith("az, ") ||
    lowerBest.startsWith("nj, ");

  if (best && !genericName && normalizeAddress(best) !== normalizeAddress(group.address)) {
    return best;
  }
  return group.address;
}

function bestBuildingPath(rows) {
  const pathCounts = new Map();
  rows.forEach((row) => {
    if (!row.building_path) return;
    pathCounts.set(row.building_path, (pathCounts.get(row.building_path) || 0) + 1);
  });
  return [...pathCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function scoreGroup(target, group) {
  const { categories, keywords } = detectKeywords(group.rows, target.focus);
  const sourceCompanies = new Set(group.rows.map((row) => row.source_company).filter(Boolean));
  const totalSize = Math.max(...group.rows.map((row) => Number(row.property_size || row.space_size || 0)));
  const termFit = target.includeTerms && target.includeTerms.length
    ? hasAny(group.rows.map(compactText).join(" "), target.includeTerms)
    : true;
  const typeClarity = Object.keys(categories).length ? 4 : 2;
  const districtConsistency = termFit ? 5 : 3;
  const keywordRelevance = Math.min(5, Math.max(0, keywords.length));
  const commercialRelevance = Math.min(5, typeClarity + (keywords.length >= 3 ? 1 : 0));
  const evidence = {
    listing_frequency: scoreFromCount(group.rows.length, 10),
    recent_activity: 3,
    keyword_relevance: keywordRelevance,
    building_prominence: Math.max(scoreSize(totalSize), bestBuildingPath(group.rows) ? 3 : 1),
    multiple_listing_references: Math.max(scoreFromCount(group.rows.length, 8), sourceCompanies.size >= 2 ? 4 : 1),
    district_consistency: districtConsistency,
    commercial_relevance: commercialRelevance,
  };
  const representativeScore = Math.round(
    evidence.listing_frequency * 3.6 +
      evidence.recent_activity * 2.4 +
      evidence.keyword_relevance * 3.6 +
      evidence.building_prominence * 2.8 +
      evidence.multiple_listing_references * 2.4 +
      evidence.district_consistency * 2.8 +
      evidence.commercial_relevance * 2.4
  );

  return {
    categories,
    keywords,
    evidence,
    representativeScore,
    sourceCompanies: [...sourceCompanies],
  };
}

function cardFromGroup(target, group, scored) {
  const type = inferType(scored.categories, group.rows);
  return {
    name: publicNameFor(target, group),
    address: group.address,
    building_type_summary: type,
    size: null,
    descriptor: descriptorFor(type, group.rows.length, scored.keywords),
    representative_reason: reasonFor(target, type),
    canonical_path: bestBuildingPath(group.rows),
    image: null,
    source_basis: "listing_corpus_keyword_extraction_v1",
    source_confidence: confidenceFor(group, scored.keywords),
    keyword_tags: scored.keywords,
    evidence: scored.evidence,
  };
}

function dedupeCards(cards) {
  const seen = new Set();
  return cards.filter((card) => {
    const key = normalizeAddress(card.address || card.name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function existingCount(baseCardsByPath, target) {
  return baseCardsByPath[target.path]?.length || 0;
}

function writeJsOutput(generatedByPath, summary) {
  const body = `// Generated by scripts/build-representative-building-expansion-v1.js
// Internal representative building card expansion derived primarily from raw listing descriptions.

const byDistrictPath = ${JSON.stringify(generatedByPath, null, 2)};

module.exports = {
  byDistrictPath,
  summary: ${JSON.stringify(summary, null, 2)},
};
`;
  fs.writeFileSync(OUTPUT_DATA_PATH, body);
}

function writeReports(summary, generatedByPath) {
  const report = {
    generated_at: new Date().toISOString(),
    targets: summary,
    cards_by_path: generatedByPath,
  };
  fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(report, null, 2));

  const lines = [
    "# Representative Building Expansion V1",
    "",
    "Generated from raw listing descriptions grouped by normalized address. Output is intended for representative district cards, not building-page publishing or active availability.",
    "",
    "| District | Existing cards | Generated listing cards | Raw listing records | Unique address groups | Status |",
    "| --- | ---: | ---: | ---: | ---: | --- |",
  ];
  summary.forEach((item) => {
    lines.push(`| ${item.name} | ${item.existing_card_count} | ${item.generated_card_count} | ${item.raw_listing_record_count} | ${item.unique_address_group_count} | ${item.status} |`);
  });

  lines.push("", "## District Notes", "");
  summary.forEach((item) => {
    lines.push(`### ${item.name}`);
    lines.push("");
    lines.push(`- Path: \`${item.path}\``);
    lines.push(`- Evidence status: ${item.status}`);
    if (item.examples.length) {
      lines.push("- Example extracted signals:");
      item.examples.forEach((example) => {
        lines.push(`  - ${example.name} (${example.address}): ${example.keywords.join(", ")}`);
      });
    } else {
      lines.push("- No publishable listing-derived card examples were generated in this pass.");
    }
    if (item.caution) lines.push(`- Caution: ${item.caution}`);
    lines.push("");
  });

  fs.writeFileSync(OUTPUT_MD_PATH, lines.join("\n"));
}

function main() {
  const rawListings = loadJson(RAW_LISTINGS_PATH);
  const representativeCards = require(REPRESENTATIVE_CARDS_PATH);
  require(BUILDING_PAGES_PATH); // Validate the existing public building data still loads.

  const generatedByPath = {};
  const summary = TARGETS.map((target) => {
    const groups = buildGroups(target, rawListings);
    const scoredGroups = groups
      .map((group) => ({ group, scored: scoreGroup(target, group) }))
      .filter(({ group, scored }) => group.rows.length >= MIN_LISTING_EVIDENCE_FOR_CARD && scored.keywords.length >= 1)
      .sort((a, b) => b.scored.representativeScore - a.scored.representativeScore);

    const cards = dedupeCards(scoredGroups.map(({ group, scored }) => cardFromGroup(target, group, scored)))
      .slice(0, MAX_GENERATED_CARDS);

    if (cards.length) generatedByPath[target.path] = cards;

    const examples = cards.slice(0, 3).map((card) => ({
      name: card.name,
      address: card.address,
      keywords: card.keyword_tags,
      confidence: card.source_confidence,
    }));
    const status = cards.length >= 10
      ? "strong_listing_depth"
      : cards.length >= 4
        ? "moderate_listing_depth"
        : cards.length > 0
          ? "thin_listing_depth"
          : "no_publishable_listing_cards";

    return {
      name: target.name,
      path: target.path,
      existing_card_count: existingCount(representativeCards.baseByDistrictPath || {}, target),
      generated_card_count: cards.length,
      raw_listing_record_count: groups.reduce((total, group) => total + group.rows.length, 0),
      unique_address_group_count: groups.length,
      status,
      examples,
      caution: cards.length < 4
        ? "Raw listing evidence is too thin for a full representative card set; avoid padding with address-only cards until additional corpus recovery or public building review is available."
        : null,
    };
  });

  writeJsOutput(generatedByPath, summary);
  writeReports(summary, generatedByPath);

  console.log(`Wrote ${OUTPUT_DATA_PATH}`);
  console.log(`Wrote ${OUTPUT_JSON_PATH}`);
  console.log(`Wrote ${OUTPUT_MD_PATH}`);
}

main();
