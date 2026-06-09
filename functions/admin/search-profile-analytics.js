import { scheduleSearchProfileEventIndexes } from "../_shared/search-profile-events.js";

const DEFAULT_LOOKBACK_DAYS = 7;
const MAX_LOOKBACK_DAYS = 90;
const RECENT_EVENTS_LIMIT = 50;
const RECENT_SUBMISSIONS_LIMIT = 20;
const ANALYTICS_SAMPLE_LIMIT = 1000;

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function adminResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function percent(numerator, denominator) {
  const top = Number(numerator || 0);
  const bottom = Number(denominator || 0);
  if (!bottom) return "0%";
  return `${Math.round((top / bottom) * 100)}%`;
}

function getAnalyticsDb(env) {
  return env.SEARCH_PROFILE_EVENTS_DB || env.LEADS_DB;
}

function isMissingTableError(error) {
  return /no such table|search_profile_events/i.test(String(error && error.message || ""));
}

function normalizeLookbackDays(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LOOKBACK_DAYS;
  return Math.min(Math.floor(parsed), MAX_LOOKBACK_DAYS);
}

function normalizeMode(value) {
  return value === "detail" ? "detail" : "fast";
}

function lookbackStartIso(days) {
  const date = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  return date.toISOString();
}

function tableCell(value) {
  return `<td>${escapeHtml(value === undefined || value === null || value === "" ? "—" : value)}</td>`;
}

function linkCell(value) {
  if (!value) return "<td>—</td>";
  const safeValue = escapeHtml(value);
  return `<td><a href="${safeValue}" target="_blank" rel="noopener">${safeValue}</a></td>`;
}

function metricCard(label, value, helper = "") {
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      ${helper ? `<small>${escapeHtml(helper)}</small>` : ""}
    </article>
  `;
}

function metricValue(value) {
  return value === null || value === undefined ? "Not queried" : value;
}

function renderEventRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="6" class="empty-cell">No events yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(formatDate(row.created_at))}
      ${tableCell(row.event_name)}
      ${tableCell(row.page_type)}
      ${tableCell(row.location_display)}
      ${tableCell(row.space_type)}
      ${linkCell(row.page_url)}
    </tr>
  `).join("");
}

function renderSubmissionRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="7" class="empty-cell">No submissions yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(formatDate(row.created_at))}
      ${tableCell(row.page_type)}
      ${tableCell(row.location_display)}
      ${tableCell(row.space_type)}
      ${tableCell(row.city)}
      ${tableCell(row.district)}
      ${linkCell(row.page_url)}
    </tr>
  `).join("");
}

function renderPageTypeRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="4" class="empty-cell">No page type data yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(row.page_type || "unknown")}
      ${tableCell(row.started || 0)}
      ${tableCell(row.submitted || 0)}
      ${tableCell(percent(row.submitted, row.started))}
    </tr>
  `).join("");
}

function renderStepRows(stepCounts) {
  const steps = [
    "location_completed",
    "space_type_completed",
    "timing_completed",
    "size_completed",
    "features_completed",
    "contact_completed",
  ];

  return steps.map((step) => `
    <tr>
      ${tableCell(step)}
      ${tableCell(stepCounts[step] || 0)}
    </tr>
  `).join("");
}

function summarizeRows(rows, includeViewed = false) {
  const funnel = { viewed: includeViewed ? 0 : null, started: 0, submitted: 0 };
  const stepCounts = {};
  const pageTypes = new Map();
  const stepEvents = new Set([
    "location_completed",
    "space_type_completed",
    "timing_completed",
    "size_completed",
    "features_completed",
    "contact_completed",
  ]);

  for (const row of rows) {
    if (includeViewed && row.event_name === "search_profile_viewed") {
      funnel.viewed += 1;
    }
    if (row.event_name === "search_profile_started") {
      funnel.started += 1;
    }
    if (row.event_name === "search_profile_submitted") {
      funnel.submitted += 1;
    }
    if (stepEvents.has(row.event_name)) {
      stepCounts[row.event_name] = (stepCounts[row.event_name] || 0) + 1;
    }
    if (row.event_name === "search_profile_started" || row.event_name === "search_profile_submitted") {
      const pageType = row.page_type || "unknown";
      const current = pageTypes.get(pageType) || { page_type: pageType, started: 0, submitted: 0 };
      if (row.event_name === "search_profile_started") current.started += 1;
      if (row.event_name === "search_profile_submitted") current.submitted += 1;
      pageTypes.set(pageType, current);
    }
  }

  return {
    funnel,
    stepCounts,
    pageTypes: Array.from(pageTypes.values())
      .sort((a, b) => (b.submitted - a.submitted) || (b.started - a.started))
      .slice(0, 50),
  };
}

