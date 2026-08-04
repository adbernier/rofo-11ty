# San Francisco Office Location Decision Model

**Status:** Reference model draft
**Owner:** Product
**Audience:** Product, Editorial, Engineering, Design, AI/Codex
**Related documents:** `docs/product/rofo-product-experience-vision.md`, `docs/product/commercial-location-decision-model.md`

---

## 1. Scope and User Job

This model supports one decision:

> A business considering office space in San Francisco wants to determine which districts deserve further investigation and why.

The user may know only:

- Market: San Francisco
- Space type: Office

Rofo should not recommend "San Francisco" back to the user. It should create an initial San Francisco office district consideration set, explain why those districts are credible starting points, and refine that set as the user adds facts, geographic constraints, and priorities.

This model does:

- define the eligible San Francisco office district universe
- define the first curated office starting set
- distinguish facts, constraints, and priorities
- propose a district attribute matrix using existing repository signals
- define explainable ranking behavior
- identify data gaps before implementation
- recommend an MVP San Francisco office model

This model does not:

- select a lease
- rank buildings
- use live availability or pricing
- replace broker validation
- implement recommendation scoring
- change current recommendation behavior
- redesign the Business Profile or Location Brief UI

The intended output is an explainable shortlist of districts worth discussing internally or handing to a broker as the starting point for market review.

---

## 2. San Francisco Office District Universe

### Repository-Represented Districts

The Knowledge Graph currently represents 10 canonical San Francisco districts as recommendation-eligible, first-class commercial geography. Source: `_data/locationKnowledgeGraph.js`, district nodes merged around the San Francisco section with `operationalMarketId: "san-francisco"`, `recommendationEligible: true`, and `commercialGeography.canonicalDistrict: true`.

| District | Office fit in Knowledge Graph | Confidence | Repository support |
| --- | --- | --- | --- |
| Financial District | strong | high | Knowledge Graph, CME, CBI, building profiles |
| Jackson Square | strong | high | Knowledge Graph, CME, CBI, building profiles |
| SoMa | strong | high | Knowledge Graph, CME, CBI, building profiles |
| Mission Bay | strong | high | Knowledge Graph, CME, CBI, building profiles |
| South Beach | strong | medium | Knowledge Graph, CME, CBI, building profiles |
| Showplace Square | strong | medium | Knowledge Graph, CME, CBI, building profiles |
| Dogpatch | good | medium | Knowledge Graph, CME, CBI, building profiles |
| Design District | good | medium | Knowledge Graph, CME, CBI, building profiles |
| Potrero Hill | good | medium | Knowledge Graph, CME, CBI, building profiles |
| Mission District | good selective fit | medium | Knowledge Graph, CME, CBI, building profiles |

Supporting source paths:

- `_data/locationKnowledgeGraph.js`: district identity, spaceTypeFit, attributes, strengths, tradeoffs, questionsToValidate, compareWith relationships.
- `_data/commercialMarketEvidence.js`: 10 completed San Francisco CME collections.
- `data/commercial-market-evidence/san-francisco/*.js`: district-level evidence collections.
- `_data/commercialBuildingIntelligence.js`: 131 San Francisco canonical buildings, district defaults, related districts, representative building roles.
- `_data/commercialEcosystemTaxonomy.js`: office ecosystem, office subtypes, office business archetypes, common operational signals.
- `js/recommendation-resolver.js`: current resolver behavior, fit scoring, priority attribute rules, and explainability patterns.
- `js/search-profile.js`: current Business Profile facts and location-intent fields.

### Proposed Full Eligible Universe

All 10 canonical San Francisco districts should remain eligible for office recommendations. Equal eligibility does not mean equal starting priority. The model should measure maturity and fit rather than excluding a district because it is specialized, lower-confidence, or not a conventional office core.

### Initial Consideration Set

When the user provides only San Francisco + Office, Rofo should show an initial consideration set, not a numbered final ranking.

Recommended initial set:

1. Financial District
2. SoMa
3. Mission Bay
4. Jackson Square
5. South Beach
6. Showplace Square

Why each belongs:

- Financial District: source-backed strong office fit for client-facing office users, transit, traditional Class A inventory, and professional-services identity. Source: `_data/locationKnowledgeGraph.js` Financial District `spaceTypeFit.office`, `attributes`, `strengths`.
- SoMa: source-backed strong office fit for central access, creative/adaptive buildings, technology users, and a less formal downtown alternative. Source: `_data/locationKnowledgeGraph.js` SoMa `spaceTypeFit.office`, `attributes`, `strengths`.
- Mission Bay: source-backed strong office fit for growth-stage, technology, life-science-adjacent, newer inventory, UCSF adjacency, and expansion flexibility. Source: `_data/locationKnowledgeGraph.js` Mission Bay `spaceTypeFit.office`, `attributes`, `strengths`.
- Jackson Square: source-backed strong office fit for boutique, executive, investor, and client-facing creative users. Source: `_data/locationKnowledgeGraph.js` Jackson Square `spaceTypeFit.office`, `attributes`, `strengths`.
- South Beach: source-backed strong office fit for waterfront, Transbay, ballpark, South Financial District adjacency, and mixed-use professional-service needs. Source: `_data/locationKnowledgeGraph.js` South Beach `spaceTypeFit.office`, `attributes`, `strengths`.
- Showplace Square: source-backed strong office fit for creative office, AI, robotics, product teams, and production-adjacent character. Source: `_data/locationKnowledgeGraph.js` Showplace Square `spaceTypeFit.office`, `attributes`, `strengths`.

