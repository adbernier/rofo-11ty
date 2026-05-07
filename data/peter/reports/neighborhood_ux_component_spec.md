# Neighborhood UX Component Specification

This document defines the future Rofo neighborhood and business district page experience at the UX and component level. It is a planning specification only. It should not be treated as implementation-ready frontend code.

Rofo is building commercial location intelligence, not a listings marketplace. The page should help a business understand whether a district fits its people, customers, operations, and brand.

Core principle:

**Businesses lease environments, not just square footage.**

The UX should feel calm, editorial, useful, scanable, modern, business-oriented, and trustworthy. It should not feel like a broker spam page, dashboard, or listing grid.

## 1. Page Experience Goals

### What Users Should Understand in 5 Seconds

Users should immediately understand:

* What district they are viewing.
* What city it belongs to.
* What kind of business environment it represents.
* Whether it might fit their business.
* That Rofo is helping them compare location fit, not browse stale listings.

The first screen should answer:

> Is this even the kind of place my business should consider?

### What Users Should Understand in 20 Seconds

Users should be able to scan:

* Best-fit business types.
* Core district identity.
* Main tradeoffs.
* Dominant workspace or building pattern.
* Nearby districts worth comparing.
* Whether the page is useful enough to continue reading.

The page should provide enough structured context that a tenant can say:

> This might fit us because of client access, transit, and professional image, but we should also compare Jackson Square and SoMa.

### What Users Should Understand in 2 Minutes

Users should understand:

* Why companies choose the district.
* What building styles and workspace environments are common.
* What transit, parking, and access tradeoffs matter.
* How daily employee and client experience may affect the decision.
* Which nearby districts offer different tradeoffs.
* What representative buildings say about the commercial fabric.
* How to ask Rofo for help without expecting a live inventory feed.

### Decision Support

Neighborhood pages should support decisions before a tenant gets deep into property selection. They should help users narrow the location search, not overwhelm them with space-level details.

The user should leave with clearer answers to:

* Should we search here?
* Who does this area usually work for?
* What nearby areas should we compare?
* What building environment should we expect?
* What questions should we ask before touring?

### Scanability

The page must work for users who skim. The content should be layered:

* headline level for immediate orientation
* chips and signal cards for quick pattern recognition
* short paragraphs for context
* deeper editorial sections for committed readers
* CTA only after sufficient context

### Layered Information Density

Avoid a flat article layout. The page should use a mix of:

* identity summary
* chips
* signal strips
* comparison cards
* representative building cards
* short editorial blocks
* compact CTA module

The page should feel like a decision-support interface with editorial depth.

### Comparison-Driven UX

Most tenants should be encouraged to compare districts. The page should normalize comparison:

* Financial District versus Jackson Square
* Financial District versus SoMa
* Downtown Oakland versus Jack London Square
* North San Jose versus Sunnyvale

Comparison cards should explain the tradeoff, not just link to another page.

## 2. Page Hierarchy

The ideal section order should move from identity to fit, then environment, then comparisons, then action.

### 1. Hero / Identity

Purpose:

* Establish district identity.
* Make the page feel editorial and specific.
* Give users immediate context.

Ideal content density:

* 1 headline
* 1 short summary paragraph
* 3 to 5 best-fit bullets or chips
* 2 to 4 nearby comparison links

Mobile considerations:

* Keep the headline short.
* Show only the most important fit chips above the fold.
* Avoid large hero media that pushes the useful content too far down.

Visual versus text:

* Visual: hero card, map hint or neighborhood image if available.
* Text: identity summary and fit chips.

Structured versus editorial:

* Structured: district label, city, type, best-fit chips.
* Editorial: one short identity paragraph.

### 2. Best Fit For

Purpose:

* Help users self-identify quickly.
* Translate district identity into tenant types.

Ideal content density:

* 4 to 8 concise chips or short bullets.
* Optional one-sentence explanation.

Mobile considerations:

* Chips should wrap cleanly.
* Avoid dense two-column lists on small screens.

Visual versus text:

* Visual: chips or compact cards.
* Text: concise tenant categories.

Structured versus editorial:

* Structured data should power the chips.
* Editorial copy can explain why the fit matters.

### 3. Business Environment Signals

Purpose:

* Summarize the district in a compact, scanable signal strip.

Recommended signals:

* Business identity
* Building environment
* Common space types
* Access pattern
* Nearby comparisons
* Historical activity intensity

Ideal content density:

* 3 to 5 signal cards.
* Each card should have a label, value, and one short note.

Mobile considerations:

* Stack signal cards.
* Keep each card short enough to read in one glance.

Visual versus text:

* Visual: compact signal cards.
* Text: label, value, note.

Structured versus editorial:

* Structured: values and labels.
* Editorial: short note.

### 4. Why Businesses Choose This Area

Purpose:

* Explain business motivation and decision logic.

Ideal content density:

* 2 to 4 short paragraphs.
* 3 to 5 decision factors.

Mobile considerations:

* Use short paragraphs and bullets.
* Avoid long uninterrupted prose.

Visual versus text:

* Mostly editorial text.
* Optional decision-factor cards.

Structured versus editorial:

* Editorial section, informed by structured signals.

### 5. Building Environment

Purpose:

* Explain what kinds of buildings and workspaces dominate.

Ideal content density:

* 1 short intro paragraph.
* 3 to 5 workspace environment cards.
* Optional representative building preview.

Mobile considerations:

* Cards should stack.
* Avoid image-heavy cards if images are not strong.

Visual versus text:

* Visual: workspace cards, simple icons, building photo only if reviewed.
* Text: building pattern and tenant fit.

Structured versus editorial:

* Structured: building type, representative building signal, average floors if reliable.
* Editorial: how the environment affects fit.

### 6. Transit / Accessibility

Purpose:

* Help tenants evaluate how people, clients, customers, and vendors access the district.

Ideal content density:

* 4 small cards:
  * regional transit
  * employee commute
  * client and visitor access
  * parking and loading tradeoffs

Mobile considerations:

* Stack cards.
* Keep cautions visible.

Visual versus text:

* Visual: icon cards.
* Text: short practical notes.

Structured versus editorial:

* Structured only when verified.
* Editorial when general and cautious.

### 7. Daily Experience

Purpose:

* Explain employee and client experience around the workday.

Ideal content density:

* 1 short paragraph.
* 4 to 6 amenity categories.

Mobile considerations:

* Use compact bullets or chips.
* Avoid large lifestyle imagery.

Visual versus text:

* Visual: amenity chips or simple cards.
* Text: practical business implications.

Structured versus editorial:

* Structured when amenity categories are reviewed.
* Editorial for daily-experience explanation.

### 8. Nearby District Comparisons

Purpose:

* Help tenants compare realistic alternatives.

Ideal content density:

* 3 to 5 comparison cards.
* Each card should explain when to choose the related district.

Mobile considerations:

* Cards stack.
* Related district links should be large and easy to tap.

Visual versus text:

* Visual: comparison cards.
* Text: tradeoff explanation.

Structured versus editorial:

* Structured: relationship type and related district.
* Editorial: reason and tenant fit.

### 9. Representative Buildings

Purpose:

* Show the building fabric without implying current inventory.

Ideal content density:

* 4 to 8 representative building cards.
* Each card should include name, address, and why it is representative.

Mobile considerations:

* Avoid dense listing-style cards.
* No price, suite, or stale availability fields.

Visual versus text:

* Visual: card list with optional reviewed image.
* Text: building name, address, representative reason.

Structured versus editorial:

* Structured: building name, address, historical activity bucket, assignment confidence.
* Editorial: why it helps explain the district.

### 10. Common Space Types

Purpose:

* Connect district identity to relevant Rofo space-type concepts.

Ideal content density:

* 3 to 5 space-type cards or pills.
* Each should explain tenant fit in one or two sentences.

