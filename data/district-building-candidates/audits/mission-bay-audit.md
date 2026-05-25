# Mission Bay District Coverage Audit

Generated: 2026-05-25T17:56:39.751Z

Internal diagnostic audit only. This report is not a publication queue, not a listings feed, and not a recommendation to imply current availability.

## 1. Raw Coverage Metrics

| Metric | Count / Status |
|---|---:|
| Raw building associations from district universe | 711 |
| Total raw records observed across joined sources | 1963 |
| Enriched raw listing records matched by address/path | 0 |
| Legacy CSV listing rows matched by building id | 1252 |
| Unique universe addresses | 662 |
| Unique enriched raw-listing addresses | 0 |
| Unique building candidates across joined sources | 662 |
| Existing public building pages | 6 |
| Current public representative buildings | 3 |
| Candidate file rows from prior pass | 25 |
| Strong public candidates from prior pass | 3 |
| Building/address records with any image signal | 10 |
| Universe buildings with original images | 11 |
| Original image count from universe | 33 |
| Review manifest buildings with originals | 2 |
| Review manifest original images | 6 |
| Enriched raw listing records with hero images | 0 |
| Curated exported district assets | 0 |
| Records with known PDFs | 0 |
| PDF source accessible in this workspace | no |
| Matched enriched records with descriptions | 0 |
| Universe records with lat/lng | 711 |
| Records with company/source metadata | 1252 |
| Unique source companies from enriched raw listings | 0 |

Description quality from enriched raw listings:

- Rich: 0
- Usable: 0
- Thin: 0
- Missing: 0

## 2. Quality / Structure Analysis

- Suite/listing duplication rate: 0% of matched enriched raw listing rows include a suite value.
- Duplicate address clustering: 0 address clusters have more than one enriched raw listing row; duplicate rows represent 0% of matched enriched listing records.
- Missing/thin description prevalence: 0% of matched enriched listing rows are missing or thin.
- Original image coverage: 1.5% of universe building associations have original-image coverage.
- Raw-listing hero image coverage: 0% of matched enriched listing rows have a hero image.

Top duplicate address clusters:


Top source layers:

- building_signals_metadata: 711
- lat_lng_proximity: 707
- bay_area_neighborhood_assignment: 211
- representative_building_seed: 10

Assignment distance buckets:

- under_0_5km: 113
- 0_5_to_1_0km: 253
- 1_0_to_1_5km: 345
- over_1_5km: 0
- missing: 0

Legacy CSV source distribution:

- LMS: 1251
- USR: 1

## 3. District Matching Analysis

Current matching works through these layers:

- commercial_area_building_relationships_v1 reviewed/approximate relationships
- district_building_universe_v1 broad internal associations
- bay_area_neighborhood_assignment and raw-corpus area assignment layers where available
- lat_lng_proximity to reviewed district centers
- building_signals metadata
- public building commercial_area assignment where available
- address/path joins into _data/raw-listings.json and _data/buildingPages.js

Likely false-positive risk: 707 universe associations include the proximity layer. These are useful for discovery but should not be treated as verified district membership.

Likely false-negative risks:

- The enriched raw listing JSON has no lat/lng fields, so district joining depends on address/path matches into the universe.
- The SoMa/Mission Bay split is sensitive around Townsend, South Park, China Basin, Showplace Square, and Potrero/Design District edges.
- Mission Bay institutional/life-science buildings may be underrepresented if they have limited historical listings, missing commercial-area metadata, or no listing-building relationship row.
- Older raw CSV sources include coordinates, but descriptions and public suitability signals live in separate exports and are not fully joined in public data.

## 4. Hidden / Underutilized Assets

Image-rich buildings with weak public/enriched metadata:

- 414 Brannan St: 4 original image(s), 6 historical listing signal(s), missing public/enriched description
- 640 Tennessee St: 3 original image(s), 1 historical listing signal(s), missing public/enriched description
- 535 Minnesota St: 3 original image(s), 1 historical listing signal(s), missing public/enriched description
- 210 King St: 3 original image(s), 2 historical listing signal(s), missing public/enriched description
- 689 3rd St: 3 original image(s), 9 historical listing signal(s), missing public/enriched description
- 699 2nd St: 3 original image(s), 17 historical listing signal(s), missing public/enriched description
- 525 6th St: 3 original image(s), 1 historical listing signal(s), missing public/enriched description
- 699 2nd St: 2 original image(s), 1 historical listing signal(s), missing public/enriched description

High-listing-activity buildings not currently strong public candidates:

- 330 Townsend St: 366 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 350 Rhode Island St: 65 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 185 Berry St: 60 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 332 Townsend St: 44 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 251 Rhode Island St: 37 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 250 King St: 35 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 118 King St: 31 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 640 2nd St: 30 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 650 Townsend St: 28 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 1800 Owens St: 26 historical listing signal(s), images: 0, layers: bay_area_neighborhood_assignment, representative_building_seed, lat_lng_proximity, building_signals_metadata

Representative-term matches from enriched listing text:

- None found in enriched listing text.

## 5. Candidate Funnel Analysis

- Universe buildings: 711
- Prior candidate rows selected: 25
- Universe-to-candidate-file selection rate: 3.5%
- Strong public candidates: 3
- Strong-candidate rate from universe: 0.4%
- Filtering interpretation: The current candidate process intentionally caps each district at 25 rows and requires reviewed/seeded district association before possible public recommendation. It also penalizes proximity-only associations and thin descriptions.
- Diagnosis: Mission Bay has materially smaller coverage than SoMa, but it is not empty. The weak public-candidate count appears to come from limited reviewed relationships, low image coverage, thin descriptions, and the fact that institutional/life-science identity is poorly captured by ordinary office listing rows.

## 6. AWS / Archive Dependency Assessment

- PDF manifest root: /ebs1/rofo/www/content/pdfs
- PDF manifest accessible locally: no
- The building/listing media roots referenced by existing reports are not fully accessible in this workspace.
- Existing reports state that original building imagery historically lived under `/ebs2/rofo/content/buildings5/orig` and PDFs under `/ebs1/rofo/www/content/pdfs`.
- Do not delete AWS volumes, snapshots, old media roots, SQL dumps, or listing/PDF directories until the inaccessible roots have been checked from the production/archive environment.
- Additional recovery/audit is warranted for PDFs, original listing media, and older building/image corpuses because local manifests are samples or stale mirrors rather than a complete live scan.

## 7. Diagnostic Conclusion

Mission Bay is genuinely smaller than SoMa in the current joined corpus, but the representative layer is still artificially shallow because life-science/institutional identity is not well represented by ordinary office listing rows, image coverage is low, and reviewed relationships are limited.

Recommended next audit action: manually review the high-listing and image-rich underutilized buildings before changing public representative buildings. Treat archive recovery as preservation due diligence, not as a publishing automation path.
