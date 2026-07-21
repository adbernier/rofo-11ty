# Rofo Commercial Ecosystem Framework v1

Rofo helps businesses make better commercial location decisions.

The Commercial Ecosystem Framework defines how Rofo models commercial real estate across markets, recommendations, Publisher coverage, representative buildings, Building Briefs, Search Profiles, and future product workflows.

This is an architectural and editorial standard. It does not change runtime recommendation behavior, Publisher scoring, Search Profile questions, or page templates by itself.

The machine-readable v1 implementation is documented in `docs/commercial-ecosystem-data-model.md` and owned by `_data/commercialEcosystemTaxonomy.js`. That data model is additive: it exposes ecosystem metadata to Publisher, QA, the Commercial Location Graph, Representative Buildings, and future recommendation/Search Profile work without changing current production outcomes.

## 1. Vision and Philosophy

Businesses search for places where their operations can succeed, not for property types. Rofo translates business needs into the commercial ecosystems where those businesses thrive.

Every metropolitan area expresses the same commercial ecosystems differently. Rofo's job is to understand how each metro expresses those ecosystems, not to invent a new model for every city.

The framework should help Rofo answer:

- What kind of business is this?
- What activities does the business need to support?
- Which commercial ecosystems support those activities?
- Which districts express those ecosystems in this metro?
- Which representative buildings make the district tangible?
- Which Building Briefs help the user understand fit and tradeoffs?
- What should Rofo investigate in the live market next?

Rofo should not force users to think like brokers. A user may say "I run a cabinet shop," "I need a medical office," or "I have a growing consulting firm." Rofo should translate that into commercial geography, building patterns, tradeoffs, and validation questions.

## 2. Universal Commercial Ecosystems

Commercial ecosystems are metro-independent categories of business environment. They are broader than property types and more useful than raw listing categories.

### Office

Office ecosystems support businesses whose primary work is administrative, advisory, executive, creative, technical, or client-facing knowledge work.

Common business types:

- professional services
- law firms
- accounting firms
- consulting firms
- startups
- technology teams
- nonprofit and association offices
- regional headquarters
- administrative teams

Location decisions often depend on client access, employee commute, transit, parking, executive image, neighborhood amenities, expansion flexibility, and workplace character.

### Industrial & Flex

Industrial and flex ecosystems support physical operations, production, storage, logistics, service vehicles, light manufacturing, contractor work, and office-plus-operational uses.

Common business types:

- contractors
- HVAC companies
- landscapers
- cabinet shops
- auto repair users
- distributors
- wholesalers
- e-commerce fulfillment users
- light manufacturers
- service industrial companies
- office/flex teams

Location decisions often depend on truck access, loading, clear height, power, yard or outdoor storage, freeway access, parking, zoning fit, employee access, and customer or service territory.

### Retail

Retail ecosystems support customer-facing businesses that depend on visibility, access, co-tenancy, household or worker demand, service radius, and street or center positioning.

Common business types:

- restaurants
- cafes
- service retail
- wellness providers
- boutiques
- fitness users
- local customer-service businesses
- showroom users

Location decisions often depend on customer parking, foot traffic, signage, co-tenancy, daytime population, evening and weekend activity, household income, visibility, and operating constraints.

### Medical

Medical ecosystems support patient-serving, referral-driven, wellness, specialty, and healthcare-adjacent businesses.

Common business types:

- medical practices
- dental practices
- specialty clinics
- physical therapy
- wellness providers
- healthcare-adjacent offices
- outpatient service businesses

Location decisions often depend on patient geography, parking, accessibility, referral networks, medical buildout, visibility, transit or freeway access, and proximity to hospitals or healthcare clusters.

### Life Science

Life Science ecosystems support research, biotechnology, laboratory-adjacent, health technology, R&D, and innovation companies.

Common business types:

- research companies
- biotech companies
- life-science support offices
- health technology companies
- R&D teams
- technical operations users

Location decisions often depend on institutional adjacency, talent access, lab or technical infrastructure, loading, specialized building systems, campus environment, transit, and proximity to related companies.

Do not imply laboratory capability unless the specific building or district data supports it.

### Hospitality

Hospitality ecosystems support visitor-serving, entertainment, hotel-adjacent, event, restaurant, and experience-driven businesses.

Common business types:

- hotels
- restaurants
- event venues
- entertainment operators
- visitor-serving retail
- hospitality-adjacent services

Location decisions often depend on visitor demand, event patterns, foot traffic, parking, transit, tourism, adjacent restaurants or hotels, and operating-hour patterns.

### Special Purpose

Special Purpose ecosystems support businesses with unusual physical, regulatory, civic, institutional, education, religious, cultural, or infrastructure requirements.

Common business types:

- schools and training providers
- civic or public agencies
- religious organizations
- cultural institutions
- production studios
- specialty healthcare or care facilities
- high-security or regulated users
- infrastructure-heavy operations

