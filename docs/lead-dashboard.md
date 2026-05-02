---
permalink: false
---

# Rofo Lead Dashboard

The internal lead dashboard provides a simple HTML view of recent tenant leads without needing to query D1 directly.

## URL

`/admin/leads?token=YOUR_TOKEN`

## Required environment variable

- `ADMIN_DASHBOARD_TOKEN`: shared admin token required to view the dashboard

If `ADMIN_DASHBOARD_TOKEN` is not configured, the route returns:

`Admin dashboard is not configured.`

## Storage requirement

The dashboard reads from the existing Cloudflare D1 binding:

- `LEADS_DB`

It does not change lead submission, approval, rejection, broker routing, or OfficeFinder submission behavior.

## Filters

Use query parameters:

- `status`: filters by the D1 `leads.status` column
- `officefinder_status`: filters by `lead_json.officefinder_status`
- `limit`: number of recent records to show, default `50`, max `200`

Examples:

`/admin/leads?token=YOUR_TOKEN&limit=50`

`/admin/leads?token=YOUR_TOKEN&status=pending`

`/admin/leads?token=YOUR_TOKEN&officefinder_status=officefinder_failed`

`/admin/leads?token=YOUR_TOKEN&status=approved_send_failed&limit=100`

## What it shows

Each lead card shows:

- created date
- lead status
- name, email, phone, and company
- city / market and state
- requested space type and size
- source, page type, and page URL
- route recommendation and matched rule
- broker email if present
- OfficeFinder status
- latest OfficeFinder attempt result
- approval error if present
- stored OfficeFinder payload
- raw lead JSON

Long payloads and response bodies are kept inside `<details>` blocks.

## Approval actions

Approval tokens are stored as hashes, so the dashboard does not reconstruct approval links.

For now, use the approval email for:

- approve recommended route
- send to OfficeFinder
- send to broker
- reject

This avoids weakening the existing approval security model.

## Common SQL checks replaced by the dashboard

Recent leads:

`/admin/leads?token=YOUR_TOKEN`

Pending leads:

`/admin/leads?token=YOUR_TOKEN&status=pending`

Failed approvals:

`/admin/leads?token=YOUR_TOKEN&status=approved_send_failed`

OfficeFinder failures:

`/admin/leads?token=YOUR_TOKEN&officefinder_status=officefinder_failed`

Rejected leads:

`/admin/leads?token=YOUR_TOKEN&status=rejected`

## Security note

This is a lightweight Phase 1 admin tool. Keep `ADMIN_DASHBOARD_TOKEN` private, long, and random. Do not link this page from public navigation.

Future hardening options:

- Cloudflare Access in front of `/admin/*`
- session-based admin auth
- separate read-only admin D1 endpoint
- audit logging for dashboard views
