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
  return `/commercial-real-estate/building/CO/aurora/${slugify(address)}/`;
}

const auroraDistrict = {
  id: "co-aurora",
  name: "Aurora",
  slug: "aurora",
  city: "Aurora",
  state_abbr: "CO",
  area_type: "district",
  path: "/commercial-real-estate/CO/aurora/aurora/",
};

const relatedDistricts = [
  {
    label: "Central Park",
    url: "/commercial-real-estate/CO/denver/central-park/",
    reason: "Compare when northeast Denver medical, service, and mixed commercial context matters more than Aurora-specific patient geography.",
  },
  {
    label: "Centennial",
    url: "/commercial-real-estate/CO/centennial/centennial/",
    reason: "Compare when south metro medical, professional-service, or parking-oriented customer geography is the better fit.",
  },
  {
    label: "Aurora I-70 / Airport Industrial",
    url: "/commercial-real-estate/CO/aurora/aurora-i-70-airport-industrial/",
    reason: "Compare when the requirement shifts from patient-facing medical or service use toward warehouse, service-industrial, or airport-adjacent operations.",
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
  const brief = medicalBrief(fields.brief);

  return {
    id: `co-aurora-${slugify(fields.address)}`,
    building_path: path,
    identity: {
      name: fields.name,
      address: fields.address,
      city: "Aurora",
      state_abbr: "CO",
      district: auroraDistrict.name,
      canonicalDistrict: auroraDistrict,
      secondaryDistricts: fields.secondaryDistricts || [],
      buildingType: fields.buildingType || "Medical / professional office",
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
      companySizes: fields.companySizes || ["medical practices", "wellness providers", "patient-facing service businesses"],
    },
    experience: {
      workplaceCharacter: "Aurora medical and service-commercial setting where patient access, parking, and east-metro customer geography shape fit.",
      neighborhoodCharacter: "Parking-oriented east metro commercial context with medical, wellness, service, office, and industrial alternatives nearby.",
      executivePresence: "medium",
      innovationScore: "moderate",
    },
    operations: {
      transit: "Aurora and east Denver access are the main location story; patient, employee, and vendor routes should be checked against the practice geography.",
      parking: "Patient, visitor, employee, accessible, and provider parking are property-specific validation items.",
      amenities: "Nearby services matter by patient visit pattern, employee commute, and referral geography rather than as generic lifestyle amenities.",
      foodEnvironment: "Food and service options should be evaluated as support context, not the reason to choose the building.",
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
      sourceBasis: "Aurora Commercial Market Evidence district-building mission",
    },
    buildingBrief: brief,
  };
}

const records = [
  record({
    name: "12375 E Cornell Ave",
    address: "12375 E Cornell Ave",
    editorialRole: "Patient-Facing Medical Access Benchmark",
    editorialReason: "Gives Aurora a patient-facing medical and clinic reference for parking-oriented east metro access.",
    representativeThemes: ["Medical office", "Outpatient clinic", "Patient access", "Aurora customer geography"],
    businessFit: ["outpatient clinic", "medical practice", "physical therapy practice", "wellness practice"],
    nearbyBuildingPaths: [
      buildingPath("14201 - 14291 E 4th Avenue"),
      buildingPath("2821-2851 South Parker Road"),
    ],
    comparisonBuildingPaths: [
      buildingPath("14201 - 14291 E 4th Avenue"),
      buildingPath("2821-2851 South Parker Road"),
      "/commercial-real-estate/building/CO/denver/3401-quebec-street-suite-9000/",
    ],
    brief: {
      summary: "12375 E Cornell Ave is an Aurora Building Profile for medical, wellness, and patient-facing clinic users comparing east metro access. It helps a practice evaluate Aurora patient geography, parking-oriented arrival, and service convenience without assuming that any specific suite is currently built out or available.",
      rofoTake: "This profile matters because Aurora's broader district evidence needs a patient-facing medical benchmark separate from the existing industrial/flex foundation. 12375 E Cornell Ave helps Rofo explain when Aurora may fit outpatient, therapy, wellness, or local medical users before comparing Central Park, Centennial, or Cherry Creek alternatives.",
      snapshot: [
        { label: "Primary ecosystem", value: "Medical" },
        { label: "Business use", value: "Outpatient clinic and medical-office comparison" },
        { label: "District", value: "Aurora" },
        { label: "Access context", value: "East metro patient and customer geography" },
        { label: "Evidence role", value: "Patient-facing medical access benchmark" },
        { label: "Validation context", value: "Permitted medical use, accessibility, parking, plumbing, and current suite condition require verification" },
      ],
      bestFit: [
        "Medical, therapy, wellness, or outpatient users serving Aurora and east metro patients.",
        "Practices that need parking-oriented access and local patient convenience more than a downtown office address.",
        "Healthcare-adjacent service users comparing Aurora against Central Park, Centennial, Cherry Creek, or hospital-adjacent settings.",
      ],
      mayNotFit: [
        "Practices requiring confirmed specialized clinical infrastructure, lab systems, surgical use, or hospital adjacency without direct property validation.",
        "Executive office users whose client expectations point toward Downtown Denver, Cherry Creek, or DTC.",
        "Industrial, warehouse, or service-vehicle users that need loading, yard, or operational space.",
      ],
      buildingExperience: "Evaluate this environment by patient arrival, parking, accessibility, privacy, signage, and whether the location matches the practice's service area. The profile is not evidence of current clinical buildout or availability.",
      locationContext: "12375 E Cornell Ave sits within Aurora's broader east metro commercial district. It should be compared with Clock Tower Square for neighborhood-facing visibility, Pavilion Towers for a more professional medical-office pattern, and Central Park or Centennial when another patient geography may fit better.",
      advantages: [
        "Adds patient-facing medical evidence to Aurora's broader district coverage.",
        "Helps separate Aurora medical/service fit from industrial/flex Aurora evidence.",
        "Supports comparison between Aurora, Central Park, Centennial, and Cherry Creek medical or wellness locations.",
      ],
      tradeoffs: [
        "Medical suitability depends on suite-level permitted use, accessibility, plumbing, HVAC, and layout.",
        "Parking allocation, signage rights, patient flow, and current availability are not implied by representative evidence.",
        "Users needing hospital adjacency or specialized clinical infrastructure may need a different medical node.",
      ],
      operationalProfile: [
        { label: "Patient access", summary: "Validate accessible parking, arrival sequence, signage, and whether patients can reach the location easily." },
        { label: "Clinical feasibility", summary: "Confirm permitted use, plumbing, HVAC, layout, privacy, and any specialty buildout requirements before shortlisting." },
        { label: "Aurora geography", summary: "Use the building to test whether Aurora's east metro patient geography fits the practice better than Denver-side or south metro alternatives." },
      ],
      environmentExplanation: {
        whyItExists: "Patient-facing medical environments exist where access, parking, professional setting, and clinical feasibility need to work together.",
        whyChooseThisEnvironment: "Choose this environment when Aurora patient geography and practical access matter more than central office image or industrial utility.",
        representativeValue: "12375 E Cornell Ave anchors the Aurora medical evidence collection as the patient-access benchmark.",
      },
      nearbyAlternatives: [
        { label: "Clock Tower Square", url: buildingPath("14201 - 14291 E 4th Avenue"), reason: "Compare when neighborhood-facing visibility and wellness-service context are more important." },
        { label: "Pavilion Towers", url: buildingPath("2821-2851 South Parker Road"), reason: "Compare when a more conventional medical-office environment may fit better." },
        { label: "Central Park", url: "/commercial-real-estate/CO/denver/central-park/", reason: "Compare when northeast Denver patient geography may be stronger than Aurora." },
      ],
      validationNotes: [
        "Is the intended medical, therapy, wellness, or outpatient use permitted in the current suite?",
        "Can accessibility, patient parking, arrival, privacy, and signage needs be supported?",
        "What plumbing, HVAC, exam-room, treatment, or buildout requirements must be confirmed?",
        "Would Central Park, Centennial, Cherry Creek, or a hospital-adjacent node better match the patient geography?",
      ],
      representativeCompanies: [
        "Medical practices, therapy providers, wellness users, and outpatient clinics are the relevant categories.",
        "Named tenants, live availability, and suite-specific clinical suitability require current verification.",
      ],
      ecosystemSubtypes: ["outpatient_clinic", "medical_office"],
      representativeRole: "outpatient_clinic_environment",
      businessActivities: ["healthcare_delivery", "walk_in_service", "administrative_operations"],
      businessArchetypes: ["outpatient_clinic", "medical_practice", "physical_therapy_practice"],
      operationalCharacteristics: ["customer_parking", "walk_in_customer_access", "suburban_access", "medical_use_compatible"],
      fitSummary: "Best for patient-facing medical and wellness users that need Aurora access and parking-oriented convenience.",
      sourceNotes: [
        "Rofo Knowledge Graph identifies 12375 E Cornell Ave as an Aurora representative medical and outpatient-clinic environment.",
        "Aurora Commercial Market Evidence selects the property as a patient-facing medical access benchmark.",
      ],
    },
  }),
  record({
    name: "Clock Tower Square",
    address: "14201 - 14291 E 4th Avenue",
    buildingType: "Medical / wellness service center",
    editorialRole: "Neighborhood-Facing Patient Service Benchmark",
    editorialReason: "Adds a neighborhood-facing medical, wellness, and service example for Aurora customer access and visibility.",
    representativeThemes: ["Medical office", "Wellness", "Neighborhood access", "Customer visibility"],
    businessFit: ["wellness practice", "outpatient clinic", "medical practice", "customer-facing service business"],
    nearbyBuildingPaths: [
      buildingPath("12375 E Cornell Ave"),
      buildingPath("2821-2851 South Parker Road"),
    ],
    comparisonBuildingPaths: [
      buildingPath("12375 E Cornell Ave"),
      buildingPath("2821-2851 South Parker Road"),
      "/commercial-real-estate/building/CO/denver/100-fillmore-place/",
    ],
    brief: {
      summary: "Clock Tower Square is an Aurora Building Profile for medical, wellness, and neighborhood-facing service users comparing patient access, visibility, and practical customer arrival. It helps a business evaluate whether Aurora service geography matters more than central office polish or industrial utility.",
      rofoTake: "This profile matters because Aurora's medical and service-commercial evidence should include a neighborhood-facing example, not only conventional medical office or industrial/flex buildings. Clock Tower Square helps explain how wellness, outpatient, and local service users may evaluate visibility, parking, access, and permitted use.",
      snapshot: [
        { label: "Primary ecosystem", value: "Medical" },
        { label: "Business use", value: "Wellness, outpatient, and neighborhood-service comparison" },
        { label: "District", value: "Aurora" },
        { label: "Access context", value: "Neighborhood-facing Aurora customer access" },
        { label: "Evidence role", value: "Neighborhood-facing patient service benchmark" },
        { label: "Validation context", value: "Visibility, signage, medical use, plumbing, accessibility, and current suite fit require verification" },
      ],
      bestFit: [
        "Wellness, therapy, outpatient, and service businesses that benefit from Aurora visibility and local access.",
        "Patient-facing users comparing customer arrival and signage needs before choosing a more conventional office setting.",
        "Businesses that need a practical Aurora service location without moving into industrial/flex geography.",
      ],
      mayNotFit: [
        "Private administrative users that do not need customer visibility or patient arrival.",
        "Medical users that need specialized clinical infrastructure that has not been validated at the suite level.",
        "Warehouse, contractor, or industrial users that need loading, yard, or vehicle-intensive operations.",
      ],
      buildingExperience: "Evaluate Clock Tower Square by how customers or patients find, enter, and use the location. The important questions are visibility, signage, parking, accessibility, suite layout, and whether the permitted use fits the operation.",
      locationContext: "Clock Tower Square broadens Aurora's district evidence beyond professional medical-office form. Compare it with 12375 E Cornell Ave for patient-access medical use, Pavilion Towers for professional medical office, and Cherry Creek or Central Park when a different customer-facing geography may be stronger.",
      advantages: [
        "Adds neighborhood-facing medical and wellness evidence to Aurora.",
        "Explains customer access and visibility as part of Aurora's commercial value.",
        "Creates a useful contrast against Aurora industrial/flex and conventional office environments.",
      ],
      tradeoffs: [
        "Visibility and neighborhood access do not confirm clinical infrastructure or permitted medical use.",
        "Signage, parking, accessibility, plumbing, and customer arrival must be validated in the current suite.",
        "Users seeking higher-image office identity or hospital adjacency may need other Denver-area alternatives.",
      ],
      operationalProfile: [
        { label: "Customer visibility", summary: "Confirm signage, frontage, wayfinding, and whether the location is easy for patients or customers to identify." },
        { label: "Service fit", summary: "Validate layout, accessibility, plumbing, privacy, and patient flow before treating the property as medical-ready." },
        { label: "Market comparison", summary: "Compare Aurora's local customer geography against Cherry Creek, Central Park, Centennial, or a hospital-adjacent node." },
      ],
      environmentExplanation: {
        whyItExists: "Neighborhood medical and wellness environments exist for users whose patients or customers need practical access, visibility, and convenience.",
        whyChooseThisEnvironment: "Choose this environment when Aurora customer access and neighborhood visibility are stronger drivers than downtown office identity or industrial utility.",
        representativeValue: "Clock Tower Square gives the Aurora collection its neighborhood-facing medical and wellness service benchmark.",
      },
      nearbyAlternatives: [
        { label: "12375 E Cornell Ave", url: buildingPath("12375 E Cornell Ave"), reason: "Compare when a more patient-access medical benchmark is more relevant." },
        { label: "Pavilion Towers", url: buildingPath("2821-2851 South Parker Road"), reason: "Compare when a conventional professional medical-office setting may fit better." },
        { label: "Cherry Creek", url: "/commercial-real-estate/CO/denver/cherry-creek/", reason: "Compare when polished customer-facing identity matters more than Aurora access." },
      ],
      validationNotes: [
        "Does the current suite allow the intended medical, wellness, or customer-facing service use?",
        "Can signage, visibility, accessibility, parking, and patient/customer arrival be supported?",
        "What plumbing, layout, privacy, HVAC, or treatment-room needs must be verified?",
        "Would Cherry Creek, Central Park, Centennial, or Pavilion Towers better fit the customer experience?",
      ],
      representativeCompanies: [
        "Wellness practices, outpatient clinics, therapy providers, and customer-facing service businesses are the relevant categories.",
        "Specific tenant identity, suite availability, and medical readiness require current verification.",
      ],
      ecosystemSubtypes: ["outpatient_clinic", "wellness", "medical_office"],
      representativeRole: "outpatient_clinic_environment",
      businessActivities: ["healthcare_delivery", "walk_in_service", "administrative_operations"],
      businessArchetypes: ["outpatient_clinic", "wellness_practice", "medical_practice"],
      operationalCharacteristics: ["customer_parking", "walk_in_customer_access", "street_visibility", "neighborhood_access", "medical_use_compatible"],
      fitSummary: "Best for wellness, outpatient, and service users that need Aurora visibility and local customer access.",
      sourceNotes: [
        "Rofo Knowledge Graph identifies Clock Tower Square as an Aurora representative outpatient, wellness, and medical-office environment.",
        "Aurora Commercial Market Evidence selects the property as a neighborhood-facing patient-service benchmark.",
      ],
    },
  }),
  record({
    name: "Pavilion Towers",
    address: "2821-2851 South Parker Road",
    editorialRole: "Professional Medical Office Benchmark",
    editorialReason: "Balances Aurora's medical/service evidence with a more conventional professional medical-office example.",
    representativeThemes: ["Medical office", "Professional healthcare", "Patient access", "Suburban access"],
    businessFit: ["medical practice", "dental practice", "wellness practice", "professional healthcare office"],
    nearbyBuildingPaths: [
      buildingPath("12375 E Cornell Ave"),
      buildingPath("14201 - 14291 E 4th Avenue"),
    ],
    comparisonBuildingPaths: [
      buildingPath("12375 E Cornell Ave"),
      buildingPath("14201 - 14291 E 4th Avenue"),
      "/commercial-real-estate/building/CO/denver/3401-quebec-street-suite-9000/",
    ],
    brief: {
      summary: "Pavilion Towers is an Aurora Building Profile for medical, dental, wellness, and professional healthcare users comparing a more conventional medical-office environment. It helps practices evaluate patient access, professional image, parking, and east metro reach before assuming any specific suite is clinically ready.",
      rofoTake: "This profile matters because Aurora's medical evidence needs a professional medical-office benchmark alongside neighborhood-facing service examples. Pavilion Towers helps explain when Aurora can support healthcare or wellness users that want a more office-like setting while keeping clinical buildout and permitted use as validation items.",
      snapshot: [
        { label: "Primary ecosystem", value: "Medical" },
        { label: "Business use", value: "Medical, dental, wellness, and professional healthcare office comparison" },
        { label: "District", value: "Aurora" },
        { label: "Access context", value: "East metro patient and professional-service geography" },
        { label: "Evidence role", value: "Professional medical office benchmark" },
        { label: "Validation context", value: "Patient flow, accessibility, parking, clinical buildout, and suite layout require verification" },
      ],
      bestFit: [
        "Medical, dental, wellness, or professional healthcare users that want an Aurora office environment.",
        "Practices comparing patient access and professional setting against neighborhood-service or retail-adjacent alternatives.",
        "Healthcare teams deciding whether east metro reach matters more than central Denver identity or hospital adjacency.",
      ],
      mayNotFit: [
        "Practices requiring confirmed specialty infrastructure, lab systems, surgery, or hospital adjacency without direct validation.",
        "Retail or showroom users that need stronger storefront identity and street-facing customer visibility.",
        "Industrial, warehouse, or service users needing loading, yard, or operational vehicle movement.",
      ],
      buildingExperience: "Evaluate Pavilion Towers by patient arrival, office layout, accessibility, privacy, parking, and whether the setting feels appropriate for the practice. Current suite condition and clinical readiness must be verified directly.",
      locationContext: "Pavilion Towers gives Aurora a professional medical-office comparison against 12375 E Cornell Ave and Clock Tower Square. It also helps users decide whether to remain in Aurora or compare Central Park, Cherry Creek, Centennial, or other Denver-area medical and service nodes.",
      advantages: [
        "Adds professional medical-office depth to Aurora's Building Profile coverage.",
        "Balances neighborhood-service evidence with a more office-oriented healthcare example.",
        "Supports practical comparisons across Aurora, Central Park, Centennial, and Cherry Creek.",
      ],
      tradeoffs: [
        "Professional medical-office form does not prove clinical buildout, patient flow, or permitted use.",
        "Parking allocation, accessibility, signage, and suite layout must be confirmed before relying on fit.",
        "Users needing hospital adjacency or specialized infrastructure may need a different medical cluster.",
      ],
      operationalProfile: [
        { label: "Professional medical setting", summary: "Validate whether the current office layout supports exam, consult, treatment, administrative, or wellness operations." },
        { label: "Patient logistics", summary: "Confirm parking, accessibility, elevator or entrance sequence, signage, and privacy expectations." },
        { label: "Comparison path", summary: "Use Pavilion Towers to compare Aurora medical-office fit against neighborhood-service examples and Denver-area medical alternatives." },
      ],
      environmentExplanation: {
        whyItExists: "Professional medical-office environments exist for healthcare users that need patient access, privacy, office function, and professional presentation to align.",
        whyChooseThisEnvironment: "Choose this environment when Aurora east metro reach and a medical-office setting matter more than retail visibility or industrial utility.",
        representativeValue: "Pavilion Towers gives the Aurora collection a professional medical-office benchmark.",
      },
      nearbyAlternatives: [
        { label: "12375 E Cornell Ave", url: buildingPath("12375 E Cornell Ave"), reason: "Compare when patient-access clinic context is more important." },
        { label: "Clock Tower Square", url: buildingPath("14201 - 14291 E 4th Avenue"), reason: "Compare when neighborhood-facing visibility and wellness-service context matter more." },
        { label: "Central Park", url: "/commercial-real-estate/CO/denver/central-park/", reason: "Compare when northeast Denver patient geography may be stronger." },
      ],
      validationNotes: [
        "Does the current suite support the intended medical, dental, wellness, or professional healthcare use?",
        "Are accessibility, parking, signage, privacy, plumbing, HVAC, and patient-flow needs supportable?",
        "What buildout, code, permitting, and landlord approval questions must be resolved before occupancy?",
        "Would another Aurora building, Central Park, Cherry Creek, or Centennial better match the patient geography?",
      ],
      representativeCompanies: [
        "Medical practices, dental practices, wellness providers, and professional healthcare offices are the relevant categories.",
        "Named tenants, current availability, and suite-specific medical suitability require current verification.",
      ],
      ecosystemSubtypes: ["medical_office"],
      representativeRole: "medical_office_environment",
      businessActivities: ["healthcare_delivery", "administrative_operations"],
      businessArchetypes: ["medical_practice", "dental_practice", "wellness_practice"],
      operationalCharacteristics: ["customer_parking", "private_office_layout", "professional_image", "suburban_access", "medical_use_compatible"],
      fitSummary: "Best for medical, dental, wellness, and healthcare-office users that need Aurora reach and professional medical-office context.",
      sourceNotes: [
        "Rofo Knowledge Graph identifies Pavilion Towers as an Aurora representative medical-office environment.",
        "Aurora Commercial Market Evidence selects the property as a professional medical-office benchmark.",
      ],
    },
  }),
];

module.exports = {
  district: auroraDistrict,
  canonicalBuildings: records,
  calibrationSet: records.map((item) => item.building_path),
};
