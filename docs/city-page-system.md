# Rofo City Page System

## Purpose

The reusable city-page system turns city pages into commercial real estate decision pages. Each page should help a business understand the market, compare areas, review representative buildings when supported, learn what matters before touring, and start a search.

The system uses one hierarchy with different levels of depth based on available data. It should not fabricate district intelligence, building examples, market commentary, or local expert coverage.

## Pilot Markets

The first rollout is intentionally limited to:

- San Francisco, CA
- Austin, TX
- Denver, CO
- Sacramento, CA
- Cotati, CA

San Francisco remains the richest reference implementation. Austin, Denver, and Sacramento test markets with district and comparison coverage but limited representative-building editorial coverage. Cotati tests a thin market with minimal local intelligence so fallback behavior can be reviewed honestly.

## Page Hierarchy

1. City hero
2. In-page chapter navigation
3. Explore commercial real estate areas
4. What to expect before leasing
5. Representative building examples, when editorial examples exist
6. Local expert context
7. Start Your Search

## Rendering Rules

Hero renders for every pilot city and preserves local search relevance with `Commercial Real Estate in [City], [State]`.

Chapter navigation renders only links for chapters present on the page.

Explore Areas renders when the city has an editorial district map, district pages, location comparisons, comparison pages, or nearby markets.

What to Expect renders for every pilot city. It includes city-specific Insights or market context when present, and reusable Commercial Leasing Guide links otherwise.

Representative Buildings renders only when `editorial_representative` building examples exist for the city. The section frames buildings as examples, not availability.

Local Expert Context renders for pilot city pages with cautious language. It describes what local help may support without promising availability, tours, or introductions in every market.

Legacy city pages outside the pilot continue using the existing layout.

## Readiness Behavior

Richer markets may show district maps, comparisons, Insights, representative buildings, market guides, and handbook links.

Lighter markets should still render a coherent city page using the hero, market orientation, nearby markets, leasing guidance, and Start Your Search CTA.

Internal readiness labels such as Compass Ready or editorial maturity should not appear publicly unless that becomes an intentional product decision.

## SEO Preservation

The reusable system preserves:

- city-specific URL
- city-specific H1
- existing title and meta-description logic
- breadcrumb structure
- district links where available
- comparison links where available
- nearby-market links where available
- space-type links where already rendered
- existing sitemap behavior

## Full Rollout Recommendation

Do not convert every city automatically. Review the pilot output first, especially thin-market pages, to confirm the fallback experience feels intentional. Full rollout should wait until the pilot proves the hierarchy works for rich, moderate, and thin city data.
