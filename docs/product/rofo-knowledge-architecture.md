# Rofo Knowledge Architecture

**Status:** Foundational product architecture
**Owner:** Product
**Audience:** Product, engineering, editorial, Publisher, EOS, partnerships, broker operations
**Related documents:** `docs/product/rofo-master-plan.md`, `docs/product/rofo-product-experience-vision.md`, `docs/product/commercial-location-decision-model.md`, `docs/commercial-geography-model.md`, `docs/location-knowledge-graph.md`, `docs/commercial-market-evidence.md`, `docs/rofo-publisher.md`, `docs/editorial-operating-system.md`

This document defines the long-term architecture for Rofo's commercial location knowledge platform. It is strategic and architectural. It does not implement pages, change production routing, modify recommendation behavior, or redesign the product.

Rofo helps businesses answer one question:

```text
Where should we locate?
```

Every product surface, published page, data system, recommendation, broker workflow, and future commercial partnership should contribute to answering that question.

## 1. Product Philosophy

Rofo is a commercial location intelligence platform.

Rofo is not primarily a listings platform, a broker directory, a landlord marketing site, or a generic commercial real estate encyclopedia. Listings, brokers, publishing, and Location Briefs are delivery channels for commercial location knowledge. They are not the center of the product.

### What Rofo Is

Rofo is:

- a recommendation product for commercial location decisions
- a structured commercial knowledge platform
- a publishing system for market, district, business, and building intelligence
- a Location Brief platform
- a broker handoff system organized around a canonical recommendation document
- an editorial operating system for expanding and maintaining commercial knowledge

### What Rofo Is Not

Rofo is not:

- a generic listings search experience
- a system that recommends a city back to a user who already chose that city
- a black-box scoring engine
- a substitute for live market investigation
- a replacement for broker execution, availability research, zoning review, lease economics, or transaction diligence
- a content farm that publishes unsupported pages merely because a keyword exists

### The Problem Rofo Solves

Most businesses begin a commercial real estate search with incomplete knowledge. They may know a city, a space type, and a rough business need, but they often do not know which districts, nearby markets, building environments, or tradeoffs deserve attention.

Rofo should turn that vague starting point into a defensible location path:

```text
Business context
Recommended places to begin
Reasons and tradeoffs
Representative environments
Questions to validate
Broker execution
```

### Recommendations Versus Listings

Listings answer:

```text
What spaces are available?
```

Recommendations answer:

```text
Where should this business begin looking, and why?
```

Listings are dynamic and transactional. Recommendations are top-of-funnel and decision-oriented. Rofo should recommend stable commercial geographies and representative environments first, then let brokers validate current availability, economics, and transaction details.

### Publishing Supports Recommendations

Publishing creates durable public knowledge that helps users and search engines understand Rofo's expertise before a personalized Business Profile exists.

Published pages should:

- define markets and districts
- explain property-type fit
- describe business archetype fit
- show representative buildings and commercial ecosystems
- expose nearby and comparative relationships
- teach tradeoffs that later appear in Location Briefs

### Recommendations Support Publishing

Recommendation activity should reveal which market, district, business-type, and scenario pages deserve stronger editorial coverage.

Every Location Brief should eventually create feedback for publishing:

- which districts users compare
- which tradeoffs create uncertainty
- which representative buildings make recommendations clearer
- which questions brokers repeatedly validate
- which business archetypes need public explanation

Publishing is therefore not separate from recommendations. It is the public, reusable expression of the same knowledge system.

## 2. Knowledge Graph

The Knowledge Graph is Rofo's structured commercial-location memory. It stores durable commercial judgment, not live listings or transaction conditions.

### Entity Model

#### Country

Purpose: National expansion context.

Relationships: Contains States and broad national publishing programs.

Used by: SEO architecture, national expansion reporting, future partner coverage.

Future opportunities: National industry pages, national broker partner programs, cross-market business archetype reports.

#### State

Purpose: Regulatory, geography, and public-route context.

