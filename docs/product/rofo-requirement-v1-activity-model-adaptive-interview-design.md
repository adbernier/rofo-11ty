# Rofo Requirement v1 — Activity Model & Adaptive Interview Design

## 1. Executive Recommendation

Rofo can replace the chat-first prototype with a fast deterministic adaptive interview without sacrificing Requirement Intelligence.

The recommended sequence is:

```text
Optional opening prose
→ Business type + property-type context
→ “What happens at this location?”
→ Canonical activities
→ Deterministic question eligibility and prioritization
→ Requirement operations
→ Deterministic readiness and stopping
→ Final unusual-needs capture
→ Standalone broker-grade Requirement
```

AI should no longer control ordinary interview progression. It should be invoked only for bounded language tasks:

- extracting known facts from optional opening prose
- interpreting “Something else” answers
- identifying unusual requirements in the final open-ended response
- optionally reviewing a ready Requirement for one consequential omission or contradiction
- producing a broker-readable narrative from canonical state

The interview must remain useful and completable when every AI call fails.

The existing prototype validates the most difficult underlying concepts: the canonical Requirement, criterion statuses, validation, provenance, correction, authority boundaries, and readiness. Its chat controller and transcript UI are replaceable presentation and orchestration layers.

## 2. Product Principles

1. **Activities before attributes.** Begin with what happens at the location, then ask about physical implications.
2. **Property type is context, not destiny.** It informs routing and domain knowledge but does not suppress contradictory operational evidence.
3. **Ask for decisions, not data collection.** A question belongs only when its answer could materially affect location, property fit, economics, timing, or diligence.
4. **One question at a time.** Each screen should present one clear decision with two to five strong choices.
5. **Use branching, not a long form.** Questions become eligible through activities, dependencies, unresolved criteria, and readiness needs.
6. **Preserve uncertainty.** “I don’t know” is valid. Property-specific facts remain `VERIFY`.
7. **Do not convert implications into requirements silently.** Consequential inferences must be confirmed.
8. **The canonical Requirement is the product.** The interview produces it but is not the durable record.
9. **Deterministic by default.** Progression, validation, merge, readiness, and stopping must be testable without a model.
10. **AI failure should reduce polish, not correctness.**
11. **Question economy is a product metric.** Eligible does not mean necessary.
12. **The output must stand alone.** A broker should not need the interview history to understand the business.

## 3. Canonical Activity Model

### Existing taxonomy audit

Rofo already has useful concepts in `_data/commercialEcosystemTaxonomy.js`, including knowledge work, client meetings, collaboration, healthcare delivery, research, assembly, manufacturing, storage, receiving, shipping, distribution, service dispatch, vehicle storage, showroom, walk-in service/retail, food preparation/production, education, training, and hospitality service.

That taxonomy remains valuable for Commercial Ecosystem reasoning, but it is inconsistent as an intake ontology: some entries describe physical behavior, some industries or uses, some differ only by intensity, and important intake concepts such as repair, outdoor operations, patient treatment, and event occupancy are absent or implicit.

Rofo should retain it and add an interview-facing Activity Model with an explicit crosswalk.

### Proposed canonical activities

| ID | User-facing concept | Definition |
|---|---|---|
| `work` | People work here | Desk, administrative, professional, or support work occurs. |
| `meet_collaborate` | People meet or collaborate | Internal meetings, teamwork, conferencing, or collaboration occurs. |
| `host_visitors` | Customers or clients visit | Non-patient visitors come for appointments, consultations, services, or transactions. |
| `sell_serve` | Products or services are sold | Onsite transactions or walk-in services occur. |
| `display_present` | Products are displayed or presented | A showroom, demonstration, presentation, or merchandising function matters. |
| `treat_care` | Patients or clients are treated | Healthcare, therapy, clinical, or treatment activity occurs. |
| `make_assemble` | Things are made or assembled | Fabrication, assembly, production, or processing occurs. |
| `repair_service` | Things are repaired or serviced | Equipment, products, vehicles, or customer items are repaired onsite. |
| `store` | Inventory, materials, or equipment are stored | Indoor or outdoor storage supports the operation. |
| `receive` | Goods or materials are received | Deliveries arrive from couriers, vans, box trucks, semis, or other vehicles. |
| `ship_distribute` | Goods or products are shipped | Outbound fulfillment, distribution, or staging occurs. |
| `dispatch` | Employees or technicians are dispatched | Mobile workers leave the property to serve a territory. |
| `operate_vehicles` | Vehicles operate from the property | Fleet vehicles, trailers, or specialized vehicles park, stage, charge, or circulate onsite. |
| `research_test` | Research or testing occurs | Laboratory, prototype, testing, measurement, or product-development work occurs. |
| `prepare_produce_food` | Food is prepared or produced | Restaurant preparation, commissary, catering, or food production occurs. |
| `teach_train_events` | Training, teaching, or events occur | Classes, workshops, training, worship, performances, or group events occur. |
| `outdoor_operations` | Work happens outdoors | Yard work, demonstrations, equipment handling, outdoor storage, or other outdoor activity occurs. |

