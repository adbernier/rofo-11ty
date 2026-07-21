# Rofo Building Page Standard

Rofo building pages are Building Briefs: concise editorial decision-support pages that help a business understand whether a representative building belongs on a shortlist.

They are not listing pages, broker flyers, availability pages, or generic property records. A useful Rofo building page answers:

- Why should this building matter to a business?
- What kind of business or location strategy may fit here?
- What tradeoffs should be understood before touring?
- How does the building explain its district?
- What should the user compare next?

## Content Hierarchy

The canonical Building Brief structure is:

1. Building hero
2. Why This Building Matters / Rofo Take
3. Building Snapshot / Quick Facts
4. Best Fit
5. Building Experience
6. District Context
7. Advantages and Tradeoffs
8. Nearby Alternatives
9. Validation questions
10. Related Insights
11. Rofo Context and Start Your Search

The page should support the larger Rofo journey:

City -> District -> Representative Building -> Start Your Search

## Production Reading Order

The calibrated production order is designed around how a tenant evaluates a building:

1. Understand the building's commercial role.
2. Decide whether the building may fit the business.
3. Understand the operating experience and district.
4. Evaluate advantages and tradeoffs.
5. Compare nearby decision alternatives.
6. Validate the most important uncertainties.
7. Continue the search.

Validation questions should follow Nearby Alternatives because users usually know what to investigate only after seeing the realistic comparison set. Related Insights should remain compact and secondary to the building decision.

## Required and Optional Data

Required for a canonical Building Brief:

- building name or address
- city and state
- district relationship
- concise positioning summary
- Rofo Take
- best-fit guidance
- at least one meaningful tradeoff

Optional fields should render only when useful:

- primary use
- building type
- scale
- floorplate character
- construction or renovation era
- parking context
- transit context
- loading or operational functionality
- outdoor space
- validation questions
- nearby districts
- related comparisons
- related handbook topics
- image

Do not display empty rows, `N/A`, unknown values, or inherited database fields that do not help a user make a decision.

## Editorial Object

The current prototype uses an optional `building_brief` object on a building record:

```js
building_brief: {
  status,
  summary,
  buildingSummary,
  rofoTake,
  buildingImportance,
  snapshot,
  quickFacts,
  bestFit,
  idealFor,
  mayNotFit,
  buildingExperience,
  locationContext,
  districtContext,
  advantages,
  tradeoffs,
  validationNotes,
  nearbyDistricts,
  nearbyAlternatives,
  representativeCompanies,
  relatedInsights
}
```

This object is intentionally optional. Existing representative and legacy building pages remain backward compatible. Future buildings can adopt the Building Brief standard one record at a time.

The current runtime accepts both the original Building Brief field names and the newer production aliases. Prefer the production names for new records:

- `buildingSummary`: concise hero summary
- `buildingImportance`: the main editorial interpretation for "Why This Building Matters"
- `quickFacts`: rendered fact rows such as class, size, floors, year built, renovation year, ownership, parking, and transit
- `idealFor`: business profiles or location strategies that fit the building
- `mayNotFit`: specific cases where another building or district may be better
- `districtContext`: how the building fits into the surrounding commercial geography
- `nearbyAlternatives`: decision alternatives with a URL, label, and reason
- `representativeCompanies`: supported organization examples only, never speculative tenant claims
- `relatedInsights`: contextual handbook, comparison, city, or district guidance

Older aliases remain supported:

- `summary` -> `buildingSummary`
- `rofoTake` -> `buildingImportance`
- `snapshot` -> `quickFacts`
- `bestFit` -> `idealFor`
- `locationContext` -> `districtContext`
- `nearbyDistricts` -> `nearbyAlternatives`

## Editorial Voice

Write like an experienced commercial real estate advisor, not a landlord, broker, or marketing site.

All Building Brief copy should follow the Rofo Editorial Style Guide in `docs/editorial-style-guide.md`. The style guide is the source of truth for voice, grammar, commercial vocabulary, comparison standards, and tradeoff writing across Rofo.

Use:

- direct commercial judgment
- clear tenant fit
- real tradeoffs
- district context
- practical validation questions

Avoid:

- premier office building
- state-of-the-art
- highly desirable
- prestigious address
- unparalleled amenities
- ideal for every business
- best-in-class
- unsupported availability claims

## Best Fit and Tradeoffs

Best Fit should help a user self-identify. Strong entries name business types, operating needs, or location strategies.

Weak:

- Businesses looking for office space
- Companies that want a great location

Strong:

- Finance, law, consulting, and professional-service firms that need a client-facing downtown address
- Creative teams that value adaptable floorplates over a traditional executive tower

Tradeoffs should be equally specific.

Weak:

- May not fit everyone
- Parking can be limited

Strong:

- Parking and visitor access can be more difficult than in edge or suburban markets
- Historic character may come with less efficient floorplates or more buildout validation

## Image Handling

Use an existing building image when it is reliable and visually usable. The layout must also work with:

- no image
- one image
- unusual aspect ratios
- placeholder imagery

Do not create a gallery experience in the Building Brief standard. Do not use broken external image URLs.

## Internal Links

A Building Brief should naturally link to:

- the district page
- the city page
- nearby districts when they clarify the tradeoff
- related building comparisons
- related representative buildings where available
- relevant Commercial Leasing Guide topics
- Start Your Search

Links should answer the next question, not create a generic resource block.

## Reusable Components

The production Building Page System is implemented through reusable partials under `_includes/partials/building/`:

- `brief-journey.njk`
- `brief-facts.njk`
- `brief-fit.njk`
- `brief-decision.njk`
- `brief-alternatives.njk`
- `brief-district-context.njk`
- `brief-related-insights.njk`
- `brief-status-note.njk`
- `product-transition-card.njk`

Only records with `building_brief` use this canonical production journey. Non-migrated representative pages and legacy building pages keep their existing fallback behavior until they are intentionally migrated.

## Prototype

The first canonical prototype is 555 California St in San Francisco.

It was selected because it appears in the San Francisco canonical representative-building collection, has a clear Financial District role, has related comparison paths, and demonstrates a recognizable commercial decision: traditional downtown executive presence and client access versus cost, flexibility, parking, and less traditional workplace alternatives.

The next migration batch added:

- 101 California St: central Financial District access and professional-service utility
- Salesforce Tower: modern flagship headquarters identity at the Transbay/SoMa edge
- 650 Townsend St: large-format SoMa creative-office and Caltrain-oriented workspace
- The Exchange / 1800 Owens St: newer Mission Bay office and innovation-district context
- Levi's Plaza / 1105 Battery St: lower-rise Jackson Square campus-style environment

Migration Batch 1 added:

- 345 California Center / 345 California St: boutique-leaning executive tower comparison
- One Sansome / 1 Sansome St: repositioned transit-oriented Financial District office
- Transamerica Pyramid Center / 600 Montgomery St: north-downtown skyline and executive-office identity
- One Bush Plaza / 1 Bush St: modernist Financial District office character
- 181 Fremont St: premium Transbay tower alternative to Salesforce Tower
- 680 Folsom St: central SoMa adaptive reuse office benchmark
- 888 Brannan St: warehouse-to-headquarters creative-office benchmark
- 600 Townsend St: Townsend corridor creative-office and Caltrain-oriented workspace
- 500 Terry Francois Blvd: Mission Bay waterfront-adjacent office context
- 550 Terry A Francois Blvd: Mission Bay office/lab-adjacent innovation context

These pages should read differently from one another. A Building Brief is not complete just because every field is populated; it is complete when the tradeoff is clear.

## Migration Eligibility

A building is eligible for Building Brief migration when:

- it already has a canonical Rofo building record and URL
- it belongs to the representative building collection or clearly explains a district
- the canonical district can be identified from Commercial Building Intelligence
- at least three meaningful decision alternatives exist
- enough supported editorial context exists to explain fit, advantages, tradeoffs, and validation questions

Do not create a duplicate record to migrate a building. If naming is inconsistent, preserve the canonical URL and resolve display naming through the intelligence layer.

## Authoring Guidance from the First Batch

Common required fields:

- `buildingSummary`
- `buildingImportance`
- `quickFacts`
- `idealFor`
- `mayNotFit`
- `buildingExperience`
- `districtContext`
- `advantages`
- `tradeoffs`
- `validationNotes`
- `nearbyAlternatives`
- `relatedInsights`
- `representativeCompanies`

Backward-compatible aliases remain supported:

- `summary`
- `rofoTake`
- `snapshot`
- `bestFit`
- `locationContext`
- `nearbyDistricts`

Fields that should remain optional:

- image data
- exact size or scale
- construction or renovation era
- floorplate detail beyond supported editorial guidance
- parking specifics
- specialized infrastructure
- outdoor space
- loading or operational capability

When facts are not supported, describe what a tenant should validate instead of pretending the page knows the answer.

## Minimum Editorial Standard

Each migrated Building Brief should include:

- a 40-80 word hero summary
- a Rofo Take that explains why the building matters without repeating the hero
- five or more quick facts, limited to supported or defensible editorial facts
- at least three ideal-fit entries and two may-not-fit entries
- at least three advantages and two tradeoffs
- at least four building-specific validation questions
- three to five building alternatives with specific reasons
- contextual related insights with valid public URLs

The minimum standard is not a content-length target. A brief can satisfy the count and still fail if it reads generically.

## Differentiating Similar Buildings

Downtown towers should not all sound alike. Separate them by decision role:

- corporate scale
- transit access
- professional-service utility
- executive image
- tower formality
- newer flagship identity
- cost and flexibility tradeoffs

Creative and innovation buildings should be differentiated by:

- floorplate adaptability
- neighborhood texture
- employee commute patterns
- production adjacency
- campus feel
- district maturity
- relationship to nearby anchors

## Selecting Decision Alternatives

