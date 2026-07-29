# Commercial Market Evidence

Commercial Market Evidence is Rofo's source-supported system for explaining why a commercial location, ecosystem, or recommendation deserves to exist.

It turns curated commercial environments into product evidence. A building, campus, park, corridor, or destination is not treated as generic inventory. It is selected because it teaches something durable about how businesses operate in a district or metro.

This document is architectural. It does not implement runtime behavior, change Publisher scoring, change Compass recommendations, or migrate existing records.

The first reference implementation is `docs/commercial-market-evidence-financial-district.md`. Its first production source dataset lives in `data/commercial-market-evidence/san-francisco/financial-district.js` and is exposed to Eleventy through `_data/commercialMarketEvidence.js`. Future district collections should use that Financial District model as the quality benchmark before Commercial Market Evidence becomes a generalized source-data system.

Commercial Market Evidence is now registered as a first-class platform service. Publisher consumes the validator summary as platform health, and Mission Control displays that health while EOS resolves district building-evidence work into executable Program Missions.

Mission Control also performs presence-based expansion discovery. It compares Knowledge Graph district nodes with existing Commercial Market Evidence collections, lists missing district collections as future expansion opportunities, and exposes eligible district work as bounded Missions. V1 still does not measure collection quality beyond validator success and collection presence.

In the shared EOS Portfolio Resolver model, Commercial Market Evidence remains a valid district-level evidence unit. The operator-facing execution path can combine that collection work with selected Building Profiles through one District Building Evidence Mission when both belong to the same district workflow. Individual evidence records, research, narrative, validator fixes, profile work, and documentation notes remain hidden Work Items. EOS should not combine an entire market's missing CME collections into one execution packet.

Commercial Market Evidence coverage uses the same canonical commercial geography as Publisher and Compass. A market's collection denominator is every canonical Knowledge Graph district assigned to that operational market, not only the districts that already have collections or the districts previously selected for a pilot. Missing collections are maturity gaps, not evidence that a district is ineligible.

## Purpose

Commercial Market Evidence exists to make Rofo's location guidance more credible, concrete, and reviewable.

It should help Rofo answer:

- why this district matters commercially
- which business ecosystems are actually represented
- what types of environments users should compare
- which examples make a recommendation easier to trust
- where Building Profiles are needed
- what evidence remains thin, generic, unsupported, or missing

The product goal is not to add more buildings. The product goal is to explain commercial markets through strong examples.

## Definition

Commercial Market Evidence is a curated evidence layer made of source-supported commercial environments that explain a location decision.

An evidence record may represent:

- a single building
- a multi-building complex
- an office park
- an industrial park
- a research campus
- a medical campus
- a retail destination
- a mixed-use center
- a logistics facility
- a creative or production building
- another durable commercial environment

Evidence should be selected for editorial value, not only availability, size, fame, or data completeness.

## Product Relationships

Commercial Market Evidence sits between the Commercial Location Knowledge Graph and public decision support.

```text
Commercial Location Knowledge Graph
Commercial Market Evidence
Representative Building Intelligence
Building Profile / Building Brief
Compass Recommendation
Location Brief
Publisher
Mission Control
```

### Knowledge Graph

The Knowledge Graph defines cities, districts, ecosystems, comparison relationships, fit, tradeoffs, and validation questions. Commercial Market Evidence supports the graph by showing concrete environments that make those claims understandable.

The graph answers:

```text
What does this location mean commercially?
```

Market Evidence answers:

```text
What examples prove or explain that meaning?
```

### Representative Buildings

Representative Buildings are the current implementation path for much of Commercial Market Evidence. They should evolve from district-attached building examples into a broader evidence system with explicit evidence roles, quality states, and provenance.

A Representative Building can become a Commercial Market Evidence record when it has a clear evidence role, source support, ecosystem relevance, and editorial purpose.

### Building Profiles and Building Briefs

Building Brief remains the internal architecture. Building Profile remains the public product.

A Building Profile is the user-facing form of high-confidence evidence. It should explain a commercial environment in practical terms:

- what the environment represents
- which businesses may evaluate it
- which durable characteristics matter
- what tradeoffs matter
- what must be validated before a real space decision

Not every evidence record needs a Building Profile immediately. Publisher and Mission Control should distinguish evidence inventory from migrated public profiles.

### Recommendations

Compass recommendations should remain based on the Knowledge Graph and recommendation resolver logic. Commercial Market Evidence should not change rankings by itself.

Instead, evidence improves explainability. It gives recommendations stronger supporting examples and helps Location Briefs show the user what kind of environment the recommendation represents.

### Publisher

