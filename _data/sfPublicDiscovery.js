const officeCoverage = require("./sfOfficeMarketCoverage");
const retailCoverage = require("./sfRetailMarketCoverage");
const industrialFlexCoverage = require("./sfIndustrialFlexMarketCoverage");
const publicSurfaces = require("./sfPublicDecisionSurfaces");

const BASE = "/commercial-real-estate/CA/san-francisco/";
const recommendationEligible = (item) => /^(CORE|SITUATIONAL)_/.test(item.classification || "");
const eligible = {
  office: new Map(officeCoverage.decisionGeographies.filter(recommendationEligible).map((item) => [item.districtId, item])),
  retail: new Map(retailCoverage.decisionGeographies.filter(recommendationEligible).map((item) => [item.districtId, item])),
  industrial: new Map(industrialFlexCoverage.industrial.decisionGeographies.filter(recommendationEligible).map((item) => [item.districtId, item])),
  flex: new Map(industrialFlexCoverage.flex.decisionGeographies.filter(recommendationEligible).map((item) => [item.districtId, item])),
};

function location(model, districtId, cue) {
  const record = eligible[model].get(districtId);
  if (!record) throw new Error(`SF public discovery references ineligible ${model} geography: ${districtId}`);
  const surface = publicSurfaces.byPath[`${BASE}${districtId}/`];
  return Object.freeze({
    id: districtId,
    name: record.districtName,
    path: record.canonicalPath || `${BASE}${districtId}/`,
    label: cue,
    summary: cue || surface?.lead || record.reason,
  });
}

function group(model, title, introduction, entries) {
  return Object.freeze({ title, introduction, entries: Object.freeze(entries.map(([id, cue]) => location(model, id, cue))) });
}

const office = Object.freeze({
  propertyType: "office",
  eyebrow: "San Francisco Office location guide",
  title: "Different Office districts solve different business problems",
  introduction: "Compare client environment, employee and regional access, building character, team context, and practical tradeoffs before narrowing the search to buildings.",
  groups: Object.freeze([
    group("office", "Downtown and client-facing environments", "For businesses balancing regional transit, clients, professional context, and downtown building character.", [
      ["financial-district", "Formal business core, regional transit, and client-facing office depth"],
      ["jackson-square", "Historic smaller-scale offices with design and professional-service character"],
      ["south-beach", "Waterfront and Transbay-adjacent mixed office environment"],
      ["union-square", "Visitor-facing, hospitality-adjacent, smaller-office context"],
      ["civic-center", "Civic, nonprofit, government, legal, and institutional adjacency"],
    ]),
    group("office", "Modern, growth, and product-team environments", "For teams comparing newer buildings, technology context, Caltrain orientation, and adaptive office settings.", [
      ["soma", "Broad adaptive and creative office inventory with central access"],
      ["mission-bay", "Newer institutional, technology, and life-science-adjacent environment"],
      ["dogpatch", "Adaptive mixed-use character near Mission Bay and production districts"],
    ]),
    group("office", "Creative and neighborhood-scale choices", "For businesses that value distinctive character, smaller buildings, design context, or a less formal setting.", [
      ["showplace-square", "Design-trade, showroom, creative-production, and office hybrid context"],
      ["potrero-hill", "Selective neighborhood-scale creative and production-edge offices"],
      ["mission-district", "Small creative and neighborhood-oriented office context"],
      ["hayes-valley", "Central, design-conscious, smaller-office environment"],
    ]),
    group("office", "North-side and Marin-oriented context", "For smaller teams where north-side geography, driving practicality, or a campus-like setting matters.", [
      ["presidio", "Campus-like historic setting with a meaningful north-side orientation"],
      ["marina-district", "Neighborhood-scale professional offices and northern access context"],
    ]),
  ]),
  validation: Object.freeze(["Employee origins and regional gateways", "Client visit frequency and business environment", "Modern, conventional, historic, or creative building character", "Transit and parking as tradeoffs rather than guarantees", "Size, suite condition, and current availability at the property level"]),
  recommendation: Object.freeze({ prompt: "Which Office locations fit your business?", label: "See My Best-Fit Locations", path: "/best-fit-locations/?city=San%20Francisco&state=CA&marketId=san-francisco&spaceType=Office&source=space_type&sourcePath=%2Fcommercial-real-estate%2FCA%2Fsan-francisco%2Foffice-space%2F" }),
});

