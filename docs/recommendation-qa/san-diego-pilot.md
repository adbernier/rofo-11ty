# San Diego Recommendation QA Pilot

Generated: 2026-08-07T00:05:34.969Z

This internal QA report validates whether San Diego Location Brief recommendations feel differentiated, explainable, defensible, and actionable using the current Commercial Location Knowledge Graph. It is not customer-facing content.

## Summary

- Scenarios reviewed: 10
- Scenarios passing baseline advisor-readiness checks: 10
- Scenarios needing review: 0
- Unique primary recommendations: 9
- Repeated primary recommendations: carlsbad-business-park (2)

Baseline checks require a primary recommendation, at least one expected directional match, meaningful tradeoffs, validation questions, and complete explainability fields. A pass does not mean the recommendation is final; it means the brief is credible enough for advisor review.

## Recommendation Diversity Check

The San Diego pilot produces meaningfully different primary recommendations across the QA scenarios.

## Editorial Broker Review

Editorial findings:
- Primary recommendations are commercially believable across downtown office, medical, executive office, life science/R&D, showroom/flex, warehouse, manufacturing, suburban headquarters, and North County professional-service scenarios.
- Secondary recommendations are sensible after calibration. The North County professional-services scenario now keeps Rancho Bernardo ahead of Downtown San Diego as the more direct North County comparison.
- Recommendation reasoning is differentiated enough for a first Compass Ready release: office, medical, industrial, warehouse, life-science, showroom, and North County profiles no longer read like the same generic market path.
- Representative buildings are sufficient to illustrate the seeded districts using existing Rofo building paths, while deeper broker-reviewed building curation remains a follow-on enhancement.

Calibration changes:
- Added explicit Miramar showroom/service-commercial fit so contractor and showroom scenarios describe Miramar as a real operating alternative rather than falling back to conventional office language.
- Strengthened Rancho Bernardo's North County professional-service signal so city-level recommendations understand when a profile is asking for a North County business-park path.
- Improved resolver explainability so graph-backed text matches surface as matched priorities, including terms such as life science, R&D, showroom, logistics, border access, North County, and I-15 access.
- Increased exact graph-text priority relevance so geography-specific requirements can outrank generic office prestige when the Knowledge Graph supports that direction.

QA comparison before vs after:
- Primary recommendations: unchanged across all 10 San Diego scenarios.
- Secondary recommendations: North County Professional Services changed from Downtown San Diego to Rancho Bernardo.
- Fit language: Miramar now appears as a strong showroom alternative in the contractor/showroom scenario.
- Explanation quality: improved matched-priority coverage across life science/R&D, showroom/service, logistics/border, manufacturing, suburban HQ, and North County profiles.

Remaining weaknesses:
- Retail and medical-office corridors should deepen after real user demand and broker review identify priority use cases.
- Second-pass nodes such as Little Italy / Columbia, East Village, Del Mar Heights / Carmel Valley, Chula Vista, San Marcos, Escondido, and Torrey Pines / La Jolla should be added only when they improve recommendation quality.
- Representative buildings should continue moving from illustrative seed coverage toward richer broker-reviewed examples.

Compass readiness recommendation:
- San Diego is recommended as Compass Ready for V1 Location Briefs. It should remain under enhancement for representative-building depth and second-pass retail/medical coverage, but no blocking editorial concerns remain after this calibration.

## Scenario Reviews

### Downtown Law Firm

- Profile: 4,000 sqft Office in San Diego
- Priorities: law firm, prestige, client meetings, transit important, downtown access
- Expected direction: Favor the client-facing downtown office core over suburban or industrial alternatives.
- Top recommendation: Downtown San Diego (Excellent fit)
- Secondary recommendation: UTC / University City
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Downtown San Diego - Excellent fit: Excellent fit for legal, finance, consulting, nonprofit, civic, and client-facing office users that need San Diego's central business identity.
- 2. UTC / University City - Excellent fit: Excellent fit for corporate office, professional-service, technology, and executive teams that want a high-amenity North City office environment.
- 3. Mission Valley - Strong fit: Strong fit for regional office and professional-service users that value central San Diego freeway access, parking, hotels, retail, and practical office formats.

