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
