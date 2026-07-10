# Orange County Compass Discovery Analysis

Generated: 2026-07-09

This is a research and editorial analysis for Rofo Compass. It does not implement Knowledge Graph nodes, create pages, or mark Orange County Compass Ready.

## Executive Summary

Orange County has unusually strong pre-Compass public geography coverage. The repository already includes city coverage, district pages, comparison pages, representative building paths, generated comparison intelligence, historical city copy, and selected broker/company export data.

Orange County should not be modeled as one generic suburban office market. Compass should treat it as a set of tenant decision systems:

- Irvine corporate / technology / R&D markets
- John Wayne Airport / Central OC professional office markets
- Coastal executive and client-facing office markets
- Central OC office-retail-service markets
- North OC industrial/flex and service-commercial markets
- South OC professional, medical, and flex/business-park markets

The strongest first Compass implementation should be smaller than the existing page universe. Recommended first-pass nodes are those that materially improve Location Brief routing and explanation quality.

Do not mark Orange County Compass Ready yet. It has commercial geography and page coverage, but lacks Knowledge Graph nodes, `spaceTypeFit`, graph-backed validation questions, QA scenarios, and resolver-backed Location Brief output.

## Step 0 - Available Data

### Data Sources Discovered

| Source | Approximate coverage | Type | Used? | Why |
| --- | ---: | --- | --- | --- |
| `_data/neighborhoodPages.js` | 24 Orange County public geography entries found directly; broader `public_orange_county_v1` support includes 28 OC-related entries including Foothill Ranch, Buena Park, Garden Grove, San Clemente | generated/editorial page data | Yes | Strongest existing signal for public commercial geography, district labels, approximate space types, profiles, and representative building paths. |
| `_data/locationComparisonPages.js` | 23 useful Orange County or OC-adjacent comparison pages after filtering out unrelated generic airport pages | comparison page data | Yes | Shows already-modeled tenant decision paths such as Irvine Spectrum vs IBC, South Coast Metro vs Newport Center, Anaheim vs Fullerton, and Lake Forest vs Irvine Spectrum. |
| `generated/geography/identity-signals/*.json` | 11 OC city identity files found | generated identity data | Yes, lightly | Useful confirmation of city-level support, but not a primary source for Compass decisions. |
| `generated/geography/comparison-intelligence/*.json` | 36 OC city-pair comparison intelligence files plus 11 identity signals, 47 generated OC-related geography files total | generated comparison data | Yes, lightly | Supports relationship candidates but should not override editorial judgment. |
| `_data/representativeBuildingCards.js` | Direct representative card sets for Fullerton, Huntington Beach, and Irvine Spectrum | representative building data | Yes | Strong candidate evidence where direct cards exist. |
| `_data/buildingPages.js` | 83 Orange County building records across Anaheim, Irvine, Costa Mesa, Newport Beach, Santa Ana, Orange, Lake Forest, Mission Viejo, and related cities | building page data | Yes | Used only to identify existing Rofo building paths that can illustrate districts. |
| `data/reports/district-building-depth-audit-v1.json` | 21 OC district audit records with archetype labels | generated audit/report data | Yes | Useful editorial signal for district archetypes such as airport-adjacent office core and North OC industrial/service market. |
| `_data/raw/rofo_top_1200_cities_2026-04-14_103326.csv` | OC city rows including Anaheim, Brea, Fullerton, Santa Ana, Irvine, Orange, and others | raw city/editorial data | Yes, lightly | Historical city orientation only; copy is uneven and not Compass-ready. |
| `data-sources/company-exports/staging/southwest-commercial__orange-county.csv` | 21 records | historical listing/export data | Supporting only | Confirms examples of flex/industrial and office/flex participation in Costa Mesa, Irvine, Orange, Santa Ana, Tustin, and Los Alamitos. Not used to infer district importance. |
| `data-sources/company-exports/staging/sd-associates__orange-county.csv` | 14 records, only some in OC | historical listing/export data | Supporting only | Confirms service/industrial examples in Orange, Garden Grove, and nearby regional markets. Not used to infer priority. |
| `data-sources/company-exports/raw/lee__anaheim-ca.csv` | 46 records, 45 Anaheim | raw listing/export data | Supporting only | Supports Anaheim industrial/flex evidence, especially North OC industrial/service geography. |
| `data-sources/company-exports/raw/koll__irvine-ca.csv` | 8 records, Irvine | raw listing/export data | Supporting only | Supports Irvine office/business-park inventory context. |
| `_data/locationKnowledgeGraph.js` | 0 Orange County nodes | Knowledge Graph | Yes | Confirms Compass gap. |
| `_data/recommendationQaStatus.js` | Orange County pending, 0 scenarios | QA status | Yes | Confirms QA gap. |
| `functions/admin/coverage.js` | Orange County listed with page coverage and Compass maturity pending | admin/planning data | Yes | Confirms current internal status. |

