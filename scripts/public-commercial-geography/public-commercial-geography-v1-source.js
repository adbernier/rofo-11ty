"use strict";

const OFFICIAL = (id, title, url) => ({ id, type: "AUTHORITATIVE_OR_REVIEWED_REPOSITORY", title, url });
const repo = OFFICIAL("rofo-location-knowledge-graph", "Rofo reviewed location knowledge graph and evidence foundations", "_data/locationKnowledgeGraph.js");
const rel = (spaceType, applicability, areaPatterns, routeState = "ROUTE_READY", indexation = "COMPONENT_READY", access = "SOURCE_AVAILABLE_NEEDS_REVIEW") => ({
  spaceType, applicability, areaPatterns: areaPatterns.map(label => ({ label, scope: "AREA_PATTERN" })), routeState, indexation, accessReadiness: access,
});
const geo = (id, label, municipality, parentCityId, geographyType, tier, spaceTypes, options = {}) => ({
  id, label, municipality, parentCityId, geographyType, publicEvidenceTier: tier,
  componentAreas: options.componentAreas || [], majorCorridor: options.majorCorridor || null,
  relativeOrientation: options.relativeOrientation || null, boundaryType: options.boundaryType || "DESCRIPTIVE_ONLY",
  boundaryConfidence: options.boundaryConfidence || "REVIEWED_DESCRIPTIVE",
  labelPoint: options.labelPoint || null, grid: { group: options.gridGroup || "commercial-core", order: options.gridOrder || 1 },
  shortDescription: options.shortDescription || `${label} is a reviewed commercial environment in ${municipality}. Its public role is bounded by space type and source evidence.`,
  commercialCharacter: options.commercialCharacter || [], investigationBoundaries: options.investigationBoundaries || ["Property availability and exact building capability require current verification."],
  representatives: options.representatives || [], provenance: options.provenance || [repo], spaceTypes,
});

