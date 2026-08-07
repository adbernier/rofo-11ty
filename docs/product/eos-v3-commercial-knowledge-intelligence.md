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
- general commercial space

Medium relevance:

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

- Strategic Expansion
- Google Opportunity
- Why Now
- Emerging Themes
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

Example:

```json
{
  "id": "salinas:commercial-knowledge",
  "marketId": "salinas",
  "opportunityType": "search-led",
  "recommendedActions": [
    "Review whether a Retail Space hub has enough local evidence."
  ],
  "source": "Commercial Knowledge Intelligence"
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

### Phase 2

- Automated Google Search Console API ingestion
- 7/28/90-day momentum
- previous-period comparison
- stronger query clustering
- Publisher recommendation review workflow

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
