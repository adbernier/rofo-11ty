# Commercial Ecosystem Scoring

Generated: 2026-05-12

## Scope

This is an aggregate-first scoring pass over the legacy Rofo commercial geography graph. It does not generate pages, modify templates, alter production code, import raw buildings, or expose stale inventory.

The goal is to identify strong commercial ecosystems, not the largest population centers.

## Inputs

- `data/peter/derived/market_signals.csv` for legacy building density, active historical building signals, listing activity, and neighborhood counts.
- `data/peter/raw/rofo_listings.csv` for historical listing space-type diversity by market.
- `data/peter/raw/rofo_buildings.csv` for ZIP concentration and coordinate coverage by market.
- Current Eleventy `buildingPages` data for live graph overlap.
- Current generated city data for nearby market relationships where available.

## Scoring Model

Signals used:

- Normalized building density
- Historical listing activity intensity
- Diversity of historical listing space-type codes
- ZIP concentration as a lightweight clustering proxy
- Coordinate coverage as a neighborhood-assignment readiness proxy
- Legacy neighborhood count
- Nearby market relationships
- Current live building-page overlap
- Hidden density gap where legacy density greatly exceeds current live coverage

No population inputs were used.

## Output Files

- `data/peter/normalized/commercial_ecosystem_candidates.json`
- `data/peter/normalized/commercial_ecosystem_rollout_phase1.json`

Candidate records are market-level only. No individual building rows are exported.

## A. Top Ecosystem Markets Nationally

| market | score | buildings | activity | types | live | profile | priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| San Francisco, CA | 227.1 | 27835 | 14336 | 5 | 100 | neighborhood_dense | immediate |
| Oakland, CA | 215.3 | 10844 | 6302 | 5 | 34 | neighborhood_dense | immediate |
| Denver, CO | 212.9 | 4736 | 18446 | 5 | 46 | neighborhood_dense | immediate |
| Chicago, IL | 211.9 | 15615 | 35954 | 6 | 42 | neighborhood_dense | immediate |
| Albuquerque, NM | 210.2 | 10415 | 42217 | 5 | 4 | neighborhood_dense | immediate |
| Louisville, KY | 207.6 | 7358 | 22965 | 5 | 7 | neighborhood_dense | immediate |
| Tampa, FL | 205.3 | 6390 | 20727 | 5 | 11 | neighborhood_dense | immediate |
| Buffalo, NY | 202.2 | 4658 | 12942 | 5 | 134 | neighborhood_dense | immediate |
| Atlanta, GA | 201.9 | 5513 | 17160 | 5 | 66 | neighborhood_dense | immediate |
| Jacksonville, FL | 201.0 | 5444 | 16558 | 5 | 12 | neighborhood_dense | immediate |
| San Diego, CA | 200.0 | 5524 | 20385 | 4 | 88 | neighborhood_dense | immediate |
| San Jose, CA | 198.9 | 3760 | 13257 | 4 | 75 | neighborhood_dense | immediate |
| New Orleans, LA | 198.8 | 4622 | 11808 | 5 | 4 | neighborhood_dense | immediate |
| Austin, TX | 198.2 | 3406 | 15108 | 4 | 79 | neighborhood_dense | immediate |
| Pensacola, FL | 197.9 | 4957 | 15683 | 5 | 0 | flex/logistics | immediate |
| Phoenix, AZ | 197.2 | 5049 | 21594 | 5 | 100 | neighborhood_dense | immediate |
| Indianapolis, IN | 196.7 | 4393 | 13133 | 6 | 24 | flex/logistics | immediate |
| Fort Wayne, IN | 195.4 | 3759 | 12825 | 5 | 1 | neighborhood_dense | immediate |
| Miami, FL | 195.1 | 5827 | 20484 | 6 | 26 | neighborhood_dense | immediate |
| Sarasota, FL | 193.9 | 6828 | 20539 | 5 | 1 | neighborhood_dense | immediate |
| Los Angeles, CA | 193.4 | 6384 | 17377 | 4 | 166 | neighborhood_dense | immediate |
| Houston, TX | 193.3 | 6303 | 121471 | 3 | 85 | neighborhood_dense | immediate |
| Chattanooga, TN | 193.1 | 3128 | 10751 | 6 | 1 | neighborhood_dense | immediate |
| Knoxville, TN | 191.9 | 6437 | 20457 | 5 | 2 | mixed_commercial | immediate |
| Grand Rapids, MI | 191.4 | 3490 | 15208 | 4 | 1 | neighborhood_dense | immediate |
| Sacramento, CA | 191.2 | 7022 | 11821 | 3 | 137 | neighborhood_dense | immediate |
| Wilmington, NC | 190.3 | 2585 | 5756 | 5 | 0 | neighborhood_dense | immediate |
| Baton Rouge, LA | 190.1 | 8405 | 25977 | 5 | 3 | mixed_commercial | immediate |
| Detroit, MI | 189.9 | 3185 | 6981 | 6 | 4 | neighborhood_dense | immediate |
| San Antonio, TX | 189.1 | 4872 | 11528 | 5 | 13 | neighborhood_dense | immediate |
| Saint Petersburg, FL | 189.0 | 3861 | 10656 | 5 | 2 | neighborhood_dense | immediate |
| Tallahassee, FL | 187.7 | 5124 | 10257 | 5 | 2 | neighborhood_dense | immediate |
| Brooklyn, NY | 186.8 | 4393 | 12609 | 4 | 5 | neighborhood_dense | immediate |
| Baltimore, MD | 186.0 | 1826 | 8417 | 5 | 8 | neighborhood_dense | immediate |
| Lubbock, TX | 183.5 | 4713 | 8900 | 5 | 1 | industrial_corridor | immediate |
| Charlotte, NC | 183.4 | 1600 | 4070 | 6 | 16 | neighborhood_dense | immediate |
| Las Vegas, NV | 183.0 | 3496 | 9616 | 5 | 17 | mixed_commercial | immediate |
| Shreveport, LA | 182.9 | 4129 | 9413 | 5 | 2 | flex/logistics | immediate |
| Fort Lauderdale, FL | 182.1 | 2657 | 10334 | 6 | 4 | mixed_commercial | immediate |
| Memphis, TN | 180.7 | 1264 | 11026 | 4 | 8 | neighborhood_dense | immediate |
| Fort Worth, TX | 180.0 | 1734 | 8864 | 5 | 13 | mixed_commercial | immediate |
| Springfield, MO | 179.7 | 3258 | 10127 | 6 | 0 | mixed_commercial | immediate |
| Evansville, IN | 179.7 | 2852 | 9938 | 5 | 0 | neighborhood_dense | immediate |
| Mobile, AL | 179.3 | 1262 | 2648 | 5 | 2 | neighborhood_dense | immediate |
| Mesa, AZ | 178.7 | 2202 | 9656 | 4 | 8 | neighborhood_dense | immediate |
| Little Rock, AR | 178.5 | 2878 | 7311 | 6 | 1 | neighborhood_dense | immediate |
| Scottsdale, AZ | 178.1 | 1530 | 5210 | 5 | 21 | neighborhood_dense | immediate |
| Colorado Springs, CO | 177.5 | 3556 | 14645 | 4 | 5 | mixed_commercial | immediate |
| Syracuse, NY | 176.9 | 2018 | 5368 | 5 | 45 | flex/logistics | immediate |
| Raleigh, NC | 175.8 | 1935 | 4779 | 5 | 10 | suburban_office | immediate |

