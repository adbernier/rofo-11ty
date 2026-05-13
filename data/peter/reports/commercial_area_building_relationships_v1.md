# Commercial Area Building Relationships v1

Date: 2026-05-13

This report summarizes the first commercial area to building relationship layer for the initial five Rofo commercial geography markets.

Dataset: `data/peter/research/commercial_area_building_relationships_v1.json`

## Scope and Method

Relationships were created by matching current Rofo building pages to Peter `building_signals.csv` coordinates by `semantic_source_building_id` when available, then normalized address fallback. Buildings were assigned only to commercial area centroids in the same city/state and only when distance and profile signals were coherent.

This is not polygon-perfect GIS. It is a conservative internal relationship graph for review, internal linking planning, and enrichment strategy.

## Summary

| Metric | Count |
| --- | ---: |
| Current building pages in target markets | 301 |
| Target-market pages with coordinate match | 281 |
| Relationships created | 196 |
| High-confidence relationships | 112 |
| Medium-confidence relationships | 84 |
| Area summaries with relationships | 41 |

## Relationships by Market

| Market | Relationships |
| --- | ---: |
| Austin, TX | 36 |
| Chicago, IL | 26 |
| Denver, CO | 24 |
| Oakland, CA | 31 |
| San Francisco, CA | 79 |

## Match Methods

| Match method | Count |
| --- | ---: |
| normalized_address | 194 |
| building_id | 2 |

## Strongest Area and Building Clusters

| Area | Market | Relationships | High confidence | Dominant patterns | Orientation |
| --- | --- | ---: | ---: | --- | --- |
| Hayes Valley | San Francisco, CA | 18 | 2 | retail (48), office (24) | office-heavy, retail-oriented, startup/creative office, mixed-use commercial |
| Financial District | San Francisco, CA | 17 | 13 | office (52), retail (16), coworking (4) | office-heavy, retail-oriented |
| The Domain | Austin, TX | 15 | 0 | office (56), retail (4), coworking (1) | office-heavy, retail-oriented, startup/creative office, mixed-use commercial |
| Union Square | San Francisco, CA | 14 | 12 | retail (52), office (4) | office-heavy, retail-oriented |
| Jackson Square | San Francisco, CA | 13 | 7 | retail (32), office (20), coworking (2) | office-heavy, retail-oriented, startup/creative office |
| Uptown Oakland | Oakland, CA | 9 | 9 | office (36), coworking (1) | office-heavy, retail-oriented, startup/creative office, mixed-use commercial |
| Civic Center | San Francisco, CA | 9 | 7 | retail (24), office (12) | office-heavy, retail-oriented, mixed-use commercial |
| Downtown Oakland | Oakland, CA | 8 | 8 | office (32), coworking (1) | office-heavy, retail-oriented |
| Downtown Austin | Austin, TX | 8 | 3 | office (32), coworking (3) | office-heavy, retail-oriented, startup/creative office |
| Sun Valley | Denver, CO | 7 | 5 | industrial (24), retail (4) | logistics-oriented, mixed-use commercial |
| West Loop | Chicago, IL | 5 | 5 | office (20), coworking (3) | office-heavy, retail-oriented, startup/creative office, mixed-use commercial |
| North Burnet-Gateway | Austin, TX | 5 | 1 | office (20) | office-heavy, retail-oriented, startup/creative office, mixed-use commercial |
| The Loop | Chicago, IL | 4 | 4 | office (16), coworking (3) | office-heavy, retail-oriented |
| Denver Tech Center | Denver, CO | 4 | 3 | office (16), coworking (3) | office-heavy |
| West Oakland | Oakland, CA | 4 | 2 | retail (8), office (4), industrial (4) | logistics-oriented, startup/creative office, mixed-use commercial |
| Warehouse District | Austin, TX | 4 | 2 | office (16), coworking (1) | office-heavy, retail-oriented, mixed-use commercial |
| Hegenberger Corridor | Oakland, CA | 4 | 0 | industrial (16) | office-heavy, retail-oriented, logistics-oriented |
| Streeterville | Chicago, IL | 3 | 3 | office (12), coworking (2) | office-heavy, retail-oriented |
| River North | Chicago, IL | 3 | 3 | office (12), coworking (1) | office-heavy, retail-oriented, mixed-use commercial |
| Fulton Market | Chicago, IL | 3 | 3 | office (12), coworking (1) | office-heavy, retail-oriented, startup/creative office, mixed-use commercial |

