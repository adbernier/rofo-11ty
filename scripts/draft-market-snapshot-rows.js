const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INPUT_PATH = path.join(ROOT, "_data/raw/market-snapshot-draft-cities.csv");
const EXISTING_PATH = path.join(ROOT, "_data/raw/market-snapshots.csv");
const OUTPUT_PATH = path.join(ROOT, "_data/raw/market-snapshots.draft.csv");
const CITIES_PATH = path.join(ROOT, "_data/cities.generated.json");
const BUILDINGS_PATH = path.join(ROOT, "_data/buildings.js");
const ALL_MODE = process.argv.includes("--all");

const COLUMNS = [
  "state",
  "city_slug",
  "snapshot_title",
  "average_rent",
  "average_rent_direction",
  "average_rent_label",
  "availability_rate",
  "availability_direction",
  "availability_label",
  "market_trend",
  "market_trend_direction",
  "market_trend_label",
  "notable_areas",
  "notable_areas_label",
  "summary",
  "rent_note",
  "availability_note",
  "tenant_takeaway",
];

const DRAFT_COLUMNS = ["state", "city_slug", "city_name"];
const OUTPUT_COLUMNS = [...COLUMNS, "enrichment_tier", "approved"];
const VALID_DIRECTIONS = new Set(["", "up", "down", "flat"]);
const GENERIC_SUMMARY_PHRASES = [
  "commercial real estate market",
  "offers office options",
  "businesses looking for office space",
  "current local market",
];

const MAJOR_MARKET_KEYS = new Set([
  "CA/san-francisco",
  "CA/los-angeles",
  "CA/san-diego",
  "CA/san-jose",
  "NY/new-york",
  "IL/chicago",
  "TX/houston",
  "TX/dallas",
  "TX/austin",
  "FL/miami",
  "WA/seattle",
  "CO/denver",
  "GA/atlanta",
  "MA/boston",
  "PA/philadelphia",
  "DC/washington",
  "AZ/phoenix",
  "OR/portland",
  "CA/oakland",
  "CA/sacramento",
]);

