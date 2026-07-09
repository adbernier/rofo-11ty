const graph = require("../_data/locationKnowledgeGraph");
const schema = require("../_data/locationKnowledgeSchema");

const nodes = Array.isArray(graph) ? graph : [];
const slugs = new Set(nodes.map((node) => node && node.slug).filter(Boolean));
const confidenceCounts = nodes.reduce((counts, node) => {
  const key = node && node.confidence ? node.confidence : "missing";
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {});

const cityCounts = nodes.reduce((counts, node) => {
  const key = node && node.city ? `${node.city}, ${node.state || ""}`.trim() : "Unknown";
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {});

const missingSpaceTypeFit = nodes
  .filter((node) => !node.spaceTypeFit || !Object.keys(node.spaceTypeFit).length)
  .map((node) => node.slug);

const missingQuestions = nodes
  .filter((node) => !Array.isArray(node.questionsToValidate) || !node.questionsToValidate.length)
  .map((node) => node.slug);

const unresolvedRelationships = [];
nodes.forEach((node) => {
  (((node.relationships || {}).compareWith) || []).forEach((relationship) => {
    if (relationship.slug && !slugs.has(relationship.slug)) {
      unresolvedRelationships.push(`${node.slug} -> ${relationship.slug}`);
    }
  });
});

const validationWarnings = schema.validateLocationKnowledgeGraph(nodes);

console.log(`Location knowledge graph nodes: ${nodes.length}`);
console.log("Nodes by confidence:");
Object.keys(confidenceCounts).sort().forEach((key) => {
  console.log(`- ${key}: ${confidenceCounts[key]}`);
});

console.log("Nodes by city:");
Object.entries(cityCounts)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .forEach(([key, count]) => {
    console.log(`- ${key}: ${count}`);
  });

console.log(`Nodes missing spaceTypeFit: ${missingSpaceTypeFit.length}`);
if (missingSpaceTypeFit.length) missingSpaceTypeFit.forEach((slug) => console.log(`- ${slug}`));

console.log(`Nodes missing questionsToValidate: ${missingQuestions.length}`);
if (missingQuestions.length) missingQuestions.forEach((slug) => console.log(`- ${slug}`));

console.log(`Relationship slugs that do not resolve: ${unresolvedRelationships.length}`);
if (unresolvedRelationships.length) unresolvedRelationships.forEach((item) => console.log(`- ${item}`));

console.log(`Schema validation warnings: ${validationWarnings.length}`);
if (validationWarnings.length) validationWarnings.forEach((warning) => console.log(`- ${warning}`));
