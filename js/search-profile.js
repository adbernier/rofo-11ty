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
  const locationIntentWrap = root.querySelector("[data-profile-location-intent]");
  const locationIntentOptionsContainer = root.querySelector("[data-profile-location-intent-options]");
  const locationSearchInput = root.querySelector("[data-profile-location-search-input]");
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
  const locationChipMode = root.dataset.profileLocationChipMode || "";
  const defaultSpaceType = root.dataset.profileDefaultSpaceType || "";
  const primaryCtaLabel = root.dataset.profilePrimaryCta || "Build My Location Brief";
  const contactCtaLabel = root.dataset.profileContactCta || "Build My Location Brief";
  const submitEnabled = root.dataset.profileSubmitEnabled === "true";
  const submitEndpoint = root.dataset.profileSubmitEndpoint || "/api/leads/submit";
  const profileLayout = root.dataset.profileLayout || "";
  const formStartTime = Date.now();
  const analyticsEndpoint = "/api/analytics/search-profile";
  const recommendationsUrl = "/recommendations/";
  const recommendationContextKey = "rofoRecommendationContextV1";
  const analyticsEnabled = submitEnabled && root.dataset.profileContextType !== "test";
  const pageUrl = root.dataset.profilePageUrl || window.location.href;
  const pageType = root.dataset.profileContextType || "search_profile";
  const LOCATION_SEARCH_ENDPOINT = "/data/location-search.json";
  let locationSearchItems = null;
  let locationSearchPromise = null;
  let locationAutocompleteResults = null;
  let locationAutocompleteInput = null;

  const PROFILE_VERSION = "V2";
  const nonLocationLabels = new Set([
    "find the right location",
    "location profile",
    "get recommendations",
    "get location recommendations that fit",
    "find my best locations",
    "see my recommendations",
    "location advisor",
    "location strategy",
  ]);
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
  const locationIntentOptions = [
    {
      label: "Start with this location",
      value: "focus",
      description: "Use this as the primary location to evaluate.",
    },
    {
      label: "Compare with nearby markets",
      value: "compare",
      description: "Recommend this location and nearby alternatives worth testing.",
    },
    {
      label: "Recommend the best markets",
      value: "discover",
      description: "Use my profile to find the strongest location fit.",
    },
  ];

  function normalizeLocationIntent(value, fallback = "") {
    const normalized = String(value || "").trim().toLowerCase();
    return ["focus", "compare", "discover"].includes(normalized) ? normalized : fallback;
  }

  function locationIntentLabel(value) {
    const normalized = normalizeLocationIntent(value, "compare");
    const option = locationIntentOptions.find((item) => item.value === normalized);
    return option ? option.label : "Compare with nearby markets";
  }
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

  function normalizeQuerySpaceType(value) {
    const normalized = String(value || "").trim().toLowerCase().replace(/[-_]+/g, " ");
    if (!normalized) return "";
    if (normalized.includes("industrial") || normalized.includes("warehouse")) return "Industrial / Warehouse";
    if (normalized.includes("retail")) return "Retail";
    if (normalized.includes("medical")) return "Medical";
    if (normalized.includes("flex")) return "Flex";
    if (normalized.includes("coworking")) return "Coworking";
    if (normalized.includes("office")) return "Office";
    const direct = spaceTypeOptions.find((item) => item.value.toLowerCase() === normalized || item.label.toLowerCase() === normalized);
    return direct ? direct.value : "";
  }

  function parseRecommendationEntryContext() {
    const params = new URLSearchParams(window.location.search || "");
    const source = String(params.get("source") || "").trim();
    const sourcePath = String(params.get("sourcePath") || "").trim();
    const city = cleanLocationLabel(params.get("city") || "");
    const state = String(params.get("state") || "").trim();
    const district = cleanLocationLabel(params.get("district") || "");
    const location = cleanLocationLabel(params.get("location") || "");
    const locationA = cleanLocationLabel(params.get("locationA") || "");
    const locationB = cleanLocationLabel(params.get("locationB") || "");
    const spaceType = normalizeQuerySpaceType(params.get("spaceType") || "");
    const locations = [];

    if (locationA) {
      locations.push({ label: locationA, type: "district", city, state, slug: "", path: "" });
    }
    if (locationB) {
      locations.push({ label: locationB, type: "district", city, state, slug: "", path: "" });
    }
    if (!locations.length && district) {
      locations.push({ label: district, type: "district", city, state, slug: "", path: "" });
    }
    if (!locations.length && location) {
      locations.push({ label: location, type: "location", city, state, slug: "", path: "" });
    }
    if (!locations.length && city) {
      locations.push({ label: city, type: "city", city, state, slug: "", path: "" });
    }

    const cleanLocations = normalizeSelectedLocations(locations, []);
    return {
      hasContext: Boolean(cleanLocations.length || spaceType || source || sourcePath),
      source,
      sourcePath,
      locations: cleanLocations,
      spaceType,
    };
  }

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

  function isNonLocationLabel(value) {
    const key = locationKey(value);
    return !key || nonLocationLabels.has(key);
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

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (match) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[match]);
  }

  function locationMeta(item) {
    return [item.city, item.state, item.type === "district" ? "district" : "city"]
      .filter(Boolean)
      .join(" • ");
  }

  function selectedLocationKey(item) {
    if (!item) return "";
    return [
      item.type || "location",
      item.path || item.slug || item.label || "",
    ].map((value) => String(value || "").toLowerCase().trim()).join("|");
  }

  function locationItemFromSuggestion(item) {
    const label = cleanLocationLabel(item && item.label);
    if (!label) return null;
    return {
      label,
      type: item.type || "location",
      city: item.city || (item.type === "city" ? label : ""),
      state: item.state || contextState || "",
      slug: item.slug || "",
      path: item.path || "",
    };
  }

  function inferredLocationType(cleanLabel, fallbackType = "location") {
    if (fallbackType && fallbackType !== "location") return fallbackType;
    if (contextCity && locationKey(cleanLabel) === locationKey(contextCity)) return "city";
    if (contextDistrict && locationKey(cleanLabel) === locationKey(contextDistrict)) return "district";
    if ((contextType === "city" || contextType === "space_type") && locationKey(cleanLabel) === locationKey(locationOptionLabel())) return "city";
    if ((contextType === "district" || contextType === "comparison") && locationKey(cleanLabel) === locationKey(locationOptionLabel())) return "district";
    return "location";
  }

  function locationItemFromLabel(label, type = "location") {
    const cleanLabel = cleanLocationLabel(label);
    if (!cleanLabel || isNonLocationLabel(cleanLabel)) return null;
    const inferredType = inferredLocationType(cleanLabel, type);
    return {
      label: cleanLabel,
      type: inferredType,
      city: inferredType === "city" ? cleanLabel : contextCity || "",
      state: contextState || "",
      slug: "",
      path: "",
    };
  }

  function normalizeSelectedLocations(value, labels = []) {
    const output = [];
    const seen = new Set();
    const seenLabels = new Set();
    const add = (item) => {
      const normalized = typeof item === "string" ? locationItemFromLabel(item) : locationItemFromSuggestion(item);
      if (!normalized) return;
      const key = selectedLocationKey(normalized) || locationKey(normalized.label);
      const labelKey = locationKey(normalized.label);
      if (!key || seen.has(key) || seenLabels.has(labelKey)) return;
      seen.add(key);
      seenLabels.add(labelKey);
      output.push(normalized);
    };
    if (Array.isArray(value)) value.forEach(add);
    labels.forEach((label) => {
      if (label !== "Other") add(label);
    });
    return output;
  }

  function syncSelectedLocationsFromSelections() {
    profile.selectedLocations = normalizeSelectedLocations(profile.selectedLocations, selectedLocationLabels(profile));
  }

  function ensureLocationAutocompleteResults(input = locationSearchInput || locationOtherInput) {
    if (!input) return null;
    if (!locationAutocompleteResults) {
      locationAutocompleteResults = document.createElement("div");
      locationAutocompleteResults.className = "search-profile-location-results";
      locationAutocompleteResults.setAttribute("role", "listbox");
      locationAutocompleteResults.hidden = true;
    }
    if (locationAutocompleteInput !== input && input.parentNode) {
      input.parentNode.insertBefore(locationAutocompleteResults, input.nextSibling);
      locationAutocompleteInput = input;
    }
    input.setAttribute("autocomplete", "off");
    input.setAttribute("aria-autocomplete", "list");
    return locationAutocompleteResults;
  }

  async function loadLocationSearchItems() {
    if (locationSearchItems) return locationSearchItems;
    if (!locationSearchPromise) {
      locationSearchPromise = fetch(LOCATION_SEARCH_ENDPOINT, { cache: "force-cache" })
        .then((response) => {
          if (!response.ok) throw new Error(`Failed to load ${LOCATION_SEARCH_ENDPOINT}: ${response.status}`);
          return response.json();
        })
        .then((items) => {
          locationSearchItems = Array.isArray(items) ? items : [];
          return locationSearchItems;
        })
        .catch((error) => {
          console.error("Search Profile location search failed to load:", error);
          locationSearchPromise = null;
          return [];
        });
    }
    return locationSearchPromise;
  }

  function hideLocationAutocomplete() {
    if (!locationAutocompleteResults) return;
    locationAutocompleteResults.hidden = true;
    locationAutocompleteResults.innerHTML = "";
  }

  function selectLocationSuggestion(item) {
    if (!item || !item.label) return;
    const locationItem = locationItemFromSuggestion(item);
    if (!locationItem) return;
    trackStarted();
    profile.skipped = false;
    profile.contact.submitted = false;
    viewMode = "edit";
    locationOptionsExpanded = true;
    const label = locationItem.label;
    if (!locationSuggestionLabels.some((existing) => locationKey(existing) === locationKey(label))) {
      locationSuggestionLabels.push(label);
    }
    const selections = new Set(Array.isArray(profile.locationSelections) ? profile.locationSelections : []);
    selections.delete("Other");
    selections.add(label);
    profile.locationSelections = [...selections];
    const selectedLocations = normalizeSelectedLocations(profile.selectedLocations, [])
      .filter((existing) => selectedLocationKey(existing) !== selectedLocationKey(locationItem) && locationKey(existing.label) !== locationKey(label));
    selectedLocations.push(locationItem);
    profile.selectedLocations = normalizeSelectedLocations(selectedLocations, profile.locationSelections);
    profile.locationOther = "";
    if (locationSearchInput) locationSearchInput.value = "";
    if (locationOtherInput) locationOtherInput.value = "";
    updateLocationFromSelections();
    profile.location = {
      ...normalizeLocation(profile.location),
      city: locationItem.type === "city" ? label : locationItem.city || profile.location.city || null,
      district: locationItem.type === "district" ? label : profile.location.district || null,
      state: locationItem.state || profile.location.state || contextState || null,
      raw: profile.location.display || label,
    };
    saveProfile();
    hideLocationAutocomplete();
    if (stepError) stepError.hidden = true;
    if (meaningfulValue("targetArea")) trackStepCompleted("location");
    render();
  }

  async function renderLocationAutocomplete(query, input = locationSearchInput || locationOtherInput) {
    const resultsBox = ensureLocationAutocompleteResults(input);
    if (!resultsBox) return;
    const q = String(query || "").trim().toLowerCase();
    if (q.length < 2) {
      hideLocationAutocomplete();
      return;
    }
    const items = await loadLocationSearchItems();
    const selectedKeys = new Set((profile.locationSelections || []).map(locationKey));
    const selectedStableKeys = new Set((profile.selectedLocations || []).map(selectedLocationKey).filter(Boolean));
    const matches = items
      .filter((item) => {
        const search = String(item.search || item.label || "").toLowerCase();
        const itemKey = selectedLocationKey(item);
        return search.includes(q) && !selectedKeys.has(locationKey(item.label)) && (!itemKey || !selectedStableKeys.has(itemKey));
      })
      .sort((a, b) => {
        const aLabel = String(a.label || "").toLowerCase();
        const bLabel = String(b.label || "").toLowerCase();
        const aStarts = aLabel.startsWith(q) ? 0 : 1;
        const bStarts = bLabel.startsWith(q) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        if (a.type !== b.type) return a.type === "city" ? -1 : 1;
        return 0;
      })
      .slice(0, 8);

    if (!matches.length) {
      hideLocationAutocomplete();
      return;
    }

    resultsBox.innerHTML = matches.map((item, index) => `
      <button class="search-profile-location-result" type="button" role="option" data-location-result-index="${index}">
        <span>${escapeHtml(item.label)}</span>
        <small>${escapeHtml(locationMeta(item))}</small>
      </button>
    `).join("");
    resultsBox.hidden = false;
    resultsBox.querySelectorAll("[data-location-result-index]").forEach((button) => {
      const item = matches[Number(button.dataset.locationResultIndex)];
      button.addEventListener("click", () => selectLocationSuggestion(item));
    });
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
    return cleanLocationLabel(contextDistrict || contextCity || contextTargetArea);
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
    const selected = Array.isArray(profile.locationSelections) ? profile.locationSelections.filter((label) => label !== "Other") : [];
    const selectedOptions = uniqueLabels(selected.filter((label) => !isNonLocationLabel(label)));
    if (locationChipMode === "selected_only") {
      return selectedOptions;
    }
    const suggestedOptions = uniqueLabels([
      locationOptionLabel(),
      ...locationSuggestionLabels,
    ].filter((label) => !isNonLocationLabel(label))).slice(0, 6);
    const options = uniqueLabels([
      ...selectedOptions,
      ...suggestedOptions,
    ]);
    return [...options, "Other"];
  }

  function normalizeLocationSelections(value, fallbackLocation) {
    if (Array.isArray(value)) {
      return uniqueLabels(value.map((item) => typeof item === "string" ? item : item && item.label).filter((label) => !isNonLocationLabel(label)));
    }
    const fallbackLabel = fallbackLocation && fallbackLocation.display === contextLocation().display
      ? locationOptionLabel()
      : fallbackLocation && fallbackLocation.display;
    return uniqueLabels([fallbackLabel || locationOptionLabel()].filter((label) => !isNonLocationLabel(label)));
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
    const structuredLocations = normalizeSelectedLocations(targetProfile.selectedLocations, labels);
    const fallback = contextLocation();
    const currentLabel = locationOptionLabel();
    const cityWithState = [contextCity, contextState].filter(Boolean).join(", ");
    let display = fallback.display;
    let structuredCity = contextCity || null;
    let structuredDistrict = contextType === "district" || contextType === "comparison" ? contextDistrict || null : null;
    let structuredState = contextState || null;

    if (labels.length === 1 && locationKey(labels[0]) === locationKey(currentLabel)) {
      return fallback;
    }

    if (labels.length) {
      const labelDisplay = labels.join(" / ");
      display = (contextType === "district" || contextType === "comparison") && cityWithState
        ? `${cityWithState} — ${labelDisplay}`
        : labelDisplay;
      if (structuredLocations.length === 1) {
        const item = structuredLocations[0];
        structuredCity = item.type === "city" ? item.label : item.city || structuredCity;
        structuredDistrict = item.type === "district" ? item.label : structuredDistrict;
        structuredState = item.state || structuredState;
      } else if (structuredLocations.length > 1) {
        structuredCity = contextCity || "";
        structuredDistrict = structuredLocations
          .filter((item) => item.type === "district")
          .map((item) => item.label)
          .join(" / ") || structuredDistrict;
        structuredState = structuredLocations.find((item) => item.state)?.state || structuredState;
      }
    }

    return {
      ...normalizeLocation(targetProfile.location),
      display,
      city: structuredCity || null,
      district: structuredDistrict || null,
      street: contextStreet || null,
      state: structuredState || null,
      raw: display,
    };
  }

  const recommendationEntryContext = parseRecommendationEntryContext();

  function locationFromRecommendationEntry(entryContext) {
    const locations = entryContext.locations || [];
    const labels = locations.map((location) => location.label).filter(Boolean);
    const first = locations[0] || {};
    const districtLabels = locations
      .filter((location) => location.type === "district")
      .map((location) => location.label)
      .filter(Boolean);
    const display = labels.join(" / ");
    return {
      display,
      city: first.type === "city" ? first.label : first.city || null,
      district: districtLabels.join(" / ") || (first.type === "district" ? first.label : null),
      street: null,
      state: first.state || contextState || null,
      raw: display,
    };
  }

  function applyRecommendationEntryContext(targetProfile) {
    if (!recommendationEntryContext.hasContext) return targetProfile;
    const locations = recommendationEntryContext.locations || [];
    const labels = locations.map((location) => location.label).filter(Boolean);
    const nextProfile = {
      ...targetProfile,
      sourceContext: {
        ...(targetProfile.sourceContext || {}),
        recommendationEntrySource: recommendationEntryContext.source || "",
        recommendationEntrySourcePath: recommendationEntryContext.sourcePath || "",
      },
    };

    if (locations.length) {
      nextProfile.locationSelections = uniqueLabels(labels);
      nextProfile.selectedLocations = normalizeSelectedLocations(locations, nextProfile.locationSelections);
      nextProfile.location = locationFromRecommendationEntry(recommendationEntryContext);
      nextProfile.targetArea = nextProfile.location.display;
      nextProfile.locationOther = "";
    }

    if (recommendationEntryContext.spaceType && pathConfig[recommendationEntryContext.spaceType]) {
      nextProfile.spaceType = recommendationEntryContext.spaceType;
    }

    nextProfile.contact = {
      ...(nextProfile.contact || {}),
      submitted: false,
    };

    return nextProfile;
  }

  function updateLocationFromSelections() {
    syncSelectedLocationsFromSelections();
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
    spaceType: recommendationEntryContext.spaceType || (defaultSpaceType && pathConfig[defaultSpaceType] ? defaultSpaceType : ""),
    people: "",
    use: "",
    size: "",
    timing: "",
    workspaceStyle: "",
    important: [],
    priorities: [],
    features: [],
    featureOther: "",
    locationSelections: recommendationEntryContext.locations.length ? recommendationEntryContext.locations.map((location) => location.label) : (locationOptionLabel() ? [locationOptionLabel()] : []),
    selectedLocations: recommendationEntryContext.locations.length ? recommendationEntryContext.locations : normalizeSelectedLocations([], locationOptionLabel() ? [locationOptionLabel()] : []),
    locationIntent: "",
    locationOther: "",
    location: recommendationEntryContext.locations.length ? locationFromRecommendationEntry(recommendationEntryContext) : contextLocation(),
    contact: {
      submitted: false,
      name: "",
      email: "",
      phone: "",
    },
    targetArea: recommendationEntryContext.locations.length ? locationFromRecommendationEntry(recommendationEntryContext).display : contextTargetArea,
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
      merged.selectedLocations = normalizeSelectedLocations(stored.selectedLocations, merged.locationSelections);
      merged.locationIntent = normalizeLocationIntent(stored.locationIntent, defaultProfile.locationIntent || "");
      const currentLabel = locationOptionLabel();
      if (currentLabel && !merged.locationSelections.some((label) => label.toLowerCase() === currentLabel.toLowerCase())) {
        merged.locationSelections.unshift(currentLabel);
        merged.selectedLocations = normalizeSelectedLocations(merged.selectedLocations, merged.locationSelections);
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
      return applyRecommendationEntryContext(merged);
    } catch (error) {
      return applyRecommendationEntryContext({
        ...defaultProfile,
        location: contextLocation(),
        locationSelections: locationOptionLabel() ? [locationOptionLabel()] : [],
        selectedLocations: normalizeSelectedLocations([], locationOptionLabel() ? [locationOptionLabel()] : []),
        locationIntent: defaultProfile.locationIntent || "",
        locationOther: "",
        targetArea: contextLocation().display,
        sourceContext: { ...defaultProfile.sourceContext },
        contact: { ...defaultProfile.contact },
      });
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
      selected_locations: summary.selectedLocations,
      locations: summary.selectedLocations,
      location_intent: summary.locationIntent || "compare",
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

  function renderRecommendationEntryNote() {
    const note = document.querySelector("[data-profile-query-context]");
    const list = document.querySelector("[data-profile-query-context-list]");
    if (!note || !list || !recommendationEntryContext.hasContext) return;
    const items = [
      ...(recommendationEntryContext.locations || []).map((location) => location.label),
      recommendationEntryContext.spaceType,
    ].filter(Boolean);
    if (!items.length) return;
    list.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    note.hidden = false;
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
      selectedLocations: normalizeSelectedLocations(profile.selectedLocations, selectedLocationLabels(profile)),
      spaceType: profile.spaceType || "",
      sizeOrPeople: profile.size || "",
      timing: profile.timing || "",
      features: Array.isArray(profile.features) ? [...profile.features] : [],
      featureOther: profile.featureOther || "",
      locationIntent: normalizeLocationIntent(profile.locationIntent, ""),
    };
  }

  function recommendationContextData() {
    const summary = profileSummaryData();
    return {
      locations: normalizeSelectedLocations(summary.selectedLocations, selectedLocationLabels(profile)).map((item) => ({
        label: item.label || "",
        type: item.type || "location",
        city: item.city || "",
        state: item.state || "",
        slug: item.slug || "",
        path: item.path || "",
      })),
      spaceType: summary.spaceType || "",
      size: summary.sizeOrPeople || "",
      timing: summary.timing || "",
      locationIntent: normalizeLocationIntent(summary.locationIntent, "compare"),
      timestamp: new Date().toISOString(),
    };
  }

  function saveRecommendationContext() {
    const context = recommendationContextData();
    try {
      window.sessionStorage.setItem(recommendationContextKey, JSON.stringify(context));
      window.localStorage.setItem(recommendationContextKey, JSON.stringify(context));
    } catch (error) {
      // Recommendations should still be reachable even if browser storage is unavailable.
    }
    return context;
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
      "Business Profile summary",
      "",
      `Location: ${summary.location.display || ""}`,
      `Space type: ${summary.spaceType || ""}`,
      `Size: ${summary.sizeOrPeople || ""}`,
      `Location intent: ${locationIntentLabel(summary.locationIntent)}`,
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
      location_intent: normalizeLocationIntent(summary.locationIntent, "compare"),
      location_intent_label: locationIntentLabel(summary.locationIntent),
      location_profile_feature_other: summary.featureOther || "",
      selected_locations: JSON.stringify(summary.selectedLocations),
      locations: JSON.stringify(summary.selectedLocations),
      location_profile_json: JSON.stringify({
        location: summary.location,
        selected_locations: summary.selectedLocations,
        locations: summary.selectedLocations,
        location_intent: normalizeLocationIntent(summary.locationIntent, "compare"),
        location_intent_label: locationIntentLabel(summary.locationIntent),
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
      const requiredChoice = ["spaceType", "timing", "people", "size", "locationIntent"].includes(key);
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
    syncSelectedLocationsFromSelections();
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
      : options.filter((option) => option !== "Other" && (selected.has(option) || (currentLabel && locationKey(option) === locationKey(currentLabel))));

    if (!visibleOptions.length && !locationOptionsExpanded) {
      const emptyState = document.createElement("p");
      emptyState.className = "search-profile-location-empty";
      emptyState.textContent = "Where are you considering?";
      locationOptionsContainer.appendChild(emptyState);
    }

    visibleOptions.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option === "Other" ? "Other..." : option;
      button.classList.toggle("is-selected", selected.has(option));
      button.setAttribute("aria-pressed", String(selected.has(option)));
      button.addEventListener("click", () => toggleLocationSelection(option));
      locationOptionsContainer.appendChild(button);
    });

    if (!locationOptionsExpanded && locationChipMode !== "selected_only") {
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

  function renderLocationIntent() {
    if (!locationIntentWrap || !locationIntentOptionsContainer) return;
    const hasLocation = meaningfulValue("targetArea");
    locationIntentWrap.hidden = !hasLocation;
    locationIntentOptionsContainer.innerHTML = "";
    if (!hasLocation) return;

    locationIntentOptions.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-profile-location-intent__option";
      button.dataset.profileValue = option.value;
      button.setAttribute("aria-pressed", String(profile.locationIntent === option.value));
      button.classList.toggle("is-selected", profile.locationIntent === option.value);

      const label = document.createElement("strong");
      label.textContent = option.label;
      const description = document.createElement("span");
      description.textContent = option.description;
      button.append(label, description);

      button.addEventListener("click", () => setProfileValue("locationIntent", option.value, false));
      locationIntentOptionsContainer.appendChild(button);
    });
  }

  function renderOptionSets() {
    renderLocationOptions();
    renderLocationIntent();
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
      ["Starting location", summary.location.display],
      ["Space type", summary.spaceType],
      ["Approximate size", summary.sizeOrPeople],
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
    heading.textContent = "Your Business Profile";
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

    stepCount.textContent = "Business Profile";
    root.classList.add("is-first-step");
    prevButton.hidden = true;
    resetButton.hidden = completedCount() === 0;
    nextButton.hidden = false;
    nextButton.textContent = primaryCtaLabel;
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
      summaryTitle.textContent = "Private while exploring • Free";
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
      if (!Array.isArray(profile.locationSelections)) profile.locationSelections = locationOptionLabel() ? [locationOptionLabel()] : [];
      if (!profile.locationSelections.includes("Other")) profile.locationSelections.push("Other");
      syncSelectedLocationsFromSelections();
      updateLocationFromSelections();
      renderLocationAutocomplete(event.target.value, event.target);
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

  if (locationSearchInput) {
    locationSearchInput.addEventListener("input", (event) => {
      renderLocationAutocomplete(event.target.value, event.target);
    });

    locationSearchInput.addEventListener("focus", () => {
      renderLocationAutocomplete(locationSearchInput.value, locationSearchInput);
    });

    locationSearchInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      if (!locationAutocompleteResults || locationAutocompleteResults.hidden) return;
      const firstResult = locationAutocompleteResults.querySelector("[data-location-result-index]");
      if (!firstResult) return;
      event.preventDefault();
      firstResult.click();
    });
  }

  if (locationOtherInput) {
    locationOtherInput.addEventListener("focus", () => {
      renderLocationAutocomplete(locationOtherInput.value, locationOtherInput);
    });

    locationOtherInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      if (!locationAutocompleteResults || locationAutocompleteResults.hidden) return;
      const firstResult = locationAutocompleteResults.querySelector("[data-location-result-index]");
      if (!firstResult) return;
      event.preventDefault();
      firstResult.click();
    });
  }

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) hideLocationAutocomplete();
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
    saveRecommendationContext();
    trackSearchProfileEvent("search_profile_build_location_brief_clicked");
    trackStepCompleted("location");
    trackStepCompleted("space_type");
    trackStepCompleted("size");
    if (pageType === "find_locations") {
      window.location.assign(recommendationsUrl);
      return;
    }
    viewMode = "contact";
    trackSearchProfileEvent("search_profile_contact_screen_viewed");
    setCollapsed(false);
    render();
  });

  resetButton.addEventListener("click", () => {
    profile = applyRecommendationEntryContext({
      ...defaultProfile,
      location: contextLocation(),
      targetArea: contextLocation().display,
      locationSelections: locationOptionLabel() ? [locationOptionLabel()] : [],
      selectedLocations: normalizeSelectedLocations([], locationOptionLabel() ? [locationOptionLabel()] : []),
      locationOther: "",
      sourceContext: { ...defaultProfile.sourceContext },
      contact: { ...defaultProfile.contact },
    });
    activeStepIndex = 0;
    viewMode = "edit";
    window.localStorage.removeItem(STORAGE_KEY);
    locationOptionsExpanded = false;
    if (locationSearchInput) locationSearchInput.value = "";
    hideLocationAutocomplete();
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
      saveRecommendationContext();
      window.setTimeout(() => {
        window.location.assign(recommendationsUrl);
      }, 350);
    }).catch(() => {
      if (submitError) {
        submitError.textContent = "Your profile could not be saved. Please try again.";
        submitError.hidden = false;
      }
    }).finally(() => {
      contactSubmitButton.disabled = false;
      contactSubmitButton.textContent = contactCtaLabel;
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setCollapsed(true);
  });

  renderRecommendationEntryNote();
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
