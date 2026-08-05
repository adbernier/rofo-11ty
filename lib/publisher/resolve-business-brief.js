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

function legacyPropertyTypePathSegment(propertyType) {
  if (propertyType === "office") return "office";
  return slugify(propertyType);
}

function propertyTypeRouteSegment(propertyType) {
  if (propertyType === "office") return "office-space";
  const slug = slugify(propertyType);
  return slug.endsWith("-space") ? slug : `${slug}-space`;
}

function propertyTypeLabel(propertyType) {
  if (propertyType === "office") return "Office";
  return titleCase(propertyType);
}

function ensureTrailingSlash(value) {
  const cleaned = clean(value);
  if (!cleaned) return "/";
  return cleaned.endsWith("/") ? cleaned : `${cleaned}/`;
}

function stateName(stateAbbr) {
  return {
    CA: "California",
    CO: "Colorado",
  }[clean(stateAbbr).toUpperCase()] || clean(stateAbbr).toUpperCase();
}

function stateUrl(market) {
  const state = clean(market.state).toUpperCase();
  return state ? `/commercial-real-estate/${state}/` : "/markets/";
}

function propertyTypeUrl(market, propertyType) {
  return `${ensureTrailingSlash(market.route)}${propertyTypeRouteSegment(propertyType)}/`;
}

function makeUrl(market, propertyType, archetype) {
  return `${propertyTypeUrl(market, propertyType)}${archetype.slug}/`;
}

