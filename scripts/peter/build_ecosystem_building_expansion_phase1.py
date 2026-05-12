from __future__ import annotations

import json
import math
import re
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd

from common import RAW_DIR, REPORTS_DIR, ROOT, ensure_dirs, slugify


RESEARCH_DIR = ROOT / "data" / "peter" / "research"
PHASE1_MARKETS_JSON = RESEARCH_DIR / "commercial_ecosystem_rollout_phase1.json"
ECOSYSTEM_CANDIDATES_JSON = RESEARCH_DIR / "commercial_ecosystem_candidates.json"
SPACE_TYPE_LOOKUP_JSON = RESEARCH_DIR / "legacy_space_type_code_lookup.json"
OUTPUT_JSON = RESEARCH_DIR / "ecosystem_building_expansion_phase1.json"
REPORT_MD = REPORTS_DIR / "ecosystem_building_expansion_phase1.md"

BUILDINGS_CSV = RAW_DIR / "rofo_buildings.csv"
LISTINGS_CSV = RAW_DIR / "rofo_listings.csv"

LIVE_BUILDING_SOURCES = [
    ROOT / "data-sources" / "reference" / "buildings-live-before-merge.json",
    ROOT / "data-sources" / "reference" / "company-buildings.json",
]
SEMANTIC_ID_LOOKUP = ROOT / "data" / "peter" / "derived" / "production_building_semantic_id_lookup.json"

MARKET_LIMIT = 28
BUILDINGS_PER_MARKET = 30


def normalize_text(value) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def normalize_address(value) -> str:
    value = normalize_text(value)
    value = re.sub(r"[^\w\s#-]", " ", value)
    value = re.sub(r"\b(street)\b", "st", value)
    value = re.sub(r"\b(avenue)\b", "ave", value)
    value = re.sub(r"\b(road)\b", "rd", value)
    value = re.sub(r"\b(boulevard)\b", "blvd", value)
    value = re.sub(r"\b(parkway)\b", "pkwy", value)
    value = re.sub(r"\b(drive)\b", "dr", value)
    value = re.sub(r"\b(lane)\b", "ln", value)
    value = re.sub(r"\b(suite|ste|unit)\b.*$", "", value)
    return re.sub(r"\s+", " ", value).strip()


def normalized_building_key(address: str, city: str, state: str) -> str:
    return "|".join([normalize_address(address), slugify(city), str(state or "").upper()])


def market_key(city: str, state: str) -> str:
    return f"{slugify(city)}|{str(state or '').upper()}"


def valid_geo(lat, lng) -> bool:
    try:
        lat = float(lat)
        lng = float(lng)
    except (TypeError, ValueError):
        return False
    return lat != 0 and lng != 0 and -90 <= lat <= 90 and -180 <= lng <= 180


def load_json(path: Path):
    return json.loads(path.read_text())


def select_markets() -> list[dict]:
    phase1 = load_json(PHASE1_MARKETS_JSON)
    candidates = {
        (row["city"], row["state_abbr"]): row
        for row in load_json(ECOSYSTEM_CANDIDATES_JSON)
    }

    selected = []
    for row in phase1:
        merged = {**candidates.get((row["city"], row["state_abbr"]), {}), **row}
        if merged.get("suggested_priority") == "suppress":
            continue
        if merged.get("cluster_strength") not in {"very_strong", "strong"}:
            continue
        if float(merged.get("geo_coverage_ratio") or 0) < 0.5:
            continue
        selected.append(merged)
        if len(selected) >= MARKET_LIMIT:
            break
    return selected


def load_space_type_lookup() -> dict[str, str]:
    raw = load_json(SPACE_TYPE_LOOKUP_JSON)
    return {
        str(code): data.get("public_safe_category", "other/unknown").replace("/unknown", "")
        if data.get("public_safe_category") == "other/unknown"
        else data.get("public_safe_category", "other")
        for code, data in raw.items()
    }


