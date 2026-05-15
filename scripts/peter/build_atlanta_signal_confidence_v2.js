const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const LINEAGE_PATH = path.join(ROOT, "data/peter/atlanta/lineage/atlanta_lineage_objects.json");
const DIVERSITY_PATH = path.join(ROOT, "data/peter/atlanta/intelligence/neighborhood_diversity_metrics.json");
const RAW_SUBSET_PATH = path.join(ROOT, "data/peter/research/atlanta_building_listing_subset_v1.json");
const V1_SIGNALS_PATH = path.join(ROOT, "data/peter/research/neighborhood_intelligence_signals_v1.json");
const OUTPUT_PATH = path.join(ROOT, "data/peter/atlanta/intelligence/neighborhood_signal_confidence_v2.json");
const REPORT_PATH = path.join(ROOT, "data/peter/atlanta/reports/atlanta_signal_confidence_v2_review.md");

const SIGNAL_DEFINITIONS = [
  {
    key: "office_oriented",
    label: "Office-oriented",
    source_space_types: ["office"],
    durable: true,
    min_public_buildings: 100,
    min_review_buildings: 40,
    min_public_share: 0.55,
    min_review_share: 0.35,
    representative_terms: ["office", "suburban office"],
  },
  {
    key: "retail_context",
    label: "Retail context",
    source_space_types: ["retail"],
    durable: true,
    min_public_buildings: 60,
    min_review_buildings: 25,
    min_public_share: 0.18,
    min_review_share: 0.08,
    representative_terms: ["retail"],
  },
  {
    key: "industrial_flex_context",
    label: "Industrial/flex context",
    source_space_types: ["industrial", "flex"],
    durable: true,
    min_public_buildings: 60,
    min_review_buildings: 25,
    min_public_share: 0.18,
    min_review_share: 0.08,
    representative_terms: ["industrial", "flex"],
  },
  {
    key: "land_context",
    label: "Land/development context",
    source_space_types: ["land"],
    durable: false,
    min_public_buildings: 9999,
    min_review_buildings: 20,
    min_public_share: 1,
    min_review_share: 0.05,
    representative_terms: ["land"],
    internal_only: true,
  },
];

const REPRESENTATIVE_ONLY_SIGNALS = [
  {
    key: "professional_services",
    label: "Professional services fit",
    representative_terms: ["professional services"],
  },
  {
    key: "financial_services",
    label: "Financial services fit",
    representative_terms: ["financial services"],
  },
  {
    key: "creative_office",
    label: "Creative office",
    representative_terms: ["creative office"],
  },
  {
    key: "showroom",
    label: "Showroom context",
    representative_terms: ["showroom"],
  },
  {
    key: "transit_oriented",
    label: "Transit-oriented context",
    representative_terms: ["transit-oriented", "transit oriented"],
  },
  {
    key: "freeway_access",
    label: "Freeway access context",
    representative_terms: ["freeway access"],
  },
];

function addToSetMap(map, key, value) {
  if (!value) return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(value);
}

function pct(value) {
  return Math.round(value * 1000) / 10;
}

function tier(score) {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  if (score >= 40) return "low";
  return "weak";
}

function normalizeLabel(value) {
  return String(value || "").trim().toLowerCase();
}

function representativeAgreement(rep, definition) {
  const signals = (rep?.page_signals || []).map(normalizeLabel);
  const types = (rep?.representative_building_types || []).map((item) => normalizeLabel(item.key));
  const haystack = [...signals, ...types].join(" | ");
  return definition.representative_terms.some((term) => haystack.includes(term));
}

