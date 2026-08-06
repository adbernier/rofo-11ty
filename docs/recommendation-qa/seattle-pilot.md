# Seattle Recommendation QA Pilot

Generated: 2026-08-06T17:25:21.969Z

This internal QA report validates whether Seattle Location Brief recommendations feel differentiated, explainable, defensible, and actionable using the current Commercial Location Knowledge Graph. It is not customer-facing content.

## Summary

- Scenarios reviewed: 9
- Scenarios passing baseline advisor-readiness checks: 9
- Scenarios needing review: 0
- Unique primary recommendations: 9
- Repeated primary recommendations: None

Baseline checks require a primary recommendation, at least one expected directional match, meaningful tradeoffs, validation questions, and complete explainability fields. A pass does not mean the recommendation is final; it means the brief is credible enough for advisor review.

## Recommendation Diversity Check

The Seattle pilot produces meaningfully different primary recommendations across the QA scenarios.

## Editorial Broker Review

Editorial findings:
- Seattle scenarios produce differentiated district-level recommendations across downtown office, historic executive office, creative waterfront office, Bellevue professional office, Eastside technology office, urban warehouse, contractor/service industrial, north Seattle flex, and Kent Valley distribution profiles.
- The current QA suite intentionally validates graph-backed district recommendations rather than broad city discovery because Seattle does not yet have a canonical city-level Compass starter node.
- Office and industrial/flex scenarios are explainable enough for a first Seattle Compass QA baseline: the recommendations surface tradeoffs, validation questions, and comparison alternatives rather than generic market-path copy.
- Medical, retail, handbook integration, and photography remain separate Publisher/EOS opportunities and were not treated as prerequisites for this bounded recommendation QA status update.

Calibration changes:
- Added a Seattle QA suite to the shared recommendation runner without changing recommendation scoring, resolver behavior, or graph rankings.
- Covered focused district scenarios for the Seattle nodes already present in the Commercial Location Knowledge Graph.
- Registered Seattle in the authoritative recommendation QA status data so Publisher can distinguish documented Compass QA from a missing QA record.

QA comparison before vs after:
- Before this QA update, Publisher reported Seattle recommendation readiness as missing authoritative QA status.
- After this QA update, Seattle has a generated QA report and 9 passing district-level scenarios.
- No recommendation resolver changes were made; scenario outputs document current graph behavior.

Remaining weaknesses:
- Seattle still needs a city-level Compass starter node before broad Seattle discovery scenarios can be treated as graph-backed instead of expert-guided.
- Medical ecosystem district coverage remains a Publisher/EOS knowledge gap.
- Building Brief depth, Field Mode photography, handbook integration, and comparison reciprocity remain separate improvement workstreams.

Compass readiness recommendation:
- Seattle is recommended as Compass Ready for focused V1 district-level Location Briefs across the currently modeled office and industrial/flex graph. Broad city-level Seattle discovery should remain a follow-on Compass enhancement because the city starter node is not yet present.

## Scenario Reviews

### Downtown Seattle Law Firm

- Profile: 6,000 sqft Office in Downtown Seattle Office Core
- Priorities: law firm, client meetings, central Seattle, transit, downtown business identity
- Expected direction: Treat Downtown Seattle Office Core as the focused starting point for legal, civic, transit-oriented, and client-facing office searches.
- Top recommendation: Downtown Seattle Office Core (Excellent fit)
- Secondary recommendation: Bellevue CBD Office
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Downtown Seattle Office Core - Excellent fit: Excellent fit for professional, legal, finance, consulting, executive, and regional office users that need central Seattle identity, client access, transit reach, and formal business services.

Why this differs:
- Matches expected directional nodes: downtown-seattle-office

Selection rationale:
- Downtown Seattle Office Core is recommended first because it is a excellent fit for professional, legal, finance, consulting, executive, and regional office users that need central Seattle identity, client access, transit reach, and formal business services. It aligns with the profile priorities around law firm, client meetings, and central Seattle. The strongest supporting signals are central Seattle business identity, transit and walkability, and client-facing image.

Matched priorities:
- law firm
- client meetings
- central Seattle
- transit

Tradeoff summary:
- parking, visitor access, commute patterns, and exact floorplate fit need building-level validation

Alternative rationale:
- Bellevue CBD Office may be relevant as a comparison or contingency because Eastside professional-office alternative with different client, employee, and parking geography.

