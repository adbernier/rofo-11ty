export const REQUIREMENT_SCHEMA_VERSION = "requirement:v1";
export const DIMENSION_REGISTRY_VERSION = "requirement-dimensions:v1.5-adaptive-space-use";
export const ALLOWED_STATUSES = Object.freeze(["REQUIRED", "PREFERRED", "FLEXIBLE", "UNKNOWN", "VERIFY"]);
export const ALLOWED_SCOPES = Object.freeze(["business", "location", "property", "economics", "timing", "diligence"]);
export const ALLOWED_AUTHORITIES = Object.freeze(["business", "rofo", "external_property", "professional"]);
export const ALLOWED_SOURCES = Object.freeze(["user_statement", "user_correction", "ai_inference", "rofo_knowledge", "external_record"]);
export const PROPERTY_CONTEXTS = Object.freeze(["office", "retail_service", "industrial_flex", "medical", "life_science_rd", "special_purpose", "mixed", "unknown"]);
const ALL_PROPERTY_CONTEXTS = PROPERTY_CONTEXTS;

const dimension = (id, label, propertyTypes, scope, options = {}) => Object.freeze({
  id,
  label,
  propertyTypes,
  scope,
  valueType: options.valueType || "text",
  consequential: Boolean(options.consequential),
  externalAuthority: Boolean(options.externalAuthority),
  readiness: options.readiness || [],
});

