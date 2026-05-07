from __future__ import annotations

import pandas as pd

from common import DERIVED_DIR, REPORTS_DIR, ensure_dirs, read_csv, slugify


EDITORIAL_OUTPUT = DERIVED_DIR / "bay_area_editorial_neighborhoods.csv"
ADJACENCY_OUTPUT = DERIVED_DIR / "bay_area_neighborhood_adjacency.csv"
REPRESENTATIVE_BUILDINGS_OUTPUT = DERIVED_DIR / "bay_area_representative_buildings.csv"
ROLLOUT_REPORT = REPORTS_DIR / "bay_area_rollout_strategy.md"


EDITORIAL_DISTRICTS = [
    {
        "neighborhood_name": "Financial District",
        "city": "San Francisco",
        "source_neighborhoods": ["Financial District"],
        "canonical_label": "San Francisco Financial District",
        "neighborhood_type": "downtown office district",
        "rollout_priority": 1,
        "editorial_confidence": "high",
        "representative_identity": "San Francisco's core business district for office users, professional services, finance, and client-facing teams.",
        "likely_tenant_intent": "Teams comparing downtown office buildings, transit-oriented locations, and established business addresses.",
        "recommended_space_types": "office|coworking|retail",
        "nearby_neighborhoods": "Jackson Square|SOMA|South Park|Union Square",
        "editorial_notes": "Strong commercial identity and high tenant search intent. Good first prototype candidate.",
    },
    {
        "neighborhood_name": "SOMA",
        "city": "San Francisco",
        "source_neighborhoods": ["SOMA", "South of Market"],
        "canonical_label": "SoMa",
        "neighborhood_type": "mixed office and innovation district",
        "rollout_priority": 1,
        "editorial_confidence": "high",
        "representative_identity": "A flexible business district with office, creative, technology, showroom, and mixed-use commercial demand.",
        "likely_tenant_intent": "Companies comparing creative office, startup-friendly space, showroom use, and flexible business locations.",
        "recommended_space_types": "office|coworking|flex|retail",
        "nearby_neighborhoods": "South Park|Mission Bay|Financial District|Mission District",
        "editorial_notes": "Legacy data includes both SOMA and South of Market labels. Editorial layer should consolidate them.",
    },
    {
        "neighborhood_name": "Jackson Square",
        "city": "San Francisco",
        "source_neighborhoods": ["Jackson Square"],
        "canonical_label": "Jackson Square",
        "neighborhood_type": "boutique office and design district",
        "rollout_priority": 1,
        "editorial_confidence": "high",
        "representative_identity": "A recognizable boutique office district near downtown with design, professional service, and client-facing appeal.",
        "likely_tenant_intent": "Businesses comparing smaller downtown-adjacent office buildings with character and client access.",
        "recommended_space_types": "office|retail|coworking",
        "nearby_neighborhoods": "Financial District|North Beach|Union Square",
        "editorial_notes": "Strong identity, good building density, and differentiated tenant story.",
    },
    {
        "neighborhood_name": "South Park",
        "city": "San Francisco",
        "source_neighborhoods": ["South Park"],
        "canonical_label": "South Park",
        "neighborhood_type": "creative office district",
        "rollout_priority": 1,
        "editorial_confidence": "high",
        "representative_identity": "A compact SoMa-area business district associated with creative, technology, and smaller office users.",
        "likely_tenant_intent": "Startups and small teams comparing creative office locations near central San Francisco.",
        "recommended_space_types": "office|coworking|flex",
        "nearby_neighborhoods": "SOMA|Mission Bay|Financial District",
        "editorial_notes": "Good candidate for a specific district guide because tenant intent is more differentiated than broad SoMa alone.",
    },
    {
        "neighborhood_name": "Mission District",
        "city": "San Francisco",
        "source_neighborhoods": ["Mission District"],
        "canonical_label": "Mission District",
        "neighborhood_type": "local retail and creative business district",
        "rollout_priority": 2,
        "editorial_confidence": "medium",
        "representative_identity": "A neighborhood commercial district with retail, service, creative, and small office search intent.",
        "likely_tenant_intent": "Local businesses comparing customer-facing locations, creative office options, and neighborhood-oriented space.",
        "recommended_space_types": "retail|office|coworking|flex",
        "nearby_neighborhoods": "SOMA|Mission Bay|Dogpatch|Potrero Hill",
        "editorial_notes": "Recognizable tenant/search identity, but centroid assignment overcounts some residential areas. Review boundaries before public use.",
    },
    {
        "neighborhood_name": "Mission Bay",
        "city": "San Francisco",
        "source_neighborhoods": ["Mission Bay"],
        "canonical_label": "Mission Bay",
        "neighborhood_type": "life science and modern office district",
        "rollout_priority": 1,
        "editorial_confidence": "high",
        "representative_identity": "A modern office, life science, medical, and institutional district with clear business identity.",
        "likely_tenant_intent": "Tenants comparing newer buildings, life science adjacency, medical-related space, and modern office environments.",
        "recommended_space_types": "office|medical office|lab|retail",
        "nearby_neighborhoods": "SOMA|South Park|Dogpatch",
        "editorial_notes": "High enrichment potential because business identity is differentiated and useful to tenant decisions.",
    },
    {
        "neighborhood_name": "Dogpatch",
        "city": "San Francisco",
        "source_neighborhoods": ["Dogpatch"],
        "canonical_label": "Dogpatch",
        "neighborhood_type": "creative industrial and maker district",
        "rollout_priority": 2,
        "editorial_confidence": "high",
        "representative_identity": "A mixed creative, light industrial, maker, showroom, and neighborhood retail district.",
        "likely_tenant_intent": "Businesses comparing creative production, showroom, service, and flexible commercial space.",
        "recommended_space_types": "flex|industrial|office|retail",
        "nearby_neighborhoods": "Mission Bay|SOMA|Potrero Hill",
        "editorial_notes": "Commercially meaningful even if raw activity is lower than downtown nodes.",
    },
    {
        "neighborhood_name": "Union Square",
        "city": "San Francisco",
        "source_neighborhoods": ["Union Square"],
        "canonical_label": "Union Square",
        "neighborhood_type": "retail and hospitality district",
        "rollout_priority": 2,
        "editorial_confidence": "high",
        "representative_identity": "A nationally recognizable shopping, hospitality, retail, and downtown office-adjacent district.",
        "likely_tenant_intent": "Retailers, service businesses, showroom users, and office tenants comparing central visitor-oriented locations.",
        "recommended_space_types": "retail|office|showroom|coworking",
        "nearby_neighborhoods": "Financial District|Jackson Square|SOMA",
        "editorial_notes": "Useful as a tenant decision page if framed around business context, not old listing inventory.",
    },
    {
        "neighborhood_name": "Downtown Oakland",
        "city": "Oakland",
        "source_neighborhoods": ["Downtown", "Downtown Oakland", "City Center", "Old Oakland"],
        "canonical_label": "Downtown Oakland",
        "neighborhood_type": "downtown office and civic district",
        "rollout_priority": 1,
        "editorial_confidence": "high",
        "representative_identity": "Oakland's central business district with office, civic, professional service, retail, and transit-oriented demand.",
        "likely_tenant_intent": "Tenants comparing East Bay office value, downtown access, professional service locations, and central Oakland buildings.",
        "recommended_space_types": "office|retail|coworking|flex",
        "nearby_neighborhoods": "Uptown Oakland|Jack London Square|Temescal|Downtown Berkeley",
        "editorial_notes": "Editorial layer intentionally consolidates overlapping Downtown, City Center, Downtown Oakland, and Old Oakland labels.",
    },
    {
        "neighborhood_name": "Uptown Oakland",
        "city": "Oakland",
        "source_neighborhoods": ["Northgate - Waverly", "Northgate"],
        "canonical_label": "Uptown Oakland",
        "neighborhood_type": "creative office and mixed-use district",
        "rollout_priority": 2,
        "editorial_confidence": "medium",
        "representative_identity": "A central Oakland district with creative office, local retail, restaurant, and service business identity.",
        "likely_tenant_intent": "Small teams and customer-facing businesses comparing central Oakland alternatives to downtown towers.",
        "recommended_space_types": "office|retail|coworking|flex",
        "nearby_neighborhoods": "Downtown Oakland|Temescal|Jack London Square",
        "editorial_notes": "Legacy table lacks a clean Uptown label. Northgate and Northgate-Waverly are used as a review proxy.",
    },
    {
        "neighborhood_name": "Jack London Square",
        "city": "Oakland",
        "source_neighborhoods": ["Jack London Square"],
        "canonical_label": "Jack London Square",
        "neighborhood_type": "waterfront office and retail district",
        "rollout_priority": 1,
        "editorial_confidence": "high",
        "representative_identity": "A waterfront Oakland district with office, restaurant, service, retail, and destination business context.",
        "likely_tenant_intent": "Businesses comparing waterfront office and customer-facing locations with East Bay accessibility.",
        "recommended_space_types": "office|retail|coworking|flex",
        "nearby_neighborhoods": "Downtown Oakland|Uptown Oakland|Temescal",
        "editorial_notes": "Strong identity and internal linking potential despite smaller assigned building count.",
    },
    {
        "neighborhood_name": "Temescal",
        "city": "Oakland",
        "source_neighborhoods": ["Temescal"],
        "canonical_label": "Temescal",
        "neighborhood_type": "neighborhood retail and small business district",
        "rollout_priority": 2,
        "editorial_confidence": "medium",
        "representative_identity": "A recognizable North Oakland district with neighborhood retail, service, and small business search intent.",
        "likely_tenant_intent": "Local retailers, service businesses, and smaller office users comparing North Oakland locations.",
        "recommended_space_types": "retail|office|coworking",
        "nearby_neighborhoods": "Uptown Oakland|Downtown Oakland|Downtown Berkeley",
        "editorial_notes": "Good tenant identity, but commercial building activity is lighter than downtown Oakland.",
    },
    {
        "neighborhood_name": "Downtown Berkeley",
        "city": "Berkeley",
        "source_neighborhoods": ["Downtown Berkeley"],
        "canonical_label": "Downtown Berkeley",
        "neighborhood_type": "university-adjacent office and retail district",
        "rollout_priority": 2,
        "editorial_confidence": "high",
        "representative_identity": "A university-adjacent business district with office, retail, education-adjacent, restaurant, and service business demand.",
        "likely_tenant_intent": "Businesses comparing East Bay locations with university proximity, transit access, and local customer demand.",
        "recommended_space_types": "office|retail|coworking",
        "nearby_neighborhoods": "Temescal|Downtown Oakland|West Berkeley",
        "editorial_notes": "Clear business district identity and enough building density for editorial prototyping.",
    },
    {
        "neighborhood_name": "Downtown Palo Alto",
        "city": "Palo Alto",
        "source_neighborhoods": ["University South"],
        "canonical_label": "Downtown Palo Alto",
        "neighborhood_type": "premium office and retail district",
        "rollout_priority": 1,
        "editorial_confidence": "medium",
        "representative_identity": "A premium Peninsula district for technology, professional services, venture-backed teams, restaurants, and boutique retail.",
        "likely_tenant_intent": "Tenants comparing high-value Peninsula office and retail locations near Palo Alto's central business area.",
        "recommended_space_types": "office|retail|coworking",
        "nearby_neighborhoods": "Mountain View|Redwood City|Sunnyvale",
        "editorial_notes": "Legacy source uses University South as the closest high-confidence proxy for Downtown Palo Alto.",
    },
    {
        "neighborhood_name": "Mountain View",
        "city": "Mountain View",
        "source_neighborhoods": ["Rex Manor", "Whisman Station", "Jackson Park"],
        "canonical_label": "Mountain View business districts",
        "neighborhood_type": "Silicon Valley office and technology district",
        "rollout_priority": 2,
        "editorial_confidence": "medium",
        "representative_identity": "A Silicon Valley business market with office, technology, small business, and transit-adjacent search patterns.",
        "likely_tenant_intent": "Technology teams and local businesses comparing Mountain View office and flexible workspace options.",
        "recommended_space_types": "office|coworking|retail|flex",
        "nearby_neighborhoods": "Downtown Palo Alto|Sunnyvale|North San Jose",
        "editorial_notes": "Legacy data lacks a clean Downtown Mountain View record with geo. This is a broader city business district prototype.",
    },
    {
        "neighborhood_name": "Sunnyvale",
        "city": "Sunnyvale",
        "source_neighborhoods": ["Heritage District", "San Miguel", "Lakewood Village"],
        "canonical_label": "Sunnyvale business districts",
        "neighborhood_type": "Silicon Valley office and local business district",
        "rollout_priority": 2,
        "editorial_confidence": "medium",
        "representative_identity": "A Silicon Valley market with office, technology, neighborhood retail, and local service business demand.",
        "likely_tenant_intent": "Tenants comparing Sunnyvale office, local retail, service, and flexible commercial space near nearby technology employers.",
        "recommended_space_types": "office|retail|coworking|flex",
        "nearby_neighborhoods": "Mountain View|North San Jose|Downtown Palo Alto",
        "editorial_notes": "Editorial layer combines the most commercially useful Sunnyvale legacy neighborhoods.",
    },
    {
        "neighborhood_name": "Redwood City",
        "city": "Redwood City",
        "source_neighborhoods": ["Centennial", "Redwood Village", "Staumbaugh Heller"],
        "canonical_label": "Redwood City business districts",
        "neighborhood_type": "Peninsula office and local business district",
        "rollout_priority": 2,
        "editorial_confidence": "medium",
        "representative_identity": "A Peninsula commercial market with office, medical, local service, retail, and smaller business search intent.",
        "likely_tenant_intent": "Tenants comparing Peninsula locations between San Francisco, Palo Alto, and San Jose.",
        "recommended_space_types": "office|retail|medical office|coworking",
        "nearby_neighborhoods": "Downtown Palo Alto|San Mateo|Mountain View",
        "editorial_notes": "No clean downtown district record survived the high-confidence filter, so this is a broader city business district prototype.",
    },
    {
        "neighborhood_name": "Downtown San Jose",
        "city": "San Jose",
        "source_neighborhoods": ["Downtown San Jose"],
        "canonical_label": "Downtown San Jose",
        "neighborhood_type": "downtown office and civic district",
        "rollout_priority": 1,
        "editorial_confidence": "high",
        "representative_identity": "San Jose's central business district for office, professional services, civic, retail, and transit-oriented demand.",
        "likely_tenant_intent": "Tenants comparing downtown Silicon Valley office locations, professional service space, and central San Jose access.",
        "recommended_space_types": "office|retail|coworking|flex",
        "nearby_neighborhoods": "North San Jose|Sunnyvale|Mountain View",
        "editorial_notes": "Strong building and activity signal plus clear business district identity.",
    },
    {
        "neighborhood_name": "North San Jose",
        "city": "San Jose",
        "source_neighborhoods": ["North San Jose", "River Oaks"],
        "canonical_label": "North San Jose",
        "neighborhood_type": "technology office and industrial district",
        "rollout_priority": 1,
        "editorial_confidence": "high",
        "representative_identity": "A major Silicon Valley business district with technology office, industrial, flex, and campus-oriented demand.",
        "likely_tenant_intent": "Technology, office, R&D, warehouse, and flex users comparing Silicon Valley access and larger business locations.",
        "recommended_space_types": "office|industrial|flex|coworking",
        "nearby_neighborhoods": "Downtown San Jose|Sunnyvale|Mountain View",
        "editorial_notes": "Strong commercial identity and high activity. River Oaks is included as a related source cluster.",
    },
    {
        "neighborhood_name": "South San Francisco Biotech Corridor",
        "city": "South San Francisco",
        "source_neighborhoods": ["Oyster Point", "Lindenville", "The East Side"],
        "canonical_label": "South San Francisco Biotech Corridor",
        "neighborhood_type": "life science and industrial district",
        "rollout_priority": 1,
        "editorial_confidence": "medium",
        "representative_identity": "A Peninsula life science, biotech, R&D, office, and industrial business corridor.",
        "likely_tenant_intent": "Life science, lab-adjacent, R&D, office, and industrial users comparing South San Francisco locations.",
        "recommended_space_types": "office|lab|industrial|flex",
        "nearby_neighborhoods": "Mission Bay|Redwood City|San Mateo",
        "editorial_notes": "Editorially important even though the legacy table uses multiple local labels rather than one corridor label.",
    },
]


