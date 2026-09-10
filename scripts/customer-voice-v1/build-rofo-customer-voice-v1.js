"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const voice = require("./customer-voice-v1");
const readiness = require("../../lib/recommendations/private-recommendation-readiness");
const foundation = require("../../_data/sacramentoIndustrialFlexEvidenceFoundation");
const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data/internal/rofo-customer-voice-v1");
const REVIEW = path.join(ROOT, "visual-review/rofo-customer-voice-v1");
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(path.join(REVIEW, "html"), { recursive: true });
const stable = value => JSON.stringify(value, null, 2) + "\n";
const writeJson = (name, value) => fs.writeFileSync(path.join(OUT, name), stable(value));
const dependencies = { accessFoundation: require("../../_data/sfAccessFoundationV0"), compositionFoundation: require("../../_data/sfOfficeCompositionFoundation"), sfOfficeModel: require("../../_data/sfOfficeRecommendationModel"), sfRetailFoundation: require("../../_data/sfRetailCompositionFoundation"), sfIndustrialFlexFoundation: require("../../_data/sfIndustrialFlexCompositionFoundation"), sanDiegoIndustrialFlexFoundation: require("../../_data/sanDiegoIndustrialFlexCompositionFoundation"), northOrangeCountyIndustrialFlexFoundation: require("../../_data/northOrangeCountyIndustrialFlexEvidenceFoundation"), phoenixIndustrialFlexFoundation: require("../../_data/phoenixIndustrialFlexEvidenceFoundation"), indianapolisIndustrialFlexFoundation: require("../../_data/indianapolisIndustrialFlexEvidenceFoundation"), sacramentoIndustrialFlexFoundation: foundation, districtGeography: require("../../_data/requirementPrototypeDistrictGeography"), sacramentoIndustrialFlexEnabled: true };
function requirement(id, activities, summary) { return { id, schemaVersion: "requirement:v1", propertyTypes: ["industrial_flex"], activities, businessContext: { summary }, locationLogic: { marketAnchor: { marketId: "sacramento", geographyId: "sacramento", marketName: "Sacramento", city: "Sacramento", state: "CA", displayName: "Sacramento, CA", source: "canonical_commercial_geography" }, specificPreference: { candidateDistrictIds: [], candidateDistrictNames: [] } }, criteria: [] }; }
const scenarios = [
  ["two-peer", requirement("voice-two-peer", ["store","receive","ship_distribute"], "Warehouse and distribution operation"), "TWO_PEER_FULL"],
  ["one-peer", requirement("voice-one-peer", ["make_assemble","store"], "Manufacturing and production operation"), "ONE_PEER_BOUNDED"],
  ["investigate", requirement("voice-investigate", [], "Industrial or flex space"), "INVESTIGATE"]
].map(([id, req, mode]) => { const snapshot = readiness.evaluateRecommendationReadiness(req, dependencies); return { id, requirement: req, mode, snapshot, presentation: voice.projectSnapshot(req, snapshot, mode) }; });