export const DIMENSION_REGISTRY = Object.freeze([
  dimension("universal.business.type", "Business identity", ALL_PROPERTY_CONTEXTS, "business", { readiness: ["location"] }),
  dimension("universal.business.operating_pattern", "Operating pattern", ["office", "retail_service", "industrial_flex"], "business", { readiness: ["location"] }),
  dimension("universal.location.anchor", "Market anchor", ALL_PROPERTY_CONTEXTS, "location", { consequential: true, readiness: ["location"] }),
  dimension("universal.location.specific_preference", "Specific location preference", ALL_PROPERTY_CONTEXTS, "location", { consequential: true, readiness: ["location"] }),
  dimension("universal.location.preference_rationale", "Specific location preference rationale", ALL_PROPERTY_CONTEXTS, "location", { readiness: ["location"] }),
  dimension("universal.location.business_logic", "Why the location matters", ["office", "retail_service", "industrial_flex"], "location", { readiness: ["location"] }),
  dimension("universal.capacity.size", "Size or capacity", ["office", "retail_service", "industrial_flex"], "property", { consequential: true, readiness: ["location", "property"] }),
  dimension("universal.transaction.intent", "Purchase or lease", ["office", "retail_service", "industrial_flex"], "economics", { consequential: true, readiness: ["property"] }),
  dimension("universal.economics.budget", "Budget", ["office", "retail_service", "industrial_flex"], "economics", { consequential: true }),
  dimension("universal.timing.target", "Target timing", ["office", "retail_service", "industrial_flex"], "timing", { readiness: ["property"] }),
  dimension("universal.timing.current_lease", "Current lease timing", ["office", "retail_service", "industrial_flex"], "timing", { readiness: ["property"] }),
  dimension("universal.growth.future_state", "Growth and future state", ["office", "retail_service", "industrial_flex"], "property", { consequential: true, readiness: ["property"] }),
  dimension("universal.diligence.permitted_use", "Permitted use", ["office", "retail_service", "industrial_flex"], "diligence", { externalAuthority: true, readiness: ["property"] }),
  dimension("universal.property.context_ambiguity", "Property context", ALL_PROPERTY_CONTEXTS, "property", { consequential: true }),
  dimension("universal.capacity.basis", "Size estimate basis", ALL_PROPERTY_CONTEXTS, "property"),
  dimension("universal.capacity.flexibility", "Size flexibility", ALL_PROPERTY_CONTEXTS, "property", { consequential: true }),
  dimension("universal.location.flexibility", "Location flexibility", ALL_PROPERTY_CONTEXTS, "location", { consequential: true }),
  dimension("universal.location.employee_origins", "Employee origins", ALL_PROPERTY_CONTEXTS, "location", { consequential: true, readiness: ["location"] }),
  dimension("universal.location.customer_origins", "Customer or client origins", ALL_PROPERTY_CONTEXTS, "location", { consequential: true, readiness: ["location"] }),
  dimension("universal.access.transit_importance", "Public transit importance", ALL_PROPERTY_CONTEXTS, "location", { consequential: true, readiness: ["location"] }),
  dimension("universal.access.parking_importance", "Parking importance", ALL_PROPERTY_CONTEXTS, "location", { consequential: true, readiness: ["location"] }),
  dimension("universal.operations.technical_screen", "Technical operating needs", ALL_PROPERTY_CONTEXTS, "property", { consequential: true }),

  dimension("office.workplace.purpose", "Workplace purpose", ["office"], "business", { readiness: ["location", "property"] }),
  dimension("office.occupancy.peak_attendance", "Peak attendance", ["office"], "property", { valueType: "number_or_text", readiness: ["property"] }),
  dimension("office.location.employee_geography", "Employee geography", ["office"], "location", { consequential: true, readiness: ["location"] }),
  dimension("office.access.client_visits", "Client visits and access", ["office"], "location", { readiness: ["location"] }),
  dimension("office.workplace.recruiting_culture", "Recruiting and culture", ["office"], "business", { readiness: ["location"] }),
  dimension("office.environment.image", "Office environment and image", ["office"], "property", { readiness: ["location"] }),
  dimension("office.workplace.meetings_collaboration", "Meetings and collaboration", ["office"], "business", { readiness: ["property"] }),
  dimension("office.access.transit", "Transit access", ["office"], "location", { consequential: true, readiness: ["location"] }),
  dimension("office.access.parking", "Parking", ["office"], "property", { consequential: true }),
  dimension("office.flexibility.growth", "Growth flexibility", ["office"], "property", { consequential: true, readiness: ["property"] }),

  dimension("retail.customer.interaction", "Customer interaction", ["retail_service"], "business", { readiness: ["location", "property"] }),
  dimension("retail.customer.destination_visibility", "Destination versus visibility", ["retail_service"], "location", { consequential: true, readiness: ["location"] }),
  dimension("retail.access.parking", "Customer parking and access", ["retail_service"], "property", { consequential: true, readiness: ["property"] }),
  dimension("retail.operations.repair_storage", "Repair, operating, and storage activity", ["retail_service"], "business", { consequential: true, readiness: ["location", "property"] }),
  dimension("retail.operations.delivery_receiving", "Delivery and receiving", ["retail_service"], "property", { consequential: true, readiness: ["property"] }),
  dimension("retail.location.customer_logic", "Customer and trade-area logic", ["retail_service"], "location", { consequential: true, readiness: ["location"] }),
  dimension("retail.flexibility.expansion", "Expansion strategy", ["retail_service"], "property", { consequential: true, readiness: ["property"] }),
  dimension("retail.property.storefront_priority", "Storefront visibility and signage priority", ["retail_service"], "property", { consequential: true, readiness: ["property"] }),

  dimension("industrial.operations.primary_activity", "Primary operating activity", ["industrial_flex"], "business", { consequential: true, readiness: ["location", "property"] }),
  dimension("industrial.location.employee_service_geography", "Employee and service geography", ["industrial_flex"], "location", { consequential: true, readiness: ["location"] }),
  dimension("industrial.site.fleet_storage", "Fleet and vehicle storage", ["industrial_flex"], "property", { consequential: true, readiness: ["property"] }),
  dimension("industrial.site.yard_outdoor_storage", "Yard and outdoor storage", ["industrial_flex"], "property", { consequential: true, readiness: ["property"] }),
  dimension("industrial.operations.warehouse_storage", "Warehouse and storage", ["industrial_flex"], "property", { readiness: ["property"] }),
  dimension("industrial.loading.grade_level", "Grade-level loading", ["industrial_flex"], "property", { consequential: true, readiness: ["property"] }),
  dimension("industrial.access.truck_circulation", "Truck access and circulation", ["industrial_flex"], "property", { consequential: true, readiness: ["property"] }),
  dimension("industrial.operations.repair_production", "Repair and production activity", ["industrial_flex"], "business", { consequential: true, readiness: ["location", "property"] }),
  dimension("industrial.power.three_phase", "Three-phase power", ["industrial_flex"], "property", { consequential: true, readiness: ["property"] }),
  dimension("industrial.power.exact_capacity", "Exact electrical capacity", ["industrial_flex"], "diligence", { externalAuthority: true, readiness: ["property"] }),
  dimension("industrial.property.office_component", "Office component", ["industrial_flex"], "property", { readiness: ["property"] }),
  dimension("industrial.loading.form", "Loading form", ["industrial_flex"], "property", { consequential: true, readiness: ["property"] }),
  dimension("industrial.operations.use_mix", "Office, production, warehouse, and showroom mix", ["industrial_flex"], "business", { consequential: true, readiness: ["location", "property"] }),
  dimension("industrial.customer.visit_priority", "Customer-facing and showroom priority", ["industrial_flex"], "business", { readiness: ["location", "property"] }),

  dimension("medical.care.operating_pattern", "Treatment and care pattern", ["medical", "mixed", "unknown"], "business", { readiness: ["location", "property"] }),
  dimension("medical.business.practice_description", "Medical practice or healthcare use", ["medical", "mixed", "unknown"], "business", { readiness: ["location", "property"] }),
  dimension("medical.access.patient", "Patient access", ["medical", "mixed", "unknown"], "property", { consequential: true, readiness: ["property"] }),
  dimension("medical.diligence.buildout", "Medical buildout and use", ["medical", "mixed", "unknown"], "diligence", { externalAuthority: true, readiness: ["property"] }),
  dimension("research.operations.intensity", "Research and testing intensity", ["life_science_rd", "industrial_flex", "mixed", "unknown"], "business", { consequential: true, readiness: ["property"] }),
  dimension("research.diligence.infrastructure", "Research infrastructure", ["life_science_rd", "industrial_flex", "mixed", "unknown"], "diligence", { externalAuthority: true, readiness: ["property"] }),
  dimension("food.operations.intensity", "Food preparation intensity", ["retail_service", "industrial_flex", "special_purpose", "mixed", "unknown"], "business", { consequential: true, readiness: ["property"] }),
  dimension("food.diligence.infrastructure", "Food infrastructure and use", ["retail_service", "industrial_flex", "special_purpose", "mixed", "unknown"], "diligence", { externalAuthority: true, readiness: ["property"] }),
  dimension("special.events.peak", "Training or event peak attendance", ["office", "retail_service", "special_purpose", "mixed", "unknown"], "property", { consequential: true, readiness: ["property"] }),
  dimension("special.diligence.occupancy", "Occupancy and assembly use", ["office", "retail_service", "special_purpose", "mixed", "unknown"], "diligence", { externalAuthority: true, readiness: ["property"] }),
  dimension("special.outdoor.operations", "Outdoor operations", ["industrial_flex", "special_purpose", "mixed", "unknown"], "property", { consequential: true, readiness: ["property"] }),
]);

