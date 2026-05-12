const candidates = require("../data/peter/prototypes/ecosystem_building_activation_review_batch1.json");

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

function cityKey(building) {
  return `${clean(building.state_abbr).toUpperCase()}/${slugify(building.city)}`;
}

function summarizeSpaceTypes(mix) {
  return (mix || [])
    .filter((item) => item && item.space_type && item.space_type !== "other")
    .map((item) => ({
      type: item.space_type,
      label: spaceTypeLabel(item.space_type),
      count: Number(item.count || 0),
      url_slug: spaceTypeUrlSlug(item.space_type),
    }));
}

function spaceTypeLabel(type) {
  const labels = {
    office: "Office",
    retail: "Retail",
    industrial: "Industrial",
    flex: "Flex",
    land: "Land or development-oriented commercial",
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

function typePhrase(types) {
  const labels = types.map((item) => item.label.toLowerCase());

  if (!labels.length) return "commercial";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;

  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

function profileLabel(types) {
  const keys = new Set(types.map((item) => item.type));

  if (keys.has("industrial") && keys.has("office")) return "Mixed office and industrial setting";
  if (keys.has("industrial")) return "Industrial and logistics-oriented setting";
  if (keys.has("retail") && keys.has("office")) return "Mixed office and retail setting";
  if (keys.has("retail")) return "Retail-oriented commercial setting";
  if (keys.has("office")) return "Office-oriented commercial setting";
  if (keys.has("flex")) return "Flexible commercial setting";
  if (keys.has("land")) return "Commercial development context";

  return "Commercial market context";
}

function environmentSentence(candidate, types) {
  const phrase = typePhrase(types);

  if (phrase === "commercial") {
    return `This address sits within the broader ${candidate.city} commercial real estate market.`;
  }

  return `This address sits within a ${candidate.city} commercial area with context related to ${phrase} use.`;
}

function pageFromCandidate(candidate) {
  const state = clean(candidate.state_abbr).toUpperCase();
  const citySlug = slugify(candidate.city);
  const buildingSlug = slugify(candidate.address || candidate.normalized_building_key);
  const spaceTypes = summarizeSpaceTypes(candidate.inferred_space_type_mix);

  return {
    ...candidate,
    state_abbr: state,
    city_slug: citySlug,
    building_slug: buildingSlug,
    prototype_url: `/prototype/buildings/${state}/${citySlug}/${buildingSlug}/`,
    city_url: `/commercial-real-estate/${state}/${citySlug}/`,
    market_guide_url: `/commercial-real-estate/${state}/${citySlug}/market-guide/`,
    display_title: clean(candidate.proposed_public_title) || clean(candidate.address),
    noindex: true,
    prototype: true,
    public_description:
      `Commercial real estate near ${clean(candidate.address)} in ${candidate.city}, ${state}.`,
    space_types: spaceTypes,
    space_type_phrase: typePhrase(spaceTypes),
    profile_label: profileLabel(spaceTypes),
    environment_sentence: environmentSentence(candidate, spaceTypes),
  };
}

const pages = candidates
  .filter((candidate) => candidate.review_status === "pending")
  .map(pageFromCandidate);

const pagesByCity = pages.reduce((lookup, building) => {
  const key = cityKey(building);
  if (!lookup.has(key)) lookup.set(key, []);
  lookup.get(key).push(building);
  return lookup;
}, new Map());

module.exports = pages.map((building) => {
  const related = (pagesByCity.get(cityKey(building)) || [])
    .filter((candidate) => candidate.prototype_url !== building.prototype_url)
    .sort(
      (a, b) =>
        Number(b.estimated_historical_listing_activity || 0) -
        Number(a.estimated_historical_listing_activity || 0)
    )
    .slice(0, 4)
    .map((candidate) => ({
      title: candidate.display_title,
      url: candidate.prototype_url,
      market: `${candidate.city}, ${candidate.state_abbr}`,
      activity: candidate.estimated_historical_listing_activity,
      space_type_phrase: candidate.space_type_phrase,
    }));

  return {
    ...building,
    nearby_representative_buildings: related,
  };
});
