# Sacramento Recommendation QA Pilot

Generated: 2026-07-09T19:21:03.828Z

This internal QA report validates whether Sacramento Location Brief recommendations feel differentiated, explainable, defensible, and actionable using the current Commercial Location Knowledge Graph. It is not customer-facing content.

## Summary

- Scenarios reviewed: 7
- Scenarios passing baseline advisor-readiness checks: 7
- Scenarios needing review: 0
- Unique primary recommendations: 5
- Repeated primary recommendations: roseville-commercial-core (2), downtown-sacramento (2)

Baseline checks require a primary recommendation, at least one expected directional match, meaningful tradeoffs, validation questions, and complete explainability fields. A pass does not mean the recommendation is final; it means the brief is credible enough for advisor review.

## Recommendation Diversity Check

The Sacramento pilot produces meaningfully different primary recommendations across the QA scenarios.

## Scenario Reviews

### Medical Office

- Profile: 6,000 sqft Medical in Sacramento
- Priorities: patient visits, parking important, near hospitals, moderate budget
- Expected direction: Favor medical-oriented, parking-conscious central and suburban districts rather than default downtown office.
- Top recommendation: Roseville Commercial Core (Strong fit)
- Secondary recommendation: Arden / Point West
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Roseville Commercial Core - Strong fit: Strong fit for medical and wellness users serving Placer County and northeast Sacramento patients with parking-friendly access.
- 2. Arden / Point West - Strong fit: Strong fit for medical and wellness users needing central/north Sacramento patient access and easier parking than Midtown or Downtown.
- 3. Midtown Sacramento - Strong fit: Strong fit for medical, wellness, and specialty practices that benefit from central Sacramento access and adjacency to Alhambra/East Sacramento patient corridors.

Why this differs:
- Matches expected directional nodes: midtown-sacramento, arden-point-west, roseville-commercial-core

Selection rationale:
- Roseville Commercial Core is recommended first because it is a strong fit for medical and wellness users serving Placer County and northeast Sacramento patients with parking-friendly access. It aligns with the profile priorities around patient visits, parking important, and moderate budget. The strongest supporting signals are regional retail base, parking, and I-80 access.

Matched priorities:
- patient visits
- parking important
- moderate budget

Tradeoff summary:
- patient geography should be compared with Folsom, Rocklin, and Elk Grove depending on service area

Alternative rationale:
- Arden / Point West remains relevant because it is a strong fit for medical and wellness users needing central/north Sacramento patient access and easier parking than Midtown or Downtown. Roseville Commercial Core appears to fit the initial profile more directly, while Arden / Point West is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Are your customers, patients, or employees concentrated in Placer County?
- Is parking a top priority?
- Do you need regional retail visibility?
- Would Rocklin or Folsom better match cost, image, or commute patterns?

Strengths surfaced:
- regional retail base
- parking
- I-80 access
- medical and professional-service demand
- Business 80 access
- medical and service-commercial context

Tradeoffs surfaced:
- patient geography should be compared with Folsom, Rocklin, and Elk Grove depending on service area
- patient access and building visibility vary by corridor
- patient parking and building access must be validated carefully

Questions to validate:
- Are your customers, patients, or employees concentrated in Placer County?
- Is parking a top priority?
- Do you need regional retail visibility?
- Would Rocklin or Folsom better match cost, image, or commute patterns?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Downtown Professional Services

- Profile: 4,000 sqft Office in Sacramento
- Priorities: law firm, prestige, client meetings, transit important
- Expected direction: Favor the civic/professional core and central walkable alternatives over suburban value markets.
- Top recommendation: Downtown Sacramento (Excellent fit)
- Secondary recommendation: Natomas
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Downtown Sacramento - Excellent fit: Excellent fit for civic, legal, government-adjacent, professional-service, and client-facing office users that need Sacramento's downtown business core.
- 2. Natomas - Strong fit: Strong fit for parking-sensitive regional office users that value I-5/I-80 access, airport proximity, and practical suburban office formats.
- 3. Rancho Cordova Commercial Core - Strong fit: Strong fit for value-oriented office, back-office, insurance, professional-service, and regional support users that need Highway 50 access, parking, and larger footprints.

Why this differs:
- Matches expected directional nodes: downtown-sacramento

Selection rationale:
- Downtown Sacramento is recommended first because it is a excellent fit for civic, legal, government-adjacent, professional-service, and client-facing office users that need Sacramento's downtown business core. It aligns with the profile priorities around prestige, client meetings, and transit important. The strongest supporting signals are state government and civic access, downtown office core, and regional transit.

Matched priorities:
- prestige
- client meetings
- transit important

