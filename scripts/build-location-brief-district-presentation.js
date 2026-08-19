const fs = require("node:fs");
const path = require("node:path");
const neighborhoodPages = require("../_data/neighborhoodPages");
const representativeBuildings = require("../_data/recommendationRepresentativeBuildings");

const output = {};
for (const neighborhood of neighborhoodPages) {
  const slug = neighborhood.slug;
  const buildingGroup = representativeBuildings.byDistrictSlug[slug];
  const media = neighborhood.curated_district_media?.primary || null;
  if (!buildingGroup && !media) continue;
  output[slug] = {
    districtId: slug,
    districtName: neighborhood.name,
    districtPath: neighborhood.canonical_neighborhood_path || buildingGroup?.districtPath || "",
    image: media ? { src: media.src, alt: media.alt, label: media.label } : null,
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
