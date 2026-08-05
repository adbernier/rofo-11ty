# Orange County Recommendation QA Pilot

Generated: 2026-08-05T00:10:22.582Z

This internal QA report validates whether Orange County Location Brief recommendations feel differentiated, explainable, defensible, and actionable using the current Commercial Location Knowledge Graph. It is not customer-facing content.

## Summary

- Scenarios reviewed: 13
- Scenarios passing baseline advisor-readiness checks: 13
- Scenarios needing review: 0
- Unique primary recommendations: 9
- Repeated primary recommendations: irvine-business-complex (3), south-coast-metro (2), anaheim-canyon (2)

Baseline checks require a primary recommendation, at least one expected directional match, meaningful tradeoffs, validation questions, and complete explainability fields. A pass does not mean the recommendation is final; it means the brief is credible enough for advisor review.

## Recommendation Diversity Check

The Orange County pilot produces meaningfully different primary recommendations across the QA scenarios.

## Editorial Broker Review

Editorial findings:
- Primary recommendations are broker-plausible across the 12 Orange County pilot scenarios after calibration. The QA set now separates technology HQ, research/R&D, airport-access professional office, coastal executive office, central OC client-facing office, medical, warehouse/flex, contractor, South OC flex/R&D support, and broad office searches.
- The clearest submarket distinctions are now visible: Irvine Spectrum is the technology/growth/R&D image path, Irvine Business Complex is the airport-access professional office path, University Research Park is the UC Irvine/research-adjacent path, South Coast Metro is the central OC office-retail/client-facing path, Newport Center is the coastal executive/client image path, and Tustin Legacy is the modern Irvine-edge medical/professional path.
- Recommendation diversity remains strong enough for an Enhancing metro: 12 scenarios produce 9 unique primary recommendations, with repeated primaries occurring only where the business profiles are commercially similar.
- The pilot continues to avoid treating John Wayne Airport Area as a standalone first-pass node. Airport access is expressed as a decision reason inside Irvine Business Complex, South Coast Metro, and Newport Center.
- Representative buildings reinforce Irvine Spectrum, Irvine Business Complex, South Coast Metro, Newport Center, Anaheim Canyon, Lake Forest Business Park, and South OC Medical & Professional. Tustin Legacy and Fullerton remain weaker because existing Rofo data does not yet provide enough verified district-specific building paths.

Calibration changes:
- Strengthened South Coast Metro's office fit from a generic strong professional-office node into an excellent central OC office-retail/client-facing node, so central OC finance/legal/amenity-driven searches do not drift to Newport by default.
- Sharpened Newport Center's role as a coastal executive, wealth management, legal, finance, and Newport client-proximity node, with tradeoffs around cost and countywide commute neutrality.
- Strengthened Irvine Spectrum and University Research Park wording for R&D, innovation, technical office, recruitment, amenities, and growth so R&D scenarios compare URP with Spectrum instead of drifting toward Irvine Business Complex.
- Clarified Irvine Business Complex as an airport-access professional office node with Von Karman/MacArthur office-core logic rather than a general-purpose Irvine recommendation for every office profile.
- Removed misleading 'coastal' keyword matches from non-Newport tradeoffs. Those tradeoffs now refer to Newport Beach executive image, which preserves the distinction without making non-coastal nodes score as coastal matches.
- Reviewed representative buildings for Tustin Legacy, Fullerton, and Lake Forest Business Park. No fabricated buildings were added; Tustin Legacy and Fullerton remain documented depth gaps because available resolved paths are limited or not district-specific enough.

QA comparison before vs after:
- Before K1.1, the South Coast Metro client-facing office scenario was directionally passing but Newport/South Coast differentiation was not sharp enough.
- After K1.1, South Coast Metro leads central OC client-facing professional-office scenarios, while Newport Center leads coastal executive wealth-management/legal scenarios.
- Before K1.1, the University Research Park R&D scenario used Irvine Business Complex as the secondary comparison.
- After K1.1, University Research Park compares against Irvine Spectrum first, which is more commercially plausible for R&D/innovation users.
- No Sacramento or San Diego recommendation regressions were introduced; both suites continue passing baseline QA.

Remaining weaknesses:
- Representative-building depth is the main readiness blocker. Tustin Legacy needs verified district-specific building examples, and Fullerton needs resolved building paths rather than only generic representative cards.
- A human Orange County broker should still validate whether South Coast Metro versus Newport Center and Irvine Business Complex versus Irvine Spectrum read correctly for real tenant profiles.
- Second-pass nodes such as Costa Mesa, Downtown Santa Ana, Brea, Huntington Beach, Foothill Ranch, Anaheim Platinum Triangle, Orange, Buena Park, and Garden Grove should be added only after specific recommendation gaps justify them.
- Retail and medical-office coverage should be calibrated with real Location Brief demand before marking Orange County Compass Ready.

Compass readiness recommendation:
- Orange County should remain Enhancing after K1.1. Recommendations are now more differentiated and advisor-quality, and QA passes without Sacramento or San Diego regressions. The blocker is representative-building sufficiency, especially for Tustin Legacy and Fullerton, plus one more broker review pass against real Orange County tenant profiles before Compass Ready.

## Scenario Reviews

### Irvine Technology HQ

