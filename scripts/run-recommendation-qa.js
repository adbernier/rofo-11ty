const fs = require("fs");
const path = require("path");
const graph = require("../_data/locationKnowledgeGraph");
const profiles = require("../_data/recommendationProfiles");
const { resolveMarketPath } = require("../js/recommendation-resolver");

const root = path.join(__dirname, "..");
const qaSuites = [
  {
    key: "sacramento",
    metro: "Sacramento",
    scenarioPath: path.join(root, "data/recommendation-qa/sacramento-scenarios.json"),
    reportPath: path.join(root, "docs/recommendation-qa/sacramento-pilot.md"),
  },
  {
    key: "san-diego",
    metro: "San Diego",
    scenarioPath: path.join(root, "data/recommendation-qa/san-diego-scenarios.json"),
    reportPath: path.join(root, "docs/recommendation-qa/san-diego-pilot.md"),
  },
  {
    key: "orange-county",
    metro: "Orange County",
    scenarioPath: path.join(root, "data/recommendation-qa/orange-county-scenarios.json"),
    reportPath: path.join(root, "docs/recommendation-qa/orange-county-pilot.md"),
  },
  {
    key: "denver",
    metro: "Denver",
    scenarioPath: path.join(root, "data/recommendation-qa/denver-scenarios.json"),
    reportPath: path.join(root, "docs/recommendation-qa/denver-pilot.md"),
  },
];

