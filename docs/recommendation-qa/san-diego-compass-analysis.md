# San Diego Compass Analysis

Analysis date: July 9, 2026

Scope: research and analysis only. This report recommends how Rofo Compass should learn San Diego from existing Rofo data. It does not mark San Diego Compass Ready and does not add production data, pages, or Knowledge Graph nodes.

## Executive Summary

San Diego has unusually strong pre-Compass page and building scaffolding. Rofo already has city pages, district pages, comparison pages, space-type pages, and embedded representative building candidates for many San Diego submarkets. The strongest existing data layer is not the public editorial copy itself, but the generated district records in `_data/neighborhoodPages.js`, which combine commercial area metadata, approximate space-type signals, commercial-location-model summaries, compare paths, and representative building arrays.

The main gap is that this structure has not yet been translated into Rofo Compass. `_data/locationKnowledgeGraph.js` currently has no San Diego nodes, and `_data/recommendationQaStatus.js` marks San Diego QA as pending. As a result, San Diego can educate users through pages, but it cannot yet produce graph-backed Location Briefs with resolver-grade spaceTypeFit, attributes, tradeoffs, questionsToValidate, explainability, and QA validation.

The best next sprint should not be another page expansion. It should convert the existing San Diego commercial geography into Compass Knowledge Cards, beginning with the districts that have both building evidence and tenant-decision value: Downtown San Diego, UTC / University City, Sorrento Mesa, Mission Valley, Kearny Mesa, Miramar, Otay Mesa, Rancho Bernardo, Carlsbad Business Park, Bressi Ranch, Oceanside Industrial, Vista Business Park, Poway Business Park, Torrey Pines / La Jolla, and Chula Vista.

## Step 0 - Discovered Data Sources

| Dataset | Approximate record count inspected | Type | Purpose | Used? | Notes |
| --- | ---: | --- | --- | --- | --- |
| `_data/buildingPages.js` | 175 exact San Diego-area building records | generated building data | Canonical generated building pages with name, address, path, space type, size label, source count | Yes | Primary source for representative building suggestions. Exact San Diego-area filter used CA city slugs including San Diego, Carlsbad, Oceanside, Vista, San Marcos, Escondido, Del Mar, Encinitas, Poway, Chula Vista, La Mesa, La Jolla. |
| `_data/raw-listings.json` | 205 exact San Diego-area raw listing rows | raw listing data | Raw listing/source records with listing-level space type and source-company fields | Yes, selectively | Exact CA city-slug filter found mostly office/coworking records. Useful for source-count evidence, less complete for industrial because many industrial candidates are clearer in generated building pages and district representative arrays. |
| `_data/neighborhoodPages.js` | 30 San Diego-region rows; 24 tagged `public_san_diego_v1` | generated district/page data with commercial model | District pages, commercial area metadata, approximate space types, semantic signals, compare paths, embedded representative buildings | Yes | Most valuable structured source. Used for commercial geography discovery, candidate nodes, relationships, and representative building context. |
| `_data/locationComparisonPages.js` | 48 rows matched broad San Diego terms; 20 directly San Diego/North County comparison pages | comparison data | Existing comparison page definitions | Yes | Used to identify current comparison graph and supported tenant decision paths. Broad term matching also catches non-San Diego places named Miramar/Kearny/University City, so only San Diego paths were treated as evidence. |
| `_data/cities.generated.json` | 14 San Diego-area city rows inspected | generated city/search data | City pages, paths, nearby city relationships, legacy building_count | Yes | Used for city coverage and autocomplete/source-path inference. Legacy `building_count` can be inconsistent with generated building pages, so it is not treated as representative-building proof. |
| `_data/spaceTypePages.js` | 27 San Diego-area space-type rows | generated space-type pages | City + space-type pages with representativeBuildings arrays | Yes | Used to confirm office, industrial, retail, coworking coverage by city. |
| `data/location-search.json.11ty.js` | Generator includes all cities and non-noindex neighborhood pages | search/index data | Produces `/data/location-search.json` for city/district autocomplete | Yes | Used to verify San Diego districts should be searchable because generator consumes `cities.generated.json` and `neighborhoodPages.js`. |
| `_data/locationKnowledgeGraph.js` | 0 San Diego nodes | Knowledge Graph | Compass Knowledge Cards consumed by resolver | Yes | Used to confirm no San Diego Compass graph coverage exists yet. |
| `_data/recommendationQaStatus.js` | San Diego entry exists | QA status data | Tracks metro QA status | Yes | San Diego is `pending`, with validation status `recommendation_readiness_pending`. |
| `functions/admin/coverage.js` | San Diego configured as planned | admin/planning data | Compass Coverage dashboard status and heuristics | Yes | San Diego is configured as `planned`; current focus says page coverage exists and Compass maturity is pending. |
| `docs/recommendation-expansion-roadmap.md` | San Diego section exists | internal planning documentation | Long-term Compass expansion roadmap | Yes | Used only to confirm current internal planning state, not as market evidence. |
| `_data/representativeBuildingCards.js` and expansions | No San Diego card rows found | representative building data | Curated representative building card layer | Yes, for negative check | Dedicated representative building card files do not yet contain San Diego; district records do contain embedded representative buildings. |
| `generated/geography/comparison-intelligence/*` | 28 San Diego-area city-pair files found | generated comparison intelligence | Legacy nearby-city comparison intelligence | Selectively | Useful for city-level relationship candidates such as San Diego-Chula Vista, Carlsbad-San Marcos, Vista-San Marcos. Not used as building evidence. |
| `data/peter/derived/building_semantic_identity_v1.json` | Large derived semantic building data | derived building intelligence | Semantic identity extraction | Ignored for this report | It is potentially useful, but the report was grounded in smaller canonical/generated data layers to avoid over-reading a very large derived file during the analysis sprint. |
| `data/external/` | Not inspected deeply | external data | External source data | Ignored | User constraints for recent expansion sprints repeatedly said leave `data/external/` untouched; no need for this analysis. |

### Data-Use Principle

The report uses underlying commercial data where practical:

- Building and listing records: `_data/buildingPages.js`, `_data/raw-listings.json`.
- District commercial metadata generated from Rofo data: `_data/neighborhoodPages.js`.
- Existing comparison paths and autocomplete/index data: `_data/locationComparisonPages.js`, `data/location-search.json.11ty.js`.

Generated pages and docs are used to understand current coverage, not to invent commercial claims.

## Step 1 - Existing Compass Coverage

### City Pages

`_data/cities.generated.json` includes San Diego-area city pages for:

- San Diego
- Carlsbad
- Oceanside
- Vista
- San Marcos
- Escondido
- Encinitas
- Del Mar
- Poway
- Santee
- Chula Vista
- La Mesa
- El Cajon
- La Jolla

The user-priority metro list is covered at the city level, with additional adjacent city rows. City-level legacy `building_count` values exist, but they are not used as exact Compass evidence because generated building-page counts differ.

### District Pages

`_data/neighborhoodPages.js` includes the following San Diego-region district/city-district rows:

- Carlsbad: Carlsbad Business Park, Bressi Ranch, Carlsbad
- Chula Vista: Chula Vista
- Escondido: Escondido
- La Jolla: Torrey Pines / La Jolla
- Oceanside: Oceanside Industrial, Oceanside
- Poway: Poway Business Park
- San Diego: Downtown San Diego, Rancho Bernardo, Kearny Mesa, Mira Mesa, Mission Valley, Sorrento Mesa, Miramar, Otay Mesa, UTC / University City, East Village, Little Italy / Columbia, Del Mar Heights / Carmel Valley, Little Italy, Bankers Hill, Sorrento Valley, University City, Barrio Logan, Liberty Station
- San Marcos: San Marcos
- Vista: Vista Business Park, Vista

The strongest rows include `commercial_location_model` objects with thesis, best-fit businesses, compare paths, office profile, and warehouse/flex profile where relevant. Some later/smaller district rows have building evidence and semantic signals but thinner model fields, including Little Italy, Bankers Hill, Sorrento Valley, University City, Barrio Logan, and Liberty Station.

### Space-Type Pages

`_data/spaceTypePages.js` includes 27 San Diego-area city + space-type pages. Coverage includes:

- San Diego: office, retail, industrial, coworking
- Carlsbad: office, industrial, coworking
- Chula Vista: office, retail, industrial, coworking
- Oceanside: office, retail, industrial
- Poway: office, retail, industrial
- Vista: office, retail, industrial
- San Marcos: office, retail
- Escondido: office, industrial, coworking
- Del Mar: retail
- Encinitas: office

This is enough to support page journeys and context entry, but not enough by itself for Compass-ready Location Briefs.

### Comparison Pages

Existing San Diego/North County comparison pages include:

- Downtown San Diego vs Mission Valley
- Mission Valley vs UTC / University City
- UTC / University City vs Sorrento Mesa
- Sorrento Mesa vs Torrey Pines
- Kearny Mesa vs Miramar
- Otay Mesa vs Chula Vista
- Carlsbad vs Oceanside
- Carlsbad vs Sorrento Mesa
- Vista vs San Marcos
- Escondido vs San Marcos
- Downtown San Diego vs Little Italy / Columbia
- UTC / University City vs Kearny Mesa
- Del Mar Heights / Carmel Valley vs UTC / University City
- Mira Mesa vs Sorrento Mesa
- Kearny Mesa vs Rancho Bernardo
- Rancho Bernardo vs Poway Business Park
- Carlsbad Business Park vs Sorrento Mesa
- Carlsbad Business Park vs Oceanside Industrial
- Carlsbad Business Park vs Vista Business Park
- Oceanside Industrial vs Vista Business Park

Orange County cross-metro comparison pages also connect Irvine Spectrum to UTC / University City and Sorrento Mesa, which can become useful later but should not be the first San Diego Compass path.

### Representative Buildings

San Diego representative building coverage exists primarily as embedded arrays in `_data/neighborhoodPages.js`, not in `_data/representativeBuildingCards.js`.

Examples:

- Downtown San Diego: Emerald Plaza, 501 West Broadway, 600 B St, Diamond View, 770 First Avenue
- Mission Valley: 2515 Camino del Rio S, 2650 Camino del Rio N, Centerside I, 3333 Camino del Rio S, Mission Valley - Stonecrest
- UTC / University City: La Jolla Center, Sunroad Corporate Center, The Aventine, High Bluff Drive
- Sorrento Mesa: 10130 Sorrento Valley Rd, 11211 Sorrento Valley Rd, 5440 Morehouse Dr, 6370 Lusk Blvd, 99Twenty
- Kearny Mesa: 3914 Murphy Canyon Rd, 5205 Kearny Villa Way, 3710 Ruffin Rd, 4000 Ruffin Rd, 7240 Clairemont Mesa Blvd
- Miramar: 6906 Miramar Rd, 7055 Carroll Rd, 7545 Carroll Rd, 8250 Camino Santa Fe
- Otay Mesa: 7310 Otay Crossings Ct, Empire Centre Business Park, 9505 Airway Rd, 7615 Siempre Viva Rd
- Carlsbad Business Park: Palomar Point, Cornerstone Corporate, Pacific Ridge Commercial Center, 2300 Faraday Ave
- Vista Business Park: Vista Business Park, 1235 Activity Dr, 2425 La Mirada Dr, 2630 Business Park Dr

This is a strong starting point, but the dedicated representative-building card layer should eventually be populated from these existing building records.

### Knowledge Graph Nodes

`_data/locationKnowledgeGraph.js` currently has zero San Diego nodes. This is the central blocker.

### Recommendation Support

Because San Diego is absent from the Knowledge Graph, current resolver behavior should fall back to non-graph or expert-guided states rather than producing graph-backed San Diego market paths. Page context and autocomplete can help users select San Diego districts, but Compass cannot yet explain them as Knowledge Cards.

### QA Support

`_data/recommendationQaStatus.js` marks San Diego as:

- `qaStatus`: pending
- `validationStatus`: recommendation_readiness_pending
- `scenarioCount`: 0

### Compass Maturity

`functions/admin/coverage.js` configures San Diego as `planned`, with page coverage present and Compass maturity pending.

Qualitative assessment: San Diego is page-rich but Compass-incomplete.

## Step 2 - Discovered Commercial Geography

The following districts/corridors are supported by a combination of building-page concentration, district representative buildings, approximate space types, semantic signals, and existing comparison paths.

### Downtown San Diego

Evidence:

- District row: `/commercial-real-estate/CA/san-diego/downtown-san-diego/`.
- Space types: office, retail, coworking.
- Signals: Downtown, professional services, client-facing, transit-oriented, civic business.
- Building evidence: Emerald Plaza, 501 West Broadway, 600 B St, Diamond View, 770 First Avenue.
- Raw listing evidence: 92101 has the largest exact raw listing concentration, with 64 exact rows, mainly downtown office/coworking addresses.

Why it appears to exist: clear downtown office concentration with client-facing and civic/professional service context.

Confidence: high.

### East Village / Downtown Edge

Evidence:

- District row: East Village.
- Space types: office, retail, coworking.
- Signals: downtown edge, mixed use, creative services, hospitality-adjacent, urban office.
- Building evidence: Diamond View, Spaces Makers Quarter, 770 First Avenue.
- Existing relationship to Downtown San Diego, Little Italy / Columbia, and Mission Valley.

Why it appears to exist: downtown-adjacent office/mixed-use cluster with a different feel from the core CBD.

Confidence: medium. Building count is thinner but coherent.

### Little Italy / Columbia

Evidence:

- District row: Little Italy / Columbia.
- Space types: office, retail, coworking.
- Signals: downtown edge, client-facing, creative services, waterfront access, airport access.
- Building evidence: Spaces Little Italy at 1420 Kettner Blvd, 1025 W Laurel St, Emerald Plaza.
- Existing comparison: Downtown San Diego vs Little Italy / Columbia.

Why it appears to exist: downtown-edge mixed-use/client-facing office district.

Confidence: medium.

### Mission Valley

Evidence:

- District row: Mission Valley.
- Space types: office, medical, retail.
- Signals: suburban office, medical, central San Diego, freeway access.
- Building evidence: 2515 Camino del Rio S, 2650 Camino del Rio N, Centerside I, 3333 Camino del Rio S, Mission Valley - Stonecrest.
- Building pages show repeated 92108 Camino del Rio office addresses.
- Existing comparisons: Downtown San Diego vs Mission Valley; Mission Valley vs UTC / University City.

Why it appears to exist: central freeway-oriented office/medical/service corridor with parking and regional access.

Confidence: high.

### UTC / University City

Evidence:

- District row: UTC / University City.
- Space types: office, medical, life science.
- Signals: office, life science, medical, UCSD, North City.
- Building evidence: La Jolla Center, Sunroad Corporate Center, The Aventine, High Bluff Drive.
- Building pages cluster in 92122 and 92130 for La Jolla Village/University Center/High Bluff.
- Existing comparisons: Mission Valley vs UTC, UTC vs Sorrento Mesa, UTC vs Kearny Mesa, Del Mar Heights vs UTC.

Why it appears to exist: high-amenity North City office/medical/life-science-adjacent business district.

Confidence: high.

### Sorrento Mesa / Sorrento Valley

Evidence:

- District row: Sorrento Mesa with strong model; Sorrento Valley with thinner model.
- Sorrento Mesa space types: office, flex, life science, industrial.
- Sorrento Mesa signals: life science, R&D flex, technology, office flex, North City.
- Building evidence: 10130 Sorrento Valley Rd, 11211 Sorrento Valley Rd, 5440 Morehouse Dr, 6370 Lusk Blvd, 99Twenty, plus Sorrento Valley/Nancy Ridge/Carroll Road records.
- Existing comparisons: UTC vs Sorrento Mesa; Sorrento Mesa vs Torrey Pines; Mira Mesa vs Sorrento Mesa; Carlsbad vs Sorrento Mesa; Carlsbad Business Park vs Sorrento Mesa.

Why it appears to exist: one of the strongest office/R&D/life-science/flex clusters in the data.

Confidence: high.

Recommendation note: Sorrento Mesa and Sorrento Valley should be normalized carefully. Existing data supports both labels, but Compass should probably treat Sorrento Mesa as the primary node and Sorrento Valley as either a sub-area, alias, or supporting corridor unless the product needs both.

### Torrey Pines / La Jolla

Evidence:

- District row: Torrey Pines / La Jolla.
- Space types: office, medical, life science.
- Signals: life science, institutional, medical, coastal office, UCSD.
- Building evidence: 888 Prospect St, 1200 Prospect St.
- Existing comparison: Sorrento Mesa vs Torrey Pines.

Why it appears to exist: research/institutional/life-science-adjacent coastal professional district, though building-page depth is thin.

Confidence: medium. Commercial identity is strong in the district model, but internal building evidence is limited.

### Kearny Mesa

Evidence:

- District row: Kearny Mesa.
- Space types: office, flex, industrial, retail.
- Signals: office flex, service commercial, showroom, central San Diego.
- Building evidence: 3914 Murphy Canyon Rd, 5205 Kearny Villa Way, 3710 Ruffin Rd, 4000 Ruffin Rd, 7240 Clairemont Mesa Blvd.
- Building pages cluster in 92123 and 92111 with office and industrial records.
- Existing comparisons: Kearny Mesa vs Miramar; UTC vs Kearny Mesa; Kearny Mesa vs Rancho Bernardo.

Why it appears to exist: central San Diego office/flex/service commercial/industrial corridor with freeway utility.

Confidence: high.

### Miramar

Evidence:

- District row: Miramar.
- Space types: industrial, flex, office.
- Signals: warehouse, industrial flex, service commercial, R&D flex, North City.
- Building evidence: 6906 Miramar Rd, 7055 Carroll Rd, 7545 Carroll Rd, Soledad Business Center.
- Existing comparison: Kearny Mesa vs Miramar.

Why it appears to exist: functional industrial/flex corridor distinct from polished office districts.

Confidence: high.

### Mira Mesa

Evidence:

- District row: Mira Mesa.
- Space types: office, flex, industrial, retail.
- Signals: office flex, industrial flex, service commercial, North City, workforce access.
- Building evidence: Soledad Business Center, 8525 Camino Santa Fe, 9151 Rehco Rd, Brown Deer Park, Abrams Westview Plaza.
- Existing comparison: Mira Mesa vs Sorrento Mesa.

Why it appears to exist: North City workforce-access and office/flex/service-commercial district between stronger R&D and industrial nodes.

Confidence: medium-high.

### Rancho Bernardo

Evidence:

- District row: Rancho Bernardo.
- Space types: office, flex, industrial.
- Signals: I-15 corridor, business park, R&D flex, manufacturing, suburban office.
- Building evidence: Rancho Bernardo Road, West Bernardo Court, Westridge, Excell Bldg records.
- Existing comparisons: Kearny Mesa vs Rancho Bernardo; Rancho Bernardo vs Poway Business Park.

Why it appears to exist: I-15 suburban business-park/R&D/flex node.

Confidence: high.

### Poway Business Park

Evidence:

- District row: Poway Business Park.
- Space types: industrial, flex, office.
- Signals: I-15 corridor, business park, industrial flex, manufacturing, contractor.
- Building evidence: Tech Center Dr, Paine Pl, Iavelli Way, Danielson St, Stowe Dr, Kirkham Way.
- Existing comparison: Rancho Bernardo vs Poway Business Park.

Why it appears to exist: inland industrial/flex/manufacturing business park tied to I-15 and Poway operations.

Confidence: high.

### Otay Mesa

Evidence:

- District row: Otay Mesa.
- Space types: industrial, flex, office.
- Signals: warehouse, logistics, border, manufacturing, industrial flex.
- Building evidence: 7310 Otay Crossings Ct, Empire Centre Business Park, 9505 Airway Rd, 7615 Siempre Viva Rd, plus 92154 industrial records.
- Existing comparison: Otay Mesa vs Chula Vista.

Why it appears to exist: border-oriented logistics and industrial district.

Confidence: high.

### Chula Vista / South Bay Service Commercial

Evidence:

- District row: Chula Vista.
- Space types: office, medical, retail, flex.
- Signals: South Bay, local services, medical, professional services.
- Building evidence: Gateway Chula Vista, 303 H St, 876 Broadway, 2402 Main St, 2360 Boswell Rd.
- Raw city data references Chula Vista business districts and South County industry sectors.
- Existing comparison: Otay Mesa vs Chula Vista.

Why it appears to exist: South Bay local office/medical/retail/service market distinct from Otay Mesa industrial/logistics.

Confidence: medium-high.

### Carlsbad Business Park / Palomar Airport Corridor

Evidence:

- District rows: Carlsbad Business Park, Bressi Ranch, Carlsbad.
- Carlsbad Business Park types: office, flex, industrial, life science.
- Signals: North County, business park, R&D flex, manufacturing, Palomar Airport.
- Building evidence: Palomar Point, Cornerstone Corporate, Pacific Ridge Commercial Center, Camino Vida Roble, Faraday, Loker, Lionshead, Yarrow, Palomar Airport Road.
- Building pages show 30 Carlsbad records across office and industrial.
- Existing comparisons: Carlsbad vs Sorrento Mesa; Carlsbad Business Park vs Sorrento Mesa; Carlsbad Business Park vs Oceanside Industrial; Carlsbad Business Park vs Vista Business Park.

Why it appears to exist: strongest North County office/R&D/industrial/flex business park cluster in the data.

Confidence: high.

### Bressi Ranch

Evidence:

- District row: Bressi Ranch.
- Space types: office, medical, flex, retail.
- Signals: North County, business park, medical, office flex, retail supported.
- Building evidence: 5858 Edison Pl, 5910 Sea Lion Pl, 6123 Innovation Way, 6150 Yarrow Dr, Pacific Center.

Why it appears to exist: Carlsbad office/medical/service/flex district with retail support.

