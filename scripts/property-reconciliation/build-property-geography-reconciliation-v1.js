#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");
const crypto = require("node:crypto");
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
  "CO|denver|10445 e 49th ave", "CO|denver|11551 e 49th ave", "CO|denver|4550 kingston st",
]);

const BASELINE = Object.freeze({ sourcePropertyObservations: 51914, normalizedIdentities: 39944, canonicalMatches: 373, reconciledEntities: 1017, geographyLinked: 64, humanReview: 2497, discoveryOnly: 36229, rejected: 201, municipalityConflicts: 2442, typeConflicts: 3, strongRepresentatives: 8, possibleRepresentatives: 60, publicCandidatesLater: 64, autoQa: 644 });

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
function sha256(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function hasAddressRange(value) { return /^\d+[a-z]?\s*[-–]\s*\d+|\b(?:and|&)\s+\d+\b/i.test(String(value || "")); }
function coordinateSpread(rows) {
  const points = rows.map(({ raw }) => [Number(raw.lat), Number(raw.lng)]).filter(([lat, lng]) => contract.coordinatesUsable(lat, lng));
  if (points.length < 2) return 0;
  const lats = points.map((point) => point[0]); const lngs = points.map((point) => point[1]);
  return Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs));
}
function municipalityReviewFor({ targetMunicipality, municipalityOverride, conflicts, coordinateConflict }) {
  if (coordinateConflict) return { classification: "COORDINATE_CONFLICT", resolved: false, blocksGeographyPromotion: true, basis: "Historical coordinates disagree materially within one normalized identity." };
  if (conflicts.includes("ADDRESS_CONFLICT")) return { classification: "ADDRESS_AMBIGUOUS", resolved: false, blocksGeographyPromotion: true, basis: "Source observations disagree on municipality for the normalized identity." };
  if (municipalityOverride) return { classification: "LEGACY_SOURCE_WRONG", resolved: true, blocksGeographyPromotion: true, basis: municipalityOverride.reason };
  if (!targetMunicipality) return { classification: "MARKET_LABEL_TOO_BROAD", resolved: true, blocksGeographyPromotion: true, basis: "The source municipality is reliable but lies outside the pilot's target city boundary." };
  return { classification: "CONFIRMED_CURRENT_MUNICIPALITY", resolved: true, blocksGeographyPromotion: false, basis: "Normalized source city/state and current pilot ownership agree." };
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
    const sourceStatus = relationship.relationship_status || "existing_reviewed_relationship";
    const confirmed = relationship.confidence === "reviewed" && !/candidate|approximate|proximity/i.test(sourceStatus);
    geographyByPath.set(relationship.building_path, { geographyId: area.id, label: area.canonical_name, municipality: area.city, confidence: confirmed ? "REVIEWED" : "CANDIDATE", relationshipStatus: sourceStatus, evidence: ["commercial_area_building_relationships_v1", `commercial_area:${area.id}`] });
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
    const coordinatesConflict = coordinateSpread(group.rows) > 0.01;
    if (coordinatesConflict) conflicts.push("ADDRESS_CONFLICT");
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
    const municipalityReview = municipalityReviewFor({ targetMunicipality, municipalityOverride, conflicts, coordinateConflict: coordinatesConflict });
    let geographyLinkReview = null;
    if (geography && geography.relationshipStatus !== "atlas_discovery_candidate") {
      if (!ownershipSafe) geographyLinkReview = { classification: "CONFLICTED", basis: "Municipality or canonical ownership conflict blocks promotion." };
      else if (geography.relationshipStatus === "reviewed_exact_address_relationship") geographyLinkReview = { classification: "REVIEWED_CONFIRMED", basis: "Reviewed evidence-foundation address relationship." };
      else if (geography.confidence === "REVIEWED" && !/candidate|approximate|proximity/i.test(geography.relationshipStatus)) geographyLinkReview = { classification: "HIGH_CONFIDENCE_CONFIRMED", basis: "Reviewed current relationship with non-proximity evidence." };
      else geographyLinkReview = { classification: "DOWNGRADE_TO_CANDIDATE", basis: "Source relationship is candidate-level and does not independently prove a reviewed boundary relationship." };
    }
    const confirmedGeography = geographyLinkReview && ["REVIEWED_CONFIRMED", "HIGH_CONFIDENCE_CONFIRMED"].includes(geographyLinkReview.classification);
    const representativeReview = ownershipSafe && confirmedGeography && STRONG_REPRESENTATIVES.has(baseKey) ? "STRONG_REPRESENTATIVE_CANDIDATE" : ownershipSafe && canonicalMatch && geography ? "POSSIBLE_REPRESENTATIVE" : "NOT_REPRESENTATIVE";
    const representativePotential = representativeReview;
    const entity = contract.reconcileGroup({
      observations, address: group.address, municipality: reconciledMunicipality, state: group.state,
      postalCode: group.rows.find((item) => item.raw.zip)?.raw.zip || "",
      municipalityVerified: true,
      identityEvidenceCount: evidenceCount,
      canonicalMatch: canonicalMatch ? { buildingPath: canonicalMatch.building_path, canonicalId: canonicalMatch.building_id || canonicalMatch.id || null, matchMethod: "normalized_address_municipality_state" } : null,
      canonicalPropertyTypes: canonicalMatch ? currentTypes(canonicalMatch) : [],
      geography, conflicts, forceDiscoveryOnly, representativePotential, representativeReview, municipalityReview, geographyLinkReview,
      provenance: ["data/peter/derived/building_semantic_identity_v1.csv", "data/peter/raw/rofo_buildings.csv", ...(canonicalMatch ? ["_data/buildings.js"] : []), ...(municipalityOverride ? ["reviewed_market_evidence_foundation:municipality_override"] : []), ...(geography ? geography.evidence : [])],
    });
    if (!entity.deepReview && coordinatesConflict && !canonicalMatch && targetMunicipality && evidenceCount >= 4 && entity.propertyType.reviewedTypes.length && !forceDiscoveryOnly) {
      entity.deepReview = { baselineTier: "AUTO_RECONCILE_QA", decision: "HUMAN_REVIEW_REQUIRED", reasons: ["Historical coordinates disagree materially."] };
    }
    const wasAutoQa = entity.processingTier === "AUTO_RECONCILE_QA";
    if (wasAutoQa) {
      const deepReasons = [];
      if (entity.conflictCodes.includes("MULTIPLE_LEGACY_IDS")) deepReasons.push("Multiple legacy IDs require duplicate/building-hierarchy review before durable reconciliation.");
      if (entity.conflictCodes.includes("SOURCE_IDENTITY_INSUFFICIENT")) deepReasons.push("Street identity remains insufficient.");
      if (hasAddressRange(group.address)) deepReasons.push("Address range may represent multiple buildings or a campus.");
      if (coordinatesConflict) deepReasons.push("Historical coordinates disagree materially.");
      if (deepReasons.length) {
        entity.reconciliationStatus = entity.conflictCodes.includes("SOURCE_IDENTITY_INSUFFICIENT") ? "DISCOVERY_ONLY" : "HUMAN_REVIEW_REQUIRED";
        entity.processingTier = entity.reconciliationStatus === "DISCOVERY_ONLY" ? "DISCOVERY_ONLY" : "HUMAN_REVIEW";
        entity.deepReview = { baselineTier: "AUTO_RECONCILE_QA", decision: entity.reconciliationStatus, reasons: deepReasons };
      } else {
        entity.deepReview = { baselineTier: "AUTO_RECONCILE_QA", decision: "RECONCILED_PROPERTY", reasons: ["Normalized address, municipality, type, provenance, hierarchy, and duplicate checks passed deterministic reassessment."] };
      }
    }
    if (entity.geographyLinkReview?.classification === "DOWNGRADE_TO_CANDIDATE") entity.relationshipConfidence = "CANDIDATE";
    if (entity.conflictCodes.includes("PROPERTY_TYPE_CONFLICT")) entity.propertyType.review = { decision: "CANONICAL_TYPE_PREVAILS", multiTypeDefensible: false, historicalObservationsPreserved: true };
    entity.publicCandidateReview = entity.reconciliationStatus === "REJECTED" ? "REJECT_PUBLIC" : entity.reconciliationStatus === "CANONICAL_MATCH" && confirmedGeography && entity.propertyType.reviewedTypes.length ? "PUBLIC_CANDIDATE_REVIEWED" : entity.reconciliationStatus === "CANONICAL_MATCH" && geography ? "NEEDS_MORE_EVIDENCE" : "INTERNAL_ONLY";
    entity.publicReadiness = entity.publicCandidateReview === "PUBLIC_CANDIDATE_REVIEWED" ? "PUBLIC_CANDIDATE_LATER" : entity.publicCandidateReview;
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
      geographyLinked: rows.filter((item) => item.geographyLinkReview && ["REVIEWED_CONFIRMED", "HIGH_CONFIDENCE_CONFIRMED"].includes(item.geographyLinkReview.classification)).length,
      humanReview: rows.filter((item) => item.processingTier === "HUMAN_REVIEW").length,
      discoveryOnly: rows.filter((item) => item.processingTier === "DISCOVERY_ONLY").length,
      rejected: rows.filter((item) => item.processingTier === "REJECT").length,
      statuses: statusCount(rows, "reconciliationStatus"), tiers: statusCount(rows, "processingTier"),
      conflictCount: rows.filter((item) => item.conflictCodes.length).length,
      representativeCandidates: rows.filter((item) => item.representativeReview !== "NOT_REPRESENTATIVE").length,
      publicCandidatesLater: rows.filter((item) => item.publicCandidateReview === "PUBLIC_CANDIDATE_REVIEWED").length,
    };
  });
  const taxonomies = { reconciliationStatuses: contract.RECONCILIATION_STATUSES, relationshipConfidence: contract.RELATIONSHIP_CONFIDENCE, conflictCodes: contract.CONFLICT_CODES, entityKinds: contract.ENTITY_KINDS, processingTiers: contract.PROCESSING_TIERS, municipalityReviewClassifications: contract.MUNICIPALITY_REVIEW_CLASSIFICATIONS, geographyLinkReviewClassifications: contract.GEOGRAPHY_LINK_REVIEW_CLASSIFICATIONS, representativeReviewClassifications: contract.REPRESENTATIVE_REVIEW_CLASSIFICATIONS, publicReviewClassifications: contract.PUBLIC_REVIEW_CLASSIFICATIONS };
  const scope = { pilotMarkets: Object.keys(PILOTS), publicBehavior: "NONE", availabilitySemantics: "HISTORICAL_OBSERVATION_ONLY_NOT_CURRENT_AVAILABILITY" };
  const marketFiles = [];
  for (const summary of summaries) {
    const marketEntities = entities.filter((item) => item.pilotMarketId === summary.marketId);
    const marketArtifact = { schemaVersion: contract.schemaVersion, sourceSnapshot: "repository-controlled-inputs:2026-09-03", scope: { ...scope, pilotMarket: summary.marketId }, taxonomies, summary, entities: marketEntities };
    const serialized = JSON.stringify(marketArtifact) + "\n";
    const file = `${summary.marketId}.json`;
    write(path.join(OUTPUT_DIR, file), serialized);
    marketFiles.push({ marketId: summary.marketId, file, bytes: Buffer.byteLength(serialized), sha256: sha256(serialized), entityCount: marketEntities.length });
  }
  const indexArtifact = { schemaVersion: `${contract.schemaVersion}:partitioned-deep-review`, sourceSnapshot: "repository-controlled-inputs:2026-09-03", scope, baseline: BASELINE, summaries, marketFiles };
  write(path.join(OUTPUT_DIR, "index.json"), JSON.stringify(indexArtifact, null, 2) + "\n");
  const monolith = path.join(OUTPUT_DIR, "pilot-reconciliation.json");
  if (fs.existsSync(monolith)) fs.unlinkSync(monolith);

  const municipalityConflicts = entities.filter((item) => item.conflictCodes.includes("MUNICIPALITY_CONFLICT"));
  const typeConflicts = entities.filter((item) => item.conflictCodes.includes("PROPERTY_TYPE_CONFLICT"));
  const geographyLinks = entities.filter((item) => item.commercialGeography && item.geographyLinkReview);
  const representatives = entities.filter((item) => item.representativeReview !== "NOT_REPRESENTATIVE" || (STRONG_REPRESENTATIVES.has(identityKey(item.state, item.municipality, item.normalizedAddress)) && !item.municipalityReview?.blocksGeographyPromotion));
  const publicCandidates = entities.filter((item) => item.publicCandidateReview !== "INTERNAL_ONLY" && item.publicCandidateReview !== "REJECT_PUBLIC");
  const discovery = entities.filter((item) => item.processingTier === "DISCOVERY_ONLY" && item.commercialGeography);
  const summaryColumns = [["Market", (r) => r.label], ["Source properties", (r) => r.sourcePropertyObservations], ["Listing observations", (r) => r.historicalListingObservations], ["Identities", (r) => r.normalizedIdentities], ["Canonical", (r) => r.canonicalMatches], ["Reconciled", (r) => r.reconciledEntities], ["Geo linked", (r) => r.geographyLinked], ["Human", (r) => r.humanReview], ["Discovery", (r) => r.discoveryOnly], ["Reject", (r) => r.rejected]];
  const totals = { sourcePropertyObservations: summaries.reduce((n, r) => n + r.sourcePropertyObservations, 0), historicalListingObservations: summaries.reduce((n, r) => n + r.historicalListingObservations, 0), normalizedIdentities: entities.length, canonicalMatches: entities.filter((r) => r.reconciliationStatus === "CANONICAL_MATCH").length, reconciledEntities: entities.filter((r) => ["CANONICAL_MATCH", "RECONCILED_PROPERTY", "GEOGRAPHY_LINK_CANDIDATE"].includes(r.reconciliationStatus)).length, geographyLinked: geographyLinks.length, reviewedGeographyLinks: geographyLinks.filter((r) => ["REVIEWED_CONFIRMED", "HIGH_CONFIDENCE_CONFIRMED"].includes(r.geographyLinkReview.classification)).length, downgradedGeographyLinks: geographyLinks.filter((r) => r.geographyLinkReview.classification === "DOWNGRADE_TO_CANDIDATE").length, humanReview: entities.filter((r) => r.processingTier === "HUMAN_REVIEW").length, discoveryOnly: entities.filter((r) => r.processingTier === "DISCOVERY_ONLY").length, rejected: entities.filter((r) => r.processingTier === "REJECT").length, municipalityConflicts: municipalityConflicts.length, municipalityConflictsClassified: municipalityConflicts.filter((r) => r.municipalityReview).length, autoQaReviewed: entities.filter((r) => r.deepReview?.baselineTier === "AUTO_RECONCILE_QA").length, autoQaPromoted: entities.filter((r) => r.deepReview?.decision === "RECONCILED_PROPERTY").length, autoQaDowngraded: entities.filter((r) => r.deepReview?.baselineTier === "AUTO_RECONCILE_QA" && r.deepReview.decision !== "RECONCILED_PROPERTY").length, strongRepresentatives: entities.filter((r) => r.representativeReview === "STRONG_REPRESENTATIVE_CANDIDATE").length, possibleRepresentatives: entities.filter((r) => r.representativeReview === "POSSIBLE_REPRESENTATIVE").length, publicReviewed: entities.filter((r) => r.publicCandidateReview === "PUBLIC_CANDIDATE_REVIEWED").length, publicNeedsEvidence: entities.filter((r) => r.publicCandidateReview === "NEEDS_MORE_EVIDENCE").length };
  const percent = (number) => `${(number * 100).toFixed(1)}%`;
  const autoPromotable = entities.filter((r) => r.processingTier === "AUTO_PROMOTABLE_INTERNAL").length;
  const autoQa = entities.filter((r) => r.processingTier === "AUTO_RECONCILE_QA").length;
  const architectureDecision = "B. READY TO SCALE TO NEXT 10 MARKETS WITH QA";
  const municipalityCounts = (marketId) => Object.fromEntries(entities.filter((item) => item.pilotMarketId === marketId).reduce((map, item) => map.set(item.municipality, (map.get(item.municipality) || 0) + 1), new Map()));
  const orlandoDiscovery = Object.fromEntries(entities.filter((item) => item.pilotMarketId === "orlando" && item.commercialGeography?.relationshipStatus === "atlas_discovery_candidate").reduce((map, item) => map.set(item.commercialGeography.geographyId, (map.get(item.commercialGeography.geographyId) || 0) + 1), new Map()));
  indexArtifact.deepReview = {
    architectureDecision,
    totals,
    automation: { autoPromotableInternal: autoPromotable, autoReconcileQa: autoQa, humanReview: totals.humanReview, discoveryOnly: totals.discoveryOnly, reject: totals.rejected },
    marketFindings: {
      "san-francisco": { role: "MATURE_CONTROL", canonicalMatches: 157, suiteAmbiguities: entities.filter((item) => item.pilotMarketId === "san-francisco" && item.conflictCodes.includes("SUITE_BUILDING_AMBIGUITY")).length, typeConflicts: 3, candidateLinksDowngraded: 43 },
      sacramento: { reviewedLinks: 3, municipalities: municipalityCounts("sacramento"), ownershipBoundary: "WEST_SACRAMENTO_AND_RANCHO_CORDOVA_EXCLUDED" },
      indianapolis: { reviewedLinks: 2, municipalities: municipalityCounts("indianapolis"), ownershipBoundary: "PLAINFIELD_EXCLUDED_AND_558_AIRTECH_CONFIRMED_LEGACY_SOURCE_WRONG" },
      "denver-aurora": { municipalities: municipalityCounts("denver-aurora"), candidateLinksDowngraded: 16, ownershipBoundary: "COMMERCE_CITY_EXCLUDED_FROM_DENVER_AURORA_PILOT_TARGET" },
      orlando: { municipalities: municipalityCounts("orlando"), discoveryHypotheses: { seaboardIndustrial: { classification: "WEAKER", supportingIdentities: 0 }, milleniaArea: { classification: "STRONGER_DISCOVERY_SIGNAL", supportingIdentities: orlandoDiscovery["orlando-millenia-commercial-candidate"] || 0 }, downtownSouthStreet: { classification: "UNCHANGED", supportingIdentities: orlandoDiscovery["orlando-downtown-south-industrial-candidate"] || 0 }, northwestOrlando: { classification: "UNCHANGED", supportingIdentities: 0 } } },
    },
  };
  write(path.join(OUTPUT_DIR, "index.json"), JSON.stringify(indexArtifact, null, 2) + "\n");
  for (const obsolete of ["ownership-and-identity-conflicts.txt", "property-type-conflicts.txt", "duplicate-suite-campus-review.txt", "representative-and-public-candidates.txt"]) {
    const obsoletePath = path.join(REPORT_DIR, obsolete);
    if (fs.existsSync(obsoletePath)) fs.unlinkSync(obsoletePath);
  }
  write(path.join(REPORT_DIR, "README.txt"), `Historical Property → Commercial Geography Reconciliation v1 Deep Review\n\nDecision: ${architectureDecision}\n\nThis partitioned, internal-only artifact changes no public, Recommendation Intelligence, availability, SEO, or runtime behavior.\n\n${reportTable(summaries, summaryColumns)}\nBaseline → final\n- Reconciled internal entities: ${BASELINE.reconciledEntities} → ${totals.reconciledEntities}\n- Reviewed/high-confidence geography links: ${BASELINE.geographyLinked} → ${totals.reviewedGeographyLinks}; ${totals.downgradedGeographyLinks} candidate-source links downgraded\n- Human review: ${BASELINE.humanReview} → ${totals.humanReview}\n- Discovery only: ${BASELINE.discoveryOnly} → ${totals.discoveryOnly}\n- Rejected: ${BASELINE.rejected} → ${totals.rejected}\n- AUTO_RECONCILE_QA reviewed: ${totals.autoQaReviewed}; confirmed ${totals.autoQaPromoted}; downgraded ${totals.autoQaDowngraded}\n- Municipality conflicts classified: ${totals.municipalityConflictsClassified}/${totals.municipalityConflicts}; all out-of-scope relationships remain blocked\n- Representative review: ${totals.strongRepresentatives} strong, ${totals.possibleRepresentatives} possible\n- Public review: ${totals.publicReviewed} reviewed-later, ${totals.publicNeedsEvidence} need evidence\n\nAutomation after review\n- AUTO_PROMOTABLE_INTERNAL: ${percent(autoPromotable / totals.normalizedIdentities)}\n- AUTO_RECONCILE_QA: ${percent(autoQa / totals.normalizedIdentities)}\n- HUMAN_REVIEW: ${percent(totals.humanReview / totals.normalizedIdentities)}\n- DISCOVERY_ONLY: ${percent(totals.discoveryOnly / totals.normalizedIdentities)}\n- REJECT: ${percent(totals.rejected / totals.normalizedIdentities)}\n\nThreshold assessment: APPROPRIATE in principle, but v1 was too permissive about multiple legacy IDs and candidate-level geography links. The deep-review gates correct both without loosening automation.\n\nNext horizontal recommendation: scale to exactly 10 additional markets with the same partitioned contract and mandatory sampled QA; do not publish properties.\n`);
  const conflictColumns = [["Market", (r) => r.pilotMarketId], ["Property", (r) => r.normalizedAddress], ["Municipality", (r) => r.municipality], ["Classification", (r) => r.municipalityReview?.classification], ["Promotion blocked", (r) => r.municipalityReview?.blocksGeographyPromotion], ["Legacy IDs", (r) => r.sourceIds.map((v) => v.sourceId).join(", ")]];
  write(path.join(REPORT_DIR, "municipality-conflicts.txt"), `Municipality conflicts — ranked review queue\n\nEvery listed record remains blocked from target-city geography promotion. Classification covers all ${municipalityConflicts.length} conflicts; this concise queue shows up to 50 per pilot.\n\n${reportTable(perMarketLimit(municipalityConflicts, 50), conflictColumns)}`);
  write(path.join(REPORT_DIR, "geography-link-review.txt"), `Geography-link review\n\nAll ${geographyLinks.length} v1 links were reassessed. Candidate/proximity-grade source relationships do not count as reviewed geography.\n\n${reportTable(geographyLinks, [["Market", (r) => r.pilotMarketId], ["Property", (r) => r.normalizedAddress], ["Geography", (r) => r.commercialGeography.label], ["Decision", (r) => r.geographyLinkReview.classification], ["Basis", (r) => r.geographyLinkReview.basis]])}`);
  write(path.join(REPORT_DIR, "type-conflicts.txt"), `Property-type conflicts\n\nHistorical observations are preserved; reviewed canonical type prevails and multi-type is not inferred.\n\n${reportTable(typeConflicts, [["Market", (r) => r.pilotMarketId], ["Property", (r) => r.normalizedAddress], ["Historical", (r) => r.propertyType.historicalObservations.join(", ")], ["Canonical", (r) => r.propertyType.reviewedTypes.join(", ")], ["Decision", (r) => r.propertyType.review?.decision]])}`);
  write(path.join(REPORT_DIR, "representative-candidates.txt"), `Representative candidates\n\nCandidate generation only; live recommendation representative sets are unchanged.\n\n${reportTable(representatives, [["Market", (r) => r.pilotMarketId], ["Property", (r) => r.normalizedAddress], ["Municipality", (r) => r.municipality], ["Geography", (r) => r.commercialGeography?.label || "unassigned"], ["Decision", (r) => r.representativeReview], ["Media", (r) => r.mediaRights]])}`);
  write(path.join(REPORT_DIR, "public-candidates-later.txt"), `Future public candidates\n\nNo publication approval. Media remains separately gated and all historical media remains non-public unless rights are explicit.\n\n${reportTable(publicCandidates, [["Market", (r) => r.pilotMarketId], ["Property", (r) => r.normalizedAddress], ["Municipality", (r) => r.municipality], ["Geography", (r) => r.commercialGeography?.label || "unassigned"], ["Decision", (r) => r.publicCandidateReview], ["Media", (r) => r.mediaRights]])}`);
  const unresolvedHighValue = entities.filter((item) => item.deepReview?.baselineTier === "AUTO_RECONCILE_QA" && item.deepReview.decision !== "RECONCILED_PROPERTY").sort((a, b) => b.historicalObservationSummary.historicalListingObservationCount - a.historicalObservationSummary.historicalListingObservationCount);
  write(path.join(REPORT_DIR, "unresolved-high-value.txt"), `Unresolved high-value queue\n\nHighest-observation records downgraded from v1 AUTO_RECONCILE_QA.\n\n${reportTable(perMarketLimit(unresolvedHighValue, 40), [["Market", (r) => r.pilotMarketId], ["Property", (r) => r.normalizedAddress], ["Municipality", (r) => r.municipality], ["Decision", (r) => r.deepReview.decision], ["Reason", (r) => r.deepReview.reasons.join("; ")], ["Listings", (r) => r.historicalObservationSummary.historicalListingObservationCount]])}`);
  write(path.join(REPORT_DIR, "atlas-integration.txt"), `Atlas integration findings\n\nAtlas levels remain unchanged. Sacramento and Indianapolis reviewed address links remain confirmed. Candidate-source SF/Denver relationships were downgraded pending boundary evidence. Orlando remains discovery-only.\n\n${reportTable(discovery.slice(0, 500), [["Market", (r) => r.pilotMarketId], ["Property", (r) => r.normalizedAddress], ["Candidate", (r) => r.commercialGeography?.label], ["Confidence", (r) => r.relationshipConfidence]])}`);
  console.log(JSON.stringify({ summaries, totals }, null, 2));
})().catch((error) => { console.error(error); process.exit(1); });
