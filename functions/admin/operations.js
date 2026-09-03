import { escapeHtml } from "../api/leads/_shared.js";
import {
  MISSION_CONTROL_NAV_CSS,
  renderMissionControlHeader,
} from "./mission-control-nav.js";
import { assessBrokerReadiness, BROKER_READINESS } from "../_shared/project-snapshot.js";

const KPI_WINDOWS = [7, 30];
const RECENT_BRIEF_LIMIT = 100;
const TOP_LIMIT = 6;

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

const CLEARLY_NON_CUSTOMER = /(?:^|[^a-z])(?:qa|test|fixture|synthetic|certification|operator(?:_requirement|[-_ ]probe)?|codex)(?:[^a-z]|$)/i;
const SENT_STATUSES = new Set(["approved_sent", "broker_sent", "both_sent", "partial_sent"]);

export function isClearlyNonCustomerRecord(value = {}) {
  const status = String(value.status || "").toLowerCase();
  if (["spam_quarantined", "rejected_spam", "rejected"].includes(status)) return true;
  const source = [value.source, value.sourceType, value.createdFrom, value.campaign, value.profileVersion]
    .filter(Boolean).join(" ");
  return CLEARLY_NON_CUSTOMER.test(source);
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

async function queryRows(db, sql, bindings = []) {
  const result = await db.prepare(sql).bind(...bindings).all();
  return result.results || [];
}

async function firstCount(db, sql, bindings = []) {
  const row = await db.prepare(sql).bind(...bindings).first();
  return Number(row && row.count || 0);
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
      // Raw v2 view activity is retained only in Activity Diagnostics; the canonical
      // intelligence-delivery count comes from durable current recommendation snapshots.
      briefViewsV2: await countSearchEvents(env, "vnext_brief_viewed", days),
      locationBriefsCreated: await countLocationBriefEvents(env, "location_brief_created", days),
      expertReviewsRequested: await countLocationBriefEvents(env, "expert_review_requested", days),
    });
  }
  return rows;
}