## B. Strongest Secondary And Tertiary Opportunities

These markets show strong legacy commercial density while avoiding the most obvious major markets.

| market | score | buildings | activity | types | live | profile | priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Albuquerque, NM | 210.2 | 10415 | 42217 | 5 | 4 | neighborhood_dense | immediate |
| Louisville, KY | 207.6 | 7358 | 22965 | 5 | 7 | neighborhood_dense | immediate |
| Tampa, FL | 205.3 | 6390 | 20727 | 5 | 11 | neighborhood_dense | immediate |
| Jacksonville, FL | 201.0 | 5444 | 16558 | 5 | 12 | neighborhood_dense | immediate |
| New Orleans, LA | 198.8 | 4622 | 11808 | 5 | 4 | neighborhood_dense | immediate |
| Pensacola, FL | 197.9 | 4957 | 15683 | 5 | 0 | flex/logistics | immediate |
| Fort Wayne, IN | 195.4 | 3759 | 12825 | 5 | 1 | neighborhood_dense | immediate |
| Sarasota, FL | 193.9 | 6828 | 20539 | 5 | 1 | neighborhood_dense | immediate |
| Chattanooga, TN | 193.1 | 3128 | 10751 | 6 | 1 | neighborhood_dense | immediate |
| Knoxville, TN | 191.9 | 6437 | 20457 | 5 | 2 | mixed_commercial | immediate |
| Grand Rapids, MI | 191.4 | 3490 | 15208 | 4 | 1 | neighborhood_dense | immediate |
| Wilmington, NC | 190.3 | 2585 | 5756 | 5 | 0 | neighborhood_dense | immediate |
| Baton Rouge, LA | 190.1 | 8405 | 25977 | 5 | 3 | mixed_commercial | immediate |
| Detroit, MI | 189.9 | 3185 | 6981 | 6 | 4 | neighborhood_dense | immediate |
| San Antonio, TX | 189.1 | 4872 | 11528 | 5 | 13 | neighborhood_dense | immediate |
| Saint Petersburg, FL | 189.0 | 3861 | 10656 | 5 | 2 | neighborhood_dense | immediate |
| Tallahassee, FL | 187.7 | 5124 | 10257 | 5 | 2 | neighborhood_dense | immediate |
| Brooklyn, NY | 186.8 | 4393 | 12609 | 4 | 5 | neighborhood_dense | immediate |
| Baltimore, MD | 186.0 | 1826 | 8417 | 5 | 8 | neighborhood_dense | immediate |
| Lubbock, TX | 183.5 | 4713 | 8900 | 5 | 1 | industrial_corridor | immediate |
| Charlotte, NC | 183.4 | 1600 | 4070 | 6 | 16 | neighborhood_dense | immediate |
| Las Vegas, NV | 183.0 | 3496 | 9616 | 5 | 17 | mixed_commercial | immediate |
| Shreveport, LA | 182.9 | 4129 | 9413 | 5 | 2 | flex/logistics | immediate |
| Fort Lauderdale, FL | 182.1 | 2657 | 10334 | 6 | 4 | mixed_commercial | immediate |
| Memphis, TN | 180.7 | 1264 | 11026 | 4 | 8 | neighborhood_dense | immediate |
| Fort Worth, TX | 180.0 | 1734 | 8864 | 5 | 13 | mixed_commercial | immediate |
| Springfield, MO | 179.7 | 3258 | 10127 | 6 | 0 | mixed_commercial | immediate |
| Evansville, IN | 179.7 | 2852 | 9938 | 5 | 0 | neighborhood_dense | immediate |
| Mobile, AL | 179.3 | 1262 | 2648 | 5 | 2 | neighborhood_dense | immediate |
| Mesa, AZ | 178.7 | 2202 | 9656 | 4 | 8 | neighborhood_dense | immediate |
| Little Rock, AR | 178.5 | 2878 | 7311 | 6 | 1 | neighborhood_dense | immediate |
| Colorado Springs, CO | 177.5 | 3556 | 14645 | 4 | 5 | mixed_commercial | immediate |
| Raleigh, NC | 175.8 | 1935 | 4779 | 5 | 10 | suburban_office | immediate |
| Corpus Christi, TX | 175.7 | 4996 | 11047 | 5 | 0 | flex/logistics | immediate |
| Lansing, MI | 175.4 | 2863 | 7846 | 5 | 1 | mixed_commercial | immediate |
| Minneapolis, MN | 175.2 | 1570 | 5845 | 6 | 8 | neighborhood_dense | immediate |
| Augusta, GA | 175.1 | 3739 | 12464 | 5 | 0 | flex/logistics | immediate |
| Ann Arbor, MI | 174.7 | 1744 | 6360 | 5 | 1 | suburban_office | immediate |
| Hayward, CA | 174.3 | 4074 | 2974 | 4 | 10 | flex/logistics | immediate |
| Bradenton, FL | 173.7 | 3897 | 11333 | 5 | 0 | mixed_commercial | immediate |
| Orlando, FL | 173.5 | 1795 | 5525 | 5 | 10 | mixed_commercial | immediate |
| Lexington, KY | 173.4 | 1445 | 5834 | 5 | 4 | neighborhood_dense | immediate |
| El Paso, TX | 173.2 | 2218 | 4746 | 5 | 2 | flex/logistics | immediate |
| Boise, ID | 172.5 | 3697 | 7383 | 5 | 1 | mixed_commercial | immediate |
| Naples, FL | 172.2 | 1789 | 5580 | 6 | 2 | mixed_commercial | immediate |
| Oklahoma City, OK | 171.0 | 5094 | 15805 | 4 | 3 | mixed_commercial | immediate |
| Daytona Beach, FL | 170.6 | 2157 | 5396 | 5 | 0 | neighborhood_dense | immediate |
| Spokane, WA | 170.5 | 2959 | 7993 | 4 | 1 | mixed_commercial | immediate |
| Philadelphia, PA | 169.8 | 1893 | 5134 | 7 | 10 | mixed_commercial | immediate |
| Long Beach, CA | 169.5 | 1137 | 2393 | 5 | 5 | uncertain | immediate |

