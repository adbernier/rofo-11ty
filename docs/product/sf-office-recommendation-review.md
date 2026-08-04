# San Francisco Office Recommendation Review Harness

This document defines the internal product-review harness for the isolated San Francisco Office Recommendation Explorer model.

The harness is editorial and product-review infrastructure only. It does not change the production Business Profile, production recommendation page, broker handoff, or recommendation ranking behavior.

## Purpose

The review harness evaluates whether the current `san-francisco:office` model can produce credible, explainable San Francisco office shortlists across realistic business situations before Rofo adds new Business Profile questions or builds an interactive production Recommendation Explorer.

The reviewed flow is:

```text
Business Profile / Search Profile-shaped answers
-> lib/recommendations/normalize-sf-office-profile.js
-> lib/recommendations/sf-office-recommendation-resolver.js
-> internal review output
```

## Internal Route

Review page:

`/prototype/recommendation-explorer/sf-office-review/`

The page is excluded from collections and marked `noindex,nofollow`.

The existing smaller prototype remains available at:

`/prototype/recommendation-explorer/sf-office/`

## Source Files

- `_data/sfOfficeRecommendationModel.js` owns the structured editorial model.
- `lib/recommendations/normalize-sf-office-profile.js` maps source answers into resolver input.
- `lib/recommendations/sf-office-recommendation-resolver.js` evaluates the normalized profile.
- `_data/sfOfficeRecommendationReviewProfiles.js` owns the review profile set, sensitivity variations, and preliminary question-value analysis.
- `pages/prototype/recommendation-explorer/sf-office-review.njk` renders the internal review surface.
- `scripts/qa-sf-office-recommendation-review.js` validates review-harness integrity.

## Review Profiles

The review set contains 12 realistic San Francisco office-search profiles:

1. Traditional professional-services firm with frequent client meetings.
2. Early-stage technology company prioritizing recruiting and growth.
3. Established technology company with hybrid attendance.
4. Financial or investment firm seeking credibility and convenience.
5. Design, architecture, or creative firm preferring distinctive lower-rise space.
6. Life-sciences-adjacent or healthcare company with institutional proximity needs.
7. Marin-oriented company balancing employee commute and parking.
8. East Bay-oriented company prioritizing BART-oriented access at a broad level.
9. Peninsula or South Bay-oriented company with broad Caltrain-oriented considerations.
10. Small founder-led company with limited information and weak differentiation.
11. Company with conflicting client-access and creative-environment priorities.
12. Company using strong budget, value, rent, or cost language that must not affect district ranking.

Each profile includes source answers, important facts, constraints, priorities, intentionally missing information, expected editorial considerations, normalized output, resolver output, reviewer prompts, and blank judgment fields.

## Sensitivity Checks

The harness includes five one-answer variations:

- Client visit frequency: often versus rarely.
- Commute orientation: Marin versus East Bay.
- Office environment: modern and polished versus creative and informal.
- Parking priority: absent versus high.
- Jackson Square location intent: nearby comparison versus hard focus.

Each comparison reports whether the single-answer change affects candidate set, ordering, shortlist, explanations, unresolved tradeoffs, confidence, or next question.

## Reviewer Evaluation

For every profile, reviewers should assess:

- whether the starting candidate set is correct
- whether the shortlist is directionally correct
- whether an important district is missing
- whether an included district is difficult to defend
- whether ordering is justified
- whether explanations are specific enough
- whether confidence matches the available evidence
- whether unresolved tradeoffs are the right ones
- whether the next question is the highest-value question
- whether answering the next question would plausibly change the shortlist
- which missing input would be most useful
- which collected input appears to have little value
- overall result: approve, revise, or reject

The goal is to record model weaknesses explicitly rather than patching around them prematurely.

## Question-Value Analysis

The harness groups potential profile questions into:

- Likely High Value: questions that repeatedly change candidate entry, shortlist membership, ordering, explanation quality, or confidence.
- Possibly Useful: questions that improve context or explanation but less often change the result.
- Low or Unproven Value: questions that do not currently affect district behavior, duplicate stronger signals, create false precision, or add burden without clear recommendation value.

This analysis should inform a later Business Profile question sprint. It should not be treated as a production questionnaire specification until human review is complete.

## Economic Language

Budget, rent, cost, value, concessions, availability, landlord motivation, and current market economics remain excluded from San Francisco Office district ranking.

The normalizer preserves economic language as broker context. The resolver reports it as ignored economics with no ranking effect.

This review harness includes a profile that uses strong budget and rent language specifically to confirm that economics do not move the shortlist.

## Known Review Boundaries

- Commute orientation remains broad; the model does not make precise BART, ferry, or Caltrain route claims.
- Nearby and adjacent relationships remain coarse and should be reviewed as directional editorial relationships.
- The current Business Profile does not yet collect every signal shown in the review profiles.
- The harness uses static source-answer samples and does not connect to live user storage.
- Reviewer judgment should identify where the model is weak instead of forcing every profile to appear successful.

## QA

Run:

```bash
node scripts/qa-sf-office-recommendation-model.js
node scripts/qa-sf-office-recommendation-explorer.js
node scripts/qa-sf-office-recommendation-review.js
```

The review QA verifies:

- every review profile normalizes successfully
- every profile resolves successfully
- required review fields are present
- profile IDs are unique and stable
- economic language never affects ranking
- insufficient-evidence profiles do not receive unjustified ordering
- controlled variations change only through their intended source answer
- default and signal-specific districts receive credible review exposure

## Recommended Review Session Format

Use the internal review route in a 60-90 minute product/editorial session.

Review the profiles in order, then review the sensitivity checks. For each profile, record whether the result should be approved, revised, or rejected. Capture recurring issues in three categories:

- model/data issue
- missing or low-value question issue
- explanation or confidence issue

Only after that review should Rofo decide which Business Profile questions to add and which model fields need structured editorial refinement.
