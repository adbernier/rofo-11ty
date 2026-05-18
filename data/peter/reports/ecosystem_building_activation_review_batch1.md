# Ecosystem Building Activation Review Batch 1

This is a small human-review batch selected from `suggested_status = expand` candidates in `ecosystem_building_expansion_phase1.json`. It does not generate pages, alter templates, update sitemap entries, or revive stale inventory.

## Summary

- Batch size: 63
- Source expand candidates: 239
- Review status: all records are `pending`
- Selection bias: high activity, clean address, high coordinate quality, low duplicate risk, and priority weak-live-coverage markets

## Selected Markets

| market | selected_candidates |
| --- | --- |
| Sarasota, FL | 7 |
| Pensacola, FL | 7 |
| Fort Wayne, IN | 7 |
| Grand Rapids, MI | 7 |
| Knoxville, TN | 7 |
| Chattanooga, TN | 7 |
| Baton Rouge, LA | 7 |
| Albuquerque, NM | 7 |
| Shreveport, LA | 7 |

## Candidate Counts By Market

| market | expand_available | selected | not_selected |
| --- | --- | --- | --- |
| Sarasota, FL | 12 | 7 | 5 |
| Pensacola, FL | 7 | 7 | 0 |
| Fort Wayne, IN | 18 | 7 | 11 |
| Grand Rapids, MI | 8 | 7 | 1 |
| Knoxville, TN | 15 | 7 | 8 |
| Chattanooga, TN | 12 | 7 | 5 |
| Baton Rouge, LA | 15 | 7 | 8 |
| Albuquerque, NM | 23 | 7 | 16 |
| Wilmington, NC | 0 | 0 | 0 |
| Shreveport, LA | 17 | 7 | 10 |

## Space-Type Mix Summary

| space_type | historical_activity_count_in_batch |
| --- | --- |
| office | 4459 |
| retail | 1611 |
| industrial | 585 |
| land | 24 |
| flex | 1 |

Notes:

- Space types use the decoded legacy lookup and remain historical/contextual only.
- Coworking and medical are not inferred from numeric codes.
- Land-only candidates in this batch: 0. These need extra review because normal building-page UX may not fit land or redevelopment parcels.

## Duplicate And Coordinate Risks

- Coordinate quality: Counter({'high': 63})
- Duplicate risk: Counter({'low': 63})
- All selected records require manual review before any hidden/noindex prototype or production promotion.

## Sample Proposed Public Titles And Descriptions

| market | title | activity | description |
| --- | --- | --- | --- |
| Sarasota, FL | 3950 Central Sarasota Pkwy | 179 | Rofo has historical commercial activity for this Sarasota address, with prior signals related to retail use. |
| Sarasota, FL | 1991 Main St | 156 | Rofo has historical commercial activity for this Sarasota address, with prior signals related to office and retail use. |
| Sarasota, FL | 8586 Potter Park Dr | 117 | Rofo has historical commercial activity for this Sarasota address, with prior signals related to office use. |
| Sarasota, FL | 1900 Main St | 107 | Rofo has historical commercial activity for this Sarasota address, with prior signals related to office and retail use. |
| Sarasota, FL | 1445 2nd St | 94 | Rofo has historical commercial activity for this Sarasota address, with prior signals related to retail and land or development-oriented commercial use. |
| Sarasota, FL | 5500 Bee Ridge Rd | 82 | Rofo has historical commercial activity for this Sarasota address, with prior signals related to office use. |
| Sarasota, FL | 5940 McIntosh Rd | 73 | Rofo has historical commercial activity for this Sarasota address, with prior signals related to office and land or development-oriented commercial use. |
| Pensacola, FL | 1720 W Fairfield Dr | 168 | Rofo has historical commercial activity for this Pensacola address, with prior signals related to office use. |
| Pensacola, FL | 7171 N Davis Hwy | 82 | Rofo has historical commercial activity for this Pensacola address, with prior signals related to retail, office, and land or development-oriented commercial use. |
| Pensacola, FL | 5113 N Davis Hwy | 79 | Rofo has historical commercial activity for this Pensacola address, with prior signals related to office use. |

## Recommended Review Checklist

- Confirm the address is a real commercial building or commercially meaningful property.
- Confirm the address is not already represented by an active Rofo building page under a different title.
- Suppress land-only candidates unless there is a specific future land/development page model.
- Confirm historical activity mix feels durable and not listing-specific.
- Remove or rewrite any title that looks like marketing copy rather than an address.
- Do not expose suite numbers, pricing, availability, move-in language, or stale listing descriptions.
- Prefer address-first titles unless a durable building name is verified.

## Hidden Prototype Recommendation

These should become hidden/noindex building prototypes before any indexed rollout. The safest next step is to promote 20 to 30 reviewed records from this batch into a prototype-only dataset, then inspect generated pages for duplicate routes, thin copy, and building identity quality.

## Priority Market Gaps

- Wilmington, NC had 0 `expand` candidates in the current source set

## Output

- `data/peter/normalized/ecosystem_building_activation_review_batch1.json`
