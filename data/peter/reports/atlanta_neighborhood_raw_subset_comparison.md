# Atlanta Neighborhood Raw Subset Comparison

Date: 2026-05-15

## Purpose

This report compares the existing published representative-building approach with a broader raw Atlanta building and listing subset for neighborhood intelligence extraction.

The goal is to reduce feed-source bias before promoting neighborhood intelligence signals to public pages.

## Source Files

- data/peter/raw/rofo_buildings.csv
- data/peter/raw/rofo_listings.csv
- data/peter/derived/raw_listing_descriptions_sample.csv
- data/peter/research/priority_market_commercial_area_entities_v1.json

## Assignment Method

- Assign to reviewed Atlanta commercial areas only.
- Use explicit area name or alias in building text as high confidence.
- Otherwise assign by nearest reviewed centroid within conservative radius.
- Do not use assignments as polygon boundaries.

Assignments are approximate and intended for internal signal analysis only. They are not polygon boundaries.

## Area Summary

| Area | Raw buildings | Raw listings | High-confidence assignments | Top space types | Top sources | Published representative buildings |
| --- | ---: | ---: | ---: | --- | --- | ---: |
| Downtown Atlanta | 181 | 1215 | 120 | office 906, retail 199, industrial 48, land 34 | LMS 1214, USR 1 | 2 |
| Midtown | 170 | 879 | 136 | office 569, retail 238, land 44, other/unknown 19 | LMS 879 | 6 |
| Buckhead | 260 | 1329 | 159 | office 1134, retail 81, land 60, other/unknown 45 | LMS 1329 | 6 |
| Perimeter Center | 288 | 1683 | 199 | office 1555, retail 87, other/unknown 31, industrial 8 | LMS 1679, USR 4 | 6 |
| West Midtown | 233 | 736 | 105 | office 423, industrial 215, retail 80, other/unknown 18 | LMS 736 | 2 |

## Published Representative Buildings vs Broader Raw Subset

### Downtown Atlanta

- Published representative buildings: 2
- Published page signals: Office, Retail, Downtown, Transit-oriented, Professional services
- Raw subset buildings: 181
- Raw subset listings: 1215
- Raw top space types: office (906), retail (199), industrial (48), land (34), other/unknown (26)
- Raw top sources: LMS (1214), USR (1)
- Source-bias notes:
  - Top source "LMS" represents 100% of listing rows.
  - Low source diversity. Treat extracted signals as internal review only.

### Midtown

- Published representative buildings: 6
- Published page signals: Office, Retail, Mixed use, Transit-oriented, Creative office
- Raw subset buildings: 170
- Raw subset listings: 879
- Raw top space types: office (569), retail (238), land (44), other/unknown (19), industrial (9)
- Raw top sources: LMS (879)
- Source-bias notes:
  - Top source "LMS" represents 100% of listing rows.
  - Low source diversity. Treat extracted signals as internal review only.

### Buckhead

- Published representative buildings: 6
- Published page signals: Office, Retail, financial services, Professional services, Mixed use
- Raw subset buildings: 260
- Raw subset listings: 1329
- Raw top space types: office (1134), retail (81), land (60), other/unknown (45), industrial (9)
- Raw top sources: LMS (1329)
- Source-bias notes:
  - Top source "LMS" represents 100% of listing rows.
  - Low source diversity. Treat extracted signals as internal review only.

### Perimeter Center

- Published representative buildings: 6
- Published page signals: Office, Suburban office, Retail, freeway access
- Raw subset buildings: 288
- Raw subset listings: 1683
- Raw top space types: office (1555), retail (87), other/unknown (31), industrial (8), land (2)
- Raw top sources: LMS (1679), USR (4)
- Source-bias notes:
  - Top source "LMS" represents 100% of listing rows.
  - Low source diversity. Treat extracted signals as internal review only.

### West Midtown

- Published representative buildings: 2
- Published page signals: Creative office, Industrial, Retail, Mixed use, Showroom
- Raw subset buildings: 233
- Raw subset listings: 736
- Raw top space types: office (423), industrial (215), retail (80), other/unknown (18)
- Raw top sources: LMS (736)
- Source-bias notes:
  - Top source "LMS" represents 100% of listing rows.
  - Low source diversity. Treat extracted signals as internal review only.

## Stronger Signals From Raw Subset

These are internal extraction signals from the broader raw subset. They are stronger than representative-building-only signals, but they still need source-bias review before public use.

### Downtown Atlanta

- Office-oriented: high. Office rows represent 75% of decoded historical listings.
- Retail context: medium. Retail rows represent 16% of decoded historical listings.

### Midtown

- Office-oriented: high. Office rows represent 65% of decoded historical listings.
- Retail context: medium. Retail rows represent 27% of decoded historical listings.

### Buckhead

- Office-oriented: high. Office rows represent 85% of decoded historical listings.

### Perimeter Center

- Office-oriented: high. Office rows represent 92% of decoded historical listings.

### West Midtown

- Office-oriented: medium. Office rows represent 57% of decoded historical listings.
- Industrial/flex context: high. Industrial/flex rows represent 29% of decoded historical listings.

## Internal Only Signals

These signals may be useful for analyst review but should not be shown publicly without manual review:

- broad_raw_support: Downtown Atlanta (high: 181 raw buildings and 1215 historical listing rows in the approximate area.), Midtown (high: 170 raw buildings and 879 historical listing rows in the approximate area.), Buckhead (high: 260 raw buildings and 1329 historical listing rows in the approximate area.), Perimeter Center (high: 288 raw buildings and 1683 historical listing rows in the approximate area.), West Midtown (high: 233 raw buildings and 736 historical listing rows in the approximate area.)
- source_bias_risk: Downtown Atlanta (high: Top source "LMS" represents 100% of listing rows.), Midtown (high: Top source "LMS" represents 100% of listing rows.), Buckhead (high: Top source "LMS" represents 100% of listing rows.), Perimeter Center (high: Top source "LMS" represents 100% of listing rows.), West Midtown (high: Top source "LMS" represents 100% of listing rows.)

## Data Quality Warnings

- Raw `rofo_listings.csv` does not include full listing descriptions. Rich text is available only from the sampled raw listing description extract in this repo.
- Coordinate assignment is approximate and should not be treated as neighborhood boundary logic.
- Source concentration can materially distort neighborhood identity. Executive suite feeds can overstate coworking, furnished, and small-office signals.
- Rent fields are retained in the internal subset for analysis only and should not be surfaced publicly.
- Listing rows are historical activity signals, not current availability.

## Recommended Approach Going Forward

1. Use broader raw building/listing subsets for extraction, not only published representative buildings.
2. Keep representative buildings as display examples, not the only signal source.
3. Score source diversity before promoting any public neighborhood signal.
4. Keep address-fallback or centroid-only assignments internal until reviewed.
5. Promote only durable, public-safe signals such as office orientation, retail context, industrial/flex context, freeway access, professional services, and creative office.
6. Suppress furnished, plug-and-play, current parking, move-in-ready, rent, and suite-specific language.

