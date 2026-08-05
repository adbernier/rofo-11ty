const REVIEWED_AT = "2026-08-05";

const markets = {
  "san-francisco": {
    marketId: "san-francisco",
    marketName: "San Francisco",
    marketSlug: "san-francisco",
    state: "CA",
    route: "/commercial-real-estate/CA/san-francisco/",
    readiness: "published",
  },
  denver: {
    marketId: "denver",
    marketName: "Denver",
    marketSlug: "denver",
    state: "CO",
    route: "/commercial-real-estate/CO/denver/",
    readiness: "review",
  },
};

const definitions = [
  {
    id: "san-francisco:office:growing-technology-company",
    marketId: "san-francisco",
    propertyType: "office",
    archetypeId: "growing-technology-company",
    title: "San Francisco Office Space for Technology Companies",
    seoTitle: "San Francisco Office Space for Technology Companies | Rofo",
    metaDescription:
      "See where growing technology companies should begin an office search in San Francisco, with district fit, tradeoffs, and representative buildings.",
    pageHeading: "Office Space for Growing Technology Companies in San Francisco",
    executiveSummary: [
      "For a growing technology company in San Francisco, Rofo would usually begin with Mission Bay, SoMa, and South Beach. Together they cover the city's strongest launch paths for modern office environment, central access, recruiting, collaboration, and room to compare nearby alternatives.",
      "Mission Bay is the clearest fit when growth, modern office character, and innovation adjacency matter. SoMa remains important when the company wants central access with more creative and adaptive office texture. South Beach is useful when the team needs an access-oriented bridge between downtown, SoMa, Mission Bay, and the waterfront.",
    ],
    bestFitDistricts: [
      {
        districtSlug: "mission-bay",
        fitLabel: "Excellent Fit",
        summary:
          "Modern office district well suited for growing teams that value innovation context, employee access, and room to compare newer environments.",
        reasons: ["Modern office environment", "Growth flexibility", "Technology and life-science adjacency"],
      },
      {
        districtSlug: "soma",
        fitLabel: "Strong Fit",
        summary:
          "Central creative and adaptive office district for technology teams that want San Francisco access without a traditional tower-core feel.",
        reasons: ["Creative office character", "Central San Francisco access", "Technology and product-team fit"],
      },
      {
        districtSlug: "south-beach",
        fitLabel: "Strong Fit",
        summary:
          "Access-oriented waterfront and Transbay-adjacent district that can balance downtown credibility with SoMa and Mission Bay proximity.",
        reasons: ["Regional access", "Downtown and Mission Bay adjacency", "Polished mixed-use office context"],
      },
    ],
    comparativeGuidance:
      "Start with Mission Bay if growth and a modern innovation setting matter most. Start with SoMa if creative central-city office character is more important. Keep South Beach in the comparison when access to downtown, Mission Bay, and the waterfront all matter.",
    tradeoffs: [
      "A modern office environment does not automatically mean the best commute for every employee.",
      "Creative districts can vary more by block and building than newer office districts.",
      "Broker review should validate current availability, expansion options, and total occupancy cost.",
    ],
    alternativeConditions: [
      "Showplace Square can enter the search for product-oriented or hardware-adjacent teams that prefer a lower-rise creative environment.",
      "Dogpatch can enter when Mission Bay adjacency and industrial-heritage character matter.",
    ],
    businessCharacteristics: ["growth-oriented", "hybrid collaboration", "recruiting-sensitive", "technology ecosystem"],
    locationPriorities: [
      { label: "Recruiting", reason: "The location should make collaboration days and hiring conversations easier." },
      { label: "Growth flexibility", reason: "The district should offer enough nearby alternatives if the team changes size." },
      { label: "Modern environment", reason: "The office setting should support a credible technology-company identity." },
      { label: "Employee access", reason: "Commute orientation can materially change which district should lead." },
    ],
    sourceTrace: ["sfOfficeRecommendationModel.initialConsiderationSet", "locationKnowledgeGraph.mission-bay", "locationKnowledgeGraph.soma", "locationKnowledgeGraph.south-beach"],
    editorialStatus: "published",
    publicationReadiness: "published",
    lastReviewed: REVIEWED_AT,
  },
  {
    id: "san-francisco:office:client-facing-professional-services",
    marketId: "san-francisco",
    propertyType: "office",
    archetypeId: "client-facing-professional-services",
    title: "San Francisco Office Space for Professional Services Firms",
    seoTitle: "San Francisco Office Space for Professional Services Firms | Rofo",
    metaDescription:
      "Compare San Francisco office districts for client-facing professional services firms, including Financial District, Jackson Square, and South Beach.",
    pageHeading: "Office Space for Client-Facing Professional Services in San Francisco",
    executiveSummary: [
      "For a client-facing professional-services firm in San Francisco, Rofo would begin with the Financial District, Jackson Square, and South Beach. These districts give the strongest starting comparison between traditional business-core credibility, boutique professional character, and access-oriented downtown adjacency.",
      "The right order depends on how often clients visit and what kind of office environment supports the firm's reputation. A formal downtown address points toward the Financial District. A smaller, distinctive professional environment points toward Jackson Square. A more access-balanced setting keeps South Beach in the conversation.",
    ],
    bestFitDistricts: [
      {
        districtSlug: "financial-district",
        fitLabel: "Excellent Fit",
        summary:
          "San Francisco's traditional office core for firms that benefit from client access, transit, and a formal business address.",
        reasons: ["Professional credibility", "Client-facing environment", "Regional transit concentration"],
      },
      {
        districtSlug: "jackson-square",
        fitLabel: "Strong Fit",
        summary:
          "Boutique, lower-rise professional district for firms that want polished character near the downtown core.",
        reasons: ["Distinctive professional setting", "Walkable downtown adjacency", "Client-ready boutique character"],
      },
      {
        districtSlug: "south-beach",
        fitLabel: "Strong Fit",
        summary:
          "Access-oriented district for firms comparing downtown credibility with SoMa, Mission Bay, and waterfront adjacency.",
        reasons: ["Convenient client access", "Downtown-adjacent positioning", "Mixed-use amenity environment"],
      },
    ],
    comparativeGuidance:
      "Choose the Financial District when formal credibility and client access lead. Choose Jackson Square when boutique character and smaller-scale office identity matter. Keep South Beach in the set when the firm needs downtown access but does not require the most traditional core.",
    tradeoffs: [
      "The most formal business core may not be the best fit for every firm's culture.",
      "Boutique districts can have less room to expand than larger office cores.",
      "Parking, visitor access, and buildout quality must be validated building by building.",
    ],
    alternativeConditions: [
      "SoMa can enter if creative office character matters more than traditional professional image.",
      "Mission Bay can enter if the firm has healthcare, research, or technology-adjacent clients.",
    ],
    businessCharacteristics: ["client-facing", "professional credibility", "meeting-oriented", "employee access"],
    locationPriorities: [
      { label: "Client convenience", reason: "Frequent client visits make arrival experience and location familiarity important." },
      { label: "Professional image", reason: "The district should reinforce credibility without overbuilding the search." },
      { label: "Transit access", reason: "A central location can support clients and employees arriving from different directions." },
      { label: "Meeting environment", reason: "The building and district need to support focused, polished client interactions." },
    ],
    sourceTrace: ["sfOfficeRecommendationModel.districts.financial-district", "locationKnowledgeGraph.junction.clientAccess", "commercialLocationModel.financial-district"],
    editorialStatus: "published",
    publicationReadiness: "published",
    lastReviewed: REVIEWED_AT,
  },
  {
    id: "san-francisco:office:law-firm",
    marketId: "san-francisco",
    propertyType: "office",
    archetypeId: "law-firm",
    title: "San Francisco Office Space for Law Firms",
    seoTitle: "San Francisco Office Space for Law Firms | Rofo",
    metaDescription:
      "See where law firms should begin an office search in San Francisco, with district guidance for professional image, privacy, and client access.",
    pageHeading: "Office Space for Law Firms in San Francisco",
    executiveSummary: [
      "For a San Francisco law firm, Rofo would begin with the Financial District, Jackson Square, and South Beach. These districts provide the strongest office-location comparison for formal presence, client access, privacy-oriented professional work, and practical downtown adjacency.",
      "The Financial District is the clearest starting point when a formal business-core address matters. Jackson Square is a strong alternative for firms that want historic or boutique character near downtown. South Beach can make sense when access and mixed-use surroundings matter more than a purely traditional office core.",
    ],
    bestFitDistricts: [
      {
        districtSlug: "financial-district",
        fitLabel: "Excellent Fit",
        summary:
          "Traditional downtown office core for law firms that value formal presence, client access, and transit.",
        reasons: ["Formal professional address", "Client and transit access", "Established office-core environment"],
      },
      {
        districtSlug: "jackson-square",
        fitLabel: "Strong Fit",
        summary:
          "Historic, boutique office district for firms that want a distinctive professional setting close to the core.",
        reasons: ["Boutique professional character", "Lower-rise historic environment", "Downtown adjacency"],
      },
      {
        districtSlug: "south-beach",
        fitLabel: "Good Fit",
        summary:
          "Access-oriented office district for firms that want downtown proximity with a less conventional district identity.",
        reasons: ["Client access", "Waterfront and Transbay adjacency", "Alternative to the tower core"],
      },
    ],
    comparativeGuidance:
      "Begin with the Financial District for the most traditional law-firm path. Compare Jackson Square if the firm values a smaller-scale historic setting. Keep South Beach as a practical alternative when access and mixed-use surroundings matter more than formal CBD identity.",
    tradeoffs: [
      "A formal downtown address can support client confidence but may feel overly traditional for some firms.",
      "Historic and boutique buildings require closer review of layout, privacy, accessibility, and conference-room needs.",
      "Court or institutional proximity should be validated against the firm's actual client and matter mix.",
    ],
    alternativeConditions: [
      "SoMa can enter if the firm wants a more creative or technology-adjacent office setting.",
      "Mission Bay can enter for healthcare, life-science, or research-adjacent legal practices.",
    ],
    businessCharacteristics: ["client access", "professional presence", "privacy", "traditional or boutique office"],
    locationPriorities: [
      { label: "Professional presence", reason: "The district should support client confidence and the firm's identity." },
      { label: "Privacy", reason: "The eventual building search should support confidential work and meeting rooms." },
      { label: "Transit", reason: "Attorney, staff, and client access can make central districts stronger." },
      { label: "Office character", reason: "Formal tower-core and boutique historic environments communicate different firm identities." },
    ],
    sourceTrace: ["businessArchetypes.law-firm", "locationKnowledgeGraph.financial-district", "locationKnowledgeGraph.jackson-square"],
    editorialStatus: "published",
    publicationReadiness: "published",
    lastReviewed: REVIEWED_AT,
  },
  {
    id: "san-francisco:office:healthcare-organization",
    marketId: "san-francisco",
    propertyType: "office",
    archetypeId: "healthcare-organization",
    title: "San Francisco Office Space for Healthcare Organizations",
    seoTitle: "San Francisco Office Space for Healthcare Organizations | Rofo",
    metaDescription:
      "Compare San Francisco office districts for healthcare organizations, administrative teams, and healthcare-adjacent office users.",
    pageHeading: "Office Space for Healthcare Organizations in San Francisco",
    executiveSummary: [
      "For an office-oriented healthcare organization in San Francisco, Rofo would begin with Mission Bay, South Beach, and the Financial District. This starting set separates institutional and life-science adjacency, access-oriented downtown proximity, and traditional professional office context.",
      "Mission Bay is strongest when UCSF, research, healthcare technology, or partner proximity matters. South Beach can work for administrative teams that need access across downtown, Mission Bay, and the waterfront. The Financial District remains relevant when professional services, partners, or executive access matter more than institutional adjacency.",
    ],
    bestFitDistricts: [
      {
        districtSlug: "mission-bay",
        fitLabel: "Excellent Fit",
        summary:
          "San Francisco's clearest institutional and life-science-adjacent office district for healthcare organizations with partner or research proximity needs.",
        reasons: ["UCSF and healthcare ecosystem adjacency", "Modern office context", "Research and innovation environment"],
      },
      {
        districtSlug: "south-beach",
        fitLabel: "Strong Fit",
        summary:
          "Access-oriented district that can support healthcare-adjacent administrative users comparing downtown and Mission Bay proximity.",
        reasons: ["Mission Bay and downtown adjacency", "Regional access", "Professional mixed-use environment"],
      },
      {
        districtSlug: "financial-district",
        fitLabel: "Good Fit",
        summary:
          "Traditional professional office core for healthcare organizations whose work is administrative, partner-facing, or executive-facing.",
        reasons: ["Professional office setting", "Client and partner access", "Transit concentration"],
      },
    ],
    comparativeGuidance:
      "Start with Mission Bay when institutional adjacency is a real operating advantage. Use South Beach when access between downtown and Mission Bay matters. Keep the Financial District in the set for administrative or partner-facing healthcare work that does not need a healthcare-specific district.",
    tradeoffs: [
      "Healthcare organization does not automatically mean clinical, medical-office, or lab space.",
      "Specialized infrastructure must be validated at the building level.",
      "Patient-facing needs can change the search more than administrative office needs.",
    ],
    alternativeConditions: [
      "Dogpatch can enter for life-science-adjacent or Mission Bay-adjacent users that want industrial-heritage character.",
      "Central patient-access medical scenarios may require a separate medical-office model rather than this office brief.",
    ],
    businessCharacteristics: ["healthcare-adjacent", "administrative office", "institutional proximity", "partner access"],
    locationPriorities: [
      { label: "Institutional proximity", reason: "UCSF or research adjacency can materially change which district should lead." },
      { label: "Professional access", reason: "Administrative and partner-facing teams still need practical office access." },
      { label: "Healthcare ecosystem", reason: "The surrounding commercial context can support recruiting, partners, and credibility." },
      { label: "Validation path", reason: "Clinical, lab, and medical requirements require broker and building-level review." },
    ],
    sourceTrace: ["locationKnowledgeGraph.mission-bay.spaceTypeFit.life_science", "businessArchetypes.healthcare-organization", "commercialMarketEvidence.san-francisco.mission-bay"],
    editorialStatus: "published",
    publicationReadiness: "published",
    lastReviewed: REVIEWED_AT,
  },
  {
    id: "san-francisco:office:nonprofit-mission-driven-organization",
    marketId: "san-francisco",
    propertyType: "office",
    archetypeId: "nonprofit-mission-driven-organization",
    title: "San Francisco Office Space for Nonprofits",
    seoTitle: "San Francisco Office Space for Nonprofits and Mission-Driven Organizations | Rofo",
    metaDescription:
      "Compare San Francisco office districts for nonprofits and mission-driven organizations, with guidance on access, community context, and tradeoffs.",
    pageHeading: "Office Space for Nonprofits and Mission-Driven Organizations in San Francisco",
    executiveSummary: [
      "For a nonprofit or mission-driven organization in San Francisco, Rofo would begin with SoMa, the Mission District, and South Beach. This set balances central access, neighborhood identity, stakeholder access, and practical office flexibility without using unsupported rent assumptions.",
      "SoMa is the broadest central starting point. The Mission District should enter when community proximity, neighborhood identity, or a more informal environment matters. South Beach remains useful when the organization needs a more access-oriented setting near downtown, SoMa, and Mission Bay.",
    ],
    bestFitDistricts: [
      {
        districtSlug: "soma",
        fitLabel: "Strong Fit",
        summary:
          "Central, flexible office district for organizations that need access, collaboration, and a less formal setting than the traditional core.",
        reasons: ["Central access", "Creative and adaptive office character", "Nearby alternatives"],
      },
      {
        districtSlug: "mission-district",
        fitLabel: "Signal-Specific Fit",
        summary:
          "Neighborhood-oriented district for organizations whose work benefits from community proximity, informal culture, and BART access.",
        reasons: ["Neighborhood identity", "Community and stakeholder access", "Informal office environment"],
      },
      {
        districtSlug: "south-beach",
        fitLabel: "Good Fit",
        summary:
          "Access-oriented district for organizations that need a practical bridge between downtown, SoMa, Mission Bay, and regional routes.",
        reasons: ["Broad access", "Mixed-use amenities", "Downtown-adjacent credibility"],
      },
    ],
    comparativeGuidance:
      "Begin with SoMa when central access and flexible office character matter most. Introduce the Mission District when community proximity and informal neighborhood identity are meaningful. Keep South Beach in the set when access across downtown and the southeastern office districts matters.",
    tradeoffs: [
      "Cost sensitivity should be preserved for broker review, not converted into unsupported district rankings.",
      "Neighborhood identity can be valuable, but it may reduce traditional client-facing polish.",
      "Mission District and South Beach representative-building depth should be strengthened over time.",
    ],
    alternativeConditions: [
      "Jackson Square can enter if stakeholder meetings require a more polished boutique professional environment.",
      "Potrero Hill can enter if the organization wants a lower-rise, neighborhood-oriented environment near Mission Bay and Dogpatch.",
    ],
    businessCharacteristics: ["mission-driven", "stakeholder access", "community proximity", "practical operations"],
    locationPriorities: [
      { label: "Accessibility", reason: "Employees, partners, volunteers, or community members may need to reach the office easily." },
      { label: "Community proximity", reason: "The right district may depend on who the organization serves." },
      { label: "Collaboration", reason: "The office may support meetings, programs, and staff coordination." },
      { label: "Cost context", reason: "Budget should be captured for broker execution without driving unsupported district ranking." },
    ],
    sourceTrace: ["businessArchetypes.nonprofit-mission-driven-organization", "locationKnowledgeGraph.soma", "locationKnowledgeGraph.mission-district"],
    editorialStatus: "published",
    publicationReadiness: "published",
    lastReviewed: REVIEWED_AT,
  },
  {
    id: "denver:office:growing-technology-company",
    marketId: "denver",
    propertyType: "office",
    archetypeId: "growing-technology-company",
    title: "Denver Office Space for Technology Companies",
    seoTitle: "Denver Office Space for Technology Companies | Rofo",
    metaDescription:
      "See where growing technology companies should begin an office search in Denver, with district fit, tradeoffs, and representative buildings.",
    pageHeading: "Office Space for Growing Technology Companies in Denver",
    executiveSummary: [
      "For a growing technology company in Denver, Rofo would start by comparing Downtown Denver, RiNo, and the Denver Tech Center. These districts represent different office strategies: central professional access, creative mixed-use energy, and southeast metro office practicality.",
      "Downtown Denver and Denver Tech Center are strongest when the company needs central credibility or southeast corporate scale. RiNo remains important when recruiting, collaboration, and a creative mixed-use office environment matter more than a traditional office setting.",
    ],
    bestFitDistricts: [
      { districtSlug: "downtown-denver", fitLabel: "Strong Direction", summary: "Central office core for technology teams that still need client, transit, and professional access.", reasons: ["Central market access", "Professional office depth", "Regional visibility"] },
      { districtSlug: "rino", fitLabel: "Promising Alternative", summary: "Creative mixed-use district for technology teams that value a less conventional office environment.", reasons: ["Creative office character", "Startup and mixed-use energy", "Alternative to the core"] },
      { districtSlug: "denver-tech-center", fitLabel: "Promising Alternative", summary: "Southeast metro office district for teams that value parking, regional access, and a more corporate operating pattern.", reasons: ["Southeast metro access", "Corporate office setting", "Parking-oriented pattern"] },
    ],
    comparativeGuidance:
      "Downtown Denver leads when central access matters. RiNo becomes more relevant for creative technology culture. Denver Tech Center becomes more relevant when southeast employee geography, parking, or corporate office patterns matter.",
    tradeoffs: ["Representative buildings should be treated as examples of district character, not live inventory.", "Broker review should validate current availability, expansion options, and building-level fit."],
    alternativeConditions: ["LoDo can enter for technology companies that want a more historic and client-friendly downtown-adjacent environment."],
    businessCharacteristics: ["technology", "growth", "hybrid collaboration"],
    locationPriorities: [
      { label: "Recruiting", reason: "Different Denver districts support different employee geographies and office identities." },
      { label: "Office environment", reason: "Modern, creative, and corporate preferences point to different Denver districts." },
      { label: "Growth flexibility", reason: "The search should validate whether the district can support the team's next stage." },
      { label: "Commute orientation", reason: "Southeast metro access can materially change the recommendation." },
    ],
    sourceTrace: ["denverOfficeRecommendationModel.businessTypeEffects.technology", "locationKnowledgeGraph.downtown-denver", "locationKnowledgeGraph.rino", "locationKnowledgeGraph.denver-tech-center"],
    editorialStatus: "published",
    publicationReadiness: "published",
    readinessRationale: "Denver technology-office guidance now aligns with the structured Denver Office resolver and has representative-building evidence across all Best Fit districts.",
    lastReviewed: REVIEWED_AT,
  },
  {
    id: "denver:office:client-facing-professional-services",
    marketId: "denver",
    propertyType: "office",
    archetypeId: "client-facing-professional-services",
    title: "Denver Office Space for Professional Services Firms",
    seoTitle: "Denver Office Space for Professional Services Firms | Rofo",
    metaDescription:
      "Compare Denver office districts for client-facing professional services firms, including Downtown Denver, Cherry Creek, and LoDo.",
    pageHeading: "Office Space for Client-Facing Professional Services in Denver",
    executiveSummary: [
      "For client-facing professional services in Denver, Rofo would begin with Downtown Denver, Cherry Creek, and LoDo. This comparison separates traditional central business access, boutique client-facing polish, and historic downtown-adjacent character.",
      "Downtown Denver and Cherry Creek lead when client convenience and professional image matter most. LoDo stays in the comparison for firms that want downtown adjacency with a more distinctive, hospitality-oriented office setting.",
    ],
    bestFitDistricts: [
      { districtSlug: "downtown-denver", fitLabel: "Strong Direction", summary: "Denver's central office core for firms that need client access, professional credibility, and transit-oriented downtown context.", reasons: ["Client-facing core", "Professional office identity", "Central access"] },
      { districtSlug: "cherry-creek", fitLabel: "Strong Direction", summary: "Polished mixed-use and boutique professional district for firms that value client experience and amenities.", reasons: ["Client-ready amenities", "Professional polish", "Boutique office context"] },
      { districtSlug: "lodo", fitLabel: "Promising Alternative", summary: "Historic downtown-adjacent district for firms that want client access with a less formal office-core feel.", reasons: ["Downtown adjacency", "Historic character", "Client-friendly environment"] },
    ],
    comparativeGuidance:
      "Downtown Denver is the default professional-services starting point. Cherry Creek rises when client experience and boutique polish matter. LoDo stays relevant when a firm wants downtown adjacency with more distinctive district character.",
    tradeoffs: ["Historic and boutique office environments vary by building and should be validated before touring.", "Visitor parking, building image, and conference-room quality need broker validation."],
    alternativeConditions: ["Denver Tech Center can enter for firms with southeast metro client or employee geography."],
    businessCharacteristics: ["client-facing", "professional credibility", "meeting-oriented"],
    locationPriorities: [
      { label: "Client convenience", reason: "Client arrival and district familiarity shape the initial district set." },
      { label: "Professional image", reason: "Downtown, Cherry Creek, and LoDo communicate different professional identities." },
      { label: "Employee commute", reason: "Denver employee geography can shift the search toward the core or southeast metro." },
      { label: "Meeting environment", reason: "The district should support polished client meetings before individual buildings are compared." },
    ],
    sourceTrace: ["denverOfficeRecommendationModel.businessTypeEffects.professional_services", "locationKnowledgeGraph.downtown-denver", "locationKnowledgeGraph.cherry-creek", "locationKnowledgeGraph.lodo"],
    editorialStatus: "published",
    publicationReadiness: "published",
    readinessRationale: "Denver professional-services guidance aligns with the structured Denver Office resolver and has representative-building evidence across all Best Fit districts.",
    lastReviewed: REVIEWED_AT,
  },
  {
    id: "denver:office:law-firm",
    marketId: "denver",
    propertyType: "office",
    archetypeId: "law-firm",
    title: "Denver Office Space for Law Firms",
    seoTitle: "Denver Office Space for Law Firms | Rofo",
    metaDescription:
      "See where law firms should begin an office search in Denver, with district guidance for professional image, privacy, and client access.",
    pageHeading: "Office Space for Law Firms in Denver",
    executiveSummary: [
      "For a Denver law firm, Rofo would start with Downtown Denver, Cherry Creek, and LoDo. The initial question is whether the firm needs formal downtown professional presence, a boutique client-facing environment, or a historic downtown-adjacent setting.",
      "Downtown Denver remains the clearest starting point for formal legal presence and civic access. Cherry Creek and LoDo are useful comparisons when the firm wants a more boutique client experience or a distinctive downtown-edge setting.",
    ],
    bestFitDistricts: [
      { districtSlug: "downtown-denver", fitLabel: "Strong Direction", summary: "Central office core for law firms that value formal presence, civic access, and client convenience.", reasons: ["Formal professional setting", "Central access", "Legal and professional-services fit"] },
      { districtSlug: "cherry-creek", fitLabel: "Promising Alternative", summary: "Boutique, polished district for firms that prioritize client experience and amenities over core downtown identity.", reasons: ["Polished client environment", "Boutique office identity", "Amenity-rich setting"] },
      { districtSlug: "lodo", fitLabel: "Promising Alternative", summary: "Historic downtown-adjacent district for firms that want professional access with more distinctive character.", reasons: ["Historic character", "Downtown adjacency", "Client-friendly setting"] },
    ],
    comparativeGuidance:
      "Downtown Denver leads when formal legal presence matters. Cherry Creek and LoDo become stronger when the firm wants a more boutique or distinctive client experience.",
    tradeoffs: ["Court or civic proximity should be validated against the firm's actual work.", "Private-office layout and visitor arrival require building-level review."],
    alternativeConditions: ["Denver Tech Center can enter when the client base or attorney commute is southeast-oriented."],
    businessCharacteristics: ["professional presence", "privacy", "client access"],
    locationPriorities: [
      { label: "Credibility", reason: "The district should reinforce the firm's client-facing identity." },
      { label: "Privacy", reason: "The eventual building search should support confidential work and meeting rooms." },
      { label: "Access", reason: "Clients, attorneys, and staff may need different access patterns." },
      { label: "Office character", reason: "Traditional and boutique settings communicate different firm positions." },
    ],
    sourceTrace: ["denverOfficeRecommendationModel.businessTypeEffects.law_firm", "businessArchetypes.law-firm", "locationKnowledgeGraph.downtown-denver", "locationKnowledgeGraph.cherry-creek"],
    editorialStatus: "published",
    publicationReadiness: "published",
    readinessRationale: "Denver law-firm guidance aligns with the structured Denver Office resolver and has representative-building evidence across all Best Fit districts.",
    lastReviewed: REVIEWED_AT,
  },
  {
    id: "denver:office:healthcare-organization",
    marketId: "denver",
    propertyType: "office",
    archetypeId: "healthcare-organization",
    title: "Denver Office Space for Healthcare Organizations",
    seoTitle: "Denver Office Space for Healthcare Organizations | Rofo",
    metaDescription:
      "Review draft Denver office-location guidance for healthcare organizations and healthcare-adjacent office users.",
    pageHeading: "Office Space for Healthcare Organizations in Denver",
    executiveSummary: [
      "For an office-oriented healthcare organization in Denver, Rofo would begin with Central Park, Cherry Creek, and Downtown Denver. This set separates medical or healthcare-adjacent access, polished client or patient-facing context, and central administrative office needs.",
      "The structured Denver Office resolver strongly supports Central Park for healthcare-service and administrative signals, but the broader Denver healthcare-office comparison set still needs editorial review. This page remains held so Rofo does not imply clinical, medical-building, lab, or infrastructure suitability without a stronger Denver healthcare model.",
    ],
    bestFitDistricts: [
      { districtSlug: "central-park", fitLabel: "Promising Direction", summary: "Healthcare-adjacent Denver district for organizations that need patient, partner, or northeast market access.", reasons: ["Medical ecosystem signal", "Northeast Denver access", "Administrative office relevance"] },
      { districtSlug: "cherry-creek", fitLabel: "Promising Direction", summary: "Polished mixed-use district for healthcare organizations with client, patient, or executive-facing needs.", reasons: ["Professional access", "Client and patient experience", "Amenity-rich setting"] },
      { districtSlug: "downtown-denver", fitLabel: "Useful Alternative", summary: "Central office core for healthcare organizations whose work is administrative, partner-facing, or civic-facing.", reasons: ["Central access", "Administrative office context", "Professional-services adjacency"] },
    ],
    comparativeGuidance:
      "Central Park should lead only when healthcare adjacency or patient access is meaningful. Cherry Creek is useful for polished access. Downtown Denver remains relevant for administrative or partner-facing healthcare offices.",
    tradeoffs: ["This is office-oriented guidance, not clinical-space advice.", "Medical buildout, permitted use, accessibility, and parking require broker validation."],
    alternativeConditions: ["Aurora or other healthcare nodes may become important in a future Denver medical-office model."],
    businessCharacteristics: ["healthcare-adjacent", "administrative office", "patient or partner access"],
    locationPriorities: [
      { label: "Healthcare ecosystem", reason: "Healthcare adjacency can matter, but only when the organization's work requires it." },
      { label: "Patient or partner access", reason: "Access pattern changes the district set more than a generic healthcare label." },
      { label: "Professional setting", reason: "Administrative healthcare teams may still need ordinary office credibility." },
      { label: "Validation", reason: "Clinical and medical requirements must be checked at building level." },
    ],
    sourceTrace: ["denverOfficeRecommendationModel.businessTypeEffects.healthcare", "locationKnowledgeGraph.central-park", "locationKnowledgeGraph.cherry-creek", "businessArchetypes.healthcare-organization"],
    editorialStatus: "hold",
    publicationReadiness: "hold",
    readinessRationale: "Held after Phase 1B because the resolver creates a one-district healthcare lead and Denver still needs a stronger healthcare-office comparison model before indexed publication.",
    lastReviewed: REVIEWED_AT,
  },
  {
    id: "denver:office:nonprofit-mission-driven-organization",
    marketId: "denver",
    propertyType: "office",
    archetypeId: "nonprofit-mission-driven-organization",
    title: "Denver Office Space for Nonprofits",
    seoTitle: "Denver Office Space for Nonprofits and Mission-Driven Organizations | Rofo",
    metaDescription:
      "Compare Denver office districts for nonprofits and mission-driven organizations, with guidance on access, stakeholder convenience, and district character.",
    pageHeading: "Office Space for Nonprofits and Mission-Driven Organizations in Denver",
    executiveSummary: [
      "For a nonprofit or mission-driven organization in Denver, Rofo would start with Downtown Denver, LoDo, and RiNo. This set balances central access, stakeholder convenience, neighborhood identity, and practical office character without using unsupported cost assumptions.",
      "Downtown Denver and LoDo are strongest when civic access, stakeholder convenience, and transit-oriented centrality matter. RiNo becomes more useful when the organization values creative district character and a less formal office environment.",
    ],
    bestFitDistricts: [
      { districtSlug: "downtown-denver", fitLabel: "Strong Direction", summary: "Central office district for organizations that need stakeholder, employee, and civic access.", reasons: ["Central access", "Stakeholder convenience", "Professional office context"] },
      { districtSlug: "lodo", fitLabel: "Promising Alternative", summary: "Historic downtown-adjacent district for organizations that want accessibility with more distinctive character.", reasons: ["Downtown adjacency", "Historic character", "Client and partner access"] },
      { districtSlug: "rino", fitLabel: "Promising Alternative", summary: "Creative mixed-use district for organizations that value neighborhood energy and a less formal setting.", reasons: ["Creative character", "Neighborhood energy", "Alternative office environment"] },
    ],
    comparativeGuidance:
      "Downtown Denver leads when stakeholder access and centrality matter most. LoDo becomes stronger for a distinctive but still central office. RiNo enters when creative character and neighborhood energy matter more than formal office image.",
    tradeoffs: ["Cost sensitivity should be preserved for broker execution, not used to rank districts.", "Representative buildings should be treated as examples of district character, not available nonprofit inventory."],
    alternativeConditions: ["Central Park may enter if the organization is healthcare- or community-service-oriented in northeast Denver."],
    businessCharacteristics: ["mission-driven", "stakeholder access", "community proximity"],
    locationPriorities: [
      { label: "Stakeholder access", reason: "The right district depends on who needs to reach the office." },
      { label: "Transit and accessibility", reason: "Employees, partners, volunteers, and community members may have different access needs." },
      { label: "Neighborhood identity", reason: "Mission alignment can make district character more important." },
      { label: "Cost context", reason: "Budget belongs in broker review without driving unsupported district ranking." },
    ],
    sourceTrace: ["denverOfficeRecommendationModel.businessTypeEffects.nonprofit", "businessArchetypes.nonprofit-mission-driven-organization", "locationKnowledgeGraph.downtown-denver", "locationKnowledgeGraph.rino"],
    editorialStatus: "published",
    publicationReadiness: "published",
    readinessRationale: "Denver nonprofit guidance aligns with the structured Denver Office resolver for central access and mission-driven office context, with representative-building evidence across all Best Fit districts.",
    lastReviewed: REVIEWED_AT,
  },
];

module.exports = {
  schemaVersion: "business-brief-definitions-v1",
  markets,
  definitions,
};
