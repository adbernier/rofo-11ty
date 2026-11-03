Universal Tenant Experience — one local implementation candidate
Baseline: 68258e1d120d95216a26bffc5b52910d664a3b54. No commit/deployment authority.

Isolation
UNIVERSAL_TENANT_EXPERIENCE_ENABLED must equal 'true' at build time for shared entry links and at runtime for the new entry/API/Brief handlers. Otherwise the old experience remains. This switch does not enable email or external inquiries. Existing SF pilot/private/email flags are unchanged. Never copy the synthetic harness keys/configuration to production.

Local preparation
 node scripts/universal-tenant/build-assets.cjs
 node scripts/universal-tenant/qa.cjs
 node scripts/universal-tenant/client-state-qa.cjs
Use the existing public-rehearsal build procedure with a NEW EMPTY output directory; keep all publication guards intact. Migration 0011 is additive and local-only here, using existing D1. Existing local harness applies migration fixtures to isolated SQLite; no remote migration command is used.
Start the existing scripts/sf-pilot/local-server.cjs with explicit SF_PILOT_REVIEW_PORT, SF_PILOT_REVIEW_OUTPUT, SF_PILOT_REVIEW_BUILD and UNIVERSAL_TENANT_EXPERIENCE_ENABLED=true. It binds 127.0.0.1 only and blocks every external fetch. /location-requirement/ is the actual server-integrated entry, not a separate HTML simulation.

Data/security
initialSearch holds normalized typed headcount, workspace preference and applicable questions. initialOrigin is immutable provenance and never silently reintroduced as an active market/district filter. No count implies attendance or available capacity. Canonical Brief revisions, reviewed catalog data and price safeguards are reused. Immediate guidance has its own bounded projection and does not relax deeper diligence rules.
Each anonymous Brief uses a separate HttpOnly owner capability, with server-enforced 30-day expiry. No token is placed in a URL or browser storage. Feedback is browser-local. Rofo-only question and interest requests are private rows in universal_tenant_inquiries, scoped to owned canonical Brief/revision. Message/email are requested only after initial value. No lead, referral or delivery job is created. UT enrollment markers permanently block reachable legacy referral paths, including when disabled.
Staff use the existing protected /sf-pilot/staff session. The new queue appears there. They may inspect the question/interest and prepare a named-recipient proposal with role and verification evidence. Tenants see the exact stored payload and purpose, grant fresh permission, decline or withdraw. Changing requirements or recipient invalidates consent; writes recheck revision/version. The new queue has no dispatch adapter and no automatic email. Recorded permission alone must never be treated as a send result. Staff must verify reply address and recipient before any later approved external action.
Existing SF private shortlist/recovery/email workflows remain separate and retain eligibility, expiry, scoped permission, recipient checks and retry semantics. This candidate does not add cross-device recovery or email delivery for universal queue records. Those are explicit operational limitations, not simulated success states.

Safe disable / release boundary
No production changes have been made. Before any proposed release: review exact source/artifacts,0011 compatibility, targeted tests, remaining browser checks and operational limitations; obtain separate approval. To disable after future universal records exist, use THIS guarded candidate with the switch off and retain all data/referral barriers. Do not blindly roll back to 68258e1 code that predates universal record protection. Pages build/runtime switches require a reviewed configuration/build deployment; do not promise an instant toggle.

Copy/evidence
The 48-string approved COPY object is unchanged. Functional status and request-save controls outside that library are documented operational additions; no false shared/sent confirmation is used. District examples still carry verification notes. Source research remains October 29, 2026. Insufficient retail/industrial/flex/other-market inventory produces district-first or guided coverage, never fabricated matches. No operator photography or new market research.