This is a six-district starting set. It is broad enough to show meaningful tradeoffs and small enough to understand.

### Normally Secondary

These districts should remain eligible but normally begin in a secondary section until user signals make them more relevant:

- Dogpatch: strong for adaptive reuse, office/R&D, creative production, and Mission Bay adjacency, but a less conventional starting point for broad office searches.
- Design District: useful for creative office, showroom-adjacent, design-oriented teams, but too specialized for most generic office searches.
- Potrero Hill: useful for smaller creative office, production-adjacent, and neighborhood-scale users, but less scalable and less transit-rich for broad office searches.
- Mission District: useful for creative, nonprofit, local professional, and neighborhood-oriented users, but less conventional for large corporate office requirements.

### Signal-Specific Entrants

Districts that should enter or move up under particular signals:

- Dogpatch enters when the user values adaptive industrial character, Mission Bay adjacency, office/R&D, creative production, lower-rise waterfront reuse, or some parking/practical access.
- Design District enters when showroom, design-trade identity, customer presentation, creative production adjacency, or product display matters.
- Potrero Hill enters when the user values neighborhood-scale commercial buildings, creative/flex compromise, production adjacency, or parking/practicality more than formal office image.
- Mission District enters when the user values cultural identity, walkability, local customer access, nonprofit/creative fit, or neighborhood visibility.

### Grouping Guidance

Rofo should avoid false precision when districts overlap or represent micro-geographies with similar decision logic:

- Design District and Showplace Square can be shown separately when creative/showroom/production identity matters, but the model should explain their overlap.
- South Beach and SoMa can be grouped as a comparison cluster for users who only know "central San Francisco office near Transbay/Caltrain" until the user clarifies waterfront, tower, creative, or mixed-use preference.
- Dogpatch and Potrero Hill should be presented as related alternatives when production-adjacent, maker, or office/flex signals matter.
- Jackson Square and Financial District should be linked when the user wants a north-of-Market, client-facing, downtown-adjacent search but has not chosen between tower scale and boutique character.

---

## 3. Facts

Facts define the relevant universe. They should be easy for a user to answer and should not require brokerage fluency.

| Fact | User-facing question | Answer format | Required? | Why it matters | Affects | Repository support | Safe inference |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Market | "Where are you thinking about locating?" | City, market, district, neighborhood, street, or landmark | Required | Defines the initial geography. | Eligible market/district universe | `js/search-profile.js` captures structured location; `_data/locationKnowledgeGraph.js` has San Francisco and district nodes. | "San Francisco" means recommend districts inside San Francisco, not San Francisco itself. |
| Space type | "What kind of space does your business need?" | Single choice: Office, Industrial, Retail, Medical, Flex, Coworking | Required | Selects the space-type model and decision dimensions. | Eligible district model and attribute set | `js/search-profile.js` spaceType options; `_data/commercialEcosystemTaxonomy.js` office ecosystem. | Office maps to Knowledge Graph `spaceTypeFit.office`. |
| Team scale | "How many people regularly work from the office?" | Ranges: 1-5, 6-15, 16-35, 36-75, 75+ | Launch-critical | Better than asking exact square footage first; helps separate boutique, growth, and large-floorplate needs. | Expansion flexibility, building format, district scale | Current Business Profile has `people` only for Coworking; office currently asks approximate size. | Can infer approximate size range if assumptions are transparent. |
| Regular daily occupancy | "How many people are usually in the office on a normal day?" | Range or percentage | Useful later | Hybrid companies may have high headcount but lower daily occupancy. | Size guidance, transit/amenity weighting | Missing as structured field. | Do not infer from headcount without asking hybrid pattern. |
| Growth expectation | "Do you expect the team to grow in the next 12-24 months?" | Stable, modest growth, significant growth, unsure | Launch-critical | Moves Mission Bay, SoMa, South Beach, and other scalable districts up; can move Jackson Square down for larger growth. | `expansionFlexibility`, building format | KG has `attributes.expansionFlexibility`; search profile does not yet capture growth. | If user chooses 75+ or "25,000+ sqft", infer growth/scale sensitivity but still ask to confirm. |
| Approximate size | "Do you already know an approximate size range?" | Optional ranges: under 2,500 SF; 2,500-5,000 SF; 5,000-10,000 SF; 10,000-25,000 SF; 25,000+ SF; not sure | Optional in future, currently required | Useful if the user already knows it, but should not be the primary input. | District scale, boutique vs large floorplate explanation | `js/search-profile.js` has office size ranges and currently requires size. | If unknown, estimate from headcount/occupancy and label as estimate. |
| Business type | "Which description is closest to your business?" | Optional archetype: professional service, startup, creative studio, nonprofit, finance/legal, life-science-adjacent, other | Launch-critical for stronger explanations | Connects user to district ecosystems and representative buildings. | Ecosystem fit, explanation language | `_data/commercialEcosystemTaxonomy.js` businessArchetypes; KG `bestFor`. Missing from current Search Profile flow. | Space type alone should not imply archetype. |

