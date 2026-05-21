# Geography Relationship Enrichment Review

Date: 2026-05-20  
Source directory: `rofo-geography-priority/`

## Scope

This review covers five legacy geography-related exports:

- `city_alias_01a.sql`
- `cities_nearby_01a.sql`
- `markets_01a.sql`
- `city_stats_01a.sql`
- `officefinder_agents_01a.sql`

The goal is to identify which parts are useful for Rofo's commercial geography and district-comparison platform, and which legacy marketplace or broker-routing concepts should stay internal or be ignored.

## Executive Summary

These exports are useful, but mostly as scaffolding:

- `city_alias` is the strongest normalization input. It should become a canonical alias resolver for search, redirects, city matching, and import cleanup.
- `cities_nearby` is a useful historical nearby-city graph. It should seed nearby market relationships, but not directly drive public district comparisons without distance checks, corpus validation, and editorial review.
- `markets` is a mixed-quality market-name vocabulary. It can help normalize metro/region aliases, but it should not become the canonical geography hierarchy.
- `city_stats` is an internal coverage signal. It can help prioritize markets and weight readiness, but public pages should not expose listing/building-count metrics.
- `officefinder_agents` is mostly lead-routing and service-coverage data. It can inform internal routing and market coverage, but it should not influence public editorial geography except as a weak availability-of-service signal.

Recommended canonical hierarchy:

`region -> metro/market -> city -> commercial district -> representative building`

Representative buildings remain presentation examples only. District intelligence should continue to come from broader raw corpus analysis, provenance/diversity review, spatial/business patterns, and editorial review.

## Source Table Summary

### `city_alias`

Schema:

| Field | Usefulness |
| --- | --- |
| `ca_id` | Legacy row id. Keep for provenance only. |
| `ca_state` | Required disambiguation field for aliases. |
| `ca_alias` | Primary useful field. Raw alternate city name. |
| `ca_c_id` | Canonical city id target. |
| `modify_time`, `create_time` | Low editorial value; useful only for source provenance. |

Observed structure:

- MyISAM SQL dump.
- Unique key on `(ca_alias, ca_state)`.
- Approximately 6,400 alias rows.
- Includes abbreviation variants, punctuation variants, older postal naming, borough-style names, county/campus/military names, and common misspellings.

Useful examples:

- `So San Francisco` and `So. San Francisco` -> South San Francisco city id
- `Ft. Lauderdale` -> Fort Lauderdale city id
- `Ft. Worth` -> Fort Worth city id
- `St. Paul` -> Saint Paul city id
- `Mt Laurel` -> Mount Laurel city id
- `N. Bethesda` -> North Bethesda city id
- `Queens` -> New York-area canonical city id

Best use:

- Search query normalization.
- Import cleanup.
- Redirect and canonical URL resolution.
- Matching legacy listing/building rows to canonical cities.
- Supporting alternate spellings without changing public display names.

Do not use for:

- Public editorial naming by default.
- District identity generation.
- Automatic grammar/article handling for neighborhood names.

### `cities_nearby`

Schema:

| Field | Usefulness |
| --- | --- |
| `c_id` | Source city id. |
| `cn_id` | Nearby city id. |
| `cn_order` | Legacy nearby ranking/order. Useful as a weak priority hint. |

Observed structure:

- MyISAM SQL dump.
- No primary key in dump.
- Ordered adjacency list of city-to-city nearby relationships.
- Relationships are directional in the table and should not be assumed reciprocal.
- Some self-links appear to exist and should be removed during normalization.

Useful examples:

- Bay Area cities show expected city clusters around Alameda, Berkeley, Oakland, Palo Alto, San Francisco, San Mateo, and nearby Peninsula/East Bay cities.
- New York City has nearby relationships into surrounding city ids.
- Phoenix-area rows show multiple surrounding cities and suburbs.

Best use:

- Seed a normalized nearby-city graph.
- Support nearby-market discovery and city-level comparison suggestions.
- Provide fallback candidates when district-level comparison data is thin.
- Help identify hidden historical geography relationships in legacy Rofo behavior.