Publisher should measure Market Evidence as an additive readiness and coverage layer. It should report evidence quality and gaps without turning raw evidence count into a quality score.

Publisher remains deterministic. It should not infer property facts, market importance, current availability, or tenant suitability without source support.

### Mission Control

Mission Control should use Publisher evidence signals to generate focused missions:

- build district evidence foundations
- expand ecosystem evidence breadth
- improve evidence quality
- migrate selected evidence into Building Profiles
- resolve review-required evidence
- connect evidence to recommendations and comparison logic

Mission Control should keep Market Evidence missions separate from Field Mode photography, public-template redesign, and unrelated recommendation-ranking work.

## Evidence Types

Evidence types describe the kind of commercial environment being used as proof or explanation.

Initial evidence types may include:

- Office Tower
- Office Park
- Creative Office Building
- Neighborhood Office Building
- Flex Business Park
- Industrial Park
- Small-Bay Industrial Cluster
- Logistics Facility
- Last-Mile Distribution Facility
- Light Manufacturing Environment
- Research Campus
- Life Science Building
- Medical Office Building
- Medical Campus
- Retail Destination
- Main Street Retail Corridor
- Shopping Center
- Mixed-Use Center
- Hospitality District Anchor
- Special-Purpose Facility
- Innovation District

Evidence type should not be a public claim about permitted use. It is an editorial classification of what the environment helps explain.

## Evidence Roles

Evidence roles explain why an evidence record exists in Rofo.

Examples:

- District Anchor: helps define the district's commercial identity.
- Ecosystem Example: shows how a specific ecosystem operates in the district.
- Comparison Example: helps users compare one district or operating model with another.
- Operating Model Example: illustrates a durable space-use pattern such as service dispatch, office-warehouse mix, patient access, or research operations.
- Scale Example: clarifies small-bay, mid-size, campus, or large-format operating environments.
- Transition Example: shows mixed-use, adaptive reuse, or changing district character.
- Validation Example: highlights details users must verify before choosing similar space.

Roles should be explicit and source-supported where possible. They should not imply current tenancy or availability.

## Data Model

Commercial Market Evidence should be designed as an additive layer over existing canonical records.

Conceptual shape:

```js
{
  id,
  evidenceType,
  evidenceRole,
  subjectType,
  subjectId,
  subjectName,
  marketId,
  cityId,
  districtIds,
  ecosystemIds,
  ecosystemSubtypes,
  representativeRoles,
  businessActivities,
  businessArchetypes,
  operationalCharacteristics,
  evidenceSummary,
  whyItMatters,
  sourceNotes,
  provenance,
  confidence,
  quality,
  buildingProfileStatus,
  recommendationUse,
  reviewStatus
}
```

The actual implementation should reuse repository conventions when built. This conceptual model defines the durable product contract, not an immediate schema migration.

## Field Ownership

Canonical facts belong to canonical source records:

- address
- name
- city
- district
- property type
- verified size, year, configuration, loading, or access facts when source-supported

Market Evidence owns editorial interpretation:

- why this example matters
- which ecosystem it explains
- which operating model it represents
- which tradeoffs it helps users understand
- which validation questions it raises

Building Profiles own user-facing explanation:

- practical business fit
- durable location and building characteristics
- strengths
- tradeoffs
- comparison guidance
- validation checklist

Publisher owns measurement:

- coverage
- gaps
- readiness
- evidence quality signals
- mission opportunities

Mission Control owns planning:

- prioritization
- bundling
- execution packets
- review handoff

## Quality Standards

Commercial Market Evidence should be evaluated by quality, not quantity.

Strong evidence is:

- commercially recognizable within the market
- relevant to a district, ecosystem, or recommendation
- source-supported
- specific enough to teach a user something
- distinct from nearby or duplicate examples
- tied to a clear evidence role
- connected to tradeoffs and validation questions
- safe from unsupported property claims
- suitable for future Building Profile migration

Weak evidence is:

- a generic building list
- selected only because a URL exists
- duplicative of another example
- missing ecosystem or operating-role context
- based on stale availability or listing copy
- dependent on promotional language
- unclear about what it proves
- likely to confuse recommendations or district identity

## Confidence and Provenance

Evidence should preserve mixed confidence.

Suggested confidence states:

- Verified Property Fact
- Source-Supported Characteristic
- Editorially Supported
- Representative Inherited
- District Inferred
- Taxonomy Inferred
- Review Required

Provenance should identify whether evidence comes from:

- canonical building data
- public property source
- brokerage brochure
- ownership or official page
- planning or economic-development source
- Representative Building Intelligence
- Building Profile editorial judgment
- Field Mode photography
- human review

