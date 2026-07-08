(function () {
  const CONTEXT_KEY = "rofoRecommendationContextV1";
  const BRIEF_KEY = "rofoLocationBriefV1";
  let currentBriefState = null;

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
      locations,
      spaceType: String(value.spaceType || "").trim(),
      size: String(value.size || "").trim(),
      timestamp: String(value.timestamp || "").trim(),
    };
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

  function expertReviewHref(context) {
    const locations = formatLocations(context.locations || []);
    const subject = encodeURIComponent(`Rofo expert review: ${locations}`);
    const body = encodeURIComponent([
      "I'd like a local expert to review my Rofo Search Profile.",
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
        summaryCopy: inputProfile
          ? `${inputLocation.label} is a relevant starting point, but this market is best handled with help from a local expert because Rofo's recommendation graph is still lighter here.`
          : "We have your Search Profile, but this market is best handled with help from a local expert.",
        ctaLabel: "Request Expert Review",
        ctaHref: expertReviewHref(context),
      };
    }

    const marketPathProfiles = Array.isArray(inputProfile.marketPath)
      ? inputProfile.marketPath.map((slug) => profileBySlug(slug, activeIndexes)).filter(Boolean)
      : [];
    const mode = inputProfile.type === "city" && marketPathProfiles.length ? "market_path" : "single_starting_point";
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

  function locationDescriptor(location) {
    if (!location) return "market";
    if (location.type === "district") return "district";
    if (location.type === "city") return "city";
    return "market";
  }

  function renderContext(context) {
    const graph = readKnowledgeGraph();
    const profiles = readRecommendationProfiles();
    const state = resolveMarketPath(context, graph, profiles);
    const locationText = formatLocations(context.locations || []);
    const spaceText = context.spaceType || "Commercial space";
    const sizeText = formatSize(context.size);

    setAllHidden("[data-recommendation-demo-detail]", true);
    setText("[data-recommendation-hero-badge]", "LOCATION BRIEF");
    setText("[data-recommendation-location]", locationText);
    setText("[data-recommendation-space]", spaceText);
    setText("[data-recommendation-size]", sizeText);
    setText("[data-recommendation-context-kicker]", "Based on what you told us");
    setText("[data-recommendation-context-heading]", "Your Location Brief");
    setText("[data-recommendation-context-location]", locationText);
    setText("[data-recommendation-context-space]", spaceText);
    setText("[data-recommendation-context-size]", sizeText);
    setText(
      "[data-recommendation-context-copy]",
      "Rather than showing every listing, Rofo starts by narrowing the search to the most relevant market path."
    );
    setSubmittedCta(state, context);

    const primaryLabel = state.primaryLocationLabel || (state.primaryRecommendation && state.primaryRecommendation.label) || locationText;
    const compareLabels = (state.recommendedPath || [])
      .slice(1, 3)
      .map((item) => item.label)
      .filter(Boolean);
    const compareSummary = compareLabels.length
      ? ` We’d compare it with ${compareLabels.join(" and ")} before narrowing the search to individual buildings.`
      : " We’d then pressure-test nearby alternatives before narrowing the search to individual buildings.";
    setText("[data-recommendation-context-heading]", "Here’s where we’d begin.");
    setText(
      "[data-recommendation-context-copy]",
      `Based on your search for ${sizeText} of ${spaceText.toLowerCase()} space in ${locationText}, we’d begin with ${primaryLabel}. ${state.summaryCopy || "This gives the search a focused starting point."}${compareSummary}`
    );
    setText(
      "[data-recommendation-hero-copy]",
      `Based on your search for ${sizeText} of ${spaceText.toLowerCase()} space in ${locationText}, we’d begin with ${primaryLabel}.${compareSummary}`
    );

    if (state.mode === "expert_guided") {
      setHidden("[data-recommendation-supported]", true);
      setHidden("[data-recommendation-expert-guided]", false);
      renderExpertGuided(state, context);
      initializeBriefRefinement(state, context, spaceText);
      return;
    }

    setHidden("[data-recommendation-supported]", false);
    setHidden("[data-recommendation-expert-guided]", true);
    renderMarketPath(state, spaceText, sizeText);
    initializeBriefRefinement(state, context, spaceText);
  }

  function setSubmittedCta(state, context) {
    setText("[data-recommendation-cta-kicker]", "Expert Review");
    setText("[data-recommendation-cta-heading]", "Ready for expert review?");
    setText(
      "[data-recommendation-cta-copy]",
      "Share your contact information and we’ll use your Location Brief to follow up with relevant listings, comps, sublease options, incentives, and market guidance."
    );
    const link = document.querySelector("[data-recommendation-cta-link]");
    if (link) {
      link.href = state.ctaHref || expertReviewHref(context);
      link.textContent = state.ctaLabel || "Request Expert Review";
      link.setAttribute("data-location-brief-review-trigger", "");
    }
  }

  function renderLocationBriefSuccess(status, result) {
    if (!status) return;
    status.textContent = "";
    status.classList.add("location-brief-contact-status--success");
    status.appendChild(createElement("strong", "", "Location Brief created"));
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
    status.appendChild(createElement("span", "", "Your brief has been submitted for expert review."));
  }

  function renderExpertGuided(state, context) {
    setText("[data-recommendation-expert-guided] .kicker", state.title);
    setText("[data-recommendation-expert-guided] h2", `Expert Guided Location Brief for ${state.primaryLocationLabel}`);
    setText(
      "[data-recommendation-expert-guided] p",
      `${state.summaryCopy} Your Search Profile gives our local market expert the location, space type, and size context needed to begin with relevant recommendations.`
    );
    const link = document.querySelector("[data-recommendation-expert-guided] .recommendations-button");
    if (link) {
      link.href = state.ctaHref || expertReviewHref(context);
      link.textContent = state.ctaLabel || "Request Expert Review";
      link.setAttribute("data-location-brief-review-trigger", "");
    }
  }

  function renderMarketPath(state, spaceText, sizeText) {
    const primary = state.primaryRecommendation;
    if (!primary) return;
    const descriptor = locationDescriptor(primary);
    const compareText = state.mode === "market_path"
      ? "This is a market path, not a final answer. We would use it to compare district fit before investigating live building options."
      : "We'd then pressure-test nearby alternatives to see whether commute patterns, pricing, or building options justify expanding the search.";

    renderPathPanels(state, spaceText);
    renderAttributeGuidance(primary, spaceText);
    setText("[data-recommendation-section-kicker]", "Location Brief");
    setText("[data-recommendation-status]", "Recommended Starting Point");
    setText("[data-recommendation-fit-label]", state.title || "Relevant Starting Point");
    setText("[data-recommendation-judgment-label]", "Where we'd start");
    setText("[data-recommendation-confidence-label]", state.confidenceLabel || "Medium Confidence");
    setText("[data-recommendation-primary-name]", primary.label);
    setText(
      "[data-recommendation-section-heading]",
      state.mode === "market_path" ? "Recommended Market Path" : `Start with ${primary.label}, then pressure-test alternatives.`
    );
    setText("[data-recommendation-strategy]", `${state.summaryCopy} ${compareText}`);
    setText(
      "[data-recommendation-primary-advice]",
      `${primary.label} is where we'd start. ${primary.summary || `Rofo can use this ${descriptor} to guide a focused review of available ${spaceText.toLowerCase()} options.`}`
    );
    setText(
      "[data-recommendation-primary-note]",
      `We would not treat ${primary.label} as the only answer. We would use it as the baseline for a local market review, then compare alternatives against your location, space, and size requirements.`
    );
    setText("[data-recommendation-explainer-heading]", `Why we'd start with ${primary.label}`);
    setText("[data-recommendation-rationale-one]", `Your requested ${spaceText.toLowerCase()} search gives us enough context to start with a focused ${descriptor}.`);
    setText("[data-recommendation-rationale-two]", `${primary.label} has a Recommendation Profile in Rofo's Commercial Location Graph.`);
    setText("[data-recommendation-rationale-three]", `The ${sizeText} size range helps narrow which building types should be investigated first.`);
    setText(
      "[data-recommendation-rationale-four]",
      primary.strengths && primary.strengths.length
        ? `Key strengths include ${primary.strengths.slice(0, 3).join(", ")}.`
        : "The location profile gives a useful starting point without assuming live availability."
    );
    setText("[data-recommendation-rationale-five]", "A local market check can compare credible options before narrowing the search.");
    setText("[data-recommendation-tradeoff-one]", primary.tradeoffs && primary.tradeoffs[0] ? primary.tradeoffs[0] : "This is a starting recommendation, not a final building decision.");
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
    }
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
        const label = createElement("div", "recommendation-market-path-card__label", index === 0 ? "Where we'd start" : "Next comparison");
        const title = item.path ? createElement("a", "", item.label) : createElement("strong", "", item.label);
        if (item.path) title.href = item.path;
        const fit = createElement("span", "recommendation-market-path-card__fit", item.fitLabel);
        const summary = createElement("p", "", item.summary);
        card.append(label, title, fit, summary);
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
          const reason = createElement("p", "", item.reason || "Worth comparing before narrowing the search.");
          card.append(title, reason);
          node.appendChild(card);
        });
      } else {
        node.appendChild(createElement("p", "recommendation-brief-empty", "A local expert should identify the right nearby alternatives for this profile."));
      }
    };

    renderCompareItems(compareNode);
    renderCompareItems(secondaryCompareNode);

    if (evaluateNode) {
      const evaluationItems = state.primaryRecommendation && state.primaryRecommendation.questionsToValidate && state.primaryRecommendation.questionsToValidate.length
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
      "Lower occupancy cost",
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
        primaryLocationLabel: state.primaryLocationLabel,
        recommendedPath: state.recommendedPath || [],
        compareWith: state.compareWith || [],
        questionsToValidate: state.questionsToValidate || [],
      },
      feedback: existing.feedback || "",
      priorities: Array.isArray(existing.priorities) ? existing.priorities : [],
      notes: existing.notes || "",
      contact: existing.contact || {},
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
        "Is lower occupancy cost or stronger location identity more important?",
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

  function revealContactPanel() {
    const panel = document.querySelector("[data-location-brief-contact]");
    if (!panel) return;
    panel.hidden = false;
    const firstInput = panel.querySelector("input");
    if (firstInput) firstInput.focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function initializeReviewTriggers() {
    document.querySelectorAll("[data-location-brief-review-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        revealContactPanel();
      });
    });
  }

  function locationBriefPayload() {
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
    const status = document.querySelector("[data-location-brief-contact-status]");
    const submitButton = form.querySelector('button[type="submit"]');
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
      if (status) status.textContent = "Creating your permanent Location Brief...";
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
        } catch (error) {
          const href = fallbackEmailHref(payload);
          status.innerHTML = `We could not create the permanent brief automatically. <a href="${href}">Send by email</a>`;
        } finally {
          if (submitButton) submitButton.disabled = false;
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
    initializeBriefRefinement({
      mode: "demo",
      title: "Sample Recommendation",
      confidenceLabel: "Sample",
      primaryLocationLabel: "Mission Bay",
      recommendedPath: [],
      compareWith: [],
      questionsToValidate: [
        "Which commute pattern matters most for employees?",
        "Is lower occupancy cost or stronger location identity more important?",
        "Do clients or customers visit regularly?",
        "How much room do you need to grow?",
      ],
    }, {
      locations: [{ label: "San Francisco", type: "city", city: "San Francisco", state: "CA", slug: "san-francisco", path: "/commercial-real-estate/CA/san-francisco/" }],
      spaceType: "Office",
      size: "2,500-5,000 sqft",
      timestamp: "",
    }, "Office");
  }
})();