def load_current_live_keys() -> tuple[set[str], set[int]]:
    keys: set[str] = set()
    ids: set[int] = set()

    for path in LIVE_BUILDING_SOURCES:
        if not path.exists():
            continue
        for row in load_json(path):
            key = normalized_building_key(row.get("address"), row.get("city"), row.get("state_abbr") or row.get("state"))
            if key and not key.startswith("|"):
                keys.add(key)

    if SEMANTIC_ID_LOOKUP.exists():
        for value in load_json(SEMANTIC_ID_LOOKUP).values():
            try:
                ids.add(int(value.get("semantic_source_building_id")))
            except (TypeError, ValueError):
                continue

    return keys, ids


def aggregate_listing_activity(selected_keys: set[str], space_lookup: dict[str, str]) -> dict[int, dict]:
    activity: dict[int, dict] = {}
    usecols = ["building_id", "city", "state", "space_type", "listing_id"]

    for chunk in pd.read_csv(LISTINGS_CSV, usecols=usecols, chunksize=300_000, low_memory=False):
        chunk["market_key"] = chunk.apply(lambda row: market_key(row["city"], row["state"]), axis=1)
        chunk = chunk[chunk["market_key"].isin(selected_keys)]
        if chunk.empty:
            continue

        chunk["building_id"] = pd.to_numeric(chunk["building_id"], errors="coerce").fillna(0).astype(int)
        chunk = chunk[chunk["building_id"] > 0]
        chunk["decoded_space_type"] = chunk["space_type"].fillna(0).astype(int).astype(str).map(space_lookup).fillna("other")

        grouped = chunk.groupby("building_id")
        for building_id, group in grouped:
            record = activity.setdefault(int(building_id), {"activity": 0, "space_types": Counter()})
            record["activity"] += int(group["listing_id"].count())
            record["space_types"].update(group["decoded_space_type"].tolist())

    return activity


def load_buildings(selected_keys: set[str], listing_activity: dict[int, dict]) -> pd.DataFrame:
    usecols = [
        "building_id", "name", "address", "city", "state", "zip", "county", "metro",
        "lat", "lng", "building_size", "floors", "units", "min_size", "max_size",
        "listing_count", "has_association", "redirect_id",
    ]
    frames = []

    for chunk in pd.read_csv(BUILDINGS_CSV, usecols=usecols, chunksize=250_000, low_memory=False):
        chunk["market_key"] = chunk.apply(lambda row: market_key(row["city"], row["state"]), axis=1)
        chunk = chunk[chunk["market_key"].isin(selected_keys)]
        if not chunk.empty:
            frames.append(chunk.copy())

    if not frames:
        return pd.DataFrame(columns=usecols)

    buildings = pd.concat(frames, ignore_index=True)
    buildings["building_id"] = pd.to_numeric(buildings["building_id"], errors="coerce").fillna(0).astype(int)
    buildings["activity_from_listings"] = buildings["building_id"].map(lambda bid: listing_activity.get(int(bid), {}).get("activity", 0))
    buildings["estimated_activity"] = buildings[["listing_count", "activity_from_listings"]].apply(pd.to_numeric, errors="coerce").fillna(0).max(axis=1)
    buildings["normalized_building_key"] = buildings.apply(
        lambda row: normalized_building_key(row["address"], row["city"], row["state"]),
        axis=1,
    )
    return buildings


def duplicate_risk(key_counts: Counter, key: str) -> str:
    count = key_counts.get(key, 0)
    if count <= 1:
        return "low"
    if count <= 3:
        return "medium"
    return "high"


def status_for(row, live_keys: set[str], live_ids: set[int], dup_risk: str) -> tuple[str, str]:
    if not valid_geo(row["lat"], row["lng"]) or not normalize_address(row["address"]):
        return "suppress", "missing reliable address or coordinates"
    if dup_risk == "high":
        return "suppress", "high duplicate risk for normalized address"
    if int(row["building_id"]) in live_ids or row["normalized_building_key"] in live_keys:
        return "review", "likely overlaps current live building graph"
    if float(row["estimated_activity"]) >= 10 and dup_risk == "low":
        return "expand", "repeated historical activity with clean address and coordinates"
    return "review", "usable representative candidate but needs manual review before promotion"


