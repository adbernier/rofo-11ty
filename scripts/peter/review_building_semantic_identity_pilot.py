from __future__ import annotations

import csv
import json
import statistics
from collections import Counter, defaultdict
from pathlib import Path

from common import DERIVED_DIR, REPORTS_DIR, ensure_dirs


PILOT_JSON = DERIVED_DIR / "building_semantic_identity_pilot.json"
FULL_CSV = DERIVED_DIR / "building_semantic_identity_v1.csv"
QUALITY_CSV = DERIVED_DIR / "building_semantic_signal_quality_review.csv"
PILOT_REVIEW_MD = REPORTS_DIR / "building_semantic_identity_pilot_review.md"
LANGUAGE_GUIDE_MD = REPORTS_DIR / "building_semantic_public_language_guide.md"


APPROVE_SIGNALS = {
    "medical_office",
    "warehouse_distribution",
    "freeway_access",
    "loading_dock",
    "campus_environment",
    "waterfront",
    "retail_storefront",
    "showroom",
    "transit_oriented",
    "creative_office",
    "historic_building",
    "boutique_office",
    "professional_services",
}

REVIEW_SIGNALS = {
    "restaurant_food",
    "financial_services",
    "fitness",
    "flex_rd",
    "high_ceilings",
    "natural_light",
    "class_a",
    "startup_friendly",
    "high_clearance",
    "heavy_power",
    "biotech_lab",
    "law_firm",
}

SUPPRESS_SIGNALS = {
    "current_parking",
    "plug_and_play",
    "furnished",
    "move_in_ready",
    "current_buildout",
    "pricing_oriented",
    "nonprofit",
}

PUBLIC_LABELS = {
    "medical_office": "Medical office fit",
    "warehouse_distribution": "Warehouse or distribution fit",
    "freeway_access": "Freeway access context",
    "loading_dock": "Loading oriented",
    "campus_environment": "Campus environment",
    "waterfront": "Waterfront context",
    "retail_storefront": "Retail storefront environment",
    "showroom": "Showroom fit",
    "transit_oriented": "Transit oriented",
    "creative_office": "Creative office character",
    "historic_building": "Historic building character",
    "boutique_office": "Boutique office character",
    "professional_services": "Professional services fit",
    "restaurant_food": "Restaurant or food service fit",
    "financial_services": "Financial services fit",
    "fitness": "Fitness or wellness fit",
    "flex_rd": "Flex or R&D fit",
    "high_ceilings": "High ceiling environment",
    "natural_light": "Natural light mentioned historically",
    "class_a": "Class A environment",
    "startup_friendly": "Startup friendly pattern",
    "high_clearance": "High clearance signal",
    "heavy_power": "Heavy power signal",
    "biotech_lab": "Biotech or lab fit",
    "law_firm": "Law firm fit",
    "current_parking": "Parking mentioned historically",
    "plug_and_play": "Plug and play mentioned historically",
    "furnished": "Furnished mentioned historically",
    "move_in_ready": "Move in ready mentioned historically",
    "current_buildout": "Current buildout mentioned historically",
    "pricing_oriented": "Pricing oriented language",
    "nonprofit": "Nonprofit tenant pattern",
}

APPROVE_NOTES = {
    "medical_office": "Durable tenant fit when repeated across historical records.",
    "warehouse_distribution": "Usually tied to building function rather than current availability.",
    "freeway_access": "Location context is durable, but public copy should avoid exact route claims unless reviewed.",
    "loading_dock": "Operational signal that can describe building environment when repeated.",
    "campus_environment": "Generally stable property positioning.",
    "waterfront": "Durable location context.",
    "retail_storefront": "Useful for tenant fit, though mixed use buildings should be reviewed.",
    "showroom": "Useful environment signal for retail, design, or trade users.",
    "transit_oriented": "Durable location context when evidence is specific.",
    "creative_office": "Useful building character signal when backed by repeated evidence.",
    "historic_building": "Durable identity signal when present.",
    "boutique_office": "Useful positioning signal if repeated or building level.",
    "professional_services": "Useful tenant fit signal, but best as soft contextual language.",
}

