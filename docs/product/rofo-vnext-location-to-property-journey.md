# Rofo vNext Location-to-Property Journey

## Implemented boundary

The SF Office vNext journey now continues through one durable workspace:

`Location Requirement → Location Brief → Property Requirement draft`

The Location Brief remains the bridge. It projects the current canonical Location Requirement, the current revision-bound recommendation snapshot, and the locations worth investigating. Beginning the property stage does not create another Brief or translate the Requirement into the legacy Business Profile schema.

## Location Requirement ownership

The immutable `RequirementRevision` remains canonical for facts used to understand where the business should look: market, property context, business identity, employee and client geography, access priorities, environment preference, operating exceptions, and candidate geography context.

The current `RecommendationSnapshot` remains derived from one explicit Location Requirement revision. Location focus switching is client-side presentation state only. It does not change the Requirement, candidate disposition, scores, readiness, or snapshot.

## Location Brief role

The Brief presents supported locations as an investigation set rather than a tenant-facing ranking. Internal deterministic ordering still selects the initial focus and remains available in diagnostics. In an ordinary FULL or BOUNDED search, supported locations receive peer selectors and one shared rich focus panel. An explicit candidate remains separately identified as an area already on the user's list.

The rich focus reuses canonical district presentation, approved imagery, representative-building projection, supported strengths and tradeoffs, and canonical district routes. Representative buildings are examples of commercial environments, not availability claims.

## Property Requirement boundary

`/property-requirement/{briefPublicId}` is the first bounded continuation proof. It is owner-only, noindex, reads the current canonical Location Requirement and recommendation snapshot from the server, and presents the same vNext visual shell and search context.

The first implemented property-stage question is:

> What should this office help your team do?

This asks for space-purpose priorities—client meetings, team collaboration, quiet focused work, or showroom/presentation—not facts already established for the location decision. It does not recollect market, property type, business identity, employee geography, environment preference, client frequency, transit, or parking.

This sprint does not implement the full adaptive Property Requirement. Future work should review and sequence property-stage dimensions such as approximate size or capacity, growth, timing, economics, detailed storage and loading, layout/program, parking quantity, building characteristics, and specialized improvements.

## Persistence

Property-stage answers are stored separately as `property-requirement-draft:v1` in `location_brief_v2_property_requirement_drafts` (or the existing v2 KV record in KV-backed environments). The draft stores:

- Brief identity
- current Location Requirement revision reference
- current Recommendation Snapshot reference
- monotonic property-draft revision
- bounded canonical property answers
- created and updated timestamps

The draft does not overwrite the Location Requirement or mutate recommendation snapshots. Optimistic draft-revision checks reject stale writes. The Brief public ID, owner capability, EntryContext, source attribution, location revision, snapshot, and investigation set remain intact.

## Commercial boundary

Opening the property stage and saving its first answer create no lead, OfficeFinder request, broker routing decision, email, contact record, or market-investigation submission. The explicit production commercial-assistance submission remains the commercial boundary.

## Legacy compatibility

Legacy `/find-locations/` remains unchanged for non-vNext markets, property types, and existing production journeys. Eligible v2 Brief owners no longer enter that legacy Business Profile flow when continuing from a Brief, preventing lossy mappings such as Architecture, Design & Creative Services becoming Professional Services.

Location Brief v1 is unchanged. Existing v1 routes, records, rendering, contact behavior, lead references, and OfficeFinder behavior are not migrated or recalculated.

## Navigation

The Location Brief links to the owner-only property-stage route through “Continue my search.” The property-stage page links back to the same stable Brief. Editing the location search remains a separate Brief action and continues to create immutable Location Requirement revisions and recommendation snapshots.

## Current limitations

- Only the first Office property-purpose question is implemented.
- The property draft has no complete adaptive interview or completion state.
- Property-stage answers do not yet drive property discovery.
- The investigation locations remain flexible context, not hard geographic filters.
- Anonymous recovery and sharing remain limited to the established v2 owner-capability model.