## C. Strongest Suburban Office Ecosystems

| market | score | buildings | activity | types | live | profile | priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Raleigh, NC | 175.8 | 1935 | 4779 | 5 | 10 | suburban_office | immediate |
| Ann Arbor, MI | 174.7 | 1744 | 6360 | 5 | 1 | suburban_office | immediate |
| Roseville, CA | 168.6 | 1607 | 1512 | 5 | 38 | suburban_office | immediate |
| Seattle, WA | 167.4 | 1099 | 2617 | 6 | 17 | suburban_office | immediate |
| Saint Paul, MN | 167.0 | 1209 | 4515 | 6 | 2 | suburban_office | immediate |
| Metairie, LA | 165.8 | 1302 | 5035 | 5 | 3 | suburban_office | immediate |
| Berkeley, CA | 165.3 | 3191 | 1375 | 4 | 2 | suburban_office | immediate |
| Portland, OR | 164.5 | 1298 | 4005 | 4 | 8 | suburban_office | immediate |
| Gilbert, AZ | 164.1 | 691 | 3092 | 4 | 0 | suburban_office | immediate |
| Santa Rosa, CA | 163.7 | 1015 | 1987 | 5 | 2 | suburban_office | immediate |
| San Bernardino, CA | 163.2 | 914 | 2318 | 6 | 5 | suburban_office | immediate |
| Saginaw, MI | 163.2 | 1355 | 3453 | 5 | 0 | suburban_office | immediate |
| Portland, ME | 162.8 | 1326 | 4367 | 5 | 0 | suburban_office | immediate |
| Bronx, NY | 161.2 | 1038 | 1748 | 5 | 1 | suburban_office | immediate |
| Salt Lake City, UT | 160.8 | 833 | 1985 | 6 | 6 | suburban_office | immediate |
| Fremont, CA | 160.4 | 2805 | 2764 | 3 | 8 | suburban_office | immediate |
| Washington, DC | 159.2 | 778 | 2728 | 5 | 16 | suburban_office | immediate |
| Jackson, MS | 159.1 | 1320 | 3184 | 6 | 1 | suburban_office | immediate |
| Boston, MA | 159.1 | 1053 | 2139 | 5 | 18 | suburban_office | immediate |
| Pasadena, CA | 159.0 | 819 | 2261 | 5 | 4 | suburban_office | immediate |
| Manchester, NH | 158.9 | 1097 | 4192 | 5 | 1 | suburban_office | immediate |
| Charleston, SC | 158.4 | 892 | 1944 | 5 | 2 | suburban_office | immediate |
| Allentown, PA | 158.3 | 831 | 2751 | 5 | 1 | suburban_office | immediate |
| Alpharetta, GA | 157.9 | 1618 | 5144 | 4 | 6 | suburban_office | immediate |
| Redwood City, CA | 157.8 | 2224 | 1570 | 4 | 5 | suburban_office | immediate |
| Arlington, TX | 157.6 | 806 | 2705 | 5 | 3 | suburban_office | immediate |
| Milwaukee, WI | 157.6 | 861 | 1918 | 5 | 6 | suburban_office | immediate |
| Santa Fe, NM | 157.4 | 1317 | 4597 | 5 | 1 | suburban_office | immediate |
| Madison, WI | 157.1 | 923 | 3109 | 5 | 2 | suburban_office | immediate |
| Nashville, TN | 155.8 | 572 | 1557 | 6 | 10 | suburban_office | immediate |
| Warren, MI | 155.7 | 1607 | 4440 | 4 | 0 | suburban_office | immediate |
| Palm Desert, CA | 155.1 | 1171 | 4443 | 5 | 0 | suburban_office | immediate |
| West Palm Beach, FL | 154.7 | 793 | 2445 | 6 | 2 | suburban_office | immediate |
| Southfield, MI | 153.4 | 1995 | 8403 | 4 | 3 | suburban_office | immediate |
| Naperville, IL | 153.4 | 948 | 3030 | 6 | 6 | suburban_office | immediate |
| Livonia, MI | 153.2 | 2688 | 7243 | 4 | 0 | suburban_office | immediate |
| New Port Richey, FL | 152.9 | 1348 | 4708 | 4 | 0 | suburban_office | immediate |
| Wilmington, DE | 152.4 | 940 | 3556 | 5 | 1 | suburban_office | immediate |
| Pittsburgh, PA | 152.1 | 561 | 1747 | 7 | 7 | suburban_office | immediate |
| Troy, MI | 151.9 | 1317 | 8614 | 4 | 2 | suburban_office | immediate |
| Richmond, CA | 151.9 | 1869 | 1176 | 4 | 0 | suburban_office | immediate |
| Tempe, AZ | 151.7 | 886 | 4326 | 4 | 6 | suburban_office | immediate |
| Irvine, CA | 151.4 | 2006 | 6498 | 2 | 23 | suburban_office | immediate |
| Flint, MI | 150.8 | 1261 | 3735 | 4 | 0 | suburban_office | immediate |
| Worcester, MA | 150.8 | 984 | 1690 | 5 | 0 | suburban_office | immediate |
| Providence, RI | 150.7 | 429 | 862 | 5 | 1 | suburban_office | immediate |
| Chandler, AZ | 150.6 | 1561 | 4084 | 4 | 4 | suburban_office | immediate |
| Tacoma, WA | 150.3 | 697 | 1196 | 6 | 1 | suburban_office | immediate |
| Santa Monica, CA | 149.5 | 664 | 1627 | 4 | 21 | suburban_office | immediate |
| McAllen, TX | 149.4 | 980 | 2511 | 5 | 0 | suburban_office | immediate |

