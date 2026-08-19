# Rofo Access Intelligence — Architecture & Market Foundation Design

No repository files or production behavior were changed during the design work.

Terminology used below:

- **Documented:** directly represented in current repository data or architecture.
- **Inference:** conclusion drawn from current structures and observed gaps.
- **Proposal:** recommended future architecture requiring review before implementation.

## 1. Executive Recommendation

Yes. Rofo can build Access Intelligence as a generic, evidence-backed Market Foundation without hand-authoring commute rules for every district.

The correct abstraction is not:

```text
If Marin → Presidio
```

It is:

```text
Requirement geography
→ typed origin regions
→ relevant travel modes
→ reviewed gateways/systems
→ district access relationships
→ bounded Access Fit
```

Access Intelligence should be a new structured knowledge layer attached to canonical Markets and Districts—not embedded in the Requirement and not encoded separately inside every recommendation model.

The recommended architecture is:

```text
Canonical Requirement
→ RequirementAccessProfile adapter

Commercial Geography
+ AccessMarketFoundation
+ reviewed AccessEvidence
→ DistrictAccessProfiles

RequirementAccessProfile
× DistrictAccessProfiles
→ deterministic AccessFitResult

Access Fit
+ Business Environment Fit
+ Operating Fit
+ future Economic Fit
→ recommendation composition
```

Runtime behavior should use reviewed structured data. Research and AI can help prepare foundation candidates, but an LLM should not improvise local access advice during recommendation generation.

Use an ordinal vocabulary:

- `STRONG`
- `GOOD`
- `MODERATE`
- `WEAK`
- `UNKNOWN`

Internal ordering values may support deterministic comparison, but should never be presented as precise commute scores.

## 2. Existing Access Architecture Audit

### Commercial Geography

`_data/commercialGeography.js` and `lib/geography/commercial-geography.js` already provide:

- Canonical Region → Market → District ownership
- Stable market IDs
- Market-to-city mappings
- District recommendation eligibility
- Compatibility with legacy Publisher metro identity

Useful existing regional objects include:

- San Francisco, East Bay, Peninsula, South Bay, and North Bay as separate Bay Area Markets
- Denver as a market containing central-city and suburban municipalities
- Orange County as a multi-city market

Access Intelligence should reference these identities rather than inventing parallel market or district IDs.

### Knowledge Graph

`_data/locationKnowledgeGraph.js` currently stores access knowledge through:

- `attributes.transit`
- `attributes.parking`
- `attributes.freewayAccess`
- `attributes.customerAccess`
- `industrialAttributes.highwayAccess`
- `industrialAttributes.lastMileAccess`
- `industrialAttributes.portAirportAccess`
- `industrialAttributes.laborAccess`
- Strengths and tradeoffs expressed in prose
- Editorial comparison relationships

The schema in `_data/locationKnowledgeSchema.js` validates bounded `high / medium / low / unknown` attributes.

This is useful, but too compressed. A district can be `transit: high` without saying:

- Which system
- Which origin regions it serves
- Which modes matter
- Whether the judgment is factual or editorial
- What evidence supports it

### San Francisco Office model

The current SF model contains:

- One `commuteOrientation`
- `regional_transit`
- `parking`
- Client visit frequency
- Qualitative district transit and parking attributes
- Explicit rise/fall district lists

The resolver applies access through market-specific tables such as:

```text
east_bay → rise Financial District / SoMa / South Beach
marin → rise Financial District / Jackson Square / South Beach
peninsula_south_bay → rise SoMa / Mission Bay / South Beach
```

This is deterministic and explainable, but duplicates the access judgment inside the recommendation model.

The new Requirement preview established that:

- Multiple origins must currently be compressed into one orientation.
- Client origin geography has no current equivalent.
- Transit and parking behave mostly as high/not-high switches.
- High parking can make large district-set changes without enough geographic context.

### Denver Office model

The Denver model repeats the same architectural pattern with different enums:

- `central_city`
- `southeast_metro`
- `east_denver`
- `transit_oriented`

It also introduces market-specific attributes such as `southeastMetroAccess`.

This validates that access matters across markets, but also demonstrates duplication: every market-specific model must independently encode origin meaning and district effects.

### Orange County

Orange County uses the generic Knowledge Graph resolver rather than a dedicated access model. Its current access reasoning comes from:

- Keyword-to-attribute matching
- District strengths and tradeoffs
- Freeway, parking, airport, customer-access, and corridor language
- Editorially authored comparison paths

Current canonical districts include Irvine Spectrum, Irvine Business Complex, University Research Park, South Coast Metro, Newport Center, Tustin Legacy, Anaheim Canyon, Lake Forest Business Park, Fullerton, and South OC Medical & Professional.

The repository already identifies useful OC systems:

- I-5 corridor
- I-405 corridor
- SR-55/Costa Mesa Freeway corridor
- John Wayne Airport/MacArthur/Von Karman corridor
- Irvine technology/research corridor
- Anaheim Canyon/North OC industrial corridor
- South OC business-park/medical corridor

These exist primarily as prose and recommendation context, not a reusable access graph.

### Commercial Market Evidence

`_data/commercialMarketEvidence.js` and the district evidence collections already support:

- Explicit source references
- Evidence confidence
- Editorial roles
- Review status
- District comparisons
- Strengths and tradeoffs
- Separation of facts from editorial interpretation

Access Intelligence should reuse this provenance philosophy. It should not overload building-oriented CME records, but AccessEvidence can follow the same evidence standards.

