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
- relatedDistricts
- businessTypes
- spaceTypes
- relatedComparisons
- relatedDistrictPages
- relatedCityPage
- relatedLocationBrief
- compassSignals
- featured
- readingTime
- heroSummary
- relatedInsights
- published
- editorReviewed

The model should stay flexible. Rofo Insights should be easy to publish for new Compass Ready metros without forcing a blog-style taxonomy.

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

-> Compass reasoning

-> Editorial opportunity

-> Human review

-> Rofo Insight

-> City pages

-> District pages

-> Comparison pages

-> Insight Hub

-> Location Brief CTA

The editor should confirm that every Insight adds decision value before publication.

## Internal Linking

Each Insight should link to relevant:

- district pages
- city pages
- comparison pages
- the city Insight Hub
- Location Brief intake

Supported city, district, and comparison pages can link back to one featured Insight. One high-quality featured Insight is usually enough; the goal is a useful knowledge network, not page clutter.

## Insight Hubs

Each mature metro can have an Insight Hub at a market URL, for example:

`/commercial-real-estate/CA/san-francisco/insights/`

The hub is not a blog index. It is the canonical editorial destination for Rofo's commercial observations in that market.

Hub pages should:

- introduce the market's Insight collection
- group Insights by category
- show concise cards with headline, summary, reading time, and a Read Insight path
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

Future metros should use the same system once Compass has enough knowledge to support editorial reasoning.
