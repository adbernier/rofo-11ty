import { escapeHtml } from "../api/leads/_shared.js";

export const BROKER_STATUSES = ["active", "inactive", "pending"];
export const INVITE_STATUSES = ["not_sent", "sent", "accepted", "declined", "expired", "send_failed"];
export const SPACE_TYPES = ["office", "industrial", "warehouse", "flex", "retail", "medical", "coworking"];
export const DEFAULT_INVITE_EXPIRATION_DAYS = 14;
export const DEFAULT_PARTNER_EXPECTATIONS = [
  "Respond promptly to Rofo referral opportunities.",
  "Accept or decline opportunities within the requested review window.",
  "Contact accepted customers promptly and professionally.",
  "Provide accurate market guidance and keep Rofo updated on referral status.",
  "Protect customer information and follow applicable brokerage and licensing requirements.",
];

export function adminResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function adminRedirect(path) {
  return new Response(null, {
    status: 303,
    headers: {
      location: path,
      "cache-control": "no-store",
    },
  });
}

export function normalizeText(value) {
  return String(value || "").trim();
}

export function normalizeStatus(value) {
  const status = normalizeText(value).toLowerCase();
  return BROKER_STATUSES.includes(status) ? status : "pending";
}

export function normalizeInviteStatus(value) {
  const status = normalizeText(value).toLowerCase();
  return INVITE_STATUSES.includes(status) ? status : "not_sent";
}

export function normalizeSpaceTypes(values) {
  const list = Array.isArray(values) ? values : [values];
  return [...new Set(list.map((value) => normalizeText(value).toLowerCase()).filter((value) => SPACE_TYPES.includes(value)))];
}

