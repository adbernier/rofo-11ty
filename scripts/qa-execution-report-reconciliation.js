const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = process.cwd();
const MISSION_SOURCE = path.join(ROOT, "functions", "admin", "eos-missions.js");
const EOS_SOURCE = path.join(ROOT, "functions", "admin", "eos.js");

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function loadMissionModule() {
  const source = read(MISSION_SOURCE)
    .replace(/export const /g, "const ")
    .replace(/export async function /g, "async function ")
    .replace(/export function /g, "function ");
  const sandbox = {
    module: { exports: {} },
    exports: {},
    crypto: { randomUUID: () => "00000000-0000-4000-8000-000000000000" },
    console,
    Set,
    Map,
    Array,
    Object,
    JSON,
    String,
    Number,
    Boolean,
    RegExp,
    Date,
    Math,
  };
  vm.runInNewContext(`${source}
module.exports = {
  reviewMissionExecutionReport,
  applyMissionExecutionReport,
  isMissionTaskComplete,
  codexPacketMarkdown,
};`, sandbox, { filename: MISSION_SOURCE });
  return sandbox.module.exports;
}

const missionSource = read(MISSION_SOURCE);
const eosSource = read(EOS_SOURCE);
const missionModule = loadMissionModule();

assert(missionSource.includes("MISSION_TASK_RESULTS_V1"), "Codex packet must include MISSION_TASK_RESULTS_V1 contract.");
assert(missionSource.includes("END_MISSION_TASK_RESULTS_V1"), "Structured task results block must have an end delimiter.");
assert(missionSource.includes("mission-task-results-v1"), "Structured task result schema version is missing.");
assert(missionSource.includes("TASK_RESULT_STATUSES"), "Task result statuses should be explicitly constrained.");
assert(missionSource.includes("TASK_RESULT_OUTCOMES"), "Task result outcomes should be explicitly constrained.");
assert(missionSource.includes("complete_scoped"), "Scoped completion status is missing.");
assert(missionSource.includes("researchable_later"), "Researchable-later outcome is missing.");
assert(missionSource.includes("blocked"), "Blocked outcome is missing.");
assert(missionSource.includes("MAX_EXECUTION_REPORT_LENGTH"), "Execution report payload size guard is missing.");
assert(missionSource.includes("task_status_json"), "Reconciliation should persist in existing mission task JSON.");
assert(eosSource.includes('action" value="review_execution_report"'), "Mission page must expose non-mutating report review.");
assert(eosSource.includes('action" value="apply_execution_report"'), "Mission page must expose explicit apply action.");
assert(eosSource.includes("Apply Execution Report"), "Mission page must label the reconciliation flow.");
assert(eosSource.includes("Review Results"), "Mission page must review results before mutation.");
assert(eosSource.includes("Scoped work is ready to close"), "Mission progress should explain scoped completion.");

const record = {
  id: "mission-abc",
  displayId: "Mission #003",
  taskStatus: {},
  workPacket: {
    workToComplete: [
      { id: "acquire-foundation-evidence", title: "Acquire evidence" },
      { id: "assess-representative-evidence", title: "Assess representative evidence" },
      { id: "evaluate-business-guides", title: "Evaluate business guides" },
      { id: "validation", title: "Validation" },
    ],
  },
};

const report = `EOS Standardized Execution Report v1

Implementation Summary
Done.

MISSION_TASK_RESULTS_V1
{
  "schemaVersion": "mission-task-results-v1",
  "missionDisplayId": "Mission #003",
  "missionId": "mission-abc",
  "tasks": [
    {
      "taskId": "acquire-foundation-evidence",
      "status": "complete",
      "outcome": "delivered",
      "summary": "Evidence acquired."
    },
    {
      "taskId": "assess-representative-evidence",
      "status": "complete",
      "outcome": "researchable_later",
      "summary": "Additional properties need later validation."
    },
    {
      "taskId": "evaluate-business-guides",
      "status": "complete",
      "outcome": "blocked",
      "summary": "<script>alert('x')</script>"
    },
    {
      "taskId": "unknown-task",
      "status": "complete",
      "outcome": "delivered",
      "summary": "Should not apply."
    }
  ]
}
END_MISSION_TASK_RESULTS_V1`;

const review = missionModule.reviewMissionExecutionReport(record, report);
assert(review.summary.matched === 3, `Expected 3 matched tasks, got ${review.summary.matched}.`);
assert(review.summary.unmatched === 1, `Expected 1 unmatched task, got ${review.summary.unmatched}.`);
assert(review.summary.missing === 1, `Expected 1 missing task, got ${review.summary.missing}.`);
assert(review.summary.researchableLater === 1, "Researchable-later outcome should be counted.");
assert(review.summary.blocked === 1, "Blocked outcome should be counted.");
assert(review.missing[0] && review.missing[0].taskId === "validation", "Missing validation task should remain pending.");
assert(missionModule.isMissionTaskComplete({ status: "complete", outcome: "blocked" }), "Blocked outcome with complete status should count as task complete.");
assert(missionModule.isMissionTaskComplete({ status: "complete_scoped", outcome: "researchable_later" }), "Scoped complete should count as task complete.");
assert(!missionModule.isMissionTaskComplete({ status: "pending", outcome: "delivered" }), "Pending should not count as complete.");
assert(review.matched.find((item) => item.taskId === "evaluate-business-guides").summary.includes("<script>"), "Parser should preserve summaries for escaped rendering, not evaluate or strip by execution.");

try {
  missionModule.reviewMissionExecutionReport(record, report.replace("Mission #003", "Mission #999"));
  assert(false, "Wrong mission display ID should be rejected.");
} catch (error) {
  assert(/missionDisplayId/i.test(error.message), "Wrong mission rejection should explain missionDisplayId mismatch.");
}

try {
  missionModule.reviewMissionExecutionReport(record, "MISSION_TASK_RESULTS_V1\n{ nope }\nEND_MISSION_TASK_RESULTS_V1");
  assert(false, "Malformed JSON should be rejected.");
} catch (error) {
  assert(/Invalid MISSION_TASK_RESULTS_V1 JSON/i.test(error.message), "Malformed JSON rejection should be explicit.");
}

const packet = missionModule.codexPacketMarkdown({
  id: "mission-abc",
  displayId: "Mission #003",
  title: "Example Mission",
  objective: "Do the work.",
  workPacket: {
    objective: "Do the work.",
    targets: { markets: [], propertyTypes: [] },
    currentGaps: [],
    workToComplete: record.workPacket.workToComplete.map((task) => ({ ...task, owner: "Codex", details: "Do this task." })),
    boundaries: [],
    validation: [],
    completionReport: [],
  },
});
assert(packet.includes("Task ID: acquire-foundation-evidence"), "Codex packet should expose stable task IDs.");
assert(packet.includes("IMPORTANT COMPLETION REQUIREMENT"), "Codex packet should explain the structured report requirement.");
assert(packet.includes('"taskId": "validation"'), "Structured block template should include every task ID.");

if (errors.length) {
  console.error("Execution report reconciliation QA failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Execution report reconciliation QA passed.");
console.log("Validated structured parsing, mission matching, task matching, blocked/deferred outcomes, and Codex packet contract.");
