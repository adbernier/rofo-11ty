# Rofo Location Intelligence — Marin Diagnosis + Business Environment Calibration Report

Date: 2026-08-17

Status: bounded private/shadow sprint. Production recommendation behavior is unchanged.

## Part A — Marin Diagnosis

### Exact Requirement Reproduced

The deterministic `operatorMarin` fixture uses San Francisco / Office, Jackson Square as comparison context, approximately 35 peak attendees, ordinary Office use, MATERIAL employee cohorts from San Francisco and Marin / North Bay, rare clients, HELPFUL transit, and VERY IMPORTANT parking.

Jackson Square is marked `candidatePreference: true` but candidate preference never participates in eligibility, component bands, tie keys, or ordering.

### Root Cause

The Access evaluator was correct at cohort level. SoMa and South Beach each had STRONG supported San Francisco access and UNKNOWN Marin / North Bay access. Composition then made two errors:

1. `accessComponent()` accepted the known cohort's STRONG `overall` result at MEDIUM confidence even though another MATERIAL employee cohort was UNKNOWN.
2. `dimensionValue("employee")` removed UNKNOWN cohorts before selecting the displayed band, so the comparison rendered `Strong`.

This was a composition and presentation defect. It was not missing Marin gateway evidence and was not caused by parking.

### Access Cohort Trace

| District | San Francisco employees | Marin / North Bay employees | Correct private treatment |
| --- | --- | --- | --- |
| Financial District | STRONG via local transit | GOOD via reviewed ferry path | GOOD/HIGH Access component |
| Presidio | GOOD via reviewed driving path | STRONG via Golden Gate Bridge | GOOD/HIGH Access component |
| Jackson Square | STRONG via local transit | UNKNOWN | MODERATE capped component; Mixed display |
| South Beach | STRONG via local transit | UNKNOWN | MODERATE capped component; Mixed display |
| SoMa | STRONG via local transit | UNKNOWN | MODERATE capped component; Mixed display |
| Mission Bay | STRONG via local transit | UNKNOWN | MODERATE capped component; Mixed display |

The display now says, for example, `Mixed — Strong for San Francisco; Marin / North Bay access not established`. No numeric averaging was introduced.

### Why Presidio Was / Was Not Included

Presidio was evaluated before and after the fix. It generically access-activates because the MATERIAL North Bay cohort has an approved STRONG Golden Gate Bridge driving path, Office fit is GOOD, its shadow eligibility prerequisites are satisfied, and its evidence is reviewed. It was absent from the operator top three because partially supported starting districts incorrectly received two STRONG component counts while Presidio's honest GOOD/GOOD/GOOD composition received none. The fix removes that false advantage without naming Presidio in the rule.

### Why SoMa / South Beach Were Labeled Strong

The known San Francisco cohort masked the UNKNOWN Marin cohort twice: first in composition, then in comparison presentation. HELPFUL transit mapped correctly to MATERIAL. VERY IMPORTANT parking mapped to CORE and only modified an existing approved driving path by one bounded ordinal band; it did not create a Marin path.

### Defect or Intended Behavior

Defect: multi-cohort composition and comparison display. Intended behavior: the Access evaluator's cohort results, reviewed gateway paths, generic Presidio activation, candidate neutrality, and HELPFUL-versus-REQUIRED semantics.

### Fixes Made

- A known + UNKNOWN MATERIAL employee-origin set cannot retain an access component above MODERATE; treatment is `MATERIAL_COHORT_GAP_CAP`.
- Employee comparison summaries preserve the gap as `Mixed` with origin-specific text.
- The prototype session payload now has a version. Older or structurally stale session payloads are not restored into the current evaluator.
- No Access Foundation evidence, production resolver, public content, or production recommendation behavior changed.

### Corrected Private Shortlist

1. Financial District — STRONG_FIT. Office STRONG; Business Environment GOOD; Access GOOD/HIGH. Both employee origins have reviewed support.
2. Presidio — STRONG_FIT. Office GOOD; Business Environment GOOD; Access GOOD/HIGH. Marin is STRONG through the reviewed Golden Gate Bridge path; current suitable inventory remains explicitly unverified.
3. Mission Bay — GOOD_FIT. Office STRONG; Business Environment GOOD; Access MODERATE after the MATERIAL Marin gap cap. Employee access displays as Mixed.

Jackson Square, South Beach, and SoMa remain credible comparisons, but their current evidence cannot present Marin access as established.

