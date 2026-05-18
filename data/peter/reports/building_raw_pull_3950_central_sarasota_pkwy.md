# Raw Pull: 3950 Central Sarasota Pkwy, Sarasota, FL

Date: 2026-05-12

Scope: focused read-only pull from Peter/raw Rofo datasets for `3950 Central Sarasota Pkwy`, Sarasota, FL. This report is for building-page enrichment review only and should not be treated as live inventory.

## Sources Checked

- `data/peter/raw/rofo_buildings.csv`
- `data/peter/raw/rofo_listings.csv`
- `data/peter/raw/rofo_relationships_listing_buildings.csv`
- `data/peter/raw/rofo_users.csv`
- `data/peter/research/legacy_space_type_code_lookup.json`
- `~/rofo-raw-inspection/listings_v01a/listings_v01a.sql`
- Existing ecosystem review files under `data/peter/prototypes/`, `data/peter/research/`, and `data/peter/normalized/`

Search variants included:

- `3950 Central Sarasota Pkwy`
- `3950 Central Sarasota Parkway`
- `Central Sarasota Pkwy`
- `Central Sarasota Parkway`
- `Sarasota FL`

## Matched Building Record

One direct building match was found in `data/peter/raw/rofo_buildings.csv`.

| Field | Value |
| --- | --- |
| building_id | `170784` |
| name | `PRIME RETAIL / OFFICE SPACE IN SARASOTA` |
| address | `3950 Central Sarasota Pkwy` |
| city/state/zip | Sarasota, FL 34238 |
| county | Sarasota |
| metro | North Port-Bradenton-Sarasota, FL |
| lat/lng | `27.22481918`, `-82.49011230` |
| building_size | `0` |
| floors / units | `0` / `0` |
| min_size / max_size | `1059` / `10727` |
| broker_house_id | `0` |
| listing_count | `179` |
| has_association | `1` |
| redirect_id | `170784` |
| updated_at | `2020-09-03 06:52:31` |

The current public batch file also includes this address:

- `data/peter/normalized/ecosystem_building_public_batch1.json`
- Canonical path: `/commercial-real-estate/building/FL/sarasota/3950-central-sarasota-pkwy/`
- Public batch mix: `retail`, count `179`

## Related Listing Summary

The relationship table and cleaned listing export both show 179 related listing rows for building ID `170784`.

| Metric | Value |
| --- | --- |
| relationship rows | 179 |
| unique listing IDs | 179 |
| cleaned listing rows | 179 |
| raw SQL listing rows | 179 |
| source | `LMS` for all 179 |
| Catylist flag in raw SQL | `1` for all sampled rich rows |
| legacy space_type | `2` for all 179 |
| decoded public-safe category | `retail` |
| listing_type | 178 `LEASE`, 1 `SALE` |
| lease_type | 178 code `1`, 1 code `0` |
| status codes | 155 code `2`, 24 code `0` |
| price basis in cleaned CSV | 178 `sqft` / `NNN`, 1 `total` / `UNKN` |
| square-footage range in cleaned CSV | 1,055 SF to 14,009 SF |
| cleaned created_at range | 2011-04-18 to 2015-04-04 |
| cleaned updated_at range | 2012-06-20 to 2016-06-06 |

Broker/contact user IDs tied to the relationship rows:

| user_id | name | email | phone | role |
| --- | --- | --- | --- | --- |
| `27907` | Deborah Anglin | `debbie@ian-black.com` | `9415392812` | broker |
| `45909` | Melissa Harris | `melissa@ian-black.com` | `9415390720` | broker |
| `60069` | Michele Fuller | `michele@ian-black.com` | `9412284189` | broker |

No broker house was attached on the building row (`broker_house_id = 0`).

## Raw Description Coverage

The raw listing SQL dump contains richer text that is not present in `rofo_listings.csv`.

| Raw SQL field coverage | Count |
| --- | ---: |
| raw listing rows for building | 179 |
| non-empty `l_description` | 167 |
| `l_description` longer than 100 chars | 156 |
| non-empty `l_promo_details` | 0 |

Detected semantic signal summary from the existing deterministic raw-listing signal detector:

| Signal | Count |
| --- | ---: |
| `retail_storefront` | 174 |

No durable office-specific signal was detected by the current keyword rules, but the title and richer description repeatedly use `retail / office` language.

## Representative Titles and Descriptions

Most raw listing titles repeat:

- `PRIME RETAIL / OFFICE SPACE IN SARASOTA`

One related sale record appears as:

- `PRESCHOOL FOR SALE WITH REAL ESTATE`

Representative raw text excerpts:

| listing_id | suite | sqft | excerpt |
| --- | --- | ---: | --- |
| `548805` | `4/5/6/7` | 10,727 | `OAKS PLAZA - Prime retail / office space available in this South Sarasota County shopping center - Units avaiable from 1,059 SF up to 15,000 +/- SF contiguous... anchored by Babies R Us and Kohl's... Located 1/2 miles south of Sarasota Square Mall, and adjacent to the Publix/Target Shopping Plaza` |
| `548804` | `4/5` | 3,742 | Same Oaks Plaza shopping-center copy, tied to a smaller suite grouping. |
| `548812` | `7A` | 3,700 | Same Oaks Plaza shopping-center copy, tied to suite `7A`. |
| `548811` | `11` | 1,059 | Same Oaks Plaza shopping-center copy, tied to suite `11`. |
| `131919` | `6` | 2,152 | `Formerly the Compound - space is ready for immediately occupancy` |
| `670332` | `3906` | 14,009 | `Former tanning salon` |
| `487442` | blank | 7,546 | `PRESCHOOL FOR SALE WITH REAL ESTATE` |

Common suite labels in the raw rows include `1`, `2`, `4`, `4/5`, `5`, `6`, `7`, `7A`, `9`, `10`, `11`, and `4/5/6/7`, plus several numeric labels in the `3880` to `3916` range.

## Space-Type Signal Summary

Public-safe findings:

- Strong historical retail signal: all 179 listing rows use legacy `space_type = 2`, decoded as `retail` with high confidence in `legacy_space_type_code_lookup.json`.
- Repeated shopping-center language appears in raw descriptions.
- Repeated title language includes `retail / office`, which supports a cautious secondary office-oriented signal, but this should be framed as historical marketing language rather than a confirmed building classification.
- The address appears to have been marketed as part of Oaks Plaza or a South Sarasota County shopping center context.

Do not expose:

- historical asking rent or NNN pricing
- suite-level availability
- individual suite numbers
- old anchor/co-tenant statements as current facts
- “available now,” “currently available,” or “move-in ready” language

## Stale and Marketing-Language Concerns

The raw content is useful for context but not safe to publish directly.

Concerns:

- The dominant title is promotional and all caps: `PRIME RETAIL / OFFICE SPACE IN SARASOTA`.
- Descriptions include stale availability language such as `space available` and `available from`.
- Descriptions include old pricing language such as `$15 PSF NNN`.
- Descriptions include old tenant and construction references.
- Some copy is suite-specific and should not be carried into a building-level page.
- One row references a preschool sale, which may be a one-off historical use and should not dominate public positioning.

## Public-Safe Insights

Safe building-page enrichment can be derived, but it should be restrained:

- This address has strong historical Rofo retail activity.
- Historical records repeatedly associate the address with shopping-center retail and some office-oriented marketing language.
- The strongest public-safe label is `Retail`.
- A secondary phrase such as `retail and office-oriented commercial space` may be acceptable if clearly framed as historical context.
- The page should use the address-first title: `3950 Central Sarasota Pkwy`.

Suggested public-safe copy:

> 3950 Central Sarasota Pkwy is part of the Sarasota commercial real estate market, with historical Rofo signals tied primarily to retail use and some retail/office marketing context.

Alternative shorter copy:

> Rofo has historical commercial activity for this Sarasota address, with prior signals related primarily to retail use.

Suggested chips:

- Retail
- Shopping center context
- Sarasota commercial corridor

Avoid chips unless reviewed:

- Office
- Preschool
- Available space
- NNN
- Specific suite sizes

## Recommendation for the Live Building Page

The live page should not reuse the raw listing descriptions verbatim. The best improvement is to enrich the canonical building experience with a short, historical commercial profile:

- Use `3950 Central Sarasota Pkwy` as the visible title.
- Replace generic filler with one or two sentences about historical retail activity in Sarasota.
- Mention the retail/office language only cautiously, for example `retail and office-oriented marketing context`.
- Keep the standard Rofo lead form and building-page structure.
- Link to the Sarasota city page and Sarasota market guide where available.
- Do not show old suites, pricing, tenant names, or availability claims.

Overall: this address is a good candidate for a public-safe building page, but only as a commercial geography and historical activity page, not as a listing or availability page.
