# Neighborhood Expansion Candidates V2

Date: 2026-05-13

## Summary

This pass created the next research-only neighborhood and commercial area expansion set for Rofo. No pages were generated, no templates were changed, and no sitemap behavior was modified.

Outputs:

- `data/peter/research/neighborhood_expansion_candidates_v2.json`
- `data/peter/research/neighborhood_expansion_batch2.json`

The scoring approach uses resolved legacy neighborhood candidates, existing commercial area entities, current public neighborhood pages, city/building density signals, legacy commercial ecosystem scoring, and prior launch-review building support where available.

## Candidate Review

- Candidate records reviewed: 5,408
- Markets represented in full candidate set: 1,009
- Existing live neighborhood/commercial area pages excluded: 53

Recommended status counts:

| Status | Count |
| --- | ---: |
| launch | 425 |
| review | 2,070 |
| hold | 2,371 |
| suppress | 542 |

## First Batch Recommendation

`neighborhood_expansion_batch2.json` contains 150 recommended additional pages.

- Batch size: 150
- Markets represented: 60
- Candidates with representative or nearby building support: 50
- Candidates without representative building support: 100

This follows the product direction that a real, recognizable, commercially meaningful area can still be useful before representative building examples are fully attached.

Top batch markets by count:

| Market | Count |
| --- | ---: |
| Oakland, CA | 10 |
| San Francisco, CA | 10 |
| San Diego, CA | 10 |
| Austin, TX | 10 |
| Denver, CO | 10 |
| Gilbert, AZ | 8 |
| Albuquerque, NM | 7 |
| Phoenix, AZ | 6 |
| Chicago, IL | 4 |
| New York, NY | 4 |
| Scottsdale, AZ | 3 |
| Detroit, MI | 3 |
| Mobile, AL | 3 |
| Wilmington, NC | 3 |
| Las Vegas, NV | 3 |
| Columbus, OH | 3 |

## Area Type Mix

Full candidate set:

| Area Type | Count |
| --- | ---: |
| neighborhood | 3,702 |
| commercial_area | 1,481 |
| commercial_property_cluster | 225 |

Batch 2:

| Area Type | Count |
| --- | ---: |
| commercial_area | 132 |
| neighborhood | 18 |

Property-like names such as office parks, business centers, medical centers, plazas, and shopping centers were not allowed into `launch` automatically. They were capped at `review` because they may be real commercial places but need human confirmation before public rollout.

## Scoring Inputs

Signals used:

- Resolved city/state and canonical path
- Active `allowed` flag from the legacy neighborhood source
- Valid centroid
- Geometry quality
- Commercial keywords in neighborhood name
- Commercial context in legacy description
- Current city page presence
- Current Rofo city building density
- Legacy commercial ecosystem strength
- Suggested ecosystem priority
- Representative building counts from prior launch-review data when available
- Nearby area candidates from centroid proximity

Representative buildings were treated as a positive signal, not a hard requirement.

## Naming Concerns

The broader source data includes several labels that are not necessarily public-ready neighborhood names:

- Office parks
- Business centers
- Industrial parks
- Medical centers
- Shopping centers
- Plazas
- Generic duplicate names such as `Downtown`
- Occasional typo-like names

Controls added in this candidate set:

- Malformed or typo-like names are suppressed.
- Property-like names are held for review.
- Possible duplicate names are held for review.
- Current live neighborhood paths are excluded.

## Risks and Thin Page Concerns

Main risks before implementation:

- Many batch candidates do not yet have representative building cards.
- Some legacy descriptions are old and should not be reused verbatim.
- Some candidates may be commercially meaningful but more like office parks or retail centers than neighborhoods.
- Centroids are approximate and should not be treated as polygon boundaries.
- Nearby area links can be useful, but should remain conservative until true adjacency is reviewed.

## Recommended Rollout Size

Recommended next implementation batch:

- 50 to 75 pages for the first expansion beyond the current 53.
- Prioritize the strongest 25 to 40 with representative building support.
- Add a second group of 25 to 35 no-building commercial geography pages only where names are clearly recognizable and market context is strong.

Do not launch all 150 at once without a template QA pass.

## Recommended Next Implementation Prompt

Suggested next task:

> Generate hidden/noindex review pages for the top 50 to 75 records in `data/peter/research/neighborhood_expansion_batch2.json`, using the existing neighborhood page system. Preserve existing URLs and layouts. Do not add sitemap entries yet. For candidates without representative buildings, use the lighter content path with overview, related space types, nearby areas, city market link, and lead CTA. Create a QA report before any public indexing.

## Notes

This is a research dataset only. It does not create public pages and should not be treated as a final launch allowlist without review.

