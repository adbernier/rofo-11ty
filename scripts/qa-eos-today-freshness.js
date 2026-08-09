const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const ADMIN_PATH = path.join(ROOT, "functions/admin/eos.js");
const RUNTIME_PATH = path.join(ROOT, "data/generated/eos-admin-runtime.json");

const source = fs.readFileSync(ADMIN_PATH, "utf8");
const runtime = JSON.parse(fs.readFileSync(RUNTIME_PATH, "utf8"));
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function findObjects(predicate) {
  const results = [];
  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (predicate(value)) results.push(value);
    Object.values(value).forEach(walk);
  }
  walk(runtime);
  return results;
}

assert(source.includes("function missionExecutionStateBySourceId"), "Today freshness should group durable missions by source mission.");
assert(source.includes("state.latest.status === \"active\""), "Active source mission mapping should require the newest durable source record to be active.");
assert(source.includes("completedMission: execution.completed"), "Search Mission state should preserve completed child mission context.");
assert(source.includes("const searchMission = searchMissions.find((mission) => searchMissionOpportunityState(mission, missionState).state !== \"addressed\") || null;"), "Today should not fall back to addressed Search Missions.");
assert(source.includes("currentMissionState: opportunity.state"), "Today Search Mission cards should carry revalidated opportunity state.");
assert(source.includes("function revalidateStrategicMissionCandidate"), "Today should revalidate strategic candidates before rendering.");
assert(source.includes("function firstFreshStrategicRecommendation"), "Today should select strategic work after revalidation.");
assert(source.includes("function relatedCurrentDistrictMission"), "Today should be able to replace stale district candidates with current narrower district work.");
assert(source.includes("foundation and Commercial Market Evidence are established. Complete the remaining selected Building Profiles"), "Today should rewrite stale CME-missing rationale into current Building Profile rationale.");
assert(source.includes("profileMissing(refreshedStatuses) === 0"), "Today should suppress fully resolved district building evidence candidates.");

const staleAurora = findObjects((item) =>
  item.id === "mission:denver:district-building-evidence:aurora" &&
  /lacks a Commercial Market Evidence collection/i.test(item.currentConstraint || "")
)[0];
const currentAuroraIndustrial = findObjects((item) =>
  item.id === "mission:denver:district-building-evidence:aurora-i-70-airport-industrial"
)[0];

assert(Boolean(staleAurora), "Fixture should contain the stale generic Aurora candidate seen in production.");
assert(Boolean(currentAuroraIndustrial), "Fixture should contain the current Aurora I-70 / Airport Industrial candidate.");
assert(currentAuroraIndustrial && currentAuroraIndustrial.componentStatuses && currentAuroraIndustrial.componentStatuses.commercialMarketEvidence === "Complete", "Current Aurora industrial candidate should show CME complete.");
assert(currentAuroraIndustrial && currentAuroraIndustrial.componentStatuses && currentAuroraIndustrial.componentStatuses.evidenceBuildingProfiles && currentAuroraIndustrial.componentStatuses.evidenceBuildingProfiles.missing > 0, "Current Aurora industrial candidate should preserve remaining Building Profile work.");

const renderOverviewIndex = source.indexOf("function renderOverview");
const recommendationsIndex = source.indexOf("const recommendations = todayRecommendations", renderOverviewIndex);
const thesisIndex = source.indexOf("const thesis = todayThesis(recommendations)", renderOverviewIndex);
assert(renderOverviewIndex >= 0 && recommendationsIndex > renderOverviewIndex && thesisIndex > recommendationsIndex, "Today's Thesis should be generated after final Today recommendations.");

assert(!source.includes("Mission #004 · Continue Mission"), "Today source should not hard-code Mission #004 continuation.");
assert(!source.includes("Mission #004 is active"), "Today source should not hard-code Mission #004 active state.");

if (errors.length) {
  console.error("EOS Today freshness QA failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("EOS Today freshness QA passed.");
console.log("Validated durable mission freshness, Aurora stale-rationale guard, and final-thesis ordering.");
