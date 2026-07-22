import {
  archiveActiveHero,
  clean,
  ensureFieldPhotosTable,
  findSubject,
  getPhotoById,
  getPhotoDb,
  jsonResponse,
  requireAdmin,
  safePhotoRow,
  validateStatus,
} from "./_shared.js";

export async function onRequestPost({ request, env }) {
  const admin = requireAdmin(request, env);
  if (!admin.ok) return admin.response;

  const db = getPhotoDb(env);
  if (!db) return jsonResponse({ ok: false, error: "Photo D1 binding is not configured" }, 500);
  await ensureFieldPhotosTable(db);

  const input = await request.json().catch(() => ({}));
  const id = clean(input.id, 120);
  const action = clean(input.action, 40);
  const row = await getPhotoById(db, id);
  if (!row) return jsonResponse({ ok: false, error: "Photo not found" }, 404);

  const now = new Date().toISOString();
  if (action === "update") {
    const caption = clean(input.caption, 500);
    const altText = clean(input.altText, 500);
    if (!caption || !altText) return jsonResponse({ ok: false, error: "Caption and alt text are required." }, 400);
    await db.prepare(`
      update field_photos
      set caption = ?,
          alt_text = ?,
          updated_at = ?
      where id = ?
    `).bind(caption, altText, now, id).run();
  } else if (action === "publish") {
    const subject = findSubject(row.subject_type, row.subject_id);
    if (!subject) return jsonResponse({ ok: false, error: "Photo subject is no longer valid." }, 400);
    await db.prepare(`
      update field_photos
      set status = 'published',
          published_at = coalesce(published_at, ?),
          archived_at = null,
          superseded_by = null,
          updated_at = ?
      where id = ?
    `).bind(now, now, id).run();
    await archiveActiveHero(db, {
      subjectType: row.subject_type,
      subjectId: row.subject_id,
      replacementId: id,
      now,
    });
  } else if (action === "archive") {
    await db.prepare(`
      update field_photos
      set status = 'archived',
          archived_at = coalesce(archived_at, ?),
          updated_at = ?
      where id = ?
    `).bind(now, now, id).run();
  } else {
    const status = validateStatus(action);
    if (!status) return jsonResponse({ ok: false, error: "Unsupported photo action." }, 400);
  }

  const updated = await getPhotoById(db, id);
  return jsonResponse({ ok: true, photo: safePhotoRow(updated) });
}