Why this differs:
- Matches expected directional nodes: downtown-san-diego

Selection rationale:
- Downtown San Diego is recommended first because it is a excellent fit for legal, finance, consulting, nonprofit, civic, and client-facing office users that need San Diego's central business identity. It aligns with the profile priorities around law firm, prestige, and client meetings. The strongest supporting signals are central business identity, civic and client access, and downtown office inventory.

Matched priorities:
- law firm
- prestige
- client meetings
- transit important

Tradeoff summary:
- parking and commute friction can favor Mission Valley or UTC

Alternative rationale:
- UTC / University City remains relevant because it is a excellent fit for corporate office, professional-service, technology, and executive teams that want a high-amenity North City office environment. Downtown San Diego appears to fit the initial profile more directly, while UTC / University City is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do clients or civic partners need downtown access?
- Is a central San Diego business address important?
- Will employees rely on transit, parking, or regional freeway access?
- Would Mission Valley or UTC reduce commute and parking friction?

Strengths surfaced:
- central business identity
- civic and client access
- downtown office inventory
- transit and amenity access
- North City office identity
- UCSD and Torrey Pines adjacency

Tradeoffs surfaced:
- parking and commute friction can favor Mission Valley or UTC
- less practical for flex, warehouse, or production users
- often less cost-efficient than Kearny Mesa or Mission Valley
- less functional for industrial/flex users than Sorrento Mesa or Miramar
- less urban identity than Downtown San Diego
- less innovation/life-science ecosystem than UTC or Sorrento Mesa

Questions to validate:
- Do clients or civic partners need downtown access?
- Is a central San Diego business address important?
- Will employees rely on transit, parking, or regional freeway access?
- Would Mission Valley or UTC reduce commute and parking friction?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Mission Valley Medical Office

- Profile: 6,000 sqft Medical in San Diego
- Priorities: patient visits, parking important, freeway access, central San Diego, moderate budget
- Expected direction: Favor central patient-access medical office districts with parking and freeway access.
- Top recommendation: Mission Valley (Strong fit)
- Secondary recommendation: UTC / University City
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Mission Valley - Strong fit: Strong fit for medical office and wellness users that need central patient access, parking, and freeway reach.
- 2. UTC / University City - Strong fit: Strong fit for medical and specialty office users that benefit from North City access and UCSD/Torrey Pines adjacency.
- 3. Kearny Mesa - Good fit: Good fit for practical central San Diego office users that value freeway access, parking, and service-commercial adjacency over downtown or UTC image.

Why this differs:
- Matches expected directional nodes: mission-valley, utc-university-city

Selection rationale:
- Mission Valley is recommended first because it is a strong fit for medical office and wellness users that need central patient access, parking, and freeway reach. It aligns with the profile priorities around patient visits, parking important, and freeway access. The strongest supporting signals are central freeway access, parking, and medical and professional-service fit.

Matched priorities:
- patient visits
- parking important
- freeway access
- central San Diego

Tradeoff summary:
- patient geography should be compared with UTC, Rancho Bernardo, and South Bay alternatives

Alternative rationale:
- UTC / University City remains relevant because it is a strong fit for medical and specialty office users that benefit from North City access and UCSD/Torrey Pines adjacency. Mission Valley appears to fit the initial profile more directly, while UTC / University City is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- How important is employee and patient parking?
- Do customers or patients come from multiple parts of San Diego County?
- Is central freeway access more important than downtown image?
- Would UTC or Downtown better support recruiting, clients, or referrals?

Strengths surfaced:
- central freeway access
- parking
- medical and professional-service fit
- hotels, retail, and regional amenities
- North City office identity
- UCSD and Torrey Pines adjacency

Tradeoffs surfaced:
- patient geography should be compared with UTC, Rancho Bernardo, and South Bay alternatives
- patient parking and building access should be validated
- less executive image than downtown or UTC
- less innovation identity than Sorrento Mesa

