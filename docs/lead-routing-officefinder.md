---
permalink: false
---

# Rofo Lead Approval and Routing System

This workflow stores tenant requirements as pending, emails Rofo for review, and sends the requirement only after an operator chooses a fulfillment destination from the Lead Dashboard. It supports OfficeFinder, broker partner email delivery, and future routing adapters behind the same operator action.

Partner and advertising forms should stay separate unless those inquiries should enter this tenant lead queue.

## Location Brief Handoff

The production recommendation handoff now treats the Location Brief as the canonical artifact. When a user submits the broker CTA from `/recommendations/`, Rofo:

1. Stores the Location Brief and generates a stable `/location-brief/{briefId}` URL.
2. Derives a reusable Project Snapshot from the Brief.
3. Stores a pending lead-dashboard record with the Brief URL, Project Snapshot, route recommendation, and OfficeFinder payload.
4. Sends the internal new-requirement notification.
5. Sends the customer confirmation email.
6. Sends OfficeFinder or direct broker handoffs only after the operator chooses a destination and clicks `Send Requirement`.

OfficeFinder and broker messages do not duplicate the full recommendation. They include a concise Project Snapshot, the top districts, and the Location Brief URL.

The Project Snapshot intentionally includes only execution-relevant fields:

- Market
- Property Type
- Business Type
- Approximate Size, when available
- Timing, when available
- Growth, when available
- Best Fits

Location Brief handoff helpers live in `functions/_shared/project-snapshot.js`. The canonical Brief submit path is `functions/api/location-brief/submit.js`.

## Lead Dashboard operator workflow

The default Lead Dashboard card is mobile-first and should answer the routing questions quickly:

- Who is this customer?
- What do they need?
- Where are they focused?
- How large is the requirement?
- When do they need it?
- Which destination should receive it?

For Location Brief requirements, the default card shows one compact summary, an `Open Brief` action, one `Send To` dropdown, and one `Send Requirement` button. The destination list includes OfficeFinder and all currently eligible active broker partners. OfficeFinder is treated as a fulfillment partner in the same control, even though it uses the OfficeFinder API adapter underneath.

Technical diagnostics, raw JSON, idempotency data, referral history, OfficeFinder attempts, OfficeFinder payloads, and email delivery details remain available inside the collapsed `More Details` section.

## Architecture

1. Tenant form posts to `/api/leads/submit`.
2. The Pages Function validates required fields and the honeypot field.
3. The lead is matched against `_data/leadRoutes.json`.
4. The lead is stored with `status = pending`.
5. Rofo receives a concise internal email with the requirement summary, Location Brief URL, and dashboard link.
6. The operator sends the requirement to the selected fulfillment destination:
   - OfficeFinder
   - direct broker partner
   - future adapter-backed destination
7. Rejection marks the lead `rejected`.

No lead is auto-sent to OfficeFinder or a broker before operator review.

## Cloudflare bindings and environment variables

Storage:

- `LEADS_DB`: D1 database binding, preferred
- `LEADS_KV`: optional KV fallback

Email and OfficeFinder:

- `LEAD_NOTIFY_EMAIL`: required internal Rofo notification recipient for every successfully created lead or availability request.
- `RESEND_API_KEY`: required Resend API key for internal alerts, customer confirmations, broker emails, and broker invitations.
- `RESEND_FROM_EMAIL`: required production sender address, such as `Rofo <leads@rofo.com>` or another sender on a verified Resend domain.
- `OFFICEFINDER_API_URL`: optional OfficeFinder endpoint override
- `OPERATOR_TIME_ZONE`: optional Mission Control display timezone for lead, referral, and routing timestamps. Defaults to `America/Los_Angeles`. Stored timestamps remain UTC.

Production email requires a verified Resend sending domain. The code still has a development fallback to `onboarding@resend.dev`, but that address is subject to Resend test-domain restrictions and can return 403 for normal production recipients. Production Pages environments should set `RESEND_FROM_EMAIL` to a verified Rofo domain sender before launch testing.

Optional Google Sheets logging:

- `GOOGLE_LEADS_WEBHOOK_URL`: Apps Script or webhook URL for newly submitted leads

If `OFFICEFINDER_API_URL` is missing, approved OfficeFinder leads post to:

`https://www.officefinder.com/scripts/_importLead.cfm`

## D1 schema

The current schema stores route metadata inside `lead_json`, so no extra route columns are required.
OfficeFinder attempts are also appended to `lead_json.officefinder_attempts`, with the latest approval summary mirrored in `officefinder_response`.

```sql
create table if not exists leads (
  id text primary key,
  token_hash text not null,
  status text not null,
  lead_json text not null,
  officefinder_json text not null,
  officefinder_response text,
  approval_error text,
  created_at text not null,
  updated_at text not null,
  sent_at text,
  rejected_at text
);

create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_created_at on leads(created_at);
```

## Routing config

Lead routing rules live in `_data/leadRoutes.json`.

Each rule may include:

- `id`
- `route_to`: `officefinder`, `broker`, or `both`
- `officefinder_mode`: `primary`, `fallback`, or `parallel`
- `broker_name`
- `broker_email`
- `brokers`: optional email array; the first email is used by the Phase 1 sender when `broker_email` is not set
- `broker_phone`
- `city`
- `county`
- `state`
- `space_type`
- `priority`
- `active`
- `notes`

Use lowercase kebab-case for city and county route values. County values should include state when practical, for example `marin-county-ca`. State values should use uppercase postal abbreviations like `CA`.

Inactive rules are ignored.

`officefinder_mode` controls how OfficeFinder participates:

- `primary`: send only to OfficeFinder after approval.
- `fallback`: send to OfficeFinder only when the matched route has no broker.
- `parallel`: send to both broker and OfficeFinder after approval.

Existing `route_to` values are still supported. If both are present, `officefinder_mode` determines whether OfficeFinder is primary, fallback, or parallel.

## Routing priority

The intended specificity order is:

1. Exact city + state + space type
2. Exact county + state + space type
3. Exact city + state
4. Exact county + state
5. Exact state + space type
6. Exact state
7. Default route

When multiple active rules match, explicit `priority` is evaluated first, then specificity. Lower priority numbers win.

If no active broker route matches, the active default OfficeFinder rule is used. If that rule is missing, the function has a built-in OfficeFinder fallback.

## Adding a city broker

```json
{
  "id": "san-francisco-office-broker",
  "route_to": "broker",
  "officefinder_mode": "fallback",
  "broker_name": "Broker Name",
  "broker_email": "broker@example.com",
  "city": "san-francisco-ca",
  "state": "CA",
  "space_type": "office-space",
  "priority": 10,
  "active": true
}
```

## Adding a county broker

```json
{
  "id": "marin-county-office-broker",
  "route_to": "broker",
  "officefinder_mode": "fallback",
  "broker_name": "Broker Name",
  "broker_email": "broker@example.com",
  "county": "marin-county-ca",
  "state": "CA",
  "space_type": "office-space",
  "priority": 10,
  "active": true
}
```

## Routing all leads to OfficeFinder

Activate the `all-leads-officefinder` rule in `_data/leadRoutes.json`:

```json
{
  "id": "all-leads-officefinder",
  "route_to": "officefinder",
  "officefinder_mode": "primary",
  "city": "all",
  "county": "all",
  "state": "all",
  "space_type": "all",
  "priority": 1,
  "active": true
}
```

This keeps approval required but recommends OfficeFinder for every lead.

## route_to both / officefinder_mode parallel

Use `route_to: "both"` and `officefinder_mode: "parallel"` when Alan should have a recommended approval link that sends to OfficeFinder and emails the broker.

```json
{
  "id": "example-both-route",
  "route_to": "both",
  "officefinder_mode": "parallel",
  "broker_name": "Broker Name",
  "broker_email": "broker@example.com",
  "county": "san-francisco-county-ca",
  "state": "CA",
  "space_type": "office-space",
  "priority": 10,
  "active": true
}
```

The approval email still includes OfficeFinder-only and broker-only links for manual override.

## Approval links

- Recommended route: `/api/leads/approve?id={id}&token={token}&route=recommended`
- OfficeFinder only: `/api/leads/approve?id={id}&token={token}&route=officefinder`
- Broker only: `/api/leads/approve?id={id}&token={token}&route=broker`
- Reject: `/api/leads/reject?id={id}&token={token}`

OfficeFinder approvals post to `OFFICEFINDER_API_URL` when configured, otherwise the production OfficeFinder import endpoint.

Broker approvals send a Resend email to the matched `broker_email` and mark the lead `broker_sent`. They do not create automation outside the approval click.

## Google Sheets webhook

If `GOOGLE_LEADS_WEBHOOK_URL` is configured, `/api/leads/submit` posts each new lead to it after storage. Payload includes:

- lead id
- status
- route recommendation
- city
- county
- state
- space type
- name
- email
- phone
- company
- source
- page URL
- created timestamp

If the webhook is missing or fails, lead submission continues and the user still reaches the thank-you flow.

## OfficeFinder mapping

Production endpoint:

`https://www.officefinder.com/scripts/_importLead.cfm`

Optional override:

`OFFICEFINDER_API_URL`

Field mapping:

| OfficeFinder field | Rofo source |
| --- | --- |
| `Referrer` | hardcoded `MM2` |
| `MarketName` | `city`, then `market`, then `location` |
| `MarketState` | `state` |
| `MarketCountry` | hardcoded `USA` |
| `NotListed` | omitted for normal city/state leads; used only as a fallback when a normal market cannot be identified |
| `Prospect_Status` | hardcoded `Actively looking for space` |
| `ApproveExec` | hardcoded `0` |
| `Name` | `name` |
| `Email` | `email` |
| `Phone` | normalized to `555-555-5555`; invalid phones are not submitted |
| `CompanyName` | `company` |
| `SqFt` | parsed numeric upper end from `space_needed`; `Not Sure` defaults to `1000` |
| `FinanceOption` | mapped from the submitted space type |
| `PrefLeaseTerm` | hardcoded `2` |
| `Comments` | requirements, raw size, page type, source, and space type |
| `rofo_source` | `rofo_source`, falling back to `page_url` |