### Sources Ignored or De-emphasized

- Historical listing/export rows were not used as proof of commercial importance. They were used only as supporting evidence for existing inventory patterns and representative-building candidates.
- Generated legacy city-pair comparison files were treated as directional relationship suggestions, not final Compass relationships.
- Raw city marketing copy was treated as orientation only because Compass requires commercial decision logic, tradeoffs, and validation questions.

## Step 1 - Existing Compass Coverage

### City Coverage

Current public/admin planning coverage includes:

- Irvine
- Newport Beach
- Costa Mesa
- Santa Ana
- Anaheim
- Tustin
- Lake Forest
- Mission Viejo
- Huntington Beach
- Fullerton

Additional OC-related public district/page data also appears for:

- Brea
- Orange
- Laguna Hills
- Foothill Ranch
- Buena Park
- Garden Grove
- San Clemente

### District / Neighborhood Coverage

Existing public district-style entries include:

- Irvine Spectrum
- Irvine Business Complex
- John Wayne Airport Area
- University Research Park
- Newport Center / Fashion Island
- South Coast Metro
- Costa Mesa
- Costa Mesa Business Center
- Anaheim Platinum Triangle
- Anaheim
- Anaheim Canyon
- Downtown Santa Ana
- Santa Ana Airport Area
- Santa Ana
- Tustin
- Tustin Legacy
- Orange
- Fullerton
- Brea
- Lake Forest
- Lake Forest Business Center
- Mission Viejo
- Huntington Beach
- Laguna Hills
- Buena Park
- Garden Grove
- Foothill Ranch
- San Clemente

This is more than enough page geography for Compass Discovery. The implementation risk is not lack of pages; it is choosing too many first-pass graph nodes.

### Comparison Pages

Existing comparison architecture already supports many high-value Orange County decisions:

- Irvine Spectrum vs Irvine Business Complex
- Irvine Spectrum vs Newport Center
- Irvine Business Complex vs South Coast Metro
- Irvine Spectrum vs South Coast Metro
- Newport Center vs South Coast Metro
- John Wayne Airport Area vs Irvine Spectrum
- Tustin Legacy vs Irvine Spectrum
- Anaheim Canyon vs Lake Forest Business Center
- Lake Forest vs Irvine Spectrum
- Anaheim vs Santa Ana
- Anaheim vs Fullerton
- Fullerton vs Buena Park
- Brea vs Anaheim
- Mission Viejo vs Laguna Hills
- Costa Mesa vs Newport Beach
- Costa Mesa vs Irvine
- Irvine vs Newport Beach
- Irvine Spectrum vs UTC / University City
- Irvine Spectrum vs Sorrento Mesa
- Irvine Spectrum vs North San Jose
- South Coast Metro vs Century City

The first Compass implementation should reuse the strongest internal OC comparisons and keep cross-metro comparisons secondary until OC's internal recommendation paths are stable.

### Representative Buildings

Representative building support is uneven but useful.

Strongest existing building evidence:

- Irvine Spectrum: 200 Spectrum Center Dr, 400 Spectrum Center Dr, 7545 Irvine Center Dr, 8001 Irvine Center Dr, 530 Technology Dr.
- Irvine Business Complex / John Wayne: 17875 Von Karman Ave, 17901 Von Karman Ave, 19800 MacArthur Blvd, 2211 Michelson Dr, 3333 Michelson Dr.
- Newport Center / Airport Area: 4041 MacArthur Blvd, 4695 MacArthur Ct, 5000 Birch Street West Tower, 895 Dove St.
- South Coast Metro: 555 Anton Blvd, 600 Anton Blvd, 695 Town Center Dr, 3420 Bristol St.
- Anaheim / Anaheim Canyon: 1601 S Sinclair St, 2671 La Palma Ave, 3071 E Coronado St, 4222 E La Palma Ave, 5455 E La Palma Ave, 5475 E La Palma Ave, plus Anaheim Canyon candidates at Cosby, Kraemer, Jefferson, La Palma, and Coronado.
- Santa Ana: 401 S Grand Ave, 1616 E 4th St, 1261 E Dyer Rd, 1018 E Chestnut Ave, 2900 S Harbor Blvd.
- Orange: 333 City Blvd W, 1100 Town and Country Road, 2100 W Orangewood Ave, 2390 N American Way, 2442 N American Way.
- Lake Forest: 22722 Lambert St.
- Mission Viejo: 999 Corporate Drive.
- Brea: 135 S State College Blvd.
- Laguna Hills: 23001 Del Lago Dr, 23046 Avenida de la Carlota, 23512 Commerce Center Dr.

Direct `representativeBuildingCards` exist for Fullerton, Huntington Beach, and Irvine Spectrum, while other OC districts rely primarily on `neighborhoodPages` representative building path maps and building-page records.

