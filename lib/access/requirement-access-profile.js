(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./access-intelligence-schema"));
  else root.RofoRequirementAccessProfile = factory(root.RofoAccessIntelligenceSchema);
})(typeof self !== "undefined" ? self : this, function (schema) {
  "use strict";

  const ADAPTER_VERSION = "requirement-access-profile-adapter:v0";

  function criterion(requirement, dimension) { return (requirement.criteria || []).find((item) => item.dimension === dimension); }
  function value(item) {
    if (!item || !item.value) return [];
    if (Array.isArray(item.value.list) && item.value.list.length) return item.value.list.map(String);
    return item.value.text ? [String(item.value.text)] : [];
  }
  function importance(item) {
    const text = value(item).join(" ").toLowerCase();
    if (!text || item && item.status === "UNKNOWN") return "UNKNOWN";
    if (/very important|essential|required/.test(text)) return "CORE";
    if (/helpful|preferred|somewhat/.test(text)) return "MATERIAL";
    if (/not important|irrelevant/.test(text)) return "LOW";
    return item && item.status === "REQUIRED" ? "CORE" : item && item.status === "PREFERRED" ? "MATERIAL" : "CONSIDER";
  }
  function clientFrequency(item) {
    const text = value(item).join(" ").toLowerCase();
    if (!text || item && item.status === "UNKNOWN") return { frequency: "UNKNOWN", importance: "UNKNOWN" };
    if (/frequent|regular/.test(text)) return { frequency: "FREQUENT", importance: "MATERIAL" };
    if (/occasional|sometimes/.test(text)) return { frequency: "OCCASIONAL", importance: "CONSIDER" };
    if (/rare|never|irrelevant/.test(text)) return { frequency: "RARE", importance: "LOW" };
    return { frequency: "UNKNOWN", importance: "UNKNOWN" };
  }
  function originIds(rawValues, foundation) {
    const resolved = [];
    const unresolved = [];
    rawValues.forEach((raw) => {
      const text = String(raw || "").toLowerCase();
      const matches = [];
      if (/across the bay area|bay area \/ mixed|mixed bay area/.test(text)) {
        matches.push("sf-origin:san-francisco", "sf-origin:east-bay", "sf-origin:north-bay", "sf-origin:peninsula", "sf-origin:south-bay");
      }
      if (/san francisco|\bsf\b/.test(text)) matches.push("sf-origin:san-francisco");
      if (/east bay/.test(text)) matches.push("sf-origin:east-bay");
      if (/marin|north bay/.test(text)) matches.push("sf-origin:north-bay");
      if (/peninsula/.test(text)) matches.push("sf-origin:peninsula");
      if (/south bay/.test(text)) matches.push("sf-origin:south-bay");
      const supported = matches.filter((id) => (foundation.originRegions || []).some((item) => item.originRegionId === id));
      if (supported.length) resolved.push(...supported.map((id) => ({ originRegionId: id, raw })));
      else unresolved.push(raw);
    });
    return { resolved: [...new Map(resolved.map((item) => [item.originRegionId, item])).values()], unresolved };
  }
  function modePreferences(transitImportance, parkingImportance) {
    const modes = [];
    if (transitImportance !== "LOW" && transitImportance !== "UNKNOWN") {
      modes.push({ mode: "REGIONAL_TRANSIT", importance: transitImportance, sourceDimension: "universal.access.transit_importance" });
      modes.push({ mode: "LOCAL_TRANSIT", importance: transitImportance, sourceDimension: "universal.access.transit_importance" });
    }
    if (parkingImportance !== "LOW" && parkingImportance !== "UNKNOWN") modes.push({ mode: "DRIVING", importance: parkingImportance, sourceDimension: "universal.access.parking_importance", parkingModifier: true });
    return modes;
  }
  function cohortsFor(actorType, resolvedOrigins, options) {
    return resolvedOrigins.map((origin) => ({
      cohortId: `access-cohort:${actorType.toLowerCase()}:${origin.originRegionId.split(":").pop()}`,
      actorType,
      originRegionId: origin.originRegionId,
      rawOrigin: origin.raw,
      importance: options.importance,
      frequency: options.frequency,
      modePreferences: options.modePreferences.map((item) => ({ ...item })),
      sourceDimensions: options.sourceDimensions.slice(),
    }));
  }

  function createRequirementAccessProfile(requirement = {}, foundation = {}) {
    const employeeItem = criterion(requirement, "universal.location.employee_origins") || criterion(requirement, "office.location.employee_geography");
    const clientOriginItem = criterion(requirement, "universal.location.customer_origins");
    const clientVisitItem = criterion(requirement, "office.access.client_visits");
    const serviceItem = criterion(requirement, "industrial.location.employee_service_geography");
    const transitItem = criterion(requirement, "universal.access.transit_importance") || criterion(requirement, "office.access.transit");
    const parkingItem = criterion(requirement, "universal.access.parking_importance") || criterion(requirement, "office.access.parking");
    const transitImportance = importance(transitItem);
    const parkingImportance = importance(parkingItem);
    const modes = modePreferences(transitImportance, parkingImportance);
    const employeeOrigins = originIds(value(employeeItem), foundation);
    const clientOrigins = originIds(value(clientOriginItem), foundation);
    const serviceOrigins = originIds(value(serviceItem), foundation);
    const retailCustomerContext = (requirement.propertyTypes || []).includes("retail_service") && clientOrigins.resolved.length > 0;
    const client = retailCustomerContext && !clientVisitItem ? { frequency: "RECURRING", importance: "MATERIAL" } : clientFrequency(clientVisitItem);
    const customerModes = retailCustomerContext && !modes.length ? [
      { mode: "LOCAL_TRANSIT", importance: "CONSIDER", sourceDimension: "universal.location.customer_origins" },
      { mode: "DRIVING", importance: "CONSIDER", sourceDimension: "universal.location.customer_origins" },
    ] : modes;
    const cohorts = [
      ...cohortsFor("EMPLOYEE", employeeOrigins.resolved, { importance: "MATERIAL", frequency: "RECURRING", modePreferences: modes, sourceDimensions: [employeeItem && employeeItem.dimension, transitItem && transitItem.dimension, parkingItem && parkingItem.dimension].filter(Boolean) }),
      ...cohortsFor("CLIENT_CUSTOMER", clientOrigins.resolved, { importance: client.importance, frequency: client.frequency, modePreferences: customerModes, sourceDimensions: [clientOriginItem && clientOriginItem.dimension, clientVisitItem && clientVisitItem.dimension, transitItem && transitItem.dimension, parkingItem && parkingItem.dimension].filter(Boolean) }),
      ...cohortsFor("SERVICE_TERRITORY", serviceOrigins.resolved, { importance: "MATERIAL", frequency: "RECURRING", modePreferences: parkingImportance === "LOW" || parkingImportance === "UNKNOWN" ? [{ mode: "DRIVING", importance: "MATERIAL", sourceDimension: serviceItem && serviceItem.dimension }] : modes.filter((item) => item.mode === "DRIVING"), sourceDimensions: [serviceItem && serviceItem.dimension].filter(Boolean) }),
    ];
    const preference = requirement.locationLogic && requirement.locationLogic.specificPreference || {};
    const profile = {
      schemaVersion: "requirement-access-profile:v0",
      adapterVersion: ADAPTER_VERSION,
      requirementId: requirement.id || "session-requirement",
      marketId: requirement.locationLogic && requirement.locationLogic.marketAnchor && requirement.locationLogic.marketAnchor.marketId || foundation.marketId || "",
      propertyContext: (requirement.propertyTypes || []).slice(),
      cohorts,
      modePreferences: { regionalTransit: transitImportance, localTransit: transitImportance, parking: parkingImportance, driving: parkingImportance === "LOW" || parkingImportance === "UNKNOWN" ? "UNKNOWN" : parkingImportance },
      candidateDistricts: {
        ids: (preference.candidateDistrictIds || []).slice(),
        names: (preference.candidateDistrictNames || []).slice(),
        sourceRouteIdentity: preference.sourceRouteIdentity ? { ...preference.sourceRouteIdentity } : null,
        treatment: "COMPARISON_CONTEXT_ONLY",
      },
      unresolvedOrigins: [...employeeOrigins.unresolved, ...clientOrigins.unresolved, ...serviceOrigins.unresolved],
      conflicts: [],
      provenance: cohorts.flatMap((cohort) => cohort.sourceDimensions.map((dimension) => ({ cohortId: cohort.cohortId, requirementDimension: dimension }))),
    };
    profile.validationErrors = schema.validateRequirementAccessProfile(profile);
    return profile;
  }

  return { ADAPTER_VERSION, createRequirementAccessProfile };
});
