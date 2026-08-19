# Rofo Requirement v1 — Architecture Discovery & Prototype Plan

No production behavior or repository files were modified during discovery. The authoritative product source was `docs/product/rofo-requirement-v1.md`.

Terminology used below:

- **Observed** — documented or implemented in the repository.
- **Recommendation** — proposed architecture.
- **Product decision** — requires judgment beyond architecture.

## 1. Executive Recommendation

Yes. Rofo can add Requirement Intelligence as a clean product layer over the existing Location Intelligence and broker-handoff systems without rewriting the current recommendation architecture.

The clean conceptual flow is:

```text
Business context
      ↓
Canonical Requirement
      ↓
Requirement → recommendation projection
      ↓
Existing Location Intelligence
      ↓
Location Brief linked to Requirement
      ↓
Existing lead routing / broker handoff
```

The essential architectural choices are:

1. Make `Requirement` a first-class object, separate from Business Profile, Location Brief, lead, and conversation transcript.
2. Treat Business Profile as a projection or intake source—not the canonical owner of business requirements.
3. Keep deterministic recommendation resolvers unchanged behind a Requirement adapter.
4. Let AI propose structured Requirement changes, but validate and merge those changes deterministically.
5. Represent unsupported recommendation signals explicitly as `unconsumed`, rather than discarding them or implying the resolver used them.
6. Preserve `UNKNOWN` and `VERIFY` as real states.
7. Keep the prototype private and session-local initially.
8. Defer production persistence, lead attachment, and Business Profile replacement to independently testable later phases.

The main limitation is coverage, not architecture. The current sophisticated structured resolver is effectively limited to San Francisco office. A Requirement adapter can feed it richer inputs immediately, but Orlando retail/service and East Bay industrial cases will expose how much current Location Intelligence relies on broader Knowledge Graph and fallback logic.

## 2. Current Architecture

### Current end-to-end flow

```text
Public page or /find-locations/
        ↓
Browser Business Profile
        ↓
localStorage: rofoSearchProfileV1
        ↓
Contact submission required
        ↓
POST /api/leads/submit
        ├─ pending lead stored in D1/KV
        ├─ route determined
        └─ internal review notification
        ↓
Browser recommendation context
sessionStorage + localStorage:
rofoRecommendationContextV1
        ↓
/recommendations/
        ├─ SF office structured resolver, when applicable
        └─ Knowledge Graph / legacy recommendation fallback
        ↓
Location Brief browser state
        ↓
POST /api/location-brief/submit
        ├─ durable Location Brief in D1/KV
        └─ live-market lead when requested
        ↓
Operator approval
        ├─ OfficeFinder adapter
        └─ direct broker referral
```

### Source map

| Concern | Primary sources |
|---|---|
| Business Profile template | `_includes/partials/shared/search-profile-card.njk` |
| Business Profile state, flow, lead payload | `js/search-profile.js` |
| Recommendations page | `pages/recommendations.njk` |
| Recommendation context and Brief construction | `js/recommendation-context.js` |
| SF office profile adapter | `lib/recommendations/normalize-sf-office-profile.js` |
| SF office resolver | `lib/recommendations/sf-office-recommendation-resolver.js` |
| General browser resolver | `js/recommendation-resolver.js` |
| Knowledge Graph | `_data/locationKnowledgeGraph.js` |
| Ecosystem taxonomy | `_data/commercialEcosystemTaxonomy.js` |
| Location Brief API and persistence | `functions/api/location-brief/_shared.js`, `functions/api/location-brief/submit.js` |
| Lead normalization, routing, persistence, OfficeFinder | `functions/api/leads/_shared.js`, `functions/api/leads/submit.js` |
| Routing rules | `_data/leadRoutes.json` |
| Direct broker referrals | `functions/broker-referral/_shared.js`, `functions/broker/referral/[token].js` |
| Project Snapshot | `functions/_shared/project-snapshot.js` |

### State and persistence

| Object/state | Current owner | Persistence |
|---|---|---|
| Business Profile | Browser | `localStorage`, key `rofoSearchProfileV1` |
| Recommendation context | Browser | Session and local storage, key `rofoRecommendationContextV1` |
| Draft Location Brief | Browser | Session and local storage |
| Submitted Location Brief | Server | D1 `location_briefs` or KV |
| Lead | Server | D1 `leads` or KV |
| Broker referral | Server | D1 `referrals` |
| Recommendation knowledge | Repository | JS data and authored models |
| Requirement | Does not exist yet | None |
| Conversation transcript | Does not exist yet | None |

The Location Brief has its own canonicalizer, schema version, public ID, recommendation version, Knowledge Graph version, contact, notes, project snapshot, and D1/KV persistence boundary. That is a useful precedent, but its `searchProfile` is presently a snapshot rather than a link to a durable upstream requirement.

### Recommendation flow

