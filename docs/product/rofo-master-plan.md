# Rofo Master Plan

This document is the durable product and architecture orientation for future Rofo planning, ChatGPT, and Codex sessions. It should be read as strategic direction, not as a detailed implementation specification. When implementation details conflict, use the repository code, generated data, and focused system documentation as the source of truth.

## Vision and Mission

Rofo exists to help businesses make better commercial location decisions.

Finding available commercial space is only one part of the problem. The harder question is where a business should be. Rofo helps a business understand which city, district, commercial ecosystem, and representative environment may fit its operating needs before it spends time on the wrong spaces.

The long-term vision is for Rofo to become the trusted advisor for commercial location decisions. The Commercial Location Knowledge Graph powers those decisions. The Location Brief documents them. The editorial and broker workflows improve them over time.

## Product Promise

Rofo gives a business an intelligent starting point for its commercial real estate search.

The product should help a user understand:

- which locations belong in the search
- why those locations fit
- what tradeoffs matter
- which alternatives should be compared
- what questions should be validated before touring or negotiating
- when a broker or live market investigation is needed

Rofo should not pretend to replace availability research, zoning review, due diligence, or broker judgment.

## Product Principles

- Location intelligence is the product. Listings are supporting evidence, not the center of the experience.
- Recommendations should be explainable. The system should be able to say why a location was suggested.
- The Location Brief is the canonical user-facing object.
- The Search Profile should stay short. Rofo should infer and explain as much as it responsibly can from structured knowledge.
- Commercial geography matters. A district is useful only when it reflects real tenant decision patterns.
- Tradeoffs are a feature, not a weakness. Good advice helps users compare.
- Public copy should sound like an experienced commercial advisor, not a listing flyer or internal data model.
- Automation may prepare work, but evidence and QA decide whether it is usable.

## What Rofo Is

Rofo is:

- a commercial location intelligence product
- an editorial commercial-location guide
- a Location Brief platform
- a graph-backed recommendation system
- a planning and publishing system for commercial knowledge
- a future broker handoff platform built around structured Location Briefs

## What Rofo Is Not

Rofo is not:

- a generic listing portal
- a brokerage marketing site
- a landlord flyer system
- a black-box recommendation engine
- a replacement for current market investigation
- a system that treats historical inventory as proof of commercial importance
- a content farm or autonomous publishing system without human review and QA

## Core User Journey

The core journey is:

```text
Search Profile
Recommendations
Location Brief
Expert Review
Broker Engagement
```

The Search Profile captures only the information needed to start. The recommendation experience gives the user a market path. The Location Brief grows into the durable decision object that can be saved, shared, reviewed, and handed to a broker.

Recommendations are not the final product. They are one section of the Location Brief.

## Major Product Systems

### Rofo Compass

Compass is the Commercial Location Intelligence Engine. It combines the Commercial Location Knowledge Graph, Recommendation Resolver, Explainability Layer, Location Brief generation, and Recommendation QA.

Compass should answer:

```text
Where should this business begin its commercial real estate search, and why?
```

Compass should never feel like a black box. The recommendation resolver should query authored commercial judgment and return explainable market paths, not public numeric scores.

### Commercial Location Knowledge Graph

The Knowledge Graph stores durable commercial-location knowledge: how cities and districts behave for different business uses, what tradeoffs matter, and which nearby markets should be compared.

It is not a listings feed, scoring model, or AI system. It stores reasons.

### Publisher

Publisher is the deterministic coverage and production-planning system for metro readiness. It inspects repository data, measures coverage, identifies gaps, and produces work queues and expansion plans.

Publisher does not generate content, publish pages, call external AI services, create branches, or open pull requests.

Publisher remains responsible for metro analysis and publishing-planning signals. EOS uses Publisher output, but Publisher scoring remains its own model.

### Editorial Operating System

EOS is the operating layer above Publisher, Compass, Field Mode, Knowledge Graph, QA, Handbook, Search Intelligence, and future automation.

EOS answers:

- How healthy are Rofo's metros?
- What should Rofo work on today?
- What future markets should be built next?
- Which module should own execution?
- Can the work be prepared by a system, or does a human need to decide something?

EOS coordinates work. It does not replace the systems that produce the work.

EOS should recommend coherent missions, not only the smallest measurable tasks. A mission is the best next focused engineering or editorial session, generated from related opportunities that share a metro, ecosystem or product layer, source files, and validation path. Raw opportunities remain visible, but daily work should avoid unnecessary cycles of prompt, snapshot, QA, build, report, review, commit, and push when several safe related gaps can be handled together.

