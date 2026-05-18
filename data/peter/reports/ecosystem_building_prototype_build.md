# Ecosystem Building Prototype Build

This report covers the hidden/noindex prototype building pages generated from `ecosystem_building_activation_review_batch1.json`.

## Build Summary

- Pages generated: 63
- Expected prototype records: 63
- Missing generated files: 0
- Pages with `noindex,follow`: 63
- Prototype URLs found in sitemap: 0
- Build command: `NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy`
- Build result: passed

## Markets Represented

| market | prototype_pages |
| --- | --- |
| Sarasota, FL | 7 |
| Pensacola, FL | 7 |
| Fort Wayne, IN | 7 |
| Grand Rapids, MI | 7 |
| Knoxville, TN | 7 |
| Chattanooga, TN | 7 |
| Baton Rouge, LA | 7 |
| Albuquerque, NM | 7 |
| Shreveport, LA | 7 |

## Sample URLs

- `/prototype/buildings/FL/sarasota/3950-central-sarasota-pkwy/`
- `/prototype/buildings/FL/sarasota/1991-main-st/`
- `/prototype/buildings/FL/sarasota/8586-potter-park-dr/`
- `/prototype/buildings/FL/sarasota/1900-main-st/`
- `/prototype/buildings/FL/sarasota/1445-2nd-st/`
- `/prototype/buildings/FL/sarasota/5500-bee-ridge-rd/`
- `/prototype/buildings/FL/sarasota/5940-mcintosh-rd/`
- `/prototype/buildings/FL/pensacola/1720-w-fairfield-dr/`
- `/prototype/buildings/FL/pensacola/7171-n-davis-hwy/`
- `/prototype/buildings/FL/pensacola/5113-n-davis-hwy/`
- `/prototype/buildings/FL/pensacola/7280-plantation-rd/`
- `/prototype/buildings/FL/pensacola/33-brent-ln/`
- `/prototype/buildings/FL/pensacola/3300-n-pace-blvd/`
- `/prototype/buildings/FL/pensacola/3902-n-9th-ave/`
- `/prototype/buildings/IN/fort-wayne/3402-n-anthony-blvd/`

## Noindex And Sitemap Checks

- `noindex,follow` present on 63 of 63 pages.
- Sitemap entries found for prototype building pages: 0.
- Navigation check: No source template or navigation file links to `/prototype/buildings/`; only prototype pages link to other prototype pages in the same review batch.

## Space-Type Mix In Prototype Pages

| space_type | historical_activity_count |
| --- | --- |
| office | 4459 |
| retail | 1611 |
| industrial | 585 |
| land | 24 |
| flex | 1 |

## Pages With Strongest Ecosystem Feel

| market | address | historical_activity | space_type_context | url |
| --- | --- | --- | --- | --- |
| Baton Rouge, LA | 301 Main St | 300 | office | /prototype/buildings/LA/baton-rouge/301-main-st/ |
| Albuquerque, NM | 8500 Menaul Blvd NE | 260 | office | /prototype/buildings/NM/albuquerque/8500-menaul-blvd-ne/ |
| Albuquerque, NM | 10500 Copper Ave NE | 205 | office, industrial, and land or development-oriented commercial | /prototype/buildings/NM/albuquerque/10500-copper-ave-ne/ |
| Albuquerque, NM | 6300 Montano Rd NW | 205 | office | /prototype/buildings/NM/albuquerque/6300-montano-rd-nw/ |
| Albuquerque, NM | 400 Gold Ave SW | 202 | office | /prototype/buildings/NM/albuquerque/400-gold-ave-sw/ |
| Albuquerque, NM | 5700 Harper Dr NE | 195 | office | /prototype/buildings/NM/albuquerque/5700-harper-dr-ne/ |
| Albuquerque, NM | 6600 Indian School Rd NE | 189 | retail | /prototype/buildings/NM/albuquerque/6600-indian-school-rd-ne/ |
| Baton Rouge, LA | 3677 Florida Blvd | 188 | office | /prototype/buildings/LA/baton-rouge/3677-florida-blvd/ |
| Baton Rouge, LA | 510 O'Neal Ln | 181 | office, retail, land or development-oriented commercial, flex, and industrial | /prototype/buildings/LA/baton-rouge/510-o-neal-ln/ |
| Sarasota, FL | 3950 Central Sarasota Pkwy | 179 | retail | /prototype/buildings/FL/sarasota/3950-central-sarasota-pkwy/ |
| Albuquerque, NM | 10601-10801 Lomas Blvd NE | 178 | office | /prototype/buildings/NM/albuquerque/10601-10801-lomas-blvd-ne/ |
| Pensacola, FL | 1720 W Fairfield Dr | 168 | office | /prototype/buildings/FL/pensacola/1720-w-fairfield-dr/ |

## Pages Needing Suppression Or Review

| market | address | reason | url |
| --- | --- | --- | --- |
| Sarasota, FL | 1445 2nd St | includes land/development-oriented historical signal | /prototype/buildings/FL/sarasota/1445-2nd-st/ |
| Sarasota, FL | 5940 McIntosh Rd | includes land/development-oriented historical signal | /prototype/buildings/FL/sarasota/5940-mcintosh-rd/ |
| Pensacola, FL | 7171 N Davis Hwy | includes land/development-oriented historical signal | /prototype/buildings/FL/pensacola/7171-n-davis-hwy/ |
| Baton Rouge, LA | 510 O'Neal Ln | includes land/development-oriented historical signal | /prototype/buildings/LA/baton-rouge/510-o-neal-ln/ |
| Baton Rouge, LA | 11616 Industriplex Blvd | includes land/development-oriented historical signal | /prototype/buildings/LA/baton-rouge/11616-industriplex-blvd/ |
| Albuquerque, NM | 10500 Copper Ave NE | includes land/development-oriented historical signal | /prototype/buildings/NM/albuquerque/10500-copper-ave-ne/ |
| Shreveport, LA | 2920 Knight St | lower historical activity than the rest of the batch | /prototype/buildings/LA/shreveport/2920-knight-st/ |
| Shreveport, LA | 1020 Shreveport Barksdale Hwy | lower historical activity than the rest of the batch | /prototype/buildings/LA/shreveport/1020-shreveport-barksdale-hwy/ |
| Shreveport, LA | 329 Texas St | lower historical activity than the rest of the batch | /prototype/buildings/LA/shreveport/329-texas-st/ |

## Stale-Language Risks

- No prohibited stale/listing phrases were found in generated prototype HTML for the checked terms.
- The template intentionally uses negative guardrail language such as `does not represent live inventory` and `Historical signals do not indicate current availability`.
- No pricing, suite-level details, or raw broker marketing copy from historical listings is included.

## Duplicate Risks

- All 63 source records were selected from candidates with `duplicate_risk = low`.
- Manual review should still check whether an existing Rofo production building page represents the same address under a different slug or building name.

## Recommended Next Review Process

1. Manually inspect the 12 strongest pages listed above.
2. Suppress or rewrite any page where the address is a land parcel, vague intersection, or non-building property.
3. Compare each reviewed address against current production building pages before promotion.
4. Promote only 20 to 30 reviewed candidates into a second hidden/noindex prototype batch with cleaner market-specific copy.
5. Do not index or sitemap any prototype building page until duplicate checks and address verification are complete.
