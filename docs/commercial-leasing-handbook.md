# Commercial Leasing Handbook

The Commercial Leasing Handbook is Rofo's canonical education system for commercial real estate leasing.

It is not a blog, resource center, or SEO article library. It is product documentation for commercial leasing: a structured knowledge layer that helps businesses understand decisions before they compare spaces, request a Location Brief, or work with a broker.

## Purpose

The handbook should reduce uncertainty for a business owner or operator trying to lease space.

Every topic should answer:

- What does this mean?
- Why does it matter?
- What mistakes should be avoided?
- What should be validated before acting?
- Which related topics should the reader understand next?

## Information Architecture

The first public destination is:

`/commercial-real-estate/lease-guide/`

Initial categories:

- Commercial Leasing
- Location Strategy
- Space Types
- Costs & Budgeting
- Lease Types
- Negotiation
- Touring & Comparing Space
- Working With Brokers
- Glossary

The current article data lives in `_data/commercialLeasingHandbook.js`.

The first topic set includes:

- How Commercial Leasing Works
- Choosing the Right Commercial Location
- How Much Space Does My Business Need?
- NNN vs Gross vs Modified Gross Leases
- CAM Charges Explained
- Letters of Intent Explained
- Tenant Improvements
- Commercial Leasing Timeline
- How to Compare Commercial Spaces
- How Commercial Brokers Help
- Common Commercial Leasing Mistakes

## Page Structure

The handbook hub should:

- explain the system
- group topics by decision area
- provide a concise glossary
- move readers toward Start Your Search when they are ready to apply the knowledge

Each topic should include:

- title
- category
- reading time
- key question
- concise answer
- Rofo Perspective
- What it means
- Why it matters
- Common mistakes
- Validation or comparison guidance
- related topics
- FAQ structured data where appropriate

## Rofo Perspective

`Rofo Perspective` is a reusable editorial callout.

It is not marketing copy. It is judgment.

Use it when Rofo can clarify the practical decision, such as:

- Start with geography before comparing buildings.
- Compare total occupancy cost, not just rent.
- Treat the LOI as the first serious version of the deal.
- A tour should test assumptions, not just collect options.

Use it sparingly. The callout should make the reader more confident, not interrupt the page.

## Internal Linking Strategy

Handbook topics should be reusable across:

- city pages
- district pages
- comparison pages
- space-type pages
- Rofo Insights
- recommendation and Location Brief experiences
- broker workflows
- glossary definitions

Contextual links should answer a reader's next question. Avoid generic "Helpful Resources" modules.

Examples:

- A city page leasing education section can link to `Choosing the Right Commercial Location`.
- A recommendation page can link to `How to Compare Commercial Spaces`.
- A broker introduction flow can link to `How Commercial Brokers Help`.
- A lease-cost explanation can link to `NNN vs Gross vs Modified Gross Leases` and `CAM Charges Explained`.

## Structured Data

The hub uses `Article` and `BreadcrumbList`.

Topic pages use:

- `Article`
- `FAQPage` when FAQ content exists
- `BreadcrumbList` through the shared breadcrumbs partial

Future glossary pages may use `DefinedTerm` or `DefinedTermSet` once the glossary becomes its own destination.

## Editorial Standards

Write for a business owner trying to make a commercial real estate decision.

Use:

- plain language
- concrete tradeoffs
- advisor-quality judgment
- concise explanations
- practical next steps

Avoid:

- SEO filler
- generic market commentary
- invented statistics
- legal advice
- broker sales language
- academic definitions that do not help the decision

## Existing Content Consolidated

The first handbook topic set consolidates and reframes older blog-style guidance:

- `Gross vs NNN Lease` now maps to `NNN vs Gross vs Modified Gross Leases`.
- `How Much Office Space Does a Small Business Need?` now maps to `How Much Space Does My Business Need?`.
- `How to Evaluate Office Space Before You Lease` now maps to `How to Compare Commercial Spaces`.

The older blog URLs remain untouched in this sprint. Future cleanup can add canonical links, redirects, or excerpt links after editorial review.

## Future Expansion

High-value next topics:

- Operating expenses
- Lease escalations
- Renewal options
- Assignment and sublease rights
- Personal guarantees
- Security deposits
- Free rent
- Parking in commercial leases
- Medical office leasing
- Industrial loading and clear height
- Retail visibility and signage
- Restaurant permitting and buildout
- Flex space requirements
- What to ask on a tour
- How to review a lease with an attorney

The handbook should grow slowly. Each new page should answer a real business question and become reusable elsewhere in the product.