Validation focus:
- Do clients, partners, or employees benefit from a central Seattle address?
- How important are transit and walkability compared with parking convenience?
- Does the team need a formal office image or a more flexible neighborhood setting?
- Would Bellevue, Belltown, or SODO better match the operating model?

Strengths surfaced:
- central Seattle business identity
- transit and walkability
- client-facing image
- professional-service ecosystem

Tradeoffs surfaced:
- parking, visitor access, commute patterns, and exact floorplate fit need building-level validation

Questions to validate:
- Do clients, partners, or employees benefit from a central Seattle address?
- How important are transit and walkability compared with parking convenience?
- Does the team need a formal office image or a more flexible neighborhood setting?
- Would Bellevue, Belltown, or SODO better match the operating model?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Pioneer Square Boutique Professional Office

- Profile: 4,500 sqft Office in Pioneer Square / Waterfront Office
- Priorities: boutique law firm, historic character, client meetings, waterfront, civic access
- Expected direction: Favor historic, client-facing central office context while preserving comparisons to modern downtown and creative waterfront alternatives.
- Top recommendation: Pioneer Square / Waterfront Office (Strong fit)
- Secondary recommendation: Downtown Seattle Office Core
- Confidence: Medium Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Pioneer Square / Waterfront Office - Strong fit: Strong fit for professional, executive, civic-adjacent, creative, and client-facing teams that want downtown access with more historic character than a conventional modern tower.

Why this differs:
- Matches expected directional nodes: pioneer-square-waterfront-office

Selection rationale:
- Pioneer Square / Waterfront Office is recommended first because it is a strong fit for professional, executive, civic-adjacent, creative, and client-facing teams that want downtown access with more historic character than a conventional modern tower. It aligns with the profile priorities around boutique law firm, historic character, and client meetings. The strongest supporting signals are historic office character, central Seattle access, and client-facing credibility.

Matched priorities:
- boutique law firm
- historic character
- client meetings
- waterfront

Tradeoff summary:
- visitor parking, event-area access, suite layout, and building systems need direct validation

Alternative rationale:
- Downtown Seattle Office Core may be relevant as a comparison or contingency because More conventional downtown tower-office alternative.

Validation focus:
- Does historic office character support the company's client-facing identity?
- Do visitors need easy parking or event-area access?
- Would a modern downtown tower or Bellevue CBD office better support the team?
- Are building systems and suite configuration sufficient for the work pattern?

Strengths surfaced:
- historic office character
- central Seattle access
- client-facing credibility
- waterfront and civic adjacency

Tradeoffs surfaced:
- visitor parking, event-area access, suite layout, and building systems need direct validation

Questions to validate:
- Does historic office character support the company's client-facing identity?
- Do visitors need easy parking or event-area access?
- Would a modern downtown tower or Bellevue CBD office better support the team?
- Are building systems and suite configuration sufficient for the work pattern?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Belltown Creative Team

- Profile: 7,500 sqft Office in Belltown / Waterfront Creative Office
- Priorities: creative agency, startup, waterfront, employee experience, walkability
- Expected direction: Treat Belltown and the waterfront as the creative office reference point rather than a formal tower-office recommendation.
- Top recommendation: Belltown / Waterfront Creative Office (Strong fit)
- Secondary recommendation: Downtown Seattle Office Core
- Confidence: Medium Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Belltown / Waterfront Creative Office - Strong fit: Strong fit for creative, startup, consulting, and flexible office users that value central Seattle access, waterfront character, employee experience, and a less formal office identity.

Why this differs:
- Matches expected directional nodes: belltown-waterfront-office

Selection rationale:
- Belltown / Waterfront Creative Office is recommended first because it is a strong fit for creative, startup, consulting, and flexible office users that value central Seattle access, waterfront character, employee experience, and a less formal office identity. It aligns with the profile priorities around creative agency, startup, and waterfront. The strongest supporting signals are creative waterfront office identity, central Seattle access, and walkability and amenities.

Matched priorities:
- creative agency
- startup
- waterfront
- employee experience

Tradeoff summary:
- parking, visitor access, and long-term suite control should be validated

Alternative rationale:
- Downtown Seattle Office Core may be relevant as a comparison or contingency because More formal central tower-office alternative.

Validation focus:
- Does creative workplace identity matter more than formal office image?
- Do employees benefit from central Seattle and waterfront access?
- Is parking or visitor arrival a major constraint?
- Would Downtown Seattle, Bellevue, or Ballard/Interbay provide a better operating model?

Strengths surfaced:
- creative waterfront office identity
- central Seattle access
- walkability and amenities
- employee-experience orientation

