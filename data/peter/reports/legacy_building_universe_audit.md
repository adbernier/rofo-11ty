# Legacy Building Universe Audit

Generated: 2026-05-12

## Scope

This is a read-only infrastructure audit of the legacy Rofo building universe. It does not generate pages, modify templates, update sitemap files, perform full enrichment, or export individual building rows.

## A. Dataset Inventory

| source_file | size_mb | column_count | schema_summary |
| --- | --- | --- | --- |
| data/peter/raw/rofo_buildings.csv | 281.3 | 24 | building_id, name, street_number, street_name, address, city_id, city, state, zip, county_id, county, metro... |
| data/peter/raw/rofo_listings.csv | 531.1 | 20 | listing_id, building_id, contact_user_id, city_id, city, state, county, square_footage, space_type, lease_type, listing_type, price_selection... |
| data/peter/raw/rofo_relationships_listing_buildings.csv | 143.4 | 5 | listing_id, building_id, contact_user_id, city_id, source_table |
| data/peter/raw/rofo_market_summary.csv | 1.2 | 10 | city_id, city, state, county, metro, building_count, listing_count, lead_count, distinct_brokers, distinct_landlords |
| data/peter/raw/rofo_leads.csv | 48.7 | 19 | lead_id, created_at, lead_type, tenant_user_id, listing_id, building_id, city_id, city, state, county, space_type, size_needed... |
| data/peter/raw/rofo_users.csv | 24.3 | 11 | user_id, name, email, phone, company, role, city, state, county, created_at, last_active |
| data/peter/raw/rofo_broker_houses.csv | 0.8 | 9 | broker_house_id, company, website, description, main_contact_user_id, main_office_id, allowed_members, feed_allowed, featured |
| data/peter/derived/building_signals.csv | 192.2 | 24 | building_id, name, address, city, state, zip, county, metro, lat, lng, building_size, floors... |
| data/peter/derived/market_signals.csv | 1.2 | 14 | city, state, building_count, active_building_count, total_listing_activity, median_listing_count, high_activity_building_count, ultra_high_activity_building_count, neighborhood_count, has_legacy_city_record, city_lat, city_lng... |
| data/peter/raw/rofo_export_readme.csv | 0.0 | 4 | file_name, date_exported, source_table_or_query, notes_and_caveats |
| data/peter/raw/rofo_data_dictionary.csv | 0.0 | 3 | file_name, field_name, description |

### Raw Export Notes

The Peter export README says `rofo_buildings.csv` comes from `buildings + export_buildings_scope + cities + county_cities + county_zipcodes + cbsa_lookup + listings`. It is described as a relationship-safe building scope that keeps buildings associated with listings or tour requests and excludes only unassociated duplicate buildings.

The cleaned `rofo_listings.csv` preserves original listing IDs and building IDs, but it does not include rich listing descriptions. The raw R2 SQL listing dump remains the richer text source for semantic extraction.

### Building Table Completeness

- Raw building rows processed: 1,503,544
- Estimated normalized unique address/city/state keys: 796,304
- Likely duplicate normalized address/city/state groups: 163,104
- Rows in likely duplicate groups: 870,344

| field | present | percent |
| --- | --- | --- |
| address | 1503468 | 100.0% |
| city | 1503531 | 100.0% |
| state | 1503531 | 100.0% |
| zip | 1503544 | 100.0% |
| county | 196029 | 13.0% |
| metro | 194117 | 12.9% |
| nonzero lat/lng | 852620 | 56.7% |
| any size/floor/unit field > 0 | 217367 | 14.5% |
| listing_count > 0 | 1264654 | 84.1% |
| has_association = 1 | 1282030 | 85.3% |

### Listing And Relationship Coverage

- Listing rows processed: 3,264,927
- Listings with building_id present: 3,264,927
- Listing-building relationship rows: 3,264,010
- Distinct relationship listing IDs: 3,264,010
- Distinct relationship building IDs: 1,264,948
- Listing date range observed across created/updated fields: 1969-12-31 16:33:31 to 2026-04-19 03:04:14

Listing source breakdown:

| source | listing_rows |
| --- | --- |
| LMS | 3256568 |
| USR | 8359 |

Listing status breakdown:

| status | listing_rows |
| --- | --- |
| 2 | 2747615 |
| 1 | 454750 |
| 0 | 60567 |
| -1 | 1995 |

