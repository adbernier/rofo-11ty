# Bay Area Tier A Raw Corpus Extraction Report

Date: 2026-05-18

## Purpose

This report extends the Atlanta raw-corpus intelligence workflow to the Bay Area Tier A rollout cluster. It uses broader raw Rofo building and listing rows for district validation, signal extraction, diversity review, and editorial readiness.

Published representative buildings are treated only as page presentation examples. They are not the source of truth for district intelligence.

## Source Files

- data/peter/raw/rofo_buildings.csv
- data/peter/raw/rofo_listings.csv
- data/peter/raw/rofo_users.csv
- data/peter/raw/rofo_broker_houses.csv
- data/peter/raw/rofo_relationships_listing_buildings.csv
- data/peter/derived/raw_listing_descriptions_sample.csv

## Assignment Method

- Use raw Rofo building and listing rows, not published representative buildings, as the intelligence source.
- Assign only to reviewed Bay Area Tier A district candidates.
- Use explicit district or alias text in building metadata as high confidence.
- Otherwise assign buildings by nearest reviewed centroid within conservative radius and same city.
- Treat assignments as internal working sets, not polygon boundaries or current availability.

Assignments are approximate internal working sets. They are not polygon boundaries, live inventory, or current availability.

## Relevant City Corpus

| City | Raw buildings | Raw listing count from building rows |
| --- | ---: | ---: |
| Alameda | 1369 | 656 |
| Berkeley | 3191 | 1375 |
| Brisbane | 200 | 243 |
| Burlingame | 1140 | 772 |
| Emeryville | 367 | 757 |
| Foster City | 207 | 388 |
| Menlo Park | 927 | 662 |
| Mountain View | 670 | 2182 |
| Oakland | 10844 | 6302 |
| Palo Alto | 829 | 1287 |
| Redwood City | 2224 | 1570 |
| San Francisco | 27835 | 14336 |
| San Jose | 3760 | 13257 |
| San Mateo | 2123 | 1970 |
| South San Francisco | 1485 | 1022 |
| Sunnyvale | 814 | 2055 |

## District Candidate Counts

| District | Raw buildings | Listing rows | High confidence | Medium confidence | Companies | Contacts | Broker houses | Top spaces | Top sources | Published reps | Readiness |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Downtown Oakland | 804 | 1725 | 702 | 102 | 1 | 107 | 0 | office 1514, retail 155, land 32, industrial 21 | LMS 1720, USR 5 | 6 | strong raw support; source-concentration review required |
| Uptown Oakland | 1093 | 1252 | 461 | 632 | 1 | 102 | 0 | office 1036, retail 111, industrial 58, land 34 | LMS 1245, USR 7 | 6 | strong raw support; source-concentration review required |
| Jack London Square | 404 | 589 | 276 | 128 | 1 | 83 | 0 | office 513, retail 40, industrial 31, other/unknown 3 | LMS 589 | 2 | strong raw support; source-concentration review required |
| Downtown Palo Alto | 135 | 373 | 125 | 10 | 0 | 81 | 0 | office 327, retail 39, industrial 4, other/unknown 3 | LMS 373 | 0 | strong raw support; source-concentration review required |
| Mountain View / Castro-Whisman | 469 | 1616 | 282 | 187 | 1 | 195 | 0 | office 1099, retail 328, industrial 160, land 22 | LMS 1616 | 0 | strong raw support; source-concentration review required |
| Redwood City Downtown | 939 | 451 | 498 | 441 | 1 | 96 | 0 | office 351, retail 46, industrial 38, other/unknown 11 | LMS 451 | 0 | strong raw support; source-concentration review required |
| Downtown San Mateo / Hayward Park | 1439 | 1483 | 706 | 733 | 1 | 165 | 0 | office 1302, retail 129, other/unknown 26, industrial 23 | LMS 1478, USR 5 | 0 | strong raw support; source-concentration review required |
| South San Francisco Biotech Corridor | 1298 | 936 | 923 | 375 | 1 | 98 | 0 | office 519, industrial 364, retail 28, land 11 | LMS 936 | 0 | strong raw support; source-concentration review required |
| Emeryville / Powell Corridor | 342 | 737 | 177 | 165 | 1 | 93 | 0 | office 594, industrial 87, retail 50, other/unknown 5 | LMS 735, USR 2 | 0 | strong raw support; source-concentration review required |

