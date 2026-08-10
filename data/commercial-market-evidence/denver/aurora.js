const district = {
  metroId: "denver",
  metroName: "Denver",
  cityId: "aurora",
  cityName: "Aurora",
  districtId: "aurora",
  districtName: "Aurora",
  districtPath: "/commercial-real-estate/CO/aurora/aurora/",
  primaryEcosystem: "medical",
  secondaryEcosystems: ["office", "industrial_flex", "retail"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "central-park",
    districtName: "Central Park",
    relationship:
      "Central Park is the stronger comparison when northeast Denver mixed commercial context, parking-friendly medical access, and Denver-side customer geography matter more than Aurora-specific patient or service coverage.",
  },
  {
    districtId: "centennial",
    districtName: "Centennial",
    relationship:
      "Centennial is the stronger comparison when south metro medical, professional-service, and parking-oriented customer geography matter more than east metro Aurora access.",
  },
  {
    districtId: "aurora-i-70-airport-industrial",
    districtName: "Aurora I-70 / Airport Industrial",
    relationship:
      "Aurora I-70 / Airport Industrial is the stronger comparison when warehouse, service-industrial, airport-adjacent operations, or industrial/flex utility matter more than patient-facing medical or service-commercial access.",
  },
];

function evidenceRecord(fields) {
  return {
    subjectType: "building",
    district,
    neighboringDistrictRelationships,
    reviewStatus: "approved_reference",
    ...fields,
  };
}

