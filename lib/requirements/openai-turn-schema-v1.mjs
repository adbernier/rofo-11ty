const valueSchema = {
  type: "object",
  additionalProperties: false,
  required: ["text", "number", "boolean", "list"],
  properties: {
    text: { type: "string" },
    number: { anyOf: [{ type: "number" }, { type: "null" }] },
    boolean: { anyOf: [{ type: "boolean" }, { type: "null" }] },
    list: { type: "array", items: { type: "string" } },
  },
};

export const OPENAI_TURN_SCHEMA_V1 = {
  type: "object",
  additionalProperties: false,
  required: ["assistantMessage", "proposedOperations", "possibleInferences", "contradictions", "nextQuestion", "recommendedAction"],
  properties: {
    assistantMessage: { type: "string" },
    proposedOperations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["operationId", "type", "target", "value", "status", "scope", "source", "confidence", "rationale", "authority", "requiresConfirmation"],
        properties: {
          operationId: { type: "string" },
          type: { type: "string", enum: ["SET_FIELD", "UPSERT_CRITERION", "REMOVE_CRITERION"] },
          target: { type: "string" },
          value: valueSchema,
          status: { type: "string", enum: ["", "REQUIRED", "PREFERRED", "FLEXIBLE", "UNKNOWN", "VERIFY"] },
          scope: { type: "string", enum: ["", "business", "location", "property", "economics", "timing", "diligence"] },
          source: { type: "string", enum: ["user_statement", "ai_inference"] },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          rationale: { type: "string" },
          authority: { type: "string", enum: ["business", "rofo", "external_property", "professional"] },
          requiresConfirmation: { type: "boolean" },
        },
      },
    },
    possibleInferences: { type: "array", items: { type: "string" } },
    contradictions: { type: "array", items: { type: "string" } },
    nextQuestion: {
      type: "object",
      additionalProperties: false,
      required: ["dimension", "reasonCategory", "question", "quickChoices", "whyItMatters"],
      properties: {
        dimension: { type: "string" },
        reasonCategory: { type: "string", enum: ["", "location", "property_fit", "economics", "timing", "diligence", "clarification"] },
        question: { type: "string" },
        quickChoices: { type: "array", items: { type: "string" }, maxItems: 6 },
        whyItMatters: { type: "string" },
      },
    },
    recommendedAction: { type: "string", enum: ["ASK", "READY", "CLARIFY"] },
  },
};

