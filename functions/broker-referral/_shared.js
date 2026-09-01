import { escapeHtml, getLocationRequirementSummary } from "../api/leads/_shared.js";
import { BROKER_READINESS, assessBrokerReadiness, buildProjectSnapshotFromLead, projectSnapshotTextLines } from "../_shared/project-snapshot.js";

export const REFERRAL_STATUSES = ["draft", "sent", "viewed", "accepted", "declined", "expired", "completed", "cancelled"];
export const DEFAULT_REFERRAL_EXPIRATION_DAYS = 7;

export function normalizeText(value) {
  return String(value || "").trim();
}

export function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

export function randomId(prefix = "ref") {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return `${prefix}_${[...array].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function randomToken(bytes = 32) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return [...array].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
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

export function getBaseUrl(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
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

export async function ensureReferralTable(env) {
  if (!env.LEADS_DB) {
    throw new Error("LEADS_DB D1 binding is required for referral storage.");
  }

  await env.LEADS_DB.prepare(`
    create table if not exists referrals (
      id text primary key,
      lead_id text not null,
      broker_partner_id text not null,
      status text not null default 'draft',
      created_at text not null,
      sent_at text,
      email_delivered_at text,
      email_opened_at text,
      brief_viewed_at text,
      accepted_at text,
      declined_at text,
      expired_at text,
      contact_revealed_at text,
      expires_at text,
      token_hash text,
      created_by text,
      notes text
    )
  `).run();

  await addColumnIfMissing(env.LEADS_DB, "alter table referrals add column email_delivery_error text");
  await env.LEADS_DB.prepare("create index if not exists idx_referrals_lead_id on referrals(lead_id)").run();
  await env.LEADS_DB.prepare("create index if not exists idx_referrals_broker_partner_id on referrals(broker_partner_id)").run();
  await env.LEADS_DB.prepare("create index if not exists idx_referrals_status on referrals(status)").run();
  await env.LEADS_DB.prepare("create index if not exists idx_referrals_token_hash on referrals(token_hash)").run();
}

export async function ensureBrokerPartnerTable(env) {
  if (!env.LEADS_DB) return;
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
}

export function normalizeReferralRow(row) {
  return {
    id: row.id,
    leadId: row.lead_id,
    brokerPartnerId: row.broker_partner_id,
    status: row.status || "draft",
    createdAt: row.created_at || "",
    sentAt: row.sent_at || "",
    emailDeliveredAt: row.email_delivered_at || "",
    emailOpenedAt: row.email_opened_at || "",
    briefViewedAt: row.brief_viewed_at || "",
    acceptedAt: row.accepted_at || "",
    declinedAt: row.declined_at || "",
    expiredAt: row.expired_at || "",
    contactRevealedAt: row.contact_revealed_at || "",
    expiresAt: row.expires_at || "",
    tokenHash: row.token_hash || "",
    createdBy: row.created_by || "",
    notes: row.notes || "",
    emailDeliveryError: row.email_delivery_error || "",
    brokerName: row.broker_name || "",
    brokerEmail: row.broker_email || "",
    brokerCompany: row.broker_company || "",
  };
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
    status: row.status || "pending",
  };
}

export function normalizeLeadRow(row) {
  return {
    id: row.id,
    status: row.status,
    lead: parseJson(row.lead_json, {}),
    officefinderPayload: parseJson(row.officefinder_json, {}),
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

export async function getLeadRow(env, leadId) {
  const row = await env.LEADS_DB.prepare("select * from leads where id = ?").bind(leadId).first();
  return row ? normalizeLeadRow(row) : null;
}

export async function getBrokerPartner(env, brokerId) {
  await ensureBrokerPartnerTable(env);
  const row = await env.LEADS_DB.prepare("select * from broker_partners where id = ?").bind(brokerId).first();
  return row ? normalizeBrokerRow(row) : null;
}

export async function getReferralByToken(env, token) {
  await ensureReferralTable(env);
  const tokenHash = await sha256(token);
  const row = await env.LEADS_DB.prepare(`
    select r.*, b.name as broker_name, b.email as broker_email, b.company as broker_company
    from referrals r
    left join broker_partners b on b.id = r.broker_partner_id
    where r.token_hash = ?
  `).bind(tokenHash).first();
  return row ? normalizeReferralRow(row) : null;
}

export async function getReferralBundleByToken(env, token) {
  const referral = await getReferralByToken(env, token);
  if (!referral) return null;
  const leadRow = await getLeadRow(env, referral.leadId);
  const broker = await getBrokerPartner(env, referral.brokerPartnerId);
  return { referral, leadRow, broker };
}

export async function listReferralsForLeads(env, leadIds) {
  await ensureReferralTable(env);
  if (!leadIds.length) return new Map();
  const result = await env.LEADS_DB.prepare(`
    select r.*, b.name as broker_name, b.email as broker_email, b.company as broker_company
    from referrals r
    left join broker_partners b on b.id = r.broker_partner_id
    where r.lead_id in (${leadIds.map(() => "?").join(", ")})
    order by r.created_at desc
  `).bind(...leadIds).all();
  const map = new Map();
  for (const row of result.results || []) {
    const referral = normalizeReferralRow(row);
    if (!map.has(referral.leadId)) map.set(referral.leadId, []);
    map.get(referral.leadId).push(referral);
  }
  return map;
}

export async function listReferralsForBroker(env, brokerId, limit = 20) {
  await ensureReferralTable(env);
  const result = await env.LEADS_DB.prepare(`
    select r.*, b.name as broker_name, b.email as broker_email, b.company as broker_company
    from referrals r
    left join broker_partners b on b.id = r.broker_partner_id
    where r.broker_partner_id = ?
    order by r.created_at desc
    limit ?
  `).bind(brokerId, limit).all();
  return (result.results || []).map(normalizeReferralRow);
}

export function referralStatusLabel(status) {
  return String(status || "draft")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getLeadMarket(lead) {
  if (!lead) return "";
  if (lead.lead_type === "location_profile") {
    return getLocationRequirementSummary(lead).location;
  }
  return lead.location_display || lead.market || [lead.city, lead.state].filter(Boolean).join(", ");
}

export function getLeadSpaceType(lead) {
  return lead.requested_space_type || lead.space_type || lead.effective_space_type || "";
}

export function getLeadSize(lead) {
  return lead.space_needed || lead.size || "";
}

export function getLeadBusinessType(lead) {
  return lead.company ? `${lead.company}` : lead.business_type || lead.customer_type || "Business profile not specified";
}

export function getLeadPriorities(lead) {
  return String(lead.business_priorities || lead.priorities || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getLeadQuestions(lead) {
  return String(lead.questions_to_validate || lead.questions || "")
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getBriefUrl(lead) {
  return lead.location_brief_url || "";
}

export function buildReferralSummary(lead) {
  const snapshot = buildProjectSnapshotFromLead(lead);
  return {
    market: snapshot.market || getLeadMarket(lead),
    spaceType: snapshot.propertyType || getLeadSpaceType(lead),
    size: snapshot.approximateSize || getLeadSize(lead),
    businessType: snapshot.businessUse || getLeadBusinessType(lead),
    priorities: getLeadPriorities(lead),
    questions: getLeadQuestions(lead),
    recommendedMarketPath: lead.recommended_market_path || "",
    notes: lead.notes || lead.requirements || lead.message || "",
    briefUrl: getBriefUrl(lead),
    contextLines: projectSnapshotTextLines(snapshot),
  };
}

export async function createReferral(env, request, { leadId, brokerPartnerId, createdBy = "admin", notes = "" }) {
  await ensureReferralTable(env);
  const leadRow = await getLeadRow(env, leadId);
  if (!leadRow) throw new Error("Lead not found.");
  const broker = await getBrokerPartner(env, brokerPartnerId);
  if (!broker) throw new Error("Broker partner not found.");
  if (broker.status !== "active") throw new Error("Broker partner must be active before receiving referrals.");
  if (!broker.email) throw new Error("Broker partner email is required.");

  const now = new Date().toISOString();
  const rawToken = randomToken(32);
  const tokenHash = await sha256(rawToken);
  const expiresAt = addDaysIso(Number(env.BROKER_REFERRAL_EXPIRATION_DAYS || DEFAULT_REFERRAL_EXPIRATION_DAYS));
  const id = randomId("referral");
  await env.LEADS_DB.prepare(`
    insert into referrals (
      id, lead_id, broker_partner_id, status, created_at, sent_at, expires_at, token_hash, created_by, notes
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, leadId, brokerPartnerId, "draft", now, "", expiresAt, tokenHash, createdBy, notes).run();

  const referral = {
    id,
    leadId,
    brokerPartnerId,
    status: "draft",
    createdAt: now,
    expiresAt,
    tokenHash,
    createdBy,
    notes,
  };
  return { referral, leadRow, broker, token: rawToken };
}

