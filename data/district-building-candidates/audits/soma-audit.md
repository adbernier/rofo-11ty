# SoMa District Coverage Audit

Generated: 2026-05-25T17:56:39.750Z

Internal diagnostic audit only. This report is not a publication queue, not a listings feed, and not a recommendation to imply current availability.

## 1. Raw Coverage Metrics

| Metric | Count / Status |
|---|---:|
| Raw building associations from district universe | 4741 |
| Total raw records observed across joined sources | 12981 |
| Enriched raw listing records matched by address/path | 68 |
| Legacy CSV listing rows matched by building id | 8172 |
| Unique universe addresses | 4331 |
| Unique enriched raw-listing addresses | 7 |
| Unique building candidates across joined sources | 4331 |
| Existing public building pages | 42 |
| Current public representative buildings | 1 |
| Candidate file rows from prior pass | 25 |
| Strong public candidates from prior pass | 1 |
| Building/address records with any image signal | 83 |
| Universe buildings with original images | 85 |
| Original image count from universe | 180 |
| Review manifest buildings with originals | 22 |
| Review manifest original images | 52 |
| Enriched raw listing records with hero images | 0 |
| Curated exported district assets | 11 |
| Records with known PDFs | 0 |
| PDF source accessible in this workspace | no |
| Matched enriched records with descriptions | 68 |
| Universe records with lat/lng | 4741 |
| Records with company/source metadata | 8240 |
| Unique source companies from enriched raw listings | 1 |

Description quality from enriched raw listings:

- Rich: 68
- Usable: 0
- Thin: 0
- Missing: 0

## 2. Quality / Structure Analysis

- Suite/listing duplication rate: 100% of matched enriched raw listing rows include a suite value.
- Duplicate address clustering: 7 address clusters have more than one enriched raw listing row; duplicate rows represent 89.7% of matched enriched listing records.
- Missing/thin description prevalence: 0% of matched enriched listing rows are missing or thin.
- Original image coverage: 1.8% of universe building associations have original-image coverage.
- Raw-listing hero image coverage: 0% of matched enriched listing rows have a hero image.

Top duplicate address clusters:

- 201 mission st|san francisco|CA: 11 records
- 315 montgomery st|san francisco|CA: 11 records
- 50 california st|san francisco|CA: 11 records
- 505 montgomery st|san francisco|CA: 11 records
- 580 california st|san francisco|CA: 11 records
- 795 folsom st|san francisco|CA: 11 records
- 1390 market st|san francisco|CA: 2 records

Top source layers:

- lat_lng_proximity: 4741
- building_signals_metadata: 4741
- bay_area_neighborhood_assignment: 1045
- representative_building_seed: 20

Assignment distance buckets:

- under_0_5km: 936
- 0_5_to_1_0km: 997
- 1_0_to_1_5km: 1755
- over_1_5km: 1053
- missing: 0

Legacy CSV source distribution:

- LMS: 7993
- USR: 179

## 3. District Matching Analysis

Current matching works through these layers:

- commercial_area_building_relationships_v1 reviewed/approximate relationships
- district_building_universe_v1 broad internal associations
- bay_area_neighborhood_assignment and raw-corpus area assignment layers where available
- lat_lng_proximity to reviewed district centers
- building_signals metadata
- public building commercial_area assignment where available
- address/path joins into _data/raw-listings.json and _data/buildingPages.js

Likely false-positive risk: 4741 universe associations include the proximity layer. These are useful for discovery but should not be treated as verified district membership.

Likely false-negative risks:

- The enriched raw listing JSON has no lat/lng fields, so district joining depends on address/path matches into the universe.
- The SoMa/Mission Bay split is sensitive around Townsend, South Park, China Basin, Showplace Square, and Potrero/Design District edges.
- Mission Bay institutional/life-science buildings may be underrepresented if they have limited historical listings, missing commercial-area metadata, or no listing-building relationship row.
- Older raw CSV sources include coordinates, but descriptions and public suitability signals live in separate exports and are not fully joined in public data.

## 4. Hidden / Underutilized Assets

Image-rich buildings with weak public/enriched metadata:

