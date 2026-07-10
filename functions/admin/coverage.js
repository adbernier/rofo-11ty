import graph from "../../_data/locationKnowledgeGraph.js";
import schema from "../../_data/locationKnowledgeSchema.js";
import recommendationQaStatus from "../../_data/recommendationQaStatus.js";
import { escapeHtml } from "../api/leads/_shared.js";

const ROADMAP_TIERS = [
  { tier: "Tier 1", metros: ["Seattle", "Phoenix", "Denver"] },
  { tier: "Tier 2", metros: ["Portland", "Austin"] },
  { tier: "Tier 3", metros: ["Dallas", "Houston", "Chicago", "Boston", "Atlanta"] },
];

const SPACE_TYPES = ["office", "industrial", "warehouse", "flex", "r_and_d", "retail", "medical", "life_science"];

const STATUS_LABELS = {
  ready: "Compass Ready",
  enhancing: "Enhancing",
  discovery: "Discovery",
  planned: "Planned",
  future: "Future",
};

const METROS = [
  {
    key: "bay-area",
    label: "SF Bay Area",
    status: "ready",
    editorialStatus: "Editorial Excellent",
    representativeBuildingCoverage: "Strong",
    qaCoverage: "Complete",
    cities: ["San Francisco", "Palo Alto", "Redwood City", "San Mateo", "Mountain View", "Sunnyvale", "San Jose", "San Bruno", "Emeryville", "Berkeley", "Oakland", "Hayward", "Union City", "Fremont"],
    currentFocus: "Representative building depth",
    geography: { cityPages: true, districtPages: true, comparisonPages: true },
    links: {
      districts: "/commercial-real-estate/CA/san-francisco/",
      comparisons: "/commercial-real-estate/CA/san-francisco/mission-bay-vs-soma/",
      brief: "/example-location-brief/",
      buildings: "/commercial-real-estate/CA/san-francisco/buildings/",
    },
  },
  {
    key: "los-angeles",
    label: "Los Angeles",
    status: "enhancing",
    editorialStatus: "Editorial Good",
    representativeBuildingCoverage: "Developing",
    qaCoverage: "Partial",
    cities: ["Los Angeles", "Culver City", "Santa Monica", "Burbank", "Glendale", "El Segundo", "Pasadena", "Vernon", "Commerce", "City of Industry", "Carson", "Torrance", "Long Beach", "Santa Fe Springs"],
    currentFocus: "Retail + Medical",
    geography: { cityPages: true, districtPages: true, comparisonPages: true },
    links: {
      districts: "/commercial-real-estate/CA/los-angeles/",
      comparisons: "/commercial-real-estate/CA/los-angeles/financial-district-bunker-hill-vs-arts-district/",
      brief: "/example-location-brief/",
      buildings: "/commercial-real-estate/CA/los-angeles/buildings/",
    },
  },
  {
    key: "sacramento",
    label: "Sacramento",
    status: "ready",
    editorialStatus: "Editorial Strong",
    representativeBuildingCoverage: "Good",
    qaCoverage: "Complete",
    cities: ["Sacramento", "West Sacramento", "Rancho Cordova", "Folsom", "Roseville", "Rocklin", "Elk Grove"],
    currentFocus: "Representative building and comparison depth",
    geography: { cityPages: true, districtPages: true, comparisonPages: true },
    links: {
      districts: "/commercial-real-estate/CA/sacramento/",
      comparisons: "/commercial-real-estate/CA/sacramento/downtown-sacramento-vs-midtown-sacramento/",
      brief: "/example-location-brief/",
      buildings: "/commercial-real-estate/CA/sacramento/buildings/",
    },
  },
  {
    key: "san-diego",
    label: "San Diego",
    status: "ready",
    editorialStatus: "Editorial Good",
    representativeBuildingCoverage: "Developing",
    qaCoverage: "Complete",
    cities: ["San Diego", "Carlsbad", "Oceanside", "Vista", "San Marcos", "Escondido", "Encinitas", "Del Mar", "Poway", "Santee", "Chula Vista"],
    currentFocus: "Representative building depth + second-pass retail/medical",
    geography: { cityPages: true, districtPages: true, comparisonPages: true },
    links: {
      districts: "/commercial-real-estate/CA/san-diego/",
      comparisons: "/commercial-real-estate/CA/san-diego/utc-university-city-vs-sorrento-mesa/",
      brief: "/example-location-brief/",
      buildings: "/commercial-real-estate/CA/san-diego/buildings/",
    },
  },
  {
    key: "orange-county",
    label: "Orange County",
    status: "ready",
    editorialStatus: "Editorial Developing",
    representativeBuildingCoverage: "Developing",
    qaCoverage: "Complete",
    cities: ["Orange County", "Irvine", "Newport Beach", "Costa Mesa", "Santa Ana", "Anaheim", "Tustin", "Lake Forest", "Mission Viejo", "Laguna Hills", "Huntington Beach", "Fullerton"],
    currentFocus: "Representative building enrichment",
    geography: { cityPages: true, districtPages: true, comparisonPages: true },
    links: {
      districts: "/commercial-real-estate/CA/irvine/",
      comparisons: "/commercial-real-estate/CA/irvine/irvine-spectrum-vs-irvine-business-complex/",
      brief: "/example-location-brief/",
      buildings: "/commercial-real-estate/CA/irvine/buildings/",
    },
  },
  {
    key: "seattle",
    label: "Seattle",
    status: "planned",
    editorialStatus: "Editorial Developing",
    representativeBuildingCoverage: "Not started",
    qaCoverage: "Pending",
    cities: ["Seattle", "Bellevue", "Redmond", "Kirkland", "Tacoma", "Everett", "Kent", "Renton"],
    currentFocus: "Initial graph",
    geography: { cityPages: true, districtPages: true, comparisonPages: false },
    links: {
      districts: "/commercial-real-estate/WA/seattle/",
      brief: "/example-location-brief/",
    },
  },
  {
    key: "phoenix",
    label: "Phoenix",
    status: "future",
    editorialStatus: "Editorial Developing",
    representativeBuildingCoverage: "Not started",
    qaCoverage: "Pending",
    cities: ["Phoenix", "Scottsdale", "Tempe", "Mesa", "Chandler", "Glendale"],
    currentFocus: "Start graph",
    geography: { cityPages: true, districtPages: false, comparisonPages: false },
    links: {
      districts: "/commercial-real-estate/AZ/phoenix/",
      brief: "/example-location-brief/",
    },
  },
  {
    key: "denver",
    label: "Denver",
    status: "future",
    editorialStatus: "Editorial Developing",
    representativeBuildingCoverage: "Not started",
    qaCoverage: "Pending",
    cities: ["Denver", "Boulder", "Aurora", "Lakewood", "Centennial"],
    currentFocus: "Start graph",
    geography: { cityPages: true, districtPages: false, comparisonPages: false },
    links: {
      districts: "/commercial-real-estate/CO/denver/",
      brief: "/example-location-brief/",
    },
  },
];

function adminResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function countTruthy(items) {
  return items.filter(Boolean).length;
}

function metroNodes(metro) {
  const citySet = new Set(metro.cities);
  return graph.filter((node) => node && node.state === "CA" ? citySet.has(node.city) : citySet.has(node.city));
}

function relationshipCount(nodes) {
  return nodes.reduce((total, node) => total + (((node.relationships || {}).compareWith || []).length), 0);
}

function marketPathCount(nodes) {
  return nodes.reduce((total, node) => total + (Array.isArray(node.marketPath) && node.marketPath.length ? 1 : 0), 0);
}

function knownAttributeCount(nodes) {
  return nodes.reduce((total, node) => {
    return total + ["attributes", "retailAttributes", "industrialAttributes"].reduce((subtotal, field) => {
      return subtotal + Object.values(node[field] || {}).filter((value) => value && value !== "unknown").length;
    }, 0);
  }, 0);
}

function validationQuestionCount(nodes) {
  return nodes.reduce((total, node) => total + (Array.isArray(node.questionsToValidate) ? node.questionsToValidate.length : 0), 0);
}

function spaceCoverage(nodes) {
  const counts = Object.fromEntries(SPACE_TYPES.map((spaceType) => [spaceType, 0]));
  nodes.forEach((node) => {
    Object.keys(node.spaceTypeFit || {}).forEach((spaceType) => {
      if (counts[spaceType] !== undefined) counts[spaceType] += 1;
    });
  });
  return counts;
}

