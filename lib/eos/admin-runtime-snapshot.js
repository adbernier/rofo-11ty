function compactMarketOpportunity(market) {
  return {
    marketId: market.marketId,
    marketName: market.marketName,
    state: market.state,
    impressions: market.impressions,
    clicks: market.clicks,
    averagePosition: market.averagePosition,
    positionBand: market.positionBand,
    googleOpportunity: market.googleOpportunity,
    occupierDemandShare: market.occupierDemandShare,
    highOccupierQueryCount: market.highOccupierQueryCount,
    dominantThemes: (market.dominantThemes || []).slice(0, 5),
    investorFutureQueryCount: market.investorFutureQueryCount,
    momentum: market.momentum,
    strategicParent: market.strategicParent,
    propertyTypeDemand: market.propertyTypeDemand,
    entityBreakdown: market.entityBreakdown,
    knowledgeCoverage: market.knowledgeCoverage,
    knowledgeGaps: market.knowledgeGaps,
    recommendedActions: market.recommendedActions,
    rationale: market.rationale,
    provenance: market.provenance,
  };
}

function compactTopic(topic) {
  return {
    id: topic.id,
    label: topic.label,
    impressions: topic.impressions,
    clicks: topic.clicks,
    averagePosition: topic.averagePosition,
    queryCount: topic.queryCount,
    marketCount: topic.marketCount,
    strongestMarkets: (topic.strongestMarkets || []).slice(0, 5).map((market) => ({
      marketId: market.marketId,
      marketName: market.marketName,
      state: market.state,
      impressions: market.impressions,
      clicks: market.clicks,
      averagePosition: market.averagePosition,
      googleOpportunity: market.googleOpportunity,
      momentum: market.momentum,
      strategicParent: market.strategicParent,
      knowledgeGaps: market.knowledgeGaps,
      occupierDemandShare: market.occupierDemandShare,
    })),
    occupierRelevance: topic.occupierRelevance,
    occupierDemandShare: topic.occupierDemandShare,
    knowledgeGaps: topic.knowledgeGaps,
    opportunityGap: topic.opportunityGap,
    momentum: topic.momentum,
  };
}

function compactPublisherOpportunity(item) {
  if (item.type === "search_mission") return item;
  return {
    id: item.id,
    marketId: item.marketId,
    marketName: item.marketName,
    opportunityType: item.opportunityType,
    targetEntity: item.targetEntity,
    evidence: item.evidence ? {
      impressions: item.evidence.impressions,
      clicks: item.evidence.clicks,
      averagePosition: item.evidence.averagePosition,
      momentum: item.evidence.momentum,
      dominantThemes: item.evidence.dominantThemes,
      provenance: item.evidence.provenance,
    } : null,
    knowledgeGaps: item.knowledgeGaps,
    recommendedActions: item.recommendedActions,
    rationale: item.rationale,
    source: item.source,
  };
}

function compactCommercialKnowledgeIntelligence(intelligence = {}) {
  const googleOpportunity = intelligence.googleOpportunity || {};
  return {
    ...intelligence,
    googleOpportunity: {
      markets: (googleOpportunity.markets || []).slice(0, 40).map(compactMarketOpportunity),
      sourceSnapshot: googleOpportunity.sourceSnapshot,
      propertyTypeOpportunities: (googleOpportunity.propertyTypeOpportunities || []).slice(0, 20).map((item) => ({
        id: item.id,
        marketId: item.marketId,
        marketName: item.marketName,
        state: item.state,
        propertyType: item.propertyType,
        impressions: item.impressions,
        clicks: item.clicks,
        averagePosition: item.averagePosition,
        queryCount: item.queryCount,
        topQueries: (item.topQueries || []).slice(0, 3),
      })),
      comparisons: {},
    },
    topicIntelligence: (intelligence.topicIntelligence || []).slice(0, 16).map(compactTopic),
    searchMissions: (intelligence.searchMissions || []).slice(0, 8),
    emergingThemes: (intelligence.emergingThemes || []).slice(0, 10),
    investorFutureSignals: (intelligence.investorFutureSignals || []).slice(0, 20),
    publisherOpportunities: (intelligence.publisherOpportunities || []).slice(0, 40).map(compactPublisherOpportunity),
  };
}

