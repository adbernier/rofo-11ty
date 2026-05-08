from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MATCH_REVIEW_CSV = ROOT / "data/peter/derived/active_building_semantic_match_review.csv"
OUTPUT_JSON = ROOT / "_data/semanticBuildingPreview.json"

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


def main() -> None:
    preview = {}
    with MATCH_REVIEW_CSV.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            if row.get("risk_flag") != "low":
                continue
            if row.get("match_method") != "building_id":
                continue
            building_id = (row.get("building_id") or "").strip()
            signals = parse_pipe(row.get("approved_signals"))
            if not building_id or not signals:
                continue
            confidence = parse_json(row.get("confidence"))
            support_counts = parse_json(row.get("support_counts"))
            labels = [SIGNAL_LABELS.get(signal, signal.replace("_", " ").title()) for signal in signals]
            preview[building_id] = {
                "semantic_source_building_id": building_id,
                "building_path": row.get("production_building_path", ""),
                "signal_keys": signals,
                "signal_labels": labels,
                "context_sentence": context_sentence(signals),
                "confidence": {signal: confidence.get(signal, "") for signal in signals},
                "support_counts": {signal: support_counts.get(signal, "") for signal in signals},
            }

    OUTPUT_JSON.write_text(json.dumps(preview, indent=2, sort_keys=True), encoding="utf-8")
    print(f"Wrote {len(preview):,} semantic building preview records to {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