Confidence: medium-high.

### Oceanside / Oceanside Industrial

Evidence:

- District rows: Oceanside, Oceanside Industrial.
- Oceanside Industrial types: industrial, flex, office.
- Signals: North County, industrial flex, service commercial, Highway 78, contractor.
- Building evidence: 503 Jones Rd industrial; Oceanside Blvd and Coast Hwy office/retail records.
- Building pages show 13 Oceanside records.
- Existing comparisons: Carlsbad vs Oceanside; Carlsbad Business Park vs Oceanside Industrial; Oceanside Industrial vs Vista Business Park.

Why it appears to exist: coastal North County service-commercial and light industrial/flex market.

Confidence: medium-high.

### Vista / Vista Business Park

Evidence:

- District rows: Vista Business Park, Vista.
- Space types: industrial, flex, office.
- Signals: North County, industrial flex, business park, manufacturing, warehouse.
- Building evidence: Vista Business Park, 1235 Activity Dr, 2425 La Mirada Dr, 2445 Grand Ave, 2630 Business Park Dr, 2640 Progress St.
- Building pages show 13 Vista records, mostly industrial.
- Existing comparisons: Vista vs San Marcos; Carlsbad Business Park vs Vista Business Park; Oceanside Industrial vs Vista Business Park.

Why it appears to exist: inland North County industrial/flex/manufacturing cluster.

Confidence: high.

### San Marcos

Evidence:

- District row: San Marcos.
- Space types: office, medical, flex, retail.
- Signals: North County, medical, education-adjacent, local services.
- Building evidence: San Marcos Blvd retail records and 6 Creekside Dr office.
- Existing comparisons: Vista vs San Marcos; Escondido vs San Marcos.

Why it appears to exist: North County medical/local service/education-adjacent commercial node.

Confidence: medium.

### Escondido

Evidence:

- District row: Escondido.
- Space types: office, medical, retail.
- Signals: North County, inland, local services, medical, civic business.
- Building evidence: La Terraza Corporate Plaza, 300 W Grand Ave, 1955 Citracado Parkway, 900 Canterbury Pl, 529 W 4th Ave.
- Existing comparison: Escondido vs San Marcos.

Why it appears to exist: inland North County civic/local-service/medical office market.

Confidence: medium.

## Step 3 - Commercial Corridors

### Downtown / Waterfront / Airport-Adjacent Urban Corridor

Supported nodes: Downtown San Diego, East Village, Little Italy / Columbia, Liberty Station.

Evidence: 92101 raw listing concentration, downtown office buildings, Little Italy/Kettner, Historic Decatur/Liberty Station, comparison paths between Downtown and Little Italy, district signals for airport and waterfront access.

Compass relevance: helps distinguish traditional CBD office, creative downtown edge, visitor-facing office, and airport-adjacent creative office.

Confidence: medium-high.

### Central Freeway Office/Service Corridor

Supported nodes: Mission Valley, Kearny Mesa, Bankers Hill, La Mesa adjacency.

Evidence: Camino del Rio building cluster, Kearny Mesa/Murphy Canyon/Ruffin/Aero/Clairemont Mesa records, commercial models emphasizing central San Diego freeway access and service-commercial utility.

Compass relevance: important for medical, professional service, client-service, office/flex, and parking-sensitive users.

Confidence: high.

### North City Innovation / Life Science / R&D Corridor

Supported nodes: UTC / University City, Sorrento Mesa, Sorrento Valley, Torrey Pines / La Jolla, Del Mar Heights / Carmel Valley, Mira Mesa.

Evidence: 92121 building concentration, Sorrento Valley Road/Lusk/Morehouse/Pacific Heights records, UCSD/life-science signals, UTC/La Jolla Village and High Bluff records, multiple comparison paths.

Compass relevance: essential for technology, life science, R&D, medical, and high-amenity office profiles.

Confidence: high.

### I-15 Inland Business Park Corridor

Supported nodes: Rancho Bernardo, Poway Business Park, Mira Mesa.

Evidence: Rancho Bernardo Road, West Bernardo Court, Stowe, Danielson, Kirkham, Tech Center records; district models emphasize I-15, business park, R&D/flex, manufacturing, contractor.

Compass relevance: should support suburban office, R&D/flex, manufacturing support, and operations users who do not need coastal or downtown identity.

Confidence: high.

### North County Office/R&D/Industrial Corridor

Supported nodes: Carlsbad Business Park, Bressi Ranch, Carlsbad, Oceanside Industrial, Vista Business Park, San Marcos, Escondido.

Evidence: Carlsbad Palomar/Faraday/Camino Vida Roble/Loker/Lionshead records; Vista industrial/business park records; Oceanside Blvd/Jones Road records; Highway 78 references and comparison paths.

Compass relevance: strongest North County market path; important for users comparing coastal business park identity, inland industrial utility, medical/local service, and value-oriented operations.

Confidence: high.

### South Bay / Border Industrial Corridor

Supported nodes: Otay Mesa, Chula Vista, Barrio Logan.

Evidence: Otay Crossings, Airway, Siempre Viva, Sanyo, Enrico Fermi and other 92154 industrial records; Chula Vista office/retail/industrial records; Barrio Logan industrial/retail records; existing Otay Mesa vs Chula Vista comparison.

Compass relevance: needed for logistics, distribution, manufacturing, border-oriented warehouse, local South Bay office/medical, and service commercial.

Confidence: high for Otay Mesa; medium for Chula Vista and Barrio Logan as separate Compass nodes until more graph depth is authored.

## Step 4 - Candidate Knowledge Graph Nodes

Priority is based on recommendation value, data support, and ability to produce differentiated Location Briefs.

