import {
  applyModelTurn,
  createEmptyRequirement,
  evaluateReadiness,
  normalizeRequirement,
} from "./requirement-domain-v1.mjs";

export const ACTIVITY_REGISTRY_VERSION = "requirement-activities:v1.1";
export const QUESTION_REGISTRY_VERSION = "requirement-questions:v1.7-adaptive-space-use";
export const INTERVIEW_ENGINE_VERSION = "requirement-interview-engine:v1.7-adaptive-space-use";
export const LOCATION_QUESTION_QUALITY_RULE = Object.freeze([
  "The request is obvious.",
  "The user naturally knows the answer.",
  "The expected specificity is obvious.",
  "Structured choices are used when they make the answer easier.",
  "The answer materially improves Location Intelligence.",
]);

export const INTERVIEW_STAGES = Object.freeze([
  { id: "ORIENT", label: "Starting the search", order: 10 },
  { id: "USE", label: "Understanding the use", order: 20 },
  { id: "LOCATION", label: "Understanding location drivers", order: 30 },
  { id: "SCALE", label: "Understanding basic scale", order: 40 },
  { id: "FINAL", label: "Final location check", order: 50 },
  { id: "PROPERTY", label: "Future property enrichment", order: 60 },
]);
const STAGE_BY_ID = Object.freeze(Object.fromEntries(INTERVIEW_STAGES.map((item) => [item.id, item])));

const activity = (id, label, ecosystemActivityIds = []) => Object.freeze({ id, label, ecosystemActivityIds });
export const ACTIVITY_REGISTRY = Object.freeze([
  activity("work", "People work here", ["knowledge_work", "administrative_operations"]),
  activity("meet_collaborate", "People meet or collaborate", ["client_meetings", "collaboration"]),
  activity("host_visitors", "Customers or clients visit", ["client_meetings", "walk_in_service"]),
  activity("sell_serve", "Products or services are sold", ["walk_in_retail", "walk_in_service", "hospitality_service"]),
  activity("display_present", "Products are displayed or presented", ["customer_showroom"]),
  activity("treat_care", "Patients or clients are treated", ["healthcare_delivery"]),
  activity("make_assemble", "Things are made or assembled", ["assembly", "light_manufacturing", "manufacturing"]),
  activity("repair_service", "Things are repaired or serviced"),
  activity("store", "Inventory, materials, or equipment are stored", ["storage", "inventory_management", "equipment_storage"]),
  activity("receive", "Goods or materials are received", ["receiving"]),
  activity("ship_distribute", "Goods or products are shipped", ["shipping", "distribution"]),
  activity("dispatch", "Employees or technicians are dispatched", ["service_dispatch"]),
  activity("operate_vehicles", "Vehicles operate from the property", ["vehicle_storage"]),
  activity("research_test", "Research or testing occurs", ["research", "product_development"]),
  activity("prepare_produce_food", "Food is prepared or produced", ["food_preparation", "food_production"]),
  activity("teach_train_events", "Training, teaching, or events occur", ["education", "training"]),
  activity("outdoor_operations", "Work happens outdoors"),
]);
export const ACTIVITIES_BY_ID = Object.freeze(Object.fromEntries(ACTIVITY_REGISTRY.map((item) => [item.id, item])));
export const ACTIVITY_CHOICE_GROUPS = Object.freeze(ACTIVITY_REGISTRY.map((item) => Object.freeze({
  id: item.id,
  group: ["work", "meet_collaborate", "host_visitors", "sell_serve", "display_present"].includes(item.id) ? "People and customers" : ["treat_care", "research_test", "prepare_produce_food", "teach_train_events"].includes(item.id) ? "Specialized activities" : "Operations",
  label: item.label,
  activities: [item.id],
})));

export const PROPERTY_TYPE_DEFAULTS = Object.freeze({
  office: ["work", "meet_collaborate"],
  retail_service: ["host_visitors", "sell_serve"],
  medical: ["work", "treat_care"],
  life_science_rd: ["work", "research_test"],
  industrial_flex: [],
  special_purpose: [],
  mixed: [],
  unknown: [],
});

const option = (id, label, value, status = "PREFERRED", extras = {}) => Object.freeze({ id, label, value, status, ...extras });
const question = (definition) => Object.freeze({
  version: 1,
  stage: "PROPERTY",
  dimensions: [],
  applicableActivities: [],
  applicablePropertyContexts: [],
  dependencies: [],
  decisionRelevance: [],
  allowUnknown: false,
  allowOther: false,
  options: [],
  help: "",
  helpMode: "collapsed",
  ...definition,
  satisfiedBy: definition.satisfiedBy || (definition.dimension ? [`dimension:${definition.dimension}`] : []),
});

const region = (id, label) => Object.freeze({ id, label, value: label, status: "PREFERRED" });
export const MARKET_GEOGRAPHY_MODELS = Object.freeze([
  Object.freeze({
    id: "bay_area",
    label: "San Francisco Bay Area",
    match: ["san francisco", "sf", "oakland", "east bay", "bay area", "peninsula", "south bay", "marin"],
    regions: Object.freeze([
      region("san_francisco", "San Francisco"),
      region("east_bay", "East Bay"),
      region("north_bay", "Marin / North Bay"),
      region("peninsula", "Peninsula"),
      region("south_bay", "South Bay"),
      region("mixed", "Across the Bay Area / mixed"),
    ]),
  }),
]);

const officeExceptions = [
  option("none", "No — primarily office work", "No unusual secondary use", "FLEXIBLE", { activities: [] }),
  option("display", "We display products or have a showroom", "Product display or showroom", "PREFERRED", { activities: ["display_present"] }),
  option("store", "We store meaningful inventory or equipment", "Meaningful inventory or equipment storage", "PREFERRED", { activities: ["store"] }),
  option("ship", "We regularly ship or receive products", "Regular shipping or receiving", "PREFERRED", { activities: ["receive", "ship_distribute"] }),
  option("make", "We make, assemble, or repair things", "Making, assembly, or repair", "PREFERRED", { activities: ["make_assemble", "repair_service"] }),
  option("treat", "We treat patients or clients", "Patient or client treatment", "PREFERRED", { activities: ["treat_care"] }),
  option("research", "We do research or lab work", "Research or lab work", "PREFERRED", { activities: ["research_test"] }),
  option("events", "We hold classes, training, or larger events", "Classes, training, or larger events", "PREFERRED", { activities: ["teach_train_events"] }),
  option("vehicles", "We operate vehicles or field teams", "Vehicle or field-team operations", "PREFERRED", { activities: ["dispatch", "operate_vehicles"] }),
];

export const BUSINESS_IDENTITY_TAXONOMY = Object.freeze([
  option("design_creative", "Architecture, Design & Creative Services", "design_creative", "PREFERRED", { environmentPrior: "CREATIVE_DESIGN_ORIENTED" }),
  option("professional_services", "Financial & Professional Services", "professional_services", "PREFERRED", { environmentPrior: "ESTABLISHED_PROFESSIONAL" }),
  option("technology", "Technology & Product Companies", "technology", "PREFERRED", { environmentPrior: "TECHNOLOGY_INNOVATION" }),
  option("life_science", "Life Sciences & Research", "life_science", "PREFERRED", { environmentPrior: "INSTITUTIONAL_HEALTHCARE" }),
  option("nonprofit", "Nonprofit & Mission-Driven Organizations", "nonprofit", "PREFERRED", { environmentPrior: "MISSION_COMMUNITY_ORIENTED" }),
]);

export const RETAIL_BUSINESS_IDENTITY_TAXONOMY = Object.freeze([
  option("boutique_brand", "Boutique, apparel, or consumer brand", "boutique_brand"),
  option("premium_luxury", "Premium or luxury retail", "premium_luxury"),
  option("neighborhood_service", "Neighborhood service business", "neighborhood_service"),
  option("fitness_wellness", "Fitness or wellness studio", "fitness_wellness"),
  option("food_beverage", "Restaurant, cafe, or food concept", "food_beverage", "PREFERRED", { addActivities: ["prepare_produce_food"] }),
  option("showroom_design", "Showroom, home, or design retail", "showroom_design", "PREFERRED", { addActivities: ["display_present"] }),
  option("convenience", "Convenience or daily-needs retail", "convenience"),
  option("destination_experiential", "Destination, specialty, or experiential retail", "destination_experiential"),
]);

