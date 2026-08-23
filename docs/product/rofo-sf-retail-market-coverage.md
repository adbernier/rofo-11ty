# San Francisco Retail Recommendation Coverage

Status: Recommendation Ready (controlled by the independent SF Retail public feature flag, which defaults off)

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

Mission is compatibility-only for Mission District. South Park is a SoMa compatibility/subarea identity. Design District is presented through Showplace Square as the canonical knowledge owner. Public paths remain intact, but compatibility identities cannot add component votes or duplicate cards.

## Retail signals

The reviewed foundation uses ordinal evidence for Retail legitimacy, customer-demand context, destination versus visibility behavior, neighborhood/residential demand, weekday daytime demand, visitor/tourism context, premium/lifestyle context, food and service adjacency, showroom/design-trade context, evening/weekend activity, storefront visibility, parking environment, and structural customer access.

Unknown remains unknown. Exact foot counts, sales forecasts, rents, live availability, permitted use, and building-specific conditions are outside this district foundation.

## Requirement boundary

The existing Requirement already supported customer geography, destination versus incidental visibility, district parking importance, and operational exceptions. It did not ask Retail users for a canonical business identity or let them state customer transit importance. The shared adaptive interview now adds one bounded Retail identity branch covering boutique/consumer brand, premium/luxury, neighborhood service, fitness/wellness, food, showroom/design, convenience, and destination/experiential concepts, plus a customer-facing transit question using the existing universal Access dimension. This remains one adaptive canonical Requirement, not a separate Retail questionnaire.

Food and showroom choices add their already-supported canonical activities. Unsupported free text and operationally complex retail/production patterns are preserved and cause investigation rather than being coerced into a known profile.

## Composition and calibration

Retail composition separates Retail Fit, customer/business environment, and Access. Ordering is Retail Fit, supported Requirement-trait alignment, reviewed Access, then canonical ID as a stable tie-break. Candidate districts are comparison context only.

Certified profiles include open-ended Retail; neighborhood service; premium/luxury; destination; convenience; food; showroom/design; customer-access-sensitive; parking-sensitive; visitor-oriented; unsupported/ambiguous; and candidate-led searches. Sensitivity asserts that materially different supported profiles can move the result, while candidate selection cannot change components, eligibility, shortlist, or ordering.

The engine may return FULL, BOUNDED, or INVESTIGATE. An unsupported Retail identity, extraordinary operating pattern, or material unresolved customer-access relationship does not receive a fabricated weak or neutral result.

## Release contract

SF Retail uses `LOCATION_BRIEF_V2_PUBLIC_SF_RETAIL_ENABLED`, independently from the SF Office flag. It defaults off. Existing source allowlisting, same-origin protection, anonymous ownership, noindex Briefs, persistence, rollback, and legacy fallback remain unchanged. Turning the Retail flag off returns new Retail entries to the existing `/find-locations/` flow; existing private v2 Briefs remain readable.

## Public-experience debt

Recommendation validity does not depend on imagery or representative buildings. Public presentation remains incomplete for several otherwise valid Retail geographies, especially Mission District, South Beach, Civic Center, and representative-building depth in Union Square, Marina, and Hayes Valley. This remains part of the human-selected SF Public Experience priority.

Potential future sample Location Briefs: boutique/consumer brand, premium retailer, neighborhood service business, fitness/wellness studio, showroom/home-design retailer, and destination specialty concept. They should be published only as certified, useful decision resources with real explanations, tradeoffs, district links, and representative environments.

Product/content principle: Rofo should create indexable content because it helps users make location decisions. Search visibility is a consequence of useful, differentiated content—not the justification for thin pages. A later content audit should examine generic or duplicative retail/location pages for consolidation or strengthening; this sprint makes no SEO, canonical, sitemap, or indexability change.
