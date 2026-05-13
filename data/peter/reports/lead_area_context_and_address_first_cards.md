# Lead Area Context and Address First Cards

Date: 2026-05-13

## Summary

This polish pass added neighborhood and commercial area context to lead submission handling and tightened building card title behavior so cards prefer clean street addresses over stale or promotional listing titles.

No URLs, sitemap behavior, or rollout scope were changed.

## Lead Fields Added

The lead payload now preserves these fields when submitted:

- `neighborhood_name`
- `neighborhood_slug`
- `neighborhood_path`
- `commercial_area_id`
- `commercial_area_type`

Building page lead forms populate these fields only when the building has a high-confidence commercial area relationship.

Example verified on:

- `/commercial-real-estate/building/CA/oakland/1-kaiser-plz/`

Generated hidden fields include:

- `neighborhood_name = Uptown Oakland`
- `commercial_area_id = oak-uptown`
- `commercial_area_type = district`

Neighborhood and commercial area pages pass context to the city lead form through the existing city form path. The city form now includes matching hidden fields and fills them from URL parameters when a visitor clicks from a neighborhood page.

Example verified on:

- `/commercial-real-estate/CA/san-francisco/south-park/`

The CTA points to the San Francisco city form with:

- `neighborhood_name=South Park`
- `neighborhood_slug=south-park`
- `commercial_area_id=sf-south-park`
- `commercial_area_type=neighborhood`

## OfficeFinder Notes Behavior

OfficeFinder payload generation now appends neighborhood context to `Comments` when available.

Example appended line:

```text
Neighborhood/area context: Civic Center, San Francisco.
```

This is appended after user-entered requirements and does not overwrite submitted notes.

## Internal Lead Email and Approval Display

Lead alert and approval email details now include:

```text
Neighborhood / Area
```

The field appears only when neighborhood context is present.

Updated areas:

- HTML approval email
- Plain-text approval email
- Mobile-friendly lead alert email

## Building Card Audit

Audited card/rendering paths:

- Neighborhood page building cards
- City page building cards
- Related building cards on building pages
- Shared compact building card partial
- Shared standard building card partial
- Ecosystem public building link output

Changes made:

- Shared compact building cards now prefer `building.address` before `display_name` or `name`.
- Related building summaries now prefer `building.address` when available.
- Existing neighborhood representative building normalization remains address-first.
- Image `alt` text and card link `aria-label` now inherit the address-first title from the shared compact card partial.

Example verified:

- `1045 Mission St` now appears as the building card title.
- Generated image alt is `1045 Mission St`.
- Generated link aria-label is `View 1045 Mission St`.
- Stale title `NEW SOMA/MISSION RETAIL WINDOWLINE!` does not appear in the generated Civic Center or San Francisco city card output.

## Validation

Build command:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy
```

Result:

- Build passed
- Eleventy wrote 12,113 files

## Files Changed

- `functions/api/leads/_shared.js`
- `building.njk`
- `city.njk`
- `pages/commercial-real-estate/neighborhood.njk`
- `_includes/partials/shared/building-card-compact.njk`
- `_data/buildingPages.js`