| Priority | Proposed node | Proposed slug | Primary commercial role | Supported space types | Likely business fit | Nearby competing districts | Why it matters | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Must have | San Diego | `san-diego` | City-level market path router | office, retail, industrial, flex, medical, life_science | Users starting broad in San Diego | Downtown, Mission Valley, UTC, Sorrento Mesa, Kearny Mesa, Miramar, Otay Mesa | Needed so city-level searches produce a market path instead of a single generic city recommendation | High |
| Must have | Downtown San Diego | `downtown-san-diego` | CBD/client-facing office core | office, coworking, retail | legal, finance, consulting, nonprofit, government-adjacent, client-facing office | Mission Valley, Little Italy / Columbia, East Village, UTC | Strong building and listing evidence; core comparison anchor | High |
| Must have | Mission Valley | `mission-valley` | central freeway office/medical corridor | office, medical, retail | medical office, professional service, regional office, parking-sensitive teams | Downtown San Diego, UTC, Kearny Mesa | Highly useful alternative to downtown and UTC; strong building cluster | High |
| Must have | UTC / University City | `utc-university-city` | high-amenity North City office/medical/life-science-adjacent district | office, medical, life_science | corporate office, professional services, medical, technology, UCSD-adjacent teams | Mission Valley, Sorrento Mesa, Torrey Pines, Del Mar Heights | Central to San Diego office and innovation recommendations | High |
| Must have | Sorrento Mesa | `sorrento-mesa` | technology/life-science/R&D/flex district | office, flex, life_science, industrial, r_and_d | biotech support, technology, engineering, R&D, office/flex users | UTC, Torrey Pines, Miramar, Carlsbad Business Park | Strongest graph-ready innovation/flex node | High |
| Must have | Kearny Mesa | `kearny-mesa` | central office/flex/service-commercial district | office, flex, industrial, retail/showroom | contractor, showroom, medical, office/flex, service commercial | Miramar, Mission Valley, Sorrento Mesa, UTC | Bridges office and industrial decision paths | High |
| Must have | Miramar | `miramar` | industrial/flex/service-commercial corridor | industrial, warehouse, flex, office, showroom | warehouse/flex, contractor, light manufacturing, distribution, R&D/flex | Kearny Mesa, Sorrento Mesa, Otay Mesa, Mira Mesa | Needed for industrial recommendations distinct from polished office nodes | High |
| Must have | Otay Mesa | `otay-mesa` | border logistics/industrial district | industrial, warehouse, distribution, manufacturing, flex | logistics, cross-border, warehouse, manufacturing | Chula Vista, Miramar, Barrio Logan | Essential for industrial/warehouse Location Briefs | High |
| Must have | Carlsbad Business Park | `carlsbad-business-park` | North County office/R&D/industrial business park | office, flex, industrial, life_science, r_and_d | technology, life-science support, manufacturing, office/R&D | Sorrento Mesa, Oceanside Industrial, Vista Business Park, Bressi Ranch | Strong North County anchor with excellent building evidence | High |
| Must have | Vista Business Park | `vista-business-park` | North County industrial/flex business park | industrial, warehouse, flex, manufacturing | manufacturers, contractors, warehouse/flex, service operations | Carlsbad Business Park, Oceanside Industrial, San Marcos | Strong industrial/flex evidence and comparison value | High |
| Must have | Poway Business Park | `poway-business-park` | I-15 industrial/flex/manufacturing business park | industrial, flex, warehouse, office | manufacturing, contractor, warehouse/flex, regional operations | Rancho Bernardo, Miramar, Mira Mesa | Completes I-15 industrial/flex path | High |
| Should have | Rancho Bernardo | `rancho-bernardo` | I-15 suburban office/R&D/flex district | office, flex, industrial, r_and_d | engineering, R&D, light manufacturing, suburban office | Poway Business Park, Mira Mesa, Carlsbad Business Park | Strong suburban office/flex alternative | High |
| Should have | Mira Mesa | `mira-mesa` | North City workforce-access office/flex/service district | office, flex, industrial, retail | office/flex, support office, contractor, light industrial | Sorrento Mesa, Miramar, Rancho Bernardo | Useful middle alternative between R&D and industrial corridors | Medium-high |
| Should have | Torrey Pines / La Jolla | `torrey-pines-la-jolla` | life-science/institutional/coastal professional district | office, medical, life_science | research, specialty medical, life-science, institutional users | Sorrento Mesa, UTC, Del Mar Heights | Important innovation comparison, but internal building evidence is thinner | Medium |
| Should have | Bressi Ranch | `bressi-ranch` | Carlsbad office/medical/service/flex district | office, medical, flex, retail | medical office, local service, wellness, professional service | Carlsbad Business Park, San Marcos, Vista Business Park | Helps avoid treating all Carlsbad searches as industrial/R&D | Medium-high |
| Should have | Oceanside Industrial | `oceanside-industrial` | coastal North County industrial/flex/service market | industrial, flex, office | contractors, light industrial, local operations | Vista Business Park, Carlsbad Business Park, San Marcos | Important value/operational North County alternative | Medium-high |
| Should have | Chula Vista | `chula-vista` | South Bay local office/medical/retail/service market | office, medical, retail, flex, light industrial | South Bay medical, professional service, local retail/service | Otay Mesa, Downtown San Diego, National City if supported later | Separates South Bay service users from border logistics | Medium-high |
| Should have | East Village | `east-village` | downtown-edge creative/mixed-use office | office, coworking, retail | creative, small office, nonprofit, hospitality-adjacent | Downtown San Diego, Little Italy / Columbia, Mission Valley | Adds nuance to downtown recommendations | Medium |
| Should have | Little Italy / Columbia | `little-italy-columbia` | downtown-edge waterfront/airport-adjacent mixed-use office | office, retail, coworking | creative, design, consulting, client-facing small office | Downtown San Diego, East Village, Mission Valley | Strong comparison value for small urban office users | Medium |
| Nice to have | Del Mar Heights / Carmel Valley | `del-mar-heights-carmel-valley` | polished coastal/North City professional office | office, medical, retail | finance, consulting, executive/professional office, wellness | UTC, Sorrento Mesa, Carlsbad | Useful for image/client-facing profiles | Medium |
| Nice to have | Liberty Station | `liberty-station` | creative/mixed-use office campus | office, retail | creative office, small professional, visitor-facing uses | Little Italy / Columbia, Downtown, Mission Valley | Building evidence exists but model is thin | Medium-low |
| Nice to have | Barrio Logan | `barrio-logan` | urban industrial/creative/service district | industrial, retail, office | light industrial, creative industrial, local service | Otay Mesa, Downtown edge, Chula Vista | Useful but requires careful validation | Medium-low |
| Nice to have | San Marcos | `san-marcos` | North County medical/local service/education-adjacent node | office, medical, retail, flex | medical office, education-adjacent service, local office | Vista, Escondido, Bressi Ranch | Useful for North County non-industrial searches | Medium |
| Nice to have | Escondido | `escondido` | inland North County office/medical/local-service market | office, medical, retail | civic/local service, medical, inland customer access | San Marcos, Vista, Poway | Useful for inland customer-serving profiles | Medium |

## Step 5 - Representative Building Suggestions

These are candidate representative buildings from existing Rofo building/listing data only. They should illustrate district environments and should not imply current availability.

