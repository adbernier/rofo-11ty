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

  function locationDescriptor(location) {
    if (!location) return "market";
    if (location.type === "district") return "district";
    if (location.type === "city") return "city";
    return "market";
  }

  function renderContext(context) {
    const locations = context.locations || [];
    const primary = locations[0] || null;
    const locationText = formatLocations(locations);
    const spaceText = context.spaceType || "Commercial space";
    const sizeText = formatSize(context.size);

    setAllHidden("[data-recommendation-demo-detail]", true);

    setText("[data-recommendation-location]", locationText);
    setText("[data-recommendation-space]", spaceText);
    setText("[data-recommendation-size]", sizeText);
    setText("[data-recommendation-context-location]", locationText);
    setText("[data-recommendation-context-space]", spaceText);
    setText("[data-recommendation-context-size]", sizeText);
    setText(
      "[data-recommendation-context-copy]",
      "We'll start by recommending the districts and buildings we believe are the strongest fit."
    );
    setText(
      "[data-recommendation-hero-copy]",
      `For a ${locationText} ${spaceText.toLowerCase()} search, we'd start by testing the strongest location options against how your team will work, commute, and grow.`
    );

    if (!supportedLocation(primary)) {
      setHidden("[data-recommendation-supported]", true);
      setHidden("[data-recommendation-expert-guided]", false);
      return;
    }

    setHidden("[data-recommendation-supported]", false);
    setHidden("[data-recommendation-expert-guided]", true);
    renderSupportedRecommendation(primary, spaceText, sizeText, locations);
  }

  function renderSupportedRecommendation(primary, spaceText, sizeText, locations) {
    const descriptor = locationDescriptor(primary);
    const otherLocations = locations.slice(1).map((location) => location.label);
    const compareText = otherLocations.length
      ? `We'd also pressure-test ${otherLocations.join(" and ")} to see whether commute patterns, pricing, or building options justify expanding the search.`
      : "We'd then pressure-test nearby alternatives to see whether commute patterns, pricing, or building options justify expanding the search.";

    setText("[data-recommendation-primary-name]", primary.label);
    setText(
      "[data-recommendation-section-heading]",
      `Start with ${primary.label}, then pressure-test alternatives.`
    );
    setText(
      "[data-recommendation-strategy]",
      `Based on your search, we'd begin with ${primary.label} because it is the clearest submitted location fit for ${spaceText.toLowerCase()} in the ${sizeText} range. ${compareText}`
    );
    setText(
      "[data-recommendation-primary-advice]",
      `${primary.label} is where we'd begin because it gives the search a concrete ${descriptor} to evaluate against your space type, size, and business-location priorities. The next step is to understand which buildings in and around this market are worth investigating.`
    );
    setText(
      "[data-recommendation-primary-note]",
      `We would not treat ${primary.label} as the only answer. We would use it as the baseline for building quality, commute pattern, and market fit, then compare alternatives against that standard.`
    );
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
      "[data-recommendation-confidence-copy]",
      `We have enough search context to make ${primary.label} a credible starting point: location, space type, and size are all defined. A local market check would still confirm live options before any decision.`
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
