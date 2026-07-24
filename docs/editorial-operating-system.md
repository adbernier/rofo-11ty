# Editorial Operating System

EOS is Rofo's editorial operating system for commercial knowledge. Publisher remains the metro analysis and publishing-planning module, but EOS is the broader planning layer that coordinates Publisher, Compass, the Commercial Knowledge Graph, Field Mode, Search Intelligence, QA, Handbook content, and future editorial automation.

EOS exists because Rofo's commercial knowledge is no longer one workflow. A metro can have strong Publisher coverage but weak photography, strong Compass recommendations but thin Building Brief depth, or good geography with missing ecosystem balance. EOS makes those differences visible and turns them into prioritized work.

## Vision

EOS should eventually answer three operating questions:

- How healthy is each metro's commercial knowledge?
- What should Rofo work on next?
- Can the system prepare the work, or does a human need to decide something?

Publisher v1 answers whether a metro is ready for publishing expansion. EOS v1 answers how the metro is performing across the wider editorial system.

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

Work items are generated from measurable data. For example, Publisher queue items become EOS tasks; Field Mode creates Human Only photography tasks; ecosystem readiness can create Publisher ecosystem tasks; Handbook coverage can create integration tasks.

EOS v1 does not generate prose, modify data, or publish autonomous content.

## Automation Levels

EOS uses reusable automation levels:

- Autonomous: the system can eventually prepare the work without new field input, with deterministic QA before publishing.
- Review Required: the system can prepare or structure the work, but a human editor must approve judgments or evidence.
- Human Only: the work requires human capture, field review, relationship judgment, or external evidence not available to automation.

Photography naturally appears as Human Only.

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
- prioritized work queue
- task explanations
- automation level and suggested module

The dashboard intentionally avoids large raw tables. It uses cards, progress bars, status pills, and priority work items.

## Current Limitations

- EOS v1 does not connect live Field Mode D1 photo counts. Photography is modeled as a planning signal and Human Only work queue source.
- EOS v1 does not connect Search Console, analytics, or user behavior.
- EOS v1 does not alter Publisher scoring, Compass recommendations, Search Profile, or public pages.
- Handbook coverage uses an initial proxy based on public foundation and Building Brief depth.
- Autonomous generation is not implemented.

## Future Roadmap

Phase 2: Live module signals

- connect Field Mode photo counts by metro, city, district, and building
- expose Publisher QA and ecosystem coverage as richer EOS evidence
- add Handbook coverage directly from handbook-link metadata

Phase 3: Search Intelligence

- ingest Search Console and site analytics
- identify search-demand gaps by metro, ecosystem, and archetype
- distinguish editorial importance from traffic opportunity

Phase 4: Automation planning

- convert Review Required and Autonomous candidates into Codex-ready work packets
- surface only missing editorial decisions to humans
- preserve deterministic QA gates before any publishable output

Phase 5: Assisted content production

- generate drafts only where source evidence and schema support the work
- require review for market judgment, source confidence, and public claims
- never use automation to fabricate facts

Phase 6: EOS performance loop

- compare completed work against recommendation confidence, engagement, Field Mode coverage, and broker outcomes
- refine work priorities based on measured editorial impact
