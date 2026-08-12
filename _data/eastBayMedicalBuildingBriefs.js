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
  return `/commercial-real-estate/building/CA/oakland/${slugify(address)}/`;
}

const oaklandMedicalDistrict = {
  id: "oakland-medical-campuses",
  name: "Oakland Medical Campuses",
  slug: "oakland-medical-campuses",
  city: "Oakland",
  state_abbr: "CA",
  area_type: "district",
  path: "/commercial-real-estate/CA/oakland/oakland-medical-campuses/",
};

const relatedDistricts = [
  {
    label: "Jack London Square",
    url: "/commercial-real-estate/CA/oakland/jack-london-square/",
    reason: "Compare when waterfront identity, service-commercial context, and creative office setting matter more than medical-campus adjacency.",
  },
  {
    label: "Downtown Berkeley",
    url: "/commercial-real-estate/CA/berkeley/downtown-berkeley/",
    reason: "Compare when BART access, UC Berkeley adjacency, and a university downtown setting are stronger than Oakland medical proximity.",
  },
  {
    label: "Emeryville Commercial Core",
    url: "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/",
    reason: "Compare when parking-friendly office, life-science adjacency, and campus-style East Bay access matter more.",
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

function medicalBrief(fields) {
  const snapshot = fields.snapshot || [];
  const bestFit = fields.bestFit || [];
  const validationNotes = fields.validationNotes || [];

  return {
    status: "published",
    ecosystemContext: {
      primaryEcosystem: "medical",
      secondaryEcosystems: ["office"],
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
        ecosystem: "commercial-market-discovery-and-knowledge-graph",
        operationalCharacteristics: "representative-building-intelligence",
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
  const brief = medicalBrief(fields.brief);

  return {
    id: `east-bay-medical-${slugify(fields.address)}`,
    building_path: path,
    identity: {
      name: fields.name,
      address: fields.address,
      city: "Oakland",
      state_abbr: "CA",
      district: oaklandMedicalDistrict.name,
      canonicalDistrict: oaklandMedicalDistrict,
      secondaryDistricts: fields.secondaryDistricts || [],
      buildingType: fields.buildingType || "Healthcare-adjacent medical / professional office",
      primarySpaceType: "medical",
      assetClass: "Representative Medical Building",
    },
    editorial: {
      editorialRole: fields.editorialRole,
      editorialReason: fields.editorialReason,
      representativeThemes: fields.representativeThemes,
    },
    business: {
      businessFit: fields.businessFit,
      idealCompanyProfiles: brief.idealFor,
      companySizes: fields.companySizes || ["medical practices", "wellness providers", "healthcare-adjacent office users"],
    },
    experience: {
      workplaceCharacter: "Oakland healthcare-adjacent office setting where patient access, professional image, transit, parking, and suite-specific medical suitability shape fit.",
      neighborhoodCharacter: "Foundation-stage Oakland medical-campus district with healthcare, professional office, patient-service, and nearby urban commercial context.",
      executivePresence: "medium",
      innovationScore: "moderate",
    },
    operations: {
      transit: "Oakland transit and regional access can matter for patients, staff, and administrative teams, but usefulness depends on the exact origin pattern.",
      parking: "Patient, visitor, employee, accessible, and provider parking must be validated directly for the current suite and use.",
      amenities: "Nearby medical, office, service, and Oakland urban amenities support the context, but suitability depends on appointment patterns and staff needs.",
      foodEnvironment: "Food and service options are supporting context rather than the reason to choose a medical-office setting.",
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
      nearbyBuildings: [],
      comparisonBuildings: [
        "/commercial-real-estate/CA/oakland/jack-london-square/",
        "/commercial-real-estate/CA/berkeley/downtown-berkeley/",
        "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/",
      ],
      relatedDistricts: relatedDistricts.map((item) => item.url),
    },
    quality: {
      sourceConfidence: fields.sourceConfidence || "medium",
      publicationStatus: "published",
      sourceBasis: "East Bay Medical Ecosystem Building Brief Migration",
    },
    buildingBrief: brief,
  };
}

const records = [
  record({
    name: "1 Kaiser Plz",
    address: "1 Kaiser Plz",
    editorialRole: "Healthcare-Adjacent Medical Office Reference",
    editorialReason: "Gives East Bay medical coverage a concrete Oakland professional-office example tied to medical-campus proximity while preserving clinical-buildout validation.",
    representativeThemes: ["Medical office", "Healthcare adjacency", "Oakland medical campuses", "Patient access", "Professional office"],
    businessFit: ["medical office", "healthcare administration", "wellness practice", "patient-service office"],
    brief: {
      summary: "1 Kaiser Plz is an East Bay Building Profile for medical-office, wellness, and healthcare-adjacent users comparing Oakland medical-campus proximity. It helps teams evaluate professional image, patient or visitor arrival, transit, parking, and suite validation without assuming any current clinical buildout or availability.",
      rofoTake: "This profile matters because East Bay medical coverage already has a district and representative-building foundation, but needed a canonical Building Brief. 1 Kaiser Plz explains the healthcare-adjacent office decision in Oakland while keeping permitted medical use, patient flow, plumbing, accessibility, and suite condition as diligence items.",
      snapshot: [
        { label: "Primary ecosystem", value: "Medical" },
        { label: "Secondary context", value: "Professional office and healthcare-adjacent administration" },
        { label: "District", value: "Oakland Medical Campuses" },
        { label: "Access context", value: "Oakland medical-campus proximity, urban transit, and regional patient geography" },
        { label: "Evidence role", value: "Healthcare-adjacent medical office reference" },
        { label: "Validation context", value: "Permitted use, patient access, parking, accessibility, plumbing, and suite condition require verification" },
      ],
      bestFit: [
        "Medical, wellness, or healthcare-adjacent office users that need Oakland medical-campus proximity and professional office context.",
        "Healthcare administration, patient-service, or provider-support teams comparing access for patients, staff, and regional visitors.",
        "Practices that want an East Bay medical-office reference before comparing Jack London Square, Downtown Berkeley, or Emeryville.",
      ],
      mayNotFit: [
        "Users that need confirmed exam-room infrastructure, specialized clinical systems, surgery, lab use, or outpatient-clinic buildout without direct property validation.",
        "General office users whose decision is driven by waterfront identity, university adjacency, campus parking, or creative-office positioning.",
        "Retail, industrial, or service-vehicle users that need storefront demand, loading, yard, production, or warehouse utility.",
      ],
      buildingExperience: "Evaluate 1 Kaiser Plz by patient and visitor arrival, staff commute, privacy, suite layout, accessibility, parking plan, and how strongly medical-campus proximity matters to the business model. Current clinical readiness must be verified directly.",
      locationContext: "1 Kaiser Plz supports the Oakland Medical Campuses district by giving Rofo a healthcare-adjacent office example. It should be compared with Jack London Square for non-medical Oakland office context, Downtown Berkeley for BART and university adjacency, and Emeryville for campus-style office or life-science-adjacent alternatives.",
      advantages: [
        "Adds canonical Building Brief depth to East Bay medical ecosystem coverage.",
        "Explains healthcare-adjacent professional-office fit without over-claiming suite-level medical infrastructure.",
        "Creates a practical comparison path across Oakland medical, Jack London Square, Downtown Berkeley, and Emeryville settings.",
      ],
      tradeoffs: [
        "Healthcare adjacency and office form do not prove clinical buildout, plumbing, patient flow, or permitted medical use.",
        "Parking allocation, accessibility, drop-off, signage, elevator path, and suite privacy must be validated for the specific requirement.",
        "Users not tied to patient access or healthcare proximity may get a clearer fit from office, retail, or industrial/flex districts.",
      ],
      operationalProfile: [
        { label: "Medical-office context", summary: "Use this profile when healthcare proximity, patient access, and professional office presentation shape the location decision." },
        { label: "Patient logistics", summary: "Validate parking, drop-off, accessibility, transit path, signage, privacy, and suite arrival before relying on fit." },
        { label: "Comparison path", summary: "Compare Oakland medical adjacency against Jack London Square, Downtown Berkeley, and Emeryville when the use is not strictly medical." },
      ],
      environmentExplanation: {
        whyItExists: "Medical-office environments exist where patient access, healthcare adjacency, privacy, administration, and buildout validation matter more than generic office positioning.",
        whyChooseThisEnvironment: "Choose this environment when Oakland medical-campus proximity and patient or healthcare-adjacent access are central to the requirement.",
        representativeValue: "1 Kaiser Plz gives East Bay medical coverage a concrete healthcare-adjacent office reference.",
      },
      nearbyAlternatives: [
        { label: "Jack London Square", url: "/commercial-real-estate/CA/oakland/jack-london-square/", reason: "Compare when Oakland waterfront office and service-commercial identity matter more than medical adjacency." },
        { label: "Downtown Berkeley", url: "/commercial-real-estate/CA/berkeley/downtown-berkeley/", reason: "Compare when BART access and UC Berkeley downtown context matter more." },
        { label: "Emeryville Commercial Core", url: "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/", reason: "Compare when campus-style office access and parking are stronger priorities." },
      ],
      validationNotes: [
        "Does the current suite support the intended medical, wellness, administrative, or patient-service use?",
        "Are permitted use, accessibility, privacy, plumbing, HVAC, signage, and patient-flow needs supportable?",
        "How do parking, drop-off, transit, and staff commute patterns work for the expected patient geography?",
        "Would Jack London Square, Downtown Berkeley, or Emeryville better match a non-medical office or service requirement?",
      ],
      representativeCompanies: [
        "Medical practices, wellness providers, healthcare administration, and patient-service offices are the relevant categories.",
        "Named tenants, availability, clinical infrastructure, and suite-specific suitability require current verification.",
      ],
      ecosystemSubtypes: ["medical_office", "hospital_adjacent", "wellness", "outpatient_clinic"],
      representativeRole: "medical_office_environment",
      businessActivities: ["healthcare_delivery", "administrative_operations", "walk_in_service"],
      businessArchetypes: ["medical_practice", "wellness_practice", "outpatient_clinic", "physical_therapy_practice", "dental_practice"],
      operationalCharacteristics: ["customer_parking", "private_office_layout", "professional_image", "hospital_adjacent", "medical_use_compatible", "transit_access", "plumbing_intensive"],
      fitSummary: "Best for medical-office, wellness, healthcare-adjacent, and patient-service users that need Oakland medical-campus proximity with professional office validation.",
      sourceNotes: [
        "The East Bay Commercial Market Discovery artifact identifies Kaiser Oakland as a medical source context.",
        "The Knowledge Graph identifies 1 Kaiser Plz as an Oakland Medical Campuses representative building.",
      ],
    },
  }),
];

module.exports = {
  canonicalBuildings: records,
};
