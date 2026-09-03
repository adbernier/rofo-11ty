const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const source = fs.readFileSync("functions/admin/operations.js", "utf8");

for (const heading of ["Acquisition / Entry", "Customer Funnel", "Operational Fulfillment", "Recent Requirements", "Recommendation Intelligence Performance", "Activity Diagnostics"]) {
  assert(source.includes(heading), `Mission Control must render ${heading}.`);
}

assert(source.includes("Find Locations Page Entries"), "Find Locations must be described as page entries.");
assert(!source.includes("Find Locations Starts"), "The misleading Find Locations Starts label must be removed.");
assert(!source.includes("from previous"), "Unlinked stage-to-stage conversion percentages must be removed.");
assert(!source.includes("recommendations_viewed"), "The obsolete recommendation-view event must not drive Mission Control.");
assert(!source.includes("recommendation_context_created"), "The obsolete recommendation-context event must not drive Mission Control.");

for (const durableSource of [
  "location_briefs_v2",
  "location_brief_v2_recommendation_snapshots",
  "location_brief_v2_commercial_requests",
  "current_requirement_revision_id",
  "current_recommendation_snapshot_id",
  "sent_at >= ?",
]) assert(source.includes(durableSource), `Missing durable source: ${durableSource}`);

for (const outcome of ["FULL", "BOUNDED", "INVESTIGATE"]) assert(source.includes(outcome), `Missing ${outcome} reporting.`);
for (const readiness of ["BROKER_READY", "NEEDS_QUALIFICATION", "INSUFFICIENT_REQUIREMENT"]) {
  assert(source.includes(`BROKER_READINESS.${readiness === "BROKER_READY" ? "READY" : readiness === "NEEDS_QUALIFICATION" ? "NEEDS_QUALIFICATION" : "INSUFFICIENT"}`));
}

assert(source.includes("vnext_brief_viewed"), "Current Brief engagement must use the v2 view event.");
assert(source.includes("attribution.session_id"), "Brief engagement must use the viewer session where available.");
assert(source.includes("mergeRecentRequirements"), "Recent Requirements must merge current generations.");
assert(source.includes("left join location_brief_v2_commercial_requests cr on cr.lead_id = l.id"), "v2 continuation leads must not double-count their source Requirement.");
assert(source.includes("current_recommendation_snapshot_id"), "Recommendation outcomes must use each Brief's current snapshot.");
assert(source.includes("isClearlyNonCustomerRecord"), "A reusable clear test/operator exclusion must be present.");
assert(source.includes("Last 30 rolling days (UTC)"), "The reporting window must be explicit.");
assert(source.includes("Not yet measurable"), "Unavailable stages must have an honest fallback.");

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-funnel-integrity-"));
const bundled = path.join(temp, "operations.cjs");
execFileSync(path.join(process.cwd(), "node_modules/esbuild/bin/esbuild"), ["functions/admin/operations.js", "--bundle", "--platform=node", "--format=cjs", `--outfile=${bundled}`]);
const operations = require(bundled);

class Statement {
  constructor(sql) { this.sql = sql.replace(/\s+/g, " ").trim(); this.values = []; }
  bind(...values) { this.values = values; return this; }
  async first() {
    if (this.sql.includes("event_name in ('search_profile_started', 'vnext_requirement_started')")) return { count: 3 };
    if (this.sql.includes("event_name = 'vnext_brief_viewed'")) return { count: 2 };
    if (this.sql.includes("from leads l left join location_brief_v2_commercial_requests")) return { count: 1 };
    if (this.sql.includes("from location_briefs_v2 b join location_brief_v2_entry_contexts") && this.sql.includes("count(distinct b.id)")) return { count: 1 };
    if (this.sql.includes("from location_brief_v2_commercial_requests")) return { count: 1 };
    if (this.sql.includes("from leads where sent_at")) return { count: 1 };
    if (this.sql.includes("from referrals")) return { count: 0 };
    if (this.sql.includes("from search_profile_events")) return { count: 4 };
    if (this.sql.includes("from location_brief_events")) return { count: 1 };
    return { count: 0 };
  }
  async all() {
    if (this.sql.includes("group by upper(s.readiness)")) return { results: [{ readiness: "FULL", count: 1 }, { readiness: "INVESTIGATE", count: 1 }] };
    if (this.sql.includes("select id, status, lead_json, created_at from leads")) return { results: [{ id: "lead-real", status: "pending", created_at: "2026-09-02T00:00:00.000Z", lead_json: JSON.stringify({ source: "space_type", name: "Sample", location_display: "Palmetto, FL", requested_space_type: "Office", space_needed: "2,500–5,000 SF", move_timing: "ASAP", specific_business_use: "Painting subcontractor" }) }] };
    if (this.sql.includes("from location_briefs_v2 b") && this.sql.includes("r.requirement_json")) return { results: [{ id: "brief-v2", public_id: "LB2-TEST", lifecycle_stage: "LOCATION_FULL", created_at: "2026-09-01T00:00:00.000Z", requirement_json: JSON.stringify({ propertyTypes: ["industrial_flex"], businessContext: { summary: "Warehouse distributor" }, locationLogic: { marketAnchor: { city: "San Diego", state: "CA", displayName: "San Diego, CA" } }, criteria: [] }), readiness: "FULL", context_json: JSON.stringify({ sourceType: "space_type" }), lead_id: null, lead_status: null, lead_json: null }] };
    return { results: [] };
  }
}
class Database { prepare(sql) { return new Statement(sql); } }

(async () => {
  const response = await operations.onRequestGet({ request: new Request("https://example.com/admin/operations?token=secret"), env: { ADMIN_DASHBOARD_TOKEN: "secret", LEADS_DB: new Database() } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert(html.includes("Acquisition / Entry"));
  assert(html.includes("Customer Funnel"));
  assert(html.includes("Operational Fulfillment"));
  assert(html.includes("Palmetto, FL"), "current lead-backed Requirement must render");
  assert(html.includes("San Diego, CA"), "current v2 Requirement must render");
  assert(html.includes("FULL"), "current recommendation outcome must render");
  assert(!html.includes("from previous"));
  assert(!html.includes("Find Locations Starts"));
  fs.rmSync(temp, { recursive: true, force: true });
  console.log("Mission Control funnel integrity QA passed: version-aware records, durable outcomes, honest labels, and invalid-conversion removal verified.");
})().catch((error) => { fs.rmSync(temp, { recursive: true, force: true }); console.error(error); process.exit(1); });
