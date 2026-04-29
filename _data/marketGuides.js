const officeGuides = require("./raw/market-guides/office-guides.json");

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

module.exports = function () {
  return officeGuides.map((guide) => {
    const state = String(guide.state_abbr || "").toUpperCase();
    const citySlug = guide.city_slug;
    const guideSlug = guide.guide_slug;
    const spaceTypeLabel = guide.space_type_label || spaceTypeLabels[guide.space_type] || guide.space_type;

    return {
      ...guide,
      state_abbr: state,
      space_type_label: spaceTypeLabel,
      space_type_label_lower: String(spaceTypeLabel || "").toLowerCase(),
      space_type_short_label: spaceTypeShortLabels[guide.space_type] || String(spaceTypeLabel || "").toLowerCase(),
      url: `/commercial-real-estate/${state}/${citySlug}/${guideSlug}/`,
      city_url: `/commercial-real-estate/${state}/${citySlug}/`,
      space_type_url: `/commercial-real-estate/${state}/${citySlug}/${guide.space_type}/`
    };
  });
};
