import {
  DIMENSION_REGISTRY,
  DIMENSION_REGISTRY_VERSION,
  applyModelTurn,
  createEmptyRequirement,
  normalizeRequirement,
  removeCriterion,
  resolvePendingInference,
  shouldStop,
  updateCriterion,
  validateModelTurn,
} from "../../../../lib/requirements/requirement-domain-v1.mjs";
import {
  REQUIREMENT_INTERVIEW_PROMPT,
  REQUIREMENT_PROMPT_VERSION,
} from "../../../../lib/requirements/requirement-interview-prompt-v1.mjs";
import { createRequirementModelClient } from "./_model-client.mjs";

const MAX_BODY_BYTES = 120000;
const PROTOTYPE_ROUTE = "/prototype/requirement-v1/";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, private",
      "x-robots-tag": "noindex, nofollow",
      "x-content-type-options": "nosniff",
    },
  });
}

function clean(value, max = 1000) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function isPrototypeEnabled(env) {
  return String(env && env.REQUIREMENT_PROTOTYPE_ENABLED || "true").toLowerCase() !== "false";
}

function isAllowedBrowserRequest(request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  if (!origin || !referer) return false;
  try {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(origin);
    const refererUrl = new URL(referer);
    return originUrl.origin === requestUrl.origin
      && refererUrl.origin === requestUrl.origin
      && refererUrl.pathname === PROTOTYPE_ROUTE;
  } catch (error) {
    return false;
  }
}

async function readJsonBody(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) throw Object.assign(new Error("Request is too large."), { status: 413 });
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw Object.assign(new Error("Request is too large."), { status: 413 });
  try {
    return JSON.parse(text || "{}");
  } catch (error) {
    throw Object.assign(new Error("Invalid JSON."), { status: 400 });
  }
}

function compactConversation(value) {
  return (Array.isArray(value) ? value : [])
    .slice(-20)
    .map((message) => ({
      role: message && message.role === "assistant" ? "assistant" : "user",
      content: clean(message && message.content, 1200),
    }))
    .filter((message) => message.content);
}

function modelInput({ requirement, conversation, userMessage, askedDimensions, scenarioId }) {
  return JSON.stringify({
    task: "Process the latest user statement, propose structured updates, and ask at most one next high-value question.",
    scenarioId: clean(scenarioId, 80),
    currentRequirement: requirement,
    recentConversation: conversation,
    latestUserMessage: clean(userMessage, 4000),
    dimensionsAlreadyAsked: (Array.isArray(askedDimensions) ? askedDimensions : []).map((item) => clean(item, 120)).filter(Boolean).slice(-40),
    allowedDimensions: DIMENSION_REGISTRY,
  });
}

function configurationPayload(client) {
  return {
    ok: true,
    configured: client.configured,
    model: client.model,
    promptVersion: REQUIREMENT_PROMPT_VERSION,
    dimensionRegistryVersion: DIMENSION_REGISTRY_VERSION,
    persistence: "none",
  };
}

export async function onRequestGet({ env }) {
  if (!isPrototypeEnabled(env)) return jsonResponse({ ok: false, error: "Prototype is disabled." }, 404);
  return jsonResponse(configurationPayload(createRequirementModelClient(env)));
}

