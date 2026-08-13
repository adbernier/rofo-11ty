const district = {
  metroId: "san-francisco",
  metroName: "San Francisco",
  cityId: "san-francisco",
  cityName: "San Francisco",
  districtId: "bayview-industrial",
  districtName: "Bayview Industrial",
  districtPath: "/commercial-real-estate/CA/san-francisco/bayview-industrial/",
  primaryEcosystem: "industrial_flex",
  secondaryEcosystems: [],
  referenceDocument: "docs/product/sf-industrial-flex-evidence-foundation.md",
};

const neighboringDistrictRelationships = [
  { districtId: "central-waterfront", districtName: "Central Waterfront", relationship: "Central Waterfront is the stronger comparison for urban production, fabrication, maker, prototyping, and practical flex needs that do not require Bayview's broader warehouse and city-serving logistics environment." },
  { districtId: "hayward-industrial", districtName: "Hayward Industrial", relationship: "Hayward is the stronger comparison when regional warehouse scale, truck circulation, or East Bay distribution reach matters more than remaining inside San Francisco." },
  { districtId: "union-city-industrial", districtName: "Union City Industrial", relationship: "Union City is the stronger comparison for regional manufacturing and distribution users whose scale and vehicle requirements exceed a constrained urban operating environment." },
];

const planningSource = { label: "SF Planning — Bayview Hunters Point Area Plan", url: "https://generalplan.sfplanning.org/Bayview_Hunters_Point.htm", sourceType: "government" };
const validationTradeoff = "This environment establishes a district operating pattern, not the loading, power, parking, yard, permitted use, environmental condition, building systems, suite condition, or current availability of a specific property.";

function evidenceRecord(fields) {
  return { subjectType: "environment", district, neighboringDistrictRelationships, reviewStatus: "approved_reference", buildingProfileStatus: "not_applicable", ...fields };
}