export function buildReferralEmail({ request, referral, leadRow, broker, token }) {
  const lead = leadRow.lead || {};
  const summary = buildReferralSummary(lead);
  const referralUrl = `${getBaseUrl(request)}/broker/referral/${encodeURIComponent(token)}`;
  const subject = `New location opportunity: ${summary.market || "Market"} ${summary.spaceType || "Commercial"} Search`;
  const text = [
    `Hi ${broker.name || "there"},`,
    "",
    `A business is looking for guidance on finding ${summary.spaceType || "commercial"} space in ${summary.market || "your market"}, and based on your market coverage we'd like to introduce this opportunity to you.`,
    "",
    "The customer has already completed a detailed Location Brief describing their business requirements, priorities, and preferred location.",
    "",
    "Please review the brief and decide whether you'd like to assist them.",
    "",
    "If you accept the referral, we'll immediately reveal the customer's contact information so you can begin the conversation.",
    "",
    "Opportunity Summary:",
    `Preferred Market: ${summary.market || "Not specified"}`,
    `Business: ${summary.businessType || "Not specified"}`,
    `Space Requirement: ${summary.spaceType || "Not specified"}`,
    `Size Requirement: ${summary.size || "Not specified"}`,
    ...summary.contextLines.filter((line) => !/^(Market|Property Type|Business \/ Use|Approximate Size):/.test(line)),
    summary.recommendedMarketPath ? `Recommended market path: ${summary.recommendedMarketPath}` : "",
    "",
    "Reviewing this opportunity does not commit you to accepting it.",
    "",
    "If you decide to help, simply accept the referral and we'll immediately reveal the customer's contact information so you can reach out directly.",
    "",
    "Please review this opportunity as soon as practical so we can connect the customer with the right local expert.",
    "",
    `Review Location Brief: ${referralUrl}`,
  ].filter((line) => line !== "").join("\n");
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f4f7fb;margin:0;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr><td style="padding:24px;background:#123f8c;color:#ffffff;">
            <div style="font-size:12px;line-height:16px;text-transform:uppercase;letter-spacing:.08em;color:#bfdbfe;font-weight:700;">Rofo partner referral</div>
            <h1 style="margin:8px 0 0;font-size:26px;line-height:32px;">A business is looking for your expertise</h1>
          </td></tr>
          <tr><td style="padding:24px;">
            <p style="margin:0 0 14px;font-size:15px;line-height:23px;">Hi ${escapeHtml(broker.name || "there")},</p>
            <p style="margin:0 0 14px;font-size:15px;line-height:23px;">A business is looking for guidance on finding ${escapeHtml(summary.spaceType || "commercial")} space in ${escapeHtml(summary.market || "your market")}, and based on your market coverage we'd like to introduce this opportunity to you.</p>
            <p style="margin:0 0 14px;font-size:15px;line-height:23px;">The customer has already completed a detailed Location Brief describing their business requirements, priorities, and preferred location.</p>
            <p style="margin:0 0 18px;font-size:15px;line-height:23px;">Please review the brief and decide whether you'd like to assist them. If you accept the referral, we'll immediately reveal the customer's contact information so you can begin the conversation.</p>
            <h2 style="margin:20px 0 10px;font-size:16px;line-height:22px;">Opportunity Summary</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 18px;">
              ${[
                ["Preferred Market", summary.market],
                ["Business", summary.businessType],
                ["Space Requirement", summary.spaceType],
                ["Size Requirement", summary.size],
                ["Recommended market path", summary.recommendedMarketPath],
                ["Requirement context", summary.contextLines.filter((line) => !/^(Market|Property Type|Business \/ Use|Approximate Size):/.test(line)).join(" • ")],
              ].filter(([, value]) => value).map(([label, value]) => `
                <tr>
                  <td style="padding:8px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;text-transform:uppercase;font-weight:700;">${escapeHtml(label)}</td>
                  <td style="padding:8px;border-top:1px solid #e2e8f0;font-size:14px;">${escapeHtml(value)}</td>
                </tr>
              `).join("")}
            </table>
            <p style="margin:0 0 14px;color:#64748b;font-size:13px;line-height:20px;">Reviewing this opportunity does not commit you to accepting it. If you decide to help, simply accept the referral and we'll immediately reveal the customer's contact information so you can reach out directly.</p>
            <p style="margin:0 0 18px;color:#334155;font-size:14px;line-height:21px;">Please review this opportunity as soon as practical so we can connect the customer with the right local expert.</p>
            <p style="margin:24px 0;"><a href="${escapeHtml(referralUrl)}" style="display:inline-block;background:#123f8c;color:#ffffff;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700;">Review Location Brief</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
  return { subject, text, html };
}

