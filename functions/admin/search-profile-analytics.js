import { escapeHtml } from "../api/leads/_shared.js";

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
    return `<tr><td colspan="5" class="empty-cell">No page type data yet.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${tableCell(row.page_type || "unknown")}
      ${tableCell(row.viewed || 0)}
      ${tableCell(row.started || 0)}
      ${tableCell(row.submitted || 0)}
      ${tableCell(percent(row.submitted, row.viewed))}
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

function renderEmptyState(token) {
  return renderPage({
    token,
    emptyMessage: "No Search Profile analytics table exists yet. Events will appear here after the first Search Profile event is stored.",
    funnel: { viewed: 0, started: 0, submitted: 0 },
    stepCounts: {},
    pageTypes: [],
    recentEvents: [],
    recentSubmissions: [],
  });
}

function renderPage({ token, emptyMessage = "", funnel, stepCounts, pageTypes, recentEvents, recentSubmissions }) {
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
        <p>Lightweight funnel events for Search Profile V1D.</p>
      </div>
      <a class="admin-link" href="/admin/leads?token=${encodeURIComponent(token)}">Lead dashboard</a>
    </header>
    ${emptyMessage ? `<div class="notice">${escapeHtml(emptyMessage)}</div>` : ""}
    <section class="metrics" aria-label="Funnel summary">
      ${metricCard("Viewed", funnel.viewed || 0)}
      ${metricCard("Started", funnel.started || 0)}
      ${metricCard("Submitted", funnel.submitted || 0)}
      ${metricCard("Start rate", percent(funnel.started, funnel.viewed), "started / viewed")}
      ${metricCard("Submit rate", percent(funnel.submitted, funnel.viewed), "submitted / viewed")}
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
          <thead><tr><th>Page type</th><th>Viewed</th><th>Started</th><th>Submitted</th><th>Submit rate</th></tr></thead>
          <tbody>${renderPageTypeRows(pageTypes)}</tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <h2>Recent Events</h2>
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

async function fetchAnalytics(db) {
  const funnelResult = await db.prepare(`
    select event_name, count(*) as count
    from search_profile_events
    where event_name in ('search_profile_viewed', 'search_profile_started', 'search_profile_submitted')
    group by event_name
  `).all();

  const funnel = { viewed: 0, started: 0, submitted: 0 };
  for (const row of funnelResult.results || []) {
    if (row.event_name === "search_profile_viewed") funnel.viewed = Number(row.count || 0);
    if (row.event_name === "search_profile_started") funnel.started = Number(row.count || 0);
    if (row.event_name === "search_profile_submitted") funnel.submitted = Number(row.count || 0);
  }

  const stepResult = await db.prepare(`
    select event_name, count(*) as count
    from search_profile_events
    where event_name in (
      'location_completed', 'space_type_completed', 'timing_completed',
      'size_completed', 'features_completed', 'contact_completed'
    )
    group by event_name
  `).all();
  const stepCounts = {};
  for (const row of stepResult.results || []) {
    stepCounts[row.event_name] = Number(row.count || 0);
  }

  const pageTypesResult = await db.prepare(`
    select
      coalesce(nullif(page_type, ''), 'unknown') as page_type,
      sum(case when event_name = 'search_profile_viewed' then 1 else 0 end) as viewed,
      sum(case when event_name = 'search_profile_started' then 1 else 0 end) as started,
      sum(case when event_name = 'search_profile_submitted' then 1 else 0 end) as submitted
    from search_profile_events
    group by coalesce(nullif(page_type, ''), 'unknown')
    order by submitted desc, started desc, viewed desc
  `).all();

  const recentEventsResult = await db.prepare(`
    select created_at, event_name, page_type, location_display, space_type, page_url
    from search_profile_events
    order by created_at desc
    limit 100
  `).all();

  const recentSubmissionsResult = await db.prepare(`
    select created_at, page_type, location_display, space_type, city, district, page_url
    from search_profile_events
    where event_name = 'search_profile_submitted'
    order by created_at desc
    limit 25
  `).all();

  return {
    funnel,
    stepCounts,
    pageTypes: pageTypesResult.results || [],
    recentEvents: recentEventsResult.results || [],
    recentSubmissions: recentSubmissionsResult.results || [],
  };
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

  const db = getAnalyticsDb(env);
  if (!db) {
    return adminResponse("<h1>Search Profile Analytics</h1><p>SEARCH_PROFILE_EVENTS_DB or LEADS_DB D1 binding is not configured.</p>", 500);
  }

  try {
    const data = await fetchAnalytics(db);
    return adminResponse(renderPage({ token, ...data }));
  } catch (error) {
    if (isMissingTableError(error)) {
      return adminResponse(renderEmptyState(token));
    }
    return adminResponse(`<h1>Search Profile analytics error</h1><p>${escapeHtml(error.message)}</p>`, 500);
  }
}
