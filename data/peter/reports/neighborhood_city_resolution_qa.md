# Neighborhood City Resolution QA

## Summary

Resolved normalized neighborhood candidates against local Peter and Rofo city data. The primary source is `data/peter/derived/cities_from_legacy.csv`, using `legacy_city_id` / `c_id`. Supplemental data was inspected for county and current Rofo city confirmation.

Generated files:

- `data/peter/normalized/legacy_city_id_lookup.json`
- `data/peter/normalized/neighborhoods.resolved-candidates.json`
- `data/peter/normalized/neighborhoods.launch-review.json`

No templates, routes, sitemap entries, or public pages were changed.

## Data Sources Inspected

| Source | Relevant fields | Use |
| --- | --- | --- |
| `data/peter/derived/cities_from_legacy.csv` | c_id, p_id, region_id, state_code, c_name, c_description, c_use_description, c_craigslist_url, c_glat, c_glng, c_featured, modify_time | primary legacy c_id to city/state mapping |
| `data/peter/raw/rofo_market_summary.csv` | city_id, city, state, county, metro, building_count, listing_count, lead_count, distinct_brokers, distinct_landlords | supplemental county by city_id and city/state |
| `data/peter/raw/rofo_buildings.csv` | building_id, name, street_number, street_name, address, city_id, city, state, zip, county_id, county, metro... | supplemental county by city_id and city/state |
| `_data/cities.generated.json` | city, state_abbr, slug, city_state_slug, label, path, county, lat, lng, building_count, tier, short_description... | current Rofo city slug/path/county confirmation |

## Resolution Counts

| Metric | Count |
| --- | ---: |
| Total neighborhoods | 9,891 |
| Resolved | 9,875 |
| Unresolved | 16 |
| Ambiguous | 0 |
| Resolved public candidate count | 5,451 |
| City lookup records created | 29,796 |
| Duplicate slug conflicts within same city | 22 |
| Launch review subset records | 311 |

## Top Cities By Neighborhood Count

| City | State | Neighborhoods |
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
| Pensacola | FL | 58 |
| Wilmington | NC | 57 |
| Detroit | MI | 56 |
| Grand Rapids | MI | 54 |
| Los Angeles | CA | 53 |
| Mobile | AL | 53 |
| New Orleans | LA | 52 |
| Tampa | FL | 51 |
| Jacksonville | FL | 48 |
| Fort Wayne | IN | 46 |
| Memphis | TN | 45 |
| Indianapolis | IN | 42 |
| Chattanooga | TN | 41 |

## Examples Of Clean Resolved Neighborhoods

- Pacific Heights, San Francisco, CA → `/commercial-real-estate/CA/san-francisco/pacific-heights/` (approximate)
- Mission District, San Francisco, CA → `/commercial-real-estate/CA/san-francisco/mission-district/` (approximate)
- Cow Hollow, San Francisco, CA → `/commercial-real-estate/CA/san-francisco/cow-hollow/` (approximate)
- Temescal, Oakland, CA → `/commercial-real-estate/CA/oakland/temescal/` (approximate)
- Chinatown, San Francisco, CA → `/commercial-real-estate/CA/san-francisco/chinatown/` (approximate)
- Civic Center, San Francisco, CA → `/commercial-real-estate/CA/san-francisco/civic-center/` (approximate)
- Grand Avenue, Oakland, CA → `/commercial-real-estate/CA/oakland/grand-avenue/` (approximate)
- Lower Haight, San Francisco, CA → `/commercial-real-estate/CA/san-francisco/lower-haight/` (approximate)
- Russian Hill, San Francisco, CA → `/commercial-real-estate/CA/san-francisco/russian-hill/` (approximate)
- North Beach, San Francisco, CA → `/commercial-real-estate/CA/san-francisco/north-beach/` (approximate)
- Telegraph Hill, San Francisco, CA → `/commercial-real-estate/CA/san-francisco/telegraph-hill/` (approximate)
- Nob Hill, San Francisco, CA → `/commercial-real-estate/CA/san-francisco/nob-hill/` (approximate)

## Examples Of Unresolved Neighborhoods

- `68` Milbrae has unresolved legacy_city_id `89`
- `72` San Mateo has unresolved legacy_city_id `94`
- `10` East Palo Alto has unresolved legacy_city_id `49`
- `13` Cupertino has unresolved legacy_city_id `52`
- `17` Fremont has unresolved legacy_city_id `56`
- `19` Los Altos has unresolved legacy_city_id `58`
- `43` Mill Valley has unresolved legacy_city_id `60`
- `44` San Rafael has unresolved legacy_city_id `62`
- `55` Milpitas has unresolved legacy_city_id `74`
- `58` Palo Alto has unresolved legacy_city_id `77`
- `21` Alameda has unresolved legacy_city_id `36`
- `22` Hawthorne has unresolved legacy_city_id `37`
- `23` Onother has unresolved legacy_city_id `37`
- `26` Dowhey has unresolved legacy_city_id `37`
- `11019` Bessemer has unresolved legacy_city_id `10928`
- `11098` Trussville has unresolved legacy_city_id `11007`

