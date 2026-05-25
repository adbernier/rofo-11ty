# Representative Imagery Review Workflow V1

This workflow creates an internal editorial review layer for representative Bay Area commercial district imagery. It does not publish images, create galleries, upload to R2, optimize files, modify production assets, or auto-select final imagery.

## Source

- Input directory: `data/media/generated/bay_area_media_discovery_v2`
- Source workflow: Bay Area Media Discovery V2
- V2 scanned files in available manifest: 3,322,483
- V2 matched target media files in available manifest: 1,323

## Review Workflow

district -> matched media candidates -> representative-image candidate scoring -> editorial review queue

## District Review Coverage

| District | Buildings | Media-matched buildings | Image candidates | Original candidates | Review queue |
| --- | --- | --- | --- | --- | --- |
| Financial District SF | 378 | 32 | 220 | 17 | 229 |
| Downtown Oakland | 500 | 23 | 134 | 12 | 143 |
| Uptown Oakland | 500 | 17 | 126 | 12 | 136 |
| Jack London Square | 150 | 7 | 30 | 0 | 38 |
| SoMa | 500 | 43 | 374 | 52 | 391 |
| Mission Bay | 211 | 4 | 36 | 6 | 45 |
| Downtown Palo Alto | 106 | 2 | 13 | 1 | 22 |
| South San Francisco Biotech Corridor | 500 | 1 | 9 | 0 | 19 |

## Heuristics

- Prefer `orig` assets for review because they are closest to the preservation source.
- Treat standard/thumb/smthumb derivatives as lower-priority unless they are the only available evidence.
- Flag buildings with many matched assets for duplicate/redundant image review.
- Use building name, address, district, derivative type, image count, assignment confidence, and historical activity only as review prioritization signals.
- `representative_score_placeholder` is internal sorting scaffolding, not a quality claim.

## Guardrails

- Representative imagery is a presentation layer, not the source of district intelligence.
- Do not use media counts as public coverage or inventory metrics.
- Do not infer current availability, rent, vacancy, ownership, or listing status from historical images.
- Human editorial review is required before any image moves toward public use.

## Outputs

- `data/media/generated/representative_imagery_review/_manifest.json`
- `data/media/generated/representative_imagery_review/{district}.json`
- `data/media/generated/representative_imagery_review/all_review_candidates.json`
- `data/media/generated/representative_imagery_review/district_visual_coverage_summary.json`

