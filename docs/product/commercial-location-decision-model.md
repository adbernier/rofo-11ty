# Commercial Location Decision Model

**Status:** Product framework  
**Owner:** Product  
**Audience:** Engineering, Editorial, Design, AI/Codex  
**Related document:** `docs/product/rofo-product-experience-vision.md`

---

## Purpose

This document defines how Rofo should help a business create a credible shortlist of commercial locations.

Rofo is a top-of-funnel decision-support product.

It is not intended to select a lease, replace detailed property diligence, or eliminate the need for a broker.

Rofo should help users answer:

> Where should we begin looking, and why?

The intended output is a defensible shortlist of locations that a user can:

- refine interactively
- discuss with colleagues
- save or share
- use to begin a productive conversation with a broker

---

## Core Product Principle

**Facts define eligibility. Priorities determine ranking.**

Rofo should not ask questions merely to collect information.

Every input must do at least one of the following:

1. Define the relevant search universe.
2. establish a meaningful geographic or operational constraint
3. change the ranking of candidate locations
4. improve the explanation behind the shortlist

If an input does not materially affect the recommendation, it should not be part of the core experience.

---

## Product Model

The recommendation process consists of five stages:

1. Core facts
2. Initial consideration set
3. Optional constraints and priorities
4. Evolving district ranking
5. Refined shortlist and Location Brief

The experience should feel interactive.

The recommendation should become visibly more useful as Rofo learns more.

It should not feel like a form that withholds the result until submission.

---

# 1. Core Facts

Core facts provide enough information for Rofo to establish an initial consideration set.

For the first implementation, the required facts are:

## City or market

Defines the primary geographic context.

Examples:

- San Francisco
- Oakland
- Denver
- Seattle

A user may begin with a specific city without claiming that the city itself is Rofo's recommendation.

When a user chooses San Francisco, Rofo should help determine which San Francisco districts deserve consideration.

It should not simply recommend San Francisco back to the user.

## Space type

Selects the appropriate decision model.

Examples:

- Office
- Industrial
- Flex
- Retail
- Medical
- Coworking

Different space types require different questions, structured attributes, and ranking logic.

The interaction framework may be shared, but the decision criteria must be space-type specific.

## People or operational scale

Users may not know their required square footage.

Prefer questions they can answer naturally, such as:

- current headcount
- expected regular occupancy
- expected growth
- operating model
- number of locations or service areas

Rofo may estimate an appropriate size range from this information.

Exact square footage can remain optional.

---

# 2. Initial Consideration Set

City and space type should produce an initial set of credible locations.

This is not yet a precise recommendation.

It is the set of districts or nearby submarkets that Rofo believes are worth evaluating based on the limited information available.

Example:

> Based on an office search in San Francisco, these are the primary district paths worth exploring.

The initial set should be:

- credible
- intentionally curated
- relevant to the selected space type
- broad enough to expose meaningful alternatives
- small enough to understand

A normal starting range is approximately four to seven candidates, depending on the market.

Large markets may require submarket groupings rather than every named district.

## Do not show every district by default

Showing every district creates noise and implies that Rofo has not added intelligence.

The initial set should come from a curated city-by-space-type model.

## Do not imply false precision

With only city and space type, Rofo should not present a highly confident numbered ranking.

Appropriate language includes:

- Starting districts
- Initial consideration set
- Districts worth exploring
- Current candidates

Numbered rankings become more appropriate after the user provides meaningful constraints and priorities.

---

# 3. Constraints

Constraints represent things the user already knows or boundaries they do not want Rofo to ignore.

Constraints shape the eligible geography more strongly than ordinary preferences.

Examples:

- We want to remain near Jackson Square.
- We prefer locations north of Market Street.
- Most employees commute from Marin.
- We need access to the South Bay.
- We want to remain near UCSF.
- We only want to consider the East Bay.
- We need to be close to a major freeway.
- We must accommodate truck access.
- We need convenient patient parking.

Constraints should normally be optional.

Rofo should solve common scenarios well without attempting to model every possible geographic condition.

## Geographic anchors

Users may identify a district, landmark, corridor, city, or other known location.

Example:

> We are considering Jack London Square.

Rofo should use this as an anchor and evaluate:

- the selected location
- adjacent districts
- nearby substitutes
- alternatives with similar characteristics

This enables guidance such as:

> Because you are considering Jack London Square, Alameda and Emeryville may also be worth evaluating.

## Commute orientation

A commute origin may influence the ranking without acting as an absolute exclusion.

Examples:

- Marin
- East Bay
- Peninsula
- South Bay
- downtown transit hubs

Rofo should explain the effect:

> Prioritizing employees commuting from Marin increases the relevance of northern San Francisco districts and locations with easier Golden Gate access.

---

# 4. Priorities

Priorities represent tradeoffs.

They determine how eligible districts should be ranked.

Users should be able to provide as many or as few priorities as they understand.

The experience should not require the user to select exactly three.

The number of selected priorities is less important than whether each priority meaningfully affects the recommendation.

Examples for office include:

- employee commute
- public transit
- parking
- cost sensitivity
- client access
- district image
- walkability
- restaurants and amenities
- growth flexibility
- modern building environment
- creative character
- quiet professional setting
- technology ecosystem
- financial services ecosystem
- life-sciences ecosystem
- access to outdoor space

Priority questions should help users understand their own tradeoffs.

They should not feel like arbitrary preference collection.

---

# 5. Evolving Recommendation

The recommendation should update as the user adds or changes inputs.

This is the central interactive product experience.

The user should be able to see:

- which districts moved
- which districts entered consideration
- which districts became less relevant
- why the ranking changed

Example:

> Mission Bay moved ahead because you prioritized public transit, growth flexibility, and a modern office environment.

Another example:

> Alameda entered the shortlist because parking, lower-rise buildings, and access from Oakland became more important.

## Avoid unnecessary hard removal

Districts should not disappear merely because they rank lower.

Lower-ranked candidates can move into:

- Other possibilities
- Worth considering
- Lower-priority alternatives

Hard removal should be reserved for:

- true incompatibility
- an explicit user constraint
- a space-type mismatch
- a material operational conflict

## Recommendation stages

### Starting set

Based primarily on city and space type.

The system presents credible candidates without pretending to know the best fit.

### Emerging ranking

After several meaningful signals.

The system begins ordering candidates and explaining why some are separating.

### Refined shortlist

After sufficient facts, constraints, or priorities.

The system identifies a manageable shortlist and explains the role of each location.

Example:

1. Best overall fit
2. Strong lower-cost alternative
3. Best option for client access
4. Adjacent market worth considering

---

# 6. Recommendation Confidence

Confidence should reflect how much relevant information Rofo has received.

It should not be presented as unsupported certainty.

A useful confidence model may communicate:

- what Rofo currently knows
- which signals influenced the ranking
- what additional information could improve it

Example:

**Current recommendation reflects:**

- city
- space type
- team size
- commute priorities
- client access
- growth plans

**Could be refined further with:**

- parking requirements
- cost sensitivity
- preferred building environment

Confidence is transparency about the completeness of the profile.

It is not a marketing claim.

---

# 7. The Shortlist

Rofo's primary top-of-funnel deliverable is a credible shortlist.

The shortlist should normally contain approximately three to five locations, depending on market structure and user inputs.

Each shortlisted location should have a clear role.

For example:

- strongest overall fit
- best value alternative
- strongest transit option
- strongest client-facing option
- nearby alternative the user may not have considered

The shortlist should be useful even if the user does not immediately contact a broker.

It should be suitable for:

- internal discussion
- sharing with a colleague
- saving for later
- beginning a market review
- briefing a broker

---

# 8. Location Brief

The Location Brief captures the refined recommendation.

It should not be generated as though a sophisticated recommendation exists when Rofo only knows a city and space type.

The brief should include:

- known business facts
- relevant constraints
- selected priorities
- recommended shortlist
- reasoning for each location
- meaningful comparisons
- tradeoffs
- nearby alternatives
- representative buildings
- questions to validate
- suggested next steps

The Location Brief should clearly distinguish between:

- what the user told Rofo
- what Rofo inferred
- what Rofo recommends
- what still needs validation

---

# 9. Broker Handoff

The broker receives the shortlist and the context behind it.

Rofo should hand off:

- business facts
- known constraints
- selected priorities
- district shortlist
- reasoning
- representative building context
- unresolved questions

