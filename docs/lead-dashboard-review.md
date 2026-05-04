---
permalink: false
---

# Lead Dashboard Review Flow

Rofo tenant leads are stored in D1 and reviewed from:

`/admin/leads?token=YOUR_ADMIN_DASHBOARD_TOKEN`

## Alert Emails

New lead alerts are sent only for `pending` leads.

Spam-quarantined leads do not send Resend emails.

The alert email includes:

- lead contact details
- market and space need
- notes / requirements
- spam score when present
- a `Review Lead in Dashboard` button

If `ADMIN_DASHBOARD_TOKEN` is configured, the dashboard link includes the token and lead id:

`/admin/leads?token=...&id=LEAD_ID&view=pending`

The plain-text fallback still includes the existing token approval links so the older email approval flow remains available.

## Dashboard Review

The dashboard defaults to `Pending`, which keeps spam out of the first screen.

Tabs:

- `Pending`
- `Approved/Sent`
- `Rejected`
- `Spam Quarantined`
- `All`

Each card shows the highest-signal fields first:

- market
- contact
- phone
- space type
- space size
- notes
- spam score and reasons when present

## Dashboard Actions

Pending leads can be handled directly from the dashboard:

- `Approve & Send...`
- `OfficeFinder Only` or `Broker Only` when applicable
- `Reject Lead`
- `Mark as Spam`

Dashboard actions use `POST` and require `ADMIN_DASHBOARD_TOKEN`. They do not expose approval-token URLs publicly.

Approving from the dashboard calls the same shared routing logic as the existing approval email token endpoint. OfficeFinder and broker delivery still happen only after manual approval.

## Statuses

Common statuses:

- `pending`: ready for review
- `approved_sent`: sent to OfficeFinder
- `broker_sent`: sent to broker
- `both_sent`: sent to OfficeFinder and broker
- `partial_sent`: one route succeeded and another failed
- `approved_send_failed`: approval attempted but delivery failed
- `rejected`: manually rejected
- `spam_quarantined`: blocked or manually marked as spam

## Spam Handling

Spam scoring runs before alert email delivery.

When score is high enough, the lead is saved as `spam_quarantined` with `spam_score` and `spam_reasons`, but no Resend alert is sent.

Spam can also be marked manually from the dashboard. Manual spam actions add:

`Manually marked as spam from dashboard`

to `lead_json.spam_reasons`.

## Testing

Real lead:

1. Submit a valid lead with normal dropdown values, valid email, and valid phone.
2. Confirm D1 status is `pending`.
3. Confirm Alan receives the mobile-friendly dashboard alert.
4. Open the dashboard link.
5. Approve from the dashboard.
6. Confirm status changes to the expected sent status.

Spam lead:

1. Submit a lead with values such as `space_type=1`, `space_needed=1`, and `testing@example.com`.
2. Confirm status is `spam_quarantined`.
3. Confirm no Resend alert is sent.
4. Confirm the Spam Quarantined dashboard tab shows score and reasons.
