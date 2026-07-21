# Rofo Publisher

Rofo Publisher is the internal coverage and production-planning system for metro expansion.

Publisher v1 does not generate content, publish pages, call external AI services, create branches, or open pull requests. It inspects the repository, measures current coverage, identifies gaps, and produces a deterministic work queue.

## Purpose

Publisher answers one operational question:

What remains to make this metro commercially useful, editorially credible, and ready for broader distribution?

It exists to connect the Commercial Location Graph, public city and district pages, representative buildings, Building Briefs, recommendation QA, and editorial standards into one measurable production view.

## Data Sources

Publisher v1 reads:

- `_data/locationKnowledgeGraph.js`
- `_data/recommendationQaStatus.js`
- `_data/cities.js`
- `_data/neighborhoodPages.js`
- `_data/buildingPages.js`
- `_data/locationComparisonPages.js`
- `_data/commercialBuildingComparisons.js`
- `data/publisher-rules.js`
- `docs/editorial-style-guide.md`
- `docs/building-page-standard.md`
- recommendation QA documentation under `docs/recommendation-qa/`

Publisher does not create a second source of truth for editorial content. The rules file only defines deterministic thresholds, metro grouping, scoring weights, and phrases that can be checked safely.

## Metro Discovery

Publisher starts with the configured metro groups in `data/publisher-rules.js` because the repository stores cities and location nodes at a city level while Publisher evaluates metro completeness.

It also includes any additional metro found in `_data/recommendationQaStatus.js` that is not already configured. Those discovered metros are analyzed, but they may need explicit city grouping before their coverage is meaningful.

San Francisco is grouped as the Bay Area Compass-ready metro for current product purposes, while the admin-facing Publisher label remains San Francisco because it is the editorial benchmark.

## Coverage Categories

### Metro Foundation

Checks for:

- canonical primary city
- public city page
- Commercial Location Graph support
- Compass Ready designation
- recommendation QA documentation

### District Coverage

Checks each district node for:

- public district page
- substantive editorial description
- structured commercial qualities
- decision-oriented best-fit and tradeoff fields

A district name alone does not count as mature coverage.

### Comparison Graph

Checks:

- comparison relationship count
- districts with at least one comparison
- districts meeting the v1 minimum comparison threshold
- orphan districts
- unresolved comparison targets
- one-way relationships that may need reciprocal review

The v1 threshold is intentionally conservative and configurable.

### Representative Buildings

Checks:

- representative building relationships
- districts with at least one representative building
- districts meeting the v1 representative-building target
- unresolved building paths
- representative records without public URLs

Representative buildings are measured as editorial examples, not listing inventory.

### Building Briefs

Checks:

- representative building records with `building_brief`
- representative building records without `building_brief`
- missing major Building Brief fields
- whether existing briefs have decision alternatives
- deterministic style-guide issues where safely detectable

A representative building without a Building Brief is treated as a migration opportunity, not a broken page.

### Recommendation Readiness

Checks:

- Compass Ready status
- QA scenario count
- last QA date
- QA report path
- district nodes with explainability fields

Publisher does not infer successful QA from the existence of graph nodes.

### Editorial Quality

Runs deterministic checks for:

- placeholder values such as `N/A`, `undefined`, or `[object Object]`
- known avoid phrases from the Editorial Style Guide
- invented labels that should not appear in published content

Publisher v1 does not produce subjective editorial scores. Human review remains required.

### Internal Linking

Checks resolvable repository links for:

- city pages
- district pages
- representative building links
- comparison references
- building comparison paths

Broken references become queue items.

## Calibrated Scoring Model

Publisher does not treat metro completeness as a single unconstrained percentage. A metro can be strong in recommendations and weak in public editorial coverage, or editorially rich while still missing formal recommendation QA. Publisher therefore reports three primary dimension scores.

### Compass Readiness

Measures whether Rofo can make credible location recommendations.

Inputs include:

- district or location-node coverage
- comparison graph completeness
- recommendation QA status
- QA scenario count
- explainability fields
- validation-question coverage
- unresolved recommendation or graph issues

