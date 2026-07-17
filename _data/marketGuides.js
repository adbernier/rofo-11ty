const officeGuides = require("./raw/market-guides/office-guides.json");
const industrialGuides = require("./raw/market-guides/industrial-guides.json");
const retailGuides = require("./raw/market-guides/retail-guides.json");
const cities = require("./cities.generated.json");
const buildingPages = require("./buildingPages.js");
const spaceTypePages = require("./spaceTypePages.js");
const marketGuideEnrichment = require("./marketGuideEnrichment.json");
const marketSnapshots = require("./marketSnapshots.js");
const { getRoutingCandidates } = require("./leadRouting.js");

const spaceTypeLabels = {
  "office-space": "Office Space",
  "retail-space": "Retail Space",
  "industrial-space": "Industrial Space",
  "coworking-space": "Coworking Space",
  "flex-space": "Flex Space",
};

const spaceTypeShortLabels = {
  "office-space": "office",
  "retail-space": "retail",
  "industrial-space": "industrial",
  "coworking-space": "coworking",
  "flex-space": "flex",
};

const spaceTypeNouns = {
  "office-space": "office",
  "retail-space": "retail",
  "industrial-space": "industrial",
  "coworking-space": "coworking",
  "flex-space": "flex",
};

const spaceTypeUseCases = {
  "office-space": "Office space can work for professional services, client-facing teams, administrative users, and companies that need private workspace.",
  "retail-space": "Retail space can work for storefronts, restaurants, service businesses, wellness operators, and customer-facing brands.",
  "industrial-space": "Industrial space can work for warehouse users, logistics operations, light manufacturing, service trades, and distribution needs.",
  "flex-space": "Flex space can work for businesses that need a mix of office, showroom, service, storage, or light industrial space.",
  "coworking-space": "Coworking space can work for flexible teams, remote workers, startups, and businesses that want shorter-term workspace options.",
};

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countyStateSlug(county, stateAbbr) {
  const countySlug = slugify(county);
  const stateSlug = String(stateAbbr || "").trim().toLowerCase();
  return countySlug && stateSlug ? `${countySlug}-${stateSlug}` : "";
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("en-US") : "";
}

function getCityStateSlug(citySlug, stateAbbr) {
  return `${String(citySlug || "").toLowerCase()}-${String(stateAbbr || "").toLowerCase()}`;
}

function getMarketSnapshotKey(stateAbbr, citySlug) {
  return `${String(stateAbbr || "").toUpperCase()}/${String(citySlug || "").toLowerCase()}`;
}

const cityLookup = new Map(
  cities.map((city) => {
    const key = city.city_state_slug || getCityStateSlug(city.slug, city.state_abbr);
    return [key, city];
  })
);

const buildingsByCity = buildingPages.reduce((lookup, building) => {
  const key = getCityStateSlug(building.city_slug, building.state_abbr);
  if (!lookup.has(key)) lookup.set(key, []);
  lookup.get(key).push(building);
  return lookup;
}, new Map());

const spaceTypePagesByCity = spaceTypePages.reduce((lookup, entry) => {
  const key = getCityStateSlug(entry.city_slug, entry.state_abbr);
  if (!lookup.has(key)) lookup.set(key, []);
  lookup.get(key).push(entry);
  return lookup;
}, new Map());

const spaceTypePageLookup = new Map(
  spaceTypePages.map((entry) => {
    const key = `${String(entry.state_abbr || "").toUpperCase()}/${String(entry.city_slug || "").toLowerCase()}/${String(entry.page_slug || "").toLowerCase()}`;
    return [key, entry];
  })
);

function buildMarketOverview({ city, state, county, nearbyMarkets, availableSpaceTypes, buildingCount }) {
  const countyPhrase = county ? ` in ${county}` : "";
  const typePhrase = availableSpaceTypes.length
    ? ` Common space types include ${availableSpaceTypes.map((type) => type.label.toLowerCase()).join(", ")}.`
    : "";
  const buildingPhrase = buildingCount
    ? ` Rofo currently includes ${buildingCount} example ${buildingCount === 1 ? "building" : "buildings"} for this market.`
    : "";
  const nearbyPhrase = nearbyMarkets.length
    ? ` Nearby markets such as ${nearbyMarkets.slice(0, 3).map((market) => market.city).join(", ")} can also be useful to compare.`
    : "";

  return `${city}, ${state} is a local commercial real estate market${countyPhrase} where businesses can compare space needs by location, property type, and fit.${typePhrase}${buildingPhrase}${nearbyPhrase}`;
}

