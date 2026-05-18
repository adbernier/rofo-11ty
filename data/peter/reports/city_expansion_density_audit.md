# City Expansion Density Audit

Generated: 2026-05-12

## Scope

This is a data-only audit for the SEO Surface Area expansion phase. No pages, templates, sitemap entries, or routing files were changed.

## Sources Audited

- `_data/cities.generated.json`: current Eleventy city-page source.
- `_data/cities.js`: city data wrapper that enriches generated city records for templates.
- `_data/buildings.js`: normalized production building source.
- `_data/buildingPages.js`: deduped active building-page source used for generated building pages.
- `data/peter/derived/market_signals.csv`: legacy city/building density and historical listing activity.
- `data/peter/derived/building_signals.csv`: legacy building-level signal source.
- `data/peter/raw/rofo_buildings.csv`: raw Peter building export.
- `_data/raw/gsc_cities.csv`: GSC city URL signal file.
- `_data/raw/rofo_top_1200_cities_2026-04-14_103326.csv`: older Rofo top-city source.
- `temp_data/uscities.csv`: US city reference data, useful later for population/geo validation but not used for density scoring.

## Current City Coverage Summary

- Total current city pages generated: 2027
- Active building pages generated: 4172
- Current city pages with at least 1 active building page: 723
- Current city pages with 0 active building pages: 1304
- Current city pages with 1-4 active building pages: 557
- Current city pages with 5-9 active building pages: 92
- Current city pages with 10-19 active building pages: 40
- Current city pages with 20+ active building pages: 34

## Recommendation Counts

- Launch: 2607
- Improve: 166
- Hold: 15842
- Suppress: 156

## Building-Density Distribution

| Density bucket | City count |
| --- | ---: |
| 0 buildings | 1304 |
| 1-4 buildings | 557 |
| 5-9 buildings | 92 |
| 10-19 buildings | 40 |
| 20+ buildings | 34 |

## Top 50 Current Cities By Active Building Count

| city | buildings | types | action | reason |
| --- | --- | --- | --- | --- |
| Los Angeles, CA | 166 | 4 | improve | 166 active Rofo building pages. |
| Sacramento, CA | 137 | 4 | improve | 137 active Rofo building pages. |
| Buffalo, NY | 134 | 5 | improve | 134 active Rofo building pages. |
| San Francisco, CA | 100 | 4 | improve | 100 active Rofo building pages. |
| Phoenix, AZ | 100 | 3 | improve | 100 active Rofo building pages. |
| San Diego, CA | 88 | 4 | improve | 88 active Rofo building pages. |
| Houston, TX | 85 | 3 | improve | 85 active Rofo building pages. |
| New York, NY | 81 | 3 | improve | 81 active Rofo building pages. |
| Austin, TX | 79 | 4 | improve | 79 active Rofo building pages. |
| San Jose, CA | 75 | 4 | improve | 75 active Rofo building pages. |
| Atlanta, GA | 66 | 3 | improve | 66 active Rofo building pages. |
| Dallas, TX | 53 | 2 | improve | 53 active Rofo building pages. |
| High Point, NC | 51 | 3 | improve | 51 active Rofo building pages. |
| Denver, CO | 46 | 5 | improve | 46 active Rofo building pages. |
| Syracuse, NY | 45 | 3 | improve | 45 active Rofo building pages. |
| Chicago, IL | 42 | 3 | improve | 42 active Rofo building pages. |
| Rochester, NY | 38 | 4 | improve | 38 active Rofo building pages. |
| Roseville, CA | 38 | 4 | improve | 38 active Rofo building pages. |
| Rancho Cordova, CA | 37 | 4 | improve | 37 active Rofo building pages. |
| Stockton, CA | 36 | 3 | improve | 36 active Rofo building pages. |
| Oakland, CA | 34 | 4 | improve | 34 active Rofo building pages. |
| Temecula, CA | 33 | 4 | improve | 33 active Rofo building pages. |
| Culver City, CA | 32 | 4 | improve | 32 active Rofo building pages. |
| Carlsbad, CA | 30 | 3 | improve | 30 active Rofo building pages. |
| Anaheim, CA | 29 | 4 | improve | 29 active Rofo building pages. |
| Miami, FL | 26 | 3 | improve | 26 active Rofo building pages. |
| Indianapolis, IN | 24 | 4 | improve | 24 active Rofo building pages. |
| Irvine, CA | 23 | 3 | improve | 23 active Rofo building pages. |
| Mill Valley, CA | 23 | 3 | improve | 23 active Rofo building pages. |
| Elk Grove, CA | 22 | 4 | improve | 22 active Rofo building pages. |
| Ithaca, NY | 21 | 3 | improve | 21 active Rofo building pages. |
| Santa Monica, CA | 21 | 3 | improve | 21 active Rofo building pages. |
| Scottsdale, AZ | 21 | 3 | improve | 21 active Rofo building pages. |
| Rocklin, CA | 20 | 3 | improve | 20 active Rofo building pages. |
| Palo Alto, CA | 19 | 4 | improve | 19 active Rofo building pages. |
| El Dorado Hills, CA | 19 | 3 | improve | 19 active Rofo building pages. |
| Boston, MA | 18 | 2 | improve | 18 active Rofo building pages. |
| East Syracuse, NY | 17 | 5 | improve | 17 active Rofo building pages. |
| Binghamton, NY | 17 | 3 | improve | 17 active Rofo building pages. |
| Las Vegas, NV | 17 | 2 | improve | 17 active Rofo building pages. |
| Seattle, WA | 17 | 2 | improve | 17 active Rofo building pages. |
| Charlotte, NC | 16 | 3 | improve | 16 active Rofo building pages. |
| Washington, DC | 16 | 2 | improve | 16 active Rofo building pages. |
| Santa Clara, CA | 14 | 4 | improve | 14 active Rofo building pages. |
| Liverpool, NY | 14 | 3 | improve | 14 active Rofo building pages. |
| Englewood, CO | 14 | 3 | improve | 14 active Rofo building pages. |
| Irving, TX | 14 | 3 | improve | 14 active Rofo building pages. |
| Auburn, CA | 14 | 2 | improve | 14 active Rofo building pages. |
| Columbia, MD | 13 | 4 | improve | 13 active Rofo building pages. |
| Fort Worth, TX | 13 | 4 | improve | 13 active Rofo building pages. |

