import {
  ensureFieldPhotosTable,
  getPhotoDb,
  jsonResponse,
  requireAdmin,
  safePhotoRow,
} from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const admin = requireAdmin(request, env);
  if (!admin.ok) return admin.response;

  const db = getPhotoDb(env);
  if (!db) return jsonResponse({ ok: false, error: "Photo D1 binding is not configured" }, 500);
  await ensureFieldPhotosTable(db);

  const result = await db.prepare(`
    select *
    from field_photos
    order by uploaded_at desc
    limit 40
  `).all();

  const coverage = await db.prepare(`
    select subject_type, count(distinct subject_id) as count
    from field_photos
    where status = 'published'
    group by subject_type
  `).all();

  return jsonResponse({
    ok: true,
    photos: (result.results || []).map(safePhotoRow),
    coverage: (coverage.results || []).reduce((summary, row) => {
      summary[row.subject_type] = Number(row.count || 0);
      return summary;
    }, { city: 0, district: 0, building: 0 }),
  });
}
