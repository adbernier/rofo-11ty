import { publicEntryContextEligibleAtRuntime, publicSourceAllowed } from "./api/location-brief-v2/_shared.js";

const propertyType = (value) => /retail|service/i.test(value || "") ? "retail_service" : /industrial|warehouse|flex/i.test(value || "") ? "industrial_flex" : /office/i.test(value || "") ? "office" : "";

export async function controlledEntryDecision(env, url) {
  const source = url.searchParams.get("source") || "homepage";
  const marketId = url.searchParams.get("marketId") || (/^san francisco$/i.test(url.searchParams.get("city") || "") ? "san-francisco" : "");
  const type = propertyType(url.searchParams.get("propertyType") || url.searchParams.get("spaceType"));
  if (!publicSourceAllowed(env, source)) return { eligible: false, reasonCode: "SOURCE_NOT_ALLOWED" };
  const eligible = await publicEntryContextEligibleAtRuntime(env, { marketId, propertyType: type });
  return { eligible, reasonCode: eligible ? (marketId === "san-francisco" ? "SF_COHORT" : marketId === "san-diego" && type === "industrial_flex" ? "SAN_DIEGO_INDUSTRIAL_FLEX_COHORT" : ["anaheim", "fullerton"].includes(marketId) && type === "industrial_flex" ? "NORTH_ORANGE_COUNTY_INDUSTRIAL_FLEX_COHORT" : marketId === "phoenix" && type === "industrial_flex" ? "PHOENIX_INDUSTRIAL_FLEX_COHORT" : marketId ? "UNIVERSAL_COHORT" : "CONTROLLED_GLOBAL") : marketId && type ? "SEARCH_NOT_ENABLED" : "INCOMPLETE_GLOBAL_COHORT" };
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const decision = await controlledEntryDecision(env, url);
  const target = new URL(decision.eligible ? "/location-requirement/" : "/find-locations/", url.origin);
  for (const [key, value] of url.searchParams) target.searchParams.append(key, value);
  if (decision.eligible) target.searchParams.set("journey", "new");
  else target.searchParams.set("v2Fallback", decision.reasonCode);
  return Response.redirect(target.toString(), 302);
}
