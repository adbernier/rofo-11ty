# Rofo Information Architecture

Rofo's future information architecture should organize the product around the customer's decision journey, not around internal content types.

The three organizing questions are:

1. Where should I look?
2. What should I expect?
3. How do I get the deal done?

This document inventories the current and future content system, defines how each piece should function, and recommends the long-term architecture for the next 6-12 months of product development.

## Architecture Principles

- Customer questions are the navigation model.
- Location Briefs are the canonical product artifact.
- Rofo Compass powers location intelligence, but Rofo remains the customer-facing brand.
- Universal education and local knowledge should reinforce each other.
- Titles navigate. Buttons perform actions.
- Every page should move the customer to a more informed next decision.
- SEO should follow semantic relationships, not keyword stuffing.

## Pillars

### Location Intelligence

Answers:

Where should I look?

Core assets:

- city pages
- district pages
- comparison pages
- Rofo Insights
- representative buildings
- `/find-locations/`
- `/recommendations/`
- Location Brief
- Compass Knowledge Graph

### Education

Answers:

What should I expect?

Core assets:

- leasing guides
- space-type pages
- market guides
- market snapshots
- budget guidance
- timeline guidance
- broker relationship guidance
- universal education hub, future

### Execution

Answers:

How do I get the deal done?

Core assets:

- expert review
- lead dashboard
- broker partner directory
- referral workflow
- broker opportunity pages
- OfficeFinder compatibility
- future partner portal
- future CRM/collaboration

## Major Content Type Inventory

### Homepage

Purpose:

Introduce Rofo as a commercial location decision platform.

Customer question answered:

Where should I start?

Future placement:

Top-level entry point for the three-question journey.

Primary CTA:

Find My Best Locations

Supporting CTAs:

- How Rofo Works
- View an Example Location Brief
- Explore Markets
- Understand Commercial Leasing

Internal linking strategy:

The homepage should route visitors into Location Intelligence, Education, and Execution paths without forcing them to understand Rofo's internal product architecture.

Pillar relationship:

All three pillars.

### City Pages

Purpose:

Explain the commercial geography of a city and guide users toward relevant districts, comparisons, Insights, and recommendations.

Customer question answered:

Where should I look in this city?

Future placement:

Primary local knowledge hub for a market.

Primary CTA:

Find My Best Locations

Supporting CTAs:

- View all city Insights
- Compare commercial areas
- Explore districts
- Browse available commercial space

Internal linking strategy:

City pages should link to district pages, comparison pages, Insight hub, representative buildings, space-type pages, market guides, and `/find-locations/` with city context.

Pillar relationship:

Location Intelligence first, Education second, Execution third.

### District Pages

Purpose:

Explain who a district is best for, what tradeoffs matter, and what comparable districts should be evaluated.

Customer question answered:

Is this the right commercial area for my business?

Future placement:

Local knowledge page within city architecture.

Primary CTA:

Find My Best Locations

Supporting CTAs:

- Compare nearby districts
- View related Insights
- Explore example buildings
- Browse available space

Internal linking strategy:

District pages should link to city page, related districts, comparison pages, related Insights, representative buildings, and Location Brief intake with district context.

Pillar relationship:

Location Intelligence.

### Comparison Pages

Purpose:

Explain the decision between two or more plausible commercial areas.

Customer question answered:

Which location is the better fit?

Future placement:

Decision-support layer between district pages and Location Brief generation.

Primary CTA:

Compare My Options

Supporting CTAs:

- Find My Best Locations
- View related Insights
- Explore both districts

Internal linking strategy:

Comparison pages should link to both district pages, related Insights, city hub, representative buildings where relevant, and `/find-locations/` with comparison context.

Pillar relationship:

Location Intelligence.

### Representative Buildings

Purpose:

Illustrate what a commercial environment looks like in practice.

Customer question answered:

What kinds of buildings exist in this market?

Recommended future naming:

Example Buildings

Future placement:

Supporting layer on city, district, comparison, and Insight pages.

Primary CTA:

Find Similar Locations

Supporting CTAs:

- Explore district
- Browse available space
- Generate a Location Brief

Internal linking strategy:

Representative building pages should link to district context, similar buildings, nearby commercial areas, and Location Brief intake.

Pillar relationship:

Location Intelligence and Execution.

### Space Type Pages

Purpose:

Explain how a space type works and what a business should consider before searching.

Customer question answered:

What should I expect for this kind of space?

Future placement:

Universal education plus local availability bridge.

Primary CTA:

Find My Best Locations

Supporting CTAs:

- Understand leasing costs
- Explore nearby markets
- Browse example buildings

Internal linking strategy:

Space-type pages should link to relevant city pages, local space-type pages, budget/timeline guidance, representative buildings, and `/find-locations/` with space type context.

Pillar relationship:

Education and Location Intelligence.

### Market Guides

Purpose:

Provide broad market context for a city or metro.

Customer question answered:

What should I understand about this commercial market?

Recommended future naming:

Understand the Market

Future placement:

Education layer attached to city pages and market hubs.

Primary CTA:

Find My Best Locations

Supporting CTAs:

- Explore districts
- Compare commercial areas
- Read related Insights

Internal linking strategy:

Market guides should link to city, district, space-type, and Insight pages, and should avoid duplicating Compass recommendations.

Pillar relationship:

Education and Location Intelligence.

### Market Snapshots

Purpose:

Summarize a local market or space-type context quickly.

Customer question answered:

What should I know at a glance?

Future placement:

Supporting module on city, district, and space-type pages.

Primary CTA:

Find My Best Locations

Supporting CTAs:

- Explore market guide
- Browse example buildings

Internal linking strategy:

Snapshots should connect to deeper education and location intelligence, not become isolated facts.

Pillar relationship:

Education and Location Intelligence.

### Rofo Insights

Purpose:

Express concise commercial observations from Rofo's location intelligence.

Customer question answered:

Why does this location decision matter?

Future placement:

Editorial intelligence layer on city, district, comparison, and Insight hub pages.

Primary CTA:

Find My Best Locations

Supporting CTAs:

- Continue exploring district
- Compare related areas
- View example buildings

Internal linking strategy:

Insights should link to city pages, district pages, comparison pages, representative buildings, related Insights, and Location Brief intake.

Pillar relationship:

Location Intelligence and Education.

### Leasing Guides

Purpose:

Explain universal commercial leasing concepts.

Customer question answered:

What should I expect before leasing commercial space?

Recommended future naming:

What to Expect When Leasing Commercial Space

Future placement:

Universal education hub.

Primary CTA:

Find My Best Locations

Supporting CTAs:

- Talk to an expert
- Read related leasing topics
- View space-type guidance

Internal linking strategy:

Leasing guides should connect to space-type pages, Location Brief intake, expert review, and relevant local examples.

Pillar relationship:

Education.

### Location Brief

Purpose:

Create the canonical customer-specific recommendation document.

Customer question answered:

Where should my business start, and why?

Future placement:

Core product artifact across recommendation, expert review, broker referral, and future collaboration.

Primary CTA:

Request Expert Review

Supporting CTAs:

- Copy Brief Link
- View Location Brief
- Future: Share, PDF, collaborate

Internal linking strategy:

Location Briefs should reference recommended markets, comparison markets, representative buildings, validation questions, and expert review.

Live Market Investigation is a continuation state of the Location Brief, not a separate generic contact flow. It begins from a recommended district, carries representative-building context forward, asks the user to confirm investigation scope, and stores a structured `liveMarketInvestigation` object with the submitted brief. Representative buildings remain examples for understanding the market; availability and broker support are confirmed later through review.

Reliability is part of the information architecture. The intake creates a stable submission token before POST, and the server combines that token with a normalized investigation fingerprint to prevent duplicate Location Briefs, duplicate leads, and duplicate emails from retry behavior. A request becomes `received` only after persistence. User confirmation email status is stored separately from investigation persistence so email failure does not erase the permanent Location Brief.

Pillar relationship:

Location Intelligence and Execution.

### Broker Network

Purpose:

Connect qualified Location Briefs with trusted local commercial brokers.

Customer question answered:

Who can help me execute this search?

Future placement:

Execution layer, mostly after expert review rather than as first-page content.

Primary CTA:

Work With a Local Broker

Supporting CTAs:

- Request Expert Review
- Partner With Rofo

Internal linking strategy:

Broker network content should connect to Location Briefs, expert review, referral workflow, and partner onboarding.

Pillar relationship:

Execution.

## Universal vs Local Knowledge

Rofo should maintain two knowledge systems.

### Universal Knowledge

Universal knowledge is location-independent commercial leasing guidance.

Examples:

- lease structures
- NNN
- tenant improvements
- budget expectations
- operating expenses
- timing
- negotiation
- broker relationships
- letters of intent
- commercial leasing education
- buildout and move planning