### Knowledge Graph Coverage

Current Orange County Knowledge Graph nodes: 0.

This means `/find-locations/ -> /recommendations/` cannot yet produce Orange County graph-backed Location Briefs. It must fall back to generic or expert-guided behavior until Knowledge Cards are authored.

### Recommendation Support and QA

Orange County QA status:

- `qaStatus`: pending
- `scenarioCount`: 0
- `validationStatus`: recommendation readiness pending

Compass maturity should remain Discovery / Planned until graph nodes, QA scenarios, explainability review, and Location Brief review are complete.

## Step 2 - Candidate Commercial Geography

### Highest-Value First-Pass Districts

#### Irvine Spectrum

Why it matters: Irvine Spectrum is the clearest OC corporate / technology / R&D / mixed business-park node. It supports office, flex, R&D-adjacent, technology, and selective industrial/flex decisions.

Evidence used: public district page, representative building cards, building paths, existing comparisons, district audit label "Orange County office / R&D mixed commercial core."

Compass value: Allows Compass to route technology, corporate office, R&D, and growth-company profiles to a credible starting point and compare them with IBC, Tustin Legacy, Lake Forest, and San Diego/Silicon Valley innovation markets.

#### Irvine Business Complex

Why it matters: IBC is the central airport-adjacent Orange County office core. It is distinct from Irvine Spectrum because it is more central / airport / professional-services oriented.

Evidence used: public district page, representative building paths, existing comparison with South Coast Metro and Irvine Spectrum, audit label "Airport-adjacent Orange County office core."

Compass value: Makes airport-access, professional-service, central OC, and client-facing office recommendations more precise.

#### John Wayne Airport Area

Why it matters: The airport corridor cuts across Irvine, Newport Beach, and Santa Ana geography. It should be modeled carefully, likely as a functional Compass node or alias that supports IBC / Santa Ana Airport Area / Newport airport-office decisions.

Evidence used: public page, building paths on Von Karman, MacArthur, Main, and Sky Park, comparison with Irvine Spectrum.

Compass value: Supports profiles prioritizing airport access, client meetings, regional executives, and central OC access.

Editorial caution: Avoid duplicating IBC and Santa Ana Airport Area unless Compass can explain the distinction.

#### South Coast Metro

Why it matters: South Coast Metro is a central OC office-retail core with professional office, retail/hospitality adjacency, and strong client-facing context.

Evidence used: public district page, Anton/Town Center building paths, comparisons with IBC, Newport Center, Irvine Spectrum, and Century City, audit label "Central Orange County office-retail core."

Compass value: Gives Compass a strong central OC office alternative to Irvine and Newport Center, especially for client-facing and amenity-oriented profiles.

#### Newport Center / Fashion Island

Why it matters: Newport Center is the coastal executive / financial / professional-service office node. It is different from South Coast Metro and IBC because image and coastal executive identity are central to the recommendation.

Evidence used: public district page, Newport Beach building paths, existing comparisons with Irvine Spectrum and South Coast Metro, audit label "coastal_client_facing_office_core."

Compass value: Supports executive office, financial services, law, wealth management, and client-facing professional-service profiles.

#### Tustin Legacy

Why it matters: Tustin Legacy is a modern central/south OC mixed-use office / medical / retail / flex node that compares naturally with Irvine Spectrum and Airport Area.

Evidence used: public district page, existing comparison with Irvine Spectrum, page profile "mixed_use, office, medical, central_oc, irvine_edge."

Compass value: Helps Compass avoid routing every modern OC office search to Irvine Spectrum or IBC.

Representative building gap: Existing page has no representative building paths yet, so initial Confidence should be medium unless building evidence is added from existing Rofo data.

#### Anaheim Canyon

Why it matters: Anaheim Canyon is the strongest first-pass North OC industrial/flex node. It supports warehouse, manufacturing, flex, service-commercial, and logistics comparisons.

Evidence used: public district page, Anaheim industrial/flex building paths, comparison with Lake Forest Business Center, audit label "North Orange County industrial/flex market."

Compass value: Gives industrial users a North OC alternative to Lake Forest, Santa Ana industrial/service, Fullerton, Brea, and Inland Empire options.

#### Lake Forest Business Center

Why it matters: Lake Forest Business Center represents South OC industrial/flex/business-park utility, distinct from Irvine Spectrum's polished corporate/R&D environment.

Evidence used: public page, Lake Forest page coverage, comparison with Anaheim Canyon and Irvine Spectrum, audit label "South Orange County industrial/flex market."

Compass value: Supports flex, R&D support, light industrial, service-commercial, and South OC operations users.

Representative building gap: Only limited building-path evidence is visible. Initial confidence should be medium unless more existing Rofo paths are verified.

#### Fullerton