Building Brief depth does not drive Compass Readiness. A metro can be Compass Ready while still editorially shallow.

### Editorial Coverage

Measures public commercial-location content depth.

Inputs include:

- substantive district descriptions
- structured district qualities
- decision-oriented positioning
- representative-building coverage
- staged Building Brief coverage
- deterministic Editorial Style Guide checks

Representative buildings and Building Briefs are staged content layers. Publisher does not require every representative building to have a Building Brief, but it does require an initial curated collection before a metro can be considered Editorially Developed.

### Publishing Readiness

Measures whether the current public experience is coherent and operationally ready.

Inputs include:

- canonical city page
- public district pages
- internal linking
- resolvable building and comparison paths
- recommendation QA authority
- critical broken-reference checks

Publishing Readiness is about public route integrity and release confidence, not content volume alone.

## Overall Formula

The Overall Publisher Score is secondary and is derived from the three dimensions:

- Compass Readiness: 40%
- Editorial Coverage: 35%
- Publishing Readiness: 25%

Whole percentages are used. The raw score may be capped when an essential layer is missing.

## Caps

Current score caps:

- Missing authoritative recommendation QA caps Compass Readiness and Publishing Readiness.
- A metro with priority districts and zero representative buildings caps Editorial Coverage and Overall Publisher Score.
- A metro with representative buildings but zero Building Briefs caps Editorial Coverage and Overall Publisher Score.
- Critical broken references cap Overall Publisher Score.
- A metro without passed Compass QA caps Overall Publisher Score.

Caps are shown in `/admin/publisher` and in `docs/publisher/metro-coverage-report.md`.

## Readiness Gates

Publisher separates several concepts:

- Compass Ready means recommendation QA indicates the metro can support credible Location Brief output.
- Editorial completeness means the public market experience has enough district, building, comparison, and style-guide maturity to feel commercially useful.
- Distribution readiness means the metro has passed the important graph, content, recommendation, and linking gates needed for broader rollout.

## Readiness Gates

Current readiness labels:

- In Development
- Compass Ready
- Expansion Ready
- Editorially Developed
- Distribution Ready

Definitions:

- In Development: missing a core recommendation or public foundation.
- Compass Ready: recommendation QA indicates the metro can support credible Location Brief output.
- Expansion Ready: Compass Ready, public foundation exists, and no severe graph or route issues block systematic editorial expansion.
- Editorially Developed: district editorial coverage is strong, representative buildings exist, an initial Building Brief collection exists, and deterministic editorial checks pass.
- Distribution Ready: Compass Ready, Editorially Developed, Publishing Readiness above threshold, recommendation QA passed, and no critical Publisher blockers remain.

Compass Ready is necessary but not sufficient for Distribution Ready. Editorially Developed can identify a rich public content layer even when formal recommendation QA still needs verification.

## Compass Readiness Source Precedence

Machine-readable recommendation QA status in `_data/recommendationQaStatus.js` is the authoritative source when present.

Precedence:

1. `_data/recommendationQaStatus.js`
2. explicit Publisher metro grouping only for deciding which cities belong to a metro
3. admin labels and documentation as supporting context only

Admin pages should not maintain stale readiness labels when QA status has changed. Publisher surfaces missing QA separately from failed or incomplete QA:

- Missing QA means no authoritative row was found.
- Failed or incomplete QA means a row exists but does not indicate Compass Ready.
- Passed QA means `qaStatus` is completed and `validationStatus` indicates `compass_ready` or `pilot_passed`.

San Francisco currently predates the QA-status convention in the machine-readable data. Publisher treats its recommendation status as pending verification rather than fabricating a pass.

## Task Priority

The work queue is sorted by product impact:

1. Issues blocking Compass Ready
2. Failed or missing recommendation QA
3. Critical broken references or graph errors
4. Missing public district foundations
5. Missing representative-building coverage
6. Initial Building Brief migration batch
7. Individual Building Brief migration opportunities
8. Editorial polish and enrichment

