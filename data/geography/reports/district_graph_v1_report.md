# District Graph V1 Report

Generated: 2026-05-21T00:00:00-07:00

District Graph V1 is a seed district-level commercial geography layer for Rofo. It is infrastructure only: no public pages were generated, no frontend templates were changed, and no records were marked public-ready.

## Outputs

- data/geography/district_nodes.json
- data/geography/district_relationships.json
- data/geography/district_aliases.json

## Scope

Initial focus areas include selected Bay Area and Atlanta commercial environments with meaningful editorial or corpus-adjacent support. Districts are modeled as commercial environment nodes, not arbitrary polygons or residential neighborhood lists.

## Counts

- Districts created: 15
- Relationships created: 17
- Alias records created: 15

Confidence distribution:

- high: 7
- low: 3
- medium: 5

Validation distribution:

- reviewed_editorial_seed: 7
- needs_district_corpus_review: 3
- editorial_seed_needs_corpus_review: 3
- needs_district_segmentation: 2

Relationship type distribution:

- commercial_comparison: 10
- nearby_alternative: 4
- complementary_environment: 1
- urban_vs_suburban: 2

## Strongest Flagship Candidates

- Downtown Palo Alto
- Downtown Oakland
- Uptown Oakland
- Buckhead
- Midtown Atlanta
- Downtown Atlanta
- Perimeter Center

The strongest public integration candidates remain Downtown Oakland, Uptown Oakland, Downtown Palo Alto, and the reviewed Atlanta pilot districts. These have district-level editorial interpretation rather than only city-level proximity.

## Weakest / Needs-Review Districts

- SoMa
- Mission Bay
- Financial District SF
- Jack London Square
- South San Francisco Biotech Corridor
- Sunnyvale Core
- Mountain View Tech Corridor
- Cumberland/Galleria

These should remain internal until district corpus extraction, representative example review, and editorial validation are complete. SoMa and Mission Bay are important but too broad or reference-level in current data. South San Francisco Biotech Corridor has strong strategic potential, but should be validated as an east-of-101 ecosystem district rather than broad city copy.

## Evidence Limits

- City-level Geography Graph relationships were not promoted directly into district truth.
- Representative buildings remain presentation examples, not intelligence sources.
- No rent, vacancy, current availability, inventory depth, ranking, or market-strength claims were added.
- Districts with weak evidence are marked with lower confidence and review-oriented validation status.

## Recommended Next Public Integration Candidates

1. Downtown Oakland
2. Uptown Oakland
3. Downtown Palo Alto
4. Buckhead
5. Midtown Atlanta
6. Downtown Atlanta
7. Perimeter Center

Cumberland/Galleria, Jack London Square, SoMa, Mission Bay, South San Francisco Biotech Corridor, Sunnyvale Core, and Mountain View Tech Corridor should remain in editorial/corpus review before public promotion.

## Recommended Next Infrastructure Step

Create a district relationship validation pass that checks each district relationship against raw corpus assignment, map hero availability, representative example diversity, and editorial readiness. The next pass should add review fields such as corpus_support_status, map_support_status, representative_example_status, and public_integration_recommendation without changing public templates.
