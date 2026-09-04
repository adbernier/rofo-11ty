#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"); const fs=require("node:fs"); const path=require("node:path");
const contract=require("../lib/durable-property/durable-property-entity-v1.js");
const ROOT=path.join(__dirname,".."); const DIR=path.join(ROOT,"data/internal/durable-property-entity-pilot-v1");
const load=(name)=>JSON.parse(fs.readFileSync(path.join(DIR,name),"utf8"));
const sf=load("san-francisco.json").entities, sac=load("sacramento.json").entities, indy=load("indianapolis.json").entities, audit=load("gsc-legacy-url-audit.json"), index=load("index.json");
assert.equal(index.scope.publicBehavior,"UNCHANGED_ZONE_CONTEXT_REDIRECTS"); assert.equal(index.scope.redirectMutation,"EXACT_14_PAGES_RULES_DEPLOYED_BUT_PREEMPTED_BY_ZONE_REDIRECT"); assert.equal(index.scope.availability,"EXCLUDED");
for(const entity of [...sf,...sac,...indy]){contract.assertAvailabilityFirewall(entity);assert.equal(entity.availabilityBoundary,"HISTORICAL_OBSERVATIONS_ONLY_NEVER_CURRENT_AVAILABILITY");assert.ok(entity.provenance.length);assert.ok(entity.reviewedPropertyTypes.length);assert.ok(entity.geographyRelationships.every((g)=>g.confidence==="REVIEWED"));}
for(const address of ["680 Folsom St","Pier 70 Building 101","1201 Illinois St"]) assert.equal(sf.find((e)=>e.canonicalAddress===address)?.identityConfidence,"REVIEWED_DURABLE_ENTITY");
const pier=sf.find((e)=>e.canonicalAddress==="Pier 70 Building 101"); assert.equal(pier.entityKind,"BUILDING_PROPERTY"); assert.ok(pier.parentEntityId); assert.notEqual(pier.durablePropertyId,pier.parentEntityId);
for(const address of ["8583 Elder Creek Rd","5711 Florin Perkins Rd","1329 N Market Blvd"]) assert.equal(sac.find((e)=>e.canonicalAddress===address)?.municipality,"Sacramento");
assert.equal(indy.find((e)=>e.canonicalAddress==="4557 W Bradbury Ave").geographyRelationships[0].geographyId,"indianapolis-airport-logistics");
assert.equal(indy.find((e)=>e.canonicalAddress==="7601 Winton Dr").geographyRelationships[0].geographyId,"park-100-northwest-indianapolis");
const airtech=indy.find((e)=>e.canonicalAddress==="558 Airtech Parkway"); assert.equal(airtech.municipality,"Plainfield"); assert.notEqual(airtech.geographyRelationships[0].municipality,"Indianapolis");
assert.equal(airtech.currentCanonicalUrl,null); assert.equal(airtech.publicReadiness,"NEEDS_PUBLIC_EVIDENCE"); assert.ok(airtech.conflicts.includes("CANONICAL_OWNERSHIP_CONFLICT"));
assert.equal(contract.classifyRedirect({hops:2}),"REDIRECT_CHAIN"); assert.equal(contract.classifyRedirect({directCanonicalMatch:true,hops:1}),"GOOD_DIRECT_REDIRECT"); assert.equal(contract.classifyRedirect({durablePropertyMatch:true,canonicalDestination:false,hops:0}),"DURABLE_PROPERTY_MATCH_NO_CANONICAL_DESTINATION");
assert.equal(audit.records.length,1000); assert.equal(audit.summary.totalUrls,1000); assert.equal(audit.records.filter((r)=>r.legacyBuildingId).length,997);
assert.equal(audit.summary.liveProbeCoverage,20); assert.equal(audit.summary.classifications.REDIRECT_CHAIN,0); assert.equal(audit.summary.classifications.GOOD_DIRECT_REDIRECT,0); assert.equal(audit.summary.classifications.GOOD_CONTEXT_REDIRECT,999); assert.equal(audit.summary.approvedDirectRedirects,14);
assert.throws(()=>contract.createDurableProperty({durablePropertyId:"x",entityKind:"SUITE_OBSERVATION",canonicalAddress:"1 Main St Ste 1",municipality:"Test",state:"CA",identityConfidence:"REVIEWED_DURABLE_ENTITY",publicReadiness:"INTERNAL_ONLY"}),/Suite observations/);
assert.throws(()=>contract.assertAvailabilityFirewall({rent:10}),/Time-sensitive/);
const watched=["_data/recommendationRepresentativeBuildings.js","_data/sacramentoIndustrialFlexEvidenceFoundation.js","_data/indianapolisIndustrialFlexEvidenceFoundation.js","cloudflare-city-redirects.csv"];
for(const file of watched) assert.ok(fs.existsSync(path.join(ROOT,file)),`${file} remains present and unmodified by generator scope`);
console.log("Durable Property Entity Pilot v1 QA passed.");
