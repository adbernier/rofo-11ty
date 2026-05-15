const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const INPUT_PATH = path.join(ROOT, "data/peter/atlanta/intelligence/neighborhood_signal_confidence_v2.json");
const OUTPUT_PATH = path.join(ROOT, "data/peter/atlanta/reviews/atlanta_signal_editorial_review.json");
const REPORT_PATH = path.join(ROOT, "data/peter/atlanta/reports/atlanta_editorial_signal_review.md");

const COPY = {
  "Buckhead:office_oriented": {
    label: "Office-oriented district",
    copy: "Buckhead is primarily an office-oriented commercial district with a strong concentration of professional and business services.",
  },
  "Buckhead:professional_services": {
    label: "Professional services context",
    copy: "Buckhead has historical signals associated with professional services and business-oriented office use.",
  },
  "Buckhead:financial_services": {
    label: "Financial services context",
    copy: "Buckhead has historical signals related to finance-oriented office activity within Atlanta’s north-side business market.",
  },
  "Downtown Atlanta:office_oriented": {
    label: "Office-oriented downtown core",
    copy: "Downtown Atlanta is an office-oriented commercial district with civic, professional, and business-service activity near the city core.",
  },
  "Downtown Atlanta:retail_context": {
    label: "Office and retail mix",
    copy: "Downtown Atlanta includes office activity alongside street-level retail and service uses.",
  },
  "Downtown Atlanta:professional_services": {
    label: "Professional services context",
    copy: "Downtown Atlanta has reviewed signals for professional services uses within the city’s central commercial core.",
  },
  "Downtown Atlanta:transit_oriented": {
    label: "Transit-connected district",
    copy: "Downtown Atlanta is one of the city’s more transit-connected commercial areas.",
  },
  "Midtown:office_oriented": {
    label: "Office and mixed-use district",
    copy: "Midtown is an office-oriented Atlanta district with a mix of business, retail, and mixed-use commercial activity.",
  },
  "Midtown:retail_context": {
    label: "Retail and service context",
    copy: "Midtown includes retail and service uses that support the area’s office and mixed-use environment.",
  },
  "Midtown:creative_office": {
    label: "Creative office context",
    copy: "Midtown has reviewed signals for creative office and mixed-use commercial space.",
  },
  "Midtown:transit_oriented": {
    label: "Transit-connected district",
    copy: "Midtown has reviewed signals for transit-connected commercial activity within Atlanta.",
  },
  "Perimeter Center:office_oriented": {
    label: "Suburban office node",
    copy: "Perimeter Center functions as one of Atlanta’s major suburban office nodes, with strong freeway access and a concentration of larger business properties.",
  },
  "Perimeter Center:freeway_access": {
    label: "Freeway-oriented business district",
    copy: "Perimeter Center is closely tied to Atlanta’s north-side freeway network and suburban office market.",
  },
  "West Midtown:industrial_flex_context": {
    label: "Industrial and flex context",
    copy: "West Midtown shows a mix of industrial, flex, showroom, and office-oriented commercial space.",
  },
  "West Midtown:office_oriented": {
    label: "Office and industrial mix",
    copy: "West Midtown combines office-oriented commercial uses with industrial and flex space.",
  },
  "West Midtown:creative_office": {
    label: "Creative commercial context",
    copy: "West Midtown has reviewed signals for creative office and adaptive commercial uses.",
  },
  "West Midtown:showroom": {
    label: "Showroom context",
    copy: "West Midtown has reviewed signals for showroom-oriented commercial activity.",
  },
};

function pct(value) {
  return `${value}%`;
}

function copyFor(neighborhood, signal) {
  const explicit = COPY[`${neighborhood}:${signal.signal_key}`];
  if (explicit) return explicit;
  return {
    label: signal.label,
    copy: `${neighborhood} has reviewed historical signals for ${signal.label.toLowerCase()}.`,
  };
}

function evidenceSummary(signal) {
  const counts = signal.supporting_counts || {};
  const parts = [];

  if (counts.lineage_rows > 0) {
    parts.push(`${counts.lineage_rows} lineage rows`);
    parts.push(`${counts.unique_buildings || 0} supporting buildings`);
    parts.push(`${counts.unique_listing_contacts || 0} listing contacts`);
    parts.push(`${counts.unique_companies || 0} originating companies`);
  } else {
    parts.push("Supported by reviewed representative-building/page signals rather than broad raw lineage rows");
  }

  if (counts.representative_agreement) {
    parts.push("representative-building/page signals agree");
  }

  if (counts.diversity_score !== undefined) {
    parts.push(`neighborhood diversity score ${counts.diversity_score}`);
  }

  if (counts.known_provenance_entity_coverage !== undefined) {
    parts.push(`true provenance coverage ${pct(counts.known_provenance_entity_coverage)}`);
  }

  return parts.join("; ");
}

function recommendedAction(signal) {
  const counts = signal.supporting_counts || {};
  const warnings = signal.warnings || [];
  const representativeOnly = (counts.lineage_rows || 0) === 0;
  const lowCompanySupport = (counts.unique_companies || 0) > 0 && (counts.unique_companies || 0) < 5;
  const thinCoverage = warnings.some((warning) => /coverage is thin/i.test(warning));

  if (signal.confidence_score >= 85 && !representativeOnly && !lowCompanySupport && !thinCoverage) {
    return "approve";
  }

  if (signal.confidence_score >= 80 && !representativeOnly && !lowCompanySupport) {
    return "revise";
  }

  if (signal.confidence_score >= 70 && !representativeOnly) {
    return "revise";
  }

  return "hold";
}