## Examples Of Ambiguous Mappings

- None found. `legacy_city_id` maps one-to-one for all resolved records in the local legacy city extract.

## Duplicate Slug Conflicts Within Same City

| City key | Neighborhood slug | Count | Example ids |
| --- | --- | ---: | --- |
| MD/lutherville-timonium | lutherville-timonium | 2 | 40277, 34776 |
| TX/houston | greenway-upper-kirby | 2 | 38754, 40543 |
| LA/new-orleans | uptown-carrollton | 2 | 34363, 41531 |
| AZ/mesa | emerson-manor | 2 | 41227, 41228 |
| NV/reno | mira-loma | 2 | 41582, 41583 |
| MN/minneapolis | central-minneapolis | 2 | 41700, 41701 |
| AZ/peoria | arrowhead-business-park-condominium | 2 | 41870, 41871 |
| AR/little-rock | birchwood | 2 | 41947, 41948 |
| OH/dayton | wright-view | 2 | 42295, 42296 |
| CO/aurora | the-farm-at-arapahoe-county | 2 | 42304, 42305 |
| FL/hollywood | royal-poinciana | 3 | 42343, 42344, 42345 |
| CA/san-pedro | harbor | 2 | 42350, 42351 |
| FL/plantation | south-fort-lauderdale | 2 | 42372, 42373 |
| CA/east-los-angeles | beverly-grove | 2 | 42435, 42436 |
| OH/cincinnati | monfort-heights-east | 2 | 42616, 42617 |
| IA/davenport | 5-points | 3 | 42635, 42636, 42637 |
| OR/west-linn | willamette | 2 | 42742, 42743 |
| WA/everett | silver-lake | 5 | 42749, 42750, 42751, 42752, 42753 |
| AZ/gilbert | gateway-pointe-industrial | 2 | 42809, 42810 |
| GA/savannah | abercorn-heights | 2 | 42848, 42849 |

## Launch Review Markets

`neighborhoods.launch-review.json` includes resolved public candidates for:

- San Francisco, CA
- Oakland, CA
- San Diego, CA
- Austin, TX
- Denver, CO

Counts by launch market:

| City | State | Review records |
| --- | --- | ---: |
| Oakland | CA | 55 |
| San Diego | CA | 72 |
| San Francisco | CA | 66 |
| Denver | CO | 63 |
| Austin | TX | 55 |

## Recommended Rules Before Public Launch

1. Use `neighborhoods.resolved-candidates.json` only as an internal review dataset until editorial approval is complete.
2. Require `resolution_status = resolved` and `resolution_confidence = high` before creating any public URL.
3. Require a current Rofo city match or explicitly approve markets that are not yet in the generated city dataset.
4. Resolve duplicate neighborhood slugs within the same city before URL generation.
5. Exclude unresolved legacy city ids unless a supplemental source resolves them with high confidence.
6. Treat `geometry_quality = approximate` as usable for discovery and editorial context, not authoritative boundaries.
7. Treat `geometry_quality = usable` as polygon-like, but still require visual QA before map or building assignment use.
8. Keep public URL generation on an editorial allowlist, not a bulk export.
9. Do not expose legacy descriptions directly without cleanup because many contain old SEO/listings language.
10. Add a separate reviewed `neighborhood_status` field before production rollout.

## Recommendation

We can now create neighborhood URL candidates safely as internal data because most records resolve to a city/state and have deterministic canonical path candidates. We should not generate public pages yet. The strongest pilot cities by coverage and commercial relevance are San Francisco, Oakland, San Diego, Austin, and Denver, with San Francisco and Oakland still the best editorial pilots because prior Bay Area work already created business-district review context.

Building-to-neighborhood assignment remains blocked for broad use by incomplete polygon coverage. Only 43 records are polygon-like, while most records are centroid/point based. Initial assignment should be manual allowlist-based for launch pages, with centroid/radius used only as an internal approximate signal. Polygon-based assignment should be delayed until true reviewed boundaries are available for each pilot city.

City/state joining is mostly resolved through the legacy city extract, but unresolved `legacy_city_id` values remain and should not be guessed. County coverage is supplemental and incomplete; it should be treated as helpful context, not a launch blocker for neighborhood pages.