const pathFor = (state, city, slug) => `/commercial-real-estate/${state}/${city}/${slug}/`;
const sf = [
  geo("financial-district", "Financial District", "San Francisco", "san-francisco", "OFFICE_DISTRICT", "PUBLIC_REVIEWED", [rel("office", "PRIMARY", ["Professional services", "Corporate office"]), rel("retail", "SECONDARY", ["Service retail"])], {gridOrder:1, representatives:[{id:"sf-financial-district-environment",kind:"ENVIRONMENT",status:"REVIEWED_ENVIRONMENT",availabilityBoundary:"NO_AVAILABILITY_SEMANTICS"}]}),
  geo("soma", "SoMa", "San Francisco", "san-francisco", "MIXED_COMMERCIAL_DISTRICT", "PUBLIC_REVIEWED", [rel("office", "PRIMARY", ["Technology", "Creative"]), rel("retail", "CONTEXTUAL", ["Customer-facing retail"]), rel("industrial", "SECONDARY", ["Production"]), rel("flex", "PRIMARY", ["Office/warehouse", "Technical operations"])], {gridOrder:2, representatives:[{id:"680-folsom-st",kind:"PROPERTY",status:"REVIEWED_REPRESENTATIVE",durablePropertyId:"sf-680-folsom-st",availabilityBoundary:"NO_AVAILABILITY_SEMANTICS"}]}),
  geo("mission-bay", "Mission Bay", "San Francisco", "san-francisco", "R_AND_D_TECHNICAL_CLUSTER", "PUBLIC_REVIEWED", [rel("office", "PRIMARY", ["Life sciences", "Technical/R&D"]), rel("retail", "CONTEXTUAL", ["Neighborhood services"]), rel("flex", "SECONDARY", ["R&D"])], {gridOrder:3}),
  geo("jackson-square", "Jackson Square", "San Francisco", "san-francisco", "OFFICE_DISTRICT", "PUBLIC_REVIEWED", [rel("office", "PRIMARY", ["Professional services", "Creative"]), rel("retail", "SECONDARY", ["Destination retail"])], {gridOrder:4}),
  geo("union-square", "Union Square", "San Francisco", "san-francisco", "RETAIL_CORRIDOR", "PUBLIC_REVIEWED", [rel("office", "SECONDARY", ["Professional office"]), rel("retail", "PRIMARY", ["Destination retail", "Food/beverage"])], {gridOrder:5}),
  geo("mission-district", "Mission District", "San Francisco", "san-francisco", "MIXED_COMMERCIAL_DISTRICT", "PUBLIC_REVIEWED", [rel("office", "CONTEXTUAL", ["Creative"]), rel("retail", "PRIMARY", ["Neighborhood retail", "Food/beverage", "Personal services"])], {gridOrder:6}),
  geo("hayes-valley", "Hayes Valley", "San Francisco", "san-francisco", "MAIN_STREET", "PUBLIC_REVIEWED", [rel("retail", "PRIMARY", ["Neighborhood retail", "Food/beverage"]), rel("office", "CONTEXTUAL", ["Creative office"])], {gridOrder:7}),
  geo("chestnut-street", "Chestnut Street", "San Francisco", "san-francisco", "RETAIL_CORRIDOR", "PUBLIC_CONTEXTUAL", [rel("retail", "PRIMARY", ["Neighborhood retail", "Personal services"])], {gridOrder:8}),
  geo("union-street-cow-hollow", "Union Street / Cow Hollow", "San Francisco", "san-francisco", "RETAIL_CORRIDOR", "PUBLIC_CONTEXTUAL", [rel("retail", "PRIMARY", ["Neighborhood retail", "Food/beverage"])], {gridOrder:9}),
  geo("valencia-street", "Valencia Street", "San Francisco", "san-francisco", "RETAIL_CORRIDOR", "PUBLIC_CONTEXTUAL", [rel("retail", "PRIMARY", ["Food/beverage", "Neighborhood retail"])], {gridOrder:10}),
  geo("bayview-industrial", "Bayview Industrial", "San Francisco", "san-francisco", "INDUSTRIAL_DISTRICT", "PUBLIC_REVIEWED", [rel("industrial", "PRIMARY", ["Warehouse", "Contractor/service", "Production"]), rel("flex", "SECONDARY", ["Office/warehouse"])], {gridOrder:11}),
  geo("central-waterfront", "Central Waterfront", "San Francisco", "san-francisco", "INDUSTRIAL_DISTRICT", "PUBLIC_REVIEWED", [rel("industrial", "PRIMARY", ["Production", "Contractor/service"]), rel("flex", "SECONDARY", ["Technical operations"])], {gridOrder:12}),
  geo("dogpatch", "Dogpatch", "San Francisco", "san-francisco", "MIXED_COMMERCIAL_DISTRICT", "PUBLIC_REVIEWED", [rel("industrial", "PRIMARY", ["Production"]), rel("flex", "PRIMARY", ["Office/warehouse", "R&D"]), rel("retail", "SECONDARY", ["Neighborhood retail"])], {gridOrder:13}),
  geo("showplace-square", "Showplace Square", "San Francisco", "san-francisco", "FLEX_BUSINESS_PARK_ENVIRONMENT", "PUBLIC_REVIEWED", [rel("industrial", "SECONDARY", ["Production"]), rel("flex", "PRIMARY", ["Creative", "Showroom", "Office/warehouse"]), rel("retail", "SECONDARY", ["Showroom"])], {gridOrder:14}),
];

const sac = [
  geo("downtown-sacramento", "Downtown Sacramento", "Sacramento", "sacramento", "OFFICE_DISTRICT", "PUBLIC_CONTEXTUAL", [rel("office", "PRIMARY", ["Professional services", "Government-related office"]), rel("retail", "SECONDARY", ["Food/beverage", "Service retail"])], {gridOrder:1}),
  geo("midtown-sacramento", "Midtown Sacramento", "Sacramento", "sacramento", "MIXED_COMMERCIAL_DISTRICT", "PUBLIC_CONTEXTUAL", [rel("office", "SECONDARY", ["Professional services", "Creative"]), rel("retail", "PRIMARY", ["Neighborhood retail", "Food/beverage"])], {gridOrder:2}),
  geo("power-inn-industrial", "Power Inn Industrial", "Sacramento", "sacramento", "INDUSTRIAL_DISTRICT", "PUBLIC_REVIEWED", [rel("industrial", "PRIMARY", ["Distribution", "Manufacturing", "Contractor/service"]), rel("flex", "SECONDARY", ["Office/warehouse", "Production"])], {gridOrder:3, representatives:["8583-elder-creek-rd","5711-florin-perkins-rd"].map(id=>({id,kind:"PROPERTY",status:"REVIEWED_REPRESENTATIVE",durablePropertyId:`sac-${id}`,availabilityBoundary:"NO_AVAILABILITY_SEMANTICS"}))}),
  geo("northgate-north-market-industrial", "Northgate / North Market Industrial", "Sacramento", "sacramento", "FLEX_BUSINESS_PARK_ENVIRONMENT", "PUBLIC_REVIEWED", [rel("industrial", "PRIMARY", ["Lighter warehouse", "Contractor/service"] ,"ROUTE_NEEDED_LATER","BUILD_THEN_INDEX"), rel("flex", "PRIMARY", ["Office/warehouse", "Multi-tenant Flex"],"ROUTE_NEEDED_LATER","BUILD_THEN_INDEX")], {gridOrder:4, representatives:[{id:"1329-n-market-blvd",kind:"PROPERTY",status:"REVIEWED_REPRESENTATIVE",durablePropertyId:"sac-1329-n-market-blvd",availabilityBoundary:"NO_AVAILABILITY_SEMANTICS"},{id:"northgate-north-market-industrial-environment",kind:"ENVIRONMENT",status:"REVIEWED_ENVIRONMENT",availabilityBoundary:"NO_AVAILABILITY_SEMANTICS"}]}),
];