- Profile: 12,000 sqft Office in Orange County
- Priorities: technology company, corporate image, growth flexibility, amenities, Irvine
- Expected direction: Favor modern Irvine corporate and technology districts before client-facing coastal or North OC industrial alternatives.
- Top recommendation: Irvine Spectrum (Excellent fit)
- Secondary recommendation: South Coast Metro
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Irvine Spectrum - Excellent fit: Excellent fit for corporate office, technology, growth-company, and regional headquarters users that want a modern Irvine business district with polished buildings, recruitment amenities, parking, and expansion flexibility.
- 2. South Coast Metro - Excellent fit: Excellent fit for client-facing professional services, regional offices, finance, legal, consulting, and companies that value central Orange County access, South Coast Plaza amenities, and an office-retail context.
- 3. Newport Center - Excellent fit: Excellent fit for executive office, wealth management, law, finance, consulting, and client-facing professional services that value coastal Orange County image and Newport client proximity over countywide commute neutrality.

Why this differs:
- Matches expected directional nodes: irvine-spectrum

Selection rationale:
- Irvine Spectrum is recommended first because it is a excellent fit for corporate office, technology, growth-company, and regional headquarters users that want a modern Irvine business district with polished buildings, recruitment amenities, parking, and expansion flexibility. It aligns with the profile priorities around technology company, corporate image, and growth flexibility. The strongest supporting signals are modern corporate office identity, technology and R&D-adjacent environment, and mixed-use amenities.

Matched priorities:
- technology company
- corporate image
- growth flexibility
- amenities

Tradeoff summary:
- often more image- and amenity-driven than lower-cost central OC alternatives

Alternative rationale:
- South Coast Metro remains relevant because it is a excellent fit for client-facing professional services, regional offices, finance, legal, consulting, and companies that value central Orange County access, South Coast Plaza amenities, and an office-retail context. Irvine Spectrum appears to fit the initial profile more directly, while South Coast Metro is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is Irvine corporate image or lower occupancy cost more important?
- Do you need office, R&D, flex, technical office, or light industrial functionality?
- How important are amenities and employee recruitment?
- Would Irvine Business Complex, South Coast Metro, University Research Park, or Lake Forest better fit access, cost, or technical needs?

Strengths surfaced:
- modern corporate office identity
- technology and R&D-adjacent environment
- mixed-use amenities
- I-5 and Irvine Center Drive access
- central Orange County access
- office-retail core

Tradeoffs surfaced:
- often more image- and amenity-driven than lower-cost central OC alternatives
- airport-access users may prefer Irvine Business Complex
- less Irvine technology identity than Irvine Spectrum
- less Newport Beach executive image than Newport Center
- less direct airport orientation than Irvine Business Complex
- less cost-efficient than many central OC alternatives

Questions to validate:
- Is Irvine corporate image or lower occupancy cost more important?
- Do you need office, R&D, flex, technical office, or light industrial functionality?
- How important are amenities and employee recruitment?
- Would Irvine Business Complex, South Coast Metro, University Research Park, or Lake Forest better fit access, cost, or technical needs?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### University Research Park R&D / Innovation User

- Profile: 9,000 sqft R&D in Orange County
- Priorities: R&D, innovation, UC Irvine adjacency, technical users, parking important
- Expected direction: Favor UC Irvine-adjacent research and Irvine technology/R&D districts before airport office or executive office.
- Top recommendation: University Research Park (Good fit)
- Secondary recommendation: Irvine Spectrum
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. University Research Park - Good fit: Good fit for research-adjacent office users, technology teams, and companies that value proximity to UC Irvine and a quieter business-park setting.
- 2. Irvine Spectrum - Excellent fit: Excellent fit for corporate office, technology, growth-company, and regional headquarters users that want a modern Irvine business district with polished buildings, recruitment amenities, parking, and expansion flexibility.
- 3. Irvine Business Complex - Excellent fit: Excellent fit for airport-access professional services, regional offices, corporate teams, and client-facing users that value central Orange County access near John Wayne Airport and the Von Karman/MacArthur office core.

Why this differs:
- Matches expected directional nodes: university-research-park, irvine-spectrum

Selection rationale:
- University Research Park is recommended first because it is a good fit for research-adjacent office users, technology teams, and companies that value proximity to UC Irvine and a quieter business-park setting. It aligns with the profile priorities around R&D, innovation, and UC Irvine adjacency. The strongest supporting signals are UC Irvine adjacency, research and innovation context, and business-park formats.

Matched priorities:
- R&D
- innovation
- UC Irvine adjacency
- technical users

Tradeoff summary:
- less visible and mixed-use than Irvine Spectrum

Alternative rationale:
- Irvine Spectrum remains relevant because it is a excellent fit for corporate office, technology, growth-company, and regional headquarters users that want a modern Irvine business district with polished buildings, recruitment amenities, parking, and expansion flexibility. University Research Park appears to fit the initial profile more directly, while Irvine Spectrum is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is UC Irvine or research adjacency important?
- Do you need R&D, technical office, lab-adjacent, or standard office space?
- Is a quieter business-park setting acceptable?
- Would Irvine Spectrum provide stronger amenities and corporate image, or would Irvine Business Complex provide better airport access?

Strengths surfaced:
- UC Irvine adjacency
- research and innovation context
- business-park formats
- parking and campus-like setting
- modern corporate office identity
- technology and R&D-adjacent environment