Space/building type fields:

- `rofo_buildings.csv` has no durable building type field.
- `rofo_listings.csv` has a numeric `space_type` field. Codes are useful for clustering but should be decoded before public use.
- Building type in the current live graph is inferred downstream from normalized building/listing/company data.

Numeric listing `space_type` counts:

| space_type_code | listing_rows |
| --- | --- |
| 1 | 1205090 |
| 2 | 726872 |
| 8 | 621403 |
| 3 | 368663 |
| 10 | 252815 |
| 13 | 60210 |
| 12 | 29221 |
| 11 | 273 |
| 9 | 209 |
| 0 | 171 |

## B. Commercial Density Summary

### Top 100 Cities By Legacy Building Count

| city | buildings | active | listing_activity | live_pages_est |
| --- | --- | --- | --- | --- |
| San Francisco, CA | 27835 | 3915 | 14336 | 100 |
| Chicago, IL | 15615 | 14017 | 35954 | 42 |
| Oakland, CA | 10844 | 1637 | 6302 | 34 |
| Albuquerque, NM | 10415 | 9038 | 42217 | 4 |
| Baton Rouge, LA | 8405 | 7573 | 25977 | 3 |
| Louisville, KY | 7358 | 6161 | 22965 | 7 |
| Sacramento, CA | 7022 | 3039 | 11821 | 137 |
| Sarasota, FL | 6828 | 6090 | 20539 | 1 |
| Knoxville, TN | 6437 | 5714 | 20457 | 2 |
| Tampa, FL | 6390 | 5581 | 20727 | 11 |
| Los Angeles, CA | 6384 | 5253 | 17377 | 166 |
| Houston, TX | 6303 | 5823 | 121471 | 85 |
| Miami, FL | 5827 | 5185 | 20484 | 26 |
| San Diego, CA | 5524 | 4525 | 20385 | 88 |
| Atlanta, GA | 5513 | 4885 | 17160 | 66 |
| Jacksonville, FL | 5444 | 4907 | 16558 | 12 |
| Tallahassee, FL | 5124 | 4752 | 10257 | 2 |
| Oklahoma City, OK | 5094 | 4681 | 15805 | 3 |
| Phoenix, AZ | 5049 | 4444 | 21594 | 100 |
| Corpus Christi, TX | 4996 | 4677 | 11047 | 0 |
| Pensacola, FL | 4957 | 4198 | 15683 | 0 |
| San Antonio, TX | 4872 | 4477 | 11528 | 13 |
| Denver, CO | 4736 | 4177 | 18446 | 46 |
| Lubbock, TX | 4713 | 4369 | 8900 | 1 |
| Buffalo, NY | 4658 | 4234 | 12942 | 134 |
| New Orleans, LA | 4622 | 4057 | 11808 | 4 |
| Indianapolis, IN | 4393 | 3913 | 13133 | 24 |
| Brooklyn, NY | 4393 | 3883 | 12609 | 5 |
| Shreveport, LA | 4129 | 3641 | 9413 | 2 |
| Hayward, CA | 4074 | 1172 | 2974 | 10 |
| New Braunfels, TX | 3984 | 3714 | 7019 | 0 |
| Bradenton, FL | 3897 | 3481 | 11333 | 0 |
| New York, NY | 3862 | 3358 | 15092 | 81 |
| Saint Petersburg, FL | 3861 | 3457 | 10656 | 2 |
| San Jose, CA | 3760 | 3146 | 13257 | 75 |
| Fort Wayne, IN | 3759 | 3309 | 12825 | 1 |
| Augusta, GA | 3739 | 3296 | 12464 | 0 |
| Billings, MT | 3710 | 3441 | 7357 | 0 |
| Boise, ID | 3697 | 3484 | 7383 | 1 |
| Colorado Springs, CO | 3556 | 3189 | 14645 | 5 |
| Las Vegas, NV | 3496 | 2980 | 9616 | 17 |
| Grand Rapids, MI | 3490 | 2691 | 15208 | 1 |
| Austin, TX | 3406 | 3062 | 15108 | 79 |
| Stockton, CA | 3380 | 923 | 2385 | 36 |
| Montgomery, AL | 3332 | 3156 | 5121 | 1 |
| Myrtle Beach, SC | 3280 | 3075 | 5280 | 0 |
| Springfield, MO | 3258 | 2931 | 10127 | 0 |
| Hattiesburg, MS | 3247 | 3082 | 5210 | 0 |
| Apple Valley, CA | 3237 | 3145 | 3562 | 6 |
| Berkeley, CA | 3191 | 424 | 1375 | 2 |
| Detroit, MI | 3185 | 2887 | 6981 | 4 |
| Chattanooga, TN | 3128 | 2604 | 10751 | 1 |
| Adelanto, CA | 3060 | 3012 | 3293 | 0 |
| Spokane, WA | 2959 | 2718 | 7993 | 1 |
| Little Rock, AR | 2878 | 2667 | 7311 | 1 |
| Lansing, MI | 2863 | 2616 | 7846 | 1 |
| Evansville, IN | 2852 | 2520 | 9938 | 0 |
| Victorville, CA | 2823 | 2700 | 5015 | 1 |
| Fremont, CA | 2805 | 1090 | 2764 | 8 |
| Ocala, FL | 2728 | 2556 | 5031 | 0 |
| Livonia, MI | 2688 | 2522 | 7243 | 0 |
| Traverse City, MI | 2667 | 2430 | 4741 | 0 |
| Fort Lauderdale, FL | 2657 | 2351 | 10334 | 4 |
| Lafayette, LA | 2632 | 2408 | 6830 | 0 |
| Bella Vista, AR | 2589 | 2534 | 2682 | 0 |
| Wilmington, NC | 2585 | 2003 | 5756 | 0 |
| Waco, TX | 2572 | 2463 | 3710 | 0 |
| Covington, LA | 2539 | 2420 | 5319 | 0 |
| Williston, ND | 2470 | 2366 | 6101 | 0 |
| Harlingen, TX | 2451 | 2327 | 4505 | 0 |
| Salisbury, MD | 2425 | 2264 | 5898 | 0 |
| Fresno, CA | 2346 | 1874 | 5667 | 1 |
| Gainesville, FL | 2344 | 2014 | 6529 | 0 |
| Rockford, IL | 2341 | 2086 | 5033 | 1 |
| Texarkana, TX | 2322 | 2229 | 3923 | 0 |
| Zephyrhills, FL | 2304 | 2225 | 2805 | 0 |
| Port Saint Lucie, FL | 2300 | 2259 | 3495 | 0 |
| Redwood City, CA | 2224 | 432 | 1570 | 5 |
| El Paso, TX | 2218 | 2046 | 4746 | 2 |
| San Leandro, CA | 2212 | 591 | 1334 | 2 |
| Mesa, AZ | 2202 | 1948 | 9656 | 8 |
| Port Charlotte, FL | 2183 | 1824 | 5073 | 0 |
| Daytona Beach, FL | 2157 | 1974 | 5396 | 0 |
| Salem, OR | 2129 | 1898 | 7064 | 0 |
| San Mateo, CA | 2123 | 401 | 1970 | 7 |
| Anaheim, CA | 2096 | 1773 | 5336 | 29 |
| Reno, NV | 2057 | 1768 | 7841 | 2 |
| Harrisburg, PA | 2055 | 1839 | 8163 | 1 |
| Idaho Falls, ID | 2051 | 1976 | 3642 | 0 |
| Syracuse, NY | 2018 | 1814 | 5368 | 45 |
| Rio Rancho, NM | 2016 | 1864 | 4729 | 0 |
| Cumming, GA | 2009 | 1841 | 3859 | 1 |
| Irvine, CA | 2006 | 1665 | 6498 | 23 |
| Omaha, NE | 2002 | 1821 | 6476 | 3 |
| Southfield, MI | 1995 | 1880 | 8403 | 3 |
| Wichita, KS | 1943 | 1877 | 3287 | 1 |
| Raleigh, NC | 1935 | 1723 | 4779 | 10 |
| Round Rock, TX | 1920 | 1797 | 3788 | 2 |
| Aurora, CO | 1915 | 1805 | 26819 | 8 |
| Dallas, TX | 1901 | 1762 | 59775 | 53 |

