from __future__ import annotations

import pandas as pd

from common import DERIVED_DIR, RAW_DIR, REPORTS_DIR, clean_text, ensure_dirs, read_csv


RAW_FILES = [
    "rofo_buildings.csv",
    "rofo_listings.csv",
    "rofo_leads.csv",
    "rofo_users.csv",
    "rofo_broker_houses.csv",
    "rofo_market_summary.csv",
    "rofo_relationships_leads.csv",
    "rofo_relationships_listing_buildings.csv",
    "rofo_data_dictionary.csv",
]


def md_table(df: pd.DataFrame, max_rows: int = 10) -> str:
    if df.empty:
        return "_No rows._"
    preview = df.head(max_rows).fillna("")
    headers = [str(column) for column in preview.columns]
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]
    for _, row in preview.iterrows():
        values = [str(row[column]).replace("|", "\\|").replace("\n", " ") for column in preview.columns]
        lines.append("| " + " | ".join(values) + " |")
    return "\n".join(lines)


def row_counts() -> pd.DataFrame:
    rows = []
    for file_name in RAW_FILES:
        path = RAW_DIR / file_name
        if path.exists():
            df = read_csv(path)
            rows.append({"file": file_name, "rows": len(df), "columns": len(df.columns)})
    for file_name in ["cities_from_legacy.csv", "neighborhoods_from_legacy.csv", "building_signals.csv", "market_signals.csv", "neighborhood_signals.csv"]:
        path = DERIVED_DIR / file_name
        if path.exists():
            df = read_csv(path)
            rows.append({"file": f"derived/{file_name}", "rows": len(df), "columns": len(df.columns)})
    return pd.DataFrame(rows)


def schema_summary(path) -> pd.DataFrame:
    df = read_csv(path)
    return pd.DataFrame({
        "column": df.columns,
        "non_null": [int(df[column].notna().sum()) for column in df.columns],
        "missing_pct": [round(float(df[column].isna().mean() * 100), 1) for column in df.columns],
        "dtype": [str(df[column].dtype) for column in df.columns],
    })


def dataset_overview() -> str:
    buildings = read_csv(RAW_DIR / "rofo_buildings.csv")
    market_signals = read_csv(DERIVED_DIR / "market_signals.csv")
    building_signals = read_csv(DERIVED_DIR / "building_signals.csv")

    top_cities = market_signals[[
        "city",
        "state",
        "building_count",
        "active_building_count",
        "total_listing_activity",
        "enrichment_priority_score",
    ]].head(15)
    top_buildings = building_signals.sort_values("listing_count", ascending=False)[[
        "building_id",
        "name",
        "address",
        "city",
        "state",
        "listing_count",
        "activity_bucket",
    ]].head(15)

    missing_observations = []
    for column in ["lat", "lng", "building_size", "floors", "units", "min_size", "max_size", "listing_count"]:
        missing_or_zero = ((pd.to_numeric(buildings[column], errors="coerce").fillna(0)) == 0).mean()
        missing_observations.append({"field": column, "blank_or_zero_pct": round(float(missing_or_zero * 100), 1)})

    return f"""# Peter Dataset Overview

## Row Counts

{md_table(row_counts(), 20)}

## Building Schema Summary

{md_table(schema_summary(RAW_DIR / "rofo_buildings.csv"), 40)}

## Listing Schema Summary

{md_table(schema_summary(RAW_DIR / "rofo_listings.csv"), 40)}

## Missingness Observations

{md_table(pd.DataFrame(missing_observations), 20)}

Zero values are common in size and geo fields. Those should be treated as missing unless validated elsewhere.

## Top Cities By Historical Leasing Activity

{md_table(top_cities, 15)}

## Top Buildings By Historical Listing Activity

{md_table(top_buildings, 15)}

## Important Caveats

* `listing_count` is historical leasing activity intensity. It is not live availability.
* Rows may reflect legacy marketplace behavior, old broker feeds, syndication, or duplicate historical activity.
* Building pages should use this data for context, prioritization, and confidence signals, not as current inventory.
* Size, floor, unit, and geo fields require defensive handling because zeros often mean unknown.
* Neighborhood geometry can be useful, but simple centroid and radius estimates should be treated as directional.
"""


