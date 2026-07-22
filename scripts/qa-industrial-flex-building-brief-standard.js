const fs = require("fs");
const path = require("path");
const buildingPages = require("../_data/buildingPages");
const commercialEcosystemTaxonomy = require("../_data/commercialEcosystemTaxonomy");
const representativeTaxonomy = require("../_data/representativeBuildingIntelligenceTaxonomy");
const sacramentoBriefs = require("../_data/sacramentoIndustrialFlexBuildingBriefs");
const publisherAnalysis = require("../data/generated/publisher-analysis.json");
const publisherPlans = require("../data/generated/publisher-expansion-plans.json");

const expectedPaths = new Set(sacramentoBriefs.calibrationSet || []);
const validEcosystems = new Set(commercialEcosystemTaxonomy.ecosystems.map((item) => item.id));
const subtypeById = commercialEcosystemTaxonomy.subtypeById;
const validActivities = new Set(commercialEcosystemTaxonomy.businessActivities.map((item) => item.id));
const validArchetypes = new Set(commercialEcosystemTaxonomy.businessArchetypes.map((item) => item.id));
const validRoles = representativeTaxonomy.representativeRoleById;
const validCharacteristics = representativeTaxonomy.operationalCharacteristicById;

const forbiddenOutput = /\b(N\/A|undefined|\[object Object\])\b/;
const brokeragePhrases = /\b(premier|highly desirable|state-of-the-art|best-in-class|rare opportunity|perfect for|current availability|asking rent|vacancy)\b/i;
const tenantClaimPhrases = /\b(occupied by|home to)\b/i;
const rankingPhrases = /\b(score|rank|recommended district score)\b/i;