const auditedFiles = [
  "functions/operator/location-brief-v2/[publicId].js", "functions/location-brief/[publicId].js", "functions/location-requirement/index.js",
  "functions/property-requirement/[publicId].js", "functions/_shared/project-snapshot.js", "pages/location-requirement.njk",
  "pages/example-location-brief-detail.njk", "_includes/partials/neighborhood/public-decision-surface.njk",
  "_includes/partials/neighborhood/commercial-market-evidence.njk"
];
const findings = [];
for (const relativePath of auditedFiles) {
  const text = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
  text.split("\n").forEach((line, index) => findings.push(...voice.lintText(line, { surface: relativePath, line: index + 1, excerpt: line.trim().slice(0, 220) })));
}
const emptyFindings = findings.filter(x => ["not provided","not stated","not a stated priority","unknown"].includes(x.term));
const briefSource = fs.readFileSync(path.join(ROOT, "functions/operator/location-brief-v2/[publicId].js"), "utf8");
const customerStrings = [...briefSource.matchAll(/(["'`])([^\n]{28,220}?)\1/g)].map(match => match[2]).filter(x => /[a-z]{4}/i.test(x));
const redundancy = [];
for (let i=0;i<customerStrings.length;i++) for (let j=i+1;j<customerStrings.length;j++) { const score=voice.similarity(customerStrings[i],customerStrings[j]); if (score >= .72 && customerStrings[i] !== customerStrings[j]) redundancy.push({ surface:"Location Brief v2", score:Number(score.toFixed(3)), a:customerStrings[i], b:customerStrings[j] }); }
redundancy.sort((a,b)=>b.score-a.score);

const contract = {
  schemaVersion: "rofo-customer-voice:v1", principle: "INTERNAL_CONTRACT_NE_CUSTOMER_LANGUAGE",
  voice: ["KNOWLEDGEABLE","CLEAR","USEFUL","CONCISE","CONFIDENT_BUT_CALIBRATED","HUMAN"],
  sequence: ["CONCLUSION","EXPLANATION","NEXT_QUESTION"],
  moduleQuestions: { recommendation:"Why should I consider this area?", comparison:"How are these locations different?", verification:"What do we still need to confirm?", examples:"What kinds of buildings are here?", cta:"What happens next?" },
  omissionRule: "Do not render a value merely because the canonical system has a field for it. Omit empty, unknown, unstated, or non-material values unless the absence itself affects the decision.",
  repetitionRule: "A conclusion may appear once. Repeat it only when the later occurrence adds a different decision-relevant consequence.",
  evidenceRule: "Translate supported intelligence; never alter provenance, confidence, recommendation logic, or availability boundaries.",
  toneBoundaries: { salesy:["perfect","amazing","unbeatable","ideal","incredible"], overconfident:["best","clearly superior","definitely","guaranteed"], robotic:["applicability","bounded universe","deterministic ordering"], defensive:["repeated guarantees and investigation disclaimers"] },
  creVocabulary: ["office","retail","warehouse","distribution","production","manufacturing","contractor space","service-industrial","office/warehouse","loading","clear height","power","yard","parking","building size","location","district","corridor","building","space"]
};
const preferred = [
  ["reviewed evidence supports", "State the supported conclusion directly"], ["bounded", "Name the actual places included, once, if scope matters"],
  ["applicability", "good starting point for / commonly considered for / relevant for"], ["investigate", "What to confirm / What we'll check / Before choosing a space"],
  ["representative property", "Example building"], ["representative environment", "Example of the area / Typical setting"],
  ["property capabilities", "the specific building features you need"], ["requirement-specific", "for your search"],
  ["not a stated priority", "Omit the field"], ["operating environment", "district / area / building mix / industrial setting, according to meaning"]
].map(([internal, customer]) => ({ internal, customer, rule:"CONTEXTUAL_TRANSLATION_NOT_STRING_REPLACEMENT" }));
const examples = [
  ["district description", "Official Northgate project evidence supports a service operating environment.", "Northgate / North Market has lighter warehouse, service-industrial and office/warehouse space."],
  ["recommendation explanation", "Industrial-led applicability.", "Start here for contractor, service-industrial and office/warehouse needs."],
  ["comparison", "The candidates differ in industrial composition.", "Northgate is lighter and more multi-tenant; Power Inn has deeper warehouse, distribution and production space."],
  ["uncertainty", "Property capabilities require investigation.", "We'll confirm loading, power, parking and permitted use at each building."],
  ["property verification", "Reviewed evidence supports industrial use.", "About this building: reviewed as an industrial property."],
  ["CTA", "Proceed to fulfillment projection.", "Find spaces that fit →"],
  ["empty field", "Parking: Not a stated priority", "Omit the parking row."],
  ["representative building", "Representative environment", "Examples in the area"],
  ["access fact", "OBJECTIVE_ACCESS_READY: TRANSIT_SERVICE_PRESENT", "Light rail serves the district."],
  ["Requirement question", "Specify employee-origin access preference.", "Where do most employees travel from?"],
  ["email", "Your requirement has entered fulfillment.", "We have your search and will follow up with matching spaces or a few focused questions."]
].map(([surface,bad,better])=>({ surface, bad, better }));
const surfaceAudit = [
  { surface:"Sacramento Location Brief", status:"NEEDS_PRODUCTION_TRANSLATION", findings:["internal scope and evidence language","repeated district character","non-material parking row","defensive example-building copy"], recommendation:"Use the approved prototype after operator review." },
  { surface:"Public District Intelligence", status:"POSITIVE_CALIBRATION", findings:["What it's like, Common here, What stands out, Worth knowing and Compare with are strong patterns","older public-decision partials retain Representative environments and Things to weigh"], recommendation:"Standardize current Commercial District Intelligence labels; defer broad rewrite." },
  { surface:"Requirement flow", status:"TARGETED_REVIEW", findings:["questions are mostly customer-oriented","some system-state and research framing remains"], recommendation:"Prefer direct business questions and explain why only when it changes the answer." },
  { surface:"Project Snapshot", status:"TARGETED_REVIEW", findings:["Business / Use is understandable","Research Approach and Work Pattern can read like storage labels"], recommendation:"Present Business, Space, Growth, How the team works, and How Rofo should help; keep storage unchanged." },
  { surface:"Customer email and fulfillment", status:"TARGETED_REVIEW", findings:["handoff language can expose projection/fulfillment mechanics","confirmation copy should state what Rofo received and what happens next"], recommendation:"Separate broker operational detail from customer confirmation." },
  { surface:"Property cards", status:"POSITIVE_CALIBRATION", findings:["About this building, Common in this district and What to confirm are preferred","legacy Area pattern/Property verified/Investigate labels should not return"], recommendation:"No redesign; reuse current public vocabulary." },
  { surface:"Access Intelligence v1", status:"COMPATIBLE", findings:["Access & location is natural","fact rows should state infrastructure and relationship directly","internal eligibility/measurement enums must never render"], recommendation:"No schema change needed." }
];
const beforeAfter = { invariant: { foundationVersion: foundation.schemaVersion, scenarios: scenarios.map(x => ({ id:x.id, readiness:x.snapshot.readiness, shortlist:x.snapshot.shortlist.map(y=>y.districtId) })) }, before: { heading:"Peer locations worth investigating", scope:"This is a bounded City of Sacramento Industrial/Flex comparison.", labels:["Industrial-led applicability","Why consider this location","Things to weigh","Representative environments","How they differ","What Rofo will investigate"], nonMaterialRow:"Parking — Not a stated priority" }, after: scenarios.map(x => ({ id:x.id, presentation:x.presentation })) };
writeJson("voice-contract.json", contract); writeJson("preferred-language.json", preferred); writeJson("flagged-language.json", { auditedFiles, findings }); writeJson("examples.json", examples); writeJson("surface-audit.json", surfaceAudit); writeJson("sacramento-brief-before-after.json", beforeAfter); writeJson("qa-report.json", { generatedAt:"2026-09-09", baseline:{ jargonFindings:135, redundancyFindings:7, emptyNonMaterialFindings:9 }, currentAudit:{ jargonFindings:findings.filter(x=>x.rule==="INTERNAL_JARGON").length, sentenceComplexityFindings:findings.filter(x=>x.rule==="SENTENCE_COMPLEXITY").length, redundancyFindings:redundancy.length, emptyNonMaterialFindings:emptyFindings.length }, closestRedundancyPairs:redundancy.slice(0,20), productionProjection:"lib/presentation/customer-voice-v1.js", status:"PRODUCTION_INTEGRATED" });
fs.writeFileSync(path.join(OUT,"README.txt"), "Rofo Customer Voice & Language System v1\n\nShared customer presentation contract, audits, examples and Sacramento calibration. Canonical intelligence remains authoritative; Location Brief v2 projects it through lib/presentation/customer-voice-v1.js. Run npm run build:customer-voice-v1 and npm run qa:customer-voice-v1.\n");

const esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
function page(model, before=false) { const cards=(model.locations||[]).map(location=>`<article class="card"><p class="kicker">${before?"Industrial-led applicability":"Area to compare"}</p><h2>${esc(location.name)}</h2><p class="distinction">${esc(location.distinction)}</p><h3>${before?"Why consider this location":"Why consider it"}</h3><ul>${location.why.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>${before||location.worth.length?`<h3>${before?"Things to weigh":"Worth knowing"}</h3><ul>${location.worth.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}<h3>${before?"Representative environments":"Examples in the area"}</h3><p>${location.examples.map(esc).join(" · ")}</p></article>`).join(""); const comparison=model.comparison?.length?`<section><h2>How they differ</h2><div class="compare">${model.comparison.map(row=>`<div><strong>${esc(row.label)}</strong>${row.values.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`).join("")}</div></section>`:""; return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rofo Customer Voice v1</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f8fc;color:#13223a;font:16px/1.5 Arial,sans-serif;overflow-wrap:anywhere}.top{height:64px;background:#fff;border-bottom:1px solid #d9e2ec;padding:18px 5vw;font-weight:800}.wrap{max-width:1080px;margin:auto;padding:48px 22px 80px}.eyebrow{color:#2457cf;text-transform:uppercase;letter-spacing:.1em;font-size:12px;font-weight:800}h1{font-size:clamp(38px,6vw,68px);line-height:1.02;letter-spacing:-.04em;margin:8px 0 14px}h2{font-size:26px;line-height:1.15}.intro{font-size:19px;color:#52637a;max-width:760px}.search{background:#eaf1ff;border-radius:12px;padding:18px 22px;margin:28px 0}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin:26px 0}.card,section{background:#fff;border:1px solid #d9e2ec;border-radius:14px;padding:26px}.kicker{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#2457cf;font-weight:800}.distinction{font-size:18px;color:#52637a}.compare>div{display:grid;grid-template-columns:180px 1fr 1fr;border-top:1px solid #d9e2ec;padding:12px 0;gap:16px}.confirm{margin-top:20px}.cta{display:inline-block;background:#2457cf;color:white;text-decoration:none;border-radius:8px;padding:13px 18px;font-weight:700}@media(max-width:650px){.wrap{padding:30px 16px 60px}.grid{grid-template-columns:1fr}.compare>div{grid-template-columns:1fr}.compare span{padding-left:10px;border-left:3px solid #dce7ff}h1{font-size:38px}.card,section{padding:20px}}</style></head><body><div class="top">rofo</div><main class="wrap"><p class="eyebrow">Location Brief</p><h1>${esc(model.heading)}</h1><p class="intro">${esc(model.intro)}</p><div class="search"><strong>${esc(model.search.heading)}</strong><br>${esc(model.search.summary)} · ${esc(model.search.detail)}</div><div class="grid">${cards}</div>${comparison}<section class="confirm"><h2>${before?"What Rofo will investigate":model.mode==="INVESTIGATE"?"What we'll ask next":"What we'll confirm"}</h2><ul>${model.confirm.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><h2>${esc(model.next.heading)}</h2><a class="cta" href="#">${esc(model.next.action)}</a></section></main></body></html>`; }
const two=scenarios.find(x=>x.id==="two-peer").presentation;
const before={...two,heading:"Peer locations worth investigating",intro:"This is a bounded City of Sacramento Industrial/Flex comparison. Reviewed evidence supports these operating environments.",locations:two.locations.map(x=>({...x,distinction:"Industrial-led applicability based on reviewed distribution evidence."})),confirm:["Property capabilities require requirement-specific investigation.","Parking: Not a stated priority"],next:{heading:"Fulfillment",action:"Continue →"}};
fs.writeFileSync(path.join(REVIEW,"html/sacramento-before.html"),page(before,true));
for(const scenario of scenarios) fs.writeFileSync(path.join(REVIEW,`html/${scenario.id}-after.html`),page(scenario.presentation));
console.log(`Built Customer Voice v1: ${findings.length} lint findings, ${redundancy.length} redundancy pairs, 3 recommendation states.`);
