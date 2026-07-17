const commercialBuildingIntelligence = require("./commercialBuildingIntelligence.js");

function clean(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sentence(value) {
  const text = clean(value);
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean).map(clean).filter(Boolean))];
}

function first(values, count) {
  return unique(values).slice(0, count);
}

function pathForAddress(address) {
  return `/commercial-real-estate/building/CA/san-francisco/${slugify(address)}/`;
}

function comparisonPath(slug) {
  return `/commercial-real-estate/building-comparison/${slug}/`;
}

function buildingSubject(address) {
  const path = pathForAddress(address);
  const item = commercialBuildingIntelligence.byPath[path];

  if (!item) {
    throw new Error(`Missing Commercial Building Intelligence record for comparison address: ${address}`);
  }

  return {
    type: "building",
    name: item.identity.name,
    address: item.identity.address,
    path: item.building_path,
    district: item.identity.canonicalDistrict,
    secondaryDistricts: item.identity.secondaryDistricts || [],
    assetClass: item.identity.assetClass,
    editorialRole: item.editorial.editorialRole,
    editorialReason: item.editorial.editorialReason,
    themes: item.editorial.representativeThemes || [],
    businessFit: item.business.businessFit || [],
    idealCompanyProfiles: item.business.idealCompanyProfiles || [],
    companySizes: item.business.companySizes || [],
    workplaceCharacter: item.experience.workplaceCharacter,
    neighborhoodCharacter: item.experience.neighborhoodCharacter,
    executivePresence: item.experience.executivePresence,
    innovationScore: item.experience.innovationScore,
    transit: item.operations.transit,
    parking: item.operations.parking,
    amenities: item.operations.amenities,
    foodEnvironment: item.operations.foodEnvironment,
    strengths: item.tradeoffs.strengths || [],
    limitations: item.tradeoffs.limitations || [],
    validationQuestions: item.validation.questionsToValidate || [],
    comparisonBuildings: item.relationships.comparisonBuildings || [],
    relatedDistricts: item.relationships.relatedDistricts || [],
    intelligence: item,
  };
}

function districtSubject(path) {
  const buildings = commercialBuildingIntelligence.byDistrictPath[path] || [];
  const district = Object.values(commercialBuildingIntelligence.districts).find((item) => item.path === path);

  if (!district || !buildings.length) {
    throw new Error(`Missing Commercial Building Intelligence district for comparison path: ${path}`);
  }

  return {
    type: "district",
    name: district.name,
    address: "",
    path: district.path,
    district,
    secondaryDistricts: [],
    assetClass: "District",
    editorialRole: "District",
    editorialReason: `${district.name} is a commercial district represented by ${buildings.length} canonical buildings in Rofo's San Francisco Commercial Building Intelligence layer.`,
    themes: unique(buildings.flatMap((item) => item.editorial.representativeThemes)).slice(0, 8),
    businessFit: unique(buildings.flatMap((item) => item.business.businessFit)).slice(0, 6),
    idealCompanyProfiles: unique(buildings.flatMap((item) => item.business.idealCompanyProfiles)).slice(0, 3),
    companySizes: unique(buildings.flatMap((item) => item.business.companySizes)).slice(0, 4),
    workplaceCharacter: unique(buildings.map((item) => item.experience.workplaceCharacter)).slice(0, 2).join(" "),
    neighborhoodCharacter: unique(buildings.map((item) => item.experience.neighborhoodCharacter)).slice(0, 2).join(" "),
    executivePresence: unique(buildings.map((item) => item.experience.executivePresence)).join(" / "),
    innovationScore: unique(buildings.map((item) => item.experience.innovationScore)).join(" / "),
    transit: unique(buildings.map((item) => item.operations.transit)).slice(0, 2).join(" "),
    parking: unique(buildings.map((item) => item.operations.parking)).slice(0, 2).join(" "),
    amenities: unique(buildings.map((item) => item.operations.amenities)).slice(0, 2).join(" "),
    foodEnvironment: unique(buildings.map((item) => item.operations.foodEnvironment)).slice(0, 2).join(" "),
    strengths: unique(buildings.flatMap((item) => item.tradeoffs.strengths)).slice(0, 4),
    limitations: unique(buildings.flatMap((item) => item.tradeoffs.limitations)).slice(0, 3),
    validationQuestions: unique(buildings.flatMap((item) => item.validation.questionsToValidate)).slice(0, 4),
    comparisonBuildings: buildings.slice(0, 6).map((item) => item.building_path),
    relatedDistricts: unique(buildings.flatMap((item) => item.relationships.relatedDistricts)).slice(0, 4),
    intelligence: { district, buildings },
  };
}

