(function (root, factory) {
  const value = factory();
  if (typeof module === "object" && module.exports) module.exports = value;
  else root.RofoRequirementPrototypeScenarios = value;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const criterion = (dimension, value, status = "PREFERRED", scope = "property", authority = "business") => ({
    id: `criterion_${dimension.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase()}`,
    dimension,
    value: { text: value, number: null, boolean: null, list: [] },
    status,
    scope,
    source: "user_statement",
    confidence: 1,
    rationale: "Provided in the scenario's known starting information.",
    authority,
    requiresConfirmation: false,
    confirmed: true,
  });

  return [
    {
      id: "usa-shoe-company",
      label: "USA Shoe Company",
      requirement: {
        title: "USA Shoe Company — Orlando acquisition Requirement",
        businessContext: { summary: "Shoe repair and personal-service business with customer-facing, repair, storage, and receiving activity." },
        objective: { summary: "Purchase a property for the operating business" },
        propertyTypes: ["retail_service"],
        activities: ["work", "host_visitors", "sell_serve", "repair_service", "store", "receive"],
        locationLogic: {
          summary: "",
          locations: ["Orlando, FL"],
          rationale: [],
          marketAnchor: { geographyId: "", marketId: "", displayName: "Orlando, FL", marketName: "Orlando", city: "Orlando", state: "FL", source: "user_freeform" },
          specificPreference: { hasPreference: true, displayName: "", geographyId: "", rationale: "", source: "user_freeform", candidateDistrictIds: [], candidateDistrictNames: [], informalText: "Lee Road, Edgewater, College Park, or East Colonial" },
        },
        sizeCapacity: { summary: "8,000–12,000 SF preferred; a smaller property may work if credible expansion is possible." },
        economics: { summary: "Purchase budget no more than $1.2M; seller flexibility matters." },
        timing: { summary: "As soon as possible" },
        growth: { summary: "Expansion matters; a smaller initial property is possible only with a credible expansion path." },
        criteria: [
          criterion("universal.transaction.intent", "Purchase", "REQUIRED", "economics"),
          criterion("universal.capacity.size", "8,000–12,000 SF preferred", "PREFERRED"),
          criterion("universal.capacity.flexibility", "Smaller may work with credible expansion", "FLEXIBLE"),
          criterion("universal.economics.budget", "No more than $1.2M", "REQUIRED", "economics"),
          criterion("retail.operations.repair_storage", "Customer-facing shoe repair with storage", "REQUIRED", "business"),
          criterion("universal.diligence.permitted_use", "Verify shoe-repair/personal-service use at each property", "VERIFY", "diligence", "external_property"),
        ],
      },
    },
    {
      id: "northstar-advisory",
      label: "Northstar Advisory",
      requirement: {
        title: "Northstar Advisory — San Francisco office Requirement",
        businessContext: { summary: "45-person professional-services company; clients visit frequently; recruiting and culture matter." },
        objective: { summary: "Relocate the San Francisco office before the current lease expires" },
        propertyTypes: ["office"],
        activities: ["work", "meet_collaborate", "host_visitors"],
        locationLogic: {
          summary: "Employee geography, client access, recruiting, and culture matter.",
          locations: ["San Francisco, CA"],
          rationale: ["Employee and client access"],
          marketAnchor: { geographyId: "san-francisco", marketId: "san-francisco", displayName: "San Francisco, CA", marketName: "San Francisco", city: "San Francisco", state: "CA", source: "canonical_commercial_geography" },
          specificPreference: { hasPreference: true, displayName: "", geographyId: "", rationale: "Employee and client access", source: "user_statement", candidateDistrictIds: [], candidateDistrictNames: [], informalText: "Downtown San Francisco / BART-accessible locations" },
        },
        sizeCapacity: { summary: "About 10,000 SF initial estimate; 35–40 people onsite at peak." },
        economics: { summary: "Not yet defined" },
        timing: { summary: "Current lease expires in 14 months" },
        growth: { summary: "Headcount expected to grow from 45 to 55–60." },
        criteria: [
          criterion("office.occupancy.peak_attendance", "35–40 people", "REQUIRED"),
          criterion("office.access.client_visits", "Clients visit frequently", "REQUIRED", "location"),
          criterion("office.access.transit", "Strong BART access", "PREFERRED", "location"),
          criterion("universal.timing.current_lease", "Lease expires in 14 months", "REQUIRED", "timing"),
          criterion("universal.growth.future_state", "Grow to 55–60 people", "REQUIRED"),
        ],
      },
    },
    {
      id: "bayline-equipment-services",
      label: "Bayline Equipment Services",
      requirement: {
        title: "Bayline Equipment Services — East Bay industrial/flex Requirement",
        businessContext: { summary: "32-person HVAC and refrigeration service business with dispatch, fleet, storage, repair, and receiving operations." },
        objective: { summary: "Relocate before the current lease expires" },
        propertyTypes: ["industrial_flex"],
        activities: ["work", "dispatch", "operate_vehicles", "store", "receive", "repair_service", "outdoor_operations"],
        locationLogic: {
          summary: "Employee access and service geography matter.",
          locations: ["East Bay, CA"],
          rationale: ["Employee and service territory access"],
          marketAnchor: { geographyId: "east-bay", marketId: "east-bay", displayName: "East Bay, CA", marketName: "East Bay", city: "", state: "CA", source: "canonical_commercial_geography" },
          specificPreference: { hasPreference: false, displayName: "", geographyId: "", rationale: "", source: "user_statement", candidateDistrictIds: [], candidateDistrictNames: [], informalText: "" },
        },
        sizeCapacity: { summary: "Initial estimate around 15,000 SF." },
        economics: { summary: "Not yet defined" },
        timing: { summary: "Current lease expires in 11 months" },
        growth: { summary: "Fleet expected to grow from 14 vans toward 20." },
        criteria: [
          criterion("industrial.site.fleet_storage", "Secure storage for 14 vans, growing toward 20", "REQUIRED"),
          criterion("industrial.operations.warehouse_storage", "Warehouse and storage", "REQUIRED"),
          criterion("industrial.operations.repair_production", "Repair work occurs onsite", "REQUIRED", "business"),
          criterion("industrial.loading.grade_level", "Grade-level loading", "REQUIRED"),
          criterion("industrial.access.truck_circulation", "Occasional semi access", "REQUIRED"),
          criterion("industrial.power.three_phase", "Three-phase power", "REQUIRED"),
          criterion("industrial.power.exact_capacity", "", "UNKNOWN", "diligence", "external_property"),
          criterion("universal.timing.current_lease", "Lease expires in 11 months", "REQUIRED", "timing"),
        ],
      },
    },
  ];
});
