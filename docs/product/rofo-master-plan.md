# Rofo Master Plan

> **Status:** Living product and architecture document  
> **Purpose:** Give every product, editorial, and engineering session a shared understanding of Rofo's mission, operating principles, systems, priorities, and long-term direction before implementation begins.

## Vision

Rofo is building a commercial location intelligence product that helps businesses understand markets, compare locations, and make better commercial real estate decisions.

Traditional commercial real estate platforms begin with listings. Rofo begins with the decision.

Listings may support that decision, but they are not the product. The product is confidence: helping a user understand where they should locate, why a place fits, what alternatives matter, which tradeoffs exist, and what to validate next.

## Mission

Help businesses confidently choose the right commercial location.

Every feature should reduce uncertainty, improve decision quality, or make Rofo's commercial geography more useful.

## Product Promise

A user may begin with a city, a district, an address, a space type, or only a rough business need.

Rofo should help that user finish with:

- a clearer understanding of the market;
- recommended locations with understandable reasoning;
- meaningful alternatives and tradeoffs;
- representative environments and buildings;
- practical questions to validate;
- an actionable next step.

## Product Principles

### Teach before selling

Users should leave knowing more than when they arrived. Rofo should educate rather than pressure.

### Recommendations over search

Search assumes users already know where they want to be. Rofo should help users discover where they should be.

### Explain every recommendation

Recommendations should never feel like black boxes. Users should understand:

- why a location fits;
- which priorities were matched;
- what tradeoffs exist;
- why alternatives still matter;
- what should be validated next.

### Commercial geography is the product

District relationships, representative buildings, nearby areas, market patterns, location tradeoffs, and commercial identity form Rofo's core intellectual property.

### The recommendation remains the hero

Supporting content, buildings, scores, maps, and broker services should clarify the recommendation rather than compete with it.

### Human-centered AI

AI should help users think better. It should simplify complexity, expose reasoning, and produce useful next steps without overwhelming the user.

### Progressive disclosure

Show the user what matters now. Reveal greater detail as it becomes useful rather than presenting walls of information or oversized forms.

## What Rofo Is

- Commercial location intelligence
- Location decision support
- Market and district education
- A recommendation and explainability engine
- A commercial geography knowledge system
- A broker enablement and referral platform
- An editorial publishing system

## What Rofo Is Not

- A traditional listing portal
- A generic property database
- A CRM
- A generic AI chatbot
- An advertising-first marketplace
- A brokerage website centered on "we" and "our services"

## Core User Journey

The intended decision journey is:

1. **Orient** — understand a market, district, or space type.
2. **Describe** — provide enough context for Rofo to understand the location decision.
3. **Recommend** — identify primary and alternative locations.
4. **Explain** — show why each recommendation fits and what tradeoffs exist.
5. **Validate** — provide practical questions, building examples, and factors to verify.
6. **Act** — save the result, request expert help, or begin evaluating space.

## Current Product Systems

### Search Profile

Captures a user's business, location intent, space needs, priorities, constraints, and notes without becoming a traditional lead form.

### Recommendation Engine

Resolves a Search Profile against Rofo's commercial knowledge graph and produces primary and alternative location recommendations.

### Recommendation Explainability Layer

Provides structured rationale, matched priorities, tradeoffs, alternative reasoning, and validation guidance.

### Location Brief

The durable, shareable output of the recommendation experience. It should preserve the user's context, recommendations, explainability, and next steps.

### Commercial Knowledge Graph

Represents commercial districts, nearby relationships, comparisons, business fit, space-type fit, tradeoffs, and questions to validate.

### Representative Buildings

Buildings are selected to teach users about commercial environments and district identity. They are not merely famous properties or inventory records.

### Building Briefs

Structured building-level content that extends Rofo's commercial geography, improves district depth, and supports future location decisions.

### Commercial Leasing Handbook

A practical knowledge center that answers real leasing and location-strategy questions. It should support decisions rather than exist only for keyword coverage.

### Publisher

Measures market readiness, editorial coverage, representative-building depth, Building Brief coverage, public-route integrity, and publishing readiness.

### EOS Operations

Rofo's internal operating system for planning, engineering, execution, editorial work, field work, review, QA, and market expansion.

