"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),source=require("./commercial-district-intelligence-scaling-v1-source");
const root=path.resolve(__dirname,"../.."),out=path.join(root,"data/internal/commercial-district-intelligence-scaling-v1");fs.mkdirSync(out,{recursive:true});
const write=(name,value)=>fs.writeFileSync(path.join(out,name),typeof value==="string"?value:`${JSON.stringify(value,null,2)}\n`);
for(const [name,value] of [["workflow-assessment.json",source.workflow],["batch-contract.json",source.batchContract],["batch-stop-conditions.json",source.stopConditions],["human-review-model.json",source.reviewModel],["editorial-duplication.json",source.editorialSafeguards],["recommended-batch-1.json",source.nextMarkets]])write(name,{schemaVersion:source.schemaVersion,data:value});
write("index.json",{schemaVersion:source.schemaVersion,referenceMarkets:source.referenceMarkets,nextSprint:source.nextSprint,marketCount:source.nextMarkets.length});
write("README.txt","Commercial District Intelligence Scaling v1\nFour-market assessment and governed ten-market batch contract. No public routes or Recommendation Intelligence behavior are defined here.\n");
const files=fs.readdirSync(out).filter(f=>f!=="artifact-manifest.json").sort();write("artifact-manifest.json",{schemaVersion:source.schemaVersion,artifacts:files.map(file=>{const b=fs.readFileSync(path.join(out,file));return{file,bytes:b.length,sha256:crypto.createHash("sha256").update(b).digest("hex")};})});
console.log("Wrote four-market scaling assessment and exact ten-market Batch 1 contract.");
