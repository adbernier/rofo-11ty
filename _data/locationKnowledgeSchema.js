const spaceTypeFitValues = ["excellent", "strong", "good", "limited", "unknown"];
const attributeValues = ["high", "medium", "low", "unknown"];
const confidenceValues = ["high", "medium", "expert_guided"];
const locationTypes = ["city", "district"];
const commercialEcosystemTaxonomy = require("./commercialEcosystemTaxonomy");
const supportedSpaceTypes = [
  "office",
  "retail",
  "industrial",
  "warehouse",
  "distribution",
  "manufacturing",
  "flex",
  "r_and_d",
  "medical",
  "life_science",
  "restaurant",
  "showroom",
];
const businessAttributes = [
  "transit",
  "parking",
  "walkability",
  "freewayAccess",
  "executiveImage",
  "customerAccess",
  "expansionFlexibility",
  "talentAccess",
  "visibility",
  "amenities",
  "costPosition",
  "creativeEnvironment",
  "corporateEnvironment",
];
const retailAttributes = [
  "footTraffic",
  "customerParking",
  "coTenancy",
  "streetPresence",
  "daytimePopulation",
  "eveningWeekendActivity",
  "signageVisibility",
];
const industrialAttributes = [
  "truckAccess",
  "highwayAccess",
  "lastMileAccess",
  "portAirportAccess",
  "clearHeight",
  "loading",
  "yard",
  "power",
  "zoningFlexibility",
  "laborAccess",
  "parkingTrailer",
  "outdoorStorage",
];
const relationshipTypes = [
  "similar",
  "lower_cost_alternative",
  "better_transit",
  "better_parking",
  "more_executive",
  "more_growth_oriented",
  "more_creative",
  "better_truck_access",
  "better_loading",
  "better_last_mile",
  "better_retail_visibility",
];
const ecosystemConfidenceValues = ["high", "medium", "review_required"];

function unknownAttributes(keys) {
  return keys.reduce((output, key) => {
    output[key] = "unknown";
    return output;
  }, {});
}

function validateLocationKnowledgeGraph(nodes) {
  const warnings = [];
  const list = Array.isArray(nodes) ? nodes : [];
  const slugs = new Set(list.map((node) => node && node.slug).filter(Boolean));
  list.forEach((node, index) => {
    const label = node && (node.slug || node.label || `node ${index}`);
    ["slug", "label", "type", "state"].forEach((field) => {
      if (!node || !node[field]) warnings.push(`${label}: missing required field ${field}`);
    });
    if (node && !locationTypes.includes(node.type)) warnings.push(`${label}: invalid type ${node.type}`);
    if (node && !confidenceValues.includes(node.confidence)) warnings.push(`${label}: invalid confidence ${node.confidence}`);
    if (!node || !node.attributes) warnings.push(`${label}: missing attributes object`);
    if (!Array.isArray(node && node.questionsToValidate)) warnings.push(`${label}: missing questionsToValidate array`);

    Object.entries((node && node.spaceTypeFit) || {}).forEach(([spaceType, fit]) => {
      if (!supportedSpaceTypes.includes(spaceType)) warnings.push(`${label}: unsupported space type ${spaceType}`);
      if (fit && fit.fit && !spaceTypeFitValues.includes(fit.fit)) warnings.push(`${label}: invalid fit ${fit.fit}`);
    });

    if (node && node.type === "district") {
      const ecosystem = node.commercialEcosystem || {};
      if (!ecosystem.primary) {
        warnings.push(`${label}: missing commercialEcosystem.primary`);
      } else if (!commercialEcosystemTaxonomy.ecosystemById[ecosystem.primary]) {
        warnings.push(`${label}: unknown commercial ecosystem ${ecosystem.primary}`);
      }
      if (ecosystem.confidence && !ecosystemConfidenceValues.includes(ecosystem.confidence)) {
        warnings.push(`${label}: invalid commercialEcosystem.confidence ${ecosystem.confidence}`);
      }
      (ecosystem.secondary || []).forEach((id) => {
        if (!commercialEcosystemTaxonomy.ecosystemById[id]) warnings.push(`${label}: unknown secondary ecosystem ${id}`);
        if (id === ecosystem.primary) warnings.push(`${label}: secondary ecosystem duplicates primary ecosystem ${id}`);
      });
      (ecosystem.subtypes || []).forEach((id) => {
        const subtype = commercialEcosystemTaxonomy.subtypeById[id];
        if (!subtype) {
          warnings.push(`${label}: unknown ecosystem subtype ${id}`);
        } else if (subtype.ecosystemId !== ecosystem.primary && !(ecosystem.secondary || []).includes(subtype.ecosystemId)) {
          warnings.push(`${label}: subtype ${id} belongs to ${subtype.ecosystemId}, not declared ecosystem ${ecosystem.primary}`);
        }
      });
      (ecosystem.activities || []).forEach((id) => {
        if (!commercialEcosystemTaxonomy.activityById[id]) warnings.push(`${label}: unknown business activity ${id}`);
      });
      (ecosystem.archetypes || []).forEach((id) => {
        if (!commercialEcosystemTaxonomy.archetypeById[id]) warnings.push(`${label}: unknown business archetype ${id}`);
      });
    }

    [
      ["attributes", businessAttributes],
      ["retailAttributes", retailAttributes],
      ["industrialAttributes", industrialAttributes],
    ].forEach(([field, allowedKeys]) => {
      Object.entries((node && node[field]) || {}).forEach(([key, value]) => {
        if (!allowedKeys.includes(key)) warnings.push(`${label}: unknown ${field} key ${key}`);
        if (!attributeValues.includes(value)) warnings.push(`${label}: invalid ${field}.${key} value ${value}`);
      });
    });

    (((node && node.relationships) || {}).compareWith || []).forEach((relationship) => {
      if (relationship.relationshipType && !relationshipTypes.includes(relationship.relationshipType)) {
        warnings.push(`${label}: invalid relationship type ${relationship.relationshipType}`);
      }
      if (relationship.slug && !slugs.has(relationship.slug)) {
        warnings.push(`${label}: relationship slug ${relationship.slug} is not seeded yet`);
      }
    });
  });
  return warnings;
}

module.exports = {
  spaceTypeFitValues,
  attributeValues,
  confidenceValues,
  locationTypes,
  supportedSpaceTypes,
  businessAttributes,
  retailAttributes,
  industrialAttributes,
  relationshipTypes,
  ecosystemConfidenceValues,
  unknownBusinessAttributes: () => unknownAttributes(businessAttributes),
  unknownRetailAttributes: () => unknownAttributes(retailAttributes),
  unknownIndustrialAttributes: () => unknownAttributes(industrialAttributes),
  validateLocationKnowledgeGraph,
};
