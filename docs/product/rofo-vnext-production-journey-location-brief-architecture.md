# Rofo vNext — Production Journey + Evolving Location Brief Architecture

## 1. Executive Recommendation

Evolve Location Brief into Rofo’s persistent search workspace, but introduce it as a versioned `location-brief:v2` aggregate rather than modifying existing Brief records in place.

The recommended architecture is:

Entry Context  
→ canonical Location Requirement  
→ Recommendation Readiness  
→ versioned Recommendation Snapshot  
→ evolving Location Brief  
→ Property Requirement  
→ Market Investigation  
→ optional Connection  
→ future RFP

Three boundaries are essential:

1. Anonymous Requirement and recommendation activity must not create a lead.
2. User-entered Requirement data is canonical; recommendations and readiness are recalculable derived snapshots.
3. Existing `location-brief:v1` URLs and records remain readable through a compatibility renderer.

The first production sprint should be an operator-only SF Office v2 Brief draft that persists the existing canonical Requirement and readiness result without changing lead, broker, or OfficeFinder behavior.

No code was changed during this architecture sprint.

## 2. Current Production Journey Audit

### Entry surfaces

| Entry | Current context carried forward | Current behavior |
|---|---|---|
| Homepage | None | Links directly to `/find-locations/`. |
| Header/mobile navigation | None | “Get My Recommendation” links to `/find-locations/`. |
| City page | City, state, source path | Query parameters seed the Business Profile location. |
| Property-type city page | City, state, property type | Uses `spaceType` query context and skips manual re-entry where correctly mapped. |
| District page | City, state, district | District is seeded as selected location context. |
| Comparison page | Two location labels | Seeds both comparison locations. |
| Building page | Usually city and state | Does not consistently preserve building identity or district provenance. |
| Business Brief | Market, property type, archetype in its CTA | The CTA uses `space_type` and `business_type`, but the current parser expects `spaceType` and does not consume business identity. Market reaches the flow; important Business Brief context is currently lost. |
| Other SEO/editorial pages | Varies | Usually links to `/find-locations/` with source and partial market context. |

The common production entry adapter is currently a set of URL parameters parsed in [search-profile.js](/Users/alanbernier/projects/rofo-11ty/js/search-profile.js:203), rather than a canonical EntryContext object.

### `/find-locations/`

The production page is a Business Profile interview, not the new Requirement interview.

For Office, it requires:

- Target market or area
- Property type
- Business type
- Operational use
- Office environment
- Commute orientation
- Expected growth
- Institutional proximity when applicable

For non-Office, it generally asks:

- Target market
- Property type
- Size or people
- Property features

Current assumptions predating Requirement Intelligence include:

- Growth belongs before Office recommendation.
- Medical is grouped near Healthcare / Life Science.
- Non-Office flows move quickly into size and property features.
- Candidate locations can be represented as selected locations without richer provenance.
- Readiness means all configured form steps are filled, rather than enough Location-stage information being known.

### Client-side persistence

The Business Profile is stored in browser `localStorage` under `rofoSearchProfileV1`.

On completion, a recommendation context is written to session and local storage as `rofoRecommendationContextV1`. No permanent server object is created at this point.

For the main `/find-locations/` path:

- Contact information is not collected before recommendations.
- No lead is created.
- The browser redirects to `/recommendations/`.

This is a useful existing low-friction behavior.

### `/recommendations/`

The route is a static production page whose client code reads browser-local recommendation context.

It renders:

- Business Profile summary
- Executive summary
- “Best Fits”
- District details
- Comparative guidance
- Representative buildings
- Current-availability/market-investigation intake
- Contact form

If browser context is unavailable, it can fall back to a sample/expert-guided presentation. The route itself is not a persistent personalized URL.

Representative buildings are explicitly examples of district character, not live availability.

### Permanent Location Brief creation

A permanent Brief is created only when the user submits the recommendation-page contact form to `/api/location-brief/submit`.

Required:

- Name
- Email

Optional:

- Company
- Phone

For a market-investigation request, the page also requires enough execution context such as business type, size or headcount, and timing.

That submission performs several side effects:

1. Creates a `location-brief:v1` record.
2. Generates a stable `LB-…` URL.
3. Stores Location Brief events.
4. Creates a lead-dashboard record when lead storage is configured.
5. Resolves a broker/OfficeFinder route.
6. Builds an OfficeFinder payload in `officefinder_pending_approval`.
7. Sends an internal approval notification.
8. Sends an immediate tenant confirmation for Live Market Investigation.
9. Embeds a Project Snapshot in the Brief and lead.

OfficeFinder submission itself remains approval-gated rather than automatic.

### Current journey summary

```text
SEO/home entry
→ /find-locations/
→ browser-local Business Profile
→ browser-local recommendation context
→ /recommendations/
→ recommendation/report
→ contact or investigation form
→ permanent Brief + lead + routing + notifications
→ operator approval
→ OfficeFinder/broker workflow
```

The major architectural mismatch is that saving the durable product object and requesting commercial assistance are currently the same operation.

## 3. Current Location Brief Audit

### Schema and ownership

The canonical serializer is `location-brief:v1` in [location-brief/_shared.js](/Users/alanbernier/projects/rofo-11ty/functions/api/location-brief/_shared.js:26).

The Brief owns copies of:

- Search Profile
- Recommendation summary
- Market path
- Priorities
- Feedback
- Notes
- Live Market Investigation
- Contact
- Project Snapshot
- Engine/graph versions
- Broker and OfficeFinder placeholders

### Storage

Storage uses:

- D1 when `LOCATION_BRIEFS_DB` or `LEADS_DB` is configured
- KV when `LOCATION_BRIEFS_KV` or `LEADS_KV` is configured

D1 stores the full Brief as JSON plus contact JSON and basic indexed fields. The current write path is insert-oriented rather than an evolving revision model.

### URL behavior

Permanent Briefs use:

`/location-brief/{publicId}`

The rendered page is `noindex, nofollow`.

The stable URL is a valuable product asset, but the current page includes contact information and is protected only by possession of a relatively short public identifier. `noindex` is not an authorization mechanism.

### Lifecycle

The code declares statuses including:

- `draft`
- `submitted`
- `received`
- `broker_assigned`
- `under_review`
- `tour_planning`
- `locations_shortlisted`
- `completed`

In practice, canonical creation sets the Brief to `submitted`. There is no tenant-facing state-transition or edit API demonstrating this full lifecycle.

### Editability and resumability

- The browser-local recommendation state is editable by returning to `/find-locations/`.
- The permanent Brief URL is read-only.
- Editing the Business Profile does not update an existing permanent Brief.
- Recommendations are not recalculated inside a persisted Brief.
- There is no edit token, ownership session, revision history, or authenticated owner model.

### Recommendations

Recommendations persist as `marketPath` and a recommendation summary. These are copied output rather than a snapshot explicitly tied to a canonical Requirement revision.

The current Brief cannot reliably distinguish:

- What the user entered
- What Rofo inferred
- Which engine/evidence generated each recommendation
- Whether a later Requirement edit made the recommendation stale

### Representative buildings

The recommendation experience has useful representative-building behavior. A Live Market Investigation can preserve selected representative buildings.

The permanent Brief’s default Representative Buildings section otherwise says they may be added during expert review; it is not an evolving tenant-managed property list.

### Notes and expert review

User notes persist. Expert notes are currently a presentation placeholder rather than an implemented collaborative record.

### Project Snapshot

Project Snapshot is a compact operational projection containing:

- Market
- Property type
- Business type
- Selected district
- Headcount
- Approximate size
- Timing
- Notes
- Growth
- Top districts

It is useful for notifications and OfficeFinder comments but should remain a derived operational projection—not the canonical Requirement.

### Valuable concepts to preserve

- Stable Brief identity and URL
- Noindex behavior
- Durable D1/KV storage abstraction
- Recommendation engine/version provenance
- Market path and tradeoff presentation
- Representative-building framing
- Live Market Investigation concept
- Project Snapshot
- Approval-gated OfficeFinder routing
- Lead dashboard integration
- Location Brief event stream

### Older assumptions to replace

- Brief creation and lead creation are one operation.
- A Brief begins only after contact capture.
- The Brief is immutable after submission.
- Recommendation output is stored without a Requirement revision.
- “Submitted” is the default lifecycle.
- Public-ID possession is sufficient privacy for contact-bearing pages.
- Business Profile, Property Requirement, and investigation facts are copied into overlapping shapes.
- Every supported-looking profile can receive “Best Fits.”

