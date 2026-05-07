# Rofo Neighborhood Page Architecture Blueprint

This document defines a future Rofo neighborhood and business district page experience. It is a blueprint only and should be reviewed before any production template work.

Rofo is not becoming a listings marketplace. Neighborhood pages should help businesses understand location fit, compare commercial environments, and decide where to focus a search. They should not expose stale inventory or imply current availability.

Core principle:

**Businesses lease environments, not just square footage.**

The page should answer practical tenant questions:

* What kind of business fits here?
* What does the daily work environment feel like?
* What building styles and space types are common?
* What nearby districts should be compared?
* What representative buildings help explain the market?
* How can Rofo help a tenant take the next step without implying live inventory?

## Page Role

Neighborhood and business district pages should sit between city-level market guides and individual building intelligence.

Recommended positioning:

* City page: transactional hub for a city.
* City market guide: broader market education and comparisons.
* Neighborhood page: business district fit, identity, daily experience, and representative building context.
* Building page: property-level intelligence and lead capture.

## 1. Hero / Identity

### Purpose

Quickly establish where the district is, why it matters, and what types of businesses should consider it.

### Recommended Content

* District name and city.
* A short identity statement.
* Best-fit tenant categories.
* Nearby comparison links.
* Soft CTA that asks what the tenant needs.

### Data Sources Available Now

* `data/peter/derived/bay_area_editorial_neighborhoods.csv`
  * `canonical_label`
  * `neighborhood_type`
  * `representative_identity`
  * `likely_tenant_intent`
  * `recommended_space_types`
* `data/peter/derived/bay_area_neighborhood_adjacency.csv`

### Future Enrichment Sources

* Reviewed neighborhood boundaries.
* Local photography or map imagery.
* Broker-written district summaries.
* Approved tenant examples by category, without naming private tenants unless allowed.

### What To Avoid

* Do not say space is currently available unless there is fresh approved availability.
* Do not open with generic city SEO copy.
* Do not overuse CRE jargon like submarket, Class A, or absorption unless it helps the user.

### Example Copy Snippets

Financial District:

> The San Francisco Financial District is a strong fit for teams that value a central business address, client access, professional services visibility, and proximity to other downtown companies.

Jackson Square:

> Jackson Square works well for businesses that want downtown access in a more boutique building environment, with a mix of professional services, design firms, client-facing teams, and smaller office users.

## 2. Why Businesses Choose This Area

### Purpose

Explain the business reasons a tenant might choose the district instead of simply describing the neighborhood.

### Recommended Content

* Best fit businesses.
* Common tenant motivations.
* Decision factors such as image, access, customer proximity, employee experience, or operating needs.
* Short comparison to nearby districts.

### Data Sources Available Now

* Editorial fields:
  * `representative_identity`
  * `likely_tenant_intent`
  * `recommended_space_types`
* Adjacency relationships and relationship reasons.
* Neighborhood intelligence:
  * `building_count`
  * `active_building_count`
  * `total_listing_activity`
  * `likely_office_cluster`
  * `likely_mixed_use`

### Future Enrichment Sources

* Broker notes by district.
* Tenant interviews or anonymized tenant search reasons.
* Current commute and access notes.
* Approved local amenities data.

### What To Avoid

* Do not make unsupported claims about demand strength.
* Do not call a district the best option for all tenants.
* Do not turn this into a promotional neighborhood profile.

### Example Copy Snippets

> Businesses often compare SoMa when they want a more flexible office environment than the traditional downtown core, with easier access to creative, technology, showroom, and mixed-use spaces.

> Downtown Oakland can make sense for East Bay teams that want a central location, professional building options, and access to nearby civic, transit, and service amenities.

## 3. Building Styles & Workspace Environment

### Purpose

Help tenants understand what kinds of buildings and work environments are common in the district.

### Recommended Content

* Common building character.
* Larger office towers versus smaller boutique buildings.
* Creative office, older commercial buildings, warehouse/flex, campus-style, or retail storefront patterns.
* How the building environment may affect fit.