## District Notes

### Downtown Oakland

- Commercial identity: Institutional downtown core and BART-oriented professional office district.
- Nearby comparison set: Uptown Oakland; Jack London Square; Old Oakland; Lake Merritt; San Francisco Financial District
- Raw support: 804 buildings, 1725 listing rows.
- Assignment confidence: 702 high, 102 medium.
- Diversity/provenance: 1 companies, 107 listing contacts, 0 broker houses, 1 portfolio/feed groups.
- Top space types: office 1514, retail 155, land 32, industrial 21, other/unknown 3.
- Top sources: LMS 1720, USR 5.
- Top companies/provenance: Seagate Properties 13.
- Representative diversity from raw buildings: unknown 638, office 121, retail 40, industrial 2, land 2, other/unknown 1.
- Published representative comparison: 6 display examples. Published representative buildings are display examples and are not the intelligence source of truth.
- Internal pattern signals:
  - Office-oriented: high. Office rows represent 88% of decoded historical listings.
  - Broad raw-corpus support: high. 804 raw buildings and 1725 historical listing rows assigned to the approximate district.
- Data gaps / concentration risks:
  - Top listing source LMS represents 99.7% of listing rows.
  - Low identifiable company/provenance coverage at 0.8%.
- Top raw building candidates:
  - 1333 Broadway: 106 listing rows, office, high, 0.067 km from centroid.
  - 505 14th St: 106 listing rows, office, high, 0.154 km from centroid.
  - Downtown Oakland: 99 listing rows, office, high.
  - 1000 Broadway: 68 listing rows, office, high, 0.32 km from centroid.
  - 1611 Telegraph Ave: 58 listing rows, office, high, 0.223 km from centroid.

### Uptown Oakland

- Commercial identity: Mixed-use creative-commercial office district with BART access and smaller-company fit.
- Nearby comparison set: Downtown Oakland; Temescal; Lake Merritt; Jack London Square; Berkeley
- Raw support: 1093 buildings, 1252 listing rows.
- Assignment confidence: 461 high, 632 medium.
- Diversity/provenance: 1 companies, 102 listing contacts, 0 broker houses, 1 portfolio/feed groups.
- Top space types: office 1036, retail 111, industrial 58, land 34, other/unknown 13.
- Top sources: LMS 1245, USR 7.
- Top companies/provenance: Seagate Properties 8.
- Representative diversity from raw buildings: unknown 934, office 78, retail 41, industrial 21, other/unknown 11, land 8.
- Published representative comparison: 6 display examples. Published representative buildings are display examples and are not the intelligence source of truth.
- Internal pattern signals:
  - Office-oriented: high. Office rows represent 83% of decoded historical listings.
  - Broad raw-corpus support: high. 1093 raw buildings and 1252 historical listing rows assigned to the approximate district.
- Data gaps / concentration risks:
  - Top listing source LMS represents 99.4% of listing rows.
  - Low identifiable company/provenance coverage at 0.6%.
  - Most assignments are centroid/radius-based medium confidence.
- Top raw building candidates:
  - Lake Merritt Plaza: 213 listing rows, office, high, 0.427 km from centroid.
  - 1814 Franklin St: 84 listing rows, office, high, 0.413 km from centroid.
  - Plaza 360: 81 listing rows, office, high, 0.248 km from centroid.
  - Wells Fargo Bank Center: 74 listing rows, office, high, 0.494 km from centroid.
  - Kaiser Center: 70 listing rows, retail, high, 0.393 km from centroid.

### Jack London Square

- Commercial identity: Waterfront mixed-use office, retail, service-commercial, and warehouse-adjacent district.
- Nearby comparison set: Downtown Oakland; Old Oakland; West Oakland; Uptown Oakland; Alameda
- Raw support: 404 buildings, 589 listing rows.
- Assignment confidence: 276 high, 128 medium.
- Diversity/provenance: 1 companies, 83 listing contacts, 0 broker houses, 0 portfolio/feed groups.
- Top space types: office 513, retail 40, industrial 31, other/unknown 3, land 2.
- Top sources: LMS 589.
- Top companies/provenance: Seagate Properties 1.
- Representative diversity from raw buildings: unknown 307, office 56, industrial 25, retail 12, land 2, other/unknown 2.
- Published representative comparison: 2 display examples. Published representative buildings are display examples and are not the intelligence source of truth.
- Internal pattern signals:
  - Office-oriented: high. Office rows represent 87% of decoded historical listings.
  - Broad raw-corpus support: high. 404 raw buildings and 589 historical listing rows assigned to the approximate district.