function publicStatus({ score, definition, rawShare, rawRows, uniqueBuildings, uniqueCompanies, uniqueContacts, diversity, concentration, coworking, repAgrees, provenanceConcentrationRisk, provenanceCoverageRisk }) {
  if (definition.internal_only || !definition.durable) return "internal_only";
  if (rawRows < definition.min_review_buildings || uniqueBuildings < definition.min_review_buildings || rawShare < definition.min_review_share) {
    return "internal_only";
  }

  const broadDurableSupport =
    rawRows >= definition.min_public_buildings &&
    uniqueBuildings >= definition.min_public_buildings &&
    rawShare >= definition.min_public_share &&
    repAgrees;

  if (
    broadDurableSupport &&
    score >= 78 &&
    diversity >= 45 &&
    concentration <= 62 &&
    coworking < 20 &&
    !provenanceConcentrationRisk &&
    !provenanceCoverageRisk &&
    uniqueCompanies >= 5 &&
    uniqueContacts >= 40
  ) {
    return "public_safe";
  }

  if (provenanceConcentrationRisk || provenanceCoverageRisk || concentration > 62 || uniqueCompanies < 5 || !repAgrees || score >= 55) {
    return "review_needed";
  }

  return "internal_only";
}

function scoreSignal({ definition, neighborhoodRows, metric, rep }) {
  const totalRows = neighborhoodRows.length || 1;
  const matchingRows = neighborhoodRows.filter((row) => definition.source_space_types.includes(row.space_type));
  const uniqueBuildings = new Set(matchingRows.map((row) => row.building_id).filter(Boolean));
  const uniqueCompanies = new Set(matchingRows.map((row) => row.origin_company || row.company).filter(Boolean));
  const uniqueContacts = new Set(matchingRows.map((row) => row.listing_contact?.user_id).filter(Boolean));
  const uniqueProvenanceEntities = new Set(
    matchingRows.flatMap((row) => row.provenance_entities || [row.origin_company || row.company].filter(Boolean)).filter(Boolean)
  );
  const rawShare = matchingRows.length / totalRows;
  const repAgrees = representativeAgreement(rep, definition);
  const provenanceConcentrationRisk =
    metric.top_provenance_entity_concentration >= 65 ||
    metric.top_company_concentration >= 55 ||
    metric.warnings.some((warning) => /Top provenance entity|Top originating company|Low identifiable originating-company/i.test(warning));
  const provenanceCoverageRisk =
    metric.known_origin_company_coverage < 25 ||
    metric.known_provenance_entity_coverage < 25 ||
    metric.warnings.some((warning) => /coverage is low/i.test(warning));
  const reasons = [];
  const warnings = [];

  if (matchingRows.length) reasons.push(`${matchingRows.length} lineage rows match ${definition.label}.`);
  if (uniqueBuildings.size) reasons.push(`${uniqueBuildings.size} unique buildings support the signal.`);
  if (rawShare) reasons.push(`${pct(rawShare)}% of lineage rows match the signal.`);
  if (repAgrees) reasons.push("Published representative-building/page signals agree with the raw pattern.");
  if (metric.diversity_score >= 55) reasons.push(`Neighborhood diversity score is ${metric.diversity_score}.`);
  if (uniqueCompanies.size >= 5) reasons.push(`${uniqueCompanies.size} originating companies support the signal.`);

  if (!repAgrees) warnings.push("Representative-building/page signals do not clearly confirm this raw pattern.");
  if (provenanceConcentrationRisk) warnings.push("True provenance concentration is elevated; do not rely on this signal without review.");
  if (provenanceCoverageRisk) warnings.push("True provenance coverage is thin; do not rely on this signal without review.");
  if (metric.concentration_score > 62) warnings.push(`Concentration score is elevated at ${metric.concentration_score}.`);
  if (uniqueCompanies.size < 5) warnings.push(`Only ${uniqueCompanies.size} identifiable originating companies support the signal.`);
  if (definition.internal_only) warnings.push("Signal is not durable enough for public neighborhood identity.");

  const rawStrength = Math.min(rawShare / Math.max(definition.min_public_share, 0.01), 1) * 32;
  const buildingSupport = Math.min(uniqueBuildings.size / Math.max(definition.min_public_buildings, 1), 1) * 24;
  const contactSupport = Math.min(uniqueContacts.size / 60, 1) * 10;
  const diversitySupport = Math.min(metric.diversity_score / 70, 1) * 12;
  const concentrationPenalty = Math.min(metric.concentration_score / 100, 1) * 14;
  const provenancePenalty = provenanceConcentrationRisk ? 8 : 0;
  const repScore = repAgrees ? 18 : -8;
  const coworkingPenalty = metric.coworking_concentration >= 20 ? 8 : 0;
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(rawStrength + buildingSupport + contactSupport + diversitySupport + repScore - concentrationPenalty - provenancePenalty - coworkingPenalty)
    )
  );

  const status = publicStatus({
    score,
    definition,
    rawShare,
    rawRows: matchingRows.length,
    uniqueBuildings: uniqueBuildings.size,
    uniqueCompanies: uniqueCompanies.size,
    uniqueContacts: uniqueContacts.size,
    diversity: metric.diversity_score,
    concentration: metric.concentration_score,
    coworking: metric.coworking_concentration,
    repAgrees,
    provenanceConcentrationRisk,
    provenanceCoverageRisk,
  });

  return {
    signal_key: definition.key,
    label: definition.label,
    confidence_score: score,
    confidence_tier: tier(score),
    public_use_status: status,
    reasons,
    warnings,
    supporting_counts: {
      lineage_rows: matchingRows.length,
      lineage_row_share: pct(rawShare),
      unique_buildings: uniqueBuildings.size,
      unique_companies: uniqueCompanies.size,
      unique_provenance_entities: uniqueProvenanceEntities.size,
      unique_listing_contacts: uniqueContacts.size,
      diversity_score: metric.diversity_score,
      concentration_score: metric.concentration_score,
      coworking_concentration: metric.coworking_concentration,
      known_origin_company_coverage: metric.known_origin_company_coverage,
      known_provenance_entity_coverage: metric.known_provenance_entity_coverage,
      representative_buildings: rep?.representative_building_count || 0,
      representative_agreement: repAgrees,
      top_ingestion_origin_concentration: metric.top_ingestion_origin_concentration,
      top_provenance_entity_concentration: metric.top_provenance_entity_concentration,
    },
  };
}

