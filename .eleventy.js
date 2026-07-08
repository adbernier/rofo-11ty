const {
  getBuildingsForCompany,
  getBuildingsForCompanyInCity
} = require("./_data/companyUtils");

function cleanStreetFragment(value) {
  let fragment = String(value || "").trim();
  if (!fragment) return "";

  fragment = fragment
    .replace(/\s+/g, " ")
    .replace(/^(?:\d+[A-Za-z]?|[A-Z]?\d+[A-Z]?)(?:-\d+[A-Za-z]?)?\s+/, "")
    .replace(/^\d+\/\d+\s+/, "")
    .replace(/,.*$/, "")
    .replace(/\b(?:Suite|Ste|Floor|Fl|Unit)\b.*$/i, "")
    .replace(/\s+(?:#|No\.).*$/i, "")
    .trim()
    .replace(/\s+/g, " ");

  if (fragment.length < 5 || fragment.length > 42) return "";
  if (/^\d/.test(fragment)) return "";
  if (/^(unknown|n\/a|na)$/i.test(fragment)) return "";

  return fragment;
}

function formatList(items) {
  const values = items.filter(Boolean);
  if (values.length === 0) return "";
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function spaceTypePhrase(availableSpaceTypes = []) {
  const labels = availableSpaceTypes.map((item) => {
    const slug = typeof item === "string" ? item : item.slug;

    if (slug === "office-space") return "office";
    if (slug === "retail-space") return "retail";
    if (slug === "industrial-space") return "industrial";
    if (slug === "flex-space") return "flex";
    if (slug === "coworking-space") return "coworking";

    return "";
  }).filter(Boolean);

  if (!labels.length) return "business location";
  if (labels.length === 1) return labels[0];

  return formatList(labels.slice(0, 4));
}

function marketSizePhrase(population) {
  const pop = Number(population || 0);

  if (pop >= 1000000) return "a large regional market";
  if (pop >= 250000) return "a mid-sized market";
  return "a local market";
}

function inventoryPhrase(buildingCount, availableSpaceTypes = []) {
  const count = Number(buildingCount || 0);
  const diversity = availableSpaceTypes.length;
  const spaces = spaceTypePhrase(availableSpaceTypes);

  if (count >= 50 && diversity >= 3) {
    return `with a broad mix of ${spaces} options`;
  }

  if (count >= 15 && diversity >= 2) {
    return `with ${spaces} options`;
  }

  if (count > 0) {
    return `with available ${spaces} options`;
  }

  return "with business locations across the area";
}

function generateMarketContext({ city, buildingPages = [], availableSpaceTypes = [], stateName = "" }) {
  const cityName = city.city || city.name;
  const displayState = city.state_name || stateName || city.state || city.state_abbr;
  const countyName = city.county_name || city.county;
  const population = city.population;

  const size = marketSizePhrase(population);
  const inventory = inventoryPhrase(buildingPages.length, availableSpaceTypes);

  const regional = countyName
    ? ` and access across ${countyName.replace(/\s+County$/i, "")} County`
    : " and access to nearby regional hubs";

  return `${cityName} is ${size} in ${displayState}, ${inventory}${regional}.`;
}

function looksLikeRealBuildingName(name, address) {
  const value = String(name || "").trim();
  if (!value) return false;

  const addr = String(address || "").trim();
  if (addr && value.toLowerCase() === addr.toLowerCase()) return false;
  if (/^\d+[a-z]?\s+/i.test(value)) return false;
  if (/^(n\/a|na|unknown|property|building)$/i.test(value)) return false;
  if (value.length < 4) return false;

  return true;
}

function getBuildingLabel(building) {
  return looksLikeRealBuildingName(building.name, building.address)
    ? building.name.trim()
    : String(building.address || building.name || "This property").trim();
}

function getBuildingTypes(building) {
  const values = [
    building.type,
    building.primary_space_type,
    ...(Array.isArray(building.space_types) ? building.space_types : [])
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  const types = new Set();

  if (values.some((value) => value.includes("office") || value.includes("cowork"))) {
    types.add("office");
  }

  if (
    values.some(
      (value) =>
        value.includes("industrial") ||
        value.includes("warehouse") ||
        value.includes("distribution") ||
        value.includes("logistics")
    )
  ) {
    types.add("industrial");
  }

  if (
    values.some(
      (value) =>
        value.includes("retail") ||
        value.includes("storefront") ||
        value.includes("restaurant")
    )
  ) {
    types.add("retail");
  }

  if (values.some((value) => value.includes("flex"))) {
    types.add("flex");
  }

  return [...types];
}

function generateBuildingDescription(building) {
  const label = getBuildingLabel(building);
  const city = building.city;
  const state = building.state_abbr;
  const types = getBuildingTypes(building);
  const set = new Set(types);

  if (!types.length) return "";

  if (set.has("office") && set.has("retail") && set.has("industrial")) {
    return `${label} in ${city}, ${state} supports office, customer-facing, warehouse, and light industrial uses.`;
  }

  if (set.has("office") && set.has("retail")) {
    return `${label} in ${city}, ${state} supports office and customer-facing uses.`;
  }

  if (set.has("office") && set.has("industrial")) {
    return `${label} in ${city}, ${state} supports office, warehouse, and light industrial uses.`;
  }

  if (set.has("retail") && set.has("industrial")) {
    return `${label} in ${city}, ${state} supports retail, service, and light industrial uses.`;
  }

  if (set.has("industrial")) {
    return `${label} in ${city}, ${state} provides warehouse and logistics space.`;
  }

  if (set.has("retail")) {
    return `${label} in ${city}, ${state} is positioned for retail and customer-facing uses.`;
  }

  if (set.has("office")) {
    return `${label} in ${city}, ${state} offers office space for professional use.`;
  }

  if (set.has("flex")) {
    return `${label} in ${city}, ${state} supports flexible business uses.`;
  }

  return "";
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("favicon-32x32.png");
  eleventyConfig.addPassthroughCopy("favicon-16x16.png");
  eleventyConfig.addPassthroughCopy("apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("robots.txt");

  eleventyConfig.addFilter("queryEncode", (value) => encodeURIComponent(String(value || "")));

  eleventyConfig.addFilter("uniqueStates", (cities) => {
    const seen = new Set();
    return cities.filter((c) => {
      if (seen.has(c.state_abbr)) return false;
      seen.add(c.state_abbr);
      return true;
    });
  });

  eleventyConfig.addFilter("buildingPlaceholder", (building) => {
    const type = (building?.type || "").toLowerCase();

    let variants = [
      "/images/placeholders/building-a.svg",
      "/images/placeholders/building-b.svg",
      "/images/placeholders/building-c.svg",
    ];

    if (type.includes("industrial") || type.includes("flex")) {
      variants = [
        "/images/placeholders/building-c.svg",
        "/images/placeholders/building-b.svg",
      ];
    }

    const seedSource =
      building?.slug ||
      building?.address ||
      building?.name ||
      "building";

    let hash = 0;
    for (let i = 0; i < seedSource.length; i++) {
      hash = (hash + seedSource.charCodeAt(i)) % 100000;
    }

    return variants[hash % variants.length];
  });

  eleventyConfig.addFilter("getBuildingsForCompany", (buildings, companySlug) => {
    return getBuildingsForCompany(buildings, companySlug);
  });

  eleventyConfig.addFilter(
    "getBuildingsForCompanyInCity",
    (buildings, companySlug, cityStateSlug) => {
      return getBuildingsForCompanyInCity(buildings, companySlug, cityStateSlug);
    }
  );

  eleventyConfig.addFilter("cityStreetFragments", (buildings, limit = 5) => {
    const seen = new Set();
    const fragments = [];

    for (const building of buildings || []) {
      const fragment = cleanStreetFragment(building.address || building.name);
      const key = fragment.toLowerCase();

      if (!fragment || seen.has(key)) continue;

      seen.add(key);
      fragments.push(fragment);

      if (fragments.length >= limit) break;
    }

    return fragments;
  });

  eleventyConfig.addFilter("marketContext", (city, buildings, availableSpaceTypes, stateName) => {
    return generateMarketContext({
      city,
      buildingPages: buildings,
      availableSpaceTypes,
      stateName
    });
  });

  eleventyConfig.addFilter("buildingDescription", (building) => {
    return generateBuildingDescription(building || {});
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    }
  };
};
