# Denver Recommendation QA Pilot

Generated: 2026-08-06T17:25:21.967Z

This internal QA report validates whether Denver Location Brief recommendations feel differentiated, explainable, defensible, and actionable using the current Commercial Location Knowledge Graph. It is not customer-facing content.

## Summary

- Scenarios reviewed: 12
- Scenarios passing baseline advisor-readiness checks: 12
- Scenarios needing review: 0
- Unique primary recommendations: 12
- Repeated primary recommendations: None

Baseline checks require a primary recommendation, at least one expected directional match, meaningful tradeoffs, validation questions, and complete explainability fields. A pass does not mean the recommendation is final; it means the brief is credible enough for advisor review.

## Recommendation Diversity Check

The Denver pilot produces meaningfully different primary recommendations across the QA scenarios.

## Editorial Broker Review

Editorial findings:
- Denver scenarios produce differentiated primary recommendations across central office, creative/startup, client-facing executive office, southeast suburban office, Boulder/US-36 technology, northeast industrial, airport logistics, medical, west metro, and Boulder-adjacent flex/R&D profiles.
- The first Denver graph intentionally models the metro as several distinct commercial decision systems: central Denver, southeast office, Boulder/US-36 technology, east/northeast industrial, west metro local-service, and south metro medical/professional.
- Representative buildings are attached only where existing Rofo building paths support them. They illustrate district character and do not imply active availability.
- Second-pass geographies such as Glendale, Arvada, Thornton, Northglenn, Longmont, Baker, Five Points, and Santa Fe Arts District were not promoted because the first Compass seed favors recommendation value over page count.

Calibration changes:
- Added a city-level Denver market path so broad metro searches can route into office, medical, flex/R&D, industrial, warehouse, and distribution-specific district choices.
- Separated Downtown Denver, LoDo, RiNo, and Cherry Creek so central-office recommendations can distinguish formal civic/legal office, downtown-edge creative office, adaptive creative/showroom uses, and polished client-facing office.
- Separated DTC, Inverness, Centennial, and Lone Tree so southeast searches can distinguish corporate office scale, campus-style business parks, practical office/flex/medical, and south I-25 patient/customer geography.
- Separated Boulder, Broomfield, Interlocken, and Louisville/Superior so technology and R&D users can compare Boulder identity against practical US-36 business-park alternatives.
- Separated Northeast Denver Industrial, Denver Airport/Pena corridor, Commerce City, and Aurora so warehouse, distribution, last-mile, service-industrial, and east metro medical/office scenarios do not collapse into a single industrial answer.

QA comparison before vs after:
- Before Q1, Denver had public page coverage and building examples but no Compass Knowledge Graph nodes.
- After Q1, Denver has 21 graph-backed nodes, city-level market paths, comparison relationships, representative buildings from existing Rofo paths, and 12 QA scenarios.
- Recommendation diversity now spans central office, creative office, executive client-facing office, southeast suburban office, Boulder/US-36 technology, industrial/logistics, medical, west metro, and flex/R&D paths.

Remaining weaknesses:
- Broker review should continue validating Denver-specific nuance, especially Aurora medical, Denver Airport/Pena logistics, Boulder versus US-36 technology alternatives, and south metro medical/professional distinctions.
- Representative-building coverage should deepen using existing reliable Rofo building paths, especially for Central Park, Commerce City, Westminster, Golden, and Louisville/Superior.
- Second-pass Knowledge Cards should be added only when real Location Brief demand exposes gaps, not simply because public pages exist.

Compass readiness recommendation:
- Denver is recommended as Compass Ready for V1 Location Briefs after Q1. The graph supports differentiated, explainable, graph-backed recommendations across realistic business profiles. Editorial maturity and representative-building depth should continue improving as separate enhancement workstreams.

## Scenario Reviews

### Downtown Denver Law Firm

- Profile: 5,000 sqft Office in Denver
- Priorities: law firm, client meetings, civic access, transit, downtown business identity
- Expected direction: Favor central Denver office districts with legal, civic, client-facing, and transit advantages.
- Top recommendation: Downtown Denver (Excellent fit)
- Secondary recommendation: Cherry Creek
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Downtown Denver - Excellent fit: Excellent fit for legal, finance, consulting, civic, nonprofit, and client-facing office users that need Denver's central business identity.
- 2. Cherry Creek - Excellent fit: Excellent fit for boutique professional services, wealth management, legal, finance, design, and client-facing firms that value polished district identity and retail adjacency.
- 3. LoDo - Strong fit: Strong fit for professional-service, technology, hospitality-adjacent, and client-facing office users that want historic downtown-edge character near transit and amenities.