### Marin QA

`scripts/qa-private-location-composition-v1.js` now covers the exact operator fixture, distinct MATERIAL cohorts, UNKNOWN visibility, comparison consistency, Presidio generic eligibility, candidate neutrality, bounded parking, HELPFUL transit, versioned session state, and evidence/explanation trace retention.

## Part B — Business Environment

### Existing Business Environment Intelligence

Rofo already has reusable structured SF signals in the SF Office model: `stableAttributes` (client accessibility, district image, modern and creative character, talent access, lower-rise character), `ecosystems`, `buildingCharacter`, `officeEnvironmentTaxonomy`, `businessTypeEffects`, and reviewed cross-signal rules. The Knowledge Graph adds office subtypes, activities, archetypes, strengths/tradeoffs, `bestFor`, and commercial ecosystem metadata. The Commercial Location Model adds district thesis and best/poor-fit business prose. CME provides reviewed building and district evidence, but much of its business-environment value remains prose or representative-building classification rather than a direct district scoring input.

Reusable concepts overlap across layers: `professional_services`, `traditional_professional`, professional-office archetypes, executive/client image, and client accessibility describe related but non-identical ideas; likewise `design_creative`, `creativeCharacter`, creative-office subtype, and creative-studio archetype overlap. The private calibration reuses the SF Office model as the operational reviewed mapping and retains the other layers as evidence sources. It does not synthesize new district claims.

Important gap: the Access Foundation's private composition universe currently has seven districts. Existing SF Office evidence can introduce Design District, Showplace Square, and Potrero Hill for design/creative businesses, but those districts lack AccessFit profiles and therefore cannot be silently composed with Access. The resolver trace exposes them; the composed shortlist does not pretend their Access component is known.

### Proposed Business Identity Representation

The smallest scalable representation is a bounded business type mapped to one or more environment characteristics:

| Business identity | Current private mapping |
| --- | --- |
| Architecture / design | `CREATIVE_DESIGN_ORIENTED` |
| Accounting / professional services | `ESTABLISHED_PROFESSIONAL` |
| Technology / product | `TECHNOLOGY_INNOVATION` |
| Life science / healthcare | `INSTITUTIONAL_HEALTHCARE` |
| Nonprofit / mission-driven | `MISSION_COMMUNITY_ORIENTED` |

This is not a NAICS recommendation model. It is a small interpretive layer over existing reviewed business-type effects. A future identity can map to multiple characteristics without creating industry-specific district rules.

### Architecture Firm Requirement

San Francisco Office; ordinary use; 35 peak attendance; San Francisco employee origin; rare clients; HELPFUL transit; HELPFUL parking; no candidate districts; company context states `Architecture / design firm`. Access and Office inputs are identical to the accounting case.

### Architecture Firm Result

The SF Office resolver universe is Showplace Square, Design District, Potrero Hill, SoMa, Jackson Square, Mission District, Financial District, Mission Bay, and South Beach. The bounded Access-composable universe is Financial District, SoMa, Mission Bay, Jackson Square, South Beach, Mission District, and Presidio.

Business Environment is STRONG for SoMa and Jackson Square; GOOD for Financial District, Mission Bay, South Beach, Mission District, and Presidio. Access is identical to the accounting case. The composed shortlist is SoMa, Jackson Square, Financial District. The third result is a stable tie-break among otherwise STRONG_FIT starting districts, not a claim that Financial District is bad for an architecture firm.

### Accounting Firm Requirement

Identical to the architecture requirement except company context states `Accounting firm / traditional professional services`.

### Accounting Firm Result

The SF Office resolver universe is Financial District, Jackson Square, South Beach, SoMa, and Mission Bay. The Access-composable universe is unchanged. Business Environment is STRONG for Financial District, Jackson Square, and South Beach; GOOD for SoMa, Mission Bay, and Presidio; MODERATE for Mission District. The composed shortlist is Financial District, Jackson Square, South Beach.

### Controlled Comparison

| District | Access (both) | Office (both) | Architecture environment | Accounting environment |
| --- | --- | --- | --- | --- |
| Financial District | STRONG | STRONG | GOOD | STRONG |
| SoMa | STRONG | STRONG | STRONG | GOOD |
| Mission Bay | STRONG | STRONG | GOOD | GOOD |
| Jackson Square | STRONG | STRONG | STRONG | STRONG |
| South Beach | STRONG | STRONG | GOOD | STRONG |
| Mission District | STRONG | GOOD | GOOD | MODERATE |
| Presidio | GOOD | GOOD | GOOD | GOOD |