- 145 9th St: 5 original image(s), 3 historical listing signal(s), missing public/enriched description
- 414 Brannan St: 4 original image(s), 6 historical listing signal(s), missing public/enriched description
- 609 Mission St: 4 original image(s), 1 historical listing signal(s), missing public/enriched description
- 1 Kearny St: 4 original image(s), 23 historical listing signal(s), missing public/enriched description
- 146 11th St: 4 original image(s), 2 historical listing signal(s), missing public/enriched description
- 60 Spear St: 4 original image(s), 5 historical listing signal(s), missing public/enriched description
- 699 2nd St: 3 original image(s), 17 historical listing signal(s), missing public/enriched description
- 156 2nd St: 3 original image(s), 65 historical listing signal(s), missing public/enriched description
- 144 2nd St: 3 original image(s), 66 historical listing signal(s), missing public/enriched description
- 370 4th St: 3 original image(s), 1 historical listing signal(s), missing public/enriched description
- 355 Bryant St: 3 original image(s), 2 historical listing signal(s), missing public/enriched description
- 689 3rd St: 3 original image(s), 9 historical listing signal(s), missing public/enriched description

High-listing-activity buildings not currently strong public candidates:

- 330 Townsend St: 366 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 490 Post St: 317 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 1 Embarcadero Ctr: 92 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 44 Montgomery St: 91 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 50 California St: 90 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 235 Montgomery St: 85 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 101 California St: 80 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 1 Market St: 76 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 535 Mission St: 75 historical listing signal(s), images: 0, layers: lat_lng_proximity, building_signals_metadata
- 144 2nd St: 66 historical listing signal(s), images: 3, layers: bay_area_neighborhood_assignment, representative_building_seed, lat_lng_proximity, building_signals_metadata

Representative-term matches from enriched listing text:

- 315 Montgomery St: 11 record(s), term: tech, description: rich, hero image: no
- 795 Folsom St: 11 record(s), term: tech, description: rich, hero image: no
- 201 Mission St: 10 record(s), term: tech, description: rich, hero image: no
- 50 California St: 10 record(s), term: tech, description: rich, hero image: no
- 505 Montgomery St: 10 record(s), term: tech, description: rich, hero image: no
- 580 California St: 10 record(s), term: tech, description: rich, hero image: no
- 1390 Market St: 2 record(s), term: creative, description: rich, hero image: no

## 5. Candidate Funnel Analysis

- Universe buildings: 4741
- Prior candidate rows selected: 25
- Universe-to-candidate-file selection rate: 0.5%
- Strong public candidates: 1
- Strong-candidate rate from universe: 0%
- Filtering interpretation: The current candidate process intentionally caps each district at 25 rows and requires reviewed/seeded district association before possible public recommendation. It also penalizes proximity-only associations and thin descriptions.
- Diagnosis: SoMa is not truly shallow in the raw corpus. It has very large broad coverage, but most records are proximity-based, suite/listing-heavy, thinly described, or lack reviewed representative-role assignment. The one strong public candidate reflects conservative filtering and weak reviewed relationship depth, not lack of raw building associations.

## 6. AWS / Archive Dependency Assessment

- PDF manifest root: /ebs1/rofo/www/content/pdfs
- PDF manifest accessible locally: no
- The building/listing media roots referenced by existing reports are not fully accessible in this workspace.
- Existing reports state that original building imagery historically lived under `/ebs2/rofo/content/buildings5/orig` and PDFs under `/ebs1/rofo/www/content/pdfs`.
- Do not delete AWS volumes, snapshots, old media roots, SQL dumps, or listing/PDF directories until the inaccessible roots have been checked from the production/archive environment.
- Additional recovery/audit is warranted for PDFs, original listing media, and older building/image corpuses because local manifests are samples or stale mirrors rather than a complete live scan.

## 7. Diagnostic Conclusion

SoMa appears artificially shallow at the representative-candidate layer. The raw building universe is broad, but a large share of records are proximity-discovered, suite/listing-heavy, thinly described, or not reviewed into district-form roles.

Recommended next audit action: manually review the high-listing and image-rich underutilized buildings before changing public representative buildings. Treat archive recovery as preservation due diligence, not as a publishing automation path.
