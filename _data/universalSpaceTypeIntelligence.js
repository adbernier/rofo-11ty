"use strict";

const signal = (kind, id, strength = "explicit") => Object.freeze({ kind, id, strength });
const dimension = (id, label, whyItMatters, signals, investigationTopics, verificationBoundary) => Object.freeze({
  id, label, whyItMatters, signals: Object.freeze(signals),
  investigationTopics: Object.freeze(investigationTopics), verificationBoundary,
});
const foundation = (id, label, propertyContext, usePatterns, dimensions, gaps) => Object.freeze({
  id, label, propertyContext, status: "READY", usePatterns: Object.freeze(usePatterns),
  dimensions: Object.freeze(dimensions), requirementGaps: Object.freeze(gaps),
});

const office = foundation("office", "Office", "office", [
  { id: "technology_product", businessIdentity: "technology", activities: ["work", "meet_collaborate"] },
  { id: "professional_services", businessIdentity: "professional_services", activities: ["work", "host_visitors"] },
  { id: "creative_design", businessIdentity: "design_creative", activities: ["work", "meet_collaborate"] },
], [
  dimension("office.employee_access", "Employee access", "Commute geography, transit, driving and parking can shape attendance and recruiting.", [signal("dimension", "universal.location.employee_origins"), signal("dimension", "universal.access.transit_importance"), signal("dimension", "universal.access.parking_importance")], ["employee commute implications", "transit and driving access", "parking options"], "Actual commute performance and parking conditions require local evidence."),
  dimension("office.client_access", "Client and visitor access", "Visit frequency and visitor geography affect convenience and presentation needs.", [signal("dimension", "office.access.client_visits"), signal("dimension", "universal.location.customer_origins")], ["visitor access", "regional and airport considerations", "professional presentation"], "Visitor convenience at a location requires local evidence."),
  dimension("office.workplace_environment", "Workplace environment", "Building character and neighborhood setting affect employee experience and business image.", [signal("dimension", "office.environment.image"), signal("dimension", "universal.business.type")], ["building quality and character", "employee environment", "amenities"], "No building or neighborhood quality is inferred without reviewed evidence."),
  dimension("office.configuration", "Space configuration", "Headcount, collaboration, meetings and flexibility determine whether a space can support the work.", [signal("dimension", "office.occupancy.peak_attendance"), signal("activity", "meet_collaborate"), signal("dimension", "universal.capacity.size")], ["workspace configuration", "meeting and collaboration needs", "floorplate and growth options"], "Room counts, floorplates and building capability require property investigation."),
], ["private-office versus collaborative mix", "meeting-room needs", "growth horizon", "floorplate preference"]);

const retail = foundation("retail", "Retail / Service", "retail_service", [
  { id: "consumer_brand", businessIdentity: "boutique_brand", activities: ["sell_serve"] },
  { id: "premium_luxury", businessIdentity: "premium_luxury", activities: ["sell_serve"] },
  { id: "neighborhood_service", businessIdentity: "neighborhood_service", activities: ["host_visitors", "sell_serve"] },
  { id: "fitness_wellness", businessIdentity: "fitness_wellness", activities: ["host_visitors"] },
  { id: "food", businessIdentity: "food_beverage", activities: ["sell_serve", "prepare_produce_food"] },
  { id: "showroom_design", businessIdentity: "showroom_design", activities: ["display_present", "sell_serve"] },
  { id: "convenience", businessIdentity: "convenience", activities: ["sell_serve"] },
  { id: "destination_experiential", businessIdentity: "destination_experiential", activities: ["host_visitors", "sell_serve"] },
], [
  dimension("retail.customer_environment", "Customer environment", "Neighborhood, destination, visitor, daytime and residential demand can matter differently by operating model.", [signal("dimension", "universal.business.type"), signal("dimension", "retail.customer.destination_visibility"), signal("dimension", "universal.location.customer_origins")], ["local demand sources", "planned versus walk-in visits", "customer catchment"], "Demand, demographics and pedestrian activity require reviewed local evidence."),
  dimension("retail.visibility_storefront", "Visibility and storefront", "Frontage, signage, entry and street presence can materially affect customer discovery.", [signal("dimension", "retail.customer.destination_visibility")], ["frontage", "signage", "customer entry", "storefront character"], "No visibility or foot-traffic conclusion is made without property and local evidence."),
  dimension("retail.customer_access", "Customer and service access", "Customer parking, transit, pedestrian arrival and deliveries may pull in different directions.", [signal("dimension", "universal.access.parking_importance"), signal("dimension", "universal.access.transit_importance"), signal("dimension", "retail.operations.delivery_receiving")], ["customer access", "parking and transit", "delivery and service access"], "Actual access conditions require local and property verification."),
  dimension("retail.commercial_context", "Commercial adjacency", "Complementary uses and the surrounding shopping, dining or service context may support the concept.", [signal("dimension", "universal.business.type"), signal("activity", "sell_serve")], ["complementary businesses", "shopping and dining context", "destination clusters"], "Adjacency and co-tenancy are not inferred without current local evidence."),
  dimension("retail.property_fit", "Property capability", "Configuration, deliveries and specialized infrastructure can determine whether a storefront works.", [signal("dimension", "retail.operations.delivery_receiving"), signal("dimension", "food.operations.intensity"), signal("dimension", "universal.operations.technical_screen")], ["storefront configuration", "delivery and service", "ventilation and infrastructure", "use compatibility"], "Permitted use, systems and building capability require authoritative verification."),
], ["frontage and signage needs", "customer-entry configuration", "adjacency priority", "direct customer-parking need", "food ventilation and utility detail"]);

