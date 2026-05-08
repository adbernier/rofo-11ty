from __future__ import annotations

import csv
import heapq
import html
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd

from common import DERIVED_DIR, REPORTS_DIR, ensure_dirs


SQL_PATH = Path.home() / "rofo-raw-inspection" / "listings_v01a" / "listings_v01a.sql"
SAMPLE_CSV = DERIVED_DIR / "raw_listing_descriptions_sample.csv"
SIGNAL_JSON = DERIVED_DIR / "raw_listing_semantic_signal_sample.json"
COVERAGE_CSV = DERIVED_DIR / "raw_listing_description_coverage.csv"
REPORT_MD = REPORTS_DIR / "raw_listing_description_semantic_audit.md"

RAW_COLUMNS = [
    "l_id",
    "b_id",
    "p_id",
    "l_name",
    "l_suite",
    "l_broker_id",
    "l_space_type",
    "l_lease_type",
    "l_creation_date",
    "l_last_update_date",
    "l_description",
    "l_sqft_price",
    "l_price_sqft",
    "l_price_selection",
    "l_price_type",
    "l_sqft",
    "l_divisible",
    "l_status",
    "l_featured",
    "l_date_available",
    "l_sublease_expiration",
    "l_tags",
    "l_promo_title",
    "l_promo_details",
    "c_id",
    "l_zipcode",
    "l_glat",
    "l_glng",
    "l_type",
    "l_so_featured",
    "l_can_expire",
    "l_source",
    "l_vendor_listing_id",
    "l_lms_feed_id",
    "is_catylist",
    "is_tenx",
    "l_qrcode",
    "l_external_url",
    "l_golive_time",
    "l_expire_time",
    "cl_url",
    "cl_posttime",
    "international",
    "admin_status",
    "admin_reason",
]

OUTPUT_FIELDS = [
    "listing_id",
    "building_id",
    "p_id",
    "l_name",
    "l_suite",
    "l_broker_id",
    "l_space_type",
    "l_lease_type",
    "l_creation_date",
    "l_last_update_date",
    "l_description",
    "description_text",
    "l_promo_title",
    "l_promo_details",
    "promo_text",
    "combined_semantic_text",
    "l_sqft",
    "l_price_sqft",
    "l_price_selection",
    "l_price_type",
    "l_status",
    "c_id",
    "l_zipcode",
    "l_glat",
    "l_glng",
    "l_type",
    "l_source",
    "l_vendor_listing_id",
    "l_lms_feed_id",
    "is_catylist",
    "l_external_url",
    "l_golive_time",
    "l_expire_time",
    "description_length",
    "promo_length",
    "combined_length",
    "signal_count",
    "signals",
    "evidence",
]

