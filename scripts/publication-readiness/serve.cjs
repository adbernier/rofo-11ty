// Loopback-only read-only preview. Not a production Worker or deployment entry point.
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../../..'),preview=path.join(root,'rehearsal'),baseline=process.env.BUILDING_RESEARCH_ENTRY_OUTPUT?path.resolve(process.env.BUILDING_RESEARCH_ENTRY_OUTPUT):path.join(root,'candidate/_site');
const router=require(path.join(root,'coordination/entry-router.cjs'));
http.createServer(async(req,res)=>{
 res.setHeader('X-Robots-Tag','noindex, nofollow');
 res.setHeader('Content-Security-Policy',"default-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:");
 const u=new URL(req.url,'http://127.0.0.1:8159');
 if(req.method!=='GET'){res.writeHead(405);return res.end('Read-only rehearsal');}
 if(u.pathname==='/best-fit-locations/'){
  const r=await router.onRequestGet({request:new Request(u),env:{}});
  res.writeHead(r.status,{Location:r.headers.get('Location'),'X-Preview-Router':'actual handler; local flags disabled'});return res.end();
 }
 const rel=decodeURIComponent(u.pathname).replace(/^\//,'');
 if(rel.includes('..')||rel.includes('\\')){res.writeHead(400);return res.end();}
 for(const dir of [baseline,preview]){
  let file=path.join(dir,rel);if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(fs.existsSync(file)&&fs.statSync(file).isFile()){
   const type={'.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json'}[path.extname(file)]||'application/octet-stream';
   res.setHeader('Content-Type',type);
   return fs.createReadStream(file).pipe(res);
  }
 }
 res.writeHead(404);res.end('No approved local target');
}).listen(8159,'127.0.0.1',()=>console.log('Read-only rehearsal: http://127.0.0.1:8159; fallback routing uses local disabled flags'));
