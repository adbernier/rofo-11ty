function clean(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildingPath(address) {
  return `/commercial-real-estate/building/CO/denver/${slugify(address)}/`;
}

function district(id, name, slug, primarySpaceType) {
  return {
    id,
    name,
    slug,
    city: "Denver",
    state_abbr: "CO",
    area_type: "district",
    path: `/commercial-real-estate/CO/denver/${slug}/`,
    primarySpaceType,
  };
}

const districts = {
  downtown: district("den-downtown-denver", "Downtown Denver", "downtown-denver", "office"),
  cherryCreek: district("den-cherry-creek", "Cherry Creek", "cherry-creek", "retail"),
  centralPark: district("den-central-park", "Central Park", "central-park", "medical"),
};

const handbookTopics = [
  {
    title: "Choosing the Right Commercial Location",
    url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/",
    summary: "Use location fit, access, customers, employees, and operations before narrowing the building list.",
  },
  {
    title: "How to Compare Commercial Spaces",
    url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/",
    summary: "Compare buildings by business fit, total occupancy cost, operations, buildout, and future flexibility.",
  },
  {
    title: "Tenant Improvements",
    url: "/commercial-real-estate/lease-guide/tenant-improvements/",
    summary: "Understand buildout scope, timing, landlord contributions, and what to validate before leasing.",
  },
];

const districtContext = {
  downtown: {
    workplaceCharacter: "Central Denver office environment shaped by civic, legal, finance, consulting, transit, and regional business identity.",
    neighborhoodCharacter: "Dense downtown business core where client access, institutional adjacency, and central identity matter more than parking convenience.",
    transit: "Downtown Denver offers stronger transit and civic access than most suburban nodes, while exact commute and parking patterns remain building-specific.",
    parking: "Structured or nearby parking should be validated early for client-facing and employee-heavy teams.",
    amenities: "Restaurants, hotels, civic institutions, professional services, and downtown services support client-facing office use.",
  },
  cherryCreek: {
    workplaceCharacter: "Polished customer-facing commercial environment where boutique office, service retail, wellness, and retail adjacency overlap.",
    neighborhoodCharacter: "Walkable, retail-oriented district with stronger customer and brand presence than back-office or warehouse utility.",
    transit: "Customer and employee access depends more on parking, local circulation, and trip patterns than rail-oriented commuting.",
    parking: "Parking, frontage, and arrival experience should be validated carefully for any customer-facing use.",
    amenities: "Retail, restaurants, hospitality, wellness, and client-service amenities are part of the district's business value.",
  },
  centralPark: {
    workplaceCharacter: "Northeast Denver mixed commercial environment where medical, office, retail, and local service uses serve growing residential and customer geography.",
    neighborhoodCharacter: "Parking-friendly and customer-oriented compared with downtown, with medical and service users evaluating access by patient geography.",
    transit: "Freeway and neighborhood access are usually more important than downtown transit identity.",
    parking: "Patient, visitor, employee, and accessible parking should be validated before assuming fit.",
    amenities: "Retail, service, and neighborhood amenities support patient-facing and local-service businesses.",
  },
};

function profileBrief(fields) {
  const snapshot = fields.snapshot || [];
  const bestFit = fields.bestFit || [];
  const validationNotes = fields.validationNotes || [];

  return {
    status: "published",
    ecosystemContext: {
      primaryEcosystem: fields.primaryEcosystem,
      ecosystemSubtypes: fields.ecosystemSubtypes,
      representativeRole: fields.representativeRole,
    },
    businessFit: {
      archetypes: fields.businessArchetypes,
      activities: fields.businessActivities,
      fitSummary: fields.fitSummary,
    },
    operationalProfile: fields.operationalProfile || [],
    environmentExplanation: fields.environmentExplanation,
    comparisonContext: {
      relatedDistricts: fields.relatedDistricts || [],
    },
    evidence: {
      confidence: fields.confidence || "editorially_supported",
      provenance: {
        ecosystem: "representative-building",
        operationalCharacteristics: "district-and-building-profile",
        editorialInterpretation: "building-brief",
      },
      sourceNotes: fields.sourceNotes || [],
    },
    summary: fields.summary,
    rofoTake: fields.rofoTake,
    buildingSummary: fields.summary,
    buildingImportance: fields.rofoTake,
    snapshot,
    quickFacts: snapshot,
    bestFit,
    idealFor: bestFit,
    mayNotFit: fields.mayNotFit || [],
    buildingExperience: fields.buildingExperience,
    locationContext: fields.locationContext,
    districtContext: fields.locationContext,
    advantages: fields.advantages || [],
    tradeoffs: fields.tradeoffs || [],
    validationNotes,
    validationChecklist: validationNotes,
    nearbyDistricts: fields.nearbyDistricts || [],
    nearbyAlternatives: fields.nearbyAlternatives || [],
    relatedInsights: handbookTopics,
    representativeCompanies: [],
    ecosystemSubtypes: fields.ecosystemSubtypes,
    representativeRole: fields.representativeRole,
    businessActivities: fields.businessActivities,
    businessArchetypes: fields.businessArchetypes,
    operationalCharacteristics: fields.operationalCharacteristics || [],
    fitSummary: fields.fitSummary,
    confidence: fields.confidence || "editorially_supported",
    sourceNotes: fields.sourceNotes || [],
  };
}

function record(fields) {
  const canonicalDistrict = districts[fields.districtKey];
  const defaults = districtContext[fields.districtKey];
  const path = buildingPath(fields.address);
  const brief = profileBrief(fields.brief);

  return {
    id: `co-denver-${slugify(fields.address)}`,
    building_path: path,
    identity: {
      name: fields.name,
      address: fields.address,
      city: "Denver",
      state_abbr: "CO",
      district: canonicalDistrict.name,
      canonicalDistrict,
      secondaryDistricts: fields.secondaryDistricts || [],
      buildingType: fields.buildingType,
      primarySpaceType: fields.primarySpaceType || canonicalDistrict.primarySpaceType,
      assetClass: fields.assetClass || "Representative Commercial Building",
    },
    editorial: {
      editorialRole: fields.editorialRole,
      editorialReason: fields.editorialReason,
      representativeThemes: fields.representativeThemes,
    },
    business: {
      businessFit: fields.businessFit,
      idealCompanyProfiles: brief.idealFor,
      companySizes: fields.companySizes || ["small and mid-sized businesses", "customer-facing teams", "professional and service operators"],
    },
    experience: {
      workplaceCharacter: defaults.workplaceCharacter,
      neighborhoodCharacter: defaults.neighborhoodCharacter,
      executivePresence: fields.executivePresence || "medium",
      innovationScore: fields.innovationScore || "moderate",
    },
    operations: {
      transit: defaults.transit,
      parking: defaults.parking,
      amenities: defaults.amenities,
      foodEnvironment: fields.foodEnvironment || "Food and service access should be evaluated by customer, employee, and visitor patterns.",
    },
    tradeoffs: {
      strengths: brief.advantages,
      limitations: brief.tradeoffs,
      businessesThatShouldCompare: brief.mayNotFit,
      nearbyAlternatives: fields.relatedDistrictPaths || [],
    },
    validation: {
      questionsToValidate: brief.validationNotes,
      tourObservations: brief.validationNotes.slice(0, 3),
    },
    relationships: {
      nearbyBuildings: (fields.nearbyBuildingPaths || []).slice(0, 5),
      comparisonBuildings: (fields.comparisonBuildingPaths || []).slice(0, 5),
      relatedDistricts: fields.relatedDistrictPaths || [],
    },
    quality: {
      sourceConfidence: fields.sourceConfidence || "medium",
      publicationStatus: "published",
      sourceBasis: "Denver Industrial & Flex Ecosystem Balance Sprint",
    },
    buildingBrief: brief,
  };
}

const records = [
  record({
    name: "1200 17th St",
    address: "1200 17th St",
    districtKey: "downtown",
    buildingType: "Downtown office",
    primarySpaceType: "office",
    editorialRole: "Downtown Class A Office Environment",
    editorialReason: "Provides Denver with an initial office Building Profile counterweight to the industrial/flex migration and explains Downtown Denver's central office operating model.",
    representativeThemes: ["Downtown office", "Client-facing identity", "Transit and civic access", "Professional services"],
    businessFit: ["law firms", "finance firms", "consulting firms", "regional professional offices"],
    relatedDistrictPaths: [districts.cherryCreek.path],
    nearbyBuildingPaths: [buildingPath("1600 Broadway"), buildingPath("1700 Lincoln St"), buildingPath("999 18th St")],
    comparisonBuildingPaths: [buildingPath("100 Fillmore Place"), buildingPath("4600 S Syracuse St"), buildingPath("1600 Broadway")],
    brief: {
      primaryEcosystem: "office",
      ecosystemSubtypes: ["downtown_office", "executive_office"],
      representativeRole: "downtown_class_a_office",
      businessActivities: ["knowledge_work", "client_meetings", "administrative_operations", "collaboration"],
      businessArchetypes: ["law_firm", "financial_services_firm", "consulting_firm", "professional_office"],
      operationalCharacteristics: ["professional_image", "large_floorplates", "structured_parking", "transit_access", "urban_core_access"],
      fitSummary: "Useful for professional-service and client-facing teams comparing central Denver office identity, access, and institutional adjacency.",
      summary: "1200 17th St helps explain Downtown Denver as a central office environment for legal, finance, consulting, and regional professional-service users. It is useful for businesses comparing whether civic access, client meetings, transit, and central business identity matter more than easier parking or suburban office scale.",
      rofoTake: "Denver's ecosystem picture should not be balanced only by industrial/flex depth. This profile gives office coverage a Building Profile benchmark without changing recommendation behavior.",
      snapshot: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Business use", value: "Downtown class A office environment" },
        { label: "District", value: "Downtown Denver" },
        { label: "Access context", value: "Central business district, civic, transit, and professional-service geography" },
        { label: "Comparison role", value: "Office counterweight to Denver industrial/flex Building Profile depth" },
      ],
      bestFit: [
        "Law, finance, consulting, and professional-service firms that value central Denver identity.",
        "Client-facing teams comparing downtown access against Cherry Creek or Denver Tech Center alternatives.",
        "Regional office users that need a recognizable Denver business address and access to downtown institutions.",
      ],
      mayNotFit: [
        "Parking-heavy back-office teams that may prefer Denver Tech Center or suburban office nodes.",
        "Industrial, flex, or warehouse users that need loading, yard, or production utility.",
      ],
      buildingExperience: "A tour should focus on arrival sequence, floorplate fit, transit and parking tradeoffs, client access, and how the downtown setting supports the business's operating model.",
      locationContext: "Downtown Denver is the metro's central civic, legal, finance, and regional office core. Compare Cherry Creek for a more boutique customer-facing environment and Denver Tech Center for parking-oriented corporate office scale.",
      advantages: [
        "Adds office Building Profile depth to balance Denver's industrial/flex brief concentration.",
        "Explains central Denver office identity for professional-service users.",
        "Supports comparison between downtown office, Cherry Creek, and southeast suburban office environments.",
      ],
      tradeoffs: [
        "Parking and commute friction may matter more than in suburban office nodes.",
        "Downtown identity may be less useful for teams whose customers or employees are concentrated outside central Denver.",
        "Office image does not solve operational needs such as loading, storage, production, or vehicle movement.",
      ],
      operationalProfile: [
        { label: "Client access", summary: "Downtown office users should evaluate whether central civic, legal, transit, and professional-service access improves client meetings and recruiting." },
        { label: "Parking and arrival", summary: "Parking, visitor arrival, and elevator or lobby experience should be validated before assuming a downtown building supports the team's daily pattern." },
      ],
      environmentExplanation: {
        whyItExists: "Downtown class A office environments exist for businesses that benefit from central identity, institutional access, client meetings, and professional-service clustering.",
        whyChooseThisEnvironment: "Choose this environment over industrial/flex when client-facing office identity matters more than loading or storage, and compare Cherry Creek or DTC when parking, customer geography, or suburban access is more important.",
        representativeValue: "1200 17th St gives Denver's office ecosystem an initial Building Profile benchmark.",
      },
      relatedDistricts: [{ districtId: "cherry-creek", reason: "Boutique client-facing office and retail adjacency alternative." }],
      nearbyAlternatives: [
        { label: "100 Fillmore Place", url: buildingPath("100 Fillmore Place"), reason: "Compare this when Cherry Creek client-facing identity and retail adjacency are more important than downtown office scale." },
        { label: "1600 Broadway", url: buildingPath("1600 Broadway"), reason: "Compare this as another Downtown Denver office reference before assuming one building defines the district." },
        { label: "4600 S Syracuse St", url: buildingPath("4600 S Syracuse St"), reason: "Compare this when Denver Tech Center parking and southeast suburban office access may fit better." },
      ],
      validationNotes: ["Confirm parking strategy.", "Validate visitor arrival and security process.", "Confirm floorplate fit and expansion options.", "Compare downtown identity against Cherry Creek and DTC."],
      sourceNotes: ["Existing Denver graph representative building for Downtown Denver."],
    },
  }),
  record({
    name: "100 Fillmore Place",
    address: "100 Fillmore Place",
    districtKey: "cherryCreek",
    buildingType: "Client-facing office / retail-adjacent commercial",
    primarySpaceType: "retail",
    editorialRole: "Neighborhood Service Retail Environment",
    editorialReason: "Adds a customer-facing Cherry Creek profile so Denver's retail and service-retail ecosystem is not represented only as secondary district context.",
    representativeThemes: ["Service retail", "Retail adjacency", "Customer access", "Boutique professional services"],
    businessFit: ["service retail", "wellness providers", "customer-facing professional services", "boutique brands"],
    relatedDistrictPaths: [districts.downtown.path, districts.centralPark.path],
    nearbyBuildingPaths: [buildingPath("250 Fillmore St"), buildingPath("205 Detroit St")],
    comparisonBuildingPaths: [buildingPath("1200 17th St"), buildingPath("8354 Northfield Blvd"), buildingPath("205 Detroit St")],
    brief: {
      primaryEcosystem: "retail",
      ecosystemSubtypes: ["neighborhood_retail", "service_retail"],
      representativeRole: "neighborhood_service_retail",
      businessActivities: ["walk_in_service", "client_meetings", "customer_showroom"],
      businessArchetypes: ["wellness_practice", "marketing_agency", "professional_office"],
      operationalCharacteristics: ["street_visibility", "customer_parking", "walk_in_customer_access", "retail_adjacent", "professional_image"],
      fitSummary: "Useful for customer-facing service businesses comparing Cherry Creek's retail adjacency, visitor experience, and polished district identity.",
      summary: "100 Fillmore Place helps explain Cherry Creek as a customer-facing commercial environment where boutique office, service retail, wellness, and retail adjacency overlap. It is useful for businesses comparing whether visitor experience, district image, and customer access matter more than conventional office efficiency or lower-cost operating space.",
      rofoTake: "This profile closes the initial retail Building Profile gap in Denver while keeping retail as an important supporting ecosystem rather than a new primary Rofo focus.",
      snapshot: [
        { label: "Primary ecosystem", value: "Retail" },
        { label: "Business use", value: "Neighborhood service retail environment" },
        { label: "District", value: "Cherry Creek" },
        { label: "Access context", value: "Customer-facing Cherry Creek commercial geography" },
        { label: "Comparison role", value: "Retail and service-retail counterweight to industrial/flex depth" },
      ],
      bestFit: [
        "Wellness, service, boutique professional, and customer-facing businesses that benefit from Cherry Creek's district identity.",
        "Teams comparing whether retail adjacency and visitor experience matter more than conventional office efficiency.",
        "Businesses that need a polished arrival sequence and customer geography without becoming a pure downtown office search.",
      ],
      mayNotFit: [
        "Back-office teams that do not benefit from customer access or retail adjacency.",
        "Industrial or warehouse users needing loading, yard, or operational utility.",
      ],
      buildingExperience: "A tour should focus on customer arrival, visibility, parking, signage, nearby retail context, and whether the district's image supports the business model.",
      locationContext: "Cherry Creek differs from Downtown Denver by emphasizing polished customer-facing identity, retail adjacency, and local visitor experience. Compare Central Park when parking and northeast Denver customer geography matter more.",
      advantages: [
        "Adds initial retail/customer-facing Building Profile depth to Denver.",
        "Helps distinguish service retail and retail-adjacent professional use from generic office coverage.",
        "Supports comparison between Cherry Creek, Downtown Denver, and Central Park customer geographies.",
      ],
      tradeoffs: [
        "Retail adjacency may increase cost or complexity without helping businesses that do not need customer presence.",
        "Parking, signage, frontage, and customer arrival vary by exact suite and should be validated.",
        "Customer-facing identity may be less useful for private administrative teams or operational businesses.",
      ],
      operationalProfile: [
        { label: "Customer presence", summary: "Customer-facing users should validate visibility, arrival, signage, and how surrounding retail activity supports the intended use." },
        { label: "District fit", summary: "Cherry Creek can help businesses that benefit from polished customer geography, but it may be less efficient for private office or operational uses." },
      ],
      environmentExplanation: {
        whyItExists: "Neighborhood service retail environments exist for businesses that need customers to find, enter, and trust the location, while still operating in a broader commercial district.",
        whyChooseThisEnvironment: "Choose this environment over Downtown Denver when customer experience and retail adjacency matter more than central office identity. Compare Central Park when parking and northeast customer geography are stronger drivers.",
        representativeValue: "100 Fillmore Place gives Denver an initial retail/service-retail Building Profile benchmark.",
      },
      relatedDistricts: [{ districtId: "central-park", reason: "Parking-friendly medical, service, and local customer geography alternative." }],
      nearbyAlternatives: [
        { label: "1200 17th St", url: buildingPath("1200 17th St"), reason: "Compare this when central office identity matters more than retail adjacency." },
        { label: "3401 Quebec St", url: buildingPath("3401 Quebec Street, Suite 9000"), reason: "Compare this when patient access and northeast Denver customer geography are stronger drivers." },
        { label: "205 Detroit St", url: buildingPath("205 Detroit St"), reason: "Compare this as another Cherry Creek building before treating one customer-facing example as the full district." },
      ],
      validationNotes: ["Confirm frontage and signage rights.", "Validate customer parking and arrival sequence.", "Confirm permitted use.", "Compare retail adjacency against operating cost and privacy needs."],
      sourceNotes: ["Existing Denver graph representative building for Cherry Creek."],
    },
  }),
  record({
    name: "3401 Quebec St",
    address: "3401 Quebec Street, Suite 9000",
    districtKey: "centralPark",
    buildingType: "Medical / professional office",
    primarySpaceType: "medical",
    editorialRole: "Medical Office Environment",
    editorialReason: "Adds a medical Building Profile benchmark for Central Park so Denver's medical ecosystem has initial brief depth outside industrial/flex.",
    representativeThemes: ["Medical office", "Patient access", "Northeast Denver", "Service-commercial context"],
    businessFit: ["medical practice", "wellness practice", "specialty clinic", "administrative office"],
    relatedDistrictPaths: [districts.cherryCreek.path, districts.downtown.path],
    nearbyBuildingPaths: [buildingPath("8354 Northfield Blvd")],
    comparisonBuildingPaths: [buildingPath("100 Fillmore Place"), buildingPath("1200 17th St"), buildingPath("8354 Northfield Blvd")],
    brief: {
      primaryEcosystem: "medical",
      ecosystemSubtypes: ["medical_office"],
      representativeRole: "medical_office_environment",
      businessActivities: ["healthcare_delivery", "administrative_operations", "walk_in_service"],
      businessArchetypes: ["medical_practice", "dental_practice", "physical_therapy_practice", "wellness_practice", "outpatient_clinic"],
      operationalCharacteristics: ["customer_parking", "professional_image", "medical_use_compatible", "walk_in_customer_access", "suburban_access"],
      fitSummary: "Useful for medical and wellness users comparing northeast Denver patient access, parking, and service-commercial context.",
      summary: "3401 Quebec St helps explain Central Park as a medical and professional-service environment for businesses serving northeast Denver customer and patient geography. It is useful for practices and service users comparing parking, accessibility, neighborhood access, and patient convenience against central Denver image or hospital-adjacent locations.",
      rofoTake: "This profile gives Denver medical Building Profile depth so industrial/flex Building Briefs no longer carry all ecosystem evidence.",
      snapshot: [
        { label: "Primary ecosystem", value: "Medical" },
        { label: "Business use", value: "Medical office environment" },
        { label: "District", value: "Central Park" },
        { label: "Access context", value: "Northeast Denver patient and customer geography" },
        { label: "Comparison role", value: "Medical counterweight to Denver industrial/flex Building Profile depth" },
      ],
      bestFit: [
        "Medical, dental, wellness, physical therapy, and outpatient users serving northeast Denver customers or patients.",
        "Professional or administrative users that need parking-friendly access without a downtown office identity.",
        "Patient-facing practices comparing Central Park's local access against Cherry Creek, Aurora, or south metro medical nodes.",
      ],
      mayNotFit: [
        "Practices requiring hospital adjacency or specialized clinical infrastructure without direct property validation.",
        "Executive office users whose clients expect Downtown Denver, Cherry Creek, or DTC identity.",
      ],
      buildingExperience: "A tour should focus on patient arrival, parking, accessibility, layout, plumbing or clinical requirements, signage, and whether the district matches the practice's referral geography.",
      locationContext: "Central Park gives Denver a different medical and service-commercial model from Downtown Denver or Cherry Creek: more parking-friendly, more neighborhood/customer-oriented, and less dependent on central office image.",
      advantages: [
        "Adds initial medical Building Profile depth to Denver.",
        "Explains patient and customer access in a northeast Denver mixed commercial setting.",
        "Supports comparison between Central Park, Cherry Creek, Downtown Denver, and other medical/service nodes.",
      ],
      tradeoffs: [
        "Medical fit depends on suite-level infrastructure, accessibility, permitted use, and patient flow.",
        "Central Park may not provide the same referral ecosystem as hospital-adjacent or specialty medical clusters.",
        "A neighborhood medical setting may be less useful for firms whose client or employee geography is centered downtown or along I-25.",
      ],
      operationalProfile: [
        { label: "Patient access", summary: "Medical users should validate parking, accessibility, arrival sequence, signage, and how easily patients can reach the location." },
        { label: "Clinical requirements", summary: "Plumbing, HVAC, layout, permitted use, and any specialized medical improvements must be confirmed before relying on the property as a fit." },
      ],
      environmentExplanation: {
        whyItExists: "Medical office environments exist because healthcare and wellness users need patient access, privacy, professional image, parking, and clinical buildout feasibility to work together.",
        whyChooseThisEnvironment: "Choose this environment over Downtown Denver when patient parking and northeast Denver service geography matter more than central office identity. Compare Cherry Creek when polished customer-facing image is a stronger driver.",
        representativeValue: "3401 Quebec St gives Denver's medical ecosystem an initial Building Profile benchmark.",
      },
      relatedDistricts: [{ districtId: "cherry-creek", reason: "More polished patient/customer-facing central Denver alternative." }],
      nearbyAlternatives: [
        { label: "8354 Northfield Blvd", url: buildingPath("8354 Northfield Blvd"), reason: "Compare this as another Central Park customer-facing reference before assuming one building defines the area." },
        { label: "100 Fillmore Place", url: buildingPath("100 Fillmore Place"), reason: "Compare this when Cherry Creek customer-facing identity matters more than northeast patient geography." },
        { label: "1200 17th St", url: buildingPath("1200 17th St"), reason: "Compare this when central office access is more important than parking-friendly medical or service access." },
      ],
      validationNotes: ["Confirm permitted medical use.", "Validate accessibility and patient parking.", "Confirm plumbing, HVAC, and layout requirements.", "Review signage and patient arrival sequence."],
      sourceNotes: ["Existing Denver graph representative building for Central Park."],
    },
  }),
];

module.exports = {
  canonicalBuildings: records,
};
