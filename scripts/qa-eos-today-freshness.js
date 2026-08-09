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
assert(source.includes("function isDistrictBuildingEvidenceMission"), "Today should classify district-building evidence missions without depending on pruned resolver metadata.");
assert(source.includes("programId === \"commercial_market_evidence\""), "Compact runtime district mission detection should use program metadata.");
assert(source.includes("String(mission.portfolioId || \"\").startsWith(\"district-building-evidence:\")"), "Compact runtime district mission detection should use portfolio identity.");
assert(!source.includes("item.source &&\n      item.source.resolverId === \"district-building-evidence-resolver-v1\""), "Related district revalidation must not require source metadata pruned from the compact runtime.");
assert(source.includes("foundation is established. Complete the remaining selected Building Profiles"), "Today should rewrite stale CME-missing rationale into current Building Profile-only rationale.");
assert(source.includes("profileMissing(refreshedStatuses) === 0"), "Today should suppress fully resolved district building evidence candidates.");

const staleAurora = (((runtime.portfolioQueues || {}).missionQueue) || []).find((item) =>
  item.id === "mission:denver:district-building-evidence:aurora" &&
  /lacks a Commercial Market Evidence collection/i.test(item.currentConstraint || "")
);
const currentAuroraIndustrial = (((runtime.portfolioQueues || {}).missionQueue) || []).find((item) =>
  item.id === "mission:denver:district-building-evidence:aurora-i-70-airport-industrial"
);

assert(Boolean(staleAurora), "Fixture should contain the stale generic Aurora candidate seen in production.");
assert(Boolean(currentAuroraIndustrial), "Fixture should contain the current Aurora I-70 / Airport Industrial candidate.");
assert(currentAuroraIndustrial && currentAuroraIndustrial.componentStatuses && currentAuroraIndustrial.componentStatuses.commercialMarketEvidence === "Complete", "Current Aurora industrial candidate should show CME complete.");
assert(currentAuroraIndustrial && currentAuroraIndustrial.componentStatuses && currentAuroraIndustrial.componentStatuses.evidenceBuildingProfiles && currentAuroraIndustrial.componentStatuses.evidenceBuildingProfiles.missing > 0, "Current Aurora industrial candidate should preserve remaining Building Profile work.");
assert(staleAurora && !staleAurora.source, "Compact runtime fixture should demonstrate that source resolver metadata is pruned from Today mission records.");
assert(currentAuroraIndustrial && !currentAuroraIndustrial.source, "Compact runtime fixture should demonstrate that related current mission source metadata is pruned.");

function cmeComplete(statuses) {
  return String(statuses && statuses.commercialMarketEvidence || "").toLowerCase() === "complete";
}

function profileTarget(statuses) {
  const evidence = statuses && statuses.evidenceBuildingProfiles;
  const supporting = statuses && statuses.supportingBuildingProfiles;
  return (Number(evidence && evidence.target) || 0) + (Number(supporting && supporting.target) || 0);
}

function profileMissing(statuses) {
  const evidence = statuses && statuses.evidenceBuildingProfiles;
  const supporting = statuses && statuses.supportingBuildingProfiles;
  return (Number(evidence && evidence.missing) || 0) + (Number(supporting && supporting.missing) || 0);
}

function isDistrictBuildingEvidenceMission(mission) {
  if (!mission) return false;
  if (mission.source && mission.source.resolverId === "district-building-evidence-resolver-v1") return true;
  if (mission.programId === "commercial_market_evidence" && String(mission.portfolioId || "").startsWith("district-building-evidence:")) return true;
  if (String(mission.id || "").includes(":district-building-evidence:")) return true;
  return false;
}

function relatedCurrentDistrictMission(eos, mission) {
  const allMissions = (((eos.portfolioQueues || {}).missionQueue) || [])
    .filter((item) => item && isDistrictBuildingEvidenceMission(item) && item.marketId === mission.marketId);
  const districtId = String(mission.districtId || "");
  return allMissions
    .filter((item) => item.id !== mission.id)
    .filter((item) => {
      const itemDistrictId = String(item.districtId || "");
      return itemDistrictId === districtId || itemDistrictId.startsWith(`${districtId}-`) || districtId.startsWith(`${itemDistrictId}-`);
    })
    .filter((item) => cmeComplete(item.componentStatuses) && profileMissing(item.componentStatuses) > 0)
    .sort((a, b) => profileMissing(b.componentStatuses) - profileMissing(a.componentStatuses))[0] || null;
}

