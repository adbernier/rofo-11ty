const accessFoundation = require("./sfAccessFoundationV0");
const knowledgeGraph = require("./locationKnowledgeGraph");
const commercialLocationModel = require("./commercialLocationModel");
const recommendationModel = require("./sfOfficeRecommendationModel");
const recommendationPresentationGroups = require("./sfOfficeRecommendationPresentationGroups");

const districts = accessFoundation.districtProfiles.map((accessProfile) => {
  const knowledge = knowledgeGraph.find((item) => item.slug === accessProfile.districtId) || {};
  const production = recommendationModel.districts[accessProfile.districtId] || {};
  const editorial = commercialLocationModel.byPath?.[knowledge.path] || {};
  return {
    districtId: accessProfile.districtId,
    districtName: accessProfile.districtName,
    path: knowledge.path || "",
    officeFit: accessProfile.propertyTypeFit,
    officeFitSummary: knowledge.spaceTypeFit?.office?.summary || "",
    officeBestFor: knowledge.spaceTypeFit?.office?.bestFor || [],
    officeTradeoffs: knowledge.spaceTypeFit?.office?.tradeoffs || knowledge.tradeoffs || [],
    strategyRole: production.strategyRole || editorial.commercial_thesis || knowledge.spaceTypeFit?.office?.summary || "",
    stableAttributes: production.stableAttributes || knowledge.attributes || {},
    ecosystems: production.ecosystems || knowledge.commercialEcosystem?.subtypes || [],
    businessEnvironmentCharacteristics: knowledge.businessEnvironmentCharacteristics || [],
    bestFitBusinesses: editorial.best_fit_businesses || knowledge.bestFor || [],
    poorFitBusinesses: editorial.poor_fit_businesses || [],
    evidenceSources: [
      production.strategyRole ? "_data/sfOfficeRecommendationModel.js" : "",
      knowledge.slug ? "_data/locationKnowledgeGraph.js" : "",
      editorial.commercial_thesis ? "_data/commercialLocationModel.js" : "",
    ].filter(Boolean),
    productionStartingDistrict: accessProfile.startingDistrict,
    shadowAccessActivationEligible: accessProfile.accessActivationEligible,
  };
});

module.exports = {
  schemaVersion: "sf-office-composition-foundation:v1",
  marketId: "san-francisco",
  propertyType: "office",
  componentPolicy: "Business Environment, Access, and Office Fit remain separate. Candidate preferences are comparison metadata only.",
  presentationGroups: recommendationPresentationGroups.groups,
  districts,
};
