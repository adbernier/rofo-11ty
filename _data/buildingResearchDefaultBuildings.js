const buildings=require('./buildingPages');
module.exports=()=>{
 const selected=new Set(require('../lib/building-research/load-publication')().profiles.map(p=>p.canonicalPath));
 return selected.size?buildings.filter(b=>!selected.has(b.building_path)):buildings;
};