Tradeoffs surfaced:
- less visible and mixed-use than Irvine Spectrum
- less airport-access oriented than Irvine Business Complex
- often more image- and amenity-driven than lower-cost central OC alternatives
- airport-access users may prefer Irvine Business Complex
- less technology/R&D-oriented than Irvine Spectrum or University Research Park
- less Newport Beach executive image than Newport Center

Questions to validate:
- Is UC Irvine or research adjacency important?
- Do you need R&D, technical office, lab-adjacent, or standard office space?
- Is a quieter business-park setting acceptable?
- Would Irvine Spectrum provide stronger amenities and corporate image, or would Irvine Business Complex provide better airport access?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Focused Irvine Business Complex Professional Office

- Profile: 6,500 sqft Office in Irvine Business Complex
- Priorities: professional services, airport access, client meetings, central Orange County, parking important
- Expected direction: Treat Irvine Business Complex as the target geography and keep alternatives as contingency context rather than the main recommendation path.
- Top recommendation: Irvine Business Complex (Excellent fit)
- Secondary recommendation: Irvine Spectrum
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Irvine Business Complex - Excellent fit: Excellent fit for airport-access professional services, regional offices, corporate teams, and client-facing users that value central Orange County access near John Wayne Airport and the Von Karman/MacArthur office core.

Why this differs:
- Matches expected directional nodes: irvine-business-complex

Selection rationale:
- Irvine Business Complex is recommended first because it is a excellent fit for airport-access professional services, regional offices, corporate teams, and client-facing users that value central Orange County access near John Wayne Airport and the Von Karman/MacArthur office core. It aligns with the profile priorities around professional services, airport access, and client meetings. The strongest supporting signals are John Wayne airport access, central Orange County office location, and Von Karman and MacArthur office context.

Matched priorities:
- professional services
- airport access
- client meetings
- central Orange County

Tradeoff summary:
- less technology/R&D-oriented than Irvine Spectrum or University Research Park

Alternative rationale:
- Irvine Spectrum may be relevant as a comparison or contingency because More technology, R&D, and modern mixed business-district environment.

Validation focus:
- Is John Wayne Airport access important for executives, clients, or regional travel?
- Do you need a central OC address, airport access, or Irvine technology identity?
- Will clients visit regularly?
- Would Irvine Spectrum, South Coast Metro, or Newport Center better fit image, commute, amenities, or customer access?

Strengths surfaced:
- John Wayne airport access
- central Orange County office location
- Von Karman and MacArthur office context
- professional-service and client access

Tradeoffs surfaced:
- less technology/R&D-oriented than Irvine Spectrum or University Research Park
- less Newport Beach executive image than Newport Center
- less retail-amenity-oriented than South Coast Metro

Questions to validate:
- Is John Wayne Airport access important for executives, clients, or regional travel?
- Do you need a central OC address, airport access, or Irvine technology identity?
- Will clients visit regularly?
- Would Irvine Spectrum, South Coast Metro, or Newport Center better fit image, commute, amenities, or customer access?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Irvine Business Complex Airport-Access Professional Services

- Profile: 6,500 sqft Office in Orange County
- Priorities: professional services, airport access, client meetings, central Orange County, parking important
- Expected direction: Favor airport-access professional office and central OC client-facing options.
- Top recommendation: Irvine Business Complex (Excellent fit)
- Secondary recommendation: South Coast Metro
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Irvine Business Complex - Excellent fit: Excellent fit for airport-access professional services, regional offices, corporate teams, and client-facing users that value central Orange County access near John Wayne Airport and the Von Karman/MacArthur office core.
- 2. South Coast Metro - Excellent fit: Excellent fit for client-facing professional services, regional offices, finance, legal, consulting, and companies that value central Orange County access, South Coast Plaza amenities, and an office-retail context.
- 3. Newport Center - Excellent fit: Excellent fit for executive office, wealth management, law, finance, consulting, and client-facing professional services that value coastal Orange County image and Newport client proximity over countywide commute neutrality.

Why this differs:
- Matches expected directional nodes: irvine-business-complex, south-coast-metro, newport-center

Selection rationale:
- Irvine Business Complex is recommended first because it is a excellent fit for airport-access professional services, regional offices, corporate teams, and client-facing users that value central Orange County access near John Wayne Airport and the Von Karman/MacArthur office core. It aligns with the profile priorities around professional services, airport access, and client meetings. The strongest supporting signals are John Wayne airport access, central Orange County office location, and Von Karman and MacArthur office context.

Matched priorities:
- professional services
- airport access
- client meetings
- central Orange County

Tradeoff summary:
- less technology/R&D-oriented than Irvine Spectrum or University Research Park

Alternative rationale:
- South Coast Metro remains relevant because it is a excellent fit for client-facing professional services, regional offices, finance, legal, consulting, and companies that value central Orange County access, South Coast Plaza amenities, and an office-retail context. Irvine Business Complex appears to fit the initial profile more directly, while South Coast Metro is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is John Wayne Airport access important for executives, clients, or regional travel?
- Do you need a central OC address, airport access, or Irvine technology identity?
- Will clients visit regularly?
- Would Irvine Spectrum, South Coast Metro, or Newport Center better fit image, commute, amenities, or customer access?

