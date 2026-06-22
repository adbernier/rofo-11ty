const neighborhoodPages = require("./neighborhoodPages");

const publishedNeighborhoodPaths = new Set(
  neighborhoodPages
    .filter((page) => page.canonical_neighborhood_path && !page.noindex)
    .map((page) => page.canonical_neighborhood_path)
);

function publishedDistrict(label, path, key) {
  const publicPage = publishedNeighborhoodPaths.has(path);

  return {
    label,
    key,
    publicPage,
    href: publicPage ? path : null
  };
}

const sfDistrictLinks = [
  publishedDistrict(
    "Financial District",
    "/commercial-real-estate/CA/san-francisco/financial-district/",
    "financial-district"
  ),
  publishedDistrict(
    "Jackson Square",
    "/commercial-real-estate/CA/san-francisco/jackson-square/",
    "jackson-square"
  ),
  publishedDistrict("SoMa", "/commercial-real-estate/CA/san-francisco/soma/", "soma"),
  publishedDistrict(
    "Mission Bay",
    "/commercial-real-estate/CA/san-francisco/mission-bay/",
    "mission-bay"
  ),
  publishedDistrict(
    "Union Square",
    "/commercial-real-estate/CA/san-francisco/union-square/",
    "union-square"
  ),
  publishedDistrict(
    "Hayes Valley",
    "/commercial-real-estate/CA/san-francisco/hayes-valley/",
    "hayes-valley"
  ),
  publishedDistrict("Mission", "/commercial-real-estate/CA/san-francisco/mission/", "mission"),
  publishedDistrict(
    "Marina District",
    "/commercial-real-estate/CA/san-francisco/marina-district/",
    "marina-district"
  ),
  publishedDistrict(
    "Richmond District",
    "/commercial-real-estate/CA/san-francisco/richmond/",
    "richmond-district"
  ),
  publishedDistrict(
    "Sunset District",
    "/commercial-real-estate/CA/san-francisco/sunset/",
    "sunset-district"
  ),
  publishedDistrict("Presidio", "/commercial-real-estate/CA/san-francisco/presidio/", "presidio")
];

const sfSecondaryDistrictLinks = [
  publishedDistrict(
    "Civic Center",
    "/commercial-real-estate/CA/san-francisco/civic-center/",
    "civic-center"
  ),
  publishedDistrict(
    "North Beach",
    "/commercial-real-estate/CA/san-francisco/north-beach/",
    "north-beach"
  ),
  publishedDistrict("Dogpatch", "/commercial-real-estate/CA/san-francisco/dogpatch/", "dogpatch"),
  publishedDistrict(
    "Potrero Hill",
    "/commercial-real-estate/CA/san-francisco/potrero-hill/",
    "potrero-hill"
  ),
  publishedDistrict(
    "South Beach",
    "/commercial-real-estate/CA/san-francisco/south-beach/",
    "south-beach"
  ),
  publishedDistrict("Bayview", "/commercial-real-estate/CA/san-francisco/bayview/", "bayview")
];

const basePath = "/assets/images/editorial-district-maps/san-francisco/";
const sfBaseImage = `${basePath}base.webp`;

function sfMapConfig(config) {
  return {
    width: 2000,
    height: 2000,
    baseImage: sfBaseImage,
    priorityDistricts: sfDistrictLinks,
    secondaryDistricts: sfSecondaryDistrictLinks,
    ...config
  };
}

