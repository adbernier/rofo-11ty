const MAX_CARDS_PER_DISTRICT = 15;
let representativeBuildingCardExpansions = { byDistrictPath: {} };
try {
  representativeBuildingCardExpansions = require("./representativeBuildingCardExpansions");
} catch (error) {
  if (error.code !== "MODULE_NOT_FOUND") throw error;
}

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

  "/commercial-real-estate/CA/redwood-city/downtown-redwood-city/": [
    card("Broadway mixed-use office building", "Broadway", "Downtown office / retail", "Walkable downtown office and retail building pattern near Redwood City's commercial core.", "Shows the smaller mixed-use building stock that supports professional services and local office users.", { listing_frequency: 4, keyword_relevance: 4, district_consistency: 5 }, { keyword_tags: ["office", "retail", "downtown"] }),
    card("2065 Broadway Street", "2065 Broadway St", "Retail / service commercial", "Street-level commercial building on a defining downtown Redwood City corridor.", "Represents the active ground-floor commercial texture that differentiates Downtown Redwood City from office-park alternatives.", { district_consistency: 5, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/redwood-city/2065-broadway-st/", keyword_tags: ["retail", "service", "Broadway"] }),
    card("2400 Broadway", "2400 Broadway", "Retail / mixed-use", "Broadway corridor building with repeated public building evidence.", "Adds a real downtown address to anchor the district's mixed-use commercial character.", { listing_frequency: 4, multiple_listing_references: 4, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/redwood-city/2400-broadway/", keyword_tags: ["retail", "mixed-use", "downtown"] }),
    card("El Camino Real commercial edge", "El Camino Real", "Service commercial / office", "Commercial-edge building pattern where downtown Redwood City meets regional arterial access.", "Shows how users can balance walkable downtown identity with broader Peninsula access.", { keyword_relevance: 4, commercial_relevance: 4 }, { keyword_tags: ["service", "office", "El Camino"] }),
    card("2504 El Camino Real", "2504 El Camino Real", "Retail / service commercial", "El Camino Real commercial building serving local services and customer-facing businesses.", "Represents the service-commercial edge of the downtown market.", { district_consistency: 4, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/redwood-city/2504-el-camino-real/", keyword_tags: ["retail", "service", "arterial"] }),
    card("Twin Dolphin Drive office building", "303 Twin Dolphin Dr", "Office building", "Office property near Redwood City's lagoon and Highway 101 office context.", "Shows the larger office alternative that many users compare with downtown Redwood City.", { listing_frequency: 5, multiple_listing_references: 5, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/redwood-city/303-twin-dolphin-drive/", keyword_tags: ["office", "Peninsula", "101 access"] }),
    card("Seaport Boulevard office building", "1400 Seaport Blvd", "Office / waterfront business park", "Larger office building pattern near Redwood City's waterfront and life-science-adjacent business environment.", "Adds a larger-format office example without making the downtown page read like only streetfront retail.", { building_prominence: 4, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/redwood-city/1400-seaport-blvd-bldg-9/", keyword_tags: ["office", "waterfront", "business park"] }),
    card("Main Street professional office", "Main St", "Professional office", "Smaller downtown office building suited to service firms and local professional users.", "Represents the professional-services layer that makes downtown Redwood City useful beyond regional tech office demand.", { keyword_relevance: 4, district_consistency: 5 }, { keyword_tags: ["professional", "office", "walkable"] }),
    card("Winslow Street commercial building", "Winslow St", "Office / service commercial", "Secondary-street commercial building pattern near the downtown core.", "Shows the quieter office and local service locations users may evaluate near Broadway.", { district_consistency: 4, commercial_relevance: 4 }, { keyword_tags: ["office", "service", "downtown"] }),
    card("Middlefield Road commercial building", "Middlefield Rd", "Service commercial / office", "Commercial building pattern connecting downtown Redwood City with surrounding Peninsula neighborhoods.", "Adds local-service and small-office context to the district's downtown identity.", { keyword_relevance: 4, district_consistency: 4 }, { keyword_tags: ["service", "office", "local business"] }),
  ],

  "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/": [
    card("1900 Powell Street", "1900 Powell St", "Office building", "Multi-tenant office building in Emeryville's Powell Street business corridor.", "Anchors the district with an existing public building reference and repeated historical listing evidence.", { listing_frequency: 5, multiple_listing_references: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/emeryville/1900-powell-st/", keyword_tags: ["office", "Powell", "East Bay"] }),
    card("Christie Avenue office building", "Christie Ave", "Office / life science support", "Office building pattern in Emeryville's central commercial grid near Bay Street and Powell.", "Represents the office and research-adjacent building stock users compare against Berkeley and Oakland.", { listing_frequency: 4, keyword_relevance: 4, district_consistency: 5 }, { keyword_tags: ["office", "life science", "Christie"] }),
    card("5760 Christie Avenue", "5760 Christie Ave", "Office / mixed commercial", "Raw building universe evidence points to Christie Avenue as a recurring Emeryville commercial address cluster.", "Shows Emeryville's practical office and service-commercial environment near the Bay Bridge side of the East Bay.", { listing_frequency: 4, district_consistency: 5, commercial_relevance: 4 }, { keyword_tags: ["office", "mixed commercial", "Christie"] }),
    card("Powell Street business corridor", "Powell St", "Office / R&D support", "Business-corridor building pattern serving office, R&D support, and East Bay professional users.", "Explains why Emeryville works for teams wanting Berkeley/Oakland adjacency with more business-park structure.", { keyword_relevance: 5, commercial_relevance: 5 }, { keyword_tags: ["office", "R&D", "Powell"] }),
    card("1603 Powell Street", "1603 Powell St", "Office / service commercial", "Raw building evidence identifies repeated Powell Street commercial addresses near the district's core.", "Adds a smaller Emeryville building pattern beyond the main public office reference.", { district_consistency: 5, commercial_relevance: 4 }, { keyword_tags: ["office", "service", "Powell"] }),
    card("Horton Street industrial office", "Horton St", "Industrial / creative office", "Industrial-edge building pattern tied to Emeryville's production, creative, and research-adjacent uses.", "Shows the adaptive and industrial-commercial layer that differentiates Emeryville from a conventional downtown.", { keyword_relevance: 5, commercial_relevance: 5 }, { keyword_tags: ["industrial", "creative", "R&D"] }),
    card("Shellmound Street commercial building", "Shellmound St", "Office / retail support", "Commercial building pattern near Emeryville's retail and office spine.", "Represents the mixed-use support environment around the city's office and biotech-adjacent users.", { district_consistency: 4, commercial_relevance: 4 }, { keyword_tags: ["office", "retail", "Shellmound"] }),
    card("Bay Street commercial block", "Bay St", "Mixed-use commercial", "Mixed-use commercial block near Emeryville's retail and office center.", "Adds the amenity and service-business context that often matters to office and creative users.", { building_prominence: 4, commercial_relevance: 4 }, { keyword_tags: ["mixed-use", "retail", "amenities"] }),
    card("Landregan Street flex building", "Landregan St", "Flex / light industrial", "Smaller flex-commercial building pattern in Emeryville's industrial-transition area.", "Shows the practical production-adjacent space that supports creative, maker, and R&D users.", { keyword_relevance: 5, district_consistency: 4 }, { keyword_tags: ["flex", "light industrial", "maker"] }),
    card("Adeline Street commercial edge", "Adeline St", "Service commercial / office", "Commercial-edge building pattern connecting Emeryville with Berkeley and Oakland corridors.", "Represents the corridor-based locations users may compare when evaluating Emeryville versus Berkeley.", { district_consistency: 4, commercial_relevance: 4 }, { keyword_tags: ["service", "office", "Berkeley edge"] }),
  ],

  "/commercial-real-estate/CA/berkeley/downtown-berkeley/": [
    card("2001 Addison Street", "2001 Addison St", "Office building", "University-adjacent office building in Downtown Berkeley's civic and transit-oriented core.", "Anchors the page with an existing public building reference and repeated historical listing activity.", { listing_frequency: 5, multiple_listing_references: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/berkeley/2001-addison-st/", keyword_tags: ["office", "BART", "university"] }),
    card("2120 University Avenue", "2120 University Ave", "Professional office", "Office building near Downtown Berkeley's University Avenue commercial corridor.", "Represents professional and service-office users that want university and BART access.", { listing_frequency: 3, district_consistency: 5, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/berkeley/2120-university-ave/", keyword_tags: ["office", "University Ave", "professional"] }),
    card("Shattuck Avenue office building", "Shattuck Ave", "Office / service commercial", "Transit-oriented office and service-commercial building pattern in the downtown core.", "Shows the customer-facing and professional-services layer around Downtown Berkeley BART.", { keyword_relevance: 4, commercial_relevance: 5 }, { keyword_tags: ["office", "BART", "service"] }),
    card("Center Street civic office", "Center St", "Civic / professional office", "Downtown office pattern near Berkeley's civic, arts, and institutional activity.", "Represents organizations that value Berkeley identity and walkable downtown access.", { district_consistency: 5, commercial_relevance: 4 }, { keyword_tags: ["civic", "office", "walkable"] }),
    card("Allston Way professional building", "Allston Way", "Professional office", "Smaller professional-office building pattern close to BART and UC Berkeley.", "Adds small-team and professional-services context beyond larger downtown buildings.", { keyword_relevance: 4, district_consistency: 4 }, { keyword_tags: ["professional", "office", "small team"] }),
    card("Oxford Street institutional edge", "Oxford St", "Institutional / office", "Office and institutional-adjacent commercial pattern near the UC Berkeley edge.", "Shows why university-facing organizations may choose Downtown Berkeley over Emeryville.", { building_prominence: 4, commercial_relevance: 5 }, { keyword_tags: ["institutional", "university", "office"] }),
    card("Milvia Street service office", "Milvia St", "Service office", "Local service and office building pattern near Berkeley's downtown civic core.", "Represents practical smaller office users serving Berkeley clients and institutions.", { district_consistency: 4, commercial_relevance: 4 }, { keyword_tags: ["service", "office", "local business"] }),
    card("Kittredge Street commercial building", "Kittredge St", "Office / retail support", "Secondary downtown commercial building pattern near the main office and transit spine.", "Adds the smaller mixed commercial texture that keeps Downtown Berkeley distinct from campus-only locations.", { keyword_relevance: 4, district_consistency: 4 }, { keyword_tags: ["office", "retail", "downtown"] }),
  ],

  "/commercial-real-estate/CA/berkeley/west-berkeley/": [
    card("Fourth Street maker/flex building", "Fourth St", "Maker / flex", "Adaptive commercial building pattern near West Berkeley's showroom, maker, and light-industrial edge.", "Represents the production-adjacent uses that make West Berkeley different from Downtown Berkeley.", { keyword_relevance: 5, district_consistency: 5, commercial_relevance: 5 }, { keyword_tags: ["maker", "flex", "showroom"] }),
    card("Gilman Street industrial building", "Gilman St", "Industrial / flex", "Industrial and flex building pattern along a defining West Berkeley corridor.", "Shows the service, production, and R&D-adjacent property stock users compare with Emeryville.", { keyword_relevance: 5, commercial_relevance: 5 }, { keyword_tags: ["industrial", "flex", "production"] }),
    card("Heinz Avenue R&D building", "Heinz Ave", "R&D / light industrial", "R&D and light-industrial building pattern in Berkeley's west-side commercial district.", "Represents companies needing technical space near Berkeley talent and East Bay access.", { keyword_relevance: 5, district_consistency: 5 }, { keyword_tags: ["R&D", "light industrial", "Berkeley"] }),
    card("Eighth Street flex building", "8th St", "Flex / service commercial", "Smaller flex-commercial building pattern near West Berkeley's industrial grid.", "Adds practical service-business and production space beyond office-only examples.", { keyword_relevance: 4, commercial_relevance: 4 }, { keyword_tags: ["flex", "service", "production"] }),
    card("Tenth Street creative industrial", "10th St", "Creative industrial", "Adaptive industrial building type suited to creative, studio, and maker users.", "Shows why West Berkeley can fit businesses that need texture and production adjacency.", { keyword_relevance: 5, district_consistency: 4 }, { keyword_tags: ["creative", "industrial", "studio"] }),
    card("San Pablo Avenue commercial edge", "San Pablo Ave", "Service commercial / showroom", "Commercial corridor building pattern connecting West Berkeley to Emeryville and Oakland.", "Represents showroom, service, and customer-facing uses on the district's eastern edge.", { district_consistency: 4, commercial_relevance: 4 }, { keyword_tags: ["showroom", "service", "corridor"] }),
    card("Ashby Avenue industrial edge", "Ashby Ave", "Flex / light industrial", "Industrial-edge building pattern with regional access across Berkeley and Emeryville.", "Shows the access-oriented side of West Berkeley's commercial geography.", { keyword_relevance: 4, commercial_relevance: 4 }, { keyword_tags: ["flex", "access", "industrial"] }),
    card("University Avenue west-side commercial", "University Ave", "Office / service commercial", "West-side commercial building pattern connecting Berkeley's downtown and waterfront-oriented districts.", "Adds a bridge between university-adjacent office demand and West Berkeley's flex environment.", { district_consistency: 4, commercial_relevance: 4 }, { keyword_tags: ["office", "service", "university"] }),
    card("Potter Street production building", "Potter St", "Production / flex", "Production-oriented flex building pattern in the industrial-transition area.", "Represents the maker and operations users that need West Berkeley rather than a formal office core.", { keyword_relevance: 5, district_consistency: 4 }, { keyword_tags: ["production", "flex", "operations"] }),
    card("West Berkeley warehouse conversion", "West Berkeley", "Adaptive warehouse / creative office", "Warehouse-conversion pattern supporting creative office, studio, and R&D-adjacent businesses.", "Explains the district's hybrid identity without implying current availability at a specific listing.", { building_prominence: 3, keyword_relevance: 5, commercial_relevance: 5 }, { keyword_tags: ["adaptive reuse", "warehouse", "creative office"] }),
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
    card("2914 East 46th Street", "2914 E 46th St", "Industrial / warehouse", "Warehouse-oriented building in Vernon's production and logistics grid.", "Adds another real Vernon building reference from the raw building corpus.", { keyword_relevance: 4, district_consistency: 5, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/vernon/2914-e-46th-st/" }),
    card("Alameda corridor logistics building", "S Alameda St", "Logistics / warehouse", "Logistics-oriented building along Alameda's central industrial corridor.", "Explains why Vernon is a core industrial alternative to Commerce and Downtown LA-adjacent users.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Bandini Boulevard industrial building", "Bandini Blvd", "Industrial / distribution", "Distribution-oriented building near the Vernon and Commerce freight grid.", "Shows Vernon's connection to broader LA basin logistics corridors.", { keyword_relevance: 5, district_consistency: 4 }),
    card("Vernon Avenue manufacturing building", "Vernon Ave", "Manufacturing / industrial", "Manufacturing and service-industrial building in the district's production core.", "Represents Vernon's production-heavy commercial identity.", { keyword_relevance: 5, commercial_relevance: 5 }),
  ],

  "/commercial-real-estate/CA/west-sacramento/west-sacramento-industrial/": [
    card("3380 Industrial Boulevard", "3380 Industrial Blvd", "Warehouse / industrial", "Warehouse-oriented building on a defining West Sacramento industrial corridor.", "Replaces a generic Industrial Boulevard pattern with a real raw-building corpus reference.", { listing_frequency: 4, keyword_relevance: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/west-sacramento/3380-industrial-blvd/" }),
    card("3950 Industrial Boulevard", "3950 Industrial Blvd", "Industrial / warehouse", "Industrial Boulevard warehouse building serving distribution and operations users.", "Shows repeated warehouse evidence on the district's strongest industrial spine.", { keyword_relevance: 5, district_consistency: 5, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/west-sacramento/3950-industrial-blvd/" }),
    card("2928 Ramco Street", "2928 Ramco St", "Industrial / flex", "Industrial/flex building in the Ramco Street business corridor.", "Adds a real smaller-format industrial example to balance larger warehouse patterns.", { keyword_relevance: 4, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/west-sacramento/2928-ramco-st/" }),
    card("2934 Ramco Street", "2934 Ramco St", "Industrial / service", "Service-industrial building in West Sacramento's Ramco Street cluster.", "Shows clustered industrial activity rather than a single isolated building.", { multiple_listing_references: 4, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/west-sacramento/2934-ramco-st/" }),
    card("2945 Ramco Street", "2945 Ramco St", "Office / flex support", "Office/flex building within an otherwise industrial district.", "Represents the support-office layer that often sits inside industrial markets.", { keyword_relevance: 4, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/west-sacramento/2945-ramco-st/" }),
    card("3100 Ramco Street", "3100 Ramco St", "Industrial / warehouse", "Industrial property in a repeated West Sacramento business-park address cluster.", "Adds another raw-building reference for users evaluating industrial depth.", { keyword_relevance: 4, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/west-sacramento/3100-ramco-st/" }),
    card("3520 Carlin Drive", "3520 Carlin Dr", "Industrial / flex", "Flex-industrial property near West Sacramento's logistics and service corridors.", "Shows smaller operational building stock beyond the Industrial Boulevard spine.", { keyword_relevance: 4, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/west-sacramento/3520-carlin-dr/" }),
    card("3920 West Capitol Avenue", "3920 W Capitol Ave", "Industrial / service commercial", "Industrial-service property on a major West Sacramento commercial artery.", "Adds the service-commercial edge of a primarily industrial district.", { keyword_relevance: 4, district_consistency: 4 }, { canonical_path: "/commercial-real-estate/building/CA/west-sacramento/3920-w-capitol-ave/" }),
    card("545 Jefferson Boulevard", "545 Jefferson Blvd", "Industrial / service", "Industrial building near Jefferson Boulevard access.", "Represents operational users that need local arterial access as much as warehouse scale.", { keyword_relevance: 4, commercial_relevance: 4 }, { canonical_path: "/commercial-real-estate/building/CA/west-sacramento/545-jefferson-blvd/" }),
    card("Port-adjacent industrial building", "Port of West Sacramento area", "Industrial / logistics", "Operations-oriented industrial building near port infrastructure.", "Explains the district's logistics role in the broader Sacramento region.", { keyword_relevance: 5, commercial_relevance: 5 }),
  ],

  "/commercial-real-estate/CA/los-angeles/playa-vista/": [
    card("12130 Millennium Drive", "12130 Millennium Dr", "Creative office campus", "Office building in Playa Vista's campus-oriented tech and media environment.", "Adds a real raw-building corpus reference for the district's modern office-campus pattern.", { listing_frequency: 4, keyword_relevance: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/los-angeles/12130-millennium-dr/" }),
    card("Jefferson Boulevard creative office", "Jefferson Blvd", "Creative office / flex", "Creative office property along the Jefferson corridor near Playa Vista and Culver City.", "Represents the media and production-adjacent office stock users compare across the Westside.", { keyword_relevance: 5, district_consistency: 4 }),
    card("Campus Center Drive office building", "Campus Center Dr", "Office campus", "Campus-style office building in the Playa Vista employment core.", "Shows the large-block, amenity-oriented format that separates Playa Vista from traditional downtown office districts.", { building_prominence: 4, commercial_relevance: 5 }),
    card("Bluff Creek Drive office building", "Bluff Creek Dr", "Office / technology", "Technology-oriented office building in a newer planned commercial environment.", "Represents modern office space designed around larger teams and Westside access.", { keyword_relevance: 4, district_consistency: 4 }),
    card("Waterfront Drive commercial office", "Waterfront Dr", "Office / mixed commercial", "Office and mixed-commercial building type near Playa Vista's walkable core.", "Adds the mixed-use commercial layer around the larger campus buildings.", { commercial_relevance: 4, district_consistency: 4 }),
    card("Beatrice Street creative office", "Beatrice St", "Creative office", "Creative office pattern near Playa Vista's media and production-adjacent edge.", "Shows the smaller creative-office layer that connects Playa Vista with Culver City.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("Alla Road flex office", "Alla Rd", "Office / flex", "Office/flex building type serving creative, production, and technical users.", "Represents flexible Westside commercial space without implying live inventory.", { keyword_relevance: 4, district_consistency: 4 }),
    card("Centinela Avenue service-commercial edge", "Centinela Ave", "Service commercial / office", "Service-commercial building on the district edge near regional access routes.", "Shows the practical support-building layer around the core office campuses.", { keyword_relevance: 3, commercial_relevance: 4 }),
  ],

  "/commercial-real-estate/CA/los-angeles/century-city/": [
    card("10250 Constellation Boulevard", "10250 Constellation Blvd", "Class A office tower", "Formal high-rise office building in the Century City core.", "Strengthens the district with a real public building reference that matches its tower-office identity.", { listing_frequency: 4, keyword_relevance: 5, building_prominence: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/los-angeles/10250-constellation-blvd/" }),
    card("1800 Century Park East", "1800 Century Park E", "Corporate office tower", "Large professional office building in Century City's tower cluster.", "Represents the client-facing and headquarters-oriented office form common here.", { keyword_relevance: 5, building_prominence: 5, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/los-angeles/1800-century-park-e/" }),
    card("1901 Avenue of the Stars", "1901 Avenue of the Stars", "Class A office", "Avenue of the Stars office building with raw listing evidence.", "Uses direct raw-listing/building evidence for Century City's formal office market.", { listing_frequency: 5, keyword_relevance: 5, district_consistency: 5 }, { canonical_path: "/commercial-real-estate/building/CA/los-angeles/1901-avenue-of-the-stars/" }),
    card("2029 Century Park East", "2029 Century Park E", "Class A office tower", "Century Plaza Towers office environment in the central office core.", "Shows the premium tower setting users expect when comparing Century City with Downtown LA or Beverly Hills.", { listing_frequency: 5, building_prominence: 5, commercial_relevance: 5 }, { canonical_path: "/commercial-real-estate/building/CA/los-angeles/2029-century-park-e/" }),
    card("Constellation Boulevard office building", "Constellation Blvd", "Office tower", "High-density office building pattern along the Century City business spine.", "Adds a corridor-level pattern for formal, client-facing office demand.", { keyword_relevance: 4, district_consistency: 5 }),
    card("Avenue of the Stars professional tower", "Avenue of the Stars", "Professional office", "Professional-service tower environment in the center of the district.", "Represents law, finance, media, and advisory firms prioritizing prestige and client access.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Century Park West office building", "Century Park W", "Office tower", "Tower-office pattern on Century City's western office edge.", "Shows the district's concentrated vertical office geography beyond a single address.", { building_prominence: 4, district_consistency: 4 }),
    card("Santa Monica Boulevard office edge", "Santa Monica Blvd", "Office / retail edge", "Office-edge building connected to regional Westside access and services.", "Adds the transit/arterial and amenity edge of the Century City office market.", { keyword_relevance: 3, commercial_relevance: 4 }),
  ],

  "/commercial-real-estate/CA/santa-fe-springs/santa-fe-springs/": [
    card("Norwalk Boulevard industrial building", "Norwalk Blvd", "Industrial / distribution", "Industrial building pattern along a major Santa Fe Springs business corridor.", "Represents the warehouse and distribution users that define the market.", { keyword_relevance: 5, district_consistency: 4, commercial_relevance: 5 }),
    card("Telegraph Road warehouse", "Telegraph Rd", "Warehouse / logistics", "Warehouse-oriented property type on a regional freight and service corridor.", "Shows Santa Fe Springs as a practical industrial alternative to Commerce and City of Industry.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Shoemaker Avenue flex building", "Shoemaker Ave", "Industrial / flex", "Flex-industrial building serving manufacturing, service, and distribution users.", "Adds the smaller-format flex layer that supports larger industrial users.", { keyword_relevance: 5, district_consistency: 4 }),
    card("Dice Road manufacturing building", "Dice Rd", "Manufacturing / industrial", "Manufacturing-oriented building pattern in the industrial grid.", "Represents production and operations uses rather than office-first demand.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Santa Fe Springs Road distribution building", "Santa Fe Springs Rd", "Distribution", "Distribution-oriented property near the area's industrial spine.", "Shows why users compare Santa Fe Springs with Downey, Commerce, and City of Industry.", { keyword_relevance: 5, district_consistency: 4 }),
    card("Lakeland Road industrial building", "Lakeland Rd", "Industrial / service", "Industrial-service building pattern supporting contractors and operations users.", "Adds service-commercial depth to the district's warehouse identity.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("Bloomfield Avenue warehouse", "Bloomfield Ave", "Warehouse / industrial", "Warehouse property type tied to Southeast LA freight access.", "Represents the repeatable industrial stock common in Santa Fe Springs.", { keyword_relevance: 5, district_consistency: 4 }),
    card("Greenstone Avenue flex building", "Greenstone Ave", "Flex / light industrial", "Light industrial/flex building serving smaller operations users.", "Shows the district's range from small flex buildings to larger warehouses.", { keyword_relevance: 4, commercial_relevance: 4 }),
  ],

  "/commercial-real-estate/CA/los-angeles/koreatown/": [
    card("Wilshire Boulevard office building", "Wilshire Blvd", "Office / medical", "Mid-rise office building pattern along Koreatown's Wilshire corridor.", "Represents the dense service-office and medical-office stock common in the district.", { keyword_relevance: 4, district_consistency: 4, commercial_relevance: 5 }),
    card("Western Avenue mixed commercial building", "Western Ave", "Mixed commercial", "Street-oriented commercial building with office, retail, and service uses.", "Shows Koreatown's corridor-based commercial texture rather than a tower-only office market.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("Vermont Avenue service office", "Vermont Ave", "Service office / retail", "Service-office building pattern serving local businesses and neighborhood clients.", "Represents practical small-business office demand in a dense urban district.", { keyword_relevance: 4, district_consistency: 4 }),
    card("6th Street storefront office", "6th St", "Retail / office", "Streetfront commercial building with storefront and upper-floor office potential.", "Adds the retail-office layer that differentiates Koreatown from Century City.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("Olympic Boulevard commercial building", "Olympic Blvd", "Mixed commercial", "Mixed commercial property type near Koreatown's southern business edge.", "Shows the district's local service, medical, and retail-oriented space patterns.", { keyword_relevance: 4, district_consistency: 4 }),
    card("8th Street service commercial building", "8th St", "Service commercial", "Smaller service-commercial property embedded in the neighborhood grid.", "Represents tenant demand driven by density and local customer access.", { keyword_relevance: 3, commercial_relevance: 4 }),
    card("Koreatown medical office building", "Koreatown commercial core", "Medical office / service office", "Medical and service-office building pattern serving dense nearby residential and worker populations.", "Adds a key non-retail business use common to the district.", { keyword_relevance: 4, commercial_relevance: 5 }),
    card("Koreatown storefront block", "Koreatown commercial core", "Storefront / mixed-use", "Street-level commercial block with small offices and local services.", "Shows the district's high-frequency, corridor-based commercial environment.", { keyword_relevance: 4, district_consistency: 4 }),
  ],

  "/commercial-real-estate/CA/downey/downey/": [
    card("Firestone Boulevard service office", "Firestone Blvd", "Office / medical", "Local service-office and medical-office pattern along Downey's primary commercial corridor.", "Represents Downey's practical suburban business and healthcare-oriented demand.", { keyword_relevance: 4, district_consistency: 4, commercial_relevance: 5 }),
    card("Lakewood Boulevard commercial building", "Lakewood Blvd", "Retail / service office", "Commercial corridor building serving local office, retail, and service users.", "Shows the local-service geography that differentiates Downey from industrial Santa Fe Springs.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("Imperial Highway medical office", "Imperial Hwy", "Medical office", "Medical-office building pattern near regional healthcare and arterial access.", "Adds one of Downey's strongest non-industrial commercial use cases.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Stewart and Gray industrial building", "Stewart and Gray Rd", "Industrial / flex", "Industrial/flex property type in Downey's operations-oriented edge.", "Represents users comparing Downey with Santa Fe Springs and Commerce.", { keyword_relevance: 5, district_consistency: 4 }),
    card("Florence Avenue service commercial", "Florence Ave", "Service commercial", "Service-commercial building pattern serving local and regional business users.", "Shows the smaller operational spaces within Downey's mixed commercial market.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("Paramount Boulevard office building", "Paramount Blvd", "Professional office", "Professional office building pattern near Downey's civic and commercial core.", "Adds a traditional local-office example for professional services users.", { keyword_relevance: 4, district_consistency: 4 }),
    card("Downey industrial yard building", "Downey industrial edge", "Industrial / yard", "Operations-oriented building pattern with service and yard utility.", "Represents industrial users who need Southeast LA access without a pure warehouse district.", { keyword_relevance: 5, commercial_relevance: 4 }),
    card("Downey storefront commercial block", "Downey commercial core", "Retail / local service", "Street-level commercial block serving local customers and small businesses.", "Shows the mixed local-commercial side of the market.", { keyword_relevance: 3, district_consistency: 4 }),
  ],

  "/commercial-real-estate/CA/fullerton/fullerton/": [
    card("Orangethorpe Avenue industrial building", "Orangethorpe Ave", "Industrial / flex", "Industrial/flex building pattern along Fullerton's regional business corridor.", "Represents North Orange County operations and service-commercial demand.", { keyword_relevance: 5, district_consistency: 4, commercial_relevance: 5 }),
    card("Commonwealth Avenue commercial building", "Commonwealth Ave", "Office / service commercial", "Commercial building pattern connecting downtown, education, and business users.", "Shows Fullerton's mix of local office, service, and institutional-adjacent demand.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("State College Boulevard office building", "State College Blvd", "Office / medical", "Office and medical-office building type near a major north-south corridor.", "Adds professional and healthcare-oriented demand to the district picture.", { keyword_relevance: 4, district_consistency: 4 }),
    card("Raymer Avenue warehouse", "Raymer Ave", "Warehouse / industrial", "Warehouse building pattern in Fullerton's industrial edge.", "Represents users comparing Fullerton with Anaheim, Buena Park, and Brea.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Walnut Avenue industrial building", "Walnut Ave", "Industrial / service", "Service-industrial property serving contractors and operations users.", "Shows the practical industrial base beneath Fullerton's broader mixed market.", { keyword_relevance: 5, district_consistency: 4 }),
    card("Harbor Boulevard commercial building", "Harbor Blvd", "Retail / office", "Street-oriented commercial building near central Fullerton services.", "Adds the local service and small-office side of the district.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("Fullerton business park flex building", "Fullerton business park", "Flex / light industrial", "Light industrial/flex building pattern serving North Orange County users.", "Represents smaller flexible business space rather than large warehouse only.", { keyword_relevance: 5, district_consistency: 4 }),
    card("Fullerton professional office building", "Fullerton commercial core", "Professional office", "Professional office building supporting local services and small firms.", "Shows why Fullerton can function as more than an industrial alternative.", { keyword_relevance: 3, commercial_relevance: 4 }),
  ],

  "/commercial-real-estate/CA/huntington-beach/huntington-beach/": [
    card("Beach Boulevard service office", "Beach Blvd", "Office / medical", "Local service-office and medical-office building pattern on a major commercial corridor.", "Represents Huntington Beach's practical local-business office demand.", { keyword_relevance: 4, district_consistency: 4, commercial_relevance: 5 }),
    card("Edinger Avenue commercial building", "Edinger Ave", "Retail / office", "Commercial corridor building serving retail, office, and local service users.", "Shows the mixed commercial format that matters more here than large office towers.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("Gothard Street industrial building", "Gothard St", "Industrial / flex", "Industrial/flex building pattern in Huntington Beach's inland business areas.", "Adds the district's under-discussed flex and service-commercial layer.", { keyword_relevance: 5, district_consistency: 4 }),
    card("Springdale Street office building", "Springdale St", "Professional office", "Professional office building serving local firms and healthcare users.", "Represents smaller office users choosing coastal local-service geography.", { keyword_relevance: 4, commercial_relevance: 4 }),
    card("Warner Avenue commercial building", "Warner Ave", "Service commercial", "Service-commercial building along a regional east-west corridor.", "Shows practical customer and employee access within Huntington Beach.", { keyword_relevance: 4, district_consistency: 4 }),
    card("Talbert Avenue medical office", "Talbert Ave", "Medical office", "Medical-office building pattern tied to local healthcare and service demand.", "Adds one of the stronger commercial use cases for the market.", { keyword_relevance: 5, commercial_relevance: 5 }),
    card("Huntington Beach business park building", "Huntington Beach inland business area", "Office / flex", "Small business-park building serving local office and flex users.", "Represents the office/flex stock that users may compare with Costa Mesa and Garden Grove.", { keyword_relevance: 4, district_consistency: 4 }),
    card("Pacific Coast service commercial", "Pacific Coast Hwy", "Retail / service commercial", "Coastal corridor commercial building serving local and visitor-facing businesses.", "Adds the coastal retail/service edge without turning the page into a retail guide.", { keyword_relevance: 3, commercial_relevance: 4 }),
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

function cardKey(card) {
  return String(card.address || card.name || "")
    .toLowerCase()
    .replace(/[.,#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mergeGeneratedCards(baseCards, generatedCards) {
  const seen = new Set();
  return [...baseCards, ...generatedCards].filter((buildingCard) => {
    const key = cardKey(buildingCard);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function materializeCards(cards) {
  return cards
    .map((buildingCard) => ({
      ...buildingCard,
      representative_score: representativeScore(buildingCard),
    }))
    .sort((a, b) => b.representative_score - a.representative_score)
    .slice(0, MAX_CARDS_PER_DISTRICT);
}

const baseByDistrictPath = Object.fromEntries(
  Object.entries(districtCards).map(([path, cards]) => [path, materializeCards(cards)])
);

const mergedDistrictCards = { ...districtCards };

Object.entries(representativeBuildingCardExpansions.byDistrictPath || {}).forEach(
  ([path, generatedCards]) => {
    mergedDistrictCards[path] = mergeGeneratedCards(
      mergedDistrictCards[path] || [],
      generatedCards || []
    );
  }
);

const byDistrictPath = Object.fromEntries(
  Object.entries(mergedDistrictCards).map(([path, cards]) => [
    path,
    materializeCards(cards),
  ])
);

module.exports = {
  byDistrictPath,
  baseByDistrictPath,
  scoring: {
    max_cards_per_district: MAX_CARDS_PER_DISTRICT,
    weights: WEIGHTS,
    signals: Object.keys(WEIGHTS),
    score_range: "0-100",
  },
  representativeScore,
};
