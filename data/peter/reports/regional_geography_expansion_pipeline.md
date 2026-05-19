# Regional Geography Expansion Pipeline

This report defines a reusable operating system for expanding Rofo neighborhood and commercial-area pages region by region. It uses the Atlanta prototype as the reference implementation and the Bay Area Tier A workflow as the scaling test case.

The pipeline is designed to produce public-ready geography data while keeping the public experience editorial, restrained, spatial, comparison-oriented, and human. It should not turn the site into a dashboard, inventory browser, AI explainer, or source-provenance UI.

Representative buildings are presentation examples only. They should ground the page visually and architecturally, but they are not the intelligence source.

## 1. Required Source Datasets

### Raw commercial corpus

Required:

- `data/peter/raw/rofo_buildings.csv`
- `data/peter/raw/rofo_listings.csv`
- `data/peter/raw/rofo_relationships_listing_buildings.csv`
- `data/peter/raw/rofo_users.csv`
- `data/peter/raw/rofo_broker_houses.csv`
- `data/peter/research/legacy_space_type_code_lookup.json`

Optional but important:

- `data/peter/derived/raw_listing_descriptions_sample.csv`
- `data/peter/derived/building_signals.csv`
- `data/peter/derived/building_semantic_identity_v1.json`
- `data/peter/derived/active_building_semantic_bridge.json`
- `data/peter/research/commercial_ecosystem_candidates.json`
- `data/peter/research/ecosystem_building_expansion_phase1.json`
- `data/peter/research/legacy_building_universe_summary.json`

### Geography and page layer

Required for public handoff:

- `data/peter/research/commercial_area_entities_v1.json`
- `data/peter/research/priority_market_commercial_area_entities_v1.json`
- `data/peter/research/commercial_area_building_relationships_v1.json`
- `_data/neighborhoodPages.js`
- `_data/neighborhoodIntelligence.js`
- `_data/neighborhoodMapHeroes.js`
- `pages/commercial-real-estate/neighborhood.njk`

### Existing reference outputs

Atlanta reference:

- `data/peter/research/atlanta_building_listing_subset_v1.json`
- `data/peter/atlanta/lineage/atlanta_lineage_objects.json`
- `data/peter/atlanta/intelligence/neighborhood_diversity_metrics.json`
- `data/peter/atlanta/intelligence/neighborhood_signal_confidence_v2.json`
- `data/peter/atlanta/reviews/atlanta_signal_editorial_review.json`
- `data/peter/atlanta/reviews/atlanta_approved_editorial_signals.json`
- `data/peter/reports/atlanta_neighborhood_raw_subset_comparison.md`
- `data/peter/atlanta/reports/atlanta_diversity_review.md`
- `data/peter/atlanta/reports/atlanta_signal_confidence_v2_review.md`
- `data/peter/atlanta/reports/atlanta_editorial_signal_review.md`

Bay Area scaling test:

- `scripts/peter/build_bay_area_tier_a_raw_corpus.js`
- `data/peter/research/bay_area_tier_a_raw_corpus_v1.json`
- `data/peter/reports/bay_area_tier_a_raw_corpus_report.md`
- `data/peter/reports/bay_area_tier_a_district_manifest.md`

## 2. Region Input Format

Each future region should start with a single explicit region manifest. This should be a hand-curated planning input, not the final public output.

Recommended path:

`data/peter/research/regions/{region_slug}_district_manifest.json`

Recommended shape:

```json
{
  "region_id": "bay-area-tier-a",
  "region_name": "Bay Area Tier A",
  "state_scope": ["CA"],
  "primary_cities": ["Oakland", "Palo Alto", "Mountain View"],
  "comparison_cities": ["Berkeley", "Menlo Park", "Sunnyvale"],
  "districts": [
    {
      "id": "ba-downtown-oakland",
      "display_name": "Downtown Oakland",
      "slug": "downtown-oakland",
      "city": "Oakland",
      "state_abbr": "CA",
      "area_type": "downtown_core",
      "aliases": ["Oakland City Center", "Frank H Ogawa"],
      "approximate_centroid": { "lat": 37.8044, "lng": -122.2712 },
      "radius_km": 1.55,
      "commercial_identity_hypothesis": "Institutional downtown core and BART-oriented professional office district.",
      "nearby_comparison_hypotheses": ["Uptown Oakland", "Jack London Square", "Old Oakland"],
      "expected_space_types": ["office", "retail", "coworking"],
      "image_brief": "Broadway/civic core with office and BART context."
    }
  ]
}
```

The manifest should include:

- region name and state scope
- target cities and nearby comparison cities
- district display names and slugs
- aliases and naming cautions
- approximate centroids and conservative radii
- expected commercial identity
- expected nearby alternatives
- expected space types
- known data concerns
- desired image/map notes

Do not infer grammar, article usage, or public names automatically when the editorial name matters. Use explicit fields such as `display_name_with_article` where needed.

## 3. Raw Corpus Extraction Workflow

The raw extraction step should produce a working district corpus before any public page data is generated.

Inputs:

- region manifest
- raw buildings
- raw listings
- users
- broker houses
- listing-building relationships
- listing description sample when available
- space type lookup

Process:

1. Load the region manifest.
2. Build the relevant city set from `primary_cities` and `comparison_cities`.
3. Stream `rofo_buildings.csv` and keep rows matching the region state and city scope.
4. Assign raw buildings to candidate districts using:
   - explicit district, alias, or address evidence
   - same-city centroid/radius assignment
   - optional corridor-specific address rules
   - optional manually reviewed polygons in future versions
5. Stream `rofo_listings.csv` and attach listings to assigned buildings.
6. Attach listing contact records from `rofo_users.csv`.
7. Attach building or listing provenance from `rofo_broker_houses.csv`.
8. Attach relationship contacts from `rofo_relationships_listing_buildings.csv`.
9. Attach sampled raw descriptions from `raw_listing_descriptions_sample.csv` when present.
10. Decode space types using `legacy_space_type_code_lookup.json`.
11. Extract internal text signals from listing descriptions and promo text.
12. Write a raw corpus JSON and a human-readable extraction report.

Recommended outputs:

- `data/peter/research/{region_slug}_raw_corpus_v1.json`
- `data/peter/reports/{region_slug}_raw_corpus_report.md`

The raw corpus output must clearly state that rows are historical activity signals, not live inventory or current availability.

## 4. District Segmentation Methodology

District segmentation should combine automation with editorial review.

Use automated signals for:

- city and state filtering
- address and alias matching
- centroid/radius assignment
- rough space-type mix
- building/listing density
- repeated address clusters
- text-signal extraction
- comparison-city context

Use human review for:

- public district names
- whether a district is too broad or too narrow
- whether raw labels are residential or commercially meaningful
- whether adjacent areas should merge
- whether a corridor should be split from a downtown
- whether a building-campus label should become a district
- whether a city-wide page is being disguised as a district page

Recommended segmentation rules:

- Prefer recognized commercial districts over raw neighborhood labels.
- Merge overlapping labels when users would evaluate them together.
- Split districts when built form, tenant fit, access pattern, or comparison logic differs.
- Keep district radii conservative for dense urban areas.
- Use larger radii only for corridor or suburban office districts, and label them as corridors.
- Never treat centroid assignment as public boundary truth.

Atlanta reference:

- Buckhead, Midtown, Downtown Atlanta, Perimeter Center, and West Midtown work because their commercial identities are distinct and the raw corpus is broad enough to support interpretation.

Bay Area test case:

- Downtown Oakland and Uptown Oakland are distinct enough to refine separately.
- Downtown San Mateo / Hayward Park intentionally merges downtown and corridor office context.
- South San Francisco Biotech Corridor should consolidate Oyster Point, East Side, Lindenville, and 101-adjacent biotech context.

## 5. District Qualification Criteria

A district should qualify for public editorial development only if it has enough signal across four dimensions.

### Commercial identity

Required:

- clear business use case
- distinct built form or access pattern
- useful tenant-fit story
- meaningful comparison alternatives

Examples:

- executive suburban node
- adaptive-reuse creative district
- institutional downtown core
- startup/transit corridor
- life science and innovation district
- airport-adjacent commercial node
- showroom-commercial environment
- industrial/flex corridor

### Raw corpus support

Recommended thresholds:

- strong: 35+ raw buildings, 120+ listing rows, 12+ high-confidence assigned buildings
- usable: 15+ raw buildings, 50+ listing rows
- thin: 6+ raw buildings or 20+ listing rows
- not ready: below thin threshold or mostly assignment noise

Thresholds should be adjusted by market type. Dense downtowns should have stronger counts than small boutique districts.

### Assignment quality

Evaluate:

- high-confidence assignment count
- medium-confidence assignment count
- explicit alias/address matches
- centroid-only share
- distance distribution
- outlier buildings
- city-boundary mismatches

If medium-confidence assignments exceed high-confidence assignments, the district requires boundary review before public use.

### Editorial usefulness

The page must answer:

- What kind of commercial environment is this?
- Who is it useful for?
- How does it compare nearby?
- What kind of buildings or spaces does it tend to contain?
- Why would a company choose this district instead of nearby alternatives?