Taxonomy compatibility must not become a verified property fact. Business archetype fit must not imply current tenancy.

## Editorial Workflow

The future workflow should be:

```text
Research
Candidate Evidence
Editorial Approval
Publisher Measurement
Mission Control Planning
Building Profile Migration
Compass Explainability
```

### Research

Research identifies candidate environments from reliable sources. It should prioritize market relevance and evidence quality over volume.

### Candidate Evidence

Candidate evidence should include enough structured information for review:

- subject
- district
- ecosystem
- evidence type
- evidence role
- source notes
- reason for inclusion
- known facts
- validation-required topics

### Editorial Approval

Human review confirms whether the candidate actually explains the market. Approval should decide:

- keep
- defer
- reject
- migrate to Building Profile
- keep as internal evidence only

### Publisher Measurement

Publisher measures the approved evidence layer and reports gaps, imbalance, review-required records, and migration opportunities.

Current v1 platform integration is intentionally narrower: Publisher includes the Commercial Market Evidence validator summary in generated analysis for visibility only. It reports collections, validation status, evidence-record count, coverage, confidence buckets, and deferred candidates without changing Publisher scores or readiness calculations.

### Mission Control Planning

Mission Control converts measurable gaps into missions. It should bundle related evidence work conservatively and route photography to Field Mode.

Current platform integration displays the generated Commercial Market Evidence health summary in Mission Control and lets EOS create executable District Building Evidence Missions for eligible districts.

Expansion planning remains deterministic. EOS identifies which Knowledge Graph districts have collections and which are missing collections, then produces a deterministic suggested expansion order.

The source-data unit is the district collection. The operator-facing Mission may create one source-supported collection, validate an existing collection, and complete selected evidence Building Profiles in one packet. Evidence-record research, district narrative, validator fixes, Building Profile work, and documentation updates stay hidden inside the Execution Packet.

Commercial Market Evidence and Building Profiles remain separately owned. CME records should reference canonical Building Profiles where available, but they should not duplicate full Building Profile content. Publisher may report both systems, but it should not treat a completed CME collection as proof that selected evidence buildings have complete public profiles.

### Building Profile Migration

Only selected high-value evidence should become a public Building Profile. Migration should follow ecosystem-specific Building Profile standards and preserve the distinction between property facts and editorial interpretation.

## Publisher Metrics

Publisher should eventually measure Market Evidence without changing existing readiness scoring until a focused implementation sprint approves it.

Potential metrics:

- evidence count by metro
- evidence count by district
- evidence count by ecosystem
- evidence type coverage
- evidence role coverage
- distinct operating models represented
- Building Profile migration coverage
- source quality distribution
- confidence distribution
- review-required count
- duplicate or near-duplicate evidence count
- evidence connected to recommendation-active districts
- evidence connected to comparison relationships
- evidence with Field Mode photography

Publisher should avoid:

- treating high counts as high quality
- rewarding duplicate buildings
- treating current availability as durable evidence
- inferring market importance from missing data
- mixing photography coverage into knowledge readiness without labeling it separately

## Expansion Planning

Commercial Market Evidence Expansion Planning v1 is a presence-only EOS layer.

It compares:

```text
Commercial Location Knowledge Graph districts
Commercial Market Evidence collections
```

For each district, EOS records either:

- Collection Exists
- Missing Collection

The suggested expansion order is deterministic. Current ordering favors:

- districts assigned to Publisher-tracked metros
- metros with stronger current Publisher readiness, because existing editorial infrastructure can support evidence expansion
- high-confidence Knowledge Graph districts
- districts with public district pages
- districts with representative-building relationships
- districts with comparison relationships
- districts with recommendation-oriented fields such as space-type fit, best-fit guidance, and validation questions

Ties are resolved by metro, city, and district name.

This ordering is not a quality score. It does not mean the first district is more important commercially than every later district. It only gives the operator a stable starting point for future evidence-collection planning.

Quality measurement is intentionally deferred. A future Publisher/EOS sprint should measure evidence quality only after more district collections exist.

## Validation

Commercial Market Evidence source data is validated by:

```bash
node scripts/qa-commercial-market-evidence.js
```

The validator loads `_data/commercialMarketEvidence.js`, checks dataset integrity, required fields, relationship references, Building Profile references, confidence values, source notes, and editorial quality signals such as placeholders, empty arrays, missing tradeoffs, missing alternatives, duplicate descriptions, and overly short narrative fields.

The script prints a concise coverage report and exposes a structured summary object. `npm run publisher:snapshot` consumes that summary and writes a read-only Commercial Market Evidence platform section into `data/generated/publisher-analysis.json` and `data/generated/eos-analysis.json`.

