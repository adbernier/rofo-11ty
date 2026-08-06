import leadRoutes from "../../../_data/leadRoutes.json";
import {
  buildProjectSnapshotFromLead,
  locationBriefReferenceText,
  projectSnapshotTextLines,
} from "../../_shared/project-snapshot.js";

export const OFFICEFINDER_TEST_ENDPOINT = "https://www.officefinder.com/scripts/_importLeadTest.cfm";
export const OFFICEFINDER_PRODUCTION_ENDPOINT = "https://www.officefinder.com/scripts/_importLead.cfm";
const OFFICEFINDER_LOCATION_PROFILE_PLACEHOLDER_PHONE = "555-555-5555";

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
  const normalized = normalizeSpaceType(spaceType);
  if (!normalized || normalized.includes("not-sure")) return "leasing";
  if (normalized.includes("medical")) return "Medical";
  if (normalized.includes("coworking") || normalized.includes("executive-suite")) return "ExecSuites";
  if (normalized.includes("retail")) return "Retail";
  if (normalized.includes("industrial") || normalized.includes("warehouse")) return "Industrial";
  if (normalized.includes("flex")) return "leasing";
  if (normalized.includes("office")) return "leasing";
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

function isLocationBriefLead(lead) {
  const leadType = normalizeField(lead && lead.lead_type);
  return leadType === "location_brief" || leadType === "live_market_investigation" || normalizeField(lead && lead.source) === "location_brief";
}

export function buildLeadPayload(formFields, request) {
  const now = new Date().toISOString();
  const spaceType = normalizeField(formFields.requested_space_type || formFields.space_type);
  const market = normalizeField(formFields.market || formFields.location || [formFields.city, formFields.state].filter(Boolean).join(", "));
  const state = normalizeState(formFields.state);
  const leadType = normalizeField(formFields.lead_type);

  return {
    lead_type: leadType,
    profile_version: normalizeField(formFields.profile_version),
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
    move_timing: normalizeField(formFields.timing || formFields.move_timing),
    requirements: normalizeField(formFields.requirements || formFields.message || formFields.notes),
    page_type: normalizeField(formFields.page_type),
    page_url: normalizeField(formFields.page_url),
    page_title: normalizeField(formFields.page_title),
    rofo_source: normalizeField(formFields.rofo_source || formFields.page_url),
    landing_page: normalizeField(formFields.landing_page),
    referring_page: normalizeField(formFields.referring_page),
    entry_page_type: normalizeField(formFields.entry_page_type),
    entry_district: normalizeField(formFields.entry_district),
    entry_city: normalizeField(formFields.entry_city),
    entry_comparison: normalizeField(formFields.entry_comparison),
    entry_ecosystem: normalizeField(formFields.entry_ecosystem),
    business_ecosystem: normalizeField(formFields.business_ecosystem),
    final_page_before_search_profile: normalizeField(formFields.final_page_before_search_profile),
    search_profile_started_page: normalizeField(formFields.search_profile_started_page),
    search_profile_submitted_page: normalizeField(formFields.search_profile_submitted_page),
    search_profile_pages_viewed: normalizeField(formFields.search_profile_pages_viewed),
    search_profile_pages_viewed_before_start: normalizeField(formFields.search_profile_pages_viewed_before_start),
    search_profile_comparison_pages_viewed: normalizeField(formFields.search_profile_comparison_pages_viewed),
    search_profile_district_pages_viewed: normalizeField(formFields.search_profile_district_pages_viewed),
    search_profile_building_pages_viewed: normalizeField(formFields.search_profile_building_pages_viewed),
    search_profile_duration_ms: normalizeField(formFields.search_profile_duration_ms),
    neighborhood_name: normalizeField(formFields.neighborhood_name),
    neighborhood_slug: normalizeRouteValue(formFields.neighborhood_slug),
    neighborhood_path: normalizeField(formFields.neighborhood_path),
    commercial_area_id: normalizeField(formFields.commercial_area_id),
    commercial_area_type: normalizeField(formFields.commercial_area_type),
    source: normalizeField(formFields.source || "rofo"),
    location_display: normalizeField(formFields.location_display),
    location_city: normalizeField(formFields.location_city),
    location_district: normalizeField(formFields.location_district),
    location_street: normalizeField(formFields.location_street),
    location_state: normalizeState(formFields.location_state),
    location_raw: normalizeField(formFields.location_raw),
    location_profile_features: normalizeField(formFields.location_profile_features),
    location_profile_feature_other: normalizeField(formFields.location_profile_feature_other),
    location_profile_json: normalizeField(formFields.location_profile_json),
    location_decision_selected_district: normalizeField(formFields.location_decision_selected_district),
    location_decision_primary_archetype: normalizeField(formFields.location_decision_primary_archetype),
    location_decision_compared_districts: normalizeField(formFields.location_decision_compared_districts),
    location_decision_business_use_case: normalizeField(formFields.location_decision_business_use_case),
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
  if (lead.lead_type !== "location_profile" && !lead.phone) missing.push("phone");
  if (!lead.market && !lead.city) missing.push("market");
  return missing;
}

const EXPECTED_SPACE_TYPES = new Set([
  "office space",
  "retail space",
  "industrial space",
  "coworking space",
  "flex space",
  "medical office space",
  "not sure",
]);

const EXPECTED_SPACE_NEEDED = new Set([
  "under 1,000 sqft",
  "under 1000 sqft",
  "1,000–2,500 sqft",
  "1,000-2,500 sqft",
  "1000–2500 sqft",
  "1000-2500 sqft",
  "2,500–5,000 sqft",
  "2,500-5,000 sqft",
  "2500–5000 sqft",
  "2500-5000 sqft",
  "5,000–10,000 sqft",
  "5,000-10,000 sqft",
  "5000–10000 sqft",
  "5000-10000 sqft",
  "10,000+ sqft",
  "10000+ sqft",
  "not sure",
]);

const DISPOSABLE_OR_TEST_EMAIL_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "fakeinbox.com",
]);