const officeEnvironmentChoices = [
  option("established", "Established and professional", "Established and professional"),
  option("creative", "Creative and distinctive", "Creative and distinctive"),
  option("modern", "Modern and energetic", "Modern and energetic"),
  option("neutral", "No strong preference", "No strong preference", "FLEXIBLE"),
];

export const QUESTION_REGISTRY = Object.freeze([
  question({ id: "location.anchor", stage: "ORIENT", prompt: "What city or market are you considering?", answerType: "market_select", priority: 100, resolverId: "location_anchor", satisfiedBy: ["field:locationLogic.marketAnchor.displayName", "dimension:universal.location.anchor"], allowUnknown: true, help: "Start with the main city or market. Rofo can help you compare areas within it.", helpMode: "visible", decisionRelevance: ["location"] }),
  question({ id: "foundation.property_context", stage: "ORIENT", prompt: "What kind of space are you looking for?", answerType: "single", priority: 95, resolverId: "property_context", satisfiedBy: ["field:propertyTypes"], options: [option("office", "Office", "office"), option("industrial_flex", "Industrial / warehouse / flex", "industrial_flex"), option("retail_service", "Retail / service", "retail_service"), option("medical", "Medical", "medical"), option("life_science_rd", "R&D / lab", "life_science_rd"), option("special_purpose", "Special purpose", "special_purpose"), option("unknown", "I’m not sure", "unknown", "UNKNOWN")], decisionRelevance: ["property_fit"] }),
  question({ id: "location.district_candidates", stage: "ORIENT", prompt: "Any specific area already on your list?", answerType: "district_multi", priority: 90, resolverId: "district_candidates", satisfiedBy: [], allowOther: true, help: "Select any that apply. Rofo can still recommend other areas.", helpMode: "visible", decisionRelevance: ["location"] }),
  question({ id: "foundation.objective", stage: "ORIENT", prompt: "What is your goal?", answerType: "single", priority: 80, resolverId: "objective", satisfiedBy: ["field:objective.summary"], options: [option("relocate", "Relocate an existing location", "Relocate the business"), option("new", "Open a new location", "Open a new location"), option("expand", "Add or expand space", "Add or expand space"), option("renew", "Compare renewing with moving", "Evaluate renewal versus relocation")], allowOther: true, decisionRelevance: ["location"] }),

  question({ id: "business.identity", stage: "USE", prompt: "Which category most closely describes your business?", answerType: "single", priority: 110, resolverId: "business_identity", dimension: "universal.business.type", applicablePropertyContexts: ["office"], satisfiedBy: ["dimension:universal.business.type"], options: BUSINESS_IDENTITY_TAXONOMY, allowOther: true, help: "Choose the closest category, or briefly describe the business.", helpMode: "visible", decisionRelevance: ["location"] }),
  question({ id: "retail.business_identity", stage: "USE", prompt: "What kind of customer-facing business is this?", answerType: "single", priority: 110, resolverId: "business_identity", dimension: "universal.business.type", applicablePropertyContexts: ["retail_service"], satisfiedBy: ["dimension:universal.business.type"], options: RETAIL_BUSINESS_IDENTITY_TAXONOMY, allowOther: true, help: "Choose the closest type. This helps Rofo distinguish neighborhood, destination, service, and showroom locations.", helpMode: "visible", decisionRelevance: ["location"] }),
  question({ id: "medical.practice", stage: "USE", prompt: "What kind of medical practice or healthcare use is this?", answerType: "short_text", priority: 110, resolverId: "criterion", dimension: "medical.business.practice_description", applicablePropertyContexts: ["medical"], allowOther: true, help: "For example: dermatology, physical therapy, dental practice, or private medical practice.", helpMode: "visible", decisionRelevance: ["location"] }),
  question({ id: "office.environment_confirmation", stage: "USE", prompt: "What kind of neighborhood and office setting would you prefer?", answerType: "single", priority: 105, resolverId: "criterion", dimension: "office.environment.image", applicablePropertyContexts: ["office"], applicableWhen: "reviewed_office_environment_prior", options: officeEnvironmentChoices, decisionRelevance: ["location"] }),
  question({ id: "office.client_frequency", stage: "USE", prompt: "Do customers or clients regularly come to the office?", answerType: "single", priority: 100, resolverId: "visitor_frequency", applicablePropertyContexts: ["office"], satisfiedBy: ["dimension:office.access.client_visits"], options: [option("regular", "Yes, regularly", "Clients visit regularly", "REQUIRED", { addActivities: ["host_visitors"] }), option("occasional", "Occasionally", "Clients visit occasionally", "PREFERRED", { addActivities: ["host_visitors"] }), option("rare", "Rarely or never", "Client visits are rare or irrelevant", "FLEXIBLE")], allowUnknown: true, decisionRelevance: ["location"] }),
  question({ id: "office.exceptions", stage: "USE", prompt: "Besides office use, does anything else happen in the space?", answerType: "multi", priority: 95, resolverId: "activity_exceptions", applicablePropertyContexts: ["office"], options: officeExceptions, allowOther: true, decisionRelevance: ["location", "property_fit"] }),
  question({ id: "retail.exceptions", stage: "USE", prompt: "Besides serving customers, what else needs to happen at this location?", answerType: "multi", priority: 95, resolverId: "activity_exceptions", applicablePropertyContexts: ["retail_service"], applicableWhen: "retail_differentiators_unknown", options: [option("none", "No unusual secondary activity", "No unusual secondary activity", "FLEXIBLE", { activities: [] }), option("repair", "We repair or service things", "Repair or service", "PREFERRED", { activities: ["repair_service"] }), option("make", "We make or produce things", "Production", "PREFERRED", { activities: ["make_assemble"] }), option("store", "We store significant inventory or equipment", "Significant storage", "PREFERRED", { activities: ["store"] }), option("shipping", "We regularly ship or receive goods", "Shipping or receiving", "PREFERRED", { activities: ["receive", "ship_distribute"] }), option("display", "A showroom or product display matters", "Showroom or display", "PREFERRED", { activities: ["display_present"] }), option("treat", "We treat patients or clients", "Treatment", "PREFERRED", { activities: ["treat_care"] })], allowOther: true, decisionRelevance: ["location", "property_fit"] }),
  question({ id: "industrial.pattern", stage: "USE", prompt: "What will your team actually do in the space?", answerType: "multi", priority: 100, resolverId: "industrial_pattern", applicablePropertyContexts: ["industrial_flex"], satisfiedBy: ["dimension:industrial.operations.primary_activity"], options: [option("storage", "Store inventory or equipment", "Storage or warehouse", "PREFERRED", { activities: ["store"] }), option("distribution", "Receive and ship products", "Shipping or distribution", "PREFERRED", { activities: ["receive", "ship_distribute"] }), option("last_mile", "Run deliveries or last-mile operations", "Last-mile or delivery operations", "PREFERRED", { activities: ["receive", "ship_distribute", "dispatch", "operate_vehicles"] }), option("manufacturing", "Make, assemble, or fabricate", "Assembly, fabrication, or manufacturing", "PREFERRED", { activities: ["make_assemble"] }), option("food", "Prepare or produce food", "Food production", "PREFERRED", { activities: ["prepare_produce_food"] }), option("repair", "Repair or service things", "Repair or service", "PREFERRED", { activities: ["repair_service"] }), option("contractor", "Dispatch field teams or vehicles", "Contractor or field operations", "PREFERRED", { activities: ["dispatch", "operate_vehicles"] }), option("showroom", "Display products or host customers", "Showroom or customer-facing use", "PREFERRED", { activities: ["display_present", "host_visitors"] }), option("office", "Office or team workspace", "Office or team workspace", "PREFERRED", { activities: ["work", "meet_collaborate"] }), option("prototype", "Prototype or do technical work", "Prototyping or technical work", "PREFERRED", { activities: ["make_assemble", "research_test"] })], allowUnknown: true, allowOther: true, help: "Choose everything that applies. This helps Rofo distinguish warehouse, operational, and hybrid Flex needs.", helpMode: "visible", decisionRelevance: ["location", "property_fit"] }),
  question({ id: "industrial.use_mix", stage: "USE", prompt: "Which part of the operation needs the most space?", answerType: "single", priority: 88, resolverId: "criterion", dimension: "industrial.operations.use_mix", applicablePropertyContexts: ["industrial_flex"], applicableWhen: "industrial_hybrid_use", options: [option("office", "Mostly office or team workspace", "Mostly office or team workspace"), option("balanced", "A balanced mix", "Balanced office, customer, and operational mix"), option("operations", "Mostly production, warehouse, or operations", "Mostly production, warehouse, or operations"), option("showroom", "Showroom or customer space leads", "Showroom or customer-facing space leads")], allowUnknown: true, help: "A broad answer is enough—no percentages needed.", helpMode: "visible", decisionRelevance: ["location", "property_fit"] }),
  question({ id: "industrial.customer_priority", stage: "USE", prompt: "How important is the customer-facing part of the space?", answerType: "single", priority: 84, resolverId: "criterion", dimension: "industrial.customer.visit_priority", applicablePropertyContexts: ["industrial_flex"], applicableWhen: "industrial_customer_facing", options: [option("rare", "Rarely used by customers", "Operational only or rare customer visits", "FLEXIBLE"), option("occasional", "Customers visit occasionally", "Occasional customer visits", "PREFERRED"), option("regular", "Customers visit regularly", "Regular customer visits", "PREFERRED"), option("experience", "The showroom or customer experience is important", "Showroom or customer experience is important", "REQUIRED")], allowUnknown: true, decisionRelevance: ["location", "property_fit"] }),
  question({ id: "office.working_pattern", stage: "USE", prompt: "How will the team use the office most of the time?", answerType: "single", priority: 92, resolverId: "criterion", dimension: "office.workplace.meetings_collaboration", applicablePropertyContexts: ["office"], options: [option("collaborative", "Mostly collaborative and team-oriented", "Mostly collaborative and team-oriented"), option("focused", "Mostly private or focused work", "Mostly private or focused work"), option("mixed", "A mix of both", "Mixed collaborative and focused work")], allowUnknown: true, decisionRelevance: ["property_fit"] }),
  question({ id: "medical.secondary", stage: "USE", prompt: "Does anything else happen in the space that could affect the kind of property you need?", answerType: "multi", priority: 90, resolverId: "activity_exceptions", applicablePropertyContexts: ["medical"], options: [option("none", "No unusual secondary activity", "No unusual secondary activity", "FLEXIBLE", { activities: [] }), option("lab", "Lab or testing work", "Lab or testing", "PREFERRED", { activities: ["research_test"] }), option("events", "Classes or group programs", "Classes or group programs", "PREFERRED", { activities: ["teach_train_events"] }), option("storage", "Significant equipment or supply storage", "Significant equipment or supply storage", "PREFERRED", { activities: ["store"] })], allowOther: true, decisionRelevance: ["location", "property_fit"] }),
  question({ id: "research.support", stage: "USE", prompt: "Besides research or testing, what supporting activity matters?", answerType: "multi", priority: 90, resolverId: "activity_exceptions", applicablePropertyContexts: ["life_science_rd"], options: [option("none", "No major secondary activity", "No major secondary activity", "FLEXIBLE", { activities: [] }), option("make", "Prototype or small-scale production", "Prototype or production", "PREFERRED", { activities: ["make_assemble"] }), option("store", "Significant material or equipment storage", "Significant material or equipment storage", "PREFERRED", { activities: ["store"] }), option("ship", "Regular shipping or receiving", "Regular shipping or receiving", "PREFERRED", { activities: ["receive", "ship_distribute"] })], allowOther: true, decisionRelevance: ["location", "property_fit"] }),
  question({ id: "foundation.activities", stage: "USE", prompt: "What primarily happens at this location?", answerType: "activity_multi", priority: 90, resolverId: "activities", applicablePropertyContexts: ["unknown", "mixed", "special_purpose"], satisfiedBy: ["field:activities", "dimension:universal.business.operating_pattern"], allowOther: true, decisionRelevance: ["location", "property_fit"] }),
  question({ id: "property.ambiguity", stage: "USE", prompt: "Some office/flex or mixed-use properties may also fit what you described. Should Rofo keep those possibilities open?", answerType: "single", priority: 70, resolverId: "property_scope", dimension: "universal.property.context_ambiguity", applicableWhen: "property_context_ambiguous", options: [option("stated", "Keep this focused on my stated property type", "Keep stated property context", "REQUIRED"), option("include", "Include compatible possibilities", "Include activity-compatible alternatives", "FLEXIBLE"), option("unknown", "I’m not sure", "Property context remains open", "UNKNOWN")], decisionRelevance: ["location", "property_fit"], help: "Rofo will not change your search scope without your confirmation." }),
  question({ id: "operations.repair_nature", stage: "USE", prompt: "What kind of making, assembly, or repair work happens there?", answerType: "short_text", priority: 65, resolverId: "operating_nature", applicableActivities: ["make_assemble", "repair_service"], applicableWhen: "secondary_activity_detail_open", allowOther: true, decisionRelevance: ["location", "property_fit"] }),
  question({ id: "care.pattern", stage: "USE", prompt: "What does a typical patient or client visit involve?", answerType: "short_text", priority: 65, resolverId: "criterion", dimension: "medical.care.operating_pattern", applicableActivities: ["treat_care"], applicableWhen: "care_pattern_location_relevant", allowOther: true, decisionRelevance: ["location", "property_fit"] }),
  question({ id: "research.intensity", stage: "USE", prompt: "What kind of research or testing happens there?", answerType: "short_text", priority: 65, resolverId: "criterion", dimension: "research.operations.intensity", applicableActivities: ["research_test"], applicableWhen: "secondary_activity_detail_open", allowOther: true, decisionRelevance: ["location", "property_fit"] }),
  question({ id: "food.intensity", stage: "USE", prompt: "What kind of food preparation or production happens there?", answerType: "single", priority: 65, resolverId: "criterion", dimension: "food.operations.intensity", applicableActivities: ["prepare_produce_food"], applicableWhen: "secondary_activity_detail_open", options: [option("light", "Light preparation or assembly", "Light food preparation"), option("cooking", "Regular cooking", "Regular onsite cooking", "REQUIRED"), option("production", "Production or commissary use", "Food production or commissary", "REQUIRED")], allowOther: true, decisionRelevance: ["location", "property_fit"] }),
  question({ id: "outdoor.pattern", stage: "USE", prompt: "What needs to happen outdoors?", answerType: "short_text", priority: 60, resolverId: "criterion", dimension: "special.outdoor.operations", applicableActivities: ["outdoor_operations"], applicableWhen: "secondary_activity_detail_open", allowOther: true, decisionRelevance: ["location", "property_fit"] }),

  question({ id: "employee.origins", stage: "LOCATION", prompt: "Where do most employees commute from?", answerType: "market_regions", choiceSourceId: "market_regions", priority: 100, resolverId: "criterion_list", dimension: "universal.location.employee_origins", applicableWhen: "employee_geography_relevant", allowUnknown: true, allowOther: true, decisionRelevance: ["location"] }),
  question({ id: "access.transit", stage: "LOCATION", prompt: "How important is public transit for your team?", answerType: "single", priority: 90, resolverId: "criterion", dimension: "universal.access.transit_importance", applicableWhen: "transit_relevant", satisfiedBy: ["dimension:universal.access.transit_importance", "dimension:office.access.transit"], options: [option("very", "Very important", "Public transit is very important", "REQUIRED"), option("helpful", "Helpful, but not essential", "Public transit is helpful", "PREFERRED"), option("not", "Not important", "Public transit is not important", "FLEXIBLE")], allowUnknown: true, decisionRelevance: ["location"] }),
  question({ id: "retail.access_transit", stage: "LOCATION", prompt: "How important is public transit for your customers?", answerType: "single", priority: 90, resolverId: "criterion", dimension: "universal.access.transit_importance", applicablePropertyContexts: ["retail_service"], satisfiedBy: ["dimension:universal.access.transit_importance"], options: [option("very", "Very important", "Public transit is very important", "REQUIRED"), option("helpful", "Helpful, but not essential", "Public transit is helpful", "PREFERRED"), option("not", "Not important", "Public transit is not important", "FLEXIBLE")], allowUnknown: true, decisionRelevance: ["location"] }),
  question({ id: "access.parking", stage: "LOCATION", prompt: "How important is it to be in an area where parking is generally easier?", answerType: "single", priority: 85, resolverId: "criterion", dimension: "universal.access.parking_importance", applicableWhen: "parking_relevant", options: [option("very", "Very important", "Convenient parking is very important", "REQUIRED"), option("helpful", "Helpful, but not essential", "Convenient parking is helpful", "PREFERRED"), option("not", "Not important", "Convenient parking is not important", "FLEXIBLE")], allowUnknown: true, decisionRelevance: ["location"] }),
  question({ id: "customer.origins", stage: "LOCATION", prompt: "Where do most clients or customers come from?", answerType: "market_regions", choiceSourceId: "market_regions_with_fly_in", priority: 82, resolverId: "criterion_list", dimension: "universal.location.customer_origins", applicableWhen: "customer_geography_relevant", allowUnknown: true, allowOther: true, decisionRelevance: ["location"] }),
  question({ id: "vehicles.territory", stage: "LOCATION", prompt: "What service territory should this location make easy to reach?", answerType: "short_text", priority: 95, resolverId: "criterion", dimension: "industrial.location.employee_service_geography", applicableActivities: ["dispatch"], allowUnknown: true, decisionRelevance: ["location"] }),
  question({ id: "visitors.pattern", stage: "LOCATION", prompt: "Do customers mostly plan a visit, or notice the business while passing by?", answerType: "single", priority: 80, resolverId: "criterion", dimension: "retail.customer.destination_visibility", applicablePropertyContexts: ["retail_service"], options: [option("destination", "They usually plan the visit", "Primarily destination-driven", "FLEXIBLE"), option("mixed", "A mix of planned and walk-in visits", "Mixed destination and walk-in visits", "PREFERRED"), option("visibility", "Being noticed from the street matters", "Visibility materially supports customer visits", "REQUIRED")], allowUnknown: true, decisionRelevance: ["location"] }),
  question({ id: "retail.storefront_priority", stage: "LOCATION", prompt: "How important is a visible storefront and signage?", answerType: "single", priority: 78, resolverId: "criterion", dimension: "retail.property.storefront_priority", applicablePropertyContexts: ["retail_service"], options: [option("essential", "Essential", "Visible storefront and prominent signage are essential", "REQUIRED"), option("important", "Important", "Visible storefront and signage are important", "PREFERRED"), option("helpful", "Helpful, but not required", "Visible storefront and signage are helpful", "PREFERRED"), option("not", "Not important", "Visible storefront and signage are not important", "FLEXIBLE")], allowUnknown: true, help: "This describes the property requirement; Rofo will verify actual signage rights later.", helpMode: "visible", decisionRelevance: ["property_fit"] }),
  question({ id: "work.peak", stage: "PROPERTY", prompt: "About how many people are onsite at the busiest time?", answerType: "number_or_text", priority: 100, resolverId: "criterion", dimension: "office.occupancy.peak_attendance", applicablePropertyContexts: ["office"], satisfiedBy: ["dimension:office.occupancy.peak_attendance", "field:sizeCapacity.summary"], allowUnknown: true, decisionRelevance: ["property_fit"] }),
  question({ id: "vehicles.count", stage: "SCALE", prompt: "How many vehicles operate from the property now, and about how many might there be later?", answerType: "number_or_text", priority: 95, resolverId: "criterion", dimension: "industrial.site.fleet_storage", applicableActivities: ["operate_vehicles", "dispatch"], applicableWhen: "secondary_activity_detail_open", allowUnknown: true, decisionRelevance: ["location"] }),
  question({ id: "storage.pattern", stage: "SCALE", prompt: "What needs to be stored, and is it a small or major part of the operation?", answerType: "short_text", priority: 85, resolverId: "storage", applicableActivities: ["store"], applicableWhen: "secondary_activity_detail_open", satisfiedBy: ["dimension:industrial.operations.warehouse_storage", "dimension:retail.operations.repair_storage"], allowOther: true, decisionRelevance: ["location"] }),
  question({ id: "logistics.receiving", stage: "SCALE", prompt: "What kinds of vehicles need to deliver, pick up, or operate here?", answerType: "single", priority: 90, resolverId: "logistics", applicableWhen: "logistics_or_vehicle_relevant", satisfiedBy: ["dimension:industrial.access.truck_circulation", "dimension:retail.operations.delivery_receiving"], options: [option("passenger", "Only normal customer or employee vehicles", "Normal passenger vehicles only", "FLEXIBLE"), option("parcel", "Parcels, couriers, or small vans", "Parcel, courier, or small-van deliveries", "PREFERRED"), option("service", "Service vans or fleet vehicles", "Service vans or fleet vehicles", "PREFERRED"), option("box", "Box trucks", "Regular box-truck access", "REQUIRED"), option("semi", "Larger trucks or tractor-trailers", "Large-truck or tractor-trailer access", "REQUIRED"), option("mixed", "A mix of vehicle types", "Mixed delivery and operating vehicles", "REQUIRED")], allowUnknown: true, help: "A vehicle type helps guide the search, but Rofo will verify actual circulation and site capability later.", helpMode: "visible", decisionRelevance: ["location", "property_fit"] }),
  question({ id: "industrial.loading_form", stage: "SCALE", prompt: "How should goods or equipment move into the space?", answerType: "single", priority: 86, resolverId: "criterion", dimension: "industrial.loading.form", applicablePropertyContexts: ["industrial_flex"], applicableWhen: "industrial_loading_relevant", options: [option("none", "No special loading needed", "No special loading requirement", "FLEXIBLE"), option("grade", "Drive-in or ground-level access", "Grade-level or drive-in loading", "REQUIRED"), option("dock", "A raised loading dock", "Dock-high loading", "REQUIRED"), option("either", "Either could work", "Grade-level or dock-high loading", "FLEXIBLE")], allowUnknown: true, help: "Ground-level access lets vehicles or equipment enter near floor level. A loading dock meets the floor of a truck or trailer.", helpMode: "visible", decisionRelevance: ["property_fit"] }),
  question({ id: "retail.delivery_service", stage: "SCALE", prompt: "What kind of deliveries or service access does the business need?", answerType: "single", priority: 84, resolverId: "criterion", dimension: "retail.operations.delivery_receiving", applicablePropertyContexts: ["retail_service"], applicableWhen: "retail_delivery_relevant", options: [option("light", "Light parcels or occasional service", "Light parcel or occasional service deliveries", "FLEXIBLE"), option("regular", "Regular supplier deliveries", "Regular supplier deliveries", "PREFERRED"), option("frequent", "Frequent food or product deliveries", "Frequent food or product deliveries", "REQUIRED"), option("back_of_house", "Significant back-of-house or service access", "Significant back-of-house or service access", "REQUIRED")], allowUnknown: true, decisionRelevance: ["property_fit"] }),
  question({ id: "office.growth_horizon", stage: "SCALE", prompt: "Should meaningful team growth influence the search?", answerType: "single", priority: 72, resolverId: "criterion", dimension: "universal.growth.future_state", applicablePropertyContexts: ["office"], options: [option("stable", "The team should stay relatively stable", "Relatively stable team", "FLEXIBLE"), option("modest", "Some growth is likely", "Modest growth expected", "PREFERRED"), option("significant", "Significant growth is likely", "Significant growth expected", "REQUIRED")], allowUnknown: true, help: "A broad expectation is enough—no workforce forecast needed.", helpMode: "visible", decisionRelevance: ["property_fit"] }),
  question({ id: "capacity.size", stage: "SCALE", prompt: "What approximate size or operating capacity should Rofo keep in mind?", answerType: "short_text", priority: 50, resolverId: "size", applicableWhen: "location_scale_relevant", satisfiedBy: ["field:sizeCapacity.summary", "dimension:universal.capacity.size", "dimension:office.occupancy.peak_attendance", "dimension:industrial.site.fleet_storage", "dimension:special.events.peak"], allowUnknown: true, decisionRelevance: ["location"] }),
  question({ id: "events.peak", stage: "SCALE", prompt: "About how many people may attend at the busiest time?", answerType: "number_or_text", priority: 90, resolverId: "criterion", dimension: "special.events.peak", applicableActivities: ["teach_train_events"], applicableWhen: "secondary_activity_detail_open", allowUnknown: true, decisionRelevance: ["location"] }),

  question({ id: "final.unusual", stage: "FINAL", prompt: "Is there anything else about your business, team, customers, equipment, or operations that could affect where you should locate?", answerType: "final_text", priority: 100, resolverId: "unusual", allowOther: true, options: [option("none", "No, nothing else", "")], help: "For example: unusual hours, trailers, privacy, generators, large products, or outdoor work.", decisionRelevance: ["location"] }),

  // Registered for later progressive enrichment. These never run in the Location-stage prototype.
  question({ id: "transaction.intent", stage: "PROPERTY", prompt: "Are you planning to lease or purchase?", answerType: "single", priority: 100, resolverId: "criterion", dimension: "universal.transaction.intent", options: [option("lease", "Lease", "Lease", "REQUIRED"), option("purchase", "Purchase", "Purchase", "REQUIRED"), option("either", "Either could work", "Lease or purchase", "FLEXIBLE")], allowUnknown: true, decisionRelevance: ["economics"] }),
  question({ id: "economics.budget", stage: "PROPERTY", prompt: "What economic limit should the search respect?", answerType: "short_text", priority: 90, resolverId: "economics", satisfiedBy: ["field:economics.summary", "dimension:universal.economics.budget"], allowUnknown: true, decisionRelevance: ["economics"] }),
  question({ id: "timing.target", stage: "PROPERTY", prompt: "When does the space need to be ready?", answerType: "short_text", priority: 85, resolverId: "timing", satisfiedBy: ["field:timing.summary", "dimension:universal.timing.target"], allowUnknown: true, decisionRelevance: ["timing"] }),
  question({ id: "capacity.basis", stage: "PROPERTY", prompt: "What is the size estimate based on?", answerType: "short_text", priority: 80, resolverId: "criterion", dimension: "universal.capacity.basis", dependencies: ["has_size"], allowUnknown: true, decisionRelevance: ["property_fit"] }),
  question({ id: "capacity.flexibility", stage: "PROPERTY", prompt: "How flexible is the size target?", answerType: "single", priority: 75, resolverId: "criterion", dimension: "universal.capacity.flexibility", dependencies: ["has_size"], options: [option("minimum", "The lower end is a hard minimum", "Hard minimum", "REQUIRED"), option("target", "It is a preferred target", "Preferred target", "PREFERRED"), option("expand", "Smaller could work with expansion", "Smaller with expansion", "FLEXIBLE")], allowUnknown: true, decisionRelevance: ["property_fit"] }),
  question({ id: "operations.technical", stage: "PROPERTY", prompt: "Which technical effects must a property handle?", answerType: "multi", priority: 90, resolverId: "criterion_list", dimension: "universal.operations.technical_screen", applicableActivities: ["make_assemble", "repair_service"], options: [option("power", "Special electrical power", "Special electrical power"), option("exhaust", "Ventilation or exhaust", "Ventilation or exhaust"), option("noise", "Noise or vibration", "Noise or vibration")], allowUnknown: true, allowOther: true, decisionRelevance: ["property_fit", "diligence"] }),
  question({ id: "vehicles.overnight", stage: "PROPERTY", prompt: "Do vehicles stay at the property overnight?", answerType: "single", priority: 85, resolverId: "vehicle_overnight", applicableActivities: ["operate_vehicles"], options: [option("all", "Yes, all", "Secure overnight fleet storage", "REQUIRED"), option("some", "Some", "Overnight storage for part of the fleet", "REQUIRED"), option("none", "No", "No overnight fleet storage", "FLEXIBLE")], allowUnknown: true, decisionRelevance: ["property_fit"] }),
  question({ id: "research.infrastructure", stage: "PROPERTY", prompt: "Which infrastructure needs property verification?", answerType: "multi", priority: 85, resolverId: "external_list", dimension: "research.diligence.infrastructure", applicableActivities: ["research_test"], options: [option("vent", "Ventilation", "Ventilation"), option("utilities", "Special utilities", "Special utilities"), option("vibration", "Vibration control", "Vibration control"), option("waste", "Special waste handling", "Special waste handling")], allowUnknown: true, decisionRelevance: ["diligence"] }),
]);
export const QUESTIONS_BY_ID = Object.freeze(Object.fromEntries(QUESTION_REGISTRY.map((item) => [item.id, item])));