Why this differs:
- Matches expected directional nodes: downtown-denver, lodo, cherry-creek

Selection rationale:
- Downtown Denver is recommended first because it is a excellent fit for legal, finance, consulting, civic, nonprofit, and client-facing office users that need Denver's central business identity. It aligns with the profile priorities around law firm, client meetings, and civic access. The strongest supporting signals are central business identity, civic and legal access, and downtown office inventory.

Matched priorities:
- law firm
- client meetings
- civic access
- transit

Tradeoff summary:
- parking-sensitive teams may prefer DTC, Cherry Creek, or suburban alternatives

Alternative rationale:
- Cherry Creek remains relevant because it is a excellent fit for boutique professional services, wealth management, legal, finance, design, and client-facing firms that value polished district identity and retail adjacency. Downtown Denver appears to fit the initial profile more directly, while Cherry Creek is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do clients, courts, civic partners, or downtown institutions need easy access?
- Is central Denver image more important than parking convenience?
- Will employees rely on transit, parking, or regional freeway access?
- Would DTC, LoDo, Cherry Creek, or RiNo better support culture and commute patterns?

Strengths surfaced:
- central business identity
- civic and legal access
- downtown office inventory
- transit and amenity access
- polished client-facing identity
- retail and hospitality adjacency

Tradeoffs surfaced:
- parking-sensitive teams may prefer DTC, Cherry Creek, or suburban alternatives
- creative office users may prefer RiNo or LoDo
- less transit-oriented and less suited to broad administrative floorplate searches than Downtown Denver or DTC
- cost-sensitive administrative users may prefer suburban nodes
- may offer less conventional office depth than Downtown Denver
- creative/adaptive users should compare RiNo

Questions to validate:
- Do clients, courts, civic partners, or downtown institutions need easy access?
- Is central Denver image more important than parking convenience?
- Will employees rely on transit, parking, or regional freeway access?
- Would DTC, LoDo, Cherry Creek, or RiNo better support culture and commute patterns?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### RiNo Creative Startup

- Profile: 8,000 sqft Office in Denver
- Priorities: startup, creative environment, restaurants, recruiting, adaptive office
- Expected direction: Favor creative urban districts before formal CBD or suburban corporate alternatives.
- Top recommendation: RiNo (Strong fit)
- Secondary recommendation: Downtown Denver
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. RiNo - Strong fit: Strong fit for creative office, startup, design, food/beverage-adjacent, and adaptive commercial users that want a mixed urban Denver environment.
- 2. Downtown Denver - Excellent fit: Excellent fit for legal, finance, consulting, civic, nonprofit, and client-facing office users that need Denver's central business identity.
- 3. Cherry Creek - Excellent fit: Excellent fit for boutique professional services, wealth management, legal, finance, design, and client-facing firms that value polished district identity and retail adjacency.

Why this differs:
- Matches expected directional nodes: rino

Selection rationale:
- RiNo is recommended first because it is a strong fit for creative office, startup, design, food/beverage-adjacent, and adaptive commercial users that want a mixed urban Denver environment. It aligns with the profile priorities around startup, creative environment, and restaurants. The strongest supporting signals are creative district identity, adaptive commercial buildings, and restaurant and amenity energy.

Matched priorities:
- startup
- creative environment
- restaurants
- recruiting

Tradeoff summary:
- less formal than Downtown Denver

Alternative rationale:
- Downtown Denver remains relevant because it is a excellent fit for legal, finance, consulting, civic, nonprofit, and client-facing office users that need Denver's central business identity. RiNo appears to fit the initial profile more directly, while Downtown Denver is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Does creative district identity improve recruiting, customers, or brand perception?
- Do you need showroom/flex functionality or conventional office?
- How much parking, loading, or customer access is required?
- Would LoDo, Downtown Denver, or Northeast Denver Industrial better fit the business model?

Strengths surfaced:
- creative district identity
- adaptive commercial buildings
- restaurant and amenity energy
- downtown and I-70 adjacency
- central business identity
- civic and legal access

