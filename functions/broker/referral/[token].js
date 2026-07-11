import { escapeHtml } from "../../api/leads/_shared.js";
import {
  buildReferralSummary,
  ensureReferralTable,
  getReferralBundleByToken,
  isExpired,
  referralStatusLabel,
} from "../../broker-referral/_shared.js";
import { getPartnerExpectations } from "../../broker-invite/_shared.js";

function htmlResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function invalidPage(message, status = 404) {
  return htmlResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Referral unavailable</title></head><body style="font-family:system-ui,sans-serif;margin:40px;"><h1>Referral unavailable</h1><p>${escapeHtml(message)}</p></body></html>`, status);
}

function listItems(items, empty = "Not provided") {
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!list.length) return `<li>${escapeHtml(empty)}</li>`;
  return list.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function summaryField(label, value) {
  if (!value) return "";
  return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function renderOpportunitySummary(summary) {
  const fields = [
    summaryField("Preferred Market", summary.market),
    summaryField("Space Requirement", summary.spaceType),
    summaryField("Size Requirement", summary.size),
    summaryField("Business", summary.businessType),
  ].filter(Boolean).join("");
  if (!fields) return "";
  return `
    <section class="section section--summary">
      <h2>Opportunity Summary</h2>
      <dl class="summary-grid">${fields}</dl>
    </section>
  `;
}

function renderCustomerNotes(summary) {
  if (!summary.notes) return "";
  return `
    <section class="section section--notes">
      <h2>Customer Notes</h2>
      <p>${escapeHtml(summary.notes)}</p>
    </section>
  `;
}

function renderRecommendation(summary) {
  if (!summary.recommendedMarketPath && !summary.briefUrl) return "";
  return `
    <section class="section">
      <h2>Recommendation</h2>
      ${summary.recommendedMarketPath ? `<p>${escapeHtml(summary.recommendedMarketPath)}</p>` : ""}
      ${summary.briefUrl ? `<p><a href="${escapeHtml(summary.briefUrl)}" target="_blank" rel="noopener">View the Location Brief</a></p>` : ""}
    </section>
  `;
}

function renderPriorities(summary) {
  if (!Array.isArray(summary.priorities) || !summary.priorities.length) return "";
  return `
    <section class="section">
      <h2>Business Priorities</h2>
      <ul>${listItems(summary.priorities)}</ul>
    </section>
  `;
}

function renderPointsToValidate(summary) {
  const questions = Array.isArray(summary.questions) && summary.questions.length
    ? summary.questions
    : ["Market fit", "Availability", "Pricing", "Timing"];
  return `
    <section class="section">
      <h2>Points to Validate</h2>
      <p>As the local market expert, please validate:</p>
      <ul>${listItems(questions)}</ul>
    </section>
  `;
}

async function markViewed(env, referral) {
  if (!["sent", "viewed"].includes(referral.status)) return referral;
  if (isExpired(referral.expiresAt)) {
    const now = new Date().toISOString();
    await env.LEADS_DB.prepare(`
      update referrals
      set status = ?, expired_at = ?, token_hash = ?
      where id = ?
    `).bind("expired", now, "", referral.id).run();
    return { ...referral, status: "expired", expiredAt: now, tokenHash: "" };
  }
  if (referral.status === "sent") {
    const now = new Date().toISOString();
    await env.LEADS_DB.prepare(`
      update referrals
      set status = ?, brief_viewed_at = coalesce(brief_viewed_at, ?)
      where id = ?
    `).bind("viewed", now, referral.id).run();
    return { ...referral, status: "viewed", briefViewedAt: referral.briefViewedAt || now };
  }
  if (!referral.briefViewedAt) {
    const now = new Date().toISOString();
    await env.LEADS_DB.prepare("update referrals set brief_viewed_at = ? where id = ?").bind(now, referral.id).run();
    return { ...referral, briefViewedAt: now };
  }
  return referral;
}

function contactBlock(lead) {
  return `
    <section class="section contact-panel">
      <h2>Customer Contact Information</h2>
      <dl class="summary-grid">
        <div><dt>Name</dt><dd>${escapeHtml(lead.name || "Not provided")}</dd></div>
        <div><dt>Company</dt><dd>${escapeHtml(lead.company || "Not provided")}</dd></div>
        <div><dt>Email</dt><dd>${escapeHtml(lead.email || "Not provided")}</dd></div>
        <div><dt>Phone</dt><dd>${escapeHtml(lead.phone || "Not provided")}</dd></div>
      </dl>
    </section>
  `;
}

function renderPage({ referral, leadRow, broker, env, mode = "" }) {
  const lead = (leadRow && leadRow.lead) || {};
  const summary = buildReferralSummary(lead);
  const expectations = getPartnerExpectations(env);
  const accepted = referral.status === "accepted";
  const declined = referral.status === "declined";
  const revealed = Boolean(referral.contactRevealedAt);
  const expired = referral.status === "expired";
  const terminal = ["declined", "expired", "cancelled"].includes(referral.status);
  const stateClass = revealed
    ? "state-revealed"
    : accepted
      ? "state-accepted"
      : declined
        ? "state-declined"
        : expired || referral.status === "cancelled"
          ? "state-unavailable"
          : "state-review";
  const pageTitle = revealed
    ? "Customer introduction complete"
    : accepted
      ? "Opportunity accepted"
      : declined
        ? "Opportunity passed"
        : expired || referral.status === "cancelled"
          ? "Opportunity no longer available"
          : "Review the opportunity";
  const openingCopy = revealed
    ? "The customer's contact information is now available. Please reach out promptly and use the Location Brief as context for your conversation."
    : accepted
      ? "You've accepted this opportunity. Confirm the customer introduction below to reveal their contact information."
      : declined
        ? "You've passed on this opportunity. Rofo will look for another local expert."
        : expired || referral.status === "cancelled"
          ? "This opportunity is no longer available."
          : "Review the customer's requirements, priorities, and preferred location below. If the opportunity fits your practice, accept it to continue to the customer introduction.";
  const reviewActions = !accepted && !terminal ? `
    <section class="section action-panel">
      <p>Reviewing this opportunity does not commit you to accepting it.</p>
      <form method="POST" class="cta-row">
        <button class="button--accept" name="action" value="accept" type="submit">Accept Opportunity</button>
        <button class="button--decline" name="action" value="decline" type="submit">Pass on Opportunity</button>
      </form>
    </section>
  ` : "";
  const revealAction = accepted && !revealed ? `
    <section class="section action-panel">
      <h2>Before we introduce you</h2>
      <p>By continuing, you agree to:</p>
      <ul>${listItems(expectations)}</ul>
      <form method="POST" class="cta-row">
        <button class="button--primary" name="action" value="reveal" type="submit">Reveal Customer Contact Information</button>
      </form>
    </section>
  ` : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rofo Partner Referral</title>
  <style>
    :root { color-scheme: light; --bg:#f5f7fb; --surface:#fff; --ink:#111827; --muted:#64748b; --border:#dce5f2; --blue:#1746cc; --green:#166534; --red:#991b1b; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--bg); color:var(--ink); font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    a { color:var(--blue); }
    .shell { width:min(980px, calc(100% - 32px)); margin:0 auto; padding:38px 0 64px; }
    .card { overflow:hidden; border:1px solid var(--border); border-radius:20px; background:var(--surface); box-shadow:0 18px 45px rgba(15,23,42,.08); }
    header { padding:28px; background:#123f8c; color:#fff; }
    .eyebrow { color:#bfdbfe; font-size:12px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
    h1 { margin:8px 0 0; font-size:clamp(2rem, 5vw, 3.25rem); line-height:1; }
    h2 { margin:0 0 10px; font-size:1.12rem; }
    p { margin:0; color:var(--muted); line-height:1.6; }
    .body { display:grid; gap:22px; padding:28px; }
    .section { display:grid; gap:10px; }
    .state-copy { font-size:1.02rem; color:#dbeafe; max-width:760px; margin-top:12px; }
    .section--summary { order:-2; }
    .section--notes { order:-1; }
    .state-review .action-panel { order:-1; }
    .state-review .section--notes { order:0; }
    .state-accepted .action-panel { order:-3; }
    .state-revealed .contact-panel { order:-3; }
    .state-revealed .action-panel { order:-2; }
    .state-revealed .section--summary { order:0; }
    .state-revealed .section--notes { order:1; }
    .action-panel { border:1px solid #bbf7d0; border-radius:16px; padding:16px; background:#f0fdf4; }
    .action-panel p { color:#14532d; }
    .summary-grid { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; }
    .summary-grid div { border:1px solid var(--border); border-radius:12px; padding:12px; background:#f8fbff; }
    dt { color:var(--muted); font-size:.72rem; font-weight:900; letter-spacing:.04em; text-transform:uppercase; }
    dd { margin:4px 0 0; overflow-wrap:anywhere; }
    ul { margin:0; padding-left:20px; color:#334155; line-height:1.6; }
    .notice { border:1px solid #bfdbfe; border-radius:12px; padding:14px; background:#eff6ff; color:#1e40af; font-weight:800; }
    .notice--bad { border-color:#fecaca; background:#fff1f2; color:var(--red); }
    .contact-panel { border:1px solid #bbf7d0; border-radius:16px; padding:16px; background:#f0fdf4; }
    .cta-row { display:flex; flex-wrap:wrap; gap:12px; padding-top:4px; }
    button { border:0; border-radius:10px; padding:12px 16px; font:inherit; font-weight:900; cursor:pointer; }
    .button--accept { background:var(--green); color:#fff; }
    .button--decline { background:#fff1f2; color:var(--red); border:1px solid #fecaca; }
    .button--primary { background:#123f8c; color:#fff; }
    .muted { color:var(--muted); }
    @media (max-width:720px) { .summary-grid { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <main class="shell">
    <article class="card ${escapeHtml(stateClass)}">
      <header>
        <div class="eyebrow">Rofo partner referral</div>
        <h1>${escapeHtml(pageTitle)}</h1>
        <p class="state-copy">${escapeHtml(openingCopy)}</p>
      </header>
      <div class="body">
        ${mode === "accepted" ? `<div class="notice">Opportunity accepted. Confirm below to complete the customer introduction.</div>` : ""}
        ${mode === "declined" ? `<div class="notice">Opportunity passed. No customer contact information was shared.</div>` : ""}
        ${terminal && !declined ? `<div class="notice notice--bad">This opportunity is ${escapeHtml(referralStatusLabel(referral.status).toLowerCase())}.</div>` : ""}
        ${renderOpportunitySummary(summary)}
        ${renderCustomerNotes(summary)}
        ${revealed ? `
          ${contactBlock(lead)}
          <section class="section action-panel">
            <h2>Next steps</h2>
            <ol>
              <li>Contact the customer promptly.</li>
              <li>Confirm requirements and timing.</li>
              <li>Validate the preferred geography.</li>
              <li>Keep Rofo informed of meaningful progress.</li>
            </ol>
          </section>
        ` : ""}
        ${reviewActions}
        ${revealAction}
        ${renderRecommendation(summary)}
        ${renderPriorities(summary)}
        ${renderPointsToValidate(summary)}
        ${!revealed && !terminal ? `
          <section class="section">
            <h2>Customer Introduction</h2>
            <p>To protect the customer's privacy, we'll share their contact information after you accept this opportunity and confirm the introduction.</p>
          </section>
        ` : ""}
      </div>
    </article>
  </main>
</body>
</html>`;
}

