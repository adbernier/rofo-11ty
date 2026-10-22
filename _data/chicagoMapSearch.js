'use strict';
const original = require('../data/maps/generated-manifest.json').byCityPath['/commercial-real-estate/IL/chicago/'];
const districts = require('./neighborhoodPages');
const sourcePath = '/commercial-real-estate/IL/chicago/';
const copy = {
 'chi-loop': "If your business needs to be close to Chicago’s finance, legal, or civic activity, start by exploring The Loop. West Loop is another option if you want a less traditional downtown office setting.",
 'chi-west-loop': "West Loop is worth a look if you want an office near central Chicago and access for your team. Compare The Loop for a more traditional downtown setting, or Fulton Market for a more creative office environment.",
 'chi-river-north': "River North is worth exploring if you meet clients and want an office near restaurants, hotels, and design businesses. Compare The Loop if a more traditional downtown setting matters more.",
 'chi-streeterville': "Need to be near medical institutions, hotels, or Michigan Avenue? Take a look at Streeterville, and compare River North for a broader mix of offices and services.",
 'chi-lincoln-park': "Lincoln Park is worth exploring for an office, shop, or service business serving North Side neighborhoods. Compare central Chicago if you need a downtown office setting."
};
function prepare(item) {
 const record = districts.find(d => d.canonical_neighborhood_path === item.url);
 if (!record?.commercial_area_id) throw Error('Chicago district identity missing: '+item.url);
 const evidence = record.commercial_location_model || districts.find(d=>d.commercial_area_id===record.commercial_area_id && d.commercial_location_model)?.commercial_location_model;
 if (copy[record.commercial_area_id] && !evidence) throw Error('Business summary requires existing intelligence: '+item.url);
 const params = new URLSearchParams({city:'Chicago',state:'IL',district:item.name,districtId:record.commercial_area_id,marketId:'chicago',source:'city',sourcePath,chicagoMap:'1'});
 return {...item,description:copy[record.commercial_area_id] || `Explore the ${item.name} guide to help decide what to investigate for your business.`,status:'',canonicalId:record.commercial_area_id,slug:record.slug,searchUrl:'/best-fit-locations/?'+params.toString(),evidencePath:evidence?.path||null};
}
const items=original.items.map(prepare),unmapped=original.unmapped.map(prepare);
module.exports = {...original,searchPilot:true,items,unmapped,locations:[...items,...unmapped].map(({name,canonicalId,slug,url})=>({name,canonicalId,slug,url}))};
