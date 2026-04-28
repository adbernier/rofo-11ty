const legacyBuildings = require("../data-sources/reference/buildings-live-before-merge.json");
const companyBuildings = require("../data-sources/reference/company-buildings.json");
const { getRoutingCandidates } = require("./leadRouting.js");
const cities = require("./cities.generated.json");

function clean(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countyStateSlug(county, state_abbr) {
  const countySlug = slugify(county);
  const stateSlug = clean(state_abbr).toLowerCase();

  return countySlug && stateSlug ? `${countySlug}-${stateSlug}` : "";
}

const cityCountyLookup = new Map(
  cities.map((city) => [
    city.city_state_slug || `${city.slug}-${String(city.state_abbr || "").toLowerCase()}`,
    countyStateSlug(city.county || city.county_name, city.state_abbr),
  ])
);

function isLand(building) {
  const type = String(building.type || building.space_type || "").toLowerCase();
  return type.includes("land");
}

function normalizeState(building) {
  return clean(building.state_abbr || building.state || building.property_state).toUpperCase();
}

function normalizeCity(building) {
  return clean(building.city || building.property_city);
}

function normalizeAddress(building) {
  return clean(building.address || building.property_address || building.name);
}

function normalizeImages(building) {
  if (Array.isArray(building.image_urls)) return building.image_urls.filter(Boolean);
  if (Array.isArray(building.property_image_urls)) return building.property_image_urls.filter(Boolean);

  if (typeof building.property_image_urls === "string") {
    return building.property_image_urls
      .split(/[|,]/)
      .map((url) => url.trim())
      .filter(Boolean);
  }

  if (building.hero_image) return [building.hero_image];

  return [];
}

function looksLikeRealBuildingName(name, address) {
  const value = clean(name);
  if (!value) return false;

  const addr = clean(address);
  if (addr && value.toLowerCase() === addr.toLowerCase()) return false;
  if (/^\d+[a-z]?\s+/i.test(value)) return false;
  if (/^(n\/a|na|unknown|property|building)$/i.test(value)) return false;
  if (value.length < 4) return false;

  return true;
}

function getBuildingLabel(building, address) {
  return looksLikeRealBuildingName(building.name, address)
    ? clean(building.name)
    : address;
}

function getBuildingTypeSet(building) {
  const values = [
    building.type,
    building.space_type,
    building.primary_space_type,
    building.category,
    building.use,
    building.property_type,
    building.listing_type,
    building.lease_category,
    ...(Array.isArray(building.space_types) ? building.space_types : []),
    ...(Array.isArray(building.raw_space_types) ? building.raw_space_types : []),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  const types = new Set();

  if (
    values.some((value) =>
      ["coworking", "co-working", "shared office", "executive suite"].some((match) =>
        value.includes(match)
      )
    ) ||
    Boolean(building.is_exec_suite_present)
  ) {
    types.add("coworking");
  }

  if (
    values.some((value) =>
      ["office", "private office", "business center", "live/work", "live work"].some((match) =>
        value.includes(match)
      )
    )
  ) {
    types.add("office");
  }

  if (
    values.some((value) =>
      ["retail", "storefront", "restaurant"].some((match) => value.includes(match))
    )
  ) {
    types.add("retail");
  }

  if (
    values.some((value) =>
      ["industrial", "warehouse", "distribution", "manufacturing", "logistics", "light industrial"].some((match) =>
        value.includes(match)
      )
    )
  ) {
    types.add("industrial");
  }

  if (
    values.some((value) =>
      ["flex", "flex-space", "office/warehouse", "office warehouse"].some((match) =>
        value.includes(match)
      )
    ) ||
    (types.has("office") && types.has("industrial"))
  ) {
    types.add("flex");
  }

  return types;
}

function matchBuildingType(value) {
  const normalized = String(value || "").toLowerCase();
  if (!normalized) return "";

  if (
    ["coworking", "co-working", "shared office", "executive suite"].some((match) =>
      normalized.includes(match)
    )
  ) {
    return "coworking";
  }

  if (
    ["flex", "flex-space", "office/warehouse", "office warehouse"].some((match) =>
      normalized.includes(match)
    )
  ) {
    return "flex";
  }

  if (
    ["industrial", "warehouse", "distribution", "manufacturing", "logistics", "light industrial"].some((match) =>
      normalized.includes(match)
    )
  ) {
    return "industrial";
  }

  if (["retail", "storefront", "restaurant"].some((match) => normalized.includes(match))) {
    return "retail";
  }

  if (["office", "private office", "business center", "live/work", "live work"].some((match) =>
    normalized.includes(match)
  )) {
    return "office";
  }

  return "";
}

function getPrimaryBuildingType(building, typeSet) {
  const explicitType = matchBuildingType(
    building.primary_space_type ||
      building.space_type ||
      building.type ||
      building.property_type ||
      building.category
  );

  if (typeSet.has("office") && typeSet.has("industrial")) return "flex";

  if (explicitType) return explicitType;

  const order = ["coworking", "flex", "industrial", "retail", "office"];
  return order.find((type) => typeSet.has(type)) || "commercial";
}

const TYPE_META = {
  office: {
    label: "Office Space",
    optionLabel: "office space",
    slug: "office-space",
    description:
      "offers office space suited for professional services, small teams, and client-facing businesses",
    about:
      "This property reflects the types of professional office environments commonly found in the {city} market, with potential fit for service firms, small teams, and client-facing businesses.",
    detailSummary:
      "Professional office use",
    bestFor: [
      "Professional services",
      "Small to mid-size teams",
      "Client-facing businesses",
    ],
  },
  retail: {
    label: "Retail Space",
    optionLabel: "retail space",
    slug: "retail-space",
    description:
      "is positioned for retail, service, and customer-facing businesses",
    about:
      "This property reflects the types of retail and service-oriented environments commonly found in the {city} market, with potential fit for customer-facing businesses.",
    detailSummary:
      "Retail and service-oriented use",
    bestFor: [
      "Walk-in retail",
      "Service businesses",
      "Customer-facing brands",
    ],
  },
  industrial: {
    label: "Industrial Space",
    optionLabel: "industrial space",
    slug: "industrial-space",
    description:
      "provides industrial space suited for warehouse, logistics, and light industrial users",
    about:
      "This property reflects the types of warehouse, logistics, and light industrial environments commonly found in the {city} market.",
    detailSummary:
      "Warehouse, logistics, or light industrial use",
    bestFor: [
      "Warehouse users",
      "Light industrial operations",
      "Distribution and logistics",
    ],
  },
  coworking: {
    label: "Coworking Space",
    optionLabel: "coworking space",
    slug: "coworking-space",
    description:
      "offers coworking space for flexible teams, remote workers, and small businesses",
    about:
      "This property reflects the types of flexible workspace environments commonly found in the {city} market, with potential fit for remote workers, small teams, and growing companies.",
    detailSummary:
      "Coworking and flexible workspace use",
    bestFor: [
      "Flexible teams",
      "Remote workers",
      "Startups and small businesses",
    ],
  },
  flex: {
    label: "Flex Space",
    optionLabel: "flex space",
    slug: "flex-space",
    description:
      "supports adaptable space needs for showroom, service, office, or light industrial users",
    about:
      "This property reflects the types of adaptable commercial environments commonly found in the {city} market, with potential fit for showroom, service, office, or light industrial users.",
    detailSummary:
      "Adaptable commercial use",
    bestFor: [
      "Showroom or service businesses",
      "Light industrial users",
      "Growing teams that need adaptable space",
    ],
  },
  commercial: {
    label: "Commercial Space",
    optionLabel: "commercial space",
    slug: "",
    description:
      "supports businesses exploring commercial space in the local market",
    about:
      "This property reflects the types of commercial environments commonly found in the {city} market.",
    detailSummary:
      "General commercial use",
    bestFor: [
      "Local businesses",
      "Growing teams",
      "Companies exploring commercial space in this market",
    ],
  },
};

const TOP_MARKET_CONTEXT = {
  "san-francisco":
    "within one of the Bay Area's most established commercial markets",
  "los-angeles":
    "within one of Southern California's largest and most diverse commercial markets",
  "san-diego":
    "within a major Southern California market with office, retail, and industrial demand",
  "austin":
    "within one of Texas's fastest-growing business markets",
  "phoenix":
    "within one of the Southwest's largest and fastest-growing commercial markets",
  "new-york":
    "within one of the country's deepest and most active commercial real estate markets",
  "chicago":
    "within one of the Midwest's largest commercial real estate markets",
  "dallas":
    "within one of Texas's largest business and logistics markets",
  "houston":
    "within one of Texas's largest office, industrial, and energy-linked business markets",
  "miami":
    "within one of South Florida's most active commercial markets",
  "seattle":
    "within a major Pacific Northwest business and technology market",
  "denver":
    "within one of the Mountain West's major business markets",
  "boston":
    "within one of the Northeast's most established office, medical, and technology markets",
  "atlanta":
    "within one of the Southeast's largest business and logistics markets",
  "charlotte":
    "within one of the Southeast's growing finance and business markets",
};

function getBuildingDescription(building, label, city, state_abbr, primaryType) {
  const meta = TYPE_META[primaryType] || TYPE_META.commercial;
  return `${label} in ${city}, ${state_abbr} ${meta.description}.`;
}

function formatTypeText(text, city) {
  return text.replace("{city}", city);
}

function getLocationContext(city, city_slug, primaryType) {
  const meta = TYPE_META[primaryType] || TYPE_META.commercial;
  const topMarketContext = TOP_MARKET_CONTEXT[city_slug];

  if (topMarketContext) {
    return `For businesses evaluating ${meta.optionLabel} in ${city}, this property sits ${topMarketContext}.`;
  }

  return `For businesses evaluating ${meta.optionLabel} in ${city}, this property can be considered within the broader local commercial market.`;
}

function buildingKey(building) {
  return [
    normalizeAddress(building),
    normalizeCity(building),
    normalizeState(building)
  ].join("|").toLowerCase();
}

function normalizeBuilding(building, source) {
  const address = normalizeAddress(building);
  const city = normalizeCity(building);
  const state_abbr = normalizeState(building);
  const images = normalizeImages(building);

  const city_slug = building.city_slug || slugify(city);
  const building_slug = building.building_slug || building.slug || slugify(address);
  const typeSet = getBuildingTypeSet(building);
  const primaryType = getPrimaryBuildingType(building, typeSet);
  const typeMeta = TYPE_META[primaryType] || TYPE_META.commercial;
  const buildingLabel = getBuildingLabel(building, address);
  const spaceTypeUrl = typeMeta.slug
    ? `/commercial-real-estate/${state_abbr}/${city_slug}/${typeMeta.slug}/`
    : "";
  const city_state_slug = building.city_state_slug || `${city_slug}-${state_abbr.toLowerCase()}`;
  const routing_county = countyStateSlug(
    building.county || building.county_name || building.property_county,
    state_abbr
  ) || cityCountyLookup.get(city_state_slug) || "";
  const routingCandidates = getRoutingCandidates({
    city_state_slug,
    county_state_slug: routing_county,
    space_type_slug: typeMeta.slug,
  });

  return {
    ...building,

    source,
    address,
    name: clean(building.name) || address,
    display_name: getBuildingLabel(building, address),
    city,
    state_abbr,

    city_slug,
    building_slug,
    city_state_slug,

    building_path:
      building.building_path ||
      `/commercial-real-estate/building/${state_abbr}/${city_slug}/${building_slug}/`,

    type: clean(building.type || building.space_type) || "Commercial Space",
    size_label: clean(building.size_label || building.size) || "",
    building_description: getBuildingDescription(
      building,
      buildingLabel,
      city,
      state_abbr,
      primaryType
    ),
    about_context: formatTypeText(typeMeta.about, city),
    best_for: typeMeta.bestFor,
    location_context: getLocationContext(city, city_slug, primaryType),
    detail_summary: typeMeta.detailSummary,
    primary_type_label: typeMeta.label,
    space_type_slug: typeMeta.slug,
    space_type_url: spaceTypeUrl,
    space_type_label: typeMeta.label,
    routing_candidates: routingCandidates,
    routing_market: city_state_slug,
    routing_county,
    routing_space_type: typeMeta.slug,

    hero_image: building.hero_image || images[0] || "",
    image_urls: images,

    teaser:
      clean(building.teaser) ||
      `Explore commercial real estate options at ${address} in ${city}, ${state_abbr}.`
  };
}

function scoreBuilding(building) {
  let score = 0;

  if (building.hero_image) score += 5;
  if (building.image_urls && building.image_urls.length) score += 3;
  if (building.type) score += 2;
  if (building.size_label) score += 1;
  if (building.featured_company_name) score += 2;
  if (building.building_path) score += 1;

  return score;
}

const merged = new Map();

for (const building of legacyBuildings) {
  const normalized = normalizeBuilding(building, "legacy");
  const key = buildingKey(normalized);
  if (key) merged.set(key, normalized);
}

for (const building of companyBuildings) {
  const normalized = normalizeBuilding(building, "company");
  const key = buildingKey(normalized);
  if (!key) continue;

  const existing = merged.get(key);

  if (!existing || scoreBuilding(normalized) > scoreBuilding(existing)) {
    merged.set(key, normalized);
  }
}

const filtered = Array.from(merged.values()).filter(b => !isLand(b));

module.exports = filtered.sort((a, b) => {
  return `${a.state_abbr} ${a.city} ${a.address}`.localeCompare(
    `${b.state_abbr} ${b.city} ${b.address}`
  );
});
