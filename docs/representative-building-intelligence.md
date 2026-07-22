# Representative Building Intelligence v2

Representative Buildings are structured examples of how a commercial ecosystem operates in a district. They are not listings, availability claims, tenant rosters, or automatic Building Briefs.

The v2 model connects:

Business Archetype -> Business Activities -> Operational Requirements -> Commercial Ecosystem -> District -> Representative Building -> Building Brief -> Live Market Investigation.

## Data Ownership

Canonical operational and role metadata lives in:

- `_data/representativeBuildingIntelligenceTaxonomy.js`
- `_data/representativeBuildingIntelligence.js`

The taxonomy is repository-owned and uses stable IDs. Do not scatter free-form operational labels across district, building, Publisher, or recommendation code.

## Operational Characteristics

Operational characteristics describe the environment a building helps users understand. They are not proof that a specific available suite has the feature.

Categories:

- `access_loading`
- `parking_vehicles`
- `configuration`
- `infrastructure`
- `market_presence`
- `location_workforce`
- `outdoor_special_use`

Each characteristic defines:

- ID and label
- category
- applicable ecosystems and subtypes
- related business activities and archetypes
- whether the signal is commonly observable
- whether it normally requires validation

Examples:

- `grade_level_loading`
- `service_vehicle_parking`
- `office_warehouse_mix`
- `lab_infrastructure`
- `showroom_frontage`
- `freeway_access`
- `contractor_yard`

Do not treat taxonomy compatibility as verified building evidence. Loading, power, yard access, lab infrastructure, food infrastructure, medical compatibility, permitted uses, and similar fields require source support before they are stated as facts.

## Representative Roles

Representative roles explain why a property belongs in the collection. Roles are more specific than ecosystem IDs and reusable across metros.

Examples:

- `small_bay_service_environment`
- `flex_business_park`
- `contractor_service_cluster`
- `warehouse_distribution_environment`
- `light_manufacturing_environment`
- `downtown_class_a_office`
- `creative_office_environment`
- `medical_office_environment`
- `research_lab_environment`
- `neighborhood_service_retail`

Each role defines compatible ecosystem, compatible subtypes, expected activity patterns, common operational characteristics, and editorial purpose.

## Intelligence Schema

The normalized record exposes:

```js
{
  buildingId,
  name,
  address,
  path,
  city,
  state,
  districtSlug,
  districtName,
  buildingBriefStatus,
  commercialIntelligence: {
    primaryEcosystem,
    ecosystemSubtypes,
    representativeRole,
    businessActivities,
    businessArchetypes,
    operationalCharacteristics,
    representativeReasons,
    tradeoffs,
    validationFocus,
    confidence,
    provenance,
    reviewRequired
  },
  operationalCharacteristicProfile
}
```

The hand-authored source can stay smaller. `_data/representativeBuildingIntelligence.js` derives a normalized planning record from the location graph, canonical building records, Commercial Building Intelligence, district ecosystem metadata, and the role taxonomy.

## Inheritance

Representative Buildings may inherit:

- district primary ecosystem
- district secondary ecosystem context
- district activities and archetypes

They do not automatically inherit every district subtype or operational characteristic. Building-specific metadata and representative role evidence override district inference. Mixed-use examples can be classified by the building's editorial role when that role is clearer than the district primary ecosystem.

Building Brief inheritance order:

Canonical Building -> Representative Building Intelligence -> Building Brief Explicit Editorial Content.

Building Brief templates do not render the new taxonomy in v2. The data is available for Publisher, QA, and future Brief authoring.

## Confidence and Provenance

Confidence states:

- `verified_property_fact`
- `editorially_supported`
- `district_inferred`
- `taxonomy_inferred`
- `review_required`

Provenance records whether the value came from explicit building intelligence, a source representative-building record, a canonical building record, district metadata, or role taxonomy.

Archetype assignments mean the building helps explain the needs of that archetype. They do not assert that those businesses occupy the property.

## Publisher Coverage

Publisher now reports Representative Building Intelligence by ecosystem:

- representative role coverage
- subtype coverage
- business activity coverage
- business archetype coverage
- operational characteristic coverage
- operational category coverage
- explicit versus inherited or review-required records
- highest-priority missing role
- highest-priority missing operational category

This evidence does not change current Publisher numeric scores, readiness labels, recommendation rankings, public pages, Search Profile questions, or Building Brief URLs.

## Expansion Planning

Representative Building Foundation sprints should be defined by semantic coverage rather than raw building count.

Completion criteria should include:

- target representative roles covered or explicitly marked research required
- core ecosystem subtypes represented
- target business activities and archetypes represented
- major operational categories represented
- no unsupported operational facts
- canonical building IDs and URLs validated
- review-required records identified
- Building Brief migration candidates produced
- Publisher snapshots regenerated
- `node scripts/qa-representative-building-intelligence.js` passes

For Sacramento industrial/flex, the generated sprint should target small-bay service, flex, contractor/service, warehouse/distribution, and light-manufacturing environments before office-only Building Brief migration.

## Public Rendering Guardrails

Do not expose raw taxonomy IDs publicly in v2.

Do not change public Representative Building cards, recommendation rankings, Building Brief templates, Live Market Investigation, Search Profile, or public page layouts as part of this layer.

## QA

Run:

```bash
node scripts/qa-representative-building-intelligence.js
```

The script validates taxonomy uniqueness, reference integrity, role/ecosystem compatibility, inheritance behavior, Publisher operational coverage, deterministic planner output, unchanged Publisher scores, and calibrated metro assertions.

## Future Phases

Phase 3: Sacramento Industrial & Flex Foundation.

Phase 4: Building Brief Intelligence Migration.

Phase 5: Archetype-Aware Recommendations.

Phase 6: Operational Search Profile.

Phase 7: Recommendation Explainability.

Phase 8: Commercial Environment Comparisons.