Activities can carry bounded modifiers for frequency, scale, visitor pattern, material flow, intensity, indoor/outdoor environment, hours, and growth. These should not become additional top-level activities.

### Existing taxonomy crosswalk

| New activity | Existing reusable concepts |
|---|---|
| `work` | `knowledge_work`, `administrative_operations` |
| `meet_collaborate` | `client_meetings`, `collaboration` |
| `host_visitors` | `client_meetings`, portions of `walk_in_service` |
| `sell_serve` | `walk_in_retail`, `walk_in_service`, `hospitality_service` |
| `display_present` | `customer_showroom` |
| `treat_care` | `healthcare_delivery` |
| `make_assemble` | `assembly`, `light_manufacturing`, `manufacturing` |
| `repair_service` | New explicit intake activity |
| `store` | `storage`, `inventory_management`, `equipment_storage` |
| `receive` | `receiving` |
| `ship_distribute` | `shipping`, `distribution` |
| `dispatch` | `service_dispatch` |
| `operate_vehicles` | `vehicle_storage` |
| `research_test` | `research`, `product_development` |
| `prepare_produce_food` | `food_preparation`, `food_production` |
| `teach_train_events` | `education`, `training` |
| `outdoor_operations` | New explicit intake activity |

## 4. Activity → CRE Implication Map

These are question branches, not automatic conclusions.

| Activity | Important branches | Potential CRE implications |
|---|---|---|
| Work | People count, peak attendance, workplace purpose, office/admin share, employee geography, hybrid pattern, growth | Location access, workspace capacity, parking/transit, layout, office component |
| Meet/collaborate | Frequency, group size, internal/external, training, privacy | Conference capacity, collaboration layout, parking peaks, accessibility |
| Host visitors | Visit frequency, scheduled/walk-in, simultaneous visitors, customer geography, image | Access, parking, transit, presentation, reception, location logic |
| Sell/serve | Destination/impulse, customer volume, visit duration, transaction pattern | Visibility, frontage, signage, parking turnover, trade area |
| Display/present | Product, footprint, appointment/walk-in, loading support | Showroom suitability, ceiling/layout, frontage, retail/flex possibilities |
| Treat/care | Patient volume, appointments, accessibility, privacy, plumbing, equipment | Patient access, parking, specialized buildout, use/licensing verification |
| Make/assemble | Process, equipment, power, ventilation, noise, vibration, waste, materials | Industrial suitability, utilities, separation, zoning/environmental diligence |
| Repair/service | What is repaired, tools, customer items/fleet, noise, fumes, fluids | Power, ventilation, loading, use verification, customer/work-area separation |
| Store | Material, volume, racking, heavy/oversized/sensitive, indoor/outdoor | Clear height, floor/site needs, climate/security, yard, fire-code verification |
| Receive | Frequency, vehicle type, palletized/hand-carried, staging | Loading type, truck circulation, dock/grade access, delivery conflicts |
| Ship/distribute | Frequency, carrier, staging, cutoff times | Loading, circulation, freeway/logistics access, operational hours |
| Dispatch | Technician count, territory, departure waves, equipment loading | Service centrality, fleet staging, early hours, employee access |
| Operate vehicles | Count/type, overnight storage, security, charging, trailers, growth | Yard/indoor storage, circulation, gates, parking separation, power |
| Research/test | Wet/dry, equipment, gases, ventilation, vibration, waste, utilities | Lab/R&D compatibility, utility capacity, technical diligence, cluster geography |
| Prepare/produce food | Cooking/assembly, volume, venting, grease, refrigeration, deliveries, waste | Exhaust, plumbing, gas/power, cold storage, loading, health/use verification |
| Teach/train/events | Group size, schedule, simultaneous attendance, public access | Peak parking, transit, assembly occupancy, acoustics, accessibility, permitted use |
| Outdoor operations | Activity, area, noise, storage, demonstrations, hours | Yard, screening, security, neighboring uses, zoning/nuisance constraints |

