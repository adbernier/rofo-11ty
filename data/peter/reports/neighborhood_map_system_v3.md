# Neighborhood Map System V3

Date: 2026-05-18

## Purpose

Map System V3 is a refinement of V2, not a new mapping product. V2 fixed the core trust issues by replacing fake district polygons with center points and influence areas. V3 keeps that approach and improves the cartographic feel:

- softer influence rendering
- calmer labels and hierarchy
- subtler basemap texture
- more believable simplified shorelines
- lighter corridor and bridge cues
- stronger district-specific spatial storytelling

No interactive GIS, parcel detail, exact district boundaries, or dashboard overlays were introduced.

## Rendering Refinements

### Influence Areas

V2 circles were trustworthy but still somewhat diagrammatic. V3 now renders reviewed district influence areas with radial gradients and lighter strokes. The center marker is smaller, and the focus ring is softer, so the map reads as approximate commercial influence rather than a target graphic.

### Label Hierarchy

Map typography was reduced and quieted:

- primary district labels remain dominant but less oversized
- nearby comparison labels are smaller and lower contrast
- route labels are smaller and more restrained
- water labels are lighter and less competitive

This makes the maps feel more editorial and less like a schematic overlay.

### Basemap Texture

The background grid opacity is reduced for V3 maps. The map card now uses a softer layered background treatment, preserving texture without competing with geography.

### Corridors and Bridges

Corridor paths are lighter and narrower. Freeway, rail, and bridge cues now support orientation without becoming thick abstract bands.

## Geometry Refinements

### NYC / DUMBO

Before: The East River/Brooklyn-side geometry was corrected in V2, but the river still read as a smooth broad shape.

After: The Hudson and East River shapes have more natural bends and a narrower East River band between Manhattan and Brooklyn. DUMBO remains on Brooklyn land, with bridge/Downtown Brooklyn/Navy Yard context visible.

### NYC Financial District

Before: Lower Manhattan was spatially grounded but still visually schematic.

After: The Financial District uses the same refined Manhattan/Brooklyn base, with a softer Lower Manhattan influence area and quieter comparison nodes for Tribeca, SoHo, DUMBO, and Downtown Brooklyn.

### Buckhead

Before: Buckhead used V2 center/radius logic but the freeway lines were still heavy.

After: Buckhead uses a softer influence field and lighter north Atlanta freeway-commercial corridors. Default water remains suppressed so no misleading shoreline appears.

### Downtown Oakland

Before: Oakland V2 fixed Bay/Lake Merritt context but used relatively heavy corridor marks.

After: Downtown Oakland uses lighter Broadway/BART/I-880 cues, softer Bay geometry, and a calmer influence area around the East Bay business core.

### Uptown Oakland

Before: Uptown's V2 circle was accurate but visually close to a target marker.

After: Uptown uses a softer influence area north of Downtown, with Lake Merritt and Broadway/BART context remaining legible but secondary.

### Jack London Square

Before: V2 added the missing waterfront map and grounded the district south of Downtown.

After: The waterfront relationship is calmer and more editorial, with I-880, Amtrak, Bay, Downtown, and Uptown cues reduced in visual weight.

### Downtown Palo Alto

Before: V2 correctly expressed the Peninsula/Caltrain orientation.

After: Downtown Palo Alto uses a softer downtown influence area, lighter Caltrain/El Camino/101 corridor cues, and a more natural Bay edge.

## Reusable Cartography Archetypes

V3 keeps the same operational archetypes but defines their visual emphasis:

- **Dense downtown**: tighter framing, transit/civic anchors, compact influence radius.
- **Waterfront district**: shoreline relationship first, then adjacent districts and access corridors.
- **Suburban commercial node**: more breathing room, freeway/arterial hierarchy, broader influence field.
- **Corridor district**: directional movement along one or two primary spines.
- **Campus/R&D district**: campus/open-space anchors, highway access, nearby downtown alternatives.
- **Walkable downtown**: main street/rail spine, compact radius, nearby town-center comparisons.

## Implementation Changes

Changed:

- `_includes/partials/neighborhood/map-hero.njk`
- `_data/neighborhoodMapHeroes.js`
- `assets/css/system.css`
- `pages/commercial-real-estate/neighborhood.njk`

The reviewed maps use `map_system: "v3"`. Legacy V1/V2 records can still render, which keeps the system scalable while allowing deliberate market-by-market refinement.

## Remaining Risks

- Basemap geometry remains hand-authored simplified SVG, not GIS tiles.
- Center points are editorial placements, not legal centroids.
- Unreviewed map records may still need V3 conversion before flagship use.
- Future markets still require a real basemap pass before public rollout.

## Build Verification

Build command:

`npm run build`

Reviewed output should confirm:

- DUMBO renders as a V3 influence area on Brooklyn land.
- NYC Financial District renders as a V3 Lower Manhattan influence area.
- Buckhead renders without default water and with light freeway-commercial context.
- Downtown Oakland, Uptown Oakland, and Jack London Square render with Bay/Lake Merritt context and V3 influence areas.
- Downtown Palo Alto renders with Peninsula/Caltrain orientation and V3 influence treatment.
- Lead flow, CTA behavior, hidden fields, and spam protections remain unchanged.
