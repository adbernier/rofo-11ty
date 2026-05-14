# Priority Market Commercial Area Rollout: Los Angeles

## Summary

This pass expands Los Angeles as the second priority-market rollout after Chicago.

The implementation uses the existing neighborhood/commercial area page system. No new template, route system, sitemap rule, or city-page module was created.

## Existing Coverage

Before this pass:

- Los Angeles neighborhood/commercial area pages: 0
- Los Angeles building pages: 166
- Existing building -> neighborhood inheritance: 0

## Areas Added

Added 20 Los Angeles neighborhood/commercial area pages:

- Downtown Los Angeles
- Arts District
- Century City
- Fashion District
- Hollywood
- South Park
- Westwood
- Koreatown
- Westchester
- Playa Vista
- Miracle Mile
- Sawtelle
- Little Tokyo
- Brentwood
- Chinatown
- Venice
- Highland Park
- Cahuenga Pass
- Lincoln Heights
- Boyle Heights

## Building Inheritance

High-confidence building -> commercial area inheritance added for 59 Los Angeles building pages.

The matches are intentionally address-based and conservative. Examples:

- `10250 Constellation Blvd` -> Century City
- `1100 Mateo St` -> Arts District
- `515 S Flower St` -> Downtown Los Angeles
- `777 S Alameda St` -> Fashion District
- `1800 North Vine Street` -> Hollywood
- `6333 Wilshire Blvd` -> Miracle Mile
- `5777 W Century Blvd` -> Westchester
- `2045 Sawtelle Blvd` -> Sawtelle
- `5619 N Figueroa St` -> Highland Park

Areas without representative buildings are allowed where the geography is recognized and commercially meaningful, including Koreatown and Venice.

## Skipped or Deferred Areas

Deferred for later review:

- `Art District` from the raw candidate list, normalized to `Arts District`.
- `Central LA`, `South Los Angeles`, `Harbor`, and broad regional labels because they are too broad for this page type.
- `Bel Air`, `Beverly Glen`, `Holmby Hills`, and other mostly residential names.
- `Wilshire Center`, because it needs manual review against Koreatown and Mid-Wilshire naming.
- `West LA` and `West Los Angeles`, because they overlap with Sawtelle, Westwood, Brentwood, and broader Westside geography.
- Individual industrial clusters in South LA and Central Alameda, because building assignment needs a more explicit corridor or district strategy.

## City Page UX

The Los Angeles city page now shows the top neighborhood/commercial area links and the existing `View more neighborhoods` disclosure.

Visible ordering is intentionally weighted toward major commercial geographies:

1. Downtown Los Angeles
2. Arts District
3. Century City
4. Fashion District
5. Hollywood
6. South Park
7. Westwood
8. Koreatown

## Sitemap and Indexing

All 20 Los Angeles area pages are indexable and included in `sitemap.xml`.

No `noindex` was detected on the generated Los Angeles pages.

## Validation

Command run:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy
```

Result:

- Build passed.
- Eleventy wrote 12,213 files.

## QA Notes

- Titles and meta tags render without apostrophe or entity double-escaping issues.
- Nearby links are present for all Los Angeles areas. They are distance-based and generally useful for this first pass.
- Some edge neighborhoods and corridors should remain deferred until a more precise LA submarket strategy exists.
- No changes were made to `_includes/base.njk`.

## Source Notes

Names were checked against existing Rofo candidate data and City of Los Angeles planning/community-plan terminology where available. The strongest first-pass areas are established commercial districts, official planning geographies, recognized corridors, or long-standing LA neighborhoods with clear business search intent.
