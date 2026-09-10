const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const source = require("./access-intelligence-v1-source");
const root = path.join(process.cwd(), "data/internal/access-intelligence-v1");
const stable = value => JSON.stringify(value, null, 2) + "\n";
fs.mkdirSync(root, { recursive: true });
const write = (name, value) => fs.writeFileSync(path.join(root, name), typeof value === "string" ? value : stable(value));
const facts = source.markets.flatMap(m => m.relationships.flatMap(r => r.facts));
const counts = Object.fromEntries(["OBJECTIVE_ACCESS_READY","SOURCE_AVAILABLE_NEEDS_REVIEW","SOURCE_NEEDED","CONFLICTED","NOT_MATERIAL"].map(k => [k, facts.filter(f => f.publicEligibility === k).length]));
const relationships = source.markets.flatMap(m => m.relationships);
const eligible = relationships.filter(r => r.referencePoint.distanceEligible).length;
const referenceMethodAvailable = relationships.filter(r => r.referencePoint.methodAvailable).length;
const totalRelationships = source.markets.reduce((n,m) => n + m.relationships.length, 0);
const contract = {
  schemaVersion: source.schemaVersion,
  evidenceLevels: ["OBJECTIVE_ACCESS_FACT","CONTEXTUAL_INTERPRETATION","PERSONALIZED_ACCESS_CONCLUSION"],
  categories: ["ROAD","RAIL_TRANSIT","AIRPORT","PORT_FREIGHT","LOCAL_ORIENTATION"],
  measurementTypes: ["WITHIN_GEOGRAPHY","ADJACENT_TO_GEOGRAPHY","STRAIGHT_LINE_DISTANCE","ROAD_DISTANCE","WALK_DISTANCE","TRANSIT_SERVICE_PRESENT","CORRIDOR_RELATIONSHIP"],
  referenceMethods: ["REVIEWED_GEOGRAPHY_CENTROID","REVIEWED_LABEL_POINT","REPRESENTATIVE_ANCHOR","DETERMINISTIC_BOUNDED_REFERENCE","DESCRIPTIVE_RELATIONSHIP_ONLY"],
  precision: { internal: "Retain source precision and method.", public: { underOneMile: "nearest sensible 0.1 mile", oneToTenMiles: "nearest sensible 0.5 or whole mile", overTenMiles: "whole miles" }, rule: "Never display a distance without a reviewed reference point and measurement method." },
  freshnessClasses: ["DURABLE_INFRASTRUCTURE","SERVICE_DEPENDENT","TIME_SENSITIVE"],
  publicEligibilityStates: ["OBJECTIVE_ACCESS_READY","SOURCE_AVAILABLE_NEEDS_REVIEW","SOURCE_NEEDED","CONFLICTED","NOT_MATERIAL"],
  publicFactMaximum: 4,
  prohibited: ["access scores", "star ratings", "comparative superiority", "commute or logistics conclusions", "schedules", "frequencies", "live travel times", "property-level inference"]
};
const normalization = {
  transitOperators: ["BART","SFMTA","Caltrain","SacRT","IndyGo","Valley Metro","Sound Transit"].map(name => ({ name, normalizedCategory: "RAIL_TRANSIT", identityPreserved: true })),
  roads: ["I-80","US 50","I-65","I-70","I-465","I-10","I-17","Loop 101","I-5","I-90","SR 99","SR 519"].map(name => ({ name, normalizedCategory: "ROAD", identityPreserved: true })),
  conclusion: "One contract preserves agency and infrastructure identity while normalizing semantics."
};
const readiness = source.markets.map(m => ({ marketId: m.id, total: m.relationships.length, referenceMethodAvailable: m.relationships.filter(r => r.referencePoint.methodAvailable).length, distanceEligible: m.relationships.filter(r => r.referencePoint.distanceEligible).length, descriptiveOnly: m.relationships.filter(r => !r.referencePoint.methodAvailable).length, relationships: m.relationships.map(r => ({ geographyId: r.geographyId, referenceMethod: r.referencePoint.method, methodAvailable: r.referencePoint.methodAvailable, reviewedCoordinatesPresent: Boolean(r.referencePoint.coordinates), distanceEligible: r.referencePoint.distanceEligible })) }));
const automation = [
  { component: "schema validation, stable ordering, precision formatting, coordinate distance once inputs are reviewed", classification: "DETERMINISTIC" },
  { component: "official station and infrastructure inventories", classification: "SOURCE_AUTOMATABLE_WITH_QA" },
  { component: "customer usefulness, geography relationship, reference-point selection", classification: "HUMAN_REVIEW_REQUIRED" },
  { component: "inferring boundaries, suitability, commute quality, live conditions", classification: "UNSAFE_TO_AUTOMATE" }
];
const interpretations = [
  ["RAIL_SERVED_DISTRICT", "Reviewed service within geography plus stable service evidence"],
  ["TRANSIT_CORRIDOR", "Reviewed corridor relationship and service presence"],
  ["FREEWAY_ORIENTED_OPERATING_AREA", "Reviewed road relationship plus operating-area evidence"],
  ["AIRPORT_ADJACENT_EMPLOYMENT_AREA", "Reviewed adjacency plus airport employment relationship"],
  ["PORT_FREIGHT_DISTRICT", "Reviewed port/freight infrastructure within geography"],
  ["MULTIMODAL_DOWNTOWN", "At least two reviewed transport modes within the geography"],
  ["ARTERIAL_COMMERCIAL_CORRIDOR", "Reviewed corridor identity and arterial relationship"]
].map(([id, minimumEvidence]) => ({ id, minimumEvidence, status: "V2_METHOD_REQUIRED", publicEligible: false }));
source.markets.forEach(m => write(`${m.id}.json`, { schemaVersion: source.schemaVersion, market: { id: m.id, label: m.label, municipality: m.municipality, state: m.state }, excludedMunicipalities: m.excludedMunicipalities, relationships: m.relationships }));
write("contract.json", contract); write("source-registry.json", source.sourceRegistry); write("normalization-report.json", normalization); write("geography-coordinate-readiness.json", { totalRelationships, referenceMethodAvailable, referenceMethodAvailablePercent: Number((referenceMethodAvailable/totalRelationships*100).toFixed(1)), reviewedCoordinatesPresent: eligible, distanceEligible: eligible, percent: Number((eligible/totalRelationships*100).toFixed(1)), conclusion: "Reference methods exist for many geographies, but no reviewed coordinates are imported into v1; deterministic distance is therefore blocked rather than inferred." , markets: readiness }); write("automation-feasibility.json", automation); write("future-interpretations.json", interpretations);
write("index.json", { schemaVersion: source.schemaVersion, generatedAt: "2026-09-09", markets: source.markets.map(m => ({ id: m.id, file: `${m.id}.json`, relationships: m.relationships.length, facts: m.relationships.reduce((n,r)=>n+r.facts.length,0) })), totals: { markets: source.markets.length, relationships: totalRelationships, candidateFacts: facts.length, ...counts, averageFactsPerGeography: Number((facts.length/totalRelationships).toFixed(2)), conflicts: facts.filter(f=>f.publicEligibility==="CONFLICTED").length }, customerUse: { publicFactMaximum: 4, proposedPilot: ["financial-district","soma","mission-bay","power-inn-industrial","indianapolis-airport-logistics","airport-south-central-industrial","sodo-duwamish"] }, personalizedBridge: { requirementSignals: ["employee commute importance","customer access","airport frequency","regional distribution","supplier access","transit preference","vehicle dependency"], rule: "Future Requirement logic may interpret reviewed facts; v1 never ranks or recommends." }, propertyBridge: { rule: "Property facts require a property reference point and separate provenance; geography facts never inherit to a building.", status: "NOT_IMPLEMENTED" } });
write("README.txt", "Access Intelligence v1\n\nInternal objective-location-fact contract and five-market calibration. No file in this directory is a public adapter. Level 1 facts do not imply Level 2 interpretations or Level 3 personalized conclusions. Distance is disallowed without a reviewed reference point and measurement method.\n\nSeven-geography pilot review (2026-09-10)\n\nThe pilot artifacts certify a bounded set of customer-useful, non-distance facts. No reviewed coordinates were imported. All seven pilot geographies therefore use corridor, service, within-area, or adjacency relationships and are READY_WITH_NON_DISTANCE_FACTS_ONLY. The artifacts are review inputs, not a public adapter.\n");
const files = fs.readdirSync(root).filter(x => x !== "artifact-manifest.json").sort();
write("artifact-manifest.json", { schemaVersion: source.schemaVersion, files: files.map(file => ({ file, sha256: crypto.createHash("sha256").update(fs.readFileSync(path.join(root,file))).digest("hex"), bytes: fs.statSync(path.join(root,file)).size })) });
console.log(`Built Access Intelligence v1: ${source.markets.length} markets, ${totalRelationships} geographies, ${facts.length} facts.`);
