import { escapeHtml } from "../api/leads/_shared.js";
import {
  addDaysIso,
  formatDate,
  inviteStatusLabel,
  isExpired,
  randomToken,
  sendBrokerInvitationEmail,
  sha256,
} from "../broker-invite/_shared.js";

const BROKER_STATUSES = ["active", "inactive", "pending"];
const SPACE_TYPES = ["office", "industrial", "warehouse", "flex", "retail", "medical", "coworking"];

function adminResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function adminRedirect(path) {
  return new Response(null, {
    status: 303,
    headers: {
      location: path,
      "cache-control": "no-store",
    },
  });
}

function randomId() {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return `broker_${[...array].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeStatus(value) {
  const status = normalizeText(value).toLowerCase();
  return BROKER_STATUSES.includes(status) ? status : "pending";
}

function normalizeSpaceTypes(values) {
  const list = Array.isArray(values) ? values : [values];
  return [...new Set(list.map((value) => normalizeText(value).toLowerCase()).filter((value) => SPACE_TYPES.includes(value)))];
}

function parseMarkets(value) {
  return normalizeText(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s*\|\s*|\s*,\s*/).map((part) => part.trim()).filter(Boolean);
      return {
        state: parts[0] || "",
        county: parts[1] || "",
        city: parts[2] || "",
        district: parts[3] || "",
      };
    });
}

function formatMarketLine(market) {
  return [market.state, market.county, market.city, market.district].filter(Boolean).join(" | ");
}

function formatMarkets(markets) {
  return (Array.isArray(markets) ? markets : []).map(formatMarketLine).filter(Boolean).join("\n");
}

function statusLabel(value) {
  return normalizeStatus(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusBadge(value) {
  const status = normalizeStatus(value);
  return `<span class="badge badge--${escapeHtml(status)}">${escapeHtml(statusLabel(status))}</span>`;
}

function inviteStatusBadge(broker) {
  const status = displayedInviteStatus(broker);
  return `<span class="badge badge--invite-${escapeHtml(status)}">${escapeHtml(inviteStatusLabel(status))}</span>`;
}

async function ensureBrokerTable(env) {
  if (!env.LEADS_DB) {
    throw new Error("LEADS_DB D1 binding is required for broker partner storage.");
  }

  await env.LEADS_DB.prepare(`
    create table if not exists broker_partners (
      id text primary key,
      name text not null,
      email text not null,
      phone text,
      company text,
      markets_json text,
      space_types_json text,
      status text not null default 'pending',
      notes text,
      created_at text not null,
      updated_at text not null
    )
  `).run();
  await addColumnIfMissing(env.LEADS_DB, "alter table broker_partners add column invite_status text not null default 'not_sent'");
  await addColumnIfMissing(env.LEADS_DB, "alter table broker_partners add column invited_at text");
  await addColumnIfMissing(env.LEADS_DB, "alter table broker_partners add column invite_sent_count integer not null default 0");
  await addColumnIfMissing(env.LEADS_DB, "alter table broker_partners add column last_invited_at text");
  await addColumnIfMissing(env.LEADS_DB, "alter table broker_partners add column invite_token text");
  await addColumnIfMissing(env.LEADS_DB, "alter table broker_partners add column invite_token_expires_at text");
  await addColumnIfMissing(env.LEADS_DB, "alter table broker_partners add column accepted_at text");
  await addColumnIfMissing(env.LEADS_DB, "alter table broker_partners add column invite_last_error text");
  await env.LEADS_DB.prepare("create index if not exists idx_broker_partners_status on broker_partners(status)").run();
  await env.LEADS_DB.prepare("create index if not exists idx_broker_partners_invite_status on broker_partners(invite_status)").run();
  await env.LEADS_DB.prepare("create index if not exists idx_broker_partners_invite_token on broker_partners(invite_token)").run();
}

async function addColumnIfMissing(db, sql) {
  try {
    await db.prepare(sql).run();
  } catch (error) {
    if (!/duplicate column|already exists/i.test(String(error && error.message || ""))) {
      throw error;
    }
  }
}

async function listBrokers(env) {
  const result = await env.LEADS_DB.prepare(`
    select *
    from broker_partners
    order by case status when 'active' then 0 when 'pending' then 1 else 2 end, company, name
  `).all();
  return (result.results || []).map(normalizeBrokerRow);
}

async function getBroker(env, id) {
  if (!id) return null;
  const row = await env.LEADS_DB.prepare("select * from broker_partners where id = ?").bind(id).first();
  return row ? normalizeBrokerRow(row) : null;
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function normalizeBrokerRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    phone: row.phone || "",
    company: row.company || "",
    markets: parseJson(row.markets_json, []),
    spaceTypes: parseJson(row.space_types_json, []),
    status: normalizeStatus(row.status),
    notes: row.notes || "",
    inviteStatus: normalizeInviteStatus(row.invite_status),
    invitedAt: row.invited_at || "",
    inviteSentCount: Number(row.invite_sent_count || 0),
    lastInvitedAt: row.last_invited_at || "",
    inviteToken: row.invite_token || "",
    inviteTokenExpiresAt: row.invite_token_expires_at || "",
    acceptedAt: row.accepted_at || "",
    inviteLastError: row.invite_last_error || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function normalizeInviteStatus(value) {
  const status = normalizeText(value).toLowerCase();
  if (["not_sent", "sent", "accepted", "declined", "expired", "send_failed"].includes(status)) return status;
  return "not_sent";
}

async function saveBroker(env, broker) {
  const now = new Date().toISOString();
  const existing = broker.id ? await getBroker(env, broker.id) : null;
  const id = existing ? existing.id : randomId();
  const createdAt = existing ? existing.createdAt : now;

  await env.LEADS_DB.prepare(`
    insert into broker_partners (
      id, name, email, phone, company, markets_json, space_types_json, status, notes, created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    on conflict(id) do update set
      name = excluded.name,
      email = excluded.email,
      phone = excluded.phone,
      company = excluded.company,
      markets_json = excluded.markets_json,
      space_types_json = excluded.space_types_json,
      status = excluded.status,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `).bind(
    id,
    broker.name,
    broker.email,
    broker.phone,
    broker.company,
    JSON.stringify(broker.markets),
    JSON.stringify(broker.spaceTypes),
    broker.status,
    broker.notes,
    createdAt,
    now
  ).run();
}

function emailLooksValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeText(value));
}

function displayedInviteStatus(broker) {
  if (broker.inviteStatus === "sent" && isExpired(broker.inviteTokenExpiresAt)) return "expired";
  return broker.inviteStatus;
}

function canInviteBroker(broker) {
  if (!emailLooksValid(broker.email)) return false;
  if (!["pending", "inactive"].includes(broker.status)) return false;
  return displayedInviteStatus(broker) !== "accepted";
}

async function sendInvitation(env, request, broker) {
  const now = new Date().toISOString();
  const rawToken = randomToken(32);
  const tokenHash = await sha256(rawToken);
  const expiresAt = addDaysIso(Number(env.BROKER_INVITE_EXPIRATION_DAYS || 14));
  await env.LEADS_DB.prepare(`
    update broker_partners
    set invite_status = ?,
        invite_token = ?,
        invite_token_expires_at = ?,
        invite_last_error = ?,
        updated_at = ?
    where id = ?
  `).bind("not_sent", tokenHash, expiresAt, "", now, broker.id).run();

  const emailResult = await sendBrokerInvitationEmail(env, request, { ...broker, inviteTokenExpiresAt: expiresAt }, rawToken);
  if (!emailResult.sent) {
    await env.LEADS_DB.prepare(`
      update broker_partners
      set invite_status = ?,
          invite_last_error = ?,
          updated_at = ?
      where id = ?
    `).bind("send_failed", emailResult.reason || "Invitation email failed.", new Date().toISOString(), broker.id).run();
    return emailResult;
  }

  await env.LEADS_DB.prepare(`
    update broker_partners
    set invite_status = ?,
        invited_at = coalesce(invited_at, ?),
        invite_sent_count = coalesce(invite_sent_count, 0) + 1,
        last_invited_at = ?,
        invite_last_error = ?,
        updated_at = ?
    where id = ?
  `).bind("sent", now, now, "", now, broker.id).run();
  return { sent: true };
}

function brokerFromForm(formData) {
  return {
    id: normalizeText(formData.get("id")),
    name: normalizeText(formData.get("name")),
    email: normalizeText(formData.get("email")),
    phone: normalizeText(formData.get("phone")),
    company: normalizeText(formData.get("company")),
    markets: parseMarkets(formData.get("markets")),
    spaceTypes: normalizeSpaceTypes(formData.getAll("spaceTypes")),
    status: normalizeStatus(formData.get("status")),
    notes: normalizeText(formData.get("notes")),
  };
}

function renderMarketTags(markets) {
  if (!markets.length) return `<span class="muted">No markets configured.</span>`;
  return markets.map((market) => `<span class="tag">${escapeHtml(formatMarketLine(market))}</span>`).join("");
}

function renderSpaceTypeTags(spaceTypes) {
  if (!spaceTypes.length) return `<span class="muted">All / not specified</span>`;
  return spaceTypes.map((spaceType) => `<span class="tag">${escapeHtml(spaceType)}</span>`).join("");
}

function renderBrokerList(brokers, token) {
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>Broker Partners</h2>
        <p>Trusted brokers who have agreed to accept referrals by market and space type.</p>
      </div>
      <div class="broker-list">
        ${brokers.length ? brokers.map((broker) => `
          <article class="broker-card">
            <div class="broker-card__header">
              <div>
                <h3>${escapeHtml(broker.name)}</h3>
                <p>${escapeHtml([broker.company, broker.email].filter(Boolean).join(" · "))}</p>
              </div>
              ${statusBadge(broker.status)}
            </div>
            <dl class="broker-grid">
              <div><dt>Phone</dt><dd>${escapeHtml(broker.phone || "Not provided")}</dd></div>
              <div><dt>Invitation</dt><dd>${inviteStatusBadge(broker)}</dd></div>
              <div><dt>Last invited</dt><dd>${escapeHtml(formatDate(broker.lastInvitedAt) || "Not invited")}</dd></div>
              <div><dt>Invite expires</dt><dd>${escapeHtml(formatDate(broker.inviteTokenExpiresAt) || "No active invite")}</dd></div>
              <div><dt>Accepted</dt><dd>${escapeHtml(formatDate(broker.acceptedAt) || "Not accepted")}</dd></div>
              <div><dt>Space Types</dt><dd class="tag-list">${renderSpaceTypeTags(broker.spaceTypes)}</dd></div>
              <div><dt>Invite count</dt><dd>${escapeHtml(broker.inviteSentCount || 0)}</dd></div>
              <div class="broker-grid__wide"><dt>Markets Served</dt><dd class="tag-list">${renderMarketTags(broker.markets)}</dd></div>
              ${broker.notes ? `<div class="broker-grid__wide"><dt>Notes</dt><dd>${escapeHtml(broker.notes)}</dd></div>` : ""}
              ${broker.inviteLastError ? `<div class="broker-grid__wide"><dt>Invite error</dt><dd class="error-text">${escapeHtml(broker.inviteLastError)}</dd></div>` : ""}
            </dl>
            <div class="broker-actions">
              <a class="button-link" href="/admin/brokers?token=${encodeURIComponent(token)}&edit=${encodeURIComponent(broker.id)}">Edit Broker</a>
              ${canInviteBroker(broker) ? `
                <form method="POST" action="/admin/brokers" onsubmit="return confirm('Send broker invitation to ${escapeHtml(broker.email)}?');">
                  <input type="hidden" name="token" value="${escapeHtml(token)}">
                  <input type="hidden" name="action" value="invite">
                  <input type="hidden" name="id" value="${escapeHtml(broker.id)}">
                  <button class="button-link button-link--primary" type="submit">${displayedInviteStatus(broker) === "not_sent" ? "Invite" : "Resend Invite"}</button>
                </form>
              ` : ""}
            </div>
          </article>
        `).join("") : `<p class="empty">No broker partners have been added yet.</p>`}
      </div>
    </section>
  `;
}

function renderBrokerForm({ token, broker, notice, error }) {
  const editing = Boolean(broker && broker.id);
  const selectedSpaceTypes = new Set((broker && broker.spaceTypes) || []);
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>${editing ? "Edit Broker Partner" : "Add Broker Partner"}</h2>
        <p>Markets use one line per coverage area. Format: State | County | City | District.</p>
      </div>
      ${notice ? `<div class="notice">${escapeHtml(notice)}</div>` : ""}
      ${error ? `<div class="notice notice--error">${escapeHtml(error)}</div>` : ""}
      <form method="POST" action="/admin/brokers" class="broker-form">
        <input type="hidden" name="token" value="${escapeHtml(token)}">
        <input type="hidden" name="id" value="${escapeHtml((broker && broker.id) || "")}">
        <label>Name <input name="name" required value="${escapeHtml((broker && broker.name) || "")}"></label>
        <label>Email <input name="email" type="email" required value="${escapeHtml((broker && broker.email) || "")}"></label>
        <label>Phone <input name="phone" value="${escapeHtml((broker && broker.phone) || "")}"></label>
        <label>Company <input name="company" value="${escapeHtml((broker && broker.company) || "")}"></label>
        <label>Status
          <select name="status">
            ${BROKER_STATUSES.map((status) => `<option value="${escapeHtml(status)}"${normalizeStatus(broker && broker.status) === status ? " selected" : ""}>${escapeHtml(statusLabel(status))}</option>`).join("")}
          </select>
        </label>
        <label class="broker-form__wide">Markets
          <textarea name="markets" rows="5" placeholder="CA | Orange County | Irvine&#10;CA | Los Angeles County | Los Angeles | Financial District">${escapeHtml(formatMarkets((broker && broker.markets) || []))}</textarea>
        </label>
        <fieldset class="broker-form__wide">
          <legend>Space Types</legend>
          <div class="checkbox-grid">
            ${SPACE_TYPES.map((spaceType) => `
              <label><input type="checkbox" name="spaceTypes" value="${escapeHtml(spaceType)}"${selectedSpaceTypes.has(spaceType) ? " checked" : ""}> ${escapeHtml(spaceType)}</label>
            `).join("")}
          </div>
        </fieldset>
        <label class="broker-form__wide">Notes
          <textarea name="notes" rows="4">${escapeHtml((broker && broker.notes) || "")}</textarea>
        </label>
        <div class="broker-form__actions">
          <button type="submit">${editing ? "Save Broker" : "Add Broker"}</button>
          ${editing ? `<a href="/admin/brokers?token=${encodeURIComponent(token)}">Cancel edit</a>` : ""}
        </div>
      </form>
    </section>
  `;
}

function renderPage({ token, brokers, broker, notice, error }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Broker Partners | Rofo Admin</title>
  <style>
    :root { color-scheme: light; --bg: #f5f7fb; --surface: #fff; --ink: #111827; --muted: #64748b; --border: #dce5f2; --blue: #1746cc; --green: #166534; --red: #991b1b; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    a { color: var(--blue); }
    .shell { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 30px 0 56px; }
    header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 22px; }
    h1 { margin: 0 0 8px; font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1; }
    h2, h3, p { margin: 0; }
    header p, .section-heading p, .broker-card p { color: var(--muted); line-height: 1.5; }
    .nav { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
    .button-link { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; padding: 0 12px; border: 1px solid var(--border); border-radius: 999px; background: #fff; color: var(--blue); font-size: .9rem; font-weight: 800; text-decoration: none; white-space: nowrap; }
    .button-link--active { border-color: #bfdbfe; background: #eff6ff; color: #1e40af; }
    .panel { margin-top: 16px; padding: 20px; border: 1px solid var(--border); border-radius: 18px; background: var(--surface); box-shadow: 0 12px 30px rgba(15, 23, 42, .06); }
    .section-heading { display: grid; gap: 6px; margin-bottom: 14px; }
    .broker-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    label, legend { display: grid; gap: 6px; color: #334155; font-size: .84rem; font-weight: 850; }
    input, select, textarea { width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 10px 11px; font: inherit; background: #fff; color: var(--ink); }
    textarea { resize: vertical; }
    fieldset { margin: 0; border: 1px solid var(--border); border-radius: 12px; padding: 12px; }
    .broker-form__wide { grid-column: 1 / -1; }
    .checkbox-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
    .checkbox-grid label { display: flex; align-items: center; gap: 7px; font-weight: 750; }
    .checkbox-grid input { width: auto; }
    button { border: 0; border-radius: 10px; padding: 12px 16px; background: var(--blue); color: #fff; font-weight: 900; cursor: pointer; }
    .broker-form__actions { display: flex; gap: 14px; align-items: center; grid-column: 1 / -1; }
    .broker-list { display: grid; gap: 14px; }
    .broker-card { border: 1px solid var(--border); border-radius: 14px; padding: 16px; background: #fbfdff; }
    .broker-card__header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; padding-bottom: 12px; border-bottom: 1px solid #edf2f7; }
    .badge { display: inline-flex; padding: 6px 10px; border-radius: 999px; background: #e2e8f0; color: #334155; font-size: .76rem; font-weight: 900; }
    .badge--active { background: #dcfce7; color: var(--green); }
    .badge--pending { background: #fef3c7; color: #92400e; }
    .badge--inactive { background: #f1f5f9; color: #64748b; }
    .badge--invite-not_sent { background: #f1f5f9; color: #64748b; }
    .badge--invite-sent { background: #dbeafe; color: #1e40af; }
    .badge--invite-accepted { background: #dcfce7; color: var(--green); }
    .badge--invite-declined, .badge--invite-expired, .badge--invite-send_failed { background: #fee2e2; color: var(--red); }
    .broker-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 14px 0 0; }
    .broker-grid__wide { grid-column: 1 / -1; }
    dt { color: var(--muted); font-size: .72rem; font-weight: 900; letter-spacing: .04em; text-transform: uppercase; }
    dd { margin: 4px 0 0; overflow-wrap: anywhere; }
    .tag-list { display: flex; flex-wrap: wrap; gap: 7px; }
    .tag { display: inline-flex; border: 1px solid #dbe5f3; border-radius: 999px; padding: 5px 9px; background: #fff; color: #334155; font-size: .82rem; font-weight: 750; }
    .broker-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 14px; }
    .broker-actions form { margin: 0; }
    .button-link--primary { background: var(--blue); border-color: var(--blue); color: #fff; cursor: pointer; }
    .error-text { color: var(--red); font-weight: 750; }
    .notice { margin: 0 0 14px; padding: 12px 14px; border: 1px solid #bfdbfe; border-radius: 12px; background: #eff6ff; color: #1e40af; font-weight: 800; }
    .notice--error { border-color: #fecaca; background: #fff1f2; color: var(--red); }
    .muted, .empty { color: var(--muted); }
    @media (max-width: 820px) {
      header, .broker-card__header { display: grid; }
      .nav { justify-content: flex-start; }
      .broker-form, .broker-grid, .checkbox-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div>
        <h1>Broker Partners</h1>
        <p>Manage trusted broker partners by market, space type, and referral readiness.</p>
      </div>
      <nav class="nav" aria-label="Admin links">
        <a class="button-link" href="/admin/operations?token=${encodeURIComponent(token)}">Operations</a>
        <a class="button-link button-link--active" href="/admin/brokers?token=${encodeURIComponent(token)}">Broker Partners</a>
        <a class="button-link" href="/admin/leads?token=${encodeURIComponent(token)}">Lead Dashboard</a>
        <a class="button-link" href="/admin/compass?token=${encodeURIComponent(token)}">Rofo Compass</a>
        <a class="button-link" href="/admin/coverage?token=${encodeURIComponent(token)}">Compass Coverage</a>
      </nav>
    </header>
    ${renderBrokerForm({ token, broker, notice, error })}
    ${renderBrokerList(brokers, token)}
  </main>
</body>
</html>`;
}

export async function onRequestGet({ request, env }) {
  const configuredToken = env.ADMIN_DASHBOARD_TOKEN;
  if (!configuredToken) return adminResponse("Admin dashboard is not configured.", 403);

  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  if (token !== configuredToken) return adminResponse("Forbidden", 403);

  try {
    await ensureBrokerTable(env);
    const editId = normalizeText(url.searchParams.get("edit"));
    const broker = editId ? await getBroker(env, editId) : null;
    const brokers = await listBrokers(env);
    return adminResponse(renderPage({
      token,
      brokers,
      broker,
      notice: normalizeText(url.searchParams.get("notice")),
      error: broker || !editId ? "" : "Broker partner not found.",
    }));
  } catch (error) {
    return adminResponse(`<h1>Broker Partners error</h1><p>${escapeHtml(error.message)}</p>`, 500);
  }
}

export async function onRequestPost({ request, env }) {
  const configuredToken = env.ADMIN_DASHBOARD_TOKEN;
  if (!configuredToken) return adminResponse("Admin dashboard is not configured.", 403);

  const formData = await request.formData();
  const token = formData.get("token") || "";
  if (token !== configuredToken) return adminResponse("Forbidden", 403);

  const action = normalizeText(formData.get("action") || "save");
  if (action === "invite") {
    const id = normalizeText(formData.get("id"));
    if (!id) return adminResponse("Missing broker id", 400);
    try {
      await ensureBrokerTable(env);
      const broker = await getBroker(env, id);
      if (!broker) return adminResponse("Broker partner not found", 404);
      if (!canInviteBroker(broker)) {
        return adminRedirect(`/admin/brokers?${new URLSearchParams({ token, notice: "Broker is not eligible for invitation." }).toString()}`);
      }
      const result = await sendInvitation(env, request, broker);
      const notice = result.sent
        ? `Invitation sent to ${broker.email}.`
        : `Invitation failed for ${broker.email}: ${result.reason || "unknown error"}`;
      return adminRedirect(`/admin/brokers?${new URLSearchParams({ token, notice }).toString()}`);
    } catch (error) {
      return adminResponse(`<h1>Broker invitation error</h1><p>${escapeHtml(error.message)}</p>`, 500);
    }
  }

  const broker = brokerFromForm(formData);
  if (!broker.name || !broker.email) {
    const params = new URLSearchParams({ token, notice: "Name and email are required." });
    if (broker.id) params.set("edit", broker.id);
    return adminRedirect(`/admin/brokers?${params.toString()}`);
  }

  try {
    await ensureBrokerTable(env);
    await saveBroker(env, broker);
    return adminRedirect(`/admin/brokers?${new URLSearchParams({ token, notice: "Broker partner saved." }).toString()}`);
  } catch (error) {
    return adminResponse(`<h1>Broker Partners error</h1><p>${escapeHtml(error.message)}</p>`, 500);
  }
}
