from __future__ import annotations

import math
import re

import pandas as pd

from common import DERIVED_DIR, REPORTS_DIR, ensure_dirs, numeric_series, read_csv, slugify


BAY_AREA_CITIES = [
    "San Francisco",
    "Oakland",
    "Berkeley",
    "Alameda",
    "Emeryville",
    "San Jose",
    "Palo Alto",
    "Mountain View",
    "Redwood City",
    "South San Francisco",
    "Walnut Creek",
    "San Mateo",
    "Sunnyvale",
    "Santa Clara",
]

OUTPUT_NEIGHBORHOODS = DERIVED_DIR / "bay_area_neighborhoods.csv"
OUTPUT_ASSIGNMENTS = DERIVED_DIR / "bay_area_building_neighborhood_assignments.csv"
OUTPUT_INTELLIGENCE = DERIVED_DIR / "bay_area_neighborhood_intelligence.csv"

REVIEW_REPORT = REPORTS_DIR / "bay_area_neighborhood_review.md"
ASSIGNMENT_REPORT = REPORTS_DIR / "bay_area_assignment_report.md"
PILOT_REPORT = REPORTS_DIR / "bay_area_pilot_neighborhoods.md"

GARBAGE_NAME_PATTERNS = [
    r"^\d+$",
    r"test",
    r"unknown",
    r"somisspo",
    r"^\s*none\s*$",
    r"^\s*n/?a\s*$",
    r"^\s*-\s*$",
]

CITY_BOUNDS = {
    "San Francisco": (37.60, 37.84, -122.53, -122.35),
    "Oakland": (37.63, 37.90, -122.36, -122.10),
    "Berkeley": (37.82, 37.91, -122.34, -122.20),
    "Alameda": (37.72, 37.80, -122.34, -122.20),
    "Emeryville": (37.82, 37.86, -122.32, -122.27),
    "San Jose": (37.20, 37.48, -122.05, -121.70),
    "Palo Alto": (37.36, 37.48, -122.20, -122.08),
    "Mountain View": (37.35, 37.45, -122.13, -122.02),
    "Redwood City": (37.43, 37.56, -122.30, -122.16),
    "South San Francisco": (37.62, 37.69, -122.48, -122.35),
    "Walnut Creek": (37.84, 38.02, -122.12, -121.95),
    "San Mateo": (37.52, 37.60, -122.36, -122.25),
    "Sunnyvale": (37.32, 37.45, -122.08, -121.96),
    "Santa Clara": (37.32, 37.43, -122.02, -121.90),
}

RECOGNIZABLE_PILOT_HINTS = {
    "soma",
    "south-of-market",
    "financial-district",
    "mission-district",
    "mission-bay",
    "dogpatch",
    "potrero-hill",
    "jackson-square",
    "downtown",
    "city-center",
    "uptown",
    "jack-london-square",
    "old-oakland",
    "temescal",
    "downtown-berkeley",
    "west-berkeley",
    "north-san-jose",
    "downtown-san-jose",
    "downtown-north",
    "university-south",
    "old-mountain-view",
    "redwood-shores",
    "oyster-point",
    "downtown-san-mateo",
    "heritage-district",
}


def normalize_name(value) -> str:
    return re.sub(r"\s+", " ", "" if pd.isna(value) else str(value)).strip()


def city_key(value) -> str:
    return normalize_name(value).lower()


def is_garbage_name(value) -> bool:
    name = normalize_name(value)
    if not name:
        return True
    if len(name) < 2:
        return True
    if len(name) > 80:
        return True
    lowered = name.lower()
    return any(re.search(pattern, lowered) for pattern in GARBAGE_NAME_PATTERNS)


def references_other_target_city(row) -> bool:
    neighborhood_slug = row["neighborhood_slug"]
    own_city_slug = slugify(row["city"])
    for city in BAY_AREA_CITIES:
        other_city_slug = slugify(city)
        if other_city_slug != own_city_slug and other_city_slug in neighborhood_slug:
            return True
    return False


def is_in_city_bounds(row) -> bool:
    bounds = CITY_BOUNDS.get(row["city"])
    if not bounds:
        return True
    lat = float(row["lat"] or 0)
    lng = float(row["lng"] or 0)
    min_lat, max_lat, min_lng, max_lng = bounds
    return min_lat <= lat <= max_lat and min_lng <= lng <= max_lng


