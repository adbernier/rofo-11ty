const experiments = Object.freeze([
  Object.freeze({ id: "growth-antioch-industrial-v1", marketId: "antioch", market: "Antioch", state: "CA", spaceType: "industrial", hypothesis: "Projecting reviewed East 18th Industrial context onto the canonical Industrial surface will improve query-to-page alignment and qualified Business Profile starts.", baseline: Object.freeze({ window: "2026-07-16/2026-08-12", query: "antioch industrial space for lease", impressions: 50, averagePosition: 10.5, marketImpressionChange: "+68%" }), landingPath: "/commercial-real-estate/CA/antioch/industrial-space/", targetBehavior: "Organic landing → Industrial context exploration → Business Profile → Universal Brief → Find Spaces That Fit", startVersion: "growth-sprint-1", deploymentDate: null, reviewStatus: "implementation_complete_pending_deployment" }),
  Object.freeze({ id: "growth-tempe-industrial-v1", marketId: "tempe", market: "Tempe", state: "AZ", spaceType: "industrial", hypothesis: "Consolidating reviewed I-10 Industrial evidence and clarifying Industrial versus Flex will improve qualified engagement from Tempe Industrial discovery.", baseline: Object.freeze({ window: "2026-07-16/2026-08-12", query: "tempe industrial space", impressions: 35, averagePosition: 15.1, marketImpressionChange: "+51%" }), landingPath: "/commercial-real-estate/AZ/tempe/industrial-space/", targetBehavior: "Organic landing → I-10 context/building exploration → Business Profile", startVersion: "growth-sprint-1", deploymentDate: null, reviewStatus: "implementation_complete_pending_deployment" }),
  Object.freeze({ id: "growth-indianapolis-industrial-v1", marketId: "indianapolis", market: "Indianapolis", state: "IN", spaceType: "industrial", hypothesis: "Projecting Airport Logistics and representative warehouse evidence will turn improving Industrial discovery into qualified search starts.", baseline: Object.freeze({ window: "2026-07-16/2026-08-12", query: "indianapolis industrial space", propertyTypeImpressions: 49, averagePosition: 21.8, marketImpressions: 440 }), landingPath: "/commercial-real-estate/IN/indianapolis/industrial-space/", targetBehavior: "Organic landing → Airport Logistics/building exploration → Business Profile → Universal Brief", startVersion: "growth-sprint-1", deploymentDate: null, reviewStatus: "implementation_complete_pending_deployment" }),
  Object.freeze({ id: "growth-sf-retail-v1", marketId: "san-francisco", market: "San Francisco", state: "CA", spaceType: "retail_service", hypothesis: "A clearer city-to-Retail semantic path and more distinct Retail metadata will help Google and users select the certified Retail decision guide.", baseline: Object.freeze({ window: "2026-07-16/2026-08-12", query: "san francisco retail space for lease", impressions: 31, averagePosition: 32.3, selectedPath: "/commercial-real-estate/CA/san-francisco/" }), landingPath: "/commercial-real-estate/CA/san-francisco/retail-space/", targetBehavior: "Organic Retail landing → Business Profile → certified Retail Brief → Find Spaces That Fit", startVersion: "growth-sprint-1", deploymentDate: null, reviewStatus: "implementation_complete_pending_deployment" }),
  Object.freeze({ id: "growth-aliso-viejo-office-v1", marketId: "aliso-viejo", market: "Aliso Viejo", state: "CA", spaceType: "office", hypothesis: "Occupier-oriented metadata and durable decision framing will improve CTR and reveal whether market-information visitors begin a Business Profile.", baseline: Object.freeze({ window: "2026-07-16/2026-08-12", impressions: 818, averagePosition: 8.3, clicks: 0, impressionChange: "+245%" }), landingPath: "/commercial-real-estate/CA/aliso-viejo/", targetBehavior: "Market-information landing → tenant decision context → Business Profile → Universal Brief", startVersion: "growth-sprint-1", deploymentDate: null, reviewStatus: "implementation_complete_pending_deployment" }),
  Object.freeze({ id: "growth-sacramento-industrial-v1", marketId: "sacramento", market: "Sacramento", state: "CA", spaceType: "industrial", hypothesis: "Projecting reviewed Industrial decision geography and representative environments onto the canonical Sacramento Industrial page will improve relevance and discovery while creating qualified Business Profile starts.", baseline: Object.freeze({ window: "2026-07-16/2026-08-12", propertyTypeImpressions: 31, averagePosition: 21.1, clicks: 0 }), landingPath: "/commercial-real-estate/CA/sacramento/industrial-space/", targetBehavior: "Organic Industrial landing → local operating context → Business Profile → Universal Brief → Find Spaces That Fit", startVersion: "market-development-sprint-a", deploymentDate: null, reviewStatus: "implementation_complete_pending_deployment" }),
]);

const observationPolicy = Object.freeze({
  deploymentDateSource: "Record the actual production deployment date; do not infer it from the repository change date.",
  firstMeaningfulReview: "After at least 14 complete post-deployment days, with a 28-day comparison preferred for ranking and CTR interpretation.",
  manualVerification: "Check the live Google result and GSC-selected page before attributing snippet or canonical behavior to repository metadata.",
});

const cityProjection = Object.freeze({
  "CA/aliso-viejo": Object.freeze({
    experimentId: "growth-aliso-viejo-office-v1",
    propertyType: "Office",
    intelligenceState: "universal_with_market_snapshot",
    seoTitle: "Aliso Viejo Office Market and Location Guide | Rofo",
    seoDescription: "Understand Aliso Viejo office market context, tenant location considerations, and the property details to verify before starting a space search.",
    h1: "Aliso Viejo Office Market and Location Guide",
  }),
  "CA/sacramento": Object.freeze({
    experimentId: "growth-sacramento-industrial-v1",
    propertyType: "Industrial / Warehouse / Flex",
    intelligenceState: "universal_with_local_context",
    featuredSpaceType: Object.freeze({
      eyebrow: "Sacramento Industrial decisions",
      title: "Explore Sacramento Industrial and Warehouse locations",
      summary: "Compare Power Inn, Natomas, and bounded Sacramento-area operating contexts before investigating individual buildings.",
      cue: "Understand Sacramento Industrial environments",
      path: "/commercial-real-estate/CA/sacramento/industrial-space/",
    }),
  }),
});

module.exports = Object.freeze({ schemaVersion: "growth-experiments:v1", experiments, byId: Object.freeze(Object.fromEntries(experiments.map((item) => [item.id, item]))), cityProjection, observationPolicy });
