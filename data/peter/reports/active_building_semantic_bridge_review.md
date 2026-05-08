# Active Building Semantic Bridge Review

## Purpose

This bridge maps reviewed semantic building identity signals onto current Rofo active building pages. It is a production bridge dataset only. It does not modify frontend templates and does not imply current availability, pricing, suites, or active inventory.

## Public Language Rule

Use this data only for language such as `Historically associated with...`, `Commonly positioned for...`, or `Rofo has seen historical signals for...`. Do not use it for `available now`, `currently has`, pricing, suite, or move-in-ready claims.

## Match Summary

- Total active production building pages: 4,172
- Matched by building_id: 111
- Matched by normalized address fallback: 850
- Active buildings with approved semantic signals: 961

## Top Approved Signals Among Active Buildings

| signal | active_building_count |
| --- | --- |
| freeway_access | 308 |
| retail_storefront | 294 |
| warehouse_distribution | 240 |
| campus_environment | 214 |
| medical_office | 110 |
| transit_oriented | 100 |
| loading_dock | 64 |
| waterfront | 57 |
| professional_services | 24 |
| showroom | 21 |
| creative_office | 13 |

## 25 Best Examples for Review

| building | city | state | signals | avg_conf | support | match | path |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Spaces The Quarter | Scottsdale | AZ | warehouse_distribution, retail_storefront, transit_oriented, freeway_access, waterfront | 0.644 | 588 | address_fallback | /commercial-real-estate/building/AZ/scottsdale/15169-n-scottsdale-rd/ |
| N Rockville - Metro Park I | Rockville | MD | campus_environment, transit_oriented, freeway_access, loading_dock, warehouse_distribution | 0.684 | 118 | building_id | /commercial-real-estate/building/MD/rockville/7519-standish-place/ |
| SPACES PLAYHOUSE DISTRICT | Pasadena | CA | freeway_access, transit_oriented, retail_storefront, campus_environment | 0.81 | 36 | address_fallback | /commercial-real-estate/building/CA/pasadena/680-e-colorado-blvd/ |
| Lake Forest - Canada | Lake Forest | CA | retail_storefront, warehouse_distribution, freeway_access, campus_environment | 0.735 | 162 | address_fallback | /commercial-real-estate/building/CA/lake-forest/22722-lambert-st/ |
| 60-80 East Rio Salado Parkway | Tempe | AZ | waterfront, freeway_access, retail_storefront, campus_environment | 0.733 | 71 | address_fallback | /commercial-real-estate/building/AZ/tempe/80-e-rio-salado-pkwy/ |
| Laguna Hills - Plaza del Lago | Laguna Hills | CA | retail_storefront, warehouse_distribution, freeway_access, showroom | 0.732 | 29 | address_fallback | /commercial-real-estate/building/CA/laguna-hills/23001-del-lago-dr/ |
| Richardson - Business Parkway | Richardson | TX | warehouse_distribution, loading_dock, freeway_access, campus_environment | 0.73 | 155 | building_id | /commercial-real-estate/building/TX/richardson/1100-business-pkwy/ |
| Bishop Ranch 3 | San Ramon | CA | freeway_access, transit_oriented, retail_storefront, campus_environment | 0.725 | 59 | address_fallback | /commercial-real-estate/building/CA/san-ramon/2603-camino-ramon/ |
| TN, Knoxville - Cedar Bluff | Knoxville | TN | retail_storefront, freeway_access, medical_office, professional_services | 0.715 | 86 | address_fallback | /commercial-real-estate/building/TN/knoxville/200-prosperity-dr/ |
| Miami- Miami International Commerce Center | Miami | FL | warehouse_distribution, campus_environment, loading_dock, showroom | 0.7 | 173 | address_fallback | /commercial-real-estate/building/FL/miami/8216-nw-14th-st/ |
| Prosperity Business Campus | Fairfax | VA | transit_oriented, retail_storefront, medical_office, campus_environment | 0.7 | 105 | address_fallback | /commercial-real-estate/building/VA/fairfax/2700-prosperity-ave/ |
| 8840 Stanford Blvd | Columbia | MD | retail_storefront, loading_dock, freeway_access, campus_environment | 0.698 | 64 | address_fallback | /commercial-real-estate/building/MD/columbia/8840-stanford-blvd/ |
| Meadow Brook | Birmingham | AL | campus_environment, medical_office, freeway_access, warehouse_distribution | 0.69 | 55 | building_id | /commercial-real-estate/building/AL/birmingham/2700-corporate-dr/ |
| Brentwood Center | Brentwood | TN | campus_environment, freeway_access, medical_office, professional_services | 0.69 | 55 | address_fallback | /commercial-real-estate/building/TN/brentwood/9005-overlook-blvd/ |
| Redmond - Overlake Business Park North | Redmond | WA | warehouse_distribution, retail_storefront, campus_environment, freeway_access | 0.688 | 136 | address_fallback | /commercial-real-estate/building/WA/redmond/2525-152nd-ave-ne/ |
| The Crossroads | San Mateo | CA | freeway_access, warehouse_distribution, transit_oriented, retail_storefront | 0.688 | 84 | address_fallback | /commercial-real-estate/building/CA/san-mateo/1825-s-grant-st/ |
| Golden Gate Ð 75 Broadway | San Francisco | CA | campus_environment, waterfront, retail_storefront, professional_services | 0.675 | 71 | address_fallback | /commercial-real-estate/building/CA/san-francisco/75-broadway/ |
| West Randolph Ogilvie | Chicago | IL | freeway_access, creative_office, retail_storefront, warehouse_distribution | 0.662 | 68 | address_fallback | /commercial-real-estate/building/IL/chicago/564-w-randolph-st/ |
| Laguna Hills - The ROW | Laguna Hills | CA | freeway_access, warehouse_distribution, showroom, retail_storefront | 0.657 | 66 | address_fallback | /commercial-real-estate/building/CA/laguna-hills/23512-commerce-center-dr/ |
| Mid-Westchester | Hawthorne | NY | medical_office, campus_environment, freeway_access, professional_services | 0.645 | 62 | address_fallback | /commercial-real-estate/building/NY/hawthorne/7-skyline-dr/ |
| Toringdon | Charlotte | NC | campus_environment, freeway_access, medical_office, professional_services | 0.63 | 55 | address_fallback | /commercial-real-estate/building/NC/charlotte/3440-toringdon-way/ |
| Maple Grove Ð Arbor Lakes | Osseo | MN | freeway_access, retail_storefront, medical_office, professional_services | 0.625 | 46 | address_fallback | /commercial-real-estate/building/MN/osseo/11670-fountains-dr/ |
| Alewife Station | Cambridge | MA | transit_oriented, medical_office, campus_environment, freeway_access | 0.622 | 55 | address_fallback | /commercial-real-estate/building/MA/cambridge/125-cambridge-park-dr/ |
| Downtown Oakland | Oakland | CA | transit_oriented, warehouse_distribution, freeway_access | 0.98 | 114 | address_fallback | /commercial-real-estate/building/CA/oakland/2201-broadway/ |
| 1238 Palmetto St | Los Angeles | CA | creative_office, showroom, retail_storefront | 0.88 | 36 | address_fallback | /commercial-real-estate/building/CA/los-angeles/1238-palmetto-st/ |

## Risks and Caveats Before Frontend Use

- Current production building page records do not expose original legacy `building_id` from source generation. Low-risk reviewed pages may expose an internal `semantic_source_building_id`; those rows can match by ID. Remaining rows still rely on normalized address fallback.
- Address fallback can produce false positives when multiple legacy records share one address or when suite-level addresses were normalized.
- Signals are historical identity signals and must not be used as current listing, pricing, or availability claims.
- Some semantic evidence comes from historical listing text rather than direct building-level descriptions.
- Public display should start with a very small whitelist and reviewed examples, not the entire bridge.

## Recommended Next Step

Review the top 25 examples and a few lower-confidence random examples. If quality is acceptable, create a tiny frontend prototype that reads a reviewed subset and renders semantic chips with conservative historical language.
