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
const nycCandidatesPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "research",
  "nyc_neighborhood_rollout_candidates.json"
);
const priorityMarketAreasPath = path.join(
  process.cwd(),
  "data",
  "peter",
  "research",
  "priority_market_commercial_area_entities_v1.json"
);

const pages = JSON.parse(fs.readFileSync(pageDataPath, "utf8"));
const allowlist = JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
const commercialAreas = JSON.parse(fs.readFileSync(commercialAreasPath, "utf8"));
const commercialRelationships = JSON.parse(fs.readFileSync(commercialRelationshipsPath, "utf8"));
const nycCandidates = fs.existsSync(nycCandidatesPath)
  ? JSON.parse(fs.readFileSync(nycCandidatesPath, "utf8"))
  : [];
const priorityMarketAreas = fs.existsSync(priorityMarketAreasPath)
  ? JSON.parse(fs.readFileSync(priorityMarketAreasPath, "utf8"))
  : [];
const buildingPages = require("./buildingPages.js");
const neighborhoodMapHeroes = require("./neighborhoodMapHeroes.js");
const neighborhoodIntelligence = require("./neighborhoodIntelligence.js");
const buildingByPath = new Map(buildingPages.map((building) => [building.building_path, building]));
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

function mapHeroKey(page) {
  return [
    clean(page.state_abbr).toUpperCase(),
    slugify(page.city),
    page.slug || slugify(page.name),
  ].join("/");
}

function pageKey(page) {
  return [
    clean(page.state_abbr).toUpperCase(),
    slugify(page.city),
    page.slug || slugify(page.name),
  ].join("/");
}

