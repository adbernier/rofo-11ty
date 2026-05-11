# Neighborhood Public Readability Polish

Generated: 2026-05-11

## Scope

This pass refined only the 10 approved phase 1 neighborhood pages:

- Financial District, San Francisco
- Union Square, San Francisco
- Civic Center, San Francisco
- Hayes Valley, San Francisco
- Marina District, San Francisco
- Jack London Square, Oakland
- Old Oakland, Oakland
- West Oakland, Oakland
- Lake Merritt, Oakland
- Chinatown, Oakland

No additional neighborhood pages were added. Sitemap scope was not expanded. Building-page neighborhood links were not added.

## City Neighborhood Pill Style

The city-page neighborhood links were restored to a stronger Rofo pill/card treatment:

- White pill background
- Rounded border
- Subtle shadow
- Slightly stronger padding
- Soft blue hover background
- Underline on hover preserved

This keeps the links visually clickable without making them feel aggressive.

Affected city pages:

- `/commercial-real-estate/CA/san-francisco/`
- `/commercial-real-estate/CA/oakland/`

## Public Copy Simplified

The neighborhood page copy was rewritten to sound like a simple commercial neighborhood guide rather than a data workflow.

Removed or avoided phrases such as:

- `building context`
- `space-type patterns`
- `available location data`
- `representative commercial building records`
- `market category`
- `associated with`
- `directional`
- `location fit`
- `commercial geography`
- `data layer`
- `refined over time`

## Section Changes

### Hero

Before:

`Civic Center is a commercial district within San Francisco, with building context, nearby market connections, and space-type patterns worth comparing as you evaluate location fit.`

After:

`Explore commercial buildings, nearby neighborhoods, and related space types in Civic Center, San Francisco.`

### Neighborhood Overview

Before:

`This guide brings together neighborhood-level commercial context, representative building examples, nearby districts, and broader San Francisco market links. It is designed to help businesses compare location fit without implying current availability.`

After:

`Civic Center is part of the broader San Francisco commercial real estate market. Use this page to compare buildings in the area, review related space types, and explore nearby neighborhoods.`

### At A Glance

The data-heavy `Common Commercial Signals` section was renamed and simplified.

Previous labels removed:

- Building context
- Market category
- Representative commercial building records

Current labels:

- Buildings
- Space types
- Nearby neighborhoods

### Buildings

Before:

`Representative commercial buildings associated with Civic Center. Building selection is based on available location and market data.`

After:

`Browse selected commercial buildings in Civic Center.`

Heading changed to:

`Buildings in Civic Center`

### Nearby Neighborhoods

Before:

`Nearby areas can help frame how Civic Center fits into the broader San Francisco commercial market.`

After:

`Compare Civic Center with nearby San Francisco neighborhoods.`

### Related Space Types

Before:

`These broader commercial categories may be relevant when comparing Civic Center within the San Francisco market.`

After:

`Explore commercial space types across the broader San Francisco market.`

### Sidebar

The sidebar now uses a direct public guide structure.

Heading:

`Explore Civic Center`

Bullets:

- Buildings in this area
- Nearby San Francisco neighborhoods
- Related commercial space types
- Broader San Francisco market guide

## Validation

Command:

`NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy`

Result:

- Build passed
- 11,956 files written

Generated-page checks:

- Checked all 10 active neighborhood pages.
- No flagged internal/data-model phrases were found.
- Civic Center page contains the simplified hero, overview, buildings, nearby neighborhoods, and related space type copy.
- San Francisco and Oakland city pages still render the `city-neighborhood-link-list` module.

## Remaining Notes

The pages now read more like lightweight public neighborhood guides. The next review should be editorial rather than structural:

- Confirm each neighborhood deserves the selected buildings shown.
- Consider replacing `At a glance` with more curated neighborhood-specific facts as data improves.
- Keep avoiding pricing, current availability, suite-level claims, and live inventory language.