The browser selects the structured SF office path only when `modelKey === "san-francisco:office"`. It calls the existing normalizer and resolver and produces up to three recommended districts.

The SF office normalizer already demonstrates the desired adapter pattern. It maps supported fields, preserves economic language as broker context, and reports unsupported answers.

The Knowledge Graph supplies:

- District identity.
- Space-type fit.
- Commercial ecosystems.
- Business activities and archetypes.
- Qualitative attributes.
- Comparison relationships.
- Tradeoffs.
- Questions to validate.

Its ecosystem metadata currently supports publishing and interpretation but does not universally alter rankings. The documented boundary is important: richer Requirement data may exceed what current resolvers actually consume.

### Where context is lost today

1. Free-form prose is not structurally extracted.
2. Recommendation context omits much of the non-office feature input.
3. Economic language is intentionally excluded from location ranking.
4. The Business Profile stores choices but not criterion states, rationale, confidence, or provenance.
5. User statements, Rofo inferences, and external facts are not consistently distinguishable.
6. Browser-only context can disappear across devices or storage clearing.
7. The lead and Location Brief each copy partial snapshots instead of referencing one upstream object.
8. Broker handoff receives summaries and links, not a versioned Requirement.
9. `timing` exists in the profile schema but is not part of the normal active interview.
10. The present journey collects contact and creates a lead before recommendation access, contrary to the Requirement’s standalone-value principle.

## 3. Current Business Profile Audit

The classifications below concern Requirement formation, not whether a value may remain useful elsewhere.

| Current field/question | Classification | Assessment |
|---|---|---|
| Location: “Where are you thinking about locating?” | **EVOLVE** | Keep the candidate geography, but capture why it matters and whether it is an anchor, preference, constraint, or starting hypothesis. |
| Location intent: focus / compare / discover | **DERIVE** | Usually infer openness from conversation; confirm only if consequential. |
| Space type | **KEEP** | Essential routing and reasoning input, while allowing ambiguity such as retail/service/flex. |
| Business type | **EVOLVE** | Current office-only options are too narrow. Prefer an open business description mapped to canonical archetypes. |
| Operational use | **EVOLVE** | High-value concept, but should support property-type-specific activities and ordinary language. |
| Office environment | **KEEP** | Valuable for office location fit, with “mixed” and rationale support later. |
| Employee commute orientation | **EVOLVE** | Current regional buckets are useful but shallow. Preserve employee geography and its importance separately. |
| Expected growth | **EVOLVE** | Capture current scale, expected scale, horizon, and implications such as adjacent space or flexibility. |
| Institutional proximity | **DEFER** | Ask only when business context or location reasoning makes it material. |
| People | **EVOLVE** | Distinguish total headcount, peak attendance, shifts, visitors, and future capacity where relevant. |
| Size | **EVOLVE** | Preserve range, preferred size, minimum viable size, derivation, and expansion alternative. |
| Features | **EVOLVE** | Convert flat checkboxes into criteria with status, rationale, confidence, and applicability. |
| Other feature detail / additional requirements | **EVOLVE** | Make this a general conversational input and extract structured meaning from it. |
| Timing | **DEFER** | Ask when it changes readiness or execution. Include current lease and notice deadlines where applicable. |
| Use | **REMOVE FROM INITIAL INTERVIEW** | Dormant generic legacy field; activities provide the clearer model. |
| Workspace style | **REMOVE FROM INITIAL INTERVIEW** | Dormant legacy field; office environment and activity/capacity reasoning supersede it. |
| Important | **DERIVE** | Infer priorities from explanations and confirm the consequential ones. |
| Priorities | **DERIVE** | Represent as criteria rather than a separate undifferentiated list. |
| Notes | **EVOLVE** | Preserve raw user context with provenance; do not leave it as an opaque side channel. |
| Selected locations and normalized location object | **DERIVE** | System representation derived from user geography statements and canonical geography matching. |
| Target area | **DERIVE** | Compatibility projection from structured location logic. |
| Contact name/email/phone | **REMOVE FROM INITIAL INTERVIEW** | Collect only for saving across devices, sharing, or elected broker handoff—not to unlock Requirement value. |
| Source context and attribution | **DERIVE** | Useful system metadata, not interview questions. |
| Version, timestamps, skipped/submitted flags | **DERIVE** | Lifecycle metadata, not Requirement content. |

The existing active interview is uneven:

- Office receives business/use/environment/commute/growth questions.
- Non-office types receive only location, type, size or people, and a flat feature list.
- Timing is represented in state and payloads but omitted from `activeSteps()`.
- Readiness currently means every active field is non-empty, not that Rofo has enough high-value information.

## 4. Free-Form Context Gap

### Current free-form paths

