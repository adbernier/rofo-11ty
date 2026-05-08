from __future__ import annotations

import csv
import json
import re
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

from common import DERIVED_DIR, REPORTS_DIR, ensure_dirs


ROOT = Path(__file__).resolve().parents[2]
SEMANTIC_CSV = DERIVED_DIR / "building_semantic_identity_v1.csv"
QUALITY_CSV = DERIVED_DIR / "building_semantic_signal_quality_review.csv"
OUTPUT_JSON = DERIVED_DIR / "active_building_semantic_bridge.json"
OUTPUT_CSV = DERIVED_DIR / "active_building_semantic_bridge.csv"
REPORT_MD = REPORTS_DIR / "active_building_semantic_bridge_review.md"

APPROVED_SIGNALS = {
    "warehouse_distribution",
    "retail_storefront",
    "transit_oriented",
    "loading_dock",
    "freeway_access",
    "medical_office",
    "campus_environment",
    "showroom",
    "creative_office",
    "waterfront",
    "professional_services",
    "boutique_office",
    "historic_building",
}

SUPPRESSED_SIGNALS = {
    "current_parking",
    "furnished",
    "plug_and_play",
    "nonprofit",
    "current_buildout",
    "move_in_ready",
    "pricing_oriented",
}

PUBLIC_LABELS = {
    "warehouse_distribution": "Warehouse or distribution fit",
    "retail_storefront": "Retail storefront environment",
    "transit_oriented": "Transit oriented",
    "loading_dock": "Loading oriented",
    "freeway_access": "Freeway access context",
    "medical_office": "Medical office fit",
    "campus_environment": "Campus environment",
    "showroom": "Showroom fit",
    "creative_office": "Creative office character",
    "waterfront": "Waterfront context",
    "professional_services": "Professional services fit",
    "boutique_office": "Boutique office character",
    "historic_building": "Historic building character",
}

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
    normalized_address = normalize_address(address)
    normalized_city = normalize_city(city)
    normalized_state = normalize_state(state)
    if not normalized_address or not normalized_city or not normalized_state:
        return ""
    return f"{normalized_address}|{normalized_city}|{normalized_state}"


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


def load_quality_recommendations() -> dict[str, str]:
    if not QUALITY_CSV.exists():
        return {}
    with QUALITY_CSV.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        return {row["signal_key"]: row["production_recommendation"] for row in reader}


def semantic_score(record: dict) -> tuple:
    confidences = record.get("confidence", {})
    supports = record.get("support_counts", {})
    return (
        len(record.get("approved_signals", [])),
        sum(float(confidences.get(key, 0)) for key in record.get("approved_signals", [])),
        sum(int(supports.get(key, 0)) for key in record.get("approved_signals", [])),
    )


def load_semantic_records() -> tuple[dict[str, dict], dict[str, list[dict]], Counter]:
    by_id = {}
    by_address = defaultdict(list)
    signal_counts = Counter()
    quality = load_quality_recommendations()

    with SEMANTIC_CSV.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            signal_keys = [key for key in (row.get("semantic_identity_signals") or "").split("|") if key]
            approved = [
                key for key in signal_keys
                if key in APPROVED_SIGNALS
                and key not in SUPPRESSED_SIGNALS
                and quality.get(key, "approve") == "approve"
            ]
            if not approved:
                continue

            confidence = parse_json_dict(row.get("confidence_per_signal", ""))
            support_counts = parse_json_dict(row.get("supporting_listing_count_per_signal", ""))
            evidence = parse_json_dict(row.get("supporting_building_evidence", ""))
            record = {
                "building_id": clean(row.get("building_id")),
                "building_name": clean(row.get("building_name")),
                "address": clean(row.get("address")),
                "city": clean(row.get("city")),
                "state": normalize_state(row.get("state")),
                "representative_space_types": [value for value in (row.get("representative_space_types") or "").split("|") if value],
                "approved_signals": approved,
                "approved_signal_labels": [PUBLIC_LABELS.get(key, key.replace("_", " ").title()) for key in approved],
                "confidence": {key: float(confidence.get(key, 0)) for key in approved},
                "support_counts": {key: int(support_counts.get(key, 0)) for key in approved},
                "supporting_building_evidence": {key: evidence.get(key, []) for key in approved},
                "historical_marketing_themes": [value for value in (row.get("historical_marketing_themes") or "").split("|") if value],
                "stability_classification": row.get("stability_classification", ""),
            }
            if record["building_id"]:
                by_id[record["building_id"]] = record
            key = address_key(record["address"], record["city"], record["state"])
            if key:
                by_address[key].append(record)
            for signal_key in approved:
                signal_counts[signal_key] += 1

    for key, records in list(by_address.items()):
        records.sort(key=semantic_score, reverse=True)
    return by_id, by_address, signal_counts


