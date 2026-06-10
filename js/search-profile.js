(function () {
  const STORAGE_KEY = "rofoSearchProfileV1";
  const root = document.querySelector("[data-search-profile]");
  if (!root) return;

  const card = root.querySelector("[data-profile-card]");
  const summaryButton = root.querySelector(".search-profile-summary");
  const prevButton = root.querySelector("[data-profile-prev]");
  const nextButton = root.querySelector("[data-profile-next]");
  const resetButton = root.querySelector("[data-profile-reset]");
  const closeControls = root.querySelectorAll("[data-profile-close]");
  const toggleControls = root.querySelectorAll("[data-profile-toggle]");
  const summaryTitle = root.querySelector("[data-profile-summary-title]");
  const stepCount = root.querySelector("[data-profile-step-count]");
  const progressBar = root.querySelector("[data-profile-progress-bar]");
  const expandIcon = root.querySelector("[data-profile-expand-icon]");
  const previewEmpty = root.querySelector("[data-profile-preview-empty]");
  const previewList = root.querySelector("[data-profile-preview-list]");
  const editorNodes = root.querySelectorAll("[data-profile-editor]");
  const finishedSummary = root.querySelector("[data-profile-finished]");
  const contactStep = root.querySelector("[data-profile-contact]");
  const finalList = root.querySelector("[data-profile-final-list]");
  const featureOtherWrap = root.querySelector("[data-profile-feature-other]");
  const locationOptionsContainer = root.querySelector("[data-profile-location-options]");
  const locationOtherWrap = root.querySelector("[data-profile-location-other]");
  const locationOtherInput = root.querySelector("[data-profile-location-other-input]");
  const editButtons = root.querySelectorAll("[data-profile-edit]");
  const contactInputs = root.querySelectorAll("[data-profile-contact-input]");
  const contactReminder = root.querySelector("[data-profile-contact-reminder]");
  const phoneError = root.querySelector("[data-profile-contact-phone-error]");
  const submitError = root.querySelector("[data-profile-contact-submit-error]");
  const contactSubmitButton = root.querySelector("[data-profile-contact-submit]");
  const contextTargetArea = root.dataset.profileContextTargetArea || "";
  const contextCity = root.dataset.profileContextCity || "";
  const contextDistrict = root.dataset.profileContextDistrict || "";
  const contextStreet = root.dataset.profileContextStreet || "";
  const contextState = root.dataset.profileState || "";
  const contextType = root.dataset.profileContextType || "";
  const contextLabel = root.dataset.profileContextLabel || "";
  const locationSuggestionLabels = parseSuggestionLabels(root.dataset.profileLocationSuggestions || "");
  const defaultSpaceType = root.dataset.profileDefaultSpaceType || "";
  const submitEnabled = root.dataset.profileSubmitEnabled === "true";
  const submitEndpoint = root.dataset.profileSubmitEndpoint || "/api/leads/submit";
  const profileLayout = root.dataset.profileLayout || "";
  const formStartTime = Date.now();
  const analyticsEndpoint = "/api/analytics/search-profile";
  const analyticsEnabled = submitEnabled && root.dataset.profileContextType !== "test";

  const timingOptions = ["ASAP", "0-3 months", "3-6 months", "6-12 months", "Just exploring"];
  const pathConfig = {
    Office: {
      detailField: "people",
      people: ["1-5 people", "6-10 people", "11-25 people", "26-50 people", "51-100 people", "100+", "Not sure"],
      features: ["Open layout", "Private offices", "Meeting rooms", "Team space", "Parking", "Transit access", "Other"],
    },
    Retail: {
      detailField: "size",
      size: ["Under 2,000 sqft", "2,000-5,000 sqft", "5,000-10,000 sqft", "10,000+ sqft", "Not sure"],
      features: ["Foot traffic", "Visibility", "Parking", "Outdoor / patio area", "Showroom", "Restaurant infrastructure", "Other"],
    },
    "Industrial / Warehouse": {
      detailField: "size",
      size: ["Under 5,000 sqft", "5,000-20,000 sqft", "20,000-100,000 sqft", "100,000+ sqft", "Not sure"],
      features: ["Loading", "Clear height", "Yard", "Power", "Parking", "Freeway access", "Other"],
    },
    Flex: {
      detailField: "size",
      size: ["Under 5,000 sqft", "5,000-15,000 sqft", "15,000+ sqft", "Not sure"],
      features: ["Office + warehouse", "Loading", "Showroom", "Parking", "High ceilings", "Easy access", "Other"],
    },
    Coworking: {
      detailField: "people",
      people: ["1", "2-5", "6-10", "10+", "Not sure"],
      features: ["Private offices", "Team rooms", "Meeting rooms", "Flexible terms", "Parking", "Transit access", "Other"],
    },
  };

  const fieldLabels = {
    spaceType: "Space Type",
    people: "People",
    use: "Use",
    size: "Size",
    timing: "Timing",
    workspaceStyle: "Workspace Style",
    important: "Important",
    features: "Features",
    targetArea: "Target area",
    notes: "Notes",
  };

  function contextLocation() {
    const cityWithState = [contextCity, contextState].filter(Boolean).join(", ");
    const display = cityWithState && contextDistrict
      ? `${cityWithState} — ${contextDistrict}`
      : cityWithState || contextTargetArea || [contextCity, contextDistrict].filter(Boolean).join(" — ");
    return {
      display,
      city: contextCity || null,
      district: contextDistrict || null,
      street: contextStreet || null,
      state: contextState || null,
      raw: display,
    };
  }

  function parseSuggestionLabels(value) {
    return String(value || "")
      .split("||")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function cleanLocationLabel(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/\s*,\s*/g, ", ")
      .trim()
      .replace(new RegExp(`,\\s*${contextState}$`, "i"), "")
      .replace(/,\s*(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)$/i, "")
      .trim();
  }

  function locationKey(value) {
    return cleanLocationLabel(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function locationOptionLabel() {
    if (contextType === "city" || contextType === "space_type") return cleanLocationLabel(contextCity || contextTargetArea);
    return cleanLocationLabel(contextDistrict || contextCity || contextTargetArea || contextLabel || "Current location");
  }

  function uniqueLabels(labels) {
    const seen = new Set();
    const cleanLabels = [];
    labels.forEach((label) => {
      const display = cleanLocationLabel(label);
      const normalized = locationKey(display);
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      cleanLabels.push(display);
    });
    return cleanLabels;
  }

  function normalizeLocation(value) {
    const fallback = contextLocation();
    if (typeof value === "string") {
      const display = value || fallback.display;
      return {
        ...fallback,
        display,
        raw: display,
      };
    }

    if (!value || typeof value !== "object") {
      return fallback;
    }

    const display = value.display || value.raw || fallback.display;
    return {
      display,
      city: value.city || fallback.city,
      district: value.district || fallback.district,
      street: value.street || fallback.street,
      state: value.state || fallback.state,
      raw: value.raw || display,
    };
  }

  function updateLocationDisplay(value) {
    const display = String(value || "").trim();
    profile.location = {
      ...normalizeLocation(profile.location),
      display,
      raw: display,
    };
    profile.targetArea = display;
  }

  function locationOptions() {
    const options = uniqueLabels([
      locationOptionLabel(),
      ...locationSuggestionLabels,
    ]).slice(0, 6);
    return [...options, "Other"];
  }

  function normalizeLocationSelections(value, fallbackLocation) {
    if (Array.isArray(value)) {
      return uniqueLabels(value.map((item) => typeof item === "string" ? item : item && item.label));
    }
    const fallbackLabel = fallbackLocation && fallbackLocation.display === contextLocation().display
      ? locationOptionLabel()
      : fallbackLocation && fallbackLocation.display;
    return uniqueLabels([fallbackLabel || locationOptionLabel()]);
  }

  function selectedLocationLabels(targetProfile = profile) {
    const labels = Array.isArray(targetProfile.locationSelections) ? targetProfile.locationSelections : [];
    const other = String(targetProfile.locationOther || "").trim();
    return labels
      .map((label) => label === "Other" ? other : label)
      .filter(Boolean);
  }

  function buildLocationFromSelections(targetProfile) {
    const labels = selectedLocationLabels(targetProfile);
    const fallback = contextLocation();
    const currentLabel = locationOptionLabel();
    const cityWithState = [contextCity, contextState].filter(Boolean).join(", ");
    let display = fallback.display;

    if (labels.length === 1 && locationKey(labels[0]) === locationKey(currentLabel)) {
      return fallback;
    }

    if (labels.length) {
      const labelDisplay = labels.join(" / ");
      display = (contextType === "district" || contextType === "comparison") && cityWithState
        ? `${cityWithState} — ${labelDisplay}`
        : labelDisplay;
    }

    return {
      ...normalizeLocation(targetProfile.location),
      display,
      city: contextCity || null,
      district: contextType === "district" || contextType === "comparison" ? labels.join(" / ") || contextDistrict || null : null,
      street: contextStreet || null,
      state: contextState || null,
      raw: display,
    };
  }

  function updateLocationFromSelections() {
    profile.location = buildLocationFromSelections(profile);
    profile.targetArea = profile.location.display;
  }

  const defaultProfile = {
    version: "1D",
    skipped: false,
    updatedAt: null,
    sourceContext: {
      type: root.dataset.profileContextType || "",
      label: root.dataset.profileContextLabel || "",
    },
    spaceType: defaultSpaceType && pathConfig[defaultSpaceType] ? defaultSpaceType : "",
    people: "",
    use: "",
    size: "",
    timing: "",
    workspaceStyle: "",
    important: [],
    priorities: [],
    features: [],
    featureOther: "",
    locationSelections: [locationOptionLabel()],
    locationOther: "",
    location: contextLocation(),
    contact: {
      submitted: false,
      name: "",
      email: "",
      phone: "",
    },
    targetArea: contextTargetArea,
    notes: "",
  };

  let profile = loadProfile();
  let activeStepIndex = 0;
  let collapsed = profileLayout === "page" ? false : window.matchMedia("(max-width: 760px)").matches;
  let viewMode = profile.contact.submitted ? "confirmation" : "edit";
  let analyticsStarted = false;
  const completedAnalyticsSteps = new Set();

  function loadProfile() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      const merged = {
        ...defaultProfile,
        ...stored,
        sourceContext: { ...defaultProfile.sourceContext, ...(stored.sourceContext || {}) },
        location: normalizeLocation(stored.location || stored.targetArea || contextLocation()),
        contact: {
          ...defaultProfile.contact,
          ...(stored.contact || stored.sharing || {}),
        },
      };
      merged.locationSelections = normalizeLocationSelections(stored.locationSelections, merged.location);
      const currentLabel = locationOptionLabel();
      if (!merged.locationSelections.some((label) => label.toLowerCase() === currentLabel.toLowerCase())) {
        merged.locationSelections.unshift(currentLabel);
      }
      merged.locationOther = stored.locationOther || "";
      if (!merged.spaceType && defaultSpaceType && pathConfig[defaultSpaceType]) {
        merged.spaceType = defaultSpaceType;
      }
      merged.location = buildLocationFromSelections(merged);
      merged.targetArea = merged.location.display;
      if (!Array.isArray(merged.priorities)) {
        merged.priorities = merged.priorities ? [merged.priorities] : [];
      }
      if (!Array.isArray(merged.important)) {
        merged.important = merged.important ? [merged.important] : [];
      }
      if (!Array.isArray(merged.features)) {
        merged.features = merged.features ? [merged.features] : [];
      }
      return merged;
    } catch (error) {
      return {
        ...defaultProfile,
        location: contextLocation(),
        locationSelections: [locationOptionLabel()],
        locationOther: "",
        targetArea: contextLocation().display,
        sourceContext: { ...defaultProfile.sourceContext },
        contact: { ...defaultProfile.contact },
      };
    }
  }

  function saveProfile() {
    profile.updatedAt = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  function deviceType() {
    return window.matchMedia("(max-width: 760px)").matches ? "mobile" : "desktop";
  }

  function analyticsContext() {
    const summary = profileSummaryData();
    return {
      page_type: root.dataset.profileContextType || "search_profile",
      page_url: root.dataset.profilePageUrl || window.location.href,
      city: summary.location.city || contextCity || "",
      district: summary.location.district || contextDistrict || "",
      location_display: summary.location.display || contextLocation().display || "",
      device_type: deviceType(),
    };
  }

  function analyticsProfile() {
    const summary = profileSummaryData();
    return {
      profile_version: "V1D",
      space_type: summary.spaceType || "",
      size_or_people: summary.sizeOrPeople || "",
      timing: summary.timing || "",
      features_count: selectedFeatureValues().length,
    };
  }

  function analyticsSessionKey(eventName, stepName = "") {
    return [
      "rofoSearchProfileAnalyticsV1",
      eventName,
      stepName,
      root.dataset.profilePageUrl || window.location.pathname,
    ].filter(Boolean).join(":");
  }

  function hasTrackedInSession(key) {
    try {
      return window.sessionStorage.getItem(key) === "1";
    } catch (error) {
      return false;
    }
  }

  function markTrackedInSession(key) {
    try {
      window.sessionStorage.setItem(key, "1");
    } catch (error) {
      // Analytics dedupe should never block Search Profile interaction.
    }
  }

  function trackSearchProfileEvent(eventName, options = {}) {
    if (!analyticsEnabled || !navigator.sendBeacon && !window.fetch) return;
    const stepName = options.stepName || "";
    const dedupe = options.dedupe !== false;
    const key = analyticsSessionKey(eventName, stepName);
    if (dedupe && hasTrackedInSession(key)) return;
    if (dedupe) markTrackedInSession(key);

    const payload = {
      event_name: eventName,
      profile_version: "V1D",
      step_name: stepName,
      context: analyticsContext(),
      profile: analyticsProfile(),
    };
    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(analyticsEndpoint, blob)) return;
    }

    fetch(analyticsEndpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body,
      keepalive: true,
    }).catch(() => {});
  }

  function trackStarted() {
    if (analyticsStarted) return;
    analyticsStarted = true;
    trackSearchProfileEvent("search_profile_started");
  }

  function trackStepCompleted(stepName) {
    if (completedAnalyticsSteps.has(stepName)) return;
    completedAnalyticsSteps.add(stepName);
    trackSearchProfileEvent(`${stepName}_completed`, { stepName });
  }

  function trackVisible() {
    trackSearchProfileEvent("search_profile_viewed");
  }

  function activeConfig() {
    return pathConfig[profile.spaceType] || {};
  }

  function activeSteps() {
    return ["targetArea", "spaceType", "timing", "details", "features"];
  }

  function detailField() {
    return activeConfig().detailField || "size";
  }

  function meaningfulValue(key) {
    if (key === "targetArea") return Boolean(String(profile.location.display || "").trim());
    const value = profile[key];
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(String(value || "").trim());
  }

  function completedCount() {
    const stepComplete = {
      spaceType: meaningfulValue("spaceType"),
      targetArea: meaningfulValue("targetArea"),
      timing: meaningfulValue("timing"),
      details: meaningfulValue(detailField()),
      features: meaningfulValue("features"),
    };
    return activeSteps().filter((step) => stepComplete[step]).length;
  }

  function previewValues() {
    const values = [
      profile.location.display,
      profile.spaceType,
      profile.people || profile.size,
      profile.timing,
    ];
    return values.filter((value) => String(value || "").trim()).slice(0, 4);
  }

  function summaryValues() {
    return [
      profile.location.display,
      profile.spaceType,
      profile.people || profile.size,
      profile.timing,
    ].filter((value) => String(value || "").trim());
  }

  function profileSummaryData() {
    return {
      location: {
        display: profile.location.display || "",
        city: profile.location.city || null,
        district: profile.location.district || null,
        street: profile.location.street || null,
        state: profile.location.state || contextState || null,
        raw: profile.location.raw || profile.location.display || "",
      },
      spaceType: profile.spaceType || "",
      sizeOrPeople: profile.people || profile.size || "",
      timing: profile.timing || "",
      features: Array.isArray(profile.features) ? [...profile.features] : [],
      featureOther: profile.featureOther || "",
    };
  }

  function selectedFeatureValues() {
    const summary = profileSummaryData();
    const featureValues = [...summary.features];
    const otherIndex = featureValues.indexOf("Other");
    if (otherIndex >= 0 && summary.featureOther) {
      featureValues[otherIndex] = summary.featureOther;
    }
    return featureValues.filter((value) => String(value || "").trim());
  }

  function buildRequirementsSummary() {
    const summary = profileSummaryData();
    const features = selectedFeatureValues();
    return [
      "Location requirement summary",
      "",
      `Location: ${summary.location.display || ""}`,
      `Space type: ${summary.spaceType || ""}`,
      summary.spaceType === "Office" || summary.spaceType === "Coworking"
        ? `Team size: ${summary.sizeOrPeople || ""}`
        : `Size: ${summary.sizeOrPeople || ""}`,
      `Move-in timing: ${summary.timing || ""}`,
      features.length ? `Features: ${features.join(" • ")}` : "",
      summary.featureOther ? `Other feature detail: ${summary.featureOther}` : "",
    ].filter((line) => line !== "").join("\n");
  }

  function buildLeadPayload() {
    const summary = profileSummaryData();
    const submittedSpaceType = normalizeSubmittedSpaceType(summary.spaceType);
    const phone = normalizedPhone(profile.contact.phone);
    const sizeOrPeople = summary.sizeOrPeople || "";
    return {
      lead_type: "location_profile",
      profile_version: "V1D",
      source: "rofo-search-profile",
      page_type: root.dataset.profileContextType || "search_profile",
      page_url: root.dataset.profilePageUrl || window.location.href,
      rofo_source: root.dataset.profilePageUrl || window.location.href,
      page_title: root.dataset.profilePageTitle || document.title,
      name: profile.contact.name,
      email: profile.contact.email,
      phone,
      city: summary.location.city || root.dataset.profileContextCity || "",
      state: summary.location.state || contextState || "",
      market: summary.location.display || [summary.location.city, root.dataset.profileState].filter(Boolean).join(", "),
      location_display: summary.location.display || "",
      location_city: summary.location.city || "",
      location_district: summary.location.district || "",
      location_street: summary.location.street || "",
      location_state: summary.location.state || contextState || "",
      location_raw: summary.location.raw || summary.location.display || "",
      space_type: submittedSpaceType,
      requested_space_type: submittedSpaceType,
      routing_space_type: submittedSpaceType,
      space_needed: sizeOrPeople,
      timing: summary.timing || "",
      move_timing: summary.timing || "",
      location_profile_features: selectedFeatureValues().join(", "),
      location_profile_feature_other: summary.featureOther || "",
      location_profile_json: JSON.stringify({
        location: summary.location,
        space_type: summary.spaceType,
        size_or_people: sizeOrPeople,
        timing: summary.timing,
        features: selectedFeatureValues(),
        feature_other: summary.featureOther || "",
      }),
      requirements: buildRequirementsSummary(),
      routing_market: root.dataset.profileRoutingMarket || "",
      routing_county: root.dataset.profileRoutingCounty || "",
      neighborhood_name: root.dataset.profileNeighborhoodName || summary.location.district || "",
      neighborhood_slug: root.dataset.profileNeighborhoodSlug || "",
      neighborhood_path: root.dataset.profileNeighborhoodPath || "",
      commercial_area_id: root.dataset.profileCommercialAreaId || "",
      commercial_area_type: root.dataset.profileCommercialAreaType || "",
      location_decision_selected_district: summary.location.district || root.dataset.profileContextLabel || "",
      location_decision_primary_archetype: root.dataset.profilePrimaryArchetype || "",
      location_decision_compared_districts: root.dataset.profileComparedDistricts || "",
      location_decision_business_use_case: summary.spaceType || "",
      _gotcha: "",
      company_website: "",
      human_check: "on",
      form_start_time: String(formStartTime),
    };
  }

  function phoneDigits(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 10);
  }

  function formatPhone(value) {
    const digits = phoneDigits(value);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function normalizedPhone(value) {
    const digits = phoneDigits(value);
    return digits.length === 10 ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}` : "";
  }

  function normalizeSubmittedSpaceType(value) {
    if (value === "Office") return "Office Space";
    if (value === "Retail") return "Retail Space";
    if (value === "Industrial / Warehouse") return "Industrial Space";
    if (value === "Flex") return "Flex Space";
    if (value === "Coworking") return "Coworking Space";
    return value || "Not Sure";
  }

  function setCollapsed(value) {
    collapsed = value;
    root.classList.toggle("is-collapsed", collapsed);
    root.classList.toggle("is-expanded", !collapsed);
    if (summaryButton) {
      summaryButton.setAttribute("aria-expanded", String(!collapsed));
    }
    if (expandIcon) {
      expandIcon.textContent = collapsed ? "+" : "−";
    }
  }

  function setProfileValue(key, value, multi) {
    trackStarted();
    profile.skipped = false;
    profile.contact.submitted = false;
    viewMode = "edit";
    if (multi) {
      const current = new Set(Array.isArray(profile[key]) ? profile[key] : []);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      profile[key] = [...current];
    } else {
      const previousValue = profile[key];
      const requiredChoice = ["spaceType", "timing", "people", "size"].includes(key);
      profile[key] = requiredChoice ? value : profile[key] === value ? "" : value;
      if (key === "spaceType" && previousValue !== value) {
        profile.people = "";
        profile.use = "";
        profile.size = "";
        profile.workspaceStyle = "";
        profile.important = [];
        profile.features = [];
        profile.featureOther = "";
      }
    }
    saveProfile();
    if (key === "spaceType" && meaningfulValue("spaceType")) trackStepCompleted("space_type");
    if (key === "timing" && meaningfulValue("timing")) trackStepCompleted("timing");
    if ((key === "people" || key === "size") && meaningfulValue(key)) trackStepCompleted("size");
    if (key === "features") trackStepCompleted("features");
    if (shouldAutoAdvance(key)) {
      activeStepIndex = Math.min(activeStepIndex + 1, activeSteps().length - 1);
    }
    render();
  }

  function shouldAutoAdvance(key) {
    const step = activeSteps()[activeStepIndex];
    return (
      (step === "spaceType" && key === "spaceType" && meaningfulValue("spaceType")) ||
      (step === "timing" && key === "timing" && meaningfulValue("timing")) ||
      (step === "details" && key === detailField() && meaningfulValue(detailField()))
    );
  }

  function renderOptions(key, options) {
    const container = root.querySelector(`[data-profile-options="${key}"]`);
    if (!container) return;
    container.innerHTML = "";
    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option;
      const multi = key === "important" || key === "features";
      const selected = multi
        ? Array.isArray(profile[key]) && profile[key].includes(option)
        : profile[key] === option;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
      button.addEventListener("click", () => setProfileValue(key, option, multi));
      container.appendChild(button);
    });
  }

  function toggleLocationSelection(label) {
    trackStarted();
    profile.skipped = false;
    profile.contact.submitted = false;
    viewMode = "edit";
    const current = new Set(Array.isArray(profile.locationSelections) ? profile.locationSelections : []);
    if (current.has(label)) {
      if (current.size === 1) return;
      current.delete(label);
    } else {
      current.add(label);
    }
    profile.locationSelections = [...current];
    if (!current.has("Other")) {
      profile.locationOther = "";
    }
    updateLocationFromSelections();
    saveProfile();
    if (meaningfulValue("targetArea")) trackStepCompleted("location");
    render();
  }

  function renderLocationOptions() {
    if (!locationOptionsContainer) return;
    const selected = new Set(Array.isArray(profile.locationSelections) ? profile.locationSelections : []);
    locationOptionsContainer.innerHTML = "";
    locationOptions().forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option;
      button.classList.toggle("is-selected", selected.has(option));
      button.setAttribute("aria-pressed", String(selected.has(option)));
      button.addEventListener("click", () => toggleLocationSelection(option));
      locationOptionsContainer.appendChild(button);
    });

    const showOther = selected.has("Other");
    if (locationOtherWrap) locationOtherWrap.hidden = !showOther;
    if (locationOtherInput) locationOtherInput.value = profile.locationOther || "";
  }

  function renderOptionSets() {
    renderLocationOptions();
    renderOptions("spaceType", Object.keys(pathConfig));
    renderOptions("timing", timingOptions);
    renderOptions("features", activeConfig().features || ["Other"]);
    ["people", "use", "size", "workspaceStyle", "important"].forEach((key) => {
      renderOptions(key, activeConfig()[key] || []);
    });
  }

  function renderFeatureOther() {
    const showOther = Array.isArray(profile.features) && profile.features.includes("Other");
    featureOtherWrap.hidden = !showOther;
    if (!showOther && profile.featureOther) {
      profile.featureOther = "";
      saveProfile();
    }
  }

  function renderContactInputs() {
    contactInputs.forEach((input) => {
      input.value = profile.contact[input.dataset.profileContactInput] || "";
    });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim());
  }

  function validateContact() {
    const phone = profile.contact.phone || "";
    const hasInvalidPhone = phoneDigits(phone).length > 0 && phoneDigits(phone).length !== 10;
    const missingRequired = !String(profile.contact.name || "").trim() || !isValidEmail(profile.contact.email);
    phoneError.hidden = !hasInvalidPhone;
    if (submitError) {
      submitError.hidden = !missingRequired;
      if (missingRequired) submitError.textContent = "Enter your name and a valid email address.";
    }
    return !hasInvalidPhone && !missingRequired;
  }

  function renderProfileSummaryList(list, options = {}) {
    const summary = profileSummaryData();
    list.innerHTML = "";
    const fields = [
      ["Location", summary.location.display],
      ["Space type", summary.spaceType],
      [summary.spaceType === "Office" || summary.spaceType === "Coworking" ? "Team size" : "Size", summary.sizeOrPeople],
      ["Move-in timing", summary.timing],
      ["Features", selectedFeatureValues().join(" · ")],
    ].filter(([, value]) => String(value || "").trim());

    if (options.dataset) {
      list.dataset.locationDisplay = summary.location.display;
      list.dataset.locationCity = summary.location.city || "";
      list.dataset.locationDistrict = summary.location.district || "";
      list.dataset.locationStreet = summary.location.street || "";
      list.dataset.locationRaw = summary.location.raw;
    }

    const heading = document.createElement("li");
    heading.className = "search-profile-contact-step__summary-heading";
    heading.textContent = "Your location profile";
    list.appendChild(heading);

    fields.forEach(([label, value]) => {
      const item = document.createElement("li");
      const labelEl = document.createElement("span");
      const valueEl = document.createElement("strong");
      labelEl.textContent = label;
      valueEl.textContent = value;
      item.append(labelEl, valueEl);
      list.appendChild(item);
    });
  }

  function renderContactReminder() {
    renderProfileSummaryList(contactReminder);
  }

  function showActiveStep() {
    const step = activeSteps()[activeStepIndex];
    const detail = detailField();

    root.querySelectorAll("[data-profile-step]").forEach((fieldset) => {
      const key = fieldset.dataset.profileStep;
      let visible = false;
      if (step === key) visible = true;
      if (step === "details" && key === detail) visible = true;
      fieldset.hidden = !visible;
    });

    stepCount.textContent = `${activeStepIndex + 1} / ${activeSteps().length}`;
    root.classList.toggle("is-first-step", activeStepIndex === 0);
    prevButton.hidden = activeStepIndex === 0;
    resetButton.hidden = activeStepIndex === 0;
    nextButton.hidden = ["spaceType", "timing", "details"].includes(step);
    nextButton.textContent = activeStepIndex === activeSteps().length - 1 ? "Continue" : "Next";
    progressBar.style.width = `${Math.round(((activeStepIndex + 1) / activeSteps().length) * 100)}%`;
  }

  function renderInputs() {
    root.querySelectorAll("[data-profile-input]").forEach((input) => {
      input.value = profile[input.dataset.profileInput] || "";
    });
  }

  function renderSummary() {
    const completed = completedCount();
    card.dataset.profileState = completed >= 4 ? "ready" : completed > 0 ? "in-progress" : "empty";
    root.classList.toggle("has-progressed", activeStepIndex > 0 || viewMode !== "edit");
    if (summaryTitle) {
      summaryTitle.textContent = completed > 0
        ? `${completed} ${completed === 1 ? "detail" : "details"} added`
        : "Add a few details";
    }
  }

  function renderFinishedSummary() {
    renderProfileSummaryList(finalList, { dataset: true });
  }

  function renderMode() {
    const showingContact = viewMode === "contact";
    const showingConfirmation = viewMode === "confirmation";
    editorNodes.forEach((node) => {
      node.hidden = showingContact || showingConfirmation;
    });
    contactStep.hidden = !showingContact;
    finishedSummary.hidden = !showingConfirmation;
  }

  function renderPreview() {
    const values = previewValues();
    previewEmpty.hidden = values.length > 0;
    previewList.hidden = values.length === 0;
    previewList.innerHTML = "";
    values.forEach((value) => {
      const item = document.createElement("li");
      item.textContent = value;
      previewList.appendChild(item);
    });
  }

  function render() {
    renderOptionSets();
    renderInputs();
    renderSummary();
    renderPreview();
    renderFinishedSummary();
    renderFeatureOther();
    renderContactInputs();
    renderContactReminder();
    showActiveStep();
    renderMode();
  }

  root.addEventListener("input", (event) => {
    const key = event.target.dataset.profileInput;
    const isLocationOther = event.target.matches("[data-profile-location-other-input]");
    if (!key && !isLocationOther) return;
    trackStarted();
    profile.skipped = false;
    profile.contact.submitted = false;
    if (isLocationOther) {
      profile.locationOther = event.target.value;
      if (!Array.isArray(profile.locationSelections)) profile.locationSelections = [locationOptionLabel()];
      if (!profile.locationSelections.includes("Other")) profile.locationSelections.push("Other");
      updateLocationFromSelections();
    } else if (key === "targetArea") {
      updateLocationDisplay(event.target.value);
    } else {
      profile[key] = event.target.value;
    }
    viewMode = "edit";
    saveProfile();
    if (key === "targetArea" && meaningfulValue("targetArea")) trackStepCompleted("location");
    renderSummary();
    renderPreview();
    renderFinishedSummary();
  });

  toggleControls.forEach((control) => {
    control.addEventListener("click", () => setCollapsed(!collapsed));
  });

  closeControls.forEach((control) => {
    control.addEventListener("click", () => setCollapsed(true));
  });

  prevButton.addEventListener("click", () => {
    viewMode = "edit";
    activeStepIndex = Math.max(0, activeStepIndex - 1);
    render();
  });

  nextButton.addEventListener("click", () => {
    profile.skipped = false;
    updateLocationFromSelections();
    saveProfile();
    if (activeStepIndex >= activeSteps().length - 1) {
      trackStepCompleted("features");
      viewMode = "contact";
      setCollapsed(false);
      render();
      return;
    }
    if (activeSteps()[activeStepIndex] === "targetArea" && meaningfulValue("targetArea")) {
      trackStepCompleted("location");
    }
    activeStepIndex += 1;
    render();
  });

  resetButton.addEventListener("click", () => {
    profile = {
      ...defaultProfile,
      location: contextLocation(),
      targetArea: contextLocation().display,
      locationSelections: [locationOptionLabel()],
      locationOther: "",
      sourceContext: { ...defaultProfile.sourceContext },
      contact: { ...defaultProfile.contact },
    };
    activeStepIndex = 0;
    viewMode = "edit";
    window.localStorage.removeItem(STORAGE_KEY);
    render();
    setCollapsed(false);
  });

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      viewMode = "edit";
      setCollapsed(false);
      render();
    });
  });

  contactInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.profileContactInput;
      const value = key === "phone" ? formatPhone(input.value) : input.value;
      input.value = value;
      profile.contact[key] = value;
      if (key === "phone") phoneError.hidden = phoneDigits(value).length === 0 || phoneDigits(value).length === 10;
      saveProfile();
    });
  });

  contactSubmitButton.addEventListener("click", () => {
    if (!validateContact()) return;
    trackStepCompleted("contact");
    if (submitError) submitError.hidden = true;

    const finishSubmission = () => {
      profile.contact.submitted = true;
      saveProfile();
      viewMode = "confirmation";
      setCollapsed(false);
      render();
    };

    if (!submitEnabled) {
      finishSubmission();
      return;
    }

    contactSubmitButton.disabled = true;
    contactSubmitButton.textContent = "Sending...";
    fetch(submitEndpoint, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(buildLeadPayload()),
    }).then((response) => {
      if (!response.ok) throw new Error(`Lead submission failed with ${response.status}`);
      return response.json();
    }).then((result) => {
      profile.contact.lead_id = result.id || "";
      finishSubmission();
      trackSearchProfileEvent("search_profile_submitted");
    }).catch(() => {
      if (submitError) {
        submitError.textContent = "We could not send your profile. Please try again.";
        submitError.hidden = false;
      }
    }).finally(() => {
      contactSubmitButton.disabled = false;
      contactSubmitButton.textContent = "Get my location options";
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setCollapsed(true);
  });

  render();
  setCollapsed(collapsed);
  if (analyticsEnabled && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        trackVisible();
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(root);
  } else if (analyticsEnabled) {
    window.setTimeout(trackVisible, 300);
  }
})();
