# Rofo vNext — SF Office Production Integration

## Status

Implemented as a controlled, reversible production architecture. Public activation is not enabled by repository defaults and still requires the D1 migration, a deployed build, and an explicit Cloudflare Pages environment-variable change.

## Eligibility

The public contract requires all of the following:

- `LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_ENABLED=true`
- canonical market ID `san-francisco`
- exactly one property type: `office`
- an allowed entry source in `LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES`

The source allowlist defaults to `space_type,district`. It can explicitly support `city` and `business_brief`, but those sources are not in the initial default rollout. Operator access remains independently controlled by `LOCATION_BRIEF_V2_OPERATOR_ENABLED` and `LOCATION_BRIEF_V2_OPERATOR_KEY`.

The browser route and create API both enforce eligibility. A URL alone cannot activate v2 for Medical, Retail, Industrial/Flex, other markets, or ambiguous completed Requirements.

## Routes

- `/location-requirement/` is the noindex production Requirement surface. Its Pages Function checks the runtime flag, source allowlist, and EntryContext before serving the static interview. Ineligible or disabled requests receive a temporary redirect to `/find-locations/` with supported context preserved.
- `/location-brief/{publicId}` is the stable Brief route. `LB2-…` resolves the persisted v2 object; existing `LB-…` IDs continue through the unchanged v1 retrieval and renderer.
- `/operator/location-brief-v2/` and `/prototype/requirement-v1/` remain operator-only paths and are never emitted by the production journey.

All Requirement and Brief responses remain private/no-store and noindex. Public district exploration continues to use canonical district URLs. Return-to-Brief context is stored only in same-origin session storage and contains no edit capability or Requirement data.

## EntryContext

The public product-education CTA supplies bounded context parameters which the production Requirement normalizes into EntryContext:

- SF city: market
- SF Office page: market + Office
- SF district page: market + source district, with property type asked when unknown
- supported SF Office Business Brief: market + Office + reviewed business identity/archetype
- source type/path, campaign, query family, referrer, and landing page where available

Market and property type are trusted only when canonical. A district remains candidate/comparison context and has zero scoring effect. Business identity remains a Business Environment prior. If a district page user selects a non-Office property type, the browser transfers the context to the existing `/find-locations/` path instead of persisting an unsupported v2 Brief.

## Requirement and persistence

The accepted adaptive Requirement interview is unchanged. Production mode clears prototype session state, skips trusted context, keeps the final `Show recommended locations` action, and posts the canonical Requirement—not UI/interview state—to the existing v2 API.

Creation remains anonymous and contact-free. A cryptographically random public ID is separate from the Secure, HttpOnly, SameSite=Strict owner capability cookie. Public mutations require a same-origin request. A client creation request ID prevents ordinary retries from creating multiple Briefs. Immutable Requirement revisions, revision-bound Recommendation Snapshots, stale-revision checks, candidate provenance, presentation grouping, and owner-only edit/resume remain unchanged.

Public API creation rejects any canonical Requirement other than SF Office. Existing v2 Brief reads and owner edits remain available after flag rollback so saved work is not stranded.

## Location Brief v2

The accepted renderer is reused behind the stable Brief route. It retains FULL, BOUNDED, and INVESTIGATE rendering; candidate assessment; partial-knowledge handling; one independently supported candidate comparison; district media; representative buildings; comparison; exploration; and edit/resume. Public mode suppresses operator debug and changes only route/action wiring.

The stable route branches by persisted public-ID namespace. It does not migrate, rewrite, or recalculate v1 records.

## Find actual spaces and commercial boundary

The production next-step CTA opens the existing `/find-locations/` high-intent assistance flow. The click itself creates no lead. It carries:

- market and Office context
- recommended/considered district labels
- v2 Brief public ID and stable URL
- original EntryContext source/path, district, and Business Brief archetype when present

The existing contact form and `/api/leads/submit` remain the commercial submission boundary. On an actual submission, the server loads the current Brief, verifies the owner cookie, and appends a concise current Requirement/recommendation context to the existing requirements/Project Snapshot path. Existing lead creation, routing, OfficeFinder generation, approval, tenant email, and broker economics are otherwise unchanged. A Brief is never attached based solely on an untrusted public ID.

## Analytics

The existing Search Profile analytics endpoint now accepts these bounded vNext events:

- `vnext_requirement_started`
- `vnext_requirement_completed`
- `vnext_brief_viewed`
- `vnext_district_explored`
- `vnext_requirement_edited`
- `vnext_find_spaces_clicked`
- `vnext_commercial_request_submitted`

Payloads contain route/source context, device data already supported by the endpoint, readiness, and the high-entropy Brief reference where useful. Raw Requirement content and contact PII are not emitted to analytics.

## Intelligence-gap persistence

Migration `0005_location_brief_v2_public_sf_office.sql` adds `location_brief_v2_intelligence_gaps` at the unit:

`Brief × Requirement revision × Recommendation Snapshot × district × property type × intelligence dimension`.

Each new snapshot persists bounded gap fields: market, property type, district, dimension, Requirement signal, materiality, blocking status, reason, and timestamp. It does not add an EOS dashboard or aggregation job. KV fallback continues to retain the gaps inside the immutable snapshot; the normalized gap table is D1-only.

## D1

Migration 0005 also adds `location_brief_v2_creation_requests` for retry idempotency. It contains only a client mutation ID, created Brief public ID, and timestamp. The migration is additive and does not alter v1 tables or existing v2 rows.

Local migration validation completed successfully. The production migration has deliberately not been applied automatically.

## Privacy and security boundary

- high-entropy view IDs generated with Web Crypto
- separate hashed owner capability in a Secure, HttpOnly, SameSite=Strict cookie
- edit authority absent from URLs, HTML, and public district return context
- same-origin checks on public create/update mutations
- owner verification before canonical Requirement API reads, edits, debug/history, or commercial-context attachment
- public debug disabled even for guessed query parameters
- noindex, private/no-store Brief and Requirement responses
- no raw Requirement analytics
- no contact fields before recommendations

The view URL is intentionally a private bearer-style viewing capability. Sharing and account recovery are not implemented.

## Errors and retries

- disabled/ineligible entry falls back to the existing flow
- unsupported completed Requirement is rejected server-side even if client checks are bypassed
- save errors retain browser answers and present a retry message
- creation request IDs make repeated creates idempotent
- stale edits return 409 and require refresh
- unavailable storage returns a retryable private error rather than creating a lead or fabricated recommendation
- missing district media/buildings continue to degrade through existing v2 presentation fallbacks

## Rollout

Initial real-user exposure is limited by two controls:

1. the public enable flag; and
2. the explicit source allowlist, defaulting to SF Office property-type and SF district product-education CTAs.

The city page and Business Brief integration are implemented but require adding `city` or `business_brief` to the source allowlist. This avoids an automatic all-SF launch without introducing an experiment platform.

## Enablement

1. Deploy the reviewed build while the public flag is absent or `false`.
2. Apply the additive production migration: `npx wrangler d1 migrations apply rofo-leads --remote`.
3. Verify the migration list and D1 tables.
4. In Cloudflare Pages → rofo-11ty → Settings → Variables and Secrets, set production variable `LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES=space_type,district`.
5. Set production variable `LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_ENABLED=true`.
6. Redeploy if required for the Pages environment changes to take effect.
7. Run the FULL, Mission Bay candidate, Marin BOUNDED, unsupported-property, lead-isolation, noindex, and mobile smoke checks before widening the source allowlist.

Do not set `city` or `business_brief` in the source allowlist until the first surface cohort is accepted.

## Rollback

Set `LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_ENABLED=false` (or remove it) in the Cloudflare Pages production environment and redeploy if required. New product-education CTA visits will redirect to the existing `/find-locations/` flow. Existing v2 Brief URLs and owner edits remain readable; v1 Briefs, leads, and stored v2 records are untouched. Do not roll back the additive D1 migration or delete v2 data.

## Performance

Local per-route esbuild measurements before minification:

- v2 create Function: approximately 2.33 MB
- stable Location Brief resolver/renderer: approximately 2.29 MB
- lead submit Function with owner-authorized v2 context adapter: approximately 2.31 MB

The complete minified Pages Functions build was also measured with Wrangler:

- uncompressed bundle: 14,740,628 bytes
- gzip upload size: 1,421,710 bytes

Cloudflare applies the Worker upload limit after gzip compression (currently 3 MB on Free and 10 MB on Paid), with a separate 64 MB pre-compression limit. The measured Pages bundle is therefore below both published limits. Most of its uncompressed weight predates this integration and comes from generated operator/admin intelligence JSON; the v2 shared runtime itself is approximately 33 KB of source. No blocking bundle split was justified in this sprint. Requirement and Brief cold-start behavior still requires observation on the limited deployed cohort because bundle eligibility does not establish runtime performance.

## Validation

- focused public integration QA
- Location Brief v2 lifecycle/product QA
- Requirement, readiness, Access, Business Environment, composition, Marin, Mission Bay, Medical, and presentation-group QA
- v1 Location Brief handoff QA
- lead, routing, OfficeFinder compatibility QA
- SF production recommendation QA
- representative-building and district-destination QA
- local D1 migration application
- full Eleventy build and diff validation

## Known limitations

- No account recovery or explicit sharing controls.
- The existing find-spaces intake can reuse route/Brief context but is not yet a dedicated Property Requirement experience.
- Analytics aggregation and intelligence-gap operator/EOS views are not implemented.
- Production remote migration, deployment, and flag enablement remain manual release actions.
- Cold-start behavior must be observed on the limited live cohort; local bundle size is not a substitute for production telemetry.