function validationReport() {
  const slugs = new Set(graph.map((node) => node && node.slug).filter(Boolean));
  const missingSpaceTypeFit = graph
    .filter((node) => !node.spaceTypeFit || !Object.keys(node.spaceTypeFit).length)
    .map((node) => node.slug);
  const missingQuestions = graph
    .filter((node) => !Array.isArray(node.questionsToValidate) || !node.questionsToValidate.length)
    .map((node) => node.slug);
  const brokenRelationships = [];
  graph.forEach((node) => {
    (((node.relationships || {}).compareWith) || []).forEach((relationship) => {
      if (relationship.slug && !slugs.has(relationship.slug)) brokenRelationships.push(`${node.slug} -> ${relationship.slug}`);
    });
  });
  return {
    nodeCount: graph.length,
    missingSpaceTypeFit,
    missingQuestions,
    brokenRelationships,
    schemaWarnings: schema.validateLocationKnowledgeGraph(graph),
    timestamp: new Date().toISOString(),
  };
}

function readinessForMetro(metro, report) {
  const nodes = metroNodes(metro);
  const relationships = relationshipCount(nodes);
  const marketPaths = marketPathCount(nodes);
  const spaces = spaceCoverage(nodes);
  const hasQuestions = nodes.length && nodes.every((node) => Array.isArray(node.questionsToValidate) && node.questionsToValidate.length);

  // Planning heuristic: this dashboard measures Rofo Compass maturity, not SEO coverage.
  // Scores are intentionally conservative and use only locally observable graph/page readiness signals.
  const commercialGeography = (countTruthy([metro.geography.cityPages, metro.geography.districtPages, metro.geography.comparisonPages]) / 3) * 100;
  const knowledgeGraph = nodes.length
    ? ((Math.min(nodes.length / 8, 1) * 35) + (Math.min(relationships / Math.max(nodes.length * 2, 1), 1) * 25) + (marketPaths ? 20 : 0) + (hasQuestions ? 20 : 0))
    : 0;
  const recommendationProduct = nodes.length ? 100 : (metro.status === "planned" || metro.status === "discovery" ? 35 : 0);
  const representativeBuildings = metro.status === "ready" ? 85 : metro.status === "enhancing" && nodes.length ? 65 : metro.status === "planned" || metro.status === "discovery" ? 20 : 0;
  const coveredSpaceTypes = Object.values(spaces).filter((count) => count > 0).length;
  const spaceTypeCoverage = Math.min((coveredSpaceTypes / SPACE_TYPES.length) * 100, 100);
  const validation = report.schemaWarnings.length || report.brokenRelationships.length ? 60 : 100;

  const score = Math.round(
    (commercialGeography * 0.18) +
    (knowledgeGraph * 0.34) +
    (recommendationProduct * 0.16) +
    (representativeBuildings * 0.10) +
    (spaceTypeCoverage * 0.14) +
    (validation * 0.08)
  );

  return {
    ...metro,
    recommendationQa: recommendationQaStatus[metro.key] || {
      metro: metro.label,
      qaStatus: "pending",
      lastQaDate: "",
      validationStatus: "pending",
      scenarioCount: 0,
      reportPath: "",
      notes: "",
    },
    nodes,
    relationships,
    knownAttributes: knownAttributeCount(nodes),
    validationQuestions: validationQuestionCount(nodes),
    marketPaths,
    spaces,
    score,
    commercialGeography,
    knowledgeGraph,
    recommendationProduct,
    representativeBuildings,
    spaceTypeCoverage,
    validation,
  };
}

function statusClass(status) {
  if (status === "ready") return "status--ready";
  if (status === "enhancing") return "status--enhancing";
  if (status === "discovery") return "status--discovery";
  if (status === "planned") return "status--planned";
  return "status--future";
}

function renderCheck(label, active, note = "") {
  return `
    <li class="${active ? "check--ok" : "check--warn"}">
      <span>${active ? "✓" : "!"}</span>
      <div><strong>${escapeHtml(label)}</strong>${note ? `<small>${escapeHtml(note)}</small>` : ""}</div>
    </li>
  `;
}

