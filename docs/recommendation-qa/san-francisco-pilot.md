# San Francisco Recommendation QA Pilot

Generated: 2026-08-05T23:27:18.397Z

This internal QA report validates whether San Francisco Location Brief recommendations feel differentiated, explainable, defensible, and actionable using the current Commercial Location Knowledge Graph. It is not customer-facing content.

## Summary

- Scenarios reviewed: 8
- Scenarios passing baseline advisor-readiness checks: 8
- Scenarios needing review: 0
- Unique primary recommendations: 8
- Repeated primary recommendations: None

Baseline checks require a primary recommendation, at least one expected directional match, meaningful tradeoffs, validation questions, and complete explainability fields. A pass does not mean the recommendation is final; it means the brief is credible enough for advisor review.

## Recommendation Diversity Check

The San Francisco pilot produces meaningfully different primary recommendations across the QA scenarios.

## Editorial Broker Review

Editorial findings:
- San Francisco scenarios produce differentiated recommendations across core San Francisco office, life-science/growth, creative office, boutique executive office, Palo Alto executive/startup, Redwood City midpoint office, North Bayshore technology campus, and Moffett Park R&D profiles.
- City-level San Francisco discovery routes into distinct local market paths for Mission Bay, SoMa, and the Financial District rather than returning a generic city answer.
- Peninsula and South Bay district scenarios use focused graph-backed recommendations with meaningful comparison alternatives, tradeoffs, and validation questions.
- North San Jose and Stanford Research Park still have separate explainability-refinement opportunities outside this bounded mission.

Calibration changes:
- Added node-level tradeoffs for Downtown Palo Alto, Downtown Redwood City, North Bayshore, and Moffett Park so recommendation and Location Brief explainability can surface durable commercial compromises.
- Added a San Francisco QA suite to the shared recommendation runner without changing resolver scoring, recommendation rankings, or Search Profile behavior.
- Registered San Francisco in the authoritative recommendation QA status data so Publisher can distinguish completed Compass QA from a missing QA record.

QA comparison before vs after:
- Before this mission, Publisher reported San Francisco recommendation readiness as missing authoritative QA status.
- Before this mission, the included Peninsula and South Bay nodes had strengths and validation questions but lacked explicit node-level tradeoffs.
- After this mission, San Francisco has a generated QA report and 8 passing scenarios.
- No recommendation resolver changes were made; scenario outputs document current graph behavior.

Remaining weaknesses:
- North San Jose and Stanford Research Park still need explicit node-level tradeoffs in a follow-on explainability refinement.
- Retail and medical guidance remain lighter than office, technology, and life-science paths.
- Representative-building and Building Profile depth can continue improving independently of Compass QA readiness.

Compass readiness recommendation:
- San Francisco is recommended as Compass Ready for V1 Location Briefs after this QA baseline. The graph supports differentiated, explainable market paths across core San Francisco, Peninsula, and South Bay scenarios, while remaining explainability refinements should continue as editorial maturity work.

## Scenario Reviews

### Mission Bay Life Science / Growth Office

- Profile: 18,000 sqft Office in San Francisco
- Priorities: life science, growth company, newer buildings, Caltrain, UCSF proximity
- Expected direction: Favor Mission Bay and adjacent core San Francisco alternatives when modern growth-company and life-science-adjacent signals matter.
- Top recommendation: Mission Bay (Strong fit)
- Secondary recommendation: Dogpatch
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Mission Bay - Strong fit: Strong fit for growth-stage office users that value newer inventory, transit, and access to San Francisco's technology and life-science ecosystem.
- 2. Dogpatch - Good fit: Good fit for creative, innovation, and office/R&D users that value adaptive industrial character near Mission Bay.
- 3. Financial District - Strong fit: Strong fit for client-facing office users that value transit, a recognized business address, and traditional Class A office inventory.

Why this differs:
- Matches expected directional nodes: mission-bay, financial-district

