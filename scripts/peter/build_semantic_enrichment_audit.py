from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

import pandas as pd

from common import DERIVED_DIR, RAW_DIR, REPORTS_DIR, clean_text, ensure_dirs


TEXT_FIELD_CANDIDATES = {
    "rofo_broker_houses.csv": [
        ("company", "Broker or company identity can help attribute sources and identify operator brands.", "structured"),
        ("website", "Sparse source URL field for broker houses.", "structured"),
        ("description", "Only broker/company level rich prose in the raw CSV exports.", "free text"),
    ],
    "rofo_buildings.csv": [
        ("name", "Building names can reveal towers, centers, plazas, suites, and branded properties.", "semi-structured"),
        ("address", "Core building identity and future matching key.", "structured"),
        ("county", "Useful for market routing and county-level context where present.", "structured"),
        ("metro", "Useful for market clustering where present.", "structured"),
        ("building_size", "Structured size signal for scale and tenant fit.", "structured"),
        ("floors", "Structured verticality signal, helpful for tower versus low-rise inference.", "structured"),
        ("units", "Structured multi-tenant signal.", "structured"),
        ("min_size", "Historical space-size signal, not live availability.", "structured"),
        ("max_size", "Historical space-size signal, not live availability.", "structured"),
        ("listing_count", "Historical leasing activity intensity, not live availability.", "structured"),
        ("has_association", "Whether building was associated with listings or tour requests.", "structured"),
    ],
    "rofo_listings.csv": [
        ("square_footage", "Historical size signal at listing level, not live availability.", "structured"),
        ("space_type", "Numeric legacy space type. Useful after mapping validation.", "structured"),
        ("lease_type", "Numeric legacy lease type. Useful after mapping validation.", "structured"),
        ("listing_type", "Lease versus sale classification.", "structured"),
        ("price_type", "Structured rent basis signal, useful only as historical context.", "structured"),
        ("source", "Feed/source signal, currently LMS or USR in this export.", "structured"),
        ("external_url", "Sparse URL source field. Could indicate source system but is not rich text.", "semi-structured"),
    ],
    "rofo_leads.csv": [
        ("lead_type", "Lead source context: building, listing, or space need.", "structured"),
        ("space_type", "Numeric tenant-request space type. Useful after mapping validation.", "structured"),
        ("size_needed", "Tenant-request size signal.", "structured"),
        ("timing", "Tenant intent timing.", "structured"),
        ("message_text", "Largest rich text field. Tenant-written needs can reveal fit, use, operational requirements, and spam/noise.", "free text"),
        ("source", "Site, mobile, or pdf source context.", "structured"),
        ("status", "Lead state from legacy export.", "structured"),
    ],
    "rofo_market_summary.csv": [
        ("building_count", "Market depth signal.", "structured"),
        ("listing_count", "Historical listing activity intensity by market.", "structured"),
        ("lead_count", "Historical tenant demand signal by market.", "structured"),
        ("distinct_brokers", "Market participant density signal.", "structured"),
        ("distinct_landlords", "Market owner/operator density signal.", "structured"),
    ],
    "cities_from_legacy.csv": [
        ("c_description", "Legacy city description, if populated.", "free text"),
        ("c_use_description", "Legacy boolean-like city description usage flag, not a rich semantic field.", "structured"),
    ],
    "neighborhoods_from_legacy.csv": [
        ("n_description", "Legacy neighborhood description, if populated.", "free text"),
        ("n_summary", "Legacy neighborhood summary, if populated.", "free text"),
    ],
}


SPACE_TYPE_GUESS = {
    1: "likely_office",
    2: "likely_retail",
    3: "likely_industrial",
    8: "unknown_8",
    9: "unknown_9",
    10: "unknown_10",
    11: "unknown_11",
    12: "unknown_12",
    13: "unknown_13",
}