function resolveSubject(definition) {
  if (definition.kind === "district") return districtSubject(definition.path);
  return buildingSubject(definition.address);
}

function comparePresence(value) {
  if (value === "high") return "stronger executive signal";
  if (value === "medium") return "moderate executive signal";
  if (value === "low") return "lower-key business signal";
  return value || "varies by user need";
}

function compareInnovation(value) {
  if (value === "high") return "strong innovation signal";
  if (value === "moderate") return "moderate innovation signal";
  if (value === "medium") return "moderate innovation signal";
  if (value === "low") return "limited innovation signal";
  return value || "varies by business type";
}

function defaultSummary(a, b) {
  const sameDistrict = a.district.path === b.district.path;
  const districtPhrase = sameDistrict
    ? `within ${a.district.name}`
    : `between ${a.district.name} and ${b.district.name}`;

  return `Compare ${a.name} and ${b.name} when deciding ${districtPhrase}. ${a.name} is best understood as a ${a.editorialRole.toLowerCase()}, while ${b.name} is best understood as a ${b.editorialRole.toLowerCase()}.`;
}

function subjectBestFor(subject) {
  return first(subject.idealCompanyProfiles, 2);
}

function sharedStrengths(a, b) {
  const sharedThemes = a.themes.filter((theme) => b.themes.includes(theme));
  const sharedFits = a.businessFit.filter((fit) => b.businessFit.includes(fit));
  const strengths = [];

  if (sharedThemes.length) {
    strengths.push(`Both options are useful for evaluating ${sharedThemes.slice(0, 3).join(", ").toLowerCase()} in San Francisco.`);
  }

  if (sharedFits.length) {
    strengths.push(`Both can be relevant for ${sharedFits.slice(0, 3).join(", ")} businesses, depending on specific requirements.`);
  }

  if (a.district.path === b.district.path) {
    strengths.push(`Both help explain the ${a.district.name} commercial real estate market, but they represent different shortlist tradeoffs.`);
  } else {
    strengths.push(`Both are useful San Francisco reference points, but they express different district decisions.`);
  }

  return strengths;
}

function keyDifferences(a, b) {
  return [
    {
      label: "Market role",
      a: `${a.name} functions as a ${a.editorialRole.toLowerCase()}.`,
      b: `${b.name} functions as a ${b.editorialRole.toLowerCase()}.`,
    },
    {
      label: "District decision",
      a: `${a.name} points the search toward ${a.district.name}.`,
      b: `${b.name} points the search toward ${b.district.name}.`,
    },
    {
      label: "Workplace character",
      a: a.workplaceCharacter,
      b: b.workplaceCharacter,
    },
    {
      label: "Executive presence",
      a: comparePresence(a.executivePresence),
      b: comparePresence(b.executivePresence),
    },
    {
      label: "Innovation signal",
      a: compareInnovation(a.innovationScore),
      b: compareInnovation(b.innovationScore),
    },
  ];
}

function tradeoffRows(a, b) {
  return [
    {
      label: `Choose ${a.name} when`,
      items: first([a.editorialReason, ...a.strengths], 3),
    },
    {
      label: `Choose ${b.name} when`,
      items: first([b.editorialReason, ...b.strengths], 3),
    },
    {
      label: "Tour both when",
      items: [
        "The business is still deciding whether district character or building format matters more.",
        "The shortlist depends on current suite condition, floorplate, commute patterns, or buildout requirements.",
      ],
    },
  ];
}

function relatedAlternatives(a, b) {
  const paths = unique([
    ...a.comparisonBuildings,
    ...b.comparisonBuildings,
    a.path,
    b.path,
  ]).filter((path) => path !== a.path && path !== b.path);

  return paths.slice(0, 6).map((path) => {
    const item = commercialBuildingIntelligence.byPath[path];
    return {
      label: item?.identity?.name || "Related building",
      url: path,
      summary: item
        ? `${item.editorial.editorialRole} in ${item.identity.canonicalDistrict.name}.`
        : "Related representative building.",
    };
  });
}

