# EOS v3: Commercial Knowledge Intelligence

## Purpose

EOS v3 helps Rofo decide where to get smarter next.

It is not an SEO dashboard, a keyword tracker, or a replacement for the strategic market roadmap. It is the intelligence layer that connects Rofo's editorial priorities, observed Google demand, Commercial Knowledge System coverage, Publisher readiness, and market-specific knowledge gaps.

The core operating question is:

> Where should Rofo's next unit of commercial knowledge create the most value?

## Product Principle

Rofo is a commercial location intelligence platform. Search demand is evidence that a market, property type, district, building, or theme matters to users, but Google does not decide Rofo's strategy.

EOS v3 therefore keeps two inputs visibly separate:

- **Strategic Priority:** editor-controlled market importance from Rofo's roadmap.
- **Market Opportunity:** observed demand from Google Search Console and future demand sources.

Publisher may use both as inputs, but neither should collapse into a single opaque SEO score.

## Existing Systems Reused

EOS v3 builds on the existing Rofo architecture:

- Publisher snapshot generation: `scripts/publisher-snapshot.js`
- EOS generated state: `data/generated/eos-analysis.json`
- EOS admin surface: `/admin/eos`
- Publisher analysis: `lib/publisher/analyze-metros.js`
- Existing EOS assembly: `lib/eos/editorial-operating-system.js`
- Commercial Knowledge System architecture: `docs/product/rofo-knowledge-architecture.md`
- Business Brief publishing: `docs/product/business-brief-publishing-system.md`
- Market, district, building, and representative-building records

Phase 1 is additive. It does not replace existing EOS health scoring, expansion projects, Field Mode, review queues, Publisher readiness, or recommendation systems.

## Phase 1 Implementation Shape

Phase 1 adds:

- Strategic priority data: `_data/commercialKnowledgeStrategicPriorities.js`
- Manual/importable Search Console opportunity data: `_data/searchConsoleOpportunitySnapshot.js`
- Occupier-focused Market Snapshot data: `_data/commercialKnowledgeMarketSnapshots.js`
- Intelligence assembly and query classification: `lib/eos/commercial-knowledge-intelligence.js`
- Import utility: `scripts/import-search-console-opportunity.js`
- QA: `scripts/qa-eos-commercial-knowledge-intelligence.js`
- EOS admin rendering: `functions/admin/eos.js`
- City-page Market Snapshot rendering: `city.njk`

`npm run publisher:snapshot` writes the assembled intelligence into `data/generated/eos-analysis.json` under `commercialKnowledgeIntelligence`.

## Strategic Priority

Strategic priority is explicit and editor-controlled.

Initial strategic markets:

- San Francisco
- Denver
- Orange County
- Los Angeles
- Seattle

Each record includes market ID, market name, state, priority label, numeric editor score, category, and rationale. The score is not derived from Google demand.

Strategic markets should remain visible in EOS even when Search Console data highlights other markets.

## Market Opportunity

Market Opportunity comes from observed demand. Phase 1 uses a manual Search Console snapshot so the internal model can stabilize before live Google API integration.

Initial observed markets include:

- San Francisco
- Gainesville
- Aliso Viejo
- Indianapolis
- Salinas
- Fort Wayne
- San Rafael
- Houston

Some records include complete metrics. Others are theme-only observations and are treated as incomplete demand evidence, not precise rankings.

## Search Console Normalized Model

The normalized record shape supports future automated ingestion:

```json
{
  "marketId": "salinas",
  "marketName": "Salinas",
  "state": "CA",
  "clicks": null,
  "impressions": 242,
  "averagePosition": 15.3,
  "ctr": null,
  "dateRange": "recent-observed",
  "queries": [
    {
      "query": "salinas retail space for lease",
      "clicks": null,
      "impressions": null,
      "position": null,
      "intents": ["retail", "lease-availability"],
      "occupierRelevance": "high"
    }
  ],
  "queryThemes": []
}
```

The import utility accepts JSON or simple CSV and writes `data/generated/search-console-opportunity.json`.

CSV fields should include:

- `market` or `city`
- `marketId` or `market_id` when available
- `state`
- `query`
- `clicks`
- `impressions`
- `position` or `average_position`

Run:

```bash
node scripts/import-search-console-opportunity.js path/to/search-console-export.csv
```