## 4. Future Location Brief Job

The future Location Brief should be the persistent container for the entire search decision:

### Search

The current canonical Requirement and a concise tenant-facing “Your search” projection.

### Location Intelligence

One of:

- Recommended locations
- Strong starting points
- Investigation guidance

### Comparison

Requirement-specific strengths, tradeoffs, unknowns, and differences.

### Exploration

Districts the user has opened, added, retained, or removed.

### Property Requirement

Later-stage criteria including size, timing, economics, growth, layout, storage, parking quantity, loading, specialized improvements, and property-level constraints.

### Market Investigation

Explicit requests to evaluate current inventory, buildings, market conditions, and alternatives.

### Property candidates

Properties under consideration, their evidence, user status, and verification needs.

### Connection

Broker or expert relationship, only when requested or operationally necessary.

### Future RFP

A controlled publication of a particular Requirement revision and selected disclosure fields.

The Brief should not duplicate every object. It should own references and current pointers.

## 5. User Mental Model

The clearest mental model remains:

> My Location Brief is where Rofo keeps everything about my location search.

That fits:

- What Rofo understands
- Recommended or investigated areas
- Saved districts
- Property needs
- Buildings under consideration
- Notes
- Market investigation
- Broker interaction
- Future responses

“Workspace” is a useful internal architecture term but is heavier than necessary for tenant-facing copy.

Do not rename the production product yet.

## 6. Entry Context

Introduce one route-independent object:

```text
EntryContext
- schemaVersion
- entryContextId
- sourceType
- sourcePath
- sourceEntityId
- marketId
- propertyType
- candidateDistrictIds[]
- propertyId?
- businessArchetypeId?
- businessIdentityId?
- campaign
- queryFamily
- referrer
- landingPage
- capturedAt
```

### Semantics

- `marketId`: trusted context; skip asking when canonical.
- `propertyType`: trusted when sourced from a property-type route.
- `candidateDistrictIds`: comparison context, never a fit boost.
- `businessArchetypeId`: trusted source context but still a prior.
- `propertyId`: exploration interest, not automatic property suitability.
- Raw source identity remains available for attribution.

### Entry behavior

| Surface | EntryContext |
|---|---|
| Homepage | Source only |
| City page | Market |
| Property-type city page | Market + property type |
| District page | Market + candidate district |
| Business Brief | Market + property type + archetype/business identity |
| Building page | Market + district + property interest |
| Comparison page | Market + candidate districts |

Fixing Business Brief parameter compatibility should occur through this adapter, not through more route-specific parsing.

## 7. Requirement Persistence

### Creation timing

Create an anonymous v2 Brief when the first meaningful user mutation is made after EntryContext hydration.

Examples:

- Homepage: after the first valid market answer
- City page: after the user confirms or supplies property type
- Property-type page: after the first new answer
- District page: after the user begins the Requirement

This avoids creating server records for passive page views while preserving early work.

### Identity

Assign:

- Internal UUID
- High-entropy public/view identifier
- Separate edit capability
- Anonymous browser ownership session

### Anonymous use

No account should be required.

Use:

- Server-persisted anonymous Brief
- Secure, HttpOnly owner session where practical
- Recoverable bookmark URL
- Separate explicit share token
- Optional email-based recovery later

### Versioning

Requirement changes create monotonic revisions:

```text
Requirement revision 1
Requirement revision 2
Requirement revision 3
```

The Brief points to the current revision. Old revisions remain available for audit and deterministic snapshot comparison.

A full event-sourced system is unnecessary initially. Immutable Requirement revisions plus a current pointer are sufficient.

### Recalculation

When the current Requirement revision changes:

1. Mark derived recommendation status `STALE`.
2. Re-run readiness and composition.
3. Persist a new Recommendation Snapshot.
4. Preserve the previous snapshot for history.
5. Do not overwrite user candidate state.

## 8. Contact Information Timing

### Do not request contact for

- Starting a Requirement
- Viewing recommendations
- Exploring districts
- Editing the search
- Saving anonymously in the current browser
- Receiving FULL, BOUNDED, or INVESTIGATE guidance

### Ask for email when

- Saving across devices
- Recovering the Brief
- Sharing with collaborators
- Receiving investigation results
- Requesting actual-property assistance

### Ask for name/company when