Why it matters: Fullerton represents a North OC industrial/service and local professional-office market. It is useful for users comparing Anaheim, Buena Park, Brea, and Orange.

Evidence used: direct representative building cards, audit label "North Orange County industrial/service market," comparisons with Anaheim and Buena Park.

Compass value: Helps explain lower-cost / practical North OC industrial and service-commercial alternatives.

#### Brea

Why it matters: Brea is a North OC office/industrial edge that can bridge Orange County and eastern/North OC users. It is likely more useful as a first implementation than broad "North Orange County Industrial" if Compass needs a named market with page support.

Evidence used: public page, building path at 135 S State College Blvd, comparison with Anaheim, audit label "North Orange County office/industrial edge."

Compass value: Supports office/industrial edge recommendations for North OC companies comparing Anaheim Canyon, Fullerton, and eastern OC.

#### Mission Viejo / Laguna Hills

Why it matters: South OC professional and medical-office users should not be forced into Irvine Spectrum or Newport Center. Mission Viejo and Laguna Hills support patient-access, local professional-service, and South OC office decisions.

Evidence used: public pages, Mission Viejo vs Laguna Hills comparison, building paths at 999 Corporate Drive and Laguna Hills medical/professional buildings, audit labels "South Orange County professional/medical market" and "South Orange County medical/service office market."

Compass value: Supports medical and local-service office recommendations for South OC.

### Defer or Treat as Second-Pass

- Costa Mesa Business Center: likely a sub-node or alias under Costa Mesa / South Coast Metro unless the graph needs a separate local commercial corridor.
- Costa Mesa city-level: useful as a comparison market but may be too broad as a first Knowledge Card if South Coast Metro carries the main office path.
- Huntington Beach: useful for local service office, medical, retail, and inland flex, but probably second-pass unless Compass needs a coastal local-service path.
- Orange: useful for medical/professional and service-commercial context; likely second-pass after Airport Area / South Coast / Santa Ana are stable.
- Downtown Santa Ana: useful civic/professional node, but not as central to first-pass Compass routing unless professional-service / government-adjacent profiles are prioritized.
- Santa Ana Airport Area: useful if kept distinct from John Wayne / IBC; otherwise defer to avoid duplication.
- Anaheim Platinum Triangle: event-adjacent mixed-use node; useful but not critical for first-pass office/industrial decision routing.
- Foothill Ranch: likely valuable for South OC business park / industrial, but should be second-pass unless reliable building support is confirmed.
- Buena Park / Garden Grove: useful West/Northwest OC industrial/service-commercial alternatives, but second-pass behind Anaheim Canyon, Fullerton, and Brea.
- Laguna Niguel Office: not clearly supported in the currently discovered page/building evidence; do not implement first-pass.
- North Orange County Industrial: useful as a concept, but Compass should prefer named nodes like Anaheim Canyon, Fullerton, Brea, and Buena Park rather than a vague aggregate.

## Step 3 - Commercial Corridors

### I-5 Corridor

Recommendation value: Connects Irvine Spectrum, Tustin Legacy, Lake Forest, Mission Viejo, and South OC business park decisions. Important for employee commute, regional access, and growth-company office/flex routing.

### I-405 Corridor

Recommendation value: Connects Costa Mesa, South Coast Metro, Irvine Business Complex, John Wayne Airport Area, Newport Center, Huntington Beach, and central/coastal office decisions. Important for executive office, professional services, airport access, and coastal/central OC tradeoffs.

### SR-55 / Costa Mesa Freeway Corridor

Recommendation value: Helps explain the Central OC spine between Costa Mesa, Santa Ana, Orange, and Anaheim. Important for service-commercial, medical/professional, and central-access office decisions.

### John Wayne Airport / MacArthur / Von Karman Corridor

Recommendation value: A major functional office geography spanning Irvine, Santa Ana, and Newport Beach. Compass should use this corridor to explain airport access, client meetings, executive travel, and central OC office positioning.

### Irvine Technology / Spectrum / Research Corridor

Recommendation value: Supports technology, R&D, office/flex, life-science-adjacent, and growth-company decisions. It should drive recommendations for profiles that value modern buildings, business-park formats, parking, expansion flexibility, and corporate image.

### La Palma / Anaheim Canyon / North OC Industrial Corridor

Recommendation value: Supports industrial, warehouse/flex, manufacturing, and service-commercial users. Helps compare Anaheim Canyon, Fullerton, Brea, Buena Park, and Inland Empire alternatives.

### South OC Business Park / Medical Corridor

Recommendation value: Connects Lake Forest, Foothill Ranch, Mission Viejo, Laguna Hills, and possibly Laguna Niguel. Useful for medical office, local professional services, flex/R&D support, and South OC employee/customer geography.

## Step 4 - Candidate Knowledge Graph Nodes

### Must-Have Nodes