### Geometry and coordinates

The repository contains approximate centroids in Peter’s normalized commercial-area data and editorial map assets. These are useful for research and internal review, but not yet canonical Access geometry.

Existing documentation explicitly cautions that:

- Centroids are approximate.
- Corridor assignment should not rely on broad centroid-radius matching.
- Geometry should retain source, confidence, and review status.
- Polygons and canonical entity naming should remain separate.

### Market Foundation and EOS

EOS already distinguishes:

- `Unmapped`
- `Foundation`
- `Developed`

It also distinguishes evidence readiness:

- `Ready`
- `Researchable`
- `Blocked`

The proposed Access Foundation can extend that system with additive completeness dimensions. It must not alter existing EOS scoring.

### Principal duplication

Current access logic is distributed across:

1. Knowledge Graph high/medium/low attributes
2. Strength and tradeoff prose
3. SF commute-orientation tables
4. Denver commute-orientation tables
5. Generic resolver keyword matching
6. Recommendation QA scenarios
7. Public/comparison-page editorial copy
8. Approximate geometry datasets
9. CME evidence records

The missing layer is a reviewed, market-level normalization of origin regions, gateways, and district access relationships.

## 3. Product Boundary

Access Intelligence should answer:

> How well does a district geographically serve the people, customers, service territory, transportation modes, and recurring movement described by the Requirement?

It owns:

- Employee origin access
- Client/customer origin access
- Service-territory reach
- Regional and local transit relationships
- Road, bridge, freeway, ferry, and airport gateways
- Driving practicality at district scale
- Qualitative parking environment
- Cross-market connectivity
- Access-related district eligibility
- Evidence-backed access explanation

It does not own:

- Business ecosystem or image fit
- Property-type inventory or availability
- Current asking or effective rent
- Property technical capabilities
- Zoning or permitted use
- Exact parking stalls
- Live traffic or exact travel time
- Building-level loading or access
- Current transit disruption
- Lease economics
- Candidate-district preference
- Overall recommendation ranking

Parking in Access Intelligence means district-level arrival environment, not verified parking at a particular property.

## 4. Generic Access Intelligence Schema

The generic model requires five linked concepts:

```text
Market
├── Origin Regions
├── Gateways / Systems
├── Canonical Districts
├── Access Evidence
└── District Access Profiles
```

### Origin regions

An OriginRegion represents a meaningful source geography for people, customers, service demand, or logistics movement.

It is not necessarily:

- A municipality
- A district
- A compass direction
- A fixed polygon

Supported region types should include:

- `canonical_market`
- `city_cluster`
- `metro_sector`
- `submarket_cluster`
- `corridor_catchment`
- `external_market`
- `airport_fly_in`
- `local_market_core`

This supports:

- Bay Area regional markets
- Denver metro sectors
- Orange County city/submarket clusters

### Gateways and systems

Generic gateway types:

- `bridge`
- `freeway`
- `interstate`
- `major_arterial`
- `regional_rail`
- `commuter_rail`
- `ferry`
- `light_rail`
- `bus_network`
- `airport`
- `port`
- `transfer_hub`
- `access_corridor`

A system can contain component gateways. For example, a regional rail system can contain individual reviewed stations, while an interstate corridor can contain relevant approaches or interchanges.

### District characteristics

A DistrictAccessProfile should represent:

- Origin-region accessibility by mode
- Regional transit access
- Local transit access
- Driving/gateway access
- Parking environment
- Airport relationship
- Cross-market reach
- Service-territory reach where supported
- Relevant gateway connections
- Evidence completeness

It should not repeat ecosystem, image, or building-fit attributes.

## 5. Facts vs Derived Judgments

Access knowledge needs two explicit layers.

### Facts

Examples:

- District centroid or reviewed geometry
- A station is inside or near a district
- A district touches a defined access corridor
- A bridge approach connects to a district’s road network
- A ferry terminal serves a district
- A district is associated with an interstate interchange
- A district has a documented parking-oriented built form

Each fact should include provenance, source date, confidence, and review state.

### Derived judgments

Examples:

- Strong East Bay transit access
- Good Marin driving access
- Moderate airport access
- Weak parking environment
- Strong south-metro access

Each judgment should link to the fact IDs or other evidence from which it was derived.

A derived assertion should look conceptually like:

```json
{
  "id": "access-judgment:sf:financial-district:east-bay:transit",
  "subjectId": "financial-district",
  "originRegionId": "sf-origin:east-bay",
  "mode": "regional_transit",
  "rating": "STRONG",
  "derivedFrom": [
    "fact:financial-district:bart-access",
    "fact:east-bay:bart-connectivity"
  ],
  "method": "reviewed_gateway_path",
  "confidence": "HIGH",
  "reviewStatus": "APPROVED"
}
```

The runtime resolver consumes approved judgments and their trace. It should not derive geography from prose each time.

## 6. Foundation Levels

### Level 0 — Unmapped

Available:

- Canonical Market
- Some canonical Districts

Unavailable:

- Reviewed origin regions
- Gateway graph
- District access profiles

Behavior:

- Access Fit returns `UNKNOWN`.
- Existing recommendation behavior remains unchanged.

### Level 1 — Computable geographic foundation

Includes:

- Reviewed district centroid or geometry confidence
- Origin-region definitions
- Major gateways and systems
- District-to-gateway proximity/relationship facts
- Basic adjacency
- Airport and major corridor relationships