Relationships: Belongs to Country; contains Metros, Regions, Markets, and public city routes.

Used by: Public URLs, route disambiguation, expansion planning, broker routing.

Future opportunities: State-level industry coverage and state-specific commercial guidance where useful.

#### Metro

Purpose: Compatibility and market-analysis grouping where existing data, Publisher reports, or public search behavior still refer to a broad metro.

Relationships: May contain or overlap one or more Markets. Metro is not the canonical ownership unit.

Used by: Publisher compatibility, legacy reporting, some public-search mental models.

Future opportunities: Metro-level landing pages that resolve users into canonical Markets.

#### Market

Purpose: Rofo's primary operating geography.

Definition: The largest commercial geography that can be developed, measured, recommended, and operated as one coherent editorial product.

Relationships: Belongs to Region; contains Districts; has Publisher, EOS, recommendation, photography, and commercial evidence readiness states.

Used by: Mission Control, Publisher, recommendations, public market pages, Location Brief context, broker routing.

Future opportunities: Market-level operating dashboards, market-level Location Brief examples, market-level partner programs.

#### District

Purpose: The smallest canonical commercial geography Rofo plans and recommends as a location decision object.

Relationships: Belongs to exactly one Market; has nearby/comparison relationships; has Commercial Market Evidence, representative buildings, business-archetype fit, property-type fit, and validation questions.

Used by: Recommendations, Location Briefs, district pages, Commercial Market Evidence, Building Evidence, Publisher maturity, Mission Control missions.

Future opportunities: District-specific Business Briefs, district comparison pages, district-level partner sponsorships where editorially appropriate.

#### Property Type

Purpose: Selects the relevant decision model.

Relationships: Applies to Markets, Districts, Business Types, Business Archetypes, Representative Buildings, and Location Briefs.

Used by: Business Profile, recommendation model selection, publishing hierarchy, broker routing.

Future opportunities: City-by-property-type recommendation models and published property-type guides.

#### Business Type

Purpose: The user's self-understood business category.

Relationships: Maps to Business Archetypes, Business Scenarios, Commercial Ecosystems, Property Types, and recommendation priorities.

Used by: Business Profile, Location Brief explanation, broker handoff, publishing pages.

Future opportunities: Business-type landing pages that explain how different companies should think about location.

#### Business Archetype

Purpose: Reusable commercial decision pattern across cities.

Relationships: Built from Business Type, Property Type, operating pattern, priorities, and typical tradeoffs.

Used by: Recommendation models, Business Profile taxonomy, publishing, Location Brief explanation, broker handoff.

Future opportunities: National archetype pages and market-specific archetype guidance.

#### Business Scenario

Purpose: A contextual situation that changes the location decision.

Examples: Growing team, client-facing office, hybrid attendance, first retail location, delivery-heavy restaurant, medical practice with patient parking.

Relationships: Combines Business Archetype, Property Type, constraints, and priorities.

Used by: Example Location Briefs, SEO pages, Business Profile prompts, recommendation QA.

Future opportunities: Search-intent pages and scenario-driven Location Brief templates.

#### Representative Building

Purpose: A durable commercial environment used as evidence, not inventory.

Relationships: Belongs to District; may support Commercial Market Evidence; may have a Building Profile; maps to Property Type, Commercial Ecosystem, Business Archetype, and operational characteristics.

Used by: Location Briefs, Building Profiles, Commercial Market Evidence, public district pages, Publisher readiness.

Future opportunities: Building-led explanation of district character, representative tours, partner handoff context.

#### Location Brief

Purpose: Canonical user-facing recommendation document.

Relationships: Generated from Business Profile and Recommendation Model; references Best Fits, Districts, Representative Buildings, Project Snapshot, broker handoff, and validation questions.

Used by: User decision support, broker handoff, OfficeFinder handoff, internal notifications, future CRM integrations.

Future opportunities: Shareable briefs, saved briefs, premium briefs, team collaboration, broker-reviewed updates.

