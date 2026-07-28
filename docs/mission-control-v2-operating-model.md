# Mission Control v2 Operating Model

Mission Control v2 is the proposed operating model for Rofo's editorial and product planning system. This document is architectural. It does not change Publisher scoring, Mission Control runtime behavior, Commercial Market Evidence, Compass recommendations, Field Mode, or execution packets.

The purpose is to define how Rofo should organize work as the platform grows beyond Publisher-driven task queues.

## Problem

Mission Control can already identify measurable opportunities and produce bounded missions. That model works for Publisher-driven work, but it will not scale cleanly when Rofo manages thousands of potential improvements across:

- Commercial Market Evidence collections
- Building Profiles
- Representative Building Intelligence
- Field Mode photography
- Recommendation QA
- Knowledge Graph expansion
- Handbook and editorial guidance
- future search, analytics, and broker-performance signals

The operator should not start the day by scanning a long task list. Mission Control should answer:

```text
What should Rofo work on next?
```

not:

```text
What is the next individual task?
```

## Recommended Hierarchy

Mission Control v2 should organize work in progressively smaller units:

```text
Markets
Programs
Initiatives
Missions
Execution Packets
Work Items
```

This hierarchy keeps market completion separate from executable work while preserving the current mission and execution-packet architecture.

The company context still exists above the operating model: Rofo's overall objective is to build trusted commercial location intelligence market by market. The Mission Control v2 projection starts at Markets because that is the object an operator can evaluate and improve.

## Markets

Markets are the primary Mission Control v2 planning object.

Market-level planning should answer:

- what prevents this market from becoming stronger
- which Programs are healthy, partial, or missing
- which Initiative should move next
- which Mission is the best focused work session
- whether the market is improving knowledge, experience, or execution capacity

Markets are not executable. They organize Programs, Initiatives, Missions, execution packets, and hidden work items around the way Rofo actually expands.

Initial market examples:

- San Francisco
- Seattle
- Denver
- Orange County
- East Bay
- Phoenix

## Programs

Programs are long-lived product systems inside a market. They own strategy and long-term progress, but they are not executable.

Initial Programs:

- Publisher
- Commercial Market Evidence
- Building Profiles
- Photography
- Recommendation QA
- Knowledge Graph
- Field Operations, future

Programs should answer:

```text
Which product system owns this kind of progress?
```

A Program has:

- durable purpose
- owner system
- source data
- quality gates
- progress model
- active Initiatives
- strategic constraints

Programs should not expose every task. They should show the state of a product system and the Initiatives that matter.

## Initiatives

Initiatives are meaningful bodies of work inside a Program. They own progress.

An Initiative should answer:

```text
What are we trying to complete?
```

Examples:

- Commercial Market Evidence / San Francisco
- Building Profiles / Seattle
- Photography / Denver
- Recommendation QA / National
- Publisher / Seattle
- Knowledge Graph / Orange County Industrial & Flex

Initiatives are not usually one session of work. They are the portfolio container that lets Mission Control show market completion instead of raw task volume.

An Initiative should contain:

- id
- programId
- title
- market or scope
- objective
- current stage
- progress label
- progress evidence
- next mission
- remaining milestones
- constraints
- owner system
- quality gates
- source systems

## Missions

Missions remain the executable unit of work.

A Mission should answer:

```text
What is the best next focused work session for this Initiative?
```

Examples:

- Commercial Market Evidence / San Francisco / SoMa Collection
- Building Profiles / Seattle / Medical Portfolio
- Photography / Mission Bay / Streetscape Collection
- Publisher / Seattle / Medical Representative Buildings
- Recommendation QA / San Francisco / Explainability Coverage

Missions should remain bounded. They may include multiple hidden work items when those items share metro, product layer, source files, and validation paths. They should not combine unrelated markets, unrelated Programs, or unrelated ownership lanes.

A Mission should contain:

- id
- initiativeId
- title
- objective
- current constraint
- included work item ids
- deferred work item ids
- expected impact
- estimated effort class
- confidence
- mission class
- relevant files
- dependencies
- acceptance criteria
- deliverables
- QA commands
- required review
- execution packet

## Execution Packets

Execution Packets remain the interface between Mission Control and Codex or another execution provider.

Execution Packets should not become the planning model. They are a handoff format generated from Missions.

An Execution Packet should include:

- task title
- objective
- reason
- current health
- current constraint
- included work
- deferred work
- relevant files
- dependencies
- acceptance criteria
- expected deliverables
- QA commands
- required-review state
- scope constraints
- SER v1 reporting requirement

Execution Packets may contain many hidden work items. Those work items should be visible in detail views, not in the default operating surface.

## Work Items

Work Items are the smallest measurable gaps detected by Publisher, Commercial Market Evidence validation, Field Mode coverage, Compass QA, or future systems.