async function loadCustomerFunnel(env, days = 30) {
  const db = env.LEADS_DB;
  if (!db) return null;
  const since = lookbackStartIso(days);
  const result = {
    days,
    engaged: null,
    requirementsCreated: null,
    intelligence: { FULL: 0, BOUNDED: 0, INVESTIGATE: 0, total: 0 },
    briefEngaged: null,
    continuationRequested: null,
    fulfillmentSent: null,
  };
  try {
    result.engaged = await firstCount(db, `
      select count(distinct coalesce(
        nullif(json_extract(event_json, '$.attribution.session_id'), ''),
        nullif(json_extract(event_json, '$.context.journey_id'), ''), id
      )) as count
      from search_profile_events
      where created_at >= ? and event_name in ('search_profile_started', 'vnext_requirement_started')
        and lower(event_json) not like '%certification%'
        and lower(event_json) not like '%synthetic%'
        and lower(event_json) not like '%operator_requirement%'
    `, [since]);
  } catch (error) { if (!isMissingTable(error, "search_profile_events")) throw error; }
  let legacyLeadRequirements = 0; let v2Requirements = 0;
  try { legacyLeadRequirements = await firstCount(db, `select count(distinct l.id) as count from leads l left join location_brief_v2_commercial_requests cr on cr.lead_id = l.id where l.created_at >= ? and cr.lead_id is null and l.status not in ('spam_quarantined','rejected_spam','rejected') and lower(coalesce(json_extract(l.lead_json, '$.source'), json_extract(l.lead_json, '$.created_from'), '')) not like '%test%' and lower(coalesce(json_extract(l.lead_json, '$.source'), json_extract(l.lead_json, '$.created_from'), '')) not like '%qa%' and lower(coalesce(json_extract(l.lead_json, '$.source'), json_extract(l.lead_json, '$.created_from'), '')) not like '%operator%'`, [since]); } catch (error) { if (!isMissingTable(error, "leads")) throw error; }
  try { v2Requirements = await firstCount(db, `select count(distinct b.id) as count from location_briefs_v2 b join location_brief_v2_entry_contexts e on e.id = b.entry_context_id where b.created_at >= ? and b.archived_at is null and lower(coalesce(json_extract(e.context_json, '$.sourceType'), '')) not like '%test%' and lower(coalesce(json_extract(e.context_json, '$.sourceType'), '')) not like '%qa%' and lower(coalesce(json_extract(e.context_json, '$.sourceType'), '')) not like '%operator%' and lower(coalesce(json_extract(e.context_json, '$.sourceType'), '')) not like '%certification%'`, [since]); } catch (error) { if (!isMissingTable(error, "location_briefs_v2")) throw error; }
  result.requirementsCreated = legacyLeadRequirements + v2Requirements;
  try {
    const rows = await queryRows(db, `
      select upper(s.readiness) as readiness, count(distinct b.id) as count
      from location_briefs_v2 b
      join location_brief_v2_recommendation_snapshots s on s.id = b.current_recommendation_snapshot_id
      join location_brief_v2_entry_contexts e on e.id = b.entry_context_id
      where b.created_at >= ? and b.archived_at is null
        and lower(coalesce(json_extract(e.context_json, '$.sourceType'), '')) not like '%test%'
        and lower(coalesce(json_extract(e.context_json, '$.sourceType'), '')) not like '%qa%'
        and lower(coalesce(json_extract(e.context_json, '$.sourceType'), '')) not like '%operator%'
        and lower(coalesce(json_extract(e.context_json, '$.sourceType'), '')) not like '%certification%'
      group by upper(s.readiness)
    `, [since]);
    for (const row of rows) if (Object.hasOwn(result.intelligence, row.readiness)) result.intelligence[row.readiness] = Number(row.count || 0);
    result.intelligence.total = result.intelligence.FULL + result.intelligence.BOUNDED + result.intelligence.INVESTIGATE;
  } catch (error) { if (!isMissingTable(error, "location_briefs_v2")) throw error; }
  try {
    result.briefEngaged = await firstCount(db, `
      select count(distinct coalesce(nullif(json_extract(event_json, '$.context.brief_id'), ''), '') || ':' ||
        coalesce(nullif(json_extract(event_json, '$.attribution.session_id'), ''), id)) as count
      from search_profile_events where created_at >= ? and event_name = 'vnext_brief_viewed'
    `, [since]);
  } catch (error) { if (!isMissingTable(error, "search_profile_events")) throw error; }
  try {
    result.continuationRequested = await firstCount(db, `
      select count(*) as count from location_brief_v2_commercial_requests
      where created_at >= ? and status = 'created'
    `, [since]);
  } catch (error) { if (!isMissingTable(error, "location_brief_v2_commercial_requests")) throw error; }
  try {
    const leadSent = await firstCount(db, `select count(distinct id) as count from leads where sent_at >= ? and status in ('approved_sent','broker_sent','both_sent','partial_sent')`, [since]);
    let referralOnly = 0;
    try {
      referralOnly = await firstCount(db, `select count(distinct r.lead_id) as count from referrals r left join leads l on l.id = r.lead_id where r.sent_at >= ? and (l.id is null or l.sent_at is null or l.sent_at < ?)`, [since, since]);
    } catch (error) { if (!isMissingTable(error, "referrals")) throw error; }
    result.fulfillmentSent = leadSent + referralOnly;
  } catch (error) { if (!isMissingTable(error, "leads")) throw error; }
  return result;
}

async function loadLeadRows(env, days = 30) {
  if (!env.LEADS_DB) return [];
  try {
    const result = await env.LEADS_DB.prepare(`
      select id, status, lead_json, created_at
      from leads
      where created_at >= ?
      order by created_at desc
      limit ?
    `).bind(lookbackStartIso(days), RECENT_BRIEF_LIMIT).all();
    return result.results || [];
  } catch (error) {
    if (isMissingTable(error, "leads")) return [];
    throw error;
  }
}

function normalizeBriefLeadRow(row) {
  const lead = parseJson(row.lead_json);
  const readiness = assessBrokerReadiness(lead);
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
    version: lead.location_brief_public_id ? "v1/lead" : "lead",
    recommendationReadiness: lead.recommendation_readiness || "",
    brokerReadiness: readiness.status,
    source: lead.source || lead.created_from || lead.entry_source || "",
    sourceType: lead.source_type || "",
    campaign: lead.campaign || "",
    createdFrom: lead.created_from || "",
  };
}