function renderProgress(value) {
  return `
    <div class="progress" aria-label="${escapeHtml(formatPercent(value))}">
      <span style="width:${Math.max(0, Math.min(100, value))}%"></span>
    </div>
  `;
}

function renderMetric(label, value, note = "") {
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      ${note ? `<small>${escapeHtml(note)}</small>` : ""}
    </article>
  `;
}

function renderLinks(metro, token) {
  const links = [
    metro.links.districts && ["View district pages", metro.links.districts],
    metro.links.comparisons && ["View comparison pages", metro.links.comparisons],
    metro.links.brief && ["Example Location Brief", metro.links.brief],
    metro.links.buildings && ["Representative Buildings", metro.links.buildings],
    ["Knowledge Graph documentation", "/docs/location-knowledge-graph/"],
    ["Operations", `/admin/operations?token=${encodeURIComponent(token)}`],
  ].filter(Boolean);
  return links.map(([label, href]) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`).join("");
}

function renderMetroDetails(metro, token) {
  const hasOffice = metro.spaces.office > 0;
  const hasIndustrial = metro.spaces.industrial > 0;
  const hasWarehouse = metro.spaces.warehouse > 0;
  const hasRetail = metro.spaces.retail > 0;
  const hasFlex = metro.spaces.flex > 0;
  const hasMedical = metro.spaces.medical > 0;
  return `
    <details class="metro-detail">
      <summary>
        <span>${escapeHtml(metro.label)}</span>
        <strong>${escapeHtml(formatPercent(metro.score))}</strong>
      </summary>
      <div class="detail-grid">
        <section>
          <h3>Commercial Geography</h3>
          <ul>
            ${renderCheck("City pages", metro.geography.cityPages)}
            ${renderCheck("District pages", metro.geography.districtPages)}
            ${renderCheck("Comparisons", metro.geography.comparisonPages)}
          </ul>
        </section>
        <section>
          <h3>Knowledge Graph</h3>
          <ul>
            ${renderCheck("Commercial districts", metro.nodes.length > 0, `${metro.nodes.length} graph nodes`)}
            ${renderCheck("Market Paths", metro.marketPaths > 0, `${metro.marketPaths} city-level paths`)}
            ${renderCheck("Compare Relationships", metro.relationships > 0, `${metro.relationships} relationships`)}
            ${renderCheck("Recommendation attributes", metro.knownAttributes > 0, `${metro.knownAttributes} known attributes`)}
            ${renderCheck("Validation questions", metro.validationQuestions > 0, `${metro.validationQuestions} questions`)}
          </ul>
        </section>
        <section>
          <h3>Space Type Coverage</h3>
          <ul>
            ${renderCheck("Office", hasOffice, `${metro.spaces.office || 0} nodes`)}
            ${renderCheck("Retail", hasRetail, `${metro.spaces.retail || 0} nodes`)}
            ${renderCheck("Industrial", hasIndustrial, `${metro.spaces.industrial || 0} nodes`)}
            ${renderCheck("Warehouse", hasWarehouse, `${metro.spaces.warehouse || 0} nodes`)}
            ${renderCheck("Flex", hasFlex, `${metro.spaces.flex || 0} nodes`)}
            ${renderCheck("Medical", hasMedical, `${metro.spaces.medical || 0} nodes`)}
          </ul>
        </section>
        <section>
          <h3>Rofo Compass Stack</h3>
          <ul>
            ${renderCheck(STATUS_LABELS[metro.status], metro.status === "ready", metro.status === "ready" ? "Recommendation and Location Brief quality validated" : "Still maturing")}
            ${renderCheck(metro.editorialStatus || "Editorial Developing", true, "Editorial depth is tracked separately from Compass readiness")}
            ${renderCheck(`Representative Buildings: ${metro.representativeBuildingCoverage || "Developing"}`, true)}
            ${renderCheck(`QA Coverage: ${metro.qaCoverage || "Pending"}`, metro.recommendationQa.qaStatus === "completed", metro.recommendationQa.qaStatus === "completed" ? "Complete" : "Pending")}
            ${renderCheck("Recommendation Prompt", metro.nodes.length > 0 || metro.status === "planned")}
            ${renderCheck("Recommendation Resolver", metro.nodes.length > 0)}
            ${renderCheck("Explainability", metro.recommendationQa.qaStatus === "completed", metro.recommendationQa.qaStatus === "completed" ? "Passed" : "Pending")}
            ${renderCheck("Location Brief", metro.nodes.length > 0)}
            ${renderCheck("Expert Review", true)}
          </ul>
        </section>
        <section>
          <h3>Validation</h3>
          <ul>
            ${renderCheck("Schema", true)}
            ${renderCheck("Relationships", metro.relationships > 0)}
            ${renderCheck("Recommendation QA", metro.recommendationQa.qaStatus === "completed", metro.recommendationQa.qaStatus === "completed" ? "Passed" : "Pending")}
          </ul>
        </section>
        <section>
          <h3>Useful Links</h3>
          <div class="link-list">${renderLinks(metro, token)}</div>
        </section>
      </div>
    </details>
  `;
}

