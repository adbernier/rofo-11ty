# Neighborhood Graph Rollout Phase 2

Date: 2026-05-13

## Summary

Rofo's existing neighborhood page infrastructure now uses the reviewed commercial geography graph as an additional page source. The rollout preserves the existing neighborhood URL pattern, template, breadcrumbs, city integration, sitemap behavior, and lightweight UX.

This phase generated neighborhood, district, corridor, and submarket pages only where the reviewed commercial area graph has representative building support.

## Pages Generated

- Total indexable neighborhood pages after rollout: 44
- Phase 2 commercial graph pages: 41
- Existing phase 1 public pages preserved without commercial graph support: 3
- Net new neighborhood URLs beyond the prior 10 page public set: 34

Pages by market:

| Market | Page Count |
| --- | ---: |
| San Francisco, CA | 10 |
| Oakland, CA | 9 |
| Denver, CO | 8 |
| Austin, TX | 8 |
| Chicago, IL | 9 |

Preserved phase 1 pages without commercial graph representative building support:

- Chinatown, Oakland
- Lake Merritt, Oakland
- Marina District, San Francisco

## Skipped Entities

The following reviewed commercial area entities were skipped because they did not have representative building support in `commercial_area_building_relationships_v1.json`:

- South Park, San Francisco
- Temescal, Oakland
- Fruitvale, Oakland
- Rockridge, Oakland
- River North Art District, Denver
- Baker, Denver
- South Congress, Austin
- East Austin, Austin
- River West, Chicago

These should remain candidates for a future pass after stronger building relationships are created or manually reviewed.

## Representative Buildings

- Neighborhood pages with representative buildings: 44
- Total representative building cards shown across neighborhood pages: 156
- Building cards use address-first naming where available.
- Building cards link to canonical building paths.
- Buildings are positioned as supporting commercial examples, not live inventory.

## Relationship Inheritance

High-confidence commercial area relationships are now inherited by building page data for selected buildings.

- High-confidence building to area relationships: 112
- Building pages with inherited commercial area context: 112
- Building-page UI inheritance: active for high-confidence relationships only

Building pages now show a subtle `Located in {Neighborhood}` link where the relationship confidence is high. Medium-confidence relationships are not surfaced on building pages.

## Nearby Neighborhood Linking

Neighborhood pages now derive nearby neighborhood links from other generated public neighborhood pages in the same city.

The nearby links are based on centroid distance when coordinates are available. This keeps the behavior lightweight and consistent with the current data quality level.

## City Integration

The existing city page neighborhood module automatically reflects the expanded `neighborhoodPages` dataset.

Markets now showing expanded neighborhood modules:

- San Francisco, CA
- Oakland, CA
- Denver, CO
- Austin, TX
- Chicago, IL

No global navigation links were added.

## Sitemap Additions

The existing sitemap behavior is preserved. All non-noindex neighborhood pages from `neighborhoodPages` are included.

Verification:

- Indexable neighborhood pages: 44
- Missing indexable neighborhood URLs from sitemap: 0

No unrelated sitemap behavior was changed.

## Template and Data Changes

Changed files:

- `_data/neighborhoodPages.js`
- `_data/buildingPages.js`
- `pages/commercial-real-estate/neighborhood.njk`
- `building.njk`

The neighborhood template was not redesigned. Copy was lightly adapted so districts, corridors, submarkets, and downtown cores can use the same page system without creating a parallel area-page architecture.

## Validation

Build command:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy
```

Result:

- Build passed
- Eleventy wrote 12,102 files

Spot checks:

- `/commercial-real-estate/IL/chicago/west-loop/` builds as a district guide.
- `/commercial-real-estate/CA/oakland/downtown-oakland/` builds with representative buildings.
- `/commercial-real-estate/building/CA/oakland/1440-broadway/` shows `Located in Downtown Oakland`.

## Rollout Concerns

- Some generated pages have only one or two representative buildings. They are valid for this phase because the entity is reviewed and has building support, but they may need more editorial enrichment before aggressive internal linking.
- Nearby neighborhood links are centroid-based, not polygon-based.
- Building to neighborhood inheritance is intentionally limited to high-confidence relationships.
- Commercial profile tags are useful for page framing but should not be treated as current inventory or availability.
- The source graph files are now runtime inputs for the expanded neighborhood/building relationship layer and should be treated as required data dependencies.

## Recommended Next Refinement Areas

1. Manually review the nine skipped commercial area entities and add representative building relationships only where commercially defensible.
2. Add editorial descriptions for the highest-value districts before further public expansion.
3. Improve area adjacency with reviewed relationships instead of relying only on centroid distance.
4. Add a building relationship QA view for the 112 inherited building-page area links.
5. Consider city-by-city editorial passes for Chicago, Denver, and Austin before adding more areas.