Selection rationale:
- Mission Bay is recommended first because it is a strong fit for growth-stage office users that value newer inventory, transit, and access to San Francisco's technology and life-science ecosystem. It aligns with the profile priorities around life science, growth company, and newer buildings. The strongest supporting signals are newer office inventory, UCSF and life-science adjacency, and Caltrain and waterfront access.

Matched priorities:
- life science
- growth company
- newer buildings
- Caltrain

Tradeoff summary:
- premium pricing versus older central-city alternatives

Alternative rationale:
- Dogpatch remains relevant because it is a good fit for creative, innovation, and office/R&D users that value adaptive industrial character near Mission Bay. Mission Bay appears to fit the initial profile more directly, while Dogpatch is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is proximity to UCSF or life-science partners important?
- How sensitive is the search to premium rents?
- Will employees rely on transit or regional commute routes?
- Do you need room to expand in the same district?

Strengths surfaced:
- newer office inventory
- UCSF and life-science adjacency
- Caltrain and waterfront access
- modern innovation district context
- industrial reuse character
- Mission Bay adjacency

Tradeoffs surfaced:
- premium pricing versus older central-city alternatives
- less traditional client-facing CBD identity than the Financial District
- less polished and transit-rich than Mission Bay or the Financial District
- less creative warehouse character than SoMa
- less life-science adjacency than Mission Bay

Questions to validate:
- Is proximity to UCSF or life-science partners important?
- How sensitive is the search to premium rents?
- Will employees rely on transit or regional commute routes?
- Do you need room to expand in the same district?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### SoMa Creative Technology Office

- Profile: 10,000 sqft Office in San Francisco
- Priorities: creative office, startup, central San Francisco, adaptive buildings, restaurants
- Expected direction: Favor SoMa and nearby creative or growth-office alternatives over a default formal CBD path.
- Top recommendation: SoMa (Strong fit)
- Secondary recommendation: Showplace Square
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. SoMa - Strong fit: Strong fit for teams that want central San Francisco access with more creative, adaptive, and flexible office character than a traditional tower core.
- 2. Showplace Square - Strong fit: Strong fit for creative office, AI, robotics, and product teams that value brick-and-timber character near SoMa and Potrero.
- 3. Jackson Square - Strong fit: Strong fit for smaller office users that want a polished, walkable, downtown-adjacent setting with more character than a tower core.

Why this differs:
- Matches expected directional nodes: soma, jackson-square

Selection rationale:
- SoMa is recommended first because it is a strong fit for teams that want central San Francisco access with more creative, adaptive, and flexible office character than a traditional tower core. It aligns with the profile priorities around creative office, central San Francisco, and adaptive buildings. The strongest supporting signals are creative office inventory, central access, and adaptive buildings.

Matched priorities:
- creative office
- central San Francisco
- adaptive buildings
- restaurants

Tradeoff summary:
- building quality and street context vary by block

Alternative rationale:
- Showplace Square remains relevant because it is a strong fit for creative office, AI, robotics, and product teams that value brick-and-timber character near SoMa and Potrero. SoMa appears to fit the initial profile more directly, while Showplace Square is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do you want adaptive character or polished Class A office?
- How important is parking for employees?
- Will clients visit frequently?
- Are you comfortable evaluating block-by-block differences?

Strengths surfaced:
- creative office inventory
- central access
- adaptive buildings
- proximity to downtown and Mission Bay
- creative office texture
- production-adjacent buildings

Tradeoffs surfaced:
- building quality and street context vary by block
- parking can be difficult for auto-oriented teams
- block conditions and building quality vary
- smaller floorplates can limit expansion
- large contiguous requirements may need nearby alternatives

Questions to validate:
- Do you want adaptive character or polished Class A office?
- How important is parking for employees?
- Will clients visit frequently?
- Are you comfortable evaluating block-by-block differences?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Financial District Professional Services

