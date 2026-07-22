import {
  archiveActiveHero,
  clean,
  defaultAltText,
  defaultCaption,
  ensureFieldPhotosTable,
  findSubject,
  getPhotoBucket,
  getPhotoDb,
  jsonResponse,
  photoAssetUrl,
  photographerFor,
  safePhotoRow,
  storageKeyFor,
  validateImageType,
  validateStatus,
  validateUploadedFile,
} from "./_shared.js";

function extensionFor(mimeType) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpg";
  return "webp";
}

export async function onRequestPost({ request, env }) {
  const db = getPhotoDb(env);
  const bucket = getPhotoBucket(env);
  if (!db) return jsonResponse({ ok: false, error: "Photo D1 binding is not configured" }, 500);
  if (!bucket) return jsonResponse({ ok: false, error: "ROFO_PHOTOS R2 binding is not configured" }, 500);

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 3_000_000) {
    return jsonResponse({ ok: false, error: "Optimized upload is too large." }, 413);
  }

  const formData = await request.formData();
  const token = clean(formData.get("token"), 240);
  if (!env.ADMIN_DASHBOARD_TOKEN || token !== env.ADMIN_DASHBOARD_TOKEN) {
    return jsonResponse({ ok: false, error: "Forbidden" }, 403);
  }

  const subjectType = clean(formData.get("subjectType"), 40);
  const subjectId = clean(formData.get("subjectId"), 240);
  const subject = findSubject(subjectType, subjectId);
  if (!subject) return jsonResponse({ ok: false, error: "Select a valid city, district, or building." }, 400);

  const imageType = validateImageType(subjectType, clean(formData.get("imageType"), 80));
  if (!imageType) return jsonResponse({ ok: false, error: "Select a valid image type." }, 400);

  const requestedStatus = validateStatus(clean(formData.get("status"), 40)) || "published";
  if (requestedStatus === "archived") return jsonResponse({ ok: false, error: "New uploads can be saved as draft or published." }, 400);

  const publicImage = formData.get("publicImage");
  const thumbnailImage = formData.get("thumbnailImage");
  const publicError = validateUploadedFile(publicImage);
  if (publicError) return jsonResponse({ ok: false, error: publicError }, 400);
  const thumbnailError = validateUploadedFile(thumbnailImage, { thumbnail: true });
  if (thumbnailError) return jsonResponse({ ok: false, error: thumbnailError }, 400);

  const width = Math.max(1, Math.floor(Number(formData.get("width")) || 0));
  const height = Math.max(1, Math.floor(Number(formData.get("height")) || 0));
  if (!width || !height) return jsonResponse({ ok: false, error: "Optimized image dimensions are required." }, 400);

  await ensureFieldPhotosTable(db);

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const extension = extensionFor(publicImage.type);
  const thumbnailExtension = extensionFor(thumbnailImage.type);
  const storageKey = storageKeyFor({ id, subjectType, subjectId, variant: "public", extension });
  const thumbnailStorageKey = storageKeyFor({ id, subjectType, subjectId, variant: "thumb", extension: thumbnailExtension });
  const publicUrl = photoAssetUrl(id, "public");
  const thumbnailUrl = photoAssetUrl(id, "thumbnail");
  const caption = clean(formData.get("caption"), 500) || defaultCaption(subject, imageType);
  const altText = clean(formData.get("altText"), 500) || defaultAltText(subject, imageType);
  const photographer = photographerFor(env);
  const createdBy = clean(formData.get("createdBy"), 120) || photographer;
  const publishedAt = requestedStatus === "published" ? now : "";

  try {
    await bucket.put(storageKey, await publicImage.arrayBuffer(), {
      httpMetadata: { contentType: publicImage.type, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { sourceType: "rofo_original", rightsStatus: "owned" },
    });
    await bucket.put(thumbnailStorageKey, await thumbnailImage.arrayBuffer(), {
      httpMetadata: { contentType: thumbnailImage.type, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { sourceType: "rofo_original", rightsStatus: "owned" },
    });

    await db.prepare(`
      insert into field_photos (
        id, subject_type, subject_id, subject_name, market_id,
        image_role, image_type, status, public_url, thumbnail_url,
        storage_key, thumbnail_storage_key, width, height, file_size, mime_type,
        caption, alt_text, source_type, rights_status, photographer, attribution,
        captured_at, uploaded_at, published_at, created_by, updated_at
      ) values (?, ?, ?, ?, ?, 'hero', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'rofo_original', 'owned', ?, 'Photo © Rofo', ?, ?, ?, ?, ?)
    `).bind(
      id,
      subjectType,
      subjectId,
      subject.name,
      subject.marketId || "",
      imageType,
      requestedStatus,
      publicUrl,
      thumbnailUrl,
      storageKey,
      thumbnailStorageKey,
      width,
      height,
      Number(publicImage.size || 0),
      publicImage.type,
      caption,
      altText,
      photographer,
      clean(formData.get("capturedAt"), 80),
      now,
      publishedAt,
      createdBy,
      now,
    ).run();

    if (requestedStatus === "published") {
      await archiveActiveHero(db, { subjectType, subjectId, replacementId: id, now });
    }

    const row = await db.prepare("select * from field_photos where id = ?").bind(id).first();
    return jsonResponse({ ok: true, photo: safePhotoRow(row) });
  } catch (error) {
    try {
      await bucket.delete(storageKey);
      await bucket.delete(thumbnailStorageKey);
    } catch (cleanupError) {
      console.warn("Unable to clean up failed Field Photo upload", cleanupError);
    }
    return jsonResponse({ ok: false, error: "Photo upload could not be completed." }, 500);
  }
}