## D. Strongest Industrial And Logistics Ecosystems

| market | score | buildings | activity | types | live | profile | priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pensacola, FL | 197.9 | 4957 | 15683 | 5 | 0 | flex/logistics | immediate |
| Indianapolis, IN | 196.7 | 4393 | 13133 | 6 | 24 | flex/logistics | immediate |
| Lubbock, TX | 183.5 | 4713 | 8900 | 5 | 1 | industrial_corridor | immediate |
| Shreveport, LA | 182.9 | 4129 | 9413 | 5 | 2 | flex/logistics | immediate |
| Syracuse, NY | 176.9 | 2018 | 5368 | 5 | 45 | flex/logistics | immediate |
| Corpus Christi, TX | 175.7 | 4996 | 11047 | 5 | 0 | flex/logistics | immediate |
| Augusta, GA | 175.1 | 3739 | 12464 | 5 | 0 | flex/logistics | immediate |
| Hayward, CA | 174.3 | 4074 | 2974 | 4 | 10 | flex/logistics | immediate |
| El Paso, TX | 173.2 | 2218 | 4746 | 5 | 2 | flex/logistics | immediate |
| Stockton, CA | 171.2 | 3380 | 2385 | 4 | 36 | flex/logistics | immediate |
| Waco, TX | 169.2 | 2572 | 3710 | 5 | 0 | industrial_corridor | immediate |
| Savannah, GA | 169.2 | 1867 | 3885 | 5 | 1 | flex/logistics | immediate |
| Port Charlotte, FL | 169.2 | 2183 | 5073 | 6 | 0 | flex/logistics | immediate |
| Salem, OR | 168.8 | 2129 | 7064 | 5 | 0 | flex/logistics | immediate |
| Richmond, VA | 168.0 | 1314 | 3192 | 7 | 5 | flex/logistics | immediate |
| Fort Myers, FL | 167.7 | 1749 | 4119 | 6 | 0 | flex/logistics | immediate |
| Rockford, IL | 166.9 | 2341 | 5033 | 6 | 1 | flex/logistics | immediate |
| Riverside, CA | 166.9 | 1426 | 2602 | 5 | 2 | flex/logistics | immediate |
| Lafayette, LA | 166.1 | 2632 | 6830 | 5 | 0 | flex/logistics | immediate |
| Ocala, FL | 165.3 | 2728 | 5031 | 5 | 0 | flex/logistics | immediate |
| Lakeland, FL | 165.1 | 1404 | 3202 | 5 | 0 | flex/logistics | immediate |
| Fayetteville, NC | 164.7 | 1401 | 3350 | 5 | 1 | flex/logistics | immediate |
| Punta Gorda, FL | 163.6 | 1437 | 3256 | 6 | 0 | industrial_corridor | immediate |
| Billings, MT | 162.4 | 3710 | 7357 | 5 | 0 | flex/logistics | immediate |
| New Braunfels, TX | 161.9 | 3984 | 7019 | 5 | 0 | industrial_corridor | immediate |
| Greenville, SC | 161.7 | 1520 | 2797 | 6 | 3 | flex/logistics | immediate |
| Las Cruces, NM | 161.7 | 1442 | 3586 | 5 | 0 | industrial_corridor | immediate |
| Lehigh Acres, FL | 161.5 | 1123 | 1537 | 6 | 0 | industrial_corridor | immediate |
| Cape Coral, FL | 161.5 | 1380 | 1750 | 5 | 0 | industrial_corridor | immediate |
| Bakersfield, CA | 161.2 | 1112 | 1480 | 6 | 3 | flex/logistics | immediate |
| Muskegon, MI | 160.9 | 916 | 2031 | 5 | 0 | flex/logistics | immediate |
| Fort Pierce, FL | 160.6 | 1703 | 2763 | 7 | 1 | industrial_corridor | immediate |
| Anaheim, CA | 160.3 | 2096 | 5336 | 3 | 29 | flex/logistics | immediate |
| Traverse City, MI | 160.2 | 2667 | 4741 | 5 | 0 | flex/logistics | immediate |
| Myrtle Beach, SC | 159.7 | 3280 | 5280 | 6 | 0 | flex/logistics | immediate |
| Tucson, AZ | 159.7 | 780 | 1086 | 6 | 2 | industrial_corridor | immediate |
| Tulsa, OK | 159.0 | 925 | 1393 | 6 | 7 | flex/logistics | immediate |
| Hattiesburg, MS | 158.8 | 3247 | 5210 | 5 | 0 | flex/logistics | immediate |
| Covington, LA | 158.6 | 2539 | 5319 | 5 | 0 | flex/logistics | immediate |
| Rio Rancho, NM | 158.6 | 2016 | 4729 | 5 | 0 | industrial_corridor | immediate |
| Winston Salem, NC | 158.5 | 1025 | 1570 | 5 | 4 | flex/logistics | immediate |
| Panama City, FL | 158.4 | 1163 | 1817 | 6 | 0 | flex/logistics | immediate |
| Fredericksburg, VA | 158.3 | 1082 | 1943 | 6 | 2 | flex/logistics | immediate |
| Saint Augustine, FL | 157.7 | 1072 | 2233 | 6 | 1 | flex/logistics | immediate |
| Columbia, SC | 157.3 | 907 | 1395 | 6 | 2 | industrial_corridor | immediate |
| Vero Beach, FL | 157.1 | 1170 | 2238 | 6 | 1 | industrial_corridor | immediate |
| Henderson, NV | 157.0 | 631 | 1247 | 6 | 3 | flex/logistics | immediate |
| Victorville, CA | 156.9 | 2823 | 5015 | 5 | 1 | flex/logistics | immediate |
| Peoria, IL | 156.9 | 1324 | 2886 | 5 | 0 | flex/logistics | immediate |
| Amarillo, TX | 156.7 | 1172 | 1516 | 5 | 0 | industrial_corridor | immediate |