def cluster_context(row, market_profile: str) -> str:
    pieces = []
    if market_profile:
        pieces.append(market_profile)
    if bool(row.get("likely_multi_tenant")):
        pieces.append("multi-tenant signal")
    if float(row.get("building_size") or 0) > 50_000:
        pieces.append("larger building")
    if float(row.get("floors") or 0) >= 3:
        pieces.append("multi-floor building")
    return "; ".join(pieces[:3]) or "representative commercial building"


def create_records(markets: list[dict], buildings: pd.DataFrame, listing_activity: dict[int, dict], live_keys: set[str], live_ids: set[int]) -> list[dict]:
    market_lookup = {market_key(row["city"], row["state_abbr"]): row for row in markets}
    key_counts = Counter(buildings["normalized_building_key"].tolist())
    records = []

    numeric_cols = ["estimated_activity", "building_size", "floors", "units", "min_size", "max_size"]
    for col in numeric_cols:
        buildings[col] = pd.to_numeric(buildings[col], errors="coerce").fillna(0)
    buildings["geo_ok"] = buildings.apply(lambda row: valid_geo(row["lat"], row["lng"]), axis=1)
    buildings["size_signal"] = (buildings["building_size"] > 0) | (buildings["min_size"] > 0) | (buildings["max_size"] > 0)
    buildings["multi_tenant_signal"] = (buildings["estimated_activity"] >= 10) | (buildings["units"] >= 5) | (buildings["floors"] >= 3)
    buildings["representative_score"] = (
        buildings["estimated_activity"].clip(upper=100)
        + buildings["geo_ok"].astype(int) * 20
        + buildings["size_signal"].astype(int) * 8
        + buildings["multi_tenant_signal"].astype(int) * 10
    )

    for key, group in buildings.groupby("market_key"):
        market = market_lookup.get(key, {})
        group = group.sort_values(["representative_score", "estimated_activity"], ascending=False).head(BUILDINGS_PER_MARKET)
        for _, row in group.iterrows():
            bid = int(row["building_id"])
            mix_counter = listing_activity.get(bid, {}).get("space_types", Counter())
            mix = [
                {"space_type": space_type, "count": int(count)}
                for space_type, count in mix_counter.most_common()
                if space_type and space_type != "other"
            ][:5]
            if not mix:
                mix = [{"space_type": "other", "count": int(row["estimated_activity"])}]

            dup = duplicate_risk(key_counts, row["normalized_building_key"])
            status, reason = status_for(row, live_keys, live_ids, dup)
            records.append({
                "city": row["city"],
                "state_abbr": row["state"],
                "normalized_building_key": row["normalized_building_key"],
                "address": row["address"],
                "estimated_historical_listing_activity": int(row["estimated_activity"]),
                "inferred_space_type_mix": mix,
                "cluster_context": cluster_context({**row.to_dict(), "likely_multi_tenant": row["multi_tenant_signal"]}, market.get("market_profile", "")),
                "coordinate_quality": "high" if row["geo_ok"] else "missing",
                "duplicate_risk": dup,
                "current_live_overlap": "yes" if bid in live_ids or row["normalized_building_key"] in live_keys else "no",
                "suggested_status": status,
                "suggested_reason": reason,
            })
    return records


def md_table(headers: list[str], rows: list[list]) -> str:
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join(["---"] * len(headers)) + " |"]
    for row in rows:
        lines.append("| " + " | ".join(str(value) for value in row) + " |")
    return "\n".join(lines)


