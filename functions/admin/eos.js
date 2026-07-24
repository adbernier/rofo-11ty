import eosAnalysis from "../../data/generated/eos-analysis.json";

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

function tokenParam(token) {
  return `token=${encodeURIComponent(token)}`;
}

function pct(value) {
  return `${Math.round(Number(value) || 0)}%`;
}

function progress(value, label = "progress") {
  const safeValue = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  return `
    <div class="progress" aria-label="${escapeHtml(label)} ${safeValue}%">
      <span style="width: ${safeValue}%"></span>
    </div>
  `;
}

function stars(count) {
  const safeCount = Math.max(1, Math.min(5, Math.round(Number(count) || 1)));
  return `<span class="stars" aria-label="${safeCount} of 5 priority">${"★".repeat(safeCount)}${"☆".repeat(5 - safeCount)}</span>`;
}

function statusClass(statusId) {
  return `status--${String(statusId || "planning").replace(/_/g, "-")}`;
}

function renderNav(token) {
  return `
    <nav class="admin-nav" aria-label="Admin navigation">
      <a class="button-link button-link--active" href="/admin/eos?${tokenParam(token)}">EOS</a>
      <a class="button-link" href="/admin/publisher?${tokenParam(token)}">Publisher</a>
      <a class="button-link" href="/admin/compass?${tokenParam(token)}">Rofo Compass</a>
      <a class="button-link" href="/admin/field-photos?${tokenParam(token)}">Field Photos</a>
      <a class="button-link" href="/admin/coverage?${tokenParam(token)}">Compass Coverage</a>
      <a class="button-link" href="/admin/operations?${tokenParam(token)}">Operations</a>
    </nav>
  `;
}