## Query Intent Taxonomy

Phase 1 uses deterministic keyword rules. Queries may receive multiple labels.

Initial taxonomy:

- office
- retail
- warehouse
- industrial
- flex
- medical
- coworking
- general commercial real estate
- lease / availability
- sale
- district / neighborhood
- building / address
- business type
- market intelligence
- investor
- broker / brokerage
- unknown

Examples:

- `fort wayne warehouses for lease` -> warehouse, lease / availability
- `gainesville storefront for lease` -> retail, lease / availability
- `indianapolis cap rates and investment analysis` -> investor
- `1200 17th st denver office` -> office, building / address

## Occupier Relevance

EOS v3 separates current occupier demand from future investor or broker-facing intelligence.

High relevance:

- office
- retail
- warehouse
- industrial
- flex
- medical
- coworking
- district / neighborhood
- building / address
- lease / availability

Medium relevance:

- general commercial real estate
- broad commercial property
- business space / business property
- general market information
- sale
- market intelligence

Low / future relevance:

- cap rates
- investment returns
- sale price per square foot
- investment analysis
- brokerage searches

Investor demand remains visible in EOS, but it does not automatically create occupier Publisher work.

## Knowledge Coverage

EOS v3 reuses existing knowledge structures where available:

- market overview presence from the Location Knowledge Graph
- Market Snapshot presence from `_data/commercialKnowledgeMarketSnapshots.js`
- district coverage from Location Knowledge Graph district nodes
- representative building coverage from canonical building page records
- Business Brief coverage from resolved Business Brief records
- Publisher metro state from existing Publisher analysis

Coverage gaps are editor-readable labels such as:

- market-overview
- market-snapshot
- district-coverage
- representative-buildings
- business-guides
- retail-depth
- industrial-warehouse-depth
- office-business-guides

## EOS v3.4 Market Foundation and Evidence Acquisition

EOS v3.4 adds a bounded Market Foundation capability to Search Mission work-packet generation. The goal is to prevent immature markets from becoming automatic dead ends while preserving Rofo's evidence standard.

When Search Intelligence identifies demand in a market where Rofo's canonical graph is thin, EOS should distinguish three states:

- **Ready:** enough canonical evidence exists to build the requested knowledge directly.
- **Researchable:** canonical evidence is incomplete, but the missing evidence can reasonably be acquired from trustworthy sources.
- **Blocked:** the requested fact cannot currently be established responsibly.

This changes the interpretation of missing evidence. Missing canonical evidence is not automatically failure; it may be the work. A packet should first ask whether Rofo can responsibly learn enough, then establish the smallest useful foundation before building deeper knowledge.

### Minimum Viable Market Foundation

A Market Foundation is not full market completion. It is the minimum commercial structure needed for later missions to work intelligently.

For a market + property type, foundation should include:

- canonical market identity, state, and strategic parent or nearby-market context where appropriate
- occupier-focused commercial character
- target property-type context
- defensible commercial geography, which may be a district, submarket, corridor, industrial area, business park, municipality, or commercial center
- a small set of representative properties where source evidence supports them
- source trace sufficient for editorial review

The model is property-type aware. Office foundations may emphasize CBDs and office corridors. Warehouse / industrial foundations may emphasize logistics corridors, industrial parks, access patterns, and warehouse/flex properties. Retail foundations may emphasize retail corridors, shopping centers, neighborhood commercial areas, and retail environments.

EOS must not force San Francisco-style district ontology onto every market. Secondary markets and industrial markets may be better represented by corridors, business parks, or submarkets.

### Foundation States

Mission packets use three simple foundation states:

- **Unmapped:** Rofo knows almost nothing structurally about the market/property type.
- **Foundation:** enough source-supported commercial structure exists for targeted enhancement.
- **Developed:** substantial canonical knowledge exists across market context, geography, and representative evidence.

The important v3.4 transition is `Unmapped -> Foundation`. That transition lets EOS create useful follow-on missions without requiring complete market buildout.

### Evidence Source Standard

Evidence acquisition should prioritize sources that can support the specific claim being promoted:

- **Tier 1 - Primary / Institutional:** official government, property owner, transit or planning agency, and official development material.
- **Tier 2 - Strong Commercial Evidence:** established brokerage research, institutional CRE reports, and reputable property or development sources.
- **Tier 3 - Discovery:** search results, directories, and secondary summaries.

