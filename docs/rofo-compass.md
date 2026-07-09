# Rofo Compass

Rofo Compass is the Commercial Location Intelligence Engine inside Rofo.

It is the internal platform that turns commercial geography, broker judgment, business requirements, and validation questions into explainable Location Briefs.

Rofo Compass is not a listing search product. It is the intelligence layer that helps Rofo answer a harder question:

Where should this business begin its commercial real estate search, and why?

## Platform Hierarchy

Rofo

↓

Rofo Compass

Commercial Location Intelligence Engine

↓

Commercial Location Knowledge Graph

↓

Recommendation Resolver

↓

Explainability Layer

↓

Location Brief Generator

↓

Recommendation QA

## Commercial Location Intelligence Engine

The Commercial Location Intelligence Engine is the system that converts commercial location knowledge into advisory output.

It combines:

- structured location knowledge
- business requirements
- space-type fit
- comparison relationships
- tradeoffs
- validation questions
- Location Brief presentation
- internal QA

The engine should never feel like a black box. Every recommendation should be explainable using data stored in the platform.

## Commercial Location Knowledge Graph

The Commercial Location Knowledge Graph is the knowledge layer behind Rofo Compass.

It stores commercial location judgment, not just geography.

Each node can include:

- city or district identity
- space-type fit
- business attributes
- retail attributes
- industrial attributes
- strengths
- best-for guidance
- tradeoffs
- comparison relationships
- market paths
- validation questions

The graph stores reasons.

The resolver queries those reasons.

## Evidence Hierarchy

Rofo Compass should combine multiple evidence sources before treating a commercial location as meaningful.

Recommended evidence hierarchy:

1. Commercial geography and tenant decision patterns
2. Editorial and broker judgment
3. Existing Rofo city, district, and comparison structure
4. Existing representative buildings
5. Commercial Location Knowledge Graph fit and relationship needs
6. Historical Rofo building and listing inventory
7. Human review

Compass does not infer commercial importance from historical Rofo inventory alone.

Historical listings and buildings can reflect:

- brokerage participation
- landlord participation
- historical Rofo coverage
- data availability
- prior listing activity

They are supporting evidence. They are not proof that a district should become a Compass node, that a building is representative, or that a market path is commercially sound.

Compass Discovery should use historical inventory to ask better questions, not to automate judgment. A location becomes part of Rofo Compass only when commercial geography, editorial review, representative environments, comparison relationships, and Location Brief value support it.

## Recommendation Resolver

The Recommendation Resolver turns a Search Profile into a market path.

It uses:

- selected location
- space type
- size
- optional priorities
- Knowledge Graph fit
- comparison relationships

The resolver should return qualitative recommendations, not public numeric scores.

Supported output modes:

- `market_path`
- `single_starting_point`
- `expert_guided`

## Explainability Layer

The Explainability Layer explains the resolver output.

It should answer:

- why this location was recommended
- which priorities matched
- what tradeoff matters most
- why alternatives are still relevant
- what should be validated next

The current explainability fields are:

- `selectionRationale`
- `matchedPriorities`
- `tradeoffSummary`
- `alternativeRationale`
- `validationFocus`

Rofo avoids public numeric recommendation scores because they imply false precision. Compass should explain judgment in plain language.

## Location Brief Generator

The Location Brief Generator turns Compass output into a customer and broker-facing document.

The Location Brief is the product artifact.

It should include:

- Search Profile
- Recommended Market Path
- decision explanation
- tradeoffs
- comparison markets
- validation questions
- user priorities
- notes
- expert review request

Every future feature should make the Location Brief more valuable.

## Recommendation QA

Recommendation QA validates that a metro is producing useful advisory output.

QA scenarios should test realistic business profiles and confirm that recommendations are:

- differentiated
- explainable
- defensible
- actionable

QA should verify:

- believable primary recommendation
- logical alternatives
- meaningful tradeoffs
- useful validation questions
- explanation quality
- no unsupported market claims

Sacramento is the pilot QA standard.

San Diego is the first Compass Discovery-to-Compass Ready example. It was promoted only after graph implementation, QA, editorial broker-style review, explainability calibration, and representative-building review using existing Rofo building paths.

## Compass Ready

A metro is Compass Ready when Rofo Compass can produce credible Location Briefs for realistic business profiles in that market.

Compass Ready requires more than page coverage.

It requires:

- public geography coverage
- Knowledge Graph nodes
- comparison relationships
- market paths
- space-type fit
- validation questions
- resolver compatibility
- explainability
- Recommendation QA
- Location Brief support

## Metro Maturity

Metros mature over time.

Typical stages:

1. Public page coverage exists.
2. Priority city and district nodes are added to the Knowledge Graph.
3. Space-type fit and attributes are authored.
4. Comparison relationships and market paths are created.
5. Location Brief output becomes graph-backed.
6. Explainability fields are generated.
7. Recommendation QA validates realistic scenarios.
8. The metro becomes Compass Ready.

The Rofo Compass Coverage dashboard measures this maturity.

## Product Rule

Every Compass feature should answer one question:

Does this make the Location Brief more useful, more explainable, or more defensible?

If not, reconsider whether it belongs in Rofo Compass.
