# Bay Area Building to Neighborhood Assignment Report

Buildings were assigned to the nearest neighborhood centroid within the same city. This is a lightweight approximation, not polygon GIS.

Total assigned buildings: 53,247

## Assignment Confidence Breakdown

| assignment_confidence | building_count |
| --- | --- |
| high | 41370 |
| medium | 11052 |
| low | 825 |

## Neighborhoods With Most Assigned Buildings

| city | neighborhood_name | assigned_building_count |
| --- | --- | --- |
| San Francisco | Mission District | 1623 |
| San Francisco | Panhandle | 1195 |
| San Francisco | Bernal Heights | 1167 |
| San Francisco | Richmond District | 1033 |
| San Francisco | Golden Gate Park | 968 |
| Alameda | West Alameda | 858 |
| San Francisco | Nob Hill | 851 |
| San Francisco | Inner Sunset | 802 |
| San Francisco | Lower Nob Hill | 800 |
| San Francisco | Civic Center | 784 |
| San Francisco | Presidio Heights | 758 |
| San Francisco | Bayview | 733 |
| San Francisco | Mission Dolores | 725 |
| San Francisco | Noe Valley | 717 |
| Berkeley | Southside | 707 |
| San Francisco | Chinatown | 687 |
| Berkeley | Central Berkeley | 667 |
| Redwood City | Centennial | 648 |
| San Francisco | Russian Hill | 630 |
| San Francisco | Potrero Hill | 615 |
| South San Francisco | El Camino | 592 |
| San Francisco | Alamo Square | 579 |
| Redwood City | Redwood Oaks | 570 |
| San Francisco | Pacific Heights | 541 |
| Walnut Creek | Meadow Creek | 527 |
| San Francisco | The Castro | 524 |
| San Francisco | South of Market | 494 |
| San Francisco | Marina District | 481 |
| San Francisco | Sunset District | 476 |
| Berkeley | North Berkeley | 471 |

## Suspiciously Large Assignment Counts

| city | neighborhood_name | assigned_building_count |
| --- | --- | --- |
| San Francisco | Mission District | 1623 |
| San Francisco | Panhandle | 1195 |
| San Francisco | Bernal Heights | 1167 |
| San Francisco | Richmond District | 1033 |
| San Francisco | Golden Gate Park | 968 |
| Alameda | West Alameda | 858 |
| San Francisco | Nob Hill | 851 |
| San Francisco | Inner Sunset | 802 |
| San Francisco | Lower Nob Hill | 800 |
| San Francisco | Civic Center | 784 |
| San Francisco | Presidio Heights | 758 |
| San Francisco | Bayview | 733 |

## Recommendations

- Replace centroid matching with reviewed polygons or radius rules before public neighborhood pages.
- Review neighborhoods with large assignment counts because citywide or sparse neighborhood coverage can overassign to one centroid.
- Keep assignment confidence visible in internal datasets so downstream AI/search systems can weight weaker assignments conservatively.
- Continue treating listing activity as historical leasing intensity, not live availability.
