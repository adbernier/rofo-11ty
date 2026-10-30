import { ASSET_VERSIONS } from "../_sf-pilot/asset-versions.mjs";
import { enabled as sfPilotEnabled } from "../_sf-pilot/security.mjs";
import { publicEntryContextEligibleAtRuntime, publicSourceAllowed } from "../api/location-brief-v2/_shared.js";

function fallback(request) {
  const source = new URL(request.url);
  const target = new URL("/find-locations/", source.origin);
  for (const [key, value] of source.searchParams) if (key !== "journey" && key !== "brief") target.searchParams.append(key, value);
  return Response.redirect(target.toString(), 302);
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const propertyInput = url.searchParams.get("propertyType") || url.searchParams.get("spaceType") || "";
  const propertyType = /industrial|warehouse|flex/i.test(propertyInput) ? "industrial_flex" : /retail|service/i.test(propertyInput) ? "retail_service" : /office/i.test(propertyInput) ? "office" : "";
  const entry = { marketId: url.searchParams.get("marketId") || (/^san francisco$/i.test(url.searchParams.get("city") || "") ? "san-francisco" : ""), propertyType };
  const editing = url.searchParams.get("journey") === "edit" && /^LB2-[A-F0-9]{24}$/i.test(url.searchParams.get("brief") || "");
  if (!editing && (!await publicEntryContextEligibleAtRuntime(context.env, entry) || !publicSourceAllowed(context.env, url.searchParams.get("source") || ""))) return fallback(context.request);
  const response = await context.next();
  if (sfPilotEnabled(context.env) && ((entry.marketId === "san-francisco" && propertyType === "office") || editing)) {
    const type = response.headers.get("content-type") || "";
    if (type.includes("text/html")) { const body = (await response.text()).replace('src="/js/requirement-prototype.js"', `src="/js/requirement-prototype.js?v=${ASSET_VERSIONS.interview}"`).replace("</head>", '<meta name="rofo-sf-pilot" content="enabled"></head>'); const headers = new Headers(response.headers); headers.set("cache-control", "no-store, private"); return new Response(body, { status: response.status, headers }); }
  }
  return response;
}