- Data gaps / concentration risks:
  - Top listing source LMS represents 100% of listing rows.
  - Low identifiable company/provenance coverage at 0.2%.
- Top raw building candidates:
  - 160 Franklin St: 154 listing rows, office, high, 0.116 km from centroid.
  - Jack London Park: 42 listing rows, office, high.
  - 111 Myrtle: 32 listing rows, office, medium, 0.942 km from centroid.
  - 424 3rd St: 31 listing rows, office, high, 0.17 km from centroid.
  - Embarcadero West: 26 listing rows, office, medium, 1.031 km from centroid.

### Downtown Palo Alto

- Commercial identity: Premium Peninsula downtown office, startup, professional services, and retail-adjacent workspace.
- Nearby comparison set: Mountain View / Castro-Whisman; Redwood City Downtown; Menlo Park; California Avenue
- Raw support: 135 buildings, 373 listing rows.
- Assignment confidence: 125 high, 10 medium.
- Diversity/provenance: 0 companies, 81 listing contacts, 0 broker houses, 1 portfolio/feed groups.
- Top space types: office 327, retail 39, industrial 4, other/unknown 3.
- Top sources: LMS 373.
- Top companies/provenance: none.
- Representative diversity from raw buildings: office 88, unknown 28, retail 13, industrial 3, other/unknown 3.
- Published representative comparison: 0 display examples. No published neighborhood page exists yet.
- Internal pattern signals:
  - Office-oriented: high. Office rows represent 88% of decoded historical listings.
  - Broad raw-corpus support: high. 135 raw buildings and 373 historical listing rows assigned to the approximate district.
- Data gaps / concentration risks:
  - Top listing source LMS represents 100% of listing rows.
  - Low identifiable company/provenance coverage at 0%.
- Top raw building candidates:
  - Town & Country Village: 37 listing rows, office, medium, 0.846 km from centroid.
  - Downtown Lytton Avenue: 33 listing rows, office, high.
  - Hamilton Avenue: 28 listing rows, office, high.
  - 550 Hamilton Ave: 24 listing rows, office, high, 0.436 km from centroid.
  - Palo Alto Office Center: 23 listing rows, office, high, 0.388 km from centroid.

### Mountain View / Castro-Whisman

- Commercial identity: Silicon Valley startup/transit corridor with downtown retail and Whisman/R&D adjacency.
- Nearby comparison set: Downtown Palo Alto; Sunnyvale; North San Jose; Redwood City Downtown
- Raw support: 469 buildings, 1616 listing rows.
- Assignment confidence: 282 high, 187 medium.
- Diversity/provenance: 1 companies, 195 listing contacts, 0 broker houses, 1 portfolio/feed groups.
- Top space types: office 1099, retail 328, industrial 160, land 22, other/unknown 7.
- Top sources: LMS 1616.
- Top companies/provenance: Seagate Properties 1.
- Representative diversity from raw buildings: office 247, unknown 97, retail 62, industrial 53, land 5, other/unknown 5.
- Published representative comparison: 0 display examples. No published neighborhood page exists yet.
- Internal pattern signals:
  - Office-oriented: high. Office rows represent 68% of decoded historical listings.
  - Retail context: medium. Retail rows represent 20% of decoded historical listings.
  - Broad raw-corpus support: high. 469 raw buildings and 1616 historical listing rows assigned to the approximate district.
- Data gaps / concentration risks:
  - Top listing source LMS represents 100% of listing rows.
  - Low identifiable company/provenance coverage at 0.1%.
- Top raw building candidates:
  - 2235-2239 Old Middlefield Way: 119 listing rows, retail, high.
  - Mountain View Bus Ctr: 115 listing rows, office, medium, 1.86 km from centroid.
  - Office Space for lease at The Vineyards: 39 listing rows, office, high.
  - 709 N Shoreline Blvd: 37 listing rows, office, high, 1.142 km from centroid.
  - Downtown Mountain View Center: 32 listing rows, office, high.

