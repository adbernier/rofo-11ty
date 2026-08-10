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
  return `/commercial-real-estate/building/CO/broomfield/${slugify(address)}/`;
}

const broomfieldDistrict = {
  id: "co-broomfield-broomfield",
  name: "Broomfield",
  slug: "broomfield",
  city: "Broomfield",
  state_abbr: "CO",
  area_type: "district",
  path: "/commercial-real-estate/CO/broomfield/broomfield/",
  primarySpaceType: "office",
};

const relatedDistricts = [
  {
    label: "Interlocken",
    url: "/commercial-real-estate/CO/broomfield/interlocken/",
    reason: "Compare when the search should focus on concentrated business-park and campus-office context.",
  },
  {
    label: "Boulder",
    url: "/commercial-real-estate/CO/boulder/boulder/",
    reason: "Compare when Boulder identity, university adjacency, and research/talent signal matter more.",
  },
  {
    label: "Westminster",
    url: "/commercial-real-estate/CO/westminster/westminster/",
    reason: "Compare when northwest suburban local-service geography matters more than US-36 corridor office scale.",
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
    id: `co-broomfield-${slugify(fields.address)}`,
    building_path: path,
    identity: {
      name: fields.name,
      address: fields.address,
      city: "Broomfield",
      state_abbr: "CO",
      district: broomfieldDistrict.name,
      canonicalDistrict: broomfieldDistrict,
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
      companySizes: fields.companySizes || ["small and mid-sized businesses", "technology offices", "regional office teams"],
    },
    experience: {
      workplaceCharacter: "US-36 corridor office environment where parking, regional employee geography, technology context, and Denver-Boulder access shape fit.",
      neighborhoodCharacter: "Suburban corridor office setting with stronger regional access and parking than urban walkability or central Denver identity.",
      executivePresence: fields.executivePresence || "medium",
      innovationScore: fields.innovationScore || "moderate",
    },
    operations: {
      transit: "US-36 and northwest corridor access are the main location story; employee commute patterns and transit usefulness should be validated.",
      parking: "Parking is part of the Broomfield value proposition, but allocation, visitor access, accessible stalls, and cost should be confirmed.",
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
      sourceBasis: "Broomfield Commercial Market Evidence district-building mission",
    },
    buildingBrief: brief,
  };
}