| Input | Stored where | Affects recommendations? | Reaches Brief? | Reaches broker? | Extracted? |
|---|---|---:|---:|---:|---:|
| Business Profile “Anything else” | `featureOther`, local profile and lead fields | Generally no | Only indirectly where retained | Yes, as requirement prose | No |
| Generic lead message/notes | Lead `requirements` | No | No automatic structured linkage | Yes | No |
| Location Brief notes | Brief `notes` | No | Yes | Via Brief | No |
| Live-market additional notes | `liveMarketInvestigation.additionalNotes` | No | Yes | Yes, through Project Snapshot/email | No |
| Live-market confirmed requirements | Brief investigation object | No retroactive ranking | Yes | Yes | Already structured, but shallow |

Two different UI controls bind to the same `featureOther` property, mixing “other selected feature” with a broad additional-requirements narrative.

The USA Shoe Company prose illustrates the architectural problem:

```text
What the user said:
purchase + budget + preferred range + smaller/expandable alternative
+ business activity + customer-facing use + operating/storage use
+ four location preferences + parking + seller flexibility
+ ASAP + zoning/use diligence

What Rofo structurally understood:
location + property type + one coarse size bucket
+ flat features + opaque other text
```

The prose survives in lead-oriented text, but most of its meaning never becomes recommendation input, readiness evidence, explainable criteria, or reusable context. This is the central Requirement Intelligence gap.

## 5. Proposed Requirement Object

### Ownership and shape

```json
{
  "schemaVersion": "requirement:v1",
  "id": "req_...",
  "revision": 3,
  "status": "draft",
  "title": "USA Shoe Company — Orlando acquisition",
  "business": {
    "businessProfileId": null,
    "name": "USA Shoe Company",
    "description": "Customer-facing shoe repair and personal-service operation",
    "archetypeIds": ["walk_in_service"],
    "currentLocations": [],
    "people": {},
    "customers": {},
    "operatingContext": {}
  },
  "objective": {
    "summary": "Purchase an Orlando property supporting customer service, repair, storage, and expansion",
    "transactionTypes": ["purchase"],
    "decisionType": "relocate_or_expand"
  },
  "propertyTypes": [],
  "activities": [],
  "locationLogic": {
    "anchors": [],
    "candidateLocations": [],
    "employeeGeography": [],
    "customerGeography": [],
    "serviceTerritory": [],
    "rationale": []
  },
  "sizeCapacity": {
    "current": null,
    "preferred": {},
    "minimum": {},
    "future": {},
    "derivation": []
  },
  "economics": {
    "transactionType": "purchase",
    "budget": {},
    "occupancyCostAssumptions": [],
    "unknowns": []
  },
  "timing": {
    "target": {},
    "currentLease": {},
    "criticalDates": []
  },
  "growth": {
    "horizon": null,
    "expectedState": {},
    "strategies": []
  },
  "criteria": [],
  "readiness": {
    "location": {},
    "propertySearch": {},
    "marketResponse": {}
  },
  "provenance": {
    "createdAt": "...",
    "updatedAt": "...",
    "conversationId": "conv_...",
    "sourceDocuments": []
  }
}
```

### Canonical criterion

```json
{
  "id": "criterion_secure_yard",
  "dimension": "site.secure_vehicle_storage",
  "value": {
    "type": "boolean",
    "boolean": true
  },
  "status": "REQUIRED",
  "scope": "property",
  "propertyType": "industrial_flex",
  "source": "user_statement",
  "sourceRefs": ["turn_7"],
  "confidence": 1,
  "rationale": "Fourteen service vans remain onsite overnight.",
  "inference": {
    "proposedBy": "ai",
    "confirmedByUser": true
  },
  "authority": "business",
  "updatedAt": "..."
}
```

Allowed statuses:

- `REQUIRED`
- `PREFERRED`
- `FLEXIBLE`
- `UNKNOWN`
- `VERIFY`

Recommended supporting enums:

- `source`: user statement, user correction, AI inference, uploaded document, Rofo knowledge, external record, broker, property representative.
- `authority`: business, Rofo, external/property, professional.
- `scope`: location, property, economics, timing, diligence.
- `confidence`: numeric internally, displayed as plain-language uncertainty where useful.

### Property-type extensions

Use namespaced dimensions in a registry:

```text
universal.location.employee_access
universal.capacity.preferred_area
office.occupancy.peak_attendance
industrial.site.secure_yard
industrial.loading.grade_level
retail.customer.destination_behavior
medical.infrastructure.plumbing
life_science.utilities.lab_gases
```

Each registry entry defines value type, permitted units, applicable property types, default authority, decision relevance, readiness implications, inference rules, confirmation requirements, and whether it is normally deferred to property verification.

This avoids both extremes:

- It is not an AI blob because decisions live in typed, validated criteria.
- It is not a 300-field form because only applicable dimensions become criterion instances.
- New property knowledge extends the registry without altering the universal object.
- The conversation is not generated directly from schema order.

## 6. AI Conversation Architecture

### Proposed turn cycle