Tier 3 sources may identify candidates, but they should generally not be the sole basis for canonical geography, representative-property selection, or public claims.

Research findings move through a simple promotion path:

```text
Candidate
Source-supported
Canonical
```

Codex should not promote a geography or property into canonical Rofo structures until the identity is stable, useful to occupiers, and supported by the source standard.

### Work Packet Behavior

Search Mission packets now include a `marketFoundation` assessment. If dependent knowledge is missing because underlying geography or building evidence is absent, the packet should insert an Evidence Acquisition phase before the knowledge build.

Example sequence:

```text
Evidence Acquisition
1. Establish target-property commercial geography.
2. Identify representative property candidates.
3. Validate evidence and source trace.
4. Promote only defensible structures into canonical source files.

Knowledge Build
5. Update Market Snapshot or market context.
6. Create Commercial Market Evidence only when the evidence standard is met.
7. Add representative-building intelligence or Building Profiles only when source-supported.
```

Packets remain bounded to the approved mission's target markets, property type, and gaps. They should not ask Codex to research the entire city or adjacent property types unless directly required by the packet.

### Contrasting Assessment Examples

Fort Wayne + Warehouse is the canonical immature-market example. If search demand is visible but Rofo has little source-controlled market structure, the packet should classify the market as `Unmapped`, treat industrial geography and representative properties as `Researchable`, and mark dependent Commercial Market Evidence or public business-guide work as blocked until the foundation is established.

Aurora + Warehouse is a more mature-market example because Denver-area industrial context and representative-building records already exist in the broader graph. A packet may still require evidence acquisition, but it should be narrower: validate Aurora-specific industrial geography and representative properties, then build only the knowledge that the acquired evidence supports.

A truly blocked case remains possible. If reliable sources cannot establish stable commercial geography, representative property identity, or the requested property-type claim, the packet should stop and record the gap as `Blocked` rather than lowering the evidence standard.

### Completion Semantics

Mission completion means:

```text
Completed - scoped work delivered
```

Deferred or blocked gaps can remain recorded without making the mission a failure. Each deferred gap should state whether it is researchable later or genuinely blocked and why.

The completion report should include:

- Implementation Summary
- Files Changed
- Mission Evidence Used
- Gaps Completed
- Evidence Acquired
- Canonical Knowledge Added
- Gaps Deferred, classified as researchable later or blocked
- QA Results
- Validation Results
- Recommended Next Opportunity

`Recommended Next Opportunity` is input back to EOS. It is not authorization for Codex to continue working.

These are prioritization aids, not claims of complete market knowledge.

## Opportunity Heuristic

The Phase 1 heuristic is intentionally simple and transparent.

Inputs:

- impressions
- average position
- occupier-demand share
- dominant query themes
- knowledge gaps
- strategic priority

Position bands:

- 5-20: near-term opportunity
- 20-40: emerging opportunity
- 40+: discovery signal
- metric pending: theme-only record

Opportunity labels:

- high
- medium
- theme signal
- mixed signal
- discovery
- future signal

EOS should show the explanation next to the label. The rationale matters more than the label.

## Opportunity Categories

### Strategic Expansion

Markets Rofo intentionally plans to deepen, regardless of whether Google demand is currently the loudest signal.

### Search-Led Opportunities

Markets where Google is already testing Rofo for commercial knowledge and current knowledge coverage is incomplete.

### Emerging Themes

Cross-market intent patterns, such as retail, warehouse, office, buildings, districts, or market intelligence.

### Investor / Future Signals

Investor and brokerage demand is recorded separately. It may inform a future product, but it should not drive current occupier publishing recommendations.

## EOS Admin Surface

The `/admin/eos` Mission Control page includes a new additive section:

**Commercial Knowledge Intelligence**

It shows:

- Recommended Search Missions
- Strategic Expansion
- Google Opportunity
- Why Now
- Emerging Themes
- Property-Type Signals
- Investor / Future Signals
- Publisher opportunity preparation

The admin surface does not call Google or compute live intelligence. It reads generated `eos-analysis.json`.

## Publisher Integration

Phase 1 prepares Publisher inputs but does not let Publisher automatically modify content.

Publisher opportunity records include:

- market ID
- opportunity type
- recommended actions
- rationale
- source

Phase 2B also adds advisory Search Mission payloads. These are topic-led work recommendations, not content changes.

Example:

```json
{
  "type": "search_mission",
  "missionId": "expand-retail-knowledge",
  "title": "Expand Retail Knowledge",
  "confidence": "high",
  "supportingMarkets": [
    { "marketId": "salinas", "marketName": "Salinas" },
    { "marketId": "gainesville", "marketName": "Gainesville" }
  ],
  "recommendedActions": [
    "Prioritize Retail Space hub evidence where demand is strongest."
  ],
  "source": "search_intelligence"
}
```

Future Publisher work can convert these into execution tasks after editorial review.

## Market Snapshot

EOS v3 defines a lightweight, occupier-focused Market Snapshot for city pages.

It is not an investor report and should not publish cap rates, investment returns, IRR, speculative pricing data, or investor recommendations.

Phase 1 adds structured snapshots for:

- San Francisco
- Denver

Snapshot fields:

- commercial character
- business drivers
- property-type context
- key commercial districts
- business-location context
- nearby markets
- CTA
- source trace
- last reviewed

The snapshot appears as a modular section on city pages and links naturally into:

- Office Space pages
- district pages
- nearby markets
- `Create My Location Brief`

If a field lacks support, it should be omitted instead of padded with generic copy.

## City-Page Placement

Phase 1 places the Market Snapshot near the top of city pages after the hero/editorial photo and before district exploration. This gives visitors commercial context before they compare districts or buildings.

The implementation is deliberately modular:

- data is attached in `_data/cities.js` as `commercial_knowledge_snapshot`
- rendering lives in `city.njk`
- presentation uses scoped `.city-knowledge-snapshot` CSS

## Public Boundaries

EOS v3 must not:

- publish investor recommendations
- publish cap rates, IRR, or investment-return claims
- introduce unsupported pricing
- change recommendation scoring
- add new recommendation markets
- generate pages automatically from Search Console signals
- let Google override editorial strategy

## Future Phases

### Phase 1

- Manual/importable GSC snapshots
- Deterministic query classification
- Occupier relevance
- Opportunity intelligence
- EOS admin visibility
- SF/Denver Market Snapshot

### Phase 2A

- Automated Google Search Console Search Analytics ingestion
- server-side service-account authentication
- date + page + query grain
- 7-day and 28-day previous-period comparison
- small-sample momentum handling
- URL-to-knowledge-entity mapping
- stale-data fallback
- Publisher opportunity payloads sourced from Search Intelligence

### Phase 2B

- deterministic query-classification refinement from live GSC evidence
- topic-first intelligence across markets
- Search Mission generation
- mission confidence
- strategic-parent support in missions
- mission-to-Publisher advisory payloads
- EOS Today integration limited to one Search Mission

### Phase 3

- knowledge-gap-driven Publisher queue
- cross-market demand trend alerts
- opportunity notifications
- reusable execution packets for market knowledge expansion

### Future

- separate investor / owner / broker intelligence products with separate audience rules, editorial standards, and publishing constraints

## QA

Run:

```bash
node scripts/qa-search-intelligence.js
node scripts/qa-eos-commercial-knowledge-intelligence.js
npm run publisher:snapshot
npm run build
git diff --check
```

The QA validates:

- query classification
- occupier vs investor separation
- strategic markets remain present
- search-led opportunities remain separate
- knowledge-gap mapping
- EOS generated output
- Market Snapshot data provenance
- no unsupported investor metrics in public snapshot data
- city-page rendering hook

## Phase 2A Search Intelligence

Phase 2A connects EOS to Google Search Console without turning EOS into a Search Console dashboard.

The production GSC property is:

```text
https://www.rofo.com/
```

The sync writes:

```text
data/generated/search-console-opportunity.json
data/generated/search-intelligence-history.json
```

EOS reads the generated opportunity artifact. The admin page never calls Google directly.

### Authentication

Google authentication lives in:

```text
lib/search-intelligence/google-search-console-client.js
```

The adapter uses a server-side service account JWT flow with the readonly Search Console scope:

```text
https://www.googleapis.com/auth/webmasters.readonly
```

Required production configuration:

- `GSC_SITE_URL=https://www.rofo.com/`
- `GSC_ENABLE_LIVE=true` when live ingestion should run
- either `GSC_SERVICE_ACCOUNT_JSON` as a secret containing the full service-account JSON
- or `GSC_SERVICE_ACCOUNT_EMAIL` plus `GSC_PRIVATE_KEY` as secrets

Do not commit credential JSON, private keys, or access tokens.

The Search Console property must grant the service account read access. In Google Search Console, add the service account email as a user on the `https://www.rofo.com/` property with sufficient read permission.

### Local Development

Without credentials, run the sync in manual mode:

```bash
node scripts/sync-search-console.js
```

This uses the checked-in manual opportunity snapshot and writes the same normalized generated artifact.

With credentials available in the environment:

```bash
GSC_ENABLE_LIVE=true node scripts/sync-search-console.js --live
```

### Sync Workflow

The sync lives in:

```text
scripts/sync-search-console.js
lib/search-intelligence/search-console-sync.js
```

It:

1. calculates complete-day windows
2. authenticates server-side
3. requests Search Analytics rows with `date`, `page`, and `query`
4. maps URLs to Rofo knowledge entities
5. classifies query intent
6. classifies occupier relevance
7. aggregates by market and property type
8. calculates 7-day and 28-day momentum
9. writes bounded generated artifacts
10. preserves the last successful snapshot if live sync fails

Initial windows:

- last 7 complete days
- previous 7 complete days
- last 28 complete days
- previous 28 complete days

The schema prepares for last 90 complete days, but Phase 2A does not need to emphasize 90-day trends.

### Normalized Search Data

The primary raw grain is:

```text
date + page + query
```

Each normalized row preserves:

- date
- page
- source page
- query
- clicks
- impressions
- CTR
- average position
- mapped entity
- market
- property type
- district where detectable
- building where detectable
- archetype where detectable
- query intents
- occupier relevance

The generated artifact keeps raw observations bounded so the static site does not become a raw query warehouse.

### URL Mapping

URL mapping lives in:

```text
lib/search-intelligence/url-entity-mapper.js
```

It recognizes:

- homepage
- city pages
- property-type pages
- Business Brief pages
- district pages
- building pages

Examples:

```text
/commercial-real-estate/CA/san-francisco/
-> market: san-francisco

/commercial-real-estate/CA/san-francisco/office-space/
-> market: san-francisco
-> propertyType: office

/commercial-real-estate/CA/san-francisco/office-space/technology-companies/
-> business_brief
-> market: san-francisco
-> propertyType: office
-> archetype: technology-companies
```

### Noise Filtering

Phase 2A retains raw normalized rows where practical, but display/opportunity layers use aggregate thresholds:

- display minimum impressions: 10
- strong sample minimum impressions: 25

Small samples are marked as `weak_sample` instead of being described as meaningful trends.

This allows clusters of small query variants to contribute to aggregate demand without overstating a 4-impression movement.

### Momentum

Momentum is calculated transparently:

- current impressions vs previous impressions
- current clicks vs previous clicks
- current average position vs previous average position
- sample strength

Labels:

- `up`
- `down`
- `stable`
- `weak_sample`
- `not_comparable`

### Strategic Rollups

Strategic priority remains independent.

Phase 2A adds initial child-market support for Orange County. For example, Aliso Viejo search traction can support Orange County strategy without erasing Aliso Viejo as its own market opportunity.

## Phase 2B Search Missions

Phase 2B turns Search Intelligence evidence into a small number of actionable editorial missions.

The mission layer answers:

```text
What work would create the most leverage now?
```

It does not replace market opportunities. It interprets them.

### Classification Refinements

Live GSC data exposed broad commercial queries such as:

```text
commercial tampa fl
```

These now classify as `general-commercial` with medium occupier relevance. Broad commercial demand is useful evidence, but it is less actionable than concrete searches for office, retail, warehouse, industrial, flex, medical, district, building, or availability intent.

Concrete examples:

- `commercial tampa fl` -> general-commercial -> medium
- `commercial rental space in tampa` -> general-commercial, lease / availability -> high
- `fort wayne warehouses for lease` -> warehouse, lease / availability -> high
- `aliso viejo commercial real estate cap rates` -> general-commercial, market intelligence, investor -> low / future unless paired with concrete occupier intent

Investor and brokerage terms remain visible but quarantined from current occupier Publisher work.

