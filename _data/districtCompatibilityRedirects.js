const locationKnowledgeGraph = require("./locationKnowledgeGraph.js");

const districtBySlug = new Map(
  locationKnowledgeGraph
    .filter((node) => node.type === "district")
    .map((node) => [node.slug, node])
);

module.exports = locationKnowledgeGraph
  .filter((node) => node.type === "district" && node.industrialGeography?.overlapRelationship?.relationship === "compatibility_alias")
  .map((node) => {
    const owner = districtBySlug.get(node.industrialGeography.overlapRelationship.canonicalKnowledgeOwner);
    return owner ? { from: node.path, to: owner.path, status: 301 } : null;
  })
  .filter(Boolean);

// Preserve legacy SF URLs without creating duplicate district guides.
if (process.env.FINANCIAL_DISTRICT_REFERENCE_ENABLED === 'true') {
  for (const [alias, owner] of [['design-district','showplace-square'], ['mission','mission-district']]) {
    for (const slash of ['/', '']) {
      const from = '/commercial-real-estate/CA/san-francisco/' + alias + slash;
      if (!module.exports.some(item => item.from === from)) module.exports.push({from, to: '/commercial-real-estate/CA/san-francisco/' + owner + '/', status: 301});
    }
  }
}
