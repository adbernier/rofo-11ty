# Geography Graph V1

Geography Graph V1 is an internal Rofo data foundation for geography normalization, nearby-market discovery, search/discovery support, SEO planning, and editorial commercial-geography review.

It is not connected to public templates yet.

## What This Is

Geography Graph V1 provides conservative, source-aware records for:

- canonical city nodes resolved from the legacy Rofo cities table
- city alias records for search, redirects, and import normalization
- legacy market vocabulary for metro/region query context
- nearby-city relationship seeds from the legacy nearby table
- internal-only readiness and service-coverage hints from `city_stats` and `officefinder_agents`

The graph is intentionally conservative. Most relationship records are marked `seed_unvalidated` or `needs_review` because legacy nearby logic is a starting point, not public truth.

## What This Is Not

Geography Graph V1 is not:

- a listings marketplace feed
- a broker CRM feed
- a public dashboard or scoring system
- a replacement for editorial review
- a source of public building/listing counts
- a source of public broker/service claims
- a district-boundary system
- a complete commercial-district ontology

Representative buildings remain presentation examples only. They are not the intelligence source.

## Files

### `nodes.json`

Canonical geography nodes and legacy market vocabulary nodes.

Primary node types:

- `city`
- `legacy_market_vocabulary`

City nodes use Rofo legacy city ids as stable ids in the form `city:{legacy_city_id}`. When a city id cannot be safely resolved, the node is retained but marked `needs_review`.

### `aliases.json`

Alias and vocabulary records.

Primary alias types:

- `city_alias`
- `legacy_market_vocabulary`

City aliases come from `city_alias` and should be used for search, redirects, and import normalization. They should not be used as default public display names.

Market vocabulary records come from a conservative filtered subset of `markets`. They are metro/region naming context only, not a canonical hierarchy.

### `relationships.json`

Relationship seed records.

V1 currently includes nearby-city seeds from `cities_nearby`. These are marked internal candidate records and require validation before they are used in public district comparison copy.

Each relationship includes:

- `source_id`
- `target_id`
- `relationship_type`
- `confidence`
- `validation_status`
- `sources`
- `notes`

### `relationship_types.json`

Controlled relationship type definitions for V1.

Current relationship types:

- `nearby_to`
- `alternative_to`
- `complementary_to`
- `connected_to`
- `similar_identity_to`
- `legacy_related_to`
- `needs_review`

Only `nearby_to` is populated from legacy data in V1. The other types are reserved for editorially reviewed district and market relationships.

### `source_notes.md`

Source-by-source notes explaining how each legacy export was used or intentionally limited.

## Validation Status Values

Common values:

- `canonical_city_resolved`: matched to the canonical legacy city table.
- `seed_unvalidated`: useful seed record, but not reviewed for public geography.
- `needs_review`: unresolved, weak, ambiguous, or not safe for public use without review.

## Public Use Guidance

Do not directly render these files on public pages yet.

Before a geography relationship becomes public:

1. Resolve both sides to canonical geography.
2. Check distance and spatial logic.
3. Check raw corpus support.
4. Add a commercial rationale.
5. Review whether the relationship is useful for a user comparing districts or markets.
6. Convert the relationship from a seed into an editorially approved public data record.

## Record Counts

Generated V1 record counts:

- `nodes.json`: 14,891 records
- city nodes: 14,614
- legacy market vocabulary nodes: 277
- `aliases.json`: 6,694 records
- city aliases: 6,417
- market vocabulary aliases: 277
- `relationships.json`: 3,487 nearby-city seed records
- `relationship_types.json`: 7 relationship types

Validation counts:

- nodes marked `needs_review`: 395
- aliases marked `needs_review`: 278
- relationships marked `needs_review`: 189
- relationships marked `seed_unvalidated`: 3,298
- self-links suppressed from `cities_nearby`: 1