export const DIMENSIONS_BY_ID = Object.freeze(Object.fromEntries(DIMENSION_REGISTRY.map((item) => [item.id, item])));

const cleanText = (value, max = 1200) => String(value == null ? "" : value).trim().slice(0, max);
const cleanList = (value, limit = 20) => (Array.isArray(value) ? value : [])
  .map((item) => cleanText(item, 240))
  .filter(Boolean)
  .slice(0, limit);

export function createEmptyRequirement(options = {}) {
  const now = new Date().toISOString();
  return {
    schemaVersion: REQUIREMENT_SCHEMA_VERSION,
    revision: 0,
    title: cleanText(options.title || "New commercial real-estate Requirement", 160),
    businessContext: { summary: "" },
    objective: { summary: "" },
    propertyTypes: [],
    activities: [],
    locationLogic: {
      summary: "",
      locations: [],
      rationale: [],
      marketAnchor: { geographyId: "", marketId: "", displayName: "", marketName: "", city: "", state: "", source: "" },
      specificPreference: { hasPreference: null, displayName: "", geographyId: "", rationale: "", source: "", candidateDistrictIds: [], candidateDistrictNames: [], informalText: "" },
    },
    sizeCapacity: { summary: "" },
    economics: { summary: "" },
    timing: { summary: "" },
    growth: { summary: "" },
    criteria: [],
    readiness: emptyReadiness(),
    provenance: {
      createdAt: now,
      updatedAt: now,
      scenarioId: cleanText(options.scenarioId || "", 80),
      promptVersion: cleanText(options.promptVersion || "", 80),
      dimensionRegistryVersion: DIMENSION_REGISTRY_VERSION,
    },
  };
}

function emptyReadiness() {
  return {
    readyForLocation: { ready: false, blockers: [], evidence: [] },
    readyForPropertySearch: { ready: false, blockers: [], evidence: [] },
    readyForMarketResponse: { ready: false, blockers: ["Outside the v1 prototype"], evidence: [] },
    nextAction: "ASK",
  };
}

