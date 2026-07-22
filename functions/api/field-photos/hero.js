import {
  clean,
  ensureFieldPhotosTable,
  findSubject,
  getPhotoDb,
  jsonResponse,
  publicHeroPhoto,
} from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const subjectType = clean(url.searchParams.get("subjectType"), 40);
  const subjectId = clean(url.searchParams.get("subjectId"), 240);
  const subject = findSubject(subjectType, subjectId);
  if (!subject) {
    return jsonResponse({ ok: false, photo: null, error: "Invalid subject" }, 404, {
      "cache-control": "public, max-age=60",
    });
  }

  const db = getPhotoDb(env);
  if (!db) {
    return jsonResponse({ ok: true, photo: null }, 200, {
      "cache-control": "public, max-age=60",
    });
  }

  try {
    await ensureFieldPhotosTable(db);
    const row = await db.prepare(`
      select *
      from field_photos
      where subject_type = ?
        and subject_id = ?
        and image_role = 'hero'
        and status = 'published'
      order by published_at desc, uploaded_at desc
      limit 1
    `).bind(subjectType, subjectId).first();

    return jsonResponse({ ok: true, photo: publicHeroPhoto(row) }, 200, {
      "cache-control": "public, max-age=120",
    });
  } catch (error) {
    return jsonResponse({ ok: true, photo: null }, 200, {
      "cache-control": "public, max-age=30",
    });
  }
}
