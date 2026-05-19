# Neighborhood Map System V2

Date: 2026-05-18

## Purpose

Map System V2 moves Rofo neighborhood maps away from custom district polygons and toward restrained editorial cartography built on:

- simplified but believable basemap geometry
- district center points
- soft influence/radius areas
- nearby comparison nodes
- recognizable water, land, park, freeway, bridge, and rail context

The goal is spatial trust, not boundary precision.

## Problem With V1

V1 improved the original abstract maps by adding city-specific context layers, but it still used polygon overlays for districts. Those polygons could imply exact boundaries and, when paired with simplified basemap geometry, could appear spatially wrong. DUMBO was the clearest failure case: the Brooklyn-side water geometry made a district overlay appear partly in water.

## V2 Rendering Logic

The map hero now supports `map_system: "v2"` records with:

- `center_point`: the primary district center in the map coordinate system
- `influence_radius`: soft area of influence, not a boundary
- `focus_radius`: smaller center emphasis
- `nearby_districts`: secondary comparison labels
- `anchor_points`: secondary comparison dots
- `context_paths`: real-world corridors, bridges, freeways, transit spines, or arterial cues
- `context_areas`: parks, lakes, open-space anchors, or land features
- `water_paths`: simplified water or shoreline geometry

When a V2 record is present, the template renders soft circles instead of district polygons. Legacy polygon maps still render for older records until those maps are reviewed.

## Basemap Geometry Changes

### NYC / Manhattan + Brooklyn

The East River is now drawn as a river band between Manhattan and Brooklyn rather than as a large right-side water mass. Brooklyn-side districts such as DUMBO now sit visibly on land. The basemap also keeps:

- Hudson River
- East River
- Central Park
- Manhattan north-south spine
- FDR/east side corridor
- BQE / Brooklyn-side relationship
- bridge-adjacent context lines

### Oakland

The Oakland base uses:

- San Francisco Bay west of Oakland
- Lake Merritt as an inland water anchor
- Broadway/BART-style north-south spine
- I-880 waterfront/freeway orientation
- downtown-to-waterfront relationship

### Palo Alto

The Palo Alto base uses:

- Peninsula orientation
- San Francisco Bay to the east
- Caltrain spine
- El Camino corridor
- US 101 corridor

### Buckhead

The Buckhead/Atlanta base uses:

- GA 400
- I-75/I-85 downtown connector
- I-285 northside ring
- I-20/downtown context

Default water is suppressed for the Atlanta base so Buckhead does not inherit a misleading generic shoreline.

## Reviewed Districts

### DUMBO

Before: Polygon overlay could appear partly in water because the Brooklyn-side basemap geometry was too broad and abstract.

After: DUMBO uses a center point and influence circle on Brooklyn land, with Downtown Brooklyn, Navy Yard, Williamsburg, the Financial District, East River, and bridge-adjacent context visible.

### NYC Financial District

Before: Lower Manhattan polygon implied a boundary and sat in a simplified Manhattan/Brooklyn context.

After: Uses a Lower Manhattan center point and influence area, with Hudson/East River framing and DUMBO/Downtown Brooklyn context across the river.

### Buckhead

Before: Buckhead was a polygon-like node in an abstract Atlanta map.

After: Uses a center point and soft influence area near GA 400 and northside freeway-commercial context, with Midtown, Perimeter Center, and West Midtown as secondary comparisons.

### Downtown Oakland

Before: District polygon worked directionally but still implied a boundary.

After: Uses a center point and influence area around the Oakland business core, grounded by Bay, Lake Merritt, BART/Broadway, and I-880 context.

### Uptown Oakland

Before: Polygon overlapped a generalized Oakland context.

After: Uses a center point north of Downtown, visually secondary to Lake Merritt and Broadway/BART context, with Downtown and Jack London as comparisons.

### Jack London Square

Before: No map hero existed.

After: Uses a waterfront center point and influence area south of Downtown and Old Oakland, with I-880, Amtrak, BART, Bay, and Lake Merritt context.

### Downtown Palo Alto

Before: Peninsula context existed but relied on a polygon overlay.

After: Uses a downtown center point and influence area tied to Caltrain, El Camino, 101, Menlo Park, California Avenue, Mountain View, and Redwood City context.

## Scalable Workflow

For future regions:

1. Choose a map archetype: dense downtown, waterfront district, corridor district, suburban commercial node, campus/R&D district, or walkable downtown.
2. Build a simplified basemap using real geographic anchors.
3. Place the district center point from reviewed spatial knowledge or reliable centroid data.
4. Use a soft influence circle instead of a boundary polygon.
5. Add 3-5 nearby comparison nodes.
6. Add only the corridors, routes, bridges, rail spines, or water bodies that help orientation.
7. Suppress the map if the page lacks enough trusted spatial inputs.
8. Review generated HTML and visual output before adding the district to a public rollout.

## Implementation Notes

Changed:

- `_includes/partials/neighborhood/map-hero.njk`
- `_data/neighborhoodMapHeroes.js`
- `pages/commercial-real-estate/neighborhood.njk`

The page layout, lead flow, CTA behavior, hidden fields, and spam protections were not modified.

## Remaining Risks

- V2 still uses hand-authored simplified SVG geometry, not GIS tiles.
- Center points are editorial/cartographic placements, not exact legal centroids.
- Legacy map records still use V1 polygons until reviewed.
- Each new market needs a real basemap pass before flagship rollout.

## Build Verification

Run after implementation:

`npm run build`

Reviewed pages should verify:

- DUMBO renders on Brooklyn land, not in water.
- NYC Financial District renders as a Lower Manhattan influence area.
- Buckhead renders without default water and with freeway-commercial orientation.
- Downtown Oakland, Uptown Oakland, and Jack London Square render with Bay/Lake Merritt context.
- Downtown Palo Alto renders with Peninsula/Caltrain orientation.