Useful for:

- Candidate research
- Internal coverage reporting
- Conservative access judgments
- Identifying missing evidence

It should not automatically publish strong user-facing conclusions.

### Level 2 — Reviewed Access Foundation

Adds:

- Origin-to-gateway relationships
- Reviewed district access ratings
- Parking environment
- Driving-friction classifications
- Market-specific nuance
- Explanation templates tied to evidence
- Signal-activated eligibility evidence
- Calibration QA

This is the minimum level for Access Fit to influence recommendations.

### Level 3 — Advanced Access Foundation

Potential future inputs:

- Periodic travel-time matrices
- Time-of-day bands
- Transit-service frequency
- Observed mobility
- Parking costs and supply indicators
- Scheduled infrastructure changes
- Live or periodically refreshed disruption data

Level 3 should augment, not overwrite, the reviewed categorical foundation.

## 7. Market Foundation Generation

### Computable inputs

Candidates for deterministic generation:

- Distance bands from districts to gateways/stations
- District-to-corridor intersection
- Geometry adjacency
- Cardinal or network relationship
- Presence inside an airport or freeway catchment
- Same-system station connectivity
- Canonical market/city containment
- Gateway graph reachability

Computed proximity is evidence, not final access quality.

For example, being geographically near a rail line does not establish usable station access.

### Research-assisted inputs

Research can identify:

- Meaningful commuter-origin regions
- Which gateways actually structure local decisions
- Parking environment
- Conventional directionality
- Cross-market travel patterns
- Important transfer friction
- Corridor naming and commercial meaning
- Market-specific exceptions

AI may assist with:

- Source discovery
- Candidate extraction
- Evidence normalization
- Contradiction detection
- Drafting review packets

### Editorial validation

Human review is required for:

- Origin-region boundaries and meaning
- Whether a corridor is commercially decision-relevant
- Derived `STRONG / GOOD / MODERATE / WEAK` judgments
- Parking environment
- Signal-activated district eligibility
- User-facing explanations
- Conflicting or qualitative local evidence

Runtime recommendations should consume only approved or explicitly provisional records.

## 8. Requirement Access Profile

The existing canonical Requirement should remain unchanged. A dedicated adapter produces:

```json
{
  "schemaVersion": "requirement-access-profile:v1",
  "requirementId": "requirement-id",
  "marketId": "san-francisco",
  "propertyContext": ["office"],
  "cohorts": [
    {
      "cohortId": "employees-east-bay",
      "actorType": "EMPLOYEE",
      "originRegionId": "sf-origin:east-bay",
      "importance": "MATERIAL",
      "frequency": "RECURRING",
      "preferredModes": ["REGIONAL_TRANSIT"],
      "sourceDimensions": [
        "universal.location.employee_origins",
        "universal.access.transit_importance"
      ]
    }
  ],
  "modePreferences": {
    "regionalTransit": "REQUIRED",
    "localTransit": "MATERIAL",
    "driving": "LOW",
    "parking": "LOW"
  },
  "serviceTerritory": [],
  "candidateDistrictIds": [],
  "unresolvedOrigins": [],
  "conflicts": [],
  "provenance": []
}
```

### Bounded importance

Recommended importance states:

- `CORE`: must be materially accommodated
- `MATERIAL`: meaningfully affects the decision
- `CONSIDER`: useful but secondary
- `LOW`: should not move the decision
- `UNKNOWN`

These are not percentages.

If a user selects multiple origins without ranking them, preserve them as equal `MATERIAL` cohorts. Do not infer workforce shares.

Candidate districts should be copied only into comparison context, never into Access Fit inputs.

## 9. District Access Profile

```json
{
  "schemaVersion": "district-access-profile:v1",
  "marketId": "san-francisco",
  "districtId": "financial-district",
  "foundationVersion": "sf-access-foundation:2026-01",
  "originAccess": [
    {
      "originRegionId": "sf-origin:east-bay",
      "modeRatings": {
        "regionalTransit": "STRONG",
        "driving": "MODERATE",
        "ferry": "GOOD"
      },
      "overallRating": "STRONG",
      "derivedJudgmentIds": [
        "access-judgment:..."
      ]
    }
  ],
  "characteristics": {
    "regionalTransit": "STRONG",
    "localTransit": "STRONG",
    "drivingGatewayAccess": "MODERATE",
    "parkingEnvironment": "WEAK",
    "airportAccess": "UNKNOWN",
    "crossMarketConnectivity": "GOOD"
  },
  "gatewayRelationships": [
    {
      "gatewayId": "sf-system:bart",
      "relationship": "DIRECTLY_SERVED",
      "rating": "STRONG",
      "evidenceIds": ["access-evidence:..."]
    }
  ],
  "completeness": {
    "level": "REVIEWED",
    "coverage": {
      "originAccess": "SUFFICIENT",
      "transit": "SUFFICIENT",
      "driving": "PARTIAL",
      "parking": "SUFFICIENT"
    },
    "confidence": "HIGH"
  }
}
```

The example illustrates shape only; ratings must be separately validated.

## 10. Access Fit Model

### Ordinal evaluation

Internal ordinal values may be:

```text
STRONG   3
GOOD     2
MODERATE 1
WEAK     0
UNKNOWN  null
```

These numbers exist only to implement stable ordering and aggregation. They are not metric scores.

### Evaluation sequence

For each Requirement cohort:

1. Resolve the canonical OriginRegion.
2. Identify allowed and preferred modes.
3. Find reviewed origin → gateway → district paths.
4. Evaluate the strongest supported path by relevant mode.
5. Apply district arrival modifiers such as parking only where that mode requires them.
6. Produce a cohort Access Fit rating.
7. Aggregate cohort results by actor and bounded importance.
8. Preserve evidence gaps separately.
9. Produce an overall ordinal band and explanation trace.

### Aggregation philosophy

Use a bounded rule system rather than unconstrained additive scoring:

- A `CORE` cohort cannot be averaged away by several minor strengths.
- One parking signal cannot move the overall result more than one band.
- Duplicate transit evidence cannot vote multiple times.
- Employee and client families have capped contributions.
- `UNKNOWN` reduces confidence; it does not become `MODERATE`.
- A district with one `STRONG` origin and one `WEAK` core origin should expose a tradeoff, not report a simple average.
- Near-equivalent categorical results should remain tied.

Suggested output:

```json
{
  "overall": "GOOD",
  "confidence": "MEDIUM",
  "cohortResults": [],
  "strengths": [],
  "tradeoffs": [],
  "unknowns": [],
  "eligibility": {},
  "explanationTrace": []
}
```

## 11. Employee / Client Geography

### Employees

Employee access is recurring and normally has higher cumulative operational consequence.

Factors:

- Origin importance
- Recurrence
- Recruiting/retention relevance
- Mode preference
- Number of distinct material origins

A material employee origin normally remains meaningful even when another origin is stronger.

### Clients and customers

Client geography is gated by visit frequency:

| Visit pattern | Access treatment |
|---|---|
| Frequent/regular | Full material contribution |
| Occasional | Capped secondary contribution |
| Rare/irrelevant | Preserved as context; normally no district movement |
| Unknown | No assumed contribution |

This prevents a Peninsula client origin from influencing an office when clients almost never visit.

### Service territory

Service territory is a separate actor type because it represents operational reach rather than individual commuting.

It may evaluate:

- Directional coverage
- Road gateway reach
- Cross-market access
- Fleet dispatch practicality
- Airport/port relationship where relevant

Service territory should not reuse employee commute assumptions.

## 12. Transit / Parking

### Transit

Transit importance must interact with a real origin/system relationship.

```text
East Bay origin
+ regional transit required
+ district strongly served by a reviewed East Bay-connected system
→ strong supported contribution
```

A district’s generic `transit: high` is insufficient.

Transit importance states:

- `REQUIRED`
- `MATERIAL`
- `HELPFUL`
- `LOW`
- `UNKNOWN`

A `REQUIRED` transit need can expose a major tradeoff or cap Access Fit when the district has weak applicable transit. `HELPFUL` transit should provide limited differentiation.

### Parking

Parking is an arrival modifier, not a primary geography recommendation.

It should interact with:

- Driving relevance
- Employee/client/service actor
- Visit frequency
- District parking environment
- Gateway/driving access
- Evidence confidence

Rules:

- High parking importance cannot create a strong access result if origin access is weak.
- Parking can raise or lower a driving-related cohort by at most one band.
- Parking has little or no effect when relevant users are transit-oriented.
- District parking ratings remain district-level; building parking is still `VERIFY`.

This addresses the current tendency for “parking high” to elevate every parking-oriented district broadly.

## 13. Gateway Model

Gateways are the scalable connective tissue, but they should be modeled as a graph rather than keywords.

```text
OriginRegion
→ OriginGatewayRelationship
→ AccessGateway/System
→ DistrictGatewayRelationship
→ District
```

### Origin-to-gateway relation

Fields:

- Origin region
- Gateway/system
- Supported modes
- Relationship strength
- Directionality
- Transfer/friction category
- Evidence
- Confidence

### Gateway-to-district relation

Fields:

- Gateway/system
- District
- Relationship: directly served, near, approach-adjacent, connected, indirect
- Supported modes
- Access rating
- Evidence
- Confidence

### Computational/editorial boundary

Computable:

- Distance
- Network intersection
- Same-system connection
- Basic reachability

Editorial/reviewed:

- Whether the route is commercially meaningful
- Whether proximity creates practical access
- Transfer friction
- Parking/driving implications
- Whether a gateway should influence recommendation eligibility

## 14. Signal-Activated District Eligibility

Access Intelligence should not evaluate every canonical district as equally plausible.

Recommended candidate composition:

```text
existing model starting set
∪ existing ecosystem/operating signal candidates
∪ access-activated candidates
```

An access-activated district must satisfy all of:

1. Canonical District ID exists.
2. District remains recommendation-eligible.
3. Relevant property-type fit is not `limited` or `unknown`.
4. Reviewed Access Foundation is at least Level 2 for the relevant relationship.
5. At least one `CORE` or `MATERIAL` access cohort has `STRONG` support, or multiple cohorts have `GOOD` support.
6. The evidence is materially differentiating versus the starting set.
7. No access-only rule overrides a hard non-access incompatibility.
8. An explanation trace exists.

The activation mechanism is generic:

```text
reviewed access relationship
+ material Requirement cohort
+ sufficient evidence
→ candidate eligibility
```

It is not:

```text
if origin ID equals Marin, add Presidio
```

Candidate eligibility is not a guarantee of a top-three ranking.

## 15. SF Calibration

### SF-A — East Bay / Transit

The profile preserves:

- SF employee cohort
- East Bay employee cohort
- High regional-transit importance
- Low parking importance

Expected Access behavior:

- Districts with reviewed East Bay-connected regional transit receive access support.
- BART/ferry relationships can explain why specific districts rise.
- A district does not benefit merely from generic `transit: high`.

### SF-B — Marin / Parking / Client-light

The profile preserves:

- Marin employee cohort
- SF employee cohort
- Driving/parking material
- Clients rare

Expected behavior:

- Northern driving gateways become relevant.
- Client geography is effectively gated off.
- A parking-oriented district does not automatically win.
- Presidio could become eligible only after canonicalization and reviewed access evidence.

### SF-C — Mixed Origins

Preserved independently:

- SF
- East Bay
- Marin
- SF clients
- Peninsula clients
- High transit
- Medium parking

Expected behavior:

- No single orientation replaces the others.
- The result should favor balance or expose a real tradeoff.
- Missing Marin or Peninsula evidence reduces confidence rather than disappearing.

### SF-D — Peninsula / Client-heavy

The Access Profile carries:

- Employee Peninsula/South Bay cohort
- Client Peninsula/South Bay cohort
- Frequent client visits
- Relevant mode preferences

Employee and client access reinforce each other, but client contribution remains separately traceable.

### SF-E — Candidate districts

SoMa and South Beach remain comparison metadata.

They do not affect Access Fit, access eligibility, or district ratings.

## 16. Presidio Calibration

### Current state

Documented repository state:

- Presidio has a public district page.
- It appears in editorial district maps and comparison pages.
- Public/editorial content describes:
  - Campus-like environment
  - Historic buildings
  - Open-space identity
  - Northern-city access
  - Auto/bike/shuttle dependence relative to denser districts
- It has an editor-reviewed Commercial Location Model entry with medium confidence.
- It is not a canonical Knowledge Graph district.
- It is not in the SF Office recommendation model’s district universe.
- It has no current CME collection.
- It has no reviewed Access Foundation profile.

Therefore, Presidio cannot safely become access-activated today.

### Required foundation work

Before eligibility, Presidio would need:

1. Canonical District identity and San Francisco Market ownership
2. Boundary/identity reconciliation with surrounding public geography
3. Recommendation eligibility review
4. Office/property-type fit
5. Reviewed district access facts
6. Golden Gate Bridge relationship evidence
7. Relevant local-transit/shuttle context
8. Parking-environment evidence
9. Northern-origin access judgments
10. Access explanation QA
11. Comparison QA against current SF Office districts
12. Evidence completeness status

If reviewed evidence establishes a strong Marin-driving relationship, the generic activation rule could make Presidio eligible. It still would not require Presidio to rank first.

## 17. Denver Generalization

### Candidate origin regions

Subject to research and review:

- Central Denver
- North/northwest metro
- Boulder/US-36 corridor
- West metro/foothills
- East Denver/Aurora
- South/southeast metro
- Wider mixed metro

### Documented gateway candidates

The repository already supports:

- I-25 southeast corridor
- I-70/east metro
- US-36/Denver–Boulder corridor
- DIA/Pena Boulevard
- Union Station and central transit
- Denver Tech Center/southeast business geography

### Market character

Denver is more driving-oriented than central SF but still has meaningful transit-centered nodes. Parking varies between central and suburban districts.

The generic schema works because metro sectors can be OriginRegions and highways/transit systems can be gateways. No SF-specific bridge or bay logic is required.

### Missing foundation data

- Reviewed origin-region definitions
- District-to-origin access ratings
- Explicit station/system relationships
- Driving-friction categories
- Parking provenance
- Multi-origin QA
- Separation between city transit and regional transit
- Access completeness by district

## 18. Orange County Generalization

### Market topology

Orange County is polycentric. A countywide market anchor does not imply one center or radial direction.

Origin regions should likely be typed city/submarket clusters, potentially including:

- North OC
- Central OC
- Irvine/airport area
- Coastal OC
- South OC
- West/northwest OC
- Inland Empire-facing origins

These require research validation.

### Gateway structure

Current repository evidence identifies:

- I-5
- I-405
- SR-55
- John Wayne Airport/MacArthur/Von Karman
- Irvine technology/research corridor
- North OC industrial corridors
- South OC business-park/medical corridors

### Required generic extension

The schema needs one small but important feature:

> OriginRegion topology must be typed and non-radial.

It cannot assume `north / south / east / west from downtown`. A region may be a city cluster, submarket, corridor catchment, or external-market interface.

### Market anchor treatment

`Orange County` remains the Market. OriginRegions and Districts may cross multiple municipal boundaries inside it. Gateways can connect several nodes without creating a new Market or forcing a county-center abstraction.

## 19. Three-Market Comparison

| Dimension | San Francisco | Denver | Orange County |
|---|---|---|---|
| Topology | Dense core with regional bay origins | Central city plus broad metro sectors | Polycentric city/submarket network |
| Useful origin model | Bay markets and local SF | Metro sectors and corridor catchments | City/submarket clusters |
| Major systems | BART, Caltrain, ferry, bridges, freeways | I-25, I-70, US-36, RTD/Union Station, DIA | I-5, I-405, SR-55, airport and business corridors |
| Transit role | Often decision-defining | Strong for selected central nodes | Usually secondary, locally variable |
| Driving role | Important but constrained by district | Often primary outside central nodes | Predominant |
| Parking role | Strong differentiator | Central/suburban tradeoff | Usually expected; quality and convenience still vary |
| District structure | Compact canonical districts | Downtown plus suburban/municipal nodes | Multi-city submarkets and business districts |
| Existing access data | Good prose and coarse attributes | Good corridor prose and coarse attributes | Strong corridor concepts and generic attributes |
| Main gap | Multi-origin/system relationships | Origin-sector normalization | Polycentric origin/corridor normalization |
| Editorial burden | High for modes and gateway nuance | Medium-high for metro sectors | High for submarket/corridor identity |

