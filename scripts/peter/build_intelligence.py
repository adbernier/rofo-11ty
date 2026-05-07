from __future__ import annotations

import pandas as pd

from common import (
    DERIVED_DIR,
    RAW_DIR,
    ensure_dirs,
    normalize_city_key,
    numeric_series,
    read_csv,
)


BUILDING_OUTPUT_COLUMNS = [
    "building_id",
    "name",
    "address",
    "city",
    "state",
    "zip",
    "county",
    "metro",
    "lat",
    "lng",
    "building_size",
    "floors",
    "units",
    "min_size",
    "max_size",
    "listing_count",
    "has_association",
    "broker_house_id",
    "redirect_id",
    "activity_bucket",
    "is_active_signal",
    "likely_multi_tenant",
    "has_geo",
    "has_size_data",
]


def activity_bucket(value) -> str:
    listing_count = int(value or 0)
    if listing_count >= 1000:
        return "ultra_high"
    if listing_count >= 100:
        return "high"
    if listing_count >= 10:
        return "medium"
    if listing_count >= 2:
        return "low"
    if listing_count == 1:
        return "minimal"
    return "none"


def market_bucket(total_listing_activity: float) -> str:
    if total_listing_activity >= 10000:
        return "ultra_high"
    if total_listing_activity >= 2500:
        return "high"
    if total_listing_activity >= 500:
        return "medium"
    if total_listing_activity >= 50:
        return "low"
    if total_listing_activity > 0:
        return "minimal"
    return "none"


def build_building_signals() -> pd.DataFrame:
    buildings = read_csv(RAW_DIR / "rofo_buildings.csv")

    for column in ["building_size", "floors", "units", "min_size", "max_size", "listing_count", "has_association", "lat", "lng"]:
        buildings[column] = numeric_series(buildings[column])

    buildings["activity_bucket"] = buildings["listing_count"].apply(activity_bucket)
    buildings["is_active_signal"] = (buildings["listing_count"] > 0) | (buildings["has_association"] == 1)
    buildings["likely_multi_tenant"] = (
        (buildings["listing_count"] >= 10)
        | (buildings["units"] >= 5)
        | (buildings["floors"] >= 3)
    )
    buildings["has_geo"] = (buildings["lat"] != 0) & (buildings["lng"] != 0)
    buildings["has_size_data"] = (
        (buildings["building_size"] > 0)
        | (buildings["min_size"] > 0)
        | (buildings["max_size"] > 0)
    )

    output = buildings[BUILDING_OUTPUT_COLUMNS].copy()
    output.to_csv(DERIVED_DIR / "building_signals.csv", index=False)
    return output


