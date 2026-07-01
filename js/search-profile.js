(function () {
  const STORAGE_KEY = "rofoSearchProfileV1";
  const ATTRIBUTION_KEY = "rofoSearchProfileAttributionV1";
  const root = document.querySelector("[data-search-profile]");
  if (!root) return;

  const card = root.querySelector("[data-profile-card]");
  const summaryButton = root.querySelector(".search-profile-summary");
  const prevButton = root.querySelector("[data-profile-prev]");
  const nextButton = root.querySelector("[data-profile-next]");
  const resetButton = root.querySelector("[data-profile-reset]");
  const closeControls = root.querySelectorAll("[data-profile-close]");
  const toggleControls = root.querySelectorAll("[data-profile-toggle]");
  const mobileEntryButtons = document.querySelectorAll("[data-profile-mobile-entry]");
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
  const stepError = root.querySelector("[data-profile-step-error]");
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
  const pageUrl = root.dataset.profilePageUrl || window.location.href;
  const pageType = root.dataset.profileContextType || "search_profile";

  const PROFILE_VERSION = "V2";
  const officeSizeOptions = ["Under 2,500 sqft", "2,500-5,000 sqft", "5,000-10,000 sqft", "10,000-25,000 sqft", "25,000+ sqft", "I'm not sure"];
  const defaultSizeOptions = ["Under 5,000 sqft", "5,000-10,000 sqft", "10,000-25,000 sqft", "25,000+ sqft", "I'm not sure"];
  const spaceTypeOptions = [
    { label: "Office", value: "Office" },
    { label: "Industrial", value: "Industrial / Warehouse" },
    { label: "Retail", value: "Retail" },
    { label: "Medical", value: "Medical" },
    { label: "Flex", value: "Flex" },
    { label: "Coworking", value: "Coworking" },
  ];
  const pathConfig = {
    Office: {
      detailField: "size",
      size: officeSizeOptions,
      features: ["Open layout", "Private offices", "Meeting rooms", "Team space", "Parking", "Transit access", "Other"],
    },
    Medical: {
      detailField: "size",
      size: ["Under 2,000 sqft", "2,000-5,000 sqft", "5,000-10,000 sqft", "10,000+ sqft", "I'm not sure"],
      features: ["Exam rooms", "Parking", "Transit access", "Ground floor", "Elevator access", "Procedure space", "Other"],
    },
    Retail: {
      detailField: "size",
      size: ["Under 2,000 sqft", "2,000-5,000 sqft", "5,000-10,000 sqft", "10,000+ sqft", "I'm not sure"],
      features: ["Foot traffic", "Visibility", "Parking", "Outdoor / patio area", "Showroom", "Restaurant infrastructure", "Other"],
    },
    "Industrial / Warehouse": {
      detailField: "size",
      size: ["Under 5,000 sqft", "5,000-20,000 sqft", "20,000-100,000 sqft", "100,000+ sqft", "I'm not sure"],
      features: ["Loading", "Clear height", "Yard", "Power", "Parking", "Freeway access", "Other"],
    },
    Flex: {
      detailField: "size",
      size: ["Under 5,000 sqft", "5,000-15,000 sqft", "15,000+ sqft", "I'm not sure"],
      features: ["Office + warehouse", "Loading", "Showroom", "Parking", "High ceilings", "Easy access", "Other"],
    },
    Coworking: {
      detailField: "people",
      people: ["1", "2-5", "6-10", "10+", "I'm not sure"],
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

  function safeSessionGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return "";
    }
  }

  function safeSessionSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      // Session attribution should never block Search Profile interaction.
    }
  }

  function parseStoredJson(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function arrayWithRecentValue(values, value, limit = 20) {
    const cleanValue = String(value || "").trim();
    const existing = Array.isArray(values) ? values.filter(Boolean) : [];
    if (!cleanValue) return existing.slice(-limit);
    return [...existing.filter((item) => item !== cleanValue), cleanValue].slice(-limit);
  }

  function profilePageContext() {
    return {
      page_url: pageUrl,
      page_type: pageType,
      page_title: root.dataset.profilePageTitle || document.title,
      city: contextCity || "",
      district: contextDistrict || "",
      comparison: root.dataset.profileComparedDistricts || (pageType === "comparison" ? contextLabel : ""),
      ecosystem: root.dataset.profileBusinessEcosystem || root.dataset.profilePrimaryArchetype || "",
      referrer: document.referrer || "",
    };
  }

  function defaultAttribution(context) {
    return {
      session_id: (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      landing_page: context.page_url,
      referrer: context.referrer,
      entry_page_type: context.page_type,
      entry_city: context.city,
      entry_district: context.district,
      entry_comparison: context.comparison,
      entry_ecosystem: context.ecosystem,
      last_page_url: "",
      previous_page_url: "",
      pages_viewed: 0,
      page_type_counts: {},
      comparison_pages: [],
      district_pages: [],
      building_pages: [],
      started_at: "",
      started_page_url: "",
      submitted_page_url: "",
      final_page_before_search_profile: "",
    };
  }

  function loadAttribution() {
    const context = profilePageContext();
    const stored = parseStoredJson(safeSessionGet(ATTRIBUTION_KEY), null);
    return {
      ...defaultAttribution(context),
      ...(stored || {}),
      page_type_counts: {
        ...defaultAttribution(context).page_type_counts,
        ...((stored && stored.page_type_counts) || {}),
      },
    };
  }

  function saveAttribution() {
    safeSessionSet(ATTRIBUTION_KEY, JSON.stringify(attribution));
  }

  function recordAttributionPage() {
    const context = profilePageContext();
    if (attribution.last_page_url && attribution.last_page_url !== context.page_url) {
      attribution.previous_page_url = attribution.last_page_url;
    }
    if (attribution.last_page_url !== context.page_url) {
      attribution.pages_viewed = Number(attribution.pages_viewed || 0) + 1;
      attribution.page_type_counts[context.page_type] = Number(attribution.page_type_counts[context.page_type] || 0) + 1;
      if (context.page_type === "comparison") attribution.comparison_pages = arrayWithRecentValue(attribution.comparison_pages, context.page_url);
      if (context.page_type === "district") attribution.district_pages = arrayWithRecentValue(attribution.district_pages, context.page_url);
      if (context.page_type === "building") attribution.building_pages = arrayWithRecentValue(attribution.building_pages, context.page_url);
    }
    attribution.last_page_url = context.page_url;
    attribution.current_page_type = context.page_type;
    attribution.current_city = context.city;
    attribution.current_district = context.district;
    attribution.current_comparison = context.comparison;
    attribution.current_ecosystem = context.ecosystem;
    saveAttribution();
  }

  function markAttributionStarted() {
    if (attribution.started_at) return;
    attribution.started_at = new Date().toISOString();
    attribution.started_page_url = pageUrl;
    attribution.final_page_before_search_profile = attribution.previous_page_url || "";
    attribution.pages_viewed_before_start = Number(attribution.pages_viewed || 0);
    saveAttribution();
  }

  function attributionDurationMs() {
    if (!attribution.started_at) return 0;
    const started = new Date(attribution.started_at).getTime();
    if (!Number.isFinite(started)) return 0;
    return Math.max(0, Date.now() - started);
  }

  function analyticsAttribution(eventName) {
    const context = profilePageContext();
    return {
      session_id: attribution.session_id || "",
      landing_page: attribution.landing_page || context.page_url,
      referrer: attribution.referrer || context.referrer,
      entry_page_type: attribution.entry_page_type || context.page_type,
      entry_city: attribution.entry_city || "",
      entry_district: attribution.entry_district || "",
      entry_comparison: attribution.entry_comparison || "",
      entry_ecosystem: attribution.entry_ecosystem || "",
      business_ecosystem: context.ecosystem || attribution.current_ecosystem || "",
      final_page_before_search_profile: attribution.final_page_before_search_profile || attribution.previous_page_url || "",
      start_page_url: attribution.started_page_url || (eventName === "search_profile_started" ? pageUrl : ""),
      submit_page_url: eventName === "search_profile_submitted" ? pageUrl : attribution.submitted_page_url || "",
      page_where_started: attribution.started_page_url || "",
      page_where_submitted: eventName === "search_profile_submitted" ? pageUrl : "",
      pages_viewed_before_start: Number(attribution.pages_viewed_before_start || attribution.pages_viewed || 0),
      pages_viewed: Number(attribution.pages_viewed || 0),
      comparison_pages_viewed: Array.isArray(attribution.comparison_pages) ? attribution.comparison_pages.length : 0,
      district_pages_viewed: Array.isArray(attribution.district_pages) ? attribution.district_pages.length : 0,
      building_pages_viewed: Array.isArray(attribution.building_pages) ? attribution.building_pages.length : 0,
      comparison_pages: attribution.comparison_pages || [],
      district_pages: attribution.district_pages || [],
      building_pages: attribution.building_pages || [],
      duration_ms: attributionDurationMs(),
    };
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
    version: "2",
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
  let locationOptionsExpanded = hasAdditionalLocationSelection(profile);
  let analyticsStarted = false;
  const completedAnalyticsSteps = new Set();
  const attribution = loadAttribution();
  recordAttributionPage();

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
      page_type: pageType,
      page_url: pageUrl,
      page_title: root.dataset.profilePageTitle || document.title,
      city: summary.location.city || contextCity || "",
      district: summary.location.district || contextDistrict || "",
      comparison: root.dataset.profileComparedDistricts || (pageType === "comparison" ? contextLabel : ""),
      business_ecosystem: root.dataset.profileBusinessEcosystem || root.dataset.profilePrimaryArchetype || "",
      location_display: summary.location.display || contextLocation().display || "",
      device_type: deviceType(),
    };
  }

  function analyticsProfile() {
    const summary = profileSummaryData();
    return {
      profile_version: PROFILE_VERSION,
      space_type: summary.spaceType || "",
      size_or_people: summary.sizeOrPeople || "",
      timing: summary.timing || "",
      features: selectedFeatureValues(),
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
      profile_version: PROFILE_VERSION,
      step_name: stepName,
      context: analyticsContext(),
      profile: analyticsProfile(),
      attribution: analyticsAttribution(eventName),
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
    markAttributionStarted();
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
    return ["search"];
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
      details: meaningfulValue(detailField()),
    };
    return ["targetArea", "spaceType", "details"].filter((step) => stepComplete[step]).length;
  }

  function previewValues() {
    const values = [
      profile.location.display,
      profile.spaceType,
      profile.size,
    ];
    return values.filter((value) => String(value || "").trim()).slice(0, 4);
  }

  function summaryValues() {
    return [
      profile.location.display,
      profile.spaceType,
      profile.size,
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
      sizeOrPeople: profile.size || "",
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
      `Size: ${summary.sizeOrPeople || ""}`,
      summary.timing ? `Move-in timing: ${summary.timing}` : "",
      features.length ? `Features: ${features.join(" • ")}` : "",
      summary.featureOther ? `Other feature detail: ${summary.featureOther}` : "",
    ].filter((line) => line !== "").join("\n");
  }

  function buildLeadPayload() {
    const summary = profileSummaryData();
    const submittedSpaceType = normalizeSubmittedSpaceType(summary.spaceType);
    const phone = normalizedPhone(profile.contact.phone);
    const sizeOrPeople = summary.sizeOrPeople || "";
    const leadAttribution = analyticsAttribution("search_profile_submitted");
    return {
      lead_type: "location_profile",
      profile_version: PROFILE_VERSION,
      source: "rofo-search-profile",
      page_type: root.dataset.profileContextType || "search_profile",
      page_url: pageUrl,
      rofo_source: pageUrl,
      page_title: root.dataset.profilePageTitle || document.title,
      landing_page: leadAttribution.landing_page || "",
      referring_page: leadAttribution.referrer || "",
      entry_page_type: leadAttribution.entry_page_type || "",
      entry_district: leadAttribution.entry_district || "",
      entry_city: leadAttribution.entry_city || "",
      entry_comparison: leadAttribution.entry_comparison || "",
      entry_ecosystem: leadAttribution.entry_ecosystem || "",
      business_ecosystem: leadAttribution.business_ecosystem || "",
      final_page_before_search_profile: leadAttribution.final_page_before_search_profile || "",
      search_profile_started_page: leadAttribution.start_page_url || "",
      search_profile_submitted_page: pageUrl,
      search_profile_pages_viewed: String(leadAttribution.pages_viewed || 0),
      search_profile_pages_viewed_before_start: String(leadAttribution.pages_viewed_before_start || 0),
      search_profile_comparison_pages_viewed: String(leadAttribution.comparison_pages_viewed || 0),
      search_profile_district_pages_viewed: String(leadAttribution.district_pages_viewed || 0),
      search_profile_building_pages_viewed: String(leadAttribution.building_pages_viewed || 0),
      search_profile_duration_ms: String(leadAttribution.duration_ms || 0),
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
        attribution: leadAttribution,
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
    if (value === "Medical") return "Medical Office Space";
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

  function hasAdditionalLocationSelection(targetProfile = profile) {
    const currentLabel = locationOptionLabel();
    const selections = Array.isArray(targetProfile.locationSelections) ? targetProfile.locationSelections : [];
    return selections.some((label) => {
      if (label === "Other") return true;
      return locationKey(label) !== locationKey(currentLabel);
    });
  }

  function focusFirstProfileControl() {
    window.setTimeout(() => {
      const control = root.querySelector("[data-profile-step='targetArea'] button, [data-profile-options='spaceType'] button, [data-profile-next]");
      if (control && typeof control.focus === "function") {
        control.focus({ preventScroll: true });
      }
    }, 160);
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
    if (stepError) stepError.hidden = true;
    if (key === "spaceType" && meaningfulValue("spaceType")) trackStepCompleted("space_type");
    if ((key === "people" || key === "size") && meaningfulValue(key)) trackStepCompleted("size");
    if (key === "features") trackStepCompleted("features");
    render();
  }

  function shouldAutoAdvance(key) {
    return false;
  }

  function renderOptions(key, options) {
    const container = root.querySelector(`[data-profile-options="${key}"]`);
    if (!container) return;
    container.innerHTML = "";
    options.forEach((option) => {
      const optionLabel = typeof option === "object" ? option.label : option;
      const optionValue = typeof option === "object" ? option.value : option;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = optionLabel;
      button.dataset.profileValue = optionValue;
      const multi = key === "important" || key === "features";
      const selected = multi
        ? Array.isArray(profile[key]) && profile[key].includes(optionValue)
        : profile[key] === optionValue;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
      button.addEventListener("click", () => setProfileValue(key, optionValue, multi));
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
    if (stepError) stepError.hidden = true;
    if (meaningfulValue("targetArea")) trackStepCompleted("location");
    render();
  }

  function expandLocationOptions() {
    locationOptionsExpanded = true;
    renderLocationOptions();
    window.setTimeout(() => {
      const nextOption = locationOptionsContainer && locationOptionsContainer.querySelector("button:not(.is-selected):not(.search-profile-add-area)");
      if (nextOption && typeof nextOption.focus === "function") {
        nextOption.focus({ preventScroll: true });
      }
    }, 40);
  }

  function renderLocationOptions() {
    if (!locationOptionsContainer) return;
    const selected = new Set(Array.isArray(profile.locationSelections) ? profile.locationSelections : []);
    if (hasAdditionalLocationSelection(profile)) locationOptionsExpanded = true;
    const currentLabel = locationOptionLabel();
    locationOptionsContainer.innerHTML = "";
    const options = locationOptions();
    const visibleOptions = locationOptionsExpanded
      ? options
      : options.filter((option) => option !== "Other" && (selected.has(option) || locationKey(option) === locationKey(currentLabel)));

    visibleOptions.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option === "Other" ? "Other..." : option;
      button.classList.toggle("is-selected", selected.has(option));
      button.setAttribute("aria-pressed", String(selected.has(option)));
      button.addEventListener("click", () => toggleLocationSelection(option));
      locationOptionsContainer.appendChild(button);
    });

    if (!locationOptionsExpanded) {
      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "search-profile-add-area";
      addButton.textContent = "+ Add another area";
      addButton.addEventListener("click", expandLocationOptions);
      locationOptionsContainer.appendChild(addButton);
    }

    const showOther = selected.has("Other");
    if (locationOtherWrap) locationOtherWrap.hidden = !showOther;
    if (locationOtherInput) locationOtherInput.value = profile.locationOther || "";
  }

  function renderOptionSets() {
    renderLocationOptions();
    renderOptions("spaceType", spaceTypeOptions);
    renderOptions("features", activeConfig().features || ["Other"]);
    ["people", "use", "size", "workspaceStyle", "important"].forEach((key) => {
      renderOptions(key, key === "size" ? activeConfig()[key] || defaultSizeOptions : activeConfig()[key] || []);
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

  function validateInitialSearch() {
    const valid = meaningfulValue("targetArea") && meaningfulValue("spaceType") && meaningfulValue("size");
    if (stepError) stepError.hidden = valid;
    return valid;
  }

  function renderProfileSummaryList(list, options = {}) {
    const summary = profileSummaryData();
    list.innerHTML = "";
    const fields = [
      ["Location", summary.location.display],
      ["Space type", summary.spaceType],
      ["Size", summary.sizeOrPeople],
      summary.timing ? ["Move-in timing", summary.timing] : ["", ""],
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
    const summary = profileSummaryData();
    contactReminder.innerHTML = "";
    const item = document.createElement("li");
    item.textContent = [
      summary.location.display,
      summary.spaceType,
      summary.sizeOrPeople,
    ].filter((value) => String(value || "").trim()).join(" • ");
    contactReminder.appendChild(item);
  }

  function showActiveStep() {
    root.querySelectorAll("[data-profile-step]").forEach((fieldset) => {
      const key = fieldset.dataset.profileStep;
      fieldset.hidden = !["targetArea", "spaceType", "size"].includes(key);
    });

    stepCount.textContent = "1 / 2";
    root.classList.add("is-first-step");
    prevButton.hidden = true;
    resetButton.hidden = completedCount() === 0;
    nextButton.hidden = false;
    nextButton.textContent = "See Matching Buildings";
    progressBar.style.width = "50%";
  }

  function renderInputs() {
    root.querySelectorAll("[data-profile-input]").forEach((input) => {
      input.value = profile[input.dataset.profileInput] || "";
    });
  }

  function renderSummary() {
    const completed = completedCount();
    card.dataset.profileState = completed >= 3 ? "ready" : completed > 0 ? "in-progress" : "empty";
    root.classList.toggle("has-progressed", activeStepIndex > 0 || viewMode !== "edit");
    if (summaryTitle) {
      summaryTitle.textContent = "Free • Curated by local experts";
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

  mobileEntryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.profileTarget || "search-profile";
      if (root.id && targetId && root.id !== targetId) return;
      trackSearchProfileEvent("search_profile_mobile_entry_cta_clicked", { dedupe: false });
      setCollapsed(false);
      focusFirstProfileControl();
    });
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
    if (!validateInitialSearch()) return;
    trackSearchProfileEvent("search_profile_find_matching_buildings_clicked");
    trackStepCompleted("location");
    trackStepCompleted("space_type");
    trackStepCompleted("size");
    viewMode = "contact";
    trackSearchProfileEvent("search_profile_contact_screen_viewed");
    setCollapsed(false);
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
    locationOptionsExpanded = false;
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
    attribution.submitted_page_url = pageUrl;
    saveAttribution();
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
      contactSubmitButton.textContent = "Get My Personalized Shortlist";
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
