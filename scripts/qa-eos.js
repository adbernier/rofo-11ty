const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const EOS_PATH = path.join(ROOT, "data/generated/eos-analysis.json");
const ADMIN_PATH = path.join(ROOT, "functions/admin/eos.js");

const REQUIRED_SIGNALS = [
  "districtCoverage",
  "representativeBuildings",
  "commercialEcosystem",
  "photography",
  "recommendationConfidence",
  "editorialDepth",
  "internalLinks",
  "handbookIntegration",
];

const AUTOMATION_LEVELS = new Set(["autonomous", "review_required", "human_only"]);
const STATUSES = new Set(["Open", "Ready", "In Progress", "Blocked", "Ready for Review", "Approved", "Completed", "Deferred", "Dismissed"]);
const MODULES = new Set(["publisher", "fieldMode", "compass", "handbook", "knowledgeGraph", "qa"]);
const QUEUES = new Set(["editorial", "expansion", "field_mode", "review"]);
const OPERATING_LANES = new Set(["engineering", "execution_field_mode", "editorial", "qa"]);
const PROVIDERS = new Set(["manual", "codex"]);
const EXPANSION_WORKSTREAMS = new Set(["engineering", "field_mode", "editorial", "publishing_readiness"]);
const EXPANSION_WORKSTREAM_LABELS = new Set(["Engineering Work", "Field Work", "Editorial Work", "Publishing Readiness"]);
const MISSION_CLASSES = new Set(["Foundation", "Readiness Blocker", "Meaningful Depth Improvement", "Refinement", "Maintenance"]);
const EXPECTED_IMPACTS = new Set(["High", "Medium", "Low"]);
const ESTIMATED_EFFORTS = new Set(["Small", "Medium", "Large"]);
const CONFIDENCE_LEVELS = new Set(["High", "Medium", "Low"]);

