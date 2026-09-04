"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const contract = require("../../lib/public-commercial-geography/public-commercial-geography-v1");
const { marketRows, priorityMarkets, opportunities } = require("./public-commercial-geography-v1-source");

const root = path.resolve(__dirname, "../..");
const output = path.join(root, "data/internal/public-commercial-geography-v1");
const stable = value => JSON.stringify(value, Object.keys(value).sort());
const writeJson = (name, value) => fs.writeFileSync(path.join(output, name), `${JSON.stringify(value, null, 2)}\n`);
const codeTypes = value => ({ O:"office", R:"retail", I:"industrial", F:"flex" });
const typeMap = codeTypes();

fs.mkdirSync(path.join(output, "reports"), { recursive: true });

const markets = marketRows.map(([marketId,label,state,typeCodes,levelA,levelB,levelC]) => {
  const geographies = priorityMarkets[marketId] || [];
  for (const geography of geographies) {
    for (const relationship of geography.spaceTypes) {
      if (relationship.routeState === "ROUTE_READY") relationship.route = `/commercial-real-estate/${state}/${marketId}/${geography.id}/`;
    }
  }
  const supported = typeCodes.split("/").map(code => typeMap[code]).filter(Boolean);
  const coverage = contract.SPACE_TYPES.map(spaceType => {
    const relationships = geographies.flatMap(geography => geography.spaceTypes.filter(item => item.spaceType === spaceType).map(item => ({ geographyId: geography.id, label: geography.label, publicEvidenceTier: geography.publicEvidenceTier, applicability: item.applicability, routeState: item.routeState, indexation: item.indexation })));
    return {
      spaceType,
      knownGeographies: relationships,
      publicReviewedCount: relationships.filter(item => item.publicEvidenceTier === "PUBLIC_REVIEWED").length,
      publicContextualCount: relationships.filter(item => item.publicEvidenceTier === "PUBLIC_CONTEXTUAL").length,
      representativeCoverage: relationships.length ? (geographies.some(g => g.spaceTypes.some(r => r.spaceType === spaceType) && g.representatives.length) ? "PARTIAL_OR_REVIEWED" : "NONE") : "UNASSESSED",
      durablePropertyCoverage: relationships.length ? (geographies.some(g => g.spaceTypes.some(r => r.spaceType === spaceType) && g.representatives.some(rep => rep.durablePropertyId)) ? "PARTIAL" : "NONE") : "UNASSESSED",
      accessReadiness: relationships.length ? "SOURCE_AVAILABLE_NEEDS_REVIEW" : "SOURCE_NEEDED",
      routeCoverage: relationships.length ? (relationships.every(item => item.routeState === "ROUTE_READY") ? "ROUTE_READY" : "MIXED") : "UNASSESSED",
      confidence: relationships.length ? "BOUNDED_PUBLIC_FOUNDATION" : (supported.includes(spaceType) ? "ATLAS_RESEARCH_ONLY" : "NO_CURRENT_EVIDENCE"),
      majorGaps: relationships.length ? [] : [supported.includes(spaceType) ? "Space-type applicability and public evidence require targeted review." : "No supportable geography set in the current foundation."],
    };
  });
  return { marketId,label,state,atlasCounts:{levelA,levelB,levelC},atlasPropertyTypes:supported,geographies,coverage };
});

contract.validateFoundation(markets);
const priority = markets.filter(m => priorityMarkets[m.marketId]);
for (const market of priority) writeJson(`${market.marketId}.json`, market);
writeJson("market-coverage.json", { schemaVersion:contract.schemaVersion, generatedOn:"2026-09-04", markets:markets.map(({geographies,...market}) => market) });
writeJson("growth-opportunities.json", { schemaVersion:contract.schemaVersion, methodology:{dimensions:["search_visibility","existing_page_strength","geography_evidence","representative_coverage","durable_property_coverage","customer_usefulness","implementation_ease"], note:"Ordinal transparent prioritization; traffic does not override evidence."}, opportunities });

const firstCohort = {
  decision:"San Francisco first, followed by bounded Sacramento, Indianapolis, and Phoenix Industrial/Flex components; Denver remains component-only pending ownership review.",
  markets:[
    {marketId:"san-francisco",pages:["city orientation","Office/Retail/Industrial/Flex pages","existing geography routes"],modules:["space-type chooser","geography set","representative cards","Location Intelligence CTA"],indexation:"Reuse existing indexable routes; no net-new route required for first release."},
    {marketId:"sacramento",pages:["Industrial/Flex space-type components","Power Inn existing route"],modules:["two reviewed environments","reviewed representatives","investigation boundary"],indexation:"Power Inn component first; build Northgate route only after public-page review."},
    {marketId:"indianapolis",pages:["Industrial/Flex space-type components","Airport Logistics existing route"],modules:["two reviewed environments","reviewed representatives"],indexation:"Park 100 remains BUILD_THEN_INDEX."},
    {marketId:"phoenix",pages:["Industrial/Flex space-type components","existing geography routes"],modules:["three reviewed environments","Location Intelligence CTA"],indexation:"Reuse existing routes."},
  ],
  deferred:[{marketId:"denver",reason:"Useful PUBLIC_CONTEXTUAL components exist, but municipality/alias and representative review should precede standalone expansion."}],
};
writeJson("first-public-cohort.json", firstCohort);

