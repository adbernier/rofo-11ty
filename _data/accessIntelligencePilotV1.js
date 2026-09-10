const selection = require("../data/internal/access-intelligence-v1/pilot-public-selection.json");

const allowedGeographyIds = Object.freeze(selection.selections.map(item => item.geographyId));
const byGeographyId = Object.create(null);

for (const item of selection.selections) {
  const facts = item.facts.map(fact => Object.freeze({
    id: fact.id,
    category: fact.category,
    label: fact.customerLabel,
    relationship: fact.customerRelationship,
    propertyTypes: Object.freeze([...(fact.propertyTypes || [])]),
    sourceIds: Object.freeze([...fact.sourceIds])
  }));
  byGeographyId[item.geographyId] = Object.freeze({ geographyId:item.geographyId, facts:Object.freeze(facts) });
}

function forGeography(geographyId, propertyType) {
  if (!allowedGeographyIds.includes(geographyId)) return null;
  const item = byGeographyId[geographyId];
  const facts = item.facts.filter(fact => fact.propertyTypes.includes(propertyType));
  return facts.length >= 2 ? { geographyId, heading:"Access & location", facts } : null;
}

const routeAliases = Object.freeze({ sodo:{ geographyId:"sodo-duwamish", propertyType:"industrial" } });
function forRoute(slug) {
  const target = routeAliases[slug];
  return target ? forGeography(target.geographyId,target.propertyType) : null;
}

module.exports = Object.freeze({ schemaVersion:"access-intelligence-public-pilot:v1", allowedGeographyIds, byGeographyId:Object.freeze(byGeographyId), routeAliases, forGeography, forRoute });
