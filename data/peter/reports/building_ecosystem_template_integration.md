# Building Ecosystem Template Integration

Date: 2026-05-12

## Summary

The first public ecosystem building batch now extends the canonical Rofo building system instead of using a parallel public template.

The 25 public ecosystem building URLs remain unchanged, but they are now generated through the primary `building.njk` experience via `buildingPages`.

## Architecture Changes

### Merged Into Canonical Building Pipeline

Updated `_data/buildings.js` to load the reviewed public ecosystem batch from `_data/ecosystemPublicBuildings.js` and normalize those records into the same building model used by current Rofo building pages.

Each ecosystem record now receives standard building fields, including:

- `building_path`
- `city_slug`
- `building_slug`
- `type`
- `space_type_slug`
- `space_type_url`
- `city_market_guide_url`
- routing metadata
- lead form metadata
- related building data through `buildingPages`

Existing production building records still take precedence. Ecosystem records are only added when they do not collide with an existing normalized building key.

### Removed Parallel Public Template

Deleted:

- `pages/commercial-real-estate/ecosystem-building-public.njk`

Reason:

- It duplicated building-page architecture.
- It lacked the standard lead form.
- It made the public ecosystem batch feel disconnected from the primary Rofo building experience.

The hidden/noindex prototype building template remains separate under `/prototype/buildings/` for internal review workflows.

### Sitemap Integration

Removed the separate `ecosystemPublicBuildings` sitemap loop.

The 25 public ecosystem building URLs now enter the sitemap through the standard `buildings` loop, because they are part of the canonical building data graph.

## Lead Form Integration

The public ecosystem building pages now render through `building.njk`, so they inherit the standard building lead form:

- `action="/api/leads/submit"`
- honeypot fields
- `form_start_time`
- `source="rofo-building-page"`
- `lead_type="building"`
- `page_type="building"`
- `page_url`
- `rofo_source`
- building address and routing metadata
- standard required fields and human check

Validation confirmed all 25 public ecosystem building pages include the lead form.

## Content Improvements

The ecosystem content now provides a compact enrichment layer rather than a standalone page narrative.

Added to `building.njk`:

- `Commercial Environment` card
- public-safe chips for durable inferred space types
- short commercial geography sentence
- note that commercial context does not indicate current availability

Improved language in `_data/ecosystemPublicBuildings.js`.

Before examples:

- `Retail-oriented commercial setting`
- `Commercial market context`
- `Use this page as a starting point for comparing this address with nearby buildings...`

After examples:

- `Neighborhood-serving retail corridor`
- `Business-oriented office location`
- `Part of a Sarasota corridor with neighborhood-serving retail, service businesses, and other customer-facing commercial uses nearby.`
- `Located in a Knoxville business area with nearby office and professional commercial activity.`

The updated language avoids:

- current availability claims
- pricing
- suite-level claims
- stale listing copy
- `perfect for` or `ideal for`
- historical signal counts
- internal QA language

## Internal Linking

The ecosystem batch now participates in the primary building graph:

- Building to city links via canonical breadcrumbs and next-step cards
- Building to market guide links through standard building sidebar
- Building to related space type pages through standard `space_type_url`
- Building to nearby/similar buildings through `buildingPages.related_buildings`
- City pages link to all 25 batch pages from their existing Buildings to Explore section

No neighborhood links were added in this pass.

## Validation

Command:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy
```

Result:

- Build passed.
- Eleventy wrote 12064 files.
- All 25 ecosystem building pages exist at their original public URLs.
- All 25 are indexable, with no `noindex` tag.
- All 25 include the standard building lead form.
- All 25 include the new `Commercial Environment` section.
- All 25 appear in `_site/sitemap.xml`.
- Sarasota, Knoxville, Grand Rapids, Chattanooga, and Albuquerque city pages each link to all five corresponding batch buildings.

## Remaining Weak Areas

- The ecosystem enrichment still depends on broad inferred space-type mix rather than richer building-specific facts.
- Some pages remain sparse because the reviewed batch intentionally avoids stale listing copy.
- The related building set is functional but should be reviewed market by market as future batches grow.
- The city-page footer-style links are lightweight and may deserve a more polished inline treatment later.

## Rollout Recommendations

1. Keep future ecosystem building batches flowing through `_data/buildings.js` and `building.njk`.
2. Do not reintroduce public standalone building templates for ecosystem pages.
3. Continue to exclude land, pricing, suite-level, and stale listing copy.
4. Add richer enrichment only when it can be framed as durable building or area identity.
5. Review the 25 pages in browser before expanding to a second public batch.