Technical branches should be shallow during Requirement formation. The goal is to establish that a need exists and why it matters—not to perform property diligence.

## 5. Deterministic Question Model

A question definition should be a versioned declarative object:

```js
{
  id: "vehicles.overnight-storage.v1",
  version: 1,
  prompt: "Do the vehicles stay at the property overnight?",
  dimensions: [
    "industrial.site.fleet_storage",
    "industrial.site.yard_outdoor_storage"
  ],
  applicability: {
    anyActivities: ["operate_vehicles", "dispatch"],
    propertyTypes: ["industrial_flex", "retail_service", "mixed", "unknown"],
    predicateId: "fleet_count_is_material_or_unknown"
  },
  dependencies: [{ fact: "activities.operate_vehicles", operator: "selected" }],
  priority: {
    base: "HIGH",
    consequenceWeight: 90,
    readinessBoost: ["READY_FOR_PROPERTY_SEARCH"]
  },
  decisionRelevance: ["property_fit", "economics", "diligence"],
  answer: {
    type: "single_choice",
    allowUnknown: true,
    allowOther: true,
    options: [
      { id: "all", label: "Yes, all of them" },
      { id: "some", label: "Some of them" },
      { id: "none", label: "No" }
    ]
  },
  operationResolverId: "resolve_overnight_vehicle_storage",
  followUpTags: ["fleet_security", "yard_capacity"],
  help: {
    mode: "hidden",
    text: "Overnight fleet storage can change parking, yard, security, and permitted-use needs."
  },
  readinessEffects: ["property_disqualifier"],
  deferralRuleId: null
}
```

Question content should reference tested predicate and resolver IDs rather than contain arbitrary executable logic. Every question and option needs a stable ID. Answers create Requirement operations rather than mutating state directly. Answer history retains question version and provenance. Not applicable, `UNKNOWN`, and deferred-to-`VERIFY` are distinct outcomes.

## 6. Question Types

### Single choice

Use when one distinction drives a branch, such as overnight vehicle storage, destination versus visibility, or whether size is a hard minimum, preferred target, or rough estimate.

### Multi-select

Use for non-exclusive operational patterns, particularly “What happens at this location?” The initial selector can use friendly grouped wording, followed by a short disambiguation question where necessary.

### Numeric or range

Use only when users are likely to know the answer and it materially changes the decision: peak attendance, fleet count, current/future headcount, approximate size, or simultaneous patient volume. Allow ranges and approximation.

### Short free-form

Use when bounded choices would erase important variation: repair/production work, stored materials, location rationale, or unusual equipment.

### Optional AI-assisted free-form

AI may map nuanced prose into registry dimensions. It proposes operations; deterministic validation and confirmation remain authoritative.

### Something else

Provide an escape hatch when choices cannot reasonably be exhaustive. It opens a short free-form input, not a chat session.

### I don’t know

Offer it when uncertainty is plausible. A business fact may become `UNKNOWN`; a property fact may become `VERIFY`. Do not ask the same unknown question again in different words.

## 7. Adaptive Interview Engine

The controller evaluates canonical Requirement state, activities, business type, stated and derived property context, answer history, dependencies, target readiness, contradictions, and recent information gain.

```text
1. Validate and normalize Requirement
2. Derive activity and property-type context
3. Find applicable unanswered questions
4. Remove satisfied, deferred, and diligence-only questions
5. Identify readiness blockers
6. Rank remaining questions
7. Select one using a stable tie-breaker
8. Apply the answer as validated Requirement operations
9. Recalculate applicability and readiness
10. Continue, checkpoint, or stop
```

Priority order:

1. Blocking contradiction or ambiguity.
2. Missing fact required for target readiness.
3. High-consequence property disqualifier.
4. Location-changing information.
5. Material economics or timing constraint.
6. Important preference.
7. Low-consequence enrichment.

A question is high value when its possible answers could change geography, include or eliminate a property family, change transaction feasibility, reveal a major cost/timing constraint, confirm a consequential assumption, or identify property diligence.

Maintain three separate property-type concepts:

1. Stated property type.
2. Activity-derived compatibility.
3. User-confirmed search scope.

If a retail user reports substantial repair and storage, Rofo can suggest keeping service retail or flex open, but it must not silently override retail.

Business type may suggest activities and terminology but never proves an activity or technical requirement.

## 8. AI’s Supporting Role

### Initial prose extraction

One optional call may propose business context, objective, property context, activities, location logic, size, economics, timing, growth, criteria, uncertainty, and contradictions. The server validates all proposals; consequential inferences await confirmation. If it fails, the deterministic interview starts normally.

### Free-form interpretation

AI may map nuanced answers into known dimensions and modifiers. It cannot create dimensions or establish external facts.

### Unusual-requirement extraction

AI may split a final answer into several proposed criteria. Consequential interpretations still require confirmation.

### Gap or contradiction review

After deterministic readiness, an optional call may propose at most one consequential omission, contradiction, or final question. Deterministic rules decide whether it is valid and valuable enough to ask.

### Requirement narrative

AI may generate polished prose from canonical state. A deterministic summary remains available if generation fails.

AI must not control question eligibility, normal next-question selection, canonical mutation, allowed dimensions/states, readiness, stopping, external property facts, or promotion from `PREFERRED` to `REQUIRED`.

## 9. Explanation / Help Behavior

Default presentation is a question, concise choices, and a collapsed “Why this matters.” Automatically show a short explanation only for unusual, technical, confusing, or highly consequential questions.

After an answer, show a consequence only when it materially changes the Requirement. Routine answers should advance immediately without assistant-style acknowledgment.

## 10. Cross-Cutting Questions

| Family | When to ask | When to skip or defer |
|---|---|---|
| Business objective | Early unless clear from opening prose | Never repeat if intelligible |
| Current location | Relocation, renewal, expansion, or continuity | New business without current space |
| Why current space fails | When it reveals capacity or operating constraints | Pure additional-location search |
| Property context | Early, after or alongside activities | Preserve not sure/mixed |
| Transaction type | Before property-search readiness | May remain flexible |
| Geography | Early enough for location readiness | Avoid false precision before understanding drivers |
| Geography rationale | When a location lacks a reason | Skip if the reason is already explicit |
| Location flexibility | After anchor and rationale | Not before the user understands the tradeoff |
| Size/capacity | After major activities and scale | Do not treat raw square footage as sufficient |
| Size basis | When a size is stated | Skip if basis and flexibility are clear |
| Growth | When future capacity could matter | Stable operations with no consequential change |
| Economics | When it constrains transaction or geography | Detailed effective-cost work belongs later |
| Timing | Before property-search readiness | No deadline is valid |
| Current lease/dates | Existing occupiers | Owner-occupier/new operation without lease |
| Unusual needs | Once near the end | Allow “nothing else” |

## 11. Location Logic

The Requirement should distinguish stated geography, location anchor, employee geography, customer geography, service territory, supplier/freight logic, institutional adjacency, rationale, and flexibility.

The deterministic branch asks where the user is considering, why it matters, which relevant geography drivers apply, whether the area is required/preferred/flexible, and what tradeoff could justify another location.

Location Intelligence may later validate or challenge the preference, but Requirement formation preserves both the preference and its operating reason.

## 12. Size Logic

A size answer should retain:

```text
Stated range
+ basis
+ confidence
+ hard minimum
+ preferred target
+ alternative capacity strategy
+ future-state implication
```

When size is given, ask what it is based on: current space, people/attendance, inventory/equipment/operations, an advisor estimate, a rough guess, something else, or unknown. Then ask at most one or two consequential follow-ups about minimum versus target, smaller alternatives, growth, or the capacity measure that drives the number.

Activity-specific capacity measures include peak attendance, vehicle count, inventory/racking, treatment rooms, event attendance, equipment/process footprint, and display/support mix. V1 should understand confidence and flexibility, not calculate an authoritative square-foot requirement.

## 13. Final Open-Ended Capture

Ask once:

> Is there anything else about your business, team, customers, equipment, or operations that the space needs to accommodate?

Accept “No” and finish. Preserve the raw user response. AI may propose known criteria, but unknown dimensions and external factual claims are rejected, consequential interpretations require confirmation, and property-specific validation remains `VERIFY`. Information must not disappear merely because the registry lacks a perfect dimension.

## 14. Readiness & Stopping

### Ready for Location

