# Rofo vNext commercial handoff

## Explicit submission boundary

Location Requirement completion, Location Brief creation or editing, district exploration, Property Requirement answers, and Property Requirement completion do not create a lead. The completed Property Requirement displays a contact form whose **Share my search with Rofo** submission is the sole vNext commercial-intent boundary.

## Canonical payload

The server reloads the owner-authorized Location Brief bundle and current Property Requirement draft. Hidden browser fields are not trusted as canonical search facts. The resulting existing-system lead retains:

- the complete EntryContext and source attribution;
- the current Location Requirement revision ID and number;
- the current Recommendation Snapshot ID, version, readiness, investigation locations, and candidate context;
- the Property Requirement schema version, draft revision, use, size or capacity, timing, and must-haves;
- the canonical business identity without legacy-taxonomy substitution;
- a view-only Location Brief URL.

Locations surfaced by Rofo and areas supplied by the user are investigation preferences and comparison context, not hard geographic filters. The handoff explicitly permits nearby compatible areas.

## Existing lead and qualification integration

The adapter creates a normal record in the existing `leads` storage through `saveLead`. It uses `vnext_market_investigation` as a lead-type discriminator while preserving the established routing, qualification, spam, approval, notification, OfficeFinder, and admin-dashboard machinery. The requirement is marked `qualified_requirement` because canonical market, property type, business context, size/capacity, and timing have already been collected.

Phone is optional for the user. The established OfficeFinder adapter may apply its isolated placeholder only when an approved downstream OfficeFinder payload requires a phone; the stored lead is not changed. A valid US number with leading country code `1` is normalized to ten digits by the existing adapter.

## OfficeFinder and internal operations

The OfficeFinder payload is prepared at lead creation but remains `officefinder_pending_approval`. No request is sent to OfficeFinder before the existing operator approval action. Its comments contain the Project Snapshot and durable Location Brief link. The lead dashboard shows locations worth investigating, space use, size/capacity, timing, must-haves, and Requirement revision references in the existing lead view.

Internal notification and customer confirmation continue through the existing email functions. Confirmation language says Rofo or a local expert can review and follow up; it contains no response-time or availability guarantee.

## Snapshot integrity and idempotency

`location_brief_v2_commercial_requests` binds one commercial request to a Brief and Property Requirement draft revision. The record reserves the lead ID before lead persistence and prevents double-click, refresh, or browser retry from creating another lead. A materially edited Property Requirement produces a new draft revision and can follow the existing new-request policy.

The submitted lead references the immutable Location Requirement revision, Recommendation Snapshot, and Property Requirement draft revision that existed at authorization time. Later Brief edits do not rewrite the submitted commercial record.

## Security and failure recovery

Submission requires the Location Brief owner cookie and the same production origin guard used by Property Requirement mutations. Contact data is sent in the POST body, never in URLs or analytics. The Location Brief link contains view authority only; the edit capability remains in the Secure, HttpOnly, SameSite owner cookie.

If lead persistence fails, the idempotency reservation is released and the completed Property Requirement shell rerenders with a recoverable message and the submitted contact values. No partial OfficeFinder submission occurs.

## Analytics

The existing search-profile event endpoint accepts `property_requirement_completed`, `share_search_viewed`, `share_search_submitted`, and `commercial_request_created`, alongside the existing vNext commercial event. Events contain bounded page, source, market, and property-type context only—no PII or raw Requirement content.

## Legacy compatibility

Location Brief v1, legacy `/find-locations/`, noneligible markets/property types, existing lead forms, lead routing rules, OfficeFinder approval, broker economics, and existing contact flows are unchanged. This adapter is reachable only from an owner-authorized, completed SF Office vNext Property Requirement.