- Profile: 7,500 sqft Office in San Francisco
- Priorities: law firm, financial services, client meetings, transit, traditional business address
- Expected direction: Favor the Financial District for formal professional-service office requirements while preserving Mission Bay and SoMa as comparison context.
- Top recommendation: Financial District (Strong fit)
- Secondary recommendation: Mission Bay
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Financial District - Strong fit: Strong fit for client-facing office users that value transit, a recognized business address, and traditional Class A office inventory.
- 2. Mission Bay - Strong fit: Strong fit for growth-stage office users that value newer inventory, transit, and access to San Francisco's technology and life-science ecosystem.
- 3. Potrero Hill - Good fit: Good fit for smaller creative office and production-adjacent users that want neighborhood character near Mission Bay, Dogpatch, and Showplace Square.

Why this differs:
- Matches expected directional nodes: financial-district, mission-bay

Selection rationale:
- Financial District is recommended first because it is a strong fit for client-facing office users that value transit, a recognized business address, and traditional Class A office inventory. It aligns with the profile priorities around financial services, client meetings, and transit. The strongest supporting signals are traditional office core, BART and ferry access, and client-facing business environment.

Matched priorities:
- financial services
- client meetings
- transit
- traditional business address

Tradeoff summary:
- less creative warehouse character than SoMa

Alternative rationale:
- Mission Bay remains relevant because it is a strong fit for growth-stage office users that value newer inventory, transit, and access to San Francisco's technology and life-science ecosystem. Financial District appears to fit the initial profile more directly, while Mission Bay is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do clients visit your office regularly?
- Is a traditional CBD address important?
- Will employees rely on BART, ferry, or regional transit?
- Is parking a major constraint?

Strengths surfaced:
- traditional office core
- BART and ferry access
- client-facing business environment
- established Class A inventory
- newer office inventory
- UCSF and life-science adjacency

Tradeoffs surfaced:
- less creative warehouse character than SoMa
- less life-science adjacency than Mission Bay
- premium pricing versus older central-city alternatives
- less traditional client-facing CBD identity than the Financial District
- less scalable and transit-rich than SoMa or the Financial District

Questions to validate:
- Do clients visit your office regularly?
- Is a traditional CBD address important?
- Will employees rely on BART, ferry, or regional transit?
- Is parking a major constraint?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Jackson Square Boutique Office

- Profile: 3,500 sqft Office in Jackson Square
- Priorities: boutique office, venture capital, client meetings, historic buildings, walkability
- Expected direction: Treat Jackson Square as the focused boutique office path with Financial District, SoMa, and Mission Bay as alternatives.
- Top recommendation: Jackson Square (Strong fit)
- Secondary recommendation: Financial District
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Jackson Square - Strong fit: Strong fit for smaller office users that want a polished, walkable, downtown-adjacent setting with more character than a tower core.

Why this differs:
- Matches expected directional nodes: jackson-square

Selection rationale:
- Jackson Square is recommended first because it is a strong fit for smaller office users that want a polished, walkable, downtown-adjacent setting with more character than a tower core. It aligns with the profile priorities around boutique office, venture capital, and client meetings. The strongest supporting signals are historic boutique buildings, walkable downtown adjacency, and executive/client-facing atmosphere.

Matched priorities:
- boutique office
- venture capital
- client meetings
- historic buildings

Tradeoff summary:
- smaller floorplates can limit expansion

Alternative rationale:
- Financial District may be relevant as a comparison or contingency because More traditional CBD inventory and larger office buildings.

Validation focus:
- Do you need smaller floorplates or room to expand?
- Is executive image more important than cost efficiency?
- Will clients visit the office?
- How important is parking versus walkability?

Strengths surfaced:
- historic boutique buildings
- walkable downtown adjacency
- executive/client-facing atmosphere
- creative and investor ecosystem

Tradeoffs surfaced:
- smaller floorplates can limit expansion
- large contiguous requirements may need nearby alternatives

