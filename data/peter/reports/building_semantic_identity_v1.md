# Building Semantic Identity v1

## Purpose

This dataset turns historical listing and building text into a conservative building identity layer. It describes durable commercial environments and historical patterns. It does not describe current inventory, pricing, suite availability, or active listing conditions.

## Inputs

- Historical listing SQL rows processed: 3,264,010
- Raw building SQL rows processed: 1,064,271
- Building rows with description, amenity, or use text: 795,344
- Existing `building_signals.csv` for production building metadata and active-signal filtering.

## Aggregation Methodology

1. Parse raw listing descriptions and building descriptions locally.
2. Detect deterministic semantic phrases in listing and building text.
3. Group evidence by `building_id`.
4. Increase confidence for repeated listing evidence, multi-year evidence, source diversity, and direct building-description matches.
5. Classify each signal as stable/public-safe or transient/internal-only.

## Stable vs Transient Logic

Stable production-safe signals describe durable identity: creative office, medical office fit, warehouse/distribution, transit orientation, freeway access, loading orientation, showroom fit, campus environment, historic or boutique character, and similar long-lived building or location traits.

Transient signals remain internal only: furnished, plug-and-play, current parking language, move-in ready language, buildout condition, and pricing-oriented claims.

## Output Counts

- Buildings with any semantic identity record: 734,979
- Pilot records: 500

## Top Stable Production-Safe Signals

| signal | building_count |
| --- | --- |
| retail_storefront | 16621 |
| restaurant_food | 11902 |
| warehouse_distribution | 10879 |
| medical_office | 6949 |
| freeway_access | 5766 |
| campus_environment | 4308 |
| financial_services | 3103 |
| loading_dock | 2929 |
| waterfront | 2117 |
| fitness | 1916 |
| flex_rd | 1842 |
| high_clearance | 1592 |
| high_ceilings | 1412 |
| showroom | 1296 |
| transit_oriented | 758 |

## Top Noisy or Internal-Only Signals

| signal | building_count |
| --- | --- |
| retail_storefront | 261221 |
| restaurant_food | 190418 |
| current_parking | 171932 |
| warehouse_distribution | 152566 |
| freeway_access | 118189 |
| medical_office | 92570 |
| financial_services | 81835 |
| campus_environment | 54951 |
| high_ceilings | 23863 |
| flex_rd | 23597 |
| fitness | 21198 |
| loading_dock | 20343 |
| showroom | 16170 |
| high_clearance | 15672 |
| waterfront | 15410 |

## Strong Identity Examples

| building_id | building | city | safe_signals | evidence_count |
| --- | --- | --- | --- | --- |
| 149363 | 22 Cotton Road | Nashua | Restaurant or food-service fit, Medical office fit, Retail storefront environment, Warehouse or distribution fit, Fitness or wellness fit | 117 |
| 1552312 | Spaces The Quarter | Scottsdale | Warehouse or distribution fit, Startup-friendly pattern, Restaurant or food-service fit, Retail storefront environment, Transit-oriented location | 697 |
| 1104385 | 80 S Santa Fe Dr. | Denver | Freeway-access location, Transit-oriented location, Showroom fit, Restaurant or food-service fit, Warehouse or distribution fit | 28 |
| 200773 | Miami- Miami International Commerce Center | Miami | Warehouse or distribution fit, Campus environment, Loading-oriented building, Flex or R&D fit, High-ceiling environment | 110 |
| 146640 | One Glenlake Parkway | Atlanta | Restaurant or food-service fit, Campus environment, Freeway-access location, Medical office fit, Retail storefront environment | 26 |
| 178829 | nan | Valparaiso | Freeway-access location, Retail storefront environment, Restaurant or food-service fit, Warehouse or distribution fit, Waterfront context | 3 |
| 532720 | Princess Martha Place | Saint Petersburg | Showroom fit, Retail storefront environment, Financial services pattern, Freeway-access location, Medical office fit | 141 |
| 233675 | Alewife Station | Cambridge | Transit-oriented location, Medical office fit, Biotech or lab fit, Campus environment, Startup-friendly pattern | 22 |
| 282904 | La Gran Plaza | Fort Worth | Retail storefront environment, Financial services pattern, Restaurant or food-service fit, Warehouse or distribution fit, Loading-oriented building | 549 |
| 148521 | Birch Pond Office Park | Nashua | Campus environment, Retail storefront environment, Restaurant or food-service fit, Medical office fit, Fitness or wellness fit | 115 |
| 149958 | 472 Amherst Street | Nashua | Warehouse or distribution fit, Retail storefront environment, Restaurant or food-service fit, Flex or R&D fit, Fitness or wellness fit | 107 |
| 148520 | Trafalgar Square Office Park | Nashua | Restaurant or food-service fit, Campus environment, Medical office fit, Retail storefront environment, Fitness or wellness fit | 62 |

## Public Surfacing Recommendations

- Use semantic chips such as `Transit-oriented`, `Warehouse/distribution`, `Medical office fit`, or `Showroom fit`.
- Use short contextual summaries with careful language like `Historically associated with warehouse and loading-oriented uses`.
- Use neighborhood compatibility language on future district pages.
- Use tenant-fit indicators as guidance, not availability claims.

## Keep Internal Only

- Furnished, plug-and-play, move-in ready, and parking claims unless freshly verified.
- Old pricing, suite numbers, rent basis, or date available fields.
- One-off single listing claims without building-level or repeated support.

## Production Rollout Recommendation

Start with the pilot JSON only. Review examples manually, then promote a small signal whitelist into `_data/` for prototype building or neighborhood pages. Do not expose the full dataset until false positives and legacy space-type mappings are reviewed.
