# Rofo Insights

Rofo Insights are concise editorial commercial observations generated from Rofo Compass reasoning and refined by human review.

They are not blog posts, listing summaries, market reports, or SEO filler. They exist to explain why commercial location decisions differ by business type, district, tradeoff, and stage of growth.

## Purpose

Location Briefs answer:

- Where should I locate?
- What markets should I compare?
- What tradeoffs should I validate?

Rofo Insights answer:

- Why does this location decision matter?
- What assumption should a business challenge?
- When is one district stronger than another?
- What commercial signals should shape the decision?

## Content Model

Each Insight should include:

- title
- slug
- summary
- primaryMarket
- primaryDistrict
- category
- collection
- industry
- district
- comparison
- relatedDistricts
- businessTypes
- spaceTypes
- relatedComparisons
- relatedDistrictPages
- relatedBuildings
- relatedCityPage
- relatedInsightHub
- relatedLocationBrief
- compassSignals
- featured
- priority
- readingTime
- heroSummary
- relatedInsights
- futurePopularity
- published
- editorReviewed

The model should stay flexible. Rofo Insights should be easy to publish for new Compass Ready metros without forcing a blog-style taxonomy.

Optional fields such as `collection`, `industry`, `district`, `comparison`, `relatedBuildings`, `priority`, and `futurePopularity` prepare the system for richer Knowledge Center navigation and future engagement metrics. They should remain optional and editorially controlled.

## Knowledge Center Philosophy

San Francisco is the reference implementation for a Rofo commercial knowledge center.

A visitor should be able to start on a city page, district page, comparison page, or Insight and naturally move to the next useful commercial question. The ecosystem should feel like a connected advisory experience rather than a collection of disconnected content pages.

Each page should answer one question:

- City pages: what commercial choices exist in this market?
- District pages: what kind of businesses fit this district?
- Comparison pages: how do two plausible markets differ?
- Insights: why does this commercial decision matter?
- Location Briefs: what should this specific business do next?

The goal is exploration that leads to a better Location Brief, not page volume.

## Editorial Categories

Categories are optional, but they help city hubs organize Insights around business decisions rather than chronology.

Recommended categories:

- Choosing a District
- Growing Companies
- Technology
- Professional Services
- Industrial & Flex
- Medical Office
- Retail
- Commercial Strategy
- Compass Frameworks

Do not force a category when the editorial fit is weak. Categories should help a reader scan the decision pattern behind the Insight.

## Editorial Standards

Insights should:

- sound like advice from an experienced commercial real estate advisor
- explain a real commercial location tradeoff
- connect business needs to district fit
- use concise, direct language
- link to relevant district, city, comparison, and Location Brief pages
- avoid fake precision, rankings, and unsupported statistics

Insights should not:

- invent market data
- imply active listing availability
- summarize listings
- repeat generic neighborhood descriptions
- make unsupported claims about rents, vacancy, or demand
- read like promotional marketing copy

## Headline Guidelines

Insight headlines should create curiosity without becoming clickbait.

Prefer headlines that:

- challenge a common assumption
- show that two nearby districts solve different business problems
- make the reader want the advisor logic behind the claim
- use plain business language

Avoid headlines that:

- promise a single best location
- imply rankings or scores
- overstate certainty
- sound like a generic market report

Good pattern:

- Most companies search buildings first. Rofo starts with geography.
- South Beach and SoMa are close together. They do not solve the same office problem.
- Why Union Square still belongs in some office searches.

## Summary Guidelines

The summary should not merely describe the page. It should introduce the tension.

Summaries should be two to four concise sentences when possible and should:

- name the decision tension
- explain why the assumption is incomplete
- invite the reader into the reasoning

The `heroSummary` can be slightly more expansive than the card summary. It should still stay editorial, not promotional.

## Reading Time

Use `readingTime` when available.

The current Insight format targets about a three-minute read. The reading time is displayed on featured cards and Insight pages to signal that the content is concise and practical.

## Relationship To Compass

Rofo Compass is the internal Commercial Location Intelligence Engine behind the reasoning.

Insights may draw from:

- Commercial Location Knowledge Graph summaries
- space-type fit
- best-for guidance
- tradeoffs
- comparison relationships
- validation questions
- representative commercial environments
- human editorial review

Compass can inspire the observation, but the published Insight should remain customer-facing Rofo language.

## Publishing Workflow

The intended workflow is:

Knowledge Graph

-> Editorial opportunity

-> Insight

-> City Page

-> District Page

-> Comparison Page

-> Representative Buildings

-> Location Brief

The editor should confirm that every Insight adds decision value before publication.

## Internal Linking

Each Insight should link to relevant:

- district pages
- city pages
- comparison pages
- the city Insight Hub
- representative buildings, when existing Rofo building pages support the commercial point
- Location Brief intake

