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
  shortlist_reason,
  typical_tenant_profile,
  building_character,
  strengths,
  tradeoffs,
  less_suitable_for,
  nearby_amenities,
  access_context,
  district_relationship,
  shortlist_reasons,
  validation_questions,
  related_handbook_topics,
  nearby_alternatives,
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
    meta_title: `${address} | ${district.name} Commercial Building | Rofo`,
    meta_description: `${address} is a ${district.name} commercial building in ${city} tied to ${roleSentence} and nearby district context.`,
    teaser: `${label} is included as a commercial building that gives tenants concrete ${district.name} context.`,
    building_description: description,
    about_context: about,
    location_context: location,
    common_fit: role,
    detail_summary: role,
    best_for,
    shortlist_reason:
      shortlist_reason ||
      `${address} is useful as a representative ${district.name} building because it makes the district's commercial character easier to compare against nearby alternatives.`,
    typical_tenant_profile:
      typical_tenant_profile ||
      (best_for && best_for.length ? best_for[0] : "Businesses comparing district fit before narrowing to individual spaces."),
    building_character:
      building_character ||
      role,
    strengths:
      strengths ||
      [
        `Helps compare ${district.name} against nearby districts before touring spaces.`,
        "Gives the search a concrete building example instead of an abstract neighborhood description.",
        "Supports early conversations about location, building character, and business fit.",
      ],
    tradeoffs:
      tradeoffs ||
      [
        "The current suite layout, condition, cost, and timing still need to be verified.",
        "The building may not fit specialized use, parking, infrastructure, or expansion needs.",
        "A nearby district may solve the same requirement with a better tradeoff.",
      ],
    less_suitable_for:
      less_suitable_for ||
      [
        "Businesses that need current availability confirmed before deciding.",
        "Teams with specialized building requirements that have not been validated.",
        "Companies that may be better served by a different district tradeoff.",
      ],
    nearby_amenities: nearby_amenities || "",
    access_context: access_context || "",
    district_relationship:
      district_relationship ||
      `${address} shows one version of the ${district.name} building decision. Compare it with nearby districts and buildings before assuming it is the right fit.`,
    shortlist_reasons: shortlist_reasons || [],
    validation_questions:
      validation_questions ||
      [
        "Does the current floorplate support the team's layout and growth plan?",
        "Do commute, visitor access, parking, and nearby services fit the business?",
        "What buildout, infrastructure, accessibility, or after-hours access issues need validation?",
      ],
    related_handbook_topics: related_handbook_topics || defaultBuildingHandbookTopics,
    nearby_alternatives: nearby_alternatives || [],
    commercial_area: district,
    has_availability: false,
  };
}

const defaultBuildingHandbookTopics = [
  {
    title: "How to Compare Commercial Spaces",
    url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/",
    summary: "Compare location, layout, access, condition, cost, and risk before treating two buildings as equal.",
  },
  {
    title: "Choosing the Right Commercial Location",
    url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/",
    summary: "Use geography to narrow the search before spending time on individual buildings.",
  },
  {
    title: "Tenant Improvements",
    url: "/commercial-real-estate/lease-guide/tenant-improvements/",
    summary: "Understand how buildout needs can affect cost, timing, and whether a space is practical.",
  },
];

function sfDecisionBuilding(options) {
  const districtName = options.district.name;
  const role = options.role || `${districtName} building example`;

  return building({
    city: "San Francisco",
    type: options.type || "Office Space",
    primary_space_type: options.primary_space_type || "office",
    ...options,
    role,
    description:
      options.description ||
      `${options.address} helps explain why businesses consider ${districtName} before comparing individual spaces.`,
    about:
      options.about ||
      `${options.address} is included because businesses often need a concrete building example before deciding whether ${districtName} belongs on the shortlist.`,
    location:
      options.location ||
      `${options.address} should be evaluated in relationship to ${districtName}, nearby districts, access patterns, and the business use rather than as a standalone listing.`,
    best_for:
      options.best_for ||
      [
        `Businesses comparing ${districtName}`,
        "Teams narrowing location strategy before touring",
        "Users comparing representative building formats",
      ],
    strengths:
      options.strengths ||
      [
        `Helps explain ${districtName}'s commercial character`,
        "Provides a concrete reference for comparing nearby district options",
        "Supports building-format discussions before live inventory is reviewed",
      ],
    tradeoffs:
      options.tradeoffs ||
      [
        "Building-level fit still depends on layout, delivery condition, cost structure, and timing.",
        "Current availability is not implied by its appearance on Rofo.",
      ],
    less_suitable_for:
      options.less_suitable_for ||
      [
        "Businesses that need confirmed current availability before comparing districts.",
        "Teams with specialized infrastructure, medical, lab, food-service, or heavy operational requirements that have not been validated.",
        "Companies that need a different balance of parking, cost, visibility, or expansion flexibility.",
      ],
    shortlist_reasons:
      options.shortlist_reasons ||
      [
        `Shows one common commercial environment within ${districtName}.`,
        "Makes nearby district alternatives easier to compare.",
        "Helps frame what to validate before touring spaces.",
      ],
    validation_questions:
      options.validation_questions ||
      [
        "Does the building format support the business use and growth plan?",
        "Do access, transit, parking, and nearby services fit the team's daily routine?",
        "Would a nearby district solve the same need with better cost, flexibility, or image?",
      ],
  });
}

function representativeBuilding({
  address,
  city,
  district,
  role,
  setting,
  location,
  best_for,
  type = "Industrial Space",
  primary_space_type = "industrial",
}) {
  return building({
    address,
    city,
    district,
    role,
    description: `${address} is a ${role} in ${district.name}.`,
    about: setting,
    location,
    best_for,
    type,
    primary_space_type,
  });
}

const soma = area("sf-soma", "SoMa", "San Francisco", "CA", "district");
const missionBay = area("sf-mission-bay", "Mission Bay", "San Francisco", "CA", "district");
const financialDistrict = area("sf-financial-district", "Financial District", "San Francisco", "CA", "downtown_core");
const jacksonSquare = area("sf-jackson-square", "Jackson Square", "San Francisco", "CA", "district");
const dogpatch = area("sf-dogpatch", "Dogpatch", "San Francisco", "CA", "district");
const designDistrict = area("sf-design-district", "Design District / Showplace Square", "San Francisco", "CA", "district");
const oldOakland = area("oak-old-oakland", "Old Oakland", "Oakland", "CA", "district");
const jackLondonSquare = area("oak-jack-london-square", "Jack London Square", "Oakland", "CA", "district");
const downtownPaloAlto = area("ba-downtown-palo-alto", "Downtown Palo Alto", "Palo Alto", "CA", "downtown_core");
const emeryville = area("eb-emeryville-commercial-core", "Emeryville", "Emeryville", "CA", "district");
const downtownBerkeley = area("eb-downtown-berkeley", "Downtown Berkeley", "Berkeley", "CA", "downtown_core");
const westBerkeley = area("eb-west-berkeley", "West Berkeley", "Berkeley", "CA", "district");
const moffettPark = area("sb-moffett-park", "Moffett Park", "Sunnyvale", "CA", "district");
const richmondIndustrial = area("eb-richmond-industrial", "Richmond Industrial", "Richmond", "CA", "industrial_area");
const pointRichmondMarinaBay = area("eb-point-richmond-marina-bay", "Point Richmond / Marina Bay", "Richmond", "CA", "district");
const sanLeandroIndustrial = area("eb-san-leandro-industrial", "San Leandro Industrial", "San Leandro", "CA", "industrial_area");
const hegenbergerCorridor = area("oak-hegenberger-corridor", "Hegenberger Corridor", "Oakland", "CA", "industrial_area");
const coliseumIndustrial = area("oak-coliseum-industrial", "Coliseum Industrial", "Oakland", "CA", "industrial_area");
const westOakland = area("oak-west-oakland", "West Oakland", "Oakland", "CA", "district");
const santanaRowValleyFair = area("sb-santana-row-valley-fair", "Santana Row / Valley Fair", "San Jose", "CA", "district");
const sanJoseAirportGoldenTriangle = area("sb-san-jose-airport-golden-triangle", "Airport / Golden Triangle", "San Jose", "CA", "district");
const cupertinoCommercialCore = area("sb-cupertino-commercial-core", "Cupertino Commercial Core", "Cupertino", "CA", "district");
const downtownSunnyvale = area("sb-downtown-sunnyvale", "Downtown Sunnyvale", "Sunnyvale", "CA", "downtown_core");
const peeryPark = area("sb-peery-park", "Peery Park", "Sunnyvale", "CA", "district");
const menloParkCommercialCore = area("sb-menlo-park-commercial-core", "Menlo Park Commercial Core", "Menlo Park", "CA", "district");
const sandHillStanfordAdjacent = area("sb-sand-hill-stanford-adjacent", "Sand Hill / Stanford-adjacent", "Menlo Park", "CA", "district");
const haywardIndustrial = area("i880-hayward-industrial", "Hayward Industrial", "Hayward", "CA", "industrial_area");
const unionCityIndustrial = area("i880-union-city-industrial", "Union City Industrial", "Union City", "CA", "industrial_area");
const fremontPacificCommons = area("i880-fremont-pacific-commons", "Fremont Pacific Commons", "Fremont", "CA", "district");
const fremontAutoMallParkway = area("i880-fremont-auto-mall-parkway", "Fremont Auto Mall Parkway", "Fremont", "CA", "industrial_area");
const warmSprings = area("sb-warm-springs", "Warm Springs Innovation District", "Fremont", "CA", "district");
const ardenwood = area("sb-ardenwood", "Ardenwood Technology Park", "Fremont", "CA", "district");

