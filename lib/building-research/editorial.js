'use strict';
// Governed presentation only. Never mutate source claims, scopes, dates or identities.
const dateText=value=>new Intl.DateTimeFormat('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(value.slice(0,10)+'T00:00:00Z'));
function address(record,options){
 if(options.displayName)return options.displayName;
 const found=(options.description||'').match(/^Dated USA Structures evidence for (.+), Sacramento:/);
 const approved=found&&found[1].toUpperCase()===record.address.toUpperCase()?found[1]:record.address;
 return approved.replace(/\b(\d+)(st|nd|rd|th)\b/gi,(_,digits,suffix)=>digits+suffix.toLowerCase());
}
function project(record,options={}){
 const name=address(record,options),sf=record.market==='san-francisco',claims=record.claims;
 if(sf){
  const floors=claims.find(c=>c.predicate==='floors'),height=claims.find(c=>c.predicate==='building-characteristic'),year=claims.find(c=>c.predicate==='year-built');
  const h=height?.value.match(/^The Tall Building Inventory records a building height of ([0-9]+(?:\.[0-9]+)?) feet\.$/);
  if(!floors||floors.sourceId!=='san-francisco:official:5kya-mfst'||!h)throw Error('Unreviewed historical scale translation');
  if(!claims.every(c=>c.sourceTimestamp===claims[0].sourceTimestamp))throw Error('Different claim dates need separate editorial dates');
  const facts=[{claimId:floors.id,label:'Above-ground floors',value:String(floors.value),unit:'',scope:'Historical record'},{claimId:height.id,label:'Recorded height',value:h[1],unit:'feet',scope:'Historical record'}];
  if(year)facts.push({claimId:year.id,label:'Construction year recorded',value:String(year.value),unit:'',scope:'Historical record'});
  if(facts.length!==claims.length)throw Error('Historical claim omitted by editorial projection');
  return {name,summary:`The building was recorded with ${floors.value} floors above ground and a height of ${h[1]} feet. The San Francisco inventory record was collected on ${dateText(claims[0].sourceTimestamp)}.`,facts,date:claims[0].sourceTimestamp.slice(0,10),dateText:dateText(claims[0].sourceTimestamp),essential:'The record may not reflect later changes.',yearConflict:options.yearConflict?'The construction year is unconfirmed because the records disagree.':null,checks:['Have later alterations changed the recorded floor count or height? Check current plans and permit records.',...(options.yearConflict?['Confirm the construction year before using it to compare the building’s age.']:[])],description:`${name}, San Francisco: ${floors.value} above-ground stories and a recorded height of ${h[1]} feet. Historical figures recorded ${claims[0].sourceTimestamp.slice(0,10)}.`};
 }
 if(record.market!=='sacramento'||claims.length!==1)throw Error('Unreviewed building fact family');
 const claim=claims[0],m=claim.value.match(/^USA Structures records approximately ([0-9,]+(?:\.[0-9]+)?) square feet of modeled ground footprint for structure (\d+), with source classification (.+) \(([^)]+)\)\. Imagery date: (\d{4}-\d{2}-\d{2}); production date: (\d{4}-\d{2}-\d{2})\./);
 if(!m||!record.recordId.endsWith(':'+m[2])||claim.sourceId!=='sacramento:official:usa-structures:5e5b5a1c7fa09f93')throw Error('Unreviewed footprint translation');
 return {name,summary:`The building at ${name} has an approximate footprint of ${m[1]} sq ft, based on imagery dated ${dateText(m[5])}.`,facts:[{claimId:claim.id,label:'Approximate building footprint',value:m[1],unit:'sq ft',scope:'Estimated ground coverage'}],essential:'The footprint is the area the building covers on the ground, not total floor area or rentable space.',imageryDate:m[5],imageryDateText:dateText(m[5]),productionDate:m[6],productionDateText:dateText(m[6]),sourceRecordId:m[2],sourceCategory:m[3],sourceClass:m[4],checks:['What total floor area and space sizes do current plans show? The footprint alone does not answer those questions.'],description:`${name}, Sacramento: approximate building footprint of ${m[1]} square feet, based on ${m[5]} imagery. Ground coverage is not floor area or rentable space.`};
}
module.exports={project,dateText,address};
