# Peter Legacy Data Workflow

This folder contains the isolated Peter legacy data analysis workflow.

## Folder Structure

* `raw/` contains source of truth exports. Do not edit these files.
* `derived/` contains generated CSVs used for analysis and review.
* `samples/` contains deterministic random samples that are safe for AI and Codex review.
* `reports/` contains markdown summaries and recommendations.

## Generated Files

The workflow creates:

* `derived/cities_from_legacy.csv`
* `derived/neighborhoods_from_legacy.csv`
* `derived/building_signals.csv`
* `derived/market_signals.csv`
* `derived/neighborhood_signals.csv`
* `derived/bay_area_neighborhoods.csv`
* `derived/bay_area_building_neighborhood_assignments.csv`
* `derived/bay_area_neighborhood_intelligence.csv`
* `derived/bay_area_editorial_neighborhoods.csv`
* `derived/bay_area_neighborhood_adjacency.csv`
* `derived/bay_area_representative_buildings.csv`
* random sample CSVs in `samples/`
* markdown reports in `reports/`

## Commands

Run the full workflow:

```bash
python3 scripts/peter/run_all.py
```

Run individual steps:

```bash
python3 scripts/peter/extract_legacy_sql.py
python3 scripts/peter/create_samples.py
python3 scripts/peter/build_intelligence.py
python3 scripts/peter/generate_reports.py
python3 scripts/peter/build_bay_area_neighborhood_intelligence.py
python3 scripts/peter/build_bay_area_editorial_neighborhoods.py
```

## Product Caveats

Rofo should treat `listing_count` as historical leasing activity intensity, not live availability.

Do not use this workflow to create listing-grid UX or expose stale inventory. The intended uses are SEO enrichment, building intelligence, market prioritization, future neighborhood planning, and AI/search context.
