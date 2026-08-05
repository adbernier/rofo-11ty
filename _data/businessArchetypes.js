module.exports = {
  schemaVersion: "business-archetypes-v1",
  propertyTypes: ["office"],
  archetypes: {
    "growing-technology-company": {
      id: "growing-technology-company",
      slug: "technology-companies",
      label: "Growing Technology Company",
      pluralLabel: "Technology Companies",
      shortLabel: "Technology",
      description:
        "Technology companies often need office locations that support recruiting, collaboration, hybrid attendance, and future growth without narrowing too quickly to a single building format.",
      typicalOperatingPattern:
        "Teams use the office for collaboration, recruiting, investor or partner meetings, and periodic all-hands work rather than only daily desk occupancy.",
      primaryLocationDrivers: [
        "recruiting and employee access",
        "growth flexibility",
        "modern or creative office environment",
        "technology or innovation ecosystem",
        "amenities that support hybrid collaboration days",
      ],
      secondaryPreferences: [
        "representative buildings that signal product or innovation culture",
        "nearby alternatives for future expansion",
        "districts that can support changing workplace patterns",
      ],
      materialQuestions: [
        "Where do employees commute from most often?",
        "Does the company prefer a modern, creative, or lower-rise environment?",
        "How important is room to grow in the same district?",
        "Will the office host customers, investors, or partners regularly?",
      ],
      buildingSearchFactors: [
        "floorplate flexibility",
        "meeting and collaboration layout",
        "expansion options",
        "tenant improvements",
        "building systems and amenities",
      ],
      brokerExecutionConsiderations: [
        "validate current availability and expansion options",
        "compare total occupancy cost across preferred districts",
        "test whether specific buildings support hybrid collaboration patterns",
      ],
      publishingGuidance:
        "Focus on how district character, employee access, and growth flexibility change the office search. Avoid treating every startup as the same tenant.",
      knownLimits:
        "Do not infer technical lab, prototype, or hardware capability unless a separate property-type model supports it.",
    },
    "client-facing-professional-services": {
      id: "client-facing-professional-services",
      slug: "professional-services",
      label: "Client-Facing Professional Services",
      pluralLabel: "Professional Services Firms",
      shortLabel: "Professional Services",
      description:
        "Client-facing professional-services firms need locations that balance credibility, access, meeting quality, and practicality for employees.",
      typicalOperatingPattern:
        "The office supports focused work, scheduled client meetings, internal collaboration, and a professional first impression.",
      primaryLocationDrivers: [
        "client convenience",
        "professional credibility",
        "transit access",
        "meeting environment",
        "employee commute balance",
      ],
      secondaryPreferences: [
        "polished but practical office character",
        "walkable amenities for clients and employees",
        "nearby alternatives with different building character",
      ],
      materialQuestions: [
        "How often do clients visit?",
        "Is traditional professional image or boutique character more important?",
        "Which employee commute pattern should Rofo respect?",
        "Does the team need room to grow or smaller private-office layouts?",
      ],
      buildingSearchFactors: [
        "conference room quality",
        "visitor arrival",
        "building image",
        "private office layout",
        "parking and transit specifics",
      ],
      brokerExecutionConsiderations: [
        "validate visitor access and parking building by building",
        "compare lease structure and buildout needs",
        "confirm whether a polished address materially improves client confidence",
      ],
      publishingGuidance:
        "Explain the difference between traditional office-core credibility, boutique professional environments, and practical access-oriented locations.",
      knownLimits:
        "Do not assume the most formal district is always best; smaller firms may prefer boutique or mixed-use settings.",
    },
    "law-firm": {
      id: "law-firm",
      slug: "law-firms",
      label: "Law Firm",
      pluralLabel: "Law Firms",
      shortLabel: "Law",
      description:
        "Law firms often need a credible, private, client-ready office environment with dependable access to clients, courts, institutions, and professional services where relevant.",
      typicalOperatingPattern:
        "The office supports confidential work, attorney and staff collaboration, client meetings, document-heavy workflows, and a professional arrival experience.",
      primaryLocationDrivers: [
        "client access",
        "professional presence",
        "privacy",
        "transit",
        "traditional or boutique office character",
      ],
      secondaryPreferences: [
        "court or institutional access where relevant",
        "quiet professional environment",
        "nearby legal, finance, and professional-service ecosystem",
      ],
      materialQuestions: [
        "How often will clients visit the office?",
        "Is formal downtown presence required?",
        "Would boutique historic character fit the firm better than a tower core?",
        "Are court, civic, or institutional relationships location drivers?",
      ],
      buildingSearchFactors: [
        "private office layout",
        "conference rooms",
        "reception and visitor arrival",
        "acoustics and privacy",
        "records or storage needs",
      ],
      brokerExecutionConsiderations: [
        "validate private-office layout efficiency",
        "compare client arrival and parking",
        "review lease economics and improvement requirements after district fit is established",
      ],
      publishingGuidance:
        "Keep the advice grounded in professional image, privacy, client access, and district character rather than legal-industry generalities.",
      knownLimits:
        "Court proximity should be described only where the market model supports it; it is not a universal law-firm requirement.",
    },
    "healthcare-organization": {
      id: "healthcare-organization",
      slug: "healthcare-organizations",
      label: "Healthcare Organization",
      pluralLabel: "Healthcare Organizations",
      shortLabel: "Healthcare",
      description:
        "Office-oriented healthcare organizations need locations that may support administration, partners, patients, institutional relationships, or healthcare ecosystem access without assuming clinical or lab requirements.",
      typicalOperatingPattern:
        "The office may support administration, care coordination, healthcare technology, research-adjacent work, payer or provider operations, or partner meetings.",
      primaryLocationDrivers: [
        "institutional proximity when relevant",
        "professional access",
        "employee commute",
        "patient or partner access where relevant",
        "healthcare ecosystem",
      ],
      secondaryPreferences: [
        "modern office environment",
        "medical or research adjacency",
        "clear validation path for specialized needs",
      ],
      materialQuestions: [
        "Is this primarily administrative office use, patient-facing medical use, or research-adjacent work?",
        "Does institutional proximity matter?",
        "Will patients, partners, or employees be the primary access driver?",
        "Does the use require specialized medical or lab infrastructure?",
      ],
      buildingSearchFactors: [
        "accessibility",
        "parking and drop-off",
        "medical buildout compatibility",
        "lab or technical infrastructure where applicable",
        "permitted use",
      ],
      brokerExecutionConsiderations: [
        "separate ordinary office needs from medical, clinical, or lab requirements",
        "validate property-level infrastructure and permitted use",
        "confirm whether institutional proximity creates practical value",
      ],
      publishingGuidance:
        "Use broad healthcare-office language. Do not imply that every healthcare organization needs clinical, lab, or medical-office space.",
      knownLimits:
        "Clinical-space, lab-space, licensing, imaging, plumbing, and medical-building claims require building-level validation.",
    },
    "nonprofit-mission-driven-organization": {
      id: "nonprofit-mission-driven-organization",
      slug: "nonprofits",
      label: "Nonprofit / Mission-Driven Organization",
      pluralLabel: "Nonprofits and Mission-Driven Organizations",
      shortLabel: "Nonprofit",
      description:
        "Nonprofit and mission-driven organizations often need office locations that support employee accessibility, collaboration, stakeholder access, community proximity, and practical operations.",
      typicalOperatingPattern:
        "The office supports staff work, collaboration, community or stakeholder meetings, programs, volunteers, and administrative functions.",
      primaryLocationDrivers: [
        "transit access",
        "employee accessibility",
        "collaboration",
        "stakeholder access",
        "community proximity",
      ],
      secondaryPreferences: [
        "practical operating environment",
        "neighborhood identity",
        "flexible meeting spaces",
        "cost sensitivity as broker context only",
      ],
      materialQuestions: [
        "Who needs to reach the office most often: employees, clients, partners, or community members?",
        "Does neighborhood identity matter?",
        "How important is transit access?",
        "Does the organization need formal client-facing image or a more approachable setting?",
      ],
      buildingSearchFactors: [
        "meeting rooms",
        "accessibility",
        "transit and parking details",
        "program space",
        "operating cost and lease flexibility",
      ],
      brokerExecutionConsiderations: [
        "preserve cost sensitivity for broker review",
        "validate accessibility and transit at the building level",
        "compare lease flexibility and total occupancy cost after district fit is established",
      ],
      publishingGuidance:
        "Explain mission fit, accessibility, and stakeholder access without using unsupported rent or cheap-versus-expensive district claims.",
      knownLimits:
        "Budget, rent, and value language should remain context for broker execution unless a separate supported model exists.",
    },
  },
};