const MARKET_PROFILES = {
  "AZ/phoenix": {
    average_rent: "$28–$42/SF/YR",
    availability_rate: "Balanced supply",
    availability_label: "Options across urban and suburban submarkets",
    market_trend: "Growth market",
    market_trend_label: "Tenants compare cost, access, and expansion flexibility",
    notable_areas: "Downtown Phoenix|Biltmore|Tempe|Scottsdale",
    summary: "Phoenix gives tenants a mix of downtown, airport-area, and East Valley office options with different cost and access tradeoffs.",
    rent_note: "Office rents can vary widely between newer Class A buildings, suburban campuses, and value-oriented space.",
    availability_note: "Availability is generally easier to compare when tenants look across Phoenix, Tempe, and Scottsdale together.",
    tenant_takeaway: "Tenants should compare commute patterns, parking, building quality, and expansion flexibility before choosing a submarket.",
  },
  "CA/san-diego": {
    average_rent: "$42–$58/SF/YR",
    availability_rate: "Moderate",
    availability_label: "Submarket choice matters",
    market_trend: "Balanced",
    market_trend_label: "Good options across central and suburban areas",
    notable_areas: "Downtown San Diego|UTC|Sorrento Mesa|Mission Valley",
    summary: "San Diego tenants often compare downtown, coastal, and suburban office areas based on commute access, client proximity, and building quality.",
    rent_note: "Office rents can differ meaningfully between central business districts, life science-adjacent areas, and suburban office parks.",
    availability_note: "Availability can feel different by submarket, especially between newer buildings and older commodity space.",
    tenant_takeaway: "Tenants should compare UTC, Sorrento Mesa, Mission Valley, and downtown options around access, parking, and total occupancy cost.",
  },
  "CA/sacramento": {
    average_rent: "$24–$36/SF/YR",
    availability_rate: "Moderate",
    availability_label: "Tenant options across several office nodes",
    market_trend: "Stabilizing market",
    market_trend_label: "Cost and access remain key decision factors",
    notable_areas: "Downtown Sacramento|Midtown|Natomas|Roseville",
    summary: "Sacramento tenants often compare central, suburban, and regional office options based on budget, access, and proximity to customers or public agencies.",
    rent_note: "Office rents are typically more value-oriented than coastal California markets but still vary by building class and location.",
    availability_note: "Tenant options are usually best evaluated across both Sacramento and nearby suburban markets.",
    tenant_takeaway: "Tenants should compare parking, commute access, public agency proximity, and flexibility in lease terms.",
  },
  "OR/portland": {
    average_rent: "$30–$42/SF/YR",
    availability_rate: "Elevated supply",
    availability_label: "Tenant choice remains broad",
    market_trend: "Tenant-favorable",
    market_trend_label: "More flexibility in many office searches",
    notable_areas: "Downtown Portland|Pearl District|Central Eastside|Beaverton",
    summary: "Portland tenants often compare downtown, close-in eastside, and westside suburban office options around access, cost, and workplace needs.",
    rent_note: "Office rents can vary between downtown towers, creative office areas, and suburban business parks.",
    availability_note: "Availability remains broad enough for tenants to compare layouts, building quality, and concessions carefully.",
    tenant_takeaway: "Tenants should compare central Portland and westside options with a focus on commute patterns, parking, and deal flexibility.",
  },
  "TN/nashville": {
    average_rent: "$34–$50/SF/YR",
    availability_rate: "Balanced supply",
    availability_label: "Active tenant demand with varied options",
    market_trend: "Growth market",
    market_trend_label: "Submarket selection drives fit and cost",
    notable_areas: "Downtown Nashville|The Gulch|Midtown|Cool Springs",
    summary: "Nashville tenants often compare urban and suburban office nodes based on customer access, employee commute patterns, and brand fit.",
    rent_note: "Office rents can vary sharply between newer urban buildings, creative districts, and suburban campuses.",
    availability_note: "Availability is best evaluated by submarket because tenant demand and building quality vary across the region.",
    tenant_takeaway: "Tenants should compare downtown, Midtown, and suburban options around parking, access, and room for growth.",
  },
  "NC/charlotte": {
    average_rent: "$32–$48/SF/YR",
    availability_rate: "Balanced supply",
    availability_label: "Options across urban and suburban office districts",
    market_trend: "Growth market",
    market_trend_label: "Finance and business services support activity",
    notable_areas: "Uptown|South End|Ballantyne|University City",
    summary: "Charlotte tenants often compare Uptown, South End, and suburban office districts based on access, image, parking, and growth plans.",
    rent_note: "Office rents vary by building class, transit access, and proximity to major employment centers.",
    availability_note: "Availability can differ meaningfully between core urban space and suburban office campuses.",
    tenant_takeaway: "Tenants should compare parking, commute access, building quality, and total occupancy cost before choosing a location.",
  },
  "MN/minneapolis": {
    average_rent: "$28–$42/SF/YR",
    availability_rate: "Elevated supply",
    availability_label: "Broad tenant choice in core and suburban areas",
    market_trend: "Tenant-favorable",
    market_trend_label: "Deal structure matters as much as asking rent",
    notable_areas: "Downtown Minneapolis|North Loop|Warehouse District|Bloomington",
    summary: "Minneapolis tenants often compare downtown, creative office areas, and suburban locations based on access, cost, and employee commute patterns.",
    rent_note: "Asking rents can be only one part of the cost picture when concessions and improvement allowances vary.",
    availability_note: "Tenants may find more choice in older or larger blocks, while upgraded buildings can perform differently.",
    tenant_takeaway: "Tenants should compare effective rent, building quality, transit access, parking, and concession packages.",
  },
  "GA/atlanta": {
    average_rent: "$30–$46/SF/YR",
    availability_rate: "Moderate",
    availability_label: "Many options across a large regional market",
    market_trend: "Balanced",
    market_trend_label: "Strong submarket differences",
    notable_areas: "Midtown|Buckhead|Downtown Atlanta|Perimeter Center",
    summary: "Atlanta tenants often compare Midtown, Buckhead, Downtown, and suburban office nodes based on access, talent, parking, and value.",
    rent_note: "Office rents can vary widely across Atlanta because submarket, building class, and parking needs matter.",
    availability_note: "Availability should be compared by submarket, especially between urban towers and suburban campuses.",
    tenant_takeaway: "Tenants should weigh commute patterns, parking, building amenities, and long-term flexibility across several submarkets.",
  },
  "NC/raleigh": {
    average_rent: "$30–$44/SF/YR",
    availability_rate: "Balanced supply",
    availability_label: "Options across Triangle submarkets",
    market_trend: "Growth market",
    market_trend_label: "Technology and professional services shape demand",
    notable_areas: "Downtown Raleigh|North Hills|Research Triangle Park|Cary",
    summary: "Raleigh tenants often compare downtown, North Hills, RTP, and nearby suburban markets based on talent access, parking, and growth plans.",
    rent_note: "Office rents vary between downtown space, mixed-use districts, and suburban business parks.",
    availability_note: "Availability is best evaluated across the broader Triangle because tenant options often cross city boundaries.",
    tenant_takeaway: "Tenants should compare Raleigh and nearby Triangle submarkets around access, budget, and expansion flexibility.",
  },
  "UT/salt-lake-city": {
    average_rent: "$30–$44/SF/YR",
    availability_rate: "Balanced supply",
    availability_label: "Options across downtown and suburban nodes",
    market_trend: "Growth market",
    market_trend_label: "Tenants compare value, access, and growth flexibility",
    notable_areas: "Downtown Salt Lake City|Sugar House|Lehi|Draper",
    summary: "Salt Lake City tenants often compare downtown and Silicon Slopes office options based on commute access, hiring plans, and total cost.",
    rent_note: "Office rents can vary between downtown buildings, emerging mixed-use areas, and suburban technology corridors.",
    availability_note: "Availability is easier to evaluate when Salt Lake City, Lehi, and Draper options are compared together.",
    tenant_takeaway: "Tenants should compare commute patterns, parking, building quality, and ability to grow within the same market.",
  },
  "AZ/tucson": {
    average_rent: "$22–$34/SF/YR",
    availability_rate: "Moderate",
    availability_label: "Options across central and suburban office areas",
    market_trend: "Balanced",
    market_trend_label: "Value and access are key comparison points",
    notable_areas: "Downtown Tucson|University Area|Williams Centre|Oro Valley",
    summary: "Tucson tenants often compare central, university-adjacent, and suburban office areas based on budget, access, and customer proximity.",
    rent_note: "Office rents can vary by building class, parking, and proximity to central Tucson or suburban employment nodes.",
    availability_note: "Availability should be reviewed by submarket because smaller office buildings and larger blocks can offer different options.",
    tenant_takeaway: "Tenants should compare parking, commute access, building quality, and flexibility before selecting a location.",
  },
  "WA/tacoma": {
    average_rent: "$26–$38/SF/YR",
    availability_rate: "Moderate",
    availability_label: "Options across downtown and regional office nodes",
    market_trend: "Balanced",
    market_trend_label: "Tenants compare cost, access, and proximity to Seattle",
    notable_areas: "Downtown Tacoma|Stadium District|Tacoma Mall Area|University Place",
    summary: "Tacoma tenants often compare downtown, neighborhood, and South Sound office options based on cost, access, and regional reach.",
    rent_note: "Office rents are generally more value-oriented than core Seattle but still vary by building quality and location.",
    availability_note: "Availability can differ between downtown office buildings and smaller neighborhood or suburban properties.",
    tenant_takeaway: "Tenants should compare Tacoma options against South Sound and Seattle-area alternatives around cost, commute, and parking.",
  },
  "OR/eugene": {
    average_rent: "$22–$34/SF/YR",
    availability_rate: "Moderate",
    availability_label: "Local office choices vary by building size",
    market_trend: "Balanced",
    market_trend_label: "Local access and fit matter most",
    notable_areas: "Downtown Eugene|University Area|Valley River|Springfield",
    summary: "Eugene tenants often compare downtown, university-area, and nearby Springfield office options based on access, budget, and customer needs.",
    rent_note: "Office rents should be compared by building condition, parking, and proximity to central Eugene or campus-adjacent areas.",
    availability_note: "Availability can be limited in specific building types, so tenants should compare several nearby options.",
    tenant_takeaway: "Tenants should focus on location fit, parking, building condition, and flexibility for future growth.",
  },
  "CA/ventura": {
    average_rent: "$30–$44/SF/YR",
    availability_rate: "Moderate",
    availability_label: "Coastal and regional office options vary",
    market_trend: "Balanced",
    market_trend_label: "Location and building fit drive decisions",
    notable_areas: "Downtown Ventura|East Ventura|Oxnard|Camarillo",
    summary: "Ventura tenants often compare coastal, eastside, and nearby Oxnard or Camarillo office options based on access, cost, and customer reach.",
    rent_note: "Office rents can vary by proximity to coastal districts, freeway access, and building quality.",
    availability_note: "Availability should be checked across nearby Ventura County markets because tenant options can cross city boundaries.",
    tenant_takeaway: "Tenants should compare access, parking, customer proximity, and total occupancy cost across Ventura County options.",
  },
  "CA/anaheim": {
    average_rent: "$34–$50/SF/YR",
    availability_rate: "Balanced supply",
    availability_label: "Options across central Orange County",
    market_trend: "Balanced",
    market_trend_label: "Submarket access and parking matter",
    notable_areas: "Anaheim Resort Area|Platinum Triangle|Anaheim Canyon|Orange",
    summary: "Anaheim tenants often compare central Orange County office areas based on freeway access, parking, customer proximity, and value.",
    rent_note: "Office rents can vary between resort-area, freeway-adjacent, and business park locations.",
    availability_note: "Availability is best evaluated alongside nearby Orange County submarkets because tenant searches often cross city lines.",
    tenant_takeaway: "Tenants should compare Anaheim, Orange, and nearby markets around access, parking, and total occupancy cost.",
  },
  "CA/long-beach": {
    average_rent: "$32–$48/SF/YR",
    availability_rate: "Moderate",
    availability_label: "Options across downtown and port-adjacent areas",
    market_trend: "Balanced",
    market_trend_label: "Tenants compare access, cost, and customer reach",
    notable_areas: "Downtown Long Beach|Bixby Knolls|Long Beach Airport Area|Signal Hill",
    summary: "Long Beach tenants often compare downtown, airport-area, and nearby South Bay options based on access, budget, and customer proximity.",
    rent_note: "Office rents can vary by building quality, parking, waterfront proximity, and access to regional transportation corridors.",
    availability_note: "Availability should be compared across downtown Long Beach, airport-area, and nearby business districts.",
    tenant_takeaway: "Tenants should compare commute patterns, parking, customer access, and building quality before choosing a location.",
  },
  "CA/riverside": {
    average_rent: "$26–$40/SF/YR",
    availability_rate: "Moderate",
    availability_label: "Regional office options across Inland Empire submarkets",
    market_trend: "Balanced",
    market_trend_label: "Cost and regional access are key drivers",
    notable_areas: "Downtown Riverside|University Area|La Sierra|Corona",
    summary: "Riverside tenants often compare downtown, university-adjacent, and nearby Inland Empire office areas based on cost, access, and regional coverage.",
    rent_note: "Office rents can vary by building class, parking, and proximity to freeway corridors.",
    availability_note: "Availability is best reviewed across Riverside and nearby Inland Empire markets because tenant options often overlap.",
    tenant_takeaway: "Tenants should compare access, parking, building quality, and proximity to customers or workforce concentrations.",
  },
  "CA/san-bernardino": {
    average_rent: "$22–$34/SF/YR",
    availability_rate: "Moderate",
    availability_label: "Value-oriented options across local office nodes",
    market_trend: "Balanced",
    market_trend_label: "Access and cost remain primary factors",
    notable_areas: "Downtown San Bernardino|Hospitality Lane|University District|Redlands",
    summary: "San Bernardino tenants often compare downtown, Hospitality Lane, and nearby Inland Empire office options based on cost, access, and customer reach.",
    rent_note: "Office rents are often value-oriented but still vary by building quality, parking, and freeway access.",
    availability_note: "Availability should be compared with nearby Inland Empire markets because local options can vary by building type.",
    tenant_takeaway: "Tenants should compare San Bernardino and nearby markets around access, parking, and practical operating needs.",
  },
  "CO/colorado-springs": {
    average_rent: "$26–$40/SF/YR",
    availability_rate: "Moderate",
    availability_label: "Options across downtown and north-side business areas",
    market_trend: "Balanced",
    market_trend_label: "Tenant needs vary by access and workforce location",
    notable_areas: "Downtown Colorado Springs|Briargate|InterQuest|Tech Center",
    summary: "Colorado Springs tenants often compare downtown, north-side, and technology corridor office options based on access, parking, and workforce needs.",
    rent_note: "Office rents can vary by building quality, north-south location, and proximity to major employment corridors.",
    availability_note: "Availability should be reviewed by submarket because downtown and north-side options can serve different tenant needs.",
    tenant_takeaway: "Tenants should compare commute patterns, parking, building quality, and access to customers or workforce concentrations.",
  },
  "CO/boulder": {
    average_rent: "$38–$55/SF/YR",
    availability_rate: "Moderate",
    availability_label: "Limited options in some preferred areas",
    market_trend: "Balanced",
    market_trend_label: "Quality and location can drive pricing",
    notable_areas: "Downtown Boulder|Pearl Street|East Boulder|Flatiron Park",
    summary: "Boulder tenants often compare downtown, East Boulder, and Flatiron Park office options based on talent access, building quality, and budget.",
    rent_note: "Office rents can vary significantly by proximity to downtown, building quality, and access to Boulder employment nodes.",
    availability_note: "Availability can be constrained in preferred areas, so tenants should compare Boulder with nearby northwest Denver markets when appropriate.",
    tenant_takeaway: "Tenants should compare location fit, commute patterns, building quality, and flexibility before committing.",
  },
};