def write_report(markets: list[dict], records: list[dict]) -> None:
    by_market = defaultdict(list)
    for record in records:
        by_market[(record["city"], record["state_abbr"])].append(record)

    selected_rows = []
    for market in markets:
        recs = by_market[(market["city"], market["state_abbr"])]
        selected_rows.append([
            f"{market['city']}, {market['state_abbr']}",
            market.get("cluster_strength"),
            market.get("market_profile"),
            market.get("estimated_normalized_building_count"),
            market.get("estimated_listing_activity"),
            market.get("current_live_building_overlap"),
            market.get("hidden_density_ratio"),
            len(recs),
            sum(1 for r in recs if r["suggested_status"] == "expand"),
        ])

    status_counts = Counter(record["suggested_status"] for record in records)
    profile_rows = []
    for profile, count in Counter(m.get("market_profile", "uncertain") for m in markets).most_common():
        profile_records = [
            record for record in records
            if next((m for m in markets if m["city"] == record["city"] and m["state_abbr"] == record["state_abbr"]), {}).get("market_profile") == profile
        ]
        profile_rows.append([profile, count, len(profile_records), sum(1 for r in profile_records if r["suggested_status"] == "expand")])

    weak_coverage = sorted(
        markets,
        key=lambda row: (float(row.get("hidden_density_ratio") or 0), float(row.get("ecosystem_score") or 0)),
        reverse=True,
    )[:12]
    weak_coverage_names = ", ".join(f"{row['city']}, {row['state_abbr']}" for row in weak_coverage[:10])
    neighborhood_ready_names = ", ".join(
        f"{row['city']}, {row['state_abbr']}"
        for row in markets
        if row.get("likely_neighborhood_ready")
    )
    office_markets = []
    industrial_markets = []
    for market in markets:
        recs = by_market[(market["city"], market["state_abbr"])]
        space_counter = Counter()
        for record in recs:
            for item in record["inferred_space_type_mix"]:
                space_counter[item["space_type"]] += item["count"]
        if space_counter.get("office", 0) >= max(20, space_counter.get("industrial", 0)):
            office_markets.append(f"{market['city']}, {market['state_abbr']}")
        if (
            market.get("market_profile") in {"flex/logistics", "industrial_corridor"}
            or space_counter.get("industrial", 0) >= 20
            or space_counter.get("flex", 0) >= 10
        ):
            industrial_markets.append(f"{market['city']}, {market['state_abbr']}")

    md = [
        "# Ecosystem Building Expansion Phase 1",
        "",
        "This is a representative building expansion plan for the strongest commercial ecosystems. It does not generate pages, revive stale listings, expose pricing, or claim current availability.",
        "",
        "## A. Selected Ecosystem Markets",
        "",
        md_table(
            ["market", "cluster", "profile", "legacy_buildings", "listing_activity", "live_overlap", "hidden_density_ratio", "candidate_rows", "expand_rows"],
            selected_rows,
        ),
        "",
        "## B. Estimated Representative Building Counts",
        "",
        f"- Selected markets: {len(markets)}",
        f"- Representative candidate rows: {len(records)}",
        f"- Suggested expand rows: {status_counts.get('expand', 0)}",
        f"- Suggested review rows: {status_counts.get('review', 0)}",
        f"- Suggested suppress rows: {status_counts.get('suppress', 0)}",
        f"- Per-market cap: {BUILDINGS_PER_MARKET}",
        "",
        "## C. Strongest Ecosystem Expansion Opportunities",
        "",
        f"The strongest opportunities combine high historical listing activity, dense normalized building keys, strong geocoding, and weak current live coverage. In this selected set, the clearest weak-live-coverage opportunities are: {weak_coverage_names}.",
        "",
        "## D. Strongest Neighborhood-Ready Ecosystems",
        "",
        neighborhood_ready_names or "No selected markets were marked neighborhood-ready in the current scoring pass.",
        "",
        "## E. Strongest Suburban Office Ecosystems",
        "",
        "This first pass is market-level rather than corridor-level, but office-heavy representative sets should be reviewed first in: "
        + (", ".join(office_markets[:12]) if office_markets else "markets with office-dominant candidate mixes after manual review")
        + ". Future corridor scoring should split suburban office nodes from downtown cores where city boundaries are too broad.",
        "",
        "## F. Strongest Industrial/Logistics Ecosystems",
        "",
        "Industrial and flex/logistics opportunities are strongest where decoded code `3` and medium-confidence flex code `12` appear in the inferred mix. In this selected set, review industrial/logistics candidates first in: "
        + (", ".join(industrial_markets[:12]) if industrial_markets else "the flex/logistics profiled markets")
        + ".",
        "",
        "## G. Markets Where Current Live Coverage Is Weakest",
        "",
        md_table(
            ["market", "legacy_buildings", "live_overlap", "hidden_density_ratio", "profile"],
            [[f"{m['city']}, {m['state_abbr']}", m.get("estimated_normalized_building_count"), m.get("current_live_building_overlap"), m.get("hidden_density_ratio"), m.get("market_profile")] for m in weak_coverage],
        ),
        "",
        "## H. Duplicate/Staleness Risks",
        "",
        "- Duplicate risk is based on normalized address, city, and state collisions inside the selected market subset.",
        "- `current_live_overlap` is used as a review flag so expansion does not duplicate existing active Rofo building pages.",
        "- Historical listing activity is a durability and market-intensity signal only. It is not live inventory.",
        "- Land and other/unknown space types should be handled carefully because they do not always fit normal building-page UX.",
        "- Code `12` is mapped to flex only at medium confidence and should be reinforced with text signals before public display.",
        "",
        "## I. Suggested Rollout Batch Sizing",
        "",
        "- First internal review batch: 150 to 250 buildings across 5 to 8 ecosystems.",
        "- First production-safe expansion batch, after manual review: 50 to 100 representative buildings.",
        "- Keep per-market launches small enough to inspect manually, especially in markets with high duplicate risk or weak current live coverage.",
        "",
        "## Rollout Strategy",
        "",
        "- Start ecosystem-by-ecosystem rather than nationally. This keeps QA focused and lets city/neighborhood context improve alongside building coverage.",
        "- Launch city-level improvements before broad building expansion where the city page is thin or absent.",
        "- Add representative buildings before semantic enrichment, then layer reviewed semantic identity on top once stable IDs and address matching are verified.",
        "- Expand neighborhoods only in ecosystems with strong city/state resolution and enough reviewed representative buildings.",
        "- Do not surface individual historical listings, suites, rents, or availability language.",
        "",
        "## Output Dataset",
        "",
        f"- `data/peter/research/ecosystem_building_expansion_phase1.json` contains {len(records)} lightweight representative candidate records.",
        "- The dataset intentionally omits raw listing copy, suite-level data, pricing, and full raw building imports.",
    ]

    REPORT_MD.write_text("\n".join(md) + "\n")


