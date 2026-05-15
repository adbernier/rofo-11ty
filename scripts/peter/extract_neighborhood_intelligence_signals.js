const fs = require("fs");
const path = require("path");

const root = process.cwd();
const outputPath = path.join(
  root,
  "data",
  "peter",
  "research",
  "neighborhood_intelligence_signals_v1.json"
);

const neighborhoodPages = require(path.join(root, "_data", "neighborhoodPages.js"));
const buildingPages = require(path.join(root, "_data", "buildingPages.js"));
const relationships = JSON.parse(
  fs.readFileSync(
    path.join(root, "data", "peter", "research", "commercial_area_building_relationships_v1.json"),
    "utf8"
  )
);

const semanticBridgePath = path.join(root, "data", "peter", "derived", "active_building_semantic_bridge.json");
const semanticBridge = fs.existsSync(semanticBridgePath)
  ? JSON.parse(fs.readFileSync(semanticBridgePath, "utf8"))
  : [];

const targetPaths = [
  "/commercial-real-estate/CA/san-francisco/financial-district/",
  "/commercial-real-estate/GA/atlanta/buckhead/",
  "/commercial-real-estate/CA/los-angeles/arts-district/",
  "/commercial-real-estate/TX/dallas/uptown/",
  "/commercial-real-estate/CA/san-diego/kearny-mesa/",
];