const retail = Object.freeze({
  propertyType: "retail_service",
  experimentId: "growth-sf-retail-v1",
  eyebrow: "San Francisco Retail location guide",
  title: "Retail decisions often happen at the corridor level",
  seoTitle: "San Francisco Retail Location Guide and Commercial Corridors | Rofo",
  seoDescription: "Compare San Francisco Retail districts and corridors by customer environment, storefront character, access, strengths, and tradeoffs before starting a personalized location search.",
  h1: "San Francisco Retail Districts and Corridors",
  heroLead: "San Francisco Retail location decisions often happen at the corridor level. Compare customer environment, storefront character, access, daily-use versus destination behavior, and operating tradeoffs before narrowing the search to properties.",
  introduction: "Compare who the location serves, why customers visit, street and storefront character, access, and operating tradeoffs. A familiar neighborhood name may contain more than one distinct Retail decision.",
  groups: Object.freeze([
    group("retail", "Downtown, visitor, and specialty environments", "For concepts comparing visitor demand, professional/daytime activity, destination behavior, and central access.", [
      ["union-square", "Destination shopping, hotels, visitors, and downtown transit"],
      ["financial-district", "Office-worker, client, service, and weekday demand"],
      ["jackson-square", "Boutique, design, specialty, and historic commercial character"],
      ["south-beach", "Mixed office, residential, waterfront, and event demand"],
      ["north-beach", "Visitor-facing food, cafes, evening activity, and specialty retail"],
      ["chinatown", "Visitor-specialty, food, and community-serving commerce"],
    ]),
    group("retail", "Neighborhood, lifestyle, and daily-use corridors", "For businesses depending on resident demand, repeat visits, wellness, services, food, and neighborhood identity.", [
      ["hayes-valley", "Central lifestyle, design, dining, and neighborhood destination context"],
      ["fillmore-street", "Premium lifestyle, wellness, dining, and neighborhood services"],
      ["chestnut-street", "Daily-use, food, service, fitness, and resident demand"],
      ["union-street-cow-hollow", "Specialty, wellness, dining, and planned lifestyle visits"],
      ["upper-market-castro", "Community, services, dining, nightlife, and transit visibility"],
    ]),
    group("retail", "Experiential and adaptive city environments", "For visible, food-led, experiential, independent, and mixed commercial concepts.", [
      ["valencia-street", "Food, experiential, wellness, furnishings, and evening activity"],
      ["soma", "Selective adaptive, destination, service, and mixed-use Retail"],
      ["dogpatch", "Neighborhood growth, food, design, and adaptive storefront context"],
    ]),
    group("retail", "Premium, design, showroom, and situational choices", "For narrower business models where design context, institutions, civic demand, or production adjacency matters.", [
      ["sacramento-street", "Small-scale premium, home, design, and destination retail"],
      ["showplace-square", "Showroom, interiors, design trade, and customer-facing PDR"],
      ["mission-bay", "Selective institutional, employee, patient, and event-adjacent demand"],
      ["civic-center", "Civic, institutional, arts, service, and weekday demand"],
      ["potrero-hill", "Selective neighborhood and design/production-adjacent Retail"],
    ]),
  ]),
  parentContexts: Object.freeze([
    { name: "Marina District", path: `${BASE}marina-district/`, explanation: "The Marina is the broader context. Chestnut Street and Union Street / Cow Hollow are the two independently reviewed Retail choices." },
    { name: "Mission District", path: `${BASE}mission-district/`, explanation: "The Mission remains the broader context. Valencia Street is its independently reviewed Retail corridor." },
  ]),
  validation: Object.freeze(["Customer and demand source", "Planned destination visits versus passing visibility", "Neighborhood, visitor, daytime, and evening patterns", "Parking, transit, loading, and receiving", "Storefront, use, size, and current availability at the property level"]),
  recommendation: Object.freeze({ prompt: "Which Retail locations fit your business?", label: "See My Best-Fit Locations", path: "/best-fit-locations/?city=San%20Francisco&state=CA&marketId=san-francisco&spaceType=Retail%20%2F%20service&source=space_type&sourcePath=%2Fcommercial-real-estate%2FCA%2Fsan-francisco%2Fretail-space%2F&journey=new" }),
});

