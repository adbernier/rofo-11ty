const cities = require("../../_data/cities.generated.json");

function normalizeState(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeMarketSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const statesBySlug = new Map();
(cities || []).forEach((city) => {
  const slug = normalizeMarketSlug(city.slug || city.city);
  const state = normalizeState(city.state_abbr || city.state);
  if (!slug || !state) return;
  if (!statesBySlug.has(slug)) statesBySlug.set(slug, new Set());
  statesBySlug.get(slug).add(state);
});

function marketKey(state, marketSlug) {
  const normalizedState = normalizeState(state);
  const normalizedSlug = normalizeMarketSlug(marketSlug);
  if (!normalizedState || !normalizedSlug) return "";
  return `${normalizedState}:${normalizedSlug}`;
}

function hasCrossStateCollision(marketSlug) {
  const states = statesBySlug.get(normalizeMarketSlug(marketSlug));
  return Boolean(states && states.size > 1);
}

function searchMarketIdentity({ state, marketId, marketSlug, marketName } = {}) {
  const legacyMarketId = normalizeMarketSlug(marketSlug || marketId || marketName);
  const normalizedState = normalizeState(state);
  const canonicalKey = marketKey(normalizedState, legacyMarketId);
  return {
    marketKey: canonicalKey,
    marketId: hasCrossStateCollision(legacyMarketId) && canonicalKey ? canonicalKey : legacyMarketId,
    legacyMarketId,
    state: normalizedState,
    geographicallyQualified: hasCrossStateCollision(legacyMarketId),
  };
}

module.exports = {
  normalizeState,
  normalizeMarketSlug,
  marketKey,
  hasCrossStateCollision,
  searchMarketIdentity,
};