const industrial = foundation("industrial", "Industrial / Warehouse", "industrial_flex", [
  { id: "warehouse_distribution", activities: ["store", "receive", "ship_distribute"] },
  { id: "last_mile", activities: ["receive", "ship_distribute", "dispatch"] },
  { id: "contractor_service", activities: ["repair_service", "dispatch", "operate_vehicles"] },
  { id: "food_production", activities: ["prepare_produce_food", "store", "ship_distribute"] },
  { id: "fabrication_manufacturing", activities: ["make_assemble"] },
], [
  dimension("industrial.building_function", "Building functionality", "Loading, volume, floor characteristics and warehouse-to-office mix drive operational fit.", [signal("dimension", "industrial.loading.grade_level"), signal("dimension", "industrial.operations.warehouse_storage"), signal("dimension", "industrial.property.office_component")], ["loading configuration", "clear height and column spacing", "floor capability", "warehouse-to-office ratio"], "Specifications must be verified for each property."),
  dimension("industrial.operational_access", "Operational access", "Truck, fleet, last-mile and regional movement needs shape the viable search area and site.", [signal("dimension", "industrial.access.truck_circulation"), signal("dimension", "industrial.location.employee_service_geography"), signal("activity", "dispatch")], ["truck and service access", "regional connectivity", "last-mile and fleet movement"], "No travel-time or local access conclusion is made without reviewed evidence."),
  dimension("industrial.site", "Site and circulation", "Parking, yard, storage and vehicle circulation may be essential to the operation.", [signal("dimension", "industrial.site.fleet_storage"), signal("dimension", "industrial.site.yard_outdoor_storage"), signal("activity", "operate_vehicles")], ["parking and circulation", "yard or outdoor storage", "secure vehicle and trailer needs"], "Site capability requires property verification."),
  dimension("industrial.infrastructure", "Infrastructure", "Power, ventilation, refrigeration and utilities may determine whether production can operate.", [signal("dimension", "industrial.power.three_phase"), signal("dimension", "industrial.power.exact_capacity"), signal("dimension", "food.diligence.infrastructure")], ["power", "specialized utilities", "ventilation", "cold storage"], "Capacity, code and systems require authoritative verification."),
  dimension("industrial.use_compatibility", "Use compatibility", "Operational intensity must be compatible with the building, code and permitted use.", [signal("dimension", "universal.diligence.permitted_use"), signal("dimension", "industrial.operations.repair_production")], ["permitted use", "code and building capability", "surrounding use compatibility"], "Rofo does not make zoning or permitted-use conclusions from universal intelligence."),
], ["dock versus grade loading", "clear height", "column spacing", "floor loading", "yard/trailer detail", "exact power and utility requirements"]);