const industrial = Object.freeze({
  propertyType: "industrial",
  eyebrow: "San Francisco Industrial decision guide",
  title: "Choose Industrial geography around the operation",
  introduction: "Warehouse, distribution, contractor, production, food, fleet, maker, and customer-facing industrial users require different parts of San Francisco.",
  groups: Object.freeze([
    group("industrial", "Operational and city-serving Industrial", "For requirements led by goods, vehicles, service territory, warehouse utility, or production.", [
      ["bayview-industrial", "Warehouse, distribution, food, contractor, fleet, and city-serving operations"],
      ["central-waterfront", "Production, fabrication, maker, prototyping, and practical industrial space"],
    ]),
    group("industrial", "Adaptive and situational Industrial", "For narrower production, showroom, R&D-support, or customer-facing requirements—not ordinary warehouse interchangeability.", [
      ["dogpatch", "Adaptive creative production and office/R&D-support environments"],
      ["showplace-square", "Showroom, design trade, and customer-facing PDR"],
      ["potrero-hill", "Selective eastern/base production and service-commercial edge"],
    ]),
  ]),
  contexts: Object.freeze([
    { name: "SoMa", explanation: "Generally not conventional Industrial; consider only selective office-heavy adaptive uses." },
    { name: "Northeast Mission PDR", path: `${BASE}mission-district/`, explanation: "Bounded production and service context, not a separate ordinary recommendation geography." },
    { name: "Southern Waterfront / Piers 80–96", explanation: "Specialized port, maritime, cargo, and heavy-commercial investigation rather than an ordinary shortlist." },
    { name: "Broader Bayview", path: `${BASE}bayview/`, explanation: "Neighborhood context; Bayview Industrial owns the operational location decision." },
  ]),
  validation: Object.freeze(["Loading and truck or service circulation", "Power, ventilation, clear height, and production systems", "Parking, fleet, yards, and outdoor storage", "Permitted use and specialized approvals", "Environmental, shoreline, neighboring-use, and current-property conditions"]),
  recommendation: Object.freeze({ prompt: "Which Industrial / Warehouse / Flex locations fit your operation?", label: "See My Best-Fit Locations", path: "/best-fit-locations/?city=San%20Francisco&state=CA&marketId=san-francisco&spaceType=Industrial%20%2F%20warehouse%20%2F%20flex&source=space_type&sourcePath=%2Fcommercial-real-estate%2FCA%2Fsan-francisco%2Findustrial-space%2F" }),
});

