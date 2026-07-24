# Editorial Operating System

EOS is Rofo's editorial operating system for commercial knowledge. Publisher remains the metro analysis and publishing-planning module, but EOS is the broader planning layer that coordinates Publisher, Compass, the Commercial Knowledge Graph, Field Mode, Search Intelligence, QA, Handbook content, and future editorial automation.

EOS exists because Rofo's commercial knowledge is no longer one workflow. A metro can have strong Publisher coverage but weak photography, strong Compass recommendations but thin Building Brief depth, or good geography with missing ecosystem balance. EOS makes those differences visible and turns them into prioritized work.

EOS implementation decisions should remain aligned with the durable Rofo product orientation in `docs/product/rofo-master-plan.md`.

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

- Today's Recommended Work: 5-10 highest-priority active editorial items for existing metros.
- Opportunity Inventory: the broader measurable backlog, kept out of the homepage by default.
- Metro Health: current operating metro health across Publisher, Compass, Field Mode planning, Handbook, and Knowledge Graph signals.
- Expansion Projects: future metros managed as multi-stage projects.
- Field Mode: photography coverage summaries that link to Field Mode instead of flooding EOS with photo tasks.
- Review: returned work from future execution providers.

This keeps EOS useful as an operating system rather than a long queue report.

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

Every executable task can be opened through Commence Work. EOS does not start Codex or any other provider in v2.2. It generates a structured execution packet containing:

- objective
- reason
- current health
- files
- dependencies
- acceptance criteria
- expected deliverables
- QA commands
- required review
- automation level
- eligible execution providers
- execution handoff

The handoff is:

```text
Engineering -> Execution / Field Mode -> QA -> Publish
```

Execution providers are intentionally abstract:

- Manual: a human uses the packet as a checklist.
- Codex: a future provider can consume the packet and return work for review.

Additional providers can be added by extending the provider enum and packet contract.

EOS v2.2 explicitly avoids generating premature subtasks. A task expands into one execution packet, not a nested project plan.

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
