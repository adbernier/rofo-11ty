# Active Building Semantic Match Quality

## Purpose

This audit evaluates whether normalized address fallback matching is trustworthy enough to use the active building semantic bridge. It is for internal review only and does not change production pages.

## Summary

- Total matched bridge records audited: 961
- Likely safe low-risk matches: 111
- Questionable medium-risk matches: 534
- High-risk matches: 316
- Matched by internal semantic source ID: 111
- Matched by normalized address fallback: 850

The bridge is useful for internal review and limited prototype exploration, but it should not be treated as production-ready until representative low, medium, and high risk examples are manually reviewed. The low-risk subset can now match by internal `semantic_source_building_id`; the remaining records still depend on normalized address fallback.

## Signal Quality by Match Risk

| signal | total | low | medium | high |
| --- | --- | --- | --- | --- |
| freeway_access | 308 | 47 | 184 | 77 |
| retail_storefront | 294 | 0 | 202 | 92 |
| warehouse_distribution | 240 | 47 | 110 | 83 |
| campus_environment | 214 | 29 | 122 | 63 |
| medical_office | 110 | 9 | 79 | 22 |
| transit_oriented | 100 | 8 | 59 | 33 |
| loading_dock | 64 | 13 | 21 | 30 |
| waterfront | 57 | 8 | 38 | 11 |
| professional_services | 24 | 0 | 22 | 2 |
| showroom | 21 | 0 | 15 | 6 |
| creative_office | 13 | 1 | 5 | 7 |

## Signals That Look Cleanest

| signal | total | low | medium | high | low_share |
| --- | --- | --- | --- | --- | --- |

## Signals Needing More Review

| signal | total | low | medium | high | low_share |
| --- | --- | --- | --- | --- | --- |
| freeway_access | 308 | 47 | 184 | 77 | 0.15 |
| retail_storefront | 294 | 0 | 202 | 92 | 0.0 |
| warehouse_distribution | 240 | 47 | 110 | 83 | 0.2 |
| campus_environment | 214 | 29 | 122 | 63 | 0.14 |
| medical_office | 110 | 9 | 79 | 22 | 0.08 |
| transit_oriented | 100 | 8 | 59 | 33 | 0.08 |
| loading_dock | 64 | 13 | 21 | 30 | 0.2 |
| waterfront | 57 | 8 | 38 | 11 | 0.14 |
| professional_services | 24 | 0 | 22 | 2 | 0.0 |
| showroom | 21 | 0 | 15 | 6 | 0.0 |
| creative_office | 13 | 1 | 5 | 7 | 0.08 |

## 50 Strongest Low-Risk Examples