### Top 100 ZIP Codes By Legacy Building Count

| zip | city | buildings |
| --- | --- | --- |
| 78130 | New Braunfels, TX | 3200 |
| 92301 | Adelanto, CA | 3043 |
| 94110 | San Francisco, CA | 2827 |
| 58801 | Williston, ND | 2464 |
| 94109 | San Francisco, CA | 2242 |
| 94103 | San Francisco, CA | 2237 |
| 39401 | Hattiesburg, MS | 2044 |
| 75503 | Texarkana, TX | 2036 |
| 70433 | Covington, LA | 1999 |
| 78550 | Harlingen, TX | 1895 |
| 29577 | Myrtle Beach, SC | 1884 |
| 92307 | Apple Valley, CA | 1839 |
| 94117 | San Francisco, CA | 1797 |
| 94118 | San Francisco, CA | 1780 |
| 72714 | Bella Vista, AR | 1665 |
| 94538 | Fremont, CA | 1653 |
| 32174 | Ormond Beach, FL | 1623 |
| 94577 | San Leandro, CA | 1497 |
| 70809 | Baton Rouge, LA | 1489 |
| 94123 | San Francisco, CA | 1480 |
| 94080 | South San Francisco, CA | 1476 |
| 94063 | Redwood City, CA | 1473 |
| 94122 | San Francisco, CA | 1452 |
| 79424 | Lubbock, TX | 1435 |
| 94121 | San Francisco, CA | 1426 |
| 94601 | Oakland, CA | 1421 |
| 94114 | San Francisco, CA | 1420 |
| 32303 | Tallahassee, FL | 1397 |
| 94115 | San Francisco, CA | 1394 |
| 92308 | Apple Valley, CA | 1393 |
| 94133 | San Francisco, CA | 1388 |
| 94545 | Hayward, CA | 1382 |
| 94107 | San Francisco, CA | 1371 |
| 83642 | Meridian, ID | 1365 |
| 59101 | Billings, MT | 1354 |
| 59102 | Billings, MT | 1331 |
| 94607 | Oakland, CA | 1328 |
| 92392 | Victorville, CA | 1317 |
| 94541 | Hayward, CA | 1315 |
| 87124 | Rio Rancho, NM | 1281 |
| 94501 | Alameda, CA | 1261 |
| 21801 | Salisbury, MD | 1257 |
| 71854 | Texarkana, AR | 1230 |
| 94520 | Concord, CA | 1213 |
| 94124 | San Francisco, CA | 1204 |
| 39402 | Hattiesburg, MS | 1200 |
| 29910 | Bluffton, SC | 1195 |
| 94544 | Hayward, CA | 1187 |
| 94606 | Oakland, CA | 1174 |
| 70806 | Baton Rouge, LA | 1169 |
| 21804 | Salisbury, MD | 1168 |
| 48180 | Taylor, MI | 1167 |
| 94102 | San Francisco, CA | 1164 |
| 33542 | Zephyrhills, FL | 1144 |
| 47715 | Evansville, IN | 1143 |
| 94010 | Burlingame, CA | 1137 |
| 95945 | Grass Valley, CA | 1135 |
| 48150 | Livonia, MI | 1125 |
| 32301 | Tallahassee, FL | 1125 |
| 39525 | Diamondhead, MS | 1122 |
| 38632 | Hernando, MS | 1119 |
| 94612 | Oakland, CA | 1116 |
| 87121 | Albuquerque, NM | 1101 |
| 92201 | Indio, CA | 1095 |
| 94901 | San Rafael, CA | 1075 |
| 70726 | Denham Springs, LA | 1069 |
| 29526 | Conway, SC | 1066 |
| 70737 | Gonzales, LA | 1051 |
| 71111 | Bossier City, LA | 1049 |
| 72712 | Bentonville, AR | 1044 |
| 87114 | Albuquerque, NM | 1017 |
| 94401 | San Mateo, CA | 1001 |
| 49684 | Traverse City, MI | 995 |
| 30040 | Cumming, GA | 993 |
| 34236 | Sarasota, FL | 991 |
| 71106 | Shreveport, LA | 984 |
| 70471 | Mandeville, LA | 982 |
| 48152 | Livonia, MI | 979 |
| 92311 | Barstow, CA | 974 |
| 58854 | Watford City, ND | 974 |
| 83687 | Nampa, ID | 972 |
| 94551 | Livermore, CA | 970 |
| 49686 | Traverse City, MI | 970 |
| 12401 | Kingston, NY | 966 |
| 94070 | San Carlos, CA | 965 |
| 37919 | Knoxville, TN | 957 |
| 32308 | Tallahassee, FL | 955 |
| 64801 | Joplin, MO | 952 |
| 70816 | Baton Rouge, LA | 944 |
| 92356 | Lucerne Valley, CA | 940 |
| 87105 | Albuquerque, NM | 937 |
| 70508 | Lafayette, LA | 933 |
| 34240 | Sarasota, FL | 932 |
| 72715 | Bella Vista, AR | 924 |
| 92395 | Victorville, CA | 922 |
| 94509 | Antioch, CA | 918 |
| 87107 | Albuquerque, NM | 916 |
| 39110 | Madison, MS | 916 |
| 94025 | Menlo Park, CA | 914 |
| 27587 | Wake Forest, NC | 913 |

