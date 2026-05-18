# Neighborhood Hidden Prototype Build

## Summary

Built hidden/noindex prototype neighborhood pages for the 60 first-wave candidates only. These pages are for internal review and are not included in sitemap or navigation.

## Build Result

- Command: `NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy`
- Result: passed
- Eleventy output: copied 22 assets and wrote 12,002 files

## Generated Page Count

| Metric | Count |
| --- | ---: |
| First-wave candidate records | 60 |
| Prototype pages found in `_site` | 60 |
| Missing generated pages | 0 |
| Pages missing `noindex,follow` | 0 |
| Prototype URLs found in sitemap | 0 |
| Prototype URLs found in global header navigation | 0 |
| Pages without representative building cards | 0 |
| Pages without semantic signal chips | 38 |

## Pages By City

| City | Prototype pages |
| --- | ---: |
| Austin, TX | 15 |
| Denver, CO | 8 |
| Oakland, CA | 15 |
| San Diego, CA | 7 |
| San Francisco, CA | 15 |

## Sample Generated URLs By City

### Austin, TX

- `/commercial-real-estate/TX/austin/spicewood-professional-plaza/`
- `/commercial-real-estate/TX/austin/westover-hills/`
- `/commercial-real-estate/TX/austin/north-crossing/`
- `/commercial-real-estate/TX/austin/north-shoal-creek/`
- `/commercial-real-estate/TX/austin/north-burnet/`

### Denver, CO

- `/commercial-real-estate/CO/denver/civic-center/`
- `/commercial-real-estate/CO/denver/lincoln-park/`
- `/commercial-real-estate/CO/denver/lodo/`
- `/commercial-real-estate/CO/denver/northwest/`
- `/commercial-real-estate/CO/denver/city-park-west/`

### Oakland, CA

- `/commercial-real-estate/CA/oakland/chinatown/`
- `/commercial-real-estate/CA/oakland/jack-london-square/`
- `/commercial-real-estate/CA/oakland/lake-merritt/`
- `/commercial-real-estate/CA/oakland/mcclymonds/`
- `/commercial-real-estate/CA/oakland/northgate/`

### San Diego, CA

- `/commercial-real-estate/CA/san-diego/mira-mesa/`
- `/commercial-real-estate/CA/san-diego/fenton-carroll-canyon/`
- `/commercial-real-estate/CA/san-diego/kearny-mesa/`
- `/commercial-real-estate/CA/san-diego/serra-mesa/`
- `/commercial-real-estate/CA/san-diego/miramar/`

### San Francisco, CA

- `/commercial-real-estate/CA/san-francisco/civic-center/`
- `/commercial-real-estate/CA/san-francisco/lower-nob-hill/`
- `/commercial-real-estate/CA/san-francisco/union-square/`
- `/commercial-real-estate/CA/san-francisco/hillside/`
- `/commercial-real-estate/CA/san-francisco/nob-hill/`

## Verification Notes

- `noindex,follow` is present on all generated prototype pages.
- The generated prototype URLs are absent from `_site/sitemap.xml`.
- The generated prototype URLs are absent from the global header navigation.
- Representative building cards render on all 60 pages.
- Representative buildings are precomputed in `data/peter/normalized/neighborhoods.hidden-page-data.json` from current Rofo building paths and approximate centroid/radius proximity.
- Semantic signal chips render only when reviewed semantic signals are available in the page data.

## Pages With Missing Buildings Or Signals

Pages without representative buildings:

- None

Pages without semantic signal chips:

- `/commercial-real-estate/CA/oakland/clawson/`
- `/commercial-real-estate/CA/oakland/upper-mandela/`
- `/commercial-real-estate/CA/san-diego/kearny-mesa/`
- `/commercial-real-estate/CA/san-diego/miramar/`
- `/commercial-real-estate/CA/san-francisco/civic-center/`
- `/commercial-real-estate/CA/san-francisco/lower-nob-hill/`
- `/commercial-real-estate/CA/san-francisco/union-square/`
- `/commercial-real-estate/CA/san-francisco/hillside/`
- `/commercial-real-estate/CA/san-francisco/nob-hill/`
- `/commercial-real-estate/CA/san-francisco/japantown/`
- `/commercial-real-estate/CA/san-francisco/tenderloin/`
- `/commercial-real-estate/CA/san-francisco/hayes-valley/`
- `/commercial-real-estate/CA/san-francisco/chinatown/`
- `/commercial-real-estate/CA/san-francisco/western-addition/`
- `/commercial-real-estate/CA/san-francisco/russian-hill/`
- `/commercial-real-estate/CA/san-francisco/financial-district/`
- `/commercial-real-estate/CA/san-francisco/pacific-heights/`
- `/commercial-real-estate/CA/san-francisco/deco-ghetto/`
- `/commercial-real-estate/CA/san-francisco/marina-district/`
- `/commercial-real-estate/CO/denver/civic-center/`
- `/commercial-real-estate/CO/denver/lincoln-park/`
- `/commercial-real-estate/CO/denver/lodo/`
- `/commercial-real-estate/CO/denver/northwest/`
- `/commercial-real-estate/CO/denver/city-park-west/`
- `/commercial-real-estate/CO/denver/jefferson-park/`
- `/commercial-real-estate/CO/denver/sun-valley/`
- `/commercial-real-estate/CO/denver/capitol-hill/`
- `/commercial-real-estate/TX/austin/spicewood-professional-plaza/`
- `/commercial-real-estate/TX/austin/westover-hills/`
- `/commercial-real-estate/TX/austin/north-crossing/`
- `/commercial-real-estate/TX/austin/north-shoal-creek/`
- `/commercial-real-estate/TX/austin/north-burnet/`
- `/commercial-real-estate/TX/austin/spicewood-summit/`
- `/commercial-real-estate/TX/austin/stillhouse-springs/`
- `/commercial-real-estate/TX/austin/the-austin-center/`
- `/commercial-real-estate/TX/austin/north-burnet-gateway/`
- `/commercial-real-estate/TX/austin/allandale/`
- `/commercial-real-estate/TX/austin/parkcrest-center/`

## Manual Review Checklist

Before any public launch decision, review each candidate for:

1. Neighborhood name quality and spelling.
2. Whether the neighborhood has a clear commercial identity.
3. Whether representative building links make sense for the district.
4. Whether nearby neighborhood links are useful and not circular noise.
5. Whether the page can explain tenant decision context without relying on stale inventory.
6. Whether any copy implies current availability, pricing, suites, or live listings.
7. Whether the city and space-type links resolve to valid existing pages.
8. Whether the page should remain noindex, become a hidden prototype, or be suppressed.

## Recommended Next Step

Keep these pages hidden and noindexed while reviewing a smaller editorial set. Start with San Francisco and Oakland candidates that already align with the Bay Area business-district strategy, then decide whether San Diego, Austin, and Denver candidates have enough commercial identity for public pages.
