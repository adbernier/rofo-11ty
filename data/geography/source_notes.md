# Geography Graph V1 Source Notes

Date: 2026-05-21

Primary reference:

- `data/peter/reports/geography_relationship_enrichment_review.md`

Legacy exports inspected:

- `rofo-geography-priority/city_alias_01a.sql`
- `rofo-geography-priority/cities_nearby_01a.sql`
- `rofo-geography-priority/markets_01a.sql`
- `rofo-geography-priority/city_stats_01a.sql`
- `rofo-geography-priority/officefinder_agents_01a.sql`

Canonical city reference:

- `data/peter/raw/cities/cities_v01a.sql`

## `city_alias`

Used in V1.

Purpose:

- city search normalization
- redirect support
- import cleanup
- alternate spelling and abbreviation matching

How it was normalized:

- each alias row became an `aliases.json` record with `alias_type: "city_alias"`
- original values were preserved under `source_values`
- aliases target canonical city node ids when the referenced city id resolves
- unresolved alias targets are retained and marked `needs_review`
- all city aliases are marked `public_facing: false`

Important limitation:

`city_alias` should not control public display naming. It is a normalization layer, not an editorial naming layer.

## `cities_nearby`

Used in V1 as seed data only.

Purpose:

- nearby-city candidate relationships
- search/discovery expansion
- future nearby-market recommendations
- raw candidate generation for district comparison workflows

How it was normalized:

- each non-self row became a `relationships.json` record
- relationship type is `nearby_to`
- source is `legacy.cities_nearby`
- relationship records are marked `seed_unvalidated` when both cities resolve
- unresolved relationships are marked `needs_review`
- one self-link was suppressed

Important limitation:

Legacy nearby rows are not public truth. They do not include distance, travel time, relationship type, commercial rationale, or editorial approval.

Before public use, each relationship needs:

- distance/spatial validation
- same-market or relevant-cross-market review
- raw corpus support
- commercial rationale
- editorial approval

## `markets`

Used in V1 in a limited way.

Purpose:

- legacy metro/region vocabulary
- search query expansion
- historical naming context

How it was normalized:

- a conservative filtered subset became `legacy_market_vocabulary` nodes
- matching vocabulary records were added to `aliases.json`
- all market records are marked `needs_review`
- records are not connected into a canonical hierarchy

Important limitation:

The legacy `markets` export mixes useful U.S. metro labels with global, social-network-style, malformed, and low-value names. It should not become the canonical public geography hierarchy.

## `city_stats`

Used in V1 only as internal node context.

Purpose:

- internal coverage/readiness signal
- prioritization support for future geography review

How it was normalized:

- city nodes include an internal coverage band when a city_stats row exists
- raw listing counts are not exposed as public copy
- the signal is explicitly marked internal in node source notes

Important limitation:

Do not use `city_stats` for public count pills, rankings, market completeness claims, or dashboard-style metrics.

## `officefinder_agents`

Used in V1 only as internal node context.

Purpose:

- internal service/routing coverage awareness
- operational readiness for availability-report follow-up

How it was normalized:

- active, non-suppressed city-level service coverage is summarized on city nodes
- supported use-type flags are retained only as internal signals
- no broker names, contact details, bios, awards, photos, or CRM fields were emitted

Important limitation:

OfficeFinder is historical routing infrastructure, not public commercial geography intelligence. It should not shape editorial district identity.

## Recommended Next Step

Create a validation pass that enriches `relationships.json` with:

- computed distance between city centers
- reciprocal-link detection
- shared state/metro/region flags
- raw corpus support
- relationship rationale candidates
- editorial review status

After that pass, selected relationships can be promoted into public district or market comparison data. Until then, Geography Graph V1 should remain infrastructure only.