export function normalizeRequirement(input = {}) {
  const base = createEmptyRequirement({
    title: input.title,
    scenarioId: input.provenance && input.provenance.scenarioId,
    promptVersion: input.provenance && input.provenance.promptVersion,
  });
  const requirement = {
    ...base,
    schemaVersion: REQUIREMENT_SCHEMA_VERSION,
    revision: Number.isInteger(input.revision) && input.revision >= 0 ? input.revision : 0,
    title: cleanText(input.title || base.title, 160),
    businessContext: { summary: cleanText(input.businessContext && input.businessContext.summary) },
    objective: { summary: cleanText(input.objective && input.objective.summary) },
    propertyTypes: cleanList(input.propertyTypes, 3).filter((item) => PROPERTY_CONTEXTS.includes(item)),
    activities: cleanList(input.activities),
    locationLogic: {
      summary: cleanText(input.locationLogic && input.locationLogic.summary),
      locations: cleanList(input.locationLogic && input.locationLogic.locations),
      rationale: cleanList(input.locationLogic && input.locationLogic.rationale),
      marketAnchor: {
        geographyId: cleanText(input.locationLogic && input.locationLogic.marketAnchor && input.locationLogic.marketAnchor.geographyId, 120),
        marketId: cleanText(input.locationLogic && input.locationLogic.marketAnchor && input.locationLogic.marketAnchor.marketId, 120),
        displayName: cleanText(input.locationLogic && input.locationLogic.marketAnchor && input.locationLogic.marketAnchor.displayName, 240),
        marketName: cleanText(input.locationLogic && input.locationLogic.marketAnchor && input.locationLogic.marketAnchor.marketName, 160),
        city: cleanText(input.locationLogic && input.locationLogic.marketAnchor && input.locationLogic.marketAnchor.city, 160),
        state: cleanText(input.locationLogic && input.locationLogic.marketAnchor && input.locationLogic.marketAnchor.state, 40),
        source: cleanText(input.locationLogic && input.locationLogic.marketAnchor && input.locationLogic.marketAnchor.source, 40),
      },
      specificPreference: {
        hasPreference: typeof (input.locationLogic && input.locationLogic.specificPreference && input.locationLogic.specificPreference.hasPreference) === "boolean" ? input.locationLogic.specificPreference.hasPreference : null,
        displayName: cleanText(input.locationLogic && input.locationLogic.specificPreference && input.locationLogic.specificPreference.displayName, 240),
        geographyId: cleanText(input.locationLogic && input.locationLogic.specificPreference && input.locationLogic.specificPreference.geographyId, 120),
        rationale: cleanText(input.locationLogic && input.locationLogic.specificPreference && input.locationLogic.specificPreference.rationale, 600),
        source: cleanText(input.locationLogic && input.locationLogic.specificPreference && input.locationLogic.specificPreference.source, 40),
        candidateDistrictIds: cleanList(input.locationLogic && input.locationLogic.specificPreference && input.locationLogic.specificPreference.candidateDistrictIds, 30),
        candidateDistrictNames: cleanList(input.locationLogic && input.locationLogic.specificPreference && input.locationLogic.specificPreference.candidateDistrictNames, 30),
        informalText: cleanText(input.locationLogic && input.locationLogic.specificPreference && input.locationLogic.specificPreference.informalText, 500),
      },
    },
    sizeCapacity: { summary: cleanText(input.sizeCapacity && input.sizeCapacity.summary) },
    economics: { summary: cleanText(input.economics && input.economics.summary) },
    timing: { summary: cleanText(input.timing && input.timing.summary) },
    growth: { summary: cleanText(input.growth && input.growth.summary) },
    criteria: Array.isArray(input.criteria) ? input.criteria.slice(0, 80) : [],
    provenance: {
      ...base.provenance,
      createdAt: cleanText(input.provenance && input.provenance.createdAt, 60) || base.provenance.createdAt,
      updatedAt: cleanText(input.provenance && input.provenance.updatedAt, 60) || base.provenance.updatedAt,
      scenarioId: cleanText(input.provenance && input.provenance.scenarioId, 80),
      promptVersion: cleanText(input.provenance && input.provenance.promptVersion, 80),
      dimensionRegistryVersion: DIMENSION_REGISTRY_VERSION,
    },
  };
  requirement.criteria = requirement.criteria
    .map((criterion) => normalizeCriterion(criterion).criterion)
    .filter(Boolean);
  requirement.readiness = evaluateReadiness(requirement, []);
  return requirement;
}

export function normalizeCriterion(input = {}, options = {}) {
  const errors = [];
  const registryEntry = DIMENSIONS_BY_ID[cleanText(input.dimension, 120)];
  if (!registryEntry) errors.push(`Unknown dimension: ${cleanText(input.dimension, 120) || "(missing)"}`);
  const status = cleanText(input.status, 20).toUpperCase();
  if (!ALLOWED_STATUSES.includes(status)) errors.push(`Invalid status: ${status || "(missing)"}`);
  const scope = cleanText(input.scope || (registryEntry && registryEntry.scope), 30);
  if (!ALLOWED_SCOPES.includes(scope)) errors.push(`Invalid scope: ${scope || "(missing)"}`);
  const source = cleanText(input.source, 30);
  if (!ALLOWED_SOURCES.includes(source)) errors.push(`Invalid source: ${source || "(missing)"}`);
  let authority = cleanText(input.authority || (registryEntry && registryEntry.externalAuthority ? "external_property" : "business"), 30);
  if (!ALLOWED_AUTHORITIES.includes(authority)) errors.push(`Invalid authority: ${authority || "(missing)"}`);
  if (registryEntry && registryEntry.externalAuthority) {
    authority = "external_property";
    if (status !== "UNKNOWN" && status !== "VERIFY") errors.push(`${registryEntry.id} must remain UNKNOWN or VERIFY until externally established.`);
  }
  const confidence = Number(input.confidence);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) errors.push("Confidence must be between 0 and 1.");
  const value = normalizeValue(input.value);
  if (!valueHasContent(value) && status !== "UNKNOWN" && status !== "VERIFY") errors.push("Criterion value is required unless status is UNKNOWN or VERIFY.");
  const id = cleanText(input.id || stableCriterionId(input.dimension), 120);
  const requiresConfirmation = Boolean(input.requiresConfirmation || (registryEntry && registryEntry.consequential && source === "ai_inference"));
  const confirmed = source === "user_statement" || source === "user_correction" ? true : Boolean(input.confirmed);
  if (options.rejectUnconfirmed && requiresConfirmation && !confirmed) errors.push("Consequential inference requires user confirmation.");
  return {
    errors,
    criterion: errors.length ? null : {
      id,
      dimension: registryEntry.id,
      label: registryEntry.label,
      value,
      status,
      scope,
      source,
      confidence,
      rationale: cleanText(input.rationale, 600),
      authority,
      requiresConfirmation,
      confirmed,
    },
  };
}