Strengths surfaced:
- John Wayne airport access
- central Orange County office location
- Von Karman and MacArthur office context
- professional-service and client access
- central Orange County access
- office-retail core

Tradeoffs surfaced:
- less technology/R&D-oriented than Irvine Spectrum or University Research Park
- less Newport Beach executive image than Newport Center
- less retail-amenity-oriented than South Coast Metro
- less Irvine technology identity than Irvine Spectrum
- less direct airport orientation than Irvine Business Complex
- less cost-efficient than many central OC alternatives

Questions to validate:
- Is John Wayne Airport access important for executives, clients, or regional travel?
- Do you need a central OC address, airport access, or Irvine technology identity?
- Will clients visit regularly?
- Would Irvine Spectrum, South Coast Metro, or Newport Center better fit image, commute, amenities, or customer access?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Newport Center Wealth Management / Legal Office

- Profile: 4,000 sqft Office in Orange County
- Priorities: wealth management, legal office, executive image, client meetings, coastal
- Expected direction: Favor coastal executive office and client-facing professional-service markets.
- Top recommendation: Newport Center (Excellent fit)
- Secondary recommendation: South Coast Metro
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Newport Center - Excellent fit: Excellent fit for executive office, wealth management, law, finance, consulting, and client-facing professional services that value coastal Orange County image and Newport client proximity over countywide commute neutrality.
- 2. South Coast Metro - Excellent fit: Excellent fit for client-facing professional services, regional offices, finance, legal, consulting, and companies that value central Orange County access, South Coast Plaza amenities, and an office-retail context.
- 3. Irvine Business Complex - Excellent fit: Excellent fit for airport-access professional services, regional offices, corporate teams, and client-facing users that value central Orange County access near John Wayne Airport and the Von Karman/MacArthur office core.

Why this differs:
- Matches expected directional nodes: newport-center, south-coast-metro, irvine-business-complex

Selection rationale:
- Newport Center is recommended first because it is a excellent fit for executive office, wealth management, law, finance, consulting, and client-facing professional services that value coastal Orange County image and Newport client proximity over countywide commute neutrality. It aligns with the profile priorities around wealth management, legal office, and executive image. The strongest supporting signals are coastal executive office image, Newport client-facing professional environment, and Fashion Island and Newport Center amenities.

Matched priorities:
- wealth management
- legal office
- executive image
- client meetings

Tradeoff summary:
- less cost-efficient than many central OC alternatives

Alternative rationale:
- South Coast Metro remains relevant because it is a excellent fit for client-facing professional services, regional offices, finance, legal, consulting, and companies that value central Orange County access, South Coast Plaza amenities, and an office-retail context. Newport Center appears to fit the initial profile more directly, while South Coast Metro is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is coastal executive image important enough to justify tradeoffs?
- How often do clients visit?
- Is proximity to Newport customers or advisors important?
- Would South Coast Metro or Irvine Business Complex provide better cost, airport access, amenities, or employee commute?

Strengths surfaced:
- coastal executive office image
- Newport client-facing professional environment
- Fashion Island and Newport Center amenities
- MacArthur corridor access
- central Orange County access
- office-retail core

Tradeoffs surfaced:
- less cost-efficient than many central OC alternatives
- less R&D or flex-oriented than Irvine Spectrum
- less central for countywide employee commutes than South Coast Metro or Irvine Business Complex
- less Irvine technology identity than Irvine Spectrum
- less Newport Beach executive image than Newport Center
- less direct airport orientation than Irvine Business Complex

Questions to validate:
- Is coastal executive image important enough to justify tradeoffs?
- How often do clients visit?
- Is proximity to Newport customers or advisors important?
- Would South Coast Metro or Irvine Business Complex provide better cost, airport access, amenities, or employee commute?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### South Coast Metro Client-Facing Professional Office

- Profile: 8,000 sqft Office in Orange County
- Priorities: client-facing, central OC, professional image, retail amenities, finance
- Expected direction: Favor central Orange County professional office and office-retail context over pure R&D or industrial alternatives.
- Top recommendation: South Coast Metro (Excellent fit)
- Secondary recommendation: Newport Center
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. South Coast Metro - Excellent fit: Excellent fit for client-facing professional services, regional offices, finance, legal, consulting, and companies that value central Orange County access, South Coast Plaza amenities, and an office-retail context.
- 2. Newport Center - Excellent fit: Excellent fit for executive office, wealth management, law, finance, consulting, and client-facing professional services that value coastal Orange County image and Newport client proximity over countywide commute neutrality.
- 3. Irvine Business Complex - Excellent fit: Excellent fit for airport-access professional services, regional offices, corporate teams, and client-facing users that value central Orange County access near John Wayne Airport and the Von Karman/MacArthur office core.

Why this differs:
- Matches expected directional nodes: south-coast-metro, irvine-business-complex, newport-center

Selection rationale:
- South Coast Metro is recommended first because it is a excellent fit for client-facing professional services, regional offices, finance, legal, consulting, and companies that value central Orange County access, South Coast Plaza amenities, and an office-retail context. It aligns with the profile priorities around client-facing, central OC, and professional image. The strongest supporting signals are central Orange County access, office-retail core, and South Coast Plaza and amenity context.

Matched priorities:
- client-facing
- central OC
- professional image
- retail amenities

