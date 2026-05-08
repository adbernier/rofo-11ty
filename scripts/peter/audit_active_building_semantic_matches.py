from __future__ import annotations

import csv
import json
import re
import subprocess
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path

from common import DERIVED_DIR, REPORTS_DIR, ensure_dirs


ROOT = Path(__file__).resolve().parents[2]
BRIDGE_JSON = DERIVED_DIR / "active_building_semantic_bridge.json"
SEMANTIC_CSV = DERIVED_DIR / "building_semantic_identity_v1.csv"
OUTPUT_CSV = DERIVED_DIR / "active_building_semantic_match_review.csv"
REPORT_MD = REPORTS_DIR / "active_building_semantic_match_quality.md"

BROAD_SIGNALS = {"retail_storefront", "restaurant_food", "fitness", "financial_services"}
REVIEW_SIGNALS = {"retail_storefront", "showroom", "professional_services"}

STREET_REPLACEMENTS = {
    "street": "st",
    "st.": "st",
    "avenue": "ave",
    "ave.": "ave",
    "road": "rd",
    "rd.": "rd",
    "boulevard": "blvd",
    "blvd.": "blvd",
    "drive": "dr",
    "dr.": "dr",
    "parkway": "pkwy",
    "pkwy.": "pkwy",
    "place": "pl",
    "pl.": "pl",
    "court": "ct",
    "ct.": "ct",
    "lane": "ln",
    "ln.": "ln",
    "highway": "hwy",
    "hwy.": "hwy",
    "suite": "ste",
}


def clean(value) -> str:
    text = "" if value is None else str(value)
    return "" if text.lower() == "nan" else text.strip()


