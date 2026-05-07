# Peter Dataset Overview

## Row Counts

| file | rows | columns |
| --- | --- | --- |
| rofo_buildings.csv | 1503544 | 24 |
| rofo_listings.csv | 3264927 | 20 |
| rofo_leads.csv | 215405 | 19 |
| rofo_users.csv | 212532 | 11 |
| rofo_broker_houses.csv | 12929 | 9 |
| rofo_market_summary.csv | 21627 | 10 |
| rofo_relationships_leads.csv | 215405 | 8 |
| rofo_relationships_listing_buildings.csv | 3264010 | 5 |
| rofo_data_dictionary.csv | 21 | 3 |
| derived/cities_from_legacy.csv | 29796 | 12 |
| derived/neighborhoods_from_legacy.csv | 9891 | 12 |
| derived/building_signals.csv | 1503544 | 24 |
| derived/market_signals.csv | 18616 | 14 |
| derived/neighborhood_signals.csv | 9891 | 13 |

## Building Schema Summary

| column | non_null | missing_pct | dtype |
| --- | --- | --- | --- |
| building_id | 1503544 | 0.0 | int64 |
| name | 644519 | 57.1 | object |
| street_number | 753913 | 49.9 | object |
| street_name | 761838 | 49.3 | object |
| address | 1503468 | 0.0 | object |
| city_id | 1503544 | 0.0 | int64 |
| city | 1503531 | 0.0 | object |
| state | 1503531 | 0.0 | object |
| zip | 1503544 | 0.0 | int64 |
| county_id | 1503544 | 0.0 | int64 |
| county | 196029 | 87.0 | object |
| metro | 194117 | 87.1 | object |
| lat | 1503544 | 0.0 | float64 |
| lng | 1503544 | 0.0 | float64 |
| building_size | 1503544 | 0.0 | int64 |
| floors | 1503544 | 0.0 | int64 |
| units | 1503544 | 0.0 | int64 |
| min_size | 1503544 | 0.0 | int64 |
| max_size | 1503544 | 0.0 | int64 |
| broker_house_id | 1503544 | 0.0 | int64 |
| listing_count | 1503544 | 0.0 | int64 |
| has_association | 1503544 | 0.0 | int64 |
| redirect_id | 1503544 | 0.0 | int64 |
| updated_at | 1503544 | 0.0 | object |

## Listing Schema Summary

| column | non_null | missing_pct | dtype |
| --- | --- | --- | --- |
| listing_id | 3264927 | 0.0 | int64 |
| building_id | 3264927 | 0.0 | int64 |
| contact_user_id | 3264927 | 0.0 | int64 |
| city_id | 3264927 | 0.0 | int64 |
| city | 3264006 | 0.0 | object |
| state | 3264006 | 0.0 | object |
| county | 610202 | 81.3 | object |
| square_footage | 3264927 | 0.0 | float64 |
| space_type | 3264927 | 0.0 | int64 |
| lease_type | 3264927 | 0.0 | int64 |
| listing_type | 3264927 | 0.0 | object |
| price_selection | 3264881 | 0.0 | object |
| price_type | 3233864 | 1.0 | object |
| price_sqft | 3264927 | 0.0 | float64 |
| sqft_price | 3264927 | 0.0 | float64 |
| status | 3264927 | 0.0 | int64 |
| source | 3264927 | 0.0 | object |
| external_url | 191352 | 94.1 | object |
| created_at | 3264927 | 0.0 | object |
| updated_at | 3264927 | 0.0 | object |

## Missingness Observations

| field | blank_or_zero_pct |
| --- | --- |
| lat | 43.3 |
| lng | 43.3 |
| building_size | 96.9 |
| floors | 99.6 |
| units | 96.9 |
| min_size | 97.6 |
| max_size | 91.9 |
| listing_count | 15.9 |

Zero values are common in size and geo fields. Those should be treated as missing unless validated elsewhere.

## Top Cities By Historical Leasing Activity

| city | state | building_count | active_building_count | total_listing_activity | enrichment_priority_score |
| --- | --- | --- | --- | --- | --- |
| Houston | TX | 6303 | 5823 | 121471 | 100 |
| Albuquerque | NM | 10415 | 9038 | 42217 | 100 |
| Chicago | IL | 15615 | 14017 | 35954 | 100 |
| Baton Rouge | LA | 8405 | 7573 | 25977 | 100 |
| Louisville | KY | 7358 | 6161 | 22965 | 100 |
| Phoenix | AZ | 5049 | 4444 | 21594 | 100 |
| Sarasota | FL | 6828 | 6090 | 20539 | 100 |
| Miami | FL | 5827 | 5185 | 20484 | 100 |
| Knoxville | TN | 6437 | 5714 | 20457 | 100 |
| San Diego | CA | 5524 | 4525 | 20385 | 100 |
| Denver | CO | 4736 | 4177 | 18446 | 100 |
| Atlanta | GA | 5513 | 4885 | 17160 | 100 |
| Jacksonville | FL | 5444 | 4907 | 16558 | 100 |
| Oklahoma City | OK | 5094 | 4681 | 15805 | 100 |
| Grand Rapids | MI | 3490 | 2691 | 15208 | 100 |

## Top Buildings By Historical Listing Activity

| building_id | name | address | city | state | listing_count | activity_bucket |
| --- | --- | --- | --- | --- | --- | --- |
| 282920 | Arena Place | 7324 Southwest Fwy | Houston | TX | 27148 | ultra_high |
| 147455 | Arena Towers | 7322 Southwest Fwy | Houston | TX | 23843 | ultra_high |
| 282925 | Executive Center II & III | 8360 Lyndon B Johnson Fwy | Dallas | TX | 8129 | ultra_high |
| 925300 | 340 North Belt | 350 N Sam Houston Pkwy E | Houston | TX | 7821 | ultra_high |
| 1529814 | 340 North Belt | 340 N Sam Houston Pkwy E | Houston | TX | 6595 | ultra_high |
| 399098 | 8330 LBJ Freeway | 8330 LBJ Fwy | Dallas | TX | 5732 | ultra_high |
| 282924 | CRS Tower | 8035 E R L Thornton Fwy | Dallas | TX | 5112 | ultra_high |
| 399087 | II Metro Square (A/B) | 2665 Villa Creek Dr | Dallas | TX | 4272 | ultra_high |
| 587210 | Pavilion Towers | 2821 S Parker Rd | Aurora | CO | 4107 | ultra_high |
| 282889 | II Metro Square (A/B) | 2695 Villa Creek Dr | Dallas | TX | 4082 | ultra_high |
| 365687 | Pavilion Towers | 2851 S Parker Rd | Aurora | CO | 3951 | ultra_high |
| 399088 | II Metro Square (C/D) | 2735 Villa Creek Dr | Dallas | TX | 3771 | ultra_high |
| 282890 | II Metro Square (C/D) | 2775 Villa Creek Dr | Dallas | TX | 3591 | ultra_high |
| 288918 |  | 84 NE Loop 410 | San Antonio | TX | 2652 | ultra_high |
| 282884 | Park One on the Bayou | 2500 E T C Jester Blvd | Houston | TX | 2619 | ultra_high |

## Important Caveats

* `listing_count` is historical leasing activity intensity. It is not live availability.
* Rows may reflect legacy marketplace behavior, old broker feeds, syndication, or duplicate historical activity.
* Building pages should use this data for context, prioritization, and confidence signals, not as current inventory.
* Size, floor, unit, and geo fields require defensive handling because zeros often mean unknown.
* Neighborhood geometry can be useful, but simple centroid and radius estimates should be treated as directional.