REVIEW_NOTES = {
    "restaurant_food": "Can be noisy because kitchens and food amenities may be suite level or nearby amenities.",
    "financial_services": "May reflect old tenant targeting rather than building identity.",
    "fitness": "May describe a gym tenant, a nearby amenity, or a wellness use.",
    "flex_rd": "Useful but often ambiguous between flex space, R&D, and generic flexible layout language.",
    "high_ceilings": "Can be a durable physical trait, but often suite level.",
    "natural_light": "Usually suite-level marketing language, not always building identity.",
    "class_a": "Useful if verified, but legacy marketing can overstate class.",
    "startup_friendly": "Tenant-fit language that can become subjective.",
    "high_clearance": "Likely durable for industrial, but should be reviewed for context.",
    "heavy_power": "Operationally useful but should not be surfaced without stronger verification.",
    "biotech_lab": "High-value signal, but false positives are costly and should be reviewed.",
    "law_firm": "May describe prior tenant targeting rather than building identity.",
}

SUPPRESS_NOTES = {
    "current_parking": "Parking is too current-condition sensitive for public use without fresh verification.",
    "plug_and_play": "Transient listing condition.",
    "furnished": "Transient suite condition.",
    "move_in_ready": "Availability and current condition claim.",
    "current_buildout": "Suite-level current condition claim.",
    "pricing_oriented": "Pricing language should not be exposed from historical records.",
    "nonprofit": "Tenant-type targeting can be sensitive and weak as public building identity.",
}


def recommendation_for(signal_key: str) -> str:
    if signal_key in APPROVE_SIGNALS:
        return "approve"
    if signal_key in REVIEW_SIGNALS:
        return "review"
    if signal_key in SUPPRESS_SIGNALS:
        return "suppress"
    return "review"


def noise_for(signal_key: str, avg_confidence: float, pilot_count: int) -> str:
    if signal_key in SUPPRESS_SIGNALS:
        return "high"
    if signal_key in REVIEW_SIGNALS:
        return "medium"
    if avg_confidence >= 0.82 and pilot_count >= 5:
        return "low"
    return "medium"


def md_table(rows: list[dict], cols: list[str]) -> str:
    lines = ["| " + " | ".join(cols) + " |", "| " + " | ".join(["---"] * len(cols)) + " |"]
    for row in rows:
        values = [str(row.get(col, "")).replace("|", "\\|").replace("\n", " ") for col in cols]
        lines.append("| " + " | ".join(values) + " |")
    return "\n".join(lines)


def load_total_safe_counts() -> Counter:
    counts = Counter()
    with FULL_CSV.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            for signal_key in (row.get("semantic_identity_signals") or "").split("|"):
                if signal_key:
                    counts[signal_key] += 1
    return counts


def collect_pilot_stats(records: list[dict]) -> tuple[dict, dict]:
    stats = defaultdict(lambda: {"confidences": [], "examples": [], "support_counts": []})
    internal_stats = defaultdict(lambda: {"confidences": [], "examples": [], "support_counts": []})
    for record in records:
        for signal in record.get("semantic_identity_signals", []):
            item = stats[signal["signal_key"]]
            item["confidences"].append(float(signal.get("confidence") or 0))
            item["support_counts"].append(int(signal.get("supporting_listing_count") or 0))
            if len(item["examples"]) < 8:
                item["examples"].append((record, signal))
        for signal in record.get("internal_only_signals", []):
            item = internal_stats[signal["signal_key"]]
            item["confidences"].append(float(signal.get("confidence") or 0))
            item["support_counts"].append(int(signal.get("supporting_listing_count") or 0))
            if len(item["examples"]) < 8:
                item["examples"].append((record, signal))
    return stats, internal_stats


