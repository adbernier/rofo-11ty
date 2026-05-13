const fs = require("fs");
const path = require("path");

const pageDataPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "normalized",
  "neighborhoods.hidden-page-data.json"
);
const allowlistPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "normalized",
  "neighborhoods.public-review-allowlist.json"
);
const commercialAreasPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "research",
  "commercial_area_entities_v1.json"
);
const commercialRelationshipsPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "research",
  "commercial_area_building_relationships_v1.json"
);

const pages = JSON.parse(fs.readFileSync(pageDataPath, "utf8"));
const allowlist = JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
const commercialAreas = JSON.parse(fs.readFileSync(commercialAreasPath, "utf8"));
const commercialRelationships = JSON.parse(fs.readFileSync(commercialRelationshipsPath, "utf8"));
const allowlistByPath = new Map(
  allowlist.map((item) => [item.canonical_neighborhood_path, item])
);
const relationshipsByArea = new Map();
const areaSummaryById = new Map(
  (commercialRelationships.area_summaries || []).map((area) => [area.area_id, area])
);

for (const relationship of commercialRelationships.relationships || []) {
  if (!relationshipsByArea.has(relationship.primary_area_id)) {
    relationshipsByArea.set(relationship.primary_area_id, []);
  }

  relationshipsByArea.get(relationship.primary_area_id).push(relationship);
}

function cleanBuildingName(name) {
  if (!name) {
    return "";
  }

  return String(name)
    .replace(/\s+/g, " ")
    .replace(/[!]+$/g, "")
    .trim();
}

function hasUsableAddress(address) {
  return Boolean(
    address &&
      /\d/.test(String(address)) &&
      String(address).trim().length > 3
  );
}

function normalizeRepresentativeBuilding(building) {
  const address = cleanBuildingName(building.address);
  const name = cleanBuildingName(building.display_name || building.name);

  return {
    ...building,
    display_name: hasUsableAddress(address) ? address : name,
  };
}

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

function typeLabel(value) {
  const labels = {
    office: "Office Space",
    retail: "Retail Space",
    industrial: "Industrial Space",
    flex: "Flex Space",
    coworking: "Coworking Space",
    commercial: "Commercial Space",
  };

  return labels[value] || `${clean(value).replace(/_/g, " ")} space`;
}

function signalLabel(value) {
  const labels = {
    office: "Office",
    retail: "Retail",
    industrial: "Industrial",
    logistics: "Logistics",
    creative_office: "Creative office",
    mixed_use: "Mixed use",
    startup: "Startup-oriented",
    downtown: "Downtown",
    neighborhood_retail: "Neighborhood retail",
    warehouse: "Warehouse",
    transit_oriented: "Transit-oriented",
    professional_services: "Professional services",
    boutique_office: "Boutique office",
    historic_building: "Historic building context",
    waterfront: "Waterfront context",
    hospitality: "Hospitality",
    showroom: "Showroom",
    medical: "Medical",
    suburban_office: "Suburban office",
    enterprise_environment: "Enterprise office",
    airport_access: "Airport access",
    life_science: "Life science",
  };

  return labels[value] || clean(value).replace(/_/g, " ");
}

function areaPath(area) {
  return `/commercial-real-estate/${area.state_abbr}/${slugify(area.city)}/${slugify(area.canonical_name)}/`;
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

function representativeBuildingsFor(areaId) {
  return (relationshipsByArea.get(areaId) || [])
    .slice()
    .sort((a, b) => {
      if (a.confidence !== b.confidence) return a.confidence === "high" ? -1 : 1;
      if (a.distance_to_centroid_km !== b.distance_to_centroid_km) {
        return a.distance_to_centroid_km - b.distance_to_centroid_km;
      }
      return (b.historical_listing_activity || 0) - (a.historical_listing_activity || 0);
    })
    .slice(0, 6)
    .map((relationship) =>
      normalizeRepresentativeBuilding({
        address: relationship.address,
        display_name: relationship.address || relationship.building_name,
        name: relationship.building_name,
        building_path: relationship.building_path,
        type: typeLabel(relationship.inferred_space_type_mix?.[0]?.space_type || "commercial"),
        size_label: "",
        primary_area_id: relationship.primary_area_id,
        relationship_confidence: relationship.confidence,
      })
    );
}

function spaceTypesFor(areaId) {
  const summary = areaSummaryById.get(areaId);
  const values = (summary?.dominant_space_type_patterns || [])
    .map((item) => item.space_type)
    .filter((value) => ["office", "retail", "industrial", "flex", "coworking"].includes(value));

  return [...new Set(values)];
}

function commercialPageFor(area) {
  const summary = areaSummaryById.get(area.id);
  const representative_buildings = representativeBuildingsFor(area.id);

  if (!summary || !representative_buildings.length) return null;

  const canonical_neighborhood_path = areaPath(area);
  const areaTypeLabel = clean(area.area_type).replace(/_/g, " ");

  return {
    name: area.canonical_name,
    slug: slugify(area.canonical_name),
    city: area.city,
    state_abbr: area.state_abbr,
    city_slug: slugify(area.city),
    canonical_neighborhood_path,
    centroid_lat: area.approximate_centroid?.lat || "",
    centroid_lng: area.approximate_centroid?.lng || "",
    radius: "",
    geometry_quality: "commercial_area_entity",
    approximate_building_count: summary.relationship_count,
    approximate_space_types: spaceTypesFor(area.id),
    approximate_semantic_signals: (area.commercial_profile || []).map(signalLabel).slice(0, 8),
    representative_buildings,
    commercial_area_id: area.id,
    commercial_area_type: area.area_type,
    commercial_area_type_label: areaTypeLabel,
    commercial_profile: area.commercial_profile || [],
    source_confidence: area.source_confidence,
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
  };
}

const existingPages = pages
  .filter((page) => allowlistByPath.has(page.canonical_neighborhood_path))
  .map((page) => ({
    ...page,
    ...allowlistByPath.get(page.canonical_neighborhood_path),
    representative_buildings: (page.representative_buildings || []).map(
      normalizeRepresentativeBuilding
    ),
    prototype: true,
    public_review: false,
    public_phase_1: true,
  }));

const commercialPages = commercialAreas
  .map(commercialPageFor)
  .filter(Boolean);

const allPagesByPath = new Map();

for (const page of existingPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, page);
}

for (const page of commercialPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

const allPages = Array.from(allPagesByPath.values());

for (const page of allPages) {
  const center = { lat: page.centroid_lat, lng: page.centroid_lng };
  page.nearby_neighborhoods = allPages
    .filter((candidate) =>
      candidate.canonical_neighborhood_path !== page.canonical_neighborhood_path &&
      candidate.city === page.city &&
      candidate.state_abbr === page.state_abbr &&
      !candidate.noindex
    )
    .map((candidate) => ({
      name: candidate.name,
      city: candidate.city,
      state_abbr: candidate.state_abbr,
      url: candidate.canonical_neighborhood_path,
      distance: distanceKm(center, { lat: candidate.centroid_lat, lng: candidate.centroid_lng }),
    }))
    .sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name))
    .slice(0, 5)
    .map(({ distance, ...nearby }) => nearby);
}

module.exports = allPages.sort((a, b) =>
  `${a.state_abbr} ${a.city} ${a.name}`.localeCompare(`${b.state_abbr} ${b.city} ${b.name}`)
);