If the answer is generic, defer the district.

## 6. Provenance, Diversity, and Confidence Evaluation

This layer should review whether extracted signals are durable enough to inform editorial writing.

Metrics:

- raw building count
- listing row count
- unique listing IDs
- unique building IDs
- unique contacts
- unique companies
- broker house coverage
- portfolio/feed group coverage
- top source share
- top company share
- known company coverage
- known provenance coverage
- coworking/operator concentration
- space-type concentration
- duplicate listing ratio
- high vs medium assignment mix

LMS handling:

- Treat LMS as Rofo's historical import/publishing tool.
- Do not treat LMS as the original market data source.
- Do treat LMS dominance as a warning that true provenance coverage is thin.
- Do not penalize a district simply because LMS is high if contact and building diversity are strong.
- Do require review before promoting signals when LMS is nearly all rows and original company/provenance coverage is low.

Confidence outputs should be internal. Public pages should not show confidence labels, source concentration, extraction methods, or AI/provenance explanations.

Recommended confidence states:

- `ready_for_editorial_review`
- `strong_raw_support_source_review_required`
- `boundary_review_required`
- `representative_examples_review_required`
- `defer_insufficient_signal`

## 7. Representative Building Selection Rules

Representative buildings should be selected after raw intelligence is reviewed. They are page examples, not evidence.

Selection goals:

- show the district's built form
- avoid repetitive cards
- include typology diversity
- include visual diversity when images exist
- include spatial diversity within the district
- avoid stale or misleading inventory framing

Recommended selection criteria:

- canonical Rofo building page exists or can be generated cleanly
- address is usable and recognizable
- building aligns with district identity
- selected examples include different typologies where appropriate
- selected examples avoid overrepresenting one owner, contact, operator, or feed group
- examples do not imply current availability

Preferred representative mix:

- 3 to 6 examples for public pages
- office tower or downtown office example where relevant
- smaller-scale office or boutique example where relevant
- retail/showroom/adaptive-reuse example where relevant
- industrial/flex/lab example where relevant
- avoid six cards that are all same street, same type, same operator

Reject or flag examples when:

- address is too vague
- building is outside the reviewed district
- building only appears because of centroid drift
- building conflicts with the district story
- the example creates an inventory-widget feel

## 8. Nearby Comparison Generation Logic

Nearby comparisons are a core part of the geography product. They should answer why a user would compare one district with another.

Inputs:

- region manifest comparison hypotheses
- geographic distance
- parent city relationship
- commute/transit/freeway relationship
- shared tenant search pattern
- contrasting commercial identity
- space-type overlap
- adjacent district logic
- manual editorial review

Relationship types:

- `adjacent`
- `nearby_alternative`
- `same_tenant_search_pattern`
- `higher_density_alternative`
- `lower_cost_alternative`
- `more_suburban_alternative`
- `more_transit_oriented_alternative`
- `more_creative_adaptive_alternative`
- `more_industrial_flex_alternative`
- `more_client_facing_alternative`

Public comparison note format:

- one short sentence
- decision-useful
- no score language
- no generic navigation copy

Example notes:

- "More formal downtown office environment with stronger civic and BART access."
- "More adaptive and waterfront-oriented, with warehouse and service-commercial texture."
- "More campus and R&D-oriented than the downtown office core."
- "More premium and client-facing, with stronger walkable downtown context."

Do not rely only on physical distance. A farther district may be a better comparison if tenant choice patterns are similar.

## 9. Editorial Interpretation Framework

The editorial framework should convert internal signal analysis into calm public interpretation.

Public module target:

- "How to read {District}"
- opening positioning statement
- two or three concise explanatory paragraphs
- subtle best-fit descriptors
- nearby comparison cards
- representative examples below
- availability report CTA

Editorial inputs:

- commercial identity
- tenant fit
- built form
- access pattern
- office/commercial character
- business use cases
- nearby alternatives
- raw signal strengths
- diversity/concentration cautions
- representative example notes

Public tone:

- human
- spatial
- restrained
- specific
- comparison-oriented
- no SEO filler
- no dashboard or confidence language
- no AI language
- no "data says" language

Avoid:

- vibrant
- dynamic
- premier
- popular
- thriving
- well-located
- confidence score
- source lineage
- extraction signal
- current availability claims based on historical rows

Example pattern:

```text
How to read Downtown Oakland

Downtown Oakland is the East Bay's formal business core: civic institutions, BART access, professional office buildings, and older downtown blocks clustered around Broadway and the city center.

It fits organizations that want regional transit access, public-sector or nonprofit adjacency, and a more practical East Bay alternative to San Francisco's Financial District.

Compared with Uptown, Downtown Oakland reads more institutional and office-oriented. Compared with Jack London Square, it is less waterfront and more transit/civic focused.
```

