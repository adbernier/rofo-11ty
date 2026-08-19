export const REQUIREMENT_INPUT_RENDERER_VERSION = "requirement-input-renderer:v1.0";

export function inputControlSpec(answerType = "") {
  switch (answerType) {
    case "market_select": return Object.freeze({ kind: "market_search", element: "input", inputType: "text", inputMode: "text", rows: null });
    case "number": return Object.freeze({ kind: "numeric", element: "input", inputType: "number", inputMode: "decimal", rows: null });
    case "number_or_text": return Object.freeze({ kind: "numeric_text", element: "input", inputType: "text", inputMode: "numeric", rows: null });
    case "short_text": return Object.freeze({ kind: "short_text", element: "textarea", inputType: null, inputMode: null, rows: 4 });
    case "final_text": return Object.freeze({ kind: "final_text", element: "textarea", inputType: null, inputMode: null, rows: 4 });
    default: return null;
  }
}

export function canonicalMarketSuggestions(markets = [], query = "", limit = 8) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (normalizedQuery.length < 2) return [];
  const suggestions = [];
  markets.forEach((market) => {
    const base = { geographyId: market.marketId, marketId: market.marketId, marketName: market.marketName, state: market.state };
    suggestions.push({ ...base, city: "", displayName: `${market.marketName}, ${market.state}`, label: market.marketName, meta: `${market.state} · Market` });
    (market.cities || []).filter((city) => city !== market.marketName).forEach((city) => suggestions.push({ ...base, city, displayName: `${city}, ${market.state}`, label: city, meta: `${market.state} · ${market.marketName} market` }));
  });
  return suggestions
    .filter((item) => `${item.displayName} ${item.marketName}`.toLowerCase().includes(normalizedQuery))
    .sort((a, b) => Number(!a.label.toLowerCase().startsWith(normalizedQuery)) - Number(!b.label.toLowerCase().startsWith(normalizedQuery)) || Number(Boolean(a.city)) - Number(Boolean(b.city)) || a.label.localeCompare(b.label))
    .slice(0, limit);
}