### Top States By Building Count

| state | buildings |
| --- | --- |
| CA | 250305 |
| FL | 150139 |
| TX | 106744 |
| MI | 98613 |
| IL | 68652 |
| NY | 61372 |
| GA | 59961 |
| LA | 55840 |
| NC | 42180 |
| IN | 37980 |
| TN | 36942 |
| SC | 29492 |
| PA | 29054 |
| MS | 26065 |
| CO | 25929 |
| AZ | 24629 |
| KY | 23686 |
| AR | 23597 |
| NM | 23260 |
| WI | 22813 |
| ID | 19054 |
| MO | 18938 |
| WA | 18336 |
| VA | 18019 |
| AL | 17455 |
| MD | 17061 |
| OK | 16472 |
| MA | 16183 |
| OH | 16052 |
| NJ | 15133 |
| MN | 14475 |
| NH | 13158 |
| ME | 12288 |
| NV | 11027 |
| OR | 10005 |
| MT | 8290 |
| CT | 8223 |
| KS | 8113 |
| ND | 7582 |
| IA | 7152 |
| UT | 5869 |
| NE | 4883 |
| DE | 4701 |
| RI | 3802 |
| WV | 3692 |
| WY | 2374 |
| HI | 2171 |
| SD | 2133 |
| VT | 2015 |
| AK | 838 |
| DC | 778 |
| PR | 5 |
| GU | 1 |