const comparisonDefinitions = [
  { a: { address: "555 California St" }, b: { address: "101 California St" }, category: "Financial District", relation: "primary", pathLabel: "555-california-vs-101-california" },
  { a: { address: "555 California St" }, b: { address: "1 Sansome St" }, category: "Financial District", relation: "executive alternative", pathLabel: "555-california-vs-one-sansome" },
  { a: { address: "101 California St" }, b: { address: "345 California St" }, category: "Financial District", relation: "secondary", pathLabel: "101-california-vs-345-california" },
  { a: { address: "600 Montgomery St" }, b: { address: "300 Clay St" }, category: "Financial District", relation: "executive alternative", pathLabel: "transamerica-pyramid-vs-one-maritime-plaza" },
  { a: { address: "415 Mission St" }, b: { address: "181 Fremont St" }, category: "SoMa", relation: "primary", pathLabel: "salesforce-tower-vs-181-fremont" },
  { a: { address: "415 Mission St" }, b: { address: "680 Folsom St" }, category: "SoMa", relation: "creative alternative", pathLabel: "salesforce-tower-vs-680-folsom" },
  { a: { address: "650 Townsend St" }, b: { address: "888 Brannan St" }, category: "SoMa", relation: "primary", pathLabel: "650-townsend-vs-888-brannan" },
  { a: { address: "600 Townsend St" }, b: { address: "414 Brannan St" }, category: "SoMa", relation: "more affordable alternative", pathLabel: "600-townsend-vs-414-brannan" },
  { a: { address: "1800 Owens St" }, b: { address: "550 Terry A Francois Blvd" }, category: "Mission Bay", relation: "primary", pathLabel: "the-exchange-vs-550-terry-francois" },
  { a: { address: "1700 Owens St" }, b: { address: "1455 3rd St" }, category: "Mission Bay", relation: "primary", pathLabel: "alexandria-1700-owens-vs-uber-mission-bay" },
  { a: { address: "70 Pier Bldg 102" }, b: { address: "1201 Illinois St" }, category: "Dogpatch", relation: "primary", pathLabel: "pier-70-building-12-vs-power-station" },
  { a: { address: "70 Pier Bldg 102" }, b: { kind: "district", path: "/commercial-real-estate/CA/san-francisco/mission-bay/" }, category: "Dogpatch", relation: "district transition", type: "building_vs_district", pathLabel: "pier-70-building-12-vs-mission-bay" },
  { a: { address: "2 Henry Adams St" }, b: { address: "808 Brannan St" }, category: "Design District", relation: "creative alternative", pathLabel: "2-henry-adams-vs-808-brannan" },
  { a: { address: "188 Spear St" }, b: { address: "88 Spear St" }, category: "South Beach", relation: "primary", pathLabel: "188-spear-vs-the-spear" },
  { a: { address: "1800 Mission St" }, b: { address: "2900 18th St" }, category: "Mission District", relation: "district anchor", pathLabel: "san-francisco-armory-vs-heath-ceramics" },
  { a: { address: "1105 Battery St" }, b: { address: "600 Montgomery St" }, category: "Jackson Square", relation: "executive alternative", pathLabel: "levis-plaza-vs-transamerica-pyramid" },
];

