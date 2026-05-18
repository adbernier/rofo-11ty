# Repo Research Artifact Cleanup

Generated: 2026-05-12

This report categorizes the current modified/untracked files after the Rofo research and prototype workflows. No files were moved or deleted as part of this audit.

## Current Status Summary

- Modified production/runtime file: `_includes/base.njk`
- Untracked normalized JSON datasets: 15
- Untracked markdown reports: 14
- Untracked Peter script: 1
- Untracked local scratch file: 1

## Categorized Files

| file | status | category | recommended_action | reason |
| --- | --- | --- | --- | --- |
| _includes/base.njk | modified | A. Production/runtime required | commit | Adds `robots` meta support used by noindex pages. This is runtime behavior, not research output. |
| data/peter/normalized/ecosystem_building_activation_review_batch1.json | untracked | B. Prototype/runtime required | commit or move to data/peter/prototypes/ | Required by tracked `_data/ecosystemPrototypeBuildings.js`; high priority because builds will fail without it. |
| data/peter/normalized/ecosystem_building_expansion_phase1.json | untracked | C. Research/derived datasets | move | Intermediate representative expansion dataset used to create the activation batch. Keep for traceability but not runtime once batch is stable. |
| data/peter/normalized/commercial_ecosystem_candidates.json | untracked | C. Research/derived datasets | move | Large scored market ecosystem candidate set for strategy and future planning; not directly required by runtime pages. |
| data/peter/normalized/commercial_ecosystem_rollout_phase1.json | untracked | C. Research/derived datasets | move | Phase-one market shortlist used by the expansion script; not required by runtime pages. |
| data/peter/normalized/city_expansion_candidates.json | untracked | C. Research/derived datasets | move | City expansion audit dataset; strategy/QA artifact, not runtime. |
| data/peter/normalized/city_expansion_first_batch.json | untracked | C. Research/derived datasets | move | City expansion shortlist; strategy artifact pending review. |
| data/peter/normalized/legacy_building_universe_summary.json | untracked | C. Research/derived datasets | move | Lightweight aggregate summary of legacy building universe; useful for planning, not runtime. |
| data/peter/normalized/legacy_city_id_lookup.json | untracked | C. Research/derived datasets | move | Lookup used for neighborhood resolution workflows. Keep as derived research unless a production neighborhood pipeline adopts it. |
| data/peter/normalized/legacy_space_type_code_lookup.json | untracked | C. Research/derived datasets | commit or move to data/peter/production/ | Important decoded space-type mapping used by expansion scripts; should become a stable input if future workflows depend on it. |
| data/peter/normalized/neighborhoods.candidates.json | untracked | C. Research/derived datasets | move | Normalized candidate set from legacy neighborhoods; research/QA input, not public runtime. |
| data/peter/normalized/neighborhoods.public-candidates.json | untracked | C. Research/derived datasets | move | Filtered candidate set for planning; not runtime. |
| data/peter/normalized/neighborhoods.resolved-candidates.json | untracked | C. Research/derived datasets | move | City-resolved candidate set for review; not runtime unless future pages expand. |
| data/peter/normalized/neighborhoods.launch-review.json | untracked | C. Research/derived datasets | move | Pilot-market launch review dataset; research/QA artifact. |
| data/peter/normalized/neighborhoods.launch-allowlist-draft.json | untracked | C. Research/derived datasets | move | Draft allowlist with approximate building counts; planning artifact. |
| data/peter/normalized/neighborhoods.first-wave-candidates.json | untracked | C. Research/derived datasets | move | First-wave candidate set used before the public-review allowlist. Superseded for runtime by tracked hidden/public-review data. |
| scripts/peter/build_ecosystem_building_expansion_phase1.py | untracked | C. Research/derived datasets | commit | Repeatable research script that generated the representative ecosystem expansion dataset. Keep under `scripts/peter/`. |
| data/peter/reports/city_expansion_density_audit.md | untracked | D. Reports/documentation | commit | Audit report worth preserving as strategic documentation. |
| data/peter/reports/commercial_ecosystem_scoring.md | untracked | D. Reports/documentation | commit | Market ecosystem scoring report worth preserving. |
| data/peter/reports/ecosystem_building_activation_review_batch1.md | untracked | D. Reports/documentation | commit | Documents the selected 63-building activation review batch. |
| data/peter/reports/ecosystem_building_expansion_phase1.md | untracked | D. Reports/documentation | commit | Documents the representative expansion planning output. |
| data/peter/reports/ecosystem_building_prototype_build.md | untracked | D. Reports/documentation | commit | QA report for hidden/noindex building prototype generation. |
| data/peter/reports/legacy_building_universe_audit.md | untracked | D. Reports/documentation | commit | Foundational audit report for the legacy building universe. |
| data/peter/reports/legacy_space_type_code_mapping.md | untracked | D. Reports/documentation | commit | Documents the decoded legacy listing space-type mapping. |
| data/peter/reports/neighbourhoods_v01a_inventory.md | untracked | D. Reports/documentation | commit | R2 neighborhood source inventory report. |
| data/peter/reports/neighborhood_candidates_qa.md | untracked | D. Reports/documentation | commit | QA report for normalized neighborhood candidates. |
| data/peter/reports/neighborhood_city_resolution_qa.md | untracked | D. Reports/documentation | commit | QA report for legacy city/state resolution. |
| data/peter/reports/neighborhood_launch_allowlist_review.md | untracked | D. Reports/documentation | commit | Launch allowlist review report. |
| data/peter/reports/neighborhood_hidden_prototype_build.md | untracked | D. Reports/documentation | commit | Hidden neighborhood prototype build report. |
| data/peter/reports/neighborhood_prototype_page_qa.md | untracked | D. Reports/documentation | commit | QA report for generated neighborhood prototype pages. |
| data/peter/reports/neighborhood_public_review_build.md | untracked | D. Reports/documentation | commit | Report for 10-page public-review neighborhood build. |
| semantic-building-review-list.txt | untracked | E. Local scratch / should ignore | keep local only / ignore | Local review list outside the Peter folder. Not required by build or reports. |