Limitations:

- No relationship type.
- No distance or travel-time field.
- No commercial rationale.
- `cn_order` may reflect historical product logic rather than current commercial usefulness.
- Not safe as a direct public ranking.

Recommended enrichment:

- Join to canonical cities with lat/lng.
- Remove self-links.
- Detect nonreciprocal links.
- Add computed distance.
- Add shared metro/region/county where available.
- Add corpus co-occurrence signals from raw listings/buildings/leads.
- Add editorial relationship type, such as `adjacent`, `same_metro_alternative`, `commuter_submarket`, `executive_suburban_alternative`, or `industrial/logistics_alternative`.

### `markets`

Schema:

| Field | Usefulness |
| --- | --- |
| `m_id` | Legacy market id. Keep as provenance only. |
| `m_name` | Market or region name. Mixed quality. |
| `modify_time`, `create_time` | Low value. |

Observed structure:

- MyISAM SQL dump.
- Unique key on `m_name`.
- Contains roughly 1,500 market names.
- Includes useful U.S. metro names, global market names, malformed encoding, and low-value broad geographies.

Useful U.S. examples:

- `San Francisco Bay Area`
- `Greater Atlanta Area`
- `Greater Seattle Area`
- `Dallas/Fort Worth Area`
- `Greater Los Angeles Area`
- `Greater San Diego Area`
- `Austin, Texas Area`
- `Las Vegas, Nevada Area`
- `Phoenix, Arizona Area`
- `Orange County, California Area`
- `Miami/Fort Lauderdale Area`
- `Sacramento, California Area`

Best use:

- Metro/region alias vocabulary.
- Historical market-name normalization.
- Search/discovery query expansion.
- Mapping old imports or lead-routing records to canonical regions.

Do not use for:

- Canonical public hierarchy without curation.
- Public market pages as-is.
- Editorial commercial identity.
- District comparison logic by itself.

### `city_stats`

Schema:

| Field | Usefulness |
| --- | --- |
| `cs_c_id` | Canonical city id. |
| `cs_listing_count` | Legacy/current listing count snapshot. Useful as internal coverage signal. |
| `modify_time`, `create_time` | Snapshot/provenance only. |

Observed structure:

- Unique row per city id.
- Snapshot appears current to `2026-05-10 08:35:01` in the dump.
- Contains listing-count coverage by city id only.

Best use:

- Internal readiness and coverage weighting.
- Prioritizing which cities deserve deeper raw-corpus review.
- Flagging cities where public commercial geography pages may be weak due to thin data.
- QA comparison against richer raw market summaries, such as city-level building/listing/lead counts.

Do not use for:

- Public building-count or listing-count pills.
- Public claims about market completeness.
- Public ranking or dashboard metrics.

### `officefinder_agents`

Schema highlights:

| Field group | Usefulness |
| --- | --- |
| `agent_id`, `user_id`, `bh_id`, `c_id` | Internal routing/provenance. |
| `city`, `state`, `postal`, `timezone` | Service geography hints. |
| `suspended`, `no_referrals`, `accept_all_referrals` | Internal routing status. |
| `accept_*`, `*_min_size` | Internal service coverage by property/use type. |
| Names, phone, email, website, bios, awards | Broker/CRM fields. Do not use for public geography. |

Observed structure:

- MyISAM SQL dump.
- Approximately 585 agents.
- Contains service-coverage flags for office, low-cost office, sale office, executive suites, medical, retail, studio, mixed-use, and industrial.
- Strongly broker-routing oriented.

Best use:

- Internal routing and service-coverage checks.
- Identifying markets with active referral coverage.
- Operational readiness signal for availability-report follow-up.

Do not use for:

- Public credibility content.
- Editorial district interpretation.
- Public broker/bio modules.
- Commercial identity generation.

## Nearby Market Logic

The legacy nearby logic appears to be a precomputed city adjacency graph. It is probably a blend of geographic proximity, metro familiarity, and historical Rofo product behavior. It should be treated as a candidate generator, not as a final public comparison system.

