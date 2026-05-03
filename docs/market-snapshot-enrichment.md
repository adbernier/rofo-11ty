---
permalink: false
---

# Market Snapshot Enrichment Workflow

Market snapshot enrichment powers:

- city page Office Market Snapshot cards
- expanded city Market Guide snapshot sections

The editable source file is:

`_data/raw/market-snapshots.csv`

The generated data file is:

`_data/marketSnapshots.generated.js`

The public Eleventy data module remains:

`_data/marketSnapshots.js`

## CSV Columns

Required:

- `state`: uppercase state abbreviation, for example `CA`
- `city_slug`: lowercase city slug, for example `san-francisco`
- `snapshot_title`: visible snapshot title, usually `Office Market Snapshot`

Snapshot fields:

- `average_rent`
- `average_rent_direction`: `up`, `down`, `flat`, or blank
- `average_rent_label`
- `availability_rate`
- `availability_direction`: `up`, `down`, `flat`, or blank
- `availability_label`
- `market_trend`
- `market_trend_direction`: `up`, `down`, `flat`, or blank
- `market_trend_label`
- `notable_areas`: pipe-separated, for example `Downtown|SoMa|Mission Bay`
- `notable_areas_label`
- `summary`
- `rent_note`
- `availability_note`
- `tenant_takeaway`

Draft-only review fields:

- `enrichment_tier`: `tier_1`, `tier_2`, or `tier_3`
- `approved`: set to `TRUE` only after human review when a row is ready to promote

## Example Row

```csv
state,city_slug,snapshot_title,average_rent,average_rent_direction,average_rent_label,availability_rate,availability_direction,availability_label,market_trend,market_trend_direction,market_trend_label,notable_areas,notable_areas_label,summary,rent_note,availability_note,tenant_takeaway
"CA","san-francisco","Office Market Snapshot","$65–$85/SF/YR","down","Typical office asking rent","Elevated supply","up","Tenant-favorable availability","Tenant-favorable market","flat","More options and negotiating flexibility","Financial District|SoMa|Mission Bay|Jackson Square","Common tenant search areas","San Francisco remains one of the Bay Area's most important office, retail, and innovation markets.","Office rents vary significantly by building class, neighborhood, size, and lease structure.","Availability remains elevated compared with pre-2020 levels.","Tenants should compare neighborhoods carefully and pay close attention to total occupancy cost."
```

## Add a City

1. Add one row to `_data/raw/market-snapshots.csv`.
2. Use the key convention implied by `state` and `city_slug`: `STATE/city-slug`.
3. Include at least two snapshot values among:
   - `average_rent`
   - `availability_rate`
   - `market_trend`
   - `notable_areas`
4. Keep rent language cautious. Prefer ranges such as `$40–$55/SF/YR` over overly precise figures unless there is a clear source.
5. Use direction values only when they are supportable: `up`, `down`, `flat`, or blank.

## Drafting Rows in Batches

Use the draft workflow when preparing multiple city rows for human review.

Input file:

`_data/raw/market-snapshot-draft-cities.csv`

Columns:

- `state`
- `city_slug`
- `city_name`

Example:

```csv
state,city_slug,city_name
AZ,phoenix,Phoenix
CA,san-diego,San Diego
```

Run:

```bash
npm run draft:market-snapshots
```

The draft script writes:

`_data/raw/market-snapshots.draft.csv`

Important behavior:

- Draft rows are not published.
- Draft rows are never appended to `_data/raw/market-snapshots.csv` automatically.
- Existing production keys are skipped and reported as warnings.
- Human review is required before any row moves into production.

## Drafting All Eligible Cities

To create review-only draft rows for every city that does not already have production enrichment, run:

```bash
npm run draft:market-snapshots:all
```

All-cities mode:

- reads `_data/cities.generated.json`
- skips cities already present in `_data/raw/market-snapshots.csv`
- uses existing building addresses when available to derive cautious location fragments
- writes only `_data/raw/market-snapshots.draft.csv`
- never appends to production automatically

The draft output includes `enrichment_tier` and `approved`.

Tiering is intentionally simple:

- `tier_1`: major markets, city records with `tier == 1`, large population, or high building count
- `tier_2`: established regional markets, city records with `tier == 2`, mid-size population, or moderate building count
- `tier_3`: smaller local markets

Tier behavior:

- `tier_1` rows receive fuller summaries, 3-4 notable areas when available, and stronger review warnings if the row falls back to generic areas.
- `tier_2` rows receive full snapshot fields with shorter copy and 2-3 notable areas when available.
- `tier_3` rows use cautious defaults, broad rent ranges, and conservative tenant takeaways.

All generated rows are drafts. Treat them as starting points, not published market research.

## Reviewing Draft Rows

Before copying a draft row into `_data/raw/market-snapshots.csv`, review:

- Is the rent range broad and cautious?
- Does the row avoid exact vacancy percentages and unsupported precision?
- Are the notable areas recognizable business districts or submarkets?
- Does the summary sound specific to the city rather than generic?
- Are `rent_note`, `availability_note`, and `tenant_takeaway` useful to tenants?
- Are direction values limited to `up`, `down`, `flat`, or blank?

The draft script warns when:

- `notable_areas` is blank
- `summary` appears too generic
- `average_rent` is missing
- a draft row duplicates an existing production key
- a direction value is invalid

After approving draft rows:

1. Review `_data/raw/market-snapshots.draft.csv`.
2. Set `approved` to `TRUE` for rows that are ready to publish.
3. Run `npm run promote:market-snapshots`.
4. Run `npm run build:market-snapshots`.
5. Run the Eleventy build.

Do not copy rows that need source review or market-specific cleanup.

You can still manually copy rows if preferred, but the promote script is safer for batches.

## Promoting Approved Drafts

Run:

```bash
npm run promote:market-snapshots
```

The promote script:

- reads `_data/raw/market-snapshots.draft.csv`
- promotes only rows where `approved` equals `TRUE`
- skips rows that already exist in production
- appends approved rows to `_data/raw/market-snapshots.csv`
- leaves unapproved or skipped rows in the draft file
- does not publish draft-only rows by itself

After promotion, always run:

```bash
npm run build:market-snapshots
```

This refreshes `_data/marketSnapshots.generated.js` from the production CSV only.

## Build Generated Data

Run:

```bash
npm run build:market-snapshots
```

The script:

- reads `_data/raw/market-snapshots.csv`
- validates required fields and direction values
- splits `notable_areas` on `|`
- writes `_data/marketSnapshots.generated.js`

Then run the site build:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy
```

## How Templates Use It

`_data/marketSnapshots.js` is the stable data module used by cities and guides.

It merges:

- generated snapshots from `_data/marketSnapshots.generated.js`
- rare manual overrides inside `_data/marketSnapshots.js`

Manual overrides win if duplicate keys exist.

City pages show the compact snapshot card only when enough real values exist. City Market Guides show the expanded snapshot section when enrichment exists.

Non-enriched cities render normally and do not show placeholder snapshot cards.

## Quality Rules

- Do not invent market data.
- Do not use unsupported claims about demand, pricing, or availability.
- Prefer cautious ranges and directional language.
- Avoid overly precise rent values unless the source supports that precision.
- Keep tenant takeaways practical and neutral.
- Do not add a city snapshot just to fill the page; only add it when the data is useful.
