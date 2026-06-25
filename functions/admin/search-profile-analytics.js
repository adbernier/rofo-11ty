import {
  ensureSearchProfileEventsTable,
  scheduleSearchProfileEventIndexes,
} from "../_shared/search-profile-events.js";

const DEFAULT_LOOKBACK_DAYS = 7;
const MAX_LOOKBACK_DAYS = 90;
const RECENT_EVENTS_LIMIT = 50;
const RECENT_SUBMISSIONS_LIMIT = 20;
const ANALYTICS_SAMPLE_LIMIT = 1000;
const TOP_LIST_LIMIT = 10;
const PROFILE_DIMENSION_SAMPLE_LIMIT = 500;

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

function renderTopRows(rows, columns, emptyMessage = "No data yet.") {
  if (!rows.length) {
    return `<tr><td colspan="${columns.length}" class="empty-cell">${escapeHtml(emptyMessage)}</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${columns.map((column) => {
        const value = typeof column.value === "function" ? column.value(row) : row[column.key];
        return column.link ? linkCell(value) : tableCell(value);
      }).join("")}
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

function renderFunnelInsightRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="5" class="empty-cell">No funnel data yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(row.step)}
      ${tableCell(row.count)}
      ${tableCell(row.completion)}
      ${tableCell(row.dropoff)}
      ${tableCell(row.avg_time)}
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

function normalizeAggregateRows(rows, labelKey) {
  return rows.map((row) => ({
    ...row,
    [labelKey]: row[labelKey] || "unknown",
    started: Number(row.started || 0),
    submitted: Number(row.submitted || 0),
  }));
}

function buildFunnelInsights(funnel, stepCounts, stepDurations = {}) {
  const ordered = [
    ["Started", funnel.started || 0, "search_profile_started"],
    ["Location completed", stepCounts.location_completed || 0, "location_completed"],
    ["Space type completed", stepCounts.space_type_completed || 0, "space_type_completed"],
    ["Timing completed", stepCounts.timing_completed || 0, "timing_completed"],
    ["Size completed", stepCounts.size_completed || 0, "size_completed"],
    ["Features completed", stepCounts.features_completed || 0, "features_completed"],
    ["Contact completed", stepCounts.contact_completed || 0, "contact_completed"],
    ["Submitted", funnel.submitted || 0, "search_profile_submitted"],
  ];
  const started = Number(funnel.started || 0);
  let previous = started;

  return ordered.map(([step, count, eventName], index) => {
    const numericCount = Number(count || 0);
    const dropoff = index === 0 ? 0 : Math.max(0, previous - numericCount);
    previous = numericCount;
    const avgMs = Number(stepDurations[eventName] || 0);
    return {
      step,
      count: numericCount,
      completion: percent(numericCount, started),
      dropoff: index === 0 ? "—" : percent(dropoff, Math.max(previous + dropoff, 0)),
      avg_time: avgMs ? `${Math.round(avgMs / 1000)}s` : "—",
    };
  });
}

function topFeaturesFromRows(rows) {
  const counts = new Map();
  for (const row of rows) {
    String(row.features || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((feature) => counts.set(feature, (counts.get(feature) || 0) + 1));
  }
  return Array.from(counts.entries())
    .map(([feature, submitted]) => ({ feature, submitted }))
    .sort((a, b) => b.submitted - a.submitted || a.feature.localeCompare(b.feature))
    .slice(0, TOP_LIST_LIMIT);
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

function renderPage({
  token,
  lookbackDays = DEFAULT_LOOKBACK_DAYS,
  mode = "fast",
  emptyMessage = "",
  errors = [],
  funnel = {},
  stepCounts = {},
  funnelInsights = [],
  pageTypes = [],
  topPages = [],
  topDistricts = [],
  topComparisons = [],
  topCities = [],
  topEcosystems = [],
  topSpaceTypes = [],
  topFeatures = [],
  topTimings = [],
  topSizes = [],
  topLandingPages = [],
  submissionSources = [],
  recentEvents = [],
  recentSubmissions = [],
}) {
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
    .panel-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 680px; }
    th, td { padding: 10px 8px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; font-size: 14px; }
    td { overflow-wrap: anywhere; }
    tr:last-child td { border-bottom: 0; }
    .empty-cell { color: var(--muted); font-style: italic; }
    @media (max-width: 860px) {
      header { display: grid; }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .panel-grid { grid-template-columns: 1fr; }
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
      <h2>Funnel Insights</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Step</th><th>Count</th><th>Completion</th><th>Drop-off from previous</th><th>Avg time from start</th></tr></thead>
          <tbody>${renderFunnelInsightRows(funnelInsights)}</tbody>
        </table>
      </div>
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
      <h2>Top Pages</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Page</th><th>Page type</th><th>Started</th><th>Submitted</th><th>Submit rate</th></tr></thead>
          <tbody>${renderTopRows(topPages, [
            { key: "page_url", link: true },
            { key: "page_type" },
            { key: "started" },
            { key: "submitted" },
            { value: (row) => percent(row.submitted, row.started) },
          ])}</tbody>
        </table>
      </div>
    </section>
    <div class="panel-grid">
      <section class="panel">
        <h2>Top Districts</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>District</th><th>Started</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topDistricts, [{ key: "district" }, { key: "started" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <h2>Top Cities</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>City</th><th>Started</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topCities, [{ key: "city" }, { key: "started" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
    </div>
    <section class="panel">
      <h2>Top Comparison Pages</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Comparison</th><th>Started</th><th>Submitted</th><th>Submit rate</th></tr></thead>
          <tbody>${renderTopRows(topComparisons, [
            { key: "page_url", link: true },
            { key: "started" },
            { key: "submitted" },
            { value: (row) => percent(row.submitted, row.started) },
          ])}</tbody>
        </table>
      </div>
    </section>
    <div class="panel-grid">
      <section class="panel">
        <h2>Top Ecosystems</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Ecosystem</th><th>Started</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topEcosystems, [{ key: "business_ecosystem" }, { key: "started" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <h2>Submission Sources</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Source page</th><th>Page type</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(submissionSources, [{ key: "page_url", link: true }, { key: "page_type" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
    </div>
    <div class="panel-grid">
      <section class="panel">
        <h2>Top Space Types</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Space type</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topSpaceTypes, [{ key: "space_type" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <h2>Top Move-in Timings</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Timing</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topTimings, [{ key: "timing" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <h2>Top Size Requests</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Size / people</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topSizes, [{ key: "size_or_people" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
      <section class="panel">
        <h2>Top Requested Features</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Feature</th><th>Submitted</th></tr></thead>
            <tbody>${renderTopRows(topFeatures, [{ key: "feature" }, { key: "submitted" }])}</tbody>
          </table>
        </div>
      </section>
    </div>
    <section class="panel">
      <h2>Top Landing Pages</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Landing page</th><th>Submitted</th></tr></thead>
          <tbody>${renderTopRows(topLandingPages, [{ key: "landing_page", link: true }, { key: "submitted" }])}</tbody>
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

  const eventCounts = await runAnalyticsQuery(db, "Event counts", `
    select event_name, count(*) as count, avg(nullif(duration_ms, 0)) as avg_duration_ms
    from search_profile_events
    where created_at >= ?
    group by event_name
    limit 20
  `, [lookbackStart], errors);

  const funnel = { viewed: includeViewed ? 0 : null, started: 0, submitted: 0 };
  const stepCounts = {};
  const stepDurations = {};
  for (const row of eventCounts) {
    if (row.event_name === "search_profile_viewed") funnel.viewed = Number(row.count || 0);
    if (row.event_name === "search_profile_started") funnel.started = Number(row.count || 0);
    if (row.event_name === "search_profile_submitted") funnel.submitted = Number(row.count || 0);
    if (String(row.event_name || "").endsWith("_completed")) stepCounts[row.event_name] = Number(row.count || 0);
    stepDurations[row.event_name] = Number(row.avg_duration_ms || 0);
  }

  const sampleRows = await runAnalyticsQuery(db, "Recent analytics sample", `
    select created_at, event_name, page_type, location_display, space_type, page_url
    from search_profile_events
    where created_at >= ?
      ${includeViewed ? "" : "and event_name != 'search_profile_viewed'"}
    order by created_at desc
    limit ?
  `, [lookbackStart, ANALYTICS_SAMPLE_LIMIT], errors);

  const sampleSummary = summarizeRows(sampleRows, includeViewed);
  if (!eventCounts.length) {
    funnel.viewed = sampleSummary.funnel.viewed;
    funnel.started = sampleSummary.funnel.started;
    funnel.submitted = sampleSummary.funnel.submitted;
    Object.assign(stepCounts, sampleSummary.stepCounts);
  }

  const pageTypes = await runAnalyticsQuery(db, "Page type breakdown", `
    select page_type,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_started', 'search_profile_submitted')
    group by page_type
    order by submitted desc, started desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topPages = await runAnalyticsQuery(db, "Top pages", `
    select page_url, page_type,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_started', 'search_profile_submitted')
      and page_url != ''
    group by page_url, page_type
    order by submitted desc, started desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topDistricts = await runAnalyticsQuery(db, "Top districts", `
    select district,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_started', 'search_profile_submitted')
      and district != ''
    group by district
    order by submitted desc, started desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topComparisons = await runAnalyticsQuery(db, "Top comparison pages", `
    select page_url,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and page_type = 'comparison'
      and event_name in ('search_profile_started', 'search_profile_submitted')
      and page_url != ''
    group by page_url
    order by submitted desc, started desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topCities = await runAnalyticsQuery(db, "Top cities", `
    select city,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_started', 'search_profile_submitted')
      and city != ''
    group by city
    order by submitted desc, started desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topEcosystems = await runAnalyticsQuery(db, "Top ecosystems", `
    select business_ecosystem,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name in ('search_profile_started', 'search_profile_submitted')
      and business_ecosystem != ''
    group by business_ecosystem
    order by submitted desc, started desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topSpaceTypes = await runAnalyticsQuery(db, "Top space types", `
    select space_type, count(*) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name = 'search_profile_submitted'
      and space_type != ''
    group by space_type
    order by submitted desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topTimings = await runAnalyticsQuery(db, "Top move-in timings", `
    select timing, count(*) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name = 'search_profile_submitted'
      and timing != ''
    group by timing
    order by submitted desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topSizes = await runAnalyticsQuery(db, "Top size requests", `
    select size_or_people, count(*) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name = 'search_profile_submitted'
      and size_or_people != ''
    group by size_or_people
    order by submitted desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const topLandingPages = await runAnalyticsQuery(db, "Top landing pages", `
    select landing_page, count(*) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name = 'search_profile_submitted'
      and landing_page != ''
    group by landing_page
    order by submitted desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const submissionSources = await runAnalyticsQuery(db, "Submission sources", `
    select page_url, page_type, count(*) as submitted
    from search_profile_events
    where created_at >= ?
      and event_name = 'search_profile_submitted'
      and page_url != ''
    group by page_url, page_type
    order by submitted desc
    limit ?
  `, [lookbackStart, TOP_LIST_LIMIT], errors);

  const featureRows = await runAnalyticsQuery(db, "Requested features", `
    select features
    from search_profile_events
    where created_at >= ?
      and event_name = 'search_profile_submitted'
      and features != ''
    order by created_at desc
    limit ?
  `, [lookbackStart, PROFILE_DIMENSION_SAMPLE_LIMIT], errors);

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
    funnel,
    stepCounts,
    funnelInsights: buildFunnelInsights(funnel, stepCounts, stepDurations),
    pageTypes: normalizeAggregateRows(pageTypes, "page_type"),
    topPages: normalizeAggregateRows(topPages, "page_url"),
    topDistricts: normalizeAggregateRows(topDistricts, "district"),
    topComparisons: normalizeAggregateRows(topComparisons, "page_url"),
    topCities: normalizeAggregateRows(topCities, "city"),
    topEcosystems: normalizeAggregateRows(topEcosystems, "business_ecosystem"),
    topSpaceTypes,
    topFeatures: topFeaturesFromRows(featureRows),
    topTimings,
    topSizes,
    topLandingPages,
    submissionSources,
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

  try {
    await ensureSearchProfileEventsTable(db);
    scheduleSearchProfileEventIndexes(waitUntil, db);
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
