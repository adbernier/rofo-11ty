(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.RofoRecommendationRepresentativeBuildings = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const MINIMUM_ELIGIBLE_BUILDINGS = 2;
  const MAX_BUILDINGS_PER_DISTRICT = 3;

  function slugKey(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function meaningful(value, minWords = 5) {
    return normalizeText(value).split(/\s+/).filter(Boolean).length >= minWords;
  }

  function uniqueCards(cards) {
    const seen = new Set();
    return (cards || []).filter((card) => {
      const key = card && card.canonicalUrl;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function hasRequiredCardFields(card) {
    return Boolean(
      card &&
      card.name &&
      card.canonicalUrl &&
      card.buildingBriefStatus &&
      meaningful(card.representativeReason) &&
      meaningful(card.bestFitSummary) &&
      meaningful(card.primaryTradeoff)
    );
  }

  function resolveForDistrict(district, data, options = {}) {
    const min = Number(options.minimumEligibleBuildings || data.minimumEligibleBuildings || MINIMUM_ELIGIBLE_BUILDINGS);
    const max = Number(options.maxBuildingsPerDistrict || data.maxBuildingsPerDistrict || MAX_BUILDINGS_PER_DISTRICT);
    const districtSlug = slugKey(district && (district.slug || district.label || district.districtSlug));
    const districtPath = district && district.path;
    const group = data && data.byDistrictSlug ? data.byDistrictSlug[districtSlug] : null;
    if (!group) {
      return {
        districtSlug,
        districtName: district && district.label ? district.label : "",
        districtPath: districtPath || "",
        shown: false,
        reason: "insufficient-intelligence",
        buildings: [],
      };
    }

    const eligible = uniqueCards(group.buildings).filter((card) => {
      if (!hasRequiredCardFields(card)) return false;
      if (card.districtSlug === districtSlug) return true;
      return (card.secondaryDistrictSlugs || []).includes(districtSlug);
    });

    if (eligible.length < min) {
      return {
        districtSlug,
        districtName: group.districtName || (district && district.label) || "",
        districtPath: group.districtPath || districtPath || "",
        shown: false,
        reason: eligible.length === 1 ? "one-eligible-building" : "insufficient-intelligence",
        buildings: eligible,
      };
    }

    return {
      districtSlug,
      districtName: group.districtName || (district && district.label) || "",
      districtPath: group.districtPath || districtPath || "",
      shown: true,
      reason: eligible.length === 2 ? "supported-thin" : "mature",
      buildings: eligible.slice(0, max),
    };
  }

  return {
    hasRequiredCardFields,
    resolveForDistrict,
    slugKey,
  };
});
