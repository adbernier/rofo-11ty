// Optional display-only ingress. Never added to saved Requirement/EntryContext.
export function resolveReference(query,registry){
 const names={'san-francisco':'San Francisco',sacramento:'Sacramento'};
 if(query.get('source')!=='building'||query.get('journey')==='edit'||query.has('brief'))return null;
 const source=query.get('sourcePath')||'',market=query.get('marketId');
 if(!names[market]||query.get('city')!==names[market]||query.get('state')!=='CA'||!new RegExp('^/commercial-real-estate/building/CA/'+market+'/[a-z0-9-]+/$').test(source))return null;
 const matches=registry.filter(r=>r.sourcePath===source&&r.market===market);
 return matches.length===1?matches[0]:null;
}
export function syncReferenceTitle(document){
 const title=document.querySelector('[data-profile-building-title]'),context=document.querySelector('[data-profile-search-context-values]');
 if(!title||!context)return;
 const city=context.dataset.profileSearchCity||'',display=context.dataset.profileSearchLocation||'';
 const alreadyShown=city===title.dataset.referenceCity&&display.split(' / ').some(label=>label===city||label===city+', CA');
 title.textContent='Building reference: '+title.dataset.referenceAddress+(alreadyShown?'':' · '+title.dataset.referenceCity);
}
export function mountReference(document,reference,onHide=()=>{}){
 if(!reference||document.querySelector('[data-research-entry-reference]'))return null;
 const target=document.querySelector('[data-requirement-prototype],.search-profile-page');
 if(!target)return null;
 const panel=document.createElement('aside');panel.dataset.researchEntryReference='';panel.setAttribute('aria-label','Building research reference');
 panel.style.cssText='margin:20px auto;padding:20px;max-width:1000px;border:1px solid #d8e0ea;border-radius:10px;background:#f1f5f9;color:#0f172a;font:16px/1.6 Inter,ui-sans-serif,system-ui';
 const title=document.createElement('strong');title.textContent='Building you’re exploring: '+reference.address;
 const note=document.createElement('p');note.textContent='Use what you’ve learned here to help describe the space you need.';
 const link=document.createElement('a');link.href=reference.sourcePath;link.textContent='View this building';
 const limit=document.createElement('p');limit.textContent='Availability not verified. Check whether the space suits your needs.';
 const remove=document.createElement('button');remove.type='button';remove.textContent='Hide building reference';remove.addEventListener('click',()=>{onHide();panel.remove();});
 const style=document.createElement('style');style.textContent='[data-research-entry-reference] a:focus-visible,[data-research-entry-reference] button:focus-visible{outline:3px solid #1346d8;outline-offset:4px}[data-research-entry-reference]{overflow-wrap:anywhere}';panel.append(style);
 for(const el of [link,remove])el.style.cssText='margin-right:16px;min-height:44px';
 const slot=document.querySelector('[data-profile-building-reference-slot]');
 if(slot){
  // Page-only presentation: keep the same validated reference, link and Hide controller.
  panel.style.cssText='';panel.className='search-profile-building-reference';
  title.textContent='Building reference: '+reference.address+' · '+({'san-francisco':'San Francisco',sacramento:'Sacramento'}[reference.market]||reference.market);
  title.dataset.profileBuildingTitle='';title.dataset.referenceAddress=reference.address;
  title.dataset.referenceCity=({'san-francisco':'San Francisco',sacramento:'Sacramento'}[reference.market]||reference.market);
  limit.textContent='Availability not verified.';
  for(const el of [link,remove])el.style.cssText='';
  panel.append(title,link,remove,limit);slot.append(panel);syncReferenceTitle(document);
 }else{panel.append(title,note,link,limit,remove);target.prepend(panel);}
 return panel;
}
const controllers=new WeakMap();
export function startReference(document,location,eventTarget){
 if(controllers.has(document))return controllers.get(document);
 const node=document.querySelector('[data-building-research-entry-registry]');if(!node)return null;
 let registry;try{registry=JSON.parse(node.textContent);}catch{return null;}
 let hidden=false;
 const controller={render(){if(hidden)return null;return mountReference(document,resolveReference(new URLSearchParams(location.search),registry),()=>{hidden=true;});},reenter(){hidden=false;document.querySelector('[data-research-entry-reference]')?.remove();return controller.render();}};
 controllers.set(document,controller);controller.render();
 document.addEventListener?.('rofo:profile-context-rendered',()=>syncReferenceTitle(document));
 eventTarget?.addEventListener('pageshow',event=>{if(event.persisted)controller.reenter();});
 eventTarget?.addEventListener('popstate',()=>controller.reenter());
 return controller;
}
if(typeof document!=='undefined'){try{startReference(document,location,typeof window==='undefined'?null:window);}catch{/* Optional context must never stop the interview. */}}