def production_building_id(building: dict) -> str:
    for key in ("semantic_source_building_id", "building_id", "b_id", "id", "legacy_building_id"):
        value = clean(building.get(key))
        if value:
            return value
    return ""


def match_active_buildings(active_buildings: list[dict], by_id: dict, by_address: dict) -> tuple[list[dict], Counter]:
    bridge = []
    match_counts = Counter()
    used_semantic_ids = Counter()

    for building in active_buildings:
        prod_id = production_building_id(building)
        semantic = by_id.get(prod_id) if prod_id else None
        match_method = "building_id" if semantic else ""
        notes = []

        if not semantic:
            key = address_key(building.get("address"), building.get("city"), building.get("state_abbr") or building.get("state"))
            candidates = by_address.get(key, [])
            if candidates:
                semantic = candidates[0]
                match_method = "address_fallback"
                if len(candidates) > 1:
                    notes.append(f"{len(candidates)} semantic records share normalized address; selected highest scoring match.")

        if not semantic:
            continue

        semantic_id = semantic["building_id"]
        used_semantic_ids[semantic_id] += 1
        if used_semantic_ids[semantic_id] > 1:
            notes.append("Semantic record matched more than one active production building.")

        if not prod_id:
            notes.append("Active production building record does not currently expose building_id.")
        if normalize_address(building.get("address")) != normalize_address(semantic.get("address")):
            notes.append("Address normalized for fallback match; verify before public use.")
        if not semantic.get("supporting_building_evidence"):
            notes.append("Signals come from historical listing evidence; no direct building-level evidence in bridge record.")

        approved = semantic["approved_signals"]
        confidence_values = [semantic["confidence"].get(key, 0) for key in approved]
        support_values = [semantic["support_counts"].get(key, 0) for key in approved]
        bridge.append({
            "building_id": semantic_id,
            "production_building_id": prod_id,
            "building_name": clean(building.get("display_name") or building.get("name") or semantic.get("building_name")),
            "semantic_building_name": semantic.get("building_name", ""),
            "address": clean(building.get("address") or semantic.get("address")),
            "city": clean(building.get("city") or semantic.get("city")),
            "state": normalize_state(building.get("state_abbr") or building.get("state") or semantic.get("state")),
            "building_path": clean(building.get("building_path")),
            "approved_signals": approved,
            "approved_signal_labels": semantic["approved_signal_labels"],
            "confidence": semantic["confidence"],
            "average_confidence": round(sum(confidence_values) / len(confidence_values), 3) if confidence_values else 0,
            "support_counts": semantic["support_counts"],
            "total_supporting_listing_count": sum(support_values),
            "supporting_building_evidence": semantic["supporting_building_evidence"],
            "match_method": match_method,
            "data_quality_notes": notes,
        })
        match_counts[match_method] += 1

    bridge.sort(key=lambda row: (
        len(row["approved_signals"]),
        row["average_confidence"],
        row["total_supporting_listing_count"],
    ), reverse=True)
    return bridge, match_counts


def write_bridge_outputs(bridge: list[dict]) -> None:
    OUTPUT_JSON.write_text(json.dumps(bridge, indent=2, ensure_ascii=False), encoding="utf-8")

    fields = [
        "building_id",
        "production_building_id",
        "building_name",
        "semantic_building_name",
        "address",
        "city",
        "state",
        "building_path",
        "approved_signals",
        "approved_signal_labels",
        "confidence",
        "average_confidence",
        "support_counts",
        "total_supporting_listing_count",
        "supporting_building_evidence",
        "match_method",
        "data_quality_notes",
    ]
    with OUTPUT_CSV.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        for row in bridge:
            writer.writerow({
                **row,
                "approved_signals": "|".join(row["approved_signals"]),
                "approved_signal_labels": "|".join(row["approved_signal_labels"]),
                "confidence": json.dumps(row["confidence"], sort_keys=True),
                "support_counts": json.dumps(row["support_counts"], sort_keys=True),
                "supporting_building_evidence": json.dumps(row["supporting_building_evidence"], ensure_ascii=False, sort_keys=True),
                "data_quality_notes": " | ".join(row["data_quality_notes"]),
            })