const value = (text = "", number = null, boolean = null, list = []) => ({ text, number, boolean, list });
const setField = (id, target, raw) => ({ operationId: id, type: "SET_FIELD", target, value: Array.isArray(raw) ? value("", null, null, raw) : value(raw), source: "user_statement", confidence: 1, authority: "business", requiresConfirmation: false });
const setBooleanField = (id, target, raw) => ({ operationId: id, type: "SET_FIELD", target, value: value("", null, Boolean(raw)), source: "user_statement", confidence: 1, authority: "business", requiresConfirmation: false });
const criterion = (id, dimension, raw, status = "PREFERRED", options = {}) => ({ operationId: id, type: "UPSERT_CRITERION", target: dimension, value: Array.isArray(raw) ? value("", null, null, raw) : value(raw), status, scope: options.scope || "property", source: options.source || "user_statement", confidence: options.confidence ?? 1, rationale: options.rationale || "Supplied through the deterministic Requirement interview.", authority: options.authority || "business", requiresConfirmation: false });

function selectedOptions(questionDefinition, answer) {
  const ids = Array.isArray(answer && answer.optionIds) ? answer.optionIds : answer && answer.optionId ? [answer.optionId] : [];
  return questionDefinition.options.filter((item) => ids.includes(item.id));
}
function answerValue(questionDefinition, answer) {
  if (answer && answer.unknown) return { raw: "", status: "UNKNOWN", label: "I’m not sure" };
  if (answer && typeof answer.text === "string") return { raw: answer.text.trim(), status: answer.status || "PREFERRED", label: answer.text.trim() };
  const selected = selectedOptions(questionDefinition, answer);
  return { raw: selected.length > 1 ? selected.map((item) => item.value) : (selected[0] && selected[0].value) || "", status: (selected[0] && selected[0].status) || "PREFERRED", label: selected.map((item) => item.label).join(", ") };
}
function appendActivities(requirement, additions = []) {
  return Array.from(new Set([...requirement.activities, ...additions.filter((id) => ACTIVITIES_BY_ID[id])]));
}

