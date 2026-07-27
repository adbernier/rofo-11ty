# Editorial Operating System

EOS is Rofo's editorial operating system for commercial knowledge. Publisher remains the metro analysis and publishing-planning module, but EOS is the broader planning layer that coordinates Publisher, Compass, the Commercial Knowledge Graph, Field Mode, Search Intelligence, QA, Handbook content, and future editorial automation.

EOS exists because Rofo's commercial knowledge is no longer one workflow. A metro can have strong Publisher coverage but weak photography, strong Compass recommendations but thin Building Brief depth, or good geography with missing ecosystem balance. EOS makes those differences visible and turns them into prioritized work.

EOS implementation decisions should remain aligned with the durable Rofo product orientation in `docs/product/rofo-master-plan.md`.

Commercial Market Evidence planning decisions should remain aligned with `docs/commercial-market-evidence.md`. That architecture defines how Representative Buildings, Building Profiles, and curated commercial environments become measurable evidence without changing Publisher scoring or Compass recommendation ownership by default.

The operator-facing product name is Mission Control. EOS remains the internal architecture and generated-data model; Mission Control is the admin surface at `/admin/eos` that focuses daily work, mission review, metro health, expansion blockers, Field Mode, and archive previews.

## Vision

EOS should eventually answer three operating questions:

- How healthy is each metro's commercial knowledge?
- What should Rofo work on next?
- Can the system prepare the work, or does a human need to decide something?

Publisher answers whether a metro is ready for publishing expansion. EOS answers how the full editorial portfolio is performing, what work should happen today, what future metros should be built next, and which module should own execution.

## Architecture

EOS separates four layers:

- Collection: Publisher snapshots, Compass QA, Commercial Knowledge Graph metadata, Field Mode coverage, Handbook coverage, and future Search Console, analytics, user behavior, and broker performance signals.
- Evaluation: reusable health signals with scores, states, rationale, and source-system metadata.
- Planning: prioritized work items with automation level, effort, impact, dependencies, confidence, category, module, and measurable "why this task" explanations.
- Presentation: `/admin/eos`, a dashboard that consumes generated EOS JSON and does not perform repository analysis at request time.

The current generated artifact is:

```text
data/generated/eos-analysis.json
```

The admin route is:

```text
/admin/eos
```

The build path is:

```text
npm run publisher:snapshot
```

That command generates Publisher analysis, Publisher expansion plans, and EOS analysis from the same build-time source data.

## Health Model

Overall Editorial Health is separate from Publisher's existing score. It is an additive EOS score designed for extension.

Current signals:

- District Coverage
- Representative Building Coverage
- Commercial Ecosystem Coverage
- Photography Coverage
- Recommendation Coverage
- Editorial Coverage
- Internal Linking
- Handbook Coverage

Each signal has:

- machine-readable ID
- user-facing label
- score
- state
- note
- source system

Future signals should plug into the health model by adding a signal and a weight, not by redesigning the dashboard.

## Portfolio Model

EOS v2.2 separates active work from opportunity inventory.

- Today's Recommended Work: 5-10 highest-priority missions for existing metros.
- Opportunity Inventory: the broader measurable backlog, kept out of the homepage by default.
- Metro Health: current operating metro health across Publisher, Compass, Field Mode planning, Handbook, and Knowledge Graph signals.
- Expansion Projects: future metros managed as multi-stage projects.
- Field Mode: photography coverage summaries that link to Field Mode instead of flooding EOS with photo tasks.
- Review: returned work from future execution providers.

This keeps EOS useful as an operating system rather than a long queue report.

## Mission Bundling

EOS v2.2.4 introduces mission bundling. A mission is the recommended unit of focused engineering or editorial execution. It is generated from existing measurable opportunities, but it can include several related opportunities when they share the same metro, commercial ecosystem or product layer, source files, and validation path.

Mission bundling is conservative. EOS does not bundle unrelated metros, unrelated systems, Field Mode photography, or broad public-template changes into a knowledge-focused mission merely to reduce queue length.

