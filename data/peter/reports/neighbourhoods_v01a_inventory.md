# neighbourhoods_v01a.zip Inventory

## Summary

Source inspected:

- `data/peter/raw/neighbourhoods_v01a.zip`
- R2 path referenced by task: `peter/2026-05/raw-dump/neighbourhoods_v01a.zip`

The local zip is available and contains one file:

| File | Format | Uncompressed size |
| --- | --- | ---: |
| `neighbourhoods_v01a.sql` | MySQL SQL dump | 1,164,419 bytes |

The SQL dump contains one table, `neighbourhoods`, with 9,891 rows.

This is a useful legacy neighborhood catalog, but it is not a comprehensive polygon boundary dataset. It includes neighborhood ids, legacy city ids, names, descriptions, centroids, a legacy map-points field, radius values, and allowed flags. It does not include zip codes, direct city names, direct state fields, or slugs.

## Raw Table Schema

Columns in `neighbourhoods`:

| Column | Meaning / observed use |
| --- | --- |
| `n_id` | Legacy neighborhood id |
| `c_id` | Legacy city id |
| `p_id` | Parent id |
| `n_name` | Neighborhood name |
| `n_description` | Legacy HTML description |
| `n_glat` | Latitude centroid or map point |
| `n_glng` | Longitude centroid or map point |
| `n_gpoints` | Legacy JSON-like map points, sometimes malformed |
| `n_gradius` | Radius value, commonly `5.0`; unit is not documented |
| `n_gzoom` | Legacy map zoom |
| `n_allowed` | Publish/allowed flag |
| `n_summary` | Legacy summary text |

Indexes in the dump:

- Primary key on `n_id`
- Secondary key on `c_id`

## Data Coverage

| Metric | Count |
| --- | ---: |
| Total neighborhood rows | 9,891 |
| `n_allowed = 1` | 9,886 |
| `n_allowed = 0` | 5 |
| Rows with nonzero centroid lat/lng | 5,472 |
| Rows with `n_description` | 90 |
| Rows with `n_summary` | 47 |
| Rows joinable to legacy city data by `c_id` | 9,875 |
| Rows not joinable to legacy city data by `c_id` | 16 |
| States represented after city join | 51 |

Top states by row count:

| State | Neighborhood rows |
| --- | ---: |
| CA | 1,442 |
| FL | 919 |
| MI | 709 |
| NY | 549 |
| TX | 499 |
| IL | 416 |
| AZ | 411 |
| IN | 409 |
| OH | 346 |
| LA | 326 |

Top cities by row count:

| City | State | Neighborhood rows |
| --- | --- | ---: |
| Albuquerque | NM | 180 |
| Chicago | IL | 161 |
| Phoenix | AZ | 146 |
| Columbus | OH | 82 |
| San Diego | CA | 79 |
| San Francisco | CA | 71 |
| Louisville | KY | 71 |
| Atlanta | GA | 70 |
| Houston | TX | 69 |
| Denver | CO | 64 |
| Austin | TX | 60 |
| Oakland | CA | 58 |

## Geometry Inventory

The dump does not contain shapefiles, WKT, or standard GeoJSON. The only geometry-like field is `n_gpoints`, which is usually a JSON-like array of `{ lat, lng }` points.

Observed geometry classifications:

| Geometry class | Count | Notes |
| --- | ---: | --- |
| Single point | 7,837 | Most common; useful as centroids or rough neighborhood markers |
| Closed polygon-like point arrays | 43 | Potentially convertible to GeoJSON polygons |
| Empty `n_gpoints` | 190 | No map points in the field |
| Non-list / malformed `n_gpoints` | 1,821 | Commonly a single longitude string such as `-80.246176` |

Point count distribution for valid `n_gpoints` arrays:

| Point count | Rows |
| ---: | ---: |
| 1 | 7,837 |
| 5 | 39 |
| 9 | 1 |
| 13 | 1 |
| 17 | 1 |
| 24 | 1 |

Examples of rows with polygon-like point arrays:

| Neighborhood | Legacy city id | Points | Approx. bbox area sq km |
| --- | ---: | ---: | ---: |
| East Dublin | 66 | 5 | 1.44 |
| Alameda | 36 | 24 | 27.28 |
| Willow Glen | 78 | 5 | 1.00 |
| Hawthorne | 37 | 17 | 1,491.25 |
| Onother | 37 | 13 | 373.99 |
| Dowhey | 37 | 9 | 516.61 |
| North San Jose | 78 | 5 | 0.14 |
| Downtown San Jose | 78 | 5 | 0.10 |

The very large bbox areas on rows such as `Hawthorne`, `Onother`, and `Dowhey` are suspicious and should not be trusted without visual QA.

Examples of malformed `n_gpoints` values:

| Neighborhood | Legacy city id | Observed `n_gpoints` |
| --- | ---: | --- |
| Eastside | 1578 | `-76.08448` |
| Coconut Grove | 10690 | `-80.246176` |
| North | 26130 | `-104.9735354` |
| Denver Tech Center | 26118 | `-104.89274` |
| Fairway Commons at Heritage Lakes | 13307 | `-83.18359` |

## Fields Requested For Implementation Decisions

| Question | Answer |
| --- | --- |
| Are polygons included? | Partially. Only 43 rows have closed polygon-like point arrays. Most rows are single points or malformed map-point values. |
| Are zip codes included? | No. There is no zip code field in this table. |
| Are city/state fields included? | Not directly. Rows include `c_id`; city and state require joining to the legacy `cities` table. |
| Do neighborhood names exist? | Yes, `n_name`. |
| Do slugs exist? | No. Slugs should be generated from normalized names and city/state. |
| Do ids exist? | Yes, `n_id`; `c_id` and `p_id` also exist. |
| Do centroids exist? | Yes for 5,472 rows through `n_glat` and `n_glng`. |
| Is the geometry GeoJSON? | No. `n_gpoints` is legacy JSON-like map point data, not standard GeoJSON. |
| Is the geometry shapefile/WKT/CSV? | No. The zip contains only a MySQL SQL dump. |

## Data Quality Issues

### Missing city joins

16 rows do not join cleanly to the current extracted legacy city table by `c_id`. Examples include `Milbrae`, `San Mateo`, `East Palo Alto`, `Cupertino`, `Fremont`, `Palo Alto`, `Alameda`, `Hawthorne`, `Onother`, and `Dowhey`.

This may mean the city extract is incomplete relative to this neighborhood dump, or that some rows carry older city ids.

### Duplicate names

Global duplicate names are expected because many cities have neighborhoods named `Downtown`, `Midtown`, `Old Town`, and similar. There are 1,088 globally duplicated normalized names.

There are also 19 duplicate normalized names within the same legacy city id. Examples include:

- `royal poinciana`
- `5 points`
- `silver lake`
- `beverly grove`
- `central minneapolis`
- `mira loma`

Within-city duplicates should be reviewed before public page generation.

### Inconsistent and suspicious names

Some rows look misspelled or otherwise suspicious, including:

- `Onother`
- `Dowhey`
- `Milbrae`

These should be filtered or manually corrected before they are used for public pages.

### Geometry limitations

The dataset cannot be treated as a clean polygon boundary source. Most rows are point-only. Many `n_gpoints` values are malformed scalar longitude strings. A small number of polygon-like records have suspiciously large bounding boxes.

Approximate bbox overlap detection found at least one suspicious same-city overlap among polygon-like rows: `Hawthorne` and `Onother`.

## Can This Support Polygon-Based Building Assignment?

Partially, but not broadly.

The file can support polygon-based assignment only for the small subset of rows with valid closed polygon-like `n_gpoints` arrays. That subset is 43 rows out of 9,891, so it is not enough for site-wide polygon-based building-to-neighborhood assignment.

For the broader dataset, the practical options are:

1. Use `n_glat` and `n_glng` as neighborhood centroids for approximate nearest-neighborhood assignment.
2. Use `n_gradius` as a rough radius only after confirming the intended unit and calibrating by market.
3. Convert the 43 closed polygon-like rows into GeoJSON and validate them visually before use.
4. For priority launch markets, curate or import better polygon boundaries rather than relying entirely on this legacy dump.

## Recommended Canonical Neighborhood Fields

Recommended normalized fields for future Rofo-generated neighborhood data:

| Canonical field | Source / generation |
| --- | --- |
| `legacy_neighborhood_id` | `n_id` |
| `legacy_city_id` | `c_id` |
| `legacy_parent_id` | `p_id` |
| `name_raw` | `n_name` |
| `name` | Trimmed and normalized `n_name` |
| `neighborhood_slug` | Generated from normalized name |
| `city` | Join from legacy `cities.c_name` |
| `state_abbr` | Join from legacy `cities.state_code` |
| `centroid_lat` | `n_glat` when nonzero |
| `centroid_lng` | `n_glng` when nonzero |
| `geometry_type` | Generated classification: `polygon`, `point_radius`, `point`, `invalid`, or `missing` |
| `geometry_geojson` | Generated only from validated polygon-like `n_gpoints` |
| `radius` | `n_gradius`, with unit marked unknown until validated |
| `allowed` | `n_allowed` |
| `summary_raw` | `n_summary` |
| `description_raw` | `n_description` |
| `source` | `neighbourhoods_v01a` |
| `review_status` | Generated or manual review status |

## Recommended Generated Output Format

For implementation planning, generate separate reviewable outputs rather than wiring this directly into public pages:

1. `data/peter/derived/neighborhoods_v01a_normalized.csv`
   - One row per legacy neighborhood.
   - Includes canonical fields, city/state join, slug, geometry classification, and QA flags.

2. `data/peter/derived/neighborhoods_v01a_polygons.geojson`
   - FeatureCollection for only validated polygon-like records.
   - Should exclude malformed, untrusted, or visually unreviewed shapes.

3. `data/peter/derived/neighborhoods_v01a_review_flags.csv`
   - Duplicate names, missing joins, missing centroids, malformed geometry, suspicious polygon sizes, and suspicious names.

4. Future production-facing data should use US spelling, such as `neighborhoods.generated.json`, after review.

## Recommended Uses

| Use case | Recommendation |
| --- | --- |
| Neighborhood pages | Yes, but only after normalization, city/state join, slug generation, duplicate cleanup, and editorial review. Do not publish directly from the raw dump. |
| Building to neighborhood mapping | Partially. Use validated polygons where available. Use centroid/radius or nearest-neighborhood assignment only as an approximate internal signal. |
| City page neighborhood modules | Yes, after filtering to clean, relevant, city-joined neighborhoods. |
| Nearby neighborhood links | Yes, but generate from reviewed neighborhoods and distance/adjacency logic, not raw duplicate names alone. |

## Blockers Before Implementation

- No direct city or state fields in neighborhood rows.
- No zip code fields.
- No prebuilt slugs.
- Most records do not have polygon geometry.
- 1,821 `n_gpoints` values are malformed or non-list values.
- 190 rows have empty `n_gpoints`.
- 4,419 rows lack usable nonzero centroid coordinates.
- 16 rows do not join to the current legacy city extract.
- Some names are suspicious or misspelled.
- Some polygon-like rows have implausibly large bounding boxes.
- Legacy descriptions contain old HTML and should not be used directly as public copy.

## Suggested Next Implementation Step

Create a read-only normalization and QA script that parses `neighbourhoods_v01a.sql`, joins to `cities_from_legacy.csv`, generates canonical US-spelled fields, classifies geometry quality, and writes reviewable derived files.

Then run a pilot QA pass for priority markets, starting with:

- San Francisco
- Oakland
- Berkeley
- Palo Alto
- San Jose
- Atlanta
- New York

The first public neighborhood pages should use the curated editorial neighborhood layer as the decision source, with this legacy dump acting as supporting source data rather than an automatic page-generation source.
