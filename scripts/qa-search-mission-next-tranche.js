const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { webcrypto } = require("crypto");

const ROOT = process.cwd();
const EOS_ADMIN = path.join(ROOT, "functions", "admin", "eos.js");
const EOS_MISSIONS = path.join(ROOT, "functions", "admin", "eos-missions.js");
const RUNTIME = path.join(ROOT, "data", "generated", "eos-admin-runtime.json");

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function loadMissionModule() {
  const source = read(EOS_MISSIONS)
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
  generateSearchMissionWorkPacket,
  nextSearchMissionExecutionTranche,
  prepareSearchMissionForExecution,
};`, sandbox, { filename: EOS_MISSIONS });
  return sandbox.module.exports;
}

const runtime = JSON.parse(read(RUNTIME));
const adminSource = read(EOS_ADMIN);
const missionSource = read(EOS_MISSIONS);
const moduleExports = loadMissionModule();
const intelligence = runtime.commercialKnowledgeIntelligence || {};
const warehouseMission = (intelligence.searchMissions || []).find((mission) => mission.id === "expand-warehouse-industrial-knowledge");
const addressedMarketIds = ["antioch", "aurora", "indianapolis", "tempe"];
const completedChild = {
  id: "mission-005",
  sequenceNumber: 5,
  sourceMissionId: "expand-warehouse-industrial-knowledge",
  status: "completed",
  supportingMarkets: addressedMarketIds.map((marketId) => ({ marketId })),
  workPacket: {
    targets: {
      markets: addressedMarketIds.map((marketId) => ({ marketId })),
    },
  },
};

assert(warehouseMission, "Warehouse / Industrial parent Search Mission should exist.");
assert(/across\s+15\s+markets/i.test((warehouseMission.evidence || []).join(" ")), "Parent opportunity should preserve the 15-market scope evidence.");
assert((warehouseMission.supportingMarkets || []).length === 4, "Parent mission compact sample should remain the originally bounded four-market evidence sample.");
assert(missionSource.includes("SEARCH_MISSION_TRANCHE_SIZE = 4"), "Search Mission execution tranche size should be capped at four markets.");
assert(missionSource.includes("expandedSearchMissionSupportingMarkets"), "Packet generation should expand parent mission candidates from compact topic evidence.");
assert(missionSource.includes("nextSearchMissionExecutionTranche"), "Packet generation should have explicit next-tranche selection.");
assert(missionSource.includes("prepareSearchMissionForExecution"), "Review and commence paths should prepare the next execution tranche.");
assert(adminSource.includes("prepareSearchMissionForExecution(sourceMission"), "Search Mission review should preview the prepared next tranche.");
assert(missionSource.includes("prepareSearchMissionForExecution(generatedMission"), "Commence Work should persist the prepared next tranche.");

const tranche = moduleExports.nextSearchMissionExecutionTranche(warehouseMission, runtime, [completedChild]);
const executionIds = tranche.executionMarkets.map((market) => market.marketId);
const prepared = moduleExports.prepareSearchMissionForExecution(warehouseMission, runtime, [completedChild]);
const packet = prepared ? moduleExports.generateSearchMissionWorkPacket(prepared, runtime) : null;
const packetTargetIds = packet ? packet.targets.markets.map((market) => market.marketId) : [];
const packetText = JSON.stringify(packet || {});

assert(tranche.addressedMarketIds.length === 4, "Four completed child-scope markets should be considered addressed.");
assert(addressedMarketIds.every((marketId) => tranche.addressedMarketIds.includes(marketId)), "Completed child mission markets should match the addressed set.");
assert(executionIds.length > 0, "Next tranche should contain executable remaining markets.");
assert(executionIds.length <= 4, "Next tranche should contain at most four markets.");
assert(addressedMarketIds.every((marketId) => !executionIds.includes(marketId)), "Next tranche must exclude already addressed markets.");
assert(packetTargetIds.length === executionIds.length, "Work packet TARGETS should use the prepared next tranche.");
assert(packetTargetIds.every((marketId) => executionIds.includes(marketId)), "Work packet TARGETS should match next-tranche markets.");
assert(addressedMarketIds.every((marketId) => !packetText.includes(`"marketId":"${marketId}"`)), "Work packet JSON should not contain addressed markets in targets or foundation assessment.");
assert(packet.workToComplete.every((item) => {
  const details = item.details || "";
  return addressedMarketIds.every((marketId) => !details.toLowerCase().includes(marketId));
}), "Task instructions should not name previously addressed markets.");
assert(packetText.includes("sourceContext"), "Prepared child packet should preserve parent Search Mission context.");
assert((prepared.sourceContext || {}).parentMissionId === warehouseMission.id, "Prepared child mission should preserve parent opportunity identity.");

const allAddressed = moduleExports.prepareSearchMissionForExecution(warehouseMission, runtime, [
  completedChild,
  {
    ...completedChild,
    id: "mission-006",
    sequenceNumber: 6,
    workPacket: {
      targets: {
        markets: tranche.remainingMarkets.map((market) => ({ marketId: market.marketId })),
      },
    },
    supportingMarkets: tranche.remainingMarkets.map((market) => ({ marketId: market.marketId })),
  },
]);
assert(allAddressed === null, "An already satisfied tranche should not create a no-op durable mission.");
assert(adminSource.includes("searchMissionOpportunityState"), "Parent opportunity state should remain presentation-layer logic.");
assert(adminSource.includes("active_opportunity"), "Completing a child mission should not complete the broader parent opportunity.");

if (errors.length) {
  console.error("Search Mission next-tranche QA failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Search Mission next-tranche QA passed.");
console.log(`Next Warehouse / Industrial tranche: ${executionIds.join(", ")}.`);