### Data Sources Available Now

* Representative buildings:
  * `building_name`
  * `address`
  * `listing_count`
  * `activity_bucket`
  * `assignment_confidence`
* Building signals:
  * `building_size`
  * `floors`
  * `units`
  * `likely_multi_tenant`
  * `has_size_data`
* Neighborhood intelligence:
  * `avg_building_size`
  * `avg_floors`
  * `dominant_activity_bucket`

### Future Enrichment Sources

* Building photos.
* Verified building class and vintage.
* Approved amenity data.
* Broker-authored building style notes.
* Landlord source pages.

### What To Avoid

* Do not present representative buildings as current listings.
* Do not show suite numbers, old rents, or stale availability.
* Do not infer amenities such as parking, transit, or renovations without data.

### Example Copy Snippets

> Representative buildings in this district suggest a mix of multi-tenant office environments and smaller commercial buildings. Use these examples to understand the district's building pattern, not as a live availability list.

> South Park is better understood as a compact creative office environment than a broad citywide search area. Tenants should compare the building feel here with nearby SoMa and Mission Bay options.

## 4. Transit, Parking & Accessibility

### Purpose

Help tenants think about how people get to and from the district, including employees, customers, vendors, and visitors.

### Recommended Content

* General access considerations.
* Employee commute fit.
* Customer and visitor access.
* Delivery, loading, and operational access where relevant.
* Bike and pedestrian context where verified.

### Data Sources Available Now

* District city and neighborhood coordinates.
* Editorial notes and nearby district relationships.
* Legacy city descriptions may include access language, but should be reviewed before reuse.

### Future Enrichment Sources

* Transit agency data.
* Walk, bike, and parking research.
* Broker notes.
* Manually reviewed map context.
* Landlord and building pages.

### What To Avoid

* Do not claim a property is steps from transit, minutes from highways, walkable, or parking-rich without verified data.
* Do not use precise commute claims unless sourced.
* Do not imply access is good for all businesses.

### Example Copy Snippets

> For office users, access is not just about the commute. It also affects client visits, recruiting, meeting attendance, and how often teams choose to work from the office.

> For retail and service businesses, access should be evaluated through customer convenience, visibility, repeat-visit friction, and parking or transit expectations.

## 5. Food, Amenities & Daily Experience

### Purpose

Explain the everyday employee and customer experience around the district.

### Recommended Content

* Food and coffee access.
* Gyms, hotels, meeting places, and after-work options where relevant.
* Employee experience.
* Customer or client perception.
* Service business context.

### Data Sources Available Now

* Editorial district type and identity.
* Nearby district comparison data.
* Legacy descriptions may contain general neighborhood character, but should be reviewed.

### Future Enrichment Sources

* Reviewed amenities list.
* Local business categories from approved sources.
* Broker notes.
* Manually researched district descriptions.
* Hotel and conference access for client-facing districts.

### What To Avoid

* Do not scrape or publish individual nearby businesses without review.
* Do not imply specific amenities exist near a building unless known.
* Do not over-romanticize the district.

### Example Copy Snippets

> Daily experience matters because it affects recruiting, retention, client visits, and how useful the location feels after move-in.

> A district with coffee, lunch, gyms, hotels, and meeting spots can be more practical for client-facing teams than a cheaper location with less daily support nearby.

## 6. Representative Buildings

### Purpose

Show examples of the building fabric in a district without implying live availability.

### Recommended Content

* 5 to 10 representative buildings.
* Building name or address.
* Activity bucket or historical activity signal if used internally.
* Building type notes only if known.
* Links to canonical building pages when they exist.

### Data Sources Available Now

* `data/peter/derived/bay_area_representative_buildings.csv`
* `data/peter/derived/building_signals.csv`
* Future approved building data generated from reviewed sources.

### Future Enrichment Sources

* Approved building images.
* Owner or landlord pages.
* Broker review.
* Verified building-level fields such as building size, floors, year built, use type, and amenities.

### What To Avoid

