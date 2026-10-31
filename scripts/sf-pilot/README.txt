Rofo SF tenant pilot — local review only
Baseline d053e0208a9db18e93839cef8bfea593ad072128

Production configuration and exact-output authorization remain unchanged. No pilot
flag or credentials are set in production. Do not deploy, push, migrate remotely,
activate entry points or send real email/inquiries without separate approval.

Local source configuration: wrangler.sf-pilot.local.jsonc contains deliberately
synthetic keys and a nonexistent remote database ID. These are test fixtures, not
production credentials. NEVER use it for a deployment or public host.

Data / services
- migrations/0009_sf_tenant_pilot.sql: additive pilot-only tables; no legacy data rewrite.
- functions/_sf-pilot: access/security, research/catalog, immutable reviewed shortlists,
  scoped consent/inquiries, durable email jobs and UI. /sf-pilot/** is disabled unless
  SF_TENANT_PILOT_ENABLED=true, LEADS_DB exists and SF_PILOT_ACCESS_KEY has >=32 chars.
- Location Brief remains canonical. Extra workspace constraints reference its revision.
- Pilot-only preferences restrict research districts without changing district scoring.
  Empty selection never widens scope; unsupported matches may yield fewer than3.
- No source facts, prices, existing district rules, image rights or available inventory
  are inferred. Catalog is historical seed, not a publication authorization.
- Pilot research never creates a legacy lead/referral or logs personal data to Sheets.
- Existing generic send paths reject marked or enrolled pilot records independently
  of the pilot feature flag; disabling the pilot cannot open a referral bypass.
- Private fields do not enter public Brief projection, static catalog, sitemap or analytics.

Local verification (Node24 plus installed project dependencies)
  node scripts/qa-sf-tenant-pilot.cjs
  node scripts/qa-sf-pilot-concurrency.cjs
  node scripts/qa-sf-pilot-referral-isolation.mjs
  node scripts/qa-sf-pilot-catalog.mjs
  node scripts/qa-sf-pilot-mail.cjs
Tests use disposable synthetic SQLite and mocked provider calls; never open existing
Wrangler or customer DBs. The catalog suite covers54 combinations. Migration rehearsal
uses Wrangler --local with a separate --persist-to directory and the local-only config.

Browser harness
  node scripts/sf-pilot/local-server.cjs
  http://localhost:8790/__review
This loopback-only Node harness executes the actual handlers and SQL via a D1-shaped
SQLite adapter. It is not a production route, and it is separate from actual Pages/
workerd local-runtime validation. All server outbound fetches throw; its HTML CSP
blocks third-party browser analytics/fonts. Static assets must come from a local
rehearsal build. The synthetic staff key is in the local config. Synthetic records
persist only in ../implementation-output/synthetic-review.sqlite across restarts.

Staff workflow
1. Tenant completes existing canonical SF interview and opens the pilot continuation.
2. Intake asks only missing workspace details, district scope and reply contact.
   Checkbox requests Rofo research/email only, never referral authority.
3. Staff logs in locally, reviews saved requirements, district scope and feedback.
   Prepare assembles a source-backed unpublished draft; staff can exclude item IDs.
4. Check sources, units, privacy, named users, capacity, term and limitations. Explicit
   review publishes the immutable shortlist version. Do not invent3-5 matches.
5. Prepare email creates a durable job and expiring mailbox-claim grant. Local mock
   delivery cannot send real email. Preview email and follow the fragment-token link;
   deliberate POST claims it. GET/scanners never consume it or authorize contact.
6. Tenant saves/dismisses/comments. Edits create new context requiring fresh review;
   stale cards are hidden and pending permissions held.
7. Interest availability/pricing/tour creates an internal request. Staff verifies an
   actual authorized recipient; tenant then sees exact fields/purpose/recipient and
   gives a fresh unchecked permission. Staff readiness is not tenant consent.
8. Staff records a manual outcome/receipt or an unknown state. No operator-contact
   adapter exists; this code does not send or book inquiries. Scope is pilot application
   paths, not preventing a person independently emailing outside the application.

Access / failure handling
- Claims expire24h; sessions30days server-side, staff sessions8h. Sessions are scoped
  per search and coexist across searches; cross-device tenant access can edit only
  the linked canonical Brief. No plaintext claim/session token is stored.
- Claims are fragments; no automatic exchange. Public/tenant/staff writes use cookie-
  bound CSRF plus exact Origin, or Chrome no-referrer native-navigation Origin:null
  only with browser-controlled Sec-Fetch-Site:same-origin and mode:navigate.
- Search-generation revocation invalidates sessions/claims and suppresses pending mail.
  Recovery uses the saved mailbox and a non-enumerating response, with rate limits.
- Consent stores exact visible text, payload hash, recipient/purpose/item, private and
  canonical context, shortlist version and access grant. Recheck at mutation time.
- Unknown email outcome is not retried blindly. Resolve provider evidence before
  changing state; failed-before-acceptance jobs alone are retryable automatically.
  Resend idempotency cannot replace durable application history after its24h window.

Real email remains OFF. The tested Resend transport requires all of:
  SF_PILOT_EMAIL_SEND_ENABLED=true; SF_PILOT_MAIL_MODE=resend;
  approved HTTPS SF_PILOT_ORIGIN matching request; existing RESEND_API_KEY and
  RESEND_FROM_EMAIL. No real keys were read/provisioned. Before enabling, separately
  approve staging/production sends, verify sender/reply handling and disable provider
  click/open tracking for private access mail. Local mock mode works only on loopback.
  Do not relabel provider acceptance as delivery.

Release / rollback
- Freeze source, generated inputs, catalog and asset hashes. Use the EXISTING guarded
  public-rehearsal mode with isolated empty output directories. Default npm build still
  requires the old approved production digest and intentionally rejects changed output.
  Do not edit/disable that guard or its authorization to obtain a passing local build.
- Rehearse additive migration on isolated D1; backup/rollback plan needs approval before
  any real migration. Roll back application by disabling pilot flag while preserving
  pilot records; legacy send guards must remain for enrolled searches. No DROP is needed.
- Human reviewer/inquiry owner, retention/contact-correction policy and staged email
  acceptance are operational prerequisites. AI assistance is safe source-based draft
  preparation here; no provider calls or personal-data transfer were introduced.

Final invited-cohort release
Read OPERATIONS.txt and RELEASE.txt. Apply additive0010 after0009 locally; staff
issues a Brief/mailbox-bound personal invitation and manually delivers its one-use
link only through approved email. Owning an ordinary Brief/typing an email is not
admission. Revoking invitation stops related private capabilities; sign-out also
ends the browser invitation session. Uninvited SF searches retain ordinaryRofo.
The invitation-aware suite is included in npm run qa:sf-tenant-pilot. Local browser
harness supports SF_PILOT_REVIEW_PORT/SF_PILOT_REVIEW_OUTPUT for isolated candidates.
