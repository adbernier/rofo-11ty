# Neighborhood City Navigation Expansion

Date: 2026-05-13

## Summary

City pages now behave more like neighborhood and commercial area discovery hubs. The existing neighborhood page system was preserved, and the reviewed commercial geography graph is now allowed to generate lighter pages even when representative building examples are not yet available.

No neighborhood URLs were changed. No unrelated systems were modified.

## City Pages Updated

The city neighborhood module now appears as:

> Explore neighborhoods and commercial areas

Visible intro:

> Compare neighborhoods, business districts, and commercial areas within {City}.

Each city page shows the top 8 neighborhood or commercial area links as pill-style links, then exposes the remaining city areas behind a `View all neighborhoods` details control.

Updated markets:

| City | Total Areas | Visible Initially | Hidden Behind View All |
| --- | ---: | ---: | ---: |
| San Francisco, CA | 11 | 8 | 3 |
| Oakland, CA | 12 | 8 | 4 |
| Denver, CO | 10 | 8 | 2 |
| Austin, TX | 10 | 8 | 2 |
| Chicago, IL | 10 | 8 | 2 |

Total indexable neighborhood/commercial area pages: 53.

## Source of Truth

Runtime neighborhood pages now use:

- Existing neighborhood page data
- `data/peter/research/commercial_area_entities_v1.json`
- `data/peter/research/commercial_area_building_relationships_v1.json`

The commercial area entity file contributes 50 reviewed commercial areas. Existing approved neighborhood pages are preserved where they are not represented in the commercial area graph.

## Neighborhood Page Coverage

| Market | Pages With Representative Buildings | Pages Without Representative Buildings |
| --- | ---: | ---: |
| San Francisco, CA | 10 | 1 |
| Oakland, CA | 9 | 3 |
| Denver, CO | 8 | 2 |
| Austin, TX | 8 | 2 |
| Chicago, IL | 9 | 1 |

Totals:

- Pages with representative buildings: 44
- Pages without representative buildings: 9

Pages without representative buildings now use lighter content:

- Neighborhood overview
- Related space types where available from commercial profile tags
- Nearby neighborhoods and commercial areas
- Broader city market link
- Lead CTA to the city form
- "Explore opportunities in this area" framing

## Representative Building Behavior

Neighborhood pages with representative buildings continue to show building cards.

Building card rules are unchanged:

- Address-first naming where available
- Canonical building links
- No live availability language
- No pricing or suite-level claims

## Internal Linking

Strengthened links:

- City to top visible neighborhoods
- City to all reviewed neighborhoods through `View all neighborhoods`
- Neighborhood to city
- Neighborhood to nearby neighborhoods
- Neighborhood to related space types
- Neighborhood to representative buildings where available
- Building to neighborhood remains limited to high-confidence inherited relationships

Building page neighborhood inheritance remains unchanged:

- High-confidence building to area links surfaced: 112

## Sitemap

The existing sitemap behavior is preserved. All indexable neighborhood pages are included.

Verification:

- Indexable neighborhood pages: 53
- Missing indexable neighborhood URLs from sitemap: 0

No suppressed or unreviewed areas were added.

## Skipped or Suppressed Areas

No reviewed commercial area entities were skipped in this pass.

The previous building-support requirement was removed for reviewed entities, because commercially meaningful areas can be useful discovery pages even before representative buildings are attached.

## Styling

The city page neighborhood links keep the existing Rofo pill/card look.

Added:

- Subtle underline hover for `View all neighborhoods`
- Expandable details styling
- Preserved neighborhood pill hover underline behavior

## Validation

Build command:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy
```

Result:

- Build passed
- Eleventy wrote 12,112 files

Spot checks:

- `/commercial-real-estate/CA/san-francisco/` includes `Explore neighborhoods and commercial areas` and `View all neighborhoods`.
- `/commercial-real-estate/CA/san-francisco/south-park/` builds as a lighter neighborhood page without representative building cards.
- `/commercial-real-estate/CA/oakland/` includes the expanded Oakland neighborhood set.
- `/commercial-real-estate/CA/oakland/temescal/` builds as a lighter neighborhood page without representative building cards.

## Remaining Refinement Areas

- Add manually reviewed representative buildings for the 9 lighter pages where appropriate.
- Improve editorial copy on high-value pages that do not yet have building examples.
- Consider an explicit city-level "all neighborhoods" landing page only if city modules become too long.
- Continue keeping building-to-neighborhood inheritance limited to high-confidence relationships.