ADJACENCY_RELATIONSHIPS = [
    ("Financial District", "San Francisco", "Jackson Square", "San Francisco", "adjacent", "Downtown-adjacent districts with office and client-facing search patterns."),
    ("Financial District", "San Francisco", "SOMA", "San Francisco", "nearby_alternative", "Nearby option for teams comparing traditional office with creative or technology-oriented locations."),
    ("SOMA", "San Francisco", "South Park", "San Francisco", "adjacent", "South Park is a compact business node within the broader SoMa search pattern."),
    ("SOMA", "San Francisco", "Mission Bay", "San Francisco", "nearby_alternative", "Both serve technology and modern office users, with Mission Bay adding life science context."),
    ("South Park", "San Francisco", "Mission Bay", "San Francisco", "adjacent", "Nearby modern office and startup-oriented search areas."),
    ("Mission Bay", "San Francisco", "Dogpatch", "San Francisco", "adjacent", "Adjacent eastern SF districts with life science, creative, and production-oriented demand."),
    ("Mission District", "San Francisco", "Dogpatch", "San Francisco", "comparable", "Both can serve creative, service, and mixed local business searches."),
    ("Union Square", "San Francisco", "Financial District", "San Francisco", "nearby_alternative", "Central San Francisco districts with retail, office, and visitor-facing demand."),
    ("Downtown Oakland", "Oakland", "Uptown Oakland", "Oakland", "adjacent", "Adjacent central Oakland districts with overlapping office and local business search patterns."),
    ("Downtown Oakland", "Oakland", "Jack London Square", "Oakland", "nearby_alternative", "Central Oakland alternative for tenants considering waterfront or lower-rise options."),
    ("Uptown Oakland", "Oakland", "Temescal", "Oakland", "nearby_alternative", "Oakland districts often compared by smaller office, retail, and service businesses."),
    ("Jack London Square", "Oakland", "Downtown Oakland", "Oakland", "same_tenant_search_pattern", "Businesses often compare central Oakland office and customer-facing options."),
    ("Downtown Berkeley", "Berkeley", "Temescal", "Oakland", "nearby_alternative", "Nearby East Bay districts with local retail and smaller office search intent."),
    ("Downtown Palo Alto", "Palo Alto", "Mountain View", "Mountain View", "comparable", "Peninsula and Silicon Valley locations often compared by technology and professional service tenants."),
    ("Mountain View", "Mountain View", "Sunnyvale", "Sunnyvale", "nearby_alternative", "Adjacent Silicon Valley markets with office and technology-oriented searches."),
    ("Sunnyvale", "Sunnyvale", "North San Jose", "San Jose", "nearby_alternative", "Nearby Silicon Valley office, flex, and technology business alternatives."),
    ("Redwood City", "Redwood City", "Downtown Palo Alto", "Palo Alto", "nearby_alternative", "Peninsula alternatives for tenants comparing cost, access, and business identity."),
    ("Downtown San Jose", "San Jose", "North San Jose", "San Jose", "same_tenant_search_pattern", "San Jose users often compare downtown access with North San Jose office and flex locations."),
    ("North San Jose", "San Jose", "Sunnyvale", "Sunnyvale", "comparable", "Silicon Valley technology, office, R&D, and flex search patterns overlap."),
    ("South San Francisco Biotech Corridor", "South San Francisco", "Mission Bay", "San Francisco", "comparable", "Life science and modern office tenants may compare these markets."),
    ("South San Francisco Biotech Corridor", "South San Francisco", "Redwood City", "Redwood City", "nearby_alternative", "Peninsula users may compare South San Francisco with other mid-Peninsula locations."),
]