function compactIncludedTask(task = {}) {
  return {
    id: task.id,
    title: task.title,
    reason: task.reason,
  };
}

function compactWorkItems(workItems) {
  if (!workItems) return workItems;
  return {
    count: workItems.count,
    buildings: (workItems.buildings || []).slice(0, 24).map((item) => ({
      name: item.name,
      path: item.path,
      city: item.city,
      state: item.state,
    })),
  };
}

function compactExecutionPacket(packet = {}) {
  return {
    objective: packet.objective,
    reason: packet.reason,
    currentHealth: packet.currentHealth,
    currentConstraint: packet.currentConstraint,
    includedTasks: (packet.includedTasks || []).map(compactIncludedTask),
    deferredTasks: (packet.deferredTasks || []).map(compactIncludedTask),
    reasonForBundling: packet.reasonForBundling,
    expectedImpact: packet.expectedImpact,
    estimatedEffort: packet.estimatedEffort,
    missionSize: packet.missionSize,
    missionClass: packet.missionClass,
    files: packet.files,
    dependencies: packet.dependencies,
    acceptanceCriteria: packet.acceptanceCriteria,
    expectedDeliverables: packet.expectedDeliverables,
    qaCommands: packet.qaCommands,
    requiredReview: packet.requiredReview,
    automationLevel: packet.automationLevel,
    providers: packet.providers,
    handoff: packet.handoff,
    componentStatuses: packet.componentStatuses,
    workItems: compactWorkItems(packet.workItems),
  };
}

function compactQueueItem(item = {}) {
  return {
    id: item.id,
    title: item.title,
    marketId: item.marketId,
    marketName: item.marketName,
    programId: item.programId,
    programLabel: item.programLabel,
    campaignId: item.campaignId,
    campaignTitle: item.campaignTitle,
    initiativeId: item.initiativeId,
    initiativeTitle: item.initiativeTitle,
    portfolioId: item.portfolioId,
    metroId: item.metroId,
    metroName: item.metroName,
    ecosystem: item.ecosystem,
    ecosystemId: item.ecosystemId,
    districtId: item.districtId,
    districtName: item.districtName,
    itemName: item.itemName,
    expectedImpact: item.expectedImpact,
    expectedEditorialImpact: item.expectedEditorialImpact,
    estimatedEffort: item.estimatedEffort,
    missionSize: item.missionSize,
    impactEffortClass: item.impactEffortClass,
    missionClass: item.missionClass,
    currentConstraint: item.currentConstraint,
    dependencies: item.dependencies,
    qaCommands: item.qaCommands,
    requiredReview: item.requiredReview,
    confidence: item.confidence,
    priorityScore: item.priorityScore,
    priorityStars: item.priorityStars,
    automationLevel: item.automationLevel,
    lifecycleState: item.lifecycleState,
    status: item.status,
    queueType: item.queueType,
    operatingLane: item.operatingLane,
    category: item.category,
    categoryLabel: item.categoryLabel,
    suggestedModule: item.suggestedModule,
    why: item.why,
    includedTasks: (item.includedTasks || []).map(compactIncludedTask),
    deferredTasks: (item.deferredTasks || []).map(compactIncludedTask),
    componentStatuses: item.componentStatuses,
    workItems: compactWorkItems(item.workItems),
    executionPacket: item.executionPacket ? compactExecutionPacket(item.executionPacket) : undefined,
  };
}

function compactCampaign(campaign = {}) {
  return {
    id: campaign.id,
    title: campaign.title,
    status: campaign.status,
    progress: campaign.progress,
    currentConstraint: campaign.currentConstraint,
    missionCount: campaign.missionCount,
    workItemCount: campaign.workItemCount,
    districtBuildingEvidence: campaign.districtBuildingEvidence,
    resolvedPortfolioCount: campaign.resolvedPortfolioCount,
    estimatedMissionsRemaining: campaign.estimatedMissionsRemaining,
    sizingStrategy: campaign.sizingStrategy,
  };
}