Tradeoffs surfaced:
- less formal than Downtown Denver
- less corporate and parking-oriented than DTC
- parking-sensitive teams may prefer DTC, Cherry Creek, or suburban alternatives
- creative office users may prefer RiNo or LoDo
- less transit-oriented and less suited to broad administrative floorplate searches than Downtown Denver or DTC
- cost-sensitive administrative users may prefer suburban nodes

Questions to validate:
- Does creative district identity improve recruiting, customers, or brand perception?
- Do you need showroom/flex functionality or conventional office?
- How much parking, loading, or customer access is required?
- Would LoDo, Downtown Denver, or Northeast Denver Industrial better fit the business model?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Cherry Creek Wealth Management

- Profile: 4,000 sqft Office in Denver
- Priorities: wealth management, executive image, client meetings, retail adjacency, polished district
- Expected direction: Favor polished client-facing office districts before back-office or creative alternatives.
- Top recommendation: Cherry Creek (Excellent fit)
- Secondary recommendation: Lone Tree
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Cherry Creek - Excellent fit: Excellent fit for boutique professional services, wealth management, legal, finance, design, and client-facing firms that value polished district identity and retail adjacency.
- 2. Lone Tree - Strong fit: Strong fit for south I-25 professional services, medical, executive, and customer-facing office users that value parking, retail adjacency, and south metro access.
- 3. Downtown Denver - Excellent fit: Excellent fit for legal, finance, consulting, civic, nonprofit, and client-facing office users that need Denver's central business identity.

Why this differs:
- Matches expected directional nodes: cherry-creek, downtown-denver

Selection rationale:
- Cherry Creek is recommended first because it is a excellent fit for boutique professional services, wealth management, legal, finance, design, and client-facing firms that value polished district identity and retail adjacency. It aligns with the profile priorities around wealth management, executive image, and client meetings. The strongest supporting signals are polished client-facing identity, retail and hospitality adjacency, and walkability and amenities.

Matched priorities:
- wealth management
- executive image
- client meetings
- retail adjacency

Tradeoff summary:
- less transit-oriented and less suited to broad administrative floorplate searches than Downtown Denver or DTC

Alternative rationale:
- Lone Tree remains relevant because it is a strong fit for south I-25 professional services, medical, executive, and customer-facing office users that value parking, retail adjacency, and south metro access. Cherry Creek appears to fit the initial profile more directly, while Lone Tree is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do clients or patients value a polished central Denver district?
- Is retail adjacency part of the business model?
- Is executive image more important than cost or parking?
- Would Downtown Denver or DTC better support scale, transit, or commute patterns?

Strengths surfaced:
- polished client-facing identity
- retail and hospitality adjacency
- walkability and amenities
- affluent customer geography
- south I-25 access
- medical and retail-adjacent customer geography

Tradeoffs surfaced:
- less transit-oriented and less suited to broad administrative floorplate searches than Downtown Denver or DTC
- cost-sensitive administrative users may prefer suburban nodes
- less central than DTC or Downtown Denver
- less deep office inventory than DTC
- parking-sensitive teams may prefer DTC, Cherry Creek, or suburban alternatives
- creative office users may prefer RiNo or LoDo

Questions to validate:
- Do clients or patients value a polished central Denver district?
- Is retail adjacency part of the business model?
- Is executive image more important than cost or parking?
- Would Downtown Denver or DTC better support scale, transit, or commute patterns?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### DTC Cost-Conscious Back Office

- Profile: 15,000 sqft Office in Denver
- Priorities: back office, employees drive, parking important, larger floor plates, cost sensitive, southeast access
- Expected direction: Favor southeast suburban office districts with parking and larger practical office formats.
- Top recommendation: Denver Tech Center (Strong fit)
- Secondary recommendation: Centennial
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Denver Tech Center - Strong fit: Strong fit for corporate office, regional headquarters, professional services, back-office, and southeast metro users that need parking, I-25 access, larger floor plates, and suburban office scale.
- 2. Centennial - Strong fit: Strong fit for south metro professional services, medical, administrative, office/flex, and customer-facing users needing parking and southeast access.
- 3. Inverness - Strong fit: Strong fit for campus-style southeast office, professional-service, technology, and headquarters users that value parking, business-park setting, and DTC adjacency.

Why this differs:
- Matches expected directional nodes: denver-tech-center, inverness, centennial

Selection rationale:
- Denver Tech Center is recommended first because it is a strong fit for corporate office, regional headquarters, professional services, back-office, and southeast metro users that need parking, I-25 access, larger floor plates, and suburban office scale. It aligns with the profile priorities around back office, employees drive, and parking important. The strongest supporting signals are I-25 southeast corridor access, corporate office depth, and parking and suburban office scale.

