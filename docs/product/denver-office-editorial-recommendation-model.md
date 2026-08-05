# Denver Office Editorial Recommendation Model

**Status:** Phase 1B structured model  
**Owner:** Product / Editorial  
**Audience:** Product, editorial, engineering, Publisher, EOS  
**Model key:** `denver:office`  
**Related files:** `_data/denverOfficeRecommendationModel.js`, `lib/recommendations/denver-office-recommendation-resolver.js`, `scripts/qa-denver-office-recommendation-model.js`, `_data/businessBriefDefinitions.js`, `docs/product/business-brief-publishing-system.md`

This document defines the first structured Denver Office editorial recommendation model. It supports public Business Brief readiness and future personalized Denver Location Briefs, but it does not change production recommendation scoring.

Rofo recommends where a Denver office user should begin looking. Brokers validate current availability, economics, buildings, lease terms, and transaction details.

## Scope

This model applies only to:

- Market: Denver
- Property type: Office
- Decision stage: top-of-funnel district shortlist

It does not recommend specific leases, live inventory, rents, concessions, landlord motivation, vacancies, lease economics, or building-specific transaction terms.

## Launch District Set

The default Denver Office starting set is:

- Downtown Denver
- LoDo
- RiNo
- Cherry Creek
- Denver Tech Center

This set reflects the smallest broad Denver office universe currently supported by the Knowledge Graph for generic office users. It separates central business identity, historic downtown-edge character, creative mixed-use office character, polished boutique client-facing office, and southeast corporate office scale.

The starting set is not ordered when only Denver and Office are known.

## Signal-Specific Alternatives

Central Park enters through healthcare, medical-office, northeast Denver, parking, administrative, or local-service signals. It is not a generic first-look Denver office district because the current evidence frames it more as a practical mixed commercial and medical/service office geography.

Santa Fe Arts District enters through creative, showroom, arts, lower-rise, or unconventional office signals. It is not a generic first-look office district because its office role is more selective and should not be confused with Denver's broader office cores.

## Stable District Roles

### Downtown Denver

Core identity: central civic, legal, finance, consulting, nonprofit, and regional office core.

Rises when: client access, professional image, transit, civic access, stakeholder access, or traditional office identity matters.

Falls when: the user strongly prefers creative informal character, parking-first suburban access, or southeast metro orientation.

Evidence: `_data/locationKnowledgeGraph.js` `downtown-denver`; representative buildings include 1200 17th St, 1600 Broadway, 1700 Lincoln St, and Denver Place.

### LoDo

Core identity: historic downtown-edge office district with Union Station, hospitality, and client access.

Rises when: transit, walkability, client access, historic/distinctive character, central-city access, nonprofit/stakeholder access, or creative professional identity matters.

Falls when: the user prioritizes southeast metro access, parking-first suburban scale, or highly conventional corporate campus context.

Evidence: `_data/locationKnowledgeGraph.js` `lodo`; representative buildings include 16 Market Square, 1550 Wewatta St, and 1615 Platte St.

### RiNo

Core identity: creative mixed-use office district for startups, design, showroom, and adaptive commercial users.

Rises when: technology, startup, creative, design, informal environment, amenities, or collaboration signals matter.

Falls when: the user needs formal legal/finance image, traditional professional character, or southeast corporate office scale.

Evidence: `_data/locationKnowledgeGraph.js` `rino`; representative buildings include Spaces Denver - Ballpark, 1615 Platte St, and 471 Kalamath St.

### Cherry Creek

Core identity: polished boutique, client-facing, retail-adjacent professional office district.

Rises when: client experience, polished professional image, boutique office character, healthcare/wellness context, or amenity-rich customer access matters.

Falls only when: a hard constraint makes the district incompatible. It usually remains a useful comparison for client-facing users.

Evidence: `_data/locationKnowledgeGraph.js` `cherry-creek`; representative buildings include 100 Fillmore Place, Spaces Fillmore Street, and 205 Detroit St.

### Denver Tech Center

Core identity: southeast corporate office and business-park district for parking, I-25 access, regional headquarters, and suburban scale.

Rises when: southeast metro orientation, parking, highway access, growth flexibility, modern polished office, corporate identity, or regional headquarters context matters.

Falls when: the user strongly prioritizes central-city walkability, downtown civic access, or creative informal office character.

Evidence: `_data/locationKnowledgeGraph.js` `denver-tech-center`; representative buildings include DTC Tech, 4643 S Ulster St, and DTC Corporate Center III.

### Central Park

Core identity: northeast Denver office, medical, service, and administrative district with parking-oriented access.

