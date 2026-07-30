# Rofo Commercial Geography Model

This document defines Rofo's canonical commercial geography model. It is architectural. It does not implement runtime behavior, change Publisher scoring, change EOS planning, change Mission Control, or modify recommendation logic.

The model should be treated as the long-term source of truth for how Rofo organizes commercial location intelligence nationally.

## Core Principle

Rofo has one commercial geography.

Every canonical commercial district belongs to one operational market. Every operational market belongs to one region. Systems may measure different maturity states, evidence depth, recommendation confidence, photography coverage, and public-page readiness, but they should not create separate recommendation districts, Publisher-only districts, editorial districts, or Commercial Market Evidence-only districts.

The official definition of a Market should be:

```text
The largest commercial geography that can be developed, measured, recommended, and operated as one coherent editorial product.
```

Markets should not be defined primarily by county boundaries, political lines, arbitrary mileage, population, or media-market naming. Those signals can help explain context, but the market boundary should follow tenant decision patterns and Rofo's ability to build a coherent product.

## Canonical Hierarchy

Rofo should use this hierarchy:

```text
Region
Market
District
```

This hierarchy is intentionally smaller than generic geography. Rofo does not need every administrative level. It needs the levels that make commercial product, recommendation, and operating decisions clear.

### Region

A Region is the broad commercial geography that contains related operational markets.

Purpose:

- organize national expansion
- describe large comparison systems
- group markets for planning and reporting
- preserve regional context without collapsing distinct markets

Ownership:

- Knowledge Graph owns canonical region identity and relationships.
- Publisher may report region-level rollups later, but should not use Region as a substitute for market readiness.
- EOS and Mission Control may use Region to organize expansion portfolios.

Planning role:

- Regions are not executable.
- Regions help answer which broad geography Rofo should build next.
- Regions contain several markets that may advance at different maturity levels.

Recommendation role:

- Regions provide context for broad user intent such as "Bay Area" or "Southern California."
- Recommendations should resolve broad regional intent into relevant markets and districts.
- Region membership should not make every district equally relevant to a Search Profile.

Publisher role:

- Publisher may summarize region coverage, but readiness should remain market-based.
- A strong flagship market should not hide weak adjacent markets inside the same Region.

Mission Control role:

- Mission Control may show regional expansion portfolios.
- Daily execution should still occur at Market, Campaign, Initiative, or Mission level.

### Market

A Market is Rofo's primary operating geography.

Definition:

```text
The largest commercial geography that can be developed, measured, recommended, and operated as one coherent editorial product.
```

Purpose:

- organize Publisher readiness
- organize Mission Control work
- define Commercial Market Evidence and Building Evidence completion
- provide the unit of public market-page strategy
- provide the default planning unit for national expansion

Ownership:

- Knowledge Graph owns canonical market identity and district membership.
- Publisher measures market maturity and readiness.
- EOS projects Programs, Campaigns, Initiatives, and Missions inside markets.
- Mission Control renders markets as the primary operating workspace.
- Compass uses markets as recommendation context without treating market membership as ranking by itself.

Planning role:

- Markets are the primary completion object.
- Programs such as Publisher, Commercial Market Evidence, Building Profiles, Photography, Recommendation QA, and Knowledge Graph report progress by market.
- Campaigns complete markets through bounded Missions.

Recommendation role:

- A user may start from a market.
- Recommendations may return districts inside the selected market and compare nearby markets when the graph supports it.
- Market ownership should not block comparison across markets.

Publisher role:

- Publisher should measure market coverage from every canonical district assigned to the market.
- Publisher can report maturity differences instead of excluding thin districts.
- Publisher should not promote a market to a live state without QA and explicit publishing approval.

Mission Control role:

- Markets are the top-level workspace.
- Mission Control should answer which market needs attention, what the next mission is, and which Program is blocking progress.

### District

A District is the smallest canonical commercial geography Rofo plans and recommends as a location decision object.

Purpose:

- represent a real commercial location choice
- hold district-level Knowledge Graph intelligence
- provide Commercial Market Evidence collection scope
- provide District Building Evidence mission scope
- support recommendation, comparison, and Location Brief explanation

Ownership:

- Knowledge Graph owns canonical district identity, operational market ownership, recommendation eligibility, relationships, fit, tradeoffs, and validation questions.
- Commercial Market Evidence owns curated evidence collections by district.
- Building Profiles own building-level public explanation that supports district evidence.
- Publisher measures district maturity.
- EOS resolves district work into Missions.

Planning role:

- Districts are not always directly executable, but many Missions are district-scoped.
- One missing Commercial Market Evidence collection or one District Building Evidence catch-up can be a district Mission.

Recommendation role:

- Every canonical district is recommendation-eligible.
- Eligibility does not mean equal ranking, equal confidence, or equal investment.
- Low maturity should reduce confidence or trigger validation language; it should not erase the district from the platform.

