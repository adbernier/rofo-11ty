# Historical Property → Commercial Geography Reconciliation v1

Internal-only pilot. Nothing here is a public property, availability, Recommendation Intelligence, SEO, or runtime source.

## Decision

**B. V1 SUCCESS — RECONCILE THESE FIVE DEEPER FIRST.** The shared contract works, the known ownership controls resolve correctly, and conservative automation is viable. Geography coverage and review queues are not yet deep enough to scale responsibly.

## Pilot summary

| Market | Source properties | Listing observations | Identities | Canonical | Reconciled | Geo linked | Human | Discovery | Reject |
|---|---|---|---|---|---|---|---|---|---|
| San Francisco | 27835 | 14336 | 26236 | 157 | 318 | 43 | 10 | 25867 | 41 |
| Sacramento | 8849 | 16235 | 7450 | 135 | 216 | 3 | 1355 | 5792 | 87 |
| Indianapolis | 4606 | 13539 | 2140 | 23 | 184 | 2 | 94 | 1838 | 24 |
| Denver / Aurora | 6970 | 46030 | 2348 | 53 | 230 | 16 | 132 | 1961 | 25 |
| Orlando | 3654 | 9336 | 1770 | 5 | 69 | 0 | 906 | 771 | 24 |

## Aggregate

- 51,914 historical property observations representing 39,944 normalized identities and 99,476 historical listing observations.
- 373 canonical matches; 1,017 total reconciled internal entities; 64 reviewed/high-confidence geography links.
- 2,497 human-review identities; 36,229 discovery-only; 201 rejected.
- AUTO_PROMOTABLE_INTERNAL: 0.9%. AUTO_RECONCILE_QA excluding canonical matches: 1.6%.

## Contract

Historical observations retain source identity and historical listing counts. Durable entities contain only normalized identity, municipality, reviewed type where supportable, provenance, and explicit confidence. One durable property may retain many legacy IDs. Suite observations and campus/business-park ambiguity enter human review rather than becoming buildings.

### Fact safety

- Durable: normalized address, stable identity, verified municipality, reviewed parent geography.
- Durable if independently verified: property type, physical attributes, representative role, and media rights.
- Time-sensitive and excluded: availability, rent, occupancy, broker contact, parking availability, and current amenities.
- Never reused without independent verification: marketing claims, loading, clear height, power, yard, trailer capacity, permitted use, hazardous capability, and tenant suitability.

All media defaults to RIGHTS_UNKNOWN. Public-candidate-later is only assigned to a canonical property with a reviewed/high-confidence geography and reviewed type; it is not publication approval.

## Next horizontal sprint

Run a bounded five-market reconciliation review: resolve municipality conflicts first, review the 644 non-canonical AUTO_RECONCILE_QA records by deterministic samples and high-value queues, adjudicate the three canonical type conflicts, and promote no additional geography until reviewed boundaries exist.

Machine-readable output: `data/internal/property-geography-reconciliation-v1/pilot-reconciliation.json`.
