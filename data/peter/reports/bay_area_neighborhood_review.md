# Bay Area Neighborhood Review

This report reviews high-confidence Bay Area neighborhood records from the legacy Rofo neighborhood dataset.

The output is for discovery, geographic understanding, SEO enrichment, and AI retrieval context. It is not live inventory.

## Neighborhood Counts by City

| city | neighborhood_count |
| --- | --- |
| San Francisco | 64 |
| Oakland | 55 |
| San Jose | 35 |
| Walnut Creek | 15 |
| Palo Alto | 12 |
| Sunnyvale | 9 |
| Berkeley | 8 |
| San Mateo | 8 |
| Redwood City | 7 |
| South San Francisco | 6 |
| Mountain View | 5 |
| Alameda | 3 |

## Suspicious or Filtered Names

| neighborhood_id | neighborhood_name | city | lat | lng |
| --- | --- | --- | --- | --- |
| 40034 | South Beach | South San Francisco | 37.79177475 | -122.39220428 |
| 38584 | Redwood Shores | Redwood City | 0.0 | 0.0 |
| 38570 | Marina Lagoon | San Mateo | 0.0 | 0.0 |
| 38545 | Downtown North | Palo Alto | 0.0 | 0.0 |
| 38542 | Old Mountain View | Mountain View | 0.0 | 0.0 |
| 34354 | North San Jose | Santa Clara | 37.38103867 | -121.94120789 |
| 34749 | Presidio Heights | South San Francisco | 37.78839111 | -122.4538269 |
| 35280 | San Francisco | San Francisco | 0.0 | 0.0 |
| 35270 | San Mateo | San Mateo | 0.0 | 0.0 |
| 35261 | Alameda | Alameda | 0.0 | 0.0 |
| 35253 | Redwood City | Redwood City | 0.0 | 0.0 |
| 35240 | Walnut Creek | Walnut Creek | 0.0 | 0.0 |
| 35239 | Palo Alto | Palo Alto | 0.0 | 0.0 |
| 35237 | Mountain View | Mountain View | 0.0 | 0.0 |
| 35235 | Santa Clara | Santa Clara | 0.0 | 0.0 |
| 35219 | South San Francisco | South San Francisco | 0.0 | 0.0 |
| 35213 | Oakland | Oakland | 0.0 | 0.0 |
| 35212 | Emeryville | Emeryville | 0.0 | 0.0 |
| 35211 | Berkeley | Berkeley | 0.0 | 0.0 |
| 35140 | San Jose | San Jose | 0.0 | 0.0 |
| 35132 | Sunnyvale | Sunnyvale | 0.0 | 0.0 |
| 40602 | Laurel Heights | San Francisco | 0.0 | 0.0 |
| 40603 | Central Richmond | San Francisco | 0.0 | 0.0 |
| 40604 | Fisherman's Wharf | San Francisco | 0.0 | 0.0 |
| 40605 | Polk Gulch | San Francisco | 0.0 | 0.0 |
| 40953 | South San Jose | Santa Clara | 37.25166702 | -121.90649414 |
| 42307 | Southwest Berkeley | Emeryville | 37.85043335 | -122.28636169 |
| 42346 | High Street Corridor | Oakland | 0.0 | 0.0 |
| 43188 | Somisspo | San Francisco | 37.76726913 | -122.40670776 |
| 43358 | Inspiration | San Jose | 37.93983841 | -121.72051239 |

## Duplicates

_None._

## Neighborhoods Lacking Geo

_None._

## Recommended High Confidence Pilot Neighborhoods

| neighborhood_name | city | building_count | total_listing_activity | likely_office_cluster | likely_mixed_use |
| --- | --- | --- | --- | --- | --- |
| Financial District | San Francisco | 274 | 1812 | True | True |
| Downtown | Oakland | 471 | 1739 | True | False |
| Downtown San Jose | San Jose | 246 | 1597 | True | True |
| South Beach | San Francisco | 251 | 1585 | True | True |
| River Oaks | San Jose | 351 | 1424 | False | True |
| Central San Jose | San Jose | 246 | 1352 | True | True |
| North San Jose | San Jose | 345 | 1246 | False | True |
| Meadow Creek | Walnut Creek | 527 | 975 | True | False |
| Central East San Francisco | San Francisco | 331 | 915 | True | False |
| Jackson Square | San Francisco | 319 | 808 | True | False |
| Roberts - Walnut Woods | San Jose | 40 | 771 | False | True |
| Rex Manor | Mountain View | 171 | 733 | True | True |
| Centennial | Redwood City | 648 | 689 | True | False |
| Beresford Park | San Mateo | 437 | 674 | True | False |
| Hegenberger Corridor | Oakland | 343 | 627 | True | False |
| SOMA | San Francisco | 205 | 602 | True | False |
| Edenvale | San Jose | 158 | 601 | False | True |
| San Miguel | Sunnyvale | 164 | 578 | False | True |
| Union Square | San Francisco | 132 | 571 | True | False |
| Whisman Station | Mountain View | 142 | 563 | False | True |
| Civic Center | San Francisco | 784 | 528 | True | False |
| South Park | San Francisco | 346 | 513 | True | False |
| Jack London Square | Oakland | 150 | 484 | True | False |
| Redwood Village | Redwood City | 395 | 482 | True | False |
| Downtown Berkeley | Berkeley | 453 | 468 | True | False |

## Notes

- Records were filtered for allowed neighborhoods, nonblank names, unique city slugs, and plausible city-level coordinates.
- The city activity fields are market-level signals, not neighborhood-specific live availability.
- Some legacy records use names from adjacent cities or broad citywide labels. These should be reviewed before public rollout.
