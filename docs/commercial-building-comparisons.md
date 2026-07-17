# Commercial Building Comparisons

Commercial Building Comparisons are decision pages generated from Rofo's Commercial Building Intelligence layer.

They are not specification tables, amenity checklists, or availability pages. A comparison exists only when it helps a business understand a meaningful location or building tradeoff.

## Product Question

Every comparison should answer:

Which option is a better fit for this business, and why?

The page should explain:

- when to choose Building A
- when to choose Building B
- when to tour both
- what tradeoffs matter
- what to validate before shortlisting either option
- what to compare next

Comparisons should never declare a universal winner.

## Runtime Source

The runtime source is `_data/commercialBuildingComparisons.js`.

The comparison engine consumes:

- `_data/commercialBuildingIntelligence.js`
- editorial roles
- representative themes
- business fit
- workplace and neighborhood character
- tradeoffs
- validation questions
- comparison-building relationships
- related district relationships

The public template is `pages/commercial-real-estate/building-comparison.njk`.

## URL Pattern

Public pages use:

`/commercial-real-estate/building-comparison/[comparison-slug]/`

Examples:

- `/commercial-real-estate/building-comparison/555-california-vs-101-california/`
- `/commercial-real-estate/building-comparison/salesforce-tower-vs-181-fremont/`
- `/commercial-real-estate/building-comparison/650-townsend-vs-888-brannan/`

## Schema

Each comparison supports:

- `headline`
- `summary`
- `whoBuildingAIsBestFor`
- `whoBuildingBIsBestFor`
- `sharedStrengths`
- `keyDifferences`
- `workplaceCharacterComparison`
- `districtContext`
- `businessFitComparison`
- `executivePresenceComparison`
- `innovationComparison`
- `transitComparison`
- `amenityComparison`
- `tradeoffs`
- `tourValidationQuestions`
- `relatedAlternatives`
- `recommendedNextComparisons`

Supported comparison types:

- `building_vs_building`
- `building_vs_building_type`
- `building_vs_district`
- `district_anchor_vs_commercial_asset`

The first public launch primarily uses `building_vs_building`, with one `building_vs_district` example to prove the architecture.

## Relationship Model

The comparison module exports `relationshipGraph` with:

- `primaryComparisons`
- `secondaryComparisons`
- `bySubjectPath`
- `comparisonTypes`
- `relationTypes`

Relationship labels include:

- primary
- secondary
- nearby alternative
- natural upgrade path
- more affordable alternative
- creative alternative
- executive alternative
- district transition
- district anchor

These relationships are intended for future:

- SEO landing pages
- Compass explanations
- broker tools
- AI-assisted location guidance
- building shortlist workflows

## Editorial Workflow

1. Confirm both subjects exist in Commercial Building Intelligence.
2. Confirm the comparison teaches a real decision.
3. Assign a relation type.
4. Let the engine derive shared strengths, key differences, district context, validation questions, and alternatives.
5. Add only minimal editorial override fields if the derived output is not specific enough.
6. Validate that the page does not imply current availability.
7. Validate that both subjects have useful next comparisons or related alternatives.

## Quality Rules

- Do not compare buildings solely because they are near each other.
- Do not compare buildings on square footage alone.
- Do not fabricate availability, pricing, rankings, or tenant claims.
- Do not declare a winner.
- Do not duplicate building-page editorial copy in the template.
- Use the intelligence layer as the source of truth.

## Future Expansion

Future versions should add:

- comparison-specific editorial override support
- field-level source confidence
- automatic QA for broken comparison subject paths
- connection from representative building pages into relevant comparisons
- connection from Compass recommendation explanations into relevant comparisons
- building type comparison pages such as tower vs adaptive reuse or life-science campus vs creative office
- district anchor vs commercial asset comparisons where the anchor explains market fit but is not inventory