TAXONOMY = [
    ("creative_office", "Creative Office", "Workspace Style", ["creative office", "creative space", "creative suite", "studio office"], "medium", "Best from broker marketing text. Sparse in current exports, appears mostly in tenant messages."),
    ("brick_and_timber", "Brick and Timber", "Building Character", ["brick and timber", "brick & timber", "exposed brick", "timber beams"], "high", "Strong phrase-level match when present."),
    ("exposed_ceiling", "Exposed Ceiling", "Building Character", ["exposed ceiling", "exposed ceilings", "exposed duct", "open ceiling"], "high", "Usually reliable in marketing copy."),
    ("class_a", "Class A", "Market Position", ["class a", "class-a", "premier tower", "institutional quality"], "medium", "Can be overused in marketing copy."),
    ("boutique_office", "Boutique Office", "Building Character", ["boutique office", "boutique building", "small building"], "medium", "Useful for neighborhood pages and smaller tenant fit."),
    ("high_rise", "High Rise", "Building Character", ["high-rise", "high rise", "tower", "skyline"], "medium", "Also inferable from floors once thresholds are set."),
    ("plug_and_play", "Plug and Play", "Workspace Style", ["plug and play", "plug-and-play", "move-in ready", "turnkey"], "high", "Good signal for immediate occupancy fit, but avoid live availability claims."),
    ("furnished", "Furnished", "Workspace Style", ["furnished", "furniture included", "fully furnished"], "high", "Relevant if found in current descriptions or future feeds."),
    ("coworking_ready", "Coworking or Executive Suite", "Workspace Style", ["coworking", "co-working", "executive suite", "shared office", "serviced office"], "high", "Can be extracted from text and source/operator names."),
    ("transit_adjacent", "Transit Adjacent", "Access + Mobility", ["near bart", "steps from bart", "close to bart", "near muni", "transit", "train station", "metro station"], "medium", "Needs city-specific transit vocabulary for precision."),
    ("freeway_access", "Freeway Access", "Access + Mobility", ["freeway access", "highway access", "near i-", "interstate", "easy access to"], "medium", "Useful for suburban, industrial, and flex contexts."),
    ("parking_heavy", "Parking Heavy", "Access + Mobility", ["ample parking", "abundant parking", "surface parking", "parking ratio", "on-site parking"], "medium", "Strong when explicit. Parking-sensitive pages should avoid unsupported claims."),
    ("walkable_amenities", "Walkable Amenities", "Amenities + Environment", ["walkable", "walking distance", "restaurants", "coffee", "shops nearby", "amenities nearby"], "medium", "Good neighborhood enrichment signal."),
    ("amenity_rich", "Amenity Rich", "Amenities + Environment", ["amenity rich", "amenities include", "fitness center", "conference center", "tenant lounge", "rooftop"], "medium", "Requires source text to avoid generic claims."),
    ("waterfront", "Waterfront", "Amenities + Environment", ["waterfront", "water view", "bay view", "riverfront", "harbor"], "medium", "Useful for identity and comparison pages."),
    ("biotech_lab", "Biotech or Lab", "Tenant Fit", ["lab", "laboratory", "life science", "biotech", "wet lab", "clean room"], "high", "Strong tenant-fit signal."),
    ("medical_user", "Medical User", "Tenant Fit", ["medical", "clinic", "dental", "healthcare", "exam room", "doctor"], "high", "Appears in lead messages and can guide demand context."),
    ("retail_storefront", "Retail Storefront", "Tenant Fit", ["storefront", "retail", "boutique", "salon", "restaurant", "cafe"], "medium", "Should be cross-checked with space_type once mapping is confirmed."),
    ("showroom", "Showroom", "Tenant Fit", ["showroom", "display room", "gallery", "sales floor"], "high", "Useful for retail, flex, and design districts."),
    ("startup_fit", "Startup Fit", "Tenant Fit", ["startup", "start-up", "small team", "growth team", "founder"], "medium", "More reliable from tenant messages than building attributes."),
    ("professional_services", "Professional Services", "Tenant Fit", ["law firm", "legal", "accounting", "consulting", "advisor", "professional services"], "medium", "Good for district identity when aggregated."),
    ("hq_candidate", "HQ Candidate", "Tenant Fit", ["headquarters", "hq", "corporate office", "flagship"], "medium", "Needs cautious use because tenant intent may be aspirational."),
    ("warehouse_distribution", "Warehouse or Distribution", "Operational Signals", ["warehouse", "distribution", "logistics", "storage", "fulfillment"], "high", "Strong industrial/flex signal."),
    ("loading_dock", "Loading Dock", "Operational Signals", ["loading dock", "dock high", "dock-high", "grade level", "roll-up door", "drive-in"], "high", "Strong operational signal."),
    ("high_ceiling", "High Ceilings", "Operational Signals", ["high ceiling", "high ceilings", "clear height", "clearance", "clear span"], "high", "Industrial/flex relevance."),
    ("heavy_power", "Heavy Power", "Operational Signals", ["heavy power", "3 phase", "three phase", "amps", "power capacity"], "high", "Industrial/manufacturing relevance."),
    ("flex_rd", "Flex or R&D", "Operational Signals", ["flex", "r&d", "research and development", "office warehouse", "office/warehouse"], "medium", "Needs disambiguation because flex can be generic."),
    ("campus_environment", "Campus Environment", "Building Character", ["campus", "business park", "office park", "corporate campus"], "medium", "Useful for suburban office and R&D pages."),
    ("value_oriented", "Value Oriented", "Market Position", ["affordable", "low cost", "below market", "value", "economical"], "low", "Use carefully; can age poorly and may be subjective."),
    ("premium_position", "Premium Position", "Market Position", ["premium", "trophy", "landmark", "iconic", "prestige"], "medium", "Marketing-heavy, but useful as a soft signal."),
]