Supported city, district, and comparison pages should link back to relevant Insights and the market Insight Hub. The goal is a useful knowledge network, not page clutter.

Internal links should be editorially useful:

- Link to a district when the Insight explains that district's role.
- Link to a comparison when the reader should evaluate a tradeoff.
- Link to representative buildings only when they illustrate the environment being discussed.
- Link to related Insights when they continue the same commercial question.
- Link to `/find-locations/` when the reader is ready for a personalized Location Brief.

## Interaction Guidelines

Use the same interaction model as the rest of Rofo:

- Titles navigate.
- Buttons perform actions.

Examples:

- Insight titles open Insight pages.
- District titles open district pages.
- Comparison titles open comparison pages.
- Representative building titles open building pages.

Buttons and button-like CTAs should be reserved for action-oriented steps:

- Find My Best Locations
- Generate a Location Brief
- Browse Buildings
- View all San Francisco Insights

Do not add separate "Read Insight" links beneath every Insight title. The title, summary, or card content can be clickable when it represents navigation. Keep hover and focus states clear, understated, and keyboard accessible.

## Insight Hubs

Each mature metro can have an Insight Hub at a market URL, for example:

`/commercial-real-estate/CA/san-francisco/insights/`

The hub is not a blog index. It is the canonical editorial destination for Rofo's commercial observations in that market.

Hub pages should:

- introduce the market's Insight collection
- show a featured Insight
- show newest Insights
- reserve a Most Popular area for future engagement metrics
- group Insights by category
- allow browsing by district
- allow browsing by comparison
- allow browsing by industry
- show concise cards with linked headlines, summary, and reading time
- include a Location Brief CTA
- link back naturally from city, district, comparison, and Insight pages

The San Francisco hub is the reference implementation for future metros.

## Featured Insight Selection

City pages should feature a compact editorial module:

- one primary Insight that explains Rofo's broad market philosophy
- three to five recent or editor-selected Insights
- a link to the city Insight Hub

District pages should feature multiple related Insights when available, using `relatedDistrictPages` as the matching source.

Comparison pages should feature multiple related Insights when available, using `relatedComparisons` as the matching source.

Use `cityHubFeatured` for editor-selected city hub/module priority. This keeps curation explicit and avoids depending on publish order.

## Continue Exploring

Every Insight should end with a Continue Exploring module.

The module should offer a small set of next steps:

- a related district
- a related comparison
- a related Insight
- representative buildings, when available
- Generate a Location Brief

This prevents dead ends and reinforces the commercial knowledge path from reasoning to recommendation.

## Related Insights

Related Insights should help the reader keep following a commercial location question.

Priority:

- same district or first-order alternative
- same city or metro
- same comparison relationship
- shared business type or space type
- shared Compass signals

Use `relatedInsights` to define explicit editorial relationships where the link is important. Future automation can use district, city, comparison, and Compass signal overlap as a fallback.

## CTA Philosophy

Insights demonstrate how Rofo thinks.

Location Briefs personalize that thinking.

Every Insight should end with a clear Location Brief CTA. The CTA should route to `/find-locations/` with market and space type context where practical.

## San Francisco Pilot

The first pilot set focuses on San Francisco office location decisions:

- Why AI startups begin in SoMa - and why some outgrow it
- The mistake companies make when they dismiss Mission Bay
- When a mature company should choose Jackson Square over the Financial District
- Why Union Square still belongs in some office searches
- South Beach and SoMa are close together. They do not solve the same office problem.
- Most companies search buildings first. Rofo starts with geography.
- Not every AI startup belongs in SoMa
- The hidden advantage of Jackson Square for professional firms
- When growing companies outgrow SoMa
- Choosing an office location that helps you hire
- Why proximity is not the same as fit
- Why startups eventually leave SoMa
- Choosing between SoMa and Mission Bay
- When Jackson Square becomes the better executive location
- Why many law firms choose Jackson Square
- Financial District versus Jackson Square after your company matures
- How office needs change between 10 and 100 employees
- What companies misunderstand about a central location
- Why accessibility means different things for different businesses
- How Rofo evaluates business ecosystems
- Why geography matters before buildings
- Why AI companies should compare Mission Bay earlier
- Why finance firms still compare the Financial District with Jackson Square
- Creative companies should not choose SoMa by default

Future metros should use the same system once Compass has enough knowledge to support editorial reasoning.

## Future Roadmap

The Insight system is prepared for:

- future popularity metrics
- collection-level navigation
- industry-specific hubs
- representative-building enrichment
- Insight recommendations based on Compass relationships
- metro-specific Knowledge Centers for Compass Ready markets

Rofo Insights remain a product feature. They should not become a traditional blog or a generic content program.
