(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.RofoRecommendationResolver = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  function slugKey(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function locationKey(location) {
    if (!location) return "";
    return [location.slug, location.city, location.state].map(slugKey).filter(Boolean).join("|");
  }

  function normalizeSpaceType(value) {
    const key = String(value || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    if (key.includes("office")) return "office";
    if (key.includes("warehouse")) return "warehouse";
    if (key.includes("distribution")) return "distribution";
    if (key.includes("manufacturing")) return "manufacturing";
    if (key.includes("industrial")) return "industrial";
    if (key.includes("retail")) return "retail";
    if (key.includes("restaurant")) return "restaurant";
    if (key.includes("medical")) return "medical";
    if (key.includes("flex")) return "flex";
    if (key === "r_d" || key.includes("r_and_d")) return "r_and_d";
    if (key.includes("coworking")) return "coworking";
    return key || "office";
  }

  function normalizePriority(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function profileIndexes(profiles) {
    const bySlug = new Map();
    const byPath = new Map();
    const byLocation = new Map();
    profiles.forEach((profile) => {
      if (!profile || !profile.slug) return;
      bySlug.set(slugKey(profile.slug), profile);
      if (profile.path) byPath.set(profile.path, profile);
      byLocation.set(locationKey(profile), profile);
    });
    return { bySlug, byPath, byLocation };
  }

  function findProfileForLocation(location, indexes) {
    if (!location || !indexes) return null;
    if (location.path && indexes.byPath.has(location.path)) return indexes.byPath.get(location.path);
    const keyed = locationKey(location);
    if (keyed && indexes.byLocation.has(keyed)) return indexes.byLocation.get(keyed);
    return indexes.bySlug.get(slugKey(location.slug || location.label)) || null;
  }

  function profileBySlug(slug, indexes) {
    return indexes && indexes.bySlug.get(slugKey(slug));
  }

  function businessFitFor(profile, spaceType) {
    if (!profile) return null;
    const key = normalizeSpaceType(spaceType);
    const fitMap = profile.spaceTypeFit || profile.businessFit || {};
    return fitMap[key] || fitMap.office || null;
  }

  function profileSummary(profile, spaceType) {
    const fit = businessFitFor(profile, spaceType);
    if (fit && fit.summary) return fit.summary;
    if (Array.isArray(profile.strengths) && profile.strengths.length) {
      return `${profile.label} is relevant because of ${profile.strengths.slice(0, 3).join(", ")}.`;
    }
    return `${profile.label} is a relevant commercial location to review against your search profile.`;
  }

  function fitLabel(profile, spaceType) {
    const fit = businessFitFor(profile, spaceType);
    if (!fit || !fit.fit) return "Relevant";
    return `${fit.fit.charAt(0).toUpperCase()}${fit.fit.slice(1)} fit`;
  }

  function recommendationItem(profile, spaceType) {
    const fit = businessFitFor(profile, spaceType);
    return {
      label: profile.label,
      slug: profile.slug,
      type: profile.type,
      city: profile.city,
      state: profile.state,
      path: profile.path || "",
      fitLabel: fitLabel(profile, spaceType),
      summary: profileSummary(profile, spaceType),
      strengths: Array.isArray(profile.strengths) ? profile.strengths.slice(0, 4) : [],
      tradeoffs: fit && Array.isArray(fit.tradeoffs) ? fit.tradeoffs.slice(0, 3) : [],
      bestFor: fit && Array.isArray(fit.bestFor) ? fit.bestFor.slice(0, 4) : [],
      attributes: profile.attributes || {},
      retailAttributes: profile.retailAttributes || {},
      industrialAttributes: profile.industrialAttributes || {},
      questionsToValidate: Array.isArray(profile.questionsToValidate) ? profile.questionsToValidate.slice(0, 5) : [],
      confidence: profile.confidence || "medium",
    };
  }

  function confidenceLabel(value) {
    if (value === "high") return "High Confidence";
    if (value === "medium") return "Medium Confidence";
    return "Expert Guided";
  }

  function compareRelationships(profile) {
    if (profile && profile.relationships && Array.isArray(profile.relationships.compareWith)) {
      return profile.relationships.compareWith;
    }
    return Array.isArray(profile && profile.compareWith) ? profile.compareWith : [];
  }

  function fitScore(profile, spaceType) {
    const key = normalizeSpaceType(spaceType);
    const fitMap = profile.spaceTypeFit || profile.businessFit || {};
    const fit = fitMap[key] || (key === "office" ? fitMap.office : null);
    const values = { excellent: 50, strong: 40, good: 28, limited: 8, unknown: 0 };
    return fit && fit.fit ? values[fit.fit] || 0 : 0;
  }

  function attributeValueScore(value, desired) {
    if (!value || value === "unknown") return 0;
    if (desired === "low") return value === "low" ? 8 : value === "medium" ? 3 : 0;
    return value === "high" ? 8 : value === "medium" ? 4 : 0;
  }

  const priorityAttributeRules = [
    { match: ["transit"], field: "attributes.transit" },
    { match: ["parking", "employees drive", "drive"], field: "attributes.parking" },
    { match: ["growth", "expand"], field: "attributes.expansionFlexibility" },
    { match: ["lower cost", "cost", "budget", "value"], field: "attributes.costPosition" },
    { match: ["back office", "back-office"], field: "attributes.costPosition" },
    { match: ["back office", "back-office"], field: "attributes.parking" },
    { match: ["prestige", "executive", "image", "client"], field: "attributes.executiveImage" },
    { match: ["customer", "patient"], field: "attributes.customerAccess" },
    { match: ["walkability", "walkable"], field: "attributes.walkability" },
    { match: ["restaurant", "amenity", "amenities"], field: "attributes.amenities" },
    { match: ["talent", "recruit"], field: "attributes.talentAccess" },
    { match: ["visibility"], field: "attributes.visibility" },
    { match: ["foot traffic"], field: "retailAttributes.footTraffic" },
    { match: ["street visibility", "street presence"], field: "retailAttributes.streetPresence" },
    { match: ["co tenancy", "co-tenancy"], field: "retailAttributes.coTenancy" },
    { match: ["signage"], field: "retailAttributes.signageVisibility" },
    { match: ["truck"], field: "industrialAttributes.truckAccess" },
    { match: ["loading"], field: "industrialAttributes.loading" },
    { match: ["highway", "freeway"], field: "industrialAttributes.highwayAccess" },
    { match: ["last mile"], field: "industrialAttributes.lastMileAccess" },
    { match: ["yard", "outdoor"], field: "industrialAttributes.yard" },
    { match: ["power"], field: "industrialAttributes.power" },
    { match: ["trailer"], field: "industrialAttributes.parkingTrailer" },
    { match: ["labor"], field: "industrialAttributes.laborAccess" },
  ];

  function valueAtPath(profile, path) {
    return path.split(".").reduce((value, key) => value && value[key], profile);
  }

  function profileKnowledgeText(profile, spaceType) {
    const fitMap = profile.spaceTypeFit || profile.businessFit || {};
    const activeFit = businessFitFor(profile, spaceType) || {};
    const allFits = Object.values(fitMap || {});
    return [
      profile.label,
      profile.city,
      profile.type,
      ...(profile.bestFor || []),
      ...(profile.strengths || []),
      ...(profile.tradeoffs || []),
      activeFit.summary,
      ...(activeFit.bestFor || []),
      ...(activeFit.tradeoffs || []),
      ...allFits.flatMap((fit) => [fit && fit.summary, ...((fit && fit.bestFor) || []), ...((fit && fit.tradeoffs) || [])]),
    ].map(normalizePriority).filter(Boolean).join(" ");
  }

  function textRelevanceScore(profile, context, priorities) {
    const haystack = profileKnowledgeText(profile, context.spaceType);
    if (!haystack) return 0;
    return priorities.reduce((score, priority) => {
      if (priority.length < 4) return score;
      if (haystack.includes(priority)) return score + 18;
      const meaningfulTerms = priority.split(" ").filter((term) => term.length >= 5);
      const matchedTerms = meaningfulTerms.filter((term) => haystack.includes(term));
      return score + Math.min(matchedTerms.length * 4, 8);
    }, 0);
  }

  function priorityScore(profile, context) {
    const priorities = [
      ...(Array.isArray(context.priorities) ? context.priorities : []),
      ...(Array.isArray(context.businessPriorities) ? context.businessPriorities : []),
      ...(Array.isArray(context.signals) ? context.signals : []),
    ].map(normalizePriority).filter(Boolean);
    if (!priorities.length) return 0;

    const attributeScore = priorities.reduce((score, priority) => {
      return score + priorityAttributeRules.reduce((ruleScore, rule) => {
        const matches = rule.match.some((term) => priority.includes(term));
        if (!matches) return ruleScore;
        const desired = priority.includes("unimportant") || priority.includes("not important") ? "low" : "high";
        return ruleScore + attributeValueScore(valueAtPath(profile, rule.field), desired);
      }, 0);
    }, 0);
    return attributeScore + textRelevanceScore(profile, context, priorities);
  }

  function priorityMatches(profile, context) {
    const rawPriorities = [
      ...(Array.isArray(context.priorities) ? context.priorities : []),
      ...(Array.isArray(context.businessPriorities) ? context.businessPriorities : []),
      ...(Array.isArray(context.signals) ? context.signals : []),
    ].filter(Boolean);
    const matches = [];
    rawPriorities.forEach((priority) => {
      const normalized = normalizePriority(priority);
      const matched = priorityAttributeRules.some((rule) => {
        const ruleMatched = rule.match.some((term) => normalized.includes(term));
        if (!ruleMatched) return false;
        const desired = normalized.includes("unimportant") || normalized.includes("not important") ? "low" : "high";
        return attributeValueScore(valueAtPath(profile, rule.field), desired) > 0;
      });
      const knowledgeText = profileKnowledgeText(profile, context.spaceType);
      const textMatched = normalized.length >= 4 && (
        knowledgeText.includes(normalized) ||
        normalized.split(" ").some((term) => term.length >= 5 && knowledgeText.includes(term))
      );
      if (matched || textMatched) matches.push(String(priority));
    });
    return Array.from(new Set(matches));
  }

  function readableList(items) {
    const values = (items || []).filter(Boolean);
    if (!values.length) return "";
    if (values.length === 1) return values[0];
    if (values.length === 2) return `${values[0]} and ${values[1]}`;
    return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
  }

  function roleExplanation(role) {
    if (role === "primary") return "recommended first";
    return "worth comparing";
  }

  function sentenceFragment(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    const lower = text.charAt(0).toLowerCase() + text.slice(1);
    if (/^(excellent|strong|good|limited) fit\b/.test(lower)) return `it is a ${lower}`;
    return lower;
  }

  function explainRecommendation(item, profile, context, role, primaryItem) {
    const matched = priorityMatches(profile, context);
    const fit = businessFitFor(profile, context.spaceType);
    const strengths = Array.isArray(profile.strengths) ? profile.strengths.slice(0, 3) : [];
    const tradeoff = item.tradeoffs && item.tradeoffs[0]
      ? item.tradeoffs[0]
      : (Array.isArray(profile.tradeoffs) && profile.tradeoffs[0]) || "live availability, pricing, and building-level fit still need to be validated";
    const validation = Array.isArray(profile.questionsToValidate) ? profile.questionsToValidate.slice(0, 4) : [];
    const priorityText = matched.length
      ? ` It aligns with the profile priorities around ${readableList(matched.slice(0, 3))}.`
      : "";
    const strengthText = strengths.length
      ? ` The strongest supporting signals are ${readableList(strengths)}.`
      : "";
    const fitText = fit && fit.summary ? fit.summary : item.summary;
    const selectionRationale = `${item.label} is ${roleExplanation(role)} because ${sentenceFragment(fitText)}${priorityText}${strengthText}`;
    const primaryContrast = primaryItem && primaryItem.label && primaryItem.label !== item.label
      ? `${primaryItem.label} appears to fit the initial profile more directly, while ${item.label} is useful for pressure-testing assumptions around commute, cost, building format, or customer access.`
      : `${item.label} should be compared against nearby alternatives before narrowing to individual buildings.`;

    return {
      selectionRationale,
      matchedPriorities: matched.length ? matched.slice(0, 4) : strengths.slice(0, 3),
      tradeoffSummary: tradeoff,
      alternativeRationale: role === "primary"
        ? "Nearby alternatives are still worth comparing because commute patterns, pricing, parking, and live building options can change the right path."
        : `${item.label} remains relevant because ${sentenceFragment(item.summary)} ${primaryContrast}`,
      validationFocus: validation,
    };
  }

  function attachExplainability(items, profiles, context) {
    const primaryItem = items[0] || null;
    return items.map((item, index) => {
      const profile = profiles[index];
      const explanation = explainRecommendation(item, profile, context, index === 0 ? "primary" : "alternative", primaryItem);
      return { ...item, ...explanation };
    });
  }

  function cityCandidateProfiles(inputProfile, graphNodes, activeIndexes) {
    const candidates = new Map();
    const add = (profile) => {
      if (profile && profile.slug && profile.slug !== inputProfile.slug) candidates.set(profile.slug, profile);
    };

    (inputProfile.marketPath || []).forEach((slug) => add(profileBySlug(slug, activeIndexes)));
    compareRelationships(inputProfile).forEach((relationship) => add(profileBySlug(relationship.slug, activeIndexes)));
    (graphNodes || []).forEach((profile) => {
      if (profile && profile.state === inputProfile.state && profile.city === inputProfile.city && profile.type === "district") {
        add(profile);
      }
    });

    return Array.from(candidates.values());
  }

  function rankedCityPath(inputProfile, graphNodes, activeIndexes, context) {
    const candidates = cityCandidateProfiles(inputProfile, graphNodes, activeIndexes);
    const originalOrder = new Map(candidates.map((profile, index) => [profile.slug, index]));
    return candidates
      .map((profile) => ({
        profile,
        score: fitScore(profile, context.spaceType) + priorityScore(profile, context),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || (originalOrder.get(a.profile.slug) || 0) - (originalOrder.get(b.profile.slug) || 0))
      .slice(0, 3)
      .map((item) => item.profile);
  }

  function expertReviewHref(context) {
    const locations = (context.locations || []).map((location) => location.label).filter(Boolean).join(" / ") || "Your selected market";
    const subject = encodeURIComponent(`Rofo expert review: ${locations}`);
    const body = encodeURIComponent([
      "I'd like a local expert to review my Rofo Search Profile.",
      "",
      `Location: ${locations}`,
      `Space: ${context.spaceType || "Not specified"}`,
      `Size: ${String(context.size || "Size to confirm").replace(/\bsqft\b/gi, "SF")}`,
    ].join("\n"));
    return `mailto:hello@rofo.com?subject=${subject}&body=${body}`;
  }

  function resolveMarketPath(context, graphNodes, fallbackProfiles) {
    const graphIndexes = profileIndexes(graphNodes || []);
    const fallbackIndexes = profileIndexes(fallbackProfiles || []);
    const locations = context.locations || [];
    const inputLocation = locations[0] || null;
    if (!inputLocation) {
      return {
        mode: "demo",
        title: "Sample Recommendation",
        confidenceLabel: "Sample",
        primaryLocationLabel: "Mission Bay",
        summaryCopy: "This is a sample recommendation. Start a profile to see recommendations based on your search.",
        ctaLabel: "Start My Market Investigation",
        ctaHref: "/find-locations/",
        recommendedPath: [],
        compareWith: [],
        questionsToValidate: [],
      };
    }

    const graphProfile = findProfileForLocation(inputLocation, graphIndexes);
    const inputProfile = graphProfile || findProfileForLocation(inputLocation, fallbackIndexes);
    const activeIndexes = graphProfile ? graphIndexes : fallbackIndexes;
    if (!inputProfile || inputProfile.confidence === "expert_guided") {
      return {
        mode: "expert_guided",
        title: "Expert Guided Recommendation",
        confidenceLabel: "Expert Guided",
        inputLocation,
        primaryLocationLabel: inputLocation.label,
        primaryRecommendation: inputProfile ? recommendationItem(inputProfile, context.spaceType) : null,
        recommendedPath: [],
        compareWith: [],
        questionsToValidate: inputProfile && Array.isArray(inputProfile.questionsToValidate) ? inputProfile.questionsToValidate : [],
        summaryCopy: inputProfile
          ? `${inputLocation.label} is a relevant starting point, but this market is best handled with help from a local expert because Rofo's recommendation graph is still lighter here.`
          : "We have your Search Profile, but this market is best handled with help from a local expert.",
        ctaLabel: "Request Expert Review",
        ctaHref: expertReviewHref(context),
      };
    }

    const marketPathProfiles = inputProfile.type === "city"
      ? rankedCityPath(inputProfile, graphNodes || [], activeIndexes, context)
      : [];
    const fallbackMarketPath = Array.isArray(inputProfile.marketPath)
      ? inputProfile.marketPath.map((slug) => profileBySlug(slug, activeIndexes)).filter(Boolean)
      : [];
    const activeMarketPath = marketPathProfiles.length ? marketPathProfiles : fallbackMarketPath;
    const mode = inputProfile.type === "city" && activeMarketPath.length ? "market_path" : "single_starting_point";
    const pathProfiles = mode === "market_path" ? activeMarketPath : [inputProfile];
    const recommendedPath = attachExplainability(
      pathProfiles.map((profile) => recommendationItem(profile, context.spaceType)),
      pathProfiles,
      context
    );
    const primaryRecommendation = recommendedPath[0] || recommendationItem(inputProfile, context.spaceType);
    const compareWith = compareRelationships(inputProfile)
      .map((item) => {
        const profile = profileBySlug(item.slug, activeIndexes);
        return {
          label: item.label || (profile && profile.label) || item.slug,
          slug: item.slug || (profile && profile.slug) || "",
          reason: item.reason || "",
          relationshipType: item.relationshipType || "similar",
          path: (profile && profile.path) || item.path || "",
        };
      }).filter((item) => item.label);

    return {
      mode,
      title: mode === "market_path" ? "Recommended Market Path" : "Relevant Starting Point",
      confidenceLabel: confidenceLabel(inputProfile.confidence),
      inputLocation,
      primaryLocationLabel: primaryRecommendation.label,
      primaryRecommendation,
      recommendedPath,
      compareWith,
      questionsToValidate: primaryRecommendation.questionsToValidate || [],
      summaryCopy: mode === "market_path"
        ? `${inputProfile.label} has several commercial districts that fit different versions of your search. We'd start by comparing the strongest path before looking at individual buildings.`
        : `${inputProfile.label} appears to be a relevant starting point based on your profile.`,
      ctaLabel: "Request Expert Review",
      ctaHref: expertReviewHref(context),
    };
  }

  return {
    normalizeSpaceType,
    resolveMarketPath,
    recommendationItem,
  };
});