For Location Brief leads, `Comments` is intentionally concise:

```text
Rofo Location Brief

{Location Brief URL}

Best Fits
- District A
- District B
- District C

Please review the Location Brief before contacting the client.

Project Snapshot
Market: ...
Property Type: ...
```

The structured OfficeFinder fields remain unchanged.

OfficeFinder requires a phone number. If a Location Profile or Location Brief customer does not provide one, the OfficeFinder adapter uses the existing integration-only placeholder `555-555-5555`. Rofo does not overwrite the stored customer phone value, does not show this placeholder in the Location Brief, and does not include it in direct broker or customer-facing emails. Placeholder usage is logged as `placeholder_phone_used`.

Finance option mapping:

- Office Space, Office, Flex Space, Flex, Not Sure, or blank: `leasing`
- Coworking Space, Coworking, Executive Suite: `ExecSuites`
- Retail Space or Retail: `Retail`
- Industrial Space, Industrial, or Warehouse: `Industrial`
- Medical Office Space or Medical: `Medical`

OfficeFinder submissions use `application/x-www-form-urlencoded`.

OfficeFinder attempt logs include:

- lead id
- attempted timestamp
- officefinder mode
- request payload
- response status
- response body
- success flag
- error message

These are stored in `lead_json.officefinder_attempts`; the latest approval summary is mirrored in `officefinder_response`.

## Endpoint control

1. Confirm D1 storage, Resend, and approval emails are stable.
2. If testing against a non-production endpoint, set `OFFICEFINDER_API_URL` to that endpoint.
3. Confirm the tenant forms are posting to `/api/leads/submit`.
4. To use the production endpoint, remove `OFFICEFINDER_API_URL` or set it to `https://www.officefinder.com/scripts/_importLead.cfm`.
5. Submit one controlled lead and approve OfficeFinder routing.
6. Monitor D1 status, `officefinder_response`, and OfficeFinder receipt.

## Rollback

To rollback form submission, restore tenant form actions in `index.njk`, `city.njk`, and `building.njk` to the Formspree endpoint.

To rollback routing without changing forms, leave `/api/leads/submit` active but set all broker routes inactive and keep the default OfficeFinder route active. Leads will still require approval before sending.

## Test checklist

Submit a test lead:

```bash
curl -i -X POST "https://www.rofo.com/api/leads/submit" \
  -H "accept: application/json" \
  -H "content-type: application/json" \
  --data '{
    "name": "Test Lead",
    "email": "test@example.com",
    "phone": "555-555-5555",
    "company": "Example Co",
    "city": "Sacramento",
    "state": "CA",
    "routing_county": "sacramento-county-ca",
    "space_type": "Office Space",
    "space_needed": "1,000-2,500 sqft",
    "notes": "Testing approval flow",
    "page_type": "city",
    "page_url": "https://www.rofo.com/commercial-real-estate/CA/sacramento/",
    "source": "rofo"
  }'
```

Verify:

- Missing phone is rejected.
- Default route recommends OfficeFinder.
- An active county route recommends the broker.
- A `route_to: "both"` / `officefinder_mode: "parallel"` rule sends to OfficeFinder and broker after approval.
- A broker route with `officefinder_mode: "fallback"` sends only to the broker.
- An invalid OfficeFinder phone fails OfficeFinder validation without deleting the pending lead.
- Approval links cannot be used with a bad token.
- Duplicate approvals do not resend.
- Google Sheets webhook failure does not block submission.
- Partner form still posts to Formspree.

Additional Location Brief handoff QA:

```bash
node scripts/qa-location-brief-handoff.js
```

Verify:

- Location Brief leads preserve the canonical Brief URL.
- Project Snapshot is stored on the Brief-derived lead.
- Internal approval notifications include routing and OfficeFinder status.
- OfficeFinder comments point to the Brief instead of duplicating the full recommendation.
- Broker email uses the concise Location Brief handoff format.
- Customer confirmation links back to the Brief.

## Production email verification checklist

Before production lead testing, verify:

- `RESEND_API_KEY` is configured in the Cloudflare Pages production environment.
- The Resend sending domain is verified and authorized for the sender in `RESEND_FROM_EMAIL`.
- `RESEND_FROM_EMAIL` is set to the verified production sender.
- `LEAD_NOTIFY_EMAIL` is set to the internal Rofo operations inbox.
- `OPERATOR_TIME_ZONE` is set if Mission Control should display operator timestamps outside the default Pacific timezone.
- A safe test customer email is available for confirmation testing.

Expected dashboard/email statuses:

- `sent`: Resend accepted the email request.
- `failed`: Resend was attempted and returned an error, such as a 403 sender/domain restriction.
- `not_configured`: a required setting such as `RESEND_API_KEY` or `LEAD_NOTIFY_EMAIL` is missing.
- `not_attempted`: the lead status or flow was not eligible for that email attempt.
