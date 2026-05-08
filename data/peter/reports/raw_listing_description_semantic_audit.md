# Raw Listing Description Semantic Audit

Source SQL: `/Users/alanbernier/rofo-raw-inspection/listings_v01a/listings_v01a.sql`

## Did the raw listing dump contain rich semantic text?

Yes. Unlike the cleaned `rofo_listings.csv` export, the raw `listings_v01a.sql` dump includes `l_description` and `l_promo_details`. These fields contain broker and feed marketing text, suite notes, property context, amenities, access language, operational requirements, and tenant-fit clues.

## Coverage

| metric | value | share |
| --- | --- | --- |
| Total listings parsed | 3,264,927 | 100.0% |
| Listings with non-empty description | 2,320,881 | 71.1% |
| Description length > 100 | 1,854,589 | 56.8% |
| Description length > 500 | 524,905 | 16.1% |
| Listings with promo details | 587 | 0.0% |
| Listings with geo | 1,212,061 | 37.1% |
| Listings with building_id | 3,264,010 | 100.0% |

## Source Breakdown

| source | count | share |
| --- | --- | --- |
| LMS | 3,256,568 | 99.7% |
| USR | 8,359 | 0.3% |

## Space Type Count

| space_type | count | share |
| --- | --- | --- |
| 1 | 1,205,090 | 36.9% |
| 2 | 726,872 | 22.3% |
| 8 | 621,403 | 19.0% |
| 3 | 368,663 | 11.3% |
| 10 | 252,815 | 7.7% |
| 13 | 60,210 | 1.8% |
| 12 | 29,221 | 0.9% |
| 11 | 273 | 0.0% |
| 9 | 209 | 0.0% |
| 0 | 171 | 0.0% |

## Status Count

| status | count | share |
| --- | --- | --- |
| 2 | 2,747,615 | 84.2% |
| 1 | 454,750 | 13.9% |
| 0 | 60,567 | 1.9% |
| -1 | 1,995 | 0.1% |

## Top Detected Signals

| signal | label | count |
| --- | --- | --- |
| parking | Parking | 595,217 |
| retail_storefront | Retail Storefront | 557,056 |
| restaurant_food | Restaurant or Food | 415,230 |
| warehouse_distribution | Warehouse or Distribution | 321,978 |
| medical | Medical | 202,144 |
| freeway_access | Freeway Access | 162,937 |
| financial_services | Financial Services | 132,351 |
| campus_environment | Campus Environment | 108,026 |
| fitness | Fitness | 82,628 |
| loading_dock | Loading Dock | 75,868 |
| flex_rd | Flex or R&D | 53,825 |
| high_ceilings | High Ceilings | 49,971 |
| showroom | Showroom | 37,675 |
| transit_adjacent | Transit Adjacent | 37,459 |
| high_clearance | High Clearance | 33,195 |

## Most Valuable Fields

- `l_description`: primary source for building character, access, amenities, operational details, and tenant fit.
- `l_promo_details`: secondary rich-text field. Often useful when populated.
- `l_promo_title` and `l_name`: short but useful for headline-style cues such as loft, showroom, Class A, or office warehouse.
- `l_source`, `l_lms_feed_id`, `is_catylist`, and `l_external_url`: useful for source quality and future deduping.
- `l_space_type`, `l_sqft`, `l_type`, `l_status`, `l_glat`, and `l_glng`: useful structured context. Do not treat as live availability.

## Strongly Supported Signals

The strongest v1 candidates are signals with explicit phrase evidence: parking, retail storefront, warehouse/distribution, loading dock, freeway access, high ceilings, natural light, medical, showroom, flex/R&D, Class A, transit adjacency, heavy power, and campus environment.

## Weak or Risky Signals

- `professional_services`, `financial_services`, `law_firm`, and `tech_startup` can be useful but may refer to existing tenants rather than the best fit for the space.
- `boutique_office`, `premium`, and similar market-position language can be subjective.
- Any signal extracted from old listing text must be reviewed or aggregated before public use.

## How This Changes the Prior Recommendation

The prior recommendation was conservative because the cleaned listing CSV had no marketing text. The raw SQL dump materially improves the opportunity. Rofo can now build a real v1 semantic enrichment layer using deterministic extraction from historical listing descriptions, while still avoiding stale listing UX.

## Production-Safe V1 Layer

- Build a reviewed building-level signal table grouped by `building_id`.
- Store signal counts, confidence, and evidence snippets internally.
- Surface only stable, non-availability claims such as building character, access orientation, and historical tenant-fit patterns.
- Use aggregate language on city and neighborhood pages.

## Reviewed or Manual Only

- Any claim implying current availability, current suite condition, current rent, current tenant roster, or current landlord concessions.
- Subjective quality labels such as trophy, premium, best, or affordable.
- Any source text with obvious encoding corruption or feed boilerplate.

## Additional Raw Dumps to Inspect Next

- Building table dumps with richer building descriptions or amenities.
- Feed/vendor tables for Catylist, Buildout, CBC, Regus, or LMS metadata.
- Broker house and user profile raw dumps with company descriptions.
- Photo/media attachment tables that may contain captions, filenames, or brochure links.
- Neighborhood and city raw tables with historical editorial content.

