# Relationship Validation V1 Report

Date: 2026-05-21

Input:

- `data/geography/relationships.json`
- `data/geography/nodes.json`
- `data/geography/aliases.json`

Output:

- `data/geography/relationships.enriched.json`

## Summary

Relationship Validation V1 enriches legacy geography relationships with distance, reciprocity, same-state and same-region signals. It does not promote anything directly into public page rendering.

Promotion statuses are conservative:

- `candidate_public`: strong enough to become a public comparison candidate after editorial review.
- `editorial_review`: plausible but needs human interpretation before use.
- `internal_seed`: useful infrastructure seed, not public-ready.
- `suppress`: missing nodes, self-links, or geography that appears too weak/misleading for public use.

## Counts

| Metric | Count |
| --- | ---: |
| Total relationships processed | 3487 |
| Suppressed relationships | 4 |
| Candidate public relationships | 1304 |
| Editorial review relationships | 1071 |
| Internal seed relationships | 1108 |
| Reciprocal relationships | 1420 |
| Relationships with computed distance | 3298 |
| Missing-node issues | 0 |

## Scoring Model

Positive signals:

- reciprocal relationship
- reasonable computed distance
- same legacy metro/region or parent market
- same state

Negative signals:

- missing source or target node
- self-link
- very large distance without shared market support
- source or target node already marked `needs_review`

Scores are internal triage aids only. They should not be displayed publicly.

## Top Reciprocal Pairs

| Relationship | Source | Target | Distance | Score | Promotion |
| --- | --- | --- | --- | --- | --- |
| legacy-nearby-city:194:99:1 | El Sobrante | Pinole | 1 | 90 | candidate_public |
| legacy-nearby-city:264:343:1 | South Gate | Lynwood | 1 | 90 | candidate_public |
| legacy-nearby-city:343:264:1 | Lynwood | South Gate | 1 | 90 | candidate_public |
| legacy-nearby-city:99:194:4 | Pinole | El Sobrante | 1 | 90 | candidate_public |
| legacy-nearby-city:113:114:3 | Kentfield | Larkspur | 1.2 | 90 | candidate_public |
| legacy-nearby-city:114:113:6 | Larkspur | Kentfield | 1.2 | 90 | candidate_public |
| legacy-nearby-city:120:230:4 | Sausalito | Marin City | 1.2 | 90 | candidate_public |
| legacy-nearby-city:230:120:1 | Marin City | Sausalito | 1.2 | 90 | candidate_public |
| legacy-nearby-city:112:118:4 | Fairfax | San Anselmo | 1.3 | 90 | candidate_public |
| legacy-nearby-city:118:112:3 | San Anselmo | Fairfax | 1.3 | 90 | candidate_public |
| legacy-nearby-city:111:114:55 | Corte Madera | Larkspur | 1.4 | 90 | candidate_public |
| legacy-nearby-city:114:111:1 | Larkspur | Corte Madera | 1.4 | 90 | candidate_public |
| legacy-nearby-city:121:140:6 | Tiburon | Belvedere | 1.5 | 90 | candidate_public |
| legacy-nearby-city:140:121:3 | Belvedere | Tiburon | 1.5 | 90 | candidate_public |
| legacy-nearby-city:290:376:2 | Laguna Woods | Lake Forest | 1.5 | 90 | candidate_public |
| legacy-nearby-city:317:385:1 | Pico Rivera | Montebello | 1.5 | 90 | candidate_public |
| legacy-nearby-city:376:290:2 | Lake Forest | Laguna Woods | 1.5 | 90 | candidate_public |
| legacy-nearby-city:385:317:2 | Montebello | Pico Rivera | 1.5 | 90 | candidate_public |
| legacy-nearby-city:268:342:1 | Sierra Madre | Arcadia | 1.6 | 90 | candidate_public |
| legacy-nearby-city:340:367:1 | Hermosa Beach | Manhattan Beach | 1.6 | 90 | candidate_public |


## Longest-Distance Relationships

| Relationship | Source | Target | Distance | Same Market | Promotion |
| --- | --- | --- | --- | --- | --- |
| legacy-nearby-city:19682:2693:6 | Schaumburg | Hanover | 884 | false | suppress |
| legacy-nearby-city:352:174:4 | Coronado | Roseville | 479.3 | false | suppress |
| legacy-nearby-city:6675:7269:1 | Alexandria | Rose Hill | 373.9 | false | suppress |
| legacy-nearby-city:458:199:3 | Beverly Hills | Brentwood | 324.7 | false | suppress |
| legacy-nearby-city:211:225:1 | Pacheco | Shasta Lake | 185.5 | true | internal_seed |
| legacy-nearby-city:211:171:2 | Pacheco | Redding | 179.5 | true | internal_seed |
| legacy-nearby-city:211:409:3 | Pacheco | Anderson | 170.8 | true | internal_seed |
| legacy-nearby-city:211:292:4 | Pacheco | Cottonwood | 166.6 | true | internal_seed |
| legacy-nearby-city:19824:20304:3 | Chicago | Hammond | 152.4 | false | editorial_review |
| legacy-nearby-city:211:218:5 | Pacheco | Red Bluff | 151.7 | true | internal_seed |
| legacy-nearby-city:443:276:1 | La Jolla | Universal City | 108.7 | false | editorial_review |
| legacy-nearby-city:208:171:2 | Susanville | Redding | 91.4 | true | internal_seed |
| legacy-nearby-city:208:225:3 | Susanville | Shasta Lake | 91.3 | true | internal_seed |
| legacy-nearby-city:208:409:4 | Susanville | Anderson | 86.5 | true | internal_seed |
| legacy-nearby-city:208:292:5 | Susanville | Cottonwood | 86 | true | internal_seed |
| legacy-nearby-city:208:218:6 | Susanville | Red Bluff | 85.7 | true | internal_seed |
| legacy-nearby-city:147:175:3 | Chico | Sacramento | 83.8 | true | internal_seed |
| legacy-nearby-city:208:147:1 | Susanville | Chico | 76.9 | true | internal_seed |
| legacy-nearby-city:147:188:1 | Chico | Woodland | 74.8 | true | internal_seed |
| legacy-nearby-city:29448:29588:1 | Yakima | Kennewick | 69 | false | internal_seed |


## Missing-Node Issues

_None._


## Suppressed Sample

| Relationship | Source | Target | Distance | Reason |
| --- | --- | --- | --- | --- |
| legacy-nearby-city:19682:2693:6 | Schaumburg | Hanover | 884 | large distance / weak market support |
| legacy-nearby-city:352:174:4 | Coronado | Roseville | 479.3 | large distance / weak market support |
| legacy-nearby-city:6675:7269:1 | Alexandria | Rose Hill | 373.9 | large distance / weak market support |
| legacy-nearby-city:458:199:3 | Beverly Hills | Brentwood | 324.7 | large distance / weak market support |


## Recommended Next Step

Run a region-focused editorial validation pass for high-priority metros, starting with Atlanta and the Bay Area. For each `candidate_public` or `editorial_review` relationship, add a short commercial rationale before using it in public district comparison logic.

The next enrichment layer should add raw corpus support:

- shared lead/listing/building corpus evidence
- district-level assignment where available
- relationship rationale candidates
- editorial approval status

Until that layer exists, `relationships.enriched.json` should remain infrastructure only.
