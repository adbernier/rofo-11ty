import { OPENAI_TURN_SCHEMA_V1 } from "../../../../lib/requirements/openai-turn-schema-v1.mjs";

export const DEFAULT_REQUIREMENT_MODEL = "gpt-5.6-luna";

function extractOutputText(response) {
  if (typeof response.output_text === "string" && response.output_text.trim()) return response.output_text;
  for (const item of Array.isArray(response.output) ? response.output : []) {
    if (item && item.type === "message") {
      for (const content of Array.isArray(item.content) ? item.content : []) {
        if (content && content.type === "output_text" && typeof content.text === "string") return content.text;
      }
    }
  }
  return "";
}

function parseOpenAIError(payload, status) {
  const message = payload && payload.error && payload.error.message;
  return message ? `OpenAI request failed (${status}): ${message}` : `OpenAI request failed (${status}).`;
}

export function createRequirementModelClient(env, fetchImpl = fetch) {
  const apiKey = String(env && env.OPENAI_API_KEY || "").trim();
  const model = String(env && env.OPENAI_REQUIREMENT_MODEL || DEFAULT_REQUIREMENT_MODEL).trim();
  return {
    configured: Boolean(apiKey),
    model,
    async createTurn({ instructions, input, repairInstruction = "" }) {
      if (!apiKey) {
        const error = new Error("OPENAI_API_KEY is not configured for the private Requirement prototype.");
        error.code = "missing_api_key";
        throw error;
      }
      const response = await fetchImpl("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          instructions: repairInstruction ? `${instructions}\n\nREPAIR INSTRUCTION:\n${repairInstruction}` : instructions,
          input,
          text: {
            format: {
              type: "json_schema",
              name: "rofo_requirement_turn_v1",
              description: "One validated turn of the Rofo Requirement interview.",
              strict: true,
              schema: OPENAI_TURN_SCHEMA_V1,
            },
          },
        }),
      });
      let payload = {};
      try {
        payload = await response.json();
      } catch (error) {
        const malformed = new Error(`OpenAI returned a non-JSON response (${response.status}).`);
        malformed.code = "provider_response_invalid";
        throw malformed;
      }
      if (!response.ok) {
        const providerError = new Error(parseOpenAIError(payload, response.status));
        providerError.code = "provider_error";
        providerError.status = response.status;
        throw providerError;
      }
      const outputText = extractOutputText(payload);
      if (!outputText) {
        const empty = new Error("OpenAI returned no structured turn output.");
        empty.code = "provider_response_invalid";
        throw empty;
      }
      let result;
      try {
        result = JSON.parse(outputText);
      } catch (error) {
        const invalid = new Error("OpenAI returned structured output that could not be parsed.");
        invalid.code = "provider_response_invalid";
        invalid.outputText = outputText.slice(0, 1000);
        throw invalid;
      }
      return {
        result,
        metadata: {
          model: payload.model || model,
          responseId: payload.id || "",
          usage: payload.usage || null,
        },
      };
    },
  };
}

