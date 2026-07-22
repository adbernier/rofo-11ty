# Commercial Building Intelligence

Commercial Building Intelligence is Rofo's structured editorial layer for representative commercial buildings.

It is not listing inventory, availability data, or a broker submission feed. It is the market teaching layer that explains why a building belongs on a shortlist, what it helps reveal about a district, and what a business should compare or validate before touring.

San Francisco is the first Gold Standard market using this system.

## Product Purpose

Representative buildings should help a business understand commercial geography:

- what a district feels like in practice
- which building formats define the market
- why companies choose one area instead of another
- what tradeoffs matter before touring
- which nearby buildings and districts deserve comparison

Commercial Building Intelligence becomes the source that district pages, representative building pages, Compass reasoning, future comparison pages, and future market guides consume.

Commercial Ecosystem Foundation v1 adds an ecosystem alignment layer. Representative buildings and Building Briefs may inherit ecosystem metadata from their associated district, or declare explicit metadata when a building represents a secondary ecosystem or a meaningful contrast. Use the canonical IDs in `_data/commercialEcosystemTaxonomy.js`; do not invent building-local ecosystem labels.

Representative Building Intelligence v2 adds a normalized operational layer for representative examples. Use `_data/representativeBuildingIntelligenceTaxonomy.js` for operational-characteristic IDs and representative-role IDs, and `docs/representative-building-intelligence.md` for authoring rules. This layer supports Publisher and future Building Brief authoring; it does not change public rendering by itself.

## Runtime Source

The runtime source is `_data/commercialBuildingIntelligence.js`.

The San Francisco source collection is documented in `docs/sf-canonical-representative-buildings.md`.

Current runtime exports:

- `schema`: versioned field groups
- `districts`: canonical San Francisco district objects
- `canonicalBuildings`: full editorial intelligence records
- `runtimeBuildings`: building-page-compatible records derived from the intelligence layer
- `byPath`: lookup by building page path
- `byDistrictPath`: canonical collection grouped by district
- `roleDescriptorsByDistrictPath`: district-page role labels
- `relationshipGraph`: building-to-building and building-to-district relationships
- `stats`: collection counts for QA

## Schema

Each canonical building supports these field groups.

### Identity

- `name`
- `address`
- `city`
- `state_abbr`
- `district`
- `canonicalDistrict`
- `secondaryDistricts`
- `buildingType`
- `primarySpaceType`
- `assetClass`
- `commercialEcosystem` where explicitly needed; otherwise inherit from the canonical district

`assetClass` distinguishes conventional `Commercial Asset` records from `District Anchor` records such as institutions, arenas, maker destinations, or other places that explain a district even when they are not standard office inventory.

### Editorial

- `editorialRole`
- `editorialReason`
- `representativeThemes`

Editorial roles include examples such as:

- District Icon
- Corporate Benchmark
- Creative Benchmark
- Life Science Benchmark
- Innovation Benchmark
- Executive Benchmark
- Historic Benchmark
- Neighborhood Anchor
- Adaptive Reuse Benchmark
- Production / Flex Benchmark
- Value Benchmark
- Campus Benchmark

### Business

- `businessFit`
- `idealCompanyProfiles`
- `companySizes`

These fields describe broad fit patterns. They are editorial guidance, not deterministic matching.

### Experience

- `workplaceCharacter`
- `neighborhoodCharacter`
- `executivePresence`
- `innovationScore`

The qualitative scores are intentionally not numeric. They support user-facing explanation and future Compass context without implying precision that Rofo has not validated.

### Operations

- `transit`
- `parking`
- `amenities`
- `foodEnvironment`

These fields explain practical daily-use considerations. They should remain cautious and district/building specific.

### Tradeoffs

- `strengths`
- `limitations`
- `businessesThatShouldCompare`
- `nearbyAlternatives`

Every representative building should communicate at least one real tradeoff. Buildings should not read like advertisements.

Operational characteristics should be used carefully. A building can be representative of an environment where loading, parking, lab, food, medical, yard, or power validation matters without claiming that the specific building has a verified feature. Treat those signals as validation focus unless the source record supports them as property facts.