* Do not label these as available spaces.
* Do not display old suite-level data.
* Do not show rent or availability from legacy listing exports.
* Do not create a listing-grid UX.

### Example Copy Snippets

> These buildings help explain the commercial fabric of the district. They are representative examples based on historical activity and geographic assignment, not a live inventory feed.

> Use representative buildings to understand scale, location pattern, and building environment before deciding which district to compare next.

## 7. Common Space Types

### Purpose

Connect district identity to the kinds of space a tenant might reasonably search for.

### Recommended Content

* Office.
* Retail.
* Coworking.
* Flex.
* Industrial or light industrial where relevant.
* Lab or medical office where supported by editorial review.

### Data Sources Available Now

* `recommended_space_types` in `bay_area_editorial_neighborhoods.csv`.
* Building signals and likely multi-tenant flags.
* Existing city and space-type page architecture, once production work is approved.

### Future Enrichment Sources

* Approved property-type classification.
* Broker and landlord inputs.
* Reviewed availability intake data at building level.
* Tenant inquiry patterns by district.

### What To Avoid

* Do not create a space type section unless there is meaningful district fit.
* Do not imply live options.
* Do not keyword stuff every page with every space type.

### Example Copy Snippets

> Office users may compare this district when they need a recognizable business address and a building environment that supports client meetings.

> Retail and service businesses should evaluate whether the district supports customer access, visibility, and repeat visits.

## 8. Nearby District Comparisons

### Purpose

Help tenants compare similar or adjacent districts instead of forcing every decision into one neighborhood.

### Recommended Content

* Adjacent districts.
* Comparable districts.
* Nearby alternatives.
* Same tenant search pattern relationships.
* One or two sentences explaining why the comparison matters.

### Data Sources Available Now

* `data/peter/derived/bay_area_neighborhood_adjacency.csv`
  * `relationship_type`
  * `reason`
* Editorial nearby neighborhoods field.

### Future Enrichment Sources

* Broker-authored comparison notes.
* Search behavior and lead patterns.
* Pricing and availability trend data after review.

### What To Avoid

* Do not link to neighborhoods without editorial approval.
* Do not compare districts on price unless data is reviewed and fresh.
* Do not create circular link spam. Links should help tenants compare real alternatives.

### Example Copy Snippets

> Tenants comparing the Financial District often also look at Jackson Square, SoMa, and South Park depending on whether they want a traditional downtown office environment or a more creative building feel.

> North San Jose and Sunnyvale can serve similar technology, R&D, office, and flex search patterns, but the right fit depends on commute, building type, and operational needs.

## 9. Neighborhood Context / Leasing Patterns

### Purpose

Use historical and editorial signals to explain leasing patterns carefully without presenting stale inventory.

### Recommended Content

* Historical activity intensity.
* Building density.
* Whether the district appears office-oriented, mixed-use, small-business friendly, or industrial/flex-oriented.
* Cautious market context.
* A note that activity signals are historical.

### Data Sources Available Now

* `data/peter/derived/bay_area_neighborhood_intelligence.csv`
  * `building_count`
  * `active_building_count`
  * `total_listing_activity`
  * `median_listing_activity`
  * `dominant_activity_bucket`
  * `likely_office_cluster`
  * `likely_mixed_use`
  * `likely_small_business_friendly`

### Future Enrichment Sources

* Current broker market notes.
* Reviewed rent ranges by district.
* Tenant demand patterns from Rofo leads.
* Office, retail, industrial, flex, and life science guide data.

### What To Avoid

* Do not say historical listing activity means current availability.
* Do not publish old listing counts as inventory counts.
* Do not show stale rent or vacancy data.
* Do not make unsupported claims like strongest, hottest, best, or most desirable.

### Example Copy Snippets

> Rofo's legacy data shows meaningful historical leasing activity in this district, which makes it useful for understanding commercial search patterns. This should be read as market context, not current availability.

> The building pattern suggests this district may be useful for office and service businesses comparing nearby alternatives, but tenants should confirm current options through a local expert.

## 10. CTA / Lead Layer