const records = [
  evidenceRecord({
    id: "sf-bayview-industrial-sf-market",
    title: "The SF Market",
    subjectId: "the-sf-market-2095-jerrold",
    subjectName: "The SF Market — 2095 Jerrold Avenue",
    evidenceType: "wholesale_food_distribution_campus",
    evidenceTypeLabel: "Wholesale Food and Distribution Campus",
    evidenceRole: "food_wholesale_logistics_anchor",
    evidenceRoleLabel: "Food Wholesale and Logistics Anchor",
    confidence: "source_supported",
    whyItBelongs: "The SF Market is Bayview Industrial's clearest operating example of wholesale food infrastructure, overnight logistics, merchant distribution, pickup, delivery, and city-serving food supply activity.",
    districtFit: "Its 2095 Jerrold Avenue campus explains why Bayview matters to businesses that need industrial food operations and distribution access inside San Francisco rather than generic warehouse space alone.",
    typicalUsers: ["food wholesalers, produce buyers, distributors, restaurants, grocers, and food-system organizations evaluating shared wholesale infrastructure"],
    leasingSituations: ["food wholesale and distribution location decisions", "city-serving cold-chain or delivery comparisons", "businesses evaluating overnight receiving and dispatch patterns"],
    strengths: ["officially documented wholesale produce campus", "nearly two dozen merchant businesses", "overnight business-to-business operating pattern", "101 and 280 access context"],
    tradeoffs: [validationTradeoff, "The campus explains food-system infrastructure but does not prove that unrelated Bayview buildings support refrigeration or food uses."],
    nearbyAlternatives: ["Bayview Industrial Triangle", "India Basin and Oakinba industrial areas", "regional East Bay food-distribution environments"],
    publicSources: [
      { label: "The SF Market — Buy Wholesale Produce", url: "https://thesfmarket.org/buy-wholesale-produce/", sourceType: "official_operator" },
      { label: "The SF Market — 2025 Buying Guide", url: "https://thesfmarket.org/wp-content/uploads/2025/02/TSFM_Buying-Guide-_Client_V2_022025-907am-PT.pdf", sourceType: "official_operator" },
      planningSource,
    ],
  }),
  evidenceRecord({
    id: "sf-bayview-industrial-triangle",
    title: "Bayview Industrial Triangle",
    subjectId: "bayview-industrial-triangle",
    subjectName: "Bayview Industrial Triangle",
    evidenceType: "protected_urban_pdr_environment",
    evidenceTypeLabel: "Protected Urban PDR Environment",
    evidenceRole: "contractor_service_industrial_foundation",
    evidenceRoleLabel: "Contractor and Service-Industrial Foundation",
    confidence: "source_supported",
    whyItBelongs: "The Bayview Industrial Triangle demonstrates the protected PDR foundation for production, distribution, repair, contractor, and service-industrial businesses within the district's Northern Gateway structure.",
    districtFit: "It explains the everyday small- and mid-format operating fabric that complements the SF Market campus and the future-facing SF Gateway proposal without turning either project into the whole Bayview story.",
    typicalUsers: ["contractors, building-service companies, repair businesses, light producers, distributors, and operational flex users"],
    leasingSituations: ["small-bay and service-industrial searches", "contractor dispatch and vehicle-access comparisons", "businesses validating PDR use compatibility near residential edges"],
    strengths: ["official PDR zoning foundation", "production, distribution, and repair identity", "buffer relationship between industrial and residential uses", "diverse urban industrial formats"],
    tradeoffs: [validationTradeoff, "District protection does not make every parcel equally suitable or eliminate land-use conflicts at mixed edges."],
    nearbyAlternatives: ["The SF Market area", "South Basin", "Central Waterfront core PDR"],
    publicSources: [
      { label: "SF Planning — Bayview Industrial Triangle Zoning Update", url: "https://sfplanning.org/index.php/bayview-industrial-triangle-zoning-update", sourceType: "government" },
      { label: "SF Planning — Bayview Industrial Triangle PDR background", url: "https://sfplanning.org/sites/default/files/documents/citywide/bayview_industrial_triangle_zoning_update.pdf", sourceType: "government" },
      planningSource,
    ],
  }),
  evidenceRecord({
    id: "sf-bayview-industrial-sf-gateway",
    title: "SF Gateway — 749 Toland Street",
    subjectId: "sf-gateway-749-toland",
    subjectName: "SF Gateway — 749 Toland Street proposal",
    evidenceType: "proposed_multistory_pdr_development",
    evidenceTypeLabel: "Proposed Multistory PDR Development",
    evidenceRole: "modern_pdr_development_evidence",
    evidenceRoleLabel: "Modern PDR Development Evidence",
    confidence: "source_supported",
    whyItBelongs: "SF Gateway is useful forward-looking evidence that Bayview's core industrial geography can support a proposed multistory production, distribution, and repair format rather than only legacy low-rise stock.",
    districtFit: "The proposal illustrates a future urban logistics and flexible PDR model at Toland Street, while remaining development evidence rather than current inventory or proof of delivered operating capability.",
    typicalUsers: ["businesses studying future multistory PDR, urban logistics, maker, production, and flexible industrial formats"],
    leasingSituations: ["future-supply context", "modern PDR format comparisons", "urban industrial development feasibility discussions"],
    strengths: ["official Planning project record", "proposed flexible PDR program", "core Bayview industrial location", "modern multistory industrial concept"],
    tradeoffs: [validationTradeoff, "The project is described as proposed and must not be represented as completed, available, or operational inventory."],
    nearbyAlternatives: ["existing Bayview Industrial Triangle stock", "The SF Market campus", "regional modern logistics developments"],
    publicSources: [
      { label: "SF Planning — SF Gateway, 749 Toland Street", url: "https://sfplanning.org/project/sf-gateway-749-toland-street", sourceType: "government" },
      planningSource,
    ],
  }),
  evidenceRecord({
    id: "sf-bayview-industrial-southern-waterfront",
    title: "Piers 80–96 Maritime Eco-Industrial Center",
    subjectId: "southern-waterfront-piers-80-96",
    subjectName: "Southern Waterfront / Piers 80–96",
    evidenceType: "specialized_maritime_industrial_environment",
    evidenceTypeLabel: "Specialized Maritime Industrial Environment",
    evidenceRole: "port_cargo_heavy_commercial_context",
    evidenceRoleLabel: "Port, Cargo, and Heavy-Commercial Context",
    confidence: "source_supported",
    whyItBelongs: "Piers 80–96 establish Bayview Industrial's specialized maritime, cargo, rail, bulk-material, vehicle-processing, warehousing, and heavy-commercial edge without functioning as an ordinary tenant-search district.",
    districtFit: "The Port complex explains the district's industrial scale and infrastructure context while remaining separate from conventional warehouse, flex, or Building Profile inventory.",
    typicalUsers: ["port-dependent, cargo, maritime-support, rail-served, bulk-material, and specialized heavy-commercial operators requiring a dedicated investigation"],
    leasingSituations: ["special-purpose maritime investigations", "cargo and rail infrastructure comparisons", "district-level heavy-commercial context"],
    strengths: ["official Port operating geography", "cargo terminal and on-dock rail context", "maritime and bulk-material functions", "city infrastructure role"],
    tradeoffs: [validationTradeoff, "Port jurisdiction, specialized access, tenancy rules, resilience, and operational constraints make this unsuitable for ordinary Building Profile or recommendation treatment."],
    nearbyAlternatives: ["Bayview conventional PDR areas", "Central Waterfront maritime-support edge", "regional Port and logistics markets"],
    publicSources: [
      { label: "Port of San Francisco — Cargo and Shipping", url: "https://www.sfport.com/maritime/cargo-shipping", sourceType: "government" },
      { label: "Port of San Francisco — Piers 80–96 Maritime Eco-Industrial Strategy", url: "https://www.sfport.com/projects-programs/piers-80-96-maritime-eco-industrial-strategy", sourceType: "government" },
      { label: "Port of San Francisco — Waterfront Resilience Story Maps", url: "https://www.sfport.com/wrp/story-maps", sourceType: "government" },
    ],
  }),
];

