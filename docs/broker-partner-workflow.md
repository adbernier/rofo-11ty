# Broker Partner Workflow

Rofo maintains a broker partner directory for trusted brokers who have agreed to accept referrals by market and space type.

This directory is the foundation for a future Location Brief referral workflow. It does not send referrals by itself.

## N1 Broker Directory

The N1 implementation supports:

- adding broker partner records
- editing broker partner records
- storing market coverage
- storing space type coverage
- storing partner status
- showing eligible broker partners on Lead Dashboard records

Broker partner records include:

- name
- email
- phone
- company
- markets served
- space types served
- status
- notes
- created and updated timestamps

Markets are stored as simple structured entries:

```text
State | County | City | District
CA | Orange County | Irvine | Irvine Spectrum
FL | St. Lucie County | Port St. Lucie
```

District is optional.

Supported space types:

- office
- industrial
- warehouse
- flex
- retail
- medical
- coworking

Supported statuses:

- active
- inactive
- pending

Only active brokers are shown as eligible matches on lead records.

## Eligible Broker Matching

The Lead Dashboard displays eligible broker partners using conservative matching:

- Exact market + space type match
- State/region match
- Space type match only

This is informational only. N1 does not automatically send a referral, email a broker, reveal customer contact information differently, or change lead routing.

## N1.1 Broker Invitation Workflow

The invitation workflow lets an admin invite a broker partner after the broker record has been created.

Broker creation and broker invitation are separate actions. Creating a broker record never sends an email automatically.

The admin invitation flow supports:

- explicit Invite / Resend Invite action from `/admin/brokers`
- confirmation before sending
- secure expiring invitation token
- public broker invitation review page
- Accept Invitation
- Decline Invitation
- invitation status tracking

Invitation statuses:

- not_sent
- sent
- accepted
- declined
- expired
- send_failed

Tracked invitation fields:

- invite_status
- invited_at
- invite_sent_count
- last_invited_at
- invite_token
- invite_token_expires_at
- accepted_at
- invite_last_error

The stored invite token is a hash of the emailed token. The raw token only appears in the invitation URL sent to the broker.

## Invitation Email

The broker invitation email includes:

- a short introduction to Rofo and the referral program
- the broker's assigned markets
- the broker's assigned space types
- a link to the sample Location Brief
- financial terms, if configured
- partner expectations
- a button to review and confirm participation

The sample Location Brief link defaults to:

```text
/example-location-brief/
```

It can be overridden with:

```text
BROKER_SAMPLE_LOCATION_BRIEF_URL
```

Financial terms are intentionally not hardcoded into broker workflow logic. They are included only when configured with:

```text
BROKER_PARTNER_TERMS_SUMMARY
```

Partner expectations are isolated in the invitation template. They can be overridden with:

```text
BROKER_PARTNER_EXPECTATIONS
```

Use one expectation per line or separate entries with semicolons.

## Invitation Acceptance

When a broker accepts:

- invite_status becomes accepted
- accepted_at is recorded
- broker status becomes active
- the invite token is consumed

When a broker declines:

- invite_status becomes declined
- broker status becomes inactive
- the invite token is consumed

Expired links are marked expired and cannot activate a broker.

Used links cannot be accepted or declined again.

## Invitation vs Lead Referral Acceptance

Broker invitation acceptance means:

The broker agrees to participate as a Rofo broker partner for the configured coverage.

Lead referral acceptance means:

The broker accepts a specific customer Location Brief referral.

These are separate workflows. N1.1 implements broker invitation acceptance only.

## N2 Partner Referral Workflow

N2 introduces Referral as a first-class platform object.

A Referral connects:

```text
Location Brief
↓
Lead
↓
Broker Partner
↓
Referral Lifecycle
```

The Referral, not the Lead, is the operational object that moves through broker partner review.

## Referral Object

Referrals are stored separately from leads so a lead can eventually have multiple broker referrals.

Referral fields include:

- id
- lead_id
- broker_partner_id
- status
- created_at
- sent_at
- email_delivered_at
- email_opened_at
- brief_viewed_at
- accepted_at
- declined_at
- expired_at
- contact_revealed_at
- expires_at
- token_hash
- created_by
- notes
- email_delivery_error

Referral statuses:

- draft
- sent
- viewed
- accepted
- declined
- expired
- completed
- cancelled

`completed` and `cancelled` are future-safe statuses.

## Admin Referral Flow

On the Lead Dashboard, Location Brief leads now show:

- eligible broker partners
- Assign Partner selector
- Send Referral action
- Referral History

Live Market Investigation requests are stored as Location Brief-family leads with `lead_type: live_market_investigation` and `status: market_investigation_requested`. The dashboard shows the investigation district, selected representative buildings, competitive-building flag, requested research scope, timing, broker preference, and investigation notes before any broker referral is created.

The operational status block also shows the investigation request reference, confirmation-email status, internal-email status, and idempotency state. These fields are for operations only; customer-facing pages should not expose raw submission tokens or idempotency keys.

Duplicate retries with the same submission token and unchanged investigation fingerprint are resolved to the original received request. They must not create another lead, resend the internal notification, or resend the user confirmation email. Materially revised requests use a different server fingerprint and may create a new Location Brief-family lead.

Sending a referral:

- creates a Referral record
- generates a secure referral token
- sends the broker a referral email
- keeps customer contact information hidden
- records send status and email delivery errors

The admin remains in control. No referral is sent automatically.

Broker guidance is optional in the Live Market Investigation intake. Selecting broker guidance records preference and context; it does not automatically share the request with a broker unless an admin later uses the existing referral workflow.

## Referral Email

The referral email includes:

- Location Brief summary
- market
- business type
- space requirements
- recommendation summary when available
- View Referral link

The email does not reveal customer contact information.

## Broker Referral Page

Broker referral links use:

```text
/broker/referral/[token]
```

The broker can review:

- Location Brief link
- business requirements
- business priorities
- questions to validate
- recommendation summary
- customer notes

The broker cannot see customer name, email, or phone before accepting.

## Referral Acceptance And Contact Reveal

The broker first chooses:

- Accept Referral
- Decline Referral

Accepting records:

- status = accepted
- accepted_at

After accepting, the broker sees a confirmation step:

```text
Reveal Customer Contact Information
```

Only after this confirmation does Rofo reveal:

- customer name
- email
- phone

The reveal step records:

- contact_revealed_at

Declining records:

- status = declined
- declined_at

Declined referrals do not expose customer contact information.

## Referral Audit Trail

N2 tracks:

- referral sent
- referral page viewed
- accepted
- declined
- contact revealed

Email-open tracking is not implemented in N2. The schema includes `email_opened_at` for future provider webhook support.

## Referral Token Security

Referral tokens are separate from broker invitation tokens.

Referral tokens are:

- secure random values
- stored as hashes
- expiring
- consumed when declined or when contact is revealed

Customer contact information must never appear before:

```text
Accept Referral
↓
Reveal Customer Contact Information
```

## Future Referral Workflow Enhancements

The future referral workflow should support:

- selecting one or more broker partners for a Location Brief
- sending the Location Brief referral to selected brokers
- tracking whether the broker email was opened
- tracking whether the broker viewed the Location Brief
- allowing the broker to accept or reject the referral
- recording referral status by broker
- showing all sent leads, accepted referrals, and rejected referrals by broker
- giving admins a complete broker referral history

## Privacy Principle

Customer contact information should not be exposed to a broker until referral acceptance once the broker acceptance workflow exists.

The Location Brief should provide enough business context for a broker to evaluate fit without requiring immediate customer contact visibility.

## Relationship To OfficeFinder

The broker partner directory does not replace OfficeFinder.

For N1:

- existing OfficeFinder routing remains unchanged
- existing lead submission remains unchanged
- existing Lead Dashboard action buttons remain unchanged
- broker partners are an additive operational layer

Future referral workflows may allow Rofo to route Location Briefs to OfficeFinder, selected broker partners, or both, while keeping the Location Brief as the canonical Rofo product object.
