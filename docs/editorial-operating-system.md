# Editorial Operating System

EOS is Rofo's editorial operating system for commercial knowledge. Publisher remains the metro analysis and publishing-planning module, but EOS is the broader planning layer that coordinates Publisher, Compass, the Commercial Knowledge Graph, Field Mode, Search Intelligence, QA, Handbook content, and future editorial automation.

EOS exists because Rofo's commercial knowledge is no longer one workflow. A metro can have strong Publisher coverage but weak photography, strong Compass recommendations but thin Building Brief depth, or good geography with missing ecosystem balance. EOS makes those differences visible and turns them into prioritized work.

EOS implementation decisions should remain aligned with the durable Rofo product orientation in `docs/product/rofo-master-plan.md`.

Commercial Market Evidence planning decisions should remain aligned with `docs/commercial-market-evidence.md`. That architecture defines how Representative Buildings, Building Profiles, and curated commercial environments become measurable evidence without changing Publisher scoring or Compass recommendation ownership by default.

Mission Control displays Commercial Market Evidence as a platform service. It consumes the generated validator summary through EOS analysis, and EOS resolves district building-evidence work into executable Program Initiatives and Missions. Publisher scoring and recommendation behavior remain unchanged.

EOS v3 Commercial Knowledge Intelligence is documented in `docs/product/eos-v3-commercial-knowledge-intelligence.md`. It adds an advisory layer that compares editor-controlled strategic markets with manual/importable Google Search Console opportunity signals, Commercial Knowledge System coverage, and Publisher readiness. It is additive and does not replace the existing strategic roadmap, Publisher scoring, or recommendation models.

Commercial Market Discovery is documented in `docs/commercial-market-discovery.md`. It adds an external-research layer that records source-supported market realities, compares them with canonical Rofo knowledge, and surfaces compact gap counts in Market Projection without promoting findings, changing recommendations, or changing Publisher scoring.

EOS discovers Commercial Market Evidence expansion opportunities by comparing Knowledge Graph district nodes with existing Market Evidence collections. Presence-based collection measurement remains intentionally simple, but the operator-facing Mission can also include selected Building Profile work when it belongs to the same district evidence workflow.

EOS follows Rofo's one-commercial-geography principle: every canonical Knowledge Graph district is eligible for recommendations, Publisher coverage, Commercial Market Evidence planning, and Mission Control market-completion tracking. EOS may prioritize districts differently by maturity and evidence, but it should not maintain a separate district class that removes canonical districts from platform coverage.

The canonical geography model is defined in `docs/commercial-geography-model.md`. EOS should treat Market as the primary planning object, Region as expansion context, and District as the default unit for Commercial Market Evidence and District Building Evidence work.

Canonical Region and Market source data now lives in `_data/commercialGeography.js`. EOS consumes that registry through `lib/geography/commercial-geography.js` and should only use Publisher metro grouping as a documented compatibility fallback, never as the primary district ownership signal.

The operator-facing product name is Mission Control. EOS remains the internal architecture and generated-data model; Mission Control is the admin surface at `/admin/eos` that focuses daily work, mission review, metro health, expansion blockers, Field Mode, and archive previews.

Mission Control v2 planning is documented in `docs/mission-control-v2-operating-model.md`. It proposes a Programs, Campaigns, Initiatives, Missions, Execution Packets, and hidden Work Items hierarchy so Mission Control can scale from task prioritization into Rofo's broader operating system without first redesigning the UI.

Portfolio Resolver architecture is documented in `docs/eos-portfolio-resolver.md`. Resolvers sit between Publisher constraints and EOS mission generation so Mission Control can execute coherent portfolios rather than record-level tasks.

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

Commercial Market Evidence is exposed through the generated `platformServices.commercialMarketEvidence` summary. The summary is produced by Publisher snapshot generation from the Market Evidence validator, then displayed by Mission Control as platform health only.

Commercial Market Evidence expansion planning is exposed through `platformServices.commercialMarketEvidence.expansion`. EOS owns this discovery layer because it is portfolio planning, while Commercial Market Evidence continues to own source data and validation.

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
- Commercial Market Evidence Expansion: collection coverage, suggested expansion order, and executable District Building Evidence Missions for eligible districts.

This keeps EOS useful as an operating system rather than a long queue report.

## Market-Centric Projection

Mission Control v2 introduces an additive market-centric projection in `data/generated/eos-analysis.json`.

The projection organizes existing EOS evidence as:

```text
Markets
Programs
Campaigns
Initiatives
Missions
Execution Packets
Work Items
```

Markets are the primary planning object because Rofo is built market by market. Programs sit inside each market and represent durable product systems: Publisher, Commercial Market Evidence, Building Profiles, Photography, Recommendation QA, Knowledge Graph, and Commercial Market Discovery. Campaigns are the market-completion progress objects inside each Program. Initiatives represent meaningful milestones inside a Campaign. Missions remain the executable unit and continue to generate the same execution packets. Work items remain hidden evidence used to explain why missions exist.

This projection is additive. It does not change Publisher scoring, mission generation, execution behavior, SER v1, Field Mode, Compass, recommendations, or the current Mission Control UI. It is the future data model for Mission Control v2.

EOS owns the projection. Publisher still determines readiness and constraints. Commercial Market Evidence owns collections and validation. Building Profiles own public building content. Field Mode owns photography. Mission Control will render the projection in a future UI sprint.

## Mission Control Market Workspace

Mission Control consumes `marketProjection` as its primary workspace. The home experience starts with markets rather than a flat mission list. Each market card exposes:

- overall status and health
- Knowledge Readiness and Experience Readiness
- the single highest-priority projected Mission for that market
- active Program progress for Publisher, Commercial Market Evidence, Building Profiles, Photography, Recommendation QA, Knowledge Graph, and Commercial Market Discovery

