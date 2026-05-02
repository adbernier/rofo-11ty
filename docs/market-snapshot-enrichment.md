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