## Highest-Confidence Assignments

| Building | Area | Market | Distance km | Activity | Reason |
| --- | --- | --- | ---: | ---: | --- |
| Denver Place | Central Business District | Denver, CO | 0.244 | 179 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| 1600 Broadway | Central Business District | Denver, CO | 0.637 | 120 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| Oakland City Center | Downtown Oakland | Oakland, CA | 0.376 | 106 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| 1333 Broadway | Downtown Oakland | Oakland, CA | 0.423 | 106 | building proximity, normalized address match, office profile alignment, high historical listing activity |
| Downtown Oakland | Uptown Oakland | Oakland, CA | 0.007 | 99 | building proximity, normalized address match, office profile alignment, meaningful historical listing activity |
| 44 Montgomery | Financial District | San Francisco, CA | 0.173 | 91 | building proximity, normalized address match, office profile alignment, meaningful historical listing activity |
| 50 California St | Jackson Square | San Francisco, CA | 0.411 | 90 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| 1814 Franklin St | Downtown Oakland | Oakland, CA | 0.389 | 84 | building proximity, normalized address match, office profile alignment, meaningful historical listing activity |
| Lake Merritt | Uptown Oakland | Oakland, CA | 0.516 | 74 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| Pacific Gateway Bldg. | Financial District | San Francisco, CA | 0.556 | 62 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| 1 Kaiser Plz | Uptown Oakland | Oakland, CA | 0.327 | 61 | building proximity, normalized address match, office profile alignment, meaningful historical listing activity |
| 580 California | Financial District | San Francisco, CA | 0.328 | 56 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| One Sansome St | Financial District | San Francisco, CA | 0.089 | 53 | building proximity, normalized address match, retail profile alignment, meaningful historical listing activity |
| 505 Montgomery | Financial District | San Francisco, CA | 0.362 | 48 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| 401 North Michigan | Streeterville | Chicago, IL | 0.585 | 48 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| 2 Embarcadero Ctr | Jackson Square | San Francisco, CA | 0.283 | 44 | building proximity, normalized address match, office profile alignment, meaningful historical listing activity |
| 2101 Webster St | Uptown Oakland | Oakland, CA | 0.16 | 43 | building proximity, normalized address match, office profile alignment, meaningful historical listing activity |
| Fox Plaza | Civic Center | San Francisco, CA | 0.31 | 38 | building proximity, normalized address match, office profile alignment, meaningful historical listing activity |
| 1300 Clay St | Downtown Oakland | Oakland, CA | 0.393 | 37 | building proximity, normalized address match, office profile alignment, meaningful historical listing activity |
| 1100 Grant Ave | Jackson Square | San Francisco, CA | 0.532 | 35 | building proximity, normalized address match, retail profile alignment, meaningful historical listing activity |
| One Magnificent Mile Center | Magnificent Mile | Chicago, IL | 0.533 | 34 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| 2100 Franklin St | Uptown Oakland | Oakland, CA | 0.16 | 33 | building proximity, normalized address match, office profile alignment, meaningful historical listing activity |
| 315 Montgomery | Financial District | San Francisco, CA | 0.183 | 33 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| Golden Gate Ð 75 Broadway | Jackson Square | San Francisco, CA | 0.254 | 33 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| Spaces 111 Congress | Downtown Austin | Austin, TX | 0.388 | 33 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| DTC Corporate Center III | Denver Tech Center | Denver, CO | 0.637 | 32 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| SOMA | SoMa | San Francisco, CA | 0.2 | 31 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| John Hancock Tower | Magnificent Mile | Chicago, IL | 0.322 | 31 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| West Loop 200 South Wacker | West Loop | Chicago, IL | 0.74 | 30 | building proximity, normalized address match, office profile alignment, flexible office profile alignment |
| 1440 Broadway | Downtown Oakland | Oakland, CA | 0.375 | 29 | building proximity, normalized address match, office profile alignment, meaningful historical listing activity |