- Creating a durable identified collaboration
- Requesting market investigation
- Requesting broker/expert help
- Preparing an RFP

Company may also be supplied earlier as useful business context, but it should not be conflated with lead identity.

### Ask for phone when

- The user requests calls, tours, broker connection, or time-sensitive property work
- Routing truly requires it

Do not request phone merely to save the Brief. Preserve the existing OfficeFinder placeholder behavior only inside the explicit handoff adapter while the downstream system still requires it.

### Lead economics

Saving an email for Brief recovery should create a contact identity or communication consent record, not a sales lead.

High-intent actions remain lead-worthy:

- Investigate current availability
- Find actual spaces
- Connect me with an expert
- Arrange tours
- Send an RFP

## 9. Recommendation Readiness Journey

Recommendation readiness is derived from a specific Requirement revision.

### FULL

User sees:

- Your search
- Recommended locations
- How they differ
- Areas already considered
- Explore districts
- Edit search
- Find actual spaces

The Brief persists:

- Requirement revision
- Readiness snapshot
- Recommendation snapshot
- Candidate-location provenance
- Comparison/explanation snapshot

### BOUNDED

User sees:

- Your search
- Strong starting points
- A short coverage boundary
- Areas worth further investigation
- Investigate the market
- Edit search

Do not display evaluator vocabulary such as “blocked candidate.”

The Brief internally retains those diagnostics for operator and Market Foundation use.

### INVESTIGATE

User sees:

- Your search
- What matters most
- Why investigation is needed
- Recommended next step
- Begin Property Requirement or request market investigation

No unsupported three-district shortlist is stored or shown.

The Brief remains valuable because it preserves:

- Requirement
- Search priorities
- Readiness explanation
- Investigation tasks
- Subsequent Property Requirement
- Connection state

INVESTIGATE is a valid product result, not an error state.

## 10. Location Brief Information Architecture

Use progressive sections rather than a dashboard.

### Always visible

1. **Your search**
2. **Current guidance**
3. **Areas you’re considering**
4. **Next step**

### FULL additions

- Recommended locations
- How they differ
- Explore
- Find actual spaces

### BOUNDED additions

- Strong starting points
- Brief investigation boundary
- Potential areas requiring research

### INVESTIGATE additions

- What matters most
- Property-specific considerations
- Investigation plan

### Later-stage sections

Only appear when populated:

- Property needs
- Properties under consideration
- Market investigation
- Expert connection
- Future RFP and responses

Representative buildings belong under Explore or Investigation and must continue to be labeled as examples unless availability has been verified.

## 11. District Exploration

Use public district pages initially rather than building a duplicate embedded district system.

The link pattern should carry a return context:

```text
/location-brief/{briefId}
→ district page?brief={briefId}&from=explore
→ return to Brief
```

The district page may show authenticated/capability-aware actions:

- Add to my list
- Remove from consideration
- Compare
- Return to my search

Public content remains indexable and generic. Brief-specific controls are private enhancement, not page canonicals or SEO content.

An embedded detail panel may be considered later if mobile return behavior or context loss proves poor.

## 12. Candidate Location State

Model candidate state separately from recommendation scoring.

```text
CandidateLocation
- briefId
- canonicalDistrictId
- presentationGroupId?
- sourceIdentityId?
- provenance[]
- recommendationRole
- userDisposition
- firstAddedAt
- updatedAt
```

### Internal provenance

Possible provenance:

- `ROFO_RECOMMENDED`
- `USER_ENTRY_CONTEXT`
- `USER_ADDED`
- `ROUTE_SEEDED`
- `BUSINESS_BRIEF_CONTEXT`
- `EVALUATED_NOT_SHORTLISTED`
- `INTELLIGENCE_GAP`

### User disposition

- `CONSIDERING`
- `REMOVED`
- `UNDECIDED`

Do not use user disposition as a score.

Normal UI only needs labels such as:

- Recommended by Rofo
- Already on your list
- Added by you
- Needs investigation

“Evaluated but not shortlisted” usually remains internal unless the user explicitly asks about that district.

## 13. Property Requirement Transition

The stage changes when the primary question changes from:

> Where should this business look?

to:

> What must an actual property support?

Trigger it when the user chooses:

- Find actual spaces
- Investigate availability
- Refine property needs
- Compare specific buildings
- Request expert help