const editorialReviews = {
  "san-diego": {
    findings: [
      "Primary recommendations are commercially believable across downtown office, medical, executive office, life science/R&D, showroom/flex, warehouse, manufacturing, suburban headquarters, and North County professional-service scenarios.",
      "Secondary recommendations are sensible after calibration. The North County professional-services scenario now keeps Rancho Bernardo ahead of Downtown San Diego as the more direct North County comparison.",
      "Recommendation reasoning is differentiated enough for a first Compass Ready release: office, medical, industrial, warehouse, life-science, showroom, and North County profiles no longer read like the same generic market path.",
      "Representative buildings are sufficient to illustrate the seeded districts using existing Rofo building paths, while deeper broker-reviewed building curation remains a follow-on enhancement.",
    ],
    calibrations: [
      "Added explicit Miramar showroom/service-commercial fit so contractor and showroom scenarios describe Miramar as a real operating alternative rather than falling back to conventional office language.",
      "Strengthened Rancho Bernardo's North County professional-service signal so city-level recommendations understand when a profile is asking for a North County business-park path.",
      "Improved resolver explainability so graph-backed text matches surface as matched priorities, including terms such as life science, R&D, showroom, logistics, border access, North County, and I-15 access.",
      "Increased exact graph-text priority relevance so geography-specific requirements can outrank generic office prestige when the Knowledge Graph supports that direction.",
    ],
    beforeAfter: [
      "Primary recommendations: unchanged across all 10 San Diego scenarios.",
      "Secondary recommendations: North County Professional Services changed from Downtown San Diego to Rancho Bernardo.",
      "Fit language: Miramar now appears as a strong showroom alternative in the contractor/showroom scenario.",
      "Explanation quality: improved matched-priority coverage across life science/R&D, showroom/service, logistics/border, manufacturing, suburban HQ, and North County profiles.",
    ],
    remaining: [
      "Retail and medical-office corridors should deepen after real user demand and broker review identify priority use cases.",
      "Second-pass nodes such as Little Italy / Columbia, East Village, Del Mar Heights / Carmel Valley, Chula Vista, San Marcos, Escondido, and Torrey Pines / La Jolla should be added only when they improve recommendation quality.",
      "Representative buildings should continue moving from illustrative seed coverage toward richer broker-reviewed examples.",
    ],
    readiness: "San Diego is recommended as Compass Ready for V1 Location Briefs. It should remain under enhancement for representative-building depth and second-pass retail/medical coverage, but no blocking editorial concerns remain after this calibration.",
  },
  "orange-county": {
    findings: [
      "Primary recommendations are broker-plausible across the 12 Orange County pilot scenarios after calibration. The QA set now separates technology HQ, research/R&D, airport-access professional office, coastal executive office, central OC client-facing office, medical, warehouse/flex, contractor, South OC flex/R&D support, and broad office searches.",
      "The clearest submarket distinctions are now visible: Irvine Spectrum is the technology/growth/R&D image path, Irvine Business Complex is the airport-access professional office path, University Research Park is the UC Irvine/research-adjacent path, South Coast Metro is the central OC office-retail/client-facing path, Newport Center is the coastal executive/client image path, and Tustin Legacy is the modern Irvine-edge medical/professional path.",
      "Recommendation diversity remains strong enough for an Enhancing metro: 12 scenarios produce 9 unique primary recommendations, with repeated primaries occurring only where the business profiles are commercially similar.",
      "The pilot continues to avoid treating John Wayne Airport Area as a standalone first-pass node. Airport access is expressed as a decision reason inside Irvine Business Complex, South Coast Metro, and Newport Center.",
      "Representative buildings reinforce Irvine Spectrum, Irvine Business Complex, South Coast Metro, Newport Center, Anaheim Canyon, Lake Forest Business Park, and South OC Medical & Professional. Tustin Legacy and Fullerton remain weaker because existing Rofo data does not yet provide enough verified district-specific building paths.",
    ],
    calibrations: [
      "Strengthened South Coast Metro's office fit from a generic strong professional-office node into an excellent central OC office-retail/client-facing node, so central OC finance/legal/amenity-driven searches do not drift to Newport by default.",
      "Sharpened Newport Center's role as a coastal executive, wealth management, legal, finance, and Newport client-proximity node, with tradeoffs around cost and countywide commute neutrality.",
      "Strengthened Irvine Spectrum and University Research Park wording for R&D, innovation, technical office, recruitment, amenities, and growth so R&D scenarios compare URP with Spectrum instead of drifting toward Irvine Business Complex.",
      "Clarified Irvine Business Complex as an airport-access professional office node with Von Karman/MacArthur office-core logic rather than a general-purpose Irvine recommendation for every office profile.",
      "Removed misleading 'coastal' keyword matches from non-Newport tradeoffs. Those tradeoffs now refer to Newport Beach executive image, which preserves the distinction without making non-coastal nodes score as coastal matches.",
      "Reviewed representative buildings for Tustin Legacy, Fullerton, and Lake Forest Business Park. No fabricated buildings were added; Tustin Legacy and Fullerton remain documented depth gaps because available resolved paths are limited or not district-specific enough.",
    ],
    beforeAfter: [
      "Before K1.1, the South Coast Metro client-facing office scenario was directionally passing but Newport/South Coast differentiation was not sharp enough.",
      "After K1.1, South Coast Metro leads central OC client-facing professional-office scenarios, while Newport Center leads coastal executive wealth-management/legal scenarios.",
      "Before K1.1, the University Research Park R&D scenario used Irvine Business Complex as the secondary comparison.",
      "After K1.1, University Research Park compares against Irvine Spectrum first, which is more commercially plausible for R&D/innovation users.",
      "No Sacramento or San Diego recommendation regressions were introduced; both suites continue passing baseline QA.",
    ],
    remaining: [
      "Representative-building depth is the main readiness blocker. Tustin Legacy needs verified district-specific building examples, and Fullerton needs resolved building paths rather than only generic representative cards.",
      "A human Orange County broker should still validate whether South Coast Metro versus Newport Center and Irvine Business Complex versus Irvine Spectrum read correctly for real tenant profiles.",
      "Second-pass nodes such as Costa Mesa, Downtown Santa Ana, Brea, Huntington Beach, Foothill Ranch, Anaheim Platinum Triangle, Orange, Buena Park, and Garden Grove should be added only after specific recommendation gaps justify them.",
      "Retail and medical-office coverage should be calibrated with real Location Brief demand before marking Orange County Compass Ready.",
    ],
    readiness: "Orange County should remain Enhancing after K1.1. Recommendations are now more differentiated and advisor-quality, and QA passes without Sacramento or San Diego regressions. The blocker is representative-building sufficiency, especially for Tustin Legacy and Fullerton, plus one more broker review pass against real Orange County tenant profiles before Compass Ready.",
  },
  denver: {
    findings: [
      "Denver scenarios produce differentiated primary recommendations across central office, creative/startup, client-facing executive office, southeast suburban office, Boulder/US-36 technology, northeast industrial, airport logistics, medical, west metro, and Boulder-adjacent flex/R&D profiles.",
      "The first Denver graph intentionally models the metro as several distinct commercial decision systems: central Denver, southeast office, Boulder/US-36 technology, east/northeast industrial, west metro local-service, and south metro medical/professional.",
      "Representative buildings are attached only where existing Rofo building paths support them. They illustrate district character and do not imply active availability.",
      "Second-pass geographies such as Glendale, Arvada, Thornton, Northglenn, Longmont, Baker, Five Points, and Santa Fe Arts District were not promoted because the first Compass seed favors recommendation value over page count.",
    ],
    calibrations: [
      "Added a city-level Denver market path so broad metro searches can route into office, medical, flex/R&D, industrial, warehouse, and distribution-specific district choices.",
      "Separated Downtown Denver, LoDo, RiNo, and Cherry Creek so central-office recommendations can distinguish formal civic/legal office, downtown-edge creative office, adaptive creative/showroom uses, and polished client-facing office.",
      "Separated DTC, Inverness, Centennial, and Lone Tree so southeast searches can distinguish corporate office scale, campus-style business parks, practical office/flex/medical, and south I-25 patient/customer geography.",
      "Separated Boulder, Broomfield, Interlocken, and Louisville/Superior so technology and R&D users can compare Boulder identity against practical US-36 business-park alternatives.",
      "Separated Northeast Denver Industrial, Denver Airport/Pena corridor, Commerce City, and Aurora so warehouse, distribution, last-mile, service-industrial, and east metro medical/office scenarios do not collapse into a single industrial answer.",
    ],
    beforeAfter: [
      "Before Q1, Denver had public page coverage and building examples but no Compass Knowledge Graph nodes.",
      "After Q1, Denver has 21 graph-backed nodes, city-level market paths, comparison relationships, representative buildings from existing Rofo paths, and 12 QA scenarios.",
      "Recommendation diversity now spans central office, creative office, executive client-facing office, southeast suburban office, Boulder/US-36 technology, industrial/logistics, medical, west metro, and flex/R&D paths.",
    ],
    remaining: [
      "Broker review should continue validating Denver-specific nuance, especially Aurora medical, Denver Airport/Pena logistics, Boulder versus US-36 technology alternatives, and south metro medical/professional distinctions.",
      "Representative-building coverage should deepen using existing reliable Rofo building paths, especially for Central Park, Commerce City, Westminster, Golden, and Louisville/Superior.",
      "Second-pass Knowledge Cards should be added only when real Location Brief demand exposes gaps, not simply because public pages exist.",
    ],
    readiness: "Denver is recommended as Compass Ready for V1 Location Briefs after Q1. The graph supports differentiated, explainable, graph-backed recommendations across realistic business profiles. Editorial maturity and representative-building depth should continue improving as separate enhancement workstreams.",
  },
};

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function list(items) {
  if (!items || !items.length) return "- None";
  return items.map((item) => `- ${item}`).join("\n");
}

