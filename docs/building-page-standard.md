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

## Expansion Workflow

To expand this standard:

1. Select a representative building from the canonical collection.
2. Confirm the district relationship and comparison set.
3. Add a `building_brief` object with concise editorial fields.
4. Use only supported facts and clear editorial judgment.
5. Validate that the page does not imply current availability.
6. Build and inspect the generated page at desktop and mobile widths.

Future work can move more Building Brief fields into the Commercial Building Intelligence schema as more markets mature.
