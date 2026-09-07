"use strict";
const workflow=Object.freeze({
  DETERMINISTIC:Object.freeze(["artifact generation and hashing","schema and evidence-tier validation","municipality deny-list checks","relationship-count stop gate","representative/durable-entity joins","route collision and indexation checks","availability firewall scans","render and analytics contract QA"]),
  RESEARCH_AUTOMATABLE_WITH_QA:Object.freeze(["authoritative-source discovery","initial geography inventory","space-type applicability draft","provenance capture","first editorial draft","objective access-source inventory","related-district suggestions","editorial similarity scan"]),
  HUMAN_REVIEW_REQUIRED:Object.freeze(["all municipality conflicts","all new PRIMARY relationships","geography identity and overlap decisions","public evidence-tier promotion","market-specific distinctions and tradeoffs","all route/indexation changes","representative identity conflicts","visual-density signoff"]),
  MARKET_EXCEPTION:Object.freeze(["consolidated city-county ownership","metro labels spanning municipalities or states","overlapping corridor/district aliases","component geography beneath a reviewed RI candidate","specialized ecosystems whose presence does not establish property capability"])
});
const batchContract=Object.freeze({
  name:"Commercial District Intelligence Batch v1",marketCount:{target:10,min:8,max:10},
  inputs:Object.freeze(["market ID, city, state and municipality boundary sources","Public Commercial Geography Foundation record","Atlas and reconciliation evidence","reviewed Recommendation Intelligence foundations where present","Representative Property Foundation","Durable Property Entity records","existing route/indexation inventory","approved editorial vocabulary and QA thresholds"]),
  outputs:Object.freeze(["municipality audit","Office/Retail/Industrial/Flex coverage decisions","evidence tiers and provenance","one-line distinction, description, Common here, What stands out, Worth knowing and Compare with","access-readiness inventory","representative projection","route/indexation state","visual-review manifest","deterministic artifact hashes","QA and stop report"])
});
const stopConditions=Object.freeze([
  {code:"MUNICIPALITY_AMBIGUITY",action:"STOP_MARKET",threshold:"any unresolved public geography ownership"},
  {code:"RELATIONSHIP_EXPANSION",action:"STOP_MARKET",threshold:">8 net-new public relationships"},
  {code:"WEAK_SOURCE_COVERAGE",action:"STOP_MARKET",threshold:"no authoritative or independently credible support for a surfaced relationship"},
  {code:"DUPLICATE_GEOGRAPHY_IDENTITY",action:"STOP_RELATIONSHIP",threshold:"overlapping names cannot be expressed hierarchically"},
  {code:"CROSS_MARKET_OWNERSHIP_CONFLICT",action:"STOP_MARKET",threshold:"city and metro evidence disagree"},
  {code:"CANDIDATE_PROMOTION",action:"STOP_BATCH",threshold:"candidate-only geography becomes PUBLIC_REVIEWED"},
  {code:"EDITORIAL_SIMILARITY",action:"REWRITE",threshold:">0.78 normalized phrase similarity or a repeated distinction"},
  {code:"ROUTE_COLLISION",action:"STOP_MARKET",threshold:"two entities claim one canonical route or one entity gains duplicate URLs"},
  {code:"PROPERTY_TYPE_CONFLICT",action:"STOP_RELATIONSHIP",threshold:"unresolved canonical versus observed type"},
  {code:"REPRESENTATIVE_IDENTITY_CONFLICT",action:"STOP_RELATIONSHIP",threshold:"municipality, hierarchy or durable identity disagreement"}
]);
const reviewModel=Object.freeze({mode:"REVIEW_BY_EXCEPTION",reviewAll:Object.freeze(["municipality conflicts","new PRIMARY geographies","route/indexation changes","evidence-tier promotions","representative identity conflicts","batch stop-condition hits"]),samplePerMarket:Object.freeze(["highest-growth opportunity","one Office district where surfaced","one Retail district where surfaced","one Industrial or Flex district","one deterministic random editorial record","one desktop and one mobile capture"]),releaseGate:"No market releases until exception review and sampled visual/editorial review pass."});
const editorialSafeguards=Object.freeze({findings:Object.freeze(["CTA and verification-boundary copy appropriately repeat as interface conventions.","Generic risks concentrate in opening clauses, three-item ‘stands out’ lists, and repeated property-verification language.","City-specific physical form, named corridors and explicit contrasts produced the most distinctive copy across SF, Sacramento, Indianapolis and Phoenix."]),rules:Object.freeze(["one-line distinctions must be unique across the batch","descriptions must name at least two market-specific anchors or physical-form traits","do not start more than two district descriptions per batch with the same three-word sequence","similarity scan excludes shared UI labels and approved CTA copy","human review rewrites the highest-similarity pair per market","Worth knowing must identify a geography-specific comparison or omit"])});
const nextMarkets=Object.freeze([
  {marketId:"denver",label:"Denver",reason:"strong Atlas coverage and municipal ownership stress with Aurora"},
  {marketId:"seattle",label:"Seattle",reason:"mature Office/Industrial structure and Kent/Eastside boundary stress"},
  {marketId:"san-jose",label:"San Jose",reason:"South Bay adjacent-city identity stress and technical/R&D relevance"},
  {marketId:"atlanta",label:"Atlanta",reason:"existing public evidence and consolidated urban commercial structure"},
  {marketId:"nashville",label:"Nashville",reason:"district-led Office/Retail plus industrial corridor diversity"},
  {marketId:"miami",label:"Miami",reason:"Doral/Medley municipality stress and industrial/office diversity"},
  {marketId:"detroit",label:"Detroit",reason:"Detroit/Novi ownership split and industrial discovery leverage"},
  {marketId:"kansas-city-mo",label:"Kansas City, Missouri",reason:"two-state metro naming and municipality hard-gate test"},
  {marketId:"las-vegas",label:"Las Vegas",reason:"incorporated-city versus unincorporated Clark County stress"},
  {marketId:"los-angeles",label:"Los Angeles",reason:"high-value public surface with extensive independent-municipality risk"}
]);
module.exports=Object.freeze({schemaVersion:"commercial-district-intelligence-scaling:v1",referenceMarkets:Object.freeze(["san-francisco","sacramento","indianapolis","phoenix"]),workflow,batchContract,stopConditions,reviewModel,editorialSafeguards,nextMarkets,nextSprint:"Commercial District Intelligence Batch v1 — ten-market cohort"});
