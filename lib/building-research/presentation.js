'use strict';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const {ancestry,breadcrumbView}=require('./breadcrumbs');
const path=require('path'),nunjucks=require('nunjucks');
const shell=new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname,'../../_includes')),{autoescape:true});
shell.addFilter('queryEncode',v=>encodeURIComponent(String(v||'')));
const cityNames = {'san-francisco':'San Francisco', sacramento:'Sacramento'};
function continuation(record, sourcePath, intent) {
  const params = new URLSearchParams({city:cityNames[record.market], state:'CA', marketId:record.market, source:'building', sourcePath, journey:'new'});
  // Only an explicit caller-supplied user choice can establish space intent.
  if (intent) {
    if (!['office','retail_service','industrial_flex'].includes(intent)) throw Error('Unsupported explicit user intent');
    params.set('propertyType', intent);
  }
  return '/best-fit-locations/?' + params;
}
function fact(claim) {
  if (claim.predicate === 'floors') {
    if(claim.sourceId!=='san-francisco:official:5kya-mfst')throw Error('Source-specific story/floor semantics require a reviewed presentation adapter');
    return `Recorded above-ground floors: ${claim.value}`;
  }
  if (claim.predicate === 'year-built') return `Historical year recorded: ${claim.value}`;
  const value=String(claim.value);
  // Keep the source-specific measurements and dated model scope above the fold; attribution follows below.
  return value.includes('USA Structures records') ? value.split(' USA Structures —')[0] : value;
}
function render(record, decision, options) {
  const city = cityNames[record.market];
  if (!city) throw Error('Unsupported market');
  const breadcrumbs=breadcrumbView(ancestry({...record,address:options.displayName||record.address},decision,options.publicRoutes?{exists:url=>options.publicRoutes.has(url)}:{}));
  const canonical = decision.canonicalPath;
  const displayName=options.displayName||record.address;
  const sourcePath = canonical || options.previewPath;
  const sf = record.market === 'san-francisco';
  const mapContext=require('./map-context').render(record);
  const copy=require('./editorial').project(record,options);
  const facts=copy.facts.map(f=>`<div data-copy-claim-id="${esc(f.claimId)}"><dt>${esc(f.label)}</dt><dd><span data-fact-value>${esc(f.value)}</span>${f.unit?' '+esc(f.unit):''}</dd></div>`).join('');
  const citation=record.claims[0].evidence.find(e=>/^https:\/\//.test(e));
  const mapHTML=mapContext.html.replace(/Approximate USA Structures model reference point for /g,'Approximate building location for ').replace(/Approximate model point/g,'Approximate location').replace(/Area reference key · comparison links, not building district membership/g,'San Francisco area guides');
  const mapCaption=sf?'Area reference map; the building is not marked.':'The marker does not identify an entrance or surveyed point.';
  const dateNote=sf?esc(copy.essential):'';
  const receipts=record.claims.map(c=>`<article data-source-claim-id="${esc(c.id)}"><h3>${c.predicate==='floors'?'Above-ground floors':c.predicate==='year-built'?'Construction year record':sf?'Recorded height':'Building footprint record'}</h3><p data-original-value>${esc(c.value)}</p><p><a href="${esc(c.evidence.find(e=>/^https:\/\//.test(e)))}">Read the source record</a></p><dl class="research-receipt"><dt>${sf?'Inventory record collected':'Record produced'}</dt><dd data-source-date>${esc(c.sourceTimestamp)}</dd><dt>Source identifier</dt><dd data-source-id>${esc(c.sourceId)}</dd><dt>Assertion</dt><dd data-source-predicate>${esc(c.predicate)}</dd><dt>Temporal status</dt><dd data-temporal-status>${esc(c.temporalStatus)}</dd><dt>Source record</dt><dd data-receipt-id>${esc(c.id)}</dd><dt>Version</dt><dd data-source-version>${esc(c.sourceVersion)}</dd><dt>Source hash</dt><dd data-source-hash>${esc(c.sourceHash)}</dd><dt>Subject</dt><dd data-source-scope>${esc(c.scope)}</dd></dl></article>`).join('');
  const schema = {'@context':'https://schema.org','@type':'Place', name:displayName, address:{'@type':'PostalAddress',streetAddress:options.publishedAddress||record.address,addressLocality:city,addressRegion:'CA',addressCountry:'US'}};
  if(canonical) schema.url = `https://www.rofo.com${canonical}`;
  const content=`<section class="research-hero"><div class="research-opening"><p class="eyebrow">BUILDING RESEARCH · ${esc(city.toUpperCase())}, CA</p><h1>${esc(copy.name)}</h1>${options.identityContext?`<p>${esc(options.identityContext)}</p><p class="meta">${(options.identityLinks||[]).map(link=>`<a href="${esc(link.url)}">${esc(link.label)}</a>`).join(' · ')}</p>`:''}<p data-knowledge-summary>${esc(copy.summary)}</p><section class="research-compact-facts"><h2>About this building</h2><dl class="research-facts">${facts}</dl>${!sf?`<p data-measurement-scope>${esc(copy.essential)}</p>`:''}${sf?`<p class="meta" data-fact-date>${dateNote}</p>`:''}<p class="meta" data-measurement-source><a href="${esc(citation)}">${sf?'City inventory':'USA Structures'}</a></p>${copy.yearConflict?`<p class="research-year-conflict" data-year-conflict>${esc(copy.yearConflict)}</p>`:''}</section><p class="research-availability"><strong>Availability not verified.</strong></p><a class="btn btn-primary" data-building-research-continuation href="${esc(continuation(record,sourcePath,options.intent))}">Find space in ${esc(city)}</a><p>Tell us what your business needs.</p></div><aside class="research-location"><h2>${sf?'Explore San Francisco areas':'Approximate building location'}</h2><figure>${mapHTML}<figcaption>${esc(mapCaption)}</figcaption></figure><a href="${esc(options.cityPath)}">Explore ${esc(city)} areas</a></aside></section><section class="panel"><h2>What to check</h2>${copy.checks.map(q=>`<p>${esc(q)}</p>`).join('')}</section><section class="panel" id="sources-and-research"><h2>Sources and research</h2><p>${sf?'San Francisco Tall Building Inventory, published by the City and County of San Francisco / GSA - City Administrator\'s Office.':'USA Structures — Oak Ridge National Laboratory (ORNL) and FEMA Geospatial Response Office, distributed by Esri. Sacramento County GIS provides address context.'} <a href="${esc(citation)}">View the building record</a></p><details><summary>Source details and methodology</summary>${!sf?`<p class="meta" data-production-date>Record produced <time datetime="${esc(copy.productionDate)}">${esc(copy.productionDateText)}</time>.</p>`:''}<p>${sf?'Historical inventory figures do not establish present dimensions or use. DBI permitting plans / BORP are source origins, distinct from the dataset publisher. Area-map markers do not identify this building or establish district membership.':'The footprint is a dated model of ground coverage, not total floor area or rentable space. The source category is a historical model label, not confirmation of current or permitted use. The approximate location is a source model reference point, not an entrance, surveyed point, parcel boundary or footprint polygon.'}</p><p>${esc(mapContext.caption)}</p><p>${sf?'Factual fields selected and reformatted under the source’s PDDL terms. No source photograph or narrative reproduced.':'USA Structures is distributed under CC BY 4.0. Sacramento County publisher CC0 text and CC BY 4.0 link differ; conservative attribution and change notice retained.'}</p><p>Changes: selected fields, address correspondence, formatting and explanatory notes. No endorsement. Historical records do not establish current occupancy, permitted use, suitability or ownership.</p>${sf?'<p><a href="https://data.sf.gov/api/views/5kya-mfst.json">Publishing-department metadata</a></p>':''}${receipts}<p><a href="${sf?'https://opendatacommons.org/licenses/pddl/1-0/':'https://creativecommons.org/licenses/by/4.0/'}">Source license terms</a></p></details></section>`;
  return shell.render('partials/building-research-shell.njk',{
    title:copy.name+' · Building Research · Rofo',description:copy.description,canonical:canonical?'https://www.rofo.com'+canonical:null,
    publicMetadata:Boolean(options.publicMetadata),schemaJSON:JSON.stringify(schema).replace(/</g,'\\u003c'),
    crumbsHTML:breadcrumbs.html,content,disposition:decision.disposition,
    page:{url:sourcePath},city:{city,state_abbr:'CA',slug:record.market}
  });
}
module.exports = {render, continuation, fact};
