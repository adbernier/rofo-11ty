# Priority Market Rollout: Atlanta, San Diego, Nashville, Denver

Date: 2026-05-13

## Summary

Added a conservative final batch of reviewed commercial area entities for Atlanta, San Diego, Nashville, and Denver using the existing neighborhood/commercial area system.

This pass did not create a parallel page system, did not modify templates, did not change sitemap logic, and did not add global navigation. New pages are generated through the existing neighborhood page loader and are included in the existing sitemap flow.

## Files changed

- `data/peter/research/priority_market_commercial_area_entities_v1.json`
- `data/peter/reports/priority_market_atlanta_sandiego_nashville_denver_rollout.md`

Note: `_includes/base.njk` was already modified before this pass and was not changed for this rollout.

## Source basis

The area set was checked against existing Rofo city/building data, existing commercial area candidates, and recognized civic/planning geography references:

- Atlanta official Neighborhood Planning Unit and neighborhood references
- San Diego official community planning areas
- Metro Nashville planning/community planning references
- Denver official neighborhood/open data references

The goal was commercial geography coherence, not polygon-perfect boundary assignment.

## Pages added

| Market | Pages added | Notes |
| --- | ---: | --- |
| Atlanta, GA | 11 | Includes major office nodes, industrial corridors, airport area, and recognizable intown districts. |
| San Diego, CA | 12 | Uses recognized community planning areas and commercial submarkets where building support is strong. |
| Nashville, TN | 10 | Conservative first pass focused on downtown, office, hospitality, and airport area districts. |
| Denver, CO | 5 | Added only net-new complementary areas because several Denver entities already existed in the prior graph. |
| Total | 38 | All generated through existing neighborhood infrastructure. |

## New commercial areas

### Atlanta

- Downtown Atlanta
- Midtown
- Buckhead
- Perimeter Center
- Cumberland / Galleria
- West Midtown
- Old Fourth Ward
- Fulton Industrial
- Hartsfield-Jackson Airport Area
- South Downtown
- Inman Park

### San Diego

- Downtown San Diego
- East Village
- Little Italy
- Bankers Hill
- Mission Valley
- Kearny Mesa
- Sorrento Valley
- University City
- Rancho Bernardo
- Otay Mesa
- Barrio Logan
- Liberty Station

### Nashville

- Downtown Nashville
- SoBro
- Midtown
- Music Row
- West End
- Green Hills
- East Nashville
- Donelson / Airport Area
- The Gulch
- Germantown

### Denver

- Santa Fe Arts District
- Central Park
- Northeast Denver Industrial
- Globeville / Elyria-Swansea
- Lower Highland

Existing Denver entities already covered Central Business District, LoDo, River North Art District, Denver Tech Center, Cherry Creek, Ballpark, Baker, Globeville, Sun Valley, and Capitol Hill. Duplicate Denver entries for those areas were intentionally avoided in this final pass.

## Representative building support

| Market | New representative building paths | Missing paths | Path conflicts |
| --- | ---: | ---: | ---: |
| Atlanta | 48 | 0 | 0 |
| San Diego | 76 | 0 | 0 |
| Nashville | 10 | 0 | 0 |
| Denver | 24 | 0 | 0 |

Denver currently shows 40 total inherited commercial-area building relationships after build because the prior Denver graph already had high-confidence assignments. This pass added 24 non-conflicting representative paths for net-new Denver areas.

## High-confidence building inheritance after build

| Market | Current inherited building count |
| --- | ---: |
| Atlanta | 48 |
| San Diego | 76 |
| Nashville | 10 |
| Denver | 40 |

Building inheritance remains path-based and high-confidence only. No address-fallback or low-confidence relationships were added.

## Skipped or deferred areas

### Atlanta

Deferred broader or potentially overlapping areas such as Century Center, Northlake, Brookhaven/Dunwoody labels, Grant Park, Virginia-Highland, Chamblee/Doraville industrial references, and other suburban or residential-leaning candidates. These may be reconsidered when Rofo has a broader metro-area model.

### San Diego

Deferred finer-grained downtown subdistricts and areas with weaker current support, including Gaslamp Quarter, Cortez Hill, Middletown, La Jolla, North Park, Hillcrest, Grantville, Clairemont, and Miramar. Some are valid geographies but need separate review to avoid overlap or thin pages.

### Nashville

Deferred broader or weaker candidates such as Bell Forge Village, Metrocenter/North Rhodes Park, Historic Edgefield, Bellevue, North Nashville, South Nashville, Watkins Park, and other lower-confidence residential or broad geography labels.

### Denver

Deferred duplicate entries already represented by the earlier Denver graph, including Downtown Denver/CBD, LoDo, RiNo, Cherry Creek, and Denver Tech Center. Broader labels and residential-leaning candidates were held for future review.

## Validation

Command run:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy
```

Result:

- Build passed.
- Eleventy wrote 12,317 files.
- All 38 new pages were generated.
- No accidental `noindex` was found on the new pages.
- Sitemap contains all 38 new URLs.
- City pages for Atlanta, San Diego, Nashville, and Denver render the neighborhood module.
- The disclosure label remains `View more neighborhoods`.
- No title/meta double-escaping was found in the generated pages.
- `_includes/base.njk` remained untouched by this pass.

## QA concerns

No blocking issues found.

Areas such as Perimeter Center, Cumberland / Galleria, Sorrento Valley, Kearny Mesa, Otay Mesa, Donelson / Airport Area, Northeast Denver Industrial, and Globeville / Elyria-Swansea are commercial submarkets or planning/commercial areas rather than tight neighborhood boundaries. They are appropriate for Rofo's commercial geography framing, but future polygon or curated boundary work should refine nearby relationships and building assignment confidence.

## Recommended next step

Review the generated city pages and a sample of the new neighborhood pages manually before commit. If they read cleanly, this final priority-market batch is ready to commit with only the priority-market JSON and this report.