function buildFaqs(guide) {
  return [
    {
      question: `How do I find commercial space in ${guide.city}?`,
      answer: `Start by defining the type of space, approximate size, preferred location, and timing. Rofo can help compare available options in ${guide.city} and nearby markets.`,
    },
    {
      question: `What types of commercial space are available in ${guide.city}?`,
      answer: guide.available_space_types.length
        ? `${guide.city} has guide or inventory coverage for ${guide.available_space_types.map((type) => type.label.toLowerCase()).join(", ")}. Availability varies by property and timing.`
        : `${guide.city} may include office, retail, industrial, flex, or coworking options depending on current market availability.`,
    },
    {
      question: "Can Rofo help me compare nearby markets?",
      answer: guide.nearby_markets.length
        ? `Yes. Rofo can help compare ${guide.city} with nearby markets such as ${guide.nearby_markets.slice(0, 3).map((market) => market.city).join(", ")}.`
        : "Yes. Rofo can help compare nearby markets when location flexibility is part of the search.",
    },
    {
      question: "How does Rofo connect me with local options?",
      answer: "Share what kind of space you need, your target market, and approximate size. Rofo reviews the request and helps identify relevant next steps.",
    },
  ];
}

function normalizeSpaceTypeGuide(guide) {
    const state = String(guide.state_abbr || "").toUpperCase();
    const citySlug = guide.city_slug;
    const guideSlug = guide.guide_slug;
    const spaceTypeLabel = guide.space_type_label || spaceTypeLabels[guide.space_type] || guide.space_type;
    const spaceTypeNoun = guide.space_type_noun || spaceTypeNouns[guide.space_type] || String(spaceTypeLabel || "").toLowerCase();
    const cityStateSlug = guide.city_state_slug || getCityStateSlug(citySlug, state);
    const marketSnapshot = marketSnapshots[getMarketSnapshotKey(state, citySlug)] || null;
    const city = cityLookup.get(cityStateSlug) || {};
    const enrichment = marketGuideEnrichment[cityStateSlug] || {};
    const county = guide.county || enrichment.county || city.county_name || city.county || "";
    const countySlug = countyStateSlug(county, state);
    const representativeBuildings = (buildingsByCity.get(cityStateSlug) || []).slice(0, 6);
    const citySpaceTypePages = spaceTypePagesByCity.get(cityStateSlug) || [];
    const availableSpaceTypes = citySpaceTypePages.map((entry) => {
      const label = entry.spaceType && entry.spaceType.pluralLabel
        ? entry.spaceType.pluralLabel
        : spaceTypeLabels[entry.page_slug] || entry.page_slug;

      return {
        slug: entry.page_slug,
        label,
        label_lower: String(label || "").toLowerCase(),
        url: `/commercial-real-estate/${state}/${citySlug}/${entry.page_slug}/`,
        use_case: spaceTypeUseCases[entry.page_slug] || "This space type may fit businesses comparing commercial locations in the market.",
      };
    });
    const guideSpaceTypePageKey = `${state}/${String(citySlug || "").toLowerCase()}/${guide.space_type}`;
    const hasMatchingSpaceTypePage = spaceTypePageLookup.has(guideSpaceTypePageKey);
    const nearbyMarkets = (city.nearby_cities || []).map((nearby) => ({
      city: nearby.city,
      state_abbr: String(nearby.state_abbr || "").toUpperCase(),
      slug: String(nearby.slug || "").toLowerCase(),
      url: nearby.path || `/commercial-real-estate/${String(nearby.state_abbr || "").toUpperCase()}/${String(nearby.slug || "").toLowerCase()}/`,
      guide_url: `/commercial-real-estate/${String(nearby.state_abbr || "").toUpperCase()}/${String(nearby.slug || "").toLowerCase()}/market-guide/`,
    }));
    const normalizedGuide = {
      ...guide,
      guide_kind: "space-type",
      city_state_slug: cityStateSlug,
      state_abbr: state,
      market_snapshot: marketSnapshot,
      county,
      population: guide.population || enrichment.population || city.population || "",
      population_label: formatNumber(guide.population || enrichment.population || city.population),
      employment_count: guide.employment_count || enrichment.employment_count || "",
      employment_count_label: formatNumber(guide.employment_count || enrichment.employment_count),
      establishment_count: guide.establishment_count || enrichment.establishment_count || "",
      establishment_count_label: formatNumber(guide.establishment_count || enrichment.establishment_count),
      unemployment_rate: guide.unemployment_rate || enrichment.unemployment_rate || "",
      data_source_label: guide.data_source_label || enrichment.data_source_label || "",
      data_source_year: guide.data_source_year || enrichment.data_source_year || "",
      space_type_label: spaceTypeLabel,
      space_type_label_lower: String(spaceTypeLabel || "").toLowerCase(),
      space_type_noun: spaceTypeNoun,
      space_type_short_label: spaceTypeShortLabels[guide.space_type] || String(spaceTypeLabel || "").toLowerCase(),
      meta_description: `Understand ${String(spaceTypeLabel || "").toLowerCase()} decisions in ${guide.city}, ${state}. Compare locations, representative buildings, costs, and tradeoffs before narrowing the search.`,
      has_inventory: guide.has_inventory !== false && hasMatchingSpaceTypePage,
      has_matching_space_type_page: hasMatchingSpaceTypePage,
      url: `/commercial-real-estate/${state}/${citySlug}/${guideSlug}/`,
      output_path: `/commercial-real-estate/${state}/${citySlug}/${guideSlug}/index.html`,
      city_market_guide_url: `/commercial-real-estate/${state}/${citySlug}/market-guide/`,
      city_url: `/commercial-real-estate/${state}/${citySlug}/`,
      space_type_url: `/commercial-real-estate/${state}/${citySlug}/${guide.space_type}/`,
      routing_market: cityStateSlug,
      routing_county: countySlug,
      routing_space_type: guide.space_type,
      routing_candidates: getRoutingCandidates({
        city_state_slug: cityStateSlug,
        county_state_slug: countySlug,
        space_type_slug: guide.space_type,
      }),
      nearby_markets: nearbyMarkets,
      nearby_market_guides: [],
      matching_space_type_guides: [],
      available_space_types: availableSpaceTypes,
      representative_buildings: representativeBuildings,
      representative_building_count: (buildingsByCity.get(cityStateSlug) || []).length,
    };

    return {
      ...normalizedGuide,
      market_overview: guide.market_overview || buildMarketOverview({
        city: guide.city,
        state,
        county,
        nearbyMarkets,
        availableSpaceTypes,
        buildingCount: normalizedGuide.representative_building_count,
      }),
      faqs: guide.faqs || buildFaqs(normalizedGuide),
    };
}