const index = {
  schemaVersion:contract.schemaVersion, generatedOn:"2026-09-04", scope:"INTERNAL_FOUNDATION_NO_PUBLIC_BEHAVIOR",
  hierarchy:["CITY","SPACE_TYPE","COMMERCIAL_GEOGRAPHY","REPRESENTATIVE_PROPERTY_OR_ENVIRONMENT","LOCATION_INTELLIGENCE"],
  primaryCityDecision:"SPACE_TYPE", marketsAudited:markets.length, spaceTypeCells:markets.length*4,
  detailedMarkets:priority.map(m=>m.marketId), geographyRecords:priority.reduce((n,m)=>n+m.geographies.length,0),
  evidenceTiers:contract.PUBLIC_EVIDENCE_TIERS, applicability:contract.APPLICABILITY, routeStates:contract.ROUTE_STATES,
  indexationStates:contract.INDEXATION, accessReadiness:contract.ACCESS_READINESS,
  navigation:{desktop:"Persistent breadcrumb City › Space Type › Geography › Property; city routes to four space-type choices; geography and property levels expose sibling selectors without changing hierarchy.",mobile:"Compact stacked selectors: City, Space Type, then Geography. Property is the terminal label; back navigation returns one level without a mega-menu."},
  pageRoles:{city:"Orientation and routing: What kind of space are you looking for?",spaceType:"Primary exploration surface for relevant commercial environments, their differences, representatives, known objective access, and investigation boundaries.",geography:"Evidence-gated identity, orientation, character, area patterns, access observations, representatives, related geographies, and Location Intelligence CTA.",property:"Availability-independent identity and geography context with area patterns clearly separated from property-verified facts."},
  contentContract:{shortDescriptionWords:"40_TO_80",commercialCharacterItems:"2_TO_4",areaPatternItems:"2_TO_5",orientationFacts:"1_TO_2",access:"OBJECTIVE_ONLY",missingModules:"OMIT",longGeneratedEssays:"PROHIBITED"},
  gridContract:{isMap:false,fields:["group","order","optional_span"],prohibitions:["geographic_scale_implication","boundary_implication","distance_implication"]},
  areaPatternBoundary:{area:"AREA_PATTERN",property:"PROPERTY_VERIFIED_USE",uiRequirement:"Always label the evidence scope; never project an area pattern onto a property."},
  availabilityFirewall:contract.availabilityFirewall,
  routePolicy:"Reuse canonical routes; one route per entity; candidate-only geography cannot generate a route.",
  linkGraph:{city:["space_type"],spaceType:["geography"],geography:["parent_city_and_type","representative_property_or_environment","two_to_four_related_geographies","location_intelligence"],property:["geography","city_and_type","location_intelligence"]},
  firstPublicCohort:firstCohort,
  decision:"A. FOUNDATION READY — IMPLEMENT PUBLIC EXPERIENCE",
  nextSprint:"Implement the San Francisco City → Space Type → Geography public exploration slice using existing routes, followed by bounded Industrial/Flex components in Sacramento, Indianapolis, and Phoenix; keep Denver component-only pending review.",
};
writeJson("index.json", index);

fs.writeFileSync(path.join(output,"README.txt"), `PUBLIC COMMERCIAL GEOGRAPHY FOUNDATION v1\n\nInternal, deterministic research data only. It is not loaded by Eleventy and creates no route.\n\nHierarchy: City -> Space Type -> Commercial Geography -> Representative Property / Environment -> Location Intelligence.\n\nRecommendation certification is separate from public evidence tier. Candidate-only Atlas evidence remains internal. Historical availability is prohibited.\n`);
fs.writeFileSync(path.join(output,"reports/coverage-summary.txt"), markets.map(m => `${m.label}: A/B/C ${m.atlasCounts.levelA}/${m.atlasCounts.levelB}/${m.atlasCounts.levelC}; ${m.coverage.map(c=>`${c.spaceType}=${c.publicReviewedCount}R/${c.publicContextualCount}C`).join(", ")}`).join("\n")+"\n");
fs.writeFileSync(path.join(output,"reports/route-inventory.txt"), priority.flatMap(m=>m.geographies.flatMap(g=>g.spaceTypes.map(r=>`${m.marketId}\t${r.spaceType}\t${g.id}\t${r.routeState}\t${r.indexation}\t${r.route||"-"}`))).sort().join("\n")+"\n");
fs.writeFileSync(path.join(output,"reports/first-public-cohort.txt"), `${firstCohort.decision}\n\n${firstCohort.markets.map(m=>`${m.marketId}: ${m.indexation}`).join("\n")}\n\nDeferred: ${firstCohort.deferred.map(d=>`${d.marketId}: ${d.reason}`).join("; ")}\n`);

const files = fs.readdirSync(output).filter(name=>name.endsWith(".json")).sort().map(name=>{const body=fs.readFileSync(path.join(output,name));return {file:name,bytes:body.length,sha256:crypto.createHash("sha256").update(body).digest("hex")};});
fs.writeFileSync(path.join(output,"artifact-manifest.json"), `${JSON.stringify({schemaVersion:contract.schemaVersion,files},null,2)}\n`);
console.log(`Built ${markets.length} markets, ${priority.reduce((n,m)=>n+m.geographies.length,0)} detailed geographies, ${opportunities.length} opportunities.`);
