const batch = require("../data/peter/normalized/ecosystem_building_public_batch1.json");

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

function spaceTypeLabel(type) {
  const labels = {
    office: "Office",
    retail: "Retail",
    industrial: "Industrial",
    flex: "Flex",
  };

  return labels[type] || "Commercial";
}

function spaceTypeUrlSlug(type) {
  const slugs = {
    office: "office-space",
    retail: "retail-space",
    industrial: "industrial-space",
    flex: "flex-space",
  };

  return slugs[type] || "";
}

function summarizeSpaceTypes(mix) {
  return (mix || [])
    .filter((item) => item && item.space_type && item.space_type !== "land" && item.space_type !== "other")
    .map((item) => ({
      type: item.space_type,
      label: spaceTypeLabel(item.space_type),
      count: Number(item.count || 0),
      url_slug: spaceTypeUrlSlug(item.space_type),
    }));
}

function typePhrase(types) {
  const labels = types.map((item) => item.label.toLowerCase());

  if (!labels.length) return "commercial";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;

  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

function profileLabel(types) {
  const keys = new Set(types.map((item) => item.type));

  if (keys.has("industrial") && keys.has("office")) return "Office and light industrial area";
  if (keys.has("industrial")) return "Industrial and service-area location";
  if (keys.has("retail") && keys.has("office")) return "Retail and office corridor";
  if (keys.has("retail")) return "Neighborhood-serving retail corridor";
  if (keys.has("office")) return "Business-oriented office location";
  if (keys.has("flex")) return "Flexible commercial area";

  return "Commercial area";
}

function environmentSentence(building, types) {
  const keys = new Set(types.map((item) => item.type));
  const city = building.city;

  if (keys.has("retail") && keys.has("office")) {
    return `Located within a ${city} commercial corridor with nearby storefront, service, and office activity.`;
  }

  if (keys.has("industrial") && keys.has("office")) {
    return `Part of a ${city} commercial area where office, service, and light industrial uses can sit near one another.`;
  }

  if (keys.has("industrial")) {
    return `Located in a ${city} area with industrial, service, logistics, or operations-oriented commercial activity nearby.`;
  }

  if (keys.has("retail")) {
    return `Part of a ${city} corridor with neighborhood-serving retail, service businesses, and other customer-facing commercial uses nearby.`;
  }

  if (keys.has("office")) {
    return `Located in a ${city} business area with nearby office and professional commercial activity.`;
  }

  if (keys.has("flex")) {
    return `Part of a ${city} commercial area where flexible office, service, and light operational uses may be compared nearby.`;
  }

  return `Part of the ${city} commercial real estate market, with nearby buildings and business areas to compare.`;
}

function cityKey(building) {
  return `${building.state_abbr}/${building.city_slug}`;
}

const pages = batch
  .filter((building) => building.public_status === "indexable_batch1")
  .map((building) => {
    const state = clean(building.state_abbr).toUpperCase();
    const citySlug = slugify(building.city);
    const slug = building.slug || slugify(building.address);
    const spaceTypes = summarizeSpaceTypes(building.inferred_space_type_mix);

    return {
      ...building,
      state_abbr: state,
      city_slug: citySlug,
      slug,
      canonical_path: building.canonical_path || `/commercial-real-estate/building/${state}/${citySlug}/${slug}/`,
      city_url: `/commercial-real-estate/${state}/${citySlug}/`,
      market_guide_url: `/commercial-real-estate/${state}/${citySlug}/market-guide/`,
      display_title: clean(building.address),
      space_types: spaceTypes,
      space_type_phrase: typePhrase(spaceTypes),
      profile_label: profileLabel(spaceTypes),
      environment_sentence: environmentSentence(building, spaceTypes),
    };
  });

const pagesByCity = pages.reduce((lookup, building) => {
  const key = cityKey(building);
  if (!lookup.has(key)) lookup.set(key, []);
  lookup.get(key).push(building);
  return lookup;
}, new Map());

module.exports = pages.map((building) => {
  const related = (pagesByCity.get(cityKey(building)) || [])
    .filter((candidate) => candidate.canonical_path !== building.canonical_path)
    .slice(0, 4)
    .map((candidate) => ({
      title: candidate.display_title,
      url: candidate.canonical_path,
      market: `${candidate.city}, ${candidate.state_abbr}`,
      space_type_phrase: candidate.space_type_phrase,
    }));

  return {
    ...building,
    nearby_batch_buildings: related,
  };
});
