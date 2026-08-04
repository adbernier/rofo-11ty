const { normalizeSfOfficeProfile } = require("../lib/recommendations/normalize-sf-office-profile");
const { resolveSfOfficeRecommendation } = require("../lib/recommendations/sf-office-recommendation-resolver");

const samples = [
  {
    id: "minimal",
    label: "Minimal San Francisco Office Profile",
    sourceAnswers: {
      locations: [{ label: "San Francisco", type: "city", city: "San Francisco", state: "CA" }],
      spaceType: "Office",
      size: "I'm not sure",
      locationIntent: "discover",
    },
  },
  {
    id: "client-recruiting",
    label: "Client-Facing Recruiting-Sensitive Business",
    sourceAnswers: {
      locations: [{ label: "San Francisco", type: "city", city: "San Francisco", state: "CA" }],
      spaceType: "Office",
      size: "2,500-5,000 sqft",
      locationIntent: "discover",
      headcount: "18",
      expectedGrowth: "some",
      clientVisitFrequency: "often",
      recruitingImportance: "high",
      notes: "We do not want to overspend.",
    },
  },
  {
    id: "growth-tech",
    label: "Technology Growth Company",
    sourceAnswers: {
      locations: [{ label: "San Francisco", type: "city", city: "San Francisco", state: "CA" }],
      spaceType: "Office",
      locationIntent: "discover",
      businessType: "technology",
      expectedGrowth: "significant",
      recruitingImportance: "high",
      transitImportance: "high",
      officeEnvironment: "Modern and polished",
    },
  },
  {
    id: "jackson-square-anchor",
    label: "Jackson Square Anchor With Nearby Alternatives",
    sourceAnswers: {
      locations: [{ label: "Jackson Square", type: "district", city: "San Francisco", state: "CA" }],
      spaceType: "Office",
      locationIntent: "compare",
    },
  },
];

function serialize(value) {
  return JSON.stringify(value, null, 2);
}

module.exports = {
  modelKey: "san-francisco:office",
  route: "/prototype/recommendation-explorer/sf-office/",
  samples: samples.map((sample) => {
    const normalized = normalizeSfOfficeProfile(sample.sourceAnswers);
    const result = normalized.supported
      ? resolveSfOfficeRecommendation(normalized.resolverProfile)
      : null;
    return {
      ...sample,
      normalized,
      result,
      sourceAnswersJson: serialize(sample.sourceAnswers),
      normalizedJson: serialize(normalized),
      resultJson: serialize(result),
    };
  }),
};