SIGNALS = {
    "plug_and_play": {
        "label": "Plug and Play",
        "confidence": 0.86,
        "patterns": [r"plug[\s-]+and[\s-]+play", r"turn[\s-]?key", r"move[\s-]?in ready"],
    },
    "furnished": {
        "label": "Furnished",
        "confidence": 0.86,
        "patterns": [r"furnished", r"furniture included", r"fully furnished"],
    },
    "parking": {
        "label": "Parking",
        "confidence": 0.72,
        "patterns": [r"parking", r"parking ratio", r"surface parking", r"covered parking", r"on[\s-]?site parking"],
    },
    "freeway_access": {
        "label": "Freeway Access",
        "confidence": 0.72,
        "patterns": [r"freeway access", r"highway access", r"interstate", r"easy access to", r"near i[\s-]?\d+"],
    },
    "transit_adjacent": {
        "label": "Transit Adjacent",
        "confidence": 0.72,
        "patterns": [r"\bbart\b", r"\bmuni\b", r"train station", r"metro station", r"public transit", r"light rail", r"caltrain"],
    },
    "high_ceilings": {
        "label": "High Ceilings",
        "confidence": 0.82,
        "patterns": [r"high ceilings?", r"\d{2}['’]?\s*(?:clear|ceilings?)", r"clear height", r"clearance"],
    },
    "natural_light": {
        "label": "Natural Light",
        "confidence": 0.82,
        "patterns": [r"natural light", r"abundant light", r"large windows", r"floor[\s-]?to[\s-]?ceiling windows"],
    },
    "creative_office": {
        "label": "Creative Office",
        "confidence": 0.78,
        "patterns": [r"creative office", r"creative space", r"loft office", r"studio space"],
    },
    "exposed_brick": {
        "label": "Exposed Brick",
        "confidence": 0.88,
        "patterns": [r"exposed brick", r"brick walls?"],
    },
    "brick_and_timber": {
        "label": "Brick and Timber",
        "confidence": 0.9,
        "patterns": [r"brick and timber", r"brick & timber", r"timber beams?", r"heavy timber"],
    },
    "class_a": {
        "label": "Class A",
        "confidence": 0.78,
        "patterns": [r"class[\s-]?a", r"trophy", r"premier office", r"premier building"],
    },
    "boutique_office": {
        "label": "Boutique Office",
        "confidence": 0.7,
        "patterns": [r"boutique office", r"boutique building", r"small office building"],
    },
    "medical": {
        "label": "Medical",
        "confidence": 0.82,
        "patterns": [r"medical", r"clinic", r"dental", r"doctor", r"healthcare", r"exam rooms?"],
    },
    "biotech_lab": {
        "label": "Biotech or Lab",
        "confidence": 0.86,
        "patterns": [r"biotech", r"life science", r"wet lab", r"laboratory", r"\blab\b", r"clean room"],
    },
    "showroom": {
        "label": "Showroom",
        "confidence": 0.86,
        "patterns": [r"showroom", r"sales floor", r"display room", r"gallery"],
    },
    "retail_storefront": {
        "label": "Retail Storefront",
        "confidence": 0.76,
        "patterns": [r"storefront", r"retail", r"shopping center", r"end cap", r"endcap"],
    },
    "restaurant_food": {
        "label": "Restaurant or Food",
        "confidence": 0.8,
        "patterns": [r"restaurant", r"cafe", r"coffee shop", r"kitchen", r"food service"],
    },
    "warehouse_distribution": {
        "label": "Warehouse or Distribution",
        "confidence": 0.84,
        "patterns": [r"warehouse", r"distribution", r"logistics", r"fulfillment", r"storage"],
    },
    "loading_dock": {
        "label": "Loading Dock",
        "confidence": 0.88,
        "patterns": [r"loading dock", r"dock high", r"dock[\s-]?high", r"grade level door", r"roll[\s-]?up door", r"drive[\s-]?in"],
    },
    "high_clearance": {
        "label": "High Clearance",
        "confidence": 0.86,
        "patterns": [r"clear height", r"clearance", r"clear span", r"\d{2}['’]?\s*clear"],
    },
    "heavy_power": {
        "label": "Heavy Power",
        "confidence": 0.88,
        "patterns": [r"heavy power", r"3[\s-]?phase", r"three[\s-]?phase", r"\d+\s*amps?", r"power capacity"],
    },
    "flex_rd": {
        "label": "Flex or R&D",
        "confidence": 0.76,
        "patterns": [r"\br&d\b", r"research and development", r"flex space", r"office/warehouse", r"office warehouse"],
    },
    "campus_environment": {
        "label": "Campus Environment",
        "confidence": 0.72,
        "patterns": [r"campus", r"business park", r"office park", r"corporate park"],
    },
    "professional_services": {
        "label": "Professional Services",
        "confidence": 0.7,
        "patterns": [r"professional services", r"accounting", r"consulting", r"advisor", r"insurance office"],
    },
    "tech_startup": {
        "label": "Tech or Startup",
        "confidence": 0.72,
        "patterns": [r"startup", r"start[\s-]?up", r"technology company", r"software", r"tech company"],
    },
    "nonprofit": {
        "label": "Nonprofit",
        "confidence": 0.82,
        "patterns": [r"nonprofit", r"non-profit", r"not[\s-]?for[\s-]?profit"],
    },
    "financial_services": {
        "label": "Financial Services",
        "confidence": 0.76,
        "patterns": [r"financial services", r"bank", r"wealth management", r"investment", r"finance"],
    },
    "law_firm": {
        "label": "Law Firm",
        "confidence": 0.84,
        "patterns": [r"law firm", r"legal office", r"attorney", r"law office"],
    },
    "fitness": {
        "label": "Fitness",
        "confidence": 0.82,
        "patterns": [r"fitness", r"gym", r"yoga", r"pilates", r"personal training"],
    },
    "waterfront": {
        "label": "Waterfront",
        "confidence": 0.76,
        "patterns": [r"waterfront", r"water view", r"bay view", r"riverfront", r"harbor"],
    },
}


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