| Node | Purpose | Primary space types | Business fit | Likely comparison partners | Recommendation value | Evidence used |
| --- | --- | --- | --- | --- | --- | --- |
| Orange County | City/metro-level routing node | office, medical, retail, industrial, warehouse, flex, R&D | Broad OC searches needing first market path | Irvine Spectrum, IBC, South Coast Metro, Newport Center, Anaheim Canyon, Lake Forest Business Center | Lets city-level searches route into distinct OC paths instead of expert-guided fallback | admin coverage, public city/district pages, comparisons |
| Irvine Spectrum | Corporate / technology / R&D business district | office, flex, R&D, light industrial, retail | tech, corporate HQ, growth companies, office/flex users | IBC, Tustin Legacy, Lake Forest Business Center, South Coast Metro, UTC, Sorrento Mesa | Strongest modern OC starting point for corporate/tech/R&D profiles | public page, representative cards, building paths, comparison pages |
| Irvine Business Complex | Airport-adjacent central OC office core | office, medical, retail | professional services, airport access, client-facing office | Irvine Spectrum, South Coast Metro, John Wayne Airport Area, Newport Center | Distinguishes central/airport office from Spectrum technology path | public page, building paths, comparison pages, audit label |
| John Wayne Airport Area | Functional airport office corridor | office, medical, flex | airport-access users, executives, regional client-service firms | IBC, South Coast Metro, Newport Center, Santa Ana Airport Area | Explains airport-access decisions across city boundaries | public page, building paths, comparison with Spectrum |
| South Coast Metro | Central OC office-retail core | office, retail, medical | client-facing office, retail-adjacent office, professional services | IBC, Newport Center, Irvine Spectrum, Costa Mesa | Gives Compass central OC professional-office alternative to Irvine/Newport | public page, building paths, comparisons |
| Newport Center / Fashion Island | Coastal executive office node | office, medical, retail | financial services, law, wealth, executive office, client-facing firms | South Coast Metro, Irvine Spectrum, IBC, Costa Mesa | Supports executive-image and coastal client-facing recommendations | public page, building paths, comparisons |
| Tustin Legacy | Modern mixed-use central/south OC node | office, medical, retail, flex | modern office, healthcare, local services, Irvine-edge users | Irvine Spectrum, IBC, South Coast Metro, Mission Viejo | Prevents over-routing modern office users to Spectrum only | public page, comparison with Spectrum |
| Anaheim Canyon | North OC industrial/flex node | industrial, warehouse, flex, manufacturing | warehouse/flex, manufacturing, service operations, contractors | Lake Forest Business Center, Fullerton, Brea, Santa Ana, Inland Empire | Strongest first-pass North OC industrial route | public page, building paths, comparison pages, raw Anaheim exports as support |
| Lake Forest Business Center | South OC industrial/flex/business park node | industrial, flex, warehouse, office | South OC operations, flex/R&D support, service businesses | Anaheim Canyon, Irvine Spectrum, Foothill Ranch, Mission Viejo | Distinguishes South OC flex/industrial from Irvine corporate office | public page, comparison pages, limited building path |
| Fullerton | North OC industrial/service market | industrial, flex, office, retail | service industrial, contractors, local office, education-adjacent users | Anaheim, Buena Park, Brea, Orange | Supports practical North OC alternatives | direct representative cards, audit label, comparisons |

### Should-Have Nodes

| Node | Purpose | Primary space types | Business fit | Likely comparison partners | Recommendation value | Evidence used |
| --- | --- | --- | --- | --- | --- | --- |
| Brea | North OC office/industrial edge | office, industrial, medical, retail | office/industrial edge users, local professional services | Anaheim Canyon, Fullerton, Orange, Anaheim | Adds eastern/North OC business alternative | public page, audit label, building path, comparison |
| Mission Viejo | South OC professional/medical market | office, medical, retail | medical office, local professional services, South OC customer access | Laguna Hills, Lake Forest, Irvine Spectrum, San Clemente | Supports South OC medical/professional profiles | public page, comparison, building path |
| Laguna Hills | South OC medical/service office | office, medical, retail | medical, wellness, local service office | Mission Viejo, Lake Forest, Irvine Spectrum | Useful for medical-office routing | public page, building paths, audit label |
| Downtown Santa Ana | Civic downtown professional core | office, retail, medical | civic, legal, nonprofit, local professional services | Orange, South Coast Metro, IBC, Santa Ana Airport Area | Adds civic/professional path distinct from airport office | public page, building paths, audit label |
| Santa Ana Airport Area | Central OC industrial/flex/service corridor | office, industrial, flex | service commercial, office/flex, airport-adjacent operations | IBC, John Wayne Airport Area, Santa Ana, Orange | Useful if Compass needs more operational airport-edge routing | public page, building paths |
| Orange | Central OC medical/professional core | office, medical, retail, industrial | medical, professional services, service commercial | Santa Ana, Tustin, Anaheim, Brea | Adds medical/professional context near central OC corridors | public page, building paths, audit label |

