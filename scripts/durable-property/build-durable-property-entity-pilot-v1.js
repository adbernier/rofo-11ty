#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const contract = require("../../lib/durable-property/durable-property-entity-v1.js");
const reconciliation = require("../../lib/property-reconciliation/property-reconciliation-v1.js");
const representative = require("../../lib/representative-property/representative-property-foundation-v1.js");

const ROOT = path.join(__dirname, "../..");
const OUTPUT = path.join(ROOT, "data/internal/durable-property-entity-pilot-v1");
const GSC_DEFAULT = "/Users/alanbernier/Downloads/rofo.com-Coverage-Drilldown-2026-09-04/Table.csv";
const GSC = process.env.ROFO_GSC_REDIRECT_EXPORT || GSC_DEFAULT;
const buildings = require("../../_data/buildings.js");
const redirectReview = require("../../_data/legacyBuildingRedirectReview.js");
const approvedRedirectIds = new Set(redirectReview.filter((item) => item.finalDisposition === "DIRECT_PROPERTY_REDIRECT_APPROVED").map((item) => item.legacyBuildingId));
const buildingRows = Array.isArray(buildings) ? buildings : Object.values(buildings).flatMap((value) => Array.isArray(value) ? value : [value]);

function clean(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function slug(value) { return clean(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function sha256(bytes) { return crypto.createHash("sha256").update(bytes).digest("hex"); }
function write(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, typeof value === "string" ? value : `${JSON.stringify(value)}\n`); }
function parseCsvLine(line) { const out=[]; let value="", quoted=false; for(let i=0;i<line.length;i++){const c=line[i]; if(c==='"'){if(quoted&&line[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){out.push(value);value="";}else value+=c;} out.push(value); return out; }
function parseCsv(file) { const lines=fs.readFileSync(file,"utf8").trim().split(/\r?\n/); const headers=parseCsvLine(lines.shift()); return lines.map((line)=>Object.fromEntries(parseCsvLine(line).map((value,index)=>[headers[index],value]))); }
function addressKey(state, city, address) { return `${state}|${clean(city).toLowerCase()}|${reconciliation.normalizeAddress(address).normalized}`; }

const currentByAddress = new Map(buildingRows.filter(Boolean).map((row) => [addressKey((row.building_path || "").split("/")[3], row.city, row.address), row]));
const rawRows = parseCsv(path.join(ROOT, "data/peter/raw/rofo_buildings.csv"));
const rawById = new Map(rawRows.map((row) => [String(row.building_id), row]));
const rawByAddress = new Map();
for (const row of rawRows) { const key=addressKey(row.state,row.city,row.address); if(!rawByAddress.has(key)) rawByAddress.set(key,[]); rawByAddress.get(key).push(row); }
const suppliedRows = parseCsv(GSC);
const legacyUrlsById = new Map();
for (const row of suppliedRows) { const id=row.URL.match(/-(\d+)\.html(?:\?|$)/)?.[1]; if(id){if(!legacyUrlsById.has(id))legacyUrlsById.set(id,[]);legacyUrlsById.get(id).push(row.URL);} }

const geography = Object.freeze({
  "680-folsom": { id:"soma", label:"SoMa", municipality:"San Francisco" },
  "pier-70-building-101": { id:"dogpatch-central-waterfront", label:"Dogpatch / Central Waterfront", municipality:"San Francisco" },
  "1201-illinois": { id:"dogpatch-central-waterfront", label:"Dogpatch / Central Waterfront", municipality:"San Francisco" },
  "8583-elder-creek": { id:"power-inn-industrial", label:"Power Inn Industrial", municipality:"Sacramento" },
  "5711-florin-perkins": { id:"power-inn-industrial", label:"Power Inn Industrial", municipality:"Sacramento" },
  "1329-n-market": { id:"northgate-north-market-industrial", label:"Northgate / North Market Industrial", municipality:"Sacramento" },
  "4557-w-bradbury": { id:"indianapolis-airport-logistics", label:"Indianapolis Airport Logistics", municipality:"Indianapolis" },
  "7601-winton": { id:"park-100-northwest-indianapolis", label:"Park 100 / Northwest Indianapolis", municipality:"Indianapolis" },
  "558-airtech": { id:"plainfield", label:"Plainfield", municipality:"Plainfield" },
});
const specifications = [
  ["san-francisco","680-folsom","680 Folsom St","San Francisco","CA",null,"680 Folsom",["office"],"BUILDING_PROPERTY"],
  ["san-francisco","pier-70-building-101","Pier 70 Building 101","San Francisco","CA",null,"Pier 70 Building 101",["office","mixed_commercial"],"BUILDING_PROPERTY","property:ca:san-francisco:pier-70-campus"],
  ["san-francisco","1201-illinois","1201 Illinois St","San Francisco","CA",null,"Power Station - Station A",["office","mixed_commercial"],"BUILDING_PROPERTY","property:ca:san-francisco:pier-70-campus"],
  ["san-francisco","415-mission","415 Mission St","San Francisco","CA",null,"Salesforce Tower",["office"],"BUILDING_PROPERTY"],
  ["san-francisco","600-townsend","600 Townsend St","San Francisco","CA",null,"600 Townsend",["office"],"BUILDING_PROPERTY"],
  ["san-francisco","654-minnesota","654 Minnesota St","San Francisco","CA",null,"UCSF Life Sciences Building",["office"],"BUILDING_PROPERTY"],
  ["sacramento","8583-elder-creek","8583 Elder Creek Rd","Sacramento","CA",null,null,["industrial"],"BUILDING_PROPERTY"],
  ["sacramento","5711-florin-perkins","5711 Florin Perkins Rd","Sacramento","CA",null,null,["industrial"],"BUILDING_PROPERTY"],
  ["sacramento","1329-n-market","1329 N Market Blvd","Sacramento","CA",null,null,["industrial"],"BUILDING_PROPERTY"],
  ["indianapolis","4557-w-bradbury","4557 W Bradbury Ave","Indianapolis","IN",null,null,["industrial"],"BUILDING_PROPERTY"],
  ["indianapolis","7601-winton","7601 Winton Dr","Indianapolis","IN",null,null,["industrial"],"BUILDING_PROPERTY"],
  ["indianapolis","558-airtech","558 Airtech Parkway","Plainfield","IN",null,null,["industrial"],"BUILDING_PROPERTY"],
];

function makeEntity(spec) {
  const [market,key,address,municipality,state,postalCode,name,types,entityKind,parentEntityId] = spec;
  const current = currentByAddress.get(addressKey(state, municipality, address)) || (key === "558-airtech" ? buildingRows.find((row)=>row.address === address) : null);
  const historical = rawByAddress.get(addressKey(state, municipality, address)) || (key === "558-airtech" ? rawRows.filter((row)=>reconciliation.normalizeAddress(row.address).normalized===reconciliation.normalizeAddress(address).normalized && row.state===state) : []);
  const reviewedGeography = geography[key] || null;
  const conflicts = key === "558-airtech" ? ["CANONICAL_OWNERSHIP_CONFLICT"] : [];
  const entity = contract.createDurableProperty({
    durablePropertyId:`property:${state.toLowerCase()}:${slug(municipality)}:${slug(address)}`, entityKind,
    canonicalAddress:address, originalAddresses:[address,...historical.map((row)=>row.address)], normalizedAddress:reconciliation.normalizeAddress(address).normalized,
    municipality,state,postalCode:postalCode || historical[0]?.zip || null,buildingName:name || current?.name || null,parentEntityId,
    geographyRelationships: reviewedGeography ? [{ geographyId:reviewedGeography.id, label:reviewedGeography.label, municipality:reviewedGeography.municipality, confidence:"REVIEWED", evidenceBasis:"CURRENT_REVIEWED_GEOGRAPHY_FOUNDATION" }] : [],
    reviewedPropertyTypes:types,historicalTypeObservations:[],legacyBuildingIds:historical.map((row)=>String(row.building_id)),semanticSourceIds:[],legacyPublicUrls:historical.flatMap((row)=>legacyUrlsById.get(String(row.building_id))||[]),currentCanonicalUrl:key === "558-airtech" ? null : current?.building_path || null,
    provenance:["_data/buildings.js","_data/commercialBuildingIntelligence.js", market === "sacramento" ? "_data/sacramentoIndustrialFlexEvidenceFoundation.js" : market === "indianapolis" ? "_data/indianapolisIndustrialFlexEvidenceFoundation.js" : "docs/sf-canonical-representative-buildings.md"],
    identityConfidence:"REVIEWED_DURABLE_ENTITY",reviewStatus:"MANUALLY_REVIEWED_PILOT_V1",conflicts,
    representativeRelationships:[{ status:"REVIEWED_REPRESENTATIVE", geographyId:reviewedGeography?.id || null }],mediaRights:"RIGHTS_UNKNOWN",
    publicReadiness: current?.building_path && !conflicts.length ? "PUBLIC_PROPERTY_CANDIDATE" : "NEEDS_PUBLIC_EVIDENCE",
  });
  return { market, entity };
}

const made = specifications.map(makeEntity);
const entitiesByLegacyId = new Map(made.flatMap(({entity})=>entity.legacyBuildingIds.map((id)=>[id,entity])));
const entityByAddress = new Map(made.map(({entity})=>[addressKey(entity.state,entity.municipality,entity.canonicalAddress),entity]));
const redirectRows = suppliedRows.map((row) => {
  const url=row.URL; const match=url.match(/-(\d+)\.html(?:\?|$)/); const legacyId=match?.[1] || null; const historical=legacyId ? rawById.get(legacyId) : null;
  const durable=legacyId ? entitiesByLegacyId.get(legacyId) : null;
  const canonical=historical ? currentByAddress.get(addressKey(historical.state,historical.city,historical.address)) : null;
  const exactPilot=historical ? entityByAddress.get(addressKey(historical.state,historical.city,historical.address)) : null;
  const hasContext=Boolean(historical?.state && historical?.city);
  const routeContext=(()=>{try{return /\/(?:commercial-real-estate\/)?[A-Z]{2}\/[A-Za-z0-9-]+\/?$/i.test(new URL(url).pathname)}catch{return false}})();
  const classification=contract.classifyRedirect({
    hops:hasContext || routeContext ? 1 : 0,
    directCanonicalMatch:Boolean(canonical && canonical.building_path && false),
    relevantContextMatch:hasContext || routeContext,
    durablePropertyMatch:Boolean(durable || exactPilot), canonicalDestination:canonical?.building_path || exactPilot?.currentCanonicalUrl,
  });
  return { url,lastCrawled:row["Last crawled"] || null,legacyBuildingId:legacyId,historicalPropertyMatch:Boolean(historical),durablePilotMatchId:(durable||exactPilot)?.durablePropertyId||null,municipality:historical?.city||null,state:historical?.state||null,currentCanonicalUrl:canonical?.building_path||exactPilot?.currentCanonicalUrl||null,classification,evidenceBasis:approvedRedirectIds.has(legacyId) ? "REVIEWED_DIRECT_REDIRECT_PENDING_ZONE_PRIORITY_OVERRIDE" : hasContext ? "OFFLINE_ROUTE_MODEL_AND_HISTORICAL_ID_MATCH" : "SUPPLIED_EXPORT_ONLY"};
}).sort((a,b)=>a.url.localeCompare(b.url));

const marketArtifacts=[];
for(const market of ["san-francisco","sacramento","indianapolis"]){const entities=made.filter((row)=>row.market===market).map((row)=>row.entity).sort((a,b)=>a.durablePropertyId.localeCompare(b.durablePropertyId)); const artifact={schemaVersion:contract.schemaVersion,market,scope:"INTERNAL_ONLY",entities}; const file=`${market}.json`; write(path.join(OUTPUT,file),artifact); const bytes=fs.readFileSync(path.join(OUTPUT,file));marketArtifacts.push({market,file,bytes:bytes.length,sha256:sha256(bytes)});}
const counts=Object.fromEntries(contract.REDIRECT_CLASSIFICATIONS.map((status)=>[status,redirectRows.filter((row)=>row.classification===status).length]));
const audit={schemaVersion:"durable-property-legacy-url-audit:v1",source:{fileName:path.basename(GSC),sha256:sha256(fs.readFileSync(GSC)),exportedRows:suppliedRows.length,reportedSearchConsoleScale:"approximately 1.69K; export contains a bounded 1,000-row sample"},summary:{totalUrls:suppliedRows.length,legacyIdUrls:redirectRows.filter((row)=>row.legacyBuildingId).length,historicalPropertyMatches:redirectRows.filter((row)=>row.historicalPropertyMatch).length,durablePilotMatches:redirectRows.filter((row)=>row.durablePilotMatchId).length,canonicalDestinationMatches:redirectRows.filter((row)=>row.currentCanonicalUrl).length,classifications:counts,approvedDirectRedirects:approvedRedirectIds.size,liveProbeCoverage:20,offlineClassifications:suppliedRows.length-20,preCleanupLiveProbeResult:"20/20 returned HTTP 200 after one redirect to matching city context"},records:redirectRows};
write(path.join(OUTPUT,"gsc-legacy-url-audit.json"),audit);
const auditBytes=fs.readFileSync(path.join(OUTPUT,"gsc-legacy-url-audit.json"));
const index={schemaVersion:contract.schemaVersion,generatedFrom:"deterministic repository inputs plus supplied GSC export",scope:{markets:["San Francisco","Sacramento","Indianapolis"],publicBehavior:"UNCHANGED_ZONE_CONTEXT_REDIRECTS",redirectMutation:"EXACT_14_PAGES_RULES_DEPLOYED_BUT_PREEMPTED_BY_ZONE_REDIRECT",availability:"EXCLUDED"},summary:{durableEntities:made.length,reviewedDurableEntities:made.filter(({entity})=>entity.identityConfidence==="REVIEWED_DURABLE_ENTITY").length,gscUrlsAudited:suppliedRows.length,historicalUrlMatches:audit.summary.historicalPropertyMatches,canonicalDestinationMatches:audit.summary.canonicalDestinationMatches,redirectClassifications:counts},artifacts:[...marketArtifacts,{market:"gsc-audit",file:"gsc-legacy-url-audit.json",bytes:auditBytes.length,sha256:sha256(auditBytes)}]};
write(path.join(OUTPUT,"index.json"),index);
write(path.join(OUTPUT,"README.txt"),"Durable Property Entity Pilot v1\n\nInternal-only reviewed identities. Historical observations are provenance, never current availability. The supplied GSC export contains 1,000 examples from an approximately 1.69K Search Console issue population. A bounded review approved exactly 14 direct property redirects from the fixed 16-match cohort and deployed matching Pages rules. Production verification found that the existing higher-priority zone redirect still sends those URLs to city context; the audit therefore continues to record actual context behavior until an authorized account-level override is installed.\n");

function lines(title,rows,format){return `${title}\n${"=".repeat(title.length)}\n${rows.length?rows.map(format).join("\n"):"None."}\n`;}
const reportDir=path.join(OUTPUT,"reports");
write(path.join(reportDir,"durable-property-entities.txt"),lines("Reviewed durable property entities",made,({entity})=>`${entity.durablePropertyId} | ${entity.canonicalAddress} | ${entity.municipality}, ${entity.state} | ${entity.geographyRelationships[0]?.geographyId||"unassigned"} | ${entity.currentCanonicalUrl||"no canonical URL"}`));
write(path.join(reportDir,"unresolved-identity-gaps.txt"),lines("Identity gaps",made.filter(({entity})=>entity.identityConfidence!=="REVIEWED_DURABLE_ENTITY"),({entity})=>`${entity.durablePropertyId} | ${entity.identityConfidence} | ${entity.conflicts.join(",")}`));
write(path.join(reportDir,"legacy-url-mapping.txt"),lines("Legacy URL mapping summary",Object.entries(counts),([status,count])=>`${status}: ${count}`));
write(path.join(reportDir,"redirect-classification.txt"),lines("Redirect classification",redirectRows.slice(0,100),row=>`${row.classification} | ${row.url} | ${row.currentCanonicalUrl||"no canonical destination"}`));
write(path.join(reportDir,"redirect-opportunities.txt"),lines("Highest-value redirect opportunities",redirectRows.filter((row)=>row.currentCanonicalUrl||row.durablePilotMatchId).slice(0,100),row=>`${row.classification} | ${row.url} | ${row.currentCanonicalUrl||row.durablePilotMatchId}`));
write(path.join(reportDir,"hierarchy-conflicts.txt"),"Hierarchy conflicts\n===================\nPier 70 is modeled as a campus/environment parent; Building 101 and 1201 Illinois remain separate BUILDING_PROPERTY entities. No suite observation was promoted.\n");
write(path.join(reportDir,"public-property-candidates.txt"),lines("Future public property candidates (nothing published)",made.filter(({entity})=>entity.publicReadiness==="PUBLIC_PROPERTY_CANDIDATE"),({entity})=>`${entity.durablePropertyId} | ${entity.currentCanonicalUrl||"needs route"} | media=${entity.mediaRights}`));

const sfEntities=made.filter((row)=>row.market==="san-francisco").map((row)=>row.entity);
const integration=sfEntities.slice(0,3).map((entity)=>({entity,qualification:representative.qualifyProperty({entity:{...entity,reconciliationStatus:"CANONICAL_MATCH",relationshipConfidence:"REVIEWED",propertyType:{reviewedTypes:entity.reviewedPropertyTypes},commercialGeography:entity.geographyRelationships[0],conflictCodes:entity.conflicts,provenance:entity.provenance,mediaRights:entity.mediaRights},existingReviewedRepresentative:true,reviewedGeographyOverride:true,explanatoryRole:"Existing reviewed San Francisco representative",evidenceSources:entity.provenance,publicEvidenceReviewed:true})}));
write(path.join(reportDir,"representative-integration.txt"),lines("Representative Foundation integration",integration,({entity,qualification})=>`${entity.canonicalAddress} | ${qualification.representativeStatus} | ${qualification.availabilityBoundary}`));
console.log(JSON.stringify(index.summary,null,2));