def read_source_file(file_name: str) -> pd.DataFrame:
    if file_name.endswith("_from_legacy.csv"):
        return pd.read_csv(DERIVED_DIR / file_name, low_memory=False)
    return pd.read_csv(RAW_DIR / file_name, low_memory=False)


def compact_sample(series: pd.Series, limit: int = 3) -> list[str]:
    values = []
    for value in series.dropna().astype(str):
        value = re.sub(r"\s+", " ", value).strip()
        if not value or value in values:
            continue
        values.append(value[:180])
        if len(values) >= limit:
            break
    return values


def pct(value: int, total: int) -> str:
    if total == 0:
        return "0.0%"
    return f"{(value / total) * 100:.1f}%"


def build_field_inventory() -> pd.DataFrame:
    rows = []
    for file_name, fields in TEXT_FIELD_CANDIDATES.items():
        df = read_source_file(file_name)
        total = len(df)
        for field_name, usefulness, field_type in fields:
            if field_name not in df.columns:
                continue
            nonblank = df[field_name].notna() & (df[field_name].astype(str).str.strip() != "")
            avg_len = 0
            max_len = 0
            if nonblank.any():
                lengths = df.loc[nonblank, field_name].astype(str).str.len()
                avg_len = round(float(lengths.mean()), 1)
                max_len = int(lengths.max())
            rows.append({
                "file_name": file_name,
                "field_name": field_name,
                "field_type": field_type,
                "nonblank_rows": int(nonblank.sum()),
                "total_rows": int(total),
                "completeness": pct(int(nonblank.sum()), int(total)),
                "average_length": avg_len,
                "max_length": max_len,
                "why_useful": usefulness,
                "sample_values": " | ".join(compact_sample(df.loc[nonblank, field_name])),
            })
    output = pd.DataFrame(rows)
    output.to_csv(DERIVED_DIR / "building_enrichment_field_inventory.csv", index=False)
    return output


def normalize_text(value) -> str:
    text = clean_text(value)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def taxonomy_records() -> list[dict]:
    return [
        {
            "signal_key": key,
            "human_label": label,
            "parent_group": group,
            "trigger_words": triggers,
            "confidence_level": confidence,
            "notes": notes,
        }
        for key, label, group, triggers, confidence, notes in TAXONOMY
    ]


def detect_signals(text: str) -> dict:
    lowered = f" {text.lower()} "
    signals = {}
    for record in taxonomy_records():
        evidence = []
        for trigger in record["trigger_words"]:
            pattern = trigger_pattern(trigger)
            if re.search(pattern, lowered):
                evidence.append(trigger)
        if evidence:
            base = {"high": 0.82, "medium": 0.68, "low": 0.5}[record["confidence_level"]]
            confidence = min(0.96, base + (len(evidence) - 1) * 0.04)
            signals[record["signal_key"]] = {
                "matched": True,
                "confidence": round(confidence, 2),
                "evidence": evidence[:5],
                "label": record["human_label"],
                "group": record["parent_group"],
            }
    return signals


def trigger_pattern(trigger: str) -> str:
    escaped = re.escape(trigger.lower())
    prefix = r"(?<![a-z0-9])" if re.match(r"^[a-z0-9]", trigger.lower()) else ""
    suffix = r"(?![a-z0-9])" if re.search(r"[a-z0-9]$", trigger.lower()) else ""
    return f"{prefix}{escaped}{suffix}"


def tenant_fit_from_signals(signals: dict) -> list[str]:
    mapping = {
        "biotech_lab": "biotech or lab users",
        "medical_user": "medical users",
        "retail_storefront": "retail and service businesses",
        "showroom": "showroom users",
        "startup_fit": "startups",
        "professional_services": "professional services firms",
        "warehouse_distribution": "warehouse and logistics users",
        "flex_rd": "flex or R&D users",
        "hq_candidate": "headquarters candidates",
    }
    return [label for key, label in mapping.items() if key in signals]