### Topic-First Intelligence

EOS now aggregates search evidence by topic across markets.

Supported initial topics include:

- Office
- Retail
- Warehouse
- Industrial
- Flex
- Medical
- Districts
- Buildings
- Business Type
- General Commercial
- Market Intelligence
- Investor / Future

Each topic can report:

- impressions
- clicks
- average position
- market count
- strongest supporting markets
- occupier relevance
- momentum summary
- knowledge gaps
- opportunity gap

This keeps the operator from choosing among hundreds of markets manually.

### Search Mission Model

A Search Mission is an editorial work recommendation with evidence.

Mission types:

- `property_type`
- `building_intelligence`
- `district`
- `strategic_alignment`
- `market_specific`

Example missions:

- Expand Retail Knowledge
- Expand Warehouse / Industrial Knowledge
- Deepen Office Knowledge
- Deepen Building Intelligence
- Deepen District Intelligence
- Accelerate Orange County
- Expand Salinas Retail / General Commercial

Every mission includes:

- title
- type
- confidence
- supporting markets
- impressions
- average position
- momentum
- occupier relevance
- knowledge gaps
- recommended actions
- why now
- source

### Mission Confidence

Mission confidence is transparent.

Inputs:

- sample size
- average position
- number of supporting markets
- occupier relevance
- knowledge-gap clarity

Confidence labels:

- high
- medium
- low

High confidence generally requires multiple reinforcing signals, meaningful impressions, strong or near-term position, concrete occupier relevance, and a clear coverage gap.

### Strategic Parent Support

Child-market search evidence can strengthen a strategic region without erasing the child market.

Example:

```text
Aliso Viejo -> Orange County
```

Aliso Viejo can support an `Accelerate Orange County` mission while remaining visible as its own observed market.

Investor-heavy child-market demand may strengthen authority-building strategy, but it should not automatically generate occupier publishing work unless concrete occupier intent is present.

### Today Integration

EOS Today may surface at most one Search Mission among the top three recommendations.

The Today card should show:

- mission title
- why today
- supporting markets
- confidence-derived impact
- link to Commercial Knowledge Intelligence

Today must not show raw query tables.

### Explore Search Intelligence

The deeper intelligence surface should lead with:

1. Recommended Search Missions
2. Strongest Market Opportunities
3. Emerging Topics
4. Property-Type Signals
5. Strategic Markets + Search Support
6. Investor / Future Signals

### Raw Data Storage Recommendation

Live GSC sync can produce tens of thousands of page/query observations. The generated static artifact should remain bounded and should emphasize intelligence summaries.

Recommended near-term policy:

- commit deterministic normalized summaries required by EOS
- keep raw observations bounded in generated artifacts
- avoid exposing raw query tables in the admin home
- move full raw/history storage to runtime storage in a future phase if Rofo needs long-term trend analysis

Do not turn the repository into an unbounded Search Console warehouse.

The strategic data remains editor-controlled in:

```text
_data/commercialKnowledgeStrategicPriorities.js
```

### Failure Behavior

If live Google sync fails:

- the script preserves the last successful generated snapshot
- marks it stale
- records the failure message and timestamp
- does not wipe EOS opportunity data

EOS should show stale-data status internally, but generated public pages should not expose Google operational details.

### Scheduling

Recommended production cadence:

- daily ingestion
- weekly editorial review emphasis

The sync is idempotent: each run rewrites the current generated opportunity snapshot from the selected time windows. A future scheduler can invoke:

```bash
GSC_ENABLE_LIVE=true node scripts/sync-search-console.js --live
```

Cloudflare production secrets should be configured before enabling live ingestion in an automated job.

## Known Limitations

- Phase 1 does not connect to live Search Console APIs.
- Several observed markets are theme-only until a full metric export is imported.
- Knowledge-gap mapping is intentionally coarse and should be refined as Publisher readiness becomes more granular.
- Building and district detection in queries is deterministic and basic.
- Investor demand is stored only as future intelligence.
- SF/Denver Market Snapshots are concise and should grow from canonical market knowledge, not from generic prose.

## Operating Rule

Google is evidence, not strategy.

EOS v3 should help Rofo compare what it has decided to build with what the market is already asking it to know, then give Publisher a clear, defensible next knowledge opportunity.