### Broker Platform

Manages broker partners, invitations, market and space-type fit, referrals, acceptance workflows, and eventual performance history.

### Admin System

Provides operational visibility into leads, recommendation coverage, Compass health, Publisher readiness, EOS work, market expansion, and broker activity.

## Recommendation Philosophy

Recommendations should combine:

- user-stated priorities and constraints;
- location intent: focus, compare, or discover;
- commercial knowledge graph relationships;
- district and market comparisons;
- representative environments and buildings;
- explainability;
- validation guidance.

Every recommendation should answer:

- Why this location?
- Compared with what?
- Which priorities does it satisfy?
- What is the principal tradeoff?
- Why do the alternatives still matter?
- What should the user validate next?

Scores may be used when they are explainable. A number without understandable reasoning is not sufficient.

## Commercial Geography Philosophy

Rofo's moat is not the number of pages or buildings in a database. It is the quality and structure of its commercial understanding.

A useful market model should teach:

- how districts differ;
- which districts are substitutes or complements;
- how space type, business type, access, image, cost, and environment affect fit;
- which representative buildings explain each district;
- what nearby relationships matter;
- where recommendations require local validation.

Graph expansion should improve recommendation quality and public-market education at the same time.

## Editorial Philosophy

Editorial content exists to improve decisions.

Pages should answer real user questions rather than simply target keywords. Each page should make the user smarter and lead naturally to a useful next step.

Representative buildings should be chosen for teaching value. District and city pages should explain commercial character, differences, examples, tradeoffs, and decision context.

Rofo's voice should be:

- confident;
- calm;
- direct;
- user-centered;
- commercially informed;
- free of unnecessary brokerage language.

## Publisher Philosophy

Publishing should be systematic and measurable.

Publisher should distinguish among:

- **Compass Readiness** — recommendation graph, comparisons, explainability, validation, and QA;
- **Editorial Coverage** — district substance, representative buildings, Building Brief depth, and style quality;
- **Publishing Readiness** — public routes, internal references, links, and complete publishable surfaces.

A market may be recommendation-ready before it is editorially complete. Those states should remain visible rather than being collapsed into one score.

## EOS Philosophy

EOS is Rofo's operating system, not merely a software backlog.

Planning remains centralized, but work is separated by execution type and workstream.

Core workstreams include:

- engineering;
- execution and Field Mode;
- editorial;
- QA and review.

Engineering work should hand off explicitly to execution when photography, research, verification, or editorial work is required. Execution should return work to QA and publishing.

Execution tasks should remain lightweight until work begins. **Commence Work** should generate the appropriate working checklist, requirements, completion criteria, and handoff path only when the task is activated.

Projects should expose workstream progress rather than hiding everything behind one completion percentage.

## Market Expansion Philosophy

Market expansion is a first-class, repeatable project type.

A typical metro lifecycle is:

1. Discovery
2. District model and commercial identity
3. Knowledge graph
4. Comparison relationships
5. Representative buildings
6. Recommendation calibration
7. Editorial coverage
8. Building Brief coverage
9. Compass QA
10. Publishing readiness
11. Published market
12. Ongoing maintenance

A metro project may contain engineering, research, field work, editorial work, QA, and publishing tasks. EOS and Publisher should make those workstreams visible.

The goal is to make "Build Atlanta" or any future metro a repeatable operating process rather than a loose collection of tasks.

## Building Content Philosophy

Rofo may use and enhance its underlying building data, but it should not drift back into becoming a listing database.

Building content is valuable when it:

- explains a district or submarket;
- gives users concrete examples of commercial environments;
- supports recommendation validation;
- connects buildings to district, city, space-type, and handbook content;
- creates durable editorial depth;
- improves the usefulness of the knowledge graph.

Building-page quantity is secondary to teaching value, consistency, and connectivity.

## Broker Platform Philosophy

The broker platform should support the user's decision rather than interrupt it.

Rofo should provide qualified context to an appropriate local partner, including the user's intent, priorities, recommendation rationale, and validation needs.

Broker relationships should become measurable over time through market fit, space-type fit, response behavior, accepted referrals, and outcomes.

## Design Philosophy

Interfaces should feel:

- calm;
- confident;
- modern;
- simple;
- transparent;
- useful before promotional.

