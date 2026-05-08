from __future__ import annotations

import csv
import html
import json
import math
import re
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd

from common import DERIVED_DIR, REPORTS_DIR, ensure_dirs
from extract_raw_listing_descriptions import detect_signals, iter_listing_rows


LISTINGS_SQL_PATH = Path.home() / "rofo-raw-inspection" / "listings_v01a" / "listings_v01a.sql"
BUILDINGS_SQL_PATH = Path.home() / "rofo-raw-inspection" / "buildings_original_v01a" / "buildings_original_v01a.sql"

OUTPUT_JSON = DERIVED_DIR / "building_semantic_identity_v1.json"
OUTPUT_CSV = DERIVED_DIR / "building_semantic_identity_v1.csv"
PILOT_JSON = DERIVED_DIR / "building_semantic_identity_pilot.json"
REPORT_MD = REPORTS_DIR / "building_semantic_identity_v1.md"


LISTING_COLUMNS = [
    "l_id", "b_id", "p_id", "l_name", "l_suite", "l_broker_id", "l_space_type",
    "l_lease_type", "l_creation_date", "l_last_update_date", "l_description",
    "l_sqft_price", "l_price_sqft", "l_price_selection", "l_price_type", "l_sqft",
    "l_divisible", "l_status", "l_featured", "l_date_available",
    "l_sublease_expiration", "l_tags", "l_promo_title", "l_promo_details", "c_id",
    "l_zipcode", "l_glat", "l_glng", "l_type", "l_so_featured", "l_can_expire",
    "l_source", "l_vendor_listing_id", "l_lms_feed_id", "is_catylist", "is_tenx",
    "l_qrcode", "l_external_url", "l_golive_time", "l_expire_time", "cl_url",
    "cl_posttime", "international", "admin_status", "admin_reason",
]

BUILDING_COLUMNS = [
    "b_id", "n_id", "c_id", "county_id", "p_id", "bh_id", "b_userpost_id",
    "here_id", "b_name", "b_address", "b_street_number", "b_street_name",
    "b_zipcode", "b_description", "b_address_search", "b_owner_email",
    "b_owner_fullname", "b_owner_phone", "b_amenities", "b_types_of_use", "b_class",
    "b_year_built", "b_property_size", "b_floors_num", "b_floor_size",
    "b_units_num", "b_min_size", "b_max_size", "b_glat", "b_glng",
    "b_new_construction", "b_recommended", "is_active", "not_dup", "redirect_id",
    "b_gpov", "b_google_map", "last_modified",
]


SIGNAL_MODEL = {
    "creative_office": {"label": "Creative office", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.58},
    "exposed_brick": {"label": "Exposed brick", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.6},
    "brick_and_timber": {"label": "Brick and timber", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 1, "minimum_confidence": 0.62},
    "class_a": {"label": "Class A environment", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.6},
    "boutique_office": {"label": "Boutique office", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.58},
    "medical": {"identity_key": "medical_office", "label": "Medical office fit", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.58},
    "biotech_lab": {"label": "Biotech or lab fit", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.6},
    "showroom": {"label": "Showroom fit", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.58},
    "retail_storefront": {"label": "Retail storefront environment", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 3, "minimum_confidence": 0.58},
    "restaurant_food": {"label": "Restaurant or food-service fit", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 3, "minimum_confidence": 0.58},
    "warehouse_distribution": {"label": "Warehouse or distribution fit", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.58},
    "loading_dock": {"label": "Loading-oriented building", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 1, "minimum_confidence": 0.58},
    "high_clearance": {"label": "High-clearance space pattern", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 1, "minimum_confidence": 0.6},
    "high_ceilings": {"label": "High-ceiling environment", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.58},
    "heavy_power": {"label": "Heavy power signal", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 1, "minimum_confidence": 0.62},
    "flex_rd": {"label": "Flex or R&D fit", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.58},
    "campus_environment": {"label": "Campus environment", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.58},
    "transit_adjacent": {"identity_key": "transit_oriented", "label": "Transit-oriented location", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.58},
    "freeway_access": {"label": "Freeway-access location", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.58},
    "waterfront": {"label": "Waterfront context", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 1, "minimum_confidence": 0.58},
    "tech_startup": {"identity_key": "startup_friendly", "label": "Startup-friendly pattern", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 3, "minimum_confidence": 0.6},
    "professional_services": {"label": "Professional services pattern", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 3, "minimum_confidence": 0.58},
    "financial_services": {"label": "Financial services pattern", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 3, "minimum_confidence": 0.6},
    "law_firm": {"label": "Law firm pattern", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.6},
    "fitness": {"label": "Fitness or wellness fit", "stable": True, "production_safe": True, "transient": False, "minimum_support_count": 2, "minimum_confidence": 0.58},
    "parking": {"identity_key": "current_parking", "label": "Parking mentioned historically", "stable": False, "production_safe": False, "transient": True, "minimum_support_count": 5, "minimum_confidence": 0.72},
    "furnished": {"label": "Furnished mentioned historically", "stable": False, "production_safe": False, "transient": True, "minimum_support_count": 2, "minimum_confidence": 0.72},
    "plug_and_play": {"label": "Plug and play mentioned historically", "stable": False, "production_safe": False, "transient": True, "minimum_support_count": 2, "minimum_confidence": 0.72},
    "natural_light": {"label": "Natural light mentioned historically", "stable": False, "production_safe": False, "transient": True, "minimum_support_count": 3, "minimum_confidence": 0.7},
    "nonprofit": {"label": "Nonprofit tenant pattern", "stable": False, "production_safe": False, "transient": False, "minimum_support_count": 3, "minimum_confidence": 0.65},
}

