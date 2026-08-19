const assert = require("node:assert/strict");
const path = require("node:path");
const districtGeography = require("../_data/requirementPrototypeDistrictGeography");

(async function run() {
  const engine = await import(path.resolve("lib/requirements/requirement-interview-v1.mjs"));
  const answers = {
    "location.anchor": { text: "San Francisco, CA", market: { marketId: "san-francisco", geographyId: "san-francisco", marketName: "San Francisco", city: "San Francisco", state: "CA", displayName: "San Francisco, CA" } },
    "foundation.property_context": { optionId: "medical" },
    "location.district_candidates": { noPreference: true, districtIds: [] },
    "foundation.objective": { optionId: "relocate" },
    "medical.practice": { text: "medical private practice" },
    "medical.secondary": { optionIds: ["none"] },
    "employee.origins": { optionIds: ["north_bay"] },
    "access.transit": { optionId: "not" },
    "access.parking": { optionId: "very" },
    "customer.origins": { optionIds: ["san_francisco", "north_bay"] },
    "final.unusual": {},
  };
  let state = engine.createInterviewState({ scenarioId: "medical-applicability", districtGeography });
  const questions = [];
  for (let index = 0; index < 30; index += 1) {
    const selection = engine.selectNextQuestion(state);
    if (!selection.question) break;
    questions.push(selection.question.id);
    assert(answers[selection.question.id], `Unexpected Medical question: ${selection.question.id}`);
    state = engine.applyInterviewAnswer(state, selection.question.id, answers[selection.question.id]);
  }
  assert.deepEqual(questions, ["location.anchor", "foundation.property_context", "location.district_candidates", "foundation.objective", "medical.practice", "medical.secondary", "employee.origins", "access.transit", "access.parking", "customer.origins", "final.unusual"]);
  assert(!questions.includes("business.identity"));
  assert(!questions.includes("office.environment_confirmation"));
  assert(!questions.includes("care.pattern"));
  assert(!questions.includes("property.ambiguity"));
  assert(!questions.includes("capacity.size"));
  assert(!questions.includes("work.peak"));
  assert.equal(engine.QUESTIONS_BY_ID["medical.secondary"].prompt, "Does anything else happen in the space that could affect the kind of property you need?");
  assert.equal(engine.QUESTIONS_BY_ID["office.exceptions"].prompt, "Besides office use, does anything else happen in the space?");
  assert(state.requirement.activities.includes("treat_care"), "Medical property context must establish ordinary patient-care activity.");
  assert.equal(state.requirement.criteria.find((item) => item.dimension === "medical.business.practice_description").value.text, "medical private practice");
  assert(!state.requirement.criteria.some((item) => item.dimension === "universal.business.type"), "Medical must not be normalized to the Office identity taxonomy.");
  assert.deepEqual(state.requirement.criteria.find((item) => item.dimension === "universal.location.customer_origins").value.list, ["San Francisco", "Marin / North Bay"]);
  assert.equal(state.requirement.criteria.find((item) => item.dimension === "universal.access.transit_importance").value.text, "Public transit is not important");
  assert.equal(state.requirement.criteria.find((item) => item.dimension === "universal.access.parking_importance").value.text, "Convenient parking is very important");
  assert.equal(state.requirement.readiness.readyForLocation.ready, true);
  console.log(`Medical applicability QA passed. questions=${questions.length}; ${questions.join(" -> ")}`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