| Building | Address | Candidate district | Property type | Why representative | Supporting evidence |
| --- | --- | --- | --- | --- | --- |
| Emerald Plaza | 402 W Broadway | Downtown San Diego | Office | Downtown office/client-facing CBD example | `_data/buildingPages.js`; embedded in Downtown San Diego representative buildings; raw listing rows include office/coworking at same address |
| 501 West Broadway | 501 W Broadway | Downtown San Diego | Office | Core downtown office building | `_data/buildingPages.js`; embedded in Downtown San Diego representative buildings; raw listing rows |
| Diamond View | 350 10th Avenue | Downtown San Diego / East Village | Office | Downtown/East Village office example | `_data/buildingPages.js`; embedded in Downtown and East Village |
| 770 First Avenue | 770 First Avenue | Downtown San Diego | Office | Repeated office/coworking source count in 92101 | `_data/buildingPages.js`; raw listings show high source count |
| Spaces Makers Quarter | 845 15th St | East Village | Office | Downtown-edge creative/coworking-style office environment | `_data/buildingPages.js`; embedded in East Village |
| Spaces Little Italy | 1420 Kettner Blvd | Little Italy / Columbia | Office | Mixed-use downtown-edge office/coworking context | `_data/buildingPages.js`; raw listings; embedded in Little Italy / Columbia |
| Centerside I | 3111 Camino del Rio N | Mission Valley | Office | Mission Valley freeway-oriented office tower/campus context | `_data/buildingPages.js`; embedded in Mission Valley; raw listings |
| 2515 Camino del Rio S | 2515 Camino del Rio S | Mission Valley | Office | Camino del Rio office corridor evidence | `_data/buildingPages.js`; embedded in Mission Valley |
| 2650 Camino del Rio N | 2650 Camino del Rio N | Mission Valley | Office | Repeated Mission Valley office address | `_data/buildingPages.js`; embedded in Mission Valley |
| Mission Valley - Stonecrest | 9635 Granite Ridge Dr | Mission Valley | Office | Mission Valley/Stonecrest suburban office context | `_data/buildingPages.js`; embedded in Mission Valley; raw listings |
| La Jolla Center | 4660 La Jolla Village Dr | UTC / University City | Office | UTC/La Jolla Village office tower context | `_data/buildingPages.js`; embedded in UTC / University City; raw listings |
| Sunroad Corporate Center | 4445 Eastgate Mall, Suite 200 | UTC / University City | Office | University City office/life-science-adjacent environment | `_data/buildingPages.js`; embedded in UTC / University City; raw listings |
| The Aventine | 8910 University Center Ln | UTC / University City | Office | University Center office example | `_data/buildingPages.js`; embedded in UTC / University City |
| High Bluff Drive | 12707 & 12777 High Bluff Drive | Del Mar Heights / Carmel Valley | Coworking / office | Coastal North City professional office/coworking example | `_data/buildingPages.js`; embedded in UTC and Del Mar Heights / Carmel Valley; raw listings |
| 10130 Sorrento Valley Rd | 10130 Sorrento Valley Rd | Sorrento Mesa / Sorrento Valley | Office | Sorrento Valley Road office/R&D corridor evidence | `_data/buildingPages.js`; embedded in Sorrento Mesa and Sorrento Valley |
| 11211 Sorrento Valley Rd | 11211 Sorrento Valley Rd | Sorrento Mesa / Sorrento Valley | Office | Sorrento Valley office/R&D context | `_data/buildingPages.js`; embedded in Sorrento Mesa |
| 6370 Lusk Blvd | 6370 Lusk Blvd | Sorrento Mesa | Office | Barnes Canyon/Lusk office/flex context | `_data/buildingPages.js`; embedded in Sorrento Mesa |
| 99Twenty | 9920 Pacific Heights Blvd | Sorrento Mesa | Office | Pacific Heights/Sorrento Mesa office example | `_data/buildingPages.js`; embedded in Sorrento Mesa; raw listings |
| 4000 Ruffin Rd | 4000 Ruffin Rd | Kearny Mesa | Industrial | Kearny Mesa industrial/flex example | `_data/buildingPages.js`; embedded in Kearny Mesa |
| 3914 Murphy Canyon Rd | 3914 Murphy Canyon Rd | Kearny Mesa | Office | Kearny Mesa office/service-commercial address | `_data/buildingPages.js`; embedded in Kearny Mesa |
| 5205 Kearny Villa Way | 5205 Kearny Villa Way | Kearny Mesa | Office | Kearny Villa office corridor example | `_data/buildingPages.js`; embedded in Kearny Mesa |
| 7240 Clairemont Mesa Blvd | 7240 Clairemont Mesa Blvd | Kearny Mesa | Industrial | Clairemont Mesa industrial/service-commercial building | `_data/buildingPages.js`; embedded in Kearny Mesa |
| 7055 Carroll Rd | 7055 Carroll Rd | Miramar | Industrial | Miramar industrial/flex corridor example | `_data/buildingPages.js`; embedded in Miramar and Sorrento Valley |
| 7545 Carroll Rd | 7545 Carroll Rd | Miramar | Industrial | Carroll Road industrial/flex evidence | `_data/buildingPages.js`; embedded in Miramar |
| Soledad Business Center | 8250 Camino Santa Fe | Mira Mesa / Miramar | Industrial | North City industrial/flex business center | `_data/buildingPages.js`; embedded in Mira Mesa and Miramar |
| 7310 Otay Crossings Ct | 7310 Otay Crossings Ct | Otay Mesa | Industrial | Border/logistics industrial example | `_data/buildingPages.js`; embedded in Otay Mesa |
| Empire Centre Business Park | 7880 Airway Rd | Otay Mesa | Industrial | Otay Mesa industrial/business park example | `_data/buildingPages.js`; embedded in Otay Mesa |
| 9505 Airway Rd | 9505 Airway Rd | Otay Mesa | Industrial | Airway Road industrial/logistics evidence | `_data/buildingPages.js`; embedded in Otay Mesa |
| 7615 Siempre Viva Rd | 7615 Siempre Viva Rd | Otay Mesa | Industrial | Border industrial corridor evidence | `_data/buildingPages.js`; embedded in Otay Mesa |
| Palomar Point | 1815 Aston Ave | Carlsbad Business Park | Industrial | Carlsbad office/R&D/industrial business park example | `_data/buildingPages.js`; embedded in Carlsbad and Carlsbad Business Park |
| Cornerstone Corporate | 1902 Wright Place | Carlsbad Business Park | Office | Carlsbad corporate office/business park example | `_data/buildingPages.js`; raw listings; embedded in Carlsbad Business Park |
| Pacific Ridge Commercial Center | 1945 Camino Vida Roble | Carlsbad Business Park | Office | Camino Vida Roble office/business park example | `_data/buildingPages.js`; embedded in Carlsbad Business Park |
| 2300 Faraday Ave | 2300 Faraday Ave | Carlsbad Business Park | Industrial | Faraday Avenue R&D/industrial evidence | `_data/buildingPages.js`; embedded in Carlsbad Business Park |
| Pacific Center | 701 Palomar Airport Rd | Bressi Ranch / Carlsbad | Office | Palomar Airport Road office context | `_data/buildingPages.js`; raw listings; embedded in Bressi Ranch and Carlsbad |
| Vista Business Park | 1120 Sycamore Ave | Vista Business Park | Industrial | Named business-park industrial representative | `_data/buildingPages.js`; embedded in Vista Business Park |
| 1235 Activity Dr | 1235 Activity Dr | Vista Business Park | Industrial | Vista industrial/flex corridor evidence | `_data/buildingPages.js`; embedded in Vista Business Park |
| 2630 Business Park Dr | 2630 Business Park Dr | Vista Business Park | Industrial | Business Park Drive industrial evidence | `_data/buildingPages.js`; embedded in Vista Business Park |
| 12120 Tech Center Dr | 12120 Tech Center Dr | Poway Business Park | Industrial | Tech Center industrial/flex example | `_data/buildingPages.js`; embedded in Poway Business Park |
| Poway Heights Corporate Plaza | 13025-13029 Danielson St | Poway Business Park | Office | Poway office/business park example | `_data/buildingPages.js`; embedded in Poway Business Park |
| 14035-14055 Kirkham Way | 14035-14055 Kirkham Way | Poway Business Park | Industrial | Poway large industrial/flex evidence | `_data/buildingPages.js`; space-type page evidence |
| Gateway Chula Vista | 333 H St | Chula Vista | Office | South Bay office/local-service representative | `_data/buildingPages.js`; raw listings; embedded in Chula Vista |
| 2402 Main St | 2402 Main St | Chula Vista | Industrial | South Bay industrial/service-commercial example | `_data/buildingPages.js`; embedded in Chula Vista |
| La Terraza Corporate Plaza | 500 La Terraza Blvd | Escondido | Office | Inland North County office representative | `_data/buildingPages.js`; raw listings; embedded in Escondido |
| 300 W Grand Ave | 300 W Grand Ave | Escondido | Office | Downtown/civic local office example | `_data/buildingPages.js`; embedded in Escondido |
| 6 Creekside Dr | 6 Creekside Dr | San Marcos | Office | San Marcos office/medical/local service representative | `_data/buildingPages.js`; embedded in San Marcos |