Each task includes:

- metro
- category
- task type
- item name
- severity
- reason
- source identifier
- public or admin URL when available
- suggested next action
- future automation candidate flag

The recommended next action for each metro is derived from the highest-priority queue item. When a metro has representative buildings but no Building Briefs, Publisher adds a scoped batch task for an initial Building Brief collection instead of making dozens of individual missing-brief tasks the only visible next step.

## Admin Routes

The main route is:

`/admin/publisher`

Supported query parameters:

- `metro`
- `category`
- `priority`
- `automation`
- `token`

The route follows existing admin authentication conventions and requires `ADMIN_DASHBOARD_TOKEN`.

## Build-Time Snapshot

Publisher repository analysis runs at build time, not inside the Cloudflare Pages Function.

The analyzer imports Eleventy `_data` modules that are allowed to use Node APIs such as `fs` and `path`. Cloudflare Workers should not bundle that repository-analysis graph into `/functions/admin/publisher.js`.

The build creates:

`data/generated/publisher-analysis.json`

`data/generated/publisher-expansion-plans.json`

Generate it directly with:

```bash
npm run publisher:snapshot
```

The snapshot contains:

- `schemaVersion`
- deterministic generation metadata derived from the current git commit when available
- the complete Publisher analysis used by the admin route
- dimension scores, overall scores, readiness states, blockers, queues, recommended actions, and supporting counts

The expansion-plan snapshot contains metro planning objects, priority gaps, recommended sprint plans, expansion-mode variants, and Codex prompt exports. It is generated from the same Publisher analysis and does not run separate coverage calculations.

`/admin/publisher` consumes the generated snapshot and Worker-safe rendering helpers only. If the snapshot is missing or malformed, the route renders a clear admin error state instead of fabricating empty Publisher results.

The normal build runs snapshot generation before Eleventy:

```bash
npm run build
```

This keeps Publisher output fresh at deployment time while preventing request-time repository filesystem analysis in Cloudflare Pages Functions.

## Report Generation

The optional repository report uses the same analysis layer:

```bash
npm run publisher:report
```

It writes:

`docs/publisher/metro-coverage-report.md`

The report is generated output. Do not maintain separate calculations in documentation.

## Adjusting Rules

Edit `data/publisher-rules.js` to adjust:

- metro grouping
- category weights
- dimension weights
- severity weights
- district comparison thresholds
- representative-building targets
- staged Building Brief targets
- score caps
- required Building Brief fields
- deterministic avoid phrases

Do not copy the full Editorial Style Guide into rules. Only encode checks that can be evaluated deterministically.

## Metro Expansion Planner

Publisher includes a deterministic planning layer documented in `docs/publisher-metro-expansion-planner.md`.

The planner answers:

- what is already published
- what is incomplete
- which districts should be improved first
- which representative buildings or Building Briefs are missing
- which recommendation relationships are weak
- what the next editorial sprint should contain

The planner supports four modes:

- Balanced Expansion
- Recommendation Readiness
- Editorial Depth
- Building Depth

Modes rebalance priority scoring; they do not bypass prerequisites or quality gates. The planner never publishes content automatically and never fabricates districts, buildings, comparison relationships, or availability claims.

## Known Limitations

- Publisher v1 cannot judge whether prose is genuinely good.
- Metro grouping still needs configuration because source data is city-based.
- It can detect some broken references, but it does not crawl the generated site.
- It does not verify live admin rendering without a deployed or local Pages Functions runtime.
- It does not measure current availability.
- It does not distinguish every possible district importance level.
- It surfaces stale readiness inconsistencies but does not rewrite existing admin constants.

## Future Automation Roadmap

Publisher v2 can add:

- draft Building Brief generation
- district-summary draft generation
- AI editorial QA
- geography QA
- saved production queues
- branch creation
- pull request creation
- scheduled overnight report generation
- richer readiness history

Future automation should consume Publisher queue items rather than inventing separate task logic.