#### Broker

Purpose: Executes the search after Rofo creates the location intelligence.

Relationships: Receives Location Brief, Project Snapshot, Lead, routing context, and unresolved validation questions.

Used by: Direct broker email, OfficeFinder handoff, internal lead operations, customer confirmation.

Future opportunities: Broker partner network, broker feedback loops, referral lifecycle measurement.

#### Commercial Ecosystem

Purpose: Describes the durable commercial activity pattern represented by a district or building.

Relationships: Maps to Districts, Representative Buildings, Business Archetypes, Property Types, and publishing categories.

Used by: Knowledge Graph, Publisher readiness, Commercial Market Evidence, recommendation explanation.

Future opportunities: Ecosystem coverage metrics, ecosystem-specific expansion sprints, ecosystem sponsor alignment.

#### Nearby Relationships

Purpose: Explain tenant-decision paths between places.

Relationships: Connect Districts and Markets through adjacency, comparison, substitution, stronger transit, stronger parking, more executive image, more creative character, or other decision-relevant relationships.

Used by: Recommendations, Location Brief alternatives, district pages, internal linking.

Future opportunities: Relationship-normalized comparison pages and adjacent-market recommendations.

#### Recommendation Model

Purpose: Converts Business Profile signals into a defensible set of Best Fits.

Relationships: Uses Property Type, Market, District attributes, Business Archetypes, constraints, priorities, and explanation metadata.

Used by: Business Profile, Location Brief, QA, prototype review harnesses, future Recommendation Explorer.

Future opportunities: Property-specific models across every major Market.

#### Business Profile

Purpose: Captures the business context required to make a useful location recommendation.

Relationships: Feeds Recommendation Model; summarized in Location Brief; included in broker handoff; may map to Business Archetypes and Business Scenarios.

Used by: Get Locations, Location Brief, Project Snapshot, lead routing.

Future opportunities: Editable saved profile, team collaboration, progressive profile enrichment.

#### Project Snapshot

Purpose: Concise execution summary derived from the Business Profile and Location Brief.

Relationships: References Market, Property Type, Business Type, approximate scale, timing, growth, top districts, and Brief URL.

Used by: OfficeFinder payloads, broker emails, internal notifications, future CRM integrations.

Future opportunities: Standard lead object across broker partners and commercial service providers.

#### Lead

Purpose: Operational record that connects a user, Business Profile, Location Brief, routing decision, and follow-up workflow.

Relationships: References Location Brief, Project Snapshot, Broker, OfficeFinder status, internal notification status, and customer confirmation.

Used by: Lead persistence, broker routing, operational logging, approval workflow.

Future opportunities: Referral lifecycle, conversion analytics, broker feedback, recommendation outcome learning.

## 3. Content Pyramid

Rofo's publishing hierarchy should move from broad promise to personalized recommendation.

```text
Homepage
Market
Property Type
Business Type
Business Scenario
District
Representative Building
Personalized Location Brief
```

### Homepage

Purpose: Explain that Rofo recommends where a business should begin looking for commercial space.

Primary action: Begin a Business Profile.

Should not: Behave like a listing search homepage or brokerage lead page.

### Market

Purpose: Establish the commercial geography and show that Rofo understands the market as an operating product.

Should answer: Which districts matter here? Which property types are supported? What can Rofo recommend?

### Property Type

Purpose: Explain how the market changes by space type.

Examples: San Francisco Office, Denver Office, future East Bay Flex, Seattle Retail.

Should answer: Which districts or submarkets fit this property type and why?

### Business Type

Purpose: Translate business identity into location needs.

Examples: office for law firms, office for startups, retail for fitness studios.

Should answer: What location drivers matter for this business?

### Business Scenario

Purpose: Capture high-intent situations.

Examples: 20-person growing technology company, client-facing professional services firm, healthcare practice near patients.

Should answer: How should a business in this situation compare locations?

### District

Purpose: Explain a canonical commercial location choice.