const records = [
  evidenceRecord({
    id: "den-aurora-12375-e-cornell-ave",
    title: "12375 E Cornell Ave",
    subjectId: "12375-e-cornell-ave",
    subjectName: "12375 E Cornell Ave",
    buildingProfileReference: "/commercial-real-estate/building/CO/aurora/12375-e-cornell-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "outpatient_clinic_environment",
    evidenceTypeLabel: "Outpatient Clinic Environment",
    evidenceRole: "patient_facing_medical_access_benchmark",
    evidenceRoleLabel: "Patient-Facing Medical Access Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "12375 E Cornell Ave gives Aurora a patient-facing medical and clinic benchmark for users evaluating east metro access, parking, and local patient geography.",
    districtFit:
      "It supports Aurora's broader commercial identity as a medical and service location, while keeping clinical buildout, permitted use, accessibility, and parking as property-level validation topics.",
    typicalCompanies: ["outpatient clinics", "medical practices", "physical therapy practices", "wellness providers"],
    typicalUsers: [
      "medical and wellness users comparing Aurora patient geography against Central Park, Centennial, Cherry Creek, or hospital-adjacent alternatives",
    ],
    leasingSituations: [
      "clinics validating whether Aurora customer and patient access supports the practice model",
      "healthcare or wellness users comparing parking-oriented access against more central Denver medical or office nodes",
    ],
    strengths: [
      "patient-facing medical evidence",
      "Aurora customer and patient geography",
      "parking-oriented access context",
      "clear comparison value against Central Park and Centennial medical alternatives",
    ],
    tradeoffs: [
      "Medical suitability is not implied by the representative record; permitted use, accessibility, plumbing, buildout, signage, parking, and current suite condition require direct validation.",
    ],
    nearbyAlternatives: ["Clock Tower Square", "Pavilion Towers", "Central Park medical alternatives", "Centennial medical alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/aurora/12375-e-cornell-ave/",
        sourceType: "repository",
      },
      {
        label: "Rofo Aurora representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "den-aurora-clock-tower-square",
    title: "Clock Tower Square",
    subjectId: "14201-14291-e-4th-avenue",
    subjectName: "Clock Tower Square",
    buildingProfileReference: "/commercial-real-estate/building/CO/aurora/14201-14291-e-4th-avenue/",
    buildingProfileStatus: "migrated",
    evidenceType: "neighborhood_medical_service_center",
    evidenceTypeLabel: "Neighborhood Medical / Service Center",
    evidenceRole: "neighborhood_facing_patient_service_benchmark",
    evidenceRoleLabel: "Neighborhood-Facing Patient Service Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Clock Tower Square adds a neighborhood-facing medical and wellness service example where visibility, customer access, and practical Aurora geography can matter together.",
    districtFit:
      "It helps explain Aurora as more than an office or industrial alternative by showing the local service and outpatient side of the district's commercial pattern.",
    typicalCompanies: ["wellness practices", "outpatient clinics", "medical practices", "customer-facing service businesses"],
    typicalUsers: [
      "patient-facing or service users that need Aurora visibility, parking, and neighborhood access before comparing central Denver or south metro alternatives",
    ],
    leasingSituations: [
      "wellness and medical users comparing access, signage, and customer arrival across Aurora locations",
      "service businesses validating whether neighborhood visibility matters more than office polish or industrial utility",
    ],
    strengths: [
      "neighborhood-facing medical and wellness evidence",
      "customer access and visibility context",
      "Aurora service-commercial explanation",
      "useful contrast against industrial/flex Aurora evidence",
    ],
    tradeoffs: [
      "Visibility and service access do not confirm medical buildout, plumbing, accessibility, signage rights, permitted use, or current availability.",
    ],
    nearbyAlternatives: ["12375 E Cornell Ave", "Pavilion Towers", "Central Park medical alternatives", "Aurora I-70 / Airport Industrial"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/aurora/14201-14291-e-4th-avenue/",
        sourceType: "repository",
      },
      {
        label: "Rofo Aurora representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "den-aurora-pavilion-towers",
    title: "Pavilion Towers",
    subjectId: "2821-2851-south-parker-road",
    subjectName: "Pavilion Towers",
    buildingProfileReference: "/commercial-real-estate/building/CO/aurora/2821-2851-south-parker-road/",
    buildingProfileStatus: "migrated",
    evidenceType: "medical_office_environment",
    evidenceTypeLabel: "Medical Office Environment",
    evidenceRole: "professional_medical_office_benchmark",
    evidenceRoleLabel: "Professional Medical Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Pavilion Towers gives Aurora a professional medical-office benchmark for practices comparing patient access, suburban office form, and east metro reach.",
    districtFit:
      "It balances Clock Tower Square's neighborhood-facing service pattern with a more conventional professional medical-office example, making Aurora's medical evidence less one-dimensional.",
    typicalCompanies: ["medical practices", "dental practices", "wellness practices", "professional healthcare offices"],
    typicalUsers: [
      "medical and wellness practices deciding whether Aurora's east metro access and professional office environment fit their patient geography",
    ],
    leasingSituations: [
      "practices comparing Aurora medical-office settings against Central Park, Cherry Creek, or Centennial",
      "users validating whether professional image, access, parking, and suite layout support patient-facing operations",
    ],
    strengths: [
      "professional medical-office evidence",
      "east metro patient and customer reach",
      "suburban-access comparison value",
      "useful balance against neighborhood-service and industrial Aurora examples",
    ],
    tradeoffs: [
      "Medical-office form does not establish patient flow, suite layout, accessibility, parking allocation, permitted use, or current clinical buildout.",
    ],
    nearbyAlternatives: ["12375 E Cornell Ave", "Clock Tower Square", "Central Park medical alternatives", "Cherry Creek service alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/aurora/2821-2851-south-parker-road/",
        sourceType: "repository",
      },
      {
        label: "Rofo Aurora representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
];

module.exports = {
  collectionId: "aurora-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "aurora-business-guides",
      label: "Aurora medical and service business guides",
      status: "blocked_for_now",
      reason:
        "Aurora now has initial medical and service-commercial evidence, but public business guides should wait for guide-specific editorial scope and broader comparison coverage.",
      prerequisite:
        "Approve a focused Aurora medical/service guide packet or complete additional comparison evidence across Central Park, Centennial, Cherry Creek, and Aurora industrial alternatives.",
    },
  ],
};
