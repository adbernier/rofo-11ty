# Neighborhood Intelligence Audit Report

Date: 2026-05-14

## Purpose

This report reviews the current Rofo commercial geography platform and identifies where neighborhood and commercial area pages have the strongest opportunity for deeper intelligence enrichment.

This is a planning report only. It does not generate pages, change templates, alter routing, or expand sitemap coverage.

## Executive Summary

The current local Rofo neighborhood system contains 249 active neighborhood or commercial area pages across 15 markets. Of those, 226 have static map cards and 157 have at least one representative building. The remaining 92 pages are real commercial geography pages but currently have no representative building support.

Rofo now has enough structure to begin a focused Neighborhood Intelligence layer, but the quality is uneven by market. The strongest immediate opportunities are pages that already combine clear geography, map card coverage, representative buildings, nearby neighborhood links, and market guide support. These pages can support richer editorial context, building environment summaries, durable space type signals, and stronger internal links without sounding like a listings marketplace.

The main constraint is not page count. It is confidence. Representative building relationships are dense in a few markets, but the formal relationship graph currently covers only a subset of total pages. Listing-derived summaries should be added only after durable signals are reviewed and converted into short, historical, public-safe language.

## Current Coverage Snapshot

The audit found 249 neighborhood pages and 226 map cards. A rough page-quality heuristic was used for prioritization:

- Tier 1: 5 or more representative buildings, map card present, and at least 3 nearby neighborhood links.
- Tier 2: 2 or more representative buildings, map card present, and at least 3 nearby neighborhood links.
- Tier 3: thin, incomplete, or needs additional relationship work.

This is a planning heuristic, not a production ranking.

| City | Pages | Map cards | Representative buildings | Pages with no buildings | Tier 1 | Tier 2 | Tier 3 | Market guide coverage |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| New York, NY | 59 | 58 | 59 | 37 | 1 | 15 | 43 | office, retail, industrial |
| Chicago, IL | 26 | 26 | 32 | 13 | 1 | 7 | 18 | none found |
| Los Angeles, CA | 20 | 20 | 59 | 2 | 4 | 12 | 4 | office, retail, industrial |
| Dallas, TX | 16 | 16 | 33 | 6 | 4 | 3 | 9 | none found |
| Denver, CO | 15 | 15 | 41 | 2 | 3 | 7 | 5 | office, retail, industrial |
| Miami, FL | 13 | 13 | 16 | 8 | 2 | 2 | 9 | none found |
| Oakland, CA | 12 | 0 | 38 | 3 | 0 | 0 | 12 | office, retail, industrial |
| San Diego, CA | 12 | 12 | 47 | 0 | 5 | 6 | 1 | office, retail, industrial |
| Seattle, WA | 12 | 12 | 13 | 6 | 1 | 2 | 9 | office, retail, industrial |
| San Francisco, CA | 11 | 11 | 44 | 1 | 6 | 2 | 3 | office, retail |
| Washington, DC | 11 | 11 | 16 | 3 | 1 | 3 | 7 | none found |
| Atlanta, GA | 11 | 11 | 37 | 2 | 5 | 3 | 3 | none found |
| Boston, MA | 11 | 11 | 17 | 4 | 2 | 2 | 7 | office, retail, industrial |
| Nashville, TN | 10 | 10 | 10 | 3 | 0 | 3 | 7 | none found |
| Austin, TX | 10 | 0 | 25 | 2 | 0 | 0 | 10 | office, retail, industrial |

Total tier mix:

- Tier 1: 35 pages
- Tier 2: 67 pages
- Tier 3: 147 pages

## Strongest Enrichment Opportunities

These pages are the best immediate candidates for a first Neighborhood Intelligence layer because they already have strong page structure and representative building density.

### San Francisco

- Financial District
- Union Square
- Jackson Square
- Civic Center
- Hayes Valley
- Marina District

Why they matter: strong commercial identity, map cards, representative buildings, nearby district links, and mature city hierarchy. These are well suited for building environment summaries, office and retail orientation, nearby district comparisons, and high quality internal links.

### San Diego

- Mission Valley
- Kearny Mesa
- Sorrento Valley
- Rancho Bernardo
- Otay Mesa

Why they matter: strong representative building support and differentiated commercial profiles. Kearny Mesa and Sorrento Valley are especially useful for business environment intelligence because they can support office, flex, industrial, and life science adjacent context without relying on live inventory claims.

### Atlanta

- Buckhead
- Midtown
- Perimeter Center
- Cumberland / Galleria
- Fulton Industrial

