import {
  approveLead,
  escapeHtml,
  getLead,
  htmlResponse,
  verifyLeadToken,
} from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const token = url.searchParams.get("token");
  const routeParam = url.searchParams.get("route") || "recommended";

  if (!id || !token) {
    return htmlResponse("<h1>Missing approval link fields</h1>", 400);
  }

  try {
    const record = await getLead(env, id);
    if (!record || !(await verifyLeadToken(record, token))) {
      return htmlResponse("<h1>Invalid or expired approval link</h1>", 403);
    }

    const result = await approveLead(env, id, routeParam);

    return htmlResponse(
      `<h1>${escapeHtml(result.title)}</h1><p>${escapeHtml(result.message)}</p>${result.failures && result.failures.length ? `<p>Some routing failed: ${escapeHtml(result.failures.join(" "))}</p>` : ""}`,
      result.status
    );
  } catch (error) {
    return htmlResponse(`<h1>Approval failed</h1><p>${escapeHtml(error.message)}</p>`, 500);
  }
}