def write_quality_csv(records: list[dict], safe_totals: Counter, stats: dict, internal_stats: dict) -> list[dict]:
    all_keys = sorted(set(safe_totals) | set(stats) | set(internal_stats) | APPROVE_SIGNALS | REVIEW_SIGNALS | SUPPRESS_SIGNALS)
    rows = []
    for signal_key in all_keys:
        signal_stats = stats.get(signal_key) or internal_stats.get(signal_key) or {"confidences": [], "examples": [], "support_counts": []}
        confidences = signal_stats["confidences"]
        avg_confidence = round(statistics.mean(confidences), 3) if confidences else ""
        median_confidence = round(statistics.median(confidences), 3) if confidences else ""
        pilot_count = len(confidences)
        strongest = sum(1 for value in confidences if value >= 0.85)
        recommendation = recommendation_for(signal_key)
        notes = APPROVE_NOTES.get(signal_key) or REVIEW_NOTES.get(signal_key) or SUPPRESS_NOTES.get(signal_key) or "Needs manual sample review before public use."
        total_count = safe_totals.get(signal_key, 0)
        if total_count == 0 and pilot_count:
            notes = f"Internal-only pilot count used because full CSV contains production-safe signals only. {notes}"
        rows.append({
            "signal_key": signal_key,
            "public_label": PUBLIC_LABELS.get(signal_key, signal_key.replace("_", " ").title()),
            "total_count": total_count or pilot_count,
            "pilot_count": pilot_count,
            "average_confidence": avg_confidence,
            "median_confidence": median_confidence,
            "strongest_examples_count": strongest,
            "suspected_noise_level": noise_for(signal_key, float(avg_confidence or 0), pilot_count),
            "production_recommendation": "internal_only" if recommendation == "suppress" else recommendation,
            "notes": notes,
        })
    rows.sort(key=lambda row: (
        {"approve": 0, "review": 1, "internal_only": 2, "suppress": 3}.get(row["production_recommendation"], 4),
        -int(row["pilot_count"] or 0),
        row["signal_key"],
    ))
    with QUALITY_CSV.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    return rows


def building_label(record: dict) -> str:
    return record.get("building_name") or record.get("address") or f"Building {record.get('building_id')}"


def signal_explanation(signal_key: str, signal: dict, record: dict) -> str:
    support = int(signal.get("supporting_listing_count") or 0)
    has_building_evidence = bool(signal.get("supporting_building_evidence"))
    if signal_key in APPROVE_SIGNALS:
        if has_building_evidence:
            return "Credible because the signal appears in building-level text and historical listing evidence."
        if support >= 10:
            return "Credible because repeated historical listing evidence points to a durable building or location pattern."
        return "Potentially credible, but should be checked because support is thinner."
    if signal_key in REVIEW_SIGNALS:
        return REVIEW_NOTES.get(signal_key, "Potentially useful but context-dependent.")
    return SUPPRESS_NOTES.get(signal_key, "Keep internal until reviewed.")


def pick_examples_for_report(stats: dict, internal_stats: dict) -> list[tuple[str, str, list[tuple[dict, dict]]]]:
    sections = []
    preferred = [
        "medical_office",
        "warehouse_distribution",
        "freeway_access",
        "loading_dock",
        "campus_environment",
        "waterfront",
        "retail_storefront",
        "showroom",
        "transit_oriented",
        "restaurant_food",
        "financial_services",
        "fitness",
        "flex_rd",
        "high_ceilings",
        "current_parking",
        "plug_and_play",
        "furnished",
    ]
    for signal_key in preferred:
        source = stats.get(signal_key) or internal_stats.get(signal_key)
        if not source:
            continue
        examples = sorted(
            source["examples"],
            key=lambda pair: (pair[1].get("confidence") or 0, pair[1].get("supporting_listing_count") or 0),
            reverse=True,
        )[:3]
        sections.append((signal_key, PUBLIC_LABELS.get(signal_key, signal_key), examples))
    return sections