## E. Markets Likely Ready For Neighborhood Expansion

Readiness is based on legacy neighborhood count, building density, and coordinate coverage. This is a planning signal only, not a launch decision.

| market | score | buildings | activity | types | live | profile | priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| San Francisco, CA | 227.1 | 27835 | 14336 | 5 | 100 | neighborhood_dense | immediate |
| Oakland, CA | 215.3 | 10844 | 6302 | 5 | 34 | neighborhood_dense | immediate |
| Denver, CO | 212.9 | 4736 | 18446 | 5 | 46 | neighborhood_dense | immediate |
| Chicago, IL | 211.9 | 15615 | 35954 | 6 | 42 | neighborhood_dense | immediate |
| Albuquerque, NM | 210.2 | 10415 | 42217 | 5 | 4 | neighborhood_dense | immediate |
| Louisville, KY | 207.6 | 7358 | 22965 | 5 | 7 | neighborhood_dense | immediate |
| Tampa, FL | 205.3 | 6390 | 20727 | 5 | 11 | neighborhood_dense | immediate |
| Buffalo, NY | 202.2 | 4658 | 12942 | 5 | 134 | neighborhood_dense | immediate |
| Atlanta, GA | 201.9 | 5513 | 17160 | 5 | 66 | neighborhood_dense | immediate |
| Jacksonville, FL | 201.0 | 5444 | 16558 | 5 | 12 | neighborhood_dense | immediate |
| San Diego, CA | 200.0 | 5524 | 20385 | 4 | 88 | neighborhood_dense | immediate |
| San Jose, CA | 198.9 | 3760 | 13257 | 4 | 75 | neighborhood_dense | immediate |
| New Orleans, LA | 198.8 | 4622 | 11808 | 5 | 4 | neighborhood_dense | immediate |
| Austin, TX | 198.2 | 3406 | 15108 | 4 | 79 | neighborhood_dense | immediate |
| Pensacola, FL | 197.9 | 4957 | 15683 | 5 | 0 | flex/logistics | immediate |
| Phoenix, AZ | 197.2 | 5049 | 21594 | 5 | 100 | neighborhood_dense | immediate |
| Indianapolis, IN | 196.7 | 4393 | 13133 | 6 | 24 | flex/logistics | immediate |
| Fort Wayne, IN | 195.4 | 3759 | 12825 | 5 | 1 | neighborhood_dense | immediate |
| Miami, FL | 195.1 | 5827 | 20484 | 6 | 26 | neighborhood_dense | immediate |
| Sarasota, FL | 193.9 | 6828 | 20539 | 5 | 1 | neighborhood_dense | immediate |
| Los Angeles, CA | 193.4 | 6384 | 17377 | 4 | 166 | neighborhood_dense | immediate |
| Houston, TX | 193.3 | 6303 | 121471 | 3 | 85 | neighborhood_dense | immediate |
| Chattanooga, TN | 193.1 | 3128 | 10751 | 6 | 1 | neighborhood_dense | immediate |
| Knoxville, TN | 191.9 | 6437 | 20457 | 5 | 2 | mixed_commercial | immediate |
| Grand Rapids, MI | 191.4 | 3490 | 15208 | 4 | 1 | neighborhood_dense | immediate |
| Sacramento, CA | 191.2 | 7022 | 11821 | 3 | 137 | neighborhood_dense | immediate |
| Wilmington, NC | 190.3 | 2585 | 5756 | 5 | 0 | neighborhood_dense | immediate |
| Baton Rouge, LA | 190.1 | 8405 | 25977 | 5 | 3 | mixed_commercial | immediate |
| Detroit, MI | 189.9 | 3185 | 6981 | 6 | 4 | neighborhood_dense | immediate |
| Saint Petersburg, FL | 189.0 | 3861 | 10656 | 5 | 2 | neighborhood_dense | immediate |
| Brooklyn, NY | 186.8 | 4393 | 12609 | 4 | 5 | neighborhood_dense | immediate |
| Baltimore, MD | 186.0 | 1826 | 8417 | 5 | 8 | neighborhood_dense | immediate |
| Charlotte, NC | 183.4 | 1600 | 4070 | 6 | 16 | neighborhood_dense | immediate |
| Las Vegas, NV | 183.0 | 3496 | 9616 | 5 | 17 | mixed_commercial | immediate |
| Shreveport, LA | 182.9 | 4129 | 9413 | 5 | 2 | flex/logistics | immediate |
| Fort Lauderdale, FL | 182.1 | 2657 | 10334 | 6 | 4 | mixed_commercial | immediate |
| Memphis, TN | 180.7 | 1264 | 11026 | 4 | 8 | neighborhood_dense | immediate |
| Fort Worth, TX | 180.0 | 1734 | 8864 | 5 | 13 | mixed_commercial | immediate |
| Springfield, MO | 179.7 | 3258 | 10127 | 6 | 0 | mixed_commercial | immediate |
| Evansville, IN | 179.7 | 2852 | 9938 | 5 | 0 | neighborhood_dense | immediate |
| Mobile, AL | 179.3 | 1262 | 2648 | 5 | 2 | neighborhood_dense | immediate |
| Mesa, AZ | 178.7 | 2202 | 9656 | 4 | 8 | neighborhood_dense | immediate |
| Scottsdale, AZ | 178.1 | 1530 | 5210 | 5 | 21 | neighborhood_dense | immediate |
| Colorado Springs, CO | 177.5 | 3556 | 14645 | 4 | 5 | mixed_commercial | immediate |
| Syracuse, NY | 176.9 | 2018 | 5368 | 5 | 45 | flex/logistics | immediate |
| Raleigh, NC | 175.8 | 1935 | 4779 | 5 | 10 | suburban_office | immediate |
| Lansing, MI | 175.4 | 2863 | 7846 | 5 | 1 | mixed_commercial | immediate |
| Minneapolis, MN | 175.2 | 1570 | 5845 | 6 | 8 | neighborhood_dense | immediate |
| Ann Arbor, MI | 174.7 | 1744 | 6360 | 5 | 1 | suburban_office | immediate |
| Hayward, CA | 174.3 | 4074 | 2974 | 4 | 10 | flex/logistics | immediate |

