# Commercial Ecosystem Data Model v1

This document translates the Commercial Ecosystem Framework into repository-owned data. It is additive: it does not change recommendation ranking, Search Profile questions, Publisher readiness scores, Building Brief templates, or public page behavior.

## Taxonomy Ownership

The canonical machine-readable taxonomy lives in:

`_data/commercialEcosystemTaxonomy.js`

Representative Building operational intelligence extends the ecosystem taxonomy through:

`_data/representativeBuildingIntelligenceTaxonomy.js`

and normalized build-time records in:

`_data/representativeBuildingIntelligence.js`

It defines:

- top-level commercial ecosystems
- ecosystem subtypes
- business activities
- business archetypes
- operational signals
- representative-building operational characteristics and roles, through the Representative Building Intelligence taxonomy

Do not scatter ecosystem strings through templates or metro data. New IDs should be added to the taxonomy first, then referenced from graph, building, Publisher, or QA code.

## Top-Level Ecosystems

The current peer ecosystems are:

- `office`
- `industrial_flex`
- `retail`
- `medical`
- `life_science`
- `hospitality`
- `special_purpose`

Office is not the default. If a district is office-oriented, say so explicitly. If a district is mixed or thinly understood, use conservative metadata and flag review needs rather than forcing an office label.

## Subtypes

Every subtype maps to exactly one top-level ecosystem. Examples:

- `downtown_office` -> `office`
- `small_bay_industrial` -> `industrial_flex`
- `showroom_flex` -> `industrial_flex`
- `medical_office` -> `medical`
- `life_science_office` -> `life_science`
- `food_beverage` -> `hospitality`
- `childcare` -> `special_purpose`

Subtypes should describe how the ecosystem is expressed in a district or building. They are not SEO labels and should not be exposed raw to users without editorial translation.

## Business Activities

Business activities describe what a company does in its space. Examples:

- `knowledge_work`
- `client_meetings`
- `healthcare_delivery`
- `research`
- `light_manufacturing`
- `storage`
- `shipping`
- `service_dispatch`
- `customer_showroom`
- `walk_in_service`
- `food_production`

Activities connect business needs to ecosystem fit without requiring users to choose commercial real estate terminology.

## Business Archetypes

Business archetypes are understandable business types, not NAICS codes. Examples:

- `law_firm`
- `startup`
- `medical_practice`
- `general_contractor`
- `cabinet_shop`
- `distributor`
- `ecommerce_fulfillment_business`
- `research_company`
- `childcare_provider`

Archetypes provide starting signals. They should not make rigid assumptions about size, budget, tenant credit, or exact building requirements unless the repository has supported data.

## District Schema

District nodes in `_data/locationKnowledgeGraph.js` expose additive ecosystem metadata:

```js
commercialEcosystem: {
  primary: "office",
  secondary: ["retail"],
  subtypes: ["downtown_office", "executive_office"],
  activities: ["knowledge_work", "client_meetings"],
  archetypes: ["law_firm", "financial_services_firm"],
  confidence: "high",
  reviewNotes: []
}
```

Rules:

- published or recommendation-active district nodes need a valid `primary`
- `secondary` ecosystems must not duplicate `primary`
- subtypes must belong to either the primary ecosystem or a declared secondary ecosystem
- activities and archetypes must exist in the taxonomy
- mixed-use districts may include secondary ecosystems
- thin or uncertain classifications should use `confidence: "review_required"` and a short review note

Current graph metadata is generated conservatively from existing `spaceTypeFit` signals with explicit overrides for known high-confidence districts. This preserves backward compatibility while creating a consistent reporting layer.

## Building Inheritance

Representative buildings and Building Briefs may either declare ecosystem metadata directly or inherit it from their associated district.

Inheritance is acceptable when:

- the building is a normal expression of the district's primary commercial ecosystem
- the building's use does not contradict the district identity
- the record has a valid district association

Declare explicit building metadata when:

- the building is a mixed-use contrast inside the district
- the building represents a secondary ecosystem
- the building should support future ecosystem-specific Building Brief or recommendation behavior

Representative Building Intelligence v2 adds a normalized intelligence layer for each representative record. It tracks primary ecosystem, subtype, representative role, business activities, business archetypes, operational characteristics, representative reasons, tradeoffs, validation focus, confidence, and provenance. Explicit Building Brief editorial content remains the highest editorial layer; the new intelligence record is a planning and QA foundation, not a public rendering change.

Full rules are documented in `docs/representative-building-intelligence.md`.