function buildCityGuide(city) {
  const citySlug = String(city.slug || "").toLowerCase();
  const state = String(city.state_abbr || "").toUpperCase();
  const cityStateSlug = city.city_state_slug || getCityStateSlug(citySlug, state);
  const marketSnapshot = marketSnapshots[getMarketSnapshotKey(state, citySlug)] || null;
  const enrichment = marketGuideEnrichment[cityStateSlug] || {};
  const county = enrichment.county || city.county_name || city.county || "";
  const countySlug = countyStateSlug(county, state);
  const allCityBuildings = buildingsByCity.get(cityStateSlug) || [];
  const representativeBuildings = allCityBuildings.slice(0, 6);
  const citySpaceTypePages = spaceTypePagesByCity.get(cityStateSlug) || [];
  const availableSpaceTypes = citySpaceTypePages.map((entry) => {
    const label = entry.spaceType && entry.spaceType.pluralLabel
      ? entry.spaceType.pluralLabel
      : spaceTypeLabels[entry.page_slug] || entry.page_slug;

    return {
      slug: entry.page_slug,
      label,
      label_lower: String(label || "").toLowerCase(),
      url: `/commercial-real-estate/${state}/${citySlug}/${entry.page_slug}/`,
      use_case: spaceTypeUseCases[entry.page_slug] || "This space type may fit businesses comparing commercial locations in the market.",
    };
  });
  const nearbyMarkets = (city.nearby_cities || []).map((nearby) => ({
    city: nearby.city,
    state_abbr: String(nearby.state_abbr || "").toUpperCase(),
    slug: String(nearby.slug || "").toLowerCase(),
    url: nearby.path || `/commercial-real-estate/${String(nearby.state_abbr || "").toUpperCase()}/${String(nearby.slug || "").toLowerCase()}/`,
    guide_url: `/commercial-real-estate/${String(nearby.state_abbr || "").toUpperCase()}/${String(nearby.slug || "").toLowerCase()}/market-guide/`,
  }));
  const title = `${city.city}, ${state} Commercial Real Estate Guide`;
  const normalizedGuide = {
    guide_kind: "city",
    city: city.city,
    state_abbr: state,
    state,
    market_snapshot: marketSnapshot,
    county,
    city_slug: citySlug,
    city_state_slug: cityStateSlug,
    title,
    meta_description: `Understand commercial real estate in ${city.city}, ${state}. Compare market context, space types, nearby areas, and representative buildings before narrowing the search.`,
    summary: `Use this guide to compare commercial real estate options in ${city.city}, ${state}, including space types, nearby markets, and example buildings where Rofo has inventory data.`,
    summary_short: `Commercial real estate guide for ${city.city}, ${state}.`,
    market_date: "Current",
    population: enrichment.population || city.population || "",
    population_label: formatNumber(enrichment.population || city.population),
    employment_count: enrichment.employment_count || "",
    employment_count_label: formatNumber(enrichment.employment_count),
    establishment_count: enrichment.establishment_count || "",
    establishment_count_label: formatNumber(enrichment.establishment_count),
    unemployment_rate: enrichment.unemployment_rate || "",
    data_source_label: enrichment.data_source_label || "",
    data_source_year: enrichment.data_source_year || "",
    has_inventory: allCityBuildings.length > 0,
    has_matching_space_type_page: availableSpaceTypes.length > 0,
    url: `/commercial-real-estate/${state}/${citySlug}/market-guide/`,
    output_path: `/commercial-real-estate/${state}/${citySlug}/market-guide/index.html`,
    city_market_guide_url: `/commercial-real-estate/${state}/${citySlug}/market-guide/`,
    city_url: `/commercial-real-estate/${state}/${citySlug}/`,
    space_type_url: "",
    space_type: "",
    space_type_label: "Commercial Space",
    space_type_label_lower: "commercial space",
    space_type_noun: "commercial real estate",
    space_type_short_label: "commercial",
    routing_market: cityStateSlug,
    routing_county: countySlug,
    routing_space_type: "",
    routing_candidates: getRoutingCandidates({
      city_state_slug: cityStateSlug,
      county_state_slug: countySlug,
      space_type_slug: "",
    }),
    nearby_markets: nearbyMarkets,
    nearby_market_guides: [],
    matching_space_type_guides: [],
    available_space_types: availableSpaceTypes,
    representative_buildings: representativeBuildings,
    representative_building_count: allCityBuildings.length,
    sources: [],
  };

  return {
    ...normalizedGuide,
    market_overview: buildMarketOverview({
      city: city.city,
      state,
      county,
      nearbyMarkets,
      availableSpaceTypes,
      buildingCount: normalizedGuide.representative_building_count,
    }),
    faqs: buildFaqs(normalizedGuide),
  };
}

