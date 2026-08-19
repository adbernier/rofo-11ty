(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.RofoRequirementRecommendationAdapter = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const ADAPTER_VERSION = "requirement-to-sf-office-recommendation:v1";
  const MODEL_KEY = "san-francisco:office";

  function criterion(requirement, dimension) {
    return (requirement.criteria || []).find((item) => item.dimension === dimension);
  }

  function criterionValue(item) {
    if (!item || !item.value) return "";
    if (Array.isArray(item.value.list) && item.value.list.length) return item.value.list.slice();
    if (item.value.number !== null && item.value.number !== undefined) return item.value.number;
    return String(item.value.text || "").trim();
  }

  function consumed(sourceDimension, sourceValue, recommendationSignal, projectedValue, mappingRationale, options = {}) {
    return { sourceDimension, sourceValue, recommendationSignal, projectedValue, mappingRationale, rankingEffect: options.rankingEffect || "possible", resolverSignalIds: options.resolverSignalIds || [] };
  }

  function unconsumed(sourceDimension, value, reason, treatment = "preserved_in_requirement") {
    return { sourceDimension, value, reason, treatment };
  }

  function importance(value) {
    const text = String(value || "").toLowerCase();
    if (/very important|essential|required/.test(text)) return "high";
    if (/helpful|preferred|somewhat/.test(text)) return "medium";
    if (/not important|rare|irrelevant/.test(text)) return "low";
    return "";
  }

  function clientFrequency(value) {
    const text = String(value || "").toLowerCase();
    if (/frequent|regular/.test(text)) return "high";
    if (/occasional|sometimes/.test(text)) return "medium";
    if (/rare|never|irrelevant/.test(text)) return "low";
    return "";
  }

  function businessType(value) {
    const text = String(value || "").toLowerCase();
    if (/architect|design|creative/.test(text)) return "design_creative";
    if (/account|audit|bookkeep|professional service|advisory/.test(text)) return "professional_services";
    if (/technology|software|startup|product/.test(text)) return "technology";
    if (/life science|biotech|healthcare/.test(text)) return "life_science";
    if (/nonprofit|mission.driven/.test(text)) return "nonprofit";
    return "";
  }

  function commuteProjection(values) {
    const list = (Array.isArray(values) ? values : [values]).map((value) => String(value || "").toLowerCase());
    const directions = new Set();
    list.forEach((value) => {
      if (/east bay/.test(value)) directions.add("east_bay");
      if (/marin|north bay/.test(value)) directions.add("marin");
      if (/peninsula|south bay/.test(value)) directions.add("peninsula_south_bay");
    });
    if (directions.size === 1) return { value: [...directions][0] };
    if (directions.size > 1) return { conflict: "Multiple directional employee-origin patterns cannot be reduced safely to the model's single commute-orientation signal." };
    return { unsupported: "The current SF Office model has no commute-orientation value for this employee-origin pattern." };
  }

  function projectRequirementToSfOfficeRecommendation(requirement = {}) {
    const market = requirement.locationLogic && requirement.locationLogic.marketAnchor || {};
    const propertyTypes = requirement.propertyTypes || [];
    const marketSupported = market.marketId === "san-francisco" || market.geographyId === "san-francisco" || /^San Francisco(?:, CA)?$/i.test(market.displayName || "");
    const officeSupported = propertyTypes.includes("office");
    const resolverInput = { city: marketSupported ? "San Francisco" : market.displayName || "", spaceType: officeSupported ? "Office" : propertyTypes[0] || "" };
    const consumedSignals = [];
    const unconsumedSignals = [];
    const conflicts = [];

    if (market.displayName) consumedSignals.push(consumed("locationLogic.marketAnchor", market.displayName, "city", resolverInput.city, "Routes the Requirement to the existing San Francisco model.", { rankingEffect: "eligibility", resolverSignalIds: [] }));
    if (propertyTypes.length) consumedSignals.push(consumed("propertyTypes", propertyTypes, "spaceType", resolverInput.spaceType, "Routes the Requirement to the existing Office model.", { rankingEffect: "eligibility", resolverSignalIds: [] }));

    const businessIdentity = criterion(requirement, "universal.business.type");
    const businessIdentityValue = businessIdentity ? criterionValue(businessIdentity) : requirement.businessContext && requirement.businessContext.summary || "";
    if (businessIdentityValue) {
      const value = businessIdentityValue;
      const projected = businessType(value);
      if (projected) {
        resolverInput.businessType = projected;
        consumedSignals.push(consumed(businessIdentity ? businessIdentity.dimension : "businessContext.summary", value, "businessType", projected, "Maps a bounded, user-stated business identity to the existing reviewed SF Office business-type taxonomy.", { resolverSignalIds: ["businessType"] }));
      }
    }

    const employeeOrigins = criterion(requirement, "universal.location.employee_origins");
    if (employeeOrigins) {
      const value = criterionValue(employeeOrigins);
      const projected = commuteProjection(value);
      if (projected.value) {
        resolverInput.commuteOrientation = projected.value;
        consumedSignals.push(consumed(employeeOrigins.dimension, value, "commuteOrientation", projected.value, "SF is treated as the local anchor; one additional directional origin maps to the resolver's existing commute-orientation enum.", { resolverSignalIds: ["commuteOrientation"] }));
      } else if (projected.conflict) conflicts.push({ sourceDimension: employeeOrigins.dimension, value, reason: projected.conflict });
      else unconsumedSignals.push(unconsumed(employeeOrigins.dimension, value, projected.unsupported));
    }

    [
      ["universal.access.transit_importance", "transitImportance", "regional_transit"],
      ["universal.access.parking_importance", "parkingImportance", "parking"],
    ].forEach(([dimension, signal, resolverSignal]) => {
      const item = criterion(requirement, dimension);
      if (!item) return;
      const value = criterionValue(item);
      const projected = importance(value);
      if (!projected) return conflicts.push({ sourceDimension: dimension, value, reason: `Cannot map safely to ${signal}'s high / medium / low enum.` });
      resolverInput[signal] = projected;
      consumedSignals.push(consumed(dimension, value, signal, projected, "Maps the interview's plain-language importance choice to the resolver's existing importance enum.", { resolverSignalIds: [resolverSignal] }));
    });

    const visits = criterion(requirement, "office.access.client_visits");
    if (visits) {
      const value = criterionValue(visits);
      const projected = clientFrequency(value);
      if (projected) {
        resolverInput.clientVisitFrequency = projected;
        consumedSignals.push(consumed(visits.dimension, value, "clientVisitFrequency", projected, "Maps visit frequency to the existing client-access priority.", { resolverSignalIds: ["client_access"] }));
      } else conflicts.push({ sourceDimension: visits.dimension, value, reason: "Cannot map safely to clientVisitFrequency's high / medium / low enum." });
    }

    const peak = criterion(requirement, "office.occupancy.peak_attendance");
    if (peak) {
      const value = criterionValue(peak);
      resolverInput.regularOccupancy = value;
      consumedSignals.push(consumed(peak.dimension, value, "regularOccupancy", value, "The existing input contract preserves occupancy context, but the current district resolver does not score it.", { rankingEffect: "none", resolverSignalIds: [] }));
    }

    const customerOrigins = criterion(requirement, "universal.location.customer_origins");
    if (customerOrigins) unconsumedSignals.push(unconsumed(customerOrigins.dimension, criterionValue(customerOrigins), "The current model has client visit frequency but no client-origin geography signal."));

    const preference = requirement.locationLogic && requirement.locationLogic.specificPreference || {};
    if ((preference.candidateDistrictIds || []).length) unconsumedSignals.push(unconsumed("locationLogic.specificPreference.candidateDistrictIds", preference.candidateDistrictIds, "Candidate districts are comparison context only; they are deliberately not projected as a district anchor.", "comparison_context_only"));
    if (preference.informalText) unconsumedSignals.push(unconsumed("locationLogic.specificPreference.informalText", preference.informalText, "The current prototype has no canonical resolver for informal place text.", "unresolved"));
    if (requirement.businessContext && requirement.businessContext.summary && !resolverInput.businessType) unconsumedSignals.push(unconsumed("businessContext.summary", requirement.businessContext.summary, "Free-form business context is not inferred into ranking signals unless it contains a supported, bounded business identity."));

    const supported = marketSupported && officeSupported;
    return {
      adapterVersion: ADAPTER_VERSION,
      modelKey: supported ? MODEL_KEY : "",
      supported,
      unsupportedReason: supported ? "" : `No private recommendation model is connected for ${market.displayName || "this market"} / ${propertyTypes.join(", ") || "this space type"}.`,
      resolverInput,
      consumedSignals,
      unconsumedSignals,
      conflicts,
      comparisonContext: {
        candidateDistrictIds: (preference.candidateDistrictIds || []).slice(),
        candidateDistrictNames: (preference.candidateDistrictNames || []).slice(),
        informalLocationPreference: preference.informalText || "",
      },
    };
  }

  return { ADAPTER_VERSION, MODEL_KEY, projectRequirementToSfOfficeRecommendation };
});
