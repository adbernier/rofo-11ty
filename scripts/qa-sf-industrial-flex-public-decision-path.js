#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const neighborhoodPages = require("../_data/neighborhoodPages");
const spaceTypePages = require("../_data/spaceTypePages");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel");
const commercialKnowledgeMarketSnapshots = require("../_data/commercialKnowledgeMarketSnapshots");

const root = path.join(__dirname, "..");
const errors = [];
const fail = (message) => errors.push(message);
const districtSlugs = ["bayview-industrial", "central-waterfront"];
const hasFreshPublicBuild = districtSlugs.every((slug) => fs.existsSync(path.join(root, "_site", "commercial-real-estate", "CA", "san-francisco", slug, "index.html")));

for (const slug of districtSlugs) {
  const page = neighborhoodPages.find((item) => item.slug === slug && item.city === "San Francisco" && item.state_abbr === "CA");
  if (!page) {
    fail(`${slug} public district source is missing`);
    continue;
  }
  if (page.noindex) fail(`${slug} must be indexable`);
  if (!page.district_identity || !page.commercial_location_model) fail(`${slug} lacks substantive district decision content`);
  if ((page.commercial_location_model.decision_guidance || []).length < 4) fail(`${slug} lacks operational validation guidance`);
  if ((page.commercial_market_evidence?.records || []).length !== 4) fail(`${slug} must expose the reviewed four-record CME set`);
  if (!(page.commercial_location_model.compare_with || []).some((item) => item.district_path)) fail(`${slug} lacks linked decision alternatives`);
}

const industrial = spaceTypePages.find((item) => item.city_slug === "san-francisco" && item.page_slug === "industrial-space");
const flex = spaceTypePages.find((item) => item.city_slug === "san-francisco" && item.page_slug === "flex-space");
const office = spaceTypePages.find((item) => item.city_slug === "san-francisco" && item.page_slug === "office-space");
if (!industrial?.localDecisionGuide || industrial.localDecisionGuide.entries.length !== 6) fail("SF Industrial hub lacks its six-choice decision layer");
if (!flex?.localDecisionGuide || flex.localDecisionGuide.entries.length !== 5) fail("SF Flex hub lacks its five-choice decision layer");
if (office?.localDecisionGuide) fail("SF Office hub must remain outside this publishing sprint");
for (const entry of [...(industrial?.localDecisionGuide?.entries || []), ...(flex?.localDecisionGuide?.entries || [])]) {
  if (["bayview-industrial", "central-waterfront", "dogpatch"].includes(entry.id) && !entry.path) fail(`${entry.id} must be linked from the property-type decision layer`);
}

if ((sfOfficeModel.districtOrder || []).some((slug) => districtSlugs.includes(slug))) fail("New industrial districts must not enter the SF Office recommendation model");

const sfMarketSnapshot = commercialKnowledgeMarketSnapshots["CA/san-francisco"];
for (const slug of districtSlugs) {
  const expectedPath = `/commercial-real-estate/CA/san-francisco/${slug}/`;
  if (!(sfMarketSnapshot?.keyDistricts || []).some((district) => district.path === expectedPath)) {
    fail(`SF market snapshot does not expose ${slug}`);
  }
}

const buildChecks = [
  ["bayview-industrial", ["Bayview Industrial", "Representative environments", "The SF Market", "Proposed development", "Specialized infrastructure", "Central Waterfront", "Create My Location Brief"]],
  ["central-waterfront", ["Central Waterfront", "Representative environments", "American Industrial Center", "Pier 70 Building 12", "Dogpatch", "Create My Location Brief"]],
];
for (const [slug, expected] of hasFreshPublicBuild ? buildChecks : []) {
  const outputPath = path.join(root, "_site", "commercial-real-estate", "CA", "san-francisco", slug, "index.html");
  if (!fs.existsSync(outputPath)) continue;
  const html = fs.readFileSync(outputPath, "utf8");
  for (const text of expected) if (!html.includes(text)) fail(`${slug} built page is missing ${text}`);
  if (!html.includes(`<link rel="canonical" href="https://www.rofo.com/commercial-real-estate/CA/san-francisco/${slug}/">`)) fail(`${slug} is not self-canonical`);
  if (/noindex/i.test(html)) fail(`${slug} built page contains noindex`);
}

for (const [slug, expected] of hasFreshPublicBuild ? [["industrial-space", ["Choose the geography around the operation", "Warehouse, distribution, food, contractor, fleet", "Bayview Industrial"]], ["flex-space", ["Decide what must flex", "Production/flex, prototyping", "Central Waterfront"]]] : []) {
  const outputPath = path.join(root, "_site", "commercial-real-estate", "CA", "san-francisco", slug, "index.html");
  if (!fs.existsSync(outputPath)) continue;
  const html = fs.readFileSync(outputPath, "utf8");
  for (const text of expected) if (!html.includes(text)) fail(`${slug} built page is missing ${text}`);
}

if (hasFreshPublicBuild) {
  const marketOutputPath = path.join(root, "_site", "commercial-real-estate", "CA", "san-francisco", "index.html");
  const marketHtml = fs.readFileSync(marketOutputPath, "utf8");
  for (const slug of districtSlugs) {
    const expectedPath = `/commercial-real-estate/CA/san-francisco/${slug}/`;
    if (!marketHtml.includes(`href="${expectedPath}"`)) fail(`SF market page does not link to ${slug}`);
  }
}

const warehouseOutput = path.join(root, "_site", "commercial-real-estate", "CA", "san-francisco", "warehouse-space", "index.html");
if (hasFreshPublicBuild && fs.existsSync(warehouseOutput)) fail("A dedicated SF warehouse route was created unexpectedly");

if (errors.length) {
  console.error(errors.map((error) => `SF Industrial/Flex Public Decision QA error: ${error}`).join("\n"));
  process.exit(1);
}

console.log("SF Industrial/Flex Public Decision Path QA");
console.log("- district pages: 2");
console.log("- Industrial hub choices: 6");
console.log("- Flex hub choices: 5");
console.log("- SF market links to industrial decision districts: 2");
console.log("- Office model additions: 0");
console.log("- warehouse route additions: 0");
console.log("SF Industrial/Flex Public Decision Path QA passed.");
