"use strict";
const uses = Object.freeze({ warehouse: "Store goods and make deliveries", service: "Run a service business with vehicles or supplies", mixed: "Combine office work with a workshop or storage", technical: "Do technical or aerospace-related work", unsure: "Something else / not sure" });
const areas = Object.freeze({ "southwest-phoenix-industrial": "Southwest Phoenix", "airport-south-central-industrial": "Airport / South Central", "north-phoenix-advanced-operations": "North Phoenix" });
const properties = Object.freeze({ "1002-s-56th-ave": "1002 S 56th Avenue", "3241-e-washington-st": "3241 E Washington Street", "4625-e-cotton-center-blvd": "4625 E Cotton Center Boulevard" });
function resolvePhoenixJourneyContext(entry = {}) {
  if (entry.marketId !== "phoenix" || entry.propertyType !== "industrial_flex" || !(String(entry.businessArchetypeId || "").startsWith("phoenix-preliminary:") || entry.sourceEntityId === "phoenix-industrial-journey:v1")) return null;
  const useId = String(entry.businessArchetypeId || "").slice("phoenix-preliminary:".length);
  return { use: uses[useId] || "Not specified", area: (entry.candidateDistrictIds || []).map((id) => areas[id]).filter(Boolean).join(", "), property: properties[entry.propertyId] || "", propertyId: properties[entry.propertyId] ? entry.propertyId : "" };
}
module.exports = { uses, areas, properties, resolvePhoenixJourneyContext };