const RESOLVERS = Object.freeze({
  business_identity(questionDefinition, answer, state) {
    const selected = selectedOptions(questionDefinition, answer)[0];
    const raw = selected ? [selected.value, selected.label] : String(answer.text || "").trim();
    const operations = selected?.addActivities?.length ? [setField(`${questionDefinition.id}-activities`, "activities", appendActivities(state.requirement, selected.addActivities))] : [];
    return [...operations, criterion(questionDefinition.id, questionDefinition.dimension, raw, selected ? "PREFERRED" : "UNKNOWN", { scope: "business", rationale: selected ? "User selected a bounded Requirement business identity that maps to existing reviewed business-environment intelligence." : "User supplied unresolved business identity text; it is preserved without classification or an environment prior." })];
  },
  activities(questionDefinition, answer, state) { const activities = Array.from(new Set((answer.activityIds || []).filter((id) => ACTIVITIES_BY_ID[id]))); const pattern = activities.length ? activities : String(answer.text || "").trim(); return [setField("activities", "activities", activities), criterion("operating-pattern", "universal.business.operating_pattern", pattern, "REQUIRED", { scope: "business" })]; },
  objective(questionDefinition, answer) { const selected = answerValue(questionDefinition, answer); return [setField("objective", "objective.summary", selected.raw)]; },
  property_context(questionDefinition, answer) { const selected = answerValue(questionDefinition, answer); return [setField("property", "propertyTypes", [selected.raw])]; },
  property_scope(questionDefinition, answer, state) { const selected = answerValue(questionDefinition, answer); const contexts = answer.optionId === "include" ? Array.from(new Set([...state.requirement.propertyTypes, ...deriveCompatiblePropertyContexts(state.requirement)])) : state.requirement.propertyTypes; return [setField("property-scope", "propertyTypes", contexts), criterion(questionDefinition.id, questionDefinition.dimension, selected.raw, selected.status)]; },
  location_anchor(questionDefinition, answer) {
    const selected = answerValue(questionDefinition, answer);
    const market = answer.market || {};
    const displayName = market.displayName || selected.raw;
    return [
      setField("market-display", "locationLogic.marketAnchor.displayName", displayName),
      setField("market-geography-id", "locationLogic.marketAnchor.geographyId", market.geographyId || ""),
      setField("market-id", "locationLogic.marketAnchor.marketId", market.marketId || ""),
      setField("market-name", "locationLogic.marketAnchor.marketName", market.marketName || displayName),
      setField("market-city", "locationLogic.marketAnchor.city", market.city || ""),
      setField("market-state", "locationLogic.marketAnchor.state", market.state || ""),
      setField("market-source", "locationLogic.marketAnchor.source", market.marketId ? "canonical_commercial_geography" : "user_freeform"),
      setField("locations", "locationLogic.locations", displayName ? [displayName] : []),
      criterion("location-anchor", "universal.location.anchor", displayName, selected.status, { scope: "location" }),
    ];
  },
  district_candidates(questionDefinition, answer) {
    const selectedIds = answer.noPreference ? [] : Array.from(new Set(answer.districtIds || []));
    const selectedDistricts = questionDefinition.options.filter((item) => selectedIds.includes(item.id));
    const names = selectedDistricts.map((item) => item.label);
    const informalText = answer.noPreference ? "" : String(answer.otherText || "");
    const hasPreference = Boolean(names.length || informalText.trim());
    const criterionValue = hasPreference ? [...names, ...(informalText ? [informalText] : [])] : ["None — open to Rofo recommendations"];
    return [
      setBooleanField("district-preference-exists", "locationLogic.specificPreference.hasPreference", hasPreference),
      setField("candidate-district-ids", "locationLogic.specificPreference.candidateDistrictIds", selectedDistricts.map((item) => item.districtId)),
      setField("candidate-district-names", "locationLogic.specificPreference.candidateDistrictNames", names),
      setField("informal-location-preference", "locationLogic.specificPreference.informalText", informalText),
      setField("legacy-preference-name", "locationLogic.specificPreference.displayName", ""),
      setField("legacy-preference-geography", "locationLogic.specificPreference.geographyId", ""),
      setField("specific-preference-source", "locationLogic.specificPreference.source", names.length ? "canonical_district_selection" : informalText ? "user_freeform" : "user_statement"),
      criterion("specific-preference", "universal.location.specific_preference", criterionValue, hasPreference ? "PREFERRED" : "FLEXIBLE", { scope: "location" }),
    ];
  },
  visitor_frequency(questionDefinition, answer, state) { const selected = answerValue(questionDefinition, answer); const additions = selectedOptions(questionDefinition, answer).flatMap((item) => item.addActivities || []); return [setField("visitor-activities", "activities", appendActivities(state.requirement, additions)), criterion(questionDefinition.id, "office.access.client_visits", selected.raw, selected.status, { scope: "location" })]; },
  activity_exceptions(questionDefinition, answer, state) { const selected = selectedOptions(questionDefinition, answer); const additions = selected.flatMap((item) => item.activities || []); const raw = answer.text || selected.map((item) => item.value).filter(Boolean); return [setField("exception-activities", "activities", appendActivities(state.requirement, additions)), criterion(questionDefinition.id, "universal.business.operating_pattern", raw, selected[0] && selected[0].status || "PREFERRED", { scope: "business" })]; },
  industrial_pattern(questionDefinition, answer, state) { const selected = selectedOptions(questionDefinition, answer); const additions = selected.flatMap((item) => item.activities || []); const raw = answer.text || selected.map((item) => item.value).filter(Boolean); return [setField("industrial-activities", "activities", appendActivities(state.requirement, additions)), criterion(questionDefinition.id, "industrial.operations.primary_activity", raw, "REQUIRED", { scope: "business" })]; },
  size(questionDefinition, answer) { const selected = answerValue(questionDefinition, answer); return [setField("size", "sizeCapacity.summary", selected.raw), criterion("size", "universal.capacity.size", selected.raw, selected.status)]; },
  economics(questionDefinition, answer) { const selected = answerValue(questionDefinition, answer); return [setField("economics", "economics.summary", selected.raw), criterion("budget", "universal.economics.budget", selected.raw, selected.status, { scope: "economics" })]; },
  timing(questionDefinition, answer) { const selected = answerValue(questionDefinition, answer); return [setField("timing", "timing.summary", selected.raw), criterion("timing", "universal.timing.target", selected.raw, selected.status, { scope: "timing" })]; },
  criterion(questionDefinition, answer) { const selected = answerValue(questionDefinition, answer); return [criterion(questionDefinition.id, questionDefinition.dimension, selected.raw, selected.status, { scope: questionDefinition.decisionRelevance.includes("location") ? "location" : "property" })]; },
  criterion_list(questionDefinition, answer) { const selected = answerValue(questionDefinition, answer); return [criterion(questionDefinition.id, questionDefinition.dimension, selected.raw, selected.status, { scope: questionDefinition.decisionRelevance.includes("location") ? "location" : "property" })]; },
  operating_nature(questionDefinition, answer) { const selected = answerValue(questionDefinition, answer); return [criterion(questionDefinition.id, "industrial.operations.repair_production", selected.raw, "REQUIRED", { scope: "business" })]; },
  storage(questionDefinition, answer) { const selected = answerValue(questionDefinition, answer); return [criterion(questionDefinition.id, "industrial.operations.warehouse_storage", selected.raw, selected.status)]; },
  logistics(questionDefinition, answer, state) { const selected = answerValue(questionDefinition, answer); const dim = state.requirement.propertyTypes.includes("industrial_flex") ? "industrial.access.truck_circulation" : "retail.operations.delivery_receiving"; return [criterion(questionDefinition.id, dim, selected.raw, selected.status)]; },
  vehicle_overnight(questionDefinition, answer) { const selected = answerValue(questionDefinition, answer); return [criterion(questionDefinition.id, "industrial.site.fleet_storage", selected.raw, selected.status)]; },
  external_list(questionDefinition, answer) { const selected = answerValue(questionDefinition, answer); return [criterion(questionDefinition.id, questionDefinition.dimension, selected.raw, selected.status === "UNKNOWN" ? "UNKNOWN" : "VERIFY", { scope: "diligence", authority: "external_property" })]; },
  unusual(questionDefinition, answer, state) { const selected = answerValue(questionDefinition, answer); const existing = state.requirement.businessContext.summary; const combined = selected.raw ? [existing, `Additional location considerations: ${selected.raw}`].filter(Boolean).join("\n") : existing; return selected.raw ? [setField("unusual", "businessContext.summary", combined)] : []; },
});