```text
User answer
   ↓
AI extraction proposal
   ↓
Deterministic validation and canonicalization
   ↓
Requirement merge with provenance
   ↓
Contradiction and readiness evaluation
   ↓
Candidate question generation from domain registry
   ↓
AI selects and phrases one high-value question
   ↓
UI receives:
- assistant response
- proposed/accepted changes
- readiness changes
- next question
- explanation, when useful
```

The model should return a structured turn result, not mutate stored Requirement JSON directly:

```json
{
  "assistantMessage": "...",
  "proposedOperations": [
    {
      "operation": "upsertCriterion",
      "criterion": {}
    }
  ],
  "possibleInferences": [],
  "contradictions": [],
  "nextQuestion": {
    "dimension": "industrial.site.secure_vehicle_storage",
    "reasonCategory": "property_fit",
    "question": "Do those vans stay at the property overnight?"
  },
  "recommendedAction": "ASK"
}
```

The server then:

1. Rejects unknown dimensions and invalid states.
2. Prevents AI from assigning external facts as confirmed.
3. Requires confirmation for consequential inferences.
4. Applies accepted operations.
5. Calculates readiness independently.
6. Stores or returns an append-only turn audit in prototype debug state.
7. Sends the validated result back to the client.

“I don’t know” should update the relevant criterion to `UNKNOWN`, not trigger repeated questioning. Questions better answered through property diligence should create `VERIFY` criteria and no longer block Location readiness.

## 7. Deterministic vs AI Responsibilities

| Layer | Responsibility |
|---|---|
| Deterministic Rofo knowledge | Dimension registry, property-type applicability, allowed value shapes and states, taxonomy mappings, readiness gates, stopping thresholds, authority boundaries, Knowledge Graph facts, recommendation adapters. |
| AI reasoning | Extract ordinary language, propose implications, identify contradictions, select the highest-value unresolved dimension, phrase a natural question, explain consequential learning, summarize changes. |
| User authority | Business activities, priorities, preferences, tolerances, budgets, timing, plans, and correction of consequential inference. |
| External/property authority | Availability, zoning/permitted use, actual electrical capacity, structural suitability, landlord terms, effective economics, and specialist diligence. |

Specific guardrails:

- AI cannot convert `UNKNOWN` into a known value without new evidence.
- AI cannot convert `VERIFY` into confirmed.
- AI cannot silently promote `PREFERRED` to `REQUIRED`.
- AI inference should begin as proposed, not accepted, when it materially removes options.
- Deterministic code owns readiness.
- Recommendation explanations must identify which projected criteria were actually consumed.

## 8. Model/API Recommendation

### Current repository state

No LLM provider, AI SDK, model binding, prompt registry, structured-output layer, or AI credential convention exists in the repository. The current “recommendation models” are authored deterministic data and JavaScript resolvers. The package dependencies are Eleventy and `xlsx`; Wrangler is a development dependency.

### Smallest architecture-consistent prototype

Use one private Cloudflare Pages Function endpoint with:

- Native `fetch` or a Cloudflare inference binding.
- A narrow internal `RequirementModelClient` interface.
- Server-only credential binding.
- JSON Schema-constrained model output.
- Deterministic validator and merge layer.
- A versioned prompt and dimension-registry version.
- Session-local Requirement and transcript sent with each request.
- No new database requirement for the first prototype.
- No provider SDK dependency until a provider-specific capability proves necessary.

The model itself should be selected through the three acceptance scenarios, not by brand assumption. Use a model capable of reliable structured output and tool/function-style calls, then evaluate extraction accuracy, question quality, schema compliance, latency, cost, and stability.

### Error behavior

- Invalid structured response: one constrained repair retry.
- Second invalid response: preserve current Requirement and display a recoverable retry state.
- Timeout: do not lose the user answer.
- Provider failure: never fabricate a Requirement update.
- Validation failure: record in prototype debug output without exposing internal stack details.
- Contradictory user information: ask a focused clarification rather than choosing silently.

### Privacy and logging

- Do not log full raw conversations by default.
- Redact email, phone, and obvious personal identifiers before operational logging.
- Keep model-provider retention configuration explicit.
- Separate product-evaluation logs from application error logs.
- Include user-visible language before uploaded documents or employee/customer geography are introduced.
- Log prompt version, model identifier, latency, token usage, validation result, and scenario—not secrets or unnecessary business prose.

## 9. Readiness & Stopping Model

### Hybrid readiness

The AI may recommend readiness, but a deterministic evaluator owns the result.

```json
{
  "state": "READY",
  "blockingDimensions": [],
  "importantUnknowns": [],
  "verifyLater": [],
  "evidence": [],
  "evaluatedBy": "requirement-readiness:v1"
}
```

### READY_FOR_LOCATION

Minimum conditions:

- Business objective is intelligible.
- Property type or operating pattern is sufficiently classified.
- At least one location driver or explicit starting geography exists.
- Core activities that affect geography are understood.
- Scale is known enough to avoid an obviously irrelevant location frame.
- No unresolved contradiction blocks location reasoning.