function legacyUrl(market, propertyType, archetype, trailingSlash = true) {
  const url = `/${market.marketSlug}/${legacyPropertyTypePathSegment(propertyType)}/${archetype.slug}`;
  return trailingSlash ? `${url}/` : url;
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

function buildingPageByPath(buildingPages) {
  return new Map((buildingPages || []).map((building) => [building.building_path, building]));
}

function knowledgeGraphBuildingCard(item, district, buildingPagesByPath) {
  if (!item || !item.path || !buildingPagesByPath.has(item.path)) return null;
  const page = buildingPagesByPath.get(item.path);
  return {
    buildingId: item.path,
    name: clean(item.name || page.display_name || page.name || page.address),
    address: clean(item.address || page.address),
    city: clean(page.city || district.city),
    state: clean(page.state_abbr || district.state),
    districtId: clean(district.slug),
    districtSlug: clean(district.slug),
    districtName: clean(district.label),
    districtPath: clean(district.path),
    secondaryDistrictSlugs: [],
    secondaryDistrictPaths: [],
    canonicalUrl: item.path,
    image: clean(page.hero_image || page.image || page.photo || ""),
    fieldPhotoSubjectId: clean(page.semantic_source_building_id) || clean(item.path),
    buildingType: clean(page.type || page.primary_space_type || ""),
    representativeReason: clean(item.representativeReason),
    bestFitSummary: clean(item.representativeReason),
    primaryTradeoff: clean(item.primaryTradeoff),
    buildingBriefStatus: page.building_brief ? clean(page.building_brief.status || "published") : "knowledge_graph_representative",
    source: "locationKnowledgeGraph.representativeBuildings",
    representativeRole: clean(item.representativeRole),
    validationFocus: item.validationFocus || [],
  };
}

function districtBuildingGroup(districtSlug, district, representativeBuildings, buildingPages) {
  const group =
    representativeBuildings &&
    representativeBuildings.byDistrictSlug &&
    representativeBuildings.byDistrictSlug[districtSlug];
  const maxBuildings = representativeBuildings.maxBuildingsPerDistrict || 3;
  const cards = group && Array.isArray(group.buildings) ? group.buildings.slice(0, maxBuildings) : [];
  const seen = new Set(cards.map((building) => building.canonicalUrl));

  if (cards.length >= maxBuildings || !district || !Array.isArray(district.representativeBuildings)) {
    return cards;
  }

  const pagesByPath = buildingPageByPath(buildingPages);
  for (const item of district.representativeBuildings) {
    if (cards.length >= maxBuildings) break;
    if (seen.has(item.path)) continue;
    const card = knowledgeGraphBuildingCard(item, district, pagesByPath);
    if (!card) continue;
    cards.push(card);
    seen.add(card.canonicalUrl);
  }

  return cards;
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

  const parentPropertyTypeUrl = propertyTypeUrl(safeMarket, propertyType);
  const url = definition.url || makeUrl(safeMarket, propertyType, safeArchetype);
  const legacyUrls = [
    legacyUrl(safeMarket, propertyType, safeArchetype, true),
    legacyUrl(safeMarket, propertyType, safeArchetype, false),
  ].filter((legacy) => legacy !== url);
  const readiness = definition.publicationReadiness || definition.editorialStatus || "draft";
  const isIndexable = ["ready", "published"].includes(readiness);
  const bestFits = (definition.bestFitDistricts || []).map((fit, index) => {
    const district = findDistrict(context.locationKnowledgeGraph, fit.districtSlug, safeMarket);
    if (!district) warnings.push(`Missing district reference: ${fit.districtSlug}`);
    const buildings = districtBuildingGroup(fit.districtSlug, district, context.representativeBuildings, context.buildingPages);
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
    legacyUrls,
    redirectTargets: legacyUrls.map((from) => ({
      from,
      to: url,
      status: 301,
    })),
    breadcrumbs: [
      { label: "Commercial Real Estate", url: "/markets/" },
      { label: stateName(safeMarket.state), url: stateUrl(safeMarket) },
      { label: safeMarket.marketName, url: safeMarket.route },
      { label: `${propertyTypeLabel(propertyType)} Space`, url: parentPropertyTypeUrl },
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
        "docs/product/denver-office-editorial-recommendation-model.md",
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
      propertyType: parentPropertyTypeUrl,
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
  const briefs = context.definitions.definitions.map((definition) => resolveBrief(definition, context));
  const readinessSummary = briefs.reduce((acc, brief) => {
    const marketId = brief.market.marketId;
    if (!acc.byMarket[marketId]) {
      acc.byMarket[marketId] = {
        marketId,
        marketName: brief.market.marketName,
        total: 0,
        published: 0,
        ready: 0,
        hold: 0,
        held: 0,
        draft: 0,
        review: 0,
        briefs: [],
      };
    }
    const market = acc.byMarket[marketId];
    market.total += 1;
    market[brief.publicationReadiness] = (market[brief.publicationReadiness] || 0) + 1;
    market.briefs.push({
      id: brief.id,
      archetypeId: brief.archetype.id,
      bestFits: brief.bestFits.map((fit) => fit.districtSlug),
      representativeBuildingCount: brief.quality.representativeBuildingCount,
      isIndexable: brief.isIndexable,
      publicationReadiness: brief.publicationReadiness,
      readinessRationale: brief.readinessRationale,
      url: brief.url,
      canonicalUrl: brief.canonicalUrl,
      legacyUrls: brief.legacyUrls,
      missingKnowledge: brief.quality.missingKnowledge,
    });
    acc.total += 1;
    acc[brief.publicationReadiness] = (acc[brief.publicationReadiness] || 0) + 1;
    return acc;
  }, {
    total: 0,
    published: 0,
    ready: 0,
    hold: 0,
    held: 0,
    draft: 0,
    review: 0,
    byMarket: {},
  });

  return {
    schemaVersion: "business-briefs-v1",
    routeConvention: "/commercial-real-estate/{state}/{market-slug}/{space-type-slug}/{archetype-slug}/",
    redirects: briefs.flatMap((brief) => brief.redirectTargets || []),
    readinessSummary,
    briefs,
  };
}

module.exports = {
  resolveBusinessBriefs,
  resolveBrief,
  propertyTypeRouteSegment,
  propertyTypeUrl,
};
