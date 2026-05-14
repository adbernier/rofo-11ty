# Priority Market Commercial Geography Rollout: Miami and Dallas

## Summary

This pass expanded the priority-market commercial geography layer for Miami and Dallas using the existing Rofo neighborhood page system.

No templates, routes, sitemap logic, navigation logic, or building page code were changed. The rollout was limited to adding reviewed commercial area entities and high-confidence representative building paths to:

- `data/peter/research/priority_market_commercial_area_entities_v1.json`

## Reference Sources Used

Miami references included existing Rofo neighborhood candidates, Miami market snapshot context, current Rofo building paths, and public/civic references for recognized Miami neighborhoods and districts, including City of Miami neighborhood/NET area references and Greater Miami visitor/neighborhood context.

Dallas references included existing Rofo neighborhood candidates, Dallas market snapshot context, current Rofo building paths, City of Dallas economic development/downtown district references, and recognized district references such as Deep Ellum, Bishop Arts District, Uptown, Design District, and downtown Dallas districts.

## Miami

### Pages Added

13 Miami commercial area pages were added:

- Downtown Miami
- Brickell
- Wynwood
- Design District
- Edgewater
- Coconut Grove
- Little Havana
- Allapattah
- Little Haiti
- Overtown
- Blue Lagoon
- Coral Way
- Dadeland

### Building Matches

19 Miami building paths were attached as high-confidence representative buildings:

- Downtown Miami: 2
- Brickell: 5
- Wynwood: 2
- Blue Lagoon: 9
- Dadeland: 1

The remaining Miami pages launched without building inheritance because current building paths were either absent, too broad, or likely belonged to adjacent municipalities/submarkets.

### Skipped or Deferred Miami Areas

Skipped or deferred areas include:

- South Beach, because it is more properly Miami Beach context than Miami city context.
- Doral, Hialeah, North Miami, North Miami Beach, Miami Beach, and Aventura-like addresses, because those are separate municipal or submarket contexts and should not be forced into Miami neighborhood pages.
- Industrial Section, because the label is too generic for public-facing neighborhood rollout without editorial cleanup.
- Little River, Upper East Side, Model City, Flagami, and other plausible areas, pending a broader Miami-specific review pass.

## Dallas

### Pages Added

16 Dallas commercial area pages were added:

- Downtown Dallas
- Uptown
- Main Street District
- Victory Park
- Arts District
- West End Historic District
- Deep Ellum
- Design District
- Cedars
- Medical District
- Stemmons Corridor
- Turtle Creek
- Preston Center
- North Dallas
- Far North Dallas
- Bishop Arts District

### Building Matches

40 Dallas building paths were attached as high-confidence representative buildings:

- Downtown Dallas: 1
- Uptown: 7
- Main Street District: 2
- Victory Park: 1
- Design District: 2
- Stemmons Corridor: 5
- Turtle Creek: 1
- Preston Center: 3
- North Dallas: 7
- Far North Dallas: 11

Several Dallas pages intentionally launched without building inheritance because the current building paths did not provide enough address-level confidence.

### Skipped or Deferred Dallas Areas

Skipped or deferred areas include:

- Park Cities, because it is adjacent to Dallas and needs careful city/submarket handling.
- South Dallas/Fair Park, Cedar Crest, Oak Cliff, West Dallas, Old East Dallas, and Redbird, pending a fuller Dallas neighborhood review.
- Medical District received a page but no building inheritance because current live building paths did not clearly establish Medical District placement.
- Deep Ellum, Cedars, West End, Arts District, and Bishop Arts launched as recognized districts without building inheritance until stronger address-level matches are reviewed.

## QA Checks

Verified after build:

- Miami pages generated: 13
- Dallas pages generated: 16
- No accidental `noindex` on the new pages
- Sitemap includes all new Miami and Dallas URLs
- Miami and Dallas city pages show the neighborhood/commercial area module
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

Miami has several current building records whose addresses appear to belong to adjacent municipalities or broader Miami-Dade submarkets. Those were intentionally excluded from neighborhood inheritance.

Dallas has several broad commercial submarkets where representative building inheritance is useful but should remain conservative. North Dallas and Far North Dallas are broad labels, but the attached buildings are address-obvious within those commercial office corridors.

## Recommended Next Step

Before moving to the next priority market, manually spot-check:

- Miami: Brickell, Wynwood, Blue Lagoon, Dadeland
- Dallas: Uptown, Design District, Stemmons Corridor, Far North Dallas

Then continue with the next two markets using the same conservative pattern.