Not required: exact budget, exact building systems, definitive zoning, or exact area if capacity/operating scale is sufficient.

### READY_FOR_PROPERTY_SEARCH

Additional conditions:

- Minimum or acceptable size/capacity is understood.
- Transaction type is known or explicitly flexible.
- Material operating activities are captured.
- Property-disqualifying criteria are represented.
- Timing is sufficient for a search.
- Important technical unknowns are marked `UNKNOWN` or `VERIFY`.
- Growth strategy is understood when it materially affects property fit.

### READY_FOR_MARKET_RESPONSE

Architecturally definable but outside the prototype:

- Identity/anonymity and representation status known.
- Market and property types sufficiently bounded.
- Material disqualifiers clear.
- Timing and transaction intent credible.
- Noise-producing unknowns resolved or visibly declared.
- User explicitly authorizes sharing.

### Ask versus stop

The deterministic layer creates candidate unresolved dimensions classified as `BLOCKING`, `HIGH`, `MEDIUM`, `LOW`, or `DEFER`.

Ask another question when a blocking contradiction exists or a high-value dimension could change location, eliminate property classes, materially change economics/timing, or prevent unsafe certainty.

Stop when the target readiness state is met, no unresolved dimension is blocking or high, remaining matters belong to property/external diligence, recent answers have not materially changed the Requirement, or the user elects to proceed. Do not expose a completion percentage.

## 10. Location Intelligence Adapter

### Recommended interface

```text
Requirement revision
      ↓
recommendation projection
      ├─ modelKey
      ├─ facts
      ├─ constraints
      ├─ priorities
      ├─ locations
      ├─ projected source mappings
      ├─ unconsumed criteria
      └─ projection warnings
      ↓
existing resolver
```

### Direct mappings today

| Requirement signal | Existing target |
|---|---|
| Candidate locations | `locations`, city, market, district anchor |
| Property type | `spaceType`, model selection |
| Size | `size` / `approximateSquareFootage` |
| Business type/archetype | `businessType` |
| Activities | `operationalUse` |
| Office environment | `officeEnvironment` |
| Employee geography | `commuteOrientation` |
| Growth | `expectedGrowth` / growth priority |
| Client visits | `clientVisitFrequency` / client access |
| Recruiting | `recruitingImportance` |
| Transit | Transit priority |
| Parking | Parking priority |
| Institution proximity | Constraint |
| Location openness | `locationIntent` |

### Rich Requirement signals currently ignored or weakly consumed

- Transaction type, including purchase.
- Detailed budget and occupancy economics.
- Current lease dates and option deadlines.
- Capacity derivation and alternative size strategies.
- Expansion mechanisms.
- Secure fleet storage.
- Detailed loading and truck behavior.
- Repair/manufacturing process.
- Exact utility or infrastructure uncertainty.
- Seller flexibility.
- Customer/service territories.
- Criterion status distinctions.
- Source, confidence, rationale, and provenance.
- Contradictions and rejected interpretations.

The adapter should return these as unconsumed. They remain valuable in the Requirement and eventual broker handoff even when they do not alter ranking.

### Why an adapter is preferable

Benefits:

- Preserves the canonical Requirement from resolver-specific field compromises.
- Avoids rewriting the current recommendation engine.
- Permits separate adapters by market/property-type model.
- Makes ignored information observable.
- Enables regression comparison against current Business Profile scenarios.
- Prevents AI-generated prose from flowing directly into scoring.

Tradeoff: until resolvers expand, the Requirement will know more than Location Intelligence uses. Explanations must not imply full consumption, and adapter mappings become versioned product logic requiring tests.

## 11. Requirement / Business Profile / Location Brief Ownership

```text
Business Profile
Who the business is across decisions
         │
         └──── referenced by
                    ↓
Requirement
What real estate must accomplish for this decision
                    │
                    ├─ projected into recommendation inputs
                    └─ referenced by
                              ↓
Location Brief
Location recommendation and reasoning for a Requirement revision
```

Therefore:

- Requirement should not replace Business Profile conceptually.
- Requirement should not contain the entire Business Profile.
- The current Business Profile UI should eventually become a conversational view that updates both reusable business context and decision-specific Requirement content.
- For compatibility, the existing Search Profile payload should become a projection from Requirement.
- Requirement and Location Brief should be separate linked objects.
- A Location Brief should reference `requirementId` and `requirementRevision`, while retaining a snapshot for historical reproducibility.
- A lead should reference the same Requirement revision.
- The conversation transcript should be separate from the canonical Requirement.

Migration implication: current `searchProfile` snapshots can remain temporarily, but should stop being treated as the authoritative upstream object.

## 12. Persistence Strategy

### Private prototype

Use:

- In-memory application state.
- Optional session storage for refresh recovery.
- Exportable JSON for scenario review.
- Optional explicit “save test record” endpoint only if cross-review becomes necessary.
- No contact requirement.
- No lead creation.
- No production Location Brief creation.