def write_pilot_review(records: list[dict], quality_rows: list[dict], stats: dict, internal_stats: dict) -> int:
    sections = pick_examples_for_report(stats, internal_stats)
    max_examples = 50
    trimmed_sections = []
    remaining = max_examples
    for signal_key, label, examples in sections:
        if remaining <= 0:
            break
        kept = examples[:remaining]
        trimmed_sections.append((signal_key, label, kept))
        remaining -= len(kept)
    sections = trimmed_sections
    reviewed_count = sum(len(examples) for _, _, examples in sections)
    approve_rows = [row for row in quality_rows if row["production_recommendation"] == "approve"]
    review_rows = [row for row in quality_rows if row["production_recommendation"] == "review"]
    suppress_rows = [row for row in quality_rows if row["production_recommendation"] == "internal_only"]

    lines = [
        "# Building Semantic Identity Pilot Review",
        "",
        "## Purpose",
        "",
        "This review narrows the Building Semantic Identity v1 output into signals that are likely safe for future public display. The review is intentionally conservative: Rofo should describe durable building identity and historical environment patterns, not current inventory, pricing, or availability.",
        "",
        "## Pilot Dataset",
        "",
        f"- Pilot records reviewed by script: {len(records):,}",
        f"- Representative examples included below: {reviewed_count:,}",
        "- Source: `data/peter/derived/building_semantic_identity_pilot.json`",
        "",
        "## Signal Buckets",
        "",
        "### Approve for Possible Public Display",
        "",
        md_table(approve_rows, ["signal_key", "public_label", "pilot_count", "average_confidence", "suspected_noise_level", "notes"]),
        "",
        "### Review Carefully",
        "",
        md_table(review_rows, ["signal_key", "public_label", "pilot_count", "average_confidence", "suspected_noise_level", "notes"]),
        "",
        "### Internal Only or Suppress",
        "",
        md_table(suppress_rows, ["signal_key", "public_label", "pilot_count", "average_confidence", "suspected_noise_level", "notes"]),
        "",
        "## Representative Building Examples",
        "",
    ]

    for signal_key, label, examples in sections:
        lines.extend([f"### {label}", ""])
        rows = []
        for record, signal in examples:
            rows.append({
                "building": building_label(record),
                "city": record.get("city", ""),
                "state": record.get("state", ""),
                "confidence": signal.get("confidence", ""),
                "support": signal.get("supporting_listing_count", ""),
                "evidence": ", ".join(signal.get("evidence", [])[:3]),
                "review_note": signal_explanation(signal_key, signal, record),
            })
        lines.extend([md_table(rows, ["building", "city", "state", "confidence", "support", "evidence", "review_note"]), ""])

    lines.extend([
        "## Data Quality Concerns",
        "",
        "- Some legacy building names contain encoding artifacts or missing names.",
        "- Some signals are strongly repeated because one building had many historical listing rows with similar marketing copy.",
        "- Location signals such as transit or freeway access are more durable than suite condition signals, but they should still avoid exact unverified claims.",
        "- Restaurant, fitness, and financial services can describe tenant targeting, nearby amenities, or previous tenants rather than building identity.",
        "- The full v1 CSV only contains production-safe signal counts, so internal-only full-population counts require a later compact aggregation if needed.",
        "",
        "## UI Recommendation",
        "",
        "- Start with a reviewed signal whitelist, not the full production-safe list.",
        "- Use small semantic chips only for approved signals.",
        "- Add a short `Building Environment` summary only when 2 or more approved signals are present.",
        "- Use language such as `Historically associated with` or `Rofo has seen historical signals for`.",
        "- Do not show suite, rent, pricing, availability, furnished, plug-and-play, or move-in-ready claims from historical data.",
        "",
        "## Next Step",
        "",
        "Manually review the strongest pilot examples for approved signals, then create a small whitelist for prototype display on a limited set of building or neighborhood pages.",
    ])
    PILOT_REVIEW_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return reviewed_count