Tradeoffs surfaced:
- parking, visitor access, and long-term suite control should be validated

Questions to validate:
- Does creative workplace identity matter more than formal office image?
- Do employees benefit from central Seattle and waterfront access?
- Is parking or visitor arrival a major constraint?
- Would Downtown Seattle, Bellevue, or Ballard/Interbay provide a better operating model?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Bellevue Professional Services Office

- Profile: 8,000 sqft Office in Bellevue CBD Office
- Priorities: Eastside clients, professional services, Bellevue, parking important, executive image
- Expected direction: Keep Bellevue as the focused Eastside professional-office path with Downtown Seattle and Redmond/Kirkland as comparison context.
- Top recommendation: Bellevue CBD Office (Excellent fit)
- Secondary recommendation: Downtown Seattle Office Core
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Bellevue CBD Office - Excellent fit: Excellent fit for Eastside professional, corporate, consulting, finance, executive, and regional office users that need polished image, client access, and Bellevue employee geography.

Why this differs:
- Matches expected directional nodes: bellevue-cbd-office

Selection rationale:
- Bellevue CBD Office is recommended first because it is a excellent fit for Eastside professional, corporate, consulting, finance, executive, and regional office users that need polished image, client access, and Bellevue employee geography. It aligns with the profile priorities around Eastside clients, professional services, and Bellevue. The strongest supporting signals are Eastside business identity, client-facing image, and parking-oriented access.

Matched priorities:
- Eastside clients
- professional services
- Bellevue
- parking important

Tradeoff summary:
- less central for Seattle-focused customers and transit patterns than Downtown Seattle

Alternative rationale:
- Downtown Seattle Office Core may be relevant as a comparison or contingency because Central Seattle office alternative with stronger downtown transit and civic access.

Validation focus:
- Do clients, employees, or partners make Bellevue more useful than Downtown Seattle?
- How important are parking and Eastside access compared with central-city transit?
- Does polished professional image matter to the business model?
- Would Redmond/Kirkland or Downtown Seattle offer better workforce access?

Strengths surfaced:
- Eastside business identity
- client-facing image
- parking-oriented access
- Bellevue and Redmond workforce geography

Tradeoffs surfaced:
- less central for Seattle-focused customers and transit patterns than Downtown Seattle

Questions to validate:
- Do clients, employees, or partners make Bellevue more useful than Downtown Seattle?
- How important are parking and Eastside access compared with central-city transit?
- Does polished professional image matter to the business model?
- Would Redmond/Kirkland or Downtown Seattle offer better workforce access?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Eastside Technology Office

- Profile: 18,000 sqft Office in Eastside Tech Office Corridor
- Priorities: technology company, Redmond, Kirkland, product team, Eastside workforce, parking
- Expected direction: Favor the Eastside technology corridor for product, technology, and workforce-geography needs over central Seattle office alternatives.
- Top recommendation: Eastside Tech Office Corridor (Strong fit)
- Secondary recommendation: Bellevue CBD Office
- Confidence: Medium Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Eastside Tech Office Corridor - Strong fit: Strong fit for technology, product, administrative, consulting, and professional teams comparing Bellevue, Redmond, and Kirkland workforce geography with suburban office or campus-style environments.

Why this differs:
- Matches expected directional nodes: eastside-tech-office-corridor

Selection rationale:
- Eastside Tech Office Corridor is recommended first because it is a strong fit for technology, product, administrative, consulting, and professional teams comparing Bellevue, Redmond, and Kirkland workforce geography with suburban office or campus-style environments. It aligns with the profile priorities around technology company, Redmond, and Kirkland. The strongest supporting signals are Eastside technology corridor identity, parking-oriented access, and Bellevue, Redmond, and Kirkland workforce geography.

Matched priorities:
- technology company
- Redmond
- Kirkland
- product team

Tradeoff summary:
- less walkable and less central than Downtown Seattle or Bellevue CBD

Alternative rationale:
- Bellevue CBD Office may be relevant as a comparison or contingency because More polished Eastside CBD office alternative.

Validation focus:
- Is Eastside workforce geography more important than central Seattle access?
- Do product or technical teams need specialized infrastructure beyond ordinary office space?
- How important are parking, expansion, and campus adjacency?
- Would Bellevue CBD or Downtown Seattle better support client-facing needs?

Strengths surfaced:
- Eastside technology corridor identity
- parking-oriented access
- Bellevue, Redmond, and Kirkland workforce geography
- campus-adjacent office patterns

