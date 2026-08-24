# Rofo SF Industrial + Flex Market Coverage

Status: **Industrial Recommendation Ready; Flex Recommendation Ready; Public Experience Building.**

## Product boundary

The customer continues to choose `Industrial / Warehouse / Flex`. Canonical operational activities and business context resolve the Requirement internally to Industrial-led, Flex-led, mixed/hybrid, or unresolved. Industrial and Flex share SF geography ownership, Regional Access, evidence provenance, Location Brief infrastructure, privacy, and persistence. They retain separate fit facts, eligibility, calibration, certification, ordering, and abstention.

No new Requirement question was introduced. When existing answers do not establish the leading model, Recommendation Readiness returns `INVESTIGATE` instead of guessing.

## Decision universes

| Geography | Industrial | Flex | Reviewed distinction |
| --- | --- | --- | --- |
| Bayview Industrial | Core | Core operational Flex | Deepest city-serving warehouse, distribution, contractor, fleet, food, and service context; Flex is operational rather than uniformly polished. |
| Central Waterfront | Core | Core | Protected PDR production/fabrication context and strong prototyping or office/production Flex. |
| Dogpatch | Situational | Core | Mixed-use adaptive production is selective Industrial but strong adaptive/creative Flex. |
| Showplace Square / Design District | Situational | Core | Selective customer-facing industrial context; strongest showroom/design-trade Flex role. |
| Potrero Hill eastern/base edge | Situational | Situational | Only the bounded production-adjacent edge applies; the residential hill does not. |
| SoMa | Generally not Industrial | Situational | Adaptive office/showroom Flex only; no ordinary warehouse/logistics claim. |

Northeast Mission PDR remains reviewed internal context rather than an independent vote. Broader Bayview remains a parent identity for Bayview Industrial. Southern Waterfront / Piers 80–96 remains specialized port/heavy-commercial investigation context. Mission Bay remains excluded until technical Flex evidence exists; institutional adjacency alone is insufficient.

## Access and evidence

The existing SF Regional Access foundation is reused. Bayview Industrial and Central Waterfront now have bounded southeast structural profiles derived from reviewed geography, freeway approaches, local/regional gateway relationships, and qualitative parking context. These profiles do not assert travel time, live traffic, truck clearance, loading, parking supply, permitted use, or building specifications.

## Calibration and abstention

Industrial calibration covers warehouse/distribution, last mile, contractor/service, fleet, food production, fabrication, maker/production, access sensitivity, customer-facing use, unsupported/ambiguous intent, and candidate neutrality. Flex calibration covers showroom/design, office/production, creative production, prototyping, maker, technical/R&D support, customer-facing use, employee environment, transit/operational sensitivity, adaptive reuse, unsupported/ambiguous intent, and candidate neutrality.

Cross-type certification requires similar starting Requirements to be able to change eligibility, ordering, explanation, and tradeoffs when the underlying operating intent changes. Mixed intent only considers geographies independently eligible in both models; it never numerically averages scores or unknowns.

## Release boundary

`LOCATION_BRIEF_V2_PUBLIC_SF_INDUSTRIAL_FLEX_ENABLED` is the single customer-entry flag because the public property type remains unified. It defaults off. Internal model resolution does not create separate public routes or mutate the canonical `industrial_flex` Requirement value. Rollback is the existing flag-off fallback; saved Briefs remain readable.

## Public Experience backlog

`_data/sfIndustrialFlexPublicExperienceBacklog.js` records later work for model-specific explanations, representative buildings/environments, imagery, navigation, related alternatives, and certified sample Location Briefs. No pages or SEO content were created. Public content should emerge from real location decisions represented in the product, not from keywords requiring pages.