function normalizeValue(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      text: cleanText(value.text, 500),
      number: Number.isFinite(Number(value.number)) ? Number(value.number) : null,
      boolean: typeof value.boolean === "boolean" ? value.boolean : null,
      list: cleanList(value.list),
    };
  }
  return { text: cleanText(value, 500), number: null, boolean: null, list: [] };
}

function valueHasContent(value) {
  return Boolean(value.text || value.number !== null || value.boolean !== null || value.list.length);
}

export function stableCriterionId(dimensionId) {
  return `criterion_${cleanText(dimensionId, 100).replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase()}`;
}

const SUMMARY_TARGETS = Object.freeze({
  title: { type: "text" },
  "businessContext.summary": { type: "text" },
  "objective.summary": { type: "text" },
  propertyTypes: { type: "list" },
  activities: { type: "list" },
  "locationLogic.summary": { type: "text" },
  "locationLogic.locations": { type: "list" },
  "locationLogic.rationale": { type: "list" },
  "locationLogic.marketAnchor.geographyId": { type: "text" },
  "locationLogic.marketAnchor.marketId": { type: "text" },
  "locationLogic.marketAnchor.displayName": { type: "text" },
  "locationLogic.marketAnchor.marketName": { type: "text" },
  "locationLogic.marketAnchor.city": { type: "text" },
  "locationLogic.marketAnchor.state": { type: "text" },
  "locationLogic.marketAnchor.source": { type: "text" },
  "locationLogic.specificPreference.hasPreference": { type: "boolean" },
  "locationLogic.specificPreference.displayName": { type: "text" },
  "locationLogic.specificPreference.geographyId": { type: "text" },
  "locationLogic.specificPreference.rationale": { type: "text" },
  "locationLogic.specificPreference.source": { type: "text" },
  "locationLogic.specificPreference.candidateDistrictIds": { type: "list" },
  "locationLogic.specificPreference.candidateDistrictNames": { type: "list" },
  "locationLogic.specificPreference.informalText": { type: "text" },
  "sizeCapacity.summary": { type: "text" },
  "economics.summary": { type: "text" },
  "timing.summary": { type: "text" },
  "growth.summary": { type: "text" },
});

export function validateModelTurn(turn = {}) {
  const errors = [];
  if (!turn || typeof turn !== "object" || Array.isArray(turn)) return { valid: false, errors: ["Model turn must be an object."], turn: null };
  const recommendedAction = cleanText(turn.recommendedAction, 20).toUpperCase();
  if (!['ASK', 'READY', 'CLARIFY'].includes(recommendedAction)) errors.push("Invalid recommendedAction.");
  const operations = Array.isArray(turn.proposedOperations) ? turn.proposedOperations.slice(0, 30) : [];
  const normalizedOperations = operations.map((operation, index) => normalizeOperation(operation, index, errors)).filter(Boolean);
  const nextQuestion = turn.nextQuestion && typeof turn.nextQuestion === "object" ? {
    dimension: cleanText(turn.nextQuestion.dimension, 120),
    reasonCategory: cleanText(turn.nextQuestion.reasonCategory, 40),
    question: cleanText(turn.nextQuestion.question, 500),
    quickChoices: cleanList(turn.nextQuestion.quickChoices, 6),
    whyItMatters: cleanText(turn.nextQuestion.whyItMatters, 500),
  } : { dimension: "", reasonCategory: "", question: "", quickChoices: [], whyItMatters: "" };
  if (recommendedAction !== "READY") {
    if (!nextQuestion.question) errors.push("ASK or CLARIFY requires a next question.");
    if (nextQuestion.dimension && !DIMENSIONS_BY_ID[nextQuestion.dimension]) errors.push(`Unknown next-question dimension: ${nextQuestion.dimension}`);
  }
  return {
    valid: errors.length === 0,
    errors,
    turn: errors.length ? null : {
      assistantMessage: cleanText(turn.assistantMessage, 1000),
      proposedOperations: normalizedOperations,
      possibleInferences: cleanList(turn.possibleInferences, 10),
      contradictions: cleanList(turn.contradictions, 10),
      nextQuestion,
      recommendedAction,
    },
  };
}

