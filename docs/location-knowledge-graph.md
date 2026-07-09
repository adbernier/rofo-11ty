# Rofo Commercial Location Knowledge Graph

The Commercial Location Knowledge Graph is the structured data layer that powers Rofo Location Briefs and future recommendation logic.

It is not a listings feed, scoring model, or AI system. It stores durable commercial-location knowledge: how a city or district behaves for different business uses, what tradeoffs matter, and which nearby markets should be compared.

## Files

- `_data/locationKnowledgeSchema.js` defines enums, canonical attribute keys, and a lightweight validator.
- `_data/locationKnowledgeGraph.js` contains seeded city and district nodes.
- `_data/recommendationProfiles.js` remains as a legacy fallback while the graph matures.
- `js/recommendation-context.js` resolves Search Profile context into a Location Brief using the knowledge graph first.

## Node Shape

Each location node should include:

- `slug`
- `label`
- `type`: `city` or `district`
- `city`
- `state`
- `path`
- `confidence`: `high`, `medium`, or `expert_guided`
- `spaceTypeFit`
- `attributes`
- `retailAttributes`
- `industrialAttributes`
- `bestFor`
- `tradeoffs`
- `strengths`
- `questionsToValidate`
- `relationships.compareWith`

City nodes may also include `marketPath`, an ordered list of district slugs Rofo would compare first for a Location Brief.

## Space-Type Fit

Use `spaceTypeFit` to describe how a location works for different users:

- `office`
- `retail`
- `industrial`
- `warehouse`
- `distribution`
- `manufacturing`
- `flex`
- `r_and_d`
- `medical`
- `life_science`
- `restaurant`
- `showroom`

Fit values are qualitative:

- `excellent`
- `strong`
- `good`
- `limited`
- `unknown`

Each fit should explain:

- `summary`: why the location fits that use
- `bestFor`: business types that naturally fit
- `tradeoffs`: what a tenant should verify or watch for

## Attribute Groups

General business/location attributes cover office and mixed-use decisions:

- transit
- parking
- walkability
- freewayAccess
- executiveImage
- customerAccess
- expansionFlexibility
- talentAccess
- visibility
- amenities
- costPosition
- creativeEnvironment
- corporateEnvironment

Retail attributes focus on customer-facing decisions:

- footTraffic
- customerParking
- coTenancy
- streetPresence
- daytimePopulation
- eveningWeekendActivity
- signageVisibility

Industrial attributes focus on operational decisions:

- truckAccess
- highwayAccess
- lastMileAccess
- portAirportAccess
- clearHeight
- loading
- yard
- power
- zoningFlexibility
- laborAccess
- parkingTrailer
- outdoorStorage

Use `unknown` when a field is not applicable or not yet researched. Do not invent certainty.

## Relationships

Use `relationships.compareWith` to explain why another market should be considered.

Relationship types include:

- similar
- lower_cost_alternative
- better_transit
- better_parking
- more_executive
- more_growth_oriented
- more_creative
- better_truck_access
- better_loading
- better_last_mile
- better_retail_visibility

Relationships should be tenant-decision paths, not generic geography links.

## Questions To Validate

`questionsToValidate` stores the follow-up questions a broker or advisor would ask before turning a Location Brief into a live market investigation.

Good questions are location-specific and help refine the recommendation:

- Mission Bay: "Is proximity to UCSF or life-science partners important?"
- Jackson Square: "Do you need smaller floorplates or room to expand?"
- North San Jose: "Do you need flex, R&D, or light production capability?"
- Hayward Industrial: "What truck access and loading requirements are non-negotiable?"

Avoid generic intake questions that could apply anywhere unless they are especially important for the location. These prompts are intended to help future Location Brief refinement, not lengthen the initial Search Profile.

## Knowledge Card Authoring Standards

Every enriched node should read like broker judgment translated into structured data. A Knowledge Card should answer:

- Who is this location best for?
- Which space types fit here?
- What are the tradeoffs?
- What should a business validate before committing?
- What nearby or comparable places should be considered, and why?

Use concrete commercial language:

- Office cards should discuss transit, executive image, client access, talent access, expansion room, parking, and amenity environment.
- Retail cards should discuss foot traffic, co-tenancy, customer parking, street presence, daytime population, evening/weekend activity, and signage.
- Industrial cards should discuss truck access, highway access, loading, yard, power, zoning flexibility, labor access, trailer parking, and operational fit.

Do not add fake precision, numerical scores, rent claims, or live availability claims. Use `unknown` when a field has not been researched or does not apply.

### Example Office District

Downtown Palo Alto is useful for companies that value executive access, Caltrain, walkability, and Silicon Valley credibility. Its tradeoffs include cost sensitivity and limited large contiguous options.

### Example Retail District

Downtown San Mateo is useful for restaurants and service retail because of downtown foot traffic, co-tenancy, and surrounding office/residential demand. Parking and storefront visibility still need block-by-block review.

### Example Industrial District

Hayward Industrial is useful for regional distribution, service industrial, light manufacturing, and contractor operations. Truck access, loading, yard, trailer parking, power, and building condition must be validated before narrowing buildings.

## Adding a New Location