const curatedNearbyByKey = {
  "NY/new-york/financial-district": ["tribeca", "soho", "civic-center", "dumbo", "downtown-brooklyn"],
  "NY/new-york/tribeca": ["soho", "financial-district", "civic-center", "west-village", "dumbo"],
  "NY/new-york/soho": ["noho", "tribeca", "west-village", "greenwich-village", "union-square"],
  "NY/new-york/noho": ["soho", "greenwich-village", "east-village", "union-square", "flatiron-district"],
  "NY/new-york/greenwich-village": ["west-village", "noho", "soho", "union-square", "east-village"],
  "NY/new-york/west-village": ["greenwich-village", "soho", "tribeca", "meatpacking-district", "chelsea"],
  "NY/new-york/east-village": ["lower-east-side", "noho", "greenwich-village", "union-square", "gramercy"],
  "NY/new-york/lower-east-side": ["east-village", "chinatown", "soho", "noho", "financial-district"],
  "NY/new-york/chinatown": ["lower-east-side", "civic-center", "soho", "tribeca", "financial-district"],
  "NY/new-york/civic-center": ["financial-district", "tribeca", "chinatown", "soho", "lower-east-side"],
  "NY/new-york/union-square": ["flatiron-district", "gramercy", "greenwich-village", "noho", "soho"],
  "NY/new-york/flatiron-district": ["nomad", "union-square", "chelsea", "gramercy", "midtown-south"],
  "NY/new-york/nomad": ["flatiron-district", "midtown-south", "chelsea", "garment-district", "midtown"],
  "NY/new-york/gramercy": ["union-square", "flatiron-district", "kips-bay", "east-village", "nomad"],
  "NY/new-york/kips-bay": ["gramercy", "murray-hill", "east-midtown", "union-square", "flatiron-district"],
  "NY/new-york/murray-hill": ["kips-bay", "east-midtown", "midtown", "grand-central", "gramercy"],
  "NY/new-york/midtown-south": ["nomad", "flatiron-district", "garment-district", "midtown", "chelsea"],
  "NY/new-york/chelsea": ["hudson-yards", "flatiron-district", "nomad", "meatpacking-district", "west-village"],
  "NY/new-york/meatpacking-district": ["chelsea", "west-village", "greenwich-village", "hudson-yards", "flatiron-district"],
  "NY/new-york/garment-district": ["midtown", "hudson-yards", "penn-district", "times-square", "nomad"],
  "NY/new-york/hudson-yards": ["garment-district", "chelsea", "penn-district", "midtown", "hells-kitchen"],
  "NY/new-york/penn-district": ["garment-district", "hudson-yards", "chelsea", "midtown", "times-square"],
  "NY/new-york/times-square": ["midtown", "garment-district", "hells-kitchen", "penn-district", "plaza-district"],
  "NY/new-york/midtown": ["garment-district", "times-square", "east-midtown", "plaza-district", "nomad"],
  "NY/new-york/east-midtown": ["midtown", "murray-hill", "plaza-district", "kips-bay", "upper-east-side"],
  "NY/new-york/plaza-district": ["midtown", "east-midtown", "upper-east-side", "times-square", "hells-kitchen"],
  "NY/new-york/hells-kitchen": ["times-square", "midtown", "hudson-yards", "garment-district", "upper-west-side"],
  "NY/new-york/upper-east-side": ["plaza-district", "east-midtown", "east-harlem", "midtown", "upper-west-side"],
  "NY/new-york/upper-west-side": ["hells-kitchen", "midtown", "harlem", "upper-east-side", "washington-heights"],
  "NY/new-york/harlem": ["east-harlem", "upper-west-side", "upper-east-side", "washington-heights"],
  "NY/new-york/east-harlem": ["harlem", "upper-east-side", "upper-west-side", "plaza-district"],
  "NY/new-york/washington-heights": ["harlem", "upper-west-side", "east-harlem"],
  "NY/new-york/dumbo": ["downtown-brooklyn", "brooklyn-heights", "vinegar-hill", "brooklyn-navy-yard", "financial-district"],
  "NY/new-york/downtown-brooklyn": ["dumbo", "brooklyn-heights", "fort-greene", "boerum-hill", "brooklyn-commons"],
  "NY/new-york/brooklyn-heights": ["dumbo", "downtown-brooklyn", "cobble-hill", "boerum-hill", "carroll-gardens"],
  "NY/new-york/vinegar-hill": ["dumbo", "brooklyn-navy-yard", "downtown-brooklyn", "fort-greene", "williamsburg"],
  "NY/new-york/brooklyn-navy-yard": ["dumbo", "vinegar-hill", "fort-greene", "williamsburg", "clinton-hill"],
  "NY/new-york/fort-greene": ["downtown-brooklyn", "brooklyn-navy-yard", "clinton-hill", "boerum-hill", "prospect-heights"],
  "NY/new-york/clinton-hill": ["fort-greene", "brooklyn-navy-yard", "bedford-stuyvesant", "prospect-heights", "williamsburg"],
  "NY/new-york/boerum-hill": ["downtown-brooklyn", "brooklyn-heights", "cobble-hill", "gowanus", "fort-greene"],
  "NY/new-york/cobble-hill": ["boerum-hill", "brooklyn-heights", "carroll-gardens", "gowanus", "downtown-brooklyn"],
  "NY/new-york/carroll-gardens": ["cobble-hill", "gowanus", "boerum-hill", "red-hook", "park-slope"],
  "NY/new-york/gowanus": ["boerum-hill", "carroll-gardens", "park-slope", "red-hook", "downtown-brooklyn"],
  "NY/new-york/park-slope": ["gowanus", "prospect-heights", "crown-heights", "greenwood", "carroll-gardens"],
  "NY/new-york/prospect-heights": ["park-slope", "fort-greene", "clinton-hill", "crown-heights", "atlantic-avenue"],
  "NY/new-york/atlantic-avenue": ["downtown-brooklyn", "boerum-hill", "fort-greene", "prospect-heights", "crown-heights"],
  "NY/new-york/crown-heights": ["prospect-heights", "bedford-stuyvesant", "flatbush", "park-slope", "atlantic-avenue"],
  "NY/new-york/bedford-stuyvesant": ["crown-heights", "clinton-hill", "bushwick", "east-williamsburg", "prospect-heights"],
  "NY/new-york/flatbush": ["crown-heights", "prospect-heights", "park-slope", "bedford-stuyvesant"],
  "NY/new-york/williamsburg": ["greenpoint", "east-williamsburg", "south-williamsburg", "brooklyn-navy-yard", "dumbo"],
  "NY/new-york/south-williamsburg": ["williamsburg", "east-williamsburg", "dumbo", "brooklyn-navy-yard", "bushwick"],
  "NY/new-york/east-williamsburg": ["williamsburg", "south-williamsburg", "bushwick", "greenpoint", "bedford-stuyvesant"],
  "NY/new-york/greenpoint": ["williamsburg", "east-williamsburg", "brooklyn-navy-yard", "dumbo"],
  "NY/new-york/bushwick": ["east-williamsburg", "bedford-stuyvesant", "williamsburg", "crown-heights"],
  "NY/new-york/red-hook": ["gowanus", "carroll-gardens", "cobble-hill", "sunset-park", "downtown-brooklyn"],
  "NY/new-york/greenwood": ["industry-city", "sunset-park", "park-slope", "gowanus", "red-hook"],
  "NY/new-york/industry-city": ["sunset-park", "greenwood", "red-hook", "gowanus", "park-slope"],
  "NY/new-york/sunset-park": ["industry-city", "greenwood", "red-hook", "gowanus", "park-slope"],
  "NY/new-york/brooklyn-commons": ["downtown-brooklyn", "fort-greene", "boerum-hill", "brooklyn-heights", "dumbo"],
  "IL/chicago/the-loop": ["west-loop", "river-north", "streeterville", "south-loop", "fulton-river-district"],
  "IL/chicago/west-loop": ["fulton-market", "fulton-river-district", "river-west", "river-north", "the-loop"],
  "IL/chicago/fulton-market": ["west-loop", "fulton-river-district", "river-west", "river-north", "goose-island"],
  "IL/chicago/river-north": ["fulton-river-district", "magnificent-mile", "streeterville", "river-west", "west-loop"],
  "IL/chicago/streeterville": ["magnificent-mile", "river-north", "the-loop", "fulton-river-district", "lakeview"],
  "IL/chicago/south-loop": ["prairie-district", "chinatown", "the-loop", "pilsen", "west-loop"],
  "IL/chicago/magnificent-mile": ["streeterville", "river-north", "the-loop", "fulton-river-district", "old-town"],
  "IL/chicago/clybourn-corridor": ["lincoln-park", "goose-island", "old-town", "wicker-park", "river-west"],
  "IL/chicago/goose-island": ["old-town", "clybourn-corridor", "river-west", "lincoln-park", "fulton-river-district"],
  "IL/chicago/river-west": ["fulton-river-district", "fulton-market", "river-north", "west-loop", "goose-island"],
  "IL/chicago/o-hare": [],
  "IL/chicago/hyde-park": ["bridgeport", "prairie-district", "chinatown", "south-loop", "pilsen"],
  "IL/chicago/illinois-medical-district": ["pilsen", "fulton-market", "west-loop", "fulton-river-district", "river-west"],
  "IL/chicago/pilsen": ["chinatown", "bridgeport", "illinois-medical-district", "south-loop", "prairie-district"],
  "IL/chicago/fulton-river-district": ["river-west", "fulton-market", "river-north", "west-loop", "the-loop"],
  "IL/chicago/lincoln-park": ["clybourn-corridor", "old-town", "goose-island", "wicker-park", "river-west"],
  "IL/chicago/uptown": ["andersonville", "edgewater", "rogers-park", "lincoln-park", "clybourn-corridor"],
  "IL/chicago/chinatown": ["prairie-district", "south-loop", "pilsen", "bridgeport", "the-loop"],
  "IL/chicago/logan-square": ["wicker-park", "clybourn-corridor", "lincoln-park", "goose-island", "old-town"],
  "IL/chicago/prairie-district": ["south-loop", "chinatown", "the-loop", "pilsen", "bridgeport"],
  "IL/chicago/wicker-park": ["logan-square", "clybourn-corridor", "goose-island", "lincoln-park", "river-west"],
  "IL/chicago/andersonville": ["edgewater", "uptown", "rogers-park", "lincoln-park", "clybourn-corridor"],
  "IL/chicago/bridgeport": ["pilsen", "chinatown", "prairie-district", "south-loop", "illinois-medical-district"],
  "IL/chicago/old-town": ["goose-island", "lincoln-park", "clybourn-corridor", "magnificent-mile", "river-west"],
  "IL/chicago/edgewater": ["andersonville", "uptown", "rogers-park", "lincoln-park", "clybourn-corridor"],
  "IL/chicago/rogers-park": ["edgewater", "andersonville", "uptown", "lincoln-park", "logan-square"],
  "CA/los-angeles/downtown-los-angeles": ["fashion-district", "south-park", "little-tokyo", "chinatown", "arts-district"],
  "CA/los-angeles/arts-district": ["little-tokyo", "fashion-district", "downtown-los-angeles", "chinatown", "boyle-heights"],
  "CA/los-angeles/century-city": ["westwood", "sawtelle", "brentwood", "miracle-mile", "playa-vista"],
  "CA/los-angeles/fashion-district": ["south-park", "downtown-los-angeles", "arts-district", "little-tokyo", "chinatown"],
  "CA/los-angeles/hollywood": ["cahuenga-pass", "miracle-mile", "koreatown", "downtown-los-angeles", "south-park"],
  "CA/los-angeles/south-park": ["fashion-district", "downtown-los-angeles", "little-tokyo", "arts-district", "chinatown"],
  "CA/los-angeles/westwood": ["century-city", "sawtelle", "brentwood", "miracle-mile", "venice"],
  "CA/los-angeles/koreatown": ["miracle-mile", "hollywood", "south-park", "downtown-los-angeles", "fashion-district"],
  "CA/los-angeles/westchester": ["playa-vista", "venice", "sawtelle", "century-city", "miracle-mile"],
  "CA/los-angeles/playa-vista": ["westchester", "venice", "sawtelle", "century-city", "brentwood"],
  "CA/los-angeles/miracle-mile": ["hollywood", "koreatown", "century-city", "cahuenga-pass", "westwood"],
  "CA/los-angeles/sawtelle": ["westwood", "century-city", "brentwood", "venice", "playa-vista"],
  "CA/los-angeles/little-tokyo": ["arts-district", "downtown-los-angeles", "chinatown", "fashion-district", "south-park"],
  "CA/los-angeles/brentwood": ["westwood", "sawtelle", "century-city", "venice", "playa-vista"],
  "CA/los-angeles/chinatown": ["little-tokyo", "downtown-los-angeles", "arts-district", "fashion-district", "lincoln-heights"],
  "CA/los-angeles/venice": ["playa-vista", "sawtelle", "westchester", "brentwood", "westwood"],
  "CA/los-angeles/highland-park": ["lincoln-heights", "chinatown", "little-tokyo", "boyle-heights", "arts-district"],
  "CA/los-angeles/cahuenga-pass": ["hollywood", "miracle-mile", "koreatown", "century-city", "westwood"],
  "CA/los-angeles/lincoln-heights": ["chinatown", "little-tokyo", "arts-district", "boyle-heights", "highland-park"],
  "CA/los-angeles/boyle-heights": ["arts-district", "little-tokyo", "fashion-district", "chinatown", "lincoln-heights"],
  "FL/miami/brickell": ["downtown-miami", "little-havana", "overtown", "edgewater", "wynwood"],
  "FL/miami/downtown-miami": ["brickell", "overtown", "edgewater", "wynwood", "little-havana"],
  "FL/miami/wynwood": ["edgewater", "design-district", "overtown", "allapattah", "little-haiti"],
  "FL/miami/design-district": ["wynwood", "little-haiti", "edgewater", "allapattah", "overtown"],
  "FL/miami/coconut-grove": ["coral-way", "brickell", "dadeland", "little-havana", "downtown-miami"],
  "FL/miami/edgewater": ["wynwood", "design-district", "overtown", "downtown-miami", "little-haiti"],
  "FL/miami/little-havana": ["brickell", "coral-way", "overtown", "downtown-miami", "coconut-grove"],
  "FL/miami/allapattah": ["wynwood", "design-district", "overtown", "edgewater", "little-haiti"],
  "FL/miami/little-haiti": ["design-district", "edgewater", "wynwood", "allapattah", "overtown"],
  "FL/miami/blue-lagoon": ["coral-way", "little-havana", "allapattah", "coconut-grove", "overtown"],
  "FL/miami/overtown": ["downtown-miami", "wynwood", "edgewater", "brickell", "design-district"],
  "FL/miami/coral-way": ["coconut-grove", "little-havana", "brickell", "blue-lagoon", "overtown"],
  "FL/miami/dadeland": ["coconut-grove", "coral-way", "blue-lagoon", "little-havana", "brickell"],
  "TX/dallas/uptown": ["arts-district", "victory-park", "turtle-creek", "west-end-historic-district", "downtown-dallas"],
  "TX/dallas/downtown-dallas": ["main-street-district", "arts-district", "west-end-historic-district", "cedars", "deep-ellum"],
  "TX/dallas/main-street-district": ["downtown-dallas", "west-end-historic-district", "arts-district", "cedars", "deep-ellum"],
  "TX/dallas/victory-park": ["west-end-historic-district", "uptown", "arts-district", "design-district", "downtown-dallas"],
  "TX/dallas/arts-district": ["downtown-dallas", "main-street-district", "uptown", "west-end-historic-district", "victory-park"],
  "TX/dallas/deep-ellum": ["downtown-dallas", "main-street-district", "arts-district", "cedars", "west-end-historic-district"],
  "TX/dallas/west-end-historic-district": ["main-street-district", "downtown-dallas", "victory-park", "arts-district", "uptown"],
  "TX/dallas/design-district": ["medical-district", "stemmons-corridor", "victory-park", "uptown", "turtle-creek"],
  "TX/dallas/cedars": ["main-street-district", "downtown-dallas", "deep-ellum", "west-end-historic-district", "arts-district"],
  "TX/dallas/medical-district": ["design-district", "stemmons-corridor", "turtle-creek", "victory-park", "uptown"],
  "TX/dallas/stemmons-corridor": ["medical-district", "design-district", "turtle-creek", "victory-park", "uptown"],
  "TX/dallas/preston-center": ["north-dallas", "turtle-creek", "medical-district", "stemmons-corridor", "uptown"],
  "TX/dallas/turtle-creek": ["uptown", "victory-park", "preston-center", "arts-district", "design-district"],
  "TX/dallas/north-dallas": ["far-north-dallas", "preston-center", "turtle-creek", "medical-district", "stemmons-corridor"],
  "TX/dallas/far-north-dallas": ["north-dallas", "preston-center", "stemmons-corridor", "medical-district", "turtle-creek"],
  "TX/dallas/bishop-arts-district": ["cedars", "west-end-historic-district", "main-street-district", "downtown-dallas", "victory-park"],
  "WA/seattle/downtown-seattle": ["pioneer-square", "waterfront", "denny-triangle", "belltown", "south-lake-union"],
  "WA/seattle/south-lake-union": ["denny-triangle", "capitol-hill", "belltown", "waterfront", "downtown-seattle"],
  "WA/seattle/denny-triangle": ["belltown", "south-lake-union", "waterfront", "downtown-seattle", "capitol-hill"],
  "WA/seattle/pioneer-square": ["downtown-seattle", "waterfront", "sodo", "belltown", "denny-triangle"],
  "WA/seattle/belltown": ["denny-triangle", "waterfront", "south-lake-union", "downtown-seattle", "pioneer-square"],
  "WA/seattle/ballard": ["fremont", "university-district", "northgate", "south-lake-union", "capitol-hill"],
  "WA/seattle/capitol-hill": ["south-lake-union", "denny-triangle", "belltown", "downtown-seattle", "university-district"],
  "WA/seattle/fremont": ["university-district", "south-lake-union", "ballard", "capitol-hill", "denny-triangle"],
  "WA/seattle/university-district": ["fremont", "capitol-hill", "south-lake-union", "northgate", "denny-triangle"],
  "WA/seattle/northgate": ["university-district", "ballard", "fremont", "capitol-hill", "south-lake-union"],
  "WA/seattle/waterfront": ["downtown-seattle", "belltown", "pioneer-square", "denny-triangle", "south-lake-union"],
  "WA/seattle/sodo": ["pioneer-square", "downtown-seattle", "waterfront", "belltown", "denny-triangle"],
  "MA/boston/back-bay": ["theater-district", "south-end", "fenway-kenmore", "financial-district", "downtown-boston"],
  "MA/boston/financial-district": ["downtown-boston", "government-center", "leather-district", "seaport-district", "theater-district"],
  "MA/boston/downtown-boston": ["financial-district", "government-center", "leather-district", "theater-district", "north-station-west-end"],
  "MA/boston/seaport-district": ["financial-district", "leather-district", "downtown-boston", "government-center", "theater-district"],
  "MA/boston/government-center": ["downtown-boston", "financial-district", "north-station-west-end", "theater-district", "leather-district"],
  "MA/boston/leather-district": ["downtown-boston", "financial-district", "theater-district", "seaport-district", "south-end"],
  "MA/boston/north-station-west-end": ["government-center", "downtown-boston", "financial-district", "theater-district", "leather-district"],
  "MA/boston/theater-district": ["leather-district", "downtown-boston", "financial-district", "back-bay", "south-end"],
  "MA/boston/longwood-medical-area": ["fenway-kenmore", "back-bay", "south-end", "theater-district", "downtown-boston"],
  "MA/boston/south-end": ["theater-district", "back-bay", "leather-district", "downtown-boston", "financial-district"],
  "MA/boston/fenway-kenmore": ["longwood-medical-area", "back-bay", "south-end", "theater-district", "downtown-boston"],
  "DC/washington/golden-triangle": ["dupont-circle", "downtown-dc", "penn-quarter", "mount-vernon-triangle", "georgetown"],
  "DC/washington/downtown-dc": ["golden-triangle", "penn-quarter", "mount-vernon-triangle", "dupont-circle", "capitol-hill"],
  "DC/washington/capitol-riverfront": ["capitol-hill", "southwest-waterfront", "penn-quarter", "h-street-ne", "mount-vernon-triangle"],
  "DC/washington/penn-quarter": ["downtown-dc", "mount-vernon-triangle", "capitol-hill", "golden-triangle", "southwest-waterfront"],
  "DC/washington/mount-vernon-triangle": ["penn-quarter", "downtown-dc", "noma", "capitol-hill", "golden-triangle"],
  "DC/washington/noma": ["h-street-ne", "mount-vernon-triangle", "capitol-hill", "penn-quarter", "downtown-dc"],
  "DC/washington/dupont-circle": ["golden-triangle", "downtown-dc", "georgetown", "penn-quarter", "mount-vernon-triangle"],
  "DC/washington/capitol-hill": ["penn-quarter", "mount-vernon-triangle", "capitol-riverfront", "southwest-waterfront", "noma"],
  "DC/washington/h-street-ne": ["noma", "capitol-hill", "mount-vernon-triangle", "penn-quarter", "capitol-riverfront"],
  "DC/washington/georgetown": ["dupont-circle", "golden-triangle", "downtown-dc", "penn-quarter", "mount-vernon-triangle"],
  "DC/washington/southwest-waterfront": ["capitol-riverfront", "capitol-hill", "penn-quarter", "downtown-dc", "mount-vernon-triangle"],
  "GA/atlanta/buckhead": ["midtown", "west-midtown", "perimeter-center", "cumberland-galleria", "old-fourth-ward"],
  "GA/atlanta/midtown": ["old-fourth-ward", "west-midtown", "downtown-atlanta", "inman-park", "buckhead"],
  "GA/atlanta/downtown-atlanta": ["south-downtown", "old-fourth-ward", "inman-park", "midtown", "west-midtown"],
  "GA/atlanta/perimeter-center": ["buckhead", "cumberland-galleria", "midtown"],
  "GA/atlanta/cumberland-galleria": ["buckhead", "west-midtown", "perimeter-center"],
  "GA/atlanta/west-midtown": ["midtown", "downtown-atlanta", "old-fourth-ward", "south-downtown", "buckhead"],
  "GA/atlanta/old-fourth-ward": ["inman-park", "midtown", "downtown-atlanta", "south-downtown", "west-midtown"],
  "GA/atlanta/fulton-industrial": ["west-midtown", "south-downtown", "downtown-atlanta", "hartsfield-jackson-airport-area"],
  "GA/atlanta/hartsfield-jackson-airport-area": ["south-downtown", "downtown-atlanta", "fulton-industrial"],
  "GA/atlanta/south-downtown": ["downtown-atlanta", "old-fourth-ward", "inman-park", "midtown", "west-midtown"],
  "GA/atlanta/inman-park": ["old-fourth-ward", "downtown-atlanta", "midtown", "south-downtown", "west-midtown"],
  "CA/san-diego/downtown-san-diego": ["east-village", "little-italy", "bankers-hill", "barrio-logan", "liberty-station"],
  "CA/san-diego/east-village": ["downtown-san-diego", "barrio-logan", "little-italy", "bankers-hill", "liberty-station"],
  "CA/san-diego/little-italy": ["bankers-hill", "downtown-san-diego", "east-village", "liberty-station", "barrio-logan"],
  "CA/san-diego/mission-valley": ["bankers-hill", "kearny-mesa", "downtown-san-diego", "little-italy", "east-village"],
  "CA/san-diego/bankers-hill": ["little-italy", "downtown-san-diego", "east-village", "mission-valley", "barrio-logan"],
  "CA/san-diego/kearny-mesa": ["mission-valley", "university-city", "sorrento-valley", "bankers-hill"],
  "CA/san-diego/sorrento-valley": ["university-city", "kearny-mesa", "mission-valley", "rancho-bernardo"],
  "CA/san-diego/university-city": ["sorrento-valley", "kearny-mesa", "mission-valley", "liberty-station"],
  "CA/san-diego/rancho-bernardo": ["sorrento-valley", "university-city", "kearny-mesa"],
  "CA/san-diego/otay-mesa": ["barrio-logan", "east-village", "downtown-san-diego"],
  "CA/san-diego/barrio-logan": ["east-village", "downtown-san-diego", "little-italy", "bankers-hill", "liberty-station"],
  "CA/san-diego/liberty-station": ["little-italy", "bankers-hill", "downtown-san-diego", "east-village", "mission-valley"],
  "TN/nashville/downtown-nashville": ["sobro", "the-gulch", "germantown", "music-row", "midtown"],
  "TN/nashville/sobro": ["downtown-nashville", "the-gulch", "music-row", "midtown", "germantown"],
  "TN/nashville/midtown": ["music-row", "the-gulch", "west-end", "downtown-nashville", "sobro"],
  "TN/nashville/music-row": ["midtown", "the-gulch", "downtown-nashville", "sobro", "west-end"],
  "TN/nashville/west-end": ["midtown", "music-row", "the-gulch", "green-hills", "downtown-nashville"],
  "TN/nashville/green-hills": ["west-end", "midtown", "music-row", "the-gulch"],
  "TN/nashville/east-nashville": ["downtown-nashville", "sobro", "germantown", "the-gulch"],
  "TN/nashville/donelson-airport-area": ["east-nashville", "sobro", "downtown-nashville"],
  "TN/nashville/the-gulch": ["music-row", "sobro", "downtown-nashville", "midtown", "germantown"],
  "TN/nashville/germantown": ["downtown-nashville", "the-gulch", "sobro", "east-nashville", "midtown"],
  "CO/denver/central-business-district": ["lodo", "ballpark", "capitol-hill", "lower-highland", "santa-fe-arts-district"],
  "CO/denver/cherry-creek": ["capitol-hill", "baker", "santa-fe-arts-district", "central-business-district", "denver-tech-center"],
  "CO/denver/lodo": ["ballpark", "central-business-district", "lower-highland", "river-north-art-district", "globeville"],
  "CO/denver/ballpark": ["lodo", "central-business-district", "river-north-art-district", "lower-highland", "globeville"],
  "CO/denver/denver-tech-center": ["cherry-creek", "baker", "capitol-hill"],
  "CO/denver/santa-fe-arts-district": ["sun-valley", "capitol-hill", "central-business-district", "baker", "lodo"],
  "CO/denver/central-park": ["northeast-denver-industrial", "river-north-art-district", "globeville-elyria-swansea", "globeville"],
  "CO/denver/capitol-hill": ["santa-fe-arts-district", "central-business-district", "cherry-creek", "lodo", "baker"],
  "CO/denver/sun-valley": ["santa-fe-arts-district", "central-business-district", "lodo", "baker", "capitol-hill"],
  "CO/denver/northeast-denver-industrial": ["central-park", "river-north-art-district", "globeville-elyria-swansea", "globeville"],
  "CO/denver/globeville": ["globeville-elyria-swansea", "river-north-art-district", "ballpark", "lower-highland", "lodo"],
  "CO/denver/river-north-art-district": ["globeville-elyria-swansea", "globeville", "ballpark", "central-business-district", "lodo"],
  "CO/denver/globeville-elyria-swansea": ["globeville", "river-north-art-district", "ballpark", "central-park", "northeast-denver-industrial"],
  "CO/denver/lower-highland": ["lodo", "ballpark", "central-business-district", "globeville", "river-north-art-district"],
  "CO/denver/baker": ["santa-fe-arts-district", "capitol-hill", "cherry-creek", "sun-valley", "central-business-district"]
};

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

