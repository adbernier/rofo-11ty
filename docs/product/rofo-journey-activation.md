# Rofo Journey Activation

Sprint 10 connects the adaptive Requirement, polished Location Brief, and existing commercial handoff for a controlled real-user cohort. It does not change recommendation logic.

## Flags

| Flag | Default | Purpose |
| --- | --- | --- |
| `LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED` | off | Lets `/best-fit-locations/` route approved public sources into v2. |
| `LOCATION_BRIEF_V2_PUBLIC_UNIVERSAL_ENABLED` | off | Allows Office, Retail, and Industrial/Flex universal Brief creation outside San Francisco. |
| `LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_ENABLED` | off | Enables certified SF Office creation. |
| `LOCATION_BRIEF_V2_PUBLIC_SF_RETAIL_ENABLED` | off | Enables certified SF Retail creation. |
| `LOCATION_BRIEF_V2_PUBLIC_SF_INDUSTRIAL_FLEX_ENABLED` | off | Enables certified SF Industrial/Flex creation. |
| `LOCATION_BRIEF_V2_PUBLIC_SAN_DIEGO_INDUSTRIAL_FLEX_ENABLED` | off | Enables the bounded City of San Diego Industrial/Flex recommendation foundation. When off, San Diego remains Universal/INVESTIGATE. |
| `LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_SOURCES` | canonical defaults | Optional override for the bounded source vocabulary. |

The approved default sources are the primary entry surfaces (`homepage`, `header`, `city`, `space_type`, `district`, `example`) plus bounded existing decision-content sources (`market_guide`, `comparison`, `business_brief`, `product_education`, `insight`, `building`). Source validation remains enabled. Global context-free entry activates only when the entry flag, Universal flag, and all three SF flags are enabled, preventing a user from choosing a deterministically rejected branch after starting.

## First cohort

For the initial approximately 20-user cohort, set all five boolean flags above to `true` and leave the source override unset. If an override is operationally required, include every approved source the cohort will use rather than narrowing it below the public emitters. Confirm `GET /api/analytics/search-profile` returns `persistenceConfigured: true`. Recruit the desired market and space-type mix rather than encoding individual users in product logic.

Rollback is `LOCATION_BRIEF_V2_PUBLIC_ENTRY_ENABLED=false`. The router immediately returns new entries to `/find-locations/`; saved v2 Briefs remain readable. Individual SF or Universal creation flags may then be disabled after the entry flag is off.

## Continuation

Owned SF Office Briefs retain the four-step Property Requirement. Other owned Briefs use `Find Spaces That Fit`, a contact-only continuation that posts to the existing lead endpoint. That endpoint attaches the owned Brief's structured Requirement, certified locations when present, universal dimensions, investigation topics, and local-intelligence boundary. It does not create local rankings or an inventory experience.

## Deployment smoke test

After deployment, verify homepage/header, SF city, SF Retail geography, public sample, SF Industrial/Flex, Novi Industrial, Nashville Retail, Boise Office, and Boise Flex entry. Confirm the route, Brief intelligence state, active continuation, and analytics records. Test SF Office separately to confirm it still enters Property Requirement.