Property Requirement continues the same canonical Requirement aggregate. It does not start an unrelated form.

Facts already known are reused:

```text
Activity: inventory storage exists
Location decision: Office only
Property-stage next question: How much storage do you need?
```

Location-stage facts remain editable but should not be re-asked.

Property-specific dimensions may include:

- Size and peak attendance
- Growth
- Economics
- Timing
- Lease/purchase intent
- Layout/program
- Storage and loading
- Parking quantity
- Specialized use/buildout
- Outdoor/yard needs
- Power
- Permitted use
- Verification requirements

## 14. Market Investigation

“Investigate the market” should create an explicit, scoped object—not imply an automated live-inventory result.

```text
MarketInvestigation
- briefId
- requirementRevisionId
- requestedScope
- targetDistrictIds[]
- targetPropertyIds[]
- status
- automationTasks[]
- expertTasks[]
- findings[]
- requestedAt
```

Operationally it can include:

- Complete missing Property Requirement facts
- Identify possible properties
- Verify current availability
- Review rent and concession context
- Compare representative and competitive buildings
- Investigate use/buildout constraints
- Request expert or broker review

Clearly distinguish:

- Rofo’s reviewed durable intelligence
- Current market data
- Externally verified property facts
- Expert judgment

## 15. Broker Handoff

Offer connection when:

- The user asks for actual spaces
- Live availability is required
- Tours are requested
- Property diligence is consequential
- INVESTIGATE requires local expertise
- The user explicitly requests a broker

Do not present broker connection as mandatory for viewing recommendations.

On request:

1. Freeze a handoff snapshot tied to the current Requirement revision.
2. Ask for missing contact and consent.
3. Create the lead/Connection.
4. Resolve routing.
5. Preserve approval-gated OfficeFinder submission.
6. Record subsequent routing and communication against the Brief.

## 16. Broker Requirement Artifact

The broker-facing artifact should include:

- Brief URL and revision
- Company/business identity
- Market
- Property context
- Activities
- Employee/customer/patient origins
- Access priorities
- Rofo recommendations or investigation guidance
- Candidate locations and provenance
- Property Requirement
- Properties under consideration
- Timing and economics
- User notes
- Unknown/verify items
- Readiness boundary
- Connection preference

Project Snapshot should remain the short operational projection for email and OfficeFinder. The broker artifact should link to the richer Brief rather than trying to fit everything into comments.

## 17. Future RFP Compatibility

Attach future RFPs to:

- `briefId`
- a frozen `requirementRevisionId`
- a disclosure policy
- selected markets/districts
- selected recipients

Future responses should be separate records:

```text
Rfp
RfpRecipient
PropertyResponse
ResponseEvidence
ConnectionConsent
```

A response may state:

- Yes
- No
- Possible
- Notes
- Proposed property/building facts
- Verification status

Do not mutate the canonical Requirement from a landlord response. Responses are external assertions until accepted or verified.

## 18. Proposed Data Model

```text
LocationBrief
- id
- publicId
- schemaVersion
- lifecycleStage
- currentRequirementRevisionId
- currentRecommendationSnapshotId?
- entryContextId
- ownerSessionId
- contactIdentityId?
- createdAt
- updatedAt
- archivedAt?

EntryContext
- source and attribution fields
- canonical known market/property/district/business context

Requirement
- id
- briefId
- currentRevision

RequirementRevision
- id
- requirementId
- revision
- canonical Requirement JSON
- changedBy
- createdAt

RecommendationSnapshot
- id
- briefId
- requirementRevisionId
- readiness
- plausibleUniverse
- shortlist
- comparison
- explanations
- intelligenceGaps
- engine/foundation versions
- createdAt

CandidateLocation
- canonical district reference
- presentation identity
- provenance
- recommendation role
- user disposition

MarketInvestigation
- scope, status, tasks, findings

PropertyCandidate
- canonical property/building reference
- user status
- evidence and verification state

Connection
- contact/consent
- route
- broker
- lead/OfficeFinder references
- status

Future
- Rfp
- RfpRecipient
- PropertyResponse
```

Property Requirement should remain stage-scoped criteria within the canonical Requirement model. A separate table may index Property-stage state, but it should not duplicate the facts.

## 19. Canonical vs Derived State

### Canonical