function scenarioResult(scenario) {
  const state = resolveMarketPath(scenario.profile, graph, profiles);
  const pathItems = state.recommendedPath || [];
  const primary = state.primaryRecommendation || pathItems[0] || null;
  const secondary = pathItems[1] || (state.compareWith && state.compareWith[0]) || null;
  const recommendationSlugs = pathItems.map((item) => item.slug);
  const expectedHits = (scenario.expectedSlugs || []).filter((slug) => recommendationSlugs.includes(slug));
  const tradeoffs = unique(pathItems.flatMap((item) => item.tradeoffs || []));
  const questions = unique(state.questionsToValidate || (primary && primary.questionsToValidate) || []);
  const strengths = unique(pathItems.flatMap((item) => item.strengths || []));
  const explanationPass = Boolean(
    primary &&
    primary.selectionRationale &&
    primary.tradeoffSummary &&
    Array.isArray(primary.validationFocus) &&
    primary.validationFocus.length &&
    secondary &&
    secondary.alternativeRationale
  );

  return {
    scenario,
    state,
    primary,
    secondary,
    recommendationSlugs,
    expectedHits,
    strengths,
    tradeoffs,
    questions,
    explanationPass,
    pass: Boolean(primary) && expectedHits.length > 0 && tradeoffs.length > 0 && questions.length > 0 && explanationPass,
  };
}