function addNearbyGuideLinks(guides) {
  const cityGuideUrls = new Map();
  const spaceGuideUrls = new Map();
  const spaceGuideUrlsByCity = new Map();

  guides.forEach((guide) => {
    if (guide.guide_kind === "city") {
      cityGuideUrls.set(guide.city_state_slug, guide.url);
    }

    if (guide.guide_kind === "space-type") {
      spaceGuideUrls.set(`${guide.city_state_slug}::${guide.space_type}`, guide.url);
      if (!spaceGuideUrlsByCity.has(guide.city_state_slug)) {
        spaceGuideUrlsByCity.set(guide.city_state_slug, []);
      }
      spaceGuideUrlsByCity.get(guide.city_state_slug).push({
        slug: guide.space_type,
        label: guide.space_type_label,
        label_lower: guide.space_type_label_lower,
        url: guide.url,
      });
    }
  });

  return guides.map((guide) => ({
    ...guide,
    available_space_types: guide.available_space_types.map((type) => ({
      ...type,
      guide_url: spaceGuideUrls.get(`${guide.city_state_slug}::${type.slug}`) || "",
    })),
    matching_space_type_guides: spaceGuideUrlsByCity.get(guide.city_state_slug) || [],
    nearby_market_guides: guide.nearby_markets
      .map((nearby) => {
        const cityStateSlug = getCityStateSlug(nearby.slug, nearby.state_abbr);
        const url = guide.guide_kind === "space-type"
          ? spaceGuideUrls.get(`${cityStateSlug}::${guide.space_type}`)
          : cityGuideUrls.get(cityStateSlug);

        return url ? { ...nearby, guide_url: url } : null;
      })
      .filter(Boolean),
  }));
}

module.exports = function () {
  const rawSpaceTypeGuides = [...officeGuides, ...industrialGuides, ...retailGuides].map(normalizeSpaceTypeGuide);
  const rawCityGuides = cities
    .filter((city) => {
      const citySlug = String(city.slug || "").toLowerCase();
      const state = String(city.state_abbr || "").toUpperCase();
      if (!citySlug || !state) return false;

      const cityStateSlug = city.city_state_slug || getCityStateSlug(citySlug, state);
      const buildingCount = (buildingsByCity.get(cityStateSlug) || []).length;
      const hasGeneratedCityPage = Boolean(city.path);

      return buildingCount > 0 || hasGeneratedCityPage;
    })
    .map(buildCityGuide);

  return addNearbyGuideLinks([...rawSpaceTypeGuides, ...rawCityGuides]);
};
