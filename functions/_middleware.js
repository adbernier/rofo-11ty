const STATE_ABBREVIATIONS = new Set([
  "al",
  "ak",
  "az",
  "ar",
  "ca",
  "co",
  "ct",
  "de",
  "fl",
  "ga",
  "hi",
  "id",
  "il",
  "in",
  "ia",
  "ks",
  "ky",
  "la",
  "me",
  "md",
  "ma",
  "mi",
  "mn",
  "ms",
  "mo",
  "mt",
  "ne",
  "nv",
  "nh",
  "nj",
  "nm",
  "ny",
  "nc",
  "nd",
  "oh",
  "ok",
  "or",
  "pa",
  "ri",
  "sc",
  "sd",
  "tn",
  "tx",
  "ut",
  "vt",
  "va",
  "wa",
  "wv",
  "wi",
  "wy",
  "dc",
]);

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const parts = url.pathname.split("/");
  const stateSegment = parts[2] || "";

  if (
    parts[1] === "commercial-real-estate" &&
    STATE_ABBREVIATIONS.has(stateSegment) &&
    stateSegment === stateSegment.toLowerCase()
  ) {
    parts[2] = stateSegment.toUpperCase();
    url.pathname = parts.join("/");

    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