export async function onRequestGet({ request, env, params }) {
  const token = String(params && params.token || "").trim();
  if (!token) return invalidPage("Missing referral token.", 400);
  await ensureReferralTable(env);
  const bundle = await getReferralBundleByToken(env, token);
  if (!bundle) return invalidPage("This referral link is invalid or has already been used.", 404);
  const referral = await markViewed(env, bundle.referral);
  return htmlResponse(renderPage({ ...bundle, referral, env }));
}

export async function onRequestPost({ request, env, params }) {
  const token = String(params && params.token || "").trim();
  if (!token) return invalidPage("Missing referral token.", 400);
  const formData = await request.formData();
  const action = String(formData.get("action") || "").trim().toLowerCase();
  if (!["accept", "decline", "reveal"].includes(action)) return invalidPage("Invalid referral action.", 400);

  await ensureReferralTable(env);
  const bundle = await getReferralBundleByToken(env, token);
  if (!bundle) return invalidPage("This referral link is invalid or has already been used.", 404);
  let { referral } = bundle;
  if (isExpired(referral.expiresAt) && !["accepted"].includes(referral.status)) {
    referral = await markViewed(env, referral);
    return htmlResponse(renderPage({ ...bundle, referral, env }), 410);
  }

  const now = new Date().toISOString();
  if (action === "accept") {
    if (!["sent", "viewed"].includes(referral.status)) return invalidPage(`This referral is ${referralStatusLabel(referral.status).toLowerCase()}.`, 409);
    await env.LEADS_DB.prepare(`
      update referrals
      set status = ?, accepted_at = ?, brief_viewed_at = coalesce(brief_viewed_at, ?)
      where id = ?
    `).bind("accepted", now, now, referral.id).run();
    referral = { ...referral, status: "accepted", acceptedAt: now, briefViewedAt: referral.briefViewedAt || now };
    return htmlResponse(renderPage({ ...bundle, referral, env, mode: "accepted" }));
  }

  if (action === "decline") {
    if (!["sent", "viewed"].includes(referral.status)) return invalidPage(`This referral is ${referralStatusLabel(referral.status).toLowerCase()}.`, 409);
    await env.LEADS_DB.prepare(`
      update referrals
      set status = ?, declined_at = ?, token_hash = ?
      where id = ?
    `).bind("declined", now, "", referral.id).run();
    referral = { ...referral, status: "declined", declinedAt: now, tokenHash: "" };
    return htmlResponse(renderPage({ ...bundle, referral, env, mode: "declined" }));
  }

  if (referral.status !== "accepted") return invalidPage("You must accept the referral before revealing contact information.", 409);
  await env.LEADS_DB.prepare(`
    update referrals
    set contact_revealed_at = coalesce(contact_revealed_at, ?), token_hash = ?
    where id = ?
  `).bind(now, "", referral.id).run();
  referral = { ...referral, contactRevealedAt: referral.contactRevealedAt || now, tokenHash: "" };
  return htmlResponse(renderPage({ ...bundle, referral, env }));
}
