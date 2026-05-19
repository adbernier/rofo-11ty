const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ROOT = path.resolve(__dirname, "../..");
const OUTPUT_PATH = path.join(ROOT, "data/peter/research/bay_area_tier_a_raw_corpus_v1.json");
const REPORT_PATH = path.join(ROOT, "data/peter/reports/bay_area_tier_a_raw_corpus_report.md");

const BUILDINGS_PATH = path.join(ROOT, "data/peter/raw/rofo_buildings.csv");
const LISTINGS_PATH = path.join(ROOT, "data/peter/raw/rofo_listings.csv");
const USERS_PATH = path.join(ROOT, "data/peter/raw/rofo_users.csv");
const BROKER_HOUSES_PATH = path.join(ROOT, "data/peter/raw/rofo_broker_houses.csv");
const RELATIONSHIPS_PATH = path.join(ROOT, "data/peter/raw/rofo_relationships_listing_buildings.csv");
const DESCRIPTION_SAMPLE_PATH = path.join(ROOT, "data/peter/derived/raw_listing_descriptions_sample.csv");
const SPACE_TYPE_LOOKUP_PATH = path.join(ROOT, "data/peter/research/legacy_space_type_code_lookup.json");

const spaceTypeLookup = require(SPACE_TYPE_LOOKUP_PATH);
const neighborhoodPages = require(path.join(ROOT, "_data/neighborhoodPages.js"));

const targetAreas = [
  {
    id: "ba-downtown-oakland",
    name: "Downtown Oakland",
    slug: "downtown-oakland",
    city: "Oakland",
    state: "CA",
    aliases: ["Downtown Oakland", "Oakland City Center", "City Center Oakland", "Frank H Ogawa", "Broadway Oakland"],
    centroid: { lat: 37.8044, lng: -122.2712 },
    radius_km: 1.55,
    identity: "Institutional downtown core and BART-oriented professional office district.",
    comparisons: ["Uptown Oakland", "Jack London Square", "Old Oakland", "Lake Merritt", "San Francisco Financial District"],
  },
  {
    id: "ba-uptown-oakland",
    name: "Uptown Oakland",
    slug: "uptown-oakland",
    city: "Oakland",
    state: "CA",
    aliases: ["Uptown Oakland", "Uptown", "Northgate", "Fox Oakland", "Telegraph Oakland"],
    centroid: { lat: 37.8105, lng: -122.2687 },
    radius_km: 1.25,
    identity: "Mixed-use creative-commercial office district with BART access and smaller-company fit.",
    comparisons: ["Downtown Oakland", "Temescal", "Lake Merritt", "Jack London Square", "Berkeley"],
  },
  {
    id: "ba-jack-london-square",
    name: "Jack London Square",
    slug: "jack-london-square",
    city: "Oakland",
    state: "CA",
    aliases: ["Jack London Square", "Jack London", "Waterfront Oakland", "Oakland waterfront"],
    centroid: { lat: 37.7955, lng: -122.2763 },
    radius_km: 1.15,
    identity: "Waterfront mixed-use office, retail, service-commercial, and warehouse-adjacent district.",
    comparisons: ["Downtown Oakland", "Old Oakland", "West Oakland", "Uptown Oakland", "Alameda"],
  },
  {
    id: "ba-downtown-palo-alto",
    name: "Downtown Palo Alto",
    slug: "downtown-palo-alto",
    city: "Palo Alto",
    state: "CA",
    aliases: ["Downtown Palo Alto", "University Avenue", "Hamilton Avenue", "Lytton Avenue"],
    centroid: { lat: 37.4458, lng: -122.1614 },
    radius_km: 1.25,
    identity: "Premium Peninsula downtown office, startup, professional services, and retail-adjacent workspace.",
    comparisons: ["Mountain View / Castro-Whisman", "Redwood City Downtown", "Menlo Park", "California Avenue"],
  },
  {
    id: "ba-mountain-view-castro-whisman",
    name: "Mountain View / Castro-Whisman",
    slug: "mountain-view-castro-whisman",
    city: "Mountain View",
    state: "CA",
    aliases: ["Downtown Mountain View", "Castro Street", "Castro St", "Whisman", "Old Middlefield", "Ellis Street"],
    centroid: { lat: 37.3952, lng: -122.0712 },
    radius_km: 2.35,
    identity: "Silicon Valley startup/transit corridor with downtown retail and Whisman/R&D adjacency.",
    comparisons: ["Downtown Palo Alto", "Sunnyvale", "North San Jose", "Redwood City Downtown"],
  },
  {
    id: "ba-redwood-city-downtown",
    name: "Redwood City Downtown",
    slug: "redwood-city-downtown",
    city: "Redwood City",
    state: "CA",
    aliases: ["Downtown Redwood City", "Redwood City Downtown", "Broadway Redwood City", "Courthouse Square"],
    centroid: { lat: 37.486, lng: -122.232 },
    radius_km: 1.45,
    identity: "Mid-Peninsula downtown, civic, Caltrain, entertainment-retail, and professional office district.",
    comparisons: ["Downtown Palo Alto", "Downtown San Mateo / Hayward Park", "Menlo Park", "South San Francisco Biotech Corridor"],
  },
  {
    id: "ba-downtown-san-mateo-hayward-park",
    name: "Downtown San Mateo / Hayward Park",
    slug: "downtown-san-mateo-hayward-park",
    city: "San Mateo",
    state: "CA",
    aliases: ["Downtown San Mateo", "Central San Mateo", "Hayward Park", "Borel", "Concar", "Amphlett"],
    centroid: { lat: 37.557, lng: -122.311 },
    radius_km: 2.45,
    identity: "Peninsula professional services, medical-adjacent office, Caltrain downtown, and freeway-access corridor office.",
    comparisons: ["Redwood City Downtown", "Downtown Palo Alto", "Foster City", "Burlingame"],
  },
  {
    id: "ba-south-san-francisco-biotech-corridor",
    name: "South San Francisco Biotech Corridor",
    slug: "south-san-francisco-biotech-corridor",
    city: "South San Francisco",
    state: "CA",
    aliases: ["South San Francisco Biotech Corridor", "Oyster Point", "Lindenville", "The East Side", "East Side", "Gateway", "DNA Way"],
    centroid: { lat: 37.657, lng: -122.399 },
    radius_km: 3.35,
    identity: "Life science, lab, flex, industrial, and airport/101-adjacent innovation district.",
    comparisons: ["Mission Bay", "Redwood City Downtown", "Oyster Point", "Brisbane", "Downtown Palo Alto"],
  },
  {
    id: "ba-emeryville-powell-corridor",
    name: "Emeryville / Powell Corridor",
    slug: "emeryville-powell-corridor",
    city: "Emeryville",
    state: "CA",
    aliases: ["Powell Street", "Powell Corridor", "Bay Street", "Shellmound"],
    centroid: { lat: 37.838, lng: -122.293 },
    radius_km: 1.65,
    identity: "Bridge-access creative office, life science, retail, and compact East Bay business node.",
    comparisons: ["Downtown Oakland", "Berkeley", "West Berkeley", "Jack London Square", "South San Francisco Biotech Corridor"],
  },
];