Decision alternatives are not simply the closest buildings. Choose alternatives that clarify a user's real choice:

- same district, different level of formality
- same business fit, different cost or access pattern
- nearby district, different workplace identity
- modern tower versus creative/adaptive reuse
- campus setting versus traditional downtown core

Use existing comparison paths when available. If no comparison page exists, link to the district or representative-building context that best answers the next question.

For building alternatives:

- use building pages, not district pages
- do not link a building to itself
- do not duplicate alternatives
- explain why a tenant might prefer the alternative
- prefer real decision alternatives over nearest-address proximity
- include reciprocal alternatives only when the reverse comparison reflects a real tenant decision

Production alternative cards should show three to five alternatives when available. Each card should answer:

- what the alternative is
- where it sits, when structured data supports the label
- why a tenant might prefer it

Use "Prefer this when..." style reasoning. Avoid "another nearby option," "similar property," or reasons that only restate geography.

## CTA and Status Placement

Building Briefs use `Start Your Search` as the primary action in the hero and in the final product transition. Do not add lead forms to Building Brief pages.

The status note should appear after the main decision content and before the final product transition. It should be concise and explain that Rofo's building intelligence is representative decision support, not a current availability claim.

## Mobile Presentation

The mobile layout should preserve the same reading order with one clear column. Cards should stack naturally, tap targets should remain easy to hit, and long section items should not force horizontal scrolling or fixed-height cards. Prefer tighter spacing and full-width actions over hiding decision content on mobile.

## Named Tenant Guidance

Use `representativeCompanies` conservatively.

Prefer category-level descriptions such as financial-services firms, professional-services companies, design and creative teams, technology companies, institutional office users, or life-science-adjacent organizations.

Named tenant information is acceptable only when the repository already contains credible, current, building-specific support. Do not infer named tenants from district patterns, old marketing copy, or general market reputation. Tenant rosters change, so named tenant content should be treated as diligence context rather than a permanent building claim.

## Authoring Checklist

Before publishing a Building Brief:

1. Confirm the canonical building path already exists.
2. Confirm the canonical district and nearby districts.
3. Write the Rofo Take before filling secondary fields.
4. Make Best Fit and May Not Fit specific enough for a tenant to self-identify.
5. Include at least three practical validation questions.
6. Add three to five nearby alternatives with a reason a business might prefer each alternative.
7. Add related insights only when the link answers a natural next question raised by the brief.
8. Avoid availability, rent, ownership, amenity, certification, or renovation claims unless already supported.
9. Check that comparison and related insight links resolve.
10. Run `node scripts/qa-building-brief-depth.js` and resolve warnings before publication.
11. Build and inspect the generated page for empty fields or awkward inherited copy.
12. Confirm the page still frames the building as representative decision support, not available inventory.

## Migration Checklist

Use this checklist for future batches:

1. Resolve canonical name, address, district, and Rofo URL from the repository.
2. Confirm the record is representative and not already migrated.
3. Draft `buildingSummary` and `buildingImportance` first.
4. Add only supported `quickFacts`; omit exact size, floors, ownership, renovation, and certifications unless sourced.
5. Write differentiated `idealFor`, `mayNotFit`, `advantages`, and `tradeoffs`.
6. Add building-specific validation questions tied to the likely tenant decision.
7. Select three to five building alternatives and write a reason for each.
8. Add related district, city, and handbook links that answer natural next questions.
9. Use category-level `representativeCompanies` unless named tenants are already supported.
10. Run syntax, QA, build, and generated-page checks.

## Representative Foundation Before Building Briefs

Some metros may first receive a representative-building foundation before full Building Brief migration. A foundation entry should use an existing canonical building path and may include representative role, reason, best-fit summary, primary tradeoff, source confidence, and migration readiness.

Foundation entries are useful for Publisher planning and future recommendation work, but they are not production Building Briefs. Do not mark a building as Brief-ready until the full `building_brief` editorial object is authored and QA passes.

Use this staged approach when:

- the metro is Compass Ready but has no building layer
- priority districts need credible examples before deeper page migration
- repository evidence supports building identity but not full factual depth
- the next sprint needs a ranked Building Brief queue

## Expansion Workflow

To expand this standard:

1. Select a representative building from the canonical collection.
2. Confirm the district relationship and comparison set.
3. Add a `building_brief` object with concise editorial fields.
4. Use only supported facts and clear editorial judgment.
5. Validate that the page does not imply current availability.
6. Build and inspect the generated page at desktop and mobile widths.

Future work can move more Building Brief fields into the Commercial Building Intelligence schema as more markets mature.

Future migration batches should be selected by district coverage and decision diversity, not just building prominence. The goal is to cover the major commercial environments a tenant actually compares: traditional downtown towers, repositioned downtown buildings, Transbay towers, central SoMa adaptive reuse, West SoMa creative office, Mission Bay innovation buildings, Jackson Square character buildings, Dogpatch waterfront/industrial reuse, Design District/showroom-adjacent buildings, and South Beach waterfront-office alternatives.
