# Rofo Location Brief v2 — Operator Foundation

## Scope

This is the first durable production-architecture foundation for `location-brief:v2`. It is operator-only, disabled by default, and bounded to persisted Location-stage Requirements and recommendation guidance. Existing `location-brief:v1`, `/find-locations/`, `/recommendations/`, lead, OfficeFinder, broker, email, public-route, and sitemap contracts are not imported or changed.

## Feature flag and routes

- Flag: `LOCATION_BRIEF_V2_OPERATOR_ENABLED=true`.
- Optional production-host operator key: `LOCATION_BRIEF_V2_OPERATOR_KEY`, supplied as `x-rofo-operator-key`. Without a key, enabled access is allowed only on `localhost` or `127.0.0.1`.
- Operator entry: `/operator/location-brief-v2/`.
- Create API: `POST /api/location-brief-v2/create`.
- Read/update API: `GET|PUT /api/location-brief-v2/{publicId}`.
- Brief: `/operator/location-brief-v2/{publicId}`.
- Every API and Brief response is private, `no-store`, and `noindex`. The static entry page is also `noindex`.

The operator entry is server-rendered behind the same flag/key gate as the APIs. The feature defaults off, so no v2 page enters public traffic. Disabling it leaves v2 records intact.

## Schema and persistence

Migration `0004_location_brief_v2_operator_foundation.sql` creates isolated v2 tables:

- `location_briefs_v2`: identity, schema version, lifecycle, current pointers, EntryContext reference, hashed owner capability, timestamps.
- `location_brief_v2_entry_contexts`: immutable normalized entry context.
- `location_brief_v2_requirement_revisions`: immutable canonical Requirement JSON with monotonic per-Brief revision numbers.
- `location_brief_v2_recommendation_snapshots`: immutable readiness/composition output bound to one Requirement revision.
- `location_brief_v2_candidates`: candidate provenance and user disposition, separate from scoring.

D1 is preferred through `LOCATION_BRIEFS_DB` or the current `LEADS_DB` binding. KV remains a compatible operator fallback through `LOCATION_BRIEFS_KV` or `LEADS_KV`, storing one isolated `location-brief-v2:{publicId}` aggregate. V1 keys and tables are never read or written by v2.

## LocationBriefV2

The physical Brief contract includes:

- `id`: internal UUID.
- `publicId`: 96-bit random capability-resistant lookup ID with `LB2-` prefix.
- `schemaVersion`: `location-brief:v2`.
- `lifecycleStage`: `LOCATIONS_RECOMMENDED` or `LOCATION_INVESTIGATE` in this sprint.
- `currentRequirementRevisionId`.
- `currentRecommendationSnapshotId`.
- `entryContextId`.
- `ownerCapabilityHash`: SHA-256 only; never returned or rendered.
- `createdAt`, `updatedAt`, optional `archivedAt`.

## EntryContext

`entry-context:v1` normalizes blank operator, city, property-type, district, and Business Brief sources. It preserves source path/entity, trusted market/property context, candidate districts, business archetype/identity, property interest, campaign/query/referrer/landing attribution, and capture time.

Semantics:

- Canonical SF and Office route facts can hydrate missing Requirement facts.
- Candidate districts become comparison/candidate state only and receive no fit contribution.
- Business identity remains context for the existing Business Environment prior.
- Property identity remains interest context, not suitability.
- Route-specific interpretation stops at EntryContext normalization.

## Canonical Requirement and revisions

The API persists the approved Requirement object, not browser interview state. Conversation, asked-question history, active question, draft answers, UI mode, and other known UI-state fields are stripped. Requirement facts can later accept Property Requirement enrichment without changing this revision mechanism.

The first mutation creates revision 1. Each edit creates a new immutable `requirement-revision:v1` row and advances the Brief pointer. Revisions are never overwritten. `changedBy` is `anonymous_operator` in this sprint.

## Recommendation snapshots

Every revision is evaluated with the existing private Recommendation Readiness and composition engines. A `location-recommendation-snapshot:v1` stores:

- readiness and rationale;
- plausible universe;
- guarded shortlist;
- comparison/candidate projection;
- explanations;
- structured intelligence gaps;
- product response;
- engine version;
- Access, composition, and Office foundation versions;
- source Requirement revision and creation time.

`INVESTIGATE` snapshots always persist an empty shortlist. The v2 layer does not alter ranking or component logic.

## Candidate locations

Candidate state stores canonical district ID, presentation group, source identity, provenance, and disposition. It is not supplied as a score. Showplace Square and Design District collapse to the canonical Showplace Square presentation geography while retaining both source identities in provenance.

This sprint persists entry-seeded candidate state. Candidate add/remove controls are intentionally deferred, but revisions preserve the stored state.

## Anonymous ownership and privacy

