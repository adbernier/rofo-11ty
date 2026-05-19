# Neighborhood Map System Refinement

Date: 2026-05-18

## Scope

This pass focused on the current neighborhood/district map hero system for:

- Buckhead
- Downtown Oakland
- Uptown Oakland
- Downtown Palo Alto
- Jack London Square
- NYC / Manhattan examples, including the Financial District, Meatpacking District, Upper East Side, and Upper West Side

No new public districts were mass-generated. No interactive map dependency was added.

## Current System Limitations

The existing map hero system was useful as a restrained editorial orientation device, but it had three important limitations:

1. The template drew the same generic roads, parks, and background marks for most places.
2. Some city-specific bases only supplied labels and a highlighted polygon, so different districts could feel interchangeable.
3. If a district had no map hero input, the page correctly fell back to a non-map card, but there was no stronger standard for whether a supplied map had enough real geographic context to render.

This made maps feel too abstract for authority-sensitive geography pages. The issue was most visible in the Bay Area, Buckhead, and Manhattan examples, where users expect recognizable shorelines, freeway spines, rail corridors, or district-relative positioning.

## Recommended Map Data Strategy

Use a static editorial map system with structured inputs, not a heavy GIS UI.

Each rendered map should be backed by a small set of deliberate geographic inputs:

- water or shoreline paths where relevant
- major freeway or road corridors
- rail/transit spine where relevant
- recognizable parks, lakes, or open-space anchors
- approximate district highlight polygon
- nearby district label positions
- route/transit labels

Do not claim exact district boundaries unless reliable polygon data is available. The map should communicate orientation, not cadastral precision.

## Map Archetypes

Recommended archetypes for future regional expansion:

- **Dense downtown core**: CBD/civic/office center with nearby downtown subdistricts and transit spine.
- **Waterfront district**: shoreline, port/ferry/rail context, adjacent downtown or warehouse districts.
- **Corridor district**: linear road, rail, or mixed-use corridor with nearby nodes.
- **Suburban commercial node**: freeway rings, arterial access, office/retail clusters, parking-oriented setting.
- **Campus/R&D district**: campus or lab cluster, highway access, shuttle/transit relationship, nearby downtown alternatives.
- **Walkable downtown district**: main street, rail station, retail/professional services, nearby downtowns along a regional spine.

## Implementation Changes Made

### Template

Updated `_includes/partials/neighborhood/map-hero.njk` to support optional geography layers:

- `context_areas`
- `context_paths`
- `suppress_generic_context`

When context paths are supplied, the map uses those place-specific layers instead of the old generic road/park marks. This keeps the style restrained while allowing the underlying spatial context to be more credible.

### Fallback Safety

Updated `pages/commercial-real-estate/neighborhood.njk` so a map hero only renders when it has:

- a map hero object
- no explicit suppression flag
- an approximate polygon
- a label position

This prevents incomplete map inputs from rendering as misleading generic maps.

### Bay Area / Oakland

Added a shared Oakland context layer with:

- San Francisco Bay on the west side
- Lake Merritt as a visible inland water body
- Broadway/BART-style north-south spine
- I-880 waterfront/freeway orientation
- downtown/waterfront corridor relationships

Updated:

- Downtown Oakland
- Uptown Oakland
- Jack London Square

Jack London Square now has its own map hero, correcting the missing-map issue. It is represented as an Oakland waterfront district south of Downtown and Old Oakland, with I-880, Amtrak, and BART context.

### Downtown Palo Alto

Added a Peninsula-specific context layer with:

- Bay orientation to the east
- Peninsula/Caltrain/El Camino/101 corridor logic
- nearby Menlo Park, California Avenue, Mountain View, and Redwood City relationships

This supports the district as a walkable downtown on a regional Peninsula spine rather than a generic Bay Area node.

### Buckhead

Updated the Atlanta base map context to emphasize:

- north Atlanta location
- GA 400 spine
- I-75/I-85 connector relationship
- I-285 northside ring
- I-20 and downtown connector context

Buckhead now reads more like a north Atlanta freeway-commercial and executive office node instead of a generic dot north of Midtown.

### NYC / Manhattan

Updated the NYC base map to better ground Manhattan examples with:

- Hudson River and East River framing
- Central Park
- Manhattan north-south corridor/spine
- FDR/east side corridor
- Brooklyn/Downtown Brooklyn relationship

This improves all current NYC simple map examples without changing page structure or adding exact boundary claims.

### San Francisco

Updated the San Francisco base map to improve:

- peninsula/water framing
- downtown/SoMa/east side corridor context
- freeway and Muni-style corridor cues

This reduces the interchangeable feeling on SF neighborhood examples such as the Financial District.

## Future Scalable Workflow

For each future district, map inputs should be prepared alongside editorial review:

1. Assign one map archetype.
2. Identify region/city base geography:
   - water/shoreline
   - freeway/arterial corridors
   - rail/transit spine
   - major parks or civic anchors
3. Add an approximate district highlight polygon.
4. Add 3-5 nearby district labels.
5. Add 2-4 route/transit labels only if they aid orientation.
6. Suppress the map if there is not enough trusted context to make it believable.
7. Review the generated page at desktop and mobile widths before public rollout.

## Remaining Risks

- Current shapes are editorial SVG approximations, not GIS-derived boundaries.
- Some legacy city bases outside this focus set still use simpler abstraction and should be reviewed before flagship rollout.
- Future districts should not inherit a region base blindly; the base must match the district's spatial logic.
- Exact polygons should only be introduced if sourced from reliable boundary data and labeled accordingly.

## Build Verification

Build verification should confirm:

- Buckhead renders with the updated Atlanta freeway-commercial context.
- Downtown Oakland and Uptown Oakland render with Bay/Lake Merritt/Oakland corridor context.
- Jack London Square now renders a waterfront map.
- Downtown Palo Alto renders with Peninsula/Caltrain orientation.
- NYC examples render with Manhattan river/Central Park context.
- Pages without complete map inputs fall back rather than rendering incomplete maps.