DEFERRED_DISTRICTS = [
    {
        "district": "Uptown Oakland",
        "reason": "Useful business identity, but legacy source uses Northgate labels. Needs boundary review.",
    },
    {
        "district": "Mountain View",
        "reason": "High activity exists, but there is no clean downtown Mountain View legacy record with geo.",
    },
    {
        "district": "Redwood City",
        "reason": "Strong city market signal, but neighborhood labels need editorial review before a true downtown district page.",
    },
]


def source_key(city: str, neighborhood_name: str) -> str:
    return f"{city}::{neighborhood_name}"


def bool_text(value: bool) -> str:
    return "true" if value else "false"


def build_editorial_neighborhoods(intelligence: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, list[str]]]:
    available = {
        source_key(row["city"], row["neighborhood_name"]): row
        for row in intelligence.to_dict("records")
    }
    source_map: dict[str, list[str]] = {}
    records = []

    for district in EDITORIAL_DISTRICTS:
        matched_sources = [
            name for name in district["source_neighborhoods"]
            if source_key(district["city"], name) in available
        ]
        if not matched_sources:
            continue

        output = {
            "neighborhood_name": district["neighborhood_name"],
            "city": district["city"],
            "state": "CA",
            "neighborhood_slug": slugify(district["neighborhood_name"]),
            "canonical_label": district["canonical_label"],
            "neighborhood_type": district["neighborhood_type"],
            "rollout_priority": district["rollout_priority"],
            "editorial_confidence": district["editorial_confidence"],
            "commercially_meaningful": "true",
            "page_candidate": bool_text(district["rollout_priority"] in [1, 2]),
            "representative_identity": district["representative_identity"],
            "likely_tenant_intent": district["likely_tenant_intent"],
            "recommended_space_types": district["recommended_space_types"],
            "nearby_neighborhoods": district["nearby_neighborhoods"],
            "editorial_notes": district["editorial_notes"],
        }
        records.append(output)
        source_map[source_key(district["city"], district["neighborhood_name"])] = matched_sources

    df = pd.DataFrame(records).sort_values(["rollout_priority", "city", "neighborhood_name"])
    df.to_csv(EDITORIAL_OUTPUT, index=False)
    return df, source_map