Mobile considerations:

* Use a simple stacked list.
* Keep links tappable.

Visual versus text:

* Visual: pills or cards.
* Text: fit explanation.

Structured versus editorial:

* Structured: recommended space types.
* Editorial: district-specific fit.

### 11. Leasing Context

Purpose:

* Explain historical activity and tradeoffs without exposing stale data.

Ideal content density:

* 2 to 4 short paragraphs.
* Optional internal-only signals shown in tenant-safe language.

Mobile considerations:

* Keep it compact.
* Avoid data-table presentation.

Visual versus text:

* Mostly editorial.
* Optional simple context card.

Structured versus editorial:

* Structured signals should inform the copy.
* Editorial judgment controls what is published.

### 12. Soft CTA

Purpose:

* Convert a qualified reader into a tenant inquiry.

Ideal content density:

* Short headline.
* 1 paragraph.
* Lead form or link to a lead form.

Mobile considerations:

* CTA should be easy to complete.
* Avoid sticky or aggressive lead-gen patterns.

Visual versus text:

* Visual: calm CTA module.
* Text: help-oriented language.

Structured versus editorial:

* Structured hidden metadata later.
* Editorial CTA copy.

## 3. Component Library

### Identity Hero

Purpose:

* Establish district, city, identity, and fit.

Information hierarchy:

1. District name
2. City and state
3. District type
4. Identity summary
5. Best-fit chips
6. Soft CTA or nearby comparison links

Scan behavior:

* User should understand the district type without scrolling.

Ideal card density:

* One focused hero card, not a crowded dashboard.

Desktop behavior:

* Two-column layout can work:
  * left: identity and fit
  * right: map, image, or signal card

Mobile behavior:

* Stack identity first, then chips, then comparison link.

### Best-Fit Chips

Purpose:

* Let users identify whether the district fits their business type.

Information hierarchy:

1. Tenant type
2. Optional short qualifier

Scan behavior:

* Chips should be readable in a quick skim.

Ideal card density:

* 4 to 8 chips.

Desktop behavior:

* Inline wrapping row.

Mobile behavior:

* Two-column or wrapped chips depending on label length.

### Environment Signal Strip

Purpose:

* Summarize important decision signals in one glance.

Information hierarchy:

1. Label
2. Value
3. Short note

Possible cards:

* Business identity
* Common workspace pattern
* Best-fit users
* Nearby alternatives
* Historical activity signal

Scan behavior:

* User should read this like a snapshot, not a report.

Ideal card density:

* 3 to 5 cards.

Desktop behavior:

* Horizontal grid.

Mobile behavior:

* Stacked cards or two-column if very compact.

### Nearby District Comparison Cards

Purpose:

* Encourage comparison-driven exploration.

Information hierarchy:

1. Related district name
2. Relationship type
3. When to compare it
4. Link to district if available later

Scan behavior:

* User should know why each alternative matters.

Ideal card density:

* 3 to 5 cards.

Desktop behavior:

* Two or three columns.

Mobile behavior:

* One column, large tap targets.

### Representative Building Cards

Purpose:

* Show district building fabric without becoming a listing card.

Information hierarchy:

1. Building name
2. Address
3. Representative reason
4. Optional historical activity label

Scan behavior:

* User should understand the type of buildings in the district.

Ideal card density:

* 4 to 8 cards.

Desktop behavior:

* Compact card grid or editorial list.

Mobile behavior:

* Stacked cards.

Important rule:

* No price, suite, availability, or live listing treatment.

### Transit / Accessibility Grid

Purpose:

* Turn access into practical tenant decision factors.

Information hierarchy:

1. Access category
2. Practical implication
3. Caution or tradeoff

Scan behavior:

* User should quickly understand access strengths and limits.

Ideal card density:

* 4 cards.

Desktop behavior:

* Two by two grid.

Mobile behavior:

* Stack cards.

### Workspace Environment Cards

Purpose:

* Explain building styles and workspace fit.

Information hierarchy:

1. Environment type
2. Who it fits
3. What to check

Examples:

* High-rise office tower
* Historic downtown building
* Boutique office
* Creative office
* Flex or light industrial

Scan behavior:

* User should see how building type changes fit.

Ideal card density:

* 3 to 5 cards.

Desktop behavior:

* Card row or grid.

Mobile behavior:

* Stacked cards with short copy.

### Space-Type Pills

Purpose:

* Connect district context to Rofo space-type pages.

Information hierarchy:

1. Space type
2. Fit note

Scan behavior:

* User should know which space types are relevant here.

Ideal card density:

* 3 to 5 pills or compact cards.

Desktop behavior:

* Inline with optional descriptions.

Mobile behavior:

* Stacked list if descriptions are present.

### Soft CTA Module

Purpose:

* Capture interest without implying live inventory.

Information hierarchy:

1. Help-oriented headline
2. Simple explanation
3. Lead form or button
4. Trust note

Scan behavior:

* User should feel invited, not pressured.

Ideal card density:

* One focused module.

Desktop behavior:

* Two-column block can work:
  * left: trust and explanation
  * right: simple form

Mobile behavior:

* Stack explanation, then form.

Recommended language:

> Tell us what kind of space you need and Rofo can help you compare this district with nearby options.

Avoid:

* View available listings.
* Claim your space.
* Exclusive inventory.

### Related Neighborhood Links

Purpose:

* Create a clean internal discovery graph.

Information hierarchy:

1. District name
2. City
3. Relationship reason

Scan behavior:

* Links should feel like useful next steps.

Ideal card density:

* 4 to 6 links.

Desktop behavior:

* Compact row or grid.

Mobile behavior:

* Full-width list items.

## 4. Scanability Principles

Neighborhood pages are decision-support interfaces, not articles. They can contain editorial writing, but the user should never face a wall of text.

### Short Paragraphs

Use 2 to 4 sentence paragraphs. Break long explanations into:

* decision factors
* examples
* comparison cards
* tenant questions

### Bullet Density

Use bullets when the user is comparing or self-identifying.

Good places for bullets:

* best fit businesses
* what to check
* tenant tradeoffs
* access considerations
* common space types

Avoid turning every section into bullets. The page still needs editorial flow.

### Card Usage

Cards should support scanning and comparison. They should not become decorative clutter.

Use cards for:

* best-fit groups
* signals
* nearby comparisons
* building examples
* workspace types
* access tradeoffs

Avoid nested cards and overly dense card grids.

### Progressive Disclosure

Put the most useful context first. Deeper details can appear later or inside expandable components once there is enough content quality.

Potential expandable areas:

* detailed building notes
* full nearby comparison explanations
* richer transit details
* additional representative buildings

Do not hide critical identity or fit information.

### Avoiding Walls of Text

Every section should have a visible anchor:

* heading
* summary line
* chips or cards
* short bullets

If a section exceeds 250 to 300 words, it should probably be split into multiple modules.

## 5. Visual Direction

The visual language should feel calm, editorial, modern, understated, and trustworthy.

### Whitespace

Use generous whitespace between major sections. The page should feel like a guide, not a CRM dashboard.

Recommendations:

* Larger spacing between sections.
* Moderate spacing inside cards.
* Avoid cramped grids.
* Let comparison modules breathe.

### Typography Hierarchy

Recommended hierarchy:

* clear H1 for district identity
* short section headings
* compact card headings
* readable body copy
* small labels for metadata

Avoid oversized marketing-style typography after the hero.

### Card Density

Cards should feel purposeful:

* 3 to 5 signal cards
* 3 to 5 comparison cards
* 4 to 8 representative building cards
* 3 to 5 space-type cards or pills

Do not show dozens of cards. This is not a listings page.

### Icon Usage

Use subtle icons only when they help scanning:

* transit
* parking
* bike access
* client access
* office
* retail
* coworking
* nearby comparison