EOS should also distinguish knowledge readiness from experience readiness. Knowledge readiness reflects the Commercial Knowledge Graph, ecosystem metadata, Representative Building Intelligence, Building Profiles, recommendation QA, explainability, and validation coverage. Experience readiness reflects photography, handbook guidance, visual completeness, and public-page richness. Photography remains visible and important, but it belongs to Field Mode and should not obscure whether a metro's underlying commercial knowledge and recommendations are ready.

### Field Mode

Field Mode is Rofo's Rofo-owned photography workflow. It lets an admin upload city, district, and Building Profile photos from a phone without resizing images, using Git, or rebuilding the site.

Photography is human-only work in EOS. Field Mode remains the operational workspace.

### Building Profiles

Building pages use the internal Building Brief architecture, but the public product is a Building Profile. A Building Profile uses a building as an example of a commercial environment.

It should answer:

- what type of environment the building explains
- what kinds of businesses may evaluate it
- what durable characteristics matter
- what tradeoffs should be understood
- what should be verified before a real space decision

Building Profiles are not listing pages, availability pages, broker flyers, or property ads.

### Broker Platform

The broker platform is organized around Location Briefs, not raw leads.

The long-term handoff should be:

```text
Rofo
Location Brief
Broker Partner
Referral Lifecycle
```

Broker partner workflows should reduce discovery time by giving brokers structured business requirements, recommended market paths, priorities, and validation questions.

## Recommendation and Explainability Philosophy

Rofo recommendations should provide an intelligent starting point and explain why.

The resolver should use:

- selected location
- space type
- size
- optional priorities
- Knowledge Graph fit
- comparison relationships
- tradeoffs and validation questions

The explainability layer should answer:

- why this location was recommended
- which priorities matched
- what tradeoff matters most
- why alternatives are relevant
- what should be validated next

Do not change recommendation rankings without a focused recommendation sprint and QA.

## Commercial Geography Philosophy

Commercial geography is not generic geography. A district matters when businesses actually compare it as part of a location decision.

The graph should capture:

- market paths
- district identity
- space-type fit
- commercial ecosystems
- comparison relationships
- representative environments
- tradeoffs
- questions to validate

Relationships should be tenant-decision paths, not generic nearby links.

## Commercial Ecosystem Philosophy

Businesses search for places where their operations can succeed, not for property types. Rofo translates business needs into commercial ecosystems.

The canonical ecosystem vocabulary includes office, industrial/flex, retail, medical, life science, hospitality, and special purpose. Office must not become the default category. A metro can have strong office coverage and still be commercially incomplete.

Commercial ecosystem metadata is additive unless a focused future sprint changes recommendation behavior. It currently supports Publisher reporting, readiness planning, Representative Building Intelligence, Building Profiles, and future archetype-aware recommendations.

## Editorial Philosophy

Rofo writing should feel like advice from an experienced tenant representative.

It should be:

- calm
- specific
- commercially literate
- practical
- balanced
- honest about tradeoffs

Avoid brokerage hype, unsupported claims, generic AI language, and internal taxonomy terms in public copy.

Public pages should help users decide what to compare and what to validate next.

## Publisher Philosophy

Publisher exists to make editorial coverage measurable.

It should:

- inspect repository-owned source data
- preserve deterministic scoring
- identify gaps
- generate reviewable plans
- separate geographic readiness from ecosystem readiness
- expose coverage gaps without hiding them behind a single score

Publisher should not become an opaque blended score or autonomous content generator.

## EOS Philosophy

EOS is Rofo's editorial operating system.

EOS v2.2 separates the portfolio into:

- Today's Recommended Work
- Editorial Queue
- Expansion Queue
- Field Mode Queue
- Review Queue
- Opportunity Inventory

It also separates operating lanes:

- Engineering
- Execution / Field Mode
- Editorial
- QA

Executable tasks use Commence Work to open a structured execution packet. The packet includes objective, reason, current health, files, dependencies, acceptance criteria, deliverables, QA commands, required review, automation level, providers, and handoff.

EOS Standardized Execution Report v1 is the standard interface between EOS and AI execution systems. Codex-ready prompts should request the same structured final report every time: Architecture Discovery, Implementation Summary, Files Changed, Results, Validation, Remaining Limitations, and Recommended Next Highest-Leverage Improvement. EOS can then import the report into a Mission Debrief for human review without parsing arbitrary prose.

The execution handoff is:

```text
Engineering
Execution / Field Mode
QA
Publish
```

EOS should not create premature subtasks or execute Codex automatically. It prepares work so future execution providers can operate without collapsing planning, execution, QA, and publishing into one opaque action.

## Market Expansion Philosophy

A future metro is a project, not a single task.

Expansion stages are:

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

Expansion projects should combine engineering work, field work, editorial work, and publishing readiness. Investment Score asks whether Rofo should invest in a metro next; Editorial Health asks how complete an existing metro is.

Do not infer market priority solely from available data. Missing data is not proof that a market is unimportant.

## Building Content Philosophy

Buildings are examples of commercial environments. They should help users understand district fit, operating needs, tradeoffs, and validation questions.

Representative Buildings bridge abstract district intelligence and concrete commercial environments. Building Profiles convert the strongest examples into public decision-support content.

Do not fabricate property facts. Do not imply that business archetype fit means those tenants occupy the building. Do not claim loading, power, clear height, yard, parking, permitted use, or infrastructure unless source support exists.

## Design Principles

Rofo interfaces should prioritize clarity over decoration.

Use:

- clear hierarchy
- readable typography
- compact but humane spacing
- restrained cards
- practical progress and status indicators
- editorial images that support the decision
- mobile layouts that preserve readability

Avoid exposing raw internal taxonomy, dense raw-data tables, marketing-style hero sections where the user needs a tool, and decorative UI that makes the task harder.

## Engineering and Quality Principles

Rofo's source of truth lives in GitHub and repository-owned data.

Engineering changes should:

- prefer existing architecture and conventions
- keep generated data deterministic
- preserve public URLs
- preserve recommendation behavior unless explicitly approved
- keep Search Profile questions stable unless a focused sprint changes them
- keep Publisher scoring stable unless a focused Publisher sprint changes it
- separate source data, generated data, runtime Functions, templates, and QA
- avoid Cloudflare runtime dependencies on filesystem-only repository analysis
- validate with focused QA and build checks

Generated files should be regenerated intentionally and reviewed as part of the sprint.

## AI Collaboration Model

ChatGPT and Codex should operate as implementation partners working from repository evidence.

AI collaborators should:

- inspect current architecture before making changes
- use existing docs and code as source of truth
- make additive changes unless a migration is explicitly requested
- preserve user-facing behavior outside the sprint scope
- document assumptions and limitations
- run the requested QA
- avoid inventing classifications, property facts, or product systems
- avoid committing or pushing unless explicitly instructed

Autonomous generation is a future capability, not a current default.

## GitHub as Durable Source of Truth

GitHub is Rofo's durable memory.

Strategic decisions should be reflected in documentation. Product facts should be reflected in source data. Generated JSON should reflect the build-time output of deterministic scripts. Runtime systems should consume generated artifacts or databases designed for runtime use, not ad hoc repository inspection.

When future sessions need orientation, this document should be read alongside the focused system docs it references.

## Preferred Sprint Workflow

Use this pattern:

1. Inspect current repository state and relevant architecture.
2. Identify the smallest scoped change that satisfies the sprint.
3. Preserve existing behavior outside the sprint.
4. Implement source changes.
5. Regenerate only the generated data required by the change.
6. Run focused QA.
7. Run the build when user-facing templates, generated data, or runtime routes are affected.
8. Run `git diff --check`.
9. Report files changed, validation results, known limitations, and the next logical sprint.

Do not begin the next sprint while finalizing the current one.

## Current Strategic Priorities

Current priorities are:

- finalize EOS as the editorial planning and orchestration layer
- maintain Publisher as deterministic metro coverage and expansion planning
- preserve Compass recommendation quality and explainability
- strengthen commercial ecosystem balance, especially industrial/flex where office depth can mask gaps
- use Representative Building Intelligence and Building Profiles to make commercial environments tangible
- use Field Mode to add Rofo-owned visual evidence without requiring Git or redeploys
- keep public pages simple, decision-oriented, and free of internal implementation language

## Long-Term Vision

Rofo should become a commercial location intelligence platform where:

- businesses start with a short Search Profile
- Compass recommends a clear market path
- Location Briefs explain the decision
- Building Profiles make environments concrete
- Field Mode improves trust with Rofo-owned photography
- Publisher measures coverage and readiness
- EOS plans and orchestrates the editorial portfolio
- brokers receive structured Location Briefs instead of cold, context-free leads
- future automation prepares work only where evidence, schema, and QA support it

The durable goal is not more pages. The durable goal is better commercial decisions.
