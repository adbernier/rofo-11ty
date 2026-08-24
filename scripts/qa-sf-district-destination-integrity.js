#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const locationKnowledgeGraph = require("../_data/locationKnowledgeGraph.js");
const neighborhoodPages = require("../_data/neighborhoodPages.js");
const commercialMarketEvidence = require("../_data/commercialMarketEvidence.js");
const commercialBuildingIntelligence = require("../_data/commercialBuildingIntelligence.js");
const districtCompatibilityRedirects = require("../_data/districtCompatibilityRedirects.js");
const sfIndustrialFlexPublicDecision = require("../_data/sfIndustrialFlexPublicDecision.js");

const root = path.join(__dirname, "..");
const errors = [];
const fail = (message) => errors.push(message);
const publicDistricts = ["showplace-square", "potrero-hill"];
const designPath = "/commercial-real-estate/CA/san-francisco/design-district/";
const showplacePath = "/commercial-real-estate/CA/san-francisco/showplace-square/";

for (const slug of publicDistricts) {
  const districtPath = `/commercial-real-estate/CA/san-francisco/${slug}/`;
  const graphNode = locationKnowledgeGraph.find((node) => node.path === districtPath);
  const page = neighborhoodPages.find((item) => item.canonical_neighborhood_path === districtPath);
  const evidence = commercialMarketEvidence.collections.find((collection) => collection.district?.districtPath === districtPath);
  const buildings = commercialBuildingIntelligence.byDistrictPath[districtPath] || [];
  if (!graphNode) fail(`${slug} canonical graph record is missing`);
  if (!page || page.noindex) fail(`${slug} substantive indexable public page is missing`);
  if (!page?.commercial_location_model || !page?.district_identity) fail(`${slug} lacks public decision content`);
  if ((page?.commercial_location_model?.decision_guidance || []).length < 4) fail(`${slug} lacks validation guidance`);
  if (!evidence?.records?.length) fail(`${slug} CME is missing`);
  if (!buildings.length) fail(`${slug} representative building intelligence is missing`);
}

if (neighborhoodPages.some((page) => page.canonical_neighborhood_path === designPath)) {
  fail("Design District must not generate a competing substantive district page");
}
if (!districtCompatibilityRedirects.some((redirect) => redirect.from === designPath && redirect.to === showplacePath && redirect.status === 301)) {
  fail("Design District compatibility redirect is missing or incorrect");
}

for (const guide of [sfIndustrialFlexPublicDecision.industrial, sfIndustrialFlexPublicDecision.flex]) {
  const entries = guide.entries || (guide.groups || []).flatMap((group) => group.entries || []);
  const showplace = entries.find((entry) => entry.id === "showplace-square");
  if (showplace?.path !== showplacePath) fail(`${guide.title} does not link Showplace Square`);
}
const siteRoot = path.join(root, "_site");
const buildingRoot = path.join(siteRoot, "commercial-real-estate", "building", "CA", "san-francisco");
if (fs.existsSync(buildingRoot)) {
  const redirectsPath = path.join(siteRoot, "_redirects");
  const redirectMap = new Map();
  if (fs.existsSync(redirectsPath)) {
    for (const line of fs.readFileSync(redirectsPath, "utf8").split(/\r?\n/)) {
      const [from, to, status] = line.trim().split(/\s+/);
      if (from && to && status) redirectMap.set(from, { to, status: Number(status) });
    }
  }

  const sfDistrictPaths = new Set(
    locationKnowledgeGraph
      .filter((node) => node.type === "district" && node.city === "San Francisco" && node.state === "CA")
      .map((node) => node.path)
  );
  const buildingFiles = fs.readdirSync(buildingRoot)
    .map((slug) => path.join(buildingRoot, slug, "index.html"))
    .filter((file) => fs.existsSync(file));
  const linkedPagesByDistrict = new Map();
  const broken = [];

  for (const file of buildingFiles) {
    const html = fs.readFileSync(file, "utf8");
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
    for (const href of new Set(hrefs.filter((value) => sfDistrictPaths.has(value)))) {
      if (!linkedPagesByDistrict.has(href)) linkedPagesByDistrict.set(href, new Set());
      linkedPagesByDistrict.get(href).add(file);
      const output = path.join(siteRoot, href.replace(/^\//, ""), "index.html");
      const redirect = redirectMap.get(href);
      const redirectOutput = redirect ? path.join(siteRoot, redirect.to.replace(/^\//, ""), "index.html") : "";
      if (!fs.existsSync(output) && !(redirect && redirect.status === 301 && fs.existsSync(redirectOutput))) {
        broken.push({ file, href });
      }
    }
  }

  if (broken.length) {
    for (const item of broken) fail(`Generated Building Profile link has no destination: ${path.relative(root, item.file)} -> ${item.href}`);
  }

  const expectedBeforeCounts = new Map([[showplacePath, 36], [designPath, 14], ["/commercial-real-estate/CA/san-francisco/potrero-hill/", 30]]);
  for (const [districtPath, minimum] of expectedBeforeCounts) {
    if ((linkedPagesByDistrict.get(districtPath)?.size || 0) < minimum) fail(`${districtPath} lost expected Building Profile inbound relationships`);
  }

  const sitemap = fs.readFileSync(path.join(siteRoot, "sitemap.xml"), "utf8");
  for (const slug of publicDistricts) {
    const districtPath = `/commercial-real-estate/CA/san-francisco/${slug}/`;
    const output = path.join(siteRoot, districtPath.replace(/^\//, ""), "index.html");
    const html = fs.readFileSync(output, "utf8");
    if (!html.includes(`<link rel="canonical" href="https://www.rofo.com${districtPath}">`)) fail(`${slug} is not self-canonical`);
    if (/noindex/i.test(html)) fail(`${slug} contains noindex`);
    if (!sitemap.includes(`https://www.rofo.com${districtPath}`)) fail(`${slug} is absent from sitemap`);
  }
  if (sitemap.includes(`https://www.rofo.com${designPath}`)) fail("Design District compatibility path must not enter sitemap");
  if (fs.existsSync(path.join(siteRoot, designPath.replace(/^\//, ""), "index.html"))) fail("Design District generated duplicate HTML");

  console.log(`- generated SF Building Profiles checked: ${buildingFiles.length}`);
  console.log(`- Showplace Square inbound Building Profiles: ${linkedPagesByDistrict.get(showplacePath)?.size || 0}`);
  console.log(`- Design District compatibility inbound Building Profiles: ${linkedPagesByDistrict.get(designPath)?.size || 0}`);
  console.log(`- Potrero Hill inbound Building Profiles: ${linkedPagesByDistrict.get("/commercial-real-estate/CA/san-francisco/potrero-hill/")?.size || 0}`);
  console.log(`- broken canonical district destinations: ${broken.length}`);
}

if (errors.length) {
  console.error(errors.map((error) => `SF District Destination Integrity QA error: ${error}`).join("\n"));
  process.exit(1);
}

console.log("SF District Destination Integrity QA passed.");