One generic schema is sufficient if it supports typed OriginRegions and typed gateway networks. Separate market-specific schemas are unnecessary.

## 20. Location Intelligence Composition

Access Intelligence should be one independently explainable component:

```text
Location Intelligence
├── Business Environment Fit
├── Operating Fit
├── Access Fit
├── Economic Fit (future)
└── Candidate Preference Context
```

### Business Environment Fit

Owns:

- Professional image
- Technology ecosystem
- Healthcare cluster
- Recruiting environment
- Client-facing character
- Creative identity

### Operating Fit

Owns:

- Industrial/service geography
- Distribution context
- Manufacturing ecosystem
- R&D context
- Service-territory operational fit
- Property-type compatibility at district scale

Service territory can produce both:

- Access conclusions about geographic reach
- Operating conclusions about appropriate business environment

Each conclusion must remain attributable to its component.

### Access Fit

Owns movement and geographic accessibility only.

### Economic Fit

Future and separate:

- Occupancy cost
- Incentives
- Availability
- Market economics

Composition should initially expose parallel components and tradeoffs, not collapse them into one opaque total score.

## 21. Explainability

Every explanation should be assembled from:

1. Requirement source fact
2. Access judgment
3. Evidence path
4. District implication
5. Confidence/unknown boundary

Example trace:

```text
Requirement:
Employees come from Marin; driving and parking are material.

Access judgment:
District has reviewed strong Marin-driving access.

Evidence:
Origin region connects through a reviewed bridge gateway;
district has an approved gateway relationship;
parking environment is reviewed as moderate.

Explanation:
This district is worth considering because it serves your Marin employees through a direct northern driving gateway, while its parking environment is more workable than the downtown core.
```

User-facing text should never expose internal ordinal values or weighted totals.

If evidence is incomplete:

> Rofo can establish the district’s gateway relationship, but parking conditions remain insufficiently reviewed to treat it as a clear access advantage.

## 22. Scaling Strategy

### Minimum viable Access Foundation

A market is runtime-ready when it has:

- Canonical Market
- Reviewed OriginRegions
- Major gateways/systems
- Canonical District references
- Level 2 profiles for the districts allowed to affect ranking
- AccessEvidence provenance
- Completeness metadata
- Calibration cases
- Explanation QA

Not every district must be complete. Incomplete districts can remain `UNKNOWN` and non-activating.

### Automation

Automate:

- Schema validation
- Canonical ID joins
- Proximity bands
- Adjacency candidates
- Gateway intersection candidates
- Coverage reporting
- Stale-source detection
- Contradiction flags
- QA scenario execution

### Human review

Require review for:

- Commercially meaningful origin regions
- Gateway relevance
- Parking environment
- Derived ratings
- Activation eligibility
- Explanations
- Local nuance and exceptions

### Refresh cadence

Suggested:

- Canonical geometry: on source/version change
- Major infrastructure: quarterly monitoring, annual review minimum
- Transit systems: quarterly or after announced service changes
- Parking environment: annual or material-policy-change review
- Editorial access judgments: annual calibration
- Advanced travel-time data: according to provider freshness

## 23. Epistemic Boundaries

### Incomplete transit information

Return `UNKNOWN` or partial coverage. Do not infer moderate access from district proximity alone.

### Disputed boundaries

Canonical identity and geometry confidence remain separate. A stable district may have approximate geometry.

### Variable traffic

Describe structural access, not travel time:

- “direct freeway relationship”
- “driving friction is variable”
- “exact commute should be tested”

### Parking uncertainty

District parking is qualitative. Property parking remains `VERIFY`.

### Corridor changes

Evidence records need `effectiveFrom`, `reviewedAt`, and optional `supersededBy`.

### New transit lines

Future/in-construction systems should not become active access facts until operational, unless explicitly labeled planned and excluded from runtime evaluation.

### Qualitative local knowledge

Preserve source type and confidence. Expert-reviewed local knowledge may support a derived judgment, but it should not masquerade as an objective fact.

### Exact commute questions

Without a current travel-time provider, Rofo should say it provides structural access guidance, not live commute estimates.

## 24. Existing Architecture Reuse

Reuse directly:

- Commercial Geography IDs and ownership
- Knowledge Graph district IDs and recommendation eligibility
- Knowledge Graph bounded qualitative states
- CME provenance and review conventions
- Existing SF and Denver model calibration cases
- Existing Requirement adapter boundary
- EOS Foundation states
- EOS evidence readiness
- Publisher/EOS coverage reporting patterns
- Existing district strengths, tradeoffs, and validation questions as research inputs
- Approximate centroid data as candidate evidence only
- Existing recommendation QA infrastructure
- Existing candidate-district separation

Extend rather than replace:

- Add Access completeness to Market Foundation reporting.
- Add typed access relationships adjacent to the Knowledge Graph.
- Reference CME-compatible evidence records.
- Allow recommendation models to consume AccessFitResult later.
- Keep existing models unchanged during shadow evaluation.

Do not use public pages as the canonical Access store. Public content may supply research evidence, but reviewed Access Foundation objects should become the structured source.