- Business identity and raw description
- Activities
- Market/property context
- Employee/customer/patient origins
- Candidate preferences
- Explicit environment preferences
- Access priorities
- Property Requirement
- User district disposition
- User property disposition
- User notes
- Contact consent

### Derived

- Requirement Access Profile
- Plausible candidate universe
- Component results
- Readiness
- Recommendations
- Comparison
- Explanations
- Intelligence gaps
- Project Snapshot
- Broker handoff projection

Every derived artifact records:

- Requirement revision
- Engine version
- Foundation/evidence versions
- Generated timestamp

Old snapshots remain historical evidence, not current truth.

## 20. URL / Persistence / Privacy

Retain the conceptual route:

`/location-brief/{briefId}`

For v2:

- Use a high-entropy identifier.
- Maintain a separate hashed edit capability.
- Store edit authority in a secure owner session.
- Create explicit read-only share links.
- Separate contact PII from shareable Brief content.
- Never render contact details merely because someone possesses the normal share URL.
- Keep all Brief pages `noindex`.
- Apply rate limiting and access logging.
- Allow link revocation/rotation.
- Consider optional email recovery without requiring an account.

Anonymous bookmarkability and privacy must be designed together.

## 21. Existing Brief Migration

Choose:

**B. Create a v2 schema while preserving v1 Briefs, with a compatibility adapter.**

Do not rewrite existing records.

Behavior:

- `location-brief:v1` continues through the existing read-only renderer.
- `location-brief:v2` uses the evolving workspace renderer.
- A legacy adapter can project v1 fields into read-only v2 section shapes.
- V1 Briefs are never recalculated as though they had canonical Requirement revisions.
- Existing URLs remain valid.
- Lead and OfficeFinder references remain untouched.
- Optional operator-assisted “continue this search in v2” creates a new linked v2 Brief.

## 22. `/find-locations/` Migration

Use progressive replacement:

1. Keep `/find-locations/` as the stable public entry route.
2. Put the new Requirement experience behind eligibility and traffic flags.
3. Normalize all route context through EntryContext.
4. For eligible SF Office traffic, render Requirement vNext.
5. For all other traffic, retain current Business Profile.
6. Add a one-way adapter from existing Business Profile state to canonical Requirement.
7. Do not maintain two canonical intake schemas long term.
8. Retire old Office questions only after vNext reaches production parity.
9. Preserve current non-Office flow until equivalent Requirement applicability is reviewed.

Do not wrap the new Requirement inside the old form. That would preserve conflicting readiness and stage assumptions.

## 23. Lead Creation Boundary

Future default:

```text
Browse
→ Requirement
→ recommendation/readiness
→ exploration
→ anonymous Brief
(no lead)
```

A lead is created only on an explicit commercial-assistance action:

- Market investigation requested
- Actual properties requested
- Broker connection requested
- Tour requested
- Expert review requested
- RFP initiated

Saving or emailing a Brief should not silently create a broker lead.

Preserve attribution and contact consent so a later handoff remains commercially useful.

## 24. Analytics

Recommended event taxonomy:

### Requirement

- `requirement_started`
- `requirement_context_applied`
- `requirement_answered`
- `requirement_location_ready`
- `requirement_edited`
- `requirement_resumed`

### Recommendation readiness

- `recommendation_readiness_full`
- `recommendation_readiness_bounded`
- `recommendation_readiness_investigate`
- `recommendations_viewed`
- `recommendation_comparison_viewed`

### Exploration

- `district_explored`
- `district_added`
- `district_removed`
- `brief_returned_from_district`

### Property and investigation

- `property_requirement_started`
- `property_requirement_ready`
- `property_added`
- `market_investigation_started`
- `market_investigation_requested`

### Connection

- `contact_recovery_requested`
- `broker_connection_requested`
- `broker_connection_created`
- `officefinder_approval_requested`
- `officefinder_submitted`

Every event should carry:

- `briefId`
- Anonymous session ID
- Requirement revision
- Readiness
- Market/property type
- EntryContext ID
- Source type/path/entity
- Campaign/query family where available
- Device
- Engine version where relevant

Original attribution must persist into the Brief and later Connection. The current system captures rich Search Profile attribution, but permanent Brief creation resets operational source to `location_brief`; vNext needs a durable lineage reference.

## 25. Intelligence Gap Feedback Loop

Future flow:

