const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const EOS_PATH = path.join(ROOT, "data/generated/eos-analysis.json");
const PUBLISHER_PATH = path.join(ROOT, "data/generated/publisher-analysis.json");
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
const MISSION_SIZES = new Set(["Small", "Standard", "Large"]);
const CONFIDENCE_LEVELS = new Set(["High", "Medium", "Low"]);
const MARKET_PROGRAMS = new Set(["publisher", "commercial_market_evidence", "building_profiles", "photography", "recommendation_qa", "knowledge_graph"]);
const PORTFOLIO_RESOLUTION_SCHEMA_VERSION = "eos-portfolio-resolution-v1";
const BUILDING_PROFILE_PORTFOLIO_MAX_ITEMS = 12;
const SAN_FRANCISCO_CANONICAL_DISTRICTS = [
  "design-district",
  "dogpatch",
  "financial-district",
  "jackson-square",
  "mission-bay",
  "mission-district",
  "potrero-hill",
  "showplace-square",
  "soma",
  "south-beach",
];

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
const publisher = readJson(PUBLISHER_PATH);
const adminSource = fs.existsSync(ADMIN_PATH) ? fs.readFileSync(ADMIN_PATH, "utf8") : "";
const locationKnowledgeGraph = require("../_data/locationKnowledgeGraph");
const commercialMarketEvidence = require("../_data/commercialMarketEvidence");

if (!eos || !publisher) process.exit();

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

const publisherMarketEvidence = publisher.analysis && publisher.analysis.commercialMarketEvidence;
if (!publisherMarketEvidence || publisherMarketEvidence.schemaVersion !== "commercial-market-evidence-platform-v1") {
  fail("Publisher snapshot must expose the Commercial Market Evidence platform summary.");
}

if (publisherMarketEvidence && (!publisherMarketEvidence.scoringImpact || !publisherMarketEvidence.scoringImpact.includes("scoring"))) {
  fail("Commercial Market Evidence platform summary must state that Publisher scoring is unchanged.");
}

const eosMarketEvidence = eos.platformServices && eos.platformServices.commercialMarketEvidence;
if (!eosMarketEvidence || eosMarketEvidence.service !== "Commercial Market Evidence") {
  fail("EOS must expose Commercial Market Evidence as a first-class platform service.");
}

if (eosMarketEvidence && !String(eosMarketEvidence.planningImpact || "").includes("marketProjection resolves missing collections")) {
  fail("Commercial Market Evidence platform health must route executable planning through EOS marketProjection.");
}

const marketEvidenceExpansion = eosMarketEvidence && eosMarketEvidence.expansion;
const knowledgeGraphDistrictCount = (locationKnowledgeGraph || []).filter((node) => node && node.type === "district").length;
const canonicalDistricts = (locationKnowledgeGraph || []).filter((node) => node && node.type === "district");
const collectionCount = ((commercialMarketEvidence && commercialMarketEvidence.collections) || []).length;
if (!marketEvidenceExpansion || marketEvidenceExpansion.schemaVersion !== "commercial-market-evidence-expansion-v1") {
  fail("EOS must expose Commercial Market Evidence expansion planning.");
}

for (const district of canonicalDistricts) {
  if (district.recommendationEligible !== true) {
    fail(`Canonical district must be recommendation-eligible unless explicitly removed by a focused recommendation sprint: ${district.slug}`);
  }
  if (!district.commercialGeography || district.commercialGeography.canonicalDistrict !== true) {
    fail(`Canonical district must expose commercial geography metadata: ${district.slug}`);
  }
}