## Representative Rich Samples

| listing_id | building_id | name | source | space_type | signal_count | signals | excerpt |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 109775 | 164966 | SHORT TERM RENTALS/ ALQUILERES | LMS | 1 | 8 | financial_services,fitness,freeway_access,furnished,parking,restaurant_food,retail_storefront,warehouse_distribution | SHORT TERM RENTALS/ ALQUILERES 100 PANAMA CITY, PANAMA- SHORT TERM APARTMENT RENTALS 44th & Park 10D Weekly : $785 Monthly : $1,985 Fully furnished apartment complete with an entertainment center (full size TV, CD / DVD  |
| 703908 | 233094 | Warner Plaza Office/Retail Space for Lease | LMS | 1 | 8 | biotech_lab,freeway_access,furnished,medical,parking,restaurant_food,retail_storefront,tech_startup | Warner Plaza Office/Retail Space for Lease 307 Located at 21054 Sherman Way in Canoga Park, CA, Warner Plaza's Office & Retail Space for Lease sits on an easily accessible corner lot at the intersection of Sherman Way an |
| 1910463 | 146640 | Glenlake | LMS | 1 | 10 | campus_environment,financial_services,fitness,freeway_access,furnished,medical,parking,restaurant_food,retail_storefront,tech_startup | Glenlake Suite 700 Call 1-972-764-8881 to learn more. Do you need a large team office ? Working in our offices will earn you prestige and efficiency for your teams, plus the convenience of being able to start immediately |
| 1910460 | 146640 | Glenlake | LMS | 1 | 10 | campus_environment,financial_services,fitness,freeway_access,furnished,medical,parking,restaurant_food,retail_storefront,tech_startup | Glenlake Suite 700 Call 1-972-764-8881 to learn more. STOP! You could start working right now. Your very own private 80 sqft office + 500 sqft of common spaces is waiting for you. Pay less and get so much more. Available |
| 1910461 | 146640 | Glenlake | LMS | 1 | 10 | campus_environment,financial_services,fitness,freeway_access,furnished,medical,parking,restaurant_food,retail_storefront,tech_startup | Glenlake Suite 700 Call 1-972-764-8881 to learn more. Enjoy the benefits of a private office for 3 to 4 people at a minimal cost. You will have unrestricted access to high speed internet, administrative support and a ful |
| 1910462 | 146640 | Glenlake | LMS | 1 | 10 | campus_environment,financial_services,fitness,freeway_access,furnished,medical,parking,restaurant_food,retail_storefront,tech_startup | Glenlake Suite 700 Call 1-972-764-8881 to learn more. WOW! Work in city's most desirable locations; increase your efficiency by working in your own private office ! We offer you more than 900sqft of common spaces. You'll |
| 1910459 | 146640 | Glenlake | LMS | 1 | 10 | campus_environment,financial_services,fitness,freeway_access,furnished,medical,parking,restaurant_food,retail_storefront,tech_startup | Glenlake Suite 700 Call 1-972-764-8881 to learn more. The best coworking in the city. Your own reserved desk in cutting-edge, inspirational work places that support effective working. More then 300 sqft of common spaces  |
| 2293289 | 919867 |  | LMS | 2 | 7 | financial_services,nonprofit,parking,restaurant_food,retail_storefront,showroom,warehouse_distribution | SALES NOTES VERY special property with lots of curb appeal! Must SEE to truly appreciate all it has to offer. Well thought out and Move In Ready. All utilities on site. Electric generator, solar, water tanks. Remodeled 6 |
| 2254838 | 919867 |  | LMS | 2 | 7 | financial_services,nonprofit,parking,restaurant_food,retail_storefront,showroom,warehouse_distribution | SALES NOTES VERY special property with lots of curb appeal! Must SEE to truly appreciate all it has to offer. Well thought out and Move In Ready. All utilities on site. Electric generator, solar, water tanks. Remodeled 6 |
| 2224264 | 919867 |  | LMS | 2 | 7 | financial_services,nonprofit,parking,restaurant_food,retail_storefront,showroom,warehouse_distribution | SALES NOTES VERY special property with lots of curb appeal! Must SEE to truly appreciate all it has to offer. Well thought out and Move In Ready. All utilities on site. Electric generator, solar, water tanks. Remodeled 6 |
| 2190790 | 919867 |  | LMS | 2 | 7 | financial_services,nonprofit,parking,restaurant_food,retail_storefront,showroom,warehouse_distribution | SALES NOTES VERY special property with lots of curb appeal! Must SEE to truly appreciate all it has to offer. Well thought out and Move In Ready. All utilities on site. Electric generator, solar, water tanks. Remodeled 6 |
| 2158672 | 919867 |  | LMS | 2 | 7 | financial_services,nonprofit,parking,restaurant_food,retail_storefront,showroom,warehouse_distribution | SALES NOTES VERY special property with lots of curb appeal! Must SEE to truly appreciate all it has to offer. Well thought out and Move In Ready. All utilities on site. Electric generator, solar, water tanks. Remodeled 6 |