Why they matter: clear commercial geography and strong area differentiation. Atlanta is a high priority because it currently lacks market guide coverage in the checked guide datasets, so neighborhood intelligence can fill a visible content gap.

### Los Angeles

- Downtown Los Angeles
- Arts District
- Hollywood
- Westchester

Why they matter: strong geography, strong market guide coverage, and recognizable tenant search intent. LA is a good candidate for more nuanced area positioning because neighborhoods vary sharply by commercial use, building style, and commute patterns.

### Dallas

- Uptown
- North Dallas
- Far North Dallas
- Stemmons Corridor

Why they matter: the pages have useful building support and clear commercial positioning. Dallas lacks market guide coverage in the checked datasets, making this a strong place to enrich neighborhood pages with lightweight market context.

### Denver

- Sun Valley
- Northeast Denver Industrial
- Globeville / Elyria-Swansea
- Central Business District
- Denver Tech Center

Why they matter: Denver has a good mix of downtown, office, industrial, and corridor-oriented geographies. The industrial and logistics oriented districts are especially useful because they can differentiate Rofo from generic office-heavy pages.

### Other Strong Candidates

- Boston: Back Bay, Financial District
- Chicago: West Loop
- Seattle: Downtown Seattle
- Washington, DC: Golden Triangle
- Miami: Blue Lagoon, Brickell

These are strong single-market anchors, but several of their surrounding city pages still need more representative buildings or guide support before a broad enrichment pass.

## Relationship Graph Findings

The reviewed commercial area relationship data currently includes 41 area summaries and 196 building relationships. This is valuable but not broad enough to cover all 249 neighborhood pages.

Strong relationship clusters include:

- San Francisco Financial District: high office and retail signal concentration.
- San Francisco Union Square: strong retail signal concentration.
- San Francisco Jackson Square: mixed office, retail, and boutique commercial context.
- Oakland Downtown and Uptown: strong office-oriented relationship clusters.
- Chicago Loop and West Loop: compact office and mixed commercial clusters.
- Denver CBD, Denver Tech Center, Sun Valley, and Northeast Denver Industrial: differentiated office and industrial patterns.
- Austin Downtown and Warehouse District: meaningful office and mixed-use signals.

Important caveat: several markets have page-level representative buildings that are not fully reflected in the formal relationship graph. Before production enrichment, Rofo should normalize the relationship layer so every neighborhood page can be evaluated the same way.

## Thin Or Noisy Areas

The biggest quality issue is uneven representative building coverage. Ninety two active neighborhood pages have no representative buildings. Some are still valuable because the geography is real and commercially meaningful, but they should not receive deep building intelligence until more support is added.

Examples of useful but thin pages:

- New York: many Manhattan and Brooklyn pages have map cards but no representative buildings. This is acceptable for broad geography coverage, but it limits near-term intelligence depth.
- Chicago: several local neighborhoods and districts have no representative buildings yet, including Andersonville, Bridgeport, Chinatown, Edgewater, Lincoln Park, Logan Square, Old Town, Rogers Park, and Wicker Park.
- Miami: Allapattah, Coconut Grove, Coral Way, Design District, Edgewater, Little Haiti, Little Havana, and Overtown currently need building support.
- Nashville: Germantown, Music Row, and The Gulch need more representative buildings.
- Seattle: Belltown, Capitol Hill, Fremont, SoDo, South Lake Union, and University District need more building relationships.
- Washington, DC: Georgetown, NoMa, and Southwest Waterfront need more building support.
- Oakland and Austin: both have useful page sets and representative building potential, but no map cards in the current local audit.

## OfficeFinder And Lead Coverage

The current route configuration shows a platform fallback route to OfficeFinder. That means Rofo can route approved leads even where no neighborhood-specific broker route exists.

For Neighborhood Intelligence, the key opportunity is not new routing complexity. It is better context in lead metadata and outgoing notes. Neighborhood, commercial area, city, state, and related space type context should continue to flow into lead submissions and referral notes so downstream partners understand the search geography.

Recommended future routing improvements:

- Track neighborhood-level lead volume and conversion quality.
- Identify neighborhoods with repeated qualified demand.
- Add broker or partner routing only where there is enough volume and confidence.
- Keep OfficeFinder as the default fallback until a specific route is justified.

## Market Guide Opportunities

Market guide coverage is a strong enrichment signal because it gives neighborhood pages a broader editorial context without inventing page-specific copy.

Guide coverage was found for:

- New York
- Los Angeles
- Denver
- Oakland
- San Diego
- Seattle
- Boston
- Austin

Partial guide coverage:

- San Francisco has office and retail guide coverage, but no industrial guide was found in the checked source files.

No guide coverage was found in the checked guide files for:

- Chicago
- Dallas
- Miami
- Washington, DC
- Atlanta
- Nashville

Recommended guide priorities:

1. Atlanta office, retail, and industrial.
2. Dallas office, retail, and industrial.
3. Chicago office, retail, and industrial.
4. Miami office and retail.
5. Washington, DC office and retail.
6. Nashville office and retail.

These guide additions would strengthen neighborhood pages, city pages, and lead routing context at the same time.

## Recommended Enrichment Tiers

### Tier 1: Enrich First

Tier 1 pages should receive the first Neighborhood Intelligence modules.

Candidate criteria:

- Clear neighborhood or district identity.
- Map card present.
- Five or more representative buildings.
- Nearby neighborhood graph is useful.
- Strong commercial search intent.
- No obvious title, geography, or relationship concerns.

Recommended first pages:

- San Francisco Financial District
- San Francisco Union Square
- San Francisco Jackson Square
- San Diego Kearny Mesa
- San Diego Sorrento Valley
- Atlanta Buckhead
- Atlanta Midtown
- Atlanta Perimeter Center
- Los Angeles Downtown
- Los Angeles Arts District
- Dallas Uptown
- Dallas North Dallas
- Denver Sun Valley
- Denver Tech Center
- Boston Back Bay
- Chicago West Loop

### Tier 2: Relationship Expansion

Tier 2 pages should be improved before deeper copy or semantic summaries are added.

Candidate needs:

- More representative buildings.
- Better nearby neighborhood curation.
- Market guide support.
- Validation against high-confidence commercial area relationships.

Good examples:

- Chicago Loop, River North, Fulton Market, Streeterville
- Austin Downtown, Domain, Warehouse District
- Miami Wynwood, Downtown Miami, Brickell if building support is normalized
- Denver LoDo, Cherry Creek
- Seattle Pioneer Square and South Lake Union
- Washington, DC Downtown and Capitol Hill

### Tier 3: Hold Or Light Treatment

Tier 3 pages should remain lightweight until data improves.

Reasons to hold:

- No representative buildings.
- Weak or absent relationship graph support.
- Thin city market context.
- Nearby links may be too generic.
- Commercial identity is real but not yet supported by enough Rofo data.

These pages can still be useful as geography pages, but should avoid deeper claims until support improves.

## Recommended Neighborhood Intelligence Data Model

The next layer should be static, reviewed, and explainable. A future data file could be generated under `data/peter/research/` first, then promoted into `_data/` only after review.

Suggested reviewed record shape:

```json
{
  "neighborhood_key": "CA/san-francisco/financial-district",
  "city": "San Francisco",
  "state_abbr": "CA",
  "intelligence_tier": 1,
  "representative_building_count": 6,
  "relationship_count": 17,
  "high_confidence_relationship_count": 13,
  "dominant_space_types": ["office", "retail"],
  "durable_signals": ["office-heavy", "client-facing", "transit-oriented"],
  "market_guide_links": ["office", "retail"],
  "nearby_graph_quality": "strong",
  "public_summary_approved": false,
  "confidence": 0.86,
  "last_reviewed": "2026-05-14"
}
```

Recommended fields:

- `intelligence_tier`
- `representative_building_count`
- `relationship_count`
- `high_confidence_relationship_count`
- `dominant_space_types`
- `durable_signals`
- `historical_listing_signal_count`
- `nearby_graph_quality`
- `market_guide_coverage`
- `officefinder_context_supported`
- `public_summary_approved`
- `confidence`
- `review_notes`

## Confidence Scoring

Neighborhood Intelligence should use a simple, explainable scoring model.

Suggested inputs:

- Representative building count.
- High-confidence building relationship count.
- Map card coverage.
- Nearby neighborhood curation quality.
- Market guide availability.
- Source diversity.
- Historical listing signal consistency.
- Building type diversity.
- Manual review status.

Suggested public thresholds:

- High confidence: safe for public chips, short summaries, and stronger internal links.
- Medium confidence: safe for internal review and light page modules, but not strong claims.
- Low confidence: keep page lightweight and avoid semantic summaries.

Public language should stay historical and contextual:

- "Common commercial patterns in this area include..."
- "Rofo has historical signals for..."
- "Representative buildings in this area suggest..."
- "This neighborhood is commonly explored alongside..."

Avoid:

- "available now"
- "currently has"
- "offers"
- "asking rent"
- suite-specific claims
- stale listing language
- broad AI-generated filler

## Scalable Enrichment Workflow