Selecting a Mission still opens the existing Execution Packet. Selecting a market opens a market workspace detail with Program and Initiative context before raw opportunity inventory. Publisher remains the analysis engine, EOS remains the planning engine, and Mission Control remains the operating workspace that consumes generated EOS data.

Commercial Market Evidence Initiatives are resolved from existing collections and missing Knowledge Graph districts. EOS assigns each district to one operational market before generating Initiatives. Operational market ownership is distinct from Publisher metro grouping: a district may be backed by San Francisco Publisher analysis while belonging to the East Bay, Peninsula, or South Bay Market Workspace. Comparison and adjacency relationships never assign ownership.

Commercial Market Evidence Campaign progress is calculated as completed collections divided by canonical commercial districts assigned to the operational market. For example, San Francisco completion must count Financial District, Jackson Square, Mission Bay, SoMa, Dogpatch, Design District, Showplace Square, South Beach, Potrero Hill, and Mission District once those nodes are canonical in the Knowledge Graph.

Completed collections, such as the Financial District pilot, remain completion evidence for the Commercial Market Evidence component. If selected evidence buildings still lack adequate Building Profiles, EOS can generate a catch-up District Building Evidence Mission that validates the existing collection and completes the remaining selected profiles. If both the collection and selected evidence profiles are complete, the district remains non-executable completion evidence.

For future missing districts, EOS generates one District Building Evidence Mission that creates the Commercial Market Evidence collection and completes the required selected Building Profiles in the same execution packet. Individual evidence records, district narrative, research, source selection, validator fixes, Building Profile work, and documentation updates remain hidden Work Items inside the Mission packet.

District-to-market resolution follows a deterministic order: explicit district ownership if present, existing Commercial Market Evidence collection metadata, canonical public city/state ownership, then Publisher metro fallback only when no stronger ownership signal exists. Ambiguous or unresolved districts are reported in generated EOS analysis and do not produce executable Commercial Market Evidence missions until ownership is clarified.

Building Profile tasks remain compatible with the legacy Opportunity Inventory, but EOS now prefers district building-evidence Missions when Building Profile work is selected evidence for an existing or missing Commercial Market Evidence district. Remaining Building Profile portfolios continue to use portfolio Missions when existing Publisher work items share market, source files, and validation paths. Smaller raw tasks remain as fallback.

## Campaigns and Throughput Optimization

EOS Mission Bundling v2 adds Campaigns as the progress object between Programs and Initiatives:

```text
Market
Program
Campaign
Initiative
Mission
Execution Packet
Work Items
```

Campaigns answer:

```text
What market-completion body of work is this Program advancing?
```

Campaigns are never executed directly. They own progress, constraints, sizing strategy, and the list of Missions that advance the Program. Mission Control renders Campaign progress so operators see market completion rather than a raw inventory of small gaps.

EOS optimizes editorial throughput by asking:

```text
What is the largest coherent body of work that can be completed confidently in one execution packet while remaining reviewable in one SER?
```

Mission sizing remains deterministic:

- Small: roughly 30-60 minutes, usually one to three hidden Work Items.
- Standard: roughly 60-120 minutes, usually a bounded collection or scenario set.
- Large: roughly 2-4 hours and the upper bound for one reviewable SER.

Large Missions must not become mega missions. Larger bodies of work stay at Campaign level and advance through several Missions.

Program bundling posture:

- Publisher: keep current readiness and ecosystem bundling where gaps share metro, ecosystem, source files, and validation.
- Commercial Market Evidence: keep one district collection as the evidence unit, but execute it with selected Building Profiles through a District Building Evidence Mission when both work types remain.
- Building Profiles: prefer district building-evidence Missions for selected CME evidence buildings; otherwise increase bundling into portfolio Missions when representative buildings or Building Briefs share market, product layer, source files, and QA.
- Photography: represent Campaign progress only; photo targets remain Field Mode work and are not silently bundled into editorial missions.
- Recommendation QA: bundle coherent scenario/status sets where they share a market validation path.
- Knowledge Graph: bundle geography, comparison, and internal-link work only when source and validation overlap.

## Portfolio Resolvers

EOS Portfolio Resolver v1 formalizes the layer between Publisher work items and Mission generation.

```text
Publisher
Portfolio Resolver
EOS Mission Queue
Mission Control
Execution Packet
```

Publisher identifies constraints. Portfolio Resolvers determine the largest coherent, reviewable unit of work. EOS converts resolved portfolios into Missions, Campaign progress, Initiatives, and Execution Packets.

The first production resolver is `building-profile-portfolio-resolver-v1`. It groups eligible Building Brief work into Building Profile portfolios using canonical market, district, ecosystem, source-path, and validation-path evidence. A resolved portfolio creates one Building Profiles Mission with hidden building Work Items. Individual Building Brief tasks remain in Opportunity Inventory as fallback, but resolved building Work Items are reserved out of generic mission bundling so Mission Control does not offer duplicate primary execution paths.

`district-building-evidence-resolver-v1` is the preferred path for district building work that spans Commercial Market Evidence and selected Building Profiles. It keeps CME source data, Building Profile content, and Publisher measurements separate, while generating one district Mission and one Execution Packet. Existing CME collections are not regenerated unless validation identifies a real issue; the Mission can focus on profile catch-up and validation. Missing districts receive one unified packet for collection creation, representative evidence selection, profile completion, validation, snapshot regeneration, and SER v1.

Generated resolver output lives in:

```text
data/generated/eos-analysis.json
portfolioResolution
```

Cloudflare admin routes consume this generated JSON only; they do not resolve portfolios at request time.

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