def normalize_name(value: str) -> str:
    text = clean(value).lower()
    text = text.replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    text = re.sub(r"\b(llc|inc|corp|corporation|building|center|centre|plaza|the)\b", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_address(value: str) -> str:
    text = clean(value).lower()
    text = text.replace("&", " and ")
    text = re.sub(r"#\s*\w+", " ", text)
    text = re.sub(r"\b(?:suite|ste|unit|floor|fl)\s+[a-z0-9-]+\b", " ", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    parts = [STREET_REPLACEMENTS.get(part, part) for part in text.split()]
    return " ".join(parts).strip()


def normalize_city(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", clean(value).lower()).strip()


def normalize_state(value: str) -> str:
    return clean(value).upper()


def address_key(address: str, city: str, state: str) -> str:
    address_norm = normalize_address(address)
    city_norm = normalize_city(city)
    state_norm = normalize_state(state)
    if not address_norm or not city_norm or not state_norm:
        return ""
    return f"{address_norm}|{city_norm}|{state_norm}"


def similarity(left: str, right: str) -> float:
    left_norm = normalize_name(left)
    right_norm = normalize_name(right)
    if not left_norm or not right_norm:
        return 0.0
    if left_norm == right_norm:
        return 1.0
    if left_norm in right_norm or right_norm in left_norm:
        return 0.88
    return round(SequenceMatcher(None, left_norm, right_norm).ratio(), 3)


def parse_json_dict(value: str) -> dict:
    if not value:
        return {}
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def load_active_building_pages() -> list[dict]:
    script = "const data=require('./_data/buildingPages.js'); process.stdout.write(JSON.stringify(data));"
    result = subprocess.run(
        ["node", "-e", script],
        cwd=ROOT,
        check=True,
        text=True,
        capture_output=True,
    )
    return json.loads(result.stdout)


def load_semantic_records() -> dict[str, dict]:
    records = {}
    with SEMANTIC_CSV.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            records[clean(row.get("building_id"))] = {
                "semantic_source_building_name": clean(row.get("building_name")),
                "semantic_source_address": clean(row.get("address")),
                "semantic_source_city": clean(row.get("city")),
                "semantic_source_state": normalize_state(row.get("state")),
                "semantic_signals": [value for value in (row.get("semantic_identity_signals") or "").split("|") if value],
                "confidence": parse_json_dict(row.get("confidence_per_signal", "")),
                "support_counts": parse_json_dict(row.get("supporting_listing_count_per_signal", "")),
            }
    return records


def production_lookup(active_buildings: list[dict]) -> dict[str, dict]:
    lookup = {}
    for building in active_buildings:
        path = clean(building.get("building_path"))
        if path:
            lookup[path] = building
    return lookup


def address_comparison(prod_address: str, prod_city: str, prod_state: str, sem_address: str, sem_city: str, sem_state: str) -> tuple[str, str, str]:
    prod_key = address_key(prod_address, prod_city, prod_state)
    sem_key = address_key(sem_address, sem_city, sem_state)
    if prod_key and sem_key and prod_key == sem_key:
        return "exact_normalized", prod_key, sem_key
    if normalize_address(prod_address) == normalize_address(sem_address) and normalize_state(prod_state) == normalize_state(sem_state):
        return "same_address_state_city_diff", prod_key, sem_key
    return "mismatch", prod_key, sem_key


def risk_for(row: dict, prod_shared_count: int, semantic_shared_count: int) -> tuple[str, list[str]]:
    notes = []
    signals = set(row["approved_signals"])
    avg_conf = float(row["average_confidence"] or 0)
    min_support = min(row["support_counts"].values() or [0])
    total_support = int(row["total_supporting_listing_count"] or 0)
    name_score = float(row["name_similarity_score"] or 0)

    if row["address_normalization_comparison"] != "exact_normalized":
        notes.append("normalized address comparison is not exact")
    if name_score < 0.35:
        notes.append("production and semantic building names differ materially")
    elif name_score < 0.6:
        notes.append("production and semantic building names only partially align")
    if prod_shared_count > 1:
        notes.append(f"{prod_shared_count} active production buildings share this normalized address")
    if semantic_shared_count > 1:
        notes.append(f"{semantic_shared_count} semantic records share this normalized address")
    if not clean(row["production_building_name"]) or not clean(row["semantic_source_building_name"]):
        notes.append("missing production or semantic building name")
    if signals and signals.issubset(BROAD_SIGNALS):
        notes.append("signals are broad tenant or amenity patterns and need manual review")
    elif signals.intersection(REVIEW_SIGNALS) and len(signals) <= 2:
        notes.append("limited signal set includes context-dependent signals")
    if avg_conf < 0.62:
        notes.append("average confidence below preferred bridge threshold")
    if min_support < 3:
        notes.append("at least one signal has low support count")
    if total_support < 10:
        notes.append("low total historical support")

    high_conditions = [
        row["address_normalization_comparison"] == "mismatch",
        name_score < 0.25,
        semantic_shared_count > 2,
        prod_shared_count > 2,
        avg_conf < 0.58,
        total_support < 6,
    ]
    medium_conditions = [
        name_score < 0.6,
        semantic_shared_count > 1,
        prod_shared_count > 1,
        bool(signals.intersection(REVIEW_SIGNALS)),
        avg_conf < 0.68,
        min_support < 5,
    ]
    if any(high_conditions):
        return "high", notes
    if any(medium_conditions):
        return "medium", notes
    return "low", notes or ["strong address alignment, name alignment, confidence, and support"]


def build_review_rows() -> list[dict]:
    bridge = json.loads(BRIDGE_JSON.read_text(encoding="utf-8"))
    semantic_records = load_semantic_records()
    active_buildings = load_active_building_pages()
    active_by_path = production_lookup(active_buildings)

    prod_address_counts = Counter()
    for building in active_buildings:
        key = address_key(building.get("address"), building.get("city"), building.get("state_abbr") or building.get("state"))
        if key:
            prod_address_counts[key] += 1

    semantic_address_counts = Counter()
    for record in semantic_records.values():
        key = address_key(record["semantic_source_address"], record["semantic_source_city"], record["semantic_source_state"])
        if key:
            semantic_address_counts[key] += 1

    rows = []
    for bridge_row in bridge:
        building_path = clean(bridge_row.get("building_path"))
        production = active_by_path.get(building_path, {})
        semantic = semantic_records.get(clean(bridge_row.get("building_id")), {})

        prod_name = clean(production.get("display_name") or production.get("name") or bridge_row.get("building_name"))
        prod_address = clean(production.get("address") or bridge_row.get("address"))
        prod_city = clean(production.get("city") or bridge_row.get("city"))
        prod_state = normalize_state(production.get("state_abbr") or production.get("state") or bridge_row.get("state"))
        sem_name = semantic.get("semantic_source_building_name") or clean(bridge_row.get("semantic_building_name"))
        sem_address = semantic.get("semantic_source_address") or clean(bridge_row.get("address"))
        sem_city = semantic.get("semantic_source_city") or clean(bridge_row.get("city"))
        sem_state = semantic.get("semantic_source_state") or normalize_state(bridge_row.get("state"))

        comparison, prod_key, sem_key = address_comparison(prod_address, prod_city, prod_state, sem_address, sem_city, sem_state)
        row = {
            "production_building_name": prod_name,
            "semantic_source_building_name": sem_name,
            "production_address": prod_address,
            "production_city": prod_city,
            "production_state": prod_state,
            "semantic_source_address": sem_address,
            "semantic_source_city": sem_city,
            "semantic_source_state": sem_state,
            "production_building_path": building_path,
            "building_id": clean(bridge_row.get("building_id")),
            "approved_signals": bridge_row.get("approved_signals", []),
            "confidence": bridge_row.get("confidence", {}),
            "average_confidence": bridge_row.get("average_confidence", 0),
            "support_counts": bridge_row.get("support_counts", {}),
            "total_supporting_listing_count": bridge_row.get("total_supporting_listing_count", 0),
            "match_method": clean(bridge_row.get("match_method")),
            "address_normalization_comparison": comparison,
            "production_normalized_address_key": prod_key,
            "semantic_normalized_address_key": sem_key,
            "name_similarity_score": similarity(prod_name, sem_name),
            "production_shared_address_count": prod_address_counts.get(prod_key, 0),
            "semantic_shared_address_count": semantic_address_counts.get(sem_key, 0),
        }
        risk, notes = risk_for(row, row["production_shared_address_count"], row["semantic_shared_address_count"])
        row["risk_flag"] = risk
        row["review_notes"] = notes
        rows.append(row)

    risk_rank = {"low": 0, "medium": 1, "high": 2}
    rows.sort(key=lambda row: (
        risk_rank.get(row["risk_flag"], 9),
        -float(row["average_confidence"] or 0),
        -int(row["total_supporting_listing_count"] or 0),
        row["production_building_name"],
    ))
    return rows


def write_review_csv(rows: list[dict]) -> None:
    fields = [
        "production_building_name",
        "semantic_source_building_name",
        "production_address",
        "production_city",
        "production_state",
        "semantic_source_address",
        "semantic_source_city",
        "semantic_source_state",
        "production_building_path",
        "building_id",
        "approved_signals",
        "confidence",
        "average_confidence",
        "support_counts",
        "total_supporting_listing_count",
        "match_method",
        "address_normalization_comparison",
        "production_normalized_address_key",
        "semantic_normalized_address_key",
        "name_similarity_score",
        "production_shared_address_count",
        "semantic_shared_address_count",
        "risk_flag",
        "review_notes",
    ]
    with OUTPUT_CSV.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({
                **row,
                "approved_signals": "|".join(row["approved_signals"]),
                "confidence": json.dumps(row["confidence"], sort_keys=True),
                "support_counts": json.dumps(row["support_counts"], sort_keys=True),
                "review_notes": " | ".join(row["review_notes"]),
            })


def md_table(rows: list[dict], cols: list[str]) -> str:
    lines = ["| " + " | ".join(cols) + " |", "| " + " | ".join(["---"] * len(cols)) + " |"]
    for row in rows:
        values = [str(row.get(col, "")).replace("|", "\\|").replace("\n", " ") for col in cols]
        lines.append("| " + " | ".join(values) + " |")
    return "\n".join(lines)


def report_rows(rows: list[dict], risk: str, limit: int) -> list[dict]:
    selected = [row for row in rows if row["risk_flag"] == risk][:limit]
    return [
        {
            "production": row["production_building_name"],
            "semantic": row["semantic_source_building_name"],
            "city": row["production_city"],
            "state": row["production_state"],
            "signals": ", ".join(row["approved_signals"][:5]),
            "avg_conf": row["average_confidence"],
            "support": row["total_supporting_listing_count"],
            "name_score": row["name_similarity_score"],
            "notes": "; ".join(row["review_notes"][:2]),
        }
        for row in selected
    ]


def write_report(rows: list[dict]) -> None:
    risk_counts = Counter(row["risk_flag"] for row in rows)
    match_counts = Counter(row["match_method"] for row in rows)
    signal_counts = Counter()
    signal_risk_counts = defaultdict(Counter)
    for row in rows:
        signal_counts.update(row["approved_signals"])
        for signal in row["approved_signals"]:
            signal_risk_counts[signal][row["risk_flag"]] += 1

    cleanest = []
    needs_review = []
    for signal, total in signal_counts.most_common():
        low = signal_risk_counts[signal]["low"]
        medium = signal_risk_counts[signal]["medium"]
        high = signal_risk_counts[signal]["high"]
        low_share = low / total if total else 0
        item = {
            "signal": signal,
            "total": total,
            "low": low,
            "medium": medium,
            "high": high,
            "low_share": round(low_share, 2),
        }
        if low_share >= 0.45 and high <= max(2, total * 0.15):
            cleanest.append(item)
        else:
            needs_review.append(item)

    lines = [
        "# Active Building Semantic Match Quality",
        "",
        "## Purpose",
        "",
        "This audit evaluates whether normalized address fallback matching is trustworthy enough to use the active building semantic bridge. It is for internal review only and does not change production pages.",
        "",
        "## Summary",
        "",
        f"- Total matched bridge records audited: {len(rows):,}",
        f"- Likely safe low-risk matches: {risk_counts.get('low', 0):,}",
        f"- Questionable medium-risk matches: {risk_counts.get('medium', 0):,}",
        f"- High-risk matches: {risk_counts.get('high', 0):,}",
        f"- Matched by internal semantic source ID: {match_counts.get('building_id', 0):,}",
        f"- Matched by normalized address fallback: {match_counts.get('address_fallback', 0):,}",
        "",
        "The bridge is useful for internal review and limited prototype exploration, but it should not be treated as production-ready until representative low, medium, and high risk examples are manually reviewed. The low-risk subset can now match by internal `semantic_source_building_id`; the remaining records still depend on normalized address fallback.",
        "",
        "## Signal Quality by Match Risk",
        "",
        md_table([
            {
                "signal": signal,
                "total": counts,
                "low": signal_risk_counts[signal]["low"],
                "medium": signal_risk_counts[signal]["medium"],
                "high": signal_risk_counts[signal]["high"],
            }
            for signal, counts in signal_counts.most_common()
        ], ["signal", "total", "low", "medium", "high"]),
        "",
        "## Signals That Look Cleanest",
        "",
        md_table(cleanest, ["signal", "total", "low", "medium", "high", "low_share"]),
        "",
        "## Signals Needing More Review",
        "",
        md_table(needs_review, ["signal", "total", "low", "medium", "high", "low_share"]),
        "",
        "## 50 Strongest Low-Risk Examples",
        "",
        md_table(report_rows(rows, "low", 50), ["production", "semantic", "city", "state", "signals", "avg_conf", "support", "name_score", "notes"]),
        "",
        "## 25 Medium-Risk Examples",
        "",
        md_table(report_rows(rows, "medium", 25), ["production", "semantic", "city", "state", "signals", "avg_conf", "support", "name_score", "notes"]),
        "",
        "## 25 High-Risk Examples",
        "",
        md_table(report_rows(rows, "high", 25), ["production", "semantic", "city", "state", "signals", "avg_conf", "support", "name_score", "notes"]),
        "",
        "## Risk Rules Used",
        "",
        "- High risk: address mismatch, very low name similarity, shared address ambiguity above two records, low average confidence, or very low support.",
        "- Medium risk: partial name mismatch, shared address ambiguity, context-dependent signals, average confidence below 0.68, or low per-signal support.",
        "- Low risk: exact normalized address, stronger name alignment, no shared-address ambiguity, stronger confidence, and stronger support.",
        "",
        "## Recommendation",
        "",
        "Use the bridge for internal review now. For limited prototype UI, only use manually reviewed low-risk rows with `semantic_source_building_id` and conservative historical language. Before broader production use, regenerate the production building source data with original legacy `building_id` preserved so the bridge can move beyond reviewed address-derived IDs.",
    ]
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    ensure_dirs()
    rows = build_review_rows()
    write_review_csv(rows)
    write_report(rows)
    risk_counts = Counter(row["risk_flag"] for row in rows)
    print(f"Audited bridge records: {len(rows):,}")
    print(f"Low risk: {risk_counts.get('low', 0):,}")
    print(f"Medium risk: {risk_counts.get('medium', 0):,}")
    print(f"High risk: {risk_counts.get('high', 0):,}")
    print(f"Wrote {OUTPUT_CSV}")
    print(f"Wrote {REPORT_MD}")


if __name__ == "__main__":
    main()
