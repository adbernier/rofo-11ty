import { escapeHtml } from "../api/leads/_shared.js";
import {
  adminResponse,
  ensureBrokerTable,
  formatDate,
  getBrokerByInviteToken,
  getPartnerExpectations,
  getSampleBriefUrl,
  getTermsSummary,
  inviteStatusLabel,
  isExpired,
  renderCoverageSummary,
} from "./_shared.js";

function renderList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderDecisionPage({ broker, request, env, token, state = "" }) {
  const terms = getTermsSummary(env);
  const expectations = getPartnerExpectations(env);
  const coverage = renderCoverageSummary(broker);
  const sampleBriefUrl = getSampleBriefUrl(env, request);
  const expired = state === "expired";
  const decided = ["accepted", "declined"].includes(state);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rofo Broker Partner Invitation</title>
  <style>
    :root { color-scheme: light; --bg: #f5f7fb; --surface: #fff; --ink: #111827; --muted: #64748b; --border: #dce5f2; --blue: #1746cc; --green: #166534; --red: #991b1b; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    a { color: var(--blue); }
    .shell { width: min(860px, calc(100% - 32px)); margin: 0 auto; padding: 40px 0 64px; }
    .card { border: 1px solid var(--border); border-radius: 20px; background: var(--surface); box-shadow: 0 18px 45px rgba(15, 23, 42, .08); overflow: hidden; }
    header { padding: 28px; background: #123f8c; color: #fff; }
    .eyebrow { color: #bfdbfe; font-size: 12px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
    h1 { margin: 8px 0 0; font-size: clamp(2rem, 5vw, 3.2rem); line-height: 1; }
    h2 { margin: 0 0 10px; font-size: 1.1rem; }
    p { margin: 0; color: var(--muted); line-height: 1.6; }
    .body { display: grid; gap: 22px; padding: 28px; }
    .section { display: grid; gap: 10px; }
    .summary-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .summary-grid div { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: #f8fbff; }
    dt { color: var(--muted); font-size: .72rem; font-weight: 900; letter-spacing: .04em; text-transform: uppercase; }
    dd { margin: 4px 0 0; overflow-wrap: anywhere; }
    ul { margin: 0; padding-left: 20px; color: #334155; line-height: 1.6; }
    .cta-row { display: flex; flex-wrap: wrap; gap: 12px; padding-top: 6px; }
    button, .button-link { border: 0; border-radius: 10px; padding: 12px 16px; font: inherit; font-weight: 900; text-decoration: none; cursor: pointer; }
    .button--accept { background: var(--green); color: #fff; }
    .button--decline { background: #fff1f2; color: var(--red); border: 1px solid #fecaca; }
    .notice { border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px; background: #eff6ff; color: #1e40af; font-weight: 800; }
    .notice--bad { border-color: #fecaca; background: #fff1f2; color: var(--red); }
    .footer-note { font-size: .9rem; }
    @media (max-width: 700px) { .summary-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main class="shell">
    <article class="card">
      <header>
        <div class="eyebrow">Rofo broker partner invitation</div>
        <h1>${decided ? "Invitation response recorded" : expired ? "Invitation expired" : "Review your broker partner invitation"}</h1>
      </header>
      <div class="body">
        ${state === "accepted" ? `<div class="notice">Thank you. Your broker partner invitation has been accepted.</div>` : ""}
        ${state === "declined" ? `<div class="notice">Your response has been recorded. You declined this broker partner invitation.</div>` : ""}
        ${expired ? `<div class="notice notice--bad">This invitation link has expired. Please ask Rofo for a new invitation.</div>` : ""}
        <section class="section">
          <h2>Broker partner record</h2>
          <dl class="summary-grid">
            <div><dt>Name</dt><dd>${escapeHtml(broker.name)}</dd></div>
            <div><dt>Company</dt><dd>${escapeHtml(broker.company || "Not provided")}</dd></div>
            <div><dt>Email</dt><dd>${escapeHtml(broker.email)}</dd></div>
            <div><dt>Invitation</dt><dd>${escapeHtml(inviteStatusLabel(broker.inviteStatus))}${broker.inviteTokenExpiresAt ? ` · expires ${escapeHtml(formatDate(broker.inviteTokenExpiresAt))}` : ""}</dd></div>
          </dl>
        </section>
        <section class="section">
          <h2>Assigned markets</h2>
          <ul>${renderList(coverage.markets)}</ul>
        </section>
        <section class="section">
          <h2>Assigned space types</h2>
          <ul>${renderList(coverage.spaceTypes)}</ul>
        </section>
        <section class="section">
          <h2>Sample Location Brief</h2>
          <p><a href="${escapeHtml(sampleBriefUrl)}">View a sample Location Brief</a></p>
        </section>
        ${terms ? `<section class="section"><h2>Financial terms</h2><p>${escapeHtml(terms)}</p></section>` : ""}
        <section class="section">
          <h2>Partner expectations</h2>
          <ul>${renderList(expectations)}</ul>
        </section>
        ${!expired && !decided ? `
          <form method="POST" class="cta-row">
            <button class="button--accept" name="decision" value="accept" type="submit">Accept Invitation</button>
            <button class="button--decline" name="decision" value="decline" type="submit">Decline Invitation</button>
          </form>
        ` : ""}
        <p class="footer-note">This onboarding invitation does not include customer lead details. Lead referral acceptance is a separate future workflow.</p>
      </div>
    </article>
  </main>
</body>
</html>`;
}

function invalidPage(message, status = 404) {
  return adminResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Broker Invitation</title></head><body style="font-family:system-ui,sans-serif;margin:40px;"><h1>Broker invitation unavailable</h1><p>${escapeHtml(message)}</p></body></html>`, status);
}

async function expireInvite(env, broker) {
  await env.LEADS_DB.prepare(`
    update broker_partners
    set invite_status = ?,
        invite_token = ?,
        updated_at = ?
    where id = ?
  `).bind("expired", "", new Date().toISOString(), broker.id).run();
  return { ...broker, inviteStatus: "expired", inviteToken: "" };
}

export async function onRequestGet({ request, env, params }) {
  const token = String(params && params.token || "").trim();
  if (!token) return invalidPage("Missing invitation token.", 400);

  await ensureBrokerTable(env);
  let broker = await getBrokerByInviteToken(env, token);
  if (!broker) return invalidPage("This invitation link is invalid or has already been used.", 404);
  if (broker.inviteStatus !== "sent") return invalidPage(`This invitation is ${inviteStatusLabel(broker.inviteStatus).toLowerCase()}.`, 409);
  if (isExpired(broker.inviteTokenExpiresAt)) {
    broker = await expireInvite(env, broker);
    return adminResponse(renderDecisionPage({ broker, request, env, token, state: "expired" }), 410);
  }
  return adminResponse(renderDecisionPage({ broker, request, env, token }));
}

export async function onRequestPost({ request, env, params }) {
  const token = String(params && params.token || "").trim();
  if (!token) return invalidPage("Missing invitation token.", 400);

  const formData = await request.formData();
  const decision = String(formData.get("decision") || "").trim().toLowerCase();
  if (!["accept", "decline"].includes(decision)) return invalidPage("Invalid invitation response.", 400);

  await ensureBrokerTable(env);
  let broker = await getBrokerByInviteToken(env, token);
  if (!broker) return invalidPage("This invitation link is invalid or has already been used.", 404);
  if (broker.inviteStatus !== "sent") return invalidPage(`This invitation is ${inviteStatusLabel(broker.inviteStatus).toLowerCase()}.`, 409);
  if (isExpired(broker.inviteTokenExpiresAt)) {
    broker = await expireInvite(env, broker);
    return adminResponse(renderDecisionPage({ broker, request, env, token, state: "expired" }), 410);
  }

  const now = new Date().toISOString();
  if (decision === "accept") {
    await env.LEADS_DB.prepare(`
      update broker_partners
      set invite_status = ?,
          status = ?,
          accepted_at = ?,
          invite_token = ?,
          updated_at = ?
      where id = ?
    `).bind("accepted", "active", now, "", now, broker.id).run();
    return adminResponse(renderDecisionPage({
      broker: { ...broker, inviteStatus: "accepted", status: "active", acceptedAt: now, inviteToken: "" },
      request,
      env,
      token,
      state: "accepted",
    }));
  }

  await env.LEADS_DB.prepare(`
    update broker_partners
    set invite_status = ?,
        status = ?,
        invite_token = ?,
        updated_at = ?
    where id = ?
  `).bind("declined", "inactive", "", now, broker.id).run();
  return adminResponse(renderDecisionPage({
    broker: { ...broker, inviteStatus: "declined", status: "inactive", inviteToken: "" },
    request,
    env,
    token,
    state: "declined",
  }));
}