const flex = foundation("flex", "Flex", "industrial_flex", [
  { id: "showroom", activities: ["display_present", "work"] },
  { id: "office_production", activities: ["work", "make_assemble"] },
  { id: "creative_production", activities: ["work", "make_assemble", "meet_collaborate"] },
  { id: "rd_technical", activities: ["work", "research_test"] },
  { id: "maker_prototyping", activities: ["make_assemble", "research_test"] },
], [
  dimension("flex.use_mix", "Use mix", "The balance among office, production, showroom, research and storage defines the hybrid requirement.", [signal("activity", "work"), signal("activity", "display_present"), signal("activity", "make_assemble"), signal("activity", "research_test")], ["office-production mix", "showroom or warehouse mix", "technical and maker activity"], "The operating mix describes requirements, not local suitability."),
  dimension("flex.building_mix", "Building mix and adaptability", "Office ratio, loading, power, volume and adaptability must work together.", [signal("dimension", "industrial.property.office_component"), signal("dimension", "industrial.loading.grade_level"), signal("dimension", "industrial.power.three_phase")], ["office ratio", "loading and volume", "power", "adaptability"], "Building capability requires property verification."),
  dimension("flex.three_way_access", "Employee, customer and operational access", "Hybrid businesses may need to balance employee experience, customer arrival and deliveries.", [signal("dimension", "universal.location.employee_origins"), signal("dimension", "universal.location.customer_origins"), signal("dimension", "industrial.access.truck_circulation")], ["employee access", "customer access", "operational access", "parking and deliveries"], "Local access performance requires reviewed evidence."),
  dimension("flex.customer_environment", "Customer-facing environment", "Showroom and collaborative uses may require a different setting from operational warehouse uses.", [signal("activity", "display_present"), signal("activity", "host_visitors"), signal("dimension", "office.environment.image")], ["showroom quality", "creative or technical context", "customer-facing character"], "No neighborhood or building character is inferred universally."),
], ["direct office-to-production ratio", "showroom/customer-facing priority", "adaptability preference", "loading and power detail by mixed use"]);

const registry = Object.freeze({
  schemaVersion: "universal-space-type-intelligence:v1",
  status: "READY",
  intelligenceLevels: Object.freeze([
    Object.freeze({ id: "UNIVERSAL_SPACE_TYPE", level: 1, capability: "Explain decision dimensions, requirement implications and investigation topics in every market.", boundary: "No local facts, comparisons or rankings." }),
    Object.freeze({ id: "MARKET_LOCATION", level: 2, capability: "Use reviewed local geography, access and commercial-environment evidence.", boundary: "Depth varies by market and does not itself authorize ranking." }),
    Object.freeze({ id: "RECOMMENDATION", level: 3, capability: "Compare a reviewed decision universe through calibrated, explainable logic with abstention.", boundary: "Requires current certification and production controls." }),
  ]),
  foundations: Object.freeze({ office, retail, industrial, flex }),
  medicalDisposition: Object.freeze({ status: "DEFERRED", reason: "Existing Medical safety and abstention remain authoritative; Sprint 6 does not expand Medical recommendation behavior.", safeTopics: Object.freeze(["patient access", "parking", "accessibility", "building systems", "specialized improvements", "permitted-use verification"]), boundary: "Treat building systems, accessibility, code and permitted use as verification topics, never conclusions." }),
  briefProjectionContract: Object.freeze({ schemaVersion: "universal-brief-projection:v1", futureSections: Object.freeze(["WHAT_MATTERS", "UNDERSTOOD_REQUIREMENT", "INVESTIGATION_TOPICS", "PROPERTY_CONSIDERATIONS", "LOCATION_INTELLIGENCE_BOUNDARY"]), customerPresentationStatus: "NOT_WIRED" }),
  marketBehavior: Object.freeze({
    nonCertified: "Project universal dimensions and investigation topics; preserve local unknowns; do not rank or characterize locations.",
    certified: "Compose Requirement plus universal space-type substrate plus reviewed market evidence; calibrated local resolvers remain authoritative for rankings.",
  }),
  provenance: Object.freeze({ status: "REVIEWED_ROFO_PRODUCT_KNOWLEDGE", requirementRegistry: "requirement-dimensions:v1.4-business-identity-location-stage", activityRegistry: "requirement-activities:v1.1", extractedFrom: Object.freeze(["canonical Requirement", "SF Office foundation", "SF Retail foundation", "SF Industrial foundation", "SF Flex foundation"]), scope: "Universal concepts only; local SF conclusions are excluded." }),
});

module.exports = registry;