export function parseMarkets(value) {
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

export function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

export function formatMarketLine(market) {
  return [market.state, market.county, market.city, market.district].filter(Boolean).join(" | ");
}

export function formatMarkets(markets) {
  return (Array.isArray(markets) ? markets : []).map(formatMarketLine).filter(Boolean).join("\n");
}

export function statusLabel(value) {
  return normalizeStatus(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

export function inviteStatusLabel(value) {
  const status = normalizeInviteStatus(value);
  const labels = {
    not_sent: "Not invited",
    sent: "Invitation sent",
    accepted: "Accepted",
    declined: "Declined",
    expired: "Expired",
    send_failed: "Send failed",
  };
  return labels[status] || "Not invited";
}

export function normalizeBrokerRow(row) {
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
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
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

export async function ensureBrokerTable(env) {
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

export async function getBroker(env, id) {
  if (!id) return null;
  await ensureBrokerTable(env);
  const row = await env.LEADS_DB.prepare("select * from broker_partners where id = ?").bind(id).first();
  return row ? normalizeBrokerRow(row) : null;
}

export async function getBrokerByInviteToken(env, token) {
  await ensureBrokerTable(env);
  const tokenHash = await sha256(token);
  const row = await env.LEADS_DB.prepare("select * from broker_partners where invite_token = ?").bind(tokenHash).first();
  return row ? normalizeBrokerRow(row) : null;
}

export function getBaseUrl(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function getSampleBriefUrl(env, request) {
  return normalizeText(env.BROKER_SAMPLE_LOCATION_BRIEF_URL) || `${getBaseUrl(request)}/example-location-brief/`;
}

export function getTermsSummary(env) {
  return normalizeText(env.BROKER_PARTNER_TERMS_SUMMARY);
}

export function getPartnerExpectations(env) {
  const configured = normalizeText(env.BROKER_PARTNER_EXPECTATIONS);
  if (!configured) return DEFAULT_PARTNER_EXPECTATIONS;
  return configured
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function randomToken(bytes = 32) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return [...array].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function addDaysIso(days) {
  return new Date(Date.now() + (days * 24 * 60 * 60 * 1000)).toISOString();
}

export function isExpired(value) {
  if (!value) return true;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) || date.getTime() <= Date.now();
}

export function formatDate(value) {
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

export function renderCoverageSummary(broker) {
  const markets = broker.markets && broker.markets.length
    ? broker.markets.map(formatMarketLine).filter(Boolean)
    : ["Market coverage to be confirmed"];
  const spaceTypes = broker.spaceTypes && broker.spaceTypes.length
    ? broker.spaceTypes
    : ["Space type coverage to be confirmed"];
  return { markets, spaceTypes };
}

function listItems(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

export function buildBrokerInviteEmail({ env, request, broker, inviteUrl }) {
  const sampleBriefUrl = getSampleBriefUrl(env, request);
  const terms = getTermsSummary(env);
  const expectations = getPartnerExpectations(env);
  const coverage = renderCoverageSummary(broker);
  const subject = `Rofo broker partner invitation${broker.company ? ` - ${broker.company}` : ""}`;
  const text = [
    `Hi ${broker.name || "there"},`,
    "",
    "Rofo helps businesses make better commercial location decisions and connects qualified searches with trusted local brokers.",
    "",
    "We are inviting you to participate as a Rofo broker partner for the coverage below.",
    "",
    "Markets:",
    ...coverage.markets.map((item) => `- ${item}`),
    "",
    "Space types:",
    ...coverage.spaceTypes.map((item) => `- ${item}`),
    "",
    `Sample Location Brief: ${sampleBriefUrl}`,
    terms ? "" : "",
    terms ? "Financial terms:" : "",
    terms || "",
    "",
    "Partner expectations:",
    ...expectations.map((item) => `- ${item}`),
    "",
    `Review and confirm participation: ${inviteUrl}`,
    "",
    "This invitation is for broker partner onboarding. It does not include customer lead information.",
  ].filter((line) => line !== "").join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f4f7fb;margin:0;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px;background:#123f8c;color:#ffffff;">
                <div style="font-size:12px;line-height:16px;text-transform:uppercase;letter-spacing:.08em;color:#bfdbfe;font-weight:700;">Rofo broker partner invitation</div>
                <h1 style="margin:8px 0 0;font-size:26px;line-height:32px;">Confirm your Rofo broker partner coverage</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 14px;font-size:15px;line-height:23px;">Hi ${escapeHtml(broker.name || "there")},</p>
                <p style="margin:0 0 14px;font-size:15px;line-height:23px;">Rofo helps businesses make better commercial location decisions and connects qualified searches with trusted local brokers.</p>
                <p style="margin:0 0 18px;font-size:15px;line-height:23px;">We are inviting you to participate as a Rofo broker partner for the coverage below.</p>
                <h2 style="margin:20px 0 8px;font-size:16px;line-height:22px;">Assigned markets</h2>
                <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:22px;">${listItems(coverage.markets)}</ul>
                <h2 style="margin:20px 0 8px;font-size:16px;line-height:22px;">Assigned space types</h2>
                <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:22px;">${listItems(coverage.spaceTypes)}</ul>
                <p style="margin:18px 0;font-size:15px;line-height:23px;"><a href="${escapeHtml(sampleBriefUrl)}" style="color:#174ea6;font-weight:700;">View a sample Location Brief</a></p>
                ${terms ? `<h2 style="margin:20px 0 8px;font-size:16px;line-height:22px;">Financial terms</h2><p style="margin:0 0 16px;font-size:14px;line-height:22px;">${escapeHtml(terms)}</p>` : ""}
                <h2 style="margin:20px 0 8px;font-size:16px;line-height:22px;">Partner expectations</h2>
                <ul style="margin:0 0 22px;padding-left:20px;font-size:14px;line-height:22px;">${listItems(expectations)}</ul>
                <p style="margin:24px 0;">
                  <a href="${escapeHtml(inviteUrl)}" style="display:inline-block;background:#123f8c;color:#ffffff;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700;">Review and confirm participation</a>
                </p>
                <p style="margin:18px 0 0;color:#64748b;font-size:13px;line-height:20px;">This invitation is for broker partner onboarding. It does not include customer lead information.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

export async function sendBrokerInvitationEmail(env, request, broker, token) {
  if (!env.RESEND_API_KEY) {
    return { sent: false, reason: "RESEND_API_KEY is not configured" };
  }

  const inviteUrl = `${getBaseUrl(request)}/broker-invite/${encodeURIComponent(token)}`;
  const email = buildBrokerInviteEmail({ env, request, broker, inviteUrl });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL || "Rofo <onboarding@resend.dev>",
      to: [broker.email],
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });

  if (!response.ok) {
    return { sent: false, reason: await response.text() };
  }

  return { sent: true };
}