Questions to validate:
- How important is employee and patient parking?
- Do customers or patients come from multiple parts of San Diego County?
- Is central freeway access more important than downtown image?
- Would UTC or Downtown better support recruiting, clients, or referrals?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### UTC Executive Office

- Profile: 8,000 sqft Office in San Diego
- Priorities: executive image, talent access, amenities, professional services, client meetings
- Expected direction: Favor high-amenity North City or downtown office options rather than industrial/flex corridors.
- Top recommendation: UTC / University City (Excellent fit)
- Secondary recommendation: Mission Valley
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. UTC / University City - Excellent fit: Excellent fit for corporate office, professional-service, technology, and executive teams that want a high-amenity North City office environment.
- 2. Mission Valley - Strong fit: Strong fit for regional office and professional-service users that value central San Diego freeway access, parking, hotels, retail, and practical office formats.
- 3. Downtown San Diego - Excellent fit: Excellent fit for legal, finance, consulting, nonprofit, civic, and client-facing office users that need San Diego's central business identity.

Why this differs:
- Matches expected directional nodes: utc-university-city, downtown-san-diego

Selection rationale:
- UTC / University City is recommended first because it is a excellent fit for corporate office, professional-service, technology, and executive teams that want a high-amenity North City office environment. It aligns with the profile priorities around executive image, talent access, and amenities. The strongest supporting signals are North City office identity, UCSD and Torrey Pines adjacency, and amenities.

Matched priorities:
- executive image
- talent access
- amenities
- professional services

Tradeoff summary:
- often less cost-efficient than Kearny Mesa or Mission Valley

Alternative rationale:
- Mission Valley remains relevant because it is a strong fit for regional office and professional-service users that value central San Diego freeway access, parking, hotels, retail, and practical office formats. UTC / University City appears to fit the initial profile more directly, while Mission Valley is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is UCSD, Torrey Pines, or North City talent access important?
- Do you need executive image or lower occupancy cost?
- Is medical or patient access part of the search?
- Would Sorrento Mesa provide better R&D/flex functionality?

Strengths surfaced:
- North City office identity
- UCSD and Torrey Pines adjacency
- amenities
- executive and professional-service image
- central freeway access
- parking

Tradeoffs surfaced:
- often less cost-efficient than Kearny Mesa or Mission Valley
- less functional for industrial/flex users than Sorrento Mesa or Miramar
- less urban identity than Downtown San Diego
- less innovation/life-science ecosystem than UTC or Sorrento Mesa
- parking and commute friction can favor Mission Valley or UTC
- less practical for flex, warehouse, or production users

Questions to validate:
- Is UCSD, Torrey Pines, or North City talent access important?
- Do you need executive image or lower occupancy cost?
- Is medical or patient access part of the search?
- Would Sorrento Mesa provide better R&D/flex functionality?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Sorrento Mesa Biotech Startup

- Profile: 10,000 sqft Life Science in San Diego
- Priorities: life science, R&D, talent access, growth flexibility, technical buildout
- Expected direction: Favor Sorrento Mesa and North City innovation districts before office-only markets.
- Top recommendation: Sorrento Mesa (Excellent fit)
- Secondary recommendation: UTC / University City
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Sorrento Mesa - Excellent fit: Excellent fit for life-science, biotech support, R&D, and technical users that benefit from Sorrento Mesa's innovation and flex ecosystem.
- 2. UTC / University City - Strong fit: Strong fit for life-science-adjacent office users and companies that value proximity to UCSD, Torrey Pines, and Sorrento Mesa.
- 3. Carlsbad Business Park - Good fit: Good fit for life-science support and adjacent office/R&D users comparing North County with Sorrento Mesa and UTC.

Why this differs:
- Matches expected directional nodes: sorrento-mesa, utc-university-city, carlsbad-business-park

Selection rationale:
- Sorrento Mesa is recommended first because it is a excellent fit for life-science, biotech support, R&D, and technical users that benefit from Sorrento Mesa's innovation and flex ecosystem. It aligns with the profile priorities around life science, R&D, and talent access. The strongest supporting signals are life-science and technology ecosystem, R&D/flex building formats, and North City talent access.

