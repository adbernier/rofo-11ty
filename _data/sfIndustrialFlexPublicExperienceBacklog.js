const geography = require("./sfIndustrialFlexDecisionGeographies");
module.exports = {
  schemaVersion: "sf-industrial-flex-public-experience-backlog:v1", marketId: "san-francisco", status: "BUILDING",
  principle: "Public content should emerge from real location decisions represented in the product, not from keywords requiring pages.",
  items: geography.geographies.filter((item) => /^CORE_|^SITUATIONAL_/.test(item.industrial) || /^CORE_|^SITUATIONAL_/.test(item.flex)).map((item) => ({ districtId: item.districtId, models: [!/^GENERALLY_NOT/.test(item.industrial) ? "industrial" : "", !/^GENERALLY_NOT/.test(item.flex) ? "flex" : ""].filter(Boolean), needs: ["Industrial/Flex decision explanation where applicable", "model-specific strengths and tradeoffs", "representative industrial/flex buildings and commercial environments", "approved imagery where available", "parent/nearby-alternative navigation", "certified sample Location Brief links"] })),
  futureSampleBriefs: ["Last-mile operation", "Contractor or service company", "Design showroom", "Office and production company", "Maker or prototyping business"],
};
