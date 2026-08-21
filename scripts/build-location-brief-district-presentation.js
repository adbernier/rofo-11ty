const fs = require("node:fs");
const path = require("node:path");
const neighborhoodPages = require("../_data/neighborhoodPages");
const representativeBuildings = require("../_data/recommendationRepresentativeBuildings");
const editorialDistrictMaps = require("../_data/editorialDistrictMaps");

const output = {};
for (const neighborhood of neighborhoodPages) {
  const slug = neighborhood.slug;
  const buildingGroup = representativeBuildings.byDistrictSlug[slug];
  const media = neighborhood.curated_district_media?.primary || null;
  const routeHero = neighborhood.neighborhood_image_path
    ? { src: neighborhood.neighborhood_image_path, alt: `${neighborhood.name} commercial district`, label: `${neighborhood.name} district`, sourceType: "canonical_route_hero", approved: true }
    : null;
  const editorialMap = editorialDistrictMaps.byDistrictPath[neighborhood.canonical_neighborhood_path] || null;
  const mapFallback = editorialMap?.baseImage
    ? { src: editorialMap.baseImage, alt: editorialMap.imageAlt, label: `${neighborhood.name} district map`, sourceType: "approved_editorial_map", approved: true }
    : null;
  const image = media
    ? { src: media.src, alt: media.alt, label: media.label, sourceType: "approved_curated_district_media", approved: true }
    : routeHero || mapFallback;
  if (!buildingGroup && !image) continue;
  output[slug] = {
    districtId: slug,
    districtName: neighborhood.name,
    districtPath: neighborhood.canonical_neighborhood_path || buildingGroup?.districtPath || "",
    image,
    representativeBuildings: (buildingGroup?.buildings || []).slice(0, representativeBuildings.maxBuildingsPerDistrict).map((building) => ({
      name: building.name,
      address: building.address,
      canonicalUrl: building.canonicalUrl,
      image: building.image || "",
      fieldPhotoSubjectId: building.fieldPhotoSubjectId || "",
      representativeReason: building.representativeReason,
      bestFitSummary: building.bestFitSummary,
      primaryTradeoff: building.primaryTradeoff,
    })),
  };
}

const target = path.join(__dirname, "..", "data", "generated", "location-brief-district-presentation.json");
fs.writeFileSync(target, `${JSON.stringify({ schemaVersion: 1, source: "canonical-neighborhood-media+recommendation-representative-buildings", districts: output }, null, 2)}\n`);
console.log(`Generated Location Brief district presentation for ${Object.keys(output).length} districts at ${target}`);