function withPropertyDefaults(requirementInput) {
  const requirement = normalizeRequirement(requirementInput);
  const defaults = requirement.propertyTypes.flatMap((type) => PROPERTY_TYPE_DEFAULTS[type] || []);
  requirement.activities = appendActivities(requirement, defaults);
  requirement.readiness = evaluateReadiness(requirement, []);
  return requirement;
}

export function deriveCompatiblePropertyContexts(requirementInput) {
  const requirement = normalizeRequirement(requirementInput);
  const activities = new Set(requirement.activities);
  const contexts = new Set();
  const industrial = ["make_assemble", "repair_service", "store", "receive", "ship_distribute", "dispatch", "operate_vehicles", "outdoor_operations"].some((id) => activities.has(id));
  const customerCommercial = ["sell_serve", "display_present"].some((id) => activities.has(id));
  if (["work", "meet_collaborate"].some((id) => activities.has(id)) && !industrial && !customerCommercial && !activities.has("treat_care") && !activities.has("research_test")) contexts.add("office");
  if (customerCommercial || (activities.has("host_visitors") && !activities.has("work") && !industrial && !activities.has("treat_care"))) contexts.add("retail_service");
  if (industrial) contexts.add("industrial_flex");
  if (activities.has("treat_care")) contexts.add("medical");
  if (activities.has("research_test")) contexts.add("life_science_rd");
  if (["prepare_produce_food", "teach_train_events"].some((id) => activities.has(id))) contexts.add("special_purpose");
  return [...contexts];
}

