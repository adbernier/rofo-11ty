# Neighborhood Public Review Build

## Summary

Created a curated public-review allowlist and narrowed the neighborhood page data loader to the 10 selected review candidates. Pages remain hidden from indexing and navigation while the copy and building associations are reviewed.

Generated files and changes for this pass:

- `data/peter/normalized/neighborhoods.public-review-allowlist.json`
- `_data/neighborhoodPages.js`
- `pages/commercial-real-estate/neighborhood.njk`
- `assets/css/system.css`

## Build Result

- Command: `NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy`
- Result: passed
- Eleventy output: copied 22 assets and wrote 11,953 files

## Page Count

| Metric | Count |
| --- | ---: |
| Public-review allowlist records | 10 |
| Allowlisted pages found in `_site` | 10 |
| Missing allowlisted pages | 0 |
| Pages missing `noindex,follow` | 0 |
| Allowlisted URLs found in sitemap | 0 |
| Allowlisted URLs found in global header navigation | 0 |
| Pages with semantic chips | 5 |
| Pages without semantic chips | 5 |

## Generated URLs

- `/commercial-real-estate/CA/san-francisco/financial-district/`
- `/commercial-real-estate/CA/san-francisco/union-square/`
- `/commercial-real-estate/CA/san-francisco/civic-center/`
- `/commercial-real-estate/CA/san-francisco/hayes-valley/`
- `/commercial-real-estate/CA/san-francisco/marina-district/`
- `/commercial-real-estate/CA/oakland/jack-london-square/`
- `/commercial-real-estate/CA/oakland/old-oakland/`
- `/commercial-real-estate/CA/oakland/west-oakland/`
- `/commercial-real-estate/CA/oakland/lake-merritt/`
- `/commercial-real-estate/CA/oakland/chinatown/`

## Noindex, Sitemap, And Navigation Verification

- All generated allowlisted pages remain `noindex,follow`.
- No allowlisted page URLs appear in `_site/sitemap.xml`.
- No allowlisted page URLs appear in the global header navigation.

## Pages With Semantic Chips

- `/commercial-real-estate/CA/oakland/jack-london-square/`
- `/commercial-real-estate/CA/oakland/old-oakland/`
- `/commercial-real-estate/CA/oakland/west-oakland/`
- `/commercial-real-estate/CA/oakland/lake-merritt/`
- `/commercial-real-estate/CA/oakland/chinatown/`

## Pages Without Semantic Chips

- `/commercial-real-estate/CA/san-francisco/financial-district/`
- `/commercial-real-estate/CA/san-francisco/union-square/`
- `/commercial-real-estate/CA/san-francisco/civic-center/`
- `/commercial-real-estate/CA/san-francisco/hayes-valley/`
- `/commercial-real-estate/CA/san-francisco/marina-district/`

## Template Improvements Made

- Replaced the robotic `Rofo is evaluating...` hero language with calmer market-guide language.
- Replaced the prominent internal prototype note with a softer review note: neighborhood and building associations are based on available location data and may be refined.
- Added fallback `Commercial context` copy for pages without semantic chips.
- Changed the building section language to `Representative buildings associated with this neighborhood` and avoided listing or availability wording.
- Kept the broader market links and nearby-neighborhood comparison structure, but with less internal QA language.

## Remaining Thin Or Risky Areas

- San Francisco pages still mostly lack semantic chips. They need curated business-environment copy before indexing.
- Oakland pages with `Waterfront context` should be reviewed because the signal may be too broad across multiple districts.
- Representative building matches remain directional and should be manually reviewed before public linking.
- The review note should stay visible while noindex is active, but should be reduced to a small data note before public launch.
- Nearby neighborhood links are still derived from the review data and should be curated before indexing.

## Recommended Next Step

Manually review these 10 pages in browser, select 3 to 5 for a first indexable pilot, then replace generic context sections with curated district-specific copy before removing noindex.