Matched priorities:
- life science
- R&D
- talent access
- growth flexibility

Tradeoff summary:
- lab and technical specifications must be validated by building

Alternative rationale:
- UTC / University City remains relevant because it is a strong fit for life-science-adjacent office users and companies that value proximity to UCSD, Torrey Pines, and Sorrento Mesa. Sorrento Mesa appears to fit the initial profile more directly, while UTC / University City is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do you need life-science, R&D, lab-support, or office/flex functionality?
- Is North City talent access more important than executive image?
- Do you need loading, power, or technical buildout?
- Would UTC, Miramar, or Carlsbad Business Park better fit image, operations, or geography?

Strengths surfaced:
- life-science and technology ecosystem
- R&D/flex building formats
- North City talent access
- proximity to UTC, Torrey Pines, and Miramar
- North City office identity
- UCSD and Torrey Pines adjacency

Tradeoffs surfaced:
- lab and technical specifications must be validated by building
- technical lab or R&D needs may fit Sorrento Mesa better
- specialized lab needs require property-level validation

Questions to validate:
- Do you need life-science, R&D, lab-support, or office/flex functionality?
- Is North City talent access more important than executive image?
- Do you need loading, power, or technical buildout?
- Would UTC, Miramar, or Carlsbad Business Park better fit image, operations, or geography?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Miramar Contractor / Showroom

- Profile: 7,500 sqft Showroom in San Diego
- Priorities: showroom, service vehicles, customer visits, freeway access, parking important
- Expected direction: Favor central service-commercial and office/flex districts rather than conventional office districts.
- Top recommendation: Kearny Mesa (Strong fit)
- Secondary recommendation: Miramar
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Kearny Mesa - Strong fit: Strong fit for showroom and customer-facing service-commercial users that benefit from central access and practical formats.
- 2. Miramar - Strong fit: Strong fit for showroom, contractor, and customer-facing service-commercial users that need central/north San Diego access with operational utility.
- 3. Poway Business Park - Good fit: Good fit for operations-adjacent office users and suburban teams that value parking and practical access.

Why this differs:
- Matches expected directional nodes: kearny-mesa, miramar

Selection rationale:
- Kearny Mesa is recommended first because it is a strong fit for showroom and customer-facing service-commercial users that benefit from central access and practical formats. It aligns with the profile priorities around showroom, service vehicles, and customer visits. The strongest supporting signals are central freeway access, office/flex and service-commercial formats, and parking.

Matched priorities:
- showroom
- service vehicles
- customer visits
- freeway access

Tradeoff summary:
- street visibility and parking must be validated by building

Alternative rationale:
- Miramar remains relevant because it is a strong fit for showroom, contractor, and customer-facing service-commercial users that need central/north San Diego access with operational utility. Kearny Mesa appears to fit the initial profile more directly, while Miramar is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do you need office, showroom, flex, or light industrial functionality?
- Is central freeway access more important than executive image?
- Will customers or service vehicles visit the location?
- Would Miramar or Mission Valley better fit operations or office image?

Strengths surfaced:
- central freeway access
- office/flex and service-commercial formats
- parking
- showroom and contractor utility
- central/north industrial access
- warehouse/flex formats

Tradeoffs surfaced:
- street visibility and parking must be validated by building
- customer visibility and parking should be validated property by property
- Kearny Mesa can be better for more customer-facing central showroom uses
- conventional office users may prefer Rancho Bernardo or Mission Valley

Questions to validate:
- Do you need office, showroom, flex, or light industrial functionality?
- Is central freeway access more important than executive image?
- Will customers or service vehicles visit the location?
- Would Miramar or Mission Valley better fit operations or office image?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Otay Mesa Warehouse

- Profile: 40,000 sqft Warehouse in San Diego
- Priorities: logistics, truck access, loading, trailer parking, border access
- Expected direction: Favor border-oriented warehouse and distribution corridors over central office/flex markets.
- Top recommendation: Otay Mesa (Excellent fit)
- Secondary recommendation: Miramar
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Otay Mesa - Excellent fit: Excellent fit for warehouse and distribution users that need border, port-of-entry, SR-905/SR-125, and South County industrial access.
- 2. Miramar - Strong fit: Strong fit for warehouse/flex and service operations needing central/north San Diego access.
- 3. Vista Business Park - Strong fit: Strong fit for warehouse/flex users needing North County utility and practical industrial formats.