function renderMetric(label, value, note = "") {
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      ${note ? `<p>${escapeHtml(note)}</p>` : ""}
    </article>
  `;
}

function signalRow(signal) {
  return `
    <div class="signal-row">
      <div>
        <span>${escapeHtml(signal.label)}</span>
        <small>${escapeHtml(signal.state && signal.state.label ? signal.state.label : signal.source || "")}</small>
      </div>
      <strong>${pct(signal.score)}</strong>
      ${progress(signal.score, signal.label)}
    </div>
  `;
}

function renderMetroCard(metro, token) {
  const signals = [
    metro.publisherConfidence,
    metro.commercialEcosystemCoverage,
    metro.recommendationCoverage,
    metro.representativeBuildingCoverage,
    metro.photographyCoverage,
    metro.editorialCoverage,
    metro.internalLinking,
    metro.handbookCoverage,
  ].filter(Boolean);

  return `
    <article class="metro-card">
      <div class="metro-card__top">
        <div>
          <h2>${escapeHtml(metro.metroName)}</h2>
          <span class="status-pill ${statusClass(metro.status.id)}">${escapeHtml(metro.status.label)}</span>
        </div>
        <div class="health-score">
          <strong>${pct(metro.overallEditorialHealth.score)}</strong>
          <span>Overall Editorial Health</span>
        </div>
      </div>
      ${progress(metro.overallEditorialHealth.score, `${metro.metroName} editorial health`)}
      <div class="signal-grid">
        ${signals.map(signalRow).join("")}
      </div>
      <div class="metro-card__footer">
        <p>${escapeHtml((metro.overallEditorialHealth.rationale || [])[0] || metro.source.publisherStatus || "No immediate blocker detected.")}</p>
        <a href="/admin/eos?${tokenParam(token)}&metro=${encodeURIComponent(metro.metroId)}">View plan</a>
      </div>
    </article>
  `;
}

function renderWorkItem(item) {
  return `
    <article class="work-item">
      <div class="work-item__priority">
        ${stars(item.priorityStars)}
        <span>${escapeHtml(item.expectedEditorialImpact)} impact</span>
      </div>
      <div class="work-item__body">
        <div class="work-item__heading">
          <div>
            <span class="module-pill">${escapeHtml(item.suggestedModule.label)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.metroName)}${item.itemName ? ` · ${escapeHtml(item.itemName)}` : ""}</p>
          </div>
          <span class="automation">${escapeHtml(item.automationLevel.label)}</span>
        </div>
        <dl>
          <div><dt>Effort</dt><dd>${escapeHtml(item.estimatedEffort)}</dd></div>
          <div><dt>Confidence</dt><dd>${escapeHtml(item.confidence)}</dd></div>
          <div><dt>Status</dt><dd>${escapeHtml(item.status)}</dd></div>
          <div><dt>Category</dt><dd>${escapeHtml(item.categoryLabel)}</dd></div>
        </dl>
        <div class="why">
          <strong>Why this task</strong>
          <ul>
            ${(item.why || []).slice(0, 4).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
          </ul>
        </div>
        ${item.dependencies && item.dependencies.length ? `
          <p class="dependencies"><strong>Dependencies:</strong> ${escapeHtml(item.dependencies.join(", "))}</p>
        ` : ""}
      </div>
    </article>
  `;
}

function renderSelectedMetro(eos, metroId, token) {
  const metro = eos.metros.find((item) => item.metroId === metroId);
  if (!metro) return "";
  const queue = eos.workQueue.filter((item) => item.metroId === metroId).slice(0, 8);
  return `
    <section class="panel selected-metro">
      <a class="back-link" href="/admin/eos?${tokenParam(token)}">All metros</a>
      <div class="section-heading">
        <div>
          <h2>${escapeHtml(metro.metroName)} Editorial Plan</h2>
          <p>Health signals and work recommendations generated from Publisher, Compass, Field Mode planning, and EOS rules.</p>
        </div>
        <div class="health-score health-score--large">
          <strong>${pct(metro.overallEditorialHealth.score)}</strong>
          <span>${escapeHtml(metro.status.label)}</span>
        </div>
      </div>
      <div class="selected-grid">
        <div class="signal-grid signal-grid--detail">
          ${Object.values(metro.healthSignals).map(signalRow).join("")}
        </div>
        <div class="detail-panel">
          <h3>Examples</h3>
          <ul>
            ${(metro.examples || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || `<li>No examples available.</li>`}
          </ul>
          <h3>Commercial Ecosystem</h3>
          <p>${escapeHtml(metro.commercialEcosystemCoverage.label || "Not measured")}</p>
          <p>${escapeHtml((metro.commercialEcosystemCoverage.blockingEcosystems || []).length ? `Blocking ecosystems: ${metro.commercialEcosystemCoverage.blockingEcosystems.join(", ")}` : "No blocking ecosystem reported by Publisher.")}</p>
        </div>
      </div>
    </section>
    <section class="queue-section">
      <div class="section-heading">
        <div>
          <h2>${escapeHtml(metro.metroName)} Work Queue</h2>
          <p>Prioritized EOS items with automation level, effort, dependencies, and measurable rationale.</p>
        </div>
      </div>
      <div class="work-queue">${queue.map(renderWorkItem).join("")}</div>
    </section>
  `;
}

function renderOverview(eos, token) {
  return `
    <section class="metrics" aria-label="EOS overview">
      ${renderMetric("Metros", eos.overview.metroCount, "Publisher-configured operating markets")}
      ${renderMetric("Average Health", pct(eos.overview.averageHealth), "EOS editorial health model")}
      ${renderMetric("Need Attention", eos.overview.needsAttention, "Planning, research, or attention states")}
      ${renderMetric("Open Work", eos.overview.openWorkItems, "Generated work items")}
      ${renderMetric("Human Only", eos.overview.humanOnlyWorkItems, "Mostly Field Mode photography")}
      ${renderMetric("Autonomous Candidates", eos.overview.autonomousCandidates, "Future automation-ready work")}
    </section>

    <section class="section-heading section-heading--standalone">
      <div>
        <h2>Metro Health</h2>
        <p>Overall Editorial Health is separate from the Publisher score and combines coverage, confidence, photography, links, handbook integration, and ecosystem balance.</p>
      </div>
    </section>
    <section class="metro-grid">
      ${eos.metros.map((metro) => renderMetroCard(metro, token)).join("")}
    </section>

    <section class="queue-section">
      <div class="section-heading">
        <div>
          <h2>Priority Work Queue</h2>
          <p>EOS turns measurable gaps into work items and identifies whether Publisher can eventually automate the work.</p>
        </div>
      </div>
      <div class="work-queue">${eos.workQueue.slice(0, 12).map(renderWorkItem).join("")}</div>
    </section>
  `;
}

function renderSnapshotError(token) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>EOS Unavailable | Rofo Admin</title>
</head>
<body>
  <main>
    <h1>EOS snapshot unavailable</h1>
    <p>Run <code>npm run publisher:snapshot</code> and rebuild before opening EOS.</p>
    <p><a href="/admin/operations?${tokenParam(token)}">Back to Operations</a></p>
  </main>
</body>
</html>`;
}

function renderPage({ token, eos, selectedMetro }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Editorial Operating System | Rofo Admin</title>
  <style>
    :root { --ink: #152033; --muted: #66758b; --blue: #2457d6; --border: #dbe4ef; --bg: #f4f7fb; --card: #ffffff; --soft: #f8fafc; --green: #0f766e; --amber: #b45309; --red: #b91c1c; --purple: #6d28d9; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: radial-gradient(circle at top left, #eef5ff 0, transparent 340px), var(--bg); font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1440px, calc(100% - 40px)); margin: 0 auto; padding: 34px 0 58px; }
    h1, h2, h3, p { margin-top: 0; }
    h1 { max-width: 900px; margin-bottom: 10px; font-size: clamp(2.25rem, 4.8vw, 4.6rem); line-height: 0.98; letter-spacing: 0; }
    h2 { margin-bottom: 8px; font-size: 1.35rem; letter-spacing: 0; }
    h3 { margin-bottom: 6px; font-size: 1.05rem; letter-spacing: 0; }
    p, li, dd, small { color: var(--muted); line-height: 1.5; }
    a { color: var(--blue); font-weight: 850; text-decoration: none; }
    .hero { margin-bottom: 24px; }
    .hero p { max-width: 840px; font-size: 1.08rem; }
    .admin-nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0 0; }
    .button-link { display: inline-flex; align-items: center; min-height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--card); color: var(--ink); font-weight: 850; }
    .button-link--active { border-color: #bfdbfe; background: #eff6ff; color: #1d4ed8; }
    .metrics { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; margin: 22px 0; }
    .metric-card, .metro-card, .panel, .work-item { border: 1px solid var(--border); border-radius: 18px; background: rgba(255, 255, 255, 0.94); box-shadow: 0 16px 44px rgba(15, 23, 42, 0.055); }
    .metric-card { padding: 16px; }
    .metric-card span, dt { display: block; color: var(--muted); font-size: 0.72rem; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; }
    .metric-card strong { display: block; margin: 8px 0 5px; font-size: 1.55rem; letter-spacing: 0; }
    .metric-card p { margin: 0; font-size: 0.82rem; }
    .section-heading { display: flex; justify-content: space-between; gap: 16px; align-items: start; margin: 0 0 14px; }
    .section-heading--standalone { margin-top: 8px; }
    .section-heading p { max-width: 760px; margin-bottom: 0; }
    .metro-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; }
    .metro-card { display: grid; gap: 14px; padding: 18px; }
    .metro-card__top { display: flex; justify-content: space-between; gap: 18px; align-items: start; }
    .metro-card__top h2 { margin-bottom: 8px; }
    .health-score { min-width: 116px; text-align: right; }
    .health-score strong { display: block; color: #0f172a; font-size: 2rem; line-height: 1; letter-spacing: 0; }
    .health-score span { color: var(--muted); font-size: 0.74rem; font-weight: 850; }
    .health-score--large strong { font-size: 2.8rem; }
    .status-pill, .module-pill, .automation { display: inline-flex; align-items: center; width: fit-content; border-radius: 999px; font-size: 0.72rem; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; }
    .status-pill { padding: 5px 9px; }
    .module-pill { padding: 4px 8px; color: #1e3a8a; background: #dbeafe; }
    .automation { padding: 6px 9px; color: #334155; background: #eef2f7; white-space: nowrap; }
    .status--ready { color: var(--green); background: #ccfbf1; }
    .status--improving { color: #1d4ed8; background: #dbeafe; }
    .status--needs-attention { color: var(--amber); background: #fef3c7; }
    .status--planning { color: var(--purple); background: #ede9fe; }
    .status--research { color: var(--red); background: #fee2e2; }
    .progress { height: 9px; border-radius: 999px; background: #e9eef6; overflow: hidden; }
    .progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #2457d6, #14b8a6); }
    .signal-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
    .signal-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 7px 10px; padding: 10px; border: 1px solid #e5edf7; border-radius: 12px; background: var(--soft); }
    .signal-row span { display: block; color: #334155; font-size: 0.82rem; font-weight: 850; }
    .signal-row small { display: block; margin-top: 2px; font-size: 0.74rem; }
    .signal-row strong { font-size: 0.9rem; }
    .signal-row .progress { grid-column: 1 / -1; height: 6px; }
    .metro-card__footer { display: flex; justify-content: space-between; gap: 16px; align-items: center; padding-top: 2px; }
    .metro-card__footer p { margin-bottom: 0; font-size: 0.88rem; }
    .queue-section, .panel { margin-top: 20px; }
    .panel { padding: 20px; }
    .work-queue { display: grid; gap: 12px; }
    .work-item { display: grid; grid-template-columns: 124px minmax(0, 1fr); gap: 16px; padding: 16px; }
    .work-item__priority { display: grid; align-content: start; gap: 7px; }
    .stars { color: #f59e0b; font-size: 1.05rem; letter-spacing: 0; }
    .work-item__priority span:last-child { color: var(--muted); font-size: 0.78rem; font-weight: 850; }
    .work-item__heading { display: flex; justify-content: space-between; gap: 14px; align-items: start; }
    .work-item__heading h3 { margin-top: 7px; margin-bottom: 4px; font-size: 1.15rem; }
    .work-item__heading p { margin-bottom: 0; font-size: 0.9rem; }
    dl { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 14px 0; }
    dl div { padding: 9px; border: 1px solid #e5edf7; border-radius: 10px; background: var(--soft); }
    dd { margin: 3px 0 0; color: var(--ink); font-weight: 850; }
    .why { padding: 12px; border-radius: 12px; background: #f8fafc; border: 1px solid #e5edf7; }
    .why strong { display: block; margin-bottom: 7px; }
    .why ul { display: grid; gap: 5px; margin: 0; padding-left: 18px; }
    .dependencies { margin: 10px 0 0; font-size: 0.88rem; }
    .back-link { display: inline-flex; margin-bottom: 12px; color: var(--muted); font-size: 0.86rem; font-weight: 850; }
    .selected-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 16px; align-items: start; }
    .signal-grid--detail { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .detail-panel { padding: 14px; border: 1px solid #e5edf7; border-radius: 14px; background: var(--soft); }
    .detail-panel ul { margin-top: 0; padding-left: 18px; }
    @media (max-width: 1100px) { .metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); } .metro-grid { grid-template-columns: 1fr; } }
    @media (max-width: 760px) {
      main { width: min(100% - 24px, 1440px); padding-top: 24px; }
      .metrics, .signal-grid, .signal-grid--detail, .selected-grid, dl { grid-template-columns: 1fr; }
      .metro-card__top, .metro-card__footer, .section-heading, .work-item__heading { flex-direction: column; }
      .health-score { text-align: left; }
      .work-item { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header class="hero">
      <h1>Editorial Operating System</h1>
      <p>EOS is Rofo's planning layer for commercial knowledge. It measures metro health, turns gaps into prioritized work, and shows which module should handle the next editorial decision.</p>
      ${renderNav(token)}
    </header>
    ${selectedMetro ? renderSelectedMetro(eos, selectedMetro, token) : renderOverview(eos, token)}
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

  if (!eosAnalysis || !Array.isArray(eosAnalysis.metros)) {
    return adminResponse(renderSnapshotError(token), 503);
  }

  return adminResponse(renderPage({
    token,
    eos: eosAnalysis,
    selectedMetro: url.searchParams.get("metro") || "",
  }));
}