function fail(message) {
  console.error(`EOS QA error: ${message}`);
  process.exitCode = 1;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Could not read ${path.relative(ROOT, filePath)}: ${error.message}`);
    return null;
  }
}

function validScore(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100;
}

const eos = readJson(EOS_PATH);
const adminSource = fs.existsSync(ADMIN_PATH) ? fs.readFileSync(ADMIN_PATH, "utf8") : "";

if (!eos) process.exit();

if (eos.eosVersion !== "editorial-operating-system-v2.2.4") {
  fail("EOS version is missing or invalid.");
}

if (!Array.isArray(eos.automationLevels) || eos.automationLevels.length !== 3) {
  fail("EOS must expose three reusable automation levels.");
}

if (!Array.isArray(eos.executionProviders) || eos.executionProviders.length < 2) {
  fail("EOS must expose reusable execution providers.");
}

for (const provider of eos.executionProviders || []) {
  if (!PROVIDERS.has(provider.id)) fail(`Unknown execution provider: ${provider.id}`);
}

if (!Array.isArray(eos.taskLifecycle) || eos.taskLifecycle.length < STATUSES.size) {
  fail("EOS must expose the full reusable task lifecycle.");
}

if (!Array.isArray(eos.queues) || eos.queues.length !== 4) {
  fail("EOS must expose four portfolio queues.");
}

for (const queue of eos.queues || []) {
  if (!QUEUES.has(queue.id)) fail(`Unknown EOS queue: ${queue.id}`);
}

if (!Array.isArray(eos.operatingLanes) || eos.operatingLanes.length !== 4) {
  fail("EOS must expose Engineering, Execution / Field Mode, Editorial, and QA operating lanes.");
}

for (const lane of eos.operatingLanes || []) {
  if (!OPERATING_LANES.has(lane.id)) fail(`Unknown operating lane: ${lane.id}`);
}

if (!Array.isArray(eos.executionHandoff) || eos.executionHandoff.map((step) => step.id).join(">") !== "engineering>execution>qa>publish") {
  fail("EOS execution handoff must be Engineering -> Execution -> QA -> Publish.");
}

for (const level of eos.automationLevels || []) {
  if (!AUTOMATION_LEVELS.has(level.id)) {
    fail(`Unknown automation level: ${level.id}`);
  }
}

for (const signal of REQUIRED_SIGNALS) {
  if (!eos.healthModel || !Object.prototype.hasOwnProperty.call(eos.healthModel.weights || {}, signal)) {
    fail(`Health model is missing signal weight: ${signal}`);
  }
}

if (!Array.isArray(eos.metros) || eos.metros.length < 6) {
  fail("EOS must include all Publisher-configured metros.");
}

for (const metro of eos.metros || []) {
  if (!metro.metroId || !metro.metroName) fail("Metro is missing stable identity.");
  if (!validScore(metro.overallEditorialHealth && metro.overallEditorialHealth.score)) {
    fail(`${metro.metroName} has invalid Overall Editorial Health.`);
  }
  if (!metro.status || !metro.status.id || !metro.status.label) {
    fail(`${metro.metroName} is missing EOS status.`);
  }
  for (const signal of REQUIRED_SIGNALS) {
    const value = metro.healthSignals && metro.healthSignals[signal];
    if (!value) fail(`${metro.metroName} is missing health signal: ${signal}`);
    else if (!validScore(value.score)) fail(`${metro.metroName} has invalid score for ${signal}.`);
  }
  if (!metro.publisherConfidence || !validScore(metro.publisherConfidence.score)) {
    fail(`${metro.metroName} is missing Publisher Confidence.`);
  }
  for (const readinessKey of ["knowledgeReadiness", "experienceReadiness"]) {
    const readiness = metro[readinessKey];
    if (!readiness || !readiness.label || !validScore(readiness.score) || !Array.isArray(readiness.sourceSignals) || !readiness.sourceSignals.length) {
      fail(`${metro.metroName} is missing ${readinessKey} interpretation.`);
    }
  }
  if (metro.photographyCoverage && metro.experienceReadiness && !metro.experienceReadiness.sourceSignals.includes("photography")) {
    fail(`${metro.metroName} Experience Readiness should include photography as an experience signal.`);
  }
  if (metro.knowledgeReadiness && metro.knowledgeReadiness.sourceSignals.includes("photography")) {
    fail(`${metro.metroName} Knowledge Readiness should not include photography.`);
  }
}

if (!Array.isArray(eos.workQueue) || eos.workQueue.length === 0) {
  fail("EOS work queue is empty.");
}

if (!eos.portfolioQueues) {
  fail("EOS is missing separated portfolio queues.");
}

const portfolioQueues = eos.portfolioQueues || {};
if (!Array.isArray(portfolioQueues.todaysRecommendedWork) || portfolioQueues.todaysRecommendedWork.length < 5 || portfolioQueues.todaysRecommendedWork.length > 10) {
  fail("Today's Recommended Work should contain approximately 5-10 active items.");
}

if (!Array.isArray(portfolioQueues.editorialQueue) || !portfolioQueues.editorialQueue.length) fail("Editorial Queue is missing.");
if (!Array.isArray(portfolioQueues.expansionQueue) || !portfolioQueues.expansionQueue.length) fail("Expansion Queue is missing.");
if (!Array.isArray(portfolioQueues.fieldModeQueue) || !portfolioQueues.fieldModeQueue.length) fail("Field Mode Queue is missing.");
if (!Array.isArray(portfolioQueues.reviewQueue)) fail("Review Queue must exist even when empty.");

if ((portfolioQueues.editorialQueue || []).some((item) => item.category === "photography" || item.queueType === "field_mode")) {
  fail("Photography must not appear in the Editorial Queue.");
}

if ((portfolioQueues.fieldModeQueue || []).some((item) => !item.remainingTargets || item.executionPacket)) {
  fail("Field Mode Queue should contain summary cards, not individual execution tasks.");
}

if (!portfolioQueues.opportunityInventory || portfolioQueues.opportunityInventory.total < portfolioQueues.todaysRecommendedWork.length) {
  fail("Opportunity Inventory must summarize work hidden from the homepage.");
}

if (!Array.isArray(portfolioQueues.missionQueue) || portfolioQueues.missionQueue.length < portfolioQueues.todaysRecommendedWork.length) {
  fail("EOS must expose a mission queue above raw opportunities.");
}

const missionIds = new Set();
for (const mission of portfolioQueues.missionQueue || []) {
  if (!mission.id || missionIds.has(mission.id)) fail(`Duplicate or missing mission id: ${mission.id}`);
  missionIds.add(mission.id);
  if (mission.category !== "mission") fail(`${mission.id} should use mission category.`);
  if (!MISSION_CLASSES.has(mission.missionClass)) fail(`${mission.id} has invalid mission class: ${mission.missionClass}`);
  if (!EXPECTED_IMPACTS.has(mission.expectedImpact)) fail(`${mission.id} has invalid expected impact: ${mission.expectedImpact}`);
  if (!ESTIMATED_EFFORTS.has(mission.estimatedEffort)) fail(`${mission.id} has invalid estimated effort: ${mission.estimatedEffort}`);
  if (!CONFIDENCE_LEVELS.has(mission.confidence)) fail(`${mission.id} has invalid confidence: ${mission.confidence}`);
  if (!Array.isArray(mission.includedOpportunityIds) || !mission.includedOpportunityIds.length) fail(`${mission.id} is missing included opportunity ids.`);
  if (!Array.isArray(mission.includedTasks) || mission.includedTasks.length !== mission.includedOpportunityIds.length) fail(`${mission.id} included task details do not match opportunity ids.`);
  if (!Array.isArray(mission.deferredTasks)) fail(`${mission.id} must expose deferred tasks explicitly.`);
  if (!mission.currentConstraint) fail(`${mission.id} is missing current constraint.`);
  if (!mission.impactEffortClass || !mission.impactEffortClass.includes(mission.expectedImpact) || !mission.impactEffortClass.includes(mission.estimatedEffort)) {
    fail(`${mission.id} is missing deterministic impact/effort class.`);
  }
  if (!mission.executionPacket) fail(`${mission.id} is missing bundled execution packet.`);
  if (mission.executionPacket && (!Array.isArray(mission.executionPacket.includedTasks) || !mission.executionPacket.includedTasks.length)) {
    fail(`${mission.id} execution packet must include bundled tasks.`);
  }
  if (mission.executionPacket && !Array.isArray(mission.executionPacket.deferredTasks)) {
    fail(`${mission.id} execution packet must include deferred work.`);
  }
  if (mission.executionPacket && !(mission.executionPacket.qaCommands || []).includes("npm run publisher:snapshot")) {
    fail(`${mission.id} execution packet must instruct Publisher snapshot regeneration.`);
  }
  if ((mission.deferredTasks || []).some((task) => task.suggestedModule && task.suggestedModule.id === "fieldMode") && !mission.rationale.join(" ").includes("Deferred")) {
    fail(`${mission.id} should explain deferred Field Mode or out-of-scope work.`);
  }
}

const bundledMission = (portfolioQueues.missionQueue || []).find((mission) => (mission.includedOpportunityIds || []).length > 1);
if (!bundledMission) fail("Related micro-opportunities should form at least one bundled mission.");
if ((bundledMission.includedTasks || []).some((task) => task.suggestedModule && task.suggestedModule.id === "fieldMode")) {
  fail("Photography must not be silently bundled into an engineering/editorial mission.");
}

const todaysMissions = portfolioQueues.todaysRecommendedWork || [];
if (todaysMissions.some((item) => item.category !== "mission")) {
  fail("Today's Recommended Work should prioritize missions, not raw micro-tasks.");
}
const refinementBeforeFoundation = todaysMissions.findIndex((item) => item.missionClass === "Refinement") > -1
  && todaysMissions.findIndex((item) => item.missionClass === "Foundation" || item.missionClass === "Readiness Blocker") > todaysMissions.findIndex((item) => item.missionClass === "Refinement");
if (refinementBeforeFoundation) fail("Low-impact refinement should not outrank foundation or blocker missions in Today's Work.");

const ids = new Set();
for (const item of eos.workQueue || []) {
  if (!item.id || ids.has(item.id)) fail(`Duplicate or missing work item id: ${item.id}`);
  ids.add(item.id);
  if (!item.metroId || !item.metroName) fail(`${item.id} is missing metro identity.`);
  if (!item.title) fail(`${item.id} is missing title.`);
  if (!validScore(item.priorityScore)) fail(`${item.id} has invalid priority score.`);
  if (!item.priorityStars || item.priorityStars < 1 || item.priorityStars > 5) fail(`${item.id} has invalid priority stars.`);
  if (!item.automationLevel || !AUTOMATION_LEVELS.has(item.automationLevel.id)) fail(`${item.id} has invalid automation level.`);
  if (!item.queueType || !QUEUES.has(item.queueType)) fail(`${item.id} has invalid queue type.`);
  if (!item.operatingLane || !OPERATING_LANES.has(item.operatingLane.id)) fail(`${item.id} has invalid operating lane.`);
  if (!item.estimatedEffort) fail(`${item.id} is missing estimated effort.`);
  if (!item.expectedEditorialImpact) fail(`${item.id} is missing expected editorial impact.`);
  if (!STATUSES.has(item.status)) fail(`${item.id} has invalid status: ${item.status}`);
  if (!item.suggestedModule || !MODULES.has(item.suggestedModule.id)) fail(`${item.id} has invalid suggested module.`);
  if (!Array.isArray(item.why) || item.why.length === 0) fail(`${item.id} does not explain why it exists.`);
  if (!item.executionPacket) fail(`${item.id} is missing execution packet.`);
  if (item.executionPacket && Array.isArray(item.executionPacket.subtasks)) fail(`${item.id} should not create premature subtasks.`);
  if (item.executionPacket && (!Array.isArray(item.executionPacket.handoff) || item.executionPacket.handoff.map((step) => step.id).join(">") !== "engineering>execution>qa>publish")) {
    fail(`${item.id} has invalid execution handoff.`);
  }
  if (item.executionPacket && (!Array.isArray(item.executionPacket.providers) || !item.executionPacket.providers.length)) {
    fail(`${item.id} has no execution providers.`);
  }
}

if (!(eos.workQueue || []).some((item) => item.automationLevel && item.automationLevel.id === "autonomous")) {
  fail("EOS should expose future autonomous candidates without implementing generation.");
}

if (!Array.isArray(eos.expansionProjects) || eos.expansionProjects.length < 3) {
  fail("EOS must expose metro expansion projects.");
}

for (const project of eos.expansionProjects || []) {
  if (!project.metroId || !project.metroName) fail("Expansion project missing metro identity.");
  if (!validScore(project.overallProgress)) fail(`${project.metroName} expansion project has invalid progress.`);
  if (!project.investmentScore || !validScore(project.investmentScore.score)) fail(`${project.metroName} expansion project has invalid Investment Score.`);
  if (!Array.isArray(project.workstreams) || project.workstreams.length !== EXPANSION_WORKSTREAMS.size) {
    fail(`${project.metroName} expansion project must combine engineering, field, editorial, and publishing readiness workstreams.`);
  }
  for (const stream of project.workstreams || []) {
    if (!EXPANSION_WORKSTREAMS.has(stream.id)) fail(`${project.metroName} expansion project has unknown workstream: ${stream.id}`);
    if (!EXPANSION_WORKSTREAM_LABELS.has(stream.label)) fail(`${project.metroName} expansion project has invalid workstream label: ${stream.label}`);
    if (!validScore(stream.progress)) fail(`${project.metroName} expansion workstream has invalid progress: ${stream.id}`);
    if (!["open", "active", "completed"].includes(stream.status)) fail(`${project.metroName} expansion workstream has invalid status: ${stream.id}`);
  }
  const stageIds = (project.stages || []).map((stage) => stage.id);
  for (const required of ["candidate", "research", "knowledge_graph", "representative_buildings", "editorial_draft", "recommendations", "compass", "qa", "publishing_ready", "live"]) {
    if (!stageIds.includes(required)) fail(`${project.metroName} expansion project is missing stage: ${required}`);
  }
}

const seattleExpansionProject = (eos.expansionProjects || []).find((project) => project.metroId === "seattle");
if (seattleExpansionProject && seattleExpansionProject.status !== "publishing_ready") {
  fail("Seattle expansion project should advance to Publishing Ready when Publisher and Compass evidence are complete.");
}

if (!adminSource.includes("../../data/generated/eos-analysis.json")) {
  fail("/admin/eos must consume the generated EOS snapshot.");
}

if (/require\(|analyzePublisher\(/.test(adminSource) || /from\s+["'][^"']*locationKnowledgeGraph/.test(adminSource)) {
  fail("/admin/eos should not perform repository analysis at request time.");
}

for (const section of ["Mission Control", "Current Focus", "Focus Today", "Show All Missions", "Metro Health", "Expansion Queue", "Field Mode Queue", "Review Queue", "Mission Archive", "Commence Work"]) {
  if (!adminSource.includes(section)) fail(`/admin/eos is missing section or action: ${section}`);
}

if (!adminSource.includes("executionHandoff") || !adminSource.includes("renderHandoffSummary")) {
  fail("/admin/eos must render the execution handoff.");
}

if (!adminSource.includes("workstream-list") || !adminSource.includes("project.workstreams")) {
  fail("/admin/eos must render expansion project workstreams.");
}

for (const promptSource of [
  "codexPromptForTask",
  "Copy Codex Prompt",
  "Prompt Preview",
  "EOS Standardized Execution Report v1",
  "docs/product/rofo-master-plan.md",
  "Relevant architecture documentation",
  "Current health",
  "Relevant files",
  "Acceptance criteria",
  "Expected deliverables",
  "QA commands",
  "Required review",
  "Scope constraints",
  "Inspect the current repository state",
  "Verify this task remains valid against the current generated data",
  "Preserve Publisher, Compass, EOS, Field Mode, Knowledge Graph, and editorial ownership boundaries",
  "Run npm run publisher:snapshot",
  "Included tasks",
  "Deferred work",
  "Reason for bundling",
  "Complete the coherent mission",
  "Avoid deferred work",
  "Verify each included opportunity remains valid",
  "Do not broaden scope beyond this execution packet",
  "Return your final implementation using the following format exactly",
  "Architecture Discovery",
  "Implementation Summary",
  "Files Changed",
  "Results",
  "Validation",
  "Remaining Limitations",
  "Recommended Next Highest-Leverage Improvement",
  "After copying, run",
  "navigator.clipboard.writeText",
  "data-copy-prompt",
  "data-codex-prompt",
]) {
  if (!adminSource.includes(promptSource)) fail(`/admin/eos Codex prompt handoff is missing: ${promptSource}`);
}

for (const adminMissionSource of [
  "missionQueue",
  "Why this mission",
  "Included work",
  "Deferred work",
  "Dependencies",
  "Knowledge Readiness",
  "Experience Readiness",
  "Publisher state, Knowledge Readiness, Experience Readiness, and Recommendation Coverage",
  "currentFocusSummary",
  "missionArchive",
  "Current Stage",
  "Remaining Milestones",
  "Expected Remaining Missions",
]) {
  if (!adminSource.includes(adminMissionSource)) fail(`/admin/eos mission presentation is missing: ${adminMissionSource}`);
}

for (const serSource of [
  "Mission Debrief",
  "Paste EOS Standardized Execution Report here.",
  "Import Report",
  "Clear",
  "parseStandardizedExecutionReport",
  "missionReviewForReport",
  "reviewRecommendationForReport",
  "mission-review__hero",
  "Mission Status",
  "Publisher Outcome",
  "Ready for Manual Review",
  "Needs Manual QA",
  "Needs Additional Engineering",
  "Needs Clarification",
  "Objective Satisfied",
  "Validation Outcome",
  "Current Constraint",
  "Outstanding Limitations",
  "Why this recommendation",
  "Measurable Improvement",
  "extractMeasurableImprovements",
  "data-improvement-panel",
  "details class=\"ser-section\"",
  "data-review-status",
  "Reviewer Notes",
  "Raw Report",
  "data-import-ser",
  "data-clear-ser",
  "data-ser-input",
  "data-mission-review",
]) {
  if (!adminSource.includes(serSource)) fail(`/admin/eos SER v1 support is missing: ${serSource}`);
}

if (adminSource.includes("Suggested Follow-up")) {
  fail("/admin/eos Mission Review should label the follow-up field as Current Constraint.");
}

if (/localStorage|sessionStorage|indexedDB|fetch\(/.test(adminSource)) {
  fail("/admin/eos Mission Debrief must remain browser-only and must not add persistence or API calls.");
}

if (!adminSource.includes("Mission Control")) {
  fail("/admin/eos admin page is missing expected Mission Control sections.");
}

if (!process.exitCode) {
  console.log("EOS QA passed");
  console.log(`Metros: ${eos.metros.length}`);
  console.log(`Editorial opportunities: ${portfolioQueues.editorialQueue.length}`);
  console.log(`Expansion projects: ${eos.expansionProjects.length}`);
}
