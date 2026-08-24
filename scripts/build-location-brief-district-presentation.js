const fs = require("node:fs");
const path = require("node:path");
const neighborhoodPages = require("../_data/neighborhoodPages");
const sfRepresentativeContent = require("../_data/sfRepresentativeContent");
const representativeBuildings = require("../_data/recommendationRepresentativeBuildings");
const editorialDistrictMaps = require("../_data/editorialDistrictMaps");

const output = {};
for (const neighborhood of neighborhoodPages) {
  const slug = neighborhood.slug;
  const buildingGroup = representativeBuildings.byDistrictSlug[slug];
  const isSanFrancisco = neighborhood.city === "San Francisco" && neighborhood.state_abbr === "CA";
  const representativeContent = isSanFrancisco
    ? sfRepresentativeContent.byDistrictId[slug] || []
    : (buildingGroup?.buildings || []).slice(0, representativeBuildings.maxBuildingsPerDistrict).map((item) => ({
        id: `building:${item.buildingId}`,
        kind: "named_building",
        name: item.name,
        address: item.address,
        canonicalUrl: item.canonicalUrl,
        image: item.image || "",
        fieldPhotoSubjectId: item.fieldPhotoSubjectId || "",
        representativeReason: item.representativeReason,
        descriptor: item.bestFitSummary,
        caveat: item.primaryTradeoff,
        relevantSpaceTypes: [],
        provenance: ["_data/recommendationRepresentativeBuildings.js"],
      }));
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
  if (!representativeContent.length && !image) continue;
  output[slug] = {
    districtId: slug,
    districtName: neighborhood.name,
    districtPath: neighborhood.canonical_neighborhood_path || "",
    image,
    representativeBuildings: representativeContent.slice(0, 3).map((item) => {
      const projected = {
        name: item.name,
        address: item.address,
        canonicalUrl: item.canonicalUrl,
        image: item.image || "",
        fieldPhotoSubjectId: item.fieldPhotoSubjectId || "",
        representativeReason: item.representativeReason,
        bestFitSummary: item.descriptor,
        primaryTradeoff: item.caveat,
      };
      return isSanFrancisco ? {
        id: item.id,
        kind: item.kind,
        ...projected,
        relevantSpaceTypes: item.relevantSpaceTypes,
        provenance: item.provenance,
      } : projected;
    }),
  };
}

const target = path.join(__dirname, "..", "data", "generated", "location-brief-district-presentation.json");
fs.writeFileSync(target, `${JSON.stringify({ schemaVersion: 2, source: "canonical-neighborhood-media+sf-representative-content", availabilityDisclaimer: sfRepresentativeContent.availabilityDisclaimer, districts: output }, null, 2)}\n`);
console.log(`Generated Location Brief district presentation for ${Object.keys(output).length} districts at ${target}`);