### Redwood City Downtown

- Commercial identity: Mid-Peninsula downtown, civic, Caltrain, entertainment-retail, and professional office district.
- Nearby comparison set: Downtown Palo Alto; Downtown San Mateo / Hayward Park; Menlo Park; South San Francisco Biotech Corridor
- Raw support: 939 buildings, 451 listing rows.
- Assignment confidence: 498 high, 441 medium.
- Diversity/provenance: 1 companies, 96 listing contacts, 0 broker houses, 0 portfolio/feed groups.
- Top space types: office 351, retail 46, industrial 38, other/unknown 11, land 5.
- Top sources: LMS 451.
- Top companies/provenance: Seagate Properties 5.
- Representative diversity from raw buildings: unknown 797, office 90, retail 29, industrial 12, other/unknown 7, land 4.
- Published representative comparison: 0 display examples. No published neighborhood page exists yet.
- Internal pattern signals:
  - Office-oriented: high. Office rows represent 78% of decoded historical listings.
  - Broad raw-corpus support: high. 939 raw buildings and 451 historical listing rows assigned to the approximate district.
- Data gaps / concentration risks:
  - Top listing source LMS represents 100% of listing rows.
  - Low identifiable company/provenance coverage at 1.1%.
- Top raw building candidates:
  - Bayport Marina Plaza: 45 listing rows, office, medium, 1.376 km from centroid.
  - 629 Bair Island Rd: 29 listing rows, industrial, medium, 1.288 km from centroid.
  - 399 Bradford St: 20 listing rows, office, high, 0.297 km from centroid.
  - 626 Jefferson Ave: 20 listing rows, office, high, 0.376 km from centroid.
  - 801 Brewster Ave: 16 listing rows, office, high, 0.295 km from centroid.

### Downtown San Mateo / Hayward Park

- Commercial identity: Peninsula professional services, medical-adjacent office, Caltrain downtown, and freeway-access corridor office.
- Nearby comparison set: Redwood City Downtown; Downtown Palo Alto; Foster City; Burlingame
- Raw support: 1439 buildings, 1483 listing rows.
- Assignment confidence: 706 high, 733 medium.
- Diversity/provenance: 1 companies, 165 listing contacts, 0 broker houses, 1 portfolio/feed groups.
- Top space types: office 1302, retail 129, other/unknown 26, industrial 23, land 2, flex 1.
- Top sources: LMS 1478, USR 5.
- Top companies/provenance: Seagate Properties 6.
- Representative diversity from raw buildings: unknown 1215, office 144, retail 38, other/unknown 25, industrial 15, flex 1.
- Published representative comparison: 0 display examples. No published neighborhood page exists yet.
- Internal pattern signals:
  - Office-oriented: high. Office rows represent 88% of decoded historical listings.
  - Broad raw-corpus support: high. 1439 raw buildings and 1483 historical listing rows assigned to the approximate district.
- Data gaps / concentration risks:
  - Top listing source LMS represents 99.7% of listing rows.
  - Low identifiable company/provenance coverage at 0.4%.
  - Most assignments are centroid/radius-based medium confidence.
- Top raw building candidates:
  - San Mateo - Bayshore Corporate Center: 161 listing rows, office, high.
  - Bayshore Corporate Center: 64 listing rows, office, high.
  - The Atrium: 63 listing rows, office, medium, 1.717 km from centroid.
  - San Mateo Bay Center: 59 listing rows, office, medium, 2.144 km from centroid.
  - City Plaza: 57 listing rows, office, high, 1.035 km from centroid.

### South San Francisco Biotech Corridor