function representativeBuildingsFromPaths(paths = [], areaId = "") {
  return paths
    .map((buildingPath) => buildingByPath.get(buildingPath))
    .filter(Boolean)
    .slice(0, 6)
    .map((building) =>
      normalizeRepresentativeBuilding({
        address: building.address,
        display_name: building.address || building.display_name || building.name,
        name: building.name,
        building_path: building.building_path,
        type: building.primary_type_label || building.type || "Commercial Space",
        size_label: building.size_label || "",
        primary_area_id: areaId,
        relationship_confidence: "high",
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

function fallbackSpaceTypesFor(area) {
  const profile = area.commercial_profile || [];
  const values = [];

  for (const tag of profile) {
    if (["office", "retail", "industrial", "flex", "coworking"].includes(tag)) {
      values.push(tag);
    } else if (tag === "warehouse" || tag === "logistics") {
      values.push("industrial");
    } else if (tag === "neighborhood_retail" || tag === "showroom") {
      values.push("retail");
    } else if (
      tag === "creative_office" ||
      tag === "professional_services" ||
      tag === "boutique_office" ||
      tag === "enterprise_environment" ||
      tag === "suburban_office"
    ) {
      values.push("office");
    }
  }

  return [...new Set(values)];
}

function areaTypePriority(areaType) {
  const priorities = {
    downtown_core: 0,
    district: 1,
    submarket: 2,
    corridor: 3,
    neighborhood: 4,
    industrial_area: 5,
  };

  return priorities[areaType] ?? 9;
}

function commercialPageFor(area) {
  if (area.recommended_status && area.recommended_status !== "launch") return null;

  const summary = areaSummaryById.get(area.id);
  const relationshipBuildings = representativeBuildingsFor(area.id);
  const representative_buildings = relationshipBuildings.length
    ? relationshipBuildings
    : representativeBuildingsFromPaths(area.representative_building_paths || [], area.id);

  const canonical_neighborhood_path = areaPath(area);
  const areaTypeLabel = clean(area.area_type).replace(/_/g, " ");
  const approximate_space_types = spaceTypesFor(area.id);
  const fallback_space_types = fallbackSpaceTypesFor(area);
  const relationshipCount = summary?.relationship_count || representative_buildings.length || 0;

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
    approximate_building_count: relationshipCount,
    approximate_space_types: approximate_space_types.length ? approximate_space_types : fallback_space_types,
    approximate_semantic_signals: (area.commercial_profile || []).map(signalLabel).slice(0, 8),
    representative_buildings,
    commercial_area_id: area.id,
    commercial_area_type: area.area_type,
    commercial_area_type_label: areaTypeLabel,
    commercial_profile: area.commercial_profile || [],
    source_confidence: area.source_confidence,
    source_types: area.source_types || [],
    suppress_nearby_neighborhoods: Boolean(area.suppress_nearby_neighborhoods),
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: true,
    city_nav_priority: area.city_nav_priority != null
      ? area.city_nav_priority
      : relationshipCount > 0 ? areaTypePriority(area.area_type) : areaTypePriority(area.area_type) + 4,
  };
}

function nycPageFor(candidate) {
  if (candidate.recommended_status !== "launch") return null;

  const representative_buildings = representativeBuildingsFromPaths(
    candidate.representative_building_paths || [],
    `nyc-${candidate.slug}`
  );
  const areaTypeLabel = clean(candidate.area_type).replace(/_/g, " ");

  return {
    name: candidate.canonical_name,
    slug: candidate.slug,
    borough: candidate.borough,
    city: "New York",
    state_abbr: "NY",
    city_slug: "new-york",
    canonical_neighborhood_path: candidate.canonical_path,
    centroid_lat: "",
    centroid_lng: "",
    radius: "",
    geometry_quality: "nyc_nta_reference",
    approximate_building_count: representative_buildings.length,
    approximate_space_types: (candidate.likely_space_types || [])
      .filter((value) => ["office", "retail", "industrial", "flex", "coworking"].includes(value)),
    approximate_semantic_signals: (candidate.likely_space_types || []).map(signalLabel).slice(0, 8),
    representative_buildings,
    commercial_area_id: `nyc-${candidate.slug}`,
    commercial_area_type: candidate.area_type,
    commercial_area_type_label: areaTypeLabel,
    commercial_profile: candidate.likely_space_types || [],
    source_confidence: candidate.source_confidence,
    source_types: candidate.source_types || [],
    noindex: false,
    prototype: false,
    public_review: false,
    public_phase_1: false,
    public_phase_2: false,
    public_nyc_rollout: true,
    city_nav_priority: Math.max(0, 100 - (candidate.commercial_relevance_score || 70)),
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
    city_nav_priority: 3,
    prototype: true,
    public_review: false,
    public_phase_1: true,
  }));

const commercialPages = [...commercialAreas, ...priorityMarketAreas]
  .map(commercialPageFor)
  .filter(Boolean);

const nycPages = nycCandidates
  .map(nycPageFor)
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

for (const page of nycPages) {
  allPagesByPath.set(page.canonical_neighborhood_path, {
    ...allPagesByPath.get(page.canonical_neighborhood_path),
    ...page,
  });
}

const allPages = Array.from(allPagesByPath.values());

for (const page of allPages) {
  if (page.city_nav_priority == null) {
    page.city_nav_priority = page.representative_buildings?.length ? 3 : 7;
  }

  page.map_hero = neighborhoodMapHeroes[mapHeroKey(page)] || null;
  page.neighborhood_intelligence = neighborhoodIntelligence[page.canonical_neighborhood_path] || null;
}

const allPagesByCitySlug = new Map();

for (const page of allPages) {
  const cityKey = [clean(page.state_abbr).toUpperCase(), slugify(page.city)].join("/");
  const slug = page.slug || slugify(page.name);

  if (!allPagesByCitySlug.has(cityKey)) {
    allPagesByCitySlug.set(cityKey, new Map());
  }

  allPagesByCitySlug.get(cityKey).set(slug, page);
}

for (const page of allPages) {
  if (page.suppress_nearby_neighborhoods) {
    page.nearby_neighborhoods = [];
    continue;
  }

  const curatedSlugs = curatedNearbyByKey[pageKey(page)] || [];
  const cityKey = [clean(page.state_abbr).toUpperCase(), slugify(page.city)].join("/");
  const cityPagesBySlug = allPagesByCitySlug.get(cityKey) || new Map();
  const curatedNearby = curatedSlugs
    .map((slug) => cityPagesBySlug.get(slug))
    .filter((candidate) =>
      candidate &&
      candidate.canonical_neighborhood_path !== page.canonical_neighborhood_path &&
      !candidate.noindex
    )
    .slice(0, 5)
    .map((candidate) => ({
      name: candidate.name,
      city: candidate.city,
      state_abbr: candidate.state_abbr,
      url: candidate.canonical_neighborhood_path,
    }));

  if (curatedNearby.length) {
    page.nearby_neighborhoods = curatedNearby;
    continue;
  }

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
  `${a.state_abbr} ${a.city}`.localeCompare(`${b.state_abbr} ${b.city}`) ||
  (a.city_nav_priority || 0) - (b.city_nav_priority || 0) ||
  (b.approximate_building_count || 0) - (a.approximate_building_count || 0) ||
  a.name.localeCompare(b.name)
);