Should answer: What is this district good for, what are the tradeoffs, and what alternatives should be compared?

### Representative Building

Purpose: Make district character concrete through examples.

Should answer: What kind of commercial environment does this building represent?

### Personalized Location Brief

Purpose: Apply Rofo's knowledge to one user's Business Profile.

Should answer: Where should this business begin looking, why, what should it compare, and what should the broker validate?

## 4. Recommendation Architecture

The durable recommendation path is:

```text
Business Profile
Recommendation Model
Best Fits
Location Brief
Broker
```

### Business Profile

Captures useful business context. It should avoid brokerage qualification questions until they are needed for execution.

The profile should prioritize facts, constraints, and priorities that affect location fit.

### Recommendation Model

Uses authored commercial knowledge, not live listing economics, to identify defensible Best Fits.

The model should:

- select the relevant Market and Property Type model
- apply hard constraints only when justified
- use priorities to create meaningful differentiation
- preserve ties and uncertainty
- return the smallest defensible shortlist
- explain movement and tradeoffs without exposing internal scoring

### Best Fits

Best Fits are the places Rofo would begin looking.

They should be editorially explained, not presented as mathematical certainty.

### Location Brief

The Brief is the flagship output.

It should include:

- Business Profile summary
- Executive Summary
- Best Fits
- District Detail
- Representative Buildings
- comparative guidance
- questions to validate
- next steps

### Broker

The broker receives the Location Brief and Project Snapshot so the first conversation starts with context.

Rofo understands the business so the broker can focus on the market.

## 5. Business Profile Taxonomy

Business Profile questions should be evaluated by the value they create.

Question timing:

- Before the Brief: needed to create or materially improve a location recommendation.
- Inside the Brief: useful context or clarifying detail that improves interpretation.
- Broker execution: current market, transaction, and building-level diligence.
- Later workflow: useful after the initial location decision.

### Universal Questions

| Question | Recommendation value | Building-search value | Broker value | Belongs |
| --- | --- | --- | --- | --- |
| Market or city | Defines geography | Narrows building universe | Routing context | Before the Brief |
| Property type | Selects model | Selects inventory category | Routing and expertise | Before the Brief |
| Business type | Maps to archetype and priorities | Suggests building character | Conversation context | Before the Brief |
| Primary use of the space | Identifies operating model | Shapes layout/building needs | Useful discovery context | Before the Brief |
| Employee or customer geography | Influences location fit | Later affects commute/tour decisions | Validation context | Before the Brief or inside the Brief |
| Growth expectation | Influences flexibility needs | Affects building search and expansion | Important for broker execution | Before the Brief |
| Exact timing | Low for district fit | High for available inventory | High | Broker execution |
| Exact budget or rent target | Should not rank districts | High for available inventory | High | Broker execution |
| Contact information | None for recommendation | None | Required for handoff | After Brief or broker CTA |

### Office Questions

| Question | Recommendation value | Building-search value | Broker value | Belongs |
| --- | --- | --- | --- | --- |
| Office environment | High: modern, historic, creative, traditional, lower-rise | High | High | Before the Brief |
| Client visit frequency | High for image and access | Medium | High | Before the Brief |
| Recruiting importance | High for transit, amenities, ecosystem | Medium | Medium | Before the Brief |
| Commute orientation | High at broad level | Medium | High | Before the Brief |
| Hybrid pattern / occupancy | Medium for scale and district energy | High | High | Inside Brief or before if simple |
| Approximate headcount | Medium | High | High | Inside Brief or before if lightweight |
| Exact square footage | Low as a first input | High | High | Broker execution or optional |

### Flex Questions

| Question | Recommendation value | Building-search value | Broker value | Belongs |
| --- | --- | --- | --- | --- |
| Office / warehouse mix | High | High | High | Before the Brief |
| Loading need | High | High | High | Before the Brief |
| Truck access | High | High | High | Before the Brief |
| Customer or showroom component | Medium | High | High | Before the Brief |
| Approximate size | Medium | High | High | Before the Brief or inside Brief |
| Clear height, power, yard | Medium at district level | Very high | Very high | Broker execution unless critical |

