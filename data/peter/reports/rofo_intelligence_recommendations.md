# Rofo Intelligence Recommendations

## How Rofo Should Use This Data

Use the Peter export as a commercial real estate intelligence layer. The strongest use cases are market prioritization, building page enrichment, internal linking, neighborhood planning, and AI retrieval context.

## Building Enrichment Ideas

* Use `listing_count` as a historical activity signal.
* Use high activity buildings to prioritize richer page copy, image review, and market guide links.
* Use `likely_multi_tenant`, size fields, floors, and units to describe building context carefully.
* Use geo fields to connect buildings to nearby markets and future neighborhood pages.

## Neighborhood Strategy

* Start with cities that have many allowed neighborhoods, strong summaries, and existing building activity.
* Pilot San Francisco, Oakland, Los Angeles, New York, Chicago, and Atlanta if their neighborhood records and building density are strong.
* Keep neighborhood pages informational. Avoid implying live inventory.

## SEO Opportunities

* Add market and neighborhood context to building pages.
* Use high activity buildings for stronger internal linking.
* Create market guide modules that explain local building patterns without exposing stale listings.
* Use neighborhood data to build future pages only where there is enough supporting building context.

## Market Prioritization Strategy

Prioritize markets with:

* high building count
* high active building count
* high total listing activity
* multiple high activity buildings
* usable legacy city and neighborhood records

The generated `enrichment_priority_score` is intentionally simple. Treat it as a review queue, not a final business decision.

## Risks And Cautions

* Do not expose `listing_count` as availability.
* Do not create listing-grid UX from this dataset.
* Do not publish stale suite data.
* Do not overstate rents, availability, amenities, or market demand.
* Do not generate neighborhood pages where no useful building or city context exists.

## What Not To Expose Publicly

* tenant lead details
* user emails and phones
* broker relationship tables
* raw listing rows
* stale asking rents or suite statuses
* exact counts framed as current availability
