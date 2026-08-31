const DISCLAIMER = "Representative environments illustrate reviewed commercial character, not availability or property capability. Loading, clear height, power, yard, ventilation, permitted use, and other building facts require current investigation.";

const evidence = (id, label, path, role, source) => Object.freeze({ id, label, path, role, source, confidence: "reviewed", propertyVerification: DISCLAIMER });

const common = {
  "miramar": { districtName: "Miramar", path: "/commercial-real-estate/CA/san-diego/miramar/", evidenceOwner: "miramar", representatives: [evidence("6906-miramar-road", "6906 Miramar Road", "/commercial-real-estate/building/CA/san-diego/6906-miramar-rd/", "Customer-facing service/showroom example", "Reviewed San Diego Industrial public consolidation")], provenance: ["_data/sanDiegoIndustrialPublicDecision.js", "scripts/qa-san-diego-industrial-public-consolidation.js", "_data/locationKnowledgeGraph.js"] },
  "otay-mesa": { districtName: "Otay Mesa", path: "/commercial-real-estate/CA/san-diego/otay-mesa/", evidenceOwner: "otay-mesa", representatives: [evidence("7310-otay-crossings", "7310 Otay Crossings Court", "/commercial-real-estate/building/CA/san-diego/7310-otay-crossings-ct/", "Warehouse/distribution environment", "Reviewed San Diego Industrial public consolidation"), evidence("7615-siempre-viva", "7615 Siempre Viva Road", "/commercial-real-estate/building/CA/san-diego/7615-siempre-viva-rd/", "Manufacturing/logistics environment", "Reviewed San Diego Industrial public consolidation")], provenance: ["_data/sanDiegoIndustrialPublicDecision.js", "scripts/qa-san-diego-industrial-public-consolidation.js", "_data/locationKnowledgeGraph.js"] },
  "kearny-mesa": { districtName: "Kearny Mesa", path: "/commercial-real-estate/CA/san-diego/kearny-mesa/", evidenceOwner: "kearny-mesa", representatives: [evidence("4000-ruffin-road", "4000 Ruffin Road", "/commercial-real-estate/building/CA/san-diego/4000-ruffin-rd/", "Service-commercial and Flex environment", "Reviewed San Diego Industrial public consolidation")], provenance: ["_data/sanDiegoIndustrialPublicDecision.js", "scripts/qa-san-diego-industrial-public-consolidation.js", "_data/locationKnowledgeGraph.js"] },
  "sorrento-mesa": { districtName: "Sorrento Mesa", path: "/commercial-real-estate/CA/san-diego/sorrento-mesa/", evidenceOwner: "sorrento-mesa", representatives: [evidence("10130-sorrento-valley-road", "10130 Sorrento Valley Road", "/commercial-real-estate/building/CA/san-diego/10130-sorrento-valley-rd/", "Technical R&D/Flex environment", "Reviewed supporting Sorrento Valley evidence owned by Sorrento Mesa")], provenance: ["_data/sanDiegoIndustrialPublicDecision.js", "scripts/qa-san-diego-industrial-public-consolidation.js", "_data/locationKnowledgeGraph.js"] },
};