export function resolveMarketGeography(requirementInput) {
  const requirement = normalizeRequirement(requirementInput);
  const haystack = (requirement.locationLogic.marketAnchor.displayName || requirement.locationLogic.locations.join(" ")).toLowerCase();
  return MARKET_GEOGRAPHY_MODELS.find((model) => model.match.some((token) => haystack === token || haystack.includes(token))) || null;
}

const SUPPORTED_ENVIRONMENT_PRIOR_IDENTITIES = new Set(BUSINESS_IDENTITY_TAXONOMY.map((item) => item.value));
const EXTRAORDINARY_OFFICE_SCALE_ACTIVITIES = new Set(["display_present", "treat_care", "make_assemble", "repair_service", "store", "receive", "ship_distribute", "dispatch", "operate_vehicles", "research_test", "prepare_produce_food", "teach_train_events", "outdoor_operations"]);
const businessIdentityValue = (state) => {
  const value = state.requirement.criteria.find((item) => item.dimension === "universal.business.type")?.value || {};
  return value.list?.[0] || value.text || "";
};
const ordinaryOfficeLocation = (state) => state.requirement.propertyTypes.length === 1 && state.requirement.propertyTypes.includes("office") && !state.requirement.activities.some((id) => EXTRAORDINARY_OFFICE_SCALE_ACTIVITIES.has(id));
const ordinaryMedicalLocation = (state) => state.requirement.propertyTypes.length === 1 && state.requirement.propertyTypes.includes("medical");
const propertyContextResolution = (state) => state.requirement.criteria.find((item) => item.dimension === "universal.property.context_ambiguity" && item.status !== "UNKNOWN") || null;
const propertyContextKeptAsStated = (state) => /keep stated property context/i.test(propertyContextResolution(state)?.value?.text || "");
const hasAnyActivity = (state, ids) => ids.some((id) => state.requirement.activities.includes(id));
const INDUSTRIAL_OPERATION_ACTIVITIES = ["store", "receive", "ship_distribute", "dispatch", "operate_vehicles", "repair_service", "make_assemble", "prepare_produce_food"];
const FLEX_FACING_ACTIVITIES = ["work", "meet_collaborate", "host_visitors", "display_present", "research_test"];