function diversitySummary(results) {
  const primaryCounts = results.reduce((counts, result) => {
    const key = result.primary ? result.primary.slug : "none";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const uniquePrimaryCount = Object.keys(primaryCounts).length;
  const repeated = Object.entries(primaryCounts)
    .filter(([, count]) => count > 1)
    .map(([slug, count]) => `${slug} (${count})`);
  return { uniquePrimaryCount, repeated };
}

function reportTitle(metro) {
  return `# ${metro} Recommendation QA Pilot`;
}

function generateSuiteReport(suite) {
  const scenarios = JSON.parse(fs.readFileSync(suite.scenarioPath, "utf8"));
  const results = scenarios.map(scenarioResult);
  const diversity = diversitySummary(results);
  const generatedAt = new Date().toISOString();
  const failures = results.filter((result) => !result.pass);

  const lines = [
    reportTitle(suite.metro),
    "",
    `Generated: ${generatedAt}`,
    "",
    `This internal QA report validates whether ${suite.metro} Location Brief recommendations feel differentiated, explainable, defensible, and actionable using the current Commercial Location Knowledge Graph. It is not customer-facing content.`,
    "",
    "## Summary",
    "",
    `- Scenarios reviewed: ${results.length}`,
    `- Scenarios passing baseline advisor-readiness checks: ${results.length - failures.length}`,
    `- Scenarios needing review: ${failures.length}`,
    `- Unique primary recommendations: ${diversity.uniquePrimaryCount}`,
    `- Repeated primary recommendations: ${diversity.repeated.length ? diversity.repeated.join(", ") : "None"}`,
    "",
    "Baseline checks require a primary recommendation, at least one expected directional match, meaningful tradeoffs, validation questions, and complete explainability fields. A pass does not mean the recommendation is final; it means the brief is credible enough for advisor review.",
    "",
    "## Recommendation Diversity Check",
    "",
    diversity.uniquePrimaryCount >= 4
      ? `The ${suite.metro} pilot produces meaningfully different primary recommendations across the QA scenarios.`
      : `The ${suite.metro} pilot may still over-converge on too few primary recommendations and should be reviewed before marking final readiness.`,
    "",
  ];

  const editorialReview = editorialReviews[suite.key];
  if (editorialReview) {
    lines.push("## Editorial Broker Review");
    lines.push("");
    lines.push("Editorial findings:");
    lines.push(list(editorialReview.findings));
    lines.push("");
    lines.push("Calibration changes:");
    lines.push(list(editorialReview.calibrations));
    lines.push("");
    lines.push("QA comparison before vs after:");
    lines.push(list(editorialReview.beforeAfter));
    lines.push("");
    lines.push("Remaining weaknesses:");
    lines.push(list(editorialReview.remaining));
    lines.push("");
    lines.push("Compass readiness recommendation:");
    lines.push(list([editorialReview.readiness]));
    lines.push("");
  }

  lines.push("## Scenario Reviews");
  lines.push("");

  results.forEach((result) => {
    const { scenario, state, primary, secondary } = result;
    const firstLocation = scenario.profile.locations && scenario.profile.locations[0];
    lines.push(`### ${scenario.name}`);
    lines.push("");
    lines.push(`- Profile: ${scenario.profile.size} ${scenario.profile.spaceType} in ${firstLocation ? firstLocation.label : suite.metro}`);
    lines.push(`- Priorities: ${scenario.profile.priorities.join(", ")}`);
    lines.push(`- Expected direction: ${scenario.expectedDirection}`);
    lines.push(`- Top recommendation: ${primary ? `${primary.label} (${primary.fitLabel})` : "None"}`);
    lines.push(`- Secondary recommendation: ${secondary ? secondary.label : "None"}`);
    lines.push(`- Confidence: ${state.confidenceLabel || "Unknown"}`);
    lines.push(`- Baseline QA result: ${result.pass ? "Pass" : "Needs review"}`);
    lines.push(`- Explanation quality: ${result.explanationPass ? "Pass" : "Needs review"}`);
    lines.push("");
    lines.push("Recommended market path:");
    lines.push(list((state.recommendedPath || []).map((item, index) => `${index + 1}. ${item.label} - ${item.fitLabel}: ${item.summary}`)));
    lines.push("");
    lines.push("Why this differs:");
    lines.push(result.expectedHits.length
      ? `- Matches expected directional nodes: ${result.expectedHits.join(", ")}`
      : "- Does not include an expected directional node; review graph fit, priority rules, or market path candidates.");
    lines.push("");
    lines.push("Selection rationale:");
    lines.push(list(primary && primary.selectionRationale ? [primary.selectionRationale] : []));
    lines.push("");
    lines.push("Matched priorities:");
    lines.push(list(primary && primary.matchedPriorities ? primary.matchedPriorities : []));
    lines.push("");
    lines.push("Tradeoff summary:");
    lines.push(list(primary && primary.tradeoffSummary ? [primary.tradeoffSummary] : []));
    lines.push("");
    lines.push("Alternative rationale:");
    lines.push(list(secondary && secondary.alternativeRationale ? [secondary.alternativeRationale] : []));
    lines.push("");
    lines.push("Validation focus:");
    lines.push(list(primary && primary.validationFocus ? primary.validationFocus : []));
    lines.push("");
    lines.push("Strengths surfaced:");
    lines.push(list(result.strengths.slice(0, 6)));
    lines.push("");
    lines.push("Tradeoffs surfaced:");
    lines.push(list(result.tradeoffs.slice(0, 6)));
    lines.push("");
    lines.push("Questions to validate:");
    lines.push(list(result.questions.slice(0, 5)));
    lines.push("");
    lines.push("Graph weaknesses exposed:");
    if (result.pass) {
      lines.push("- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.");
    } else {
      lines.push("- Recommendation direction needs manual review before this metro is treated as fully QA-complete.");
    }
    lines.push("");
  });

  lines.push("## Rofo Compass Coverage Preparation");
  lines.push("");
  lines.push("Future Rofo Compass Coverage dashboards can track metro QA with these fields:");
  lines.push("");
  lines.push("- qaStatus: pending | in_review | completed | needs_review");
  lines.push("- lastQaDate");
  lines.push("- scenarioCount");
  lines.push("- scenariosPassing");
  lines.push("- validationStatus");
  lines.push("- reportPath");
  lines.push("");
  lines.push(`${suite.metro} pilot metadata is stored in \`_data/recommendationQaStatus.js\`.`);
  lines.push("");

  fs.mkdirSync(path.dirname(suite.reportPath), { recursive: true });
  fs.writeFileSync(suite.reportPath, `${lines.join("\n")}\n`);

  return { suite, results, failures, diversity };
}

const outputs = qaSuites.map(generateSuiteReport);

outputs.forEach(({ suite, results, failures, diversity }) => {
  console.log(`${suite.metro} recommendation QA scenarios: ${results.length}`);
  console.log(`${suite.metro} passing baseline checks: ${results.length - failures.length}`);
  console.log(`${suite.metro} needs review: ${failures.length}`);
  console.log(`${suite.metro} unique primary recommendations: ${diversity.uniquePrimaryCount}`);
  console.log(`${suite.metro} report written: ${path.relative(root, suite.reportPath)}`);
  if (failures.length) {
    failures.forEach((result) => console.log(`- ${suite.metro} needs review: ${result.scenario.id}`));
  }
});