function normalizeOperation(operation, index, errors) {
  if (!operation || typeof operation !== "object") {
    errors.push(`Operation ${index + 1} is invalid.`);
    return null;
  }
  const type = cleanText(operation.type, 30).toUpperCase();
  if (!["SET_FIELD", "UPSERT_CRITERION", "REMOVE_CRITERION"].includes(type)) {
    errors.push(`Operation ${index + 1} has an invalid type.`);
    return null;
  }
  const normalized = {
    operationId: cleanText(operation.operationId || `op_${index + 1}`, 100),
    type,
    target: cleanText(operation.target, 120),
    value: normalizeValue(operation.value),
    status: cleanText(operation.status, 20).toUpperCase(),
    scope: cleanText(operation.scope, 30),
    source: cleanText(operation.source, 30),
    confidence: Number(operation.confidence),
    rationale: cleanText(operation.rationale, 600),
    authority: cleanText(operation.authority, 30),
    requiresConfirmation: Boolean(operation.requiresConfirmation),
  };
  if (type === "SET_FIELD" && !SUMMARY_TARGETS[normalized.target]) errors.push(`Unknown summary target: ${normalized.target}`);
  if (type === "UPSERT_CRITERION") {
    const result = normalizeCriterion({
      id: stableCriterionId(normalized.target),
      dimension: normalized.target,
      value: normalized.value,
      status: normalized.status,
      scope: normalized.scope,
      source: normalized.source,
      confidence: normalized.confidence,
      rationale: normalized.rationale,
      authority: normalized.authority,
      requiresConfirmation: normalized.requiresConfirmation,
      confirmed: false,
    });
    if (result.errors.length) errors.push(...result.errors.map((error) => `Operation ${index + 1}: ${error}`));
  }
  if (type === "REMOVE_CRITERION" && !normalized.target.startsWith("criterion_")) errors.push(`Operation ${index + 1} must target a criterion id.`);
  return normalized;
}

export function applyModelTurn(requirementInput, validatedTurn) {
  const requirement = normalizeRequirement(requirementInput);
  const acceptedOperations = [];
  const rejectedOperations = [];
  const pendingInferences = [];
  for (const operation of validatedTurn.proposedOperations || []) {
    if (operation.type === "SET_FIELD") {
      if (operation.requiresConfirmation && operation.source === "ai_inference") {
        pendingInferences.push(operation);
        continue;
      }
      applySummaryField(requirement, operation);
      acceptedOperations.push(operation);
      continue;
    }
    if (operation.type === "REMOVE_CRITERION") {
      requirement.criteria = requirement.criteria.filter((criterion) => criterion.id !== operation.target);
      acceptedOperations.push(operation);
      continue;
    }
    const existing = requirement.criteria.find((criterion) => criterion.dimension === operation.target);
    if (existing && existing.status === "PREFERRED" && operation.status === "REQUIRED" && operation.source === "ai_inference") {
      rejectedOperations.push({ ...operation, rejectionReason: "AI cannot silently promote Preferred to Required." });
      continue;
    }
    const registryEntry = DIMENSIONS_BY_ID[operation.target];
    const needsConfirmation = Boolean(operation.requiresConfirmation || (registryEntry.consequential && operation.source === "ai_inference"));
    if (needsConfirmation) {
      pendingInferences.push(operation);
      continue;
    }
    const normalized = normalizeCriterion({
      id: stableCriterionId(operation.target),
      dimension: operation.target,
      value: operation.value,
      status: operation.status,
      scope: operation.scope,
      source: operation.source,
      confidence: operation.confidence,
      rationale: operation.rationale,
      authority: operation.authority,
      requiresConfirmation: false,
      confirmed: operation.source !== "ai_inference",
    });
    if (normalized.errors.length) {
      rejectedOperations.push({ ...operation, rejectionReason: normalized.errors.join(" ") });
      continue;
    }
    upsertCriterion(requirement, normalized.criterion);
    acceptedOperations.push(operation);
  }
  requirement.revision += acceptedOperations.length ? 1 : 0;
  requirement.provenance.updatedAt = new Date().toISOString();
  requirement.readiness = evaluateReadiness(requirement, validatedTurn.contradictions || []);
  return { requirement, acceptedOperations, rejectedOperations, pendingInferences };
}

