# Publisher Metro Expansion Planner

Rofo Publisher Metro Expansion Planner turns Publisher coverage analysis into deterministic editorial sprint plans. It does not write production content, create commits, call external AI services, or publish pages.

The planning workflow is:

Select Metro -> Review Coverage -> Identify Gaps -> Prioritize Work -> Generate Editorial Sprint Plan -> Implement manually or with Codex -> Re-run Publisher QA.

## Architecture

Publisher still has one analysis source:

`lib/publisher/analyze-metros.js`

The planner consumes that generated analysis through:

`lib/publisher/expansion-planner.js`

The normal build runs:

```bash
npm run publisher:snapshot
```

That command writes:

- `data/generated/publisher-analysis.json`
- `data/generated/publisher-expansion-plans.json`

The admin route `/admin/publisher` imports those generated JSON files only. It does not import Eleventy `_data` modules or perform repository filesystem analysis at request time.

## Planning Model

Each metro plan includes:

- current readiness state and dimension scores
- coverage status for cities, districts, recommendation nodes, comparisons, representative buildings, Building Briefs, insights, and handbook/internal links
- deterministic gaps derived from Publisher queue items
- priority scores for each gap
- dependency metadata
- recommended sprint plans by mode
- a default Balanced Expansion sprint
- gate blockers and warnings

The generated output is intended for admin rendering, QA, future Codex prompts, and future assisted drafting tools.

## Gap Taxonomy

Publisher classifies gaps into six planning categories:

- Geography gaps: missing or thin district foundations, unpublished districts, incomplete commercial identity, incomplete district relationships.
- Recommendation gaps: missing QA, weak explainability, missing validation questions, insufficient recommendation relationships.
- Comparison gaps: orphan comparisons, unresolved comparison targets, one-way relationships, weak cross-district teaching relationships.
- Representative-building gaps: uncovered districts, unresolved representative building URLs, missing canonical records, missing Building Briefs, insufficient recommendation-card eligibility.
- Editorial gaps: style-guide warnings, missing decision guidance, thin workplace or industry context, weak related insights.
- Technical / publishing gaps: broken canonical routes, unresolved internal references, missing city pages, QA blockers.

The planner does not invent district names, building names, or comparison relationships. When evidence is insufficient, the gap is labeled `Research required` or `Blocked`.

## Priority Formula

Each gap receives 1-5 factor scores:

- User Value
- Recommendation Impact
- Coverage Unlock
- SEO Value
- Estimated Effort
- Dependency Risk

The default formula is:

```text
Priority Score =
weighted(User Value + Recommendation Impact + Coverage Unlock + SEO Value)
- weighted(Estimated Effort + Dependency Risk)
+ Severity Bonus
```

Scores are whole-number planning aids, not false precision. They are used to sort work, not to publish anything automatically.

## Expansion Modes

The planner generates a sprint for each mode:

- Balanced Expansion: default mix of user value, recommendation impact, SEO value, and unlock potential.
- Recommendation Readiness: emphasizes graph, explainability, comparison, and QA gaps.
- Editorial Depth: emphasizes city and district guidance, content usefulness, and style quality.
- Building Depth: emphasizes representative buildings, Building Brief migration, and building-card eligibility.

Modes rebalance priority weights. They do not bypass dependency rules or quality gates.

## Dependencies

Every gap may include:

- `blockedBy`
- `unlocks`
- `prerequisite`
- `followUp`

Examples:

- A Building Brief requires a canonical representative building record and district association.
- Representative-building coverage requires district commercial identity.
- Comparison content requires district identity.
- Recommendation QA depends on graph and explainability coverage.
- Mature representative-building coverage unlocks recommendation-page building modules.

The planner should not recommend advanced Building Brief work when the canonical building record or district association is missing.

## Confidence States

Planner tasks use four confidence states:

- Ready: the repository already identifies the affected record and missing field or migration need.
- Review recommended: the gap is deterministic, but editorial judgment should confirm the change.
- Research required: the repository identifies the need but lacks enough evidence to name exact buildings or relationships.
- Blocked: a prerequisite, invalid reference, or QA gate must be resolved first.

## Recommended Sprint

Each metro receives a constrained sprint with:

- title
- objective
- rationale
- exact named districts, buildings, or relationships where known
- data tasks
- content tasks
- QA tasks
- expected impact
- dependencies
- explicit exclusions

Sprint sizing is intentionally bounded. The planner prefers a useful editorial batch over exhaustive task dumping.

Typical limits:

- 3-5 district improvements
- 8-15 representative-building or Building Brief tasks
- 3-6 comparison relationships
- 4-8 recommendation calibration tasks

## Admin Workflow

Open:

`/admin/publisher`

Select a metro to review:

- dimension scores
- gate blockers
- recommended next sprint
- priority gaps
- coverage matrix
- detailed work queue

The planning mode selector can switch the sprint among Balanced Expansion, Recommendation Readiness, Editorial Depth, and Building Depth.

## Codex Prompt Export

The metro detail page includes a `Codex sprint prompt export` block. It is plain text and reviewable before use.

The prompt includes:

- metro
- objective
- exact scope
- named districts, buildings, and comparisons where known
- data requirements
- QA requirements
- exclusions
- deliverables

Publisher does not automatically run Codex or modify files.

## QA

Run:

```bash
node scripts/qa-publisher-expansion-planner.js
```

The QA checks:

- deterministic output against the current Publisher analysis snapshot
- valid metro lineage
- gap-to-queue mapping
- duplicate sprint tasks
- broken canonical building references
- completed Building Briefs recommended again
- unmet prerequisites without `Blocked` state
- missing sprint objectives
- missing QA tasks
- placeholder output such as `undefined`, `N/A`, or `[object Object]`

Expected warnings may include thin metros that lack enough data for a detailed sprint.

## Operational Sprint Pattern

Publisher plans are intended to drive bounded editorial implementation, not automatic completion of every gap. The Sacramento representative-building sprint is the first operational test:

1. Review the generated metro plan in `data/generated/publisher-expansion-plans.json`.
2. Use the highest-priority gaps as the default scope.
3. Select only repository-supported districts and canonical building paths.
4. Document any narrowed scope or blocked recommendation in a metro sprint note.
5. Run metro-specific QA, regenerate Publisher snapshots, and confirm completed tasks disappear from the recommended sprint.

If a generated plan does not name exact buildings, the implementation should either use existing repository evidence or mark the building work as research required. Do not invent building examples to satisfy a Publisher gap.

## Known Limitations

- Dedicated insight inventory and handbook-link relevance are not yet first-class Publisher categories. Planner v1 uses editorial quality and internal-linking signals as proxies.
- Representative-building variety is inferred from existing Publisher queue and Building Brief status, not from a subjective editor review.
- Expected score improvement is directional and count-based; it does not simulate a future Publisher score.
- Planner v1 does not generate draft content.

## Future Phases

Phase 2: Assisted drafting

Generate structured draft records for missing district, comparison, or building fields after explicit user instruction.

Phase 3: Editorial review queue

Approve, edit, reject, or defer generated drafts.

Phase 4: Controlled file generation

Generate repository-ready data changes only after explicit approval.

Phase 5: Publish and monitor

Run QA, publish, and track coverage improvements against Publisher metrics.