function scoreRepresentativeOnlySignal({ definition, metric, rep, v1Signals }) {
  const repAgrees = representativeAgreement(rep, definition);
  const v1 = v1Signals.find((signal) => signal.key === definition.key);
  if (!repAgrees && !v1) return null;

  const reasons = [];
  const warnings = [
    "Signal is currently supported by reviewed page/profile or representative-building signals, not broad raw lineage text.",
    "Requires editorial review before public use.",
  ];
  if (repAgrees) reasons.push("Published page/profile signals include this concept.");
  if (v1) reasons.push(`Existing prototype extractor scored this signal ${v1.confidence} (${v1.score}).`);
  if (metric.top_provenance_entity_concentration >= 65 || metric.top_company_concentration >= 55) {
    warnings.push("Raw lineage true-provenance concentration is elevated.");
  }
  if (metric.known_origin_company_coverage < 25 || metric.known_provenance_entity_coverage < 25) {
    warnings.push("Raw lineage true-provenance coverage is thin.");
  }

  const score = Math.max(35, Math.min(72, Math.round((v1?.score || 0.45) * 70 + (repAgrees ? 12 : 0) - metric.concentration_score * 0.12)));
  return {
    signal_key: definition.key,
    label: definition.label,
    confidence_score: score,
    confidence_tier: tier(score),
    public_use_status: "review_needed",
    reasons,
    warnings,
    supporting_counts: {
      lineage_rows: 0,
      lineage_row_share: 0,
      unique_buildings: 0,
      unique_companies: 0,
      unique_listing_contacts: 0,
      diversity_score: metric.diversity_score,
      concentration_score: metric.concentration_score,
      coworking_concentration: metric.coworking_concentration,
      known_origin_company_coverage: metric.known_origin_company_coverage,
      known_provenance_entity_coverage: metric.known_provenance_entity_coverage,
      representative_buildings: rep?.representative_building_count || 0,
      representative_agreement: repAgrees,
      top_ingestion_origin_concentration: metric.top_ingestion_origin_concentration,
      top_provenance_entity_concentration: metric.top_provenance_entity_concentration,
    },
  };
}