Each mission contains included opportunity IDs, included task summaries, deferred tasks, objective, current constraint, expected impact, estimated effort, mission class, confidence, relevant files, dependencies, completion criteria, QA commands, and an execution packet.

Raw opportunities remain visible in Opportunity Inventory. Today's Recommended Work uses missions so the operator can answer:

```text
What is the best use of the next focused engineering session?
```

instead of:

```text
What is the smallest remaining measurable gap?
```

## Impact, Effort, and Diminishing Returns

EOS v2.2.4 uses deterministic mission classifications rather than hour estimates.

Expected Impact:

- High
- Medium
- Low

Estimated Effort:

- Small
- Medium
- Large

Confidence:

- High
- Medium
- Low

Mission Class:

- Foundation
- Readiness Blocker
- Meaningful Depth Improvement
- Refinement
- Maintenance

Impact considers whether work removes a readiness blocker, closes several related gaps, improves foundation coverage, changes ecosystem readiness evidence, or only adds presentation depth. Effort considers included opportunity count, source-file overlap, system count, public-template involvement, content weight, and QA breadth.

EOS also applies diminishing-returns awareness. A healthy metro with no readiness blocker can still show remaining work, but that work should generally move below foundation or blocker missions in weaker metros. This does not suppress refinements; it keeps them in Opportunity Inventory or lower-priority mission positions.

## Knowledge and Experience Readiness

EOS v2.2.4 adds operator-facing Knowledge Readiness and Experience Readiness labels. These are EOS interpretations generated from existing signals; they do not change Publisher scoring.

Knowledge Readiness may include Knowledge Graph coverage, ecosystem metadata, Representative Building Intelligence, Building Brief depth, recommendation QA, explainability and validation coverage, and internal-link integrity.

Experience Readiness may include Field Mode photography, handbook guidance, public-page richness, visual completeness, and editorial depth.

Photography remains visible and actionable, but it is treated as Experience Readiness and routed to Field Mode. A photography gap should not make a recommendation-ready metro appear broadly unhealthy from a knowledge perspective.

## Queue Model

EOS exposes four reusable queues:

- Editorial Queue: improvement work for existing metros, including ecosystem, representative building, Building Brief, recommendation confidence, Handbook, and internal-linking work.
- Expansion Queue: future metros as projects, not one-off tasks.
- Field Mode Queue: metro-level photography coverage summaries. Operational photo capture stays in Field Mode.
- Review Queue: work returned by future autonomous or assisted execution providers for human approval.

EOS also assigns work to operating lanes:

- Engineering: source structure, graph architecture, generated data, validation, and integration.
- Execution / Field Mode: manual field execution and future provider handoff.
- Editorial: commercial judgment, Building Profiles, handbook guidance, and public editorial depth.
- QA: deterministic validation, recommendation checks, review approval, and publishing readiness.

## Planning Model

EOS work items include:

- Priority
- Automation Level
- Estimated Effort
- Expected Editorial Impact
- Dependencies
- Confidence
- Status
- Category
- Suggested Module
- Why This Task
- Operating Lane
- Execution Packet

Work items are generated from measurable data. For example, Publisher queue items become EOS tasks; Field Mode creates Human Only photography tasks; ecosystem readiness can create Publisher ecosystem tasks; Handbook coverage can create integration tasks.

EOS v2.2 does not generate prose, modify data, execute Codex, or publish autonomous content.

## Automation Levels

EOS uses reusable automation levels:

- Autonomous: the system can eventually prepare the work without new field input, with deterministic QA before publishing.
- Review Required: the system can prepare or structure the work, but a human editor must approve judgments or evidence.
- Human Only: the work requires human capture, field review, relationship judgment, or external evidence not available to automation.

Photography naturally appears as Human Only.

## Task Lifecycle

EOS defines reusable task states so future execution providers can report progress without redesigning the planner:

- Open
- Ready
- In Progress
- Blocked
- Ready for Review
- Approved
- Completed
- Deferred
- Dismissed

The current implementation generates Open, Ready, and Blocked states from deterministic source data. Later phases can persist state transitions.

## Execution Model

Every executable mission can be opened through Commence Work. EOS does not start Codex or any other provider in v2.2. It generates a structured execution packet containing:

- objective
- reason
- current health
- current constraint
- included tasks
- deferred work
- reason for bundling
- expected impact
- estimated effort classification
- files
- dependencies
- acceptance criteria
- expected deliverables
- QA commands
- required review
- automation level
- eligible execution providers
- execution handoff

EOS v2.2.1 adds Codex Prompt Handoff to each execution packet. The packet view generates a deterministic plain-text prompt from the structured packet data, shows it in an expandable Prompt Preview, and provides a Copy Codex Prompt action that uses the browser clipboard without an API call. The prompt tells the next Codex session to read `docs/product/rofo-master-plan.md`, inspect the current repository state, verify the mission against current generated data, verify every included opportunity remains valid, preserve Publisher, Compass, EOS, Field Mode, Knowledge Graph, and editorial ownership boundaries, run `npm run publisher:snapshot`, run QA, and avoid broadening scope beyond the packet or into deferred work.

EOS v2.2.2 adds the EOS Standardized Execution Report v1 protocol. Every generated Codex prompt now ends by asking for this exact report structure:

```text
EOS Standardized Execution Report v1
Architecture Discovery
Implementation Summary
Files Changed
Results
Validation
Remaining Limitations
Recommended Next Highest-Leverage Improvement
```

This is the deterministic reporting protocol between EOS and AI execution systems. The goal is to avoid parsing arbitrary completion prose. EOS can treat the returned report as structured review evidence while still requiring human judgment before approval or publishing.

The Execution Packet view now includes Mission Debrief. A reviewer can paste an EOS Standardized Execution Report, import it, and compare the original Mission against the Execution Report. The import runs entirely in browser state. It does not write to D1, does not call an API, does not persist lifecycle state, and does not move work into the Review Queue.

Mission Debrief extracts:

- Architecture Discovery
- Implementation Summary
- Files Changed
- Results
- Validation
- Remaining Limitations
- Recommended Next Highest-Leverage Improvement
- Raw Report

Missing sections degrade gracefully as "Not provided" rather than blocking import.

Mission Review summarizes the imported evidence into:

- Implementation Completed
- Validation Status
- Outstanding Limitations
- Suggested Follow-up

The deterministic recommendation engine returns one of:

- Ready for Manual Review
- Needs Manual QA
- Needs Additional Engineering
- Needs Clarification

The recommendation is review guidance only. It does not infer publication, approve a task, update persistent status, or trigger an execution provider.

Direct Codex launching is intentionally deferred until Rofo has a supported browser-to-Codex handoff or a locally installed mechanism that can be documented and validated. The current handoff is copy-and-paste only: after copying, run a local alias such as `eoscodex` if configured, or paste the prompt into the current Codex session.

The handoff is:

```text
Engineering -> Execution / Field Mode -> QA -> Publish
```

Execution providers are intentionally abstract:

- Manual: a human uses the packet as a checklist.
- Codex: a future provider can consume the packet and return work for review.

Additional providers can be added by extending the provider enum and packet contract.

EOS v2.2 explicitly avoids generating premature subtasks. A mission expands into one execution packet, not a nested project plan.

EOS v2.2.4 preserves that rule. A bundled mission has included tasks as scope evidence, but it does not create persistent subtasks, lifecycle state, approvals, or a mission archive.

## Validation Strategy

Bundled missions reduce repeated work cycles; they do not weaken validation. The normal mission prompt includes targeted QA commands based on the included opportunities, then requires:

```bash
npm run publisher:snapshot
npm run build
git diff --check
```

Full Publisher snapshot generation remains the supported product-analysis path. Incremental Publisher analysis is not implemented in v2.2.4 because it would require broader Publisher architecture changes. Where targeted scripts exist, EOS can list them before the final full checks, but it should not skip final snapshot/build validation for completed missions.

## Expansion Workflow

Expansion metros are first-class projects. They use this stage model:

```text
Candidate
Research
Knowledge Graph
Representative Buildings
Editorial Draft
Recommendations
Compass
QA
Publishing Ready
Live
```

Each expansion project also exposes cross-functional workstreams:

- Engineering Work
- Field Work
- Editorial Work
- Publishing Readiness

This lets EOS show that a future metro requires graph/data work, field photography, editorial coverage, and QA/publishing readiness instead of treating expansion as one generic task.

For Publisher in-development metros, EOS derives the active expansion stage from existing Publisher and Compass evidence rather than from a manual stage flag. District coverage can advance a metro to Knowledge Graph, representative buildings can advance it to Representative Buildings, Building Profiles can advance it to Editorial Draft, Compass readiness and completed recommendation QA can advance it through Compass and QA, and Publisher Distribution Ready evidence can advance it to Publishing Ready. EOS does not promote an in-development metro to Live; that remains an explicit publishing decision outside the analysis model.

## Investment Score

Overall Editorial Health answers:

```text
How complete is this metro?
```

Investment Score answers:

```text
Should Rofo invest here next?
```

The v2.2 model is a planning scaffold with deterministic inputs:

- search opportunity
- editorial leverage
- build effort
- existing foundation
- automation potential
- broker coverage

Search Console, analytics, user behavior, and broker-performance systems are not connected yet. The model is structured so those signals can replace placeholders later without changing the dashboard architecture.

## Why EOS Exists Separately From Publisher

Publisher is a module. It evaluates metro publishing readiness, editorial coverage, ecosystem readiness, and expansion plans.

EOS is the operating system above the modules. It can combine Publisher with:

- Compass recommendation confidence
- Field Mode photography coverage
- Commercial Knowledge Graph gaps
- Handbook integration
- Search Intelligence
- QA
- future analytics and Search Console signals
- future broker or lead performance signals

Keeping EOS separate prevents Publisher's score from becoming an opaque blended number and lets Rofo add new planning signals without rewriting Publisher.

## Dashboard

`/admin/eos` is the editorial homepage. It shows:

- Today's Recommended Work
- metro health cards
- Publisher confidence
- commercial ecosystem coverage
- recommendation coverage
- representative building coverage
- photography coverage
- editorial coverage
- internal linking
- handbook coverage
- status labels
- separated portfolio queues
- expansion projects
- Field Mode summaries
- review queue
- execution handoff
- mission bundling
- Knowledge Readiness and Experience Readiness
- task explanations
- automation level and suggested module

The dashboard intentionally avoids large raw tables. It uses cards, progress bars, status pills, and priority work items.

## Current Limitations

- EOS v2.2 does not connect live Field Mode D1 photo counts. Photography is modeled as a summary queue and Human Only execution domain.
- EOS v2.2 does not connect Search Console, analytics, or user behavior.
- EOS v2.2 does not alter Publisher scoring, Compass recommendations, Search Profile, or public pages.
- Handbook coverage uses an initial proxy based on public foundation and Building Brief depth.
- Autonomous generation is not implemented.
- Task lifecycle state is generated, not persisted.
- Review Queue is structurally present but remains empty until execution providers return work.
- Expansion projects use curated seed inputs and Publisher in-development metros, not external market demand feeds.

## Future Roadmap

Phase 3: Execution state and review intake

- persist task state transitions
- accept returned work from providers into Review Queue
- add approval and dismissal audit trails
- preserve Publisher, Compass, and Field Mode ownership boundaries

Phase 4: Live module signals

- connect Field Mode photo counts by metro, city, district, and building
- expose Publisher QA and ecosystem coverage as richer EOS evidence
- add Handbook coverage directly from handbook-link metadata

Phase 5: Search Intelligence

- ingest Search Console and site analytics
- identify search-demand gaps by metro, ecosystem, and archetype
- distinguish editorial importance from traffic opportunity

Phase 6: Automation planning

- convert Review Required and Autonomous candidates into Codex-ready work packets
- surface only missing editorial decisions to humans
- preserve deterministic QA gates before any publishable output

Phase 7: Assisted content production

- generate drafts only where source evidence and schema support the work
- require review for market judgment, source confidence, and public claims
- never use automation to fabricate facts

Phase 8: EOS performance loop

- compare completed work against recommendation confidence, engagement, Field Mode coverage, and broker outcomes
- refine work priorities based on measured editorial impact