## Top 50 Secondary And Tertiary Opportunities

These exclude the largest obvious markets and favor cities with 5-99 active building pages, multiple space types, nearby-market links, or strong legacy density.

| city | current | buildings | types | nearby | score | action |
| --- | --- | --- | --- | --- | --- | --- |
| San Diego, CA | yes | 88 | 4 | 8 | 330 | improve |
| Austin, TX | yes | 79 | 4 | 8 | 330 | improve |
| San Jose, CA | yes | 75 | 4 | 8 | 330 | improve |
| Denver, CO | yes | 46 | 5 | 8 | 326 | improve |
| High Point, NC | yes | 51 | 3 | 8 | 319.9 | improve |
| Houston, TX | yes | 85 | 3 | 8 | 318 | improve |
| New York, NY | yes | 81 | 3 | 8 | 318 | improve |
| Atlanta, GA | yes | 66 | 3 | 8 | 318 | improve |
| Dallas, TX | yes | 53 | 2 | 8 | 306 | improve |
| Syracuse, NY | yes | 45 | 3 | 8 | 298 | improve |
| Chicago, IL | yes | 42 | 3 | 8 | 286 | improve |
| Rochester, NY | yes | 38 | 4 | 8 | 282 | improve |
| Roseville, CA | yes | 38 | 4 | 8 | 282 | improve |
| Rancho Cordova, CA | yes | 37 | 4 | 8 | 278 | improve |
| Oakland, CA | yes | 34 | 4 | 8 | 266 | improve |
| Stockton, CA | yes | 36 | 3 | 8 | 262 | improve |
| Temecula, CA | yes | 33 | 4 | 8 | 262 | improve |
| Culver City, CA | yes | 32 | 4 | 8 | 258 | improve |
| Anaheim, CA | yes | 29 | 4 | 8 | 246 | improve |
| Carlsbad, CA | yes | 30 | 3 | 8 | 238 | improve |
| Indianapolis, IN | yes | 24 | 4 | 8 | 227 | improve |
| Miami, FL | yes | 26 | 3 | 8 | 222 | improve |
| Elk Grove, CA | yes | 22 | 4 | 8 | 221 | improve |
| Irvine, CA | yes | 23 | 3 | 8 | 210 | improve |
| East Syracuse, NY | yes | 17 | 5 | 8 | 210 | improve |
| Mill Valley, CA | yes | 23 | 3 | 8 | 209.3 | improve |
| Palo Alto, CA | yes | 19 | 4 | 8 | 206 | improve |
| Ithaca, NY | yes | 21 | 3 | 8 | 202 | improve |
| Santa Monica, CA | yes | 21 | 3 | 8 | 202 | improve |
| Scottsdale, AZ | yes | 21 | 3 | 8 | 202 | improve |
| Rocklin, CA | yes | 20 | 3 | 8 | 198 | improve |
| El Dorado Hills, CA | yes | 19 | 3 | 8 | 196.4 | improve |
| Binghamton, NY | yes | 17 | 3 | 8 | 186 | improve |
| Santa Clara, CA | yes | 14 | 4 | 8 | 186 | improve |
| Greensboro, NC | yes | 11 | 5 | 8 | 186 | improve |
| Charlotte, NC | yes | 16 | 3 | 8 | 182 | improve |
| Columbia, MD | yes | 13 | 4 | 8 | 182 | improve |
| Fort Worth, TX | yes | 13 | 4 | 8 | 182 | improve |
| Boston, MA | yes | 18 | 2 | 8 | 178 | improve |
| Sunnyvale, CA | yes | 12 | 4 | 8 | 178 | improve |
| Liverpool, NY | yes | 14 | 3 | 8 | 176.6 | improve |
| Las Vegas, NV | yes | 17 | 2 | 8 | 174 | improve |
| Seattle, WA | yes | 17 | 2 | 8 | 174 | improve |
| Englewood, CO | yes | 14 | 3 | 8 | 174 | improve |
| Irving, TX | yes | 14 | 3 | 8 | 174 | improve |
| North Tonawanda, NY | yes | 11 | 4 | 8 | 174 | improve |
| Vista, CA | yes | 13 | 3 | 8 | 171.9 | improve |
| Washington, DC | yes | 16 | 2 | 8 | 170 | improve |
| Elmira, NY | yes | 13 | 3 | 8 | 170 | improve |
| Folsom, CA | yes | 13 | 3 | 8 | 170 | improve |