## F. Markets Where Current Rofo Coverage Is Weak Relative To Latent Density

These are markets where the live graph appears to underrepresent the historical commercial geography graph.

| market | score | buildings | activity | types | live | profile | priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Albuquerque, NM | 210.2 | 10415 | 42217 | 5 | 4 | neighborhood_dense | immediate |
| New Orleans, LA | 198.8 | 4622 | 11808 | 5 | 4 | neighborhood_dense | immediate |
| Pensacola, FL | 197.9 | 4957 | 15683 | 5 | 0 | flex/logistics | immediate |
| Fort Wayne, IN | 195.4 | 3759 | 12825 | 5 | 1 | neighborhood_dense | immediate |
| Sarasota, FL | 193.9 | 6828 | 20539 | 5 | 1 | neighborhood_dense | immediate |
| Chattanooga, TN | 193.1 | 3128 | 10751 | 6 | 1 | neighborhood_dense | immediate |
| Knoxville, TN | 191.9 | 6437 | 20457 | 5 | 2 | mixed_commercial | immediate |
| Grand Rapids, MI | 191.4 | 3490 | 15208 | 4 | 1 | neighborhood_dense | immediate |
| Wilmington, NC | 190.3 | 2585 | 5756 | 5 | 0 | neighborhood_dense | immediate |
| Baton Rouge, LA | 190.1 | 8405 | 25977 | 5 | 3 | mixed_commercial | immediate |
| Detroit, MI | 189.9 | 3185 | 6981 | 6 | 4 | neighborhood_dense | immediate |
| Saint Petersburg, FL | 189.0 | 3861 | 10656 | 5 | 2 | neighborhood_dense | immediate |
| Tallahassee, FL | 187.7 | 5124 | 10257 | 5 | 2 | neighborhood_dense | immediate |
| Lubbock, TX | 183.5 | 4713 | 8900 | 5 | 1 | industrial_corridor | immediate |
| Shreveport, LA | 182.9 | 4129 | 9413 | 5 | 2 | flex/logistics | immediate |
| Fort Lauderdale, FL | 182.1 | 2657 | 10334 | 6 | 4 | mixed_commercial | immediate |
| Springfield, MO | 179.7 | 3258 | 10127 | 6 | 0 | mixed_commercial | immediate |
| Evansville, IN | 179.7 | 2852 | 9938 | 5 | 0 | neighborhood_dense | immediate |
| Mobile, AL | 179.3 | 1262 | 2648 | 5 | 2 | neighborhood_dense | immediate |
| Little Rock, AR | 178.5 | 2878 | 7311 | 6 | 1 | neighborhood_dense | immediate |
| Corpus Christi, TX | 175.7 | 4996 | 11047 | 5 | 0 | flex/logistics | immediate |
| Lansing, MI | 175.4 | 2863 | 7846 | 5 | 1 | mixed_commercial | immediate |
| Augusta, GA | 175.1 | 3739 | 12464 | 5 | 0 | flex/logistics | immediate |
| Ann Arbor, MI | 174.7 | 1744 | 6360 | 5 | 1 | suburban_office | immediate |
| Bradenton, FL | 173.7 | 3897 | 11333 | 5 | 0 | mixed_commercial | immediate |
| Lexington, KY | 173.4 | 1445 | 5834 | 5 | 4 | neighborhood_dense | immediate |
| El Paso, TX | 173.2 | 2218 | 4746 | 5 | 2 | flex/logistics | immediate |
| Boise, ID | 172.5 | 3697 | 7383 | 5 | 1 | mixed_commercial | immediate |
| Naples, FL | 172.2 | 1789 | 5580 | 6 | 2 | mixed_commercial | immediate |
| Oklahoma City, OK | 171.0 | 5094 | 15805 | 4 | 3 | mixed_commercial | immediate |
| Daytona Beach, FL | 170.6 | 2157 | 5396 | 5 | 0 | neighborhood_dense | immediate |
| Spokane, WA | 170.5 | 2959 | 7993 | 4 | 1 | mixed_commercial | immediate |
| Waco, TX | 169.2 | 2572 | 3710 | 5 | 0 | industrial_corridor | immediate |
| Savannah, GA | 169.2 | 1867 | 3885 | 5 | 1 | flex/logistics | immediate |
| Port Charlotte, FL | 169.2 | 2183 | 5073 | 6 | 0 | flex/logistics | immediate |
| Gainesville, FL | 169.1 | 2344 | 6529 | 5 | 0 | mixed_commercial | immediate |
| Salem, OR | 168.8 | 2129 | 7064 | 5 | 0 | flex/logistics | immediate |
| Fresno, CA | 168.1 | 2346 | 5667 | 5 | 1 | mixed_commercial | immediate |
| Fort Myers, FL | 167.7 | 1749 | 4119 | 6 | 0 | flex/logistics | immediate |
| Clearwater, FL | 167.6 | 1538 | 6415 | 5 | 1 | mixed_commercial | immediate |
| Saint Paul, MN | 167.0 | 1209 | 4515 | 6 | 2 | suburban_office | immediate |
| Rockford, IL | 166.9 | 2341 | 5033 | 6 | 1 | flex/logistics | immediate |
| Riverside, CA | 166.9 | 1426 | 2602 | 5 | 2 | flex/logistics | immediate |
| Lafayette, LA | 166.1 | 2632 | 6830 | 5 | 0 | flex/logistics | immediate |
| Reno, NV | 166.0 | 2057 | 7841 | 4 | 2 | mixed_commercial | immediate |
| Metairie, LA | 165.8 | 1302 | 5035 | 5 | 3 | suburban_office | immediate |
| Omaha, NE | 165.4 | 2002 | 6476 | 4 | 3 | mixed_commercial | immediate |
| Harrisburg, PA | 165.3 | 2055 | 8163 | 5 | 1 | mixed_commercial | immediate |
| Ocala, FL | 165.3 | 2728 | 5031 | 5 | 0 | flex/logistics | immediate |
| Berkeley, CA | 165.3 | 3191 | 1375 | 4 | 2 | suburban_office | immediate |