## Step 6 - Commercial Relationships

### Must-Have Comparison Relationships

- Downtown San Diego vs Mission Valley: urban client-facing office versus central freeway/parking-oriented office and medical.
- Downtown San Diego vs UTC / University City: urban CBD/civic identity versus North City high-amenity office and life-science-adjacent context.
- Downtown San Diego vs Little Italy / Columbia: traditional downtown core versus mixed-use downtown-edge/client-facing office.
- East Village vs Downtown San Diego: creative/mixed-use downtown edge versus core office/civic district.
- Mission Valley vs UTC / University City: central freeway office/medical versus North City office/medical/life-science-adjacent district.
- Mission Valley vs Kearny Mesa: freeway-oriented office/medical versus central service-commercial/office-flex utility.
- UTC / University City vs Sorrento Mesa: high-amenity office/medical versus R&D/flex/life-science operational district.
- Sorrento Mesa vs Torrey Pines / La Jolla: functional R&D/flex/life-science district versus institutional/coastal life-science and medical context.
- Sorrento Mesa vs Miramar: innovation/R&D/flex versus more industrial/service-commercial functionality.
- Kearny Mesa vs Miramar: central office/flex/showroom/service-commercial versus industrial/warehouse/flex.
- Mira Mesa vs Sorrento Mesa: workforce-access office/flex/service district versus stronger innovation/R&D node.
- Rancho Bernardo vs Poway Business Park: I-15 suburban office/R&D versus industrial/flex/manufacturing business park.
- Rancho Bernardo vs Mira Mesa: suburban business park/I-15 access versus North City workforce/service-commercial access.
- Otay Mesa vs Chula Vista: border industrial/logistics versus South Bay local office/medical/service market.
- Otay Mesa vs Miramar: border logistics/warehouse versus central/north industrial/flex/service-commercial.
- Carlsbad Business Park vs Sorrento Mesa: North County business park/R&D/manufacturing versus central North City life-science/R&D ecosystem.
- Carlsbad Business Park vs Vista Business Park: polished North County office/R&D/manufacturing park versus inland industrial/flex utility.
- Carlsbad Business Park vs Oceanside Industrial: business park/R&D/flex versus coastal light industrial/service operations.
- Bressi Ranch vs Carlsbad Business Park: medical/local service/retail-supported office/flex versus deeper office/R&D/industrial business park.
- Oceanside Industrial vs Vista Business Park: coastal North County industrial/service-commercial versus inland industrial/flex/manufacturing.
- Vista vs San Marcos: industrial/flex utility versus medical/education/local-service market.
- San Marcos vs Escondido: North County medical/education/local-service versus inland civic/local-service market.

### Should-Have Cross-Metro Relationships

- Carlsbad Business Park vs Irvine Spectrum: North County San Diego office/R&D/flex versus Orange County corporate/technology district. Existing Orange County comparison architecture already links Irvine Spectrum with San Diego innovation districts.
- UTC / University City vs Irvine Spectrum: North City high-amenity office/life-science-adjacent versus Orange County corporate/technology district.
- Sorrento Mesa vs Irvine Spectrum: San Diego R&D/flex/life-science versus Orange County technology/corporate district.

These should remain secondary until the San Diego internal graph is strong.

## Step 7 - Recommendation Intelligence

### Strengths

- San Diego has clear commercial district structure already present in Rofo data.
- The district layer includes useful commercial identity for many nodes: best-fit businesses, poor-fit businesses, compare_with, office profile, warehouse/flex profile.
- Building evidence is good enough to support representative-building modules for most priority districts.
- Existing comparison pages already reflect tenant decision paths rather than random geography.
- Autocomplete should already surface city and district entries because `/data/location-search.json` is generated from `cities.generated.json` and `neighborhoodPages.js`.

### Weaknesses

- No San Diego nodes exist in `_data/locationKnowledgeGraph.js`.
- No San Diego `spaceTypeFit` exists in Compass format.
- No San Diego general attributes, retailAttributes, industrialAttributes, bestFor, tradeoffs, relationships.compareWith, or questionsToValidate exist in Knowledge Card format.
- Dedicated representative-building card files have no San Diego entries.
- District model fields are not uniform; some rows have strong `commercial_location_model`, while others have only signals and buildings.
- City-level San Diego does not yet have a Compass market path to route office, medical, industrial, flex, and retail profiles differently.
- No San Diego Recommendation QA scenarios exist.

### Likely Blind Spots

- Medical office needs better explicit handling across Mission Valley, UTC, Torrey Pines / La Jolla, Chula Vista, Bressi Ranch, San Marcos, and Escondido.
- Retail/service needs are visible but not Compass-modeled, especially in Chula Vista, Oceanside, Little Italy / Columbia, Bankers Hill, and Del Mar Heights / Carmel Valley.
- Industrial/warehouse needs should not collapse into one generic industrial answer; Miramar, Otay Mesa, Vista Business Park, Poway Business Park, Oceanside Industrial, and Carlsbad Business Park serve different operational profiles.
- Sorrento Mesa versus Sorrento Valley label normalization needs product judgment.
- University City and UTC / University City duplicate/overlap should be normalized before authoring Compass nodes.
- San Diego city-level recommendations need logic for “where in San Diego” rather than recommending the whole city.

### Missing Reasoning

San Diego Compass needs explicit comparative reasoning such as:

- Why an office user should start in Downtown versus Mission Valley versus UTC.
- Why a life-science/R&D user should compare Sorrento Mesa, UTC, and Torrey Pines.
- Why a warehouse user should consider Otay Mesa versus Miramar versus Vista/Poway.
- Why a North County business might choose Carlsbad Business Park over Vista Business Park or Oceanside Industrial.
- Why a South Bay local-service profile is not the same as a border logistics profile.

### Missing Validation Questions

Examples needed by node:

- Downtown San Diego: Do clients visit frequently? Is transit more important than parking? Does a CBD address matter?
- Mission Valley: How important is employee/customer parking? Are medical visits part of the use case? Is freeway access more important than walkability?
- UTC / University City: Is UCSD/Torrey Pines proximity meaningful? Do employees commute from North County? Is premium image worth the tradeoff?
- Sorrento Mesa: Do you need lab/R&D/flex functionality? Is loading or technical buildout important? Do you need proximity to life-science/technology peers?
- Miramar: Do you need truck access, loading, showroom, yard, or contractor-friendly operations?
- Otay Mesa: Do you need border access, distribution, warehouse scale, trailer circulation, or manufacturing support?
- Carlsbad Business Park: Is North County labor access more important than central San Diego access? Do you need office/R&D or manufacturing/flex?
- Vista Business Park: Is lower-cost functional industrial/flex more important than coastal identity?

## Step 8 - Compass Readiness Assessment