def build_adjacency(editorial: pd.DataFrame) -> pd.DataFrame:
    editorial_keys = set(zip(editorial["neighborhood_name"], editorial["city"]))
    rows = []
    for neighborhood, city, related, related_city, relationship_type, reason in ADJACENCY_RELATIONSHIPS:
        if (neighborhood, city) in editorial_keys and (related, related_city) in editorial_keys:
            rows.append({
                "neighborhood_name": neighborhood,
                "city": city,
                "related_neighborhood_name": related,
                "related_city": related_city,
                "relationship_type": relationship_type,
                "reason": reason,
            })
    df = pd.DataFrame(rows).sort_values(["city", "neighborhood_name", "related_city", "related_neighborhood_name"])
    df.to_csv(ADJACENCY_OUTPUT, index=False)
    return df


def selection_reason(row) -> str:
    pieces = []
    pieces.append(f"{row['assignment_confidence']} neighborhood assignment")
    pieces.append(f"{int(row['listing_count'])} historical listing activity signals")
    pieces.append(f"{row['activity_bucket']} activity bucket")
    if row["assignment_distance_km"] <= 1:
        pieces.append("close to neighborhood centroid")
    return "; ".join(pieces) + ". Not a current availability claim."


def build_representative_buildings(editorial: pd.DataFrame, source_map: dict[str, list[str]]) -> pd.DataFrame:
    assignments = read_csv(DERIVED_DIR / "bay_area_building_neighborhood_assignments.csv")
    buildings = read_csv(DERIVED_DIR / "building_signals.csv")

    joined = assignments.merge(
        buildings[["building_id", "name", "address", "listing_count", "activity_bucket"]],
        on="building_id",
        how="left",
        suffixes=("", "_building"),
    )
    joined["listing_count"] = pd.to_numeric(joined["listing_count"], errors="coerce").fillna(0)
    joined["confidence_rank"] = joined["assignment_confidence"].map({"high": 0, "medium": 1, "low": 2}).fillna(3)
    joined["building_name"] = joined["building_name"].fillna(joined["name"]).fillna("")
    joined["address"] = joined["address"].fillna("")

    rows = []
    for district in editorial.to_dict("records"):
        sources = source_map.get(source_key(district["city"], district["neighborhood_name"]), [])
        candidates = joined[
            joined["city"].eq(district["city"])
            & joined["neighborhood_name"].isin(sources)
        ].copy()
        if candidates.empty:
            continue

        candidates["display_name"] = candidates["building_name"]
        missing_name = candidates["display_name"].fillna("").astype(str).str.strip().eq("")
        candidates.loc[missing_name, "display_name"] = candidates.loc[missing_name, "address"]
        missing_name = candidates["display_name"].fillna("").astype(str).str.strip().eq("")
        candidates.loc[missing_name, "display_name"] = "Building " + candidates.loc[missing_name, "building_id"].astype(str)

        candidates = candidates.sort_values(
            ["confidence_rank", "listing_count", "assignment_distance_km", "building_id"],
            ascending=[True, False, True, True],
        ).drop_duplicates("building_id").head(10)

        for row in candidates.to_dict("records"):
            rows.append({
                "neighborhood_name": district["neighborhood_name"],
                "city": district["city"],
                "building_id": row["building_id"],
                "building_name": row["display_name"],
                "address": row["address"],
                "listing_count": int(row["listing_count"]),
                "activity_bucket": row["activity_bucket"],
                "assignment_confidence": row["assignment_confidence"],
                "assignment_distance_km": row["assignment_distance_km"],
                "reason_selected": selection_reason(row),
            })

    df = pd.DataFrame(rows).sort_values(["city", "neighborhood_name", "listing_count"], ascending=[True, True, False])
    df.to_csv(REPRESENTATIVE_BUILDINGS_OUTPUT, index=False)
    return df