def recommendations() -> str:
    return """# Rofo Intelligence Recommendations

## How Rofo Should Use This Data

Use the Peter export as a commercial real estate intelligence layer. The strongest use cases are market prioritization, building page enrichment, internal linking, neighborhood planning, and AI retrieval context.

## Building Enrichment Ideas

* Use `listing_count` as a historical activity signal.
* Use high activity buildings to prioritize richer page copy, image review, and market guide links.
* Use `likely_multi_tenant`, size fields, floors, and units to describe building context carefully.
* Use geo fields to connect buildings to nearby markets and future neighborhood pages.

## Neighborhood Strategy

* Start with cities that have many allowed neighborhoods, strong summaries, and existing building activity.
* Pilot San Francisco, Oakland, Los Angeles, New York, Chicago, and Atlanta if their neighborhood records and building density are strong.
* Keep neighborhood pages informational. Avoid implying live inventory.

## SEO Opportunities

* Add market and neighborhood context to building pages.
* Use high activity buildings for stronger internal linking.
* Create market guide modules that explain local building patterns without exposing stale listings.
* Use neighborhood data to build future pages only where there is enough supporting building context.

## Market Prioritization Strategy

Prioritize markets with:

* high building count
* high active building count
* high total listing activity
* multiple high activity buildings
* usable legacy city and neighborhood records

The generated `enrichment_priority_score` is intentionally simple. Treat it as a review queue, not a final business decision.

## Risks And Cautions

* Do not expose `listing_count` as availability.
* Do not create listing-grid UX from this dataset.
* Do not publish stale suite data.
* Do not overstate rents, availability, amenities, or market demand.
* Do not generate neighborhood pages where no useful building or city context exists.

## What Not To Expose Publicly

* tenant lead details
* user emails and phones
* broker relationship tables
* raw listing rows
* stale asking rents or suite statuses
* exact counts framed as current availability
"""


def neighborhood_report() -> str:
    neighborhoods = read_csv(DERIVED_DIR / "neighborhood_signals.csv")
    allowed = neighborhoods[neighborhoods["allowed"].fillna(0).astype(int) == 1]
    by_city = neighborhoods.groupby(["city", "state"], dropna=False).agg(
        neighborhood_count=("neighborhood_id", "count"),
        allowed_count=("allowed", "sum"),
        with_summary=("has_summary", "sum"),
        with_geo=("has_geo", "sum"),
        city_building_count_proxy=("estimated_building_count", "max"),
    ).reset_index().sort_values(["allowed_count", "neighborhood_count"], ascending=False)

    recognizable = allowed[
        allowed["has_geo"] & (allowed["has_summary"] | allowed["has_description"])
    ][[
        "neighborhood_name",
        "city",
        "state",
        "has_summary",
        "estimated_building_count",
    ]].head(25)

    pilot = by_city[
        (by_city["allowed_count"] >= 5)
        & (by_city["with_geo"] >= 5)
    ].head(15)

    return f"""# Neighborhood Opportunity Report

## Neighborhood Counts

* Total neighborhoods: {len(neighborhoods):,}
* Allowed neighborhoods: {len(allowed):,}
* Neighborhoods with geo: {int(neighborhoods["has_geo"].sum()):,}
* Neighborhoods with summaries: {int(neighborhoods["has_summary"].sum()):,}

## Cities With Most Neighborhoods

{md_table(by_city, 20)}

## Recognizable Or Higher Confidence Neighborhoods

{md_table(recognizable, 25)}

## Recommended Pilot Markets

{md_table(pilot, 15)}

## Building Count Estimate Caveat

`estimated_building_count` is a lightweight city-level proxy repeated on each neighborhood row. It is useful for screening market depth, but it is not a parcel-level geospatial join.

## Rollout Recommendation

Start with markets that combine allowed neighborhood records, summaries, geo fields, and enough nearby building activity. Build a small pilot first, review page quality manually, then expand in batches.
"""


def main() -> None:
    ensure_dirs()
    reports = {
        "peter_dataset_overview.md": dataset_overview(),
        "rofo_intelligence_recommendations.md": recommendations(),
        "neighborhood_opportunity_report.md": neighborhood_report(),
    }
    for file_name, content in reports.items():
        (REPORTS_DIR / file_name).write_text(content, encoding="utf-8")
        print(f"Wrote data/peter/reports/{file_name}.")


if __name__ == "__main__":
    main()