module.exports = [
  representativeBuilding({
    address: "3832 Bay Center Pl",
    city: "Hayward",
    district: haywardIndustrial,
    role: "Bay Center business-park industrial building",
    setting: "A Bay Center industrial building that shows Hayward's mix of warehouse, flex, and business-park space near the San Mateo Bridge side of the I-880 corridor.",
    location: "3832 Bay Center Pl sits near Industrial Boulevard, Clawiter Road, and Highway 92 access.",
    best_for: ["Warehouse/flex users", "Distribution teams", "Companies comparing Hayward with San Leandro and Union City"],
  }),
  representativeBuilding({
    address: "25901 Industrial Blvd",
    city: "Hayward",
    district: haywardIndustrial,
    role: "Industrial Boulevard warehouse building",
    setting: "A larger Industrial Boulevard building that reflects Hayward's core warehouse and light-manufacturing market.",
    location: "25901 Industrial Blvd sits near Highway 92, Hesperian Boulevard, and the Eden Landing side of Hayward.",
    best_for: ["Warehouse users", "Manufacturing-support businesses", "Tenants needing Highway 92 and I-880 access"],
  }),
  representativeBuilding({
    address: "2340 Industrial Pkwy W",
    city: "Hayward",
    district: haywardIndustrial,
    role: "Industrial Parkway warehouse / flex building",
    setting: "A west Hayward industrial building that gives tenants a practical reference for the corridor's truck-oriented warehouse and flex supply.",
    location: "2340 Industrial Pkwy W sits near Hesperian Boulevard, I-880, and Hayward's western industrial grid.",
    best_for: ["Warehouse tenants", "Service-industrial users", "Businesses needing west Hayward access"],
  }),
  representativeBuilding({
    address: "3151 Diablo Ave",
    city: "Hayward",
    district: haywardIndustrial,
    role: "Diablo Avenue industrial building",
    setting: "A Diablo Avenue building that shows Hayward's multi-tenant industrial-park inventory for small and mid-sized operators.",
    location: "3151 Diablo Ave sits near Depot Road, Clawiter Road, and the Highway 92 industrial area.",
    best_for: ["Light industrial users", "Contractor and service businesses", "Tenants comparing Hayward industrial parks"],
  }),
  representativeBuilding({
    address: "3596 Baumberg Ave",
    city: "Hayward",
    district: haywardIndustrial,
    role: "Baumberg Avenue industrial building",
    setting: "A Baumberg Avenue building that helps explain Hayward's San Mateo Bridge-adjacent industrial base.",
    location: "3596 Baumberg Ave sits near Highway 92, Eden Landing, and the west Hayward industrial corridor.",
    best_for: ["Logistics users", "Warehouse tenants", "Companies needing bridge and I-880 access"],
  }),
  representativeBuilding({
    address: "21371 Cabot Blvd",
    city: "Hayward",
    district: haywardIndustrial,
    role: "Cabot Boulevard business-center building",
    setting: "A Cabot Boulevard business-center building that adds office/flex and light industrial context to north Hayward.",
    location: "21371 Cabot Blvd sits near Winton Avenue, Hesperian Boulevard, and the I-880 industrial corridor.",
    best_for: ["Office/flex users", "Operations teams", "Light industrial businesses"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "3447 Investment Blvd",
    city: "Hayward",
    district: haywardIndustrial,
    role: "Eden Landing flex building",
    setting: "An Eden Landing building that shows the smaller flex and service-commercial side of Hayward's industrial market.",
    location: "3447 Investment Blvd sits near Eden Landing Road, Industrial Boulevard, and Highway 92.",
    best_for: ["Flex tenants", "Service-industrial businesses", "Small operations users"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "31350 Huntwood Ave",
    city: "Hayward",
    district: haywardIndustrial,
    role: "Huntwood Avenue industrial building",
    setting: "A south Hayward industrial building that reflects the corridor's role for warehouse, service, and manufacturing users moving along I-880.",
    location: "31350 Huntwood Ave sits near Industrial Parkway and the Hayward/Union City side of the corridor.",
    best_for: ["Warehouse users", "Manufacturing-support teams", "Tenants comparing Hayward and Union City"],
  }),
  representativeBuilding({
    address: "30300 Whipple Rd",
    city: "Union City",
    district: unionCityIndustrial,
    role: "Whipple Road industrial building",
    setting: "A Whipple Road building that captures Union City's practical warehouse and industrial role between Hayward and Fremont.",
    location: "30300 Whipple Rd sits near I-880, Union City Boulevard, and Alvarado Niles Road.",
    best_for: ["Warehouse users", "Distribution businesses", "Companies comparing Hayward and Fremont access"],
  }),
  representativeBuilding({
    address: "32900 Alvarado Niles Rd",
    city: "Union City",
    district: unionCityIndustrial,
    role: "Alvarado Niles industrial-park building",
    setting: "A Dowe Business Park building that shows Union City's multi-tenant industrial and flex inventory.",
    location: "32900 Alvarado Niles Rd sits near Central Avenue, Union City Boulevard, and I-880 access.",
    best_for: ["Industrial-park users", "Flex tenants", "Service-industrial businesses"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "33288 Central Ave",
    city: "Union City",
    district: unionCityIndustrial,
    role: "Central Avenue industrial building",
    setting: "A Central Avenue industrial building that helps define Union City's warehouse and production corridor.",
    location: "33288 Central Ave sits near Western Avenue, Alvarado Niles Road, and I-880.",
    best_for: ["Warehouse tenants", "Light manufacturing users", "Industrial service businesses"],
  }),
  representativeBuilding({
    address: "4001 Whipple Rd",
    city: "Union City",
    district: unionCityIndustrial,
    role: "Whipple Road warehouse building",
    setting: "A larger Whipple Road warehouse building that fits Union City's logistics and distribution identity.",
    location: "4001 Whipple Rd sits near I-880 and the Union City/Fremont industrial corridor.",
    best_for: ["Distribution users", "Warehouse tenants", "Companies needing I-880 access"],
  }),
  representativeBuilding({
    address: "1550 Pacific St",
    city: "Union City",
    district: unionCityIndustrial,
    role: "Pacific Street business-park building",
    setting: "A Central Pacific Business Park building that adds office/flex context to Union City's industrial base.",
    location: "1550 Pacific St sits near Whipple Road, Central Avenue, and the I-880 corridor.",
    best_for: ["Flex users", "Operations teams", "Light industrial businesses"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "30336 Whipple Rd",
    city: "Union City",
    district: unionCityIndustrial,
    role: "Alvarado Business Park industrial building",
    setting: "A Whipple Road industrial building that gives tenants a clear sense of Union City's functional business-park and warehouse formats.",
    location: "30336 Whipple Rd sits near Union City Boulevard, Alvarado Niles Road, and I-880.",
    best_for: ["Warehouse users", "Flex tenants", "Service-industrial businesses"],
  }),
  representativeBuilding({
    address: "33333 Western Ave",
    city: "Union City",
    district: unionCityIndustrial,
    role: "Western Avenue industrial building",
    setting: "A Western Avenue building that reinforces Union City's production and distribution geography near Central Avenue.",
    location: "33333 Western Ave sits in Union City's central industrial area with access to I-880 and Alvarado Niles Road.",
    best_for: ["Industrial users", "Light manufacturing teams", "Distribution businesses"],
  }),
  representativeBuilding({
    address: "30100-30150 Ahern St",
    city: "Union City",
    district: unionCityIndustrial,
    role: "Ahern Street commerce-center building",
    setting: "A commerce-center building that shows Union City's functional warehouse and flex options for operators needing East Bay/South Bay reach.",
    location: "30100-30150 Ahern St sits near Whipple Road, I-880, and Union City's industrial core.",
    best_for: ["Warehouse tenants", "Flex users", "Companies comparing Union City and Fremont"],
  }),
  representativeBuilding({
    address: "43806 Pacific Commons Blvd",
    city: "Fremont",
    district: fremontPacificCommons,
    role: "Pacific Commons mixed commercial building",
    setting: "A Pacific Commons building that shows the district's blend of retail-adjacent business services, office, and flexible commercial demand near I-880.",
    location: "43806 Pacific Commons Blvd sits near Auto Mall Parkway, Christy Street, and the Pacific Commons retail and business cluster.",
    best_for: ["Retail-adjacent office users", "Service businesses", "Companies comparing Fremont with North San Jose"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "42840 Christy St",
    city: "Fremont",
    district: fremontPacificCommons,
    role: "Christy Street office / flex building",
    setting: "A Christy Street building that reflects Pacific Commons' office/flex and service-commercial mix near major retail and freeway access.",
    location: "42840 Christy St sits near Pacific Commons, Auto Mall Parkway, and I-880.",
    best_for: ["Office/flex users", "Service-commercial teams", "Businesses needing Fremont customer access"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "41638-41758 Christy St",
    city: "Fremont",
    district: fremontPacificCommons,
    role: "Christy Street flex building",
    setting: "A Christy Street flex building that helps explain Pacific Commons as more than retail: it also supports office, operations, and light industrial users.",
    location: "41638-41758 Christy St sits in the Pacific Commons / Auto Mall side of Fremont near I-880.",
    best_for: ["Flex users", "Operations teams", "Companies comparing Pacific Commons with Auto Mall Parkway"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "41444 Christy St",
    city: "Fremont",
    district: fremontPacificCommons,
    role: "Christy Business Park building",
    setting: "A business-park building that gives Pacific Commons a practical office/flex identity alongside its retail and showroom context.",
    location: "41444 Christy St sits near Pacific Commons, Auto Mall Parkway, and Fremont's I-880 access.",
    best_for: ["Office/flex tenants", "Technology-support teams", "Service-commercial businesses"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "41460 Christy St",
    city: "Fremont",
    district: fremontPacificCommons,
    role: "Christy Street commerce-center building",
    setting: "A commerce-center building that supports Pacific Commons' role for flex, service, and light industrial users near retail amenities.",
    location: "41460 Christy St sits near Auto Mall Parkway, Pacific Commons Boulevard, and I-880.",
    best_for: ["Flex users", "Light industrial users", "Businesses needing retail-adjacent operations space"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "42744 Boscell Rd",
    city: "Fremont",
    district: fremontPacificCommons,
    role: "Boscell Road commercial building",
    setting: "A Boscell Road building that adds local commercial and service-user context to Pacific Commons.",
    location: "42744 Boscell Rd sits near Pacific Commons, Christy Street, and Auto Mall Parkway.",
    best_for: ["Service businesses", "Small office/flex users", "Tenants needing Pacific Commons access"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "5500 Boscell Cmn",
    city: "Fremont",
    district: fremontPacificCommons,
    role: "Boscell Common commercial building",
    setting: "A Pacific Commons-area building that captures the district's retail-adjacent commercial and service-business character.",
    location: "5500 Boscell Cmn sits in the Pacific Commons area near Auto Mall Parkway and I-880.",
    best_for: ["Service-commercial users", "Retail-adjacent businesses", "Small office users"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "44235 Nobel Dr",
    city: "Fremont",
    district: fremontPacificCommons,
    role: "Pacific Commons industrial building",
    setting: "A Pacific Commons industrial building that adds warehouse/flex utility to the district's retail and service-commercial identity.",
    location: "44235 Nobel Dr sits near Pacific Commons, Auto Mall Parkway, and Fremont's I-880 industrial corridor.",
    best_for: ["Warehouse/flex users", "Industrial service businesses", "Companies comparing Pacific Commons and North San Jose"],
  }),
  representativeBuilding({
    address: "5605 Auto Mall Pkwy",
    city: "Fremont",
    district: fremontAutoMallParkway,
    role: "Auto Mall Parkway office / service building",
    setting: "An Auto Mall Parkway building that shows the district's blend of showroom, office, service-commercial, and freeway-oriented business uses.",
    location: "5605 Auto Mall Pkwy sits near Pacific Commons, Boscell Road, and I-880.",
    best_for: ["Showroom users", "Service-commercial teams", "Businesses needing Fremont freeway visibility"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "4580 Auto Mall Pkwy",
    city: "Fremont",
    district: fremontAutoMallParkway,
    role: "Auto Mall Parkway flex / showroom building",
    setting: "A flex/showroom building that reflects Auto Mall Parkway's role for businesses needing visibility, vehicle access, and practical commercial formats.",
    location: "4580 Auto Mall Pkwy sits near I-880, Pacific Commons, and Fremont Boulevard.",
    best_for: ["Showroom users", "Flex tenants", "Service-commercial businesses"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "4400 Auto Mall Pkwy",
    city: "Fremont",
    district: fremontAutoMallParkway,
    role: "Auto Mall Parkway commercial building",
    setting: "A corridor commercial building that helps define Auto Mall Parkway as a practical showroom, service, and business-access location.",
    location: "4400 Auto Mall Pkwy sits near I-880 and the Pacific Commons / Christy Street commercial area.",
    best_for: ["Service businesses", "Showroom users", "Office/flex tenants"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "5605-5639 Auto Mall Pkwy",
    city: "Fremont",
    district: fremontAutoMallParkway,
    role: "Auto Mall Parkway service-commercial building",
    setting: "A service-commercial building that captures the corridor's blend of visibility, access, and practical business formats.",
    location: "5605-5639 Auto Mall Pkwy sits near Pacific Commons and Fremont's I-880 access.",
    best_for: ["Showroom users", "Service-commercial businesses", "Tenants comparing Auto Mall and Pacific Commons"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "40851-40869 Albrae St",
    city: "Fremont",
    district: fremontAutoMallParkway,
    role: "Albrae Street industrial / auto-service building",
    setting: "An Albrae Street industrial/service building that adds warehouse and auto-service utility to the Auto Mall Parkway district.",
    location: "40851-40869 Albrae St sits near Auto Mall Parkway, Fremont Boulevard, and I-880.",
    best_for: ["Industrial service users", "Auto-service businesses", "Flex tenants"],
  }),
  representativeBuilding({
    address: "40547-40577 Albrae St",
    city: "Fremont",
    district: fremontAutoMallParkway,
    role: "Albrae Street business-center building",
    setting: "A business-center building that shows the office/flex and service-industrial side of the Auto Mall Parkway area.",
    location: "40547-40577 Albrae St sits near Auto Mall Parkway, Fremont Boulevard, and I-880 access.",
    best_for: ["Flex users", "Service-industrial tenants", "Small operations teams"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "41407-41601 Albrae St",
    city: "Fremont",
    district: fremontAutoMallParkway,
    role: "Albrae Street flex / industrial building",
    setting: "A flex/industrial building that gives Auto Mall Parkway more operational depth beyond its showroom and retail-facing uses.",
    location: "41407-41601 Albrae St sits near Auto Mall Parkway and Fremont's I-880 industrial corridor.",
    best_for: ["Flex tenants", "Light industrial users", "Companies comparing Fremont and Union City"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "40460 Albrae St",
    city: "Fremont",
    district: fremontAutoMallParkway,
    role: "Albrae Street warehouse / flex building",
    setting: "A warehouse/flex building that reflects the Auto Mall area's practical industrial and service-commercial character.",
    location: "40460 Albrae St sits near Auto Mall Parkway, Fremont Boulevard, and I-880.",
    best_for: ["Warehouse/flex users", "Service businesses", "Light industrial tenants"],
  }),
  representativeBuilding({
    address: "45101-45169 Industrial Dr",
    city: "Fremont",
    district: warmSprings,
    role: "Industrial Drive distribution building",
    setting: "A Warm Springs industrial building that reflects Fremont's advanced manufacturing, distribution, and R&D/flex corridor south of Auto Mall Parkway.",
    location: "45101-45169 Industrial Dr sits near Warm Springs Boulevard, I-880, and the Warm Springs BART side of Fremont.",
    best_for: ["Advanced manufacturing users", "Distribution businesses", "Hardware and operations teams"],
  }),
  representativeBuilding({
    address: "48860 Milmont Dr",
    city: "Fremont",
    district: warmSprings,
    role: "Milmont Drive industrial / flex building",
    setting: "A Milmont Drive building that captures Warm Springs' manufacturing and R&D/flex identity near the Fremont/Milpitas edge.",
    location: "48860 Milmont Dr sits near Kato Road, Warm Springs Boulevard, I-880, and the South Fremont industrial cluster.",
    best_for: ["Manufacturing users", "R&D/flex tenants", "Companies comparing Warm Springs with Milpitas"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "48834 Kato Rd",
    city: "Fremont",
    district: warmSprings,
    role: "Kato Road industrial building",
    setting: "A Kato Road industrial building that reflects Warm Springs' role for hardware, manufacturing, and production-adjacent users.",
    location: "48834 Kato Rd sits near Milmont Drive, Warm Springs Boulevard, and I-880.",
    best_for: ["Hardware teams", "Light manufacturing users", "Industrial/flex tenants"],
  }),
  representativeBuilding({
    address: "48603 Warm Springs Blvd",
    city: "Fremont",
    district: warmSprings,
    role: "Warm Springs Boulevard industrial / flex building",
    setting: "A Warm Springs Boulevard building that gives tenants a practical view of the district's South Fremont industrial and R&D/flex corridor.",
    location: "48603 Warm Springs Blvd sits near Kato Road, Milmont Drive, and the Warm Springs BART area.",
    best_for: ["R&D/flex users", "Manufacturing-support businesses", "Companies needing South Fremont access"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "47697 Westinghouse Dr",
    city: "Fremont",
    district: warmSprings,
    role: "Westinghouse Drive business-center building",
    setting: "A Warm Springs business-center building that supports office/flex, service, and technology operations near I-880.",
    location: "47697 Westinghouse Dr sits near Warm Springs Boulevard, Kato Road, and South Fremont industrial access.",
    best_for: ["Office/flex users", "Operations teams", "Technology support businesses"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "48810-48818 Kato Rd",
    city: "Fremont",
    district: warmSprings,
    role: "Kato Road manufacturing / flex building",
    setting: "A Kato Road building that shows the district's practical manufacturing and industrial/flex formats.",
    location: "48810-48818 Kato Rd sits near Milmont Drive, I-880, and the Warm Springs Boulevard corridor.",
    best_for: ["Manufacturing users", "Hardware teams", "Flex tenants"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "46723 Lakeview Blvd",
    city: "Fremont",
    district: warmSprings,
    role: "Lakeview Boulevard R&D / flex building",
    setting: "A Lakeview Boulevard building that adds R&D/flex context to the Warm Springs and South Fremont technology-manufacturing corridor.",
    location: "46723 Lakeview Blvd sits near Warm Springs Boulevard, Bayside Parkway, and I-880.",
    best_for: ["R&D/flex users", "Technology operations teams", "Advanced manufacturing support"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "255 Fourier Ave",
    city: "Fremont",
    district: ardenwood,
    role: "Fourier Avenue R&D / flex building",
    setting: "An Ardenwood R&D/flex building that reflects the district's technology-park character near the Dumbarton Bridge.",
    location: "255 Fourier Ave sits in Ardenwood near Paseo Padre Parkway, Stevenson Boulevard, and bridge access toward the Peninsula.",
    best_for: ["R&D/flex users", "Technology operations teams", "Companies needing Dumbarton Bridge access"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "215 Fourier Ave",
    city: "Fremont",
    district: ardenwood,
    role: "Fremont Research Center building",
    setting: "A Fourier Avenue research/flex building that shows Ardenwood's appeal for technology and R&D users comparing East Bay buildings with Peninsula access.",
    location: "215 Fourier Ave sits near Ardenwood Boulevard, Paseo Padre Parkway, and the Dumbarton corridor.",
    best_for: ["R&D users", "Technology teams", "Companies comparing Ardenwood and Warm Springs"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "4900 Paseo Padre Pkwy",
    city: "Fremont",
    district: ardenwood,
    role: "Paseo Padre Parkway technology-park building",
    setting: "A technology-park building that gives Ardenwood a strong bridge-adjacent R&D/flex reference point.",
    location: "4900 Paseo Padre Pkwy sits near Ardenwood, Highway 84/Dumbarton Bridge access, and Fremont's north-side technology corridor.",
    best_for: ["Technology office users", "R&D/flex teams", "Companies needing Peninsula access"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "6036 Stevenson Blvd",
    city: "Fremont",
    district: ardenwood,
    role: "Stevenson Boulevard office / flex building",
    setting: "A Stevenson Boulevard building that adds office/flex context to Ardenwood's broader north Fremont business geography.",
    location: "6036 Stevenson Blvd sits near Paseo Padre Parkway, Ardenwood, and Dumbarton Bridge access.",
    best_for: ["Office/flex users", "Technology support teams", "Businesses comparing Ardenwood and central Fremont"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "3068 Laurelview Ct",
    city: "Fremont",
    district: ardenwood,
    role: "Gateway Corporate Center building",
    setting: "A north Fremont corporate-center building that fits Ardenwood's technology and R&D/flex business environment.",
    location: "3068 Laurelview Ct sits near Ardenwood Boulevard, Paseo Padre Parkway, and the Dumbarton Bridge corridor.",
    best_for: ["Technology office users", "Operations teams", "R&D/flex tenants"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "3342 Gateway Blvd",
    city: "Fremont",
    district: ardenwood,
    role: "Gateway Boulevard corporate-center building",
    setting: "A Gateway Boulevard building that supports Ardenwood's role as a bridge-adjacent technology and operations district.",
    location: "3342 Gateway Blvd sits near Ardenwood and the Dumbarton Bridge side of Fremont.",
    best_for: ["Technology operations teams", "Office/flex users", "Companies needing East Bay/Peninsula reach"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "48000-48016 Fremont Blvd",
    city: "Fremont",
    district: ardenwood,
    role: "Bayview Business Center building",
    setting: "A north Fremont business-center building that adds flex and technology-support context to the Ardenwood cluster.",
    location: "48000-48016 Fremont Blvd sits near Ardenwood, Bayside Parkway, and bridge-adjacent Fremont access.",
    best_for: ["Flex tenants", "Technology support users", "Operations teams"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "48301 Lakeview Blvd",
    city: "Fremont",
    district: ardenwood,
    role: "Lakeview Boulevard flex building",
    setting: "A north Fremont flex building that adds practical R&D, light industrial, and technology-operations context to the Ardenwood side of Fremont.",
    location: "48301 Lakeview Blvd sits near Bayside Parkway, Fremont Boulevard, and the Dumbarton Bridge corridor.",
    best_for: ["R&D/flex users", "Technology operations teams", "Companies comparing Ardenwood with Warm Springs"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "47421 Bayside Pkwy",
    city: "Fremont",
    district: ardenwood,
    role: "Bayside Parkway R&D / flex building",
    setting: "A Bayside Parkway R&D/flex building that fits Ardenwood's bridge-adjacent technology and operations market.",
    location: "47421 Bayside Pkwy sits near Ardenwood, Lakeview Boulevard, and Dumbarton Bridge access.",
    best_for: ["R&D/flex users", "Hardware teams", "Businesses needing Fremont and Peninsula reach"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "3031 Tisch Way",
    city: "San Jose",
    district: santanaRowValleyFair,
    role: "Santana Row office building",
    setting: "A Santana Row office building for teams that want West San Jose visibility, nearby retail amenities, and a more polished mixed-use setting than a traditional office park.",
    location: "3031 Tisch Way sits near Santana Row, Valley Fair, Winchester Boulevard, and Stevens Creek Boulevard.",
    best_for: ["Client-facing office users", "Professional-service teams", "Companies comparing West San Jose with Downtown San Jose"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "550 S Winchester Blvd",
    city: "San Jose",
    district: santanaRowValleyFair,
    role: "Winchester Boulevard office building",
    setting: "A Winchester Boulevard office building that gives tenants a practical reference point for the office and medical-office inventory around Santana Row and Valley Fair.",
    location: "550 S Winchester Blvd sits just south of Stevens Creek Boulevard and the Santana Row / Valley Fair retail core.",
    best_for: ["Professional office users", "Medical office users", "Businesses wanting West San Jose customer access"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "560 S Winchester Blvd",
    city: "San Jose",
    district: santanaRowValleyFair,
    role: "Winchester Boulevard commercial building",
    setting: "A smaller commercial office building near the Santana Row / Valley Fair node, useful for teams that want amenity access without a downtown format.",
    location: "560 S Winchester Blvd is close to Santana Row, Valley Fair, and the Stevens Creek retail-office corridor.",
    best_for: ["Small office users", "Local service businesses", "Teams prioritizing retail-adjacent amenities"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "1245 S Winchester Blvd",
    city: "San Jose",
    district: santanaRowValleyFair,
    role: "Winchester Boulevard professional office building",
    setting: "A West San Jose office building that reflects the district's professional-service and medical-office demand around Winchester and Stevens Creek.",
    location: "1245 S Winchester Blvd sits south of Santana Row with access back to I-280, Stevens Creek Boulevard, and nearby neighborhoods.",
    best_for: ["Professional-service firms", "Medical office users", "Client-facing local businesses"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "2880 Stevens Creek Blvd",
    city: "San Jose",
    district: santanaRowValleyFair,
    role: "Stevens Creek Boulevard office building",
    setting: "A Stevens Creek office building that shows how this district blends office users with retail traffic, regional shopping, and West San Jose customer access.",
    location: "2880 Stevens Creek Blvd sits on the corridor leading into Santana Row and Valley Fair.",
    best_for: ["Office users", "Retail-adjacent services", "Businesses comparing Santana Row with Cupertino"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "4340 Stevens Creek Blvd",
    city: "San Jose",
    district: santanaRowValleyFair,
    role: "Stevens Creek Executive Park office building",
    setting: "A corridor office building that connects Santana Row / Valley Fair to the broader Stevens Creek office and service-commercial market.",
    location: "4340 Stevens Creek Blvd sits west of the core retail node, near Santa Clara and Cupertino access routes.",
    best_for: ["Professional office users", "Small teams needing West San Jose access", "Businesses comparing Stevens Creek locations"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "1190 Saratoga Ave",
    city: "San Jose",
    district: santanaRowValleyFair,
    role: "Saratoga Avenue office building",
    setting: "A West San Jose office building that adds neighborhood and regional-service context to the Santana Row / Valley Fair commercial area.",
    location: "1190 Saratoga Ave sits near Stevens Creek Boulevard and the West San Jose retail-office corridor.",
    best_for: ["Professional-service users", "Medical and local-service teams", "Companies needing West San Jose access"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "1600 Saratoga Ave",
    city: "San Jose",
    district: santanaRowValleyFair,
    role: "Saratoga Avenue office building",
    setting: "A local office building that helps define the district beyond Santana Row itself, where professional and service users compare West San Jose and Cupertino access.",
    location: "1600 Saratoga Ave sits west of Santana Row / Valley Fair near Saratoga Avenue and nearby residential customer bases.",
    best_for: ["Local professional firms", "Medical office users", "Service businesses wanting West San Jose reach"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "2025 Gateway Pl",
    city: "San Jose",
    district: sanJoseAirportGoldenTriangle,
    role: "Gateway Place airport-area office building",
    setting: "A Gateway Place office building that captures the airport-area business market around San Jose International, North First Street, and Highway 101.",
    location: "2025 Gateway Pl sits near Mineta San Jose International Airport, Technology Drive, Metro Drive, and North First Street.",
    best_for: ["Airport-adjacent office users", "Technology and operations teams", "Companies comparing Golden Triangle with North San Jose"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "2001 Gateway Pl",
    city: "San Jose",
    district: sanJoseAirportGoldenTriangle,
    role: "Gateway Place office building",
    setting: "A business-travel-oriented office building that gives tenants a clear airport-area alternative to Downtown San Jose or North San Jose's larger R&D corridor.",
    location: "2001 Gateway Pl sits beside the airport and the Highway 101 / Airport Parkway commercial cluster.",
    best_for: ["Regional office users", "Airport-oriented teams", "Businesses needing San Jose and Santa Clara access"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "2033 Gateway Pl",
    city: "San Jose",
    district: sanJoseAirportGoldenTriangle,
    role: "Gateway Place office building",
    setting: "A Gateway Place office building that fits tenants weighing airport proximity, freeway access, and a more conventional office environment.",
    location: "2033 Gateway Pl sits near Airport Parkway, Technology Drive, and the airport-facing side of North San Jose.",
    best_for: ["Office users", "Regional teams", "Companies needing quick airport access"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "226 Airport Pkwy",
    city: "San Jose",
    district: sanJoseAirportGoldenTriangle,
    role: "Airport Parkway office building",
    setting: "An Airport Parkway office building that helps define the corridor's mix of office, travel, and technology-adjacent users.",
    location: "226 Airport Pkwy sits near Mineta San Jose International Airport and the Gateway/Technology Drive office cluster.",
    best_for: ["Airport-area office users", "Client-facing regional teams", "Companies comparing airport access with downtown walkability"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "1735 Technology Dr",
    city: "San Jose",
    district: sanJoseAirportGoldenTriangle,
    role: "Technology Drive office building",
    setting: "A Technology Drive office building that reflects the district's practical office and tech-support character near the airport.",
    location: "1735 Technology Dr sits between Airport Parkway, Gateway Place, and North First Street.",
    best_for: ["Technology office users", "Operations teams", "Airport-adjacent businesses"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "1731 Technology Dr",
    city: "San Jose",
    district: sanJoseAirportGoldenTriangle,
    role: "Technology Drive business-park building",
    setting: "A business-park office building that gives tenants a concrete sense of the Technology Drive cluster near San Jose Airport.",
    location: "1731 Technology Dr sits close to Gateway Place, Airport Parkway, and the North First Street corridor.",
    best_for: ["Office users", "Tech-support teams", "Companies wanting airport-area access without downtown density"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "25 Metro Dr",
    city: "San Jose",
    district: sanJoseAirportGoldenTriangle,
    role: "Metro Drive office building",
    setting: "A Metro Drive office building that helps show the district's established office base near light rail, airport access, and North First Street.",
    location: "25 Metro Dr sits in the airport-area office cluster north of Downtown San Jose.",
    best_for: ["Professional office users", "Regional teams", "Companies comparing Airport / Golden Triangle with Downtown San Jose"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "101 Metro Dr",
    city: "San Jose",
    district: sanJoseAirportGoldenTriangle,
    role: "Metro Drive office building",
    setting: "An airport-area office building that rounds out the Metro Drive side of the Golden Triangle office market.",
    location: "101 Metro Dr sits near North First Street, light rail, Highway 101, and San Jose Airport.",
    best_for: ["Office users", "Technology support teams", "Businesses needing central South Bay access"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "1601 S De Anza Blvd",
    city: "Cupertino",
    district: cupertinoCommercialCore,
    role: "De Anza Boulevard office building",
    setting: "A Cupertino office building that reflects the city's De Anza corridor: professional office, technology support, and local-service demand close to Apple and Stevens Creek.",
    location: "1601 S De Anza Blvd sits on Cupertino's primary north-south commercial spine with access to Highway 85, I-280, and Stevens Creek Boulevard.",
    best_for: ["Professional office users", "Technology support teams", "Companies comparing Cupertino with Sunnyvale"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "10001 N De Anza Blvd",
    city: "Cupertino",
    district: cupertinoCommercialCore,
    role: "De Anza Plaza office building",
    setting: "A De Anza corridor office building for tenants that want Cupertino identity, customer access, and a practical office setting rather than a large campus.",
    location: "10001 N De Anza Blvd sits near the northern side of Cupertino's commercial core and I-280 access.",
    best_for: ["Professional-service teams", "Small office users", "Businesses needing Cupertino customer reach"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "10601 S De Anza Blvd",
    city: "Cupertino",
    district: cupertinoCommercialCore,
    role: "De Anza professional office building",
    setting: "A professional office building that gives tenants a straightforward Cupertino alternative to Sunnyvale or North San Jose office corridors.",
    location: "10601 S De Anza Blvd sits along the De Anza Boulevard commercial spine near Stevens Creek and local retail services.",
    best_for: ["Professional-service users", "Medical office users", "Local and regional office teams"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "21040 Homestead Rd",
    city: "Cupertino",
    district: cupertinoCommercialCore,
    role: "Homestead Road office building",
    setting: "A Homestead Road office building that adds north Cupertino context for businesses comparing Cupertino with Sunnyvale and Santa Clara.",
    location: "21040 Homestead Rd sits near the Cupertino/Sunnyvale edge with access to De Anza Boulevard and I-280.",
    best_for: ["Office users", "Local service firms", "Teams needing Cupertino/Sunnyvale access"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "20111 Stevens Creek Blvd",
    city: "Cupertino",
    district: cupertinoCommercialCore,
    role: "Stevens Creek Boulevard office building",
    setting: "A Stevens Creek office building that shows Cupertino's main commercial corridor and its mix of office, service, and technology-adjacent users.",
    location: "20111 Stevens Creek Blvd sits near Cupertino's central retail and office spine.",
    best_for: ["Office users", "Client-facing teams", "Businesses comparing Cupertino and Santana Row / Valley Fair"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "20450 Stevens Creek Blvd",
    city: "Cupertino",
    district: cupertinoCommercialCore,
    role: "Stevens Creek office building",
    setting: "A Cupertino office building that supports the corridor's professional, technology, and local-service business base.",
    location: "20450 Stevens Creek Blvd sits near De Anza Boulevard, Main Street Cupertino, and I-280 access.",
    best_for: ["Professional office users", "Technology support teams", "Companies needing central Cupertino access"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "18900 Stevens Creek Blvd",
    city: "Cupertino",
    district: cupertinoCommercialCore,
    role: "Stevens Creek professional office building",
    setting: "A West Valley office building useful for tenants comparing Cupertino's customer and talent access with Sunnyvale and San Jose options.",
    location: "18900 Stevens Creek Blvd sits near the eastern side of Cupertino's commercial corridor toward San Jose and Santa Clara.",
    best_for: ["Professional-service firms", "Medical office users", "Client-facing businesses"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "10420 Bubb Rd",
    city: "Cupertino",
    district: cupertinoCommercialCore,
    role: "Bubb Road flex / R&D building",
    setting: "A flex/R&D building that shows Cupertino's technical workspace side beyond its retail and professional-office corridors.",
    location: "10420 Bubb Rd sits near Cupertino's south-side business areas, with access to Highway 85, Stevens Creek Boulevard, and De Anza Boulevard.",
    best_for: ["R&D users", "Engineering teams", "Companies needing Cupertino office/flex context"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "111 W Evelyn Ave",
    city: "Sunnyvale",
    district: downtownSunnyvale,
    role: "Downtown Sunnyvale office building",
    setting: "A downtown office building near Murphy Avenue and Caltrain, useful for tenants that want Sunnyvale access in a walkable mixed-use setting.",
    location: "111 W Evelyn Ave sits near the Sunnyvale Caltrain station, Murphy Avenue, and CityLine Sunnyvale.",
    best_for: ["Startup and office users", "Professional-service teams", "Companies comparing Downtown Sunnyvale with Downtown Mountain View"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "150 Mathilda Pl",
    city: "Sunnyvale",
    district: downtownSunnyvale,
    role: "Mathilda Place office building",
    setting: "A Downtown Sunnyvale office building that gives tenants a Caltrain-adjacent alternative to campus-style Sunnyvale districts.",
    location: "150 Mathilda Pl sits near Mathilda Avenue, Caltrain, and the downtown Sunnyvale commercial core.",
    best_for: ["Office users", "Professional-service teams", "Companies needing transit-adjacent Sunnyvale access"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "200 W Washington Ave",
    city: "Sunnyvale",
    district: downtownSunnyvale,
    role: "CityLine Sunnyvale mixed-use office building",
    setting: "A downtown mixed-use commercial building that reflects Sunnyvale's shift toward a more walkable office, retail, and residential business core.",
    location: "200 W Washington Ave sits in CityLine Sunnyvale near Murphy Avenue and the Caltrain station.",
    best_for: ["Office users wanting downtown amenities", "Client-facing teams", "Businesses comparing walkable Peninsula downtowns"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "100 Mathilda Pl",
    city: "Sunnyvale",
    district: downtownSunnyvale,
    role: "Sunnyvale City Center office building",
    setting: "A City Center office building that helps define Downtown Sunnyvale as a practical office district near transit and local amenities.",
    location: "100 Mathilda Pl sits close to downtown Sunnyvale, Mathilda Avenue, and Caltrain.",
    best_for: ["Office users", "Professional-service firms", "Teams comparing Sunnyvale and Mountain View downtowns"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "640 W California Ave",
    city: "Sunnyvale",
    district: downtownSunnyvale,
    role: "West California Avenue business-park building",
    setting: "A business-park office/flex building near downtown that bridges Sunnyvale's walkable core and its practical office/R&D corridors.",
    location: "640 W California Ave sits west of the downtown core near Mary Avenue and Caltrain access.",
    best_for: ["Office/flex users", "Operations teams", "Businesses needing downtown-adjacent Sunnyvale access"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "400 W California Ave",
    city: "Sunnyvale",
    district: downtownSunnyvale,
    role: "West California Avenue office / flex building",
    setting: "A downtown-adjacent office/flex building that shows the smaller business-park format around Sunnyvale's core.",
    location: "400 W California Ave sits near downtown Sunnyvale, Caltrain, and the Mary Avenue side of the market.",
    best_for: ["Office/flex users", "Small technology teams", "Businesses comparing downtown and Peery Park options"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "260 S Sunnyvale Ave",
    city: "Sunnyvale",
    district: downtownSunnyvale,
    role: "Sunnyvale Avenue local office building",
    setting: "A smaller downtown building that reflects Sunnyvale's local office and service-commercial base near the traditional downtown grid.",
    location: "260 S Sunnyvale Ave sits close to Murphy Avenue, El Camino Real, and the downtown Sunnyvale core.",
    best_for: ["Small office users", "Local service businesses", "Professional-service teams"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "100 S Murphy Ave",
    city: "Sunnyvale",
    district: downtownSunnyvale,
    role: "Murphy Avenue downtown commercial building",
    setting: "A Murphy Avenue commercial building that captures the walkable, restaurant-adjacent side of Downtown Sunnyvale's office and service environment.",
    location: "100 S Murphy Ave sits in the heart of Downtown Sunnyvale near Caltrain and CityLine.",
    best_for: ["Small office users", "Client-facing firms", "Businesses wanting main-street Sunnyvale context"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "650 Vaqueros Ave",
    city: "Sunnyvale",
    district: peeryPark,
    role: "Peery Park R&D / office building",
    setting: "A Peery Park building that reflects the district's engineering, R&D, and office/flex character west of Downtown Sunnyvale.",
    location: "650 Vaqueros Ave sits in Peery Park near Maude Avenue, Mathilda Avenue, and Sunnyvale's central office/R&D corridors.",
    best_for: ["Engineering teams", "R&D users", "Companies comparing Peery Park with Moffett Park"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "525 Almanor Ave",
    city: "Sunnyvale",
    district: peeryPark,
    role: "Peery Park office / R&D building",
    setting: "A larger Peery Park office/R&D building that gives tenants a concrete reference for the district's technical workspace base.",
    location: "525 Almanor Ave sits near Maude Avenue, Mathilda Avenue, and Sunnyvale's business-park corridors.",
    best_for: ["Technology office users", "R&D teams", "Companies needing Sunnyvale business-park context"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "380 N Pastoria Ave",
    city: "Sunnyvale",
    district: peeryPark,
    role: "Pastoria Avenue R&D / flex building",
    setting: "A Pastoria Avenue building that shows Peery Park's blend of older R&D, flex, and technology-support space.",
    location: "380 N Pastoria Ave sits near Maude Avenue and the central Peery Park commercial grid.",
    best_for: ["R&D users", "Hardware and engineering teams", "Tenants comparing Peery Park with North Sunnyvale"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "678 W Maude Ave",
    city: "Sunnyvale",
    district: peeryPark,
    role: "Maude Avenue flex building",
    setting: "A Maude Avenue flex building that captures the practical office/R&D formats tenants evaluate in Peery Park.",
    location: "678 W Maude Ave sits in the Peery Park area west of Mathilda Avenue.",
    best_for: ["Flex users", "Engineering teams", "Businesses needing central Sunnyvale access"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "676 W Maude Ave",
    city: "Sunnyvale",
    district: peeryPark,
    role: "Maude Avenue office / flex building",
    setting: "A smaller Maude Avenue office/flex building that rounds out Peery Park's multi-tenant R&D and business-park character.",
    location: "676 W Maude Ave sits near other Peery Park office and R&D buildings west of Downtown Sunnyvale.",
    best_for: ["Small technology teams", "Office/flex users", "Companies comparing downtown and business-park settings"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "333 W Maude Ave",
    city: "Sunnyvale",
    district: peeryPark,
    role: "Maude Avenue R&D building",
    setting: "A Maude Avenue R&D building that helps explain Peery Park as a practical engineering district rather than a walkable downtown office location.",
    location: "333 W Maude Ave sits near Mathilda Avenue and Sunnyvale's central business corridors.",
    best_for: ["R&D users", "Engineering teams", "Businesses needing Sunnyvale talent access"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "730 N Pastoria Ave",
    city: "Sunnyvale",
    district: peeryPark,
    role: "Pastoria Avenue flex building",
    setting: "A Pastoria Avenue flex building that reflects Peery Park's smaller multi-tenant technical workspace inventory.",
    location: "730 N Pastoria Ave sits near Maude Avenue, Almanor Avenue, and Peery Park's office/R&D cluster.",
    best_for: ["Flex tenants", "Small engineering teams", "R&D support users"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "965 W Maude Ave",
    city: "Sunnyvale",
    district: peeryPark,
    role: "West Maude Avenue R&D / flex building",
    setting: "A west-side Peery Park building that shows the district's practical office/flex and R&D geography near Sunnyvale's central corridors.",
    location: "965 W Maude Ave sits near Peery Park's western edge with access toward Mathilda Avenue, Mary Avenue, and Highway 237.",
    best_for: ["Office/flex users", "R&D teams", "Companies comparing Peery Park and Moffett Park"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "333 Ravenswood Ave",
    city: "Menlo Park",
    district: menloParkCommercialCore,
    role: "Ravenswood Avenue office building",
    setting: "A Menlo Park office building that reflects the city's professional-service and institutional-adjacent commercial core.",
    location: "333 Ravenswood Ave sits near El Camino Real, Santa Cruz Avenue, Caltrain, and the downtown Menlo Park business district.",
    best_for: ["Professional-service users", "Medical and institutional-adjacent teams", "Companies comparing Menlo Park with Palo Alto"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "932 Santa Cruz Ave",
    city: "Menlo Park",
    district: menloParkCommercialCore,
    role: "Santa Cruz Avenue office building",
    setting: "A Santa Cruz Avenue office building for tenants that want Menlo Park's walkable downtown character and Peninsula client access.",
    location: "932 Santa Cruz Ave sits in Menlo Park's downtown commercial corridor near Caltrain and El Camino Real.",
    best_for: ["Professional-service firms", "Small office users", "Client-facing Peninsula businesses"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "845 Santa Cruz Ave",
    city: "Menlo Park",
    district: menloParkCommercialCore,
    role: "Santa Cruz Avenue commercial building",
    setting: "A downtown Menlo Park commercial building that captures the smaller, client-facing office and service environment around Santa Cruz Avenue.",
    location: "845 Santa Cruz Ave sits in the downtown Menlo Park core near restaurants, services, Caltrain, and El Camino Real.",
    best_for: ["Small office users", "Professional-service teams", "Businesses needing downtown Menlo Park identity"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "1258 El Camino Real",
    city: "Menlo Park",
    district: menloParkCommercialCore,
    role: "El Camino Real office building",
    setting: "An El Camino Real office building that gives tenants a practical Menlo Park address with strong north-south Peninsula access.",
    location: "1258 El Camino Real sits near downtown Menlo Park, Santa Cruz Avenue, and the Caltrain station.",
    best_for: ["Office users", "Professional services", "Teams comparing Menlo Park and Palo Alto"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "275 Middlefield Rd",
    city: "Menlo Park",
    district: menloParkCommercialCore,
    role: "Middlefield Road office / institutional building",
    setting: "A Middlefield Road office building that adds institutional and research-adjacent context to Menlo Park's commercial core.",
    location: "275 Middlefield Rd sits near SRI, Ravenswood Avenue, downtown Menlo Park, and Palo Alto access routes.",
    best_for: ["Office users", "Institutional-adjacent teams", "Companies comparing Menlo Park with Stanford Research Park"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "100 Middlefield Rd",
    city: "Menlo Park",
    district: menloParkCommercialCore,
    role: "Middlefield Road office building",
    setting: "A Menlo Park office building that links the downtown core with nearby research, institutional, and professional-service demand.",
    location: "100 Middlefield Rd sits near Ravenswood Avenue, Santa Cruz Avenue, SRI, and downtown Menlo Park.",
    best_for: ["Professional office users", "Research-adjacent teams", "Companies needing Menlo Park/Palo Alto access"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "1010 El Camino Real",
    city: "Menlo Park",
    district: menloParkCommercialCore,
    role: "El Camino Real office building",
    setting: "An El Camino Real office building that shows the corridor side of Menlo Park's commercial core, where office users value visibility and regional access.",
    location: "1010 El Camino Real sits close to Santa Cruz Avenue, Caltrain, and downtown Menlo Park.",
    best_for: ["Office users", "Client-facing firms", "Businesses comparing Menlo Park and Redwood City"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "611 Santa Cruz Ave",
    city: "Menlo Park",
    district: menloParkCommercialCore,
    role: "Santa Cruz Avenue smaller office building",
    setting: "A smaller downtown Menlo Park office building that fits the area's boutique professional-service and client-facing tenant base.",
    location: "611 Santa Cruz Ave sits in Menlo Park's walkable commercial core near Caltrain and El Camino Real.",
    best_for: ["Small office users", "Professional-service firms", "Boutique client-facing teams"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "2882 Sand Hill Rd",
    city: "Menlo Park",
    district: sandHillStanfordAdjacent,
    role: "Sand Hill Road office building",
    setting: "A Sand Hill Road office building that captures the district's venture, investment, and Stanford-adjacent business identity.",
    location: "2882 Sand Hill Rd sits on the Sand Hill corridor near Stanford, I-280, and the Palo Alto / Menlo Park office ecosystem.",
    best_for: ["Venture and investment firms", "Executive office users", "Companies needing Stanford-adjacent positioning"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "2400 Sand Hill Rd",
    city: "Menlo Park",
    district: sandHillStanfordAdjacent,
    role: "Sand Hill Road office building",
    setting: "A Sand Hill Road office building for tenants that prioritize prestige, Stanford adjacency, and a quieter campus-like office environment.",
    location: "2400 Sand Hill Rd sits near Stanford, I-280, and the western Menlo Park/Palo Alto office market.",
    best_for: ["Investment firms", "Technology executives", "Professional users needing Sand Hill identity"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "3000 Sand Hill Rd",
    city: "Menlo Park",
    district: sandHillStanfordAdjacent,
    role: "Sand Hill Circle office building",
    setting: "A Sand Hill office building that helps show the district's lower-density, institutional, and venture-oriented office character.",
    location: "3000 Sand Hill Rd sits near Stanford, I-280, and the western edge of Menlo Park's office market.",
    best_for: ["Venture and investment users", "Executive office teams", "Companies comparing Sand Hill with Downtown Palo Alto"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "2800 Sand Hill Rd",
    city: "Menlo Park",
    district: sandHillStanfordAdjacent,
    role: "Sand Hill Road professional office building",
    setting: "A professional office building on Sand Hill Road that gives tenants a concrete view of the corridor's private, campus-like office format.",
    location: "2800 Sand Hill Rd sits near Stanford, I-280, and the broader Sand Hill venture office corridor.",
    best_for: ["Professional office users", "Investment firms", "Teams needing Stanford-adjacent access"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "2440 Sand Hill Rd",
    city: "Menlo Park",
    district: sandHillStanfordAdjacent,
    role: "Sand Hill Road office building",
    setting: "A Sand Hill Road office building that supports the district's reputation for venture, advisory, and executive office uses.",
    location: "2440 Sand Hill Rd sits along the corridor connecting Stanford, Menlo Park, Palo Alto, and I-280.",
    best_for: ["Venture firms", "Advisory businesses", "Executive office users"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "2765 Sand Hill Rd",
    city: "Menlo Park",
    district: sandHillStanfordAdjacent,
    role: "Sand Hill Road office building",
    setting: "A Sand Hill office building that reinforces the corridor's lower-density business setting and Stanford-adjacent identity.",
    location: "2765 Sand Hill Rd sits near Stanford and the I-280 side of the Menlo Park/Palo Alto office market.",
    best_for: ["Professional office users", "Investment teams", "Companies prioritizing Sand Hill Road identity"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "3065 Richmond Pky",
    city: "Richmond",
    district: richmondIndustrial,
    role: "Richmond Parkway industrial building",
    setting:
      "A straightforward warehouse and service-industrial address in the Richmond Parkway corridor, useful for tenants comparing Richmond's larger-format industrial options with San Leandro or Oakland.",
    location:
      "3065 Richmond Pky sits in Richmond's north-side industrial corridor, with practical access back toward I-80, I-580, and Richmond's port-oriented business base.",
    best_for: ["Warehouse users", "Service-industrial businesses", "Tenants comparing East Bay logistics corridors"],
  }),
  representativeBuilding({
    address: "3033 Richmond Pky",
    city: "Richmond",
    district: richmondIndustrial,
    role: "Richmond Parkway flex / industrial building",
    setting:
      "A practical industrial building that helps show how Richmond Parkway serves warehouse, service, and contractor users outside the denser Oakland and Emeryville districts.",
    location:
      "3033 Richmond Pky is part of the Richmond Parkway commercial environment north of central Richmond and the Inner Harbor.",
    best_for: ["Flex users", "Light industrial tenants", "Local distribution businesses"],
  }),
  representativeBuilding({
    address: "3095 Richmond Pky",
    city: "Richmond",
    district: richmondIndustrial,
    role: "Richmond Parkway warehouse building",
    setting:
      "A warehouse-oriented building in Richmond's north-side industrial market, where businesses often prioritize truck access, operating space, and regional roadway connections.",
    location:
      "3095 Richmond Pky sits near other Richmond Parkway industrial buildings serving local and regional operators.",
    best_for: ["Warehouse users", "Industrial service businesses", "Tenants needing Richmond Parkway access"],
  }),
  representativeBuilding({
    address: "1150 Hensley St",
    city: "Richmond",
    district: richmondIndustrial,
    role: "central Richmond industrial building",
    setting:
      "A central Richmond industrial building that reflects the older production, service, and warehouse blocks near the city's Inner Harbor access routes.",
    location:
      "1150 Hensley St sits in Richmond's central industrial grid, close to routes connecting I-580, I-80, and waterfront commercial areas.",
    best_for: ["Service-industrial users", "Small warehouse tenants", "Businesses needing central Richmond access"],
  }),
  representativeBuilding({
    address: "1069 Hensley St",
    city: "Richmond",
    district: richmondIndustrial,
    role: "Hensley Street industrial building",
    setting:
      "A smaller industrial building in central Richmond, useful for tenants looking at contractor, production, and service-commercial space near the Inner Harbor side of the city.",
    location:
      "1069 Hensley St is close to central Richmond industrial blocks and the east-west routes leading toward I-580 and the waterfront.",
    best_for: ["Contractor businesses", "Light industrial users", "Tenants comparing Richmond industrial subareas"],
  }),
  representativeBuilding({
    address: "211 W Cutting Blvd",
    city: "Richmond",
    district: richmondIndustrial,
    role: "Cutting Boulevard industrial building",
    setting:
      "A Richmond industrial building on a corridor that connects central Richmond with waterfront, port-adjacent, and Point Richmond commercial areas.",
    location:
      "211 W Cutting Blvd sits west of central Richmond, near routes leading to Canal Boulevard, I-580, and the Inner Harbor.",
    best_for: ["Industrial service users", "Warehouse-adjacent businesses", "Tenants needing Richmond waterfront access"],
  }),
  representativeBuilding({
    address: "1 Barrett Ave",
    city: "Richmond",
    district: richmondIndustrial,
    role: "Barrett Avenue flex / industrial building",
    setting:
      "A smaller-scale flex and industrial building that shows Richmond's central commercial grid, not just its larger Parkway and port-adjacent facilities.",
    location:
      "1 Barrett Ave sits near central Richmond and the access routes that connect toward Point Richmond, I-580, and the Inner Harbor.",
    best_for: ["Flex users", "Small industrial businesses", "Service companies needing central Richmond access"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "5215 Central Ave",
    city: "Richmond",
    district: richmondIndustrial,
    role: "Central Avenue industrial / flex building",
    setting:
      "A southern Richmond flex/industrial building that helps tenants compare Richmond with West Berkeley and Emeryville along the I-80 edge.",
    location:
      "5215 Central Ave sits near I-80 and the transition between Richmond, Berkeley, and Emeryville commercial geography.",
    best_for: ["Flex and industrial users", "East Bay service businesses", "Tenants comparing Richmond with West Berkeley"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "4911 Central Ave",
    city: "Richmond",
    district: richmondIndustrial,
    role: "Central Avenue industrial building",
    setting:
      "A southern Richmond industrial building that rounds out the district beyond the port and Richmond Parkway corridors.",
    location:
      "4911 Central Ave sits near Richmond's southern I-80 access and the industrial/flex geography continuing into West Berkeley and Emeryville.",
    best_for: ["Light industrial users", "Flex businesses", "Tenants comparing Richmond, Berkeley, and Emeryville"],
  }),
  representativeBuilding({
    address: "1400 Harbour Way S",
    city: "Richmond",
    district: pointRichmondMarinaBay,
    role: "waterfront flex / commercial building",
    setting:
      "A Ford Point waterfront building that captures the district's adaptive office, flex, production-adjacent, and R&D-support character near the bay.",
    location:
      "1400 Harbour Way S sits on Richmond's southern waterfront near Marina Bay, Canal Boulevard, and the Inner Harbor.",
    best_for: ["Creative office users", "R&D and production-adjacent teams", "Businesses wanting a waterfront East Bay setting"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "1200 Harbour Way S",
    city: "Richmond",
    district: pointRichmondMarinaBay,
    role: "Harbour Way waterfront flex building",
    setting:
      "A waterfront flex building that helps distinguish Point Richmond / Marina Bay from inland Richmond industrial corridors.",
    location:
      "1200 Harbour Way S sits near Ford Point, Marina Bay, and Canal Boulevard in Richmond's waterfront business cluster.",
    best_for: ["Flex users", "Waterfront office teams", "Companies comparing Point Richmond with Emeryville"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "1050-1090 Marina Way S",
    city: "Richmond",
    district: pointRichmondMarinaBay,
    role: "Marina Way commercial / flex building",
    setting:
      "A Marina Bay building that shows the district's mix of office, flex, and service-commercial space near Richmond's waterfront.",
    location:
      "1050-1090 Marina Way S sits near Harbour Way, Regatta Boulevard, and Canal Boulevard.",
    best_for: ["Small office users", "Flex tenants", "Service-commercial businesses"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "1121 Regatta Blvd",
    city: "Richmond",
    district: pointRichmondMarinaBay,
    role: "Marina Bay business-park building",
    setting:
      "A business-park building that gives Point Richmond / Marina Bay a more planned office/flex feel than Richmond's heavier industrial corridors.",
    location:
      "1121 Regatta Blvd sits near Marina Bay, Harbour Way, and Richmond's southern waterfront office/flex environment.",
    best_for: ["Office/flex users", "Professional-service teams", "Companies wanting waterfront East Bay context"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "1001 Canal Blvd",
    city: "Richmond",
    district: pointRichmondMarinaBay,
    role: "Canal Boulevard industrial building",
    setting:
      "A practical industrial building near the Point Richmond and Marina Bay corridors, useful for tenants comparing waterfront and port-adjacent Richmond locations.",
    location:
      "1001 Canal Blvd sits near Point Richmond, the Inner Harbor, and the routes connecting Marina Bay to I-580.",
    best_for: ["Industrial and flex users", "Waterfront service businesses", "Tenants needing Richmond bay access"],
  }),
  representativeBuilding({
    address: "100-104 Washington Ave",
    city: "Richmond",
    district: pointRichmondMarinaBay,
    role: "Point Richmond smaller-scale commercial building",
    setting:
      "A smaller commercial building that adds local Point Richmond texture alongside the district's larger waterfront flex and industrial addresses.",
    location:
      "100-104 Washington Ave sits in Point Richmond, close to Canal Boulevard, Marina Bay, and the Inner Harbor access routes.",
    best_for: ["Small office users", "Local service businesses", "Tenants wanting a smaller Point Richmond setting"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "830 Marina Way S",
    city: "Richmond",
    district: pointRichmondMarinaBay,
    role: "Marina Way industrial / flex building",
    setting:
      "An industrial/flex building that reinforces Marina Bay's practical waterfront business character rather than a purely office or retail identity.",
    location:
      "830 Marina Way S sits near Richmond's southern waterfront and the Marina Bay business environment.",
    best_for: ["Flex users", "Light industrial businesses", "Tenants comparing Richmond waterfront and inland industrial areas"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "2400 Teagarden St",
    city: "San Leandro",
    district: sanLeandroIndustrial,
    role: "Teagarden Street industrial building",
    setting:
      "A warehouse and service-industrial building that reflects San Leandro's I-880 and airport-adjacent industrial base.",
    location:
      "2400 Teagarden St sits near San Leandro's warehouse and business-park corridors with access toward I-880, Doolittle Drive, and Oakland Airport.",
    best_for: ["Warehouse users", "Service-industrial businesses", "Tenants comparing San Leandro with Oakland airport-area corridors"],
  }),
  representativeBuilding({
    address: "2010 Williams St",
    city: "San Leandro",
    district: sanLeandroIndustrial,
    role: "Williams Street industrial building",
    setting:
      "A larger industrial building that helps show the scale of San Leandro's west-side production, storage, and distribution corridors.",
    location:
      "2010 Williams St sits near other San Leandro industrial buildings west of the downtown core and close to regional freight routes.",
    best_for: ["Industrial users", "Manufacturing and service businesses", "Companies needing I-880 access"],
  }),
  representativeBuilding({
    address: "1670 Alvarado St",
    city: "San Leandro",
    district: sanLeandroIndustrial,
    role: "Alvarado Street business-park building",
    setting:
      "A business-park building that fits San Leandro's mix of light industrial, service, and flex users near I-880.",
    location:
      "1670 Alvarado St sits near the Alvarado and Davis Street commercial environment west of downtown San Leandro.",
    best_for: ["Flex users", "Light industrial tenants", "Service businesses comparing East Bay airport-area options"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "3018 Alvarado St",
    city: "San Leandro",
    district: sanLeandroIndustrial,
    role: "Alvarado Business Center flex building",
    setting:
      "A multi-tenant flex and industrial building that shows the smaller-user side of San Leandro's business-park inventory.",
    location:
      "3018 Alvarado St sits in San Leandro's Alvarado corridor, near Davis Street, Merced Street, and I-880 access.",
    best_for: ["Small industrial users", "Flex tenants", "Companies needing functional East Bay space"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "321 Davis St",
    city: "San Leandro",
    district: sanLeandroIndustrial,
    role: "Davis Street industrial / flex building",
    setting:
      "A flex-oriented building on Davis Street, where San Leandro blends industrial users with office and service-commercial activity.",
    location:
      "321 Davis St sits near central San Leandro and the west-side industrial corridors that feed toward I-880 and Doolittle Drive.",
    best_for: ["Flex users", "Service-commercial businesses", "Tenants needing San Leandro corridor access"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "500 Davis St",
    city: "San Leandro",
    district: sanLeandroIndustrial,
    role: "Davis Street office / business-park building",
    setting:
      "An office/business-park building that shows San Leandro Industrial is not only warehouse space; it also serves operations, support, and professional-service users.",
    location:
      "500 Davis St sits along the Davis Street commercial corridor, close to central San Leandro and west-side industrial routes.",
    best_for: ["Professional-service users", "Operations teams needing office near industrial corridors", "Companies comparing San Leandro and Hegenberger"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "2091 Williams St",
    city: "San Leandro",
    district: sanLeandroIndustrial,
    role: "Williams Street industrial building",
    setting:
      "A production and warehouse-oriented building that adds depth to San Leandro's west-side industrial corridor.",
    location:
      "2091 Williams St sits among industrial buildings with access toward I-880, Doolittle Drive, and Oakland Airport.",
    best_for: ["Manufacturing and service users", "Warehouse tenants", "Industrial businesses comparing I-880 corridors"],
  }),
  representativeBuilding({
    address: "2700 Merced St",
    city: "San Leandro",
    district: sanLeandroIndustrial,
    role: "Merced Street industrial building",
    setting:
      "A west-side industrial building that helps explain San Leandro's depth for local distribution, service, and warehouse users.",
    location:
      "2700 Merced St sits near Alvarado Street, Williams Street, and I-880 access in San Leandro's industrial district.",
    best_for: ["Warehouse users", "Service-industrial tenants", "Businesses needing I-880 and airport-area access"],
  }),
  representativeBuilding({
    address: "433 Hegenberger Rd",
    city: "Oakland",
    district: hegenbergerCorridor,
    role: "Hegenberger Road office / service-commercial building",
    setting:
      "An airport-area building that helps show Hegenberger's mix of office, service, hotel-adjacent, and logistics-adjacent uses.",
    location:
      "433 Hegenberger Rd sits near the Hegenberger Road and airport-access spine, close to Edgewater Drive and the Coliseum industrial area.",
    best_for: ["Airport-adjacent office users", "Service-commercial teams", "Businesses comparing Hegenberger with San Leandro"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "333 Hegenberger Rd",
    city: "Oakland",
    district: hegenbergerCorridor,
    role: "Hegenberger Road office building",
    setting:
      "A familiar airport-area office building for tenants that want Hegenberger access rather than a downtown Oakland setting.",
    location:
      "333 Hegenberger Rd sits along Hegenberger Road near Oakland Airport, I-880, and the Edgewater business environment.",
    best_for: ["Professional-service users", "Airport-oriented businesses", "Teams comparing office and industrial-adjacent locations"],
    type: "Office Space",
    primary_space_type: "office",
  }),
  representativeBuilding({
    address: "303 Hegenberger Rd",
    city: "Oakland",
    district: hegenbergerCorridor,
    role: "Hegenberger Road office / flex building",
    setting:
      "An office/flex building that fits the corridor's practical airport-area mix of service, office, and light industrial users.",
    location:
      "303 Hegenberger Rd sits near the core Hegenberger Road business strip, close to airport hotels, service businesses, and industrial corridors.",
    best_for: ["Office/flex users", "Airport-area service teams", "Businesses comparing Hegenberger and Coliseum Industrial"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "675 Hegenberger Rd",
    city: "Oakland",
    district: hegenbergerCorridor,
    role: "Hegenberger corridor commercial building",
    setting:
      "A service-commercial and office/flex building on the airport approach side of Hegenberger Road.",
    location:
      "675 Hegenberger Rd sits south of the core Hegenberger business strip, close to airport access and nearby industrial buildings.",
    best_for: ["Service-commercial users", "Office/flex tenants", "Airport-adjacent businesses"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "8000 Edgewater Dr",
    city: "Oakland",
    district: hegenbergerCorridor,
    role: "Edgewater Drive business-park building",
    setting:
      "A business-park building that adds the Edgewater Drive side of the airport-area market to Hegenberger's office and service-commercial context.",
    location:
      "8000 Edgewater Dr sits near Oakland Airport, I-880, and the Edgewater/Oakport business environment.",
    best_for: ["Business-park users", "Office/flex teams", "Companies needing Oakland Airport access"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "8301 Edgewater Dr",
    city: "Oakland",
    district: hegenbergerCorridor,
    role: "Edgewater Drive flex building",
    setting:
      "A flex building that rounds out Hegenberger with practical airport-area business-park space close to I-880.",
    location:
      "8301 Edgewater Dr sits near Hegenberger Road, Oakport Street, and the airport-facing side of East Oakland.",
    best_for: ["Flex users", "Airport-area service businesses", "Operations teams comparing Oakland and San Leandro"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "7303 Edgewater Dr",
    city: "Oakland",
    district: coliseumIndustrial,
    role: "Edgewater Drive industrial building",
    setting:
      "A warehouse and industrial building that shows the larger business-park side of Coliseum Industrial near I-880 and Oakland Airport.",
    location:
      "7303 Edgewater Dr sits near Oakport Street, Hegenberger Road, and the broader Coliseum industrial market.",
    best_for: ["Warehouse and distribution users", "Industrial service businesses", "Tenants comparing Coliseum and Hegenberger"],
  }),
  representativeBuilding({
    address: "7307 Edgewater Dr",
    city: "Oakland",
    district: coliseumIndustrial,
    role: "Edgewater Drive industrial / flex building",
    setting:
      "An industrial/flex building useful for tenants evaluating functional space near the airport, Coliseum, I-880, and Oakland's port-connected network.",
    location:
      "7307 Edgewater Dr sits in the Edgewater corridor close to Oakport Street, Hegenberger Road, and Oakland Airport.",
    best_for: ["Industrial/flex users", "Logistics-adjacent businesses", "Tenants needing East Oakland access"],
  }),
  representativeBuilding({
    address: "7677 Oakport St",
    city: "Oakland",
    district: coliseumIndustrial,
    role: "Oakport Street business-park building",
    setting:
      "A business-park building that gives Coliseum Industrial a more organized office/flex reference point alongside warehouse and service-industrial addresses.",
    location:
      "7677 Oakport St sits near Edgewater Drive, Hegenberger Road, and I-880 in East Oakland's airport-area commercial market.",
    best_for: ["Business-park users", "Office/flex teams", "Companies needing airport-area access"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "8105 Edgewater Dr",
    city: "Oakland",
    district: coliseumIndustrial,
    role: "Edgewater Drive warehouse / flex building",
    setting:
      "A warehouse/flex building that helps explain why tenants compare Coliseum Industrial with Hegenberger and San Leandro.",
    location:
      "8105 Edgewater Dr sits in the Edgewater corridor near Oakport Street, Hegenberger Road, and Oakland Airport.",
    best_for: ["Warehouse users", "Flex tenants", "Businesses needing East Oakland logistics access"],
  }),
  representativeBuilding({
    address: "8501 San Leandro St",
    city: "Oakland",
    district: coliseumIndustrial,
    role: "San Leandro Street industrial building",
    setting:
      "An industrial building on one of East Oakland's core production and warehouse corridors, useful for tenants comparing Coliseum Industrial with San Leandro.",
    location:
      "8501 San Leandro St sits near the Coliseum industrial grid, I-880 access, and the airport-area logistics corridors.",
    best_for: ["Industrial users", "Service businesses", "Tenants needing East Oakland access"],
  }),
  representativeBuilding({
    address: "5601 San Leandro St",
    city: "Oakland",
    district: coliseumIndustrial,
    role: "San Leandro Street industrial building",
    setting:
      "A lower-scale industrial building that reflects the older production and warehouse character along San Leandro Street.",
    location:
      "5601 San Leandro St sits in the Coliseum industrial corridor between East Oakland's rail, freeway, and airport-area commercial routes.",
    best_for: ["Warehouse users", "Production-adjacent tenants", "Service-industrial businesses"],
  }),
  representativeBuilding({
    address: "6195 Coliseum Way",
    city: "Oakland",
    district: coliseumIndustrial,
    role: "Coliseum Way industrial-park building",
    setting:
      "An industrial-park building that gives tenants a clear sense of the district's multi-tenant warehouse and flex formats.",
    location:
      "6195 Coliseum Way sits near San Leandro Street, I-880, and the Coliseum side of East Oakland's industrial market.",
    best_for: ["Industrial-park users", "Warehouse tenants", "Businesses comparing Coliseum and Hegenberger"],
  }),
  representativeBuilding({
    address: "7001 San Leandro St",
    city: "Oakland",
    district: coliseumIndustrial,
    role: "San Leandro Street warehouse building",
    setting:
      "A warehouse building that helps show the depth of industrial inventory along San Leandro Street near the Coliseum.",
    location:
      "7001 San Leandro St sits in East Oakland's industrial corridor with access toward I-880, Hegenberger Road, and San Leandro.",
    best_for: ["Warehouse users", "Light industrial tenants", "Businesses needing East Oakland corridor access"],
  }),
  representativeBuilding({
    address: "745 85th Ave",
    city: "Oakland",
    district: coliseumIndustrial,
    role: "85th Avenue industrial building",
    setting:
      "An East Oakland industrial building that adds another practical warehouse and service-commercial reference point near the Coliseum area.",
    location:
      "745 85th Ave sits near San Leandro Street, International Boulevard, and I-880 access in the broader Coliseum industrial market.",
    best_for: ["Warehouse tenants", "Service-industrial users", "Businesses comparing East Oakland and San Leandro"],
  }),
  representativeBuilding({
    address: "610 85th Ave",
    city: "Oakland",
    district: coliseumIndustrial,
    role: "85th Avenue warehouse building",
    setting:
      "A warehouse building that reinforces the district's functional industrial character for users needing space near I-880 and Oakland Airport.",
    location:
      "610 85th Ave sits in East Oakland's Coliseum industrial area near San Leandro Street and the airport-area corridors.",
    best_for: ["Warehouse users", "Distribution-adjacent businesses", "Industrial tenants needing I-880 access"],
  }),
  representativeBuilding({
    address: "1400 Mandela Pkwy",
    city: "Oakland",
    district: westOakland,
    role: "Mandela Parkway industrial / flex building",
    setting:
      "A West Oakland industrial/flex building on the Mandela Parkway corridor, where service, production, and port-adjacent users mix with creative commercial activity.",
    location:
      "1400 Mandela Pkwy sits near West Oakland's freeway, rail, and port-adjacent commercial routes.",
    best_for: ["Flex users", "Service-industrial businesses", "Tenants comparing West Oakland with Emeryville"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "2201 Poplar St",
    city: "Oakland",
    district: westOakland,
    role: "West Oakland industrial building",
    setting:
      "A West Oakland industrial building that reflects the area's practical warehouse, production, and service-commercial character.",
    location:
      "2201 Poplar St sits near Mandela Parkway, West Grand Avenue, and the routes connecting West Oakland with the Port of Oakland and Emeryville.",
    best_for: ["Industrial users", "Production-adjacent tenants", "Businesses needing West Oakland access"],
  }),
  representativeBuilding({
    address: "2921 Adeline St",
    city: "Oakland",
    district: westOakland,
    role: "Adeline Street industrial / flex building",
    setting:
      "A flex and industrial building that helps show the smaller-format commercial spaces tenants can find around West Oakland and the Emeryville edge.",
    location:
      "2921 Adeline St sits near the West Oakland and Emeryville transition, with access to Mandela Parkway and I-880/I-580 connections.",
    best_for: ["Flex users", "Small industrial tenants", "Companies comparing West Oakland and Emeryville"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "2855 Mandela Pkwy",
    city: "Oakland",
    district: westOakland,
    role: "Mandela Parkway flex building",
    setting:
      "A Mandela Parkway flex building that captures West Oakland's mix of production, service, and creative commercial users.",
    location:
      "2855 Mandela Pkwy sits near the north side of West Oakland, close to Emeryville and the regional freeway network.",
    best_for: ["Flex tenants", "Creative production users", "Businesses needing West Oakland/Emeryville access"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  representativeBuilding({
    address: "1500 Mandela Pkwy",
    city: "Oakland",
    district: westOakland,
    role: "Mandela Parkway industrial building",
    setting:
      "An industrial building on Mandela Parkway that gives tenants a concrete view of West Oakland's port-adjacent service and production geography.",
    location:
      "1500 Mandela Pkwy sits near West Oakland's rail, freeway, and port-oriented commercial routes.",
    best_for: ["Service-industrial users", "Warehouse-adjacent tenants", "Companies comparing West Oakland and Jack London Square"],
  }),
  representativeBuilding({
    address: "1320 Wood St",
    city: "Oakland",
    district: westOakland,
    role: "Wood Street smaller-scale industrial building",
    setting:
      "A smaller industrial building that shows West Oakland's gritty, practical commercial blocks away from the formal downtown office core.",
    location:
      "1320 Wood St sits near West Oakland's rail and port-adjacent corridors, with access back toward Mandela Parkway and I-880.",
    best_for: ["Small industrial tenants", "Service businesses", "Production-adjacent users"],
  }),
  representativeBuilding({
    address: "2400 Filbert St",
    city: "Oakland",
    district: westOakland,
    role: "Filbert Street industrial / flex building",
    setting:
      "A West Oakland industrial/flex building that rounds out the district's mix of service, production, and smaller commercial spaces.",
    location:
      "2400 Filbert St sits near West Oakland's north-side commercial blocks, close to Mandela Parkway and Emeryville access.",
    best_for: ["Flex users", "Service-industrial tenants", "Businesses comparing West Oakland with Emeryville"],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  building({
    address: "1195 Borregas Ave",
    city: "Sunnyvale",
    district: moffettPark,
    role: "Borregas Avenue R&D / office building",
    description:
      "1195 Borregas Ave is a Moffett Park R&D/office building in Sunnyvale's north-side business-park environment.",
    about:
      "The building fits the kind of technical-user space tenants evaluate in Moffett Park: practical office/R&D buildings near 237, 101, and the broader Sunnyvale-Mountain View innovation corridor.",
    location:
      "1195 Borregas Ave sits in the Borregas Avenue side of Moffett Park, close to other North Sunnyvale office, R&D, and campus-oriented buildings.",
    best_for: [
      "Engineering and R&D teams",
      "Office users comparing Moffett Park with North Bayshore",
      "Businesses that want a North Sunnyvale business-park setting",
    ],
    type: "Flex Space",
    primary_space_type: "flex",
  }),
  building({
    address: "6425 Christie Ave",
    city: "Emeryville",
    district: emeryville,
    role: "Christie Avenue office / R&D corridor",
    description:
      "6425 Christie Ave is an Emeryville office/R&D-support building in the district's East Bay business corridor.",
    about:
      "Raw building and listing data show repeated activity at this Christie Avenue address. The building fits Emeryville's practical office and research-adjacent market between Berkeley, Oakland, and the Bay Bridge.",
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
      "2200 Powell St is an Emeryville office building in the district's Powell Street business corridor.",
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
      "2100 Powell St is an Emeryville office building in the larger Powell Street business-park environment.",
    about:
      "The building gives tenants a concrete feel for Emeryville's more structured office geography compared with Downtown Berkeley's university setting or West Berkeley's maker/flex corridors.",
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
      "The address sits in Emeryville's blend of office, retail support, and larger commercial blocks around Shellmound and Bay Street.",
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
      "The raw data shows repeated commercial activity at this address, making it a practical office/flex building for understanding the Hollis corridor.",
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
      "The address adds a smaller-format commercial building alongside Emeryville's larger Powell Street office buildings.",
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
      "The building adds another Christie Avenue office building to one of Emeryville's strongest mixed-commercial corridors.",
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
      "The address reflects Emeryville's non-tower commercial mix: practical buildings for local operations, creative, and service users.",
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
      "The address adds creative and industrial-transition building context alongside the office-heavy Powell Street corridor.",
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
      "The building sits on Emeryville's northern office/flex edge, close to Berkeley and the broader East Bay innovation corridor.",
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
      "Raw building data shows substantial historical listing activity at this address, making it a strong Downtown Berkeley office building to surface publicly.",
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
      "The building fits the district's blend of office, service, and street-level commercial activity near transit and UC Berkeley.",
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
      "Center Street gives tenants a civic and institutional Downtown Berkeley setting, distinct from the industrial/flex identity of West Berkeley.",
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
      "The raw record identifies Constitution Square, making this a useful professional office building for Downtown Berkeley.",
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
      "The building sits near UC Berkeley, which can matter for organizations that value institutional adjacency.",
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
      "Raw building data shows strong listing activity at this address, making it a useful West Berkeley industrial/flex building to surface publicly.",
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
      "The raw record identifies the Saul Zaentz Media Center, a strong West Berkeley building for creative and production-adjacent users.",
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
      "The address sits on West Berkeley's corridor-based commercial edge near Emeryville and Oakland connections.",
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
      "The address appears repeatedly in raw building data and fits the district's technical and maker-oriented building mix.",
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
      "The address reinforces the Ninth Street cluster as a practical West Berkeley industrial/flex building.",
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
      "The address gives tenants a west-side industrial/flex building near I-80, Aquatic Park, and practical Berkeley access.",
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
      "Teams evaluating West Berkeley's practical buildings",
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
  sfDecisionBuilding({
    address: "600 Townsend St",
    district: soma,
    role: "Townsend corridor office reference",
    building_character: "Larger-block SoMa office context on the transition toward Mission Bay.",
    typical_tenant_profile: "Teams that want SoMa access while testing whether a southern edge location fits better than a core downtown block.",
    shortlist_reason:
      "Businesses include 600 Townsend St when they need to understand how SoMa changes south of the central office core and begins to share characteristics with Mission Bay and Showplace Square.",
    location:
      "600 Townsend St sits in the Townsend corridor, a practical edge condition between core SoMa, Mission Bay, and production-adjacent commercial areas.",
    strengths: [
      "Useful for comparing central SoMa with larger-block southern SoMa office settings.",
      "Helps businesses visualize the transition toward Mission Bay without leaving the San Francisco core.",
      "Works as a reference point for teams weighing central access against newer or more flexible building environments.",
    ],
    tradeoffs: [
      "May not provide the same boutique character as core SoMa blocks.",
      "May not carry the same institutional identity as core Mission Bay.",
      "The value depends on whether the business benefits from the district edge.",
    ],
    nearby_alternatives: [
      { label: "Mission Bay", url: "/commercial-real-estate/CA/san-francisco/mission-bay/" },
      { label: "Dogpatch", url: "/commercial-real-estate/CA/san-francisco/dogpatch/" },
    ],
    validation_questions: [
      "Does the Townsend corridor improve employee access or simply move the search away from core SoMa?",
      "Would Mission Bay provide stronger institutional adjacency for the same business need?",
      "Do nearby amenities and the immediate block support the team's daily routine?",
    ],
  }),
  sfDecisionBuilding({
    address: "99 Rhode Island St",
    district: missionBay,
    role: "Potrero / Mission Bay edge office",
    building_character: "Edge-condition office building that helps compare Mission Bay with Potrero and Showplace Square.",
    typical_tenant_profile: "Teams open to Mission Bay adjacency but not certain they need the district's core institutional setting.",
    shortlist_reason:
      "Businesses evaluate 99 Rhode Island St to test whether Mission Bay adjacency is enough, or whether the search should stay inside the district's core.",
    location:
      "99 Rhode Island St sits near the transition from Mission Bay toward Potrero Hill and Showplace Square, making it useful for comparing core and edge options.",
    strengths: [
      "Clarifies the difference between core Mission Bay and nearby adaptive-commercial alternatives.",
      "Gives growth-stage teams a practical way to compare institutional adjacency with flexibility.",
      "Supports conversations about commute routes, amenities, and district identity.",
    ],
    tradeoffs: [
      "The location may feel less clearly Mission Bay than addresses inside the core.",
      "Fit depends on whether adjacency matters more than district identity.",
      "Building-level condition and layout should be validated carefully.",
    ],
    nearby_alternatives: [
      { label: "Mission Bay", url: "/commercial-real-estate/CA/san-francisco/mission-bay/" },
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/" },
    ],
    validation_questions: [
      "Does Mission Bay adjacency deliver enough value for the business?",
      "Would core Mission Bay better support hiring, institutional relationships, or customer perception?",
      "Would SoMa or Showplace Square provide more flexibility?",
    ],
  }),
  sfDecisionBuilding({
    address: "54 Jeff Adachi Way",
    district: missionBay,
    role: "Mission Bay civic / mixed-use edge",
    building_character: "Newer Mission Bay commercial context near the district's mixed-use and waterfront-adjacent pattern.",
    typical_tenant_profile: "Teams comparing Mission Bay's planned environment with older San Francisco commercial districts.",
    shortlist_reason:
      "Businesses include 54 Jeff Adachi Way to understand Mission Bay as a newer, planned district rather than a traditional downtown office core.",
    location:
      "54 Jeff Adachi Way belongs to the Mission Bay commercial environment where office, institutional, residential, and waterfront movement overlap.",
    strengths: [
      "Helps explain Mission Bay's planned, mixed-use commercial rhythm.",
      "Useful for companies comparing newer district identity with historic office districts.",
      "Supports evaluation of modern building context and neighborhood growth pattern.",
    ],
    tradeoffs: [
      "May feel less traditional for firms needing a formal downtown address.",
      "Daily convenience depends on the specific commute, visitor, and amenity pattern.",
      "The newer environment may not fit businesses seeking older adaptive character.",
    ],
    nearby_alternatives: [
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/" },
      { label: "Dogpatch", url: "/commercial-real-estate/CA/san-francisco/dogpatch/" },
    ],
  }),
  sfDecisionBuilding({
    address: "1 Sansome St",
    district: financialDistrict,
    role: "Transit-served downtown office reference",
    building_character: "Formal downtown office building in San Francisco's client-facing business core.",
    typical_tenant_profile: "Finance, legal, consulting, executive, and professional-service users that value central access and office-core identity.",
    shortlist_reason:
      "Businesses include 1 Sansome St when the Financial District is being evaluated for transit access, professional services, and a conventional downtown office signal.",
    location:
      "1 Sansome St is useful as a Financial District reference point because it sits within the downtown office core rather than a boutique or adaptive-office district.",
    strengths: [
      "Strong reference for formal office identity and downtown client access.",
      "Clarifies the difference between CBD office towers and character-driven districts nearby.",
      "Useful for evaluating transit-oriented professional-service needs.",
    ],
    tradeoffs: [
      "Less adaptive character than SoMa.",
      "Less boutique neighborhood texture than Jackson Square.",
      "Operating cost, building services, and visitor experience need building-level validation.",
    ],
    nearby_alternatives: [
      { label: "Jackson Square", url: "/commercial-real-estate/CA/san-francisco/jackson-square/" },
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/" },
    ],
    validation_questions: [
      "Does a formal downtown address improve client confidence or recruiting?",
      "Would Jackson Square deliver enough downtown access with more character?",
      "Do operating costs and building services fit the business model?",
    ],
  }),
  sfDecisionBuilding({
    address: "44 Montgomery St",
    district: financialDistrict,
    role: "Vertical office tower reference",
    building_character: "Large-format downtown tower context for businesses comparing formal office scale.",
    typical_tenant_profile: "Larger professional, advisory, finance, legal, and client-facing office teams.",
    shortlist_reason:
      "Businesses evaluate 44 Montgomery St to understand the Financial District's vertical office format and how it differs from smaller nearby districts.",
    location:
      "44 Montgomery St belongs to the Montgomery Street office spine, where downtown access, business services, and conventional office identity matter.",
    strengths: [
      "Shows the scale and structure of the Financial District office core.",
      "Useful for companies that want a conventional downtown tower comparison.",
      "Frames questions about security, elevator access, floorplate fit, and client arrival.",
    ],
    tradeoffs: [
      "Can feel more corporate than Jackson Square or SoMa options.",
      "May offer less neighborhood texture than smaller-format buildings.",
      "The value depends on whether the company benefits from formal office positioning.",
    ],
    nearby_alternatives: [
      { label: "Jackson Square", url: "/commercial-real-estate/CA/san-francisco/jackson-square/" },
      { label: "Union Square", url: "/commercial-real-estate/CA/san-francisco/union-square/" },
    ],
  }),
  sfDecisionBuilding({
    address: "315 Montgomery St",
    district: financialDistrict,
    role: "Montgomery corridor professional office",
    building_character: "Downtown business-spine building for professional-service and advisory users.",
    typical_tenant_profile: "Professional-service firms that need centrality, business services, and a recognized downtown setting.",
    shortlist_reason:
      "Businesses include 315 Montgomery St when they need to compare the practical middle of the Financial District against more distinctive nearby environments.",
    location:
      "315 Montgomery St helps explain the concentration of office, client access, and business-service context along the Montgomery corridor.",
    strengths: [
      "Clear reference for client-facing downtown office users.",
      "Useful for comparing business-service density against neighborhood character.",
      "Supports questions about customer visits, employee commute, and address perception.",
    ],
    tradeoffs: [
      "Less distinctive for companies that need creative identity.",
      "Less institutional or life-science adjacent than Mission Bay.",
      "Downtown context may be unnecessary for businesses with few customer visits.",
    ],
    nearby_alternatives: [
      { label: "Jackson Square", url: "/commercial-real-estate/CA/san-francisco/jackson-square/" },
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/" },
    ],
  }),
  sfDecisionBuilding({
    address: "212 Sutter St",
    district: financialDistrict,
    role: "Smaller downtown office block",
    building_character: "Smaller downtown building that gives the Financial District more scale variety than only large towers.",
    typical_tenant_profile: "Boutique advisory, legal, finance, and professional-service teams that want downtown access without a full tower experience.",
    shortlist_reason:
      "Businesses include 212 Sutter St to test whether a smaller downtown setting can solve the same client-facing need as a larger Financial District tower.",
    location:
      "212 Sutter St is useful for comparing the Financial District's smaller office blocks with Jackson Square and Union Square edge conditions.",
    strengths: [
      "Shows that Financial District searches can include smaller-format office options.",
      "Useful for boutique firms that still need downtown client access.",
      "Supports evaluation of arrival experience, suite scale, and business services.",
    ],
    tradeoffs: [
      "Still carries downtown-core constraints rather than a neighborhood-office feel.",
      "May not offer the same character as Jackson Square.",
      "Suite fit and building services should be validated before treating it as a substitute for a tower.",
    ],
    nearby_alternatives: [
      { label: "Jackson Square", url: "/commercial-real-estate/CA/san-francisco/jackson-square/" },
      { label: "Union Square", url: "/commercial-real-estate/CA/san-francisco/union-square/" },
    ],
  }),
  sfDecisionBuilding({
    address: "325 Kearny St",
    district: financialDistrict,
    role: "Kearny Street downtown edge",
    building_character: "Downtown edge building that helps compare the Financial District with Union Square and Jackson Square.",
    typical_tenant_profile: "Client-facing teams that want downtown access but need to compare edge conditions carefully.",
    shortlist_reason:
      "Businesses include 325 Kearny St to understand how the Financial District changes near Kearny Street and neighboring commercial areas.",
    location:
      "325 Kearny St sits in a downtown edge context where Financial District, Union Square, and Jackson Square considerations can overlap.",
    strengths: [
      "Useful for evaluating downtown access without assuming a pure tower-core setting.",
      "Helps compare client arrival, nearby amenities, and district identity.",
      "Adds a practical edge example to the Financial District shortlist.",
    ],
    tradeoffs: [
      "The address may not read as strongly Financial District as Montgomery corridor buildings.",
      "The surrounding environment should be validated for client and employee perception.",
      "Nearby alternatives may solve the same need with clearer district identity.",
    ],
    nearby_alternatives: [
      { label: "Jackson Square", url: "/commercial-real-estate/CA/san-francisco/jackson-square/" },
      { label: "Union Square", url: "/commercial-real-estate/CA/san-francisco/union-square/" },
    ],
  }),
  sfDecisionBuilding({
    address: "333 Kearny St",
    district: financialDistrict,
    role: "Downtown edge office building",
    building_character: "Kearny corridor office context for businesses comparing formal downtown and nearby boutique districts.",
    typical_tenant_profile: "Small to mid-size professional teams that need downtown access and a more edge-oriented setting.",
    shortlist_reason:
      "Businesses include 333 Kearny St when they want to test whether a downtown edge address delivers enough Financial District benefit.",
    location:
      "333 Kearny St sits near the transition between Financial District office demand and nearby visitor-facing or boutique commercial areas.",
    strengths: [
      "Adds a practical comparison point for downtown-edge users.",
      "Useful for evaluating client access without defaulting to Montgomery Street.",
      "Helps frame the tradeoff between district identity and location flexibility.",
    ],
    tradeoffs: [
      "District identity may feel less clear than core Financial District or Jackson Square.",
      "The immediate block should be validated for visitor arrival and employee comfort.",
      "The building may not fit teams needing large modern floorplates.",
    ],
    nearby_alternatives: [
      { label: "Jackson Square", url: "/commercial-real-estate/CA/san-francisco/jackson-square/" },
      { label: "Union Square", url: "/commercial-real-estate/CA/san-francisco/union-square/" },
    ],
  }),
  sfDecisionBuilding({
    address: "75 Broadway",
    district: jacksonSquare,
    role: "Boutique downtown-edge office reference",
    building_character: "Smaller-format office context near Jackson Square's downtown and waterfront edge.",
    typical_tenant_profile: "Boutique professional-service, finance, design, and advisory firms.",
    shortlist_reason:
      "Businesses include 75 Broadway to compare Jackson Square's smaller, character-oriented office setting against the Financial District's formal core.",
    location:
      "75 Broadway helps explain Jackson Square as downtown-adjacent rather than detached from the business core.",
    strengths: [
      "Useful reference for firms that want client access without a tower-core feel.",
      "Shows how Jackson Square can serve relationship-driven and executive office users.",
      "Supports evaluation of walkability, arrival experience, and district image.",
    ],
    tradeoffs: [
      "Smaller scale can limit options for larger teams.",
      "Building condition and expansion flexibility need validation.",
      "Some clients may perceive the address differently than a formal Financial District tower.",
    ],
    nearby_alternatives: [
      { label: "Financial District", url: "/commercial-real-estate/CA/san-francisco/financial-district/" },
      { label: "North Beach", url: "/commercial-real-estate/CA/san-francisco/north-beach/" },
    ],
  }),
  sfDecisionBuilding({
    address: "924 Sansome St",
    district: jacksonSquare,
    role: "Historic commercial block",
    building_character: "Historic street-level commercial fabric that defines Jackson Square's character-rich office environment.",
    typical_tenant_profile: "Design-oriented firms, boutique offices, advisory teams, and client-facing small teams.",
    shortlist_reason:
      "Businesses include 924 Sansome St when character, walkability, and client impression matter as much as conventional office scale.",
    location:
      "924 Sansome St sits within Jackson Square's smaller-scale historic commercial blocks near the downtown edge.",
    strengths: [
      "Clearly illustrates Jackson Square's character-driven commercial identity.",
      "Useful for comparing historic texture against CBD tower efficiency.",
      "Supports conversations about image, client perception, and daily neighborhood experience.",
    ],
    tradeoffs: [
      "Historic texture can mean more variation in systems, layout, and accessibility.",
      "May be less flexible for larger or fast-growing teams.",
      "Transit and customer arrival should be compared with Financial District options.",
    ],
    nearby_alternatives: [
      { label: "Financial District", url: "/commercial-real-estate/CA/san-francisco/financial-district/" },
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/" },
    ],
  }),
  sfDecisionBuilding({
    address: "1100 Grant Ave",
    district: jacksonSquare,
    role: "Historic boutique office edge",
    building_character: "North Beach and Jackson Square edge building for firms comparing downtown adjacency with neighborhood character.",
    typical_tenant_profile: "Small professional-service, creative, and relationship-driven firms.",
    shortlist_reason:
      "Businesses include 1100 Grant Ave to test whether downtown adjacency and neighborhood character can coexist in the same search.",
    location:
      "1100 Grant Ave sits near the Jackson Square and North Beach transition, making it useful for evaluating edge geography.",
    strengths: [
      "Helps explain Jackson Square as an edge district rather than a single building type.",
      "Useful for teams that value character and client experience.",
      "Frames the tradeoff between stronger downtown transit concentration and neighborhood setting.",
    ],
    tradeoffs: [
      "May be less convenient for teams needing the strongest transit concentration.",
      "May not support large modern office requirements.",
      "Customer perception depends on whether the edge location feels connected enough to the business core.",
    ],
    nearby_alternatives: [
      { label: "Financial District", url: "/commercial-real-estate/CA/san-francisco/financial-district/" },
      { label: "Union Square", url: "/commercial-real-estate/CA/san-francisco/union-square/" },
    ],
  }),
  sfDecisionBuilding({
    address: "27 Drumm St",
    district: jacksonSquare,
    role: "Small-format downtown edge",
    building_character: "Small-format commercial setting between Jackson Square, the Embarcadero, and the Financial District.",
    typical_tenant_profile: "Client-facing teams that value downtown access with a smaller footprint.",
    shortlist_reason:
      "Businesses include 27 Drumm St to compare boutique downtown-edge settings with formal CBD space.",
    location:
      "27 Drumm St is useful because it sits in the transition between Jackson Square, the waterfront, and the Financial District.",
    strengths: [
      "Adds a compact building reference to the downtown-edge decision.",
      "Useful for testing whether the business needs Financial District formality.",
      "Helps compare customer arrival and address perception across adjacent districts.",
    ],
    tradeoffs: [
      "The district edge can feel less distinct than core Jackson Square.",
      "The building may not support larger growth plans.",
      "The address should be tested against customer and employee expectations.",
    ],
    nearby_alternatives: [
      { label: "Financial District", url: "/commercial-real-estate/CA/san-francisco/financial-district/" },
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/" },
    ],
  }),
  sfDecisionBuilding({
    address: "2 Embarcadero Ctr",
    district: jacksonSquare,
    role: "Embarcadero / downtown edge reference",
    building_character: "Downtown waterfront-edge office context that helps compare Jackson Square, Embarcadero, and Financial District positioning.",
    typical_tenant_profile: "Client-facing office users that value downtown access and waterfront-adjacent context.",
    shortlist_reason:
      "Businesses include 2 Embarcadero Ctr when they need to compare the formal downtown core with the waterfront-facing edge near Jackson Square.",
    location:
      "2 Embarcadero Ctr sits in a location where the Financial District, Jackson Square, and waterfront commercial identity overlap.",
    strengths: [
      "Useful for comparing formal downtown access with a more waterfront-adjacent setting.",
      "Helps frame customer arrival and executive-image questions.",
      "Adds a clear edge-condition example to the district comparison.",
    ],
    tradeoffs: [
      "May feel more like an Embarcadero or Financial District decision than core Jackson Square.",
      "The right fit depends on whether waterfront adjacency matters operationally.",
      "Teams should compare building scale and cost against smaller boutique options.",
    ],
    nearby_alternatives: [
      { label: "Financial District", url: "/commercial-real-estate/CA/san-francisco/financial-district/" },
      { label: "Jackson Square", url: "/commercial-real-estate/CA/san-francisco/jackson-square/" },
    ],
  }),
  sfDecisionBuilding({
    address: "33 Drumm St",
    district: jacksonSquare,
    role: "Downtown and waterfront transition",
    building_character: "Downtown-edge office context that helps businesses compare small-format and formal office environments.",
    typical_tenant_profile: "Professional teams evaluating downtown access, customer arrival, and smaller-scale office options.",
    shortlist_reason:
      "Businesses include 33 Drumm St to pressure-test whether the search is really Jackson Square, Embarcadero, or Financial District.",
    location:
      "33 Drumm St belongs to the downtown-waterfront transition, which makes it useful for comparing adjacent district identities.",
    strengths: [
      "Clarifies how close districts can serve different business needs.",
      "Useful for firms balancing address perception and practical access.",
      "Supports evaluation of district identity before touring.",
    ],
    tradeoffs: [
      "May not provide the same distinct historic texture as core Jackson Square.",
      "May not provide the same office-core certainty as Montgomery Street.",
      "Fit depends heavily on client and employee access patterns.",
    ],
    nearby_alternatives: [
      { label: "Financial District", url: "/commercial-real-estate/CA/san-francisco/financial-district/" },
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/" },
    ],
  }),
  sfDecisionBuilding({
    address: "70 Pier Bldg 102",
    district: dogpatch,
    role: "Waterfront / service-commercial reference",
    building_character: "Waterfront-edge commercial building that helps explain Dogpatch's practical production-adjacent geography.",
    typical_tenant_profile: "Makers, production-adjacent users, service-commercial businesses, and creative teams needing practical space.",
    shortlist_reason:
      "Businesses include 70 Pier Bldg 102 to compare Dogpatch's operational waterfront edge with Mission Bay's more institutional setting.",
    location:
      "70 Pier Bldg 102 is useful as a Dogpatch reference because it points to waterfront, service-commercial, and industrial-transition context rather than a conventional office core.",
    strengths: [
      "Shows why Dogpatch can work for practical, production-adjacent users.",
      "Helps compare waterfront edge context with Mission Bay and SoMa.",
      "Frames questions around loading, access, parking, and customer arrival.",
    ],
    tradeoffs: [
      "Less formal and less central than the Financial District.",
      "Less institutional than Mission Bay.",
      "Use permissions, physical condition, and operational needs must be validated.",
    ],
    nearby_alternatives: [
      { label: "Mission Bay", url: "/commercial-real-estate/CA/san-francisco/mission-bay/" },
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/" },
    ],
    validation_questions: [
      "Does the business need practical access more than formal office image?",
      "Would Mission Bay provide stronger institutional adjacency?",
      "Are loading, parking, use permissions, and customer arrival workable?",
    ],
  }),
  sfDecisionBuilding({
    address: "460 Townsend St",
    district: designDistrict,
    role: "Flex / production-commercial edge",
    building_character: "Flex and production-commercial building on the broader SoMa, Showplace Square, and Dogpatch transition.",
    typical_tenant_profile: "Flex, service-commercial, creative production, and operations-adjacent users.",
    shortlist_reason:
      "Businesses include 460 Townsend St when they need more operational flexibility than a traditional office building may provide.",
    location:
      "460 Townsend St helps explain the transition between SoMa office demand, Showplace Square production-commercial space, and Dogpatch edge conditions.",
    strengths: [
      "Useful for comparing office, flex, and production-commercial formats.",
      "Helps businesses understand why nearby districts can support different uses.",
      "Frames practical questions about loading, buildout, access, and permitted use.",
    ],
    tradeoffs: [
      "Operational flexibility can come with less polish or weaker formal office identity.",
      "The best district label depends on the actual use and customer pattern.",
      "Building condition and improvements should be validated before touring similar spaces.",
    ],
    nearby_alternatives: [
      { label: "SoMa", url: "/commercial-real-estate/CA/san-francisco/soma/" },
      { label: "Dogpatch", url: "/commercial-real-estate/CA/san-francisco/dogpatch/" },
    ],
    validation_questions: [
      "Does the business need flex functionality or a conventional office environment?",
      "Are loading, ceiling height, use permissions, and buildout needs realistic?",
      "Would SoMa, Dogpatch, or Mission Bay solve the requirement more directly?",
    ],
  }),
  sfDecisionBuilding({
    address: "909 Harrison St",
    district: soma,
    role: "Historic industrial-commercial reference",
    building_character: "Older industrial-commercial context south of downtown for creative, production, and adaptive office comparisons.",
    typical_tenant_profile: "Creative production, maker, service-commercial, and adaptive office users.",
    shortlist_reason:
      "Businesses include 909 Harrison St to understand the older industrial-commercial layer that still shapes SoMa's building options.",
    location:
      "909 Harrison St is useful as a SoMa reference because it shows the district's practical commercial texture away from a pure office-tower environment.",
    strengths: [
      "Helps compare adaptive commercial character against polished office districts.",
      "Useful for teams that need practical building features or creative identity.",
      "Frames questions around condition, access, use permissions, and improvement scope.",
    ],
    tradeoffs: [
      "May be a poor fit for companies needing formal client-facing polish.",
      "Industrial-commercial context can be an advantage or a distraction depending on use.",
      "Fit depends heavily on the actual suite, systems, and allowed use.",
    ],
    nearby_alternatives: [
      { label: "Financial District", url: "/commercial-real-estate/CA/san-francisco/financial-district/" },
      { label: "Dogpatch", url: "/commercial-real-estate/CA/san-francisco/dogpatch/" },
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