Why this differs:
- Matches expected directional nodes: otay-mesa, miramar, vista-business-park

Selection rationale:
- Otay Mesa is recommended first because it is a excellent fit for warehouse and distribution users that need border, port-of-entry, SR-905/SR-125, and South County industrial access. It aligns with the profile priorities around logistics, truck access, and loading. The strongest supporting signals are border logistics access, warehouse and distribution utility, and industrial zoning context.

Matched priorities:
- logistics
- truck access
- loading
- trailer parking

Tradeoff summary:
- employee geography and truck routes should be validated carefully

Alternative rationale:
- Miramar remains relevant because it is a strong fit for warehouse/flex and service operations needing central/north San Diego access. Otay Mesa appears to fit the initial profile more directly, while Miramar is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do you need border or port-of-entry access?
- What truck, loading, trailer parking, and yard requirements are non-negotiable?
- Is employee access from South County or Mexico part of the decision?
- Would Miramar or Vista better fit a less border-dependent operation?

Strengths surfaced:
- border logistics access
- warehouse and distribution utility
- industrial zoning context
- South County freight corridors
- central/north industrial access
- warehouse/flex formats

Tradeoffs surfaced:
- employee geography and truck routes should be validated carefully
- large-format logistics and border access should compare Otay Mesa
- large distribution and border users should compare Otay Mesa

Questions to validate:
- Do you need border or port-of-entry access?
- What truck, loading, trailer parking, and yard requirements are non-negotiable?
- Is employee access from South County or Mexico part of the decision?
- Would Miramar or Vista better fit a less border-dependent operation?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Carlsbad Engineering Company

- Profile: 12,000 sqft R&D in San Diego
- Priorities: North County, engineering, R&D, parking important, growth flexibility
- Expected direction: Favor North County and R&D/flex business-park markets rather than downtown office.
- Top recommendation: Carlsbad Business Park (Excellent fit)
- Secondary recommendation: Rancho Bernardo
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Carlsbad Business Park - Excellent fit: Excellent fit for North County office, R&D, technology, life-science support, and professional users that want a polished business-park setting near Palomar Airport Road.
- 2. Rancho Bernardo - Strong fit: Strong fit for suburban office, engineering, North County professional-service, and regional headquarters users that value I-15 access and business-park settings.
- 3. Sorrento Mesa - Strong fit: Strong fit for technology, life-science-adjacent, engineering, and R&D-oriented office users that want North City access with more functional building formats than UTC.

Why this differs:
- Matches expected directional nodes: carlsbad-business-park, sorrento-mesa, rancho-bernardo

Selection rationale:
- Carlsbad Business Park is recommended first because it is a excellent fit for North County office, R&D, technology, life-science support, and professional users that want a polished business-park setting near Palomar Airport Road. It aligns with the profile priorities around North County, engineering, and R&D. The strongest supporting signals are North County business-park identity, Palomar Airport Road corridor, and office/R&D and light industrial formats.

Matched priorities:
- North County
- engineering
- R&D
- parking important

Tradeoff summary:
- less central to San Diego than UTC or Sorrento Mesa

Alternative rationale:
- Rancho Bernardo remains relevant because it is a strong fit for suburban office, engineering, North County professional-service, and regional headquarters users that value I-15 access and business-park settings. Carlsbad Business Park appears to fit the initial profile more directly, while Rancho Bernardo is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is North County employee geography important?
- Do you need office/R&D, flex, or manufacturing-support space?
- Is Palomar Airport/Highway 78 access useful?
- Would Sorrento Mesa, Vista, or Oceanside better fit ecosystem or operations?

Strengths surfaced:
- North County business-park identity
- Palomar Airport Road corridor
- office/R&D and light industrial formats
- parking and expansion flexibility
- I-15 access
- business-park office formats

