import graph from "../../_data/locationKnowledgeGraph.js";
import schema from "../../_data/locationKnowledgeSchema.js";
import recommendationQaStatus from "../../_data/recommendationQaStatus.js";
import { escapeHtml } from "../api/leads/_shared.js";

const RESOLVER_VERSION = "Compass Resolver v1";
const EXPLAINABILITY_VERSION = "Explainability Layer v1";
const LOCATION_BRIEF_VERSION = "Location Brief Generator v1";
const SPACE_TYPES = ["office", "industrial", "warehouse", "flex", "r_and_d", "retail", "medical", "life_science"];
const PLATFORM_VERSION = "Compass v1";
const COMPASS_METROS = [
  { key: "bay-area", label: "SF Bay Area", status: "ready" },
  { key: "sacramento", label: "Sacramento", status: "ready" },
  { key: "san-diego", label: "San Diego", status: "ready" },
  { key: "los-angeles", label: "Los Angeles", status: "enhancing" },
  { key: "orange-county", label: "Orange County", status: "enhancing" },
  { key: "seattle", label: "Seattle", status: "planned" },
  { key: "phoenix", label: "Phoenix", status: "planned" },
  { key: "denver", label: "Denver", status: "planned" },
];
const COMPASS_LIFECYCLE = [
  "Compass Discovery",
  "Editorial Review",
  "Knowledge Graph",
  "Recommendation Resolver",
  "Explainability",
  "Recommendation QA",
  "Compass Ready",
  "Production",
];
const COMPASS_STACK = [
  "Rofo",
  "Rofo Compass",
  "Commercial Location Knowledge Graph",
  "Recommendation Resolver",
  "Explainability Layer",
  "Location Brief Generator",
  "Recommendation QA",
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

function relationshipCount(nodes) {
  return nodes.reduce((total, node) => total + (((node.relationships || {}).compareWith || []).length), 0);
}

function marketPathCount(nodes) {
  return nodes.reduce((total, node) => total + (Array.isArray(node.marketPath) && node.marketPath.length ? 1 : 0), 0);
}

function validationQuestionCount(nodes) {
  return nodes.reduce((total, node) => total + (Array.isArray(node.questionsToValidate) ? node.questionsToValidate.length : 0), 0);
}

function knownAttributeCount(nodes) {
  return nodes.reduce((total, node) => {
    return total + ["attributes", "retailAttributes", "industrialAttributes"].reduce((subtotal, field) => {
      return subtotal + Object.values(node[field] || {}).filter((value) => value && value !== "unknown").length;
    }, 0);
  }, 0);
}

function representativeBuildingCount(nodes) {
  return nodes.reduce((total, node) => total + (Array.isArray(node.representativeBuildings) ? node.representativeBuildings.length : 0), 0);
}

function statusCount(status) {
  return COMPASS_METROS.filter((metro) => metro.status === status).length;
}

function supportedSpaceTypes(nodes) {
  const types = new Set();
  nodes.forEach((node) => {
    Object.keys(node.spaceTypeFit || {}).forEach((spaceType) => types.add(spaceType));
  });
  return SPACE_TYPES.filter((spaceType) => types.has(spaceType));
}

function qaRows() {
  return Object.entries(recommendationQaStatus).map(([key, value]) => ({ key, ...value }));
}

function qaCompletedRows() {
  return qaRows().filter((row) => row.qaStatus === "completed");
}

function qaScenarioCount() {
  return qaRows().reduce((total, row) => total + Number(row.scenarioCount || 0), 0);
}

function validationReport() {
  const slugs = new Set(graph.map((node) => node && node.slug).filter(Boolean));
  const brokenRelationships = [];
  graph.forEach((node) => {
    (((node.relationships || {}).compareWith) || []).forEach((relationship) => {
      if (relationship.slug && !slugs.has(relationship.slug)) brokenRelationships.push(`${node.slug} -> ${relationship.slug}`);
    });
  });
  return {
    schemaWarnings: schema.validateLocationKnowledgeGraph(graph),
    brokenRelationships,
    timestamp: new Date().toISOString(),
  };
}

function statusBadge(label, tone = "ok") {
  return `<span class="badge badge--${escapeHtml(tone)}">${escapeHtml(label)}</span>`;
}

function metric(label, value, note = "") {
  const displayValue = value === 0 ? "0" : value;
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(displayValue)}</strong>
      ${note ? `<small>${escapeHtml(note)}</small>` : ""}
    </article>
  `;
}

function lifecycleStep(label, index) {
  return `
    <li>
      <span>${escapeHtml(index + 1)}</span>
      <strong>${escapeHtml(label)}</strong>
    </li>
  `;
}

function renderLifecycle() {
  return `
    <section class="panel panel--lifecycle">
      <div class="section-heading">
        <h2>Compass Lifecycle</h2>
        <p>The standard path for turning a market from discovery into production-ready commercial location intelligence.</p>
      </div>
      <ol class="lifecycle">
        ${COMPASS_LIFECYCLE.map((step, index) => lifecycleStep(step, index)).join("")}
      </ol>
    </section>
  `;
}

function moduleCard(title, status, rows, tone = "ok") {
  return `
    <section class="module-card">
      <div class="module-card__header">
        <h2>${escapeHtml(title)}</h2>
        ${statusBadge(status, tone)}
      </div>
      <dl>
        ${rows.map(([label, value]) => `
          <div>
            <dt>${escapeHtml(label)}</dt>
            <dd>${escapeHtml(value === 0 ? "0" : value)}</dd>
          </div>
        `).join("")}
      </dl>
    </section>
  `;
}

function renderQaTable(rows) {
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>Recommendation QA</h2>
        <p>QA validates that Rofo Compass produces differentiated, explainable, defensible, and actionable Location Briefs.</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Metro</th>
              <th>Status</th>
              <th>Scenarios</th>
              <th>Last QA</th>
              <th>Validation</th>
              <th>Report</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td><strong>${escapeHtml(row.metro)}</strong></td>
                <td>${statusBadge(row.qaStatus.replace(/_/g, " "), row.qaStatus === "completed" ? "ok" : "warn")}</td>
                <td>${escapeHtml(row.scenarioCount || 0)}</td>
                <td>${escapeHtml(row.lastQaDate || "Pending")}</td>
                <td>${escapeHtml((row.validationStatus || "pending").replace(/_/g, " "))}</td>
                <td>${row.reportPath ? `<a href="${escapeHtml(row.reportPath)}">View report</a>` : "—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderPage({ token }) {
  const report = validationReport();
  const qa = qaRows();
  const completedQa = qaCompletedRows();
  const spaces = supportedSpaceTypes(graph);
  const relationshipTotal = relationshipCount(graph);
  const questionTotal = validationQuestionCount(graph);
  const marketPaths = marketPathCount(graph);
  const knownAttributes = knownAttributeCount(graph);
  const representativeBuildings = representativeBuildingCount(graph);
  const qaScenarios = qaScenarioCount();
  const readyMetros = statusCount("ready");
  const discoveryMetros = statusCount("discovery");
  const enhancingMetros = statusCount("enhancing");
  const locationBriefCompatibleMetros = COMPASS_METROS.filter((metro) => metro.status === "ready" || metro.status === "enhancing").length;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rofo Compass | Rofo Admin</title>
  <style>
    :root { color-scheme: light; --bg: #f5f7fb; --surface: #fff; --ink: #111827; --muted: #64748b; --border: #dce5f2; --blue: #1746cc; --green: #166534; --amber: #92400e; --soft-blue: #eef4ff; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    a { color: var(--blue); font-weight: 850; text-decoration: none; }
    h1, h2, h3, p { margin: 0; }
    .shell { width: min(1240px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 64px; }
    header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 20px; }
    h1 { margin-bottom: 8px; font-size: clamp(2.2rem, 4vw, 3.6rem); line-height: 0.98; letter-spacing: -0.02em; }
    header p, .section-heading p, .compass-definition { color: var(--muted); line-height: 1.55; }
    .nav { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
    .button-link { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; padding: 0 12px; border: 1px solid var(--border); border-radius: 999px; background: #fff; color: var(--blue); font-size: 0.9rem; font-weight: 850; white-space: nowrap; }
    .button-link--active { border-color: #bfdbfe; background: #eff6ff; color: #1e40af; }
    .back-link { display: inline-flex; width: fit-content; margin-bottom: 12px; color: var(--blue); font-size: 0.88rem; font-weight: 900; }
    .compass-definition { margin: 14px 0 18px; padding: 14px 16px; border: 1px solid #dbeafe; border-radius: 16px; background: var(--soft-blue); color: #1e3a8a; font-weight: 760; }
    .stack { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 0; padding: 0; list-style: none; }
    .stack li { padding: 7px 10px; border: 1px solid var(--border); border-radius: 999px; background: #fff; color: #334155; font-size: 0.82rem; font-weight: 850; }
    .metrics, .module-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .metric-card, .module-card, .panel { border: 1px solid var(--border); background: var(--surface); box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06); }
    .metric-card { display: grid; gap: 6px; padding: 16px; border-radius: 16px; }
    .metric-card span { color: var(--muted); font-size: 0.74rem; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; }
    .metric-card strong { font-size: 2rem; line-height: 1; }
    .metric-card small { color: var(--muted); font-size: 0.85rem; }
    .module-grid { margin-top: 16px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .module-card, .panel { padding: 20px; border-radius: 18px; }
    .module-card__header { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 14px; }
    .badge { display: inline-flex; align-items: center; width: fit-content; padding: 5px 9px; border-radius: 999px; font-size: 0.74rem; font-weight: 900; text-transform: capitalize; }
    .badge--ok { background: #dcfce7; color: var(--green); }
    .badge--warn { background: #fef3c7; color: var(--amber); }
    dl { display: grid; gap: 10px; margin: 0; }
    dl div { display: flex; justify-content: space-between; gap: 14px; padding-top: 10px; border-top: 1px solid #edf2f7; }
    dt { color: var(--muted); font-weight: 760; }
    dd { margin: 0; color: #0f172a; font-weight: 850; text-align: right; }
    .panel { margin-top: 16px; }
    .section-heading { display: grid; gap: 6px; margin-bottom: 14px; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; min-width: 760px; border-collapse: collapse; }
    th { color: var(--muted); font-size: 0.72rem; font-weight: 900; letter-spacing: 0.04em; text-align: left; text-transform: uppercase; }
    th, td { padding: 12px 10px; border-top: 1px solid #edf2f7; vertical-align: top; }
    .health { display: grid; gap: 8px; margin-top: 12px; color: #334155; line-height: 1.5; }
    .overview-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
    .panel--overview { margin-bottom: 16px; }
    .panel--lifecycle { overflow: hidden; }
    .lifecycle { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 0; padding: 0; list-style: none; }
    .lifecycle li { position: relative; display: grid; gap: 8px; min-height: 100px; padding: 14px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fbfdff; }
    .lifecycle li span { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 999px; background: var(--soft-blue); color: var(--blue); font-size: 0.82rem; font-weight: 900; }
    .lifecycle li strong { align-self: end; line-height: 1.2; }
    @media (max-width: 980px) {
      header { display: grid; }
      .nav { justify-content: flex-start; }
      .metrics, .module-grid, .overview-grid, .lifecycle { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
      .metrics, .module-grid, .overview-grid, .lifecycle { grid-template-columns: 1fr; }
      dl div { display: grid; }
      dd { text-align: left; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div>
        <a class="back-link" href="/admin/operations?token=${encodeURIComponent(token)}">Back to Operations</a>
        <h1>Rofo Compass</h1>
        <p>Commercial Location Intelligence Engine health, graph maturity, resolver support, explainability, QA, and Location Brief generation.</p>
        <div class="compass-definition">Rofo Compass is the internal intelligence layer that turns commercial geography into explainable Location Briefs.</div>
        <ol class="stack" aria-label="Rofo Compass hierarchy">
          ${COMPASS_STACK.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ol>
      </div>
      <nav class="nav" aria-label="Admin links">
        <a class="button-link" href="/admin/operations?token=${encodeURIComponent(token)}">Operations</a>
        <a class="button-link button-link--active" href="/admin/compass?token=${encodeURIComponent(token)}">Rofo Compass</a>
        <a class="button-link" href="/admin/coverage?token=${encodeURIComponent(token)}">Compass Coverage</a>
        <a class="button-link" href="/admin/leads?token=${encodeURIComponent(token)}">Leads</a>
        <a class="button-link" href="/admin/search-profile-analytics?token=${encodeURIComponent(token)}">Search Profile Analytics</a>
      </nav>
    </header>

    <section class="panel panel--overview">
      <div class="section-heading">
        <h2>Platform Overview</h2>
        <p>Current health of Rofo Compass as an internal commercial location intelligence platform.</p>
      </div>
      <div class="overview-grid">
        ${metric("Compass Ready Metros", readyMetros, "Validated for V1 Location Briefs")}
        ${metric("Metros in Discovery", discoveryMetros, "Discovery or editorial review")}
        ${metric("Metros Enhancing", enhancingMetros, "Graph-backed but still deepening")}
        ${metric("Location Brief-Compatible Metros", locationBriefCompatibleMetros, "Ready or enhancing metros")}
      </div>
    </section>

    <section class="metrics" aria-label="Rofo Compass platform statistics">
      ${metric("Knowledge Graph Nodes", graph.length, "Canonical commercial location nodes")}
      ${metric("Comparison Relationships", relationshipTotal, "Graph compareWith edges")}
      ${metric("Recommendation Attributes", knownAttributes, "Known business, retail, and industrial attributes")}
      ${metric("Validation Questions", questionTotal, "Questions to validate in Location Briefs")}
      ${metric("Representative Buildings", representativeBuildings, "Attached to Knowledge Graph nodes")}
      ${metric("QA Scenarios", qaScenarios, "Internal Recommendation QA profiles")}
      ${metric("Supported Space Types", spaces.length, spaces.join(", "))}
      ${metric("Platform Version", PLATFORM_VERSION, "Internal platform generation")}
    </section>

    ${renderLifecycle()}

    <section class="module-grid" aria-label="Compass modules">
      ${moduleCard("Commercial Location Knowledge Graph", "Active", [
        ["Graph nodes", graph.length],
        ["Comparison relationships", relationshipTotal],
        ["Recommendation attributes", knownAttributes],
        ["Market paths", marketPaths],
        ["Representative buildings", representativeBuildings ? representativeBuildings : "Tracked outside Compass graph"],
      ])}
      ${moduleCard("Recommendation Resolver", "Active", [
        ["Version", RESOLVER_VERSION],
        ["Compass Ready metros", completedQa.length],
        ["Supported modes", "market_path, single_starting_point, expert_guided"],
        ["Customer numeric scores", "Disabled"],
      ])}
      ${moduleCard("Explainability Layer", "Enabled", [
        ["Version", EXPLAINABILITY_VERSION],
        ["Selection rationale", "Enabled"],
        ["Alternative rationale", "Enabled"],
        ["Validation focus", "Enabled"],
        ["QA coverage", `${completedQa.length} completed metros`],
      ])}
      ${moduleCard("Location Brief Generator", "Supported", [
        ["Version", LOCATION_BRIEF_VERSION],
        ["Public URLs", "Supported"],
        ["Example brief", "/example-location-brief/"],
        ["Expert review", "Supported"],
      ])}
    </section>

    ${renderQaTable(qa)}

    <section class="panel">
      <div class="section-heading">
        <h2>Validation Health</h2>
        <p>Current system-level health for the Commercial Location Knowledge Graph.</p>
      </div>
      <div class="health">
        <p><strong>Schema warnings:</strong> ${escapeHtml(report.schemaWarnings.length)}</p>
        <p><strong>Broken relationships:</strong> ${escapeHtml(report.brokenRelationships.length)}</p>
        <p><strong>Last validation:</strong> ${escapeHtml(new Date(report.timestamp).toLocaleString("en-US"))}</p>
      </div>
    </section>
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

  return adminResponse(renderPage({ token }));
}