const relationshipRows = relationships.relationships || [];
const relationshipSummaries = new Map(
  (relationships.area_summaries || []).map((summary) => [summary.area_id, summary])
);
const buildingByPath = new Map(buildingPages.map((building) => [building.building_path, building]));
const semanticByPath = new Map(semanticBridge.map((record) => [record.building_path, record]));

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function addCount(map, key, increment = 1) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + increment);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function confidenceFrom(score) {
  if (score >= 0.78) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

function pct(count, total) {
  if (!total) return 0;
  return count / total;
}

function topEntries(map, limit = 5) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function labelSpaceType(value) {
  const labels = {
    office: "Office",
    retail: "Retail",
    industrial: "Industrial",
    flex: "Flex",
    coworking: "Coworking",
  };
  return labels[value] || value;
}

function addSignal(signals, signal) {
  if (!signal || signal.confidence === "low") return;
  const existing = signals.find((item) => item.key === signal.key);
  if (existing) {
    existing.evidence = unique([...existing.evidence, ...signal.evidence]).slice(0, 6);
    existing.score = Math.max(existing.score, signal.score);
    existing.confidence = confidenceFrom(existing.score);
    return;
  }
  signals.push({
    ...signal,
    confidence: confidenceFrom(signal.score),
    public_safe: true,
  });
}

function buildSignals(page, buildings, areaRelationships, summary) {
  const signals = [];
  const omitted = [];
  const spaceCounts = new Map();
  const sizeCounts = new Map();
  const fitCounts = new Map();
  const buildingTypeCounts = new Map();
  const profile = new Set((page.commercial_profile || []).map(normalize));
  const semanticLabels = new Set((page.approximate_semantic_signals || []).map(normalize));
  const relationshipReasons = areaRelationships.flatMap((row) => row.relationship_reason || []);
  const relationshipText = relationshipReasons.join(" ").toLowerCase();
  const semanticRecords = buildings
    .map((building) => semanticByPath.get(building.building_path))
    .filter((record) => record && record.match_method === "building_id");

  for (const type of page.approximate_space_types || []) {
    addCount(spaceCounts, normalize(type), 1);
  }

  for (const pattern of summary?.dominant_space_type_patterns || []) {
    addCount(spaceCounts, normalize(pattern.space_type), Math.min(Number(pattern.count || 0), 12));
  }

  for (const building of buildings) {
    const source = buildingByPath.get(building.building_path) || {};
    for (const type of source.space_types || []) addCount(spaceCounts, normalize(type), 2);
    const primaryType = normalize(source.primary_space_type || source.space_type || building.type).replace(/\s+space$/, "");
    addCount(spaceCounts, primaryType, 2);
    addCount(buildingTypeCounts, primaryType, 1);
    addCount(sizeCounts, source.size_label || building.size_label || "", 1);
    for (const fit of source.best_for || []) addCount(fitCounts, fit, 1);
  }

  for (const row of areaRelationships) {
    for (const mix of row.inferred_space_type_mix || []) {
      addCount(spaceCounts, normalize(mix.space_type), Math.min(Number(mix.count || 1), 8));
    }
  }

  const totalBuildings = buildings.length || 1;
  const officeShare = pct(spaceCounts.get("office") || 0, [...spaceCounts.values()].reduce((a, b) => a + b, 0));
  const retailShare = pct(spaceCounts.get("retail") || 0, [...spaceCounts.values()].reduce((a, b) => a + b, 0));
  const industrialShare = pct(spaceCounts.get("industrial") || 0, [...spaceCounts.values()].reduce((a, b) => a + b, 0));
  const officeBuildingShare = pct(buildingTypeCounts.get("office") || 0, totalBuildings);
  const retailBuildingShare = pct(buildingTypeCounts.get("retail") || 0, totalBuildings);
  const industrialBuildingShare = pct(buildingTypeCounts.get("industrial") || 0, totalBuildings);
  const highConfidenceRelationships = areaRelationships.filter((row) => row.confidence === "high").length;
  const relationshipSupport = highConfidenceRelationships ? Math.min(0.16, highConfidenceRelationships * 0.015) : 0;

  if (officeShare >= 0.45 || profile.has("office") || semanticLabels.has("office")) {
    addSignal(signals, {
      key: "office_oriented",
      label: "Office-oriented",
      category: "common_space_types",
      score: 0.6 + Math.min(0.16, officeShare * 0.2) + Math.min(0.12, officeBuildingShare * 0.12) + relationshipSupport,
      evidence: [
        `${labelSpaceType("office")} appears in representative building and area signals`,
        officeBuildingShare ? `${Math.round(officeBuildingShare * 100)}% of representative buildings are office-oriented` : "",
        highConfidenceRelationships ? `${highConfidenceRelationships} high-confidence building relationships` : "",
      ],
    });
  }

  if (retailShare >= 0.18 || profile.has("retail") || profile.has("neighborhood_retail") || semanticLabels.has("retail")) {
    addSignal(signals, {
      key: "retail_context",
      label: "Retail context",
      category: "common_space_types",
      score: 0.56 + Math.min(0.12, retailShare * 0.18) + Math.min(0.08, retailBuildingShare * 0.08) + relationshipSupport,
      evidence: ["Retail appears in area profile, space type mix, or representative building context"],
    });
  }

  if (industrialShare >= 0.28 || profile.has("industrial") || profile.has("warehouse") || semanticLabels.has("industrial")) {
    addSignal(signals, {
      key: "industrial_or_flex_context",
      label: "Industrial or flex context",
      category: "building_character",
      score: 0.62 + Math.min(0.16, industrialShare * 0.2) + Math.min(0.1, industrialBuildingShare * 0.1),
      evidence: ["Industrial, warehouse, or flex signals appear in representative building patterns"],
    });
  }

  if (profile.has("creative_office") || semanticLabels.has("creative office")) {
    addSignal(signals, {
      key: "creative_office",
      label: "Creative office",
      category: "tenant_fit",
      score: 0.78,
      evidence: ["Creative office appears in reviewed commercial profile signals"],
    });
  }

  if (profile.has("warehouse") || semanticLabels.has("warehouse")) {
    addSignal(signals, {
      key: "warehouse_context",
      label: "Warehouse context",
      category: "building_character",
      score: 0.72,
      evidence: ["Warehouse appears in reviewed commercial profile signals"],
    });
  }

  if (profile.has("professional_services") || semanticLabels.has("professional services")) {
    addSignal(signals, {
      key: "professional_services",
      label: "Professional services fit",
      category: "tenant_fit",
      score: 0.76,
      evidence: ["Professional services appears in reviewed commercial profile signals"],
    });
  }

  if (profile.has("financial_services") || semanticLabels.has("financial services")) {
    addSignal(signals, {
      key: "financial_services",
      label: "Financial services fit",
      category: "tenant_fit",
      score: 0.72,
      evidence: ["Financial services appears in reviewed commercial profile signals"],
    });
  }

  if (profile.has("downtown") || page.commercial_area_type === "downtown_core") {
    addSignal(signals, {
      key: "downtown_core",
      label: "Downtown core",
      category: "commercial_clustering",
      score: 0.82,
      evidence: ["Area is classified as a downtown core or carries a downtown signal"],
    });
  }

  if (profile.has("transit_oriented") || semanticLabels.has("transit-oriented")) {
    addSignal(signals, {
      key: "transit_oriented",
      label: "Transit-oriented",
      category: "access_orientation",
      score: 0.74,
      evidence: ["Transit-oriented appears in reviewed commercial profile signals"],
    });
  }

  if (profile.has("freeway_access") || semanticLabels.has("freeway access") || relationshipText.includes("freeway")) {
    addSignal(signals, {
      key: "freeway_access",
      label: "Freeway access context",
      category: "access_orientation",
      score: 0.78,
      evidence: ["Freeway access appears in reviewed commercial profile or relationship signals"],
    });
  }

  if (profile.has("suburban_office") || semanticLabels.has("suburban office")) {
    addSignal(signals, {
      key: "suburban_office",
      label: "Suburban office pattern",
      category: "building_character",
      score: 0.74,
      evidence: ["Suburban office appears in reviewed commercial profile signals"],
    });
  }

  const sizeLabels = topEntries(sizeCounts, 4).map((entry) => entry.key).filter(Boolean);
  if (sizeLabels.some((label) => /large/i.test(label))) {
    addSignal(signals, {
      key: "large_format_spaces",
      label: "Large-format building signals",
      category: "building_scale",
      score: 0.62,
      evidence: ["Representative buildings include large-format size labels"],
    });
  }
  if (sizeLabels.some((label) => /mid/i.test(label))) {
    addSignal(signals, {
      key: "mid_size_spaces",
      label: "Mid-size building signals",
      category: "building_scale",
      score: 0.62,
      evidence: ["Representative buildings include mid-size space labels"],
    });
  }

  for (const record of semanticRecords) {
    for (const signal of record.approved_signal_labels || []) {
      addSignal(signals, {
        key: `semantic_${normalize(signal).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`,
        label: signal,
        category: "building_semantics",
        score: Math.min(0.84, Number(record.average_confidence || 0.6) + 0.08),
        evidence: [`Approved building semantic bridge signal on ${record.address}`],
      });
    }
  }

  const noisyCandidates = [
    "current availability",
    "asking rent",
    "suite-level claims",
    "furnished",
    "plug-and-play",
    "move-in ready",
    "current parking",
  ];
  for (const item of noisyCandidates) {
    omitted.push({
      signal: item,
      reason: "Transient, listing-level, pricing, or current-condition language is not public-safe for neighborhood identity.",
    });
  }

  return {
    extracted_signals: signals
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
      .map((signal) => ({
        key: signal.key,
        label: signal.label,
        category: signal.category,
        confidence: signal.confidence,
        score: Number(signal.score.toFixed(2)),
        public_safe: signal.public_safe,
        evidence: signal.evidence.filter(Boolean).slice(0, 5),
      })),
    omitted_signals: omitted,
    evidence_summary: {
      representative_building_count: buildings.length,
      relationship_count: areaRelationships.length,
      high_confidence_relationship_count: highConfidenceRelationships,
      top_space_type_counts: topEntries(spaceCounts),
      top_size_labels: topEntries(sizeCounts),
      top_user_fit_terms: topEntries(fitCounts),
      approved_semantic_bridge_records: semanticRecords.length,
    },
  };
}

function publicSignalChips(signals) {
  const preferred = [
    "downtown_core",
    "office_oriented",
    "professional_services",
    "financial_services",
    "creative_office",
    "warehouse_context",
    "industrial_or_flex_context",
    "suburban_office",
    "freeway_access",
    "transit_oriented",
    "retail_context",
    "large_format_spaces",
    "mid_size_spaces",
  ];
  const byKey = new Map(signals.map((signal) => [signal.key, signal]));

  return preferred
    .map((key) => byKey.get(key))
    .filter((signal) => signal && signal.confidence === "high")
    .slice(0, 5)
    .map((signal) => ({
      key: signal.key,
      label: signal.label,
      confidence: signal.confidence,
    }));
}

const targets = targetPaths.map((canonicalPath) => {
  const page = neighborhoodPages.find((candidate) => candidate.canonical_neighborhood_path === canonicalPath);
  if (!page) {
    throw new Error(`Missing neighborhood page for ${canonicalPath}`);
  }

  const buildings = (page.representative_buildings || [])
    .map((building) => ({
      ...building,
      ...(buildingByPath.get(building.building_path) || {}),
      display_name: building.display_name || building.address,
    }))
    .filter((building) => building.building_path);
  const areaRelationships = relationshipRows.filter((row) => row.primary_area_id === page.commercial_area_id);
  const summary = relationshipSummaries.get(page.commercial_area_id);
  const extraction = buildSignals(page, buildings, areaRelationships, summary);

  return {
    canonical_path: page.canonical_neighborhood_path,
    neighborhood_name: page.name,
    city: page.city,
    state_abbr: page.state_abbr,
    commercial_area_id: page.commercial_area_id,
    commercial_area_type: page.commercial_area_type,
    extraction_status: "prototype_review",
    source_inputs: [
      "neighborhoodPages",
      "buildingPages",
      "commercial_area_building_relationships_v1",
      "active_building_semantic_bridge where available",
    ],
    ...extraction,
    public_signal_chips: publicSignalChips(extraction.extracted_signals),
  };
});

const output = {
  version: "v1",
  generated_at: new Date().toISOString(),
  scope: "Five reviewed Neighborhood Intelligence prototype pages only.",
  methodology: [
    "Use representative buildings already attached to each neighborhood page.",
    "Use high-confidence commercial area relationships where available.",
    "Use reviewed page-level commercial profiles and space-type signals.",
    "Use approved building semantic bridge signals only when matched to representative buildings.",
    "Suppress transient listing claims, price language, availability language, and suite-level assertions.",
  ],
  confidence_model: {
    high: "Multiple support signals or reviewed commercial profile plus strong representative building pattern.",
    medium: "Useful but less complete support, usually from one reviewed profile or smaller building sample.",
    low: "Omitted from public output.",
  },
  targets,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
console.log(`Neighborhoods processed: ${targets.length}`);
for (const target of targets) {
  console.log(
    `${target.neighborhood_name}, ${target.city}: ${target.extracted_signals.length} signals, ${target.public_signal_chips.length} public chips`
  );
}
