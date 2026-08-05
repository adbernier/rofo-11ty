const businessArchetypes = require("./businessArchetypes.js");
const businessBriefDefinitions = require("./businessBriefDefinitions.js");
const locationKnowledgeGraph = require("./locationKnowledgeGraph.js");
const recommendationRepresentativeBuildings = require("./recommendationRepresentativeBuildings.js");
const { resolveBusinessBriefs } = require("../lib/publisher/resolve-business-brief.js");

module.exports = resolveBusinessBriefs({
  archetypes: businessArchetypes,
  definitions: businessBriefDefinitions,
  locationKnowledgeGraph,
  representativeBuildings: recommendationRepresentativeBuildings,
});
