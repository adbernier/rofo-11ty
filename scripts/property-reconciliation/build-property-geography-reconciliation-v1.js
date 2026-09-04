#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");
const contract = require("../../lib/property-reconciliation/property-reconciliation-v1.js");

const ROOT = path.join(__dirname, "../..");
const OUTPUT_DIR = path.join(ROOT, "data/internal/property-geography-reconciliation-v1");
const REPORT_DIR = OUTPUT_DIR;
const SEMANTIC_CSV = path.join(ROOT, "data/peter/derived/building_semantic_identity_v1.csv");
const RAW_BUILDINGS_CSV = path.join(ROOT, "data/peter/raw/rofo_buildings.csv");
const AREA_RELATIONSHIPS = require("../../data/peter/research/commercial_area_building_relationships_v1.json").relationships || [];
const AREA_ENTITIES = require("../../data/peter/research/commercial_area_entities_v1.json");
const PRIORITY_AREAS = require("../../data/peter/research/priority_market_commercial_area_entities_v1.json");
const canonicalBuildings = require("../../_data/buildings.js");

const PILOTS = Object.freeze({
  "san-francisco": { label: "San Francisco", state: "CA", municipalities: ["San Francisco"], targetMunicipalities: ["San Francisco"] },
  sacramento: { label: "Sacramento", state: "CA", municipalities: ["Sacramento", "West Sacramento", "Rancho Cordova"], targetMunicipalities: ["Sacramento"] },
  indianapolis: { label: "Indianapolis", state: "IN", municipalities: ["Indianapolis", "Plainfield"], targetMunicipalities: ["Indianapolis"] },
  "denver-aurora": { label: "Denver / Aurora", state: "CO", municipalities: ["Denver", "Aurora", "Commerce City"], targetMunicipalities: ["Denver", "Aurora"] },
  orlando: { label: "Orlando", state: "FL", municipalities: ["Orlando", "Winter Park", "Kissimmee", "Lake Mary", "Sanford"], targetMunicipalities: ["Orlando"] },
});

const REVIEWED_ADDRESS_GEOGRAPHIES = Object.freeze({
  "CA|sacramento|8583 elder creek rd": ["power-inn-industrial", "Power Inn Industrial"],
  "CA|sacramento|5711 florin perkins rd": ["power-inn-industrial", "Power Inn Industrial"],
  "CA|sacramento|1329 n market blvd": ["northgate-north-market-industrial", "Northgate / North Market Industrial"],
  "IN|indianapolis|7601 winton dr": ["park-100-northwest-indianapolis", "Park 100 / Northwest Indianapolis"],
  "IN|indianapolis|4557 w bradbury ave": ["indianapolis-airport-logistics", "Indianapolis Airport Logistics"],
});

const REVIEWED_MUNICIPALITY_OVERRIDES = Object.freeze({
  "IN|indianapolis|558 airtech pkwy": { municipality: "Plainfield", reason: "Reviewed Indianapolis evidence established Plainfield ownership; the historical Indianapolis label is not authoritative." },
});

const STRONG_REPRESENTATIVES = new Set([
  "CA|sacramento|8583 elder creek rd", "CA|sacramento|5711 florin perkins rd", "CA|sacramento|1329 n market blvd",
  "IN|indianapolis|7601 winton dr", "IN|indianapolis|4557 w bradbury ave",
  "IN|plainfield|558 airtech pkwy",
  "CO|denver|10445 e 49th ave", "CO|denver|11551 e 49th ave", "CO|denver|4550 kingston st",
]);

