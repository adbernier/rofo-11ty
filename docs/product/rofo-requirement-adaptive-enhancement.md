# Rofo Requirement Adaptive Enhancement

Sprint 8 adds four canonical dimensions and improves existing activity, logistics, collaboration, growth, and delivery paths. It does not create a second taxonomy or pull detailed property diligence into the Location Requirement.

## Question decisions

| Question | Change | Downstream effect |
| --- | --- | --- |
| What will your team actually do in the space? | Improved existing Industrial/Flex activity question | Applicability, Universal projection, certified composition where already supported, handoff |
| Vehicle/delivery type | Improved existing logistics question | Operational Access, investigation topics, handoff |
| Loading form | New conditional | Building functionality, property investigation, handoff |
| Broad use mix | New conditional | Industrial/Flex interpretation, Brief framing, handoff |
| Customer-facing priority | New conditional | Flex customer environment, investigation, handoff |
| Visible storefront and signage | New Retail core question | Storefront dimension, investigation, handoff |
| Retail delivery/service | New conditional | Service Access, property investigation, handoff |
| Office working pattern | New Office core question using an existing dimension | Configuration and workplace framing |
| Office growth horizon | New Office core question using an existing dimension | Configuration, flexibility, investigation |

Signage is combined with storefront priority. Fleet count, customer geography, client frequency, activity exceptions, and property-stage technical screening are reused rather than duplicated.

## Canonical additions

- `retail.property.storefront_priority`
- `industrial.loading.form`
- `industrial.operations.use_mix`
- `industrial.customer.visit_priority`

Office working pattern uses `office.workplace.meetings_collaboration`; growth uses `universal.growth.future_state`; vehicles use `industrial.access.truck_circulation` and `industrial.site.fleet_storage`; Retail deliveries use `retail.operations.delivery_receiving`.

## Branching

Office never receives storefront, vehicle, or loading questions. Retail always receives the bounded storefront question; delivery appears only for food, storage, receiving, or shipping activity. Industrial/Flex always receives the improved operating-activity question. Vehicle type appears only for logistics, dispatch, or fleet activity; loading appears only for storage, shipping, production, or food activity; use mix requires both operational and office/customer activity; customer-facing priority requires display or visitor activity.

Medical and specialized behavior is unchanged.

## Length discipline

The prior ordinary Office fixture had 13 questions. Typical Office becomes approximately 15. Typical boutique Retail adds one storefront question; delivery-sensitive Retail adds a second conditional question. A straightforward warehouse/distribution path adds vehicle and loading questions. A hybrid showroom/production Flex path adds use mix, customer-facing priority, and loading, producing the longest common new path. Detailed docks, power, room counts, floorplates, yards, and programming remain deferred.

## Certified behavior

New answers flow through canonical Requirement data and Universal projection. Existing SF recommendation models receive only activities and dimensions they already understand. No new district weights, bonuses, evidence, or fixture exceptions were added. New property-focused dimensions improve framing and investigation unless a certified composition already consumes the underlying canonical activity.