Tradeoff summary:
- less Irvine technology identity than Irvine Spectrum

Alternative rationale:
- Newport Center remains relevant because it is a excellent fit for executive office, wealth management, law, finance, consulting, and client-facing professional services that value coastal Orange County image and Newport client proximity over countywide commute neutrality. South Coast Metro appears to fit the initial profile more directly, while Newport Center is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do clients visit often?
- Is central OC access more important than Irvine technology identity or coastal image?
- Does South Coast Plaza and retail-amenity adjacency matter for employees or customers?
- Would Irvine Business Complex, Newport Center, or Irvine Spectrum better match airport access, executive image, commute, or industry context?

Strengths surfaced:
- central Orange County access
- office-retail core
- South Coast Plaza and amenity context
- client-facing finance and legal office environment
- coastal executive office image
- Newport client-facing professional environment

Tradeoffs surfaced:
- less Irvine technology identity than Irvine Spectrum
- less Newport Beach executive image than Newport Center
- less direct airport orientation than Irvine Business Complex
- less cost-efficient than many central OC alternatives
- less R&D or flex-oriented than Irvine Spectrum
- less central for countywide employee commutes than South Coast Metro or Irvine Business Complex

Questions to validate:
- Do clients visit often?
- Is central OC access more important than Irvine technology identity or coastal image?
- Does South Coast Plaza and retail-amenity adjacency matter for employees or customers?
- Would Irvine Business Complex, Newport Center, or Irvine Spectrum better match airport access, executive image, commute, or industry context?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Tustin Legacy Medical Office

- Profile: 5,500 sqft Medical in Orange County
- Priorities: medical office, patient visits, parking important, Irvine-edge, modern mixed-use
- Expected direction: Favor modern medical/professional office settings with patient access and parking.
- Top recommendation: Tustin Legacy (Strong fit)
- Secondary recommendation: South OC Medical & Professional
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Tustin Legacy - Strong fit: Strong fit for medical, wellness, and healthcare-adjacent office users that value modern formats, parking, and central/south OC patient access.
- 2. South OC Medical & Professional - Strong fit: Strong fit for medical, specialty healthcare, wellness, and patient-facing professional users serving South Orange County geographies.
- 3. Irvine Business Complex - Good fit: Good fit for medical and specialty office users that need central Orange County access, parking, and proximity to professional office demand.

Why this differs:
- Matches expected directional nodes: tustin-legacy, south-oc-medical-professional

Selection rationale:
- Tustin Legacy is recommended first because it is a strong fit for medical, wellness, and healthcare-adjacent office users that value modern formats, parking, and central/south OC patient access. It aligns with the profile priorities around medical office, patient visits, and parking important. The strongest supporting signals are modern mixed-use context, central/south OC access, and medical and professional-service fit.

Matched priorities:
- medical office
- patient visits
- parking important
- Irvine-edge

Tradeoff summary:
- patient referral geography should be compared with South OC and South Coast Metro

Alternative rationale:
- South OC Medical & Professional remains relevant because it is a strong fit for medical, specialty healthcare, wellness, and patient-facing professional users serving South Orange County geographies. Tustin Legacy appears to fit the initial profile more directly, while South OC Medical & Professional is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is medical/patient access part of the search?
- Do you need Irvine image or a more practical Irvine-edge location?
- Is parking a top priority?
- Would Irvine Spectrum, Irvine Business Complex, South Coast Metro, or South OC Medical & Professional fit the profile better?

Strengths surfaced:
- modern mixed-use context
- central/south OC access
- medical and professional-service fit
- parking
- South OC patient and customer access
- local-service office environment

Tradeoffs surfaced:
- patient referral geography should be compared with South OC and South Coast Metro
- less executive business image than Newport Center
- less central to countywide users than South Coast Metro or Irvine
- patient geography and building access should be validated

Questions to validate:
- Is medical/patient access part of the search?
- Do you need Irvine image or a more practical Irvine-edge location?
- Is parking a top priority?
- Would Irvine Spectrum, Irvine Business Complex, South Coast Metro, or South OC Medical & Professional fit the profile better?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### South OC Specialty Medical Office

- Profile: 3,500 sqft Medical in Orange County
- Priorities: specialty clinic, South Orange County, patient parking, easy access, wellness
- Expected direction: Favor South OC medical and professional-service geography rather than countywide corporate office.
- Top recommendation: South OC Medical & Professional (Strong fit)
- Secondary recommendation: Tustin Legacy
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. South OC Medical & Professional - Strong fit: Strong fit for medical, specialty healthcare, wellness, and patient-facing professional users serving South Orange County geographies.
- 2. Tustin Legacy - Strong fit: Strong fit for medical, wellness, and healthcare-adjacent office users that value modern formats, parking, and central/south OC patient access.
- 3. Irvine Business Complex - Good fit: Good fit for medical and specialty office users that need central Orange County access, parking, and proximity to professional office demand.

Why this differs:
- Matches expected directional nodes: south-oc-medical-professional, tustin-legacy

Selection rationale:
- South OC Medical & Professional is recommended first because it is a strong fit for medical, specialty healthcare, wellness, and patient-facing professional users serving South Orange County geographies. It aligns with the profile priorities around specialty clinic, South Orange County, and patient parking. The strongest supporting signals are South OC patient and customer access, medical and professional-service fit, and parking.

