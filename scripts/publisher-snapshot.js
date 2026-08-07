const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { analyzePublisher } = require("../lib/publisher/analyze-metros.js");
const { buildPublisherExpansionPlans } = require("../lib/publisher/expansion-planner.js");
const { buildEditorialOperatingSystem } = require("../lib/eos/editorial-operating-system.js");
const { buildEosAdminRuntimeSnapshot } = require("../lib/eos/admin-runtime-snapshot.js");
const locationKnowledgeGraph = require("../_data/locationKnowledgeGraph.js");
const commercialGeography = require("../lib/geography/commercial-geography.js");
const { runValidation: validateCommercialMarketEvidence } = require("./qa-commercial-market-evidence.js");

function gitValue(args) {
  try {
    return execFileSync("git", args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch (error) {
    return "";
  }
}

function buildSnapshot() {
  const sourceCommit = process.env.CF_PAGES_COMMIT_SHA || gitValue(["rev-parse", "HEAD"]) || "unknown";
  const generatedAt = process.env.SOURCE_DATE_EPOCH
    ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
    : gitValue(["show", "-s", "--format=%cI", "HEAD"]) || "unknown";
  const commercialMarketEvidenceValidation = validateCommercialMarketEvidence();
  const commercialMarketEvidence = {
    schemaVersion: "commercial-market-evidence-platform-v1",
    service: "Commercial Market Evidence",
    status: commercialMarketEvidenceValidation.validationStatus === "PASS" ? "Validated" : "Needs Attention",
    validationStatus: commercialMarketEvidenceValidation.validationStatus,
    collections: commercialMarketEvidenceValidation.collections,
    districts: commercialMarketEvidenceValidation.districts,
    evidenceRecords: commercialMarketEvidenceValidation.evidenceRecords,
    evidenceTypes: commercialMarketEvidenceValidation.evidenceTypes,
    evidenceRoles: commercialMarketEvidenceValidation.evidenceRoles,
    confidenceSummary: commercialMarketEvidenceValidation.confidenceBuckets,
    deferredCandidates: commercialMarketEvidenceValidation.deferredCandidates,
    latestValidation: generatedAt,
    errors: commercialMarketEvidenceValidation.errors,
    warnings: commercialMarketEvidenceValidation.warnings,
    source: {
      system: "Commercial Market Evidence Validator",
      script: "scripts/qa-commercial-market-evidence.js",
    },
    scoringImpact: "None. Reporting only; Publisher scoring and readiness calculations are unchanged.",
  };
  const analysis = analyzePublisher({ generatedAt });
  const geography = commercialGeography.geographySummary(locationKnowledgeGraph);
  analysis.commercialMarketEvidence = commercialMarketEvidence;
  analysis.geography = geography;

  return {
    schemaVersion: 1,
    generatedAt,
    sourceCommit,
    geography,
    commercialMarketEvidence,
    analysis,
  };
}

const snapshot = buildSnapshot();
const outputPath = path.join(process.cwd(), "data", "generated", "publisher-analysis.json");
const plansPath = path.join(process.cwd(), "data", "generated", "publisher-expansion-plans.json");
const eosPath = path.join(process.cwd(), "data", "generated", "eos-analysis.json");
const eosAdminRuntimePath = path.join(process.cwd(), "data", "generated", "eos-admin-runtime.json");
const plans = buildPublisherExpansionPlans(snapshot.analysis, { generatedAt: snapshot.generatedAt });
const eos = buildEditorialOperatingSystem(snapshot, plans, { generatedAt: snapshot.generatedAt });
const eosAdminRuntime = buildEosAdminRuntimeSnapshot(eos);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
fs.writeFileSync(plansPath, `${JSON.stringify(plans, null, 2)}\n`);
fs.writeFileSync(eosPath, `${JSON.stringify(eos, null, 2)}\n`);
fs.writeFileSync(eosAdminRuntimePath, `${JSON.stringify(eosAdminRuntime, null, 2)}\n`);

console.log(`Publisher snapshot written to ${path.relative(process.cwd(), outputPath)}`);
console.log(`Publisher expansion plans written to ${path.relative(process.cwd(), plansPath)}`);
console.log(`EOS analysis written to ${path.relative(process.cwd(), eosPath)}`);
console.log(`EOS admin runtime written to ${path.relative(process.cwd(), eosAdminRuntimePath)}`);