## Mission Control Integration

Mission Control displays Market Evidence platform health and expansion coverage from generated EOS analysis. EOS also resolves the next missing district collection in each eligible operational market into one executable Program Mission. This does not alter Publisher scoring, recommendation rankings, Field Mode ownership, or Commercial Market Evidence quality standards.

Commercial Market Evidence expansion uses operational market ownership, not broad geographic metro adjacency. Publisher may analyze San Francisco as a Bay Area-wide readiness metro, but EOS must still assign Berkeley districts to the East Bay workspace, San Francisco districts to San Francisco, and Peninsula or South Bay districts to their own operating markets. Comparison relationships are useful for explanation, but they do not assign ownership.

District ownership resolution follows this deterministic order:

1. explicit district market ownership when available
2. existing Commercial Market Evidence collection metadata
3. canonical public city/state ownership
4. Publisher metro fallback only when no stronger signal exists

Ambiguous or unresolved ownership is surfaced in EOS analysis and does not generate executable Commercial Market Evidence missions.

Mission types may include:

- District Evidence Foundation
- Ecosystem Evidence Foundation
- Evidence Role Expansion
- Evidence Quality Review
- Evidence Deduplication
- Building Profile Migration
- Recommendation Evidence Support
- Field Mode Evidence Photography

Knowledge-focused evidence missions should include:

- objective
- current evidence gap
- target district or ecosystem
- included evidence tasks
- deferred Field Mode or public-template work
- relevant files
- source requirements
- acceptance criteria
- QA commands

Photography should remain Experience Readiness and Field Mode-owned unless a future sprint explicitly changes that boundary.

## Research Mission Integration

Research Missions are the future intake path for Market Evidence.

They should produce structured candidate evidence rather than final public copy.

Research Mission output should include:

- candidate subject
- candidate evidence type
- candidate evidence role
- source URLs or repository source notes
- known property facts
- editorial reason
- ecosystem relevance
- likely Building Profile value
- risks or validation needs
- recommendation or comparison relationships supported

Mission Control can then route the result to editorial approval, Building Profile migration, or rejection.

## Migration Strategy

Existing Representative Buildings should evolve into Commercial Market Evidence in stages.

### Stage 1: Inventory

Map existing Representative Buildings, Commercial Building Intelligence records, and Building Profiles to conceptual evidence records.

### Stage 2: Normalize Roles

Add explicit evidence types and evidence roles where current Representative Building Intelligence already supports them.

### Stage 3: Quality Review

Identify thin, duplicate, unsupported, or review-required evidence. Do not migrate weak records solely for count.

### Stage 4: Publisher Reporting

Add additive Market Evidence coverage signals to Publisher. Keep existing scoring stable until a focused scoring sprint.

### Stage 5: Mission Control Missions

Generate Market Evidence missions from Publisher signals. Bundle related evidence work by metro, ecosystem, and validation path.

### Stage 6: Building Profile Migration

Promote selected high-confidence evidence into public Building Profiles where it adds user-facing decision value.

### Stage 7: Compass Support

Use approved evidence to strengthen recommendation explainability and Location Brief support without changing ranking logic by default.

## Roadmap

### Phase 1: Architecture

Define terminology, product boundaries, evidence types, quality standards, Publisher metrics, Mission Control integration, and migration strategy.

### Phase 2: Source Mapping

Audit existing Representative Buildings, Building Profiles, and Commercial Building Intelligence against the Market Evidence model.

### Phase 3: Additive Data Layer

Introduce a repository-owned Market Evidence data layer or normalized helper that reuses canonical building records.

### Phase 4: Publisher Measurement

Add additive Publisher reporting for evidence coverage, quality, and review-required records.

### Phase 5: Mission Control Planning

Generate Market Evidence missions and Research Mission handoffs.

### Phase 6: Building Profile Pipeline

Use evidence quality to prioritize Building Profile migration.

### Phase 7: Compass Explainability

Allow Location Briefs to cite approved evidence as supporting examples while preserving recommendation-ranking ownership.

### Phase 8: Field Mode Alignment

Connect Field Mode photography coverage to approved evidence records as Experience Readiness.

## Guardrails

Do not use Commercial Market Evidence to:

- fabricate property facts
- imply current tenancy
- claim availability, rent, vacancy, or lease terms
- claim permitted use without source support
- replace broker or due-diligence validation
- expose internal taxonomy IDs publicly
- force recommendation ranking changes
- bulk-add generic buildings
- reward quantity over explanatory value

Commercial Market Evidence should make Rofo more credible because the examples are selected, sourced, and useful.
