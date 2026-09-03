import {
  approveLead,
  escapeHtml,
  getLead,
  getLocationRequirementSummary,
  updateLeadStatus,
} from "../api/leads/_shared.js";
import {
  createAndSendReferral,
  ensureReferralTable,
  formatDate as formatReferralDate,
  listReferralsForLeads,
  referralStatusLabel,
} from "../broker-referral/_shared.js";
import {
  BROKER_READINESS,
  assessBrokerReadiness,
  buildProjectSnapshotFromLead,
} from "../_shared/project-snapshot.js";
import {
  MISSION_CONTROL_NAV_CSS,
  renderMissionControlHeader,
} from "./mission-control-nav.js";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const LEAD_QUALITY_SAMPLE_LIMIT = 2000;
const DEFAULT_OPERATOR_TIME_ZONE = "America/Los_Angeles";
const STATUS_VIEWS = {
  pending: ["pending", "approved_send_failed", "expert_review_requested", "market_investigation_requested"],
  sent: ["approved_sent", "broker_sent", "both_sent", "partial_sent"],
  rejected: ["rejected"],
  spam: ["spam_quarantined", "rejected_spam"],
};
const ACTIONABLE_STATUSES = ["pending", "approved_send_failed", "expert_review_requested", "market_investigation_requested"];
const LEAD_INDEX_QUERIES = [
  "create index if not exists idx_leads_created_at on leads(created_at)",
  "create index if not exists idx_leads_status on leads(status)",
  "create index if not exists idx_leads_status_created_at on leads(status, created_at)",
  "create index if not exists idx_leads_created_status on leads(created_at, status)",
];
const BROKER_PARTNER_TABLE_QUERY = `
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
`;

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

function scheduleLeadDashboardIndexes(waitUntil, db) {
  if (!db || typeof waitUntil !== "function") return;
  waitUntil((async () => {
    for (const query of LEAD_INDEX_QUERIES) {
      try {
        await db.prepare(query).run();
      } catch (error) {
        console.warn("Unable to ensure lead dashboard index", error);
        return;
      }
    }
    try {
      await db.prepare(BROKER_PARTNER_TABLE_QUERY).run();
      await db.prepare("create index if not exists idx_broker_partners_status on broker_partners(status)").run();
      await ensureReferralTable({ LEADS_DB: db });
    } catch (error) {
      console.warn("Unable to ensure partner referral tables", error);
    }
  })());
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

function normalizeOperatorTimeZone(value) {
  const timeZone = String(value || "").trim() || DEFAULT_OPERATOR_TIME_ZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return timeZone;
  } catch (error) {
    return DEFAULT_OPERATOR_TIME_ZONE;
  }
}

function formatDate(value, timeZone = DEFAULT_OPERATOR_TIME_ZONE) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: normalizeOperatorTimeZone(timeZone),
    timeZoneName: "short",
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

function truncate(value, max = 500) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function compactLower(value) {
  return normalizeText(value).toLowerCase().replace(/\s+/g, " ");
}

function phoneDigits(value) {
  return normalizeText(value).replace(/\D/g, "");
}

function getLeadMessage(lead) {
  return normalizeText(lead.requirements || lead.message || lead.notes || lead.comments);
}

function isLocationBriefLead(lead) {
  return lead.lead_type === "location_brief" || lead.lead_type === "live_market_investigation" || lead.lead_type === "vnext_market_investigation" || Boolean(lead.location_brief_v2_context) || lead.source === "location_brief";
}

function isInvestigationLead(lead) {
  return lead.lead_type === "live_market_investigation" || lead.investigation_requested === "yes";
}

function getEmailDomain(email) {
  const parts = normalizeText(email).toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
}

function getSpamRiskLabel(score) {
  if (score >= 60) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}

function getSpamRiskClass(risk) {
  return `spam-risk--${risk.toLowerCase()}`;
}

function addSpamSignal(signals, score, label) {
  if (!signals.some((signal) => signal.label === label)) {
    signals.push({ score, label });
  }
}

function detectAdminSpamSignals(lead, market) {
  const signals = [];
  const context = [];
  const phone = normalizeText(lead.phone);
  const digits = phoneDigits(phone);
  const locationValues = [
    market,
    lead.market,
    lead.city,
    lead.location_display,
    lead.location_profile_location_display,
  ].map(compactLower).filter(Boolean);
  const countryOnlyLocations = new Set([
    "united states",
    "usa",
    "u.s.",
    "u.s.a.",
    "us",
    "canada",
    "india",
    "uk",
    "united kingdom",
    "england",
    "australia",
    "germany",
    "france",
  ]);
  const message = getLeadMessage(lead);
  const lowerMessage = message.toLowerCase();
  const name = normalizeText(lead.name);
  const lowerName = name.toLowerCase();
  const urlMatches = message.match(/https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|info|biz|xyz|ru|cn)\b/gi) || [];
  const promoMatches = [
    "seo",
    "backlink",
    "guest post",
    "casino",
    "crypto",
    "bitcoin",
    "loan",
    "rank your website",
    "increase traffic",
    "marketing services",
    "whatsapp",
    "telegram",
    "kindly",
    "sponsored post",
  ].filter((phrase) => lowerMessage.includes(phrase));
  const genericNames = new Set(["test", "asdf", "qwerty", "admin", "user", "unknown", "name", "n/a", "na", "none"]);
  const freeDomains = new Set(["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com", "proton.me", "protonmail.com"]);
  const emailDomain = getEmailDomain(lead.email);

  if (phone) {
    if (digits.length > 10) addSpamSignal(signals, 45, `Phone has more than 10 digits (${digits.length})`);
    if (digits.length > 0 && digits.length < 10) addSpamSignal(signals, 35, `Phone has fewer than 10 digits (${digits.length})`);
  }

  if (locationValues.some((value) => countryOnlyLocations.has(value))) {
    addSpamSignal(signals, 35, "Location appears country-level only");
  }

  if (urlMatches.length > 1) addSpamSignal(signals, 45, "Message contains multiple URLs");
  else if (urlMatches.length === 1) addSpamSignal(signals, 25, "Message contains a URL");

  if (promoMatches.length) {
    addSpamSignal(signals, promoMatches.length > 1 ? 45 : 30, `Message contains promotional spam language: ${promoMatches.slice(0, 4).join(", ")}`);
  }

  if (!name) addSpamSignal(signals, 20, "Name is missing");
  else if (name.length < 2) addSpamSignal(signals, 25, "Name is very short");
  else if (genericNames.has(lowerName)) addSpamSignal(signals, 35, "Name appears generic or test-like");
  else if (/(.)\1{4,}/.test(name) || /https?:\/\/|www\./i.test(name)) addSpamSignal(signals, 45, "Name appears nonsensical or URL-like");
  else if ((name.match(/\d/g) || []).length >= 3) addSpamSignal(signals, 25, "Name contains several numbers");

  if (emailDomain && freeDomains.has(emailDomain)) {
    context.push(`Free email domain: ${emailDomain}`);
  }

  const score = signals.reduce((total, signal) => total + signal.score, 0);
  const risk = getSpamRiskLabel(score);

  return {
    score,
    risk,
    signals: signals.map((signal) => signal.label),
    context,
    hasSuspiciousPhone: Boolean(phone && digits.length > 0 && digits.length !== 10),
    hasBroadLocation: locationValues.some((value) => countryOnlyLocations.has(value)),
  };
}

function getLatestOfficeFinderAttempt(lead) {
  const attempts = Array.isArray(lead.officefinder_attempts) ? lead.officefinder_attempts : [];
  return attempts.length ? attempts[attempts.length - 1] : null;
}

function field(label, value, options = {}) {
  if (value === undefined || value === null || value === "") {
    if (!options.showEmpty) return "";
    value = "Not provided";
  }
  const className = options.className ? ` ${options.className}` : "";
  return `
    <div class="field${escapeHtml(className)}">
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `;
}

function linkField(label, value, options = {}) {
  if (value === undefined || value === null || value === "") return "";
  const safeValue = escapeHtml(value);
  const className = options.className ? ` ${options.className}` : "";
  return `
    <div class="field${escapeHtml(className)}">
      <dt>${escapeHtml(label)}</dt>
      <dd><a href="${safeValue}" target="_blank" rel="noopener">${safeValue}</a></dd>
    </div>
  `;
}