for raw_signal_key, signal_model in list(SIGNAL_MODEL.items()):
    mapped_key = signal_model.get("identity_key")
    if mapped_key and mapped_key not in SIGNAL_MODEL:
        SIGNAL_MODEL[mapped_key] = {**signal_model, "source_signal_key": raw_signal_key}

SPACE_TYPE_LABELS = {
    1: "office",
    2: "retail",
    3: "industrial",
    8: "land/other",
    9: "specialty",
    10: "other",
    11: "hospitality",
    12: "flex/mixed",
    13: "coworking/executive suite",
}


def decode_escape(char: str) -> str:
    return {"n": "\n", "r": "\r", "t": "\t", "0": "\0", "\\": "\\", "'": "'", '"': '"'}.get(char, char)


def convert_sql_value(token: str):
    value = token.strip()
    if value.upper() == "NULL":
        return None
    if value == "":
        return ""
    if re.fullmatch(r"-?\d+", value):
        try:
            return int(value)
        except ValueError:
            return value
    if re.fullmatch(r"-?\d+\.\d+", value):
        try:
            return float(value)
        except ValueError:
            return value
    return value


def parse_values_blob(blob: str):
    row = None
    token_parts = []
    in_quote = False
    escaped = False
    for char in blob:
        if row is None:
            if char == "(":
                row = []
                token_parts = []
            continue
        if escaped:
            token_parts.append(decode_escape(char))
            escaped = False
            continue
        if in_quote and char == "\\":
            escaped = True
            continue
        if char == "'":
            in_quote = not in_quote
            continue
        if char == "," and not in_quote:
            row.append(convert_sql_value("".join(token_parts)))
            token_parts = []
            continue
        if char == ")" and not in_quote:
            row.append(convert_sql_value("".join(token_parts)))
            yield row
            row = None
            token_parts = []
            continue
        token_parts.append(char)


def iter_sql_insert_rows(path: Path, table_name: str):
    marker = f"INSERT INTO `{table_name}` VALUES "
    carry = ""
    with path.open("r", encoding="utf-8", errors="replace") as fh:
        while True:
            chunk = fh.read(4 * 1024 * 1024)
            if not chunk:
                break
            search = carry + chunk
            start = 0
            while True:
                marker_index = search.find(marker, start)
                if marker_index == -1:
                    break
                values_start = marker_index + len(marker)
                next_marker = search.find(marker, values_start)
                end = next_marker if next_marker != -1 else search.rfind(";")
                if end == -1 or end < values_start:
                    break
                blob = search[values_start:end]
                yield from parse_values_blob(blob)
                start = end + 1
            carry = search[-(len(marker) + 1024):]


