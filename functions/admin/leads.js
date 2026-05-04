import { escapeHtml } from "../api/leads/_shared.js";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const STATUS_VIEWS = {
  pending: ["pending"],
  sent: ["approved_sent", "broker_sent", "both_sent", "partial_sent"],
  rejected: ["rejected"],
  spam: ["spam_quarantined", "rejected_spam"],
};

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

function normalizeLimit(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), MAX_LIMIT);
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

function truncate(value, max = 500) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function getLatestOfficeFinderAttempt(lead) {
  const attempts = Array.isArray(lead.officefinder_attempts) ? lead.officefinder_attempts : [];
  return attempts.length ? attempts[attempts.length - 1] : null;
}

function field(label, value) {
  if (value === undefined || value === null || value === "") return "";
  return `
    <div class="field">
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `;
}

function linkField(label, value) {
  if (value === undefined || value === null || value === "") return "";
  const safeValue = escapeHtml(value);
  return `
    <div class="field">
      <dt>${escapeHtml(label)}</dt>
      <dd><a href="${safeValue}" target="_blank" rel="noopener">${safeValue}</a></dd>
    </div>
  `;
}

function statusBadge(value) {
  const status = value || "unknown";
  return `<span class="badge badge--${escapeHtml(status.replace(/[^a-z0-9_-]/gi, "-").toLowerCase())}">${escapeHtml(status)}</span>`;
}

function normalizeView(value) {
  const view = String(value || "").trim().toLowerCase();
  if (["pending", "sent", "rejected", "spam", "all"].includes(view)) return view;
  return "pending";
}

function detailsBlock(label, value) {
  if (!value) return "";
  return `
    <details>
      <summary>${escapeHtml(label)}</summary>
      <pre>${escapeHtml(truncate(value, 3000))}</pre>
    </details>
  `;
}

