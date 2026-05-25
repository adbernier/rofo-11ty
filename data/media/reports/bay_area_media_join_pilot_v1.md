# Bay Area Media Join Pilot V1

This pilot creates the first visual relationship layer between recovered Rofo building media and canonical Bay Area commercial districts. It is infrastructure-only and does not publish imagery, optimize assets, upload to R2, or modify production media.

## Join Workflow

1. Parse recovered media filenames using `{building_id}_{hash}.{ext}`.
2. Join `building_id` to canonical building records in `data/peter/derived/building_signals.csv`.
3. Join canonical buildings to Bay Area district candidates using `data/peter/derived/bay_area_representative_buildings.csv` and assignment metadata.
4. Produce district media manifests and representative-image review queues.

## Media Input Status

| Input | Status | Records |
| --- | --- | --- |
| data/media/generated/buildings5_sample_manifest.json | placeholder_or_unscanned_sample_manifest | 0 |
| data/media/generated/media_corpus_inventory_v1_summary.json | available |  |

The current repo only contains the local placeholder/sample media inventory, so no actual recovered image assets were matched in this run. The join workflow is ready for the EC2 media inventory output or a full building-media manifest.

## District Coverage

| District | Candidate buildings | Representative candidates | Media-matched buildings | Observed assets | Status |
| --- | --- | --- | --- | --- | --- |
| Downtown Oakland | 242 | 10 | 0 | 0 | no_matches_in_available_manifest |
| Uptown Oakland | 10 | 10 | 0 | 0 | no_matches_in_available_manifest |
| Jack London Square | 150 | 10 | 0 | 0 | no_matches_in_available_manifest |
| Financial District SF | 274 | 10 | 0 | 0 | no_matches_in_available_manifest |
| Downtown Palo Alto | 10 | 10 | 0 | 0 | no_matches_in_available_manifest |
| Mission Bay | 58 | 10 | 0 | 0 | no_matches_in_available_manifest |
| SoMa | 207 | 10 | 0 | 0 | no_matches_in_available_manifest |
| South San Francisco Biotech Corridor | 10 | 10 | 0 | 0 | no_matches_in_available_manifest |

## Representative Image Candidate Logic

- High-confidence district assignments and historical activity provide candidate priority.
- Actual media matches are required before an image can move into visual QA.
- `orig` assets should be preferred as preservation sources.
- Derivatives can help identify legacy display behavior, but should not be treated as preservation masters.
- All public image use remains blocked until human review confirms image quality, relevance, and rights/appropriateness.

## Unmatched Media

Unmatched or out-of-scope media records in this run: 0.

## Strategic Assessment

The Bay Area district-to-building layer is strong enough to support a media join pilot for the target districts. The limiting factor is not district assignment data; it is the absence of a full recovered-media manifest in the local repo. Once the EC2 inventory output is copied back, this workflow can identify which flagship commercial districts have enough visual coverage for representative environment review.

## Next Step

Run the Python media inventory on the EC2 instance with a full or district-targeted manifest export, copy the output into `data/media/generated/`, then rerun this join pilot. The next version should add image-quality sampling and Media-to-Building Join V2 review statuses.

## Outputs

- `data/media/generated/bay_area_district_media/_manifest.json`
- `data/media/generated/bay_area_district_media/{district}.json`
- `data/media/generated/bay_area_district_media/representative_image_candidates.json`
- `data/media/generated/bay_area_district_media/unmatched_media_report.json`
- `data/media/generated/bay_area_district_media/bay_area_media_coverage_summary.json`