### Validation

- `questionsToValidate`
- `tourObservations`

Validation questions should help a business know what to confirm before adding a building to a shortlist.

### Relationships

- `nearbyBuildings`
- `comparisonBuildings`
- `relatedDistricts`

These relationships form the foundation for future building comparison pages, district transitions, and Compass explainability.

### Quality

- `sourceConfidence`
- `publicationStatus`
- `sourceBasis`

`publicationStatus` controls whether a canonical record becomes a runtime representative building page. `sourceConfidence` should reflect the strength of public documentation and editorial validation.

## Migration Approach

The W1 migration does not delete legacy representative building pages.

The current approach is:

1. Keep existing representative pages.
2. Promote W0 canonical buildings into `_data/commercialBuildingIntelligence.js`.
3. Project each canonical record into `runtimeBuildings`.
4. Merge `runtimeBuildings` into `_data/buildings.js` after existing representative expansions.
5. Preserve existing hero images, legacy source metadata, and semantic building identifiers where a page already exists.
6. Let generated building pages inherit the new intelligence fields.
7. Let San Francisco district pages consume the canonical district collection and role descriptors.

This creates one intelligence source while preserving current URLs and page generation.

## District Integration

San Francisco district pages now receive:

- `commercial_building_intelligence`
- `commercial_building_relationships`
- canonical `representative_buildings` where the collection exists
- role descriptors from the intelligence layer

The district page should treat these buildings as part of district intelligence, not an isolated list.

## Representative Building Pages

Representative building pages consume the derived runtime fields already used by the page template:

- `building_description`
- `best_for`
- `less_suitable_for`
- `strengths`
- `tradeoffs`
- `validation_questions`
- `nearby_alternatives`
- `related_buildings`
- `related_handbook_topics`
- `district_relationship`

The original canonical record is also available as `commercial_building_intelligence` for future template evolution.

## Compass Integration

W1 does not change Compass scoring or recommendation logic.

The new intelligence layer is ready for Compass to reference:

- flagship buildings by district
- editorial roles
- validation questions
- representative themes
- nearby alternatives
- comparison buildings

Future integration should surface this context only where it improves the explanation of a recommendation.

## Future Comparison Architecture

The `relationshipGraph` export is the first version of the future comparison foundation.

Future building comparison pages can use:

- `comparisonBuildings` for direct shortlist alternatives
- `nearbyBuildings` for physical proximity
- `relatedDistricts` for district transitions
- `editorialRole` to compare different market functions
- `representativeThemes` to compare building character

Future comparison pages should answer:

- Why compare these buildings?
- Which business profile fits each one?
- What district tradeoff does each building represent?
- What should be validated before touring?

Do not build comparison pages from raw proximity alone. A comparison should teach a decision.

## Editorial Workflow

Recommended workflow:

1. Curate a market collection editorially.
2. Assign canonical district and secondary district relationships.
3. Separate commercial assets from district anchors.
4. Assign one primary editorial role per building.
5. Add representative themes and a concise editorial reason.
6. Add business fit, operational considerations, tradeoffs, and validation questions.
7. Add comparison and nearby-building relationships.
8. Assign `sourceConfidence`.
9. Publish by setting `publicationStatus` to `published`.
10. Confirm generated pages do not imply availability.

## Quality Rules

- Do not fabricate availability.
- Do not turn representative buildings into listings.
- Do not use landlord marketing language.
- Do not add buildings solely to increase count.
- Prefer fewer, stronger buildings over complete but weak coverage.
- Keep district anchors explicit.
- Keep relationship data editorial, not just geographic.

## Future Recommendations

- Add structured source notes per building.
- Add a confidence model by field, not only by building.
- Expand district-specific validation questions.
- Add building attributes that can connect to user requirements without changing Compass scoring.
- Use the relationship graph to support future building comparison pages.
- Add Gold Standard market QA commands for duplicate IDs, missing pages, and district coverage.
