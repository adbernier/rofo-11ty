module.exports = Object.freeze({
  experimentId: "growth-sacramento-industrial-v1",
  eyebrow: "Sacramento Industrial location guide",
  title: "Compare Sacramento operating environments before comparing buildings",
  seoTitle: "Sacramento Industrial and Warehouse Location Guide | Rofo",
  seoDescription: "Understand Power Inn, Natomas, and related Sacramento-area Industrial environments, their operating tradeoffs, and the property details to verify.",
  h1: "Industrial and Warehouse Space in Sacramento, CA",
  heroLead: "Sacramento Industrial searches can involve warehouse, distribution, contractor, service, production, last-mile, or hybrid space. Reviewed local context helps organize the search without automatically ranking locations or assuming a building can support a particular use.",
  introduction: "Power Inn and Natomas represent different in-city operating contexts. West Sacramento and Rancho Cordova add useful metro perspective. The right place depends on the operation, building requirements, employee and service geography, and property facts that still need verification.",
  entries: Object.freeze([
    Object.freeze({
      id: "power-inn-industrial",
      label: "Primary reviewed in-city context",
      name: "Power Inn Industrial",
      path: "/commercial-real-estate/CA/sacramento/power-inn-industrial/",
      summary: "A functional warehouse, contractor, service-commercial, light-manufacturing, and industrial-flex environment with practical access to Highway 50 and South Sacramento.",
      strengths: Object.freeze([
        "Meaningful depth across warehouse, small-bay service, production, and office/warehouse formats",
        "Useful context for businesses balancing operational access with an in-city Sacramento location",
      ]),
      tradeoffs: Object.freeze([
        "Building capability varies materially, so loading, circulation, power, yard needs, and permitted use require property review",
        "The operating environment is generally less suited to businesses led by lifestyle retail or formal client-facing office needs",
      ]),
    }),
    Object.freeze({
      id: "natomas",
      label: "Lighter service + last-mile context",
      name: "Natomas",
      path: "/commercial-real-estate/CA/sacramento/natomas/",
      summary: "A north Sacramento service-commercial and last-mile context shaped by I-5, I-80, airport orientation, and access to customers and routes across the northern part of the city.",
      strengths: Object.freeze([
        "Useful for lighter service, last-mile, and airport-oriented requirements where north Sacramento geography matters",
        "Can combine operational access with a more mixed commercial environment than a deeper industrial district",
      ]),
      tradeoffs: Object.freeze([
        "Conventional warehouse depth is more limited than in Power Inn or West Sacramento",
        "Heavier production, yard-intensive, or large-format logistics requirements may need a broader metro search",
      ]),
    }),
  ]),
  operatingPatterns: Object.freeze([
    Object.freeze({ name: "Warehouse and distribution", explanation: "Start with building function, loading, circulation, storage format, and the service territory rather than assuming any warehouse-labeled property works." }),
    Object.freeze({ name: "Small-bay contractor and service", explanation: "Power Inn can provide useful context for operations combining service vehicles, storage, work areas, and modest office needs." }),
    Object.freeze({ name: "Light manufacturing and technical production", explanation: "Power Inn includes reviewed production-oriented context, but power, ventilation, improvements, and use compatibility remain property-specific." }),
    Object.freeze({ name: "Last-mile and north-city service", explanation: "Natomas may matter when I-5, I-80, airport orientation, or north Sacramento customers shape the requirement." }),
    Object.freeze({ name: "Showroom and Flex", explanation: "Some businesses need customer-facing, office, or display space alongside operations; that mixed requirement should be evaluated separately from a conventional warehouse search." }),
    Object.freeze({ name: "Larger-format logistics", explanation: "West Sacramento provides a useful separate-city comparison when distribution scale and a deeper industrial setting lead the search." }),
  ]),
  contexts: Object.freeze([
    Object.freeze({
      name: "West Sacramento Industrial",
      path: "/commercial-real-estate/CA/west-sacramento/west-sacramento-industrial/",
      explanation: "A separate municipal market with deeper industrial and larger-format distribution context. It is a Sacramento-area environment worth understanding, not a Sacramento district or an automatically ranked alternative.",
    }),
    Object.freeze({
      name: "Rancho Cordova Commercial Core",
      path: "/commercial-real-estate/CA/rancho-cordova/rancho-cordova-commercial-core/",
      explanation: "A separate eastern metro context for office, flex, contractor, and service-oriented requirements. Its relevance depends on the operation and geography rather than a citywide ranking.",
    }),
  ]),
  representativeEnvironments: Object.freeze([
    Object.freeze({ label: "Power Inn technical environment", name: "8583 Elder Creek Road", path: "/commercial-real-estate/building/CA/sacramento/8583-elder-creek-rd/", contextName: "Power Inn Industrial", contextPath: "/commercial-real-estate/CA/sacramento/power-inn-industrial/", summary: "A reviewed technical and light-manufacturing reference that makes Power Inn's production-oriented commercial character tangible." }),
    Object.freeze({ label: "Power Inn service environment", name: "5711 Florin Perkins Road", path: "/commercial-real-estate/building/CA/sacramento/5711-florin-perkins-rd/", contextName: "Power Inn Industrial", contextPath: "/commercial-real-estate/CA/sacramento/power-inn-industrial/", summary: "A reviewed small-bay service and operational reference for businesses combining work areas, vehicles, storage, and modest office functions." }),
    Object.freeze({ label: "Natomas last-mile environment", name: "1329 North Market Boulevard", path: "/commercial-real-estate/building/CA/sacramento/1329-n-market-blvd/", contextName: "Natomas", contextPath: "/commercial-real-estate/CA/sacramento/natomas/", summary: "A reviewed north Sacramento reference that illustrates the last-mile and lighter service context associated with Natomas." }),
    Object.freeze({ label: "West Sacramento comparison", name: "3100 Ramco Street", path: "/commercial-real-estate/building/CA/west-sacramento/3100-ramco-st/", contextName: "West Sacramento Industrial", contextPath: "/commercial-real-estate/CA/west-sacramento/west-sacramento-industrial/", summary: "A reviewed larger-format distribution reference in a separate municipality, included to make the metro operating comparison concrete." }),
  ]),
  representativeDisclaimer: "Representative examples illustrate commercial character and may not be currently available. Loading, clear height, power, condition, economics, and use compatibility require current property-level investigation.",
  validation: Object.freeze([
    "Loading form, truck or service-vehicle access, circulation, and parking",
    "Clear height, building depth, office-to-warehouse mix, and functional layout",
    "Power, ventilation, refrigeration, yard, or other specialized infrastructure",
    "Permitted use, code, building condition, and required improvements",
    "Current availability, economics, and whether nearby metro alternatives should be investigated",
  ]),
  suppressInventoryModule: true,
  recommendation: Object.freeze({
    prompt: "Which Sacramento-area operating environment fits your actual requirement?",
    label: "See My Best-Fit Locations",
    path: "/best-fit-locations/?city=Sacramento&state=CA&marketId=sacramento&spaceType=Industrial%20%2F%20Warehouse%20%2F%20Flex&source=space_type&sourcePath=%2Fcommercial-real-estate%2FCA%2Fsacramento%2Findustrial-space%2F&journey=new",
  }),
});
