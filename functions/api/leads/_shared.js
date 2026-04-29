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
    .replace(/"/g, "&quot;");
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

function getFinanceOption(spaceType) {
  const slug = normalizeSpaceType(spaceType);
  if (slug.includes("coworking")) return "ExecSuites";
  if (slug.includes("retail")) return "Retail";
  if (slug.includes("industrial")) return "Industrial";
  if (slug.includes("flex")) return "MixedUse";
  return "leasing";
}

function parseSqFt(spaceNeeded) {
  const raw = normalizeField(spaceNeeded).toLowerCase();
  if (!raw || raw.includes("not sure")) return "";
  const numbers = raw.match(/\d[\d,]*/g);
  if (!numbers || !numbers.length) return "";
  const parsed = numbers.map((number) => Number(number.replace(/,/g, ""))).filter(Boolean);
  if (!parsed.length) return "";
  if (raw.includes("under")) return String(parsed[0]);
  if (raw.includes("+")) return String(parsed[0]);
  return String(parsed[parsed.length - 1]);
}

function getMarketName(lead) {
  return normalizeField(lead.city || lead.market || lead.location);
}

export function buildLeadPayload(formFields, request) {
  const now = new Date().toISOString();
  const spaceType = normalizeField(formFields.requested_space_type || formFields.space_type);
  const market = normalizeField(formFields.market || formFields.location || [formFields.city, formFields.state].filter(Boolean).join(", "));

  return {
    name: normalizeField(formFields.name),
    email: normalizeField(formFields.email),
    phone: normalizeField(formFields.phone),
    company: normalizeField(formFields.company || formFields.CompanyName),
    city: normalizeField(formFields.city),
    state: normalizeField(formFields.state),
    market,
    space_type: normalizeField(formFields.space_type),
    requested_space_type: normalizeField(formFields.requested_space_type),
    space_needed: normalizeField(formFields.space_needed || formFields.size),
    requirements: normalizeField(formFields.requirements || formFields.message || formFields.notes),
    page_type: normalizeField(formFields.page_type),
    page_url: normalizeField(formFields.page_url),
    source: normalizeField(formFields.source || "rofo"),
    timestamp: now,
    status: "pending",
    user_agent: normalizeField(request.headers.get("user-agent")),
    ip_country: normalizeField(request.cf && request.cf.country),
    effective_space_type: spaceType,
  };
}

export function getMissingSubmitFields(lead) {
  const missing = [];
  if (!lead.name) missing.push("name");
  if (!lead.email) missing.push("email");
  if (!lead.market && !lead.city) missing.push("market");
  return missing;
}

export function buildOfficeFinderPayload(lead, env) {
  const spaceType = lead.requested_space_type || lead.space_type;
  const sqFt = parseSqFt(lead.space_needed);
  const workStations = normalizeField(lead.workstations || lead.work_stations);
  const referrer = normalizeField(env.OFFICEFINDER_REFERRER_CODE || "MM2");
  const referrerPct = normalizeField(env.OFFICEFINDER_REFERRER_PCT || "75");

  const comments = [
    lead.requirements && `Requirements: ${lead.requirements}`,
    lead.page_url && `Page URL: ${lead.page_url}`,
    lead.page_type && `Page type: ${lead.page_type}`,
    lead.source && `Source: ${lead.source}`,
    spaceType && `Requested/page space type: ${spaceType}`,
    lead.space_needed && `Raw submitted size: ${lead.space_needed}`,
  ].filter(Boolean).join("\n");

  return {
    Referrer: referrer,
    ReferrerPct: referrerPct,
    MarketName: getMarketName(lead),
    MarketState: normalizeField(lead.state),
    Name: normalizeField(lead.name),
    Email: normalizeField(lead.email),
    Phone: normalizeField(lead.phone),
    CompanyName: normalizeField(lead.company),
    SqFt: sqFt,
    WorkStations: workStations,
    FinanceOption: getFinanceOption(spaceType),
    PrefLeaseTerm: normalizeField(lead.pref_lease_term || lead.lease_term || "2"),
    Comments: comments,
  };
}

export function getMissingOfficeFinderFields(payload) {
  const missing = [];
  for (const field of ["Referrer", "MarketName", "Name", "Email", "Phone", "FinanceOption", "PrefLeaseTerm"]) {
    if (!payload[field]) missing.push(field);
  }
  if (!payload.SqFt && !payload.WorkStations) missing.push("SqFt or WorkStations");
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

export async function verifyLeadToken(record, token) {
  if (!record || !token) return false;
  return record.token_hash === await sha256(token);
}

function getBaseUrl(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function sendApprovalEmail(env, request, record, token) {
  if (!env.RESEND_API_KEY || !env.LEAD_NOTIFY_EMAIL) {
    return { sent: false, reason: "RESEND_API_KEY and LEAD_NOTIFY_EMAIL are not configured" };
  }

  const baseUrl = getBaseUrl(request);
  const approveUrl = `${baseUrl}/api/leads/approve?id=${encodeURIComponent(record.id)}&token=${encodeURIComponent(token)}`;
  const rejectUrl = `${baseUrl}/api/leads/reject?id=${encodeURIComponent(record.id)}&token=${encodeURIComponent(token)}`;
  const lead = record.lead;
  const officeFinderMissing = getMissingOfficeFinderFields(record.officefinder_payload);

  const subject = `New Rofo lead pending approval: ${lead.city || lead.market || "Unknown market"}, ${lead.state || ""} - ${lead.effective_space_type || lead.space_type || "space"}`;
  const text = [
    subject,
    "",
    `Lead ID: ${record.id}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "(missing)"}`,
    `Company: ${lead.company || ""}`,
    `Market: ${lead.market || lead.city || ""}`,
    `State: ${lead.state || ""}`,
    `Space type: ${lead.effective_space_type || lead.space_type || ""}`,
    `Space needed: ${lead.space_needed || ""}`,
    `Requirements: ${lead.requirements || ""}`,
    `Page type: ${lead.page_type || ""}`,
    `Page URL: ${lead.page_url || ""}`,
    `Source: ${lead.source || ""}`,
    `Submitted: ${lead.timestamp || ""}`,
    "",
    officeFinderMissing.length ? `OfficeFinder missing fields: ${officeFinderMissing.join(", ")}` : "OfficeFinder required fields: complete",
    "",
    `Approve: ${approveUrl}`,
    `Reject: ${rejectUrl}`,
  ].join("\n");

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
      text,
    }),
  });

  if (!response.ok) {
    return { sent: false, reason: await response.text() };
  }

  return { sent: true };
}

export async function submitToOfficeFinder(env, payload) {
  const testMode = String(env.OFFICEFINDER_TEST_MODE || "true").toLowerCase() !== "false";
  const endpoint = testMode ? OFFICEFINDER_TEST_ENDPOINT : OFFICEFINDER_PRODUCTION_ENDPOINT;
  const form = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => form.set(key, value || ""));

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  return {
    endpoint,
    status: response.status,
    ok: response.ok,
    body: await response.text(),
  };
}

export async function readSubmittedFields(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await request.json();
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}