Prototype state may include the conversation, validated Requirement, pending proposed changes, readiness result, recommendation projection, resolver output, and debug/evaluation metadata.

### Production boundary

A durable Requirement eventually needs:

- Stable `requirement_id`.
- Monotonic revision number.
- Current canonical JSON.
- Immutable or append-only revision snapshots.
- Creation and update timestamps.
- User edits and corrections.
- AI-derived versus user-confirmed distinctions.
- Source references/provenance.
- Prompt, dimension-registry, and validator versions.
- Recommendation projection/version.
- Linked Location Brief IDs.
- Linked lead/referral IDs.
- Access and sharing controls.

Recommended production persistence:

- D1 as canonical structured envelope and revision index.
- JSON document per revision, consistent with the current Brief/lead style.
- Separate event or revision table rather than mutating history away.
- KV only as prototype/fallback, not the eventual sole source of truth.

## 13. Private Prototype UX

### Smallest useful experience

```text
┌─────────────────────────────┬──────────────────────────────┐
│ AI conversation             │ Live Requirement             │
│                             │                              │
│ One question at a time      │ Objective                    │
│ Natural-language answer     │ Business context             │
│ Optional quick choices      │ Activities                   │
│ “I don’t know”              │ Location and why             │
│ Why this matters            │ Size / capacity              │
│                             │ Economics / timing / growth  │
│                             │ Required / Preferred         │
│                             │ Flexible / Unknown / Verify  │
└─────────────────────────────┴──────────────────────────────┘
```

Required controls:

- Start from pasted prose or a short opening prompt.
- Answer conversationally.
- Quick choices only when they reduce effort.
- “I don’t know.”
- Edit or correct interpreted criteria.
- Accept/reject a consequential inference.
- See source and rationale in a lightweight detail view.
- View final Requirement independent of lead submission.
- Restart/load each test scenario.
- Toggle internal debug data for evaluators.

Optional, if cleanly isolated:

- “Preview Location Recommendation.”
- Run the Requirement adapter against existing logic.
- Clearly show projected and unconsumed signals.

Not needed: authentication, PDF generation, production visual polish, durable accounts, lead submission, or broker workflow changes.

## 14. Three Acceptance Scenarios

The cases should be scenario fixtures only. The interview and schema must contain no scenario-specific branches.

### Case A — USA Shoe Company

Expected Requirement evidence:

- Orlando acquisition objective.
- Purchase, budget at or below $1.2M.
- 8,000–12,000 SF preferred.
- Smaller property flexible if expansion is credible.
- Customer-facing personal service plus repair, operating, and storage activity.
- Lee Road, Edgewater, College Park, and East Colonial as candidate geographies with reasons to clarify.
- Parking.
- Seller flexibility.
- ASAP.
- Use/zoning at each property marked `VERIFY`.

Quality test: recognize the tension between a preferred size range and a smaller expandable alternative without flattening either into one bucket.

### Case B — Northstar Advisory

Expected Requirement evidence:

- SF office.
- 45 employees, 35–40 peak attendance.
- Approximately 10,000 SF as an estimate, not unquestioned truth.
- Frequent client visits.
- Employee geography, BART access, recruiting, culture, and image.
- Growth to 55–60.
- Downtown/BART preference with rationale.
- Lease expiration in 14 months.
- Flexibility and future capacity implications.

Quality test: ask about peak attendance and workplace purpose before treating headcount as a direct square-foot calculation.

### Case C — Bayline Equipment Services

Expected Requirement evidence:

- East Bay industrial/flex.
- 32-person HVAC/refrigeration service operation.
- Emerging 15,000–20,000 SF range.
- Fourteen vans growing toward twenty.
- Secure yard or vehicle storage.
- Warehouse/storage and repair activities.
- Grade-level loading.
- Occasional semi access.
- Three-phase power with exact capacity `UNKNOWN`.
- Employee and service geography.
- Growth.
- Lease expiration in 11 months.

Quality test: infer that overnight fleet storage may matter, confirm it, and preserve exact power capacity as unknown rather than inventing amperage.

Across all cases, evaluate question quality and economy, correct uncertainty, property-type adaptation, broker-grade artifact quality, correction behavior, recommendation-projection transparency, and value before lead submission.

## 15. Broker Handoff Compatibility

### Current observed model

1. Lead submission creates a pending record.
2. Deterministic routing selects OfficeFinder, broker, or both.
3. An operator approves the fulfillment destination.
4. OfficeFinder receives structured legacy fields plus concise comments.
5. Direct broker referrals link back to a lead and Location Brief.
6. The broker reviews the opportunity before contact is revealed.

OfficeFinder’s adapter already accepts Location Brief context by placing a durable URL and Project Snapshot in `Comments`. Direct referrals similarly surface the Brief URL and requirement summary.