module.exports = {
  schemaVersion: "commercial-market-evidence-v1",
  collectionId: "sf-bayview-industrial-commercial-market-evidence",
  collectionType: "district_commercial_market_evidence",
  status: "production_reference",
  district,
  districtNarrative: {
    whyItExists: "Bayview Industrial is San Francisco's broadest city-serving operational industrial geography, combining protected PDR fabric, wholesale food and distribution infrastructure, contractor and service-industrial environments, modern PDR development potential, and specialized Port context.",
    strongestWhen: ["operations need to remain inside San Francisco", "warehouse, wholesale, food, contractor, fleet, production, distribution, or operational-flex needs outweigh showroom or office image", "the business can validate a site-specific urban operating configuration"],
    weakerWhen: ["regional logistics scale, trailer parking, or large yards matter more than city proximity", "urban production and prototyping fit better than warehouse and service logistics", "the requirement assumes uniform loading, power, permitted use, or environmental conditions"],
  },
  naturalBusinessFit: {
    fits: ["city-serving distributors", "food wholesalers and producers", "contractors and building-service companies", "fleet and repair operations", "light manufacturers", "operational flex users"],
    lessNaturalFor: ["large regional logistics operations", "showroom-led design businesses", "conventional client-facing office users", "businesses unwilling to perform site-specific environmental and use validation"],
  },
  qualityStandard: "A sufficient Bayview Industrial collection must explain protected everyday PDR, food wholesale and logistics, future modern PDR development, and specialized Southern Waterfront activity without converting proposals or Port infrastructure into ordinary inventory.",
  records,
  deferredCandidates: [
    { title: "Existing Bayview warehouse and service-industrial Building Profiles", reason: "Research stable canonical addresses and property-level provenance before selecting any conventional Building Briefs." },
    { title: "Food-production and cold-chain buildings outside The SF Market", reason: "Useful for later depth only when building systems and use claims can be sourced without relying on tenant occupancy." },
  ],
};
