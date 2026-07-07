(function () {
  const CONTEXT_KEY = "rofoRecommendationContextV1";

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

  function formatLocations(locations) {
    if (!locations.length) return "Your selected market";
    return locations.map((location) => location.label).join(" / ");
  }

  function formatSize(value) {
    return String(value || "Size to confirm").replace(/\bsqft\b/gi, "SF");
  }

  function supportedLocation(location) {
    if (!location) return false;
    return Boolean(location.path && (location.type === "city" || location.type === "district"));
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

  function resolveRecommendationState(context) {
    const locations = context.locations || [];
    const primary = locations[0] || null;
    if (!primary) {
      return {
        mode: "demo",
        title: "Sample Recommendation",
        confidenceLabel: "Sample",
        primaryLocationLabel: "Mission Bay",
        summaryCopy: "This is a sample recommendation. Start a profile to see recommendations based on your search.",
        ctaLabel: "Start My Market Investigation",
        ctaHref: "/find-locations/",
      };
    }
    if (!supportedLocation(primary)) {
      return {
        mode: "expert_guided",
        title: "Expert Guided Recommendation",
        confidenceLabel: "Expert Guided",
        primaryLocationLabel: primary.label,
        summaryCopy: "We have your Search Profile, but this market is best handled with help from a local expert.",
        ctaLabel: "Request Expert Review",
        ctaHref: expertReviewHref(context),
      };
    }
    return {
      mode: "supported",
      title: "Relevant Starting Point",
      confidenceLabel: "High Confidence",
      primaryLocationLabel: primary.label,
      summaryCopy: `${primary.label} appears to be a relevant starting point based on your profile.`,
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
    const locations = context.locations || [];
    const primary = locations[0] || null;
    const state = resolveRecommendationState(context);
    const locationText = formatLocations(locations);
    const spaceText = context.spaceType || "Commercial space";
    const sizeText = formatSize(context.size);

    setAllHidden("[data-recommendation-demo-detail]", true);

    setText("[data-recommendation-hero-badge]", "LOCATION ADVISOR");
    setText("[data-recommendation-location]", locationText);
    setText("[data-recommendation-space]", spaceText);
    setText("[data-recommendation-size]", sizeText);
    setText("[data-recommendation-context-kicker]", "Based on what you told us");
    setText("[data-recommendation-context-heading]", "Your location profile");
    setText("[data-recommendation-context-location]", locationText);
    setText("[data-recommendation-context-space]", spaceText);
    setText("[data-recommendation-context-size]", sizeText);
    setText(
      "[data-recommendation-context-copy]",
      "Rather than showing every listing, Rofo starts by narrowing the search to the most relevant market path."
    );
    setText(
      "[data-recommendation-hero-copy]",
      `For a ${locationText} ${spaceText.toLowerCase()} search, we'd start by narrowing the market path before looking at individual buildings.`
    );
    setSubmittedCta(state, context);

    if (state.mode === "expert_guided") {
      setHidden("[data-recommendation-supported]", true);
      setHidden("[data-recommendation-expert-guided]", false);
      renderExpertGuided(state, context);
      return;
    }

    setHidden("[data-recommendation-supported]", false);
    setHidden("[data-recommendation-expert-guided]", true);
    renderSupportedRecommendation(primary, spaceText, sizeText, locations, state);
  }

  function setSubmittedCta(state, context) {
    setText("[data-recommendation-cta-kicker]", "Expert next step");
    setText("[data-recommendation-cta-heading]", "Ready for a local expert to review your profile?");
    setText(
      "[data-recommendation-cta-copy]",
      "Your Search Profile gives us the location, space type, and size context needed to begin a focused market review. A local commercial real estate expert can use it to investigate current availability, pricing, subleases, and comparable buildings without sending you back through the intake."
    );
    const link = document.querySelector("[data-recommendation-cta-link]");
    if (link) {
      link.href = state.ctaHref || expertReviewHref(context);
      link.textContent = state.ctaLabel || "Request Expert Review";
    }
  }

  function renderExpertGuided(state, context) {
    setText("[data-recommendation-expert-guided] .kicker", state.title);
    setText("[data-recommendation-expert-guided] h2", `Expert review for ${state.primaryLocationLabel}`);
    setText(
      "[data-recommendation-expert-guided] p",
      `${state.summaryCopy} Your Search Profile gives our local market expert the location, space type, and size context needed to begin with relevant recommendations.`
    );
    const link = document.querySelector("[data-recommendation-expert-guided] .recommendations-button");
    if (link) {
      link.href = state.ctaHref || expertReviewHref(context);
      link.textContent = state.ctaLabel || "Request Expert Review";
    }
  }

  function renderSupportedRecommendation(primary, spaceText, sizeText, locations, state) {
    const descriptor = locationDescriptor(primary);
    const otherLocations = locations.slice(1).map((location) => location.label);
    const compareText = otherLocations.length
      ? `We'd also pressure-test ${otherLocations.join(" and ")} to see whether commute patterns, pricing, or building options justify expanding the search.`
      : "We'd then pressure-test nearby alternatives to see whether commute patterns, pricing, or building options justify expanding the search.";

    setText("[data-recommendation-section-kicker]", "Advisor recommendation");
    setText("[data-recommendation-status]", "Relevant Starting Point");
    setText("[data-recommendation-fit-label]", "Relevant Starting Point");
    setText("[data-recommendation-judgment-label]", "We'd start the search here");
    setText("[data-recommendation-confidence-label]", state.confidenceLabel || "High Confidence");
    setText("[data-recommendation-primary-name]", primary.label);
    setText(
      "[data-recommendation-section-heading]",
      `Start with ${primary.label}, then pressure-test alternatives.`
    );
    setText(
      "[data-recommendation-strategy]",
      `${primary.label} appears to be a relevant starting point based on your profile. ${compareText}`
    );
    setText(
      "[data-recommendation-primary-advice]",
      `${primary.label} is a relevant starting point for your search. At this stage, Rofo has captured your requirements and can use them to guide a more focused review of available ${spaceText.toLowerCase()} options in and around this ${descriptor}.`
    );
    setText(
      "[data-recommendation-primary-note]",
      `We would not treat ${primary.label} as the only answer. We would use it as the baseline for a local market review, then compare nearby alternatives against your location, space, and size requirements.`
    );
    setText("[data-recommendation-explainer-heading]", `Why we'd start with ${primary.label}`);
    setText(
      "[data-recommendation-rationale-one]",
      `Your requested ${spaceText.toLowerCase()} search gives us enough context to start with a focused ${descriptor}.`
    );
    setText(
      "[data-recommendation-rationale-two]",
      `${primary.label} is a supported Rofo commercial location, so we can connect it to nearby markets and representative building context.`
    );
    setText(
      "[data-recommendation-rationale-three]",
      `The ${sizeText} size range helps narrow which building types should be investigated first.`
    );
    setText(
      "[data-recommendation-rationale-four]",
      "The location profile gives a useful starting point without assuming live availability."
    );
    setText(
      "[data-recommendation-rationale-five]",
      "A local market check can compare several credible options before narrowing the search."
    );
    setText(
      "[data-recommendation-tradeoff-one]",
      "This is a starting recommendation, not a final building decision."
    );
    setText(
      "[data-recommendation-tradeoff-two]",
      "Live availability, pricing, and lease terms still need to be verified."
    );
    setText(
      "[data-recommendation-tradeoff-three]",
      "Nearby markets may prove stronger once commute, budget, and timing are reviewed."
    );
    setText(
      "[data-recommendation-fit-one]",
      `${spaceText} users looking for a focused market starting point.`
    );
    setText(
      "[data-recommendation-fit-two]",
      `Teams in the ${sizeText} range that want to compare several realistic building options.`
    );
    setText(
      "[data-recommendation-fit-three]",
      "Businesses that want local guidance before reviewing live availability."
    );
    setText(
      "[data-recommendation-fit-four]",
      "Decision-makers who want to pressure-test nearby alternatives before committing to one market."
    );
    setText(
      "[data-recommendation-confidence-copy]",
      `High Confidence means ${primary.label} exists in Rofo's location data and your profile includes the key starting inputs: location, space type, and size. It does not mean Rofo has scored live availability yet.`
    );

    const primaryLink = document.querySelector("[data-recommendation-primary-link]");
    if (primaryLink) {
      primaryLink.href = primary.path;
      primaryLink.textContent = primary.type === "city" ? "Explore City" : "Explore District";
    }
  }

  const context = readStoredContext();
  if (context && (context.locations.length || context.spaceType || context.size)) {
    renderContext(context);
  }
})();
