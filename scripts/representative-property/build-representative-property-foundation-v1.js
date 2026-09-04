#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const representativeContract = require("../../lib/representative-property/representative-property-foundation-v1.js");
const reconciliationContract = require("../../lib/property-reconciliation/property-reconciliation-v1.js");

const ROOT = path.join(__dirname, "../..");
const OUTPUT = path.join(ROOT, "data/internal/representative-property-foundation-v1");
const REPORTS = path.join(OUTPUT, "reports");
const V1 = path.join(ROOT, "data/internal/property-geography-reconciliation-v1");
const C2 = path.join(ROOT, "data/internal/property-geography-reconciliation-v1-cohort-2");
const MARKET_ORDER = Object.freeze([
  "san-francisco", "sacramento", "indianapolis", "denver-aurora", "orlando",
  "seattle-kent-eastside", "san-jose-south-bay", "detroit-novi", "atlanta", "nashville",
  "kansas-city-mo-ks", "miami-doral-medley", "las-vegas-clark-county", "east-bay",
  "los-angeles-independent-cities",
]);

const MARKET_LABELS = Object.freeze({
  "san-francisco": "San Francisco", sacramento: "Sacramento", indianapolis: "Indianapolis",
  "denver-aurora": "Denver / Aurora", orlando: "Orlando",
  "seattle-kent-eastside": "Seattle / Kent / Eastside", "san-jose-south-bay": "San Jose / South Bay",
  "detroit-novi": "Detroit / Novi", atlanta: "Atlanta", nashville: "Nashville",
  "kansas-city-mo-ks": "Kansas City MO / KS", "miami-doral-medley": "Miami / Doral / Medley",
  "las-vegas-clark-county": "Las Vegas / Clark County", "east-bay": "East Bay",
  "los-angeles-independent-cities": "Los Angeles / independently owned municipalities",
});

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof value === "string" ? value : `${JSON.stringify(value)}\n`);
}
function sha256(bytes) { return crypto.createHash("sha256").update(bytes).digest("hex"); }
function clean(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function slug(value) { return clean(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function addressFromLabel(value) { return clean(value).replace(/^.*?—\s*/, ""); }
function addressKey(state, municipality, value) {
  return `${state}|${clean(municipality).toLowerCase()}|${reconciliationContract.normalizeAddress(addressFromLabel(value)).normalized}`;
}
function unique(values) { return [...new Set(values.filter(Boolean))]; }

function loadMarketEntities(directory, marketId) {
  const direct = path.join(directory, `${marketId}.json`);
  if (fs.existsSync(direct)) return JSON.parse(fs.readFileSync(direct)).entities;
  const index = JSON.parse(fs.readFileSync(path.join(directory, marketId, "index.json")));
  return index.parts.flatMap((part) => JSON.parse(fs.readFileSync(path.join(directory, part.file))).entities);
}

function evidenceFoundationRepresentatives(modulePath, marketId) {
  const foundation = require(modulePath);
  const rows = [];
  for (const candidate of Object.values(foundation.candidates || {})) {
    for (const representative of candidate.representatives || []) rows.push({
      marketId,
      id: representative.id,
      label: representative.label,
      kind: representative.kind,
      path: representative.path || null,
      municipality: candidate.municipality,
      state: candidate.state,
      geographyId: representative.ownerGeographyId,
      geographyLabel: candidate.label,
      role: representative.role,
      evidenceSources: (representative.sources || []).map((source) => source.id || source.location),
      reviewStatus: representative.reviewStatus,
    });
  }
  return rows;
}

function sanDiegoRepresentatives() {
  const foundation = require("../../_data/sanDiegoIndustrialFlexCompositionFoundation.js");
  return (foundation.industrial?.districts || []).flatMap((district) => (district.representatives || []).map((item) => ({
    marketId: "san-diego", id: item.id, label: item.label, kind: "BUILDING", path: item.path,
    municipality: "San Diego", state: "CA", geographyId: district.districtId,
    geographyLabel: district.districtName, role: item.role, evidenceSources: district.provenance || [], reviewStatus: "APPROVED",
  })));
}

function sfRepresentatives() {
  const live = require("../../_data/recommendationRepresentativeBuildings.js");
  const rows = [];
  const seen = new Set();
  for (const district of Object.values(live.byDistrictSlug)) {
    for (const item of (district.buildings || []).slice(0, live.maxBuildingsPerDistrict)) {
      if (item.city !== "San Francisco" || seen.has(item.buildingId)) continue;
      seen.add(item.buildingId);
      rows.push({
        marketId: "san-francisco", id: item.buildingId, label: item.address, kind: "BUILDING",
        path: item.canonicalUrl, municipality: item.city, state: item.state,
        geographyId: item.districtSlug, geographyLabel: item.districtName, role: item.representativeReason,
        evidenceSources: ["_data/recommendationRepresentativeBuildings.js", "_data/commercialBuildingIntelligence.js", "_data/locationKnowledgeGraph.js"],
        reviewStatus: `LIVE_SELECTION:${item.buildingBriefStatus}`,
      });
    }
  }
  return rows;
}

const liveSets = Object.freeze({
  "san-francisco": sfRepresentatives(),
  "san-diego": sanDiegoRepresentatives(),
  "north-orange-county": evidenceFoundationRepresentatives("../../_data/northOrangeCountyIndustrialFlexEvidenceFoundation.js", "north-orange-county"),
  phoenix: evidenceFoundationRepresentatives("../../_data/phoenixIndustrialFlexEvidenceFoundation.js", "phoenix"),
  indianapolis: evidenceFoundationRepresentatives("../../_data/indianapolisIndustrialFlexEvidenceFoundation.js", "indianapolis"),
  sacramento: evidenceFoundationRepresentatives("../../_data/sacramentoIndustrialFlexEvidenceFoundation.js", "sacramento"),
});

function roleFor(entity) {
  const types = entity.propertyType?.reviewedTypes || [];
  if (types.includes("industrial")) return "conventional Industrial / warehouse or operating-format example";
  if (types.includes("flex")) return "office/warehouse or flexible operating-format example";
  if (types.includes("office")) return "professional Office environment example";
  if (types.includes("retail")) return "customer-facing Retail environment example";
  if (types.includes("medical")) return "medical commercial environment example";
  if (types.includes("mixed_commercial")) return "mixed commercial environment example";
  return "";
}

function recordFor(entity, qualification, live = null) {
  return {
    representativeId: live?.id || entity.durablePropertyId,
    kind: "PROPERTY_BUILDING",
    label: live?.label || entity.originalAddresses?.[0] || entity.normalizedAddress,
    durablePropertyId: entity.durablePropertyId,
    aliases: unique([...(entity.aliases || []), ...(entity.sourceIds || []).map((item) => item.sourceId)]).sort(),
    municipality: entity.municipality,
    state: entity.state,
    geography: live ? { id: live.geographyId, label: live.geographyLabel, relationship: "REVIEWED_EVIDENCE_FOUNDATION" } : entity.commercialGeography,
    propertyTypes: entity.propertyType?.reviewedTypes || [],
    representativeRole: live?.role || roleFor(entity),
    representativeStatus: qualification.representativeStatus,
    qualification: qualification.qualification,
    evidenceSource: live?.evidenceSources || [],
    reconciliationSource: entity.provenance,
    reconciliationStatus: entity.reconciliationStatus,
    reviewStatus: live?.reviewStatus || entity.reviewStatus,
    mediaRights: qualification.mediaRights,
    publicUseStatus: qualification.publicUseStatus,
    availabilityBoundary: qualification.availabilityBoundary,
    sourceArtifactMarket: entity.pilotMarketId,
  };
}

function table(rows, columns) {
  if (!rows.length) return "None.\n";
  return `| ${columns.map((item) => item[0]).join(" | ")} |\n|${columns.map(() => "---").join("|")}|\n${rows.map((row) => `| ${columns.map((item) => clean(item[1](row)).replace(/\|/g, "/")).join(" | ")} |`).join("\n")}\n`;
}

fs.mkdirSync(REPORTS, { recursive: true });
const artifacts = [];
const allRecords = [];
const conflicts = [];
const calibration = {};

for (const marketId of MARKET_ORDER) {
  const sourceDirectory = ["san-francisco", "sacramento", "indianapolis", "denver-aurora", "orlando"].includes(marketId) ? V1 : C2;
  const entities = loadMarketEntities(sourceDirectory, marketId);
  const byAddress = new Map(entities.map((entity) => [addressKey(entity.state, entity.municipality, entity.normalizedAddress), entity]));
  const existing = liveSets[marketId] || [];
  const existingProperties = existing.filter((item) => item.kind !== "COMMERCIAL_ENVIRONMENT");
  const existingEnvironments = existing.filter((item) => item.kind === "COMMERCIAL_ENVIRONMENT");
  const matchedExistingKeys = new Set();
  const records = [];

  for (const live of existingProperties) {
    const key = addressKey(live.state, live.municipality, live.label);
    const entity = byAddress.get(key);
    if (!entity) continue;
    matchedExistingKeys.add(entity.durablePropertyId);
    const qualification = representativeContract.qualifyProperty({ entity, existingReviewedRepresentative: true, reviewedGeographyOverride: true, explanatoryRole: live.role, evidenceSources: live.evidenceSources, mediaRights: entity.mediaRights, publicEvidenceReviewed: true });
    records.push(recordFor(entity, qualification, live));
  }

  const candidateEntities = entities.filter((entity) =>
    !matchedExistingKeys.has(entity.durablePropertyId) &&
    (entity.representativeReview !== "NOT_REPRESENTATIVE" || entity.geographyLinkReview || entity.commercialGeography?.confidence === "REVIEWED")
  );
  for (const entity of candidateEntities) {
    const qualification = representativeContract.qualifyProperty({ entity, explanatoryRole: roleFor(entity), evidenceSources: entity.provenance, mediaRights: entity.mediaRights });
    const record = recordFor(entity, qualification);
    records.push(record);
    if (qualification.qualification.blockingConflicts.length) conflicts.push(record);
  }
  const environments = existingEnvironments.map((item) => representativeContract.createEnvironment({
    id: item.id, label: item.label, municipality: item.municipality, state: item.state, geographyId: item.geographyId,
    role: item.role, evidenceSources: item.evidenceSources, reviewStatus: item.reviewStatus, mediaRights: "RIGHTS_UNKNOWN", publicEvidenceReviewed: true,
  }));
  records.sort((a, b) => a.representativeStatus.localeCompare(b.representativeStatus) || (a.geography?.id || "").localeCompare(b.geography?.id || "") || a.durablePropertyId.localeCompare(b.durablePropertyId));
  environments.sort((a, b) => a.geographyId.localeCompare(b.geographyId) || a.representativeId.localeCompare(b.representativeId));
  const geographyCoverage = {};
  for (const item of [...records, ...environments]) {
    const geographyId = item.geography?.id || item.geographyId || "unassigned";
    geographyCoverage[geographyId] ||= { reviewedRepresentatives: 0, strongCandidates: 0, possibleCandidates: 0, environmentRepresentatives: 0 };
    if (item.representativeStatus === "REVIEWED_REPRESENTATIVE") geographyCoverage[geographyId].reviewedRepresentatives += 1;
    if (item.representativeStatus === "STRONG_REPRESENTATIVE_CANDIDATE") geographyCoverage[geographyId].strongCandidates += 1;
    if (item.representativeStatus === "POSSIBLE_REPRESENTATIVE") geographyCoverage[geographyId].possibleCandidates += 1;
    if (item.representativeStatus === "REPRESENTATIVE_ENVIRONMENT") geographyCoverage[geographyId].environmentRepresentatives += 1;
  }
  const summary = {
    marketId, label: MARKET_LABELS[marketId], reconciledPropertyCandidatesReviewed: records.length,
    reviewedRepresentatives: records.filter((item) => item.representativeStatus === "REVIEWED_REPRESENTATIVE").length,
    strongCandidates: records.filter((item) => item.representativeStatus === "STRONG_REPRESENTATIVE_CANDIDATE").length,
    possibleCandidates: records.filter((item) => item.representativeStatus === "POSSIBLE_REPRESENTATIVE").length,
    notRepresentative: records.filter((item) => item.representativeStatus === "NOT_REPRESENTATIVE").length,
    environmentRepresentatives: environments.length,
    reviewedGeographiesAvailable: Object.keys(geographyCoverage).filter((id) => id !== "unassigned" && (geographyCoverage[id].reviewedRepresentatives || geographyCoverage[id].strongCandidates || geographyCoverage[id].environmentRepresentatives)).length,
    blockers: unique(records.flatMap((item) => item.qualification.blockingConflicts)).sort(), geographyCoverage,
  };
  calibration[marketId] = { existingPropertyRepresentatives: existingProperties.length, reconciliationMatches: matchedExistingKeys.size, matchRate: existingProperties.length ? Number((matchedExistingKeys.size / existingProperties.length).toFixed(4)) : null, missed: existingProperties.filter((item) => !byAddress.has(addressKey(item.state, item.municipality, item.label))).map((item) => item.label) };
  const artifact = { schemaVersion: representativeContract.schemaVersion, scope: { marketId, publicBehavior: "NONE", availabilitySemantics: "REPRESENTATIVE_ONLY_NOT_CURRENT_AVAILABILITY" }, summary, representatives: records, environments };
  const file = `${marketId}.json`;
  write(path.join(OUTPUT, file), artifact);
  const bytes = fs.readFileSync(path.join(OUTPUT, file));
  artifacts.push({ marketId, file, bytes: bytes.length, sha256: sha256(bytes) });
  allRecords.push(...records, ...environments);
}

for (const marketId of ["san-diego", "north-orange-county", "phoenix"]) calibration[marketId] = { existingPropertyRepresentatives: liveSets[marketId].filter((item) => item.kind !== "COMMERCIAL_ENVIRONMENT").length, existingEnvironmentRepresentatives: liveSets[marketId].filter((item) => item.kind === "COMMERCIAL_ENVIRONMENT").length, evidenceOverrideCompatibility: liveSets[marketId].every((item) => item.role && item.evidenceSources.length), liveSetMutation: "NONE" };

const totals = {
  markets: MARKET_ORDER.length,
  reviewedRepresentatives: allRecords.filter((item) => item.representativeStatus === "REVIEWED_REPRESENTATIVE").length,
  strongCandidates: allRecords.filter((item) => item.representativeStatus === "STRONG_REPRESENTATIVE_CANDIDATE").length,
  possibleCandidates: allRecords.filter((item) => item.representativeStatus === "POSSIBLE_REPRESENTATIVE").length,
  environmentRepresentatives: allRecords.filter((item) => item.representativeStatus === "REPRESENTATIVE_ENVIRONMENT").length,
  notRepresentative: allRecords.filter((item) => item.representativeStatus === "NOT_REPRESENTATIVE").length,
  publicRepresentativeCandidates: allRecords.filter((item) => item.publicUseStatus === "PUBLIC_REPRESENTATIVE_CANDIDATE").length,
  needsPublicEvidence: allRecords.filter((item) => item.publicUseStatus === "NEEDS_PUBLIC_EVIDENCE").length,
};
const summaries = artifacts.map((item) => JSON.parse(fs.readFileSync(path.join(OUTPUT, item.file))).summary);
const rankedGeographies = summaries.flatMap((market) => Object.entries(market.geographyCoverage).filter(([id]) => id !== "unassigned").map(([geographyId, counts]) => ({ marketId: market.marketId, geographyId, ...counts, leverage: counts.reviewedRepresentatives || counts.environmentRepresentatives ? "HIGH_RI_LEVERAGE" : counts.strongCandidates || counts.possibleCandidates ? "MEDIUM_RI_LEVERAGE" : "LOW_RI_LEVERAGE" }))).sort((a, b) => ({ HIGH_RI_LEVERAGE: 0, MEDIUM_RI_LEVERAGE: 1, LOW_RI_LEVERAGE: 2 })[a.leverage] - ({ HIGH_RI_LEVERAGE: 0, MEDIUM_RI_LEVERAGE: 1, LOW_RI_LEVERAGE: 2 })[b.leverage] || b.reviewedRepresentatives - a.reviewedRepresentatives || a.marketId.localeCompare(b.marketId) || a.geographyId.localeCompare(b.geographyId));
const index = {
  schemaVersion: representativeContract.schemaVersion,
  sourceSnapshot: "repository-controlled-reconciliation-and-evidence-foundations:2026-09-04",
  scope: { markets: MARKET_ORDER, calibrationMarkets: ["san-francisco", "san-diego", "north-orange-county", "phoenix", "indianapolis", "sacramento"], publicBehavior: "NONE", liveRepresentativeMutation: "NONE" },
  taxonomies: { representativeStatuses: representativeContract.REPRESENTATIVE_STATUSES, publicUseStatuses: representativeContract.PUBLIC_USE_STATUSES, mediaRights: representativeContract.MEDIA_RIGHTS },
  qualificationPolicy: { reviewedGeographyRequiredForStrong: true, candidateGeographyMaximum: "POSSIBLE_REPRESENTATIVE", municipalityAndHierarchyConflictsBlock: true, availabilityIgnored: true, mediaIndependent: true, diversityTargetPerGeography: "1_TO_3_COMPLEMENTARY_PROPERTIES_PLUS_ENVIRONMENTS" },
  totals, summaries, calibration, marketFiles: artifacts,
  leverage: { recommendationIntelligence: rankedGeographies.slice(0, 10), publicSurface: rankedGeographies.filter((item) => item.reviewedRepresentatives || item.environmentRepresentatives).slice(0, 10) },
  bridge: { path: ["RECOMMENDED_GEOGRAPHY", "REPRESENTATIVE_ENVIRONMENT_OR_PROPERTY", "FUTURE_COMMERCIAL_PROPERTIES", "FUTURE_VERIFIED_AVAILABILITY"], minimumNextContract: ["reviewed_property_to_geography_relationship", "public_evidence_review", "media_rights_review_if_media_used", "separate_fresh_availability_observation"] },
  decision: "A. REPRESENTATIVE FOUNDATION READY — USE IN FUTURE EVIDENCE SPRINTS",
  nextHorizontalRecommendation: "DURABLE PROPERTY ENTITY PILOT",
};
write(path.join(OUTPUT, "index.json"), index);

const propertyRecords = allRecords.filter((item) => item.kind === "PROPERTY_BUILDING");
const environments = allRecords.filter((item) => item.kind === "COMMERCIAL_ENVIRONMENT");
const cols = [["Market", (r) => r.sourceArtifactMarket || MARKET_ORDER.find((id) => (liveSets[id] || []).some((x) => x.id === r.representativeId)) || "reviewed"], ["Geography", (r) => r.geography?.id || r.geographyId], ["Representative", (r) => r.label], ["Status", (r) => r.representativeStatus], ["Media", (r) => r.mediaRights]];
write(path.join(OUTPUT, "README.txt"), `Representative Property Foundation v1\n\nInternal-only property and environment examples. No current availability, public publishing, route creation, or live Recommendation Intelligence mutation.\n\nMarkets: ${MARKET_ORDER.length}\nReviewed property representatives: ${totals.reviewedRepresentatives}\nStrong candidates: ${totals.strongCandidates}\nPossible candidates: ${totals.possibleCandidates}\nEnvironment representatives: ${totals.environmentRepresentatives}\n\nCandidate geography never qualifies a strong representative. Historical media remains RIGHTS_UNKNOWN unless independently reviewed.\n`);
write(path.join(REPORTS, "reviewed-representatives.txt"), `Reviewed representatives\n\n${table(propertyRecords.filter((r) => r.representativeStatus === "REVIEWED_REPRESENTATIVE"), cols)}`);
write(path.join(REPORTS, "strong-representative-candidates.txt"), `Strong representative candidates\n\n${table(propertyRecords.filter((r) => r.representativeStatus === "STRONG_REPRESENTATIVE_CANDIDATE"), cols)}`);
write(path.join(REPORTS, "possible-representatives.txt"), `Possible representatives\n\n${table(propertyRecords.filter((r) => r.representativeStatus === "POSSIBLE_REPRESENTATIVE"), cols)}`);
write(path.join(REPORTS, "environment-candidates.txt"), `Environment representatives\n\n${table(environments, cols)}`);
write(path.join(REPORTS, "representative-conflicts.txt"), `Representative conflicts\n\n${table(conflicts, [["Market", (r) => r.sourceArtifactMarket], ["Property", (r) => r.label], ["Geography", (r) => r.geography?.id || "unassigned"], ["Conflicts", (r) => r.qualification.blockingConflicts.join(", ")]])}`);
write(path.join(REPORTS, "public-representative-candidates.txt"), `Future public-use review\n\nNothing in this report is published.\n\n${table(propertyRecords.filter((r) => r.publicUseStatus !== "REJECT_PUBLIC"), [["Market", (r) => r.sourceArtifactMarket], ["Property", (r) => r.label], ["Status", (r) => r.publicUseStatus], ["Media", (r) => r.mediaRights]])}`);
write(path.join(REPORTS, "media-rights-review.txt"), `Media-rights review\n\nProperty credibility and media rights are independent. No historical imagery is reusable by default.\n\n${table(allRecords.filter((r) => r.mediaRights === "RIGHTS_UNKNOWN"), cols)}`);
write(path.join(REPORTS, "geography-coverage.txt"), `Geography coverage\n\n${table(rankedGeographies, [["Market", (r) => r.marketId], ["Geography", (r) => r.geographyId], ["Reviewed", (r) => r.reviewedRepresentatives], ["Strong", (r) => r.strongCandidates], ["Possible", (r) => r.possibleCandidates], ["Environment", (r) => r.environmentRepresentatives], ["RI leverage", (r) => r.leverage]])}`);
write(path.join(REPORTS, "live-set-calibration.txt"), `Live representative-set calibration\n\nThe foundation audits but does not alter live sets. Evidence-foundation relationships are explicit reviewed overrides; raw reconciliation alone cannot recreate those judgments.\n\n${table(Object.entries(calibration).map(([marketId, value]) => ({ marketId, ...value })), [["Market", (r) => r.marketId], ["Existing properties", (r) => r.existingPropertyRepresentatives], ["Reconciliation matches", (r) => r.reconciliationMatches ?? "evidence calibration"], ["Match rate", (r) => r.matchRate ?? (r.evidenceOverrideCompatibility ? "compatible" : "n/a")], ["Missed", (r) => (r.missed || []).length]])}`);

console.log(JSON.stringify({ totals, artifacts, calibration, decision: index.decision, next: index.nextHorizontalRecommendation }, null, 2));