Matched priorities:
- back office
- employees drive
- parking important
- larger floor plates

Tradeoff summary:
- less urban and walkable than Downtown Denver or LoDo

Alternative rationale:
- Centennial remains relevant because it is a strong fit for south metro professional services, medical, administrative, office/flex, and customer-facing users needing parking and southeast access. Denver Tech Center appears to fit the initial profile more directly, while Centennial is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is southeast metro access more important than downtown identity?
- How important are parking, highway access, and larger floor plates?
- Do clients expect a central Denver, Cherry Creek, or suburban office address?
- Would Inverness, Centennial, or Lone Tree better fit south metro geography?

Strengths surfaced:
- I-25 southeast corridor access
- corporate office depth
- parking and suburban office scale
- business-park environment
- south metro customer geography
- parking

Tradeoffs surfaced:
- less urban and walkable than Downtown Denver or LoDo
- client-facing boutique firms may prefer Cherry Creek
- US-36 technology users should compare Broomfield, Interlocken, Boulder, and Louisville/Superior
- less established corporate identity than DTC
- less executive/client-facing than Cherry Creek
- less recognized as a market identity than DTC

Questions to validate:
- Is southeast metro access more important than downtown identity?
- How important are parking, highway access, and larger floor plates?
- Do clients expect a central Denver, Cherry Creek, or suburban office address?
- Would Inverness, Centennial, or Lone Tree better fit south metro geography?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Boulder Research Startup

- Profile: 10,000 sqft R&D in Denver
- Priorities: research, university adjacency, technical talent, engineering, Boulder identity
- Expected direction: Favor Boulder and nearby US-36 research/R&D alternatives over central office districts.
- Top recommendation: Boulder (Strong fit)
- Secondary recommendation: Interlocken
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Boulder - Strong fit: Strong fit for technology, research, startup, professional-service, life-science-adjacent, and university-adjacent users that value Boulder identity and talent access.
- 2. Interlocken - Strong fit: Strong fit for concentrated US-36 business-park office, corporate campus, technology, aerospace-adjacent, and regional headquarters users.
- 3. Broomfield - Strong fit: Strong fit for US-36 corridor office, technology company, aerospace, telecom, professional-service, corporate office, and regional employee users needing practical Denver-Boulder corridor access between Denver and Boulder.

Why this differs:
- Matches expected directional nodes: boulder, broomfield, interlocken

Selection rationale:
- Boulder is recommended first because it is a strong fit for technology, research, startup, professional-service, life-science-adjacent, and university-adjacent users that value Boulder identity and talent access. It aligns with the profile priorities around research, university adjacency, and technical talent. The strongest supporting signals are Boulder identity, technology and research talent, and university adjacency.

Matched priorities:
- research
- university adjacency
- technical talent
- engineering

Tradeoff summary:
- less central to the Denver metro than Downtown Denver

Alternative rationale:
- Interlocken remains relevant because it is a strong fit for concentrated US-36 business-park office, corporate campus, technology, aerospace-adjacent, and regional headquarters users. Boulder appears to fit the initial profile more directly, while Interlocken is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is Boulder talent, research, or customer geography essential?
- Do you need Boulder identity or practical Denver-Boulder corridor access?
- Are cost and availability acceptable compared with Broomfield or Louisville/Superior?
- Would Downtown Denver or DTC better support client access?

Strengths surfaced:
- Boulder identity
- technology and research talent
- university adjacency
- walkability and amenities
- Interlocken business-park concentration
- US-36 access

Tradeoffs surfaced:
- less central to the Denver metro than Downtown Denver
- cost and availability can push users toward Broomfield, Louisville/Superior, or Interlocken
- less urban and local-service oriented than Westminster
- less Boulder identity than Boulder
- less Boulder identity than Boulder itself
- less central metro identity than Downtown Denver or DTC

Questions to validate:
- Is Boulder talent, research, or customer geography essential?
- Do you need Boulder identity or practical Denver-Boulder corridor access?
- Are cost and availability acceptable compared with Broomfield or Louisville/Superior?
- Would Downtown Denver or DTC better support client access?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### US-36 Technology Corridor Office

