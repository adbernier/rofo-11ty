# Industrial & Flex Building Brief Standard v1

Industrial and flex Building Briefs remain the internal data structure. Publicly, they render as Building Profiles that explain whether a business can realistically operate in a commercial environment and what must be validated before shortlisting space. They are durable editorial guides, not listings, availability pages, rent pages, zoning opinions, or broker due-diligence substitutes.

The standard was calibrated with eight Sacramento industrial/flex Briefs:

- 3100 Ramco St
- 8583 Elder Creek Rd
- 11201 Sun Center Dr
- 2928 Ramco St
- 1329 N Market Blvd
- 3380 Industrial Blvd
- 5711 Florin Perkins Rd
- 11353 Pyrites Way

## Product Role

Industrial and flex Building Profiles sit between Representative Building Intelligence and Live Market Investigation:

```text
Search Profile
-> Location Recommendation
-> Representative Environment
-> Building Profile
-> Operational Validation
-> Broker or Live Market Investigation
```

The profile should help a user understand the operating model represented by the property. It should not imply that the property is currently available or that the property will support a specific use without validation.

## Required Editorial Layers

Every production industrial/flex Brief should include:

- `buildingSummary`: 40-80 words explaining the property, district, operating model, and tenant decision.
- `buildingImportance`: why the environment matters to the district or ecosystem.
- `quickFacts`: only source-supported facts or clearly framed validation context.
- `idealFor`: specific business types or operating models that may evaluate the environment.
- `mayNotFit`: specific cases where another operating environment may be better.
- `buildingExperience`: how working in or visiting the environment should be evaluated.
- `districtContext`: how the property fits Sacramento commercial geography or another metro's geography.
- `advantages`: practical operating strengths.
- `tradeoffs`: practical compromises, not disguised marketing.
- `operationalProfile`: grouped operating considerations.
- `environmentExplanation`: why the environment exists and why a business may choose it over alternatives.
- `nearbyAlternatives`: building-level alternatives with differentiated reasons.
- `comparisonContext.relatedDistricts`: district or operating-environment comparisons.
- `validationNotes`: a practical checklist for touring, diligence, and broker conversations.
- `representativeCompanies`: category-level business-fit language only, unless named tenant evidence is strong.
- `relatedInsights`: district, city, or handbook guidance directly related to the decision.
- `evidence`: confidence, provenance, and source notes.

Public rendering should simplify these fields into:

- Building Profile introduction
- Building Snapshot
- Best Fit
- Location & Building Characteristics
- District Context
- Location Advantages and Things to Consider
- Nearby Alternatives
- What to Verify
- Market check

Do not expose source/provenance language in public copy. Keep source notes, confidence, representative roles, ecosystem IDs, and evidence fields available internally for QA, Publisher, and future migration work.

## Schema Additions

Industrial/flex Briefs use the existing `building_brief` object with additive fields:

```js
{
  ecosystemContext: {
    primaryEcosystem: "industrial_flex",
    ecosystemSubtypes: ["small_bay_industrial"],
    representativeRole: "small_bay_service_environment"
  },
  businessFit: {
    archetypes: ["electrician", "hvac_company"],
    activities: ["service_dispatch", "equipment_storage"],
    fitSummary: "..."
  },
  operationalProfile: [
    { label: "Loading", summary: "..." }
  ],
  environmentExplanation: {
    whyItExists: "...",
    whyChooseThisEnvironment: "...",
    representativeValue: "..."
  },
  comparisonContext: {
    relatedDistricts: [
      { districtId: "power-inn-industrial", reason: "..." }
    ]
  },
  validationChecklist: ["..."],
  evidence: {
    confidence: "editorially_supported",
    provenance: {
      ecosystem: "representative-building",
      operationalCharacteristics: "mixed",
      editorialInterpretation: "building-brief"
    },
    sourceNotes: ["..."]
  }
}
```

The public template renders `operationalProfile` and `environmentExplanation` only when present. Existing office Briefs do not need these fields.

## Inheritance

The implemented hierarchy is:

```text
Canonical Building Facts
-> District and Ecosystem Context
-> Representative Building Intelligence
-> Building Brief Explicit Editorial Content
-> Resolved Public Building Brief
```

Explicit Brief content overrides inherited Representative Building Intelligence. Inherited taxonomy compatibility is not a verified property fact. Operational characteristics that are not source-supported should be written as validation topics rather than asserted as present features.

## Evidence

Use repository source captures, official property pages, brokerage brochures, ownership pages, planning documents, assessor records, or other reliable public sources. In the Sacramento calibration set, source facts came from existing CBRE and Colliers Sacramento-region exports.

Do not add:

- current availability claims
- asking-rent claims
- vacancy claims
- current tenant claims
- unsupported permitted-use claims
- unsupported loading, power, clear-height, yard, parking, or infrastructure claims

## Confidence and Provenance

Supported confidence values should follow the Representative Building Intelligence model:

- `verified_property_fact`
- `editorially_supported`
- `representative_building_inherited`
- `district_inferred`
- `taxonomy_inferred`
- `review_required`

Briefs can contain mixed evidence. A source-supported clear-height fact and an editorially supported business-fit interpretation should not be collapsed into the same level of certainty.

## Editorial Voice

Write like an experienced commercial-location advisor. Use practical, direct language:

- "may fit businesses that need..."
- "users should validate..."
- "this environment helps explain..."
- "choose this environment over..."

Avoid brokerage language:

- premier
- highly desirable
- state-of-the-art
- rare opportunity
- perfect for
- available now

## Operating Models

The calibration set establishes these initial industrial/flex patterns:

- small-bay service
- contractor/service
- warehouse/distribution
- last-mile logistics
- light manufacturing
- large-scale distribution
- showroom flex

Future Briefs should add new properties only when they teach a distinct operating model, subtype, district expression, or validation question.

## Validation Checklist

Use a relevant subset of validation questions. Do not paste every item into every Brief.

Common validation topics:

- permitted use
- dock or grade-level loading
- truck circulation
- delivery windows
- employee and service-vehicle parking
- trailer or overnight vehicle rules
- yard rights
- outdoor storage approval
- clear height
- power capacity
- ventilation
- HVAC coverage
- plumbing
- fire/life-safety requirements
- office percentage
- suite divisibility
- signage and customer access
- security responsibilities

## Public Rendering

Industrial/flex Briefs must not expose raw taxonomy IDs or create a specification-sheet feel. The operational profile should group considerations under readable labels such as Loading, Warehouse configuration, Yard and vehicles, Customer presence, or Power and infrastructure.

## QA Standard

Run:

```bash
node scripts/qa-industrial-flex-building-brief-standard.js
node scripts/qa-building-brief-depth.js
node scripts/qa-recommendation-representative-buildings.js
```

The focused QA fails on invalid taxonomy references, missing operational sections, missing evidence, public raw taxonomy IDs, self-linked alternatives, unsupported availability/rent language, malformed output, and failure of Publisher to recognize migrated Brief coverage.

## Future Reuse

This standard should be reused for Denver, San Diego, Orange County, Seattle, and Bay Area industrial/flex migrations. Related ecosystem standards for medical, life science, and retail should use the same evidence and inheritance discipline but define their own operating-model sections.
