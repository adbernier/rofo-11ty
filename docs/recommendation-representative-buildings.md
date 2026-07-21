# Recommendation Representative Buildings

Representative buildings make Rofo recommendations more concrete. They are evidence for a district recommendation, not live property matches, listings, or availability results.

The recommendation journey remains district-first:

Business Profile -> Location Recommendations -> Recommended District Detail -> Representative Buildings -> Live Market Investigation -> Shortlist -> Tours

## Purpose

The recommendation page should help a user understand:

- why a district was recommended
- what kinds of commercial buildings explain that recommendation
- which building environments are worth comparing
- what Rofo can investigate next before a real shortlist or tour plan exists

Representative buildings should never replace the location recommendation. They should make the district easier to understand.

## Phase 1 Architecture

Phase 1 uses a static, build-time data payload:

- `_data/recommendationRepresentativeBuildings.js` builds eligible building cards from existing repository data.
- `js/recommendation-representative-buildings.js` resolves cards for a recommended district in both browser and Node QA contexts.
- `pages/recommendations.njk` embeds the generated JSON payload and provides the module shell.
- `js/recommendation-context.js` renders the correct district module after resolving the current Location Brief recommendation.

The resolver does not change Compass scoring, recommendation ranking, Location Brief persistence, lead routing, or broker workflows.

## Data Sources

Representative-building cards are derived from:

- `buildingPages`
- `commercialBuildingIntelligence`
- production `building_brief` records
- canonical building paths
- canonical district and secondary district relationships

Commercial Building Intelligence controls district identity when explicitly present. This matches the Building Brief source-precedence rule.

## Eligibility Rules

A building can appear in recommendations only when it:

- resolves to a canonical building record
- has a valid internal building URL
- has a production `building_brief`
- belongs to the recommended district or is explicitly attached as a secondary district in Commercial Building Intelligence
- has a specific representative reason
- has a specific best-fit summary
- has a specific primary tradeoff

Thin legacy representative pages are intentionally excluded.

## Selection Rule

The recommendation page shows a maximum of three representative buildings per district.

Selection is deterministic:

1. Use Commercial Building Intelligence editorial order.
2. Filter to production Building Brief records.
3. Include primary district associations first through the district group.
4. Include explicit secondary district associations when authored.
5. Cap at three cards.

Phase 1 does not rank buildings by user profile. Profile-aware ranking belongs to Phase 2.

## Maturity Behavior

Mature district:

- three eligible Building Briefs
- render three cards

Supported but thinner district:

- exactly two eligible Building Briefs
- render two cards

Insufficient district:

- fewer than two eligible Building Briefs
- omit the module cleanly
- do not show placeholders or coming-soon language

The Live Market Investigation transition remains available through the recommendation flow even when representative buildings are omitted.

## Recommendation Page Placement

Representative buildings appear inside the primary recommended district detail after:

- why the district was recommended
- the principal fit
- tradeoffs
- recommendation explainability

They appear before the Live Market Investigation transition inside the same district detail area.

Secondary districts do not receive expanded building modules in Phase 1. They continue to appear through the existing comparison path and district links.

## Card Standard

Each card should show:

- building name
- address
- building type or district context
- why it matters
- best for
- tradeoff
- `View Building Brief`

Do not use:

- View Listing
- See Availability
- Contact Broker
- Request Tour
- availability, rent, vacancy, or listing language

## Disclosure

Every rendered module must include:

> These buildings are representative examples, not current availability. They help explain the kinds of commercial environments businesses commonly evaluate in this district.

This distinction is required.

## Live Market Investigation CTA

Phase 1 routes `Start Live Market Investigation` into the existing Location Brief expert-review form on the recommendations page:

`#location-brief-contact`

The CTA preserves the current recommendation context in the local Location Brief state where supported:

- recommended city
- recommended district
- district slug and path
- representative building IDs, names, and URLs shown
- source: `recommendation_representative_buildings`
- intent: `live_market_investigation`

The panel explains that a future investigation can include:

- current availability
- future availability
- comparable buildings
- recent leasing activity
- market insight
- broker guidance when available

It also states that availability and broker support depend on market coverage and current requirements.

## Analytics

Phase 1 adds lightweight events through the existing search-profile analytics endpoint:

- `representative_buildings_viewed`
- `representative_building_clicked`
- `district_guide_clicked_from_recommendation`
- `live_market_investigation_cta_viewed`
- `live_market_investigation_cta_clicked`
- `live_market_investigation_started`
- `live_market_investigation_building_toggled`
- `live_market_investigation_scope_selected`
- `live_market_investigation_submitted`
- `live_market_investigation_submission_failed`

Event context is limited to recommendation-safe fields such as city, district, building ID, building name, recommendation rank, card position, and CTA source.

## QA

Run:

```bash
node scripts/qa-recommendation-representative-buildings.js
```

The QA script checks:

- module shown or omitted by district
- selected building names and canonical URLs
- Building Brief status
- duplicate buildings
- missing required card fields
- malformed links
- district mismatches
- repeated reasons and tradeoffs
- Live Market Investigation CTA presence
- district guide link presence
- generated-page disclosure and CTA shell

Hard failures include broken Building Brief links, more than three cards, rendering with fewer than two cards, invalid district association, empty required fields, dead investigation CTA, and missing disclosure language.

## Future Phase 2

Profile-aware ranking should eventually select among eligible buildings based on:

- business type
- team size
- commute priorities
- client-facing needs
- growth or expansion needs
- parking sensitivity
- building character preferences
- relevant validation questions

The result should still remain representative, not availability-driven.

## Live Market Investigation Intake v1

The Live Market Investigation CTA now opens a dedicated investigation state inside the existing Location Brief follow-up form. This avoids creating a parallel lead system while making the continuation feel specific to the recommendation journey.

The intake preserves:

- existing Location Brief browser state
- Search Profile location, space type, size, and timing when available
- recommended city and district
- representative building IDs, names, and URLs shown in the recommendation module
- CTA source
- recommendation source

The intake asks only for investigation-specific decisions:

- which representative buildings should be included as reference points
- whether to include other competitive buildings
- whether Rofo should look at current availability, future availability, comparable buildings, leasing activity, market insight, or broker guidance
- timing confirmation when needed
- broker-guidance preference
- optional investigation notes

Default selections:

- all shown representative buildings selected
- competitive buildings enabled
- current availability, future availability, and comparable buildings selected
- broker preference set to `research_first`

Representative-building selections never imply current availability. The intake repeats that these buildings are representative examples, not confirmed available spaces.

## Persistence

The submitted payload remains a Location Brief payload and adds a structured `liveMarketInvestigation` object. The Location Brief API canonicalizes and sanitizes that object before storage.

Investigation submissions create a lead dashboard record with:

- `lead_type: live_market_investigation`
- `status: market_investigation_requested`
- selected district
- selected representative buildings
- competitive-building flag
- investigation scope
- timing
- broker preference
- investigation notes
- full Location Brief payload

The public Location Brief URL is preserved. The public brief displays the investigation section when one was submitted.

## Reliability And Idempotency

Live Market Investigation submissions use a stable client submission token plus a server-side request fingerprint. The server reserves an idempotency record before creating the Location Brief, lead, or emails.

The fingerprint includes the investigation source, district, selected representative buildings, competitive-building setting, requested research scope, timing, broker preference, relevant confirmed requirements, notes, and contact email. It does not rely on timestamps alone.

Duplicate behavior:

- a repeated POST with the same token and same fingerprint returns the original successful Location Brief response when available
- the duplicate does not create another Location Brief
- the duplicate does not create another lead
- the duplicate does not resend the internal notification
- the duplicate does not resend the user confirmation email
- if the original request is still processing, the API returns a handled `processing` response with the reserved public Location Brief URL

Revised-request behavior:

- changing meaningful investigation fields creates a different fingerprint
- district, selected buildings, investigation scope, timing, broker preference, confirmed requirements, notes, or contact email changes are treated as a materially revised request
- a revised request may create a new Location Brief-family lead because it represents a new investigation ask

The public success state should not show raw idempotency tokens or duplicate-submission language. It should show the same received state for a first submission or a handled duplicate retry.

## Admin And Email

The Lead Dashboard treats Live Market Investigation records as Location Brief-family leads. Operators see a readable investigation block with city, district, buildings, scope, timing, broker preference, and notes.

The internal Location Brief notification email includes the same investigation context. Successful Live Market Investigation submissions also attempt a concise user confirmation email after persistence succeeds. The confirmation email includes the district, selected representative buildings, competitive-building setting, requested scope, timing, broker preference, and permanent Location Brief link.

Confirmation email behavior:

- sent only after successful Location Brief persistence
- not resent for duplicate retries
- not required for the investigation request to succeed
- recorded as `sent`, `not_sent`, or `failed`
- missing email is recorded as `not_sent`
- provider failure is recorded as `failed` while the submitted request remains successful

The admin view shows a compact operational block with the request ID, confirmation-email status, internal-email status, and idempotency state. User-facing copy must not promise guaranteed response times, complete availability coverage, or accepted broker support.

Investigation status currently distinguishes the submitted request state from future research workflow states:

- `requested`: client-side form state before persistence
- `received`: server accepted and persisted the investigation request
- future workflow states such as reviewing, coverage confirmed, research in progress, completed, or unable to support should be introduced only when operational tooling exists

## Future Phase 3

The next step is a shortlist workspace that can turn an investigation request into:

- researched availability candidates
- comparable buildings
- broker notes
- user-visible shortlist items
- tour planning status

Phase 3 should still avoid implying that availability research begins before an explicit submitted request.