Questions to validate:
- Do you need smaller floorplates or room to expand?
- Is executive image more important than cost efficiency?
- Will clients visit the office?
- How important is parking versus walkability?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Downtown Palo Alto Executive Startup

- Profile: 5,500 sqft Office in Downtown Palo Alto
- Priorities: startup, executive access, venture capital, Caltrain, walkability
- Expected direction: Favor Downtown Palo Alto for executive, venture, Caltrain, and walkable startup-office needs.
- Top recommendation: Downtown Palo Alto (Strong fit)
- Secondary recommendation: Stanford Research Park
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Downtown Palo Alto - Strong fit: Strong fit for office users that want walkability, executive access, Caltrain, and Silicon Valley credibility in a downtown setting.

Why this differs:
- Matches expected directional nodes: downtown-palo-alto

Selection rationale:
- Downtown Palo Alto is recommended first because it is a strong fit for office users that want walkability, executive access, Caltrain, and Silicon Valley credibility in a downtown setting. It aligns with the profile priorities around startup, executive access, and venture capital. The strongest supporting signals are walkable downtown, Caltrain access, and executive meeting environment.

Matched priorities:
- startup
- executive access
- venture capital
- Caltrain

Tradeoff summary:
- larger contiguous spaces can be harder to find

Alternative rationale:
- Stanford Research Park may be relevant as a comparison or contingency because More campus-oriented office and R&D environment.

Validation focus:
- Is Palo Alto's executive and recruiting signal worth the cost premium?
- Do you need Caltrain access?
- How much expansion room will you need?
- Is customer parking important?

Strengths surfaced:
- walkable downtown
- Caltrain access
- executive meeting environment
- Stanford and venture adjacency

Tradeoffs surfaced:
- larger contiguous spaces can be harder to find
- cost can be higher than nearby suburban alternatives

Questions to validate:
- Is Palo Alto's executive and recruiting signal worth the cost premium?
- Do you need Caltrain access?
- How much expansion room will you need?
- Is customer parking important?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Downtown Redwood City Peninsula Office

- Profile: 8,000 sqft Office in Downtown Redwood City
- Priorities: Peninsula midpoint, professional services, Caltrain, walkability, balanced cost
- Expected direction: Favor Downtown Redwood City as a balanced Peninsula downtown alternative to Palo Alto and technology campus districts.
- Top recommendation: Downtown Redwood City (Good fit)
- Secondary recommendation: Downtown Palo Alto
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Downtown Redwood City - Good fit: Good fit for office users that want a walkable Peninsula downtown with Caltrain access and a balanced regional position.

Why this differs:
- Matches expected directional nodes: downtown-redwood-city

Selection rationale:
- Downtown Redwood City is recommended first because it is a good fit for office users that want a walkable Peninsula downtown with Caltrain access and a balanced regional position. It aligns with the profile priorities around Peninsula midpoint, professional services, and Caltrain. The strongest supporting signals are walkable downtown, Caltrain access, and Peninsula midpoint.

Matched priorities:
- Peninsula midpoint
- professional services
- Caltrain
- walkability

Tradeoff summary:
- less venture-centered than Palo Alto

Alternative rationale:
- Downtown Palo Alto may be relevant as a comparison or contingency because Stronger executive and venture ecosystem.

Validation focus:
- Is a Peninsula midpoint more useful than Palo Alto prestige?
- Do employees need Caltrain access?
- Is walkability part of recruiting?
- Would a campus market fit better than downtown?

Strengths surfaced:
- walkable downtown
- Caltrain access
- Peninsula midpoint
- professional-service and technology context

Tradeoffs surfaced:
- less venture-centered than Palo Alto
- less large-campus identity than North Bayshore or Stanford Research Park

Questions to validate:
- Is a Peninsula midpoint more useful than Palo Alto prestige?
- Do employees need Caltrain access?
- Is walkability part of recruiting?
- Would a campus market fit better than downtown?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### North Bayshore AI Research Team