const indy = [
  geo("indianapolis-airport-logistics", "Indianapolis Airport Logistics", "Indianapolis", "indianapolis", "LOGISTICS_ENVIRONMENT", "PUBLIC_REVIEWED", [rel("industrial", "PRIMARY", ["Distribution", "Warehouse"]), rel("flex", "SECONDARY", ["Office/warehouse"])], {gridOrder:1, representatives:[{id:"4557-w-bradbury-ave",kind:"PROPERTY",status:"REVIEWED_REPRESENTATIVE",durablePropertyId:"ind-4557-w-bradbury-ave",availabilityBoundary:"NO_AVAILABILITY_SEMANTICS"},{id:"park-fletcher-stout-field-industrial-environment",kind:"ENVIRONMENT",status:"REVIEWED_ENVIRONMENT",availabilityBoundary:"NO_AVAILABILITY_SEMANTICS"}]}),
  geo("park-100-northwest-indianapolis", "Park 100 / Northwest Indianapolis", "Indianapolis", "indianapolis", "FLEX_BUSINESS_PARK_ENVIRONMENT", "PUBLIC_REVIEWED", [rel("industrial", "PRIMARY", ["Warehouse", "Contractor/service"],"ROUTE_NEEDED_LATER","BUILD_THEN_INDEX"), rel("flex", "PRIMARY", ["Office/warehouse", "Multi-tenant Flex"],"ROUTE_NEEDED_LATER","BUILD_THEN_INDEX")], {gridOrder:2, representatives:[{id:"7601-winton-dr",kind:"PROPERTY",status:"REVIEWED_REPRESENTATIVE",durablePropertyId:"ind-7601-winton-dr",availabilityBoundary:"NO_AVAILABILITY_SEMANTICS"},{id:"park-100-multitenant-industrial-flex-environment",kind:"ENVIRONMENT",status:"REVIEWED_ENVIRONMENT",availabilityBoundary:"NO_AVAILABILITY_SEMANTICS"}]}),
];

const phoenix = [
  geo("downtown-phoenix", "Downtown Phoenix", "Phoenix", "phoenix", "OFFICE_DISTRICT", "PUBLIC_CONTEXTUAL", [rel("office", "PRIMARY", ["Professional services", "Corporate office"]), rel("retail", "SECONDARY", ["Food/beverage", "Service retail"])], {gridOrder:1}),
  geo("camelback-corridor", "Camelback Corridor", "Phoenix", "phoenix", "MIXED_COMMERCIAL_DISTRICT", "PUBLIC_CONTEXTUAL", [rel("office", "PRIMARY", ["Professional office"]), rel("retail", "PRIMARY", ["Customer-facing retail"] )], {gridOrder:2}),
  geo("southwest-phoenix-industrial", "Southwest Phoenix Industrial", "Phoenix", "phoenix", "INDUSTRIAL_DISTRICT", "PUBLIC_REVIEWED", [rel("industrial", "PRIMARY", ["Distribution", "Warehouse"]), rel("flex", "SECONDARY", ["Office/warehouse"])], {gridOrder:3}),
  geo("airport-south-central-industrial", "Airport / South Central Industrial", "Phoenix", "phoenix", "LOGISTICS_ENVIRONMENT", "PUBLIC_REVIEWED", [rel("industrial", "PRIMARY", ["Distribution", "Contractor/service"],"ROUTE_NEEDED_LATER","BUILD_THEN_INDEX"), rel("flex", "PRIMARY", ["Office/warehouse"],"ROUTE_NEEDED_LATER","BUILD_THEN_INDEX")], {gridOrder:4}),
  geo("north-phoenix-advanced-operations", "North Phoenix Advanced Operations", "Phoenix", "phoenix", "R_AND_D_TECHNICAL_CLUSTER", "PUBLIC_REVIEWED", [rel("industrial", "PRIMARY", ["Advanced operations", "Production"],"ROUTE_NEEDED_LATER","BUILD_THEN_INDEX"), rel("flex", "PRIMARY", ["R&D", "Technical operations"],"ROUTE_NEEDED_LATER","BUILD_THEN_INDEX")], {gridOrder:5}),
];

