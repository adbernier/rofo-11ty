# Neighborhood Candidates QA

## Summary

Parsed `neighbourhoods_v01a.sql` from the legacy Peter neighborhood zip and generated two normalized review datasets:

- `data/peter/normalized/neighborhoods.candidates.json`
- `data/peter/normalized/neighborhoods.public-candidates.json`

No production templates, routes, sitemap files, or public pages were changed.

## Counts

| Metric | Count |
| --- | ---: |
| Total rows parsed | 9,891 |
| Proposed public candidate count | 5,467 |
| Allowed rows | 9,886 |
| Not allowed rows | 5 |
| Valid centroid count | 5,472 |
| Polygon-like count | 43 |
| Point geometry count | 7,837 |
| Malformed geometry count | 1,821 |
| Missing geometry count | 190 |
| Records missing names | 0 |
| Records missing centroids | 4,419 |
| Duplicate normalized neighborhood names | 1,088 |

## Geometry Quality

| Geometry quality | Count |
| --- | ---: |
| Usable | 43 |
| Approximate | 5,429 |
| Unusable | 4,419 |

`usable` currently means closed polygon-like geometry. `approximate` means the record has a usable centroid or point-like map data but not a trusted polygon. `unusable` means the record lacks enough geometry to support even approximate placement.

## Top Duplicate Neighborhood Names

| Name | Count |
| --- | ---: |
| downtown | 100 |
| midtown | 22 |
| central business district | 12 |
| northside | 12 |
| riverside | 12 |
| greenville | 11 |
| old town | 11 |
| edgewood | 10 |
| southside | 10 |
| springfield | 10 |
| clinton | 9 |
| uptown | 9 |
| west end | 9 |
| westside | 9 |
| westwood | 9 |
| auburn | 8 |
| canton | 8 |
| columbia | 8 |
| eastside | 8 |
| highland | 8 |

## Radius Value Distribution

| Radius | Count |
| ---: | ---: |
| 5.0 | 9,696 |
| 0.0 | 180 |
| 0.5 | 13 |
| 1.0 | 1 |
| 3.0 | 1 |

## Examples Of Good Records

- `112` East Dublin: geometry `polygon_like`, quality `usable`, centroid `37.72782516, -121.93159485`, radius `5.0`
- `21` Alameda: geometry `polygon_like`, quality `usable`, centroid `37.79052353, -122.29216766`, radius `5.0`
- `273` Willow Glen: geometry `polygon_like`, quality `usable`, centroid `37.30355072, -121.91184998`, radius `5.0`
- `22` Hawthorne: geometry `polygon_like`, quality `usable`, centroid `34.04810715, -118.57818604`, radius `5.0`
- `23` Onother: geometry `polygon_like`, quality `usable`, centroid `34.09588623, -118.48205566`, radius `5.0`
- `26` Dowhey: geometry `polygon_like`, quality `usable`, centroid `33.95475006, -118.17718506`, radius `5.0`
- `269` North San Jose: geometry `polygon_like`, quality `usable`, centroid `37.38788986, -121.89090729`, radius `5.0`
- `272` South San Jose: geometry `polygon_like`, quality `usable`, centroid `37.30901337, -121.86515808`, radius `5.0`
- `271` West San Jose: geometry `polygon_like`, quality `usable`, centroid `37.30683136, -121.99682617`, radius `5.0`
- `267` Downtown San Jose: geometry `polygon_like`, quality `usable`, centroid `37.35542297, -121.90103149`, radius `5.0`

## Examples Of Bad Or Weak Records

- `39619` Nashville: geometry `point`, quality `unusable`, centroid `None, None`, radius `5.0`
- `39620` Nunica: geometry `point`, quality `unusable`, centroid `None, None`, radius `5.0`
- `39621` Walkerville: geometry `point`, quality `unusable`, centroid `None, None`, radius `5.0`
- `39615` Nashville: geometry `point`, quality `unusable`, centroid `None, None`, radius `5.0`
- `39616` Lowell: geometry `point`, quality `unusable`, centroid `None, None`, radius `5.0`
- `39617` Ludington: geometry `point`, quality `unusable`, centroid `None, None`, radius `5.0`
- `39618` Allendale: geometry `point`, quality `unusable`, centroid `None, None`, radius `5.0`
- `40499` Bressi Ranch: geometry `missing`, quality `unusable`, centroid `None, None`, radius `5.0`
- `40493` Montrose: geometry `point`, quality `unusable`, centroid `None, None`, radius `5.0`
- `40492` Bronxville: geometry `point`, quality `unusable`, centroid `None, None`, radius `5.0`
- `40484` Marysville: geometry `point`, quality `unusable`, centroid `None, None`, radius `5.0`
- `40483` Lotus: geometry `point`, quality `unusable`, centroid `None, None`, radius `5.0`

## Recommended Filtering Rules For Public Page Candidates

Initial public candidate filtering should require:

1. `allowed = true`.
2. A non-empty normalized `name` and generated `slug`.
3. Valid nonzero `centroid_lat` and `centroid_lng`.
4. `geometry_quality` is `usable` or `approximate`.
5. Exclude or manually review malformed geometry when no valid centroid exists.
6. Exclude suspicious names, obvious typos, and internal/test-like records.
7. Deduplicate within city after joining `legacy_city_id` to the legacy city table.
8. Do not use global name uniqueness as a filter because names like Downtown and Midtown are valid across many cities.
9. Treat polygon-like rows as candidates for map assignment only after visual QA.
10. Treat point/radius rows as approximate discovery/context data, not authoritative boundaries.

## Implementation Recommendation

This dataset is strong enough to support a normalized neighborhood candidate catalog and editorial review workflow. It is not strong enough to automatically generate public neighborhood pages without city/state joins, duplicate cleanup, suspicious-name filtering, and editorial selection.

It is only partially strong enough for building assignment. The 43 polygon-like rows may support polygon-based assignment after validation, but most records are point/centroid based. Site-wide building-to-neighborhood mapping should use this dataset as an approximate signal unless better polygon boundaries are added.

City/state joining is still a required next step. The raw neighborhood dump only has `c_id`, not direct city or state fields. Most rows can join to the existing legacy city extract, but unresolved `c_id` values and duplicate city/name issues need QA before production use.

Recommended next data needed:

- A normalized city join table with `legacy_city_id`, city, state, and city slug.
- Review flags for duplicate names within the same city.
- A visual QA pass for the 43 polygon-like geometries.
- Better boundary data for priority launch markets where polygon assignment matters.
- Editorial allowlist of commercially meaningful neighborhoods before page generation.
