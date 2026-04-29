---
permalink: false
---

# Rofo Lead Approval and Routing System

This workflow stores tenant leads as pending, emails Alan for approval, and sends the lead only after an approval link is clicked. It supports OfficeFinder, broker email delivery, or both.

Partner and advertising forms should stay separate unless those inquiries should enter this tenant lead queue.

## Architecture

1. Tenant form posts to `/api/leads/submit`.
2. The Pages Function validates required fields and the honeypot field.
3. The lead is matched against `_data/leadRoutes.json`.
4. The lead is stored with `status = pending`.
5. Alan receives an email with lead summary, route recommendation, approve links, and a reject link.
6. Approval sends to the selected target:
   - recommended route
   - OfficeFinder only
   - broker only, when a broker route exists
7. Rejection marks the lead `rejected`.

No lead is auto-sent to OfficeFinder or a broker before approval.

## Cloudflare bindings and environment variables

Storage:

- `LEADS_DB`: D1 database binding, preferred
- `LEADS_KV`: optional KV fallback

Email and OfficeFinder:

- `LEAD_NOTIFY_EMAIL`: approval notification recipient
- `RESEND_API_KEY`: Resend API key for approval and broker emails
- `RESEND_FROM_EMAIL`: optional sender address
- `OFFICEFINDER_REFERRER_CODE`: `MM2`
- `OFFICEFINDER_REFERRER_PCT`: `75`
- `OFFICEFINDER_TEST_MODE`: `true`

Optional Google Sheets logging:

- `GOOGLE_LEADS_WEBHOOK_URL`: Apps Script or webhook URL for newly submitted leads

If `OFFICEFINDER_TEST_MODE` is missing, the functions default to OfficeFinder test mode.

## D1 schema

The current schema stores route metadata inside `lead_json`, so no extra route columns are required.

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
- `broker_name`
- `broker_email`
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
  "city": "all",
  "county": "all",
  "state": "all",
  "space_type": "all",
  "priority": 1,
  "active": true
}
```

This keeps approval required but recommends OfficeFinder for every lead.

## route_to both

Use `route_to: "both"` when Alan should have a recommended approval link that sends to OfficeFinder and emails the broker.

```json
{
  "id": "example-both-route",
  "route_to": "both",
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

OfficeFinder approvals use the test endpoint while `OFFICEFINDER_TEST_MODE=true`.

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

Test endpoint:

`https://www.officefinder.com/scripts/_importLeadTest.cfm`

Production endpoint:

`https://www.officefinder.com/scripts/_importLead.cfm`

Field mapping:

| OfficeFinder field | Rofo source |
| --- | --- |
| `Referrer` | `OFFICEFINDER_REFERRER_CODE`, defaults to `MM2` |
| `ReferrerPct` | `OFFICEFINDER_REFERRER_PCT`, defaults to `75` |
| `MarketName` | `city`, then `market`, then `location` |
| `MarketState` | `state` |
| `Name` | `name` |
| `Email` | `email` |
| `Phone` | `phone` |
| `CompanyName` | `company` |
| `SqFt` | parsed from `space_needed` |
| `WorkStations` | blank unless submitted |
| `FinanceOption` | mapped from requested/page space type |
| `PrefLeaseTerm` | submitted lease term or `2` |
| `Comments` | requirements, page URL, page type, source, space type, and raw size |

Finance option mapping:

- office space: `leasing`
- coworking space: `ExecSuites`
- retail space: `Retail`
- industrial space: `Industrial`
- flex space: `MixedUse`
- fallback: `leasing`

## Switching OfficeFinder to production

1. Confirm D1 storage, Resend, and approval emails are stable.
2. Confirm multiple OfficeFinder test submissions were accepted.
3. Confirm the tenant forms are posting to `/api/leads/submit`.
4. Set `OFFICEFINDER_TEST_MODE=false`.
5. Submit one controlled lead and approve OfficeFinder routing.
6. Monitor D1 status and OfficeFinder receipt.

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
    "phone": "555-0100",
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
- A `route_to: "both"` rule sends to OfficeFinder and broker after approval.
- Approval links cannot be used with a bad token.
- Duplicate approvals do not resend.
- Google Sheets webhook failure does not block submission.
- Partner form still posts to Formspree.