- Profile: 20,000 sqft Office in Denver
- Priorities: technology company, Denver Boulder corridor, parking, corporate office, regional employees
- Expected direction: Favor Denver-Boulder corridor office and business-park nodes.
- Top recommendation: Broomfield (Strong fit)
- Secondary recommendation: Interlocken
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Broomfield - Strong fit: Strong fit for US-36 corridor office, technology company, aerospace, telecom, professional-service, corporate office, and regional employee users needing practical Denver-Boulder corridor access between Denver and Boulder.
- 2. Interlocken - Strong fit: Strong fit for concentrated US-36 business-park office, corporate campus, technology, aerospace-adjacent, and regional headquarters users.
- 3. Denver Tech Center - Strong fit: Strong fit for corporate office, regional headquarters, professional services, back-office, and southeast metro users that need parking, I-25 access, larger floor plates, and suburban office scale.

Why this differs:
- Matches expected directional nodes: broomfield, interlocken

Selection rationale:
- Broomfield is recommended first because it is a strong fit for US-36 corridor office, technology company, aerospace, telecom, professional-service, corporate office, and regional employee users needing practical Denver-Boulder corridor access between Denver and Boulder. It aligns with the profile priorities around technology company, Denver Boulder corridor, and parking. The strongest supporting signals are Denver-Boulder corridor access, technology and corporate office context, and parking.

Matched priorities:
- technology company
- Denver Boulder corridor
- parking
- corporate office

Tradeoff summary:
- less Boulder identity than Boulder itself

Alternative rationale:
- Interlocken remains relevant because it is a strong fit for concentrated US-36 business-park office, corporate campus, technology, aerospace-adjacent, and regional headquarters users. Broomfield appears to fit the initial profile more directly, while Interlocken is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is the Denver-Boulder corridor more important than Boulder identity?
- Do you need parking, suburban office scale, or campus-style environment?
- Should the search favor Interlocken specifically or broader Broomfield?
- Would Westminster, Boulder, or Louisville/Superior better fit employee geography?

Strengths surfaced:
- Denver-Boulder corridor access
- technology and corporate office context
- parking
- regional suburban office scale
- Interlocken business-park concentration
- US-36 access

Tradeoffs surfaced:
- less Boulder identity than Boulder itself
- less central metro identity than Downtown Denver or DTC
- less urban and local-service oriented than Westminster
- less Boulder identity than Boulder
- less urban and walkable than Downtown Denver or LoDo
- client-facing boutique firms may prefer Cherry Creek

Questions to validate:
- Is the Denver-Boulder corridor more important than Boulder identity?
- Do you need parking, suburban office scale, or campus-style environment?
- Should the search favor Interlocken specifically or broader Broomfield?
- Would Westminster, Boulder, or Louisville/Superior better fit employee geography?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Northeast Denver Warehouse

- Profile: 30,000 sqft Warehouse in Denver
- Priorities: warehouse, I-70 access, truck access, loading, airport access, service distribution
- Expected direction: Favor northeast and airport-oriented industrial corridors before office-heavy alternatives.
- Top recommendation: Northeast Denver Industrial (Strong fit)
- Secondary recommendation: Commerce City
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Northeast Denver Industrial - Strong fit: Strong warehouse fit for last-mile, regional distribution, service distribution, truck access, loading, and service operations comparing Denver-side I-70 and airport access.
- 2. Commerce City - Strong fit: Strong warehouse fit for users needing north/east Denver logistics, service distribution, truck access, loading, and highway access.
- 3. Denver Airport / Pena Boulevard Corridor - Strong fit: Strong warehouse fit for users tied to airport, east metro, truck circulation, last-mile, or regional distribution flows.

Why this differs:
- Matches expected directional nodes: northeast-denver-industrial, denver-airport-pena-boulevard-corridor, commerce-city

Selection rationale:
- Northeast Denver Industrial is recommended first because strong warehouse fit for last-mile, regional distribution, service distribution, truck access, loading, and service operations comparing Denver-side I-70 and airport access. It aligns with the profile priorities around warehouse, I-70 access, and truck access. The strongest supporting signals are I-70 and airport access, Denver-side industrial utility, and warehouse and service-industrial formats.

Matched priorities:
- warehouse
- I-70 access
- truck access
- loading

Tradeoff summary:
- clear height, trailer parking, and yard vary by property

