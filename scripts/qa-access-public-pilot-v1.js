const assert = require("assert");
const fs = require("fs");
const projection = require("../_data/accessIntelligencePilotV1");
const review = require("../data/internal/access-intelligence-v1/pilot-fact-review.json");
const selection = require("../data/internal/access-intelligence-v1/pilot-public-selection.json");

assert.strictEqual(projection.allowedGeographyIds.length,7);
assert.strictEqual(selection.selections.flatMap(x=>x.facts).length,15);
const rendered = projection.allowedGeographyIds.flatMap(id=>projection.byGeographyId[id].facts);
assert.strictEqual(rendered.length,15);
const blocked = review.facts.filter(f=>f.disposition!=="SELECT_PUBLIC_USEFUL"&&f.disposition!=="PROMOTE_TO_OBJECTIVE_ACCESS_READY").map(f=>f.id);
assert(blocked.every(id=>!rendered.some(f=>f.id===id)),"held or low-value fact entered public projection");
assert.strictEqual(projection.forGeography("union-square","retail"),null);
assert.strictEqual(projection.forGeography("mission-bay","retail"),null);
assert(projection.forGeography("mission-bay","office"));
assert(projection.forRoute("sodo"));
assert.strictEqual(projection.forRoute("downtown-seattle"),null);
assert(rendered.every(f=>f.sourceIds.length&&f.propertyTypes.length));
const copy=rendered.map(f=>`${f.label} ${f.relationship}`).join(" ");
assert(!/\b\d+(?:\.\d+)?\s*(?:mi|mile|minutes?)\b/i.test(copy));
assert(!/\b(access|transit|freight) score|\b(excellent|strong access|easy access|convenient|strategic|ideal|well connected|superior)\b/i.test(copy));
const partial=fs.readFileSync("_includes/partials/shared/access-location.njk","utf8");
const panel=fs.readFileSync("_includes/partials/space-type/sf-commercial-geography-experience.njk","utf8");
const route=fs.readFileSync("_includes/partials/neighborhood/sf-commercial-geography-context.njk","utf8");
assert(partial.includes("<dl")&&partial.includes("<dt")&&partial.includes("<dd"));
assert(panel.includes("accessIntelligencePilotV1.forGeography")&&route.includes("accessIntelligencePilotV1.forGeography"));
assert(panel.includes("geography.access.length and not accessLocation"));
assert.strictEqual((panel.match(/partials\/shared\/access-location\.njk/g)||[]).length,1);
const builtPages = [
  ["_site/commercial-real-estate/CA/san-francisco/office-space/index.html",["financial-district","soma","mission-bay"]],
  ["_site/commercial-real-estate/CA/sacramento/industrial-space/index.html",["power-inn-industrial"]],
  ["_site/commercial-real-estate/IN/indianapolis/industrial-space/index.html",["indianapolis-airport-logistics"]],
  ["_site/commercial-real-estate/AZ/phoenix/industrial-space/index.html",["airport-south-central-industrial"]],
  ["_site/commercial-real-estate/WA/seattle/industrial-space/index.html",["sodo-duwamish"]]
];
if (builtPages.every(([file])=>fs.existsSync(file))) {
  for (const [file,ids] of builtPages) {
    const html=fs.readFileSync(file,"utf8");
    ids.forEach(id=>assert(html.includes(`access-location-${id}-`),`${id} did not render`));
  }
  const sf=fs.readFileSync(builtPages[0][0],"utf8");
  const jackson=(sf.match(/<article[^>]+data-geography-panel="jackson-square"[\s\S]*?<\/article>/)||[])[0]||"";
  assert(!jackson.includes("access-location"),"non-pilot panel rendered Access module");
  const sodoRoute=fs.readFileSync("_site/commercial-real-estate/WA/seattle/sodo/index.html","utf8");
  assert(sodoRoute.includes("access-location-sodo-duwamish-route"),"compatible SODO route omitted shared module");
}
console.log("Access public pilot QA passed: 7 geographies, 15 governed facts, shared renderer, clean omission and no distance/score language.");