function statusBadge(value) {
  const status = value || "unknown";
  const label = String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return `<span class="badge badge--${escapeHtml(status.replace(/[^a-z0-9_-]/gi, "-").toLowerCase())}">${escapeHtml(label)}</span>`;
}

function leadOperatorStatus(row, activeReferral) {
  const status = String(row && row.status || "").toLowerCase();
  const referralStatus = String(activeReferral && activeReferral.status || "").toLowerCase();
  if (referralStatus === "accepted") return "Accepted";
  if (["rejected", "declined"].includes(status)) return "Rejected";
  if (["spam_quarantined", "rejected_spam"].includes(status)) return "Spam";
  if (status === "approved_send_failed") return "Failed";
  if (["approved_sent", "broker_sent", "both_sent", "partial_sent"].includes(status) || activeReferral) return "Sent";
  return "Pending";
}

function simpleStatusBadge(label) {
  const key = String(label || "Pending").toLowerCase();
  return `<span class="badge badge--${escapeHtml(key)}">${escapeHtml(label || "Pending")}</span>`;
}

function operatorReferralStatusLabel(referral) {
  const status = String(referral && referral.status || "").toLowerCase();
  if (status === "sent") return "Awaiting broker review";
  if (status === "viewed") return "Broker viewed the opportunity";
  if (status === "accepted" && referral.contactRevealedAt) return "Customer contact revealed";
  if (status === "accepted") return "Broker accepted the opportunity";
  if (status === "declined") return "Broker passed on the opportunity";
  if (status === "expired") return "Referral expired";
  if (status === "cancelled") return "Referral cancelled";
  if (status === "completed") return "Completed";
  if (status === "draft" && referral.emailDeliveryError) return "Email send failed";
  if (status === "draft") return "Draft";
  return referralStatusLabel(status);
}

function isActiveReferral(referral) {
  const status = String(referral && referral.status || "").toLowerCase();
  return ["sent", "viewed", "accepted", "completed"].includes(status);
}

function getActiveReferral(referrals) {
  return (referrals || []).find(isActiveReferral) || null;
}

function referralBrokerLabel(referral) {
  return [referral && referral.brokerName, referral && referral.brokerCompany].filter(Boolean).join(" - ")
    || referral && referral.brokerEmail
    || "Broker partner";
}

function parseBrokerJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function normalizeBrokerSpaceType(value) {
  const normalized = compactLower(value).replace(/[\s-]+/g, "_");
  if (["office", "office_space"].includes(normalized)) return "office";
  if (["industrial", "industrial_space"].includes(normalized)) return "industrial";
  if (["warehouse", "distribution"].includes(normalized)) return "warehouse";
  if (["flex", "r_and_d", "r&d", "rd"].includes(normalized)) return "flex";
  if (["retail", "restaurant", "showroom"].includes(normalized)) return "retail";
  if (["medical", "medical_office"].includes(normalized)) return "medical";
  if (["coworking", "co_working"].includes(normalized)) return "coworking";
  return normalized;
}

function normalizeBrokerRow(row) {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    phone: row.phone || "",
    company: row.company || "",
    markets: parseBrokerJson(row.markets_json, []),
    spaceTypes: parseBrokerJson(row.space_types_json, []),
    status: row.status || "pending",
    notes: row.notes || "",
  };
}

function formatBrokerMarket(market) {
  return [market.state, market.county, market.city, market.district].filter(Boolean).join(" | ");
}

function leadLocationParts(lead, market) {
  const locationText = compactLower([
    market,
    lead.location_display,
    lead.location_profile_location_display,
    lead.market,
    lead.city,
    lead.state,
  ].filter(Boolean).join(" "));
  const state = compactLower(lead.state || "");
  const city = compactLower(lead.city || "");
  const trailingState = normalizeText(market).match(/,\s*([A-Z]{2})\b/);
  return {
    text: locationText,
    state: state || (trailingState ? trailingState[1].toLowerCase() : ""),
    city,
  };
}

function brokerMarketMatch(leadParts, market) {
  const state = compactLower(market.state);
  const county = compactLower(market.county);
  const city = compactLower(market.city);
  const district = compactLower(market.district);

  if (district && leadParts.text.includes(district)) return "Exact market + space type match";
  if (city && (leadParts.city === city || leadParts.text.includes(city))) return "Exact market + space type match";
  if (county && leadParts.text.includes(county)) return "State/region match";
  if (state && leadParts.state === state) return "State/region match";
  if (state && leadParts.text.includes(` ${state} `)) return "State/region match";
  return "";
}

function eligibleBrokerMatches(lead, market, brokers) {
  const leadSpaceType = normalizeBrokerSpaceType(lead.requested_space_type || lead.space_type);
  const leadParts = leadLocationParts(lead, market);
  const matches = [];

  for (const broker of brokers) {
    if (broker.status !== "active") continue;
    const brokerSpaceTypes = (broker.spaceTypes || []).map(normalizeBrokerSpaceType).filter(Boolean);
    const spaceTypeMatch = !brokerSpaceTypes.length || !leadSpaceType || brokerSpaceTypes.includes(leadSpaceType);
    if (!spaceTypeMatch) continue;

    let matchType = "";
    for (const brokerMarket of broker.markets || []) {
      matchType = brokerMarketMatch(leadParts, brokerMarket);
      if (matchType === "Exact market + space type match") break;
    }

    if (!matchType && brokerSpaceTypes.includes(leadSpaceType)) {
      matchType = "Space type match only";
    }

    if (matchType) {
      matches.push({ broker, matchType });
    }
  }

  const priority = {
    "Exact market + space type match": 0,
    "State/region match": 1,
    "Space type match only": 2,
  };
  return matches
    .sort((a, b) => (priority[a.matchType] || 9) - (priority[b.matchType] || 9) || a.broker.name.localeCompare(b.broker.name))
    .slice(0, 6);
}

function renderActiveReferralStatus(referral, timeZone = DEFAULT_OPERATOR_TIME_ZONE) {
  if (!referral) return "";
  return `
    <section class="message-block referral-sent-block">
      <div class="referral-sent-block__header">
        <div>
          <h3>Referral sent</h3>
          <p>${escapeHtml(referralBrokerLabel(referral))}</p>
        </div>
        <span>${escapeHtml(operatorReferralStatusLabel(referral))}</span>
      </div>
      <dl class="referral-sent-grid">
        ${field("Sent", formatDate(referral.sentAt, timeZone))}
        ${field("Accepted", formatDate(referral.acceptedAt, timeZone))}
      </dl>
    </section>
  `;
}

function officeFinderSentLabel(lead, timeZone = DEFAULT_OPERATOR_TIME_ZONE) {
  const attempt = getLatestOfficeFinderAttempt(lead);
  if (lead.officefinder_status !== "officefinder_sent" && !(attempt && attempt.success)) return "";
  return `Sent to OfficeFinder${attempt && attempt.attempted_at ? ` - ${formatDate(attempt.attempted_at, timeZone)}` : ""}`;
}

function fulfillmentDestinationOptions(matches) {
  const officeFinder = [{
    value: "officefinder",
    label: "OfficeFinder",
    description: "National referral network",
  }];
  const partners = matches.map(({ broker, matchType }) => ({
    value: `broker:${broker.id}`,
    label: broker.name || broker.email || "Broker partner",
    description: broker.company || matchType || "Broker partner",
  }));
  return [...officeFinder, ...partners];
}

