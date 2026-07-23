const buildingPages = require("./buildingPages");
const commercialBuildingIntelligence = require("./commercialBuildingIntelligence");

function clean(value) {
  return String(value || "").trim();
}

function slugKey(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function meaningful(value, minWords = 5) {
  return clean(value).split(/\s+/).filter(Boolean).length >= minWords;
}

function firstMeaningful(values, minWords = 5) {
  return (values || []).map(clean).find((value) => meaningful(value, minWords)) || "";
}

function briefFor(building) {
  return building && building.building_brief ? building.building_brief : null;
}

function buildingImage(building) {
  return clean(building.hero_image || building.image || building.photo || "");
}

function buildingFieldPhotoSubjectId(building, intelligence) {
  return clean(building.semantic_source_building_id) ||
    clean(intelligence && intelligence.id) ||
    [
      clean(building.state_abbr).toLowerCase(),
      clean(building.city_slug),
      clean(building.building_slug),
    ].filter(Boolean).join("-");
}

function cardFor(building, intelligence) {
  const brief = briefFor(building);
  if (!brief) return null;
  const identity = intelligence.identity || {};
  const editorial = intelligence.editorial || {};
  const canonicalDistrict = identity.canonicalDistrict || building.commercial_area || {};
  const secondaryDistricts = identity.secondaryDistricts || [];
  const representativeReason = clean(editorial.editorialReason || building.shortlist_reason || brief.buildingImportance);
  const bestFitSummary = firstMeaningful(brief.idealFor || brief.bestFit || building.best_for, 5);
  const primaryTradeoff = firstMeaningful(brief.tradeoffs || brief.mayNotFit || building.tradeoffs, 5);

  if (!brief || !building.building_path || !representativeReason || !bestFitSummary || !primaryTradeoff) return null;

  return {
    buildingId: intelligence.id || building.building_path,
    name: clean(identity.name || building.display_name || building.name || building.address),
    address: clean(identity.address || building.address),
    city: clean(identity.city || building.city),
    state: clean(identity.state_abbr || building.state_abbr),
    districtId: clean(canonicalDistrict.id || canonicalDistrict.slug || ""),
    districtSlug: slugKey(canonicalDistrict.slug || canonicalDistrict.name),
    districtName: clean(canonicalDistrict.name),
    districtPath: clean(canonicalDistrict.path),
    secondaryDistrictSlugs: secondaryDistricts.map((district) => slugKey(district.slug || district.name)).filter(Boolean),
    secondaryDistrictPaths: secondaryDistricts.map((district) => clean(district.path)).filter(Boolean),
    canonicalUrl: building.building_path,
    image: buildingImage(building),
    fieldPhotoSubjectId: buildingFieldPhotoSubjectId(building, intelligence),
    buildingType: clean(identity.buildingType || building.type || building.primary_space_type),
    representativeReason,
    bestFitSummary,
    primaryTradeoff,
    buildingBriefStatus: clean(brief.status || "published"),
  };
}

function addCard(map, slug, card) {
  if (!slug || !card) return;
  if (!map[slug]) {
    map[slug] = {
      districtSlug: slug,
      districtName: card.districtSlug === slug ? card.districtName : "",
      districtPath: card.districtSlug === slug ? card.districtPath : "",
      buildings: [],
    };
  }
  if (!map[slug].buildings.some((item) => item.canonicalUrl === card.canonicalUrl)) {
    map[slug].buildings.push(card);
  }
}

const buildingsByPath = new Map(buildingPages.map((building) => [building.building_path, building]));
const byDistrictSlug = {};
const allCards = [];

commercialBuildingIntelligence.canonicalBuildings.forEach((intelligence) => {
  const building = buildingsByPath.get(intelligence.building_path);
  const card = cardFor(building, intelligence);
  if (!card) return;

  allCards.push(card);
  addCard(byDistrictSlug, card.districtSlug, card);
  card.secondaryDistrictSlugs.forEach((slug) => addCard(byDistrictSlug, slug, card));
});

module.exports = {
  schemaVersion: 1,
  selectionRule: "Use authored Commercial Building Intelligence order, filtered to production Building Briefs, capped at three cards per recommended district.",
  minimumEligibleBuildings: 2,
  maxBuildingsPerDistrict: 3,
  byDistrictSlug,
  buildings: allCards,
};