def md_table(rows: list[dict], cols: list[str]) -> str:
    lines = ["| " + " | ".join(cols) + " |", "| " + " | ".join(["---"] * len(cols)) + " |"]
    for row in rows:
        values = [str(row.get(col, "")).replace("|", "\\|").replace("\n", " ") for col in cols]
        lines.append("| " + " | ".join(values) + " |")
    return "\n".join(lines)


def write_report(active_count: int, bridge: list[dict], match_counts: Counter) -> None:
    signal_counts = Counter()
    for row in bridge:
        signal_counts.update(row["approved_signals"])

    examples = []
    for row in bridge[:25]:
        examples.append({
            "building": row["building_name"],
            "city": row["city"],
            "state": row["state"],
            "signals": ", ".join(row["approved_signals"][:5]),
            "avg_conf": row["average_confidence"],
            "support": row["total_supporting_listing_count"],
            "match": row["match_method"],
            "path": row["building_path"],
        })

    top_signals = [
        {"signal": key, "active_building_count": value}
        for key, value in signal_counts.most_common(20)
    ]

    lines = [
        "# Active Building Semantic Bridge Review",
        "",
        "## Purpose",
        "",
        "This bridge maps reviewed semantic building identity signals onto current Rofo active building pages. It is a production bridge dataset only. It does not modify frontend templates and does not imply current availability, pricing, suites, or active inventory.",
        "",
        "## Public Language Rule",
        "",
        "Use this data only for language such as `Historically associated with...`, `Commonly positioned for...`, or `Rofo has seen historical signals for...`. Do not use it for `available now`, `currently has`, pricing, suite, or move-in-ready claims.",
        "",
        "## Match Summary",
        "",
        f"- Total active production building pages: {active_count:,}",
        f"- Matched by building_id: {match_counts.get('building_id', 0):,}",
        f"- Matched by normalized address fallback: {match_counts.get('address_fallback', 0):,}",
        f"- Active buildings with approved semantic signals: {len(bridge):,}",
        "",
        "## Top Approved Signals Among Active Buildings",
        "",
        md_table(top_signals, ["signal", "active_building_count"]),
        "",
        "## 25 Best Examples for Review",
        "",
        md_table(examples, ["building", "city", "state", "signals", "avg_conf", "support", "match", "path"]),
        "",
        "## Risks and Caveats Before Frontend Use",
        "",
        "- Current production building page records do not expose original legacy `building_id` from source generation. Low-risk reviewed pages may expose an internal `semantic_source_building_id`; those rows can match by ID. Remaining rows still rely on normalized address fallback.",
        "- Address fallback can produce false positives when multiple legacy records share one address or when suite-level addresses were normalized.",
        "- Signals are historical identity signals and must not be used as current listing, pricing, or availability claims.",
        "- Some semantic evidence comes from historical listing text rather than direct building-level descriptions.",
        "- Public display should start with a very small whitelist and reviewed examples, not the entire bridge.",
        "",
        "## Recommended Next Step",
        "",
        "Review the top 25 examples and a few lower-confidence random examples. If quality is acceptable, create a tiny frontend prototype that reads a reviewed subset and renders semantic chips with conservative historical language.",
    ]
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    ensure_dirs()
    active_buildings = load_active_building_pages()
    by_id, by_address, _ = load_semantic_records()
    bridge, match_counts = match_active_buildings(active_buildings, by_id, by_address)
    write_bridge_outputs(bridge)
    write_report(len(active_buildings), bridge, match_counts)

    signal_counts = Counter()
    for row in bridge:
        signal_counts.update(row["approved_signals"])

    print(f"Total active production building pages: {len(active_buildings):,}")
    print(f"Matched by building_id: {match_counts.get('building_id', 0):,}")
    print(f"Matched by address fallback: {match_counts.get('address_fallback', 0):,}")
    print(f"Active buildings with approved signals: {len(bridge):,}")
    print("Top signals among active buildings:")
    for signal_key, count in signal_counts.most_common(10):
        print(f"- {signal_key}: {count:,}")
    print(f"Wrote {OUTPUT_JSON}")
    print(f"Wrote {OUTPUT_CSV}")
    print(f"Wrote {REPORT_MD}")


if __name__ == "__main__":
    main()
