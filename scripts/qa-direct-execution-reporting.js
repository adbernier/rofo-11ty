const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { webcrypto } = require("crypto");

const ROOT = process.cwd();
const MISSION_SOURCE = path.join(ROOT, "functions", "admin", "eos-missions.js");
const EOS_SOURCE = path.join(ROOT, "functions", "admin", "eos.js");
const ENDPOINT_SOURCE = path.join(ROOT, "functions", "api", "eos", "missions", "[missionId]", "execution-report.js");
const SCRIPT_SOURCE = path.join(ROOT, "scripts", "report-mission-execution.js");
const MIGRATION_SOURCE = path.join(ROOT, "migrations", "0003_eos_mission_reporting_tokens.sql");
const GENERATED_RUNTIME = path.join(ROOT, "data", "generated", "eos-admin-runtime.json");

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

class MockStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
    this.values = [];
  }

  bind(...values) {
    this.values = values;
    return this;
  }

  async run() {
    const normalized = this.sql.replace(/\s+/g, " ").trim().toLowerCase();
    if (normalized.startsWith("alter table eos_missions add column")) {
      const column = normalized.split(" add column ")[1].split(" ")[0];
      this.db.columns.add(column);
    }
    if (normalized.startsWith("update eos_missions set status = 'completed'")) {
      const [completedAt, revokedAt, updatedAt, id] = this.values;
      const row = this.db.rows.get(id);
      row.status = "completed";
      row.completed_at = completedAt;
      row.reporting_token_revoked_at = revokedAt;
      row.updated_at = updatedAt;
    }
    if (normalized.startsWith("update eos_missions set task_status_json")) {
      const [taskStatusJson, lastUsedAt, updatedAt, id] = this.values;
      const row = this.db.rows.get(id);
      row.task_status_json = taskStatusJson;
      if (lastUsedAt) row.reporting_token_last_used_at = lastUsedAt;
      row.updated_at = updatedAt;
    }
    return { success: true };
  }

  async all() {
    const normalized = this.sql.replace(/\s+/g, " ").trim().toLowerCase();
    if (normalized === "pragma table_info(eos_missions)") {
      return { results: Array.from(this.db.columns).map((name) => ({ name })) };
    }
    return { results: Array.from(this.db.rows.values()) };
  }

  async first() {
    const normalized = this.sql.replace(/\s+/g, " ").trim().toLowerCase();
    if (normalized.includes("where id = ?")) {
      return this.db.rows.get(this.values[0]) || null;
    }
    return null;
  }
}

class MockD1 {
  constructor(row) {
    this.rows = new Map([[row.id, { ...row }]]);
    this.columns = new Set(Object.keys(row));
  }

  prepare(sql) {
    return new MockStatement(this, sql);
  }
}

