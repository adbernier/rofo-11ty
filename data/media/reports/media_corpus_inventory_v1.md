# Media Corpus Inventory V1

This report inventories the recovered Rofo production media corpus as a preservation and commercial-geography asset. It is intentionally inventory-only: no files were moved, optimized, deleted, uploaded, or rewritten.

## Execution Status

The current execution environment could not access 3 configured root(s). The script should be run on the Production APP EC2 instance where the EBS volumes are mounted.

| Root | Expected path | Known size | Status |
| --- | --- | --- | --- |
| buildings5 | /ebs2/rofo/content/buildings5 | 620G | Path not found: /ebs2/rofo/content/buildings5 |
| listings4 | /ebs2/rofo/content/listings4 | 84G | Path not found: /ebs2/rofo/content/listings4 |
| pdfs | /ebs1/rofo/www/content/pdfs | 2.7G | Path not found: /ebs1/rofo/www/content/pdfs |

## Configured Corpus Roots

| Corpus | Path | Accessible | Files scanned | Measured size | Known size |
| --- | --- | --- | --- | --- | --- |
| buildings5 | /ebs2/rofo/content/buildings5 | no | 0 | not scanned | 620G |
| listings4 | /ebs2/rofo/content/listings4 | no | 0 | not scanned | 84G |
| pdfs | /ebs1/rofo/www/content/pdfs | no | 0 | not scanned | 2.7G |

## Confirmed Production Findings

- `buildings5`: 620G total.
- `buildings5/orig`: 342G total.
- `buildings5/orig`: 337,050 files.
- `buildings5/orig`: 175,670 distinct building IDs represented.
- `listings4`: 84G total.
- `pdfs`: 2.7G total.
- Known image derivative folders: `orig`, `standard`, `thumb`, `smthumb`.
- Observed filename convention: `{building_id}_{hash}.{ext}`.

## Corpus Assessment

The recovered media corpus has high strategic preservation value. The `buildings5/orig` volume alone suggests unusually broad historical building-level visual coverage, with enough scale to support representative commercial district imagery, building environment understanding, and curated editorial visualization.

Representative buildings should remain presentation examples rather than the source of commercial intelligence. Media should support visual grounding after district identity has been validated through the broader raw corpus, provenance review, and editorial judgment.

## Building Coverage

Live building-level coverage could not be recomputed in this environment. Based on confirmed production findings, `buildings5/orig` covers 175,670 distinct building IDs with 337,050 original files, or about 1.92 original files per represented building ID.

## Derivative Structure

The known derivative structure strongly suggests many reusable original assets plus lower-value generated derivatives. `orig` should be treated as the preservation source; `standard`, `thumb`, and `smthumb` should be considered convenience derivatives that can likely be regenerated later.

## Image Dimensions

No dimension samples were collected in this environment. The script includes lightweight JPEG, PNG, GIF, and WebP header sampling for EC2 execution.

## Bay Area And District Imagery Potential

Expected usefulness is high, but district-specific strength still needs a join between building IDs, addresses, city/neighborhood metadata, and the recovered media filenames. The most valuable next step is a media-to-building join that maps image assets to canonical building records and commercial district candidates.

Likely strongest uses:

- Representative commercial district imagery for Bay Area flagship districts.
- Editorial building examples that support commercial identity without implying inventory completeness.
- District visual QA, especially for Downtown Oakland, Uptown Oakland, Jack London Square, Financial District SF, Downtown Palo Alto, Mountain View, Redwood City, and South San Francisco.
- Future corridor-level image briefs where building media can show built-form texture.

## Preservation Strategy

- Preserve `orig` as the canonical archival source.
- Treat `standard`, `thumb`, and `smthumb` as derived assets until proven otherwise.
- Keep source paths and filename hashes intact in manifests.
- Generate content-addressed manifests before any migration.
- Do not deduplicate destructively until a representative sample confirms derivative and duplicate patterns.

## R2 Strategy

- Start with manifest-first migration planning, not upload-first migration.
- Use building ID and original hash as stable lookup keys.
- Upload originals into an archival bucket/prefix first, then regenerate web derivatives through a controlled image pipeline.
- Keep PDFs separate from image media because access, rendering, and preservation behavior differ.
- Consider district pilot subsets before full corpus migration.

## Risks And Unknowns

- Some files may not follow `{building_id}_{hash}.{ext}`.
- Some derivative folders may contain missing or stale derivatives.
- File timestamps may reflect migration/copy activity rather than original upload date.
- Listing media may duplicate building media or represent stale listing-specific assets.
- Building IDs need a canonical join before district image strength can be assessed.
- PDFs may include marketing flyers, outdated material, or broker documents that should not be surfaced publicly without review.

## Confidence

- High confidence: corpus scale, derivative folder names, filename convention, and preservation value.
- Medium confidence: derivative regeneration strategy and representative district imagery usefulness.
- Low confidence until EC2 scan and building join: Bay Area district-specific coverage, duplicate rates, and image quality distribution.

## Next Recommended Infrastructure Step

Run this inventory script on the mounted Production APP EC2 instance, then create Media-to-Building Join V1: a manifest that connects building media IDs to canonical building records, city/state, addresses, district candidates, and representative-image review status.

Command:

```bash
node scripts/media/media_corpus_inventory_v1.js
```

