---
permalink: false
eleventyExcludeFromCollections: true
---
# Oakland map batch — local geographic review, 19 October 2026

Base: deployed SF/Sacramento commit `1be53138a29bb569c940b86dc4591f1b5a87595e`. No publishing is authorized by this document. The existing shared renderer, component, interaction code, URLs and lead/recommendation workflows are reused. Only Oakland expands the map registry. All 210 published SF/Sacramento SVG variants and their model records must remain identical; Phoenix guided sources/assets and behavior remain unchanged.

## Evidence and disposition

`data/maps/oakland-review-2026-10-19.json` records every proposed area and property, READY or HOLD, with reasons and source URLs. It is a presentation-only review, not new canonical district membership or a building capability/availability claim. Oakland entries fail closed if a completed READY review is absent. `oakland-municipal-review-2026-10-19.json` retains the dated Census municipal geometry used for checks (January 2026 vintage, acquired October 17); the review date is October 19, not a new acquisition date. All ten area points and 27 located property records lie inside that municipal geometry. The two unlocated properties remain without coordinates.

Nine of ten area references qualify. Existing Rofo-authored points retain approximate precision; the original upstream survey/geocoder lineage and numerical accuracy are not certified. Primary city/district-operator sources corroborate the named place/corridor. No new boundaries, city-center defaults, municipal-centroid substitutions or illustration-derived coordinates are used. Constant-size soft marks are drawing conventions, not extents.

- Downtown, Uptown and Old Oakland are related broad/narrow contexts, not aliases to collapse or mutually exclusive polygons. The city Downtown plan and the district operator support the relationship. Old Oakland’s historic core is documented by the city at 7th–10th Streets and Broadway–Clay. Map summaries now state the overlap plainly.
- Jack London refers to the commercial waterfront context, which is broader than the square itself. Its management plan and district map support the reference and the two cleared Franklin/3rd Street examples. A business improvement district is used to corroborate local identity, not to define all possible neighborhood usage.
- West Oakland uses the city plan’s I-580/I-980/I-880 orientation frame, including documented extensions. Figure 1.1.2 supports the five cleared interior property associations; this is not a claim about allowed use or parcel zoning.
- Hegenberger is a named-road corridor with no invented width. Four exact named-road addresses lie about 5–7 m from archived Census Hegenberger Road line geometry; the area reference is about 15 m away. These street-range geocodes do not identify entrances or parcel centers.
- Fruitvale is corroborated by the Unity Council’s named commercial corridors; Rockridge by the district association’s College Avenue context; Temescal by the city’s Temescal/Telegraph corridor record. The points locate commercial reference contexts, not full residential neighborhood extents.
- Coliseum Industrial remains HOLD: its reference is outside the city’s named Coliseum plan core, and the Rofo label may intend a wider industrial context. Neither relocating it to the stadium nor treating the specific plan as the complete commercial district is supported.

Eleven of 29 editorial property records qualify for new maps: five West Oakland, two Jack London and four Hegenberger named-road addresses. Source positions are the archived October 17 Census exact-address matches, based on normalized street/full house number/state/postal-city. Their acquisition date is preserved. Source batch IDs were renumbered consistently when appending Oakland to the published scoped batch; previous SF/Sac input/results are retained. No geocoder is called during build or runtime.

Eighteen property records remain unplotted: two unmatched Mandela Parkway addresses; one Kaiser Plaza record without a matching published district route; two Old Oakland edge/outside-core associations; 119 Filbert west of the referenced Jack London plan limits; two Edgewater records without independent Hegenberger association; and ten properties under the unresolved Coliseum Industrial context. Existing pages and canonical parent content are preserved rather than silently reassigned. Distance to an area marker or membership in Oakland alone does not clear a property association.

## Sources and reuse

- City Downtown plan: https://www.oaklandca.gov/Planning-Building/General-Plan-Neighborhood-Plans/Neighborhood-and-Citywide-Plans/Downtown-Oakland-Specific-Plan-DOSP
- City historic core: https://www.oaklandca.gov/Planning-Building/Historic-Preservation/List-of-Preservation-Districts-S-7-and-S-20-Zones/Victorian-Row-Old-Oakland-S-7
- District operator contexts: https://downtownoakland.org/our-neighborhoods/
- West Oakland final plan, chapter 1, section 1.1 / Figure 1.1.2: https://www.oaklandca.gov/files/assets/city/v/1/planning-amp-building/documents/sp/neighborhood-plans/wosp/wosp-chapter-1-introduction.pdf
- Jack London management plan, pp. 3, 6–8: https://ctycms.com/ca-jack-london/docs/jack-london-mdp-12323.pdf ; district map: https://ctycms.com/ca-jack-london/docs/attachment-a-district-maps.pdf
- City Coliseum plan: https://www.oaklandca.gov/Planning-Building/General-Plan-Neighborhood-Plans/Neighborhood-and-Citywide-Plans/Coliseum-Area-Specific-Plan
- Fruitvale operator: https://unitycouncil.org/renewal-of-the-fruitvale-property-business-improvement-district/
- Rockridge operator: https://www.rockridgedistrict.com/rocknstroll
- City Temescal/Telegraph identity: https://www.oaklandca.gov/Business/For-Business-Owners/Business-Resources/Business-Improvement-Districts
- Municipal and road query URLs, dates and government reuse credit remain in the checked-in source records/snapshots.

Only original factual review notes and source links are published. City/BID PDF images, map designs, listing descriptions and photos are not copied. Source PDF downloads are review-only artifacts outside the candidate; direct West Oakland PDF download returned 403, so its city-hosted text was independently read via web retrieval. This is an archive limitation, not invented geometry. Census data attribution remains visible in each map and the shared disclosure. No credentials, dependencies or configuration change.

## Verification and maintenance

Run `node scripts/maps/inventory.js`, `node scripts/maps/build-reviewed-maps.js`, `npm run build`, `node scripts/qa-reviewed-maps.js`, `node scripts/qa-sf-sac-map-scope.js`, `python3 scripts/maps/qa-oakland-map-evidence.py`, `python3 scripts/maps/qa-svg-layout.py` and `python3 scripts/maps/qa-property-match.py`. Browser checks use a localhost preview only. Review changes to named-place scope, official geometry, addresses, route ownership or district associations before updating READY status. An exact geocode can remain a HOLD. No availability is inferred or refreshed by this map maintenance.

The nationwide review remains open. Prioritize existing reviewed markets with dated municipal and address evidence; resolve aliases before expanding allowlists. Chicago Loop/The Loop and O’Hare variants, Denver RiNo/River North and Lower Highland(s), metro-vs-municipal Atlanta/Phoenix contexts, missing coordinates/parent routes and property-to-district associations remain explicit follow-ups. Do not reopen completed Phoenix routing/guided-search work without new evidence.