### Retail Questions

| Question | Recommendation value | Building-search value | Broker value | Belongs |
| --- | --- | --- | --- | --- |
| Customer type | High | High | High | Before the Brief |
| Destination versus convenience | High | High | High | Before the Brief |
| Parking importance | High | High | High | Before the Brief |
| Co-tenancy preference | Medium | High | High | Inside Brief or broker execution |
| Foot traffic need | High | High | High | Before the Brief |
| Patio, signage, venting, frontage | Low to medium for district | Very high | Very high | Broker execution |

### Industrial Questions

| Question | Recommendation value | Building-search value | Broker value | Belongs |
| --- | --- | --- | --- | --- |
| Distribution, manufacturing, service, storage, or production use | High | High | High | Before the Brief |
| Highway / port / airport orientation | High | High | High | Before the Brief |
| Truck and loading requirements | High | High | High | Before the Brief |
| Labor geography | Medium | Medium | High | Inside Brief or before if simple |
| Power, clear height, yard, zoning | Medium at district level | Very high | Very high | Broker execution unless non-negotiable |

### Medical Questions

| Question | Recommendation value | Building-search value | Broker value | Belongs |
| --- | --- | --- | --- | --- |
| Practice type | High | High | High | Before the Brief |
| Patient access pattern | High | High | High | Before the Brief |
| Parking importance | High | High | High | Before the Brief |
| Institutional proximity | High when relevant | Medium | High | Conditional before the Brief |
| Procedure, plumbing, imaging, licensing, ADA details | Low for district fit | Very high | Very high | Broker execution |

## 6. Business Archetypes

Business Archetypes are reusable decision patterns. They should work across cities while allowing market-specific recommendation models to interpret them locally.

### Growing Technology Company

Typical priorities: recruiting, transit, modern environment, growth flexibility, ecosystem.

Location drivers: access to talent, expansion room, amenities, credible innovation context.

Office/building characteristics: modern office, larger floorplates, collaborative space, transit access.

Recommendation implications: Favor districts with modern inventory, growth capacity, strong transit, and technology ecosystem support.

Publishing implications: City-specific technology office guides and example Location Briefs.

### Client-Facing Professional Services

Typical priorities: client access, professional image, transit, meeting environment.

Location drivers: credible address, easy visitor navigation, nearby amenities.

Office/building characteristics: polished office, reliable access, professional common areas.

Recommendation implications: Favor traditional business districts, boutique professional districts, and access-oriented districts.

Publishing implications: Professional-services office pages and district comparison pages.

### Law Firm

Typical priorities: credibility, courthouse or client access where relevant, quiet professional environment, transit.

Location drivers: client confidence, executive image, convenient meetings.

Office/building characteristics: traditional or polished office, private rooms, strong building image.

Recommendation implications: Favor professional and traditional office districts; introduce alternatives when boutique image or lower-rise character matters.

Publishing implications: Law-office market guides and representative professional-building examples.

### Creative Studio

Typical priorities: distinctive character, flexible layout, neighborhood energy, client impression, cost context for broker review.

Location drivers: creative identity, collaborators, amenities, adaptable buildings.

Office/building characteristics: lower-rise, adaptive reuse, loft, showroom, studio-friendly environments.

Recommendation implications: Signal-specific entry for creative districts and secondary alternatives outside conventional office cores.

Publishing implications: Creative office and design ecosystem pages.

### Healthcare Practice

Typical priorities: patient access, parking, institutional adjacency, visibility, medical compatibility.

Location drivers: patient convenience, referral networks, accessible buildings.

Office/building characteristics: medical office, elevator access, parking, signage, compliance-sensitive conditions.

Recommendation implications: Favor medical ecosystems, hospital-adjacent districts, and patient-accessible nodes; push technical requirements to broker execution.

Publishing implications: Medical office location guides.