## Cities With Strong Clusters But Missing Or Weak Current Pages

| city | current | active_buildings | legacy_buildings | action | reason |
| --- | --- | --- | --- | --- | --- |
| Buffalo, NY | yes | 134 | 4658 | improve | 134 active Rofo building pages. |
| Los Angeles, CA | yes | 166 | 6384 | improve | 166 active Rofo building pages. |
| Sacramento, CA | yes | 137 | 7022 | improve | 137 active Rofo building pages. |
| San Francisco, CA | yes | 100 | 27835 | improve | 100 active Rofo building pages. |
| San Diego, CA | yes | 88 | 5524 | improve | 88 active Rofo building pages. |
| Austin, TX | yes | 79 | 3406 | improve | 79 active Rofo building pages. |
| San Jose, CA | yes | 75 | 3760 | improve | 75 active Rofo building pages. |
| Denver, CO | yes | 46 | 4736 | improve | 46 active Rofo building pages. |
| High Point, NC | yes | 51 | 734 | improve | 51 active Rofo building pages. |
| Phoenix, AZ | yes | 100 | 5049 | improve | 100 active Rofo building pages. |
| Houston, TX | yes | 85 | 6303 | improve | 85 active Rofo building pages. |
| New York, NY | yes | 81 | 3862 | improve | 81 active Rofo building pages. |
| Atlanta, GA | yes | 66 | 5513 | improve | 66 active Rofo building pages. |
| Dallas, TX | yes | 53 | 1901 | improve | 53 active Rofo building pages. |
| Syracuse, NY | yes | 45 | 2018 | improve | 45 active Rofo building pages. |
| Chicago, IL | yes | 42 | 15615 | improve | 42 active Rofo building pages. |
| Rochester, NY | yes | 38 | 1256 | improve | 38 active Rofo building pages. |
| Roseville, CA | yes | 38 | 1607 | improve | 38 active Rofo building pages. |
| Rancho Cordova, CA | yes | 37 | 998 | improve | 37 active Rofo building pages. |
| Oakland, CA | yes | 34 | 10844 | improve | 34 active Rofo building pages. |
| Stockton, CA | yes | 36 | 3380 | improve | 36 active Rofo building pages. |
| Temecula, CA | yes | 33 | 697 | improve | 33 active Rofo building pages. |
| Culver City, CA | yes | 32 | 432 | improve | 32 active Rofo building pages. |
| Anaheim, CA | yes | 29 | 2096 | improve | 29 active Rofo building pages. |
| Carlsbad, CA | yes | 30 | 709 | improve | 30 active Rofo building pages. |
| Indianapolis, IN | yes | 24 | 4393 | improve | 24 active Rofo building pages. |
| Miami, FL | yes | 26 | 5827 | improve | 26 active Rofo building pages. |
| Elk Grove, CA | yes | 22 | 751 | improve | 22 active Rofo building pages. |
| Irvine, CA | yes | 23 | 2006 | improve | 23 active Rofo building pages. |
| East Syracuse, NY | yes | 17 | 344 | improve | 17 active Rofo building pages. |
| Mill Valley, CA | yes | 23 | 357 | improve | 23 active Rofo building pages. |
| Palo Alto, CA | yes | 19 | 829 | improve | 19 active Rofo building pages. |
| Ithaca, NY | yes | 21 | 343 | improve | 21 active Rofo building pages. |
| Santa Monica, CA | yes | 21 | 664 | improve | 21 active Rofo building pages. |
| Scottsdale, AZ | yes | 21 | 1530 | improve | 21 active Rofo building pages. |
| Rocklin, CA | yes | 20 | 737 | improve | 20 active Rofo building pages. |
| El Dorado Hills, CA | yes | 19 | 401 | improve | 19 active Rofo building pages. |
| Binghamton, NY | yes | 17 | 991 | improve | 17 active Rofo building pages. |
| Santa Clara, CA | yes | 14 | 1041 | improve | 14 active Rofo building pages. |
| Greensboro, NC | yes | 11 | 1039 | improve | 11 active Rofo building pages. |
| Charlotte, NC | yes | 16 | 1600 | improve | 16 active Rofo building pages. |
| Columbia, MD | yes | 13 | 593 | improve | 13 active Rofo building pages. |
| Fort Worth, TX | yes | 13 | 1734 | improve | 13 active Rofo building pages. |
| Boston, MA | yes | 18 | 1053 | improve | 18 active Rofo building pages. |
| Sunnyvale, CA | yes | 12 | 814 | improve | 12 active Rofo building pages. |
| Liverpool, NY | yes | 14 | 848 | improve | 14 active Rofo building pages. |
| Las Vegas, NV | yes | 17 | 3496 | improve | 17 active Rofo building pages. |
| Seattle, WA | yes | 17 | 1099 | improve | 17 active Rofo building pages. |
| Englewood, CO | yes | 14 | 1002 | improve | 14 active Rofo building pages. |
| Irving, TX | yes | 14 | 322 | improve | 14 active Rofo building pages. |