Location decisions often depend on use permissions, site control, access, parking, loading, neighborhood compatibility, power or utility needs, code compliance, and future adaptability.

## 3. Business Archetypes

Business archetypes are plain-English operating models. They are not NAICS codes and should not be treated as rigid taxonomies.

### Professional Office

Primarily desk-based business with clients, employees, meetings, and administrative workflows. Decisions depend on commute, client access, image, cost, layout, and amenities.

### Startup

Growth-oriented team that may need flexible space, recruiting appeal, transit, collaboration space, and expansion options. Decisions often balance cost control with talent access and company identity.

### Creative Studio

Design, media, brand, production, or creative-services business needing adaptable space, character, collaboration, and sometimes production-adjacent functionality. Decisions often weigh neighborhood identity against parking, cost, and scale.

### Medical Practice

Patient-serving business where parking, accessibility, referrals, visibility, and buildout are central. Decisions depend on patient geography more than office prestige.

### Law Firm

Client-facing professional office often sensitive to courthouse, civic, transit, and downtown access. Decisions balance credibility, private offices or meeting rooms, client arrival, and cost.

### Accounting Firm

Professional-service office that often values client access, parking, efficient layouts, privacy, and predictable occupancy costs. Seasonal workflows and visitor patterns may matter.

### Marketing Agency

Creative and client-facing office user that may value brand expression, collaboration space, transit, neighborhood energy, and recruiting appeal more than formal executive image.

### Contractor

Service business needing vehicle access, storage, dispatch, loading, and practical office or shop space. Decisions depend on service territory, yard needs, parking, and freeway access.

### Cabinet Shop

Production-oriented user needing shop space, loading, power, dust/noise tolerance, storage, and delivery access. Decisions depend on operational fit more than office image.

### Auto Repair

Customer and service-vehicle business needing bays, access, visibility, parking, code compatibility, and neighborhood tolerance. Decisions depend on site functionality and customer convenience.

### Landscaper

Service business needing vehicle parking, equipment storage, yard or outdoor storage, dispatch access, and regional service reach. Decisions depend on practical access and use permissions.

### HVAC Company

Contractor/service operation needing fleet parking, storage, office, dispatch, loading, and freeway access. Decisions often compare industrial/flex corridors rather than conventional office districts.

### Food Producer

Production business needing food-safe buildout, loading, cold or dry storage, delivery access, utilities, and regulatory fit. Decisions depend on operations, not storefront appeal unless retail is part of the model.

### Importer

Distribution or showroom-adjacent business needing storage, receiving, truck access, and sometimes customer-facing display. Decisions depend on logistics path, warehouse functionality, and market access.

### Distributor

Inventory and delivery business needing warehouse, loading, truck movement, freeway access, labor access, and sometimes office support. Decisions depend on delivery geography and building specifications.

### Wholesaler

Business selling to other businesses, often requiring storage, pickup, loading, showroom or counter sales, and regional access. Decisions depend on customer pattern and operational format.

### E-commerce Fulfillment

Inventory and shipping operation needing warehouse efficiency, loading, parcel carrier access, labor, parking, and growth flexibility. Decisions depend on throughput and logistics reliability.

### Light Manufacturer

Production user needing power, loading, floor capacity, ventilation, storage, and use compatibility. Decisions depend on technical fit and expansion flexibility.

### Research Company

Technical or scientific organization needing talent access, specialized rooms or labs where supported, institutional adjacency, utilities, and collaboration space. Decisions depend on ecosystem adjacency and technical building validation.

## 4. Business Activities

Business activities translate archetypes into location requirements.

Common activities include:

- client meetings
- patient visits
- employee collaboration
- focused office work
- recruiting
- executive presence
- showroom visits
- retail transactions
- food service
- production
- assembly
- repair
- vehicle dispatch
- storage
- shipping and receiving
- loading
- last-mile delivery
- research and testing
- regulated operations
- event or visitor hosting

The same business can combine activities. For example, an HVAC company may need office administration, dispatch, fleet parking, storage, and customer service. Rofo should map the activity mix before narrowing to districts or buildings.

## 5. Ecosystem-to-District Relationships

A district is a local expression of one or more commercial ecosystems.

Examples:

- Downtown Sacramento expresses the Office ecosystem through civic, legal, government-adjacent, and client-facing professional demand.
- Midtown Sacramento expresses Office, Retail, and Medical through smaller offices, walkability, restaurants, wellness, and neighborhood-serving demand.
- Power Inn expresses Industrial & Flex through service, warehouse, contractor, and production-oriented needs.
- Mission Bay in San Francisco expresses Office, Life Science, and Medical-adjacent ecosystems through newer buildings, institutional adjacency, and innovation context.