def enrichment_score(row) -> int:
    score = 0
    score += min(int(row["building_count"] // 100), 25)
    score += min(int(row["active_building_count"] // 25), 25)
    score += min(int(row["total_listing_activity"] // 500), 25)
    score += min(int(row["high_activity_building_count"] * 2), 15)
    score += min(int(row["neighborhood_count"]), 10)
    return int(min(score, 100))


def build_market_signals(building_signals: pd.DataFrame) -> pd.DataFrame:
    neighborhoods = read_csv(DERIVED_DIR / "neighborhoods_from_legacy.csv")
    cities = read_csv(DERIVED_DIR / "cities_from_legacy.csv")

    neighborhoods_by_city = neighborhoods.groupby("c_id").size().rename("neighborhood_count").reset_index()
    city_lookup = cities.merge(neighborhoods_by_city, on="c_id", how="left")
    city_lookup["city_key"] = city_lookup.apply(lambda row: normalize_city_key(row["c_name"], row["state_code"]), axis=1)
    city_lookup = city_lookup.sort_values("c_featured", ascending=False).drop_duplicates("city_key")

    grouped = building_signals.groupby(["city", "state"], dropna=False).agg(
        building_count=("building_id", "count"),
        active_building_count=("is_active_signal", "sum"),
        total_listing_activity=("listing_count", "sum"),
        median_listing_count=("listing_count", "median"),
        high_activity_building_count=("listing_count", lambda s: (s >= 100).sum()),
        ultra_high_activity_building_count=("listing_count", lambda s: (s >= 1000).sum()),
    ).reset_index()

    grouped["city_key"] = grouped.apply(lambda row: normalize_city_key(row["city"], row["state"]), axis=1)
    grouped = grouped.merge(
        city_lookup[["city_key", "c_glat", "c_glng", "neighborhood_count"]],
        on="city_key",
        how="left",
    )
    grouped["neighborhood_count"] = grouped["neighborhood_count"].fillna(0).astype(int)
    grouped["has_legacy_city_record"] = grouped["c_glat"].notna() | grouped["c_glng"].notna()
    grouped["city_lat"] = grouped["c_glat"]
    grouped["city_lng"] = grouped["c_glng"]
    grouped["market_activity_bucket"] = grouped["total_listing_activity"].apply(market_bucket)
    grouped["enrichment_priority_score"] = grouped.apply(enrichment_score, axis=1)

    output = grouped[[
        "city",
        "state",
        "building_count",
        "active_building_count",
        "total_listing_activity",
        "median_listing_count",
        "high_activity_building_count",
        "ultra_high_activity_building_count",
        "neighborhood_count",
        "has_legacy_city_record",
        "city_lat",
        "city_lng",
        "market_activity_bucket",
        "enrichment_priority_score",
    ]].sort_values(["enrichment_priority_score", "total_listing_activity"], ascending=False)

    output.to_csv(DERIVED_DIR / "market_signals.csv", index=False)
    return output


def estimate_neighborhood_building_counts(neighborhoods: pd.DataFrame, buildings: pd.DataFrame) -> pd.Series:
    """Lightweight proxy, not a parcel-level geospatial join.

    The SQL dump has centroid/radius data, but a full point-in-radius pass over
    all buildings and neighborhoods is too slow for this simple batch workflow.
    Instead, provide each neighborhood with its city-level building count as a
    directional market-depth signal.
    """
    buildings = buildings.copy()
    buildings["city_key"] = buildings.apply(lambda row: normalize_city_key(row["city"], row["state"]), axis=1)
    city_counts = buildings.groupby("city_key").size().to_dict()

    keys = neighborhoods.apply(
        lambda row: normalize_city_key(row.get("c_name", ""), row.get("state_code", "")),
        axis=1,
    )
    return keys.map(city_counts).fillna(0).astype(int)


def build_neighborhood_signals(building_signals: pd.DataFrame) -> pd.DataFrame:
    neighborhoods = read_csv(DERIVED_DIR / "neighborhoods_from_legacy.csv")
    cities = read_csv(DERIVED_DIR / "cities_from_legacy.csv")

    city_lookup = cities[["c_id", "c_name", "state_code"]].copy()
    output = neighborhoods.merge(city_lookup, on="c_id", how="left")
    output["has_geo"] = (numeric_series(output["n_glat"]) != 0) & (numeric_series(output["n_glng"]) != 0)
    output["has_summary"] = output["n_summary"].fillna("").astype(str).str.strip() != ""
    output["has_description"] = output["n_description"].fillna("").astype(str).str.strip() != ""

    output["estimated_building_count"] = estimate_neighborhood_building_counts(output.copy(), building_signals)

    output = output.rename(columns={
        "n_id": "neighborhood_id",
        "c_id": "city_id",
        "n_name": "neighborhood_name",
        "c_name": "city",
        "state_code": "state",
        "n_glat": "lat",
        "n_glng": "lng",
        "n_allowed": "allowed",
        "p_id": "parent_id",
    })[[
        "neighborhood_id",
        "city_id",
        "neighborhood_name",
        "city",
        "state",
        "lat",
        "lng",
        "has_geo",
        "has_summary",
        "has_description",
        "allowed",
        "parent_id",
        "estimated_building_count",
    ]]

    output.to_csv(DERIVED_DIR / "neighborhood_signals.csv", index=False)
    return output


def main() -> None:
    ensure_dirs()
    building_signals = build_building_signals()
    market_signals = build_market_signals(building_signals)
    neighborhood_signals = build_neighborhood_signals(building_signals)

    print(f"Wrote {len(building_signals):,} building signal rows.")
    print(f"Wrote {len(market_signals):,} market signal rows.")
    print(f"Wrote {len(neighborhood_signals):,} neighborhood signal rows.")


if __name__ == "__main__":
    main()