Size recommendation: launch should require market and space type, then ask team scale and growth before square footage. Exact square footage should be optional. Current code requires office size (`js/search-profile.js`, `pathConfig.Office.size`), so a future implementation should either support "I'm not sure" as valid or replace first-order size with people/occupancy.

---

## 4. Geographic Constraints

Constraints are stronger than preferences. They should filter only when the user gives a clear boundary; otherwise they should weight or introduce alternatives.

| Constraint | How user expresses it | Effect | Nearby alternatives | Existing relationship data | Missing relationship data |
| --- | --- | --- | --- | --- | --- |
| Specific district anchor | "We are considering Jackson Square." | Strongly weights Jackson Square; does not hard-filter unless user says only. | Financial District, SoMa, Mission Bay from KG `relationships.compareWith`; CBI relatedDistricts also link Jackson Square to Financial District and SoMa. | `_data/locationKnowledgeGraph.js` Jackson Square compareWith; `_data/commercialBuildingIntelligence.js` relatedDistricts. | Need typed adjacency vs substitute vs contrast relationships. |
| Nearby or adjacent districts | "Show me nearby options too." | Adds adjacent/similar districts to consideration, usually secondary. | Jackson Square -> Financial District/SoMa; Dogpatch -> Mission Bay/Potrero/Showplace; Showplace -> SoMa/Design/Potrero. | KG `relationships.compareWith` reasons. | Need distance/proximity and adjacency type separate from editorial comparison type. |
| North of Market preference | "We prefer north of Market." | Strongly weights Financial District and Jackson Square; may keep South Beach as edge case; moves Mission Bay, Dogpatch, Potrero lower. | Financial District vs Jackson Square is the first comparison. | No explicit north/south-of-Market field. Some inference possible from district names and relationships, but should be editorial metadata. | Missing canonical geographic tags such as `northOfMarket`, `southOfMarket`, `waterfront`, `caltrainOriented`. |
| Employee commute orientation | "Most employees commute from Marin." | Strongly weights northern SF, ferry/BART/Muni/fewer freeway-friction locations; should not hard-filter. | Financial District and Jackson Square rise; South Beach may remain if transit/client mix matters; Presidio/Marina not currently in canonical office universe. | KG has transit/parking, city questions mention Peninsula/East Bay alternatives; Financial District strengths cite BART/ferry access. | Missing commute-origin-to-district access model, bridge/ferry orientation, drive/transit mode split. |
| Landmark or institution proximity | "We need to be near UCSF." | Strongly weights Mission Bay; introduces Dogpatch as adjacent alternative; may keep SoMa/South Beach secondary. | Mission Bay -> Dogpatch, SoMa, Financial District; Dogpatch -> Mission Bay/Potrero/Showplace. | KG Mission Bay strengths include UCSF and life-science adjacency; CME/CBI include Mission Bay and Dogpatch evidence. | Need explicit landmark graph: UCSF, Caltrain, Transbay, Ferry Building, Moscone, courts, hospitals. |
| Remain within San Francisco | "Only San Francisco." | Hard filter to San Francisco districts. | Nearby markets may be mentioned as excluded alternatives, not recommended. | Operational market metadata exists in KG. | Need UI/input support for hard vs soft boundary. |
| Willing to consider nearby markets | "Compare nearby markets if they may fit better." | Allows Peninsula, East Bay, South Bay alternatives only when signal is strong. | For San Francisco office, possible future alternatives include Downtown Oakland/Jack London/Emeryville, Downtown Palo Alto/Stanford Research Park, North Bayshore, North San Jose. | KG contains some Bay Area market/district nodes and relationships, e.g. Mission Bay -> North Bayshore. | Need consistent cross-market substitute rules. Example: Jack London Square -> Alameda/Emeryville should be modeled in the Oakland/East Bay office model, not guessed here. |

Examples:

- Jackson Square anchor: Rofo should start with Jackson Square, then compare Financial District for more traditional office scale and SoMa for broader adaptive/creative inventory. This is supported by KG compareWith relationships.
- Union Square anchor: Union Square is not currently part of the canonical San Francisco commercial district universe in the inspected Knowledge Graph. It should not be inferred into the model until canonical district identity exists. It may be captured as a landmark/corridor constraint and routed to nearby Financial District, Jackson Square, SoMa, or Mission District hypotheses only with clear labeling.
- Marin-oriented commute: Financial District and Jackson Square likely rise because of northern downtown/ferry/BART orientation, but this needs normalized commute metadata before becoming production logic.
- UCSF proximity: Mission Bay should rise, Dogpatch should enter as an adjacent/supporting alternative, and Financial District should fall unless client-facing address remains a major priority.
- Jack London Square leading to Alameda or Emeryville: this belongs to a future East Bay/Oakland office model. The SF model should document it as a pattern, not implement it.

---

## 5. Office Priority Dimensions

Priorities determine ranking among eligible districts. They should only be included when they can change the shortlist meaningfully.

### Launch-Critical

