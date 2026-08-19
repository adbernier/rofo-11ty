# Rofo Requirement v1

*Product & Experience Specification · Draft 1 · August 2026*

> *A business needs a box. Rofo's job is to understand what needs to happen inside it, what the box needs to support, and where that box should be.*

## 1. Product Thesis

Rofo helps a business translate how it operates into a clear, useful commercial real-estate Requirement. The business should not need CRE vocabulary before beginning.

The Requirement becomes the common object used to improve location recommendations, property evaluation, broker handoff, and—later, if validated—market response.

> *The CRE industry tends to start with the boxes it has available. Rofo starts with the business.*

The Requirement is valuable on its own. A business should be able to save it, print it, or send it to an existing broker without being forced into another Rofo service.

## 2. User Promise

> *Tell us about your business and what you're trying to accomplish. We'll help you define what you actually need from a space.*

Rofo explains why the questions matter: a better Requirement means fewer unsuitable properties, fewer wasted tours, better location recommendations, and less repetition later. If the user does not know an answer, that is acceptable.

The experience should feel like a knowledgeable adviser helping the business think—not a lead form extracting fields.

## 3. Core Product Objects

| Object | Purpose |
| --- | --- |
| Business Profile | Who the business is, how it operates, who it serves, and how it is changing. |
| Requirement | What real estate must accomplish now: required, preferred, flexible, unknown, and verify. |
| Location Intelligence | Where the Requirement is most likely to work and why, including tradeoffs. |
| Building Profile | What a property can support, with provenance and explicit unknowns. |
| Decision | Options considered, evidence, rejection reasons, outcome, and eventually transaction/occupancy memory. |

## 4. The 'Box' Model

| Question | What Rofo needs to understand |
| --- | --- |
| Who needs the box? | Business type, operating model, people, customers, growth, objective. |
| What happens inside the box? | Work, customers, storage, production, repair, treatment, research, shipping, collaboration, and other activities. |
| What must the box support? | Size, layout, parking, loading, power, yard, ventilation, plumbing, security, office component, expansion, and other relevant capabilities. |
| Where should the box go? | Employees, customers, suppliers, freight, transit, roads, visibility, ecosystems, regulation, cost—and why the stated geography matters. |
| What constrains the decision? | Budget, timing, current lease, permitted use, technical needs, growth, transaction type, and risk. |

## 5. AI Requirement Conversation

### AI runs the interview

- Extract everything already supplied, including free-form text and uploaded material.
- Translate ordinary business language into possible CRE implications.
- Identify the unresolved issue most likely to change location, property fit, economics, timing, or diligence.
- Ask one easy-to-answer question in ordinary language.
- Explain why the question matters when useful.
- Update the Requirement and choose the next highest-value question.
- Stop when another question has low marginal value for the current stage.

### Ask business questions, not CRE fields

| Avoid | Prefer |
| --- | --- |
| Vehicle Parking Requirement: ___ | Do your service vehicles stay at the property overnight? |
| Loading: Dock / Grade | How do materials usually arrive—vans, box trucks, flatbeds, or full-size semis? |
| Hybrid work: Yes/No | About how many people are typically in the office on your busiest day? |
| Visibility: High/Medium/Low | Do customers plan a trip specifically to visit you, or do you depend more on passing traffic and visibility? |
| Power: ___ amps | Do you know whether any equipment needs three-phase power or unusually high electrical capacity? It's fine if you don't. |

> *Ask the next question with the highest probability of materially changing the search.*

A question earns the right to be asked now only if its answer could materially affect Location, Property Fit, Economics, Timing, or Diligence.

## 6. Requirement Knowledge States

| State | Meaning | Example |
| --- | --- | --- |
| Required | Failure means the option does not work. | Two loading positions required. |
| Preferred | Meaningfully improves fit but is not necessarily disqualifying. | BART within walking distance preferred. |
| Flexible | The business has explicitly indicated room to compromise. | 8,000–12,000 SF acceptable. |
| Unknown | Potentially important, but not yet known. | Exact electrical capacity unknown. |
| Verify | Must be established through property, professional, or authoritative diligence. | Proposed use permitted at this property—verify. |

'I don't know' is a successful answer when it correctly identifies where the search still needs evidence.

## 7. Inference, Explanation & Trust

AI may infer possible CRE implications from business language, but consequential inferences should normally be confirmed.

| User says | Possible implication | Good follow-up |
| --- | --- | --- |
| We have 14 service vans. | Secure vehicle parking may matter. | Do those vans stay at the property overnight? |
| Clients visit every day. | Client access and image may matter. | It sounds like client convenience and the impression of the office matter. Is that right? |
| We repair equipment onsite. | Use, ventilation, power, or handling may matter. | What does the repair work involve? |

When an answer materially changes the search, Rofo should occasionally explain what it learned.