## 10. Map and Image Generation Requirements

### Map hero requirements

The map hero should orient the district in the region, not behave like a precise GIS boundary.

Required map inputs:

- district title
- district subtitle
- orientation label
- approximate district point
- nearby district points
- major access references where useful
- suppress flag if the map would mislead

Map output:

- `_data/neighborhoodMapHeroes.js` entry

Map rules:

- show nearby alternatives
- keep the map compact
- preserve the existing hero map pattern
- do not expose exact boundary confidence
- do not show dashboards, scores, or data overlays

### Image requirements

Optional image path convention:

`assets/images/neighborhoods/{STATE}/{city-slug}/{neighborhood-slug}.webp`

Image requirements:

- 1600x900
- restrained contained block below hero
- descriptive commercial streetscape alt text
- no generic skyline unless it directly supports district identity
- no residential-only imagery
- no purely scenic or atmospheric imagery
- no image if the right commercial image is unavailable

Image brief should specify:

- subject
- commercial identity to reinforce
- avoid list
- likely street/corridor
- whether building scale should be low-rise, high-rise, industrial, waterfront, campus, or storefront

## 11. Human Editorial Review Checkpoints

Human review is required at each stage where interpretation or public naming matters.

Checkpoint 1: Region manifest

- approve target districts
- approve display names and slugs
- reject residential or low-signal areas
- approve merge/split decisions

Checkpoint 2: Raw assignment QA

- review top assigned buildings
- review outliers and centroid drift
- adjust radius or aliases
- identify districts needing polygons or manual building lists

Checkpoint 3: Diversity/provenance review

- review top source and company concentration
- review contact breadth
- review coworking/operator skew
- decide whether signals can inform editorial copy

Checkpoint 4: Representative examples

- approve visible building examples
- remove duplicates and mismatches
- ensure typology and visual diversity
- ensure examples do not imply live inventory

Checkpoint 5: Editorial copy

- remove generic phrasing
- ensure distinct commercial identity
- ensure nearby comparisons are decision-useful
- keep tone restrained and human

Checkpoint 6: Page QA

- mobile layout
- map/image fit
- CTA intact
- no backend lead flow changes
- no hidden field/spam protection regressions

## 12. Structured Output and Data Handoff Format

The pipeline should produce separate internal and public handoff files.

### Internal outputs

Raw corpus:

`data/peter/research/{region_slug}_raw_corpus_v1.json`

Report:

`data/peter/reports/{region_slug}_raw_corpus_report.md`

Diversity/confidence:

`data/peter/{region_slug}/intelligence/district_diversity_metrics.json`

Lineage objects:

`data/peter/{region_slug}/lineage/district_lineage_objects.json`

Editorial review:

`data/peter/{region_slug}/reviews/district_editorial_review.json`

### Public handoff outputs

Commercial areas:

`data/peter/research/{region_slug}_commercial_area_entities.json`

Building relationships:

`data/peter/research/{region_slug}_commercial_area_building_relationships.json`

Neighborhood intelligence:

`data/peter/{region_slug}/public/neighborhood_intelligence.json`

Map hero requirements:

`data/peter/{region_slug}/public/neighborhood_map_heroes.json`

Image requirements:

`data/peter/{region_slug}/public/neighborhood_image_requirements.json`

Recommended public district shape:

```json
{
  "id": "ba-downtown-oakland",
  "canonical_name": "Downtown Oakland",
  "display_name_with_article": "",
  "slug": "downtown-oakland",
  "city": "Oakland",
  "state_abbr": "CA",
  "area_type": "downtown_core",
  "recommended_status": "launch",
  "source_confidence": "editorial_reviewed",
  "commercial_profile": ["office", "downtown", "transit_oriented", "professional_services"],
  "approximate_centroid": { "lat": 37.8044, "lng": -122.2712 },
  "nearby_comparisons": [
    {
      "slug": "uptown-oakland",
      "relationship_type": "adjacent",
      "public_note": "More mixed-use and smaller-company oriented, with stronger Uptown arts and retail context."
    }
  ],
  "representative_building_paths": [
    "/commercial-real-estate/building/CA/oakland/1333-broadway/"
  ],
  "neighborhood_intelligence": {
    "heading": "How to read Downtown Oakland",
    "headline": "East Bay institutional business core with BART access, civic adjacency, and professional office depth.",
    "paragraphs": [],
    "best_fit": [],
    "nearby_notes": []
  },
  "map_hero": {},
  "image_requirement": {}
}
```