function renderFulfillmentRouting({ lead, matches, token, leadId, activeReferral = null, timeZone = DEFAULT_OPERATOR_TIME_ZONE }) {
  const officeFinderSent = officeFinderSentLabel(lead, timeZone);
  if (activeReferral || officeFinderSent) {
    return `
      ${activeReferral ? renderActiveReferralStatus(activeReferral, timeZone) : ""}
      ${officeFinderSent ? `<section class="message-block referral-sent-block"><div class="referral-sent-block__header"><div><h3>Requirement sent</h3><p>OfficeFinder</p></div><span>${escapeHtml(officeFinderSent)}</span></div></section>` : ""}
    `;
  }
  const destinations = fulfillmentDestinationOptions(matches);
  const readiness = assessBrokerReadiness(lead);
  const requiresOverride = readiness.status !== BROKER_READINESS.READY;
  return `
    <section class="message-block broker-match-block fulfillment-block">
      <h3>Send To</h3>
      ${requiresOverride ? `<div class="spam-box spam-box--medium"><strong>${escapeHtml(readiness.label)}</strong><p>${escapeHtml(readiness.summary)}</p></div>` : ""}
      <form method="POST" action="/admin/leads" class="referral-form fulfillment-form">
        <input type="hidden" name="token" value="${escapeHtml(token)}">
        <input type="hidden" name="id" value="${escapeHtml(leadId)}">
        <input type="hidden" name="action" value="send_requirement">
        <label>
          Destination
          <select name="destination" required>
            <option value="">Choose destination</option>
            ${destinations.map((destination) => `<option value="${escapeHtml(destination.value)}">${escapeHtml(`${destination.label} - ${destination.description}`)}</option>`).join("")}
          </select>
        </label>
        ${requiresOverride ? `<label class="broker-readiness-override"><input type="checkbox" name="readiness_override" value="acknowledged" required> Send anyway — I acknowledge that this Requirement needs additional qualification.</label>` : ""}
        <button class="button button--approve" type="submit" data-send-requirement-button disabled>Send Requirement</button>
      </form>
      ${matches.length
        ? `<p class="muted broker-match-note">${escapeHtml(matches[0].broker.name)} is the strongest available broker match. OfficeFinder is also available as a fulfillment destination.</p>`
        : `<p class="muted broker-match-note">No active broker partner match found yet. OfficeFinder is available, or add coverage in <a href="/admin/brokers?token=${encodeURIComponent(token)}">Broker Partners</a>.</p>`}
    </section>
  `;
}

function renderEligibleBrokers(lead, matches, token, leadId, activeReferral = null, timeZone = DEFAULT_OPERATOR_TIME_ZONE) {
  if (activeReferral) return renderActiveReferralStatus(activeReferral, timeZone);
  const readiness = assessBrokerReadiness(lead);
  const requiresOverride = readiness.status !== BROKER_READINESS.READY;
  return `
    <section class="message-block broker-match-block">
      <h3>Assign Partner</h3>
      ${matches.length ? `
        <form method="POST" action="/admin/leads" class="referral-form">
          <input type="hidden" name="token" value="${escapeHtml(token)}">
          <input type="hidden" name="id" value="${escapeHtml(leadId)}">
          <input type="hidden" name="action" value="send_referral">
          <label>
            Partner
            <select name="broker_partner_id" required>
              <option value="">Choose broker partner</option>
              ${matches.map(({ broker, matchType }) => `<option value="${escapeHtml(broker.id)}">${escapeHtml(`${broker.name}${broker.company ? ` - ${broker.company}` : ""} - ${matchType}`)}</option>`).join("")}
            </select>
          </label>
          ${requiresOverride ? `<label class="broker-readiness-override"><input type="checkbox" name="readiness_override" value="acknowledged" required> Send anyway — I acknowledge that this Requirement needs additional qualification.</label>` : ""}
          <button class="button button--approve" type="submit">Send Referral</button>
        </form>
        <p class="muted broker-match-note">${escapeHtml(matches[0].broker.name)} is the strongest available match: ${escapeHtml(matches[0].matchType)}.</p>
      ` : `<p class="muted">No active partner match found yet. Add coverage in <a href="/admin/brokers?token=${encodeURIComponent(token)}">Broker Partners</a>.</p>`}
    </section>
  `;
}

function renderReferralHistory(referrals, timeZone = DEFAULT_OPERATOR_TIME_ZONE) {
  return `
    <section class="message-block broker-match-block">
      <h3>Referral History</h3>
      ${referrals.length ? `
        <div class="referral-history-list">
          ${referrals.map((referral) => `
            <article class="referral-history-card">
              <div>
                <strong>${escapeHtml(referral.id)}</strong>
                <span>${escapeHtml(referralBrokerLabel(referral))}</span>
              </div>
              <em>${escapeHtml(operatorReferralStatusLabel(referral))}</em>
              <dl class="referral-history-grid">
                ${field("Sent", formatDate(referral.sentAt, timeZone))}
                ${field("Viewed", formatDate(referral.briefViewedAt, timeZone))}
                ${field("Accepted", formatDate(referral.acceptedAt, timeZone))}
                ${field("Contact Revealed", formatDate(referral.contactRevealedAt, timeZone))}
                ${field("Expires", formatDate(referral.expiresAt, timeZone))}
                ${referral.emailDeliveryError ? field("Email error", referral.emailDeliveryError, { className: "field--warning" }) : ""}
              </dl>
            </article>
          `).join("")}
        </div>
      ` : `<p class="muted">No referrals have been created for this lead yet.</p>`}
    </section>
  `;
}

