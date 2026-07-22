import { jsonResponse, requireAdmin, searchSubjects } from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const admin = requireAdmin(request, env);
  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const subjectType = url.searchParams.get("subjectType") || "";
  const query = url.searchParams.get("q") || "";
  const limit = url.searchParams.get("limit") || "20";

  return jsonResponse({
    ok: true,
    subjects: searchSubjects({ subjectType, query, limit }),
  });
}