## Weak or Ambiguous Areas

| Area | Market | Relationship count | High confidence | Notes |
| --- | --- | ---: | ---: | --- |
| Coliseum Industrial | Oakland, CA | 2 | 0 | Needs more building data, better geometry, or manual review. |
| Hegenberger Corridor | Oakland, CA | 4 | 0 | Needs more building data, better geometry, or manual review. |
| Jack London Square | Oakland, CA | 2 | 1 | Needs more building data, better geometry, or manual review. |
| Old Oakland | Oakland, CA | 2 | 2 | Needs more building data, better geometry, or manual review. |
| Bayview | San Francisco, CA | 1 | 0 | Needs more building data, better geometry, or manual review. |
| Mission Bay | San Francisco, CA | 3 | 0 | Needs more building data, better geometry, or manual review. |
| SoMa | San Francisco, CA | 1 | 1 | Needs more building data, better geometry, or manual review. |
| Ballpark | Denver, CO | 1 | 1 | Needs more building data, better geometry, or manual review. |
| Capitol Hill | Denver, CO | 1 | 0 | Needs more building data, better geometry, or manual review. |
| Globeville | Denver, CO | 2 | 0 | Needs more building data, better geometry, or manual review. |
| Clybourn Corridor | Chicago, IL | 1 | 0 | Needs more building data, better geometry, or manual review. |
| Magnificent Mile | Chicago, IL | 2 | 2 | Needs more building data, better geometry, or manual review. |
| South Loop | Chicago, IL | 2 | 1 | Needs more building data, better geometry, or manual review. |
| Congress Avenue Historic District | Austin, TX | 1 | 1 | Needs more building data, better geometry, or manual review. |
| East Cesar Chavez | Austin, TX | 1 | 0 | Needs more building data, better geometry, or manual review. |
| South Lamar | Austin, TX | 1 | 1 | Needs more building data, better geometry, or manual review. |
| Tech Ridge | Austin, TX | 1 | 0 | Needs more building data, better geometry, or manual review. |
| The Domain | Austin, TX | 15 | 0 | Needs more building data, better geometry, or manual review. |

Areas with no relationships are not listed in the relationship summary and should not be interpreted as commercially irrelevant; they may lack coordinate-matched live buildings or need better geometry.

## Recommendations for Future Polygon Work

- Add verified polygons for downtown cores and compact districts first: Financial District, SoMa, Downtown Oakland, LoDo, The Loop, West Loop, and Fulton Market.
- Treat corridors as line or buffered street geometries rather than broad centroid-radius areas.
- Keep submarket geometries separate from neighborhood geometries, especially Denver Tech Center, The Domain, North Burnet-Gateway, and Hegenberger Corridor.
- Store assignment confidence separately from geometry confidence.

## Recommendations for Neighborhood Page Enrichment

- Use high-confidence relationships to select representative buildings, not inventory lists.
- Use area summaries for commercial profile chips such as office-heavy, retail-oriented, logistics-oriented, or mixed-use commercial.
- Avoid wording that implies exact boundary membership until geometry is reviewed.
- Pages should say buildings are examples in or near the area when assignment is approximate.

## Recommendations for Building-Page Inheritance

- A building can inherit a primary commercial area label only when confidence is high.
- Medium-confidence relationships should remain internal or be phrased as nearby area context.
- Building pages should inherit only durable area profile language, not stale listing activity.
- Keep `primary_area_id` distinct from `secondary_area_ids` for future breadcrumbs, nearby links, and related market modules.

## Opportunities for Lead Routing Improvements

- Use area IDs as future routing context after enough leads and broker coverage exist.
- Do not route solely by area yet; city and space type should remain primary.
- For dense office districts, area context can help qualify broker handoff notes.
- For industrial corridors, area context can help distinguish logistics-oriented requests from general office/retail leads.

## Caveats

- This dataset is research-only.
- It does not generate pages, routes, sitemap entries, or public UI.
- It intentionally leaves many buildings unassigned.
- Distance-to-centroid is approximate and not a substitute for reviewed polygons.