Only the user-stated company context changes. Access and Office signatures are deterministic and identical. The shortlist changes without changing weights: architecture yields SoMa / Jackson Square / Financial District; accounting yields Financial District / Jackson Square / South Beach.

### Did Business Type Matter?

Yes, within the evidence-backed universe. It changes Business Environment reasoning and the shortlist order/membership. It is still a prior, not a sufficiently reliable preference on its own. The architecture result also demonstrates an evidence-coverage limit: the strongest design-specific resolver candidates cannot yet enter full composition without Access profiles.

### Is One Conditional Environment Question Needed?

Yes. Business identity is useful enough to set a prior, but too broad to silently establish a consequential company preference. Ask one confirmation only when a supported identity creates materially different environment alternatives and no explicit environment preference or trusted company profile is available.

### Proposed Question

`Which kind of setting sounds more like your company?`

- Established and professional
- Creative and design-oriented
- Modern and energetic
- No strong preference

These map to existing reviewed `traditional_professional`, `creative_informal`, and `modern_polished` concepts. `No strong preference` adds no environment-preference effect. For a known company type, the UI may contextualize the same choice, but should not force an industry-specific answer.

### Interview Impact

No new mandatory interview step was added. The private adapter can recover a bounded business identity from existing user-stated company context, Business Profile context, or a future trusted enrichment. Ask `What does your company do?` only when identity is unknown and Business Environment can materially affect the current market/property recommendation. Ask the one environment confirmation only when the prior is ambiguous and consequential.

### Growth / Expansion Recommendation

Classification: **C — conditional by property/business type**, but for ordinary SF Office it is mostly Property Requirement intelligence. Existing district attributes and the SF Office resolver can use meaningful growth, yet the current controlled Location case does not require it to distinguish Access or business environment. Keep growth after Location readiness unless a growth pattern is exceptional enough to change the district universe (for example, known rapid expansion or campus need).

### Basic Scale Recommendation

Peak attendance is not materially used by the current district resolver; it is preserved as `regularOccupancy` with no ranking effect. For ordinary Office, it should eventually move toward Property Requirement enrichment or become conditional on a scale threshold. Do not remove it yet: readiness currently uses it as general scale evidence and a separate interview/readiness change was outside this sprint.

### Location Brief Future Boundary

The intended future sequence remains: Location Requirement → Location Intelligence recommendation → user exploration/comparison → recommendation becomes part of an evolving Location Brief → Property Requirement enrichment → actual market/property search → broker handoff if requested. This sprint does not integrate the private composition with the production Location Brief.

### QA / Validation

`scripts/qa-private-business-environment-calibration.js` verifies the identity schema, controlled pair, identical Access and Office inputs, environment-only differences, model/evidence trace sources, absence of identity-to-district hard-coding, adaptive question applicability, neutral-answer behavior, and the Access-universe boundary. `npm run qa:requirement-prototype` passes the complete private prototype suite.

### Production Changes

None.

## Product Findings

1. The Marin result was caused by a private composition and comparison-display bug. The underlying Marin evidence was present.
2. After correction, Presidio receives appropriate generic consideration and reaches the shortlist without hard-coding.
3. Current Business Environment intelligence can distinguish the controlled architecture and accounting firms inside the bounded composed universe, while correctly exposing missing Access coverage for design-specific candidates.
4. Minimum additional input: bounded business identity from existing company context when available, plus one conditional plain-language environment confirmation when the prior is consequential and ambiguous.
5. Growth should not be a universal blocker before Location readiness; ask it conditionally or during Property Requirement enrichment.
6. Peak attendance should remain temporarily because readiness depends on scale evidence, but current district intelligence does not justify it as a universal initial Location question.
7. Next product test: add reviewed AccessFit profiles—not new business claims—for the already-supported design/creative candidate set, then rerun the same controlled pair and test whether the architecture shortlist can defensibly include Design District or Showplace Square while accounting remains distinct.

## Final Question

Yes, with a bounded qualification. Rofo can now distinguish **how** material employee cohorts need to access a location and **what kind** of business environment the company may fit, without materially lengthening the interview. Business identity can come from existing company context, and only one adaptive confirmation is needed when the business-type prior is genuinely ambiguous. Coverage must remain explicit: districts without AccessFit evidence cannot be presented as fully composed recommendations.
