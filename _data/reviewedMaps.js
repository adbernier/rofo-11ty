'use strict';
// Checked-in static manifest: no runtime fetches, geocoding or recommendation changes.
const fs=require('fs'),path=require('path');const file=path.join(__dirname,'../data/maps/generated-manifest.json');module.exports=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{byCityPath:{},byDistrictPath:{},byPropertyPath:{},byDistrictReviewPath:{}};