Primary customer question:

What should I expect?

Primary pages:

- leasing guides
- space-type education
- future universal education hub
- FAQ-style explanations
- budget and timeline guidance

### Local Knowledge

Local knowledge is market-specific commercial geography and location intelligence.

Examples:

- cities
- districts
- corridors
- comparison pages
- representative buildings
- market guides
- Rofo Insights
- Compass recommendations
- nearby markets
- market-specific commentary

Primary customer question:

Where should I look?

Primary pages:

- city pages
- district pages
- comparison pages
- Insight hubs
- representative building pages
- Location Briefs

### How They Reinforce Each Other

Universal knowledge helps the customer understand the process.

Local knowledge helps the customer choose a direction.

The strongest Rofo experience combines both:

- A city page explains where to look.
- A leasing guide explains what to expect.
- A Location Brief personalizes the choice.
- Expert review moves the customer toward execution.

Example:

A customer researching office space in San Francisco should be able to learn why Mission Bay differs from SoMa, understand how tenant improvements affect timing, generate a Location Brief, and request expert review from the same journey.

## Future Template Hierarchy

This section defines content order, not visual design.

### Homepage

Recommended order:

1. Brand promise: make better commercial location decisions
2. Primary action: Find My Best Locations
3. Three customer questions
4. Example Location Brief
5. How Rofo works
6. Featured markets or knowledge centers
7. Universal education entry points
8. Broker/expert review explanation
9. Trust and partner signals

### City Page

Recommended order:

1. City commercial real estate headline
2. Location decision prompt
3. City commercial geography overview
4. Featured Insights from Rofo
5. Districts and commercial areas
6. Comparison paths
7. Representative/example buildings
8. Market snapshot or guide
9. Space-type links
10. Location Brief CTA

### District Page

Recommended order:

1. District identity and fit statement
2. Recommendation prompt with district context
3. Who this district is best for
4. Key tradeoffs
5. Related Insights
6. Comparable districts
7. Representative/example buildings
8. Nearby commercial areas
9. Location Brief CTA

### Comparison Page

Recommended order:

1. Comparison headline
2. Summary recommendation framing
3. Side-by-side fit explanation
4. Key tradeoffs
5. Which businesses fit each area
6. Related Insights
7. Related districts
8. Representative/example buildings
9. Compare with my requirements CTA

### Insight Page

Recommended order:

1. Insight headline
2. Reading time and context
3. Executive summary
4. Why this matters
5. What businesses often overlook
6. What Rofo has learned
7. When this location is the better fit
8. When another district may be stronger
9. Related comparisons
10. Related districts
11. Representative/example buildings
12. Related Insights
13. Continue exploring
14. Find My Best Locations CTA

### Representative Building Page

Recommended order:

1. Building name/address
2. Building context, not availability promise
3. District context
4. What this building illustrates
5. Similar representative buildings
6. Related district and comparison pages
7. Browse availability or find similar locations CTA

## Navigation Philosophy

Navigation should be organized around customer questions, not content types.

Recommended future navigation:

- Find the Right Location
- What to Expect
- Available Commercial Space
- Work With a Local Broker

### Find the Right Location

Purpose:

Entry point to Location Intelligence.

Should include:

- Find My Best Locations
- city pages
- district pages
- comparison pages
- Rofo Insights
- Example Location Brief

### What to Expect

Purpose:

Entry point to universal leasing education.

Should include:

- leasing guides
- space-type guidance
- budget expectations
- timeline guidance
- broker relationship guidance

### Available Commercial Space

Purpose:

Entry point for users ready to inspect inventory.

Should include:

- city listings
- building pages
- space-type availability
- browse buildings

### Work With a Local Broker

Purpose:

Entry point to execution support.

Should include:

- expert review
- broker partner explanation
- partner with Rofo
- OfficeFinder compatibility where appropriate

## Messaging Audit

Recommended terminology changes:

| Current / Internal | Recommended Customer Language | Rationale |
| --- | --- | --- |
| Market Guide | Understand the Market | More natural and educational |
| Representative Buildings | Example Buildings | Easier customer language |
| Location Comparison | Compare Commercial Areas | Clearer SEO and customer intent |
| Leasing Guide | What to Expect When Leasing Commercial Space | Stronger education framing |
| Generate Location Brief | Find My Best Locations | More action-oriented before the brief exists |
| Search Profile | Business Requirements or Location Requirements | Less lead-form language |
| Recommendation Prompt | Location Decision Prompt | Customer-facing purpose |
| Expert Handoff | Request Expert Review | Clearer action |
| Broker Partner | Local Broker Partner | More customer-understandable |
| Compass | Rofo location intelligence / Rofo analysis | Compass remains primarily internal |
| Knowledge Graph | Rofo commercial location model | Avoid internal technical language |
| Market Path | Recommended Market Path | Keep when shown in Location Brief |
| Nearby Alternatives | Also Worth Comparing | More advisory |
| Lead | Customer Request or Expert Review Request | Avoid lead-gen language |
| Referral | Broker Introduction or Partner Referral | Depends on admin vs customer context |

Customer-facing language should include commercial real estate keywords naturally:

- commercial real estate
- office space
- industrial space
- warehouse
- flex space
- medical office
- retail space
- commercial area
- business location
- local broker
- lease
- tenant improvements

## Module Inventory

### Hero

Purpose:

Set page context and decision frame.

Customer question answered:

What page am I on and why does it matter?

Ideal placement:

Top of all major pages.

Dependencies:

Page type, location context, primary CTA.

Future opportunities:

Use consistent three-question language by page type.

### Search Profile / Find Locations Intake

Purpose:

Capture requirements and location intent.

Customer question answered:

Where should I look based on my business?

Ideal placement:

Primary intake page, not embedded broadly across education pages.

Dependencies:

Search profile JS, recommendation context, location intent, analytics.

Future opportunities:

Save progress, add collaboration, connect to universal education readiness.

### Recommendation Prompt Card

Purpose:

Bridge content pages into `/find-locations/`.

Customer question answered:

Should I evaluate this location for my business?

Ideal placement:

City, district, comparison, space-type, and guide pages.

Dependencies:

Page context, query params, analytics.

Future opportunities:

More intent-aware prompts by page type.

### Insight Module

Purpose:

Surface commercial reasoning and related editorial knowledge.

Customer question answered:

Why does this location decision matter?

Ideal placement:

City, district, comparison, and Insight pages.

Dependencies:

Rofo Insights data model.

Future opportunities:

Popularity metrics, industry filtering, dynamic related Insights.

### District Grid

Purpose:

Show local commercial areas within a city.

Customer question answered:

Which areas should I understand?

Ideal placement:

City pages and market hubs.

Dependencies:

Neighborhood/district data.

Future opportunities:

Group by role: office, industrial, medical, retail, growth.

### Comparison Grid

Purpose:

Show meaningful commercial alternatives.

Customer question answered:

What should I compare?

Ideal placement:

City and district pages.

Dependencies:

Comparison page data and Compass relationships.

Future opportunities:

Generate from Knowledge Graph relationships.

### Representative Buildings / Example Buildings

Purpose:

Translate commercial geography into real-world examples.

Customer question answered:

What kind of buildings define this environment?

Ideal placement:

District, comparison, Insight, and building pages.

Dependencies:

Representative building data and building pages.

Future opportunities:

Improve building role labels and connect to live availability.

### Market Snapshot

Purpose:

Provide concise local or space-type context.

Customer question answered:

What should I know quickly?

Ideal placement:

City, district, space-type, and market guide pages.

Dependencies:

Market guide and space-type data.

Future opportunities:

Separate durable guidance from live market data.

### Nearby Markets

Purpose:

Encourage comparison and discovery.

Customer question answered:

What nearby alternatives should I consider?

Ideal placement:

District, city, and space-type pages.

Dependencies:

Geography and comparison relationships.

Future opportunities:

Use Compass compare relationships for better relevance.

### Popular Searches

Purpose:

Support discovery and SEO.

Customer question answered:

What do other users commonly look for here?

Ideal placement:

City, state, and space-type pages.

Dependencies:

Search/index data.

Future opportunities:

Map to decision paths instead of only keyword links.

### CTA Modules

Purpose:

Move the customer to the next decision.

Customer question answered:

What should I do next?

Ideal placement:

After educational or local knowledge sections.

Dependencies:

Page context and current journey stage.

Future opportunities:

Context-aware CTA hierarchy: learn, compare, brief, expert.

### Broker CTA

Purpose:

Move qualified customers toward expert execution.

Customer question answered:

Who can help me get this done?

Ideal placement:

After Location Brief creation, guide pages, and execution-oriented pages.

Dependencies:

Broker partner workflow, lead/referral systems.

Future opportunities:

Show broker availability and partner coverage by market.

