# Building Enrichment Pipeline Recommendation

## Recommendation

There is enough useful data to justify a v1 enrichment layer, but the current exports support a mixed strategy:

1. Use structured building and listing fields for building intelligence.
2. Use tenant lead messages for demand and tenant-fit semantics.
3. Use broker/feed descriptions only when richer future exports include listing remarks, highlights, amenities, or marketing copy.

## Static-Site-Compatible v1 Pipeline

1. Read raw Peter CSV exports in a local batch script.
2. Normalize legacy IDs, city/state keys, and numeric fields.
3. Build a text blob from available safe fields.
4. Apply deterministic phrase dictionaries and regex rules.
5. Score each signal with evidence snippets.
6. Write reviewed CSV/JSON under `data/peter/derived/`.
7. Later, selectively promote reviewed signals into `_data/` for Eleventy templates.

## What to Extract First

Start with 20 to 40 explainable tags across: building character, workspace style, access, tenant fit, operational signals, amenities, and market position. The included taxonomy file contains 30 proposed signals.

## How Signals Should Surface Later

### Building Pages

- Add subtle tags such as `Creative office`, `Transit adjacent`, or `Warehouse/distribution` only when evidence is strong.
- Prefer phrases like historical activity and tenant-fit signals.
- Do not show stale listing details, suite numbers, or old availability.

### City Pages

- Aggregate signal counts to describe the mix of demand and building environments.
- Use signals to prioritize space-type links and market guide enrichment.

### Neighborhood Pages

- Use aggregated building character and tenant-fit signals to explain business district identity.
- Representative buildings should remain examples of district fabric, not active listings.

## What Not to Build Yet

- No live listings UX.
- No AI service dependency.
- No real-time indexing pipeline.
- No production template changes until a small reviewed signal set is approved.

## Current Data Limitations

- Listing marketing text is absent from `rofo_listings.csv`.
- Space type codes need authoritative mapping.
- Broker house descriptions are rich but extremely sparse.
- Lead messages include spam/noise and describe tenant needs rather than property facts.