Tradeoff summary:
- parking and commute friction can push some teams to Natomas, Rancho Cordova, or Roseville

Alternative rationale:
- Natomas remains relevant because it is a strong fit for parking-sensitive regional office users that value I-5/I-80 access, airport proximity, and practical suburban office formats. Downtown Sacramento appears to fit the initial profile more directly, while Natomas is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do clients, agencies, or courts need downtown access?
- Is light rail or parking more important?
- Will employees commute from multiple Sacramento suburbs?
- Would Natomas or Rancho Cordova reduce cost and parking friction?

Strengths surfaced:
- state government and civic access
- downtown office core
- regional transit
- client-facing professional environment
- airport access
- I-5 and I-80 connectivity

Tradeoffs surfaced:
- parking and commute friction can push some teams to Natomas, Rancho Cordova, or Roseville
- less suited to industrial, warehouse, or large back-office users
- less walkable and less civic/client-facing than Downtown Sacramento
- less civic/client-facing than Downtown Sacramento
- less executive suburban image than Folsom

Questions to validate:
- Do clients, agencies, or courts need downtown access?
- Is light rail or parking more important?
- Will employees commute from multiple Sacramento suburbs?
- Would Natomas or Rancho Cordova reduce cost and parking friction?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Cost-Conscious Back Office

- Profile: 10,000 sqft Office in Sacramento
- Priorities: employees drive, cost sensitive, visibility unimportant, parking important
- Expected direction: Favor parking-friendly, value-oriented suburban office and larger-footprint markets.
- Top recommendation: Rancho Cordova Commercial Core (Strong fit)
- Secondary recommendation: Natomas
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Rancho Cordova Commercial Core - Strong fit: Strong fit for value-oriented office, back-office, insurance, professional-service, and regional support users that need Highway 50 access, parking, and larger footprints.
- 2. Natomas - Strong fit: Strong fit for parking-sensitive regional office users that value I-5/I-80 access, airport proximity, and practical suburban office formats.
- 3. Downtown Sacramento - Excellent fit: Excellent fit for civic, legal, government-adjacent, professional-service, and client-facing office users that need Sacramento's downtown business core.

Why this differs:
- Matches expected directional nodes: rancho-cordova-commercial-core, natomas

Selection rationale:
- Rancho Cordova Commercial Core is recommended first because it is a strong fit for value-oriented office, back-office, insurance, professional-service, and regional support users that need Highway 50 access, parking, and larger footprints. It aligns with the profile priorities around employees drive, cost sensitive, and visibility unimportant. The strongest supporting signals are Highway 50 access, parking, and larger footprints.

Matched priorities:
- employees drive
- cost sensitive
- visibility unimportant
- parking important

Tradeoff summary:
- less civic/client-facing than Downtown Sacramento

Alternative rationale:
- Natomas remains relevant because it is a strong fit for parking-sensitive regional office users that value I-5/I-80 access, airport proximity, and practical suburban office formats. Rancho Cordova Commercial Core appears to fit the initial profile more directly, while Natomas is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is lower occupancy cost a priority?
- Do you need larger footprints or office/flex functionality?
- Do clients expect a central Sacramento address?
- Would Folsom, Roseville, or Power Inn better fit image or operations?

Strengths surfaced:
- Highway 50 access
- parking
- larger footprints
- value-oriented office/flex inventory
- airport access
- I-5 and I-80 connectivity

Tradeoffs surfaced:
- less civic/client-facing than Downtown Sacramento
- less executive suburban image than Folsom
- less walkable and less civic/client-facing than Downtown Sacramento
- parking and commute friction can push some teams to Natomas, Rancho Cordova, or Roseville
- less suited to industrial, warehouse, or large back-office users

Questions to validate:
- Is lower occupancy cost a priority?
- Do you need larger footprints or office/flex functionality?
- Do clients expect a central Sacramento address?
- Would Folsom, Roseville, or Power Inn better fit image or operations?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Light Industrial / Flex

- Profile: 8,000 sqft Flex in Sacramento
- Priorities: service vehicles, loading, flexible space, highway access
- Expected direction: Favor office/flex and industrial utility corridors rather than downtown or restaurant-oriented districts.
- Top recommendation: Natomas (Strong fit)
- Secondary recommendation: Rancho Cordova Commercial Core
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Natomas - Strong fit: Strong fit for office/flex and service-commercial users that need parking, freeway access, and operational flexibility north of downtown.
- 2. Rancho Cordova Commercial Core - Strong fit: Strong fit for office/flex, service operations, and larger-footprint users that need practical buildings and Highway 50 access.
- 3. Power Inn Industrial - Good fit: Good fit for office/flex and production-support users needing a practical mix of office, shop, warehouse, or service space.