## Metro Readiness Model

Metro maturity should be split into four independent dimensions.

### Compass Ready

Definition:

Rofo can consistently generate trustworthy, graph-backed recommendations and advisor-quality Location Briefs.

Requires:

- Knowledge Graph coverage
- recommendation resolver support
- explainability
- QA scenarios
- editorial review

### Editorial Ready

Definition:

The metro has strong supporting local knowledge beyond the core recommendation engine.

Includes:

- Insights
- representative buildings
- comparison pages
- district refinement
- market-specific commentary

### Education Ready

Definition:

The metro connects local pages to enough universal education for customers to understand the leasing process.

Includes:

- space-type education
- leasing guides
- budget and timing guidance
- market guide context

### Broker Ready

Definition:

The metro can support execution through qualified local broker partners and referral workflows.

Includes:

- broker partner coverage
- space-type matching
- referral workflow
- expert review handling

### Value Without Compass

Cities without Compass can still provide value through:

- commercial real estate availability
- building pages
- leasing education
- market guides
- space-type pages
- broker introductions
- future Insights based on human review

Compass Ready should not be the only maturity threshold. It is the recommendation-quality threshold.

## SEO Philosophy

Rofo should support Google by building a semantically connected decision architecture.

### Topic Clusters

Each metro should develop clusters around:

- city commercial real estate
- districts and commercial areas
- comparisons
- space types
- leasing education
- Rofo Insights
- representative buildings

### Internal Linking

Links should express relationships:

- city -> districts
- district -> comparisons
- comparison -> related Insights
- Insight -> district/comparison/buildings
- guide -> space type and Location Brief
- building -> district and similar buildings

### Universal Education

Universal leasing content should rank for process questions and then route users to local decisions.

Examples:

- what is NNN
- how tenant improvements work
- how long commercial leasing takes
- how commercial brokers get paid

### Local Expertise

Local pages should demonstrate real commercial understanding:

- who a district fits
- what tradeoffs matter
- what alternatives should be compared
- what buildings illustrate the environment

### Commercial Intent

Pages should match the intent behind the query:

- "office space in San Francisco" may need availability and location guidance
- "SoMa vs Mission Bay" needs comparison logic
- "commercial lease timeline" needs education
- "find a broker" needs execution support

Avoid keyword stuffing. Depth should come from useful relationships and clear answers.

## Roadmap Recommendations

### Sprint 1: Information Hierarchy Alignment

Document page-level CTA hierarchy across homepage, city, district, comparison, Insight, and space-type templates.

Outcome:

Every page has one primary customer question and one primary next step.

### Sprint 2: Homepage Messaging

Reframe the homepage around:

- Find the right location
- Understand what to expect
- Work with a local expert

Outcome:

Rofo's top-level identity matches the decision journey.

### Sprint 3: City Template Evolution

Move city pages toward local knowledge hubs:

- commercial geography
- Insights
- district groups
- comparisons
- example buildings
- Location Brief CTA

Outcome:

Cities become the local entry point for Location Intelligence.

### Sprint 4: Universal Education Hub

Create a durable education system for leasing concepts, budget, timing, tenant improvements, and broker relationships.

Outcome:

Rofo can answer "What should I expect?" independently of local market coverage.

### Sprint 5: Insight Integration Expansion

Apply the San Francisco Knowledge Center model to the next Compass Ready metros.

Outcome:

Insights become the editorial layer that explains Compass reasoning.

### Sprint 6: Navigation Evolution

Shift navigation from content types to customer questions.

Outcome:

Users can self-select into Location Intelligence, Education, Inventory, or Execution.

### Sprint 7: Representative Building Language

Evaluate renaming "Representative Buildings" to "Example Buildings" in customer-facing contexts.

Outcome:

Buildings become easier to understand as examples, not availability promises.

### Sprint 8: Broker Execution Layer

Clarify the customer-facing journey from expert review to local broker introduction.

Outcome:

Execution feels like a natural next step after the Location Brief, not a separate lead workflow.

## Key Opportunities

- Turn every city page into a local decision hub.
- Turn every district page into an answer to "Is this right for my business?"
- Turn every comparison page into a decision tool.
- Turn every Insight into a bridge from learning to Location Brief generation.
- Turn universal leasing education into a second major acquisition path.
- Turn broker partner workflows into the execution layer of the Location Brief.

The long-term architecture should make Rofo feel less like pages plus forms and more like a connected commercial location decision system.
