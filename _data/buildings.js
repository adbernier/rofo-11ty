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