function compactProjectedMission(mission = {}) {
  return {
    id: mission.id,
    title: mission.title,
    programLabel: mission.programLabel,
    currentConstraint: mission.currentConstraint,
    expectedImpact: mission.expectedImpact,
    estimatedEffort: mission.estimatedEffort,
    missionSize: mission.missionSize,
    missionClass: mission.missionClass,
    workItems: mission.workItems ? { count: mission.workItems.count } : undefined,
    componentStatuses: mission.componentStatuses,
    executionPacket: mission.executionPacket ? { available: true } : undefined,
  };
}

function compactInitiative(initiative = {}) {
  return {
    id: initiative.id,
    title: initiative.title,
    status: initiative.status,
    currentStage: initiative.currentStage,
    currentConstraint: initiative.currentConstraint,
    objective: initiative.objective,
    nextMissionId: initiative.nextMissionId,
    missions: (initiative.missions || []).slice(0, 1).map(compactProjectedMission),
  };
}

function compactProgram(program = {}) {
  return {
    id: program.id,
    label: program.label,
    status: program.status,
    progress: program.progress,
    currentConstraint: program.currentConstraint,
    nextMissionId: program.nextMissionId,
    nextInitiativeId: program.nextInitiativeId,
    campaigns: (program.campaigns || []).slice(0, 1).map(compactCampaign),
    initiatives: (program.initiatives || []).slice(0, 8).map(compactInitiative),
  };
}

function compactProjectedMarket(market = {}) {
  return {
    id: market.id,
    label: market.label,
    regionId: market.regionId,
    regionName: market.regionName,
    status: market.status,
    overallEditorialHealth: market.overallEditorialHealth,
    knowledgeReadiness: market.knowledgeReadiness,
    experienceReadiness: market.experienceReadiness,
    programs: (market.programs || []).slice(0, 8).map(compactProgram),
    nextMissions: (market.nextMissions || []).slice(0, 3).map(compactProjectedMission),
  };
}

function firstItemsPerMetro(items = [], count = 8) {
  const groupedCounts = new Map();
  return items.filter((item) => {
    const metroId = item.metroId || item.marketId || "unknown";
    const current = groupedCounts.get(metroId) || 0;
    if (current >= count) return false;
    groupedCounts.set(metroId, current + 1);
    return true;
  });
}

function buildEosAdminRuntimeSnapshot(eos) {
  const portfolioQueues = eos.portfolioQueues || {};
  return {
    ...eos,
    commercialKnowledgeIntelligence: compactCommercialKnowledgeIntelligence(eos.commercialKnowledgeIntelligence),
    marketProjection: eos.marketProjection ? {
      ...eos.marketProjection,
      markets: (eos.marketProjection.markets || []).map(compactProjectedMarket),
    } : eos.marketProjection,
    portfolioQueues: eos.portfolioQueues ? {
      ...portfolioQueues,
      queueCounts: {
        editorialQueue: (portfolioQueues.editorialQueue || []).length,
        missionQueue: (portfolioQueues.missionQueue || []).length,
        expansionQueue: (portfolioQueues.expansionQueue || []).length,
        fieldModeQueue: (portfolioQueues.fieldModeQueue || []).length,
        reviewQueue: (portfolioQueues.reviewQueue || []).length,
      },
      missionQueue: (portfolioQueues.missionQueue || []).map(compactQueueItem),
      editorialQueue: (portfolioQueues.editorialQueue || []).slice(0, 100).map(compactQueueItem),
      expansionQueue: (portfolioQueues.expansionQueue || []).map(compactQueueItem),
      fieldModeQueue: (portfolioQueues.fieldModeQueue || []).map(compactQueueItem),
      reviewQueue: (portfolioQueues.reviewQueue || []).map(compactQueueItem),
    } : eos.portfolioQueues,
    workQueue: firstItemsPerMetro(eos.workQueue || [], 8).map(compactQueueItem),
  };
}

module.exports = {
  buildEosAdminRuntimeSnapshot,
};