function locationIntentLabel(lead) {
  if (lead.location_intent_label) return lead.location_intent_label;
  const intent = normalizeText(lead.location_intent || lead.locationIntent).toLowerCase();
  if (intent === "focus") return "Focus my search here";
  if (intent === "discover") return "Recommend the best markets";
  if (intent === "compare") return "Compare with nearby markets";
  return "";
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

function renderProjectSnapshot(lead, market) {
  const snapshot = buildProjectSnapshotFromLead(lead);
  const topDistricts = Array.isArray(snapshot.topDistricts) ? snapshot.topDistricts.filter(Boolean) : [];
  const primaryLine = [snapshot.market || market, snapshot.propertyType || lead.requested_space_type || lead.space_type].filter(Boolean).join(" - ");
  const requirementLine = [
    snapshot.businessUse || lead.location_profile_business_use || snapshot.businessCategory,
    snapshot.headcount || lead.investigation_headcount,
    snapshot.approximateSize || lead.space_needed,
    snapshot.timing || lead.move_timing,
  ].filter(Boolean).join(" - ");
  const customerLine = [lead.name, lead.company].filter(Boolean).join(" - ");
  const qualified = lead.qualification_status === "qualified_requirement";
  const readiness = assessBrokerReadiness(lead);
  const isVnext = lead.lead_type === "vnext_market_investigation";
  return `
    <section class="lead-ops-summary" aria-label="Lead Summary">
      <div class="lead-ops-summary__header">
        <div>
          <span>Requirement</span>
          <h3>${escapeHtml(primaryLine || "Location requirement")}</h3>
          ${requirementLine ? `<p>${escapeHtml(requirementLine)}</p>` : ""}
        </div>
        ${lead.location_brief_url ? `<a href="${escapeHtml(lead.location_brief_url)}" target="_blank" rel="noopener">Open Brief</a>` : ""}
      </div>
      <dl class="lead-grid lead-grid--compact">
        ${field("Submission state", qualified ? "Valid requirement" : "Legacy requirement — structural status unavailable", { showEmpty: true })}
        ${field("Broker readiness", readiness.label, { showEmpty: true, className: readiness.status === BROKER_READINESS.READY ? "" : "field--warning" })}
        ${readiness.gaps.length ? field("Material follow-up", readiness.gaps.map((gap) => gap.label).join(" "), { showEmpty: true, className: "field--warning" }) : ""}
        ${field("Business / use", snapshot.businessUse || lead.location_profile_business_use || snapshot.businessCategory, { showEmpty: true })}
        ${field("Category", snapshot.businessCategory, { showEmpty: true })}
        ${snapshot.classificationStatus === "investigate" ? field("Use classification", "Verify intended use", { showEmpty: true }) : ""}
        ${field("Selected district", snapshot.selectedDistrict || lead.investigation_district)}
        ${isVnext ? field("Locations worth investigating", topDistricts.join(", ") || lead.recommended_market_path) : topDistricts.length || lead.recommended_market_path ? field("Locations worth investigating", topDistricts.join(", ") || lead.recommended_market_path) : field("Recommendation", "Investigation required")}
        ${field("Headcount", snapshot.headcount || lead.investigation_headcount, { showEmpty: true })}
        ${field("Approx. size", snapshot.approximateSize || lead.space_needed, { showEmpty: true })}
        ${field("Timing", snapshot.timing || lead.move_timing, { showEmpty: true })}
        ${field("Operational features", (snapshot.operationalFeatures || []).join(", "))}
        ${field("Operating / work pattern", (snapshot.operationalUse || []).join(", "))}
        ${field("Growth", snapshot.growth)}
        ${field("Location approach", snapshot.locationIntent || locationIntentLabel(lead))}
        ${field("Research approach", snapshot.researchPreference)}
        ${field("Business priorities", (snapshot.businessPriorities || []).join(", "))}
        ${field("Known constraints", snapshot.knownConstraints)}
        ${field("Customer", customerLine || lead.name, { showEmpty: true })}
        ${field("Email", lead.email, { showEmpty: true })}
        ${field("Phone", lead.phone)}
        ${field("Additional notes", snapshot.additionalNotes || lead.investigation_notes)}
        ${isVnext ? field("Space use", lead.property_requirement_use, { showEmpty: true }) : ""}
        ${isVnext ? field("Must-have space needs", lead.property_requirement_must_haves || "None", { showEmpty: true }) : ""}
        ${isVnext ? field("Location Requirement revision", lead.location_requirement_revision_number, { showEmpty: true }) : ""}
        ${isVnext ? field("Property Requirement revision", lead.property_requirement_revision, { showEmpty: true }) : ""}
        ${field("Internal alert", lead.internal_email_status || lead.investigation_internal_email_status)}
      </dl>
    </section>
  `;
}

async function recordBrokerReadinessAtSend(env, id, destination, overrideAcknowledged) {
  const record = await getLead(env, id);
  if (!record) return { ok: false, status: 404, title: "Lead not found" };
  const readiness = assessBrokerReadiness(record.lead);
  if (readiness.status !== BROKER_READINESS.READY && !overrideAcknowledged) {
    return {
      ok: false,
      status: 409,
      title: readiness.label,
      message: readiness.summary,
      readiness,
    };
  }
  const assessedAt = new Date().toISOString();
  const lead = {
    ...record.lead,
    broker_readiness_at_send: {
      status: readiness.status,
      gaps: readiness.gaps.map((gap) => gap.code),
      override: readiness.status !== BROKER_READINESS.READY && overrideAcknowledged,
      destination,
      assessed_at: assessedAt,
    },
  };
  await updateLeadStatus(env, id, { status: record.status, lead });
  return { ok: true, record: { ...record, lead }, readiness };
}

function renderBusinessProfileSummary(lead) {
  const snapshot = buildProjectSnapshotFromLead(lead);
  const items = [
    ["Business / use", snapshot.businessUse || lead.location_profile_business_use],
    ["Category", snapshot.businessCategory],
    ["Office use", lead.location_profile_operational_use],
    ["Office environment", lead.location_profile_office_environment],
    ["Commute", lead.location_profile_commute_orientation],
    ["Growth", lead.location_profile_expected_growth],
    ["Institution proximity", lead.location_profile_institution_proximity],
  ].filter(([, value]) => normalizeText(value));
  if (!items.length) return "";
  return `
    <section class="message-block message-block--plain">
      <h3>Business Profile</h3>
      <dl class="lead-grid lead-grid--compact">
        ${items.map(([label, value]) => field(label, value)).join("")}
      </dl>
    </section>
  `;
}

function renderLocationBriefAdvanced({ lead, row, route, officeFinderStatus, officeFinderPayload, latestAttempt, referrals, spamReasons, timeZone = DEFAULT_OPERATOR_TIME_ZONE }) {
  const officeFinderAttempt = latestAttempt
    ? `<div class="lead-grid lead-grid--compact">
        ${field("Attempted at", formatDate(latestAttempt.attempted_at, timeZone))}
        ${field("Mode", latestAttempt.officefinder_mode)}
        ${field("HTTP status", latestAttempt.response_status)}
        ${field("Success", String(Boolean(latestAttempt.success)))}
        ${field("Error", latestAttempt.error)}
      </div>
      ${detailsBlock("OfficeFinder response body", latestAttempt.response_body)}
      ${detailsBlock("OfficeFinder request payload", latestAttempt.request_payload)}`
    : "<p>No OfficeFinder attempts yet.</p>";

  return `
    <details class="admin-details lead-card__advanced">
      <summary>More Details</summary>
      <div class="advanced-stack">
        <section class="message-block">
          <h3>Location Brief summary</h3>
          <div class="lead-grid lead-grid--compact">
            ${field("Brief ID", lead.location_brief_public_id)}
            ${linkField("Open Brief", lead.location_brief_url)}
            ${field("Location Brief status", lead.location_brief_status)}
            ${field("Representative scope", lead.investigation_buildings)}
          </div>
        </section>
        ${renderBusinessProfileSummary(lead)}
        <section class="message-block message-block--investigation">
          <h3>Live Market Investigation metadata</h3>
          <div class="lead-grid lead-grid--compact">
            ${field("Request ID", lead.investigation_request_id)}
            ${field("Status", lead.investigation_status)}
            ${field("Confirmation email", lead.investigation_confirmation_email_status)}
            ${field("Confirmation sent", formatDate(lead.investigation_confirmation_email_sent_at, timeZone))}
            ${field("Confirmation error", lead.investigation_confirmation_email_error)}
            ${field("Internal alert", lead.internal_email_status || lead.investigation_internal_email_status)}
            ${field("Internal alert sent", formatDate(lead.internal_email_sent_at, timeZone))}
            ${field("Internal alert recipient", lead.internal_email_recipient)}
            ${field("Internal alert error", lead.internal_email_error || lead.investigation_internal_email_error)}
            ${field("City", [lead.investigation_city, lead.state].filter(Boolean).join(", "))}
            ${field("District", lead.investigation_district)}
            ${field("Representative scope", lead.investigation_buildings)}
            ${field("Scope", lead.investigation_scope)}
            ${field("Timing", lead.investigation_timing || lead.move_timing)}
            ${field("Source", lead.investigation_source)}
            ${field("Idempotency", lead.investigation_idempotency_hash ? `Stored (${lead.investigation_idempotency_hash})` : "")}
          </div>
        </section>
        <section class="message-block">
          <h3>Recommendation and profile context</h3>
          <div class="lead-grid lead-grid--compact">
            ${field("Recommended Market Path", lead.recommended_market_path)}
            ${field("Business Priorities", lead.business_priorities)}
            ${field("Location Intent", locationIntentLabel(lead))}
            ${field("Location intent guidance", lead.location_intent_summary)}
            ${field("Location Brief status", lead.location_brief_status)}
          </div>
        </section>
        <section class="message-block">
          <h3>Routing diagnostics</h3>
          <div class="lead-grid lead-grid--compact">
            ${field("Route recommendation", route.route_to)}
            ${field("Matched rule", route.route_id)}
            ${field("Route reason", route.route_reason)}
            ${field("Broker email", route.broker_email)}
            ${field("OfficeFinder status", officeFinderStatus)}
            ${field("Submission status", row.status)}
            ${field("Approval error", row.approval_error)}
          </div>
        </section>
        <section class="message-block">
          <h3>OfficeFinder diagnostics</h3>
          ${officeFinderAttempt}
          ${detailsBlock("Stored OfficeFinder payload", officeFinderPayload)}
        </section>
        ${renderReferralHistory(referrals, timeZone)}
        ${spamReasons.length ? `<div class="spam-box"><strong>Spam review:</strong> Score ${escapeHtml(lead.spam_score || 0)}<ul>${spamReasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul></div>` : ""}
        ${detailsBlock("Stored lead JSON", lead)}
      </div>
    </details>
  `;
}

function renderLeadCard(row, token, brokerPartners = [], referrals = [], timeZone = DEFAULT_OPERATOR_TIME_ZONE) {
  const lead = parseJson(row.lead_json);
  const officeFinderPayload = parseJson(row.officefinder_json);
  const route = lead.route_recommendation || {};
  const latestAttempt = getLatestOfficeFinderAttempt(lead);
  const locationSummary = lead.lead_type === "location_profile" ? getLocationRequirementSummary(lead) : null;
  const isLocationBrief = isLocationBriefLead(lead);
  const isInvestigation = isInvestigationLead(lead);
  const market = locationSummary
    ? locationSummary.location
    : lead.location_display || lead.market || [lead.city, lead.state].filter(Boolean).join(", ");
  const officeFinderStatus = lead.officefinder_status || "officefinder_not_attempted";
  const spamReasons = Array.isArray(lead.spam_reasons) ? lead.spam_reasons : [];
  const isSpam = ["spam_quarantined", "rejected_spam"].includes(row.status);
  const message = getLeadMessage(lead);
  const adminSpam = detectAdminSpamSignals(lead, market);
  const phoneClass = adminSpam.hasSuspiciousPhone ? "field--warning" : "";
  const locationClass = adminSpam.hasBroadLocation ? "field--warning" : "";
  const riskClass = getSpamRiskClass(adminSpam.risk);
  const sourceLabel = lead.source || lead.page_type || lead.rofo_source || lead.page_url || "";
  const eligibleBrokers = eligibleBrokerMatches(lead, market, brokerPartners);
  const activeReferral = getActiveReferral(referrals);
  const operatorStatus = leadOperatorStatus(row, activeReferral);

  return `
    <article class="lead-card${isSpam ? " lead-card--spam" : ""}">
      <div class="lead-card__header">
        <div>
          <div class="lead-card__time">${escapeHtml(formatDate(row.created_at, timeZone))}</div>
          <h2>${escapeHtml(lead.name || "Unnamed lead")}</h2>
        </div>
        <div class="lead-card__status">
          ${adminSpam.risk === "Low" ? "" : `<span class="spam-risk ${escapeHtml(riskClass)}">Spam risk: ${escapeHtml(adminSpam.risk)}</span>`}
          ${simpleStatusBadge(operatorStatus)}
        </div>
      </div>

      ${isLocationBrief ? "" : `<div class="lead-grid lead-grid--review">
        ${field(lead.lead_type === "location_profile" || isLocationBrief ? "Location" : "City / market", market, { className: locationClass })}
        ${field("Space type", lead.requested_space_type || lead.space_type)}
        ${field("Size", lead.space_needed)}
        ${field("Location Intent", locationIntentLabel(lead))}
        ${field("Email", lead.email)}
        ${field("Phone", lead.phone || "(not provided)", { className: phoneClass })}
        ${field("Company", lead.company)}
        ${isLocationBrief ? field("Brief ID", lead.location_brief_public_id) : ""}
        ${isLocationBrief ? linkField("View Brief", lead.location_brief_url) : ""}
        ${field("Source", sourceLabel)}
        ${linkField("Page URL", lead.page_url || lead.rofo_source)}
      </div>`}

      ${isLocationBrief ? renderProjectSnapshot(lead, market) : ""}

      ${adminSpam.signals.length || adminSpam.context.length ? `
        <div class="spam-box spam-box--${escapeHtml(adminSpam.risk.toLowerCase())}">
          <strong>Spam risk: ${escapeHtml(adminSpam.risk)}</strong>
          ${adminSpam.signals.length ? `<ul>${adminSpam.signals.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>` : `<p>No strong spam signals detected.</p>`}
          ${adminSpam.context.length ? `<div class="spam-context"><strong>Context:</strong> ${adminSpam.context.map(escapeHtml).join(" • ")}</div>` : ""}
        </div>
      ` : ""}

      ${isLocationBrief ? `
        ${renderFulfillmentRouting({ lead, matches: eligibleBrokers, token, leadId: row.id, activeReferral, timeZone })}
        ${renderLeadActions(row, route, token, activeReferral)}
        ${renderLocationBriefAdvanced({ lead, row, route, officeFinderStatus, officeFinderPayload, latestAttempt, referrals, spamReasons, timeZone })}
      ` : `
      <section class="message-block">
        <h3>${isLocationBrief ? "Location Brief summary" : "Message / notes"}</h3>
        <div>${message ? escapeHtml(truncate(message, 1200)) : "<span class=\"muted\">No message provided.</span>"}</div>
      </section>

      <details class="admin-details">
        <summary>Advanced: routing and admin details</summary>
        <div class="lead-grid">
        ${isLocationBrief ? "" : field("Company", lead.company)}
        ${lead.lead_type === "location_profile" ? "" : field("State", lead.state)}
        ${field("Timing", lead.move_timing)}
        ${field("Page type", lead.page_type)}
        ${isLocationBrief ? field("Location Brief status", lead.location_brief_status) : ""}
        ${field("Location Intent", locationIntentLabel(lead))}
        ${field("Location intent guidance", lead.location_intent_summary)}
        ${field("Route recommendation", route.route_to)}
        ${field("Matched rule", route.route_id)}
        ${field("Route reason", route.route_reason)}
        ${field("Broker email", route.broker_email)}
        ${field("OfficeFinder status", officeFinderStatus)}
        ${field("Spam score", lead.spam_score)}
        ${field("Sent at", formatDate(row.sent_at, timeZone))}
        ${field("Rejected at", formatDate(row.rejected_at, timeZone))}
        </div>
      </details>

      ${spamReasons.length ? `<div class="spam-box"><strong>Spam review:</strong> Score ${escapeHtml(lead.spam_score || 0)}<ul>${spamReasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul></div>` : ""}
      ${row.approval_error ? `<div class="alert"><strong>Approval error:</strong> ${escapeHtml(row.approval_error)}</div>` : ""}
      ${row.officefinder_response ? `<div class="note"><strong>OfficeFinder response:</strong> ${escapeHtml(row.officefinder_response)}</div>` : ""}

      ${renderEligibleBrokers(lead, eligibleBrokers, token, row.id, activeReferral, timeZone)}
      ${renderReferralHistory(referrals, timeZone)}

      <div class="lead-card__details">
        <details>
          <summary>Advanced: OfficeFinder latest attempt</summary>
          ${
            latestAttempt
              ? `<div class="lead-grid lead-grid--compact">
                  ${field("Attempted at", formatDate(latestAttempt.attempted_at, timeZone))}
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
        ${detailsBlock("Advanced: stored OfficeFinder payload", officeFinderPayload)}
        ${detailsBlock("Advanced: stored lead JSON", lead)}
      </div>

      ${renderLeadActions(row, route, token, activeReferral)}
      `}
    </article>
  `;
}

function renderPostButton({ token, id, action, route = "", label, className = "" }) {
  return `
    <form method="POST" action="/admin/leads" class="action-form">
      <input type="hidden" name="token" value="${escapeHtml(token)}">
      <input type="hidden" name="id" value="${escapeHtml(id)}">
      <input type="hidden" name="action" value="${escapeHtml(action)}">
      ${route ? `<input type="hidden" name="route" value="${escapeHtml(route)}">` : ""}
      <button class="${escapeHtml(className)}" type="submit">${escapeHtml(label)}</button>
    </form>
  `;
}

function renderLeadActions(row, route, token, activeReferral = null) {
  const lead = parseJson(row.lead_json);
  const isLocationBrief = isLocationBriefLead(lead);

  if (activeReferral) {
    return `<div class="lead-actions"><span class="muted">Lead-level reject and spam actions are hidden because an active broker referral is ${escapeHtml(operatorReferralStatusLabel(activeReferral).toLowerCase())}.</span></div>`;
  }

  if (!ACTIONABLE_STATUSES.includes(row.status)) {
    return `<div class="lead-actions"><span class="muted">No dashboard actions available for ${escapeHtml(row.status)} leads.</span></div>`;
  }

  const brokerAvailable = Boolean(route.broker_email);
  const routeTo = route.route_to || "officefinder";
  const recommendedLabel = routeTo === "both"
    ? "Approve & Send to Both"
    : routeTo === "broker" ? "Approve & Send to Broker" : "Approve & Send to OfficeFinder";

  if (isLocationBrief) {
    return `
      <div class="lead-actions lead-actions--buttons">
        ${renderPostButton({ token, id: row.id, action: "reject", label: "Reject Lead", className: "button button--reject" })}
        ${renderPostButton({ token, id: row.id, action: "spam", label: "Mark as Spam", className: "button button--spam" })}
      </div>
    `;
  }

  return `
    <div class="lead-actions lead-actions--buttons">
      ${renderPostButton({ token, id: row.id, action: "approve", route: "recommended", label: recommendedLabel, className: "button button--approve" })}
      ${routeTo === "both" ? renderPostButton({ token, id: row.id, action: "approve", route: "officefinder", label: "OfficeFinder Only", className: "button button--secondary" }) : ""}
      ${brokerAvailable && routeTo !== "broker" ? renderPostButton({ token, id: row.id, action: "approve", route: "broker", label: routeTo === "both" ? "Broker Only" : "Send to Broker", className: "button button--secondary" }) : ""}
      ${renderPostButton({ token, id: row.id, action: "reject", label: "Reject Lead", className: "button button--reject" })}
      ${renderPostButton({ token, id: row.id, action: "spam", label: "Mark as Spam", className: "button button--spam" })}
    </div>
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
      ${filters.id ? `<input type="hidden" name="id" value="${escapeHtml(filters.id)}">` : ""}
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

function renderMetric(label, value, helper = "") {
  return `
    <div class="quality-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      ${helper ? `<small>${escapeHtml(helper)}</small>` : ""}
    </div>
  `;
}

function renderLeadQualityCard(summary) {
  return `
    <article class="quality-card">
      <div class="quality-card__header">
        <h3>Last ${escapeHtml(summary.days)} days</h3>
        ${summary.sampleCapped ? `<span>Latest ${escapeHtml(LEAD_QUALITY_SAMPLE_LIMIT)} sampled</span>` : ""}
      </div>
      <div class="quality-grid">
        ${renderMetric("Total leads", summary.total)}
        ${renderMetric("Pending", summary.pending)}
        ${renderMetric("Approved/Sent", summary.sent)}
        ${renderMetric("Rejected", summary.rejected)}
        ${renderMetric("Spam", summary.spam)}
        ${renderMetric("Approval rate", percent(summary.sent, summary.total))}
        ${renderMetric("Spam rate", percent(summary.spam, summary.total))}
        ${renderMetric("OfficeFinder success", percent(summary.officeFinderSuccess, summary.officeFinderAttempted), `${summary.officeFinderSuccess}/${summary.officeFinderAttempted || 0} attempted`)}
        ${renderMetric("OF failed / not attempted", `${summary.officeFinderFailed} / ${summary.officeFinderNotAttempted}`)}
      </div>
    </article>
  `;
}

function renderLeadQualitySection(leadQuality) {
  if (!leadQuality) return "";
  return `
    <section class="quality-section" aria-label="Lead quality metrics">
      <div class="quality-section__heading">
        <h2>Lead quality</h2>
        <p>Date-bounded review metrics for recent lead flow.</p>
      </div>
      ${leadQuality.errors.length ? `<div class="notice notice--warning">Lead quality metrics partially unavailable: ${leadQuality.errors.map(escapeHtml).join(" ")}</div>` : ""}
      <div class="quality-cards">
        ${leadQuality.summaries.map(renderLeadQualityCard).join("")}
      </div>
    </section>
  `;
}

function renderPage({ rows, token, filters, fetchedCount, counts, notice, leadQuality, brokerPartners, referralsByLead, operatorTimeZone = DEFAULT_OPERATOR_TIME_ZONE }) {
  const timeZone = normalizeOperatorTimeZone(operatorTimeZone);
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
    ${MISSION_CONTROL_NAV_CSS}
    h1 { margin: 0 0 6px; font-size: clamp(28px, 4vw, 42px); line-height: 1.05; }
    h2 { margin: 4px 0; font-size: 20px; }
    h3 { margin: 0 0 8px; font-size: 15px; }
    p { margin: 0; color: var(--muted); }
    .filters { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)) auto; gap: 12px; align-items: end; background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin: 20px 0; }
    .tabs { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin: 18px 0; }
    .tab { display: flex; justify-content: space-between; gap: 10px; align-items: center; min-height: 54px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: #fff; color: var(--ink); text-decoration: none; font-weight: 800; }
    .tab strong { min-width: 32px; border-radius: 999px; padding: 4px 8px; background: #eef3f8; text-align: center; font-size: 12px; }
    .tab--active { border-color: var(--blue); box-shadow: 0 0 0 2px rgba(23, 63, 138, .12); }
    .tab--active strong { background: var(--blue); color: #fff; }
    label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: #34445b; }
    input, select { width: 100%; border: 1px solid var(--border); border-radius: 8px; padding: 10px; font: inherit; background: #fff; }
    button, .button { border: 0; border-radius: 8px; padding: 11px 14px; background: var(--blue); color: #fff; font-weight: 800; cursor: pointer; }
    .summary { margin: 0 0 16px; color: var(--muted); }
    .notice { margin: 0 0 16px; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px; background: #eff6ff; color: #1e3a8a; font-weight: 700; }
    .notice--warning { border-color: #fed7aa; background: #fff7ed; color: #9a3412; }
    .quality-section { margin: 16px 0 20px; }
    .quality-section__heading { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 10px; }
    .quality-section__heading h2 { margin: 0; }
    .quality-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .quality-card { background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 14px; box-shadow: 0 8px 24px rgba(23, 32, 51, 0.05); }
    .quality-card__header { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 12px; }
    .quality-card__header h3 { margin: 0; font-size: 16px; }
    .quality-card__header span { color: #9a3412; font-size: 12px; font-weight: 800; }
    .quality-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .quality-metric { min-width: 0; border-top: 1px solid #edf2f7; padding-top: 8px; }
    .quality-metric span { display: block; color: var(--muted); font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .04em; }
    .quality-metric strong { display: block; margin-top: 3px; font-size: 20px; line-height: 1; }
    .quality-metric small { display: block; margin-top: 4px; color: var(--muted); font-size: 11px; }
    .lead-list { display: grid; gap: 16px; }
    .lead-card { background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 18px; box-shadow: 0 8px 24px rgba(23, 32, 51, 0.06); }
    .lead-card--spam { background: #fffaf5; border-color: #fed7aa; box-shadow: none; }
    .lead-card__header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
    .lead-card__time { color: var(--muted); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
    .lead-card__notes { margin-top: 12px; max-width: 760px; white-space: pre-wrap; color: #26364d; font-size: 15px; line-height: 22px; }
    .lead-card__status { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
    .badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 6px 10px; background: #eef3f8; color: #24364d; font-size: 12px; font-weight: 800; }
    .badge--pending { background: #fff7db; color: #7a4b00; }
    .badge--sent { background: #e4f8ec; color: #166534; }
    .badge--accepted { background: #dcfce7; color: #14532d; }
    .badge--spam { background: #ffedd5; color: #9a3412; }
    .badge--failed { background: #fee2e2; color: #991b1b; }
    .badge--expert_review_requested { background: #dbeafe; color: #1e40af; }
    .badge--market_investigation_requested { background: #e0f2fe; color: #075985; }
    .badge--approved_sent, .badge--broker_sent, .badge--both_sent, .badge--partial_sent, .badge--officefinder_sent { background: #e4f8ec; color: #166534; }
    .badge--approved_send_failed, .badge--officefinder_failed { background: #fee2e2; color: #991b1b; }
    .badge--spam_quarantined, .badge--rejected_spam { background: #ffedd5; color: #9a3412; }
    .badge--rejected { background: #f1f5f9; color: #475569; }
    .spam-risk { display: inline-flex; align-items: center; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 900; }
    .spam-risk--low { background: #ecfdf5; color: #047857; }
    .spam-risk--medium { background: #fff7db; color: #92400e; }
    .spam-risk--high { background: #fee2e2; color: #991b1b; }
    .lead-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px 16px; margin-top: 16px; }
    .lead-grid--review { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .lead-grid--compact { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .field { min-width: 0; }
    .field--warning { border: 1px solid #fed7aa; border-radius: 10px; padding: 8px; background: #fff7ed; }
    .field--warning dd { color: #9a3412; font-weight: 800; }
    dt { color: var(--muted); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
    dd { margin: 4px 0 0; overflow-wrap: anywhere; }
    .message-block { margin-top: 16px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; background: #f8fafc; color: #172033; }
    .message-block > div { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 15px; line-height: 22px; }
    .message-block--plain > div { white-space: normal; }
    .lead-ops-summary { margin-top: 16px; border: 1px solid #bfdbfe; border-radius: 14px; padding: 16px; background: #eff6ff; }
    .lead-ops-summary__header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 4px; }
    .lead-ops-summary__header span { display: block; color: #1d4ed8; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .05em; }
    .lead-ops-summary__header h3 { margin: 4px 0 0; font-size: 18px; color: #0f172a; }
    .lead-ops-summary__header p { margin-top: 6px; color: #334155; font-weight: 700; }
    .lead-ops-summary__header a { flex: 0 0 auto; border-radius: 8px; padding: 9px 12px; background: #174ea6; color: #fff; font-size: 13px; font-weight: 900; text-decoration: none; }
    .broker-match-block > div { white-space: normal; }
    .broker-match-list { display: grid; gap: 10px; }
    .broker-match-card { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px 14px; padding: 12px; border: 1px solid #dbe5f3; border-radius: 10px; background: #fff; }
    .broker-match-card strong, .broker-match-card span, .broker-match-card small { display: block; }
    .broker-match-card span, .broker-match-card small { color: var(--muted); }
    .broker-match-card em { align-self: start; border-radius: 999px; padding: 4px 8px; background: #e0f2fe; color: #075985; font-size: 12px; font-style: normal; font-weight: 900; white-space: nowrap; }
    .broker-match-card small { grid-column: 1 / -1; }
    .broker-match-note { margin-top: 10px; font-size: 13px; }
    .referral-form { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: end; margin-top: 12px; }
    .fulfillment-block { border-color: #bbf7d0; background: #f0fdf4; }
    .fulfillment-form .button { min-width: 190px; min-height: 48px; }
    .referral-history-list { display: grid; gap: 10px; white-space: normal; }
    .referral-history-card { display: grid; gap: 10px; padding: 12px; border: 1px solid #dbe5f3; border-radius: 10px; background: #fff; }
    .referral-history-card > div { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .referral-history-card strong, .referral-history-card span { display: block; }
    .referral-history-card span { color: var(--muted); }
    .referral-history-card em { justify-self: start; border-radius: 999px; padding: 4px 8px; background: #eef3f8; color: #24364d; font-size: 12px; font-style: normal; font-weight: 900; }
    .referral-history-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 12px; margin: 0; }
    .referral-sent-block { border-color: #bbf7d0; background: #f0fdf4; }
    .referral-sent-block__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; white-space: normal; }
    .referral-sent-block__header h3 { margin: 0 0 4px; color: #14532d; }
    .referral-sent-block__header p { color: #166534; font-weight: 800; }
    .referral-sent-block__header span { display: inline-flex; align-items: center; border-radius: 999px; padding: 6px 10px; background: #dcfce7; color: #14532d; font-size: 12px; font-weight: 900; }
    .referral-sent-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px 12px; margin: 12px 0 0; }
    .admin-details { background: #fff; }
    .lead-card__advanced { margin-top: 14px; }
    .advanced-stack { display: grid; gap: 14px; margin-top: 12px; }
    .advanced-stack .message-block { margin-top: 0; }
    .alert, .note { margin-top: 14px; border-radius: 10px; padding: 12px; overflow-wrap: anywhere; }
    .alert { background: #fff1f2; color: #9f1239; }
    .note { background: #eff6ff; color: #1e3a8a; }
    .spam-box { margin-top: 14px; border: 1px solid #fed7aa; border-radius: 10px; padding: 12px; background: #fff7ed; color: #9a3412; overflow-wrap: anywhere; }
    .spam-box--high { border-color: #fecaca; background: #fff1f2; color: #991b1b; }
    .spam-box--medium { border-color: #fed7aa; background: #fff7ed; color: #9a3412; }
    .spam-box--low { border-color: #bbf7d0; background: #f0fdf4; color: #166534; }
    .spam-box ul { margin: 8px 0 0; padding-left: 18px; }
    .spam-context { margin-top: 8px; color: #475569; font-size: 13px; }
    details { margin-top: 14px; border: 1px solid var(--border); border-radius: 10px; padding: 12px; background: #fbfdff; }
    summary { cursor: pointer; font-weight: 800; }
    pre { white-space: pre-wrap; overflow-x: auto; background: #111827; color: #e5e7eb; border-radius: 8px; padding: 12px; font-size: 12px; }
    .lead-actions { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-top: 14px; color: var(--muted); font-size: 13px; }
    .lead-actions--buttons { border-top: 1px solid var(--border); padding-top: 14px; }
    .action-form { margin: 0; }
    .button { min-height: 46px; min-width: 150px; }
    .button:disabled { opacity: .55; cursor: not-allowed; }
    .button--approve { background: #14532d; }
    .button--secondary { background: #334155; }
    .button--reject { background: #b91c1c; }
    .button--spam { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; }
    .muted { color: var(--muted); }
    @media (max-width: 820px) {
      .filters, .tabs, .quality-cards, .quality-grid, .lead-grid, .lead-grid--review, .lead-grid--compact { grid-template-columns: 1fr; }
      .lead-card__header { display: grid; }
      .lead-card__status { justify-content: flex-start; }
      .broker-match-card { grid-template-columns: 1fr; }
      .broker-match-card em { justify-self: start; white-space: normal; }
      .referral-form, .referral-history-grid, .referral-sent-grid { grid-template-columns: 1fr; }
      .referral-sent-block__header { display: grid; }
      .lead-actions--buttons, .action-form, .button { display: grid; width: 100%; }
      .lead-ops-summary__header { display: grid; }
      .lead-ops-summary__header a, .fulfillment-form .button { width: 100%; text-align: center; }
      .button { min-height: 52px; font-size: 16px; }
    }
  </style>
</head>
<body>
  <main class="shell">
    ${renderMissionControlHeader({
      token,
      active: "leads",
      title: "Lead Operations",
      description: "Recent requirements, routing status, fulfillment partners, and operational follow-up.",
      escapeHtml,
    })}
    ${renderTabs(token, filters, counts)}
    ${renderFilters(token, filters)}
    ${renderLeadQualitySection(leadQuality)}
    ${notice ? `<div class="notice">${escapeHtml(notice)}</div>` : ""}
    <p class="summary">Showing ${rows.length} ${escapeHtml(filters.status || filters.view)} lead${rows.length === 1 ? "" : "s"}${fetchedCount > rows.length ? ` after filtering ${fetchedCount} fetched records` : ""}. Ordered by newest first.</p>
    <section class="lead-list">
      ${rows.length ? rows.map((row) => renderLeadCard(row, token, brokerPartners, referralsByLead.get(row.id) || [], timeZone)).join("") : "<p>No leads match these filters.</p>"}
    </section>
  </main>
  <script>
    document.querySelectorAll(".fulfillment-form").forEach((form) => {
      const select = form.querySelector("select[name='destination']");
      const button = form.querySelector("[data-send-requirement-button]");
      if (!select || !button) return;
      const update = () => {
        button.disabled = !select.value;
      };
      update();
      select.addEventListener("change", update);
      form.addEventListener("submit", () => {
        button.disabled = true;
        button.textContent = "Sending...";
      });
    });
  </script>
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

  if (filters.id) {
    clauses.push("id = ?");
    bindings.push(filters.id);
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

async function ensureBrokerPartnerTable(env) {
  if (!env.LEADS_DB) return;
  await env.LEADS_DB.prepare(BROKER_PARTNER_TABLE_QUERY).run();
  await env.LEADS_DB.prepare("create index if not exists idx_broker_partners_status on broker_partners(status)").run();
}

async function fetchBrokerPartners(env) {
  if (!env.LEADS_DB) return [];
  try {
    await ensureBrokerPartnerTable(env);
    const result = await env.LEADS_DB.prepare(`
      select id, name, email, phone, company, markets_json, space_types_json, status, notes
      from broker_partners
      where status = 'active'
      order by company, name
    `).all();
    return (result.results || []).map(normalizeBrokerRow);
  } catch (error) {
    if (/no such table|broker_partners/i.test(String(error && error.message || ""))) return [];
    throw error;
  }
}

async function fetchReferralHistory(env, rows) {
  if (!env.LEADS_DB) return new Map();
  const leadIds = rows.map((row) => row.id).filter(Boolean);
  if (!leadIds.length) return new Map();
  return listReferralsForLeads(env, leadIds);
}

function buildEmptyQualitySummary(days, error = "") {
  return {
    days,
    total: 0,
    pending: 0,
    sent: 0,
    rejected: 0,
    spam: 0,
    officeFinderSuccess: 0,
    officeFinderFailed: 0,
    officeFinderNotAttempted: 0,
    officeFinderAttempted: 0,
    sampleCapped: false,
    error,
  };
}

function getOfficeFinderStatus(lead) {
  return normalizeText(lead.officefinder_status || "officefinder_not_attempted");
}

function summarizeLeadQualityRows(days, rows) {
  const summary = buildEmptyQualitySummary(days);
  summary.total = rows.length;
  summary.sampleCapped = rows.length >= LEAD_QUALITY_SAMPLE_LIMIT;

  for (const row of rows) {
    const lead = parseJson(row.lead_json);
    const officeFinderStatus = getOfficeFinderStatus(lead);

    if (STATUS_VIEWS.pending.includes(row.status)) summary.pending += 1;
    if (STATUS_VIEWS.sent.includes(row.status)) summary.sent += 1;
    if (STATUS_VIEWS.rejected.includes(row.status)) summary.rejected += 1;
    if (STATUS_VIEWS.spam.includes(row.status)) summary.spam += 1;

    if (officeFinderStatus === "officefinder_sent") {
      summary.officeFinderSuccess += 1;
    } else if (officeFinderStatus === "officefinder_failed") {
      summary.officeFinderFailed += 1;
    } else if (officeFinderStatus === "officefinder_not_attempted") {
      summary.officeFinderNotAttempted += 1;
    }
  }

  summary.officeFinderAttempted = summary.officeFinderSuccess + summary.officeFinderFailed;
  return summary;
}

async function fetchLeadQualityWindow(env, days) {
  const result = await env.LEADS_DB.prepare(`
    select status, lead_json, created_at
    from leads
    where created_at >= ?
    order by created_at desc
    limit ?
  `).bind(lookbackStartIso(days), LEAD_QUALITY_SAMPLE_LIMIT).all();

  return summarizeLeadQualityRows(days, result.results || []);
}

async function fetchLeadQualityMetrics(env) {
  const errors = [];
  const summaries = [];

  for (const days of [7, 30]) {
    try {
      summaries.push(await fetchLeadQualityWindow(env, days));
    } catch (error) {
      errors.push(`${days}-day metrics failed: ${error.message || "query failed"}`);
      summaries.push(buildEmptyQualitySummary(days, error.message || "query failed"));
    }
  }

  return { summaries, errors };
}

export async function onRequestGet({ request, env, waitUntil }) {
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
    id: (url.searchParams.get("id") || "").trim(),
    limit: normalizeLimit(url.searchParams.get("limit")),
  };
  const notice = (url.searchParams.get("notice") || "").trim();

  try {
    scheduleLeadDashboardIndexes(waitUntil, env.LEADS_DB);
    const counts = await fetchStatusCounts(env);
    const leadQuality = await fetchLeadQualityMetrics(env);
    const { rows, fetchedCount } = await fetchLeadRows(env, filters);
    const brokerPartners = await fetchBrokerPartners(env);
    const referralsByLead = await fetchReferralHistory(env, rows);
    return adminResponse(renderPage({ rows, token, filters, fetchedCount, counts, notice, leadQuality, brokerPartners, referralsByLead, operatorTimeZone: env.OPERATOR_TIME_ZONE }));
  } catch (error) {
    return adminResponse(`<h1>Lead dashboard error</h1><p>${escapeHtml(error.message)}</p>`, 500);
  }
}

export async function onRequestPost({ request, env }) {
  const configuredToken = env.ADMIN_DASHBOARD_TOKEN;
  if (!configuredToken) {
    return adminResponse("Admin dashboard is not configured.", 403);
  }

  const formData = await request.formData();
  const token = formData.get("token") || "";
  if (token !== configuredToken) {
    return adminResponse("Forbidden", 403);
  }

  const id = String(formData.get("id") || "").trim();
  const action = String(formData.get("action") || "").trim();
  const route = String(formData.get("route") || "recommended").trim();
  const params = new URLSearchParams({ token, view: "pending" });

  if (!id) {
    return adminResponse("Missing lead id", 400);
  }

  try {
    if (action === "send_requirement") {
      const destination = String(formData.get("destination") || "").trim();
      const overrideAcknowledged = String(formData.get("readiness_override") || "") === "acknowledged";
      params.set("id", id);
      if (!destination) {
        return adminResponse("Missing fulfillment destination", 400);
      }
      const readinessCheck = await recordBrokerReadinessAtSend(env, id, destination, overrideAcknowledged);
      if (!readinessCheck.ok) {
        params.set("notice", `${readinessCheck.title}: ${readinessCheck.message || "Add the material missing Requirement context or explicitly acknowledge an override."}`);
        return adminRedirect(`/admin/leads?${params.toString()}`);
      }
      if (destination === "officefinder") {
        const result = await approveLead(env, id, "officefinder", { readinessOverride: overrideAcknowledged });
        params.set("notice", result.status === 200 ? "Requirement sent to OfficeFinder." : result.title || "OfficeFinder routing failed.");
        return adminRedirect(`/admin/leads?${params.toString()}`);
      }
      if (destination.startsWith("broker:")) {
        const brokerPartnerId = destination.slice("broker:".length).trim();
        if (!brokerPartnerId) {
          return adminResponse("Missing broker partner id", 400);
        }
        const result = await createAndSendReferral(env, request, {
          leadId: id,
          brokerPartnerId,
          createdBy: "admin",
          readinessOverride: overrideAcknowledged,
        });
        if (result.email && result.email.sent) {
          params.set("notice", `Requirement sent to ${result.broker.name || result.broker.email}.`);
        } else {
          params.set("notice", `Requirement created but email failed: ${(result.email && result.email.reason) || "unknown error"}`);
        }
        return adminRedirect(`/admin/leads?${params.toString()}`);
      }
      return adminResponse("Unsupported fulfillment destination", 400);
    }

    if (action === "send_referral") {
      const brokerPartnerId = String(formData.get("broker_partner_id") || "").trim();
      const overrideAcknowledged = String(formData.get("readiness_override") || "") === "acknowledged";
      if (!brokerPartnerId) {
        return adminResponse("Missing broker partner id", 400);
      }
      const readinessCheck = await recordBrokerReadinessAtSend(env, id, `broker:${brokerPartnerId}`, overrideAcknowledged);
      if (!readinessCheck.ok) {
        params.set("id", id);
        params.set("notice", `${readinessCheck.title}: ${readinessCheck.message || "Add the material missing Requirement context or explicitly acknowledge an override."}`);
        return adminRedirect(`/admin/leads?${params.toString()}`);
      }
      const result = await createAndSendReferral(env, request, {
        leadId: id,
        brokerPartnerId,
        createdBy: "admin",
        readinessOverride: overrideAcknowledged,
      });
      params.set("id", id);
      if (result.email && result.email.sent) {
        params.set("notice", `Referral sent to ${result.broker.name || result.broker.email}.`);
      } else {
        params.set("notice", `Referral created but email failed: ${(result.email && result.email.reason) || "unknown error"}`);
      }
      return adminRedirect(`/admin/leads?${params.toString()}`);
    }

    if (action === "approve") {
      const result = await approveLead(env, id, route);
      params.set("notice", result.title || "Lead action complete");
      return adminRedirect(`/admin/leads?${params.toString()}`);
    }

    const record = await getLead(env, id);
    if (!record) {
      return adminResponse("Lead not found", 404);
    }

    if (action === "reject") {
      if (["approved_sent", "broker_sent", "both_sent", "partial_sent"].includes(record.status)) {
        params.set("notice", "Lead already sent; it was not rejected.");
      } else {
        await updateLeadStatus(env, id, {
          status: "rejected",
          rejected_at: new Date().toISOString(),
        });
        params.set("notice", "Lead rejected.");
      }
      return adminRedirect(`/admin/leads?${params.toString()}`);
    }

    if (action === "spam") {
      const lead = {
        ...(record.lead || {}),
        status: "spam_quarantined",
        spam_score: record.lead.spam_score || 50,
        spam_reasons: [
          ...((record.lead && record.lead.spam_reasons) || []),
          "Manually marked as spam from dashboard",
        ],
      };
      await updateLeadStatus(env, id, {
        status: "spam_quarantined",
        lead,
        approval_error: "Manually marked as spam from dashboard",
        rejected_at: new Date().toISOString(),
      });
      params.set("notice", "Lead marked as spam.");
      return adminRedirect(`/admin/leads?${params.toString()}`);
    }

    return adminResponse("Unknown dashboard action", 400);
  } catch (error) {
    return adminResponse(`<h1>Dashboard action failed</h1><p>${escapeHtml(error.message)}</p>`, 500);
  }
}
