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

function titleCase(value) {
  return clean(value)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizePropertyType(value) {
  const normalized = slugify(value);
  if (normalized === "office-space") return "office";
  return normalized || "office";
}

function propertyTypePathSegment(propertyType) {
  if (propertyType === "office") return "office";
  return slugify(propertyType);
}

function propertyTypeLabel(propertyType) {
  if (propertyType === "office") return "Office";
  return titleCase(propertyType);
}

function makeUrl(market, propertyType, archetype) {
  return `/${market.marketSlug}/${propertyTypePathSegment(propertyType)}/${archetype.slug}/`;
}

function findDistrict(graph, slug, market) {
  return (graph || []).find((node) => {
    if (node.slug !== slug) return false;
    if (node.type !== "district") return false;
    if (market && market.marketName && node.city !== market.marketName) {
      return node.marketId === market.marketId || node.operationalMarketId === market.marketId;
    }
    return true;
  }) || null;
}

function districtOfficeSummary(district) {
  return clean(
    district &&
      district.spaceTypeFit &&
      district.spaceTypeFit.office &&
      district.spaceTypeFit.office.summary
  );
}

function districtAttributes(district) {
  const attrs = district && district.attributes ? district.attributes : {};
  return Object.entries(attrs)
    .filter(([, value]) => clean(value) && clean(value) !== "unknown")
    .slice(0, 8)
    .map(([key, value]) => ({ key, value }));
}

function districtRelationships(district) {
  return (
    district &&
    district.relationships &&
    Array.isArray(district.relationships.compareWith)
      ? district.relationships.compareWith
      : []
  ).map((item) => ({
    slug: item.slug,
    label: item.label,
    reason: item.reason,
    relationshipType: item.relationshipType || "",
  }));
}

function districtBuildingGroup(districtSlug, representativeBuildings) {
  const group =
    representativeBuildings &&
    representativeBuildings.byDistrictSlug &&
    representativeBuildings.byDistrictSlug[districtSlug];

  if (!group || !Array.isArray(group.buildings)) return [];

  return group.buildings.slice(0, representativeBuildings.maxBuildingsPerDistrict || 3);
}

function briefCta(brief, market, propertyType, archetype) {
  const params = new URLSearchParams();
  params.set("city", market.marketName);
  params.set("state", market.state);
  params.set("space_type", propertyTypeLabel(propertyType));
  params.set("business_type", archetype.id);
  params.set("source", "business_brief");
  params.set("brief", brief.id);

  return {
    label: "Create Your Personalized Location Brief",
    url: `/find-locations/?${params.toString()}`,
    context:
      "The public Business Brief reflects a common business archetype. A personalized Location Brief uses your office use, commute orientation, environment preference, growth expectations, and other Business Profile inputs.",
  };
}

function resolveBrief(definition, context) {
  const archetype = context.archetypes.archetypes[definition.archetypeId];
  const market = context.definitions.markets[definition.marketId];
  const propertyType = normalizePropertyType(definition.propertyType);
  const warnings = [];

  if (!archetype) warnings.push(`Unknown archetype: ${definition.archetypeId}`);
  if (!market) warnings.push(`Unknown market: ${definition.marketId}`);

  const safeArchetype = archetype || {
    id: definition.archetypeId,
    slug: slugify(definition.archetypeId),
    label: titleCase(definition.archetypeId),
    pluralLabel: titleCase(definition.archetypeId),
    primaryLocationDrivers: [],
    secondaryPreferences: [],
    materialQuestions: [],
    buildingSearchFactors: [],
    brokerExecutionConsiderations: [],
  };
  const safeMarket = market || {
    marketId: definition.marketId,
    marketName: titleCase(definition.marketId),
    marketSlug: slugify(definition.marketId),
    state: "",
    route: "",
  };

  const url = definition.url || makeUrl(safeMarket, propertyType, safeArchetype);
  const readiness = definition.publicationReadiness || definition.editorialStatus || "draft";
  const isIndexable = ["ready", "published"].includes(readiness);
  const bestFits = (definition.bestFitDistricts || []).map((fit, index) => {
    const district = findDistrict(context.locationKnowledgeGraph, fit.districtSlug, safeMarket);
    if (!district) warnings.push(`Missing district reference: ${fit.districtSlug}`);
    const buildings = districtBuildingGroup(fit.districtSlug, context.representativeBuildings);
    if (!buildings.length) warnings.push(`No representative buildings for district: ${fit.districtSlug}`);

    return {
      ...fit,
      sequence: index + 1,
      districtSlug: fit.districtSlug,
      districtName: district ? district.label : titleCase(fit.districtSlug),
      districtPath: district ? district.path : "",
      districtOfficeSummary: districtOfficeSummary(district),
      districtBestFor: district && Array.isArray(district.bestFor) ? district.bestFor : [],
      districtStrengths: district && Array.isArray(district.strengths) ? district.strengths : [],
      districtTradeoffs: district && Array.isArray(district.tradeoffs) ? district.tradeoffs : [],
      districtAttributes: districtAttributes(district),
      nearbyRelationships: districtRelationships(district),
      commercialEcosystem:
        district && district.commercialEcosystem
          ? district.commercialEcosystem
          : null,
      representativeBuildings: buildings,
    };
  });

  const representativeBuildingCount = bestFits.reduce(
    (sum, fit) => sum + fit.representativeBuildings.length,
    0
  );
  const missingKnowledge = [
    ...(definition.missingKnowledge || []),
    ...bestFits
      .filter((fit) => !fit.districtPath)
      .map((fit) => `District page missing for ${fit.districtSlug}`),
    ...bestFits
      .filter((fit) => !fit.representativeBuildings.length)
      .map((fit) => `Representative buildings missing for ${fit.districtName}`),
  ];

  return {
    id: definition.id,
    modelKey: `${safeMarket.marketId}:${propertyType}:${safeArchetype.id}`,
    market: safeMarket,
    propertyType,
    propertyTypeLabel: propertyTypeLabel(propertyType),
    archetype: safeArchetype,
    title: definition.title,
    seoTitle: definition.seoTitle || `${definition.title} | Rofo`,
    metaDescription: definition.metaDescription,
    pageHeading: definition.pageHeading || definition.title,
    url,
    canonicalUrl: url,
    breadcrumbs: [
      { label: safeMarket.marketName, url: safeMarket.route },
      { label: propertyTypeLabel(propertyType), url: `${safeMarket.route}${propertyType === "office" ? "office-space/" : `${propertyType}-space/`}` },
      { label: safeArchetype.pluralLabel || safeArchetype.label, url },
    ],
    executiveSummary: definition.executiveSummary || [],
    businessCharacteristics: definition.businessCharacteristics || [],
    howThisBusinessUsesSpace: {
      pattern: safeArchetype.typicalOperatingPattern || "",
      implications: [
        ...(safeArchetype.primaryLocationDrivers || []),
        ...(definition.businessCharacteristics || []),
      ].slice(0, 7),
    },
    locationPriorities: definition.locationPriorities || [],
    bestFits,
    comparativeGuidance: definition.comparativeGuidance || "",
    tradeoffs: definition.tradeoffs || [],
    alternativeConditions: definition.alternativeConditions || [],
    cta: definition.cta || briefCta(definition, safeMarket, propertyType, safeArchetype),
    brokerContext:
      "A broker can later validate current buildings, availability, lease economics, tours, and transaction details. The Business Brief should not be read as live inventory.",
    editorialStatus: definition.editorialStatus || "draft",
    publicationReadiness: readiness,
    isIndexable,
    noindex: !isIndexable,
    readinessRationale: definition.readinessRationale || "",
    sourceTrace: definition.sourceTrace || [],
    evidenceTrace: {
      sourceDocuments: [
        "docs/product/rofo-knowledge-architecture.md",
        "docs/product/business-brief-publishing-system.md",
        "docs/product/sf-office-editorial-recommendation-model.md",
        "_data/businessArchetypes.js",
        "_data/businessBriefDefinitions.js",
        "_data/locationKnowledgeGraph.js",
        "_data/recommendationRepresentativeBuildings.js",
      ],
      sourceTrace: definition.sourceTrace || [],
      warnings,
    },
    internalLinks: {
      market: safeMarket.route,
      propertyType: `${safeMarket.route}${propertyType === "office" ? "office-space/" : `${propertyType}-space/`}`,
      districts: bestFits
        .filter((fit) => fit.districtPath)
        .map((fit) => ({ label: fit.districtName, url: fit.districtPath })),
      buildings: bestFits.flatMap((fit) =>
        fit.representativeBuildings.map((building) => ({
          label: building.name,
          url: building.canonicalUrl,
          district: fit.districtName,
        }))
      ),
    },
    quality: {
      bestFitCount: bestFits.length,
      representativeBuildingCount,
      missingKnowledge,
      warnings,
      hasUniqueMetadata: Boolean(definition.seoTitle && definition.metaDescription),
    },
    lastReviewed: definition.lastReviewed || "",
  };
}

function resolveBusinessBriefs(context) {
  return {
    schemaVersion: "business-briefs-v1",
    routeConvention: "/{market-slug}/office/{archetype-slug}/",
    briefs: context.definitions.definitions.map((definition) => resolveBrief(definition, context)),
  };
}

module.exports = {
  resolveBusinessBriefs,
  resolveBrief,
};
