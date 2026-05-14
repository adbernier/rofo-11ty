# Priority Market Commercial Area Rollout: Chicago

## Summary

This pass expands Chicago as the first priority-market test for Rofo's commercial geography layer.

The implementation reuses the existing City -> Neighborhood/Commercial Area -> Representative Buildings system. It does not create a parallel area-page system, change routes, change sitemap rules, or modify production templates.

## Existing Implementation Reviewed

Current neighborhood generation flows through:

- `_data/neighborhoodPages.js`
- `pages/commercial-real-estate/neighborhood.njk`
- `city.njk`
- `pages/sitemap.njk`
- `_data/buildingPages.js` for high-confidence building -> commercial area inheritance

Chicago previously had 10 indexable commercial area pages from `commercial_area_entities_v1.json`:

- The Loop
- West Loop
- Fulton Market
- River North
- Magnificent Mile
- Streeterville
- South Loop
- Goose Island
- Clybourn Corridor
- River West

## Source Review

Primary source checks used for naming and defensibility:

- City of Chicago Data Portal community area boundaries
- Existing Rofo resolved neighborhood candidates
- Existing Rofo commercial area entity data
- Existing live Chicago building pages
- Existing commercial area building relationships
- Recognized Chicago business district references such as Chicago Loop Alliance and Choose Chicago neighborhood material

## New Data File

Created:

- `data/peter/research/priority_market_commercial_area_entities_v1.json`

This file uses the same commercial area entity shape as the existing v1 file, with a small amount of rollout metadata:

- `recommended_status`
- `representative_building_paths`
- `city_nav_priority`

The intent is to keep priority-market expansion reviewable without rewriting the older v1 entity file.

## Chicago Areas Added

Added 16 Chicago neighborhood/commercial area pages:

- Illinois Medical District
- Fulton River District
- Prairie District
- Hyde Park
- Lincoln Park
- Logan Square
- Wicker Park
- Pilsen
- Chinatown
- Bridgeport
- Uptown
- Andersonville
- O'Hare
- Old Town
- Rogers Park
- Edgewater

Total Chicago neighborhood/commercial area pages after this pass: 26.

## Building Matches

Building -> neighborhood inheritance remains high-confidence only.

New high-confidence building matches added in this pass: 6.

New matched buildings:

- `5113 S Harper Ave` -> Hyde Park
- `2443 W 16th St` -> Pilsen
- `4753 N Broadway` -> Uptown
- `5440 N Cumberland Ave` -> O'Hare
- `8623 W Bryn Mawr Ave` -> O'Hare
- `8770 W Bryn Mawr Ave` -> O'Hare

Chicago building pages with any high-confidence commercial area after this pass: 29.

Areas launched without representative buildings are intentional. The geography is recognizable, but building inheritance was deferred where the available building graph did not support a conservative match.

## City Page Navigation

The existing Chicago city page neighborhood module now picks up the expanded area set automatically:

- Top areas remain visible in the primary city-page neighborhood list.
- The `View all neighborhoods` disclosure includes the full Chicago set.
- No new global navigation links were added.

## Sitemap

The existing sitemap rule includes indexable neighborhood pages from `_data/neighborhoodPages.js`.

Chicago indexable neighborhood/commercial area URLs after this pass: 26.

No suppressed or review-only pages were added by this pass.

## Skipped or Deferred Geography

Skipped for now:

- `Chicago Loop` and `Loop` from candidate files because `The Loop` already exists as the canonical page.
- `West Loop Gate` because it risks overlap with the existing West Loop page.
- `Mid-North District` because it is less likely to be a clear tenant-facing commercial search label.
- `Portage Park` because it needs a stronger commercial page strategy before launch.
- Broad side labels such as `North Side`, `South Side`, and `West Side` because they are too broad for this page type.
- Smaller or ambiguous sub-neighborhoods where the name is real but commercial search intent is unclear.
- Several industrial addresses in Chicago because their neighborhood fit needs manual review before building-page inheritance.

## Rollout Sequence Recommendation

Recommended next sequence:

1. Finish reviewing Chicago page quality and city-page discoverability.
2. Repeat the same workflow for Los Angeles, because geography quality and neighborhood naming complexity are highest there.
3. Follow with Miami and Dallas, where commercial submarkets and corridors are clearer.
4. Continue with Seattle, Boston, and Washington DC.
5. Use Atlanta, San Diego, Nashville, and Denver as later passes because they can reuse the pattern once the larger-market workflow is stable.

## Validation

Command run:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy
```

Result:

- Build passed.
- Eleventy wrote 12,192 files.
- Sample generated pages verified:
  - `/commercial-real-estate/IL/chicago/illinois-medical-district/`
  - `/commercial-real-estate/IL/chicago/hyde-park/`
  - `/commercial-real-estate/IL/chicago/o-hare/`
  - `/commercial-real-estate/IL/chicago/pilsen/`
  - `/commercial-real-estate/IL/chicago/uptown/`

## Notes

`_includes/base.njk` has existing unrelated modifications in the worktree. This pass did not modify that file.

No commit was created.