Creation requires no account or contact data. The server generates a separate 256-bit edit token, stores only its SHA-256 hash, and returns the token only in a `Secure; HttpOnly; SameSite=Strict` cookie. The public/view identifier does not grant edit authority. The token is not in the URL, JSON response, HTML, or JavaScript.

The current boundary is device/browser ownership with no recovery or sharing. A high-entropy Brief ID permits private viewing when the operator route is enabled; editing additionally requires the owner cookie. Production deployment should place the operator routes behind the configured key or an equivalent operator access layer.

Raw Requirement content is stored for the product function but is not emitted to logs by v2. Normal rendering receives server-projected values. The edit owner receives canonical Requirement JSON only in the authorized edit surface.

## Edit, resume, and concurrency

`Edit my search` operates on the same stable Brief. The update request must include the current revision number. A mismatch returns `409` and cannot silently replace newer server state. A successful edit creates a new revision, recalculates readiness/composition, creates a new snapshot, advances both pointers, and returns to the same URL.

This is an explicit optimistic revision guard, not a general ETag framework. D1 uniqueness on `(brief_id, revision_number)` and the current-revision conditional update protect the bounded operator flow. A future multi-device editor should use a transaction-aware repository method and first-class ETags.

## Rendering and history

The linear, mobile-first renderer presents:

1. Your search.
2. Current guidance: Recommended locations, Strong starting points, or safe investigation guidance.
3. Areas being considered.
4. Disabled next-step placeholder.
5. Edit my search for the owning browser.

Evaluator internals are absent by default. `?debug=1` adds revisions, snapshots, readiness, timestamps, engine version, current/superseded status, and intelligence gaps for operator inspection.

## Operator product-experience layer

The normal v2 renderer now approximates the intended tenant experience rather than an infrastructure console. Its hierarchy is:

1. **Your Location Brief**, with the plain-language property and market context.
2. **Your search**, as a compact projection of known canonical Requirement facts and a nearby **Edit my search** action.
3. Readiness-appropriate guidance:
   - **Recommended locations** for FULL.
   - **Strong starting points** for BOUNDED.
   - **What matters most** for INVESTIGATE.
4. Requirement-connected recommendation cards with a concise reason, two or three useful strengths, one or two tradeoffs, and a district exploration action.
5. **How they differ**, containing only supported human-readable dimensions whose values differ across the displayed alternatives. Internal scores are never shown.
6. **Areas you're considering**, using the durable candidate state already supported by v2.
7. A disabled next-stage preview that explains the transition from choosing where to look toward defining what an actual space must support.

Normal output does not display schema versions, public IDs, lifecycle/readiness enums, fit enums, revisions, snapshot IDs, confidence internals, evidence traces, or provenance. Debug mode remains available through `?debug=1` and includes Brief identity, lifecycle, revisions, snapshots, readiness, plausible universe/component details, intelligence gaps, engine/foundation versions, candidate provenance, and canonical Requirement JSON.

### District exploration and return context

Recommendation cards link to existing canonical public SF district paths. Before navigation, the private Brief stores a validated return path in browser `sessionStorage` under `rofoLocationBriefV2Return`. The public district template conditionally reveals **Back to my Location Brief** only when that private browser context exists and matches the exact operator Brief route pattern.

This design deliberately avoids query parameters:

- no Brief ID is appended to a public district URL;
- no Requirement data or edit capability is transmitted;
- district canonical URLs, indexable content, sitemap behavior, and default public rendering remain unchanged;
- browsers without private return context see the existing district page unchanged.

Candidate add/remove actions are deferred. The current schema can preserve disposition, but safely mutating it from a public district page would require a bounded owner-authorized endpoint and a canonical district-to-presentation-group action contract. This sprint does not widen the persistence API or make candidate disposition affect the Requirement or recommendation score.

## Rich district presentation and candidate assessment

Recommendation snapshots carry a renderer-oriented district presentation projection sourced from the existing canonical neighborhood media and `recommendationRepresentativeBuildings` data. It includes the canonical district route, at most one approved district image, and the same capped representative-building set used by the production recommendation experience. It creates no new district claims, images, building data, or availability assertions.

Market-wide recommendation readiness remains unchanged. A separate `candidateAssessments` projection records whether a user-selected district is independently assessable for the active Requirement:

- `WELL_SUPPORTED` means the relevant active dimensions have reviewed support.
- `PARTIALLY_SUPPORTED` means canonical identity and supported property fit exist, at least one meaningful Requirement-connected component has reviewed evidence, and every unresolved material dimension can remain explicit.
- `INSUFFICIENT` means the available reviewed intelligence cannot support a useful Requirement-connected assessment.

These are internal presentation states, not user-facing labels. A well- or partially-supported candidate can receive Requirement-connected strengths, known tradeoffs, explicit unknowns, approved media, representative buildings, and an exploration link even when the market-wide result is INVESTIGATE. It remains labeled **Already on your list**; candidate provenance does not change fit, ordering, eligibility, shortlist, or readiness. An insufficient candidate receives a bounded explanation without decorative media or fabricated strengths.

