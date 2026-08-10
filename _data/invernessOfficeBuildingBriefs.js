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
  return `/commercial-real-estate/building/CO/englewood/${slugify(address)}/`;
}

const invernessDistrict = {
  id: "co-englewood-inverness",
  name: "Inverness",
  slug: "inverness",
  city: "Englewood",
  state_abbr: "CO",
  area_type: "district",
  path: "/commercial-real-estate/CO/englewood/inverness/",
  primarySpaceType: "office",
};

const relatedDistricts = [
  {
    label: "Denver Tech Center",
    url: "/commercial-real-estate/CO/denver/denver-tech-center/",
    reason: "Compare when recognized southeast office identity and DTC market depth matter more than a quieter business-park format.",
  },
  {
    label: "Greenwood Village",
    url: "/commercial-real-estate/CO/greenwood-village/greenwood-village/",
    reason: "Compare when client-facing southeast professional-service context matters more than Inverness campus setting.",
  },
  {
    label: "Meridian / Lincoln Station",
    url: "/commercial-real-estate/CO/englewood/meridian-lincoln-station/",
    reason: "Compare when farther south I-25 access or transit-adjacent business-park geography is a stronger fit.",
  },
];

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
    summary: "Understand buildout scope, timing, landlord approvals, and what to validate before leasing.",
  },
];

