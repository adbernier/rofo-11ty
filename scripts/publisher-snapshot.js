const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { analyzePublisher } = require("../lib/publisher/analyze-metros.js");

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

  return {
    schemaVersion: 1,
    generatedAt,
    sourceCommit,
    analysis: analyzePublisher({ generatedAt }),
  };
}

const snapshot = buildSnapshot();
const outputPath = path.join(process.cwd(), "data", "generated", "publisher-analysis.json");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`Publisher snapshot written to ${path.relative(process.cwd(), outputPath)}`);
