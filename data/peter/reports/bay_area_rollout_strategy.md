# Bay Area Editorial Neighborhood Rollout Strategy

This is a curated editorial layer for commercially meaningful Bay Area business districts. Automation suggests candidates, but editorial judgment decides what should become a future public experience.

Rofo should treat these records as business district intelligence for discovery, internal linking, SEO enrichment, and AI retrieval context. They are not listing inventory and do not imply current availability.

## Recommended First 5 Prototype Districts

| neighborhood_name | city | canonical_label | neighborhood_type | editorial_confidence |
| --- | --- | --- | --- | --- |
| Downtown Oakland | Oakland | Downtown Oakland | downtown office and civic district | high |
| Jack London Square | Oakland | Jack London Square | waterfront office and retail district | high |
| Downtown Palo Alto | Palo Alto | Downtown Palo Alto | premium office and retail district | medium |
| Financial District | San Francisco | San Francisco Financial District | downtown office district | high |
| Jackson Square | San Francisco | Jackson Square | boutique office and design district | high |

Why these are first: they combine recognizable business identity, strong tenant search intent, good building density, clear internal linking paths, and enough enrichment potential for useful prototype pages.

## Recommended Next 10 Districts

| neighborhood_name | city | canonical_label | neighborhood_type | editorial_confidence |
| --- | --- | --- | --- | --- |
| Mission Bay | San Francisco | Mission Bay | life science and modern office district | high |
| SOMA | San Francisco | SoMa | mixed office and innovation district | high |
| South Park | San Francisco | South Park | creative office district | high |
| Downtown San Jose | San Jose | Downtown San Jose | downtown office and civic district | high |
| North San Jose | San Jose | North San Jose | technology office and industrial district | high |
| South San Francisco Biotech Corridor | South San Francisco | South San Francisco Biotech Corridor | life science and industrial district | medium |
| Downtown Berkeley | Berkeley | Downtown Berkeley | university-adjacent office and retail district | high |
| Mountain View | Mountain View | Mountain View business districts | Silicon Valley office and technology district | medium |
| Temescal | Oakland | Temescal | neighborhood retail and small business district | medium |
| Uptown Oakland | Oakland | Uptown Oakland | creative office and mixed-use district | medium |

## Districts to Defer

| district | reason |
| --- | --- |
| Uptown Oakland | Useful business identity, but legacy source uses Northgate labels. Needs boundary review. |
| Mountain View | High activity exists, but there is no clean downtown Mountain View legacy record with geo. |
| Redwood City | Strong city market signal, but neighborhood labels need editorial review before a true downtown district page. |

## Curated District Coverage

| neighborhood_name | city | rollout_priority | editorial_confidence | representative_building_count | recommended_space_types |
| --- | --- | --- | --- | --- | --- |
| Downtown Oakland | Oakland | 1 | high | 10 | office\|retail\|coworking\|flex |
| Jack London Square | Oakland | 1 | high | 10 | office\|retail\|coworking\|flex |
| Downtown Palo Alto | Palo Alto | 1 | medium | 10 | office\|retail\|coworking |
| Financial District | San Francisco | 1 | high | 10 | office\|coworking\|retail |
| Jackson Square | San Francisco | 1 | high | 10 | office\|retail\|coworking |
| Mission Bay | San Francisco | 1 | high | 10 | office\|medical office\|lab\|retail |
| SOMA | San Francisco | 1 | high | 10 | office\|coworking\|flex\|retail |
| South Park | San Francisco | 1 | high | 10 | office\|coworking\|flex |
| Downtown San Jose | San Jose | 1 | high | 10 | office\|retail\|coworking\|flex |
| North San Jose | San Jose | 1 | high | 10 | office\|industrial\|flex\|coworking |
| South San Francisco Biotech Corridor | South San Francisco | 1 | medium | 10 | office\|lab\|industrial\|flex |
| Downtown Berkeley | Berkeley | 2 | high | 10 | office\|retail\|coworking |
| Mountain View | Mountain View | 2 | medium | 10 | office\|coworking\|retail\|flex |
| Temescal | Oakland | 2 | medium | 10 | retail\|office\|coworking |
| Uptown Oakland | Oakland | 2 | medium | 10 | office\|retail\|coworking\|flex |
| Redwood City | Redwood City | 2 | medium | 10 | office\|retail\|medical office\|coworking |
| Dogpatch | San Francisco | 2 | high | 10 | flex\|industrial\|office\|retail |
| Mission District | San Francisco | 2 | medium | 10 | retail\|office\|coworking\|flex |
| Union Square | San Francisco | 2 | high | 10 | retail\|office\|showroom\|coworking |
| Sunnyvale | Sunnyvale | 2 | medium | 10 | office\|retail\|coworking\|flex |

