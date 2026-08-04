(function () {
  const CONTEXT_KEY = "rofoRecommendationContextV1";
  const BRIEF_KEY = "rofoLocationBriefV1";
  const INVESTIGATION_SCOPE_LABELS = {
    currentAvailability: "Current availability",
    futureAvailability: "Future or upcoming availability",
    comparableBuildings: "Comparable buildings",
    leasingActivity: "Recent leasing activity or comps",
    marketInsight: "Market conditions and tenant considerations",
    brokerGuidance: "Broker guidance when available",
  };
  const INVESTIGATION_TIMING_LABELS = {
    immediately: "Immediately",
    within_3_months: "Within 3 months",
    "3_6_months": "3-6 months",
    "6_12_months": "6-12 months",
    more_than_12_months: "More than 12 months",
    exploring: "Exploring with no fixed date",
  };
  const BROKER_PREFERENCE_LABELS = {
    research_first: "Research first; contact me with findings",
    include_local_broker: "Include local broker guidance when available",
    already_working_with_broker: "I am already working with a broker",
    not_sure: "Not sure yet",
  };
  let currentBriefState = null;
  const buildingPhotoRequests = new Map();

  function investigationSubmissionToken() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return `lmi-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }

  function readStoredContext() {
    const read = (storage) => {
      try {
        return storage && storage.getItem(CONTEXT_KEY);
      } catch (error) {
        return "";
      }
    };
    const raw = read(window.sessionStorage) || read(window.localStorage);
    if (!raw) return null;
    try {
      return normalizeContext(JSON.parse(raw));
    } catch (error) {
      return null;
    }
  }

  function readStoredBrief() {
    const read = (storage) => {
      try {
        return storage && storage.getItem(BRIEF_KEY);
      } catch (error) {
        return "";
      }
    };
    const raw = read(window.sessionStorage) || read(window.localStorage);
    if (!raw) return null;
    try {
      const value = JSON.parse(raw);
      return value && typeof value === "object" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function persistBriefState() {
    if (!currentBriefState) return;
    currentBriefState.timestamp = new Date().toISOString();
    const serialized = JSON.stringify(currentBriefState);
    try {
      window.sessionStorage.setItem(BRIEF_KEY, serialized);
    } catch (error) {
      // Storage is optional; the page should remain usable without it.
    }
    try {
      window.localStorage.setItem(BRIEF_KEY, serialized);
    } catch (error) {
      // Storage is optional; the page should remain usable without it.
    }
  }

  function readRecommendationProfiles() {
    const node = document.getElementById("recommendation-profiles-data");
    if (!node) return [];
    try {
      const value = JSON.parse(node.textContent || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function readKnowledgeGraph() {
    const node = document.getElementById("location-knowledge-graph-data");
    if (!node) return [];
    try {
      const value = JSON.parse(node.textContent || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function readRepresentativeBuildings() {
    const node = document.getElementById("recommendation-representative-buildings-data");
    if (!node) return {};
    try {
      const value = JSON.parse(node.textContent || "{}");
      return value && typeof value === "object" ? value : {};
    } catch (error) {
      return {};
    }
  }

  function normalizeLocation(location) {
    if (!location || typeof location !== "object") return null;
    const label = String(location.label || "").trim();
    if (!label) return null;
    return {
      label,
      type: String(location.type || "location").trim() || "location",
      city: String(location.city || "").trim(),
      state: String(location.state || "").trim(),
      slug: String(location.slug || "").trim(),
      path: String(location.path || "").trim(),
    };
  }

  function normalizeContext(value) {
    if (!value || typeof value !== "object") return null;
    const locations = Array.isArray(value.locations)
      ? value.locations.map(normalizeLocation).filter(Boolean)
      : [];
    return {
      modelKey: String(value.modelKey || value.model_key || "").trim(),
      locations,
      spaceType: String(value.spaceType || "").trim(),
      size: String(value.size || "").trim(),
      timing: String(value.timing || value.moveTiming || value.move_timing || "").trim(),
      locationIntent: normalizeLocationIntent(value.locationIntent || value.location_intent, "compare"),
      city: String(value.city || "").trim(),
      market: String(value.market || "").trim(),
      businessType: String(value.businessType || value.business_type || "").trim(),
      operationalUse: Array.isArray(value.operationalUse) ? value.operationalUse : Array.isArray(value.operational_use) ? value.operational_use : [],
      officeEnvironment: String(value.officeEnvironment || value.office_environment || "").trim(),
      commuteOrientation: String(value.commuteOrientation || value.commute_orientation || "").trim(),
      expectedGrowth: String(value.expectedGrowth || value.expected_growth || "").trim(),
      institutionProximity: String(value.institutionProximity || value.institution_proximity || "").trim(),
      facts: value.facts && typeof value.facts === "object" ? value.facts : {},
      constraints: value.constraints && typeof value.constraints === "object" ? value.constraints : {},
      priorities: value.priorities && typeof value.priorities === "object" ? value.priorities : {},
      timestamp: String(value.timestamp || "").trim(),
    };
  }

  function normalizeLocationIntent(value, fallback = "compare") {
    const normalized = String(value || "").trim().toLowerCase();
    return ["focus", "compare", "discover"].includes(normalized) ? normalized : fallback;
  }

  function locationIntentLabel(value) {
    const intent = normalizeLocationIntent(value);
    if (intent === "focus") return "Focus my search here";
    if (intent === "discover") return "Recommend the best markets";
    return "Compare with nearby markets";
  }

  function locationIntentCopy(value) {
    const intent = normalizeLocationIntent(value);
    if (intent === "focus") {
      return "Your preferred geography is already well defined. Expert review should focus on the best-fit buildings and submarkets within this area.";
    }
    if (intent === "discover") {
      return "The strongest starting markets are based on your business profile and priorities.";
    }
    return "Your selected location anchors the recommendation, with nearby markets included when they may also fit your requirements.";
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node && value) node.textContent = value;
  }

  function setHidden(selector, hidden) {
    const node = document.querySelector(selector);
    if (node) node.hidden = hidden;
  }

  function setAllHidden(selector, hidden) {
    document.querySelectorAll(selector).forEach((node) => {
      node.hidden = hidden;
    });
  }

  function clearNode(selector) {
    const node = document.querySelector(selector);
    if (node) node.innerHTML = "";
    return node;
  }

  function createElement(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function fetchBuildingHeroPhoto(subjectId) {
    if (!subjectId || !window.fetch) return Promise.resolve(null);
    const key = `building:${subjectId}`;
    if (!buildingPhotoRequests.has(key)) {
      const params = new URLSearchParams({ subjectType: "building", subjectId });
      buildingPhotoRequests.set(key, fetch(`/api/field-photos/hero?${params.toString()}`, { credentials: "omit" })
        .then((response) => response.ok ? response.json() : null)
        .then((data) => data && data.ok ? data.photo : null)
        .catch(() => null));
    }
    return buildingPhotoRequests.get(key);
  }

  function hydrateBuildingCardImage(image, subjectId) {
    fetchBuildingHeroPhoto(subjectId).then((photo) => {
      if (!photo || !photo.imageUrl) return;
      image.src = photo.imageUrl;
      if (photo.altText) image.alt = photo.altText;
      image.dataset.buildingPhotoLoaded = "true";
    });
  }

  function trackRecommendationEvent(eventName, properties = {}) {
    const payload = {
      event_name: eventName,
      context: {
        page_url: window.location.href,
        source: "recommendations",
        ...properties,
      },
    };
    try {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon("/api/analytics/search-profile", blob)) return;
      }
      if (window.fetch) {
        fetch("/api/analytics/search-profile", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (error) {
      // Recommendation analytics are non-critical.
    }
  }

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
    if (key.includes("industrial")) return "industrial";
    if (key.includes("retail")) return "retail";
    if (key.includes("medical")) return "medical";
    if (key.includes("flex")) return "flex";
    if (key === "r_d" || key.includes("r_and_d")) return "r_and_d";
    if (key.includes("coworking")) return "coworking";
    return key || "office";
  }

  function formatLocations(locations) {
    if (!locations.length) return "Your selected market";
    return locations.map((location) => location.label).join(" / ");
  }

  function formatSize(value) {
    return String(value || "Size to confirm").replace(/\bsqft\b/gi, "SF");
  }

  function titleizeToken(value) {
    return String(value || "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function businessTypeLabel(value) {
    const labels = {
      professional_services: "Professional Services",
      technology: "Technology / Product",
      design_creative: "Design / Creative",
      life_science: "Healthcare / Life Science",
      nonprofit: "Nonprofit / Mission-Driven",
      mission_driven: "Mission-Driven",
    };
    return labels[String(value || "").trim()] || titleizeToken(value);
  }

  function operationalUseLabel(value) {
    const labels = {
      client_meetings: "Client-Facing",
      team_collaboration: "Team Collaboration",
      recruiting: "Recruiting",
      quiet_focused_work: "Quiet Focused Work",
      showroom_presentation: "Showroom / Presentation",
      lab_rd_adjacency: "UCSF / R&D Adjacency",
    };
    return labels[String(value || "").trim()] || titleizeToken(value);
  }

  function environmentLabel(value) {
    return titleizeToken(String(value || "").replace(/^not sure yet$/i, ""));
  }

  function commuteLabel(value) {
    const key = String(value || "").trim().toLowerCase().replace(/[_-]+/g, " ");
    if (!key || key === "mixed local") return "";
    if (key === "peninsula south bay") return "Peninsula / South Bay Commute";
    return `${titleizeToken(value)} Commute`;
  }

  function growthLabel(value) {
    const key = String(value || "").trim().toLowerCase();
    if (key === "significant" || key === "high") return "Growing Team";
    if (key === "some" || key === "medium") return "Some Growth";
    if (key === "low") return "Stable Team";
    return titleizeToken(value);
  }

  function profileChips(context) {
    const location = formatLocations(context.locations || []);
    const chips = [
      location && location !== "Your selected market" ? location : context.market || context.city || "",
      context.spaceType,
      businessTypeLabel(context.businessType),
      ...((context.operationalUse || []).map(operationalUseLabel)),
      environmentLabel(context.officeEnvironment),
      commuteLabel(context.commuteOrientation),
      growthLabel(context.expectedGrowth),
      context.institutionProximity && context.institutionProximity !== "not_applicable" ? `Near ${context.institutionProximity}` : "",
    ];
    return Array.from(new Set(chips.map((chip) => String(chip || "").trim()).filter(Boolean))).slice(0, 9);
  }

  function renderProfileChips(context) {
    const node = clearNode("[data-location-brief-profile-chips]");
    if (!node) return;
    const chips = profileChips(context);
    (chips.length ? chips : ["San Francisco", "Office"]).forEach((chip) => {
      node.appendChild(createElement("span", "", chip));
    });
  }

  function bestFitItems(state, context, profiles) {
    const indexes = profileIndexes(profiles || []);
    const bySlug = (item) => {
      const profile = profileBySlug(item.slug || item.districtId || item.label, indexes);
      return profile ? recommendationItem(profile, context.spaceType || "Office") : null;
    };
    const items = [];
    const add = (item) => {
      if (!item || !item.label) return;
      if (items.some((existing) => slugKey(existing.slug || existing.label) === slugKey(item.slug || item.label))) return;
      const enriched = bySlug(item) || item;
      items.push({
        ...enriched,
        label: item.label || enriched.label,
        slug: item.slug || enriched.slug,
        path: item.path || enriched.path || "",
        city: item.city || enriched.city || "San Francisco",
        state: item.state || enriched.state || "CA",
        fitLabel: enriched.fitLabel || (items.length === 0 ? "Excellent Fit" : "Strong Fit"),
        summary: enriched.summary || item.reason || item.alternativeRationale || `${item.label} is a useful place to begin from this Business Profile.`,
        strengths: enriched.strengths || [],
        tradeoffs: enriched.tradeoffs || [],
        bestFor: enriched.bestFor || [],
        questionsToValidate: enriched.questionsToValidate || [],
      });
    };

    (state.recommendedPath || []).forEach(add);
    if (state.primaryRecommendation) add(state.primaryRecommendation);
    (state.compareWith || []).forEach(add);
    return items.slice(0, 3);
  }

  function fitConfidenceLabel(index, item, state) {
    if (index === 0 && state.confidenceLabel && state.confidenceLabel !== "Sample") return "Excellent Fit";
    if (item.fitLabel && !/\d/.test(item.fitLabel)) return item.fitLabel;
    return index === 0 ? "Excellent Fit" : "Strong Fit";
  }

  function fitReasons(item) {
    const reasons = [
      ...(item.strengths || []),
      ...(item.bestFor || []),
    ].filter(Boolean);
    return Array.from(new Set(reasons)).slice(0, 3);
  }

  function fallbackReason(item, index) {
    const fallbacks = [
      "Matches the Business Profile direction.",
      "Useful district to compare before touring.",
      "Supported by Rofo district guidance.",
    ];
    return fallbacks[index] || `${item.label} helps explain the location decision.`;
  }

  function renderBestFits(state, context, profiles) {
    const node = clearNode("[data-location-brief-best-fits]");
    if (!node) return [];
    const fits = bestFitItems(state, context, profiles);
    fits.forEach((item, index) => {
      const card = createElement("article", "location-brief-fit-card", "");
      const button = createElement("button", "location-brief-fit-card__button", "");
      button.type = "button";
      button.setAttribute("data-location-brief-fit-index", String(index));
      button.setAttribute("aria-expanded", index === 0 ? "true" : "false");
      button.appendChild(createElement("span", "location-brief-fit-card__confidence", fitConfidenceLabel(index, item, state)));
      button.appendChild(createElement("h3", "", item.label));
      button.appendChild(createElement("p", "", item.summary));
      const list = createElement("ul", "location-brief-fit-card__reasons", "");
      const reasons = fitReasons(item);
      [0, 1, 2].forEach((reasonIndex) => {
        list.appendChild(createElement("li", "", reasons[reasonIndex] || fallbackReason(item, reasonIndex)));
      });
      button.appendChild(list);
      button.addEventListener("click", () => {
        renderDistrictDetail(fits, index);
        document.querySelectorAll("[data-location-brief-fit-index]").forEach((fitButton) => {
          fitButton.setAttribute("aria-expanded", String(fitButton === button));
        });
      });
      card.appendChild(button);
      node.appendChild(card);
    });
    renderDistrictDetail(fits, 0);
    return fits;
  }

  function districtDetailItems(item) {
    const items = [
      ["Office character", item.summary],
      ["Commercial advantages", (item.strengths || []).slice(0, 2).join(" ")],
      ["Tradeoffs", (item.tradeoffs || []).slice(0, 2).join(" ")],
      ["Best suited for", (item.bestFor || []).slice(0, 2).join(" ")],
    ];
    return items.filter(([, value]) => String(value || "").trim());
  }

  function renderDistrictDetail(fits, activeIndex = 0) {
    const node = clearNode("[data-location-brief-district-detail-grid]");
    if (!node || !fits.length) return;
    const item = fits[activeIndex] || fits[0];
    const article = createElement("article", "location-brief-district-detail__panel", "");
    article.appendChild(createElement("h3", "", item.label));
    districtDetailItems(item).forEach(([label, value]) => {
      const section = createElement("section", "", "");
      section.appendChild(createElement("h4", "", label));
      section.appendChild(createElement("p", "", value));
      article.appendChild(section);
    });
    if (item.path) {
      const link = createElement("a", "location-brief-text-link", "Explore district page");
      link.href = item.path;
      article.appendChild(link);
    }
    node.appendChild(article);
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
    return `${profile.label} is a relevant commercial location to review against your Business Profile.`;
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

  function expertReviewHref(context) {
    const locations = formatLocations(context.locations || []);
    const subject = encodeURIComponent(`Rofo live market review: ${locations}`);
    const body = encodeURIComponent([
      "I'd like a live market review for my Rofo Business Profile.",
      "",
      `Location: ${locations}`,
      `Space: ${context.spaceType || "Not specified"}`,
      `Size: ${formatSize(context.size)}`,
    ].join("\n"));
    return `mailto:hello@rofo.com?subject=${subject}&body=${body}`;
  }

  function compareRelationships(profile) {
    if (profile && profile.relationships && Array.isArray(profile.relationships.compareWith)) {
      return profile.relationships.compareWith;
    }
    return Array.isArray(profile && profile.compareWith) ? profile.compareWith : [];
  }

  function resolveMarketPath(context, graphNodes, fallbackProfiles) {
    if (window.RofoRecommendationResolver && typeof window.RofoRecommendationResolver.resolveMarketPath === "function") {
      return window.RofoRecommendationResolver.resolveMarketPath(context, graphNodes, fallbackProfiles);
    }

    const graphIndexes = profileIndexes(graphNodes || []);
    const fallbackIndexes = profileIndexes(fallbackProfiles || []);
    const locations = context.locations || [];
    const inputLocation = locations[0] || null;
    const locationIntent = normalizeLocationIntent(context.locationIntent || context.location_intent, "compare");
    if (!inputLocation) {
      return {
        mode: "demo",
        title: "Sample Recommendation",
        confidenceLabel: "Sample",
        primaryLocationLabel: "Mission Bay",
        summaryCopy: "This is a sample recommendation. Start a Business Profile to see recommendations based on your requirements.",
        ctaLabel: "Start Live Market Review",
        ctaHref: "/find-locations/",
        recommendedPath: [],
        compareWith: [],
        questionsToValidate: [],
      };
    }

    const inputProfile = findProfileForLocation(inputLocation, graphIndexes)
      || findProfileForLocation(inputLocation, fallbackIndexes);
    const activeIndexes = findProfileForLocation(inputLocation, graphIndexes) ? graphIndexes : fallbackIndexes;
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
        locationIntent,
        intentCopy: locationIntentCopy(locationIntent),
        summaryCopy: locationIntent === "focus"
          ? `${inputLocation.label} is your preferred geography. Expert review should validate buildings, submarkets, and nearby contingency options within or close to this area.`
          : inputProfile
          ? `${inputLocation.label} is a relevant starting point, but this market needs additional review because Rofo's recommendation graph is still lighter here.`
          : "This market needs additional review before Rofo can provide a stronger location path.",
        ctaLabel: "Request Live Market Review",
        ctaHref: expertReviewHref(context),
      };
    }

    const marketPathProfiles = Array.isArray(inputProfile.marketPath)
      ? inputProfile.marketPath.map((slug) => profileBySlug(slug, activeIndexes)).filter(Boolean)
      : [];
    const mode = locationIntent !== "focus" && inputProfile.type === "city" && marketPathProfiles.length ? "market_path" : "single_starting_point";
    const recommendedPath = (mode === "market_path" ? marketPathProfiles : [inputProfile])
      .map((profile) => recommendationItem(profile, context.spaceType));
    const primaryRecommendation = recommendedPath[0] || recommendationItem(inputProfile, context.spaceType);
    const compareWith = compareRelationships(inputProfile)
      .map((item) => {
        const profile = profileBySlug(item.slug, activeIndexes);
        return {
          label: item.label || (profile && profile.label) || item.slug,
          slug: item.slug || (profile && profile.slug) || "",
          reason: item.reason || "",
          alternativeRationale: item.reason
            ? `${item.label || (profile && profile.label) || item.slug} may be relevant as a comparison or contingency because ${item.reason}`
            : "This may be relevant as a comparison or contingency if the preferred area does not support the search.",
          relationshipType: item.relationshipType || "similar",
          path: (profile && profile.path) || item.path || "",
        };
      }).filter((item) => item.label);

    return {
      mode,
      title: mode === "market_path" ? "Recommended Market Path" : "Relevant Starting Point",
      confidenceLabel: confidenceLabel(inputProfile.confidence),
      locationIntent,
      intentCopy: locationIntentCopy(locationIntent),
      inputLocation,
      primaryLocationLabel: primaryRecommendation.label,
      primaryRecommendation,
      recommendedPath,
      compareWith,
      questionsToValidate: primaryRecommendation.questionsToValidate || [],
      summaryCopy: locationIntent === "focus"
        ? `${inputProfile.label} is the target geography for this search. Expert review should focus on buildings, submarkets, availability, and fit within this area before widening the search.`
        : locationIntent === "discover"
        ? `${inputProfile.label} gives the search a starting point, while keeping the recommendation open to the strongest supported markets for this business profile.`
        : mode === "market_path"
        ? `${inputProfile.label} has several commercial districts that fit different versions of your search. Start by comparing the strongest path before looking at individual buildings.`
        : `${inputProfile.label} appears to be a relevant starting point based on your profile.`,
      ctaLabel: "Request Live Market Review",
      ctaHref: expertReviewHref(context),
    };
  }

  function locationDescriptor(location) {
    if (!location) return "market";
    if (location.type === "district") return "district";
    if (location.type === "city") return "city";
    return "market";
  }

  function renderHeroRecommendationPath(state, primaryLabel, compareLabels) {
    const node = clearNode("[data-location-brief-hero-path]");
    if (!node) return;
    const path = state.recommendedPath && state.recommendedPath.length
      ? state.recommendedPath.map((item) => item.label).filter(Boolean)
      : [primaryLabel, ...compareLabels].filter(Boolean);
    const fallback = primaryLabel ? [primaryLabel] : ["Recommended location to confirm"];
    (path.length ? path : fallback).slice(0, 3).forEach((label) => {
      node.appendChild(createElement("li", "", label));
    });
  }

  function renderContext(context) {
    const graph = readKnowledgeGraph();
    const profiles = readRecommendationProfiles();
    const state = resolveMarketPath(context, graph, profiles);
    const locationText = formatLocations(context.locations || []);
    const spaceText = context.spaceType || "Commercial space";
    setSubmittedCta(state, context);

    if (state.mode === "expert_guided") {
      renderProfileChips(context);
      renderExpertGuided(state, context);
      initializeBriefRefinement(state, context, spaceText);
      return;
    }

    renderProfileChips(context);
    const fits = renderBestFits(state, context, profiles);
    const fitNames = fits.map((item) => item.label).filter(Boolean);
    const primaryLabel = fitNames[0] || state.primaryLocationLabel || locationText;
    const comparisonNames = fitNames.slice(1);
    const profilePhrase = profileChips(context)
      .filter((chip) => chip !== locationText && chip !== spaceText)
      .slice(0, 4)
      .join(", ");

    setText(
      "[data-location-brief-summary-copy-one]",
      fitNames.length > 1
        ? `Based on your Business Profile, ${fitNames.join(", ")} are the strongest places to begin your ${spaceText.toLowerCase()} search.`
        : `Based on your Business Profile, ${primaryLabel} is the strongest place to begin your ${spaceText.toLowerCase()} search.`
    );
    setText(
      "[data-location-brief-summary-copy-two]",
      profilePhrase
        ? `Your emphasis on ${profilePhrase} points toward these districts before the search narrows to individual buildings, availability, and lease economics.`
        : "This gives the search a clear starting point before the market is validated against specific buildings, availability, and lease economics."
    );
    setText(
      "[data-location-brief-comparative-copy]",
      comparisonNames.length
        ? `If beginning tours this week, start by testing ${primaryLabel}. Compare ${comparisonNames.join(" and ")} if the Business Profile shifts toward a different office character, commute pattern, or building environment.`
        : `If beginning tours this week, start by testing ${primaryLabel}. A broker should validate specific buildings, availability, and lease economics before committing to that direction.`
    );

    initializeBriefRefinement(state, context, spaceText);
    renderRepresentativeBuildings(fits, state);
  }

  function setSubmittedCta(state, context) {
    setText("[data-recommendation-cta-kicker]", "Next Steps");
    setText("[data-recommendation-cta-heading]", "Discuss this recommendation with a broker.");
    setText(
      "[data-recommendation-cta-copy]",
      "Share your Business Profile and Location Brief with a local expert who can recommend specific buildings and help plan tours."
    );
    const button = document.querySelector("[data-location-brief-submit-button]");
    if (button) button.textContent = "Discuss This Recommendation With a Broker";
    const link = document.querySelector("[data-recommendation-cta-link]");
    if (link) {
      link.href = state.ctaHref || expertReviewHref(context);
      link.textContent = state.ctaLabel || "Request Live Market Review";
      link.setAttribute("data-location-brief-review-trigger", "");
    }
  }

  function renderLocationBriefSuccess(status, result) {
    if (!status) return;
    status.textContent = "";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.classList.add("location-brief-contact-status--success");
    const isInvestigation = currentBriefState && currentBriefState.liveMarketInvestigation && currentBriefState.liveMarketInvestigation.investigationIntent;
    const investigation = isInvestigation ? currentBriefState.liveMarketInvestigation : null;
    status.appendChild(createElement("strong", "", isInvestigation ? "Your live market review request has been received." : "Your Location Brief has been sent."));
    if (investigation) {
      const selectedCount = (investigation.representativeBuildings || []).filter((building) => building.selected !== false).length;
      const detail = [
        investigation.districtName ? `District: ${investigation.districtName}` : "",
        `${selectedCount} representative building${selectedCount === 1 ? "" : "s"} selected`,
        investigation.includeCompetitiveBuildings !== false ? "competitive buildings included" : "",
      ].filter(Boolean).join(" · ");
      if (detail) status.appendChild(createElement("span", "", detail));
      const confirmation = result.confirmationEmail || investigation.confirmationEmail || {};
      if (currentBriefState.contact && currentBriefState.contact.email) {
        status.appendChild(createElement(
          "span",
          "",
          confirmation.sent ? `Confirmation sent to ${currentBriefState.contact.email}.` : `Request received. Confirmation email may follow at ${currentBriefState.contact.email}.`
        ));
      }
      status.appendChild(createElement("span", "", "Rofo will review available coverage before any live-market research or broker guidance is confirmed."));
    }
    if (result.publicId) {
      status.appendChild(createElement("span", "", `Brief ID: ${result.publicId}`));
    }
    if (result.url) {
      const link = createElement("a", "", "View Location Brief");
      link.href = result.url;
      status.appendChild(link);

      const copyButton = createElement("button", "location-brief-copy-link", "Copy Link");
      copyButton.type = "button";
      copyButton.addEventListener("click", async () => {
        try {
          const copyUrl = new URL(result.url, window.location.origin).toString();
          await navigator.clipboard.writeText(copyUrl);
          copyButton.textContent = "Link copied";
        } catch (error) {
          copyButton.textContent = "Copy unavailable";
        }
      });
      status.appendChild(copyButton);
      return;
    }
    status.appendChild(createElement("span", "", "Your brief has been submitted for live market review."));
  }

  function renderExpertGuided(state, context) {
    const locationText = formatLocations(context.locations || []);
    setText(
      "[data-location-brief-summary-copy-one]",
      `Rofo has enough Business Profile context to prepare a Location Brief for ${state.primaryLocationLabel || locationText}.`
    );
    setText(
      "[data-location-brief-summary-copy-two]",
      `${state.summaryCopy || "This market needs live review before Rofo can provide a stronger district recommendation."} A broker should validate specific buildings, availability, and lease economics.`
    );
    setText(
      "[data-location-brief-comparative-copy]",
      "Use this brief as the starting context for a live market review. Rofo should validate the preferred geography first, then compare nearby alternatives if the market does not support the Business Profile."
    );
    renderBestFits({
      ...state,
      recommendedPath: state.primaryRecommendation ? [state.primaryRecommendation] : [],
      compareWith: [],
    }, context, readRecommendationProfiles());
  }

  function renderMarketPath(state, spaceText, sizeText) {
    const primary = state.primaryRecommendation;
    if (!primary) return;
    const descriptor = locationDescriptor(primary);
    const locationIntent = normalizeLocationIntent(state.locationIntent, "compare");
    const matchedPriorities = primary.matchedPriorities && primary.matchedPriorities.length
      ? primary.matchedPriorities
      : primary.strengths || [];
    const validationFocus = primary.validationFocus && primary.validationFocus.length
      ? primary.validationFocus
      : primary.questionsToValidate || [];
    const compareText = state.mode === "market_path"
      ? "This is a market path, not a final answer. Use it to compare district fit before investigating live building options."
      : "Pressure-test nearby alternatives to see whether commute patterns, pricing, or building options justify expanding the search.";

    renderPathPanels(state, spaceText);
    renderAttributeGuidance(primary, spaceText);
    setText("[data-recommendation-section-kicker]", "Recommendation Summary");
    setText("[data-recommendation-status]", "Recommended Starting Point");
    setText("[data-recommendation-fit-label]", state.title || "Relevant Starting Point");
    setText("[data-recommendation-judgment-label]", "Recommended start");
    setText("[data-recommendation-confidence-label]", state.confidenceLabel || "Medium Confidence");
    setText("[data-recommendation-primary-name]", primary.label);
    setText(
      "[data-recommendation-section-heading]",
      state.mode === "market_path" ? "Begin with this market path." : `Start with ${primary.label}, then pressure-test alternatives.`
    );
    setText("[data-recommendation-strategy]", `${primary.selectionRationale || state.summaryCopy} ${primary.alternativeRationale || compareText}`);
    setText(
      "[data-recommendation-primary-advice]",
      primary.selectionRationale || `${primary.label} is the recommended starting point. ${primary.summary || `Use this ${descriptor} to guide a focused review of available ${spaceText.toLowerCase()} options.`}`
    );
    setText(
      "[data-recommendation-primary-note]",
      locationIntent === "focus"
        ? `${primary.label} should be treated as the target geography. Nearby alternatives should only be reviewed if availability, pricing, or fit inside the area does not support the search.`
        : primary.alternativeRationale || `${primary.label} should not be treated as the only answer. Use it as the baseline for a local market review, then compare alternatives against your location, space, and size requirements.`
    );
    setText("[data-recommendation-explainer-heading]", `Why ${primary.label} ranks first`);
    setText("[data-recommendation-rationale-one]", matchedPriorities[0] ? `Profile signal: ${matchedPriorities[0]}.` : `Your requested ${spaceText.toLowerCase()} search gives enough context to start with a focused ${descriptor}.`);
    setText("[data-recommendation-rationale-two]", matchedPriorities[1] ? `Profile signal: ${matchedPriorities[1]}.` : `${primary.label} has structured commercial location guidance in Rofo's knowledge graph.`);
    setText("[data-recommendation-rationale-three]", validationFocus[0] ? `Validation focus: ${validationFocus[0]}` : `The ${sizeText} size range helps narrow which building types should be investigated first.`);
    setText(
      "[data-recommendation-rationale-four]",
      validationFocus[1]
        ? `Validation focus: ${validationFocus[1]}`
        : primary.strengths && primary.strengths.length
        ? `Key strengths include ${primary.strengths.slice(0, 3).join(", ")}.`
        : "The location profile gives a useful starting point without assuming live availability."
    );
    setText("[data-recommendation-rationale-five]", validationFocus[2] ? `Validation focus: ${validationFocus[2]}` : "A local market check can compare credible options before narrowing the search.");
    setText("[data-recommendation-tradeoff-one]", primary.tradeoffSummary || (primary.tradeoffs && primary.tradeoffs[0]) || "This is a starting recommendation, not a final building decision.");
    setText("[data-recommendation-tradeoff-two]", primary.tradeoffs && primary.tradeoffs[1] ? primary.tradeoffs[1] : "Live availability, pricing, and lease terms still need to be verified.");
    setText("[data-recommendation-tradeoff-three]", primary.tradeoffs && primary.tradeoffs[2] ? primary.tradeoffs[2] : "Nearby markets may prove stronger once commute, budget, and timing are reviewed.");
    setText("[data-recommendation-fit-one]", primary.bestFor && primary.bestFor[0] ? primary.bestFor[0] : `${spaceText} users looking for a focused market starting point.`);
    setText("[data-recommendation-fit-two]", primary.bestFor && primary.bestFor[1] ? primary.bestFor[1] : `Teams in the ${sizeText} range that want to compare realistic building options.`);
    setText("[data-recommendation-fit-three]", primary.bestFor && primary.bestFor[2] ? primary.bestFor[2] : "Businesses that want local guidance before reviewing live availability.");
    setText("[data-recommendation-fit-four]", primary.bestFor && primary.bestFor[3] ? primary.bestFor[3] : "Decision-makers who want to pressure-test nearby alternatives before committing to one market.");
    setText(
      "[data-recommendation-confidence-copy]",
      `${state.confidenceLabel} means ${primary.label} has structured recommendation metadata in Rofo's Commercial Location Graph and your profile includes the key starting inputs: location, space type, and size. It does not mean Rofo has scored live availability yet.`
    );

    const primaryLink = document.querySelector("[data-recommendation-primary-link]");
    if (primaryLink) {
      primaryLink.href = primary.path;
      primaryLink.textContent = primary.type === "city" ? "Explore City" : "Explore District";
      primaryLink.addEventListener("click", () => {
        trackRecommendationEvent("district_guide_clicked_from_recommendation", {
          city: primary.city,
          district: primary.label,
          recommendation_rank: 1,
        });
      }, { once: true });
    }

    renderRepresentativeBuildings(primary, state);
  }

  function renderRepresentativeBuildings(fits, state) {
    const module = document.querySelector("[data-location-brief-representative-buildings]");
    const groupsNode = clearNode("[data-location-brief-building-groups]");
    if (!module || !groupsNode || !fits.length) return;
    const data = readRepresentativeBuildings();
    let shownCount = 0;
    let primaryBuildings = [];

    fits.forEach((fit, fitIndex) => {
      const result = window.RofoRecommendationRepresentativeBuildings && typeof window.RofoRecommendationRepresentativeBuildings.resolveForDistrict === "function"
        ? window.RofoRecommendationRepresentativeBuildings.resolveForDistrict(fit, data)
        : { shown: false, buildings: [] };
      if (!result.shown || !result.buildings.length) return;
      shownCount += result.buildings.length;
      if (fitIndex === 0) primaryBuildings = result.buildings;

      const group = createElement("article", "location-brief-building-group", "");
      group.appendChild(createElement("h3", "", fit.label));
      const list = createElement("div", "recommendation-building-list", "");
      result.buildings.slice(0, 3).forEach((building, index) => {
        list.appendChild(representativeBuildingCard(building, fit, index));
      });
      group.appendChild(list);
      groupsNode.appendChild(group);
    });

    module.hidden = shownCount === 0;
    if (fits[0]) {
      updateInvestigationContext(fits[0], state, primaryBuildings);
      trackRecommendationEvent("representative_buildings_viewed", {
        city: fits[0].city,
        district: fits[0].label,
        building_count: shownCount,
        building_ids: primaryBuildings.map((building) => building.buildingId),
      });
    }
  }

  function representativeBuildingCard(building, primary, index) {
    const card = createElement("article", "recommendation-building-card recommendation-building-card--representative");
    if (building.image || building.fieldPhotoSubjectId) {
      const image = createElement("img", "", "");
      image.src = building.image || "/images/placeholders/building-c.svg";
      image.alt = `${building.name} in ${building.city}, ${building.state}`;
      if (building.fieldPhotoSubjectId) {
        image.dataset.buildingPhotoSubjectId = building.fieldPhotoSubjectId;
        hydrateBuildingCardImage(image, building.fieldPhotoSubjectId);
      }
      image.loading = "lazy";
      image.decoding = "async";
      card.appendChild(image);
      const credit = createElement("p", "recommendation-building-card__credit", "");
      credit.dataset.buildingPhotoCredit = "";
      credit.hidden = true;
      card.appendChild(credit);
    }
    const content = createElement("div", "recommendation-building-card__content");
    const meta = createElement("span", "", `${building.address} · ${building.buildingType || building.districtName || primary.label}`);
    const heading = createElement("h5", "", "");
    const link = createElement("a", "", `View Building Brief: ${building.name}`);
    link.href = building.canonicalUrl;
    link.addEventListener("click", () => {
      trackRecommendationEvent("representative_building_clicked", {
        city: building.city,
        district: primary.label,
        building_id: building.buildingId,
        building_name: building.name,
        recommendation_rank: 1,
        card_position: index + 1,
      });
    });
    heading.appendChild(link);
    content.append(meta, heading);
    content.appendChild(labelledCardText("Why it matters", building.representativeReason));
    content.appendChild(labelledCardText("Best for", building.bestFitSummary));
    content.appendChild(labelledCardText("Tradeoff", building.primaryTradeoff));
    card.appendChild(content);
    return card;
  }

  function labelledCardText(label, text) {
    const paragraph = createElement("p", "", "");
    paragraph.appendChild(createElement("strong", "", label));
    paragraph.appendChild(document.createTextNode(text));
    return paragraph;
  }

  function updateInvestigationContext(primary, state, buildings) {
    if (!currentBriefState) return;
    const existing = currentBriefState.liveMarketInvestigation || {};
    const existingSelections = new Map(
      (Array.isArray(existing.representativeBuildings) ? existing.representativeBuildings : [])
        .map((building) => [String(building.buildingId || building.name || ""), building.selected !== false])
    );
    const normalizedBuildings = (buildings || []).map((building) => {
      const key = String(building.buildingId || building.name || "");
      return {
        buildingId: building.buildingId || "",
        name: building.name || "",
        url: building.canonicalUrl || building.url || "",
        selected: existingSelections.has(key) ? existingSelections.get(key) : true,
      };
    }).filter((building) => building.name && building.url);
    currentBriefState.liveMarketInvestigation = {
      ...existing,
      intent: "live_market_investigation",
      investigationIntent: existing.investigationIntent === true,
      investigationStatus: existing.investigationStatus || "draft",
      source: "recommendation_representative_buildings",
      investigationSource: "recommendation_representative_buildings",
      city: primary.city || "",
      state: primary.state || "",
      districtId: primary.slug || "",
      districtName: primary.label || "",
      districtPath: primary.path || "",
      representativeBuildings: normalizedBuildings,
      includeCompetitiveBuildings: existing.includeCompetitiveBuildings !== false,
      investigationScope: existing.investigationScope || {
        currentAvailability: true,
        futureAvailability: true,
        comparableBuildings: true,
        leasingActivity: false,
        marketInsight: false,
        brokerGuidance: false,
      },
      timing: existing.timing || "",
      confirmedRequirements: existing.confirmedRequirements || {},
      additionalNotes: existing.additionalNotes || "",
      brokerPreference: existing.brokerPreference || "research_first",
      ctaSource: existing.ctaSource || "recommendation_district_detail",
      submissionToken: existing.submissionToken || investigationSubmissionToken(),
      duplicateRetryCount: existing.duplicateRetryCount || 0,
      confirmationEmail: existing.confirmationEmail || null,
    };
    persistBriefState();
  }

  function investigationState() {
    if (!currentBriefState) return null;
    if (!currentBriefState.liveMarketInvestigation) {
      currentBriefState.liveMarketInvestigation = {
        intent: "live_market_investigation",
        investigationIntent: false,
        investigationStatus: "draft",
        source: "recommendation_representative_buildings",
        investigationSource: "recommendation_representative_buildings",
        city: "",
        state: "",
        districtId: "",
        districtName: "",
        districtPath: "",
        representativeBuildings: [],
        includeCompetitiveBuildings: true,
        investigationScope: {
          currentAvailability: true,
          futureAvailability: true,
          comparableBuildings: true,
          leasingActivity: false,
          marketInsight: false,
          brokerGuidance: false,
        },
        timing: "",
        confirmedRequirements: {},
        additionalNotes: "",
        brokerPreference: "research_first",
        ctaSource: "recommendation_district_detail",
        submissionToken: investigationSubmissionToken(),
        duplicateRetryCount: 0,
        confirmationEmail: null,
      };
    }
    return currentBriefState.liveMarketInvestigation;
  }

  function timingFromProfile() {
    const profile = currentBriefState && currentBriefState.searchProfile || {};
    return String(profile.timing || profile.moveTiming || profile.move_timing || "").trim();
  }

  function investigationRequirements() {
    const profile = currentBriefState && currentBriefState.searchProfile || {};
    const marketPath = currentBriefState && currentBriefState.marketPath || {};
    const location = formatLocations(profile.locations || []);
    return {
      location,
      spaceType: profile.spaceType || "",
      targetSize: profile.size || "",
      timing: timingFromProfile(),
      locationIntent: locationIntentLabel(profile.locationIntent || marketPath.locationIntent || ""),
      priorities: Array.isArray(currentBriefState && currentBriefState.priorities) ? currentBriefState.priorities : [],
      knownConstraints: currentBriefState && currentBriefState.notes || "",
    };
  }

  function renderDefinitionRows(node, rows) {
    if (!node) return;
    node.innerHTML = "";
    rows.filter((row) => row && row.value).forEach((row) => {
      const wrapper = createElement("div", "", "");
      wrapper.appendChild(createElement("dt", "", row.label));
      wrapper.appendChild(createElement("dd", "", row.value));
      node.appendChild(wrapper);
    });
  }

  function renderInvestigationIntake({ activate = false } = {}) {
    const panel = document.querySelector("[data-live-market-investigation-intake]");
    if (!panel || !currentBriefState) return;
    const investigation = investigationState();
    if (activate) {
      investigation.investigationIntent = true;
      investigation.investigationStatus = "draft";
      investigation.requestedAt = "";
    }
    panel.hidden = !investigation.investigationIntent;
    if (!investigation.investigationIntent) return;

    const requirements = investigationRequirements();
    investigation.confirmedRequirements = {
      spaceType: requirements.spaceType,
      targetSize: requirements.targetSize,
      profileTiming: requirements.timing,
      locationPriorities: requirements.priorities,
      knownConstraints: requirements.knownConstraints,
    };

    setText("[data-live-market-intake-heading]", `Review ${investigation.districtName || investigation.city || "this market"}`);
    setText(
      "[data-live-market-intake-summary]",
      `Rofo already has the Business Profile and recommended ${investigation.districtName || "this district"} as the next market to review. These are representative buildings, not confirmed availability.`
    );
    setText("[data-live-market-intake-city]", [investigation.city, investigation.state].filter(Boolean).join(", ") || "To confirm");
    setText("[data-live-market-intake-district]", investigation.districtName || "District-level review");
    setText(
      "[data-live-market-intake-profile]",
      [requirements.spaceType, requirements.targetSize, requirements.timing || "timing to confirm"].filter(Boolean).join(" · ") || "Profile details preserved"
    );
    renderDefinitionRows(document.querySelector("[data-live-market-requirements]"), [
      { label: "Original location", value: requirements.location },
      { label: "Space type", value: requirements.spaceType },
      { label: "Approx. size", value: requirements.targetSize },
      { label: "Timing from profile", value: requirements.timing || "Confirm below" },
      { label: "Location intent", value: requirements.locationIntent },
      { label: "Selected priorities", value: requirements.priorities.join(", ") },
      { label: "Known constraints", value: requirements.knownConstraints },
    ]);

    const buildingOptions = clearNode("[data-live-market-building-options]");
    const buildingFieldset = document.querySelector("[data-live-market-building-fieldset]");
    if (buildingOptions) {
      const buildings = Array.isArray(investigation.representativeBuildings) ? investigation.representativeBuildings : [];
      if (!buildings.length) {
        buildingOptions.appendChild(createElement("p", "live-market-muted", "No individual representative buildings were shown for this district. Rofo can still investigate the district and competitive buildings."));
      }
      buildings.forEach((building, index) => {
        const label = createElement("label", "live-market-building-option", "");
        const input = createElement("input", "", "");
        input.type = "checkbox";
        input.checked = building.selected !== false;
        input.setAttribute("data-investigation-building-id", building.buildingId || building.name);
        input.addEventListener("change", () => {
          building.selected = input.checked;
          persistBriefState();
          trackRecommendationEvent("live_market_investigation_building_toggled", {
            city: investigation.city,
            district: investigation.districtName,
            building_id: building.buildingId || "",
            building_name: building.name || "",
            selected: input.checked,
            card_position: index + 1,
          });
        });
        const span = createElement("span", "", "");
        span.appendChild(createElement("strong", "", building.name));
        span.appendChild(createElement("em", "", "Representative example, not confirmed availability"));
        label.append(input, span);
        buildingOptions.appendChild(label);
      });
    }
    if (buildingFieldset) buildingFieldset.hidden = false;

    const competitive = document.querySelector("[data-investigation-competitive-buildings]");
    if (competitive) {
      competitive.checked = investigation.includeCompetitiveBuildings !== false;
      if (!competitive.dataset.investigationBound) {
        competitive.dataset.investigationBound = "true";
        competitive.addEventListener("change", () => {
          investigation.includeCompetitiveBuildings = competitive.checked;
          persistBriefState();
        });
      }
    }

    document.querySelectorAll("[data-live-market-scope-options] input[type='checkbox']").forEach((input) => {
      input.checked = investigation.investigationScope && investigation.investigationScope[input.value] === true;
      if (!input.dataset.investigationBound) {
        input.dataset.investigationBound = "true";
        input.addEventListener("change", () => {
          investigation.investigationScope = investigation.investigationScope || {};
          investigation.investigationScope[input.value] = input.checked;
          persistBriefState();
          trackRecommendationEvent("live_market_investigation_scope_selected", {
            city: investigation.city,
            district: investigation.districtName,
            scope: input.value,
            selected: input.checked,
          });
        });
      }
    });

    const timing = document.querySelector("[data-live-market-timing]");
    if (timing) {
      timing.value = investigation.timing || "";
      if (!timing.dataset.investigationBound) {
        timing.dataset.investigationBound = "true";
        timing.addEventListener("change", () => {
          investigation.timing = timing.value;
          persistBriefState();
        });
      }
    }

    document.querySelectorAll("[data-live-market-broker-preference] input[type='radio']").forEach((input) => {
      input.checked = (investigation.brokerPreference || "research_first") === input.value;
      if (!input.dataset.investigationBound) {
        input.dataset.investigationBound = "true";
        input.addEventListener("change", () => {
          investigation.brokerPreference = input.value;
          persistBriefState();
        });
      }
    });

    const notes = document.querySelector("[data-live-market-notes]");
    if (notes) {
      notes.value = investigation.additionalNotes || "";
      if (!notes.dataset.investigationBound) {
        notes.dataset.investigationBound = "true";
        notes.addEventListener("input", () => {
          investigation.additionalNotes = notes.value;
          persistBriefState();
        });
      }
    }

    const submitButton = document.querySelector("[data-location-brief-submit-button]");
    if (submitButton) submitButton.textContent = "Start Live Market Review";
    persistBriefState();
  }

  function renderPathPanels(state, spaceType) {
    const grid = document.querySelector("[data-recommendation-brief-grid]");
    if (grid) grid.hidden = false;
    const pathNode = clearNode("[data-recommendation-market-path]");
    const compareNode = clearNode("[data-recommendation-compare-with]");
    const secondaryCompareNode = clearNode("[data-recommendation-compare-with-secondary]");
    const evaluateNode = clearNode("[data-recommendation-evaluate-next]");

    if (pathNode) {
      state.recommendedPath.forEach((item, index) => {
        const card = createElement("article", "recommendation-market-path-card");
        const label = createElement(
          "div",
          "recommendation-market-path-card__label",
          index === 0 ? (state.locationIntent === "focus" ? "Target geography" : "Recommended start") : "Next comparison"
        );
        const title = item.path ? createElement("a", "", item.label) : createElement("strong", "", item.label);
        if (item.path) title.href = item.path;
        const fit = createElement("span", "recommendation-market-path-card__fit", item.fitLabel);
        const summary = createElement("p", "", index === 0 ? (item.selectionRationale || item.summary) : (item.alternativeRationale || item.summary));
        card.append(label, title, fit, summary);
        if (item.tradeoffSummary) {
          card.appendChild(createElement("p", "recommendation-market-path-card__tradeoff", `Tradeoff to understand: ${item.tradeoffSummary}`));
        }
        if (item.strengths && item.strengths.length) {
          const list = createElement("ul", "recommendation-market-path-card__strengths");
          item.strengths.slice(0, 3).forEach((strength) => list.appendChild(createElement("li", "", strength)));
          card.appendChild(list);
        }
        pathNode.appendChild(card);
      });
    }

    const renderCompareItems = (node) => {
      if (!node) return;
      node.hidden = false;
      if (state.compareWith && state.compareWith.length) {
        state.compareWith.slice(0, 4).forEach((item) => {
          const card = createElement("article", "recommendation-compare-card");
          const title = item.path ? createElement("a", "", item.label) : createElement("strong", "", item.label);
          if (item.path) title.href = item.path;
          const reason = createElement(
            "p",
            "",
            item.reason || (state.locationIntent === "focus" ? "Contingency option if availability or fit inside the preferred area does not support the search." : "Worth comparing before narrowing the search.")
          );
          card.append(title, reason);
          node.appendChild(card);
        });
      } else {
        node.appendChild(createElement(
          "p",
          "recommendation-brief-empty",
          state.locationIntent === "focus"
            ? "Review should first validate options inside the preferred area before suggesting nearby contingencies."
            : "Review should identify the right nearby alternatives for this profile."
        ));
      }
    };

    renderCompareItems(compareNode);
    renderCompareItems(secondaryCompareNode);

    if (evaluateNode) {
      const evaluationItems = state.primaryRecommendation && state.primaryRecommendation.validationFocus && state.primaryRecommendation.validationFocus.length
        ? state.primaryRecommendation.validationFocus
        : state.primaryRecommendation && state.primaryRecommendation.questionsToValidate && state.primaryRecommendation.questionsToValidate.length
        ? state.primaryRecommendation.questionsToValidate
        : [
        `Current ${spaceType.toLowerCase()} availability in the recommended market path.`,
        "Asking rents, concessions, and lease structure.",
        "Commute pattern, parking, transit, and client access tradeoffs.",
        "Comparable buildings and nearby alternatives before committing to one market."
      ];
      evaluationItems.forEach((item) => evaluateNode.appendChild(createElement("li", "", item)));
    }
  }

  function meaningfulAttributesFor(spaceType, item) {
    const type = normalizeSpaceType(spaceType);
    const industrialTypes = new Set(["industrial", "warehouse", "distribution", "manufacturing", "flex", "r_and_d"]);
    if (industrialTypes.has(type)) {
      return [
        ["Truck access", item.industrialAttributes.truckAccess],
        ["Highway access", item.industrialAttributes.highwayAccess],
        ["Loading", item.industrialAttributes.loading],
        ["Yard", item.industrialAttributes.yard],
        ["Power", item.industrialAttributes.power],
      ].filter(([, value]) => value && value !== "unknown");
    }
    if (type === "retail" || type === "restaurant" || type === "showroom") {
      return [
        ["Foot traffic", item.retailAttributes.footTraffic],
        ["Customer parking", item.retailAttributes.customerParking],
        ["Street presence", item.retailAttributes.streetPresence],
        ["Signage visibility", item.retailAttributes.signageVisibility],
      ].filter(([, value]) => value && value !== "unknown");
    }
    return [
      ["Transit", item.attributes.transit],
      ["Parking", item.attributes.parking],
      ["Walkability", item.attributes.walkability],
      ["Talent access", item.attributes.talentAccess],
      ["Executive image", item.attributes.executiveImage],
    ].filter(([, value]) => value && value !== "unknown");
  }

  function renderAttributeGuidance(item, spaceType) {
    const attributes = meaningfulAttributesFor(spaceType, item);
    if (!attributes.length) return;
    const existing = document.querySelector("[data-recommendation-attribute-guidance]");
    if (existing) existing.remove();
    const panel = createElement("section", "recommendation-advisor-panel");
    panel.setAttribute("data-recommendation-attribute-guidance", "");
    const type = normalizeSpaceType(spaceType);
    const industrialTypes = new Set(["industrial", "warehouse", "distribution", "manufacturing", "flex", "r_and_d"]);
    const retailTypes = new Set(["retail", "restaurant", "showroom"]);
    let heading = "Location attributes";
    if (industrialTypes.has(type)) heading = "Industrial attributes";
    if (retailTypes.has(type)) heading = "Retail attributes";
    panel.appendChild(createElement("h5", "", heading));
    const list = createElement("ul", "");
    attributes.slice(0, 5).forEach(([label, value]) => {
      list.appendChild(createElement("li", "", `${label}: ${value}`));
    });
    panel.appendChild(list);
    const grid = document.querySelector(".recommendation-advisor-grid");
    if (grid) grid.appendChild(panel);
  }

  function priorityOptionsFor(spaceType) {
    const type = normalizeSpaceType(spaceType);
    const industrialTypes = new Set(["industrial", "warehouse", "distribution", "manufacturing", "flex", "r_and_d"]);
    if (industrialTypes.has(type)) {
      return [
        "Truck access",
        "Loading",
        "Highway access",
        "Last-mile access",
        "Yard or outdoor storage",
        "Power",
        "Trailer parking",
        "Labor access",
      ];
    }
    if (type === "retail" || type === "restaurant" || type === "showroom") {
      return [
        "Customer parking",
        "Street visibility",
        "Foot traffic",
        "Co-tenancy",
        "Evening/weekend activity",
        "Signage visibility",
      ];
    }
    return [
      "Employee transit",
      "Parking",
      "Growth flexibility",
      "Practical daily access",
      "Executive image",
      "Client-facing location",
      "Walkability",
      "Restaurants and amenities",
    ];
  }

  function buildBriefState(state, context) {
    const existing = readStoredBrief() || {};
    return {
      searchProfile: context,
      marketPath: {
        mode: state.mode,
        title: state.title,
        confidenceLabel: state.confidenceLabel,
        locationIntent: normalizeLocationIntent(context.locationIntent, "compare"),
        locationIntentLabel: locationIntentLabel(context.locationIntent),
        primaryLocationLabel: state.primaryLocationLabel,
        recommendedPath: state.recommendedPath || [],
        compareWith: state.compareWith || [],
        questionsToValidate: state.questionsToValidate || [],
      },
      feedback: existing.feedback || "",
      priorities: Array.isArray(existing.priorities) ? existing.priorities : [],
      notes: existing.notes || "",
      contact: existing.contact || {},
      liveMarketInvestigation: existing.liveMarketInvestigation || null,
      timestamp: existing.timestamp || new Date().toISOString(),
    };
  }

  function renderQuestionList(state) {
    const node = clearNode("[data-location-brief-questions]");
    if (!node) return;
    const questions = state.questionsToValidate && state.questionsToValidate.length
      ? state.questionsToValidate
      : [
        "Which commute pattern matters most for employees?",
        "Is stronger location identity or a more practical daily environment more important?",
        "Do clients or customers visit regularly?",
        "How much room do you need to grow?",
      ];
    questions.slice(0, 5).forEach((question) => node.appendChild(createElement("li", "", question)));
  }

  function renderPriorityButtons(spaceType) {
    const node = clearNode("[data-location-brief-priorities]");
    if (!node) return;
    const selected = new Set((currentBriefState && currentBriefState.priorities) || []);
    priorityOptionsFor(spaceType).forEach((priority) => {
      const button = createElement("button", "", priority);
      button.type = "button";
      button.setAttribute("data-priority-value", priority);
      if (selected.has(priority)) button.setAttribute("aria-pressed", "true");
      button.addEventListener("click", () => {
        const values = new Set(currentBriefState.priorities || []);
        if (values.has(priority)) values.delete(priority);
        else values.add(priority);
        currentBriefState.priorities = Array.from(values);
        button.setAttribute("aria-pressed", values.has(priority) ? "true" : "false");
        persistBriefState();
      });
      node.appendChild(button);
    });
  }

  function initializeFeedbackButtons() {
    const buttons = Array.from(document.querySelectorAll("[data-feedback-value]"));
    buttons.forEach((button) => {
      const value = button.getAttribute("data-feedback-value") || "";
      button.setAttribute("aria-pressed", currentBriefState.feedback === value ? "true" : "false");
      button.addEventListener("click", () => {
        currentBriefState.feedback = value;
        buttons.forEach((item) => item.setAttribute("aria-pressed", item === button ? "true" : "false"));
        persistBriefState();
      });
    });
  }

  function initializeNotes() {
    const notes = document.querySelector("[data-location-brief-notes]");
    if (!notes) return;
    notes.value = currentBriefState.notes || "";
    notes.addEventListener("input", () => {
      currentBriefState.notes = notes.value;
      persistBriefState();
    });
  }

  function revealContactPanel({ focusIntake = false } = {}) {
    const panel = document.querySelector("[data-location-brief-contact]");
    if (!panel) return;
    panel.hidden = false;
    const firstInput = focusIntake
      ? panel.querySelector("[data-live-market-investigation-intake] input, [data-live-market-investigation-intake] select, [data-live-market-investigation-intake] textarea")
      : panel.querySelector("input");
    if (firstInput) firstInput.focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function activateLiveMarketInvestigation(trigger) {
    const investigation = investigationState();
    investigation.investigationIntent = true;
    investigation.investigationStatus = "draft";
    investigation.ctaSource = trigger && trigger.getAttribute("data-investigation-cta-source") || "recommendation_district_detail";
    renderInvestigationIntake({ activate: true });
    trackRecommendationEvent("live_market_investigation_started", {
      profile_id: currentBriefState && (currentBriefState.publicId || currentBriefState.id) || "",
      city: investigation.city,
      district: investigation.districtName,
      selected_building_count: (investigation.representativeBuildings || []).filter((building) => building.selected !== false).length,
      competitive_buildings: investigation.includeCompetitiveBuildings !== false,
      cta_source: investigation.ctaSource,
    });
  }

  function initializeReviewTriggers() {
    document.querySelectorAll("[data-location-brief-review-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        if (trigger.hasAttribute("data-live-market-investigation-cta")) {
          activateLiveMarketInvestigation(trigger);
          trackRecommendationEvent("live_market_investigation_cta_clicked", {
            district: trigger.getAttribute("data-investigation-district") || "",
            cta_source: "recommendation_district_detail",
          });
          revealContactPanel({ focusIntake: true });
          return;
        }
        revealContactPanel();
      });
    });
  }

  function collectInvestigationFormState() {
    const investigation = currentBriefState && currentBriefState.liveMarketInvestigation;
    if (!investigation || !investigation.investigationIntent) return;
    investigation.includeCompetitiveBuildings = document.querySelector("[data-investigation-competitive-buildings]")?.checked !== false;
    investigation.investigationScope = investigation.investigationScope || {};
    document.querySelectorAll("[data-live-market-scope-options] input[type='checkbox']").forEach((input) => {
      investigation.investigationScope[input.value] = input.checked;
    });
    investigation.representativeBuildings = (investigation.representativeBuildings || []).map((building) => {
      const key = String(building.buildingId || building.name || "");
      const input = key && window.CSS && CSS.escape
        ? document.querySelector(`[data-investigation-building-id="${CSS.escape(key)}"]`)
        : null;
      return {
        ...building,
        selected: input ? input.checked : building.selected !== false,
      };
    });
    investigation.timing = document.querySelector("[data-live-market-timing]")?.value || investigation.timing || timingFromProfile() || "";
    const broker = document.querySelector("[data-live-market-broker-preference] input[type='radio']:checked");
    investigation.brokerPreference = broker ? broker.value : investigation.brokerPreference || "research_first";
    investigation.additionalNotes = document.querySelector("[data-live-market-notes]")?.value || "";
    investigation.confirmedRequirements = {
      ...investigation.confirmedRequirements,
      ...investigationRequirements(),
      timing: investigation.timing || timingFromProfile() || "",
    };
    investigation.requestedAt = new Date().toISOString();
    investigation.investigationStatus = "requested";
    if (!investigation.submissionToken) investigation.submissionToken = investigationSubmissionToken();
  }

  function locationBriefPayload() {
    collectInvestigationFormState();
    return {
      ...currentBriefState,
      createdFrom: "recommendations",
      timestamp: new Date().toISOString(),
    };
  }

  function fallbackEmailHref(payload) {
    const subject = encodeURIComponent(`Rofo Location Brief review: ${formatLocations((payload.searchProfile || {}).locations || [])}`);
    const body = encodeURIComponent(JSON.stringify(payload, null, 2));
    return `mailto:hello@rofo.com?subject=${subject}&body=${body}`;
  }

  async function submitLocationBrief(payload) {
    const response = await fetch("/api/location-brief/submit", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(payload),
    });
    let result = null;
    try {
      result = await response.json();
    } catch (error) {
      result = {};
    }
    if (!response.ok || !result || result.ok === false) {
      const message = result && (result.error || result.message)
        ? [result.error, result.message].filter(Boolean).join(": ")
        : "Location Brief submission failed";
      throw new Error(message);
    }
    return result;
  }

  function initializeContactForm() {
    const form = document.querySelector("[data-location-brief-contact]");
    if (!form) return;
    form.setAttribute("method", "post");
    form.setAttribute("action", "/api/location-brief/submit");
    const status = document.querySelector("[data-location-brief-contact-status]");
    const submitButton = form.querySelector('button[type="submit"]');
    if (!currentBriefState) {
      currentBriefState = {
        searchProfile: normalizeContext({}) || {
          locations: [],
          spaceType: "",
          size: "",
          locationIntent: "compare",
          timestamp: "",
        },
        marketPath: {
          mode: "expert_guided",
          title: "Expert Guided Location Brief",
          confidenceLabel: "Expert Guided",
          primaryLocationLabel: "",
          recommendedPath: [],
          compareWith: [],
          questionsToValidate: [],
        },
        feedback: "",
        priorities: [],
        notes: "",
        contact: {},
        timestamp: new Date().toISOString(),
      };
    }
    const contact = currentBriefState.contact || {};
    ["name", "email", "company", "phone"].forEach((field) => {
      const input = form.querySelector(`[name="${field}"]`);
      if (input && contact[field]) input.value = contact[field];
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      currentBriefState.contact = {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        company: String(formData.get("company") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
      };
      const payload = locationBriefPayload();
      currentBriefState = payload;
      persistBriefState();
      const isInvestigation = payload.liveMarketInvestigation && payload.liveMarketInvestigation.investigationIntent;
      if (status) status.textContent = isInvestigation
        ? "Submitting your live market review request..."
        : "Creating your permanent Location Brief...";
      if (submitButton) submitButton.disabled = true;

      if (status) {
        try {
          const result = await submitLocationBrief(payload);
          currentBriefState = {
            ...payload,
            id: result.id || payload.id || "",
            publicId: result.publicId || payload.publicId || "",
            url: result.url || payload.url || "",
            status: result.status || "submitted",
          };
          persistBriefState();
          renderLocationBriefSuccess(status, result);
          if (isInvestigation) {
            if (result.confirmationEmail) {
              currentBriefState.liveMarketInvestigation.confirmationEmail = result.confirmationEmail;
              persistBriefState();
            }
            const eventPayload = {
              profile_id: result.publicId || payload.publicId || "",
              city: payload.liveMarketInvestigation.city,
              district: payload.liveMarketInvestigation.districtName,
              selected_building_count: (payload.liveMarketInvestigation.representativeBuildings || []).filter((building) => building.selected !== false).length,
              competitive_buildings: payload.liveMarketInvestigation.includeCompetitiveBuildings !== false,
              scope: Object.keys(payload.liveMarketInvestigation.investigationScope || {}).filter((key) => payload.liveMarketInvestigation.investigationScope[key]),
              timing: payload.liveMarketInvestigation.timing || "",
              cta_source: payload.liveMarketInvestigation.ctaSource || "",
            };
            if (result.duplicate) {
              trackRecommendationEvent("live_market_investigation_duplicate_resolved", eventPayload);
            } else {
              trackRecommendationEvent("live_market_investigation_submitted", eventPayload);
            }
            if (result.confirmationEmail && result.confirmationEmail.sent) {
              trackRecommendationEvent("live_market_investigation_confirmation_sent", {
                ...eventPayload,
                confirmation_status: result.confirmationEmail.status || "sent",
              });
            } else if (result.confirmationEmail && result.confirmationEmail.status === "failed") {
              trackRecommendationEvent("live_market_investigation_confirmation_failed", {
                ...eventPayload,
                confirmation_status: result.confirmationEmail.status,
              });
            }
          }
          if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Sent";
            submitButton.classList.add("recommendations-button--sent");
            submitButton.setAttribute("aria-label", isInvestigation ? "Market investigation request sent" : "Location Brief sent");
          }
        } catch (error) {
          status.textContent = isInvestigation
            ? "The live market review request could not be submitted. Please try again, or contact Rofo if the problem continues."
            : "The permanent brief could not be created automatically. Please try again, or contact Rofo if the problem continues.";
          status.classList.remove("location-brief-contact-status--success");
          if (window.console && typeof window.console.warn === "function") {
            console.warn("Location Brief submission failed", error);
          }
          if (isInvestigation) {
            trackRecommendationEvent("live_market_investigation_submission_failed", {
              city: payload.liveMarketInvestigation.city,
              district: payload.liveMarketInvestigation.districtName,
              selected_building_count: (payload.liveMarketInvestigation.representativeBuildings || []).filter((building) => building.selected !== false).length,
              competitive_buildings: payload.liveMarketInvestigation.includeCompetitiveBuildings !== false,
              scope: Object.keys(payload.liveMarketInvestigation.investigationScope || {}).filter((key) => payload.liveMarketInvestigation.investigationScope[key]),
              timing: payload.liveMarketInvestigation.timing || "",
              cta_source: payload.liveMarketInvestigation.ctaSource || "",
            });
          }
          if (submitButton) submitButton.disabled = false;
        } finally {
          if (submitButton && !submitButton.classList.contains("recommendations-button--sent")) {
            submitButton.disabled = false;
          }
        }
      }
    });
  }

  function initializeBriefRefinement(state, context, spaceType) {
    const root = document.querySelector("[data-location-brief-refinement]");
    if (!root) return;
    currentBriefState = buildBriefState(state, context);
    renderQuestionList(state);
    renderPriorityButtons(spaceType);
    initializeFeedbackButtons();
    initializeNotes();
    initializeReviewTriggers();
    initializeContactForm();
    persistBriefState();
  }

  const context = readStoredContext();
  if (context && (context.locations.length || context.spaceType || context.size)) {
    renderContext(context);
  } else {
    const demoContext = {
      locations: [{ label: "San Francisco", type: "city", city: "San Francisco", state: "CA", slug: "san-francisco", path: "/commercial-real-estate/CA/san-francisco/" }],
      spaceType: "Office",
      size: "",
      businessType: "technology",
      operationalUse: ["team_collaboration"],
      officeEnvironment: "Modern and polished",
      commuteOrientation: "Peninsula South Bay",
      expectedGrowth: "significant",
      locationIntent: "compare",
      timestamp: "",
    };
    const demoState = {
      mode: "demo",
      title: "Sample Recommendation",
      confidenceLabel: "Sample",
      primaryRecommendation: {
        label: "Mission Bay",
        slug: "mission-bay",
        city: "San Francisco",
        state: "CA",
        path: "/commercial-real-estate/CA/san-francisco/mission-bay/",
      },
      primaryLocationLabel: "Mission Bay",
      recommendedPath: [],
      compareWith: [],
      questionsToValidate: [
        "Which commute pattern matters most for employees?",
        "Is stronger location identity or a more practical daily environment more important?",
        "Do clients or customers visit regularly?",
        "How much room do you need to grow?",
      ],
    };
    renderProfileChips(demoContext);
    const fits = renderBestFits(demoState, demoContext, readRecommendationProfiles());
    setText(
      "[data-location-brief-summary-copy-one]",
      "This sample Location Brief shows how Rofo turns a Business Profile into recommended starting locations."
    );
    setText(
      "[data-location-brief-summary-copy-two]",
      "Create a Business Profile to replace this sample with guidance based on your business, commute pattern, office environment, and growth expectations."
    );
    setText(
      "[data-location-brief-comparative-copy]",
      "Use the sample to understand the shape of the deliverable. A completed Business Profile will produce a more specific recommendation."
    );
    initializeBriefRefinement(demoState, demoContext, "Office");
    renderRepresentativeBuildings(fits, demoState);
  }
})();