def markdown_table(df: pd.DataFrame, columns: list[str], limit: int = 30) -> str:
    view = df[columns].head(limit).fillna("").astype(str)
    if view.empty:
        return "_None._"
    lines = [
        "| " + " | ".join(columns) + " |",
        "| " + " | ".join(["---"] * len(columns)) + " |",
    ]
    for _, row in view.iterrows():
        lines.append("| " + " | ".join(row[col].replace("|", "\\|") for col in columns) + " |")
    return "\n".join(lines)


def write_rollout_report(editorial: pd.DataFrame, adjacency: pd.DataFrame, buildings: pd.DataFrame) -> None:
    first_5 = editorial[editorial["rollout_priority"].eq(1)].head(5).copy()
    next_10 = editorial[editorial["rollout_priority"].isin([1, 2])].iloc[5:15].copy()
    defer = pd.DataFrame(DEFERRED_DISTRICTS)
    building_counts = buildings.groupby(["neighborhood_name", "city"]).size().reset_index(name="representative_building_count")
    editorial_with_counts = editorial.merge(building_counts, on=["neighborhood_name", "city"], how="left")
    editorial_with_counts["representative_building_count"] = editorial_with_counts["representative_building_count"].fillna(0).astype(int)

    lines = [
        "# Bay Area Editorial Neighborhood Rollout Strategy",
        "",
        "This is a curated editorial layer for commercially meaningful Bay Area business districts. Automation suggests candidates, but editorial judgment decides what should become a future public experience.",
        "",
        "Rofo should treat these records as business district intelligence for discovery, internal linking, SEO enrichment, and AI retrieval context. They are not listing inventory and do not imply current availability.",
        "",
        "## Recommended First 5 Prototype Districts",
        "",
        markdown_table(first_5, ["neighborhood_name", "city", "canonical_label", "neighborhood_type", "editorial_confidence"], 5),
        "",
        "Why these are first: they combine recognizable business identity, strong tenant search intent, good building density, clear internal linking paths, and enough enrichment potential for useful prototype pages.",
        "",
        "## Recommended Next 10 Districts",
        "",
        markdown_table(next_10, ["neighborhood_name", "city", "canonical_label", "neighborhood_type", "editorial_confidence"], 10),
        "",
        "## Districts to Defer",
        "",
        markdown_table(defer, ["district", "reason"], 10),
        "",
        "## Curated District Coverage",
        "",
        markdown_table(editorial_with_counts, [
            "neighborhood_name",
            "city",
            "rollout_priority",
            "editorial_confidence",
            "representative_building_count",
            "recommended_space_types",
        ], 40),
        "",
        "## Data Quality Cautions",
        "",
        "- Several useful business districts do not map cleanly to one legacy neighborhood record.",
        "- Some editorial labels intentionally consolidate multiple source neighborhoods, such as Downtown Oakland and South San Francisco Biotech Corridor.",
        "- Nearest-centroid building assignment is suitable for internal prototyping, but reviewed boundaries are needed before public rollout.",
        "- `listing_count` is historical leasing activity intensity, not current availability.",
        "- Representative buildings should be used as examples of building intelligence, not as live listings.",
        "",
        "## Content Strategy",
        "",
        "- Frame pages around tenant decisions: why the district matters, who it fits, what nearby districts to compare, and what space types are commonly searched.",
        "- Use human business district labels, not raw legacy neighborhood names, when the editorial label is clearer.",
        "- Avoid stale listing language. Say historical activity, representative buildings, and commercial context.",
        "- Enrich each district with nearby district comparisons, city and space-type links, representative building intelligence, and cautious market notes.",
        "",
        "## Internal Linking Strategy",
        "",
        "- Link each future district page to the parent city market guide and transactional city page.",
        "- Link to relevant space-type pages and space-type guides when they exist.",
        "- Use adjacency relationships for nearby district comparisons.",
        "- Link representative building pages only when a canonical Rofo building page exists or can be generated from approved building-level data.",
        "",
        "## Why This Is Business District Intelligence",
        "",
        "The point of this layer is to help businesses understand location fit. It should support questions like where similar tenants search, which districts are comparable, and what building patterns exist. It should not expose raw listings, suite-level availability, old rents, or stale inventory.",
        "",
        "## Adjacency Coverage",
        "",
        markdown_table(adjacency, ["neighborhood_name", "city", "related_neighborhood_name", "related_city", "relationship_type"], 40),
    ]
    ROLLOUT_REPORT.write_text("\n".join(lines) + "\n")


def main() -> None:
    ensure_dirs()
    intelligence = read_csv(DERIVED_DIR / "bay_area_neighborhood_intelligence.csv")
    editorial, source_map = build_editorial_neighborhoods(intelligence)
    adjacency = build_adjacency(editorial)
    representative_buildings = build_representative_buildings(editorial, source_map)
    write_rollout_report(editorial, adjacency, representative_buildings)

    print(f"Wrote {len(editorial):,} editorial neighborhoods.")
    print(f"Wrote {len(adjacency):,} adjacency relationships.")
    print(f"Wrote {len(representative_buildings):,} representative building rows.")
    print(f"Wrote rollout report to {ROLLOUT_REPORT}.")


if __name__ == "__main__":
    main()