### Smallest future change

Attach to the lead:

```text
requirement_id
requirement_revision
requirement_url
requirement_summary
```

Then:

- Include the Requirement link beside the Location Brief link.
- Add a compact, broker-readable Requirement summary to the Project Snapshot.
- Include the Requirement link/revision in OfficeFinder `Comments`.
- Include the same link on the broker referral page and email.
- Preserve the immutable Requirement revision used at referral time.

Avoid flattening the entire Requirement into OfficeFinder’s legacy fields. The canonical artifact should travel by durable link, with compact compatibility projections in existing payload fields. No change to routing logic is necessary.

## 16. Staged Implementation Plan

These are architecture stages, not an approved roadmap.

| Stage | Objective | Likely files/systems | Dependencies | Principal risks | Acceptance criteria |
|---|---|---|---|---|---|
| **A. Private conversation prototype** | Test whether the interaction asks good questions and creates a useful live Requirement. | New private page, isolated client module, private Function endpoint, prototype fixtures. | Dimension registry draft, model access, three scenarios. | Prompt overfitting, latency, accidental production coupling. | All scenarios complete; no lead or production writes; evaluators can correct criteria and export results. |
| **B. Canonical schema and validator** | Establish Requirement v1 types, criterion registry, deterministic merge/readiness logic, and fixtures. | New `lib/requirements/` modules and focused tests. | Product agreement on universal dimensions and authority rules. | Schema explosion or overly generic blobs. | Invalid dimensions/states rejected; Unknown/Verify preserved; all scenarios represented without special-case schema. |
| **C. Recommendation adapter** | Project supported Requirement signals into current recommendation inputs. | New adapter near `lib/recommendations/`; existing normalizer/resolver used read-only. | Stable Requirement schema and mapping table. | Explanations overstate consumption; regression. | Current SF office outputs remain stable for equivalent inputs; mappings and unconsumed criteria are visible; Northstar preview works. |
| **D. Production persistence boundary** | Create stable Requirement IDs, revisions, provenance, and sharing controls. | New Functions API, D1 schema, Requirement renderer. | Privacy/access decisions and schema stability. | Migration and sensitive-data exposure. | Revisions reproducible; corrections create traceable changes; links are access-controlled appropriately. |
| **E. Business Profile evolution** | Replace rigid intake experience with Requirement conversation while preserving compatibility projections. | `pages/find-locations.njk`, profile partial/client, analytics, compatibility adapter. | Prototype validation and persistence. | Conversion regression and legacy analytics breakage. | Requirement value is available before contact; legacy recommendation and lead paths still receive valid projections. |
| **F. Location Brief linkage** | Make Brief a recommendation artifact for a specific Requirement revision. | Recommendation client, Brief canonicalizer/API/public renderer. | Requirement persistence and adapter. | Duplicate ownership and stale snapshots. | Brief stores Requirement ID/revision plus immutable snapshot; explanations cite consumed criteria. |
| **G. Broker handoff attachment** | Transfer the Requirement without repeating discovery. | Lead payload, Project Snapshot, OfficeFinder comments, broker email/referral page. | Durable Requirement URL and permission model. | Oversharing or stale revision. | Both OfficeFinder and direct broker paths receive the elected revision; routing behavior remains unchanged. |

A safer ordering than the originally suggested phases is to establish the schema/validator alongside the prototype rather than after it. The prototype needs enough deterministic structure to test uncertainty and correction honestly, but it does not need production persistence.

## 17. Architecture Risks

| Risk | Mitigation |
|---|---|
| Hallucinated requirements | Structured proposals, authority rules, source references, confirmation for consequential inference, deterministic merge. |
| Over-questioning | Marginal-value classes, target-readiness selection, repeated-no-change stopping signal, deferred dimensions. |
| Under-questioning | Property-type readiness gates and blocking contradiction checks. |
| Model inconsistency | Low-variance settings, structured output, prompt versioning, deterministic validators, scenario regression suite. |
| Prompt drift | Repository-owned prompts, explicit versions, golden scenario transcripts, review diffs. |
| User correction complexity | Stable criterion IDs, explicit edit/reject operations, correction provenance, immediate visible updates. |
| Sensitive business information | Private-by-default prototype, server-side credentials, redaction, minimal logs, retention controls. |
| Latency | One model turn per user turn, compact structured context, no unnecessary agent loops, UI preservation of the answer. |
| Model cost | Short prompts, registry retrieval scoped to applicable property type, token telemetry, scenario cost budgets. |
| Property-type explosion | Universal envelope plus namespaced criterion registry; load only applicable dimensions. |
| Recommendation coupling | Versioned projection adapter and unconsumed-signal reporting. |
| Persistence complexity | Session-local prototype first; introduce IDs/revisions only after experience validation. |
| Legacy Business Profile compatibility | One-way compatibility projection from Requirement rather than dual authoritative schemas. |
| False confidence around `VERIFY` | External-authority dimensions cannot be AI-confirmed; display Verify prominently. |
| Conversation transcript becoming canonical | Store transcript separately; canonical Requirement is validated state. |
| AI inventing the domain model | Registry controls dimensions, states, types, and readiness rules. |
| Unsupported market/property models | Capability metadata and honest fallback behavior; do not imply every criterion affected ranking. |
| Contact-gated value | Keep Requirement and its review screen usable before handoff election. |
| Stale Requirement in a referral | Pin each Brief and referral to an immutable Requirement revision. |
| AI-provider lock-in | Small internal model-client interface and provider-neutral turn schema. |
| Silent production side effects | Private routes, no calls to lead/Brief submission APIs, explicit environment guard. |

