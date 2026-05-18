# Neighborhood Intelligence Extraction System Prototype

Date: 2026-05-15

## Scope

This prototype extracts structured neighborhood intelligence signals for five reviewed Tier 1 neighborhood pages only:

- San Francisco Financial District
- Atlanta Buckhead
- Los Angeles Arts District
- Dallas Uptown
- San Diego Kearny Mesa

This is an internal intelligence-generation workflow. It does not expand page coverage, change routing, alter sitemap behavior, or generate mass copy.

## Files Created Or Changed

- Added `scripts/peter/extract_neighborhood_intelligence_signals.js`
- Added `data/peter/research/neighborhood_intelligence_signals_v1.json`
- Updated `_data/neighborhoodIntelligence.js`
- Updated `_includes/partials/neighborhood/intelligence.njk`
- Updated `assets/css/system.css`
- Added this report

## Extraction Inputs

The extractor reads:

- `_data/neighborhoodPages.js`
- `_data/buildingPages.js`
- `data/peter/research/commercial_area_building_relationships_v1.json`
- `data/peter/derived/active_building_semantic_bridge.json`, but only direct `building_id` matches

The script intentionally avoids broad address-fallback semantic matches because prior review found those useful for internal exploration but too risky for public-facing enrichment.

## Output File

Machine-readable output:

`data/peter/research/neighborhood_intelligence_signals_v1.json`

Each target record includes:

- canonical neighborhood path
- commercial area id and type
- source inputs
- evidence summary
- extracted signals
- public-safe signal chips
- omitted signals with reasons

## Confidence Model

Signals are scored using a small deterministic model:

- Representative building space-type mix
- Existing page-level commercial profile tags
- Existing approximate semantic signals
- High-confidence commercial area relationships when available
- Direct building-ID semantic bridge matches where available
- Representative building size labels and fit terms

Confidence levels:

- `high`: strong repeated evidence or reviewed profile support plus representative building support
- `medium`: useful but less complete support
- `low`: omitted from public output

Only `high` confidence public-safe chips are shown in the UI.

## Extracted Public Signal Chips

Financial District, San Francisco:

- Downtown core
- Office-oriented

Buckhead, Atlanta:

- Office-oriented

Arts District, Los Angeles:

- Office-oriented
- Creative office

Uptown, Dallas:

- Office-oriented

Kearny Mesa, San Diego:

- Office-oriented
- Freeway access context

## Strongest Useful Signals Found

- Financial District: downtown core, office orientation, retail context, professional services fit
- Buckhead: office orientation, professional services fit, financial services fit
- Arts District: creative office, office orientation, industrial or flex context, warehouse context
- Uptown Dallas: office orientation, transit orientation, retail context
- Kearny Mesa: office orientation, freeway access, suburban office pattern, industrial or flex context

## Weak Or Noisy Signals Omitted

The extractor explicitly suppresses:

- current availability
- asking rent
- suite-level claims
- furnished
- plug-and-play
- move-in ready
- current parking

It also avoids public display for medium-confidence signals. Those remain available in the research JSON for review but are not surfaced in the UI.

## UI Integration

The existing Neighborhood Intelligence component now optionally renders an `Extracted signals` chip group when `derived_signal_chips` are present.

The data loader stays conservative:

- `_data/neighborhoodIntelligence.js` reads the generated research JSON if present.
- It attaches only `public_signal_chips` to the five existing prototype records.
- Non-prototype neighborhoods remain unchanged.

## QA Expectations

Expected behavior:

- Only the five prototype neighborhoods show extracted signal chips.
- No non-prototype neighborhood receives the module.
- Map cards, representative buildings, nearby links, and lead forms remain unchanged.
- No external dependencies are added.
- No live availability, pricing, or suite-level claims appear.

## Future Scaling Recommendations

1. Keep extraction deterministic and explainable.
2. Require direct building relationships or reviewed area support before public display.
3. Continue excluding address-fallback semantic matches from public chips until reviewed.
4. Create a review queue for medium-confidence signals before promotion.
5. Add source counts and reviewer notes before scaling beyond 15 to 25 neighborhoods.
6. Prefer concise chips and short orientation modules over generated paragraph copy.
