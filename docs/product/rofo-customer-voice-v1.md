---
title: Rofo Customer Voice & Language Contract v1
permalink: false
eleventyExcludeFromCollections: true
---

# Rofo Customer Voice & Language Contract v1

> Every new customer-facing feature must follow the Rofo Customer Voice contract.
>
> Internal contract terminology must never be assumed to be acceptable customer copy.

Rofo should sound like a knowledgeable commercial real-estate advisor who understands the customer's search—not like the software system that produced the answer.

This is a presentation contract. Canonical intelligence may remain precise and machine-oriented. Customer language translates that intelligence without changing evidence, confidence, municipality ownership, recommendation ordering, abstention, or the availability firewall.

## The voice

- **Knowledgeable:** name the market, district, building type, and practical distinction.
- **Clear:** prefer ordinary commercial-real-estate terms over system taxonomy.
- **Useful:** explain what the conclusion means, why it matters, and what happens next.
- **Concise:** state each conclusion once.
- **Confident but calibrated:** say supported things plainly; name the specific fact to confirm when needed.
- **Human:** write as an experienced advisor would speak to an intelligent business owner.

## The writing sequence

Use:

1. **Conclusion** — the useful answer.
2. **Explanation** — the place-specific reason.
3. **Next question** — the decision or property fact that still matters.

Do not lead with evidence systems, classifications, or limitations.

## Internal contract is not customer language

Values such as `INVESTIGATE`, `BOUNDED`, `PUBLIC_CONTEXTUAL`, `OBJECTIVE_ACCESS_READY`, provenance, eligibility, and calibration remain valid internally. Translate them contextually at the presentation boundary. Do not rename canonical enums.

The production path is: canonical intelligence → shared customer presentation projection → market/property facts → customer renderer. Sacramento is a certification fixture, never a voice-architecture special case. A future market using the standard Location Brief contract receives the projection automatically.

Usually omit or translate internal terms such as applicability, bounded, candidate, composition, evidence foundation, reviewed evidence, requirement-specific, projection, resolver, readiness, canonical, abstention, cohort, deterministic, and provenance.

Examples:

- “Reviewed evidence supports warehouse uses” becomes “Warehouse and distribution businesses commonly consider this area.”
- “Bounded City of Sacramento comparison” becomes “This comparison covers Power Inn and Northgate / North Market within Sacramento.” Use that scope sentence only when it helps.
- “Property capabilities require investigation” becomes “We’ll confirm loading, power, parking and permitted use at each building.”
- “Representative environments” becomes “Examples in the area” or “Typical settings,” depending on whether the record is a building or an environment.

Translation is based on meaning. Never use a global string replacement.

## Omission

Do not render a field merely because it exists. Omit “Not provided,” “Not stated,” “Not a priority,” “Unknown,” and empty values unless the absence itself changes the decision. Do not hide a missing loading, power, use, or access fact when it is material to the search.

## Repetition

A Location Brief should not repeat the same district character under its introduction, recommendation card, comparison table, and summary. Comparison tables show differences. Remove rows whose cells are identical or non-material.

## Customer questions

- Recommendation: **Why should I consider this area?**
- Comparison: **How are these locations different?**
- Verification: **What do we still need to confirm?**
- Examples: **What kinds of buildings are here?**
- CTA: **What happens next?**

If a module cannot answer a customer question, reconsider whether it belongs on the surface.

## Preferred vocabulary

Use concrete CRE language: office, retail, warehouse, distribution, production, manufacturing, contractor space, service-industrial, office/warehouse, loading, clear height, power, yard, parking, building size, location, district, corridor, building, and space.

Avoid salesy claims such as perfect, amazing, unbeatable, ideal, and incredible. Avoid unsupported best, superior, definitely, and guaranteed. A precise unknown is better than a defensive paragraph.

## Surface conventions

- District intelligence: What it’s like, Common here, What stands out, Access & location, Example buildings, Worth knowing, Compare with.
- Property cards: About this building, Common in this district, What to confirm.
- Location Briefs: Your search, Areas worth comparing, Why consider it, Worth knowing, Examples in the area, How they differ, What we’ll confirm, Next step.
- Investigate state: explain which details will unlock a useful location comparison. It is a productive next step, not a failure state.
- Access facts: show the infrastructure name and objective relationship. Never expose measurement or eligibility enums.

For two or more locations, open with the most meaningful supported distinction—not a generic statement that the places differ. For one location, use **One area to start with**. When there is no responsible shortlist, use **A little more detail will help narrow the location**; never expose `INVESTIGATE` as the customer outcome.

**Worth knowing** contains location-level considerations only: district breadth, building-stock variation, operating-character tradeoffs, or another meaningful reason to compare the area carefully. Omit it when that material is weak. **What we'll confirm** owns property-level questions such as loading, clear height, power, yard, parking, suite/building configuration, permitted use, office/warehouse mix, and current availability. Do not repeat those checks under every location.

## Review test

For every customer-facing sentence ask:

> Would a good broker actually say this to a client?

If not, rewrite it or omit it.

Machine-readable rules, examples, audit output, and the Sacramento calibration are stored in `data/internal/rofo-customer-voice-v1/`.
