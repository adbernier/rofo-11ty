const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const EOS_ADMIN = path.join(ROOT, "functions", "admin", "eos.js");
const EOS_MISSIONS = path.join(ROOT, "functions", "admin", "eos-missions.js");
const MIGRATION = path.join(ROOT, "migrations", "0002_eos_missions.sql");
const ADMIN_RUNTIME = path.join(ROOT, "data", "generated", "eos-admin-runtime.json");

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(relativeOrAbsolutePath) {
  const filePath = path.isAbsolute(relativeOrAbsolutePath) ? relativeOrAbsolutePath : path.join(ROOT, relativeOrAbsolutePath);
  return fs.readFileSync(filePath, "utf8");
}

const eosSource = read(EOS_ADMIN);
const missionSource = read(EOS_MISSIONS);
const migrationSource = read(MIGRATION);
const runtime = JSON.parse(read(ADMIN_RUNTIME));
const searchMissions = (((runtime.commercialKnowledgeIntelligence || {}).searchMissions) || []);

assert(searchMissions.length > 0, "Generated runtime should contain suggested Search Missions.");
assert(!read(ADMIN_RUNTIME).includes("eos_missions"), "Generated runtime must not persist commenced mission state.");

assert(missionSource.includes("create table if not exists eos_missions"), "Mission persistence table creation is missing.");
assert(migrationSource.includes("create table if not exists eos_missions"), "D1 migration for eos_missions is missing.");
assert(migrationSource.includes("sequence_number integer not null unique"), "Mission sequence number must be durable and unique.");
assert(migrationSource.includes("idx_eos_missions_active_source"), "Active source-mission duplicate-prevention index is missing.");

assert(missionSource.includes("select max(sequence_number) as max_sequence"), "Sequential mission assignment should use persisted D1 state.");
assert(missionSource.includes("for (let attempt = 0; attempt < 5"), "Sequential mission assignment should retry on collisions.");
assert(missionSource.includes("getActiveMissionForSource"), "Duplicate active mission prevention is missing.");
assert(missionSource.includes("evidenceSnapshot(mission)"), "Commenced mission should snapshot evidence.");
assert(missionSource.includes("baselineSearchSnapshot(mission, eos)"), "Commenced mission should capture baseline Search snapshot.");
assert(missionSource.includes("generateSearchMissionWorkPacket"), "Search Mission Work Packet generation is missing.");
assert(missionSource.includes("codexPacketMarkdown"), "Codex-ready packet rendering is missing.");
assert(missionSource.includes("Field / Human"), "Work Packet should distinguish human/field work where applicable.");
assert(missionSource.includes("Do not change Search Mission scoring"), "Codex packet boundaries should protect Search Mission behavior.");

assert(eosSource.includes('action" value="commence_search_mission"'), "Search Mission review should expose Commence Work action.");
assert(eosSource.includes('action" value="toggle_task"'), "Mission detail should allow task progress updates.");
assert(eosSource.includes('action" value="complete_mission"'), "Mission detail should allow Mark Mission Complete.");
assert(eosSource.includes("renderDurableMissionPage"), "Permanent Mission page renderer is missing.");
assert(eosSource.includes("renderSearchMissionReview"), "Search Mission review page renderer is missing.");
assert(eosSource.includes("Mission History"), "Archive should be reframed as Mission History.");
assert(eosSource.includes("Legacy / Prior Work"), "Legacy missions should remain separate from new sequential mission records.");
assert(eosSource.includes("activeMissionBySourceId"), "Today/Intelligence should detect active Search Missions.");
assert(eosSource.includes("Continue Mission"), "Today should continue active missions instead of duplicating commencement.");
assert(eosSource.includes("Copy Codex Packet"), "Mission pages should expose Copy Codex Packet.");

assert(!missionSource.includes("data/generated/search-console-opportunity.json"), "Mission persistence must not import raw Search Intelligence snapshots.");
assert(!missionSource.includes("data/generated/eos-analysis.json"), "Mission persistence must not import full EOS analysis.");
assert(!eosSource.includes("../../data/generated/eos-analysis.json"), "EOS admin Function must not import full EOS analysis.");
assert(!eosSource.includes("../../data/generated/search-console-opportunity.json"), "EOS admin Function must not import raw Search Intelligence snapshots.");

if (errors.length) {
  console.error("Search Mission execution QA failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Search Mission execution QA passed.");
console.log(`Suggested Search Missions remain ephemeral until commenced: ${searchMissions.length}.`);
