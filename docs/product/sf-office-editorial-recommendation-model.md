# San Francisco Office Editorial Recommendation Model

Status: Draft for editorial and product review

Audience: Product, editorial, recommendation engineering, Publisher, EOS

Related documents:

- `docs/product/rofo-product-experience-vision.md`
- `docs/product/commercial-location-decision-model.md`
- `docs/product/sf-office-location-decision-model.md`

This document defines the editorial recommendation model for San Francisco office searches. It does not implement scoring, production recommendation logic, UI changes, or broker workflows.

Rofo is a top-of-funnel commercial location decision-support product. It helps a business create a defensible shortlist of locations worth investigating, discussing internally, or handing to a broker.

Rofo recommends where to look. The broker validates current market conditions, available buildings, lease economics, and transaction details.

## 1. Scope and Product Boundary

### Job supported

A business considering office space in San Francisco wants to determine which districts deserve further investigation and why.

The model supports:

- An initial San Francisco office district consideration set.
- A progressively refined district shortlist as Rofo learns business facts, geographic constraints, and priorities.
- Clear explanations for why a district rises, falls, enters, remains tied, becomes secondary, or is excluded.
- A Location Brief that gives the user enough confidence to discuss the shortlist with colleagues or a broker.

The model does not support:

- Selecting a specific lease.
- Ranking available listings.
- Quoting current rents or asking rates.
- Estimating concessions.
- Predicting landlord motivation.
- Recommending lease terms.
- Evaluating current vacancies.
- Replacing broker market validation.

Rofo understands the business so the broker can focus on the market.

### Recommendation unit

The recommendation unit is the District, using the canonical commercial geography model:

Region -> Market -> District

For this model:

- Region: Bay Area
- Market: San Francisco
- Space type: Office
- Districts: the office-relevant San Francisco districts represented in repository source data.

### Repository grounding

Repository-supported inputs inspected:

- `_data/locationKnowledgeGraph.js`: district identity, operational market ownership, office fit, district attributes, best-fit users, strengths, tradeoffs, questions to validate, nearby comparisons.
- `_data/commercialMarketEvidence.js`: completed Commercial Market Evidence collections and evidence record counts.
- `data/commercial-market-evidence/san-francisco/*.js`: district evidence collections.
- `_data/commercialBuildingIntelligence.js`: canonical building intelligence, district building counts, representative building source depth.
- `_data/commercialEcosystemTaxonomy.js`: ecosystem taxonomy used to describe commercial contexts.
- `js/recommendation-resolver.js`: current recommendation resolver behavior, including fit scoring, priority matching, explanation generation, and the current top-three cutoff.
- `js/search-profile.js`: current Business Profile question structure and available answer choices.
- `docs/product/commercial-location-decision-model.md`: general decision model.
- `docs/product/sf-office-location-decision-model.md`: first San Francisco office matrix.

## Launch Editorial Decisions

These decisions resolve the remaining San Francisco Office launch questions and should be treated as the governing editorial rules for structured-data implementation.

### Final launch initial consideration set

For a generic San Francisco + Office search, Rofo should begin with five unranked districts:

- Financial District.
- SoMa.
- Mission Bay.
- Jackson Square.
- South Beach.

This is not a forced top five. It is the smallest launch starting set that covers the durable office strategies currently supported by repository data:

- Traditional downtown and client-facing office.
- Central technology and creative office.
- Modern growth and innovation-oriented office.
- Boutique, polished, lower-rise professional office.
- Access-oriented waterfront and Transbay-adjacent office.

Showplace Square, Dogpatch, Design District, Potrero Hill, and Mission District remain eligible, but they should enter through specific user signals rather than appearing by default for a generic office user.

### South Beach decision

Launch decision: default initial set.

South Beach should remain in the default initial consideration set for San Francisco office. Repository data supports `south-beach` as a strong office-fit district with high transit, walkability, customer access, and talent access, plus a distinct waterfront and Transbay-adjacent role. Its durable value is not that it is a generic midpoint between SoMa, Mission Bay, and Financial District. Its launch role is an access-oriented bridge district for users who may need downtown-adjacent credibility, SoMa/Mission Bay proximity, and a less purely traditional identity than Financial District.

South Beach is differentiated enough to appear before additional user signals because it teaches a real San Francisco office tradeoff:

- Financial District: strongest traditional business core.
- SoMa: central creative and technology-oriented office.
- Mission Bay: modern growth and innovation.
- Jackson Square: boutique, polished, lower-rise professional context.
- South Beach: access-oriented bridge between downtown, SoMa, Mission Bay, waterfront, and Transbay contexts.

South Beach should rise when transit, client access, regional access, waterfront-adjacent identity, or comparison between downtown and Mission Bay matters. It should fall when the user wants a clearer boutique, creative-industrial, neighborhood, or specialized life-science identity.

### Showplace Square decision

Launch decision: signal-specific.

Showplace Square should not appear in the default initial consideration set for a generic San Francisco office user. Although repository data supports strong office fit, it is more specialized than the five launch starting districts. Its durable value is creative, product-oriented, design-adjacent, lower-rise, and less conventional office character rather than broad office applicability.

Showplace Square should enter or rise when the user signals:

- Creative or product-oriented company.
- AI, robotics, hardware, maker, or applied-technology context.
- Lower-rise or adaptive commercial building preference.
- Parking or driving access matters, but not enough to leave San Francisco.
- Access to Potrero Hill, Dogpatch, Design District, or southern SoMa matters.
- Design ecosystem, showroom adjacency, or less conventional office character matters.

Showplace Square should remain secondary when SoMa is a stronger central choice but the user may prefer a more creative and production-adjacent alternative.

### Mission District decision

Launch decision: secondary and signal-specific.

Mission District should not appear for a generic office user at launch. Repository data supports office relevance, but the fit is selective: neighborhood identity, creative culture, nonprofit and mission-driven organizations, restaurants and amenities, BART access, local customer visibility, and informal or unconventional office environments.

Mission District should enter when the user signals:

- Neighborhood identity matters more than conventional office image.
- Creative culture or informal environment matters.
- Nonprofit, mission-driven, community-oriented, or local-serving work.
- Restaurants, amenities, walkability, and neighborhood energy are primary.
- BART access is useful but the user does not require traditional downtown image.

Mission District should fall when frequent client visits, polished professional image, expansion flexibility, parking, or traditional office environment dominate.

### Cost and budget decision

Launch decision: no budget, current-cost, rent, or "cheap versus expensive" ranking behavior.

Rofo should not use exact budget, current asking rents, concessions, landlord motivation, current availability, or unsupported district price assumptions to rank districts.

If a user says "we do not want to overspend," "we want good value," or "cost matters," Rofo should preserve that as business context for broker handoff. It should not raise or lower districts based on current pricing or `attributes.costPosition`.

Stable district characteristics that may responsibly inform the conversation without implying current pricing:

- Inventory depth.
- Range of building types.
- Ability to support different workplace styles.
- Availability of nearby substitute districts.
- Need for broker validation when a district is specialized, high-image, or inventory-constrained.

Recommended explanation:

"Rofo will keep cost sensitivity in the Business Profile for broker review. At the district stage, it will avoid unsupported price claims and instead focus on which locations fit the business, where the tradeoffs are, and what the broker should validate in the live market."

### Office-environment decision

Launch decision: replace vague "nice office" language with one clarifying office-environment question.

Rofo should not map vague phrases such as "nice," "impressive," or "cool" directly to districts. These phrases can mean different things: polished, modern, distinctive, creative, traditional, lower-rise, or neighborhood-oriented.

Normalized question:

"What kind of office environment would fit the business?"

Launch answer choices:

- Modern and polished.
- Historic and distinctive.
- Creative and informal.
- Traditional and professional.
- Lower-rise and neighborhood-oriented.
- Not sure yet.

Recommendation behavior:

- Modern and polished: Mission Bay, South Beach, SoMa, and Financial District may rise depending on growth, transit, and client signals.
- Historic and distinctive: Jackson Square and SoMa may rise; Financial District can remain if professional image matters.
- Creative and informal: SoMa, Showplace Square, Dogpatch, Design District, Potrero Hill, and Mission District may enter or rise depending on business type.
- Traditional and professional: Financial District, Jackson Square, and South Beach may rise.
- Lower-rise and neighborhood-oriented: Jackson Square, Potrero Hill, Dogpatch, Design District, and Mission District may enter or rise, with scale and transit caveats.
- Not sure yet: no district movement; Rofo should ask a later clarifying question only if environment becomes the largest unresolved tradeoff.

## 2. Stable District Attributes Versus Dynamic Market Conditions

### Stable district attributes

Stable attributes are enduring enough to support a top-of-funnel district recommendation.

Examples:

- Geography.
- Transit orientation.
- Parking pattern.
- Walkability.
- Building character.
- District image.
- Industry ecosystem.
- Amenity environment.
- Client accessibility.
- Employee accessibility.
- Nearby relationships.
- Representative building types.
- Modern versus historic environment.
- Lower-rise versus high-rise character.

Repository support:

- `_data/locationKnowledgeGraph.js` supports many stable attributes through `spaceTypeFit.office`, `attributes`, `bestFor`, `strengths`, `tradeoffs`, `questionsToValidate`, and `relationships.compareWith`.
- `_data/commercialMarketEvidence.js` supports source-backed district evidence collections for the ten San Francisco districts included in this model.
- `_data/commercialBuildingIntelligence.js` supports representative building evidence and district-level building counts.

### Dynamic market conditions

Dynamic market conditions change too frequently or depend too heavily on active brokerage knowledge to drive Rofo's district recommendation model.

Examples:

- Current rents.
- Asking rates.
- Concessions.
- Sublease availability.
- Landlord motivation.
- Current vacancies.
- Building-specific economics.
- Lease structure.
- Current deal terms.

These conditions belong in Live Market Review and broker execution, not in the first-pass district model.

### Fields that currently mix concepts

Repository-supported issue:

- `_data/locationKnowledgeGraph.js` includes `attributes.costPosition` for multiple districts. This is currently used as if it were a durable district attribute.
- `js/recommendation-resolver.js` maps user priority language such as `lower cost`, `cost`, `budget`, and `value` to `attributes.costPosition` through `priorityAttributeRules`.
- Some district editorial copy and validation questions refer to economics-adjacent ideas such as premium rents, cost efficiency, or pricing sensitivity.

Recommendation:

- Do not use current rent, asking-rate, or budget language as a district-ranking priority.
- Do not use `attributes.costPosition` for San Francisco Office launch ranking.
- If Rofo keeps an economics-adjacent signal later, normalize it into stable editorial language such as inventory breadth, range of workplace formats, specialized inventory exposure, or need for broker economics validation.
- User statements such as "we do not want to overspend" should be treated as business context. They should not directly produce unsupported pricing judgments about districts.

## 3. District Editorial Profiles

This section defines editorial behavior for every office-relevant San Francisco district in the current eligible universe.

Evidence labels:

- Repository-supported: directly visible in source data.
- Normalized interpretation: derived from multiple repository fields and suitable for structured modeling after review.
- Editorial hypothesis: plausible but not yet sufficiently structured or validated.
- Missing evidence: needed before confident automation.

### Financial District

Repository support:

- `_data/locationKnowledgeGraph.js`: `financial-district`, `spaceTypeFit.office.fit = strong`, high confidence, office summary, best-fit office users, strengths, tradeoffs, validation questions, and comparison relationships.
- `_data/commercialMarketEvidence.js`: Financial District collection with 10 evidence records.
- `_data/commercialBuildingIntelligence.js`: 16 Financial District canonical building records.

Core identity:

- San Francisco's traditional high-concentration office and business address district.

Office environment:

- Dense, transit-oriented, client-facing, professionally legible.

Building character:

- Strong high-rise and corporate office identity, with recognizable Class A and institutional office stock represented in repository evidence.

Businesses that may fit well:

- Professional services.
- Finance-adjacent companies.
- Executive teams.
- Client-facing firms.
- Companies that value a recognized San Francisco business address.

Businesses that may struggle:

- Teams seeking lower-rise character.
- Teams that prioritize parking above transit.
- Companies wanting a distinctly creative or industrial feel.

Strongest enduring advantages:

- Regional transit.
- Client access.
- Executive image.
- Dense professional environment.
- Walkability and amenities.

Meaningful tradeoffs:

- Parking is limited.
- The environment may feel traditional or dense for companies seeking a creative neighborhood identity.

Nearby and adjacent alternatives:

- Jackson Square for smaller, polished, lower-rise character.
- SoMa for a more technology and creative office mix.
- South Beach for waterfront and Transbay-adjacent office context.
- Mission Bay when modern-growth and expansion flexibility matter more than traditional downtown identity.

When Rofo should introduce it:

- It belongs in the initial San Francisco office consideration set.

When it should rise:

- Client visits are frequent.
- Regional transit matters.
- Professional image matters.
- A traditional office environment is acceptable or preferred.

When it should fall:

- The user prioritizes parking, lower-rise character, creative district identity, or modern expansion-oriented inventory over downtown image.

When it should remain secondary:

- The user is office-appropriate but appears better matched to technology, life-science, creative, or lower-rise district character.

When it should be excluded only by a hard constraint:

- Explicitly avoiding downtown or high-rise environments.
- Explicit district anchor elsewhere with no willingness to compare downtown alternatives.

Unsupported editorial hypotheses:

- Fine-grained industry subsegment fit beyond the repository's broad professional and client-facing signals.
- Current economic advantage or disadvantage.

### SoMa

Repository support:

- `_data/locationKnowledgeGraph.js`: `soma`, strong office fit, high confidence, creative and adaptive office positioning, high transit, high walkability, high talent access, high creative environment.
- `_data/commercialMarketEvidence.js`: SoMa collection with 10 evidence records.
- `_data/commercialBuildingIntelligence.js`: 14 SoMa canonical building records.

Core identity:

- A central office district that bridges downtown access, technology-oriented demand, creative office character, and adaptive commercial buildings.

Office environment:

- More flexible and less traditionally corporate than Financial District, while still central and transit-supported.

Building character:

- Mix of modern office, converted, creative, and adaptive workplace environments.

Businesses that may fit well:

- Technology companies.
- Product teams.
- Design-led companies.
- Companies that want central access without a purely traditional downtown feel.

Businesses that may struggle:

- Firms requiring highly traditional executive image.
- Teams that strongly prioritize parking.
- Businesses seeking a quiet, lower-density professional environment.

Strongest enduring advantages:

- Central access.
- Transit.
- Talent access.
- Creative office character.
- Amenity and restaurant environment.
- Adjacency to Financial District, South Beach, Mission Bay, and Showplace Square.

Meaningful tradeoffs:

- It can be too broad as a district category without additional user context.
- Parking remains a constraint.
- Some users may need finer subdistrict guidance to avoid false precision.

Nearby and adjacent alternatives:

- Financial District for traditional office and client image.
- South Beach for Transbay and waterfront-adjacent access.
- Mission Bay for newer inventory and growth flexibility.
- Showplace Square for creative office and production-adjacent users.
- Mission District when neighborhood character and amenities matter more than formal office image.

When Rofo should introduce it:

- It belongs in the initial San Francisco office consideration set.

When it should rise:

- Technology ecosystem, recruiting, central access, modern or creative office environment, and flexibility matter.

When it should fall:

- The user strongly prefers traditional corporate image, quiet professional environment, parking, or a lower-rise boutique district.

When it should remain secondary:

- The user needs a central fallback but has a clearer primary fit in Financial District, Jackson Square, Mission Bay, or South Beach.

When it should be excluded only by a hard constraint:

- Explicitly avoiding central San Francisco or mixed urban office environments.

Unsupported editorial hypotheses:

- Subdistrict-level distinctions inside SoMa.
- Current availability or rent position.

### Mission Bay

Repository support:

- `_data/locationKnowledgeGraph.js`: `mission-bay`, strong office fit, high confidence, newer inventory, growth-stage companies, technology and life-science ecosystem, high expansion flexibility, high talent access.
- `_data/commercialMarketEvidence.js`: Mission Bay collection with 11 evidence records.
- `_data/commercialBuildingIntelligence.js`: 14 Mission Bay canonical building records.

Core identity:

- A newer, growth-oriented office and innovation district tied to technology, life science, UCSF, and modern campus-like environments.

Office environment:

- Modern, planned, growth-oriented, and institutionally anchored.

Building character:

- Newer office and life-science-adjacent buildings, often better suited to growth, lab-adjacent, or innovation-oriented companies than to small traditional service firms.

Businesses that may fit well:

- Technology companies.
- Life-science-adjacent companies.
- Research-oriented businesses.
- Growing teams prioritizing expansion flexibility.
- Companies that benefit from UCSF or innovation ecosystem proximity.

Businesses that may struggle:

- Firms needing traditional downtown client access.
- Teams seeking historic or boutique building character.
- Businesses whose clients expect a Financial District address.

Strongest enduring advantages:

- Modern inventory orientation.
- Growth flexibility.
- Technology and life-science ecosystem.
- Transit and regional access.
- Proximity to UCSF.

Meaningful tradeoffs:

- Less traditional downtown image.
- Some users will need broker validation on building economics and current availability because specialized inventory can be highly differentiated.

Nearby and adjacent alternatives:

- SoMa for central technology-oriented access.
- South Beach for Transbay and waterfront-adjacent access.
- Dogpatch for creative, industrial-adjacent, and innovation-oriented character.
- Potrero Hill for neighborhood-scale creative office alternatives.

When Rofo should introduce it:

- It belongs in the initial San Francisco office consideration set for office users because it is strongly supported by repository evidence and differentiated from downtown.

When it should rise:

- Growth, modern office, recruiting, technology ecosystem, life-science adjacency, and UCSF proximity matter.

When it should fall:

- Frequent client visits, traditional image, lower-rise historic character, or boutique professional atmosphere matter more.

When it should remain secondary:

- The user's business is office-appropriate but not clearly innovation, growth, or institutionally oriented.

When it should be excluded only by a hard constraint:

- Explicitly avoiding Mission Bay or modern campus-style environments.

Unsupported editorial hypotheses:

- Relative economics.
- Specific life-science infrastructure needs without broker validation.

### Jackson Square

Repository support:

- `_data/locationKnowledgeGraph.js`: `jackson-square`, strong office fit, high confidence, boutique and polished office character, high walkability, high client access, high executive image, low expansion flexibility.
- `_data/commercialMarketEvidence.js`: Jackson Square collection with 8 evidence records.
- `_data/commercialBuildingIntelligence.js`: 11 Jackson Square canonical building records.

Core identity:

- A compact, polished, lower-rise downtown-adjacent office district.

Office environment:

- Boutique, client-friendly, walkable, and professional without feeling like a full corporate high-rise district.

Building character:

- Smaller-scale historic and boutique office context.

Businesses that may fit well:

- Boutique professional services.
- Design-conscious teams.
- Investment, legal, advisory, or founder-led firms that value polish and client access.
- Smaller teams that want a distinctive address near downtown.

Businesses that may struggle:

- Fast-growing companies needing expansion flexibility.
- Large teams requiring broad inventory depth.
- Teams prioritizing parking.

Strongest enduring advantages:

- Boutique image.
- Client access.
- Walkability.
- Proximity to Financial District and North Beach.
- Lower-rise character.

Meaningful tradeoffs:

- Expansion flexibility is limited in repository attributes.
- It may not support larger or fast-growing teams as well as SoMa, Mission Bay, or Financial District.

Nearby and adjacent alternatives:

- Financial District for deeper traditional office inventory.
- SoMa for more flexible and technology-oriented office choices.
- South Beach for access-oriented alternatives.

When Rofo should introduce it:

- It belongs in the initial consideration set for smaller and midsized office users, or when boutique character and client access are relevant.

When it should rise:

- The user prioritizes lower-rise character, polished environment, client visits, walkability, and professional image.

When it should fall:

- Growth flexibility, modern large-format office, or broader inventory depth matters.

When it should remain secondary:

- The user likes downtown but has scale or growth needs that may require Financial District, SoMa, or Mission Bay.

When it should be excluded only by a hard constraint:

- The user needs a large, modern, or expansion-heavy office search that Jackson Square cannot credibly support.

Unsupported editorial hypotheses:

- Current inventory depth for a specific team size.
- Exact availability of larger contiguous spaces.

### South Beach

Repository support:

- `_data/locationKnowledgeGraph.js`: `south-beach`, strong office fit, medium confidence, high transit, high walkability, high customer access, high talent access, waterfront and Transbay-adjacent positioning.
- `_data/commercialMarketEvidence.js`: South Beach collection with 9 evidence records.
- `_data/commercialBuildingIntelligence.js`: 8 South Beach canonical building records.

