import {
  ACTIVITY_CHOICE_GROUPS,
  applyInterviewAnswer,
  backInterview,
  createInterviewState,
  createSeededInterview,
  hydrateInterviewState,
  interviewDebug,
  selectNextQuestion,
} from "/js/requirements/requirement-interview-v1.mjs";
import { updateCriterion } from "/js/requirements/requirement-domain-v1.mjs";
import { canonicalMarketSuggestions, inputControlSpec } from "/js/requirements/requirement-input-controls-v1.mjs";
import { seedTrustedEntryContext } from "/js/requirements/requirement-entry-context-bootstrap.mjs";

const root = document.querySelector("[data-requirement-prototype]");
if (root) {
  const SESSION_KEY = "rofoRequirementAdaptiveInterviewV1";
  const SESSION_STATE_VERSION = "requirement-prototype-session:v2";
  const query = new URLSearchParams(location.search);
  const publicExperience = root.dataset.requirementExperience === "public";
  const requestedIntent = publicExperience ? query.get("journey") : query.get("locationBriefV2");
  const locationBriefV2Intent = ["new", "edit"].includes(requestedIntent) ? requestedIntent : publicExperience ? "new" : "";
  const locationBriefV2Mode = Boolean(locationBriefV2Intent);
  const locationBriefV2PublicId = query.get("brief") || "";
  const STATUSES = ["REQUIRED", "PREFERRED", "FLEXIBLE", "UNKNOWN", "VERIFY"];
  const scenarios = Array.isArray(window.RofoRequirementPrototypeScenarios) ? window.RofoRequirementPrototypeScenarios : [];
  const canonicalMarkets = (() => {
    try { return JSON.parse(root.querySelector("[data-requirement-markets]")?.textContent || "[]"); } catch (error) { return []; }
  })();
  const districtGeography = (() => {
    try { return JSON.parse(root.querySelector("[data-requirement-districts]")?.textContent || "{\"markets\":{}}"); } catch (error) { return { markets: {} }; }
  })();
  const sfOfficeRecommendationModel = (() => {
    try { return JSON.parse(root.querySelector("[data-sf-office-recommendation-model]")?.textContent || "{}"); } catch (error) { return {}; }
  })();
  const sfAccessFoundation = (() => {
    try { return JSON.parse(root.querySelector("[data-sf-access-foundation]")?.textContent || "{}"); } catch (error) { return {}; }
  })();
  const sfOfficeCompositionFoundation = (() => {
    try { return JSON.parse(root.querySelector("[data-sf-office-composition-foundation]")?.textContent || "{}"); } catch (error) { return {}; }
  })();
  const elements = Object.fromEntries([
    "scenario-buttons", "understanding", "understanding-summary", "search-summary", "search-summary-empty", "progress-bar", "requirement-loading", "interview", "stage-label", "question-position",
    "question-kicker", "question-prompt", "question-visible-help", "answer-control", "question-help", "question-error",
    "back-question", "continue-question", "finish-early", "requirement-complete", "requirement-title", "readiness-summary",
    "requirement-summary", "requirement-criteria", "recommendation-preview", "preview-heading", "preview-intro", "preview-results", "candidate-comparisons", "preview-coverage", "access-shadow", "composition-debug", "debug-meta", "debug-json",
  ].map((name) => [name, root.querySelector(`[data-${name}]`)]));

  function initialState() {
    return { interview: createInterviewState({ districtGeography }), mode: "interview", draft: null };
  }

  function restore() {
    try {
      const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (stored && stored.sessionStateVersion === SESSION_STATE_VERSION && stored.interview) return { ...initialState(), ...stored, interview: hydrateInterviewState(stored.interview) };
    } catch (error) {
      // Session recovery is optional.
    }
    return initialState();
  }

  function clearPrototypePersistence() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (error) { /* Storage is optional. */ }
    try { localStorage.removeItem(SESSION_KEY); } catch (error) { /* Clear compatible state from older prototype persistence. */ }
  }

  const publicEntryContext = {
    sourceType: query.get("source") || (publicExperience ? "public_requirement" : "operator_requirement_interview"),
    sourcePath: query.get("sourcePath") || document.referrer || location.pathname,
    marketId: query.get("marketId") || (/^san francisco$/i.test(query.get("city") || "") ? "san-francisco" : ""),
    propertyType: /office/i.test(query.get("propertyType") || query.get("spaceType") || "") ? "office" : "",
    candidateDistrictIds: [query.get("districtId") || ""].filter(Boolean),
    candidateDistrictNames: [query.get("district") || ""].filter(Boolean),
    businessIdentityId: query.get("businessIdentityId") || query.get("businessArchetype") || "",
    campaign: query.get("campaign") || "", queryFamily: query.get("queryFamily") || "",
    referrer: document.referrer || "", landingPage: location.href,
  };

  if (locationBriefV2Mode) clearPrototypePersistence();
  const restoredState = locationBriefV2Mode ? initialState() : restore();
  let state = { ...restoredState, interview: seedTrustedEntryContext(restoredState.interview, { ...publicEntryContext, intent: publicExperience ? locationBriefV2Intent : "" }, districtGeography) };
  let locationBriefV2Context = { intent: locationBriefV2Intent, publicId: locationBriefV2PublicId, revisionNumber: null };
  const creationRequestId = publicExperience && locationBriefV2Intent === "new" && window.crypto?.randomUUID ? window.crypto.randomUUID() : "";

  function trackVNext(eventName, extra = {}) {
    if (!publicExperience) return;
    try { const payload = JSON.stringify({ event_name: eventName, profile_version: "location-brief:v2", context: { page_type: "location_requirement_vnext", page_url: location.pathname, city: "San Francisco", space_type: "Office", ...extra }, profile: { profile_version: "location-brief:v2", space_type: "Office" }, attribution: { entry_page_type: publicEntryContext.sourceType || "", landing_page: publicEntryContext.landingPage || location.href, referrer: publicEntryContext.referrer || "" } }); if (navigator.sendBeacon) navigator.sendBeacon("/api/analytics/search-profile", new Blob([payload], { type: "application/json" })); } catch (error) { /* Analytics never blocks the Requirement. */ }
  }

  function persist() {
    if (locationBriefV2Mode) return;
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...state, sessionStateVersion: SESSION_STATE_VERSION })); } catch (error) { /* Never block the interview. */ }
  }

  function entryContextFor(requirement) {
    return { ...publicEntryContext, sourceType: publicExperience ? publicEntryContext.sourceType : "operator_requirement_interview", sourcePath: publicEntryContext.sourcePath || location.pathname, marketId: requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId || publicEntryContext.marketId, propertyType: requirement.propertyTypes?.[0] || publicEntryContext.propertyType, candidateDistrictIds: requirement.locationLogic?.specificPreference?.candidateDistrictIds || publicEntryContext.candidateDistrictIds };
  }

  async function persistLocationBriefV2(requirement) {
    const editing = locationBriefV2Context.intent === "edit";
    const url = editing ? `/api/location-brief-v2/${encodeURIComponent(locationBriefV2Context.publicId)}` : "/api/location-brief-v2/create";
    const body = editing ? { requirement, expectedRevision: locationBriefV2Context.revisionNumber } : { requirement, entryContext: entryContextFor(requirement), creationRequestId };
    const response = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Location Brief v2 could not be saved.");
    trackVNext("vnext_requirement_completed", { readiness: result.readiness || "" });
    clearPrototypePersistence();
    location.href = result.briefUrl || (publicExperience ? `/location-brief/${encodeURIComponent(result.publicId)}` : `/operator/location-brief-v2/${encodeURIComponent(result.publicId)}`);
  }

  const node = (tag, className = "", text = "") => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text) item.textContent = text;
    return item;
  };

  function showError(message = "") {
    elements["question-error"].textContent = message;
    elements["question-error"].hidden = !message;
  }

  function selectedAnswer(question) {
    const control = elements["answer-control"];
    if (control.dataset.specialAnswer === "unknown") return { unknown: true };
    if (control.dataset.specialAnswer === "none") return { optionId: "none" };
    if (question.answerType === "district_multi") {
      const noPreference = Boolean(control.querySelector("[data-no-district-preference]:checked"));
      const districtIds = [...control.querySelectorAll("[data-canonical-district]:checked")].map((input) => input.value);
      const informal = control.querySelector("[data-district-other-text]");
      return { noPreference, districtIds, otherText: noPreference || !informal ? "" : informal.value };
    }
    const other = control.querySelector("[data-other-text]");
    if (other && !other.hidden && other.value.trim()) return { text: other.value.trim() };
    if (question.answerType === "activity_multi") {
      const groups = [...control.querySelectorAll("input:checked")].map((input) => ACTIVITY_CHOICE_GROUPS.find((item) => item.id === input.value)).filter(Boolean);
      return { activityIds: Array.from(new Set(groups.flatMap((item) => item.activities))) };
    }
    if (question.answerType === "multi") {
      const optionIds = [...control.querySelectorAll("input:checked")].map((input) => input.value);
      return optionIds.includes("__unknown") ? { unknown: true } : { optionIds };
    }
    const text = control.querySelector("textarea:not([hidden]), input[type='text'], input[type='number']");
    if (text) {
      const answer = { text: text.value.trim() };
      if (question.answerType === "market_select" && answer.text) {
        try { answer.market = JSON.parse(control.dataset.selectedMarket || "null") || undefined; } catch (error) { answer.market = undefined; }
        const normalized = answer.text.toLowerCase();
        const match = !answer.market && canonicalMarkets.find((market) => {
          const names = [market.marketName, `${market.marketName}, ${market.state}`, ...(market.cities || []), ...(market.cities || []).map((city) => `${city}, ${market.state}`)];
          return names.some((name) => String(name).toLowerCase() === normalized);
        });
        if (match) answer.market = { geographyId: match.marketId, marketId: match.marketId, marketName: match.marketName, city: (match.cities || []).find((city) => city.toLowerCase() === normalized || `${city}, ${match.state}`.toLowerCase() === normalized) || "", state: match.state, displayName: answer.text };
      }
      return answer;
    }
    const selected = control.querySelector("input:checked");
    if (selected && selected.value === "__unknown") return { unknown: true };
    return selected ? { optionId: selected.value } : null;
  }

  async function submitAnswer(question, answer = null) {
    showError();
    let result = answer || selectedAnswer(question);
    if (question.answerType === "final_text" && result && !result.text && !result.optionId) result = { optionId: "none" };
    if (!result || (!result.unknown && !result.optionId && !result.noPreference && !(result.districtIds && result.districtIds.length) && !result.otherText && !(result.optionIds && result.optionIds.length) && !(result.activityIds && result.activityIds.length) && !result.text)) {
      showError("Choose an answer or add a short response to continue.");
      return;
    }
    try {
      let nextInterview = applyInterviewAnswer(state.interview, question.id, result);
      if (publicExperience && question.id === "foundation.property_context" && nextInterview.requirement.propertyTypes?.[0] !== "office") {
        const fallback = new URL("/find-locations/", location.origin);
        fallback.searchParams.set("city", "San Francisco"); fallback.searchParams.set("state", "CA");
        fallback.searchParams.set("spaceType", nextInterview.requirement.propertyTypes?.[0] || "");
        fallback.searchParams.set("source", publicEntryContext.sourceType || "vnext_ineligible");
        location.assign(fallback.toString()); return;
      }
      const selection = selectNextQuestion(nextInterview);
      if (locationBriefV2Mode && selection.action === "READY" && question.id === "final.unusual") {
        elements["continue-question"].disabled = true;
        elements["continue-question"].textContent = "Saving recommendations…";
        await persistLocationBriefV2(nextInterview.requirement);
        return;
      }
      state.interview = nextInterview;
      state.draft = null;
      if (selection.action === "READY") state.mode = question.id === "final.unusual" ? "preview" : "complete";
      persist();
      render();
    } catch (error) {
      elements["continue-question"].disabled = false;
      elements["continue-question"].textContent = question.id === "final.unusual" ? "Show recommended locations" : "Continue";
      showError(error.message);
    }
  }

  function renderChoice(question, item, type) {
    const label = node("label", "requirement-choice");
    const input = document.createElement("input");
    input.type = type;
    input.name = `answer-${question.id}`;
    input.value = item.id;
    label.append(input, node("span", "", item.label));
    input.addEventListener("change", () => {
      elements["answer-control"].dataset.specialAnswer = "";
      const otherText = elements["answer-control"].querySelector("[data-other-text]");
      if (otherText && question.answerType === "single") { otherText.value = ""; otherText.hidden = true; }
      if (question.answerType !== "district_multi") elements["answer-control"].querySelectorAll(".is-selected").forEach((button) => { button.classList.remove("is-selected"); button.setAttribute("aria-pressed", "false"); });
      updateContinueState();
    });
    return label;
  }

  function updateContinueState() {
    const question = state.draft;
    const answer = question ? selectedAnswer(question) : null;
    const valid = question?.answerType === "final_text" || Boolean(answer && (answer.unknown || answer.optionId || answer.noPreference || (answer.districtIds && answer.districtIds.length) || (answer.otherText && answer.otherText.trim()) || (answer.optionIds && answer.optionIds.length) || (answer.activityIds && answer.activityIds.length) || answer.text));
    elements["continue-question"].disabled = !valid;
  }

  function selectSpecial(button, value) {
    const control = elements["answer-control"];
    control.querySelectorAll("input").forEach((input) => { input.checked = false; });
    control.querySelectorAll("textarea, input[type='text']").forEach((input) => { input.value = ""; });
    control.querySelectorAll(".is-selected").forEach((item) => { item.classList.remove("is-selected"); item.setAttribute("aria-pressed", "false"); });
    control.dataset.specialAnswer = value;
    button.classList.add("is-selected");
    button.setAttribute("aria-pressed", "true");
    updateContinueState();
  }

  function addOther(question, control) {
    if (!question.allowOther) return;
    const button = node("button", "requirement-choice requirement-choice--button", "Something else");
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    const textarea = document.createElement("textarea");
    textarea.rows = 3;
    textarea.placeholder = "Add a short answer";
    textarea.dataset.otherText = "";
    textarea.hidden = true;
    button.addEventListener("click", () => {
      control.dataset.specialAnswer = "";
      if (question.answerType === "single") control.querySelectorAll("input").forEach((input) => { input.checked = false; });
      control.querySelectorAll(".is-selected").forEach((item) => { item.classList.remove("is-selected"); item.setAttribute("aria-pressed", "false"); });
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
      textarea.hidden = false;
      textarea.focus();
      updateContinueState();
    });
    textarea.addEventListener("input", updateContinueState);
    control.append(button, textarea);
  }

  function createTextControl(question) {
    const spec = inputControlSpec(question.answerType);
    if (!spec) throw new Error(`Unsupported text control: ${question.answerType}`);
    const control = document.createElement(spec.element);
    if (spec.element === "input") {
      control.type = spec.inputType;
      if (spec.inputMode) control.inputMode = spec.inputMode;
    } else if (spec.element === "textarea") {
      control.rows = spec.rows;
    }
    control.dataset.requirementInputKind = spec.kind;
    return control;
  }

  function renderDistrictChoices(question, control) {
    const grid = node("div", "requirement-choice-grid requirement-district-grid");
    const seeded = new Set(question.seededDistrictIds || []);
    question.options.forEach((item) => {
      const choice = renderChoice(question, item, "checkbox");
      const input = choice.querySelector("input");
      input.dataset.canonicalDistrict = "";
      input.checked = seeded.has(item.districtId);
      if (!item.initiallyVisible && !input.checked) {
        choice.classList.add("requirement-district-extra");
        choice.hidden = true;
      }
      input.addEventListener("change", () => {
        if (input.checked) {
          const noPreference = control.querySelector("[data-no-district-preference]");
          if (noPreference) noPreference.checked = false;
        }
        updateContinueState();
      });
      grid.append(choice);
    });
    control.append(grid);

    const extras = [...grid.querySelectorAll(".requirement-district-extra")];
    if (extras.length) {
      const toggle = node("button", "requirement-district-toggle", question.showAllLabel);
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        extras.forEach((item) => { item.hidden = expanded && !item.querySelector("input:checked"); });
        toggle.setAttribute("aria-expanded", String(!expanded));
        toggle.textContent = expanded ? question.showAllLabel : "Show fewer";
      });
      control.append(toggle);
    }

    const noChoice = renderChoice(question, { id: "__no_preference", label: "No — help me decide" }, "checkbox");
    const noInput = noChoice.querySelector("input");
    noInput.dataset.noDistrictPreference = "";
    noInput.checked = question.seededDistrictIds.length === 0 && !question.seededInformalText && state.interview.requirement.locationLogic.specificPreference.hasPreference === false;
    noInput.addEventListener("change", () => {
      if (noInput.checked) {
        grid.querySelectorAll("input").forEach((input) => { input.checked = false; });
        const informal = control.querySelector("[data-district-other-text]");
        if (informal) informal.value = "";
        const otherButton = control.querySelector("[data-district-other-button]");
        if (otherButton) { otherButton.classList.remove("is-selected"); otherButton.setAttribute("aria-pressed", "false"); }
      }
      updateContinueState();
    });
    control.append(noChoice);

    const otherButton = node("button", "requirement-choice requirement-choice--button", "Something else");
    otherButton.type = "button";
    otherButton.dataset.districtOtherButton = "";
    otherButton.setAttribute("aria-pressed", String(Boolean(question.seededInformalText)));
    if (question.seededInformalText) otherButton.classList.add("is-selected");
    const other = document.createElement("textarea");
    other.rows = 3;
    other.placeholder = "For example, near the Ferry Building";
    other.dataset.districtOtherText = "";
    other.value = question.seededInformalText || "";
    other.hidden = !question.seededInformalText;
    otherButton.addEventListener("click", () => {
      other.hidden = false;
      otherButton.classList.add("is-selected");
      otherButton.setAttribute("aria-pressed", "true");
      noInput.checked = false;
      other.focus();
      updateContinueState();
    });
    other.addEventListener("input", () => { if (other.value.trim()) noInput.checked = false; updateContinueState(); });
    control.append(otherButton, other);
  }

  function renderMarketSearch(question, parent) {
    const wrapper = node("div", "requirement-location-search");
    const input = createTextControl(question);
    input.placeholder = "Search city or market";
    input.autocomplete = "off";
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", "requirement-market-results");
    const results = node("div", "search-profile-location-results");
    results.id = "requirement-market-results";
    results.setAttribute("role", "listbox");
    results.hidden = true;
    let matches = [];
    let activeIndex = -1;

    const close = () => {
      results.hidden = true;
      results.replaceChildren();
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      activeIndex = -1;
    };
    const choose = (item) => {
      input.value = item.displayName;
      parent.dataset.selectedMarket = JSON.stringify(item);
      close();
      updateContinueState();
      input.focus();
    };
    const setActive = (index) => {
      const buttons = [...results.querySelectorAll("[data-market-result-index]")];
      if (!buttons.length) return;
      activeIndex = (index + buttons.length) % buttons.length;
      buttons.forEach((button, itemIndex) => button.classList.toggle("is-active", itemIndex === activeIndex));
      input.setAttribute("aria-activedescendant", buttons[activeIndex].id);
    };
    const renderResults = () => {
      parent.dataset.selectedMarket = "";
      matches = canonicalMarketSuggestions(canonicalMarkets, input.value);
      results.replaceChildren();
      matches.forEach((item, index) => {
        const button = node("button", "search-profile-location-result");
        button.type = "button";
        button.id = `requirement-market-result-${index}`;
        button.dataset.marketResultIndex = String(index);
        button.setAttribute("role", "option");
        button.append(node("span", "", item.label), node("small", "", item.meta));
        button.addEventListener("mousedown", (event) => event.preventDefault());
        button.addEventListener("click", () => choose(item));
        results.append(button);
      });
      results.hidden = !matches.length;
      input.setAttribute("aria-expanded", String(Boolean(matches.length)));
      activeIndex = -1;
      updateContinueState();
    };
    input.addEventListener("input", renderResults);
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" && matches.length) { event.preventDefault(); setActive(activeIndex + 1); }
      else if (event.key === "ArrowUp" && matches.length) { event.preventDefault(); setActive(activeIndex - 1); }
      else if (event.key === "Enter" && activeIndex >= 0) { event.preventDefault(); choose(matches[activeIndex]); }
      else if (event.key === "Escape") close();
    });
    input.addEventListener("blur", () => window.setTimeout(close, 100));
    wrapper.append(input, results);
    parent.append(wrapper);
    return input;
  }

  function renderQuestion(selection) {
    const question = selection.question;
    state.draft = question;
    elements["question-prompt"].textContent = question.prompt;
    elements["question-kicker"].textContent = question.decisionRelevance.length ? question.decisionRelevance.map((item) => item.replaceAll("_", " ")).join(" · ") : question.id === "final.unusual" ? "Final check" : "Requirement";
    elements["question-position"].textContent = "Your search";
    const stageLabels = { ORIENT: "Location search", USE: "Your business", LOCATION: "Location priorities", SCALE: "Space context", FINAL: "Final check" };
    elements["stage-label"].textContent = stageLabels[selection.stage] || "Location Requirement";
    const stageProgress = { ORIENT: "18%", USE: "38%", LOCATION: "68%", SCALE: "84%", FINAL: "96%" };
    if (elements["progress-bar"]) elements["progress-bar"].style.width = stageProgress[selection.stage] || "18%";
    const control = elements["answer-control"];
    control.replaceChildren();
    control.dataset.specialAnswer = "";
    elements["continue-question"].hidden = false;
    elements["continue-question"].disabled = true;
    elements["continue-question"].textContent = selection.submitLabel || "Continue";

    if (question.answerType === "district_multi") {
      renderDistrictChoices(question, control);
    } else if (question.answerType === "activity_multi") {
      [...new Set(ACTIVITY_CHOICE_GROUPS.map((item) => item.group))].forEach((groupName) => {
        const fieldset = node("fieldset", "requirement-activity-group");
        fieldset.append(node("legend", "", groupName));
        const grid = node("div", "requirement-choice-grid");
        ACTIVITY_CHOICE_GROUPS.filter((item) => item.group === groupName).forEach((item) => grid.append(renderChoice(question, item, "checkbox")));
        fieldset.append(grid);
        control.append(fieldset);
      });
      addOther(question, control);
    } else if (question.answerType === "multi") {
      const grid = node("div", "requirement-choice-grid");
      question.options.forEach((item) => grid.append(renderChoice(question, item, "checkbox")));
      control.append(grid);
      addOther(question, control);
      if (question.allowUnknown) control.append(renderChoice(question, { id: "__unknown", label: "I’m not sure" }, "checkbox"));
    } else if (inputControlSpec(question.answerType)) {
      if (question.answerType === "final_text") {
        const noButton = node("button", "requirement-choice requirement-choice--button", "No, nothing else");
        noButton.type = "button";
        noButton.setAttribute("aria-pressed", "false");
        noButton.addEventListener("click", () => selectSpecial(noButton, "none"));
        control.append(noButton);
      }
      const textInput = question.answerType === "market_select" ? renderMarketSearch(question, control) : createTextControl(question);
      if (question.answerType !== "market_select") {
        textInput.placeholder = question.placeholder || (question.answerType === "number" || question.answerType === "number_or_text" ? "Enter a number or approximate amount" : question.allowUnknown ? "Add a short answer, or choose I’m not sure" : "Add a short answer");
        control.append(textInput);
        textInput.addEventListener("input", () => { control.dataset.specialAnswer = ""; control.querySelectorAll(".is-selected").forEach((item) => item.classList.remove("is-selected")); updateContinueState(); });
      }
      if (question.allowUnknown) {
        const unknown = node("button", "requirement-choice requirement-choice--button", "I’m not sure");
        unknown.type = "button";
        unknown.setAttribute("aria-pressed", "false");
        unknown.addEventListener("click", () => selectSpecial(unknown, "unknown"));
        control.append(unknown);
      }
    } else {
      const grid = node("div", "requirement-choice-grid");
      question.options.forEach((item) => grid.append(renderChoice(question, item, "radio")));
      if (question.allowUnknown) grid.append(renderChoice(question, { id: "__unknown", label: "I’m not sure" }, "radio"));
      control.append(grid);
      addOther(question, control);
    }

    const details = elements["question-help"];
    const visibleHelp = elements["question-visible-help"];
    details.hidden = !question.help || question.helpMode === "visible";
    visibleHelp.hidden = !question.help || question.helpMode !== "visible";
    if (question.help) {
      details.querySelector("p").textContent = question.help;
      visibleHelp.textContent = question.help;
    }
    elements["back-question"].disabled = !state.interview.history.length;
    elements["continue-question"].onclick = () => submitAnswer(question);
    updateContinueState();
  }

  function summaryItems(requirement) {
    const businessIdentityCriterion = requirement.criteria.find((item) => item.dimension === "universal.business.type");
    const businessIdentity = businessIdentityCriterion?.value?.list?.[1] || businessIdentityCriterion?.value?.text || "";
    const criterionText = (dimensions) => requirement.criteria
      .filter((item) => dimensions.includes(item.dimension))
      .map((item) => criterionValue(item))
      .filter(Boolean)
      .join(" · ");
    const activityLabels = {
      work: "Ordinary office or administrative work",
      meet_collaborate: "Team meetings and collaboration",
      host_visitors: "Customers or clients visit",
      sell_serve: "Products or services are sold",
      display_present: "Products are displayed or presented",
      treat_care: "Patients or clients are treated",
      make_assemble: "Making or assembly",
      repair_service: "Repair or service work",
      store: "Inventory, material, or equipment storage",
      receive: "Goods are received",
      ship_distribute: "Goods are shipped or distributed",
      dispatch: "Employees or technicians are dispatched",
      operate_vehicles: "Vehicles operate from the property",
      research_test: "Research or testing",
      prepare_produce_food: "Food preparation or production",
      teach_train_events: "Training, teaching, or events",
      outdoor_operations: "Outdoor operations",
    };
    return [
      ["Space", requirement.propertyTypes.map((item) => item.replaceAll("_", " / ")).join(" · ")],
      ["Market", requirement.locationLogic.marketAnchor.displayName || requirement.locationLogic.locations.join(", ")],
      ["Areas already being considered", requirement.locationLogic.specificPreference.candidateDistrictNames.length ? requirement.locationLogic.specificPreference.candidateDistrictNames.join(" · ") : requirement.locationLogic.specificPreference.hasPreference === false ? "None — open to Rofo recommendations" : ""],
      ["Other location preference", requirement.locationLogic.specificPreference.informalText],
      ["Business", businessIdentity],
      ["Practice", criterionText(["medical.business.practice_description"])],
      ["Environment", criterionText(["office.environment.image"])],
      ["How the space is used", requirement.activities.map((id) => activityLabels[id] || id.replaceAll("_", " ")).join(" · ")],
      ["Employees", criterionText(["universal.location.employee_origins", "office.location.employee_geography"])],
      ["Customers / clients", criterionText(["office.access.client_visits", "universal.location.customer_origins", "retail.location.customer_logic"])],
      ["Transit / parking", criterionText(["universal.access.transit_importance", "universal.access.parking_importance", "office.access.transit", "office.access.parking", "retail.access.parking", "medical.access.patient"])],
      ["Known scale (for Property Requirement)", requirement.sizeCapacity.summary || criterionText(["office.occupancy.peak_attendance", "industrial.site.fleet_storage", "special.events.peak"])],
      ["Other location considerations", requirement.businessContext.summary],
    ];
  }

  function renderUnderstanding() {
    const target = elements["understanding-summary"];
    if (target) target.replaceChildren();
    const searchTarget = elements["search-summary"];
    if (searchTarget) searchTarget.replaceChildren();
    const items = summaryItems(state.interview.requirement).filter(([, content]) => content);
    items.forEach(([label, content]) => {
      if (target) {
        const row = node("p");
        row.append(node("strong", "", `${label}: `), document.createTextNode(content));
        target.append(row);
      }
      if (searchTarget) {
        const row = node("div", "requirement-search-summary__item");
        row.append(node("span", "", label), node("strong", "", content));
        searchTarget.append(row);
      }
    });
    if (elements["search-summary-empty"]) elements["search-summary-empty"].hidden = Boolean(items.length);
  }

  function criterionValue(item) {
    return item.value.text || (item.value.list && item.value.list.join(" · ")) || (item.status === "UNKNOWN" ? "Not known yet" : "To verify");
  }

  function renderComplete() {
    const requirement = state.interview.requirement;
    if (locationBriefV2Mode) root.querySelector("[data-view-recommendations]").textContent = "Show recommended locations";
    elements["requirement-title"].textContent = requirement.title;
    const readiness = requirement.readiness;
    elements["readiness-summary"].textContent = readiness.readyForLocation.ready ? "Ready for a location recommendation" : "Location Requirement captured with some facts still unknown";
    const summary = elements["requirement-summary"];
    summary.replaceChildren();
    summaryItems(requirement).forEach(([label, content]) => {
      const section = node("section", `requirement-summary${content ? "" : " requirement-summary--empty"}`);
      section.append(node("h3", "", label), node("p", "", content || "Not yet defined"));
      summary.append(section);
    });
    const criteria = elements["requirement-criteria"];
    criteria.replaceChildren();
    STATUSES.forEach((status) => {
      const items = requirement.criteria.filter((item) => item.status === status);
      if (!items.length) return;
      const group = node("section", "requirement-criteria-group");
      group.append(node("h3", "", status));
      items.forEach((item) => {
        const article = node("article", "requirement-criterion");
        article.dataset.status = status;
        article.append(node("strong", "", item.label || item.dimension), node("p", "", criterionValue(item)));
        const details = document.createElement("details");
        details.append(node("summary", "", "Edit or inspect"));
        const input = document.createElement("input");
        input.value = criterionValue(item);
        const select = document.createElement("select");
        STATUSES.forEach((value) => { const option = node("option", "", value); option.value = value; option.selected = value === status; select.append(option); });
        const save = node("button", "", "Save correction");
        save.type = "button";
        save.addEventListener("click", () => {
          const updated = { ...item, value: { text: input.value.trim(), number: null, boolean: null, list: [] }, status: select.value, source: "user_correction", authority: item.authority, confidence: 1, confirmed: true };
          const result = updateCriterion(state.interview.requirement, updated);
          if (!result.errors.length) { state.interview.requirement = result.requirement; persist(); render(); }
        });
        details.append(node("p", "", `${item.source.replaceAll("_", " ")} · ${item.authority.replaceAll("_", " ")}`), input, select, save);
        article.append(details);
        group.append(article);
      });
      criteria.append(group);
    });
  }

  function locationPreview() {
    const client = window.RofoRequirementLocationPreview;
    if (!client || typeof client.createLocationIntelligencePreview !== "function") return { supported: false, message: "The private recommendation preview did not load. Your Requirement remains available to review and export." };
    return client.createLocationIntelligencePreview(state.interview.requirement, sfOfficeRecommendationModel);
  }

  function privateComposition() {
    const composer = window.RofoPrivateLocationComposition;
    if (!composer || typeof composer.composeLocationRecommendations !== "function") return { supported: false, message: "The private composition layer did not load. Your Requirement remains available to review and export." };
    return composer.composeLocationRecommendations(state.interview.requirement, sfAccessFoundation, sfOfficeCompositionFoundation, sfOfficeRecommendationModel);
  }

  function recommendationReadiness() {
    const gate = window.RofoPrivateRecommendationReadiness;
    if (!gate || typeof gate.evaluateRecommendationReadiness !== "function") return { readiness: "INVESTIGATE", productResponse: { heading: "What matters for your search", note: "Rofo needs more market intelligence before presenting district recommendations with confidence.", showShortlist: false, cta: "Investigate this market" }, plausibleCandidateUniverse: [], intelligenceGaps: [], shortlist: [] };
    return gate.evaluateRecommendationReadiness(state.interview.requirement, { accessFoundation: sfAccessFoundation, compositionFoundation: sfOfficeCompositionFoundation, sfOfficeModel: sfOfficeRecommendationModel, districtGeography });
  }

  function renderPreview() {
    const readiness = recommendationReadiness();
    const preview = readiness.composition;
    const target = elements["preview-results"];
    target.replaceChildren();
    elements["candidate-comparisons"].replaceChildren();
    elements["preview-heading"].textContent = readiness.productResponse.heading;
    elements["preview-intro"].textContent = readiness.productResponse.note;
    const recap = node("section", "requirement-recommendation-recap");
    recap.append(node("h3", "", "Your search"));
    const recapList = node("div", "requirement-recommendation-recap__items");
    const useful = new Set(["Space", "Market", "Business", "Practice", "Employees", "Customers / clients", "Environment", "Transit / parking", "Areas already being considered"]);
    summaryItems(state.interview.requirement).filter(([key, value]) => useful.has(key) && value).forEach(([key, value]) => {
      const item = node("p");
      item.append(node("strong", "", `${key}: `), document.createTextNode(value));
      recapList.append(item);
    });
    recap.append(recapList);
    target.append(recap);

    if (!readiness.productResponse.showShortlist || !preview?.supported) {
      const matters = node("section", "requirement-investigate");
      matters.append(node("h3", "", "What matters most"));
      const list = node("ul");
      const requirement = state.interview.requirement;
      if (requirement.propertyTypes.includes("medical")) {
        list.append(node("li", "", "Patient and employee access should guide the investigation."));
        list.append(node("li", "", "Parking and arrival convenience remain important location filters."));
        list.append(node("li", "", "Medical-compatible use, accessibility, existing buildout, and current availability require property-level verification."));
      } else list.append(node("li", "", "The market needs a reviewed Location Intelligence foundation before districts can be compared fairly."));
      matters.append(list, node("h3", "", readiness.productResponse.nextStepHeading || "Recommended next step"), node("p", "", readiness.productResponse.note));
      if (readiness.productResponse.cta) { const button = node("button", "requirement-button requirement-button--primary", readiness.productResponse.cta); button.type = "button"; button.disabled = true; button.title = "Private calibration only — no lead or handoff is created."; matters.append(button); }
      target.append(matters);
      return;
    }

    const cards = node("div", "requirement-composition-cards");
    preview.shortlist.forEach((item) => {
      const article = node("article", "requirement-preview-card requirement-composition-card");
      article.append(node("p", "requirement-prototype__eyebrow", item.compositionBand.replaceAll("_", " ")), node("h3", "", item.districtName), node("p", "requirement-composition-card__role", item.role));
      if (item.candidatePreference) article.append(node("p", "requirement-composition-card__candidate", "Already on your list"));
      if (item.strengths.length) {
        article.append(node("h4", "", "Why it fits your business"));
        const list = node("ul"); item.strengths.forEach((value) => list.append(node("li", "", value))); article.append(list);
      }
      if (item.tradeoffs.length) {
        article.append(node("h4", "", "Tradeoffs"));
        const list = node("ul"); item.tradeoffs.forEach((value) => list.append(node("li", "", value))); article.append(list);
      }
      if (item.unknowns.length) {
        article.append(node("h4", "", "Unknown / verify"));
        const list = node("ul"); item.unknowns.forEach((value) => list.append(node("li", "", value))); article.append(list);
      }
      cards.append(article);
    });
    target.append(cards);

    if (preview.comparison.rows.length && preview.shortlist.length > 1) {
      const comparison = node("section", "requirement-composition-comparison");
      comparison.append(node("h3", "", "How these alternatives differ"));
      const table = node("table");
      const head = node("tr"); head.append(node("th", "", "Priority")); preview.shortlist.forEach((item) => head.append(node("th", "", item.districtName))); const thead = node("thead"); thead.append(head); table.append(thead);
      const body = node("tbody"); preview.comparison.rows.forEach((row) => { const tr = node("tr"); tr.append(node("th", "", row.label)); preview.shortlist.forEach((item) => tr.append(node("td", "", row.values[item.districtId] || "Unknown"))); body.append(tr); }); table.append(body); comparison.append(table); target.append(comparison);
    }

    if (preview.candidateContext.length) {
      const comparison = elements["candidate-comparisons"];
      comparison.append(node("h3", "", "Areas you were already considering"));
      preview.candidateContext.forEach((item) => {
        const row = node("article", "requirement-preview-comparison");
        const status = item.inShortlist ? "Already included among Rofo's strongest fits." : `${item.role} Tradeoff: ${item.tradeoff}`;
        row.append(node("strong", "", item.districtName), node("p", "", status));
        comparison.append(row);
      });
    }
  }

  function renderCoverage() {
    const target = elements["preview-coverage"];
    target.replaceChildren();
    const preview = locationPreview();
    const projection = preview.projection;
    if (!projection) return target.append(node("p", "", "Preview adapter unavailable."));
    (preview.coverage || projection.consumedSignals || []).forEach((item) => {
      const status = item.rankingEffect === "eligibility" ? "routing / eligibility" : item.rankingEffect === "none" ? "accepted · no ranking effect" : item.usedInRanking ? "consumed in ranking" : "projected · no effect in this turn";
      const row = node("p");
      row.append(node("strong", "", `${item.sourceDimension} → ${item.recommendationSignal}: `), document.createTextNode(status));
      target.append(row);
    });
    projection.unconsumedSignals.forEach((item) => {
      const row = node("p");
      row.append(node("strong", "", `${item.sourceDimension}: `), document.createTextNode(`unconsumed — ${item.reason}`));
      target.append(row);
    });
    projection.conflicts.forEach((item) => {
      const row = node("p");
      row.append(node("strong", "", `${item.sourceDimension}: `), document.createTextNode(`unsupported — ${item.reason}`));
      target.append(row);
    });
  }

  function renderAccessShadow() {
    const target = elements["access-shadow"];
    target.replaceChildren();
    const evaluator = window.RofoAccessShadowEvaluator;
    if (!evaluator || typeof evaluator.createAccessShadowComparison !== "function") return target.append(node("p", "", "Shadow evaluator unavailable."));
    const shadow = evaluator.createAccessShadowComparison(state.interview.requirement, sfAccessFoundation, sfOfficeRecommendationModel);
    const profile = shadow.requirementAccessProfile;
    const profileSummary = node("details", "requirement-shadow-profile");
    profileSummary.append(node("summary", "", `RequirementAccessProfile · ${profile.cohorts.length} cohorts · ${profile.unresolvedOrigins.length} unresolved`));
    const list = node("ul");
    profile.cohorts.forEach((cohort) => list.append(node("li", "", `${cohort.actorType}: ${cohort.rawOrigin} → ${cohort.originRegionId} · ${cohort.importance} · ${cohort.frequency}`)));
    profileSummary.append(list);
    target.append(profileSummary);
    shadow.comparisons.forEach((comparison) => {
      const fit = comparison.proposedAccessFit;
      const article = node("article", "requirement-shadow-district");
      article.append(node("h4", "", `${comparison.districtName} — ${fit.overall} (${fit.confidence.toLowerCase()} confidence)`));
      const existing = comparison.existingProductionAccess.accessReasons.length
        ? comparison.existingProductionAccess.accessReasons.map((item) => `${item.signalId}: ${item.action}`).join(" · ")
        : comparison.existingProductionAccess.note;
      article.append(node("p", "", `Existing production access: ${existing}`));
      fit.strengths.forEach((item) => article.append(node("p", "", `Strength: ${item}`)));
      fit.tradeoffs.forEach((item) => article.append(node("p", "", `Tradeoff: ${item}`)));
      fit.unknowns.forEach((item) => article.append(node("p", "", `Unknown: ${item}`)));
      if (fit.accessEligibility.accessActivated) article.append(node("p", "requirement-shadow-activation", "Shadow access-activated candidate"));
      const trace = document.createElement("details");
      trace.append(node("summary", "", "Evidence and explanation trace"));
      fit.explanationTrace.forEach((item) => trace.append(node("p", "", `${item.requirementFact} → ${item.accessRelationship} → ${item.districtImplication} Evidence: ${item.evidenceIds.join(", ")}`)));
      article.append(trace);
      target.append(article);
    });
    shadow.access.foundationGaps.forEach((gap) => target.append(node("p", "requirement-shadow-gap", gap.note)));
  }

  function renderCompositionDebug() {
    const target = elements["composition-debug"];
    target.replaceChildren();
    const gate = recommendationReadiness();
    target.append(node("p", "", `Recommendation readiness: ${gate.readiness} — ${gate.rationale}`));
    target.append(node("p", "", `Plausible universe: ${gate.plausibleCandidateUniverse.map((item) => `${item.districtName} (${item.evaluationStatus})`).join(" · ") || "not established"}`));
    gate.intelligenceGaps.forEach((gap) => target.append(node("p", "requirement-shadow-gap", `${gap.district} · ${gap.intelligenceDimension} · ${gap.requirementSignal}: ${gap.reason}`)));
    const composition = gate.composition;
    if (!composition?.supported) return;
    target.append(node("p", "", `Private shortlist: ${composition.shortlist.map((item) => item.districtName).join(" · ")}`));
    target.append(node("p", "", `Production shortlist: ${composition.shadow.productionTopThree.join(" · ")}`));
    target.append(node("p", "", composition.orderingPolicy));
    if (composition.tieGroups.length) target.append(node("p", "", `Effective ties: ${composition.tieGroups.map((group) => group.join(" / ")).join(" · ")}`));
    composition.considered.forEach((item) => {
      const article = node("article", "requirement-shadow-district");
      article.append(node("h4", "", `${item.districtName} — ${item.compositionBand.replaceAll("_", " ")}`));
      article.append(node("p", "", `Components: Business Environment ${item.environment.band} · Access ${item.accessComponent.band} (raw ${item.access.overall}, ${item.access.confidence} confidence) · Office ${item.office.band}`));
      article.append(node("p", "", `Eligibility: ${item.eligibilitySource} · Candidate preference: ${item.candidatePreference ? "comparison only" : "none"}`));
      article.append(node("p", "", `Internal ordering: ${JSON.stringify(item.internalOrdering)}`));
      item.strengths.forEach((value) => article.append(node("p", "", `Strength: ${value}`)));
      item.tradeoffs.forEach((value) => article.append(node("p", "", `Tradeoff: ${value}`)));
      item.unknowns.forEach((value) => article.append(node("p", "", `Unknown: ${value}`)));
      const detail = node("details"); detail.append(node("summary", "", "Component and evidence trace"));
      item.access.explanationTrace.forEach((trace) => detail.append(node("p", "", `${trace.requirementFact} → ${trace.accessRelationship} → ${trace.districtImplication} Evidence: ${trace.evidenceIds.join(", ")}`)));
      detail.append(node("p", "", `Business-environment sources: ${item.environment.evidenceSources.join(", ") || "none"}`));
      detail.append(node("p", "", `Office-fit sources: ${item.office.evidenceSources.join(", ") || "none"}`));
      article.append(detail);
      target.append(article);
    });
  }

  function renderDebug() {
    const debug = interviewDebug(state.interview);
    elements["debug-meta"].textContent = `${debug.engineVersion} · ${debug.activityRegistryVersion} · ${debug.questionRegistryVersion}`;
    elements["debug-json"].textContent = JSON.stringify(debug, null, 2);
    renderCoverage();
    renderAccessShadow();
    renderCompositionDebug();
  }

  function renderScenarios() {
    const target = elements["scenario-buttons"];
    if (!target) return;
    target.replaceChildren();
    scenarios.forEach((scenario) => {
      const button = node("button", "", scenario.label);
      button.type = "button";
      button.setAttribute("aria-pressed", String(state.interview.scenarioId === scenario.id));
      button.addEventListener("click", () => { state = { interview: createSeededInterview({ ...scenario, districtGeography }), mode: "interview", draft: null }; persist(); render(); });
      target.append(button);
    });
  }

  function render() {
    const selection = selectNextQuestion(state.interview);
    if (selection.action === "READY" && state.mode === "interview") state.mode = "complete";
    elements.interview.hidden = state.mode !== "interview";
    elements["requirement-complete"].hidden = state.mode !== "complete";
    elements["recommendation-preview"].hidden = state.mode !== "preview";
    renderScenarios();
    renderUnderstanding();
    if (state.mode === "interview" && selection.question) renderQuestion(selection);
    if (state.mode === "complete") renderComplete();
    if (state.mode === "preview") renderPreview();
    renderDebug();
  }

  function exportRequirement() {
    const blob = new Blob([JSON.stringify(state.interview.requirement, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.interview.scenarioId || "rofo-requirement"}-v${state.interview.requirement.revision}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  root.querySelector("[data-toggle-understanding]")?.addEventListener("click", () => { elements.understanding.hidden = !elements.understanding.hidden; });
  root.querySelectorAll("[data-export-requirement]").forEach((button) => button.addEventListener("click", exportRequirement));
  root.querySelector("[data-reset-requirement]")?.addEventListener("click", () => { state = initialState(); sessionStorage.removeItem(SESSION_KEY); render(); });
  elements["back-question"].addEventListener("click", () => { state.interview = backInterview(state.interview); persist(); render(); });
  elements["finish-early"]?.addEventListener("click", () => { state.mode = "complete"; persist(); render(); });
  root.querySelector("[data-refine-requirement]").addEventListener("click", () => { state.mode = "interview"; persist(); render(); });
  root.querySelector("[data-view-recommendations]").addEventListener("click", async () => {
    if (locationBriefV2Mode) {
      const button = root.querySelector("[data-view-recommendations]");
      button.disabled = true;
      button.textContent = "Saving recommendations…";
      try { await persistLocationBriefV2(state.interview.requirement); }
      catch (error) { button.disabled = false; button.textContent = "Show recommended locations"; alert(error.message); }
      return;
    }
    state.mode = "preview"; persist(); render();
  });
  root.querySelector("[data-back-to-requirement]").addEventListener("click", () => { state.interview = backInterview(state.interview); state.mode = "interview"; persist(); render(); });

  async function bootstrap() {
    const scenarioNav = root.querySelector(".requirement-prototype__scenarios");
    if (locationBriefV2Mode && scenarioNav) scenarioNav.hidden = true;
    if (locationBriefV2Intent === "edit") {
      if (!/^LB2-[A-F0-9]{24}$/i.test(locationBriefV2PublicId)) { alert("A valid Location Brief v2 ID is required."); return; }
      try {
        const response = await fetch(`/api/location-brief-v2/${encodeURIComponent(locationBriefV2PublicId)}`);
        const result = await response.json();
        if (!response.ok || !result.owner) throw new Error(result.error || "This browser cannot edit that Location Brief.");
        state = { interview: createInterviewState({ requirement: result.currentRevision.requirement, districtGeography }), mode: "complete", draft: null };
        locationBriefV2Context = { intent: "edit", publicId: result.brief.publicId, revisionNumber: result.currentRevision.revisionNumber };
      } catch (error) { alert(error.message); return; }
    }
    if (publicExperience && locationBriefV2Intent === "new") {
      const businessMap = { design_creative: "design_creative", professional_services: "professional_services", technology: "technology", life_science: "life_science", nonprofit: "nonprofit", "Architecture, Design & Creative Services": "design_creative", "Financial & Professional Services": "professional_services", "Professional Services": "professional_services", "Technology & Product Companies": "technology", Technology: "technology", "Life Sciences & Research": "life_science", "Nonprofit & Mission-Driven Organizations": "nonprofit", Nonprofit: "nonprofit" };
      const businessOption = businessMap[publicEntryContext.businessIdentityId];
      if (publicEntryContext.propertyType === "office" && businessOption) state = { interview: applyInterviewAnswer(state.interview, "business.identity", { optionId: businessOption }), mode: "interview", draft: null };
      trackVNext("vnext_requirement_started");
    }
    if (elements["requirement-loading"]) elements["requirement-loading"].hidden = true;
    render();
  }

  bootstrap();
}