The broker's role is to:

- validate current market conditions
- identify available properties
- confirm rents and economics
- arrange tours
- test building-specific assumptions
- negotiate and execute

The broker should not need to restart discovery from zero.

---

# 10. Space-Type Models

The interaction structure is shared across space types:

Facts

→ Initial consideration set

→ Constraints

→ Priorities

→ Evolving ranking

→ Shortlist

→ Location Brief

However, each space type requires its own decision dimensions.

## Office

Potential dimensions include:

- employee commute
- transit
- parking
- client access
- cost
- district image
- amenities
- growth flexibility
- building character
- industry ecosystem

## Industrial

Potential dimensions include:

- freeway access
- loading
- truck circulation
- clear height
- labor access
- outdoor storage
- proximity to customers
- port or airport access
- power
- zoning compatibility

## Flex

Potential dimensions include:

- loading
- office quality
- employee access
- customer access
- parking
- freeway proximity
- light manufacturing suitability
- growth flexibility

## Retail

Potential dimensions include:

- foot traffic
- visibility
- customer demographics
- parking
- co-tenancy
- tourism
- daytime population
- evening activity
- neighborhood identity
- delivery access

## Medical

Potential dimensions include:

- patient access
- parking
- transit
- ground-floor access
- nearby hospitals
- referral networks
- demographics
- building accessibility
- signage and visibility

## Coworking

Potential dimensions include:

- commute coverage
- neighborhood appeal
- transit
- amenities
- flexibility
- client access
- professional image
- team distribution

These lists are starting hypotheses, not final scoring models.

Each space type should be developed and validated separately.

---

# 11. Structured District Data

The recommendation system should use explicit district attributes rather than unsupported generative guesses.

Each district may include structured evaluations for dimensions such as:

- space-type relevance
- transit
- parking
- cost
- client access
- employee accessibility
- district character
- building types
- amenities
- industry ecosystems
- growth options
- nearby alternatives
- geographic relationships

Scores should be supported by editorial market knowledge and explainable source data.

The system should be able to state why a district moved in the ranking.

---

# 12. Editorial Control

The initial consideration set and decision dimensions are editorial product decisions.

They should not be generated blindly.

For each city and space type, Rofo should maintain:

- a curated starting set
- meaningful comparison dimensions
- known nearby alternatives
- district relationships
- exclusion conditions
- explanation language
- confidence requirements

Automation may assist with ranking, but editorial structure defines what constitutes a credible recommendation.

---

# 13. Initial Implementation Scope

The first model should focus on:

**Market:** San Francisco  
**Space type:** Office

This initial model should establish:

1. The starting district consideration set.
2. The office-specific facts.
3. Supported geographic constraints.
4. Office priority dimensions.
5. District attribute definitions.
6. Ranking behavior.
7. Explanation behavior.
8. Shortlist criteria.
9. Confidence states.
10. Location Brief output.

Do not attempt to support every city and every space type before validating the model.

The San Francisco office implementation should serve as the reference model for broader expansion.

---

# 14. Product Guardrails

## Do not recommend the user's input back to them

If a user selects San Francisco, recommending San Francisco is not meaningful.

Rofo should help make the next decision within or around that market.

## Do not claim more precision than the available inputs support

Use a starting set before presenting a confident ranking.

## Do not require users to know brokerage terminology

Prefer headcount and growth expectations over mandatory square footage.

## Do not ask questions that do not change the outcome

Every core question must influence eligibility, ranking, explanation, or confidence.

## Do not hide the recommendation until the end

Allow the user to see and refine the evolving shortlist.

## Do not make broker contact a requirement for receiving value

The shortlist and Location Brief should be useful and shareable independently.

## Do not attempt to replace market validation

Real-time availability, pricing, property diligence, tours, and negotiations remain part of the broker handoff.

---

# Success Standard

Rofo succeeds when a user can say:

> I understand which locations deserve further investigation, why they fit, what the tradeoffs are, and what I should discuss with my broker or colleagues.

The product does not need to produce the final real estate decision.

It needs to create a shortlist worth acting on.

---

# Guiding Principle

**Rofo turns business facts, geographic constraints, and ranked priorities into an explainable shortlist of commercial locations.**

The recommendation should become visibly smarter as the user provides more information.