Launch role:

- Default initial set.

Core identity:

- A waterfront and Transbay-adjacent office district bridging downtown, SoMa, and Mission Bay.

Office environment:

- Access-oriented, mixed urban, and adjacent to major downtown and waterfront contexts.

Building character:

- Mix of office formats near transportation, waterfront, ballpark, and South Financial District adjacency.

Businesses that may fit well:

- Teams that value regional access and a less formal downtown feel.
- Companies comparing SoMa, Financial District, and Mission Bay.
- Businesses that want client accessibility without fully centering on Financial District.

Businesses that may struggle:

- Teams seeking a highly traditional business image.
- Teams requiring very large inventory depth.
- Users with parking-first requirements.

Strongest enduring advantages:

- Transit and access.
- Walkability.
- Proximity to Financial District, SoMa, and Mission Bay.
- Waterfront-adjacent identity.

Meaningful tradeoffs:

- It may need stronger editorial tags to distinguish it from nearby districts.
- It can be a bridge alternative rather than a primary answer unless the user's constraints make access and adjacency central.

Nearby and adjacent alternatives:

- Financial District.
- SoMa.
- Mission Bay.

When Rofo should introduce it:

- It belongs in the initial consideration set when the model wants to preserve a central, access-oriented alternative beyond Financial District and SoMa.

When it should rise:

- The user values transit, client access, waterfront-adjacent context, or comparison between downtown and Mission Bay.

When it should fall:

- The user wants a clearer district identity, boutique image, creative industrial character, or explicit life-science ecosystem.

When it should remain secondary:

- It remains a strong alternative when adjacent primary districts look close but not decisive.

When it should be excluded only by a hard constraint:

- Explicitly avoiding South Beach or waterfront/Transbay-adjacent locations.

Unsupported editorial hypotheses:

- Precise subdistrict positioning relative to Transbay, ballpark, or Rincon Hill office nodes.

### Showplace Square

Repository support:

- `_data/locationKnowledgeGraph.js`: `showplace-square`, strong office fit, medium confidence, creative office, AI, robotics, product, brick-and-timber, medium transit, medium parking, high talent access, high creative environment.
- `_data/commercialMarketEvidence.js`: Showplace Square collection with 9 evidence records.
- `_data/commercialBuildingIntelligence.js`: 5 Showplace Square canonical building records.

Launch role:

- Signal-specific entrant, not default initial set.

Core identity:

- A creative office and production-adjacent district between SoMa, Design District, and Potrero Hill.

Office environment:

- Creative, product-oriented, less corporate, and useful for teams that value maker, design, or applied-technology context.

Building character:

- Brick-and-timber, showroom, light industrial, creative office, and adaptive workplace patterns.

Businesses that may fit well:

- Design firms.
- Product companies.
- AI, robotics, or hardware-adjacent teams.
- Creative office users who do not need Financial District image.

Businesses that may struggle:

- Traditional client-facing professional services.
- Teams needing maximum transit access.
- Companies needing polished executive image.

Strongest enduring advantages:

- Creative environment.
- Talent and product ecosystem signals.
- Parking pattern is less constrained than the most transit-heavy downtown districts in repository attributes.
- Adjacency to SoMa, Design District, and Potrero Hill.

Meaningful tradeoffs:

- Medium confidence and fewer CBI records than larger districts.
- Less traditional client access and executive image.

Nearby and adjacent alternatives:

- Design District.
- SoMa.
- Potrero Hill.
- Dogpatch.

When Rofo should introduce it:

- It should enter when creative office, product, design, hardware-adjacent, lower-rise, parking-balanced, Potrero/Dogpatch-adjacent, or less formal workplace character matters.

When it should rise:

- The user values creative environment, parking balance, applied technology, or showroom/production adjacency.

When it should fall:

- The user prioritizes client-facing professionalism, BART-heavy commute access, traditional image, or large expansion depth.

When it should remain secondary:

- It should be a strong secondary alternative when SoMa is appealing but too central or corporate for the user's preferences.

When it should be excluded only by a hard constraint:

- Explicitly requiring downtown, high-transit, traditional office environment.

Unsupported editorial hypotheses:

- Current depth of office-ready inventory.
- Precise relationship between creative office and specific industry clusters.

### Dogpatch

Repository support:

- `_data/locationKnowledgeGraph.js`: `dogpatch`, good office fit, medium confidence, creative office, innovation, office-R&D, adaptive industrial context, medium transit, medium parking, high talent access, high creative environment.
- `_data/commercialMarketEvidence.js`: Dogpatch collection with 10 evidence records.
- `_data/commercialBuildingIntelligence.js`: 10 Dogpatch canonical building records.

Core identity:

- A waterfront-adjacent, industrial-heritage, innovation-oriented district tied to Dogpatch, Pier 70, and Mission Bay adjacency.

Office environment:

- Creative, adaptive, and less formal than core downtown districts.

Building character:

- Industrial-adaptive and innovation-oriented buildings, with repository evidence for Pier 70, Power Station, and related Dogpatch buildings.

Businesses that may fit well:

- Creative technology companies.
- Product and hardware-adjacent teams.
- Companies seeking industrial character near Mission Bay.
- Teams that value a distinctive neighborhood environment.

Businesses that may struggle:

- Client-heavy professional services.
- Firms requiring traditional downtown business image.
- Teams that need maximum regional transit access.

Strongest enduring advantages:

- Creative environment.
- Mission Bay adjacency.
- Industrial and innovation identity.
- More balanced parking/transit pattern than central downtown districts.

Meaningful tradeoffs:

- Medium confidence relative to higher-depth downtown districts.
- Less traditional client access.
- Less legible to users expecting conventional office districts.

Nearby and adjacent alternatives:

- Mission Bay.
- Potrero Hill.
- Showplace Square.

When Rofo should introduce it:

- It should enter when creative, innovation, industrial-adaptive, Mission Bay-adjacent, or office-R&D context matters.

When it should rise:

- The user values creative character, applied technology, some parking practicality, and distinct neighborhood identity.

When it should fall:

- Frequent client visits, traditional office image, or high regional transit access dominate.

When it should remain secondary:

- It should remain a strong alternative to Mission Bay or Showplace Square when the user wants a less polished or more industrial-adaptive environment.

When it should be excluded only by a hard constraint:

- Explicitly requiring downtown, BART-first access, or traditional high-rise office context.

Unsupported editorial hypotheses:

- Current availability of office versus mixed-use or production-adjacent space.
- Detailed compatibility with lab, R&D, or infrastructure-heavy use without broker validation.

### Design District

Repository support:

- `_data/locationKnowledgeGraph.js`: `design-district`, good office fit, medium confidence, creative office, showroom-adjacent users, design-oriented businesses, medium transit, medium parking, high talent access, high creative environment.
- `_data/commercialMarketEvidence.js`: Design District collection with 10 evidence records.
- `_data/commercialBuildingIntelligence.js`: 9 Design District canonical building records.

Core identity:

- A design, showroom, and creative commercial district suited to companies that benefit from showroom-adjacent or design-industry context.

Office environment:

- Creative, visual, and less corporate, with office use connected to design, product, and client presentation.

Building character:

- Showroom-adjacent, creative office, and adaptive commercial buildings.

Businesses that may fit well:

- Architecture and interior design firms.
- Product, furniture, showroom, and creative services companies.
- Businesses with a client-facing design component.

Businesses that may struggle:

- Traditional professional services needing a central business address.
- Companies requiring maximum transit access.
- Large teams needing broad office inventory depth.

Strongest enduring advantages:

- Creative and design ecosystem.
- Showroom-adjacent context.
- Balanced parking and access compared with core downtown.
- Adjacency to Showplace Square and Potrero Hill.

Meaningful tradeoffs:

- Less broadly applicable to general office users.
- Transit and client access are medium rather than high in repository attributes.

Nearby and adjacent alternatives:

- Showplace Square.
- Potrero Hill.
- SoMa.

When Rofo should introduce it:

- It should enter for design, product, showroom, creative services, or client-presentation businesses.

When it should rise:

- The user prioritizes creative building character, design ecosystem, parking balance, or showroom adjacency.

When it should fall:

- The user prioritizes regional transit, executive image, or traditional office environment.

When it should remain secondary:

- It should remain an alternative when Showplace Square or SoMa appear plausible but the user needs more design-sector context.

When it should be excluded only by a hard constraint:

- Explicitly requiring downtown or high-transit professional office positioning.

Unsupported editorial hypotheses:

- Current availability of office-only space.
- Subdistrict relationship to specific design showrooms or industry anchors.

### Potrero Hill

Repository support:

- `_data/locationKnowledgeGraph.js`: `potrero-hill`, good office fit, medium confidence, smaller creative office and production-adjacent positioning, medium transit, medium parking, high talent access, high creative environment.
- `_data/commercialMarketEvidence.js`: Potrero Hill collection with 8 evidence records.
- `_data/commercialBuildingIntelligence.js`: 8 Potrero Hill canonical building records.

Core identity:

- A neighborhood-scale creative office district near Mission Bay, Dogpatch, and Showplace Square.

Office environment:

- Smaller, quieter, creative, and neighborhood-oriented relative to downtown and SoMa.

Building character:

- Smaller creative office, production-adjacent, and neighborhood commercial buildings.

Businesses that may fit well:

- Smaller creative firms.
- Founder-led teams wanting a calmer environment.
- Companies that value neighborhood character near Mission Bay and Dogpatch.

Businesses that may struggle:

- Firms requiring high regional transit access.
- Client-heavy professional services.
- Large teams needing inventory depth or expansion options.

Strongest enduring advantages:

- Creative environment.
- Neighborhood character.
- Balanced parking and access relative to downtown.
- Adjacency to Dogpatch, Showplace Square, and Mission Bay.

Meaningful tradeoffs:

- Lower confidence and less obvious office depth than primary districts.
- May need user-specific reasons to enter an office shortlist.

Nearby and adjacent alternatives:

- Dogpatch.
- Showplace Square.
- Mission Bay.
- Design District.

When Rofo should introduce it:

- It should enter when the user prefers neighborhood-scale, lower-rise, creative, or Mission Bay-adjacent locations.

When it should rise:

- The user values calmer environment, parking balance, lower-rise character, and creative office feel.

When it should fall:

- Transit, client access, executive image, or expansion flexibility are primary.

When it should remain secondary:

- It should remain secondary for general office users unless the user's preferences clearly match its neighborhood character.

When it should be excluded only by a hard constraint:

- Explicitly requiring central downtown, BART-first access, or large modern inventory.

Unsupported editorial hypotheses:

- Precise office inventory scale and availability.
- Which subareas should be treated separately.

### Mission District

Repository support:

- `_data/locationKnowledgeGraph.js`: `mission-district`, selective office fit, medium confidence, creative nonprofit neighborhood office, high transit, high walkability, high customer access, low expansion flexibility, high creative environment.
- `_data/commercialMarketEvidence.js`: Mission District collection with 8 evidence records.
- `_data/commercialBuildingIntelligence.js`: 8 Mission District canonical building records.

Launch role:

- Secondary and signal-specific, not default initial set.

Core identity:

- A neighborhood office district for creative, nonprofit, local-serving, and culture-oriented businesses.

Office environment:

- Walkable, urban, neighborhood-driven, and less formal than downtown office districts.

Building character:

- Smaller and more local in office identity, with creative and community-oriented uses better supported than generic office demand.

Businesses that may fit well:

- Creative firms.
- Nonprofits.
- Local-serving businesses.
- Community-oriented companies.
- Teams that value neighborhood energy and walkability.

Businesses that may struggle:

- Client-heavy firms requiring polished downtown image.
- Growth companies needing expansion flexibility.
- Teams that strongly prioritize parking.

Strongest enduring advantages:

- Walkability.
- Transit.
- Neighborhood amenities.
- Creative environment.
- Customer access and visibility.

Meaningful tradeoffs:

- Low expansion flexibility in repository attributes.
- It should not be over-recommended for generic office users without a clear signal.

Nearby and adjacent alternatives:

- SoMa.
- Potrero Hill.
- Design District.

When Rofo should introduce it:

- It should enter when the user prioritizes neighborhood identity, creative culture, nonprofit or mission-driven work, local customer access, restaurants and amenities, BART-supported walkability, or an informal office environment.

When it should rise:

- The user values walkability, neighborhood energy, creative identity, and local-serving context.

When it should fall:

- Traditional office image, client visits, expansion, or parking dominate.

When it should remain secondary:

- It should be a secondary alternative for users whose needs are office-like but whose strongest signals are not neighborhood or creative.

When it should be excluded only by a hard constraint:

- Explicitly requiring traditional downtown professional office, large expansion depth, or parking-first access.

Unsupported editorial hypotheses:

- Detailed submarket office inventory.
- Whether specific office sectors fit better than repository broad categories suggest.

## 4. Business Facts

Business facts are user context that Rofo can use to create an explainable district shortlist. They should be answerable without brokerage expertise.

Exact square footage should not be mandatory. Headcount, regular daily occupancy, hybrid pattern, growth, and work style are more natural business-context inputs and often create better district-level guidance.

| Fact | User-facing question | Answers | Required | Why Rofo asks | District behavior | Current support | Safe inference |
| --- | --- | --- | --- | --- | --- | --- | --- |
| City | Where are you thinking about locating? | San Francisco, specific district, open to nearby markets | Required | Defines market and eligible district universe | Creates initial SF office consideration set | `js/search-profile.js` location intent; `locationKnowledgeGraph` city paths | San Francisco + Office should recommend SF districts, not San Francisco itself |
| Space type | What kind of space do you need? | Office, industrial, retail, medical, flex, coworking | Required | Selects space-type-specific district fit | Uses `spaceTypeFit.office` | `js/search-profile.js` `spaceTypeOptions`; `locationKnowledgeGraph` `spaceTypeFit.office` | Office fit can define the district universe |
| Current headcount | About how many people work in the business today? | Ranges such as 1-10, 11-25, 26-75, 75+ | Launch-critical | Gives scale without requiring exact sqft | Smaller teams can keep boutique and neighborhood districts viable; larger teams need inventory depth and expansion flexibility | Missing from current `js/search-profile.js` core flow | Headcount can imply rough profile depth needs, not lease size |
| Regular daily occupancy | How many people are usually in the office on a typical day? | Less than half, about half, most people, not sure | Launch-critical | Distinguishes office footprint from company headcount | Lower occupancy can preserve smaller districts; high occupancy increases importance of transit, amenities, and inventory depth | Missing | Hybrid occupancy can reduce scale pressure without changing business identity |
| Hybrid pattern | How often does the team use the office? | Daily, several days/week, occasional, not sure | Launch-critical | Determines commute and amenity importance | Frequent use weights employee commute and amenities more heavily | Missing | Occasional use may raise client access and meeting environment |
| Expected growth | Do you expect the team to grow meaningfully in the next 12-24 months? | No, some, significant, not sure | Launch-critical | Tests need for expansion flexibility | Mission Bay, SoMa, Financial District, and South Beach can rise; Jackson Square and Mission District may fall | `attributes.expansionFlexibility` exists | Growth does not require a precise future sqft number |
| Client visit frequency | How often do clients or partners visit? | Rarely, sometimes, often, not sure | Launch-critical | Determines importance of client access and district image | Financial District, Jackson Square, South Beach, and SoMa can rise | `attributes.customerAccess`, `attributes.executiveImage` | Frequent visits imply professional image and access matter |
| Recruiting importance | How important is the office to attracting employees? | Low, medium, high, not sure | Launch-critical | Determines talent, amenities, transit, and district identity weight | SoMa, Mission Bay, Financial District, South Beach, creative districts depending environment | `attributes.talentAccess`, `amenities`, `creativeEnvironment` | Recruiting is not a proxy for newest building or highest rent |
| Business type or industry | What kind of business are you building? | Technology, professional services, life science, design/creative, nonprofit, local services, other | Launch-critical | Activates ecosystem fit | Financial District rises for professional services; Mission Bay for life science; SoMa for technology; Design District and Showplace for design/product; Mission District for nonprofit/community | `bestFor`, `spaceTypeFit.office.bestFor`, ecosystem taxonomy | Industry should influence district explanation, not hard-exclude most districts |
| Operational use | What does the office need to do well? | Team work, client meetings, recruiting, lab/R&D adjacency, showroom/presentation, quiet focused work | Launch-critical | Separates office jobs beyond industry labels | Changes priority weighting and explanation | Partly supported by district attributes and `bestFor`; not currently captured in `search-profile.js` | Multiple office jobs may keep shortlist broader |
| Approximate square footage | Do you already know the approximate size? | Current range options plus "not sure" | Optional | Useful when user knows it, but not required | Can validate whether a boutique or narrow district is plausible | `js/search-profile.js` `officeSizeOptions` exists | If unknown, use headcount and occupancy instead |

Facts to avoid in the core district flow:

- Exact budget.
- Required lease term.
- Credit strength.
- Desired concessions.
- Transaction timing details beyond broad urgency.

Those are broker review inputs.

## 5. Geographic Constraints

Geographic constraints should be simple enough for a first-release model while still capturing the most common San Francisco office situations.

| Constraint | User expression | Effect | Districts affected | Nearby alternatives | Explanation language | Existing data | Missing data |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Specific district anchor | "I want to be in or near Jackson Square" | Strongly weights anchor; does not automatically filter all others | Anchor district rises | Use `relationships.compareWith` for alternatives | "Jackson Square stays central because you named it, while Financial District and SoMa remain nearby alternatives." | `relationships.compareWith` exists for core districts | Need relationship type: adjacent, nearby, substitute, comparison |
| Nearby or adjacent districts | "Show me nearby alternatives" | Allows adjacent candidates to enter | Anchor plus compare/adjacent districts | Example: Jackson Square -> Financial District, SoMa, South Beach | "Rofo introduced nearby alternatives because you are open to comparison." | `relationships.compareWith` | Need directional and physical adjacency tags |
| North-of-Market preference | "I prefer north of Market" | Strongly weights; can filter if hard | Financial District, Jackson Square, possibly South Beach depending definition | SoMa can remain secondary if the user is open | "North-of-Market preference favors downtown and Jackson Square before SoMa." | Missing as explicit tag | Need `marketStreetOrientation` or equivalent |
| Marin commute orientation | "Many employees commute from Marin" | Strongly weights ferry, north-side access, parking tolerance | Financial District and Jackson Square rise; South Beach may stay; Mission Bay and Dogpatch may fall unless other signals outweigh | Future: North Bay or Marin market alternatives | "Marin commute orientation favors districts with stronger north-side or ferry access." | Transit and parking attributes are broad | Need commute-origin tags, ferry access, drive pattern tags |
| East Bay commute orientation | "Many employees commute from East Bay" | Strongly weights BART/ferry/regional transit | Financial District, SoMa, South Beach rise; Mission Bay may remain depending transit | Future: East Bay markets if user allows nearby markets | "East Bay commute orientation favors BART and regional-transit districts." | `transitAccess` broad | Need BART/ferry-specific tags |
| Peninsula or South Bay commute | "Many employees commute from Peninsula or South Bay" | Strongly weights Caltrain/South Bay access | SoMa, Mission Bay, South Beach rise; Financial District remains depending BART/Muni; Jackson Square may fall | Future: Peninsula/South Bay market alternatives | "Peninsula commute orientation favors districts with stronger Caltrain and southern access." | `transitAccess` broad | Need Caltrain and freeway/south access tags |
| Proximity to Caltrain | "We need Caltrain access" | Strong weight; filter only if user says must-have | SoMa, South Beach, Mission Bay rise | Dogpatch may enter for some southern access contexts | "Caltrain access moves SoMa, South Beach, and Mission Bay ahead." | Missing specific tag | Need `caltrainAccess` |
| Proximity to BART or ferry | "BART or ferry matters" | Strong weight | Financial District, SoMa, South Beach, Jackson Square depending mode | East Bay markets may enter if nearby markets allowed | "BART and ferry access keep downtown candidates strong." | Missing mode-specific tag | Need `bartAccess`, `ferryAccess` |
| Proximity to UCSF or institution | "We need to be near UCSF" | Strongly weights; may filter if hard | Mission Bay rises; Dogpatch and Potrero Hill can enter | SoMa remains secondary if broader access matters | "UCSF proximity makes Mission Bay the clearest starting point." | Mission Bay editorial support; CME and CBI evidence | Need institution proximity tags |
| Remain within San Francisco | "Only San Francisco" | Hard filter | SF districts only | None outside SF | "Rofo kept nearby markets out because you asked to stay in San Francisco." | Market ownership exists | Need clear UI distinction between market and nearby market |
| Willingness to consider nearby markets | "Open to nearby markets" | Allows outside-market alternatives when relevant | Future East Bay, Peninsula, South Bay, North Bay | Example future Oakland: Jack London Square may lead to Alameda or Emeryville | "Nearby markets can enter only when they solve the same business problem better." | Canonical geography model; Bay Area market metadata | Need structured cross-market alternative relationships |

