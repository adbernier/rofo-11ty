"use strict";

const foundation = require("../data/internal/public-commercial-geography-v1/san-francisco.json");
const representativeContent = require("./sfRepresentativeContent");

const labels = { office: "Office", retail: "Retail", industrial: "Industrial", flex: "Flex" };
const explorationTitles = { office:"Explore Office Districts", retail:"Explore Retail Districts & Corridors", industrial:"Explore Industrial Districts", flex:"Explore Flex Districts" };
const introductions = {
  office:"Compare the San Francisco districts that shape office environment, business context, and workplace character.",
  retail:"Compare the districts and corridors that shape customer context and storefront environment.",
  industrial:"Compare the areas that support different kinds of production, warehouse, and city-serving operations.",
  flex:"Compare areas where office, production, technical, and operating needs can overlap.",
};
const slugs = { office: "office-space", retail: "retail-space", industrial: "industrial-space", flex: "flex-space" };
const typeLabels = {
  OFFICE_DISTRICT: "Office district", INDUSTRIAL_DISTRICT: "Industrial district",
  INDUSTRIAL_CORRIDOR: "Industrial corridor", RETAIL_CORRIDOR: "Retail corridor",
  MAIN_STREET: "Main street", BUSINESS_PARK: "Business park",
  FLEX_BUSINESS_PARK_ENVIRONMENT: "Flex / business-park environment",
  R_AND_D_TECHNICAL_CLUSTER: "R&D / technical cluster", LOGISTICS_ENVIRONMENT: "Logistics environment",
  MIXED_COMMERCIAL_DISTRICT: "Mixed commercial district", SPECIALIZED_OPERATING_ENVIRONMENT: "Specialized operating environment",
};

const allowed = foundation.geographies.filter(geography => ["PUBLIC_REVIEWED", "PUBLIC_CONTEXTUAL"].includes(geography.publicEvidenceTier));

function publicDescription(geography, relationship) {
  const patterns = relationship.areaPatterns.map(item => item.label).join(", ");
  return `${geography.label} is a ${typeLabels[geography.geographyType].toLowerCase()} within San Francisco's commercial landscape. For ${labels[relationship.spaceType]} searches, reviewed area evidence supports ${patterns}. These are geography-level patterns that help orient a search, not promises about any individual building or current availability. Use this context for early comparison before investigating specific properties.`;
}

function propertiesFor(geography, spaceType) {
  return (representativeContent.byDistrictId[geography.id] || []).slice(0, 3).map(property => ({
    id: property.id,
    kind: property.canonicalUrl ? "PROPERTY" : "ENVIRONMENT",
    name: property.name,
    address: property.address,
    propertyType: property.buildingType || labels[spaceType],
    geography: geography.label,
    municipality: "San Francisco",
    canonicalUrl: property.canonicalUrl || "",
    image: property.image || "",
    areaPatterns: geography.spaceTypes.find(item => item.spaceType === spaceType).areaPatterns.map(item => item.label),
    propertyVerified: "",
    investigate: property.canonicalUrl
      ? "Current availability and exact property configuration require current verification."
      : "Specific properties, current conditions, and suitability require investigation.",
    availabilityBoundary: representativeContent.availabilityDisclaimer,
  }));
}

const bySpaceType = Object.fromEntries(Object.keys(labels).map(spaceType => {
  const geographies = allowed
    .map(geography => ({ geography, relationship: geography.spaceTypes.find(item => item.spaceType === spaceType) }))
    .filter(item => item.relationship && item.relationship.applicability !== "NOT_APPLICABLE")
    .sort((a,b) => a.geography.grid.order - b.geography.grid.order)
    .map(({ geography, relationship }) => ({
      id: geography.id,
      label: geography.label,
      geographyType: geography.geographyType,
      geographyTypeLabel: typeLabels[geography.geographyType],
      evidenceTier: geography.publicEvidenceTier,
      applicability: relationship.applicability,
      routeState: relationship.routeState,
      canonicalPath: relationship.routeState === "ROUTE_READY" ? relationship.route : "",
      grid: geography.grid,
      description: publicDescription(geography, relationship),
      commercialCharacter: geography.commercialCharacter,
      areaPatterns: relationship.areaPatterns.map(item => item.label),
      orientation: [geography.majorCorridor, geography.relativeOrientation].filter(Boolean),
      access: relationship.accessReadiness === "OBJECTIVE_ACCESS_READY" ? (relationship.accessObservations || []) : [],
      representatives: propertiesFor(geography, spaceType),
      investigationBoundaries: geography.investigationBoundaries,
    }));
  const enriched = geographies.map((geography, index) => ({
    ...geography,
    related: geographies.filter(item => item.id !== geography.id).slice(Math.max(0,index-1),Math.max(0,index-1)+3).map(item => ({ id:item.id,label:item.label,path:item.canonicalPath })),
  }));
  return [spaceType, {
    id: spaceType,
    label: labels[spaceType],
    slug: slugs[spaceType],
    path: `/commercial-real-estate/CA/san-francisco/${slugs[spaceType]}/`,
    explorationTitle: explorationTitles[spaceType],
    introduction: introductions[spaceType],
    geographies: enriched,
  }];
}));

const byGeographyId = {};
for (const [spaceType, view] of Object.entries(bySpaceType)) for (const geography of view.geographies) {
  if (!byGeographyId[geography.id]) byGeographyId[geography.id] = [];
  byGeographyId[geography.id].push({ spaceType, spaceTypeLabel:labels[spaceType], spaceTypePath:view.path, ...geography });
}

module.exports = Object.freeze({
  schemaVersion: "sf-public-commercial-geography-experience:v1",
  city: { label:"San Francisco", state:"CA", path:"/commercial-real-estate/CA/san-francisco/" },
  spaceTypes: Object.values(bySpaceType), bySpaceType, byGeographyId,
  availabilityFirewall: "Representative examples explain commercial geography. Current availability, rent, suites, loading, power, clear height, parking and permitted use require current property investigation.",
});