Alternative rationale:
- Commerce City remains relevant because strong warehouse fit for users needing north/east Denver logistics, service distribution, truck access, loading, and highway access. Northeast Denver Industrial appears to fit the initial profile more directly, while Commerce City is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do you need I-70, airport, or central Denver industrial access?
- What loading, truck circulation, yard, or trailer parking is required?
- Is last-mile access more important than customer-facing image?
- Would Commerce City, Aurora, or the airport corridor better fit operations?

Strengths surfaced:
- I-70 and airport access
- Denver-side industrial utility
- warehouse and service-industrial formats
- regional labor and last-mile access
- north/east industrial utility
- highway access

Tradeoffs surfaced:
- clear height, trailer parking, and yard vary by property
- modern clear height and trailer parking vary by property
- clear height, loading, and trailer parking vary by property

Questions to validate:
- Do you need I-70, airport, or central Denver industrial access?
- What loading, truck circulation, yard, or trailer parking is required?
- Is last-mile access more important than customer-facing image?
- Would Commerce City, Aurora, or the airport corridor better fit operations?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Airport Logistics User

- Profile: 50,000 sqft Distribution in Denver
- Priorities: logistics, airport, Pena Boulevard, truck circulation, last mile, distribution
- Expected direction: Favor airport and east/northeast logistics districts with truck and distribution context.
- Top recommendation: Denver Airport / Pena Boulevard Corridor (Strong fit)
- Secondary recommendation: Northeast Denver Industrial
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Denver Airport / Pena Boulevard Corridor - Strong fit: Strong distribution fit for logistics users that need airport, Pena Boulevard, last-mile, truck circulation, and east metro access.
- 2. Northeast Denver Industrial - Strong fit: Strong distribution fit for Denver-side I-70, airport-access, last-mile, truck-access, loading, and service distribution users.
- 3. Commerce City - Good fit: Good distribution fit for north/east metro service distribution and highway-access logistics users.

Why this differs:
- Matches expected directional nodes: denver-airport-pena-boulevard-corridor, northeast-denver-industrial, commerce-city

Selection rationale:
- Denver Airport / Pena Boulevard Corridor is recommended first because strong distribution fit for logistics users that need airport, Pena Boulevard, last-mile, truck circulation, and east metro access. It aligns with the profile priorities around logistics, airport, and Pena Boulevard. The strongest supporting signals are DIA/Pena Boulevard access, airport-support business geography, and regional east metro reach.

Matched priorities:
- logistics
- airport
- Pena Boulevard
- truck circulation

Tradeoff summary:
- large-format and yard needs require site-specific validation

Alternative rationale:
- Northeast Denver Industrial remains relevant because strong distribution fit for Denver-side I-70, airport-access, last-mile, truck-access, loading, and service distribution users. Denver Airport / Pena Boulevard Corridor appears to fit the initial profile more directly, while Northeast Denver Industrial is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is airport access a core operational requirement?
- Do you need warehouse, aviation support, or service-industrial functionality?
- How important are loading, trailer parking, and truck circulation?
- Would Northeast Denver Industrial or Aurora be more practical for employees and customers?

Strengths surfaced:
- DIA/Pena Boulevard access
- airport-support business geography
- regional east metro reach
- industrial and service utility
- I-70 and airport access
- Denver-side industrial utility

Tradeoffs surfaced:
- large-format and yard needs require site-specific validation
- clear height, trailer parking, and yard vary by property
- airport-specific users should compare the Pena Boulevard corridor

Questions to validate:
- Is airport access a core operational requirement?
- Do you need warehouse, aviation support, or service-industrial functionality?
- How important are loading, trailer parking, and truck circulation?
- Would Northeast Denver Industrial or Aurora be more practical for employees and customers?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Aurora Medical Office

- Profile: 7,500 sqft Medical in Denver
- Priorities: medical office, patient visits, east metro, parking important, hospital referral geography
- Expected direction: Favor east metro and parking-friendly medical nodes before downtown office options.
- Top recommendation: Aurora (Strong fit)
- Secondary recommendation: Lone Tree
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Aurora - Strong fit: Strong fit for medical, specialty, wellness, and patient-facing users serving east metro patient geographies.
- 2. Lone Tree - Excellent fit: Excellent fit for patient-facing medical and specialty practices serving south metro patients, I-25 access needs, and retail-adjacent patient geography.
- 3. Denver Tech Center - Good fit: Good fit for medical and specialty office users serving southeast metro patient geographies with parking and freeway access.

Why this differs:
- Matches expected directional nodes: aurora