const denver = [
  geo("central-business-district", "Central Business District", "Denver", "denver", "OFFICE_DISTRICT", "PUBLIC_CONTEXTUAL", [rel("office", "PRIMARY", ["Professional services", "Corporate office"]), rel("retail", "SECONDARY", ["Service retail"])], {gridOrder:1}),
  geo("lodo", "LoDo", "Denver", "denver", "MIXED_COMMERCIAL_DISTRICT", "PUBLIC_CONTEXTUAL", [rel("office", "PRIMARY", ["Professional services", "Creative"]), rel("retail", "PRIMARY", ["Food/beverage", "Destination retail"])], {gridOrder:2}),
  geo("rino", "RiNo", "Denver", "denver", "MIXED_COMMERCIAL_DISTRICT", "PUBLIC_CONTEXTUAL", [rel("office", "SECONDARY", ["Creative"]), rel("retail", "PRIMARY", ["Food/beverage"]), rel("industrial", "SECONDARY", ["Production"]), rel("flex", "PRIMARY", ["Creative production", "Office/warehouse"])], {gridOrder:3}),
  geo("cherry-creek", "Cherry Creek", "Denver", "denver", "MIXED_COMMERCIAL_DISTRICT", "PUBLIC_CONTEXTUAL", [rel("office", "PRIMARY", ["Professional office"]), rel("retail", "PRIMARY", ["Destination retail"])], {gridOrder:4}),
  geo("northeast-denver-industrial", "Northeast Denver Industrial", "Denver", "denver", "INDUSTRIAL_DISTRICT", "PUBLIC_CONTEXTUAL", [rel("industrial", "PRIMARY", ["Warehouse", "Distribution"]), rel("flex", "SECONDARY", ["Office/warehouse"])], {gridOrder:5}),
  geo("north-washington-i-25-industrial", "North Washington / I-25 Industrial", "Denver", "denver", "INDUSTRIAL_CORRIDOR", "PUBLIC_CONTEXTUAL", [rel("industrial", "PRIMARY", ["Warehouse", "Contractor/service"]), rel("flex", "PRIMARY", ["Office/warehouse"])], {gridOrder:6}),
];

const priorityMarkets = {"san-francisco":sf, sacramento:sac, indianapolis:indy, phoenix, denver};
const marketRows = [
 ["san-francisco","San Francisco","CA","O/R/I/F",16,3,0],["san-diego","San Diego","CA","O/I/F",8,4,1],["orange-county","Orange County","CA","O/R/I/F",2,7,2],["phoenix","Phoenix","AZ","I/F",3,3,1],["indianapolis","Indianapolis","IN","I/F",2,3,0],["sacramento","Sacramento","CA","O/R/I/F",3,5,2],["seattle","Seattle","WA","O/I/F",3,5,1],["denver","Denver","CO","O/R/I/F",3,7,2],["los-angeles","Los Angeles","CA","O/R/I/F",4,9,4],["east-bay","Oakland / East Bay","CA","O/R/I/F",4,7,3],
 ["san-jose","San Jose","CA","O/R/I/F",1,4,2],["peninsula","Peninsula","CA","O/R/F",4,6,2],["chicago","Chicago","IL","O/R/I/F",1,4,4],["albuquerque","Albuquerque","NM","O/I/F",0,2,4],["baton-rouge","Baton Rouge","LA","O/R/I/F",0,2,4],["louisville","Louisville","KY","O/R/I/F",1,3,2],["sarasota","Sarasota","FL","O/R/I/F",0,2,3],["knoxville","Knoxville","TN","O/R/I/F",0,2,3],["tampa","Tampa","FL","O/R/I/F",1,4,2],["houston","Houston","TX","O/R/I/F",1,5,3],
 ["miami","Miami","FL","O/R/I/F",2,4,2],["atlanta","Atlanta","GA","O/R/I/F",1,4,3],["jacksonville","Jacksonville","FL","O/R/I/F",0,4,2],["tallahassee","Tallahassee","FL","O/R/I/F",0,3,2],["oklahoma-city","Oklahoma City","OK","O/R/I/F",1,3,3],["corpus-christi","Corpus Christi","TX","O/R/I/F",0,2,3],["pensacola","Pensacola","FL","O/R/I/F",0,2,3],["san-antonio","San Antonio","TX","O/R/I/F",2,4,2],["buffalo","Buffalo","NY","O/R/I/F",2,4,2],["new-orleans","New Orleans","LA","O/R/I/F",2,3,2],
 ["new-york-brooklyn","New York / Brooklyn","NY","O/R/I/F",3,4,2],["fort-wayne","Fort Wayne","IN","O/R/I/F",1,1,3],["detroit-novi","Detroit / Novi","MI","O/I/F",1,3,3],["austin","Austin","TX","O/R/I/F",2,4,3],["stockton","Stockton","CA","O/R/I/F",0,3,2],["boise","Boise","ID","O/R/I/F",1,3,2],["colorado-springs","Colorado Springs","CO","O/R/I/F",0,3,3],["las-vegas","Las Vegas","NV","O/R/I/F",1,3,3],["grand-rapids","Grand Rapids","MI","O/R/I/F",0,3,2],["spokane","Spokane","WA","O/R/I/F",0,2,3],
 ["raleigh-durham","Raleigh / Durham","NC","O/R/F",2,4,2],["dallas","Dallas","TX","O/R/I/F",2,4,3],["orlando","Orlando","FL","O/R/I/F",1,3,4],["nashville","Nashville","TN","O/R/I/F",1,3,3],["charlotte","Charlotte","NC","O/R/I/F",1,3,3],["kansas-city-mo-ks","Kansas City MO / KS","MO/KS","O/R/I/F",2,3,3],["manchester-region","Manchester region","NH","O/R/I/F",1,3,3],["bridgeport","Bridgeport","CT","O/R/I/F",1,2,2],["palmetto-bradenton","Palmetto / Bradenton","FL","O/R/I/F",1,3,3],["naperville","Naperville","IL","O/R/F",1,2,2],
];

