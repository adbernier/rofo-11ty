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
