# District Review Image Sync

This workflow stages only the image files referenced by the district media review manifest, then pulls those staged files into the local review workspace.

It is internal review tooling only. It does not resize images, upload to R2, create public pages, or copy the full original archive.

## Inputs

- Manifest: `data/media/generated/district_media_review_workspace_v1/image-export-manifest.json`
- EC2 source archive: `/ebs2/rofo/content/buildings5/orig`
- EC2 staging output: `/home/ec2-user/district-review-export/{district_slug}/`
- Mac workspace output: `data/media/generated/district_media_review_workspace_v1/images/{district_slug}/`

## Step 1: Stage Images On EC2

Run this on the Production APP EC2 instance from the repo root.

```sh
DISTRICT_SLUG=soma sh scripts/media/stage_district_review_images_on_ec2.sh
```

To stage every district listed in the manifest:

```sh
DISTRICT_SLUG=all sh scripts/media/stage_district_review_images_on_ec2.sh
```

The staging script reads exact filenames from the manifest, copies only those files from `/ebs2/rofo/content/buildings5/orig`, and writes them into `/home/ec2-user/district-review-export/{district_slug}/`.

The script uses `sudo` only for source archive file checks/copy operations and then changes staged files back to `ec2-user`.

Optional overrides:

```sh
DISTRICT_SLUG=soma \
MANIFEST=data/media/generated/district_media_review_workspace_v1/image-export-manifest.json \
SOURCE_ARCHIVE=/ebs2/rofo/content/buildings5/orig \
STAGE_ROOT=/home/ec2-user/district-review-export \
sh scripts/media/stage_district_review_images_on_ec2.sh
```

## Step 2: Pull Staged Images To Mac

Run this on the Mac from the repo root after EC2 staging completes.

```sh
DISTRICT_SLUG=soma \
EC2_HOST=ec2-user@your-ec2-host \
EC2_KEY=/path/to/key.pem \
sh scripts/media/pull_district_review_images_from_ec2.sh
```

To pull every staged district:

```sh
DISTRICT_SLUG=all \
EC2_HOST=ec2-user@your-ec2-host \
EC2_KEY=/path/to/key.pem \
sh scripts/media/pull_district_review_images_from_ec2.sh
```

Optional overrides:

```sh
DISTRICT_SLUG=soma \
EC2_HOST=ec2-user@your-ec2-host \
EC2_KEY=/path/to/key.pem \
REMOTE_STAGE_ROOT=/home/ec2-user/district-review-export \
LOCAL_IMAGE_ROOT=data/media/generated/district_media_review_workspace_v1/images \
sh scripts/media/pull_district_review_images_from_ec2.sh
```

## Notes

- Use `DISTRICT_SLUG=soma` or any district slug present in the image export manifest.
- Use `DISTRICT_SLUG=all` only after confirming the staged export size is reasonable.
- Original absolute archive paths remain preserved in the review manifests for traceability.
- The local workspace keeps the existing relative image path convention under `data/media/generated/district_media_review_workspace_v1/images/`.