- Commercial identity: Life science, lab, flex, industrial, and airport/101-adjacent innovation district.
- Nearby comparison set: Mission Bay; Redwood City Downtown; Oyster Point; Brisbane; Downtown Palo Alto
- Raw support: 1298 buildings, 936 listing rows.
- Assignment confidence: 923 high, 375 medium.
- Diversity/provenance: 1 companies, 98 listing contacts, 0 broker houses, 0 portfolio/feed groups.
- Top space types: office 519, industrial 364, retail 28, land 11, flex 7, other/unknown 7.
- Top sources: LMS 936.
- Top companies/provenance: Seagate Properties 4.
- Representative diversity from raw buildings: unknown 1077, industrial 131, office 73, other/unknown 7, retail 7, land 3.
- Published representative comparison: 0 display examples. No published neighborhood page exists yet.
- Internal pattern signals:
  - Office-oriented: high. Office rows represent 55% of decoded historical listings.
  - Industrial/flex context: high. Industrial/flex rows represent 40% of decoded historical listings.
  - Broad raw-corpus support: high. 1298 raw buildings and 936 historical listing rows assigned to the approximate district.
- Data gaps / concentration risks:
  - Top listing source LMS represents 100% of listing rows.
  - Low identifiable company/provenance coverage at 0.4%.
- Top raw building candidates:
  - Oyster Point B.P. I: 60 listing rows, office, high.
  - The Gateway: 42 listing rows, office, high.
  - PS Business Park: 32 listing rows, office, high, 1.748 km from centroid.
  - 415 Grand Ave: 30 listing rows, office, high, 1.252 km from centroid.
  - PS Business Park: 25 listing rows, office, medium, 1.901 km from centroid.

### Emeryville / Powell Corridor

- Commercial identity: Bridge-access creative office, life science, retail, and compact East Bay business node.
- Nearby comparison set: Downtown Oakland; Berkeley; West Berkeley; Jack London Square; South San Francisco Biotech Corridor
- Raw support: 342 buildings, 737 listing rows.
- Assignment confidence: 177 high, 165 medium.
- Diversity/provenance: 1 companies, 93 listing contacts, 0 broker houses, 1 portfolio/feed groups.
- Top space types: office 594, industrial 87, retail 50, other/unknown 5, land 1.
- Top sources: LMS 735, USR 2.
- Top companies/provenance: Seagate Properties 2.
- Representative diversity from raw buildings: unknown 228, office 61, industrial 30, retail 17, other/unknown 5, land 1.
- Published representative comparison: 0 display examples. No published neighborhood page exists yet.
- Internal pattern signals:
  - Office-oriented: high. Office rows represent 81% of decoded historical listings.
  - Broad raw-corpus support: high. 342 raw buildings and 737 historical listing rows assigned to the approximate district.
- Data gaps / concentration risks:
  - Top listing source LMS represents 99.7% of listing rows.
  - Low identifiable company/provenance coverage at 0.3%.
- Top raw building candidates:
  - Emerybay Offices #A: 80 listing rows, office, high, 0.73 km from centroid.
  - Tower I Emeryville: 61 listing rows, office, high, 0.583 km from centroid.
  - Watergate Tower II: 40 listing rows, retail, high, 0.733 km from centroid.
  - Watergate Tower IV: 37 listing rows, office, high, 0.761 km from centroid.
  - 5858 Horton St: 35 listing rows, office, high, 0.308 km from centroid.

## Readiness Recommendations

- Ready for editorial interpretation after review: none.
- Strong raw support, source-concentration review required: Downtown Oakland, Uptown Oakland, Jack London Square, Downtown Palo Alto, Mountain View / Castro-Whisman, Redwood City Downtown, Downtown San Mateo / Hayward Park, South San Francisco Biotech Corridor, Emeryville / Powell Corridor.
- Strong raw support, boundary review required: none.
- Usable after manual boundary/building review: none.
- Thin or not ready without manual supplementation: none.

Recommended first editorial work: Downtown Oakland and Uptown Oakland, because they have public pages and strong raw assignment support. Downtown Palo Alto should follow if the raw candidate set is accepted after manual address review. South San Francisco Biotech Corridor and Jack London Square are commercially differentiated but need representative-building, boundary, and source-concentration review before public editorial claims are promoted.

## Data Quality Warnings

- Raw listing rows are historical activity signals, not current availability.
- Raw `rofo_listings.csv` does not include full listing descriptions. Rich text is available only from the sampled raw listing description extract in this repo.
- City and centroid assignment is approximate. It should guide editorial review, not replace boundary review.
- Source and company coverage may be incomplete because many rows originate from internal ingestion or historical feed records.
- Do not surface rent, suite-level, furnished, move-in-ready, or feed-source language publicly from this extraction.

