# District Terminology Alignment V1

Generated: 2026-05-21

This report standardizes Rofo's public and editorial geography language around **Commercial Districts**. It is guidance only. No frontend templates, public pages, generated comparison records, or live relationship behavior were changed.

## Purpose

Rofo should present itself publicly as a commercial geography and district interpretation platform. The public language should help users understand where businesses locate, why nearby areas are comparable, and how commercial districts differ.

Use **commercial district** as the primary public term. Use **business district**, **nearby district**, **related district**, and selective **commercial corridor** or **innovation district** language when the geography calls for it.

## Audit Summary

The current infrastructure uses a mix of terms across reports and generated data:

| Term | Current use | Guidance |
| --- | --- | --- |
| district | Strong and growing usage in District Graph V1 and public direction | Primary public term |
| neighborhood | Still present in legacy page architecture and some editorial records | Acceptable only where the page type or local vernacular requires it; prefer district in public CRE context |
| corridor | Useful for linear commercial geographies | Acceptable when geography is genuinely corridor-shaped |
| market | Common in city-level graph and legacy copy | Mostly internal or city-level context; avoid as primary page language |
| submarket | Present in some internal guidance and legacy phrasing | Avoid public-facing use; use commercial district or nearby district |
| environment | Present in internal identity and District Graph fields | Internal-only, except natural prose like "business environment" when unavoidable |
| node | Used in graph infrastructure | Internal-only |
| ecosystem | Appears in a few strategic notes | Avoid as primary public wording; use only sparingly for validated innovation or life-science districts |
| zone | Not prominent | Avoid |
| cluster | Not prominent | Avoid publicly unless describing internal rollout groups |

Sample current counts from infrastructure files:

- `data/geography/district_nodes.json`: district 75, corridor 21, market 14, node 9, submarket 2, ecosystem 2, neighborhood 2
- `data/geography/district_relationships.json`: district 44, neighborhood 12, corridor 5, market 2, node 2, ecosystem 1
- `generated/geography/identity-signals/_manifest.json`: market 125, district 47, node 17

The generated identity and comparison layers are internal scaffolding, so their use of `market`, `node`, and `environment_type` is acceptable internally. Public integration should translate those signals into district-centered language.

## Preferred Public Terminology

Use these terms first:

- **Commercial district**: default phrase for Rofo's public district pages and comparison systems.
- **Business district**: use for formal office, civic, executive, or CBD-like places.
- **Nearby district**: use for proximity-oriented alternatives.
- **Related district**: use when the relationship is broader than direct proximity.
- **Commercial corridor**: use for linear geographies shaped by roads, transit, rail, waterfronts, or industrial corridors.
- **Innovation district**: use selectively where research, university, life-science, startup, or R&D support is validated.

Avoid these as primary public-facing terms:

- submarket
- environment
- zone
- market node
- ecosystem
- graph node
- identity signal
- confidence score
- validation score

## Acceptable Contextual Terminology

Some terms can remain in contextual prose:

- **Market**: acceptable for city-level or metro-level context, such as "Bay Area market" or "Atlanta market." Avoid using it as the label for district pages.
- **Neighborhood**: acceptable if the public page is still technically a neighborhood page or if the local name is a recognized neighborhood. In CRE interpretation, pair it with district language where possible.
- **Corridor**: acceptable when the place is linear, access-led, or clearly organized around a transportation spine.
- **Business environment**: acceptable in prose, but not as a taxonomy label.

## Internal-Only Terminology

These terms should remain internal:

- district graph
- relationship graph
- identity signals
- environment signals
- node
- market node
- validation status
- confidence level
- promotion status
- corpus support
- source lineage

Internal data fields do not need immediate renaming if they support infrastructure. Public copy generation should map those fields to district language.

## Editorial Phrasing Examples

### Nearby District Blocks

Prefer:

- "Nearby districts to compare"
- "Related commercial districts"
- "Commercial districts nearby"
- "Compare nearby districts"

Avoid:

- "Nearby submarkets"
- "Market alternatives"
- "Similar nodes"
- "Comparable environments"

Example copy:

> Downtown Oakland is often compared with Uptown Oakland for a more mixed-use setting, and Jack London Square for a more waterfront, warehouse-adjacent commercial district.

### District Comparison Blurbs

Prefer short, practical distinctions:

> Compared with Buckhead, Midtown Atlanta is denser, more transit-oriented, and more mixed-use.

> Compared with Downtown Oakland, Uptown Oakland feels less civic and more mixed-use, with stronger arts, food, and Lake Merritt-adjacent context.

