'use strict';
// Deliberately not imported by Eleventy or the production build.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {render}=require('../../lib/building-research/presentation');
const geography=require('../../lib/maps/reviewed-geography');
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const args=process.argv.slice(2),arg=n=>args[args.indexOf(n)+1];
if(!args.includes('--manifest')||!args.includes('--out'))throw Error('Explicit --manifest and --out required; no default publication selection');
const manifest=path.resolve(arg('--manifest')),out=path.resolve(arg('--out')),repo=path.resolve(__dirname,'../..');
if(out===repo||out.startsWith(repo+path.sep))throw Error('Output must be outside production repository');
const records=JSON.parse(fs.readFileSync(manifest));
if(records.length!==860||new Set(records.map(r=>r.recordId)).size!==860)throw Error('Expected all 860 unique evidence subjects');
const counts=records.reduce((a,r)=>(a[r.market]=(a[r.market]||0)+1,a),{});
if(counts['san-francisco']!==64||counts.sacramento!==796||Object.keys(counts).length!==2)throw Error('Market envelope mismatch');
const inputs=args.includes('--correspondence')?JSON.parse(fs.readFileSync(arg('--correspondence'))):[];
const copy=args.includes('--copy')?JSON.parse(fs.readFileSync(arg('--copy'))):[];
const descriptions=new Map();
for(const row of copy){const id=row.recordId||row.subjectId,description=row.description||row.metadataProposal?.description||row.summary;if(!records.some(r=>r.recordId===id)||descriptions.has(id)||typeof description!=='string'||description.length>400)throw Error('Invalid subject-specific copy projection');descriptions.set(id,description);}
const publicProjection=args.includes('--projection')?JSON.parse(fs.readFileSync(arg('--projection'))):[];
const presentations=new Map(publicProjection.map(r=>[r.recordId,r.presentation]));
const decisions=new Map();
for(const d of inputs){
 if(decisions.has(d.recordId)||!records.some(r=>r.recordId===d.recordId&&r.market===d.market))throw Error('Duplicate/unknown correspondence');
 if(!['supported-existing','proposed-new','held-ambiguity'].includes(d.disposition))throw Error('Invalid disposition');
 if(d.disposition!=='held-ambiguity'){
  if(!Array.isArray(d.evidence)||!d.evidence.length||!d.reason)throw Error('Independent identity evidence required');
  if(!new RegExp('^/commercial-real-estate/building/CA/'+d.market+'/[a-z0-9-]+/$').test(d.canonicalPath))throw Error('Invalid canonical path');
  if(d.canonicalPath.includes('/601-townsend-st/')||d.canonicalPath.includes('/100-montgomery-st/'))throw Error('Protected canonical hold');
  if(d.disposition==='supported-existing'&&!fs.existsSync(path.join(repo,'_site',d.canonicalPath,'index.html')))throw Error('Existing canonical missing from baseline');
  if(d.disposition==='proposed-new'&&fs.existsSync(path.join(repo,'_site',d.canonicalPath,'index.html')))throw Error('Proposed canonical already exists');
 }
 decisions.set(d.recordId,d);
}
fs.mkdirSync(out,{recursive:true});
// Remove only files from this renderer's preceding exact manifest. A changed
// correspondence selection must not leave stale review paths in the rehearsal.
const previous=path.join(out,'output-manifest.json');
if(fs.existsSync(previous)){
 const prior=JSON.parse(fs.readFileSync(previous));
 if(prior.subjects!==860||!Array.isArray(prior.files))throw Error('Unrecognized output directory');
 for(const f of prior.files){
  if(path.isAbsolute(f.path)||f.path.split(/[\\/]/).includes('..'))throw Error('Unsafe previous output path');
  const owned=path.join(out,f.path);if(fs.existsSync(owned))fs.unlinkSync(owned);
 }
 fs.unlinkSync(previous);
}else if(fs.readdirSync(out).length)throw Error('Output must be empty or owned by a preceding render manifest');
const entries=[],paths=new Set();
for(const record of records.map(r=>({...r,claims:[...r.claims].sort((a,b)=>a.id.localeCompare(b.id))})).sort((a,b)=>a.recordId.localeCompare(b.recordId))){
 const d=decisions.get(record.recordId)||{recordId:record.recordId,market:record.market,disposition:'held-ambiguity',canonicalPath:null,existingRecordIds:[],evidence:[],reason:'Independent canonical correspondence pending',protectedHolds:[]};
 if(d.canonicalPath){if(paths.has(d.canonicalPath))throw Error('Duplicate proposed canonical');paths.add(d.canonicalPath);}
 if(record.claims.some(c=>c.scope!=='building'||!c.sourceHash||!c.sourceVersion||!c.sourceTimestamp||!c.evidence.some(e=>/^https:\/\//.test(e))))throw Error('Claim provenance gate');
 const previewPath='/review/'+hash(record.recordId).slice(0,20)+'/';
 const target=d.canonicalPath||previewPath;
 const city=geography.cities.find(c=>c.key==='CA/'+record.market);
 if(!city?.url)throw Error('Supported city geography missing');
 const html=render(record,d,{previewPath,cityPath:city.url,description:descriptions.get(record.recordId),...presentations.get(record.recordId)});
 const outputPath=target.slice(1)+'index.html';
 fs.mkdirSync(path.dirname(path.join(out,outputPath)),{recursive:true});fs.writeFileSync(path.join(out,outputPath),html);
 entries.push({...d,address:record.address,outputPath,previewPath:target,htmlSha256:hash(html),evidenceQualified:true,presentationQualified:false,releaseReady:false,publicationAuthorized:false,visualQA:'pending',claims:record.claims});
}
for(const market of Object.keys(counts))for(const size of ['desktop','mobile']){
 const rel=`assets/reviewed-maps/city-CA-${market}-${size}.svg`,dest=path.join(out,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(repo,rel),dest);
}
fs.writeFileSync(path.join(out,'subject-manifest.json'),JSON.stringify(entries,null,2)+'\n');
fs.writeFileSync(path.join(out,'release-ready-manifest.json'),'[]\n');
fs.writeFileSync(path.join(out,'public-metadata-intent.json'),JSON.stringify({previewRobots:'noindex,nofollow',previewHttpHeader:'X-Robots-Tag: noindex, nofollow',intendedPublicRobots:'index,follow only after release and publication approval',canonicalPolicy:'true existing path or independently established local proposal; none for held subjects',publicationAuthorized:false},null,2)+'\n');
const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name!=='output-manifest.json')files.push({path:path.relative(out,p),sha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size});}}walk(out);
fs.writeFileSync(path.join(out,'output-manifest.json'),JSON.stringify({inputSha256:hash(fs.readFileSync(manifest)),counts,subjects:entries.length,files},null,2)+'\n');
console.log(JSON.stringify({subjects:entries.length,counts,canonicalDecisions:inputs.length,releaseReady:0,publicationAuthorized:false,out}));
