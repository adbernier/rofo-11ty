const fs = require("fs");
const path = require("path");

let failures = 0;
function assert(condition, message) {
  if (!condition) {
    failures += 1;
    console.error(`Location-first Requirement QA error: ${message}`);
  }
}
function containsFunction(value) {
  if (typeof value === "function") return true;
  if (!value || typeof value !== "object") return false;
  return Object.values(value).some(containsFunction);
}
const criterion = (dimension, text, status = "PREFERRED", scope = "location", authority = "business") => ({
  id: `criterion_${dimension.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase()}`,
  dimension,
  value: { text, number: null, boolean: null, list: [] },
  status,
  scope,
  source: "user_statement",
  confidence: 1,
  rationale: "QA fixture",
  authority,
  requiresConfirmation: false,
  confirmed: true,
});

(async function run() {
  const engine = await import(path.resolve("lib/requirements/requirement-interview-v1.mjs"));
  const domain = await import(path.resolve("lib/requirements/requirement-domain-v1.mjs"));
  const controls = await import(path.resolve("lib/requirements/requirement-input-controls-v1.mjs"));
  const scenarios = require("../js/requirement-prototype-scenarios.js");
  const districtGeography = require("../_data/requirementPrototypeDistrictGeography.js");

  assert(engine.ACTIVITY_REGISTRY.length === 17, "the approved canonical activity registry must remain intact.");
  assert(new Set(engine.ACTIVITY_REGISTRY.map((item) => item.id)).size === 17, "activity IDs must be unique.");
  assert(engine.INTERVIEW_STAGES.map((item) => item.id).join(",") === "ORIENT,USE,LOCATION,SCALE,FINAL,PROPERTY", "interview stages must have a stable narrative order.");
  assert(new Set(engine.QUESTION_REGISTRY.map((item) => item.id)).size === engine.QUESTION_REGISTRY.length, "question IDs must be unique.");
  assert(engine.QUESTION_REGISTRY.every((item) => item.version === 1 && item.stage && item.resolverId && Number.isFinite(item.priority)), "every question needs a stage, version, resolver, and priority.");
  assert(engine.QUESTION_REGISTRY.every((item) => !containsFunction(item)), "question definitions must remain declarative.");
  assert(engine.LOCATION_QUESTION_QUALITY_RULE.length === 5, "the five-part Location question-quality gate must remain documented with the interview model.");
  assert(engine.QUESTIONS_BY_ID["location.anchor"].prompt === "What city or market are you considering?" && /main city or market/i.test(engine.QUESTIONS_BY_ID["location.anchor"].help), "the market question must make its expected specificity explicit.");
  assert(controls.inputControlSpec("market_select").element === "input" && controls.inputControlSpec("market_select").inputType === "text", "market search must render as a text input.");
  assert(controls.inputControlSpec("short_text").element === "textarea" && controls.inputControlSpec("short_text").inputType === null, "short text must render as a textarea without an input type.");
  assert(controls.inputControlSpec("number").element === "input" && controls.inputControlSpec("number").inputType === "number", "numeric answers must render as number inputs.");
  assert(controls.inputControlSpec("number_or_text").element === "input" && controls.inputControlSpec("number_or_text").inputMode === "numeric", "approximate basic scale must use an input with numeric input mode.");
  assert(controls.inputControlSpec("final_text").element === "textarea" && controls.inputControlSpec("final_text").rows === 4, "final unusual needs must render as a textarea.");
  const marketMatches = controls.canonicalMarketSuggestions([{ marketId: "san-francisco", marketName: "San Francisco", state: "CA", cities: ["San Francisco"] }], "san fra");
  assert(marketMatches.length === 1 && marketMatches[0].marketId === "san-francisco" && marketMatches[0].displayName === "San Francisco, CA", "market autocomplete must return canonical market identity.");

  const empty = engine.createInterviewState({ districtGeography });
  const initialA = engine.selectNextQuestion(empty);
  const initialB = engine.selectNextQuestion(JSON.parse(JSON.stringify(empty)));
  assert(empty.targetReadiness === "READY_FOR_LOCATION", "the default target must be Ready for Location.");
  assert(initialA.question.id === "location.anchor" && initialA.question.stage === "ORIENT", "market must be the first unknown search context.");
  assert(initialA.question.id === initialB.question.id, "identical state must produce an identical next question.");
  let oriented = engine.applyInterviewAnswer(empty, "location.anchor", { text: "San Francisco, CA", market: { geographyId: "san-francisco", marketId: "san-francisco", marketName: "San Francisco", city: "San Francisco", state: "CA", displayName: "San Francisco, CA" } });
  assert(oriented.requirement.locationLogic.marketAnchor.marketId === "san-francisco" && oriented.requirement.locationLogic.marketAnchor.displayName === "San Francisco, CA", "market anchor must preserve canonical identity and display data.");
  assert(engine.selectNextQuestion(oriented).question.id === "foundation.property_context", "property type must follow market before activity detail.");

  oriented = engine.applyInterviewAnswer(oriented, "foundation.property_context", { optionId: "office" });
  const districtQuestion = engine.selectNextQuestion(oriented).question;
  assert(districtQuestion.id === "location.district_candidates" && districtQuestion.prompt === "Any parts of San Francisco already on your list?", "canonical district selection must follow basic market and property context.");
  assert(districtQuestion.answerType === "district_multi" && districtQuestion.options.some((item) => item.districtId === "financial-district"), "SF district selection must use stable canonical district options.");
  assert(oriented.requirement.activities.includes("work") && oriented.requirement.activities.includes("meet_collaborate"), "Office must derive ordinary work and collaboration defaults.");
  assert(!oriented.requirement.activities.includes("treat_care") && !oriented.requirement.activities.includes("make_assemble"), "Office defaults must not introduce unrelated activity families.");

  const bayModel = engine.resolveMarketGeography(oriented.requirement);
  assert(bayModel && bayModel.id === "bay_area" && bayModel.regions.some((item) => item.label === "East Bay") && bayModel.regions.some((item) => item.label === "Marin / North Bay"), "Bay Area geography must expose concrete prototype regions.");
  const unsupported = engine.createSeededInterview({ id: "unsupported", requirement: { objective: { summary: "Open an office" }, propertyTypes: ["office"], activities: ["work"], locationLogic: { summary: "Employee access", locations: ["Denver"], rationale: [] }, sizeCapacity: { summary: "20 people" } } });
  const unsupportedEmployee = engine.eligibleQuestions(unsupported).find((item) => item.id === "employee.origins");
  assert(unsupportedEmployee && unsupportedEmployee.answerType === "short_text" && unsupportedEmployee.marketModelId === "fallback_freeform", "unsupported markets must fall back to free-form geography.");

  let unknownState = engine.createSeededInterview({ id: "unknown", requirement: { objective: { summary: "Open a location" }, propertyTypes: ["office"], activities: ["work"], locationLogic: { summary: "", locations: [], rationale: [] }, sizeCapacity: { summary: "25 people" } } });
  unknownState = engine.applyInterviewAnswer(unknownState, "location.anchor", { unknown: true });
  assert(unknownState.requirement.criteria.some((item) => item.dimension === "universal.location.anchor" && item.status === "UNKNOWN"), "Unknown must remain canonical.");
  assert(!engine.isQuestionApplicable(unknownState, engine.QUESTIONS_BY_ID["location.anchor"]), "Unknown questions must not repeat.");

  let research = engine.createSeededInterview({ id: "verify", requirement: { objective: { summary: "Open an R&D location" }, propertyTypes: ["life_science_rd"], activities: ["research_test"], locationLogic: { summary: "Talent access", locations: ["South San Francisco"], rationale: [] }, sizeCapacity: { summary: "15,000 SF" } } });
  research = engine.applyInterviewAnswer(research, "research.infrastructure", { optionIds: ["vent", "utilities"] });
  assert(research.requirement.criteria.some((item) => item.dimension === "research.diligence.infrastructure" && item.status === "VERIFY" && item.authority === "external_property"), "property infrastructure must remain Verify even though its future question remains registered.");

  function answerFor(question) {
    if (question.answerType === "district_multi") return { noPreference: true, districtIds: [], otherText: "" };
    if (question.answerType === "activity_multi") return { activityIds: ["work"] };
    if (question.answerType === "multi") return { optionIds: [question.options[0].id] };
    if (question.answerType === "market_select") return { text: "San Francisco, CA", market: { geographyId: "san-francisco", marketId: "san-francisco", marketName: "San Francisco", city: "San Francisco", state: "CA", displayName: "San Francisco, CA" } };
    if (question.answerType === "number" || question.answerType === "number_or_text") return { text: "25" };
    if (question.answerType === "short_text") return { text: "Known business fact" };
    if (question.answerType === "final_text") return { optionId: "none" };
    return { optionId: question.options[0].id };
  }
  function runPath(seed, limit = 30) {
    let state = engine.createSeededInterview({ ...seed, districtGeography });
    const questions = [];
    for (let index = 0; index < limit; index += 1) {
      const selection = engine.selectNextQuestion(state);
      if (!selection.question) return { state, questions };
      questions.push({ id: selection.question.id, stage: selection.question.stage, prompt: selection.question.prompt, answerType: selection.question.answerType, options: selection.question.options.map((item) => item.label) });
      state = engine.applyInterviewAnswer(state, selection.question.id, answerFor(selection.question));
    }
    return { state, questions };
  }

  const paths = Object.fromEntries(scenarios.map((scenario) => [scenario.id, runPath(scenario)]));
  const ids = (result) => result.questions.map((item) => item.id);
  const stageOrder = Object.fromEntries(engine.INTERVIEW_STAGES.map((item) => [item.id, item.order]));
  Object.entries(paths).forEach(([id, result]) => {
    const orders = result.questions.map((item) => stageOrder[item.stage]);
    assert(orders.every((order, index) => index === 0 || order >= orders[index - 1]), `${id} must progress monotonically through interview stages.`);
    assert(new Set(ids(result)).size === result.questions.length, `${id} must not repeat questions.`);
    assert(ids(result).at(-1) === "final.unusual", `${id} must finish with the location-stage escape hatch.`);
    assert(result.state.requirement.readiness.readyForLocation.ready, `${id} must reach Ready for Location.`);
    assert(engine.selectNextQuestion(result.state).action === "READY", `${id} must stop rather than enter property enrichment.`);
    assert(!result.questions.some((item) => item.stage === "PROPERTY"), `${id} must defer all property-stage questions.`);
  });

  assert(paths["northstar-advisory"].questions.length >= 6 && paths["northstar-advisory"].questions.length <= 10, "Northstar must reach location value without a separate district rationale step.");
  assert(ids(paths["northstar-advisory"]).join(",") === "location.district_candidates,business.identity,office.environment_confirmation,office.exceptions,office.working_pattern,employee.origins,access.parking,customer.origins,final.unusual", "Northstar must capture bounded business identity, working pattern, and its conditional environment confirmation before the existing access path.");
  assert(!ids(paths["northstar-advisory"]).some((id) => /care|food|research|vehicles|industrial|technical|capacity\.basis|transaction|economics|timing/.test(id)), "Northstar must not receive unrelated or property-search questions.");
  const northstarEmployee = paths["northstar-advisory"].questions.find((item) => item.id === "employee.origins");
  assert(northstarEmployee.answerType === "multi" && northstarEmployee.options.includes("San Francisco") && northstarEmployee.options.includes("East Bay"), "Northstar employee geography must use concrete Bay Area choices.");
  assert(ids(paths["northstar-advisory"]).includes("access.parking") && !ids(paths["northstar-advisory"]).includes("access.transit"), "known BART importance must suppress the transit question while parking remains separate.");
  assert(ids(paths["northstar-advisory"]).includes("customer.origins"), "client geography must appear because Northstar has material client visits.");

  assert(paths["usa-shoe-company"].questions.length <= 10, "USA Shoe must reach location value with only bounded storefront and delivery enrichment.");
  assert(ids(paths["usa-shoe-company"]).includes("property.ambiguity") && !ids(paths["usa-shoe-company"]).includes("operations.repair_nature") && ids(paths["usa-shoe-company"]).includes("visitors.pattern"), "USA Shoe must retain location-relevant customer logic while closing secondary activity detail after its property-context choice.");
  assert(!ids(paths["usa-shoe-company"]).some((id) => ["capacity.basis", "capacity.flexibility", "economics.budget", "transaction.intent", "operations.technical"].includes(id)), "USA Shoe must defer property-search detail.");

  assert(paths["bayline-equipment-services"].questions.length <= 9, "Bayline must preserve known industrial facts and ask only unresolved use-mix and loading questions.");
  assert(ids(paths["bayline-equipment-services"]).includes("vehicles.territory") && ids(paths["bayline-equipment-services"]).includes("operations.repair_nature"), "Bayline must ask service-territory and operating-use facts.");
  assert(!ids(paths["bayline-equipment-services"]).includes("operations.technical") && !ids(paths["bayline-equipment-services"]).includes("vehicles.overnight"), "Bayline technical and property-storage diligence must be deferred.");
  assert(paths["bayline-equipment-services"].state.requirement.criteria.some((item) => item.dimension === "industrial.power.exact_capacity" && item.status === "UNKNOWN"), "Bayline exact power must remain Unknown without blocking location readiness.");

  const freshOffice = {
    id: "harbor-accounting",
    requirement: {
      title: "Harbor Accounting — SF office Location Requirement",
      businessContext: { summary: "25-person accounting company with occasional client visits and no unusual use." },
      objective: { summary: "Relocate the office" },
      propertyTypes: ["office"],
      activities: ["work", "meet_collaborate", "host_visitors"],
      locationLogic: { summary: "Employee access matters", locations: ["San Francisco, CA"], rationale: [], marketAnchor: { geographyId: "san-francisco", marketId: "san-francisco", displayName: "San Francisco, CA", marketName: "San Francisco", city: "San Francisco", state: "CA", source: "canonical_commercial_geography" }, specificPreference: { hasPreference: false, displayName: "", geographyId: "", rationale: "", source: "user_statement" } },
      sizeCapacity: { summary: "Approximately 25 people" },
      criteria: [criterion("office.access.client_visits", "Clients visit occasionally")],
    },
  };
  const fresh = runPath(freshOffice);
  assert(fresh.questions.length >= 6 && fresh.questions.length <= 11, "fresh ordinary office must remain bounded after working-pattern and growth enrichment.");
  assert(ids(fresh).join(",") === "location.district_candidates,business.identity,office.environment_confirmation,office.exceptions,office.working_pattern,employee.origins,access.transit,access.parking,customer.origins,office.growth_horizon,final.unusual", "fresh office must add bounded working-pattern and growth signals without property programming.");
  assert(!ids(fresh).some((id) => /care|food|research|vehicles|industrial|repair|technical/.test(id)), "fresh office must never enter unrelated activity branches.");

  let freshEndToEnd = engine.createInterviewState({ districtGeography });
  const freshEndToEndQuestions = [];
  const freshAnswers = {
    "location.anchor": { text: "San Francisco, CA", market: { geographyId: "san-francisco", marketId: "san-francisco", marketName: "San Francisco", city: "San Francisco", state: "CA", displayName: "San Francisco, CA" } },
    "foundation.property_context": { optionId: "office" },
    "location.district_candidates": { noPreference: true, districtIds: [], otherText: "" },
    "foundation.objective": { optionId: "relocate" },
    "business.identity": { optionId: "professional_services" },
    "office.environment_confirmation": { optionId: "neutral" },
    "office.client_frequency": { optionId: "occasional" },
    "office.exceptions": { optionIds: ["none"] },
    "employee.origins": { optionIds: ["san_francisco", "east_bay"] },
    "access.transit": { optionId: "very" },
    "access.parking": { optionId: "helpful" },
    "customer.origins": { optionIds: ["san_francisco"] },
    "final.unusual": { optionId: "none" },
  };
  for (let index = 0; index < 20; index += 1) {
    const selection = engine.selectNextQuestion(freshEndToEnd);
    if (!selection.question) break;
    freshEndToEndQuestions.push(selection.question);
    freshEndToEnd = engine.applyInterviewAnswer(freshEndToEnd, selection.question.id, freshAnswers[selection.question.id] || answerFor(selection.question));
  }
  assert(!freshEndToEndQuestions.some((item) => /preference_rationale|rationale/.test(item.id)), "district selection must never trigger a rationale question.");
  assert(!freshEndToEndQuestions.some((item) => item.id === "work.peak"), "ordinary Office peak attendance must be deferred beyond READY_FOR_LOCATION.");
  assert(!freshEndToEndQuestions.some((item) => /that area/i.test(item.prompt)), "generic 'that area' wording must be absent.");
  assert(freshEndToEnd.requirement.locationLogic.specificPreference.hasPreference === false && !freshEndToEnd.requirement.locationLogic.specificPreference.displayName, "no-preference state must remain separate from the market anchor.");

  const routeSeed = engine.createSeededInterview({ id: "soma-route", districtGeography, requirement: { objective: { summary: "Relocate an office" }, propertyTypes: ["office"], activities: ["work", "meet_collaborate"], locationLogic: { summary: "", locations: ["San Francisco, CA"], rationale: [], marketAnchor: { geographyId: "san-francisco", marketId: "san-francisco", displayName: "San Francisco, CA", marketName: "San Francisco", city: "San Francisco", state: "CA", source: "canonical_commercial_geography" }, specificPreference: { hasPreference: true, candidateDistrictIds: ["soma"], candidateDistrictNames: ["SoMa"], informalText: "", source: "route_context" } }, sizeCapacity: { summary: "25 people" } } });
  const routeQuestion = engine.selectNextQuestion(routeSeed).question;
  assert(routeQuestion.id === "location.district_candidates" && routeQuestion.seededDistrictIds.includes("soma"), "route-seeded canonical district must appear preselected and remain editable.");
  let candidates = engine.applyInterviewAnswer(routeSeed, "location.district_candidates", { districtIds: ["financial-district", "jackson-square", "south-beach"], otherText: "near the Ferry Building" });
  const preference = candidates.requirement.locationLogic.specificPreference;
  assert(preference.candidateDistrictIds.join(",") === "financial-district,jackson-square,south-beach", "multiple canonical district IDs must remain stable.");
  assert(preference.candidateDistrictNames.join(",") === "Financial District,Jackson Square,South Beach", "multiple canonical district names must remain distinct.");
  assert(preference.informalText === "near the Ferry Building", "informal preference text must be stored separately from canonical districts.");
  assert(candidates.requirement.criteria.find((item) => item.dimension === "universal.location.specific_preference").status === "PREFERRED", "candidate districts must remain preferences rather than hard constraints.");
  assert(!engine.QUESTION_REGISTRY.some((item) => /preference_rationale|rationale/.test(item.id)), "normal interview must contain no mandatory district rationale question.");
  const debug = engine.interviewDebug(candidates);
  assert(debug.locationDrivers.candidateDistricts.length === 3 && debug.locationDrivers.informalLocationPreference === "near the Ferry Building", "debug mode must expose canonical and informal preferences separately.");
  const restoredPreference = engine.hydrateInterviewState(JSON.parse(JSON.stringify(candidates)));
  assert(restoredPreference.requirement.locationLogic.specificPreference.candidateDistrictIds.length === 3 && engine.selectNextQuestion(restoredPreference).question.id === engine.selectNextQuestion(candidates).question.id, "session restoration must preserve district selections and deterministic progression.");
  const backedPreference = engine.backInterview(restoredPreference);
  assert(engine.selectNextQuestion(backedPreference).question.id === "location.district_candidates" && backedPreference.requirement.locationLogic.specificPreference.candidateDistrictIds.includes("soma"), "Back must restore the editable route-seeded selection.");
  const noPreference = engine.applyInterviewAnswer(routeSeed, "location.district_candidates", { noPreference: true, districtIds: ["soma"], otherText: "ignored" });
  assert(noPreference.requirement.locationLogic.specificPreference.hasPreference === false && !noPreference.requirement.locationLogic.specificPreference.candidateDistrictIds.length && !noPreference.requirement.locationLogic.specificPreference.informalText, "No — help me decide must be mutually exclusive with canonical and informal preferences.");
  const unsupportedDistricts = engine.createSeededInterview({ id: "unsupported-districts", districtGeography, requirement: { objective: { summary: "Open an office" }, propertyTypes: ["office"], activities: ["work"], locationLogic: { marketAnchor: { displayName: "Orlando, FL", marketName: "Orlando", marketId: "", city: "Orlando", state: "FL", source: "user_freeform" } }, sizeCapacity: { summary: "20 people" } } });
  const unsupportedQuestion = engine.selectNextQuestion(unsupportedDistricts).question;
  assert(unsupportedQuestion.id === "location.district_candidates" && unsupportedQuestion.prompt === "Any specific area already on your list?" && unsupportedQuestion.options.length === 0, "unsupported markets must offer only no-preference and informal freeform fallback.");
  let finalText = engine.createSeededInterview({ id: "final-text", districtGeography, requirement: freshOffice.requirement });
  for (let index = 0; index < 20 && engine.selectNextQuestion(finalText).question?.id !== "final.unusual"; index += 1) {
    const next = engine.selectNextQuestion(finalText).question;
    finalText = engine.applyInterviewAnswer(finalText, next.id, answerFor(next));
  }
  finalText = engine.applyInterviewAnswer(finalText, "final.unusual", { text: "We hold a quarterly training day." });
  assert(finalText.requirement.businessContext.summary.includes("quarterly training day"), "final unusual-needs textarea must preserve its freeform answer.");

  const noClientOffice = engine.createSeededInterview({ id: "no-clients", requirement: { objective: { summary: "Open an office" }, propertyTypes: ["office"], activities: ["work", "meet_collaborate"], locationLogic: { summary: "Employee access", locations: ["San Francisco"], rationale: [] }, sizeCapacity: { summary: "20 people" }, criteria: [criterion("office.access.client_visits", "Clients rarely or never visit", "FLEXIBLE")] } });
  assert(!engine.eligibleQuestions(noClientOffice).some((item) => item.id === "customer.origins"), "customer geography must be suppressed when visits are rare.");
  assert(engine.QUESTION_REGISTRY.find((item) => item.id === "foundation.objective").prompt === "What is your goal?", "Goal wording must remain consumer-facing without changing its resolver or values.");
  assert(engine.QUESTION_REGISTRY.find((item) => item.id === "access.parking").prompt === "How important is it to be in an area where parking is generally easier?", "Location-stage parking must ask about district parking environment, not building parking quantity.");
  const frequentClientOffice = engine.hydrateInterviewState(JSON.parse(JSON.stringify(noClientOffice)));
  frequentClientOffice.requirement.activities = Array.from(new Set([...frequentClientOffice.requirement.activities, "host_visitors"]));
  const clientCriterion = frequentClientOffice.requirement.criteria.find((item) => item.dimension === "office.access.client_visits");
  clientCriterion.value.text = "Clients visit frequently";
  assert(engine.eligibleQuestions(frequentClientOffice).some((item) => item.id === "customer.origins"), "customer geography must remain available when Office clients visit materially.");

  const ambiguous = engine.createSeededInterview({ id: "ambiguity", requirement: { objective: { summary: "Find customer-facing repair space" }, propertyTypes: ["retail_service"], activities: ["host_visitors", "sell_serve", "repair_service", "store"], locationLogic: { summary: "Customer geography", locations: ["Orlando"], rationale: [] }, sizeCapacity: { summary: "8,000 SF" } } });
  assert(engine.eligibleQuestions(ambiguous).some((item) => item.id === "property.ambiguity"), "material repair/storage evidence must surface property ambiguity.");
  const expanded = engine.applyInterviewAnswer(ambiguous, "property.ambiguity", { optionId: "include" });
  assert(expanded.requirement.propertyTypes.includes("retail_service") && expanded.requirement.propertyTypes.includes("industrial_flex"), "confirmed ambiguity must preserve stated context and add compatible scope.");
  const routineOffice = engine.createSeededInterview({ id: "routine", requirement: { objective: { summary: "Open an office" }, propertyTypes: ["office"], activities: ["work", "meet_collaborate", "host_visitors"], locationLogic: { summary: "Employee access", locations: ["San Francisco"], rationale: [] }, sizeCapacity: { summary: "20 people" } } });
  assert(!engine.eligibleQuestions(routineOffice).some((item) => item.id === "property.ambiguity"), "routine office work, collaboration, and client visits must not create ambiguity.");

  const beforeBack = fresh.state.history.length;
  const afterBack = engine.backInterview(fresh.state);
  assert(afterBack.history.length === beforeBack - 1 && !afterBack.answers["final.unusual"], "Back must recalculate from retained answers.");

  const propertyIds = ["work.peak", "transaction.intent", "economics.budget", "timing.target", "capacity.basis", "capacity.flexibility", "operations.technical", "vehicles.overnight", "research.infrastructure"];
  assert(propertyIds.every((id) => engine.QUESTIONS_BY_ID[id].stage === "PROPERTY"), "property-search questions must remain registered behind the progressive-enrichment boundary.");

  const abstractPhrases = ["commute orientation", "employee geography or commute pattern", "operational-use archetypes", "customer-facing is your business"];
  engine.QUESTION_REGISTRY.filter((item) => item.stage !== "PROPERTY").forEach((item) => abstractPhrases.forEach((phrase) => assert(!item.prompt.toLowerCase().includes(phrase), `${item.id} must ask for concrete business facts.`)));

  const page = fs.readFileSync("pages/prototype/requirement-v1.njk", "utf8");
  const client = fs.readFileSync("js/requirement-prototype.js", "utf8");
  const functionSource = fs.readFileSync("functions/api/prototype/requirement/turn.js", "utf8");
  assert(page.includes("eleventyExcludeFromCollections: true") && page.includes("robots: noindex,nofollow"), "prototype route must remain private and noindex.");
  assert(page.includes("commercialGeography.markets") && page.includes("data-requirement-markets"), "private route must reuse canonical commercial geography data.");
  assert(page.includes("requirementPrototypeDistrictGeography") && page.includes("data-requirement-districts"), "private route must receive the canonical district projection.");
  assert(page.includes("data-continue-question disabled"), "Continue must start disabled until a valid answer is selected.");
  assert(!client.includes('input.addEventListener("change", () => submitAnswer'), "single-select answers must not auto-advance.");
  assert(client.includes("updateContinueState") && client.includes("is-selected"), "client must validate before Continue and render a strong selected state.");
  assert(!client.includes("datalist") && client.includes("search-profile-location-results") && client.includes('role", "combobox"'), "market control must reuse Rofo's autocomplete/listbox interaction rather than a native datalist.");
  assert(client.includes('if (spec.element === "input")') && client.includes('else if (spec.element === "textarea")') && !client.includes("textInput.type"), "shared renderer must distinguish inputs from textareas and never assign type to a textarea.");
  assert(client.includes("addOther(question, control)") && client.includes("data-other-text"), "Something else must remain wired through shared freeform handling.");
  assert(client.includes('elements["continue-question"].onclick') && client.includes('elements["continue-question"].disabled'), "Continue must remain explicit and validity-gated.");
  assert(client.includes("backInterview(state.interview)") && client.includes("sessionStorage.getItem") && client.includes("sessionStorage.setItem"), "Back and session restoration hooks must remain intact.");
  assert(client.includes("requirement-district-toggle") && client.includes("Show fewer") && client.includes("data-no-district-preference") && client.includes("data-district-other-text"), "district UI must provide Show all/fewer, exclusive no-preference, and informal freeform controls.");
  assert(!client.includes("location.preference_rationale") && !client.includes("What makes SoMa"), "client must not retain mandatory district rationale behavior.");
  const operatorV2Fetches = client.match(/fetch\(/g) || [];
  assert(!client.includes("OPENAI_API_KEY") && !client.includes("/api/prototype/requirement/turn"), "ordinary progression must remain zero-AI and local.");
  assert(operatorV2Fetches.length === 2, "Only the explicit operator v2 persist and canonical-edit hydration calls may use fetch in the adaptive client.");
  assert(client.includes("/api/location-brief-v2/create") && client.includes("/api/location-brief-v2/${encodeURIComponent(locationBriefV2PublicId)}"), "Allowed fetches must remain bounded to operator Location Brief v2 persistence.");
  assert(functionSource.includes("OPENAI_API_KEY"), "the isolated server-side model boundary must remain available but unused.");
  ["/api/leads/submit", "/api/location-brief/submit", "OFFICEFINDER", "LEADS_DB", "LOCATION_BRIEFS_DB"].forEach((token) => assert(!page.includes(token) && !client.includes(token), `prototype must not reference ${token}.`));

  Object.entries(paths).forEach(([id, result]) => console.log(`${id}: ${result.questions.map((item) => `${item.stage}:${item.id}`).join(" -> ")}`));
  console.log(`fresh-office: ${fresh.questions.map((item) => `${item.stage}:${item.id}`).join(" -> ")}`);
  console.log(`fresh-office-end-to-end: ${freshEndToEndQuestions.map((item) => `${item.stage}:${item.id}`).join(" -> ")}`);
  console.log(`district-candidates: ${preference.candidateDistrictNames.join(" · ")} + ${preference.informalText}`);
  console.log(`activities=${engine.ACTIVITY_REGISTRY.length}; questions=${engine.QUESTION_REGISTRY.length}; dimensions=${domain.DIMENSION_REGISTRY.length}`);
  if (failures) process.exitCode = 1;
  else console.log("Location-first Requirement Interview QA passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
