function area(id, name, city, state_abbr, area_type) {
  const citySlug = slugify(city);
  const areaSlug = slugify(name);

  return {
    id,
    name,
    slug: areaSlug,
    area_type,
    city,
    state_abbr,
    path: `/commercial-real-estate/${state_abbr}/${citySlug}/${areaSlug}/`,
    confidence: "editorial",
  };
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function building({
  address,
  city,
  state_abbr = "CA",
  district,
  role,
  description,
  about,
  location,
  best_for,
  type = "Office Space",
  primary_space_type = "office",
}) {
  const city_slug = slugify(city);
  const building_slug = slugify(address);
  const label = `${address} in ${city}`;
  const roleSentence = String(role || "commercial district context");

  return {
    address,
    name: address,
    display_name: address,
    city,
    state_abbr,
    city_slug,
    building_slug,
    building_path: `/commercial-real-estate/building/${state_abbr}/${city_slug}/${building_slug}/`,
    type,
    primary_space_type,
    space_type: primary_space_type,
    raw_space_types: [primary_space_type],
    source: "editorial-representative-expansion",
    editorial_representative: true,
    primary_source: "Rofo editorial review",
    source_companies: [],
    source_count: 0,
    is_exec_suite_present: false,
    size_label: "",
    property_size: "",
    property_year_built: "",
    postal: "",
    image_urls: [],
    hero_image: "",
    meta_title: `${address} | ${district.name} Representative Building | Rofo`,
    meta_description: `${address} is a representative ${district.name} commercial building in ${city}, useful for understanding ${roleSentence} and nearby district context.`,
    teaser: `${label} is included as a representative commercial building for understanding ${district.name}.`,
    building_description: description,
    about_context: about,
    location_context: location,
    common_fit: role,
    detail_summary: role,
    best_for,
    commercial_area: district,
    has_availability: false,
  };
}

const soma = area("sf-soma", "SoMa", "San Francisco", "CA", "district");
const missionBay = area("sf-mission-bay", "Mission Bay", "San Francisco", "CA", "district");
const oldOakland = area("oak-old-oakland", "Old Oakland", "Oakland", "CA", "district");
const jackLondonSquare = area("oak-jack-london-square", "Jack London Square", "Oakland", "CA", "district");
const downtownPaloAlto = area("ba-downtown-palo-alto", "Downtown Palo Alto", "Palo Alto", "CA", "downtown_core");
const emeryville = area("eb-emeryville-commercial-core", "Emeryville", "Emeryville", "CA", "district");
const downtownBerkeley = area("eb-downtown-berkeley", "Downtown Berkeley", "Berkeley", "CA", "downtown_core");
const westBerkeley = area("eb-west-berkeley", "West Berkeley", "Berkeley", "CA", "district");

module.exports = [
  building({
    address: "6425 Christie Ave",
    city: "Emeryville",
    district: emeryville,
    role: "Christie Avenue office / R&D corridor",
    description:
      "6425 Christie Ave is a representative Emeryville building for understanding the district's office, R&D-support, and East Bay business corridor context.",
    about:
      "Raw building and listing data show repeated activity at this Christie Avenue address. It helps explain Emeryville as a practical office and research-adjacent market between Berkeley, Oakland, and the Bay Bridge.",
    location:
      "6425 Christie Ave sits in Emeryville's Christie and Powell commercial environment, close to the city's office, retail, and life-science-adjacent business clusters.",
    best_for: [
      "Office and R&D-support users",
      "Companies comparing Emeryville with Berkeley",
      "East Bay teams needing Bay Bridge access",
    ],
  }),
  building({
    address: "2200 Powell St",
    city: "Emeryville",
    district: emeryville,
    role: "Powell Street office tower",
    description:
      "2200 Powell St is a representative Emeryville office building that helps explain the district's Powell Street business corridor.",
    about:
      "The address is part of the Watergate/Powell office environment and appears repeatedly in raw building/listing data, making it useful district context for office users evaluating Emeryville.",
    location:
      "2200 Powell St sits near the Bay Bridge-facing side of Emeryville, where office buildings, hotels, retail services, and regional access converge.",
    best_for: [
      "Professional office users",
      "Teams comparing Oakland, Berkeley, and Emeryville",
      "Businesses prioritizing East Bay access",
    ],
  }),
  building({
    address: "2100 Powell St",
    city: "Emeryville",
    district: emeryville,
    role: "Powell Street office environment",
    description:
      "2100 Powell St is a representative Emeryville building for the district's larger office and business-park pattern along Powell Street.",
    about:
      "The building helps show Emeryville's more structured office geography, contrasting with Downtown Berkeley's university-adjacent office fabric and West Berkeley's maker/flex orientation.",
    location:
      "2100 Powell St is positioned in Emeryville's central office corridor, near other Powell and Christie Avenue commercial buildings.",
    best_for: [
      "Larger office teams",
      "Client-facing East Bay businesses",
      "Companies evaluating Emeryville versus Downtown Oakland",
    ],
  }),
  building({
    address: "5858 Horton St",
    city: "Emeryville",
    district: emeryville,
    role: "Horton Street office / flex context",
    description:
      "5858 Horton St is a representative Emeryville commercial building for the district's office, flex, and production-adjacent business environment.",
    about:
      "Horton Street appears as a recurring Emeryville commercial corridor in raw building data, supporting the district story around office, creative, and R&D-adjacent users.",
    location:
      "5858 Horton St sits near Emeryville's Hollis, Powell, and Christie commercial grid, connecting business-park and industrial-transition contexts.",
    best_for: [
      "Creative office users",
      "R&D-support teams",
      "Businesses needing East Bay office/flex context",
    ],
  }),
  building({
    address: "2000 Powell St",
    city: "Emeryville",
    district: emeryville,
    role: "Central Powell Street office",
    description:
      "2000 Powell St is a representative Emeryville office building in the city's primary Powell Street commercial corridor.",
    about:
      "The address strengthens the public building set for Emeryville's office geography, especially for users comparing Powell Street with Downtown Oakland or Berkeley.",
    location:
      "2000 Powell St sits among Emeryville's central office buildings with access to nearby retail, hotels, and East Bay freeway connections.",
    best_for: [
      "Office users",
      "Professional-service teams",
      "Businesses comparing East Bay office alternatives",
    ],
  }),
  building({
    address: "5980 Horton St",
    city: "Emeryville",
    district: emeryville,
    role: "Horton Street office / production-adjacent building",
    description:
      "5980 Horton St is a representative Emeryville building for the district's office and production-adjacent commercial texture.",
    about:
      "The building adds public depth to the Horton Street side of Emeryville, where office, creative, service, and R&D-support uses overlap.",
    location:
      "5980 Horton St is part of the Emeryville commercial grid between Powell Street, Hollis Street, and Shellmound-oriented activity.",
    best_for: [
      "Creative and technical teams",
      "Office/flex users",
      "Businesses evaluating Emeryville's industrial-transition context",
    ],
  }),
  building({
    address: "6001 Shellmound St",
    city: "Emeryville",
    district: emeryville,
    role: "Shellmound mixed commercial corridor",
    description:
      "6001 Shellmound St is a representative Emeryville building for the district's Shellmound corridor and mixed commercial environment.",
    about:
      "The address helps explain Emeryville's blend of office, retail support, and larger commercial blocks around Shellmound and Bay Street.",
    location:
      "6001 Shellmound St sits near Emeryville's retail and office spine, giving users context for the amenity side of the district.",
    best_for: [
      "Office users wanting nearby amenities",
      "Service and mixed commercial businesses",
      "Teams comparing Emeryville with Berkeley and Oakland",
    ],
  }),
  building({
    address: "5900 Hollis St",
    city: "Emeryville",
    district: emeryville,
    role: "Hollis Street office / flex corridor",
    description:
      "5900 Hollis St is a representative Emeryville commercial building for the Hollis Street office/flex corridor.",
    about:
      "The raw data shows repeated commercial activity at this address, making it useful for explaining Emeryville's practical office/flex building stock.",
    location:
      "5900 Hollis St sits in the central Emeryville business grid, close to Powell, Horton, Christie, and Shellmound commercial activity.",
    best_for: [
      "Office/flex users",
      "R&D-support businesses",
      "Teams comparing Emeryville and West Berkeley",
    ],
  }),
  building({
    address: "1250 45th St",
    city: "Emeryville",
    district: emeryville,
    role: "Emeryville Business Center context",
    description:
      "1250 45th St is a representative Emeryville building for the district's smaller business-center and service-commercial environment.",
    about:
      "The address helps show Emeryville's smaller-format commercial stock, not just its larger Powell Street office buildings.",
    location:
      "1250 45th St sits near Emeryville's Oakland/Berkeley edge, where service commercial, small office, and flex uses are common.",
    best_for: [
      "Small office users",
      "Service-commercial businesses",
      "Companies needing practical East Bay access",
    ],
  }),
  building({
    address: "5901 Christie Ave",
    city: "Emeryville",
    district: emeryville,
    role: "Christie Avenue office / mixed commercial",
    description:
      "5901 Christie Ave is a representative Emeryville building in the district's Christie Avenue office and mixed commercial cluster.",
    about:
      "The building adds another public reference point for Christie Avenue, one of Emeryville's strongest office and mixed-commercial corridors.",
    location:
      "5901 Christie Ave sits near Emeryville's Powell and Bay Street commercial activity, supporting office users that want amenities and regional access.",
    best_for: [
      "Office users",
      "Teams needing Emeryville amenities",
      "Businesses comparing Powell and Christie corridor options",
    ],
  }),
  building({
    address: "967 Stanford Ave",
    city: "Emeryville",
    district: emeryville,
    role: "Stanford Avenue flex / service commercial",
    description:
      "967 Stanford Ave is a representative Emeryville building for the district's flex, service-commercial, and industrial-transition edge.",
    about:
      "The address helps explain Emeryville's non-tower commercial inventory: practical buildings for local operations, creative, and service users.",
    location:
      "967 Stanford Ave sits near Emeryville's eastern commercial edge, connecting the city to Berkeley and Oakland service corridors.",
    best_for: [
      "Flex and service-commercial users",
      "Production-adjacent businesses",
      "Teams evaluating Emeryville's practical commercial stock",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  building({
    address: "4045 Horton St",
    city: "Emeryville",
    district: emeryville,
    role: "Horton Street flex / production-adjacent building",
    description:
      "4045 Horton St is a representative Emeryville building for larger flex and production-adjacent commercial uses.",
    about:
      "The address adds depth to Emeryville's creative and industrial-transition building stock, complementing the office-heavy Powell Street examples.",
    location:
      "4045 Horton St sits toward Emeryville's southern commercial edge, near Oakland and the broader East Bay industrial/flex network.",
    best_for: [
      "Creative production users",
      "Flex and R&D-support businesses",
      "Companies comparing Emeryville with West Berkeley",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  building({
    address: "1480 64th St",
    city: "Emeryville",
    district: emeryville,
    role: "Hollis Business Center context",
    description:
      "1480 64th St is a representative Emeryville building for business-center and office/flex users near the Hollis corridor.",
    about:
      "The building helps show Emeryville's northern office/flex edge and its relationship to Berkeley and the broader East Bay innovation corridor.",
    location:
      "1480 64th St sits near Hollis Street and the northern Emeryville commercial area, close to Berkeley adjacency.",
    best_for: [
      "Office/flex users",
      "R&D-support teams",
      "Businesses comparing Emeryville and West Berkeley",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  building({
    address: "1400 65th St",
    city: "Emeryville",
    district: emeryville,
    role: "EmeryTech office / R&D context",
    description:
      "1400 65th St is a representative Emeryville building for the district's office, R&D-support, and technology-adjacent commercial identity.",
    about:
      "The raw record identifies EmeryTech / EmeryTech Phase II, making this address useful for showing Emeryville's technical-user and office/flex character.",
    location:
      "1400 65th St sits near Emeryville's northern commercial edge, where office/flex buildings connect toward Berkeley.",
    best_for: [
      "Technology-adjacent teams",
      "R&D-support users",
      "Companies comparing Emeryville with Berkeley",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),

  building({
    address: "2140 Shattuck Ave",
    city: "Berkeley",
    district: downtownBerkeley,
    role: "Shattuck Avenue transit-oriented office",
    description:
      "2140 Shattuck Ave is a representative Downtown Berkeley building for office users evaluating the Shattuck corridor and BART-oriented business context.",
    about:
      "Raw building data shows substantial historical listing activity at this address, making it a strong public reference for Downtown Berkeley's office geography.",
    location:
      "2140 Shattuck Ave sits in Downtown Berkeley's core, close to BART, UC Berkeley, civic activity, and professional-service demand.",
    best_for: [
      "Transit-oriented office users",
      "University-adjacent organizations",
      "Professional-service firms",
    ],
  }),
  building({
    address: "2150 Shattuck Ave",
    city: "Berkeley",
    district: downtownBerkeley,
    role: "Downtown Berkeley office building",
    description:
      "2150 Shattuck Ave is a representative Downtown Berkeley office building near the district's BART and university-adjacent commercial core.",
    about:
      "The address helps strengthen Downtown Berkeley's public building set with another high-activity Shattuck corridor reference.",
    location:
      "2150 Shattuck Ave is located in the central Shattuck corridor, close to downtown services, transit, and UC Berkeley.",
    best_for: [
      "Professional office users",
      "Transit-oriented teams",
      "Organizations serving Berkeley institutions",
    ],
  }),
  building({
    address: "2030 Addison St",
    city: "Berkeley",
    district: downtownBerkeley,
    role: "Addison Street professional office",
    description:
      "2030 Addison St is a representative Downtown Berkeley building for the district's professional office and civic-adjacent commercial context.",
    about:
      "The raw record identifies the ELS Building, giving Downtown Berkeley another named office reference near the Addison/Shattuck core.",
    location:
      "2030 Addison St sits near BART, civic uses, and the University Avenue/Shattuck commercial spine.",
    best_for: [
      "Professional-service firms",
      "Civic and institutional-adjacent organizations",
      "Small to mid-size office users",
    ],
  }),
  building({
    address: "1936 University Ave",
    city: "Berkeley",
    district: downtownBerkeley,
    role: "University Avenue downtown commercial",
    description:
      "1936 University Ave is a representative Downtown Berkeley building for users evaluating University Avenue commercial context.",
    about:
      "The building helps explain the district's blend of office, service, and street-level commercial activity near transit and UC Berkeley.",
    location:
      "1936 University Ave sits on one of Berkeley's primary downtown corridors, connecting the Shattuck core with surrounding commercial blocks.",
    best_for: [
      "Service and professional businesses",
      "University-adjacent users",
      "Teams wanting downtown Berkeley visibility",
    ],
  }),
  building({
    address: "2300 Shattuck Ave",
    city: "Berkeley",
    district: downtownBerkeley,
    role: "Shattuck corridor office building",
    description:
      "2300 Shattuck Ave is a representative Downtown Berkeley building for larger Shattuck corridor office and professional-service users.",
    about:
      "The address adds scale and corridor depth to Downtown Berkeley's public building coverage.",
    location:
      "2300 Shattuck Ave sits south of the core BART area but remains tied to Downtown Berkeley's Shattuck Avenue business environment.",
    best_for: [
      "Office users",
      "Professional services",
      "Teams comparing Downtown Berkeley with Emeryville",
    ],
  }),
  building({
    address: "2130 Center St",
    city: "Berkeley",
    district: downtownBerkeley,
    role: "Center Street office / civic core",
    description:
      "2130 Center St is a representative Downtown Berkeley building for civic, arts, and professional office context near the district core.",
    about:
      "Center Street helps show Downtown Berkeley's civic and institutional character, distinct from the industrial/flex identity of West Berkeley.",
    location:
      "2130 Center St sits near BART, civic uses, arts venues, and the UC Berkeley edge.",
    best_for: [
      "Civic and nonprofit organizations",
      "Professional office users",
      "Teams prioritizing BART access",
    ],
  }),
  building({
    address: "2168 Shattuck Ave",
    city: "Berkeley",
    district: downtownBerkeley,
    role: "Shattuck Avenue professional office",
    description:
      "2168 Shattuck Ave is a representative Downtown Berkeley office building in the district's central transit-oriented business corridor.",
    about:
      "The raw record identifies Constitution Square, making the building a useful public reference for the district's professional office identity.",
    location:
      "2168 Shattuck Ave is located in the central Shattuck corridor near Downtown Berkeley BART and university-facing services.",
    best_for: [
      "Professional-service users",
      "Transit-oriented office teams",
      "Organizations needing downtown Berkeley identity",
    ],
  }),
  building({
    address: "2070 Allston Way",
    city: "Berkeley",
    district: downtownBerkeley,
    role: "Allston Way professional office",
    description:
      "2070 Allston Way is a representative Downtown Berkeley building for smaller professional office and service users near the downtown core.",
    about:
      "The address adds a secondary-street office reference that complements the Shattuck and University Avenue examples.",
    location:
      "2070 Allston Way sits close to Shattuck Avenue, BART, and Downtown Berkeley's civic and university-adjacent activity.",
    best_for: [
      "Small office users",
      "Professional services",
      "Organizations wanting downtown access without a tower setting",
    ],
  }),
  building({
    address: "2040 Bancroft Way",
    city: "Berkeley",
    district: downtownBerkeley,
    role: "UC Berkeley edge office",
    description:
      "2040 Bancroft Way is a representative Downtown Berkeley building for university-edge office and service users.",
    about:
      "The building helps explain Downtown Berkeley's relationship to UC Berkeley, especially for organizations that value institutional adjacency.",
    location:
      "2040 Bancroft Way sits near the campus edge and downtown commercial core.",
    best_for: [
      "University-adjacent organizations",
      "Education and nonprofit users",
      "Professional teams serving Berkeley clients",
    ],
  }),
  building({
    address: "2118 Milvia St",
    city: "Berkeley",
    district: downtownBerkeley,
    role: "Milvia Street service office",
    description:
      "2118 Milvia St is a representative Downtown Berkeley building for local service and smaller office users near the civic core.",
    about:
      "The address adds a quieter downtown office example outside the primary Shattuck frontage.",
    location:
      "2118 Milvia St is close to BART, civic activity, and Downtown Berkeley's professional-service environment.",
    best_for: [
      "Small professional offices",
      "Local service businesses",
      "Organizations prioritizing central Berkeley access",
    ],
  }),

  building({
    address: "950 Gilman St",
    city: "Berkeley",
    district: westBerkeley,
    role: "Gilman Street industrial / flex corridor",
    description:
      "950 Gilman St is a representative West Berkeley building for industrial, flex, and service-commercial users along the Gilman corridor.",
    about:
      "Raw building data shows strong listing activity at this address, making it a useful public reference for West Berkeley's practical commercial stock.",
    location:
      "950 Gilman St sits in West Berkeley's industrial and flex geography, close to I-80 access and the district's maker/service corridors.",
    best_for: [
      "Industrial and flex users",
      "Maker and production businesses",
      "Teams comparing West Berkeley with Emeryville",
    ],
    type: "Industrial Space",
    primary_space_type: "industrial",
  }),
  building({
    address: "2600 10th St",
    city: "Berkeley",
    district: westBerkeley,
    role: "Creative production / media center",
    description:
      "2600 10th St is a representative West Berkeley building for creative production, media, and adaptive commercial uses.",
    about:
      "The raw record identifies the Saul Zaentz Media Center, making this a strong example of West Berkeley's creative and production-adjacent commercial identity.",
    location:
      "2600 10th St sits in West Berkeley's maker and industrial-transition district near the Gilman, Heinz, and Fourth Street commercial context.",
    best_for: [
      "Creative production users",
      "Media and studio businesses",
      "Companies needing adaptive commercial space",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  building({
    address: "3100 San Pablo Ave",
    city: "Berkeley",
    district: westBerkeley,
    role: "San Pablo Avenue commercial / flex edge",
    description:
      "3100 San Pablo Ave is a representative West Berkeley building for service-commercial and flex users along the San Pablo corridor.",
    about:
      "The address helps explain West Berkeley's corridor-based commercial geography and its relationship to Emeryville and Oakland.",
    location:
      "3100 San Pablo Ave sits on West Berkeley's eastern commercial edge, linking local service uses with the district's industrial/flex fabric.",
    best_for: [
      "Service-commercial businesses",
      "Showroom and flex users",
      "Companies comparing Berkeley and Emeryville corridors",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  building({
    address: "2560 9th St",
    city: "Berkeley",
    district: westBerkeley,
    role: "Ninth Street flex / R&D building",
    description:
      "2560 9th St is a representative West Berkeley building for flex, R&D-support, and production-adjacent uses.",
    about:
      "The address appears repeatedly in raw building data and helps ground the district's technical and maker-oriented building stock.",
    location:
      "2560 9th St sits in West Berkeley's industrial-transition area near Heinz, Gilman, and the Fourth Street commercial environment.",
    best_for: [
      "Flex and R&D-support users",
      "Maker businesses",
      "Production-adjacent companies",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  building({
    address: "829 Heinz Ave",
    city: "Berkeley",
    district: westBerkeley,
    role: "Heinz Avenue R&D / maker corridor",
    description:
      "829 Heinz Ave is a representative West Berkeley building for R&D, maker, and light-industrial users.",
    about:
      "Heinz Avenue is one of West Berkeley's clearest commercial signals for production-adjacent and technical-user space.",
    location:
      "829 Heinz Ave sits in West Berkeley's industrial and maker geography, close to the district's Ninth and Tenth Street commercial fabric.",
    best_for: [
      "R&D-support users",
      "Maker and production teams",
      "Businesses needing Berkeley talent adjacency",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  building({
    address: "650 University Ave",
    city: "Berkeley",
    district: westBerkeley,
    role: "West-side University Avenue commercial",
    description:
      "650 University Ave is a representative West Berkeley building for commercial users needing west-side Berkeley access and service context.",
    about:
      "The address helps connect West Berkeley's industrial/flex geography with University Avenue's broader commercial corridor.",
    location:
      "650 University Ave sits near the west-side Berkeley commercial corridor and the district's I-80-oriented access pattern.",
    best_for: [
      "Service-commercial users",
      "Office/flex businesses",
      "Teams needing west-side Berkeley access",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  building({
    address: "1608 4th St",
    city: "Berkeley",
    district: westBerkeley,
    role: "Fourth Street maker / showroom context",
    description:
      "1608 4th St is a representative West Berkeley building for Fourth Street commercial, showroom, and maker-adjacent uses.",
    about:
      "The address supports West Berkeley's identity as a hybrid district with showroom, maker, light-industrial, and creative commercial stock.",
    location:
      "1608 4th St sits near the Fourth Street corridor, a recognizable West Berkeley commercial environment.",
    best_for: [
      "Showroom users",
      "Creative and maker businesses",
      "Retail-adjacent commercial users",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  building({
    address: "2550 9th St",
    city: "Berkeley",
    district: westBerkeley,
    role: "Ninth Street flex / service building",
    description:
      "2550 9th St is a representative West Berkeley building for flex, service, and small production-oriented users.",
    about:
      "The address adds another real Ninth Street reference to the public building set, strengthening the district's maker/flex identity.",
    location:
      "2550 9th St sits near other West Berkeley flex and industrial-transition properties.",
    best_for: [
      "Small production businesses",
      "Flex users",
      "Service-commercial operators",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  building({
    address: "2501 9th St",
    city: "Berkeley",
    district: westBerkeley,
    role: "Ninth Street industrial / flex building",
    description:
      "2501 9th St is a representative West Berkeley building for industrial/flex users in the district's production-oriented core.",
    about:
      "The address reinforces the Ninth Street cluster as a useful public reference for West Berkeley's building stock.",
    location:
      "2501 9th St sits in the West Berkeley industrial and maker corridor, close to Gilman and Heinz activity.",
    best_for: [
      "Industrial/flex users",
      "Maker and operations businesses",
      "Companies comparing West Berkeley with Emeryville",
    ],
    type: "Industrial Space",
    primary_space_type: "industrial",
  }),
  building({
    address: "717 Potter St",
    city: "Berkeley",
    district: westBerkeley,
    role: "Lab / R&D-oriented building",
    description:
      "717 Potter St is a representative West Berkeley building for lab, R&D, and technical production users.",
    about:
      "The raw record identifies this as a lab-oriented Berkeley building, making it a strong fit for West Berkeley's R&D and life-science-adjacent story.",
    location:
      "717 Potter St sits in West Berkeley's production and research-adjacent commercial area near the Heinz and Ninth Street corridors.",
    best_for: [
      "R&D users",
      "Lab-adjacent organizations",
      "Technical and production-oriented companies",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  building({
    address: "2929 7th St",
    city: "Berkeley",
    district: westBerkeley,
    role: "Aquatic Park industrial / flex context",
    description:
      "2929 7th St is a representative West Berkeley building for flex and industrial users near the Aquatic Park side of the district.",
    about:
      "The address adds a west-side reference point that helps explain West Berkeley's relationship to I-80, Aquatic Park, and practical industrial access.",
    location:
      "2929 7th St sits near West Berkeley's waterfront-adjacent industrial and flex environment.",
    best_for: [
      "Flex users",
      "Operations-oriented businesses",
      "Companies needing west-side access",
    ],
    type: "Industrial Space",
    primary_space_type: "industrial",
  }),
  building({
    address: "918 Parker St",
    city: "Berkeley",
    district: westBerkeley,
    role: "Parker Street flex / production building",
    description:
      "918 Parker St is a representative West Berkeley building for production, flex, and service-commercial users.",
    about:
      "The address adds a Parker Street example to the district's public building set, rounding out the Fourth, Ninth, Gilman, Heinz, and San Pablo references.",
    location:
      "918 Parker St sits in West Berkeley's maker and industrial-transition environment.",
    best_for: [
      "Production users",
      "Flex and service-commercial businesses",
      "Teams evaluating West Berkeley's practical building stock",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),

  building({
    address: "144 2nd St",
    city: "San Francisco",
    district: soma,
    role: "Converted warehouse / creative office texture",
    description:
      "144 2nd St is a representative SoMa commercial building that helps explain the district's converted warehouse and creative-office texture near the 2nd Street corridor.",
    about:
      "The building is useful as a SoMa reference because it reads as central-city commercial fabric rather than a conventional downtown tower. It supports the district story around adaptive reuse, smaller floorplate office demand, and the transition between Market Street, South Park, and Central SoMa.",
    location:
      "144 2nd St sits in a core SoMa position where office, retail, transit access, and older commercial blocks overlap. It should be read as district context, not as an indication of current availability.",
    best_for: [
      "Teams comparing adaptive office settings",
      "Creative and professional-service users",
      "Businesses studying Central SoMa context",
    ],
  }),
  building({
    address: "156 2nd St",
    city: "San Francisco",
    district: soma,
    role: "2nd Street adaptive office context",
    description:
      "156 2nd St is a representative SoMa building for understanding the district's smaller-scale adaptive office environment near the 2nd Street commercial spine.",
    about:
      "The address helps show how SoMa mixes historic commercial structure, street-level activity, and office use at a scale that contrasts with the Financial District's vertical core.",
    location:
      "156 2nd St belongs to the Central SoMa and 2nd Street transition area, close enough to downtown to remain office-oriented while retaining a distinct SoMa commercial texture.",
    best_for: [
      "Professional-service teams",
      "Creative office users",
      "Businesses comparing SoMa with the Financial District",
    ],
  }),
  building({
    address: "414 Brannan St",
    city: "San Francisco",
    district: soma,
    role: "South Park creative office cluster",
    description:
      "414 Brannan St is a representative SoMa building for the South Park and Brannan Street office cluster, where converted commercial buildings and modern office use sit close together.",
    about:
      "The building helps explain SoMa's district form: lower and mid-rise commercial blocks, warehouse-office transitions, and creative office demand south of the downtown core.",
    location:
      "414 Brannan St sits in the South Park and Brannan Street context, between the 2nd Street transition area, Townsend corridor, and the China Basin edge.",
    best_for: [
      "Creative office users",
      "Smaller technology and professional teams",
      "Users comparing South Park and Central SoMa",
    ],
  }),
  building({
    address: "699 2nd St",
    city: "San Francisco",
    district: soma,
    role: "China Basin / 2nd Street edge",
    description:
      "699 2nd St is a representative SoMa building for the district's China Basin and 2nd Street edge, where office, service, warehouse, and waterfront-adjacent context begin to overlap.",
    about:
      "The address is useful for understanding SoMa beyond the Market Street edge. It points toward the larger-block commercial fabric that connects South Park, Townsend, Mission Bay, and the waterfront.",
    location:
      "699 2nd St sits near the southern and waterfront-oriented side of SoMa, making it a useful reference for edge conditions between Central SoMa, China Basin, and Mission Bay.",
    best_for: [
      "Businesses comparing SoMa edge conditions",
      "Teams evaluating larger-block office context",
      "Users studying SoMa and Mission Bay adjacency",
    ],
  }),
  building({
    address: "1800 Owens St",
    city: "San Francisco",
    district: missionBay,
    role: "Institutional / life-science office",
    description:
      "1800 Owens St is a representative Mission Bay commercial building that helps explain the district's institutional, life-science, and modern office orientation.",
    about:
      "The building supports Mission Bay's commercial identity as a newer, larger-parcel district shaped by UCSF gravity, research-oriented tenants, and modern office and lab-adjacent environments.",
    location:
      "1800 Owens St sits within Mission Bay's institutional-commercial setting south of SoMa, close to larger development parcels and waterfront-adjacent circulation.",
    best_for: [
      "Life-science and research-adjacent users",
      "Institutional office teams",
      "Businesses comparing Mission Bay with SoMa",
    ],
  }),
  building({
    address: "500 Terry Francois Blvd",
    city: "San Francisco",
    district: missionBay,
    role: "Waterfront-adjacent commercial",
    description:
      "500 Terry Francois Blvd is a representative Mission Bay building for understanding the district's waterfront-adjacent modern commercial environment.",
    about:
      "The address helps show Mission Bay as a planned, newer commercial district with larger blocks, institutional anchors, and a different rhythm than SoMa's converted warehouse fabric.",
    location:
      "500 Terry Francois Blvd sits near Mission Bay's waterfront edge, connecting the district's modern office and institutional context to the bayfront setting.",
    best_for: [
      "Modern office users",
      "Institutional and research-adjacent teams",
      "Users comparing waterfront-adjacent commercial settings",
    ],
  }),
  building({
    address: "555 Mission Rock St",
    city: "San Francisco",
    district: missionBay,
    role: "Modern mixed-use commercial",
    description:
      "555 Mission Rock St is a representative Mission Bay building for the district's newer mixed-use commercial form near the waterfront and ballpark edge.",
    about:
      "The building helps explain Mission Bay's current commercial geography: modern development parcels, institutional and office demand, waterfront adjacency, and a more planned urban form than older SoMa blocks.",
    location:
      "555 Mission Rock St sits in the Mission Bay and Mission Rock context, where office, institutional, retail, and waterfront circulation patterns meet.",
    best_for: [
      "Modern office teams",
      "Life-science adjacent users",
      "Businesses comparing new-development districts",
    ],
  }),
  building({
    address: "1000 Broadway",
    city: "Oakland",
    district: oldOakland,
    role: "Historic downtown transition",
    description:
      "1000 Broadway is a representative Old Oakland building for understanding the transition between Oakland's historic commercial blocks and its formal downtown office core.",
    about:
      "The address helps explain Old Oakland as connective commercial tissue: close to Broadway and Downtown Oakland, but smaller-scaled and more historic in feel than the civic and office-core setting to the north and east.",
    location:
      "1000 Broadway sits at a practical downtown edge, connecting Old Oakland to Broadway, BART access, civic office demand, and Jack London Square to the south.",
    best_for: [
      "Professional-service users",
      "Teams comparing downtown-edge office settings",
      "Businesses studying Old Oakland and Downtown Oakland adjacency",
    ],
  }),
  building({
    address: "1212 Broadway",
    city: "Oakland",
    district: oldOakland,
    role: "Broadway transit-oriented edge",
    description:
      "1212 Broadway is a representative Old Oakland building for the Broadway edge, where historic downtown transition and Oakland's formal office core meet.",
    about:
      "The building helps show how Old Oakland relates to Downtown Oakland: close to transit and business services, but still tied to smaller-scale commercial blocks and street-level retail texture.",
    location:
      "1212 Broadway sits along the Broadway corridor near Old Oakland, Downtown Oakland, and BART-oriented commercial activity.",
    best_for: [
      "Transit-oriented office users",
      "Client-facing professional services",
      "Businesses comparing Old Oakland with Downtown Oakland",
    ],
  }),
  building({
    address: "160 Franklin St",
    city: "Oakland",
    district: jackLondonSquare,
    role: "Waterfront-adjacent commercial",
    description:
      "160 Franklin St is a representative Jack London Square building for understanding Oakland's waterfront-adjacent commercial environment.",
    about:
      "The building helps explain Jack London Square as an office, service, food and beverage, and visitor-facing district shaped by waterfront access, rail, ferry movement, and warehouse-adjacent blocks.",
    location:
      "160 Franklin St sits near the Jack London Square waterfront, connecting the district's commercial uses to ferry, rail, and lower-scale adaptive urban fabric.",
    best_for: [
      "Waterfront-adjacent office users",
      "Service and professional teams",
      "Businesses comparing Oakland waterfront settings",
    ],
  }),
  building({
    address: "424 3rd St",
    city: "Oakland",
    district: jackLondonSquare,
    role: "Adaptive commercial building",
    description:
      "424 3rd St is a representative Jack London Square building for the district's warehouse-adjacent and adaptive commercial texture.",
    about:
      "The address helps distinguish Jack London Square from Downtown Oakland. It points to lower-scale commercial blocks, service-commercial uses, and a waterfront-adjacent environment rather than a formal office core.",
    location:
      "424 3rd St sits in the Jack London Square commercial area south of Downtown Oakland and Old Oakland, near the rail and waterfront context that shape the district.",
    best_for: [
      "Adaptive commercial users",
      "Creative and service-commercial teams",
      "Businesses comparing Jack London Square with Downtown Oakland",
    ],
  }),
  building({
    address: "119 Filbert St",
    city: "Oakland",
    district: jackLondonSquare,
    role: "Waterfront service-commercial edge",
    description:
      "119 Filbert St is a representative Jack London Square building for the district's lower-scale service-commercial and waterfront-edge environment.",
    about:
      "The building supports the Jack London Square district story around adaptive blocks, waterfront adjacency, and commercial uses that are less formal than Oakland's Broadway office core.",
    location:
      "119 Filbert St sits near the Jack London Square and waterfront edge, connecting lower-scale commercial blocks to nearby rail, ferry, and food and beverage activity.",
    best_for: [
      "Service-commercial users",
      "Small office and creative teams",
      "Users comparing Oakland waterfront commercial blocks",
    ],
  }),
  building({
    address: "525 University Ave",
    city: "Palo Alto",
    district: downtownPaloAlto,
    role: "University Avenue professional office",
    description:
      "525 University Ave is a representative Downtown Palo Alto building for the district's walkable professional and startup-oriented commercial environment.",
    about:
      "The address helps explain Downtown Palo Alto as a client-facing Peninsula district organized around University Avenue, Caltrain access, professional services, and smaller downtown office buildings.",
    location:
      "525 University Ave sits on the district's primary commercial spine, connecting office, retail, restaurant, Caltrain, and Stanford-adjacent business context.",
    best_for: [
      "Professional-service teams",
      "Startup and venture-adjacent users",
      "Client-facing Peninsula businesses",
    ],
  }),
  building({
    address: "101 Lytton Ave",
    city: "Palo Alto",
    district: downtownPaloAlto,
    role: "Caltrain-oriented professional office",
    description:
      "101 Lytton Ave is a representative Downtown Palo Alto building for the Caltrain-adjacent professional office setting at the edge of University Avenue.",
    about:
      "The building helps show Downtown Palo Alto's difference from campus or freeway-corridor office geography: walkable, transit-oriented, client-facing, and embedded in a downtown commercial fabric.",
    location:
      "101 Lytton Ave sits close to University Avenue and the Caltrain station, making it useful for understanding downtown's transit and professional-service orientation.",
    best_for: [
      "Client-facing professional teams",
      "Startup and venture-adjacent users",
      "Businesses comparing walkable Peninsula office settings",
    ],
  }),
  building({
    address: "200 Hamilton Ave",
    city: "Palo Alto",
    district: downtownPaloAlto,
    role: "Hamilton Avenue client-facing office",
    description:
      "200 Hamilton Ave is a representative Downtown Palo Alto building for the district's client-facing professional office environment around Hamilton Avenue.",
    about:
      "The address helps explain the district's compact professional geography: office users, restaurants, services, transit, and Stanford-adjacent business demand concentrated in a walkable downtown.",
    location:
      "200 Hamilton Ave sits within the Hamilton Avenue office setting, close to University Avenue and the broader Downtown Palo Alto commercial core.",
    best_for: [
      "Professional-service users",
      "Small to mid-size office teams",
      "Businesses comparing downtown Peninsula locations",
    ],
  }),
];
