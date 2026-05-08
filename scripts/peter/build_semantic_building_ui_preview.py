from __future__ import annotations

import csv
import json
from pathlib import Path

from common import DERIVED_DIR, REPORTS_DIR, ensure_dirs


MATCH_REVIEW_CSV = DERIVED_DIR / "active_building_semantic_match_review.csv"
REPORT_MD = REPORTS_DIR / "semantic_building_ui_preview.md"

SIGNAL_LABELS = {
    "warehouse_distribution": "Warehouse or distribution",
    "retail_storefront": "Retail storefront",
    "transit_oriented": "Transit oriented",
    "loading_dock": "Loading oriented",
    "freeway_access": "Freeway access context",
    "medical_office": "Medical office fit",
    "campus_environment": "Campus environment",
    "showroom": "Showroom fit",
    "creative_office": "Creative office",
    "waterfront": "Waterfront context",
    "professional_services": "Professional services",
    "boutique_office": "Boutique office",
    "historic_building": "Historic building",
}

SIGNAL_NOUNS = {
    "warehouse_distribution": "warehouse or distribution use",
    "retail_storefront": "storefront or customer-facing retail use",
    "transit_oriented": "transit-oriented location context",
    "loading_dock": "loading-oriented building functionality",
    "freeway_access": "regional access",
    "medical_office": "medical office use",
    "campus_environment": "campus-style business environments",
    "showroom": "showroom-oriented use",
    "creative_office": "creative office use",
    "waterfront": "waterfront or waterfront-adjacent context",
    "professional_services": "professional services users",
    "boutique_office": "boutique office positioning",
    "historic_building": "historic building character",
}


def parse_pipe(value: str) -> list[str]:
    return [item for item in (value or "").split("|") if item]


def parse_json(value: str) -> dict:
    if not value:
        return {}
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def load_preview_rows() -> list[dict]:
    rows = []
    with MATCH_REVIEW_CSV.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            if row.get("risk_flag") != "low":
                continue
            if row.get("match_method") != "building_id":
                continue
            signals = parse_pipe(row.get("approved_signals"))
            if not signals:
                continue
            confidence = parse_json(row.get("confidence"))
            support = parse_json(row.get("support_counts"))
            rows.append({
                "building_name": row.get("production_building_name", ""),
                "address": row.get("production_address", ""),
                "city": row.get("production_city", ""),
                "state": row.get("production_state", ""),
                "building_path": row.get("production_building_path", ""),
                "signals": signals,
                "confidence": confidence,
                "support": support,
                "average_confidence": row.get("average_confidence", ""),
                "total_supporting_listing_count": row.get("total_supporting_listing_count", ""),
            })
    rows.sort(key=lambda row: (
        -float(row["average_confidence"] or 0),
        -int(row["total_supporting_listing_count"] or 0),
        row["state"],
        row["city"],
        row["building_name"],
    ))
    return rows


def chip_list(signals: list[str]) -> str:
    return ", ".join(SIGNAL_LABELS.get(signal, signal.replace("_", " ").title()) for signal in signals)


def context_sentence(signals: list[str]) -> str:
    nouns = [SIGNAL_NOUNS.get(signal) for signal in signals if SIGNAL_NOUNS.get(signal)]
    if not nouns:
        return "Rofo has seen historical signals for this building environment."
    if len(nouns) == 1:
        return f"Rofo has seen historical signals for {nouns[0]}."
    if len(nouns) == 2:
        phrase = f"{nouns[0]} and {nouns[1]}"
    else:
        phrase = ", ".join(nouns[:2]) + f", and {nouns[2]}"
    return f"Historically associated with {phrase}."


def confidence_support_text(row: dict) -> str:
    parts = []
    for signal in row["signals"]:
        label = SIGNAL_LABELS.get(signal, signal)
        conf = row["confidence"].get(signal, "")
        support = row["support"].get(signal, "")
        parts.append(f"{label}: {conf} confidence, {support} support")
    return "; ".join(parts)


def md_table(rows: list[dict], cols: list[str]) -> str:
    lines = ["| " + " | ".join(cols) + " |", "| " + " | ".join(["---"] * len(cols)) + " |"]
    for row in rows:
        values = [str(row.get(col, "")).replace("|", "\\|").replace("\n", " ") for col in cols]
        lines.append("| " + " | ".join(values) + " |")
    return "\n".join(lines)


def write_report(rows: list[dict]) -> None:
    preview_rows = []
    for row in rows:
        preview_rows.append({
            "building": row["building_name"],
            "location": f"{row['address']}, {row['city']}, {row['state']}",
            "path": row["building_path"],
            "approved_signals": ", ".join(row["signals"]),
            "confidence_support": confidence_support_text(row),
            "chips": chip_list(row["signals"]),
            "context_sentence": context_sentence(row["signals"]),
        })

    lines = [
        "# Semantic Building UI Preview",
        "",
        "## Purpose",
        "",
        "This report previews how semantic building identity could appear for the 111 low-risk active production buildings that now have `semantic_source_building_id`. It is not a production UI rollout and does not modify templates.",
        "",
        "## Scope",
        "",
        f"- Low-risk ID-matched buildings included: {len(rows):,}",
        "- Address-fallback matches excluded.",
        "- Medium and high-risk matches excluded.",
        "- Internal-only, transient, pricing, suite, and availability signals excluded.",
        "",
        "## Recommended Component Concept",
        "",
        "Heading: `Building Environment`",
        "",
        "Placement: subtle card or compact section below the existing building intro or description.",
        "",
        "Content:",
        "- Small semantic chips using reviewed approved signals only.",
        "- One short context sentence using historical framing.",
        "- Optional helper note explaining that signals are based on historical Rofo data and do not represent current availability.",
        "",
        "Example pattern:",
        "",
        "```text",
        "Building Environment",
        "[Warehouse or distribution] [Loading oriented]",
        "Historically associated with warehouse or distribution use and loading-oriented building functionality.",
        "These signals are based on historical Rofo data and do not represent current availability.",
        "```",
        "",
        "## Public-Safe Language Rules",
        "",
        "Use:",
        "- `Historically associated with...`",
        "- `Commonly positioned for...`",
        "- `Rofo has seen historical signals for...`",
        "",
        "Avoid:",
        "- `currently has`",
        "- `available`",
        "- `offers`",
        "- pricing language",
        "- suite-specific claims",
        "- move-in ready, furnished, plug-and-play, or current condition claims",
        "",
        "## 111-Building Preview",
        "",
        md_table(preview_rows, [
            "building",
            "location",
            "path",
            "approved_signals",
            "confidence_support",
            "chips",
            "context_sentence",
        ]),
        "",
        "## Recommendation",
        "",
        "The 111-building subset is strong enough for a prototype branch because every row is low-risk and ID-matched through the reviewed internal semantic source ID. It should still remain behind a prototype or review-only path until the copy and chip display are manually spot checked. The broader 961-record bridge should remain internal review only.",
    ]
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    ensure_dirs()
    rows = load_preview_rows()
    write_report(rows)
    print(f"Low-risk ID-matched preview buildings: {len(rows):,}")
    print(f"Wrote {REPORT_MD}")


if __name__ == "__main__":
    main()