### Neighborhood Restaurant

Typical priorities: customer demand, visibility, foot traffic, parking, evening/weekend activity.

Location drivers: neighborhood identity, surrounding residents/workers, co-tenancy, operating constraints.

Office/building characteristics: storefront, venting potential, frontage, signage, patio where relevant.

Recommendation implications: Favor retail districts only when customer patterns support restaurant use; building conditions require broker validation.

Publishing implications: Restaurant location guides and retail corridor pages.

### Regional Retailer

Typical priorities: access, parking, visibility, trade area, co-tenancy.

Location drivers: customers, drive-time convenience, signage, anchor relationships.

Office/building characteristics: shopping centers, main-street storefronts, high-visibility nodes.

Recommendation implications: Favor retail ecosystems and customer-access geographies, not generic office districts.

Publishing implications: Market retail guides and shopping-center evidence.

### Food Distribution

Typical priorities: truck access, loading, cold or food-safe requirements, highway reach, labor access.

Location drivers: regional delivery routes, operational efficiency, zoning and building utility.

Office/building characteristics: warehouse, loading, clearances, food-related infrastructure where supported.

Recommendation implications: Favor industrial/logistics districts; technical requirements stay in broker execution.

Publishing implications: Food distribution and last-mile logistics pages.

### Research Laboratory

Typical priorities: institutional proximity, technical infrastructure, talent, regulatory and building compatibility.

Location drivers: research ecosystem, partners, specialized buildings.

Office/building characteristics: lab-capable or research-adjacent environments, not assumed without validation.

Recommendation implications: Favor life-science ecosystems and research districts; avoid claiming lab capability without source support.

Publishing implications: Life-science market and research-campus evidence pages.

### Medical Office

Typical priorities: patient access, parking, medical ecosystem, referral proximity, professional confidence.

Location drivers: patient convenience and care network fit.

Office/building characteristics: medical office or adaptable professional office with accessibility and parking.

Recommendation implications: Favor patient-accessible medical/professional districts; route technical needs to broker review.

Publishing implications: Medical office district guides and representative medical building profiles.

### Nonprofit or Mission-Driven Organization

Typical priorities: community identity, accessibility, cost context for broker review, transit, collaboration.

Location drivers: employees, community served, mission alignment, approachable environment.

Office/building characteristics: neighborhood office, nonprofit-friendly environments, flexible office formats.

Recommendation implications: Introduce districts with strong neighborhood identity and transit access when supported by model data.

Publishing implications: Nonprofit office location guides and mission-driven organization scenarios.

## 7. Publishing Strategy

Rofo should publish pages only when they strengthen commercial decision-making.

### Editorial Pages

Human-reviewed pages for strategic markets, districts, property types, business archetypes, and representative buildings.

Use when:

- judgment matters
- source evidence is nuanced
- a page will shape recommendations or user trust

### Generated Pages

Template-driven pages from structured, validated data.

Use when:

- entity identity is canonical
- structured attributes are complete enough
- the page can avoid thin or repetitive content
- internal links add genuine navigation value

### Personalized Pages

Location Briefs and saved recommendation artifacts.

Use when:

- a Business Profile exists
- the recommendation can be explained
- user-specific context changes the output

### Dynamic Pages

Pages that may later reflect live market information, broker input, or availability.

Use cautiously. Dynamic pages should not dilute the stable district recommendation model.

### Evergreen Pages

Durable guides explaining markets, districts, business archetypes, and property-type decisions.

Use when:

- the content will remain accurate beyond current availability cycles
- it can support internal linking and recommendation confidence

### Pages That Should Exist

- Market pages for active operational Markets.
- Market + Property Type pages where Rofo has enough recommendation intelligence.
- Business Type and Business Scenario pages where archetype rules are reusable.
- District pages for canonical recommendation-eligible Districts.
- Representative Building pages where the building explains a commercial environment.
- Example Location Briefs when they demonstrate real product value without pretending to be a user's personalized result.

