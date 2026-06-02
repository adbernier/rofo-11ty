const MAX_CARDS_PER_DISTRICT = 15;

const WEIGHTS = {
  listing_frequency: 18,
  recent_activity: 12,
  keyword_relevance: 18,
  building_prominence: 14,
  multiple_listing_references: 12,
  district_consistency: 14,
  commercial_relevance: 12,
};

function normalizeSignal(value) {
  const numeric = Number(value || 0);
  return Math.max(0, Math.min(5, numeric)) / 5;
}

function representativeScore(card) {
  const evidence = card.evidence || {};
  return Math.round(
    Object.entries(WEIGHTS).reduce(
      (total, [key, weight]) => total + normalizeSignal(evidence[key]) * weight,
      0
    )
  );
}

function evidence(overrides = {}) {
  return {
    listing_frequency: 3,
    recent_activity: 3,
    keyword_relevance: 4,
    building_prominence: 3,
    multiple_listing_references: 3,
    district_consistency: 4,
    commercial_relevance: 4,
    ...overrides,
  };
}

function card(
  name,
  address,
  building_type_summary,
  descriptor,
  representative_reason,
  evidenceSignals,
  options = {}
) {
  return {
    name,
    address,
    building_type_summary,
    size: options.size || null,
    descriptor,
    representative_reason,
    canonical_path: options.canonical_path || null,
    image: options.image || null,
    source_basis: options.source_basis || "historical_listing_and_building_signals",
    keyword_tags: options.keyword_tags || [],
    evidence: evidence(evidenceSignals),
  };
}

