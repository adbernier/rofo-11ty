import {
  clean,
  ensureFieldPhotosTable,
  getPhotoBucket,
  getPhotoById,
  getPhotoDb,
  jsonResponse,
} from "../_shared.js";

export async function onRequestGet({ request, env, params }) {
  const db = getPhotoDb(env);
  const bucket = getPhotoBucket(env);
  if (!db || !bucket) return jsonResponse({ ok: false, error: "Photo storage is not configured" }, 404);

  const id = clean(params.id, 120);
  const url = new URL(request.url);
  const variant = clean(url.searchParams.get("variant"), 40) === "thumbnail" ? "thumbnail" : "public";

  try {
    await ensureFieldPhotosTable(db);
    const row = await getPhotoById(db, id);
    if (!row || row.status === "archived") return jsonResponse({ ok: false, error: "Photo not found" }, 404);
    const key = variant === "thumbnail" ? row.thumbnail_storage_key : row.storage_key;
    const object = await bucket.get(key);
    if (!object) return jsonResponse({ ok: false, error: "Photo asset not found" }, 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", row.status === "published"
      ? "public, max-age=86400"
      : "private, max-age=60");
    headers.set("x-content-type-options", "nosniff");
    return new Response(object.body, { headers });
  } catch (error) {
    return jsonResponse({ ok: false, error: "Photo asset unavailable" }, 500);
  }
}