Matched priorities:
- specialty clinic
- South Orange County
- patient parking
- easy access

Tradeoff summary:
- less executive business image than Newport Center

Alternative rationale:
- Tustin Legacy remains relevant because it is a strong fit for medical, wellness, and healthcare-adjacent office users that value modern formats, parking, and central/south OC patient access. South OC Medical & Professional appears to fit the initial profile more directly, while Tustin Legacy is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Are patients or customers concentrated in South Orange County?
- How important is parking and easy access?
- Do you need medical-office functionality, wellness space, or general professional office?
- Would Tustin Legacy, Newport Center, South Coast Metro, or Lake Forest better fit image, patient geography, or operations?

Strengths surfaced:
- South OC patient and customer access
- medical and professional-service fit
- parking
- local-service office environment
- modern mixed-use context
- central/south OC access

Tradeoffs surfaced:
- less executive business image than Newport Center
- less central to countywide users than South Coast Metro or Irvine
- patient referral geography should be compared with South OC and South Coast Metro
- patient geography and building access should be validated

Questions to validate:
- Are patients or customers concentrated in South Orange County?
- How important is parking and easy access?
- Do you need medical-office functionality, wellness space, or general professional office?
- Would Tustin Legacy, Newport Center, South Coast Metro, or Lake Forest better fit image, patient geography, or operations?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Anaheim Canyon Warehouse / Flex

- Profile: 25,000 sqft Warehouse in Orange County
- Priorities: warehouse, truck access, loading, North OC, contractor operations
- Expected direction: Favor North OC industrial and warehouse/flex districts over Irvine office or coastal professional markets.
- Top recommendation: Anaheim Canyon (Strong fit)
- Secondary recommendation: Fullerton
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Anaheim Canyon - Strong fit: Strong fit for warehouse/flex and service operations needing North OC access, loading, and industrial utility.
- 2. Fullerton - Good fit: Good fit for smaller warehouse and service operations in a North OC context.
- 3. Lake Forest Business Park - Good fit: Good fit for smaller warehouse/flex and service operations serving South OC customers.

Why this differs:
- Matches expected directional nodes: anaheim-canyon, fullerton, lake-forest-business-park

Selection rationale:
- Anaheim Canyon is recommended first because it is a strong fit for warehouse/flex and service operations needing North OC access, loading, and industrial utility. It aligns with the profile priorities around warehouse, truck access, and loading. The strongest supporting signals are North OC industrial/flex utility, La Palma and Anaheim Canyon industrial corridors, and freeway-oriented access.

Matched priorities:
- warehouse
- truck access
- loading
- North OC

Tradeoff summary:
- larger regional logistics may compare Inland Empire or LA industrial alternatives

Alternative rationale:
- Fullerton remains relevant because it is a good fit for smaller warehouse and service operations in a North OC context. Anaheim Canyon appears to fit the initial profile more directly, while Fullerton is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do you need loading, truck access, warehouse/flex, manufacturing, or contractor-friendly operations?
- Is North OC geography important for labor, customers, or suppliers?
- Do you need showroom/customer visibility or pure industrial utility?
- Would Fullerton, Lake Forest Business Park, Brea, or Inland Empire alternatives better fit the operation?

Strengths surfaced:
- North OC industrial/flex utility
- La Palma and Anaheim Canyon industrial corridors
- freeway-oriented access
- contractor and manufacturing support
- North OC industrial/service market
- local office and service-commercial mix

Tradeoffs surfaced:
- larger regional logistics may compare Inland Empire or LA industrial alternatives
- large warehouse requirements may need Anaheim Canyon or Inland Empire alternatives
- large logistics users should compare Anaheim Canyon, Inland Empire, or LA industrial alternatives

Questions to validate:
- Do you need loading, truck access, warehouse/flex, manufacturing, or contractor-friendly operations?
- Is North OC geography important for labor, customers, or suppliers?
- Do you need showroom/customer visibility or pure industrial utility?
- Would Fullerton, Lake Forest Business Park, Brea, or Inland Empire alternatives better fit the operation?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Fullerton Contractor / Service Industrial

- Profile: 7,500 sqft Flex in Orange County
- Priorities: contractor, service vehicles, North OC, lower cost, loading
- Expected direction: Favor practical North OC industrial/flex and contractor-friendly alternatives.
- Top recommendation: Anaheim Canyon (Strong fit)
- Secondary recommendation: Fullerton
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Anaheim Canyon - Strong fit: Strong fit for flex users combining office, storage, showroom, light production, or contractor operations.
- 2. Fullerton - Strong fit: Strong fit for smaller flex and light industrial users serving North OC customers.
- 3. Lake Forest Business Park - Strong fit: Strong fit for office/flex, R&D support, and technical service users that need South OC access, parking, and practical buildings.

Why this differs:
- Matches expected directional nodes: fullerton, anaheim-canyon, lake-forest-business-park

Selection rationale:
- Anaheim Canyon is recommended first because it is a strong fit for flex users combining office, storage, showroom, light production, or contractor operations. It aligns with the profile priorities around contractor, service vehicles, and North OC. The strongest supporting signals are North OC industrial/flex utility, La Palma and Anaheim Canyon industrial corridors, and freeway-oriented access.