Publisher may define metro-specific target representative roles and operational categories in `data/publisher-rules.js` when the global taxonomy is broader than the commercial environments a metro currently needs to represent. This prevents unsupported roles, such as food production, showroom flex, or office roles not evidenced in a specific metro, from keeping a Representative Building Foundation open when the graph evidence does not establish them as required. These targets are explicit editorial planning metadata; they do not remove roles from the canonical taxonomy or change recommendation rankings.

## Publisher Reporting

Publisher now includes `ecosystemCoverage` in the generated metro analysis snapshot. It reports:

- districts by primary ecosystem
- districts where an ecosystem appears as secondary
- recommendation-active district count by ecosystem
- Representative Building count by ecosystem
- Building Brief count by ecosystem
- subtype, activity, and archetype coverage
- missing ecosystems
- review-required district classifications
- underrepresented ecosystems
- Representative Building Intelligence coverage by ecosystem
- representative roles, operational characteristics, operational categories, and review-required building counts

This reporting is not part of Publisher readiness scoring in v1. Strong office coverage should be visible separately from weak industrial/flex, medical, retail, or life-science coverage.

## Ecosystem Readiness

Publisher now adds two additive readiness dimensions beside the existing Publisher score:

- `geographicReadiness`
- `ecosystemReadiness`

Geographic Readiness describes whether the metro has enough district, comparison, recommendation, and publishing foundation to support expansion work.

Ecosystem Readiness describes whether the metro represents its relevant commercial ecosystems with enough depth across:

- district coverage
- recommendation-active district coverage
- Representative Buildings
- Building Briefs
- subtype coverage
- business archetype coverage
- business activity coverage
- editorial review status

Readiness states are deterministic:

- `developed`
- `strong`
- `partial`
- `thin`
- `missing`
- `not_applicable`
- `review_required`

These are descriptive gates, not a replacement for the existing Publisher score.

## Ecosystem Relevance and Strategic Priority

Metro relevance is explicitly configured in `data/publisher-rules.js`. A missing ecosystem is not automatically treated as unimportant.

Relevance values:

- `core`
- `important`
- `secondary`
- `specialized`
- `not_applicable`
- `review_required`

Strategic priority is also centralized in Publisher rules. The initial strategic order is:

1. `industrial_flex`
2. `office`
3. `medical`
4. `life_science`
5. `retail`
6. `special_purpose`
7. `hospitality`

Industrial/flex receives explicit protection because Rofo historically serves many operators whose needs are not well represented by office-first brokerage content: contractors, trades, makers, distributors, wholesalers, importers, light manufacturers, food producers, e-commerce operators, and equipment-service companies.

## Concentration Analysis

Publisher now reports `ecosystemBalance` for each metro. It identifies patterns such as:

- balanced
- specialized
- thin across all ecosystems
- Representative Building concentration
- Building Brief concentration

Concentration is not automatically bad. It becomes a planning concern when a strategically relevant ecosystem remains missing or thin while another ecosystem, usually office, receives most of the building or Building Brief depth.

## Expansion Planner Awareness

The Publisher Expansion Planner includes ecosystem readiness in generated metro plans. It may flag:

- absent industrial/flex coverage
- office-heavy coverage
- review-required ecosystem classifications
- thin representative-building coverage in important ecosystems
- Building Brief concentration
- missing core ecosystem layers

Planner priority scoring for the existing queue is unchanged. The planner now also generates a separate `recommendedEcosystemSprint` so ecosystem work can outrank a normal Building Brief migration queue when the metro is geographically mature but commercially incomplete.

## Validation

Run:

```bash
node scripts/qa-commercial-ecosystem-foundation.js
```

The QA validates:

- unique taxonomy IDs
- subtype-to-ecosystem mapping
- activity and archetype references
- district ecosystem references
- secondary ecosystem duplication
- representative-building inheritance
- Building Brief inheritance
- deterministic Publisher ecosystem output

Hard failures indicate invalid data. Warnings indicate editorial review needs, such as mixed-use districts with only one declared ecosystem or missing industrial/flex depth.

## Backward Compatibility

Commercial ecosystem metadata is additive. It must preserve:

- district IDs
- recommendation outcomes
- Search Profile schema
- Building Brief URLs
- representative-building eligibility
- Location Brief persistence
- Publisher readiness scores
- Cloudflare runtime filesystem independence

## Future Phases

Phase 2: Add ecosystem-aware Publisher scoring while keeping geography and ecosystem coverage separate.

Phase 3: Let the Expansion Planner prioritize missing ecosystems and balanced metro sprints.

Phase 4: Evolve Search Profile around business archetypes and activities.

Phase 5: Map archetypes and activities into recommendation inputs before ranking districts.

Phase 6: Add ecosystem explainability to recommendations and Location Briefs.

Phase 7: Explore user-facing ecosystem guides and comparison pages.