## 25. Proposed Data Objects

### AccessMarketFoundation

```json
{
  "schemaVersion": "access-market-foundation:v1",
  "foundationId": "access-foundation:market-id",
  "marketId": "canonical-market-id",
  "topology": "DENSE_CORE | RADIAL_METRO | POLYCENTRIC | CORRIDOR_NETWORK",
  "originRegionIds": [],
  "gatewayIds": [],
  "districtProfileIds": [],
  "evidenceIds": [],
  "foundationLevel": "UNMAPPED | GEOGRAPHIC | REVIEWED | ADVANCED",
  "completeness": {},
  "confidence": "HIGH | MEDIUM | LOW | UNKNOWN",
  "reviewStatus": "CANDIDATE | IN_REVIEW | APPROVED | STALE",
  "version": "",
  "reviewedAt": ""
}
```

### OriginRegion

```json
{
  "originRegionId": "",
  "marketId": "",
  "label": "",
  "regionType": "CANONICAL_MARKET | CITY_CLUSTER | METRO_SECTOR | SUBMARKET_CLUSTER | CORRIDOR_CATCHMENT | EXTERNAL_MARKET | LOCAL_CORE",
  "canonicalGeographyRefs": [],
  "geometryRef": null,
  "gatewayRelationships": [],
  "evidenceIds": [],
  "confidence": "",
  "reviewStatus": ""
}
```

### AccessGateway/System

```json
{
  "gatewayId": "",
  "marketId": "",
  "label": "",
  "gatewayType": "BRIDGE | FREEWAY | INTERSTATE | ARTERIAL | REGIONAL_RAIL | COMMUTER_RAIL | FERRY | LIGHT_RAIL | AIRPORT | TRANSFER_HUB | ACCESS_CORRIDOR",
  "modes": [],
  "componentIds": [],
  "geometryRef": null,
  "originRelationships": [],
  "districtRelationships": [],
  "evidenceIds": [],
  "confidence": "",
  "reviewStatus": ""
}
```

### DistrictAccessProfile

As defined in Section 9, keyed to a canonical District ID.

### RequirementAccessProfile

As defined in Section 8, generated by an adapter and never persisted back into the canonical Requirement as an access-model schema.

### AccessEvidence

```json
{
  "evidenceId": "",
  "claimType": "GEOMETRY | PROXIMITY | SYSTEM_SERVICE | GATEWAY_RELATIONSHIP | PARKING_ENVIRONMENT | EDITORIAL_ACCESS_JUDGMENT",
  "subjectRefs": [],
  "claim": "",
  "source": {
    "label": "",
    "url": "",
    "sourceType": "OFFICIAL | TRANSIT_AGENCY | PLANNING | INSTITUTIONAL_CRE | REPOSITORY | EXPERT_REVIEW"
  },
  "observedAt": "",
  "effectiveFrom": "",
  "confidence": "",
  "reviewStatus": "",
  "limitations": []
}
```

### AccessFitResult

```json
{
  "schemaVersion": "access-fit-result:v1",
  "requirementAccessProfileId": "",
  "districtId": "",
  "foundationVersion": "",
  "overall": "STRONG | GOOD | MODERATE | WEAK | UNKNOWN",
  "confidence": "",
  "cohortResults": [],
  "modeResults": [],
  "strengths": [],
  "tradeoffs": [],
  "unknowns": [],
  "eligibility": {
    "accessActivated": false,
    "activationReasons": []
  },
  "explanationTrace": [],
  "evidenceIds": []
}
```

### Completeness

Completeness should be multidimensional:

```json
{
  "originRegions": "SUFFICIENT | PARTIAL | MISSING",
  "gateways": "SUFFICIENT | PARTIAL | MISSING",
  "districtGeometry": "SUFFICIENT | PARTIAL | MISSING",
  "originAccess": "SUFFICIENT | PARTIAL | MISSING",
  "transit": "SUFFICIENT | PARTIAL | MISSING",
  "driving": "SUFFICIENT | PARTIAL | MISSING",
  "parking": "SUFFICIENT | PARTIAL | MISSING",
  "explanations": "SUFFICIENT | PARTIAL | MISSING"
}
```

Do not collapse these into one percentage.

## 26. New-Market Foundation Workflow

```text
1. Confirm canonical Market
2. Inventory canonical Districts
3. Classify market topology
4. Propose meaningful OriginRegions
5. Identify major gateways/systems
6. Acquire computable geography
7. Generate candidate relationships
8. Research qualitative access behavior
9. Create AccessEvidence records
10. Review origin and gateway definitions
11. Review derived district judgments
12. Generate DistrictAccessProfiles
13. Run deterministic schema/coverage QA
14. Run multi-origin calibration scenarios
15. Review explanations
16. Publish approved Access Foundation
17. Expose shadow AccessFitResult to evaluators
18. Permit recommendation models to consume it only in a later approved sprint
```

Operator responsibilities:

- Approve market topology
- Approve origin regions
- Resolve ambiguous geography
- Validate gateway relevance
- Review qualitative judgments
- Approve activation eligibility
- Sign off on explanations

Research/automation responsibilities:

- Gather sources
- Compute candidate proximity
- Detect missing coverage
- Normalize evidence
- Generate review packets
- Run QA and completeness reports

## 27. QA Strategy

Deterministic QA should cover:

### Schema and identity