function normalizeUrl(url) {
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

function sitePathForUrl(url) {
  return path.join(__dirname, "..", "_site", normalizeUrl(url).replace(/^\/+/, ""), "index.html");
}

function textValues(value) {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(textValues);
  if (typeof value === "object") return Object.values(value).flatMap(textValues);
  return [String(value)];
}

function wordCount(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function requireField(condition, message, errors) {
  if (!condition) errors.push(message);
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = [];
  for (const value of values || []) {
    if (!value) continue;
    if (seen.has(value)) duplicates.push(value);
    seen.add(value);
  }
  return unique(duplicates);
}

function publisherMetro(id) {
  const metros = publisherAnalysis.analysis?.metros || publisherAnalysis.metros || [];
  return metros.find((metro) => metro.metroId === id || metro.id === id);
}

function planMetro(id) {
  const metros = publisherPlans.plans || publisherPlans.metros || [];
  return metros.find((metro) => metro.metroId === id || metro.id === id);
}

function analyzeBrief(building) {
  const errors = [];
  const warnings = [];
  const brief = building.building_brief || {};
  const ecosystem = brief.ecosystemContext || {};
  const businessFit = brief.businessFit || {};
  const operationalProfile = brief.operationalProfile || [];
  const explanation = brief.environmentExplanation || {};
  const comparison = brief.comparisonContext || {};
  const evidence = brief.evidence || {};
  const sourceNotes = evidence.sourceNotes || [];
  const text = textValues(brief).join("\n");
  const role = validRoles[ecosystem.representativeRole];
  const htmlPath = sitePathForUrl(building.building_path);
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, "utf8") : "";

  requireField(expectedPaths.has(building.building_path), `${building.building_path}: not in calibration set`, errors);
  requireField(building.commercial_building_intelligence, `${building.building_path}: missing Commercial Building Intelligence`, errors);
  requireField(validEcosystems.has(ecosystem.primaryEcosystem), `${building.building_path}: invalid primary ecosystem`, errors);
  requireField(ecosystem.primaryEcosystem === "industrial_flex", `${building.building_path}: primary ecosystem is not industrial_flex`, errors);
  requireField(role, `${building.building_path}: invalid representative role`, errors);
  if (role) {
    requireField(role.ecosystemId === ecosystem.primaryEcosystem, `${building.building_path}: role ecosystem mismatch`, errors);
  }

  for (const subtype of ecosystem.ecosystemSubtypes || []) {
    const record = subtypeById[subtype];
    requireField(record, `${building.building_path}: invalid subtype ${subtype}`, errors);
    if (record) requireField(record.ecosystemId === ecosystem.primaryEcosystem, `${building.building_path}: subtype ${subtype} not industrial_flex`, errors);
  }
  for (const activity of businessFit.activities || []) {
    requireField(validActivities.has(activity), `${building.building_path}: invalid activity ${activity}`, errors);
  }
  for (const archetype of businessFit.archetypes || []) {
    requireField(validArchetypes.has(archetype), `${building.building_path}: invalid archetype ${archetype}`, errors);
  }
  for (const characteristic of brief.operationalCharacteristics || []) {
    const record = validCharacteristics[characteristic];
    requireField(record, `${building.building_path}: invalid operational characteristic ${characteristic}`, errors);
    if (record) requireField(record.applicableEcosystems.includes("industrial_flex"), `${building.building_path}: characteristic ${characteristic} not industrial/flex`, errors);
  }

  requireField(wordCount(brief.summary || brief.buildingSummary) >= 40, `${building.building_path}: hero summary too thin`, errors);
  requireField(wordCount(brief.summary || brief.buildingSummary) <= 90, `${building.building_path}: hero summary too long`, errors);
  requireField(wordCount(brief.buildingImportance) >= 35, `${building.building_path}: building importance too thin`, errors);
  requireField((brief.quickFacts || []).length >= 5, `${building.building_path}: fewer than five quick facts`, errors);
  requireField((brief.idealFor || []).length >= 3, `${building.building_path}: fewer than three ideal-fit entries`, errors);
  requireField((brief.mayNotFit || []).length >= 2, `${building.building_path}: fewer than two may-not-fit entries`, errors);
  requireField((brief.advantages || []).length >= 3, `${building.building_path}: fewer than three advantages`, errors);
  requireField((brief.tradeoffs || []).length >= 3, `${building.building_path}: fewer than three tradeoffs`, errors);
  requireField((brief.validationNotes || []).length >= 4, `${building.building_path}: fewer than four validation questions`, errors);
  requireField((brief.nearbyAlternatives || []).length >= 3, `${building.building_path}: fewer than three nearby alternatives`, errors);
  requireField(operationalProfile.length >= 3, `${building.building_path}: operational profile too thin`, errors);
  requireField(explanation.whyItExists && explanation.whyChooseThisEnvironment && explanation.representativeValue, `${building.building_path}: incomplete environment explanation`, errors);
  requireField((comparison.relatedDistricts || []).length >= 2, `${building.building_path}: comparison district context too thin`, errors);
  requireField(sourceNotes.length, `${building.building_path}: missing source notes`, errors);
  requireField(evidence.confidence, `${building.building_path}: missing evidence confidence`, errors);
  requireField(evidence.provenance && evidence.provenance.editorialInterpretation, `${building.building_path}: missing evidence provenance`, errors);

  const alternativeUrls = (brief.nearbyAlternatives || []).map((item) => normalizeUrl(item.url));
  const duplicateAlternatives = duplicateValues(alternativeUrls);
  if (duplicateAlternatives.length) errors.push(`${building.building_path}: duplicate alternatives ${duplicateAlternatives.join(", ")}`);
  if (alternativeUrls.includes(normalizeUrl(building.building_path))) errors.push(`${building.building_path}: self-linked alternative`);

  if (forbiddenOutput.test(text)) errors.push(`${building.building_path}: malformed placeholder text`);
  if (brokeragePhrases.test(text)) errors.push(`${building.building_path}: brokerage or time-sensitive phrase detected`);
  if (tenantClaimPhrases.test(text)) errors.push(`${building.building_path}: possible tenant claim detected`);
  if (rankingPhrases.test(text)) errors.push(`${building.building_path}: recommendation-ranking language detected`);
  if (!text.includes("not claims about current occupants") && !text.includes("not current tenancy") && !text.includes("not claims about current occupancy") && !text.includes("do not imply current occupancy") && !text.includes("do not identify current tenants")) {
    errors.push(`${building.building_path}: archetype/tenant distinction missing`);
  }
  if (!text.toLowerCase().includes("permitted use")) errors.push(`${building.building_path}: missing permitted-use validation`);
  if (!html) errors.push(`${building.building_path}: generated page missing`);
  if (html && !html.includes("building-brief-journey")) errors.push(`${building.building_path}: generated page missing Building Brief journey`);
  if (html && !html.includes("Location & Building Characteristics") && !html.includes("Location &amp; Building Characteristics")) errors.push(`${building.building_path}: generated page missing characteristics section`);
  if (html && forbiddenOutput.test(html)) errors.push(`${building.building_path}: generated HTML contains malformed placeholder`);
  if (html && /industrial_flex|small_bay_industrial|contractor_service|warehouse_distribution_environment/.test(html)) {
    errors.push(`${building.building_path}: raw taxonomy ID rendered publicly`);
  }

  for (const item of operationalProfile) {
    if (wordCount(item.summary) > 45) warnings.push(`${building.building_path}: long operational profile item ${item.label}`);
  }

  return {
    name: building.display_name || building.name || building.address,
    url: building.building_path,
    district: building.commercial_building_intelligence.identity.canonicalDistrict.name,
    role: ecosystem.representativeRole,
    subtypes: ecosystem.ecosystemSubtypes || [],
    activities: businessFit.activities || [],
    archetypes: businessFit.archetypes || [],
    operationalCharacteristics: brief.operationalCharacteristics || [],
    errors,
    warnings,
  };
}

function main() {
  const buildings = buildingPages.filter((building) => expectedPaths.has(building.building_path));
  const errors = [];
  const warnings = [];
  const rows = buildings.map(analyzeBrief);
  const missingPaths = [...expectedPaths].filter((expectedPath) => !buildings.some((building) => building.building_path === expectedPath));

  missingPaths.forEach((missingPath) => errors.push(`missing migrated Building Brief: ${missingPath}`));

  const roleSet = new Set(rows.map((row) => row.role));
  const subtypeSet = new Set(rows.flatMap((row) => row.subtypes));
  const districtSet = new Set(rows.map((row) => row.district));
  const activitySet = new Set(rows.flatMap((row) => row.activities));
  const archetypeSet = new Set(rows.flatMap((row) => row.archetypes));

  requireField(rows.length >= 6 && rows.length <= 8, `calibration set should contain 6-8 Briefs, found ${rows.length}`, errors);
  requireField(roleSet.size >= 6, `calibration set has insufficient role breadth: ${roleSet.size}`, errors);
  requireField(subtypeSet.size >= 6, `calibration set has insufficient subtype breadth: ${subtypeSet.size}`, errors);
  requireField(districtSet.size >= 3, `calibration set has insufficient district breadth: ${districtSet.size}`, errors);
  requireField(activitySet.has("service_dispatch"), "calibration set missing service dispatch activity", errors);
  requireField(activitySet.has("distribution"), "calibration set missing distribution activity", errors);
  requireField(activitySet.has("light_manufacturing"), "calibration set missing light manufacturing activity", errors);
  requireField(archetypeSet.has("general_contractor"), "calibration set missing contractor archetype", errors);
  requireField(archetypeSet.has("distributor"), "calibration set missing distributor archetype", errors);

  const sacramento = publisherMetro("sacramento");
  const plan = planMetro("sacramento");
  const industrial = (sacramento?.ecosystemReadiness?.evaluations || sacramento?.ecosystemReadiness?.ecosystems || []).find((item) => item.ecosystemId === "industrial_flex");
  const recommendedSprint = plan?.recommendedEcosystemSprint?.title || sacramento?.recommendedEcosystemSprint?.title || "";
  const briefCount = industrial?.counts?.buildingBriefs || industrial?.buildingBriefCount || 0;

  requireField(briefCount >= rows.length, `Publisher did not recognize migrated industrial/flex Brief count: ${briefCount}`, errors);
  requireField(!/Industrial & Flex Ecosystem Building Brief Migration$/i.test(recommendedSprint), "Publisher still recommends the exact first-wave industrial/flex Brief migration", errors);

  console.log("Industrial & Flex Building Brief Standard QA");
  console.log(`Calibration Briefs: ${rows.length}`);
  console.log(`Districts: ${[...districtSet].sort().join(", ")}`);
  console.log(`Roles: ${[...roleSet].sort().join(", ")}`);
  console.log(`Subtypes: ${[...subtypeSet].sort().join(", ")}`);
  console.log(`Activities: ${[...activitySet].sort().join(", ")}`);
  console.log(`Archetypes: ${[...archetypeSet].sort().join(", ")}`);
  console.log(`Publisher industrial/flex Brief count: ${briefCount}`);
  console.log(`Recommended ecosystem sprint: ${recommendedSprint || "none"}`);

  for (const row of rows) {
    console.log(`- ${row.name} | ${row.url} | ${row.district} | ${row.role}`);
    errors.push(...row.errors);
    warnings.push(...row.warnings);
  }

  console.log(`Errors: ${errors.length ? unique(errors).join("; ") : "none"}`);
  console.log(`Warnings: ${warnings.length ? unique(warnings).join("; ") : "none"}`);

  if (errors.length) process.exitCode = 1;
}

main();
