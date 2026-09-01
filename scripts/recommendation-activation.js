#!/usr/bin/env node
const { execFileSync } = require("node:child_process");
const registry = require("../_data/recommendationActivationRegistry.js");

const DATABASE = "rofo-leads";
const args = process.argv.slice(2);
const command = args.shift() || "";
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] || "" : "";
};
const has = (name) => args.includes(name);
const environment = option("--environment") || "local";
const production = environment === "production";

function fail(message) { console.error(message); process.exit(1); }
function sqlValue(value) { return `'${String(value).replace(/'/g, "''")}'`; }
function run(sql) {
  const execution = ["wrangler", "d1", "execute", DATABASE, production ? "--remote" : "--local", "--command", sql, "--json"];
  const output = execFileSync("npx", execution, { cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const parsed = JSON.parse(output);
  const result = Array.isArray(parsed) ? parsed[0] : parsed;
  return result?.results || result?.result?.[0]?.results || [];
}
function normalizePropertyType(value) { return String(value || "").trim().toLowerCase().replace(/-/g, "_"); }
function certifiedFlow(market, propertyType) {
  return Object.values(registry.flows).find((flow) => flow.marketId === String(market || "").trim().toLowerCase() && flow.propertyType === normalizePropertyType(propertyType));
}
function state(flow) {
  const rows = run(`select activation_key, market_id, property_type, cohort, enabled, certification_id, updated_at, updated_by from recommendation_runtime_activations where activation_key = ${sqlValue(flow.activationKey)} limit 1`);
  return rows[0] || null;
}
function print(flow, previous, current) {
  console.log(JSON.stringify({
    environment,
    market: flow.marketId,
    propertyType: flow.propertyType,
    cohort: flow.cohort,
    certification: flow.certificationStatus,
    previousState: previous == null ? null : Number(previous.enabled) === 1 ? "ON" : "OFF",
    newState: current == null ? null : Number(current.enabled) === 1 ? "ON" : "OFF",
    updatedAt: current?.updated_at || null,
    updatedBy: current?.updated_by || null,
  }, null, 2));
}

if (!["local", "production"].includes(environment)) fail("--environment must be local or production.");
if (command === "status") {
  const selected = Object.values(registry.flows);
  for (const flow of selected) { const current = state(flow); print(flow, current, current); }
  process.exit(0);
}
if (command !== "set") fail("Usage: npm run activation:set -- <market> <property-type> <on|off> --environment <local|production> [--confirm-production] [--actor <name>]");
const positional = args.filter((arg, index) => !arg.startsWith("--") && (index === 0 || !args[index - 1].startsWith("--")));
const [market, propertyInput, desiredInput] = positional;
const flow = certifiedFlow(market, propertyInput);
if (!flow) fail("Activation denied: that market/property combination is not in the certified runtime registry.");
const desired = String(desiredInput || "").toLowerCase();
if (!["on", "off"].includes(desired)) fail("Activation state must be on or off.");
if (production && !has("--confirm-production")) fail("Production mutation requires --environment production --confirm-production.");
const actor = (option("--actor") || process.env.USER || "operator").replace(/[^a-zA-Z0-9@._:-]/g, "").slice(0, 120) || "operator";
const before = state(flow);
const now = new Date().toISOString();
run(`insert into recommendation_runtime_activations (activation_key, market_id, property_type, cohort, enabled, certification_id, updated_at, updated_by) values (${sqlValue(flow.activationKey)}, ${sqlValue(flow.marketId)}, ${sqlValue(flow.propertyType)}, ${sqlValue(flow.cohort)}, ${desired === "on" ? 1 : 0}, ${sqlValue(flow.certificationId)}, ${sqlValue(now)}, ${sqlValue(actor)}) on conflict (activation_key) do update set market_id = excluded.market_id, property_type = excluded.property_type, cohort = excluded.cohort, enabled = excluded.enabled, certification_id = excluded.certification_id, updated_at = excluded.updated_at, updated_by = excluded.updated_by`);
const after = state(flow);
print(flow, before, after);