## G. Markets That Should Probably Not Be Revived Yet

These markets have weak aggregate ecosystem signals or too little useful structure for near-term rollout.

| market | score | buildings | activity | types | live | profile | priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Hoyt, KS | 29.9 | 3 | 6 | 0 | 0 | uncertain | suppress |
| Sand Point, AK | 29.9 | 3 | 6 | 2 | 0 | uncertain | suppress |
| Ahsahka, ID | 29.8 | 3 | 4 | 1 | 0 | uncertain | suppress |
| Clarendon, AR | 29.8 | 3 | 4 | 1 | 0 | uncertain | suppress |
| Greenwood, ME | 29.8 | 3 | 4 | 1 | 0 | uncertain | suppress |
| Hadley, MI | 29.8 | 3 | 4 | 1 | 0 | uncertain | suppress |
| Kensington, MN | 29.8 | 3 | 4 | 1 | 0 | uncertain | suppress |
| Shullsburg, WI | 29.8 | 3 | 4 | 1 | 0 | uncertain | suppress |
| Wheeler, WI | 29.8 | 3 | 4 | 1 | 0 | uncertain | suppress |
| Mount Gilead, OH | 29.8 | 16 | 2 | 0 | 0 | uncertain | suppress |
| Brooktondale, NY | 29.6 | 2 | 3 | 1 | 0 | uncertain | suppress |
| Carney, OK | 29.6 | 2 | 3 | 1 | 0 | uncertain | suppress |
| Cullen, LA | 29.6 | 2 | 3 | 1 | 0 | uncertain | suppress |
| Mermentau, LA | 29.6 | 2 | 3 | 1 | 0 | uncertain | suppress |
| Tonopah, NV | 29.6 | 2 | 3 | 1 | 0 | uncertain | suppress |
| Monroe Center, IL | 29.4 | 3 | 5 | 0 | 0 | uncertain | suppress |
| Tulelake, CA | 29.4 | 2 | 10 | 0 | 0 | uncertain | suppress |
| Washington Boro, PA | 29.4 | 2 | 10 | 0 | 0 | uncertain | suppress |
| Cherryville, MO | 29.4 | 5 | 5 | 1 | 0 | uncertain | suppress |
| Higdon, AL | 29.4 | 5 | 5 | 1 | 0 | uncertain | suppress |
| Hollister, FL | 29.4 | 5 | 5 | 1 | 0 | uncertain | suppress |
| Huguenot, NY | 29.4 | 5 | 5 | 1 | 0 | uncertain | suppress |
| Maxeys, GA | 29.4 | 5 | 5 | 1 | 0 | uncertain | suppress |
| Oakman, AL | 29.4 | 5 | 5 | 1 | 0 | uncertain | suppress |
| Powhatan, AR | 29.4 | 5 | 5 | 1 | 0 | uncertain | suppress |
| Wells, TX | 29.4 | 5 | 5 | 1 | 0 | uncertain | suppress |
| Wheatland, MO | 29.4 | 5 | 5 | 1 | 0 | uncertain | suppress |
| Lerna, IL | 29.4 | 5 | 4 | 0 | 0 | uncertain | suppress |
| Greensboro, VT | 29.4 | 4 | 2 | 0 | 0 | uncertain | suppress |
| Louisville, OH | 29.4 | 12 | 0 | 0 | 0 | uncertain | suppress |
| Rossford, OH | 29.4 | 9 | 0 | 0 | 0 | uncertain | suppress |
| Union, NH | 29.3 | 1 | 8 | 1 | 0 | uncertain | suppress |
| Canute, OK | 29.3 | 6 | 6 | 1 | 0 | uncertain | suppress |
| Donie, TX | 29.3 | 6 | 6 | 1 | 0 | uncertain | suppress |
| Mount Gilead, NC | 29.3 | 6 | 6 | 1 | 0 | uncertain | suppress |
| Palmer, TN | 29.3 | 6 | 6 | 1 | 0 | uncertain | suppress |
| Swartz, LA | 29.3 | 6 | 6 | 1 | 0 | uncertain | suppress |
| Wappapello, MO | 29.3 | 6 | 6 | 1 | 0 | uncertain | suppress |
| Yatahey, NM | 29.3 | 6 | 6 | 1 | 0 | uncertain | suppress |
| Columbiana, OH | 29.3 | 13 | 0 | 0 | 0 | uncertain | suppress |
| Port Clinton, OH | 29.3 | 13 | 0 | 0 | 0 | uncertain | suppress |
| Lizton, IN | 29.2 | 3 | 7 | 1 | 0 | uncertain | suppress |
| Maricopa, CA | 29.2 | 4 | 6 | 0 | 0 | uncertain | suppress |
| Alma, KS | 29.1 | 2 | 3 | 1 | 0 | uncertain | suppress |
| Arlington, MN | 29.1 | 2 | 3 | 1 | 0 | uncertain | suppress |
| Au Sable Forks, NY | 29.1 | 2 | 3 | 1 | 0 | uncertain | suppress |
| Bellvue, CO | 29.1 | 2 | 3 | 1 | 0 | uncertain | suppress |
| Dakota, MN | 29.1 | 2 | 3 | 1 | 0 | uncertain | suppress |
| Eastsound, WA | 29.1 | 2 | 3 | 1 | 0 | uncertain | suppress |
| Fairfax, IA | 29.1 | 2 | 3 | 1 | 0 | uncertain | suppress |