Examples:

- missing district ecosystem coverage
- missing representative building role
- missing Building Profile
- missing photo target
- missing Recommendation QA status
- missing Market Evidence collection

Work Items should usually remain hidden. They are evidence used to form Initiatives and Missions, not the primary object an operator manages every morning.

Work Items should still be inspectable when reviewing why a Mission exists.

## Program Definitions

### Publisher

Publisher measures metro readiness, ecosystem readiness, coverage gaps, and expansion planning signals. In Mission Control v2, Publisher should appear as a Program focused on market readiness and deterministic product analysis.

Example Initiatives:

- Publisher / Seattle
- Publisher / Denver
- Publisher / Orange County

Progress examples:

- Distribution Ready
- Ecosystem readiness
- publishing blockers
- next readiness constraint

### Commercial Market Evidence

Commercial Market Evidence owns curated evidence collections that explain why districts, ecosystems, and recommendations exist.

Example Initiatives:

- Commercial Market Evidence / San Francisco
- Commercial Market Evidence / Seattle

Progress examples:

- 1 / 18 San Francisco district collections
- validated collections
- missing collections
- deferred candidate count

Commercial Market Evidence quality should remain owned by its source data and validator. Mission Control should plan from the evidence layer only after a focused future integration sprint.

### Building Profiles

Building Profiles own public, user-facing explanations of representative commercial environments. Internally they use Building Brief architecture.

Example Initiatives:

- Building Profiles / Seattle
- Building Profiles / San Francisco Industrial & Flex

Progress examples:

- representative buildings with profiles
- profile depth
- validation-checklist coverage
- ecosystem profile breadth

### Photography

Photography owns Rofo-owned visual coverage through Field Mode.

Example Initiatives:

- Photography / San Francisco
- Photography / Denver
- Photography / Seattle

Progress examples:

- locations with hero photos
- remaining photo targets
- city, district, and building coverage

Photography should remain Experience Readiness work and should not be silently bundled into engineering missions.

### Recommendation QA

Recommendation QA owns scenario coverage and verification that Compass recommendations remain explainable and stable.

Example Initiatives:

- Recommendation QA / National
- Recommendation QA / San Francisco
- Recommendation QA / Seattle

Progress examples:

- QA status by metro
- scenario count
- last QA date
- unresolved explainability gaps

### Knowledge Graph

The Knowledge Graph owns durable commercial geography, district relationships, ecosystem metadata, fit, tradeoffs, and validation questions.

Example Initiatives:

- Knowledge Graph / Seattle Medical
- Knowledge Graph / Orange County Industrial & Flex

Progress examples:

- districts modeled
- comparison coverage
- ecosystem metadata coverage
- validation-question coverage

### Field Operations

Field Operations is a future Program for route planning, assignment, and field execution. It should not be implemented until Field Mode usage proves the operational pattern.

## Progress Model

Mission Control v2 should report progress at Initiative level rather than task level.

Useful progress examples:

```text
Commercial Market Evidence
San Francisco
1 / 18 Collections
```

```text
Building Profiles
Seattle
8 / 13 Representative Environments
```

```text
Photography
Denver
18 / 75 Locations
```

Progress should communicate market completion, not raw backlog size.

Recommended progress fields:

- unit label, such as Collections, Profiles, Locations, QA Scenarios
- completed count
- target count, when defensible
- status label
- current constraint
- next mission
- source system
- confidence

When no defensible target exists, Mission Control should use labels such as `Foundation`, `Partial`, `Developed`, or `Needs Review` instead of inventing percentages.

## Current Focus v2

Current Focus should become a portfolio view. Instead of a flat list of isolated missions, it should surface the highest-priority Mission within each active Initiative.

Example:

```text
Commercial Market Evidence
San Francisco
Next Mission: SoMa Collection
```

```text
Building Profiles
Seattle
Next Mission: Medical Portfolio
```

```text
Publisher
Seattle
Next Constraint: Medical Representative Buildings
```

The operator should understand which Programs are moving, which markets they affect, and which Mission is the best next session.

The default surface should show only a small set of active Initiatives. Raw opportunities and hidden Work Items should move into detail and inventory views.

## Market Workspace

The first Mission Control v2 workspace consumes the generated market projection directly. The home surface starts with markets and answers:

- which markets need attention
- what the single highest-leverage Mission is for each active market
- how each market is progressing across Programs

Each market workspace card shows overall market health, Knowledge Readiness, Experience Readiness, the next projected Mission, and concise Program progress. Program detail can expose executable Initiatives when EOS can resolve a bounded Mission, as with Commercial Market Evidence district collections. Execution still happens by opening the existing Mission Execution Packet. Hidden Work Items remain available only through mission detail and Opportunity Inventory.

