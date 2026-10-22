/* Chicago presentation pilot. Search state stays in the existing Business Profile. */
(() => {
 'use strict';
 const root=document.querySelector('[data-map-search-pilot]');
 if(!root)return;
 const rows=[...root.querySelectorAll('[data-map-item]')],canvas=root.querySelector('[data-map-canvas]'),summary=root.querySelector('[data-map-summary]');
 const previous=root.querySelector('[data-map-previous]'),next=root.querySelector('[data-map-next]'),pages=Math.ceil(rows.length/12);
 let selected=0,page=0,loaded='',generation=0;
 function renderPage(){
  rows.forEach((row,index)=>{row.hidden=Math.floor(index/12)!==page;});
  for(const layer of canvas.querySelectorAll('[data-map-group]')){const visible=+layer.dataset.mapGroup===page;layer.style.display=visible?'':'none';layer.setAttribute('aria-hidden',String(!visible));}
  root.querySelector('[data-map-page-status]').textContent=`${page*12+1}–${Math.min(rows.length,(page+1)*12)} of ${rows.length}`;
  previous.disabled=page===0;next.disabled=page===pages-1;
 }
 function choose(index,remember=false){
  if(!Number.isInteger(index)||index<0||index>=rows.length)return;
  selected=index;page=Math.floor(index/12);renderPage();
  for(const button of root.querySelectorAll('[data-map-select]'))button.setAttribute('aria-pressed',String(+button.dataset.mapSelect===index));
  for(const marker of canvas.querySelectorAll('[data-rofo-choice]'))marker.setAttribute('aria-pressed',String(+marker.dataset.rofoChoice===index));
  const row=rows[index],link=row.querySelector('[data-map-link]'),name=link.textContent.replace(/ →$/,'');
  const heading=document.createElement('h3');heading.textContent=name;
  const description=document.createElement('p');description.textContent=row.dataset.description;
  const action=document.createElement('a');action.className='rofo-map__action';action.href=row.dataset.searchUrl;action.textContent=`Start a search in ${name}`;
  const guide=document.createElement('a');guide.href=link.href;guide.textContent='Read the area guide';
  const guideLine=document.createElement('p');guideLine.append(guide);
  const note=document.createElement('p');note.className='rofo-map__note';note.textContent='We’ll carry this area into your Business Profile. You can change it or compare other areas.';
  summary.replaceChildren(heading,description,action,guideLine,note);
  if(remember){const url=new URL(location.href);url.searchParams.set('area',row.dataset.areaSlug);if(url.href!==location.href)history.pushState(null,'',url);}
 }
 function restore(){
  const url=new URL(location.href),slug=url.searchParams.get('area');
  const index=slug?rows.findIndex(row=>row.dataset.areaSlug===slug):0;
  if(index<0){url.searchParams.delete('area');history.replaceState(null,'',url);}
  choose(index<0?0:index);
 }
 for(const button of root.querySelectorAll('[data-map-select]')){button.hidden=false;button.addEventListener('click',()=>choose(+button.dataset.mapSelect,true));}
 root.classList.add('rofo-map--ready');root.querySelector('[data-map-pages]').hidden=pages<2;
 previous.addEventListener('click',()=>{page=Math.max(0,page-1);renderPage();});
 next.addEventListener('click',()=>{page=Math.min(pages-1,page+1);renderPage();});
 window.addEventListener('popstate',restore);restore();
 const loading=canvas.querySelector('[data-map-loading]');if(loading)loading.hidden=false;
 const media=matchMedia('(max-width:760px)');
 async function load(){
  const src=media.matches?root.dataset.mobile:root.dataset.desktop;if(src===loaded)return;
  const revision=++generation;
  try{
   const response=await fetch(src,{credentials:'same-origin'});if(!response.ok)throw Error('map unavailable');
   const parsed=new DOMParser().parseFromString(await response.text(),'image/svg+xml'),svg=parsed.documentElement;
   if(svg.localName!=='svg'||parsed.querySelector('parsererror'))throw Error('invalid map');if(revision!==generation)return;
   canvas.replaceChildren(document.importNode(svg,true));loaded=src;
   for(const marker of canvas.querySelectorAll('[data-rofo-choice]')){
    const activate=()=>choose(+marker.dataset.rofoChoice,true);
    marker.addEventListener('click',activate);marker.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate();}});
    marker.setAttribute('aria-pressed',String(+marker.dataset.rofoChoice===selected));
   }
   renderPage();
  }catch(_){canvas.replaceChildren();const message=document.createElement('p');message.className='rofo-map__note';message.textContent='Map unavailable. Use the area guides below.';canvas.append(message);}
 }
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){load();observer.disconnect();}},{rootMargin:'150px'});observer.observe(root);
 media.addEventListener('change',()=>{if(loaded)load();});
})();
