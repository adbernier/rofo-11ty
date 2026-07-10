import { escapeHtml } from "../api/leads/_shared.js";

const KPI_WINDOWS = [7, 30];
const RECENT_BRIEF_LIMIT = 50;
const TOP_LIMIT = 6;
const PIPELINE_STATUSES = [
  ["expert_review_requested", "Expert Review Requested"],
  ["broker_assigned", "Broker Assigned"],
  ["under_review", "Under Review"],
  ["tour_planning", "Tour Planning"],
  ["completed", "Completed"],
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

function parseJson(value, fallback = {}) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
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

function lookbackStartIso(days) {
  return new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString();
}

function percent(numerator, denominator) {
  const top = Number(numerator || 0);
  const bottom = Number(denominator || 0);
  if (!bottom) return "0%";
  return `${Math.round((top / bottom) * 100)}%`;
}

function statusLabel(value) {
  return String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getAnalyticsDb(env) {
  return env.SEARCH_PROFILE_EVENTS_DB || env.LEADS_DB || null;
}

function getLocationBriefDb(env) {
  return env.LOCATION_BRIEFS_DB || env.LEADS_DB || null;
}

function isMissingTable(error, tableName) {
  return new RegExp(`no such table|${tableName}`, "i").test(String(error && error.message || ""));
}

async function countSearchEvents(env, eventNames, days) {
  const db = getAnalyticsDb(env);
  if (!db) return 0;
  const names = Array.isArray(eventNames) ? eventNames : [eventNames];
  try {
    const result = await db.prepare(`
      select count(*) as count
      from search_profile_events
      where created_at >= ?
        and event_name in (${names.map(() => "?").join(", ")})
    `).bind(lookbackStartIso(days), ...names).first();
    return Number(result && result.count || 0);
  } catch (error) {
    if (isMissingTable(error, "search_profile_events")) return 0;
    throw error;
  }
}

async function countLocationBriefEvents(env, eventName, days) {
  const db = getLocationBriefDb(env);
  if (!db) return 0;
  try {
    const result = await db.prepare(`
      select count(*) as count
      from location_brief_events
      where created_at >= ?
        and event_name = ?
    `).bind(lookbackStartIso(days), eventName).first();
    return Number(result && result.count || 0);
  } catch (error) {
    if (isMissingTable(error, "location_brief_events")) return 0;
    throw error;
  }
}

async function loadKpis(env) {
  const rows = [];
  for (const days of KPI_WINDOWS) {
    rows.push({
      days,
      promptClicks: await countSearchEvents(env, "recommendation_prompt_clicked", days),
      findLocationsStarts: await countSearchEvents(env, "find_locations_page_viewed", days),
      // Recommendation page views were not historically tracked. Keep these future event names here
      // so the dashboard starts reporting immediately once the product emits either event.
      recommendationsViewed: await countSearchEvents(env, ["recommendations_viewed", "recommendation_context_created"], days),
      locationBriefsCreated: await countLocationBriefEvents(env, "location_brief_created", days),
      expertReviewsRequested: await countLocationBriefEvents(env, "expert_review_requested", days),
    });
  }
  return rows;
}

async function loadLeadRows(env) {
  if (!env.LEADS_DB) return [];
  try {
    const result = await env.LEADS_DB.prepare(`
      select id, status, lead_json, created_at
      from leads
      where status in ('expert_review_requested', 'broker_assigned', 'under_review', 'tour_planning', 'completed')
      order by created_at desc
      limit ?
    `).bind(RECENT_BRIEF_LIMIT).all();
    return result.results || [];
  } catch (error) {
    if (isMissingTable(error, "leads")) return [];
    throw error;
  }
}

function normalizeBriefLeadRow(row) {
  const lead = parseJson(row.lead_json);
  return {
    id: row.id,
    status: row.status || lead.status || "expert_review_requested",
    createdAt: row.created_at || lead.timestamp || "",
    publicId: lead.location_brief_public_id || "",
    briefUrl: lead.location_brief_url || "",
    customer: lead.name || "",
    email: lead.email || "",
    company: lead.company || "",
    market: lead.location_display || lead.market || [lead.city, lead.state].filter(Boolean).join(", "),
    spaceType: lead.requested_space_type || lead.space_type || "",
    size: lead.space_needed || "",
    recommendedMarketPath: lead.recommended_market_path || "",
    priorities: String(lead.business_priorities || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

function loadPipeline(rows) {
  const counts = Object.fromEntries(PIPELINE_STATUSES.map(([status]) => [status, 0]));
  for (const row of rows) {
    const status = row.status || "expert_review_requested";
    if (counts[status] !== undefined) counts[status] += 1;
  }
  return counts;
}

function addCount(map, key) {
  const normalized = String(key || "").trim();
  if (!normalized) return;
  map.set(normalized, (map.get(normalized) || 0) + 1);
}

function topEntries(map) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_LIMIT)
    .map(([label, count]) => ({ label, count }));
}

function loadDemand(rows) {
  const markets = new Map();
  const spaceTypes = new Map();
  const priorities = new Map();

  for (const row of rows) {
    addCount(markets, row.market);
    addCount(spaceTypes, row.spaceType);
    row.priorities.forEach((priority) => addCount(priorities, priority));
  }

  return {
    markets: topEntries(markets),
    spaceTypes: topEntries(spaceTypes),
    priorities: topEntries(priorities),
  };
}

function healthStatus(value) {
  if (value === true) return { label: "Configured", className: "health--ok" };
  if (value === false) return { label: "Not configured", className: "health--bad" };
  return { label: "Unknown", className: "health--unknown" };
}

function loadHealth(env) {
  return [
    ["Location Brief storage", Boolean(env.LOCATION_BRIEFS_DB || env.LOCATION_BRIEFS_KV || env.LEADS_DB || env.LEADS_KV)],
    ["Lead dashboard storage", Boolean(env.LEADS_DB || env.LEADS_KV)],
    ["Email notification", Boolean(env.RESEND_API_KEY && env.LEAD_NOTIFY_EMAIL)],
    ["OfficeFinder routing", env.LEADS_DB || env.LEADS_KV ? true : null],
    ["Analytics storage", Boolean(env.SEARCH_PROFILE_EVENTS_DB || env.LEADS_DB)],
  ];
}

function metricCard(label, rowKey, kpis) {
  const by7 = kpis.find((row) => row.days === 7) || {};
  const by30 = kpis.find((row) => row.days === 30) || {};
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(by7[rowKey] || 0)}</strong>
      <small>Last 7 days</small>
      <div>${escapeHtml(by30[rowKey] || 0)} last 30 days</div>
    </article>
  `;
}

function renderPipeline(pipeline) {
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>Active Pipeline</h2>
        <p>Operational status across Location Brief and expert review workflow.</p>
      </div>
      <div class="pipeline-grid">
        ${PIPELINE_STATUSES.map(([status, label]) => `
          <article class="pipeline-card">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(pipeline[status] || 0)}</strong>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderBriefRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="9" class="empty">No Location Brief expert-review requests yet.</td></tr>`;
  }
  return rows.map((row) => `
    <tr>
      <td>${row.briefUrl ? `<a href="${escapeHtml(row.briefUrl)}">${escapeHtml(row.publicId || "View Brief")}</a>` : escapeHtml(row.publicId || "—")}</td>
      <td>
        <strong>${escapeHtml(row.customer || "Unnamed")}</strong>
        ${row.email ? `<small>${escapeHtml(row.email)}</small>` : ""}
      </td>
      <td>${escapeHtml(row.company || "—")}</td>
      <td>${escapeHtml(row.market || "—")}</td>
      <td>${escapeHtml(row.spaceType || "—")}</td>
      <td>${escapeHtml(row.size || "—")}</td>
      <td><span class="badge">${escapeHtml(statusLabel(row.status))}</span></td>
      <td>${escapeHtml(formatDate(row.createdAt))}</td>
      <td>${row.briefUrl ? `<a class="button-link" href="${escapeHtml(row.briefUrl)}">View Brief</a>` : "—"}</td>
    </tr>
  `).join("");
}

function renderRecentBriefs(rows, token) {
  return `
    <section class="panel panel--table">
      <div class="section-heading section-heading--row">
        <div>
          <h2>Recent Location Briefs / Expert Reviews</h2>
          <p>Latest Location Brief submissions stored in the lead dashboard workflow.</p>
        </div>
        <a class="button-link" href="/admin/leads?token=${encodeURIComponent(token)}">Lead Dashboard</a>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Brief ID</th>
              <th>Customer</th>
              <th>Company</th>
              <th>Market / Location</th>
              <th>Space Type</th>
              <th>Size</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>${renderBriefRows(rows)}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderDemandList(title, rows) {
  return `
    <article class="demand-card">
      <h3>${escapeHtml(title)}</h3>
      ${rows.length ? `
        <ol>
          ${rows.map((row) => `<li><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.count)}</strong></li>`).join("")}
        </ol>
      ` : `<p class="empty">No Location Brief demand data yet.</p>`}
    </article>
  `;
}

function renderDemand(demand) {
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>Market Demand</h2>
        <p>Basic demand signals from submitted Location Briefs.</p>
      </div>
      <div class="demand-grid">
        ${renderDemandList("Top requested markets", demand.markets)}
        ${renderDemandList("Top space types", demand.spaceTypes)}
        ${renderDemandList("Most common priorities", demand.priorities)}
      </div>
    </section>
  `;
}

function renderFunnel(kpis) {
  const row = kpis.find((item) => item.days === 30) || {};
  const steps = [
    ["Prompt Clicks", row.promptClicks || 0],
    ["Find Locations", row.findLocationsStarts || 0],
    ["Recommendations", row.recommendationsViewed || 0],
    ["Brief Created", row.locationBriefsCreated || 0],
    ["Expert Review", row.expertReviewsRequested || 0],
  ];
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>Operational Funnel</h2>
        <p>Last 30 days. Recommendations currently reports once the corresponding event is emitted.</p>
      </div>
      <div class="funnel">
        ${steps.map(([label, count], index) => {
          const previous = index > 0 ? steps[index - 1][1] : count;
          return `
            <article>
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(count)}</strong>
              ${index > 0 ? `<small>${escapeHtml(percent(count, previous))} from previous</small>` : `<small>Entry step</small>`}
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderHealth(env) {
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>System Health / Routing</h2>
        <p>Configuration check only. Secrets are never displayed.</p>
      </div>
      <div class="health-grid">
        ${loadHealth(env).map(([label, value]) => {
          const status = healthStatus(value);
          return `
            <article class="health-card">
              <span>${escapeHtml(label)}</span>
              <strong class="${escapeHtml(status.className)}">${escapeHtml(status.label)}</strong>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderAdminModules(token) {
  const modules = [
    {
      title: "Operations",
      purpose: "Run the business",
      href: `/admin/operations?token=${encodeURIComponent(token)}`,
      current: true,
    },
    {
      title: "Rofo Compass",
      purpose: "Commercial location intelligence engine health",
      href: `/admin/compass?token=${encodeURIComponent(token)}`,
    },
    {
      title: "Rofo Compass Coverage",
      purpose: "Metro maturity and expansion roadmap",
      href: `/admin/coverage?token=${encodeURIComponent(token)}`,
    },
    {
      title: "Lead Dashboard",
      purpose: "Expert review and referral pipeline",
      href: `/admin/leads?token=${encodeURIComponent(token)}`,
    },
    {
      title: "Broker Partners",
      purpose: "Referral partner coverage by market and space type",
      href: `/admin/brokers?token=${encodeURIComponent(token)}`,
    },
    {
      title: "Search Profile Analytics",
      purpose: "Legacy/product funnel analytics",
      href: `/admin/search-profile-analytics?token=${encodeURIComponent(token)}`,
    },
    {
      title: "Example Location Brief",
      purpose: "View the product reference example",
      href: "/example-location-brief/",
    },
  ];
  return `
    <section class="panel admin-modules" aria-label="Admin modules">
      <div class="section-heading">
        <h2>Admin Modules</h2>
        <p>Rofo Operations is the admin hub for running the recommendation and Location Brief workflow.</p>
      </div>
      <div class="admin-module-grid">
        ${modules.map((item) => `
          <a class="admin-module-card${item.current ? " admin-module-card--current" : ""}" href="${escapeHtml(item.href)}">
            <span>${item.current ? "Current" : "Open"}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.purpose)}</p>
            <em>View →</em>
          </a>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPage({ token, kpis, pipeline, recentBriefs, demand, errors, env }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rofo Operations</title>
  <style>
    :root { color-scheme: light; --bg: #f5f7fb; --surface: #fff; --ink: #111827; --muted: #64748b; --border: #dce5f2; --blue: #1746cc; --green: #166534; --red: #991b1b; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    a { color: var(--blue); }
    .shell { width: min(1220px, calc(100% - 32px)); margin: 0 auto; padding: 30px 0 56px; }
    header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 22px; }
    h1 { margin: 0 0 8px; font-size: clamp(2rem, 4vw, 3.4rem); line-height: 1; letter-spacing: -0.02em; }
    h2, h3, p { margin: 0; }
    header p, .section-heading p { color: var(--muted); line-height: 1.55; }
    .nav { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
    .button-link { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; padding: 0 12px; border: 1px solid var(--border); border-radius: 999px; background: #fff; color: var(--blue); font-size: 0.9rem; font-weight: 800; text-decoration: none; white-space: nowrap; }
    .button-link--active { border-color: #bfdbfe; background: #eff6ff; color: #1e40af; }
    .metrics { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
    .metric-card, .panel, .pipeline-card, .demand-card, .health-card { border: 1px solid var(--border); background: var(--surface); box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06); }
    .metric-card { display: grid; gap: 6px; padding: 16px; border-radius: 16px; }
    .metric-card span, .pipeline-card span, .health-card span { color: var(--muted); font-size: 0.76rem; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; }
    .metric-card strong { font-size: 2rem; line-height: 1; }
    .metric-card small, .metric-card div { color: var(--muted); font-size: 0.85rem; }
    .panel { margin-top: 16px; padding: 20px; border-radius: 18px; }
    .section-heading { display: grid; gap: 6px; margin-bottom: 14px; }
    .section-heading--row { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
    .pipeline-grid, .health-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
    .pipeline-card, .health-card { display: grid; gap: 8px; padding: 14px; border-radius: 14px; box-shadow: none; }
    .pipeline-card strong { font-size: 1.8rem; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 980px; }
    th { color: var(--muted); font-size: 0.72rem; font-weight: 900; letter-spacing: 0.04em; text-align: left; text-transform: uppercase; }
    th, td { padding: 12px 10px; border-top: 1px solid #edf2f7; vertical-align: top; }
    tbody tr:hover { background: #f8fbff; }
    td strong { display: block; }
    td small { display: block; margin-top: 3px; color: var(--muted); }
    .badge { display: inline-flex; padding: 5px 9px; border-radius: 999px; background: #dbeafe; color: #1e40af; font-size: 0.76rem; font-weight: 850; }
    .demand-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .demand-card { padding: 16px; border-radius: 14px; box-shadow: none; }
    .demand-card h3 { margin-bottom: 12px; }
    .demand-card ol { display: grid; gap: 9px; margin: 0; padding: 0; list-style: none; }
    .demand-card li { display: flex; justify-content: space-between; gap: 12px; color: #334155; }
    .demand-card li strong { color: var(--ink); }
    .funnel { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
    .funnel article { position: relative; padding: 14px; border: 1px solid #cfdcf0; border-radius: 14px; background: linear-gradient(180deg, #fff 0%, #f8fbff 100%); }
    .funnel article:not(:last-child)::after { content: "→"; position: absolute; right: -9px; top: 50%; transform: translateY(-50%); color: var(--muted); font-weight: 900; }
    .funnel span { display: block; color: var(--muted); font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; }
    .funnel strong { display: block; margin-top: 8px; font-size: 1.7rem; }
    .funnel small { color: var(--muted); }
    .health--ok { color: var(--green); }
    .health--bad { color: var(--red); }
    .health--unknown { color: #92400e; }
    .notice { margin: 0 0 16px; padding: 12px 14px; border: 1px solid #fed7aa; border-radius: 12px; background: #fff7ed; color: #9a3412; font-weight: 750; }
    .empty { color: var(--muted); }
    .admin-module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .admin-module-card { display: grid; gap: 8px; min-height: 154px; padding: 16px; border: 1px solid var(--border); border-radius: 14px; background: #fff; color: var(--ink); text-decoration: none; box-shadow: none; }
    .admin-module-card:hover { border-color: #b9c9e5; background: #f8fbff; }
    .admin-module-card--current { border-color: #bfdbfe; background: #eff6ff; }
    .admin-module-card span { color: var(--muted); font-size: 0.72rem; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; }
    .admin-module-card strong { font-size: 1rem; line-height: 1.25; }
    .admin-module-card p { color: var(--muted); line-height: 1.4; }
    .admin-module-card em { align-self: end; color: var(--blue); font-style: normal; font-weight: 900; }
    @media (max-width: 980px) {
      header, .section-heading--row { display: grid; }
      .nav { justify-content: flex-start; }
      .metrics, .pipeline-grid, .health-grid, .demand-grid, .funnel, .admin-module-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .funnel article::after { display: none; }
    }
    @media (max-width: 640px) {
      .metrics, .pipeline-grid, .health-grid, .demand-grid, .funnel, .admin-module-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div>
        <h1>Rofo Operations</h1>
        <p>Recommendation activity, Location Briefs, and expert review workflow.</p>
      </div>
      <nav class="nav" aria-label="Admin links">
        <a class="button-link button-link--active" href="/admin/operations?token=${encodeURIComponent(token)}">Operations</a>
        <a class="button-link" href="/admin/compass?token=${encodeURIComponent(token)}">Rofo Compass</a>
        <a class="button-link" href="/admin/coverage?token=${encodeURIComponent(token)}">Compass Coverage</a>
        <a class="button-link" href="/admin/brokers?token=${encodeURIComponent(token)}">Broker Partners</a>
        <a class="button-link" href="/admin/leads?token=${encodeURIComponent(token)}">View Lead Dashboard</a>
        <a class="button-link" href="/admin/search-profile-analytics?token=${encodeURIComponent(token)}">Search Profile Analytics</a>
        <a class="button-link" href="/example-location-brief/">Example Location Brief</a>
      </nav>
    </header>

    ${errors.length ? `<div class="notice">Some operations data could not be loaded: ${errors.map(escapeHtml).join(" ")}</div>` : ""}

    <section class="metrics" aria-label="Operational KPIs">
      ${metricCard("Recommendation Prompt Clicks", "promptClicks", kpis)}
      ${metricCard("Find Locations Starts", "findLocationsStarts", kpis)}
      ${metricCard("Recommendations Viewed", "recommendationsViewed", kpis)}
      ${metricCard("Location Briefs Created", "locationBriefsCreated", kpis)}
      ${metricCard("Expert Reviews Requested", "expertReviewsRequested", kpis)}
    </section>

    ${renderAdminModules(token)}
    ${renderPipeline(pipeline)}
    ${renderRecentBriefs(recentBriefs, token)}
    ${renderDemand(demand)}
    ${renderFunnel(kpis)}
    ${renderHealth(env)}
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

  const errors = [];
  let kpis = KPI_WINDOWS.map((days) => ({
    days,
    promptClicks: 0,
    findLocationsStarts: 0,
    recommendationsViewed: 0,
    locationBriefsCreated: 0,
    expertReviewsRequested: 0,
  }));
  let recentBriefs = [];

  try {
    kpis = await loadKpis(env);
  } catch (error) {
    errors.push(error.message || "KPI queries failed.");
  }

  try {
    recentBriefs = (await loadLeadRows(env)).map(normalizeBriefLeadRow);
  } catch (error) {
    errors.push(error.message || "Location Brief lead rows failed.");
  }

  const pipeline = loadPipeline(recentBriefs);
  const demand = loadDemand(recentBriefs);

  return adminResponse(renderPage({
    token,
    kpis,
    pipeline,
    recentBriefs,
    demand,
    errors,
    env,
  }));
}