## Data Quality Cautions

- Several useful business districts do not map cleanly to one legacy neighborhood record.
- Some editorial labels intentionally consolidate multiple source neighborhoods, such as Downtown Oakland and South San Francisco Biotech Corridor.
- Nearest-centroid building assignment is suitable for internal prototyping, but reviewed boundaries are needed before public rollout.
- `listing_count` is historical leasing activity intensity, not current availability.
- Representative buildings should be used as examples of building intelligence, not as live listings.

## Content Strategy

- Frame pages around tenant decisions: why the district matters, who it fits, what nearby districts to compare, and what space types are commonly searched.
- Use human business district labels, not raw legacy neighborhood names, when the editorial label is clearer.
- Avoid stale listing language. Say historical activity, representative buildings, and commercial context.
- Enrich each district with nearby district comparisons, city and space-type links, representative building intelligence, and cautious market notes.

## Internal Linking Strategy

- Link each future district page to the parent city market guide and transactional city page.
- Link to relevant space-type pages and space-type guides when they exist.
- Use adjacency relationships for nearby district comparisons.
- Link representative building pages only when a canonical Rofo building page exists or can be generated from approved building-level data.

## Why This Is Business District Intelligence

The point of this layer is to help businesses understand location fit. It should support questions like where similar tenants search, which districts are comparable, and what building patterns exist. It should not expose raw listings, suite-level availability, old rents, or stale inventory.

## Adjacency Coverage

| neighborhood_name | city | related_neighborhood_name | related_city | relationship_type |
| --- | --- | --- | --- | --- |
| Downtown Berkeley | Berkeley | Temescal | Oakland | nearby_alternative |
| Mountain View | Mountain View | Sunnyvale | Sunnyvale | nearby_alternative |
| Downtown Oakland | Oakland | Jack London Square | Oakland | nearby_alternative |
| Downtown Oakland | Oakland | Uptown Oakland | Oakland | adjacent |
| Jack London Square | Oakland | Downtown Oakland | Oakland | same_tenant_search_pattern |
| Uptown Oakland | Oakland | Temescal | Oakland | nearby_alternative |
| Downtown Palo Alto | Palo Alto | Mountain View | Mountain View | comparable |
| Redwood City | Redwood City | Downtown Palo Alto | Palo Alto | nearby_alternative |
| Financial District | San Francisco | Jackson Square | San Francisco | adjacent |
| Financial District | San Francisco | SOMA | San Francisco | nearby_alternative |
| Mission Bay | San Francisco | Dogpatch | San Francisco | adjacent |
| Mission District | San Francisco | Dogpatch | San Francisco | comparable |
| SOMA | San Francisco | Mission Bay | San Francisco | nearby_alternative |
| SOMA | San Francisco | South Park | San Francisco | adjacent |
| South Park | San Francisco | Mission Bay | San Francisco | adjacent |
| Union Square | San Francisco | Financial District | San Francisco | nearby_alternative |
| Downtown San Jose | San Jose | North San Jose | San Jose | same_tenant_search_pattern |
| North San Jose | San Jose | Sunnyvale | Sunnyvale | comparable |
| South San Francisco Biotech Corridor | South San Francisco | Redwood City | Redwood City | nearby_alternative |
| South San Francisco Biotech Corridor | South San Francisco | Mission Bay | San Francisco | comparable |
| Sunnyvale | Sunnyvale | North San Jose | San Jose | nearby_alternative |