function renderMetroTable(metros, token) {
  return `
    <section class="panel panel--table">
      <div class="section-heading">
        <h2>Metro Coverage</h2>
        <p>Compass Maturity is a conservative planning estimate based on public geography, graph depth, resolver compatibility, explainability, QA, space-type coverage, and validation health.</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Metro</th>
              <th>Compass Status</th>
              <th>Editorial Status</th>
              <th>Compass Maturity</th>
              <th>Graph Nodes</th>
              <th>Enhancement Notes</th>
              <th>Links</th>
            </tr>
          </thead>
          <tbody>
            ${metros.map((metro) => `
              <tr>
                <td><strong>${escapeHtml(metro.label)}</strong></td>
                <td><span class="badge ${escapeHtml(statusClass(metro.status))}">${escapeHtml(STATUS_LABELS[metro.status])}</span></td>
                <td>
                  <span class="badge status--enhancing">${escapeHtml(metro.editorialStatus || "Editorial Developing")}</span>
                  <small>${escapeHtml(`Representative buildings: ${metro.representativeBuildingCoverage || "Developing"} · QA: ${metro.qaCoverage || "Pending"}`)}</small>
                </td>
                <td>
                  <strong>${escapeHtml(formatPercent(metro.score))}</strong>
                  ${renderProgress(metro.score)}
                </td>
                <td>${escapeHtml(metro.nodes.length)}</td>
                <td>${escapeHtml(metro.currentFocus)}</td>
                <td><div class="table-links">${renderLinks(metro, token)}</div></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <div class="section-heading">
        <h2>Metro Details</h2>
        <p>Expand a metro to see what is complete and what still needs work.</p>
      </div>
      ${metros.map((metro) => renderMetroDetails(metro, token)).join("")}
    </section>
  `;
}

function enhancementQueue(metros) {
  const items = [];
  metros.forEach((metro) => {
    if (metro.status === "discovery") {
      items.push({ priority: "High", title: `Convert ${metro.label} discovery into Knowledge Cards`, reason: `${metro.label} has public page coverage and discovery context, but Compass Knowledge Graph readiness is still pending.`, action: "Author priority nodes, market paths, compare relationships, and Recommendation QA scenarios." });
      return;
    }
    if (metro.status === "future") {
      items.push({ priority: "High", title: `Start ${metro.label} graph`, reason: `${metro.label} has no Knowledge Graph nodes yet.`, action: "Seed city and priority district Knowledge Cards." });
      return;
    }
    if (!metro.spaces.retail && metro.status !== "planned" && metro.status !== "discovery") {
      items.push({ priority: "Medium", title: `Add retail Knowledge Cards for ${metro.label}`, reason: "Retail space-type coverage is not yet represented in the graph.", action: "Add retail fit, customer attributes, and validation questions for strongest retail districts." });
    }
    if (!metro.spaces.medical && metro.status !== "planned" && metro.status !== "discovery") {
      items.push({ priority: "Medium", title: `Add medical-office coverage for ${metro.label}`, reason: "Medical office is a common commercial decision path but has limited graph coverage.", action: "Enrich medical-relevant districts with medical space-type fit and patient-access tradeoffs." });
    }
    if (metro.relationships < metro.nodes.length * 2 && metro.nodes.length) {
      items.push({ priority: "High", title: `Improve ${metro.label} comparison depth`, reason: `${metro.label} has ${metro.relationships} compare relationships across ${metro.nodes.length} nodes.`, action: "Add 2-4 tenant-decision comparisons per priority node." });
    }
    if (metro.representativeBuildings < 80 && metro.status !== "future") {
      items.push({ priority: "Medium", title: `Add Representative Buildings to ${metro.label}`, reason: "Representative building depth is estimated as partial.", action: "Attach only existing, reliable representative building paths to priority districts." });
    }
  });
  return items.slice(0, 8);
}

function renderEnhancementQueue(metros) {
  const items = enhancementQueue(metros);
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>Highest ROI Improvements</h2>
        <p>Heuristic queue based on graph gaps, space-type coverage, comparison depth, and representative-building depth.</p>
      </div>
      <div class="queue-grid">
        ${items.map((item) => `
          <article class="queue-card">
            <span class="priority priority--${escapeHtml(item.priority.toLowerCase())}">${escapeHtml(item.priority)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.reason)}</p>
            <strong>${escapeHtml(item.action)}</strong>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderRoadmap() {
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>Planned Metro Roadmap</h2>
        <p>Editable planning configuration for future recommendation-ready metro expansion.</p>
      </div>
      <div class="roadmap-grid">
        ${ROADMAP_TIERS.map((tier) => `
          <article class="roadmap-card">
            <h3>${escapeHtml(tier.tier)}</h3>
            <ul>${tier.metros.map((metro) => `<li>${escapeHtml(metro)}</li>`).join("")}</ul>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderSpaceTypeCoverage(metros) {
  const totals = Object.fromEntries(SPACE_TYPES.map((spaceType) => [spaceType, 0]));
  graph.forEach((node) => {
    Object.keys(node.spaceTypeFit || {}).forEach((spaceType) => {
      if (totals[spaceType] !== undefined) totals[spaceType] += 1;
    });
  });
  const max = Math.max(...Object.values(totals), 1);
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>Space Type Coverage</h2>
        <p>Conservative estimate from current Knowledge Graph nodes with explicit space-type fit.</p>
      </div>
      <div class="space-grid">
        ${SPACE_TYPES.map((spaceType) => {
          const count = totals[spaceType] || 0;
          const estimate = Math.round((count / max) * 100);
          return `
            <article class="space-card">
              <span>${escapeHtml(spaceType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))}</span>
              <strong>${escapeHtml(formatPercent(estimate))}</strong>
              ${renderProgress(estimate)}
              <small>${escapeHtml(count)} graph nodes</small>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderValidation(report) {
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>Validation Report</h2>
        <p>Current Commercial Location Knowledge Graph health.</p>
      </div>
      <div class="validation-grid">
        ${renderMetric("Knowledge Graph Nodes", report.nodeCount, "Current graph size")}
        ${renderMetric("Missing spaceTypeFit", report.missingSpaceTypeFit.length, "Should stay at 0")}
        ${renderMetric("Missing questionsToValidate", report.missingQuestions.length, "Should stay at 0")}
        ${renderMetric("Broken relationships", report.brokenRelationships.length, "Relationship slugs must resolve")}
        ${renderMetric("Schema warnings", report.schemaWarnings.length, "Validator output")}
        ${renderMetric("Last validation timestamp", new Date(report.timestamp).toLocaleString("en-US"), "Server render time")}
      </div>
      ${report.schemaWarnings.length || report.brokenRelationships.length || report.missingSpaceTypeFit.length || report.missingQuestions.length ? `
        <div class="warning-list">
          ${[...report.missingSpaceTypeFit.map((item) => `Missing spaceTypeFit: ${item}`), ...report.missingQuestions.map((item) => `Missing questionsToValidate: ${item}`), ...report.brokenRelationships.map((item) => `Broken relationship: ${item}`), ...report.schemaWarnings].map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
        </div>
      ` : `<p class="healthy">Validation is clean.</p>`}
    </section>
  `;
}

function renderPage({ token, metros, report }) {
  const readyCount = metros.filter((metro) => metro.status === "ready").length;
  const enhancingCount = metros.filter((metro) => metro.status === "enhancing").length;
  const discoveryCount = metros.filter((metro) => metro.status === "discovery").length;
  const plannedCount = metros.filter((metro) => metro.status === "planned").length;
  const overallMaturity = metros.length ? Math.round(metros.reduce((total, metro) => total + metro.score, 0) / metros.length) : 0;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rofo Compass Coverage | Rofo</title>
  <style>
    :root { color-scheme: light; --bg: #f6f8fb; --surface: #fff; --ink: #111827; --muted: #64748b; --border: #dce5f2; --blue: #1746cc; --green: #166534; --amber: #92400e; --red: #991b1b; --soft-blue: #eef4ff; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    a { color: var(--blue); text-decoration: none; font-weight: 800; }
    h1, h2, h3, p { margin: 0; }
    .shell { width: min(1260px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 64px; }
    header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 20px; }
    h1 { margin-bottom: 8px; font-size: clamp(2.1rem, 4vw, 3.6rem); line-height: 0.98; letter-spacing: -0.02em; }
    header p, .section-heading p, .philosophy { color: var(--muted); line-height: 1.55; }
    .philosophy { margin-top: 12px; max-width: 760px; padding: 12px 14px; border: 1px solid #dbeafe; border-radius: 14px; background: var(--soft-blue); color: #1e3a8a; font-weight: 750; }
    .nav { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
    .button-link { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; padding: 0 12px; border: 1px solid var(--border); border-radius: 999px; background: #fff; color: var(--blue); font-size: 0.9rem; white-space: nowrap; }
    .button-link--active { border-color: #bfdbfe; background: #eff6ff; color: #1e40af; }
    .back-link { display: inline-flex; width: fit-content; margin-bottom: 12px; color: var(--blue); font-size: 0.88rem; font-weight: 900; }
    .metrics { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 18px 0; }
    .metric-card, .panel, .queue-card, .roadmap-card, .space-card { border: 1px solid var(--border); background: var(--surface); box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06); }
    .metric-card { display: grid; gap: 6px; padding: 16px; border-radius: 16px; }
    .metric-card span, .space-card span { color: var(--muted); font-size: 0.74rem; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; }
    .metric-card strong { font-size: 1.8rem; line-height: 1; }
    .metric-card small, .space-card small { color: var(--muted); font-size: 0.84rem; }
    .panel { margin-top: 16px; padding: 20px; border-radius: 18px; }
    .section-heading { display: grid; gap: 6px; margin-bottom: 14px; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; min-width: 1080px; border-collapse: collapse; }
    th { color: var(--muted); font-size: 0.72rem; font-weight: 900; letter-spacing: 0.04em; text-align: left; text-transform: uppercase; }
    th, td { padding: 12px 10px; border-top: 1px solid #edf2f7; vertical-align: top; }
    td strong { display: block; }
    td small { display: block; margin-top: 6px; color: var(--muted); line-height: 1.35; }
    .badge, .priority { display: inline-flex; align-items: center; width: fit-content; padding: 5px 9px; border-radius: 999px; font-size: 0.74rem; font-weight: 900; }
    .status--ready { background: #dcfce7; color: var(--green); }
    .status--enhancing { background: #dbeafe; color: #1e40af; }
    .status--discovery { background: #ede9fe; color: #5b21b6; }
    .status--planned { background: #fef3c7; color: var(--amber); }
    .status--future { background: #f1f5f9; color: #475569; }
    .progress { width: 140px; max-width: 100%; height: 8px; margin-top: 8px; border-radius: 999px; background: #e5edf7; overflow: hidden; }
    .progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #1746cc, #0f766e); }
    .table-links, .link-list { display: flex; flex-wrap: wrap; gap: 8px 12px; }
    .metro-detail { border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; }
    .metro-detail + .metro-detail { margin-top: 10px; }
    .metro-detail summary { display: flex; justify-content: space-between; gap: 12px; align-items: center; padding: 14px 16px; cursor: pointer; font-weight: 900; }
    .detail-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; padding: 0 16px 16px; }
    .detail-grid section { padding: 14px; border: 1px solid #edf2f7; border-radius: 14px; background: #fbfdff; }
    .detail-grid h3 { margin-bottom: 10px; font-size: 0.94rem; }
    .detail-grid ul { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
    .detail-grid li { display: flex; gap: 8px; align-items: flex-start; color: #334155; }
    .detail-grid li span { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; border-radius: 999px; font-size: 0.8rem; font-weight: 900; }
    .check--ok span { background: #dcfce7; color: var(--green); }
    .check--warn span { background: #fef3c7; color: var(--amber); }
    .detail-grid small { display: block; margin-top: 2px; color: var(--muted); }
    .queue-grid, .roadmap-grid, .space-grid, .validation-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .queue-card, .roadmap-card, .space-card { display: grid; gap: 10px; padding: 16px; border-radius: 14px; box-shadow: none; }
    .queue-card p { color: var(--muted); line-height: 1.45; }
    .queue-card strong { color: #0f172a; line-height: 1.35; }
    .priority--high { background: #fee2e2; color: var(--red); }
    .priority--medium { background: #fef3c7; color: var(--amber); }
    .roadmap-card ul { margin: 0; padding-left: 18px; color: #334155; line-height: 1.7; }
    .space-card strong { font-size: 1.6rem; }
    .warning-list { display: grid; gap: 6px; margin-top: 14px; padding: 12px; border-radius: 12px; background: #fff7ed; color: #9a3412; }
    .healthy { margin-top: 12px; color: var(--green); font-weight: 850; }
    @media (max-width: 980px) {
      header { display: grid; }
      .nav { justify-content: flex-start; }
      .metrics, .detail-grid, .queue-grid, .roadmap-grid, .space-grid, .validation-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
      .metrics, .detail-grid, .queue-grid, .roadmap-grid, .space-grid, .validation-grid { grid-template-columns: 1fr; }
      .metro-detail summary { align-items: flex-start; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div>
        <a class="back-link" href="/admin/operations?token=${encodeURIComponent(token)}">← Back to Operations</a>
        <h1>Rofo Compass Coverage</h1>
        <p>Measures the maturity of Rofo Compass across supported commercial markets.</p>
        <div class="philosophy">A metro is Compass Ready when a business can receive a credible Location Brief backed by Rofo Compass: the Knowledge Graph, Recommendation Resolver, Explainability Layer, Location Brief Generator, and Recommendation QA.</div>
      </div>
      <nav class="nav" aria-label="Admin links">
        <a class="button-link" href="/admin/operations?token=${encodeURIComponent(token)}">Operations</a>
        <a class="button-link" href="/admin/compass?token=${encodeURIComponent(token)}">Rofo Compass</a>
        <a class="button-link button-link--active" href="/admin/coverage?token=${encodeURIComponent(token)}">Compass Coverage</a>
        <a class="button-link" href="/admin/leads?token=${encodeURIComponent(token)}">Leads</a>
        <a class="button-link" href="/admin/search-profile-analytics?token=${encodeURIComponent(token)}">Search Profile Analytics</a>
        <a class="button-link" href="/example-location-brief/">Example Location Brief</a>
      </nav>
    </header>

    <section class="metrics" aria-label="Rofo Compass coverage KPIs">
      ${renderMetric("Knowledge Graph Nodes", report.nodeCount, "Current canonical graph")}
      ${renderMetric("Compass Ready Metros", readyCount, "Status = ready")}
      ${renderMetric("Metros In Progress", enhancingCount, "Status = enhancing")}
      ${renderMetric("Metros in Discovery", discoveryCount, "Status = discovery")}
      ${renderMetric("Planned Metros", plannedCount, "Status = planned")}
      ${renderMetric("Overall Compass Maturity", formatPercent(overallMaturity), "Average metro score")}
    </section>

    ${renderMetroTable(metros, token)}
    ${renderEnhancementQueue(metros)}
    ${renderRoadmap()}
    ${renderSpaceTypeCoverage(metros)}
    ${renderValidation(report)}
  </main>
</body>
</html>`;
}

export async function onRequestGet({ request, env }) {
  const configuredToken = env.ADMIN_DASHBOARD_TOKEN;
  if (!configuredToken) {
    return adminResponse("Admin dashboard is not configured.", 403);
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  if (token !== configuredToken) {
    return adminResponse("Forbidden", 403);
  }

  const report = validationReport();
  const metros = METROS.map((metro) => readinessForMetro(metro, report));

  return adminResponse(renderPage({ token, metros, report }));
}
