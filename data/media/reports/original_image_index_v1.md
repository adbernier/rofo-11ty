# Original Image Index V1

This is a read-only index of original Rofo building images in `/ebs2/rofo/content/buildings5/orig`. It is preservation and discovery infrastructure only; it does not publish, upload, optimize, delete, move, or modify media.

## Scan Summary

| Metric | Value |
| --- | --- |
| Root | /ebs2/rofo/content/buildings5/orig |
| Exists | False |
| Is directory | False |
| Total original images | 0 |
| Distinct building IDs | 0 |
| Total size | 0 B |
| Pattern matches | 0 |
| Pattern misses | 0 |
| Unsupported extension files skipped | 0 |
| Oldest file |  |
| Newest file |  |
| Errors captured | 1 |

## Confirmed Archive Context

- Expected originals path: `/ebs2/rofo/content/buildings5/orig`.
- The `orig` directory is expected to contain flat files directly under that path, for example `2871369_8eb82639636133058541cbc82b68604a.jpg`.
- Building IDs are parsed from the filename prefix before the first underscore, using `^([0-9]+)_`; for example `2871369_...jpg` maps to building ID `2871369`.
- Accepted original image extensions are `.jpg`, `.jpeg`, `.png`, `.gif`, and `.webp`, matched case-insensitively.
- Previously confirmed original building images: 337,050.
- Previously confirmed original image volume: 342GB.
- Previously confirmed distinct building IDs with originals: 175,670.

## Extension Distribution

_None._

## Top Buildings By Original Image Count

_None._

## Largest Original Files

_None._

## Invalid Filename Pattern Samples

_None._

## Strategic Use

This index should become the stable lookup layer for district media discovery, representative imagery review, preview extraction, accepted image export, and future curated R2 upload planning. Future workflows should query this index instead of repeatedly scanning the full 3.3M-file `buildings5` corpus.

## Guardrails

- This is not a public image feed.
- Do not expose absolute archive paths publicly.
- Do not treat image count as public district or building coverage.
- Human review remains required before representative imagery is accepted for any public use.

## EC2 Command

Run on the Production APP EC2 instance from the repo root:

```bash
/usr/bin/python scripts/media/original_image_index_v1.py
```

To also mirror the generated index into the repo working tree for review:

```bash
/usr/bin/python scripts/media/original_image_index_v1.py --repo-mirror
```