The framework should avoid saying a district "is" a single ecosystem unless the market is truly narrow. Most valuable districts blend ecosystems, and recommendations should explain which part of the blend matters for the user's business.

District records should eventually describe:

- primary ecosystems
- secondary ecosystems
- business archetypes best supported
- activities the district supports well
- activities that require caution
- representative buildings
- comparison districts
- validation questions

## 6. Representative Building Role

Representative Buildings are editorial examples that make a district's commercial ecosystem tangible.

They are not:

- listings
- availability claims
- proof that space is currently available
- a ranking of the best buildings
- a replacement for market research

They help answer:

- What kinds of buildings define this district?
- What environments do businesses compare here?
- What does the district feel like at the building level?
- Which tradeoffs are visible through actual building examples?
- Which buildings should eventually receive full Building Briefs?

A representative-building foundation may exist before full Building Brief migration. Foundation entries should use existing canonical building paths and include role, reason, fit summary, tradeoff, source confidence, and migration readiness.

## 7. Building Brief Role

Building Briefs are the production editorial pages for representative buildings.

They explain:

- why the building matters
- which business archetypes may fit
- which activities the building supports
- district context
- advantages
- tradeoffs
- nearby decision alternatives
- validation questions before touring or negotiating

Building Briefs are the bridge from district education into Live Market Investigation. They should help the user decide what to investigate, not imply that Rofo has confirmed live space.

## 8. Recommendation Engine Mapping

The recommendation engine should continue to be district-first.

The framework maps recommendation inputs this way:

Business Archetype

-> Business Activities

-> Commercial Ecosystem fit

-> Metro and district candidates

-> District strengths and tradeoffs

-> Representative Buildings

-> Building Briefs

-> Live Market Investigation

Existing recommendation logic already uses space type, size, priorities, graph fit, attributes, relationships, and validation questions. Future versions can make the business archetype and activity layers more explicit without changing the core principle: recommend commercial locations first, then use buildings as evidence.

Recommendations should explain:

- why this district fits the business
- which ecosystem match is doing the work
- what tradeoff matters
- what alternative district should be compared
- which representative buildings help the user picture the district
- what Rofo should investigate next

## 9. Search Profile Evolution

The Search Profile should eventually capture business archetype and business activities more directly.

Today, users often express needs through space type, size, market, timing, and priorities. Future Search Profile improvements should ask only what helps Rofo infer operating needs.

Potential future fields:

- business archetype
- primary activities
- customer, client, patient, or employee access pattern
- operational requirements
- fleet, loading, storage, or parking needs
- workplace character preference
- district tolerance or exclusions
- growth and expansion needs
- live-market investigation priorities

The Search Profile should not become a broker questionnaire. It should remain a decision-support intake that helps Rofo translate business operations into commercial geography.

## 10. Publisher Integration

Publisher currently measures geographic and content readiness through metro foundation, district coverage, comparison graph, representative buildings, Building Briefs, recommendation readiness, editorial quality, and internal linking.

The ecosystem framework adds a future second axis:

- geographic coverage: which cities and districts are represented
- ecosystem coverage: which commercial ecosystems and business activities are represented

Both matter independently.

A metro may have broad geography but weak ecosystem coverage if it lacks industrial, medical, or retail logic. A metro may have strong recommendation QA for office users but still be shallow for contractors, medical practices, or distributors.

Publisher should eventually report:

- ecosystems represented by metro
- priority districts by ecosystem
- archetypes supported by recommendation QA
- representative buildings by ecosystem
- Building Briefs by ecosystem
- underserved ecosystems
- ecosystem-specific blockers

No Publisher scoring changes are made by this document.

## 11. Coverage Model

Coverage should be measured at several levels.

### Metro Coverage

Does the metro have a usable commercial-location model?

Signals:

- canonical city or metro record
- Compass readiness
- public city page
- district graph coverage
- recommendation QA
- representative-building foundation
- Building Brief starter collection

### Geographic Coverage

Are the important commercial districts represented?

Signals:

- public district pages
- graph nodes
- market paths
- comparison relationships
- district descriptions
- district qualities

### Ecosystem Coverage

Are the major commercial ecosystems in the metro represented?

Signals:

- ecosystem tags or fit across graph nodes
- recommendation scenarios by ecosystem
- representative buildings by ecosystem
- validation questions by ecosystem
- Building Briefs that explain different environments

### Archetype Coverage

Can Rofo support plain-English business types?

Signals:

- recommendation QA scenarios
- Search Profile interpretation
- district fit language
- explainability output
- validation questions tailored to business activities

### Building Coverage

Do representative buildings make the ecosystem visible?

Signals:

- canonical building paths
- district association
- representative role
- reason
- best-fit summary
- primary tradeoff
- Building Brief status

## 12. Metro Expansion Methodology

Future metro expansion should follow this sequence:

1. Identify the metro's major commercial ecosystems.
2. Identify the districts that express those ecosystems.
3. Map business archetypes and activities to district fit.
4. Add comparison relationships that reflect real tenant decisions.
5. Add validation questions by ecosystem and district.
6. Curate representative buildings for priority districts.
7. Migrate the first Building Brief collection across distinct ecosystems.
8. Run recommendation QA using archetype-based scenarios.
9. Re-run Publisher and review geographic and ecosystem gaps.
10. Use Live Market Investigation demand to prioritize deeper enrichment.

The goal is not to make every metro equally complete. The goal is to make each metro useful based on the ecosystems it can credibly support.

## 13. Existing Architecture Alignment

### Commercial Location Graph

Already aligned. The graph stores location nodes, space-type fit, strengths, tradeoffs, attributes, comparisons, market paths, and validation questions. It is the natural place to express ecosystem fit and district relationships.

Future alignment: add explicit ecosystem and archetype support where it improves QA and explainability.

### Representative Buildings

Already aligned. Representative buildings make district environments tangible and are now measured by Publisher.

Future alignment: classify representative buildings by ecosystem role, activity support, and Building Brief migration readiness.

### Building Briefs

Already aligned. Building Briefs are decision-support pages, not listings. They explain fit, tradeoffs, district context, alternatives, and validation questions.

Future alignment: tie Building Brief sections more explicitly to business archetypes and activities when the data supports it.

### Recommendation Engine

Already partially aligned. Recommendations are district-first and use graph-backed fit, priorities, tradeoffs, relationships, and validation questions.

Future alignment: make the archetype -> activity -> ecosystem translation explicit in resolver inputs and explanations.

### Search Profile

Partially aligned. Search Profile captures enough information to recommend locations, but it is still mostly expressed through space type, size, timing, location, and priorities.

Future alignment: capture business archetype and activity mix without making users learn commercial real estate terminology.

### Publisher

Already aligned for coverage planning. Publisher measures recommendation readiness, district coverage, representative buildings, Building Briefs, and public publishing readiness.

Future alignment: add ecosystem-aware coverage and QA dimensions after the taxonomy is represented in source data.

### Live Market Investigation

Already aligned. Live Market Investigation turns representative examples into a structured next step: what should Rofo investigate in the live market now?

Future alignment: carry ecosystem, archetype, activity, district, and representative-building context into operator review and future shortlist workflows.

## 14. Future Implementation Roadmap

### Phase 1: Documentation and Vocabulary

Status: this document.

Define the commercial ecosystem taxonomy, business archetypes, activity layer, and relationship model.

### Phase 2: Ecosystem Metadata

Add optional ecosystem metadata to graph nodes and representative-building foundation entries.

Potential fields:

- `primaryEcosystems`
- `secondaryEcosystems`
- `supportedArchetypes`
- `supportedActivities`
- `validationActivities`

### Phase 3: Ecosystem-Aware Publisher Scoring

Extend Publisher to report ecosystem coverage alongside geography coverage.

Possible outputs:

- ecosystem coverage by metro
- underserved ecosystems
- Building Briefs by ecosystem
- recommendation QA scenarios by ecosystem
- representative-building gaps by ecosystem

### Phase 4: Archetype-Based Recommendation QA

Add QA scenarios organized around business archetypes and activities, not just space type.

Examples:

- law firm needing downtown client access
- medical practice needing patient parking
- HVAC contractor needing service dispatch and storage
- e-commerce company needing small fulfillment space
- startup balancing talent access and cost

### Phase 5: Search Profile Evolution

Introduce business archetype and activity capture in the Search Profile only after the graph and QA layers can use it.

The UX should stay simple: ask what the business does and how the space supports operations.

### Phase 6: Ecosystem-Aware Explainability

Improve recommendation explanations so users understand the commercial ecosystem fit.

Example:

"Rofo recommended Arden / Point West because your medical practice needs patient parking and central/north Sacramento access. Midtown offers stronger walkability, but Arden is more practical for patient arrival."

### Phase 7: Ecosystem Coverage Dashboards

Extend Publisher admin views to show:

- metro ecosystem map
- strongest ecosystem coverage
- weakest ecosystem coverage
- next sprint by ecosystem
- Building Brief migration needs by ecosystem
- QA gaps by business archetype

### Phase 8: Live Market Investigation Handoff

Carry ecosystem and activity context into investigation requests.

Operators should see:

- business archetype
- activities to support
- selected ecosystem
- district recommendation
- representative buildings shown
- investigation scope
- validation questions

This prepares Rofo for shortlist and tour workflows without turning recommendations into listing search.

## Operating Rule

Future Rofo work should enrich data and intelligence inside this framework rather than creating new market-specific page models.

One product model.

Different metro expressions.

No fabricated completeness.