def summary_tags(signals: dict) -> list[str]:
    return [value["label"] for _, value in sorted(signals.items(), key=lambda item: item[1]["confidence"], reverse=True)[:6]]


def sample_rich_text() -> pd.DataFrame:
    leads = pd.read_csv(
        RAW_DIR / "rofo_leads.csv",
        usecols=["lead_id", "listing_id", "building_id", "city", "state", "space_type", "size_needed", "timing", "source", "message_text"],
        low_memory=False,
    )
    leads["clean_text"] = leads["message_text"].map(normalize_text)
    leads = leads[leads["clean_text"].str.len() >= 30].copy()
    leads = leads[~leads["clean_text"].map(is_obvious_noise)].copy()
    leads = leads.drop_duplicates("clean_text")
    leads["signals"] = leads["clean_text"].map(detect_signals)
    leads["signal_count"] = leads["signals"].map(len)
    signal_hits = leads[leads["signal_count"] > 0].copy()

    buildings = pd.read_csv(
        RAW_DIR / "rofo_buildings.csv",
        usecols=["building_id", "name", "address", "city", "state", "listing_count"],
        low_memory=False,
    )
    signal_hits = signal_hits.merge(
        buildings.rename(columns={"city": "building_city", "state": "building_state"}),
        on="building_id",
        how="left",
    )

    samples = []
    used_ids = set()
    # Ensure samples across the most interpretable legacy space type codes.
    for code in [1, 2, 3, 8, 10, 12]:
        subset = signal_hits[signal_hits["space_type"] == code].sort_values(["signal_count", "lead_id"], ascending=[False, True])
        for _, row in subset.head(5).iterrows():
            if row["lead_id"] in used_ids:
                continue
            used_ids.add(row["lead_id"])
            samples.append(row)

    # Add a few high-signal records independent of code.
    for _, row in signal_hits.sort_values(["signal_count", "lead_id"], ascending=[False, True]).head(30).iterrows():
        if row["lead_id"] in used_ids:
            continue
        used_ids.add(row["lead_id"])
        samples.append(row)
        if len(samples) >= 50:
            break

    output_rows = []
    json_rows = []
    for row in samples:
        signals = row["signals"]
        excerpt = row["clean_text"][:500]
        output_rows.append({
            "lead_id": row["lead_id"],
            "listing_id": row["listing_id"],
            "building_id": row["building_id"],
            "building_name": clean_text(row.get("name", "")),
            "address": clean_text(row.get("address", "")),
            "city": clean_text(row.get("city", "")) or clean_text(row.get("building_city", "")),
            "state": clean_text(row.get("state", "")) or clean_text(row.get("building_state", "")),
            "source": clean_text(row.get("source", "")),
            "space_type_code": row["space_type"],
            "space_type_guess": SPACE_TYPE_GUESS.get(int(row["space_type"]), f"unknown_{row['space_type']}"),
            "size_needed": row["size_needed"],
            "text_excerpt": excerpt,
            "detected_signals": ", ".join(summary_tags(signals)),
            "evidence": json.dumps({key: value["evidence"] for key, value in signals.items()}),
        })
        json_rows.append({
            "building_id": str(row["building_id"]),
            "listing_id": str(row["listing_id"]),
            "lead_id": str(row["lead_id"]),
            "address": clean_text(row.get("address", "")),
            "city": clean_text(row.get("city", "")) or clean_text(row.get("building_city", "")),
            "state": clean_text(row.get("state", "")) or clean_text(row.get("building_state", "")),
            "source": clean_text(row.get("source", "")),
            "space_type_code": int(row["space_type"]),
            "space_type_guess": SPACE_TYPE_GUESS.get(int(row["space_type"]), f"unknown_{row['space_type']}"),
            "signals": signals,
            "tenant_fit": tenant_fit_from_signals(signals),
            "summary_tags": summary_tags(signals),
        })

    output = pd.DataFrame(output_rows)
    output.to_csv(DERIVED_DIR / "building_semantic_text_samples.csv", index=False)
    with (DERIVED_DIR / "building_semantic_signal_samples.json").open("w", encoding="utf-8") as fh:
        json.dump(json_rows[:30], fh, indent=2)
    return output