async function loadV2RequirementRows(env, days = 30) {
  if (!env.LEADS_DB) return [];
  try {
    return await queryRows(env.LEADS_DB, `
      select b.id, b.public_id, b.lifecycle_stage, b.created_at,
        r.requirement_json, s.readiness, e.context_json,
        cr.lead_id, l.status as lead_status, l.lead_json
      from location_briefs_v2 b
      join location_brief_v2_requirement_revisions r on r.id = b.current_requirement_revision_id
      left join location_brief_v2_recommendation_snapshots s on s.id = b.current_recommendation_snapshot_id
      left join location_brief_v2_entry_contexts e on e.id = b.entry_context_id
      left join location_brief_v2_commercial_requests cr on cr.brief_id = b.id and cr.status = 'created'
        and cr.property_draft_revision = (select max(cr2.property_draft_revision) from location_brief_v2_commercial_requests cr2 where cr2.brief_id = b.id and cr2.status = 'created')
      left join leads l on l.id = cr.lead_id
      where b.created_at >= ? and b.archived_at is null
      order by b.created_at desc limit ?
    `, [lookbackStartIso(days), RECENT_BRIEF_LIMIT]);
  } catch (error) {
    if (isMissingTable(error, "location_briefs_v2")) return [];
    throw error;
  }
}

function criterionText(requirement, dimension) {
  const item = (requirement.criteria || []).find((entry) => entry.dimension === dimension);
  const value = item && item.value;
  return String(value && (value.text || value.label || value.value) || "").trim();
}

function normalizeV2RequirementRow(row) {
  const requirement = parseJson(row.requirement_json);
  const context = parseJson(row.context_json);
  const lead = parseJson(row.lead_json);
  const anchor = requirement.locationLogic && requirement.locationLogic.marketAnchor || {};
  const business = requirement.businessIdentity || {};
  const projectedLead = lead && Object.keys(lead).length ? lead : {
    requested_space_type: requirement.propertyTypes && requirement.propertyTypes[0],
    location_display: anchor.displayName || [anchor.city, anchor.state].filter(Boolean).join(", "),
    specific_business_use: business.specificUse || business.specific || business.displayName || business.canonical,
    space_needed: criterionText(requirement, "capacity.approximate_size") || criterionText(requirement, "capacity.size"),
    move_timing: criterionText(requirement, "timing.target") || criterionText(requirement, "timing"),
  };
  const hasLead = Boolean(row.lead_id && lead && Object.keys(lead).length);
  const readiness = hasLead ? assessBrokerReadiness(projectedLead) : null;
  return {
    id: row.id,
    leadId: row.lead_id || "",
    status: row.lead_status || row.lifecycle_stage || "requirement_created",
    createdAt: row.created_at || "",
    publicId: row.public_id || "",
    briefUrl: row.public_id ? `/location-brief/${encodeURIComponent(row.public_id)}` : "",
    customer: lead.name || "",
    email: lead.email || "",
    company: lead.company || "",
    market: anchor.displayName || [anchor.city, anchor.state].filter(Boolean).join(", ") || anchor.marketName || anchor.marketId || "",
    spaceType: requirement.propertyTypes && requirement.propertyTypes[0] || "",
    size: criterionText(requirement, "capacity.approximate_size") || criterionText(requirement, "capacity.size") || lead.space_needed || "",
    priorities: [],
    version: "v2",
    recommendationReadiness: String(row.readiness || "").toUpperCase(),
    brokerReadiness: readiness ? readiness.status : "NOT_ASSESSED",
    source: context.sourceType || "",
    sourceType: context.sourceType || "",
    campaign: context.campaign || "",
    createdFrom: context.sourcePath || "",
  };
}

export function mergeRecentRequirements(leadRows, v2Rows) {
  const v2LeadIds = new Set(v2Rows.map((row) => row.leadId).filter(Boolean));
  return [...v2Rows, ...leadRows.filter((row) => !v2LeadIds.has(row.id))]
    .filter((row) => !isClearlyNonCustomerRecord(row))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, RECENT_BRIEF_LIMIT);
}