Why this differs:
- Matches expected directional nodes: power-inn-industrial, rancho-cordova-commercial-core, natomas

Selection rationale:
- Natomas is recommended first because it is a strong fit for office/flex and service-commercial users that need parking, freeway access, and operational flexibility north of downtown. It aligns with the profile priorities around loading and highway access. The strongest supporting signals are airport access, I-5 and I-80 connectivity, and parking-friendly office.

Matched priorities:
- loading
- highway access

Tradeoff summary:
- technical loading and warehouse specs vary by building

Alternative rationale:
- Rancho Cordova Commercial Core remains relevant because it is a strong fit for office/flex, service operations, and larger-footprint users that need practical buildings and Highway 50 access. Natomas appears to fit the initial profile more directly, while Rancho Cordova Commercial Core is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is airport access important?
- Do employees need easy parking?
- Do you need office/flex capability or just office?
- Would Downtown Sacramento, Rancho Cordova, or Roseville better fit client and employee geography?

Strengths surfaced:
- airport access
- I-5 and I-80 connectivity
- parking-friendly office
- suburban office/flex formats
- Highway 50 access
- parking

Tradeoffs surfaced:
- technical loading and warehouse specs vary by building
- technical specs and loading vary by property
- not ideal for client-facing executive office uses

Questions to validate:
- Is airport access important?
- Do employees need easy parking?
- Do you need office/flex capability or just office?
- Would Downtown Sacramento, Rancho Cordova, or Roseville better fit client and employee geography?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Regional Distribution

- Profile: 25,000 sqft Warehouse in Sacramento
- Priorities: logistics, freeway access, truck circulation, loading, trailer parking
- Expected direction: Favor industrial and warehouse corridors with truck access, loading, and freeway utility.
- Top recommendation: Power Inn Industrial (Strong fit)
- Secondary recommendation: Natomas
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Power Inn Industrial - Strong fit: Strong warehouse fit for users serving Sacramento and nearby suburbs with Highway 50 and south/east Sacramento reach.
- 2. Natomas - Limited fit: Warehouse use can work selectively, but Natomas is primarily a suburban office/flex and airport-access market rather than the deepest Sacramento industrial corridor.
- 3. Rancho Cordova Commercial Core - Strong fit: Strong fit for value-oriented office, back-office, insurance, professional-service, and regional support users that need Highway 50 access, parking, and larger footprints.

Why this differs:
- Matches expected directional nodes: power-inn-industrial, rancho-cordova-commercial-core

Selection rationale:
- Power Inn Industrial is recommended first because strong warehouse fit for users serving Sacramento and nearby suburbs with Highway 50 and south/east Sacramento reach. It aligns with the profile priorities around freeway access, truck circulation, and loading. The strongest supporting signals are Highway 50 access, industrial/flex building base, and service-commercial utility.

Matched priorities:
- freeway access
- truck circulation
- loading
- trailer parking

Tradeoff summary:
- modern clear height and trailer parking vary by property

Alternative rationale:
- Natomas remains relevant because warehouse use can work selectively, but Natomas is primarily a suburban office/flex and airport-access market rather than the deepest Sacramento industrial corridor. Power Inn Industrial appears to fit the initial profile more directly, while Natomas is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do you need truck access, loading, yard, or outdoor storage?
- Is Highway 50 access important?
- Would West Sacramento or Rancho Cordova better fit warehouse or flex requirements?
- Are power or production needs part of the search?

Strengths surfaced:
- Highway 50 access
- industrial/flex building base
- service-commercial utility
- south/east Sacramento reach
- airport access
- I-5 and I-80 connectivity

Tradeoffs surfaced:
- modern clear height and trailer parking vary by property
- larger warehouse requirements should compare Power Inn, West Sacramento, or Rancho Cordova
- less civic/client-facing than Downtown Sacramento
- less executive suburban image than Folsom

Questions to validate:
- Do you need truck access, loading, yard, or outdoor storage?
- Is Highway 50 access important?
- Would West Sacramento or Rancho Cordova better fit warehouse or flex requirements?
- Are power or production needs part of the search?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Startup HQ