def haversine_km(lat1, lng1, lat2, lng2) -> float:
    radius = 6371.0
    phi1 = math.radians(float(lat1))
    phi2 = math.radians(float(lat2))
    delta_phi = math.radians(float(lat2) - float(lat1))
    delta_lng = math.radians(float(lng2) - float(lng1))
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lng / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def assignment_confidence(distance_km: float) -> str:
    if distance_km <= 1.0:
        return "high"
    if distance_km <= 2.5:
        return "medium"
    return "low"


def dominant_activity_bucket(values: pd.Series) -> str:
    if values.empty:
        return "none"
    order = ["ultra_high", "high", "medium", "low", "minimal", "none"]
    counts = values.value_counts().to_dict()
    return sorted(counts, key=lambda bucket: (-counts[bucket], order.index(bucket) if bucket in order else 99))[0]


def clean_bay_area_neighborhoods() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    neighborhoods = read_csv(DERIVED_DIR / "neighborhood_signals.csv")
    markets = read_csv(DERIVED_DIR / "market_signals.csv")

    neighborhoods = neighborhoods[neighborhoods["state"].fillna("").eq("CA")].copy()
    neighborhoods = neighborhoods[neighborhoods["city"].fillna("").isin(BAY_AREA_CITIES)].copy()

    neighborhoods["lat"] = numeric_series(neighborhoods["lat"])
    neighborhoods["lng"] = numeric_series(neighborhoods["lng"])
    neighborhoods["allowed"] = numeric_series(neighborhoods["allowed"]).astype(int)
    neighborhoods["has_geo"] = (neighborhoods["lat"] != 0) & (neighborhoods["lng"] != 0)
    neighborhoods["neighborhood_name"] = neighborhoods["neighborhood_name"].apply(normalize_name)
    neighborhoods["neighborhood_slug"] = neighborhoods["neighborhood_name"].apply(slugify)

    neighborhoods["is_garbage_name"] = neighborhoods["neighborhood_name"].apply(is_garbage_name)
    neighborhoods["references_other_target_city"] = neighborhoods.apply(references_other_target_city, axis=1)
    neighborhoods["in_city_bounds"] = neighborhoods.apply(is_in_city_bounds, axis=1)
    neighborhoods["duplicate_rank"] = neighborhoods.groupby(["city", "neighborhood_slug"]).cumcount()

    suspicious = neighborhoods[
        neighborhoods["is_garbage_name"]
        | neighborhoods["references_other_target_city"]
        | ~neighborhoods["in_city_bounds"]
        | (neighborhoods["duplicate_rank"] > 0)
    ].copy()
    duplicates = neighborhoods[neighborhoods.duplicated(["city", "neighborhood_slug"], keep=False)].copy()

    clean = neighborhoods[
        (~neighborhoods["is_garbage_name"])
        & (~neighborhoods["references_other_target_city"])
        & neighborhoods["allowed"].eq(1)
        & neighborhoods["in_city_bounds"]
        & neighborhoods["duplicate_rank"].eq(0)
    ].copy()

    market_lookup = markets[["city", "state", "building_count", "total_listing_activity"]].copy()
    clean = clean.merge(market_lookup, on=["city", "state"], how="left")
    clean["estimated_city_building_count"] = clean["building_count"].fillna(clean["estimated_building_count"]).fillna(0).astype(int)
    clean["estimated_city_activity"] = clean["total_listing_activity"].fillna(0).astype(int)

    output = clean[[
        "neighborhood_id",
        "neighborhood_name",
        "city",
        "state",
        "lat",
        "lng",
        "has_geo",
        "has_summary",
        "allowed",
        "estimated_city_building_count",
        "estimated_city_activity",
        "neighborhood_slug",
    ]].sort_values(["city", "neighborhood_name"])
    output.to_csv(OUTPUT_NEIGHBORHOODS, index=False)
    return output, suspicious, duplicates


