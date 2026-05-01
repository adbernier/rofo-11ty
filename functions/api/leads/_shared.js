import leadRoutes from "../../../_data/leadRoutes.json";

export const OFFICEFINDER_TEST_ENDPOINT = "https://www.officefinder.com/scripts/_importLeadTest.cfm";
export const OFFICEFINDER_PRODUCTION_ENDPOINT = "https://www.officefinder.com/scripts/_importLead.cfm";

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function htmlResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function redirectResponse(path, status = 303) {
  return new Response(null, {
    status,
    headers: {
      location: path,
      "cache-control": "no-store",
    },
  });
}

export function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeField(value) {
  return String(value || "").trim();
}

function normalizeSpaceType(value) {
  return normalizeField(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeRouteValue(value) {
  return normalizeField(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeState(value) {
  return normalizeField(value).toUpperCase();
}

function getFinanceOption(spaceType) {
  return "leasing";
}

export function normalizeSqFtForOfficeFinder(spaceNeeded) {
  const raw = normalizeField(spaceNeeded).toLowerCase();
  if (!raw || raw.includes("not sure")) return "1000";
  const numbers = raw.match(/\d[\d,]*/g);
  if (!numbers || !numbers.length) return "1000";
  const parsed = numbers.map((number) => Number(number.replace(/,/g, ""))).filter(Boolean);
  if (!parsed.length) return "1000";
  if (raw.includes("under")) return String(parsed[0]);
  if (raw.includes("+")) return String(parsed[0]);
  return String(parsed[parsed.length - 1]);
}

export function normalizePhoneForOfficeFinder(phone) {
  const raw = normalizeField(phone);
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  if (digits.length !== 10) return "";
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function getMarketName(lead) {
  return normalizeField(lead.city || lead.market || lead.location);
}

export function buildLeadPayload(formFields, request) {
  const now = new Date().toISOString();
  const spaceType = normalizeField(formFields.requested_space_type || formFields.space_type);
  const market = normalizeField(formFields.market || formFields.location || [formFields.city, formFields.state].filter(Boolean).join(", "));
  const state = normalizeState(formFields.state);

  return {
    name: normalizeField(formFields.name),
    email: normalizeField(formFields.email),
    phone: normalizeField(formFields.phone),
    company: normalizeField(formFields.company || formFields.CompanyName),
    city: normalizeField(formFields.city),
    county: normalizeField(formFields.county),
    state,
    market,
    space_type: normalizeField(formFields.space_type),
    requested_space_type: normalizeField(formFields.requested_space_type),
    routing_market: normalizeRouteValue(formFields.routing_market),
    routing_county: normalizeRouteValue(formFields.routing_county),
    routing_space_type: normalizeSpaceType(formFields.routing_space_type),
    space_needed: normalizeField(formFields.space_needed || formFields.size),
    requirements: normalizeField(formFields.requirements || formFields.message || formFields.notes),
    page_type: normalizeField(formFields.page_type),
    page_url: normalizeField(formFields.page_url),
    rofo_source: normalizeField(formFields.rofo_source || formFields.page_url),
    source: normalizeField(formFields.source || "rofo"),
    timestamp: now,
    status: "pending",
    officefinder_status: "officefinder_not_attempted",
    user_agent: normalizeField(request.headers.get("user-agent")),
    ip_country: normalizeField(request.cf && request.cf.country),
    effective_space_type: spaceType,
  };
}

export function getMissingSubmitFields(lead) {
  const missing = [];
  if (!lead.name) missing.push("name");
  if (!lead.email) missing.push("email");
  if (!lead.phone) missing.push("phone");
  if (!lead.market && !lead.city) missing.push("market");
  return missing;
}

function getLeadCitySlug(lead) {
  if (lead.routing_market) return lead.routing_market.replace(/-[a-z]{2}$/i, "");
  return normalizeRouteValue(lead.city || lead.market);
}

function getLeadCountySlug(lead) {
  if (lead.routing_county) return lead.routing_county.replace(/-[a-z]{2}$/i, "");
  return normalizeRouteValue(lead.county);
}

function getLeadState(lead) {
  if (lead.state) return normalizeState(lead.state);
  const market = normalizeField(lead.routing_market || lead.market);
  const match = market.match(/-([a-z]{2})$/i) || market.match(/,\s*([a-z]{2})$/i);
  return match ? normalizeState(match[1]) : "";
}

function getLeadSpaceTypeSlug(lead) {
  return normalizeSpaceType(lead.routing_space_type || lead.requested_space_type || lead.space_type || lead.effective_space_type);
}

function routeValueMatches(routeValue, leadValues) {
  const normalized = normalizeRouteValue(routeValue);
  if (!normalized) return true;
  if (normalized === "all") return true;
  return leadValues.includes(normalized);
}

function stateMatches(routeState, leadState) {
  const normalized = normalizeField(routeState);
  if (!normalized) return true;
  if (normalized.toLowerCase() === "all") return true;
  return normalizeState(normalized) === leadState;
}

function routeMatches(route, leadContext) {
  if (route.active === false) return false;
  return routeValueMatches(route.city, leadContext.cityValues)
    && routeValueMatches(route.county, leadContext.countyValues)
    && stateMatches(route.state, leadContext.state)
    && routeValueMatches(route.space_type, leadContext.spaceTypeValues);
}

function getSpecificityTier(route) {
  const hasCity = Boolean(normalizeRouteValue(route.city)) && normalizeRouteValue(route.city) !== "all";
  const hasCounty = Boolean(normalizeRouteValue(route.county)) && normalizeRouteValue(route.county) !== "all";
  const hasState = Boolean(normalizeField(route.state)) && normalizeField(route.state).toLowerCase() !== "all";
  const hasSpaceType = Boolean(normalizeRouteValue(route.space_type)) && normalizeRouteValue(route.space_type) !== "all";

  if (hasCity && hasState && hasSpaceType) return 1;
  if (hasCounty && hasState && hasSpaceType) return 2;
  if (hasCity && hasState) return 3;
  if (hasCounty && hasState) return 4;
  if (hasState && hasSpaceType) return 5;
  if (hasState) return 6;
  return 7;
}

function describeRouteReason(route, tier) {
  const parts = [];
  if (route.city) parts.push(`city=${route.city}`);
  if (route.county) parts.push(`county=${route.county}`);
  if (route.state) parts.push(`state=${route.state}`);
  if (route.space_type) parts.push(`space_type=${route.space_type}`);
  return parts.length ? `Matched rule ${route.id || "(unnamed)"} (${parts.join(", ")}, tier ${tier}).` : `Matched default rule ${route.id || "(unnamed)"}.`;
}

function getRouteTo(route) {
  const mode = normalizeField(route.officefinder_mode).toLowerCase();
  const brokerAvailable = Boolean(normalizeField(route.broker_email || (Array.isArray(route.brokers) ? route.brokers[0] : "")));

  if (mode === "primary") return "officefinder";
  if (mode === "parallel") return brokerAvailable ? "both" : "officefinder";
  if (mode === "fallback") return brokerAvailable ? "broker" : "officefinder";

  return route.route_to || "officefinder";
}

export function resolveLeadRoute(lead) {
  const state = getLeadState(lead);
  const citySlug = getLeadCitySlug(lead);
  const countySlug = getLeadCountySlug(lead);
  const spaceTypeSlug = getLeadSpaceTypeSlug(lead);
  const cityStateSlug = lead.routing_market || (citySlug && state ? `${citySlug}-${state.toLowerCase()}` : citySlug);
  const countyStateSlug = lead.routing_county || (countySlug && state ? `${countySlug}-${state.toLowerCase()}` : countySlug);
  const leadContext = {
    state,
    cityValues: [citySlug, cityStateSlug].filter(Boolean),
    countyValues: [countySlug, countyStateSlug].filter(Boolean),
    spaceTypeValues: [spaceTypeSlug, normalizeField(lead.requested_space_type), normalizeField(lead.space_type)].map(normalizeSpaceType).filter(Boolean),
  };

  const activeMatches = leadRoutes
    .filter((route) => route.active !== false)
    .filter((route) => routeMatches(route, leadContext))
    .map((route, index) => {
      const specificity = getSpecificityTier(route);
      return {
        ...route,
        _index: index,
        _specificity: specificity,
        _priority: Number.isFinite(Number(route.priority)) ? Number(route.priority) : 1000,
      };
    })
    .sort((a, b) => a._priority - b._priority || a._specificity - b._specificity || a._index - b._index);

  const matched = activeMatches[0] || {
    id: "rofo-default-officefinder",
    route_to: "officefinder",
    officefinder_mode: "fallback",
    notes: "Built-in fallback when no active default route exists.",
    _specificity: 7,
  };
  const routeTo = getRouteTo(matched);
  const brokerEmail = normalizeField(matched.broker_email || (Array.isArray(matched.brokers) ? matched.brokers[0] : ""));

  return {
    route_to: routeTo,
    officefinder_mode: matched.officefinder_mode || (routeTo === "both" ? "parallel" : routeTo === "officefinder" ? "primary" : "fallback"),
    route_id: matched.id || "",
    route_reason: describeRouteReason(matched, matched._specificity || 7),
    broker_name: matched.broker_name || "",
    broker_email: brokerEmail,
    broker_phone: matched.broker_phone || "",
    notes: matched.notes || "",
    matched_rule: {
      id: matched.id || "",
      route_to: routeTo,
      officefinder_mode: matched.officefinder_mode || "",
      brokers: Array.isArray(matched.brokers) ? matched.brokers : [],
      city: matched.city || "",
      county: matched.county || "",
      state: matched.state || "",
      space_type: matched.space_type || "",
      priority: matched.priority || "",
      specificity: matched._specificity || 7,
    },
  };
}

export function buildOfficeFinderPayload(lead, env) {
  const spaceType = lead.requested_space_type || lead.space_type;
  const sqFt = normalizeSqFtForOfficeFinder(lead.space_needed);
  const phone = normalizePhoneForOfficeFinder(lead.phone);

  const comments = [
    lead.requirements,
    lead.space_needed && `Raw submitted size: ${lead.space_needed}`,
    spaceType && `Requested/page space type: ${spaceType}`,
    lead.page_type && `Page type: ${lead.page_type}`,
    lead.source && `Source: ${lead.source}`,
  ].filter(Boolean).join("\n");

  return {
    Referrer: "MM2",
    MarketName: getMarketName(lead),
    MarketState: normalizeField(lead.state),
    MarketCountry: "USA",
    NotListed: getMarketName(lead),
    Name: normalizeField(lead.name),
    Email: normalizeField(lead.email),
    Phone: phone,
    CompanyName: normalizeField(lead.company),
    SqFt: sqFt,
    FinanceOption: getFinanceOption(spaceType),
    PrefLeaseTerm: "2",
    Comments: comments,
    rofo_source: normalizeField(lead.rofo_source || lead.page_url),
  };
}

export function getMissingOfficeFinderFields(payload) {
  const missing = [];
  for (const field of ["Referrer", "MarketName", "MarketState", "MarketCountry", "NotListed", "Name", "Email", "Phone", "SqFt", "FinanceOption", "PrefLeaseTerm"]) {
    if (!payload[field]) missing.push(field);
  }
  if (payload.Phone && !/^\d{3}-\d{3}-\d{4}$/.test(payload.Phone)) missing.push("Phone format");
  if (payload.SqFt && !/^\d+$/.test(payload.SqFt)) missing.push("SqFt numeric");
  if (payload.FinanceOption !== "leasing") missing.push("FinanceOption leasing");
  if (String(payload.PrefLeaseTerm) !== "2") missing.push("PrefLeaseTerm 2");
  return missing;
}

export function randomHex(bytes = 16) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return [...array].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getStorage(env) {
  if (env.LEADS_DB) return "d1";
  if (env.LEADS_KV) return "kv";
  return "";
}

export async function saveLead(env, record) {
  const storage = getStorage(env);
  const now = new Date().toISOString();

  if (storage === "d1") {
    await env.LEADS_DB.prepare(
      `insert into leads (
        id, token_hash, status, lead_json, officefinder_json, created_at, updated_at
      ) values (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      record.id,
      record.token_hash,
      record.status,
      JSON.stringify(record.lead),
      JSON.stringify(record.officefinder_payload),
      now,
      now
    ).run();
    return storage;
  }

  if (storage === "kv") {
    await env.LEADS_KV.put(`lead:${record.id}`, JSON.stringify({
      ...record,
      created_at: now,
      updated_at: now,
    }));
    return storage;
  }

  throw new Error("Missing lead storage binding. Configure LEADS_DB D1 or LEADS_KV KV.");
}

export async function getLead(env, id) {
  const storage = getStorage(env);
  if (storage === "d1") {
    const row = await env.LEADS_DB.prepare("select * from leads where id = ?").bind(id).first();
    if (!row) return null;
    return {
      storage,
      id: row.id,
      token_hash: row.token_hash,
      status: row.status,
      lead: JSON.parse(row.lead_json || "{}"),
      officefinder_payload: JSON.parse(row.officefinder_json || "{}"),
      officefinder_response: row.officefinder_response,
      approval_error: row.approval_error,
      created_at: row.created_at,
      updated_at: row.updated_at,
      sent_at: row.sent_at,
      rejected_at: row.rejected_at,
    };
  }

  if (storage === "kv") {
    const record = await env.LEADS_KV.get(`lead:${id}`, "json");
    return record ? { ...record, storage } : null;
  }

  throw new Error("Missing lead storage binding. Configure LEADS_DB D1 or LEADS_KV KV.");
}

export async function updateLeadStatus(env, id, values) {
  const storage = getStorage(env);
  const now = new Date().toISOString();

  if (storage === "d1") {
    const current = await getLead(env, id);
    const leadJson = values.lead ? JSON.stringify(values.lead) : JSON.stringify(current.lead || {});
    const officeFinderJson = values.officefinder_payload ? JSON.stringify(values.officefinder_payload) : JSON.stringify(current.officefinder_payload || {});
    await env.LEADS_DB.prepare(
      `update leads set
        status = ?,
        lead_json = ?,
        officefinder_json = ?,
        officefinder_response = ?,
        approval_error = ?,
        updated_at = ?,
        sent_at = ?,
        rejected_at = ?
      where id = ?`
    ).bind(
      values.status || current.status,
      leadJson,
      officeFinderJson,
      values.officefinder_response || current.officefinder_response || "",
      values.approval_error || current.approval_error || "",
      now,
      values.sent_at || current.sent_at || "",
      values.rejected_at || current.rejected_at || "",
      id
    ).run();
    return;
  }

  if (storage === "kv") {
    const current = await getLead(env, id);
    await env.LEADS_KV.put(`lead:${id}`, JSON.stringify({
      ...current,
      ...values,
      updated_at: now,
    }));
    return;
  }

  throw new Error("Missing lead storage binding. Configure LEADS_DB D1 or LEADS_KV KV.");
}

export async function appendOfficeFinderAttempt(env, record, attempt) {
  const lead = {
    ...(record.lead || {}),
    officefinder_status: attempt.success ? "officefinder_sent" : "officefinder_failed",
    officefinder_attempts: [
      ...((record.lead && record.lead.officefinder_attempts) || []),
      attempt,
    ],
  };

  await updateLeadStatus(env, record.id, {
    lead,
    officefinder_response: JSON.stringify(attempt),
    approval_error: attempt.success ? "" : attempt.error || `OfficeFinder returned HTTP ${attempt.response_status || ""}`,
  });

  return lead;
}

export async function verifyLeadToken(record, token) {
  if (!record || !token) return false;
  return record.token_hash === await sha256(token);
}

function getBaseUrl(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function formatRouteLabel(routeTo) {
  const normalized = normalizeField(routeTo).toLowerCase();
  if (normalized === "both") return "Both";
  if (normalized === "broker") return "Broker";
  return "OfficeFinder";
}

function formatSubmittedDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return normalizeField(value);
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  });
}

function getLeadMarket(lead) {
  return normalizeField(lead.market || [lead.city, lead.state].filter(Boolean).join(", ") || lead.city);
}

function buildEmailField(label, value) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:8px 0;color:#64748b;font-size:13px;line-height:18px;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#0f172a;font-size:14px;line-height:20px;font-weight:600;vertical-align:top;">${value}</td>
    </tr>
  `;
}

function buildEmailButton(label, url, background, color = "#ffffff", border = "none") {
  return `
    <a href="${escapeHtml(url)}" style="display:block;width:100%;box-sizing:border-box;margin:0 0 10px 0;padding:15px 18px;border-radius:8px;background:${background};border:${border};color:${color};font-size:15px;line-height:20px;font-weight:700;text-align:center;text-decoration:none;">
      ${escapeHtml(label)}
    </a>
  `;
}

function getApprovalActions(route, urls) {
  const routeTo = normalizeField(route.route_to || "officefinder").toLowerCase();
  const brokerAvailable = Boolean(route.broker_email);

  if (routeTo === "both" && brokerAvailable) {
    return [
      { label: "Approve & Send to Both", url: urls.approve, background: "#14532d" },
      { label: "Send to OfficeFinder Only", url: urls.approveOfficeFinder, background: "#1d4ed8" },
      { label: "Send to Broker Only", url: urls.approveBroker, background: "#334155" },
    ];
  }

  if (routeTo === "broker" && brokerAvailable) {
    return [
      { label: "Approve & Send to Broker", url: urls.approveBroker, background: "#14532d" },
    ];
  }

  if (brokerAvailable) {
    return [
      { label: "Approve & Send to OfficeFinder", url: urls.approveOfficeFinder, background: "#14532d" },
      { label: "Send to Broker Instead", url: urls.approveBroker, background: "#334155" },
    ];
  }

  return [
    { label: "Approve & Send to OfficeFinder", url: urls.approveOfficeFinder, background: "#14532d" },
  ];
}

export function detectPossibleSpam(lead) {
  const reasons = [];
  const requirements = normalizeField(lead.requirements);
  const lowerRequirements = requirements.toLowerCase();
  const urlMatches = requirements.match(/https?:\/\/|www\./gi) || [];
  const cyrillicChars = requirements.match(/[\u0400-\u04FF]/g) || [];
  const letterChars = requirements.match(/[A-Za-z\u0400-\u04FF]/g) || [];
  const repeatedPattern = /(.)\1{5,}/;
  const name = normalizeField(lead.name);
  const market = normalizeField(lead.market || lead.city);

  if (/<a\s/i.test(requirements) || lowerRequirements.includes("href=")) {
    reasons.push("Contains HTML-like link markup");
  }

  if (urlMatches.length > 1) {
    reasons.push("Contains multiple URLs in requirements");
  } else if (urlMatches.length === 1) {
    reasons.push("Contains URL in requirements");
  }

  if (requirements.length > 500) {
    reasons.push("Very long requirements text");
  }

  if (letterChars.length >= 20 && cyrillicChars.length / letterChars.length > 0.35) {
    reasons.push("Contains mostly non-English or Cyrillic text");
  }

  if ((name && repeatedPattern.test(name)) || (market && repeatedPattern.test(market))) {
    reasons.push("Name or market appears nonsensical");
  }

  return {
    isPossibleSpam: reasons.length > 0,
    reasons,
  };
}

function buildApprovalEmailHtml(record, urls, officeFinderMissing) {
  const lead = record.lead;
  const route = lead.route_recommendation || {};
  const market = getLeadMarket(lead);
  const spaceType = lead.effective_space_type || lead.space_type || "space";
  const submitted = formatSubmittedDate(lead.timestamp);
  const spam = detectPossibleSpam(lead);
  const actions = getApprovalActions(route, urls);
  const requiredStatus = officeFinderMissing.length
    ? `<span style="color:#b45309;font-weight:700;">Missing: ${escapeHtml(officeFinderMissing.join(", "))}</span>`
    : `<span style="color:#047857;font-weight:700;">Complete</span>`;
  const requirements = lead.requirements || "(none provided)";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;">
      ${escapeHtml(market)} - ${escapeHtml(spaceType)} - ${escapeHtml(lead.space_needed || "")}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f4f7fb;margin:0;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;margin:0 auto;">
            <tr>
              <td style="padding:22px 22px 18px;background:#0f172a;border-radius:14px 14px 0 0;color:#ffffff;">
                <div style="font-size:12px;line-height:16px;text-transform:uppercase;letter-spacing:.08em;color:#93c5fd;font-weight:700;">Rofo lead approval</div>
                <h1 style="margin:8px 0 8px;font-size:26px;line-height:32px;font-weight:800;">New Rofo lead</h1>
                <div style="font-size:15px;line-height:22px;color:#dbeafe;">${escapeHtml(market)} &bull; ${escapeHtml(spaceType)} &bull; ${escapeHtml(lead.space_needed || "Size not provided")}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 18px 24px;background:#ffffff;border-radius:0 0 14px 14px;">
                <div style="border:1px solid #dbe5f2;border-radius:12px;padding:16px;margin-bottom:14px;background:#f8fafc;">
                  <h2 style="margin:0 0 10px;font-size:17px;line-height:23px;">Status and routing</h2>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    ${buildEmailField("Recommended route", escapeHtml(formatRouteLabel(route.route_to)))}
                    ${buildEmailField("Matched rule", escapeHtml(route.route_id || "default"))}
                    ${buildEmailField("Reason", escapeHtml(route.route_reason || ""))}
                    ${buildEmailField("OfficeFinder fields", requiredStatus)}
                    ${route.broker_email ? buildEmailField("Broker", `${escapeHtml(route.broker_name || "Broker")} &lt;${escapeHtml(route.broker_email)}&gt;`) : ""}
                  </table>
                </div>

                ${spam.isPossibleSpam ? `
                <div style="border:1px solid #f59e0b;border-radius:12px;padding:14px;margin-bottom:14px;background:#fffbeb;color:#92400e;font-size:14px;line-height:20px;">
                  <h2 style="margin:0 0 8px;font-size:16px;line-height:22px;color:#92400e;">Possible spam submission</h2>
                  <ul style="margin:0;padding-left:18px;">
                    ${spam.reasons.map((reason) => `<li style="margin:0 0 4px;">${escapeHtml(reason)}</li>`).join("")}
                  </ul>
                </div>` : ""}

                ${officeFinderMissing.length ? `
                <div style="border:1px solid #f59e0b;border-radius:12px;padding:14px;margin-bottom:14px;background:#fffbeb;color:#92400e;font-size:14px;line-height:20px;">
                  OfficeFinder approval will fail until these fields are present: <strong>${escapeHtml(officeFinderMissing.join(", "))}</strong>.
                </div>` : ""}

                <div style="border:1px solid #dbe5f2;border-radius:12px;padding:16px;margin-bottom:14px;background:#ffffff;">
                  <h2 style="margin:0 0 10px;font-size:17px;line-height:23px;">Contact</h2>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    ${buildEmailField("Name", escapeHtml(lead.name))}
                    ${buildEmailField("Email", `<a href="mailto:${escapeHtml(lead.email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(lead.email)}</a>`)}
                    ${buildEmailField("Phone", `<a href="tel:${escapeHtml(lead.phone)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(lead.phone)}</a>`)}
                    ${lead.company ? buildEmailField("Company", escapeHtml(lead.company)) : ""}
                  </table>
                </div>

                <div style="border:1px solid #dbe5f2;border-radius:12px;padding:16px;margin-bottom:14px;background:#ffffff;">
                  <h2 style="margin:0 0 10px;font-size:17px;line-height:23px;">Lead details</h2>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    ${buildEmailField("Market", escapeHtml(market))}
                    ${buildEmailField("State", escapeHtml(lead.state))}
                    ${buildEmailField("Space type", escapeHtml(spaceType))}
                    ${buildEmailField("Space needed", escapeHtml(lead.space_needed))}
                    ${buildEmailField("Page type", escapeHtml(lead.page_type))}
                    ${buildEmailField("Source", escapeHtml(lead.source))}
                    ${buildEmailField("Submitted", escapeHtml(submitted))}
                    ${lead.page_url ? buildEmailField("Page URL", `<a href="${escapeHtml(lead.page_url)}" style="color:#2563eb;text-decoration:none;">View source page</a>`) : ""}
                  </table>
                </div>

                <div style="border:1px solid #dbe5f2;border-radius:12px;padding:16px;margin-bottom:18px;background:#ffffff;">
                  <h2 style="margin:0 0 10px;font-size:17px;line-height:23px;">Requirements</h2>
                  <div style="white-space:pre-wrap;word-break:break-word;color:#0f172a;font-size:14px;line-height:21px;background:#f8fafc;border-radius:8px;padding:12px;">${escapeHtml(requirements)}</div>
                </div>

                <div style="border:1px solid #dbe5f2;border-radius:12px;padding:16px;margin-bottom:14px;background:#f8fafc;">
                  <h2 style="margin:0 0 12px;font-size:17px;line-height:23px;">Actions</h2>
                  ${actions.map((action) => buildEmailButton(action.label, action.url, action.background, action.color, action.border)).join("")}
                  ${buildEmailButton("Reject Lead", urls.reject, "#ffffff", "#b91c1c", "1px solid #dc2626")}
                </div>

                <div style="padding:4px 2px;color:#64748b;font-size:12px;line-height:18px;">
                  Lead ID: ${escapeHtml(record.id)}<br>
                  Manual approval required before this lead is sent.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildApprovalEmailText(record, urls, officeFinderMissing) {
  const lead = record.lead;
  const route = lead.route_recommendation || {};
  const market = getLeadMarket(lead);
  const spaceType = lead.effective_space_type || lead.space_type || "space";
  const spam = detectPossibleSpam(lead);
  const actions = getApprovalActions(route, urls);

  return [
    "NEW ROFO LEAD",
    `${market} - ${spaceType} - ${lead.space_needed || "Size not provided"}`,
    "",
    "STATUS AND ROUTING",
    `Recommended route: ${formatRouteLabel(route.route_to)}`,
    `Matched rule: ${route.route_id || "default"}`,
    `Reason: ${route.route_reason || ""}`,
    officeFinderMissing.length ? `OfficeFinder fields missing: ${officeFinderMissing.join(", ")}` : "OfficeFinder fields: complete",
    route.broker_email ? `Broker: ${route.broker_name || "Broker"} <${route.broker_email}>` : "",
    "",
    `POSSIBLE SPAM: ${spam.isPossibleSpam ? "yes" : "no"}`,
    spam.isPossibleSpam ? "Reasons:" : "",
    ...spam.reasons.map((reason) => `- ${reason}`),
    "",
    "CONTACT",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "(missing)"}`,
    lead.company ? `Company: ${lead.company}` : "",
    "",
    "LEAD DETAILS",
    `Market: ${market}`,
    `State: ${lead.state || ""}`,
    `Space type: ${spaceType}`,
    `Space needed: ${lead.space_needed || ""}`,
    `Page type: ${lead.page_type || ""}`,
    `Source: ${lead.source || ""}`,
    `Submitted: ${formatSubmittedDate(lead.timestamp) || lead.timestamp || ""}`,
    `Page URL: ${lead.page_url || ""}`,
    "",
    "REQUIREMENTS",
    lead.requirements || "(none provided)",
    "",
    "ACTIONS",
    ...actions.map((action) => `${action.label}: ${action.url}`),
    `Reject lead: ${urls.reject}`,
    "",
    `Lead ID: ${record.id}`,
    "Manual approval required before this lead is sent.",
  ].filter((line) => line !== "").join("\n");
}

export async function sendApprovalEmail(env, request, record, token) {
  if (!env.RESEND_API_KEY || !env.LEAD_NOTIFY_EMAIL) {
    return { sent: false, reason: "RESEND_API_KEY and LEAD_NOTIFY_EMAIL are not configured" };
  }

  const baseUrl = getBaseUrl(request);
  const approveUrl = `${baseUrl}/api/leads/approve?id=${encodeURIComponent(record.id)}&token=${encodeURIComponent(token)}&route=recommended`;
  const approveOfficeFinderUrl = `${baseUrl}/api/leads/approve?id=${encodeURIComponent(record.id)}&token=${encodeURIComponent(token)}&route=officefinder`;
  const approveBrokerUrl = `${baseUrl}/api/leads/approve?id=${encodeURIComponent(record.id)}&token=${encodeURIComponent(token)}&route=broker`;
  const rejectUrl = `${baseUrl}/api/leads/reject?id=${encodeURIComponent(record.id)}&token=${encodeURIComponent(token)}`;
  const lead = record.lead;
  const officeFinderMissing = getMissingOfficeFinderFields(record.officefinder_payload);
  const urls = {
    approve: approveUrl,
    approveOfficeFinder: approveOfficeFinderUrl,
    approveBroker: approveBrokerUrl,
    reject: rejectUrl,
  };
  const subject = `New Rofo lead pending approval: ${getLeadMarket(lead) || "Unknown market"} - ${lead.effective_space_type || lead.space_type || "space"}`;
  const text = buildApprovalEmailText(record, urls, officeFinderMissing);
  const html = buildApprovalEmailHtml(record, urls, officeFinderMissing);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL || "Rofo Leads <onboarding@resend.dev>",
      to: [env.LEAD_NOTIFY_EMAIL],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    return { sent: false, reason: await response.text() };
  }

  return { sent: true };
}

export async function sendBrokerLeadEmail(env, record) {
  const route = record.lead.route_recommendation || {};
  if (!route.broker_email) {
    return { sent: false, reason: "No broker email is available for this route" };
  }

  if (!env.RESEND_API_KEY) {
    return { sent: false, reason: "RESEND_API_KEY is not configured" };
  }

  const lead = record.lead;
  const subject = `Rofo lead: ${lead.city || lead.market || "Unknown market"}, ${lead.state || ""} - ${lead.effective_space_type || lead.space_type || "space"}`;
  const text = [
    subject,
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    `Company: ${lead.company || ""}`,
    `Market: ${lead.market || lead.city || ""}`,
    `County: ${lead.routing_county || lead.county || ""}`,
    `State: ${lead.state || ""}`,
    `Space type: ${lead.effective_space_type || lead.space_type || ""}`,
    `Space needed: ${lead.space_needed || ""}`,
    `Requirements: ${lead.requirements || ""}`,
    `Page type: ${lead.page_type || ""}`,
    `Page URL: ${lead.page_url || ""}`,
    `Source: ${lead.source || ""}`,
    "",
    "This lead was manually approved by Rofo before routing.",
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL || "Rofo Leads <onboarding@resend.dev>",
      to: [route.broker_email],
      subject,
      text,
    }),
  });

  if (!response.ok) {
    return { sent: false, reason: await response.text() };
  }

  return { sent: true };
}

export async function logLeadToGoogleSheets(env, record) {
  if (!env.GOOGLE_LEADS_WEBHOOK_URL) return { sent: false, reason: "GOOGLE_LEADS_WEBHOOK_URL is not configured" };

  const lead = record.lead;
  const route = lead.route_recommendation || {};
  const payload = {
    id: record.id,
    status: record.status,
    route_recommendation: route,
    city: lead.city,
    county: lead.routing_county || lead.county,
    state: lead.state,
    space_type: lead.effective_space_type || lead.requested_space_type || lead.space_type,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    source: lead.source,
    page_url: lead.page_url,
    created_at: lead.timestamp,
  };

  try {
    const response = await fetch(env.GOOGLE_LEADS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { sent: false, reason: await response.text() };
    }

    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error.message };
  }
}

export async function submitToOfficeFinder(env, payload) {
  const endpoint = normalizeField(env.OFFICEFINDER_API_URL) || OFFICEFINDER_PRODUCTION_ENDPOINT;
  const form = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => form.set(key, value || ""));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    const body = await response.text();

    return {
      endpoint,
      status: response.status,
      ok: response.ok,
      body,
      error: response.ok ? "" : `OfficeFinder returned HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      endpoint,
      status: 0,
      ok: false,
      body: "",
      error: error.message,
    };
  }
}

export async function readSubmittedFields(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await request.json();
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}
