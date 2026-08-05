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
- `_data/businessBriefRedirects.js` exposes legacy-to-canonical redirects generated from resolved briefs.
- `pages/business-brief.njk` renders the shared public template.
- `pages/business-brief-redirects.njk` writes the Cloudflare Pages `_redirects` file for migrated Business Brief URLs.
- `_includes/partials/space-type/business-briefs.njk` renders published Business Brief summary cards on canonical Office Space pages.
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

Business Brief URLs are children of Rofo's canonical market/property-type hierarchy:

```text
/commercial-real-estate/{state}/{market-slug}/{space-type-slug}/{archetype-slug}/
```

Examples:

- `/commercial-real-estate/CA/san-francisco/office-space/technology-companies/`
- `/commercial-real-estate/CA/san-francisco/office-space/law-firms/`
- `/commercial-real-estate/CO/denver/office-space/nonprofits/`

The parent Office Space pages are:

- `/commercial-real-estate/CA/san-francisco/office-space/`
- `/commercial-real-estate/CO/denver/office-space/`

Routes are resolved in `lib/publisher/resolve-business-brief.js` from the canonical market route, property-type segment, and archetype slug. Templates, sitemap, breadcrumbs, structured-data breadcrumbs, hub cards, and redirects consume the resolved `brief.url` or `brief.internalLinks.propertyType` rather than rebuilding route strings.

Legacy Phase 1 URLs permanently redirect to the canonical hierarchy:

| Old URL | New canonical URL |
| --- | --- |
| `/san-francisco/office/technology-companies/` | `/commercial-real-estate/CA/san-francisco/office-space/technology-companies/` |
| `/san-francisco/office/professional-services/` | `/commercial-real-estate/CA/san-francisco/office-space/professional-services/` |
| `/san-francisco/office/law-firms/` | `/commercial-real-estate/CA/san-francisco/office-space/law-firms/` |
| `/san-francisco/office/healthcare-organizations/` | `/commercial-real-estate/CA/san-francisco/office-space/healthcare-organizations/` |
| `/san-francisco/office/nonprofits/` | `/commercial-real-estate/CA/san-francisco/office-space/nonprofits/` |
| `/denver/office/technology-companies/` | `/commercial-real-estate/CO/denver/office-space/technology-companies/` |
| `/denver/office/professional-services/` | `/commercial-real-estate/CO/denver/office-space/professional-services/` |
| `/denver/office/law-firms/` | `/commercial-real-estate/CO/denver/office-space/law-firms/` |
| `/denver/office/healthcare-organizations/` | `/commercial-real-estate/CO/denver/office-space/healthcare-organizations/` |
| `/denver/office/nonprofits/` | `/commercial-real-estate/CO/denver/office-space/nonprofits/` |

The no-trailing-slash form of each old URL also redirects directly to the same canonical destination. Redirects are permanent and generated from resolved Business Brief data to avoid hierarchy drift.

Breadcrumbs use existing public pages only:

```text
Commercial Real Estate
-> State
-> Market
-> Office Space
-> Business Type Guide
```

The top breadcrumb points to the existing `/markets/` commercial real estate market index because the current site does not have a separate `/commercial-real-estate/` root page.

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

- `/commercial-real-estate/CA/san-francisco/office-space/technology-companies/`
- `/commercial-real-estate/CA/san-francisco/office-space/professional-services/`
- `/commercial-real-estate/CA/san-francisco/office-space/law-firms/`
- `/commercial-real-estate/CA/san-francisco/office-space/healthcare-organizations/`
- `/commercial-real-estate/CA/san-francisco/office-space/nonprofits/`

San Francisco uses the validated San Francisco Office editorial model, Knowledge Graph district data, Commercial Market Evidence coverage, and representative building data. Recommendations intentionally align with stable district behavior rather than live rents or availability.

## Denver Phase 1B Pages

Published:

- `/commercial-real-estate/CO/denver/office-space/technology-companies/`
- `/commercial-real-estate/CO/denver/office-space/professional-services/`
- `/commercial-real-estate/CO/denver/office-space/law-firms/`
- `/commercial-real-estate/CO/denver/office-space/nonprofits/`

Held:

- `/commercial-real-estate/CO/denver/office-space/healthcare-organizations/`

Denver now has a structured Office model for Downtown Denver, LoDo, RiNo, Cherry Creek, Denver Tech Center, Central Park, and Santa Fe Arts District. Four Denver Office Business Briefs are indexable because their Best Fits align with the resolver and can show representative-building examples from canonical Building Brief cards or authored Knowledge Graph representative-building records. The healthcare page remains `noindex,follow` because the resolver strongly concentrates healthcare-service/admin signals on Central Park and Denver still needs a stronger healthcare-office comparison model before public indexing.

## Office Space Hub Discovery

The canonical Office Space pages are the public discovery layer for Business Briefs. They render an "Office Recommendations by Business Type" section that draws from resolved, indexable Business Brief records. Each summary card includes:

- reusable archetype name
- reusable archetype description
- the first three resolved Best Fit districts
- a link to the canonical Business Brief URL
- a `Create My Location Brief` CTA into `/find-locations/`

Held pages are not shown in the hub cards. City pages should avoid duplicating the full Business Brief card set; they should point users toward the relevant Office Space hub when business-type discovery is needed.

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
- Business Brief URLs use the canonical market/property-type hierarchy
- old Business Brief URLs have generated permanent redirects
- breadcrumbs use state, market, and office-space hierarchy URLs
- no page uses live availability language or debug terminology
- duplicate summary and rationale risk is flagged

## Known Gaps

- Business Briefs currently support Office only.
- Archetype-to-district behavior is explicit editorial data, not yet a generalized cross-market resolver.
- Office Space pages are the primary public Business Brief discovery layer.
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
- decide whether `/commercial-real-estate/CO/denver/office-space/healthcare-organizations/` can move from held to published
