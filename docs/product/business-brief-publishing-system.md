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

Phase 1 creates ten Business Brief records. San Francisco pages are published and indexable. Phase 1B adds a structured Denver Office model and publishes four Denver Office briefs whose recommendations align with the resolver and representative-building evidence. The Denver Healthcare Organization brief remains held because the healthcare-office comparison model needs additional evidence before indexed publication.

## Source Files

- `_data/businessArchetypes.js` owns reusable archetype definitions.
- `_data/businessBriefDefinitions.js` owns market/property/archetype Business Brief definitions.
- `lib/publisher/resolve-business-brief.js` assembles Business Briefs from canonical source data.
- `_data/businessBriefs.js` exposes resolved briefs to Eleventy.
- `pages/business-brief.njk` renders the shared public template.
- `scripts/qa-business-briefs.js` validates identity, readiness, metadata, links, evidence, and duplication controls.
- `_data/denverOfficeRecommendationModel.js`, `lib/recommendations/denver-office-recommendation-resolver.js`, and `scripts/qa-denver-office-recommendation-model.js` define and validate the Denver Office reference model used for Denver Business Brief readiness.

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

## Denver Phase 1B Pages

Published:

- `/denver/office/technology-companies/`
- `/denver/office/professional-services/`
- `/denver/office/law-firms/`
- `/denver/office/nonprofits/`

Held:

- `/denver/office/healthcare-organizations/`

Denver now has a structured Office model for Downtown Denver, LoDo, RiNo, Cherry Creek, Denver Tech Center, Central Park, and Santa Fe Arts District. Four Denver Office Business Briefs are indexable because their Best Fits align with the resolver and can show representative-building examples from canonical Building Brief cards or authored Knowledge Graph representative-building records. The healthcare page remains `noindex,follow` because the resolver strongly concentrates healthcare-service/admin signals on Central Park and Denver still needs a stronger healthcare-office comparison model before public indexing.

## Recommendation Alignment

Business Briefs must remain aligned with recommendation systems.

For San Francisco Office:

- Best Fits should be consistent with the structured San Francisco Office recommendation model.
- Signal-specific districts may appear when the archetype supports them.
- Budget, rent, cost, current availability, concessions, landlord motivation, and live economics must not influence district recommendations.

For Denver Office:

- Briefs use the structured `denver:office` model, Knowledge Graph district fit, and representative-building coverage.
- Published Best Fits must be supported by `lib/recommendations/denver-office-recommendation-resolver.js`.
- Budget, rent, cost, current availability, concessions, landlord motivation, and live economics must not influence district recommendations.
- Held pages identify the exact evidence or model gap blocking publication.

## Publisher and EOS Integration

Phase 1 does not modify Publisher scoring or EOS planning. It prepares a clean product layer that Publisher and EOS can measure later.

Readiness signals include:

- archetype coverage by Market and Property Type
- Business Brief coverage by Market and Property Type
- publication readiness state
- missing district evidence
- missing representative buildings
- broken internal links
- duplicate or thin editorial content

`_data/businessBriefs.js` exposes a `readinessSummary` object with market-level counts, Best Fits, representative-building counts, indexability, publication state, hold rationale, and missing-knowledge notes. This is a product-readiness surface; it does not change Publisher scoring or EOS planning.

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
- Denver published pages align with the Denver Office model
- Denver healthcare remains held from indexable publication
- every published page has unique metadata
- every published page links to personalization
- sitemap eligibility follows readiness state
- no page uses live availability language or debug terminology
- duplicate summary and rationale risk is flagged

## Known Gaps

- Business Briefs currently support Office only.
- Archetype-to-district behavior is explicit editorial data, not yet a generalized cross-market resolver.
- City pages only promote published Business Briefs.
- Denver healthcare-office guidance needs a focused comparison sprint before publication.
- Denver Santa Fe Arts District is signal-specific and not yet promoted as a Business Brief Best Fit.
- Broader Denver medical, Aurora, hospital-adjacent, and southeast suburban healthcare geography remain outside the Phase 1B model.

## Next Sprint

Recommended next sprint:

```text
Denver Healthcare Office Geography and Evidence
```

Scope:

- normalize Denver healthcare-office sub-scenarios
- evaluate Aurora, hospital-adjacent, Central Park, Cherry Creek, DTC, and Downtown Denver relationships
- deepen healthcare representative-building evidence
- decide whether `/denver/office/healthcare-organizations/` can move from held to published