def assign_buildings_to_neighborhoods(neighborhoods: pd.DataFrame) -> pd.DataFrame:
    buildings = read_csv(DERIVED_DIR / "building_signals.csv")
    buildings = buildings[buildings["state"].fillna("").eq("CA")].copy()
    buildings = buildings[buildings["city"].fillna("").isin(BAY_AREA_CITIES)].copy()
    buildings["lat"] = numeric_series(buildings["lat"])
    buildings["lng"] = numeric_series(buildings["lng"])
    buildings = buildings[(buildings["lat"] != 0) & (buildings["lng"] != 0)].copy()

    neighborhoods = neighborhoods[(neighborhoods["has_geo"] == True) & (neighborhoods["lat"] != 0) & (neighborhoods["lng"] != 0)].copy()

    assignments = []
    for city, city_buildings in buildings.groupby("city"):
        city_neighborhoods = neighborhoods[neighborhoods["city"].eq(city)]
        if city_neighborhoods.empty:
            continue

        neighborhood_rows = list(city_neighborhoods.to_dict("records"))
        for building in city_buildings.to_dict("records"):
            nearest = None
            nearest_distance = math.inf
            for neighborhood in neighborhood_rows:
                distance = haversine_km(building["lat"], building["lng"], neighborhood["lat"], neighborhood["lng"])
                if distance < nearest_distance:
                    nearest = neighborhood
                    nearest_distance = distance
            if nearest is None:
                continue

            assignments.append({
                "building_id": building["building_id"],
                "building_name": building["name"],
                "city": building["city"],
                "state": building["state"],
                "building_lat": building["lat"],
                "building_lng": building["lng"],
                "neighborhood_id": nearest["neighborhood_id"],
                "neighborhood_name": nearest["neighborhood_name"],
                "assignment_distance_km": round(nearest_distance, 3),
                "assignment_confidence": assignment_confidence(nearest_distance),
            })

    output = pd.DataFrame(assignments)
    if not output.empty:
        output = output.sort_values(["city", "neighborhood_name", "assignment_distance_km", "building_id"])
    output.to_csv(OUTPUT_ASSIGNMENTS, index=False)
    return output


def build_neighborhood_intelligence(assignments: pd.DataFrame) -> pd.DataFrame:
    buildings = read_csv(DERIVED_DIR / "building_signals.csv")
    building_columns = [
        "building_id",
        "listing_count",
        "activity_bucket",
        "is_active_signal",
        "building_size",
        "floors",
        "likely_multi_tenant",
    ]
    joined = assignments.merge(buildings[building_columns], on="building_id", how="left")
    joined["listing_count"] = numeric_series(joined["listing_count"])
    joined["building_size"] = numeric_series(joined["building_size"])
    joined["floors"] = numeric_series(joined["floors"])
    joined["is_active_signal"] = joined["is_active_signal"].fillna(False).astype(bool)
    joined["likely_multi_tenant"] = joined["likely_multi_tenant"].fillna(False).astype(bool)

    grouped = joined.groupby(["neighborhood_id", "neighborhood_name", "city", "state"]).agg(
        building_count=("building_id", "count"),
        active_building_count=("is_active_signal", "sum"),
        total_listing_activity=("listing_count", "sum"),
        median_listing_activity=("listing_count", "median"),
        high_activity_building_count=("listing_count", lambda values: (values >= 100).sum()),
        avg_building_size=("building_size", lambda values: values[values > 0].mean()),
        avg_floors=("floors", lambda values: values[values > 0].mean()),
        multi_tenant_building_count=("likely_multi_tenant", "sum"),
        high_confidence_assignment_count=("assignment_confidence", lambda values: (values == "high").sum()),
        activity_buckets=("activity_bucket", dominant_activity_bucket),
    ).reset_index()

    grouped = grouped.rename(columns={"activity_buckets": "dominant_activity_bucket"})
    grouped["avg_building_size"] = grouped["avg_building_size"].round(0)
    grouped["avg_floors"] = grouped["avg_floors"].round(1)
    grouped["median_listing_activity"] = grouped["median_listing_activity"].round(1)
    grouped["likely_office_cluster"] = (
        (grouped["building_count"] >= 25)
        & (grouped["total_listing_activity"] >= 250)
        & (grouped["avg_floors"].fillna(0) >= 2)
    )
    grouped["likely_mixed_use"] = (
        (grouped["building_count"] >= 15)
        & (grouped["multi_tenant_building_count"] >= 5)
        & (grouped["median_listing_activity"].fillna(0) >= 1)
    )
    grouped["likely_small_business_friendly"] = (
        (grouped["building_count"] >= 10)
        & (grouped["median_listing_activity"].fillna(0) <= 5)
        & (grouped["total_listing_activity"] > 0)
    )

    output = grouped[[
        "neighborhood_name",
        "city",
        "state",
        "building_count",
        "active_building_count",
        "total_listing_activity",
        "median_listing_activity",
        "high_activity_building_count",
        "dominant_activity_bucket",
        "avg_building_size",
        "avg_floors",
        "likely_office_cluster",
        "likely_mixed_use",
        "likely_small_business_friendly",
    ]].sort_values(["total_listing_activity", "building_count"], ascending=False)
    output.to_csv(OUTPUT_INTELLIGENCE, index=False)
    return output