- Profile: 24,000 sqft R&D in North Bayshore
- Priorities: AI, research, large campus, Highway 101, engineering talent
- Expected direction: Favor North Bayshore for larger technology campus, AI, research, and engineering-team needs.
- Top recommendation: North Bayshore (Strong fit)
- Secondary recommendation: Moffett Park
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. North Bayshore - Strong fit: Strong fit for technology and research-oriented office users that value campus scale and Mountain View talent access.

Why this differs:
- Matches expected directional nodes: north-bayshore

Selection rationale:
- North Bayshore is recommended first because it is a strong fit for technology and research-oriented office users that value campus scale and Mountain View talent access. It aligns with the profile priorities around research, large campus, and Highway 101. The strongest supporting signals are major technology campus ecosystem, large floor plates, and Highway 101 access.

Matched priorities:
- research
- large campus
- Highway 101
- engineering talent

Tradeoff summary:
- less walkable urban environment

Alternative rationale:
- Moffett Park may be relevant as a comparison or contingency because Similar engineering/R&D business park context with a different Sunnyvale access pattern.

Validation focus:
- Do you need campus scale or smaller flexible office?
- Are Highway 101 commute patterns workable?
- Is Mountain View technology ecosystem central to recruiting?
- Would North San Jose or Moffett Park offer better flexibility?

Strengths surfaced:
- major technology campus ecosystem
- large floor plates
- Highway 101 access
- Mountain View innovation context

Tradeoffs surfaced:
- less walkable urban environment
- may be less natural for small client-facing professional firms

Questions to validate:
- Do you need campus scale or smaller flexible office?
- Are Highway 101 commute patterns workable?
- Is Mountain View technology ecosystem central to recruiting?
- Would North San Jose or Moffett Park offer better flexibility?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Moffett Park R&D Engineering User

- Profile: 16,000 sqft R&D in Moffett Park
- Priorities: engineering, R&D, campus-style buildings, parking, Highway 101
- Expected direction: Favor Moffett Park for R&D and engineering teams seeking practical campus-style Sunnyvale access.
- Top recommendation: Moffett Park (Good fit)
- Secondary recommendation: North Bayshore
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Moffett Park - Good fit: Good fit for engineering and R&D-oriented office users that want campus-style buildings and practical Highway 101 access.

Why this differs:
- Matches expected directional nodes: moffett-park

Selection rationale:
- Moffett Park is recommended first because it is a good fit for engineering and R&D-oriented office users that want campus-style buildings and practical Highway 101 access. It aligns with the profile priorities around engineering, R&D, and campus-style buildings. The strongest supporting signals are business park environment, engineering and R&D context, and Highway 101 access.

Matched priorities:
- engineering
- R&D
- campus-style buildings
- parking

Tradeoff summary:
- less walkable and mixed-use than downtown settings

Alternative rationale:
- North Bayshore may be relevant as a comparison or contingency because More prominent large technology campus ecosystem.

Validation focus:
- Do you need campus-style buildings and parking?
- Is Highway 101 access more important than walkability?
- Are R&D/flex functions part of the requirement?
- Would North Bayshore's ecosystem justify a higher-cost search?

Strengths surfaced:
- business park environment
- engineering and R&D context
- Highway 101 access
- larger campus-style buildings

Tradeoffs surfaced:
- less walkable and mixed-use than downtown settings
- less executive-facing than Palo Alto

Questions to validate:
- Do you need campus-style buildings and parking?
- Is Highway 101 access more important than walkability?
- Are R&D/flex functions part of the requirement?
- Would North Bayshore's ecosystem justify a higher-cost search?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

## Rofo Compass Coverage Preparation

Future Rofo Compass Coverage dashboards can track metro QA with these fields:

- qaStatus: pending | in_review | completed | needs_review
- lastQaDate
- scenarioCount
- scenariosPassing
- validationStatus
- reportPath

San Francisco pilot metadata is stored in `_data/recommendationQaStatus.js`.