const SPAM_KEYWORDS = [
  "casino",
  "crypto",
  "viagra",
  "payday loan",
  "loan offer",
  "backlink",
  "seo service",
  "guest post",
  "link building",
  "rank higher",
];

function normalizeChoice(value) {
  return normalizeField(value).toLowerCase().replace(/\s+/g, " ");
}

function isNumericOnly(value) {
  return /^\d+$/.test(normalizeField(value));
}

function isBadDropdownValue(value, expectedValues) {
  const normalized = normalizeChoice(value);
  if (!normalized) return false;
  if (["0", "1", "test"].includes(normalized) || isNumericOnly(normalized)) return true;
  return expectedValues && !expectedValues.has(normalized);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeField(value));
}

function getEmailDomain(value) {
  const email = normalizeField(value).toLowerCase();
  const parts = email.split("@");
  return parts.length === 2 ? parts[1] : "";
}

function getPhoneDigits(value) {
  let digits = normalizeField(value).replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits;
}

function isFakePhone(value) {
  const digits = getPhoneDigits(value);
  if (digits.length < 10) return true;
  if (/^(\d)\1{9}$/.test(digits)) return true;
  if (["1234567890", "0123456789", "5555555555", "0000000000"].includes(digits)) return true;
  return false;
}

function looksLikeGibberishName(value) {
  const compact = normalizeField(value).replace(/[^a-z]/gi, "");
  if (compact.length < 7) return false;
  const vowels = compact.match(/[aeiou]/gi) || [];
  const consonants = compact.match(/[bcdfghjklmnpqrstvwxyz]/gi) || [];
  if (vowels.length === 0) return true;
  return consonants.length / compact.length > 0.82;
}

function hasLinkPattern(value) {
  return /https?:\/\/|www\.|href\s*=|<a\s|\[url[=\]]/i.test(normalizeField(value));
}

function getDomainMatches(value) {
  return normalizeField(value).match(/\b(?:[a-z0-9-]+\.)+(?:com|net|org|io|co|biz|info|ru|cn|xyz)\b/gi) || [];
}

function addSpamSignal(signals, score, reason) {
  signals.score += score;
  signals.reasons.push(reason);
}

