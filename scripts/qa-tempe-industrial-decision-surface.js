const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const tempePath = "/commercial-real-estate/AZ/tempe/industrial-space/";
const outputPath = path.join(root, "_site", tempePath, "index.html");
const sitemapPath = path.join(root, "_site", "sitemap.xml");
const graph = require(path.join(root, "_data", "locationKnowledgeGraph.js"));
const pages = require(path.join(root, "_data", "spaceTypePages.js"));

assert.ok(fs.existsSync(outputPath), "Tempe Industrial output should exist");

const html = fs.readFileSync(outputPath, "utf8");
const sitemap = fs.readFileSync(sitemapPath, "utf8");
const destinationPaths = [
  "/commercial-real-estate/AZ/tempe/tempe-i-10-industrial/",
  "/commercial-real-estate/AZ/phoenix/phoenix-airport-sky-harbor-area/",
  "/commercial-real-estate/AZ/mesa/mesa-gateway-east-mesa/",
  "/commercial-real-estate/building/AZ/tempe/6840-s-harl-ave/",
];

assert.match(html, /<title>Industrial Space in Tempe, AZ \| Rofo<\/title>/);
assert.match(html, /<meta name="description" content="Compare industrial location options in Tempe, AZ\. Understand areas, buildings, and tradeoffs before narrowing the search\.">/);
assert.match(html, /<h1>Industrial Space in Tempe, AZ<\/h1>/);
assert.match(html, /<link rel="canonical" href="https:\/\/www\.rofo\.com\/commercial-real-estate\/AZ\/tempe\/industrial-space\/">/);
assert.match(html, /data-experiment="tempe-industrial-decision-surface"/);
assert.match(html, /Is Tempe the right Phoenix-area industrial location\?/);
assert.match(html, /What to verify before comparing spaces/);
assert.match(html, /source=tempe_industrial_decision_surface/);
assert.match(html, /spaceType=Industrial%20%2F%20Warehouse/);
assert.match(sitemap, /https:\/\/www\.rofo\.com\/commercial-real-estate\/AZ\/tempe\/industrial-space\//);

for (const destinationPath of destinationPaths) {
  const escapedPath = destinationPath.replaceAll("/", "\\/");
  assert.match(html, new RegExp('href="' + escapedPath + '"'));
  assert.ok(fs.existsSync(path.join(root, "_site", destinationPath, "index.html")), destinationPath + " should resolve");
  assert.match(sitemap, new RegExp(escapedPath));
}

const guide = html.match(/<section[^>]+data-experiment="tempe-industrial-decision-surface"[\s\S]*?<\/section>/);
assert.ok(guide, "Tempe Industrial decision surface should render once");
assert.equal((guide[0].match(/neighborhood-comparison-card/g) || []).length, 3, "Decision surface should expose Tempe plus exactly two alternatives");
for (const omittedAlternative of ["Chandler Airpark", "West Phoenix Industrial", "Southwest Phoenix Industrial", "Tolleson", "Goodyear"]) {
  assert.ok(!guide[0].includes(omittedAlternative), omittedAlternative + " should remain outside the bounded decision set");
}

const tempeIndustrialPage = pages.find(
  (entry) => entry.city_slug === "tempe" && entry.page_slug === "industrial-space"
);
assert.ok(tempeIndustrialPage?.localDecisionGuide, "Tempe Industrial should receive the decision guide");
assert.equal(tempeIndustrialPage.localDecisionGuide.entries.length, 3, "Guide data should contain one local path and two alternatives");
assert.ok(!pages.some((entry) => entry.localDecisionGuide?.experimentId === "tempe-industrial-decision-surface" && entry !== tempeIndustrialPage), "No other property-type page should receive the experiment");

const graphNodes = Array.isArray(graph) ? graph : Object.values(graph.nodes || graph);
assert.equal(graphNodes.filter((node) => node.slug === "tempe-i-10-industrial").length, 1, "No new Tempe canonical geography should be created");

const cmeDirectory = path.join(root, "data", "commercial-market-evidence", "tempe");
assert.deepEqual(fs.readdirSync(cmeDirectory).sort(), ["tempe-i-10-industrial.js"], "Experiment should not create new Tempe CME");

console.log("Tempe Industrial decision surface QA passed.");