| production | semantic | city | state | signals | avg_conf | support | name_score | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15 Constitution Dr | 15 Constitution Dr | Bedford | NH | freeway_access | 0.98 | 131 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Paradise Valley Center | Paradise Valley Center | Phoenix | AZ | campus_environment | 0.97 | 13 | 1.0 | strong address alignment, name alignment, confidence, and support |
| The Gonic Mill | The Gonic Mill | Rochester | NH | loading_dock, warehouse_distribution | 0.95 | 47 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Rare Ormsby III Sublease | Rare Ormsby III Sublease | Louisville | KY | campus_environment | 0.95 | 37 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Old Orchard | Old Orchard | Skokie | IL | freeway_access | 0.95 | 25 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Brickell Key | Brickell Key | Miami | FL | waterfront | 0.93 | 22 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Quorum | Quorum | Dallas | TX | freeway_access | 0.89 | 19 | 1.0 | strong address alignment, name alignment, confidence, and support |
| North Stone Oak | North Stone Oak | San Antonio | TX | freeway_access | 0.89 | 14 | 1.0 | strong address alignment, name alignment, confidence, and support |
| South Land Park Office Center | South Land Park Office Center | Sacramento | CA | medical_office | 0.88 | 12 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Lakepoint Business Park | Lakepoint Business Park | Novato | CA | warehouse_distribution, campus_environment | 0.865 | 17 | 1.0 | strong address alignment, name alignment, confidence, and support |
| San Diego - Barnes Canyon Rd | San Diego - Barnes Canyon Rd | San Diego | CA | warehouse_distribution, freeway_access | 0.86 | 101 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Abrams Westview Plaza | Abrams Westview Plaza | San Diego | CA | freeway_access | 0.85 | 11 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Heron Bay | Heron Bay | Coral Springs | FL | campus_environment | 0.85 | 11 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Irvine - Hughes St. | Irvine - Hughes St. | Irvine | CA | warehouse_distribution | 0.85 | 8 | 1.0 | low total historical support |
| Brea Campus | Brea Campus | Brea | CA | campus_environment | 0.84 | 10 | 1.0 | strong address alignment, name alignment, confidence, and support |
| San Diego - Sorrento Valley Rd. | San Diego - Sorrento Valley Rd. | San Diego | CA | warehouse_distribution, freeway_access | 0.835 | 14 | 1.0 | strong address alignment, name alignment, confidence, and support |
| 1220 Augusta | 1220 Augusta | Houston | TX | warehouse_distribution | 0.83 | 12 | 1.0 | strong address alignment, name alignment, confidence, and support |
| The Plaza at River Bend | The Plaza at River Bend | Dallas | TX | freeway_access | 0.83 | 12 | 1.0 | strong address alignment, name alignment, confidence, and support |
| SPACES BELLTOWN | SPACES BELLTOWN | Seattle | WA | transit_oriented, waterfront | 0.81 | 18 | 1.0 | strong address alignment, name alignment, confidence, and support |
| 4602 N 16th St | 4602 N 16th Street | Phoenix | AZ | medical_office | 0.81 | 9 | 0.88 | low total historical support |
| Jack London Square | Jack London Square | Oakland | CA | waterfront | 0.81 | 9 | 1.0 | low total historical support |
| Spaces Menlo Park | Spaces Menlo Park | Menlo Park | CA | waterfront | 0.81 | 9 | 1.0 | low total historical support |
| Spaces Santa Monica | Spaces Santa Monica | Santa Monica | CA | creative_office | 0.81 | 9 | 1.0 | low total historical support |
| Spaces The Dillon | Spaces The Dillon | Raleigh | NC | warehouse_distribution | 0.81 | 9 | 1.0 | low total historical support |
| Farmers Branch - Springlake Business Center | Farmers Branch - Springlake Business Center | Dallas | TX | warehouse_distribution, loading_dock | 0.79 | 60 | 1.0 | strong address alignment, name alignment, confidence, and support |
| 13601 Preston Rd | 13601 Preston Rd | Dallas | TX | warehouse_distribution | 0.78 | 99 | 1.0 | strong address alignment, name alignment, confidence, and support |
| 8500 N. Stemmons Fwy | 8500 N. Stemmons Fwy | Dallas | TX | warehouse_distribution, loading_dock | 0.78 | 86 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Bank of America Tower Plano | Bank of America Tower Plano | Plano | TX | loading_dock, warehouse_distribution | 0.78 | 55 | 1.0 | strong address alignment, name alignment, confidence, and support |
| 10925-10945 Estate Ln | 10925-10945 Estate Ln | Dallas | TX | warehouse_distribution | 0.78 | 50 | 1.0 | strong address alignment, name alignment, confidence, and support |
| 12200-12300 Ford Rd | 12200-12300 Ford Rd | Dallas | TX | warehouse_distribution | 0.78 | 46 | 1.0 | strong address alignment, name alignment, confidence, and support |
| 2351 W. Northwest Hwy | 2351 W. Northwest Hwy | Dallas | TX | warehouse_distribution | 0.78 | 37 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Campus Commons | Campus Commons | Sacramento | CA | campus_environment, freeway_access | 0.78 | 35 | 1.0 | strong address alignment, name alignment, confidence, and support |
| 4100 Alpha Rd | 4100 Alpha Rd | Dallas | TX | warehouse_distribution | 0.78 | 32 | 1.0 | strong address alignment, name alignment, confidence, and support |
| 2300 Valley View Ln | 2300 Valley View Ln | Irving | TX | warehouse_distribution | 0.78 | 26 | 1.0 | strong address alignment, name alignment, confidence, and support |
| South State Commons I | South State Commons I | Ann Arbor | MI | campus_environment, medical_office | 0.78 | 26 | 1.0 | strong address alignment, name alignment, confidence, and support |
| 12000-12100 Ford Rd | 12000-12100 Ford Rd | Dallas | TX | warehouse_distribution | 0.78 | 25 | 1.0 | strong address alignment, name alignment, confidence, and support |
| 9304 Forest Ln | 9304 Forest Ln | Dallas | TX | warehouse_distribution | 0.78 | 24 | 1.0 | strong address alignment, name alignment, confidence, and support |
| 100 Horizon | 100 Horizon | Hamilton Township | NJ | campus_environment | 0.78 | 6 | 1.0 | low total historical support |
| 8204 Elmbrook Dr | 8204 Elmbrook Dr | Dallas | TX | loading_dock, warehouse_distribution | 0.775 | 49 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Cupertino Village | Cupertino Village | Cupertino | CA | campus_environment | 0.77 | 32 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Howard Hughes | Howard Hughes | Los Angeles | CA | freeway_access, campus_environment | 0.77 | 30 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Inner Harbor Center | Inner Harbor Center | Baltimore | MD | waterfront | 0.77 | 28 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Independence Wharf | Independence Wharf | Boston | MA | waterfront | 0.77 | 26 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Santa Clara Commerce Park | Santa Clara Commerce Park | Santa Clara | CA | warehouse_distribution | 0.77 | 23 | 1.0 | strong address alignment, name alignment, confidence, and support |
| 9550 Forest Ln | 9550 Forest Ln | Dallas | TX | warehouse_distribution | 0.77 | 22 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Conshohocken | Conshohocken | Conshohocken | PA | freeway_access, waterfront | 0.765 | 25 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Wells Fargo Building | Wells Fargo Building | Houston | TX | warehouse_distribution | 0.76 | 18 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Irving - Freeport Business Park | Irving - Freeport Business Park | Irving | TX | warehouse_distribution, loading_dock | 0.75 | 20 | 1.0 | strong address alignment, name alignment, confidence, and support |
| San Diego - Rose Canyon | San Diego - Rose Canyon | San Diego | CA | warehouse_distribution | 0.74 | 28 | 1.0 | strong address alignment, name alignment, confidence, and support |
| Dallas - Westwood Business Park | Dallas - Westwood Business Park | Dallas | TX | warehouse_distribution | 0.74 | 27 | 1.0 | strong address alignment, name alignment, confidence, and support |

