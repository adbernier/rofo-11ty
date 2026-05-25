# District Media Review Workspace V1

Created an internal-only static editorial workspace for reviewing representative district imagery.

## Location

- `data/media/generated/district_media_review_workspace_v1/index.html`
- `data/media/generated/district_media_review_workspace_v1/workspace-data.js`
- `data/media/generated/district_media_review_workspace_v1/app.js`
- `data/media/generated/district_media_review_workspace_v1/styles.css`
- `data/media/generated/district_media_review_workspace_v1/image-export-manifest.json`
- `data/media/generated/district_media_review_workspace_v1/copy-district-images.sh`
- `data/media/generated/district_media_review_workspace_v1/copy-district-images-from-ec2.sh`

## Inputs

- `data/media/generated/district_building_universe_v1.json`

## Scope

- Districts: 11
- Source universe buildings: 17587
- Source universe buildings with original images: 222
- Source universe original images: 455
- Review states: accepted, rejected, hero_candidate, supporting_candidate
- State persistence: browser localStorage
- Default local image bundle district: Downtown Oakland

## Guardrails

- No public route was created.
- No uploads, image transformations, resizing, galleries, or Eleventy templates were added.
- Source image references are preserved from the district building universe.
- The workspace uses review tiers only as a human workflow aid; they are not public scores or rankings.

## Local Image Bundle

The workspace prefers local relative image paths like `images/downtown-oakland/{filename}` when present. The original EC2 absolute path is preserved on each image record as `original_absolute_path`.

To copy only the default Downtown Oakland review images from EC2 into this local workspace:

```bash
cd /path/to/rofo-11ty
EC2_HOST=ec2-user@example.compute.amazonaws.com sh data/media/generated/district_media_review_workspace_v1/copy-district-images-from-ec2.sh
```

To copy a specific district from EC2:

```bash
DISTRICT_SLUG=financial-district-sf EC2_HOST=ec2-user@example.compute.amazonaws.com sh data/media/generated/district_media_review_workspace_v1/copy-district-images-from-ec2.sh
```

If the repo is also present on EC2, the local EC2 filesystem helper can copy into the same workspace folder there:

```bash
cd /path/to/rofo-11ty
sh data/media/generated/district_media_review_workspace_v1/copy-district-images.sh
```

To copy a specific district on EC2:

```bash
DISTRICT_SLUG=financial-district-sf sh data/media/generated/district_media_review_workspace_v1/copy-district-images.sh
```

This copies only images listed in `image-export-manifest.json` for that district. It does not resize, optimize, upload, or transform images.
