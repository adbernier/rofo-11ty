import {
  escapeHtml,
  getLead,
  htmlResponse,
  updateLeadStatus,
  verifyLeadToken,
} from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const token = url.searchParams.get("token");

  if (!id || !token) {
    return htmlResponse("<h1>Missing rejection link fields</h1>", 400);
  }

  try {
    const record = await getLead(env, id);
    if (!record || !(await verifyLeadToken(record, token))) {
      return htmlResponse("<h1>Invalid or expired rejection link</h1>", 403);
    }

    if (["approved_sent", "broker_sent", "both_sent", "partial_sent"].includes(record.status)) {
      return htmlResponse("<h1>Lead already approved and sent</h1><p>It was not rejected.</p>", 409);
    }

    if (record.status === "rejected") {
      return htmlResponse("<h1>Lead already rejected</h1>");
    }

    await updateLeadStatus(env, id, {
      status: "rejected",
      rejected_at: new Date().toISOString(),
    });

    return htmlResponse("<h1>Lead rejected</h1><p>No OfficeFinder submission was made.</p>");
  } catch (error) {
    return htmlResponse(`<h1>Rejection failed</h1><p>${escapeHtml(error.message)}</p>`, 500);
  }
}
