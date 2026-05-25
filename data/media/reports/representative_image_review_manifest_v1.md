# Representative Image Review Manifest V1

This is an internal editorial prioritization layer for reviewing representative district imagery. It does not publish images, create galleries, upload to R2, resize, optimize, transform, delete, or suppress source media.

## Source Of Truth

- Complete district media join: `data/media/generated/district_media_join_v3.json`
- Original image lookup: `data/media/generated/original_image_index_v1/original_images_by_building_id.json`
- This manifest only orders small review sets for humans.

## District Review Tiers

| District | Buildings | Covered buildings | Images | Priority | Secondary | Long-tail buildings |
| --- | --- | --- | --- | --- | --- | --- |
| Downtown Oakland | 1,045 | 6 | 12 | 8 | 7 | 0 |
| Uptown Oakland | 974 | 7 | 12 | 8 | 9 | 0 |
| Jack London Square | 150 | 0 | 0 | 8 | 2 | 0 |
| Financial District SF | 378 | 11 | 17 | 8 | 12 | 0 |
| SoMa | 1,045 | 22 | 52 | 8 | 16 | 15 |
| Mission Bay | 211 | 2 | 6 | 8 | 4 | 0 |
| Downtown Palo Alto | 106 | 1 | 1 | 8 | 2 | 0 |
| Mountain View Tech Corridor | 506 | 18 | 51 | 8 | 16 | 3 |
| South SF Biotech Corridor | 599 | 0 | 0 | 8 | 2 | 0 |
| Emeryville | 367 | 0 | 0 | 0 | 0 | 0 |
| West Oakland Industrial Corridor | 804 | 3 | 5 | 3 | 0 | 0 |

## Guardrails

- Heuristics prioritize review order only; they do not eliminate images.
- Image count is an internal coverage signal, not public copy.
- Human review is required before any accepted representative image export.
- Historical media does not imply current availability or listing status.

## Verification

- `node --check scripts/media/build_representative_image_review_manifest_v1.js`
- `node scripts/media/build_representative_image_review_manifest_v1.js`