For a candidate-led INVESTIGATE experience, `comparisonAlternatives` contains at most one independently assessable comparison by default. Comparison is a third product standard, separate from recommendation and candidate assessment: it may tolerate a shared explicit UNKNOWN when reviewed Office, Business Environment, parking, or district-character evidence creates a meaningful contrast.

The selector does not create a new recommendation ranking. It filters the existing plausible universe for a well- or partially-supported district, excludes the candidate and presentation-group aliases, requires a supported difference, prefers an alternative activated by the active Business Environment signal when one exists, and then preserves unchanged composition order as its deterministic tie-break. It never changes component results, eligibility, shortlist, or readiness.

Normal presentation labels the result **Another area worth considering**, not a runner-up or recommendation. A client-only focus switch lets the user alternate between the original candidate and comparison district’s existing rich presentation. This switch does not call an API, mutate CandidateLocation state, create a Requirement revision, or recalculate recommendations. Debug output retains the comparison state and selection rationale.

## Contextual product education

The existing shared recommendation-prompt partial is the single product-education module for city/market-guide, district, property-type city, comparison, and Business Brief entry surfaces. Copy varies deterministically by EntryContext and claims reviewed district-comparison capability only for the currently supported San Francisco Office context. Other markets receive bounded requirement-organization language.

Normal public CTAs remain on `/find-locations/` and preserve market, district, property type, source path, and supported Business Brief archetype parameters. District context remains candidate/comparison context. No public link exposes the operator v2 route, and the module does not alter lead submission behavior.

## V1 and commercial isolation

V2 code uses new routes, tables, keys, schema identifiers, and renderer. It does not call the v1 submit endpoint or import lead helpers. Creating/editing a Brief does not create contacts, leads, OfficeFinder payloads, routing decisions, notifications, tenant email, Project Snapshots, market-investigation submissions, or production analytics.

Protected production file hashes recorded during implementation:

- `functions/api/location-brief/_shared.js`: `acc85dbdf85a6ba919ce5cf2f6f62837d782bed899f87f300b2aacc50d9afdc5`
- `functions/api/location-brief/submit.js`: `f62b4401b2d4855865d33b3b1d6d2671658724f7bb2713a74a5d000ffb425d0d`
- `functions/location-brief/[publicId].js`: `1b77f5a482263118a16e973878798b1a951b5663575e3c00cbe7140da4079286`
- `pages/find-locations.njk`: `b26d3545b2ceedd6af92a0e27077d459eeda47e86229dc49a2fbf8fc7dc8e002`
- `pages/recommendations.njk`: `69240598e8cf03aeb1997e9c87ba38f06b95356d0c5195811cd9a6c8b6743bd7`

No sprint edit touches these files.

## Rollback

Set `LOCATION_BRIEF_V2_OPERATOR_ENABLED=false` or remove it. V2 create/read/update/render requests return 404, normal production routes continue unchanged, and existing v2 D1/KV records remain available for later operator re-enablement. Do not roll back migration `0004`; unused isolated tables are harmless and retaining them prevents data loss.

## Local operator test

1. Apply local D1 migrations: `npx wrangler d1 migrations apply rofo-leads --local`.
2. Build: `npm run build`.
3. Start Pages with the flag: `npx wrangler pages dev _site --binding LOCATION_BRIEF_V2_OPERATOR_ENABLED=true`.
4. Open `http://localhost:8788/operator/location-brief-v2/` and choose **Start a new search**.
5. Complete the adaptive interview. Its final **Show recommended locations** action creates the Brief and navigates to its stable URL automatically.
6. Use a recommendation card's **Explore** link, verify the canonical public district URL remains clean, and use **Back to my Location Brief** to return.
7. Refresh, choose **Edit my search**, change the Requirement, and submit **Show recommended locations** again. Open the Brief with `?debug=1` to inspect both revisions/snapshots.
8. Run `npm run qa:location-brief-v2`.

Local Pages should use the configured local D1 binding. KV fallback is covered deterministically by the focused QA.

## Limitations

- The adaptive interview uses explicit `locationBriefV2=new` and `locationBriefV2=edit&brief={publicId}` intents. Operator bootstrap clears compatible prototype session/local storage before constructing state and never writes operator state back to that legacy store. `new` always creates an empty interview; `edit` fetches the current server-canonical Requirement and revision before hydrating the adaptive Requirement experience. Interview UI state is not canonical or persisted.
- There is no account, recovery, share/access grant, candidate exploration control, Property Requirement, market-investigation action, lead action, or analytics.
- Candidate disposition has a durable schema but only entry-context seeding is exposed.
- The operator-key header is suited to scripted/operator access; a later sprint should integrate the chosen production operator-access mechanism before any remote browser rollout.
- Runtime table creation is retained for parity with v1 and operator resilience; production deployment should apply migration `0004` explicitly.
