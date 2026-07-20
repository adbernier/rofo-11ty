import publisherSnapshot from "../../data/generated/publisher-analysis.json";

function adminResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function snapshotAnalysis() {
  return publisherSnapshot && publisherSnapshot.analysis ? publisherSnapshot.analysis : null;
}

function renderSnapshotError(token) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rofo Publisher Unavailable | Rofo Admin</title>
  <style>
    body { margin: 0; color: #172033; background: #f5f7fb; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(880px, calc(100% - 40px)); margin: 0 auto; padding: 48px 0; }
    .panel { border: 1px solid #dbe3ef; border-radius: 14px; background: #fff; padding: 24px; box-shadow: 0 14px 40px rgba(15, 23, 42, 0.05); }
    a { color: #2457d6; font-weight: 800; text-decoration: none; }
    p { color: #627084; line-height: 1.5; }
    code { background: #f1f5f9; border-radius: 6px; padding: 2px 6px; }
  </style>
</head>
<body>
  <main>
    <section class="panel">
      <h1>Rofo Publisher snapshot unavailable</h1>
      <p>Publisher analysis could not be loaded from the generated build-time snapshot. Run <code>npm run publisher:snapshot</code> and rebuild before opening this admin module.</p>
      <p><a href="/admin/operations?${tokenParam(token)}">Back to Operations</a></p>
    </section>
  </main>
</body>
</html>`;
}

function pct(value) {
  return `${Math.round(Number(value) || 0)}%`;
}

function tokenParam(token) {
  return `token=${encodeURIComponent(token)}`;
}

function publisherUrl(token, params = {}) {
  const query = new URLSearchParams({ token });
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  return `/admin/publisher?${query.toString()}`;
}

function severityClass(severity) {
  if (severity === "critical") return "is-critical";
  if (severity === "high") return "is-high";
  if (severity === "medium") return "is-medium";
  return "is-low";
}

function renderNav(token) {
  return `
    <nav class="admin-nav" aria-label="Admin navigation">
      <a class="button-link" href="/admin/operations?${tokenParam(token)}">Operations</a>
      <a class="button-link button-link--active" href="/admin/publisher?${tokenParam(token)}">Publisher</a>
      <a class="button-link" href="/admin/compass?${tokenParam(token)}">Rofo Compass</a>
      <a class="button-link" href="/admin/coverage?${tokenParam(token)}">Compass Coverage</a>
      <a class="button-link" href="/admin/leads?${tokenParam(token)}">Leads</a>
      <a class="button-link" href="/admin/search-profile-analytics?${tokenParam(token)}">Search Profile Analytics</a>
    </nav>
  `;
}

function renderMetric(label, value, note) {
  return `
    <article class="metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <p>${escapeHtml(note || "")}</p>
    </article>
  `;
}

function renderProgress(value) {
  const safeValue = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  return `
    <div class="progress" aria-label="${safeValue}% complete">
      <span style="width: ${safeValue}%"></span>
    </div>
  `;
}

function renderDimensionList(metro) {
  return `
    <div class="dimension-list">
      ${Object.values(metro.dimensions || {}).map((dimension) => `
        <div class="dimension-row">
          <span>${escapeHtml(dimension.label)}</span>
          <strong>${pct(dimension.score)}</strong>
          ${renderProgress(dimension.score)}
        </div>
      `).join("")}
    </div>
  `;
}

function renderGateBlockers(blockers = []) {
  if (!blockers.length) return `<p class="quiet">No active gate blockers.</p>`;
  return `
    <ul class="blocker-list">
      ${blockers.map((blocker) => `
        <li>
          <span class="severity ${severityClass(blocker.severity)}">${escapeHtml(blocker.severity)}</span>
          <strong>${escapeHtml(blocker.code)}</strong>
          <p>${escapeHtml(blocker.message)}</p>
        </li>
      `).join("")}
    </ul>
  `;
}

function renderMetroRows(metros, token) {
  return metros.map((metro) => {
    const critical = metro.queue.filter((item) => item.severity === "critical").length;
    const high = metro.queue.filter((item) => item.severity === "high").length;
    return `
      <tr>
        <td>
          <strong>${escapeHtml(metro.metroName)}</strong>
          <small>${escapeHtml(metro.cityPath || "No primary city path")}</small>
        </td>
        <td>${escapeHtml(metro.compassStatus === "ready" ? "Compass Ready" : metro.compassStatus)}</td>
        <td>${renderDimensionList(metro)}</td>
        <td><strong>${pct(metro.overallScore || metro.score)}</strong>${renderProgress(metro.overallScore || metro.score)}</td>
        <td>${escapeHtml(metro.readinessStatus)}</td>
        <td>${escapeHtml((metro.gateBlockers || [])[0] ? metro.gateBlockers[0].message : "None")}</td>
        <td>${critical} critical / ${high} high</td>
        <td>${metro.queue.length}</td>
        <td>${escapeHtml(metro.recommendedNextAction.suggestedNextAction || metro.recommendedNextAction.reason || "")}</td>
        <td><a href="${publisherUrl(token, { metro: metro.metroId })}">View detail</a></td>
      </tr>
    `;
  }).join("");
}

function renderOverview({ analysis, token }) {
  return `
    <section class="metrics" aria-label="Publisher overview">
      ${renderMetric("Compass Ready Metros", String(analysis.overview.compassReadyCount), "Primary Publisher queue")}
      ${renderMetric("Average Coverage", pct(analysis.overview.averageScore), "Weighted Publisher score")}
      ${renderMetric("Critical Issues", String(analysis.overview.criticalIssues), "Broken or invalid data")}
      ${renderMetric("Queued Tasks", String(analysis.overview.queuedTasks), "Deterministic production queue")}
      ${renderMetric("Closest to Distribution", analysis.overview.closestToDistributionReady, "Highest current score")}
      ${renderMetric("Largest Critical Gap", analysis.overview.largestCriticalGap, "None means no critical issues")}
    </section>

    <section class="panel">
      <div class="section-header">
        <div>
          <h2>Metro Production Queue</h2>
          <p>Compass Ready metros are measured for editorial depth, graph completeness, Building Brief migration, recommendation QA, and internal links.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Metro</th>
              <th>Compass</th>
              <th>Dimensions</th>
              <th>Overall</th>
              <th>Readiness</th>
              <th>Primary Blocker</th>
              <th>Issues</th>
              <th>Queue</th>
              <th>Recommended Next Action</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${renderMetroRows(analysis.primaryMetros, token)}</tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <h2>In Development</h2>
      <p>Metros that are not in the primary Compass Ready production queue remain visible without being mixed into readiness comparisons.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Metro</th><th>Status</th><th>Score</th><th>Queue</th></tr></thead>
          <tbody>
            ${analysis.inDevelopmentMetros.map((metro) => `
              <tr>
                <td>${escapeHtml(metro.metroName)}</td>
                <td>${escapeHtml(metro.compassStatus)}</td>
                <td>${pct(metro.score)}</td>
                <td>${metro.queue.length}</td>
              </tr>
            `).join("") || `<tr><td colspan="4">No in-development metros detected.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>

    ${renderQueue((analysis.primaryQueue || analysis.queue).slice(0, 40), token, "Highest Priority Work", "Top deterministic Publisher tasks across Compass Ready metros.")}
  `;
}

function renderMetroDetail(metro, token) {
  return `
    <section class="panel detail-hero">
      <a class="back-link" href="/admin/publisher?${tokenParam(token)}">Back to Publisher overview</a>
      <div class="detail-grid">
        <div>
          <h2>${escapeHtml(metro.metroName)}</h2>
          <p>${escapeHtml(metro.readinessStatus)} · ${escapeHtml(metro.compassStatus === "ready" ? "Compass Ready" : metro.compassStatus)}</p>
          <strong class="score">${pct(metro.overallScore || metro.score)}</strong>
          ${renderProgress(metro.overallScore || metro.score)}
          <p>Raw overall: ${pct(metro.rawOverallScore || metro.score)}</p>
        </div>
        <div>
          <h3>Recommended next action</h3>
          <p>${escapeHtml(metro.recommendedNextAction.suggestedNextAction || metro.recommendedNextAction.reason || "")}</p>
          ${metro.cityPath ? `<a href="${escapeHtml(metro.cityPath)}">View public city page</a>` : ""}
        </div>
      </div>
    </section>

    <section class="dimension-grid" aria-label="Publisher dimensions">
      ${Object.values(metro.dimensions || {}).map((dimension) => `
        <article class="dimension-card">
          <div class="category-card__top">
            <h3>${escapeHtml(dimension.label)}</h3>
            <strong>${pct(dimension.score)}</strong>
          </div>
          ${renderProgress(dimension.score)}
          <p>${escapeHtml(dimension.explanation)}</p>
          ${dimension.topOpportunity ? `<p><strong>Next:</strong> ${escapeHtml(dimension.topOpportunity)}</p>` : ""}
        </article>
      `).join("")}
    </section>

    <section class="panel">
      <h2>Gate Blockers</h2>
      ${renderGateBlockers(metro.gateBlockers || [])}
      ${(metro.scoreCapReasons || []).length ? `
        <h3>Score Caps Applied</h3>
        <ul class="blocker-list">
          ${metro.scoreCapReasons.map((cap) => `<li><strong>${escapeHtml(cap.code)}</strong><p>${escapeHtml(cap.reason)} Cap: ${escapeHtml(String(cap.cap))}%.</p></li>`).join("")}
        </ul>
      ` : ""}
    </section>

    <section class="category-grid" aria-label="Publisher categories">
      ${Object.values(metro.categories).map((category) => `
        <article class="category-card" id="${escapeHtml(category.key)}">
          <div class="category-card__top">
            <h3>${escapeHtml(category.label)}</h3>
            <strong>${pct(category.score)}</strong>
          </div>
          ${renderProgress(category.score)}
          <p>${escapeHtml(category.explanation)}</p>
          <dl>
            <div><dt>Completed</dt><dd>${category.completed}</dd></div>
            <div><dt>Total</dt><dd>${category.total}</dd></div>
            <div><dt>Missing</dt><dd>${category.missing}</dd></div>
            <div><dt>Issues</dt><dd>${category.issues.length}</dd></div>
          </dl>
          ${category.issues.length ? `<a href="#queue">View queue items</a>` : `<span class="quiet">No category queue items</span>`}
        </article>
      `).join("")}
    </section>

    ${renderQueue(metro.queue, token, `${metro.metroName} Work Queue`, "Tasks are sorted by severity, product impact, and category.")}
  `;
}

function renderFilters({ token, selectedMetro, selectedCategory, selectedPriority, automationOnly }) {
  return `
    <form class="filters" method="get" action="/admin/publisher">
      <input type="hidden" name="token" value="${escapeHtml(token)}">
      <label>Metro <input name="metro" value="${escapeHtml(selectedMetro || "")}" placeholder="san-francisco"></label>
      <label>Category <input name="category" value="${escapeHtml(selectedCategory || "")}" placeholder="buildingBriefs"></label>
      <label>Priority <input name="priority" value="${escapeHtml(selectedPriority || "")}" placeholder="critical, high"></label>
      <label class="checkbox"><input type="checkbox" name="automation" value="1"${automationOnly ? " checked" : ""}> Automation candidates</label>
      <button type="submit">Filter</button>
      <a href="/admin/publisher?${tokenParam(token)}">Clear</a>
    </form>
  `;
}

function renderQueue(queue, token, title, description) {
  const rows = queue.map((item) => `
    <tr>
      <td><span class="severity ${severityClass(item.severity)}">${escapeHtml(item.severity)}</span></td>
      <td>${escapeHtml(item.metroName)}</td>
      <td>${escapeHtml(item.categoryLabel)}</td>
      <td>
        <strong>${escapeHtml(item.itemName)}</strong>
        <small>${escapeHtml(item.taskType)}</small>
      </td>
      <td>${escapeHtml(item.reason)}</td>
      <td>${escapeHtml(item.suggestedNextAction)}</td>
      <td>
        ${item.publicUrl ? `<a href="${escapeHtml(item.publicUrl)}">Public</a>` : ""}
        ${item.adminUrl ? `<a href="${escapeHtml(item.adminUrl)}">Admin</a>` : ""}
        ${item.automationCandidate ? `<span class="future">Future assist</span>` : ""}
      </td>
    </tr>
  `).join("");

  return `
    <section class="panel" id="queue">
      <div class="section-header">
        <div>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(description)}</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Priority</th>
              <th>Metro</th>
              <th>Category</th>
              <th>Item</th>
              <th>Reason</th>
              <th>Next Action</th>
              <th>Links</th>
            </tr>
          </thead>
          <tbody>${rows || `<tr><td colspan="7">No queue items for this view.</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
}

function filterQueue(queue, { selectedMetro, selectedCategory, selectedPriority, automationOnly }) {
  return queue.filter((item) => {
    if (selectedMetro && item.metroId !== selectedMetro) return false;
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (selectedPriority && item.severity !== selectedPriority) return false;
    if (automationOnly && !item.automationCandidate) return false;
    return true;
  });
}

function renderPage({ token, analysis, selectedMetro, selectedCategory, selectedPriority, automationOnly }) {
  const metro = selectedMetro ? analysis.metros.find((item) => item.metroId === selectedMetro) : null;
  const filteredQueue = filterQueue(analysis.queue, { selectedMetro, selectedCategory, selectedPriority, automationOnly });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rofo Publisher | Rofo Admin</title>
  <style>
    :root { --ink: #172033; --muted: #627084; --blue: #2457d6; --border: #dbe3ef; --bg: #f5f7fb; --soft: #f8fafc; --critical: #991b1b; --high: #b45309; --medium: #1d4ed8; --low: #64748b; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--bg); font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1480px, calc(100% - 40px)); margin: 0 auto; padding: 34px 0 56px; }
    h1, h2, h3, p { margin-top: 0; }
    h1 { font-size: clamp(2rem, 4vw, 3.6rem); letter-spacing: -0.03em; margin-bottom: 10px; }
    h2 { font-size: 1.35rem; margin-bottom: 8px; }
    h3 { font-size: 1rem; margin-bottom: 8px; }
    p, small, dd { color: var(--muted); line-height: 1.5; }
    a { color: var(--blue); font-weight: 800; text-decoration: none; }
    table { width: 100%; border-collapse: collapse; font-size: 0.91rem; }
    th, td { padding: 13px 12px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
    th { color: var(--muted); font-size: 0.74rem; letter-spacing: 0.05em; text-transform: uppercase; }
    td small { display: block; margin-top: 3px; font-size: 0.78rem; }
    .hero { margin-bottom: 22px; }
    .hero p { max-width: 860px; font-size: 1.06rem; }
    .admin-nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0 26px; }
    .button-link { display: inline-flex; align-items: center; min-height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: 9px; background: #fff; color: var(--ink); font-weight: 850; }
    .button-link--active { border-color: #bfdbfe; background: #eff6ff; color: #1d4ed8; }
    .panel, .metric, .category-card { border: 1px solid var(--border); border-radius: 14px; background: #fff; box-shadow: 0 14px 40px rgba(15, 23, 42, 0.05); }
    .panel { margin-bottom: 18px; padding: 22px; }
    .metrics { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
    .metric { padding: 16px; }
    .metric span { display: block; color: var(--muted); font-size: 0.72rem; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; }
    .metric strong { display: block; margin: 8px 0 5px; font-size: 1.55rem; letter-spacing: -0.02em; }
    .metric p { margin: 0; font-size: 0.82rem; }
    .table-wrap { overflow-x: auto; }
    .progress { width: 100%; height: 8px; margin-top: 7px; border-radius: 999px; background: #edf2f7; overflow: hidden; }
    .progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #2457d6, #14b8a6); }
    .section-header { display: flex; justify-content: space-between; gap: 16px; align-items: start; margin-bottom: 14px; }
    .detail-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 0.52fr); gap: 28px; align-items: start; }
    .score { display: block; font-size: 2.8rem; letter-spacing: -0.04em; }
    .category-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
    .dimension-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
    .category-card, .dimension-card { padding: 16px; }
    .category-card__top { display: flex; align-items: start; justify-content: space-between; gap: 10px; }
    .category-card dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 14px 0; }
    .category-card dl div { border: 1px solid var(--border); border-radius: 10px; padding: 8px; background: var(--soft); }
    dt { color: var(--muted); font-size: 0.7rem; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; }
    dd { margin: 3px 0 0; color: var(--ink); font-weight: 850; }
    .category-mini { min-width: 128px; }
    .category-mini span { color: var(--muted); font-size: 0.72rem; font-weight: 800; }
    .dimension-list { display: grid; gap: 8px; min-width: 210px; }
    .dimension-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: center; }
    .dimension-row span { color: var(--muted); font-size: 0.76rem; font-weight: 800; }
    .dimension-row .progress { grid-column: 1 / -1; margin-top: 0; }
    .blocker-list { display: grid; gap: 10px; margin: 12px 0 0; padding: 0; list-style: none; }
    .blocker-list li { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--soft); }
    .blocker-list p { margin: 6px 0 0; }
    .severity, .future { display: inline-flex; padding: 4px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 900; text-transform: uppercase; }
    .is-critical { color: var(--critical); background: #fee2e2; }
    .is-high { color: var(--high); background: #fef3c7; }
    .is-medium { color: var(--medium); background: #dbeafe; }
    .is-low { color: var(--low); background: #f1f5f9; }
    .future { margin-top: 6px; color: #475569; background: #eef2f7; }
    .filters { display: flex; flex-wrap: wrap; gap: 10px; align-items: end; margin-bottom: 18px; padding: 14px; border: 1px solid var(--border); border-radius: 12px; background: #fff; }
    .filters label { display: grid; gap: 5px; color: var(--muted); font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
    .filters input { min-height: 36px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; font: inherit; }
    .filters .checkbox { display: flex; align-items: center; gap: 6px; min-height: 36px; }
    .filters button { min-height: 36px; padding: 0 14px; border: 0; border-radius: 8px; background: var(--blue); color: #fff; font-weight: 900; }
    .back-link, .quiet { display: inline-block; margin-bottom: 12px; color: var(--muted); font-size: 0.86rem; font-weight: 800; }
    @media (max-width: 1120px) { .metrics, .category-grid, .dimension-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 720px) { main { width: min(100% - 24px, 1480px); padding-top: 22px; } .metrics, .category-grid, .dimension-grid, .detail-grid { grid-template-columns: 1fr; } .panel { padding: 16px; } th, td { padding: 10px 8px; } }
  </style>
</head>
<body>
  <main>
    <header class="hero">
      <a class="back-link" href="/admin/operations?${tokenParam(token)}">Back to Operations</a>
      <h1>Rofo Publisher</h1>
      <p>Measure metro completeness, identify content and graph gaps, and plan the next highest-value expansion work without changing production data.</p>
      ${renderNav(token)}
    </header>
    ${renderFilters({ token, selectedMetro, selectedCategory, selectedPriority, automationOnly })}
    ${metro && !selectedCategory && !selectedPriority && !automationOnly ? renderMetroDetail(metro, token) : ""}
    ${metro && (selectedCategory || selectedPriority || automationOnly) ? renderQueue(filteredQueue, token, "Filtered Work Queue", "Filtered deterministic Publisher tasks.") : ""}
    ${!metro && (selectedCategory || selectedPriority || automationOnly) ? renderQueue(filteredQueue, token, "Filtered Work Queue", "Filtered deterministic Publisher tasks.") : ""}
    ${!metro && !selectedCategory && !selectedPriority && !automationOnly ? renderOverview({ analysis, token }) : ""}
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

  const analysis = snapshotAnalysis();
  if (!analysis) {
    return adminResponse(renderSnapshotError(token), 503);
  }

  return adminResponse(renderPage({
    token,
    analysis,
    selectedMetro: url.searchParams.get("metro") || "",
    selectedCategory: url.searchParams.get("category") || "",
    selectedPriority: url.searchParams.get("priority") || "",
    automationOnly: url.searchParams.get("automation") === "1",
  }));
}