const opportunities = [
 ["san-francisco","office","Financial District / SoMa / Mission Bay",95,"Complete reviewed geography, route and representative substrate"],
 ["san-francisco","retail","Union Square / Mission / neighborhood corridors",92,"Distinct retail lens with many existing routes"],
 ["sacramento","industrial","Power Inn / Northgate-North Market",91,"Certified evidence and reviewed representatives"],
 ["phoenix","industrial","Three certified City environments",90,"Live evidence and existing geography routes"],
 ["indianapolis","industrial","Airport Logistics / Park 100",89,"Certified evidence and reviewed representatives"],
 ["san-francisco","flex","SoMa / Dogpatch / Showplace Square",88,"Strong differentiated public set"],
 ["san-francisco","industrial","Bayview / Central Waterfront / Dogpatch",87,"Mature city ownership and routes"],
 ["denver","office","CBD / LoDo / RiNo / Cherry Creek",82,"Strong existing surface; ownership review remains"],
 ["sacramento","office","Downtown / Midtown",79,"Existing routes; public-context evidence only"],
 ["phoenix","flex","Airport-South Central / North Phoenix",79,"Certified evidence; space-type projection review needed"],
 ["seattle","industrial","SODO / Georgetown / South Park",77,"Strong atlas and search opportunity"],
 ["san-jose","industrial","North San Jose / Edenvale",77,"Highest next-market industrial search signal"],
 ["denver","industrial","Northeast / North Washington",76,"Existing routes and corpus; boundary review needed"],
 ["chicago","industrial","Kinzie / Pilsen / Calumet",74,"Exceptional corpus; foundation work substantial"],
 ["atlanta","industrial","Upper Westside / Southside",73,"Strong search signal; municipal review needed"],
 ["nashville","industrial","Elm Hill / southeast industrial",72,"Strong search signal; boundaries need review"],
 ["jacksonville","industrial","Westside / Northside",71,"Industrial search and consolidated-city leverage"],
 ["east-bay","office","Downtown Oakland / Uptown / Jack London",69,"Dense corpus; regional ownership must remain decomposed"],
 ["los-angeles","industrial","City industrial districts only",68,"Large upside; independent-city ownership risk"],
 ["houston","office","Downtown / Uptown / Energy Corridor",67,"Search and page estate; access and ownership gaps"],
 ["austin","office","Downtown / Domain / East Austin",66,"Strong surface; access sensitive"],
 ["buffalo","flex","Larkinville / RiverBend context",65,"Large page estate; geography review needed"],
 ["san-antonio","industrial","Port / Brooks / Eastside",65,"Industrial search; composition review required"],
 ["orlando","industrial","Seaboard / Millenia hypotheses",61,"Discovery value, not publication-ready"],
 ["raleigh-durham","office","Raleigh / Durham / RTP owned separately",60,"High value but access-intelligence blocked"],
].map(([marketId,spaceType,focus,score,rationale],i)=>({rank:i+1,marketId,spaceType,focus,score,rationale}));

module.exports = { marketRows, priorityMarkets, opportunities, pathFor };