module.exports = {
  byCityPath: {
    "/commercial-real-estate/CA/san-francisco/": sfMapConfig({
      title: "Explore San Francisco districts",
      subtitle:
        "See how the city's major commercial districts fit together, then explore the areas that match your search.",
      imageAlt:
        "Editorial map of San Francisco showing major commercial districts including SoMa, Mission Bay, Jackson Square, and the Financial District."
    })
  },
  byDistrictPath: {
    "/commercial-real-estate/CA/san-francisco/soma/": sfMapConfig({
      title: "San Francisco district map",
      subtitle: "See San Francisco's major commercial districts and nearby areas for context.",
      imageAlt:
        "Editorial map of San Francisco showing SoMa in relation to nearby commercial districts.",
      currentDistrictKey: "soma"
    }),
    "/commercial-real-estate/CA/san-francisco/mission-bay/": sfMapConfig({
      title: "San Francisco district map",
      subtitle: "See San Francisco's major commercial districts and nearby areas for context.",
      imageAlt:
        "Editorial map of San Francisco showing Mission Bay in relation to nearby commercial districts.",
      currentDistrictKey: "mission-bay"
    }),
    "/commercial-real-estate/CA/san-francisco/jackson-square/": sfMapConfig({
      title: "San Francisco district map",
      subtitle: "See San Francisco's major commercial districts and nearby areas for context.",
      imageAlt:
        "Editorial map of San Francisco showing Jackson Square in relation to nearby commercial districts.",
      currentDistrictKey: "jackson-square"
    }),
    "/commercial-real-estate/CA/san-francisco/financial-district/": sfMapConfig({
      title: "San Francisco district map",
      subtitle: "See San Francisco's major commercial districts and nearby areas for context.",
      imageAlt:
        "Editorial map of San Francisco showing the Financial District in relation to nearby commercial districts.",
      currentDistrictKey: "financial-district"
    }),
    "/commercial-real-estate/CA/san-francisco/union-square/": sfMapConfig({
      title: "San Francisco district map",
      subtitle: "See San Francisco's major commercial districts and nearby areas for context.",
      imageAlt:
        "Editorial map of San Francisco showing Union Square in relation to nearby commercial districts.",
      currentDistrictKey: "union-square"
    }),
    "/commercial-real-estate/CA/san-francisco/hayes-valley/": sfMapConfig({
      title: "San Francisco district map",
      subtitle: "See San Francisco's major commercial districts and nearby areas for context.",
      imageAlt:
        "Editorial map of San Francisco showing Hayes Valley in relation to nearby commercial districts.",
      currentDistrictKey: "hayes-valley"
    }),
    "/commercial-real-estate/CA/san-francisco/mission/": sfMapConfig({
      title: "San Francisco district map",
      subtitle: "See San Francisco's major commercial districts and nearby areas for context.",
      imageAlt:
        "Editorial map of San Francisco showing the Mission in relation to nearby commercial districts.",
      currentDistrictKey: "mission"
    }),
    "/commercial-real-estate/CA/san-francisco/marina-district/": sfMapConfig({
      title: "San Francisco district map",
      subtitle: "See San Francisco's major commercial districts and nearby areas for context.",
      imageAlt:
        "Editorial map of San Francisco showing the Marina District in relation to nearby commercial districts.",
      currentDistrictKey: "marina-district"
    }),
    "/commercial-real-estate/CA/san-francisco/richmond/": sfMapConfig({
      title: "San Francisco district map",
      subtitle: "See San Francisco's major commercial districts and nearby areas for context.",
      imageAlt:
        "Editorial map of San Francisco showing the Richmond District in relation to nearby commercial districts.",
      currentDistrictKey: "richmond-district"
    }),
    "/commercial-real-estate/CA/san-francisco/sunset/": sfMapConfig({
      title: "San Francisco district map",
      subtitle: "See San Francisco's major commercial districts and nearby areas for context.",
      imageAlt:
        "Editorial map of San Francisco showing the Sunset District in relation to nearby commercial districts.",
      currentDistrictKey: "sunset-district"
    }),
    "/commercial-real-estate/CA/san-francisco/presidio/": sfMapConfig({
      title: "San Francisco district map",
      subtitle: "See San Francisco's major commercial districts and nearby areas for context.",
      imageAlt:
        "Editorial map of San Francisco showing the Presidio in relation to nearby commercial districts.",
      currentDistrictKey: "presidio"
    })
  }
};
