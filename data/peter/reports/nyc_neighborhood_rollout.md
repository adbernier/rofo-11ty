# NYC Neighborhood Rollout

Date: 2026-05-13

## Summary

This rollout adds Manhattan and Brooklyn neighborhood and commercial area pages to Rofo's existing neighborhood page system. It does not create a separate area-page architecture.

The naming set uses recognized NYC geography with NYC Planning 2020 Neighborhood Tabulation Areas as a reference layer where applicable. NTAs are treated as neighborhood-like statistical geographies, not exact neighborhood boundaries.

Outputs and changed runtime inputs:

- `data/peter/research/nyc_neighborhood_rollout_candidates.json`
- `_data/neighborhoodPages.js`
- `_data/buildingPages.js`
- `city.njk`
- `assets/css/system.css`
- `data/peter/reports/nyc_neighborhood_rollout.md`

## Candidate Set

Candidate file:

- `data/peter/research/nyc_neighborhood_rollout_candidates.json`

Candidate counts:

| Status | Count |
| --- | ---: |
| launch | 59 |
| review | 5 |
| hold | 0 |
| suppress | 0 |

The five review-only candidates were retained for future editorial review and were not generated as pages.

## Pages Generated

Total NYC neighborhood/commercial area pages generated: 59

| Borough | Generated Pages |
| --- | ---: |
| Manhattan | 32 |
| Brooklyn | 27 |

All generated pages use the existing route pattern:

```text
/commercial-real-estate/NY/new-york/{neighborhood-slug}/
```

Example generated pages:

- `/commercial-real-estate/NY/new-york/financial-district/`
- `/commercial-real-estate/NY/new-york/tribeca/`
- `/commercial-real-estate/NY/new-york/flatiron-district/`
- `/commercial-real-estate/NY/new-york/midtown/`
- `/commercial-real-estate/NY/new-york/downtown-brooklyn/`
- `/commercial-real-estate/NY/new-york/dumbo/`
- `/commercial-real-estate/NY/new-york/williamsburg/`
- `/commercial-real-estate/NY/new-york/brooklyn-navy-yard/`

## Representative Building Support

| Page Type | Count |
| --- | ---: |
| Pages with representative buildings | 22 |
| Pages without representative buildings | 37 |

Pages without representative buildings use the lighter neighborhood content path:

- neighborhood overview
- related space types
- nearby neighborhoods
- broader New York market link
- lead CTA

No live inventory or current availability claims were added.

## Building Page Neighborhood Inheritance

High-confidence building to neighborhood inheritance was added only for curated representative building paths.

- Building pages with NYC neighborhood inheritance: 58

Example verified:

- `/commercial-real-estate/building/NY/new-york/14-wall-st/`
- Shows `Located in Financial District`
- Building lead form includes hidden `neighborhood_name = Financial District`

## NYC City Navigation

The New York city page now includes the expanded neighborhood module.

Visible behavior:

- Top 8 neighborhoods/commercial areas are shown as pill links.
- `View all neighborhoods` expands the complete list.
- Expanded list is grouped by:
  - Manhattan
  - Brooklyn

Verified on:

- `/commercial-real-estate/NY/new-york/`

## Sitemap Additions

All 59 indexable NYC neighborhood pages are included in the sitemap.

Verification:

- NYC generated pages: 59
- Missing NYC neighborhood URLs from sitemap: 0

Review-only candidates are not generated and therefore are not included in the sitemap.

## Naming Notes

Canonical names were selected to match common NYC commercial geography and Rofo slug conventions.

Examples:

- `Hell's Kitchen` is used as the public canonical page, with Clinton treated as a review-only alias concern.
- `Brooklyn Navy Yard` is used instead of a generic `Navy Yard`.
- `Industry City` and `Greenwood` are split rather than launching a combined `Industry City / Greenwood` page.
- `Times Square` is launched, while `Theater District` remains review-only to avoid duplicate intent.

## Review and Skipped Candidates

Review-only candidates:

- Theater District
- Clinton
- Lower Manhattan
- Navy Yard
- Industry City / Greenwood

Reasons:

- duplicate or overlapping user intent
- alias naming concerns
- better canonical page already selected
- broad submarket overlap

No candidates were marked `suppress` in this curated NYC file.

## Validation

Build command:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy
```

Result:

- Build passed
- Eleventy wrote 12,175 files

Spot checks:

- `/commercial-real-estate/NY/new-york/financial-district/` builds with representative building cards.
- `/commercial-real-estate/NY/new-york/dumbo/` builds with the lighter no-building content path.
- `/commercial-real-estate/NY/new-york/` shows grouped Manhattan and Brooklyn neighborhood links.
- `/commercial-real-estate/building/NY/new-york/14-wall-st/` inherits `Financial District` context.

## Recommended Next Refinements

1. Add editorial intro copy for the highest-traffic NYC pages before expanding beyond Manhattan and Brooklyn.
2. Add more high-confidence Brooklyn representative building relationships as the current Brooklyn building graph is thin.
3. Review duplicate intent between Midtown, Midtown South, East Midtown, Plaza District, Times Square, and Garment District.
4. Consider a dedicated NYC neighborhood QA pass focused on borough grouping and nearby-neighborhood ordering.
5. Keep the NTA reference language internal. Public pages should remain simple commercial geography pages, not statistical geography explanations.