- Profile: 5,000 sqft Office in Sacramento
- Priorities: collaborative office, recruiting, restaurants, walkability, hybrid workforce
- Expected direction: Favor walkable, amenity-rich districts that support recruiting and team experience.
- Top recommendation: Downtown Sacramento (Excellent fit)
- Secondary recommendation: Midtown Sacramento
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Downtown Sacramento - Excellent fit: Excellent fit for civic, legal, government-adjacent, professional-service, and client-facing office users that need Sacramento's downtown business core.
- 2. Midtown Sacramento - Strong fit: Strong fit for smaller office users, nonprofits, creative firms, professional services, and local teams that value walkability and central Sacramento identity.
- 3. Roseville Commercial Core - Strong fit: Strong fit for regional office, professional-service, medical, and customer-facing users serving Placer County and northeast Sacramento with strong parking and retail amenities.

Why this differs:
- Matches expected directional nodes: midtown-sacramento, downtown-sacramento

Selection rationale:
- Downtown Sacramento is recommended first because it is a excellent fit for civic, legal, government-adjacent, professional-service, and client-facing office users that need Sacramento's downtown business core. It aligns with the profile priorities around recruiting, restaurants, and walkability. The strongest supporting signals are state government and civic access, downtown office core, and regional transit.

Matched priorities:
- recruiting
- restaurants
- walkability

Tradeoff summary:
- parking and commute friction can push some teams to Natomas, Rancho Cordova, or Roseville

Alternative rationale:
- Midtown Sacramento remains relevant because it is a strong fit for smaller office users, nonprofits, creative firms, professional services, and local teams that value walkability and central Sacramento identity. Downtown Sacramento appears to fit the initial profile more directly, while Midtown Sacramento is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do clients, agencies, or courts need downtown access?
- Is light rail or parking more important?
- Will employees commute from multiple Sacramento suburbs?
- Would Natomas or Rancho Cordova reduce cost and parking friction?

Strengths surfaced:
- state government and civic access
- downtown office core
- regional transit
- client-facing professional environment
- walkability
- restaurant and retail energy

Tradeoffs surfaced:
- parking and commute friction can push some teams to Natomas, Rancho Cordova, or Roseville
- less suited to industrial, warehouse, or large back-office users
- larger modern office blocks and parking can be harder than downtown or suburban alternatives
- less central to Sacramento civic users
- auto-oriented commute pattern

Questions to validate:
- Do clients, agencies, or courts need downtown access?
- Is light rail or parking more important?
- Will employees commute from multiple Sacramento suburbs?
- Would Natomas or Rancho Cordova reduce cost and parking friction?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Local Service Business

- Profile: 2,500 sqft Retail in Sacramento
- Priorities: customer visits, visibility, neighborhood accessibility, customer parking
- Expected direction: Favor customer-facing retail/service corridors with visibility and parking.
- Top recommendation: Roseville Commercial Core (Strong fit)
- Secondary recommendation: Midtown Sacramento
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Roseville Commercial Core - Strong fit: Strong fit for retail and restaurant users that benefit from Roseville's regional shopping base, suburban customer access, and co-tenancy.
- 2. Midtown Sacramento - Strong fit: Strong fit for restaurants, wellness, boutique retail, and local-service concepts that benefit from walkability, residential density, and evening/weekend activity.
- 3. Arden / Point West - Good fit: Good fit for service retail and restaurants serving office, medical, residential, and corridor traffic.

Why this differs:
- Matches expected directional nodes: roseville-commercial-core, midtown-sacramento, arden-point-west

Selection rationale:
- Roseville Commercial Core is recommended first because it is a strong fit for retail and restaurant users that benefit from Roseville's regional shopping base, suburban customer access, and co-tenancy. It aligns with the profile priorities around customer visits, visibility, and customer parking. The strongest supporting signals are regional retail base, parking, and I-80 access.

Matched priorities:
- customer visits
- visibility
- customer parking

Tradeoff summary:
- site visibility and parking are still site-specific

Alternative rationale:
- Midtown Sacramento remains relevant because it is a strong fit for restaurants, wellness, boutique retail, and local-service concepts that benefit from walkability, residential density, and evening/weekend activity. Roseville Commercial Core appears to fit the initial profile more directly, while Midtown Sacramento is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Are your customers, patients, or employees concentrated in Placer County?
- Is parking a top priority?
- Do you need regional retail visibility?
- Would Rocklin or Folsom better match cost, image, or commute patterns?

Strengths surfaced:
- regional retail base
- parking
- I-80 access
- medical and professional-service demand
- walkability
- restaurant and retail energy

Tradeoffs surfaced:
- site visibility and parking are still site-specific
- parking and visibility vary block by block
- co-tenancy and visibility are site-specific

Questions to validate:
- Are your customers, patients, or employees concentrated in Placer County?
- Is parking a top priority?
- Do you need regional retail visibility?
- Would Rocklin or Folsom better match cost, image, or commute patterns?

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

Sacramento pilot metadata is stored in `_data/recommendationQaStatus.js`.

