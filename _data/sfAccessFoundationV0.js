const locationKnowledgeGraph = require("./locationKnowledgeGraph");

const evidence = [
  {
    evidenceId: "sf-access-evidence:commercial-geography",
    claimType: "CANONICAL_GEOGRAPHY",
    claim: "San Francisco, East Bay, North Bay, Peninsula, and South Bay are separately identified canonical Bay Area Markets.",
    source: { sourceType: "REPOSITORY", reference: "_data/commercialGeography.js" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["Market identity does not establish travel quality or workforce share."],
  },
  {
    evidenceId: "sf-access-evidence:kg-bounded-attributes",
    claimType: "DISTRICT_ACCESS_CHARACTERISTIC",
    claim: "The Knowledge Graph contains reviewed bounded transit, parking, and freeway-access attributes for canonical SF districts.",
    source: { sourceType: "REPOSITORY", reference: "_data/locationKnowledgeGraph.js" },
    confidence: "MEDIUM", reviewStatus: "APPROVED", limitations: ["Attributes are district-wide and do not identify a specific origin, station, route, parking supply, or travel time."],
  },
  {
    evidenceId: "sf-access-evidence:financial-district-regional-transit",
    claimType: "SYSTEM_SERVICE",
    claim: "Financial District evidence supports BART, ferry, Muni, and downtown walking access as durable regional-access characteristics.",
    source: { sourceType: "REPOSITORY_CME", reference: "data/commercial-market-evidence/san-francisco/financial-district.js" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["Exact station, ferry route, and building walk time remain outside v0."],
  },
  {
    evidenceId: "sf-access-evidence:jackson-square-bart",
    claimType: "SYSTEM_SERVICE",
    claim: "Jackson Square CME identifies central BART and Market Street transit access as a relevant office decision relationship.",
    source: { sourceType: "REPOSITORY_CME", reference: "data/commercial-market-evidence/san-francisco/jackson-square.js" },
    confidence: "MEDIUM", reviewStatus: "APPROVED", limitations: ["The district is not directly represented as a station catchment; access is downtown-adjacent and should remain GOOD rather than STRONG."],
  },
  {
    evidenceId: "sf-access-evidence:soma-caltrain",
    claimType: "SYSTEM_SERVICE",
    claim: "SoMa CME contains Caltrain-oriented Townsend corridor office evidence and explicitly ties the relationship to employee geography.",
    source: { sourceType: "REPOSITORY_CME", reference: "data/commercial-market-evidence/san-francisco/soma.js" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["SoMa is large and block-level access varies."],
  },
  {
    evidenceId: "sf-access-evidence:mission-bay-caltrain",
    claimType: "SYSTEM_SERVICE",
    claim: "Mission Bay Knowledge Graph and CME evidence identify Caltrain adjacency as a durable access characteristic.",
    source: { sourceType: "REPOSITORY_CME", reference: "data/commercial-market-evidence/san-francisco/mission-bay.js" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["Exact access varies by district node and building."],
  },
  {
    evidenceId: "sf-access-evidence:south-beach-caltrain",
    claimType: "SYSTEM_SERVICE",
    claim: "South Beach CME identifies ballpark and China Basin environments as useful Caltrain-proximate comparisons.",
    source: { sourceType: "REPOSITORY_CME", reference: "data/commercial-market-evidence/san-francisco/south-beach.js" },
    confidence: "MEDIUM", reviewStatus: "APPROVED", limitations: ["The district boundary is broad; Caltrain relevance is stronger toward its southern edge."],
  },
  {
    evidenceId: "sf-access-evidence:mission-district-bart",
    claimType: "SYSTEM_SERVICE",
    claim: "Mission District CME explicitly documents selective office near 16th Street BART and a district identity supported by BART access.",
    source: { sourceType: "REPOSITORY_CME", reference: "data/commercial-market-evidence/san-francisco/mission-district.js" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["Office fit is selective and belongs to recommendation composition outside Access Fit."],
  },
  {
    evidenceId: "sf-access-evidence:local-transit",
    claimType: "LOCAL_ACCESS",
    claim: "Knowledge Graph attributes and district CME support qualitative local-transit access for the evaluated districts.",
    source: { sourceType: "REPOSITORY", reference: "_data/locationKnowledgeGraph.js and data/commercial-market-evidence/san-francisco/" },
    confidence: "MEDIUM", reviewStatus: "APPROVED", limitations: ["No station, route-frequency, or time-of-day model is included."],
  },
  {
    evidenceId: "sf-access-evidence:central-driving",
    claimType: "LOCAL_ACCESS",
    claim: "The evaluated districts have bounded Knowledge Graph freeway-access attributes that support only a moderate local-driving relationship in v0.",
    source: { sourceType: "REPOSITORY", reference: "_data/locationKnowledgeGraph.js" },
    confidence: "MEDIUM", reviewStatus: "APPROVED", limitations: ["This is not evidence of a favorable commute, live traffic, or a particular freeway approach."],
  },
  {
    evidenceId: "sf-access-evidence:parking-environment",
    claimType: "PARKING_ENVIRONMENT",
    claim: "Knowledge Graph parking attributes and district tradeoffs support qualitative district parking environments.",
    source: { sourceType: "REPOSITORY", reference: "_data/locationKnowledgeGraph.js" },
    confidence: "MEDIUM", reviewStatus: "APPROVED", limitations: ["Building parking, cost, allocation, and availability remain property-level VERIFY facts."],
  },
  {
    evidenceId: "sf-access-evidence:bridge-ferry-hypothesis",
    claimType: "GATEWAY_RELATIONSHIP",
    claim: "Current SF recommendation documentation identifies Golden Gate Bridge, Bay Bridge, and ferry orientation as missing normalization work rather than validated production-ready access metadata.",
    source: { sourceType: "REPOSITORY_DESIGN", reference: "docs/product/sf-office-location-decision-model.md" },
    confidence: "LOW", reviewStatus: "CANDIDATE", limitations: ["Must not influence Access Fit until primary/official evidence and editorial review are complete."],
  },
  {
    evidenceId: "sf-access-evidence:peninsula-road-hypothesis",
    claimType: "GATEWAY_RELATIONSHIP",
    claim: "US-101 and I-280 are plausible Peninsula/South Bay access systems, but current district-specific approach relationships are not sufficiently normalized for v0 evaluation.",
    source: { sourceType: "REPOSITORY_DESIGN", reference: "docs/product/sf-office-location-decision-model.md" },
    confidence: "LOW", reviewStatus: "CANDIDATE", limitations: ["Must not influence Access Fit."],
  },
  {
    evidenceId: "sf-access-evidence:golden-gate-structural",
    claimType: "GATEWAY_RELATIONSHIP",
    claim: "The Golden Gate Bridge is the US-101 transportation link between Marin County and San Francisco; the south bridge landing is at the Presidio's northern edge.",
    source: { sourceType: "OFFICIAL_AUTHORITY", reference: "https://www.goldengate.org/bridge/bridge-operations/ and https://presidio.gov/visit/getting-to-and-around-the-park/public-transit-to-the-presidio" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["Structural connectivity does not represent traffic, travel time, or the distribution of North Bay origins."],
  },
  {
    evidenceId: "sf-access-evidence:presidio-access",
    claimType: "DISTRICT_ACCESS_CHARACTERISTIC",
    claim: "Official Presidio transportation guidance documents Golden Gate Transit stops at the bridge and Gorgas Gate, multiple Muni routes, a downtown shuttle, internal shuttle service, and paid parking throughout the park.",
    source: { sourceType: "OFFICIAL_PRESIDIO", reference: "https://presidio.gov/visit/getting-to-and-around-the-park/public-transit-to-the-presidio and https://presidio.gov/visit/getting-to-and-around-the-park and https://presidio.gov/visit/getting-to-and-around-the-park/presidio-go-shuttle" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["Service schedules can change; parking statements do not establish office-building allocation, cost, or availability."],
  },
  {
    evidenceId: "sf-access-evidence:ferry-system-reviewed",
    claimType: "SYSTEM_SERVICE",
    claim: "Official ferry sources document North Bay and East Bay services terminating at San Francisco's Ferry Building terminals at the foot of Market Street.",
    source: { sourceType: "OFFICIAL_TRANSIT_PORT", reference: "https://www.goldengate.org/ferry/schedules-maps/ and https://www.sfport.com/ferry and https://www.sfport.com/visit/getting-around" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["Ferry service is route- and schedule-specific and should not be treated as the dominant mode for every origin-region traveler."],
  },
  {
    evidenceId: "sf-access-evidence:bay-bridge-structural",
    claimType: "GATEWAY_RELATIONSHIP",
    claim: "The San Francisco-Oakland Bay Bridge carries I-80 between Alameda County and San Francisco; official regional corridor documentation places the SF I-80 segment between the bridge and the US-101 interchange in SoMa.",
    source: { sourceType: "OFFICIAL_REGIONAL", reference: "https://mtc.ca.gov/operations/programs-projects/bridges/san-francisco-oakland-bay-bridge and https://mtc.ca.gov/sites/default/files/documents/2025-12/Next_Generation_Bay_Area_Freeways_Study_Report_Technical_Analysis_Sub_Appendix_C.pdf" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["No traffic condition or exact district travel time is represented; districts beyond the I-80 landing require local street travel."],
  },
  {
    evidenceId: "sf-access-evidence:peninsula-freeways-reviewed",
    claimType: "GATEWAY_RELATIONSHIP",
    claim: "Official regional corridor documentation identifies US-101 and I-280 as the Peninsula/South Bay freeway approaches into San Francisco, with I-280 extending to Brannan Street and documented ramp touchdowns in Mission/Potrero geography.",
    source: { sourceType: "OFFICIAL_REGIONAL", reference: "https://mtc.ca.gov/sites/default/files/documents/2025-12/Next_Generation_Bay_Area_Freeways_Study_Report_Technical_Analysis_Sub_Appendix_C.pdf and https://www.sfcta.org/projects/vision-zero-freeway-ramps-study" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["The foundation represents structural approach, not live congestion, exact routes, or travel time; district relationships remain broad."],
  },
  {
    evidenceId: "sf-access-evidence:presidio-canonical",
    claimType: "CANONICAL_GEOGRAPHY",
    claim: "The existing Presidio public/editorial district object, route, coordinates, Commercial Location Model entry, and map identity reconcile to one canonical shadow Knowledge Graph district.",
    source: { sourceType: "REPOSITORY", reference: "_data/neighborhoodPages.js, _data/commercialLocationModel.js, _data/editorialDistrictMaps.js, and _data/locationKnowledgeGraph.js" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["Canonical shadow identity does not add Presidio to production recommendation scoring or establish current office availability."],
  },
  {
    evidenceId: "sf-access-evidence:powell-civic-bart",
    claimType: "SYSTEM_SERVICE",
    claim: "Official BART station information establishes Powell Street as the Union Square regional-rail gateway and Civic Center/UN Plaza as a combined BART and Muni Metro downtown station.",
    source: { sourceType: "OFFICIAL_TRANSIT", reference: "https://www.bart.gov/stations/powl and https://www.bart.gov/stations/civc" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["Station access does not establish building-level walking distance or a district-wide commute time."],
  },
  {
    evidenceId: "sf-access-evidence:hayes-transit-parking",
    claimType: "DISTRICT_ACCESS_CHARACTERISTIC",
    claim: "SFMTA's reviewed Hayes Valley parking and curb plan documents the neighborhood commercial core, local transit, active pickup/loading demand, and curb/parking pressure.",
    source: { sourceType: "OFFICIAL_TRANSPORTATION", reference: "https://www.sfmta.com/projects/hayes-valley-parking-curb-management-plan and https://www.sfmta.com/projects/pay-or-permit-parking-expansion-project" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["The plan does not establish building parking supply or exact commute performance."],
  },
  {
    evidenceId: "sf-access-evidence:marina-northern-access",
    claimType: "DISTRICT_ACCESS_CHARACTERISTIC",
    claim: "The Marina's northern location connects to the Golden Gate Bridge approach through the Lombard corridor and is served by SFMTA local transit; it has no direct BART or Caltrain station.",
    source: { sourceType: "OFFICIAL_TRANSPORTATION", reference: "https://www.sfmta.com/routes/28-19th-avenue and https://www.goldengate.org/bridge/bridge-operations/" },
    confidence: "MEDIUM", reviewStatus: "APPROVED", limitations: ["Structural orientation does not represent live congestion, parking availability, or a guaranteed North Bay commute."],
  },
  {
    evidenceId: "sf-access-evidence:sf-core-regional-connections",
    claimType: "GATEWAY_RELATIONSHIP",
    claim: "Official regional rail and freeway systems reach San Francisco through BART, Caltrain, the Bay Bridge, US-101, and I-280; reviewed district relationships distinguish direct gateways from bounded local-transfer or local-street connections.",
    source: { sourceType: "OFFICIAL_REGIONAL", reference: "https://www.bart.gov/stations, https://www.caltrain.com/stations-zones, https://mtc.ca.gov/operations/programs-projects/bridges/san-francisco-oakland-bay-bridge" },
    confidence: "MEDIUM", reviewStatus: "APPROVED", limitations: ["Transfer relationships are qualitative and do not model schedules, congestion, or travel time."],
  },
  {
    evidenceId: "sf-access-evidence:creative-district-canonical",
    claimType: "CANONICAL_GEOGRAPHY",
    claim: "Design District, Showplace Square, and Potrero Hill are existing SF Knowledge Graph recommendation identities. Showplace Square is the canonical knowledge owner for the substantially overlapping Showplace Square / Design District geography; Design District remains a compatibility identity and public route, while Potrero Hill remains a separate bounded neighborhood identity.",
    source: { sourceType: "REPOSITORY", reference: "_data/locationKnowledgeGraph.js, _data/commercialLocationModel.js, _data/sfOfficeRecommendationModel.js, and data/commercial-market-evidence/san-francisco/" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["Separate recommendation IDs do not imply non-overlapping physical catchments; Design District and Showplace Square access judgments carry an explicit overlap limitation."],
  },
  {
    evidenceId: "sf-access-evidence:showplace-potrero-local-transit",
    claimType: "LOCAL_ACCESS",
    claim: "Official SFMTA material documents multiple Potrero Hill routes and local connections through the 16th Street corridor, including service linking Potrero Hill with Mission BART and Mission Bay; the official Showplace Square/Potrero Area Plan identifies 16th Street and north-south routes as the area's key transit corridors.",
    source: { sourceType: "OFFICIAL_LOCAL", reference: "https://www.sfmta.com/neighborhoods/potrero-hill, https://www.sfmta.com/routes/22-fillmore, https://www.sfmta.com/projects/55-dogpatch, and https://generalplan.sfplanning.org/Showplace_Square_Potrero.htm" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["Service and walking quality vary by block; Potrero Hill grades and the Design District / Showplace overlap prevent a station-catchment claim."],
  },
  {
    evidenceId: "sf-access-evidence:dogpatch-access",
    claimType: "DISTRICT_ACCESS_CHARACTERISTIC",
    claim: "Existing official SFMTA, SF Planning, SFCTA, and Caltrain evidence supports Dogpatch as a locally connected southeast district with a direct 22nd Street Caltrain relationship and structural I-280 / US-101 approach access.",
    source: { sourceType: "OFFICIAL_LOCAL", reference: "https://www.sfmta.com/projects/55-dogpatch, https://generalplan.sfplanning.org/Showplace_Square_Potrero.htm, https://www.sfcta.org/projects/vision-zero-freeway-ramps-study, and https://www.caltrain.com/station/22nd-street" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["Access varies within Dogpatch; no live traffic, exact walk time, service frequency, or building parking is represented."],
  },
  {
    evidenceId: "sf-access-evidence:showplace-potrero-regional-connections",
    claimType: "SYSTEM_SERVICE",
    claim: "The official Showplace Square/Potrero Area Plan identifies Civic Center and 16th Street BART, 4th & King and 22nd Street Caltrain, and the Transbay Terminal as regional hubs needing links from the area; SFMTA documents a direct Potrero Hill connection to 16th Street BART.",
    source: { sourceType: "OFFICIAL_LOCAL", reference: "https://generalplan.sfplanning.org/Showplace_Square_Potrero.htm, https://www.sfmta.com/projects/55-dogpatch, and https://www.caltrain.com/station/sanfrancisco" },
    confidence: "MEDIUM", reviewStatus: "APPROVED", limitations: ["These are connection-and-transfer relationships, not direct BART station or uniformly walkable Caltrain catchments; ratings remain MODERATE."],
  },
  {
    evidenceId: "sf-access-evidence:showplace-potrero-freeways",
    claimType: "GATEWAY_RELATIONSHIP",
    claim: "The official Showplace Square/Potrero Area Plan identifies US-101 and I-280 as freeway approaches serving commuters and deliveries in the area, while SFCTA documents US-101 and I-280 ramp touchdowns in Mission/Potrero geography.",
    source: { sourceType: "OFFICIAL_LOCAL", reference: "https://generalplan.sfplanning.org/Showplace_Square_Potrero.htm and https://www.sfcta.org/projects/vision-zero-freeway-ramps-study" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["The relationship is structural and district-wide only; it does not represent live congestion, exact routes, or uniform access across the residential hill."],
  },
  {
    evidenceId: "sf-access-evidence:showplace-potrero-parking",
    claimType: "PARKING_ENVIRONMENT",
    claim: "The official Showplace Square/Potrero Area Plan describes variable parking demand, residential permit areas, private garages, Design Center and CCA demand, constrained curb management, and policies favoring managed rather than abundant parking.",
    source: { sourceType: "OFFICIAL_PLANNING", reference: "https://generalplan.sfplanning.org/Showplace_Square_Potrero.htm" },
    confidence: "HIGH", reviewStatus: "APPROVED", limitations: ["This supports a MODERATE qualitative district environment only; it does not establish building parking, availability, allocation, or cost."],
  },
];

const approved = "APPROVED";
const candidate = "CANDIDATE";
const edge = (fields) => ({ confidence: fields.reviewStatus === approved ? "MEDIUM" : "LOW", limitations: [], ...fields });

const originRegions = [
  { originRegionId: "sf-origin:san-francisco", marketId: "san-francisco", label: "San Francisco", regionType: "LOCAL_CORE", canonicalGeographyRefs: ["market:san-francisco"], localToMarket: true, gatewayRelationshipIds: ["sf-gateway:local-transit", "sf-gateway:central-street-network"], evidenceIds: ["sf-access-evidence:commercial-geography"], confidence: "HIGH", reviewStatus: approved, limitations: ["No neighborhood-level employee distribution is represented."] },
  { originRegionId: "sf-origin:east-bay", marketId: "san-francisco", label: "East Bay", regionType: "CANONICAL_MARKET", canonicalGeographyRefs: ["market:east-bay"], localToMarket: false, gatewayRelationshipIds: ["sf-gateway:bart", "sf-gateway:bay-bridge"], evidenceIds: ["sf-access-evidence:commercial-geography"], confidence: "HIGH", reviewStatus: approved, limitations: ["No workforce shares or city-level distribution within East Bay are assumed."] },
  { originRegionId: "sf-origin:north-bay", marketId: "san-francisco", label: "Marin / North Bay", regionType: "CANONICAL_MARKET", canonicalGeographyRefs: ["market:north-bay"], localToMarket: false, gatewayRelationshipIds: ["sf-gateway:golden-gate-bridge", "sf-gateway:ferry"], evidenceIds: ["sf-access-evidence:commercial-geography"], confidence: "HIGH", reviewStatus: approved, limitations: ["The canonical North Bay market is broader than Marin; v0 does not infer city or mode distribution."] },
  { originRegionId: "sf-origin:peninsula", marketId: "san-francisco", label: "Peninsula", regionType: "CANONICAL_MARKET", canonicalGeographyRefs: ["market:peninsula"], localToMarket: false, gatewayRelationshipIds: ["sf-gateway:caltrain", "sf-gateway:us-101", "sf-gateway:i-280"], evidenceIds: ["sf-access-evidence:commercial-geography"], confidence: "HIGH", reviewStatus: approved, limitations: ["No city-level distribution or workforce share is assumed."] },
  { originRegionId: "sf-origin:south-bay", marketId: "san-francisco", label: "South Bay", regionType: "CANONICAL_MARKET", canonicalGeographyRefs: ["market:south-bay"], localToMarket: false, gatewayRelationshipIds: ["sf-gateway:caltrain", "sf-gateway:us-101", "sf-gateway:i-280"], evidenceIds: ["sf-access-evidence:commercial-geography"], confidence: "HIGH", reviewStatus: approved, limitations: ["South Bay remains distinct from Peninsula; no city-level distribution is assumed."] },
];

const gateways = [
  {
    gatewayId: "sf-gateway:bart", marketId: "san-francisco", label: "BART", gatewayType: "REGIONAL_RAIL", modes: ["REGIONAL_TRANSIT"], reviewStatus: approved, confidence: "HIGH",
    originRelationships: [edge({ originRegionId: "sf-origin:east-bay", rating: "STRONG", reviewStatus: approved, evidenceIds: ["sf-access-evidence:financial-district-regional-transit", "sf-access-evidence:mission-district-bart"] })],
    districtRelationships: [
      edge({ districtId: "financial-district", rating: "STRONG", reviewStatus: approved, evidenceIds: ["sf-access-evidence:financial-district-regional-transit"] }),
      edge({ districtId: "jackson-square", rating: "GOOD", reviewStatus: approved, evidenceIds: ["sf-access-evidence:jackson-square-bart"] }),
      edge({ districtId: "mission-district", rating: "STRONG", reviewStatus: approved, evidenceIds: ["sf-access-evidence:mission-district-bart"] }),
      ...["design-district", "showplace-square", "potrero-hill"].map((districtId) => edge({ districtId, rating: "MODERATE", reviewStatus: approved, evidenceIds: ["sf-access-evidence:showplace-potrero-local-transit", "sf-access-evidence:showplace-potrero-regional-connections"], limitations: ["Requires a local connection or transfer; this is not a direct BART station catchment."] })),
    ],
  },
  {
    gatewayId: "sf-gateway:caltrain", marketId: "san-francisco", label: "Caltrain", gatewayType: "COMMUTER_RAIL", modes: ["REGIONAL_TRANSIT"], reviewStatus: approved, confidence: "HIGH",
    originRelationships: [
      edge({ originRegionId: "sf-origin:peninsula", rating: "STRONG", reviewStatus: approved, evidenceIds: ["sf-access-evidence:soma-caltrain", "sf-access-evidence:mission-bay-caltrain"] }),
      edge({ originRegionId: "sf-origin:south-bay", rating: "STRONG", reviewStatus: approved, evidenceIds: ["sf-access-evidence:soma-caltrain", "sf-access-evidence:mission-bay-caltrain"] }),
    ],
    districtRelationships: [
      edge({ districtId: "soma", rating: "STRONG", reviewStatus: approved, evidenceIds: ["sf-access-evidence:soma-caltrain"] }),
      edge({ districtId: "mission-bay", rating: "STRONG", reviewStatus: approved, evidenceIds: ["sf-access-evidence:mission-bay-caltrain"] }),
      edge({ districtId: "south-beach", rating: "GOOD", reviewStatus: approved, evidenceIds: ["sf-access-evidence:south-beach-caltrain"] }),
      edge({ districtId: "dogpatch", rating: "GOOD", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:dogpatch-access"], limitations: ["The relationship is strongest around the 22nd Street station and does not establish a uniform district walk shed."] }),
      ...["design-district", "showplace-square", "potrero-hill"].map((districtId) => edge({ districtId, rating: "MODERATE", reviewStatus: approved, evidenceIds: ["sf-access-evidence:showplace-potrero-regional-connections"], limitations: ["Caltrain relevance varies by block and requires local travel; no uniform walkable station catchment is asserted."] })),
    ],
  },
  {
    gatewayId: "sf-gateway:ferry", marketId: "san-francisco", label: "Bay ferry system", gatewayType: "FERRY", modes: ["FERRY", "REGIONAL_TRANSIT"], reviewStatus: approved, confidence: "HIGH",
    originRelationships: [
      edge({ originRegionId: "sf-origin:north-bay", rating: "GOOD", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:ferry-system-reviewed"] }),
      edge({ originRegionId: "sf-origin:east-bay", rating: "GOOD", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:ferry-system-reviewed"] }),
    ],
    districtRelationships: [edge({ districtId: "financial-district", rating: "STRONG", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:financial-district-regional-transit", "sf-access-evidence:ferry-system-reviewed"], limitations: ["Ferry access is strongest around the Ferry Building side of the broader Financial District."] })],
  },
  {
    gatewayId: "sf-gateway:golden-gate-bridge", marketId: "san-francisco", label: "Golden Gate Bridge / northern driving approach", gatewayType: "BRIDGE", modes: ["DRIVING"], reviewStatus: approved, confidence: "HIGH",
    originRelationships: [edge({ originRegionId: "sf-origin:north-bay", rating: "STRONG", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:golden-gate-structural"] })],
    districtRelationships: [edge({ districtId: "presidio", rating: "STRONG", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:golden-gate-structural", "sf-access-evidence:presidio-access"], limitations: ["The rating represents direct structural northern access, not a guaranteed commute time or building-specific route."] })],
  },
  {
    gatewayId: "sf-gateway:bay-bridge", marketId: "san-francisco", label: "Bay Bridge / eastern driving approach", gatewayType: "BRIDGE", modes: ["DRIVING"], reviewStatus: approved, confidence: "HIGH",
    originRelationships: [edge({ originRegionId: "sf-origin:east-bay", rating: "STRONG", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:bay-bridge-structural"] })],
    districtRelationships: [
      edge({ districtId: "soma", rating: "GOOD", reviewStatus: approved, evidenceIds: ["sf-access-evidence:bay-bridge-structural"], limitations: ["SoMa is large; local street travel varies by destination."] }),
      edge({ districtId: "south-beach", rating: "GOOD", reviewStatus: approved, evidenceIds: ["sf-access-evidence:bay-bridge-structural"], limitations: ["No live bridge or street congestion is represented."] }),
      edge({ districtId: "mission-bay", rating: "MODERATE", reviewStatus: approved, evidenceIds: ["sf-access-evidence:bay-bridge-structural"], limitations: ["Mission Bay requires additional local travel beyond the bridge landing."] }),
    ],
  },
  {
    gatewayId: "sf-gateway:us-101", marketId: "san-francisco", label: "US-101 Peninsula / South Bay approach", gatewayType: "FREEWAY", modes: ["DRIVING"], reviewStatus: approved, confidence: "HIGH",
    originRelationships: [edge({ originRegionId: "sf-origin:peninsula", rating: "GOOD", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed"] }), edge({ originRegionId: "sf-origin:south-bay", rating: "GOOD", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed"] })],
    districtRelationships: [
      edge({ districtId: "soma", rating: "MODERATE", reviewStatus: approved, evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed"] }),
      edge({ districtId: "mission-bay", rating: "GOOD", reviewStatus: approved, evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed"] }),
      edge({ districtId: "south-beach", rating: "MODERATE", reviewStatus: approved, evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed"] }),
      edge({ districtId: "mission-district", rating: "GOOD", reviewStatus: approved, evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed"], limitations: ["The relationship is strongest near documented Mission/Potrero ramp geography, not uniformly across the district."] }),
      edge({ districtId: "dogpatch", rating: "MODERATE", reviewStatus: approved, evidenceIds: ["sf-access-evidence:dogpatch-access", "sf-access-evidence:peninsula-freeways-reviewed"], limitations: ["Structural approach only; local routing and congestion remain unmodeled."] }),
      ...["design-district", "showplace-square", "potrero-hill"].map((districtId) => edge({ districtId, rating: "MODERATE", reviewStatus: approved, evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed", "sf-access-evidence:showplace-potrero-freeways"], limitations: ["Structural approach only; access varies across Showplace blocks and Potrero Hill topography."] })),
    ],
  },
  {
    gatewayId: "sf-gateway:i-280", marketId: "san-francisco", label: "I-280 Peninsula / South Bay approach", gatewayType: "INTERSTATE", modes: ["DRIVING"], reviewStatus: approved, confidence: "HIGH",
    originRelationships: [edge({ originRegionId: "sf-origin:peninsula", rating: "GOOD", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed"] }), edge({ originRegionId: "sf-origin:south-bay", rating: "GOOD", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed"] })],
    districtRelationships: [
      edge({ districtId: "soma", rating: "GOOD", reviewStatus: approved, evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed"], limitations: ["I-280 reaches Brannan Street; access within broad SoMa varies."] }),
      edge({ districtId: "mission-bay", rating: "GOOD", reviewStatus: approved, evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed"] }),
      edge({ districtId: "south-beach", rating: "GOOD", reviewStatus: approved, evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed"] }),
      edge({ districtId: "mission-district", rating: "MODERATE", reviewStatus: approved, evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed"], limitations: ["Relevant only through documented Mission/Potrero ramp geography and local streets."] }),
      edge({ districtId: "dogpatch", rating: "GOOD", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:dogpatch-access", "sf-access-evidence:peninsula-freeways-reviewed"], limitations: ["Structural district relationship only; no exact ramp or travel time is asserted."] }),
      ...["design-district", "showplace-square", "potrero-hill"].map((districtId) => edge({ districtId, rating: "MODERATE", reviewStatus: approved, evidenceIds: ["sf-access-evidence:peninsula-freeways-reviewed", "sf-access-evidence:showplace-potrero-freeways"], limitations: ["Structural approach only; no exact ramp, route, traffic, or district-wide uniformity is represented."] })),
    ],
  },
  {
    gatewayId: "sf-gateway:local-transit", marketId: "san-francisco", label: "Central San Francisco local transit", gatewayType: "BUS_NETWORK", modes: ["LOCAL_TRANSIT"], reviewStatus: approved, confidence: "MEDIUM",
    originRelationships: [edge({ originRegionId: "sf-origin:san-francisco", rating: "STRONG", reviewStatus: approved, evidenceIds: ["sf-access-evidence:local-transit"] })],
    districtRelationships: ["financial-district", "soma", "mission-bay", "jackson-square", "south-beach", "mission-district"].map((districtId) => edge({ districtId, rating: "STRONG", reviewStatus: approved, evidenceIds: ["sf-access-evidence:local-transit"] })).concat(["design-district", "showplace-square", "potrero-hill"].map((districtId) => edge({ districtId, rating: "GOOD", reviewStatus: approved, evidenceIds: ["sf-access-evidence:showplace-potrero-local-transit"], limitations: ["Local transit is supported, but block-level walking, transfers, and Potrero Hill grades remain material friction."] })), [edge({ districtId: "dogpatch", rating: "GOOD", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:dogpatch-access"], limitations: ["Local transit coverage varies by block."] }), edge({ districtId: "presidio", rating: "GOOD", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:presidio-access"], limitations: ["Local access depends on bus/shuttle routes rather than rail service."] })]),
  },
  {
    gatewayId: "sf-gateway:central-street-network", marketId: "san-francisco", label: "Central San Francisco street network", gatewayType: "ACCESS_CORRIDOR", modes: ["DRIVING"], reviewStatus: approved, confidence: "MEDIUM",
    originRelationships: [edge({ originRegionId: "sf-origin:san-francisco", rating: "GOOD", reviewStatus: approved, evidenceIds: ["sf-access-evidence:central-driving"] })],
    districtRelationships: ["financial-district", "soma", "mission-bay", "jackson-square", "south-beach", "mission-district"].map((districtId) => edge({ districtId, rating: "MODERATE", reviewStatus: approved, evidenceIds: ["sf-access-evidence:central-driving"] })).concat(["design-district", "showplace-square", "potrero-hill"].map((districtId) => edge({ districtId, rating: "MODERATE", reviewStatus: approved, evidenceIds: ["sf-access-evidence:central-driving", "sf-access-evidence:showplace-potrero-freeways"], limitations: ["Street access does not imply a fast commute; congestion, topography, and block conditions are not modeled."] })), [edge({ districtId: "dogpatch", rating: "MODERATE", reviewStatus: approved, evidenceIds: ["sf-access-evidence:dogpatch-access"], limitations: ["Street access does not imply a fast commute."] }), edge({ districtId: "presidio", rating: "GOOD", reviewStatus: approved, confidence: "HIGH", evidenceIds: ["sf-access-evidence:presidio-access"], limitations: ["Structural local access only; cross-city friction and live traffic are not modeled."] })]),
  },
];

// Reviewed structural completion for the meaningful SF Office universe. These are
// gateway-to-district facts, not Requirement-to-district recommendations.
const addDistrictRelationships = (gatewayId, relationships, evidenceIds = ["sf-access-evidence:sf-core-regional-connections"]) => {
  const gateway = gateways.find((item) => item.gatewayId === gatewayId);
  for (const [districtId, rating] of Object.entries(relationships)) {
    if (!gateway.districtRelationships.some((item) => item.districtId === districtId)) {
      gateway.districtRelationships.push(edge({ districtId, rating, reviewStatus: approved, evidenceIds, limitations: ["Reviewed structural relationship only; exact route, transfer, congestion, and travel time remain outside the foundation."] }));
    }
  }
};

addDistrictRelationships("sf-gateway:bart", {
  soma: "GOOD", "mission-bay": "MODERATE", "south-beach": "GOOD", dogpatch: "MODERATE", presidio: "WEAK",
  "union-square": "STRONG", "civic-center": "STRONG", "hayes-valley": "GOOD", "marina-district": "WEAK",
}, ["sf-access-evidence:powell-civic-bart", "sf-access-evidence:sf-core-regional-connections"]);
addDistrictRelationships("sf-gateway:caltrain", {
  "financial-district": "MODERATE", "jackson-square": "WEAK", "mission-district": "MODERATE", presidio: "WEAK",
  "union-square": "MODERATE", "civic-center": "MODERATE", "hayes-valley": "MODERATE", "marina-district": "WEAK",
});
addDistrictRelationships("sf-gateway:golden-gate-bridge", {
  "financial-district": "MODERATE", "jackson-square": "GOOD", soma: "WEAK", "mission-bay": "WEAK", "south-beach": "WEAK",
  "mission-district": "WEAK", dogpatch: "WEAK", "showplace-square": "WEAK", "design-district": "WEAK", "potrero-hill": "WEAK",
  "union-square": "MODERATE", "civic-center": "WEAK", "hayes-valley": "MODERATE", "marina-district": "GOOD",
}, ["sf-access-evidence:golden-gate-structural", "sf-access-evidence:marina-northern-access"]);
addDistrictRelationships("sf-gateway:bay-bridge", {
  "financial-district": "GOOD", "jackson-square": "MODERATE", "mission-district": "MODERATE", dogpatch: "MODERATE", presidio: "WEAK",
  "showplace-square": "MODERATE", "design-district": "MODERATE", "potrero-hill": "MODERATE",
  "union-square": "MODERATE", "civic-center": "MODERATE", "hayes-valley": "MODERATE", "marina-district": "WEAK",
}, ["sf-access-evidence:bay-bridge-structural", "sf-access-evidence:sf-core-regional-connections"]);
addDistrictRelationships("sf-gateway:us-101", {
  "financial-district": "MODERATE", "jackson-square": "WEAK", presidio: "WEAK", "union-square": "MODERATE", "civic-center": "MODERATE", "hayes-valley": "MODERATE", "marina-district": "WEAK",
});
addDistrictRelationships("sf-gateway:i-280", {
  "financial-district": "MODERATE", "jackson-square": "WEAK", presidio: "WEAK", "union-square": "MODERATE", "civic-center": "MODERATE", "hayes-valley": "MODERATE", "marina-district": "WEAK",
});
addDistrictRelationships("sf-gateway:local-transit", { "union-square": "STRONG", "civic-center": "STRONG", "hayes-valley": "GOOD", "marina-district": "GOOD" });
addDistrictRelationships("sf-gateway:central-street-network", { "union-square": "MODERATE", "civic-center": "MODERATE", "hayes-valley": "MODERATE", "marina-district": "GOOD" });

const complete = (overrides = {}) => ({ originRegions: "SUFFICIENT", gateways: "SUFFICIENT", districtGeometry: "MISSING", originAccess: "PARTIAL", transit: "SUFFICIENT", driving: "PARTIAL", parking: "SUFFICIENT", ferry: "PARTIAL", explanations: "SUFFICIENT", ...overrides });
const profile = (districtId, parkingEnvironment, options = {}) => {
  const node = locationKnowledgeGraph.find((item) => item.slug === districtId);
  return {
    profileId: `sf-access-profile:${districtId}`,
    marketId: "san-francisco",
    districtId,
    districtName: node && node.label || districtId,
    canonicalGeographyRef: `district:${districtId}`,
    propertyTypeFit: node && node.spaceTypeFit && node.spaceTypeFit.office && node.spaceTypeFit.office.fit || "unknown",
    recommendationEligible: options.recommendationEligible === true ? true : Boolean(node && node.recommendationEligible !== false),
    productionRecommendationEligible: Boolean(node && node.recommendationEligible !== false),
    startingDistrict: options.startingDistrict !== false,
    accessActivationEligible: Boolean(options.accessActivationEligible),
    accessKnowledgeOwnerDistrictId: options.accessKnowledgeOwnerDistrictId || districtId,
    accessKnowledgeTreatment: options.accessKnowledgeTreatment || "DIRECT_DISTRICT_PROFILE",
    parkingEnvironment,
    parkingEvidenceIds: options.parkingEvidenceIds || ["sf-access-evidence:parking-environment"],
    gatewayRelationships: gateways.flatMap((gateway) => (gateway.districtRelationships || []).filter((item) => item.districtId === districtId).map((item) => ({ gatewayId: gateway.gatewayId, rating: item.rating, reviewStatus: item.reviewStatus, confidence: item.confidence, evidenceIds: item.evidenceIds, limitations: item.limitations }))),
    originAccess: [],
    completeness: complete(options.completeness),
    confidence: options.confidence || "MEDIUM",
    reviewStatus: approved,
    evidenceIds: ["sf-access-evidence:kg-bounded-attributes", "sf-access-evidence:parking-environment", ...(options.evidenceIds || [])],
    importantUnknowns: options.importantUnknowns || ["Reviewed driving relationships from external Bay Area origins", "District geometry and station-level walking access"],
    limitations: ["Structural district access only; no exact travel time, traffic, or building parking."],
  };
};

const districtProfiles = [
  profile("financial-district", "WEAK", { confidence: "HIGH", evidenceIds: ["sf-access-evidence:financial-district-regional-transit", "sf-access-evidence:ferry-system-reviewed", "sf-access-evidence:parking-environment"], completeness: { ferry: "SUFFICIENT" }, importantUnknowns: ["Exact building walk distance to regional transit", "Live bridge and street congestion"] }),
  profile("soma", "WEAK", { evidenceIds: ["sf-access-evidence:soma-caltrain", "sf-access-evidence:bay-bridge-structural", "sf-access-evidence:peninsula-freeways-reviewed"], importantUnknowns: ["Block-level freeway and station relationship", "Live bridge and street congestion"] }),
  profile("mission-bay", "MODERATE", { evidenceIds: ["sf-access-evidence:mission-bay-caltrain", "sf-access-evidence:bay-bridge-structural", "sf-access-evidence:peninsula-freeways-reviewed"], importantUnknowns: ["Building-specific parking", "Live freeway and street congestion"] }),
  profile("jackson-square", "WEAK", { evidenceIds: ["sf-access-evidence:jackson-square-bart"], importantUnknowns: ["Reviewed direct regional driving approach", "Building parking and exact station walk"] }),
  profile("south-beach", "WEAK", { evidenceIds: ["sf-access-evidence:south-beach-caltrain", "sf-access-evidence:bay-bridge-structural", "sf-access-evidence:peninsula-freeways-reviewed"], importantUnknowns: ["Block-level approach relationship", "Building parking"] }),
  profile("mission-district", "WEAK", { startingDistrict: false, accessActivationEligible: true, evidenceIds: ["sf-access-evidence:mission-district-bart", "sf-access-evidence:peninsula-freeways-reviewed"], completeness: { districtGeometry: "PARTIAL" }, importantUnknowns: ["BART and freeway access vary within the district", "Office suitability remains a separate composition question"] }),
  profile("dogpatch", "MODERATE", { startingDistrict: false, accessActivationEligible: true, recommendationEligible: true, confidence: "HIGH", parkingEvidenceIds: ["sf-access-evidence:parking-environment"], evidenceIds: ["sf-access-evidence:dogpatch-access", "sf-access-evidence:peninsula-freeways-reviewed"], completeness: { districtGeometry: "PARTIAL", originAccess: "PARTIAL", transit: "SUFFICIENT", driving: "PARTIAL", parking: "SUFFICIENT", ferry: "MISSING" }, importantUnknowns: ["North Bay access", "Block-level distance to 22nd Street Caltrain", "Building-specific parking and live traffic"] }),
  profile("presidio", "GOOD", { startingDistrict: false, accessActivationEligible: true, recommendationEligible: true, confidence: "HIGH", parkingEvidenceIds: ["sf-access-evidence:presidio-access"], evidenceIds: ["sf-access-evidence:presidio-canonical", "sf-access-evidence:golden-gate-structural", "sf-access-evidence:presidio-access"], completeness: { districtGeometry: "PARTIAL", ferry: "MISSING" }, importantUnknowns: ["Current Office inventory and tenant eligibility", "Building-specific parking allocation", "Travel time and traffic variability"] }),
  profile("design-district", "MODERATE", { startingDistrict: false, accessActivationEligible: false, recommendationEligible: true, accessKnowledgeOwnerDistrictId: "showplace-square", accessKnowledgeTreatment: "PRESENTATION_COMPATIBILITY_REFERENCE", parkingEvidenceIds: ["sf-access-evidence:showplace-potrero-parking"], evidenceIds: ["sf-access-evidence:creative-district-canonical", "sf-access-evidence:showplace-potrero-local-transit", "sf-access-evidence:showplace-potrero-regional-connections", "sf-access-evidence:showplace-potrero-freeways", "sf-access-evidence:showplace-potrero-parking"], completeness: { districtGeometry: "PARTIAL", originAccess: "PARTIAL", transit: "SUFFICIENT", driving: "PARTIAL", parking: "SUFFICIENT", ferry: "MISSING" }, importantUnknowns: ["No independent Design District geometry; presentation-level Access uses Showplace Square as knowledge owner", "Building-specific parking and exact transit walk"] }),
  profile("showplace-square", "MODERATE", { startingDistrict: false, accessActivationEligible: false, recommendationEligible: true, parkingEvidenceIds: ["sf-access-evidence:showplace-potrero-parking"], evidenceIds: ["sf-access-evidence:creative-district-canonical", "sf-access-evidence:showplace-potrero-local-transit", "sf-access-evidence:showplace-potrero-regional-connections", "sf-access-evidence:showplace-potrero-freeways", "sf-access-evidence:showplace-potrero-parking"], completeness: { districtGeometry: "PARTIAL", originAccess: "PARTIAL", transit: "SUFFICIENT", driving: "PARTIAL", parking: "SUFFICIENT", ferry: "MISSING" }, importantUnknowns: ["Block-level access within the broader Showplace geography", "Building-specific parking and exact transit walk"] }),
  profile("potrero-hill", "MODERATE", { startingDistrict: false, accessActivationEligible: false, recommendationEligible: true, parkingEvidenceIds: ["sf-access-evidence:showplace-potrero-parking"], evidenceIds: ["sf-access-evidence:creative-district-canonical", "sf-access-evidence:showplace-potrero-local-transit", "sf-access-evidence:showplace-potrero-regional-connections", "sf-access-evidence:showplace-potrero-freeways", "sf-access-evidence:showplace-potrero-parking"], completeness: { districtGeometry: "PARTIAL", originAccess: "PARTIAL", transit: "SUFFICIENT", driving: "PARTIAL", parking: "SUFFICIENT", ferry: "MISSING" }, importantUnknowns: ["Access variation between the residential hill and eastern/base commercial edge", "Building-specific parking and exact transit walk"] }),
  profile("union-square", "WEAK", { startingDistrict: false, recommendationEligible: true, evidenceIds: ["sf-access-evidence:powell-civic-bart", "sf-access-evidence:sf-core-regional-connections"], completeness: { districtGeometry: "PARTIAL", originAccess: "SUFFICIENT", driving: "SUFFICIENT" }, importantUnknowns: ["Building-level station walk", "Visitor mode and live curb conditions"] }),
  profile("hayes-valley", "WEAK", { startingDistrict: false, recommendationEligible: true, evidenceIds: ["sf-access-evidence:hayes-transit-parking", "sf-access-evidence:sf-core-regional-connections"], completeness: { districtGeometry: "PARTIAL", originAccess: "SUFFICIENT", driving: "SUFFICIENT" }, importantUnknowns: ["Block-level transit transfer friction", "Building-specific parking"] }),
  profile("marina-district", "MODERATE", { startingDistrict: false, accessActivationEligible: true, recommendationEligible: true, evidenceIds: ["sf-access-evidence:marina-northern-access", "sf-access-evidence:golden-gate-structural", "sf-access-evidence:sf-core-regional-connections"], completeness: { districtGeometry: "PARTIAL", originAccess: "SUFFICIENT", driving: "SUFFICIENT" }, importantUnknowns: ["Live Lombard and bridge congestion", "Building-specific parking", "Local transit transfer friction"] }),
  profile("civic-center", "WEAK", { startingDistrict: false, recommendationEligible: true, evidenceIds: ["sf-access-evidence:powell-civic-bart", "sf-access-evidence:sf-core-regional-connections"], completeness: { districtGeometry: "PARTIAL", originAccess: "SUFFICIENT", driving: "SUFFICIENT" }, importantUnknowns: ["Block-level client experience", "Building parking and exact station walk"] }),
];

// Origin access is derived from approved graph edges, never authored as Requirement→district rules.
for (const district of districtProfiles) {
  district.originAccess = originRegions.map((origin) => {
    const paths = gateways.flatMap((gateway) => {
      if (gateway.reviewStatus !== approved) return [];
      const originEdge = (gateway.originRelationships || []).find((item) => item.originRegionId === origin.originRegionId && item.reviewStatus === approved);
      const districtEdge = (gateway.districtRelationships || []).find((item) => item.districtId === district.districtId && item.reviewStatus === approved);
      if (!originEdge || !districtEdge) return [];
      const order = { WEAK: 0, MODERATE: 1, GOOD: 2, STRONG: 3, UNKNOWN: -1 };
      const rating = order[originEdge.rating] <= order[districtEdge.rating] ? originEdge.rating : districtEdge.rating;
      return [{ gatewayId: gateway.gatewayId, modes: gateway.modes, rating, reviewStatus: approved, evidenceIds: [...new Set([...(originEdge.evidenceIds || []), ...(districtEdge.evidenceIds || [])])] }];
    });
    return { originRegionId: origin.originRegionId, paths, overallRating: paths.length ? paths.sort((a, b) => ({ STRONG: 3, GOOD: 2, MODERATE: 1, WEAK: 0 }[b.rating] - { STRONG: 3, GOOD: 2, MODERATE: 1, WEAK: 0 }[a.rating]))[0].rating : "UNKNOWN" };
  });
  if (district.originAccess.every((item) => item.overallRating !== "UNKNOWN")) {
    district.completeness.originAccess = "SUFFICIENT";
    district.completeness.driving = "SUFFICIENT";
  }
}

// Reviewed southeast Industrial/Flex access profiles. These reuse the same
// regional gateway graph as adjacent Dogpatch, with bounded district-specific
// ratings from the canonical industrial geography and attributes. They do not
// assert travel times, live traffic, or property-level loading/parking.
function southeastIndustrialProfile(districtId, districtName, parkingEnvironment, adjustments, importantUnknowns) {
  const base = districtProfiles.find((item) => item.districtId === "dogpatch");
  const change = (rating, delta = 0) => {
    const scale = ["WEAK", "MODERATE", "GOOD", "STRONG"];
    const index = scale.indexOf(rating); return index < 0 ? rating : scale[Math.max(0, Math.min(scale.length - 1, index + delta))];
  };
  const gatewayRelationships = base.gatewayRelationships.map((item) => ({ ...item, rating: change(item.rating, adjustments[item.gatewayId] || 0), confidence: "MEDIUM", evidenceIds: [...new Set([...(item.evidenceIds || []), "sf-access-evidence:kg-bounded-attributes", "sf-access-evidence:peninsula-freeways-reviewed"])], limitations: ["Reviewed structural southeast relationship only; exact routing, congestion, and travel time remain outside the foundation."] }));
  const originAccess = base.originAccess.map((origin) => ({ ...origin, paths: origin.paths.map((path) => ({ ...path, rating: change(path.rating, adjustments[path.gatewayId] || 0), evidenceIds: [...new Set([...(path.evidenceIds || []), "sf-access-evidence:kg-bounded-attributes"]) ] })), overallRating: origin.paths.length ? origin.paths.map((path) => change(path.rating, adjustments[path.gatewayId] || 0)).sort((a, b) => ({ STRONG: 3, GOOD: 2, MODERATE: 1, WEAK: 0 }[b] - { STRONG: 3, GOOD: 2, MODERATE: 1, WEAK: 0 }[a]))[0] : "UNKNOWN" }));
  return { ...base, profileId: `sf-access-profile:${districtId}`, districtId, districtName, canonicalGeographyRef: `district:${districtId}`, propertyTypeFit: "strong", recommendationEligible: false, productionRecommendationEligible: false, startingDistrict: false, accessActivationEligible: false, accessKnowledgeOwnerDistrictId: districtId, parkingEnvironment, gatewayRelationships, originAccess, completeness: complete({ districtGeometry: "PARTIAL", originAccess: "SUFFICIENT", transit: "SUFFICIENT", driving: "SUFFICIENT", parking: "SUFFICIENT", ferry: "MISSING" }), confidence: "MEDIUM", evidenceIds: ["sf-access-evidence:kg-bounded-attributes", "sf-access-evidence:peninsula-freeways-reviewed", "sf-access-evidence:parking-environment"], importantUnknowns, limitations: ["Structural Industrial/Flex district access only; no exact travel time, live traffic, truck-route clearance, or building parking."] };
}
districtProfiles.push(
  southeastIndustrialProfile("central-waterfront", "Central Waterfront", "MODERATE", { "sf-gateway:caltrain": -1 }, ["Block-level PDR access", "Truck route and building loading", "Property parking"]),
  southeastIndustrialProfile("bayview-industrial", "Bayview Industrial", "GOOD", { "sf-gateway:caltrain": -2, "sf-gateway:local-transit": -1, "sf-gateway:us-101": 1, "sf-gateway:i-280": 1, "sf-gateway:central-street-network": 1 }, ["Internal subarea variation", "Truck route and yard suitability", "Property parking and environmental condition"]),
);

module.exports = {
  schemaVersion: "sf-access-foundation-v0",
  foundationId: "access-foundation:san-francisco:v0",
  marketId: "san-francisco",
  topology: "DENSE_CORE",
  foundationLevel: "REVIEWED",
  reviewStatus: approved,
  confidence: "MEDIUM",
  version: "sf-access-foundation:2026-08-sf-office-coverage-v2",
  sourcePolicy: "Only APPROVED evidence and relationships may influence Access Fit. CANDIDATE and STALE records remain evaluator-visible but inert.",
  originRegions,
  gateways,
  evidence,
  districtProfiles,
  startingDistrictIds: ["financial-district", "soma", "mission-bay", "jackson-square", "south-beach"],
  foundationGaps: [],
  completeness: complete(),
};