function loadOperationalFulfillment(rows) {
  const counts = {
    valid: 0,
    brokerReady: 0,
    needsQualification: 0,
    insufficient: 0,
    underReview: 0,
    sent: 0,
  };
  for (const row of rows) {
    if (isClearlyNonCustomerRecord(row)) continue;
    if (!["spam_quarantined", "rejected_spam", "rejected"].includes(String(row.status || "").toLowerCase())) counts.valid += 1;
    if (row.brokerReadiness === BROKER_READINESS.READY) counts.brokerReady += 1;
    if (row.brokerReadiness === BROKER_READINESS.NEEDS_QUALIFICATION) counts.needsQualification += 1;
    if (row.brokerReadiness === BROKER_READINESS.INSUFFICIENT) counts.insufficient += 1;
    if (["pending", "expert_review_requested", "market_investigation_requested", "broker_assigned", "under_review", "tour_planning"].includes(row.status)) counts.underReview += 1;
    if (SENT_STATUSES.has(row.status)) counts.sent += 1;
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
  const readiness = new Map();

  for (const row of rows) {
    addCount(markets, row.market);
    addCount(spaceTypes, row.spaceType);
    row.priorities.forEach((priority) => addCount(priorities, priority));
    addCount(readiness, statusLabel(row.brokerReadiness || "Unknown"));
  }

  return {
    markets: topEntries(markets),
    spaceTypes: topEntries(spaceTypes),
    priorities: topEntries(priorities),
    readiness: topEntries(readiness),
  };
}

function loadRecommendationPerformance(rows) {
  const grouped = new Map();
  for (const row of rows) {
    if (row.version !== "v2" || !row.recommendationReadiness) continue;
    const key = `${row.market || "Unknown"}|||${statusLabel(row.spaceType || "Unknown")}`;
    const current = grouped.get(key) || { market: row.market || "Unknown", spaceType: statusLabel(row.spaceType || "Unknown"), requirements: 0, FULL: 0, BOUNDED: 0, INVESTIGATE: 0 };
    current.requirements += 1;
    if (Object.hasOwn(current, row.recommendationReadiness)) current[row.recommendationReadiness] += 1;
    grouped.set(key, current);
  }
  return [...grouped.values()].sort((a, b) => b.requirements - a.requirements || a.market.localeCompare(b.market)).slice(0, 12);
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

function renderOperationalFulfillment(operations) {
  const cards = [
    ["Valid requirements", operations.valid],
    ["Broker ready", operations.brokerReady],
    ["Needs qualification", operations.needsQualification],
    ["Insufficient requirement", operations.insufficient],
    ["Approved / under review", operations.underReview],
    ["Sent to fulfillment", operations.sent],
  ];
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>Operational Fulfillment</h2>
        <p>Requirement quality and fulfillment state for recent Requirements; broker readiness is assessed when lead context exists. These are operational dimensions, not funnel stages.</p>
      </div>
      <div class="pipeline-grid">
        ${cards.map(([label, count]) => `
          <article class="pipeline-card">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(count || 0)}</strong>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderBriefRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="11" class="empty">No recent Requirements in this window.</td></tr>`;
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
      <td>${escapeHtml(statusLabel(row.brokerReadiness || "Unknown"))}</td>
      <td>${escapeHtml(row.recommendationReadiness || "—")}</td>
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
          <h2>Recent Requirements</h2>
          <p>Current v1 and v2 persisted Requirements from the last 30 rolling days; clearly marked QA, synthetic, operator-probe, and spam records are excluded.</p>
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
              <th>Broker Readiness</th>
              <th>Recommendation</th>
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
        <p>Demand from the same current persisted Requirements shown above, within the explicit 30-day window—not page traffic.</p>
      </div>
      <div class="demand-grid">
        ${renderDemandList("Top requested markets", demand.markets)}
        ${renderDemandList("Top space types", demand.spaceTypes)}
        ${renderDemandList("Broker readiness", demand.readiness || [])}
      </div>
    </section>
  `;
}

function measurable(value) { return value === null || value === undefined ? "Not yet measurable" : value; }

function renderCustomerFunnel(funnel) {
  const steps = [
    ["Location Search Engaged", measurable(funnel && funnel.engaged), "Unique journey/session with a meaningful start event"],
    ["Requirement Created", measurable(funnel && funnel.requirementsCreated), "Unique persisted v1 + v2 Requirements"],
    ["Location Intelligence Delivered", measurable(funnel && funnel.intelligence && funnel.intelligence.total), "Current v2 recommendation snapshots"],
    ["Location Brief Engaged", measurable(funnel && funnel.briefEngaged), "Unique v2 Brief × viewer session"],
    ["Space Search Continuation Requested", measurable(funnel && funnel.continuationRequested), "Persisted v2 commercial requests"],
    ["Fulfillment Sent", measurable(funnel && funnel.fulfillmentSent), "Unique successfully sent leads/referrals"],
  ];
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>Customer Funnel</h2>
        <p>Last 30 rolling days (UTC). Counts use the most durable honest source available. No conversion rate is shown where stages cannot be linked to one eligible cohort.</p>
      </div>
      <div class="funnel">
        ${steps.map(([label, count, denominator]) => `
            <article>
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(count)}</strong>
              <small>${escapeHtml(denominator)}</small>
            </article>
        `).join("")}
      </div>
      <div class="readiness-grid">
        ${["FULL", "BOUNDED", "INVESTIGATE"].map((state) => `<article><span>${state}</span><strong>${escapeHtml(funnel && funnel.intelligence ? funnel.intelligence[state] : 0)}</strong></article>`).join("")}
      </div>
    </section>
  `;
}

function renderAcquisition(kpis) {
  return `<section class="panel"><div class="section-heading"><h2>Acquisition / Entry</h2><p>Unfiltered activity. These counters are not sequential and are not conversion denominators.</p></div><section class="metrics" aria-label="Acquisition activity">${metricCard("Recommendation Prompt Clicks", "promptClicks", kpis)}${metricCard("Find Locations Page Entries", "findLocationsStarts", kpis)}</section></section>`;
}

function renderRecommendationPerformance(rows) {
  return `<section class="panel panel--table"><div class="section-heading"><h2>Recommendation Intelligence Performance</h2><p>Current v2 Requirement and snapshot outcomes by market and property type, last 30 rolling days.</p></div><div class="table-wrap"><table><thead><tr><th>Market</th><th>Property type</th><th>Requirements</th><th>FULL</th><th>BOUNDED</th><th>INVESTIGATE</th></tr></thead><tbody>${rows.length ? rows.map((row) => `<tr><td>${escapeHtml(row.market)}</td><td>${escapeHtml(row.spaceType)}</td><td>${row.requirements}</td><td>${row.FULL}</td><td>${row.BOUNDED}</td><td>${row.INVESTIGATE}</td></tr>`).join("") : `<tr><td colspan="6" class="empty">No current v2 recommendation snapshots in this window.</td></tr>`}</tbody></table></div></section>`;
}

function renderLegacyDiagnostics(kpis) {
  return `<section class="panel"><div class="section-heading"><h2>Activity Diagnostics</h2><p>Legacy/raw counters retained for observability. They are not the canonical customer funnel.</p></div><section class="metrics">${metricCard("Legacy v1 Brief Events", "locationBriefsCreated", kpis)}${metricCard("Legacy Expert Review Events", "expertReviewsRequested", kpis)}${metricCard("Raw v2 Brief View Events", "briefViewsV2", kpis)}</section></section>`;
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
      title: "Lead Operations",
      purpose: "Run requirement intake, routing, and fulfillment follow-up",
      href: `/admin/operations?token=${encodeURIComponent(token)}`,
      current: true,
    },
    {
      title: "Today",
      purpose: "Executive briefing and highest-leverage work",
      href: `/admin/eos?token=${encodeURIComponent(token)}`,
    },
    {
      title: "Rofo Compass",
      purpose: "Commercial location intelligence engine health",
      href: `/admin/compass?token=${encodeURIComponent(token)}`,
    },
    {
      title: "Publisher",
      purpose: "Metro completeness and production planning",
      href: `/admin/publisher?token=${encodeURIComponent(token)}`,
    },
    {
      title: "Field",
      purpose: "Mobile Rofo-owned photo upload and publishing",
      href: `/admin/field-photos?token=${encodeURIComponent(token)}`,
    },
    {
      title: "Compass Coverage",
      purpose: "Metro maturity and expansion roadmap",
      href: `/admin/coverage?token=${encodeURIComponent(token)}`,
    },
    {
      title: "Leads",
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

function renderPage({ token, kpis, customerFunnel, operations, recentBriefs, demand, recommendationPerformance, errors, env }) {
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
    ${MISSION_CONTROL_NAV_CSS}
    h1 { margin: 0 0 8px; font-size: clamp(2rem, 4vw, 3.4rem); line-height: 1; letter-spacing: -0.02em; }
    h2, h3, p { margin: 0; }
    header p, .section-heading p { color: var(--muted); line-height: 1.55; }
    .button-link { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; padding: 0 12px; border: 1px solid var(--border); border-radius: 999px; background: #fff; color: var(--blue); font-size: 0.9rem; font-weight: 800; text-decoration: none; white-space: nowrap; }
    .button-link--active { border-color: #bfdbfe; background: #eff6ff; color: #1e40af; }
    .metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 0; }
    .metric-card, .panel, .pipeline-card, .demand-card, .health-card { border: 1px solid var(--border); background: var(--surface); box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06); }
    .metric-card { display: grid; gap: 6px; padding: 16px; border-radius: 16px; }
    .metric-card span, .pipeline-card span, .health-card span { color: var(--muted); font-size: 0.76rem; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; }
    .metric-card strong { font-size: 2rem; line-height: 1; }
    .metric-card small, .metric-card div { color: var(--muted); font-size: 0.85rem; }
    .panel { margin-top: 16px; padding: 20px; border-radius: 18px; }
    .section-heading { display: grid; gap: 6px; margin-bottom: 14px; }
    .section-heading--row { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
    .pipeline-grid, .health-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
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
    .funnel { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .funnel article { position: relative; padding: 14px; border: 1px solid #cfdcf0; border-radius: 14px; background: linear-gradient(180deg, #fff 0%, #f8fbff 100%); }
    .funnel span { display: block; color: var(--muted); font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; }
    .funnel strong { display: block; margin-top: 8px; font-size: 1.7rem; }
    .funnel small { color: var(--muted); }
    .readiness-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 10px; margin-top: 12px; }
    .readiness-grid article { padding: 12px 14px; border: 1px solid var(--border); border-radius: 12px; background: #f8fbff; }
    .readiness-grid span { display: block; color: var(--muted); font-size: .72rem; font-weight: 900; }
    .readiness-grid strong { font-size: 1.45rem; }
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
    ${renderMissionControlHeader({
      token,
      active: "leads",
      title: "Lead Operations",
      description: "Recommendation activity, Location Briefs, requirements, routing status, and expert review workflow.",
      escapeHtml,
    })}

    ${errors.length ? `<div class="notice">Some operations data could not be loaded: ${errors.map(escapeHtml).join(" ")}</div>` : ""}

    ${renderAcquisition(kpis)}
    ${renderCustomerFunnel(customerFunnel)}
    ${renderOperationalFulfillment(operations)}
    ${renderRecommendationPerformance(recommendationPerformance)}
    ${renderAdminModules(token)}
    ${renderRecentBriefs(recentBriefs, token)}
    ${renderDemand(demand)}
    ${renderLegacyDiagnostics(kpis)}
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
    briefViewsV2: 0,
    locationBriefsCreated: 0,
    expertReviewsRequested: 0,
  }));
  let recentBriefs = [];
  let customerFunnel = null;

  try {
    kpis = await loadKpis(env);
  } catch (error) {
    errors.push(error.message || "KPI queries failed.");
  }

  try {
    const leadRows = (await loadLeadRows(env, 30)).map(normalizeBriefLeadRow);
    const v2Rows = (await loadV2RequirementRows(env, 30)).map(normalizeV2RequirementRow);
    recentBriefs = mergeRecentRequirements(leadRows, v2Rows);
  } catch (error) {
    errors.push(error.message || "Recent Requirement rows failed.");
  }

  try { customerFunnel = await loadCustomerFunnel(env, 30); }
  catch (error) { errors.push(error.message || "Customer funnel queries failed."); }

  const operations = loadOperationalFulfillment(recentBriefs);
  const demand = loadDemand(recentBriefs);
  const recommendationPerformance = loadRecommendationPerformance(recentBriefs);

  return adminResponse(renderPage({
    token,
    kpis,
    customerFunnel,
    operations,
    recentBriefs,
    demand,
    recommendationPerformance,
    errors,
    env,
  }));
}