### Nice-to-Have / Second-Pass Nodes

- Anaheim Platinum Triangle: event-adjacent office / mixed-use, useful for selected retail/hospitality/office profiles.
- Costa Mesa: local service office / creative services / coastal-central OC, useful after South Coast Metro is stable.
- Costa Mesa Business Center: possible alias or sub-node under Costa Mesa rather than first-pass node.
- Huntington Beach: local service office, medical, retail, and inland flex; useful if coastal local-service profiles become common.
- Buena Park: northwest OC industrial/service node, useful after Fullerton/Anaheim/Brea.
- Garden Grove: west OC service-commercial/local retail node, useful for local-service and industrial/service routing.
- Foothill Ranch: South OC business park / industrial node, likely valuable if existing building support can be verified.
- San Clemente: South OC/coastal professional and medical office, probably second-pass unless demand appears.
- Laguna Niguel Office: do not implement first-pass without stronger existing Rofo evidence.

## Step 5 - Candidate Representative Buildings

Use these only if the building paths exist and the district fit is confirmed during implementation. They illustrate environments, not active availability.

### Irvine Spectrum

- 200 Spectrum Center Dr - Class A office tower; illustrates formal Spectrum corporate office.
- 400 Spectrum Center Dr - modern Spectrum office tower; reinforces corporate / technology office image.
- 7545 Irvine Center Dr - office/flex edge near Irvine Center Drive.
- 8001 Irvine Center Dr - business-park office / R&D corridor context.
- 530 Technology Dr - technology-oriented office/flex environment.
- 1672 Reynolds Ave - flex-industrial edge; useful for Spectrum office/flex tradeoffs.

### Irvine Business Complex / John Wayne Airport Area

- 17875 Von Karman Ave - airport-area office.
- 17901 Von Karman Ave - IBC office fabric.
- 19800 MacArthur Blvd - John Wayne Airport-adjacent office.
- 2211 Michelson Dr - Michelson corridor professional office.
- 3333 Michelson Dr - Irvine corporate office context.
- 17777 Main St and 17835 Skypark Cir - useful for airport-area / Sky Park office/flex context.

### Newport Center / Fashion Island

- 4041 MacArthur Blvd - Newport Beach client-facing office.
- 4695 MacArthur Ct - MacArthur office corridor.
- 5000 Birch Street West Tower - airport/coastal professional office.
- 895 Dove St - Dove Street professional office.

### South Coast Metro / Costa Mesa

- 555 Anton Blvd - South Coast Metro office core.
- 600 Anton Blvd - Anton Boulevard client-facing office.
- 695 Town Center Dr - Town Center Drive office context.
- 3420 Bristol St - central OC office building.
- 2037 Harbor Blvd and 2075 Newport Blvd - Costa Mesa local commercial/service-office corridor examples.

### Anaheim / Anaheim Canyon

- 2400 E Katella Ave - Platinum Triangle / event-adjacent office.
- 1701 S State College Blvd and 1425 S State College Blvd - Anaheim mixed commercial edge.
- 1601 S Sinclair St - Anaheim industrial/flex building.
- 2671 La Palma Ave, 3071 E Coronado St, 4222 E La Palma Ave, 5455 E La Palma Ave, 5475 E La Palma Ave - La Palma / Anaheim industrial and warehouse/flex context.
- 1161 N Cosby Way, 1181 N Kraemer Blvd, 1230 N Jefferson St, 4501 E La Palma Ave, 4640 E La Palma Ave - Anaheim Canyon industrial/flex candidates from existing page data.

### Santa Ana / Orange

- 401 S Grand Ave - Downtown Santa Ana civic office edge.
- 1616 E 4th St - Santa Ana office/service commercial.
- 1261 E Dyer Rd, 1018 E Chestnut Ave, 2900 S Harbor Blvd - Santa Ana industrial/service-commercial and airport-area candidates.
- 333 City Blvd W - City Drive office/medical context.
- 1100 Town and Country Road, 2100 W Orangewood Ave, 2390 N American Way, 2442 N American Way - Orange professional office / service-commercial / business-park context.

### South OC

- 22722 Lambert St - Lake Forest office/flex building.
- 999 Corporate Drive - Mission Viejo professional office.
- 23001 Del Lago Dr, 23046 Avenida de la Carlota, 23512 Commerce Center Dr - Laguna Hills medical/professional and commerce center context.

### North / West OC

- Fullerton direct representative cards: Orangethorpe Avenue industrial, Raymer Avenue warehouse, Walnut Avenue industrial, Fullerton business park flex, Commonwealth Avenue commercial, State College Boulevard office.
- Huntington Beach direct representative cards: Beach Boulevard service office, Gothard Street industrial, Talbert Avenue medical office, Edinger Avenue commercial, Springdale Street office.
- 135 S State College Blvd - Brea office/industrial edge.
- 6700 8th Street - Buena Park industrial center.
- 12361-12465 Lewis St and 9802 Katella Ave - Garden Grove service-commercial corridor.