const FALLBACK_PROFILE = {
  average_rent: "$25–$45/SF/YR",
  availability_rate: "Moderate",
  availability_label: "Tenant options vary by building and submarket",
  market_trend: "Balanced",
  market_trend_label: "Compare location, cost, and flexibility",
};

const TIER_DEFAULTS = {
  tier_1: {
    average_rent: "$30–$55/SF/YR",
    availability_rate: "Balanced supply",
    availability_label: "Options vary by building quality and submarket",
    market_trend: "Stabilizing market",
    market_trend_label: "Tenants should compare location, cost, and flexibility",
  },
  tier_2: {
    average_rent: "$25–$45/SF/YR",
    availability_rate: "Moderate",
    availability_label: "Tenant options vary by building and location",
    market_trend: "Balanced",
    market_trend_label: "Location fit and deal structure matter",
  },
  tier_3: {
    average_rent: "$20–$40/SF/YR",
    availability_rate: "Balanced",
    availability_label: "Local options should be verified before a search",
    market_trend: "Stable local demand",
    market_trend_label: "Practical fit matters more than headline market trends",
  },
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inQuotes && char === '"' && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
  }

  return rows;
}

function rowToObject(headers, row) {
  return headers.reduce((object, header, index) => {
    object[header] = String(row[index] || "").trim();
    return object;
  }, {});
}