Generally requires an intelligible objective, confirmed activity pattern, stated property context or acknowledged ambiguity, a location anchor or driver, geography-affecting activities, enough scale context, and no blocking contradiction.

### Ready for Property Search

Additionally requires workable size/capacity understanding, transaction intent known or flexible, material activities, high-consequence disqualifiers, meaningful timing, consequential growth, and technical unknowns represented as `UNKNOWN` or `VERIFY`.

Stop when the target readiness state is reached; no applicable blocking or high-priority question remains; remaining questions are low-value, preference enrichment, or diligence; uncertainty has been recorded; the final escape hatch was offered; and the user has not chosen further refinement.

The user may proceed early. Rofo should disclose what remains unknown unless a contradiction makes the output misleading. Do not use completion percentages.

## 15. UX Model

The primary UI is one question with large tap targets, minimal prose, optional help, “I’m not sure,” “Something else,” Back/Edit, and save/finish. Single-choice answers can advance automatically; multi-select and free-form answers use an explicit continue action.

There should be no transcript, model typing animation, visible AI persona, contact gate, or completion percentage.

A collapsed “What Rofo understands” control can be available during the interview, with a checkpoint after activities and before final review. The full Requirement should be the end-state reward rather than a competing live panel.

## 16. Performance / Resilience

Eligibility, ranking, bounded answer validation, Requirement operations, readiness, Back/Edit, local persistence, deterministic summary, and private JSON export should be client-local where practical.

Only initial prose extraction, unusual free-form interpretation, optional gap review, and narrative generation require server/model access.

Persist after each answer, version stored state, restore interrupted sessions, time out optional AI calls, offer “Continue without AI,” preserve raw prose on extraction failure, and keep proposals separate from canonical state. Deterministic QA must support a zero-AI path.

## 17. USA Shoe Company Walkthrough

**Opening:** Orlando purchase, budget at or below $1.2M, 8,000–12,000 SF preferred, smaller expandable options possible, shoe repair/personal service, named corridors, customer-facing plus repair/storage, expansion, seller flexibility, ASAP, and use verification.

**Activities:** `work`, `host_visitors`, `sell_serve`, `repair_service`, `store`, `receive`.

**Likely questions:** customer visit pattern; destination versus visibility; parking/access; repair work and equipment; receiving pattern; why the named areas matter; size-estimate basis; what makes a smaller property workable; meaning of seller flexibility; final unusual-needs question.

**Skipped:** transaction, budget, broad timing, whether repair/storage/expansion matter, and whether permitted use requires verification.

**Branches:** destination behavior affects visibility; repair intensity may activate infrastructure screening; delivery pattern determines whether loading questions matter; size remains a preferred range with a smaller-plus-expansion alternative.

**Result:** customer/location logic, operating pattern, parking, storage/receiving, size basis/confidence/flexibility, budget, seller flexibility, timing, and permitted-use `VERIFY`.

**Expected count:** approximately 7–10 questions after the rich opening.

## 18. Northstar Advisory Walkthrough

**Opening:** 45-person SF professional-services office, roughly 10,000 SF, 35–40 peak attendance, frequent clients, employee geography and recruiting/culture, growth to 55–60, downtown/BART preference, lease expiry in 14 months.

**Activities:** `work`, `meet_collaborate`, `host_visitors`, and possibly `teach_train_events` if recruiting/training events are confirmed.

**Likely questions:** workplace purpose; employee origins; client frequency and simultaneous visits; image expectations; meeting/collaboration pattern; importance of BART versus its underlying access goal; size basis; how growth should be accommodated; critical lease dates; final unusual-needs question.

**Skipped:** current headcount, peak attendance, broad property type/city, client visits, growth, and basic lease expiry.

**Branches:** peak attendance drives initial capacity; clients activate access/image; recruiting changes workplace purpose; employee geography explains transit; growth may create flexibility rather than immediate over-sizing.

**Expected count:** approximately 7–9 questions.

## 19. Bayline Equipment Services Walkthrough

**Opening:** 32-person East Bay HVAC/refrigeration company, industrial/flex, initial 15,000 SF, 14 vans growing to 20, secure yard/vehicle storage, warehouse/storage, repair, grade loading, occasional semi, three-phase power with unknown capacity, employee/service geography, growth, and lease expiry in 11 months.

**Activities:** `work`, `dispatch`, `operate_vehicles`, `store`, `receive`, `repair_service`, and potentially `outdoor_operations`.