## Step 6 - Candidate Comparison Relationships

### Must-Have Relationships

- Irvine Spectrum vs Irvine Business Complex: modern corporate/technology/R&D business district versus central airport-adjacent professional office.
- Irvine Spectrum vs South Coast Metro: Irvine technology/corporate path versus central OC office-retail/client-facing path.
- Irvine Business Complex vs South Coast Metro: airport-area professional office versus central OC office-retail core.
- John Wayne Airport Area vs Irvine Spectrum: airport/client access versus modern corporate/R&D business-park environment.
- Newport Center vs South Coast Metro: coastal executive/client-facing office versus central OC office-retail core.
- Irvine Spectrum vs Newport Center: technology/corporate growth path versus coastal executive office/image path.
- Tustin Legacy vs Irvine Spectrum: modern Irvine-edge mixed-use/medical/flex versus larger Spectrum corporate/R&D market.
- Anaheim Canyon vs Lake Forest Business Center: North OC industrial/flex versus South OC industrial/flex.
- Anaheim Canyon vs Fullerton: North OC industrial corridor versus practical industrial/service market.
- Anaheim Canyon vs Brea: industrial/flex/logistics utility versus office/industrial edge.
- Mission Viejo vs Laguna Hills: South OC professional/medical office comparison.
- Lake Forest Business Center vs Irvine Spectrum: South OC practical flex/industrial versus polished corporate/R&D district.

### Should-Have Relationships

- Downtown Santa Ana vs Orange: civic/professional downtown versus central OC medical/professional corridor.
- Santa Ana Airport Area vs Irvine Business Complex: operational/airport-edge office/flex versus central airport office.
- Orange vs Tustin: central OC professional/medical/service corridor comparison.
- Costa Mesa vs Newport Center: local/creative/service office versus coastal executive office.
- Huntington Beach vs Costa Mesa: coastal local-service / flex-commercial versus central/coastal mixed office.
- Fullerton vs Buena Park: North/Northwest OC industrial/service alternatives.
- Brea vs Fullerton: North OC office/industrial edge versus practical industrial/service market.

### Cross-Metro Relationships to Keep Secondary

- Irvine Spectrum vs UTC / University City
- Irvine Spectrum vs Sorrento Mesa
- Irvine Spectrum vs North San Jose
- South Coast Metro vs Century City

These are useful for mature Compass, but first-pass Orange County should validate internal OC routing before emphasizing cross-metro paths.

## Step 7 - Recommendation Intelligence

### New Recommendations Enabled

With the recommended nodes, Compass could produce credible Location Briefs for:

- Orange County office users deciding between Irvine Spectrum, IBC, South Coast Metro, Newport Center, and Tustin Legacy.
- Technology / R&D / office-flex users deciding between Irvine Spectrum, University Research Park, Lake Forest, and San Diego innovation markets.
- Executive professional-service firms deciding between Newport Center, South Coast Metro, IBC, and Downtown Santa Ana.
- Airport-access users deciding between IBC, John Wayne Airport Area, Santa Ana Airport Area, and Newport airport-office buildings.
- Medical-office users deciding between Mission Viejo, Laguna Hills, Orange, Tustin, and South Coast Metro.
- Industrial/flex users deciding between Anaheim Canyon, Fullerton, Brea, Lake Forest Business Center, and Santa Ana.
- South OC operations users deciding between Lake Forest, Foothill Ranch, Mission Viejo, and Irvine Spectrum.

### Recommendation Accuracy Improvements

Current Orange County users likely fall into expert-guided or generic recommendation states. Knowledge Cards would make recommendations more accurate by:

- separating Irvine Spectrum from IBC
- separating Newport executive image from South Coast Metro central-office context
- distinguishing North OC industrial from South OC flex/industrial
- giving medical-office searches real South OC / Orange / Tustin options
- preventing broad city selections like "Irvine" or "Orange County" from producing vague guidance

### Current Blind Spots

- No Orange County Knowledge Graph nodes.
- No city-level Orange County market path.
- No `spaceTypeFit` for OC office, medical, retail, industrial, warehouse, flex, R&D, or showroom users.
- No graph-backed validation questions.
- No Recommendation QA scenarios.
- No explainability review for OC recommendations.
- Representative building support exists but is uneven and not yet normalized into Knowledge Cards.
- Airport Area naming needs editorial care to avoid duplicate IBC / John Wayne / Santa Ana Airport Area concepts.

## Step 8 - Compass Readiness Assessment