| Dimension | Definition | User-facing wording | Answer format | Expected impact | Relevant attributes | Existing support | Include first release? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Regional transit | Ability to serve employees/clients via BART, ferry, Caltrain, Muni, and regional transit nodes. | "How important is regional transit access?" | Not important / helpful / very important | Raises Financial District, SoMa, Mission Bay, South Beach, Jackson Square; lowers medium-transit creative/flex districts. | `attributes.transit`; district strengths/questions | KG supports high/medium/low; resolver has transit priority rule. | Yes |
| Client access and professional image | Need for clients, investors, partners, or executives to visit a credible workplace. | "Will clients or partners visit your office regularly?" | Rarely / sometimes / often | Raises Financial District, Jackson Square, South Beach; can keep SoMa for creative client-facing users. | `customerAccess`, `executiveImage`, `corporateEnvironment` | KG supports attributes; taxonomy has client_meetings and archetypes. | Yes |
| Growth flexibility | Need to expand team or find larger contiguous space over time. | "How much room to grow do you need?" | Stable / some growth / significant growth / unsure | Raises Mission Bay; keeps SoMa/South Beach; lowers Jackson Square and Mission District for larger needs. | `expansionFlexibility`; fit tradeoffs | KG supports high/medium/low; search profile lacks growth question. | Yes, after adding input |
| Building character | Preference for traditional tower, modern campus, creative/adaptive, boutique historic, or neighborhood character. | "What kind of office environment would fit the business?" | Choose one or two character preferences | Differentiates Financial District, Mission Bay, SoMa, Jackson Square, Showplace/Dogpatch/Potrero. | `creativeEnvironment`, `corporateEnvironment`, strengths, spaceTypeFit summaries | KG supports attributes and narrative but not a normalized building-character enum. | Yes, with limited options |
| Parking and driving practicality | Need for employee/visitor parking or easier auto access. | "Will parking or driving access materially affect the decision?" | No / somewhat / yes | Lowers Financial District, Jackson Square, SoMa, South Beach, Mission District when critical; raises Mission Bay and medium-parking creative/flex districts modestly. | `parking`, `freewayAccess` | KG supports high/medium/low; resolver has parking/drive rules. | Yes |
| Amenities and walkability | Importance of restaurants, services, walkability, and daily employee experience. | "How important is walkability and nearby food/amenities?" | Low / medium / high | Raises Financial District, SoMa, Jackson Square, South Beach, Mission District; moderates Mission Bay and creative/flex districts. | `walkability`, `amenities` | KG supports high/medium/low; resolver has walkability/amenity rules. | Yes |
| Cost sensitivity | Whether occupancy cost/value should outweigh image or polish. | "How sensitive is the search to cost?" | Low / moderate / high | Should lower low-costPosition districts and raise high-costPosition districts; current SF data mostly low/medium and needs calibration. | `costPosition` | KG has costPosition, but semantics need normalization. Resolver treats high as better for lower-cost priority. | Yes only after normalization |

### Useful Later

| Dimension | Why useful | Reason to defer |
| --- | --- | --- |
| Employee commute by origin | Can materially alter SF office rankings. | Needs commute-origin model and mode-specific access data. |
| Technology ecosystem | Useful for startups, AI, product teams. | KG has bestFor/strengths but needs normalized ecosystem intensity. |
| Financial-services ecosystem | Useful for finance/legal/advisory users. | KG and taxonomy support it narratively; needs explicit district ecosystem scoring. |
| Life-science adjacency | Strong differentiator for Mission Bay/Dogpatch. | Can be included if business type asks for life-science-adjacent office; needs clear boundary from life-science space type. |
| Outdoor space/waterfront access | Differentiates Mission Bay, South Beach, Dogpatch. | Current support is narrative; needs normalized attribute. |
| Quiet professional environment | Helps distinguish Jackson Square/certain boutique districts. | Too subjective without editorial definition. |
| Modern office inventory | Important for Mission Bay, South Beach, SoMa, Financial District. | Current support exists in strengths/building evidence but needs normalized district attribute. |
| Historic/creative character | Important for Jackson Square, SoMa, Showplace, Dogpatch. | Partially supported by `creativeEnvironment`; needs character taxonomy. |

### Unsupported or Too Subjective for Launch

| Dimension | Reason |
| --- | --- |
| "Coolest neighborhood" | Too subjective and likely to produce marketing copy rather than decision support. |
| Real-time rent advantage | Requires current market data; repository only has editorial costPosition. |
| Exact commute times | Requires origin, mode, time-of-day, and external routing data. |
| Live availability depth | Broker/listing execution step, not top-of-funnel district shortlist. |

---

## 6. District Attribute Matrix

Use the repository-native scale: `high`, `medium`, `low`, `unknown`.

For cost, current `attributes.costPosition` appears to mean relative value/cost advantage in the resolver because lower-cost priority rewards `high`. In the San Francisco district data, premium districts often have `low`. This should be renamed before production to avoid ambiguity, e.g. `valuePosition` or `costAdvantage`.

All matrix values below are source-backed from `_data/locationKnowledgeGraph.js` district `attributes` unless noted.