Recommended workflow:

1. Generate a reviewed candidate dataset for Tier 1 and strong Tier 2 pages.
2. Attach building relationships only where confidence is high.
3. Aggregate durable signals from buildings and historical listings.
4. Suppress transient signals such as furnished, plug-and-play, current parking, current buildout, pricing, and move-in language.
5. Produce compact neighborhood intelligence summaries.
6. Review summaries manually before public display.
7. Promote approved records into a static `_data` bridge.
8. Render small modules on neighborhood pages, not long generic copy.

Recommended modules:

- Commercial profile chips.
- Representative building environment.
- Common space type orientation.
- Nearby district comparison.
- Market guide links.
- Lead context card.

Avoid generating long paragraph content at scale. The product should feel editorial and useful, not programmatic.

## Internal Linking Opportunities

The strongest near-term graph improvements are:

- Neighborhood -> representative building links where confidence is high.
- Building -> neighborhood links only where confidence is high.
- Neighborhood -> nearby neighborhood links using curated adjacency first.
- Neighborhood -> city market guide links.
- Neighborhood -> related space type pages.
- City -> top neighborhoods plus expanded neighborhood lists.

Priority internal-linking markets:

- San Francisco: already strong and compact.
- San Diego: strong building support and guide coverage.
- Los Angeles: strong guide coverage and broad commercial geography.
- Atlanta: strong buildings, needs guide content.
- Dallas: strong pages, needs guide content.
- Denver: strong mixed office and industrial context.

## Secondary And Tertiary Market Opportunities

The broader legacy building universe indicates Rofo has latent strength outside the largest coastal markets. For Neighborhood Intelligence, the most attractive secondary and tertiary opportunities are markets where Rofo can combine commercial density, ecosystem building expansion, and simple area pages.

Recommended future market types:

- Secondary Florida commercial ecosystems such as Sarasota and Pensacola.
- Tennessee markets such as Knoxville, Chattanooga, and Nashville submarkets.
- Midwest secondary office and mixed commercial markets such as Grand Rapids and Fort Wayne.
- Industrial and logistics corridors in markets with historical activity.

These should not be launched as bulk inventory pages. They should be introduced as commercial geography and representative building ecosystems.

## Important Data Gaps

1. Representative building relationships are incomplete.
   The relationship graph covers 41 area summaries and 196 relationships, while the site has 249 neighborhood pages.

2. Ninety two pages have no representative buildings.
   Many are real and useful geographies, but they should not receive deep intelligence modules yet.

3. Market guide coverage is uneven.
   Chicago, Dallas, Miami, Washington, DC, Atlanta, and Nashville need guide coverage to support richer neighborhood pages.

4. Oakland and Austin lack map cards in the current local audit.
   Both have existing commercial geography value and should be reviewed for future map-card rollout.

5. Historical listing signals need strict public-safe filtering.
   They are useful for durable commercial identity, but should not expose stale inventory, pricing, suite-level claims, or transient buildout details.

6. OfficeFinder coverage is broad but not neighborhood-specific.
   This is acceptable for now, but lead quality reporting should eventually be analyzed by neighborhood.

## Recommended Next Steps

1. Create a machine-readable `neighborhood_intelligence_candidates_v1.json` from the 35 Tier 1 pages and selected relationship-rich Tier 2 pages.

2. Build a reviewed enrichment prototype for 5 pages:
   - San Francisco Financial District
   - San Diego Kearny Mesa
   - Atlanta Buckhead
   - Denver Sun Valley
   - Los Angeles Arts District

3. Expand the building relationship graph for high-search thin pages:
   - New York commercial areas
   - Miami neighborhoods
   - Chicago local neighborhoods
   - Nashville districts
   - Seattle neighborhoods

4. Add missing market guide coverage for the strongest cities without guides:
   - Atlanta
   - Dallas
   - Chicago
   - Miami
   - Washington, DC
   - Nashville

5. Create a public-safe neighborhood intelligence language guide before adding summaries to templates.

6. Keep the UI lightweight:
   - chips
   - short context sentences
   - representative building links
   - nearby comparisons
   - no listing grids
   - no stale inventory language

## Bottom Line

Rofo has enough structure to begin Neighborhood Intelligence, but the first rollout should be narrow and confidence-driven. The strongest opportunity is not more pages. It is making the best existing pages more useful by connecting neighborhood identity, representative buildings, historical commercial activity, market guides, and lead context in a restrained editorial format.

The safest first phase is a reviewed Tier 1 enrichment layer for 15 to 25 pages, followed by relationship expansion for thin but commercially important markets.