Recommended normalized relationship model:

```json
{
  "source_city_id": 39,
  "nearby_city_id": 40,
  "legacy_order": 2,
  "relationship_scope": "city",
  "relationship_type": "same_metro_alternative",
  "distance_miles": 3.4,
  "shared_region": "San Francisco Bay Area",
  "source": ["legacy_cities_nearby", "computed_distance", "editorial_review"],
  "public_use": "candidate_only",
  "notes": "Use as a source for nearby district discovery, not direct district-card copy."
}
```

Public district comparisons should require:

- A nearby or related city/district candidate.
- A commercial rationale.
- A spatial rationale.
- Raw corpus support.
- Editorial review.

## Alias Normalization Opportunities

The `city_alias` table should become a first-class normalization input.

High-value alias classes:

- Abbreviations: `Ft.`, `St.`, `Mt.`
- Directionals: `N.`, `S.`, `E.`, `W.`, `So`, `So.`
- Punctuation variants.
- Common misspellings.
- Postal or historical names.
- Borough or sub-city names where legacy city matching expected them.
- Campus, military, and institutional place names, kept internal unless they map cleanly to public search behavior.

Recommended normalized alias model:

```json
{
  "alias": "So. San Francisco",
  "normalized_alias": "so san francisco",
  "state": "CA",
  "canonical_city_id": 95,
  "source": "legacy_city_alias",
  "confidence": "high",
  "public_display": false,
  "notes": "Search/import alias for South San Francisco."
}
```

Important: editorial overrides should remain separate. This alias system should not try to solve article grammar for neighborhood display names.

## Historical Market Hierarchy

The `markets` export is useful as a historical vocabulary, but it is not a clean hierarchy. It mixes:

- U.S. metro names.
- International regions.
- LinkedIn-style broad market names.
- Malformed encoded names.
- Very broad geographies.
- Some empty or low-value names.

Recommended canonical hierarchy:

1. Region: `West Coast`, `Southeast`, `Texas`, etc. Internal planning layer.
2. Metro/market: `San Francisco Bay Area`, `Greater Atlanta`, `Phoenix Metro`.
3. City: `Oakland`, `Palo Alto`, `Atlanta`.
4. Commercial district: `Downtown Oakland`, `Uptown Oakland`, `Buckhead`.
5. Representative building: presentation example only.

The legacy `markets` table should be converted into a filtered alias vocabulary for metro/region lookup, not a public taxonomy.

## Hidden Commercial Geography Relationships

Potentially useful hidden relationships:

- Legacy nearby-city clusters can reveal how Rofo historically grouped search expansion.
- Market names can reveal old regional labels users or brokers expected.
- City listing counts can identify historically strong Rofo geographies.
- OfficeFinder city coverage can indicate where follow-up infrastructure existed.
- Alias rows can reveal non-obvious user search behavior and import naming variants.

These signals should be combined with the raw building/listing corpus, not used alone.

## Canonical Geography Normalization Strategy

Recommended normalized assets:

1. `city_aliases.normalized.json`
   - Source: `city_alias`
   - Purpose: search/import/redirect normalization.

2. `city_nearby_relationships.normalized.json`
   - Source: `cities_nearby`
   - Purpose: nearby-city graph and relationship candidates.

3. `market_aliases.normalized.json`
   - Source: curated subset of `markets`
   - Purpose: metro/region query normalization.

4. `city_activity_coverage.internal.json`
   - Source: `city_stats` plus richer raw market summaries where available.
   - Purpose: internal readiness and coverage weighting.

5. `officefinder_city_coverage.internal.json`
   - Source: `officefinder_agents`
   - Purpose: internal availability-report routing and service-coverage awareness.

Recommended processing steps:

1. Parse SQL dumps into intermediate JSON/CSV.
2. Join city ids to the canonical cities table and geocodes.
3. Normalize names, punctuation, case, and state disambiguation.
4. Remove invalid city ids, duplicate edges, and self-links.
5. Compute distances and shared metro/region fields.
6. Add source/provenance arrays to every normalized record.
7. Classify records as `public_safe`, `internal_only`, or `candidate_only`.
8. Run editorial review before any relationship becomes public district copy.