function officeBrief(fields) {
  const snapshot = fields.snapshot || [];
  const bestFit = fields.bestFit || [];
  const validationNotes = fields.validationNotes || [];

  return {
    status: "published",
    ecosystemContext: {
      primaryEcosystem: "office",
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
      relatedDistricts,
    },
    evidence: {
      confidence: fields.confidence || "editorially_supported",
      provenance: {
        ecosystem: "commercial-market-evidence",
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
    nearbyDistricts: relatedDistricts,
    nearbyAlternatives: fields.nearbyAlternatives || [],
    relatedInsights: handbookTopics,
    representativeCompanies: fields.representativeCompanies || [],
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
  const path = buildingPath(fields.address);
  const brief = officeBrief(fields.brief);

  return {
    id: `co-englewood-${slugify(fields.address)}`,
    building_path: path,
    identity: {
      name: fields.name,
      address: fields.address,
      city: "Englewood",
      state_abbr: "CO",
      district: invernessDistrict.name,
      canonicalDistrict: invernessDistrict,
      secondaryDistricts: fields.secondaryDistricts || [],
      buildingType: fields.buildingType || "Suburban office building",
      primarySpaceType: "office",
      assetClass: fields.assetClass || "Representative Office Building",
    },
    editorial: {
      editorialRole: fields.editorialRole,
      editorialReason: fields.editorialReason,
      representativeThemes: fields.representativeThemes,
    },
    business: {
      businessFit: fields.businessFit,
      idealCompanyProfiles: brief.idealFor,
      companySizes: fields.companySizes || ["professional-service firms", "technology offices", "regional office teams"],
    },
    experience: {
      workplaceCharacter: "Inverness business-park office environment where parking, southeast access, campus form, and DTC adjacency shape fit.",
      neighborhoodCharacter: "Suburban southeast office setting with stronger parking and campus practicality than urban walkability or central Denver identity.",
      executivePresence: fields.executivePresence || "medium",
      innovationScore: fields.innovationScore || "moderate",
    },
    operations: {
      transit: "I-25 and southeast metro access are the primary location story; exact employee commute patterns and RTD utility should be validated.",
      parking: "Parking is part of the business-park value proposition, but allocation, visitor access, accessible stalls, and cost should be confirmed.",
      amenities: "Office-support services vary by building cluster and should be evaluated against employee, visitor, and client patterns.",
      foodEnvironment: "Food and service access is supportive context, not the reason to choose the building.",
    },
    tradeoffs: {
      strengths: brief.advantages,
      limitations: brief.tradeoffs,
      businessesThatShouldCompare: brief.mayNotFit,
      nearbyAlternatives: relatedDistricts.map((item) => item.url),
    },
    validation: {
      questionsToValidate: brief.validationNotes,
      tourObservations: brief.validationNotes.slice(0, 3),
    },
    relationships: {
      nearbyBuildings: (fields.nearbyBuildingPaths || []).slice(0, 5),
      comparisonBuildings: (fields.comparisonBuildingPaths || []).slice(0, 5),
      relatedDistricts: relatedDistricts.map((item) => item.url),
    },
    quality: {
      sourceConfidence: fields.sourceConfidence || "medium",
      publicationStatus: "published",
      sourceBasis: "Inverness Commercial Market Evidence district-building mission",
    },
    buildingBrief: brief,
  };
}

const records = [
  record({
    name: "109 Inverness Dr E",
    address: "109 Inverness Dr E",
    editorialRole: "Campus-Style Office Benchmark",
    editorialReason: "Represents Inverness as a southeast business-park office environment where parking, campus form, and DTC adjacency shape fit.",
    representativeThemes: ["Suburban office", "Business park", "Parking-oriented access", "Southeast metro"],
    businessFit: ["professional office", "technology office", "regional office", "administrative office"],
    nearbyBuildingPaths: [
      buildingPath("365 Inverness Pkwy"),
      buildingPath("6300 S Syracuse Way"),
      buildingPath("8310 S Valley Hwy"),
    ],
    comparisonBuildingPaths: [
      buildingPath("365 Inverness Pkwy"),
      buildingPath("6300 S Syracuse Way"),
      "/commercial-real-estate/building/CO/denver/7900-e-union-ave/",
    ],
    brief: {
      summary: "109 Inverness Dr E is an Inverness Building Profile for office users comparing a southeast business-park setting with parking, campus form, and DTC adjacency. It helps teams evaluate whether a quieter suburban office environment fits better than Downtown Denver, Cherry Creek, or a more recognized Denver Tech Center address.",
      rofoTake: "This profile matters because Inverness needs a practical campus-style office benchmark, not only broad district language. 109 Inverness Dr E helps Rofo explain the business-park decision: parking, commute geography, office layout, and quieter southeast access can matter more than urban walkability or downtown identity.",
      snapshot: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Business use", value: "Campus-style professional office comparison" },
        { label: "District", value: "Inverness" },
        { label: "Access context", value: "Southeast metro and DTC-adjacent business-park geography" },
        { label: "Evidence role", value: "Campus-style office benchmark" },
        { label: "Validation context", value: "Parking, layout, visitor access, and current suite condition require verification" },
      ],
      bestFit: [
        "Professional-service, technology, administrative, or regional office teams that value southeast metro access.",
        "Businesses that want parking and business-park practicality more than downtown walkability.",
        "Teams comparing Inverness against DTC, Greenwood Village, Centennial, or Lone Tree for employee geography.",
      ],
      mayNotFit: [
        "Companies that need downtown civic access, walkable client entertainment, or transit-first commuting.",
        "Retail, medical, industrial, or warehouse users that need specialized visibility, clinical, loading, or operational features.",
        "Teams whose brand depends on a more recognized Denver Tech Center or Cherry Creek address.",
      ],
      buildingExperience: "Evaluate this environment by commute geography, visitor arrival, parking, office layout, and whether a quieter business-park setting supports the team's daily operating rhythm.",
      locationContext: "109 Inverness Dr E sits in the Inverness business-park district near DTC. It should be compared with Cascades for larger campus scale, 365 Inverness Pkwy for practical professional-office format, and DTC when market identity matters more.",
      advantages: [
        "Establishes a clear campus-style office benchmark for Inverness.",
        "Supports southeast metro office comparison against DTC and Greenwood Village.",
        "Helps explain why parking and business-park format can matter more than urban visibility.",
      ],
      tradeoffs: [
        "Business-park convenience may come with less walkability and weaker central Denver identity.",
        "Parking value still depends on building-level allocation, visitor access, and cost.",
        "Current suite condition, layout, and occupancy flexibility are not implied by representative evidence.",
      ],
      operationalProfile: [
        { label: "Commute geography", summary: "Validate whether employee origins and client trips favor the southeast metro over central Denver." },
        { label: "Business-park format", summary: "Compare parking, arrival, visibility, and daily services against the team's operating rhythm." },
        { label: "Office layout", summary: "Confirm floorplate fit, meeting needs, privacy, and buildout constraints before shortlisting." },
      ],
      environmentExplanation: {
        whyItExists: "Campus-style office buildings support teams that prioritize access, parking, and functional office layouts over urban identity.",
        whyChooseThisEnvironment: "Choose this environment when Inverness business-park practicality is more useful than DTC visibility or downtown centrality.",
        representativeValue: "109 Inverness Dr E anchors the Inverness collection as the practical campus-style office benchmark.",
      },
      nearbyAlternatives: [
        { label: "365 Inverness Pkwy", url: buildingPath("365 Inverness Pkwy"), reason: "Compare when a more practical professional-office format matters more than campus identity." },
        { label: "Cascades", url: buildingPath("6300 S Syracuse Way"), reason: "Compare when larger campus scale or expansion context is more important." },
        { label: "Denver Tech Center", url: "/commercial-real-estate/CO/denver/denver-tech-center/", reason: "Compare when stronger southeast office identity matters more than quieter business-park setting." },
      ],
      validationNotes: [
        "Does the commute pattern favor Inverness over DTC, Downtown Denver, or Greenwood Village?",
        "Does the available suite support the team's layout, meeting, privacy, and growth needs?",
        "Are parking allocation, visitor arrival, and accessibility adequate for employees and clients?",
        "Would a more recognized DTC address or a more urban district better support customer expectations?",
      ],
      ecosystemSubtypes: ["suburban_business_park", "professional_office"],
      representativeRole: "suburban_office_campus",
      businessActivities: ["knowledge_work", "client_meetings", "administrative_operations"],
      businessArchetypes: ["professional_office", "technology_company", "regional_office"],
      operationalCharacteristics: ["customer_parking", "freeway_access", "suburban_access", "private_office_layout"],
      fitSummary: "Useful for teams choosing business-park practicality over urban identity.",
      sourceNotes: ["Rofo Knowledge Graph identifies 109 Inverness Dr E as an Inverness representative campus-style office environment."],
    },
  }),
  record({
    name: "365 Inverness Pkwy",
    address: "365 Inverness Pkwy",
    editorialRole: "Practical Professional Office Benchmark",
    editorialReason: "Represents practical Inverness professional office space for southeast metro service, administrative, and technology users.",
    representativeThemes: ["Professional office", "Southeast access", "Business park", "Practical office"],
    businessFit: ["professional office", "consulting office", "technology office", "administrative office"],
    nearbyBuildingPaths: [
      buildingPath("109 Inverness Dr E"),
      buildingPath("6300 S Syracuse Way"),
      buildingPath("8310 S Valley Hwy"),
    ],
    comparisonBuildingPaths: [
      buildingPath("109 Inverness Dr E"),
      buildingPath("8310 S Valley Hwy"),
      "/commercial-real-estate/building/CO/denver/4643-s-ulster-st/",
    ],
    brief: {
      summary: "365 Inverness Pkwy is an Inverness Building Profile for professional-service, administrative, consulting, and technology office users comparing practical southeast access. It helps a team evaluate functional office fit, parking, visitor arrival, and business-park context without assuming a current suite is ready or available.",
      rofoTake: "This profile matters because Inverness should not be explained only through larger campus examples. 365 Inverness Pkwy gives Rofo a practical professional-office benchmark for smaller and mid-sized users that want southeast convenience but may not need a headquarters-style campus or stronger DTC identity.",
      snapshot: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Business use", value: "Professional-service and administrative office comparison" },
        { label: "District", value: "Inverness" },
        { label: "Access context", value: "Southeast business-park access near DTC" },
        { label: "Evidence role", value: "Practical professional office benchmark" },
        { label: "Validation context", value: "Office layout, visitor arrival, parking, and current suite condition require verification" },
      ],
      bestFit: [
        "Professional-service, consulting, technology, or administrative teams comparing southeast office options.",
        "Businesses that need functional office fit and parking more than a prominent downtown or DTC signal.",
        "Smaller or mid-sized office users that want Inverness practicality without larger campus requirements.",
      ],
      mayNotFit: [
        "Companies that require flagship executive image, downtown centrality, or walkable urban client entertainment.",
        "Large headquarters-style users that need a broader campus setting or future expansion options.",
        "Warehouse, retail, or clinical users whose requirements depend on features not established by office evidence.",
      ],
      buildingExperience: "Evaluate this building by day-to-day professional office usability: employee commute, visitor arrival, parking, layout, meeting needs, and how much district identity matters.",
      locationContext: "365 Inverness Pkwy gives the Inverness collection a practical office example. Compare 109 Inverness Dr E for campus-style fit, The Point at Inverness for a more executive office setting, and DTC for stronger market identity.",
      advantages: [
        "Adds practical professional-office depth to the Inverness evidence collection.",
        "Supports comparison for smaller and mid-sized southeast office users.",
        "Clarifies how Inverness can work without requiring large campus scale.",
      ],
      tradeoffs: [
        "Practical office fit may not provide the same client-facing signal as DTC, Cherry Creek, or Downtown Denver.",
        "Parking and visitor arrival need building-level confirmation.",
        "Representative evidence does not establish suite availability, condition, or buildout readiness.",
      ],
      operationalProfile: [
        { label: "Professional-office fit", summary: "Validate layout, meeting rooms, privacy, and workflow against the team's actual office use." },
        { label: "Visitor arrival", summary: "Check parking, building entry, wayfinding, accessibility, and customer expectations before shortlisting." },
        { label: "District identity", summary: "Decide whether Inverness practicality is enough or whether DTC visibility matters more." },
      ],
      environmentExplanation: {
        whyItExists: "Practical professional-office buildings support teams whose requirements are functional rather than image-led.",
        whyChooseThisEnvironment: "Choose this environment when southeast access, parking, and usable office layout matter more than campus scale.",
        representativeValue: "365 Inverness Pkwy gives the collection its everyday professional-office benchmark.",
      },
      nearbyAlternatives: [
        { label: "109 Inverness Dr E", url: buildingPath("109 Inverness Dr E"), reason: "Compare when campus-style business-park identity matters more than practical office simplicity." },
        { label: "The Point at Inverness", url: buildingPath("8310 S Valley Hwy"), reason: "Compare when executive image and visitor impression are stronger priorities." },
        { label: "Greenwood Village", url: "/commercial-real-estate/CO/greenwood-village/greenwood-village/", reason: "Compare when client-facing southeast professional-service context may be stronger." },
      ],
      validationNotes: [
        "Does the office layout support the team's workflow, meeting needs, privacy, and future headcount?",
        "Is visitor arrival clear enough for clients, vendors, or patients if relevant?",
        "Are parking allocation, access, signage, and building entry practical for daily use?",
        "Would DTC, Greenwood Village, or Downtown Denver better match the team's market identity needs?",
      ],
      ecosystemSubtypes: ["professional_office", "suburban_business_park"],
      representativeRole: "professional_office_environment",
      businessActivities: ["knowledge_work", "client_meetings", "administrative_operations"],
      businessArchetypes: ["professional_office", "consulting_firm", "technology_company"],
      operationalCharacteristics: ["customer_parking", "suburban_access", "private_office_layout", "professional_image"],
      fitSummary: "Useful for smaller and mid-sized professional-office users comparing southeast business-park utility.",
      sourceNotes: ["Rofo Knowledge Graph identifies 365 Inverness Pkwy as an Inverness representative professional office environment."],
    },
  }),
  record({
    name: "Cascades",
    address: "6300 S Syracuse Way",
    assetClass: "Representative Office Campus",
    buildingType: "Large-scale office campus",
    editorialRole: "Large Campus Office Benchmark",
    editorialReason: "Shows the larger multi-building campus side of Inverness for regional office and headquarters-style users.",
    representativeThemes: ["Office campus", "Regional office", "Expansion context", "Business park"],
    businessFit: ["regional office", "corporate support office", "technology office", "headquarters-style office"],
    companySizes: ["larger office teams", "regional offices", "headquarters-style users"],
    nearbyBuildingPaths: [
      buildingPath("109 Inverness Dr E"),
      buildingPath("365 Inverness Pkwy"),
      buildingPath("8310 S Valley Hwy"),
    ],
    comparisonBuildingPaths: [
      buildingPath("109 Inverness Dr E"),
      buildingPath("8310 S Valley Hwy"),
      "/commercial-real-estate/building/CO/denver/7900-e-union-ave/",
    ],
    brief: {
      summary: "Cascades is an Inverness Building Profile for larger office users comparing campus scale, parking, expansion context, and southeast metro access. It helps regional offices or headquarters-style teams understand the business-park side of Inverness without implying current availability, tenant mix, or suite-level readiness.",
      rofoTake: "This profile matters because Cascades explains the larger multi-building campus side of Inverness. It gives Rofo a benchmark for teams whose decision is less about street visibility and more about office scale, parking, commute geography, expansion planning, and southeast suburban practicality.",
      snapshot: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Business use", value: "Regional office and campus-style office comparison" },
        { label: "District", value: "Inverness" },
        { label: "Access context", value: "Southeast metro business-park geography" },
        { label: "Evidence role", value: "Large campus office benchmark" },
        { label: "Validation context", value: "Expansion needs, parking, floorplate fit, and current suite condition require verification" },
      ],
      bestFit: [
        "Regional offices, corporate support teams, or headquarters-style users that need larger office context.",
        "Teams that prioritize parking, campus format, and southeast employee geography over downtown address value.",
        "Companies comparing Inverness against DTC, Lone Tree, or Meridian for office scale and practical access.",
      ],
      mayNotFit: [
        "Small teams that want compact, highly flexible, or walkable office settings.",
        "Client-facing firms whose business depends on central Denver, Cherry Creek, or stronger DTC identity.",
        "Industrial, lab, or medical users that need specialized infrastructure not established by office-campus evidence.",
      ],
      buildingExperience: "Evaluate Cascades by campus scale, floorplate options, parking, visitor movement, employee commute geography, and whether business-park quiet supports or weakens the company's operating model.",
      locationContext: "Cascades broadens Inverness beyond single-building office examples. It should be compared with 109 Inverness Dr E for standard campus-style office, The Point at Inverness for executive image, and Meridian or DTC for alternative southeast office context.",
      advantages: [
        "Adds larger campus-scale evidence to the Inverness collection.",
        "Supports regional office and headquarters-style comparison work.",
        "Clarifies why Inverness can fit teams needing scale and parking more than urban identity.",
      ],
      tradeoffs: [
        "Large campus format may feel less visible, walkable, or customer-facing than central districts.",
        "Expansion value depends on current suite availability and building-level options.",
        "Campus scale does not establish technical infrastructure, parking allocation, or operational suitability.",
      ],
      operationalProfile: [
        { label: "Campus scale", summary: "Confirm whether the building format supports the team's size, growth pattern, and internal collaboration needs." },
        { label: "Parking and arrival", summary: "Validate employee, visitor, accessible, and after-hours access rather than assuming campus convenience is sufficient." },
        { label: "Southeast geography", summary: "Compare employee and client origins against DTC, Lone Tree, Meridian, and Downtown Denver alternatives." },
      ],
      environmentExplanation: {
        whyItExists: "Larger office campuses serve regional teams that need scale, parking, and suburban access more than dense urban context.",
        whyChooseThisEnvironment: "Choose this environment when business-park scale and southeast geography are central to the office decision.",
        representativeValue: "Cascades anchors the Inverness collection as the large campus office benchmark.",
      },
      nearbyAlternatives: [
        { label: "109 Inverness Dr E", url: buildingPath("109 Inverness Dr E"), reason: "Compare when a smaller campus-style office benchmark is enough." },
        { label: "The Point at Inverness", url: buildingPath("8310 S Valley Hwy"), reason: "Compare when executive image is more important than campus scale." },
        { label: "Meridian / Lincoln Station", url: "/commercial-real-estate/CO/englewood/meridian-lincoln-station/", reason: "Compare when farther south I-25 access or transit adjacency matters more." },
      ],
      validationNotes: [
        "Does the campus format support the team's size, growth, meeting, and workplace needs?",
        "Are parking allocation, visitor arrival, accessibility, and after-hours access adequate?",
        "Does southeast metro geography work for employees, clients, and leadership?",
        "Would DTC, Meridian, Lone Tree, or Downtown Denver provide a stronger identity or commute fit?",
      ],
      ecosystemSubtypes: ["suburban_business_park", "corporate_office"],
      representativeRole: "suburban_office_campus",
      businessActivities: ["knowledge_work", "administrative_operations", "client_meetings"],
      businessArchetypes: ["regional_office", "corporate_office", "technology_company"],
      operationalCharacteristics: ["customer_parking", "freeway_access", "suburban_access", "expansion_flexibility"],
      fitSummary: "Useful for larger office users comparing campus scale and southeast suburban practicality.",
      sourceNotes: ["Rofo Knowledge Graph identifies Cascades as an Inverness representative larger campus-style office environment."],
    },
  }),
  record({
    name: "The Point at Inverness",
    address: "8310 S Valley Hwy",
    assetClass: "Representative Executive Office Building",
    buildingType: "Executive office environment",
    editorialRole: "Southeast Executive Office Benchmark",
    editorialReason: "Illustrates a polished southeast executive office environment for users comparing Inverness against DTC and Lone Tree.",
    representativeThemes: ["Executive office", "Professional image", "Southeast access", "Business park"],
    businessFit: ["executive office", "professional office", "consulting office", "regional office"],
    nearbyBuildingPaths: [
      buildingPath("109 Inverness Dr E"),
      buildingPath("365 Inverness Pkwy"),
      buildingPath("6300 S Syracuse Way"),
    ],
    comparisonBuildingPaths: [
      buildingPath("365 Inverness Pkwy"),
      buildingPath("6300 S Syracuse Way"),
      "/commercial-real-estate/building/CO/denver/4643-s-ulster-st/",
    ],
    brief: {
      summary: "The Point at Inverness is an Inverness Building Profile for executive, professional-service, consulting, and regional office users comparing suburban image with southeast access. It helps a team evaluate client arrival, office presentation, parking, and business-park setting before assuming the building fits a specific requirement.",
      rofoTake: "This profile matters because Inverness includes more than generic suburban office space. The Point at Inverness gives the collection an executive-office benchmark, helping users decide whether a polished southeast suburban environment is enough or whether DTC, Cherry Creek, or Downtown Denver would better support client expectations.",
      snapshot: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Business use", value: "Executive and professional-office comparison" },
        { label: "District", value: "Inverness" },
        { label: "Access context", value: "Southeast suburban business-park geography" },
        { label: "Evidence role", value: "Southeast executive office benchmark" },
        { label: "Validation context", value: "Client arrival, office image, parking, and current suite condition require verification" },
      ],
      bestFit: [
        "Executive, consulting, professional-service, or regional office users that want a polished suburban setting.",
        "Leadership-heavy teams comparing southeast access against central Denver or Cherry Creek identity.",
        "Businesses that need visitor arrival and office image but do not require downtown walkability.",
      ],
      mayNotFit: [
        "Companies whose clients expect a downtown, Cherry Creek, or more recognized DTC address.",
        "Teams that need industrial utility, retail visibility, medical infrastructure, or transit-first employee access.",
        "Users that prioritize campus scale or expansion more than executive presentation.",
      ],
      buildingExperience: "Evaluate The Point at Inverness by client arrival, office presentation, parking, visitor access, and whether the suburban executive setting supports the company's customer and leadership patterns.",
      locationContext: "The Point at Inverness gives the district an image-sensitive office example. Compare 365 Inverness Pkwy for practical professional-office fit, Cascades for larger campus scale, and DTC or Cherry Creek when address signal matters more.",
      advantages: [
        "Adds executive-office evidence to the Inverness business-park collection.",
        "Supports client-facing comparison against DTC, Greenwood Village, and Cherry Creek.",
        "Clarifies when suburban image and parking can substitute for downtown centrality.",
      ],
      tradeoffs: [
        "Suburban executive image may not carry the same client signal as DTC, Cherry Creek, or Downtown Denver.",
        "Visitor arrival, parking, signage, and suite condition require property-level validation.",
        "The profile does not establish current availability, tenant suitability, or specialized buildout.",
      ],
      operationalProfile: [
        { label: "Client arrival", summary: "Validate whether parking, entry, wayfinding, and building image support the desired visitor experience." },
        { label: "Executive setting", summary: "Compare the building's suburban presentation against DTC, Cherry Creek, and downtown office alternatives." },
        { label: "Office usability", summary: "Confirm layout, meeting rooms, privacy, and daily access before treating image as enough." },
      ],
      environmentExplanation: {
        whyItExists: "Executive office environments serve teams that need professional image and visitor comfort without choosing a central urban district.",
        whyChooseThisEnvironment: "Choose this environment when southeast suburban image, parking, and client arrival fit the business better than downtown centrality.",
        representativeValue: "The Point at Inverness gives the collection its southeast executive office benchmark.",
      },
      nearbyAlternatives: [
        { label: "365 Inverness Pkwy", url: buildingPath("365 Inverness Pkwy"), reason: "Compare when practical professional-office utility matters more than executive image." },
        { label: "Cascades", url: buildingPath("6300 S Syracuse Way"), reason: "Compare when larger campus scale matters more than client-facing presentation." },
        { label: "Denver Tech Center", url: "/commercial-real-estate/CO/denver/denver-tech-center/", reason: "Compare when stronger southeast office identity and corporate market depth matter more." },
      ],
      validationNotes: [
        "Does the building presentation match client, leadership, and recruiting expectations?",
        "Are visitor parking, arrival, signage, entry, and accessibility practical?",
        "Does the suite support meeting, privacy, and daily office requirements?",
        "Would DTC, Cherry Creek, or Downtown Denver create a stronger client-facing signal?",
      ],
      ecosystemSubtypes: ["executive_office", "professional_office", "suburban_business_park"],
      representativeRole: "executive_office_environment",
      businessActivities: ["client_meetings", "knowledge_work", "administrative_operations"],
      businessArchetypes: ["professional_office", "consulting_firm", "regional_office"],
      operationalCharacteristics: ["professional_image", "customer_parking", "suburban_access", "private_office_layout"],
      fitSummary: "Useful for executive and client-facing users comparing suburban office image with southeast access.",
      sourceNotes: ["Rofo Knowledge Graph identifies The Point at Inverness as an Inverness representative executive office environment."],
    },
  }),
];

module.exports = {
  canonicalBuildings: records,
};