def markdown_table(df: pd.DataFrame, columns: list[str], limit: int = 20) -> str:
    view = df[columns].head(limit).fillna("").astype(str)
    if view.empty:
        return "_None._"
    lines = [
        "| " + " | ".join(columns) + " |",
        "| " + " | ".join(["---"] * len(columns)) + " |",
    ]
    for _, row in view.iterrows():
        lines.append("| " + " | ".join(row[col].replace("|", "\\|") for col in columns) + " |")
    return "\n".join(lines)


def write_neighborhood_review(
    neighborhoods: pd.DataFrame,
    suspicious: pd.DataFrame,
    duplicates: pd.DataFrame,
    intelligence: pd.DataFrame,
) -> None:
    lacking_geo = neighborhoods[neighborhoods["has_geo"] == False]
    high_confidence = intelligence.sort_values(
        ["total_listing_activity", "building_count"],
        ascending=False,
    ).copy()

    counts = neighborhoods.groupby("city").size().reset_index(name="neighborhood_count").sort_values(
        ["neighborhood_count", "city"], ascending=[False, True]
    )

    lines = [
        "# Bay Area Neighborhood Review",
        "",
        "This report reviews high-confidence Bay Area neighborhood records from the legacy Rofo neighborhood dataset.",
        "",
        "The output is for discovery, geographic understanding, SEO enrichment, and AI retrieval context. It is not live inventory.",
        "",
        "## Neighborhood Counts by City",
        "",
        markdown_table(counts, ["city", "neighborhood_count"], 30),
        "",
        "## Suspicious or Filtered Names",
        "",
        markdown_table(suspicious, ["neighborhood_id", "neighborhood_name", "city", "lat", "lng"], 30),
        "",
        "## Duplicates",
        "",
        markdown_table(duplicates, ["neighborhood_id", "neighborhood_name", "city", "neighborhood_slug"], 30),
        "",
        "## Neighborhoods Lacking Geo",
        "",
        markdown_table(lacking_geo, ["neighborhood_id", "neighborhood_name", "city"], 30),
        "",
        "## Recommended High Confidence Pilot Neighborhoods",
        "",
        markdown_table(high_confidence, [
            "neighborhood_name",
            "city",
            "building_count",
            "total_listing_activity",
            "likely_office_cluster",
            "likely_mixed_use",
        ], 25),
        "",
        "## Notes",
        "",
        "- Records were filtered for allowed neighborhoods, nonblank names, unique city slugs, and plausible city-level coordinates.",
        "- The city activity fields are market-level signals, not neighborhood-specific live availability.",
        "- Some legacy records use names from adjacent cities or broad citywide labels. These should be reviewed before public rollout.",
    ]
    REVIEW_REPORT.write_text("\n".join(lines) + "\n")


def write_assignment_report(assignments: pd.DataFrame) -> None:
    confidence = assignments.groupby("assignment_confidence").size().reset_index(name="building_count").sort_values(
        "building_count", ascending=False
    )
    top_neighborhoods = assignments.groupby(["city", "neighborhood_name"]).size().reset_index(name="assigned_building_count").sort_values(
        "assigned_building_count", ascending=False
    )
    suspicious = top_neighborhoods[top_neighborhoods["assigned_building_count"] >= top_neighborhoods["assigned_building_count"].quantile(0.95)]

    lines = [
        "# Bay Area Building to Neighborhood Assignment Report",
        "",
        "Buildings were assigned to the nearest neighborhood centroid within the same city. This is a lightweight approximation, not polygon GIS.",
        "",
        f"Total assigned buildings: {len(assignments):,}",
        "",
        "## Assignment Confidence Breakdown",
        "",
        markdown_table(confidence, ["assignment_confidence", "building_count"], 10),
        "",
        "## Neighborhoods With Most Assigned Buildings",
        "",
        markdown_table(top_neighborhoods, ["city", "neighborhood_name", "assigned_building_count"], 30),
        "",
        "## Suspiciously Large Assignment Counts",
        "",
        markdown_table(suspicious, ["city", "neighborhood_name", "assigned_building_count"], 30),
        "",
        "## Recommendations",
        "",
        "- Replace centroid matching with reviewed polygons or radius rules before public neighborhood pages.",
        "- Review neighborhoods with large assignment counts because citywide or sparse neighborhood coverage can overassign to one centroid.",
        "- Keep assignment confidence visible in internal datasets so downstream AI/search systems can weight weaker assignments conservatively.",
        "- Continue treating listing activity as historical leasing intensity, not live availability.",
    ]
    ASSIGNMENT_REPORT.write_text("\n".join(lines) + "\n")


