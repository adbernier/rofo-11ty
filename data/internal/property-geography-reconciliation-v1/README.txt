Historical Property → Commercial Geography Reconciliation v1 Deep Review

Decision: B. READY TO SCALE TO NEXT 10 MARKETS WITH QA

This partitioned, internal-only artifact changes no public, Recommendation Intelligence, availability, SEO, or runtime behavior.

| Market | Source properties | Listing observations | Identities | Canonical | Reconciled | Geo linked | Human | Discovery | Reject |
|---|---|---|---|---|---|---|---|---|---|
| San Francisco | 27835 | 14336 | 26236 | 157 | 198 | 0 | 131 | 25866 | 41 |
| Sacramento | 8849 | 16235 | 7450 | 135 | 159 | 3 | 1415 | 5792 | 84 |
| Indianapolis | 4606 | 13539 | 2140 | 23 | 70 | 2 | 204 | 1842 | 24 |
| Denver / Aurora | 6970 | 46030 | 2348 | 53 | 83 | 0 | 278 | 1962 | 25 |
| Orlando | 3654 | 9336 | 1770 | 5 | 18 | 0 | 957 | 771 | 24 |

Baseline → final
- Reconciled internal entities: 1017 → 528
- Reviewed/high-confidence geography links: 64 → 5; 59 candidate-source links downgraded
- Human review: 2497 → 2985
- Discovery only: 36229 → 36233
- Rejected: 201 → 198
- AUTO_RECONCILE_QA reviewed: 644; confirmed 155; downgraded 489
- Municipality conflicts classified: 2442/2442; all out-of-scope relationships remain blocked
- Representative review: 5 strong, 60 possible
- Public review: 5 reviewed-later, 59 need evidence

Automation after review
- AUTO_PROMOTABLE_INTERNAL: 0.9%
- AUTO_RECONCILE_QA: 0.4%
- HUMAN_REVIEW: 7.5%
- DISCOVERY_ONLY: 90.7%
- REJECT: 0.5%

Threshold assessment: APPROPRIATE in principle, but v1 was too permissive about multiple legacy IDs and candidate-level geography links. The deep-review gates correct both without loosening automation.

Next horizontal recommendation: scale to exactly 10 additional markets with the same partitioned contract and mandatory sampled QA; do not publish properties.