### Pages That Should Never Exist

- Thin keyword pages with no recommendation value.
- Pages based only on live listing availability.
- Pages for unsupported geographies that do not map to canonical commercial geography.
- Building pages that behave like inventory ads without representative value.
- Business-type pages that do not change location advice.

### What Requires Editorial Review

- New Markets.
- New Districts.
- New Business Archetypes.
- Recommendation models.
- Commercial Market Evidence collections.
- Representative Buildings and Building Profiles.
- Any page making a comparative or advisory claim.

## 8. Initial Rollout

Recommended first rollout:

Markets:

- San Francisco
- Denver

Property Type:

- Office

Business Archetypes:

- Technology
- Professional Services
- Law
- Nonprofit
- Healthcare

This is sufficient to validate the architecture because it tests:

- one mature, evidence-rich market and one expansion market
- a high-value property type with broad demand
- archetypes with distinct office priorities
- Business Profile question usefulness
- Location Brief explainability
- broker handoff quality
- Publisher and EOS knowledge-completeness reporting

San Francisco validates depth. Denver validates repeatability.

## 9. Knowledge Completeness

Knowledge completeness is not a single score. It is a component model that asks whether Rofo knows enough to recommend, publish, explain, and hand off a market confidently.

### Dimensions

District coverage: Canonical districts exist, have market ownership, and include decision-oriented graph data.

Representative buildings: Districts have examples that explain commercial environments.

Commercial ecosystems: Districts and buildings map to ecosystem, subtype, activity, and archetype metadata.

Business archetypes: Reusable business patterns exist and are mapped to recommendation behavior.

Recommendation confidence: Recommendation QA confirms the model can produce explainable Best Fits without false precision.

Photography: Public experience has enough visual evidence to support trust.

Publishing readiness: Market, district, property-type, and building pages can be published without thin content.

Location Brief readiness: The system can create a concise, credible Brief for a Business Profile.

Broker handoff readiness: The Brief and Project Snapshot are complete enough for a broker to act.

### Maturity States

Suggested states:

- Missing: no usable canonical knowledge.
- Seeded: identity exists, but coverage is thin.
- Structured: durable attributes and relationships exist.
- Evidence-supported: representative evidence and buildings support claims.
- Recommendation-ready: QA confirms credible recommendations.
- Publishing-ready: public pages can support users and search.
- Execution-ready: Location Brief and broker handoff are reliable.

EOS should expose the component state rather than flattening everything into one unsupported score.

## 10. Flywheel

The Rofo flywheel is:

```text
Commercial Knowledge
Publishing
Search
Business Profile
Location Brief
Broker
Successful Transaction
Editorial Feedback
Commercial Knowledge
```

Commercial Knowledge: Rofo structures durable geography, district, ecosystem, business, and building intelligence.

Publishing: Public pages expose that knowledge and earn user trust before personalization.

Search: Users arrive with a market, property type, business type, or scenario.

Business Profile: Rofo captures enough context to understand the business decision.

Location Brief: Rofo turns structured knowledge into a personalized recommendation document.

Broker: The broker receives the Brief and validates live market conditions.

Successful Transaction: The user's outcome tests whether the recommendation path was useful.

Editorial Feedback: Broker notes, user behavior, validation questions, and transaction outcomes reveal gaps or strengths.

Commercial Knowledge: Rofo improves the graph, evidence, publishing, and recommendation models.

The flywheel works only if every stage feeds the next. Publishing cannot be detached from recommendations, and broker outcomes cannot be detached from knowledge improvement.

## 11. Revenue Opportunities

Revenue should fit naturally into the location decision workflow. Rofo should avoid designing a generic advertising platform.

### Broker Referrals

Natural fit because the broker executes the Location Brief.

Requirement: broker receives structured context and returns useful feedback.

### Premium Location Briefs

Natural fit for deeper advisory outputs, team collaboration, or broker-reviewed market validation.

Requirement: the free Brief must already demonstrate value.

