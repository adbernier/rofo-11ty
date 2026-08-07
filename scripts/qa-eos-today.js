const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const ADMIN_PATH = path.join(ROOT, "functions/admin/eos.js");
const EOS_PATH = path.join(ROOT, "data/generated/eos-analysis.json");

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

const adminSource = fs.readFileSync(ADMIN_PATH, "utf8");
const eos = JSON.parse(fs.readFileSync(EOS_PATH, "utf8"));

assert(adminSource.includes("function todayRecommendations"), "EOS admin should generate Today recommendations.");
assert(adminSource.includes("return recommendations.slice(0, 3);"), "Today recommendations should be capped at three.");
assert(adminSource.includes("function renderExploreWorkspace"), "Existing Market Workspace should remain available as an Explore view.");
assert(adminSource.includes('selectedQueue === "markets"'), "Explore Markets route should be wired.");
assert(adminSource.includes('selectedQueue === "intelligence"'), "Commercial Knowledge Intelligence explore route should be wired.");
assert(adminSource.includes("What should I work on today?"), "Today page should ask what to work on today.");
assert(adminSource.includes("What Changed"), "Today page should include What Changed.");
assert(adminSource.includes("Needs Attention"), "Today page should include Needs Attention.");
assert(adminSource.includes("Explore More"), "Today page should include Explore navigation.");
assert(adminSource.includes("Lead Operations"), "Today explore navigation should include Lead Operations.");
assert(adminSource.includes("Commercial Knowledge Intelligence"), "Today should link into Commercial Knowledge Intelligence.");
assert(adminSource.includes("id=\"review-queue\""), "Review Queue should have a stable anchor.");
assert(adminSource.includes("id=\"commercial-market-evidence\""), "Commercial Market Evidence should have a stable anchor.");
assert(adminSource.includes(".today-card-grid"), "Today cards should have dedicated layout styles.");
assert(adminSource.includes(".today-explore__grid"), "Explore links should have dedicated layout styles.");

const intelligence = eos.commercialKnowledgeIntelligence;
assert(Boolean(intelligence), "Generated EOS should include Commercial Knowledge Intelligence for Today.");
assert(Array.isArray(intelligence.googleOpportunity && intelligence.googleOpportunity.markets), "Today should have Google opportunity inputs.");
assert(Array.isArray(eos.portfolioQueues && eos.portfolioQueues.reviewQueue), "Today should have review queue input.");
assert(Boolean(eos.marketProjection && Array.isArray(eos.marketProjection.markets)), "Today should have market projection input.");

if (errors.length) {
  console.error("EOS Today QA failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("EOS Today QA passed.");
console.log("Today inputs: Commercial Knowledge Intelligence, market projection, QA/review queues.");