| Compass standard | Assessment | Rationale |
| --- | --- | --- |
| Commercial Geography | Strong but not Compass-normalized | District/page graph is broad and commercially coherent. Needs slug/label normalization and city-level market paths. |
| Knowledge Graph | Not ready | Zero San Diego nodes in `_data/locationKnowledgeGraph.js`. |
| Representative Buildings | Partial | Strong embedded candidates exist in district records and building pages. Dedicated representative-building card layer is empty for San Diego. |
| Comparison Relationships | Strong page-level base | Existing comparison pages cover many correct tenant paths. Need Knowledge Graph relationships with relationshipType and reasons. |
| Questions To Validate | Not ready | No San Diego Knowledge Card questionsToValidate. |
| SpaceTypeFit | Not ready | Space types exist in district data, but not in Compass `spaceTypeFit` schema. |
| Recommendation Resolver | Not ready for graph-backed San Diego | Resolver can consume graph nodes, but no San Diego graph data exists. |
| Location Brief Quality | Expert-guided or generic until graph authored | Without Knowledge Cards, Location Briefs cannot explain San Diego recommendations deeply. |
| Recommendation QA | Pending | `_data/recommendationQaStatus.js` has San Diego pending with zero scenarios. |
| Explainability | Pending | Explainability layer requires graph-backed selection rationale, matched priorities, tradeoffs, and validation focus. |

Overall maturity: planned / pre-Compass. San Diego has strong source material, but it should not be marked Compass Ready.

## Step 9 - Learning Opportunities

### Normalize Overlapping Districts

- Treat `UTC / University City` as the primary Compass node; keep `University City` as an alias or thinner supporting page unless there is a distinct reason to split.
- Treat `Sorrento Mesa` as the primary Compass node; decide whether `Sorrento Valley` is an alias, sub-area, or separate node for corridor-specific building evidence.
- Treat `Little Italy / Columbia` as the stronger Compass candidate; `Little Italy` alone appears thinner.

### Add City-Level Market Path Logic

San Diego city-level profiles should route by space type:

- Office: Downtown San Diego, Mission Valley, UTC / University City, Sorrento Mesa, Kearny Mesa.
- Medical: Mission Valley, UTC / University City, Torrey Pines / La Jolla, Chula Vista, Bressi Ranch, San Marcos.
- Life science / R&D: Sorrento Mesa, UTC / University City, Torrey Pines / La Jolla, Carlsbad Business Park.
- Industrial / warehouse: Otay Mesa, Miramar, Kearny Mesa, Vista Business Park, Poway Business Park, Oceanside Industrial.
- Flex: Sorrento Mesa, Kearny Mesa, Miramar, Mira Mesa, Rancho Bernardo, Carlsbad Business Park.
- Retail/service: Chula Vista, Oceanside, Little Italy / Columbia, Mission Valley, Bankers Hill if validated.

### Improve Industrial Differentiation

Compass should learn that:

- Otay Mesa is border/logistics/distribution/manufacturing.
- Miramar is central/north industrial/flex/service-commercial.
- Kearny Mesa is office/flex/showroom/service-commercial with some industrial utility.
- Poway Business Park is inland industrial/flex/manufacturing.
- Vista Business Park is North County industrial/flex/manufacturing.
- Oceanside Industrial is North County coastal service-commercial/light industrial.
- Carlsbad Business Park is more office/R&D/manufacturing/flex than pure warehouse.

### Improve Medical Office Intelligence

Medical should be explicit across Mission Valley, UTC / University City, Torrey Pines / La Jolla, Bressi Ranch, Chula Vista, San Marcos, and Escondido. The current district signals support this, but Compass needs patient-access tradeoffs, parking, adjacency, and customer geography.

### Convert Embedded Buildings Into Representative Building Cards

San Diego has candidate representative buildings already embedded in districts. The next improvement is to promote the best candidates into the representative-building card layer with:

- source basis
- confidence
- district consistency
- commercial relevance
- canonical path

### Add Recommendation QA Before Readiness

San Diego needs realistic QA scenarios before Compass Ready status:

- Downtown professional services office
- Mission Valley medical office
- UTC executive/professional office
- Sorrento Mesa life-science/R&D user
- Miramar contractor/showroom/flex user
- Otay Mesa warehouse/distribution user
- Carlsbad North County R&D/flex user
- Vista/Poway light manufacturing or warehouse/flex user
- Chula Vista South Bay medical/local-service user

## Step 10 - Suggested Implementation Plan

### Must Have

1. Author San Diego Knowledge Graph seed nodes:
   - San Diego city-level
   - Downtown San Diego
   - Mission Valley
   - UTC / University City
   - Sorrento Mesa
   - Kearny Mesa
   - Miramar
   - Otay Mesa
   - Rancho Bernardo
   - Poway Business Park
   - Carlsbad Business Park
   - Vista Business Park
   - Oceanside Industrial

2. Add `spaceTypeFit` for office, medical, life_science, r_and_d, flex, industrial, warehouse, retail where supported.

3. Add general attributes, retailAttributes, and industrialAttributes per node.

4. Add `bestFor`, `tradeoffs`, `strengths`, and `questionsToValidate`.

5. Add relationship objects with slugs, reasons, and relationshipType for all must-have comparison paths.

6. Build San Diego city-level market paths by space type.

7. Promote representative-building candidates from existing building pages and district embedded arrays into curated representative-building cards where the current system expects them.

8. Create San Diego Recommendation QA scenarios and report.

### Should Have

1. Add additional Knowledge Cards:
   - Bressi Ranch
   - Torrey Pines / La Jolla
   - Mira Mesa
   - Chula Vista
   - East Village
   - Little Italy / Columbia
   - Del Mar Heights / Carmel Valley
   - San Marcos
   - Escondido

2. Normalize aliases:
   - UTC / University City vs University City
   - Sorrento Mesa vs Sorrento Valley
   - Little Italy / Columbia vs Little Italy

3. Add medical-office-specific recommendation guidance.

4. Add industrial QA scenarios that force different outcomes for Otay Mesa, Miramar, Poway, Vista, and Carlsbad.

5. Update Compass Coverage dashboard notes after Knowledge Cards and QA exist, but keep San Diego below Compass Ready until QA passes.

### Nice To Have

1. Add thinner but useful nodes for:
   - Liberty Station
   - Barrio Logan
   - Bankers Hill
   - Oceanside
   - Carlsbad city-level
   - San Marcos
   - Escondido

2. Add cross-metro comparison paths to Orange County after San Diego internal paths are stable:
   - UTC / University City vs Irvine Spectrum
   - Sorrento Mesa vs Irvine Spectrum
   - Carlsbad Business Park vs Irvine Spectrum

3. Use the large derived semantic identity file to validate representative-building confidence after the initial graph is authored.

4. Add a San Diego-specific Location Brief sample once QA passes.

## Recommended Next Sprint

Sprint: San Diego Compass Knowledge Graph Seed.

Objective: Convert existing San Diego commercial data into Compass Knowledge Cards without adding new pages.

Deliverables:

- Seed 13 must-have Knowledge Graph nodes.
- Add San Diego city-level market paths by space type.
- Add 35-50 compare relationships with reasons.
- Add questionsToValidate for each node.
- Attach only existing representative building paths.
- Add 8-10 San Diego Recommendation QA scenarios.
- Run coverage and QA scripts.

Success criteria:

- San Diego / Office produces a differentiated market path.
- San Diego / Industrial or Warehouse does not default to office districts.
- Sorrento Mesa / Office or R&D produces life-science/R&D/flex-aware guidance.
- Otay Mesa / Warehouse produces border/logistics guidance.
- Carlsbad Business Park / Flex produces North County office/R&D/manufacturing guidance.
- Chula Vista / Medical produces local South Bay service/medical guidance, not Otay Mesa logistics.
- QA shows differentiated primary recommendations and clear explanation quality.

San Diego should remain "Planned" or "Enhancing" until this implementation and QA pass.
