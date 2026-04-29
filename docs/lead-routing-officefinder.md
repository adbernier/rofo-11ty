---
permalink: false
---

# Rofo Lead Approval System for OfficeFinder

This is the Phase 1 test-mode workflow for manually approving Rofo leads before sending them to OfficeFinder. It does not replace the current Formspree forms until the form actions are intentionally switched.

## Architecture

1. Rofo form posts to `/api/leads/submit`.
2. The Pages Function validates basic lead fields and the honeypot field.
3. The lead is stored with `status = pending`.
4. Alan receives an approval email with approve and reject links.
5. Approving validates the stored token and sends the mapped lead to the OfficeFinder test endpoint.
6. Rejecting validates the token and marks the lead rejected.
7. Users are redirected to `/thank-you/` after a successful form post.

The approval links are:

- `/api/leads/approve?id={id}&token={token}`
- `/api/leads/reject?id={id}&token={token}`

Tokens are stored only as SHA-256 hashes.

## Cloudflare bindings and environment variables

Preferred storage is D1:

- `LEADS_DB`: D1 database binding

Phase 1 fallback storage is KV:

- `LEADS_KV`: KV namespace binding

Email and OfficeFinder settings:

- `LEAD_NOTIFY_EMAIL`: approval notification recipient
- `RESEND_API_KEY`: Resend API key for approval emails
- `RESEND_FROM_EMAIL`: optional sender address
- `OFFICEFINDER_REFERRER_CODE`: `MM2`
- `OFFICEFINDER_REFERRER_PCT`: `75`
- `OFFICEFINDER_TEST_MODE`: `true`

If `OFFICEFINDER_TEST_MODE` is not set, the functions default to test mode.

## D1 schema

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

## OfficeFinder mapping

Endpoint in test mode:

`https://www.officefinder.com/scripts/_importLeadTest.cfm`

Production endpoint for a later approved switch:

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

Approval will not submit to OfficeFinder if required OfficeFinder fields are missing. Current Rofo forms collect phone as optional, so a lead with no phone can be stored and reviewed but will fail approval until phone is collected or added manually.

## Form switch checklist

Current Formspree forms remain active. To switch tenant lead forms to the approval workflow later:

1. Change the form action on `building.njk`, `city.njk`, and `index.njk` to `/api/leads/submit`.
2. Keep `method="POST"`.
3. Preserve `_gotcha`, hidden page fields, and routing metadata fields.
4. Keep `name`, `email`, `space_type` or `requested_space_type`, `space_needed`, and `notes` field names.
5. Consider making `phone` required before switching, because OfficeFinder requires `Phone`.
6. Do not switch the partner form unless partner inquiries should enter this lead approval queue.

## Test checklist

Submit a test lead after the Pages Functions and bindings are configured:

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
    "space_type": "office-space",
    "space_needed": "1,000-2,500 sqft",
    "notes": "Testing OfficeFinder approval flow",
    "page_type": "city",
    "page_url": "https://www.rofo.com/commercial-real-estate/CA/sacramento/",
    "source": "rofo"
  }'
```

Then click the approval or rejection links in the notification email.

Expected approval result in test mode:

- Lead status changes from `pending` to `approved_sent`.
- OfficeFinder receives a POST to `_importLeadTest.cfm`.
- No production OfficeFinder endpoint is used.

Expected rejection result:

- Lead status changes from `pending` to `rejected`.
- No OfficeFinder request is made.

## Production switch checklist

1. Confirm D1 binding and schema are deployed.
2. Confirm Resend sender domain is verified.
3. Run multiple test submissions with `OFFICEFINDER_TEST_MODE=true`.
4. Confirm OfficeFinder test submissions include all required fields.
5. Switch form actions to `/api/leads/submit`.
6. Monitor pending, approved, rejected, and approval failed statuses.
7. Only after explicit approval, set `OFFICEFINDER_TEST_MODE=false`.