function applySummaryField(requirement, operation) {
  const config = SUMMARY_TARGETS[operation.target];
  if (!config) return;
  let value = config.type === "list" ? operation.value.list : config.type === "boolean" ? operation.value.boolean : operation.value.text;
  if (operation.target === "propertyTypes") value = value.filter((item) => PROPERTY_CONTEXTS.includes(item));
  const parts = operation.target.split(".");
  let current = requirement;
  parts.slice(0, -1).forEach((part) => { current = current[part]; });
  current[parts.at(-1)] = value;
}

function upsertCriterion(requirement, criterion) {
  const index = requirement.criteria.findIndex((item) => item.id === criterion.id || item.dimension === criterion.dimension);
  if (index >= 0) requirement.criteria[index] = criterion;
  else requirement.criteria.push(criterion);
}

export function resolvePendingInference(requirementInput, operation, decision) {
  const requirement = normalizeRequirement(requirementInput);
  if (decision !== "accept") return { requirement, accepted: false, rejected: true, errors: [] };
  if (operation.type === "SET_FIELD") {
    applySummaryField(requirement, operation);
    requirement.revision += 1;
    requirement.provenance.updatedAt = new Date().toISOString();
    requirement.readiness = evaluateReadiness(requirement, []);
    return { requirement, accepted: true, rejected: false, errors: [] };
  }
  const normalized = normalizeCriterion({
    id: stableCriterionId(operation.target),
    dimension: operation.target,
    value: operation.value,
    status: operation.status,
    scope: operation.scope,
    source: "user_correction",
    confidence: 1,
    rationale: operation.rationale,
    authority: operation.authority,
    requiresConfirmation: true,
    confirmed: true,
  });
  if (normalized.errors.length) return { requirement, accepted: false, rejected: false, errors: normalized.errors };
  upsertCriterion(requirement, normalized.criterion);
  requirement.revision += 1;
  requirement.provenance.updatedAt = new Date().toISOString();
  requirement.readiness = evaluateReadiness(requirement, []);
  return { requirement, accepted: true, rejected: false, errors: [] };
}

export function updateCriterion(requirementInput, criterionInput) {
  const requirement = normalizeRequirement(requirementInput);
  const normalized = normalizeCriterion({ ...criterionInput, source: "user_correction", confidence: 1, confirmed: true });
  if (normalized.errors.length) return { requirement, errors: normalized.errors };
  upsertCriterion(requirement, normalized.criterion);
  requirement.revision += 1;
  requirement.provenance.updatedAt = new Date().toISOString();
  requirement.readiness = evaluateReadiness(requirement, []);
  return { requirement, errors: [] };
}

export function removeCriterion(requirementInput, criterionId) {
  const requirement = normalizeRequirement(requirementInput);
  const before = requirement.criteria.length;
  requirement.criteria = requirement.criteria.filter((criterion) => criterion.id !== cleanText(criterionId, 120));
  if (requirement.criteria.length !== before) requirement.revision += 1;
  requirement.provenance.updatedAt = new Date().toISOString();
  requirement.readiness = evaluateReadiness(requirement, []);
  return requirement;
}

function hasCriterion(requirement, ids, statuses = ALLOWED_STATUSES) {
  return requirement.criteria.some((criterion) => ids.includes(criterion.dimension) && statuses.includes(criterion.status));
}