def main() -> None:
    ensure_dirs()
    RESEARCH_DIR.mkdir(parents=True, exist_ok=True)

    markets = select_markets()
    selected_keys = {market_key(row["city"], row["state_abbr"]) for row in markets}
    space_lookup = load_space_type_lookup()
    live_keys, live_ids = load_current_live_keys()

    listing_activity = aggregate_listing_activity(selected_keys, space_lookup)
    buildings = load_buildings(selected_keys, listing_activity)
    records = create_records(markets, buildings, listing_activity, live_keys, live_ids)

    records = sorted(
        records,
        key=lambda row: (
            row["city"],
            row["state_abbr"],
            {"expand": 0, "review": 1, "suppress": 2}.get(row["suggested_status"], 3),
            -row["estimated_historical_listing_activity"],
        ),
    )

    OUTPUT_JSON.write_text(json.dumps(records, indent=2) + "\n")
    write_report(markets, records)

    print(f"selected_markets={len(markets)}")
    print(f"records={len(records)}")
    print(f"expand={sum(1 for r in records if r['suggested_status'] == 'expand')}")
    print(f"review={sum(1 for r in records if r['suggested_status'] == 'review')}")
    print(f"suppress={sum(1 for r in records if r['suggested_status'] == 'suppress')}")
    print(OUTPUT_JSON)
    print(REPORT_MD)


if __name__ == "__main__":
    main()
