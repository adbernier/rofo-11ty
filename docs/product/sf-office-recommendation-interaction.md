# San Francisco Office Business Profile Workspace

This document describes the isolated Business Profile Workspace prototype for the San Francisco Office recommendation model.

The prototype is not production integration. It does not replace the production Business Profile, `/recommendations/`, Location Brief generation, broker handoff, recommendation routing, normalization layer, or resolver. It changes only the interaction model used by the internal prototype.

## Route

Internal route:

`/prototype/recommendation-explorer/sf-office-interactive/`

The route is excluded from collections and marked `noindex,nofollow`.

## Product Model

The workspace treats four surfaces as views of the same recommendation:

- Business Profile: who are we?
- Best Fits: where should we begin?
- District Detail: why this district?
- Location Brief: help me make a decision.

The recommendation engine remains largely invisible. User-facing language avoids resolver state, candidate sets, movements, scores, and question metadata.

## Workspace Structure

The page has two primary panels.

### Business Profile

The left panel is an editable profile, not a questionnaire or wizard. Users can edit selections in any order, remove selections, load scenarios, or restart.

Current profile sections:

- Market
- Space Type
- Business Type
- Office Environment
- Primary Office Use
- Employee Commute Orientation
- Growth Expectations
- Institutional Proximity, only for healthcare or life-sciences-adjacent profiles

The workspace intentionally avoids making square footage, budget, rent, timing, lease term, concessions, or availability prominent. Those are later workflow or broker-review topics.

Primary Office Use supports multiple selections because business use is often a combination. Office Environment remains a single primary preference in this prototype because the current resolver supports one environment signal.

### Best Fits

The right panel presents Best Fit cards once the profile has enough signal.

Cards include only:

- district
- confidence label
- one editorial summary sentence
- up to three concise reasons

Cards do not show ranking numbers, resolver state, candidate set, `entered`, `rose`, scores, ignored economics, or next-question metadata. Those remain in internal debug.

### District Detail

Selecting a Best Fit opens a concise exploratory detail view. It is not the Location Brief.

District detail includes:

- office character
- commercial ecosystem
- nearby exploration

The full Location Brief remains the richer decision artifact.

## Create My Location Brief

A persistent action remains visible below the workspace:

`Create My Location Brief`

Before the profile has enough signal, it is disabled with a short explanation. Once Best Fits are available, it is enabled.

Clicking it creates a local prototype snapshot that:

- preselects the currently selected Best Fit, defaulting to the highest-confidence visible district
- states `Based on the Business Profile below`
- summarizes the current profile
- shows why the selected district is the current place to begin

The snapshot is not production Location Brief generation. Editing the profile allows the brief to be recreated from the current recommendation.

## Recommendation Stability

The prototype avoids making every edit feel like a dramatic algorithmic reshuffle.

If the Best Fits change, the UI says that the updated Business Profile shifted which district attributes matter most. If the Best Fits stay stable but explanations improve, the UI says Rofo has a clearer reason for them.

The goal is confidence and exploration, not constant visible movement.

## Interaction Policy

Interaction policy lives in:

`lib/recommendations/sf-office-recommendation-interaction-policy.js`

The policy owns:

- workspace section definitions
- conditional profile sections
- scenario definitions
- recommendation reveal threshold
- deterministic answer keys for the precomputed bridge

The policy does not score districts and does not change shortlist logic.

## Resolver Bridge

The browser prototype does not reimplement recommendation scoring.

Eleventy precomputes a finite static bridge in:

`_data/sfOfficeRecommendationInteractivePrototype.js`

Each precomputed state is produced by:

```text
source answers
-> normalize-sf-office-profile.js
-> sf-office-recommendation-resolver.js
-> compact workspace result
```

The browser script selects matching precomputed results by deterministic answer key.

The bridge is intentionally curated for prototype review. It is not a production architecture. If a reviewer creates a combination outside the bridge, the page fails visibly and asks the reviewer to reset or load a scenario.

## Internal Debug

The page includes a collapsible internal debug section containing:

- source answers
- normalized profile
- resolver state
- candidate set
- ignored economics
- unresolved tradeoffs
- confidence metadata
- question metadata

Debug exists for editorial review only and should not dominate the experience.

## Scenario Testing

The prototype supports:

- blank profile
- client-facing professional-services firm
- technology growth company
- Marin-oriented company
- East Bay-oriented company
- Peninsula-oriented company
- budget-context-only profile

The budget scenario confirms that economic language can be visible as broker context while remaining excluded from ranking and recommendation reveal behavior.

## Known Limitations

- The prototype uses a finite precomputed bridge rather than live resolver execution in the browser.
- It supports San Francisco office only.
- Commute orientation remains broad and should not be interpreted as precise route guidance.
- Nearby, adjacent, substitute, and comparison relationships remain coarse.
- The current production Business Profile does not yet collect all high-value model signals.
- Office Environment remains one primary resolver signal even though users may describe a mixed environment in real life.
- Some model outputs may still feel overconfident when broad signals produce a refined state; this should be reviewed rather than patched inside the UX prototype.
- CSS is scoped to the prototype page and should not be treated as production design-system work.

## QA

Run:

```bash
node scripts/qa-sf-office-recommendation-interaction.js
```

The QA verifies:

- recommendation does not appear immediately
- recommendation reveals after sufficient meaningful signal
- reveal logic does not depend on budget, rent, cost, or timing
- workspace sections are present
- Primary Office Use supports multiple selections
- institutional proximity remains conditional
- insufficient evidence does not produce unjustified ordering
- stable answers do not force artificial movement
- commute and environment changes can alter the result
- ignored economics remain context only

## Production Boundary

Before production integration, Rofo should complete a human review of:

- whether editing the profile feels more natural than answering questions
- whether Best Fit cards are scannable and defensible
- whether district detail feels exploratory rather than report-like
- whether `Create My Location Brief` feels like the natural next step
- whether confidence language feels calibrated
- whether the finite bridge exposes gaps that require resolver or data work

Only after that review should this pattern inform production Business Profile or Recommendation Explorer work.