Enters when: healthcare, medical-office, administrative, northeast Denver, parking, freeway, or local-service signals matter.

Publication caution: Central Park is strong for healthcare/service signals, but Denver healthcare-office publishing still needs stronger comparison evidence before the Healthcare Organization Business Brief should be indexed.

Evidence: `_data/locationKnowledgeGraph.js` `central-park`; representative buildings include 3401 Quebec St and Northfield at Stapleton.

### Santa Fe Arts District

Core identity: creative, arts, showroom, and customer-facing commercial district with limited office-default role.

Enters when: design/creative, showroom presentation, arts identity, lower-rise character, or unconventional office environment matters.

Publication caution: Santa Fe is useful in the resolver but is not yet a Best Fit for the five Denver Office Business Briefs. It should remain an alternative until more office-specific publishing evidence exists.

Evidence: `_data/locationKnowledgeGraph.js` `santa-fe-arts-district`; representative buildings include 1023 Santa Fe Dr, 543 Santa Fe Dr, and 471 Kalamath St.

## Supported Inputs

Launch-supported facts:

- city
- space type
- headcount
- expected growth
- client, partner, patient, or stakeholder visit frequency
- recruiting importance
- business type
- primary office use
- approximate square footage as compatibility context only

Supported constraints and priorities:

- district anchor
- nearby alternatives
- central-city orientation
- southeast metro orientation
- east Denver orientation
- transit orientation
- parking
- highway access
- walkability and amenities
- healthcare-service proximity
- office environment preference

## Economics Quarantine

Budget, rent, value, concessions, availability, landlord motivation, and cost language are preserved only as broker or project context. They do not move Denver district ranking and do not cite `costPosition`.

The QA case `Case 12: budget or rent language` verifies that economics alone leaves the model in the starting set with no ranking effect.

## Shortlist Behavior

The resolver does not force a top three.

- Starting set: five default districts, unordered.
- Emerging ranking: signals create some differentiation, but near ties remain visible.
- Refined shortlist: multiple signals point toward the same durable district attributes.

A district remains visible unless another candidate is meaningfully stronger or a hard constraint excludes it. Near ties remain visible.

## Business Brief Publication Decisions

Published after Phase 1B:

- Denver Office Space for Technology Companies
- Denver Office Space for Professional Services Firms
- Denver Office Space for Law Firms
- Denver Office Space for Nonprofits and Mission-Driven Organizations

Held after Phase 1B:

- Denver Office Space for Healthcare Organizations

The healthcare page remains held because the structured resolver strongly concentrates on Central Park for healthcare-service/admin signals, while indexed healthcare-office publishing needs a stronger comparison model that can distinguish administrative, patient-facing, institutional, Aurora-adjacent, and clinical-space scenarios without overclaiming medical or lab suitability.

## Representative-Building Readiness

The Business Brief resolver now uses production representative building cards first, then supplements with authored Knowledge Graph representative-building records only when the building URL exists.

Readiness by district:

- Downtown Denver: sufficient for Phase 1B public office briefs.
- LoDo: sufficient for Phase 1B public office briefs.
- RiNo: sufficient for Phase 1B public office briefs.
- Cherry Creek: sufficient for Phase 1B public office briefs.
- Denver Tech Center: sufficient for Phase 1B public office briefs.
- Central Park: sufficient for held healthcare review, but not yet enough for indexed healthcare-office guidance.
- Santa Fe Arts District: useful signal-specific alternative, but not yet a default published Business Brief Best Fit.

## QA

Run:

```bash
node scripts/qa-denver-office-recommendation-model.js
node scripts/qa-business-briefs.js
```

The Denver model QA covers minimal Denver Office, technology, professional services, law, healthcare administration, nonprofit, central-city preference, southeast orientation, parking, transit, conflicting priorities, economics quarantine, insufficient evidence, and Santa Fe signal-specific entry.

## Remaining Knowledge Gaps

- Healthcare-office comparison evidence outside Central Park and Cherry Creek needs review.
- Aurora, hospital-adjacent, and broader medical-office geography are not yet normalized into this Denver Office model.
- Santa Fe Arts District has useful creative/showroom signals but needs stronger office-specific Business Brief evidence before promotion.
- Commute geography remains broad and should not be presented as precise drive, transit, or parking guidance.
- Current market economics remain outside the model until an explicitly approved economics layer exists.

## Implementation Readiness

The Denver Office model is ready to support the four published Denver Office Business Briefs and future prototype-level Denver Location Brief exploration. It is not yet ready to support production healthcare-office personalization without a focused healthcare geography sprint.