def decode_escape(char: str) -> str:
    return {
        "n": "\n",
        "r": "\r",
        "t": "\t",
        "0": "\0",
        "\\": "\\",
        "'": "'",
        '"': '"',
    }.get(char, char)


def iter_listing_rows(path: Path):
    marker = "INSERT INTO `listings` VALUES "
    marker_found = False
    in_insert = False
    in_quote = False
    escaped = False
    row = None
    token_parts = []
    carry = ""
    chunk_size = 4 * 1024 * 1024

    with path.open("r", encoding="utf-8", errors="replace") as fh:
        while True:
            chunk = fh.read(chunk_size)
            if not chunk:
                break

            if not marker_found:
                search = carry + chunk
                marker_index = search.find(marker)
                if marker_index == -1:
                    carry = search[-len(marker):]
                    continue
                chunk = search[marker_index + len(marker):]
                carry = ""
                marker_found = True
                in_insert = True

            index = 0
            length = len(chunk)
            while index < length:
                char = chunk[index]
                index += 1

                if not in_insert:
                    marker_index = chunk.find(marker, index - 1)
                    if marker_index == -1:
                        break
                    index = marker_index + len(marker)
                    in_insert = True
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

                if row is None:
                    if char == "(":
                        row = []
                        token_parts = []
                    elif char == ";" and not in_quote:
                        in_insert = False
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