**Likely questions:** service territory; technician start/end pattern; indoor/outdoor vehicle storage flexibility; repair activity; stored materials and handling; semi frequency/circulation; office component; size basis and fleet growth; critical lease dates; final unusual-needs question.

**Skipped:** business/property type, current/future fleet count, whether fleet storage/warehouse/repair/grade loading/three-phase power matter, exact electrical capacity, and basic lease expiry.

**Branches:** fleet plus dispatch activates staging/security/circulation; occasional semis justify circulation but not dock-high assumptions; repair activates infrastructure/use screening; amperage remains `UNKNOWN`, and property capacity remains `VERIFY`.

**Expected count:** approximately 8–10 questions.

## 20. Five+ Generalization Tests

### Neighborhood restaurant

Activities: host visitors, sell/serve, prepare food, receive, store. Test seating/takeout, cooking intensity, venting, grease, refrigeration, deliveries, waste, and outdoor seating. V1 identifies operational needs; code, liquor, health, and feasibility remain `VERIFY`.

### Dental practice

Activities: work, host visitors, treat/care, store. Test provider/chair count, patient overlap, access, plumbing, imaging, privacy, and sterilization. Treatment intensity requires branching; compliance remains `VERIFY`.

### Landscape contractor

Activities: work, dispatch, operate vehicles, store, receive, outdoor operations. Test trucks/trailers, overnight storage, yard, materials, security, early hours, territory, and maintenance. This exposes the need for vehicle and hours modifiers.

### Furniture showroom with warehouse support

Activities: host visitors, sell/serve, display/present, store, receive. Test destination traffic, display footprint, bulky inventory, pickup, and delivery vehicles. This is a central retail/showroom-flex ambiguity case.

### Light electronics manufacturer

Activities: work, make/assemble, research/test, store, receive, ship. Test process intensity, equipment, power, ventilation, sensitive inventory, shipping, and office/lab share. Exact utility feasibility remains `VERIFY`.

### Nonprofit training organization

Activities: work, teach/train/events, host visitors, store. Test class peaks, evening/weekend use, access, room flexibility, and equipment. Event occupancy may matter more than employee count.

### Biotechnology R&D company

Activities: work, collaborate, research/test, make/assemble, receive, store. Test wet/dry work, gases, ventilation, vibration, waste, cold storage, and cluster geography. V1 screens infrastructure categories without detailed lab programming.

These cases show that v1 also needs bounded cross-activity screeners for operational intensity, hours/peak occupancy, specialized utilities/environment, and regulated, hazardous, sensitive, or unusual materials.

## 21. Chat vs Adaptive Interview Comparison

| Dimension | Chat-first prototype | Deterministic adaptive interview |
|---|---|---|
| Reliability | Sensitive to model behavior | Stable ordinary paths |
| Latency | Model round trip per turn | Instant local progression |
| Cost | Accumulates throughout | Zero ordinarily; bounded optional calls |
| Consistency | Variable sequences | Same state, same next question |
| Question quality | Insightful but variable | Product-authored and tested |
| Adaptability | Strong for novel prose | Strong modeled branches plus bounded AI |
| Mobile UX | Typing/transcript overhead | Large taps and minimal reading |
| Cognitive load | Repeated prose formulation | Recognition and bounded decisions |
| Testability | Model evals needed for core flow | Mostly deterministic tests |
| Resilience | Model failure is material | Core interview still works |
| AI dependency | Central controller | Optional supporting layer |
| Unusual businesses | Flexible but can wander | Final free-form plus AI interpretation |
| Explanation | Natural but verbose | Short and optional |
| Stopping | Model plus deterministic check | Deterministic marginal-value rule |

Preserve the Requirement object, statuses, validator, authority rules, confirmation, provenance, correction, readiness, JSON/debug tools, private isolation, provider boundary, and structured AI results. Retire model-controlled next-question selection, calls on every turn, transcript UI, assistant persona, verbose explanations, and free-form inputs where bounded choices are better.

## 22. Existing Prototype Reuse Plan

