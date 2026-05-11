# Neighborhood Public Copy Polish

Generated: 2026-05-11

## Scope

This polish pass applied only to the 10 approved phase 1 neighborhood pages:

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

No additional neighborhood pages were added to the rollout.

## Copy Sections Rewritten

### Hero lead copy

The hero lead was changed from internal data workflow language to public-facing neighborhood context.

Before:

`Rofo is organizing commercial buildings in Civic Center as part of its broader market guide for San Francisco.`

After:

`Civic Center is a commercial district within San Francisco, with building context, nearby market connections, and space-type patterns worth comparing as you evaluate location fit.`

### Neighborhood context note

The sidebar note was simplified and stripped of implementation language.

Before:

`Neighborhood and building associations are based on available location data and may be refined as Rofo expands its commercial geography layer.`

After:

`This page highlights commercial buildings and broader market context associated with Civic Center within San Francisco. Building associations are based on available location data.`

### Neighborhood overview

The overview now frames the page as a business location context guide rather than a data review surface.

Updated tone:

- Editorial
- Observational
- Commercial context oriented
- No current availability claims
- No pricing or suite-level claims

### Common Commercial Signals

Internal QA cards were replaced.

Removed public-facing references to:

- Review radius
- Geometry quality
- Page status
- Noindex prototype
- Editorial and data QA
- Internal capping logic

Replacement cards now use public-safe context:

- Building context
- Common space types
- Nearby districts
- Market category

### Buildings section intro

The buildings section now uses calmer public-facing language.

Before:

`These buildings are directional examples from Rofo building data. They are included to help review the commercial context associated with Civic Center.`

After:

`Representative commercial buildings associated with Civic Center. Building selection is based on available location and market data.`

### Sidebar page status

The `Page status` sidebar was removed and replaced with a lightweight neighborhood context card.

The sidebar now emphasizes:

- Broader city market links
- Representative building examples
- Nearby district comparisons
- Related commercial space categories

## Building Cards Cleaned

Representative building cards on neighborhood pages now prefer street address as the visible card title when a usable address exists.

This suppresses promotional listing-style names in neighborhood cards only.

Example:

- Before: `NEW SOMA/MISSION RETAIL WINDOWLINE!`
- After: `1045 Mission St`

Other examples now displayed address-first:

- `1390 Market St` instead of `Fox Plaza`
- `66 Franklin St` instead of `Jack London Square`
- `505 14th St` instead of `Oakland City Center`
- `1 Sansome St` instead of `One Sansome St`

This cleanup is scoped to neighborhood representative building cards and does not globally rewrite building pages, city pages, market guide cards, or building index cards.

## Hover States Improved

Subtle hover underline affordances were added for:

- Neighborhood pills on neighborhood pages
- Nearby neighborhood comparison cards
- City page neighborhood pill links

The hover treatment keeps the existing Rofo visual system:

- No bright colors
- No aggressive animation
- Existing border and soft background behavior preserved
- Underline added with subtle thickness and offset

## Sections Removed Or Simplified

Removed from public copy:

- `commercial geography rollout`
- `prototype`
- `directional examples`
- `review radius`
- `internally capped`
- `geometry quality`
- `page status`
- `Rofo is organizing`
- `as Rofo expands its commercial geography layer`

Simplified:

- Common Commercial Signals
- Sidebar note
- Buildings section intro
- Empty-state building text

## Pages Still Needing Manual Review

No blocking copy issues were found in the 10 phase 1 pages after this pass.

Recommended manual review before deploy:

- Confirm the representative building set feels appropriate for each neighborhood.
- Confirm the neighborhood framing feels natural for both San Francisco and Oakland pages.
- Review whether the `Common Commercial Signals` label should remain or become `Commercial Context` in a future polish pass.

## Validation

Command:

`NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy`

Result:

- Build passed
- 11,955 files written

Targeted generated-page checks:

- Approved phase 1 pages no longer contain the removed internal copy patterns.
- Civic Center representative building card now displays `1045 Mission St` instead of the promotional source name.
- Sample generated pages reviewed:
  - `/commercial-real-estate/CA/san-francisco/civic-center/`
  - `/commercial-real-estate/CA/oakland/jack-london-square/`

Note:

The local `_site` directory may retain older generated noindex prototype files from earlier non-clean builds. The active `neighborhoodPages` data loader for this pass returns only the 10 approved pages, and the sitemap includes only those 10 neighborhood URLs.
