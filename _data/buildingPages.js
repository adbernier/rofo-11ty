const buildings = require("./buildings.js");
const buildingEnrichment = require("./buildingEnrichment.js");
const commercialAreas = require("../data/peter/research/commercial_area_entities_v1.json");
const commercialAreaRelationships = require("../data/peter/research/commercial_area_building_relationships_v1.json");
const nycNeighborhoodCandidates = require("../data/peter/research/nyc_neighborhood_rollout_candidates.json");
const priorityMarketAreas = require("../data/peter/research/priority_market_commercial_area_entities_v1.json");

const uniqueBuildings = buildings.filter((building, index, arr) => {
  const key = [
    String(building.state_abbr || "").toLowerCase(),
    String(building.city_slug || "").toLowerCase(),
    String(building.building_slug || "").toLowerCase(),
  ].join("|");

  return (
    arr.findIndex((other) => {
      const otherKey = [
        String(other.state_abbr || "").toLowerCase(),
        String(other.city_slug || "").toLowerCase(),
        String(other.building_slug || "").toLowerCase(),
      ].join("|");

      return otherKey === key;
    }) === index
  );
});

function cityKey(building) {
  return [
    String(building.state_abbr || "").toUpperCase(),
    String(building.city_slug || "").toLowerCase(),
  ].join("/");
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildingIdentity(building) {
  return [
    String(building.state_abbr || "").toLowerCase(),
    String(building.city_slug || "").toLowerCase(),
    String(building.building_slug || "").toLowerCase(),
  ].join("|");
}

function enrichmentKey(building) {
  const state = String(building.state_abbr || "").toLowerCase();
  const city = String(building.city_slug || "").toLowerCase();
  const address = buildingEnrichment.normalizeAddress(building.address);
  const slug = String(building.building_slug || "").toLowerCase();

  return [
    address ? `${state}|${city}|${address}` : "",
    slug ? `${state}|${city}|${slug}` : "",
  ].filter(Boolean);
}

function getEnrichment(building) {
  return enrichmentKey(building)
    .map((key) => buildingEnrichment[key])
    .find(Boolean);
}

function mergeUnique(values) {
  return [...new Set(values.filter(Boolean))];
}

const commercialAreaById = new Map(commercialAreas.map((area) => [area.id, area]));
const highConfidenceAreaByBuildingPath = new Map();

for (const relationship of commercialAreaRelationships.relationships || []) {
  if (relationship.confidence !== "high" || !relationship.building_path) continue;

  const area = commercialAreaById.get(relationship.primary_area_id);
  if (!area) continue;

  highConfidenceAreaByBuildingPath.set(relationship.building_path, {
    id: area.id,
    name: area.canonical_name,
    slug: slugify(area.canonical_name),
    area_type: area.area_type,
    city: area.city,
    state_abbr: area.state_abbr,
    path: `/commercial-real-estate/${area.state_abbr}/${slugify(area.city)}/${slugify(area.canonical_name)}/`,
    confidence: relationship.confidence,
    distance_to_centroid_km: relationship.distance_to_centroid_km,
  });
}

for (const candidate of nycNeighborhoodCandidates || []) {
  if (candidate.recommended_status !== "launch") continue;

  for (const buildingPath of candidate.representative_building_paths || []) {
    if (!buildingPath || highConfidenceAreaByBuildingPath.has(buildingPath)) continue;

    highConfidenceAreaByBuildingPath.set(buildingPath, {
      id: `nyc-${candidate.slug}`,
      name: candidate.canonical_name,
      slug: candidate.slug,
      area_type: candidate.area_type,
      city: "New York",
      state_abbr: "NY",
      path: candidate.canonical_path,
      confidence: "high",
      borough: candidate.borough,
    });
  }
}

for (const area of priorityMarketAreas || []) {
  if (area.recommended_status !== "launch") continue;

  for (const buildingPath of area.representative_building_paths || []) {
    if (!buildingPath || highConfidenceAreaByBuildingPath.has(buildingPath)) continue;

    highConfidenceAreaByBuildingPath.set(buildingPath, {
      id: area.id,
      name: area.canonical_name,
      slug: slugify(area.canonical_name),
      area_type: area.area_type,
      city: area.city,
      state_abbr: area.state_abbr,
      path: `/commercial-real-estate/${area.state_abbr}/${slugify(area.city)}/${slugify(area.canonical_name)}/`,
      confidence: "high",
    });
  }
}

function applyEnrichment(building) {
  const enrichment = getEnrichment(building);
  if (!enrichment) return building;

  const enrichmentTags = enrichment.inferred_tenant_types || [];
  const bestFor = mergeUnique([...(building.best_for || []), ...enrichmentTags]);

  return {
    ...building,
    has_availability: Boolean(enrichment.has_availability),
    availability_count: enrichment.availability_count || 0,
    enrichment_description: enrichment.description_snippet || "",
    enrichment_image: enrichment.image_url || "",
    enrichment_tags: enrichmentTags,
    virtual_tour_url: enrichment.virtual_tour_url || "",
    enrichment_source: enrichment.source || "",
    enrichment_source_url: enrichment.source_url || "",
    building_description: enrichment.description_snippet || building.building_description,
    hero_image: enrichment.image_url || building.hero_image,
    best_for: bestFor.length ? bestFor : building.best_for,
  };
}

function relatedBuildingSummary(building) {
  const displayName = String(building.display_name || building.name || "").trim();
  const hasNoisyName = /[!?]{1,}|^[A-Z0-9\s/,-]{12,}$/.test(displayName);

  return {
    address: building.address,
    display_name: building.address || (hasNoisyName ? building.address : displayName),
    type: building.primary_type_label || building.type || "Commercial Space",
    size_label: building.size_label || "",
    building_path: building.building_path,
    space_type_slug: building.space_type_slug || "",
  };
}

const buildingsByCity = uniqueBuildings.reduce((lookup, building) => {
  const key = cityKey(building);
  if (!lookup.has(key)) lookup.set(key, []);
  lookup.get(key).push(building);
  return lookup;
}, new Map());

function buildingAreaId(building) {
  return (
    highConfidenceAreaByBuildingPath.get(building.building_path)?.id ||
    building.commercial_area?.id ||
    ""
  );
}

function getRelatedBuildings(building) {
  const currentIdentity = buildingIdentity(building);
  const cityBuildings = (buildingsByCity.get(cityKey(building)) || [])
    .filter((candidate) => buildingIdentity(candidate) !== currentIdentity);
  const areaId = buildingAreaId(building);
  const sameArea = areaId
    ? cityBuildings.filter((candidate) => buildingAreaId(candidate) === areaId)
    : [];
  const outsideArea = cityBuildings.filter((candidate) => !sameArea.includes(candidate));

  const sameType = outsideArea.filter((candidate) =>
    candidate.space_type_slug &&
    building.space_type_slug &&
    candidate.space_type_slug === building.space_type_slug
  );
  const fallback = outsideArea.filter((candidate) => !sameType.includes(candidate));

  return [...sameArea, ...sameType, ...fallback].slice(0, 5).map(relatedBuildingSummary);
}

module.exports = uniqueBuildings.map((building) =>
  applyEnrichment({
    ...building,
    related_buildings: getRelatedBuildings(building),
    commercial_area: highConfidenceAreaByBuildingPath.get(building.building_path) || building.commercial_area || null,
  })
);