def clean_text(value) -> str:
    text = "" if value is None else str(value)
    text = html.unescape(text)
    text = re.sub(r"(?i)<br\s*/?>|</p>", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace("â€¢", " ").replace("Â", "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def epoch_year(value) -> int | None:
    try:
        value = int(value)
    except Exception:
        return None
    if value <= 0:
        return None
    return 1970 + int(value / 31557600)


def identity_key(signal_key: str) -> str:
    return SIGNAL_MODEL.get(signal_key, {}).get("identity_key", signal_key)


def source_weight(source: str) -> float:
    return 0.12 if source == "USR" else 0.06


def init_signal_stats() -> dict:
    return {
        "supporting_listing_ids": set(),
        "supporting_listing_count": 0,
        "supporting_building_evidence": [],
        "evidence": [],
        "sources": set(),
        "years": set(),
        "confidence": 0.0,
    }


def update_signal(stats: dict, listing_id, source, year, evidence, field_sources) -> None:
    if listing_id and listing_id not in stats["supporting_listing_ids"]:
        stats["supporting_listing_ids"].add(listing_id)
        stats["supporting_listing_count"] += 1
    if source:
        stats["sources"].add(str(source))
    if year:
        stats["years"].add(year)
    for item in evidence:
        if item and item not in stats["evidence"] and len(stats["evidence"]) < 6:
            stats["evidence"].append(item)
    if any(str(field).startswith("building") for field in field_sources):
        for item in evidence:
            if item and item not in stats["supporting_building_evidence"] and len(stats["supporting_building_evidence"]) < 4:
                stats["supporting_building_evidence"].append(item)


def calculate_confidence(stats: dict, model: dict) -> float:
    support = stats["supporting_listing_count"]
    score = 0.28
    score += min(0.28, math.log1p(support) * 0.09)
    score += min(0.12, max(0, len(stats["sources"]) - 1) * 0.06)
    score += min(0.14, max(0, len(stats["years"]) - 1) * 0.025)
    if stats["supporting_building_evidence"]:
        score += 0.18
    if model.get("stable"):
        score += 0.08
    if model.get("transient"):
        score -= 0.16
    return round(max(0.0, min(0.98, score)), 2)


def public_safe_signal(signal_key: str, stats: dict) -> bool:
    model = SIGNAL_MODEL.get(signal_key, {})
    return (
        bool(model.get("stable"))
        and bool(model.get("production_safe"))
        and not bool(model.get("transient"))
        and stats["supporting_listing_count"] >= int(model.get("minimum_support_count", 1))
        and stats["confidence"] >= float(model.get("minimum_confidence", 0.6))
    )


def add_listing_evidence(aggregate: dict) -> tuple[int, Counter]:
    rows = 0
    signal_counter = Counter()
    for row in iter_listing_rows(LISTINGS_SQL_PATH):
        if len(row) != len(LISTING_COLUMNS):
            continue
        data = dict(zip(LISTING_COLUMNS, row))
        building_id = int(data.get("b_id") or 0)
        if building_id <= 0:
            continue
        rows += 1
        record = aggregate[building_id]
        record["listing_ids"].add(int(data.get("l_id") or 0))
        space_type = data.get("l_space_type")
        record["space_type_counts"][SPACE_TYPE_LABELS.get(space_type, f"unknown_{space_type}")] += 1
        source = str(data.get("l_source") or "")
        record["source_counts"][source] += 1
        year = epoch_year(data.get("l_creation_date")) or epoch_year(data.get("l_last_update_date"))
        if year:
            record["years"].add(year)
        text_fields = {
            "l_name": str(data.get("l_name") or ""),
            "l_suite": str(data.get("l_suite") or ""),
            "l_description": str(data.get("l_description") or ""),
            "l_promo_title": str(data.get("l_promo_title") or ""),
            "l_promo_details": str(data.get("l_promo_details") or ""),
        }
        for signal_key, signal in detect_signals(text_fields).items():
            model_key = identity_key(signal_key)
            stats = record["signals"][model_key]
            update_signal(stats, data.get("l_id"), source, year, signal.get("evidence", []), signal.get("field_sources", []))
            record["raw_signal_keys"][model_key].add(signal_key)
            signal_counter[model_key] += 1
        if rows % 500000 == 0:
            print(f"Processed {rows:,} listing rows...", flush=True)
    return rows, signal_counter


def add_building_evidence(aggregate: dict) -> tuple[int, int]:
    rows = 0
    with_text = 0
    for row in iter_sql_insert_rows(BUILDINGS_SQL_PATH, "buildings_original"):
        if len(row) != len(BUILDING_COLUMNS):
            continue
        data = dict(zip(BUILDING_COLUMNS, row))
        building_id = int(data.get("b_id") or 0)
        if building_id <= 0:
            continue
        rows += 1
        record = aggregate[building_id]
        record["building_description"] = clean_text(data.get("b_description"))
        record["building_amenities"] = clean_text(data.get("b_amenities"))
        record["building_types_of_use"] = clean_text(data.get("b_types_of_use"))
        if record["building_description"] or record["building_amenities"] or record["building_types_of_use"]:
            with_text += 1
        text_fields = {
            "building_description": record["building_description"],
            "building_amenities": record["building_amenities"],
            "building_types_of_use": record["building_types_of_use"],
            "building_name": clean_text(data.get("b_name")),
        }
        for signal_key, signal in detect_signals(text_fields).items():
            model_key = identity_key(signal_key)
            stats = record["signals"][model_key]
            update_signal(stats, None, "building_original", None, signal.get("evidence", []), ["building_description"])
            stats["supporting_listing_count"] = max(stats["supporting_listing_count"], 0)
            record["raw_signal_keys"][model_key].add(signal_key)
        if rows % 500000 == 0:
            print(f"Processed {rows:,} building rows...", flush=True)
    return rows, with_text


def load_building_metadata() -> dict[int, dict]:
    buildings = pd.read_csv(DERIVED_DIR / "building_signals.csv", low_memory=False)
    metadata = {}
    for row in buildings.to_dict("records"):
        metadata[int(row["building_id"])] = row
    return metadata


def flatten_record(building_id: int, record: dict, metadata: dict) -> dict | None:
    meta = metadata.get(building_id, {})
    finalized = []
    for signal_key, stats in record["signals"].items():
        model = SIGNAL_MODEL.get(next(iter(record["raw_signal_keys"][signal_key]), signal_key), SIGNAL_MODEL.get(signal_key, {}))
        if signal_key in SIGNAL_MODEL:
            model = SIGNAL_MODEL[signal_key]
        stats["confidence"] = calculate_confidence(stats, model)
        signal = {
            "signal_key": signal_key,
            "label": model.get("label", signal_key.replace("_", " ").title()),
            "confidence": stats["confidence"],
            "supporting_listing_count": stats["supporting_listing_count"],
            "source_count": len(stats["sources"]),
            "year_span": [min(stats["years"]), max(stats["years"])] if stats["years"] else [],
            "evidence": stats["evidence"],
            "supporting_building_evidence": stats["supporting_building_evidence"],
            "stable": bool(model.get("stable")),
            "production_safe": public_safe_signal(signal_key, stats),
            "transient": bool(model.get("transient")),
            "minimum_support_count": model.get("minimum_support_count", 1),
            "minimum_confidence": model.get("minimum_confidence", 0.6),
        }
        finalized.append(signal)
    finalized.sort(key=lambda item: (item["production_safe"], item["confidence"], item["supporting_listing_count"]), reverse=True)
    if not finalized:
        return None
    production_safe = [item for item in finalized if item["production_safe"]]
    internal = [item for item in finalized if not item["production_safe"]]
    top_themes = [item["label"] for item in finalized[:8]]
    return {
        "building_id": building_id,
        "building_name": str(meta.get("name") or ""),
        "address": str(meta.get("address") or ""),
        "city": str(meta.get("city") or ""),
        "state": str(meta.get("state") or ""),
        "representative_space_types": [label for label, _ in record["space_type_counts"].most_common(4)],
        "listing_count": int(meta.get("listing_count") or len(record["listing_ids"])),
        "historical_listing_evidence_count": len(record["listing_ids"]),
        "semantic_identity_signals": production_safe,
        "internal_only_signals": internal[:10],
        "historical_marketing_themes": top_themes,
        "stability_classification": "production_safe" if production_safe else "internal_review",
        "production_safe_signal_count": len(production_safe),
        "internal_signal_count": len(internal),
        "has_building_description_evidence": bool(record.get("building_description") or record.get("building_amenities") or record.get("building_types_of_use")),
    }


def write_outputs(records: list[dict], metadata: dict) -> list[dict]:
    records.sort(key=lambda item: (item["production_safe_signal_count"], max([s["confidence"] for s in item["semantic_identity_signals"]] or [0]), item["historical_listing_evidence_count"]), reverse=True)
    OUTPUT_JSON.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")

    csv_fields = [
        "building_id", "building_name", "address", "city", "state", "representative_space_types",
        "listing_count", "historical_listing_evidence_count", "production_safe_signal_count",
        "internal_signal_count", "semantic_identity_signals", "confidence_per_signal",
        "supporting_listing_count_per_signal", "supporting_building_evidence", "historical_marketing_themes",
        "stability_classification", "production_safe_flags",
    ]
    with OUTPUT_CSV.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=csv_fields)
        writer.writeheader()
        for record in records:
            safe = record["semantic_identity_signals"]
            writer.writerow({
                "building_id": record["building_id"],
                "building_name": record["building_name"],
                "address": record["address"],
                "city": record["city"],
                "state": record["state"],
                "representative_space_types": "|".join(record["representative_space_types"]),
                "listing_count": record["listing_count"],
                "historical_listing_evidence_count": record["historical_listing_evidence_count"],
                "production_safe_signal_count": record["production_safe_signal_count"],
                "internal_signal_count": record["internal_signal_count"],
                "semantic_identity_signals": "|".join(signal["signal_key"] for signal in safe),
                "confidence_per_signal": json.dumps({signal["signal_key"]: signal["confidence"] for signal in safe}),
                "supporting_listing_count_per_signal": json.dumps({signal["signal_key"]: signal["supporting_listing_count"] for signal in safe}),
                "supporting_building_evidence": json.dumps({signal["signal_key"]: signal["supporting_building_evidence"] for signal in safe}, ensure_ascii=False),
                "historical_marketing_themes": "|".join(record["historical_marketing_themes"]),
                "stability_classification": record["stability_classification"],
                "production_safe_flags": json.dumps({signal["signal_key"]: signal["production_safe"] for signal in safe}),
            })

    active_ids = {bid for bid, meta in metadata.items() if bool(meta.get("is_active_signal"))}
    priority_markets = {"San Francisco", "New York", "Los Angeles", "Austin", "Seattle", "Chicago", "Boston", "Denver", "Oakland", "San Jose", "Atlanta", "Miami", "Dallas"}
    pilot = [
        record for record in records
        if record["building_id"] in active_ids
        and record["production_safe_signal_count"] > 0
        and record["city"] in priority_markets
    ][:500]
    PILOT_JSON.write_text(json.dumps(pilot, indent=2, ensure_ascii=False), encoding="utf-8")
    return pilot


def md_table(rows: list[dict], cols: list[str]) -> str:
    lines = ["| " + " | ".join(cols) + " |", "| " + " | ".join(["---"] * len(cols)) + " |"]
    for row in rows:
        lines.append("| " + " | ".join(str(row.get(col, "")).replace("|", "\\|").replace("\n", " ") for col in cols) + " |")
    return "\n".join(lines)


def write_report(records: list[dict], pilot: list[dict], listing_rows: int, building_rows: int, building_text_rows: int) -> None:
    stable_counts = Counter()
    noisy_counts = Counter()
    for record in records:
        for signal in record["semantic_identity_signals"]:
            stable_counts[signal["signal_key"]] += 1
        for signal in record["internal_only_signals"]:
            noisy_counts[signal["signal_key"]] += 1
    examples = []
    for record in records[:12]:
        examples.append({
            "building_id": record["building_id"],
            "building": record["building_name"] or record["address"],
            "city": record["city"],
            "safe_signals": ", ".join(signal["label"] for signal in record["semantic_identity_signals"][:5]),
            "evidence_count": record["historical_listing_evidence_count"],
        })
    lines = [
        "# Building Semantic Identity v1",
        "",
        "## Purpose",
        "",
        "This dataset turns historical listing and building text into a conservative building identity layer. It describes durable commercial environments and historical patterns. It does not describe current inventory, pricing, suite availability, or active listing conditions.",
        "",
        "## Inputs",
        "",
        f"- Historical listing SQL rows processed: {listing_rows:,}",
        f"- Raw building SQL rows processed: {building_rows:,}",
        f"- Building rows with description, amenity, or use text: {building_text_rows:,}",
        "- Existing `building_signals.csv` for production building metadata and active-signal filtering.",
        "",
        "## Aggregation Methodology",
        "",
        "1. Parse raw listing descriptions and building descriptions locally.",
        "2. Detect deterministic semantic phrases in listing and building text.",
        "3. Group evidence by `building_id`.",
        "4. Increase confidence for repeated listing evidence, multi-year evidence, source diversity, and direct building-description matches.",
        "5. Classify each signal as stable/public-safe or transient/internal-only.",
        "",
        "## Stable vs Transient Logic",
        "",
        "Stable production-safe signals describe durable identity: creative office, medical office fit, warehouse/distribution, transit orientation, freeway access, loading orientation, showroom fit, campus environment, historic or boutique character, and similar long-lived building or location traits.",
        "",
        "Transient signals remain internal only: furnished, plug-and-play, current parking language, move-in ready language, buildout condition, and pricing-oriented claims.",
        "",
        "## Output Counts",
        "",
        f"- Buildings with any semantic identity record: {len(records):,}",
        f"- Pilot records: {len(pilot):,}",
        "",
        "## Top Stable Production-Safe Signals",
        "",
        md_table([{"signal": k, "building_count": v} for k, v in stable_counts.most_common(15)], ["signal", "building_count"]),
        "",
        "## Top Noisy or Internal-Only Signals",
        "",
        md_table([{"signal": k, "building_count": v} for k, v in noisy_counts.most_common(15)], ["signal", "building_count"]),
        "",
        "## Strong Identity Examples",
        "",
        md_table(examples, ["building_id", "building", "city", "safe_signals", "evidence_count"]),
        "",
        "## Public Surfacing Recommendations",
        "",
        "- Use semantic chips such as `Transit-oriented`, `Warehouse/distribution`, `Medical office fit`, or `Showroom fit`.",
        "- Use short contextual summaries with careful language like `Historically associated with warehouse and loading-oriented uses`.",
        "- Use neighborhood compatibility language on future district pages.",
        "- Use tenant-fit indicators as guidance, not availability claims.",
        "",
        "## Keep Internal Only",
        "",
        "- Furnished, plug-and-play, move-in ready, and parking claims unless freshly verified.",
        "- Old pricing, suite numbers, rent basis, or date available fields.",
        "- One-off single listing claims without building-level or repeated support.",
        "",
        "## Production Rollout Recommendation",
        "",
        "Start with the pilot JSON only. Review examples manually, then promote a small signal whitelist into `_data/` for prototype building or neighborhood pages. Do not expose the full dataset until false positives and legacy space-type mappings are reviewed.",
    ]
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    ensure_dirs()
    aggregate = defaultdict(lambda: {
        "listing_ids": set(),
        "space_type_counts": Counter(),
        "source_counts": Counter(),
        "years": set(),
        "signals": defaultdict(init_signal_stats),
        "raw_signal_keys": defaultdict(set),
        "building_description": "",
        "building_amenities": "",
        "building_types_of_use": "",
    })
    metadata = load_building_metadata()
    listing_rows, listing_signal_counts = add_listing_evidence(aggregate)
    building_rows, building_text_rows = add_building_evidence(aggregate)
    records = []
    for building_id, record in aggregate.items():
        flattened = flatten_record(building_id, record, metadata)
        if flattened and (flattened["production_safe_signal_count"] > 0 or flattened["internal_signal_count"] > 0):
            records.append(flattened)
    pilot = write_outputs(records, metadata)
    write_report(records, pilot, listing_rows, building_rows, building_text_rows)
    stable_counts = Counter()
    noisy_counts = Counter()
    for record in records:
        for signal in record["semantic_identity_signals"]:
            stable_counts[signal["signal_key"]] += 1
        for signal in record["internal_only_signals"]:
            noisy_counts[signal["signal_key"]] += 1
    print(f"Buildings processed with semantic records: {len(records):,}")
    print(f"Listing rows processed: {listing_rows:,}")
    print(f"Building rows processed: {building_rows:,}")
    print(f"Pilot dataset size: {len(pilot):,}")
    print("Top stable signals:")
    for key, count in stable_counts.most_common(10):
        print(f"- {key}: {count:,}")
    print("Top noisy/internal signals:")
    for key, count in noisy_counts.most_common(10):
        print(f"- {key}: {count:,}")
    print(f"Wrote {OUTPUT_JSON}")
    print(f"Wrote {OUTPUT_CSV}")
    print(f"Wrote {PILOT_JSON}")
    print(f"Wrote {REPORT_MD}")


if __name__ == "__main__":
    main()
