const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const cityPath = "/commercial-real-estate/CA/antioch/";
const districtPath = "/commercial-real-estate/CA/antioch/antioch-east-18th-industrial/";
const cityHtml = fs.readFileSync(path.join(root, "_site", cityPath, "index.html"), "utf8");
const districtHtml = fs.readFileSync(path.join(root, "_site", districtPath, "index.html"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "_site", "sitemap.xml"), "utf8");
const graph = require(path.join(root, "_data", "locationKnowledgeGraph.js"));
const neighborhoodPages = require(path.join(root, "_data", "neighborhoodPages.js"));

assert.match(cityHtml, /<title>Commercial Real Estate in Antioch, CA \| Rofo<\/title>/);
assert.match(cityHtml, /<meta name="description" content="Find the right commercial location in Antioch, CA\. Compare areas, understand tradeoffs, review representative buildings, and start the search with more confidence\.">/);
assert.match(cityHtml, /<link rel="canonical" href="https:\/\/www\.rofo\.com\/commercial-real-estate\/CA\/antioch\/">/);
assert.match(cityHtml, /<h1>Commercial Real Estate in Antioch, CA<\/h1>/);
assert.match(cityHtml, /<div class="eyebrow">Office Market Snapshot<\/div>/);
assert.match(cityHtml, /41-47 18th St E/);
assert.match(cityHtml, /data-experiment="antioch-industrial-decision-bridge"/);
assert.match(cityHtml, /Looking for Industrial Space in Antioch\?/);
assert.match(cityHtml, new RegExp(`href="${districtPath}"`));
assert.match(cityHtml, /source=antioch_industrial_decision_bridge/);
assert.match(cityHtml, /spaceType=Industrial%20%2F%20Warehouse/);

const bridge = cityHtml.match(/<aside[^>]+data-experiment="antioch-industrial-decision-bridge"[\s\S]*?<\/aside>/);
assert.ok(bridge, "Antioch Industrial decision bridge should render once");
assert.equal((bridge[0].match(/neighborhood-comparison-card/g) || []).length, 1, "Bridge should expose only Antioch East 18th");
for (const excludedLocation of ["Concord", "Pittsburg", "Hayward", "Union City", "Warm Springs"]) {
  assert.ok(!bridge[0].includes(excludedLocation), `${excludedLocation} should not appear in the bounded bridge`);
}
assert.ok(!/commercial-real-estate\/building\//.test(bridge[0]), "Bridge must not fabricate a representative building");

assert.match(districtHtml, /<title>Antioch East 18th Industrial Commercial Real Estate \| Antioch, CA \| Rofo<\/title>/);
assert.match(districtHtml, /<meta name="description" content="Understand when Antioch East 18th Industrial may fit local warehouse, contractor, service-industrial, storage, dispatch, or office\/warehouse needs—and what to validate at a specific property\.">/);
assert.match(districtHtml, /<link rel="canonical" href="https:\/\/www\.rofo\.com\/commercial-real-estate\/CA\/antioch\/antioch-east-18th-industrial\/">/);
assert.doesNotMatch(districtHtml, /<meta name="robots" content="noindex/);
assert.match(districtHtml, /<h1>Commercial Real Estate in Antioch East 18th Industrial<\/h1>/);
assert.match(districtHtml, /href="\/commercial-real-estate\/CA\/antioch\/"/);
assert.match(districtHtml, /Where Antioch East 18th Industrial fits/);
assert.match(districtHtml, /Best fit/);
assert.match(districtHtml, /Less ideal for/);
assert.match(districtHtml, /What to validate before focusing here/);
assert.match(districtHtml, /How Antioch East 18th Industrial operates in practice/);
assert.match(districtHtml, /current availability, suite condition, permitted use, and property-specific capability separately/);
assert.match(districtHtml, /Create My Location Brief/);
assert.match(districtHtml, /href="\/find-locations\//);
assert.doesNotMatch(districtHtml, /Representative buildings in Antioch East 18th Industrial/);
assert.match(districtHtml, /District-level operating context; property capability requires separate validation/);
assert.doesNotMatch(districtHtml, /commercial-real-estate\/building\/CA\/antioch\//);
assert.match(sitemap, new RegExp(districtPath));

assert.equal(neighborhoodPages.filter((page) => page.canonical_neighborhood_path === districtPath).length, 1, "District should have one public route");
const districtPage = neighborhoodPages.find((page) => page.canonical_neighborhood_path === districtPath);
assert.equal(districtPage.noindex, false);
assert.deepEqual(districtPage.representative_buildings, []);
assert.deepEqual(districtPage.representative_building_cards, []);
assert.equal(districtPage.commercial_location_model.compare_with.length, 0);
assert.deepEqual(districtPage.commercial_market_evidence.records.map((record) => record.id), ["antioch-east-18th-industrial-foundation"]);

const graphNodes = Array.isArray(graph) ? graph : Object.values(graph.nodes || graph);
assert.equal(graphNodes.filter((node) => node.slug === "antioch-east-18th-industrial").length, 1, "No duplicate canonical district should be created");

console.log("Antioch Industrial district surface and decision bridge QA passed.");