First release should support a small set of high-value geographic constraints:

- Specific district anchor.
- Open to nearby alternatives.
- Remain within San Francisco.
- Employee commute orientation.
- Caltrain/BART/ferry importance.
- UCSF or major institution proximity.

It should not attempt arbitrary freeform geography.

## 6. Office Priorities

Priorities should reorder or explain districts. They should rarely exclude districts by themselves.

Users should not be required to select exactly three priorities. They may provide as many or as few meaningful signals as they understand.

### Launch-critical

| Priority | Definition | User-facing wording | Answer format | Attributes involved | Behavior | Effect | Data support |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Employee commute | How well the district supports employee access patterns | Where are employees coming from? | Select commute orientation, optional unknown | `transitAccess`, future mode tags | Raises districts aligned with employee geography | Strong weight | Partial; mode-specific tags missing |
| Regional transit | Ability to support BART, Caltrain, ferry, and regional connections | How important is regional transit? | Not important, helpful, very important, must-have | `transitAccess`, future `bartAccess`, `caltrainAccess`, `ferryAccess` | Raises Financial District, SoMa, South Beach, Mission Bay depending mode | Strong weight, filter only if must-have | Broad support only |
| Parking and driving | Relative practicality for drive-oriented access | How important is parking or driving access? | Not important, helpful, very important, must-have | `parking` | Raises medium-parking districts relative to low-parking districts | Strong weight; hard filter only if must-have | Supported at high/medium/low |
| Client access | Ease of client visits and external meetings | How often will clients visit? | Rarely, sometimes, often | `customerAccess`, `executiveImage`, transit | Raises Financial District, Jackson Square, South Beach, SoMa | Strong weight | Supported |
| Recruiting and employee attraction | District's usefulness for hiring and employee experience | How important is the office for attracting employees? | Low, medium, high | `talentAccess`, `amenities`, `creativeEnvironment`, ecosystem fit | Raises SoMa, Mission Bay, Financial District, South Beach, creative districts depending business type | Strong weight | Supported but broad |
| Office environment | The practical and reputational feel of the workplace | What kind of office environment would fit the business? | Modern and polished; historic and distinctive; creative and informal; traditional and professional; lower-rise and neighborhood-oriented; not sure | `executiveImage`, `corporateEnvironment`, `creativeEnvironment`, office summaries, tradeoffs | Reorders districts by clarified environment preference; does not move districts when user is not sure | Strong weight | Partly supported; launch taxonomy defined in this document |
| Walkability and amenities | Nearby restaurants, services, and daily work environment | How important are restaurants, amenities, and walkability? | Low, medium, high | `walkability`, `amenities` | Raises Financial District, SoMa, Jackson Square, South Beach, Mission District | Light to strong weight | Supported |
| Growth flexibility | Ability to support expected team growth or larger workplace needs | How much do you expect the team to grow? | None, some, significant, unknown | `expansionFlexibility`, building count, evidence depth | Raises Mission Bay, SoMa, Financial District, South Beach | Strong weight | Supported |
| Industry ecosystem | District relevance to the user's business type | What kind of business are you building? | Technology, professional services, life science, design/creative, nonprofit, other | `bestFor`, office bestFor, ecosystem taxonomy | Raises ecosystem-aligned districts | Strong weight | Supported through editorial fields, needs normalization |

### Useful later

| Priority | Why later | Needed data |
| --- | --- | --- |
| Local transit detail | Current `transitAccess` is too broad | Muni, BART, Caltrain, ferry, shuttle, bike tags |
| Outdoor access | Important for some users but not consistently structured | Waterfront, parks, open space, neighborhood environment tags |
| Quiet professional environment | Useful distinction but subjective today | Normalized district-environment taxonomy |
| Lower-rise environment | Clear user need, but not consistently structured | Building height and district character tags |
| Proximity to partners or customers | Powerful when known, but requires user-specified anchors | Landmark and institution proximity tags |

### Deferred or excluded

| Priority | Reason |
| --- | --- |
| Exact budget | Dynamic transaction input; broker validates economics |
| Cost sensitivity as district ranking | Useful business context, but current district data does not support cheap-versus-expensive recommendations |
| Current rents | Dynamic market condition |
| Asking rates | Dynamic market condition |
| Concessions | Dynamic transaction condition |
| Available inventory | Dynamic listing condition |
| Landlord motivation | Dynamic broker intelligence |

Cost-related statements should be captured for broker handoff only. They should not move districts up or down in the launch San Francisco Office model.

## 7. Question-to-Behavior Map

Every question in the core Business Profile must affect eligibility, shortlist composition, ranking, explanation, or confidence.

| Question | Answer | Why Rofo asks | Districts likely to rise | Districts likely to fall | Districts that may enter | Attributes used | Explanation pattern | Data support | Confidence impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Where are you thinking about locating? | San Francisco | Defines market | Initial SF office set | Non-SF markets | None | marketId, cityPath | Initial consideration | Strong | Starting set |
| Where are you thinking about locating? | Jackson Square | Captures anchor | Jackson Square | None unless hard filter | Financial District, SoMa, South Beach | compareWith, future adjacency | Anchor plus nearby alternatives | Partial | Emerging |
| Are you open to nearby alternatives? | Yes | Determines whether adjacent districts can enter | Anchor plus adjacent candidates | None | Nearby districts | compareWith | Adjacent alternative | Partial | Higher |
| Are you open to nearby alternatives? | No | Applies user boundary | Anchor | Alternatives outside boundary | None | User constraint | Hard constraint | Strong | Higher if clear |
| What kind of space do you need? | Office | Selects space-type universe | Districts with strong/good office fit | Limited-fit districts | None | `spaceTypeFit.office.fit` | Space-type universe | Strong | Starting |
| About how many people work in the business today? | 1-10 | Tests scale and boutique viability | Jackson Square, Mission District, Potrero Hill, Design District when other signals fit | Mission Bay may not need to lead solely on scale | Smaller-character districts | `expansionFlexibility`, CBI counts, character | Scale fit | Partial | Higher |
| About how many people work in the business today? | 26-75+ | Tests depth and growth needs | Financial District, SoMa, Mission Bay, South Beach | Jackson Square, Mission District, Potrero Hill if expansion needed | None | `expansionFlexibility`, CBI counts | Inventory depth | Partial | Higher |
| How many people are usually in the office? | Most people daily | Commute and amenities matter more | Transit and amenity-strong districts | Parking-limited districts only if drive-heavy | None | transit, amenities, walkability | Daily-use practicality | Partial | Higher |
| How often does the team use the office? | Occasional | Office may be meeting/client hub | Financial District, Jackson Square, South Beach | Neighborhood-only choices if no other signal | None | customerAccess, executiveImage | Office job-to-be-done | Partial | Medium |
| Do you expect the team to grow? | Significant | Need flexibility | Mission Bay, SoMa, Financial District, South Beach | Jackson Square, Mission District, Potrero Hill | None | expansionFlexibility | Growth flexibility | Strong | Higher |
| How often will clients visit? | Often | Client access and image matter | Financial District, Jackson Square, South Beach, SoMa | Dogpatch, Potrero Hill, Showplace Square unless other fit is strong | None | customerAccess, executiveImage | Client-facing access | Strong | Higher |
| How important is recruiting? | High | Employee experience matters | SoMa, Mission Bay, South Beach, Financial District; creative districts if creative/product context | None automatically | Showplace Square, Dogpatch, Design District | talentAccess, amenities, creativeEnvironment | Recruiting context | Medium | Higher |
| Where do employees commute from? | Marin | Mode and approach orientation | Financial District, Jackson Square, South Beach | Mission Bay, Dogpatch, Potrero Hill if commute is dominant | North Bay future alternatives if allowed | future commute tags, transit, parking | Commute orientation | Missing detail | Higher after data |
| Where do employees commute from? | East Bay | BART/ferry access | Financial District, SoMa, South Beach | Districts with weaker regional transit | East Bay markets if allowed | future BART/ferry tags | Regional commute | Missing detail | Higher after data |
| Where do employees commute from? | Peninsula/South Bay | Caltrain/south access | SoMa, South Beach, Mission Bay | Jackson Square if commute dominates | Peninsula/South Bay markets if allowed | future Caltrain tags | Regional commute | Missing detail | Higher after data |
| What kind of office environment would fit the business? | Modern and polished | Clarifies vague "nice" or "impressive" language | Mission Bay, South Beach, SoMa, Financial District | Mission District, Potrero Hill if scale/image matters | None | corporateEnvironment, expansionFlexibility, district summaries | Environment fit | Medium | Higher |
| What kind of office environment would fit the business? | Historic and distinctive | Clarifies character preference | Jackson Square, SoMa | Mission Bay if modern-growth signal is not present | Financial District remains if professional image matters | creativeEnvironment, executiveImage, summaries | Environment fit | Medium | Higher |
| What kind of office environment would fit the business? | Creative and informal | Clarifies "cool" language without guessing | SoMa, Showplace Square, Dogpatch, Design District, Potrero Hill, Mission District | Financial District if creative signal dominates | Showplace Square, Dogpatch, Design District, Potrero Hill, Mission District | creativeEnvironment, summaries | Environment fit | Strong | Higher |
| What kind of office environment would fit the business? | Traditional and professional | Clarifies image preference | Financial District, Jackson Square, South Beach | Showplace Square, Dogpatch, Design District, Mission District unless other signals exist | None | executiveImage, corporateEnvironment, customerAccess | Environment fit | Medium | Higher |
| What kind of office environment would fit the business? | Lower-rise and neighborhood-oriented | Clarifies scale and setting preference | Jackson Square, Potrero Hill, Dogpatch, Design District, Mission District | Financial District, Mission Bay if lower-rise signal dominates | Potrero Hill, Dogpatch, Design District, Mission District | creativeEnvironment, parking, summaries, expansionFlexibility | Environment fit | Partial | Higher |
| What kind of office environment would fit the business? | Not sure yet | Avoids unsupported movement | No movement | No movement | None | None | Uncertainty preserved | Strong | No change |
| What kind of business are you building? | Professional services | Ecosystem fit | Financial District, Jackson Square, South Beach | Mission District, Dogpatch unless other signals exist | None | bestFor, office bestFor | Ecosystem fit | Strong | Higher |
| What kind of business are you building? | Technology | Ecosystem fit | SoMa, Mission Bay, South Beach, Showplace Square, Dogpatch | None automatically | Showplace, Dogpatch | bestFor, talentAccess | Ecosystem fit | Strong | Higher |
| What kind of business are you building? | Life science | Institution/ecosystem fit | Mission Bay | Financial District, Jackson Square if ecosystem dominates | Dogpatch, Potrero Hill | bestFor, institution proximity | Ecosystem fit | Partial | Higher |
| What kind of business are you building? | Design/creative | Ecosystem fit | Design District, Showplace Square, SoMa, Jackson Square, Potrero Hill | Financial District if traditional image not needed | Mission District | creativeEnvironment, bestFor | Ecosystem fit | Strong | Higher |
| What does the office need to do well? | Client meetings | Clarifies use | Financial District, Jackson Square, South Beach, SoMa | Dogpatch, Showplace, Potrero unless other signals exist | None | customerAccess, executiveImage | Office job | Strong | Higher |
| What does the office need to do well? | Team collaboration/recruiting | Clarifies use | SoMa, Mission Bay, South Beach, creative districts | None automatically | Showplace, Dogpatch | talentAccess, amenities, creativeEnvironment | Office job | Medium | Higher |