const relevantCities = new Set([
  ...targetAreas.map((area) => area.city),
  "Alameda",
  "Berkeley",
  "Brisbane",
  "Burlingame",
  "Foster City",
  "Menlo Park",
  "San Francisco",
  "San Jose",
  "Sunnyvale",
]);

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }

  values.push(value);
  return values;
}

async function readCsv(filePath, onRow) {
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let headers = null;

  for await (const line of rl) {
    if (!headers) {
      headers = parseCsvLine(line).map((header) => header.replace(/^"|"$/g, ""));
      continue;
    }
    if (!line.trim()) continue;
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    await onRow(row);
  }
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function norm(value) {
  return clean(value).toLowerCase();
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pct(value) {
  return Math.round(value * 1000) / 10;
}

function addCount(map, key, amount = 1) {
  const normalized = clean(key) || "unknown";
  map.set(normalized, (map.get(normalized) || 0) + amount);
}

function sortedCounts(map) {
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function distanceKm(a, b) {
  if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) {
    return Number.POSITIVE_INFINITY;
  }
  const radius = 6371.0088;
  const lat1 = Number(a.lat) * Math.PI / 180;
  const lat2 = Number(b.lat) * Math.PI / 180;
  const deltaLat = (Number(b.lat) - Number(a.lat)) * Math.PI / 180;
  const deltaLng = (Number(b.lng) - Number(a.lng)) * Math.PI / 180;
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const value = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * radius * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function decodedSpaceType(code) {
  const lookup = spaceTypeLookup[String(code)] || {};
  return lookup.public_safe_category || "other/unknown";
}

function normalizeCompanyName(value) {
  const cleaned = clean(value)
    .replace(/\b(llc|inc|inc\.|corp|corp\.|corporation|co|co\.|ltd|ltd\.)\b/gi, "")
    .replace(/[,&]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";

  const known = [
    [/regus|iwg|spaces|hq global|signature by regus/i, "Regus / IWG"],
    [/wework/i, "WeWork"],
    [/servcorp/i, "Servcorp"],
    [/expansive/i, "Expansive"],
    [/cbre/i, "CBRE"],
    [/jll|jones lang lasalle/i, "JLL"],
    [/cushman/i, "Cushman & Wakefield"],
    [/colliers/i, "Colliers"],
    [/newmark/i, "Newmark"],
    [/avis[io]n young/i, "Avison Young"],
    [/lee & associates|lee and associates/i, "Lee & Associates"],
    [/kidder mathews/i, "Kidder Mathews"],
  ];

  for (const [pattern, normalized] of known) {
    if (pattern.test(cleaned)) return normalized;
  }

  return cleaned.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function identifyPortfolioGroup(values) {
  const haystack = values.filter(Boolean).join(" ").toLowerCase();
  const groups = [
    [/regus|iwg|spaces|hq global|signature by regus|wework|servcorp|expansive/, "coworking_operator"],
    [/cbre|jll|cushman|colliers|newmark|avis[io]n young|lee & associates|lee and associates|kidder mathews/, "brokerage_or_advisory"],
    [/biotech|life science|laboratory|lab space|research/i, "life_science_context"],
  ];

  for (const [pattern, group] of groups) {
    if (pattern.test(haystack)) return group;
  }

  return "";
}

function assignArea(record) {
  const recordCity = clean(record.city);
  const recordState = clean(record.state);
  if (recordState !== "CA") return null;

  const text = [
    record.name,
    record.address,
    record.street_name,
  ].map(norm).join(" ");

  const sameCityAreas = targetAreas.filter((area) => area.city === recordCity);
  for (const area of sameCityAreas) {
    const names = [area.name, ...area.aliases].map(norm).filter(Boolean);
    if (names.some((name) => text.includes(name))) {
      return {
        area_id: area.id,
        area_name: area.name,
        assignment_confidence: "high",
        assignment_method: "explicit_name_or_address_evidence",
        distance_km: null,
      };
    }
  }

  const lat = number(record.lat);
  const lng = number(record.lng);
  if (lat == null || lng == null || lat === 0 || lng === 0) return null;

  const nearest = sameCityAreas
    .map((area) => ({ area, distance: distanceKm({ lat, lng }, area.centroid) }))
    .sort((a, b) => a.distance - b.distance)[0];

  if (!nearest || nearest.distance > nearest.area.radius_km) return null;

  return {
    area_id: nearest.area.id,
    area_name: nearest.area.name,
    assignment_confidence: nearest.distance <= nearest.area.radius_km * 0.55 ? "high" : "medium",
    assignment_method: "nearest_reviewed_area_centroid",
    distance_km: Number(nearest.distance.toFixed(3)),
  };
}

function detectTextSignals(text) {
  const value = norm(text);
  const checks = [
    ["class_a", /\bclass a\b|premier office|prestigious office/],
    ["creative_office", /creative office|studio|adaptive reuse|loft|brick and timber|maker|production/],
    ["warehouse", /warehouse|distribution|loading|clear height|dock|roll-up|roll up/],
    ["showroom", /showroom|design center/],
    ["medical", /medical|clinic|healthcare|hospital/],
    ["professional_services", /professional services|law firm|legal|accounting|consulting/],
    ["financial_services", /financial|bank|finance|wealth|venture capital|vc\b/],
    ["freeway_access", /freeway|highway|i-80|i-880|i-980|us-101|101 freeway|280|92|84|bay bridge/],
    ["transit_oriented", /bart|caltrain|transit|rail station|station|shuttle/],
    ["retail_storefront", /retail|storefront|restaurant|shopping|cafe|ground floor/],
    ["life_science", /life science|biotech|laboratory|lab space|wet lab|research and development|r&d/],
    ["coworking_or_exec_suite", /regus|executive suite|coworking|business lounge|virtual office|servcorp|wework/],
    ["furnished_or_move_in", /furnished|move-in ready|move in ready|turnkey|plug and play/],
  ];

  return checks.filter(([, regex]) => regex.test(value)).map(([key]) => key);
}

function loadPublishedComparison(area) {
  const page = neighborhoodPages.find((candidate) => candidate.slug === area.slug && candidate.city === area.city);
  if (!page) {
    return {
      representative_building_count: 0,
      representative_building_types: [],
      page_signals: [],
      note: "No published neighborhood page exists yet.",
    };
  }

  const typeCounts = new Map();
  for (const building of page.representative_buildings || []) {
    addCount(typeCounts, building.editorial_type_label || building.type || "unknown");
  }

  return {
    representative_building_count: (page.representative_buildings || []).length,
    representative_building_types: sortedCounts(typeCounts),
    page_signals: page.approximate_semantic_signals || [],
    note: "Published representative buildings are display examples and are not the intelligence source of truth.",
  };
}

function formatCounts(items, limit = 4) {
  return items.slice(0, limit).map((item) => `${item.key} ${item.count}`).join(", ") || "none";
}

function publicReadiness(summary) {
  if (summary.building_count >= 35 && summary.listing_count >= 120 && summary.high_confidence_buildings >= 12) {
    if (summary.top_source_share >= 95 || summary.known_company_coverage < 20) {
      return "strong raw support; source-concentration review required";
    }
    if (summary.assignment_confidence.medium > summary.assignment_confidence.high) {
      return "strong raw support; boundary review required";
    }
    return "ready for editorial interpretation after review";
  }
  if (summary.building_count >= 15 && summary.listing_count >= 50) {
    return "usable with manual boundary/building review";
  }
  if (summary.building_count >= 6 || summary.listing_count >= 20) {
    return "thin but directionally useful";
  }
  return "not ready without manual supplementation";
}

function areaWarnings(summary) {
  const warnings = [];
  if (summary.building_count < 10) warnings.push("Small raw building sample.");
  if (summary.listing_count < 25) warnings.push("Small raw listing sample.");
  if (summary.top_source_share >= 85) warnings.push(`Top listing source ${summary.top_sources[0]?.key || "unknown"} represents ${summary.top_source_share}% of listing rows.`);
  if (summary.known_company_coverage < 20 && summary.listing_count >= 50) warnings.push(`Low identifiable company/provenance coverage at ${summary.known_company_coverage}%.`);
  if (summary.coworking_concentration >= 25) warnings.push(`Coworking/operator concentration is ${summary.coworking_concentration}%.`);
  if (summary.assignment_confidence.medium > summary.assignment_confidence.high) warnings.push("Most assignments are centroid/radius-based medium confidence.");
  return warnings;
}

function deriveSignals(summary) {
  const total = Math.max(summary.listing_count, 1);
  const countFor = (key) => summary.space_type_distribution.find((item) => item.key === key)?.count || 0;
  const signals = [];
  const add = (key, label, confidence, evidence, publicSafe = true) => {
    signals.push({ key, label, confidence, evidence, public_safe_candidate: publicSafe });
  };

  const officeShare = countFor("office") / total;
  if (countFor("office") >= 100 && officeShare >= 0.55) add("office_orientation", "Office-oriented", "high", `Office rows represent ${Math.round(officeShare * 100)}% of decoded historical listings.`);
  else if (countFor("office") >= 35 && officeShare >= 0.35) add("office_orientation", "Office-oriented", "medium", `Office rows represent ${Math.round(officeShare * 100)}% of decoded historical listings.`);

  const retailShare = countFor("retail") / total;
  if (countFor("retail") >= 30 && retailShare >= 0.15) add("retail_context", "Retail context", "medium", `Retail rows represent ${Math.round(retailShare * 100)}% of decoded historical listings.`);

  const industrialCount = countFor("industrial") + countFor("flex");
  const industrialShare = industrialCount / total;
  if (industrialCount >= 60 && industrialShare >= 0.22) add("industrial_flex_context", "Industrial/flex context", "high", `Industrial/flex rows represent ${Math.round(industrialShare * 100)}% of decoded historical listings.`);
  else if (industrialCount >= 20 && industrialShare >= 0.12) add("industrial_flex_context", "Industrial/flex context", "medium", `Industrial/flex rows represent ${Math.round(industrialShare * 100)}% of decoded historical listings.`);

  if (summary.building_count >= 75 && summary.listing_count >= 250) add("broad_raw_support", "Broad raw-corpus support", "high", `${summary.building_count} raw buildings and ${summary.listing_count} historical listing rows assigned to the approximate district.`, false);
  else if (summary.building_count >= 25 && summary.listing_count >= 75) add("broad_raw_support", "Moderate raw-corpus support", "medium", `${summary.building_count} raw buildings and ${summary.listing_count} historical listing rows assigned to the approximate district.`, false);

  return signals;
}

function summarizeArea(area, buildings) {
  const listings = buildings.flatMap((building) => building.listings || []);
  const spaces = new Map();
  const sources = new Map();
  const companies = new Map();
  const contacts = new Map();
  const brokerHouses = new Map();
  const portfolios = new Map();
  const signalCounts = new Map();
  const buildingTypeMix = new Map();
  const rawBuildings = new Set();
  const rawListings = new Set();
  let knownCompanyRows = 0;
  let coworkingRows = 0;

  for (const building of buildings) {
    rawBuildings.add(building.building_id);
    addCount(buildingTypeMix, building.primary_space_type || "unknown");
    if (building.broker_house_company) addCount(brokerHouses, building.broker_house_company);
    for (const listing of building.listings || []) {
      rawListings.add(listing.listing_id);
      addCount(spaces, listing.decoded_space_type);
      addCount(sources, listing.source || "unknown");
      if (listing.origin_company) {
        addCount(companies, listing.origin_company);
        knownCompanyRows += 1;
      }
      if (listing.listing_contact?.name || listing.listing_contact?.user_id) {
        addCount(contacts, listing.listing_contact.name || listing.listing_contact.user_id);
      }
      if (listing.portfolio_group) addCount(portfolios, listing.portfolio_group);
      if (listing.portfolio_group === "coworking_operator") coworkingRows += 1;
      for (const signal of listing.detected_text_signals || []) addCount(signalCounts, signal);
    }
  }

  const topSources = sortedCounts(sources);
  const listingCount = listings.length;
  const summary = {
    area_id: area.id,
    area_name: area.name,
    slug: area.slug,
    city: area.city,
    identity: area.identity,
    comparisons: area.comparisons,
    building_count: rawBuildings.size,
    listing_count: rawListings.size,
    unique_companies: sortedCounts(companies).length,
    unique_contacts: sortedCounts(contacts).length,
    unique_broker_houses: sortedCounts(brokerHouses).length,
    unique_portfolios: sortedCounts(portfolios).length,
    assignment_confidence: {
      high: buildings.filter((building) => building.assignment_confidence === "high").length,
      medium: buildings.filter((building) => building.assignment_confidence === "medium").length,
    },
    high_confidence_buildings: buildings.filter((building) => building.assignment_confidence === "high").length,
    space_type_distribution: sortedCounts(spaces),
    source_distribution: topSources,
    top_sources: topSources.slice(0, 8),
    company_distribution: sortedCounts(companies).slice(0, 10),
    contact_distribution: sortedCounts(contacts).slice(0, 10),
    broker_house_distribution: sortedCounts(brokerHouses).slice(0, 10),
    portfolio_distribution: sortedCounts(portfolios).slice(0, 10),
    text_signal_distribution: sortedCounts(signalCounts).slice(0, 12),
    representative_building_diversity: sortedCounts(buildingTypeMix),
    top_source_share: listingCount && topSources[0] ? pct(topSources[0].count / listingCount) : 0,
    known_company_coverage: listingCount ? pct(knownCompanyRows / listingCount) : 0,
    coworking_concentration: listingCount ? pct(coworkingRows / listingCount) : 0,
    published_representative_comparison: loadPublishedComparison(area),
    top_raw_buildings: buildings
      .slice()
      .sort((a, b) => (b.listings.length + b.source_listing_count) - (a.listings.length + a.source_listing_count))
      .slice(0, 10)
      .map((building) => ({
        building_id: building.building_id,
        name: building.building_name || building.address,
        address: building.address,
        city: building.city,
        assignment_confidence: building.assignment_confidence,
        assignment_method: building.assignment_method,
        distance_km: building.distance_km,
        raw_listing_rows: building.listings.length,
        source_listing_count: building.source_listing_count,
        primary_space_type: building.primary_space_type,
        broker_house_company: building.broker_house_company || "",
      })),
  };

  summary.pattern_signals = deriveSignals(summary);
  summary.readiness = publicReadiness(summary);
  summary.warnings = areaWarnings(summary);
  return summary;
}

async function main() {
  const buildingsById = new Map();
  const areaBuckets = new Map(targetAreas.map((area) => [area.id, []]));
  const cityCorpus = new Map();
  const brokerHouseIds = new Set();

  await readCsv(BUILDINGS_PATH, async (row) => {
    if (row.state !== "CA" || !relevantCities.has(row.city)) return;
    if (!cityCorpus.has(row.city)) {
      cityCorpus.set(row.city, { city: row.city, raw_buildings: 0, raw_listings_from_building_counts: 0 });
    }
    const cityStats = cityCorpus.get(row.city);
    cityStats.raw_buildings += 1;
    cityStats.raw_listings_from_building_counts += number(row.listing_count) || 0;

    const assignment = assignArea(row);
    if (!assignment) return;

    const brokerHouseId = clean(row.broker_house_id);
    if (brokerHouseId) brokerHouseIds.add(brokerHouseId);
    const building = {
      building_id: row.building_id,
      building_name: clean(row.name),
      address: clean(row.address),
      city: clean(row.city),
      state: clean(row.state),
      zip: clean(row.zip),
      latitude: number(row.lat),
      longitude: number(row.lng),
      building_size: number(row.building_size),
      floors: number(row.floors),
      units: number(row.units),
      min_size: number(row.min_size),
      max_size: number(row.max_size),
      source_listing_count: number(row.listing_count) || 0,
      broker_house_id: brokerHouseId,
      primary_space_type: "unknown",
      updated_at: row.updated_at,
      ...assignment,
      listings: [],
    };
    buildingsById.set(row.building_id, building);
    areaBuckets.get(assignment.area_id).push(building);
  });

  const listingIds = new Set();
  const contactUserIds = new Set();

  await readCsv(LISTINGS_PATH, async (row) => {
    const building = buildingsById.get(row.building_id);
    if (!building) return;
    const contactUserId = clean(row.contact_user_id);
    if (contactUserId) contactUserIds.add(contactUserId);
    const listing = {
      listing_id: row.listing_id,
      building_id: row.building_id,
      city: row.city,
      state: row.state,
      square_footage: number(row.square_footage),
      space_type_code: row.space_type,
      decoded_space_type: decodedSpaceType(row.space_type),
      lease_type: row.lease_type,
      listing_type: row.listing_type,
      price_selection: row.price_selection,
      price_type: row.price_type,
      status: row.status,
      source: row.source,
      external_url_domain: row.external_url ? clean(row.external_url).replace(/^https?:\/\//, "").split("/")[0] : "",
      contact_user_id: contactUserId,
      created_at: row.created_at,
      updated_at: row.updated_at,
      detected_text_signals: [],
      description_excerpt: "",
      listing_contact: null,
      origin_company: "",
      portfolio_group: "",
    };
    building.primary_space_type = building.primary_space_type === "unknown" ? listing.decoded_space_type : building.primary_space_type;
    building.listings.push(listing);
    listingIds.add(row.listing_id);
  });

  await readCsv(RELATIONSHIPS_PATH, async (row) => {
    if (!listingIds.has(row.listing_id)) return;
    const contactUserId = clean(row.contact_user_id);
    if (contactUserId) contactUserIds.add(contactUserId);
  });

  const users = new Map();
  await readCsv(USERS_PATH, async (row) => {
    if (!contactUserIds.has(row.user_id)) return;
    users.set(row.user_id, {
      user_id: row.user_id,
      name: clean(row.name),
      company: normalizeCompanyName(row.company),
      raw_company: clean(row.company),
    });
  });

  const brokerHouses = new Map();
  await readCsv(BROKER_HOUSES_PATH, async (row) => {
    if (!brokerHouseIds.has(row.broker_house_id)) return;
    brokerHouses.set(row.broker_house_id, {
      broker_house_id: row.broker_house_id,
      company: normalizeCompanyName(row.company),
      raw_company: clean(row.company),
    });
  });

  for (const building of buildingsById.values()) {
    const brokerHouse = brokerHouses.get(building.broker_house_id);
    building.broker_house_company = brokerHouse?.company || "";
    for (const listing of building.listings) {
      const user = users.get(listing.contact_user_id);
      listing.listing_contact = user ? { user_id: user.user_id, name: user.name, company: user.company } : null;
      listing.origin_company = user?.company || brokerHouse?.company || "";
      listing.portfolio_group = identifyPortfolioGroup([
        listing.origin_company,
        user?.raw_company,
        brokerHouse?.raw_company,
        listing.source,
        listing.external_url_domain,
      ]);
    }
  }

  if (fs.existsSync(DESCRIPTION_SAMPLE_PATH)) {
    const listingsById = new Map();
    for (const building of buildingsById.values()) {
      for (const listing of building.listings) listingsById.set(listing.listing_id, listing);
    }
    await readCsv(DESCRIPTION_SAMPLE_PATH, async (row) => {
      const listing = listingsById.get(row.listing_id);
      if (!listing) return;
      const text = clean(row.combined_semantic_text || row.description_text || row.l_description || row.promo_text);
      listing.description_excerpt = text.slice(0, 500);
      listing.detected_text_signals = detectTextSignals(text);
    });
  }

  const areaSummaries = targetAreas.map((area) => summarizeArea(area, areaBuckets.get(area.id) || []));
  const output = {
    version: "v1",
    generated_at: new Date().toISOString(),
    scope: "Bay Area Tier A raw building and listing corpus for district intelligence planning.",
    source_files: [
      "data/peter/raw/rofo_buildings.csv",
      "data/peter/raw/rofo_listings.csv",
      "data/peter/raw/rofo_users.csv",
      "data/peter/raw/rofo_broker_houses.csv",
      "data/peter/raw/rofo_relationships_listing_buildings.csv",
      "data/peter/derived/raw_listing_descriptions_sample.csv",
    ],
    assignment_rules: [
      "Use raw Rofo building and listing rows, not published representative buildings, as the intelligence source.",
      "Assign only to reviewed Bay Area Tier A district candidates.",
      "Use explicit district or alias text in building metadata as high confidence.",
      "Otherwise assign buildings by nearest reviewed centroid within conservative radius and same city.",
      "Treat assignments as internal working sets, not polygon boundaries or current availability.",
    ],
    relevant_cities: Array.from(relevantCities).sort(),
    city_corpus_summary: Array.from(cityCorpus.values()).sort((a, b) => a.city.localeCompare(b.city)),
    target_areas: targetAreas,
    area_summaries: areaSummaries,
    buildings: targetAreas.flatMap((area) =>
      (areaBuckets.get(area.id) || [])
        .slice()
        .sort((a, b) => (b.listings.length + b.source_listing_count) - (a.listings.length + a.source_listing_count))
        .map((building) => ({
          ...building,
          listings: building.listings
            .slice()
            .sort((a, b) => (b.square_footage || 0) - (a.square_footage || 0))
            .slice(0, 35),
          listing_sample_truncated: building.listings.length > 35,
        }))
    ),
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${buildReport(output)}\n`);

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Wrote ${REPORT_PATH}`);
  for (const summary of areaSummaries) {
    console.log(`${summary.area_name}: ${summary.building_count} buildings, ${summary.listing_count} listings, ${summary.readiness}`);
  }
}

function buildReport(output) {
  const lines = [];
  lines.push("# Bay Area Tier A Raw Corpus Extraction Report");
  lines.push("");
  lines.push(`Date: ${new Date().toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push("## Purpose");
  lines.push("");
  lines.push("This report extends the Atlanta raw-corpus intelligence workflow to the Bay Area Tier A rollout cluster. It uses broader raw Rofo building and listing rows for district validation, signal extraction, diversity review, and editorial readiness.");
  lines.push("");
  lines.push("Published representative buildings are treated only as page presentation examples. They are not the source of truth for district intelligence.");
  lines.push("");
  lines.push("## Source Files");
  lines.push("");
  for (const file of output.source_files) lines.push(`- ${file}`);
  lines.push("");
  lines.push("## Assignment Method");
  lines.push("");
  for (const rule of output.assignment_rules) lines.push(`- ${rule}`);
  lines.push("");
  lines.push("Assignments are approximate internal working sets. They are not polygon boundaries, live inventory, or current availability.");
  lines.push("");
  lines.push("## Relevant City Corpus");
  lines.push("");
  lines.push("| City | Raw buildings | Raw listing count from building rows |");
  lines.push("| --- | ---: | ---: |");
  for (const city of output.city_corpus_summary) {
    lines.push(`| ${city.city} | ${city.raw_buildings} | ${city.raw_listings_from_building_counts} |`);
  }
  lines.push("");
  lines.push("## District Candidate Counts");
  lines.push("");
  lines.push("| District | Raw buildings | Listing rows | High confidence | Medium confidence | Companies | Contacts | Broker houses | Top spaces | Top sources | Published reps | Readiness |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |");
  for (const summary of output.area_summaries) {
    lines.push(`| ${summary.area_name} | ${summary.building_count} | ${summary.listing_count} | ${summary.assignment_confidence.high} | ${summary.assignment_confidence.medium} | ${summary.unique_companies} | ${summary.unique_contacts} | ${summary.unique_broker_houses} | ${formatCounts(summary.space_type_distribution)} | ${formatCounts(summary.top_sources)} | ${summary.published_representative_comparison.representative_building_count} | ${summary.readiness} |`);
  }
  lines.push("");
  lines.push("## District Notes");
  lines.push("");
  for (const summary of output.area_summaries) {
    lines.push(`### ${summary.area_name}`);
    lines.push("");
    lines.push(`- Commercial identity: ${summary.identity}`);
    lines.push(`- Nearby comparison set: ${summary.comparisons.join("; ")}`);
    lines.push(`- Raw support: ${summary.building_count} buildings, ${summary.listing_count} listing rows.`);
    lines.push(`- Assignment confidence: ${summary.assignment_confidence.high} high, ${summary.assignment_confidence.medium} medium.`);
    lines.push(`- Diversity/provenance: ${summary.unique_companies} companies, ${summary.unique_contacts} listing contacts, ${summary.unique_broker_houses} broker houses, ${summary.unique_portfolios} portfolio/feed groups.`);
    lines.push(`- Top space types: ${formatCounts(summary.space_type_distribution, 6)}.`);
    lines.push(`- Top sources: ${formatCounts(summary.top_sources, 6)}.`);
    lines.push(`- Top companies/provenance: ${formatCounts(summary.company_distribution, 6)}.`);
    lines.push(`- Representative diversity from raw buildings: ${formatCounts(summary.representative_building_diversity, 6)}.`);
    lines.push(`- Published representative comparison: ${summary.published_representative_comparison.representative_building_count} display examples. ${summary.published_representative_comparison.note}`);
    if (summary.pattern_signals.length) {
      lines.push("- Internal pattern signals:");
      for (const signal of summary.pattern_signals) lines.push(`  - ${signal.label}: ${signal.confidence}. ${signal.evidence}`);
    }
    if (summary.text_signal_distribution.length) {
      lines.push(`- Raw text sample signals: ${formatCounts(summary.text_signal_distribution, 8)}.`);
    }
    if (summary.warnings.length) {
      lines.push("- Data gaps / concentration risks:");
      for (const warning of summary.warnings) lines.push(`  - ${warning}`);
    } else {
      lines.push("- Data gaps / concentration risks: none severe in this first-pass extraction.");
    }
    lines.push("- Top raw building candidates:");
    for (const building of summary.top_raw_buildings.slice(0, 5)) {
      lines.push(`  - ${building.name || building.address}: ${building.raw_listing_rows} listing rows, ${building.primary_space_type}, ${building.assignment_confidence}${building.distance_km != null ? `, ${building.distance_km} km from centroid` : ""}.`);
    }
    lines.push("");
  }
  lines.push("## Readiness Recommendations");
  lines.push("");
  const ready = output.area_summaries.filter((summary) => summary.readiness === "ready for editorial interpretation after review");
  const strongCaveat = output.area_summaries.filter((summary) => summary.readiness === "strong raw support; source-concentration review required");
  const boundaryCaveat = output.area_summaries.filter((summary) => summary.readiness === "strong raw support; boundary review required");
  const review = output.area_summaries.filter((summary) => summary.readiness === "usable with manual boundary/building review");
  const thin = output.area_summaries.filter((summary) => !ready.includes(summary) && !strongCaveat.includes(summary) && !boundaryCaveat.includes(summary) && !review.includes(summary));
  lines.push(`- Ready for editorial interpretation after review: ${ready.map((summary) => summary.area_name).join(", ") || "none"}.`);
  lines.push(`- Strong raw support, source-concentration review required: ${strongCaveat.map((summary) => summary.area_name).join(", ") || "none"}.`);
  lines.push(`- Strong raw support, boundary review required: ${boundaryCaveat.map((summary) => summary.area_name).join(", ") || "none"}.`);
  lines.push(`- Usable after manual boundary/building review: ${review.map((summary) => summary.area_name).join(", ") || "none"}.`);
  lines.push(`- Thin or not ready without manual supplementation: ${thin.map((summary) => summary.area_name).join(", ") || "none"}.`);
  lines.push("");
  lines.push("Recommended first editorial work: Downtown Oakland and Uptown Oakland, because they have public pages and strong raw assignment support. Downtown Palo Alto should follow if the raw candidate set is accepted after manual address review. South San Francisco Biotech Corridor and Jack London Square are commercially differentiated but need representative-building, boundary, and source-concentration review before public editorial claims are promoted.");
  lines.push("");
  lines.push("## Data Quality Warnings");
  lines.push("");
  lines.push("- Raw listing rows are historical activity signals, not current availability.");
  lines.push("- Raw `rofo_listings.csv` does not include full listing descriptions. Rich text is available only from the sampled raw listing description extract in this repo.");
  lines.push("- City and centroid assignment is approximate. It should guide editorial review, not replace boundary review.");
  lines.push("- Source and company coverage may be incomplete because many rows originate from internal ingestion or historical feed records.");
  lines.push("- Do not surface rent, suite-level, furnished, move-in-ready, or feed-source language publicly from this extraction.");
  lines.push("");
  return lines.join("\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