Tradeoffs surfaced:
- less central to San Diego than UTC or Sorrento Mesa
- less walkable than urban districts
- less central than Mission Valley or Kearny Mesa
- less high-amenity North City image than UTC
- less executive/client-facing than UTC
- less urban and amenity-rich than downtown or mixed-use office districts

Questions to validate:
- Is North County employee geography important?
- Do you need office/R&D, flex, or manufacturing-support space?
- Is Palomar Airport/Highway 78 access useful?
- Would Sorrento Mesa, Vista, or Oceanside better fit ecosystem or operations?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Vista Light Manufacturing

- Profile: 18,000 sqft Manufacturing in San Diego
- Priorities: manufacturing, loading, power, lower cost, North County
- Expected direction: Favor North County industrial/flex and manufacturing-oriented districts.
- Top recommendation: Vista Business Park (Strong fit)
- Secondary recommendation: Otay Mesa
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Vista Business Park - Strong fit: Strong fit for light manufacturing and production-support users that prioritize function over office image.
- 2. Otay Mesa - Good fit: Good fit for manufacturing and production users that need industrial zoning context and border/South County access.
- 3. Miramar - Good fit: Good fit for light manufacturing and production-support users that need central access and practical buildings.

Why this differs:
- Matches expected directional nodes: vista-business-park

Selection rationale:
- Vista Business Park is recommended first because it is a strong fit for light manufacturing and production-support users that prioritize function over office image. It aligns with the profile priorities around manufacturing, loading, and power. The strongest supporting signals are inland North County industrial utility, manufacturing and warehouse/flex formats, and parking and truck access.

Matched priorities:
- manufacturing
- loading
- power
- lower cost

Tradeoff summary:
- specialized technical requirements need property-level validation

Alternative rationale:
- Otay Mesa remains relevant because it is a good fit for manufacturing and production users that need industrial zoning context and border/South County access. Vista Business Park appears to fit the initial profile more directly, while Otay Mesa is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do you need loading, yard, manufacturing, or warehouse/flex capability?
- Is North County labor/customer access important?
- Is lower-cost functional space more important than office image?
- Would Carlsbad, Oceanside, Poway, or Miramar better fit geography and operations?

Strengths surfaced:
- inland North County industrial utility
- manufacturing and warehouse/flex formats
- parking and truck access
- functional business-park environment
- border logistics access
- warehouse and distribution utility

Tradeoffs surfaced:
- specialized technical requirements need property-level validation
- technical specs, power, and yard needs require building-level review
- North County manufacturers should also compare Vista, Poway, Oceanside, and Carlsbad
- specialized power or yard needs require property-level validation

Questions to validate:
- Do you need loading, yard, manufacturing, or warehouse/flex capability?
- Is North County labor/customer access important?
- Is lower-cost functional space more important than office image?
- Would Carlsbad, Oceanside, Poway, or Miramar better fit geography and operations?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Rancho Bernardo Suburban HQ

- Profile: 15,000 sqft Office in San Diego
- Priorities: suburban headquarters, parking important, I-15 access, growth flexibility, employees drive
- Expected direction: Favor suburban business-park office and office/flex districts instead of downtown.
- Top recommendation: Rancho Bernardo (Strong fit)
- Secondary recommendation: Poway Business Park
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Rancho Bernardo - Strong fit: Strong fit for suburban office, engineering, North County professional-service, and regional headquarters users that value I-15 access and business-park settings.
- 2. Poway Business Park - Good fit: Good fit for operations-adjacent office users and suburban teams that value parking and practical access.
- 3. Carlsbad Business Park - Excellent fit: Excellent fit for North County office, R&D, technology, life-science support, and professional users that want a polished business-park setting near Palomar Airport Road.

Why this differs:
- Matches expected directional nodes: rancho-bernardo

Selection rationale:
- Rancho Bernardo is recommended first because it is a strong fit for suburban office, engineering, North County professional-service, and regional headquarters users that value I-15 access and business-park settings. It aligns with the profile priorities around suburban headquarters, parking important, and I-15 access. The strongest supporting signals are I-15 access, business-park office formats, and parking.