### Purpose

Convert interest into a tenant inquiry without implying that Rofo has live listing inventory on the page.

### Recommended Content

* Soft lead form.
* Clear language around help, comparison, and local guidance.
* Field collection:
  * name
  * email
  * phone
  * target market or district
  * space type
  * approximate size
  * requirements
* Hidden page metadata if implemented later.

### Data Sources Available Now

* Existing Rofo lead submission architecture, but do not implement in this blueprint.
* Editorial district name, city, and recommended space types.

### Future Enrichment Sources

* Lead routing by city, county, state, and space type.
* Broker coverage rules.
* Approved district-level routing notes.

### What To Avoid

* Do not use CTAs like View Available Spaces unless there is a verified live inventory product.
* Do not suggest immediate inventory access.
* Do not show listing cards or stale spaces.

### Example Copy Snippets

> Tell us what kind of space you need and Rofo can help you compare this district with nearby options.

> Not sure if this district is the right fit? Share your space needs and we can help you evaluate nearby business districts.

## Tone Guidelines

Use human, business-friendly language. The voice should be calm, practical, and experienced.

Prefer:

* business district
* location fit
* building environment
* daily employee experience
* customer access
* nearby alternatives
* representative buildings
* historical activity

Use CRE jargon only when it helps the tenant understand a real decision. If a word like submarket, concession, or triple net is used, explain it simply.

Avoid:

* generic SEO filler
* overclaiming
* hype words such as prime, vibrant, hottest, booming, or best
* stale listing language
* unsupported rent, vacancy, amenity, transit, or availability claims

## Data Rules

* `listing_count` means historical leasing activity intensity. It does not mean live inventory.
* Representative buildings are examples. They are not current listings.
* Avoid stale rents, suite numbers, old availability, old broker notes, and old listing descriptions.
* Do not expose raw suite-level or listing-level exports.
* Use assignment confidence internally and be cautious with low-confidence neighborhood assignments.
* Editorial judgment overrides automation.
* Pages should be generated only for reviewed districts with clear commercial identity and enough enrichment potential.

## Internal Linking Rules

Neighborhood pages should support a clean discovery graph.

### Parent City Page

Link to the transactional city page:

* `/commercial-real-estate/{STATE}/{city}/`

Use this when the tenant is ready to search or submit a requirement for the broader city.

### City Market Guide

Link to the city market guide:

* `/commercial-real-estate/{STATE}/{city}/market-guide/`

Use this for broader market context, rents, nearby markets, and city-level education.

### Relevant Space Type Pages

Link only to space types that are relevant to the district and exist for the city:

* office space
* retail space
* coworking space
* flex space
* industrial space
* medical office or lab only when supported later

Do not link every district to every space type.

### Adjacent Neighborhoods

Use `bay_area_neighborhood_adjacency.csv` to link to:

* adjacent districts
* nearby alternatives
* comparable districts
* same tenant search pattern districts

Links should explain why the comparison matters.

### Representative Building Pages

Link representative buildings only when a canonical Rofo building page exists or when an approved building-level record can generate one.

Never use representative building links to imply live availability.

## Prototype Recommendation

Start with 3 to 5 pages where the business identity is clear, the district is recognizable, and the data is useful enough for internal review.

Recommended first prototypes:

1. Financial District, San Francisco
2. Jackson Square, San Francisco
3. SoMa, San Francisco
4. Downtown Oakland
5. Jack London Square

Why these first:

* They have recognizable business identity.
* They have meaningful search intent.
* They support nearby district comparisons.
* They have representative building data.
* They can link naturally to existing city, market guide, space type, and building pages.

## Implementation Caution

This document is a blueprint only. It should be reviewed with product, SEO, and data quality judgment before any production template work.

Before public rollout:

* Review district boundaries.
* Review representative buildings.
* Confirm canonical page URL strategy.
* Confirm internal linking rules.
* Confirm no stale listing or suite-level data is exposed.
* Confirm lead CTA language does not imply live inventory.
* Pilot a small number of districts before scaling.
