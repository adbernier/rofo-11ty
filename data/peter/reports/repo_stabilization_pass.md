# Repo Stabilization Pass

Date: 2026-05-12

## Summary

This pass separates the most obvious Peter research and prototype artifacts without changing production URLs, sitemap behavior, routing, or public page behavior.

The goal was conservative cleanup, not a full architecture rewrite.

## Folder Structure

Confirmed or created:

- `data/peter/prototypes/`
- `data/peter/research/`
- `data/peter/reports/`

No `data/peter/production/` folder was created in this pass. Current production runtime inputs remain in `data/peter/normalized/` until a broader production data convention is approved.

## Files Moved

### Prototype Runtime Inputs

Moved:

- `data/peter/normalized/ecosystem_building_activation_review_batch1.json`
- to `data/peter/prototypes/ecosystem_building_activation_review_batch1.json`

Reason:

- This file is required only by the hidden/noindex ecosystem building prototype loader.
- It is not a public production page input.

### Research And Scoring Datasets

Moved from `data/peter/normalized/` to `data/peter/research/`:

- `city_expansion_candidates.json`
- `city_expansion_first_batch.json`
- `commercial_ecosystem_candidates.json`
- `commercial_ecosystem_rollout_phase1.json`
- `ecosystem_building_expansion_phase1.json`
- `legacy_building_universe_summary.json`
- `legacy_city_id_lookup.json`
- `legacy_space_type_code_lookup.json`
- `neighborhoods.candidates.json`
- `neighborhoods.first-wave-candidates.json`
- `neighborhoods.launch-allowlist-draft.json`
- `neighborhoods.launch-review.json`
- `neighborhoods.public-candidates.json`
- `neighborhoods.resolved-candidates.json`

Reason:

- These are strategy, scoring, QA, or future planning outputs.
- They are not loaded directly by current production runtime templates.
- Keeping them in `research/` reduces ambiguity around what deploy/runtime code depends on.

## Runtime Inputs Left In Place

Left in `data/peter/normalized/`:

- `ecosystem_building_public_batch1.json`
- `neighborhoods.hidden-page-data.json`
- `neighborhoods.public-review-allowlist.json`

Reason:

- `ecosystem_building_public_batch1.json` is a current production runtime input for the public ecosystem building batch.
- `neighborhoods.hidden-page-data.json` and `neighborhoods.public-review-allowlist.json` are current runtime inputs for the reviewed neighborhood pages.
- These should eventually move into a clearer production/runtime data convention, but that was intentionally deferred.

## Loader Path Updates

Updated:

- `_data/ecosystemPrototypeBuildings.js`
  - From `data/peter/normalized/ecosystem_building_activation_review_batch1.json`
  - To `data/peter/prototypes/ecosystem_building_activation_review_batch1.json`

Updated:

- `scripts/peter/build_ecosystem_building_expansion_phase1.py`
  - Reads commercial ecosystem scoring inputs from `data/peter/research/`
  - Writes `ecosystem_building_expansion_phase1.json` to `data/peter/research/`

No production page URLs or sitemap rules were changed.

## Runtime Dependencies Verified

Current runtime loaders and their required files:

- `_data/ecosystemPublicBuildings.js`
  - `data/peter/normalized/ecosystem_building_public_batch1.json`
- `_data/ecosystemPrototypeBuildings.js`
  - `data/peter/prototypes/ecosystem_building_activation_review_batch1.json`
- `_data/neighborhoodPages.js`
  - `data/peter/normalized/neighborhoods.hidden-page-data.json`
  - `data/peter/normalized/neighborhoods.public-review-allowlist.json`
- `_data/buildings.js`
  - `data/peter/derived/production_building_semantic_id_lookup.json`

These files exist after the cleanup pass.

## .gitignore Additions

Added safe local scratch ignores:

```gitignore
semantic-building-review-list.txt
data/peter/**/*.scratch.*
data/peter/**/*-scratch.*
data/peter/**/tmp/
data/peter/**/temp/
```

No runtime dependency path was ignored.

## Validation

Command:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npx @11ty/eleventy
```

Result:

- Build passed.
- Public ecosystem building pages still build.
- Neighborhood pages still build.
- Hidden prototype building pages still build from `data/peter/prototypes/`.

## Remaining Cleanup Recommendations

1. Decide on a future `data/peter/production/` convention for reviewed runtime inputs.
2. Move `ecosystem_building_public_batch1.json` and neighborhood runtime JSON only after a production data policy is agreed.
3. Update older reports that still reference pre-move `data/peter/normalized/` paths if those reports will be used as operational docs.
4. Consider excluding `data/peter/reports/` from Eleventy processing in a future pass if reports are not intended to publish into `_site`.
5. Keep generated research JSON explicit rather than blanket-ignoring `data/peter/research/`, because some planning scripts may depend on reviewed research inputs.

## Intentionally Deferred

- No production URL changes.
- No sitemap behavior changes.
- No routing changes.
- No template refactors.
- No deletion of old artifacts.
- No broad report reorganization.
- No commit.