## 25 Medium-Risk Examples

| production | semantic | city | state | signals | avg_conf | support | name_score | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Downtown Oakland | Downtown Oakland | Oakland | CA | transit_oriented, warehouse_distribution, freeway_access | 0.98 | 114 | 1.0 | 2 semantic records share this normalized address |
| Antoine Crossing | 2800 Antoine Drive | Houston | TX | warehouse_distribution, loading_dock | 0.98 | 76 | 0.588 | production and semantic building names only partially align; 2 semantic records share this normalized address |
| 2101 Webster St | Center Twenty-One | Oakland | CA | transit_oriented | 0.98 | 14 | 0.32 | production and semantic building names differ materially; 2 semantic records share this normalized address |
| 3055 Southwestern Blvd | 3055 Southwestern Blvd | Orchard Park | NY | campus_environment | 0.95 | 20 | 1.0 | 2 semantic records share this normalized address |
| Glenbrook Shopping Center | Glenbrook Shopping Center | Sacramento | CA | retail_storefront | 0.93 | 96 | 1.0 | 2 semantic records share this normalized address; signals are broad tenant or amenity patterns and need manual review |
| Liquor and Wine Store | Liquor and Wine Store | Buffalo | NY | retail_storefront | 0.93 | 54 | 1.0 | 2 semantic records share this normalized address; signals are broad tenant or amenity patterns and need manual review |
| Flowood - Market Street | Flowood - Market Street | Flowood | MS | retail_storefront | 0.93 | 22 | 1.0 | signals are broad tenant or amenity patterns and need manual review |
| Folsom Village Shopping Center | Folsom Village Shopping Center | Folsom | CA | retail_storefront | 0.91 | 29 | 1.0 | 2 semantic records share this normalized address; signals are broad tenant or amenity patterns and need manual review |
| New York Merchandise Mart Plaza | New York Merchandise Mart Plaza | New York | NY | showroom | 0.91 | 17 | 1.0 | limited signal set includes context-dependent signals |
| Roseville Center | Douglas Blvd | Roseville | CA | freeway_access, retail_storefront | 0.89 | 33 | 0.286 | production and semantic building names differ materially; 2 semantic records share this normalized address |
| Brookhollow Central III | Brookhollow Central III | Houston | TX | campus_environment | 0.89 | 19 | 1.0 | 2 semantic records share this normalized address |
| Wilcrest | Wilcrest | Houston | TX | retail_storefront | 0.89 | 19 | 1.0 | signals are broad tenant or amenity patterns and need manual review |
| Castle Hills | Castle Hills | San Antonio | TX | retail_storefront | 0.87 | 14 | 1.0 | signals are broad tenant or amenity patterns and need manual review |
| Desert Ridge Corporate | Desert Ridge Corporate | Phoenix | AZ | retail_storefront | 0.87 | 10 | 1.0 | signals are broad tenant or amenity patterns and need manual review |
| 10210 Grogans Mill Rd | 10210 Grogans Mill Road | The Woodlands | TX | freeway_access, campus_environment | 0.86 | 226 | 0.955 | 2 semantic records share this normalized address |
| Prospect Plaza | Prospect Plaza | Jackson | CA | retail_storefront | 0.86 | 17 | 1.0 | signals are broad tenant or amenity patterns and need manual review |
| 4001 McEwen | 4001 McEwen | Dallas | TX | campus_environment | 0.85 | 11 | 1.0 | 2 semantic records share this normalized address |
| Country Club Plaza | Country Club Plaza | Kansas City | MO | retail_storefront | 0.85 | 11 | 1.0 | signals are broad tenant or amenity patterns and need manual review |
| Dixie Park/Watterson | Dixie Park/Watterson | Louisville | KY | warehouse_distribution | 0.85 | 11 | 1.0 | 2 semantic records share this normalized address |
| Great Office/Showroom/Warehouse Space Close to US Route 1 | Great Office/Showroom/Warehouse Space Close to US Route 1 | Portsmouth | NH | warehouse_distribution, showroom | 0.845 | 16 | 1.0 | limited signal set includes context-dependent signals |
| The Grove Office Park | The Grove | Wheaton | IL | campus_environment, warehouse_distribution | 0.84 | 266 | 0.88 | 2 semantic records share this normalized address |
| Denver Place | Denver Place | Denver | CO | retail_storefront | 0.84 | 133 | 1.0 | signals are broad tenant or amenity patterns and need manual review |
| Harbor Drive Executive Park 1 | Harbor Drive Executive Park 1 | Sausalito | CA | waterfront, warehouse_distribution | 0.84 | 57 | 1.0 | 2 semantic records share this normalized address |
| Highland Pointe | Highland Pointe | Roseville | CA | freeway_access, retail_storefront | 0.83 | 39 | 1.0 | 2 semantic records share this normalized address; limited signal set includes context-dependent signals |
| Westport View Corporate | Westport View Corporate | Westport | CT | freeway_access, transit_oriented, waterfront | 0.82 | 33 | 1.0 | 2 semantic records share this normalized address |

