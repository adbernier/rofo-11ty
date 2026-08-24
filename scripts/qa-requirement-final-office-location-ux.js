const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const accessFoundation = require("../_data/sfAccessFoundationV0");
const compositionFoundation = require("../_data/sfOfficeCompositionFoundation");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel");
const districtGeography = require("../_data/requirementPrototypeDistrictGeography");
const composer = require("../lib/recommendations/private-location-composition");

(async function run() {
  const engine = await import(path.resolve("lib/requirements/requirement-interview-v1.mjs"));

  const expectedLabels = {
    design_creative: "Architecture, Design & Creative Services",
    professional_services: "Financial & Professional Services",
    technology: "Technology & Product Companies",
    life_science: "Life Sciences & Research",
    nonprofit: "Nonprofit & Mission-Driven Organizations",
  };
  assert.deepEqual(Object.fromEntries(engine.BUSINESS_IDENTITY_TAXONOMY.map((item) => [item.id, item.label])), expectedLabels);
  assert.equal(engine.QUESTIONS_BY_ID["business.identity"].prompt, "Which category most closely describes your business?");
  assert.equal(engine.QUESTIONS_BY_ID["office.environment_confirmation"].prompt, "What kind of neighborhood and office setting would you prefer?");
  assert.deepEqual(engine.QUESTIONS_BY_ID["office.environment_confirmation"].options.map((item) => item.label), ["Established and professional", "Creative and distinctive", "Modern and energetic", "No strong preference"]);

  const answers = {
    "location.anchor": { text: "San Francisco, CA", market: { geographyId: "san-francisco", marketId: "san-francisco", marketName: "San Francisco", city: "San Francisco", state: "CA", displayName: "San Francisco, CA" } },
    "foundation.property_context": { optionId: "office" },
    "location.district_candidates": { noPreference: true, districtIds: [], otherText: "" },
    "foundation.objective": { optionId: "relocate" },
    "business.identity": { optionId: "design_creative" },
    "office.environment_confirmation": { optionId: "creative" },
    "office.client_frequency": { optionId: "rare" },
    "office.exceptions": { optionIds: ["store"] },
    "office.working_pattern": { optionId: "mixed" },
    "industrial.pattern": { optionIds: ["storage", "office"] },
    "industrial.use_mix": { optionId: "balanced" },
    "employee.origins": { optionIds: ["san_francisco", "east_bay"] },
    "access.transit": { optionId: "very" },
    "access.parking": { optionId: "helpful" },
    "industrial.loading_form": { optionId: "either" },
    "office.growth_horizon": { optionId: "modest" },
    "capacity.size": { text: "About 5,000 sq ft" },
    "final.unusual": {},
  };

  function runPath(id, ambiguityOption) {
    let state = engine.createInterviewState({ scenarioId: id, districtGeography });
    const questions = [];
    const selections = [];
    for (let index = 0; index < 30; index += 1) {
      const selection = engine.selectNextQuestion(state);
      if (!selection.question) break;
      questions.push(selection.question.id);
      selections.push({ id: selection.question.id, submitLabel: selection.submitLabel, prompt: selection.question.prompt, help: selection.question.help });
      const answer = selection.question.id === "property.ambiguity" ? { optionId: ambiguityOption } : answers[selection.question.id];
      assert(answer, `Missing ${selection.question.id}`);
      state = engine.applyInterviewAnswer(state, selection.question.id, answer);
    }
    return { state, questions, selections, recommendation: composer.composeLocationRecommendations(state.requirement, accessFoundation, compositionFoundation, sfOfficeModel) };
  }

  const officeOnly = runPath("office-inventory-stated", "stated");
  const officeFlex = runPath("office-inventory-flex", "include");
  const forbiddenDetails = ["storage.pattern", "logistics.receiving", "operations.repair_nature", "vehicles.count", "events.peak", "work.peak"];

  assert.equal(officeOnly.questions.length, 15);
  assert.deepEqual(officeOnly.questions, ["location.anchor", "foundation.property_context", "location.district_candidates", "foundation.objective", "business.identity", "office.environment_confirmation", "office.client_frequency", "office.exceptions", "office.working_pattern", "property.ambiguity", "employee.origins", "access.transit", "access.parking", "office.growth_horizon", "final.unusual"]);
  assert(forbiddenDetails.every((id) => !officeOnly.questions.includes(id)));
  assert(!officeOnly.questions.includes("capacity.size"));
  assert(officeOnly.state.requirement.activities.includes("store"), "The secondary activity fact must survive branch closure.");
  assert.deepEqual(officeOnly.state.requirement.propertyTypes, ["office"]);
  assert.equal(officeOnly.state.requirement.criteria.find((item) => item.dimension === "universal.property.context_ambiguity").value.text, "Keep stated property context");
  assert.equal(officeOnly.state.requirement.readiness.readyForLocation.ready, true);

  const ambiguitySelection = officeOnly.selections.find((item) => item.id === "property.ambiguity");
  assert.equal(ambiguitySelection.prompt, "Should Rofo also consider office/flex spaces that may better accommodate this activity?");
  const ambiguityQuestion = engine.QUESTIONS_BY_ID["property.ambiguity"];
  assert(ambiguityQuestion, "The generic ambiguity question must remain registered.");

  assert(officeFlex.questions.length <= 20, "Confirmed Office/Flex enrichment must remain bounded.");
  assert(officeFlex.state.requirement.propertyTypes.includes("office") && officeFlex.state.requirement.propertyTypes.includes("industrial_flex"));
  assert(officeFlex.questions.includes("industrial.pattern") && officeFlex.questions.includes("industrial.use_mix") && officeFlex.questions.includes("industrial.loading_form"), "Confirmed Office/Flex scope must capture the material hybrid facts.");
  assert(officeFlex.questions.includes("capacity.size"), "The broadened non-Office context retains its existing scale boundary.");
  const flexSize = officeFlex.selections.find((item) => item.id === "capacity.size");
  assert.equal(flexSize.prompt, "About how much space do you need?");
  assert.match(flexSize.help, /20,000 sq ft/i);
  assert.equal(officeFlex.state.requirement.readiness.readyForLocation.ready, true);

  for (const result of [officeOnly, officeFlex]) {
    result.selections.slice(0, -1).forEach((selection) => assert.equal(selection.submitLabel, "Continue", `${selection.id} cannot promise recommendations early.`));
    assert.equal(result.selections.at(-1).id, "final.unusual");
    assert.equal(result.selections.at(-1).submitLabel, "Show recommended locations");
    assert(result.questions.filter((id) => /growth/i.test(id)).length <= 1, "Growth must remain one bounded Office question.");
  }
  assert.deepEqual(officeOnly.recommendation.shortlist.map((item) => item.districtId), ["soma", "jackson-square", "mission-district"]);
  assert.equal(officeOnly.recommendation.shortlist.filter((item) => ["showplace-square", "design-district"].includes(item.districtId)).length <= 1, true);

  const classifications = {
    "location.anchor": "LOCATION",
    "foundation.property_context": "PROPERTY-CONTEXT CHECK",
    "location.district_candidates": "LOCATION",
    "foundation.objective": "CONTEXT",
    "business.identity": "CONTEXT",
    "office.environment_confirmation": "LOCATION",
    "office.client_frequency": "LOCATION",
    "office.exceptions": "PROPERTY-CONTEXT CHECK",
    "office.working_pattern": "USE",
    "property.ambiguity": "PROPERTY-CONTEXT CHECK",
    "employee.origins": "LOCATION",
    "access.transit": "LOCATION",
    "access.parking": "LOCATION",
    "office.growth_horizon": "SCALE",
    "final.unusual": "CONTEXT",
  };
  assert.deepEqual(Object.keys(classifications), officeOnly.questions);
  assert(!Object.values(classifications).includes("PROPERTY DETAIL"));

  const client = fs.readFileSync("js/requirement-prototype.js", "utf8");
  const page = fs.readFileSync("pages/prototype/requirement-v1.njk", "utf8");
  assert(client.includes('elements["continue-question"].textContent = selection.submitLabel || "Continue"'));
  assert(client.includes('state.mode = question.id === "final.unusual" ? "preview" : "complete"'));
  assert(client.includes('question?.answerType === "final_text"'));
  assert(client.includes('recap.append(node("h3", "", "Your search"))'));
  ["Business", "Environment", "Employees", "Customers / clients", "Transit / parking", "Areas already being considered"].forEach((label) => assert(client.includes(`"${label}"`)));
  assert(page.includes("Edit my search"));
  assert(client.includes("state.interview = backInterview(state.interview); state.mode = \"interview\""));
  assert(page.includes("<details class=\"requirement-debug\"") && !page.includes("data-debug-panel open"));

  console.log(`ordinary Office inventory path (${officeOnly.questions.length}): ${officeOnly.questions.join(" -> ")}`);
  console.log(`Office/Flex inventory path (${officeFlex.questions.length}): ${officeFlex.questions.join(" -> ")}`);
  console.log(`ordinary Office classifications: ${officeOnly.questions.map((id) => `${id}=${classifications[id]}`).join("; ")}`);
  console.log("Final Office Location UX QA passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