| Compass standard | Assessment | Notes |
| --- | --- | --- |
| Commercial Geography | Strong page coverage, not yet Compass-modeled | Existing pages and comparisons provide a strong foundation. |
| Knowledge Graph | Not ready | 0 Orange County nodes in `_data/locationKnowledgeGraph.js`. |
| Representative Buildings | Partial | Strong for Irvine Spectrum, IBC/airport, South Coast, Anaheim, Santa Ana, Orange; weaker for Tustin Legacy, Lake Forest Business Center, some South OC and West OC nodes. |
| Comparison Relationships | Strong page foundation | Existing comparison pages cover many high-value decisions, but graph relationships are not authored. |
| SpaceTypeFit | Not ready | No OC graph cards means no fit model. |
| Validation Questions | Not ready | No OC `questionsToValidate`. |
| Explainability | Not ready | Resolver has no graph knowledge to explain. |
| Recommendation QA | Not ready | 0 Orange County scenarios. |
| Location Brief Quality | Not ready | Would still be expert-guided/generic for OC. |

Compass maturity recommendation: keep Orange County in Discovery. Do not mark Compass Ready.

## Step 9 - Suggested Implementation Plan

### Must Have

1. Author first-pass Knowledge Cards:
   - Orange County city/metro-level routing node
   - Irvine Spectrum
   - Irvine Business Complex
   - John Wayne Airport Area or a carefully defined Airport Area node
   - South Coast Metro
   - Newport Center / Fashion Island
   - Tustin Legacy
   - Anaheim Canyon
   - Lake Forest Business Center
   - Fullerton
   - Mission Viejo / Laguna Hills medical-service path

2. Define city-level market paths:
   - Office: Irvine Spectrum, IBC, South Coast Metro, Newport Center, Tustin Legacy
   - Executive/client-facing office: Newport Center, South Coast Metro, IBC
   - Technology/R&D/flex: Irvine Spectrum, University Research Park, Lake Forest Business Center
   - Medical: Mission Viejo, Laguna Hills, Orange, Tustin, South Coast Metro
   - Industrial/flex/warehouse: Anaheim Canyon, Fullerton, Brea, Lake Forest Business Center, Santa Ana Airport Area

3. Add comparison relationships:
   - Irvine Spectrum vs IBC
   - IBC vs South Coast Metro
   - Newport Center vs South Coast Metro
   - Tustin Legacy vs Irvine Spectrum
   - Anaheim Canyon vs Lake Forest Business Center
   - Anaheim Canyon vs Fullerton
   - Mission Viejo vs Laguna Hills

4. Attach representative buildings only from existing paths.

5. Create 10-12 Orange County QA scenarios:
   - Irvine technology HQ
   - IBC airport-access professional services
   - Newport Center wealth/legal office
   - South Coast Metro client-facing office
   - Tustin Legacy medical office
   - Mission Viejo specialty medical office
   - Anaheim Canyon warehouse/flex
   - Lake Forest flex/R&D support
   - Fullerton contractor/service industrial
   - Brea office/industrial edge
   - Costa Mesa local service office
   - South OC professional services

6. Run editorial broker-style review before Compass Ready.

### Should Have

- Add University Research Park if Compass needs a stronger R&D/life-science-adjacent Irvine node.
- Add Brea as a North OC office/industrial edge.
- Add Orange for medical/professional central OC routing.
- Add Downtown Santa Ana for civic/professional services.
- Resolve Airport Area naming:
  - IBC may be enough for first-pass airport office.
  - John Wayne Airport Area may be a functional node.
  - Santa Ana Airport Area may be more operational/office-flex.
- Normalize direct representative-building card support beyond Irvine Spectrum, Fullerton, and Huntington Beach.
- Add coverage dashboard notes that Orange County has Discovery complete but graph implementation pending.

### Nice To Have

- Add Costa Mesa Business Center only if it improves recommendations beyond South Coast Metro and Costa Mesa.
- Add Huntington Beach for coastal local-service office/medical/flex.
- Add Anaheim Platinum Triangle for event-adjacent office/retail/hospitality.
- Add Buena Park and Garden Grove for West/Northwest OC service-commercial and industrial.
- Add Foothill Ranch after confirming representative buildings and its role versus Lake Forest Business Center.
- Add cross-metro comparison paths after internal OC QA passes:
  - Irvine Spectrum vs UTC / University City
  - Irvine Spectrum vs Sorrento Mesa
  - Irvine Spectrum vs North San Jose
  - South Coast Metro vs Century City

## Recommended First Implementation Scope

The first Orange County Compass implementation should be:

- 10-12 Knowledge Graph nodes
- 40-60 comparison relationships
- 8-12 QA scenarios
- representative buildings for every high-confidence node where existing Rofo paths exist
- explicit treatment of airport-area naming
- no Compass Ready promotion until QA and editorial review pass

This gives Compass enough structure to produce credible Location Briefs while avoiding a shallow graph that simply mirrors every public page.
