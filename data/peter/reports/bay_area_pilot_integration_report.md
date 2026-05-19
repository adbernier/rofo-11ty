# Bay Area Pilot Integration Report

Date: 2026-05-18

## Scope

Integrated the first limited Bay Area flagship pilot districts into the live neighborhood rendering system:

- Downtown Oakland
- Uptown Oakland
- Downtown Palo Alto

This is a controlled public pilot integration. No Bay Area-wide or nationwide neighborhood generation was added.

## Source Inputs Used

- `data/peter/reports/bay_area_pilot_refinement_review.md`
- `data/peter/bay-area/public/bay_area_pilot_district_intelligence.json`
- `data/peter/bay-area/public/bay_area_pilot_comparison_relationships.json`
- `data/peter/bay-area/reviews/bay_area_pilot_representative_approvals.json`
- `data/peter/bay-area/public/bay_area_pilot_visual_preparation.json`
- Current Atlanta/Buckhead neighborhood page architecture

Representative buildings remain presentation examples only. District intelligence is based on the broader raw-corpus and editorial workflow represented in the pilot artifacts.

## Integration Summary

### Editorial Intelligence

Added public editorial intelligence records for:

- `/commercial-real-estate/CA/oakland/downtown-oakland/`
- `/commercial-real-estate/CA/oakland/uptown-oakland/`
- `/commercial-real-estate/CA/palo-alto/downtown-palo-alto/`

Each record includes:

- restrained district positioning
- concise interpretation modules
- best-fit descriptors
- nearby alternatives

The neighborhood intelligence template now treats `status: "editorial"` records as the restrained editorial layout used by the Atlanta pilot, without exposing dashboard-style source or confidence language.

### District Entity Coverage

Downtown Oakland and Uptown Oakland already existed in the commercial area system and were refined through data overrides and attached intelligence.

Downtown Palo Alto was added as a curated commercial-area entity focused on the University Avenue, Hamilton Avenue, Lytton Avenue, and Caltrain-adjacent downtown office/retail context. It intentionally does not fold in California Avenue, Stanford Research Park, or broader Palo Alto office geographies.

### Nearby Comparisons

Downtown Oakland and Uptown Oakland now use curated nearby comparison cards with short interpretive notes.

Downtown Palo Alto includes editorial nearby alternatives inside the interpretation module. Linked nearby district cards were not forced because the strongest comparison districts, such as Mountain View / Castro-Whisman and Redwood City Downtown, are not part of this limited three-page launch set.

### Representative Buildings

Approved representative examples were integrated for the pilot pages:

- Downtown Oakland: 1333 Broadway, Oakland City Center, 300 Frank H Ogawa Plaza, 1440 Broadway
- Uptown Oakland: 1 Kaiser Plaza, 2101 Webster Street, 1970 Broadway, 415 20th Street
- Downtown Palo Alto: 530 Lytton Avenue, 228 Hamilton Avenue, 200-228 Hamilton Avenue, 400 Hamilton Avenue

These examples are used as architectural/commercial texture, not as the intelligence source.

### Map Hero Inputs

Added Bay Area pilot map hero inputs for:

- Downtown Oakland
- Uptown Oakland
- Downtown Palo Alto

The map treatment reuses the existing neighborhood map hero system and keeps the compact, abstract orientation-map pattern.

### Image Inputs

No new image assets were added. The existing optional neighborhood image system remains in place and renders nothing unless a matching asset exists at:

`assets/images/neighborhoods/{STATE}/{city-slug}/{neighborhood-slug}.webp`

## Files Changed

### Templates

- `_includes/partials/neighborhood/intelligence.njk`

### Data / Page Wiring

- `_data/neighborhoodIntelligence.js`
- `_data/neighborhoodMapHeroes.js`
- `_data/neighborhoodPages.js`
- `data/peter/research/commercial_area_entities_v1.json`

### Reports

- `data/peter/reports/bay_area_pilot_integration_report.md`

## Generated Pages Verified

- `_site/commercial-real-estate/CA/oakland/downtown-oakland/index.html`
- `_site/commercial-real-estate/CA/oakland/uptown-oakland/index.html`
- `_site/commercial-real-estate/CA/palo-alto/downtown-palo-alto/index.html`

## Verification

Ran:

`npm run build`

Result:

- Build succeeded.
- Eleventy wrote 12,333 files.
- Pilot pages render with editorial intelligence, representative building cards, map heroes, and availability report CTA/form.
- Oakland comparison links resolve to generated pages.
- Lead form backend path and protections are preserved, including hidden routing fields, honeypot field, `form_start_time`, required phone field, timing field, and human checkbox.
- Mobile behavior remains tied to the existing responsive neighborhood layout and card CSS; no new layout system was introduced.

## Launch Readiness Notes

Downtown Oakland and Uptown Oakland are ready for limited pilot review as a differentiated pair: Downtown reads as the formal institutional office core, while Uptown reads as the mixed-use Broadway/Lake Merritt-adjacent counterpart.

Downtown Palo Alto is ready for limited pilot review as a curated standalone commercial district, but nearby linked comparison pages should be added later for Mountain View / Castro-Whisman, Redwood City Downtown, and California Avenue if the Bay Area cluster expands.

No frontend redesign, dashboard/scoring UI, lead-flow change, or mass public rollout was introduced.