const records = [
  record({
    name: "335 Interlocken Pkwy",
    address: "335 Interlocken Pkwy",
    editorialRole: "US-36 Professional Office Benchmark",
    editorialReason: "Represents Broomfield professional and technology office demand along the Denver-Boulder corridor.",
    representativeThemes: ["Professional office", "Technology office", "US-36 corridor", "Regional access"],
    businessFit: ["professional office", "technology office", "aerospace-adjacent office", "regional office"],
    nearbyBuildingPaths: [
      buildingPath("390 Interlocken Crescent"),
      buildingPath("8181 Arista Place"),
    ],
    comparisonBuildingPaths: [
      buildingPath("390 Interlocken Crescent"),
      buildingPath("8181 Arista Place"),
      "/commercial-real-estate/building/CO/denver/7900-e-union-ave/",
    ],
    brief: {
      summary: "335 Interlocken Pkwy is a Broomfield Building Profile for office users comparing US-36 corridor access, technology context, parking, and Denver-Boulder employee geography. It helps teams evaluate whether Broomfield practicality matters more than Boulder identity, Downtown Denver visibility, or a more concentrated Interlocken campus search.",
      rofoTake: "This profile matters because Broomfield needs a practical professional-office benchmark, not only broad corridor language. 335 Interlocken Pkwy helps Rofo explain the decision pattern: parking, regional access, employee geography, and technology-adjacent context can matter more than urban identity or a central business district address.",
      snapshot: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Business use", value: "Professional and technology office comparison" },
        { label: "District", value: "Broomfield" },
        { label: "Access context", value: "US-36 corridor and Denver-Boulder regional geography" },
        { label: "Evidence role", value: "US-36 professional office benchmark" },
        { label: "Validation context", value: "Parking, layout, visitor access, and current suite condition require verification" },
      ],
      bestFit: [
        "Technology, aerospace-adjacent, consulting, and professional-service teams comparing Denver-Boulder corridor access.",
        "Regional office users that value parking and employee geography more than downtown visibility.",
        "Companies deciding whether Broomfield is practical enough before comparing Boulder, Interlocken, or Westminster.",
      ],
      mayNotFit: [
        "Companies that need Boulder identity, university adjacency, or stronger research/talent signal.",
        "Downtown-oriented users that need central civic access, transit density, or a formal CBD address.",
        "Retail, showroom, medical, or warehouse users whose location decision depends on customer visibility or operational utility.",
      ],
      buildingExperience: "The building should be evaluated as a practical corridor office option. A tour should focus on employee commute patterns, parking, visitor arrival, office layout, and whether US-36 access supports the business's actual customer and workforce geography.",
      locationContext: "335 Interlocken Pkwy sits in Broomfield's US-36 corridor office market. Compare Interlocken for a more concentrated campus setting, Boulder when identity and research adjacency matter more, and Westminster when local-service geography matters more than corridor office scale.",
      advantages: [
        "Adds professional-office evidence to the Broomfield collection.",
        "Clarifies why Broomfield can work for Denver-Boulder corridor office users.",
        "Creates a practical comparison point against Boulder, Interlocken, and Downtown Denver.",
      ],
      tradeoffs: [
        "US-36 practicality may be less useful for companies that need Boulder identity or central Denver visibility.",
        "Visitor arrival, parking allocation, suite layout, and building condition require property-level validation.",
        "The environment may feel too suburban for users that want urban walkability or stronger street identity.",
      ],
      operationalProfile: [
        { label: "Corridor access", summary: "Use this profile to test whether US-36 and Denver-Boulder employee geography are stronger than Boulder or central Denver identity." },
        { label: "Office practicality", summary: "Validate layout, parking, visitor arrival, and daily employee access before treating the building as a fit." },
        { label: "Technology context", summary: "The building supports technology-adjacent office comparison, but specialized R&D or flex requirements still need property-level validation." },
      ],
      environmentExplanation: {
        whyItExists: "Broomfield office environments exist for companies that need practical access between Denver and Boulder with parking and corridor reach.",
        whyChooseThisEnvironment: "Choose this environment when employee geography and office practicality matter more than Boulder identity or downtown address value.",
        representativeValue: "335 Interlocken Pkwy gives Broomfield a professional-office benchmark.",
      },
      nearbyAlternatives: [
        { label: "Interlocken", url: buildingPath("390 Interlocken Crescent"), reason: "Compare when campus-style business-park identity matters more than practical professional-office simplicity." },
        { label: "Spaces Arista", url: buildingPath("8181 Arista Place"), reason: "Compare when smaller-team flexibility and easier entry matter more than a conventional office suite." },
        { label: "DTC Corporate Center III", url: "/commercial-real-estate/building/CO/denver/7900-e-union-ave/", reason: "Compare when southeast corporate-office scale matters more than Denver-Boulder corridor access." },
      ],
      validationNotes: [
        "Confirm current suite layout, condition, and ability to support the team's workplace plan.",
        "Verify employee commute patterns across Denver, Boulder, Westminster, and northwest suburbs.",
        "Confirm parking allocation, visitor arrival, signage, and building access rules.",
        "Validate whether Broomfield market identity supports customers, recruiting, and executive expectations.",
      ],
      ecosystemSubtypes: ["professional_office", "technology_office", "suburban_business_park"],
      representativeRole: "professional_office_environment",
      businessActivities: ["professional_services", "technology_operations", "regional_management", "client_meetings"],
      businessArchetypes: ["technology_company", "aerospace_adjacent_company", "consulting_firm", "professional_services_firm"],
      operationalCharacteristics: ["corridor_access", "parking_oriented", "regional_employee_geography", "office_layout_validation"],
      fitSummary: "Broomfield professional-office fit depends on corridor access, parking, employee geography, and whether Boulder or Denver identity is necessary.",
      sourceNotes: ["Repository Knowledge Graph identifies 335 Interlocken Pkwy as a Broomfield representative building for professional and technology office demand along the Denver-Boulder corridor."],
    },
  }),
  record({
    name: "Interlocken",
    address: "390 Interlocken Crescent",
    buildingType: "Suburban office campus",
    editorialRole: "Campus-Style Office Benchmark",
    editorialReason: "Shows the campus-oriented side of Broomfield and Interlocken for corporate, technology, and regional office users.",
    representativeThemes: ["Suburban office", "Business park", "Campus office", "US-36 corridor"],
    businessFit: ["corporate office", "technology office", "regional headquarters", "professional office"],
    secondaryDistricts: [
      {
        id: "co-broomfield-interlocken",
        name: "Interlocken",
        slug: "interlocken",
        city: "Broomfield",
        state_abbr: "CO",
        area_type: "district",
        path: "/commercial-real-estate/CO/broomfield/interlocken/",
      },
    ],
    nearbyBuildingPaths: [
      buildingPath("335 Interlocken Pkwy"),
      buildingPath("8181 Arista Place"),
    ],
    comparisonBuildingPaths: [
      buildingPath("335 Interlocken Pkwy"),
      buildingPath("8181 Arista Place"),
      "/commercial-real-estate/building/CO/englewood/6300-s-syracuse-way/",
    ],
    brief: {
      summary: "Interlocken at 390 Interlocken Crescent is a Broomfield Building Profile for corporate, technology, and regional office users comparing campus-style business-park settings. It helps teams evaluate whether parking, office scale, and Denver-Boulder corridor reach matter more than Boulder identity or urban walkability.",
      rofoTake: "This profile matters because Broomfield's office story includes campus-style business-park decisions, not only single-building professional office choices. Interlocken gives Rofo a benchmark for teams whose search depends on scale, parking, expansion context, and regional employee access.",
      snapshot: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Business use", value: "Campus-style corporate and technology office comparison" },
        { label: "District", value: "Broomfield" },
        { label: "Secondary context", value: "Interlocken business-park node" },
        { label: "Evidence role", value: "Campus-style office benchmark" },
        { label: "Validation context", value: "Campus access, floorplate fit, parking, and expansion needs require verification" },
      ],
      bestFit: [
        "Corporate, technology, regional headquarters, and professional-service users comparing business-park scale.",
        "Larger office users that need to evaluate parking, campus access, and employee geography along US-36.",
        "Companies comparing Broomfield/Interlocken against Boulder, DTC, or Louisville / Superior for office scale.",
      ],
      mayNotFit: [
        "Small teams that need simple entry, flexible terms, or shared-office structure more than campus scale.",
        "Urban office users that need walkability, transit density, or central Denver visibility.",
        "Businesses that need warehouse, loading, yard, retail frontage, or specialized technical infrastructure.",
      ],
      buildingExperience: "The building should be evaluated as a campus-style office environment. A tour should validate floorplate fit, arrival patterns, parking, employee commute geography, and whether a business-park setting supports the team's culture and customer expectations.",
      locationContext: "Interlocken sits within Broomfield's US-36 office geography and gives the collection a concentrated business-park example. Compare 335 Interlocken Pkwy for practical professional-office fit and Spaces Arista when smaller-team flexibility matters more.",
      advantages: [
        "Adds campus-style office evidence to the Broomfield collection.",
        "Helps explain why Interlocken can be a more focused Broomfield office node.",
        "Supports comparison against Boulder, DTC, Inverness, and Louisville / Superior office alternatives.",
      ],
      tradeoffs: [
        "Campus-style scale may be less useful for users that need walkability or smaller local-service visibility.",
        "Broomfield and Interlocken may not provide the same identity signal as Boulder or central Denver.",
        "Floorplate fit, parking allocation, expansion capacity, and current suite condition require validation.",
      ],
      operationalProfile: [
        { label: "Campus setting", summary: "Use this profile to compare parking, floorplate scale, arrival patterns, and whether business-park format fits the team." },
        { label: "Regional office fit", summary: "Validate whether US-36 access improves employee geography enough to outweigh Boulder or Denver identity." },
        { label: "Expansion context", summary: "Larger users should confirm expansion options, suite adjacency, parking allocation, and long-term control." },
      ],
      environmentExplanation: {
        whyItExists: "Campus-style office environments exist for companies that need office scale, parking, and regional access without a downtown address pattern.",
        whyChooseThisEnvironment: "Choose this environment when business-park utility and US-36 reach matter more than urban walkability or Boulder-specific identity.",
        representativeValue: "Interlocken gives Broomfield a campus-style office benchmark.",
      },
      nearbyAlternatives: [
        { label: "335 Interlocken Pkwy", url: buildingPath("335 Interlocken Pkwy"), reason: "Compare when practical professional-office fit matters more than campus-style business-park scale." },
        { label: "Spaces Arista", url: buildingPath("8181 Arista Place"), reason: "Compare when flexible smaller-team entry matters more than a conventional campus-style office." },
        { label: "Cascades", url: "/commercial-real-estate/building/CO/englewood/6300-s-syracuse-way/", reason: "Compare when southeast business-park campus context may fit better than US-36 corridor geography." },
      ],
      validationNotes: [
        "Confirm floorplate size, divisibility, expansion options, and current suite condition.",
        "Verify parking allocation, visitor access, building arrival, and campus circulation.",
        "Validate employee commute patterns across Denver, Boulder, Broomfield, and northwest suburbs.",
        "Confirm whether Interlocken identity is strong enough for customers, recruiting, and leadership expectations.",
      ],
      ecosystemSubtypes: ["suburban_business_park", "technology_office", "corporate_office"],
      representativeRole: "suburban_office_campus",
      businessActivities: ["regional_management", "technology_operations", "corporate_office", "professional_services"],
      businessArchetypes: ["technology_company", "corporate_regional_office", "aerospace_adjacent_company", "professional_services_firm"],
      operationalCharacteristics: ["campus_format", "parking_oriented", "regional_access", "expansion_validation"],
      fitSummary: "Campus-style Broomfield office fit depends on floorplate fit, parking, regional access, and whether business-park identity supports the company.",
      sourceNotes: ["Repository Knowledge Graph identifies 390 Interlocken Crescent as a Broomfield representative building for suburban office campus and Interlocken business-park context."],
    },
  }),
  record({
    name: "Spaces Arista",
    address: "8181 Arista Place",
    buildingType: "Small-tenant office environment",
    editorialRole: "Flexible Office Entry Benchmark",
    editorialReason: "Illustrates smaller-team and flexible office decisions in Broomfield where regional access and parking matter more than traditional CBD identity.",
    representativeThemes: ["Small-tenant office", "Flexible office", "Arista", "US-36 corridor"],
    businessFit: ["small office", "consulting office", "technology startup", "project office"],
    nearbyBuildingPaths: [
      buildingPath("335 Interlocken Pkwy"),
      buildingPath("390 Interlocken Crescent"),
    ],
    comparisonBuildingPaths: [
      buildingPath("335 Interlocken Pkwy"),
      buildingPath("390 Interlocken Crescent"),
      "/commercial-real-estate/building/CO/boulder/1942-broadway-suite-314c/",
    ],
    brief: {
      summary: "Spaces Arista is a Broomfield Building Profile for smaller teams, project offices, professional-service users, and flexible office searches along the US-36 corridor. It helps users compare easier office entry, parking, and regional access against larger Broomfield campuses or stronger Boulder and Denver identities.",
      rofoTake: "This profile matters because not every Broomfield office user needs campus scale or a conventional suite. Spaces Arista gives Rofo a smaller-team benchmark for companies testing the corridor, validating employee geography, or choosing flexibility before committing to a larger office plan.",
      snapshot: [
        { label: "Primary ecosystem", value: "Office" },
        { label: "Business use", value: "Small-team and flexible office comparison" },
        { label: "District", value: "Broomfield" },
        { label: "Access context", value: "Arista and US-36 corridor geography" },
        { label: "Evidence role", value: "Flexible office entry benchmark" },
        { label: "Validation context", value: "Suite model, shared services, parking, expansion path, and current terms require verification" },
      ],
      bestFit: [
        "Small professional teams, consultants, technology startups, and regional project offices testing Broomfield fit.",
        "Companies that need easier entry and parking before committing to a larger conventional office.",
        "Users comparing Broomfield flexibility against Boulder identity, Westminster local-service geography, or central Denver visibility.",
      ],
      mayNotFit: [
        "Companies that need long-term control, custom buildout, dedicated branding, or larger contiguous space.",
        "Corporate users whose workplace strategy depends on campus scale, expansion capacity, or conventional lease control.",
        "Industrial, retail, medical, or showroom users whose fit depends on operational utility or customer-facing visibility.",
      ],
      buildingExperience: "The building should be evaluated around how the office model supports daily work: arrival, parking, shared services, meeting patterns, privacy, expansion path, and whether flexible entry offsets less control over the environment.",
      locationContext: "Spaces Arista gives the Broomfield collection a smaller-team and flexible-office example. Compare 335 Interlocken Pkwy for a more conventional professional-office search and Interlocken for campus-style office scale.",
      advantages: [
        "Adds smaller-team and flexible-office evidence to Broomfield.",
        "Helps users compare easier entry against conventional office control.",
        "Balances larger Interlocken and professional-office examples in the district evidence collection.",
      ],
      tradeoffs: [
        "Flexible office models may offer less control over branding, layout, expansion, and long-term economics.",
        "Shared services, privacy, meeting access, and growth path should be validated before choosing the environment.",
        "The building may not solve requirements that need warehouse, retail frontage, medical workflow, or specialized infrastructure.",
      ],
      operationalProfile: [
        { label: "Flexible entry", summary: "Use this profile when the team values easier entry, shared services, and optionality more than full control of a conventional suite." },
        { label: "Small-team fit", summary: "Validate privacy, meeting access, work settings, visitor arrival, parking, and whether the model supports daily operations." },
        { label: "Growth path", summary: "Confirm whether the flexible-office model supports expansion or whether a conventional Broomfield office should be compared earlier." },
      ],
      environmentExplanation: {
        whyItExists: "Flexible and small-tenant office environments exist for teams that need a low-friction workplace option before committing to a larger suite or long-term office plan.",
        whyChooseThisEnvironment: "Choose this environment when entry flexibility and Broomfield access matter more than full suite control or campus scale.",
        representativeValue: "Spaces Arista gives Broomfield a small-team and flexible-office benchmark.",
      },
      nearbyAlternatives: [
        { label: "335 Interlocken Pkwy", url: buildingPath("335 Interlocken Pkwy"), reason: "Compare when conventional professional-office fit matters more than flexible entry." },
        { label: "Interlocken", url: buildingPath("390 Interlocken Crescent"), reason: "Compare when campus-style office scale and business-park identity matter more than small-team flexibility." },
        { label: "Boulder flexible office alternatives", url: "/commercial-real-estate/CO/boulder/boulder/", reason: "Compare when Boulder identity and research/talent signal matter more than Broomfield corridor practicality." },
      ],
      validationNotes: [
        "Confirm current suite model, term structure, shared services, privacy, and meeting-room access.",
        "Verify parking, visitor arrival, building access, and commute fit for regular users.",
        "Confirm whether the office can support expected headcount, hybrid patterns, and client meetings.",
        "Validate expansion path, brand control, IT needs, and whether a conventional office should be compared.",
      ],
      ecosystemSubtypes: ["small_tenant_office", "flexible_office", "professional_office"],
      representativeRole: "small_tenant_office_environment",
      businessActivities: ["professional_services", "project_office", "technology_operations", "client_meetings"],
      businessArchetypes: ["consulting_firm", "technology_startup", "professional_services_firm", "regional_project_team"],
      operationalCharacteristics: ["flexible_entry", "shared_services", "parking_oriented", "growth_path_validation"],
      fitSummary: "Flexible Broomfield office fit depends on entry needs, privacy, parking, expansion path, and whether the team needs conventional suite control.",
      sourceNotes: ["Repository Knowledge Graph identifies Spaces Arista at 8181 Arista Place as a Broomfield representative building for smaller-team and flexible office decisions."],
    },
  }),
];

module.exports = {
  canonicalBuildings: records,
};