def write_language_guide() -> None:
    lines = [
        "# Building Semantic Public Language Guide",
        "",
        "## Purpose",
        "",
        "This guide defines how Rofo should describe semantic building identity if these signals are later surfaced publicly. The language must make clear that signals come from historical building and listing context, not current availability.",
        "",
        "## Recommended Framing",
        "",
        "- `Historically associated with...`",
        "- `Often marketed for...`",
        "- `Commonly positioned as...`",
        "- `Rofo has seen historical signals for...`",
        "- `Historical marketing patterns suggest...`",
        "- `This building has been associated with...`",
        "",
        "## Avoid",
        "",
        "- `Available now`",
        "- `Currently has`",
        "- `This building offers`",
        "- `Asking rent`",
        "- `Move-in ready`",
        "- `Guaranteed`",
        "- `Current availability`",
        "- `Vacant suites`",
        "- `Plug and play` unless freshly verified",
        "- `Furnished` unless freshly verified",
        "",
        "## Approved Signal Copy Examples",
        "",
        "| Signal | Safer public wording |",
        "| --- | --- |",
        "| medical_office | `Rofo has seen historical signals for medical office use at this building.` |",
        "| warehouse_distribution | `Historically associated with warehouse or distribution-oriented use.` |",
        "| freeway_access | `Historical marketing often emphasized regional access.` |",
        "| loading_dock | `Historical records suggest loading-oriented building functionality.` |",
        "| campus_environment | `Commonly positioned as part of a campus-style business environment.` |",
        "| waterfront | `Historically marketed with waterfront or waterfront-adjacent context.` |",
        "| retail_storefront | `Often associated with storefront or customer-facing retail use.` |",
        "| showroom | `Historical signals suggest showroom-oriented use may fit the building context.` |",
        "| transit_oriented | `Historical marketing frequently referenced transit access or transit-oriented location context.` |",
        "| creative_office | `Often positioned for creative office users in historical marketing language.` |",
        "| boutique_office | `Historical signals suggest boutique office positioning.` |",
        "| professional_services | `Historically associated with professional services users.` |",
        "",
        "## UI Recommendations",
        "",
        "- Use small semantic chips below building identity or context sections.",
        "- Add a short `Building Environment` section only when multiple approved signals agree.",
        "- Keep chips secondary to factual building name, address, city, and market context.",
        "- Use tooltip or helper copy to explain that signals are historical and reviewed.",
        "- Avoid any layout that looks like live inventory, suite listings, pricing, or availability.",
        "",
        "## Suggested Public Disclaimer",
        "",
        "`These building environment signals are based on historical Rofo data and reviewed semantic patterns. They do not represent current availability, pricing, or active listing details.`",
        "",
        "## Internal Review Rule",
        "",
        "A signal should not become public just because it appears in the v1 production-safe output. Public use should require signal whitelist approval, spot review of examples, and conservative phrasing.",
    ]
    LANGUAGE_GUIDE_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    ensure_dirs()
    records = json.loads(PILOT_JSON.read_text(encoding="utf-8"))
    safe_totals = load_total_safe_counts()
    stats, internal_stats = collect_pilot_stats(records)
    quality_rows = write_quality_csv(records, safe_totals, stats, internal_stats)
    reviewed_count = write_pilot_review(records, quality_rows, stats, internal_stats)
    write_language_guide()
    print(f"Pilot records loaded: {len(records):,}")
    print(f"Representative examples reviewed: {reviewed_count:,}")
    print(f"Signal quality rows: {len(quality_rows):,}")
    print(f"Wrote {QUALITY_CSV}")
    print(f"Wrote {PILOT_REVIEW_MD}")
    print(f"Wrote {LANGUAGE_GUIDE_MD}")


if __name__ == "__main__":
    main()