function buildComparison(definition) {
  const a = resolveSubject(definition.a);
  const b = resolveSubject(definition.b);
  const type = definition.type || "building_vs_building";
  const path = comparisonPath(definition.pathLabel || `${slugify(a.name)}-vs-${slugify(b.name)}`);
  const title = `${a.name} vs ${b.name}`;

  return {
    id: slugify(`${a.name}-vs-${b.name}`),
    type,
    relation: definition.relation || "primary",
    category: definition.category || a.district.name,
    path,
    slug: path.replace(/^\/commercial-real-estate\/building-comparison\//, "").replace(/\/$/, ""),
    title,
    short_title: title,
    headline: `${title}: which option fits your business?`,
    page_title: `${title}: Which Commercial Building Fits Your Business? | Rofo`,
    meta_description:
      `Compare ${a.name} and ${b.name}. Understand business fit, district context, tradeoffs, tour questions, and which option may belong on the shortlist.`,
    canonical: path,
    city: "San Francisco",
    state_abbr: "CA",
    city_slug: "san-francisco",
    buildingA: a,
    buildingB: b,
    summary: definition.summary || defaultSummary(a, b),
    whoBuildingAIsBestFor: subjectBestFor(a),
    whoBuildingBIsBestFor: subjectBestFor(b),
    sharedStrengths: sharedStrengths(a, b),
    keyDifferences: keyDifferences(a, b),
    workplaceCharacterComparison: {
      a: a.workplaceCharacter,
      b: b.workplaceCharacter,
    },
    districtContext: {
      a: `${a.name} is tied to ${a.district.name}. ${a.neighborhoodCharacter}`,
      b: `${b.name} is tied to ${b.district.name}. ${b.neighborhoodCharacter}`,
    },
    businessFitComparison: {
      a: first(a.businessFit, 5),
      b: first(b.businessFit, 5),
    },
    executivePresenceComparison: {
      a: comparePresence(a.executivePresence),
      b: comparePresence(b.executivePresence),
    },
    innovationComparison: {
      a: compareInnovation(a.innovationScore),
      b: compareInnovation(b.innovationScore),
    },
    transitComparison: {
      a: a.transit,
      b: b.transit,
    },
    amenityComparison: {
      a: `${a.amenities} ${a.foodEnvironment}`,
      b: `${b.amenities} ${b.foodEnvironment}`,
    },
    tradeoffs: tradeoffRows(a, b),
    tourValidationQuestions: first([...a.validationQuestions, ...b.validationQuestions], 6),
    relatedAlternatives: relatedAlternatives(a, b),
    recommendedNextComparisons: [],
  };
}

const comparisons = comparisonDefinitions.map(buildComparison);
const comparisonBySubjectPath = comparisons.reduce((acc, comparison) => {
  for (const path of [comparison.buildingA.path, comparison.buildingB.path]) {
    if (!acc[path]) acc[path] = [];
    acc[path].push(comparison.path);
  }
  return acc;
}, {});

for (const comparison of comparisons) {
  const next = unique([
    ...(comparisonBySubjectPath[comparison.buildingA.path] || []),
    ...(comparisonBySubjectPath[comparison.buildingB.path] || []),
  ]).filter((path) => path !== comparison.path);

  comparison.recommendedNextComparisons = next.slice(0, 4).map((path) => {
    const related = comparisons.find((item) => item.path === path);
    return {
      label: related?.short_title || "Related comparison",
      url: path,
      summary: related ? sentence(related.summary) : "Continue comparing related commercial options.",
    };
  });
}

function assertUniqueUrls(items) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.path)) {
      throw new Error(`Duplicate Commercial Building Comparison URL: ${item.path}`);
    }
    seen.add(item.path);
  }
}

assertUniqueUrls(comparisons);

module.exports = {
  schema: {
    version: "commercial-building-comparison-v1",
    supportedTypes: ["building_vs_building", "building_vs_building_type", "building_vs_district", "district_anchor_vs_commercial_asset"],
    fields: [
      "headline",
      "summary",
      "whoBuildingAIsBestFor",
      "whoBuildingBIsBestFor",
      "sharedStrengths",
      "keyDifferences",
      "workplaceCharacterComparison",
      "districtContext",
      "businessFitComparison",
      "executivePresenceComparison",
      "innovationComparison",
      "transitComparison",
      "amenityComparison",
      "tradeoffs",
      "tourValidationQuestions",
      "relatedAlternatives",
      "recommendedNextComparisons",
    ],
  },
  comparisons,
  byPath: Object.fromEntries(comparisons.map((item) => [item.path, item])),
  relationshipGraph: {
    primaryComparisons: comparisons.filter((item) => item.relation === "primary").map((item) => item.path),
    secondaryComparisons: comparisons.filter((item) => item.relation !== "primary").map((item) => item.path),
    bySubjectPath: comparisonBySubjectPath,
    comparisonTypes: comparisons.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item.path);
      return acc;
    }, {}),
    relationTypes: comparisons.reduce((acc, item) => {
      if (!acc[item.relation]) acc[item.relation] = [];
      acc[item.relation].push(item.path);
      return acc;
    }, {}),
  },
  stats: {
    comparisonCount: comparisons.length,
    buildingVsBuildingCount: comparisons.filter((item) => item.type === "building_vs_building").length,
    buildingVsDistrictCount: comparisons.filter((item) => item.type === "building_vs_district").length,
  },
};
