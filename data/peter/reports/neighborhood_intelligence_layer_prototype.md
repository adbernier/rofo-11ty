# Neighborhood Intelligence Layer Prototype

Date: 2026-05-14

## Scope

This prototype adds a small, reviewed Neighborhood Intelligence layer to five Tier 1 neighborhood pages only:

- San Francisco Financial District
- Atlanta Buckhead
- Los Angeles Arts District
- Dallas Uptown
- San Diego Kearny Mesa

The prototype is intentionally narrow. It does not generate new pages, change sitemap behavior, alter lead routing, or add external dependencies.

## Files Added Or Changed

- Added `_data/neighborhoodIntelligence.js`
- Added `_includes/partials/neighborhood/intelligence.njk`
- Updated `_data/neighborhoodPages.js`
- Updated `pages/commercial-real-estate/neighborhood.njk`
- Updated `assets/css/system.css`
- Added this report at `data/peter/reports/neighborhood_intelligence_layer_prototype.md`

## Data Structure

The prototype uses a small reviewed data object keyed by canonical neighborhood path:

```js
{
  "/commercial-real-estate/CA/san-francisco/financial-district/": {
    status: "prototype",
    confidence: "high",
    source_note: "...",
    headline: "...",
    modules: [
      {
        title: "Commercial character",
        text: "...",
        confidence: "high"
      }
    ],
    fit_chips: ["Professional services"],
    building_scale_patterns: ["Larger office buildings"],
    nearby_alternatives: [
      {
        label: "Jackson Square",
        note: "Compare for a smaller boutique office feel near the downtown core."
      }
    ]
  }
}
```

The neighborhood page data loader attaches this record as `neighborhood.neighborhood_intelligence`. The template renders the module only when that field exists, so non-prototype neighborhoods remain unchanged.

## Confidence And Omission Approach

The prototype is conservative:

- Only five reviewed pages are populated.
- Observations are short and based on existing commercial area data, representative buildings, nearby links, map-card geography, and durable semantic signals.
- If a claim would require unsupported precision, it is omitted.
- No statistics were invented.
- No live availability, pricing, suite-level, or current inventory language is used.
- Transient signals such as furnished, plug-and-play, current parking, and move-in-ready language are excluded.

## UX Placement

The module appears after the existing "At a Glance" section and before representative buildings.

This placement is intentional:

- It complements the map card and quick overview.
- It adds useful interpretation before users scan buildings.
- It does not overpower lead generation or representative building cards.
- It keeps the page lightweight and skimmable.

## Prototype Modules

The rendered component includes:

- A short commercial profile headline.
- Compact cards for commercial character, building character, common space types, and access pattern.
- Chips for common business comparison contexts.
- Building scale pattern bullets.
- Nearby alternative notes.
- A small source and safety note.

## Example Output

San Francisco Financial District:

- Commercial character: Dense downtown office district with retail and service activity at the street level.
- Building character: Primarily office towers and established downtown buildings, with smaller professional buildings toward nearby Jackson Square.
- Common space types: Office, retail, and coworking are the clearest signals in Rofo's current data.
- Nearby alternatives: Jackson Square, Union Square, SoMa.

Los Angeles Arts District:

- Commercial character: Creative office and mixed commercial activity near Downtown Los Angeles and Little Tokyo.
- Building character: Converted warehouse, industrial, retail, and creative office signals are stronger here than in many nearby districts.
- Common space types: Office, industrial, and retail.
- Nearby alternatives: Downtown Los Angeles, Little Tokyo, Fashion District.

San Diego Kearny Mesa:

- Commercial character: Practical office, industrial, and retail district serving businesses that compare central San Diego locations.
- Building character: Suburban office, flex, and industrial-adjacent commercial patterns.
- Access pattern: Freeway access and central-market positioning.

## QA Notes

Expected behavior:

- The five prototype pages render the Neighborhood Intelligence module.
- Other neighborhood pages do not render the module.
- Existing map cards remain in the top-right hero card position.
- Nearby links, representative buildings, and lead forms remain unchanged.
- Lead form hidden neighborhood and commercial area metadata remains intact.
- The module stacks cleanly on mobile.

## Future Scaling Recommendations

1. Generate a reviewed `neighborhood_intelligence_candidates_v1.json` from Tier 1 neighborhoods before expanding.
2. Keep public data separate from research data until reviewed.
3. Require a minimum confidence threshold before rendering public summaries.
4. Use concise modules instead of long narrative copy.
5. Add intelligence only when at least two support sources exist, such as representative buildings plus durable listing signals, or representative buildings plus market guide support.
6. Track source notes internally so future reviewers can understand why each observation exists.
7. Avoid city-wide boilerplate. Every module should either say something specific or be omitted.

## Readiness Assessment

This is suitable as a prototype branch for UX and editorial review. It is not yet a broad production rollout system. The next step should be manual review of the five pages, followed by a small candidate dataset for 15 to 25 additional high-confidence neighborhoods.