## H. Strategic Observations

### What The Legacy Graph Suggests

The legacy graph is much larger than the current public graph and contains strong signals for commercial geography, corridor structure, and market density. The strongest opportunities are not necessarily the biggest population centers. Several secondary markets show unusually high building density and historical activity, which could support future market hubs, neighborhood pages, or representative building ecosystems.

### How Rofo Differs From Listing Marketplaces

Rofo should not revive stale listings or imply current availability. The legacy graph is more valuable as a commercial context graph:

- Market density
- Historical activity intensity
- Representative building ecosystems
- Neighborhood and corridor discovery
- Space-type mix by market
- Semantic context from historical descriptions

This is a better fit for market intelligence than for live listing grids.

### Recommended Rollout Sequencing

1. Improve current live city pages where active building overlap already exists.
2. Add internal linking around strong markets, nearby markets, building pages, and space-type pages.
3. Select a small number of secondary/tertiary ecosystem markets for deeper manual review.
4. Use neighborhood expansion only where coordinates, neighborhood structure, and representative buildings align.
5. Keep industrial/logistics corridors as a separate content pattern because they may not behave like downtown neighborhood pages.

### What Not To Do

- Do not import all historical buildings into production.
- Do not expose stale listing-level availability, pricing, suites, or old listing language.
- Do not generate public pages solely from legacy density.
- Do not treat numeric space-type codes as public labels until decoded and reviewed.

## First Structured Rollout Shortlist

The phase 1 rollout JSON contains 100 markets. It is capped at 100 and uses state caps to preserve geographic diversity.