| District | Transit | Parking | Walkability | Client access | Professional image | Growth flexibility | Amenities | Cost/value position | Creative character | Corporate/modern environment | Source status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Financial District | high | low | high | high | high | medium | high | medium | unknown | high | Source-backed |
| Jackson Square | high | low | high | high | high | low | high | low | high | medium | Source-backed |
| SoMa | high | low | high | high | medium | medium | high | medium | high | unknown | Source-backed |
| Mission Bay | high | medium | medium | medium | high | high | high | low | unknown | high | Source-backed |
| South Beach | high | low | high | high | medium | medium | high | medium | unknown | medium | Source-backed |
| Showplace Square | medium | medium | medium | medium | medium | medium | medium | medium | high | unknown | Source-backed |
| Dogpatch | medium | medium | medium | medium | medium | medium | medium | medium | high | unknown | Source-backed |
| Design District | medium | medium | medium | medium | medium | medium | medium | medium | high | unknown | Source-backed |
| Potrero Hill | medium | medium | medium | medium | medium | medium | medium | medium | high | unknown | Source-backed |
| Mission District | high | low | high | high | medium | low | high | medium | high | unknown | Source-backed |

What the matrix shows:

- A city + office starting set can meaningfully differentiate districts today.
- The current data is strongest for transit, parking, walkability, client access, expansion flexibility, amenities, broad image, and creative/corporate character.
- Several fields are too coarse for production ranking without editorial normalization: cost/value position, modern office inventory, commute orientation, and district scale.
- The matrix lacks explicit north/south-of-Market, waterfront, Caltrain, ferry, UCSF, Transbay, and Golden Gate access tags.

---

## 7. Ranking Behavior

### Initial Consideration Set

With only city + space type:

1. Identify the city node from `_data/locationKnowledgeGraph.js`.
2. Use a city-by-space-type starting set, not the generic resolver's top three.
3. Include four to seven districts.
4. Avoid numeric ranking language.
5. Explain roles: traditional office core, creative/adaptive option, modern growth option, boutique executive option, waterfront/mixed-use option, creative production-adjacent option.

### Facts and Eligibility

- Market and space type define the universe.
- Team scale and growth do not usually exclude a district, but they can move districts into secondary status.
- Very large growth needs can move Jackson Square and Mission District down because KG data labels their expansion flexibility low.
- Very specific operational requirements, e.g. lab, loading, or patient access, may route the user to another space-type model or hybrid model.

### Constraints

- Hard filters should be rare and explicit: "only San Francisco", "only this district", "must be near UCSF", "must support heavy parking".
- Soft constraints should strongly weight districts but keep alternatives visible.
- Adjacent alternatives should be introduced when a constraint narrows too quickly or when repository relationships support a useful comparison.

### Priorities

Use transparent additive editorial rules:

- each selected priority maps to one or more district attributes
- high match produces a positive signal
- medium match keeps a district viable
- low match can move a district down when the priority is important
- narrative bestFor/strengths can support explanation but should not silently override structured attributes

The current `js/recommendation-resolver.js` already follows this direction with `priorityAttributeRules`, `fitScore`, `priorityScore`, and `explainRecommendation`. The SF office model should replace generic string matching with a curated city-by-space-type priority map.

### When Numbered Ranking Is Appropriate

- Starting set: no numbered ranking. Use "Initial districts worth exploring."
- Emerging ranking: after at least two meaningful signals beyond city + space type, e.g. team scale and client access, or transit and growth.
- Refined shortlist: after facts plus at least one constraint or two priorities. Numbered ranking is acceptable if explanations identify the user signals that changed the order.

### When Districts Enter or Move Secondary

- Enter consideration when a user signal matches a district's bestFor, strengths, or high attribute.
- Move secondary when it remains relevant but is weaker on the user's highest-priority signals.
- Exclude only when the user provides an explicit hard constraint or a true space-type mismatch.

### Ties and Near-Ties

Near-ties should not be forced into artificial precision. Present them as role-based alternatives:

- "Financial District and Jackson Square are both strong north-downtown options; choose Financial District for larger tower inventory and transit, Jackson Square for boutique character."
- "SoMa and South Beach are close if central access matters; choose SoMa for creative/adaptive range, South Beach for waterfront/Transbay adjacency."

---

## 8. Evolving Recommendation Examples

### Example A: San Francisco Office Search Only

Known facts:

- Market: San Francisco
- Space type: Office

Constraints:

- None

Priorities:

- None

Resulting initial consideration set:

- Financial District: traditional office core and client-facing business address.
- SoMa: central creative/adaptive office and technology-oriented alternative.
- Mission Bay: newer innovation district with UCSF/life-science adjacency and growth flexibility.
- Jackson Square: boutique executive and character-driven downtown-adjacent option.
- South Beach: waterfront, Transbay, ballpark, and South Financial District adjacency.
- Showplace Square: creative office and production-adjacent technology/product-team option.

What changed:

- Nothing is ranked yet. Rofo has established the district universe and the most credible starting paths.

Remaining questions:

- Do clients visit?
- How large is the team likely to become?
- Do employees rely on transit, driving, or a regional commute pattern?
- Does the business want polished towers, creative buildings, or modern campus-like inventory?

### Example B: Small or Midsized Team Prioritizing Transit, Client Access, and Professional Image

Known facts:

- Market: San Francisco
- Space type: Office
- Team scale: small or midsized

Constraints:

- None

Priorities:

- Regional transit
- Client access
- Professional image

Refined shortlist:

1. Financial District
2. Jackson Square
3. South Beach
4. SoMa

What changed:

- Financial District rises because KG attributes are high for transit, customerAccess, executiveImage, amenities, and corporateEnvironment.
- Jackson Square rises because it is high for transit, customerAccess, executiveImage, walkability, and creativeEnvironment, with a strong fit for boutique office users.
- South Beach remains strong because it has high transit, walkability, customerAccess, and downtown proximity, but less singular office identity than Financial District or Jackson Square.
- SoMa remains a strong alternative, especially for creative or technology users, but its executiveImage is medium.

Remaining questions:

- Is formal CBD image more important than boutique character?
- How much contiguous expansion space might be needed?
- Is visitor parking a real constraint?

### Example C: Team Commuting from Marin That Values Parking, Lower-Rise Character, and Amenities

Known facts:

- Market: San Francisco
- Space type: Office

Constraints:

- Employee commute orientation: Marin

Priorities:

- Parking/driving practicality
- Lower-rise or character-oriented buildings
- Amenities

Emerging shortlist:

1. Jackson Square
2. Financial District
3. South Beach
4. Dogpatch or Potrero Hill as exploratory alternatives

What changed:

- Jackson Square rises because it combines north-downtown geography, high walkability, high amenities, high executiveImage, and high creativeEnvironment. Its parking remains low, so this is not a perfect fit.
- Financial District remains high because ferry/BART/downtown access may matter for Marin-oriented teams, but parking sensitivity is a negative.
- South Beach remains viable because amenities, mixed-use setting, and downtown adjacency are strong, but parking is low.
- Dogpatch/Potrero may enter only as exploratory alternatives for lower-rise and parking/practicality signals, not because current repository data directly supports a Marin commute advantage.

Remaining questions:

- Is Marin commute primarily ferry, Golden Gate Bridge driving, or employee preference?
- Is parking required for employees or only occasional visitors?
- Would a North Bay or Marin market be considered if San Francisco is not mandatory?

Source caveat:

- The repository does not yet have commute-origin or bridge/ferry orientation metadata. This example includes an editorial hypothesis that must be validated before production scoring.

### Example D: Growing Technology Company Prioritizing Modern Offices, Hiring, Transit, and Expansion Flexibility

Known facts:

- Market: San Francisco
- Space type: Office
- Growth expectation: significant growth

Constraints:

- Remain within San Francisco unless a much stronger nearby market emerges.

Priorities:

- Modern office inventory
- Hiring/talent access
- Regional transit
- Expansion flexibility

Refined shortlist:

1. Mission Bay
2. SoMa
3. South Beach
4. Showplace Square
5. Dogpatch as a specific office/R&D or adaptive-reuse alternative

What changed:

- Mission Bay rises because KG marks transit high, expansionFlexibility high, talentAccess high, amenities high, and corporateEnvironment high; strengths include newer office inventory, UCSF/life-science adjacency, Caltrain and waterfront access, and modern innovation context.
- SoMa remains high because it has high transit, high talentAccess, high amenities, creative office inventory, central access, and adaptive buildings.
- South Beach remains relevant because of Transbay/waterfront/mixed-use adjacency and high transit/customerAccess.
- Showplace Square enters because it is strong for creative office, AI, robotics, and product teams, with high creativeEnvironment and talentAccess.
- Dogpatch enters as a secondary option if office/R&D, adaptive reuse, or Mission Bay adjacency matters.

Remaining questions:

- Does the company need conventional office, office/R&D, or life-science-adjacent space?
- Is premium cost acceptable?
- Is Caltrain, BART, ferry, or driving most important?
- How much contiguous expansion space is needed?

---

## 9. Explanation Model

Explanations should identify user signals and district attributes. They should avoid opaque phrasing.

### District Moving Up

Pattern:

> [District] moved up because you prioritized [signals], and it is strong on [district attributes].

Example:

> Mission Bay moved up because you prioritized growth flexibility, modern office inventory, and transit. The district is source-backed as high for expansion flexibility, talent access, amenities, and transit, with newer office inventory and UCSF adjacency.

### District Moving Down

Pattern:

> [District] moved down because [user signal] conflicts with [district limitation]. It remains relevant if [alternate condition].

Example:

> Jackson Square moved down because you expect significant growth, and the Knowledge Graph marks its expansion flexibility as low. It remains a strong alternative if boutique character and client-facing image matter more than expansion room.

### New District Entering Consideration

Pattern:

> [District] entered because [new signal] matches [district fit or relationship].

Example:

> Dogpatch entered because you selected adaptive character and office/R&D flexibility. Rofo already links Dogpatch with Mission Bay and Showplace Square as nearby alternatives for innovation and creative-production users.

### Strong Alternative

Pattern:

> [District] remains worth comparing because it solves a different version of the same search.

Example:

> SoMa remains a strong alternative because it offers central access and creative/adaptive office range, while Mission Bay offers a more modern innovation-district context.

### Hard Constraint Exclusion

Pattern:

> [District] is excluded because you set [hard boundary]. It may be revisited if that boundary changes.

Example:

> Mission Bay is excluded because you limited the search to north of Market. If the boundary softens, it should re-enter for growth-stage technology or life-science-adjacent teams.

### Adjacent or Nearby Alternative

Pattern:

> Because you are considering [anchor], [alternative] is worth comparing when [relationship reason].

Example:

> Because you are considering Jackson Square, Financial District is worth comparing if larger office inventory and a more traditional CBD address matter. SoMa is worth comparing if creative/adaptive inventory matters more.

---

## 10. Confidence States

Do not use numerical confidence percentages for this model until a defensible confidence system exists.

| State | What Rofo knows | Responsible claim | UI language | Input that improves confidence |
| --- | --- | --- | --- | --- |
| Starting set | Market and space type | These are credible districts worth exploring, not a ranked recommendation. | "Initial districts worth exploring" | Team scale, growth, client access, commute, building character |
| Emerging ranking | Market, space type, and two or more meaningful signals | Some districts now fit the profile more directly than others. | "Early recommendation" or "Emerging shortlist" | Hard constraints, business type, parking, growth, transit mode |
| Refined shortlist | Core facts plus at least one constraint or two priorities | Rofo can explain a ranked shortlist and tradeoffs. | "Recommended starting locations" | Broker validation, live availability, budget, exact building requirements |

Confidence should communicate completeness:

- what Rofo knows
- what changed the shortlist
- what still needs validation

It should not imply lease-level certainty.

---

## 11. Data Gap Analysis

| Required attribute | Existing source | Current quality | Missing work | Blocks launch? | Suggested owner/workstream |
| --- | --- | --- | --- | --- | --- |
| Canonical SF district identity | `_data/locationKnowledgeGraph.js`, `_data/commercialBuildingIntelligence.js` | Strong for 10 districts | Keep IDs synchronized across KG, CME, CBI | No | Knowledge Graph |
| Office fit by district | `_data/locationKnowledgeGraph.js` `spaceTypeFit.office` | Strong enough for MVP | Add editorial review dates/versioning | No | Knowledge Graph / Product Editorial |
| District attributes | `_data/locationKnowledgeGraph.js` `attributes` | Useful but coarse | Normalize definitions for `costPosition`, `corporateEnvironment`, `creativeEnvironment`, `modernInventory` | Partial | Knowledge Graph |
| Commercial Market Evidence | `_data/commercialMarketEvidence.js`, `data/commercial-market-evidence/san-francisco/*.js` | Strong; 10 collections exist | Normalize which CME records map to office decision dimensions | No | CME |
| Representative buildings | `_data/commercialBuildingIntelligence.js` | Strong; 131 SF canonical buildings and district counts | Select which buildings support each district explanation in Location Brief | No | Building Evidence |
| Building Profile depth | `_data/commercialBuildingIntelligence.js`, building pages | Improving, uneven by district/status | Ensure representative buildings used in recommendations have adequate brief depth | Partial | Building Evidence |
| Nearby relationships | KG `relationships.compareWith`, CBI `relatedDistricts` | Useful editorial comparisons | Separate adjacency, substitute, contrast, and cross-market alternatives | Partial | Knowledge Graph |
| Geographic tags | Partial narrative only | Weak | Add explicit tags: northOfMarket, southOfMarket, waterfront, Caltrain, ferry, UCSF, Transbay, freeway orientation | Partial | Knowledge Graph |
| Commute orientation | None explicit | Missing | Build mode/origin/district commute model for Marin, East Bay, Peninsula, South Bay, downtown transit | Not for MVP, blocks commute-specific ranking | Geography / Recommendations |
| Cost/value | KG `costPosition` | Ambiguous | Rename or define semantics; add editorial calibration | Yes for cost-sensitive ranking | Publisher / Product Editorial |
| Team scale/growth inputs | `js/search-profile.js` has size; no office headcount/growth | Weak | Add Business Profile facts before implementation | Partial | PX / Recommendations |
| Priority definitions | `js/recommendation-resolver.js` generic priority rules | Useful prototype | Create SF office-specific priority map | Yes for production quality | Recommendations |
| Landmark graph | Narrative references only | Missing | Add UCSF, Caltrain, Transbay, Ferry Building, Moscone, courts, bridge/ferry orientation | Not for MVP except UCSF/north-of-Market examples | Knowledge Graph |

---

## 12. Proposed Data Shape

Do not implement this yet. The shape below is an editorially maintainable JavaScript data module or JSON-like source file compatible with the current Eleventy/JavaScript repository.

