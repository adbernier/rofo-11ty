# Commercial Area Entity System v1

Date: 2026-05-13

This report summarizes the first reviewed commercial area entity dataset for Rofo's canonical commercial geography layer.

Dataset:

- `data/peter/research/commercial_area_entities_v1.json`

This is not a page-generation dataset yet. It is a normalized naming and entity layer for future building assignment, internal linking, neighborhood/submarket pages, and market context.

## Scope

Initial markets:

- San Francisco, CA
- Oakland, CA
- Denver, CO
- Austin, TX
- Chicago, IL

Principles used:

- Use recognized real-world commercial geography only.
- Do not invent corridor or district names.
- Prefer commercially meaningful neighborhoods, districts, corridors, submarkets, downtown cores, and industrial areas.
- Treat centroids as approximate only.
- Do not treat this as a polygon or boundary project.
- Do not generate pages from this file without a later launch review.

## Dataset Summary

| Metric | Count |
| --- | ---: |
| Total entities | 50 |
| San Francisco entities | 10 |
| Oakland entities | 10 |
| Denver entities | 10 |
| Austin entities | 10 |
| Chicago entities | 10 |
| High-confidence entities | 33 |
| Medium-confidence entities | 17 |

Entity types:

| Area type | Count |
| --- | ---: |
| district | 20 |
| neighborhood | 9 |
| industrial_area | 6 |
| corridor | 6 |
| downtown_core | 5 |
| submarket | 4 |

## Strongest Commercial Districts

Strongest near-term candidates by market:

| Market | Strongest entities | Why |
| --- | --- | --- |
| San Francisco | Financial District, SoMa, Mission Bay, Union Square, Jackson Square | Strong recognition, existing Rofo neighborhood support, and clear office/retail/mixed-use relevance. |
| Oakland | Downtown Oakland, Uptown Oakland, Jack London Square, Old Oakland, West Oakland | Existing Rofo support plus strong public-review neighborhood history. |
| Denver | Central Business District, LoDo, River North Art District, Denver Tech Center, Ballpark | Existing Rofo support for most, clear office/mixed-use/submarket identity. |
| Austin | Downtown Austin, Warehouse District, Congress Avenue Historic District, East Austin, North Burnet-Gateway | Strong commercial relevance; some require source reconciliation because older Rofo centroid data is incomplete. |
| Chicago | The Loop, West Loop, Fulton Market, River North, Magnificent Mile | Strong real-world commercial identity, but Chicago needs the next local-source validation pass. |

## Corridor Candidates

Good corridor candidates:

- Congress Avenue Historic District, Austin
- South Congress, Austin
- South Lamar, Austin
- Hegenberger Corridor, Oakland
- Magnificent Mile, Chicago
- Clybourn Corridor, Chicago

Use these carefully. Corridors need a different assignment model than neighborhoods because centroid-radius matching can over-assign nearby buildings. The first version should use manual review or address/street proximity rather than broad radius assignment.

## Neighborhood vs District Balance

The dataset intentionally favors commercial districts and downtown cores over purely residential micro-neighborhoods.

San Francisco and Oakland have the strongest local Rofo neighborhood support. Denver and Austin have useful resolved candidates, but some commercially important areas need source reconciliation. Chicago is commercially important but underrepresented in the resolved candidate extract, so its entities are marked medium confidence.

## Areas Needing Future Review

Priority review areas:

- Chicago: all ten entities need local-source reconciliation because `neighborhoods.resolved-candidates.json` did not return Chicago records in the latest inspection.
- Austin: Downtown Austin, South Congress, The Domain, and Tech Ridge should be reconciled against local source data and city/submarket references.
- Denver: Cherry Creek should be reconciled because it is commercially recognized but was not present in the resolved Rofo neighborhood candidate extract.
- San Francisco: Bayview should be reviewed for naming and boundary convention before public page use.
- Oakland: Coliseum Industrial should be reviewed before any building assignment because industrial-area boundaries matter.

## Building Density Alignment

Best alignment with existing Rofo/Peter data:

- San Francisco Financial District, SoMa, Union Square, Civic Center, Jackson Square
- Oakland Downtown Oakland, Jack London Square, Old Oakland, West Oakland, Hegenberger Corridor
- Denver Central Business District, LoDo, River North Art District, Denver Tech Center
- Austin North Burnet-Gateway, Warehouse District, Congress Avenue Historic District, East Austin

Chicago likely has strong building density alignment in the legacy graph, but the area entity layer needs a Chicago-specific source pass before assignment.

## Building Assignment Strategy

Recommended v1 assignment approach:

1. Use exact city/state filtering first.
2. Use polygons only when a verified polygon source exists.
3. Until polygons exist, use conservative centroid-radius assignment only for internal review.
4. Corridors should use street/name proximity and manual review, not only centroid distance.
5. Submarkets such as Denver Tech Center and The Domain should be treated as broader commercial areas and reviewed separately from municipal neighborhood records.
6. Industrial areas should require higher confidence because false positives can make pages feel inaccurate.
7. Do not expose assignment language publicly as exact boundary membership until reviewed.

Suggested assignment statuses:

- `confirmed`: manually reviewed or polygon-backed
- `probable`: high-quality centroid/street match within city/state
- `approximate`: useful for internal review only
- `unassigned`: do not show publicly

## Future Polygon Work

Recommended next polygon/source work:

- Resolve Chicago neighborhood and commercial district records from a stronger local source.
- Add verified boundaries for downtown cores and high-value commercial districts first.
- Treat corridors as linear geometries where possible.
- Keep polygons separate from canonical entity names so naming can remain stable even when geometry improves.
- Store source attribution, source date, and geometry confidence on every geometry record.

Suggested future geometry fields:

- `commercial_area_id`
- `geometry_type`
- `geometry_source`
- `geometry_source_url`
- `geometry_confidence`
- `geometry_review_status`
- `updated_at`

## Recommended Next Step

Create an assignment prototype for these 50 entities using only internal review output:

- match current and legacy buildings by city/state
- score approximate proximity to entity centroids
- mark all results `approximate`
- produce review lists for the strongest five entities per market
- do not generate pages or public links until assignments are reviewed

For public rollout, start with the strongest high-confidence entities where Rofo already has page-review history:

1. Financial District, San Francisco
2. SoMa, San Francisco
3. Jack London Square, Oakland
4. Downtown Oakland
5. LoDo, Denver
6. River North Art District, Denver
7. Warehouse District, Austin
8. North Burnet-Gateway, Austin

Chicago should wait for a dedicated Chicago source validation pass before public page planning.
