# Priority Market Commercial Geography Rollout: Seattle, Boston, and Washington DC

## Summary

This pass expanded the priority-market commercial geography layer for Seattle, Boston, and Washington DC using the existing Rofo neighborhood page system.

No templates, routes, sitemap logic, navigation logic, or building page code were changed. The rollout was limited to adding reviewed commercial area entities and high-confidence representative building paths to:

- `data/peter/research/priority_market_commercial_area_entities_v1.json`

## Reference Sources Used

Seattle references included existing Rofo neighborhood candidates, current Rofo building paths, and recognized Seattle neighborhood and downtown planning geography such as Downtown, South Lake Union, Denny Triangle, Belltown, Pioneer Square, Ballard, Fremont, University District, Northgate, and SoDo.

Boston references included existing Rofo neighborhood candidates, current Rofo building paths, City of Boston neighborhood context, and recognized commercial districts such as Downtown Boston, Financial District, Back Bay, Seaport District, Government Center, Leather District, North Station / West End, Theater District, Longwood Medical Area, South End, and Fenway-Kenmore.

Washington DC references included existing Rofo neighborhood candidates, current Rofo building paths, DC neighborhood/commercial district context, and recognized business improvement or community improvement district geography such as Golden Triangle, Penn Quarter, Capitol Riverfront, NoMa, Mount Vernon Triangle, Dupont Circle, Capitol Hill, H Street NE, Georgetown, and Southwest Waterfront.

## Seattle

### Pages Added

12 Seattle commercial area pages were added:

- Downtown Seattle
- South Lake Union
- Denny Triangle
- Belltown
- Pioneer Square
- Capitol Hill
- Ballard
- Fremont
- University District
- Northgate
- SoDo
- Waterfront

### Building Matches

15 Seattle building paths were attached as high-confidence representative buildings:

- Downtown Seattle: 8
- Denny Triangle: 1
- Pioneer Square: 2
- Ballard: 2
- Northgate: 1
- Waterfront: 1

Seattle pages without building inheritance were launched only where the area is recognized and commercially meaningful, but current building paths did not provide clear address-level support.

### Skipped or Deferred Seattle Areas

Skipped or deferred areas include:

- Rainier Valley and South Park, pending a more specific commercial corridor or industrial geography review.
- Pike Pine Retail Core, because the name is commercially meaningful but should be reconciled with Capitol Hill / Pike-Pine naming before launch.
- Eastlake, Green Lake, Queen Anne, Lower Queen Anne, and other plausible areas, pending a broader Seattle neighborhood review.
- 555 Andover Park W, because the address appears to fit Tukwila/Southcenter context rather than a Seattle neighborhood page.

## Boston

### Pages Added

11 Boston commercial area pages were added:

- Downtown Boston
- Financial District
- Back Bay
- Seaport District
- Government Center
- Leather District
- North Station / West End
- Theater District
- Longwood Medical Area
- South End
- Fenway-Kenmore

### Building Matches

17 Boston building paths were attached as high-confidence representative buildings:

- Downtown Boston: 1
- Financial District: 5
- Back Bay: 5
- Seaport District: 2
- Government Center: 1
- Leather District: 1
- North Station / West End: 2

Boston pages without building inheritance were launched where the geography is recognized and commercially relevant, but current building paths did not justify direct inheritance.

### Skipped or Deferred Boston Areas

Skipped or deferred areas include:

- Jeffries Point / Airport, because it mixes East Boston and airport context and should be reviewed separately.
- Bay Village and Beacon Hill, pending a more focused commercial relevance review.
- D Street / West Broadway, because it should be reconciled with South Boston Waterfront / Seaport / Fort Point naming.
- West Codman Hill / West Lower Mills and Roslindale, because they are legitimate areas but not first-pass commercial geography priorities.

## Washington DC

### Pages Added

11 Washington DC commercial area pages were added:

- Downtown DC
- Golden Triangle
- Penn Quarter
- Capitol Riverfront
- NoMa
- Mount Vernon Triangle
- Dupont Circle
- Capitol Hill
- H Street NE
- Georgetown
- Southwest Waterfront

### Building Matches

16 Washington DC building paths were attached as high-confidence representative buildings:

- Downtown DC: 1
- Golden Triangle: 6
- Penn Quarter: 2
- Capitol Riverfront: 2
- Mount Vernon Triangle: 2
- Dupont Circle: 1
- Capitol Hill: 1
- H Street NE: 1

DC pages without building inheritance were launched only where the geography is recognized and commercially meaningful.

### Skipped or Deferred DC Areas

Skipped or deferred areas include:

- North Capitol Street, because it needs more precise corridor boundaries before launch.
- Northeast Washington, Northwest Washington, Southeast Washington, and Southwest Washington, because those labels are too broad for the commercial area layer.
- Adams Morgan, pending a broader DC neighborhood pass with more representative commercial links.

## QA Checks

Verified after build:

- Seattle pages generated: 12
- Boston pages generated: 11
- Washington DC pages generated: 11
- No accidental `noindex` on the new pages
- Sitemap includes all new Seattle, Boston, and DC URLs
- Seattle, Boston, and Washington DC city pages show the neighborhood/commercial area module
- City-page disclosure label remains `View more neighborhoods`
- Titles/meta did not show double-escaped entities
- Building inheritance is limited to explicitly listed high-confidence representative building paths

## Build Result

Final build command:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy
```

Result: passed.

## QA Concerns

No blocking issues found.

Seattle has several important commercial areas where the page can launch cleanly without representative buildings, but building inheritance should remain conservative until more address-level support is available.

Boston has overlapping downtown, Financial District, Theater District, Leather District, and Seaport/Fort Point naming. The first-pass assignments prioritize address-obvious buildings and leave the rest unassigned.

Washington DC has several broad quadrant-style labels in the source data. Those were intentionally skipped because they are too broad for public neighborhood/commercial area pages.

## Recommended Next Step

Before moving to the next priority batch, manually spot-check:

- Seattle: Downtown Seattle, South Lake Union, Ballard, Pioneer Square
- Boston: Financial District, Back Bay, Seaport District, North Station / West End
- Washington DC: Golden Triangle, Penn Quarter, Capitol Riverfront, Mount Vernon Triangle

Then continue with Atlanta, San Diego, Nashville, and Denver using the same conservative pattern.