def is_obvious_noise(text: str) -> bool:
    lowered = text.lower()
    noisy_phrases = [
        "contact your local fbi",
        "police won't help",
        "casino",
        "backlink",
        "seo service",
        "guest post",
        "move in your office building",
    ]
    return any(phrase in lowered for phrase in noisy_phrases)


def lead_keyword_profile() -> pd.DataFrame:
    leads = pd.read_csv(RAW_DIR / "rofo_leads.csv", usecols=["space_type", "message_text"], low_memory=False)
    leads["text"] = leads["message_text"].fillna("").astype(str).str.lower()
    terms = [
        "office", "retail", "warehouse", "industrial", "medical", "restaurant", "showroom",
        "cowork", "executive suite", "flex", "parking", "bart", "loading", "lab",
    ]
    rows = []
    for code, group in leads.groupby("space_type"):
        row = {"space_type_code": code, "row_count": len(group), "space_type_guess": SPACE_TYPE_GUESS.get(int(code), f"unknown_{code}")}
        for term in terms:
            row[term] = int(group["text"].str.contains(trigger_pattern(term), regex=True).sum())
        rows.append(row)
    output = pd.DataFrame(rows).sort_values("row_count", ascending=False)
    output.to_csv(DERIVED_DIR / "building_semantic_lead_keyword_profile.csv", index=False)
    return output


def md_table(df: pd.DataFrame, columns: list[str], limit: int | None = None) -> str:
    subset = df[columns].head(limit) if limit else df[columns]
    if subset.empty:
        return "_No rows._"
    headers = list(subset.columns)
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]
    for _, row in subset.iterrows():
        cells = []
        for header in headers:
            value = clean_text(row[header])
            value = value.replace("|", "\\|").replace("\n", " ")
            cells.append(value)
        lines.append("| " + " | ".join(cells) + " |")
    return "\n".join(lines)


