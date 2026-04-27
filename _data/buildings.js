const legacyBuildings = require("../data-sources/reference/buildings-live-before-merge.json");
const companyBuildings = require("../data-sources/reference/company-buildings.json");

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

function getPrimaryBuildingType(typeSet) {
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
    bestFor: [
      "Local businesses",
      "Growing teams",
      "Companies exploring commercial space in this market",
    ],
  },
};

function getBuildingDescription(building, label, city, state_abbr, primaryType) {
  const meta = TYPE_META[primaryType] || TYPE_META.commercial;
  return `${label} in ${city}, ${state_abbr} ${meta.description}.`;
}

function getLocationContext(city, state_abbr, primaryType) {
  const meta = TYPE_META[primaryType] || TYPE_META.commercial;
  return `Located in ${city}, ${state_abbr}, this property may work well for businesses exploring ${meta.optionLabel} options in the local market.`;
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
  const primaryType = getPrimaryBuildingType(typeSet);
  const typeMeta = TYPE_META[primaryType] || TYPE_META.commercial;
  const buildingLabel = getBuildingLabel(building, address);
  const spaceTypeUrl = typeMeta.slug
    ? `/commercial-real-estate/${state_abbr}/${city_slug}/${typeMeta.slug}/`
    : "";

  return {
    ...building,

    source,
    address,
    name: clean(building.name) || address,
    city,
    state_abbr,

    city_slug,
    building_slug,
    city_state_slug: building.city_state_slug || `${city_slug}-${state_abbr.toLowerCase()}`,

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
    best_for: typeMeta.bestFor,
    location_context: getLocationContext(city, state_abbr, primaryType),
    primary_type_label: typeMeta.label,
    space_type_url: spaceTypeUrl,
    space_type_label: typeMeta.label,

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
