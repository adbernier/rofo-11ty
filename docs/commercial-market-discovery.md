# Commercial Market Discovery v1

Commercial Market Discovery is Rofo's source-controlled research layer for answering:

```text
What appears to exist in the real commercial market?
```

It is intentionally separate from:

- canonical Rofo Knowledge Graph districts
- Commercial Market Evidence collections
- Building Profiles
- Recommendation QA
- Publisher scoring
- Search Intelligence scoring
- public URLs

Discovery findings do not publish content and do not promote canonical geography automatically.

## Flow

```text
External Reality
-> Commercial Market Discovery
-> Discovery vs Canonical Gap Analysis
-> EOS Work
-> Canonical Knowledge
-> Recommendation QA
-> Publisher / Search
-> future Discovery refresh
```

## Source Artifact

Market Discovery records live under:

```text
data/commercial-market-discovery/
```

The registry is:

```text
_data/commercialMarketDiscovery.js
```

Each record stores:

- market identity
- researched date
- discovery version
- research status
- evidence-source standard
- source provenance
- structured findings by ecosystem/property type
- evidence strength
- relationship to current canonical Rofo knowledge
- unresolved questions
- candidate implementation gaps

The artifact stores concise source provenance and finding summaries only. It must not store scraped pages, raw research dumps, or large external payloads.

## Evidence Strength

Valid values:

- `STRONG`: multiple credible sources or authoritative direct evidence
- `SUPPORTED`: credible evidence supports the finding, but depth or boundary detail is more limited
- `EMERGING`: evidence indicates a real pattern, but the commercial identity is less mature or less clearly bounded
- `DISCOVERY_ONLY`: candidate requires stronger validation before implementation planning

Tier 3 discovery sources may identify candidates, but they should not independently establish canonical market truth.

## Canonical Comparison

Valid values:

- `COVERED`: Rofo already represents this commercial reality adequately
- `PARTIAL`: Rofo represents it but understates, narrows, or incompletely models it
- `MISSING`: supported commercial reality is absent from canonical Rofo knowledge
- `CONFLICT`: current Rofo knowledge appears inconsistent with stronger external evidence
- `RESEARCH_MORE`: evidence is insufficient or boundary-sensitive enough that further research should precede implementation

## EOS Integration

EOS builds a compact Commercial Market Discovery platform service from the registry. Mission Control Market Projection exposes a read-only `Commercial Market Discovery` program with:

- research status
- finding counts
- covered / partial / missing / conflict / research-more counts
- compact material-gap labels
- source count

Discovery does not generate executable implementation missions by itself. Canonical promotion requires a separate approved mission.

## Runtime Discipline

`data/generated/eos-admin-runtime.json` receives only compact discovery summaries. Full structured discovery source remains in source control and build-time analysis.

## Future Patterns

New market:

```text
Market Discovery -> Market Foundation -> Canonical Geography -> Commercial Market Evidence -> Representative Buildings / Building Profiles -> Ecosystem Depth -> Comparison Graph -> Recommendation QA -> Publisher maturity
```

Established market:

```text
Discovery Audit -> Gap Analysis -> targeted EOS missions -> refreshed canonical knowledge -> future discovery refresh
```

Search Intelligence can identify demand signals. Market Discovery researches the external commercial reality behind those signals before canonical implementation.
