# Neighborhood Public Launch Phase 1

Generated: 2026-05-11

## Summary

Phase 1 launches exactly 10 approved neighborhood pages for controlled public indexing:

- 5 San Francisco neighborhoods
- 5 Oakland neighborhoods

All other neighborhood prototype/review pages remain excluded from the active neighborhood page data loader, sitemap, and navigation.

## URLs Launched

### San Francisco

- https://www.rofo.com/commercial-real-estate/CA/san-francisco/financial-district/
- https://www.rofo.com/commercial-real-estate/CA/san-francisco/union-square/
- https://www.rofo.com/commercial-real-estate/CA/san-francisco/civic-center/
- https://www.rofo.com/commercial-real-estate/CA/san-francisco/hayes-valley/
- https://www.rofo.com/commercial-real-estate/CA/san-francisco/marina-district/

### Oakland

- https://www.rofo.com/commercial-real-estate/CA/oakland/jack-london-square/
- https://www.rofo.com/commercial-real-estate/CA/oakland/old-oakland/
- https://www.rofo.com/commercial-real-estate/CA/oakland/west-oakland/
- https://www.rofo.com/commercial-real-estate/CA/oakland/lake-merritt/
- https://www.rofo.com/commercial-real-estate/CA/oakland/chinatown/

## Indexing Confirmation

- Active neighborhood page data loader count: 10
- Approved pages with `noindex` meta present: 0
- Approved pages are eligible for indexing.
- Non-approved neighborhood prototype pages are not included in the active data loader for this launch pass.

## Sitemap Confirmation

- Sitemap entries for approved neighborhood URLs: 10
- No additional neighborhood URLs were intentionally added to the sitemap.
- Sitemap logic includes only `neighborhoodPages` records where `noindex` is false.

## City Module Confirmation

Neighborhood modules were added only to the two approved launch cities.

### San Francisco city page

Generated page:

`/commercial-real-estate/CA/san-francisco/`

Module heading:

`Explore neighborhoods`

Links rendered:

- Civic Center
- Union Square
- Hayes Valley
- Financial District
- Marina District

### Oakland city page

Generated page:

`/commercial-real-estate/CA/oakland/`

Module heading:

`Explore neighborhoods`

Links rendered:

- Chinatown
- Jack London Square
- Lake Merritt
- Old Oakland
- West Oakland

## Building Page Link Confirmation

No neighborhood links were added to building pages.

Verification command found no approved neighborhood URL references under:

`_site/commercial-real-estate/building`

## Navigation Confirmation

- No global navigation links were added.
- Header search for approved neighborhood URLs returned no matches.
- Footer/global navigation was not changed.

## Template Notes

The neighborhood template language was updated from internal prototype wording to calmer public-facing language while preserving conservative data framing:

- No current availability claims
- No pricing claims
- No suite-level claims
- Representative buildings remain contextual examples only
- Building and neighborhood associations are still described as directional and refinable

The previous prominent prototype note was replaced with a softer data note:

`Review note: neighborhood and building associations are based on available location data and may be refined.`

## Build Result

Command:

`NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy`

Result:

- Build passed
- Output: 11,954 files written
- Eleventy version: 3.1.5

## Issues Discovered

No blocking issues were found during the phase 1 rollout verification.

Remaining review considerations before expanding beyond these 10 pages:

- Keep the next rollout constrained to manually reviewed neighborhoods.
- Do not add building-page neighborhood links until assignment confidence improves.
- Continue treating representative buildings as contextual examples, not active inventory.
- Keep broader neighborhood generation out of sitemap until each page is reviewed and explicitly approved.