Requirement Snapshot  
→ readiness gaps  
→ privacy-safe gap observations  
→ aggregation  
→ operator backlog  
→ research/enrichment  
→ improved foundation version  
→ future recommendations improve

### Persistence boundary

Persist gap observations separately from the user-facing Brief, referencing:

- Brief ID using an internal pseudonymous key
- Requirement revision
- Market
- Property type
- District
- Dimension
- Signal family
- Materiality
- Block status
- Engine/foundation version
- Date

### Privacy

Do not persist raw free-form Requirement text in the gap backlog.

Use normalized signal families such as:

- `EMPLOYEE_ORIGIN_NORTH_BAY`
- `MEDICAL_PROPERTY_TYPE_FIT`
- `PARKING_CORE`

### Deduplication

Deduplicate by:

```text
market
+ property type
+ district
+ intelligence dimension
+ normalized signal family
+ foundation version
+ observation window
```

Maintain occurrence count and distinct anonymous Brief count.

### Frequency

Write observations when a readiness snapshot is created, then aggregate asynchronously. Avoid emitting duplicates on every page view.

### Operator view

Show:

- Repeated gaps
- Materiality
- Affected Requirement count
- Readiness impact
- Markets/property types
- Current foundation version
- Suggested research queue

EOS may consume aggregated priorities later, but this sprint should not couple runtime recommendations directly to EOS.

## 26. Production Rollout

### Phase 0 — Architecture contract

- Define v2 schemas and adapters.
- Add deterministic fixtures.
- No user traffic.
- No lead changes.

### Phase 1 — Operator-only SF Office

- New Requirement and Brief draft behind an internal flag.
- FULL/BOUNDED readiness only.
- Anonymous persistence.
- No lead or broker side effects.
- Existing `/recommendations/` remains fallback.

### Phase 2 — Limited SF Office traffic

- Small eligible traffic cohort.
- FULL, BOUNDED, and INVESTIGATE fallback.
- District exploration and edit/resume.
- Explicit return to old flow available.

### Phase 3 — Explicit investigation/connection adapter

- Add Property Requirement transition.
- Connect only explicit high-intent actions to existing lead and OfficeFinder workflow.
- Preserve approval gate.

### Phase 4 — Additional reviewed markets/property types

Eligibility is foundation-based, not nationally enabled by default. Unsupported combinations receive INVESTIGATE only after its UX and operational follow-up are ready.

### Phase 5 — Property candidates and future RFP foundation

Only after persistent Requirement, investigation, and connection semantics are stable.

## 27. Feature Flags / Rollback

Use orthogonal controls:

```text
locationBriefV2Enabled
requirementVNextEnabled
eligibleMarketPropertyPairs
readinessGateEnabled
anonymousPersistenceEnabled
districtExplorationEnabled
connectionAdapterEnabled
trafficAllocation
operatorMode
```

Evaluation order:

1. Operator override
2. Market/property eligibility
3. Traffic allocation
4. Capability availability
5. Fall back to existing `/find-locations/`

Rollback requirements:

- Disable vNext route rendering without deleting v2 Briefs.
- V2 Brief URLs remain readable in safe read-only mode.
- Existing v1 URLs remain unchanged.
- No rollback mutates leads or OfficeFinder records.
- Requirements remain exportable.
- Public SEO routes remain untouched.
- EntryContext can fall back to legacy query parameters.
- Connection adapter is independently disableable.

## 28. Mobile Experience

Treat the Brief as a linear mobile workspace:

1. Your search
2. Current guidance
3. Compare locations
4. Areas on your list
5. Property needs
6. Next step

Mobile requirements:

- One primary CTA per stage
- Compact summary with progressive disclosure
- Swipe or tab comparison only when accessible
- Persistent “Back to my search” from district exploration
- No desktop-only multi-panel dashboard
- Save state after every meaningful answer
- Resume at the last incomplete action
- Keep evaluator and evidence diagnostics out of normal mode

## 29. Product Naming