function csvEscape(value) {
  const text = String(value || "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeState(value) {
  return String(value || "").trim().toUpperCase();
}

function titleize(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readCsvObjects(filePath, expectedColumns) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing CSV: ${path.relative(ROOT, filePath)}`);
  }

  const rows = parseCsv(fs.readFileSync(filePath, "utf8"));
  const headers = rows.shift() || [];
  const missing = expectedColumns.filter((column) => !headers.includes(column));
  if (missing.length) {
    throw new Error(`${path.relative(ROOT, filePath)} is missing columns: ${missing.join(", ")}`);
  }

  return rows.map((row) => rowToObject(headers, row));
}

function getExistingKeys() {
  return new Set(readCsvObjects(EXISTING_PATH, COLUMNS)
    .map((row) => `${normalizeState(row.state)}/${slugify(row.city_slug)}`)
    .filter((key) => key !== "/"));
}

function loadAllCityRows() {
  if (!fs.existsSync(CITIES_PATH)) {
    throw new Error(`Missing city data: ${path.relative(ROOT, CITIES_PATH)}`);
  }

  const cities = JSON.parse(fs.readFileSync(CITIES_PATH, "utf8"));
  return cities
    .filter((city) => city.slug && city.state_abbr)
    .map((city) => ({
      state: city.state_abbr,
      city_slug: city.slug,
      city_name: city.city || city.label || titleize(city.slug),
      tier: city.tier,
      population: Number(city.population || 0),
      building_count: Number(city.building_count || 0),
    }));
}

function cleanAddressFragment(address) {
  let fragment = String(address || "")
    .split(",")[0]
    .replace(/\b(suite|ste|unit|floor|fl|#)\b.*$/i, "")
    .replace(/^\d+[a-z]?\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!fragment) return "";

  const suffixPattern = /\b(st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|way|pkwy|parkway|pl|place|ct|court|hwy|highway|cir|circle)\b/i;
  if (!suffixPattern.test(fragment)) return "";

  const words = fragment.split(" ").filter(Boolean);
  if (words.length > 5) fragment = words.slice(-4).join(" ");
  if (fragment.length < 4 || fragment.length > 42) return "";
  return fragment;
}

function loadBuildingContext() {
  if (!fs.existsSync(BUILDINGS_PATH)) return new Map();

  const buildings = require(BUILDINGS_PATH);
  const contexts = new Map();

  buildings.forEach((building) => {
    const state = normalizeState(building.state_abbr || building.state);
    const citySlug = slugify(building.city_slug || building.city);
    if (!state || !citySlug) return;

    const key = `${state}/${citySlug}`;
    if (!contexts.has(key)) contexts.set(key, { count: 0, fragments: new Map() });

    const context = contexts.get(key);
    context.count += 1;

    const fragment = cleanAddressFragment(building.address);
    if (fragment) {
      context.fragments.set(fragment, (context.fragments.get(fragment) || 0) + 1);
    }
  });

  return contexts;
}

function getTopFragments(context, limit) {
  if (!context || !context.fragments) return [];
  return [...context.fragments.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([fragment]) => fragment);
}

function inferTier(input, key, buildingContext) {
  const explicitTier = Number(input.tier);
  const buildingCount = Number(input.building_count || buildingContext?.count || 0);
  const population = Number(input.population || 0);

  if (explicitTier === 1 || MAJOR_MARKET_KEYS.has(key) || buildingCount >= 50 || population >= 500000) return "tier_1";
  if (explicitTier === 2 || buildingCount >= 10 || population >= 100000) return "tier_2";
  return "tier_3";
}

function buildNotableAreas(cityName, tier, buildingContext) {
  const fragmentLimit = tier === "tier_1" ? 4 : tier === "tier_2" ? 3 : 2;
  const fragments = getTopFragments(buildingContext, fragmentLimit);
  if (fragments.length) return fragments.join("|");

  if (tier === "tier_1") return `Downtown ${cityName}|Business district|Main commercial corridors`;
  if (tier === "tier_2") return `Downtown ${cityName}|Main commercial corridors`;
  return `Downtown ${cityName}|Main commercial corridors`;
}

function buildFallbackProfile(cityName, tier, buildingContext) {
  const defaults = TIER_DEFAULTS[tier] || TIER_DEFAULTS.tier_3;
  const notableAreas = buildNotableAreas(cityName, tier, buildingContext);

  if (tier === "tier_1") {
    return {
      ...defaults,
      notable_areas: notableAreas,
      summary: `${cityName} tenants can use this draft snapshot to compare office options by location, building quality, access, and lease flexibility across the market.`,
      rent_note: "Office rents should be reviewed by building class, location, size, and lease structure before publication.",
      availability_note: "Availability should be verified against current local market conditions because options can vary meaningfully by building and submarket.",
      tenant_takeaway: "Tenants should compare total occupancy cost, commute patterns, building quality, and flexibility before choosing a location.",
    };
  }

  if (tier === "tier_2") {
    return {
      ...defaults,
      notable_areas: notableAreas,
      summary: `${cityName} tenants should compare office options by location, building condition, access, and room for flexibility.`,
      rent_note: "Office rents should be checked by building class, location, and lease structure.",
      availability_note: "Availability can vary by building and local submarket, so current options should be verified.",
      tenant_takeaway: "Tenants should compare several local options before committing to a location.",
    };
  }

  return {
    ...defaults,
    notable_areas: notableAreas,
    summary: `${cityName} tenants should verify current office options by location, building condition, and lease flexibility.`,
    rent_note: "Office rent ranges should be confirmed before publication.",
    availability_note: "Current availability should be verified before making search decisions.",
    tenant_takeaway: "Tenants should confirm pricing, availability, and location fit before moving forward.",
  };
}

function buildDraftRow(input, contextByKey) {
  const state = normalizeState(input.state);
  const citySlug = slugify(input.city_slug);
  const cityName = input.city_name || titleize(citySlug);
  const key = `${state}/${citySlug}`;
  const buildingContext = contextByKey.get(key);
  const enrichmentTier = input.enrichment_tier || inferTier(input, key, buildingContext);
  const profile = MARKET_PROFILES[key] || buildFallbackProfile(cityName, enrichmentTier, buildingContext);

  return {
    state,
    city_slug: citySlug,
    snapshot_title: "Office Market Snapshot",
    average_rent: profile.average_rent,
    average_rent_direction: profile.average_rent_direction || "flat",
    average_rent_label: profile.average_rent_label || "Typical office asking rent",
    availability_rate: profile.availability_rate,
    availability_direction: profile.availability_direction || "flat",
    availability_label: profile.availability_label,
    market_trend: profile.market_trend,
    market_trend_direction: profile.market_trend_direction || "flat",
    market_trend_label: profile.market_trend_label,
    notable_areas: profile.notable_areas,
    notable_areas_label: profile.notable_areas_label || "Common tenant search areas",
    summary: profile.summary,
    rent_note: profile.rent_note,
    availability_note: profile.availability_note,
    tenant_takeaway: profile.tenant_takeaway,
    enrichment_tier: enrichmentTier,
    approved: "",
  };
}

function validateDraft(row, lineNumber, warnings) {
  const key = `${row.state}/${row.city_slug}`;

  if (!row.notable_areas) warnings.push(`Line ${lineNumber} (${key}): notable_areas is blank.`);
  if (!row.average_rent) warnings.push(`Line ${lineNumber} (${key}): average_rent is missing.`);

  for (const field of ["average_rent_direction", "availability_direction", "market_trend_direction"]) {
    if (!VALID_DIRECTIONS.has(row[field])) {
      warnings.push(`Line ${lineNumber} (${key}): invalid ${field} "${row[field]}"; use up, down, flat, or blank.`);
    }
  }

  const summary = String(row.summary || "").toLowerCase();
  if (!summary || GENERIC_SUMMARY_PHRASES.some((phrase) => summary.includes(phrase))) {
    warnings.push(`Line ${lineNumber} (${key}): summary may be too generic and needs human review.`);
  }

  if (
    row.enrichment_tier === "tier_1" &&
    !MARKET_PROFILES[key] &&
    /main commercial corridors|downtown [^|]+\|business district/i.test(row.notable_areas || "")
  ) {
    warnings.push(`Line ${lineNumber} (${key}): tier_1 row uses weak default notable areas and needs market-specific review.`);
  }
}

function writeDraft(rows) {
  const output = [
    OUTPUT_COLUMNS.join(","),
    ...rows.map((row) => OUTPUT_COLUMNS.map((column) => csvEscape(row[column])).join(",")),
  ].join("\n");
  fs.writeFileSync(OUTPUT_PATH, `${output}\n`);
}

function main() {
  const existingKeys = getExistingKeys();
  const inputRows = ALL_MODE ? loadAllCityRows() : readCsvObjects(INPUT_PATH, DRAFT_COLUMNS);
  const buildingContext = loadBuildingContext();
  const warnings = [];
  const draftRows = [];
  const draftKeys = new Set();

  inputRows.forEach((input, index) => {
    const lineNumber = index + 2;
    const state = normalizeState(input.state);
    const citySlug = slugify(input.city_slug);
    const key = `${state}/${citySlug}`;

    if (!state || !citySlug) {
      warnings.push(`Line ${lineNumber}: missing state or city_slug.`);
      return;
    }

    if (existingKeys.has(key)) {
      warnings.push(`Line ${lineNumber} (${key}): already exists in _data/raw/market-snapshots.csv; skipped.`);
      return;
    }

    if (draftKeys.has(key)) {
      warnings.push(`Line ${lineNumber} (${key}): duplicate draft key; skipped.`);
      return;
    }

    const draft = buildDraftRow({ ...input, state, city_slug: citySlug }, buildingContext);
    validateDraft(draft, lineNumber, warnings);
    draftRows.push(draft);
    draftKeys.add(key);
  });

  writeDraft(draftRows);
  console.log(`Wrote ${draftRows.length} draft market snapshot rows to ${path.relative(ROOT, OUTPUT_PATH)}.`);
  if (ALL_MODE) {
    console.log("All-cities mode read _data/cities.generated.json and skipped existing production enrichment.");
  }
  console.log("Review this file manually before copying approved rows into _data/raw/market-snapshots.csv.");

  if (warnings.length) {
    console.warn(`Warnings (${warnings.length}):`);
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }
}

main();
