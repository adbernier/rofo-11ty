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

## Adding a New Location

1. Confirm the city or district already exists in Rofo's public geography data.
2. Add a node to `_data/locationKnowledgeGraph.js`.
3. Use `unknown` for attributes that have not been researched.
4. Add at least one relevant `spaceTypeFit` entry.
5. Add `relationships.compareWith` only when the comparison is real and useful.
6. Run:

```bash
node --check _data/locationKnowledgeSchema.js
node --check _data/locationKnowledgeGraph.js
node --check js/recommendation-context.js
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