Matched priorities:
- suburban headquarters
- parking important
- I-15 access
- growth flexibility

Tradeoff summary:
- less central than Mission Valley or Kearny Mesa

Alternative rationale:
- Poway Business Park remains relevant because it is a good fit for operations-adjacent office users and suburban teams that value parking and practical access. Rancho Bernardo appears to fit the initial profile more directly, while Poway Business Park is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is I-15 access important for employees or customers?
- Do you need suburban headquarters image or operational flexibility?
- Is parking a top priority?
- Would Poway, Mira Mesa, or Carlsbad better fit operations, cost, or talent access?

Strengths surfaced:
- I-15 access
- business-park office formats
- parking
- suburban office/R&D context
- industrial/flex business park formats
- manufacturing and contractor utility

Tradeoffs surfaced:
- less central than Mission Valley or Kearny Mesa
- less high-amenity North City image than UTC
- conventional office users may prefer Rancho Bernardo or Mission Valley
- less central to San Diego than UTC or Sorrento Mesa
- less walkable than urban districts

Questions to validate:
- Is I-15 access important for employees or customers?
- Do you need suburban headquarters image or operational flexibility?
- Is parking a top priority?
- Would Poway, Mira Mesa, or Carlsbad better fit operations, cost, or talent access?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### North County Professional Services

- Profile: 3,500 sqft Office in San Diego
- Priorities: North County, client visits, parking important, professional services, moderate budget
- Expected direction: Favor North County office/business-park options while keeping central San Diego alternatives visible.
- Top recommendation: Carlsbad Business Park (Excellent fit)
- Secondary recommendation: Rancho Bernardo
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Carlsbad Business Park - Excellent fit: Excellent fit for North County office, R&D, technology, life-science support, and professional users that want a polished business-park setting near Palomar Airport Road.
- 2. Rancho Bernardo - Strong fit: Strong fit for suburban office, engineering, North County professional-service, and regional headquarters users that value I-15 access and business-park settings.
- 3. Downtown San Diego - Excellent fit: Excellent fit for legal, finance, consulting, nonprofit, civic, and client-facing office users that need San Diego's central business identity.

Why this differs:
- Matches expected directional nodes: carlsbad-business-park, rancho-bernardo

Selection rationale:
- Carlsbad Business Park is recommended first because it is a excellent fit for North County office, R&D, technology, life-science support, and professional users that want a polished business-park setting near Palomar Airport Road. It aligns with the profile priorities around North County, client visits, and parking important. The strongest supporting signals are North County business-park identity, Palomar Airport Road corridor, and office/R&D and light industrial formats.

Matched priorities:
- North County
- client visits
- parking important
- professional services

Tradeoff summary:
- less central to San Diego than UTC or Sorrento Mesa

Alternative rationale:
- Rancho Bernardo remains relevant because it is a strong fit for suburban office, engineering, North County professional-service, and regional headquarters users that value I-15 access and business-park settings. Carlsbad Business Park appears to fit the initial profile more directly, while Rancho Bernardo is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is North County employee geography important?
- Do you need office/R&D, flex, or manufacturing-support space?
- Is Palomar Airport/Highway 78 access useful?
- Would Sorrento Mesa, Vista, or Oceanside better fit ecosystem or operations?

Strengths surfaced:
- North County business-park identity
- Palomar Airport Road corridor
- office/R&D and light industrial formats
- parking and expansion flexibility
- I-15 access
- business-park office formats

Tradeoffs surfaced:
- less central to San Diego than UTC or Sorrento Mesa
- less walkable than urban districts
- less central than Mission Valley or Kearny Mesa
- less high-amenity North City image than UTC
- parking and commute friction can favor Mission Valley or UTC
- less practical for flex, warehouse, or production users

Questions to validate:
- Is North County employee geography important?
- Do you need office/R&D, flex, or manufacturing-support space?
- Is Palomar Airport/Highway 78 access useful?
- Would Sorrento Mesa, Vista, or Oceanside better fit ecosystem or operations?

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

San Diego pilot metadata is stored in `_data/recommendationQaStatus.js`.