def fix_mojibake(text: str) -> str:
    if not text:
        return ""
    replacements = {
        "â€¢": " ",
        "â€œ": '"',
        "â€": '"',
        "â€˜": "'",
        "â€™": "'",
        "â€“": "-",
        "â€”": "-",
        "Â": "",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    if "Ã" in text or "â" in text:
        try:
            repaired = text.encode("latin1", errors="ignore").decode("utf-8", errors="ignore")
            if repaired.count("�") <= text.count("�"):
                text = repaired
        except Exception:
            pass
    return text


def clean_html_text(value) -> str:
    text = "" if value is None else str(value)
    text = html.unescape(text)
    text = re.sub(r"(?i)<br\s*/?>", " ", text)
    text = re.sub(r"(?i)</p>", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = fix_mojibake(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def trigger_regex(pattern: str) -> re.Pattern:
    return re.compile(rf"(?<![a-z0-9]){pattern}(?![a-z0-9])", re.IGNORECASE)


COMPILED_SIGNALS = {
    key: {
        **meta,
        "compiled": [trigger_regex(pattern) for pattern in meta["patterns"]],
    }
    for key, meta in SIGNALS.items()
}

SIGNAL_PHRASES = {
    key: [
        phrase
        for phrase in [
            pattern
                .replace(r"\b", "")
                .replace(r"[\s-]+", " ")
                .replace(r"[\s-]?", "")
                .replace(r"[\s-]", "")
                .replace(r"\s*", " ")
                .replace(r"\s", " ")
                .replace(r"\d{2}['’]?\s*", "")
                .replace("?", "")
                .replace("\\", "")
                .lower()
            for pattern in meta["patterns"]
        ]
        if phrase and not phrase.startswith("(") and "[" not in phrase and "]" not in phrase
    ]
    for key, meta in SIGNALS.items()
}

WORD_PHRASE_RES = {
    phrase: re.compile(rf"(?<![a-z0-9]){re.escape(phrase)}(?![a-z0-9])")
    for phrases in SIGNAL_PHRASES.values()
    for phrase in phrases
    if phrase and " " not in phrase and len(phrase) <= 6
}


def phrase_matches(phrase: str, lowered: str) -> bool:
    if phrase in WORD_PHRASE_RES:
        return bool(WORD_PHRASE_RES[phrase].search(lowered))
    return phrase in lowered


def detect_signals(field_texts: dict[str, str]) -> dict[str, dict]:
    matches = {}
    for field_source, text in field_texts.items():
        if not text:
            continue
        lowered = html.unescape(str(text)).lower()
        for key, phrases in SIGNAL_PHRASES.items():
            evidence = []
            for phrase in phrases:
                if phrase and phrase_matches(phrase, lowered):
                    evidence.append(phrase)
            if not evidence:
                continue
            meta = SIGNALS[key]
            entry = matches.setdefault(
                key,
                {
                    "label": meta["label"],
                    "confidence": meta["confidence"],
                    "evidence": [],
                    "field_sources": [],
                },
            )
            for phrase in evidence:
                if phrase.lower() not in [item.lower() for item in entry["evidence"]]:
                    entry["evidence"].append(phrase[:80])
            if field_source not in entry["field_sources"]:
                entry["field_sources"].append(field_source)
    for entry in matches.values():
        entry["evidence"] = entry["evidence"][:6]
    return matches


def map_row(row: list) -> dict:
    data = dict(zip(RAW_COLUMNS, row))
    raw_description = "" if data.get("l_description") is None else str(data.get("l_description"))
    raw_promo = "" if data.get("l_promo_details") is None else str(data.get("l_promo_details"))
    raw_name = "" if data.get("l_name") is None else str(data.get("l_name"))
    raw_suite = "" if data.get("l_suite") is None else str(data.get("l_suite"))
    raw_promo_title = "" if data.get("l_promo_title") is None else str(data.get("l_promo_title"))
    raw_combined = " ".join(part for part in [raw_name, raw_suite, raw_description, raw_promo_title, raw_promo] if part)
    description_length = len(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", raw_description)).strip())
    promo_length = len(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", raw_promo)).strip())
    combined_length = len(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", raw_combined)).strip())
    signals = detect_signals({
        "l_name": raw_name,
        "l_suite": raw_suite,
        "l_description": raw_description,
        "l_promo_title": raw_promo_title,
        "l_promo_details": raw_promo,
    })
    return {
        "listing_id": data.get("l_id"),
        "building_id": data.get("b_id"),
        "p_id": data.get("p_id"),
        "l_name": data.get("l_name"),
        "l_suite": data.get("l_suite"),
        "l_broker_id": data.get("l_broker_id"),
        "l_space_type": data.get("l_space_type"),
        "l_lease_type": data.get("l_lease_type"),
        "l_creation_date": data.get("l_creation_date"),
        "l_last_update_date": data.get("l_last_update_date"),
        "l_description": data.get("l_description"),
        "description_text": "",
        "l_promo_title": data.get("l_promo_title"),
        "l_promo_details": data.get("l_promo_details"),
        "promo_text": "",
        "combined_semantic_text": "",
        "l_sqft": data.get("l_sqft"),
        "l_price_sqft": data.get("l_price_sqft"),
        "l_price_selection": data.get("l_price_selection"),
        "l_price_type": data.get("l_price_type"),
        "l_status": data.get("l_status"),
        "c_id": data.get("c_id"),
        "l_zipcode": data.get("l_zipcode"),
        "l_glat": data.get("l_glat"),
        "l_glng": data.get("l_glng"),
        "l_type": data.get("l_type"),
        "l_source": data.get("l_source"),
        "l_vendor_listing_id": data.get("l_vendor_listing_id"),
        "l_lms_feed_id": data.get("l_lms_feed_id"),
        "is_catylist": data.get("is_catylist"),
        "l_external_url": data.get("l_external_url"),
        "l_golive_time": data.get("l_golive_time"),
        "l_expire_time": data.get("l_expire_time"),
        "description_length": description_length,
        "promo_length": promo_length,
        "combined_length": combined_length,
        "signal_count": len(signals),
        "signals": ",".join(sorted(signals.keys())),
        "evidence": json.dumps({key: {"evidence": value["evidence"], "field_sources": value["field_sources"]} for key, value in signals.items()}, ensure_ascii=False),
        "_signals_dict": signals,
        "_raw_combined": raw_combined,
    }


def clean_record_for_output(record: dict) -> dict:
    output = {key: value for key, value in record.items() if not key.startswith("_")}
    description_text = clean_html_text(output.get("l_description"))
    promo_text = clean_html_text(output.get("l_promo_details"))
    name_text = clean_html_text(output.get("l_name"))
    suite_text = clean_html_text(output.get("l_suite"))
    promo_title_text = clean_html_text(output.get("l_promo_title"))
    output["description_text"] = description_text
    output["promo_text"] = promo_text
    output["combined_semantic_text"] = " ".join(part for part in [name_text, suite_text, description_text, promo_title_text, promo_text] if part)
    return output


def is_nonzero(value) -> bool:
    try:
        return float(value) != 0
    except Exception:
        return False


def update_representatives(representatives: dict, record: dict) -> None:
    for key, signal in record["_signals_dict"].items():
        bucket = representatives[key]
        if len(bucket) >= 5:
            continue
        cleaned = clean_record_for_output(record)
        bucket.append({
            "listing_id": record["listing_id"],
            "building_id": record["building_id"],
            "l_name": clean_html_text(record["l_name"]),
            "l_suite": clean_html_text(record["l_suite"]),
            "l_space_type": record["l_space_type"],
            "l_source": record["l_source"],
            "is_catylist": record["is_catylist"],
            "confidence": signal["confidence"],
            "evidence": signal["evidence"],
            "field_sources": signal["field_sources"],
            "text_excerpt": cleaned["combined_semantic_text"][:500],
        })


def sample_score(record: dict) -> int:
    return int(record["description_length"]) + int(record["promo_length"]) + int(record["signal_count"]) * 500


def push_sample(heap: list, record: dict, max_rows: int = 500) -> None:
    score = sample_score(record)
    item = (score, int(record["listing_id"] or 0), record.copy())
    if len(heap) < max_rows:
        heapq.heappush(heap, item)
        return
    if item[0] > heap[0][0]:
        heapq.heapreplace(heap, item)


def write_sample_csv(heap: list) -> list[dict]:
    rows = [clean_record_for_output(item[2]) for item in sorted(heap, key=lambda item: (item[0], item[1]), reverse=True)]
    with SAMPLE_CSV.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in OUTPUT_FIELDS})
    return rows


def write_coverage(metrics: dict, source_counts: Counter, catylist_counts: Counter, space_counts: Counter, status_counts: Counter, signal_counts: Counter) -> None:
    rows = [
        {"metric_group": "coverage", "metric": key, "value": value}
        for key, value in metrics.items()
    ]
    for label, counter in [
        ("source", source_counts),
        ("catylist", catylist_counts),
        ("space_type", space_counts),
        ("status", status_counts),
        ("signal", signal_counts),
    ]:
        for key, value in counter.most_common():
            rows.append({"metric_group": label, "metric": key, "value": value})
    pd.DataFrame(rows).to_csv(COVERAGE_CSV, index=False)


def pct(part: int, total: int) -> str:
    return "0.0%" if not total else f"{part / total * 100:.1f}%"


def md_table(rows: list[dict], columns: list[str], limit: int | None = None) -> str:
    selected = rows[:limit] if limit else rows
    lines = [
        "| " + " | ".join(columns) + " |",
        "| " + " | ".join(["---"] * len(columns)) + " |",
    ]
    for row in selected:
        values = []
        for col in columns:
            value = str(row.get(col, ""))
            value = value.replace("|", "\\|").replace("\n", " ")
            values.append(value)
        lines.append("| " + " | ".join(values) + " |")
    return "\n".join(lines)


def write_report(metrics: dict, source_counts: Counter, space_counts: Counter, status_counts: Counter, signal_counts: Counter, sample_rows: list[dict]) -> None:
    total = metrics["total_listings_parsed"]
    coverage_rows = [
        {"metric": "Total listings parsed", "value": f"{total:,}", "share": "100.0%"},
        {"metric": "Listings with non-empty description", "value": f"{metrics['description_nonempty']:,}", "share": pct(metrics["description_nonempty"], total)},
        {"metric": "Description length > 100", "value": f"{metrics['description_gt_100']:,}", "share": pct(metrics["description_gt_100"], total)},
        {"metric": "Description length > 500", "value": f"{metrics['description_gt_500']:,}", "share": pct(metrics["description_gt_500"], total)},
        {"metric": "Listings with promo details", "value": f"{metrics['promo_nonempty']:,}", "share": pct(metrics["promo_nonempty"], total)},
        {"metric": "Listings with geo", "value": f"{metrics['has_geo']:,}", "share": pct(metrics["has_geo"], total)},
        {"metric": "Listings with building_id", "value": f"{metrics['has_building_id']:,}", "share": pct(metrics["has_building_id"], total)},
    ]
    signal_rows = [
        {"signal": key, "count": f"{value:,}", "label": SIGNALS[key]["label"]}
        for key, value in signal_counts.most_common(15)
    ]
    source_rows = [{"source": key, "count": f"{value:,}", "share": pct(value, total)} for key, value in source_counts.most_common()]
    space_rows = [{"space_type": key, "count": f"{value:,}", "share": pct(value, total)} for key, value in space_counts.most_common(15)]
    status_rows = [{"status": key, "count": f"{value:,}", "share": pct(value, total)} for key, value in status_counts.most_common(15)]
    sample_preview = [
        {
            "listing_id": row["listing_id"],
            "building_id": row["building_id"],
            "name": clean_html_text(row["l_name"])[:80],
            "source": row["l_source"],
            "space_type": row["l_space_type"],
            "signal_count": row["signal_count"],
            "signals": row["signals"],
            "excerpt": row["combined_semantic_text"][:220],
        }
        for row in sample_rows[:12]
    ]

    lines = [
        "# Raw Listing Description Semantic Audit",
        "",
        f"Source SQL: `{SQL_PATH}`",
        "",
        "## Did the raw listing dump contain rich semantic text?",
        "",
        "Yes. Unlike the cleaned `rofo_listings.csv` export, the raw `listings_v01a.sql` dump includes `l_description` and `l_promo_details`. These fields contain broker and feed marketing text, suite notes, property context, amenities, access language, operational requirements, and tenant-fit clues.",
        "",
        "## Coverage",
        "",
        md_table(coverage_rows, ["metric", "value", "share"]),
        "",
        "## Source Breakdown",
        "",
        md_table(source_rows, ["source", "count", "share"]),
        "",
        "## Space Type Count",
        "",
        md_table(space_rows, ["space_type", "count", "share"]),
        "",
        "## Status Count",
        "",
        md_table(status_rows, ["status", "count", "share"]),
        "",
        "## Top Detected Signals",
        "",
        md_table(signal_rows, ["signal", "label", "count"]),
        "",
        "## Most Valuable Fields",
        "",
        "- `l_description`: primary source for building character, access, amenities, operational details, and tenant fit.",
        "- `l_promo_details`: secondary rich-text field. Often useful when populated.",
        "- `l_promo_title` and `l_name`: short but useful for headline-style cues such as loft, showroom, Class A, or office warehouse.",
        "- `l_source`, `l_lms_feed_id`, `is_catylist`, and `l_external_url`: useful for source quality and future deduping.",
        "- `l_space_type`, `l_sqft`, `l_type`, `l_status`, `l_glat`, and `l_glng`: useful structured context. Do not treat as live availability.",
        "",
        "## Strongly Supported Signals",
        "",
        "The strongest v1 candidates are signals with explicit phrase evidence: parking, retail storefront, warehouse/distribution, loading dock, freeway access, high ceilings, natural light, medical, showroom, flex/R&D, Class A, transit adjacency, heavy power, and campus environment.",
        "",
        "## Weak or Risky Signals",
        "",
        "- `professional_services`, `financial_services`, `law_firm`, and `tech_startup` can be useful but may refer to existing tenants rather than the best fit for the space.",
        "- `boutique_office`, `premium`, and similar market-position language can be subjective.",
        "- Any signal extracted from old listing text must be reviewed or aggregated before public use.",
        "",
        "## How This Changes the Prior Recommendation",
        "",
        "The prior recommendation was conservative because the cleaned listing CSV had no marketing text. The raw SQL dump materially improves the opportunity. Rofo can now build a real v1 semantic enrichment layer using deterministic extraction from historical listing descriptions, while still avoiding stale listing UX.",
        "",
        "## Production-Safe V1 Layer",
        "",
        "- Build a reviewed building-level signal table grouped by `building_id`.",
        "- Store signal counts, confidence, and evidence snippets internally.",
        "- Surface only stable, non-availability claims such as building character, access orientation, and historical tenant-fit patterns.",
        "- Use aggregate language on city and neighborhood pages.",
        "",
        "## Reviewed or Manual Only",
        "",
        "- Any claim implying current availability, current suite condition, current rent, current tenant roster, or current landlord concessions.",
        "- Subjective quality labels such as trophy, premium, best, or affordable.",
        "- Any source text with obvious encoding corruption or feed boilerplate.",
        "",
        "## Additional Raw Dumps to Inspect Next",
        "",
        "- Building table dumps with richer building descriptions or amenities.",
        "- Feed/vendor tables for Catylist, Buildout, CBC, Regus, or LMS metadata.",
        "- Broker house and user profile raw dumps with company descriptions.",
        "- Photo/media attachment tables that may contain captions, filenames, or brochure links.",
        "- Neighborhood and city raw tables with historical editorial content.",
        "",
        "## Representative Rich Samples",
        "",
        md_table(sample_preview, ["listing_id", "building_id", "name", "source", "space_type", "signal_count", "signals", "excerpt"]),
    ]
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    ensure_dirs()
    if not SQL_PATH.exists():
        raise FileNotFoundError(f"Raw listing SQL dump not found: {SQL_PATH}")

    metrics = Counter()
    source_counts = Counter()
    catylist_counts = Counter()
    space_counts = Counter()
    status_counts = Counter()
    signal_counts = Counter()
    representatives = defaultdict(list)
    sample_heap = []
    parse_errors = 0

    for index, row in enumerate(iter_listing_rows(SQL_PATH), start=1):
        if len(row) != len(RAW_COLUMNS):
            parse_errors += 1
            continue
        record = map_row(row)
        metrics["total_listings_parsed"] += 1
        if record["description_length"] > 0:
            metrics["description_nonempty"] += 1
        if record["description_length"] > 100:
            metrics["description_gt_100"] += 1
        if record["description_length"] > 500:
            metrics["description_gt_500"] += 1
        if record["promo_length"] > 0:
            metrics["promo_nonempty"] += 1
        if is_nonzero(record["l_glat"]) and is_nonzero(record["l_glng"]):
            metrics["has_geo"] += 1
        if int(record["building_id"] or 0) > 0:
            metrics["has_building_id"] += 1

        source_counts[str(record["l_source"])] += 1
        catylist_counts[str(record["is_catylist"])] += 1
        space_counts[str(record["l_space_type"])] += 1
        status_counts[str(record["l_status"])] += 1
        for signal_key in record["_signals_dict"]:
            signal_counts[signal_key] += 1
        update_representatives(representatives, record)
        if record["description_length"] > 0 or record["promo_length"] > 0:
            push_sample(sample_heap, record)

        if index % 250000 == 0:
            print(f"Parsed {index:,} rows...", flush=True)

    metrics["parse_errors"] = parse_errors
    sample_rows = write_sample_csv(sample_heap)
    write_coverage(metrics, source_counts, catylist_counts, space_counts, status_counts, signal_counts)
    with SIGNAL_JSON.open("w", encoding="utf-8") as fh:
        json.dump(
            {
                key: {
                    "label": SIGNALS[key]["label"],
                    "count": signal_counts[key],
                    "examples": value,
                }
                for key, value in sorted(representatives.items())
            },
            fh,
            indent=2,
            ensure_ascii=False,
        )
    write_report(metrics, source_counts, space_counts, status_counts, signal_counts, sample_rows)

    print(f"Parsed listings: {metrics['total_listings_parsed']:,}")
    print(f"Parse errors/skipped rows: {parse_errors:,}")
    print(f"Sample rows written: {len(sample_rows):,}")
    print("Top 10 detected signals:")
    for key, count in signal_counts.most_common(10):
        print(f"- {key}: {count:,}")
    print(f"Wrote {SAMPLE_CSV}")
    print(f"Wrote {SIGNAL_JSON}")
    print(f"Wrote {COVERAGE_CSV}")
    print(f"Wrote {REPORT_MD}")


if __name__ == "__main__":
    main()
