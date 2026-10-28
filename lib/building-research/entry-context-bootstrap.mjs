import {seedTrustedEntryContext as baseSeed} from '/js/requirements/requirement-entry-context-base.mjs';
import {createInterviewState} from '/js/requirements/requirement-interview-v1.mjs';
import {resolveReference} from '/assets/building-research/entry-runtime.mjs';

// Opt-in replacement at the existing bootstrap module URL. No save/edit contract.
export function seedTrustedEntryContext(interview,entryContext={},districtGeography={markets:{}}){
 const seeded=baseSeed(interview,entryContext,districtGeography);
 if(entryContext.intent!=='new'||entryContext.marketId!=='sacramento'||typeof document==='undefined')return seeded;
 let reference=null;
 try{reference=resolveReference(new URLSearchParams(location.search),JSON.parse(document.querySelector('[data-building-research-entry-registry]')?.textContent||'[]'));}catch{return seeded;}
 if(!reference||reference.market!==entryContext.marketId||reference.sourcePath!==entryContext.sourcePath)return seeded;
 const requirement=structuredClone(seeded.requirement);
 requirement.locationLogic.marketAnchor={geographyId:'sacramento',marketId:'sacramento',displayName:'Sacramento',marketName:'Sacramento',city:'Sacramento',state:'CA',source:'entry_context'};
 requirement.locationLogic.locations=['Sacramento'];
 requirement.criteria=[...requirement.criteria.filter(c=>c.dimension!=='universal.location.anchor'),{id:'criterion_universal_location_anchor',dimension:'universal.location.anchor',label:'Market anchor',value:{text:'Sacramento',number:null,boolean:null,list:[]},status:'REQUIRED',scope:'location',source:'external_record',confidence:1,rationale:'Inherited municipality from validated Building Research entry.',authority:'rofo',requiresConfirmation:false,confirmed:true}];
 return createInterviewState({requirement,districtGeography});
}
