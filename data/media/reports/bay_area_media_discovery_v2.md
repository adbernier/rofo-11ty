# Bay Area Media Discovery V2

This is a read-only discovery workflow for connecting recovered Rofo building media to broader Bay Area commercial district candidates. It does not publish imagery, upload to R2, optimize files, create thumbnails, generate galleries, or modify production media.

## Workflow

media filename -> building_id -> canonical building record -> city/state -> Bay Area district/corridor candidate -> representative-image candidate

## V1 Production Baseline

- V1 EC2 scan processed 3,322,483 media files.
- V1 confirmed 337,050 original building images.
- V1 confirmed 175,670 distinct building IDs with original images.
- V1 representative pilot checked 80 target building IDs, matched 10 building IDs, and found 83 media files.

## Scan Status

| Metric | Value |
| --- | --- |
| Media root | /ebs2/rofo/content/buildings5 |
| Exists | True |
| Is directory | True |
| Scanned files | 3,322,483 |
| Parsed media filenames | 3,322,483 |
| Matched target media files | 1,323 |
| Matched target building IDs | 177 |
| Unmatched media building IDs | 300,003 |
| Canonical non-target media building IDs | 435,032 |

## District Media Coverage

| District | Candidate buildings | Media-matched buildings | Media assets | Original assets | Under-covered |
| --- | --- | --- | --- | --- | --- |
| Downtown Oakland | 1,045 | 23 | 134 | 12 | no |
| Uptown Oakland | 974 | 17 | 126 | 12 | no |
| Jack London Square | 150 | 7 | 30 | 0 | no |
| Financial District SF | 378 | 32 | 220 | 17 | no |
| SoMa | 1,045 | 43 | 374 | 52 | no |
| Mission Bay | 211 | 4 | 36 | 6 | no |
| Downtown Palo Alto | 106 | 2 | 13 | 1 | no |
| Mountain View Tech Corridor | 506 | 25 | 250 | 51 | no |
| South SF Biotech Corridor | 599 | 1 | 9 | 0 | no |
| Emeryville | 367 | 7 | 20 | 0 | no |
| West Oakland Industrial Corridor | 804 | 16 | 111 | 5 | no |

## Strongest Visual Coverage Candidates

| District | Media-matched buildings | Original assets | Candidate buildings |
| --- | --- | --- | --- |
| SoMa | 43 | 52 | 1,045 |
| Financial District SF | 32 | 17 | 378 |
| Mountain View Tech Corridor | 25 | 51 | 506 |
| Downtown Oakland | 23 | 12 | 1,045 |
| Uptown Oakland | 17 | 12 | 974 |
| West Oakland Industrial Corridor | 16 | 5 | 804 |
| Emeryville | 7 | 0 | 367 |
| Jack London Square | 7 | 0 | 150 |

## Interpretation

Districts with stronger media-matched building counts should move first into human visual review. Districts with candidate building depth but low media coverage should remain in discovery until additional media sources or assignment rules are reviewed.

## Guardrails

- Media coverage is not a public inventory metric.
- Representative imagery remains a reviewed presentation layer, not the intelligence source.
- Historical media does not imply current availability, rents, vacancy, ownership, or listing status.
- `representative_image_score_placeholder` is internal prioritization only and must not appear publicly.

## Next Step

Run V2 on EC2, review the strongest district/building image clusters, then create a human visual QA queue for candidate originals before any R2 migration or public image integration.

Command:

```bash
/usr/bin/python scripts/media/bay_area_media_discovery_v2.py
```