- Valid schema versions
- Canonical Market IDs
- Canonical District IDs
- No duplicate origin or gateway IDs
- No cross-market relationship without explicit permission
- No unknown references

### Evidence

- Every derived judgment has evidence
- Every evidence record has provenance
- Candidate evidence cannot influence runtime
- Stale or superseded evidence is excluded
- Geometry confidence is present
- Public prose alone cannot silently become a verified fact

### Requirement behavior

- Multiple origins remain distinct
- Unknown origin mapping remains unresolved
- Client geography is frequency-gated
- Service territory remains distinct from employee geography
- Candidate districts do not affect Access Fit
- Informal geography remains unresolved until canonically mapped

### Fit behavior

- `UNKNOWN` is not treated as neutral
- One parking signal cannot dominate
- Duplicate gateways do not double-count
- Required transit interacts with applicable transit systems
- Parking modifies driving access rather than creating it
- Core-origin weakness remains visible
- Stable inputs produce stable output
- Explanation traces cite actual contributing evidence

### Eligibility

- Access activation requires canonical district identity
- Property-type incompatibility prevents activation
- Candidate district preference does not activate
- Insufficient foundation prevents activation
- No Requirement-origin → district hard-coded rules
- Activation remains distinct from ranking

### Generalization

- SF bridge/rail/ferry scenario
- Denver highway/transit scenario
- OC polycentric corridor scenario
- Mixed-mode and multi-origin scenario
- Unsupported market scenario

A static QA rule should reject source code or data patterns equivalent to direct Requirement-origin-to-district mappings outside reviewed foundation relationships.

## 28. Migration / Shadow Strategy

### Phase 0 — Current baseline

Preserve existing SF and Denver recommendation behavior and capture current outputs.

### Phase 1 — Foundation only

Create SF Access Foundation data and QA. No resolver consumption.

### Phase 2 — Shadow Requirement adapter

Generate RequirementAccessProfile beside the existing single commute orientation.

Compare:

- Lost information
- Conflicts
- Unresolved origins
- Coverage

### Phase 3 — Shadow Access Fit

Calculate AccessFitResult for every SF QA scenario but do not change rankings.

Evaluator output should compare:

- Existing commute/transit/parking contributions
- Proposed Access Fit
- Candidate activation differences
- Explanation differences
- Unknown evidence

### Phase 4 — Calibration

Review SF-A through SF-E and additional broker-reviewed cases. Add Presidio only if canonical and evidence prerequisites are met.

### Phase 5 — Bounded production experiment

In a separately approved sprint, allow Access Fit to replace only the existing SF access signal family while leaving ecosystem and environment scoring intact.

Use a feature flag or private evaluator first.

### Phase 6 — Denver and OC shadows

Validate that the same engine works with different market topologies before treating the architecture as nationally reusable.

Avoid abrupt migration by retaining the old access contribution in comparison logs until equivalence and intended differences are understood.

## 29. Open Product Decisions

1. Should origin importance default to equal `MATERIAL` when users select several regions, or should Rofo offer an optional “especially important group” follow-up?
2. Should a `WEAK` result for one `CORE` cohort cap overall Access Fit, or merely create a blocking tradeoff?
3. What minimum completeness dimensions are required before Access Fit can influence ranking?
4. Can reviewed expert knowledge alone support Level 2 access judgments, or must every runtime judgment include an institutional/official source?
5. Should service territory use the same Access engine with a different actor type or a dedicated Operating Fit subcomponent?
6. Should access activation admit a district with `good` rather than `strong` property-type fit?
7. Should approximate geometry be allowed for reviewed categorical relationships when stronger non-geometric evidence exists?
8. Should parking environment be one district-wide state or support mode/user-specific subdimensions such as employee versus visitor parking?
9. Who owns approval of OriginRegions: Product/editorial, broker operations, or a joint review?
10. How should planned infrastructure be shown without allowing it to affect current recommendations?

## 30. Recommended First Implementation Sprint

Do not change recommendation behavior.

### Objective

Build a private, data-only San Francisco Access Foundation v0 and shadow evaluator for the five calibration cases.

### Scope

Implement:

- Draft Access schemas and validators
- SF OriginRegion registry
- SF gateway/system registry
- Approved-fact versus candidate-evidence separation
- DistrictAccessProfiles for only the current five SF Office starting districts
- RequirementAccessProfile adapter preserving multiple origins
- Shadow AccessFit evaluator
- Evaluator coverage and explanation trace
- SF-A through SF-E QA

Explicitly exclude:

- Production resolver integration
- Production scoring changes
- Presidio canonicalization
- Travel-time APIs
- Live traffic
- New public pages
- Denver or OC data implementation
- EOS scoring changes

### Acceptance criteria

- Multiple origins survive projection.
- Every fit contribution traces to reviewed evidence.
- Candidate districts remain separate.
- Unknown evidence remains visible.
- Parking cannot dominate independently.
- Existing SF recommendations remain byte-for-byte unchanged.
- The evaluator shows where the proposed result differs from today’s access logic.
- The data model can represent Denver and OC test fixtures without schema changes.

## Final Question

Yes. Rofo can build Access Intelligence as a generic, evidence-backed market foundation that lets Requirement geography influence district recommendations without hand-authoring commute rules for every city and district.

The crucial design choice is to model typed origin regions, access gateways/systems, reviewed district relationships, and explicit evidence provenance. Market-specific knowledge will still be required—because local access is genuinely local—but it can be expressed as structured foundation data rather than bespoke recommendation code.