export function detectLeadSpam(lead, rawFormFields = {}) {
  const signals = { score: 0, reasons: [] };
  const isLocationProfile = normalizeField(rawFormFields.lead_type || lead.lead_type) === "location_profile";
  const visibleValues = [
    lead.name,
    lead.email,
    lead.phone,
    lead.company,
    lead.market,
    lead.city,
    lead.requested_space_type,
    lead.space_needed,
    lead.requirements,
  ].filter(Boolean);
  const requirements = normalizeField(lead.requirements);
  const submittedSpaceType = normalizeField(lead.requested_space_type || rawFormFields.requested_space_type || rawFormFields.space_type || lead.space_type);
  const submittedSize = normalizeField(lead.space_needed || rawFormFields.space_needed || rawFormFields.size);

  if (normalizeField(rawFormFields._gotcha) || normalizeField(rawFormFields.company_website)) {
    addSpamSignal(signals, 100, "Honeypot field was filled");
  }

  if (!rawFormFields.human_check) {
    addSpamSignal(signals, 50, "Human checkbox was not confirmed");
  }

  if (isBadDropdownValue(submittedSpaceType, EXPECTED_SPACE_TYPES)) {
    addSpamSignal(signals, 50, "Invalid space type dropdown value");
  }

  if (!isLocationProfile && isBadDropdownValue(submittedSize, EXPECTED_SPACE_NEEDED)) {
    addSpamSignal(signals, 50, "Invalid space size dropdown value");
  }

  if (!lead.name || normalizeField(lead.name).length < 2) {
    addSpamSignal(signals, 35, "Name is missing or too short");
  } else if (looksLikeGibberishName(lead.name)) {
    addSpamSignal(signals, 25, "Name appears random or nonsensical");
  }

  if (!lead.email || !isValidEmail(lead.email)) {
    addSpamSignal(signals, 40, "Email is missing or invalid");
  } else if (DISPOSABLE_OR_TEST_EMAIL_DOMAINS.has(getEmailDomain(lead.email))) {
    addSpamSignal(signals, 40, "Email uses test or disposable domain");
  }

  if (!lead.phone) {
    if (!isLocationProfile) {
      addSpamSignal(signals, 40, "Phone is missing, too short, or fake");
    }
  } else if (isFakePhone(lead.phone)) {
    addSpamSignal(signals, 40, "Phone is missing, too short, or fake");
  }

  if (visibleValues.some(hasLinkPattern)) {
    addSpamSignal(signals, 40, "Visible field contains a URL or link markup");
  }

  if (getDomainMatches(requirements).length > 1) {
    addSpamSignal(signals, 20, "Requirements contain multiple domains");
  }

  const lowerVisibleText = visibleValues.join(" ").toLowerCase();
  const matchedKeywords = SPAM_KEYWORDS.filter((keyword) => lowerVisibleText.includes(keyword));
  if (matchedKeywords.length >= 2) {
    addSpamSignal(signals, 30, `Multiple spam keywords: ${matchedKeywords.join(", ")}`);
  } else if (matchedKeywords.length === 1) {
    addSpamSignal(signals, 15, `Spam keyword: ${matchedKeywords[0]}`);
  }

  const start = Number(rawFormFields.form_start_time);
  const now = Date.now();
  const pageType = normalizeField(rawFormFields.page_type || lead.page_type);
  if (start && now - start < 3000) {
    addSpamSignal(signals, 30, "Submitted under 3 seconds");
  } else if (!start && ["homepage", "city", "building", "space-type", "market-guide"].includes(pageType)) {
    addSpamSignal(signals, 15, "Missing form_start_time on tenant form");
  }

  const uniqueReasons = [...new Set(signals.reasons)];
  return {
    isSpam: signals.score >= 50,
    isSuspicious: signals.score >= 25 && signals.score < 50,
    score: signals.score,
    reasons: uniqueReasons,
  };
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
  const normalizedPhone = normalizePhoneForOfficeFinder(lead.phone);
  const usesPlaceholderPhone = !normalizedPhone && (isLocationProfileLead(lead) || isLocationBriefLead(lead));
  // This placeholder is used only for OfficeFinder routing when a Location Profile or Location Brief tenant did not provide a phone.
  const phone = normalizedPhone || (usesPlaceholderPhone ? OFFICEFINDER_LOCATION_PROFILE_PLACEHOLDER_PHONE : "");
  if (usesPlaceholderPhone) {
    console.log("[officefinder-integration]", JSON.stringify({
      event: "placeholder_phone_used",
      leadId: normalizeField(lead.id),
      locationBriefPublicId: normalizeField(lead.location_brief_public_id),
      leadType: normalizeField(lead.lead_type),
    }));
  }
  const marketName = getMarketName(lead);
  const marketState = normalizeField(lead.state);
  const neighborhoodContext = normalizeField(lead.neighborhood_name)
    ? `Neighborhood/area context: ${normalizeField(lead.neighborhood_name)}${lead.city ? `, ${normalizeField(lead.city)}` : ""}.`
    : "";

  const projectSnapshot = buildProjectSnapshotFromLead(lead);
  const comments = isLocationBriefLead(lead)
    ? [
      locationBriefReferenceText({
        url: normalizeField(lead.location_brief_url),
        topDistricts: projectSnapshot.topDistricts || [],
      }),
      "",
      "Project Snapshot",
      ...projectSnapshotTextLines(projectSnapshot),
    ].filter(Boolean).join("\n")
    : [
      lead.requirements,
      neighborhoodContext,
      lead.space_needed && `Raw submitted size: ${lead.space_needed}`,
      lead.move_timing && `Timing: ${lead.move_timing}`,
      spaceType && `Requested/page space type: ${spaceType}`,
      lead.page_type && `Page type: ${lead.page_type}`,
      lead.source && `Source: ${lead.source}`,
    ].filter(Boolean).join("\n");

  const payload = {
    Referrer: "MM2",
    MarketName: marketName,
    MarketState: marketState,
    MarketCountry: "USA",
    Prospect_Status: "Actively looking for space",
    ApproveExec: "0",
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

  if (!marketName || !marketState) {
    payload.NotListed = marketName || normalizeField(lead.market || lead.location || lead.city);
  }

  return payload;
}

export function getMissingOfficeFinderFields(payload) {
  const missing = [];
  for (const field of ["Referrer", "MarketCountry", "Prospect_Status", "ApproveExec", "Name", "Email", "Phone", "SqFt", "FinanceOption", "PrefLeaseTerm"]) {
    if (!payload[field]) missing.push(field);
  }
  if ((!payload.MarketName || !payload.MarketState) && !payload.NotListed) missing.push("MarketName/MarketState or NotListed");
  if (payload.Phone && !/^\d{3}-\d{3}-\d{4}$/.test(payload.Phone)) missing.push("Phone format");
  if (payload.SqFt && !/^\d+$/.test(payload.SqFt)) missing.push("SqFt numeric");
  if (payload.FinanceOption && !["leasing", "ExecSuites", "Retail", "Industrial", "Medical"].includes(payload.FinanceOption)) missing.push("FinanceOption valid");
  if (String(payload.PrefLeaseTerm) !== "2") missing.push("PrefLeaseTerm 2");
  if (payload.Prospect_Status !== "Actively looking for space") missing.push("Prospect_Status Actively looking for space");
  if (String(payload.ApproveExec) !== "0") missing.push("ApproveExec 0");
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
  if (isLocationProfileLead(lead)) return getLocationRequirementSummary(lead).location;
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

function isLocationProfileLead(lead) {
  return normalizeField(lead.lead_type) === "location_profile";
}

function buildStateAwareLocationDisplay(lead) {
  const state = normalizeState(lead.location_state || lead.state);
  const city = normalizeField(lead.location_city || lead.city);
  const district = normalizeField(lead.location_district || lead.neighborhood_name);
  const display = normalizeField(lead.location_display);
  const cityWithState = [city, state].filter(Boolean).join(", ");

  if (cityWithState && district) return `${cityWithState} — ${district}`;
  if (cityWithState) return cityWithState;
  if (display && state && !new RegExp(`,\\s*${state}\\b`, "i").test(display)) return `${display}, ${state}`;
  return display || normalizeField(lead.market || [city, state].filter(Boolean).join(", "));
}

export function getLocationRequirementSummary(lead) {
  const location = buildStateAwareLocationDisplay(lead);
  const spaceType = normalizeField(lead.effective_space_type || lead.requested_space_type || lead.space_type);
  const size = normalizeField(lead.space_needed);
  const timing = normalizeField(lead.move_timing);
  const features = normalizeField(lead.location_profile_features);

  return {
    location,
    spaceType,
    size,
    timing,
    features,
    featureOther: normalizeField(lead.location_profile_feature_other),
    city: normalizeField(lead.location_city || lead.city),
    state: normalizeState(lead.location_state || lead.state),
    district: normalizeField(lead.location_district || lead.neighborhood_name),
    street: normalizeField(lead.location_street),
    raw: normalizeField(lead.location_raw),
  };
}

function buildLocationRequirementRows(lead) {
  const summary = getLocationRequirementSummary(lead);
  return [
    buildEmailField("Location", escapeHtml(summary.location)),
    buildEmailField("Space type", escapeHtml(summary.spaceType)),
    buildEmailField(summary.spaceType.toLowerCase().includes("office") || summary.spaceType.toLowerCase().includes("coworking") ? "Team size" : "Size", escapeHtml(summary.size)),
    summary.timing ? buildEmailField("Move-in timing", escapeHtml(summary.timing)) : "",
    summary.features ? buildEmailField("Features", escapeHtml(summary.features.replace(/,\s*/g, " • "))) : "",
    summary.featureOther ? buildEmailField("Other feature detail", escapeHtml(summary.featureOther)) : "",
    summary.street ? buildEmailField("Street / detail", escapeHtml(summary.street)) : "",
  ].filter(Boolean).join("");
}

function buildLocationRequirementSubject(lead) {
  const summary = getLocationRequirementSummary(lead);
  return `New Location Requirement: ${summary.spaceType || "Space"} • ${summary.location || "Location"} • ${summary.size || "Size not provided"}`;
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

export function getApprovalTargets(routeParam, routeRecommendation) {
  if (routeParam === "officefinder") return ["officefinder"];
  if (routeParam === "broker") return ["broker"];

  const recommended = routeRecommendation.route_to || "officefinder";
  if (recommended === "both") return ["officefinder", "broker"];
  if (recommended === "broker") return ["broker"];
  return ["officefinder"];
}

function getTenantFirstName(name) {
  const first = normalizeField(name).split(/\s+/)[0] || "";
  if (first.length < 2 || first.length > 40) return "";
  if (/@|https?:|www\./i.test(first)) return "";
  if (!/[A-Za-z]/.test(first)) return "";
  return first.replace(/[^A-Za-z'-]/g, "");
}

function getTenantConfirmationDetails(lead) {
  const city = normalizeField(lead.city || lead.market || lead.location);
  const state = normalizeState(lead.state);
  const spaceType = normalizeField(lead.effective_space_type || lead.requested_space_type || lead.space_type);
  const spaceSize = normalizeField(lead.space_needed || lead.size);
  const requirements = normalizeField(lead.requirements || lead.message || lead.notes);

  return {
    city,
    state,
    market: [city, state].filter(Boolean).join(", "),
    spaceType,
    spaceSize,
    requirements,
    hasKeyDetails: Boolean(city && state),
  };
}

function buildTenantConfirmationText(lead) {
  if (isLocationBriefLead(lead)) {
    return [
      "Hi,",
      "",
      "Thank you for requesting current availability from Rofo.",
      "",
      "Your Location Brief is here:",
      normalizeField(lead.location_brief_url) || "(Location Brief URL unavailable)",
      "",
      "What happens next:",
      "Rofo will review your request and determine the best next step. We may check current availability, comparable buildings, market activity, or appropriate broker coverage.",
      "",
      "This is not a promise of immediate broker contact.",
      "",
      "Thanks,",
      "Rofo",
    ].filter((line, index, lines) => line !== "" || lines[index - 1] !== "").join("\n");
  }

  if (isLocationProfileLead(lead)) {
    const summary = getLocationRequirementSummary(lead);
    const profileLines = [
      summary.location ? `Location: ${summary.location}` : "",
      summary.spaceType ? `Space type: ${summary.spaceType}` : "",
      summary.size ? `${summary.spaceType.toLowerCase().includes("office") || summary.spaceType.toLowerCase().includes("coworking") ? "Team size" : "Size"}: ${summary.size}` : "",
      summary.timing ? `Move-in timing: ${summary.timing}` : "",
      summary.features ? `Features: ${summary.features.replace(/,\s*/g, " • ")}` : "",
      summary.featureOther ? `Other feature detail: ${summary.featureOther}` : "",
    ].filter(Boolean);

    return [
      "Hi,",
      "",
      "Thanks — we received your location profile.",
      "",
      "We'll use it to identify matching locations, buildings, and alternatives.",
      "",
      profileLines.length ? "Location profile summary" : "",
      profileLines.length ? "" : "",
      ...profileLines,
      "",
      "No obligation. We'll only use this to follow up on your search.",
      "",
      "Thanks,",
      "Rofo",
    ].filter((line, index, lines) => line !== "" || lines[index - 1] !== "").join("\n");
  }

  const firstName = getTenantFirstName(lead.name);
  const details = getTenantConfirmationDetails(lead);
  const guideLines = [
    "While you wait, this guide may help you evaluate your options:",
    "",
    "The Ultimate Guide to Leasing Commercial Space",
    "https://www.rofo.com/commercial-real-estate/lease-guide/",
  ];

  if (!details.hasKeyDetails) {
    return [
      firstName ? `Hi ${firstName},` : "Hi,",
      "",
      "Thanks for reaching out through Rofo. We received your request for commercial space.",
      "",
      "A local commercial real estate professional will review your request and follow up shortly if there's a good fit.",
      "",
      "If anything has changed, or if you want to add more detail, you can simply reply to this email.",
      "",
      ...guideLines,
      "",
      "Thanks,",
      "Rofo",
      "Commercial real estate search guidance since 2007",
    ].join("\n");
  }

  const detailLines = [
    `Market: ${details.market}`,
    details.spaceType ? `Space type: ${details.spaceType}` : "",
    details.spaceSize ? `Approx. size: ${details.spaceSize}` : "",
    details.requirements ? `Requirements: ${details.requirements}` : "",
  ].filter(Boolean);

  return [
    firstName ? `Hi ${firstName},` : "Hi,",
    "",
    `Thanks for reaching out through Rofo. We received your request for space in ${details.market}.`,
    "",
    detailLines.length ? "Here's what we have so far:" : "",
    detailLines.length ? "" : "",
    ...detailLines,
    "",
    "A local commercial real estate professional will review your request and follow up shortly if there's a good fit.",
    "",
    "If anything has changed, or if you want to add more detail, you can simply reply to this email.",
    "",
    ...guideLines,
    "",
    "Thanks,",
    "Rofo",
    "Commercial real estate search guidance since 2007",
  ].filter((line, index, lines) => line !== "" || lines[index - 1] !== "").join("\n");
}

function buildTenantConfirmationHtml(lead) {
  if (isLocationBriefLead(lead)) {
    const briefUrl = normalizeField(lead.location_brief_url);

    return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f4f7fb;margin:0;padding:22px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px;background:#123f8c;color:#ffffff;">
                <div style="font-size:12px;line-height:16px;text-transform:uppercase;letter-spacing:.08em;color:#bfdbfe;font-weight:700;">Rofo Location Brief</div>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:30px;">Your Location Brief request was received.</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:22px;font-size:15px;line-height:23px;">
                <p style="margin:0 0 14px;">Hi,</p>
                <p style="margin:0 0 14px;">Thank you for requesting current availability from Rofo.</p>
                ${briefUrl ? `<p style="margin:0 0 18px;">Your Location Brief is here:<br><a href="${escapeHtml(briefUrl)}" style="color:#1346d8;font-weight:700;text-decoration:none;">${escapeHtml(briefUrl)}</a></p>` : ""}
                <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#f8fafc;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">What happens next</div>
                  <p style="margin:0;color:#334155;">Rofo will review your request and determine the best next step. We may check current availability, comparable buildings, market activity, or appropriate broker coverage.</p>
                </div>
                <p style="margin:0 0 18px;color:#64748b;">This is not a promise of immediate broker contact.</p>
                <p style="margin:0;">Thanks,<br>Rofo</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }

  if (isLocationProfileLead(lead)) {
    const summaryRows = buildLocationRequirementRows(lead);

    return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f4f7fb;margin:0;padding:22px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px;background:#123f8c;color:#ffffff;">
                <div style="font-size:12px;line-height:16px;text-transform:uppercase;letter-spacing:.08em;color:#bfdbfe;font-weight:700;">Rofo</div>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:30px;">Your Rofo location profile</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:22px;font-size:15px;line-height:23px;">
                <p style="margin:0 0 14px;">Hi,</p>
                <p style="margin:0 0 14px;">Thanks — we received your location profile.</p>
                <p style="margin:0 0 18px;">We'll use it to identify matching locations, buildings, and alternatives.</p>
                ${summaryRows ? `
                <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#f8fafc;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Location profile summary</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    ${summaryRows}
                  </table>
                </div>` : ""}
                <p style="margin:0 0 18px;">No obligation. We'll only use this to follow up on your search.</p>
                <p style="margin:0;">Thanks,<br>Rofo</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }

  const firstName = getTenantFirstName(lead.name);
  const details = getTenantConfirmationDetails(lead);
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";
  const intro = details.hasKeyDetails
    ? `Thanks for reaching out through Rofo. We received your request for space in ${escapeHtml(details.market)}.`
    : "Thanks for reaching out through Rofo. We received your request for commercial space.";
  const detailRows = [
    details.hasKeyDetails ? buildEmailField("Market", escapeHtml(details.market)) : "",
    details.spaceType ? buildEmailField("Space type", escapeHtml(details.spaceType)) : "",
    details.spaceSize ? buildEmailField("Approx. size", escapeHtml(details.spaceSize)) : "",
    details.requirements ? buildEmailField("Requirements", `<span style="white-space:pre-wrap;">${escapeHtml(details.requirements)}</span>`) : "",
  ].filter(Boolean).join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f4f7fb;margin:0;padding:22px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px;background:#123f8c;color:#ffffff;">
                <div style="font-size:12px;line-height:16px;text-transform:uppercase;letter-spacing:.08em;color:#bfdbfe;font-weight:700;">Rofo</div>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:30px;">We received your space request</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:22px;font-size:15px;line-height:23px;">
                <p style="margin:0 0 14px;">${greeting}</p>
                <p style="margin:0 0 16px;">${intro}</p>
                ${detailRows ? `
                <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#f8fafc;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Here's what we have so far</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    ${detailRows}
                  </table>
                </div>` : ""}
                <p style="margin:0 0 14px;">A local commercial real estate professional will review your request and follow up shortly if there's a good fit.</p>
                <p style="margin:0 0 18px;">If anything has changed, or if you want to add more detail, you can simply reply to this email.</p>
                <p style="margin:0 0 8px;color:#475569;">While you wait, this guide may help you evaluate your options:</p>
                <p style="margin:0 0 18px;"><a href="https://www.rofo.com/commercial-real-estate/lease-guide/" style="color:#1346d8;font-weight:700;text-decoration:none;">The Ultimate Guide to Leasing Commercial Space</a></p>
                <p style="margin:0;">Thanks,<br>Rofo<br><span style="color:#64748b;">Commercial real estate search guidance since 2007</span></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendTenantConfirmationEmail(env, record) {
  const lead = record.lead || {};
  if (lead.tenant_confirmation_sent_at) {
    return { sent: false, skipped: true, reason: "Tenant confirmation was already sent" };
  }

  if (["spam_quarantined", "rejected", "rejected_spam", "spam_purged"].includes(record.status)) {
    return { sent: false, skipped: true, reason: `Lead status ${record.status} does not send tenant confirmations` };
  }

  if (!env.RESEND_API_KEY) {
    return { sent: false, reason: "RESEND_API_KEY is not configured" };
  }

  if (!lead.email) {
    return { sent: false, reason: "Lead email is missing" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.TENANT_CONFIRMATION_FROM || "Rofo <leads@rofo.com>",
      to: [lead.email],
      subject: isLocationBriefLead(lead)
        ? "Your Rofo Location Brief"
        : isLocationProfileLead(lead) ? "Your Rofo location profile" : "We received your Rofo space request",
      html: buildTenantConfirmationHtml(lead),
      text: buildTenantConfirmationText(lead),
    }),
  });

  if (!response.ok) {
    return { sent: false, reason: await response.text() };
  }

  return { sent: true, sent_at: new Date().toISOString() };
}

export async function approveLead(env, id, routeParam = "recommended") {
  const record = await getLead(env, id);
  if (!record) {
    return { ok: false, status: 404, title: "Lead not found", message: "No matching lead exists." };
  }

  if (["approved_sent", "broker_sent", "both_sent", "partial_sent"].includes(record.status)) {
    return { ok: true, status: 200, title: "Lead already approved and sent", message: "No duplicate submission was made." };
  }

  if (record.status === "rejected") {
    return { ok: false, status: 409, title: "Lead already rejected", message: "No submission was made." };
  }

  if (["spam_quarantined", "rejected_spam"].includes(record.status)) {
    return { ok: false, status: 409, title: "Lead is quarantined as spam", message: "Review and change status before routing this lead." };
  }

  const routeRecommendation = record.lead.route_recommendation || { route_to: "officefinder" };
  const targets = getApprovalTargets(routeParam, routeRecommendation);
  const results = [];
  const failures = [];
  let officeFinderPayload = null;

  if (targets.includes("officefinder")) {
    officeFinderPayload = buildOfficeFinderPayload(record.lead, env);
    const missing = getMissingOfficeFinderFields(officeFinderPayload);
    if (missing.length) {
      const attempt = {
        lead_id: id,
        attempted_at: new Date().toISOString(),
        officefinder_mode: routeRecommendation.officefinder_mode || "",
        request_payload: officeFinderPayload,
        response_status: 0,
        response_body: "",
        success: false,
        error: `Missing OfficeFinder fields: ${missing.join(", ")}`,
      };
      const lead = await appendOfficeFinderAttempt(env, record, attempt);
      record.lead = lead;
      failures.push(attempt.error);

      if (!targets.includes("broker")) {
        await updateLeadStatus(env, id, {
          status: "approved_send_failed",
          lead,
          approval_error: attempt.error,
        });
        return { ok: false, status: 422, title: "Lead not sent", message: attempt.error, failures };
      }
    }
  }

  if (targets.includes("officefinder") && !failures.length) {
    const result = await submitToOfficeFinder(env, officeFinderPayload);
    const attempt = {
      lead_id: id,
      attempted_at: new Date().toISOString(),
      officefinder_mode: routeRecommendation.officefinder_mode || "",
      request_payload: officeFinderPayload,
      response_status: result.status,
      response_body: result.body,
      success: result.ok,
      error: result.error || "",
    };
    const lead = await appendOfficeFinderAttempt(env, record, attempt);
    record.lead = lead;

    if (!result.ok) {
      failures.push(attempt.error || `OfficeFinder returned HTTP ${result.status}`);
    } else {
      results.push(`OfficeFinder: submitted to ${result.endpoint}`);
    }
  }

  if (targets.includes("broker") && !routeRecommendation.broker_email) {
    await updateLeadStatus(env, id, {
      status: results.length ? "partial_sent" : "approved_send_failed",
      approval_error: "Broker approval requested, but no broker email exists for the matched route.",
    });
    return { ok: false, status: 422, title: "Lead not sent", message: "No broker email exists for this route.", results, failures };
  }

  if (targets.includes("broker")) {
    const brokerResult = await sendBrokerLeadEmail(env, record);
    if (!brokerResult.sent) {
      failures.push(`Broker email failed: ${brokerResult.reason}`);
    } else {
      results.push(`Broker: sent to ${routeRecommendation.broker_name || routeRecommendation.broker_email}`);
    }
  }

  if (!results.length && failures.length) {
    await updateLeadStatus(env, id, {
      status: "approved_send_failed",
      approval_error: failures.join("\n"),
    });
    return { ok: false, status: 502, title: "Lead approval failed", message: failures.join(" "), failures };
  }

  const nextStatus = failures.length
    ? "partial_sent"
    : targets.includes("officefinder") && targets.includes("broker")
      ? "both_sent"
      : targets.includes("broker") ? "broker_sent" : "approved_sent";

  await updateLeadStatus(env, id, {
    status: nextStatus,
    lead: record.lead,
    officefinder_response: [...results, ...failures].join("\n"),
    approval_error: failures.join("\n"),
    sent_at: new Date().toISOString(),
  });

  let tenantConfirmation = { sent: false, skipped: true, reason: "Not attempted" };
  if (results.length && !record.lead.tenant_confirmation_sent_at) {
    try {
      tenantConfirmation = await sendTenantConfirmationEmail(env, {
        ...record,
        status: nextStatus,
        lead: record.lead,
      });

      const leadWithConfirmation = {
        ...record.lead,
        tenant_confirmation_sent_at: tenantConfirmation.sent ? tenantConfirmation.sent_at : record.lead.tenant_confirmation_sent_at,
        tenant_confirmation_error: tenantConfirmation.sent ? "" : tenantConfirmation.reason || "",
      };

      await updateLeadStatus(env, id, {
        status: nextStatus,
        lead: leadWithConfirmation,
        officefinder_response: [...results, ...failures].join("\n"),
        approval_error: [...failures, tenantConfirmation.sent || tenantConfirmation.skipped ? "" : `Tenant confirmation failed: ${tenantConfirmation.reason}`].filter(Boolean).join("\n"),
        sent_at: new Date().toISOString(),
      });
    } catch (error) {
      await updateLeadStatus(env, id, {
        status: nextStatus,
        lead: {
          ...record.lead,
          tenant_confirmation_error: error.message,
        },
        officefinder_response: [...results, ...failures].join("\n"),
        approval_error: [...failures, `Tenant confirmation failed: ${error.message}`].filter(Boolean).join("\n"),
        sent_at: new Date().toISOString(),
      });
      tenantConfirmation = { sent: false, reason: error.message };
    }
  }

  return {
    ok: failures.length === 0,
    status: failures.length ? 207 : 200,
    title: failures.length ? "Lead partially sent" : "Lead approved and sent",
    message: results.join(" "),
    results,
    failures,
    tenantConfirmation,
    nextStatus,
  };
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
  const neighborhoodContext = lead.neighborhood_name
    ? `${lead.neighborhood_name}${lead.city ? `, ${lead.city}` : ""}`
    : "";

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
                    ${lead.move_timing ? buildEmailField("Timing", escapeHtml(lead.move_timing)) : ""}
                    ${neighborhoodContext ? buildEmailField("Neighborhood / Area", escapeHtml(neighborhoodContext)) : ""}
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
  const neighborhoodContext = lead.neighborhood_name
    ? `${lead.neighborhood_name}${lead.city ? `, ${lead.city}` : ""}`
    : "";

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
    lead.move_timing ? `Timing: ${lead.move_timing}` : "",
    neighborhoodContext ? `Neighborhood / Area: ${neighborhoodContext}` : "",
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
  if (record.status !== "pending") {
    return { sent: false, reason: `Lead status ${record.status} does not send approval alerts` };
  }

  if (!env.RESEND_API_KEY || !env.LEAD_NOTIFY_EMAIL) {
    return { sent: false, reason: "RESEND_API_KEY and LEAD_NOTIFY_EMAIL are not configured" };
  }

  const baseUrl = getBaseUrl(request);
  const approveUrl = `${baseUrl}/api/leads/approve?id=${encodeURIComponent(record.id)}&token=${encodeURIComponent(token)}&route=recommended`;
  const approveOfficeFinderUrl = `${baseUrl}/api/leads/approve?id=${encodeURIComponent(record.id)}&token=${encodeURIComponent(token)}&route=officefinder`;
  const approveBrokerUrl = `${baseUrl}/api/leads/approve?id=${encodeURIComponent(record.id)}&token=${encodeURIComponent(token)}&route=broker`;
  const rejectUrl = `${baseUrl}/api/leads/reject?id=${encodeURIComponent(record.id)}&token=${encodeURIComponent(token)}`;
  const lead = record.lead;
  const adminParams = new URLSearchParams();
  if (env.ADMIN_DASHBOARD_TOKEN) adminParams.set("token", env.ADMIN_DASHBOARD_TOKEN);
  adminParams.set("id", record.id);
  adminParams.set("view", "pending");
  const dashboardUrl = `${baseUrl}/admin/leads?${adminParams.toString()}`;
  const market = getLeadMarket(lead);
  const spaceType = lead.effective_space_type || lead.requested_space_type || lead.space_type || "";
  const locationProfile = isLocationProfileLead(lead);
  const locationBrief = isLocationBriefLead(lead);
  const snapshot = buildProjectSnapshotFromLead(lead);
  const subject = locationBrief
    ? `New Rofo ${snapshot.propertyType || spaceType || "Space"} Requirement - ${snapshot.market || market || "Market"}`
    : locationProfile
    ? buildLocationRequirementSubject(lead)
    : `New Rofo lead: ${market || "Unknown market"} - ${spaceType || lead.space_needed || "space needed"}`;
  const requirements = lead.requirements || "(none provided)";
  const neighborhoodContext = lead.neighborhood_name
    ? `${lead.neighborhood_name}${lead.city ? `, ${lead.city}` : ""}`
    : "";
  const alertHeading = locationBrief ? "New Rofo Requirement" : locationProfile ? "New Location Requirement" : "New lead ready for review";
  const alertKicker = locationBrief ? "Rofo Location Brief" : locationProfile ? "Rofo location profile" : "Rofo lead alert";
  const requirementRows = locationProfile ? buildLocationRequirementRows(lead) : "";
  const snapshotLines = projectSnapshotTextLines(snapshot);
  const text = [
    locationBrief ? "NEW ROFO REQUIREMENT" : locationProfile ? "NEW LOCATION REQUIREMENT" : "NEW ROFO LEAD",
    "",
    locationBrief ? "A new Rofo requirement has been submitted." : "",
    locationBrief ? "" : "",
    locationBrief ? "LOCATION BRIEF" : "",
    locationBrief ? normalizeField(lead.location_brief_url) || "(Location Brief URL unavailable)" : "",
    locationBrief ? "" : "",
    locationBrief ? "PROJECT SNAPSHOT" : "",
    ...(locationBrief ? snapshotLines : []),
    locationBrief ? "" : "",
    locationBrief ? "ROUTING" : "",
    locationBrief ? `Recommended route: ${formatRouteLabel(lead.route_recommendation && lead.route_recommendation.route_to)}` : "",
    locationBrief ? `Assigned broker: ${lead.assigned_broker || lead.route_recommendation && lead.route_recommendation.broker_email || "(none)"}` : "",
    locationBrief ? `OfficeFinder status: ${lead.officefinder_status || "officefinder_not_attempted"}` : "",
    locationBrief ? `Submission status: ${record.status}` : "",
    locationBrief ? `Route reason: ${lead.route_recommendation && lead.route_recommendation.route_reason || ""}` : "",
    locationBrief ? "" : "",
    `Name: ${lead.name}`,
    `Company: ${lead.company || ""}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "(not provided)"}`,
    `Market: ${market}`,
    neighborhoodContext ? `Neighborhood / Area: ${neighborhoodContext}` : "",
    `Space type: ${spaceType}`,
    `Space size: ${lead.space_needed || ""}`,
    lead.move_timing ? `Timing: ${lead.move_timing}` : "",
    lead.location_profile_features ? `Features: ${lead.location_profile_features}` : "",
    lead.location_profile_feature_other ? `Other feature detail: ${lead.location_profile_feature_other}` : "",
    locationProfile ? "" : "",
    locationProfile ? "LOCATION REQUIREMENT SUMMARY" : "",
    locationProfile ? `Location: ${getLocationRequirementSummary(lead).location}` : "",
    locationProfile && lead.location_street ? `Street / detail: ${lead.location_street}` : "",
    locationProfile ? `Space type: ${spaceType}` : "",
    locationProfile ? `Team size / size: ${lead.space_needed || ""}` : "",
    locationProfile && lead.move_timing ? `Move-in timing: ${lead.move_timing}` : "",
    locationProfile && lead.location_profile_features ? `Features: ${lead.location_profile_features}` : "",
    lead.spam_score ? `Spam score: ${lead.spam_score}` : "",
    "",
    locationBrief ? "NOTES" : "NOTES",
    locationBrief ? "Review the Location Brief before routing or contacting the client." : requirements,
    "",
    `Review Lead in Dashboard: ${dashboardUrl}`,
    "",
    "Approval links:",
    `Approve recommended: ${approveUrl}`,
    `Approve OfficeFinder: ${approveOfficeFinderUrl}`,
    `Approve broker: ${approveBrokerUrl}`,
    `Reject: ${rejectUrl}`,
  ].filter((line) => line !== "").join("\n");
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f4f7fb;margin:0;padding:22px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:22px;background:#123f8c;color:#ffffff;">
                <div style="font-size:12px;line-height:16px;text-transform:uppercase;letter-spacing:.08em;color:#bfdbfe;font-weight:700;">${escapeHtml(alertKicker)}</div>
                <h1 style="margin:8px 0 8px;font-size:24px;line-height:30px;">${escapeHtml(alertHeading)}</h1>
                <div style="font-size:15px;line-height:22px;color:#eff6ff;">${escapeHtml(market)} &bull; ${escapeHtml(spaceType || "Space needed")} &bull; ${escapeHtml(lead.space_needed || "Size not provided")}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 18px 22px;">
                ${locationBrief ? `
                <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#f8fafc;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Location Brief</div>
                  ${lead.location_brief_url ? `<p style="margin:0 0 10px;"><a href="${escapeHtml(lead.location_brief_url)}" style="color:#2563eb;font-weight:700;text-decoration:none;">${escapeHtml(lead.location_brief_url)}</a></p>` : `<p style="margin:0 0 10px;color:#b45309;">Location Brief URL missing.</p>`}
                  <p style="margin:0;color:#475569;font-size:14px;line-height:21px;">The Brief contains the Business Profile, Executive Summary, district recommendations, representative buildings, and project context.</p>
                </div>

                <div style="margin:0 0 18px;padding:14px;border-radius:10px;background:#ffffff;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Project Snapshot</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    ${snapshotLines.map((line) => {
                      const [label, ...rest] = line.split(": ");
                      return buildEmailField(label, escapeHtml(rest.join(": ")));
                    }).join("")}
                    ${buildEmailField("Assigned broker", escapeHtml(lead.assigned_broker || lead.route_recommendation && lead.route_recommendation.broker_email || "(none)"))}
                    ${buildEmailField("OfficeFinder status", escapeHtml(lead.officefinder_status || "officefinder_not_attempted"))}
                    ${buildEmailField("Submission status", escapeHtml(record.status))}
                  </table>
                </div>` : ""}
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
                  ${buildEmailField("Name", escapeHtml(lead.name))}
                  ${lead.company ? buildEmailField("Company", escapeHtml(lead.company)) : ""}
                  ${buildEmailField("Email", `<a href="mailto:${escapeHtml(lead.email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(lead.email)}</a>`)}
                  ${lead.phone ? buildEmailField("Phone", `<a href="tel:${escapeHtml(lead.phone)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(lead.phone)}</a>`) : buildEmailField("Phone", escapeHtml("(not provided)"))}
                  ${buildEmailField("Market", escapeHtml(market))}
                  ${neighborhoodContext ? buildEmailField("Neighborhood / Area", escapeHtml(neighborhoodContext)) : ""}
                  ${buildEmailField("Space type", escapeHtml(spaceType))}
                  ${buildEmailField("Space size", escapeHtml(lead.space_needed))}
                  ${lead.move_timing ? buildEmailField("Timing", escapeHtml(lead.move_timing)) : ""}
                  ${lead.spam_score ? buildEmailField("Spam score", escapeHtml(lead.spam_score)) : ""}
                </table>
                ${locationProfile && requirementRows ? `
                <div style="margin:0 0 18px;padding:13px;border-radius:10px;background:#f8fafc;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 6px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Location requirement summary</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    ${requirementRows}
                  </table>
                </div>` : ""}
                <div style="margin:0 0 18px;padding:13px;border-radius:10px;background:#f8fafc;border:1px solid #dbe5f2;">
                  <div style="margin:0 0 6px;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Notes</div>
                  <div style="white-space:pre-wrap;word-break:break-word;font-size:14px;line-height:21px;">${escapeHtml(requirements)}</div>
                </div>
                <a href="${escapeHtml(dashboardUrl)}" style="display:block;width:100%;box-sizing:border-box;padding:15px 18px;border-radius:8px;background:#14532d;color:#ffffff;font-size:16px;line-height:21px;font-weight:800;text-align:center;text-decoration:none;">Review Lead in Dashboard</a>
                <div style="margin-top:14px;color:#64748b;font-size:12px;line-height:18px;">OfficeFinder and broker routing still require manual approval. Spam-quarantined leads do not send this alert.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

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
  const snapshot = buildProjectSnapshotFromLead(lead);
  const propertyType = snapshot.propertyType || lead.effective_space_type || lead.space_type || "Space";
  const market = snapshot.market || lead.city || lead.market || "Unknown market";
  const subject = `New Rofo ${propertyType} Requirement - ${market}`;
  const locationBriefUrl = normalizeField(lead.location_brief_url);
  const isBrief = isLocationBriefLead(lead);
  const text = isBrief
    ? [
      "New Rofo Requirement",
      "",
      "A new Rofo requirement has been submitted.",
      "",
      "Project Snapshot",
      ...projectSnapshotTextLines(snapshot).map((line) => `- ${line}`),
      "",
      "Best Fits",
      ...(snapshot.topDistricts && snapshot.topDistricts.length ? snapshot.topDistricts.map((district) => `- ${district}`) : ["- Review Location Brief"]),
      "",
      "Location Brief",
      locationBriefUrl || "(Location Brief URL unavailable)",
      "",
      "The Brief contains:",
      "- Business Profile",
      "- Executive Summary",
      "- District recommendations",
      "- Representative buildings",
      "- Project context",
      "",
      "Please review the Brief before contacting the client.",
      "",
      "Client",
      `Name: ${lead.name}`,
      `Company: ${lead.company || ""}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone || ""}`,
      "",
      "This requirement was manually approved by Rofo before routing.",
    ].join("\n")
    : [
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
      `Timing: ${lead.move_timing || ""}`,
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
    lead_type: lead.lead_type,
    profile_version: lead.profile_version,
    route_recommendation: route,
    city: lead.city,
    county: lead.routing_county || lead.county,
    state: lead.state,
    location_display: lead.location_display,
    location_district: lead.location_district,
    location_profile_features: lead.location_profile_features,
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
