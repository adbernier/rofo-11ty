# Rofo Recommendation Readiness — Private Shadow v1

Status: private evaluation architecture. No production recommendation behavior or Location Brief integration.

## Sequence

Location Requirement → plausible candidate universe → Requirement-specific intelligence coverage → recommendation readiness → product response.

The candidate composition is evaluated with shortlist creation deferred. A shortlist is materialized only after the gate resolves to `FULL` or `BOUNDED`. `INVESTIGATE` returns no district shortlist.

## Readiness unit

Coverage belongs to a district × property type × relevant intelligence dimension. It is not a general district score or market-wide percentage.

Each plausible district is classified as:

- `EVALUATED`: sufficient relevant reviewed intelligence exists.
- `PARTIALLY_EVALUATED`: useful intelligence exists, but a non-blocking limitation remains.
- `BLOCKED_BY_INTELLIGENCE_GAP`: a material activated dimension is missing and the district cannot be fairly included or excluded.
- `INELIGIBLE`: reviewed property-type intelligence establishes non-fit.

The gate uses material activation rules rather than percentage thresholds. Candidate areas are comparison context; they do not gain component fit or recommendation eligibility.

## Product states

- `FULL`: show Recommended locations and the existing comparison experience.
- `BOUNDED`: show Strong starting points plus one concise investigation caveat.
- `INVESTIGATE`: show search priorities and a recommended investigation step, with no manufactured three-district shortlist.

## Medical boundary

Medical and Life Sciences / Research remain distinct. Medical captures an ordinary-language practice description without applying an Office business identity or environment prior. Patient care is a property-type default, not an unusual Office activity.

Medical location decisions can depend heavily on property conditions that the current district foundation does not evaluate: permitted Medical use, existing buildout, accessibility, patient arrival, parking, elevator/access conditions, specialized improvements, landlord willingness, and current inventory. These belong to Property Requirement, property investigation, and external verification rather than invented Location Intelligence.

Accordingly, current SF Medical calibration resolves to `INVESTIGATE`. Mature SF Office coverage does not raise SF Medical confidence.

## Structured intelligence gaps

Evaluator output includes private `recommendation-intelligence-gap:v1` records with market, property type, district, intelligence dimension, activating Requirement signal, materiality, block status, reason, and observation time. This proves a future demand-driven Market Foundation backlog shape without changing Publisher, EOS, analytics, or production persistence.

## Future Location Brief boundary

For `FULL` and `BOUNDED`:

Location Requirement → recommendations → exploration/comparison → Location Brief → Property Requirement → property search.

For `INVESTIGATE`:

Location Requirement → search priorities → Property Requirement as needed → market investigation → optional broker/expert handoff.

Both paths may eventually converge into an evolving Location Brief. This private sprint does not implement that integration.