Matched priorities:
- contractor
- service vehicles
- North OC
- lower cost

Tradeoff summary:
- not an executive office district

Alternative rationale:
- Fullerton remains relevant because it is a strong fit for smaller flex and light industrial users serving North OC customers. Anaheim Canyon appears to fit the initial profile more directly, while Fullerton is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do you need loading, truck access, warehouse/flex, manufacturing, or contractor-friendly operations?
- Is North OC geography important for labor, customers, or suppliers?
- Do you need showroom/customer visibility or pure industrial utility?
- Would Fullerton, Lake Forest Business Park, Brea, or Inland Empire alternatives better fit the operation?

Strengths surfaced:
- North OC industrial/flex utility
- La Palma and Anaheim Canyon industrial corridors
- freeway-oriented access
- contractor and manufacturing support
- North OC industrial/service market
- local office and service-commercial mix

Tradeoffs surfaced:
- not an executive office district
- larger logistics users should compare Anaheim Canyon
- less polished than Irvine Spectrum or University Research Park

Questions to validate:
- Do you need loading, truck access, warehouse/flex, manufacturing, or contractor-friendly operations?
- Is North OC geography important for labor, customers, or suppliers?
- Do you need showroom/customer visibility or pure industrial utility?
- Would Fullerton, Lake Forest Business Park, Brea, or Inland Empire alternatives better fit the operation?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Lake Forest Flex / R&D Support

- Profile: 10,000 sqft Flex in Orange County
- Priorities: South OC, flex, R&D support, parking important, practical business park
- Expected direction: Favor South OC flex/R&D-support geography while comparing Irvine Spectrum and University Research Park for stronger image or innovation context.
- Top recommendation: Lake Forest Business Park (Strong fit)
- Secondary recommendation: Anaheim Canyon
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Lake Forest Business Park - Strong fit: Strong fit for office/flex, R&D support, and technical service users that need South OC access, parking, and practical buildings.
- 2. Anaheim Canyon - Strong fit: Strong fit for flex users combining office, storage, showroom, light production, or contractor operations.
- 3. Irvine Spectrum - Strong fit: Strong fit for office/flex and R&D-support users that want Irvine business-park formats near the Spectrum employment and amenity base.

Why this differs:
- Matches expected directional nodes: lake-forest-business-park, irvine-spectrum

Selection rationale:
- Lake Forest Business Park is recommended first because it is a strong fit for office/flex, R&D support, and technical service users that need South OC access, parking, and practical buildings. It aligns with the profile priorities around South OC, flex, and R&D support. The strongest supporting signals are South OC business-park utility, industrial/flex formats, and parking and freeway access.

Matched priorities:
- South OC
- flex
- R&D support
- parking important

Tradeoff summary:
- less polished than Irvine Spectrum or University Research Park

Alternative rationale:
- Anaheim Canyon remains relevant because it is a strong fit for flex users combining office, storage, showroom, light production, or contractor operations. Lake Forest Business Park appears to fit the initial profile more directly, while Anaheim Canyon is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do you need South OC geography for employees or customers?
- Do you need loading, flex, R&D support, or light industrial capability?
- Is practical operating utility more important than corporate image?
- Would Irvine Spectrum, University Research Park, Anaheim Canyon, or Fullerton better fit image, access, or operations?

Strengths surfaced:
- South OC business-park utility
- industrial/flex formats
- parking and freeway access
- practical operating environment
- North OC industrial/flex utility
- La Palma and Anaheim Canyon industrial corridors

Tradeoffs surfaced:
- less polished than Irvine Spectrum or University Research Park
- not an executive office district
- heavier industrial users should compare Anaheim Canyon, Fullerton, or Lake Forest Business Park

Questions to validate:
- Do you need South OC geography for employees or customers?
- Do you need loading, flex, R&D support, or light industrial capability?
- Is practical operating utility more important than corporate image?
- Would Irvine Spectrum, University Research Park, Anaheim Canyon, or Fullerton better fit image, access, or operations?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Executive Office Deciding Between Newport and Irvine

- Profile: 5,000 sqft Office in Orange County
- Priorities: executive image, clients visit, Irvine or Newport, professional services, amenities
- Expected direction: Compare coastal executive image with Irvine and central OC professional office alternatives.
- Top recommendation: South Coast Metro (Excellent fit)
- Secondary recommendation: Newport Center
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. South Coast Metro - Excellent fit: Excellent fit for client-facing professional services, regional offices, finance, legal, consulting, and companies that value central Orange County access, South Coast Plaza amenities, and an office-retail context.
- 2. Newport Center - Excellent fit: Excellent fit for executive office, wealth management, law, finance, consulting, and client-facing professional services that value coastal Orange County image and Newport client proximity over countywide commute neutrality.
- 3. Irvine Spectrum - Excellent fit: Excellent fit for corporate office, technology, growth-company, and regional headquarters users that want a modern Irvine business district with polished buildings, recruitment amenities, parking, and expansion flexibility.

Why this differs:
- Matches expected directional nodes: newport-center, south-coast-metro, irvine-spectrum

Selection rationale:
- South Coast Metro is recommended first because it is a excellent fit for client-facing professional services, regional offices, finance, legal, consulting, and companies that value central Orange County access, South Coast Plaza amenities, and an office-retail context. It aligns with the profile priorities around executive image, clients visit, and Irvine or Newport. The strongest supporting signals are central Orange County access, office-retail core, and South Coast Plaza and amenity context.