## Category Summary

- A. Production/runtime required: 1 file(s)
- B. Prototype/runtime required: 1 file(s)
- C. Research/derived datasets: 15 file(s)
- D. Reports/documentation: 14 file(s)
- E. Local scratch / should ignore: 1 file(s)

## Missing Production Or Prototype Dependencies

High priority:

- `_data/ecosystemPrototypeBuildings.js` is tracked and requires `data/peter/normalized/ecosystem_building_activation_review_batch1.json`, which is currently untracked. If the code is committed without that JSON, Eleventy builds will fail. Either commit that JSON with the prototype, or move it to `data/peter/prototypes/` and update the loader in the same commit.

Medium priority:

- `scripts/peter/build_ecosystem_building_expansion_phase1.py` depends on untracked normalized inputs: `commercial_ecosystem_rollout_phase1.json`, `commercial_ecosystem_candidates.json`, and `legacy_space_type_code_lookup.json`. That is acceptable for a research script only if those inputs are committed, moved with the script, or documented as generated prerequisites.
- `_includes/base.njk` has a production/runtime change for `robots` meta support. This should be reviewed and committed with the noindex prototype work if noindex pages remain in the site.

No issue found:

- `_data/neighborhoodPages.js` depends on tracked `neighborhoods.hidden-page-data.json` and `neighborhoods.public-review-allowlist.json`.
- Current sitemap logic excludes neighborhood pages marked `noindex` and does not reference prototype building pages.

## Proposed Folder Policy

Recommended target structure:

- `data/peter/production/`: small, reviewed runtime inputs used by deployed features. Examples: approved neighborhood allowlists, semantic preview data, stable lookup tables needed by production builds.
- `data/peter/prototypes/`: small runtime inputs for hidden/noindex prototype pages. Examples: `ecosystem_building_activation_review_batch1.json` while prototype building pages exist.
- `data/peter/research/`: derived strategy/scoring datasets that are not runtime dependencies. Examples: city expansion candidates, commercial ecosystem candidates, launch review drafts.
- `data/peter/reports/`: markdown reports and decision records worth preserving.
- `scripts/peter/`: repeatable batch scripts and audit scripts only. Scripts should document required inputs and outputs.
- keep `data/peter/raw/`, `data/peter/derived/*.csv`, and `data/peter/samples/*.csv` ignored unless a tiny curated fixture is intentionally added.

Recommended movement later, after confirmation:

- Move prototype runtime JSON from `data/peter/normalized/ecosystem_building_activation_review_batch1.json` to `data/peter/prototypes/ecosystem_building_activation_review_batch1.json` and update `_data/ecosystemPrototypeBuildings.js`.
- Move stable mapping `legacy_space_type_code_lookup.json` to `data/peter/production/` if it becomes a reusable pipeline input.
- Move large strategy datasets such as `commercial_ecosystem_candidates.json`, `city_expansion_candidates.json`, and neighborhood candidate files into `data/peter/research/`.
- Keep reports in `data/peter/reports/` as-is.

## .gitignore Recommendations

Current `.gitignore` already excludes `data/peter/raw/`, `data/peter/derived/*.csv`, `data/peter/samples/*.csv`, `_site/`, and `node_modules/`, but it contains duplicate Peter raw/derived entries.

Recommended additions or cleanup, not applied yet:

```gitignore
# OS / local scratch
.DS_Store
semantic-building-review-list.txt
*.tmp
*.log

# Peter large/local-only sources
data/peter/raw/
data/peter/**/*.zip
data/peter/**/*.sql

# Peter large generated exports
data/peter/derived/*.csv
data/peter/samples/*.csv
data/peter/derived/building_semantic_identity_v1.json
data/peter/derived/raw_listing_*.json

# Keep reviewed runtime/prototype/research JSON explicit rather than blanket-ignoring data/peter/normalized/
```

Do not blanket-ignore `data/peter/normalized/` until runtime inputs are moved, because some current prototype code depends on normalized JSON files.

## Recommended Next Cleanup Sequence

1. Decide whether hidden/noindex prototype building pages should remain buildable from the repo. If yes, commit or move/commit `ecosystem_building_activation_review_batch1.json` with the loader.
2. Commit `_includes/base.njk` with the noindex/prototype work if the robots meta support is intended to ship.
3. Move research datasets into `data/peter/research/` in a separate low-risk file organization pass.
4. Keep markdown reports under `data/peter/reports/` and commit the reports that document decisions.
5. Add `.gitignore` cleanup in a separate commit after deciding which normalized JSON files become runtime inputs.
6. After confirmation, delete or ignore `semantic-building-review-list.txt`.