Selection rationale:
- Aurora is recommended first because it is a strong fit for medical, specialty, wellness, and patient-facing users serving east metro patient geographies. It aligns with the profile priorities around medical office, patient visits, and east metro. The strongest supporting signals are east metro customer and patient geography, parking, and medical and service fit.

Matched priorities:
- medical office
- patient visits
- east metro
- parking important

Tradeoff summary:
- patient geography and hospital/referral adjacency should be validated

Alternative rationale:
- Lone Tree remains relevant because it is a excellent fit for patient-facing medical and specialty practices serving south metro patients, I-25 access needs, and retail-adjacent patient geography. Aurora appears to fit the initial profile more directly, while Lone Tree is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Are patients, customers, or employees concentrated in the east metro?
- Is medical, service-commercial, office/flex, or industrial functionality required?
- How important are parking and local access?
- Would Central Park, DTC, Commerce City, or the airport corridor better fit the search?

Strengths surfaced:
- east metro customer and patient geography
- parking
- medical and service fit
- aerospace and airport-adjacent context
- south I-25 access
- medical and retail-adjacent customer geography

Tradeoffs surfaced:
- patient geography and hospital/referral adjacency should be validated
- patient geography and referral adjacency should be validated
- patient geography should be compared with Centennial, Aurora, or Cherry Creek

Questions to validate:
- Are patients, customers, or employees concentrated in the east metro?
- Is medical, service-commercial, office/flex, or industrial functionality required?
- How important are parking and local access?
- Would Central Park, DTC, Commerce City, or the airport corridor better fit the search?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### South Metro Medical and Professional Office

- Profile: 6,500 sqft Medical in Denver
- Priorities: south metro patients, medical office, parking, I-25 access, retail adjacency
- Expected direction: Favor south metro patient-facing and professional office districts.
- Top recommendation: Lone Tree (Excellent fit)
- Secondary recommendation: Centennial
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Lone Tree - Excellent fit: Excellent fit for patient-facing medical and specialty practices serving south metro patients, I-25 access needs, and retail-adjacent patient geography.
- 2. Centennial - Strong fit: Strong fit for medical and wellness users serving south metro patients and patient geographies with parking-oriented access.
- 3. Denver Tech Center - Good fit: Good fit for medical and specialty office users serving southeast metro patient geographies with parking and freeway access.

Why this differs:
- Matches expected directional nodes: lone-tree, centennial, denver-tech-center

Selection rationale:
- Lone Tree is recommended first because it is a excellent fit for patient-facing medical and specialty practices serving south metro patients, I-25 access needs, and retail-adjacent patient geography. It aligns with the profile priorities around south metro patients, medical office, and parking. The strongest supporting signals are south I-25 access, medical and retail-adjacent customer geography, and parking.

Matched priorities:
- south metro patients
- medical office
- parking
- I-25 access

Tradeoff summary:
- patient geography and referral adjacency should be validated

Alternative rationale:
- Centennial remains relevant because it is a strong fit for medical and wellness users serving south metro patients and patient geographies with parking-oriented access. Lone Tree appears to fit the initial profile more directly, while Centennial is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Are customers or patients concentrated in the south metro?
- Does retail adjacency or executive suburban image matter?
- Would DTC or Centennial provide better office depth or access?
- Is parking a primary requirement?

Strengths surfaced:
- south I-25 access
- medical and retail-adjacent customer geography
- parking
- executive suburban office fit
- south metro customer geography
- freeway access

Tradeoffs surfaced:
- patient geography and referral adjacency should be validated
- larger regional medical searches should compare Aurora, DTC, and Lone Tree
- patient geography should be compared with Centennial, Aurora, or Cherry Creek

Questions to validate:
- Are customers or patients concentrated in the south metro?
- Does retail adjacency or executive suburban image matter?
- Would DTC or Centennial provide better office depth or access?
- Is parking a primary requirement?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### West Metro Professional Services

- Profile: 5,500 sqft Office in Denver
- Priorities: west metro, professional services, customer access, parking, practical cost
- Expected direction: Favor west metro professional-service nodes over downtown, southeast, or Boulder alternatives.
- Top recommendation: Lakewood (Good fit)
- Secondary recommendation: Downtown Denver
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Lakewood - Good fit: Good fit for west metro office, professional-service, medical, administrative, and local customer-facing users that value parking and practical access.
- 2. Downtown Denver - Excellent fit: Excellent fit for legal, finance, consulting, civic, nonprofit, and client-facing office users that need Denver's central business identity.
- 3. Centennial - Strong fit: Strong fit for south metro professional services, medical, administrative, office/flex, and customer-facing users needing parking and southeast access.

