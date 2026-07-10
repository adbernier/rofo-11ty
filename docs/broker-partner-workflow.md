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

## Future N2 Referral Workflow

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