Tradeoffs surfaced:
- less walkable and less central than Downtown Seattle or Bellevue CBD

Questions to validate:
- Is Eastside workforce geography more important than central Seattle access?
- Do product or technical teams need specialized infrastructure beyond ordinary office space?
- How important are parking, expansion, and campus adjacency?
- Would Bellevue CBD or Downtown Seattle better support client-facing needs?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### SODO Urban Warehouse User

- Profile: 20,000 sqft Warehouse in SODO Industrial
- Priorities: warehouse, central Seattle, loading, port access, last mile, I-5
- Expected direction: Treat SODO as the urban warehouse and last-mile benchmark while comparing it against smaller south and north Seattle industrial alternatives.
- Top recommendation: SODO Industrial (Strong fit)
- Secondary recommendation: Georgetown Industrial
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. SODO Industrial - Strong fit: Strong fit for warehouse, inventory, service distribution, and storage users that need central Seattle reach rather than a suburban logistics park.

Why this differs:
- Matches expected directional nodes: sodo-industrial

Selection rationale:
- SODO Industrial is recommended first because it is a strong fit for warehouse, inventory, service distribution, and storage users that need central Seattle reach rather than a suburban logistics park. It aligns with the profile priorities around warehouse, central Seattle, and loading. The strongest supporting signals are central Seattle access, I-5 and SR-99 reach, and port and stadium-area adjacency.

Matched priorities:
- warehouse
- central Seattle
- loading
- port access

Tradeoff summary:
- clear height, truck access, and parking can vary substantially by property

Alternative rationale:
- Georgetown Industrial may be relevant as a comparison or contingency because More contractor, small-bay, and maker-oriented south Seattle industrial alternative.

Validation focus:
- Do you need central Seattle industrial access or broader regional logistics reach?
- What loading, truck circulation, parking, or delivery pattern is required?
- Is port or downtown customer proximity important?
- Would Georgetown or Ballard/Interbay better support smaller service or maker operations?

Strengths surfaced:
- central Seattle access
- I-5 and SR-99 reach
- port and stadium-area adjacency
- urban warehouse and service-industrial identity

Tradeoffs surfaced:
- clear height, truck access, and parking can vary substantially by property

Questions to validate:
- Do you need central Seattle industrial access or broader regional logistics reach?
- What loading, truck circulation, parking, or delivery pattern is required?
- Is port or downtown customer proximity important?
- Would Georgetown or Ballard/Interbay better support smaller service or maker operations?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Georgetown Contractor Service User

- Profile: 10,000 sqft Industrial in Georgetown Industrial
- Priorities: contractor, small bay, equipment storage, service dispatch, south Seattle, light manufacturing
- Expected direction: Favor Georgetown for contractor, service-industrial, small-bay, and maker-oriented operating needs.
- Top recommendation: Georgetown Industrial (Strong fit)
- Secondary recommendation: SODO Industrial
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Georgetown Industrial - Strong fit: Strong fit for contractor, service-industrial, small-bay, maker, and production-adjacent users that need a practical south Seattle industrial setting.

Why this differs:
- Matches expected directional nodes: georgetown-industrial

Selection rationale:
- Georgetown Industrial is recommended first because it is a strong fit for contractor, service-industrial, small-bay, maker, and production-adjacent users that need a practical south Seattle industrial setting. It aligns with the profile priorities around contractor, small bay, and equipment storage. The strongest supporting signals are south Seattle industrial identity, I-5 and airport/port reach, and small-bay and service-industrial utility.

Matched priorities:
- contractor
- small bay
- equipment storage
- service dispatch

Tradeoff summary:
- less suited to executive office image or broad retail foot traffic

Alternative rationale:
- SODO Industrial may be relevant as a comparison or contingency because More central Seattle warehouse, last-mile, and port-adjacent industrial alternative.

Validation focus:
- Is the business primarily dispatch, storage, production, or customer-facing?
- Do power, ventilation, or manufacturing approvals matter?
- What parking, vehicle storage, or loading configuration is required?
- Would SODO or Ballard/Interbay better match customer and employee geography?

Strengths surfaced:
- south Seattle industrial identity
- I-5 and airport/port reach
- small-bay and service-industrial utility
- maker and production-adjacent character

Tradeoffs surfaced:
- less suited to executive office image or broad retail foot traffic
- specific loading, parking, power, ventilation, and allowed uses need property-level review

Questions to validate:
- Is the business primarily dispatch, storage, production, or customer-facing?
- Do power, ventilation, or manufacturing approvals matter?
- What parking, vehicle storage, or loading configuration is required?
- Would SODO or Ballard/Interbay better match customer and employee geography?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Ballard / Interbay Flex Service User