function currentStrategicReason(mission) {
  const statuses = mission.componentStatuses || {};
  if (cmeComplete(statuses) && profileMissing(statuses) > 0) {
    return `${mission.districtName || mission.title} foundation is established. Complete the remaining selected Building Profiles (${profileMissing(statuses)} of ${profileTarget(statuses)}).`;
  }
  if (!cmeComplete(statuses) && profileMissing(statuses) > 0) {
    return `${mission.districtName || mission.title} still needs Commercial Market Evidence and selected Building Profile work.`;
  }
  if (!cmeComplete(statuses)) {
    return `${mission.districtName || mission.title} still needs a Commercial Market Evidence collection.`;
  }
  return mission.currentConstraint || "Highest-priority market mission from the current EOS market projection.";
}

function revalidateStrategicMissionCandidate(candidate, eos) {
  let mission = candidate;
  if (!mission) return { valid: false, suppress: true };
  if (mission.status && mission.status.id === "completed") return { valid: false, suppress: true };
  if (/lacks a Commercial Market Evidence collection/i.test(mission.currentConstraint || "") && !cmeComplete(mission.componentStatuses || {})) {
    const related = relatedCurrentDistrictMission(eos, mission);
    if (related) mission = related;
  }
  const refreshedStatuses = mission.componentStatuses || {};
  if (cmeComplete(refreshedStatuses) && profileMissing(refreshedStatuses) === 0 && isDistrictBuildingEvidenceMission(mission)) {
    return { valid: false, suppress: true };
  }
  return { valid: true, mission, reason: currentStrategicReason(mission) };
}

const staleAuroraReview = revalidateStrategicMissionCandidate(staleAurora, runtime);
assert(staleAuroraReview.valid, "Aurora should remain valid while selected Building Profile work remains.");
assert(staleAuroraReview.mission.id === "mission:denver:district-building-evidence:aurora-i-70-airport-industrial", "Aurora stale candidate should resolve to the current narrower industrial evidence mission.");
assert(!/Commercial Market Evidence/.test(staleAuroraReview.reason), "Aurora CME-complete rationale should not mention missing or remaining CME work.");
assert(/remaining selected Building Profiles/.test(staleAuroraReview.reason), "Aurora CME-complete rationale should mention only remaining Building Profile work.");

const missingCmeAndProfiles = {
  id: "mission:test:district-building-evidence:sample",
  title: "Complete Sample Building Evidence",
  districtName: "Sample",
  programId: "commercial_market_evidence",
  portfolioId: "district-building-evidence:test:sample",
  componentStatuses: {
    commercialMarketEvidence: "Missing",
    evidenceBuildingProfiles: { completed: 0, target: 0, missing: 0 },
    supportingBuildingProfiles: { completed: 0, target: 2, missing: 2 },
  },
};
assert(/Commercial Market Evidence and selected Building Profile work/.test(currentStrategicReason(missingCmeAndProfiles)), "CME-missing plus Building Profile-missing candidates may mention both gaps.");

const completeCmeMissingProfiles = {
  ...missingCmeAndProfiles,
  componentStatuses: {
    commercialMarketEvidence: "Complete",
    evidenceBuildingProfiles: { completed: 0, target: 2, missing: 2 },
    supportingBuildingProfiles: { completed: 0, target: 0, missing: 0 },
  },
};
const completeCmeReason = currentStrategicReason(completeCmeMissingProfiles);
assert(/remaining selected Building Profiles/.test(completeCmeReason), "CME-complete plus Building Profile-missing candidates should mention remaining Building Profiles.");
assert(!/Commercial Market Evidence/.test(completeCmeReason), "CME-complete plus Building Profile-missing candidates should not mention CME work.");

const fullyComplete = {
  ...completeCmeMissingProfiles,
  componentStatuses: {
    commercialMarketEvidence: "Complete",
    evidenceBuildingProfiles: { completed: 2, target: 2, missing: 0 },
    supportingBuildingProfiles: { completed: 0, target: 0, missing: 0 },
  },
};
const fullyCompleteReview = revalidateStrategicMissionCandidate(fullyComplete, runtime);
assert(fullyCompleteReview.suppress, "CME-complete plus Building Profile-complete district candidates should be suppressed.");

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