```js
module.exports = {
  schemaVersion: "location-decision-model-v1",
  marketId: "san-francisco",
  marketName: "San Francisco",
  spaceType: "office",

  startingSet: {
    mode: "initial_consideration_set",
    districtIds: [
      "financial-district",
      "soma",
      "mission-bay",
      "jackson-square",
      "south-beach",
      "showplace-square",
    ],
    secondaryDistrictIds: [
      "dogpatch",
      "design-district",
      "potrero-hill",
      "mission-district",
    ],
    rationaleByDistrict: {
      "financial-district": "Traditional office core and client-facing business address.",
      soma: "Central creative/adaptive office and technology-oriented alternative.",
    },
  },

  facts: [
    {
      id: "market",
      required: true,
      question: "Where are you thinking about locating?",
      affects: ["eligibleUniverse"],
    },
    {
      id: "teamScale",
      required: true,
      question: "How many people regularly work from the office?",
      affects: ["districtScale", "expansionFlexibility", "sizeEstimate"],
    },
  ],

  constraints: [
    {
      id: "districtAnchor",
      question: "Is there a district or place you already want to test?",
      effect: "strong_weight",
      hardFilterAllowed: true,
      relationshipTypesUsed: ["adjacent", "substitute", "contrast"],
    },
    {
      id: "remainWithinMarket",
      question: "Should Rofo stay within San Francisco?",
      effect: "hard_filter",
    },
  ],

  priorities: [
    {
      id: "regionalTransit",
      question: "How important is regional transit access?",
      includedInLaunch: true,
      attributes: ["transit"],
      weight: 1,
      explanationLabel: "regional transit",
    },
    {
      id: "clientAccess",
      question: "Will clients or partners visit your office regularly?",
      includedInLaunch: true,
      attributes: ["customerAccess", "executiveImage"],
      weight: 1,
      explanationLabel: "client access and professional image",
    },
  ],

  districtAttributes: {
    "financial-district": {
      source: "_data/locationKnowledgeGraph.js",
      values: {
        transit: "high",
        parking: "low",
        walkability: "high",
        customerAccess: "high",
        executiveImage: "high",
        expansionFlexibility: "medium",
        amenities: "high",
        valuePosition: "medium",
        creativeEnvironment: "unknown",
        corporateEnvironment: "high",
      },
    },
  },

  nearbyAlternatives: {
    "jackson-square": [
      {
        districtId: "financial-district",
        relationshipType: "larger_traditional_office_core",
        explanation: "Compare when larger office inventory and a more formal CBD address matter.",
      },
      {
        districtId: "soma",
        relationshipType: "creative_adaptive_inventory",
        explanation: "Compare when adaptive or creative office range matters more.",
      },
    ],
  },

  confidenceRequirements: {
    startingSet: ["market", "spaceType"],
    emergingRanking: ["market", "spaceType", "twoMeaningfulSignals"],
    refinedShortlist: ["market", "spaceType", "oneConstraintOrTwoPriorities", "teamScaleOrSize"],
  },
};
```

The production version should reference Knowledge Graph district IDs rather than duplicating full district records. Editors should maintain the city-by-space-type starting set, priority definitions, and explanation metadata. Engineering should resolve those IDs into Knowledge Graph, CME, and Building Evidence at build time.

---

## 13. Initial Implementation Recommendation

### Minimum Viable San Francisco Office Model

Districts included:

- Initial consideration set: Financial District, SoMa, Mission Bay, Jackson Square, South Beach, Showplace Square.
- Secondary but eligible: Dogpatch, Design District, Potrero Hill, Mission District.

Core facts:

- Market/location
- Space type
- Team scale or regular daily occupancy
- Growth expectation
- Optional approximate square footage
- Optional business archetype

Supported constraints:

- Specific district anchor
- Include nearby alternatives
- Remain within San Francisco
- Willingness to consider nearby markets
- UCSF/institution proximity as a narrow first landmark constraint
- North-of-Market preference after adding explicit metadata

Launch-critical priorities:

- Regional transit
- Client access and professional image
- Growth flexibility
- Building character
- Parking/driving practicality
- Amenities/walkability
- Cost sensitivity only after `costPosition` is normalized

Attributes already usable:

- `spaceTypeFit.office.fit`
- `spaceTypeFit.office.summary`
- `attributes.transit`
- `attributes.parking`
- `attributes.walkability`
- `attributes.customerAccess`
- `attributes.executiveImage`
- `attributes.expansionFlexibility`
- `attributes.amenities`
- `attributes.creativeEnvironment`
- `attributes.corporateEnvironment`
- `strengths`
- `tradeoffs`
- `questionsToValidate`
- `relationships.compareWith`
- CBI district representative buildings and building roles
- CME district evidence collections

Data work required before coding:

1. Normalize `costPosition` semantics into a clear launch field such as `valuePosition` or `costAdvantage`.
2. Add office model metadata for district character: traditional tower, boutique historic, modern innovation, creative/adaptive, waterfront/mixed-use, production-adjacent, neighborhood.
3. Add a small set of geographic tags: northOfMarket, southOfMarket, waterfront, Caltrain-oriented, ferry/BART-oriented, UCSF-adjacent, Transbay-adjacent.
4. Add Business Profile inputs for team scale and growth expectation.
5. Define a curated SF office priority map instead of relying only on generic priority string matching.
6. Select representative buildings per district for Location Brief explanation so the shortlist feels tangible.

Intentionally deferred:

- exact commute-time scoring
- live rents and availability
- every possible landmark
- precise neighborhood boundary math
- full Bay Area cross-market office alternatives
- numerical confidence percentages
- building-level lease recommendation

### Readiness Answer

Rofo can build a credible, differentiated San Francisco office shortlist experience with the data it has today, but implementation should begin only after a focused data-normalization sprint.

The viable MVP scope is strong:

- 10 canonical San Francisco districts exist.
- 6 districts can form a credible starting set.
- The repository already differentiates districts by office fit, transit, parking, walkability, client access, image, expansion flexibility, amenities, creative character, tradeoffs, and nearby comparisons.
- CME and Building Evidence are deep enough to support a Location Brief that demonstrates expertise.

The minimum data sprint before coding should normalize cost/value, district character, geographic tags, team/growth inputs, and SF office priority definitions. Without that sprint, Rofo can produce a useful prototype, but production recommendations would risk ambiguous cost behavior and weak commute/geographic explanations.

