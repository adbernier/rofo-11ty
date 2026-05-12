# Ecosystem Building Public Batch 1 Launch

Date: 2026-05-12

## Summary

Created a controlled first public batch of ecosystem building pages from the reviewed activation candidates.

- Public pages generated: 25
- Markets included: 5
- Pages per market: 5
- Public status: indexable_batch1
- Sitemap scope: only the 25 allowlisted URLs
- City-page linking: enabled only for the five batch markets

These pages are address-first commercial context pages. They do not include pricing, suite details, current availability claims, stale listing copy, prototype language, or neighborhood links.

## Markets Included

- Sarasota, FL
- Knoxville, TN
- Grand Rapids, MI
- Chattanooga, TN
- Albuquerque, NM

## Public URLs Added

### Sarasota, FL

- /commercial-real-estate/building/FL/sarasota/3950-central-sarasota-pkwy/
- /commercial-real-estate/building/FL/sarasota/1991-main-st/
- /commercial-real-estate/building/FL/sarasota/8586-potter-park-dr/
- /commercial-real-estate/building/FL/sarasota/1900-main-st/
- /commercial-real-estate/building/FL/sarasota/5500-bee-ridge-rd/

### Knoxville, TN

- /commercial-real-estate/building/TN/knoxville/10928-hardin-valley-rd/
- /commercial-real-estate/building/TN/knoxville/10820-kingston-pike/
- /commercial-real-estate/building/TN/knoxville/120-market-place-blvd/
- /commercial-real-estate/building/TN/knoxville/6408-papermill-road/
- /commercial-real-estate/building/TN/knoxville/9051-executive-park-dr/

### Grand Rapids, MI

- /commercial-real-estate/building/MI/grand-rapids/2851-charlevoix-dr-se/
- /commercial-real-estate/building/MI/grand-rapids/3196-kraft-ave-se/
- /commercial-real-estate/building/MI/grand-rapids/1971-e-beltline-ave-ne/
- /commercial-real-estate/building/MI/grand-rapids/1120-36th-st-se/
- /commercial-real-estate/building/MI/grand-rapids/3001-orchard-vista-dr-se/

### Chattanooga, TN

- /commercial-real-estate/building/TN/chattanooga/1700-broad-st/
- /commercial-real-estate/building/TN/chattanooga/5959-shallowford-rd/
- /commercial-real-estate/building/TN/chattanooga/6234-perimeter-dr/
- /commercial-real-estate/building/TN/chattanooga/1748-dayton-blvd/
- /commercial-real-estate/building/TN/chattanooga/6231-perimeter-dr/

### Albuquerque, NM

- /commercial-real-estate/building/NM/albuquerque/8500-menaul-blvd-ne/
- /commercial-real-estate/building/NM/albuquerque/6300-montano-rd-nw/
- /commercial-real-estate/building/NM/albuquerque/400-gold-ave-sw/
- /commercial-real-estate/building/NM/albuquerque/5700-harper-dr-ne/
- /commercial-real-estate/building/NM/albuquerque/6600-indian-school-rd-ne/

## Skipped And Suppressed Records

The public batch intentionally excludes:

- All land or development-oriented mixed records
- Records outside the selected five-market launch set
- Weak or uncertain records from the 63-page hidden prototype set
- Any record that would conflict with an existing production building URL
- Promotional names and stale listing-style titles

The hidden/noindex prototype pages remain separate and were not promoted as a group.

## Sitemap Confirmation

Validation confirmed all 25 allowlisted canonical building URLs are present in `_site/sitemap.xml`.

No non-allowlisted ecosystem prototype building URLs were added through the new public batch sitemap loop.

## City Page Link Confirmation

The following generated city pages include links to the public batch building pages:

- /commercial-real-estate/FL/sarasota/ links to 5 batch buildings
- /commercial-real-estate/TN/knoxville/ links to 5 batch buildings
- /commercial-real-estate/MI/grand-rapids/ links to 5 batch buildings
- /commercial-real-estate/TN/chattanooga/ links to 5 batch buildings
- /commercial-real-estate/NM/albuquerque/ links to 5 batch buildings

The city module is lightweight and uses address-first building links.

## Noindex Confirmation

Validation confirmed none of the 25 public batch pages contain a `noindex` robots meta tag.

The hidden prototype building pages remain separate under `/prototype/buildings/` and continue to use their prototype/noindex route behavior.

## Build Result

Command:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy
```

Result:

- Build passed
- Eleventy wrote 12055 files
- The 25 public ecosystem building pages were generated from `pages/commercial-real-estate/ecosystem-building-public.njk`

## Notes And Risks

- These pages are intentionally sparse and location-oriented.
- The pages should be reviewed in production-like QA for tone, title uniqueness, and internal-link balance before larger expansion.
- Future batches should continue to use allowlists rather than broad historical building imports.
- Neighborhood links were not added in this phase.
