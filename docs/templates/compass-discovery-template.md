# Compass Discovery Template

This template standardizes how Rofo evaluates a metro before adding it to Rofo Compass.

Compass Discovery is not page expansion. It is the research phase for deciding whether Rofo can produce credible, graph-backed Location Briefs for a commercial market.

## Purpose

Explain why this metro matters for Rofo Compass.

- What commercial decisions does this metro support?
- Which tenant profiles would benefit from better location intelligence?
- What would a useful Location Brief need to explain?
- What should not be modeled yet?

## Required Inputs

Review available Rofo data and editorial context.

- Existing city pages
- Existing district or neighborhood pages
- Existing comparison pages
- Representative building data
- Raw or historical building and listing data
- Existing Commercial Location Knowledge Graph nodes
- Search/autocomplete data
- Prior metro QA reports
- Broker or editorial notes, when available

Document which inputs were used and which were intentionally ignored.

## Evidence Hierarchy

Use evidence in this order:

1. Commercial geography and tenant decision patterns
2. Editorial and broker judgment
3. Existing Rofo district, city, and comparison structure
4. Existing representative buildings
5. Knowledge Graph fit and relationship needs
6. Historical Rofo building and listing inventory
7. Human review

Historical inventory is supporting evidence only. It may show where Rofo has had coverage, brokerage participation, or landlord participation. It does not prove commercial importance by itself.

## Editorial Review Checklist

For every proposed district or corridor, answer:

- Does this location improve recommendations?
- What business profile would Rofo route here?
- What nearby alternative should it be compared with?
- What tradeoffs should a business understand?
- What should be validated before a broker acts?
- Are there existing representative buildings that illustrate the environment?
- Is this a first-pass Compass node or a second-pass refinement?

Do not add a district only because it has page or listing volume.

## Knowledge Graph Recommendations

For each candidate node, document:

- Proposed name
- Proposed slug
- City and state
- Location type
- Primary commercial role
- Supported space types
- Best-fit businesses
- Strengths
- Tradeoffs
- Questions to validate
- Compare relationships
- Confidence level

Use qualitative fit only: `excellent`, `strong`, `good`, `limited`, or `unknown`.

## Representative Buildings

Use existing Rofo building or representative-building data only.

For each candidate, document:

- Building name
- Address
- District or corridor
- Property type fit
- Why it illustrates the market
- Source basis

Representative buildings illustrate environments. They do not imply availability.

## Comparison Relationships

List high-value tenant decision comparisons.

Each comparison should explain why a business would evaluate the two locations together.

Avoid low-value comparisons that only connect pages.

## Recommendation Impact

For each recommended node, state:

- What recommendation becomes better because this node exists?
- Which Search Profile scenario would use it?
- What Location Brief explanation would it support?
- What alternative would it help pressure-test?

If the answer is weak, keep the node out of the first Compass implementation.

## Implementation Planning

Break the implementation into:

- Must have nodes
- Should have nodes
- Nice to have nodes
- Must have comparison relationships
- Representative building candidates
- QA scenarios
- Documentation updates
- Coverage dashboard updates

Prefer a smaller graph that produces stronger recommendations.

## Compass Readiness Evaluation

Before recommending Compass Ready status, evaluate:

- Commercial geography
- Knowledge Graph nodes
- Space-type fit
- Compare relationships
- Representative buildings
- Questions to validate
- Recommendation Resolver compatibility
- Explainability quality
- Location Brief quality
- Recommendation QA results
- Editorial broker-style review

A metro is Compass Ready only when realistic business profiles receive recommendations that are believable, differentiated, explainable, defensible, and actionable.