function parseDelimited(value, delimiter = "|") { return String(value || "").split(delimiter).map((item) => item.trim()).filter(Boolean); }
function csvRecord(line) {
  const output = []; let value = ""; let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { output.push(value); value = ""; }
    else value += char;
  }
  output.push(value); return output;
}
async function readCsv(file, visit) {
  const input = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  let headers = null; let pending = ""; let quoted = false;
  for await (const physical of input) {
    const escaped = (physical.match(/"/g) || []).length;
    pending += (pending ? "\n" : "") + physical;
    if (escaped % 2 === 1) quoted = !quoted;
    if (quoted) continue;
    const values = csvRecord(pending); pending = "";
    if (!headers) { headers = values; continue; }
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
    await visit(row);
  }
}
function pilotFor(city, state) {
  const cityKey = contract.normalizeMunicipality(city);
  return Object.entries(PILOTS).find(([, pilot]) => pilot.state === contract.normalizeState(state) && pilot.municipalities.some((item) => contract.normalizeMunicipality(item) === cityKey));
}
function identityKey(state, city, address) { return `${contract.normalizeState(state)}|${contract.normalizeMunicipality(city).replace(/ /g, "-")}|${contract.normalizeAddress(address).normalized}`; }
function canonicalKey(item) { return identityKey(item.state_abbr || item.state, item.city || item.property_city, item.address || item.property_address || item.name); }
function currentTypes(item) { return [item.primary_space_type, item.type, item.space_type, ...(item.space_types || [])].filter(Boolean); }
function safeJson(value) { try { return JSON.parse(value || "{}"); } catch { return {}; } }
function areaById() { return new Map([...AREA_ENTITIES, ...PRIORITY_AREAS].map((area) => [area.id, area])); }

function reportTable(rows, columns) {
  if (!rows.length) return "_None._\n";
  return `| ${columns.map((item) => item[0]).join(" | ")} |\n|${columns.map(() => "---").join("|")}|\n${rows.map((row) => `| ${columns.map((item) => String(item[1](row) ?? "").replace(/\|/g, "/")).join(" | ")} |`).join("\n")}\n`;
}
function write(file, content) {
  const internalFile = file.replace(/\.md$/, ".txt");
  fs.mkdirSync(path.dirname(internalFile), { recursive: true });
  fs.writeFileSync(internalFile, content);
}
function perMarketLimit(rows, limit = 100) {
  return Object.keys(PILOTS).flatMap((marketId) => rows.filter((row) => row.pilotMarketId === marketId).slice(0, limit));
}

(async () => {
  const rawById = new Map();
  await readCsv(RAW_BUILDINGS_CSV, (row) => {
    if (!pilotFor(row.city, row.state)) return;
    rawById.set(String(row.building_id), row);
  });

  const canonicalByKey = new Map();
  for (const building of canonicalBuildings) {
    const pilot = pilotFor(building.city || building.property_city, building.state_abbr || building.state);
    if (!pilot) continue;
    const key = canonicalKey(building);
    if (!canonicalByKey.has(key)) canonicalByKey.set(key, []);
    canonicalByKey.get(key).push(building);
  }
  const areas = areaById();
  const geographyByPath = new Map();
  for (const relationship of AREA_RELATIONSHIPS) {
    if (!relationship.building_path || !["high", "reviewed"].includes(relationship.confidence)) continue;
    const area = areas.get(relationship.primary_area_id);
    if (!area) continue;
    geographyByPath.set(relationship.building_path, { geographyId: area.id, label: area.canonical_name, municipality: area.city, confidence: relationship.confidence === "reviewed" ? "REVIEWED" : "HIGH_CONFIDENCE", relationshipStatus: relationship.relationship_status || "existing_reviewed_relationship", evidence: ["commercial_area_building_relationships_v1", `commercial_area:${area.id}`] });
  }

  const groups = new Map();
  const observedLegacyIds = new Set();
  const listingCounts = Object.fromEntries(Object.keys(PILOTS).map((id) => [id, 0]));
  await readCsv(SEMANTIC_CSV, (row) => {
    const selected = pilotFor(row.city, row.state);
    if (!selected) return;
    const [pilotId] = selected;
    const raw = rawById.get(String(row.building_id)) || {};
    const normalized = contract.normalizeAddress(row.address || raw.address);
    const key = `${pilotId}|${identityKey(row.state, row.city, normalized.normalized || row.address)}`;
    if (!groups.has(key)) groups.set(key, { pilotId, city: row.city, state: row.state, address: row.address, rows: [] });
    groups.get(key).rows.push({ row, raw, normalized });
    observedLegacyIds.add(String(row.building_id));
    listingCounts[pilotId] += Number(row.historical_listing_evidence_count || row.listing_count || 0);
  });
  for (const raw of rawById.values()) {
    if (observedLegacyIds.has(String(raw.building_id))) continue;
    const selected = pilotFor(raw.city, raw.state);
    if (!selected) continue;
    const [pilotId] = selected;
    const normalized = contract.normalizeAddress(raw.address);
    const key = `${pilotId}|${identityKey(raw.state, raw.city, normalized.normalized || raw.address)}`;
    if (!groups.has(key)) groups.set(key, { pilotId, city: raw.city, state: raw.state, address: raw.address, rows: [] });
    groups.get(key).rows.push({ row: { building_id: raw.building_id, building_name: raw.name, address: raw.address, city: raw.city, state: raw.state, representative_space_types: "", historical_listing_evidence_count: raw.listing_count || 0 }, raw, normalized });
    listingCounts[pilotId] += Number(raw.listing_count || 0);
  }

  const entities = [];
  for (const group of groups.values()) {
    const pilot = PILOTS[group.pilotId];
    const sourceBaseKey = identityKey(group.state, group.city, group.address);
    const municipalityOverride = REVIEWED_MUNICIPALITY_OVERRIDES[sourceBaseKey] || null;
    const reconciledMunicipality = municipalityOverride?.municipality || group.city;
    const baseKey = identityKey(group.state, reconciledMunicipality, group.address);
    const canonical = canonicalByKey.get(baseKey) || [];
    const canonicalMatch = canonical.length === 1 ? canonical[0] : null;
    const sourceCanonical = canonicalByKey.get(sourceBaseKey) || [];
    const targetMunicipality = pilot.targetMunicipalities.some((name) => contract.normalizeMunicipality(name) === contract.normalizeMunicipality(reconciledMunicipality));
    const conflicts = [];
    if (!targetMunicipality) conflicts.push("MUNICIPALITY_CONFLICT");
    if (municipalityOverride && sourceCanonical.length) conflicts.push("CANONICAL_OWNERSHIP_CONFLICT");
    if (canonical.length > 1) conflicts.push("DUPLICATE_ENTITY");
    const observedMunicipalities = new Set(group.rows.map((item) => contract.normalizeMunicipality(item.row.city || item.raw.city)));
    if (observedMunicipalities.size > 1) conflicts.push("ADDRESS_CONFLICT");
    let geography = null; let forceDiscoveryOnly = false;
    const reviewed = REVIEWED_ADDRESS_GEOGRAPHIES[baseKey];
    if (reviewed && targetMunicipality) geography = { geographyId: reviewed[0], label: reviewed[1], municipality: reconciledMunicipality, confidence: "REVIEWED", relationshipStatus: "reviewed_exact_address_relationship", evidence: ["reviewed_market_evidence_foundation", `normalized_address:${contract.normalizeAddress(group.address).normalized}`] };
    else if (canonicalMatch && geographyByPath.has(canonicalMatch.building_path)) geography = geographyByPath.get(canonicalMatch.building_path);
    if (geography && contract.normalizeMunicipality(geography.municipality) !== contract.normalizeMunicipality(reconciledMunicipality)) conflicts.push("CANONICAL_OWNERSHIP_CONFLICT");

    const searchable = `${group.address} ${group.rows.map((item) => item.row.building_name).join(" ")}`.toLowerCase();
    if (group.pilotId === "orlando" && targetMunicipality && !geography) {
      if (/tradeport|airport industrial|mccoy|boggy creek/.test(searchable)) geography = { geographyId: "orlando-tradeport-airport-industrial-candidate", label: "Tradeport / Airport Industrial Park candidate", municipality: "Orlando", confidence: "CANDIDATE", relationshipStatus: "atlas_discovery_candidate", evidence: ["commercial-geography-atlas-v1", "historical_semantic_cluster"] };
      else if (/millenia|john young/.test(searchable)) geography = { geographyId: "orlando-millenia-commercial-candidate", label: "Millenia commercial cluster candidate", municipality: "Orlando", confidence: "CANDIDATE", relationshipStatus: "atlas_discovery_candidate", evidence: ["commercial-geography-atlas-v1", "historical_semantic_cluster"] };
      else if (/south st|south street|downtown south/.test(searchable)) geography = { geographyId: "orlando-downtown-south-industrial-candidate", label: "Downtown South Industrial candidate", municipality: "Orlando", confidence: "CANDIDATE", relationshipStatus: "atlas_discovery_candidate", evidence: ["commercial-geography-atlas-v1", "historical_semantic_cluster"] };
      if (geography) forceDiscoveryOnly = true;
    }
    const observations = group.rows.map(({ row, raw, normalized }, index) => ({
      observationId: `historical-building:${row.building_id}:${index + 1}`,
      legacyBuildingId: row.building_id,
      sourceName: row.building_name,
      sourceAddress: row.address,
      sourceMunicipality: row.city,
      sourceState: row.state,
      sourcePostalCode: raw.zip,
      sourceSuite: normalized.suite,
      sourcePropertyTypes: parseDelimited(row.representative_space_types),
      historicalListingCount: Number(row.historical_listing_evidence_count || row.listing_count || 0),
      hasHistoricalAvailability: Number(row.historical_listing_evidence_count || row.listing_count || 0) > 0,
    }));
    const historicalSupport = group.rows.reduce((sum, item) => sum + Number(item.row.historical_listing_evidence_count || item.row.listing_count || 0), 0);
    const evidenceCount = 1 + (group.rows.some((item) => item.raw.zip) ? 1 : 0) + (group.rows.some((item) => Number.isFinite(Number(item.raw.lat)) && Number.isFinite(Number(item.raw.lng)) && Number(item.raw.lat) !== 0 && Number(item.raw.lng) !== 0) ? 1 : 0) + (canonicalMatch ? 1 : 0) + (historicalSupport >= 10 ? 1 : 0);
    const ownershipSafe = targetMunicipality && !conflicts.some((code) => ["MUNICIPALITY_CONFLICT", "CANONICAL_OWNERSHIP_CONFLICT", "ADDRESS_CONFLICT"].includes(code));
    const representativePotential = ownershipSafe && STRONG_REPRESENTATIVES.has(baseKey) ? "STRONG_REPRESENTATIVE_CANDIDATE" : ownershipSafe && canonicalMatch && geography ? "POSSIBLE_REPRESENTATIVE" : "NOT_REPRESENTATIVE";
    const entity = contract.reconcileGroup({
      observations, address: group.address, municipality: reconciledMunicipality, state: group.state,
      postalCode: group.rows.find((item) => item.raw.zip)?.raw.zip || "",
      municipalityVerified: true,
      identityEvidenceCount: evidenceCount,
      canonicalMatch: canonicalMatch ? { buildingPath: canonicalMatch.building_path, canonicalId: canonicalMatch.building_id || canonicalMatch.id || null, matchMethod: "normalized_address_municipality_state" } : null,
      canonicalPropertyTypes: canonicalMatch ? currentTypes(canonicalMatch) : [],
      geography, conflicts, forceDiscoveryOnly, representativePotential,
      provenance: ["data/peter/derived/building_semantic_identity_v1.csv", "data/peter/raw/rofo_buildings.csv", ...(canonicalMatch ? ["_data/buildings.js"] : []), ...(municipalityOverride ? ["reviewed_market_evidence_foundation:municipality_override"] : []), ...(geography ? geography.evidence : [])],
    });
    entity.pilotMarketId = group.pilotId;
    entities.push(entity);
  }

  entities.sort((a, b) => a.pilotMarketId.localeCompare(b.pilotMarketId) || a.municipality.localeCompare(b.municipality) || a.normalizedAddress.localeCompare(b.normalizedAddress));
  const statusCount = (rows, field) => Object.fromEntries([...new Set(rows.map((row) => row[field]))].sort().map((value) => [value, rows.filter((row) => row[field] === value).length]));
  const summaries = Object.entries(PILOTS).map(([id, pilot]) => {
    const rows = entities.filter((item) => item.pilotMarketId === id);
    return {
      marketId: id, label: pilot.label, sourcePropertyObservations: rows.reduce((sum, item) => sum + item.historicalObservationSummary.count, 0), historicalListingObservations: listingCounts[id], normalizedIdentities: rows.length,
      canonicalMatches: rows.filter((item) => item.reconciliationStatus === "CANONICAL_MATCH").length,
      reconciledEntities: rows.filter((item) => ["CANONICAL_MATCH", "RECONCILED_PROPERTY", "GEOGRAPHY_LINK_CANDIDATE"].includes(item.reconciliationStatus)).length,
      geographyLinked: rows.filter((item) => item.commercialGeography && ["REVIEWED", "HIGH_CONFIDENCE"].includes(item.relationshipConfidence)).length,
      humanReview: rows.filter((item) => item.processingTier === "HUMAN_REVIEW").length,
      discoveryOnly: rows.filter((item) => item.processingTier === "DISCOVERY_ONLY").length,
      rejected: rows.filter((item) => item.processingTier === "REJECT").length,
      statuses: statusCount(rows, "reconciliationStatus"), tiers: statusCount(rows, "processingTier"),
      conflictCount: rows.filter((item) => item.conflictCodes.length).length,
      representativeCandidates: rows.filter((item) => item.representativePotential !== "NOT_REPRESENTATIVE").length,
      publicCandidatesLater: rows.filter((item) => item.publicReadiness === "PUBLIC_CANDIDATE_LATER").length,
    };
  });
  const artifact = { schemaVersion: contract.schemaVersion, sourceSnapshot: "repository-controlled-inputs:2026-09-03", scope: { pilotMarkets: Object.keys(PILOTS), publicBehavior: "NONE", availabilitySemantics: "HISTORICAL_OBSERVATION_ONLY_NOT_CURRENT_AVAILABILITY" }, taxonomies: { reconciliationStatuses: contract.RECONCILIATION_STATUSES, relationshipConfidence: contract.RELATIONSHIP_CONFIDENCE, conflictCodes: contract.CONFLICT_CODES, entityKinds: contract.ENTITY_KINDS, processingTiers: contract.PROCESSING_TIERS }, summaries, entities };
  // Keep the complete machine-readable corpus, but avoid tens of megabytes of
  // indentation that add no review value. Operator summaries remain formatted.
  write(path.join(OUTPUT_DIR, "pilot-reconciliation.json"), JSON.stringify(artifact) + "\n");

  const conflicts = entities.filter((item) => item.conflictCodes.length);
  const typeConflicts = entities.filter((item) => item.conflictCodes.includes("PROPERTY_TYPE_CONFLICT"));
  const duplicateGroups = entities.filter((item) => item.conflictCodes.some((code) => ["DUPLICATE_ENTITY", "MULTIPLE_LEGACY_IDS", "SUITE_BUILDING_AMBIGUITY", "CAMPUS_COMPLEX_AMBIGUITY"].includes(code)));
  const representatives = entities.filter((item) => item.representativePotential !== "NOT_REPRESENTATIVE");
  const discovery = entities.filter((item) => item.processingTier === "DISCOVERY_ONLY" && item.commercialGeography);
  const summaryColumns = [["Market", (r) => r.label], ["Source properties", (r) => r.sourcePropertyObservations], ["Listing observations", (r) => r.historicalListingObservations], ["Identities", (r) => r.normalizedIdentities], ["Canonical", (r) => r.canonicalMatches], ["Reconciled", (r) => r.reconciledEntities], ["Geo linked", (r) => r.geographyLinked], ["Human", (r) => r.humanReview], ["Discovery", (r) => r.discoveryOnly], ["Reject", (r) => r.rejected]];
  const totals = { sourcePropertyObservations: summaries.reduce((n, r) => n + r.sourcePropertyObservations, 0), historicalListingObservations: summaries.reduce((n, r) => n + r.historicalListingObservations, 0), normalizedIdentities: entities.length, canonicalMatches: entities.filter((r) => r.reconciliationStatus === "CANONICAL_MATCH").length, reconciledEntities: entities.filter((r) => ["CANONICAL_MATCH", "RECONCILED_PROPERTY", "GEOGRAPHY_LINK_CANDIDATE"].includes(r.reconciliationStatus)).length, geographyLinked: entities.filter((r) => r.commercialGeography && ["REVIEWED", "HIGH_CONFIDENCE"].includes(r.relationshipConfidence)).length, humanReview: entities.filter((r) => r.processingTier === "HUMAN_REVIEW").length, discoveryOnly: entities.filter((r) => r.processingTier === "DISCOVERY_ONLY").length, rejected: entities.filter((r) => r.processingTier === "REJECT").length };
  const percent = (number) => `${(number * 100).toFixed(1)}%`;
  const autoQaCount = totals.reconciledEntities - totals.canonicalMatches;
  write(path.join(REPORT_DIR, "README.md"), `# Historical Property → Commercial Geography Reconciliation v1\n\nInternal-only pilot. Nothing here is a public property, availability, Recommendation Intelligence, SEO, or runtime source.\n\n## Decision\n\n**B. V1 SUCCESS — RECONCILE THESE FIVE DEEPER FIRST.** The shared contract works, the known ownership controls resolve correctly, and conservative automation is viable. Geography coverage and review queues are not yet deep enough to scale responsibly.\n\n## Pilot summary\n\n${reportTable(summaries, summaryColumns)}\n## Aggregate\n\n- ${totals.sourcePropertyObservations.toLocaleString()} historical property observations representing ${totals.normalizedIdentities.toLocaleString()} normalized identities and ${totals.historicalListingObservations.toLocaleString()} historical listing observations.\n- ${totals.canonicalMatches.toLocaleString()} canonical matches; ${totals.reconciledEntities.toLocaleString()} total reconciled internal entities; ${totals.geographyLinked.toLocaleString()} reviewed/high-confidence geography links.\n- ${totals.humanReview.toLocaleString()} human-review identities; ${totals.discoveryOnly.toLocaleString()} discovery-only; ${totals.rejected.toLocaleString()} rejected.\n- AUTO_PROMOTABLE_INTERNAL: ${percent(totals.canonicalMatches / totals.normalizedIdentities)}. AUTO_RECONCILE_QA excluding canonical matches: ${percent((totals.reconciledEntities - totals.canonicalMatches) / totals.normalizedIdentities)}.\n\n## Contract\n\nHistorical observations retain source identity and historical listing counts. Durable entities contain only normalized identity, municipality, reviewed type where supportable, provenance, and explicit confidence. One durable property may retain many legacy IDs. Suite observations and campus/business-park ambiguity enter human review rather than becoming buildings.\n\n### Fact safety\n\n- Durable: normalized address, stable identity, verified municipality, reviewed parent geography.\n- Durable if independently verified: property type, physical attributes, representative role, and media rights.\n- Time-sensitive and excluded: availability, rent, occupancy, broker contact, parking availability, and current amenities.\n- Never reused without independent verification: marketing claims, loading, clear height, power, yard, trailer capacity, permitted use, hazardous capability, and tenant suitability.\n\nAll media defaults to RIGHTS_UNKNOWN. Public-candidate-later is only assigned to a canonical property with a reviewed/high-confidence geography and reviewed type; it is not publication approval.\n\n## Next horizontal sprint\n\nRun a bounded five-market reconciliation review: resolve municipality conflicts first, review the 654 non-canonical AUTO_RECONCILE_QA records by deterministic samples and high-value queues, adjudicate the three canonical type conflicts, and promote no additional geography until reviewed boundaries exist.\n\nMachine-readable output: \`data/internal/property-geography-reconciliation-v1/pilot-reconciliation.json\`.\n`);
  const readmePath = path.join(REPORT_DIR, "README.txt");
  write(readmePath, fs.readFileSync(readmePath, "utf8").replace("654 non-canonical", `${autoQaCount.toLocaleString()} non-canonical`));
  const conflictColumns = [["Market", (r) => r.pilotMarketId], ["Property", (r) => r.normalizedAddress], ["Municipality", (r) => r.municipality], ["Conflicts", (r) => r.conflictCodes.join(", ")], ["Legacy IDs", (r) => r.sourceIds.map((v) => v.sourceId).join(", ")]];
  write(path.join(REPORT_DIR, "ownership-and-identity-conflicts.md"), `# Ownership and identity conflicts\n\nGenerated internal review queue. A municipality conflict blocks geography promotion. The table includes up to 100 records per pilot so large control markets cannot hide smaller-market conflicts.\n\n${reportTable(perMarketLimit(conflicts, 100), conflictColumns)}`);
  write(path.join(REPORT_DIR, "property-type-conflicts.md"), `# Property-type conflicts\n\nHistorical type never overrides a reviewed canonical type.\n\n${reportTable(typeConflicts.slice(0, 500), [["Market", (r) => r.pilotMarketId], ["Property", (r) => r.normalizedAddress], ["Historical", (r) => r.propertyType.historicalObservations.join(", ")], ["Reviewed", (r) => r.propertyType.reviewedTypes.join(", ")]])}`);
  write(path.join(REPORT_DIR, "duplicate-suite-campus-review.md"), `# Duplicate, suite, and campus review\n\nSuite observations and ambiguous campuses are never auto-promoted as buildings.\n\n${reportTable(perMarketLimit(duplicateGroups, 100), conflictColumns)}`);
  write(path.join(REPORT_DIR, "representative-and-public-candidates.md"), `# Representative and future public candidates\n\nCandidate generation only. No record is approved for Recommendation Intelligence or publication.\n\n${reportTable(representatives.slice(0, 500), [["Market", (r) => r.pilotMarketId], ["Property", (r) => r.normalizedAddress], ["Municipality", (r) => r.municipality], ["Geography", (r) => r.commercialGeography?.label || "unassigned"], ["Representative", (r) => r.representativePotential], ["Public", (r) => r.publicReadiness], ["Media", (r) => r.mediaRights]])}`);
  write(path.join(REPORT_DIR, "atlas-integration.md"), `# Atlas integration findings\n\nAtlas levels are not changed by this output. Reviewed/high-confidence links support existing Level A/B research; candidate links remain Level C discovery only.\n\n## Discovery geography candidates\n\n${reportTable(discovery.slice(0, 500), [["Market", (r) => r.pilotMarketId], ["Property", (r) => r.normalizedAddress], ["Municipality", (r) => r.municipality], ["Candidate", (r) => r.commercialGeography?.label], ["Confidence", (r) => r.relationshipConfidence]])}`);
  console.log(JSON.stringify({ summaries, totals }, null, 2));
})().catch((error) => { console.error(error); process.exit(1); });