### Activity Bucket Distribution

| bucket | buildings |
| --- | --- |
| ultra_high | 26 |
| high | 1464 |
| medium | 45679 |
| low | 255338 |
| minimal | 962147 |
| none | 238890 |

## C. Cluster Detection

The audit did not map individual buildings. Cluster observations are based on aggregate city, ZIP, listing activity, and listing space-type codes.

Likely dense commercial clusters:

| city | buildings | active | listing_activity | space_type_codes | live_pages_est | cluster_strength |
| --- | --- | --- | --- | --- | --- | --- |
| San Francisco, CA | 27835 | 3915 | 14336 | 1 (10526), 2 (2117), 3 (700) | 100 | very_high |
| Chicago, IL | 15615 | 14017 | 35954 | 2 (14931), 1 (11999), 10 (4634) | 42 | very_high |
| Oakland, CA | 10844 | 1637 | 6302 | 1 (4145), 3 (912), 2 (853) | 34 | very_high |
| Albuquerque, NM | 10415 | 9038 | 42217 | 1 (16376), 2 (10999), 8 (7014) | 4 | very_high |
| Baton Rouge, LA | 8405 | 7573 | 25977 | 1 (10485), 2 (6232), 8 (5051) | 3 | very_high |
| Louisville, KY | 7358 | 6161 | 22965 | 1 (8970), 2 (6021), 8 (3384) | 7 | very_high |
| Sacramento, CA | 7022 | 3039 | 11821 | 1 (5741), 3 (2897), 2 (2806) | 137 | very_high |
| Sarasota, FL | 6828 | 6090 | 20539 | 1 (8954), 2 (4768), 3 (3238) | 1 | very_high |
| Knoxville, TN | 6437 | 5714 | 20457 | 1 (9426), 2 (4995), 8 (3480) | 2 | very_high |
| Tampa, FL | 6390 | 5581 | 20727 | 1 (10071), 2 (3522), 3 (2892) | 11 | very_high |
| Los Angeles, CA | 6384 | 5253 | 17377 | 1 (9106), 2 (4098), 3 (2364) | 166 | very_high |
| Houston, TX | 6303 | 5823 | 121471 | 1 (108235), 2 (6154), 3 (3269) | 85 | very_high |
| Miami, FL | 5827 | 5185 | 20484 | 1 (10388), 3 (4236), 2 (3526) | 26 | very_high |
| San Diego, CA | 5524 | 4525 | 20385 | 1 (12505), 3 (4760), 2 (2306) | 88 | very_high |
| Atlanta, GA | 5513 | 4885 | 17160 | 1 (10551), 2 (2750), 3 (2584) | 66 | very_high |
| Jacksonville, FL | 5444 | 4907 | 16558 | 1 (8677), 2 (3140), 3 (2068) | 12 | very_high |
| Tallahassee, FL | 5124 | 4752 | 10257 | 1 (3739), 2 (2646), 8 (2168) | 2 | very_high |
| Oklahoma City, OK | 5094 | 4681 | 15805 | 1 (5958), 3 (3867), 2 (3568) | 3 | very_high |
| Phoenix, AZ | 5049 | 4444 | 21594 | 1 (13210), 3 (3332), 2 (2992) | 100 | very_high |
| Corpus Christi, TX | 4996 | 4677 | 11047 | 8 (3765), 2 (2665), 1 (2131) | 0 | very_high |
| Pensacola, FL | 4957 | 4198 | 15683 | 1 (4959), 8 (4614), 2 (4043) | 0 | very_high |
| San Antonio, TX | 4872 | 4477 | 11528 | 1 (5387), 2 (2241), 8 (2231) | 13 | very_high |
| Denver, CO | 4736 | 4177 | 18446 | 1 (12061), 3 (2972), 2 (2158) | 46 | very_high |
| Lubbock, TX | 4713 | 4369 | 8900 | 8 (4175), 1 (1930), 2 (1469) | 1 | very_high |
| Buffalo, NY | 4658 | 4234 | 12942 | 2 (5131), 1 (4186), 8 (1840) | 134 | very_high |
| New Orleans, LA | 4622 | 4057 | 11808 | 1 (4048), 2 (3696), 8 (1512) | 4 | very_high |
| Indianapolis, IN | 4393 | 3913 | 13133 | 1 (4204), 3 (3638), 2 (3161) | 24 | very_high |
| Brooklyn, NY | 4393 | 3883 | 12609 | 2 (8880), 1 (2459), 3 (687) | 5 | very_high |
| Shreveport, LA | 4129 | 3641 | 9413 | 1 (2676), 8 (2403), 2 (1866) | 2 | very_high |
| Hayward, CA | 4074 | 1172 | 2974 | 3 (1371), 1 (1172), 2 (307) | 10 | very_high |
| New Braunfels, TX | 3984 | 3714 | 7019 | 8 (3066), 1 (2053), 2 (995) | 0 | very_high |
| Bradenton, FL | 3897 | 3481 | 11333 | 1 (4912), 2 (2743), 8 (2150) | 0 | very_high |
| New York, NY | 3862 | 3358 | 15092 | 1 (9846), 2 (4176), 3 (202) | 81 | very_high |
| Saint Petersburg, FL | 3861 | 3457 | 10656 | 1 (4191), 2 (3370), 3 (1207) | 2 | very_high |
| San Jose, CA | 3760 | 3146 | 13257 | 1 (7160), 2 (4006), 3 (1599) | 75 | very_high |
| Fort Wayne, IN | 3759 | 3309 | 12825 | 1 (4727), 2 (3533), 8 (2287) | 1 | very_high |
| Augusta, GA | 3739 | 3296 | 12464 | 1 (4350), 8 (2965), 3 (2297) | 0 | very_high |
| Billings, MT | 3710 | 3441 | 7357 | 1 (2290), 3 (1786), 8 (1531) | 0 | very_high |
| Boise, ID | 3697 | 3484 | 7383 | 1 (3879), 2 (1581), 3 (1100) | 1 | very_high |
| Colorado Springs, CO | 3556 | 3189 | 14645 | 1 (6052), 2 (3710), 3 (2692) | 5 | very_high |
| Las Vegas, NV | 3496 | 2980 | 9616 | 1 (3958), 2 (2601), 8 (1558) | 17 | very_high |
| Grand Rapids, MI | 3490 | 2691 | 15208 | 1 (6852), 2 (5150), 3 (1657) | 1 | very_high |
| Austin, TX | 3406 | 3062 | 15108 | 1 (9145), 2 (3665), 3 (1237) | 79 | very_high |
| Stockton, CA | 3380 | 923 | 2385 | 3 (739), 1 (731), 2 (613) | 36 | very_high |
| Montgomery, AL | 3332 | 3156 | 5121 | 1 (1679), 2 (1491), 8 (1228) | 1 | very_high |
| Myrtle Beach, SC | 3280 | 3075 | 5280 | 8 (1743), 2 (1280), 1 (925) | 0 | very_high |
| Springfield, MO | 3258 | 2931 | 10127 | 1 (3820), 8 (2371), 2 (2364) | 0 | very_high |
| Hattiesburg, MS | 3247 | 3082 | 5210 | 8 (2015), 2 (1721), 1 (1052) | 0 | very_high |
| Apple Valley, CA | 3237 | 3145 | 3562 | 8 (2930), 10 (275), 3 (131) | 6 | very_high |
| Berkeley, CA | 3191 | 424 | 1375 | 1 (939), 2 (282), 3 (79) | 2 | very_high |