Captured business context that should not rank districts:

| User statement | Treatment | District behavior | Broker handoff value |
| --- | --- | --- | --- |
| We do not want to overspend | Capture as cost-sensitivity context | No district movement | Broker validates live economics and avoids over-investing in unnecessary image or specialized inventory |
| We want good value | Capture as value-orientation context | No district movement | Broker compares current buildings, concessions, and available substitutes |
| Cost matters | Capture as broker review priority | No district movement | Broker reviews rent, availability, concessions, and transaction tradeoffs |

Questions that should not be in the core flow unless explicitly needed later:

- Exact budget.
- Desired concessions.
- Landlord preference.
- Lease term.
- Tenant improvement requirements.
- Credit or financial qualification.

## 8. Shortlist Behavior

The model must not target a predetermined number of recommended districts.

Rofo should produce the smallest shortlist it can confidently defend.

If seven districts remain equally credible based on available inputs, show seven. Do not force a top three.

### Full eligible universe

The current San Francisco office universe is:

- Financial District.
- SoMa.
- Mission Bay.
- Jackson Square.
- South Beach.
- Showplace Square.
- Dogpatch.
- Design District.
- Potrero Hill.
- Mission District.

### Initial consideration set

Based only on San Francisco + Office, the model should show a broad consideration set without numbered ranking.

Recommended initial set:

- Financial District.
- SoMa.
- Mission Bay.
- Jackson Square.
- South Beach.

Rationale:

- These districts have strong office fit, durable office relevance, and broad applicability before additional user signals are known.
- They cover traditional downtown, central technology/creative office, modern growth, boutique professional, and access-oriented bridge patterns.
- They are differentiated enough to teach the user how San Francisco office geography works without over-specializing the starting set.

Initial secondary possibilities:

- Showplace Square.
- Dogpatch.
- Design District.
- Potrero Hill.
- Mission District.

Rationale:

- Repository data supports office relevance, but these usually need a stronger user signal such as creative/product character, design ecosystem, neighborhood orientation, UCSF adjacency, nonprofit/community fit, lower-rise preference, parking balance, or less conventional office character.

### Emerging differentiation

After meaningful facts, constraints, or priorities:

- Districts may rise when user signals align with stable district attributes.
- Districts may fall when another candidate is meaningfully stronger for the same user signals.
- Adjacent districts may enter if the user names an anchor and allows nearby alternatives.
- Ties and near-ties should remain visible.
- Rofo should ask the next question most likely to separate remaining candidates.

### Refined shortlist

A refined shortlist is the smallest set Rofo can defend with the available inputs.

It may be:

- Two districts when hard constraints and strong priorities converge.
- Three districts when meaningful differentiation exists but alternatives remain plausible.
- Five or more districts when the user has not provided enough differentiating information.

### Movement rules

A district rises when:

- The user's fact, constraint, or priority aligns with a repository-supported attribute.
- It solves a practical tradeoff better than other candidates.
- It offers a meaningful adjacent alternative to a user-named anchor.

A district falls when:

- Another candidate is meaningfully stronger on the user's stated priorities.
- Its known tradeoffs conflict with the user's stated needs.
- It remains plausible but less aligned.

A district enters consideration when:

- The user supplies a signal that activates a district outside the initial set.
- An anchor relationship introduces an adjacent or comparable district.
- The user's business type maps to a district's specialized ecosystem.

A district moves to Other possibilities when:

- It remains plausible but is not as directly aligned as the current shortlist.
- It is useful for discussion but not the best starting point.

A district is excluded only when:

- The user sets a hard geographic boundary.
- A district is incompatible with a must-have constraint.
- The user explicitly rejects that district or district type.

Core rule:

Do not remove a district unless another candidate is meaningfully stronger or a hard constraint makes it incompatible.

## 9. Reduction of Uncertainty

Rofo should communicate progress as reducing uncertainty, not as always selecting a winner.

Example states:

- Starting set: Rofo knows city and space type. It can identify credible office districts, but should avoid numbered rankings.
- Emerging ranking: Rofo knows enough to show which districts are separating and why.
- Refined shortlist: Rofo can defend a smaller set because user signals point toward specific district attributes.

Possible interface language:

- "7 current candidates."
- "5 strong candidates."
- "3 refined shortlist locations."
- "Several districts remain close because you have not yet prioritized commute, building character, or client access."

A smaller list is not always better. The correct output is the smallest defensible shortlist, not the shortest list.

Additional inputs may:

- Narrow the shortlist.
- Reorder the shortlist.
- Introduce a new adjacent alternative.
- Reveal that several districts remain equally viable.

## 10. Evolving Recommendation Examples

### Example A: San Francisco + Office only

Known facts:

- City: San Francisco.
- Space type: Office.

Constraints:

- None.

Priorities:

- None.

Starting set:

- Financial District.
- SoMa.
- Mission Bay.
- Jackson Square.
- South Beach.

Current shortlist:

- Same as starting set, unranked.

Districts that moved:

- None. Rofo should not pretend it has enough signal to pick a precise winner.

Why:

- The repository supports several credible office districts with different enduring strengths.

Unresolved tradeoffs:

- Client-facing image versus creative environment.
- Regional transit mode.
- Growth flexibility.
- Building character.
- Employee commute pattern.

Highest-value next question:

- "What should the office help your business do best?"

### Example B: 18-person growing company, wants a strong office, no overspending, recruiting, client visits

Known facts:

- City: San Francisco.
- Space type: Office.
- Team: about 18 people.
- Growth: some.
- Clients visit regularly.
- Recruiting matters.

Constraints:

- None.

Priorities:

- Professional quality.
- Employee attraction.
- Client access.
- Avoid over-investing in district image or specialized inventory without business benefit.

Starting set:

- Financial District.
- SoMa.
- Mission Bay.
- Jackson Square.
- South Beach.

Current shortlist:

- Financial District.
- Jackson Square.
- SoMa.
- South Beach.
- Mission Bay.

Districts that moved:

- Financial District rises for client access, professional image, transit, and established office identity.
- Jackson Square rises for polished boutique character and client-friendly scale.
- SoMa stays strong because recruiting and central access matter.
- South Beach remains a strong alternative because it bridges downtown, SoMa, and Mission Bay.
- Mission Bay remains viable for growth and recruiting but should be validated against whether a specialized modern environment is necessary.

Why:

- "Strong office" should be clarified through the office-environment question rather than mapped directly to districts.
- "Do not overspend" is business context for broker validation, not a district-ranking price claim.

Unresolved tradeoffs:

- Whether the company wants a traditional, boutique, modern, or creative office environment.
- Where employees commute from.

Highest-value next question:

- "What kind of office environment would fit the business: modern and polished, historic and distinctive, creative and informal, traditional and professional, or lower-rise and neighborhood-oriented?"

### Example C: Employees commute from Marin, parking, lower-rise character, amenities, professional environment

Known facts:

- City: San Francisco.
- Space type: Office.
- Employees commute from Marin.

Constraints:

- San Francisco only, unless user later allows nearby markets.

Priorities:

- Parking or driving practicality.
- Lower-rise character.
- Amenities.
- Professional environment.

Starting set:

- Financial District.
- SoMa.
- Mission Bay.
- Jackson Square.
- South Beach.

Current shortlist:

- Jackson Square.
- Financial District.
- South Beach.
- Potrero Hill.
- Dogpatch.

Districts that moved:

- Jackson Square rises for lower-rise, polished, walkable, professional character near downtown.
- Financial District stays strong for professional image and regional access.
- South Beach stays viable as an access-oriented alternative.
- Potrero Hill and Dogpatch enter as lower-rise or neighborhood-scale alternatives if the user values parking and character enough to accept weaker traditional office image.
- SoMa falls if the user prefers lower-rise and calmer character.
- Mission Bay falls unless modern growth or UCSF proximity matters.

Why:

- Marin commute orientation is not fully structured today, so the model should explain lower confidence and ask for more detail before filtering too aggressively.

Unresolved tradeoffs:

- Whether ferry access, driving access, or north-side location matters most.
- Whether lower-rise character matters more than traditional professional image.

Highest-value next question:

- "Is the Marin commute mostly ferry, driving, or flexible?"

### Example D: Growing technology company prioritizing regional transit, recruiting, modern office, expansion

Known facts:

- City: San Francisco.
- Space type: Office.
- Company type: technology.
- Growth: significant.

Constraints:

- None.

Priorities:

- Regional transit.
- Recruiting.
- Modern office environment.
- Expansion flexibility.

Starting set:

- Financial District.
- SoMa.
- Mission Bay.
- Jackson Square.
- South Beach.

Current shortlist:

- Mission Bay.
- SoMa.
- South Beach.
- Financial District.
- Showplace Square.

Districts that moved:

- Mission Bay rises for modern, growth, expansion, talent, and innovation ecosystem signals.
- SoMa remains strong for technology, central access, talent, and creative office mix.
- South Beach remains strong as an access-oriented bridge between downtown, SoMa, and Mission Bay.
- Financial District remains a credible alternative when transit and office depth matter, but falls behind if modern growth character is primary.
- Showplace Square enters or remains secondary for technology/product teams that value creative office character.
- Jackson Square falls because expansion flexibility is low in repository attributes.

Why:

- Growth and modern workplace priorities create meaningful differentiation.

Unresolved tradeoffs:

- Whether life-science or institution proximity matters.
- Whether the company prefers central urban technology context or newer campus-like environment.

Highest-value next question:

- "Do you prefer a newer modern environment or a more central mixed office district?"

### Example E: User anchors on Jackson Square and is open to nearby alternatives

Known facts:

- City: San Francisco.
- Space type: Office.
- Anchor: Jackson Square.

Constraints:

- Open to nearby alternatives.

Priorities:

- Not yet specified.

Starting set:

- Jackson Square.
- Financial District.
- SoMa.
- South Beach.

Current shortlist:

- Jackson Square.
- Financial District.
- South Beach.
- SoMa.

Districts that moved:

- Jackson Square rises because the user named it.
- Financial District enters as the strongest traditional nearby alternative.
- South Beach enters as an access-oriented nearby alternative.
- SoMa remains as a broader central office alternative.
- Mission Bay remains secondary unless growth, modern office, or UCSF proximity matters.

Why:

- Rofo should respect the anchor while still helping the user compare adjacent choices.

Unresolved tradeoffs:

- Boutique character versus deeper inventory.
- Traditional image versus creative/flexible office context.
- Growth flexibility.

Highest-value next question:

- "What draws you to Jackson Square: client access, lower-rise character, nearby downtown access, or something else?"

### Example F: Seven districts remain credible after limited input

Known facts:

- City: San Francisco.
- Space type: Office.
- Team: 20-50 people.
- Open to comparison.
- Values transit and amenities.

Constraints:

- Remain within San Francisco.

Priorities:

- Transit.
- Amenities.

Starting set:

- Financial District.
- SoMa.
- Mission Bay.
- Jackson Square.
- South Beach.

Current shortlist:

- Financial District.
- SoMa.
- Mission Bay.
- Jackson Square.
- South Beach.
- Mission District.
- Showplace Square.

Districts that moved:

- Mission District enters because transit, walkability, amenities, and creative neighborhood context are supported in repository attributes.
- Financial District, SoMa, Jackson Square, South Beach, and Mission Bay remain plausible.
- Showplace Square remains viable but needs more user signal.

Why:

- Transit and amenities are not enough to separate these districts decisively.
- The model should not force a top three.

Unresolved tradeoffs:

- Client visits.
- Growth.
- Building character.
- Employee commute mode.
- Business type.

Highest-value next question:

- "Which matters more for this office: client meetings, employee recruiting, growth flexibility, or a particular building character?"

## 11. Highest-Value Next Question

The next optional question should target the largest unresolved tradeoff among the remaining candidates.

Simple editorial method:

1. Identify the current candidate set.
2. Identify attributes where candidates differ most.
3. Remove attributes the user has already answered.
4. Prefer the unanswered attribute that can change shortlist composition or explanation for the most candidates.
5. Ask one question in plain business language.

Examples:

- If remaining candidates differ primarily by commute orientation, ask where employees commute from.
- If they differ by building character, ask whether the user prefers traditional, modern, boutique, creative, or neighborhood office environments.
- If they differ by client access, ask how often clients visit.
- If they differ by growth flexibility, ask about expected growth.
- If one candidate is only strong because of institution proximity, ask whether that institution matters.

This can be implemented with transparent editorial rules. It does not require opaque machine learning.

## 12. Explanation Library

Explanations should identify:

- The business signal.
- The relevant district attribute.
- The practical implication.

Avoid:

- "Our algorithm selected this district."
- Unsupported claims about current pricing or availability.
- Overconfident numerical precision.

### Initial consideration set

Pattern:

"With only San Francisco and Office selected, Rofo is starting with several credible office districts rather than forcing a premature ranking. These districts represent different office strategies: traditional downtown, technology-oriented central office, modern growth, boutique professional, and access-oriented bridge."

### District moving up

Pattern:

"[District] moved up because you prioritized [business signal], and the district is strong for [stable attribute]."

Example:

"Mission Bay moved up because you expect to grow and want a modern office environment. Repository data supports Mission Bay as a growth-oriented district with strong expansion flexibility and technology/life-science context."

### District moving down

Pattern:

"[District] moved down because [tradeoff] matters more in your profile, while other districts are stronger on that dimension."

Example:

"Jackson Square moved down because significant growth became important, and its repository attributes show lower expansion flexibility than Mission Bay, SoMa, or Financial District."

### District entering consideration

Pattern:

"[District] entered because your answer introduced [new signal], which matches [district attribute]."

Example:

"Design District entered because you described a design-forward business and showroom-adjacent client presentation matters."

### Several districts remaining tied

Pattern:

"[District A] and [District B] remain close because both support [shared user need]. The next useful difference is [unanswered tradeoff]."

Example:

"Jackson Square and South Beach remain close because both support frequent client visits, but your preference for lower-rise character would favor Jackson Square while broader access would favor South Beach."

### District becoming a secondary alternative

Pattern:

"[District] remains worth watching, but [stronger district] better matches your stated priorities today."

Example:

"Showplace Square remains a useful creative-office alternative, but SoMa better matches your current emphasis on regional transit and central access."

### District excluded by hard constraint

Pattern:

"Rofo excluded [District] because you set [hard constraint]."

Example:

"Mission Bay was removed because you asked to stay near Jackson Square and not consider nearby alternatives."

### Adjacent district introduced

Pattern:

"Rofo introduced [District] because it is a nearby or comparable alternative to [anchor] and may solve [business need] differently."

Example:

"Financial District was added as a nearby alternative to Jackson Square because it offers deeper traditional office inventory and stronger regional transit."

### Shortlist not narrowing

Pattern:

"Rofo is keeping [number] districts visible because the information provided so far does not create a meaningful difference between them. The next question most likely to clarify the shortlist is [question]."

### Priority changes order without eliminating candidates

Pattern:

"Your priority for [signal] changed the order, but it did not eliminate [districts] because they remain credible for [other signal]."

Example:

"Your priority for recruiting moved SoMa and Mission Bay ahead, but Financial District remains credible because client access and transit still matter."

## 13. Business Profile and Broker Handoff

Rofo should capture business context that helps the broker start from a better point.

Useful business context:

- 18 employees.
- Growing.
- Hybrid schedule.
- Wants something professional.
- Does not want to over-invest in unnecessary district image or specialized inventory.
- Needs to attract employees.
- Clients visit regularly.
- Employees commute from Marin and East Bay.
- Prefers a modern office environment.
- Flexible growth is important.

This is not brokerage qualification.

The core Business Profile should not require:

- Exact budget.
- Rental rate.
- Concessions.
- Lease term.
- Tenant-improvement allowance.
- Credit profile.
- Transaction structure.

The handoff should communicate:

- The recommended shortlist.
- Why those districts fit the business.
- What tradeoffs remain unresolved.
- Which dynamic market conditions the broker should validate.
- What questions the user should ask before touring.

Broker value:

- Validate current availability and lease economics.
- Identify active buildings and landlords.
- Confirm fit against live market conditions.
- Execute the search and transaction.

Rofo value:

- Clarify the business context.
- Explain the location strategy.
- Reduce uncertainty before the first broker conversation.

## 14. Signals Intentionally Excluded

The following are intentionally excluded from the core district recommendation model.

| Signal | Reason excluded | Proper owner |
| --- | --- | --- |
| Exact budget | Users may not know it, and district-level price claims risk false precision | Broker review |
| Current asking rents | Dynamic and building-specific | Broker review |
| Lease economics | Transaction-specific | Broker review |
| Concessions | Dynamic and landlord-specific | Broker review |
| Landlord motivation | Broker intelligence, not stable district knowledge | Broker review |
| Available inventory | Dynamic listing condition | Broker review |
| Building-specific economics | Depends on exact building, floor, timing, and deal | Broker review |
| Detailed lease term | Brokerage qualification, not district recommendation | Broker review |
| Negotiation strategy | Transaction execution | Broker review |

Rofo may capture "I do not want to overspend" as business context, but it should not translate that into unsupported district pricing judgments.

## 15. Proposed Editorial Rules

1. City and space type create the initial district consideration set.
2. The initial San Francisco office set should be broad and unranked unless additional signals justify ranking.
3. Do not force a fixed shortlist size.
4. Rofo should produce the smallest shortlist it can confidently defend.
5. Do not remove a district unless another candidate is meaningfully stronger or a hard constraint makes it incompatible.
6. User-selected district anchors strongly weight the anchor and known nearby alternatives.
7. Adjacent alternatives enter only when the user is open to comparison or when they solve the same business need clearly.
8. Hard constraints may filter districts.
9. Priorities reorder districts but rarely exclude them.
10. Numbered rankings appear only after meaningful differentiation.
11. Ties and near-ties remain visible.
12. The next question should target the largest unresolved tradeoff.
13. Every district movement must be explainable in business language.
14. Stable district attributes drive Rofo's recommendation model.
15. Dynamic market conditions remain part of Live Market Review and broker execution.
16. Business Profile questions should collect business context, not brokerage qualification.
17. Budget, current rent, concessions, and availability should not rank districts.
18. If the model is uncertain, it should say what it needs to learn next.

## 16. Data Gaps and Implementation Readiness

### Attributes already supported

| Attribute | Source | Quality | Launch use |
| --- | --- | --- | --- |
| District identity and market ownership | `_data/locationKnowledgeGraph.js` | Strong for SF canonical districts | Yes |
| Office fit | `_data/locationKnowledgeGraph.js` `spaceTypeFit.office` | Strong for eligible universe | Yes |
| Transit, parking, walkability, client access, image, expansion, talent, amenities | `_data/locationKnowledgeGraph.js` `attributes` | Useful but broad | Yes with clear caveats |
| Office summaries, best-fit users, strengths, tradeoffs | `_data/locationKnowledgeGraph.js` | Strong editorial support | Yes |
| Nearby/comparable districts | `relationships.compareWith` | Useful but not typed | Yes for simple alternatives |
| CME evidence collections | `_data/commercialMarketEvidence.js`, `data/commercial-market-evidence/san-francisco/*.js` | Strong for all ten SF districts | Yes |
| Representative building evidence | `_data/commercialBuildingIntelligence.js` | Strong counts and records, needs more recommendation-facing normalization | Yes as evidence support |

