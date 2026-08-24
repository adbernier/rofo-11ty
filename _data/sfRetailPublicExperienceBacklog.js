const geography = require("./sfRetailDecisionGeographies");

module.exports = Object.freeze({
  schemaVersion: "sf-retail-public-experience-backlog:v1",
  marketId: "san-francisco",
  propertyType: "retail_service",
  status: "BUILDING",
  principle: "Create a public surface only when a real location decision has distinct intelligence worth explaining; never publish a corridor merely to target a keyword.",
  items: geography.approved.map((item) => ({
    districtId: item.districtId,
    districtName: item.districtName,
    futurePublicPath: item.futurePublicPath,
    status: "PUBLIC_DECISION_SURFACE_READY",
    needs: ["representative storefront or commercial environments", "approved imagery when available", "relevant certified sample Location Brief links"],
  })),
});
