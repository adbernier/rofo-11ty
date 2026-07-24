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
const STATUSES = new Set(["Open", "Research", "Blocked", "Done"]);
const MODULES = new Set(["publisher", "fieldMode", "compass", "handbook", "knowledgeGraph", "qa"]);

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

if (eos.eosVersion !== "editorial-operating-system-v1") {
  fail("EOS version is missing or invalid.");
}

if (!Array.isArray(eos.automationLevels) || eos.automationLevels.length !== 3) {
  fail("EOS must expose three reusable automation levels.");
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

const ids = new Set();
for (const item of eos.workQueue || []) {
  if (!item.id || ids.has(item.id)) fail(`Duplicate or missing work item id: ${item.id}`);
  ids.add(item.id);
  if (!item.metroId || !item.metroName) fail(`${item.id} is missing metro identity.`);
  if (!item.title) fail(`${item.id} is missing title.`);
  if (!validScore(item.priorityScore)) fail(`${item.id} has invalid priority score.`);
  if (!item.priorityStars || item.priorityStars < 1 || item.priorityStars > 5) fail(`${item.id} has invalid priority stars.`);
  if (!item.automationLevel || !AUTOMATION_LEVELS.has(item.automationLevel.id)) fail(`${item.id} has invalid automation level.`);
  if (!item.estimatedEffort) fail(`${item.id} is missing estimated effort.`);
  if (!item.expectedEditorialImpact) fail(`${item.id} is missing expected editorial impact.`);
  if (!STATUSES.has(item.status)) fail(`${item.id} has invalid status: ${item.status}`);
  if (!item.suggestedModule || !MODULES.has(item.suggestedModule.id)) fail(`${item.id} has invalid suggested module.`);
  if (!Array.isArray(item.why) || item.why.length === 0) fail(`${item.id} does not explain why it exists.`);
}

if (!(eos.workQueue || []).some((item) => item.automationLevel && item.automationLevel.id === "human_only" && item.suggestedModule.id === "fieldMode")) {
  fail("EOS should expose Human Only Field Mode photography work.");
}

if (!(eos.workQueue || []).some((item) => item.automationLevel && item.automationLevel.id === "autonomous")) {
  fail("EOS should expose future autonomous candidates without implementing generation.");
}

if (!adminSource.includes("../../data/generated/eos-analysis.json")) {
  fail("/admin/eos must consume the generated EOS snapshot.");
}

if (/require\(|locationKnowledgeGraph|analyzePublisher/.test(adminSource)) {
  fail("/admin/eos should not perform repository analysis at request time.");
}

if (!adminSource.includes("Editorial Operating System") || !adminSource.includes("Priority Work Queue")) {
  fail("/admin/eos admin page is missing expected dashboard sections.");
}

if (!process.exitCode) {
  console.log("EOS QA passed");
  console.log(`Metros: ${eos.metros.length}`);
  console.log(`Work items: ${eos.workQueue.length}`);
}
