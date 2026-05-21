# Bay Area Flagship District Expansion V1

Generated: 2026-05-21

This controlled rollout expands the Bay Area commercial district system without generating new pages or exposing graph internals. It uses the existing `commercialDistrictPublicIntegrations.js` configuration layer and the existing `nearby-commercial-districts.njk` component.

## Reviewed Inputs

- District Graph V1
- Bay Area Commercial Geography Expansion Plan V1
- Flagship Market Review V1
- District terminology alignment guidance
- Existing neighborhood intelligence records
- Existing public neighborhood page inventory

## Rollout Decisions

| Candidate | Decision | Reason |
| --- | --- | --- |
| Financial District SF | ready_for_public_integration | Existing public page, existing intelligence record, strong representative building support, clear CBD identity, meaningful cross-bay relationship to Downtown Oakland |
| Jack London Square | ready_for_public_integration | Existing public page, map support, clear Oakland waterfront/adaptive-commercial role, meaningful relationships to Downtown Oakland and Uptown Oakland |
| Redwood City Downtown / Office Cluster | needs_more_evidence | No current public district page in the neighborhood pipeline; needs curated district entity and raw corpus assignment |
| Mountain View Tech Corridor | needs_editorial_refinement | Needs segmentation between downtown Mountain View, Castro-Whisman, Whisman/R&D, and North Bayshore before public integration |
| South San Francisco Biotech Corridor | needs_more_evidence | No current public district page; needs raw corpus validation and district entity creation |
| SoMa | needs_editorial_refinement | Existing page but current evidence remains too broad; needs segmentation before flagship integration |
| Mission Bay | needs_more_evidence | Existing page but current district intelligence is not yet strong enough for flagship integration |
| Emeryville Biotech / Creative Corridor | needs_more_evidence | Strategically important, but public district entity and representative depth need review |
| West Oakland Industrial Corridor | needs_more_evidence | Existing West Oakland page is not yet sufficient for corridor-level public claims |

## Districts Integrated

### Financial District SF

Integration added:

- SoMa
- Jackson Square
- Downtown Oakland

Editorial role:

Financial District SF is treated as a traditional San Francisco business district: formal downtown office core, client-facing business presence, transit access, professional services, finance/legal context, and cross-bay comparison value.

Safeguards:

- No rent, vacancy, ranking, inventory, or score language.
- SoMa is described as a broader mixed-use district, not as a validated single flagship district.
- Downtown Oakland is used as a cross-bay business district comparison, not as a ranked alternative.

### Jack London Square

Integration added:

- Downtown Oakland
- Uptown Oakland
- Old Oakland

Editorial role:

Jack London Square is treated as a waterfront Oakland commercial district with service-commercial, adaptive, warehouse-adjacent, food, visitor-facing, and downtown-adjacent context.

Safeguards:

- Adaptive and industrial signals are framed as texture, not inventory coverage.
- The page does not claim lab, logistics, rent, vacancy, or current availability patterns.
- West Oakland is not promoted in the block yet because its corridor evidence remains weaker.

## Editorial Refinements Added

- Financial District SF was upgraded from a prototype-style intelligence record to a reviewed editorial `How to read` record.
- Jack London Square received a restrained editorial intelligence record focused on district identity, built form, access pattern, and tenant orientation.
- Nearby comparison lists remain suppressed in `How to read` when a page has the dedicated Nearby Commercial Districts block.

## New Nearby Commercial District Relationships

| Source district | Related district | Public rationale |
| --- | --- | --- |
| Financial District SF | SoMa | Broader mixed-use commercial district south of Market Street |
| Financial District SF | Jackson Square | Smaller-scale boutique commercial setting near the downtown core |
| Financial District SF | Downtown Oakland | East Bay business district with civic adjacency and BART access |
| Jack London Square | Downtown Oakland | More civic, institutional, and transit-focused business district |
| Jack London Square | Uptown Oakland | More mixed-use, arts-adjacent, and Lake Merritt-oriented district |
| Jack London Square | Old Oakland | Smaller-scale historic commercial blocks north of the waterfront |

## Rollout Safeguards

- No new pages were generated.
- No compare pages were created.
- No graph internals, confidence labels, rankings, or scores are exposed.
- Only pages with explicit path-keyed configuration render the Nearby Commercial Districts block.
- Candidate districts without public pages were deferred.
- Candidate districts with weak segmentation were deferred.
- Existing lead flow, CTA behavior, and spam protections were not changed.

## Recommended Next Bay Area Cluster

Next controlled cluster:

1. Redwood City Downtown / Office Cluster
2. Mountain View Tech Corridor
3. South San Francisco Biotech Corridor

Required before integration:

- create or validate district entities
- assign raw corpus support
- review representative building depth
- prepare map/image requirements
- add reviewed editorial intelligence
- avoid publishing until comparison relationships are defensible

## Summary

This pass deepens the Bay Area system by adding two coherent commercial districts to the controlled public integration layer: Financial District SF and Jack London Square. It strengthens the already-public Oakland and Downtown Palo Alto system indirectly while avoiding premature rollout of districts that still need corpus validation or segmentation.
