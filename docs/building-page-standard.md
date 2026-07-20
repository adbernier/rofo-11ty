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
2. Rofo Take
3. Building Snapshot
4. Best Fit
5. Building Experience
6. Location Context
7. Advantages and Tradeoffs
8. Validation questions
9. Compare the Area
10. Related handbook guidance
11. Rofo Context and Start Your Search

The page should support the larger Rofo journey:

City -> District -> Representative Building -> Start Your Search

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
  rofoTake,
  snapshot,
  bestFit,
  mayNotFit,
  buildingExperience,
  locationContext,
  advantages,
  tradeoffs,
  validationNotes,
  nearbyDistricts
}
```

This object is intentionally optional. Existing representative and legacy building pages remain backward compatible. Future buildings can adopt the Building Brief standard one record at a time.

## Editorial Voice

Write like an experienced commercial real estate advisor, not a landlord, broker, or marketing site.

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

## Prototype

The first canonical prototype is 555 California St in San Francisco.

It was selected because it appears in the San Francisco canonical representative-building collection, has a clear Financial District role, has related comparison paths, and demonstrates a recognizable commercial decision: traditional downtown executive presence and client access versus cost, flexibility, parking, and less traditional workplace alternatives.

The next migration batch added:

- 101 California St: central Financial District access and professional-service utility
- Salesforce Tower: modern flagship headquarters identity at the Transbay/SoMa edge
- 650 Townsend St: large-format SoMa creative-office and Caltrain-oriented workspace
- The Exchange / 1800 Owens St: newer Mission Bay office and innovation-district context
- Levi's Plaza / 1105 Battery St: lower-rise Jackson Square campus-style environment

These pages should read differently from one another. A Building Brief is not complete just because every field is populated; it is complete when the tradeoff is clear.

## Authoring Guidance from the First Batch

Common required fields:

- `summary`
- `rofoTake`
- `snapshot`
- `bestFit`
- `mayNotFit`
- `buildingExperience`
- `locationContext`
- `advantages`
- `tradeoffs`
- `validationNotes`
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

## Authoring Checklist

Before publishing a Building Brief:

1. Confirm the canonical building path already exists.
2. Confirm the canonical district and nearby districts.
3. Write the Rofo Take before filling secondary fields.
4. Make Best Fit and May Not Fit specific enough for a tenant to self-identify.
5. Include at least three practical validation questions.
6. Avoid availability, rent, ownership, amenity, certification, or renovation claims unless already supported.
7. Check that comparison links resolve.
8. Build and inspect the generated page for empty fields or awkward inherited copy.
9. Confirm the page still frames the building as representative decision support, not available inventory.

## Expansion Workflow

To expand this standard:

1. Select a representative building from the canonical collection.
2. Confirm the district relationship and comparison set.
3. Add a `building_brief` object with concise editorial fields.
4. Use only supported facts and clear editorial judgment.
5. Validate that the page does not imply current availability.
6. Build and inspect the generated page at desktop and mobile widths.

Future work can move more Building Brief fields into the Commercial Building Intelligence schema as more markets mature.