| Term | Audience | Recommendation |
|---|---|---|
| Location Brief | Tenant and broker | Keep; it is the persistent product container. |
| Requirement | Internal and broker | Use sparingly with tenants; prefer “Your search” or “What you need.” |
| Location Requirement | Internal architecture | Keep internal. |
| Property Requirement | Internal/broker | Tenant-facing heading can be “What the space needs.” |
| Your search | Tenant | Primary summary label. |
| Recommended locations | Tenant | Use for FULL. |
| Strong starting points | Tenant | Use for BOUNDED. |
| Market investigation | Tenant/operator | Appropriate when live/property research is genuinely requested. |
| Recommendation Readiness | Internal | Do not expose as product jargon. |
| Intelligence gap | Internal/operator | Do not expose directly. |
| Project Snapshot | Internal/broker | Keep as operational projection. |
| Connection | Internal | Tenant copy should say “Connect with an expert” or “Get broker help.” |

## 30. Production Risks

| Severity | Risk | Mitigation |
|---|---|---|
| Critical | Anonymous Brief URLs expose sensitive Requirement/contact data | High-entropy IDs, separate edit/share capabilities, PII segregation, revocation. |
| Critical | Saving a Brief unintentionally creates a lead | Split persistence API from Connection/lead API. |
| Critical | V1 records break during schema evolution | New v2 schema plus compatibility renderer; no destructive migration. |
| High | Recommendations become stale after edits | Tie snapshots to immutable Requirement revisions and mark stale immediately. |
| High | Two competing intake schemas persist indefinitely | Establish canonical Requirement and use a temporary legacy adapter. |
| High | Route/source attribution is lost | Persist EntryContext ID through Brief, snapshots, and Connection. |
| High | Unsupported markets receive authoritative-looking recommendations | Enforce readiness before shortlist materialization. |
| High | Candidate districts leak into ranking | Preserve provenance and user disposition outside component scoring. |
| High | Prototype assumptions are copied into production | Rebuild against production contracts; do not migrate prototype session structures verbatim. |
| High | Lead/OfficeFinder payload loses structured Requirement detail | Versioned broker projection and Project Snapshot derived from the same Requirement revision. |
| Medium | Browser-local state conflicts with server state | Server revision is canonical after draft creation; explicit conflict handling. |
| Medium | Multiple tabs overwrite edits | Optimistic concurrency using revision number/ETag. |
| Medium | Business Brief context remains partially ignored | EntryContext normalization and deterministic source fixtures. |
| Medium | Readiness-gap data contains sensitive raw text | Store normalized signals only; aggregate pseudonymously. |
| Medium | Public district exploration loses Brief context | Return token/context and deterministic add/remove actions. |
| Medium | Mobile becomes a dashboard | Linear progressive sections and one primary action. |
| Medium | Recommendation recalculation becomes expensive | Snapshot caching keyed by Requirement and foundation versions. |
| Low | Terminology becomes internally accurate but user-hostile | Keep “Your search,” “Recommended locations,” and “What matters most.” |

## 31. First Implementation Sprint

### Scope

Implement one operator-only, reversible SF Office `location-brief:v2` draft foundation.

### Deliverables

- Versioned `LocationBriefV2` schema.
- Canonical `EntryContext`.
- Anonymous v2 draft persistence.
- Requirement revision persistence.
- Readiness and recommendation snapshot persistence.
- Stable private v2 Brief URL.
- Owner edit capability.
- Read-only v1 compatibility unchanged.
- Operator-only v2 renderer showing:
  - Your search
  - FULL/BOUNDED guidance
  - Recommended locations or strong starting points
  - Comparison
  - Candidate areas
  - Edit search
- No lead, broker, OfficeFinder, email, or analytics behavior changes beyond isolated operator diagnostics.

### Explicit exclusions

- No public traffic
- No Property Requirement
- No market-investigation submission
- No contact capture
- No broker connection
- No v1 migration
- No public district-page controls
- No RFP work

### Success criteria

- A fresh SF Office Requirement creates an anonymous v2 Brief.
- Refreshing or reopening its owner URL restores canonical state.
- Editing creates a new Requirement revision.
- Derived snapshots recalculate deterministically.
- Old snapshots remain inspectable internally.
- Candidate districts remain neutral.
- FULL and BOUNDED presentation matches private calibration.
- Unsupported combinations cannot receive a shortlist.
- Existing v1 Brief URLs render identically.
- Existing `/find-locations/`, leads, OfficeFinder, public routes, and production recommendation behavior remain unchanged.
- Feature flag rollback leaves all created v2 records readable.

This is the smallest production step that proves the new architecture without prematurely coupling it to lead economics or broker operations.
