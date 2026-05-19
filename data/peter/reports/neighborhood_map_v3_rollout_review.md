# Neighborhood Map V3 Rollout Review

Date: 2026-05-19

## Scope

This was a controlled rollout across neighborhoods that already had map hero records. No new district pages or new map hero entities were mass-created.

## Inventory

Existing map hero records reviewed: 230

After rollout:

- V3 influence rendering: 230
- Legacy polygon rendering: 0

The rollout uses existing center/label placements and nearby comparison nodes. It does not introduce exact boundaries or new GIS data claims.

## Implementation Summary

### V3 Defaulting

Map hero records now receive V3 defaults when they have a usable center placement:

- explicit `center_point`, or
- existing `label_position`, or
- compact map `x` / `y` coordinates

This converts existing mapped neighborhoods from fake polygon overlays to soft influence/radius rendering while preserving current curated nearby labels, route labels, water labels, and basemap context.

### Water Suppression

Default water was suppressed for inland/non-water bases that did not have explicit water geometry:

- Los Angeles
- Denver

Atlanta already suppressed default water. This prevents non-waterfront districts from inheriting misleading generic shoreline geometry.

### Preserved Context

Existing reviewed geography/context was preserved for:

- NYC / Manhattan + Brooklyn
- San Francisco
- Bay Area / Oakland / Palo Alto
- Atlanta / Buckhead
- waterfront city bases such as Chicago, Miami, San Diego, Seattle, Boston, Washington DC, Dallas, and Nashville

## Neighborhoods Upgraded

All existing mapped neighborhoods were upgraded to V3 influence rendering.

Primary reviewed examples:

- DUMBO
- NYC Financial District
- Buckhead
- Downtown Oakland
- Uptown Oakland
- Jack London Square
- Downtown Palo Alto

Additional mapped markets upgraded through the existing map hero inventory:

- San Francisco mapped neighborhoods
- New York mapped neighborhoods
- Chicago mapped neighborhoods
- Los Angeles mapped neighborhoods
- Miami mapped neighborhoods
- Dallas mapped neighborhoods
- Seattle mapped neighborhoods
- Boston mapped neighborhoods
- Washington DC mapped neighborhoods
- Atlanta mapped neighborhoods
- San Diego mapped neighborhoods
- Nashville mapped neighborhoods
- Denver mapped neighborhoods

## Deferred / Suppressed

No existing map hero was fully suppressed in this pass because every existing record had a usable center placement. The risky rendering behavior was addressed by:

- replacing polygon overlays with V3 influence circles
- suppressing fake default water on inland bases
- preserving explicit water only where the base map already models water or shoreline context

## Remaining Weak Map Candidates

The following are not blockers for production push, but should be reviewed before making them flagship examples:

- Older `*-v1` regional basemap geometries still need market-specific V3 cartographic refinement.
- Some large city basemaps remain more schematic than the NYC, SF, Bay Area, and Atlanta refined bases.
- Waterfront markets should eventually receive more natural shoreline simplification where they are likely to be high-visibility geography pages.
- Corridor-heavy markets should get lighter, more realistic corridor hierarchy, similar to the V3 Buckhead and Palo Alto refinements.

## Archetypes Now Supported

The V3 rollout supports the current reusable archetypes:

- dense downtown
- waterfront district
- suburban commercial node
- corridor district
- campus/R&D district
- walkable downtown

All archetypes now use approximate center/influence rendering rather than exact-looking boundaries.

## Build Verification

Build command:

`npm run build`

Representative pages to verify:

- DUMBO: V3 influence area on Brooklyn land with East River / Hudson River context.
- NYC Financial District: V3 Lower Manhattan influence area with DUMBO comparison.
- Buckhead: V3 influence area with Atlanta freeway-commercial context and no fake shoreline.
- Downtown Oakland, Uptown Oakland, Jack London Square: V3 influence areas with San Francisco Bay and Lake Merritt context.
- Downtown Palo Alto: V3 influence area with Peninsula, Caltrain, El Camino, and 101 context.
- Los Angeles and Denver examples: no default fake water.

Lead flow, CTA behavior, hidden fields, and spam protections were not modified.
