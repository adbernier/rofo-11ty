function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function routeFrom(value) {
  const raw = clean(value);
  if (!raw) return "";
  try {
    const url = new URL(raw, "https://www.rofo.com");
    return url.origin === "https://www.rofo.com" ? url.pathname : "";
  } catch {
    return raw.startsWith("/") ? raw.split(/[?#]/, 1)[0] : "";
  }
}

export function normalizeAcquisition(input = {}) {
  const value = input && typeof input === "object" ? input : {};
  const acquisition = {
    journeyId: clean(value.journeyId || value.sessionId || value.session_id, 160),
    sourceType: clean(value.sourceType || value.source || value.sourceClassification, 120),
    sourcePath: routeFrom(value.sourcePath || value.source_path),
    referrer: clean(value.referrer, 1000),
    landingPage: clean(value.landingPage || value.landing_page, 1000),
    capturedAt: clean(value.capturedAt || value.captured_at, 80),
  };
  return Object.values(acquisition).some(Boolean) ? acquisition : null;
}

export function acquisitionChannel(acquisition) {
  const value = normalizeAcquisition(acquisition);
  if (!value) return "Unknown";
  const referrer = value.referrer.toLowerCase();
  if (referrer === "direct") return "Direct";
  if (referrer) {
    try {
      const hostname = new URL(value.referrer).hostname.replace(/^www\./, "");
      if (hostname === "google.com" || hostname.endsWith(".google.com")) return "Google";
      if (hostname === "bing.com" || hostname.endsWith(".bing.com")) return "Bing";
      return hostname || "Unknown";
    } catch {
      return "Unknown";
    }
  }
  if (value.sourceType === "homepage" && routeFrom(value.sourcePath || value.landingPage) === "/") return "Direct";
  return "Unknown";
}

function title(value) {
  return clean(value, 120).split("-").filter(Boolean).map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

export function acquisitionPageLabel(acquisition) {
  const value = normalizeAcquisition(acquisition);
  if (!value) return "";
  const route = routeFrom(value.sourcePath || value.landingPage);
  if (!route) return "";
  if (route === "/") return "Homepage";
  const match = route.match(/^\/commercial-real-estate\/[^/]+\/([^/]+)\/(?:([^/]+)\/)?$/i);
  if (match) {
    const city = title(match[1]);
    const page = clean(match[2]).toLowerCase();
    const property = page.match(/^(.+)-space(?:-guide)?$/)?.[1];
    return property ? `${city} ${title(property)} page` : `${city} city page`;
  }
  return route;
}

export function acquisitionPresentation(acquisition) {
  const value = normalizeAcquisition(acquisition);
  if (!value) return { line: "Source: Unknown", channel: "Unknown", pageLabel: "", acquisition: null };
  const channel = acquisitionChannel(value);
  const pageLabel = acquisitionPageLabel(value);
  return { line: `Source: ${channel}${pageLabel ? ` → ${pageLabel}` : ""}`, channel, pageLabel, acquisition: value };
}

export const __test = { routeFrom };
