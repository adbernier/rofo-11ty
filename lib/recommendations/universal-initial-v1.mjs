import industrialAdapter from '../requirements/requirement-to-sf-industrial-flex-recommendation.js';
import {catalog,selectOptions,CATALOG_VERSION} from '../../functions/_sf-pilot/catalog.mjs';
export function initialOptions(r){
 if(!r||r.type!=='office'||!/^San Francisco,\s*CA$/i.test(r.city))return [];
 const ext={initialGuidance:true,workspacePreference:r.workspace,people:r.people||null,peak:null,days:null,privacy:r.workspace==='cowork'?'open':r.workspace==='private'?'private':'either',meetings:'unknown',commitment:r.workspace==='traditional'?'fixed':'compare'};
 let options=selectOptions(ext,r.district?[r.district]:[]).filter(p=>r.workspace==='traditional'?p.type==='traditional-lease':r.workspace==='cowork'?p.type==='shared-membership':r.workspace==='private'?p.type==='private-serviced-office':true);
 // Do not claim a larger team fits a source-limited CANOPY team-office offer.
 if(r.people>40)options=options.filter(p=>!p.locationId.startsWith('canopy'));
 return options;
}
export function initialSnapshot(r){return {schemaVersion:'universal-initial:v1',engineVersion:CATALOG_VERSION,readiness:'INITIAL_GUIDANCE',shortlist:[],candidateAssessments:[],explanations:[],initialOptions:initialOptions(r),coverage:r.type==='office'&&/^San Francisco,\s*CA$/i.test(r.city)?'curated-office':'district-or-guided',unknowns:['Availability, team capacity and current quotes are not confirmed.']};}
export {catalog};

export {industrialAdapter};
