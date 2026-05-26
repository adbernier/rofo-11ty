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

module.exports = [
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
