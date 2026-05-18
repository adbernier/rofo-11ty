# Building Description Address First Cleanup

Date: 2026-05-13

## Summary

Building page visible copy now prefers the clean building address wherever a valid address exists. This removes stale listing or marketing titles from building descriptions, overview copy, image alt text, and lead form building metadata.

No URLs, sitemap behavior, lead routing, or rollout scope were changed.

## Files Changed

- `_data/buildings.js`
- `building.njk`
- `data/peter/reports/building_description_address_first_cleanup.md`

## Logic Updated

The building label helper now returns the normalized address first when available.

Address-first text cleanup was also added for explicit description fields:

- `building_description`
- `about_context`

If a raw source description contains the stale building or listing name, that name is replaced with the clean address before being rendered.

The building hero image alt text now uses:

```text
{address or display_name or name} in {city}, {state}
```

This keeps alt text consistent with address-first building titles.

## Examples Fixed

### 1045 Mission St

Before:

```text
NEW SOMA/MISSION RETAIL WINDOWLINE! in San Francisco, CA...
```

After:

```text
1045 Mission St in San Francisco, CA is positioned for retail, service, and other customer-facing uses.
```

Verified generated output:

- Page title uses `1045 Mission St`
- Hero lead uses `1045 Mission St`
- Image alt uses `1045 Mission St in San Francisco, CA`
- Overview heading uses `About 1045 Mission St`
- Overview copy uses `1045 Mission St`
- Hidden `building_name` field now uses `1045 Mission St`
- `NEW SOMA/MISSION RETAIL WINDOWLINE!` no longer appears in generated building pages

### 3950 Central Sarasota Pkwy

Verified generated output:

- Page title uses `3950 Central Sarasota Pkwy`
- Hero lead uses `3950 Central Sarasota Pkwy`
- Image alt uses `3950 Central Sarasota Pkwy in Sarasota, FL`
- Overview heading uses `About 3950 Central Sarasota Pkwy`
- Hidden `building_name` field uses `3950 Central Sarasota Pkwy`
- `PRIME RETAIL / OFFICE SPACE IN SARASOTA` no longer appears in generated building pages

## Remaining Edge Cases

- If a source record has no usable address, the system still falls back to the cleaned building name.
- This pass does not rewrite URLs or slugs that were generated from older source names.
- This pass does not remove stale source names from raw research reports or input datasets.

## Validation

Build command:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy
```

Result:

- Build passed
- Eleventy wrote 12,114 files