def pilot_score(row) -> float:
    score = 0.0
    score += min(row["building_count"], 100) * 0.25
    score += min(row["total_listing_activity"], 2000) * 0.03
    score += row["high_activity_building_count"] * 2
    if row["likely_office_cluster"]:
        score += 25
    if row["likely_mixed_use"]:
        score += 15
    if slugify(row["neighborhood_name"]) in RECOGNIZABLE_PILOT_HINTS:
        score += 20
    return round(score, 1)


def intent_for_row(row) -> str:
    if row["likely_office_cluster"]:
        return "office and professional service tenants comparing established business clusters"
    if row["likely_mixed_use"]:
        return "small teams, service businesses, and mixed-use commercial searches"
    if row["likely_small_business_friendly"]:
        return "local businesses comparing smaller buildings and practical neighborhood options"
    return "tenants using neighborhood context to compare nearby commercial options"


def activity_summary(row) -> str:
    bucket = row["dominant_activity_bucket"]
    size = "" if pd.isna(row["avg_building_size"]) else f", average known building size around {int(row['avg_building_size']):,} SF"
    return (
        f"{int(row['building_count'])} assigned buildings, "
        f"{int(row['active_building_count'])} active signal buildings, "
        f"{int(row['total_listing_activity'])} historical listing activity, "
        f"dominant activity bucket {bucket}{size}."
    )


def write_pilot_report(intelligence: pd.DataFrame) -> None:
    candidates = intelligence.copy()
    candidates["pilot_score"] = candidates.apply(pilot_score, axis=1)
    candidates = candidates.sort_values(["pilot_score", "total_listing_activity", "building_count"], ascending=False).head(20)

    lines = [
        "# Bay Area Pilot Neighborhood Recommendations",
        "",
        "These recommendations are for internal prototyping only. They should inform eventual neighborhood discovery and SEO enrichment, not listing-grid UX or stale inventory exposure.",
        "",
    ]

    for index, row in enumerate(candidates.to_dict("records"), start=1):
        lines.extend([
            f"## {index}. {row['neighborhood_name']}, {row['city']}",
            "",
            f"**Why it is promising:** Pilot score {row['pilot_score']} based on building density, historical leasing activity, high-activity buildings, recognizable business identity, and simple geographic confidence.",
            "",
            f"**Likely tenant/search intent:** {intent_for_row(row)}.",
            "",
            f"**Dominant buildings/activity:** {activity_summary(row)}",
            "",
        ])

    lines.extend([
        "## Caveats",
        "",
        "- Assignments use nearest neighborhood centroid within the same city.",
        "- Neighborhood boundaries should be reviewed before any public rollout.",
        "- Listing activity is historical leasing intensity and must not be presented as current availability.",
    ])
    PILOT_REPORT.write_text("\n".join(lines) + "\n")


def main() -> None:
    ensure_dirs()
    neighborhoods, suspicious, duplicates = clean_bay_area_neighborhoods()
    assignments = assign_buildings_to_neighborhoods(neighborhoods)
    intelligence = build_neighborhood_intelligence(assignments)

    write_neighborhood_review(neighborhoods, suspicious, duplicates, intelligence)
    write_assignment_report(assignments)
    write_pilot_report(intelligence)

    print(f"Wrote {len(neighborhoods):,} Bay Area neighborhood rows.")
    print(f"Wrote {len(assignments):,} Bay Area building-neighborhood assignments.")
    print(f"Wrote {len(intelligence):,} Bay Area neighborhood intelligence rows.")
    print(f"Wrote reports to {REPORTS_DIR}.")


if __name__ == "__main__":
    main()