> *That changes the search a little. Because your 14 vans stay onsite overnight, secure vehicle storage is likely to matter as much as the building itself. I'll treat that as a requirement.*

Rofo must manage uncertainty explicitly and never turn missing facts into confident claims.

## 8. Progressive Enrichment & Readiness

| Readiness | Meaning |
| --- | --- |
| Ready for Location | Enough is known to reason intelligently about geography and district tradeoffs. |
| Ready for Property Search | Enough is known to eliminate obviously unsuitable properties and rank plausible ones. |
| Ready for Market Response | Enough is known that landlords/brokers can determine whether a property plausibly fits without creating noise. |

These can remain internal states in v1. Avoid completion percentages that encourage unnecessary questioning.

## 9. Stopping Rule

> *Stop when the expected value of another question is lower than the friction of asking it now.*

Defer questions better answered after seeing a property, by a landlord/listing broker, through authoritative records, by a specialist, or during diligence. Requirement formation should not become CRE tax preparation.

## 10. Property-Type Reasoning

| Property type | Core reasoning dimensions |
| --- | --- |
| Office | Workplace purpose, peak attendance, employee geography, clients, recruiting, meetings, image, transit/parking, growth, flexibility. |
| Industrial / Warehouse / Flex | Operations, vehicles, receiving/shipping, loading, yard, storage, production, power, equipment, truck circulation, employee geography, freight/service territory, office component, growth. |
| Retail | Customer behavior, destination vs impulse, trade area, visibility, parking, access, sales economics, delivery, co-tenancy, signage, use, competition. |
| Medical | Patients, providers, referrals, parking, accessibility, plumbing, equipment, privacy, permitted use, buildout, licensing. |
| Life Science / R&D | Research activity, lab type, ventilation, utilities, power, gases, loading, vibration, waste, permitting, talent ecosystem. |
| Special Purpose | The operating process determines the questions; adapt rather than force a generic template. |

The reasoning framework is universal. The questions are not.

## 11. Live Requirement Experience

On desktop, a strong pattern is a conversation beside a continuously updating Requirement. Mobile can sequence the same information.

| Conversation | Your Requirement |
| --- | --- |
| One high-value question at a time. | What the space needs to accomplish |
| Natural-language answers or quick choices. | Location and why it matters |
| Occasional explanation of what changed. | Required / Preferred / Flexible |
| Adaptive next question. | Still figuring out / Verify at property |

The user should visibly experience Rofo understanding them.

## 12. Requirement Artifact

The finished Requirement should be understandable and useful without Rofo.

- Company / Requirement title
- Objective: what the business is trying to accomplish
- Business context relevant to the real-estate decision
- Location preferences and why they matter
- Space/capacity and how the estimate was derived
- Activities: what actually happens in the space
- Required
- Preferred
- Flexible
- Economics and assumptions
- Timing and current lease constraints
- Growth / future state
- Unknown / still to determine
- Verify at serious properties

The business should be able to save, print/PDF, share, or send the Requirement to an existing broker. Rofo should not hold the artifact hostage.

> *Quality test: Would an experienced tenant broker be pleased if every new client arrived with this Requirement already completed?*

## 13. Location Intelligence Integration

Location Intelligence should improve the Requirement, not merely consume it. Rofo should understand why a geography was selected and, where evidence supports it, validate or challenge that choice.

> *Your preference for Hayward makes sense given your employee and service geography. Keeping Union City open may increase property options without compromising the operating priorities you described.*

Recommendations should explicitly reference the Requirement rather than generic business archetypes.

## 14. Property Fit

| Fit state | Meaning |
| --- | --- |
| Strong fit | Important requirements are confirmed and no material conflict is known. |
| Potential fit | The property appears plausible but important facts remain incomplete or conditional. |
| Conflict | A known requirement is not satisfied. |
| Unknown | Relevant information is missing. |
| Verify | Authoritative or professional confirmation is required. |

Listings become evidence against a Requirement rather than the product itself.

## 15. Broker Handoff — v1 Execution Model

Requirement Intelligence does not replace Rofo's current broker handoff. It improves it.

> *Ready to search the market? Rofo can introduce you to a local commercial real-estate professional who can investigate current and off-market availability, arrange tours, verify property details, and help negotiate the transaction. We'll share your Requirement so you don't have to start over.*

Rofo transfers the Requirement and Location Intelligence context with the referral. Brokers remain important for inventory, local/tacit knowledge, verification, tours, landlord access, negotiation, and transaction coordination.

> *Business → Requirement → Location Intelligence → Broker handoff*

Requirement v1 can improve user experience, recommendation quality, lead quality, broker acceptance, and broker efficiency without requiring a marketplace.

## 16. Future Market Response — Not Required for v1