Publisher role:

- Publisher measures public-page readiness, graph maturity, comparison coverage, Commercial Market Evidence state, Building Profile coverage, photography, and recommendation QA signals.
- Missing maturity becomes visible work, not a reason to exclude a district from the denominator.

Mission Control role:

- Districts are shown through Program Initiatives and Missions.
- Work Items such as evidence records, building profiles, photo targets, and QA scenarios should remain hidden unless an operator expands details.

## Ownership by System

Knowledge Graph owns:

- Region identity
- Market identity
- District identity
- operational market membership
- recommendation eligibility
- comparison and adjacency relationships
- district fit, strengths, tradeoffs, and validation questions

Commercial Market Evidence owns:

- district evidence collections
- evidence record selection
- evidence roles and types
- source support, confidence, and provenance
- collection validation

Building Evidence owns the operational mission path, not a separate source system:

- Commercial Market Evidence remains the evidence collection system.
- Building Profiles remain the building explanation system.
- EOS executes them together when both support one district outcome.

Building Profiles own:

- building-specific public explanation
- Building Brief depth
- building strengths, tradeoffs, nearby alternatives, and validation questions
- canonical public Building Profile URLs

Publisher owns:

- market readiness measurement
- district coverage measurement
- maturity reporting
- deterministic gap discovery
- generated snapshots

EOS owns:

- market-centric projection
- Program, Campaign, Initiative, Mission, Execution Packet, and hidden Work Item planning
- portfolio and district building-evidence resolution
- expansion ordering

Mission Control owns:

- operator presentation
- Commence Work flow
- mission review surface
- market workspace experience

Recommendations own:

- Search Profile interpretation
- location ranking and explanation
- district and market comparison logic
- confidence and validation language

Photography owns:

- Field Mode target coverage
- photo capture workflow
- visual readiness signals

Public pages should align to the hierarchy:

- Region pages are future expansion surfaces, not required for v1.
- Market pages explain the coherent commercial market.
- District pages explain individual location choices.
- Building Profile pages explain evidence environments.

## Geographic Relationships

Rofo should distinguish three relationship types:

Operational ownership:

- assigns a district to one market
- controls denominator logic for Publisher, Commercial Market Evidence, Building Evidence, Mission Control, and Campaign progress
- must be deterministic

Comparison:

- describes a decision path between districts or markets
- may cross market or region boundaries
- should never assign ownership

Adjacency:

- describes proximity or contextual relationship
- may support explanation, commute context, or alternatives
- should never assign ownership

This distinction prevents West Berkeley from becoming a San Francisco Mission because it is regionally adjacent or commercially comparable.

## Bay Area Case Study

The Bay Area should be modeled as a Region, not one Market.

Recommended hierarchy:

```text
Bay Area
San Francisco
East Bay
South Bay
Peninsula
North Bay
Districts
```

### Bay Area Region

The Bay Area is a Region because tenant decisions often compare across the region, but no single editorial product can responsibly treat all Bay Area districts as one coherent market. San Francisco, East Bay, South Bay, Peninsula, and North Bay differ by commute systems, office demand, industrial geography, life-science clusters, public-page strategy, Building Evidence needs, and broker operating patterns.

The Bay Area Region should support broad comparisons such as San Francisco versus Oakland, Mission Bay versus South San Francisco, or SoMa versus North San Jose. It should not own district completion.

### San Francisco Market

San Francisco is an independent Market.

Why:

- it has a dense set of canonical districts with distinct commercial identities
- its district decisions are highly local and transit-sensitive
- Publisher, Commercial Market Evidence, Building Evidence, Recommendation QA, and Mission Control already operate coherently at this scale
- the market can be completed as a single editorial product

Example districts:

- Financial District
- Jackson Square
- SoMa
- Mission Bay
- Dogpatch
- Design District
- Showplace Square
- South Beach
- Potrero Hill
- Mission District

San Francisco can compare to East Bay, Peninsula, and South Bay districts, but those comparisons do not transfer ownership.

### East Bay Market

East Bay should be an independent Market.

Why:

- Berkeley, Oakland, Emeryville, Fremont, Hayward, and nearby industrial or innovation districts share regional context but not San Francisco operating ownership
- East Bay has different office, research, industrial, logistics, and university-adjacent patterns
- it can have its own Publisher and Mission Control completion path

Example districts:

- West Berkeley
- Downtown Berkeley
- Emeryville Commercial Core
- Downtown Oakland
- Jack London Square
- Warm Springs Innovation District
- Hayward Industrial
- Union City Industrial

### South Bay Market

South Bay should be an independent Market.

Why:

- it has a technology, R&D, campus, and industrial geography distinct from San Francisco and Peninsula markets
- tenant decisions often involve campus scale, vehicle access, and engineering labor geography
- San Jose and adjacent innovation districts require their own completion strategy

