const fs = require("fs");
const path = require("path");

let failures = 0;
function assert(condition, message) {
  if (!condition) {
    failures += 1;
    console.error(`Requirement Prototype QA error: ${message}`);
  }
}

function value(text = "", number = null, boolean = null, list = []) {
  return { text, number, boolean, list };
}

function operation(id, target, status, options = {}) {
  return {
    operationId: id,
    type: options.type || "UPSERT_CRITERION",
    target,
    value: options.value || value(options.text || "Yes"),
    status: status || "",
    scope: options.scope || "property",
    source: options.source || "user_statement",
    confidence: options.confidence === undefined ? 1 : options.confidence,
    rationale: options.rationale || "Explicitly supplied by the user.",
    authority: options.authority || "business",
    requiresConfirmation: Boolean(options.requiresConfirmation),
  };
}

function turn(operations, options = {}) {
  return {
    assistantMessage: options.assistantMessage || "That helps clarify the search.",
    proposedOperations: operations,
    possibleInferences: options.possibleInferences || [],
    contradictions: options.contradictions || [],
    nextQuestion: options.nextQuestion || {
      dimension: "universal.location.business_logic",
      reasonCategory: "location",
      question: "Why does that geography matter to the business?",
      quickChoices: [],
      whyItMatters: "The answer could change the location shortlist.",
    },
    recommendedAction: options.recommendedAction || "ASK",
  };
}