## Multiple Space-Type Opportunities

| city | buildings | office | retail | industrial | flex | coworking |
| --- | --- | --- | --- | --- | --- | --- |
| Buffalo, NY | 134 | 71 | 41 | 26 | 1 | 2 |
| Los Angeles, CA | 166 | 88 | 9 | 70 | 0 | 13 |
| Sacramento, CA | 137 | 81 | 18 | 38 | 0 | 7 |
| San Francisco, CA | 100 | 38 | 60 | 2 | 0 | 11 |
| San Diego, CA | 88 | 55 | 5 | 27 | 0 | 14 |
| Austin, TX | 79 | 77 | 1 | 1 | 0 | 16 |
| San Jose, CA | 75 | 19 | 53 | 3 | 0 | 5 |
| Denver, CO | 46 | 22 | 1 | 23 | 1 | 13 |
| High Point, NC | 51 | 24 | 12 | 13 | 0 | 0 |
| Phoenix, AZ | 100 | 72 | 0 | 28 | 0 | 11 |
| Houston, TX | 85 | 73 | 0 | 12 | 0 | 33 |
| New York, NY | 81 | 80 | 0 | 1 | 0 | 41 |
| Atlanta, GA | 66 | 51 | 0 | 15 | 0 | 22 |
| Dallas, TX | 53 | 53 | 0 | 0 | 0 | 26 |
| Syracuse, NY | 45 | 9 | 18 | 18 | 0 | 0 |
| Chicago, IL | 42 | 33 | 0 | 9 | 0 | 20 |
| Rochester, NY | 38 | 22 | 10 | 7 | 0 | 1 |
| Roseville, CA | 38 | 31 | 7 | 1 | 0 | 2 |
| Rancho Cordova, CA | 37 | 19 | 8 | 11 | 0 | 1 |
| Oakland, CA | 34 | 21 | 4 | 9 | 0 | 3 |
| Stockton, CA | 36 | 22 | 11 | 3 | 0 | 0 |
| Temecula, CA | 33 | 19 | 8 | 7 | 1 | 0 |
| Culver City, CA | 32 | 27 | 1 | 4 | 0 | 1 |
| Anaheim, CA | 29 | 10 | 1 | 18 | 0 | 1 |
| Carlsbad, CA | 30 | 18 | 0 | 12 | 0 | 2 |
| Indianapolis, IN | 24 | 8 | 10 | 5 | 0 | 9 |
| Miami, FL | 26 | 24 | 0 | 1 | 0 | 16 |
| Elk Grove, CA | 22 | 6 | 11 | 5 | 0 | 1 |
| Irvine, CA | 23 | 22 | 0 | 1 | 0 | 6 |
| East Syracuse, NY | 17 | 7 | 3 | 8 | 1 | 1 |
| Mill Valley, CA | 23 | 13 | 9 | 1 | 0 | 0 |
| Palo Alto, CA | 19 | 11 | 7 | 1 | 0 | 4 |
| Ithaca, NY | 21 | 5 | 10 | 5 | 0 | 0 |
| Santa Monica, CA | 21 | 19 | 3 | 0 | 0 | 2 |
| Scottsdale, AZ | 21 | 19 | 0 | 2 | 0 | 9 |
| Rocklin, CA | 20 | 13 | 6 | 1 | 0 | 0 |
| El Dorado Hills, CA | 19 | 19 | 1 | 0 | 0 | 1 |
| Binghamton, NY | 17 | 4 | 6 | 1 | 0 | 0 |
| Santa Clara, CA | 14 | 3 | 10 | 1 | 0 | 2 |
| Greensboro, NC | 11 | 4 | 1 | 6 | 1 | 2 |
| Charlotte, NC | 16 | 14 | 0 | 2 | 0 | 11 |
| Columbia, MD | 13 | 7 | 2 | 4 | 0 | 3 |
| Fort Worth, TX | 13 | 8 | 3 | 2 | 0 | 5 |
| Boston, MA | 18 | 18 | 0 | 0 | 0 | 11 |
| Sunnyvale, CA | 12 | 3 | 8 | 1 | 0 | 1 |
| Liverpool, NY | 14 | 5 | 5 | 4 | 0 | 0 |
| Las Vegas, NV | 17 | 16 | 0 | 0 | 0 | 15 |
| Seattle, WA | 17 | 17 | 0 | 0 | 0 | 10 |
| Englewood, CO | 14 | 8 | 0 | 6 | 0 | 2 |
| Irving, TX | 14 | 12 | 0 | 2 | 0 | 6 |