### Attributes needing normalization

| Gap | Current source | Missing work | Blocks MVP |
| --- | --- | --- | --- |
| Cost/economics language | `attributes.costPosition`, resolver `priorityAttributeRules`, district copy | Remove from launch district ranking; preserve cost sensitivity only as broker-handoff context | No, if quarantined from ranking before launch |
| Character taxonomy | District summaries, `creativeEnvironment`, `corporateEnvironment`, editorial copy | Normalize traditional, boutique, modern, creative, neighborhood, lower-rise | No, but improves explainability |
| Mode-specific transit | Broad `transitAccess` | Add BART, Caltrain, ferry, Muni, drive orientation tags | No for MVP, but needed for commute precision |
| Relationship types | `relationships.compareWith` | Add adjacent, nearby, substitute, comparison, cross-market alternative | No for MVP if examples remain conservative |
| Institution proximity | Mission Bay and district copy | Add structured UCSF and major-anchor proximity tags | No, but needed for institution-driven recommendations |
| Office scale support | CBI counts and expansion flexibility | Normalize scale bands and inventory-depth signals | No for MVP if used conservatively |
| Business Profile facts | `js/search-profile.js` | Add headcount, occupancy, hybrid, growth, client visits, industry, office use | Yes for full model behavior |
| Shortlist behavior | `js/recommendation-resolver.js` | Remove fixed `.slice(0, 3)` behavior for this model | Yes for product principle |
| Highest-value next question | Not implemented | Add editorial question-selection rules | No for first structured model, yes for Recommendation Explorer |

### Missing commute mappings

Needed before confident commute-driven recommendations:

- Marin commute orientation.
- East Bay commute orientation.
- Peninsula/South Bay commute orientation.
- BART access.
- Caltrain access.
- Ferry access.
- Driving/parking practicality by district.

Current broad `transitAccess` and `parking` fields can support cautious first-release explanations but not precise mode-based ranking.

### Unsupported or deferred priority dimensions

Deferred until data improves:

- Quiet professional environment.
- Lower-rise environment as a structured attribute.
- Outdoor access.
- Detailed customer/partner geography.
- Dynamic economic fit.
- Available inventory fit.

### Resolved launch decisions

These launch decisions are resolved in this document:

- South Beach remains in the default initial consideration set.
- Showplace Square is signal-specific, not default.
- Mission District is secondary and signal-specific, not default.
- Budget, current rent, concessions, current availability, and `attributes.costPosition` do not rank districts.
- "Nice," "impressive," and "cool" office language is normalized through the office-environment question.

### Implementation readiness

The San Francisco Office editorial model is ready to convert into structured data after these decisions are accepted in review.

The repository already contains enough stable district intelligence to build a credible first release if the launch scope is conservative:

- San Francisco + Office initial set of Financial District, SoMa, Mission Bay, Jackson Square, and South Beach.
- District attributes and explanations.
- Business facts that refine but do not overfit.
- Anchor and nearby-alternative behavior.
- No budget, rent, concession, or availability scoring.
- Transparent explanations and non-fixed shortlist sizes.

Minimum data work required before coding:

1. Quarantine budget/current-cost matching from district ranking.
2. Encode the launch office-environment taxonomy defined in this document.
3. Add or define the Business Profile facts required by this model.
4. Replace fixed top-three shortlist behavior for San Francisco office with "smallest defensible shortlist" behavior.
5. Add mode-specific commute tags or explicitly label commute recommendations as lower-confidence until those tags exist.

Recommended next step:

- Begin structured-data implementation for the San Francisco Office model, with the cost quarantine and office-environment taxonomy treated as required launch work.

## 17. Structured-Data Implementation Shape

Implementation status: encoded as a repository-native reference model and testable evaluator.

Structured data:

- `_data/sfOfficeRecommendationModel.js`

Model key:

- `san-francisco:office`

Normalization:

- `lib/recommendations/normalize-sf-office-profile.js`

Resolver:

- `lib/recommendations/sf-office-recommendation-resolver.js`

Focused QA:

- `scripts/qa-sf-office-recommendation-model.js`
- `scripts/qa-sf-office-recommendation-explorer.js`

Internal prototype route:

- `/prototype/recommendation-explorer/sf-office/`

The structured model keeps editorial judgment in data rather than resolver code. It separates:

- model metadata
- launch initial consideration set
- district definitions
- stable district attributes
- business facts
- supported constraints
- priority definitions
- office-environment taxonomy
- signal-specific entry and movement rules
- nearby alternatives
- explanation templates
- confidence states
- next-question metadata

Supported launch inputs:

- city
- space type
- headcount
- regular occupancy
- hybrid work pattern
- expected growth
- client visit frequency
- recruiting importance
- business type or industry
- operational office use
- district anchor
- nearby-alternative openness
- commute orientation
- parking importance
- regional transit importance
- walkability and amenities importance
- institution proximity
- office-environment preference
- optional square-footage compatibility input

Supported source-answer mappings:

| Source answer | Normalized resolver field | Notes |
| --- | --- | --- |
| `locations[0].city`, `city`, or `market` | `city` | Selects `san-francisco:office` only when normalized city is San Francisco and space type is Office. |
| `spaceType` | `spaceType` | Only Office selects this model. Other space types remain unsupported by this resolver path. |
| `locations[0]` district label or slug | `districtAnchor` | Supports current Business Profile location objects for San Francisco district anchors. |
| `locationIntent` | `locationIntent`, `openToNearbyAlternatives`, `hardDistrictOnly` | `compare` and `discover` allow nearby alternatives; `focus` can hard-scope a district anchor. |
| `size` or `approximateSquareFootage` | `approximateSquareFootage` | Compatibility only; not preferred over business facts. |
| `features` containing `Transit access` | `transitImportance` | Current Business Profile compatibility mapping. |
| `features` containing `Parking` | `parkingImportance` | Current Business Profile compatibility mapping. |
| `headcount` | `headcount` | Future advisory input. |
| `regularOccupancy` | `regularOccupancy` | Future advisory input. |
| `hybridWorkPattern` | `hybridWorkPattern` | Future advisory input. |
| `expectedGrowth` | `expectedGrowth` | Future advisory input. |
| `clientVisitFrequency` | `clientVisitFrequency` | Future advisory input. |
| `recruitingImportance` | `recruitingImportance` | Future advisory input. |
| `businessType` | `businessType` | Future advisory input. |
| `operationalUse` | `operationalUse` | Future advisory input. |
| `commuteOrientation` | `commuteOrientation` | Broad editorial signal only; no precise commute claims. |
| `officeEnvironment` or `environmentPreference` | `officeEnvironment` | Normalized to the approved office-environment taxonomy. |
| `institutionProximity` | `institutionProximity` | Currently supports broad UCSF-oriented behavior only. |

Unsupported ranking inputs:

- exact budget
- current rents
- asking rates
- concessions
- current availability
- landlord motivation
- lease economics
- `costPosition`

Cost and budget language may be retained in the normalized profile as broker-handoff context, but it does not move districts.

Unsupported or unrecognized source answers:

- The normalizer returns `unsupportedAnswers` for fields outside the San Francisco Office launch mapping.
- Nested unsupported fields under `facts`, `constraints`, and `priorities` are preserved for review.
- Unknown or malformed optional values are ignored rather than inferred.

Shortlist behavior:

- San Francisco + Office returns the five-district launch initial consideration set without numbered ranking.
- Additional facts, constraints, priorities, and environment preferences may create an emerging ranking or refined shortlist.
- The resolver does not slice to a fixed top three.
- Candidates remain visible when differences are not meaningful.
- Signal-specific districts enter only through explicit model-supported signals.
- Exclusions are limited to hard user constraints.

Future city and space-type models should follow the same pattern:

1. Write or approve an editorial recommendation model.
2. Encode the model in an editor-readable `_data/*RecommendationModel.js` file.
3. Keep dynamic market economics out of district ranking.
4. Implement a model-specific evaluator behind a dedicated key or resolver path.
5. Add deterministic QA covering starting set, signal-specific entry, shortlist behavior, ignored economics signals, and next-question selection.
6. Integrate into product UI only after the model and evaluator pass focused QA.

Prototype boundary:

- The prototype route is static, internal, and intentionally reachable only by direct URL.
- It renders curated sample source-answer profiles through the normalizer and resolver.
- It does not read browser storage, does not submit leads, and does not replace `/recommendations/`.
- If a model key is missing, unsupported, malformed, or fails in a future runtime integration, production recommendations should continue using the existing resolver path.

Focused QA command:

```bash
node scripts/qa-sf-office-recommendation-explorer.js
```

Product-review harness:

- Review document: `docs/product/sf-office-recommendation-review.md`
- Review data: `_data/sfOfficeRecommendationReviewProfiles.js`
- Review route: `/prototype/recommendation-explorer/sf-office-review/`
- Review QA: `node scripts/qa-sf-office-recommendation-review.js`

The harness evaluates the current model against 12 realistic San Francisco office-search profiles and five one-answer sensitivity checks. It is intended to identify which Business Profile questions have recommendation leverage before adding production questions or building the interactive Recommendation Explorer.

Interactive prototype:

- Interaction document: `docs/product/sf-office-recommendation-interaction.md`
- Interaction policy: `lib/recommendations/sf-office-recommendation-interaction-policy.js`
- Precomputed prototype bridge: `_data/sfOfficeRecommendationInteractivePrototype.js`
- Interactive route: `/prototype/recommendation-explorer/sf-office-interactive/`
- Interaction QA: `node scripts/qa-sf-office-recommendation-interaction.js`

The interactive prototype demonstrates a Business Profile Workspace: editable business context on the left, Best Fits and district detail on the right, and a persistent `Create My Location Brief` action. Resolver logic remains separate from workspace editing, recommendation reveal behavior, and prototype presentation.

Known integration gaps:

- The current production Business Profile does not yet collect every advisory fact required by the model.
- Commute orientation remains broad and should not be presented as precise BART, ferry, Caltrain, Marin, East Bay, Peninsula, or South Bay access guidance.
- Relationship types remain coarse; `nearby`, `adjacent`, `substitute`, and `comparison` should not be presented as fully normalized until relationship metadata is expanded.
- The production Location Brief is not wired to this resolver yet.
