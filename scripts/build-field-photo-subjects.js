const fs = require("fs");
const path = require("path");

const cities = require("../_data/cities.js")();
const neighborhoodPages = require("../_data/neighborhoodPages.js");
const buildingPages = require("../_data/buildingPages.js");

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

function citySubjectId(city) {
  return clean(city.city_state_slug) || `${slugify(city.city)}-${String(city.state_abbr || "").toLowerCase()}`;
}

function districtSubjectId(district) {
  return clean(district.commercial_area_id) ||
    `${String(district.state_abbr || "").toLowerCase()}-${slugify(district.city)}-${slugify(district.slug || district.name)}`;
}

function buildingSubjectId(building) {
  const intelligence = building.commercial_building_intelligence || {};
  return clean(building.semantic_source_building_id) ||
    clean(intelligence.id) ||
    `${String(building.state_abbr || "").toLowerCase()}-${clean(building.city_slug) || slugify(building.city)}-${clean(building.building_slug) || slugify(building.address || building.name)}`;
}

function marketIdFor(item) {
  return clean(item.city_state_slug) ||
    `${slugify(item.city)}-${String(item.state_abbr || "").toLowerCase()}`;
}

function normalizeCity(city) {
  return {
    id: citySubjectId(city),
    subjectType: "city",
    name: clean(city.city),
    searchLabel: `${clean(city.city)}\nCity · ${clean(city.state_abbr)}`,
    city: clean(city.city),
    state: clean(city.state_abbr),
    marketId: citySubjectId(city),
    publicPath: clean(city.path) || `/commercial-real-estate/${city.state_abbr}/${city.slug}/`,
    context: clean(city.county || city.county_name),
  };
}

function normalizeDistrict(district) {
  return {
    id: districtSubjectId(district),
    subjectType: "district",
    name: clean(district.name),
    searchLabel: `${clean(district.name)}\nDistrict · ${clean(district.city)}, ${clean(district.state_abbr)}`,
    city: clean(district.city),
    state: clean(district.state_abbr),
    marketId: marketIdFor(district),
    publicPath: clean(district.canonical_neighborhood_path),
    context: [clean(district.commercial_area_type_label), clean(district.city), clean(district.state_abbr)]
      .filter(Boolean)
      .join(" · "),
  };
}

function normalizeBuilding(building) {
  const area = building.commercial_area || {};
  const name = clean(building.display_name || building.name || building.address);
  const districtName = clean(area.name || building.commercial_area_name || building.commercial_area);
  return {
    id: buildingSubjectId(building),
    subjectType: "building",
    name,
    searchLabel: `${name}\nBuilding · ${[districtName, clean(building.city), clean(building.state_abbr)].filter(Boolean).join(" · ")}`,
    city: clean(building.city),
    state: clean(building.state_abbr),
    marketId: marketIdFor(building),
    publicPath: clean(building.building_path),
    context: [districtName, clean(building.city), clean(building.state_abbr)].filter(Boolean).join(" · "),
    districtId: clean(area.id),
    districtName,
    address: clean(building.address),
  };
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item.id || seen.has(`${item.subjectType}:${item.id}`)) return false;
    seen.add(`${item.subjectType}:${item.id}`);
    return true;
  });
}

const subjects = uniqueById([
  ...cities.map(normalizeCity),
  ...neighborhoodPages.filter((district) => !district.noindex).map(normalizeDistrict),
  ...buildingPages.map(normalizeBuilding),
]).sort((a, b) =>
  a.subjectType.localeCompare(b.subjectType) ||
  a.state.localeCompare(b.state) ||
  a.city.localeCompare(b.city) ||
  a.name.localeCompare(b.name) ||
  a.id.localeCompare(b.id)
);

const output = {
  schemaVersion: 1,
  generatedAt: "build-time",
  subjects,
};

const outputPath = path.join(process.cwd(), "data", "generated", "field-photo-subjects.json");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);

console.log(`Generated ${subjects.length} Field Photo subjects at ${outputPath}`);