Matched priorities:
- executive image
- clients visit
- Irvine or Newport
- professional services

Tradeoff summary:
- less Irvine technology identity than Irvine Spectrum

Alternative rationale:
- Newport Center remains relevant because it is a excellent fit for executive office, wealth management, law, finance, consulting, and client-facing professional services that value coastal Orange County image and Newport client proximity over countywide commute neutrality. South Coast Metro appears to fit the initial profile more directly, while Newport Center is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Do clients visit often?
- Is central OC access more important than Irvine technology identity or coastal image?
- Does South Coast Plaza and retail-amenity adjacency matter for employees or customers?
- Would Irvine Business Complex, Newport Center, or Irvine Spectrum better match airport access, executive image, commute, or industry context?

Strengths surfaced:
- central Orange County access
- office-retail core
- South Coast Plaza and amenity context
- client-facing finance and legal office environment
- coastal executive office image
- Newport client-facing professional environment

Tradeoffs surfaced:
- less Irvine technology identity than Irvine Spectrum
- less Newport Beach executive image than Newport Center
- less direct airport orientation than Irvine Business Complex
- less cost-efficient than many central OC alternatives
- less R&D or flex-oriented than Irvine Spectrum
- less central for countywide employee commutes than South Coast Metro or Irvine Business Complex

Questions to validate:
- Do clients visit often?
- Is central OC access more important than Irvine technology identity or coastal image?
- Does South Coast Plaza and retail-amenity adjacency matter for employees or customers?
- Would Irvine Business Complex, Newport Center, or Irvine Spectrum better match airport access, executive image, commute, or industry context?

Graph weaknesses exposed:
- No blocking gap exposed by this scenario. Continue broker review for nuance and representative building depth.

### Orange County Broad Office Search

- Profile: 10,000 sqft Office in Orange County
- Priorities: regional office, employee commute, parking important, client access, growth flexibility
- Expected direction: Return a balanced Orange County office path rather than over-routing every broad office search to Irvine Spectrum.
- Top recommendation: Irvine Business Complex (Excellent fit)
- Secondary recommendation: Newport Center
- Confidence: High Confidence
- Baseline QA result: Pass
- Explanation quality: Pass

Recommended market path:
- 1. Irvine Business Complex - Excellent fit: Excellent fit for airport-access professional services, regional offices, corporate teams, and client-facing users that value central Orange County access near John Wayne Airport and the Von Karman/MacArthur office core.
- 2. Newport Center - Excellent fit: Excellent fit for executive office, wealth management, law, finance, consulting, and client-facing professional services that value coastal Orange County image and Newport client proximity over countywide commute neutrality.
- 3. South Coast Metro - Excellent fit: Excellent fit for client-facing professional services, regional offices, finance, legal, consulting, and companies that value central Orange County access, South Coast Plaza amenities, and an office-retail context.

Why this differs:
- Matches expected directional nodes: irvine-business-complex, south-coast-metro, newport-center

Selection rationale:
- Irvine Business Complex is recommended first because it is a excellent fit for airport-access professional services, regional offices, corporate teams, and client-facing users that value central Orange County access near John Wayne Airport and the Von Karman/MacArthur office core. It aligns with the profile priorities around regional office, parking important, and client access. The strongest supporting signals are John Wayne airport access, central Orange County office location, and Von Karman and MacArthur office context.

Matched priorities:
- regional office
- parking important
- client access
- growth flexibility

Tradeoff summary:
- less technology/R&D-oriented than Irvine Spectrum or University Research Park

Alternative rationale:
- Newport Center remains relevant because it is a excellent fit for executive office, wealth management, law, finance, consulting, and client-facing professional services that value coastal Orange County image and Newport client proximity over countywide commute neutrality. Irvine Business Complex appears to fit the initial profile more directly, while Newport Center is useful for pressure-testing assumptions around commute, cost, building format, or customer access.

Validation focus:
- Is John Wayne Airport access important for executives, clients, or regional travel?
- Do you need a central OC address, airport access, or Irvine technology identity?
- Will clients visit regularly?
- Would Irvine Spectrum, South Coast Metro, or Newport Center better fit image, commute, amenities, or customer access?

Strengths surfaced:
- John Wayne airport access
- central Orange County office location
- Von Karman and MacArthur office context
- professional-service and client access
- coastal executive office image
- Newport client-facing professional environment

Tradeoffs surfaced:
- less technology/R&D-oriented than Irvine Spectrum or University Research Park
- less Newport Beach executive image than Newport Center
- less retail-amenity-oriented than South Coast Metro
- less cost-efficient than many central OC alternatives
- less R&D or flex-oriented than Irvine Spectrum
- less central for countywide employee commutes than South Coast Metro or Irvine Business Complex

Questions to validate:
- Is John Wayne Airport access important for executives, clients, or regional travel?
- Do you need a central OC address, airport access, or Irvine technology identity?
- Will clients visit regularly?
- Would Irvine Spectrum, South Coast Metro, or Newport Center better fit image, commute, amenities, or customer access?

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

Orange County pilot metadata is stored in `_data/recommendationQaStatus.js`.
