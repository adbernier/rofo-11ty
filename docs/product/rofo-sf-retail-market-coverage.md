# San Francisco Retail Recommendation Coverage

Status: Recommendation Ready after decision-geography expansion and recertification (controlled by the independent SF Retail public feature flag, which defaults off)

The original 2026-08-23 certification covered the first district-scale universe. A subsequent read-only audit found that universe internally consistent but too coarse for Retail, so it was treated as Building while geography was reopened. The status above reflects expanded-universe certification rather than the earlier denominator.

This foundation reuses the canonical San Francisco graph, Regional Access, EntryContext, Requirement, Location Brief v2, persistence, privacy, and release contracts. It adds Retail-specific market facts and composition; it does not copy the SF Office model or add Requirement-to-district bonuses.

## Decision universe

| Geography | Classification | Retail role |
| --- | --- | --- |
| Union Square | Core | Visitor, premium, destination shopping and central access |
| Mission District | Core | Neighborhood retail, food, wellness, service and visible corridors |
| Marina District | Core | Affluent neighborhood, premium, wellness, food and service demand |
| Hayes Valley | Core | Design-forward lifestyle, boutique, brand and destination retail |
| Jackson Square | Core | Premium, design, showroom, restaurant and destination context |
| SoMa | Core | Selective showroom, experiential, food and mixed daytime demand |
| Financial District | Core | Weekday office-worker service and food demand |
| South Beach | Core | Residential, office, visitor, waterfront and event demand |
| Showplace Square / Design District | Situational | Design-trade, home-furnishings and showroom destination |
| Dogpatch | Situational | Emerging neighborhood, food, service and destination concepts |
| Mission Bay | Situational | Targeted institutional, residential, healthcare and event demand |
| Civic Center | Situational | Narrow civic, cultural, event and service context |
| Potrero Hill | Situational | Neighborhood service, food and design/production-edge context |
| Presidio | Generally not Retail | Limited visitor/destination uses, not an ordinary storefront alternative |
| Bayview Industrial | Generally not Retail | Industrial/flex identity |
| Central Waterfront | Generally not Retail | Industrial/flex identity |

### Retail corridor expansion

| Geography | Classification | Retail role | Ownership |
| --- | --- | --- | --- |
| Sacramento Street | Situational | Premium, design, service and small-scale destination retail | Independent Retail-only decision identity |
| Fillmore Street | Core | Lifestyle, dining, wellness, premium and neighborhood demand | Independent Retail-only decision identity |
| Union Street / Cow Hollow | Core | Specialty shops, wellness, dining and wider-trade-area destination behavior | Child of Marina District for presentation |
| Chestnut Street | Core | Neighborhood services, food, wellness, convenience and daily-use demand | Child of Marina District for presentation |
| Valencia Street | Core | Food, experiential, wellness, furnishings, visibility and evening activity | Child of Mission District for presentation |
| Upper Market / Castro | Core | Community, neighborhood service, dining, transit and destination demand | Independent Retail-only decision identity |
| North Beach | Core | Visitor, neighborhood, food, specialty and evening demand | Independent Retail-only decision identity |
| Chinatown | Core | Visitor specialty retail, food and community-serving commerce | Independent Retail-only decision identity |

For Retail, Marina District and Mission District are parent/presentation identities. They retain public and Office identities but cannot compete beside eligible Retail children. `_data/sfRetailDecisionGeographies.js` is the bounded space-type ownership registry for the unpublished corridors. General public-graph registration is deferred until useful public surfaces exist, preventing Publisher/EOS from treating route intent as already-published geography and keeping Office composition unchanged.

Polk Street, Divisadero, Clement Street, Irving Street, and West Portal remain explicitly deferred. Their identities are plausible, but the repository does not yet establish complete independent customer-environment and structural Access treatment. Deferral is recorded rather than converted into scoring or silent eligibility.

Mission is compatibility-only for Mission District. South Park is a SoMa compatibility/subarea identity. Design District is presented through Showplace Square as the canonical knowledge owner. Public paths remain intact, but compatibility identities cannot add component votes or duplicate cards.