function reviewNotes(signal, action) {
  const notes = [];
  const counts = signal.supporting_counts || {};

  if (action === "approve") {
    notes.push("Strong candidate for public wording after final human read.");
  } else if (action === "revise") {
    notes.push("Useful signal, but public wording should remain broad and avoid overclaiming.");
  } else {
    notes.push("Hold for now unless an editor can confirm with additional source evidence.");
  }

  if ((counts.lineage_rows || 0) === 0) {
    notes.push("Needs raw description or broader lineage support before public use.");
  }
  if ((counts.unique_companies || 0) > 0 && counts.unique_companies < 5) {
    notes.push("Originating-company support is narrow.");
  }
  if ((signal.warnings || []).some((warning) => /coverage is thin/i.test(warning))) {
    notes.push("True provenance coverage is thin.");
  }

  return notes;
}

function buildReviews(input) {
  const reviews = [];

  for (const neighborhood of input.neighborhoods || []) {
    for (const signal of neighborhood.signals || []) {
      if (signal.public_use_status !== "review_needed") continue;
      const proposed = copyFor(neighborhood.neighborhood, signal);
      const action = recommendedAction(signal);
      reviews.push({
        neighborhood: neighborhood.neighborhood,
        signal_key: signal.signal_key,
        confidence_score: signal.confidence_score,
        confidence_tier: signal.confidence_tier,
        internal_status: signal.public_use_status,
        proposed_public_label: proposed.label,
        proposed_public_copy: proposed.copy,
        evidence_summary: evidenceSummary(signal),
        cautions: signal.warnings || [],
        recommended_action: action,
        editorial_review_notes: reviewNotes(signal, action),
        editorial_status: "pending_review",
      });
    }
  }

  return reviews.sort((a, b) => b.confidence_score - a.confidence_score || a.neighborhood.localeCompare(b.neighborhood));
}

function actionSummary(reviews) {
  return reviews.reduce(
    (summary, review) => {
      summary[review.recommended_action] = (summary[review.recommended_action] || 0) + 1;
      return summary;
    },
    { approve: 0, revise: 0, hold: 0 }
  );
}

function buildReport(output) {
  const lines = [];
  const summary = actionSummary(output.reviews);

  lines.push("# Atlanta Editorial Signal Review");
  lines.push("");
  lines.push(`Date: ${new Date().toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push("## Purpose");
  lines.push("");
  lines.push("This report creates a human editorial approval layer between internal Atlanta signal confidence and any future public neighborhood UI.");
  lines.push("");
  lines.push("LMS is treated as Rofo's internal ingestion system. The review below focuses on true provenance support, building/contact breadth, representative agreement, and restrained public wording.");
  lines.push("");
  lines.push("No public templates or UI are wired to this file.");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Review candidates created: ${output.reviews.length}`);
  lines.push(`- Recommended approve: ${summary.approve}`);
  lines.push(`- Recommended revise: ${summary.revise}`);
  lines.push(`- Recommended hold: ${summary.hold}`);
  lines.push("");
  lines.push("## Candidate Review");
  lines.push("");

  for (const review of output.reviews) {
    lines.push(`### ${review.neighborhood}: ${review.proposed_public_label}`);
    lines.push("");
    lines.push(`- Signal key: \`${review.signal_key}\``);
    lines.push(`- Internal status: \`${review.internal_status}\``);
    lines.push(`- Confidence: ${review.confidence_score} (${review.confidence_tier})`);
    lines.push(`- Recommended action: ${review.recommended_action}`);
    lines.push(`- Suggested public wording: ${review.proposed_public_copy}`);
    lines.push(`- Why it appears credible: ${review.evidence_summary}`);
    lines.push(`- Needs human review: ${review.editorial_review_notes.join(" ")}`);
    if (review.cautions.length) {
      lines.push(`- Cautions: ${review.cautions.join(" ")}`);
    } else {
      lines.push("- Cautions: none from the confidence model.");
    }
    lines.push("");
  }

  lines.push("## Recommended Public UI Approach");
  lines.push("");
  lines.push("- Treat this JSON as an editorial queue, not a public data source.");
  lines.push("- Only approved or revised-and-approved rows should later be eligible for neighborhood page UI.");
  lines.push("- Keep wording non-statistical and historically/contextually framed.");
  lines.push("- Do not surface rent, pricing, current availability, suite-level, move-in-ready, or feed-source language.");
  lines.push("- Prioritize broad area character signals first: office-oriented, industrial/flex mix, suburban office node.");
  lines.push("");

  return lines.join("\n");
}

function main() {
  const input = JSON.parse(fs.readFileSync(INPUT_PATH, "utf8"));
  const reviews = buildReviews(input);
  const output = {
    version: "atlanta-signal-editorial-review-v1",
    generated_at: new Date().toISOString(),
    source_file: "data/peter/atlanta/intelligence/neighborhood_signal_confidence_v2.json",
    editorial_status_default: "pending_review",
    public_use_guardrails: [
      "Do not wire pending review rows to public UI.",
      "Use restrained, non-statistical language.",
      "Do not imply live availability, pricing, rent, suite-level detail, or current condition.",
      "LMS is an ingestion origin, not a single external source.",
    ],
    summary: actionSummary(reviews),
    reviews,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  fs.writeFileSync(REPORT_PATH, `${buildReport(output)}\n`);

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Wrote ${REPORT_PATH}`);
  console.log(`Review candidates: ${reviews.length}`);
  console.log(`Recommended actions: approve ${output.summary.approve}, revise ${output.summary.revise}, hold ${output.summary.hold}`);
}

main();