Example districts:

- North San Jose
- Santana Row / Valley Fair
- Moffett Park when operationally assigned to South Bay
- Sunnyvale and Santa Clara innovation corridors where appropriate

### Peninsula Market

Peninsula should be an independent Market.

Why:

- it sits between San Francisco and South Bay but has its own office, life-science, downtown, and Caltrain-oriented decision patterns
- Palo Alto, Redwood City, Menlo Park, and South San Francisco are often compared, but they do not behave like San Francisco districts

Example districts:

- Downtown Palo Alto
- Stanford Research Park
- Downtown Redwood City
- South San Francisco / Oyster Point
- Downtown San Mateo

### North Bay Market

North Bay should be an independent Market when Rofo has enough source depth to operate it.

Why:

- Marin, Sonoma, Napa, and related commercial corridors do not share San Francisco's office, transit, or district evidence model
- it may require a different commercial mix, with more local office, healthcare, retail, hospitality, and light industrial patterns

North Bay can remain lower priority until Knowledge Graph and Publisher evidence justify active expansion.

## National Examples

These examples define likely Region, Market, and District organization. They are not implementation instructions.

### Seattle

Region:

- Pacific Northwest

Markets:

- Seattle
- Eastside
- South Sound / Kent Valley, when source depth supports a separate industrial market

District examples:

- Downtown Seattle Office Core
- South Lake Union
- First Hill Medical District
- SODO Industrial
- Ballard / Interbay Industrial
- Bellevue CBD Office
- Eastside Tech Office Corridor
- Kent Valley

Seattle and Eastside are related but should not collapse into one Market if completion, commute, tenant fit, and Building Evidence differ materially.

### Denver

Region:

- Mountain West

Markets:

- Denver
- Boulder / Northwest Corridor, when source depth supports separation

District examples:

- Downtown Denver
- Cherry Creek
- RiNo
- Denver Tech Center
- Northeast Denver Industrial
- Central Park
- Aurora
- Boulder
- Interlocken

Denver can initially operate as one Market while Boulder/Northwest remains a candidate split if recommendations, evidence, and Publisher readiness become more coherent separately.

### Phoenix

Region:

- Southwest

Markets:

- Phoenix
- East Valley
- West Valley, when industrial and suburban office evidence justify separation

District examples:

- Downtown Phoenix
- Tempe
- Scottsdale Airpark
- Camelback Corridor
- Chandler / Price Corridor
- Mesa Gateway
- West Valley industrial corridors

Phoenix should follow coherent commute, labor, and tenant-decision patterns rather than city boundaries alone.

### Southern California

Region:

- Southern California

Markets:

- Los Angeles
- Westside
- Orange County
- San Diego
- Inland Empire
- San Fernando Valley, when operationally distinct

District examples:

- Downtown Los Angeles
- Hollywood / Media District
- Culver City
- Santa Monica
- Irvine Spectrum
- South OC Medical & Professional
- University Research Park
- Sorrento Mesa
- Carlsbad
- Ontario / Airport Area

Southern California is too commercially diverse to operate as one Market. Los Angeles and Westside may eventually split if Westside has enough distinct evidence, recommendation, and operating needs.

### Dallas

Region:

- North Texas

Markets:

- Dallas
- Fort Worth
- DFW Airport / Mid-Cities industrial, when evidence supports separation

District examples:

- Dallas CBD
- Uptown Dallas
- Las Colinas
- Plano / Legacy
- Frisco
- DFW Airport industrial
- Fort Worth CBD

Dallas should not automatically mean all of DFW. Rofo should separate markets when completion and recommendation paths become clearer separately.

### Chicago

Region:

- Great Lakes / Midwest

Markets:

- Chicago
- O'Hare / Northwest Suburbs industrial
- West Suburbs, when operating patterns justify separation

District examples:

- Loop
- Fulton Market
- River North
- West Loop
- O'Hare industrial
- Oak Brook
- Schaumburg

Chicago's central office market and suburban industrial or office corridors may need separate Market ownership even if they share a regional brand.

### New York

Region:

- New York Metro

Markets:

- Manhattan
- Brooklyn / Queens
- Northern New Jersey
- Long Island, when source depth supports it
- Westchester / Fairfield, when source depth supports it

District examples:

- Midtown
- Financial District
- Hudson Yards
- Flatiron
- Downtown Brooklyn
- Long Island City
- Jersey City
- Newark

New York is the clearest example where political city identity is too broad and commercial market identity must be operational.

### Boston

Region:

- New England

Markets:

- Boston / Cambridge
- Route 128 / Suburban Boston

District examples:

- Financial District
- Seaport
- Kendall Square
- Back Bay
- Longwood Medical Area
- Burlington
- Waltham / Route 128