(async function run() {
  const domain = await import(path.resolve("lib/requirements/requirement-domain-v1.mjs"));
  const modelModule = await import(path.resolve("functions/api/prototype/requirement/_model-client.mjs"));
  const scenarios = require("../js/requirement-prototype-scenarios.js");

  assert(domain.ALLOWED_STATUSES.join(",") === "REQUIRED,PREFERRED,FLEXIBLE,UNKNOWN,VERIFY", "allowed statuses must match the product specification.");
  assert(domain.DIMENSION_REGISTRY.length > 20 && domain.DIMENSION_REGISTRY.length <= 65, "dimension registry should remain bounded after adding the four reviewed adaptive space-use signals.");
  for (const id of ["retail.property.storefront_priority", "industrial.loading.form", "industrial.operations.use_mix", "industrial.customer.visit_priority"]) assert(domain.DIMENSIONS_BY_ID[id], `${id} must be canonical rather than UI-only state.`);
  assert(new Set(domain.DIMENSION_REGISTRY.map((item) => item.id)).size === domain.DIMENSION_REGISTRY.length, "dimension ids must be unique.");
  assert(domain.DIMENSION_REGISTRY.every((item) => item.id.includes(".")), "dimensions must be namespaced.");

  const unknownDimension = domain.validateModelTurn(turn([
    operation("bad", "industrial.magic.teleporter", "REQUIRED"),
  ]));
  assert(!unknownDimension.valid && unknownDimension.errors.some((error) => error.includes("Unknown dimension")), "unknown dimensions must be rejected.");

  const invalidStatus = domain.normalizeCriterion({
    dimension: "industrial.power.three_phase",
    value: value("Needed"),
    status: "MUST_HAVE",
    scope: "property",
    source: "user_statement",
    confidence: 1,
    authority: "business",
  });
  assert(invalidStatus.errors.some((error) => error.includes("Invalid status")), "invalid criterion states must be rejected.");

  const unknown = domain.normalizeCriterion({
    dimension: "industrial.power.exact_capacity",
    value: value(""),
    status: "UNKNOWN",
    scope: "diligence",
    source: "user_statement",
    confidence: 1,
    authority: "external_property",
  });
  assert(unknown.criterion && unknown.criterion.status === "UNKNOWN", "Unknown must survive canonical validation.");

  const verify = domain.normalizeCriterion({
    dimension: "universal.diligence.permitted_use",
    value: value("Confirm at each serious property"),
    status: "VERIFY",
    scope: "diligence",
    source: "user_statement",
    confidence: 1,
    authority: "external_property",
  });
  assert(verify.criterion && verify.criterion.status === "VERIFY", "Verify must survive canonical validation.");

  const falseExternalConfirmation = domain.normalizeCriterion({
    dimension: "industrial.power.exact_capacity",
    value: value("400 amps"),
    status: "REQUIRED",
    scope: "diligence",
    source: "ai_inference",
    confidence: .9,
    authority: "business",
  });
  assert(falseExternalConfirmation.errors.some((error) => error.includes("must remain UNKNOWN or VERIFY")), "AI must not confirm external/property facts.");

  let requirement = domain.createEmptyRequirement();
  const inferredFleet = turn([
    operation("fleet", "industrial.site.fleet_storage", "REQUIRED", {
      source: "ai_inference",
      requiresConfirmation: true,
      text: "Secure overnight storage for 14 vans",
      rationale: "The user mentioned 14 service vans, but did not yet say whether they stay onsite.",
    }),
  ]);
  const validatedFleet = domain.validateModelTurn(inferredFleet);
  assert(validatedFleet.valid, "valid consequential inference should pass turn-shape validation.");
  const fleetMerge = domain.applyModelTurn(requirement, validatedFleet.turn);
  assert(fleetMerge.pendingInferences.length === 1, "consequential AI inference must wait for confirmation.");
  assert(!fleetMerge.requirement.criteria.some((item) => item.dimension === "industrial.site.fleet_storage"), "unconfirmed consequential inference must not enter canonical state.");
  const fleetConfirmed = domain.resolvePendingInference(fleetMerge.requirement, fleetMerge.pendingInferences[0], "accept");
  assert(fleetConfirmed.requirement.criteria.some((item) => item.dimension === "industrial.site.fleet_storage" && item.confirmed), "confirmed inference should enter canonical state.");

  requirement = domain.createEmptyRequirement();
  const preferred = domain.validateModelTurn(turn([operation("parking_pref", "retail.access.parking", "PREFERRED", { text: "Customer parking" })]));
  requirement = domain.applyModelTurn(requirement, preferred.turn).requirement;
  const promote = domain.validateModelTurn(turn([operation("parking_req", "retail.access.parking", "REQUIRED", { source: "ai_inference", text: "Customer parking" })]));
  const promoted = domain.applyModelTurn(requirement, promote.turn);
  assert(promoted.rejectedOperations.some((item) => item.rejectionReason.includes("Preferred to Required")), "AI must not silently promote Preferred to Required.");
  assert(promoted.requirement.criteria.find((item) => item.dimension === "retail.access.parking").status === "PREFERRED", "rejected promotion must preserve prior state.");

  function applyScenarioOperations(propertyType, operations) {
    const base = domain.createEmptyRequirement();
    const setup = [
      operation("title", "title", "", { type: "SET_FIELD", value: value(`${propertyType} Requirement`) }),
      operation("business", "businessContext.summary", "", { type: "SET_FIELD", value: value("Business operating context") }),
      operation("objective", "objective.summary", "", { type: "SET_FIELD", value: value("Find a location and property that supports operations") }),
      operation("type", "propertyTypes", "", { type: "SET_FIELD", value: value("", null, null, [propertyType]) }),
      operation("activities", "activities", "", { type: "SET_FIELD", value: value("", null, null, ["Core operating activity"]) }),
      operation("locations", "locationLogic.locations", "", { type: "SET_FIELD", value: value("", null, null, ["Starting geography"]) }),
      operation("location-why", "locationLogic.summary", "", { type: "SET_FIELD", value: value("Business access and geography matter") }),
      operation("size-summary", "sizeCapacity.summary", "", { type: "SET_FIELD", value: value("Workable size range understood") }),
      operation("timing-summary", "timing.summary", "", { type: "SET_FIELD", value: value("Timing understood") }),
      operation("growth-summary", "growth.summary", "", { type: "SET_FIELD", value: value("Growth implications understood") }),
      operation("transaction", "universal.transaction.intent", "FLEXIBLE", { scope: "economics", text: "Transaction intent known" }),
      ...operations,
    ];
    const validated = domain.validateModelTurn(turn(setup));
    assert(validated.valid, `${propertyType}: scenario operations should validate (${validated.errors.join(" ")}).`);
    return domain.applyModelTurn(base, validated.turn).requirement;
  }

  const shoe = applyScenarioOperations("retail_service", [
    operation("customer", "retail.customer.interaction", "REQUIRED", { scope: "business", text: "Customer-facing personal service" }),
    operation("repair", "retail.operations.repair_storage", "REQUIRED", { scope: "business", text: "Shoe repair and storage onsite" }),
    operation("parking", "retail.access.parking", "PREFERRED", { text: "Convenient customer parking" }),
    operation("use", "universal.diligence.permitted_use", "VERIFY", { scope: "diligence", authority: "external_property", text: "Verify permitted use at each property" }),
  ]);
  assert(shoe.readiness.readyForLocation.ready, "USA Shoe pattern should reach location readiness without exhaustive fields.");
  assert(shoe.readiness.readyForPropertySearch.ready, "USA Shoe pattern should reach property-search readiness when disqualifiers are represented.");

  const northstar = applyScenarioOperations("office", [
    operation("purpose", "office.workplace.purpose", "REQUIRED", { scope: "business", text: "Clients, collaboration, recruiting, and culture" }),
    operation("attendance", "office.occupancy.peak_attendance", "REQUIRED", { value: value("35–40 people on peak days") }),
    operation("bart", "office.access.transit", "PREFERRED", { scope: "location", text: "Strong BART access" }),
  ]);
  assert(northstar.readiness.readyForLocation.ready, "Northstar pattern should reach location readiness.");
  assert(northstar.readiness.readyForPropertySearch.ready, "Northstar pattern should reach property-search readiness.");

  const bayline = applyScenarioOperations("industrial_flex", [
    operation("activity", "industrial.operations.primary_activity", "REQUIRED", { scope: "business", text: "HVAC service dispatch, storage, and repair" }),
    operation("fleet", "industrial.site.fleet_storage", "REQUIRED", { text: "Secure storage for service vans" }),
    operation("loading", "industrial.loading.grade_level", "REQUIRED", { text: "Grade-level loading" }),
    operation("three-phase", "industrial.power.three_phase", "REQUIRED", { text: "Three-phase power" }),
    operation("capacity", "industrial.power.exact_capacity", "UNKNOWN", { scope: "diligence", authority: "external_property", value: value("") }),
  ]);
  assert(bayline.criteria.some((item) => item.dimension === "industrial.power.exact_capacity" && item.status === "UNKNOWN"), "Bayline exact power capacity must remain Unknown.");
  assert(bayline.readiness.readyForPropertySearch.ready, "Bayline pattern should reach property-search readiness with technical uncertainty represented.");
  assert(domain.shouldStop(bayline, "READY", []), "stopping should require deterministic readiness plus model READY recommendation.");
  assert(!domain.shouldStop(bayline, "ASK", []), "deterministic readiness alone should not force a stop while the model identifies a useful question.");

  assert(scenarios.length === 3, "exactly three acceptance fixtures should be loadable.");
  assert(scenarios.every((scenario) => scenario.requirement && !scenario.questions && !scenario.nextQuestion), "fixtures must seed Requirement context without hard-coded interview paths.");

  const missingClient = modelModule.createRequirementModelClient({});
  assert(!missingClient.configured, "model client must report a missing API key clearly.");
  try {
    await missingClient.createTurn({ instructions: "x", input: "x" });
    assert(false, "missing API key should reject before fetch.");
  } catch (error) {
    assert(error.code === "missing_api_key", "missing API key should use a recoverable configuration error code.");
  }

  let requested = null;
  const mockClient = modelModule.createRequirementModelClient({ OPENAI_API_KEY: "test-key", OPENAI_REQUIREMENT_MODEL: "test-model" }, async (url, options) => {
    requested = { url, options };
    return new Response(JSON.stringify({
      id: "resp_test",
      model: "test-model",
      output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(turn([])) }] }],
      usage: { input_tokens: 10, output_tokens: 20, total_tokens: 30 },
    }), { status: 200, headers: { "content-type": "application/json" } });
  });
  const mockResult = await mockClient.createTurn({ instructions: "prompt", input: "input" });
  assert(requested.url === "https://api.openai.com/v1/responses", "OpenAI must be called from the server model client through the Responses API.");
  const requestBody = JSON.parse(requested.options.body);
  assert(requestBody.text.format.type === "json_schema" && requestBody.text.format.strict === true, "OpenAI response must use strict JSON Schema output.");
  assert(requested.options.headers.authorization === "Bearer test-key", "API key must remain in the server request header.");
  assert(mockResult.metadata.usage.total_tokens === 30, "token metadata should be available to evaluator debug output.");

  const page = fs.readFileSync("pages/prototype/requirement-v1.njk", "utf8");
  const functionSource = fs.readFileSync("functions/api/prototype/requirement/turn.js", "utf8");
  const clientSource = fs.readFileSync("js/requirement-prototype.js", "utf8");
  const sitemap = fs.readFileSync("pages/sitemap.njk", "utf8");
  assert(page.includes("eleventyExcludeFromCollections: true") && page.includes("robots: noindex,nofollow"), "prototype route must be excluded from collections and noindexed.");
  assert(!sitemap.includes("requirement-v1"), "private route must not be added to the sitemap.");
  assert(!clientSource.includes("api.openai.com") && !/sk-[A-Za-z0-9]/.test(clientSource), "browser code must not contain an OpenAI credential or call OpenAI directly.");
  assert(functionSource.includes("OPENAI_API_KEY") && functionSource.includes("isAllowedBrowserRequest"), "Function must own the secret and private-route request boundary.");
  ["/api/leads/submit", "/api/location-brief/submit", "LEADS_DB", "LOCATION_BRIEFS_DB", "OFFICEFINDER"].forEach((forbidden) => {
    assert(!page.includes(forbidden) && !clientSource.includes(forbidden) && !functionSource.includes(forbidden), `prototype must not reference production mutation path ${forbidden}.`);
  });

  console.log(`requirement dimensions: ${domain.DIMENSION_REGISTRY.length}`);
  console.log(`scenario readiness: shoe=${shoe.readiness.nextAction}; northstar=${northstar.readiness.nextAction}; bayline=${bayline.readiness.nextAction}`);
  console.log(`OpenAI contract: model=${mockClient.model}; strict=${requestBody.text.format.strict}`);
  if (failures) process.exitCode = 1;
  else console.log("Requirement Prototype QA passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