The Market Workspace is the first UI step toward the operating model, but it does not change Publisher scoring, EOS mission generation, Commercial Market Evidence planning, Field Mode ownership, or execution packets.

## Recommended Data Model

Mission Control v2 can be introduced additively over the current EOS generated data.

Conceptual structure:

```js
{
  markets: [
    {
      id,
      label,
      status,
      overallEditorialHealth,
      knowledgeReadiness,
      experienceReadiness,
      programs: [
        {
          id,
          label,
          ownerSystem,
          purpose,
          progress,
          currentConstraint,
          nextInitiativeId,
          nextMissionId,
          initiatives: [
            {
              id,
              programId,
              title,
              marketId,
              ecosystemId,
              scope,
              objective,
              currentStage,
              progress,
              currentConstraint,
              nextMissionId,
              remainingMilestones,
              confidence,
              sourceEvidence,
              missions
            }
          ]
        }
      ]
    }
  ],
  missions: [
    {
      id,
      marketId,
      programId,
      initiativeId,
      title,
      objective,
      currentConstraint,
      includedWorkItemIds,
      deferredWorkItemIds,
      expectedImpact,
      estimatedEffort,
      missionClass,
      relevantFiles,
      dependencies,
      acceptanceCriteria,
      qaCommands,
      executionPacket
    }
  ],
  workItems: {
    hiddenByDefault,
    count,
    note
  }
}
```

This model preserves the existing Mission, Execution Packet, and SER v1 contract while moving the planning surface up one level.

The first implemented projection lives in `data/generated/eos-analysis.json` as `marketProjection` with schema version `mission-control-v2-market-projection-v1`. It is additive. It associates current missions with `marketId`, `programId`, and `initiativeId`, projects Program status from existing EOS and Publisher evidence, resolves executable Program Missions where supported, and keeps work items hidden by default.

Commercial Market Evidence uses this projection to separate operational market ownership from Publisher metro grouping. For example, San Francisco Publisher analysis can remain Bay Area-wide while East Bay districts are projected into an East Bay Market Workspace. The projection resolves district ownership before assigning Initiatives, reports ambiguous or unresolved districts, and excludes those districts from executable missions until ownership is deterministic.

## Migration Strategy

Migration should be incremental.

1. Keep the existing Mission Control data and UI stable.
2. Add Program and Initiative projections in EOS generated data without changing Publisher.
3. Map current queues to Programs:
   - Publisher ecosystem and readiness tasks -> Publisher or Knowledge Graph Initiatives
   - Building Brief missions -> Building Profiles Initiatives
   - Field Mode coverage -> Photography Initiatives
   - recommendation QA gaps -> Recommendation QA Initiatives
   - Commercial Market Evidence expansion -> Commercial Market Evidence Initiatives
4. Preserve current Missions as executable children of Initiatives.
5. Keep Work Items as hidden evidence, visible only inside Mission detail or Opportunity Inventory.
6. Redesign Current Focus around active Initiatives after the projection is deterministic.
7. Only then redesign the UI around Programs, Initiative progress, and next Missions.

This avoids a risky rewrite and lets Mission Control v2 coexist with current Publisher-driven planning while the new model stabilizes.

## Future UI Implications

Mission Control should become the central operating workspace. Publisher, Field Photos, Commercial Market Evidence, Recommendation QA, and future research tools should feel like supporting applications.

Future navigation could be organized as:

- Mission Control
- Programs
- Publisher
- Field Photos
- Market Evidence
- QA
- Archive

Mission Control home should emphasize:

- Current Focus by active Initiative
- Program health
- market completion
- next Mission
- current constraint
- review needs

It should de-emphasize:

- giant work queues
- raw numeric task lists
- implementation details
- hidden Work Items

The UI should not be redesigned until the Program and Initiative projections exist in generated data.

## Lessons Learned

The current mission model proved that Rofo can turn deterministic Publisher evidence into useful Codex execution packets. It also exposed the limits of task-first planning.

The strongest pattern is:

```text
Product evidence
Initiative progress
Next bounded Mission
Execution Packet
SER v1 Mission Debrief
Product analysis
```

The weakest pattern is:

```text
Thousands of individual gaps
Flat priority list
Operator chooses manually
```

Mission Control v2 should keep the rigor of deterministic evidence while raising the default planning object from task to Initiative.

## Next Implementation Sprint

The next implementation sprint should extend deterministic Initiative resolution beyond Commercial Market Evidence into Building Profiles where current data supports safe district, ecosystem, or portfolio grouping.

It should preserve the market-centric projection and avoid exposing every Building Brief as a top-level planning object. The first implementation should prove that current building, representative-building, and district signals can form stable portfolio Initiatives without changing Publisher scoring or execution behavior.
