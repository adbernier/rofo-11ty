const fs = require("fs");
const path = require("path");
const { analyzePublisher } = require("../lib/publisher/analyze-metros.js");

function row(values) {
  return `| ${values.map((value) => String(value).replace(/\|/g, "\\|")).join(" | ")} |`;
}

function severityCount(queue, severity) {
  return queue.filter((item) => item.severity === severity).length;
}

function primaryBlocker(metro) {
  const blocker = (metro.gateBlockers || [])[0];
  if (blocker) return blocker.message;
  const cap = (metro.scoreCapReasons || [])[0];
  if (cap) return cap.reason;
  return "None";
}

function renderReport(analysis) {
  const lines = [];
  lines.push("# Rofo Publisher Metro Coverage Report");
  lines.push("");
  lines.push(`Generated: ${analysis.generatedAt}`);
  lines.push(`Rules: ${analysis.rulesVersion}`);
  lines.push("");
  lines.push("## Overview");
  lines.push("");
  lines.push(`- Compass Ready metros: ${analysis.overview.compassReadyCount}`);
  lines.push(`- Average overall Publisher score: ${analysis.overview.averageScore}%`);
  lines.push(`- Critical issues: ${analysis.overview.criticalIssues}`);
  lines.push(`- Queued tasks: ${analysis.overview.queuedTasks}`);
  lines.push(`- Closest to Distribution Ready: ${analysis.overview.closestToDistributionReady}`);
  lines.push(`- Largest critical gap: ${analysis.overview.largestCriticalGap}`);
  lines.push("");
  lines.push("## Metro Dimension Summary");
  lines.push("");
  lines.push(row(["Metro", "Compass", "Editorial", "Publishing", "Raw Overall", "Overall", "Status", "Primary Blocker"]));
  lines.push(row(["---", "---:", "---:", "---:", "---:", "---:", "---", "---"]));
  for (const metro of analysis.primaryMetros) {
    lines.push(row([
      metro.metroName,
      `${metro.dimensions.compassReadiness.score}%`,
      `${metro.dimensions.editorialCoverage.score}%`,
      `${metro.dimensions.publishingReadiness.score}%`,
      `${metro.rawOverallScore}%`,
      `${metro.overallScore}%`,
      metro.readinessStatus,
      primaryBlocker(metro),
    ]));
  }
  lines.push("");
  lines.push("## Production Summary");
  lines.push("");
  lines.push(row(["Metro", "Districts", "Representative Buildings", "Building Briefs", "Critical", "High", "Recommended Next Action"]));
  lines.push(row(["---", "---:", "---:", "---:", "---:", "---:", "---"]));
  for (const metro of analysis.primaryMetros) {
    lines.push(row([
      metro.metroName,
      metro.districtCount,
      metro.representativeBuildingCount,
      metro.buildingBriefCount,
      severityCount(metro.queue, "critical"),
      severityCount(metro.queue, "high"),
      metro.recommendedNextAction.suggestedNextAction || metro.recommendedNextAction.reason || "",
    ]));
  }
  lines.push("");
  lines.push("## Commercial Ecosystem Coverage");
  lines.push("");
  lines.push(row(["Metro", "Geographic", "Ecosystem", "Balance", "Blocking Ecosystems", "Recommended Ecosystem Sprint"]));
  lines.push(row(["---", "---", "---", "---", "---", "---"]));
  for (const metro of analysis.primaryMetros) {
    lines.push(row([
      metro.metroName,
      metro.geographicReadiness ? metro.geographicReadiness.label : "",
      metro.ecosystemReadiness ? metro.ecosystemReadiness.label : "",
      metro.ecosystemBalance ? metro.ecosystemBalance.label : "",
      (metro.blockingEcosystems || []).join(", ") || "None",
      metro.recommendedEcosystemSprint ? metro.recommendedEcosystemSprint.title : "None",
    ]));
  }
  lines.push("");
  lines.push("## Commercial Ecosystem Layer Summary");
  lines.push("");
  lines.push(row(["Metro", "Office", "Industrial & Flex", "Retail", "Medical", "Life Science", "Highest Ecosystem Gap"]));
  lines.push(row(["---", "---", "---", "---", "---", "---", "---"]));
  for (const metro of analysis.primaryMetros) {
    const coverage = metro.ecosystemCoverage || {};
    const ecosystems = coverage.ecosystems || {};
    const evaluations = ((metro.ecosystemReadiness || {}).evaluations || []).reduce((result, item) => {
      result[item.ecosystemId] = item;
      return result;
    }, {});
    const statusFor = (id) => {
      const evaluation = evaluations[id];
      const bucket = ecosystems[id];
      if (!evaluation || !bucket) return "Missing";
      return `${evaluation.readinessLabel} / ${evaluation.relevanceLabel} (${bucket.districtCount}/${bucket.representativeBuildingCount}/${bucket.buildingBriefCount})`;
    };
    const primaryGap = (metro.ecosystemGaps || [])[0];
    lines.push(row([
      metro.metroName,
      statusFor("office"),
      statusFor("industrial_flex"),
      statusFor("retail"),
      statusFor("medical"),
      statusFor("life_science"),
      primaryGap ? `${primaryGap.ecosystemLabel}: ${primaryGap.rationale}` : "None",
    ]));
  }
  lines.push("");
  lines.push("Counts in parentheses are primary districts / representative buildings / Building Briefs. Ecosystem readiness is reported separately and is not included in the current Publisher numeric score.");
  lines.push("");
  lines.push("## Category Coverage");
  for (const metro of analysis.primaryMetros) {
    lines.push("");
    lines.push(`### ${metro.metroName}`);
    lines.push("");
    lines.push(`Readiness: ${metro.readinessStatus}`);
    lines.push(`Overall: ${metro.overallScore}%`);
    if ((metro.scoreCapReasons || []).length) {
      lines.push("");
      lines.push("Score caps:");
      for (const cap of metro.scoreCapReasons) {
        lines.push(`- ${cap.code}: ${cap.reason} Cap: ${cap.cap}%.`);
      }
    }
    if ((metro.gateBlockers || []).length) {
      lines.push("");
      lines.push("Gate blockers:");
      for (const blocker of metro.gateBlockers) {
        lines.push(`- ${blocker.code}: ${blocker.message}`);
      }
    }
    lines.push("");
    lines.push(row(["Category", "Score", "Completed", "Total", "Issues", "Explanation"]));
    lines.push(row(["---", "---:", "---:", "---:", "---:", "---"]));
    for (const category of Object.values(metro.categories)) {
      lines.push(row([
        category.label,
        `${category.score}%`,
        category.completed,
        category.total,
        category.issues.length,
        category.explanation,
      ]));
    }
  }
  lines.push("");
  lines.push("## Highest Priority Queue Items");
  lines.push("");
  lines.push(row(["Severity", "Metro", "Category", "Task", "Item", "Next Action"]));
  lines.push(row(["---", "---", "---", "---", "---", "---"]));
  for (const item of (analysis.primaryQueue || analysis.queue).slice(0, 30)) {
    lines.push(row([
      item.severity,
      item.metroName,
      item.categoryLabel,
      item.taskType,
      item.itemName,
      item.suggestedNextAction,
    ]));
  }
  lines.push("");
  lines.push("## Known Limitations");
  lines.push("");
  lines.push("- Publisher v1 uses deterministic checks only. It does not perform AI editorial review.");
  lines.push("- Metro grouping is configured in `data/publisher-rules.js`; coverage is derived from existing repository data.");
  lines.push("- Building availability is not measured because representative buildings are editorial examples, not listings.");
  lines.push("- Compass Ready remains distinct from editorial or distribution readiness.");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

const analysis = analyzePublisher();
const outputPath = path.join(process.cwd(), "docs", "publisher", "metro-coverage-report.md");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, renderReport(analysis));
console.log(`Publisher report written to ${path.relative(process.cwd(), outputPath)}`);
