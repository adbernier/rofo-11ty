---
permalink: false
eleventyExcludeFromCollections: true
---
# Reviewed geography maps (local candidate, 17 October 2026)

This is a presentation-only extension of the approved Phoenix map approach. Existing city, district and public representative-building URLs are reused. The Phoenix guided-search experience, recommendation engines, eligibility, Brief storage and contact/lead workflows are unchanged.

## What is evidence, and what is drawing?

- `_data/neighborhoodPages.js` supplies the existing public district identity, parent context, source confidence and approximate reference coordinates. The registry retains that confidence. These coordinates are not newly certified boundaries or distance origins.
- Districts without usable coordinates or documented source confidence are listed as needing geographic review and not plotted. Pixel-space polygons and illustrated coastlines from older map components are not geographic evidence and are not converted into polygons.
- Soft location markers have a constant visual size. Their size is a drawing convention, not a district extent or search radius. No gap, overlap, zoning or municipal ownership is inferred. Existing parent URLs are kept only when a city page actually exists; missing parent routes remain an explicit gap.
- `data/maps/property-locations.json` records the Census exact-match result for each existing editorial representative building. The complete house number, normalized street and postal-city/state text must match; this does not verify legal municipal membership. The source is a street address range: a dot is an approximate address position, not a surveyed property point, parcel, suite or entrance. The three previously verified Phoenix municipal PointAddress records retain their earlier source if present in the existing representative set. A source address match does not validate district membership; missing routes and distant associations are held for review.
- Only existing public editorial representative buildings are eligible. The inventory separately lists district-referenced cards outside that editorial cohort; they remain on their existing pages but have not been newly geocoded, pinned or promoted into reviewed property evidence. Unreviewed candidate lists, historical listing descriptions, photos and broker details are not copied. The inventory also records buildings held back by the geographic checks. It is not an availability feed.
- Census primary/secondary road geometry is supplemented with the named streets of qualified property addresses. Read-only feature queries, source dates and failures are stored in `data/maps/road-context/`. Nothing calls a geocoder or map service at page runtime.

## Rendering and navigation

`lib/maps/reviewed-geography.js` joins the existing records without mutating them. `lib/maps/render-map.js` projects WGS84 coordinates consistently into the desktop/mobile static SVG viewports. It clips every road segment before serialization, simplifies visible paths by at most 0.55 display units, and removes duplicate paths. Road labels come from source feature names and avoid the callout boxes.

Callout labels may move to prevent overlap; their leader endpoints retain the geographic location. High-density city maps use numbered labels and a matching text list. Above 12 areas, the map displays at most 12 labels at a time with quiet previous/more controls; selecting any text-list area reveals its group automatically. No locations or routes are removed. Selecting with the map, Enter/Space or the list updates the same summary, highlight and existing destination link. No hover is required. City/district/property maps share the renderer, component and theme. The earlier Phoenix Industrial assets and guided flow remain unchanged. The inventory explicitly includes that already completed city-map context, three approximate search areas and three verified municipal property-address points. Those guided examples do not have new canonical property pages invented for them; their existing hash routes and maps are preserved.

The single shared component replaces the old map on supported city/district pages. Other page content stays in place. Property maps add existing parent navigation and retain the building's description and continuation. Unsupported pages retain their current content. A missing map source does not disable text navigation.

SVGs load only near the visible map. Each viewport requests one SVG; the static image fallback is inside `noscript` so it does not cause a second transfer. No-JavaScript visitors retain static maps and links. The detailed source inventory is linked, not loaded into every page. Mobile uses separately laid-out assets rather than shrinking desktop labels blindly.

## Rebuild and maintenance

These commands run from the isolated candidate checkout. They do not publish anything:

```
node scripts/maps/inventory.js
node scripts/maps/build-reviewed-maps.js
npm run build
node scripts/qa-reviewed-maps.js
python3 scripts/maps/qa-svg-layout.py
```

Road/address acquisition is an explicit editorial maintenance step, not part of `npm run build`. The Python import script requires the matching source property snapshot and Census batch result; pass the actual batch acquisition date as its third argument for future imports. Browser checks are in `scripts/qa-reviewed-maps-browser.cjs` and accept `ROFO_QA_BASE_URL`, `ROFO_BROWSER_MODULE`, `ROFO_CHROME_PATH` and `ROFO_MAP_QA_OUTPUT`; the preview URL must be localhost. Keep the source batch in the review evidence directory; the publication-safe result is the checked-in property JSON. Road fetch scripts record official query URLs and reject failed or truncated responses. Review a source change and rerun navigation/geographic tests before replacing snapshots. Address corrections, route changes and district-association changes should trigger a recheck. An annual geometry/address review is suggested; no scheduled task was created or changed.