## 25 High-Risk Examples

| production | semantic | city | state | signals | avg_conf | support | name_score | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dixie Park/Watterson 204 - 205 | Dixie Park/Watterson 204 - 205 | Louisville | KY | warehouse_distribution | 0.98 | 23 | 1.0 | 3 semantic records share this normalized address |
| 990 Deerfield Pkwy |  | Buffalo Grove | IL | warehouse_distribution, campus_environment | 0.93 | 56 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| 1321 Mercedes Dr |  | Hanover | MD | transit_oriented, warehouse_distribution | 0.92 | 30 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| 20116 Ashbrook Pl |  | Ashburn | VA | retail_storefront, campus_environment | 0.91 | 18 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| 7 W Aylesbury Rd |  | Lutherville Timonium | MD | warehouse_distribution | 0.89 | 7 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| 1238 Palmetto St |  | Los Angeles | CA | creative_office, showroom, retail_storefront | 0.88 | 36 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| 1810 Pyramid Place | 1810 Pyramid Place | Memphis | TN | loading_dock | 0.88 | 34 | 1.0 | 77 semantic records share this normalized address |
| 1322 Space Park Drive | 1322 Space Park Drive | Houston | TX | loading_dock, warehouse_distribution | 0.875 | 192 | 1.0 | 3 semantic records share this normalized address |
| 5514 Pacific St |  | Rocklin | CA | retail_storefront | 0.87 | 14 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| 2650 Camino del Rio N |  | San Diego | CA | warehouse_distribution | 0.87 | 10 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| 109 Inverness Dr E |  | Englewood | CO | campus_environment | 0.86 | 13 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| 15225 S Main St |  | Gardena | CA | loading_dock | 0.86 | 12 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| 1910 Camden Ave |  | San Jose | CA | retail_storefront | 0.86 | 12 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| NY, Bronx - Astor Ave | NY, Bronx - Astor Ave | Bronx | NY | medical_office | 0.86 | 12 | 1.0 | 17 semantic records share this normalized address |
| 6538 Patterson Pass Rd |  | Livermore | CA | warehouse_distribution | 0.86 | 7 | 0.0 | production and semantic building names differ materially; 2 semantic records share this normalized address |
| 9305 Gerwig Ln |  | Columbia | MD | warehouse_distribution | 0.86 | 7 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| 5005 W Royal Ln | 5005 W Royal Ln | Irving | TX | freeway_access, campus_environment, warehouse_distribution | 0.853 | 86 | 1.0 | 3 semantic records share this normalized address |
| 400 Inverness Pkwy |  | Englewood | CO | transit_oriented | 0.84 | 7 | 0.0 | production and semantic building names differ materially; 2 semantic records share this normalized address |
| 5069 Maureen Ln |  | Moorpark | CA | freeway_access | 0.84 | 7 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| 2281 Lava Ridge Ct |  | Roseville | CA | freeway_access | 0.83 | 6 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| 601 & 611 Hammonds Ferry Road |  | Linthicum Heights | MD | warehouse_distribution | 0.83 | 6 | 0.0 | production and semantic building names differ materially; missing production or semantic building name |
| Dublin | Dublin | Dublin | OH | freeway_access, campus_environment | 0.82 | 22 | 1.0 | 10 semantic records share this normalized address |
| Freehold | Freehold | Freehold | NJ | medical_office, retail_storefront | 0.82 | 22 | 1.0 | 10 semantic records share this normalized address; limited signal set includes context-dependent signals |
| Maumee - Arrowhead Park | Maumee - Arrowhead Park | Maumee | OH | freeway_access, campus_environment | 0.82 | 22 | 1.0 | 10 semantic records share this normalized address |
| Merritt 7 Corporate | Merritt 7 Corporate | Norwalk | CT | retail_storefront, professional_services | 0.82 | 22 | 1.0 | 10 semantic records share this normalized address; limited signal set includes context-dependent signals |

## Risk Rules Used

- High risk: address mismatch, very low name similarity, shared address ambiguity above two records, low average confidence, or very low support.
- Medium risk: partial name mismatch, shared address ambiguity, context-dependent signals, average confidence below 0.68, or low per-signal support.
- Low risk: exact normalized address, stronger name alignment, no shared-address ambiguity, stronger confidence, and stronger support.

## Recommendation

Use the bridge for internal review now. For limited prototype UI, only use manually reviewed low-risk rows with `semantic_source_building_id` and conservative historical language. Before broader production use, regenerate the production building source data with original legacy `building_id` preserved so the bridge can move beyond reviewed address-derived IDs.
