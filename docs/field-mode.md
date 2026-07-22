# Rofo Field Mode v1

Field Mode v1 lets Alan upload Rofo-owned field photography from a phone and publish it to a city, district, or Building Profile without resizing files, renaming assets, committing to Git, or rebuilding the site after upload.

The v1 workflow is intentionally small:

1. Open `/admin/field-photos?token=...` on a phone.
2. Select `City`, `District`, or `Building`.
3. Search for a canonical subject.
4. Take a photo or choose one from the phone library.
5. Review the browser-optimized image.
6. Edit caption and alt text.
7. Upload as `Publish now` or `Save as draft`.
8. Open the public page and confirm the active hero photo appears.

## Architecture

Field Mode uses the existing Rofo admin and Cloudflare Pages Functions architecture.

- Admin route: `/admin/field-photos`
- Admin API routes: `/api/field-photos/search`, `/api/field-photos/recent`, `/api/field-photos/upload`, `/api/field-photos/action`
- Public resolver: `/api/field-photos/hero`
- Public image proxy: `/api/field-photos/assets/:id`
- D1 table: `field_photos`
- R2 binding: `ROFO_PHOTOS`
- Canonical subject snapshot: `data/generated/field-photo-subjects.json`

Runtime Functions do not import Eleventy `_data` modules. The build step runs `npm run field-photos:subjects`, which writes a deterministic city, district, and building subject index for runtime validation.

## Deployment Setup

Create an R2 bucket:

```bash
wrangler r2 bucket create rofo-photos
```

The Pages configuration needs:

```json
{
  "binding": "ROFO_PHOTOS",
  "bucket_name": "rofo-photos"
}
```

`wrangler.jsonc` declares this binding. In Cloudflare Pages, confirm the same R2 binding is attached to the production project.

Apply the D1 migration to the D1 database used for operational records. V1 can use `FIELD_PHOTOS_DB` if configured, otherwise it uses `LEADS_DB`.

```bash
wrangler d1 execute <database-name> --file migrations/0001_field_photos.sql
```

Required environment bindings:

- `ADMIN_DASHBOARD_TOKEN`
- `ROFO_PHOTOS`
- `FIELD_PHOTOS_DB` or `LEADS_DB`

Optional:

- `FIELD_PHOTOS_DEFAULT_PHOTOGRAPHER`
- `ADMIN_DISPLAY_NAME`

If no admin identity is exposed, the photographer defaults to `Alan Bernier`. Public pages only display `Photo © Rofo`.

## Browser-Side Processing

The admin page processes the selected image before upload:

- draws the image through canvas, stripping EXIF metadata
- resizes the public image to a maximum long edge of 1,600 pixels
- creates a thumbnail at a maximum long edge of 480 pixels
- preserves aspect ratio
- exports WebP when supported, starting at quality `0.82`
- retries compression at `0.76`, `0.70`, `0.64`, and `0.58` only when needed
- targets `1,100,000` bytes for the public image and `300,000` bytes for the thumbnail
- falls back to JPEG when WebP conversion cannot produce a valid optimized file
- shows preview dimensions and approximate file size

V1 does not upload the original full-resolution phone photo. That is a deliberate limitation so the field test proves publishing workflow before archival storage.

## Rights and Provenance

V1 supports only Rofo-owned photography.

The admin page states:

```text
Rofo-owned photo
Only upload photos taken for Rofo or photos Rofo has permission to publish.
```

The stored provenance model is:

```js
{
  sourceType: "rofo_original",
  rightsStatus: "owned",
  photographer: "Alan Bernier",
  attribution: "Photo © Rofo"
}
```

The public API never exposes storage keys, photographer identity, rights notes, source type, or internal metadata.

## Subject Types

Each photo must reference exactly one canonical subject:

- `city`
- `district`
- `building`

The subject is validated against `data/generated/field-photo-subjects.json`.

Stable IDs currently resolve as:

- city: `city_state_slug`, such as `sacramento-ca`
- district: `commercial_area_id` when available, otherwise a deterministic state/city/district key
- building: semantic source ID, Commercial Building Intelligence ID, or deterministic state/city/building key

## Publishing Behavior

The schema supports multiple photos per subject. V1 publishes one active hero photo per subject.

When a new hero photo is published:

- the new record becomes `published`
- any previous `published` hero for the same subject is set to `archived`
- archived records are retained
- archived photos do not resolve through the public hero endpoint
- assets are not destructively deleted in v1

Drafts may be edited and published later. Published photos may be archived.

## Public Rendering

City, district, and Building Profile templates render a hidden photo slot with:

```html
<div
  class="editorial-photo"
  data-photo-subject-type="building"
  data-photo-subject-id="..."
  hidden
></div>
```

`/js/field-photos-public.js` runs only on templates that opt into Field Photos. It calls `/api/field-photos/hero`, renders an image when one exists, and leaves the page unchanged when no photo exists or the lookup fails.

Public fields are limited to:

- `imageUrl`
- `width`
- `height`
- `caption`
- `altText`
- `attribution`

The caption displays the factual caption and subtle credit:

```text
Photo © Rofo
```

## Manual Mobile Test

Use existing canonical records for the first test chain:

1. City: `Sacramento`
2. District: `Power Inn Industrial`
3. Building: `8583 Elder Creek Rd`

Acceptance steps:

1. Open `/admin/field-photos?token=...` on a phone.
2. Select `Building`.
3. Search for `8583 Elder Creek`.
4. Take or choose a photo.
5. Confirm the preview is optimized.
6. Edit the caption if needed.
7. Tap `Upload and publish`.
8. Open `/commercial-real-estate/building/CA/sacramento/8583-elder-creek-rd/`.
9. Confirm the image appears with `Photo © Rofo`.
10. Repeat for `Power Inn Industrial`.
11. Repeat for `Sacramento`.
12. Upload a replacement for one subject and confirm the previous photo is no longer displayed.

## Failure Behavior

Public pages remain unchanged when:

- no photo exists
- D1 is unavailable
- R2 is unavailable
- the public lookup fails

Admin upload errors return JSON without stack traces. If R2 upload succeeds but D1 insert fails, the upload endpoint attempts to delete both R2 objects. Perfect cross-service transactions are not available in v1, so operational cleanup may still be needed if Cloudflare fails after partial writes.

## QA

Run:

```bash
node --check functions/admin/field-photos.js
node --check functions/api/field-photos/_shared.js
node --check functions/api/field-photos/search.js
node --check functions/api/field-photos/recent.js
node --check functions/api/field-photos/upload.js
node --check functions/api/field-photos/action.js
node --check functions/api/field-photos/hero.js
node --check functions/api/field-photos/assets/[id].js
node --check js/field-photos-public.js
node --check scripts/build-field-photo-subjects.js
node --check scripts/qa-field-mode.js
node scripts/qa-field-mode.js
npm run build
```

Then run the normal recommendation and Building Profile QA suite to confirm the static product remains unchanged.

## Known V1 Limitations

- No original-resolution archival image is stored.
- No galleries or ordering.
- No GPS, maps, or field assignments.
- No AI image recognition or captioning.
- No third-party photo licensing workflow.
- No duplicate detection.
- No one-click Publisher scoring integration.
- Public images are served through a Function proxy instead of a public R2 custom domain.

## Recommended V1.1 Improvements

- Add optional original-image archival storage.
- Add a small Publisher visual-coverage summary using the `field_photos` table.
- Add image replacement notes and operator audit history.
- Add custom R2 public domain support for lower-latency direct image delivery.
- Add a narrow Playwright mobile smoke test for `/admin/field-photos`.