## Retail signals

The reviewed foundation uses ordinal evidence for Retail legitimacy, customer-demand context, destination versus visibility behavior, neighborhood/residential demand, weekday daytime demand, visitor/tourism context, premium/lifestyle context, food and service adjacency, showroom/design-trade context, evening/weekend activity, storefront visibility, parking environment, and structural customer access.

Unknown remains unknown. Exact foot counts, sales forecasts, rents, live availability, permitted use, and building-specific conditions are outside this district foundation.

## Requirement boundary

The existing Requirement already supported customer geography, destination versus incidental visibility, district parking importance, and operational exceptions. It did not ask Retail users for a canonical business identity or let them state customer transit importance. The shared adaptive interview now adds one bounded Retail identity branch covering boutique/consumer brand, premium/luxury, neighborhood service, fitness/wellness, food, showroom/design, convenience, and destination/experiential concepts, plus a customer-facing transit question using the existing universal Access dimension. This remains one adaptive canonical Requirement, not a separate Retail questionnaire.

Food and showroom choices add their already-supported canonical activities. Unsupported free text and operationally complex retail/production patterns are preserved and cause investigation rather than being coerced into a known profile.

## Composition and calibration

Retail composition separates Retail Fit, customer/business environment, and Access. Ordering is Retail Fit, the supported environment band, the count of matched reviewed traits, reviewed Access, then canonical ID as a stable tie-break. Candidate districts are comparison context only.

Expanded-universe calibration exposed a reusable tie defect: distinct supported Retail traits could collapse into the same broad environment band and then order alphabetically. Retaining matched reviewed-trait count fixes evidence alignment without adding a named-district bonus.

Certified profiles include open-ended Retail; neighborhood service; premium/luxury; destination; convenience; food; showroom/design; customer-access-sensitive; parking-sensitive; visitor-oriented; unsupported/ambiguous; and candidate-led searches. Sensitivity asserts that materially different supported profiles can move the result, while candidate selection cannot change components, eligibility, shortlist, or ordering.

The engine may return FULL, BOUNDED, or INVESTIGATE. An unsupported Retail identity, extraordinary operating pattern, or material unresolved customer-access relationship does not receive a fabricated weak or neutral result.

## Release contract

SF Retail uses `LOCATION_BRIEF_V2_PUBLIC_SF_RETAIL_ENABLED`, independently from the SF Office flag. It defaults off. Existing source allowlisting, same-origin protection, anonymous ownership, noindex Briefs, persistence, rollback, and legacy fallback remain unchanged. Turning the Retail flag off returns new Retail entries to the existing `/find-locations/` flow; existing private v2 Briefs remain readable.

## Public-experience debt

Recommendation validity does not depend on imagery or representative buildings. Public presentation remains incomplete for several otherwise valid Retail geographies, especially Mission District, South Beach, Civic Center, and representative-building depth in Union Square, Marina, and Hayes Valley. This remains part of the human-selected SF Public Experience priority.

All eight approved corridor identities remain unpublished. `_data/sfRetailPublicExperienceBacklog.js` records future route intent and bounded needs: useful decision surfaces, parent/sibling links, related alternatives, Retail explanation, representative environments, approved imagery where available, and certified sample Brief connections. No placeholder page, canonical, sitemap entry, or generated corridor copy was created during recertification.

Potential future sample Location Briefs: boutique/consumer brand, premium retailer, neighborhood service business, fitness/wellness studio, showroom/home-design retailer, and destination specialty concept. They should be published only as certified, useful decision resources with real explanations, tradeoffs, district links, and representative environments.

Product/content principle: Rofo should create indexable content because it helps users make location decisions. Search visibility is a consequence of useful, differentiated content—not the justification for thin pages. A later content audit should examine generic or duplicative retail/location pages for consolidation or strengthening; this sprint makes no SEO, canonical, sitemap, or indexability change.