## Candidate Dataset

Created:

- `data/peter/normalized/city_expansion_candidates.json`
- `data/peter/normalized/city_expansion_first_batch.json`

Each candidate includes current city-page presence, active building counts, space-type counts, nearby market counts, sample building paths, legacy Peter density signals, recommendation, and reason.

## Scoring Rules Used

Recommended `improve` or `launch` when a city has one of the following:

- 10+ active Rofo building pages.
- 5+ active building pages and multiple space types.
- Strong Peter legacy building density where no current city page exists.
- 5+ active buildings plus useful nearby-market links.

Recommended `hold` when:

- Only 1-4 active building pages exist.
- Nearby market graph is weak.
- Current data is not strong enough to justify more SEO surface area yet.

Recommended `suppress` when:

- City/state data is missing or invalid.
- There are no active building pages and no useful legacy density signal.
- Duplicate or non-city records need cleanup.

## Risks And Thin-Page Issues

- Many current city pages have zero active building pages. These should not be expanded with additional SEO modules until there is a stronger building, nearby-market, or semantic basis.
- Several older source files contain very large historical `building_count` values. Those should be treated as legacy density signals, not current page inventory.
- Active building-page count is the safest near-term signal for public expansion.
- Legacy Peter density is useful for prioritization and future data work, but should not drive public page creation without representative current building pages or reviewed enrichment.
- Cities with only one space type can still be useful, but the city page may need stronger internal links to avoid thin generic content.

## Recommended First Implementation Batch Size

Use a first implementation batch of 50-100 cities. The generated first batch includes 100 candidates, prioritizing secondary and tertiary commercial clusters over the largest already-obvious markets.

Recommended rollout approach:

1. Improve existing city pages that already have 10+ active building pages.
2. Add stronger internal links to building pages, market guides, nearby markets, and space-type pages.
3. Hold cities with 1-4 buildings unless GSC or broker-routing value is unusually strong.
4. Use Peter legacy density to identify future data-enrichment work, not immediate public launches by itself.

## Suggested Next Codex Step

Review `city_expansion_first_batch.json` and select a smaller implementation pilot, such as 25 cities, then add city-page improvements that reuse existing templates without creating new URL structures.