### Contextual Commercial Sponsorships

Potential fit when tied to business needs and not disguised as recommendations.

Examples: moving, furniture, internet, architecture, construction, insurance, property management.

Rules:

- sponsorship must not influence district recommendations
- partner content should appear only where contextually useful
- recommendations must remain editorially independent

### Furniture

Fits after office environment and size become clearer.

### Architecture and Design

Fits when users need buildout, workplace planning, medical-office planning, restaurant design, or lab planning.

### Moving

Fits after a market path becomes active and timing is known.

### Internet and IT

Fits after a building search begins.

### Construction

Fits during broker execution and space validation.

### Insurance

Fits after business type, property type, and occupancy context are known.

### Property Management

Fits more naturally for owners, operators, and multi-location businesses than first-time tenant search.

## 12. Internal Linking

Internal linking should make Rofo's knowledge graph visible to users and search engines.

Every page should naturally connect to:

- Markets
- Property Types
- Business Types
- Business Scenarios
- Districts
- Representative Buildings
- Location Briefs or example Briefs

### Linking Rules

Market pages link to supported Property Type pages, canonical Districts, and representative Business Scenario pages.

Property Type pages link to district paths, archetype pages, and representative buildings.

Business Type pages link to scenarios, property-type pages, and recommended district examples.

Business Scenario pages link to example Location Briefs, districts, representative buildings, and the Business Profile entry.

District pages link to nearby/comparison districts, representative buildings, property-type fit, and archetype fit.

Representative Building pages link back to Districts, Commercial Ecosystems, Property Types, and related representative buildings.

Location Briefs link to the user's Best Fit districts, representative buildings, nearby alternatives, and broker next step.

### SEO and Navigation Value

A good internal link should serve both a user and search engine:

- user value: "Where should I go next to understand this decision?"
- search value: "How does this entity relate to Rofo's commercial-location knowledge?"

Do not add internal links just to increase link count. Links should mirror the commercial decision graph.

## Operating Rules

1. Every new geography should map to Region -> Market -> District.
2. Every new page should strengthen a recommendation, a Location Brief, or a durable explanation.
3. Every new recommendation model should identify its Business Profile inputs, supported districts, confidence states, and excluded dynamic market conditions.
4. Every Representative Building should explain a commercial environment, not advertise inventory.
5. Every Location Brief should be the canonical handoff object.
6. Every broker workflow should reference the Brief rather than duplicating it.
7. Every successful or failed handoff should create feedback for knowledge improvement.
8. Every revenue opportunity should support the user's location decision without influencing recommendations.

## Recommended Next Implementation Chapter

The next implementation chapter should be:

```text
Office Archetype Publishing and Recommendation Alignment
```

Scope:

- formalize reusable office Business Archetypes in structured data
- map San Francisco and Denver office districts to those archetypes
- create reviewed example Location Briefs for the initial archetypes
- define Publisher and EOS knowledge-completeness signals for archetype coverage
- preserve production recommendation behavior until QA approves model integration

This chapter is the highest-leverage next step because it connects publishing, Business Profile questions, recommendation models, Location Briefs, and SEO without requiring a broad UI redesign.

## Open Architectural Questions

1. Should Metro remain only a compatibility/reporting layer, or should Rofo publish user-facing Metro pages that resolve into canonical Markets?
2. Which Business Archetypes deserve global canonical IDs first?
3. How should broker feedback be captured without creating CRM complexity too early?
4. Which Location Briefs should be public, private, shareable, or indexable?
5. How much representative-building evidence is required before a Market + Property Type page is publishing-ready?
6. Should example Location Briefs be editorial artifacts, generated artifacts, or both?
7. How should Rofo separate sponsored partner opportunities from editorial recommendations in the UI?
8. What minimum evidence threshold should allow a new Market to appear in the Business Profile?
9. How should Rofo measure recommendation success before transaction data is available?
10. When should current listing inventory appear, and how should it avoid taking over the decision-support experience?
