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

if (eos.eosVersion !== "editorial-operating-system-v2.2.2") {
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

if (!adminSource.includes("../../data/generated/eos-analysis.json")) {
  fail("/admin/eos must consume the generated EOS snapshot.");
}

if (/require\(|locationKnowledgeGraph|analyzePublisher/.test(adminSource)) {
  fail("/admin/eos should not perform repository analysis at request time.");
}

for (const section of ["Today's Recommended Work", "Metro Health", "Expansion Queue", "Field Mode Queue", "Review Queue", "Commence Work"]) {
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
  "Regenerate required snapshots",
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

for (const serSource of [
  "Mission Debrief",
  "Paste EOS Standardized Execution Report here.",
  "Import Report",
  "Clear",
  "parseStandardizedExecutionReport",
  "missionReviewForReport",
  "reviewRecommendationForReport",
  "Ready for Manual Review",
  "Needs Manual QA",
  "Needs Additional Engineering",
  "Needs Clarification",
  "Implementation Completed",
  "Validation Status",
  "Outstanding Limitations",
  "Suggested Follow-up",
  "Reviewer Notes",
  "Raw Report",
  "data-import-ser",
  "data-clear-ser",
  "data-ser-input",
  "data-mission-review",
]) {
  if (!adminSource.includes(serSource)) fail(`/admin/eos SER v1 support is missing: ${serSource}`);
}

if (/localStorage|sessionStorage|indexedDB|fetch\(/.test(adminSource)) {
  fail("/admin/eos Mission Debrief must remain browser-only and must not add persistence or API calls.");
}

if (!adminSource.includes("Editorial Operating System")) {
  fail("/admin/eos admin page is missing expected dashboard sections.");
}

if (!process.exitCode) {
  console.log("EOS QA passed");
  console.log(`Metros: ${eos.metros.length}`);
  console.log(`Editorial opportunities: ${portfolioQueues.editorialQueue.length}`);
  console.log(`Expansion projects: ${eos.expansionProjects.length}`);
}
