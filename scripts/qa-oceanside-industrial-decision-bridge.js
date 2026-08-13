const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const oceansidePath = "/commercial-real-estate/CA/oceanside/";
const outputPath = path.join(root, "_site", oceansidePath, "index.html");
const sitemapPath = path.join(root, "_site", "sitemap.xml");
const graph = require(path.join(root, "_data", "locationKnowledgeGraph.js"));

assert.ok(fs.existsSync(outputPath), "Oceanside city output should exist");

const html = fs.readFileSync(outputPath, "utf8");
const sitemap = fs.readFileSync(sitemapPath, "utf8");
const districtPaths = [
  "/commercial-real-estate/CA/oceanside/oceanside-industrial/",
  "/commercial-real-estate/CA/vista/vista-business-park/",
  "/commercial-real-estate/CA/carlsbad/carlsbad-business-park/",
];
const comparisonPaths = [
  "/commercial-real-estate/CA/oceanside/oceanside-industrial-vs-vista-business-park/",
  "/commercial-real-estate/CA/carlsbad/carlsbad-business-park-vs-oceanside-industrial/",
];

assert.match(html, /<title>Commercial Real Estate in Oceanside, CA \| Rofo<\/title>/);
assert.match(html, /<meta name="description" content="Find the right commercial location in Oceanside, CA\. Compare areas, understand tradeoffs, review representative buildings, and start the search with more confidence\.">/);
assert.match(html, /<h1>Commercial Real Estate in Oceanside, CA<\/h1>/);
assert.match(html, /<link rel="canonical" href="https:\/\/www\.rofo\.com\/commercial-real-estate\/CA\/oceanside\/">/);
assert.match(html, /<div class="eyebrow">Office Market Snapshot<\/div>/);
assert.match(html, /Oceanside Blvd/);
assert.match(html, /data-experiment="oceanside-industrial-decision-bridge"/);
assert.match(html, /Looking for Industrial Space in Oceanside\?/);
assert.match(html, /source=oceanside_industrial_decision_bridge/);
assert.match(html, /spaceType=Industrial%20%2F%20Warehouse/);
assert.match(sitemap, /https:\/\/www\.rofo\.com\/commercial-real-estate\/CA\/oceanside\//);

for (const destinationPath of districtPaths.concat(comparisonPaths)) {
  const escapedPath = destinationPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(html, new RegExp(`href="${escapedPath}"`));
  assert.ok(fs.existsSync(path.join(root, "_site", destinationPath, "index.html")), `${destinationPath} should resolve`);
  assert.match(sitemap, new RegExp(escapedPath));
}

const bridge = html.match(/<aside[^>]+data-experiment="oceanside-industrial-decision-bridge"[\s\S]*?<\/aside>/);
assert.ok(bridge, "Oceanside Industrial decision bridge should render once");
assert.equal((bridge[0].match(/neighborhood-comparison-card/g) || []).length, 3, "Bridge should expose exactly the Oceanside, Vista, and Carlsbad primary decision set");
for (const excludedLocation of ["Poway", "Miramar", "Otay Mesa", "San Marcos", "Escondido", "Temecula"]) {
  assert.ok(!bridge[0].includes(excludedLocation), `${excludedLocation} should not appear in the bounded bridge`);
}

const graphNodes = Array.isArray(graph) ? graph : Object.values(graph.nodes || graph);
assert.equal(graphNodes.filter((node) => node.slug === "oceanside-industrial").length, 1, "No new Oceanside canonical geography should be created");

const cmeDirectory = path.join(root, "data", "commercial-market-evidence");
const cmeFiles = fs.readdirSync(cmeDirectory, { recursive: true }).map(String);
assert.ok(!cmeFiles.some((file) => /oceanside|vista-business|carlsbad-business/i.test(file)), "Bridge must not depend on new North County CME");

console.log("Oceanside Industrial decision bridge QA passed.");