function buildReport(output) {
  const all = output.neighborhoods.flatMap((neighborhood) =>
    neighborhood.signals.map((signal) => ({ ...signal, neighborhood: neighborhood.neighborhood }))
  );
  const publicSafe = all.filter((signal) => signal.public_use_status === "public_safe").sort((a, b) => b.confidence_score - a.confidence_score);
  const review = all.filter((signal) => signal.public_use_status === "review_needed").sort((a, b) => b.confidence_score - a.confidence_score);
  const internal = all.filter((signal) => signal.public_use_status === "internal_only").sort((a, b) => b.confidence_score - a.confidence_score);
  const blockedByProvenanceRisk = all.filter((signal) => signal.warnings.some((warning) => /provenance concentration|provenance coverage|Concentration score|originating companies/i.test(warning)));
  const disagreements = all.filter((signal) => !signal.supporting_counts.representative_agreement && signal.supporting_counts.lineage_rows > 0);

  const lines = [];
  lines.push("# Atlanta Signal Confidence v2 Review");
  lines.push("");
  lines.push(`Date: ${new Date().toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push("## Purpose");
  lines.push("");
  lines.push("This review scores Atlanta neighborhood intelligence signals using raw lineage strength, building support, diversity, concentration, representative-building agreement, and source warnings.");
  lines.push("");
  lines.push("Signals are historical/contextual review aids. They do not imply live inventory, pricing, or current availability.");
  lines.push("");
  lines.push("LMS is treated as Rofo's neutral internal ingestion system. It is not treated as a single external source and does not block confidence by itself. Provenance risk is measured from originating companies, listing contacts, broker/portfolio groups, and non-LMS feed groups.");
  lines.push("");
  lines.push("## Strongest Public-Safe Candidates");
  lines.push("");
  if (!publicSafe.length) {
    lines.push("- None. All Atlanta signals currently require editorial review or are internal-only.");
  } else {
    for (const signal of publicSafe) {
      lines.push(`- ${signal.neighborhood}: ${signal.label} (${signal.confidence_tier}, ${signal.confidence_score}). ${signal.reasons.join(" ")}`);
    }
  }
  lines.push("");
  lines.push("## Signals Requiring Editorial Review");
  lines.push("");
  for (const signal of review.slice(0, 20)) {
    lines.push(`- ${signal.neighborhood}: ${signal.label} (${signal.confidence_tier}, ${signal.confidence_score}). Warnings: ${signal.warnings.join(" ")}`);
  }
  lines.push("");
  lines.push("## Internal-Only Signals");
  lines.push("");
  for (const signal of internal) {
    lines.push(`- ${signal.neighborhood}: ${signal.label} (${signal.confidence_tier}, ${signal.confidence_score}).`);
  }
  lines.push("");
  lines.push("## Signals Blocked By Provenance Risk");
  lines.push("");
  for (const signal of blockedByProvenanceRisk.slice(0, 20)) {
    lines.push(`- ${signal.neighborhood}: ${signal.label}. ${signal.warnings.join(" ")}`);
  }
  lines.push("");
  lines.push("## Representative vs Raw Disagreements");
  lines.push("");
  if (!disagreements.length) {
    lines.push("- No major raw space-type signal disagreement was detected among scored durable signals.");
  } else {
    for (const signal of disagreements) {
      lines.push(`- ${signal.neighborhood}: ${signal.label} has raw support but is not clearly confirmed by representative-building/page signals.`);
    }
  }
  lines.push("");
  lines.push("## Recommended Public UI Approach");
  lines.push("");
  lines.push("- Do not automatically add new Atlanta public chips from this v2 layer yet.");
  lines.push("- Use public-safe signals as candidates for restrained copy only after editorial review.");
  lines.push("- Prefer broad, durable language such as \"office-oriented area\" or \"industrial/flex context\" when both raw lineage and representative pages agree.");
  lines.push("- Keep professional-services, financial-services, creative-office, transit, and freeway-access signals in editorial review until richer description evidence is available.");
  lines.push("- Keep land/development, rent, price, current availability, suite-level, furnished, plug-and-play, and move-in-ready language internal-only.");
  lines.push("");
  return lines.join("\n");
}

function main() {
  const lineage = JSON.parse(fs.readFileSync(LINEAGE_PATH, "utf8"));
  const diversity = JSON.parse(fs.readFileSync(DIVERSITY_PATH, "utf8"));
  const subset = JSON.parse(fs.readFileSync(RAW_SUBSET_PATH, "utf8"));
  const v1 = JSON.parse(fs.readFileSync(V1_SIGNALS_PATH, "utf8"));
  const rowsByNeighborhood = new Map();
  for (const object of lineage.objects || []) {
    const key = object.assigned_neighborhood || object.neighborhood || "Unassigned";
    if (!rowsByNeighborhood.has(key)) rowsByNeighborhood.set(key, []);
    rowsByNeighborhood.get(key).push(object);
  }

  const repByName = new Map();
  for (const [areaId, rep] of Object.entries(subset.published_representative_comparison || {})) {
    const area = (subset.area_summaries || []).find((summary) => summary.area_id === areaId);
    if (area) repByName.set(area.area_name, rep);
  }

  const v1ByName = new Map();
  for (const target of v1.targets || []) {
    if (target.city === "Atlanta") v1ByName.set(target.neighborhood_name, target.extracted_signals || []);
  }

  const neighborhoods = diversity.neighborhoods.map((metric) => {
    const rows = rowsByNeighborhood.get(metric.neighborhood) || [];
    const rep = repByName.get(metric.neighborhood) || null;
    const v1Signals = v1ByName.get(metric.neighborhood) || [];
    const scored = SIGNAL_DEFINITIONS.map((definition) =>
      scoreSignal({ definition, neighborhoodRows: rows, metric, rep })
    );
    for (const definition of REPRESENTATIVE_ONLY_SIGNALS) {
      const signal = scoreRepresentativeOnlySignal({ definition, metric, rep, v1Signals });
      if (signal) scored.push(signal);
    }

    return {
      neighborhood: metric.neighborhood,
      signal_review_summary: {
        public_safe: scored.filter((signal) => signal.public_use_status === "public_safe").length,
        review_needed: scored.filter((signal) => signal.public_use_status === "review_needed").length,
        internal_only: scored.filter((signal) => signal.public_use_status === "internal_only").length,
      },
      inputs: {
        lineage_rows: rows.length,
        unique_buildings: metric.unique_buildings,
        unique_companies: metric.unique_companies,
        unique_listing_contacts: metric.unique_listing_contacts,
        diversity_score: metric.diversity_score,
        concentration_score: metric.concentration_score,
        coworking_concentration: metric.coworking_concentration,
        top_ingestion_origin_concentration: metric.top_ingestion_origin_concentration,
        top_provenance_entity_concentration: metric.top_provenance_entity_concentration,
        warnings: metric.warnings,
      },
      signals: scored.sort((a, b) => b.confidence_score - a.confidence_score || a.signal_key.localeCompare(b.signal_key)),
    };
  });

  const output = {
    version: "atlanta-signal-confidence-v2",
    generated_at: new Date().toISOString(),
    source_files: [
      "data/peter/atlanta/lineage/atlanta_lineage_objects.json",
      "data/peter/atlanta/intelligence/neighborhood_diversity_metrics.json",
      "data/peter/research/atlanta_building_listing_subset_v1.json",
      "data/peter/research/neighborhood_intelligence_signals_v1.json",
    ],
    public_language_guardrails: [
      "Use historical/contextual phrasing only.",
      "Do not imply current availability, pricing, rent, suite-level status, or move-in condition.",
      "Do not promote source-biased signals without editorial review.",
      "Treat LMS as ingestion_origin, not a single external source.",
    ],
    neighborhoods,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  fs.writeFileSync(REPORT_PATH, `${buildReport(output)}\n`);

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Wrote ${REPORT_PATH}`);
  for (const neighborhood of neighborhoods) {
    console.log(`${neighborhood.neighborhood}: ${neighborhood.signal_review_summary.public_safe} public_safe, ${neighborhood.signal_review_summary.review_needed} review_needed, ${neighborhood.signal_review_summary.internal_only} internal_only`);
  }
}

main();