function loadMissionModule() {
  const source = read(MISSION_SOURCE)
    .replace(/export const /g, "const ")
    .replace(/export async function /g, "async function ")
    .replace(/export function /g, "function ");
  const sandbox = {
    module: { exports: {} },
    exports: {},
    crypto: {
      randomUUID: () => "00000000-0000-4000-8000-000000000000",
      getRandomValues: (array) => webcrypto.getRandomValues(array),
      subtle: webcrypto.subtle,
    },
    TextEncoder,
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
    Uint8Array,
  };
  vm.runInNewContext(`${source}
module.exports = {
  authorizeMissionReporting,
  codexPacketMarkdown,
  markMissionComplete,
  submitMissionExecutionResults,
};`, sandbox, { filename: MISSION_SOURCE });
  return sandbox.module.exports;
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hash = await webcrypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function missionRow({ tokenHash, status = "active" }) {
  return {
    id: "mission-direct-1",
    sequence_number: 6,
    display_id: "Mission #006",
    source_mission_id: "search-mission-1",
    source: "search_intelligence",
    type: "search_mission",
    title: "Example Direct Mission",
    objective: "Do the approved work.",
    status,
    started_at: "2026-08-10T12:00:00.000Z",
    completed_at: null,
    confidence: "high",
    estimated_effort: "Medium",
    expected_impact: "High",
    supporting_markets_json: "[]",
    property_types_json: "[]",
    themes_json: "[]",
    evidence_snapshot_json: "{}",
    knowledge_gap_snapshot_json: "[]",
    work_packet_json: JSON.stringify({
      objective: "Do the approved work.",
      targets: { markets: [], propertyTypes: [] },
      currentGaps: [],
      workToComplete: [
        { id: "evidence-acquisition", title: "Acquire evidence", owner: "Codex", details: "Do evidence work." },
        { id: "business-guides", title: "Evaluate guides", owner: "Codex", details: "Evaluate guide readiness." },
        { id: "qa", title: "Run QA", owner: "Codex", details: "Run validation." },
      ],
      boundaries: [],
      validation: [],
      completionReport: [],
    }),
    baseline_search_snapshot_json: "{}",
    task_status_json: "{}",
    reporting_token_hash: tokenHash,
    reporting_token_issued_at: "2026-08-10T12:00:00.000Z",
    reporting_token_last_used_at: null,
    reporting_token_revoked_at: null,
    created_at: "2026-08-10T12:00:00.000Z",
    updated_at: "2026-08-10T12:00:00.000Z",
  };
}

async function main() {
  const missionSource = read(MISSION_SOURCE);
  const eosSource = read(EOS_SOURCE);
  const endpointSource = read(ENDPOINT_SOURCE);
  const scriptSource = read(SCRIPT_SOURCE);
  const migrationSource = read(MIGRATION_SOURCE);
  const runtimeSource = read(GENERATED_RUNTIME);
  const missionModule = loadMissionModule();
  const rawToken = "test-reporting-token";
  const row = missionRow({ tokenHash: await sha256(rawToken) });
  const env = { LEADS_DB: new MockD1(row) };
  const payload = {
    schemaVersion: "mission-task-results-v1",
    missionDisplayId: "Mission #006",
    missionId: "mission-direct-1",
    tasks: [
      { taskId: "evidence-acquisition", status: "complete", outcome: "delivered", summary: "Evidence acquired." },
      { taskId: "business-guides", status: "complete", outcome: "blocked", summary: "Guide work is not supportable yet." },
      { taskId: "qa", status: "complete_scoped", outcome: "researchable_later", summary: "Validation passed; future checks remain." },
    ],
  };

  assert(migrationSource.includes("reporting_token_hash"), "D1 migration must add reporting token hash.");
  assert(missionSource.includes("reporting_token_hash"), "Mission table schema must include reporting token hash.");
  assert(missionSource.includes("crypto.getRandomValues"), "Mission reporting token generation must use secure random bytes.");
  assert(missionSource.includes("crypto.subtle.digest"), "Mission reporting tokens must be hashed.");
  assert(missionSource.includes("constantTimeEqual"), "Token hash comparison should be constant-time.");
  assert(missionSource.includes("submitMissionExecutionResults"), "Direct reporting should have a shared mission-module entry point.");
  assert(missionSource.includes("applyMissionTaskResults"), "Manual and direct reporting should reuse the same apply function.");
  assert(endpointSource.includes("submitMissionExecutionResults"), "Endpoint should delegate to shared reconciliation.");
  assert(endpointSource.includes("application/json"), "Endpoint should require JSON.");
  assert(endpointSource.includes("authorization"), "Endpoint should use Authorization bearer token.");
  assert(scriptSource.includes("EOS_REPORTING_BASE_URL"), "Reporting script should support local/staging endpoint override.");
  assert(!scriptSource.includes("console.log(args.token"), "Reporting script must not print the token.");
  assert(eosSource.includes("Manual Execution Report"), "Manual paste fallback should remain available but de-emphasized.");
  assert(missionSource.includes("direct-reporting-v1"), "Codex packet should include direct reporting protocol.");
  assert(!runtimeSource.includes(rawToken), "Generated runtime must not contain reporting tokens.");

  await missionModule.authorizeMissionReporting(env, "mission-direct-1", rawToken);
  const result = await missionModule.submitMissionExecutionResults(env, "mission-direct-1", rawToken, payload);
  assert(result.ok === true, "Correct mission token should be accepted.");
  assert(result.matchedTasks === 3, "All three task results should match.");
  assert(result.remainingTasks === 0, "All tasks should be complete after direct reconciliation.");
  assert(result.readyToClose === true, "Mission should be ready for operator review after all tasks complete.");
  assert(env.LEADS_DB.rows.get("mission-direct-1").reporting_token_last_used_at, "Direct report should record token last-used timestamp.");
  assert(env.LEADS_DB.rows.get("mission-direct-1").status === "active", "Direct report must not auto-complete the mission.");

  const retry = await missionModule.submitMissionExecutionResults(env, "mission-direct-1", rawToken, payload);
  assert(retry.ok === true && retry.readyToClose === true, "Identical direct report retry should be idempotent.");

  try {
    await missionModule.submitMissionExecutionResults(env, "mission-direct-1", "wrong-token", payload);
    assert(false, "Wrong token should be rejected.");
  } catch (error) {
    assert(/invalid mission reporting token/i.test(error.message), "Wrong token rejection should be explicit.");
  }

  try {
    await missionModule.submitMissionExecutionResults(env, "mission-direct-1", rawToken, { ...payload, missionId: "other-mission" });
    assert(false, "Mission mismatch should be rejected.");
  } catch (error) {
    assert(/missionId does not match/i.test(error.message), "Mission mismatch rejection should use existing validator.");
  }

  try {
    await missionModule.submitMissionExecutionResults(env, "mission-direct-1", rawToken, {
      ...payload,
      tasks: [{ taskId: "unknown-task", status: "complete", outcome: "delivered", summary: "Bad task." }],
    });
    assert(false, "Unknown-only task report should not be treated as successful completion.");
  } catch (error) {
    assert(/does not match/i.test(error.message) || /pending|unknown/i.test(error.message), "Unknown task report should not silently create work.");
  }

  await missionModule.markMissionComplete(env, "mission-direct-1");
  assert(env.LEADS_DB.rows.get("mission-direct-1").reporting_token_revoked_at, "Mark Mission Complete should revoke direct reporting.");
  try {
    await missionModule.submitMissionExecutionResults(env, "mission-direct-1", rawToken, payload);
    assert(false, "Completed mission should reject direct reporting.");
  } catch (error) {
    assert(/completed/i.test(error.message), "Completed mission rejection should be explicit.");
  }

  const packet = missionModule.codexPacketMarkdown({
    id: "mission-direct-1",
    displayId: "Mission #006",
    title: "Example Direct Mission",
    objective: "Do the approved work.",
    workPacket: JSON.parse(row.work_packet_json),
  }, { reportingToken: rawToken, reportingBaseUrl: "http://localhost:8788" });
  assert(packet.includes("DIRECT EXECUTION REPORTING"), "Packet should include direct reporting instructions.");
  assert(packet.includes("scripts/report-mission-execution.js"), "Packet should include the reporting script command.");
  assert(packet.includes(rawToken), "Raw token should be present only in the copied packet when freshly issued.");
  assert(!missionSource.includes("data/generated/search-console-opportunity.json"), "Mission module must not import raw Search Intelligence.");

  if (errors.length) {
    console.error("Direct execution reporting QA failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log("Direct execution reporting QA passed.");
  console.log("Validated mission-scoped token auth, shared reconciliation, idempotent retry, revocation, packet command, and token-safe generated artifacts.");
}

main().catch((error) => {
  console.error("Direct execution reporting QA failed:");
  console.error(`- ${error.message}`);
  process.exit(1);
});
