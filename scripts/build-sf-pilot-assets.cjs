const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
fs.writeFileSync(path.join(root,'functions/_sf-pilot/asset-versions.mjs'),`// Generated from asset bytes; no clock, environment or secret inputs.\nexport const ASSET_VERSIONS = ${JSON.stringify({css:hash('assets/sf-pilot.css'),js:hash('assets/sf-pilot.js'),interview:hash('js/requirement-prototype.js')},null,2)};\n`);
