const fs = require("fs");
const path = require("path");
const buildingPages = require("../_data/buildings.js");

const SITE_DIR = path.join(__dirname, "..", "_site");
const profilePages = buildingPages.filter((building) => building.building_brief);

const forbiddenPublicTerms = [
  "Building Brief",
  "Representative Building Brief",
  "Rofo Take",
  "Why This Building Matters",
  "Representative Role",
  "Operational Profile",
  "Building Experience",
  "Representative Companies",
  "Source Supported",
  "Source-supported",
  "According to the source",
  "Editorial Interpretation",
  "Representative Building Status",
];

const requiredPublicTerms = [
  "Building Profile",
  "Building Snapshot",
  "Best Fit",
  "Location & Building Characteristics",
  "Location Advantages and Things to Consider",
  "What to Verify",
  "Confirm the live market before acting",
];

const errors = [];
const warnings = [];

function htmlPathFor(url) {
  return path.join(SITE_DIR, url.replace(/^\//, ""), "index.html");
}

function textFromHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function headingsFromHtml(html) {
  const headings = [];
  const headingRegex = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  let match;
  while ((match = headingRegex.exec(html))) {
    headings.push(textFromHtml(match[1]));
  }
  return headings;
}

function titleFromHtml(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? textFromHtml(match[1]) : "";
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  values.forEach((value) => {
    if (!value) return;
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });
  return [...duplicates];
}

function requireField(condition, message) {
  if (!condition) errors.push(message);
}

function analyzeProfile(building) {
  const htmlPath = htmlPathFor(building.building_path);
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, "utf8") : "";
  const text = textFromHtml(html);
  const headings = headingsFromHtml(html);
  const title = titleFromHtml(html);
  const label = building.display_name || building.name || building.address || building.building_path;

  requireField(Boolean(html), `${label}: rendered page missing`);
  requiredPublicTerms.forEach((term) => {
    requireField(text.includes(term), `${label}: missing public term "${term}"`);
  });
  forbiddenPublicTerms.forEach((term) => {
    if (text.includes(term)) errors.push(`${label}: internal public term rendered "${term}"`);
  });
  requireField(!/source (identifies|describes|indicates)/i.test(text), `${label}: visible source attribution leaked`);
  requireField(!/representative role/i.test(text), `${label}: representative-role terminology leaked`);
  requireField(!/editorial interpretation/i.test(text), `${label}: editorial-interpretation terminology leaked`);
  requireField(!/Source-supported/i.test(text), `${label}: source-supported terminology leaked`);
  requireField(!/(industrial_flex|small_bay_industrial|warehouse_distribution_environment|contractor_service_cluster)/.test(text), `${label}: raw taxonomy ID rendered`);
  requireField(title.includes("Building Profile"), `${label}: page title does not use Building Profile`);
  requireField(!title.includes("Representative Commercial Building"), `${label}: page title uses old representative-building terminology`);
  requireField(html.includes("building-brief-journey"), `${label}: internal Building Brief architecture marker missing`);
  requireField(html.includes("building-snapshot-icon"), `${label}: snapshot icon marker missing`);

  const duplicates = duplicateValues(headings);
  if (duplicates.length) errors.push(`${label}: duplicate headings ${duplicates.join(", ")}`);
  if (headings.includes("Building Experience")) errors.push(`${label}: old Building Experience heading still rendered`);
  if (headings.includes("Representative Companies")) errors.push(`${label}: old Representative Companies heading still rendered`);

  return {
    label,
    url: building.building_path,
    headingCount: headings.length,
    hasOperations: text.includes("Location & Building Characteristics"),
  };
}

const rows = profilePages.map(analyzeProfile);

requireField(profilePages.length >= 24, `expected at least 24 Building Profiles after Sacramento migration, found ${profilePages.length}`);
requireField(rows.every((row) => row.hasOperations), "one or more Building Profiles missing simplified characteristics section");

console.log("Building Profile Template Simplification QA");
console.log(`Profiles checked: ${rows.length}`);
rows.slice(0, 8).forEach((row) => {
  console.log(`- ${row.label} | ${row.url} | headings ${row.headingCount}`);
});
if (rows.length > 8) console.log(`- +${rows.length - 8} more profiles`);
if (warnings.length) console.log(`Warnings: ${warnings.join("; ")}`);
console.log(`Errors: ${errors.length ? errors.join("; ") : "none"}`);
if (errors.length) process.exit(1);
