"use strict";

const representativeContent = require("./sfRepresentativeContent");
const editorial = Object.fromEntries(["office","retail","industrial","flex"].map(spaceType => [spaceType, require(`../data/internal/sf-commercial-district-intelligence-v1/${spaceType}.json`).districts]));

const labels = { office: "Office", retail: "Retail", industrial: "Industrial", flex: "Flex" };
const explorationTitles = { office:"Explore Office Districts", retail:"Explore Retail Districts & Corridors", industrial:"Explore Industrial Districts", flex:"Explore Flex Districts" };
const introductions = {
  office:"Compare traditional downtown towers, creative conversions, research campuses, and neighborhood-scale workplaces.",
  retail:"Compare destination shopping, neighborhood main streets, dining corridors, and specialized storefront districts.",
  industrial:"Compare San Francisco’s distinct production, warehouse, contractor, and city-serving districts.",
  flex:"Compare districts where office, technical, showroom, production, and operating needs overlap.",
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
    areaPatterns: geography.commonHere,
    propertyVerified: "",
    investigate: "",
    availabilityBoundary: representativeContent.availabilityDisclaimer,
  }));
}

const bySpaceType = Object.fromEntries(Object.keys(labels).map(spaceType => {
  const geographies = editorial[spaceType]
    .filter(geography => ["PUBLIC_REVIEWED", "PUBLIC_CONTEXTUAL"].includes(geography.publicEvidenceTier))
    .sort((a,b) => a.gridOrder - b.gridOrder)
    .map(geography => ({
      id: geography.id,
      label: geography.label,
      geographyType: geography.geographyType,
      geographyTypeLabel: typeLabels[geography.geographyType],
      evidenceTier: geography.publicEvidenceTier,
      applicability: geography.applicability,
      routeState: geography.route ? "ROUTE_READY" : "COMPONENT_ONLY",
      canonicalPath: geography.route,
      grid: { group:"commercial-core", order:geography.gridOrder },
      oneLineDistinction: geography.oneLineDistinction,
      description: geography.shortDescription,
      commercialCharacter: geography.whatStandsOut,
      areaPatterns: geography.commonHere,
      whatStandsOut: geography.whatStandsOut,
      worthKnowing: geography.worthKnowing,
      compareWith: geography.compareWith,
      sourceIds: geography.sourceIds,
      orientation: [],
      access: geography.accessReadiness === "OBJECTIVE_ACCESS_READY" ? geography.accessObservations : [],
      representatives: propertiesFor(geography, spaceType),
      investigationBoundaries: geography.worthKnowing,
    }));
  const enriched = geographies.map((geography, index) => ({
    ...geography,
    related: geography.compareWith.map(id => geographies.find(item=>item.id===id)).filter(Boolean).slice(0,4).map(item => ({ id:item.id,label:item.label,path:item.canonicalPath })),
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
  availabilityFirewall: "Confirm current availability and the exact condition, configuration, access, and permitted use of any specific space.",
});
