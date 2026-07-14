const graph = require("../_data/locationKnowledgeGraph");
const schema = require("../_data/locationKnowledgeSchema");
const neighborhoodPages = require("../_data/neighborhoodPages");

const pageCoverageMetros = [
  { label: "San Diego", state: "CA", cities: ["San Diego", "Carlsbad", "Oceanside", "Vista", "San Marcos", "Escondido", "Encinitas", "Del Mar", "Poway", "Santee", "Chula Vista"] },
  { label: "Orange County", state: "CA", cities: ["Irvine", "Newport Beach", "Costa Mesa", "Santa Ana", "Anaheim", "Tustin", "Lake Forest", "Mission Viejo", "Huntington Beach", "Fullerton"] },
  { label: "Sacramento", state: "CA", cities: ["Sacramento", "West Sacramento", "Rancho Cordova", "Folsom", "Roseville", "Rocklin", "Elk Grove"] },
  { label: "Denver", state: "CO", cities: ["Denver", "Boulder", "Broomfield", "Aurora", "Centennial", "Englewood", "Lone Tree", "Commerce City", "Lakewood", "Golden", "Westminster", "Louisville"] },
];

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

function cityName(page) {
  return page && (page.city || page.city_name || page.market_city || "");
}

const pageCoverageWithoutGraph = pageCoverageMetros.map((metro) => {
  const citySet = new Set(metro.cities);
  const pageCount = neighborhoodPages.filter((page) => page && page.state_abbr === metro.state && citySet.has(cityName(page))).length;
  const graphCount = nodes.filter((node) => node && node.state === metro.state && citySet.has(node.city)).length;
  return { ...metro, pageCount, graphCount };
}).filter((metro) => metro.pageCount > 0 && metro.graphCount === 0);

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

console.log(`Page-covered metros missing graph nodes: ${pageCoverageWithoutGraph.length}`);
if (pageCoverageWithoutGraph.length) {
  pageCoverageWithoutGraph.forEach((metro) => {
    console.log(`- ${metro.label}: ${metro.pageCount} public district pages; recommendation readiness missing`);
  });
}