def write_reports(field_inventory: pd.DataFrame, samples: pd.DataFrame, keyword_profile: pd.DataFrame) -> None:
    taxonomy = pd.DataFrame(taxonomy_records())
    taxonomy["trigger_words"] = taxonomy["trigger_words"].map(lambda values: ", ".join(values))
    taxonomy.to_csv(DERIVED_DIR / "building_enrichment_taxonomy_v1.csv", index=False)

    raw_files = []
    for path in sorted(RAW_DIR.glob("*.csv")):
        df = pd.read_csv(path, nrows=0, low_memory=False)
        raw_files.append({"file": path.name, "columns": len(df.columns), "column_names": ", ".join(df.columns)})

    inventory_report = [
        "# Building Enrichment Field Inventory",
        "",
        "This audit reviews the Peter legacy exports for fields that can support static building enrichment and semantic extraction.",
        "",
        "## Available Raw CSV Files",
        "",
        md_table(pd.DataFrame(raw_files), ["file", "columns", "column_names"]),
        "",
        "## Most Useful Enrichment Fields",
        "",
        md_table(field_inventory, ["file_name", "field_name", "field_type", "completeness", "average_length", "max_length", "why_useful", "sample_values"]),
        "",
        "## Key Finding",
        "",
        "The current `rofo_listings.csv` export does not include broker-written listing descriptions, highlights, amenities, or marketing remarks. That limits building-level semantic extraction from listing copy. The strongest available free-text field is `rofo_leads.csv.message_text`, which describes tenant needs rather than building attributes. Structured building and listing fields remain useful for historical activity, size, space-type, price-basis, and source signals.",
    ]
    (REPORTS_DIR / "building_enrichment_field_inventory.md").write_text("\n".join(inventory_report) + "\n", encoding="utf-8")

    sample_report = [
        "# Building Semantic Sample Review",
        "",
        "This review samples representative rich text from the current exports. Because listing descriptions are not present, samples primarily come from tenant lead messages. These are useful for tenant-fit and demand semantics, but they should not be treated as building marketing copy.",
        "",
        "## Legacy Space Type Caveat",
        "",
        "The export stores `space_type` as numeric codes. Keyword distribution suggests code `1` is likely office, `2` is likely retail, and `3` is likely industrial, but this should be confirmed against the legacy application constants before production use.",
        "",
        "## Keyword Profile by Lead Space Type Code",
        "",
        md_table(keyword_profile, list(keyword_profile.columns)),
        "",
        "## Representative Samples",
        "",
        md_table(samples, ["lead_id", "listing_id", "building_id", "city", "state", "source", "space_type_code", "space_type_guess", "text_excerpt", "detected_signals"], 30),
        "",
        "## Interpretation",
        "",
        "- Lead messages contain real semantic demand signals such as medical use, warehouse needs, restaurant use, parking, loading, showroom, and office fit.",
        "- These signals are better for market and tenant-intent intelligence than for claiming specific building attributes.",
        "- Future richer broker/feed descriptions would materially improve building-character extraction.",
    ]
    (REPORTS_DIR / "building_semantic_sample_review.md").write_text("\n".join(sample_report) + "\n", encoding="utf-8")

    taxonomy_report = [
        "# Building Enrichment Taxonomy v1",
        "",
        "This compact taxonomy is designed for deterministic batch extraction from legacy Rofo exports and future feed text. It intentionally avoids hundreds of tags and favors explainable signals that can support building, city, and neighborhood pages.",
        "",
        md_table(taxonomy, ["signal_key", "human_label", "parent_group", "trigger_words", "confidence_level", "notes"]),
        "",
        "## Use Rules",
        "",
        "- Use high-confidence phrase matches directly when source text is explicit.",
        "- Use medium-confidence matches as soft tags or internal signals until reviewed.",
        "- Treat tenant lead text as demand context, not proof that a building has that attribute.",
        "- Never expose stale suite, rent, or availability claims from historical listings.",
    ]
    (REPORTS_DIR / "building_enrichment_taxonomy_v1.md").write_text("\n".join(taxonomy_report) + "\n", encoding="utf-8")

    pipeline_report = [
        "# Building Enrichment Pipeline Recommendation",
        "",
        "## Recommendation",
        "",
        "There is enough useful data to justify a v1 enrichment layer, but the current exports support a mixed strategy:",
        "",
        "1. Use structured building and listing fields for building intelligence.",
        "2. Use tenant lead messages for demand and tenant-fit semantics.",
        "3. Use broker/feed descriptions only when richer future exports include listing remarks, highlights, amenities, or marketing copy.",
        "",
        "## Static-Site-Compatible v1 Pipeline",
        "",
        "1. Read raw Peter CSV exports in a local batch script.",
        "2. Normalize legacy IDs, city/state keys, and numeric fields.",
        "3. Build a text blob from available safe fields.",
        "4. Apply deterministic phrase dictionaries and regex rules.",
        "5. Score each signal with evidence snippets.",
        "6. Write reviewed CSV/JSON under `data/peter/derived/`.",
        "7. Later, selectively promote reviewed signals into `_data/` for Eleventy templates.",
        "",
        "## What to Extract First",
        "",
        "Start with 20 to 40 explainable tags across: building character, workspace style, access, tenant fit, operational signals, amenities, and market position. The included taxonomy file contains 30 proposed signals.",
        "",
        "## How Signals Should Surface Later",
        "",
        "### Building Pages",
        "",
        "- Add subtle tags such as `Creative office`, `Transit adjacent`, or `Warehouse/distribution` only when evidence is strong.",
        "- Prefer phrases like historical activity and tenant-fit signals.",
        "- Do not show stale listing details, suite numbers, or old availability.",
        "",
        "### City Pages",
        "",
        "- Aggregate signal counts to describe the mix of demand and building environments.",
        "- Use signals to prioritize space-type links and market guide enrichment.",
        "",
        "### Neighborhood Pages",
        "",
        "- Use aggregated building character and tenant-fit signals to explain business district identity.",
        "- Representative buildings should remain examples of district fabric, not active listings.",
        "",
        "## What Not to Build Yet",
        "",
        "- No live listings UX.",
        "- No AI service dependency.",
        "- No real-time indexing pipeline.",
        "- No production template changes until a small reviewed signal set is approved.",
        "",
        "## Current Data Limitations",
        "",
        "- Listing marketing text is absent from `rofo_listings.csv`.",
        "- Space type codes need authoritative mapping.",
        "- Broker house descriptions are rich but extremely sparse.",
        "- Lead messages include spam/noise and describe tenant needs rather than property facts.",
    ]
    (REPORTS_DIR / "building_enrichment_pipeline_recommendation.md").write_text("\n".join(pipeline_report) + "\n", encoding="utf-8")


def main() -> None:
    ensure_dirs()
    field_inventory = build_field_inventory()
    samples = sample_rich_text()
    keyword_profile = lead_keyword_profile()
    write_reports(field_inventory, samples, keyword_profile)
    print(f"Wrote field inventory rows: {len(field_inventory)}")
    print(f"Wrote semantic text samples: {len(samples)}")
    print("Wrote taxonomy, sample JSON, and four reports.")


if __name__ == "__main__":
    main()
