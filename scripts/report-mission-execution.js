#!/usr/bin/env node

const fs = require("fs");

const DEFAULT_BASE_URL = "https://www.rofo.com";
const SCHEMA_VERSION = "mission-task-results-v1";

function usage() {
  return [
    "Usage:",
    "node scripts/report-mission-execution.js --mission-id <MISSION_ID> --token <MISSION_REPORTING_TOKEN> --results-file <FILE>",
    "",
    "Optional:",
    "EOS_REPORTING_BASE_URL=http://localhost:8788",
  ].join("\n");
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    const next = argv[index + 1];
    if (key === "--mission-id") {
      args.missionId = next;
      index += 1;
    } else if (key === "--token") {
      args.token = next;
      index += 1;
    } else if (key === "--results-file") {
      args.resultsFile = next;
      index += 1;
    } else if (key === "--help" || key === "-h") {
      args.help = true;
    }
  }
  return args;
}

function validatePayload(payload, missionId) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Results file must contain a JSON object.");
  }
  if (payload.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(`Results schemaVersion must be ${SCHEMA_VERSION}.`);
  }
  if (payload.missionId && payload.missionId !== missionId) {
    throw new Error("Results missionId does not match --mission-id.");
  }
  if (!Array.isArray(payload.tasks)) {
    throw new Error("Results tasks must be an array.");
  }
  for (const task of payload.tasks) {
    if (!task || typeof task !== "object") throw new Error("Each task result must be an object.");
    if (!task.taskId) throw new Error("Each task result must include taskId.");
    if (!task.status) throw new Error(`Task ${task.taskId} must include status.`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.missionId || !args.token || !args.resultsFile) {
    throw new Error(usage());
  }

  const raw = fs.readFileSync(args.resultsFile, "utf8");
  const payload = JSON.parse(raw);
  validatePayload(payload, args.missionId);

  const baseUrl = String(process.env.EOS_REPORTING_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const endpoint = `${baseUrl}/api/eos/missions/${encodeURIComponent(args.missionId)}/execution-report`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${args.token}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.ok) {
    throw new Error(body.error || `Mission execution reporting failed with HTTP ${response.status}.`);
  }

  console.log(`${body.displayId || "Mission"} execution results accepted.`);
  console.log(`${body.matchedTasks} of ${body.matchedTasks + body.remainingTasks} assigned tasks complete.`);
  if (body.readyToClose) {
    console.log("Mission is ready for operator review.");
  } else {
    console.log(`${body.remainingTasks} assigned tasks remain pending.`);
  }
}

main().catch((error) => {
  console.error(`Direct Mission Control reporting failed: ${error.message}`);
  process.exit(1);
});