Why this differs:
- Matches expected directional nodes: lakewood

Selection rationale:
- Lakewood is recommended first because it is a good fit for west metro office, professional-service, medical, administrative, and local customer-facing users that value parking and practical access. It aligns with the profile priorities around west metro, professional services, and customer access. The strongest supporting signals are west metro customer geography, parking, and practical office and medical fit.

Matched priorities:
- west metro
- professional services
- customer access
- parking

Tradeoff summary:
- less central image than Downtown Denver

Alternative rationale:
- Downtown Denver remains relevant because it is a excellent fit for legal, finance, consulting, civic, nonprofit, and client-facing office users that need Denver's central business identity. Lakewood appears to fit the initial profile more directly, while Downtown Denver is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Are customers, patients, or employees concentrated west of Denver?
- Is parking and practical access more important than downtown identity?
- Do you need medical, office, retail/service, or flex functionality?
- Would Golden, Westminster, or Downtown Denver better fit image and geography?

Strengths surfaced:
- west metro customer geography
- parking
- practical office and medical fit
- access to Denver and foothills communities
- central business identity
- civic and legal access

Tradeoffs surfaced:
- less central image than Downtown Denver
- less corporate scale than DTC
- parking-sensitive teams may prefer DTC, Cherry Creek, or suburban alternatives
- creative office users may prefer RiNo or LoDo
- less established corporate identity than DTC
- less executive/client-facing than Cherry Creek

Questions to validate:
- Are customers, patients, or employees concentrated west of Denver?
- Is parking and practical access more important than downtown identity?
- Do you need medical, office, retail/service, or flex functionality?
- Would Golden, Westminster, or Downtown Denver better fit image and geography?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Louisville / Superior Flex R&D Support

- Profile: 12,000 sqft Flex in Denver
- Priorities: flex, R&D support, technical service, Boulder proximity, parking, light production
- Expected direction: Favor Boulder-adjacent office/flex and R&D support markets before conventional office or warehouse districts.
- Top recommendation: Louisville / Superior (Strong fit)
- Secondary recommendation: Denver Tech Center
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Louisville / Superior - Strong fit: Strong fit for office/flex, R&D support, light production, and technical service users needing Boulder-adjacent business-park functionality.
- 2. Denver Tech Center - Good fit: Good selective fit for office-heavy flex, technology support, and operations-adjacent users that need southeast access.
- 3. Inverness - Good fit: Good fit for office-heavy flex and technical support users needing southeast business-park formats.

Why this differs:
- Matches expected directional nodes: louisville-superior

Selection rationale:
- Louisville / Superior is recommended first because it is a strong fit for office/flex, R&D support, light production, and technical service users needing Boulder-adjacent business-park functionality. It aligns with the profile priorities around flex, R&D support, and technical service. The strongest supporting signals are Boulder proximity, US-36 access, and office/flex and R&D support formats.

Matched priorities:
- flex
- R&D support
- technical service
- Boulder proximity

Tradeoff summary:
- heavier industrial needs require building-level validation

Alternative rationale:
- Denver Tech Center remains relevant because good selective fit for office-heavy flex, technology support, and operations-adjacent users that need southeast access. Louisville / Superior appears to fit the initial profile more directly, while Denver Tech Center is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is Boulder proximity more important than Boulder address?
- Do you need office/flex, R&D support, or light production functionality?
- How important are parking and practical building format?
- Would Boulder, Broomfield, or Interlocken better fit talent and image?

Strengths surfaced:
- Boulder proximity
- US-36 access
- office/flex and R&D support formats
- parking and practical business-park setting
- I-25 southeast corridor access
- corporate office depth

Tradeoffs surfaced:
- heavier industrial needs require building-level validation
- true industrial users should compare Centennial, Aurora, or northeast industrial corridors
- true warehouse users should compare industrial corridors

Questions to validate:
- Is Boulder proximity more important than Boulder address?
- Do you need office/flex, R&D support, or light production functionality?
- How important are parking and practical building format?
- Would Boulder, Broomfield, or Interlocken better fit talent and image?

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

Denver pilot metadata is stored in `_data/recommendationQaStatus.js`.
