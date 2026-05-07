# Neighborhood Opportunity Report

## Neighborhood Counts

* Total neighborhoods: 9,891
* Allowed neighborhoods: 9,886
* Neighborhoods with geo: 5,472
* Neighborhoods with summaries: 47

## Cities With Most Neighborhoods

| city | state | neighborhood_count | allowed_count | with_summary | with_geo | city_building_count_proxy |
| --- | --- | --- | --- | --- | --- | --- |
| Albuquerque | NM | 180 | 180 | 0 | 179 | 10415 |
| Chicago | IL | 161 | 161 | 0 | 158 | 15615 |
| Phoenix | AZ | 146 | 145 | 0 | 142 | 5049 |
| Columbus | OH | 82 | 82 | 0 | 79 | 1470 |
| San Diego | CA | 79 | 79 | 0 | 72 | 5524 |
| Louisville | KY | 71 | 71 | 0 | 69 | 7358 |
| San Francisco | CA | 71 | 71 | 47 | 66 | 27835 |
| Atlanta | GA | 70 | 70 | 0 | 62 | 5513 |
| Houston | TX | 69 | 69 | 0 | 62 | 6303 |
| Denver | CO | 64 | 64 | 0 | 63 | 4736 |
| Austin | TX | 60 | 60 | 0 | 55 | 3406 |
| Pensacola | FL | 58 | 58 | 0 | 57 | 4957 |
| Oakland | CA | 58 | 57 | 0 | 56 | 10844 |
| Wilmington | NC | 57 | 57 | 0 | 57 | 2585 |
| Detroit | MI | 56 | 56 | 0 | 55 | 3185 |
| Grand Rapids | MI | 54 | 54 | 0 | 53 | 3490 |
| Los Angeles | CA | 53 | 53 | 0 | 48 | 6384 |
| Mobile | AL | 53 | 53 | 0 | 51 | 1262 |
| New Orleans | LA | 52 | 52 | 0 | 50 | 4622 |
| Tampa | FL | 51 | 51 | 0 | 47 | 6390 |

## Recognizable Or Higher Confidence Neighborhoods

| neighborhood_name | city | state | has_summary | estimated_building_count |
| --- | --- | --- | --- | --- |
| Pacific Heights | San Francisco | CA | True | 27835 |
| Mission District | San Francisco | CA | True | 27835 |
| Cow Hollow | San Francisco | CA | True | 27835 |
| Temescal | Oakland | CA | False | 10844 |
| Chinatown | San Francisco | CA | True | 27835 |
| Civic Center | San Francisco | CA | True | 27835 |
| Grand Avenue | Oakland | CA | False | 10844 |
| Lower Haight | San Francisco | CA | True | 27835 |
| Russian Hill | San Francisco | CA | True | 27835 |
| North Beach | San Francisco | CA | True | 27835 |
| Telegraph Hill | San Francisco | CA | True | 27835 |
| Nob Hill | San Francisco | CA | True | 27835 |
| Financial District | San Francisco | CA | True | 27835 |
| Montclair | Oakland | CA | False | 10844 |
| East Dublin | Dublin | CA | False | 555 |
| Alameda |  |  | False | 13 |
| Marina | San Francisco | CA | True | 27835 |
| Hawthorne |  |  | False | 13 |
| Onother |  |  | False | 13 |
| Downtown | Oakland | CA | False | 10844 |
| City Center | Oakland | CA | False | 10844 |
| Dowhey |  |  | False | 13 |
| Lakeside | Oakland | CA | False | 10844 |
| SOMA | San Francisco | CA | True | 27835 |
| Panhandle | San Francisco | CA | True | 27835 |

## Recommended Pilot Markets

| city | state | neighborhood_count | allowed_count | with_summary | with_geo | city_building_count_proxy |
| --- | --- | --- | --- | --- | --- | --- |
| Albuquerque | NM | 180 | 180 | 0 | 179 | 10415 |
| Chicago | IL | 161 | 161 | 0 | 158 | 15615 |
| Phoenix | AZ | 146 | 145 | 0 | 142 | 5049 |
| Columbus | OH | 82 | 82 | 0 | 79 | 1470 |
| San Diego | CA | 79 | 79 | 0 | 72 | 5524 |
| Louisville | KY | 71 | 71 | 0 | 69 | 7358 |
| San Francisco | CA | 71 | 71 | 47 | 66 | 27835 |
| Atlanta | GA | 70 | 70 | 0 | 62 | 5513 |
| Houston | TX | 69 | 69 | 0 | 62 | 6303 |
| Denver | CO | 64 | 64 | 0 | 63 | 4736 |
| Austin | TX | 60 | 60 | 0 | 55 | 3406 |
| Pensacola | FL | 58 | 58 | 0 | 57 | 4957 |
| Oakland | CA | 58 | 57 | 0 | 56 | 10844 |
| Wilmington | NC | 57 | 57 | 0 | 57 | 2585 |
| Detroit | MI | 56 | 56 | 0 | 55 | 3185 |

## Building Count Estimate Caveat

`estimated_building_count` is a lightweight city-level proxy repeated on each neighborhood row. It is useful for screening market depth, but it is not a parcel-level geospatial join.

## Rollout Recommendation

Start with markets that combine allowed neighborhood records, summaries, geo fields, and enough nearby building activity. Build a small pilot first, review page quality manually, then expand in batches.