Icons should not replace clear text.

### Image Usage

Use images only when they improve district understanding:

* district street scene
* reviewed building exterior
* map-like visual
* skyline or business district view

Avoid:

* generic stock photos
* dark atmospheric hero images
* tourist imagery that does not help business decision-making
* photos that imply a specific building has current availability

### Neighborhood Imagery Style

Imagery should show the commercial environment:

* building scale
* street context
* office district feel
* storefront or mixed-use character
* transit or access context where relevant

The image should help the user understand what it feels like to operate a business there.

## 6. Internal Linking UX

Internal links should help the user compare location options and continue the decision journey.

### Nearby District Comparisons

Nearby district links should appear as comparison cards, not a plain link farm.

Each card should answer:

* What is the related district?
* Why compare it?
* What kind of tenant might prefer it?

Relationship types:

* adjacent
* comparable
* nearby alternative
* same tenant search pattern

### Adjacent Neighborhood Exploration

Adjacent districts should be shown near the middle of the page, after the user understands the current district. This keeps comparison useful instead of distracting.

### City Page Connections

Neighborhood pages should link to the parent city page as the transactional city hub.

Use when:

* the user wants broader city options
* the district is too narrow
* the user is ready to submit a requirement for the city

### Market Guide Connections

Neighborhood pages should link to the city market guide for broader education:

* city-level rent context
* leasing patterns
* nearby market comparisons
* market overview

### Space-Type Page Connections

Only link relevant space types:

* Financial District: office, coworking, retail/service
* Dogpatch: flex, industrial, office, retail
* Mission Bay: office, medical office, lab, retail
* North San Jose: office, industrial, flex, coworking

Avoid linking every district to every possible page.

### Representative Building Linking Philosophy

Representative building links should be conservative.

Only link when:

* there is a canonical Rofo building page
* the building record is approved enough for public context
* the link does not imply live availability

Building cards should say representative building, not listing.

## 7. Mobile Experience

Mobile is critical because tenant decision-makers often scan links from email, search, or messages.

### Stacked Card Hierarchy

Recommended mobile order:

1. Hero identity
2. Best-fit chips
3. Signal strip
4. Nearby comparison quick links
5. Why businesses choose this area
6. Building environment
7. Transit and access
8. Daily experience
9. Representative buildings
10. Soft CTA

### Collapse Behavior

Potential collapsible sections:

* additional representative buildings
* deeper transit notes
* detailed nearby comparisons
* additional common space type details

Do not collapse:

* district identity
* best fit
* primary comparison links
* CTA

### Quick-Scan Modules

Mobile modules should be designed for thumb scanning:

* large tap targets
* short labels
* one thought per card
* no dense tables
* no wide grids

### Preserving Identity on Small Screens

The hero should avoid pushing identity below an image. Text context should come before decorative visuals.

Use:

* district name
* city
* district type
* 3 best-fit chips
* one-sentence summary

### Avoiding Overload

Mobile pages should avoid:

* long intro paragraphs
* multi-column card grids
* overdesigned maps
* large building card lists before context
* aggressive lead forms too early

The CTA should appear after context, with a softer earlier link or button available in the hero.

## 8. Content System Philosophy

### Editorial Layer Overrides Automation

Automation can suggest candidates, but editorial judgment defines the public district identity.

Examples:

* Downtown Oakland may consolidate several legacy labels.
* South San Francisco Biotech Corridor may combine Oyster Point, Lindenville, and The East Side.
* SoMa may consolidate SOMA and South of Market.

### Representative Buildings Are Examples, Not Listings

Representative buildings should help explain the commercial fabric.

They should not show:

* suite numbers
* current availability
* rent
* stale listing descriptions
* broker claims from old exports

### Listing Count Is Historical Activity Signal Only

`listing_count` can help identify where Rofo has historical leasing activity. It must not be presented as current inventory.

Tenant-safe language:

* historical activity signal
* representative building pattern
* commercial intensity
* past Rofo activity

