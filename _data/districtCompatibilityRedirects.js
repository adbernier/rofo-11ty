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