const PREDICATES = Object.freeze({
  has_size: (state) => Boolean(state.requirement.sizeCapacity.summary || state.requirement.criteria.some((item) => item.dimension === "universal.capacity.size")),
  location_scale_relevant: (state) => !propertyContextKeptAsStated(state) && !ordinaryOfficeLocation(state) && !ordinaryMedicalLocation(state),
  secondary_activity_detail_open: (state) => !propertyContextResolution(state),
  care_pattern_location_relevant: (state) => !ordinaryMedicalLocation(state) && !propertyContextResolution(state),
  reviewed_office_environment_prior: (state) => state.requirement.propertyTypes.includes("office") && (state.requirement.locationLogic.marketAnchor.marketId === "san-francisco" || state.requirement.locationLogic.marketAnchor.geographyId === "san-francisco") && SUPPORTED_ENVIRONMENT_PRIOR_IDENTITIES.has(businessIdentityValue(state)),
  property_context_ambiguous: (state) => { const stated = state.requirement.propertyTypes; if (!stated.length || stated.includes("unknown") || stated.includes("mixed")) return false; return deriveCompatiblePropertyContexts(state.requirement).some((item) => !stated.includes(item)); },
  employee_geography_relevant: (state) => state.requirement.propertyTypes.some((type) => ["office", "medical", "life_science_rd"].includes(type)),
  transit_relevant: (state) => state.requirement.propertyTypes.some((type) => ["office", "medical"].includes(type)),
  parking_relevant: (state) => state.requirement.propertyTypes.some((type) => ["office", "retail_service", "medical", "special_purpose"].includes(type)),
  customer_geography_relevant: (state) => state.requirement.propertyTypes.includes("medical") || (state.requirement.activities.includes("host_visitors") && (state.requirement.criteria.some((item) => item.dimension === "office.access.client_visits" && !/rare|never|irrelevant/i.test(item.value.text)) || state.requirement.propertyTypes.includes("retail_service"))),
  retail_differentiators_unknown: (state) => !state.requirement.activities.some((id) => !PROPERTY_TYPE_DEFAULTS.retail_service.includes(id)),
  industrial_hybrid_use: (state) => state.requirement.propertyTypes.includes("industrial_flex") && hasAnyActivity(state, INDUSTRIAL_OPERATION_ACTIVITIES) && hasAnyActivity(state, FLEX_FACING_ACTIVITIES),
  industrial_customer_facing: (state) => state.requirement.propertyTypes.includes("industrial_flex") && hasAnyActivity(state, ["host_visitors", "display_present"]),
  logistics_or_vehicle_relevant: (state) => state.requirement.propertyTypes.includes("industrial_flex") && hasAnyActivity(state, ["receive", "ship_distribute", "dispatch", "operate_vehicles"]),
  industrial_loading_relevant: (state) => state.requirement.propertyTypes.includes("industrial_flex") && hasAnyActivity(state, ["store", "receive", "ship_distribute", "make_assemble", "prepare_produce_food"]),
  retail_delivery_relevant: (state) => state.requirement.propertyTypes.includes("retail_service") && hasAnyActivity(state, ["receive", "ship_distribute", "prepare_produce_food", "store"]),
});

export function createInterviewState(options = {}) {
  return {
    engineVersion: INTERVIEW_ENGINE_VERSION,
    questionRegistryVersion: QUESTION_REGISTRY_VERSION,
    activityRegistryVersion: ACTIVITY_REGISTRY_VERSION,
    requirement: withPropertyDefaults(options.requirement || createEmptyRequirement({ scenarioId: options.scenarioId || "" })),
    answers: {},
    history: [],
    deferredQuestionIds: [],
    finalQuestionOffered: false,
    targetReadiness: options.targetReadiness || "READY_FOR_LOCATION",
    scenarioId: options.scenarioId || "",
    lastSelection: null,
    districtGeography: options.districtGeography || { markets: {} },
  };
}

function hasSatisfiedBy(requirement, token) {
  if (token.startsWith("dimension:")) return requirement.criteria.some((item) => item.dimension === token.slice(10));
  const field = token.slice(6).split(".");
  let current = requirement;
  field.forEach((part) => { current = current && current[part]; });
  return Array.isArray(current) ? current.length > 0 : Boolean(current);
}

export function isQuestionApplicable(stateInput, questionDefinition) {
  const state = stateInput.requirement ? stateInput : hydrateInterviewState(stateInput);
  if (state.answers[questionDefinition.id] || state.deferredQuestionIds.includes(questionDefinition.id)) return false;
  if (questionDefinition.satisfiedBy && questionDefinition.satisfiedBy.some((token) => hasSatisfiedBy(state.requirement, token))) return false;
  if (questionDefinition.applicableActivities.length && !questionDefinition.applicableActivities.some((id) => state.requirement.activities.includes(id))) return false;
  if (questionDefinition.applicablePropertyContexts.length && !questionDefinition.applicablePropertyContexts.some((id) => state.requirement.propertyTypes.includes(id))) return false;
  if (questionDefinition.dependencies.some((id) => !PREDICATES[id] || !PREDICATES[id](state))) return false;
  if (questionDefinition.applicableWhen && (!PREDICATES[questionDefinition.applicableWhen] || !PREDICATES[questionDefinition.applicableWhen](state))) return false;
  return true;
}

function resolveQuestionForState(questionDefinition, state) {
  if (questionDefinition.id === "location.district_candidates") {
    const market = state.requirement.locationLogic.marketAnchor;
    const districts = (state.districtGeography && state.districtGeography.markets && state.districtGeography.markets[market.marketId]) || [];
    const options = districts.map((district) => ({ id: district.districtId, label: district.name, value: district.name, status: "PREFERRED", districtId: district.districtId, marketId: district.marketId, initiallyVisible: Boolean(district.initiallyVisible) }));
    return {
      ...questionDefinition,
      prompt: options.length ? `Any parts of ${market.marketName || market.displayName} already on your list?` : "Any specific area already on your list?",
      options,
      canonicalDistrictsAvailable: Boolean(options.length),
      showAllLabel: `Show all ${market.marketName || market.displayName} areas`,
      seededDistrictIds: state.requirement.locationLogic.specificPreference.candidateDistrictIds,
      seededInformalText: state.requirement.locationLogic.specificPreference.informalText,
    };
  }
  if (questionDefinition.id === "property.ambiguity" && state.requirement.propertyTypes.includes("office") && deriveCompatiblePropertyContexts(state.requirement).includes("industrial_flex")) {
    return {
      ...questionDefinition,
      prompt: "Should Rofo also consider office/flex spaces that may better accommodate this activity?",
      options: [
        option("include", "Yes — include office/flex", "Include activity-compatible alternatives", "FLEXIBLE"),
        option("stated", "No — keep it to Office", "Keep stated property context", "REQUIRED"),
        option("unknown", "I’m not sure", "Property context remains open", "UNKNOWN"),
      ],
    };
  }
  if (questionDefinition.id === "capacity.size") {
    const type = state.requirement.propertyTypes.find((item) => item !== "office") || state.requirement.propertyTypes[0];
    const examples = { industrial_flex: "For example: 20,000 sq ft.", retail_service: "For example: 3,000 sq ft.", medical: "For example: 5,000 sq ft.", life_science_rd: "For example: 10,000 sq ft.", special_purpose: "Use the most useful unit, such as square feet or people served.", office: "For example: 3,000 sq ft." };
    return { ...questionDefinition, prompt: "About how much space do you need?", help: examples[type] || "Give a rough square-foot estimate if you know it.", helpMode: "visible", placeholder: examples[type] || "For example: 5,000 sq ft." };
  }
  if (!questionDefinition.choiceSourceId) return questionDefinition;
  const model = resolveMarketGeography(state.requirement);
  if (!model) return { ...questionDefinition, answerType: "short_text", options: [], marketModelId: "fallback_freeform" };
  const options = [...model.regions];
  if (questionDefinition.choiceSourceId === "market_regions_with_fly_in") options.push(region("fly_in", "Outside the Bay Area / often fly in"));
  return { ...questionDefinition, answerType: "multi", options, marketModelId: model.id };
}

