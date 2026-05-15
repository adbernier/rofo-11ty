const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const LINEAGE_PATH = path.join(ROOT, "data/peter/atlanta/lineage/atlanta_lineage_objects.json");
const OUTPUT_PATH = path.join(ROOT, "data/peter/atlanta/intelligence/neighborhood_diversity_metrics.json");
const REPORT_PATH = path.join(ROOT, "data/peter/atlanta/reports/atlanta_diversity_review.md");

function addCount(map, key, amount = 1) {
  const normalized = key || "unknown";
  map.set(normalized, (map.get(normalized) || 0) + amount);
}

function sortedCounts(map) {
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function pct(value) {
  return Math.round(value * 1000) / 10;
}

function entropyDistribution(counts, total) {
  if (!total || counts.length <= 1) return 0;
  const entropy = counts.reduce((sum, item) => {
    const share = item.count / total;
    return share > 0 ? sum - share * Math.log(share) : sum;
  }, 0);
  const maxEntropy = Math.log(counts.length);
  return maxEntropy ? entropy / maxEntropy : 0;
}

function diversityScore({ total, uniqueCompanies, uniqueContacts, uniqueBuildings, spaceCounts, provenanceCounts, topCompanyShare, coworkingConcentration, duplicateListingRatio }) {
  const companyBreadth = Math.min(uniqueCompanies / Math.max(total / 20, 1), 1);
  const contactBreadth = Math.min(uniqueContacts / Math.max(total / 25, 1), 1);
  const buildingBreadth = Math.min(uniqueBuildings / Math.max(total / 12, 1), 1);
  const spaceDiversity = entropyDistribution(spaceCounts, total);
  const provenanceDiversity = entropyDistribution(provenanceCounts, total);
  const concentrationPenalty = Math.min(topCompanyShare * 0.45 + coworkingConcentration * 0.25 + duplicateListingRatio * 0.3, 1);

  return Math.round(
    100 *
      Math.max(
        0,
        companyBreadth * 0.18 +
          contactBreadth * 0.12 +
          buildingBreadth * 0.22 +
          spaceDiversity * 0.25 +
          provenanceDiversity * 0.08 +
          (1 - concentrationPenalty) * 0.15
      )
  );
}

function concentrationScore({ topCompanyShare, coworkingConcentration, duplicateListingRatio, topSpaceShare, topProvenanceShare }) {
  return Math.round(
    100 *
      Math.min(
        1,
        topCompanyShare * 0.28 +
          coworkingConcentration * 0.22 +
          duplicateListingRatio * 0.18 +
          topSpaceShare * 0.18 +
          topProvenanceShare * 0.14
      )
  );
}

function summarizeNeighborhood(name, rows) {
  const companies = new Set();
  const contacts = new Set();
  const portfolios = new Set();
  const buildings = new Set();
  const listings = new Set();
  const listingPairs = new Set();
  const spaceCounts = new Map();
  const companyCounts = new Map();
  const contactCounts = new Map();
  const portfolioCounts = new Map();
  const ingestionCounts = new Map();
  const provenanceCounts = new Map();
  let unknownCompanyRows = 0;
  let rowsWithProvenanceEntities = 0;
  let coworkingRows = 0;

  for (const row of rows) {
    const provenanceEntities = row.provenance_entities?.length ? row.provenance_entities : [row.origin_company || row.company].filter(Boolean);
    if (row.origin_company || row.company) companies.add(row.origin_company || row.company);
    if (row.listing_contact?.user_id) contacts.add(row.listing_contact.user_id);
    if (row.portfolio_group) portfolios.add(row.portfolio_group);
    if (row.building_id) buildings.add(row.building_id);
    if (row.listing_id) listings.add(row.listing_id);
    if (row.listing_id && row.building_id) listingPairs.add(`${row.listing_id}:${row.building_id}`);
    addCount(spaceCounts, row.space_type);
    if (row.origin_company || row.company) {
      addCount(companyCounts, row.origin_company || row.company);
    } else {
      unknownCompanyRows += 1;
    }
    addCount(contactCounts, row.listing_contact?.name || row.listing_contact?.user_id || "unknown");
    addCount(portfolioCounts, row.portfolio_group || "none");
    addCount(ingestionCounts, row.ingestion_origin || "unknown");
    if (provenanceEntities.length) rowsWithProvenanceEntities += 1;
    for (const entity of provenanceEntities) addCount(provenanceCounts, entity);
    if (row.portfolio_group === "coworking_operator") coworkingRows += 1;
  }

  const total = rows.length;
  const sortedCompanies = sortedCounts(companyCounts);
  const sortedSpaces = sortedCounts(spaceCounts);
  const sortedIngestionOrigins = sortedCounts(ingestionCounts);
  const sortedProvenanceEntities = sortedCounts(provenanceCounts);
  const topCompany = sortedCompanies[0] || { key: "unknown", count: 0 };
  const topSpace = sortedSpaces[0] || { key: "unknown", count: 0 };
  const topIngestionOrigin = sortedIngestionOrigins[0] || { key: "unknown", count: 0 };
  const topProvenanceEntity = sortedProvenanceEntities[0] || { key: "unknown", count: 0 };
  const duplicateListingRatio = total ? 1 - listingPairs.size / total : 0;
  const topCompanyShare = total ? topCompany.count / total : 0;
  const coworkingConcentration = total ? coworkingRows / total : 0;
  const topSpaceShare = total ? topSpace.count / total : 0;
  const topIngestionShare = total ? topIngestionOrigin.count / total : 0;
  const topProvenanceShare = total ? topProvenanceEntity.count / total : 0;
  const knownCompanyCoverage = total ? (total - unknownCompanyRows) / total : 0;
  const knownProvenanceCoverage = total ? rowsWithProvenanceEntities / total : 0;

  const scoreInputs = {
    total,
    uniqueCompanies: companies.size,
    uniqueContacts: contacts.size,
    uniqueBuildings: buildings.size,
    spaceCounts: sortedSpaces,
    provenanceCounts: sortedProvenanceEntities,
    topCompanyShare,
    coworkingConcentration,
    duplicateListingRatio,
    topSpaceShare,
    topProvenanceShare,
  };

  return {
    neighborhood: name,
    lineage_object_count: total,
    unique_companies: companies.size,
    unique_listing_contacts: contacts.size,
    unique_portfolios: portfolios.size,
    unique_buildings: buildings.size,
    unique_listings: listings.size,
    space_type_distribution: sortedSpaces,
    ingestion_origin_distribution: sortedIngestionOrigins,
    provenance_entity_distribution: sortedProvenanceEntities,
    top_companies: sortedCompanies.slice(0, 10),
    top_contacts: sortedCounts(contactCounts).slice(0, 10),
    top_portfolios: sortedCounts(portfolioCounts).slice(0, 10),
    top_provenance_entities: sortedProvenanceEntities.slice(0, 10),
    known_origin_company_coverage: pct(knownCompanyCoverage),
    known_provenance_entity_coverage: pct(knownProvenanceCoverage),
    coworking_concentration: pct(coworkingConcentration),
    top_company_concentration: pct(topCompanyShare),
    top_space_type_concentration: pct(topSpaceShare),
    top_ingestion_origin_concentration: pct(topIngestionShare),
    top_provenance_entity_concentration: pct(topProvenanceShare),
    duplicate_listing_ratio: pct(duplicateListingRatio),
    diversity_score: diversityScore(scoreInputs),
    concentration_score: concentrationScore(scoreInputs),
    warnings: warningsFor({
      topCompany,
      topCompanyShare,
      topProvenanceEntity,
      topProvenanceShare,
      knownCompanyCoverage,
      knownProvenanceCoverage,
      coworkingConcentration,
      duplicateListingRatio,
      uniqueCompanies: companies.size,
      uniqueBuildings: buildings.size,
      total,
    }),
  };
}

function warningsFor(metrics) {
  const warnings = [];
  if (metrics.topProvenanceShare >= 0.55) warnings.push(`Top provenance entity ${metrics.topProvenanceEntity.key} represents ${pct(metrics.topProvenanceShare)}% of lineage rows.`);
  if (metrics.topCompanyShare >= 0.5) warnings.push(`Top originating company ${metrics.topCompany.key} represents ${pct(metrics.topCompanyShare)}% of lineage rows.`);
  if (metrics.knownCompanyCoverage < 0.25 && metrics.total >= 100) warnings.push(`Originating company coverage is low at ${pct(metrics.knownCompanyCoverage)}% of lineage rows.`);
  if (metrics.knownProvenanceCoverage < 0.25 && metrics.total >= 100) warnings.push(`True provenance entity coverage is low at ${pct(metrics.knownProvenanceCoverage)}% of lineage rows.`);
  if (metrics.coworkingConcentration >= 0.25) warnings.push(`Coworking/operator concentration is ${pct(metrics.coworkingConcentration)}%.`);
  if (metrics.duplicateListingRatio >= 0.15) warnings.push(`Duplicate listing ratio is ${pct(metrics.duplicateListingRatio)}%.`);
  if (metrics.uniqueCompanies < 5 && metrics.total >= 100) warnings.push("Low identifiable originating-company diversity for the number of rows.");
  if (metrics.uniqueBuildings < 10) warnings.push("Small building sample; avoid strong public conclusions.");
  return warnings;
}

function formatDistribution(items, limit = 4) {
  return items.slice(0, limit).map((item) => `${item.key} ${item.count}`).join(", ") || "none";
}

function buildReport(output) {
  const metrics = output.neighborhoods;
  const byDiversity = metrics.slice().sort((a, b) => b.diversity_score - a.diversity_score);
  const byConcentration = metrics.slice().sort((a, b) => b.concentration_score - a.concentration_score);
  const coworkingHeavy = metrics
    .filter((item) => item.coworking_concentration >= 10)
    .sort((a, b) => b.coworking_concentration - a.coworking_concentration);
  const broadMarket = metrics
    .filter((item) => item.unique_buildings >= 150 && item.diversity_score >= 45)
    .sort((a, b) => b.unique_buildings - a.unique_buildings);

  const lines = [];
  lines.push("# Atlanta Diversity Review");
  lines.push("");
  lines.push(`Date: ${new Date().toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push("## Purpose");
  lines.push("");
  lines.push("This report reviews Atlanta neighborhood lineage diversity before expanding confidence-aware neighborhood intelligence extraction.");
  lines.push("");
  lines.push("Lineage rows are historical internal signals, not live inventory or current availability.");
  lines.push("");
  lines.push("LMS is treated as Rofo's internal ingestion system. It is not treated as a single external market data source and does not by itself reduce diversity or confidence scores.");
  lines.push("");
  lines.push("## Neighborhood Metrics");
  lines.push("");
  lines.push("| Neighborhood | Rows | Buildings | Origin companies | Contacts | Top space types | Top provenance entity | Coworking % | Diversity | Concentration |");
  lines.push("| --- | ---: | ---: | ---: | ---: | --- | --- | ---: | ---: | ---: |");
  for (const item of metrics) {
    lines.push(`| ${item.neighborhood} | ${item.lineage_object_count} | ${item.unique_buildings} | ${item.unique_companies} | ${item.unique_listing_contacts} | ${formatDistribution(item.space_type_distribution)} | ${item.top_provenance_entities[0]?.key || "unknown"} ${item.top_provenance_entity_concentration}% | ${item.coworking_concentration}% | ${item.diversity_score} | ${item.concentration_score} |`);
  }
  lines.push("");
  lines.push("## Strongest Neighborhood Diversity");
  lines.push("");
  for (const item of byDiversity.slice(0, 5)) {
    lines.push(`- ${item.neighborhood}: diversity score ${item.diversity_score}, ${item.unique_buildings} buildings, ${item.unique_companies} identifiable originating companies, top space types ${formatDistribution(item.space_type_distribution)}.`);
  }
  lines.push("");
  lines.push("## Heavily Concentrated Neighborhoods");
  lines.push("");
  for (const item of byConcentration.slice(0, 5)) {
    lines.push(`- ${item.neighborhood}: concentration score ${item.concentration_score}. Key warnings: ${item.warnings.join(" ") || "none"}`);
  }
  lines.push("");
  lines.push("## Coworking-Heavy Areas");
  lines.push("");
  if (!coworkingHeavy.length) {
    lines.push("- No Atlanta focus neighborhood crossed the 10% coworking/operator concentration threshold in the lineage layer.");
  } else {
    for (const item of coworkingHeavy) {
      lines.push(`- ${item.neighborhood}: ${item.coworking_concentration}% coworking/operator rows.`);
    }
  }
  lines.push("");
  lines.push("## Broad Market Representation");
  lines.push("");
  for (const item of broadMarket) {
    lines.push(`- ${item.neighborhood}: broad building coverage with ${item.unique_buildings} unique buildings and ${item.lineage_object_count} lineage rows. Still review true provenance coverage and concentration before public use.`);
  }
  if (!broadMarket.length) lines.push("- No neighborhood currently meets the broad-market threshold without source concentration caveats.");
  lines.push("");
  lines.push("## Warnings");
  lines.push("");
  lines.push("- LMS concentration is no longer treated as source concentration. It is a neutral Rofo ingestion-origin field.");
  lines.push("- True provenance diversity is measured from origin companies, contacts, broker/portfolio groups, non-LMS feed groups, and provenance entity rollups.");
  lines.push("- Company and brokerage fields depend on relationship/user/broker-house joins and are incomplete for many historical listing rows.");
  lines.push("- Rent fields remain internal only and should not be used in public neighborhood intelligence.");
  lines.push("- Centroid-based neighborhood assignment is useful for research but not a boundary-quality geography model.");
  lines.push("");
  lines.push("## Recommended Next Intelligence Steps");
  lines.push("");
  lines.push("1. Use lineage diversity thresholds before publishing neighborhood-level signals.");
  lines.push("2. Treat Office, Retail, and Industrial/Flex patterns as candidates only when they have broad building support and acceptable concentration scores.");
  lines.push("3. Keep source-bias, coworking/operator, price, and move-in-ready language internal.");
  lines.push("4. Add richer raw listing description coverage for Atlanta before extracting building-character or tenant-fit semantics.");
  lines.push("5. Review Buckhead, Midtown, Downtown Atlanta, Perimeter Center, and West Midtown manually before any public chip changes.");
  lines.push("");
  return lines.join("\n");
}

function main() {
  const lineage = JSON.parse(fs.readFileSync(LINEAGE_PATH, "utf8"));
  const groups = new Map();

  for (const object of lineage.objects || []) {
    const neighborhood = object.assigned_neighborhood || object.neighborhood || "Unassigned";
    if (!groups.has(neighborhood)) groups.set(neighborhood, []);
    groups.get(neighborhood).push(object);
  }

  const neighborhoods = Array.from(groups.entries())
    .map(([name, rows]) => summarizeNeighborhood(name, rows))
    .sort((a, b) => a.neighborhood.localeCompare(b.neighborhood));

  const output = {
    version: "atlanta-neighborhood-diversity-v1",
    generated_at: new Date().toISOString(),
    source_file: "data/peter/atlanta/lineage/atlanta_lineage_objects.json",
    caveats: [
      "Lineage rows are historical internal signals, not live inventory.",
      "Scores are review aids and should not be presented publicly.",
      "LMS ingestion concentration should not block automated public claims by itself.",
      "Low true provenance diversity should block automated public claims even when space-type patterns look strong.",
    ],
    neighborhoods,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  fs.writeFileSync(REPORT_PATH, `${buildReport(output)}\n`);

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Wrote ${REPORT_PATH}`);
  console.log(`Neighborhoods scored: ${neighborhoods.length}`);
  for (const item of neighborhoods) {
    console.log(`${item.neighborhood}: diversity ${item.diversity_score}, concentration ${item.concentration_score}, buildings ${item.unique_buildings}`);
  }
}

main();
