const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const alisoPath = "/commercial-real-estate/CA/aliso-viejo/";
const outputPath = path.join(root, "_site", alisoPath, "index.html");
const sitemapPath = path.join(root, "_site", "sitemap.xml");
const graph = require(path.join(root, "_data", "locationKnowledgeGraph.js"));

assert.ok(fs.existsSync(outputPath), "Aliso Viejo output should exist");

const html = fs.readFileSync(outputPath, "utf8");
const sitemap = fs.readFileSync(sitemapPath, "utf8");
const expectedDistrictPaths = [
  "/commercial-real-estate/CA/irvine/irvine-spectrum/",
  "/commercial-real-estate/CA/lake-forest/lake-forest-business-center/",
  "/commercial-real-estate/CA/mission-viejo/mission-viejo/",
  "/commercial-real-estate/CA/irvine/irvine-business-complex/",
];

assert.match(html, /<title>Commercial Real Estate in Aliso Viejo, CA \| Rofo<\/title>/);
assert.match(html, /<h1>Commercial Real Estate in Aliso Viejo, CA<\/h1>/);
assert.match(html, /<link rel="canonical" href="https:\/\/www\.rofo\.com\/commercial-real-estate\/CA\/aliso-viejo\/">/);
assert.match(html, /<div class="eyebrow">Office Market Snapshot<\/div>/);
assert.match(html, /Aliso Viejo Pkwy/);
assert.match(html, /data-experiment="aliso-oc-decision-bridge"/);
assert.match(html, /Considering Locations Beyond Aliso Viejo\?/);
assert.match(html, /source=aliso_oc_decision_bridge/);
assert.match(sitemap, /https:\/\/www\.rofo\.com\/commercial-real-estate\/CA\/aliso-viejo\//);

for (const districtPath of expectedDistrictPaths) {
  assert.match(html, new RegExp(`href="${districtPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  assert.ok(fs.existsSync(path.join(root, "_site", districtPath, "index.html")), `${districtPath} should resolve`);
  assert.match(sitemap, new RegExp(districtPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

const bridge = html.match(/<aside[^>]+data-experiment="aliso-oc-decision-bridge"[\s\S]*?<\/aside>/);
assert.ok(bridge, "Decision bridge should render once");
assert.equal((bridge[0].match(/neighborhood-comparison-card/g) || []).length, 4, "Decision bridge should expose exactly four district paths");

const graphNodes = graph.nodes || graph;
const nodeList = Array.isArray(graphNodes) ? graphNodes : Object.values(graphNodes);
assert.ok(!nodeList.some((node) => node.slug === "aliso-viejo" && node.type === "district"), "Aliso Viejo must not become a canonical recommendation district");

console.log("Aliso Viejo decision bridge QA passed.");