- Profile: 6,500 sqft Flex in Ballard / Interbay Industrial
- Priorities: north Seattle, Ballard, office warehouse, creative production, service business, storage
- Expected direction: Favor Ballard / Interbay for north Seattle flex, maker, and service-industrial decisions before heavier SODO or Georgetown alternatives.
- Top recommendation: Ballard / Interbay Industrial (Strong fit)
- Secondary recommendation: SODO Industrial
- Confidence: Medium Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Ballard / Interbay Industrial - Strong fit: Strong fit for smaller office/warehouse, studio, maker, and technical service users that need a mix of workspace, storage, and customer or vendor access.

Why this differs:
- Matches expected directional nodes: ballard-interbay-industrial

Selection rationale:
- Ballard / Interbay Industrial is recommended first because it is a strong fit for smaller office/warehouse, studio, maker, and technical service users that need a mix of workspace, storage, and customer or vendor access. It aligns with the profile priorities around north Seattle, Ballard, and office warehouse. The strongest supporting signals are north Seattle customer geography, service-industrial and flex character, and marine and maker adjacency.

Matched priorities:
- north Seattle
- Ballard
- office warehouse
- creative production

Tradeoff summary:
- office-heavy users may prefer Fremont, South Lake Union, or Bellevue

Alternative rationale:
- SODO Industrial may be relevant as a comparison or contingency because More central warehouse, last-mile, and port-adjacent industrial alternative.

Validation focus:
- Is north Seattle customer geography more important than regional truck access?
- Do you need storage, dispatch, light production, or customer-facing flex?
- Can the site support loading, parking, vehicle movement, or yard needs?
- Would SODO or Georgetown better support heavier industrial requirements?

Strengths surfaced:
- north Seattle customer geography
- service-industrial and flex character
- marine and maker adjacency
- access to Ballard, Interbay, Fremont, Queen Anne, and Magnolia

Tradeoffs surfaced:
- office-heavy users may prefer Fremont, South Lake Union, or Bellevue

Questions to validate:
- Is north Seattle customer geography more important than regional truck access?
- Do you need storage, dispatch, light production, or customer-facing flex?
- Can the site support loading, parking, vehicle movement, or yard needs?
- Would SODO or Georgetown better support heavier industrial requirements?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Kent Valley Distribution User

- Profile: 40,000 sqft Distribution in Kent Valley
- Priorities: regional distribution, warehouse, truck access, south King County, airport access, shipping
- Expected direction: Favor Kent Valley for regional warehouse and distribution needs that exceed constrained central Seattle industrial formats.
- Top recommendation: Kent Valley (Strong fit)
- Secondary recommendation: SODO Industrial
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Kent Valley - Strong fit: Strong fit for companies comparing Seattle-area regional distribution, south metro customer access, and practical industrial building formats.

Why this differs:
- Matches expected directional nodes: kent-valley

Selection rationale:
- Kent Valley is recommended first because it is a strong fit for companies comparing Seattle-area regional distribution, south metro customer access, and practical industrial building formats. It aligns with the profile priorities around regional distribution, warehouse, and truck access. The strongest supporting signals are south King County industrial scale, regional freeway and airport/port reach, and warehouse and distribution utility.

Matched priorities:
- regional distribution
- warehouse
- truck access
- south King County

Tradeoff summary:
- last-mile users focused on central Seattle may prefer SODO despite tighter sites

Alternative rationale:
- SODO Industrial may be relevant as a comparison or contingency because More central Seattle industrial and last-mile alternative.

Validation focus:
- Is south King County regional access stronger than central Seattle proximity?
- What loading, truck circulation, clear height, or parking is required?
- Do customers, employees, or suppliers require a Seattle city location?
- Would SODO or Georgetown better support last-mile or service-territory needs?

Strengths surfaced:
- south King County industrial scale
- regional freeway and airport/port reach
- warehouse and distribution utility
- parking and expansion potential

Tradeoffs surfaced:
- last-mile users focused on central Seattle may prefer SODO despite tighter sites

Questions to validate:
- Is south King County regional access stronger than central Seattle proximity?
- What loading, truck circulation, clear height, or parking is required?
- Do customers, employees, or suppliers require a Seattle city location?
- Would SODO or Georgetown better support last-mile or service-territory needs?

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

Seattle pilot metadata is stored in `_data/recommendationQaStatus.js`.