if (marketEvidenceExpansion) {
  const coverage = marketEvidenceExpansion.coverageSummary || {};
  if (coverage.knowledgeGraphDistricts !== knowledgeGraphDistrictCount) {
    fail("Commercial Market Evidence expansion must compare against all Knowledge Graph districts.");
  }
  if (coverage.existingCollections !== collectionCount) {
    fail("Commercial Market Evidence expansion must recognize all existing collections.");
  }
  if (coverage.missingCollections !== Math.max(knowledgeGraphDistrictCount - collectionCount, 0)) {
    fail("Commercial Market Evidence expansion missing-collection count is inconsistent.");
  }
  if (!Array.isArray(marketEvidenceExpansion.suggestedExpansionOrder) || !marketEvidenceExpansion.suggestedExpansionOrder.length) {
    fail("Commercial Market Evidence expansion must expose a deterministic suggested expansion order.");
  }
  if (!String(marketEvidenceExpansion.executionImpact || "").includes("executable Commercial Market Evidence Program Mission")) {
    fail("Commercial Market Evidence expansion must document executable Program Mission projection.");
  }
  if (!String(marketEvidenceExpansion.qualityMeasurement || "").includes("Deferred")) {
    fail("Commercial Market Evidence expansion must defer quality measurement in v1.");
  }

  const resolvedOwnershipByDistrict = new Map(((marketEvidenceExpansion.ownershipResolution || {}).resolvedDistricts || []).map((district) => [district.districtId, district]));
  const unresolvedOwnership = new Set(((marketEvidenceExpansion.ownershipResolution || {}).unresolvedDistricts || []).map((district) => district.districtId));
  const ambiguousOwnership = new Set(((marketEvidenceExpansion.ownershipResolution || {}).ambiguousDistricts || []).map((district) => district.districtId));
  for (const district of canonicalDistricts) {
    const resolved = resolvedOwnershipByDistrict.get(district.slug);
    if (!resolved || unresolvedOwnership.has(district.slug) || ambiguousOwnership.has(district.slug)) {
      fail(`Canonical district must resolve to exactly one operational market before CME planning can execute: ${district.slug}`);
    }
  }
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

if ((eos.workQueue || []).some((item) => /Commercial Market Evidence|Market Evidence/.test(JSON.stringify(item)))) {
  fail("Commercial Market Evidence must not generate Mission Control work items in v1.");
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
  if (!mission.marketId || mission.marketId !== mission.metroId) fail(`${mission.id} is missing market association.`);
  if (!mission.programId || !MARKET_PROGRAMS.has(mission.programId)) fail(`${mission.id} has invalid program association: ${mission.programId}`);
  if (!mission.campaignId || !mission.campaignTitle) fail(`${mission.id} is missing campaign association.`);
  if (!mission.initiativeId || !mission.initiativeTitle) fail(`${mission.id} is missing initiative association.`);
  if (!MISSION_CLASSES.has(mission.missionClass)) fail(`${mission.id} has invalid mission class: ${mission.missionClass}`);
  if (!EXPECTED_IMPACTS.has(mission.expectedImpact)) fail(`${mission.id} has invalid expected impact: ${mission.expectedImpact}`);
  if (!ESTIMATED_EFFORTS.has(mission.estimatedEffort)) fail(`${mission.id} has invalid estimated effort: ${mission.estimatedEffort}`);
  if (!mission.missionSize || !MISSION_SIZES.has(mission.missionSize.label) || !mission.missionSize.reviewWindow) fail(`${mission.id} has invalid mission size.`);
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
  if (mission.executionPacket && (!mission.executionPacket.missionSize || mission.executionPacket.missionSize.label !== mission.missionSize.label)) {
    fail(`${mission.id} execution packet must retain mission-size context.`);
  }
  if ((mission.deferredTasks || []).some((task) => task.suggestedModule && task.suggestedModule.id === "fieldMode") && !mission.rationale.join(" ").includes("Deferred")) {
    fail(`${mission.id} should explain deferred Field Mode or out-of-scope work.`);
  }
}

const marketProjection = eos.marketProjection || {};
if (marketProjection.schemaVersion !== "mission-control-v2-market-projection-v2") {
  fail("EOS must expose the Mission Control v2 market projection.");
}

const portfolioResolution = eos.portfolioResolution || {};
if (portfolioResolution.schemaVersion !== PORTFOLIO_RESOLUTION_SCHEMA_VERSION) {
  fail("EOS must expose the Portfolio Resolver v1 output.");
}

const buildingProfileResolution = portfolioResolution.programs && portfolioResolution.programs.buildingProfiles;
if (!buildingProfileResolution || buildingProfileResolution.resolverId !== "building-profile-portfolio-resolver-v1") {
  fail("EOS must expose the Building Profile Portfolio Resolver v1 output.");
}

if (!buildingProfileResolution.summary || buildingProfileResolution.summary.executablePortfolios < 1) {
  fail("Building Profile Portfolio Resolver must produce at least one real executable portfolio.");
}

if (!Array.isArray(buildingProfileResolution.ungroupedItems)) {
  fail("Building Profile Portfolio Resolver must preserve ungrouped fallback items.");
}

const workQueueById = new Map((eos.workQueue || []).map((item) => [item.id, item]));
const portfolioIds = new Set();
const portfolioWorkItemIds = new Set();
for (const portfolio of buildingProfileResolution.portfolios || []) {
  if (!portfolio.portfolioId || portfolioIds.has(portfolio.portfolioId)) fail(`Duplicate or missing Building Profile portfolio id: ${portfolio.portfolioId}`);
  portfolioIds.add(portfolio.portfolioId);
  if (portfolio.programId !== "building_profiles") fail(`${portfolio.portfolioId} must belong to the Building Profiles Program.`);
  if (!portfolio.marketId || !portfolio.campaignId || !portfolio.districtId || !portfolio.ecosystem) fail(`${portfolio.portfolioId} is missing market, campaign, district, or ecosystem.`);
  if (!Array.isArray(portfolio.workItems) || portfolio.workItems.length !== portfolio.workItemCount) fail(`${portfolio.portfolioId} has inconsistent Work Item count.`);
  if (portfolio.workItemCount > BUILDING_PROFILE_PORTFOLIO_MAX_ITEMS) fail(`${portfolio.portfolioId} exceeds the configured Building Profile portfolio upper bound.`);
  if (!MISSION_SIZES.has(portfolio.missionSize && portfolio.missionSize.label)) fail(`${portfolio.portfolioId} has invalid mission size.`);
  if (!portfolio.estimatedReviewability || !Array.isArray(portfolio.groupingRationale) || !portfolio.groupingRationale.length) fail(`${portfolio.portfolioId} must explain grouping and reviewability.`);
  if (!Array.isArray(portfolio.validationPath) || !portfolio.validationPath.includes("node scripts/qa-building-brief-depth.js")) fail(`${portfolio.portfolioId} must carry the Building Brief validation path.`);
  for (const workItem of portfolio.workItems || []) {
    if (portfolioWorkItemIds.has(workItem.id)) fail(`Building Profile Work Item appears in multiple active portfolios: ${workItem.id}`);
    portfolioWorkItemIds.add(workItem.id);
    const sourceItem = workQueueById.get(workItem.id);
    if (!sourceItem || sourceItem.category !== "buildingBriefs") fail(`${portfolio.portfolioId} includes a Work Item that is not an active Building Brief gap: ${workItem.id}`);
    if (!workItem.buildingName || !workItem.buildingPath) fail(`${portfolio.portfolioId} includes a building Work Item without canonical identity.`);
  }
}

if (!Array.isArray(marketProjection.hierarchy) || marketProjection.hierarchy.join(">") !== "Markets>Programs>Campaigns>Initiatives>Missions>Execution Packets>Work Items") {
  fail("Mission Control v2 projection must use Markets -> Programs -> Campaigns -> Initiatives -> Missions -> Execution Packets -> Work Items.");
}

if (!marketProjection.workItems || marketProjection.workItems.hiddenByDefault !== true) {
  fail("Mission Control v2 projection must keep work items hidden by default.");
}

if (!Array.isArray(marketProjection.markets) || marketProjection.markets.length < (eos.metros || []).length) {
  fail("Mission Control v2 projection must include every Publisher-backed EOS market.");
}

for (const metro of eos.metros || []) {
  if (!(marketProjection.markets || []).some((market) => market.id === metro.metroId)) {
    fail(`Mission Control v2 projection is missing Publisher-backed market: ${metro.metroId}`);
  }
}

const projectedMissionIds = new Set((marketProjection.missions || []).map((mission) => mission.id));
for (const missionId of missionIds) {
  if (!projectedMissionIds.has(missionId)) fail(`Mission Control v2 projection is missing mission: ${missionId}`);
}

if (!Array.isArray(marketProjection.campaigns) || !marketProjection.campaigns.length) {
  fail("Mission Control v2 projection must expose campaign progress objects.");
}

const projectedCampaignIds = new Set();
for (const campaign of marketProjection.campaigns || []) {
  if (!campaign.id || projectedCampaignIds.has(campaign.id)) fail(`Duplicate or missing projected Campaign id: ${campaign.id}`);
  projectedCampaignIds.add(campaign.id);
  if (!campaign.marketId || !campaign.programId || !campaign.title || !campaign.progress) fail(`${campaign.id} is missing market, program, title, or progress.`);
  if (!Array.isArray(campaign.initiatives) || !Array.isArray(campaign.missions)) fail(`${campaign.id} must expose Initiative and Mission references.`);
  if (!campaign.workItems || campaign.workItems.hiddenByDefault !== true) fail(`${campaign.id} must keep Work Items hidden by default.`);
  if (!campaign.sizingStrategy || !campaign.reviewabilityPrinciple) fail(`${campaign.id} must document sizing and reviewability.`);
}

if ((marketProjection.missions || []).some((mission) => !mission.marketId || !mission.programId || !mission.campaignId || !mission.initiativeId || !mission.executionPacketRef || mission.executionPacketAvailable !== true)) {
  fail("Every projected mission must include market, program, campaign, initiative, and execution-packet reference data.");
}

for (const market of marketProjection.markets || []) {
  if (!market.id || !market.label) fail("Projected market is missing identity.");
  if (!market.knowledgeReadiness || !market.experienceReadiness) fail(`${market.label} projection must retain Knowledge and Experience readiness.`);
  const programIds = new Set((market.programs || []).map((program) => program.id));
  for (const programId of MARKET_PROGRAMS) {
    if (!programIds.has(programId)) fail(`${market.label} projection is missing program: ${programId}`);
  }
  for (const program of market.programs || []) {
    if (!MARKET_PROGRAMS.has(program.id)) fail(`${market.label} has invalid projected program: ${program.id}`);
    if (!program.status || !program.progress || !program.currentConstraint) fail(`${market.label} ${program.id} projection is missing status, progress, or constraint.`);
    if (!Array.isArray(program.campaigns) || program.campaigns.length !== 1) fail(`${market.label} ${program.id} must expose one Campaign progress object.`);
    const campaign = program.campaigns[0];
    if (campaign.marketId !== market.id || campaign.programId !== program.id || !projectedCampaignIds.has(campaign.id)) fail(`${market.label} ${program.id} has an inconsistent Campaign projection.`);
    if (!Array.isArray(program.initiatives) || !program.initiatives.length) fail(`${market.label} ${program.id} must project at least one initiative.`);
    for (const initiative of program.initiatives || []) {
      if (initiative.marketId !== market.id || initiative.programId !== program.id) fail(`${market.label} has initiative with inconsistent market or program association.`);
      if (initiative.campaignId && initiative.campaignId !== campaign.id) fail(`${market.label} has initiative with inconsistent Campaign association.`);
      if (!initiative.id || !initiative.title || !initiative.progress) fail(`${market.label} has incomplete initiative projection.`);
      for (const mission of initiative.missions || []) {
        if (mission.marketId !== market.id || mission.programId !== program.id || mission.campaignId !== campaign.id || mission.initiativeId !== initiative.id) {
          fail(`${mission.id} projection has inconsistent market, program, Campaign, or initiative association.`);
        }
        if (!mission.workItems || mission.workItems.hiddenByDefault !== true) fail(`${mission.id} must keep included work items hidden by default.`);
      }
    }
  }
}

if (!Array.isArray(marketProjection.initiatives) || !marketProjection.initiatives.length) {
  fail("Mission Control v2 projection must expose a flat initiative index.");
}

if (!Array.isArray(marketProjection.programs) || marketProjection.programs.length !== MARKET_PROGRAMS.size) {
  fail("Mission Control v2 projection must expose reusable program definitions.");
}

const cmeMissions = (portfolioQueues.missionQueue || []).filter((mission) => mission.programId === "commercial_market_evidence");
if (!cmeMissions.length) {
  fail("Commercial Market Evidence must project at least one executable Program Mission.");
}
const buildingProfileMissions = (portfolioQueues.missionQueue || []).filter((mission) => mission.programId === "building_profiles");

const cmeMissionIds = new Set();
for (const mission of cmeMissions) {
  if (cmeMissionIds.has(mission.id)) fail(`Duplicate Commercial Market Evidence mission id: ${mission.id}`);
  cmeMissionIds.add(mission.id);
  if (!mission.initiativeId || !mission.initiativeTitle) fail(`${mission.id} is missing Initiative association.`);
  if (!mission.executionPacket) fail(`${mission.id} is missing an Execution Packet.`);
  if (!mission.workItems || mission.workItems.hiddenByDefault !== true || mission.workItems.count < 1) {
    fail(`${mission.id} must hide evidence-record work items inside the mission.`);
  }
  if (!String(mission.title || "").includes("Commercial Market Evidence collection")) {
    fail(`${mission.id} must be a bounded district collection mission.`);
  }
  if ((mission.executionPacket.qaCommands || []).indexOf("node scripts/qa-commercial-market-evidence.js") === -1) {
    fail(`${mission.id} must run the Commercial Market Evidence validator.`);
  }
}

const initiativeIds = new Set();
const cmeInitiativeByDistrict = new Map();
for (const initiative of marketProjection.initiatives || []) {
  if (initiativeIds.has(initiative.id)) fail(`Duplicate projected Initiative id: ${initiative.id}`);
  initiativeIds.add(initiative.id);
  if (initiative.programId === "commercial_market_evidence" && initiative.districtId) {
    const districtId = initiative.districtId || String(initiative.id).split(":").pop();
    if (cmeInitiativeByDistrict.has(districtId)) {
      fail(`Commercial Market Evidence district Initiative appears in multiple markets: ${districtId}`);
    }
    cmeInitiativeByDistrict.set(districtId, initiative);
  }
}

const sanFranciscoMarket = (marketProjection.markets || []).find((market) => market.id === "san-francisco");
const sanFranciscoCmeProgram = sanFranciscoMarket && (sanFranciscoMarket.programs || []).find((program) => program.id === "commercial_market_evidence");
const sanFranciscoCanonicalDistricts = canonicalDistricts
  .filter((district) => district.operationalMarketId === "san-francisco")
  .map((district) => district.slug)
  .sort();
if (sanFranciscoCanonicalDistricts.join("|") !== SAN_FRANCISCO_CANONICAL_DISTRICTS.join("|")) {
  fail(`San Francisco canonical district inventory changed unexpectedly: ${sanFranciscoCanonicalDistricts.join(", ")}`);
}
if (!sanFranciscoCmeProgram) {
  fail("San Francisco must expose a Commercial Market Evidence Program.");
} else {
  const cmeProgress = sanFranciscoCmeProgram.progress || {};
  if (cmeProgress.completed !== SAN_FRANCISCO_CANONICAL_DISTRICTS.length || cmeProgress.target !== SAN_FRANCISCO_CANONICAL_DISTRICTS.length) {
    fail(`San Francisco Commercial Market Evidence must measure all canonical districts; expected ${SAN_FRANCISCO_CANONICAL_DISTRICTS.length}/${SAN_FRANCISCO_CANONICAL_DISTRICTS.length}, got ${cmeProgress.completed}/${cmeProgress.target}.`);
  }
  if (String(cmeProgress.statusLabel || "") !== "Complete") {
    fail("San Francisco Commercial Market Evidence must report Complete when all canonical district collections exist.");
  }
  const sfExistingCollections = (marketEvidenceExpansion.existingCollections || []).filter((district) => district.marketId === "san-francisco");
  const sfMissingCollections = (marketEvidenceExpansion.missingCollections || []).filter((district) => district.marketId === "san-francisco");
  if (sfExistingCollections.length !== SAN_FRANCISCO_CANONICAL_DISTRICTS.length || sfMissingCollections.length !== 0) {
    fail(`San Francisco CME denominator must be canonical district count; found ${sfExistingCollections.length} existing and ${sfMissingCollections.length} missing.`);
  }
  for (const districtId of SAN_FRANCISCO_CANONICAL_DISTRICTS) {
    const initiativeId = `san-francisco:commercial_market_evidence:${districtId}`;
    if (!(sanFranciscoCmeProgram.initiatives || []).some((initiative) => initiative.id === initiativeId)) {
      fail(`San Francisco CME Program must expose canonical district Initiative: ${districtId}`);
    }
  }
  const financialDistrict = (sanFranciscoCmeProgram.initiatives || []).find((initiative) => initiative.id === "san-francisco:commercial_market_evidence:financial-district");
  if (!financialDistrict || financialDistrict.status !== "Complete" || financialDistrict.nextMissionId) {
    fail("Financial District must be recognized as a completed Commercial Market Evidence Initiative without an executable mission.");
  }
  const expectedNext = (marketEvidenceExpansion.suggestedExpansionOrder || []).find((district) => district.metroId === "san-francisco");
  const nextInitiative = (sanFranciscoCmeProgram.initiatives || []).find((initiative) => initiative.status === "Next");
  if (expectedNext) {
    if (!nextInitiative || nextInitiative.id !== `san-francisco:commercial_market_evidence:${expectedNext.districtId}`) {
      fail("San Francisco Commercial Market Evidence next Initiative must follow deterministic expansion ordering.");
    }
    if (!nextInitiative.nextMissionId || !cmeMissionIds.has(nextInitiative.nextMissionId)) {
      fail("San Francisco Commercial Market Evidence next Initiative must map to one executable Mission.");
    }
    if (nextInitiative.id.includes("west-berkeley")) {
      fail("West Berkeley must not be assigned to the San Francisco Market Workspace.");
    }
    const nextProjectedMission = (nextInitiative.missions || [])[0];
    if (!nextProjectedMission || nextProjectedMission.initiativeId !== nextInitiative.id || nextProjectedMission.executionPacketAvailable !== true) {
      fail("San Francisco Commercial Market Evidence Mission must map back to the Initiative and Execution Packet.");
    }
  } else {
    if (nextInitiative) {
      fail("San Francisco Commercial Market Evidence must not expose a next Initiative when all tracked district collections are complete.");
    }
    const incompleteInitiative = (sanFranciscoCmeProgram.initiatives || []).find((initiative) => initiative.status !== "Complete");
    if (incompleteInitiative) {
      fail("San Francisco Commercial Market Evidence must mark all tracked district Initiatives complete when no San Francisco collection is missing.");
    }
  }
}

const sanFranciscoBuildingProfilesProgram = sanFranciscoMarket && (sanFranciscoMarket.programs || []).find((program) => program.id === "building_profiles");
if (!sanFranciscoBuildingProfilesProgram) {
  fail("San Francisco must expose a Building Profiles Program.");
} else {
  const campaign = (sanFranciscoBuildingProfilesProgram.campaigns || [])[0];
  if (!campaign) {
    fail("San Francisco Building Profiles Campaign must expose resolver progress.");
  } else {
    const sanFranciscoResolvedPortfolios = (buildingProfileResolution.portfolios || []).filter((portfolio) =>
      portfolio.marketId === "san-francisco" && portfolio.eligibleForExecution
    );
    const sanFranciscoUngroupedItems = (buildingProfileResolution.ungroupedItems || []).filter((item) =>
      item.marketId === "san-francisco"
    );
    if (sanFranciscoResolvedPortfolios.length) {
      if (campaign.resolvedPortfolioCount < 1 || !campaign.nextMissionId) {
        fail("San Francisco Building Profiles Campaign must expose resolved portfolio progress and a next portfolio Mission.");
      }
      const nextPortfolio = (sanFranciscoBuildingProfilesProgram.initiatives || []).find((initiative) =>
        initiative.nextMissionId === campaign.nextMissionId
      );
      if (!nextPortfolio || !nextPortfolio.nextMissionId) {
        fail("San Francisco Building Profiles must expose the next active portfolio Mission.");
      }
      const mission = buildingProfileMissions.find((item) => item.id === nextPortfolio.nextMissionId);
      if (!mission || mission.marketId !== "san-francisco" || (mission.includedTasks || []).length < 2) {
        fail("San Francisco next Building Profile portfolio must map to one multi-building Building Profile Mission.");
      }
    } else {
      if (campaign.resolvedPortfolioCount !== 0 || campaign.nextMissionId || (campaign.missionIds || []).length) {
        fail("San Francisco Building Profiles must not expose a next portfolio Mission when no eligible portfolio remains.");
      }
      if (!sanFranciscoUngroupedItems.length || campaign.ungroupedItemCount !== sanFranciscoUngroupedItems.length) {
        fail("San Francisco Building Profiles must preserve explicit ungrouped fallback work when no portfolio remains.");
      }
      const statusInitiative = (sanFranciscoBuildingProfilesProgram.initiatives || []).find((initiative) =>
        initiative.id === "san-francisco:building_profiles:status"
      );
      if (!statusInitiative || statusInitiative.readOnly !== true || statusInitiative.nextMissionId) {
        fail("San Francisco Building Profiles fallback Initiative must remain read-only without an executable Mission.");
      }
    }
  }
  const completedFinancialDistrictUrls = [
    "/commercial-real-estate/building/CA/san-francisco/101-california-st/",
    "/commercial-real-estate/building/CA/san-francisco/212-sutter-st/",
    "/commercial-real-estate/building/CA/san-francisco/315-montgomery-st/",
    "/commercial-real-estate/building/CA/san-francisco/325-kearny-st/",
    "/commercial-real-estate/building/CA/san-francisco/333-kearny-st/",
    "/commercial-real-estate/building/CA/san-francisco/345-california-st/",
    "/commercial-real-estate/building/CA/san-francisco/555-california-st/",
    "/commercial-real-estate/building/CA/san-francisco/1-bush-st/",
    "/commercial-real-estate/building/CA/san-francisco/1-sansome-st/",
    "/commercial-real-estate/building/CA/san-francisco/600-montgomery-st/",
    "/commercial-real-estate/building/CA/san-francisco/156-2nd-st/",
    "/commercial-real-estate/building/CA/san-francisco/699-2nd-st/",
  ];
  const completedFinancialDistrictWork = (eos.workQueue || []).filter((item) =>
    item.category === "buildingBriefs" && completedFinancialDistrictUrls.includes(item.publicUrl)
  );
  if (completedFinancialDistrictWork.length) {
    fail("Completed Financial District Office Building Profile work must not remain in the active EOS queue.");
  }
}

const eastBayMarket = (marketProjection.markets || []).find((market) => market.id === "east-bay");
const eastBayCmeProgram = eastBayMarket && (eastBayMarket.programs || []).find((program) => program.id === "commercial_market_evidence");
if (!eastBayCmeProgram) {
  fail("East Bay must expose a Commercial Market Evidence Program for Berkeley/Oakland districts.");
} else {
  const westBerkeley = (eastBayCmeProgram.initiatives || []).find((initiative) => initiative.id === "east-bay:commercial_market_evidence:west-berkeley");
  if (!westBerkeley || westBerkeley.marketId !== "east-bay") {
    fail("West Berkeley must resolve to the East Bay Commercial Market Evidence workspace.");
  }
}

const ownershipResolution = marketEvidenceExpansion && marketEvidenceExpansion.ownershipResolution;
if (!ownershipResolution || !Array.isArray(ownershipResolution.resolvedDistricts)) {
  fail("Commercial Market Evidence expansion must expose district ownership resolution details.");
}

function assertResolvedDistrictMarket(districtId, expectedMarketId) {
  const resolved = (ownershipResolution.resolvedDistricts || []).find((district) => district.districtId === districtId);
  if (!resolved || resolved.marketId !== expectedMarketId) {
    fail(`${districtId} must resolve to ${expectedMarketId}; found ${resolved ? resolved.marketId : "unresolved"}.`);
  }
}

assertResolvedDistrictMarket("financial-district", "san-francisco");
assertResolvedDistrictMarket("west-berkeley", "east-bay");
assertResolvedDistrictMarket("downtown-seattle-office", "seattle");
assertResolvedDistrictMarket("downtown-denver", "denver");

for (const mission of cmeMissions) {
  const initiative = initiativeIds.has(mission.initiativeId)
    ? (marketProjection.initiatives || []).find((item) => item.id === mission.initiativeId)
    : null;
  if (!initiative || initiative.marketId !== mission.marketId) {
    fail(`${mission.id} market must match its Commercial Market Evidence Initiative market.`);
  }
}

for (const district of (ownershipResolution.unresolvedDistricts || []).concat(ownershipResolution.ambiguousDistricts || [])) {
  const districtId = district.districtId;
  if (cmeMissions.some((mission) => (mission.includedOpportunityIds || []).includes(`commercial-market-evidence:${districtId}`))) {
    fail(`Unresolved or ambiguous district must not generate an executable Commercial Market Evidence mission: ${districtId}`);
  }
}

const bundledMission = (portfolioQueues.missionQueue || []).find((mission) => (mission.includedOpportunityIds || []).length > 1);
if (!bundledMission) fail("Related micro-opportunities should form at least one bundled mission.");
if ((bundledMission.includedTasks || []).some((task) => task.suggestedModule && task.suggestedModule.id === "fieldMode")) {
  fail("Photography must not be silently bundled into an engineering/editorial mission.");
}

if (buildingProfileMissions.length) {
  const portfolioMission = buildingProfileMissions.find((mission) => (mission.includedTasks || []).length > 1);
  if (!portfolioMission) fail("Building Profiles should expose bundled portfolio Missions instead of one Mission per Building Brief.");
  if (!["Standard", "Large"].includes(portfolioMission.missionSize && portfolioMission.missionSize.label)) {
    fail("Building Profile portfolio Missions should use Standard or Large sizing.");
  }
}

const buildingProfileMissionByPortfolio = new Map();
for (const mission of buildingProfileMissions) {
  if (!mission.portfolioId || !portfolioIds.has(mission.portfolioId)) fail(`${mission.id} must map to a resolved Building Profile portfolio.`);
  if (buildingProfileMissionByPortfolio.has(mission.portfolioId)) fail(`Building Profile portfolio maps to multiple Missions: ${mission.portfolioId}`);
  buildingProfileMissionByPortfolio.set(mission.portfolioId, mission);
  const portfolio = (buildingProfileResolution.portfolios || []).find((item) => item.portfolioId === mission.portfolioId);
  if (!portfolio || portfolio.marketId !== mission.marketId || portfolio.campaignId !== mission.campaignId) {
    fail(`${mission.id} must match its portfolio market and Campaign.`);
  }
  if (!mission.executionPacket || !mission.executionPacket.workItems || mission.executionPacket.workItems.hiddenByDefault !== true) {
    fail(`${mission.id} must expose hidden building Work Items inside its Execution Packet.`);
  }
  if ((mission.executionPacket.qaCommands || []).indexOf("node scripts/qa-building-brief-depth.js") === -1) {
    fail(`${mission.id} must include Building Brief depth QA.`);
  }
}

for (const portfolio of buildingProfileResolution.portfolios || []) {
  if (portfolio.eligibleForExecution && !buildingProfileMissionByPortfolio.has(portfolio.portfolioId)) {
    fail(`${portfolio.portfolioId} must map to one executable Mission.`);
  }
}

for (const mission of portfolioQueues.missionQueue || []) {
  if (mission.programId === "building_profiles") continue;
  const duplicatePortfolioWork = (mission.includedOpportunityIds || []).find((id) => portfolioWorkItemIds.has(id));
  if (duplicatePortfolioWork) {
    fail(`${mission.id} duplicates a Building Profile portfolio Work Item as primary work: ${duplicatePortfolioWork}`);
  }
}

const photographyPrograms = (marketProjection.markets || [])
  .flatMap((market) => market.programs || [])
  .filter((program) => program.id === "photography");
if (!photographyPrograms.length || photographyPrograms.some((program) => !program.campaigns || !program.campaigns.length)) {
  fail("Photography should be represented through Campaign progress in Mission Control.");
}
if ((portfolioQueues.missionQueue || []).some((mission) => mission.programId === "photography")) {
  fail("Photography should not generate one executable Mission per photo target.");
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

for (const section of ["Mission Control", "Current Focus", "Market Workspace", "Show All Markets", "Metro Health", "Expansion Queue", "Field Mode Queue", "Review Queue", "Mission Archive", "Commence Work"]) {
  if (!adminSource.includes(section)) fail(`/admin/eos is missing section or action: ${section}`);
}

for (const marketWorkspaceSource of [
  "marketProjection",
  "activeProjectedMarkets",
  "renderMarketWorkspaceCard",
  "renderProjectedProgram",
  "renderProjectedCampaign",
  "renderProjectedMission",
  "program-grid",
  "Campaign",
  "program-detail-grid",
  "Hidden Work Items",
  "Markets are the primary Mission Control object",
  "single top mission",
]) {
  if (!adminSource.includes(marketWorkspaceSource)) fail(`/admin/eos Market Workspace is missing: ${marketWorkspaceSource}`);
}

for (const marketEvidenceSource of [
  "renderCommercialMarketEvidenceService",
  "Commercial Market Evidence",
  "Commercial Market Evidence Expansion",
  "Suggested Expansion Order",
  "Ordering Logic",
  "executable Program Mission",
  "renderProjectedInitiative",
  "initiative-status--next",
  "platformServices",
]) {
  if (!adminSource.includes(marketEvidenceSource)) fail(`/admin/eos Commercial Market Evidence display is missing: ${marketEvidenceSource}`);
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
  "marketFocusSummary",
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