function renderEmptyState(token, lookbackDays = DEFAULT_LOOKBACK_DAYS) {
  return renderPage({
    token,
    lookbackDays,
    mode: "fast",
    emptyMessage: "No Search Profile analytics table exists yet. Events will appear here after the first Search Profile event is stored.",
    funnel: { viewed: 0, started: 0, submitted: 0 },
    stepCounts: {},
    pageTypes: [],
    recentEvents: [],
    recentSubmissions: [],
  });
}

function renderPage({ token, lookbackDays = DEFAULT_LOOKBACK_DAYS, mode = "fast", emptyMessage = "", errors = [], funnel = {}, stepCounts = {}, pageTypes = [], recentEvents = [], recentSubmissions = [] }) {
  const safeMode = normalizeMode(mode);
  const adminBaseUrl = `/admin/search-profile-analytics?token=${encodeURIComponent(token)}`;
  const rangeBaseUrl = `${adminBaseUrl}&mode=${encodeURIComponent(safeMode)}`;
  const modeBaseUrl = `${adminBaseUrl}&days=${encodeURIComponent(lookbackDays)}`;
  const recentEventsNote = safeMode === "fast"
    ? `Fast mode summarizes the latest ${ANALYTICS_SAMPLE_LIMIT} non-view events and excludes high-volume viewed events.`
    : `Detail mode includes viewed events in a bounded ${ANALYTICS_SAMPLE_LIMIT}-row sample.`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Search Profile Analytics | Rofo Admin</title>
  <style>
    :root { color-scheme: light; --bg: #f6f8fb; --ink: #172033; --muted: #607083; --border: #d9e2ec; --blue: #173f8a; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--bg); color: var(--ink); }
    a { color: #174ea6; }
    .shell { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 52px; }
    header { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; margin-bottom: 20px; }
    h1 { margin: 0 0 6px; font-size: clamp(28px, 4vw, 42px); line-height: 1.05; }
    h2 { margin: 0 0 12px; font-size: 20px; }
    p { margin: 0; color: var(--muted); }
    .admin-link { display: inline-flex; align-items: center; min-height: 40px; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px; background: #fff; font-weight: 800; text-decoration: none; }
    .notice { margin: 0 0 16px; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px; background: #eff6ff; color: #1e3a8a; font-weight: 700; }
    .notice--error { border-color: #fecdd3; background: #fff1f2; color: #9f1239; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 0; }
    .toolbar a { display: inline-flex; min-height: 34px; align-items: center; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: #fff; color: var(--ink); font-size: 13px; font-weight: 800; text-decoration: none; }
    .toolbar a.is-active { border-color: var(--blue); color: var(--blue); box-shadow: 0 0 0 2px rgba(23, 63, 138, .12); }
    .metrics { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 20px 0; }
    .metric-card, .panel { background: #fff; border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 8px 24px rgba(23, 32, 51, .06); }
    .metric-card { display: grid; gap: 6px; padding: 16px; }
    .metric-card span, th { color: var(--muted); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
    .metric-card strong { font-size: 30px; line-height: 1; }
    .metric-card small { color: var(--muted); }
    .panel { padding: 18px; margin: 16px 0; overflow: hidden; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 680px; }
    th, td { padding: 10px 8px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; font-size: 14px; }
    td { overflow-wrap: anywhere; }
    tr:last-child td { border-bottom: 0; }
    .empty-cell { color: var(--muted); font-style: italic; }
    @media (max-width: 860px) {
      header { display: grid; }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 560px) {
      .metrics { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div>
        <h1>Search Profile Analytics</h1>
        <p>Lightweight funnel events for Search Profile V1D. Showing the last ${escapeHtml(lookbackDays)} day${lookbackDays === 1 ? "" : "s"}.</p>
        <nav class="toolbar" aria-label="Analytics date range">
          <a class="${lookbackDays === 7 ? "is-active" : ""}" href="${rangeBaseUrl}&days=7">7 days</a>
          <a class="${lookbackDays === 30 ? "is-active" : ""}" href="${rangeBaseUrl}&days=30">30 days</a>
          <a class="${lookbackDays === 90 ? "is-active" : ""}" href="${rangeBaseUrl}&days=90">90 days</a>
          <a class="${safeMode === "fast" ? "is-active" : ""}" href="${modeBaseUrl}&mode=fast">Fast mode</a>
          <a class="${safeMode === "detail" ? "is-active" : ""}" href="${modeBaseUrl}&mode=detail">Detailed events</a>
        </nav>
      </div>
      <a class="admin-link" href="/admin/leads?token=${encodeURIComponent(token)}">Lead dashboard</a>
    </header>
    ${emptyMessage ? `<div class="notice">${escapeHtml(emptyMessage)}</div>` : ""}
    ${errors.length ? `<div class="notice notice--error"><strong>Some analytics queries failed.</strong><br>${errors.map((error) => escapeHtml(error)).join("<br>")}</div>` : ""}
    <section class="metrics" aria-label="Funnel summary">
      ${metricCard("Viewed", metricValue(funnel.viewed))}
      ${metricCard("Started", metricValue(funnel.started || 0))}
      ${metricCard("Submitted", metricValue(funnel.submitted || 0))}
      ${metricCard("Start rate", funnel.viewed === null ? "Not queried" : percent(funnel.started, funnel.viewed), funnel.viewed === null ? "viewed skipped in fast mode" : "started / viewed")}
      ${metricCard("Submit rate", percent(funnel.submitted, funnel.started), "submitted / started")}
    </section>
    <section class="panel">
      <h2>Step Counts</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Step event</th><th>Count</th></tr></thead>
          <tbody>${renderStepRows(stepCounts)}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Page Type Breakdown</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Page type</th><th>Started</th><th>Submitted</th><th>Submit rate</th></tr></thead>
          <tbody>${renderPageTypeRows(pageTypes)}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Recent Events</h2>
      <p>${escapeHtml(recentEventsNote)}</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Created</th><th>Event</th><th>Page type</th><th>Location</th><th>Space type</th><th>Page URL</th></tr></thead>
          <tbody>${renderEventRows(recentEvents)}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Recent Submissions</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Created</th><th>Page type</th><th>Location</th><th>Space type</th><th>City</th><th>District</th><th>Page URL</th></tr></thead>
          <tbody>${renderSubmissionRows(recentSubmissions)}</tbody>
        </table>
      </div>
    </section>
  </main>
</body>
</html>`;
}

async function runAnalyticsQuery(db, label, query, bindings, errors) {
  try {
    const result = await db.prepare(query).bind(...bindings).all();
    return result.results || [];
  } catch (error) {
    if (isMissingTableError(error)) throw error;
    errors.push(`${label}: ${error.message || "query failed"}`);
    return [];
  }
}

async function fetchAnalytics(db, options = {}) {
  const lookbackDays = normalizeLookbackDays(options.lookbackDays);
  const mode = normalizeMode(options.mode);
  const lookbackStart = lookbackStartIso(lookbackDays);
  const errors = [];
  const includeViewed = mode === "detail";

  const sampleRows = await runAnalyticsQuery(db, "Recent analytics sample", `
    select created_at, event_name, page_type, location_display, space_type, page_url
    from search_profile_events
    where created_at >= ?
      ${includeViewed ? "" : "and event_name != 'search_profile_viewed'"}
    order by created_at desc
    limit ?
  `, [lookbackStart, ANALYTICS_SAMPLE_LIMIT], errors);

  const summary = summarizeRows(sampleRows, includeViewed);

  const recentSubmissions = await runAnalyticsQuery(db, "Recent submissions", `
    select created_at, page_type, location_display, space_type, city, district, page_url
    from search_profile_events
    where event_name = 'search_profile_submitted'
      and created_at >= ?
    order by created_at desc
    limit ?
  `, [lookbackStart, RECENT_SUBMISSIONS_LIMIT], errors);

  return {
    lookbackDays,
    mode,
    errors,
    funnel: summary.funnel,
    stepCounts: summary.stepCounts,
    pageTypes: summary.pageTypes,
    recentEvents: sampleRows.slice(0, RECENT_EVENTS_LIMIT),
    recentSubmissions,
  };
}

export async function onRequestGet({ request, env, waitUntil }) {
  const configuredToken = env.ADMIN_DASHBOARD_TOKEN;
  if (!configuredToken) {
    return adminResponse("Admin dashboard is not configured.", 403);
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const lookbackDays = normalizeLookbackDays(url.searchParams.get("days"));
  const mode = normalizeMode(url.searchParams.get("mode"));
  if (token !== configuredToken) {
    return adminResponse("Forbidden", 403);
  }

  const db = getAnalyticsDb(env);
  if (!db) {
    return adminResponse("<h1>Search Profile Analytics</h1><p>SEARCH_PROFILE_EVENTS_DB or LEADS_DB D1 binding is not configured.</p>", 500);
  }
  scheduleSearchProfileEventIndexes(waitUntil, db);

  try {
    const data = await fetchAnalytics(db, { lookbackDays, mode });
    return adminResponse(renderPage({ token, ...data }));
  } catch (error) {
    if (isMissingTableError(error)) {
      return adminResponse(renderEmptyState(token, lookbackDays));
    }
    return adminResponse(renderPage({
      token,
      lookbackDays,
      mode,
      errors: [error.message || "Search Profile analytics failed before data could be loaded."],
      funnel: { viewed: 0, started: 0, submitted: 0 },
      stepCounts: {},
      pageTypes: [],
      recentEvents: [],
      recentSubmissions: [],
    }), 200);
  }
}