### Aggregate Cluster Observations

- The legacy universe contains very large building clusters in major metros and several secondary markets.
- Industrial and flex corridors are likely detectable by combining city/ZIP density with numeric listing `space_type` patterns, but the numeric codes need decoding before public-facing categorization.
- Suburban office corridors are visible as high building-count cities with high listing activity and meaningful current live-page overlap.
- Downtown cores appear strongest where building density, listing activity, and current live building pages all overlap.
- Medical/professional clusters are not reliably detectable from `rofo_buildings.csv` alone. They require listing descriptions, semantic signals, tenant-fit tags, or broker-written text.

## D. Comparison To Current Live Graph

- Current active building pages used for overlap estimate: 4,171
- Raw legacy building rows matching current active building address/city/state keys: 11,651
- Current active building pages represent a small curated/public subset of the legacy universe.
- Many high-density legacy markets are not proportionally surfaced in the current live graph.
- The best near-term expansion targets are markets where legacy density and current live building pages both exist.

Likely dormant market categories:

- Cities with hundreds or thousands of legacy building rows but few or no current active building pages.
- Cities with strong listing activity but weak current template/content coverage.
- ZIP-heavy commercial corridors where a city page alone may be too broad and future neighborhood/corridor pages could be more useful.

Likely high-value secondary/tertiary markets:

- Markets with 50+ legacy buildings, meaningful active historical signals, and at least some current live graph overlap.
- Suburban employment centers near existing strong city pages.
- Cities with multiple ZIP clusters, suggesting corridor or neighborhood opportunities later.

## E. Data Quality Observations

### Duplicate Patterns

- Exact normalized address/city/state duplicate groups exist and should be reviewed before any full production bridge.
- Some duplicates are likely legitimate multi-building campuses or shared-address suites.
- Some duplicates are likely stale import duplicates from historical feeds.

### Stale Fields And Freshness

- Export date is 2026-05-05, but building `updated_at` values span historical records.
- Listing rows include historical statuses and should not be interpreted as current availability.
- `listing_count` is useful as historical leasing activity intensity, not live inventory.

### Address And Normalization Issues

- Address completeness is high, but address normalization still needs careful handling of ranges, suite-like names, campus names, and alternate spellings.
- Missing or zero coordinates exist and should block map/polygon assignment.
- ZIP completeness is strong enough for aggregate corridor analysis but not enough for public page routing by itself.

### Relationship Integrity

- Listing-building relationships are available both directly through listing `building_id` and through `rofo_relationships_listing_buildings.csv`.
- The relationship bridge has 1,264,948 distinct building IDs, which makes it a useful cross-check against `listing_count`.
- Public enrichment should prefer stable building-level aggregation over listing-level claims.

## Lightweight Summary Output

Created:

- `data/peter/normalized/legacy_building_universe_summary.json`

The summary is capped to the top 500 city/state markets by legacy building density and includes only city-level records. No individual building rows were exported.

## Recommended Next Step

Use this audit to select a small set of city/corridor markets where all three conditions are true:

1. Legacy building density is high.
2. Current live building-page overlap exists.
3. The market has enough space-type or geographic diversity to support better internal linking.

Do not use the legacy building universe directly for page generation until duplicate handling, city/ZIP normalization, and listing `space_type` decoding are reviewed.