export async function onRequestPost({ request, env }) {
  if (!isPrototypeEnabled(env)) return jsonResponse({ ok: false, error: "Prototype is disabled." }, 404);
  if (!isAllowedBrowserRequest(request)) return jsonResponse({ ok: false, error: "Private prototype request rejected." }, 403);
  let body;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message }, error.status || 400);
  }
  const action = clean(body.action || "turn", 40);
  const requirement = normalizeRequirement(body.requirement || createEmptyRequirement({
    scenarioId: body.scenarioId,
    promptVersion: REQUIREMENT_PROMPT_VERSION,
  }));

  if (action === "resolve_inference") {
    const result = resolvePendingInference(requirement, body.operation || {}, body.decision === "accept" ? "accept" : "reject");
    return jsonResponse({ ok: result.errors.length === 0, ...result, readiness: result.requirement.readiness });
  }
  if (action === "update_criterion") {
    const result = updateCriterion(requirement, body.criterion || {});
    return jsonResponse({ ok: result.errors.length === 0, ...result }, result.errors.length ? 400 : 200);
  }
  if (action === "remove_criterion") {
    const updated = removeCriterion(requirement, body.criterionId);
    return jsonResponse({ ok: true, requirement: updated, readiness: updated.readiness });
  }
  if (action !== "turn") return jsonResponse({ ok: false, error: "Unsupported prototype action." }, 400);

  const userMessage = clean(body.userMessage, 4000);
  if (!userMessage) return jsonResponse({ ok: false, error: "A user message is required." }, 400);
  const client = createRequirementModelClient(env);
  if (!client.configured) {
    return jsonResponse({
      ok: false,
      code: "missing_api_key",
      error: "OPENAI_API_KEY is not configured for this private prototype.",
      configuration: configurationPayload(client),
      requirement,
    }, 503);
  }

  const startedAt = Date.now();
  const input = modelInput({
    requirement,
    conversation: compactConversation(body.conversation),
    userMessage,
    askedDimensions: body.askedDimensions,
    scenarioId: body.scenarioId,
  });
  let modelResponse;
  let validation;
  let repairAttempted = false;
  try {
    modelResponse = await client.createTurn({ instructions: REQUIREMENT_INTERVIEW_PROMPT, input });
    validation = validateModelTurn(modelResponse.result);
    if (!validation.valid) {
      repairAttempted = true;
      modelResponse = await client.createTurn({
        instructions: REQUIREMENT_INTERVIEW_PROMPT,
        input,
        repairInstruction: `The previous result failed deterministic validation: ${validation.errors.join(" ")} Return a corrected result using only allowed dimensions and states.`,
      });
      validation = validateModelTurn(modelResponse.result);
    }
  } catch (error) {
    console.warn(JSON.stringify({
      event: "requirement_prototype_provider_error",
      promptVersion: REQUIREMENT_PROMPT_VERSION,
      model: client.model,
      scenario: clean(body.scenarioId, 80),
      code: error.code || "provider_error",
      latencyMs: Date.now() - startedAt,
    }));
    return jsonResponse({
      ok: false,
      code: error.code || "provider_error",
      error: error.message || "The model request failed.",
      requirement,
    }, error.code === "missing_api_key" ? 503 : 502);
  }

  if (!validation.valid) {
    console.warn(JSON.stringify({
      event: "requirement_prototype_validation_failed",
      promptVersion: REQUIREMENT_PROMPT_VERSION,
      model: client.model,
      scenario: clean(body.scenarioId, 80),
      validationErrorCount: validation.errors.length,
      latencyMs: Date.now() - startedAt,
    }));
    return jsonResponse({
      ok: false,
      code: "model_validation_failed",
      error: "The model response could not be validated after one repair attempt. Your Requirement was not changed.",
      validationErrors: validation.errors,
      requirement,
    }, 422);
  }

  const merged = applyModelTurn(requirement, validation.turn);
  const stop = shouldStop(merged.requirement, validation.turn.recommendedAction, validation.turn.contradictions);
  const latencyMs = Date.now() - startedAt;
  const metadata = {
    ...modelResponse.metadata,
    promptVersion: REQUIREMENT_PROMPT_VERSION,
    dimensionRegistryVersion: DIMENSION_REGISTRY_VERSION,
    latencyMs,
    repairAttempted,
    stopped: stop,
  };
  console.log(JSON.stringify({
    event: "requirement_prototype_turn",
    promptVersion: REQUIREMENT_PROMPT_VERSION,
    model: metadata.model,
    scenario: clean(body.scenarioId, 80),
    latencyMs,
    validation: "passed",
    repairAttempted,
    inputTokens: metadata.usage && metadata.usage.input_tokens || null,
    outputTokens: metadata.usage && metadata.usage.output_tokens || null,
  }));
  return jsonResponse({
    ok: true,
    assistantMessage: validation.turn.assistantMessage,
    nextQuestion: stop ? null : validation.turn.nextQuestion,
    recommendedAction: stop ? "READY" : validation.turn.recommendedAction,
    contradictions: validation.turn.contradictions,
    possibleInferences: validation.turn.possibleInferences,
    requirement: merged.requirement,
    acceptedOperations: merged.acceptedOperations,
    rejectedOperations: merged.rejectedOperations,
    pendingInferences: merged.pendingInferences,
    readiness: merged.requirement.readiness,
    metadata,
    modelTurn: validation.turn,
  });
}

export const __test = {
  isPrototypeEnabled,
  isAllowedBrowserRequest,
  compactConversation,
  modelInput,
};