Boston and Cambridge may operate together initially because life-science, office, and transit comparisons are tightly linked, but suburban Route 128 should likely become a separate Market.

### Atlanta

Region:

- Southeast

Markets:

- Atlanta
- North Fulton / GA 400
- Airport / South Atlanta industrial, when evidence supports separation

District examples:

- Midtown
- Buckhead
- Downtown Atlanta
- Perimeter Center
- Alpharetta
- Airport logistics corridors

Atlanta market splits should follow commute, office submarket, and logistics patterns rather than municipal boundaries.

### Washington DC

Region:

- Mid-Atlantic

Markets:

- Washington DC
- Northern Virginia
- Maryland suburbs, when evidence supports separation

District examples:

- Downtown DC
- Capitol Riverfront
- Georgetown
- Arlington / Rosslyn-Ballston
- Tysons
- Alexandria
- Bethesda

Washington DC is regionally integrated but operationally split by transit, federal-adjacent demand, office clusters, and suburban decision patterns.

## Expansion Implications

### Publisher

Publisher should measure markets from canonical district membership. Region-level reporting can be added later as a rollup, but market readiness should remain the actionable unit.

Publisher should report:

- district count
- district maturity
- Commercial Market Evidence state
- Building Profile coverage
- photography coverage
- recommendation QA
- public-page readiness
- internal-link readiness
- ecosystem maturity

Publisher should not hide low-maturity districts or treat absent evidence as absent geography.

### Commercial Market Evidence

Commercial Market Evidence completion should use:

```text
completed district collections / canonical districts in market
```

Quality remains owned by the Commercial Market Evidence validator. Presence and quality are related, but they are not the same measurement.

### Building Evidence

District Building Evidence should use District as the default Mission scope.

If a district is too large or heterogeneous for one reviewable SER, split by a clear editorial boundary such as office, industrial/flex, medical, life science, retail, or subdistrict. The district remains the Campaign context.

### Mission Control

Mission Control should present Markets first. Regions can appear as expansion groupings, and Districts should appear through Program Initiatives and Missions.

The operator should not need to interpret county, city, or metro naming to know what work is executable.

### Recommendations

Recommendations should treat Region, Market, and District as different levels of intent:

- Region intent asks the resolver to identify relevant markets.
- Market intent asks the resolver to identify relevant districts.
- District intent asks the resolver to compare that district with alternatives.

Ranking should still depend on fit, evidence, tradeoffs, and confidence, not hierarchy membership alone.

### National Expansion

National expansion should proceed by Region portfolios and Market completion.

Example:

```text
Region: Bay Area
Market: San Francisco
Campaign: San Francisco Building Evidence Completion
Mission: Complete Design District Building Evidence
```

This keeps Rofo scalable without turning expansion into one national backlog of disconnected work items.

## Migration Strategy

Migration should be additive.

1. Document the hierarchy as the canonical model.
2. Add explicit Region and Market metadata to Knowledge Graph nodes when implementation begins.
3. Preserve current market IDs and public URLs.
4. Keep existing Publisher metro grouping as a compatibility layer while introducing canonical Market ownership.
5. Have Publisher report market readiness from canonical district membership.
6. Have EOS use canonical Market ownership as the first district-to-market resolver signal.
7. Have Commercial Market Evidence denominators use canonical Market districts.
8. Add Region rollups only after market-level reporting is stable.
9. Update Mission Control navigation to use Markets as the operating home and Regions as expansion context.
10. Keep recommendation rankings unchanged until a focused Compass sprint explicitly consumes Region or Market metadata.

Backward compatibility rules:

- existing public market and district URLs remain stable
- existing Publisher metro IDs remain valid until migrated
- current generated data can include both legacy metro group and canonical Market fields
- ambiguous districts are surfaced for review, not silently assigned
- comparison relationships remain separate from ownership

## Decision Rules

Use these rules when adding or reviewing geography:

- If a geography can be completed as one coherent editorial product, it may be a Market.
- If it contains several coherent markets that need separate completion paths, it is a Region.
- If it is a user-facing location choice inside a market, it is a District.
- If two places are compared often but require separate completion paths, they are separate Markets with comparison relationships.
- If a district lacks maturity, improve the district; do not remove it from the canonical geography.
- If ownership is ambiguous, block executable Missions until the Knowledge Graph resolves ownership.

## Current Architecture Position

Current Rofo architecture is already close to this model:

- Knowledge Graph owns canonical district identity.
- Publisher measures market maturity from source data.
- EOS projects work by market.
- Mission Control uses markets as the operating workspace.
- Commercial Market Evidence counts canonical districts in an operational market.
- District Building Evidence combines CME and selected Building Profile execution without merging their source systems.

The missing piece is explicit Region identity and fully canonical Market ownership in source data. That should be the next implementation layer, not a runtime behavior change in this architecture sprint.