## 13. Automation Boundaries vs Human Review

### Automate

- raw CSV streaming
- city/state filtering
- alias and centroid assignment
- listing attachment
- contact and broker house attachment
- space-type decoding
- text signal extraction
- count summaries
- concentration metrics
- initial nearby suggestions
- candidate representative building ranking
- report generation
- JSON handoff generation

### Human review required

- public district names
- article/display overrides
- merge/split district decisions
- boundary/radius acceptance
- public commercial identity
- comparison note wording
- representative building approval
- image selection
- final editorial interpretation
- launch/no-launch decisions

### Never automate directly to public

- new page generation from raw candidates
- public confidence labels
- public source/provenance language
- rent or current availability statements from historical data
- large-scale changes to templates or CTA flow

## 14. Risks and Failure Modes During Geographic Scaling

### Over-broad district assignment

Centroid/radius logic can pull in city-scale or residential inventory. This is especially risky in compact cities, corridors, and suburban markets.

Mitigation:

- cap radii by area type
- review top buildings
- compare high/medium assignment ratios
- add manual exclusions
- use polygons where possible

### Source concentration

Historical listings may be dominated by LMS. LMS should be treated as Rofo's import/publishing layer, but high LMS share still means original provenance is thin.

Mitigation:

- keep source concentration internal
- require review before public signal promotion
- value contact/building breadth over source count alone
- use source concentration as a caution, not a public claim

### Representative-example bias

Published building pages can overrepresent available images, executive suites, or active page coverage.

Mitigation:

- choose representative buildings after raw corpus review
- keep examples visually and typologically diverse
- do not derive district identity from displayed cards

### Generic editorial drift

As regions scale, copy can become repetitive and SEO-like.

Mitigation:

- require one distinct commercial identity sentence per district
- require at least two useful nearby comparisons
- ban generic adjectives unless grounded
- review districts in market clusters, not one-offs

### False precision

Raw data can invite boundary, confidence, and score displays that undermine the product tone.

Mitigation:

- keep internal analytics out of public UI
- use approximate orientation language
- describe durable commercial patterns, not exact metrics

### Mismatched district names

Raw labels may be residential, outdated, or building-specific.

Mitigation:

- use editorial display names
- preserve aliases internally
- avoid launching districts that users would not recognize commercially

### Weak comparison logic

Nearby cards can become navigation filler.

Mitigation:

- require a reason-to-compare note
- include both adjacent and substitutable alternatives
- review comparisons by tenant decision pattern, not distance alone

## 15. Suggested Phased Rollout Strategy

### Phase 1: Region manifest

Create the hand-curated region manifest with candidate districts, aliases, centroids, comparison hypotheses, and naming cautions.

Deliverables:

- `{region_slug}_district_manifest.json`
- planning report

### Phase 2: Raw corpus extraction

Run the generalized raw extraction workflow.

Deliverables:

- `{region_slug}_raw_corpus_v1.json`
- `{region_slug}_raw_corpus_report.md`

### Phase 3: Lineage and diversity review

Build lineage objects and diversity metrics similar to Atlanta.

Deliverables:

- `district_lineage_objects.json`
- `district_diversity_metrics.json`
- diversity review report

### Phase 4: District qualification

Decide which districts are ready, which need boundary review, and which should be deferred.

Deliverables:

- launch/defer review file
- district qualification report

### Phase 5: Editorial input generation

Generate internal editorial inputs, not final public copy.

Deliverables:

- commercial identity summaries
- tenant-fit notes
- access/built-form notes
- comparison notes
- approved public-safe signal list

### Phase 6: Representative example preparation

Rank and manually approve representative buildings.

Deliverables:

- representative building candidate list
- approved building paths
- mismatch notes

### Phase 7: Public data handoff

Create structured geography data for the site.

Deliverables:

- commercial area entities
- building relationships
- neighborhood intelligence JSON
- map hero inputs
- image requirements

### Phase 8: Page QA and launch

Run Eleventy build only after site-rendered data, templates, or assets are changed.

QA:

- page renders
- CTA intact
- hidden fields and spam protections intact
- mobile layout clean
- images load only where present
- representative examples support interpretation
- nearby comparisons are useful

## Recommended Next System Step

Convert the Bay Area script into a generic runner:

`scripts/peter/build_region_raw_corpus.js --manifest data/peter/research/regions/bay-area-tier-a.json`

Then backfill Atlanta into the same manifest-driven structure. The goal is not to replace editorial judgment, but to make extraction, counts, concentration review, representative candidate ranking, and handoff files consistent across every future region.
