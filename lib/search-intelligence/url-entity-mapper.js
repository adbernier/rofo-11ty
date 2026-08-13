const cities = require("../../_data/cities.generated.json");
const businessBriefs = require("../../_data/businessBriefs");
const buildingPages = require("../../_data/buildingPages");
const locationKnowledgeGraph = require("../../_data/locationKnowledgeGraph");
const locationComparisonPages = require("../../_data/locationComparisonPages");
const { searchMarketIdentity } = require("./market-identity");

const BUSINESS_BRIEF_RECORDS = Array.isArray(businessBriefs) ? businessBriefs : businessBriefs.briefs || [];
const BUILDING_RECORDS = Array.isArray(buildingPages) ? buildingPages : buildingPages.buildings || [];
const COMPARISON_RECORDS = Array.isArray(locationComparisonPages) ? locationComparisonPages : locationComparisonPages.comparisons || [];

const PROPERTY_TYPE_BY_SLUG = {
  "office-space": "office",
  "retail-space": "retail",
  "industrial-space": "industrial",
  "warehouse-space": "warehouse",
  "flex-space": "flex",
  "coworking-space": "coworking",
  "medical-space": "medical",
};

function normalizePath(value) {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  let pathname = raw;
  try {
    pathname = new URL(raw).pathname;
  } catch (error) {
    pathname = raw.split("?")[0].split("#")[0];
  }
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  pathname = pathname.replace(/^\/commercial-real-estate\/([a-z]{2})(?=\/)/i, (match, state) => `/commercial-real-estate/${state.toUpperCase()}`);
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function cityPath(city) {
  return `/commercial-real-estate/${String(city.state_abbr || "").toUpperCase()}/${city.slug}/`;
}

const cityByPath = new Map(cities.map((city) => [cityPath(city), city]));
const cityBySlugState = new Map(cities.map((city) => [`${String(city.state_abbr || "").toUpperCase()}/${city.slug}`, city]));
const briefByPath = new Map(BUSINESS_BRIEF_RECORDS.map((brief) => [normalizePath(brief.url || brief.canonicalUrl), brief]));
const districtByPath = new Map(
  locationKnowledgeGraph
    .filter((node) => node.type === "district" && node.path)
    .map((node) => [normalizePath(node.path), node])
);
const buildingByPath = new Map(
  BUILDING_RECORDS
    .filter((building) => building.building_path)
    .map((building) => [normalizePath(building.building_path), building])
);
const comparisonByPath = new Map(
  COMPARISON_RECORDS
    .filter((comparison) => comparison.path)
    .map((comparison) => [normalizePath(comparison.path), comparison])
);

function mapRofoUrlToEntity(url) {
  const pathname = normalizePath(url);

  if (pathname === "/") {
    return {
      entityType: "homepage",
      page: pathname,
    };
  }

  const brief = briefByPath.get(pathname);
  if (brief) {
    const identity = searchMarketIdentity({
      state: brief.market && brief.market.state,
      marketId: brief.market && (brief.market.marketId || brief.market.marketSlug),
      marketName: brief.market && brief.market.marketName,
    });
    return {
      entityType: "business_brief",
      page: pathname,
      ...identity,
      marketName: brief.market && brief.market.marketName,
      state: brief.market && brief.market.state,
      propertyType: brief.propertyType,
      archetypeId: brief.archetype && brief.archetype.id,
      archetypeSlug: brief.archetype && brief.archetype.slug,
    };
  }

  const district = districtByPath.get(pathname);
  if (district) {
    const geographicPath = pathname.match(/^\/commercial-real-estate\/([A-Z]{2})\/([^/]+)\//);
    const identity = searchMarketIdentity({
      state: geographicPath ? geographicPath[1] : district.state,
      marketId: geographicPath ? geographicPath[2] : district.city,
      marketName: district.marketName || district.city,
    });
    return {
      entityType: "district",
      page: pathname,
      ...identity,
      marketName: district.marketName || district.city,
      state: district.state,
      districtId: district.slug,
      districtName: district.label || district.name,
    };
  }

  const comparison = comparisonByPath.get(pathname);
  if (comparison) {
    const geographicPath = pathname.match(/^\/commercial-real-estate\/([A-Z]{2})\/([^/]+)\//);
    const identity = searchMarketIdentity({
      state: geographicPath ? geographicPath[1] : comparison.state_abbr,
      marketId: geographicPath ? geographicPath[2] : comparison.city_slug,
      marketName: comparison.city,
    });
    return {
      entityType: "comparison",
      page: pathname,
      ...identity,
      marketName: comparison.city,
      state: geographicPath ? geographicPath[1] : comparison.state_abbr,
      comparisonId: comparison.slug,
    };
  }

  const building = buildingByPath.get(pathname);
  if (building) {
    const identity = searchMarketIdentity({ state: building.state_abbr, marketId: building.city_slug, marketName: building.city });
    return {
      entityType: "building",
      page: pathname,
      ...identity,
      marketName: building.city,
      state: building.state_abbr,
      buildingId: building.building_slug,
      buildingName: building.name,
      propertyType: String(building.primary_space_type || "").toLowerCase() || undefined,
    };
  }

  const propertyTypeMatch = pathname.match(/^\/commercial-real-estate\/([A-Z]{2})\/([^/]+)\/([^/]+)\/$/);
  if (propertyTypeMatch && PROPERTY_TYPE_BY_SLUG[propertyTypeMatch[3]]) {
    const key = `${propertyTypeMatch[1]}/${propertyTypeMatch[2]}`;
    const city = cityBySlugState.get(key);
    const identity = searchMarketIdentity({ state: propertyTypeMatch[1], marketId: propertyTypeMatch[2], marketName: city ? city.city : propertyTypeMatch[2] });
    return {
      entityType: "property_type",
      page: pathname,
      ...identity,
      marketName: city ? city.city : propertyTypeMatch[2],
      state: propertyTypeMatch[1],
      propertyType: PROPERTY_TYPE_BY_SLUG[propertyTypeMatch[3]],
      propertyTypeSlug: propertyTypeMatch[3],
    };
  }

  const city = cityByPath.get(pathname);
  if (city) {
    const identity = searchMarketIdentity({ state: city.state_abbr, marketId: city.slug, marketName: city.city });
    return {
      entityType: "market",
      page: pathname,
      ...identity,
      marketName: city.city,
      state: city.state_abbr,
    };
  }

  return {
    entityType: "unknown",
    page: pathname,
  };
}

module.exports = {
  PROPERTY_TYPE_BY_SLUG,
  normalizePath,
  mapRofoUrlToEntity,
};