> *Would you like Rofo to anonymously share this Requirement with relevant landlords and market professionals? They can respond with properties that may fit. Your identity stays private until you choose to connect.*

> *Requirement → targeted market response → structured property responses → tenant review → Connect → human execution*

This is an option created by excellent Requirements, not a prerequisite for Requirement v1.

## 17. Future Supply-Side Response

A landlord, listing broker, tenant broker, junior broker, assistant, or property manager could respond by entering an address. Rofo maps the building, reuses known data, and asks only unanswered fit questions.

Responses should be fast: Yes, No, Possible, Unknown, or Needs Verification, plus a short note. Rofo should capture provenance, including whether the respondent is the listing representative.

The tenant receives a qualified response and chooses whether to Connect. For business-originated Requirements, identity release remains tenant-controlled.

## 18. Broker-Created Requirements — Future Liquidity

Tenant brokers may create Requirements for represented clients, potentially free, because high-quality active demand helps seed marketplace liquidity.

Broker-originated Requirements should preserve representation and anonymity. Brokers may invite clients to review and improve the Requirement. Rofo should not become a broker CRM merely because brokers use this object.

## 19. Why Requirements Matter Economically

> *Listings are abundant. Credible, structured, active demand is scarce.*

- Business: clarity, better search, less wasted time.
- Tenant broker: less discovery work and better market coverage.
- Listing broker: qualified demand and landlord-reportable activity.
- Landlord: evidence that vacant space may fit a real business need.
- Rofo: structured demand plus a common object against which building data can be collected.

Desired reputation: not 'Rofo sends leads,' but 'When a Rofo Requirement arrives, read it.'

## 20. Future Data Flywheel

> *Business context → Requirement → recommendations → responses/outcomes → demand intelligence → better building data → better recommendations*

Property data should improve because a real Requirement creates an economic reason to answer. Requirements, responses, rejection reasons, and outcomes can create privacy-safe demand intelligence. Learn from real fit and outcomes, not clicks alone.

## 21. Requirement v1 Quality Tests

| Test | Question |
| --- | --- |
| Business | Does the business say: Yes—that describes what we actually need, and I understand my search better now? |
| Tenant broker | Can an experienced broker run a search from this without starting discovery over? |
| Landlord/listing broker | Can the supply side quickly tell whether a property deserves a response? |
| Rofo | Can Location Intelligence and later Property Fit reason against the Requirement consistently? |

## 22. Explicitly Out of Scope for v1

- Lease negotiation
- Definitive zoning/permitted-use determinations
- Engineering certification
- Exact buildout costs
- Perfectly current market availability
- Replacing brokers, attorneys, architects, contractors, or engineers
- Persistent portfolio management
- Landlord demand marketplace
- Broker CRM
- Full transaction management

> *Requirement v1 has one job: turn an ordinary business's understanding of its operations into a CRE Requirement that materially improves the search.*

## 23. v1 Execution Path

| Stage | v1 behavior |
| --- | --- |
| Understand | AI captures business context conversationally and extracts existing information. |
| Requirement | Rofo produces a portable structured Requirement using Required / Preferred / Flexible / Unknown / Verify. |
| Location | Existing Location Intelligence recommends and explains markets/districts using the Requirement. |
| Search decision | The business chooses whether to continue into the live market. |
| Broker handoff | Rofo introduces a commercial real-estate professional and transfers the Requirement so the business does not start over. |

## 24. Design Benchmarks

The first design benchmark should use three deliberately different cases:

| Case | Why it matters |
| --- | --- |
| USA Shoe Company / Julian | Real retail/service acquisition; free-form input, customer use, parking, expansion, seller terms, and property diligence. |
| Northstar Advisory | Office; workplace purpose, attendance, employees, clients, recruiting, growth, economics, and lease timing. |
| Bayline Equipment Services | Industrial; vehicles, yard, loading, repair activity, power, service geography, growth, and technical verification. |

A common Requirement model that produces excellent outcomes across these cases is evidence that the framework generalizes beyond a single property type.

## 25. Strategic Progression

> *Location Intelligence → Requirement Intelligence → Business-specific Location Recommendations → Property Fit → Optional Market Response → Connect → Decision Memory → Persistent Real-Estate Intelligence*

Each step should create value without requiring the next. Requirement Intelligence is the next logical layer because it improves the product and current broker handoff immediately while preserving future marketplace optionality.

## 26. Product Principle

> *The schema should structure the output, not dictate the conversation.*

Rofo's commercial knowledge provides the domain structure. AI provides adaptive reasoning and conversation. The user provides business truth. Brokers, landlords, property records, and professionals later provide building and market truth.

> *The desired experience is not: 'I chatted with an AI.' It is: 'Rofo understood my business, asked surprisingly good questions, and saved me a lot of wasted time.'*
