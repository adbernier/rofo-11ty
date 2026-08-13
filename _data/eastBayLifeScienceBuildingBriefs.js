function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildingPath(address) {
  return `/commercial-real-estate/building/CA/emeryville/${slugify(address)}/`;
}

const district = {
  id: "emeryville-commercial-core",
  name: "Emeryville Commercial Core",
  slug: "emeryville-commercial-core",
  city: "Emeryville",
  state_abbr: "CA",
  area_type: "district",
  path: "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/",
};

const relatedDistricts = [
  { label: "West Berkeley", url: "/commercial-real-estate/CA/berkeley/west-berkeley/", reason: "Compare when flex, maker, and production-oriented character matters more than a structured Powell Street campus setting." },
  { label: "Downtown Berkeley", url: "/commercial-real-estate/CA/berkeley/downtown-berkeley/", reason: "Compare when BART access, walkability, and UC Berkeley adjacency matter more than freeway-oriented campus context." },
  { label: "Jack London Square", url: "/commercial-real-estate/CA/oakland/jack-london-square/", reason: "Compare when Oakland waterfront identity and customer-facing creative-office context matter more than Life Science adjacency." },
];

const relatedInsights = [
  { title: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", summary: "Use location fit, access, employees, operations, and validation needs before narrowing the building list." },
  { title: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", summary: "Compare buildings by business fit, total occupancy cost, access, buildout, and future flexibility." },
  { title: "Tenant Improvements", url: "/commercial-real-estate/lease-guide/tenant-improvements/", summary: "Pressure-test buildout scope, technical requirements, timing, approvals, and improvement responsibility." },
];

function brief(fields) {
  return {
    status: "published",
    ecosystemContext: fields.ecosystemContext,
    businessFit: {
      archetypes: fields.businessArchetypes,
      activities: fields.businessActivities,
      fitSummary: fields.fitSummary,
    },
    operationalProfile: fields.operationalProfile,
    environmentExplanation: fields.environmentExplanation,
    comparisonContext: { relatedDistricts },
    evidence: {
      confidence: "editorially_supported",
      provenance: {
        ecosystem: "commercial-market-discovery-and-knowledge-graph",
        operationalCharacteristics: "representative-building-intelligence",
        editorialInterpretation: "building-brief",
      },
      sourceNotes: fields.sourceNotes,
    },
    summary: fields.summary,
    rofoTake: fields.rofoTake,
    buildingSummary: fields.summary,
    buildingImportance: fields.rofoTake,
    snapshot: fields.quickFacts,
    quickFacts: fields.quickFacts,
    bestFit: fields.idealFor,
    idealFor: fields.idealFor,
    mayNotFit: fields.mayNotFit,
    buildingExperience: fields.buildingExperience,
    locationContext: fields.districtContext,
    districtContext: fields.districtContext,
    advantages: fields.advantages,
    tradeoffs: fields.tradeoffs,
    validationNotes: fields.validationNotes,
    validationChecklist: fields.validationNotes,
    nearbyDistricts: relatedDistricts,
    nearbyAlternatives: fields.nearbyAlternatives,
    relatedInsights,
    representativeCompanies: fields.representativeCompanies,
    ecosystemSubtypes: fields.ecosystemSubtypes,
    representativeRole: fields.representativeRole,
    businessActivities: fields.businessActivities,
    businessArchetypes: fields.businessArchetypes,
    operationalCharacteristics: fields.operationalCharacteristics,
    fitSummary: fields.fitSummary,
    confidence: "editorially_supported",
    sourceNotes: fields.sourceNotes,
  };
}

function record(fields) {
  const buildingBrief = brief(fields.brief);
  return {
    id: `east-bay-life-science-${slugify(fields.address)}`,
    building_path: buildingPath(fields.address),
    identity: {
      name: fields.address,
      address: fields.address,
      city: "Emeryville",
      state_abbr: "CA",
      district: district.name,
      canonicalDistrict: district,
      secondaryDistricts: [],
      buildingType: fields.buildingType,
      primarySpaceType: "office",
      assetClass: "Representative Building",
    },
    editorial: {
      editorialRole: fields.editorialRole,
      editorialReason: fields.editorialReason,
      representativeThemes: fields.representativeThemes,
    },
    business: {
      businessFit: fields.businessFit,
      idealCompanyProfiles: buildingBrief.idealFor,
      companySizes: ["growing teams", "regional teams", "research-support teams"],
    },
    experience: {
      workplaceCharacter: fields.workplaceCharacter,
      neighborhoodCharacter: "Powell Street campus-style commercial setting within Emeryville Commercial Core.",
      executivePresence: "medium",
      innovationScore: "moderate",
    },
    operations: {
      transit: "Regional access and employee travel should be tested against the team's actual commute pattern.",
      parking: "Parking allocation, visitor arrival, accessible spaces, and after-hours access require direct validation.",
      amenities: "Nearby Emeryville services support the setting, but exact convenience depends on the building and travel mode.",
      foodEnvironment: "Nearby food and service options are supporting context rather than proof of building fit.",
    },
    tradeoffs: {
      strengths: buildingBrief.advantages,
      limitations: buildingBrief.tradeoffs,
      businessesThatShouldCompare: buildingBrief.mayNotFit,
      nearbyAlternatives: relatedDistricts.map((item) => item.url),
    },
    validation: {
      questionsToValidate: buildingBrief.validationNotes,
      tourObservations: buildingBrief.validationNotes.slice(0, 3),
    },
    relationships: {
      nearbyBuildings: [],
      comparisonBuildings: fields.comparisonBuildings,
      relatedDistricts: relatedDistricts.map((item) => item.url),
    },
    quality: {
      sourceConfidence: "medium",
      publicationStatus: "published",
      sourceBasis: "East Bay Life Science Ecosystem Completion",
    },
    buildingBrief,
  };
}

const records = [
  record({
    address: "2100 Powell St",
    buildingType: "Powell Street office building",
    editorialRole: "Life Science Support Office Comparison",
    editorialReason: "Provides an office-first Powell Street comparison for Life Science teams whose requirement may center on administration and collaboration rather than specialized lab infrastructure.",
    representativeThemes: ["Office", "Life Science support", "Powell Street", "Campus comparison"],
    businessFit: ["professional office", "research administration", "Life Science support office"],
    workplaceCharacter: "Structured Emeryville office setting for teams evaluating campus adjacency without assuming specialized research infrastructure.",
    comparisonBuildings: [buildingPath("2200 Powell St")],
    brief: {
      ecosystemContext: { primaryEcosystem: "office", secondaryEcosystems: ["life_science"], ecosystemSubtypes: ["professional_office", "office_campus"], representativeRole: "suburban_office_campus" },
      summary: "2100 Powell St is an office-first Building Profile in Emeryville's Powell Street corridor. It helps Life Science support, administrative, and professional teams compare a structured East Bay office setting with nearby campus, university-adjacent, flex, and Oakland waterfront alternatives before validating a specific suite.",
      rofoTake: "Use 2100 Powell St to test whether the requirement is fundamentally office-oriented. The building provides Emeryville campus context, but it should not be treated as evidence of lab readiness, research infrastructure, or current availability. Teams needing technical space should separate location fit from property-level systems diligence.",
      quickFacts: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Secondary context", value: "Life Science support and research administration" },
        { label: "District", value: district.name },
        { label: "Representative role", value: "Powell Street office-campus comparison" },
        { label: "Evidence basis", value: "Canonical representative record and Emeryville district context" },
        { label: "Validation boundary", value: "No lab, technical-infrastructure, availability, parking, or suite-condition claim" },
      ],
      idealFor: [
        "Research administration, business operations, and professional teams that need Emeryville Life Science adjacency without confirmed lab space.",
        "Growing office users comparing Powell Street with Downtown Berkeley, West Berkeley, and Oakland alternatives.",
        "Teams that value a structured campus-style setting and regional access more than a walkable downtown identity.",
      ],
      mayNotFit: [
        "Research users that require wet-lab systems, specialized ventilation, backup power, or other technical infrastructure without direct verification.",
        "Teams whose decision depends primarily on BART access, maker or production space, waterfront identity, or walkable downtown amenities.",
      ],
      buildingExperience: "Evaluate the building as an office environment first: arrival, floorplate, collaboration areas, employee access, parking strategy, services, and expansion path. Any Life Science use beyond administrative or support functions needs separate technical and permitted-use diligence.",
      districtContext: "2100 Powell St sits in Emeryville Commercial Core, where Powell Street office buildings support comparison with the district's broader Life Science and R&D context. West Berkeley offers more flex and production character, Downtown Berkeley offers stronger BART and university-downtown access, and Jack London Square offers Oakland waterfront identity.",
      advantages: ["Creates an office-first comparison inside Emeryville's Life Science district foundation.", "Supports East Bay access and campus-context evaluation without inventing technical property facts.", "Provides a direct contrast with the Life Science campus-support role assigned to 2200 Powell St."],
      tradeoffs: ["Office form and district adjacency do not establish lab or research-space capability.", "Parking, transit usefulness, suite condition, access, services, and economics require current validation.", "Teams needing stronger flex, university, or Oakland identity may prefer another district."],
      validationNotes: ["Confirm the current suite layout, condition, access, services, and availability.", "Determine whether the use is office support or requires lab, ventilation, power, plumbing, security, or permitted-use review.", "Validate employee commute, visitor arrival, parking allocation, and accessibility.", "Compare 2200 Powell St and nearby districts before treating Powell Street as the final location choice."],
      nearbyAlternatives: [
        { label: "2200 Powell St", url: buildingPath("2200 Powell St"), reason: "Compare for a Life Science campus-support benchmark in the same Powell Street setting." },
        relatedDistricts[0],
        relatedDistricts[1],
      ],
      representativeCompanies: ["Relevant categories include research administration, biotech support, professional office, and startup teams.", "These categories describe environmental fit and do not identify current occupants."],
      ecosystemSubtypes: ["professional_office", "office_campus"],
      representativeRole: "suburban_office_campus",
      businessActivities: ["knowledge_work", "collaboration", "administrative_operations"],
      businessArchetypes: ["professional_office", "consulting_firm", "startup", "research_company"],
      operationalCharacteristics: ["campus_environment", "professional_image", "large_floorplates"],
      fitSummary: "Office-first fit for Life Science support and administrative teams that want Emeryville campus context.",
      sourceNotes: ["The Knowledge Graph identifies 2100 Powell St as a Powell Street office-campus representative.", "Commercial Market Discovery supports Emeryville as a material Life Science and R&D-support node while leaving building-specific technical suitability unresolved."],
      operationalProfile: [{ label: "Office-first role", summary: "Treat the building as an office comparison unless technical capabilities are verified separately." }, { label: "Campus context", summary: "Use Powell Street to compare structured Emeryville access with Berkeley and Oakland alternatives." }, { label: "Technical boundary", summary: "Validate every lab, infrastructure, permitted-use, security, and suite requirement directly." }],
      environmentExplanation: { whyItExists: "Life Science ecosystems also need administrative, collaboration, and professional office environments alongside technical research space.", whyChooseThisEnvironment: "Choose this environment when Emeryville adjacency and office function matter more than confirmed lab infrastructure.", representativeValue: "2100 Powell St provides the office-first comparison within the bounded Powell Street Building Brief set." },
    },
  }),
  record({
    address: "2200 Powell St",
    buildingType: "Office / Life Science support building",
    editorialRole: "Life Science Campus Support Benchmark",
    editorialReason: "Gives Emeryville's Life Science district foundation a campus-oriented Building Profile while keeping all technical capability claims subject to validation.",
    representativeThemes: ["Life Science support", "Innovation campus", "Powell Street", "Research adjacency"],
    businessFit: ["Life Science support", "research company", "biotech office", "startup"],
    workplaceCharacter: "Campus-oriented Emeryville support environment for research and biotech teams evaluating location fit before technical diligence.",
    comparisonBuildings: [buildingPath("2100 Powell St")],
    brief: {
      ecosystemContext: { primaryEcosystem: "life_science", secondaryEcosystems: ["office"], ecosystemSubtypes: ["innovation_campus", "life_science_office"], representativeRole: "life_science_campus" },
      summary: "2200 Powell St is a campus-oriented Life Science support Building Profile in Emeryville Commercial Core. It gives research, biotech, startup, and administrative teams a concrete East Bay comparison while making clear that lab infrastructure, permitted use, suite condition, security, parking, and availability require direct property validation.",
      rofoTake: "This building matters as an Emeryville campus-support benchmark, not as proof of lab-ready space. Use it to compare location, workforce access, collaboration context, and district identity. Then validate ventilation, power, plumbing, security, backup systems, permitted use, and buildout requirements before relying on technical fit.",
      quickFacts: [{ label: "Primary ecosystem", value: "Life Science" }, { label: "Subtypes", value: "Innovation campus and Life Science office" }, { label: "District", value: district.name }, { label: "Representative role", value: "Life Science campus support benchmark" }, { label: "Evidence basis", value: "Knowledge Graph, Commercial Market Discovery, and Representative Building Intelligence" }, { label: "Validation boundary", value: "Campus context only; no lab-ready or availability claim" }],
      idealFor: ["Research and biotech teams comparing Emeryville for campus adjacency, collaboration, and regional East Bay access.", "Life Science office and support functions that do not require unverified technical infrastructure to establish initial location fit.", "Startups evaluating Emeryville against Berkeley flex, university-downtown access, and Oakland office alternatives."],
      mayNotFit: ["Wet-lab, clinical, manufacturing, or specialized research users that need technical systems confirmed before shortlisting.", "Businesses that prioritize walkable BART access, production-oriented flex, or Oakland waterfront identity over campus context."],
      buildingExperience: "Treat a tour as a two-stage evaluation. First test campus setting, arrival, employee access, collaboration, floorplate, services, and expansion logic. Then complete technical diligence for lab use, ventilation, power, plumbing, security, backup systems, hazardous-material handling, and permitted use where relevant.",
      districtContext: "2200 Powell St anchors the campus-support side of Emeryville Commercial Core. The district has strong external Life Science and R&D evidence, but individual properties vary. Compare 2100 Powell St for an office-first alternative, West Berkeley for flex and production character, and Downtown Berkeley for university-downtown and BART access.",
      advantages: ["Adds canonical Building Brief depth to East Bay Life Science coverage.", "Explains Emeryville's campus-support decision without claiming technical property capabilities.", "Creates a concrete comparison path between Powell Street office support, Berkeley flex, and university-adjacent settings."],
      tradeoffs: ["Campus and district evidence do not prove wet-lab or research infrastructure in a current suite.", "Technical buildout, security, utilities, parking, access, economics, and availability remain property-specific.", "Some teams may get a clearer fit from West Berkeley production/flex or Downtown Berkeley transit context."],
      validationNotes: ["Confirm permitted use and whether the current suite can support the intended office, research, or laboratory function.", "Verify ventilation, power, plumbing, backup systems, security, life-safety, and hazardous-material requirements where applicable.", "Validate suite configuration, expansion options, parking, transit, accessibility, visitor arrival, and after-hours access.", "Confirm current availability, economics, buildout responsibility, and delivery timing through live market investigation."],
      nearbyAlternatives: [{ label: "2100 Powell St", url: buildingPath("2100 Powell St"), reason: "Compare for an office-first Powell Street environment with Life Science support context." }, relatedDistricts[0], relatedDistricts[1]],
      representativeCompanies: ["Relevant categories include research companies, biotech companies, startups, and Life Science support teams.", "These categories describe decision fit and are not claims about current tenants."],
      ecosystemSubtypes: ["innovation_campus", "life_science_office"],
      representativeRole: "life_science_campus",
      businessActivities: ["research", "product_development", "collaboration", "administrative_operations"],
      businessArchetypes: ["research_company", "biotech_company", "startup"],
      operationalCharacteristics: ["campus_environment", "transit_access", "research_compatible", "enhanced_security"],
      fitSummary: "Campus-support fit for Life Science teams comparing Emeryville before property-level technical validation.",
      sourceNotes: ["The Knowledge Graph identifies 2200 Powell St as Emeryville's Life Science campus-support representative.", "Commercial Market Discovery supports Emeryville as a strong Life Science and R&D-support cluster while requiring building-specific technical validation."],
      operationalProfile: [{ label: "Campus context", summary: "Use the profile to evaluate Emeryville location, collaboration, access, and workforce fit." }, { label: "Research compatibility", summary: "Treat research compatibility as a diligence question, not a verified building capability." }, { label: "Technical validation", summary: "Confirm systems, permitted use, security, suite condition, and delivery timing directly." }],
      environmentExplanation: { whyItExists: "Life Science campus-support environments connect research teams with office, collaboration, talent, and regional-access context.", whyChooseThisEnvironment: "Choose this environment when Emeryville's Life Science cluster and campus setting matter before suite-level technical diligence.", representativeValue: "2200 Powell St gives East Bay Life Science coverage a concrete campus-support Building Profile." },
    },
  }),
];

module.exports = { canonicalBuildings: records };
