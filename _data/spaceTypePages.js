const cities = require("./cities.generated.json");
const spaceTypes = require("./spaceTypes");
const buildings = require("./buildings.js");
const { getRoutingCandidates } = require("./leadRouting.js");
const sfPublicDiscovery = require("./sfPublicDiscovery.js");
const tempeIndustrialPublicDecision = require("./tempeIndustrialPublicDecision.js");
const antiochIndustrialPublicDecision = require("./antiochIndustrialPublicDecision.js");
const antiochRetailPublicDecision = require("./antiochRetailPublicDecision.js");
const indianapolisIndustrialPublicDecision = require("./indianapolisIndustrialPublicDecision.js");
const sacramentoIndustrialPublicDecision = require("./sacramentoIndustrialPublicDecision.js");
const sanDiegoIndustrialPublicDecision = require("./sanDiegoIndustrialPublicDecision.js");
const sanJoseIndustrialPublicDecision = require("./sanJoseIndustrialPublicDecision.js");

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countyStateSlug(county, state_abbr) {
  const countySlug = slugify(county);
  const stateSlug = String(state_abbr || "").trim().toLowerCase();

  return countySlug && stateSlug ? `${countySlug}-${stateSlug}` : "";
}

// -----------------------------
// Normalize building type set
// -----------------------------
function getBuildingTypeSet(building) {
  const typeSet = new Set();

  const classificationFields = [
    building.type,
    building.primary_space_type,
    building.category,
    building.use,
    building.property_type,
    building.listing_type,
    building.lease_category,
    ...(Array.isArray(building.space_types) ? building.space_types : []),
    ...(Array.isArray(building.raw_space_types) ? building.raw_space_types : []),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  const sourceFields = [
    building.primary_source,
    building.source,
    ...(Array.isArray(building.source_companies) ? building.source_companies : []),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  const hasClassificationMatch = (matches) =>
    classificationFields.some((value) =>
      matches.some((match) => value.includes(match))
    );

  const hasSourceMatch = (matches) =>
    sourceFields.some((value) =>
      matches.some((match) => value.includes(match))
    );

  const hasOffice =
    hasClassificationMatch([
      "office",
      "private office",
      "executive suite",
      "business center",
      "live/work",
      "live work",
    ]);

  const hasRetail =
    hasClassificationMatch(["retail", "storefront", "restaurant"]);

  const hasIndustrial =
    hasClassificationMatch([
      "industrial",
      "warehouse",
      "distribution",
      "manufacturing",
      "logistics",
      "light industrial",
    ]);

  const hasFlex =
    hasClassificationMatch([
      "flex",
      "flex-space",
      "office/warehouse",
      "office warehouse",
      "light industrial",
      "live/work",
      "live work",
    ]) ||
    (hasOffice && hasIndustrial);

  const hasCoworking =
    hasClassificationMatch([
      "coworking",
      "co-working",
      "shared office",
      "executive suite",
    ]) ||
    hasSourceMatch(["regus", "wework"]) ||
    Boolean(building.is_exec_suite_present);

  if (hasOffice) {
    typeSet.add("office-space");
  }

  if (hasRetail) {
    typeSet.add("retail-space");
  }

  if (hasIndustrial) {
    typeSet.add("industrial-space");
  }

  if (hasFlex) {
    typeSet.add("flex-space");
  }

  if (hasCoworking) {
    typeSet.add("coworking-space");
  }

  return typeSet;
}

// -----------------------------
// Build index ONCE
// -----------------------------
const buildingIndex = new Map();

buildings.forEach((building) => {
  const city = String(building.city_slug || "").toLowerCase();
  const state = String(building.state_abbr || "").toLowerCase();

  if (!city || !state) return;

  const keyBase = `${city}::${state}`;
  const typeSet = getBuildingTypeSet(building);

  typeSet.forEach((type) => {
    const key = `${keyBase}::${type}`;

    if (!buildingIndex.has(key)) {
      buildingIndex.set(key, []);
    }

    buildingIndex.get(key).push(building);
  });
});

// -----------------------------
// Generate pages only where matching inventory exists.
// -----------------------------
module.exports = cities.flatMap((city) => {
  const normalizedCitySlug = String(city.slug || "").toLowerCase();
  const normalizedStateAbbr = String(city.state_abbr || "").toLowerCase();
  const stateAbbr = String(city.state_abbr || "").toUpperCase();

  return Object.values(spaceTypes)
    .map((spaceType) => {
      const normalizedTypeSlug = String(spaceType.slug || "").toLowerCase();

      const key = `${normalizedCitySlug}::${normalizedStateAbbr}::${normalizedTypeSlug}`;
      const representativeBuildings = buildingIndex.get(key) || [];
      const cityStateSlug =
        city.city_state_slug || `${normalizedCitySlug}-${normalizedStateAbbr}`;
      const routingCounty = countyStateSlug(city.county || city.county_name, city.state_abbr);

      const localDecisionGuide =
        normalizedCitySlug === "san-francisco" && normalizedStateAbbr === "ca"
          ? normalizedTypeSlug === "office-space"
            ? sfPublicDiscovery.guides.office
            : normalizedTypeSlug === "retail-space"
            ? sfPublicDiscovery.guides.retail
            : normalizedTypeSlug === "industrial-space"
            ? sfPublicDiscovery.guides.industrial
            : normalizedTypeSlug === "flex-space"
            ? sfPublicDiscovery.guides.flex
            : null
          : normalizedCitySlug === "antioch" && normalizedStateAbbr === "ca" && normalizedTypeSlug === "industrial-space"
          ? antiochIndustrialPublicDecision
          : normalizedCitySlug === "antioch" && normalizedStateAbbr === "ca" && normalizedTypeSlug === "retail-space"
          ? antiochRetailPublicDecision
          : normalizedCitySlug === "tempe" && normalizedStateAbbr === "az" && normalizedTypeSlug === "industrial-space"
          ? tempeIndustrialPublicDecision
          : normalizedCitySlug === "indianapolis" && normalizedStateAbbr === "in" && normalizedTypeSlug === "industrial-space"
          ? indianapolisIndustrialPublicDecision
          : normalizedCitySlug === "sacramento" && normalizedStateAbbr === "ca" && normalizedTypeSlug === "industrial-space"
          ? sacramentoIndustrialPublicDecision
          : normalizedCitySlug === "san-diego" && normalizedStateAbbr === "ca" && normalizedTypeSlug === "industrial-space"
          ? sanDiegoIndustrialPublicDecision
          : normalizedCitySlug === "san-jose" && normalizedStateAbbr === "ca" && normalizedTypeSlug === "industrial-space"
          ? sanJoseIndustrialPublicDecision
          : null;

      return {
        city,
        spaceType,
        state: stateAbbr,
        state_abbr: stateAbbr,
        city_slug: normalizedCitySlug,
        page_slug: normalizedTypeSlug,
        routing_candidates: getRoutingCandidates({
          city_state_slug: cityStateSlug,
          county_state_slug: routingCounty,
          space_type_slug: normalizedTypeSlug,
        }),
        routing_market: cityStateSlug,
        routing_county: routingCounty,
        routing_space_type: normalizedTypeSlug,
        representativeBuildings: representativeBuildings.slice(0, 12),
        hasInventory: representativeBuildings.length > 0,
        localDecisionGuide,
        seoTitle: localDecisionGuide?.seoTitle || "",
        seoDescription: localDecisionGuide?.seoDescription || "",
        h1: localDecisionGuide?.h1 || "",
        heroLead: localDecisionGuide?.heroLead || "",
      };
    })
    .filter((entry) => entry.representativeBuildings.length > 0 || entry.localDecisionGuide);
});
