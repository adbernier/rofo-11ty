# Jackson Square Recommendation Investigation

Date: 2026-08-06

Scope: investigation only. No production recommendation behavior was changed.

## Scenario

Observed scenario:

- Market: San Francisco
- Space type: Office
- Business type: Technology / product
- Primary office use: Team collaboration, Recruiting
- Recruiting importance: high
- Growth expectations: stable team
- Office environment: Historic and distinctive

Expectation: Jackson Square should become more competitive because the user prefers a creative or historic environment.

Observed result: SoMa, South Beach, Mission Bay, and Financial District remain ahead of Jackson Square.

## Normalized Profile

The current Business Profile-shaped source answers normalize to the San Francisco Office resolver profile as:

```json
{
  "city": "San Francisco",
  "spaceType": "Office",
  "expectedGrowth": "low",
  "recruitingImportance": "high",
  "businessType": "technology",
  "officeEnvironment": "historic_distinctive",
  "operationalUse": [
    "team_collaboration",
    "recruiting"
  ]
}
```

Unsupported answers: none.

Ignored economics: none.

## Resolver Output

Current state:

- State: refined shortlist
- Confidence: "Rofo can defend a smaller shortlist because multiple user signals point toward the same district attributes."
- Shortlist: SoMa, South Beach, Mission Bay, Financial District
- Secondary alternatives: Jackson Square, Showplace Square, Dogpatch, Design District, Potrero Hill, Mission District
- Exclusions: none
- Unresolved tradeoffs: employee commute orientation, client visit frequency
- Next question: "How often will clients or partners visit the office?"

District weights:

| District | Score | Movement | Main triggered signals |
| --- | ---: | --- | --- |
| SoMa | 15 | rose | recruiting priority, historic/distinctive environment, technology business type, recruiting via team collaboration, recruiting via recruiting use |
| South Beach | 12 | rose | recruiting priority, technology business type, recruiting via team collaboration, recruiting via recruiting use |
| Mission Bay | 10 | rose | recruiting priority, technology business type, recruiting via team collaboration, recruiting via recruiting use, minus historic/distinctive environment |
| Financial District | 9 | rose | recruiting priority, recruiting via team collaboration, recruiting via recruiting use |
| Showplace Square | 5 | entered | technology business type |
| Dogpatch | 5 | entered | technology business type |
| Jackson Square | 3 | rose | historic/distinctive environment |

## Triggered Rules

Repository source: `_data/sfOfficeRecommendationModel.js`

- `officeEnvironmentTaxonomy.historic_distinctive` raises Jackson Square and SoMa, and lowers Mission Bay.
- `businessTypeEffects.technology` raises SoMa, Mission Bay, South Beach, Showplace Square, and Dogpatch. It enters Showplace Square and Dogpatch.
- `priorities.recruiting` raises SoMa, Mission Bay, South Beach, and Financial District.
- `operationalUseEffects.team_collaboration` aliases to `recruiting`.
- `operationalUseEffects.recruiting` also aliases to `recruiting`.

## Suppressed or Missing Rules

The following signals that would likely help Jackson Square were not present:

- `clientVisitFrequency: high`, which raises Financial District, Jackson Square, South Beach, and SoMa.
- `businessType: professional_services`, which raises Financial District, Jackson Square, and South Beach.
- `businessType: design_creative`, which raises Design District, Showplace Square, SoMa, Jackson Square, and Potrero Hill.
- `officeEnvironment: lower_rise_neighborhood`, which raises Jackson Square, Potrero Hill, Dogpatch, Design District, and Mission District.
- `operationalUse: quiet_focused_work`, which raises Jackson Square and Potrero Hill.
- Marin commute orientation, which raises Financial District, Jackson Square, and South Beach.

The scenario used `businessType: technology`, which does not currently raise Jackson Square even though Jackson Square has high stable attributes for `talentAccess`, `creativeCharacter`, `walkability`, `clientAccessibility`, and `lowerRiseCharacter`.

## Finding

The recommendation is mechanically consistent with the current resolver, but the result is directionally questionable for the stated product expectation.

Jackson Square entered the analysis as a default initial district and rose from the historic/distinctive environment signal. It did not remain in the shortlist because the model gives repeated recruiting lift to SoMa, Mission Bay, South Beach, and Financial District:

1. Explicit `recruitingImportance: high` applies the recruiting priority.
2. `operationalUse: team_collaboration` aliases to the same recruiting priority.
3. `operationalUse: recruiting` aliases to the same recruiting priority again.

That repeated priority application creates a strong advantage for districts in `priorities.recruiting.riseHigh` and overwhelms the single Jackson Square historic/distinctive signal.

Mission Bay still remains in the shortlist despite being penalized by the historic/distinctive preference because it receives technology and recruiting lifts multiple times.

## Should Jackson Square Have Entered?

Yes, Jackson Square should be at least more competitive for this profile.

The current model already recognizes Jackson Square as:

- default initial for San Francisco Office
- high creative character
- high lower-rise character
- high client accessibility
- high walkability
- high talent access
- historic/distinctive environment fit

However, the approved launch model does not currently treat "technology/product plus historic or creative office preference" as enough to elevate Jackson Square beyond secondary status.

## Recommended Future Model Change

Do not change production behavior in this sprint.

For a future recommendation-model sprint, evaluate one or both of these narrow changes:

1. Deduplicate priority aliases so the same priority cannot be applied multiple times from `recruitingImportance`, `team_collaboration`, and `recruiting`.
2. Add a narrow cross-signal rule: when `businessType: technology` combines with `officeEnvironment: historic_distinctive`, Jackson Square should receive an additional stable environment/ecosystem lift, likely as a secondary or near-tie candidate rather than an automatic top fit.

## Estimated Downstream Impact

Deduplicating priority aliases would reduce repeated recruiting inflation in technology profiles. Likely impact:

- SoMa and Mission Bay remain strong for technology and recruiting.
- Financial District may fall in technology profiles where its only lift is repeated recruiting.
- Jackson Square, Showplace Square, and Dogpatch may become more competitive when environment signals point away from modern-growth defaults.
- Recommendation explanations become cleaner because repeated "Recruiting and employee attraction" reasons would not appear multiple times.

Adding a narrow technology + historic/distinctive Jackson Square lift would:

- Improve alignment for boutique technology/product companies seeking a distinctive office.
- Keep Jackson Square from rising for generic technology searches without the environment signal.
- Require QA for client-facing, professional services, law, and creative profiles to avoid unintended overpromotion.

## Conclusion

The current output is explainable but not ideal. Jackson Square should become more competitive when a technology/product user selects a historic or distinctive office environment, especially when growth is stable rather than significant.

The highest-leverage future fix is deduplicating repeated priority effects before changing district-specific weights. That would improve explanation quality and reduce overconfidence without expanding the model.

## Calibration Implemented

Date: 2026-08-06

Files:

- `_data/sfOfficeRecommendationModel.js`
- `lib/recommendations/sf-office-recommendation-resolver.js`
- `scripts/qa-sf-office-recommendation-calibration.js`

The calibration implemented the first recommendation from this investigation and added one narrow editorial rule for the later production observation.

### Root cause confirmed

The resolver allowed priority aliases to add repeated effective votes for the same semantic intent. For example:

- `recruitingImportance: high` applied `priority:recruiting`.
- `operationalUse: team_collaboration` also aliased to `priority:recruiting`.
- `operationalUse: recruiting` also aliased to `priority:recruiting`.

This could give SoMa, Mission Bay, South Beach, and Financial District multiple recruiting contributions from one underlying business preference.

### Deduplication policy

The resolver now applies one scoring contribution per semantic priority family.

Operational-use aliases may trigger a priority when no explicit priority has already supplied it, but they do not add multiple effective votes for the same underlying intent.

The model documents these semantic families:

- `priority:recruiting`: `recruitingImportance`, `operationalUse:team_collaboration`, `operationalUse:recruiting`
- `priority:client_access`: `clientVisitFrequency`, `operationalUse:client_meetings`
- `priority:growth_flexibility`: `expectedGrowth`
- `priority:regional_transit`: `transitImportance`, `features:Transit access`
- `priority:parking`: `parkingImportance`, `features:Parking`
- `priority:walkability_amenities`: `walkabilityAmenitiesImportance`

The resolver returns `signalAudit`, including deduplicated semantic contributions, so QA and product review can verify when a source answer was preserved but did not add another score.

### Production observation calibration

The later production observation used a different profile from the original technology example:

- Business type: Design / Creative
- Primary office use: Team collaboration
- Additional use/context: Client-facing
- Office environment: Historic and distinctive
- Growth: Stable team

For that profile, Jackson Square is supported by multiple stable district attributes:

- historic/distinctive character
- boutique professional environment
- client-facing suitability
- creative-office compatibility
- lower-rise character

After deduplication, a narrow cross-signal rule was added:

`design_creative_historic_client_facing`

This rule applies only when design/creative business type, client-facing use, historic/distinctive environment, and stable/no-growth context combine. It raises Jackson Square for the combination. It does not force Jackson Square for every historic/distinctive profile.

### Before / after behavior

After calibration, the production-observation profile resolves to:

- Jackson Square: 14
- SoMa: 12
- Financial District: 6
- South Beach: 6
- Mission Bay: 1

Shortlist:

- Jackson Square
- SoMa

Mission Bay no longer leads this profile without a stronger modern, growth, commute, life-science, or larger-team signal.

### Regression coverage

`scripts/qa-sf-office-recommendation-calibration.js` now fails if:

- Jackson Square is excluded from the production-observation top set.
- repeated recruiting/collaboration aliases add multiple scoring reasons.
- Mission Bay is weakened in technology, modern, growth, or Peninsula-oriented scenarios.
- environment preferences change only explanation text and not recommendation behavior.
- economics affect ranking.

### Remaining limitation

The original technology/product + historic/distinctive profile remains a separate editorial question. Deduplication makes that case less inflated, but the current explicit Jackson Square calibration is intentionally limited to the design/creative, client-facing, historic/stable production observation.

## Production Integration Implemented

Date: 2026-08-06

The production `/recommendations/` Location Brief now routes `san-francisco:office` Business Profiles through the same structured normalizer and resolver used by QA:

- `lib/recommendations/normalize-sf-office-profile.js`
- `lib/recommendations/sf-office-recommendation-resolver.js`
- `_data/sfOfficeRecommendationModel.js`

The legacy recommendation graph remains the fallback for unsupported market/property-type combinations.

The production defect profile now resolves to Jackson Square and SoMa as the visible structured Best Fits. Mission Bay no longer leads without an independent modern, growth, commute, or institutional signal.

The end-of-Brief validation prompts were also removed from the production page. The customer now moves from the recommendation into a concise current-availability request tied to the selected Best Fit district.