Prefer:

- strong hierarchy;
- focused primary actions;
- restrained card use;
- progressive disclosure;
- clear explanations;
- readable editorial layouts;
- mobile usability;
- visible states and handoffs.

Avoid:

- unnecessary dashboards;
- decorative metrics;
- oversized forms;
- competing calls to action;
- inherited UI patterns that constrain a better experience;
- brokerage-centered copy.

The current standard primary call to action is **Start Your Search** unless a surface has a more specific user action.

## Engineering Principles

Prefer:

- modular architecture;
- reusable components where reuse improves clarity;
- explicit schemas and state models;
- deterministic behavior;
- incremental implementation;
- backward-compatible migrations;
- focused validation scripts;
- documentation that evolves with the code;
- repository state over conversational memory.

Avoid:

- unnecessary abstraction;
- broad rewrites without a clear product benefit;
- hidden state transitions;
- duplicated source-of-truth data;
- premature expansion of execution subtasks;
- coupling public presentation too tightly to internal operations.

Technical debt should be reduced continuously, but not at the expense of completing a clearly scoped sprint.

## Data and Quality Principles

Generated data should be reproducible from canonical sources.

Readiness and quality states should be explainable. Admin metrics should help identify the next useful action, not merely report activity.

Every substantial system should have an appropriate combination of:

- schema validation;
- syntax checks;
- deterministic snapshot generation;
- scenario QA;
- route and link validation;
- build verification;
- documented limitations.

## AI Collaboration Model

### ChatGPT

Primary responsibilities:

- product strategy;
- architecture;
- UX and design direction;
- prioritization;
- sprint definition;
- tradeoff analysis;
- implementation review.

### Codex

Primary responsibilities:

- repository inspection;
- implementation;
- refactoring;
- tests and validation;
- documentation updates;
- diff review;
- commits and push workflows when requested.

### GitHub

GitHub is the durable source of truth for:

- code;
- architecture documents;
- product decisions that must persist;
- commits;
- branches;
- pull requests;
- issues and future work.

Important product knowledge should progressively move from chat history into the repository.

## Working Method

Substantial work should be organized as discrete sprints:

1. Define the problem and desired outcome.
2. Review relevant product and architecture documents.
3. Inspect the current repository state.
4. Propose or confirm the implementation boundary.
5. Implement incrementally.
6. Run focused checks and a full build where appropriate.
7. Review the diff for unintended scope.
8. Update durable documentation.
9. Commit and push intentionally.
10. Identify the next sprint without silently expanding the current one.

Every substantial Codex prompt should begin by reading this document and the relevant system-specific architecture document.

## Current Strategic Priorities

The order may evolve, but the current priorities are:

1. Recommendation experience and explainability
2. Publisher maturity and readiness calibration
3. EOS Operations and execution handoff
4. Building Brief system and representative-building depth
5. Repeatable national market expansion
6. Broker partner and referral platform
7. Commercial Leasing Handbook and editorial authority
8. Public-page quality, internal linking, and SEO growth
9. Revenue generation from qualified user outcomes

## Business Direction

Rofo should become capable of producing meaningful owner income without requiring a large organization or a return to a labor-intensive listing marketplace.

The preferred business should remain flexible, software- and knowledge-driven, and capable of operating across markets with selective expert and broker participation.

Growth should follow product usefulness. The immediate goal is not maximum scale; it is a differentiated product that reliably creates valuable decisions, qualified introductions, durable organic traffic, and repeatable market expansion.

## Long-Term Vision

Rofo becomes the trusted operating system for commercial location decisions.

A user begins with uncertainty.

Rofo helps that user understand the market, identify the best locations, see the tradeoffs, validate the decision, and take the next step with confidence.

That confidence—not listings—is the product.

## Document Maintenance

This document should be updated when a product principle, system boundary, strategic priority, or operating model materially changes.

Detailed implementation rules should live in companion documents, including:

- `docs/architecture/recommendation-engine.md`
- `docs/architecture/eos.md`
- `docs/architecture/publisher.md`
- `docs/architecture/location-graph.md`
- `docs/editorial/building-pages.md`

This master plan should remain stable enough to orient future work while evolving enough to reflect the actual product.