export async function sendReferralEmail(env, request, referral, leadRow, broker, token) {
  if (!env.RESEND_API_KEY) {
    return { sent: false, reason: "RESEND_API_KEY is not configured" };
  }
  const email = buildReferralEmail({ request, referral, leadRow, broker, token });
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

export async function markReferralSent(env, referralId) {
  const now = new Date().toISOString();
  await env.LEADS_DB.prepare(`
    update referrals
    set status = ?, sent_at = ?, email_delivery_error = ?
    where id = ?
  `).bind("sent", now, "", referralId).run();
}

export async function markReferralSendFailed(env, referralId, reason) {
  await env.LEADS_DB.prepare(`
    update referrals
    set status = ?, email_delivery_error = ?
    where id = ?
  `).bind("draft", reason || "Referral email failed.", referralId).run();
}

export async function createAndSendReferral(env, request, options) {
  const leadRow = await getLeadRow(env, options.leadId);
  if (!leadRow) throw new Error("Lead not found.");
  const readiness = assessBrokerReadiness(leadRow.lead);
  if (readiness.status !== BROKER_READINESS.READY && options.readinessOverride !== true) {
    throw new Error(`${readiness.label}: ${readiness.summary}`);
  }
  const created = await createReferral(env, request, options);
  const email = await sendReferralEmail(env, request, created.referral, created.leadRow, created.broker, created.token);
  if (!email.sent) {
    await markReferralSendFailed(env, created.referral.id, email.reason);
    return { ...created, email };
  }
  await markReferralSent(env, created.referral.id);
  return {
    ...created,
    referral: { ...created.referral, status: "sent", sentAt: new Date().toISOString() },
    email,
  };
}