const districtCards = {
  "/commercial-real-estate/CA/san-jose/north-san-jose/": [
    card("North First Street office/R&D building", "2665 N 1st St", "Office / R&D", "Multi-tenant technology office near the North First Street corridor.", "Shows the office/R&D format that defines North San Jose's large-block tech environment.", { listing_frequency: 5, keyword_relevance: 5, district_consistency: 5 }, { keyword_tags: ["office", "R&D", "North First"] }),
    card("Technology Drive flex building", "Technology Dr", "Flex / R&D", "Low-rise flex space serving hardware, engineering, and service-commercial users.", "Represents the flexible office-industrial buildings common north of downtown San Jose.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Zanker Road R&D building", "Zanker Rd", "R&D / light industrial", "R&D-oriented building in the Zanker and Montague business corridor.", "Helps explain North San Jose as a practical technology and production-adjacent district.", { listing_frequency: 4, district_consistency: 5 }),
    card("Orchard Parkway office building", "Orchard Pkwy", "Technology office", "Campus-style office setting near major North San Jose employers.", "Shows the larger, auto-oriented office blocks that differentiate this district from downtowns.", { building_prominence: 4, commercial_relevance: 5 }),
    card("Component Drive industrial/flex building", "Component Dr", "Industrial / flex", "Serviceable flex-industrial property near the airport-side business grid.", "Adds the industrial/flex side of North San Jose rather than only office campus examples.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Junction Avenue R&D building", "Junction Ave", "R&D / office", "Functional R&D space along a corridor with repeated business-park listing activity.", "Represents the district's practical engineering and technical-user building stock.", { listing_frequency: 4, multiple_listing_references: 4 }),
    card("Charcot Avenue flex building", "Charcot Ave", "Flex / service commercial", "Smaller flex-commercial property type near the core business park network.", "Shows the mid-scale service and flex spaces that support larger technology campuses.", { keyword_relevance: 4, district_consistency: 5 }),
    card("River Oaks Parkway office campus", "River Oaks Pkwy", "Office campus", "Larger landscaped office campus environment near the Guadalupe River corridor.", "Represents the corporate-campus side of North San Jose's location decision.", { building_prominence: 5, commercial_relevance: 4 }),
    card("Trimble Road industrial building", "Trimble Rd", "Industrial / flex", "Industrial and service-commercial format close to freeway and airport access.", "Explains why North San Jose is also evaluated by flex and operations-oriented users.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Montague Expressway business park", "Montague Expy", "Office / flex", "Business-park building near regional commute and supplier corridors.", "Shows the regional-access logic behind North San Jose's office/flex demand.", { district_consistency: 5, commercial_relevance: 4 }),
    card("Brokaw Road service commercial building", "Brokaw Rd", "Service commercial", "Commercial support building on the edge of the airport and business park grid.", "Adds a service-commercial layer that keeps the district from reading as only office campuses.", { keyword_relevance: 4, district_consistency: 4 }),
  ],

  "/commercial-real-estate/CA/sunnyvale/moffett-park/": [
    card("Borregas Avenue R&D building", "1195 Borregas Ave", "R&D / office", "Technology-oriented R&D building in the Moffett Park business grid.", "Shows the district's core office/R&D pattern near major campus users.", { listing_frequency: 5, keyword_relevance: 5, district_consistency: 5 }),
    card("Borregas Avenue office campus", "1277 Borregas Ave", "Office campus", "Campus-style office property in the heart of Moffett Park.", "Represents larger technology-user buildings that define the district's commercial identity.", { building_prominence: 5, commercial_relevance: 5 }),
    card("Kifer Road flex/R&D building", "1310 Kifer Rd", "Flex / R&D", "Low-rise R&D and flex format along a practical business corridor.", "Adds flexible technical-user building stock to the Moffett Park picture.", { keyword_relevance: 5, multiple_listing_references: 4 }),
    card("North Mary Avenue office building", "415 N Mary Ave", "Office / R&D", "Office/R&D building with access to Sunnyvale's northern business district.", "Shows the transitional edge between Moffett Park and the broader Sunnyvale office market.", { district_consistency: 4, commercial_relevance: 4 }),
    card("Lakeway Drive office building", "710 Lakeway Dr", "Technology office", "Business-park office environment within Moffett Park's campus-oriented geography.", "Represents the repeatable office building form users compare against North Bayshore and Santa Clara.", { building_prominence: 4, keyword_relevance: 4 }),
    card("Almanor Avenue office/R&D building", "525 Almanor Ave", "Office / R&D", "Functional office/R&D building near the Java and Caribbean corridor.", "Helps show Moffett Park as a technical-user district rather than a traditional downtown.", { district_consistency: 5, commercial_relevance: 4 }),
    card("Bordeaux Drive campus block", "Bordeaux Dr", "Office campus", "Large-format campus block associated with Moffett Park's technology concentration.", "Explains why this district fits larger office and R&D users better than streetfront firms.", { building_prominence: 5, keyword_relevance: 4 }),
    card("Java Drive business park building", "Java Dr", "Office / R&D", "Business-park property near the northern Sunnyvale employment cluster.", "Represents the campus and R&D blocks that make Moffett Park a regional alternative.", { district_consistency: 5, commercial_relevance: 5 }),
    card("Caribbean Drive R&D building", "Caribbean Dr", "R&D / office", "R&D-oriented building near the bayfront business-park edge.", "Shows the district's connection to larger technical and life-science-adjacent users.", { keyword_relevance: 4, commercial_relevance: 5 }),
    card("Mathilda Avenue edge office", "N Mathilda Ave", "Office / flex", "Edge-of-district office setting connecting Moffett Park to central Sunnyvale.", "Helps users understand Moffett Park's access pattern and transition to nearby alternatives.", { district_consistency: 4, commercial_relevance: 4 }),
  ],

  "/commercial-real-estate/CA/mountain-view/north-bayshore/": [
    card("Amphitheatre Parkway campus building", "Amphitheatre Pkwy", "Technology campus", "Large-format technology campus space near the bayfront employment core.", "Represents North Bayshore's most recognizable campus-oriented office form.", { building_prominence: 5, keyword_relevance: 5, district_consistency: 5 }),
    card("Charleston Road R&D building", "Charleston Rd", "R&D / office", "Technical office/R&D building along a key North Bayshore corridor.", "Shows the district's practical R&D layer below the major campus scale.", { listing_frequency: 4, keyword_relevance: 5 }),
    card("Shoreline office campus", "Shoreline Blvd", "Office campus", "Campus-oriented office building near Shoreline access and bayfront employers.", "Explains why North Bayshore is compared with Moffett Park and Stanford Research Park.", { building_prominence: 5, commercial_relevance: 5 }),
    card("Garcia Avenue R&D building", "Garcia Ave", "R&D / flex", "Low-rise R&D/flex property in the core employment grid.", "Adds a flexible technical-user format to the district's campus-heavy identity.", { keyword_relevance: 5, district_consistency: 5 }),
    card("Stierlin Court office/flex building", "Stierlin Ct", "Office / flex", "Smaller office/flex building on the southern edge of North Bayshore.", "Shows how the district transitions toward downtown Mountain View and Caltrain-oriented alternatives.", { district_consistency: 4, commercial_relevance: 4 }),
    card("Bayshore Parkway office building", "Bayshore Pkwy", "Office / R&D", "Business-park office property near the bayfront commute network.", "Represents North Bayshore's large-block office and R&D geography.", { keyword_relevance: 4, commercial_relevance: 5 }),
    card("Plymouth Street industrial edge", "Plymouth St", "Industrial / service commercial", "Service-commercial and light industrial edge condition near the district boundary.", "Helps avoid reading North Bayshore as only major technology campuses.", { keyword_relevance: 5, district_consistency: 4 }),
    card("Rengstorff Avenue office edge", "N Rengstorff Ave", "Office / service commercial", "Edge-of-district commercial building connecting North Bayshore to central Mountain View.", "Shows the access and transition pattern users weigh against Downtown Mountain View.", { commercial_relevance: 4, district_consistency: 4 }),
    card("Alta Avenue flex building", "Alta Ave", "Flex / service commercial", "Smaller flex-commercial building near the district's industrial support edge.", "Represents the supporting business ecosystem around larger campus users.", { keyword_relevance: 4, multiple_listing_references: 3 }),
    card("Charleston business park block", "Charleston Rd", "Office / R&D", "Repeatable office/R&D block format in the North Bayshore employment district.", "Shows the building pattern behind North Bayshore's office and R&D demand.", { district_consistency: 5, commercial_relevance: 5 }),
  ],

  "/commercial-real-estate/CA/san-diego/sorrento-mesa/": [
    card("10130 Sorrento Valley Road", "10130 Sorrento Valley Rd", "Office / life science", "Sorrento Valley Road office/R&D building in a technical-user corridor.", "Shows Sorrento Mesa's blend of office, biotech, and R&D-oriented building stock.", { listing_frequency: 5, keyword_relevance: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/san-diego/10130-sorrento-valley-rd/" }),
    card("11211 Sorrento Valley Road", "11211 Sorrento Valley Rd", "R&D / flex", "Functional office/R&D building near the Sorrento Valley spine.", "Represents the flexible technical spaces common to this market.", { keyword_relevance: 5, multiple_listing_references: 4 }, { canonical_path: "/commercial-real-estate/building/CA/san-diego/11211-sorrento-valley-rd/" }),
    card("5440 Morehouse Drive", "5440 Morehouse Dr", "Technology office", "Campus-like office building near major Sorrento Mesa employers.", "Shows the larger office environment that competes with UTC and Torrey Pines.", { building_prominence: 5, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/san-diego/5440-morehouse-dr/" }),
    card("6370 Lusk Boulevard", "6370 Lusk Blvd", "R&D / office", "R&D-oriented office building along the Lusk corridor.", "Represents Sorrento Mesa's science, engineering, and technical-user identity.", { keyword_relevance: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/san-diego/6370-lusk-blvd/" }),
    card("9920 Pacific Heights Boulevard", "9920 Pacific Heights Blvd", "Office / R&D", "Office/R&D building near Pacific Heights and Mira Mesa access.", "Shows the district's freeway-oriented office and R&D geography.", { district_consistency: 5, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/san-diego/9920-pacific-heights-blvd/" }),
    card("Nancy Ridge life science building", "Nancy Ridge Dr", "Life science / R&D", "Lab-adjacent and R&D building type near the Sorrento Mesa technical cluster.", "Adds a life-science-oriented property pattern beyond general office examples.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Carroll Canyon industrial edge", "Carroll Canyon Rd", "Industrial / flex", "Industrial/flex space serving production, service, and technical users.", "Explains the district's flex-industrial layer and its connection to Miramar.", { keyword_relevance: 5, district_consistency: 4 }),
    card("Scranton Road office building", "Scranton Rd", "Office / flex", "Business-park office property close to I-805 access.", "Represents the practical commute and access logic of Sorrento Mesa.", { commercial_relevance: 4, district_consistency: 4 }),
    card("Oberlin Drive R&D building", "Oberlin Dr", "R&D / office", "Technical-user office/R&D building in the Sorrento Mesa business grid.", "Shows the repeated R&D building form behind the district's commercial identity.", { keyword_relevance: 5, multiple_listing_references: 4 }),
    card("Camino Santa Fe light industrial building", "Camino Santa Fe", "Light industrial / flex", "Flex-industrial building on the Sorrento Mesa and Miramar edge.", "Adds the industrial/flex comparison users consider against Miramar.", { keyword_relevance: 5, commercial_relevance: 4 }),
  ],

  "/commercial-real-estate/CA/palo-alto/stanford-research-park/": [
    card("Page Mill Road research campus", "Page Mill Rd", "R&D campus", "Research-oriented campus building near Stanford's employment corridor.", "Represents the district's core research-park identity and larger campus format.", { building_prominence: 5, keyword_relevance: 5, district_consistency: 5 }),
    card("Hanover Street R&D building", "Hanover St", "R&D / office", "Low-rise R&D office building in the research park grid.", "Shows the technical-user buildings that distinguish Stanford Research Park from Downtown Palo Alto.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Hillview Avenue research office", "Hillview Ave", "Research office", "Professional research and technology office setting near the Stanford edge.", "Adds an office/R&D example with institutional and innovation-context value.", { district_consistency: 5, commercial_relevance: 4 }),
    card("Porter Drive office/lab building", "Porter Dr", "Office / lab", "Office/lab building type serving research and technical organizations.", "Represents the lab-adjacent building stock that fits research-oriented users.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("California Avenue research office", "California Ave", "Office / R&D", "Research-park office setting near Caltrain and Palo Alto commercial services.", "Shows the connection between research park users and walkable Palo Alto amenities.", { district_consistency: 4, commercial_relevance: 4 }),
    card("Deer Creek R&D campus", "Deer Creek Rd", "R&D campus", "Campus-style R&D building near the southern Stanford Research Park edge.", "Represents larger-block research and product-development environments.", { building_prominence: 4, keyword_relevance: 5 }),
    card("Arastradero research campus", "Arastradero Rd", "R&D campus", "Campus-oriented research building near the park's western edge.", "Helps explain the district's lower-density, institutional research character.", { district_consistency: 5, commercial_relevance: 4 }),
    card("Foothill Expressway office edge", "Foothill Expy", "Office / R&D", "Edge-condition office/R&D building with regional access.", "Shows the access logic that differentiates Stanford Research Park from downtown locations.", { commercial_relevance: 4, district_consistency: 4 }),
    card("El Camino professional edge", "El Camino Real", "Professional office", "Professional office setting near the research park and Palo Alto service spine.", "Adds a smaller professional-office contrast to the district's campus stock.", { keyword_relevance: 3, district_consistency: 4 }),
    card("Stanford Avenue office/R&D building", "Stanford Ave", "Office / R&D", "Low-rise office/R&D building tied to the Stanford-adjacent commercial environment.", "Represents the research-oriented office form common across this district.", { keyword_relevance: 5, commercial_relevance: 4 }),
  ],

  "/commercial-real-estate/CA/ontario/ontario-airport-area/": [
    card("2970 Inland Empire Boulevard", "2970 Inland Empire Blvd", "Airport-area office", "Office building in the airport-adjacent Inland Empire Boulevard corridor.", "Shows the office and logistics-support side of the Ontario Airport Area.", { listing_frequency: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/ontario/2970-inland-empire-blvd/" }),
    card("3200 East Guasti Road", "3200 E Guasti Rd", "Office / business park", "Business-park office property near Ontario International Airport.", "Represents the airport-area office cluster that supports regional logistics users.", { building_prominence: 4, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/ontario/3200-e-guasti-rd/" }),
    card("3281 East Guasti Road", "3281 E Guasti Rd", "Office / business park", "Airport-area office building with repeated commercial corridor relevance.", "Shows the conventional business-park stock around Guasti Road.", { district_consistency: 5, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/ontario/3281-e-guasti-rd/" }),
    card("5505 Concours", "5505 Concours", "Office / logistics support", "Office property in the airport-area business park environment.", "Represents users needing professional space near logistics and airport access.", { keyword_relevance: 4, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/ontario/5505-concours/" }),
    card("Airport Drive logistics building", "Airport Dr", "Warehouse / logistics", "Warehouse-oriented building near airport and freeway access.", "Adds the logistics property pattern that anchors the Ontario Airport Area decision.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Archibald Avenue industrial building", "Archibald Ave", "Industrial / distribution", "Industrial property tied to the airport and I-10 access network.", "Shows the industrial depth behind Ontario's airport-area commercial identity.", { district_consistency: 5, keyword_relevance: 5 }),
    card("Milliken Avenue distribution building", "Milliken Ave", "Distribution", "Distribution-oriented property near major Inland Empire freight corridors.", "Represents the warehouse scale users compare against Fontana and Rancho Cucamonga.", { building_prominence: 4, commercial_relevance: 5 }),
    card("Haven Avenue logistics office", "Haven Ave", "Office / logistics support", "Logistics-support office setting near Ontario's airport business corridor.", "Shows the hybrid office and logistics-support environment in this market.", { keyword_relevance: 4, district_consistency: 4 }),
    card("Cedar Avenue industrial building", "Cedar Ave", "Industrial / service", "Service-industrial property on the edge of the airport-area network.", "Adds smaller industrial support stock to the district's larger logistics identity.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("State Street service industrial", "State St", "Service industrial", "Service-oriented industrial building near Ontario's regional freight grid.", "Represents practical service and operations users tied to airport access.", { district_consistency: 4, commercial_relevance: 4 }),
  ],

  "/commercial-real-estate/CA/fontana/fontana/": [
    card("10509 Business Drive", "10509 Business Dr", "Industrial / warehouse", "Warehouse-oriented building in Fontana's logistics corridor.", "Represents the truck-access and distribution building stock that defines Fontana.", { listing_frequency: 5, keyword_relevance: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/fontana/10509-business-dr/" }),
    card("10840 Cherry Avenue", "10840 Cherry Ave", "Industrial / distribution", "Distribution building near major Fontana freight routes.", "Shows Fontana's large-format industrial and warehouse environment.", { building_prominence: 4, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/fontana/10840-cherry-ave/" }),
    card("14019 Rose Avenue", "14019 Rose Ave", "Warehouse / logistics", "Warehouse building in the Fontana logistics network.", "Represents modern distribution and operations-oriented users.", { keyword_relevance: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/fontana/14019-rose-ave/" }),
    card("6260 Mango Avenue", "6260 Mango Ave", "Industrial / service", "Industrial building with service and operations utility.", "Adds smaller industrial depth alongside Fontana's larger warehouse examples.", { keyword_relevance: 4, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/fontana/6260-mango-ave/" }),
    card("Slover Avenue distribution building", "Slover Ave", "Distribution", "Distribution-oriented property along one of Fontana's core industrial corridors.", "Shows the district's freight and warehouse orientation.", { keyword_relevance: 5, district_consistency: 5 }),
    card("Jurupa Avenue industrial building", "Jurupa Ave", "Industrial / flex", "Industrial/flex building serving regional operations users.", "Represents the practical flex-industrial stock in Fontana.", { keyword_relevance: 5, commercial_relevance: 4 }),
    card("Citrus Avenue warehouse", "Citrus Ave", "Warehouse", "Warehouse building near the broader Fontana industrial grid.", "Adds a repeatable warehouse pattern for users evaluating logistics alternatives.", { district_consistency: 4, commercial_relevance: 5 }),
    card("Arrow Route service industrial", "Arrow Route", "Service industrial", "Service-industrial building supporting local and regional operators.", "Shows smaller service-commercial demand within the logistics market.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("Santa Ana Avenue industrial building", "Santa Ana Ave", "Industrial / warehouse", "Industrial property in a freight-oriented Fontana location.", "Represents the district's warehouse and truck-access pattern.", { keyword_relevance: 5, district_consistency: 4 }),
    card("Valley Boulevard industrial building", "Valley Blvd", "Industrial / service", "Industrial and service-commercial building near regional arterial access.", "Shows the operations-oriented edge of Fontana's commercial geography.", { commercial_relevance: 4, district_consistency: 4 }),
  ],

  "/commercial-real-estate/CA/vernon/vernon/": [
    card("4890 South Alameda Street", "4890 S Alameda St", "Industrial / logistics", "Industrial building in Vernon's Alameda corridor.", "Represents the heavy industrial and logistics stock that defines Vernon.", { listing_frequency: 5, keyword_relevance: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/vernon/4890-s-alameda-st/" }),
    card("5300 South Santa Fe Avenue", "5300 S Santa Fe Ave", "Industrial / distribution", "Santa Fe Avenue industrial property in Vernon's core freight environment.", "Shows the district's rail- and truck-oriented industrial pattern.", { keyword_relevance: 5, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/vernon/5300-s-santa-fe-ave/" }),
    card("5301 South Santa Fe Avenue", "5301 S Santa Fe Ave", "Industrial / service", "Industrial property across the Santa Fe corridor.", "Adds repeated industrial evidence on a defining Vernon corridor.", { multiple_listing_references: 4, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/vernon/5301-s-santa-fe-ave/" }),
    card("2357 East 49th Street", "2357 E 49th St", "Manufacturing / industrial", "Manufacturing-oriented property in Vernon's industrial grid.", "Represents production and operations uses rather than conventional office demand.", { keyword_relevance: 5, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/vernon/2357-e-49th-st/" }),
    card("2419 East 28th Street", "2419 E 28th St", "Warehouse / industrial", "Warehouse building in a compact industrial corridor.", "Shows Vernon's smaller-lot industrial and service-building texture.", { keyword_relevance: 4, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/vernon/2419-e-28th-st/" }),
    card("2529 Chambers Street", "2529 Chambers St", "Industrial / service", "Service-industrial building in the Vernon industrial network.", "Represents operational users needing central LA industrial access.", { keyword_relevance: 4, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/vernon/2529-chambers-st/" }),
    card("2640 East 26th Street", "2640 E 26th St", "Industrial / warehouse", "Industrial building near Vernon's core freight corridors.", "Adds a repeatable industrial property type in the district.", { district_consistency: 5, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/vernon/2640-e-26th-st/" }),
    card("Alameda corridor logistics building", "S Alameda St", "Logistics / warehouse", "Logistics-oriented building along Alameda's central industrial corridor.", "Explains why Vernon is a core industrial alternative to Commerce and Downtown LA-adjacent users.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Bandini Boulevard industrial building", "Bandini Blvd", "Industrial / distribution", "Distribution-oriented building near the Vernon and Commerce freight grid.", "Shows Vernon's connection to broader LA basin logistics corridors.", { keyword_relevance: 5, district_consistency: 4 }),
    card("Vernon Avenue manufacturing building", "Vernon Ave", "Manufacturing / industrial", "Manufacturing and service-industrial building in the district's production core.", "Represents Vernon's production-heavy commercial identity.", { keyword_relevance: 5, commercial_relevance: 5 }),
  ],

  "/commercial-real-estate/CA/west-sacramento/west-sacramento-industrial/": [
    card("Industrial Boulevard warehouse", "Industrial Blvd", "Warehouse / industrial", "Warehouse-oriented property in West Sacramento's industrial corridor.", "Represents the district's distribution and operations building stock.", { listing_frequency: 4, keyword_relevance: 5, district_consistency: 5 }),
    card("Harbor Boulevard industrial building", "Harbor Blvd", "Industrial / logistics", "Industrial property near port and freeway access.", "Shows the freight and logistics orientation behind West Sacramento Industrial.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Riverside Parkway distribution building", "Riverside Pkwy", "Distribution", "Larger distribution building serving regional Sacramento users.", "Represents the warehouse and logistics scale that differentiates this district from downtown Sacramento.", { building_prominence: 4, commercial_relevance: 5 }),
    card("Seaport Boulevard logistics building", "Seaport Blvd", "Logistics / warehouse", "Port-adjacent warehouse building tied to goods movement and service operations.", "Shows the district's relationship to port and regional distribution infrastructure.", { keyword_relevance: 5, district_consistency: 5 }),
    card("Enterprise Boulevard flex building", "Enterprise Blvd", "Flex / light industrial", "Flex-industrial property supporting service and operations users.", "Adds smaller-format flex space to the district's industrial identity.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("Lake Washington industrial edge", "Lake Washington Blvd", "Industrial / flex", "Industrial edge building near West Sacramento's business and logistics network.", "Represents the district's practical operations geography.", { district_consistency: 4, commercial_relevance: 4 }),
    card("Southport business park building", "Southport Pkwy", "Office / flex", "Business-park office/flex building near industrial and logistics users.", "Shows the office-support side of a primarily industrial market.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("West Capitol service commercial building", "West Capitol Ave", "Service commercial", "Service-commercial building connected to regional business traffic.", "Adds local service and contractor-oriented space to the district picture.", { keyword_relevance: 4, district_consistency: 4 }),
    card("Reed Avenue warehouse", "Reed Ave", "Warehouse / service", "Warehouse and service-commercial property near West Sacramento access routes.", "Represents smaller warehouse formats in the industrial cluster.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("Port-adjacent industrial building", "Port of West Sacramento area", "Industrial / logistics", "Operations-oriented industrial building near port infrastructure.", "Explains the district's logistics role in the broader Sacramento region.", { keyword_relevance: 5, commercial_relevance: 5 }),
  ],

  "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/": [
    card("525 University Avenue", "525 University Ave", "Professional office", "Downtown Palo Alto office building on the University Avenue spine.", "Represents the client-facing professional office stock that defines the district.", { listing_frequency: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/palo-alto/525-university-ave/" }),
    card("101 Lytton Avenue", "101 Lytton Ave", "Professional office", "Office building near University Avenue and downtown services.", "Shows the smaller professional and startup office environment near Caltrain.", { keyword_relevance: 4, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/palo-alto/101-lytton-ave/" }),
    card("200 Hamilton Avenue", "200 Hamilton Ave", "Downtown office", "Central Palo Alto office building near civic and commercial amenities.", "Represents the walkable office setting that differentiates downtown from research-park locations.", { district_consistency: 5, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/palo-alto/200-hamilton-ave/" }),
    card("Bryant Street office building", "Bryant St", "Boutique office", "Smaller downtown office building off the main retail spine.", "Shows the boutique office and professional-service texture in Downtown Palo Alto.", { keyword_relevance: 4, district_consistency: 5 }),
    card("High Street mixed office building", "High St", "Office / street-level commercial", "Mixed commercial building within the downtown walkable grid.", "Represents office users who value downtown services and client access.", { commercial_relevance: 5, district_consistency: 4 }),
    card("Waverley Street professional office", "Waverley St", "Professional office", "Low-rise professional office building in the downtown core.", "Adds the human-scale professional building pattern common in the district.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("Cowper Street office building", "Cowper St", "Boutique office", "Smaller office building near downtown Palo Alto amenities.", "Shows the district's inventory of compact professional office environments.", { district_consistency: 4, commercial_relevance: 4 }),
    card("Alma Street Caltrain edge office", "Alma St", "Transit-adjacent office", "Office building near Caltrain and the downtown edge.", "Represents transit-oriented professional office demand.", { keyword_relevance: 4, commercial_relevance: 5 }),
    card("Emerson Street office building", "Emerson St", "Boutique office", "Downtown office building embedded in Palo Alto's walkable commercial grid.", "Shows the district's small-building professional texture.", { district_consistency: 4, commercial_relevance: 4 }),
    card("Ramona Street commercial office", "Ramona St", "Office / retail edge", "Commercial office building near restaurants and downtown services.", "Represents the amenity-rich office environment users compare with Mountain View and Stanford Research Park.", { keyword_relevance: 4, commercial_relevance: 4 }),
  ],

  "/commercial-real-estate/CA/culver-city/culver-city/": [
    card("10000 Washington Boulevard", "10000 Washington Blvd", "Creative office", "Creative office building near Culver City's media and studio ecosystem.", "Represents the creative and entertainment-oriented office stock that defines Culver City.", { listing_frequency: 5, keyword_relevance: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/culver-city/10000-washington-blvd/" }),
    card("10100 Venice Boulevard", "10100 Venice Blvd", "Office / creative", "Office building near a major Culver City commercial corridor.", "Shows the district's mix of creative office and corridor commercial space.", { keyword_relevance: 4, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/culver-city/10100-venice-blvd/" }),
    card("3050 La Cienega Place", "3050 La Cienega Pl", "Office / studio-adjacent", "Office property near Culver City's production and creative corridors.", "Represents the studio-adjacent office and flex environment.", { district_consistency: 5, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/culver-city/3050-la-cienega-place/" }),
    card("3322 La Cienega Place", "3322 La Cienega Pl", "Creative office / flex", "Creative office/flex building in the La Cienega commercial corridor.", "Shows the flexible production-adjacent building stock common in Culver City.", { keyword_relevance: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/culver-city/3322-la-cienega-place/" }),
    card("5700 Buckingham Parkway", "5700 Buckingham Pkwy", "Office campus", "Office campus building near Culver City's larger employment blocks.", "Adds larger office-campus scale to the district's creative identity.", { building_prominence: 4, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/culver-city/5700-buckingham-pkwy/" }),
    card("5701 Buckingham Parkway", "5701 Buckingham Pkwy", "Office campus", "Campus-style office building in a repeatable Culver City business park setting.", "Represents the office-campus alternative to streetfront creative space.", { district_consistency: 4, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/culver-city/5701-buckingham-pkwy/" }),
    card("5711 Buckingham Parkway", "5711 Buckingham Pkwy", "Office campus", "Larger office building in the Buckingham Parkway cluster.", "Shows the multi-building office environment within Culver City's commercial geography.", { multiple_listing_references: 4, district_consistency: 4 }, { canonical_path: "/commercial-real-estate/building/CA/culver-city/5711-buckingham-pkwy/" }),
    card("5721 Buckingham Parkway", "5721 Buckingham Pkwy", "Office campus", "Office campus building supporting larger teams and regional users.", "Represents campus-scale office inventory without shifting the page into listings.", { building_prominence: 4, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/culver-city/5721-buckingham-pkwy/" }),
    card("5730 Uplander Way", "5730 Uplander Way", "Office / flex", "Office/flex property in the Hayden Tract and Culver City business environment.", "Shows adaptive and flexible office patterns used by creative and production-adjacent teams.", { keyword_relevance: 5, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/culver-city/5730-uplander-way/" }),
    card("5833 Perry Drive", "5833 Perry Dr", "Office / flex", "Creative office/flex building near Culver City's production and media cluster.", "Adds a smaller flexible building type to the district's representative set.", { keyword_relevance: 5, district_consistency: 4 }, { canonical_path: "/commercial-real-estate/building/CA/culver-city/5833-perry-dr/" }),
  ],

  "/commercial-real-estate/CA/irvine/irvine-spectrum/": [
    card("200 Spectrum Center Drive", "200 Spectrum Center Dr", "Class A office tower", "High-visibility office tower in the Irvine Spectrum business district.", "Represents the formal office side of Irvine Spectrum's mixed commercial environment.", { listing_frequency: 5, building_prominence: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/irvine/200-spectrum-center-dr/" }),
    card("400 Spectrum Center Drive", "400 Spectrum Center Dr", "Class A office tower", "Large modern office tower in the Spectrum core.", "Shows the district's polished corporate office identity.", { building_prominence: 5, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/irvine/400-spectrum-center-dr/" }),
    card("7545 Irvine Center Drive", "7545 Irvine Center Dr", "Office / flex", "Office building near Irvine Center Drive and Spectrum access.", "Represents the business-park office stock around the main Spectrum core.", { district_consistency: 5, keyword_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/irvine/7545-irvine-center-dr/" }),
    card("8001 Irvine Center Drive", "8001 Irvine Center Dr", "Office / business park", "Office property in the Irvine Center Drive commercial corridor.", "Shows the practical office and business-park layer of Irvine Spectrum.", { district_consistency: 5, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/irvine/8001-irvine-center-dr/" }),
    card("530 Technology Drive", "530 Technology Dr", "Office / technology", "Technology-oriented office building near Spectrum's business park edge.", "Adds the technology and R&D-adjacent side of the district.", { keyword_relevance: 5, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/irvine/530-technology-dr/" }),
    card("10 Hughes office building", "10 Hughes", "Office / flex", "Office/flex building in Irvine Spectrum's broader business park grid.", "Represents flexible office users who compare Spectrum with Lake Forest and South Coast Metro.", { keyword_relevance: 4, district_consistency: 4 }),
    card("1 Corporate Park", "1 Corporate Park", "Office campus", "Campus-style office property near Irvine Spectrum's regional employment cluster.", "Shows the larger corporate campus option within the district.", { building_prominence: 4, commercial_relevance: 4 }),
    card("1672 Reynolds Avenue", "1672 Reynolds Ave", "Industrial / flex", "Flex-industrial building on the Spectrum and Irvine industrial edge.", "Adds the industrial/flex layer that matters for Spectrum location decisions.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("17777 Main Street", "17777 Main St", "Office / business park", "Business-park office building near the I-5 and Spectrum access network.", "Represents regional-access office demand in Irvine Spectrum.", { district_consistency: 4, commercial_relevance: 4 }),
    card("17835 Sky Park Circle", "17835 Sky Park Cir", "Office / flex", "Office/flex building in the Sky Park business environment.", "Shows Spectrum's smaller flexible office and support-building stock.", { keyword_relevance: 4, commercial_relevance: 4 }),
  ],
};

const byDistrictPath = Object.fromEntries(
  Object.entries(districtCards).map(([path, cards]) => [
    path,
    cards
      .map((buildingCard) => ({
        ...buildingCard,
        representative_score: representativeScore(buildingCard),
      }))
      .sort((a, b) => b.representative_score - a.representative_score)
      .slice(0, MAX_CARDS_PER_DISTRICT),
  ])
);

module.exports = {
  byDistrictPath,
  scoring: {
    max_cards_per_district: MAX_CARDS_PER_DISTRICT,
    weights: WEIGHTS,
    signals: Object.keys(WEIGHTS),
    score_range: "0-100",
  },
  representativeScore,
};