Avoid:

- "This submarket outperforms..."
- "The market ranks higher..."
- "This node has stronger confidence..."
- "This ecosystem is emerging..."

### Related District References

Use related district when proximity alone is not the whole relationship:

> Related districts include the Financial District for traditional downtown office presence and SoMa for a broader mixed-use San Francisco commercial setting.

Avoid implying equivalence:

> Do not write "SoMa is the same type of district as Mission Bay" unless corpus and editorial review support the distinction.

### Corridor Positioning

Use corridor when the geography is shaped by movement and access:

> Mountain View Tech Corridor should be reviewed as a commercial corridor, not a single downtown district.

> South San Francisco Biotech Corridor should be framed around Highway 101, Oyster Point, Gateway, East Grand, and airport/Peninsula access.

Avoid:

- using corridor for every district
- calling compact downtowns corridors
- using corridor to hide weak district evidence

### Flagship District Descriptions

Prefer:

> Downtown Palo Alto is a compact Peninsula commercial district for teams that value walkability, Caltrain access, client-facing office context, and proximity to startup and professional-service routines.

> Buckhead is a north Atlanta business district for executive access, client meetings, professional services, and high-service retail support.

Avoid:

- "premier"
- "best"
- "top-ranked"
- "high-confidence"
- "AI-reviewed"
- inventory, vacancy, rent, or availability claims without current validated data

## District-Type Guidance

### Urban Districts

Use **commercial district** or **business district**.

Good fit:

- Downtown Oakland
- Midtown Atlanta
- Downtown Atlanta
- Financial District SF

Recommended phrasing:

> a transit-oriented commercial district

> a formal downtown business district

> an institutional downtown core

### Innovation Corridors

Use **commercial corridor** or **innovation district** only when supported.

Good fit after validation:

- Mountain View Tech Corridor
- South San Francisco Biotech Corridor
- Mission Bay, if institutional/life-science evidence is validated

Recommended phrasing:

> a Peninsula commercial corridor shaped by R&D, office, transit, and Highway 101 access

> an innovation district with institutional and life-science adjacency

Avoid ecosystem language unless there is strong evidence and a human editorial reason.

### Mixed-Use Districts

Use **commercial district** or **mixed-use commercial district**.

Good fit:

- Uptown Oakland
- Midtown Atlanta
- SoMa after segmentation

Recommended phrasing:

> a mixed-use commercial district where office, retail, restaurants, apartments, and transit overlap

Avoid making the copy lifestyle-first. The user is evaluating commercial geography.

### Office-Oriented Districts

Use **business district**, **office-oriented commercial district**, or **commercial district**.

Good fit:

- Buckhead
- Downtown Oakland
- Perimeter Center
- Financial District SF

Recommended phrasing:

> an office-oriented business district with executive access and client-facing support

> a civic and professional-service business district

Avoid "office market" as the primary public label.

### Logistics / Industrial Corridors

Use **commercial corridor**, **industrial corridor**, or **logistics corridor** where the geography is access-led.

Recommended phrasing:

> an industrial corridor shaped by freeway access, loading requirements, service users, and nearby labor geography

Avoid:

- turning industrial corridors into generic districts
- using residential neighborhood names as the primary geography when the business pattern is corridor-led

## When To Use Each Term

### "District" Is Sufficient

Use district when the place is recognizable, bounded enough for user orientation, and has a coherent commercial identity.

Examples:

- Downtown Oakland
- Uptown Oakland
- Downtown Palo Alto
- Buckhead
- Midtown Atlanta

### "Corridor" Is More Accurate

Use corridor when the place is organized along a road, rail line, freeway, waterfront, or industrial spine rather than around a compact center.

Examples:

- South San Francisco Biotech Corridor
- Mountain View Tech Corridor
- future logistics/industrial geographies

### "Innovation District" Is Appropriate

Use innovation district only when one or more of these are validated:

- university or research adjacency
- life-science or lab concentration
- startup/R&D concentration
- institutional anchors
- specialized commercial building stock

Avoid using innovation district as a prestige label.

### "Business District" Is Preferable

Use business district for formal office, executive, civic, legal, finance, professional-service, or CBD-like places.

Examples:

- Buckhead
- Downtown Atlanta
- Downtown Oakland
- Financial District SF

## Naming Conventions

### District IDs

Use stable, readable IDs:

`district:{state_abbr_lower}:{city_slug}:{district_slug}`

Examples:

- `district:ca:oakland:downtown-oakland`
- `district:ca:palo-alto:downtown-palo-alto`
- `district:ga:atlanta:buckhead`

Use district IDs for infrastructure. Do not expose them publicly.

### Slugs

Use lowercase, hyphenated slugs based on the public district name:

- `downtown-oakland`
- `uptown-oakland`
- `downtown-palo-alto`
- `perimeter-center`

Avoid internal qualifier slugs unless needed for clarity. For example, prefer `financial-district` in a San Francisco path if city context is already present; use `financial-district-sf` internally if needed to avoid collisions.

### Canonical Paths

For future public district pages, prefer paths that make the city and state explicit:

`/commercial-real-estate/{STATE}/{city-slug}/{district-slug}/`

Existing neighborhood paths can remain until a broader routing decision is made. Do not create duplicate paths without canonical planning.

### Public Page Titles

Use:

- `{District} Commercial District`
- `{District} Business District`
- `{District} Commercial Real Estate`

Examples:

- `Downtown Oakland Commercial District`
- `Buckhead Business District`
- `Downtown Palo Alto Commercial District`

Avoid:

- `{District} Submarket`
- `{District} Market Node`
- `{District} Ecosystem`
- `{District} Zone`

### Nearby District Labels

Use short labels:

- `Uptown Oakland`
- `Jack London Square`
- `Financial District`
- `Perimeter Center`

Add city qualifiers only when ambiguity matters:

- `Financial District SF`
- `Midtown Atlanta`

## Integration Guidance For Existing Systems

### Generated Comparison Intelligence

Keep generated comparison files internal. Before public use, translate:

- "nearby market" to "nearby district" when the record is district-level
- "market comparison candidate" to "related district candidate"
- "city-level geography" to "city-level geography" internally only

Do not expose validation status, recommendation buckets, or generated positioning summaries as final public prose.

### Generated Identity Signals

Keep fields such as `environment_type`, `node_id`, and `confidence_level` internal. Public copy should use the signal to inform district language, not repeat the taxonomy.

Translate:

- "suburban commercial node" to "suburban business district" or "suburban commercial district"
- "multi-district commercial market" to "city with multiple commercial districts"
- "same-market comparison corridor" to "nearby district or corridor relationship" where appropriate

### District Graph Fields

Internal fields can remain as-is for now:

- `environment_type`
- `supporting_evidence`
- `validation_status`
- `confidence_level`

Future public handoff fields should add explicit public wording:

- `public_district_type`
- `public_nearby_label`
- `public_comparison_note`
- `public_editorial_summary`

### Relationship Labels

Recommended internal-to-public mapping:

| Internal relationship type | Public wording |
| --- | --- |
| nearby_alternative | nearby district |
| commercial_comparison | related commercial district / compare with |
| complementary_environment | related district |
| connected_corridor | connected commercial corridor |
| urban_vs_suburban | compare urban and suburban districts |
| emerging_alternative | nearby district to review |
| needs_editorial_review | do not publish |

## Recommended Public Copy Patterns

Nearby district card:

> **Uptown Oakland**  
> Compare for a more mixed-use Oakland commercial district with arts, food, BART access, and Lake Merritt-adjacent office context.

Related district card:

> **Financial District SF**  
> Compare for a more traditional regional business district with downtown transit and client-facing office presence.

Corridor card:

> **South San Francisco Biotech Corridor**  
> Review as a commercial corridor shaped by Highway 101 access, life-science adjacency, and east-of-101 office/industrial patterns.

Flagship district intro:

> Downtown Oakland is an East Bay business district shaped by civic institutions, BART access, Broadway office buildings, and professional-service users.

## Recommendations

1. Treat "commercial district" as the default public noun for Rofo district pages and comparison modules.
2. Keep `environment_type`, `node`, `market`, and `confidence` language inside infrastructure only.
3. Add public handoff fields before connecting District Graph V1 to templates.
4. Replace public-facing "submarket" language with "commercial district" or "nearby district" during future page integration.
5. Use "corridor" selectively for linear geographies such as South San Francisco Biotech Corridor and Mountain View Tech Corridor.
6. Keep "innovation district" reserved for validated research, life-science, university, or R&D geography.
7. Do not standardize so aggressively that natural local names become awkward. The goal is clarity, not taxonomy theater.

## Next Step

Create a District Public Copy Handoff V1 that reads `district_nodes.json` and `district_relationships.json`, then produces reviewed public-facing summaries with district-centered language. That handoff should remain unpublished until editorial review confirms which relationships are safe for public integration.