const flex = Object.freeze({
  propertyType: "flex",
  eyebrow: "San Francisco Flex location guide",
  title: "Flex is a hybrid decision—not weaker Industrial",
  introduction: "Start with the balance of office, production, showroom, design, technical, customer, storage, and operational needs. Different SF Flex geographies support materially different hybrids.",
  groups: Object.freeze([
    group("flex", "Production-led and operational Flex", "For hybrids where production, service, storage, dispatch, assembly, or practical operations lead.", [
      ["bayview-industrial", "Operational Flex combining office with storage, dispatch, service, or production"],
      ["central-waterfront", "Production, prototyping, product-development, and office-production hybrids"],
      ["potrero-hill", "Selective smaller production and office-production at the eastern/base edge"],
    ]),
    group("flex", "Showroom, adaptive, and office-led Flex", "For businesses where customers, creative work, design, R&D support, or adaptive character matter alongside light operations.", [
      ["showplace-square", "Showroom, design-trade, display, and customer-facing Flex"],
      ["dogpatch", "Adaptive creative, office/R&D, and production-support Flex"],
      ["soma", "Situational office-heavy adaptive Flex with secondary production or storage"],
    ]),
  ]),
  contexts: Object.freeze([
    { name: "Northeast Mission PDR", path: `${BASE}mission-district/`, explanation: "Selective smaller maker and service context; not an independent Flex recommendation geography." },
    { name: "Mission Bay", path: `${BASE}mission-bay/`, explanation: "Modern institutional context alone does not establish technical or R&D Flex suitability." },
  ]),
  validation: Object.freeze(["Office-to-operational area balance", "Customer, showroom, receiving, and circulation needs", "Power, ventilation, loading, and technical infrastructure", "Employee transit and parking", "Permitted use, buildout, suite condition, and current availability"]),
  recommendation: Object.freeze({ prompt: "Which Industrial / Warehouse / Flex locations fit your business?", label: "See My Best-Fit Locations", path: "/best-fit-locations/?city=San%20Francisco&state=CA&marketId=san-francisco&spaceType=Industrial%20%2F%20warehouse%20%2F%20flex&source=space_type&sourcePath=%2Fcommercial-real-estate%2FCA%2Fsan-francisco%2Fflex-space%2F" }),
});

const guides = Object.freeze({ office, retail, industrial, flex });

for (const [model, guide] of Object.entries(guides)) {
  const projectedIds = guide.groups.flatMap((item) => item.entries.map((entry) => entry.id));
  const certifiedIds = Array.from(eligible[model].keys());
  if (new Set(projectedIds).size !== projectedIds.length || projectedIds.length !== certifiedIds.length || certifiedIds.some((id) => !projectedIds.includes(id))) {
    throw new Error(`SF ${model} public discovery must project each certified recommendation geography exactly once.`);
  }
}

const city = Object.freeze({
  eyebrow: "Explore San Francisco by space type",
  title: "The right parts of San Francisco depend on what your business needs",
  introduction: "Office, Retail, Industrial, and Flex users make different location decisions. Start with the kind of space and operating context, then explore the relevant parts of the city.",
  paths: Object.freeze([
    { id: "office", name: "Office", path: `${BASE}office-space/`, summary: "Compare client-facing cores, modern and creative districts, employee access, building character, and north-side choices.", locations: [location("office", "financial-district", "Regional transit and client-facing core"), location("office", "soma", "Adaptive and creative office"), location("office", "mission-bay", "Modern institutional environment")] },
    { id: "retail", name: "Retail", path: `${BASE}retail-space/`, summary: "Compare downtown destinations, neighborhood corridors, customer-demand patterns, storefront character, and operating tradeoffs.", locations: [location("retail", "union-square", "Downtown visitor destination"), location("retail", "chestnut-street", "Neighborhood daily-use corridor"), location("retail", "valencia-street", "Food and experiential corridor")] },
    { id: "industrial", name: "Industrial / Warehouse", path: `${BASE}industrial-space/`, summary: "Compare warehouse, distribution, contractor, production, fabrication, and city-serving operating geographies.", locations: [location("industrial", "bayview-industrial", "City-serving operational depth"), location("industrial", "central-waterfront", "Production and fabrication"), location("industrial", "showplace-square", "Customer-facing design trade")] },
    { id: "flex", name: "Flex", path: `${BASE}flex-space/`, summary: "Compare production-led, showroom, design, maker, technical, adaptive, and office-production hybrids.", locations: [location("flex", "central-waterfront", "Production-led hybrid"), location("flex", "dogpatch", "Adaptive creative Flex"), location("flex", "showplace-square", "Showroom and design Flex")] },
  ]),
});

module.exports = Object.freeze({ schemaVersion: "sf-public-discovery:v1", marketId: "san-francisco", status: "READY", city, guides });