export function evaluateReadiness(requirementInput, contradictions = []) {
  const requirement = requirementInput && requirementInput.schemaVersion === REQUIREMENT_SCHEMA_VERSION ? requirementInput : normalizeRequirement(requirementInput);
  const types = requirement.propertyTypes;
  const locationBlockers = [];
  const propertyBlockers = [];
  const locationEvidence = [];
  const propertyEvidence = [];
  if (!requirement.objective.summary) locationBlockers.push("Business objective is not yet clear."); else locationEvidence.push("Business objective understood.");
  if (!types.length) locationBlockers.push("Property or operating pattern is not yet classified."); else locationEvidence.push(`Property pattern: ${types.join(", ")}.`);
  const hasLocation = Boolean(requirement.locationLogic.marketAnchor.displayName || requirement.locationLogic.summary || requirement.locationLogic.locations.length || hasCriterion(requirement, ["universal.location.anchor", "universal.location.business_logic", "universal.location.employee_origins", "universal.location.customer_origins", "office.location.employee_geography", "retail.location.customer_logic", "industrial.location.employee_service_geography"]));
  if (!hasLocation) locationBlockers.push("No location anchor or meaningful location driver yet."); else locationEvidence.push("Location logic captured.");
  const activityIds = ["universal.business.operating_pattern", "office.workplace.purpose", "retail.customer.interaction", "retail.operations.repair_storage", "industrial.operations.primary_activity", "industrial.operations.repair_production"];
  if (!requirement.activities.length && !hasCriterion(requirement, activityIds)) locationBlockers.push("Important geography-affecting activities are not yet understood."); else locationEvidence.push("Operating activities captured.");
  const officeScopeExplicitlyKept = types.length === 1 && types.includes("office") && requirement.criteria.some((item) => item.dimension === "universal.property.context_ambiguity" && item.status !== "UNKNOWN" && /keep stated property context/i.test(item.value.text));
  const ordinaryOfficeLocation = types.length === 1 && types.includes("office") && (officeScopeExplicitlyKept || !requirement.activities.some((id) => ["display_present", "treat_care", "make_assemble", "repair_service", "store", "receive", "ship_distribute", "dispatch", "operate_vehicles", "research_test", "prepare_produce_food", "teach_train_events", "outdoor_operations"].includes(id)));
  const ordinaryMedicalLocation = types.length === 1 && types.includes("medical");
  const scaleIds = ["universal.capacity.size", "office.occupancy.peak_attendance"];
  if (!ordinaryOfficeLocation && !ordinaryMedicalLocation && !requirement.sizeCapacity.summary && !hasCriterion(requirement, scaleIds)) locationBlockers.push("Scale context is not yet sufficient.");
  else if (requirement.sizeCapacity.summary || hasCriterion(requirement, scaleIds)) locationEvidence.push("Known scale context preserved.");
  else if (ordinaryOfficeLocation) locationEvidence.push("Ordinary Office scale deferred to Property Requirement.");
  else if (ordinaryMedicalLocation) locationEvidence.push("Medical size and buildout detail deferred to Property Requirement.");
  if (contradictions.length) locationBlockers.push("A blocking contradiction needs clarification.");

  if (!requirement.sizeCapacity.summary && !hasCriterion(requirement, ["universal.capacity.size", "office.occupancy.peak_attendance"])) propertyBlockers.push("Workable size or capacity is not yet understood."); else propertyEvidence.push("Size/capacity is workable.");
  if (!hasCriterion(requirement, ["universal.transaction.intent"])) propertyBlockers.push("Purchase or lease intent is not yet known or explicitly flexible."); else propertyEvidence.push("Transaction intent captured.");
  if (!requirement.activities.length && !hasCriterion(requirement, activityIds)) propertyBlockers.push("Material operating activities are not captured."); else propertyEvidence.push("Material activities captured.");
  const disqualifierByType = {
    office: ["office.access.transit", "office.access.parking", "office.environment.image", "office.workplace.meetings_collaboration"],
    retail_service: ["retail.access.parking", "retail.operations.delivery_receiving", "universal.diligence.permitted_use"],
    industrial_flex: ["industrial.site.fleet_storage", "industrial.site.yard_outdoor_storage", "industrial.loading.grade_level", "industrial.access.truck_circulation", "industrial.power.three_phase", "universal.diligence.permitted_use"],
    medical: ["medical.access.patient", "medical.diligence.buildout", "universal.diligence.permitted_use"],
    life_science_rd: ["research.operations.intensity", "research.diligence.infrastructure", "universal.diligence.permitted_use"],
    special_purpose: ["special.events.peak", "special.outdoor.operations", "special.diligence.occupancy", "universal.diligence.permitted_use"],
    mixed: ["universal.operations.technical_screen", "universal.diligence.permitted_use"],
    unknown: ["universal.operations.technical_screen", "universal.diligence.permitted_use"],
  };
  const relevantDisqualifiers = types.flatMap((type) => disqualifierByType[type] || []);
  if (relevantDisqualifiers.length && !hasCriterion(requirement, relevantDisqualifiers)) propertyBlockers.push("Property-disqualifying criteria need more definition."); else if (relevantDisqualifiers.length) propertyEvidence.push("Property-disqualifying criteria captured.");
  if (!requirement.timing.summary && !hasCriterion(requirement, ["universal.timing.target", "universal.timing.current_lease"])) propertyBlockers.push("Timing is not sufficient for a property search."); else propertyEvidence.push("Timing captured.");
  if (!requirement.growth.summary && !hasCriterion(requirement, ["universal.growth.future_state", "office.flexibility.growth", "retail.flexibility.expansion"])) propertyBlockers.push("Growth or future-state implications are not understood."); else propertyEvidence.push("Growth implications captured.");

  const readyForLocation = locationBlockers.length === 0;
  const readyForPropertySearch = readyForLocation && propertyBlockers.length === 0;
  return {
    readyForLocation: { ready: readyForLocation, blockers: locationBlockers, evidence: locationEvidence },
    readyForPropertySearch: { ready: readyForPropertySearch, blockers: propertyBlockers, evidence: propertyEvidence },
    readyForMarketResponse: { ready: false, blockers: ["Outside the v1 prototype"], evidence: [] },
    nextAction: readyForPropertySearch ? "READY" : "ASK",
  };
}

export function shouldStop(requirementInput, modelAction, contradictions = []) {
  const readiness = evaluateReadiness(requirementInput, contradictions);
  return Boolean(readiness.readyForPropertySearch.ready && modelAction === "READY" && contradictions.length === 0);
}