function renderLeadCard(row) {
  const lead = parseJson(row.lead_json);
  const officeFinderPayload = parseJson(row.officefinder_json);
  const route = lead.route_recommendation || {};
  const latestAttempt = getLatestOfficeFinderAttempt(lead);
  const market = lead.market || [lead.city, lead.state].filter(Boolean).join(", ");
  const officeFinderStatus = lead.officefinder_status || "officefinder_not_attempted";
  const spamReasons = Array.isArray(lead.spam_reasons) ? lead.spam_reasons : [];
  const isSpam = ["spam_quarantined", "rejected_spam"].includes(row.status);

  return `
    <article class="lead-card${isSpam ? " lead-card--spam" : ""}">
      <div class="lead-card__header">
        <div>
          <div class="lead-card__time">${escapeHtml(formatDate(row.created_at))}</div>
          <h2>${escapeHtml(lead.name || "Unnamed lead")}</h2>
          <p>${escapeHtml([market, lead.space_type || lead.requested_space_type, lead.space_needed].filter(Boolean).join(" • "))}</p>
        </div>
        <div class="lead-card__status">
          ${statusBadge(row.status)}
          ${statusBadge(officeFinderStatus)}
        </div>
      </div>

      <div class="lead-grid">
        ${field("Email", lead.email)}
        ${field("Phone", lead.phone)}
        ${field("Company", lead.company)}
        ${field("City / market", market)}
        ${field("State", lead.state)}
        ${field("Space type", lead.requested_space_type || lead.space_type)}
        ${field("Space needed", lead.space_needed)}
        ${field("Source", lead.source)}
        ${field("Page type", lead.page_type)}
        ${linkField("Page URL", lead.page_url || lead.rofo_source)}
        ${field("Route recommendation", route.route_to)}
        ${field("Matched rule", route.route_id)}
        ${field("Route reason", route.route_reason)}
        ${field("Broker email", route.broker_email)}
        ${field("OfficeFinder status", officeFinderStatus)}
        ${field("Spam score", lead.spam_score)}
        ${field("Sent at", formatDate(row.sent_at))}
        ${field("Rejected at", formatDate(row.rejected_at))}
      </div>

      ${spamReasons.length ? `<div class="spam-box"><strong>Spam review:</strong> Score ${escapeHtml(lead.spam_score || 0)}<ul>${spamReasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul></div>` : ""}
      ${row.approval_error ? `<div class="alert"><strong>Approval error:</strong> ${escapeHtml(row.approval_error)}</div>` : ""}
      ${row.officefinder_response ? `<div class="note"><strong>OfficeFinder response:</strong> ${escapeHtml(row.officefinder_response)}</div>` : ""}

      <div class="lead-card__details">
        <details>
          <summary>OfficeFinder latest attempt</summary>
          ${
            latestAttempt
              ? `<div class="lead-grid lead-grid--compact">
                  ${field("Attempted at", formatDate(latestAttempt.attempted_at))}
                  ${field("Mode", latestAttempt.officefinder_mode)}
                  ${field("HTTP status", latestAttempt.response_status)}
                  ${field("Success", String(Boolean(latestAttempt.success)))}
                  ${field("Error", latestAttempt.error)}
                </div>
                ${detailsBlock("Response body", latestAttempt.response_body)}
                ${detailsBlock("Request payload", latestAttempt.request_payload)}`
              : "<p>No OfficeFinder attempts yet.</p>"
          }
        </details>
        ${detailsBlock("Stored OfficeFinder payload", officeFinderPayload)}
        ${detailsBlock("Lead JSON", lead)}
      </div>

      <div class="lead-actions">
        <span>Approval actions: use approval email.</span>
        <span class="muted">Approval tokens are hashed and are not exposed in dashboard storage.</span>
      </div>
    </article>
  `;
}

function buildTabUrl(token, view, filters) {
  const params = new URLSearchParams();
  params.set("token", token);
  params.set("view", view);
  if (filters.officefinderStatus) params.set("officefinder_status", filters.officefinderStatus);
  if (filters.limit !== DEFAULT_LIMIT) params.set("limit", filters.limit);
  return `/admin/leads?${params.toString()}`;
}

function renderTabs(token, filters, counts) {
  const tabs = [
    { view: "pending", label: "Pending", count: counts.pending || 0 },
    { view: "sent", label: "Approved/Sent", count: counts.sent || 0 },
    { view: "rejected", label: "Rejected", count: counts.rejected || 0 },
    { view: "spam", label: "Spam Quarantined", count: counts.spam || 0 },
    { view: "all", label: "All", count: counts.all || 0 },
  ];

  return `
    <nav class="tabs" aria-label="Lead status views">
      ${tabs.map((tab) => `
        <a class="tab${filters.view === tab.view ? " tab--active" : ""}" href="${escapeHtml(buildTabUrl(token, tab.view, filters))}">
          <span>${escapeHtml(tab.label)}</span>
          <strong>${escapeHtml(tab.count)}</strong>
        </a>
      `).join("")}
    </nav>
  `;
}

function renderFilters(token, filters) {
  return `
    <form class="filters" method="GET" action="/admin/leads">
      <input type="hidden" name="token" value="${escapeHtml(token)}">
      <input type="hidden" name="view" value="${escapeHtml(filters.view)}">
      <label>
        Exact status override
        <input name="status" value="${escapeHtml(filters.status)}" placeholder="optional: approved_send_failed">
      </label>
      <label>
        OfficeFinder status
        <input name="officefinder_status" value="${escapeHtml(filters.officefinderStatus)}" placeholder="officefinder_failed">
      </label>
      <label>
        Limit
        <input name="limit" type="number" min="1" max="${MAX_LIMIT}" value="${escapeHtml(filters.limit)}">
      </label>
      <button type="submit">Apply filters</button>
      <a href="/admin/leads?token=${encodeURIComponent(token)}">Reset</a>
    </form>
  `;
}

function renderPage({ rows, token, filters, fetchedCount, counts }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rofo Lead Dashboard</title>
  <style>
    :root { color-scheme: light; --border: #d9e2ec; --muted: #607083; --bg: #f6f8fb; --ink: #172033; --blue: #173f8a; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--ink); background: var(--bg); }
    a { color: #174ea6; }
    .shell { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 48px; }
    header { margin-bottom: 20px; }
    h1 { margin: 0 0 6px; font-size: clamp(28px, 4vw, 42px); line-height: 1.05; }
    h2 { margin: 4px 0; font-size: 20px; }
    p { margin: 0; color: var(--muted); }
    .filters { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)) auto; gap: 12px; align-items: end; background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin: 20px 0; }
    .tabs { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin: 18px 0; }
    .tab { display: flex; justify-content: space-between; gap: 10px; align-items: center; min-height: 54px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: #fff; color: var(--ink); text-decoration: none; font-weight: 800; }
    .tab strong { min-width: 32px; border-radius: 999px; padding: 4px 8px; background: #eef3f8; text-align: center; font-size: 12px; }
    .tab--active { border-color: var(--blue); box-shadow: 0 0 0 2px rgba(23, 63, 138, .12); }
    .tab--active strong { background: var(--blue); color: #fff; }
    label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: #34445b; }
    input { width: 100%; border: 1px solid var(--border); border-radius: 8px; padding: 10px; font: inherit; }
    button { border: 0; border-radius: 8px; padding: 11px 14px; background: var(--blue); color: #fff; font-weight: 800; cursor: pointer; }
    .summary { margin: 0 0 16px; color: var(--muted); }
    .lead-list { display: grid; gap: 16px; }
    .lead-card { background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 18px; box-shadow: 0 8px 24px rgba(23, 32, 51, 0.06); }
    .lead-card--spam { background: #fffaf5; border-color: #fed7aa; box-shadow: none; }
    .lead-card__header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
    .lead-card__time { color: var(--muted); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
    .lead-card__status { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
    .badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 6px 10px; background: #eef3f8; color: #24364d; font-size: 12px; font-weight: 800; }
    .badge--pending { background: #fff7db; color: #7a4b00; }
    .badge--approved_sent, .badge--broker_sent, .badge--both_sent, .badge--partial_sent, .badge--officefinder_sent { background: #e4f8ec; color: #166534; }
    .badge--approved_send_failed, .badge--officefinder_failed { background: #fee2e2; color: #991b1b; }
    .badge--spam_quarantined, .badge--rejected_spam { background: #ffedd5; color: #9a3412; }
    .badge--rejected { background: #f1f5f9; color: #475569; }
    .lead-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px 16px; margin-top: 16px; }
    .lead-grid--compact { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .field { min-width: 0; }
    dt { color: var(--muted); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
    dd { margin: 4px 0 0; overflow-wrap: anywhere; }
    .alert, .note { margin-top: 14px; border-radius: 10px; padding: 12px; overflow-wrap: anywhere; }
    .alert { background: #fff1f2; color: #9f1239; }
    .note { background: #eff6ff; color: #1e3a8a; }
    .spam-box { margin-top: 14px; border: 1px solid #fed7aa; border-radius: 10px; padding: 12px; background: #fff7ed; color: #9a3412; overflow-wrap: anywhere; }
    .spam-box ul { margin: 8px 0 0; padding-left: 18px; }
    details { margin-top: 14px; border: 1px solid var(--border); border-radius: 10px; padding: 12px; background: #fbfdff; }
    summary { cursor: pointer; font-weight: 800; }
    pre { white-space: pre-wrap; overflow-x: auto; background: #111827; color: #e5e7eb; border-radius: 8px; padding: 12px; font-size: 12px; }
    .lead-actions { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-top: 14px; color: var(--muted); font-size: 13px; }
    .muted { color: var(--muted); }
    @media (max-width: 820px) {
      .filters, .tabs, .lead-grid, .lead-grid--compact { grid-template-columns: 1fr; }
      .lead-card__header { display: grid; }
      .lead-card__status { justify-content: flex-start; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <h1>Rofo Lead Dashboard</h1>
      <p>Recent tenant leads, routing status, and OfficeFinder attempt history.</p>
    </header>
    ${renderTabs(token, filters, counts)}
    ${renderFilters(token, filters)}
    <p class="summary">Showing ${rows.length} ${escapeHtml(filters.status || filters.view)} lead${rows.length === 1 ? "" : "s"}${fetchedCount > rows.length ? ` after filtering ${fetchedCount} fetched records` : ""}. Ordered by newest first.</p>
    <section class="lead-list">
      ${rows.length ? rows.map(renderLeadCard).join("") : "<p>No leads match these filters.</p>"}
    </section>
  </main>
</body>
</html>`;
}

async function fetchLeadRows(env, filters) {
  if (!env.LEADS_DB) {
    throw new Error("LEADS_DB D1 binding is not configured.");
  }

  const clauses = [];
  const bindings = [];

  if (filters.status) {
    clauses.push("status = ?");
    bindings.push(filters.status);
  } else if (filters.view !== "all") {
    const statuses = STATUS_VIEWS[filters.view] || STATUS_VIEWS.pending;
    clauses.push(`status in (${statuses.map(() => "?").join(", ")})`);
    bindings.push(...statuses);
  }

  const fetchLimit = filters.officefinderStatus ? Math.min(filters.limit * 5, MAX_LIMIT) : filters.limit;
  bindings.push(fetchLimit);

  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  const query = `select id, status, lead_json, officefinder_json, officefinder_response, approval_error, created_at, updated_at, sent_at, rejected_at
    from leads
    ${where}
    order by created_at desc
    limit ?`;

  const result = await env.LEADS_DB.prepare(query).bind(...bindings).all();
  const rows = result.results || [];

  if (!filters.officefinderStatus) {
    return { rows, fetchedCount: rows.length };
  }

  const filtered = rows.filter((row) => {
    const lead = parseJson(row.lead_json);
    return lead.officefinder_status === filters.officefinderStatus;
  }).slice(0, filters.limit);

  return { rows: filtered, fetchedCount: rows.length };
}

async function fetchStatusCounts(env) {
  if (!env.LEADS_DB) {
    throw new Error("LEADS_DB D1 binding is not configured.");
  }

  const result = await env.LEADS_DB.prepare("select status, count(*) as count from leads group by status").all();
  const byStatus = {};
  for (const row of result.results || []) {
    byStatus[row.status] = Number(row.count || 0);
  }

  const sum = (statuses) => statuses.reduce((total, status) => total + (byStatus[status] || 0), 0);

  return {
    pending: sum(STATUS_VIEWS.pending),
    sent: sum(STATUS_VIEWS.sent),
    rejected: sum(STATUS_VIEWS.rejected),
    spam: sum(STATUS_VIEWS.spam),
    all: Object.values(byStatus).reduce((total, count) => total + count, 0),
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

  const filters = {
    view: normalizeView(url.searchParams.get("view")),
    status: (url.searchParams.get("status") || "").trim(),
    officefinderStatus: (url.searchParams.get("officefinder_status") || "").trim(),
    limit: normalizeLimit(url.searchParams.get("limit")),
  };

  try {
    const counts = await fetchStatusCounts(env);
    const { rows, fetchedCount } = await fetchLeadRows(env, filters);
    return adminResponse(renderPage({ rows, token, filters, fetchedCount, counts }));
  } catch (error) {
    return adminResponse(`<h1>Lead dashboard error</h1><p>${escapeHtml(error.message)}</p>`, 500);
  }
}