Avoid:

* available spaces
* active listings
* current options
* vacancy count

### AI Assists, But Does Not Define Neighborhood Identity

AI can help draft summaries, extract patterns, and propose labels, but it should not decide public district identity alone.

Human review should confirm:

* district label
* boundary logic
* representative buildings
* nearby comparisons
* tenant fit
* claims about access or amenities

### Usefulness Over Volume

Do not publish every possible neighborhood. A smaller number of useful district pages is better than a large set of thin pages.

### Quality Over URL Count

A page should only exist if it helps a tenant make a decision. If the data does not support a differentiated district story, defer it.

## 9. Implementation Guidance

This section describes what should eventually become reusable implementation pieces. It is not a request to build them now.

### Future Nunjucks Partials

Potential reusable partials:

* `neighborhood/identity-hero.njk`
* `neighborhood/best-fit-chips.njk`
* `neighborhood/environment-signals.njk`
* `neighborhood/workspace-environment.njk`
* `neighborhood/accessibility-grid.njk`
* `neighborhood/daily-experience.njk`
* `neighborhood/nearby-comparisons.njk`
* `neighborhood/representative-buildings.njk`
* `neighborhood/space-types.njk`
* `neighborhood/soft-cta.njk`

### What Should Remain Curated

Keep these curated:

* canonical district label
* representative identity
* tenant intent
* page candidacy
* rollout priority
* nearby comparison reasoning
* section-specific editorial summaries

### What Should Be Structured

Structure these fields:

* city
* state
* slug
* district type
* recommended space types
* nearby districts
* relationship types
* representative building IDs
* assignment confidence
* historical activity bucket
* CTA metadata

### Content Enrichment From Historical Listing Descriptions

Historical listing descriptions may be useful for extracting:

* building style language
* workspace descriptors
* tenant-fit language
* amenity mentions
* parking mentions
* transit mentions
* access patterns

Rules:

* extract signals, not stale claims
* require review before publishing
* do not reuse old listing copy directly
* do not expose suite-level details

### Future Enrichment Ideas

Building style extraction:

* high-rise
* historic
* boutique
* creative office
* industrial/flex
* campus-like

Transit signals:

* BART nearby
* Muni nearby
* ferry access
* Caltrain access
* highway access

Parking signals:

* structured parking
* street parking constraints
* suburban parking advantage
* visitor parking importance

Amenity clustering:

* coffee and lunch
* hotels
* gyms
* meeting places
* business services

Tenant-fit semantics:

* client-facing
* employee commute-sensitive
* retail/service
* technology team
* professional services
* R&D or lab-adjacent
* flex/production

Architecture cues:

* floorplate size
* tower versus low-rise
* historic character
* lobby experience
* storefront pattern
* warehouse character

## 10. Prototype Implementation Order

Recommended first five prototypes:

1. Financial District, San Francisco
2. Jackson Square, San Francisco
3. SoMa, San Francisco
4. Downtown Oakland
5. Jack London Square

### Why Financial District First

The Financial District has clear business identity, strong historical activity signals, strong tenant search intent, and recognizable representative buildings. It is the best test for a professional office district page.

### Why Jackson Square Second

Jackson Square is adjacent to the Financial District but has a more boutique building and tenant identity. It is useful for testing nearby comparison UX.

### Why SoMa Third

SoMa tests a broader creative, technology, and flexible workspace district. It will require careful consolidation of legacy labels but offers strong comparison value.

### Why Downtown Oakland Fourth

Downtown Oakland tests the East Bay version of a central business district. It also tests how to consolidate overlapping legacy labels into one tenant-friendly district identity.

### Why Jack London Square Fifth

Jack London Square tests a more differentiated waterfront office, retail, and service district. It is useful for validating pages that are not just traditional downtown office environments.

## Final Product Guardrail

The neighborhood UX should help users compare business environments. It should not become a stale inventory browser.

If a component starts to feel like a listings grid, remove or reframe it.
