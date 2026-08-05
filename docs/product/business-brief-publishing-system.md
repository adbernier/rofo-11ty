# Business Brief Publishing System

**Status:** Phase 1 implementation  
**Owner:** Product  
**Audience:** Product, editorial, engineering, Publisher, EOS  
**Related documents:** `docs/product/rofo-knowledge-architecture.md`, `docs/product/rofo-product-experience-vision.md`, `docs/product/commercial-location-decision-model.md`, `docs/product/sf-office-editorial-recommendation-model.md`

Business Briefs are public advisory pages that answer:

```text
Where should this type of business begin looking for office space in this city?
```

They are not blog posts, listing pages, broker lead pages, or generic SEO articles. They are reusable public expressions of Rofo's Commercial Knowledge System.

## Phase 1 Scope

Markets:

- San Francisco
- Denver

Property type:

- Office

Business archetypes:

- Growing Technology Company
- Client-Facing Professional Services
- Law Firm
- Healthcare Organization
- Nonprofit / Mission-Driven Organization

Phase 1 creates ten Business Brief records. San Francisco pages are published and indexable. Denver pages are generated for review but held from indexable publication because representative-building and archetype-specific evidence depth is thinner.

## Source Files

- `_data/businessArchetypes.js` owns reusable archetype definitions.
- `_data/businessBriefDefinitions.js` owns market/property/archetype Business Brief definitions.
- `lib/publisher/resolve-business-brief.js` assembles Business Briefs from canonical source data.
- `_data/businessBriefs.js` exposes resolved briefs to Eleventy.
- `pages/business-brief.njk` renders the shared public template.
- `scripts/qa-business-briefs.js` validates identity, readiness, metadata, links, evidence, and duplication controls.

## Entity Model

Business Brief identity is stable and machine-readable:

```text
{marketId}:{propertyType}:{businessArchetypeId}
```

Example:

```text
san-francisco:office:growing-technology-company
```

Each brief supports:

- ID
- market reference
- property-type reference
- archetype reference
- title
- SEO title
- meta description
- page heading
- executive summary
- business characteristics
- location priorities
- Best Fit district references
- archetype-specific district reasons
- representative building references resolved from canonical building data
- tradeoffs
- alternative conditions
- CTA configuration
- editorial status
- evidence/source trace
- publication readiness
- last reviewed date

Briefs reference canonical districts and representative buildings. They do not duplicate full district or building content.

## URL Convention

Business Brief URLs use:

```text
/{market-slug}/office/{archetype-slug}/
```

Examples:

- `/san-francisco/office/technology-companies/`
- `/san-francisco/office/law-firms/`
- `/denver/office/nonprofits/`

This convention is short, durable, market-readable, and scalable to future property types. It avoids conflict with existing district, building, listing, and commercial-real-estate routes.

## Page Structure

Every Business Brief renders:

1. Breadcrumbs and context
2. Hero
3. Executive Summary
4. How This Business Uses Space
5. Location Priorities
6. Best Fits
7. Why These Districts
8. Representative Buildings
9. Things to Consider
10. Personalized Location Brief transition
11. Broker or inventory context

The primary action is:

```text
Create Your Personalized Location Brief
```

The CTA links to the existing production Get Locations flow with market, property type, source, and archetype context in the URL. It does not create a separate intake flow.

## Publication Readiness

Supported states:

- draft
- review
- ready
- published
- hold

Only `ready` and `published` pages are:

- indexable
- included in sitemap
- eligible for prominent public linking

Held pages are generated so editors can review portability, but they use `noindex,follow` and are not promoted from city pages or the sitemap.

## San Francisco Phase 1 Pages

Published:

- `/san-francisco/office/technology-companies/`
- `/san-francisco/office/professional-services/`
- `/san-francisco/office/law-firms/`
- `/san-francisco/office/healthcare-organizations/`
- `/san-francisco/office/nonprofits/`

San Francisco uses the validated San Francisco Office editorial model, Knowledge Graph district data, Commercial Market Evidence coverage, and representative building data. Recommendations intentionally align with stable district behavior rather than live rents or availability.

## Denver Phase 1 Pages

Generated but held:

- `/denver/office/technology-companies/`
- `/denver/office/professional-services/`
- `/denver/office/law-firms/`
- `/denver/office/healthcare-organizations/`
- `/denver/office/nonprofits/`

Denver has useful office district graph coverage, including Downtown Denver, LoDo, RiNo, Cherry Creek, Denver Tech Center, and Central Park. However, representative-building depth and archetype-specific review are thinner than San Francisco. The pages are reviewable but not indexable until evidence improves.

## Recommendation Alignment

Business Briefs must remain aligned with recommendation systems.

For San Francisco Office:

- Best Fits should be consistent with the structured San Francisco Office recommendation model.
- Signal-specific districts may appear when the archetype supports them.
- Budget, rent, cost, current availability, concessions, landlord motivation, and live economics must not influence district recommendations.

For Denver Office:

- Briefs use Knowledge Graph district fit and existing representative-building coverage.
- The system does not create a Denver publishing-only recommendation model that pretends to be production recommendation logic.
- Held pages identify the need for a future structured Denver Office resolver.

## Publisher and EOS Integration

Phase 1 does not modify Publisher scoring or EOS planning. It prepares a clean product layer that Publisher and EOS can measure later.

Future readiness signals should include:

- archetype coverage by Market and Property Type
- Business Brief coverage by Market and Property Type
- publication readiness state
- missing district evidence
- missing representative buildings
- broken internal links
- duplicate or thin editorial content

The success metric is useful, defensible, connected knowledge, not page count.

## QA

Run:

```bash
node scripts/qa-business-briefs.js
```

The QA checks:

- all ten Phase 1 briefs exist
- IDs and routes are unique
- archetype definitions are reused across markets
- Best Fits reference valid districts
- representative buildings reference valid building URLs when present
- San Francisco published pages align with the SF Office model
- Denver pages are held from indexable publication
- every published page has unique metadata
- every published page links to personalization
- sitemap eligibility follows readiness state
- no page uses live availability language or debug terminology
- duplicate summary and rationale risk is flagged

## Known Gaps

- Denver needs deeper representative-building coverage for LoDo, RiNo, Denver Tech Center, Central Park, and additional office examples.
- Denver needs a structured Office recommendation model before pages should move from hold to published.
- Business Briefs currently support Office only.
- Archetype-to-district behavior is explicit editorial data, not yet a generalized cross-market resolver.
- City pages only promote published Business Briefs.

## Next Sprint

Recommended next sprint:

```text
Denver Office Evidence and Archetype Readiness
```

Scope:

- complete Denver representative office building evidence for the held districts
- create a structured Denver Office editorial recommendation model
- review the five held Denver Business Briefs against the model
- move ready pages from hold to published only after QA supports the claims