const facts = {
  industrial: {
    "miramar": { fit: "STRONG", classification: "CORE_INDUSTRIAL", traits: ["WAREHOUSE", "DISTRIBUTION", "CONTRACTOR", "SERVICE", "SHOWROOM", "LIGHT_MANUFACTURING", "OFFICE_WAREHOUSE"], strengths: ["Broad reviewed conventional warehouse, contractor/service, distribution, showroom, and office/warehouse context.", "Central and north San Diego operating orientation."], tradeoffs: ["Border-led logistics may be better investigated in Otay Mesa."] },
    "otay-mesa": { fit: "STRONG", classification: "CORE_INDUSTRIAL", traits: ["DISTRIBUTION", "LOGISTICS", "TRUCK_ORIENTED", "MANUFACTURING", "LARGER_FORMAT", "WAREHOUSE"], strengths: ["Reviewed border-oriented distribution, logistics, manufacturing, and larger-format Industrial context."], tradeoffs: ["Its southern geography can conflict with employee, customer, or service territories farther north."] },
    "kearny-mesa": { fit: "GOOD", classification: "SITUATIONAL_INDUSTRIAL", traits: ["CONTRACTOR", "SERVICE", "SHOWROOM", "CUSTOMER_FACING", "OFFICE_WAREHOUSE"], strengths: ["Central service-commercial and customer-facing operational context."], tradeoffs: ["Conventional warehouse and larger-format logistics depth should not be assumed."] },
    "sorrento-mesa": { fit: "GOOD", classification: "SITUATIONAL_INDUSTRIAL", traits: ["LIGHT_MANUFACTURING", "OFFICE_PRODUCTION", "TECHNICAL", "R_AND_D_SUPPORT"], strengths: ["Selective technical production and office-production context."], tradeoffs: ["It is not an ordinary warehouse, distribution, or yard-led geography."] },
  },
  flex: {
    "miramar": { fit: "GOOD", classification: "CORE_FLEX", traits: ["OFFICE_WAREHOUSE", "SHOWROOM", "SERVICE", "LIGHT_MANUFACTURING", "CUSTOMER_FACING"], strengths: ["Reviewed hybrid office/warehouse, showroom, service, and production-support context."], tradeoffs: ["Technical R&D users may find stronger ecosystem alignment in Sorrento Mesa."] },
    "otay-mesa": { fit: "LIMITED", classification: "GENERALLY_NOT_FLEX", traits: [], strengths: [], tradeoffs: ["Ordinary technical or customer-facing Flex is not established by the reviewed logistics context."] },
    "kearny-mesa": { fit: "STRONG", classification: "CORE_FLEX", traits: ["SHOWROOM", "CUSTOMER_FACING", "CONTRACTOR", "SERVICE", "OFFICE_PRODUCTION", "OFFICE_WAREHOUSE"], strengths: ["Reviewed central showroom, service, office/Flex, and customer-facing hybrid environment."], tradeoffs: ["Deep R&D and conventional distribution are better investigated elsewhere."] },
    "sorrento-mesa": { fit: "STRONG", classification: "CORE_FLEX", traits: ["R_AND_D_SUPPORT", "TECHNICAL", "ENGINEERING", "OFFICE_PRODUCTION", "LIFE_SCIENCE_SUPPORT", "EMPLOYEE_ENVIRONMENT"], strengths: ["Reviewed R&D, engineering, technical, office-production, and life-science-support environment."], tradeoffs: ["Specialized infrastructure and technical capability remain property-specific."] },
  },
};

function build(model) { return Object.entries(facts[model]).map(([districtId, item]) => ({ districtId, ...common[districtId], ...item, summary: item.strengths[0] || item.tradeoffs[0], evidenceSources: common[districtId].provenance, reviewStatus: "APPROVED", confidence: "reviewed", propertyVerification: DISCLAIMER })); }

module.exports = Object.freeze({
  schemaVersion: "san-diego-industrial-flex-composition-foundation:v1",
  marketId: "san-diego",
  customerEntryPropertyType: "industrial_flex",
  certifiedDistrictIds: Object.freeze(Object.keys(common)),
  industrial: Object.freeze({ modelId: "san-diego:industrial", districts: Object.freeze(build("industrial")) }),
  flex: Object.freeze({ modelId: "san-diego:flex", districts: Object.freeze(build("flex")) }),
  contextualGeographies: Object.freeze([{ geographyId: "sorrento-valley", ownerDistrictId: "sorrento-mesa", role: "PRESENTATION_CONTEXT", reason: "Supporting building-location identity; Sorrento Mesa owns the recommendation decision." }]),
  excludedMunicipalities: Object.freeze(["chula-vista", "poway", "vista", "oceanside", "carlsbad"]),
  policy: "Only four City of San Diego geographies are eligible. Candidate entry is comparison context only; property capability remains an investigation question.",
});