## Integration Recommendations

### District Comparison Logic

Use these exports as support layers:

- `cities_nearby`: seed nearby city and submarket alternatives.
- `city_alias`: improve matching when district names or city names vary.
- `city_stats`: flag data-strong cities for review.
- `markets`: map cities to historical metro language.

Do not directly convert nearby city rows into public district comparison cards. Public district cards should remain concise and interpretive:

- why a user would compare the two places
- how the built form differs
- how access or tenant fit differs
- whether the alternative is denser, more suburban, more waterfront, more institutional, more transit-oriented, more creative/adaptive, or more executive-office oriented

### Nearby Market Relationships

Recommended scoring inputs:

- Legacy nearby edge exists.
- Distance between city centers.
- Shared metro/region.
- Raw corpus overlap.
- Listing/building/lead coverage.
- Commercial identity compatibility.
- Editorial approval.

The score should stay internal. Public pages should show reasoned comparison language, not metrics.

### Search And Discovery

Recommended use:

- Resolve aliases before search.
- Expand metro queries using curated `market_aliases`.
- Use `cities_nearby` for "nearby markets" discovery.
- Use `city_stats` only as an internal tie-breaker when result quality is otherwise similar.

Avoid:

- Showing listing counts as public credibility.
- Using broker coverage as public ranking.
- Treating raw market names as polished public geography.

### Commercial Geography Hierarchy

Recommended use:

- Use canonical city ids as the stable join key.
- Use metro/region aliases only after curation.
- Use district entities as the public interpretive layer.
- Keep building examples subordinate to district interpretation.

### Editorial Geography System

These legacy datasets can help editors answer:

- What city names should resolve to this geography?
- What nearby cities historically mattered?
- Is there enough historical data to justify a page?
- Which nearby alternatives should be considered for comparison?
- Which markets have internal follow-up coverage?

They should not write the editorial copy.

## Tables Worth Converting

High priority:

- `city_alias`: convert fully into normalized alias asset.
- `cities_nearby`: convert fully into normalized candidate relationship graph.

Medium priority:

- `city_stats`: convert as internal-only city coverage signal, ideally merged with richer raw market summaries.
- Filtered `markets`: convert only curated U.S. metro/region names and aliases.

Low priority / internal only:

- `officefinder_agents`: convert only aggregate service-coverage by city/state/use type. Do not expose agent details.

## Legacy Concepts To Ignore Or Keep Internal

Ignore for public geography:

- Public listing/building counts.
- Broker bios, photos, awards, designations, and transaction claims.
- Raw global market-name list.
- Agent service flags as public property taxonomy.
- Exact `cn_order` as a public ranking.
- Broker CRM fields.
- Marketplace/funnel language embedded in OfficeFinder descriptions.

Keep internal only:

- Referral coverage.
- Suspended/no-referral status.
- Minimum size preferences.
- Agent property-type acceptance flags.
- City activity counts.

## Recommended Next Implementation Sequence

1. Build a SQL-dump parser for the five tables and emit raw normalized JSON under a non-public data path.
2. Join all city-id based exports to the canonical `cities` table and raw market summary.
3. Produce QA reports for:
   - unresolved city ids
   - duplicate aliases
   - self nearby-links
   - nonreciprocal nearby-links
   - missing geocodes
   - stale or malformed market names
4. Create canonical geography assets:
   - alias resolver
   - nearby-city graph
   - curated market alias list
   - internal coverage/readiness layer
5. Use the Bay Area and Atlanta as validation regions.
6. Add editorial review before any candidate relationship becomes a public nearby district comparison.

## Bottom Line

The priority exports are valuable enrichment inputs, especially for alias normalization and nearby-city discovery. They should strengthen Rofo's commercial geography system behind the scenes, but they should not pull the product back toward listing counts, broker-routing surfaces, or dashboard-style market metrics.