Census feature geometry and geocoder output are public government data. Required source credit is visible in every SVG and in “Map sources and coverage.” Phoenix municipal point attribution remains Maricopa County GIS. Existing editorial location context is Rofo's own published data. There are no third-party tiles, copied imagery, geocoding API keys or new dependencies/configuration.

## Remaining review decisions

The release inventory separates completed approximate-location maps from records needing geographic review. Source-reported approximate coordinates still deserve human geographical review before a broad release; the local candidate does not upgrade them into certified district shapes. Resolve missing parent-city routes, SF's unlocated corridors/districts, duplicate/overlapping concepts such as Mission/Mission District, and ambiguous building associations separately. Do not repair those gaps by averaging property coordinates or converting illustration pixels. Existing availability/contact wording elsewhere on pages is preserved by this map-only patch and is not endorsed as new fulfillment capability.

## SF/Sacramento-only release boundary

`lib/maps/reviewed-geography.js` has an explicit two-city allowlist. Only SF/Sacramento source properties, Census batch rows, municipal review polygons, road snapshots and review dispositions are included. Source batch IDs were renumbered consistently when extracting the 106-property input/results subset; source results and acquisition date were not changed. Regenerating maps cannot expand coverage without a reviewed source change to the allowlist.

This candidate contains 2 city, 20 district/reference and 83 property maps (210 SVG variants). SF has 14 plotted references and 15 unlocated records; Sacramento has 6 plotted references. 23 property records remain unplotted, including Sacramento 1329 N Market Boulevard. Existing pages retain their URLs and content. Unsupported cities receive no shared-map data or scripts; existing maps remain as before. The prior nationwide candidate is preserved separately and is not part of this release.

Offline reproduction:

```
python3 scripts/maps/prepare-map-evidence.py data/maps/geocoder-input-2026-10-17.json data/maps/geocoder-results-2026-10-17.csv 2026-10-17
node scripts/maps/inventory.js
node scripts/maps/build-reviewed-maps.js
npm run build
node scripts/qa-reviewed-maps.js
python3 scripts/maps/qa-svg-layout.py
python3 scripts/maps/qa-property-match.py
```

No map regeneration command acquires data. No runtime geocoder or external map request exists. The checked-in source data and map manifest are sufficient for a normal production build.

## Next map task: nationwide geographic review

Do not expand the release allowlist until the proposed city cohort satisfies all criteria:

- **Aliases and overlaps:** inventory exact coordinate duplicates and semantic aliases; document canonical identity and whether each is an alias, a genuinely distinct area, or a broader/narrower overlap. Resolve Mission/Mission District, RiNo/River North, Lower Highland(s), and combined-area names. Preserve existing URLs; do not imply disjoint coverage. Record the reviewer and evidence for each disposition.
- **Municipal ownership:** test every proposed reference and property against dated official municipal geometry. Resolve city/postal/metro disagreements explicitly with a documented parent context. An out-of-city point remains held until that ownership decision is reviewed. Do not silently move it into the city.
- **Coordinates:** every plotted reference needs a traceable dated source, confidence, geography type, and range/outlier/duplicate checks. Classify city-wide references separately. No city-center defaults, illustration-pixel conversion or invented boundaries. Keep missing or ambiguous records unplotted with working text navigation. Manually inspect dense, sprawling, overlapping and small-city samples on desktop/mobile.
- **Property associations:** require exact full-house-number/street/city/state source matching or documented municipal point evidence, then independently verify the building-to-district association and route. Postal matching alone is insufficient. Record interpolation versus municipal point precision and reject ambiguous batches. Retain unconfirmed availability language; no district capability may substitute for building facts.
- **Release acceptance:** review exceptions and unresolved records by name; archive source snapshots and disposition evidence; require deterministic offline regeneration, exact scoped file list, all canonical links, 12-label/list/keyboard/no-JS checks, mobile layout/loading measurements, existing Phoenix/regression checks, and a full clean-base production build. Generating an asset is not geographic sign-off.

## Rollback

Before publication this is an uncommitted candidate: discard only the isolated candidate checkout if rejected. After an eventual release commit, revert that exact map release commit through the usual reviewed Git/Cloudflare process, without resetting unrelated work. Restoring the three original templates removes shared-map integration; added map assets/data are inert once those references are removed. Phoenix's already published guided assets and handlers are outside this patch and remain intact. Publishing and rollback execution both require separate authorization.
