# San Francisco Public Experience Certification

Status: Ready as of 2026-08-24. Photography is finite nonblocking polish.

## Certification boundary

SF Public Experience is Ready when the certified Office, Retail, Industrial, and Flex decision graph is publicly discoverable from the city and space-type pages; every recommendation geography has a useful canonical surface and representative content; certified examples connect business questions to those surfaces; canonical, indexability, EntryContext, mobile, accessibility, and claim-safety checks pass; and compatibility routes have a deliberate disposition.

The source of truth is `_data/sfPublicExperienceCertification.js`. Mission Control derives the status from that reviewed manifest and the underlying repositories; imagery does not override recommendation or structural experience readiness.

## Compatibility dispositions

- Marina District and Mission District remain useful parents. Their Retail children own the distinct decisions.
- Design District redirects permanently to the single Showplace Square / Design District decision owner.
- Mission and South Park remain contextual public paths because the graph explicitly preserves them; they do not score or own recommendation decisions.
- Broader Bayview remains neighborhood context. Bayview Industrial owns the operational decision.
- Potrero Hill remains public, with Industrial/Flex relevance explicitly bounded to its eastern/base edge.

## Controlled rollout and rollback

| Flow | Flag | Repository default | Recommended next state | Rollback |
| --- | --- | --- | --- | --- |
| SF Office | `LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_ENABLED` | Off | Keep the current controlled cohort | Set false/remove, then redeploy if required |
| SF Retail | `LOCATION_BRIEF_V2_PUBLIC_SF_RETAIL_ENABLED` | Off | Ready for staged enablement after an operator smoke test | Set false/remove, then redeploy if required |
| SF Industrial/Flex | `LOCATION_BRIEF_V2_PUBLIC_SF_INDUSTRIAL_FLEX_ENABLED` | Off | Ready for staged enablement after an operator smoke test | Set false/remove, then redeploy if required |

When disabled, new entries use the established legacy `/find-locations/` fallback with supported context preserved. Existing private v2 Briefs and saved Requirement data remain readable; disabling a flag does not delete or migrate persisted state. No environment value is changed by this certification.

## Claim boundary

Public surfaces describe durable location fit, character, access, representative environments, and tradeoffs. They do not claim live availability, vacancy, rents, permitted use, guaranteed performance, precise travel times, or current building specifications. Property-level facts remain part of a later market investigation.

## Photography backlog

Approved imagery currently covers 7 of 24 recommendation geographies. The remaining 17 IDs are projected by the certification manifest from canonical presentation data. Pages omit absent media cleanly, so photography remains a separately visible, finite enhancement rather than a readiness gate.

## Human-controlled priority

The current priority remains `SF Public Experience` until a human selects the next company priority. EOS does not select a successor automatically.