1. Confirm the city or district already exists in Rofo's public geography data.
2. Add a node to `_data/locationKnowledgeGraph.js`.
3. Use `unknown` for attributes that have not been researched.
4. Add at least one relevant `spaceTypeFit` entry.
5. Add `relationships.compareWith` only when the comparison is real and useful.
6. Add `questionsToValidate` that reflect the location's real decision points.
7. Run:

```bash
node --check _data/locationKnowledgeSchema.js
node --check _data/locationKnowledgeGraph.js
node --check js/recommendation-context.js
node --check scripts/check-location-knowledge-coverage.js
node scripts/check-location-knowledge-coverage.js
npm run build
```

## How This Powers Location Briefs

The Search Profile captures only the minimum intake:

- location
- space type
- size

The Location Brief resolver then:

1. Reads the submitted Search Profile context.
2. Looks up the selected location in the knowledge graph.
3. Builds a `market_path`, `single_starting_point`, or `expert_guided` response.
4. Renders qualitative fit, tradeoffs, comparison markets, and next evaluation steps.

Future recommendation work should improve the resolver, not bypass this graph.

## Expansion Rule

Every future metro expansion should populate this knowledge layer as part of completion. A page is not recommendation-ready until its commercial identity, space-type fit, attributes, tradeoffs, and comparison relationships are represented here.

At minimum, every metro expansion should add Knowledge Cards for its strongest city and district pages, plus any industrial, retail, or office submarkets that are likely to appear in recommendations.

## Recommendation-Ready Metro Expansion Standard

Pages alone are not enough. A metro is recommendation-ready only when users can enter through public geography pages, autocomplete, or Recommendation Prompt context and receive a credible Location Brief instead of a generic fallback.

For every district added or materially enriched during a metro expansion, confirm:

- the city or district exists in Rofo's public geography model
- the location can appear in `/data/location-search.json`
- Recommendation Prompt links can carry city, district, state, space type, and source context into `/find-locations/`
- a Knowledge Card exists in `_data/locationKnowledgeGraph.js`
- `spaceTypeFit` reflects the location's real office, retail, industrial, warehouse, flex, medical, or R&D use cases
- general business attributes are populated with researched judgment or `unknown`
- retail attributes are populated for customer-facing districts
- industrial attributes are populated for warehouse, manufacturing, logistics, flex, and R&D districts
- `bestFor`, `tradeoffs`, `questionsToValidate`, and `relationships.compareWith` explain how a tenant should evaluate the market
- representative buildings are connected only when Rofo already has reliable building paths
- relationship slugs resolve in `scripts/check-location-knowledge-coverage.js`

Office, retail, and industrial districts require different judgment:

- Office districts should emphasize transit, parking, talent access, client access, executive image, amenities, expansion flexibility, and cost position.
- Retail districts should emphasize foot traffic, co-tenancy, customer parking, street presence, evening/weekend activity, and signage visibility.
- Industrial districts should emphasize truck access, highway access, last-mile access, port or airport access, loading, yard, power, trailer parking, outdoor storage, zoning flexibility, and labor access.

The expansion process should make Rofo smarter. If a location cannot support a credible Knowledge Card yet, keep the Location Brief honest with `expert_guided` confidence rather than inventing recommendation depth.

The coverage script also reports metros where public page coverage exists but Knowledge Graph nodes are missing. Treat those as planning gaps, not build failures. They indicate that users can discover the geography, but Rofo cannot yet produce a graph-backed Location Brief for that metro.

## Recommendation QA

Recommendation Ready metros should have an internal QA pass before they are treated as fully validated. QA should use realistic business profiles and run them through the same resolver that powers Location Briefs.

## Recommendation Explainability Layer

The Recommendation Explainability Layer turns graph-backed recommendations into advisor-style reasoning. It explains why a location was selected, why alternatives remain relevant, what user priorities appear to matter, what tradeoffs should be understood, and what should be validated before acting.

The layer uses only existing graph and profile data:

- `spaceTypeFit`
- strengths
- tradeoffs
- best-for guidance
- general, retail, and industrial attributes
- `questionsToValidate`
- comparison relationships
- user profile priorities when available

Rofo should avoid public numeric recommendation scores at this stage. Numeric scores can create false precision and make the product feel like a black-box matching tool. The user-facing experience should explain commercial reasoning in plain language: fit, tradeoffs, alternatives, and validation questions.

Each generated recommendation should be able to provide:

- `selectionRationale`
- `matchedPriorities`
- `tradeoffSummary`
- `alternativeRationale`
- `validationFocus`

Alternatives should not be listed as generic backups. They should explain what assumption could make the alternative more relevant, such as commute pattern, parking, cost sensitivity, image, truck access, or customer visibility.

Each QA scenario should document:

- business profile
- selected location
- space type and size
- practical priorities
- expected recommendation direction
- generated primary recommendation
- secondary recommendations
- strengths and tradeoffs surfaced
- validation questions surfaced
- explanation quality
- graph weaknesses exposed

The goal is not to prove that Rofo has the perfect answer. The goal is to confirm that recommendations are differentiated, explainable, defensible, and actionable. If very different businesses receive the same market path without a clear reason, or if a plausible recommendation cannot explain why it was chosen over alternatives, the metro should remain in enhancement or review status.

Sacramento's pilot QA fixtures live in `data/recommendation-qa/sacramento-scenarios.json`. The generated internal report lives at `docs/recommendation-qa/sacramento-pilot.md`.
