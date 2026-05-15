# Atlanta Diversity Review

Date: 2026-05-15

## Purpose

This report reviews Atlanta neighborhood lineage diversity before expanding confidence-aware neighborhood intelligence extraction.

Lineage rows are historical internal signals, not live inventory or current availability.

LMS is treated as Rofo's internal ingestion system. It is not treated as a single external market data source and does not by itself reduce diversity or confidence scores.

## Neighborhood Metrics

| Neighborhood | Rows | Buildings | Origin companies | Contacts | Top space types | Top provenance entity | Coworking % | Diversity | Concentration |
| --- | ---: | ---: | ---: | ---: | --- | --- | ---: | ---: | ---: |
| Buckhead | 1174 | 216 | 10 | 93 | office 979, retail 81, land 60, other/unknown 45 | coworking_operator 8.4% | 8.4% | 64 | 20 |
| Downtown Atlanta | 955 | 136 | 11 | 73 | office 660, retail 186, industrial 48, land 34 | coworking_operator 6.8% | 6.8% | 69 | 17 |
| Midtown | 751 | 128 | 8 | 72 | office 534, retail 145, land 44, other/unknown 19 | coworking_operator 16.5% | 16.5% | 69 | 23 |
| Perimeter Center | 1441 | 238 | 8 | 115 | office 1315, retail 85, other/unknown 31, industrial 8 | coworking_operator 17% | 17% | 58 | 27 |
| West Midtown | 654 | 170 | 10 | 78 | office 341, industrial 215, retail 80, other/unknown 18 | Cartel Properties Marketing 3.8% | 0% | 75 | 11 |

## Strongest Neighborhood Diversity

- West Midtown: diversity score 75, 170 buildings, 10 identifiable originating companies, top space types office 341, industrial 215, retail 80, other/unknown 18.
- Downtown Atlanta: diversity score 69, 136 buildings, 11 identifiable originating companies, top space types office 660, retail 186, industrial 48, land 34.
- Midtown: diversity score 69, 128 buildings, 8 identifiable originating companies, top space types office 534, retail 145, land 44, other/unknown 19.
- Buckhead: diversity score 64, 216 buildings, 10 identifiable originating companies, top space types office 979, retail 81, land 60, other/unknown 45.
- Perimeter Center: diversity score 58, 238 buildings, 8 identifiable originating companies, top space types office 1315, retail 85, other/unknown 31, industrial 8.

## Heavily Concentrated Neighborhoods

- Perimeter Center: concentration score 27. Key warnings: Originating company coverage is low at 21.3% of lineage rows. True provenance entity coverage is low at 21.3% of lineage rows.
- Midtown: concentration score 23. Key warnings: none
- Buckhead: concentration score 20. Key warnings: Originating company coverage is low at 15.9% of lineage rows. True provenance entity coverage is low at 15.9% of lineage rows.
- Downtown Atlanta: concentration score 17. Key warnings: Originating company coverage is low at 21.5% of lineage rows. True provenance entity coverage is low at 21.5% of lineage rows.
- West Midtown: concentration score 11. Key warnings: Originating company coverage is low at 10.7% of lineage rows. True provenance entity coverage is low at 10.7% of lineage rows.

## Coworking-Heavy Areas

- Perimeter Center: 17% coworking/operator rows.
- Midtown: 16.5% coworking/operator rows.

## Broad Market Representation

- Perimeter Center: broad building coverage with 238 unique buildings and 1441 lineage rows. Still review true provenance coverage and concentration before public use.
- Buckhead: broad building coverage with 216 unique buildings and 1174 lineage rows. Still review true provenance coverage and concentration before public use.
- West Midtown: broad building coverage with 170 unique buildings and 654 lineage rows. Still review true provenance coverage and concentration before public use.

## Warnings

- LMS concentration is no longer treated as source concentration. It is a neutral Rofo ingestion-origin field.
- True provenance diversity is measured from origin companies, contacts, broker/portfolio groups, non-LMS feed groups, and provenance entity rollups.
- Company and brokerage fields depend on relationship/user/broker-house joins and are incomplete for many historical listing rows.
- Rent fields remain internal only and should not be used in public neighborhood intelligence.
- Centroid-based neighborhood assignment is useful for research but not a boundary-quality geography model.

## Recommended Next Intelligence Steps

1. Use lineage diversity thresholds before publishing neighborhood-level signals.
2. Treat Office, Retail, and Industrial/Flex patterns as candidates only when they have broad building support and acceptable concentration scores.
3. Keep source-bias, coworking/operator, price, and move-in-ready language internal.
4. Add richer raw listing description coverage for Atlanta before extracting building-character or tenant-fit semantics.
5. Review Buckhead, Midtown, Downtown Atlanta, Perimeter Center, and West Midtown manually before any public chip changes.