export function eligibleQuestions(stateInput, options = {}) {
  const state = hydrateInterviewState(stateInput);
  const includeProperty = options.includeProperty || state.targetReadiness === "READY_FOR_PROPERTY_SEARCH";
  return QUESTION_REGISTRY
    .filter((item) => (includeProperty || item.stage !== "PROPERTY") && isQuestionApplicable(state, item))
    .map((item) => resolveQuestionForState(item, state));
}

export function selectNextQuestion(stateInput) {
  const state = hydrateInterviewState(stateInput);
  const eligible = eligibleQuestions(state);
  const ordered = eligible.sort((a, b) => STAGE_BY_ID[a.stage].order - STAGE_BY_ID[b.stage].order || b.priority - a.priority || a.id.localeCompare(b.id));
  const selected = ordered[0] || null;
  const readiness = evaluateReadiness(state.requirement, []);
  if (selected) {
    const reachesRecommendations = selected.id === "final.unusual" && ordered.length === 1;
    return { action: "ASK", question: selected, eligible: ordered, readiness, stage: selected.stage, submitLabel: reachesRecommendations ? "Show recommended locations" : "Continue", reachesLocationRecommendations: reachesRecommendations, reason: "EARLIEST_APPLICABLE_STAGE" };
  }
  return { action: "READY", question: null, eligible: [], readiness, stage: "COMPLETE", reason: readiness.readyForLocation.ready ? "READY_FOR_LOCATION" : "LOCATION_REQUIREMENT_CAPTURED_WITH_UNKNOWNS" };
}

export function applyInterviewAnswer(stateInput, questionId, answerInput = {}) {
  const state = hydrateInterviewState(stateInput);
  const baseQuestion = QUESTIONS_BY_ID[questionId];
  if (!baseQuestion) throw new Error(`Unknown question: ${questionId}`);
  const questionDefinition = resolveQuestionForState(baseQuestion, state);
  if (!isQuestionApplicable(state, baseQuestion)) throw new Error(`Question is not applicable: ${questionId}`);
  const answer = { ...answerInput };
  if (answer.unknown && !questionDefinition.allowUnknown) throw new Error(`Question does not allow Unknown: ${questionId}`);
  const resolver = RESOLVERS[questionDefinition.resolverId];
  if (!resolver) throw new Error(`Unknown resolver: ${questionDefinition.resolverId}`);
  const operations = resolver(questionDefinition, answer, state);
  const merged = applyModelTurn(state.requirement, { proposedOperations: operations });
  if (merged.rejectedOperations.length || merged.pendingInferences.length) throw new Error(`Deterministic answer produced an invalid operation for ${questionId}`);
  const next = {
    ...state,
    requirement: withPropertyDefaults(merged.requirement),
    answers: { ...state.answers, [questionId]: { answer, operations, answeredAt: new Date().toISOString(), questionVersion: questionDefinition.version } },
    history: [...state.history, questionId],
    finalQuestionOffered: state.finalQuestionOffered || questionId === "final.unusual",
  };
  next.requirement.provenance.promptVersion = QUESTION_REGISTRY_VERSION;
  next.lastSelection = selectNextQuestion(next);
  return next;
}

export function backInterview(stateInput) {
  const state = hydrateInterviewState(stateInput);
  if (!state.history.length) return state;
  const history = state.history.slice(0, -1);
  const answers = Object.fromEntries(history.map((id) => [id, state.answers[id]]).filter((entry) => entry[1]));
  let rebuilt = createInterviewState({ scenarioId: state.scenarioId, targetReadiness: state.targetReadiness, requirement: state.seedRequirement || createEmptyRequirement({ scenarioId: state.scenarioId }), districtGeography: state.districtGeography });
  rebuilt.seedRequirement = state.seedRequirement;
  for (const id of history) rebuilt = applyInterviewAnswer(rebuilt, id, answers[id].answer);
  return rebuilt;
}

export function hydrateInterviewState(input = {}) {
  const base = createInterviewState({ requirement: input.requirement, scenarioId: input.scenarioId, targetReadiness: input.targetReadiness, districtGeography: input.districtGeography });
  return { ...base, ...input, requirement: withPropertyDefaults(input.requirement || base.requirement), districtGeography: input.districtGeography || base.districtGeography, answers: input.answers && typeof input.answers === "object" ? input.answers : {}, history: Array.isArray(input.history) ? input.history.filter((id) => QUESTIONS_BY_ID[id]) : [], deferredQuestionIds: Array.isArray(input.deferredQuestionIds) ? input.deferredQuestionIds.filter((id) => QUESTIONS_BY_ID[id]) : [] };
}

export function createSeededInterview(seed = {}) {
  const empty = createEmptyRequirement({ scenarioId: seed.id || "" });
  const requirement = withPropertyDefaults({ ...empty, ...seed.requirement, provenance: { ...empty.provenance, ...(seed.requirement && seed.requirement.provenance), scenarioId: seed.id || "" } });
  const state = createInterviewState({ scenarioId: seed.id || "", requirement, targetReadiness: "READY_FOR_LOCATION", districtGeography: seed.districtGeography });
  state.seedRequirement = requirement;
  state.lastSelection = selectNextQuestion(state);
  return state;
}

export function interviewDebug(stateInput) {
  const state = hydrateInterviewState(stateInput);
  const selection = selectNextQuestion(state);
  const propertyDeferred = QUESTION_REGISTRY.filter((item) => item.stage === "PROPERTY" && isQuestionApplicable(state, item)).map((item) => item.id);
  return {
    engineVersion: state.engineVersion,
    activityRegistryVersion: state.activityRegistryVersion,
    questionRegistryVersion: state.questionRegistryVersion,
    targetReadiness: state.targetReadiness,
    currentStage: selection.stage,
    marketGeographyModel: resolveMarketGeography(state.requirement)?.id || "fallback_freeform",
    locationDrivers: {
      market: state.requirement.locationLogic.marketAnchor,
      candidateDistricts: state.requirement.locationLogic.specificPreference.candidateDistrictNames,
      informalLocationPreference: state.requirement.locationLogic.specificPreference.informalText || null,
      employeeOrigins: state.requirement.criteria.find((item) => item.dimension === "universal.location.employee_origins")?.value || null,
      clientOrigins: state.requirement.criteria.find((item) => item.dimension === "universal.location.customer_origins")?.value || null,
      transit: state.requirement.criteria.find((item) => item.dimension === "universal.access.transit_importance")?.value || null,
      parking: state.requirement.criteria.find((item) => item.dimension === "universal.access.parking_importance")?.value || null,
      serviceTerritory: state.requirement.criteria.find((item) => item.dimension === "industrial.location.employee_service_geography")?.value || null,
    },
    selectedQuestion: selection.question && { id: selection.question.id, version: selection.question.version, stage: selection.question.stage, priority: selection.question.priority, dependencies: selection.question.dependencies },
    eligible: selection.eligible.map((item) => ({ id: item.id, stage: item.stage, priority: item.priority })),
    answered: state.history.map((id) => ({ id, operations: state.answers[id] && state.answers[id].operations })),
    deferredPropertyQuestions: propertyDeferred,
    readiness: selection.readiness,
    provenance: state.requirement.provenance,
    requirement: state.requirement,
  };
}