| Existing component | Treatment |
|---|---|
| Canonical Requirement envelope | Preserve |
| Criterion states | Preserve |
| Dimension registry | Evolve for activities and new contexts |
| Validator and deterministic merge | Preserve and extend |
| Readiness evaluator | Refine to consider high-priority eligible questions |
| Provenance | Add question ID/version and answer provenance |
| Consequential inference and correction | Preserve |
| Session-local persistence | Preserve |
| JSON export/debug and private route | Preserve |
| Server-side OpenAI client | Preserve for bounded tasks |
| Structured turn schema | Replace with task-specific extraction/review schemas |
| Interview prompt | Replace |
| Per-turn Function call | Retire |
| Chat transcript UI | Retire |
| Full live Requirement panel | Reduce to checkpoints/review |
| Model-selected question | Retire |

## 23. Proposed v1 Scope

Include the 17 activity families, taxonomy crosswalk, seven property contexts, business-type-assisted activity suggestions, deterministic questions/applicability, tested predicates/resolvers, cross-cutting branches, bounded technical screening, `UNKNOWN`/`VERIFY`, property ambiguity confirmation, final open capture, deterministic readiness, local persistence/correction/review/export, and optional AI extraction/interpretation.

Exclude exhaustive property programming; code/zoning determinations; detailed lab, medical, restaurant, or manufacturing engineering; automated size calculation; production recommendation changes; Location Brief, lead, broker, or landlord workflows; per-turn chat; transaction advice; and production Business Profile replacement.

Initial validation hypothesis: rich opening prose should often produce 6–10 follow-up questions; minimal starts 9–14; complex industrial, medical, and R&D cases may require more. The real metric is whether each question materially improves the Requirement.

## 24. Open Product Decisions

1. Begin with optional prose, business type, or activities?
2. Make opening-prose extraction automatic or explicitly initiated?
3. How should activity choices be grouped without losing precision?
4. Should make/assemble/repair begin grouped or separate?
5. Is the default target Ready for Location or Ready for Property Search?
6. When should property-type ambiguity surface?
7. Should users classify Required/Preferred directly, or should Rofo infer and selectively confirm?
8. Should “What Rofo understands” appear continuously or only at checkpoints?
9. How much medical, food, and R&D depth belongs in initial v1?
10. Should the optional AI gap review run automatically or on request?
11. How should users choose between proceeding and further refinement?
12. What persistence duration and privacy explanation are appropriate?
13. Should unusual raw prose appear verbatim in the final Requirement?
14. How should compatible property alternatives be described without overriding the user?

## 25. Recommended First Implementation Sprint

Do not begin production integration.

### Objective

Replace the private prototype’s model-controlled conversation loop with a deterministic activity-driven interview capable of exercising the three existing and seven generalization cases.

### Bounded scope

1. Add a versioned Activity Registry and crosswalk.
2. Add a versioned deterministic Question Definition schema.
3. Implement pure eligibility, dependency, priority, and next-question functions.
4. Connect answers to the existing validated Requirement-operation pipeline.
5. Extend readiness to consider remaining high-priority applicable questions.
6. Replace the private chat UI with a one-question mobile-first evaluator.
7. Preserve review, correction, `UNKNOWN`, `VERIFY`, JSON export, and debug tools.
8. Add final open-ended capture without requiring AI.
9. Add deterministic fixtures and path tests.
10. Keep AI extraction out of the critical path.

Only private prototype and Requirement modules should be affected. No production Business Profile, recommendation, lead, Location Brief, or routing code should change.

### Acceptance criteria

- Identical Requirement state selects an identical next question.
- Ordinary answers advance without a network call.
- Scenarios follow different paths without scenario identifiers.
- Edits safely recalculate downstream applicability.
- Unknown answers are not repeatedly re-asked.
- External facts remain `VERIFY`.
- Activity/property ambiguity requires user confirmation.
- The final Requirement is readable without answer history.
- The interview stops with unanswered low-value questions.
- The prototype works without an API key or AI calls.

## Final Question

> Can Rofo replace the chat-first Requirement prototype with a fast deterministic adaptive interview while preserving the Requirement Intelligence that made the prototype valuable—and use AI only where it materially improves understanding?

**Yes.** The prototype’s durable value came from its structured Requirement, uncertainty handling, provenance, corrections, and authority boundaries—not from chat itself.

The appropriate architecture is:

```text
Product-authored activity and question knowledge
+ Deterministic Requirement state, validation, readiness, and stopping
+ Bounded AI language interpretation where prose creates real leverage
```

That model supports a faster, more consistent, less expensive, more resilient, and more testable intake while preserving flexibility for rich prose and unusual businesses.