## 18. Open Product Decisions

Only these require genuine product judgment before production:

1. What is the default target readiness state: Location or Property Search?
2. Which consequential AI inferences require explicit confirmation versus editable visibility?
3. Is a user-provided company name needed for a useful artifact, or can a Requirement remain anonymous?
4. What business context belongs in a persistent Business Profile versus only in one Requirement?
5. How should location openness be expressed when a user names several areas but has not stated whether alternatives are acceptable?
6. Should a Requirement be shareable by secret link, authenticated access, downloadable artifact, or some combination?
7. What employee/customer geography granularity is acceptable from a privacy perspective?
8. Can users omit contact indefinitely while retaining a useful local Requirement?
9. How prominently should unsupported/unconsumed recommendation criteria be disclosed to users versus internal evaluators?
10. When a user edits a consequential inference, should Rofo ask for rationale or simply accept the correction?
11. Which economic questions earn a place before Location readiness?
12. Should the first production release support all property types or deliberately expose only validated interview domains?
13. What quality threshold must a Requirement meet before Rofo offers broker handoff?
14. Does the portable Requirement artifact show provenance/confidence or translate those into simpler user language?

## 19. Recommended First Implementation Sprint

Do not execute this sprint yet.

### Objective

Build a private, non-production Requirement conversation harness that tests whether one AI model plus deterministic Requirement logic can produce broker-grade outputs for the three acceptance cases.

### Strict scope

- One private prototype route.
- Left-side conversation and right-side live Requirement.
- Session-local state only.
- A small universal Requirement schema.
- A bounded property-type dimension registry for office, retail/service, and industrial/flex.
- Structured model turn output.
- Deterministic validation, merge, readiness, and stopping logic.
- Edit/reject capability for interpreted criteria.
- Scenario loader.
- JSON export.
- Internal debug panel.
- Optional SF office recommendation preview through a new adapter.
- No lead, Location Brief, routing, email, D1, or broker mutations.

### Likely new systems

- `lib/requirements/schema`
- `lib/requirements/dimensions`
- `lib/requirements/validator`
- `lib/requirements/readiness`
- `lib/requirements/recommendation-projection`
- Private prototype page/client.
- Private model-call Function.
- Scenario fixtures and evaluation rubric.

These are conceptual locations, not prescribed filenames.

### Sprint dependencies

- Access to one structured-output-capable model.
- Agreement on the initial criterion representation.
- Explicit prototype privacy policy.
- Acceptance transcripts or expected Requirement artifacts for the three cases.
- Decision on whether recommendation preview is required or stretch scope.

### Acceptance criteria

- No production endpoint or behavior changes.
- No user contact is required.
- Each scenario produces a readable standalone Requirement.
- Unknown and Verify remain distinct.
- Consequential inferences can be corrected.
- Property types lead to materially different questions.
- The interview stops without exhausting a form-like checklist.
- Every criterion has source/provenance.
- Invalid model output cannot corrupt state.
- Repeated runs are sufficiently stable for qualitative evaluation.
- The optional recommendation preview reports both consumed and unconsumed Requirement signals.
- An experienced tenant broker can evaluate the result without reading the transcript.

## Final Answer

**Can Rofo add Requirement Intelligence as a clean new product layer on top of the existing Location Intelligence and broker-handoff system without requiring a rewrite of the current recommendation architecture?**

**Yes.**

The existing architecture already contains the necessary seams:

- Structured profile normalization before recommendation.
- Deterministic, explainable resolvers.
- A repository-owned Knowledge Graph and commercial taxonomy.
- Separate Location Brief persistence.
- Adapter-based OfficeFinder and direct-broker fulfillment.
- Durable links and Project Snapshots for handoff.

The required change is additive: introduce a canonical Requirement and project supported signals into today’s recommendation inputs. The current resolver does not need to be rewritten.

What must not be obscured is that Requirement Intelligence will initially understand substantially more than the current recommendation system can use—especially for purchase economics, retail/service operations, industrial technical criteria, timing, and expansion. The adapter must expose that boundary honestly. Over time, richer recommendation models can consume more Requirement dimensions without changing the Requirement’s canonical structure or the broker-handoff architecture.
